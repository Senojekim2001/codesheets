---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "celery"
id: "celery-tasks"
title: "Celery tasks — define, enqueue, retrieve results"
category: "Celery"
subtitle: "@app.task, task.delay / apply_async, broker URL, result backend, JSON serializer (not pickle), bind=True, async invocation from FastAPI"
signature_short: "app = Celery(\"myapp\", broker=\"redis://...\", backend=\"redis://...\")
@app.task
def send_email(to, subject): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Celery tasks — define, enqueue, retrieve results"
  - "celery-tasks"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/celery"
  - "category/celery"
  - "tier/tiered"
---

# Celery tasks — define, enqueue, retrieve results

> @app.task, task.delay / apply_async, broker URL, result backend, JSON serializer (not pickle), bind=True, async invocation from FastAPI

## Overview

Celery is the canonical Python task queue: define functions decorated with `@app.task`; invoke them via `.delay()` or `.apply_async()` from a web handler; a worker process picks them up from the broker and runs them. The web request returns in milliseconds; the slow work happens out-of-band. Brokers are typically Redis (simple, fast) or RabbitMQ (more reliable for long-running). The result backend is optional — most production code is fire-and-forget. Critical setting: serializer is JSON, never pickle (pickle deserialization is RCE-on-arrival). The three examples solve the SAME concrete task — a web handler sends a confirmation email asynchronously without blocking — at three depths: minimal `@task` + `.delay` → typed inputs via Pydantic + structured logging from tasks → production with OTel propagation, idempotency by task_id, async-friendly invocation from FastAPI.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Web handler sends a confirmation email without blocking the request.
- **Junior** — SAME — but with typed inputs, structured logging, soft time limits, and bound=True for tasks that need to know their own ID.
- **Senior** — SAME — production: OpenTelemetry trace propagation across the queue, idempotency by task_id, FastAPI integration with async-friendly invocation, dead-letter on permanent failure (forwards to retries entry).

## Signature

```python
app = Celery("myapp", broker="redis://...", backend="redis://...")
@app.task
def send_email(to, subject): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Web handler sends a confirmation email without blocking
#             the request.
# APPROACH  - @app.task decorator; task.delay(args) enqueues; a Celery
#             worker process picks up and runs.
# STRENGTHS - Smallest correct queue setup; web stays fast.
# WEAKNESSES- No retries, no observability; junior tier adds them.

# pip install celery redis
# Project layout:
#   myapp/__init__.py     <- Celery app config
#   myapp/tasks.py        <- task definitions
#   myapp/web.py          <- FastAPI/Flask handler that enqueues

# === myapp/__init__.py ===
from celery import Celery

app = Celery(
    "myapp",
    broker="redis://localhost:6379/0",            # where tasks are queued
    backend="redis://localhost:6379/1",            # where results land (optional)
)
app.conf.task_serializer = "json"                   # NEVER use pickle
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]                  # reject non-JSON payloads

# === myapp/tasks.py ===
from myapp import app

@app.task
def send_confirmation_email(to: str, subject: str, body: str) -> dict:
    # Imagine: SMTP send / SES API call / etc.
    print(f"[email] to={to} subject={subject}")
    return {"status": "sent", "to": to}

# === myapp/web.py ===
from fastapi import FastAPI
from myapp.tasks import send_confirmation_email

api = FastAPI()

@api.post("/signup")
async def signup(email: str):
    # Enqueue; returns IMMEDIATELY (in microseconds).
    send_confirmation_email.delay(
        to=email,
        subject="Welcome!",
        body="Click here to verify...",
    )
    return {"status": "ok"}

# === Run the worker ===
# Terminal 1:
#   $ redis-server
# Terminal 2:
#   $ celery -A myapp worker --loglevel=info
# Terminal 3:
#   $ uvicorn myapp.web:api
#
# POST /signup -> handler returns 200 immediately;
# worker logs show: [email] to=... subject=Welcome!

# .delay() vs .apply_async():
#   send_email.delay(to, subject)
#     - Shorthand for .apply_async; positional+keyword args.
#   send_email.apply_async(args=[to], kwargs={"subject": ...},
#                          countdown=60, eta=datetime, queue="email")
#     - Use when you need scheduling options.

# Result retrieval (rarely needed; most tasks are fire-and-forget):
#   result = send_email.delay(to, subject)
#   result.id                          # UUID
#   result.get(timeout=10)             # blocks; returns return value
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with typed inputs, structured logging, soft
#             time limits, and bound=True for tasks that need to
#             know their own ID.
# APPROACH  - Pydantic schema validates inputs at enqueue time;
#             celery soft_time_limit raises SoftTimeLimitExceeded
#             so the task can clean up; bind=True lets the task
#             access self.request (id, retries, etc.).
# STRENGTHS- Type-safe payloads; clean cleanup on long-runners; tasks
#             can be cancelled mid-work via soft_time_limit.
# WEAKNESSES- Pydantic adds a tiny serialization step; well worth it
#             for the validation guarantees.
import structlog
from pydantic import BaseModel, EmailStr
from celery import Celery
from celery.exceptions import SoftTimeLimitExceeded

log = structlog.get_logger("celery.tasks")

app = Celery("myapp", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")
app.conf.task_serializer    = "json"
app.conf.result_serializer  = "json"
app.conf.accept_content     = ["json"]
app.conf.task_time_limit         = 300       # hard kill after 5 min
app.conf.task_soft_time_limit    = 270       # SoftTimeLimitExceeded at 4:30
app.conf.worker_send_task_events = True       # for monitoring (Flower etc.)

class EmailPayload(BaseModel):
    to: EmailStr
    subject: str
    body: str

@app.task(bind=True, name="email.send_confirmation")
def send_confirmation(self, payload: dict) -> dict:
    """Validate, send, return a structured result."""
    data = EmailPayload.model_validate(payload)
    bound_log = log.bind(task_id=self.request.id, to=data.to)
    bound_log.info("email_send_started")

    try:
        # Pretend this is the SMTP / SES call.
        _send_via_provider(data)
    except SoftTimeLimitExceeded:
        bound_log.warning("email_send_soft_limit_exceeded")
        # Try to flush whatever we can before hard kill.
        raise

    bound_log.info("email_send_completed")
    return {"status": "sent", "task_id": self.request.id}

def _send_via_provider(data: EmailPayload) -> None:
    # SMTP / SES / SendGrid / etc.
    pass

# === Enqueue with structured args (Pydantic dump = JSON-safe dict) ===
def enqueue_email(payload: EmailPayload) -> str:
    result = send_confirmation.delay(payload.model_dump())
    return result.id

# === Async invocation patterns ===
# .delay()        — fire & forget
# .apply_async()  — with options
result = send_confirmation.apply_async(
    args=[EmailPayload(to="a@b.com", subject="Hi", body="...").model_dump()],
    queue="email",                                # route to a specific queue
    countdown=60,                                  # delay 60s before run
    expires=3600,                                  # discard if not run within 1h
)

# === Worker invocation ===
#   $ celery -A myapp worker --loglevel=info \
#       --concurrency=4 \
#       -Q email                                   # only consume the email queue
#
# Concurrency=4 = 4 sub-processes per worker host. For I/O-bound
# tasks (HTTP calls, DB), can go higher; for CPU-bound, match cores.

# === Result handling — opt in only when needed ===
# Don't store every task's result if you never read it; backend writes
# cost time + memory. Set ignore_result=True for fire-and-forget:
@app.task(ignore_result=True)
def background_cleanup() -> None:
    pass
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: OpenTelemetry trace propagation
#             across the queue, idempotency by task_id, FastAPI
#             integration with async-friendly invocation, dead-letter
#             on permanent failure (forwards to retries entry).
# APPROACH  - opentelemetry-instrumentation-celery for auto trace
#             span creation; redis SET for "task already processed"
#             check inside the task body; FastAPI endpoint awaits
#             via asyncio.to_thread to avoid blocking the loop.
# STRENGTHS - Cross-service traces (handler -> task), idempotent
#             reprocessing, FastAPI stays async-correct; observability
#             from end to end.
# WEAKNESSES- More machinery; for a 5-route service the junior tier
#             is enough.
import asyncio
import logging
import structlog
from typing import Any
from celery import Celery
from celery.signals import task_prerun, task_postrun, task_failure
from opentelemetry import trace
from opentelemetry.instrumentation.celery import CeleryInstrumentor
import redis as redis_lib
from pydantic import BaseModel, EmailStr

log = structlog.get_logger("celery.tasks")
tracer = trace.get_tracer(__name__)

# === Celery app ===
app = Celery("myapp", broker="redis://localhost:6379/0", backend="redis://localhost:6379/1")
app.conf.task_serializer        = "json"
app.conf.result_serializer      = "json"
app.conf.accept_content         = ["json"]
app.conf.task_time_limit        = 300
app.conf.task_soft_time_limit   = 270
app.conf.task_acks_late         = True            # ack only on success — crash-safe
app.conf.worker_prefetch_multiplier = 1            # one task per worker at a time
app.conf.task_reject_on_worker_lost = True         # requeue on SIGKILL

# Auto-instrumentation: every task is wrapped in an OTel span;
# trace context propagates through Celery message headers automatically.
CeleryInstrumentor().instrument()

# === Idempotency — same task_id, run once ===
r = redis_lib.Redis.from_url("redis://localhost:6379/2")
IDEMP_TTL_S = 7 * 24 * 3600                        # 7 days

class EmailPayload(BaseModel):
    idempotency_key: str                             # caller supplies; we de-dup on this
    to: EmailStr
    subject: str
    body: str

@app.task(bind=True, name="email.send_confirmation")
def send_confirmation(self, payload: dict) -> dict:
    data = EmailPayload.model_validate(payload)
    ck = f"task:idemp:email:{data.idempotency_key}"

    # Try to claim the idempotency slot.
    if not r.set(ck, "1", nx=True, ex=IDEMP_TTL_S):
        log.info("task_skipped_already_processed",
                 task_id=self.request.id,
                 idempotency_key=data.idempotency_key)
        return {"status": "skipped_idempotent"}

    log.info("task_started", task_id=self.request.id, to=data.to)
    try:
        _send_via_provider(data)
    except Exception:
        # Release the idempotency claim on failure so a retry can re-attempt.
        r.delete(ck)
        raise

    log.info("task_completed", task_id=self.request.id)
    return {"status": "sent"}

def _send_via_provider(data: EmailPayload) -> None: ...

# === Signal handlers — observability across the task lifecycle ===
@task_prerun.connect
def _on_prerun(sender=None, task_id=None, task=None, **kw):
    log.info("task_prerun", task_name=getattr(task, "name", None), task_id=task_id)

@task_postrun.connect
def _on_postrun(sender=None, task_id=None, task=None, retval=None, state=None, **kw):
    log.info("task_postrun", task_name=getattr(task, "name", None),
             task_id=task_id, state=state)

@task_failure.connect
def _on_failure(sender=None, task_id=None, exception=None, **kw):
    log.error("task_failed", task_id=task_id, exc_type=type(exception).__name__,
              exc=str(exception))

# === FastAPI integration — async-friendly enqueue ===
from fastapi import FastAPI
api = FastAPI()

@api.post("/signup")
async def signup(email: str, *, idempotency_key: str | None = None):
    """Returns immediately. Tracing propagates: this request's span
    ends after the enqueue; the worker's span links back via Celery
    headers (auto-instrumented)."""
    payload = EmailPayload(
        idempotency_key=idempotency_key or _gen_key(),
        to=email,
        subject="Welcome",
        body="Click to verify...",
    )
    # apply_async is sync — wrap so we don't block the event loop on Redis.
    result = await asyncio.to_thread(
        lambda: send_confirmation.apply_async(args=[payload.model_dump()])
    )
    return {"task_id": result.id}

def _gen_key() -> str:
    import secrets
    return secrets.token_urlsafe(16)

# === Worker invocation in production ===
#   celery -A myapp worker \
#     --loglevel=info \
#     --concurrency=4 \
#     --max-tasks-per-child=1000 \
#     -Q email,default

# task_acks_late=True + reject_on_worker_lost=True:
#   - default: Celery acks the message BEFORE running the task.
#     If the worker crashes mid-task, the message is gone and the work
#     is lost.
#   - acks_late: ack happens AFTER the task returns. Crash mid-task =
#     message stays in queue, another worker picks up. Pair with
#     idempotency so the redelivery is safe.
#
# worker_prefetch_multiplier=1:
#   - default 4 means each worker grabs 4 tasks ahead of time. Good for
#     short fast tasks; bad for slow ones (long-running task hogs 4
#     slots; new tasks wait).

# Decision rule:
#   web handler doing slow I/O           -> Celery; return 202 + task id; client polls
#   strict ordering across messages      -> Kafka / Redis Streams (next entry); not Celery
#   sub-second latency requirement       -> NOT Celery; in-process or Redis pub/sub
#   one-off scheduled tasks              -> Celery + beat (next entry)
#   high-throughput workflow              -> Celery group / chord / canvas patterns
#   serializer choice                     -> JSON; NEVER pickle (RCE on deserialization)
#   Pydantic in/out                       -> validate at task boundary; pass model_dump()
#   FastAPI integration                   -> apply_async via asyncio.to_thread
#   long-running tasks (>5min)            -> raise time_limit; OR break into smaller tasks
#   idempotency                           -> caller-supplied key + Redis SETNX
#   monitoring                            -> Flower (web UI) or Prometheus exporter
#   ack semantics                         -> task_acks_late=True for crash-safety
#   prefetch tuning                       -> 1 for slow tasks; 4-8 for fast tasks
#   trace propagation                     -> CeleryInstrumentor (cross-references observability)
#   secret handling in task               -> never log payloads with secrets; redact (cross-ref crypto-secrets)
#
# Anti-pattern: pickle as the task serializer. Pickle deserialization
# runs arbitrary code; a malicious or corrupted message in the broker
# becomes RCE on the worker. The default before Celery 5.0 was pickle;
# explicitly set serializer = "json" (or msgpack if you need binary
# efficiency). NEVER set accept_content = ["pickle"] — it whitelists
# the attack vector.
```

## Decision Rule

```text
web handler doing slow I/O           -> Celery; return 202 + task id; client polls
strict ordering across messages      -> Kafka / Redis Streams (next entry); not Celery
sub-second latency requirement       -> NOT Celery; in-process or Redis pub/sub
one-off scheduled tasks              -> Celery + beat (next entry)
high-throughput workflow              -> Celery group / chord / canvas patterns
serializer choice                     -> JSON; NEVER pickle (RCE on deserialization)
Pydantic in/out                       -> validate at task boundary; pass model_dump()
FastAPI integration                   -> apply_async via asyncio.to_thread
long-running tasks (>5min)            -> raise time_limit; OR break into smaller tasks
idempotency                           -> caller-supplied key + Redis SETNX
monitoring                            -> Flower (web UI) or Prometheus exporter
ack semantics                         -> task_acks_late=True for crash-safety
prefetch tuning                       -> 1 for slow tasks; 4-8 for fast tasks
trace propagation                     -> CeleryInstrumentor (cross-references observability)
secret handling in task               -> never log payloads with secrets; redact (cross-ref crypto-secrets)
```

## Anti-Pattern

> [!warning] Anti-pattern
> pickle as the task serializer. Pickle deserialization
> runs arbitrary code; a malicious or corrupted message in the broker
> becomes RCE on the worker. The default before Celery 5.0 was pickle;
> explicitly set serializer = "json" (or msgpack if you need binary
> efficiency). NEVER set accept_content = ["pickle"] — it whitelists
> the attack vector.

## Tips

- Use JSON as the task serializer, NEVER pickle. Pickle deserialization runs arbitrary code; a malicious payload in the broker is RCE-on-arrival. `task_serializer = "json"` + `accept_content = ["json"]`.
- `task_acks_late=True` makes the task ack happen AFTER successful return. Default is "ack on receive" — a worker crash mid-task loses the message. Pair with idempotency so redelivery is safe.
- `worker_prefetch_multiplier=1` is the right default for tasks that take more than a few seconds. The default of 4 means each worker grabs 4 tasks at once; long-running tasks block 3 others.
- Use `bind=True` on tasks that need their own ID, retry count, or other request metadata. Adds `self` parameter (`self.request.id`, `self.request.retries`).
- For FastAPI, wrap `apply_async()` calls in `asyncio.to_thread()` — apply_async is synchronous (Redis network call); without to_thread it blocks the event loop.
- Install `opentelemetry-instrumentation-celery` to propagate trace context through queue messages. Cross-service traces work end-to-end without manual injection.

## Common Mistake

> [!warning] Using `pickle` as the task serializer. Pickle deserialization runs arbitrary Python code; a malicious or corrupted broker message becomes RCE on every worker. Always set `task_serializer = "json"` and `accept_content = ["json"]`. Never `accept_content = ["pickle"]` — that whitelists the attack vector.

## Shorthand (Junior → Senior)

**Junior:**
```python
# pickle accepted — RCE on every worker
app.conf.accept_content = ["pickle"]
app.conf.task_serializer = "pickle"
```

**Senior:**
```python
# JSON only; safe by construction
app.conf.task_serializer = "json"
app.conf.result_serializer = "json"
app.conf.accept_content = ["json"]
```

## See Also

- [[Sections/messaging-queues/celery/celery-retries|Celery retries — backoff, dead-letter, idempotency (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/celery-routing-beat|Celery routing & beat — queues, priorities, scheduled tasks (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/_Index|Messaging & Queues → Celery — task queues, retries, scheduling]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]
