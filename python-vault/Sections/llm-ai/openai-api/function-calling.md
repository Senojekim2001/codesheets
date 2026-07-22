---
type: "entry"
domain: "python"
file: "llm-ai"
section: "openai-api"
id: "function-calling"
title: "Function Calling & Tool Use — Agentic LLMs"
category: "LLM APIs"
subtitle: "tools, function_call, tool_choice, parallel tool calls, agentic loop"
signature_short: "tools=[{\"type\": \"function\", \"function\": {...}}]  |  tool_calls  |  tool_choice"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Function Calling & Tool Use — Agentic LLMs"
  - "function-calling"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/openai-api"
  - "category/llm-apis"
  - "tier/tiered"
---

# Function Calling & Tool Use — Agentic LLMs

> tools, function_call, tool_choice, parallel tool calls, agentic loop

## Overview

Function calling lets the LLM decide when and how to call your functions. Define tools with JSON schemas, and the model returns structured tool_call objects with arguments. Your code executes the function and returns results. This enables agents that can search the web, query databases, call APIs, run code, and take actions. Parallel tool calls let the model invoke multiple functions simultaneously. The agentic loop pattern repeats until the model responds without tool calls.

## Signature

```python
tools=[{"type": "function", "function": {...}}]  |  tool_calls  |  tool_choice
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Define a tool with a JSON schema; the model returns tool_calls; you execute and feed results back.
# STRENGTHS - Lets the LLM act on the world (search, calculate, fetch); structured args replace fragile parsing.
# WEAKNESSES- Tool args are LLM-generated -- always validate before executing anything destructive.
import json
from openai import OpenAI

client = OpenAI()

tools = [{
    "type": "function",
    "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {
            "type": "object",
            "properties": {
                "city": {"type": "string"},
                "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
            },
            "required": ["city"],
        },
    },
}]

def get_weather(city: str, unit: str = "celsius") -> dict:
    return {"city": city, "temp": 22, "unit": unit, "cond": "sunny"}

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools,
)
call = resp.choices[0].message.tool_calls[0]
args = json.loads(call.function.arguments)
print(get_weather(**args))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Agent loop: call -> execute tools -> append tool messages -> repeat until no tool_calls.
# STRENGTHS - One pattern handles N tool steps; parallel tool_calls handled by iterating message.tool_calls.
# WEAKNESSES- Loop must have a max-iteration guard; LLMs can otherwise spin forever calling the same tool.
import json
from openai import OpenAI

client = OpenAI()

TOOLS = [
    {"type": "function", "function": {
        "name": "search_db",
        "description": "Search products by keyword",
        "parameters": {"type": "object",
                       "properties": {"q": {"type": "string"},
                                      "limit": {"type": "integer", "default": 5}},
                       "required": ["q"]}}},
    {"type": "function", "function": {
        "name": "get_weather",
        "description": "Get current weather for a city",
        "parameters": {"type": "object",
                       "properties": {"city": {"type": "string"}},
                       "required": ["city"]}}},
]

def search_db(q: str, limit: int = 5) -> list[dict]:
    return [{"name": f"product-{q}-{i}", "price": 9.99 + i} for i in range(limit)]
def get_weather(city: str) -> dict:
    return {"city": city, "temp": 22}

TOOL_MAP = {"search_db": search_db, "get_weather": get_weather}

def run_agent(user_msg: str, *, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": user_msg}]
    for step in range(max_steps):
        resp = client.chat.completions.create(
            model="gpt-4o-mini", messages=messages, tools=TOOLS, tool_choice="auto",
        )
        msg = resp.choices[0].message
        messages.append(msg)                            # agent message + tool_calls
        if not msg.tool_calls:
            return msg.content                          # done
        for tc in msg.tool_calls:
            fn = TOOL_MAP.get(tc.function.name)
            if fn is None:
                result = {"error": f"unknown tool: {tc.function.name}"}
            else:
                try:
                    args = json.loads(tc.function.arguments)
                    result = fn(**args)
                except Exception as e:
                    result = {"error": str(e)}
            messages.append({"role": "tool",
                             "tool_call_id": tc.id,
                             "content": json.dumps(result)})
    return "max steps reached"

print(run_agent("Find me 3 umbrellas, and what's the weather in Tokyo?"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Tool registry with Pydantic schemas, execution sandbox, side-effect classification, audit log; abort on dangerous tool with low confidence.
# STRENGTHS - Each tool declares its risk class; destructive tools require an explicit confirmation step or human-in-the-loop; full audit trail.
# WEAKNESSES- Every tool needs a schema and a human-review flag; up-front cost, but pays back the first time a customer says "the agent deleted my data".
from __future__ import annotations
import json
import logging
import time
import uuid
from collections.abc import Callable
from dataclasses import dataclass, field
from enum import Enum
from openai import OpenAI
from pydantic import BaseModel, ValidationError

log = logging.getLogger("agent")
client = OpenAI()

class Risk(str, Enum):
    SAFE      = "safe"        # read-only, deterministic
    NETWORK   = "network"     # external calls, idempotent
    MUTATING  = "mutating"    # writes; needs HITL for production
    DESTRUCTIVE = "destructive"  # delete/drop -- always HITL

@dataclass
class Tool:
    name: str
    desc: str
    args_model: type[BaseModel]
    fn: Callable[..., object]
    risk: Risk = Risk.SAFE

    def schema(self) -> dict:
        return {"type": "function",
                "function": {"name": self.name, "description": self.desc,
                             "parameters": self.args_model.model_json_schema()}}

    def call(self, raw_args: str) -> dict:
        try:
            args = self.args_model.model_validate_json(raw_args)
        except ValidationError as e:
            return {"error": "invalid args", "details": e.errors()}
        try:
            return {"ok": True, "result": self.fn(**args.model_dump())}
        except Exception as e:                          # never let a tool kill the loop
            log.exception("tool %s failed", self.name)
            return {"ok": False, "error": str(e)}

# --- example tools ---------------------------------------------------------
class SearchArgs(BaseModel):
    q: str; limit: int = 5
def _search(q: str, limit: int = 5) -> list[dict]:
    return [{"name": f"{q}-{i}"} for i in range(limit)]

class DeleteArgs(BaseModel):
    table: str; where: str
def _delete(table: str, where: str) -> dict:
    return {"deleted_count": 0}                          # would actually delete

REGISTRY: dict[str, Tool] = {
    "search":      Tool("search", "Search the catalog", SearchArgs, _search, Risk.SAFE),
    "delete_rows": Tool("delete_rows", "Delete rows from a table", DeleteArgs, _delete, Risk.DESTRUCTIVE),
}

@dataclass
class AgentRun:
    id: str
    steps: list[dict] = field(default_factory=list)
    spend_usd: float = 0.0
    started_at: float = field(default_factory=time.time)

def run_agent(user_msg: str, *, model: str = "gpt-4o-mini",
              max_steps: int = 12,
              allow_risk: Risk = Risk.NETWORK) -> tuple[str, AgentRun]:
    run = AgentRun(id=uuid.uuid4().hex[:8])
    messages: list[dict] = [{"role": "user", "content": user_msg}]
    tools = [t.schema() for t in REGISTRY.values()]

    for step in range(max_steps):
        resp = client.chat.completions.create(model=model, messages=messages,
                                              tools=tools, tool_choice="auto",
                                              temperature=0)
        msg = resp.choices[0].message
        messages.append(msg)
        run.spend_usd += _cost(model, resp.usage)
        if not msg.tool_calls:
            return msg.content or "", run

        for tc in msg.tool_calls:
            tool = REGISTRY.get(tc.function.name)
            if tool is None:
                result = {"error": f"unknown tool {tc.function.name}"}
            elif _risk_rank(tool.risk) > _risk_rank(allow_risk):
                # Human-in-the-loop: refuse and tell the model.
                result = {"error": f"tool {tool.name} requires HITL (risk={tool.risk})"}
            else:
                result = tool.call(tc.function.arguments)
            run.steps.append({"step": step, "tool": tc.function.name,
                              "args": tc.function.arguments, "result": result})
            messages.append({"role": "tool",
                             "tool_call_id": tc.id,
                             "content": json.dumps(result)[:8000]})  # cap context bloat

    return "max steps reached", run

def _risk_rank(r: Risk) -> int:
    return {Risk.SAFE: 0, Risk.NETWORK: 1, Risk.MUTATING: 2, Risk.DESTRUCTIVE: 3}[r]

def _cost(model: str, usage) -> float:
    rate = {"gpt-4o-mini": (0.15e-6, 0.60e-6)}.get(model, (0, 0))
    return usage.prompt_tokens * rate[0] + usage.completion_tokens * rate[1]

# Decision rule:
#   ad-hoc tools, no risk classes              -> simple while-loop pattern
#   production agents with side effects        -> tool registry + Pydantic args + risk class
#   destructive operations                     -> HITL gate (REFUSE in agent, surface to UI)
#   parallel tool calls                        -> just iterate msg.tool_calls; SDK gives them all
#   force a specific tool                      -> tool_choice={"type":"function","function":{"name":"X"}}
#   force NO tools                             -> tool_choice="none"
#   multi-step planning required                -> consider Assistants API or LangGraph; bare loop is fine for <8 steps
#   audit / replay                             -> log every step + tool call + result; the AgentRun above
#
# Anti-pattern: 'eval(tool_call.function.arguments)' or feeding tool args
# straight to a SQL string. The arguments come from a stochastic system; treat
# them like user input. Pydantic validation, allow-listed tables/columns, and
# parameterized queries are not optional.
```

## Decision Rule

```text
ad-hoc tools, no risk classes              -> simple while-loop pattern
production agents with side effects        -> tool registry + Pydantic args + risk class
destructive operations                     -> HITL gate (REFUSE in agent, surface to UI)
parallel tool calls                        -> just iterate msg.tool_calls; SDK gives them all
force a specific tool                      -> tool_choice={"type":"function","function":{"name":"X"}}
force NO tools                             -> tool_choice="none"
multi-step planning required                -> consider Assistants API or LangGraph; bare loop is fine for <8 steps
audit / replay                             -> log every step + tool call + result; the AgentRun above
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'eval(tool_call.function.arguments)' or feeding tool args
> straight to a SQL string. The arguments come from a stochastic system; treat
> them like user input. Pydantic validation, allow-listed tables/columns, and
> parameterized queries are not optional.

## Tips

- The agentic while-loop pattern (call → execute tools → feed results back) is the foundation of all AI agents.
- Use tool_choice="required" to force the model to call a tool, "none" to prevent it, or {"type": "function", "function": {"name": "..."}} to force a specific tool.
- GPT-4o supports parallel tool calls — it can call get_weather AND search_database in a single response.
- Always validate tool arguments before execution — the model can hallucinate invalid parameters.

## Common Mistake

> [!warning] Treating tool arguments as trusted input — they come from a stochastic system; eval()-ing them or interpolating them into SQL is a vulnerability. Validate with Pydantic, allow-list table/column names, and use parameterized queries. Destructive tools (delete/drop) need a risk class and human-in-the-loop gate, not just retries. Also: always append results as a "tool" role message with the matching tool_call_id, or the model can't see them.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Manual tool handling
response = client.chat.completions.create(
    model="gpt-4o", messages=messages, tools=tools
)
for tool_call in response.choices[0].message.tool_calls:
    result = my_tools[tool_call.function.name](...)
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(result)
    })
```

**Senior:**
```python
# Agent loop pattern
while True:
    response = client.chat.completions.create(
        model="gpt-4o", messages=messages, tools=tools
    )
    if not response.choices[0].message.tool_calls:
        break
```

## See Also

- [[Sections/llm-ai/openai-api/chat-completions|OpenAI Chat Completions — GPT-4, Structured Output & Streaming (LLMs & AI Engineering)]]
- [[Sections/llm-ai/openai-api/_Index|LLMs & AI Engineering → OpenAI API & LLM Providers]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
