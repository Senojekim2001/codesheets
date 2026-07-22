---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "celery"
id: "celery-retries"
title: "Celery retries — backoff, dead-letter, idempotency"
category: "Celery"
subtitle: "task.retry, autoretry_for, retry_backoff, retry_jitter, max_retries, dead-letter via on_failure, idempotency, retry_kwargs"
signature_short: "@app.task(autoretry_for=(IOError,), retry_backoff=True, retry_jitter=True, retry_kwargs={\"max_retries\": 5})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Celery retries — backoff, dead-letter, idempotency"
  - "celery-retries"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/celery"
  - "category/celery"
  - "tier/tiered"
---

# Celery retries — backoff, dead-letter, idempotency

> task.retry, autoretry_for, retry_backoff, retry_jitter, max_retries, dead-letter via on_failure, idempotency, retry_kwargs

## Overview

Retry strategy is a deliberate design — too aggressive and you hammer dependencies; too passive and transient blips cause permanent failure. The discipline: classify exceptions (transient vs permanent), retry transient with exponential backoff + jitter, route exhausted retries to a dead-letter queue. Celery 5.0+ has declarative retry via `autoretry_for=(SomeError,)` + `retry_backoff=True` + `retry_jitter=True` — this replaces the older imperative `task.retry(countdown=...)` pattern. The three examples solve the SAME concrete task — `send_confirmation_email` retries on transient failures, gives up cleanly on permanent ones, and routes max-retries-exhausted to a dead-letter — at three depths: imperative `self.retry(countdown=)` → declarative `autoretry_for` + backoff → production with separate retry/permanent paths, dead-letter routing, idempotency on retry, and structured failure metrics.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — send_confirmation_email retries on transient failure (SMTP timeout) up to 3 times, then gives up.
- **Junior** — SAME — but declarative: autoretry on transient exceptions, exponential backoff, jitter, classified error handling.
- **Senior** — SAME — production: classified retry policy, dead-letter queue on max-retries-exhausted, idempotency around the SMTP send so retries don't double-send, structured metrics per attempt + outcome.

## Signature

```python
@app.task(autoretry_for=(IOError,), retry_backoff=True, retry_jitter=True, retry_kwargs={"max_retries": 5})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - send_confirmation_email retries on transient failure
#             (SMTP timeout) up to 3 times, then gives up.
# APPROACH  - Catch the transient exception; call self.retry with
#             countdown (seconds to wait).
# STRENGTHS - Explicit retry control; works on any Celery version.
# WEAKNESSES- Imperative; junior tier shows the cleaner declarative
#             form. No exponential backoff or jitter yet.
import smtplib
from celery import Celery

app = Celery("myapp", broker="redis://localhost:6379/0")

class TransientMailError(Exception): pass
class PermanentMailError(Exception): pass

@app.task(bind=True, name="email.send")
def send_email(self, to: str, subject: str, body: str):
    try:
        _send_via_smtp(to, subject, body)
    except smtplib.SMTPServerDisconnected as exc:
        # Transient — retry.
        raise self.retry(exc=exc, countdown=60, max_retries=3)
    except smtplib.SMTPRecipientsRefused as exc:
        # Permanent — don't retry; log and move on.
        log.error("email_permanent_failure", to=to, exc=str(exc))
        raise PermanentMailError(str(exc)) from exc

def _send_via_smtp(to: str, subject: str, body: str): ...

# Behavior:
#   T+0:    first attempt
#   T+0:    SMTPServerDisconnected -> self.retry(countdown=60)
#   T+60:   second attempt
#   T+60:   SMTPServerDisconnected -> self.retry(countdown=60)
#   T+120:  third attempt
#   T+120:  SMTPServerDisconnected -> self.retry(countdown=60)
#   T+180:  fourth attempt
#   T+180:  SMTPServerDisconnected -> MaxRetriesExceededError
#
# Problems with this:
#  - Constant 60s countdown — no exponential backoff
#  - No jitter — retries are synchronized across all failed tasks
#  - No dead-letter for max-retries-exhausted
#  - Idempotency: retry runs the FULL task body again; SMTP send may
#    happen twice if the original DID succeed but the connection
#    dropped before ack
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but declarative: autoretry on transient
#             exceptions, exponential backoff, jitter, classified
#             error handling.
# APPROACH  - Decorator args do the retry plumbing; task body just
#             handles classification.
# STRENGTHS- Less imperative code; backoff + jitter built-in;
#             retries go to the same task with incremented retry count.
# WEAKNESSES- Still no dead-letter; senior tier adds it.
import smtplib
from celery import Celery
import structlog

log = structlog.get_logger()

app = Celery("myapp", broker="redis://localhost:6379/0")

# Transient errors that warrant a retry.
TRANSIENT_ERRORS = (
    smtplib.SMTPServerDisconnected,
    smtplib.SMTPConnectError,
    smtplib.SMTPDataError,        # 4xx codes are temporary
    ConnectionResetError,
    TimeoutError,
)

@app.task(
    bind=True,
    name="email.send",
    autoretry_for=TRANSIENT_ERRORS,
    retry_backoff=True,             # exponential; 1, 2, 4, 8, ... base seconds
    retry_backoff_max=600,          # cap at 10 min
    retry_jitter=True,               # randomize ± 50% to avoid synchronized retries
    retry_kwargs={"max_retries": 5},
    acks_late=True,
)
def send_email(self, to: str, subject: str, body: str) -> dict:
    log.info("email_attempt",
             task_id=self.request.id, to=to,
             retries=self.request.retries)
    try:
        _send_via_smtp(to, subject, body)
    except smtplib.SMTPRecipientsRefused as exc:
        # Permanent — autoretry won't fire (not in TRANSIENT_ERRORS).
        log.error("email_permanent_failure",
                  to=to, exc=str(exc),
                  task_id=self.request.id)
        # Re-raise as a domain error; the task FAILS but doesn't retry.
        raise

    log.info("email_sent", to=to, task_id=self.request.id)
    return {"status": "sent", "to": to}

def _send_via_smtp(to: str, subject: str, body: str): ...

# Retry timing with retry_backoff=True, retry_backoff_max=600, retry_jitter=True:
#   attempt 0: T+0
#   attempt 1: T+ ~1s + jitter        (after first failure)
#   attempt 2: T+ ~3s + jitter
#   attempt 3: T+ ~7s + jitter
#   attempt 4: T+ ~15s + jitter
#   attempt 5: T+ ~31s + jitter
#   max_retries=5 reached -> task fails permanently
#
# Each attempt's "retry_backoff" delay is from the PREVIOUS failure;
# total wall time roughly: 1 + 2 + 4 + 8 + 16 ≈ 31 seconds from
# first failure to give-up.

# Manual retry with custom delay (when you have rate-limit headers):
#   except RateLimitError as exc:
#       raise self.retry(exc=exc, countdown=int(exc.retry_after_seconds))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: classified retry policy, dead-letter
#             queue on max-retries-exhausted, idempotency around the
#             SMTP send so retries don't double-send, structured
#             metrics per attempt + outcome.
# APPROACH  - Two-tier exception classification (transient vs permanent
#             vs unknown); on_failure handler routes to DLQ;
#             idempotency_key + Redis SETNX guards the actual send;
#             Prometheus counters per outcome.
# STRENGTHS - Permanent failures don't burn retry budget; transient
#             retries are bounded; DLQ holds permanently-failed tasks
#             for ops review; double-sends are impossible.
# WEAKNESSES- More moving parts; document the retry policy + DLQ
#             flow in your runbook.
import smtplib, time
import structlog
import redis as redis_lib
from celery import Celery
from celery.exceptions import MaxRetriesExceededError
from prometheus_client import Counter, Histogram

log = structlog.get_logger()

EMAIL_ATTEMPTS = Counter("email_attempts_total", "Email send attempts", ["outcome"])
EMAIL_DURATION = Histogram("email_duration_seconds", "Email send duration", ["outcome"])

app = Celery("myapp", broker="redis://localhost:6379/0")
app.conf.task_acks_late = True
app.conf.task_reject_on_worker_lost = True

r = redis_lib.Redis.from_url("redis://localhost:6379/2")
IDEMP_TTL_S = 7 * 24 * 3600

# Classified errors.
TRANSIENT = (
    smtplib.SMTPServerDisconnected,
    smtplib.SMTPConnectError,
    smtplib.SMTPDataError,
    ConnectionResetError,
    TimeoutError,
)
PERMANENT = (
    smtplib.SMTPRecipientsRefused,
    smtplib.SMTPSenderRefused,
    ValueError,                                    # bad input
)

class PermanentEmailError(Exception): pass

# Dead-letter queue task — routes to a different queue.
@app.task(name="email.deadletter", queue="email_dlq", acks_late=True)
def send_email_dlq(payload: dict, error: str, attempts: int) -> None:
    """Tasks that exhaust retries land here. Ops triages from this queue."""
    log.error("email_dead_letter",
              payload=payload, error=error, attempts=attempts)
    # Could write to a "failed_emails" DB table for review.

@app.task(
    bind=True,
    name="email.send",
    autoretry_for=TRANSIENT,
    retry_backoff=True,
    retry_backoff_max=600,
    retry_jitter=True,
    retry_kwargs={"max_retries": 5},
    acks_late=True,
)
def send_email(self, payload: dict) -> dict:
    """Send confirmation email with full retry / DLQ / idempotency."""
    started = time.monotonic()
    bound = log.bind(task_id=self.request.id,
                     retries=self.request.retries,
                     idempotency_key=payload.get("idempotency_key"))
    bound.info("email_attempt")

    # Idempotency check — same key, only one send.
    ck = f"task:idemp:email:{payload['idempotency_key']}"
    if not r.set(ck, "1", nx=True, ex=IDEMP_TTL_S):
        bound.info("email_skipped_idempotent")
        EMAIL_ATTEMPTS.labels(outcome="idempotent_skip").inc()
        return {"status": "skipped"}

    try:
        _send_via_smtp(payload["to"], payload["subject"], payload["body"])
    except PERMANENT as exc:
        bound.error("email_permanent_failure", exc=str(exc))
        EMAIL_ATTEMPTS.labels(outcome="permanent_failure").inc()
        # Permanent: route to DLQ immediately, don't retry.
        send_email_dlq.apply_async(args=[payload, str(exc), self.request.retries + 1])
        # Mark as failed (not retried).
        raise PermanentEmailError(str(exc)) from exc
    except TRANSIENT:
        # autoretry_for catches this — Celery handles the retry.
        # We don't need to do anything; the @task decorator does it.
        EMAIL_ATTEMPTS.labels(outcome="transient_failure").inc()
        # Release idempotency claim so retry can succeed.
        r.delete(ck)
        raise
    except Exception:
        # Unknown — release idempotency, route to DLQ, don't retry.
        r.delete(ck)
        EMAIL_ATTEMPTS.labels(outcome="unknown_failure").inc()
        send_email_dlq.apply_async(args=[payload, "unknown error", self.request.retries + 1])
        raise

    # Success.
    elapsed = time.monotonic() - started
    EMAIL_ATTEMPTS.labels(outcome="success").inc()
    EMAIL_DURATION.labels(outcome="success").observe(elapsed)
    bound.info("email_sent", elapsed_s=elapsed)
    return {"status": "sent"}

# Hook for "max retries exhausted" — Celery fires this AFTER autoretry
# gives up. Route to DLQ for ops triage.
@app.task(bind=True, base=app.Task)
class _:                                             # placeholder
    pass

from celery.signals import task_failure

@task_failure.connect(sender=send_email)
def on_send_email_failure(sender=None, task_id=None, exception=None, einfo=None, **kw):
    """Catches MaxRetriesExceededError; route the original payload to DLQ."""
    if isinstance(exception, MaxRetriesExceededError):
        # We don't have the payload here directly; in practice, store it
        # on self.request or pass via task kwargs. The DLQ pattern above
        # handles permanent failures inline; this signal catches the
        # autoretry-exhausted case.
        log.error("email_max_retries_exceeded", task_id=task_id)
        EMAIL_ATTEMPTS.labels(outcome="max_retries_exceeded").inc()

def _send_via_smtp(to: str, subject: str, body: str): ...

# === Run the DLQ worker separately ===
# Default worker:
#   $ celery -A myapp worker -Q email --concurrency=8
# DLQ worker (lower concurrency; usually just logs and writes to DB):
#   $ celery -A myapp worker -Q email_dlq --concurrency=1
# Beat (next entry) for scheduled retries from DLQ.

# Decision rule:
#   transient (network blip, rate limit) -> autoretry_for + backoff + jitter
#   permanent (bad input, validation)    -> raise; do NOT retry
#   unknown                              -> log + DLQ; investigate
#   rate-limit response with Retry-After -> manual self.retry(countdown=int(retry_after))
#   max retries exhausted                -> DLQ (separate queue + worker)
#   idempotency on retry                 -> Redis SETNX with task-supplied key
#   third-party API outage                -> circuit breaker upstream of Celery; not just retry
#   strict message ordering required     -> NOT Celery; use Kafka with single partition
#   long retry window (hours)            -> raise retry_backoff_max; mind broker memory
#   want delayed retry (eta)             -> self.retry(eta=datetime); not countdown
#
# Anti-pattern: catching all exceptions and calling self.retry() for
# every kind. Permanent errors (bad email format, missing required
# field) RETRY 5 times, fail, occupy worker for 30 seconds, then go
# to DLQ for human review of a problem that was diagnosable on the
# first attempt. Classify: TRANSIENT errors retry; PERMANENT errors
# fail fast and route to DLQ; UNKNOWN errors fail fast (don't burn
# retry budget on a mystery).
```

## Decision Rule

```text
transient (network blip, rate limit) -> autoretry_for + backoff + jitter
permanent (bad input, validation)    -> raise; do NOT retry
unknown                              -> log + DLQ; investigate
rate-limit response with Retry-After -> manual self.retry(countdown=int(retry_after))
max retries exhausted                -> DLQ (separate queue + worker)
idempotency on retry                 -> Redis SETNX with task-supplied key
third-party API outage                -> circuit breaker upstream of Celery; not just retry
strict message ordering required     -> NOT Celery; use Kafka with single partition
long retry window (hours)            -> raise retry_backoff_max; mind broker memory
want delayed retry (eta)             -> self.retry(eta=datetime); not countdown
```

## Anti-Pattern

> [!warning] Anti-pattern
> catching all exceptions and calling self.retry() for
> every kind. Permanent errors (bad email format, missing required
> field) RETRY 5 times, fail, occupy worker for 30 seconds, then go
> to DLQ for human review of a problem that was diagnosable on the
> first attempt. Classify: TRANSIENT errors retry; PERMANENT errors
> fail fast and route to DLQ; UNKNOWN errors fail fast (don't burn
> retry budget on a mystery).

## Tips

- Classify exceptions: TRANSIENT (network, rate limit, 5xx) → retry with backoff; PERMANENT (bad input, 4xx auth) → fail fast, no retry; UNKNOWN → fail + alert. Don't retry everything.
- `autoretry_for=(SomeError,)` + `retry_backoff=True` + `retry_jitter=True` is the modern declarative form. Replace the older `try / except / self.retry(countdown=)` pattern.
- Always use `retry_jitter=True`. Without it, when the upstream recovers, every failed task retries simultaneously and overloads it again — synchronized thundering herd.
- Cap retries with `retry_kwargs={"max_retries": 5}`. Unbounded retries waste worker capacity on failing tasks; route exhausted retries to a DLQ.
- For idempotency on retry, use a caller-supplied `idempotency_key` and a Redis `SETNX` claim. Release the claim on transient failure so retry can succeed.
- Keep the DLQ on a separate queue (`-Q email_dlq`) with a separate worker. Often the DLQ worker just logs to a DB table for ops review.

## Common Mistake

> [!warning] Catching all exceptions and calling `self.retry()` for every kind. Permanent errors (bad email format, missing field) retry 5 times, fail, occupy worker for 30 seconds, then land in DLQ for human review of a diagnosable-on-first-attempt problem. Classify: transient retries; permanent fails fast; unknown fails fast and alerts.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Retry-everything — wastes 30s × N tasks on permanent errors
@app.task(bind=True)
def send_email(self, payload):
    try: _send(payload)
    except Exception as e:
        raise self.retry(exc=e, countdown=60, max_retries=5)
```

**Senior:**
```python
# Classified — transient retries, permanent fails fast
@app.task(bind=True, autoretry_for=TRANSIENT,
          retry_backoff=True, retry_jitter=True,
          retry_kwargs={"max_retries": 5})
def send_email(self, payload):
    try: _send(payload)
    except PERMANENT as e:
        send_email_dlq.delay(payload, str(e))
        raise
```

## See Also

- [[Sections/messaging-queues/celery/celery-tasks|Celery tasks — define, enqueue, retrieve results (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/celery-routing-beat|Celery routing & beat — queues, priorities, scheduled tasks (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/_Index|Messaging & Queues → Celery — task queues, retries, scheduling]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]
