---
type: "entry"
domain: "python"
file: "llm-ai"
section: "rag-langchain"
id: "langchain-agents"
title: "LangChain — Chains, Agents & Production Patterns"
category: "LangChain"
subtitle: "ChatPromptTemplate, RunnableSequence, AgentExecutor, LCEL, LangSmith"
signature_short: "chain = prompt | llm | parser  |  AgentExecutor  |  RunnablePassthrough"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "LangChain — Chains, Agents & Production Patterns"
  - "langchain-agents"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/rag-langchain"
  - "category/langchain"
  - "tier/tiered"
---

# LangChain — Chains, Agents & Production Patterns

> ChatPromptTemplate, RunnableSequence, AgentExecutor, LCEL, LangSmith

## Overview

LangChain is the leading framework for building LLM applications. LCEL (LangChain Expression Language) composes chains with the pipe operator: prompt | llm | output_parser. Agents use LLMs to decide which tools to call. Memory systems maintain conversation state. LangSmith provides observability (tracing, evaluation, monitoring) for production. Key abstractions: ChatModels (LLM wrappers), PromptTemplates (dynamic prompts), OutputParsers (structured extraction), Retrievers (vector search), and Tools (agent capabilities).

## Signature

```python
chain = prompt | llm | parser  |  AgentExecutor  |  RunnablePassthrough
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - LCEL pipe: prompt | llm | parser; .invoke runs the chain.
# STRENGTHS - Reads top-to-bottom; chains compose; built-in streaming and async.
# WEAKNESSES- LangChain churns hard between versions; pin every package; expect drift across major bumps.
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a {role}. Be concise."),
    ("user",   "{question}"),
])

chain = prompt | llm | StrOutputParser()
print(chain.invoke({"role": "Python tutor",
                    "question": "What is a generator?"}))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - RAG via LCEL: retriever | format_docs | prompt | llm | parser; @tool decorator + create_tool_calling_agent.
# STRENGTHS - One DAG that's invokable, streamable, async, and traceable in LangSmith.
# WEAKNESSES- AgentExecutor's loop is opaque -- LangGraph or a hand-rolled loop is more inspectable when things go wrong.
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_chroma import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.tools import tool
from langchain.agents import AgentExecutor, create_tool_calling_agent

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

# 1) Build a retriever once.
docs = TextLoader("kb.md").load()
chunks = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=80).split_documents(docs)
vs = Chroma.from_documents(chunks, OpenAIEmbeddings(model="text-embedding-3-small"))
retriever = vs.as_retriever(search_kwargs={"k": 5})

# 2) RAG chain with citation-friendly format.
def fmt(docs) -> str:
    return "\n\n".join(f"[{i}] {d.page_content}" for i, d in enumerate(docs))

rag_prompt = ChatPromptTemplate.from_template(
    "Use ONLY the context. Cite as [n]. If unsure, say so.\n\n"
    "Context:\n{context}\n\nQuestion: {question}"
)
rag_chain = (
    {"context": retriever | fmt, "question": RunnablePassthrough()}
    | rag_prompt | llm | StrOutputParser()
)

# 3) Agent with two tools.
@tool
def search_docs(query: str) -> str:
    """Search the docs."""
    return fmt(retriever.invoke(query))

@tool
def add(a: float, b: float) -> float:
    """Add two numbers."""
    return a + b

agent_prompt = ChatPromptTemplate.from_messages([
    ("system", "You answer using tools. Cite docs."),
    ("placeholder", "{chat_history}"),
    ("user", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])
agent = create_tool_calling_agent(llm, [search_docs, add], agent_prompt)
executor = AgentExecutor(agent=agent, tools=[search_docs, add],
                         max_iterations=6, return_intermediate_steps=True)

print(rag_chain.invoke("How is auth configured?"))
print(executor.invoke({"input": "What's 7.5 + 12.25, and where is auth documented?"}))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - LangGraph for explicit state machines; LangSmith for tracing/eval; LCEL for pipelines; pin versions; treat agent state as a typed graph, not a black-box loop.
# STRENGTHS - Inspectable, branchable, resumable graphs; production-grade tracing; testable nodes; safer than AgentExecutor for non-trivial flows.
# WEAKNESSES- LangChain ecosystem moves fast -- pin every dep, monitor changelogs. Some teams swap to a thin wrapper over OpenAI + Pydantic for stability.
from __future__ import annotations
import os
from typing import Annotated, TypedDict
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.memory import MemorySaver

# 1) LangSmith tracing -- one env var; every chain/agent run is captured.
os.environ.setdefault("LANGCHAIN_TRACING_V2", "true")
# os.environ["LANGCHAIN_API_KEY"] = "..."   # set in your env, not in code

# 2) Typed agent state.
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    iterations: int

# 3) Tools.
@tool
def lookup_user(user_id: str) -> dict:
    """Fetch user profile by id."""
    return {"id": user_id, "plan": "pro"}

@tool
def cancel_subscription(user_id: str) -> dict:
    """DESTRUCTIVE: cancel a subscription. Confirm before calling."""
    return {"user_id": user_id, "status": "cancelled"}

LLM = ChatOpenAI(model="gpt-4o-mini", temperature=0)
TOOLS = [lookup_user, cancel_subscription]
LLM_WITH_TOOLS = LLM.bind_tools(TOOLS)
TOOL_BY_NAME = {t.name: t for t in TOOLS}

# 4) Nodes.
def call_model(state: AgentState) -> AgentState:
    response = LLM_WITH_TOOLS.invoke(state["messages"])
    return {"messages": [response], "iterations": state["iterations"] + 1}

def call_tools(state: AgentState) -> AgentState:
    last = state["messages"][-1]
    out: list[BaseMessage] = []
    for call in last.tool_calls:
        result = TOOL_BY_NAME[call["name"]].invoke(call["args"])
        out.append(AIMessage(content=str(result), tool_call_id=call["id"]))
    return {"messages": out, "iterations": state["iterations"]}

def should_continue(state: AgentState) -> str:
    if state["iterations"] >= 8:                       # hard cap
        return END
    last = state["messages"][-1]
    return "tools" if getattr(last, "tool_calls", None) else END

# 5) Compile the graph; checkpoints make runs resumable.
g = StateGraph(AgentState)
g.add_node("model", call_model)
g.add_node("tools", call_tools)
g.set_entry_point("model")
g.add_conditional_edges("model", should_continue, {"tools": "tools", END: END})
g.add_edge("tools", "model")
graph = g.compile(checkpointer=MemorySaver())

# 6) Run with a thread id -- enables history, replay, time-travel debugging.
config = {"configurable": {"thread_id": "user-42"}}
state: AgentState = {"messages": [SystemMessage(content="Be cautious with destructive tools."),
                                   HumanMessage(content="cancel subscription for u_99")],
                     "iterations": 0}
result = graph.invoke(state, config=config)
for m in result["messages"]:
    print(type(m).__name__, getattr(m, "content", None) or m.tool_calls)

# 7) Eval harness sketch -- LangSmith.evaluate over a dataset of golden runs.
# from langsmith.evaluation import evaluate
# evaluate(lambda x: graph.invoke({"messages":[HumanMessage(x['question'])], "iterations":0}, config),
#          data="my-eval-set", evaluators=["correctness", "tool_calls"])

# Decision rule:
#   single LLM call                            -> raw OpenAI SDK; skip LangChain entirely
#   linear pipeline (prompt -> llm -> parse)    -> LCEL chain
#   RAG                                        -> LCEL with retriever; rerank if quality matters
#   agent with tools, simple                    -> create_tool_calling_agent + AgentExecutor (toy/internal)
#   agent in production                         -> LangGraph: typed state, explicit edges, checkpoints
#   need observability                          -> LangSmith env vars + dashboard; ALWAYS in prod
#   need streaming                              -> chain.astream / graph.astream_events
#   long-running, resumable                     -> LangGraph + persistent checkpointer (Redis/Postgres)
#   want to leave LangChain                     -> wrap your own seam; LangGraph is more "framework", LCEL is "DAG"
#
# Anti-pattern: AgentExecutor with no max_iterations and no LangSmith trace.
# When the agent loops (it will), you can't see why and can't stop it cheaply.
# Set max_iterations, capture intermediate_steps, and turn tracing on.
```

## Decision Rule

```text
single LLM call                            -> raw OpenAI SDK; skip LangChain entirely
linear pipeline (prompt -> llm -> parse)    -> LCEL chain
RAG                                        -> LCEL with retriever; rerank if quality matters
agent with tools, simple                    -> create_tool_calling_agent + AgentExecutor (toy/internal)
agent in production                         -> LangGraph: typed state, explicit edges, checkpoints
need observability                          -> LangSmith env vars + dashboard; ALWAYS in prod
need streaming                              -> chain.astream / graph.astream_events
long-running, resumable                     -> LangGraph + persistent checkpointer (Redis/Postgres)
want to leave LangChain                     -> wrap your own seam; LangGraph is more "framework", LCEL is "DAG"
```

## Anti-Pattern

> [!warning] Anti-pattern
> AgentExecutor with no max_iterations and no LangSmith trace.
> When the agent loops (it will), you can't see why and can't stop it cheaply.
> Set max_iterations, capture intermediate_steps, and turn tracing on.

## Tips

- LCEL pipe syntax (prompt | llm | parser) is the modern LangChain pattern — avoid the legacy LLMChain class.
- Use @tool decorator for simple tools, BaseTool for complex ones with validation and async support.
- Enable LangSmith tracing with LANGCHAIN_TRACING_V2=true — see every LLM call, retrieval, and tool use in production.
- RunnablePassthrough() passes input through unchanged — use it to wire inputs to multiple chain branches.
- For non-trivial production agents, prefer LangGraph (typed state, explicit edges, checkpoints, replay) over AgentExecutor — its loop is opaque and hard to debug when things go wrong. Pin every LangChain dep; the ecosystem moves fast.

## Common Mistake

> [!warning] Over-abstracting with LangChain when a simple OpenAI API call would suffice — LangChain adds value for complex pipelines (RAG, agents, multi-step). For a single LLM call, use the OpenAI SDK directly.

## Shorthand (Junior → Senior)

**Junior:**
```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o")
prompt = ChatPromptTemplate.from_messages([...])
parser = StrOutputParser()
chain = prompt | llm | parser
```

**Senior:**
```python
# For a single call, just use OpenAI directly
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o", messages=[...]
)
```

## See Also

- [[Sections/llm-ai/rag-langchain/_Index|LLMs & AI Engineering → RAG & LangChain]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
