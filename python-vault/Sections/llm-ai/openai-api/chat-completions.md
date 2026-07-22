---
type: "entry"
domain: "python"
file: "llm-ai"
section: "openai-api"
id: "chat-completions"
title: "OpenAI Chat Completions — GPT-4, Structured Output & Streaming"
category: "LLM APIs"
subtitle: "openai, ChatCompletion, system/user/assistant, response_format, streaming"
signature_short: "client.chat.completions.create(model, messages)  |  response_format  |  stream=True"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "OpenAI Chat Completions — GPT-4, Structured Output & Streaming"
  - "chat-completions"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/openai-api"
  - "category/llm-apis"
  - "tier/tiered"
---

# OpenAI Chat Completions — GPT-4, Structured Output & Streaming

> openai, ChatCompletion, system/user/assistant, response_format, streaming

## Overview

The OpenAI Python SDK (v1+) provides a typed client for GPT-4, GPT-4o, o1, and other models. Chat completions take a list of messages with roles (system, user, assistant). Structured outputs use response_format with a Pydantic model or JSON schema to guarantee valid JSON. Streaming yields tokens as they are generated for real-time UIs. Vision models accept images in user messages. Function calling lets the model invoke your tools. Always handle rate limits, set timeouts, and use async for production.

## Signature

```python
client.chat.completions.create(model, messages)  |  response_format  |  stream=True
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One client, list of messages with roles, read .choices[0].message.content.
# STRENGTHS - Two lines of setup; the SDK handles auth, retries, and JSON parsing.
# WEAKNESSES- Sync calls block; cost is invisible; no rate-limit handling out of the box.
from openai import OpenAI

client = OpenAI()                                    # reads OPENAI_API_KEY

resp = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a concise tutor."},
        {"role": "user",   "content": "Explain Python generators in 3 sentences."},
    ],
    temperature=0.3,
    max_tokens=200,
)
print(resp.choices[0].message.content)
print(f"tokens: {resp.usage.total_tokens}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Streaming tokens for live UI; structured outputs via Pydantic; AsyncOpenAI in web servers.
# STRENGTHS - Pydantic validation eliminates "broken JSON" parsing; streaming is essential for chat UX.
# WEAKNESSES- Streaming responses must be fully consumed (or aborted) -- abandoned streams keep the connection open.
import asyncio
from openai import AsyncOpenAI, OpenAI
from pydantic import BaseModel

# 1) Structured output -- Pydantic schema is the contract.
class Review(BaseModel):
    severity: str          # "low" | "medium" | "high"
    issues: list[str]
    fix: str

client = OpenAI()
resp = client.beta.chat.completions.parse(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "Code reviewer. Return strict JSON."},
        {"role": "user",   "content": "def add(a, b): return a + b"},
    ],
    response_format=Review,
)
r: Review = resp.choices[0].message.parsed
print(r.severity, r.issues)

# 2) Streaming -- show tokens as they arrive.
def stream_answer(prompt: str) -> str:
    chunks: list[str] = []
    for ev in client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        stream=True,
    ):
        delta = ev.choices[0].delta.content
        if delta:
            chunks.append(delta); print(delta, end="", flush=True)
    return "".join(chunks)

# 3) Async client for FastAPI / aiohttp servers.
async_client = AsyncOpenAI()

async def ask(prompt: str) -> str:
    r = await async_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return r.choices[0].message.content
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Single typed wrapper: retry policy, cost tracking, timeout, idempotency, redaction; provider-agnostic at the seam.
# STRENGTHS - Observable in production: every call has cost, latency, and an id; retries are bounded; PII never enters logs.
# WEAKNESSES- Adds a thin layer of abstraction; for ad-hoc scripts the raw SDK is fine. The wrapper pays off when 5+ call sites exist.
from __future__ import annotations
import logging
import os
import re
import time
import uuid
from contextlib import contextmanager
from dataclasses import dataclass
from openai import APIError, APITimeoutError, OpenAI, RateLimitError
from openai.types.chat import ChatCompletion
from pydantic import BaseModel
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential_jitter

log = logging.getLogger("llm")

# Pricing snapshot (USD per 1M tokens) -- centralize, update via config, NOT inline.
PRICING: dict[str, tuple[float, float]] = {
    "gpt-4o-mini":          (0.15,  0.60),
    "gpt-4o":               (2.50, 10.00),
}

@dataclass
class LLMResult:
    id: str
    model: str
    text: str
    prompt_tokens: int
    output_tokens: int
    usd: float
    latency_ms: int

# Redact common secrets from prompts BEFORE they leave the process.
_SECRET_PATTERNS = [
    re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"),         # API keys
    re.compile(r"\beyJ[A-Za-z0-9._-]{40,}\b"),       # JWTs
    re.compile(r"-----BEGIN [A-Z ]+PRIVATE KEY-----"), # PEM
]
def _scrub(text: str) -> str:
    for p in _SECRET_PATTERNS:
        text = p.sub("***", text)
    return text

class LLM:
    def __init__(self, model: str = "gpt-4o-mini", *, timeout_s: float = 30.0):
        self.client = OpenAI(timeout=timeout_s, max_retries=0)   # WE handle retries
        self.model  = model

    @retry(
        retry=retry_if_exception_type((RateLimitError, APITimeoutError, APIError)),
        wait=wait_exponential_jitter(initial=1, max=30),
        stop=stop_after_attempt(5),
        reraise=True,
    )
    def chat(self, messages: list[dict], *, response_format: type[BaseModel] | None = None,
             temperature: float = 0.0) -> LLMResult:
        request_id = uuid.uuid4().hex[:8]
        # Idempotency on the OpenAI side (since v1.30+):
        extra_headers = {"X-Idempotency-Key": request_id}

        t0 = time.perf_counter()
        if response_format is not None:
            r: ChatCompletion = self.client.beta.chat.completions.parse(
                model=self.model, messages=messages,
                response_format=response_format, temperature=temperature,
                extra_headers=extra_headers,
            )
            text = r.choices[0].message.parsed.model_dump_json()
        else:
            r = self.client.chat.completions.create(
                model=self.model, messages=messages, temperature=temperature,
                extra_headers=extra_headers,
            )
            text = r.choices[0].message.content or ""
        dt_ms = int((time.perf_counter() - t0) * 1000)

        in_tok, out_tok = r.usage.prompt_tokens, r.usage.completion_tokens
        in_$, out_$ = PRICING.get(self.model, (0.0, 0.0))
        usd = (in_tok * in_$ + out_tok * out_$) / 1_000_000

        log.info("llm req=%s model=%s in=%d out=%d $%.5f %dms",
                 request_id, self.model, in_tok, out_tok, usd, dt_ms)

        return LLMResult(id=request_id, model=self.model, text=text,
                         prompt_tokens=in_tok, output_tokens=out_tok,
                         usd=usd, latency_ms=dt_ms)

@contextmanager
def budget(usd_limit: float):
    """Track LLM spend across a request; raise if exceeded."""
    spent = {"v": 0.0}
    yield spent
    if spent["v"] > usd_limit:
        raise RuntimeError(f"budget exceeded: $\u007bspent['v']:.2f\u007d > $\u007busd_limit\u007d")

# Decision rule:
#   prototype / one-shot script               -> raw OpenAI() client; iterate fast
#   2+ call sites / production code           -> typed LLM wrapper with cost + retry + redaction
#   structured output                         -> beta.chat.completions.parse with Pydantic; NEVER prompt for "JSON"
#   need streaming UX                         -> .create(stream=True); always close on cancel
#   web framework                             -> AsyncOpenAI; never block the event loop
#   multi-provider portability (Anthropic + OpenAI + local) -> tools like litellm / aisuite, OR your own seam
#   PII / secrets in prompts                  -> scrub BEFORE the call AND in logs (defense in depth)
#   cost gating per request                   -> tally usage.* per call; raise once per-request budget exceeded
#   reproducible outputs                      -> temperature=0 AND seed= ; still not 100% deterministic, log seeds
#
# Anti-pattern: relying on prompt instructions like "respond ONLY with JSON".
# The model occasionally returns "Here's your JSON: { ... }" and your parser
# explodes in production. Use response_format with a Pydantic model -- the SDK
# guarantees a parsed object or raises.
```

## Decision Rule

```text
prototype / one-shot script               -> raw OpenAI() client; iterate fast
2+ call sites / production code           -> typed LLM wrapper with cost + retry + redaction
structured output                         -> beta.chat.completions.parse with Pydantic; NEVER prompt for "JSON"
need streaming UX                         -> .create(stream=True); always close on cancel
web framework                             -> AsyncOpenAI; never block the event loop
multi-provider portability (Anthropic + OpenAI + local) -> tools like litellm / aisuite, OR your own seam
PII / secrets in prompts                  -> scrub BEFORE the call AND in logs (defense in depth)
cost gating per request                   -> tally usage.* per call; raise once per-request budget exceeded
reproducible outputs                      -> temperature=0 AND seed= ; still not 100% deterministic, log seeds
```

## Anti-Pattern

> [!warning] Anti-pattern
> relying on prompt instructions like "respond ONLY with JSON".
> The model occasionally returns "Here's your JSON: { ... }" and your parser
> explodes in production. Use response_format with a Pydantic model -- the SDK
> guarantees a parsed object or raises.

## Tips

- Use gpt-4o-mini for cost-sensitive tasks (10x cheaper than gpt-4o) — it handles summarization, classification, and extraction well.
- Structured outputs with Pydantic models guarantee valid JSON — no more parsing failures or prompt engineering for format.
- Always use async (AsyncOpenAI) in web APIs — synchronous calls block your server and kill throughput.
- Set temperature=0 for deterministic/factual tasks, 0.7-1.0 for creative tasks. max_tokens limits cost.
- Scrub secrets/PII from prompts BEFORE the call AND in logs — defense in depth; centralize cost tracking (tokens × per-1M price) so spend is observable per request.

## Common Mistake

> [!warning] Not handling rate limits or API errors — wrap calls in try/except with exponential backoff. Use tenacity or the built-in retry: client.with_options(max_retries=3).

## Shorthand (Junior → Senior)

**Junior:**
```python
import requests
response = requests.post(
    "https://api.openai.com/v1/chat/completions",
    json={"model": "gpt-4o", "messages": [...]},
    headers={"Authorization": f"Bearer {key}"},
)
```

**Senior:**
```python
from openai import OpenAI
client = OpenAI()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "..."}]
)
```

## See Also

- [[Sections/llm-ai/openai-api/function-calling|Function Calling & Tool Use — Agentic LLMs (LLMs & AI Engineering)]]
- [[Sections/llm-ai/openai-api/_Index|LLMs & AI Engineering → OpenAI API & LLM Providers]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
