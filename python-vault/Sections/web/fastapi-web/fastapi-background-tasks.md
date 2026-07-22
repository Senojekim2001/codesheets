---
type: "entry"
domain: "python"
file: "web"
section: "fastapi-web"
id: "fastapi-background-tasks"
title: "BackgroundTasks"
category: "FastAPI"
subtitle: "Fire-and-forget operations, post-response tasks"
signature_short: "BackgroundTasks  |  background_tasks.add_task(func, *args)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "BackgroundTasks"
  - "fastapi-background-tasks"
tags:
  - "python"
  - "python/web"
  - "python/web/fastapi-web"
  - "category/fastapi"
  - "tier/tiered"
---

# BackgroundTasks

> Fire-and-forget operations, post-response tasks

## Overview

Use `BackgroundTasks` to offload work that doesn't need to complete before responding. Add tasks with `background_tasks.add_task()`, and FastAPI will execute them after sending the response. Useful for emails, logging, cleanup.

## Signature

```python
BackgroundTasks  |  background_tasks.add_task(func, *args)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Schedule one task to run after the response is sent
# STRENGTHS - Smallest fire-and-forget pattern in FastAPI
# WEAKNESSES- No error handling; task failures vanish silently
#
from fastapi import FastAPI, BackgroundTasks

app = FastAPI()

def write_log(message: str):
    with open("audit.log", "a") as f:
        f.write(message + "\n")

@app.post("/notify")
async def notify(email: str, bg: BackgroundTasks):
    bg.add_task(write_log, f"notified {email}")
    return {"queued": True}                    # response goes out IMMEDIATELY
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Async + sync tasks, multiple tasks per request, error logging
# STRENGTHS - Shows the two function shapes BackgroundTasks accepts
# WEAKNESSES- Still in-process; survives only as long as the server runs
#
import logging, asyncio
from fastapi import FastAPI, BackgroundTasks

log = logging.getLogger("app")
app = FastAPI()

# Sync task — runs in the threadpool so it doesn't block the event loop
def send_email(addr: str, body: str):
    try:
        # smtplib.SMTP(...).send_message(...)
        log.info("email sent to %s", addr)
    except Exception:
        log.exception("email failed for %s", addr)   # NEVER raise — caller is gone

# Async task — awaited inline on the event loop
async def push_metric(name: str, value: float):
    await asyncio.sleep(0.01)                       # pretend network call
    log.info("metric %s=%s", name, value)

@app.post("/signup")
async def signup(email: str, bg: BackgroundTasks):
    bg.add_task(send_email, email, "Welcome!")
    bg.add_task(push_metric, "signup", 1.0)
    return {"status": "ok"}                         # all tasks fire after this
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When BackgroundTasks is wrong; bridge to a real queue
# STRENGTHS - Captures the durability + scaling decision every team faces
# WEAKNESSES- N/A
#
import logging
from fastapi import FastAPI, BackgroundTasks

log = logging.getLogger("app")
app = FastAPI()

# 1) BackgroundTasks runs IN THE SAME PROCESS, AFTER the response.
#    If the worker dies / restarts / crashes — your task vanishes.
#    Use it ONLY for tasks where loss is acceptable (audit logs, metrics, cache warm).

# 2) For anything that MUST happen, enqueue to Celery / RQ / Arq instead.
def enqueue_email(addr: str, body: str):
    # Celery example — synchronous in the request handler, durable in the broker.
    # send_email_task.delay(addr=addr, body=body)
    pass

@app.post("/order")
async def place_order(item_id: int, bg: BackgroundTasks):
    order_id = persist_order(item_id)            # MUST happen before responding
    enqueue_email("ops@example.com", f"new order {order_id}")  # MUST not be lost -> queue
    bg.add_task(log_metric, "order_placed", 1)   # OK to lose -> BackgroundTasks
    return {"order_id": order_id}

# 3) Always wrap background work in a logging boundary.
#    Errors raised inside a task are NOT visible to the client and not retried.
def safe(task):
    def wrapped(*a, **kw):
        try:
            return task(*a, **kw)
        except Exception:
            log.exception("background task %s failed", task.__name__)
    return wrapped

# Decision rule:
#   loss-tolerant, fast, < 1s              -> BackgroundTasks
#   must run, must survive a crash          -> Celery / RQ / Arq with a Redis/RabbitMQ broker
#   periodic / scheduled                    -> Celery beat or APScheduler
#   long-running (> 5s, blocks workers)     -> queue + dedicated worker pool
#   needs retries with backoff              -> queue, never BackgroundTasks
#
# Anti-pattern: doing the email send inline before returning
#   The user waits 2-5 seconds; SMTP timeouts cascade into 504s. Either move it
#   to BackgroundTasks (loss-tolerant) or to a real queue (durable).

def persist_order(_): return 42
def log_metric(*_): pass
```

## Decision Rule

```text
loss-tolerant, fast, < 1s              -> BackgroundTasks
must run, must survive a crash          -> Celery / RQ / Arq with a Redis/RabbitMQ broker
periodic / scheduled                    -> Celery beat or APScheduler
long-running (> 5s, blocks workers)     -> queue + dedicated worker pool
needs retries with backoff              -> queue, never BackgroundTasks
```

## Anti-Pattern

> [!warning] Anti-pattern
> doing the email send inline before returning
>   The user waits 2-5 seconds; SMTP timeouts cascade into 504s. Either move it
>   to BackgroundTasks (loss-tolerant) or to a real queue (durable).

## Tips

- Background tasks run sequentially; use a task queue (Celery) for parallelism.
- The client gets a response immediately; slow tasks don't block.
- Tasks run in the same process; errors won't reach the client.

## Common Mistake

> [!warning] Using BackgroundTasks for critical work; use Celery or Redis queue for reliability.

## Shorthand (Junior → Senior)

**Junior:**
```python
@app.post("/send")
async def send_email_endpoint(email: str, background_tasks: BackgroundTasks):
    def send_task(email_addr):
        time.sleep(1)
        print(f"Sent to {email_addr}")
    background_tasks.add_task(send_task, email)
    return {"status": "sent"}
```

**Senior:**
```python
@app.post("/send")
async def send(email: str, bg: BackgroundTasks):
    bg.add_task(send_email, email)
    return {"status": "sent"}
```

## See Also

- [[Sections/apis/fastapi/fastapi-routes|FastAPI routes (APIs & Frameworks)]]
- [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-models|Pydantic models (APIs & Frameworks)]]
- [[Sections/apis/fastapi/pydantic-validators|Pydantic validators (APIs & Frameworks)]]
- [[Sections/web/fastapi-web/_Index|Web (Flask, Django) → FastAPI]]
- [[Sections/web/_Index|Web (Flask, Django) index]]
- [[_Index|Vault index]]
