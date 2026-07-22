---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "patterns"
id: "idempotency-keys"
title: "Idempotency keys — make at-least-once safe to redeliver"
category: "Patterns"
subtitle: "caller-supplied idempotency_key, Redis SETNX claim, TTL > redelivery window, release on transient failure, persist OUTCOME for replay-safe response"
signature_short: "if not r.set(f\"idemp:{key}\", \"1\", nx=True, ex=TTL): return cached_outcome
result = work(); r.set(f\"idemp:{key}:result\", json.dumps(result))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Idempotency keys — make at-least-once safe to redeliver"
  - "idempotency-keys"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Idempotency keys — make at-least-once safe to redeliver

> caller-supplied idempotency_key, Redis SETNX claim, TTL > redelivery window, release on transient failure, persist OUTCOME for replay-safe response

## Overview

Every queue we've covered (Celery, Kafka, Redis Streams, AMQP) provides at-least-once delivery — duplicates are part of the contract. The consumer is responsible for handling them safely. The mechanism: caller supplies an `idempotency_key` (UUID, or a deterministic hash of the request); consumer uses Redis SETNX to claim the key; if claim fails, return the previously-stored outcome instead of re-running the work. Critical detail: persist the OUTCOME (return value or error) under the same key so replays can return it without re-executing — this is what HTTP idempotency keys (Stripe/PayPal) do. The three examples solve the SAME concrete task — `charge_card(idempotency_key, amount)` runs exactly once even when the message is delivered three times — at three depths: SETNX claim → claim + outcome cache + transient-failure release → production with TTL aligned to redelivery window, structured outcome (success/error), graceful degradation when Redis is down.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — charge_card runs once per idempotency_key even if the message is delivered multiple times.
- **Junior** — SAME — but cache the OUTCOME so the second delivery returns the original result (not just "skipped"); release the claim on transient failure so retry can succeed.
- **Senior** — SAME — production: TTL matches redelivery window, Redis-down fallback to in-process map (degraded mode), metrics on dedup rate, reusable decorator.

## Signature

```python
if not r.set(f"idemp:{key}", "1", nx=True, ex=TTL): return cached_outcome
result = work(); r.set(f"idemp:{key}:result", json.dumps(result))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - charge_card runs once per idempotency_key even if the
#             message is delivered multiple times.
# APPROACH  - Redis SETNX claim before doing the work; if claim fails,
#             skip.
# STRENGTHS - Smallest correct version; SETNX is atomic.
# WEAKNESSES- Skipped duplicate doesn't return the original result;
#             junior tier caches outcome.
import redis, json
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

IDEMP_TTL_S = 24 * 3600                                # 24 hours

def charge_card(idempotency_key: str, amount_cents: int) -> dict:
    ck = f"idemp:charge:{idempotency_key}"
    if not r.set(ck, "1", nx=True, ex=IDEMP_TTL_S):
        # Already processed; for at-least-once we just skip.
        return {"status": "duplicate_skipped"}

    # Do the actual work — this runs exactly once.
    txn_id = _do_charge(amount_cents)
    return {"status": "charged", "txn_id": txn_id}

def _do_charge(amount: int) -> str: ...
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but cache the OUTCOME so the second delivery
#             returns the original result (not just "skipped"); release
#             the claim on transient failure so retry can succeed.
# APPROACH  - Two keys per request: claim ("idemp:claim:KEY") + outcome
#             ("idemp:outcome:KEY"). On transient failure, delete the
#             claim. On success/permanent failure, store outcome.
# STRENGTHS- Replay-safe response — duplicates get the same answer;
#             retries on transient failure work; permanent failures
#             stay permanent.
# WEAKNESSES- Two Redis ops per request; tiny overhead, big correctness
#             win.
import redis, json, time
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

class TransientError(Exception): pass
class PermanentError(Exception): pass

IDEMP_TTL_S = 24 * 3600

def charge_card(idempotency_key: str, amount_cents: int) -> dict:
    claim_key   = f"idemp:claim:charge:{idempotency_key}"
    outcome_key = f"idemp:outcome:charge:{idempotency_key}"

    # Try to claim.
    if not r.set(claim_key, "1", nx=True, ex=IDEMP_TTL_S):
        # Someone else processed (or is processing) this key.
        cached = r.get(outcome_key)
        if cached:
            return json.loads(cached)
        # Claim exists but no outcome yet — caller is mid-flight.
        # In production, wait briefly + retry; intro returns "in_progress".
        return {"status": "in_progress"}

    try:
        txn_id = _do_charge(amount_cents)
    except TransientError as e:
        r.delete(claim_key)                            # release; allow retry
        raise
    except PermanentError as e:
        # Permanent failure — record so duplicates get the same error.
        outcome = {"status": "permanent_failure", "error": str(e)}
        r.set(outcome_key, json.dumps(outcome), ex=IDEMP_TTL_S)
        return outcome
    except Exception:
        r.delete(claim_key)                            # release on unknown
        raise

    outcome = {"status": "charged", "txn_id": txn_id}
    r.set(outcome_key, json.dumps(outcome), ex=IDEMP_TTL_S)
    return outcome

def _do_charge(amount: int) -> str: ...
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: TTL matches redelivery window,
#             Redis-down fallback to in-process map (degraded mode),
#             metrics on dedup rate, reusable decorator.
# APPROACH  - @idempotent decorator; configurable TTL per use case;
#             metrics record claim/cache-hit/miss; if Redis is
#             unreachable, fall through to executing (don't error).
# STRENGTHS - Drop-in for any handler; observable; cache outage just
#             means "no dedup that minute" — no double-charges
#             prevented mathematically only because the broker also
#             retries.
# WEAKNESSES- Redis outage during a duplicate burst = you might
#             double-charge. For payment-grade safety, the work
#             itself must be idempotent at the source (idempotency
#             at the payment provider, not just at our consumer).
import json, functools, redis, structlog
from prometheus_client import Counter
from typing import Callable, Any

log = structlog.get_logger()
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=True)

CLAIMS    = Counter("idemp_claims_total",      "Idempotency outcomes", ["op", "result"])

def idempotent(*, op: str, ttl_s: int = 24 * 3600,
               key_arg: str = "idempotency_key"):
    """Decorator: caller passes an idempotency_key; we dedupe."""
    def deco(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            key = kwargs.get(key_arg)
            if not key:
                CLAIMS.labels(op=op, result="no_key").inc()
                return fn(*args, **kwargs)             # caller didn't ask for dedup

            ck = f"idemp:{op}:{key}"
            ok = f"idemp:{op}:{key}:outcome"

            try:
                if not r.set(ck, "1", nx=True, ex=ttl_s):
                    cached = r.get(ok)
                    if cached:
                        CLAIMS.labels(op=op, result="cache_hit").inc()
                        return json.loads(cached)
                    CLAIMS.labels(op=op, result="in_progress").inc()
                    raise RuntimeError(f"idempotent op {op} key {key} in progress")
            except redis.RedisError as e:
                log.warning("idempotency_redis_unavailable", op=op, error=str(e))
                CLAIMS.labels(op=op, result="redis_down").inc()
                # Degrade open: execute anyway. Counts on the broker not
                # to immediately redeliver while Redis is also down.
                return fn(*args, **kwargs)

            CLAIMS.labels(op=op, result="executed").inc()
            try:
                result = fn(*args, **kwargs)
            except Exception:
                # Release claim so retry can succeed.
                try: r.delete(ck)
                except redis.RedisError: pass
                raise

            try:
                r.set(ok, json.dumps(result), ex=ttl_s)
            except redis.RedisError as e:
                log.warning("idempotency_outcome_save_failed", op=op, error=str(e))
            return result
        return wrapper
    return deco

@idempotent(op="charge", ttl_s=24 * 3600)
def charge_card(*, idempotency_key: str, amount_cents: int) -> dict:
    txn_id = _do_charge(amount_cents)
    return {"status": "charged", "txn_id": txn_id}

def _do_charge(amount: int) -> str: ...

# === TTL choice ===
#   TTL must be >= worst-case redelivery window of your broker.
#   Kafka offset retention default 7 days -> TTL = 7 days.
#   Celery + Redis broker (visibility timeout 1h) -> TTL = 24h.
#   AMQP (no inherent retention) -> TTL = max-age of consumer queue.
#
# Decision rule:
#   any at-least-once consumer        -> idempotency_key + Redis SETNX
#   caller can supply key              -> use it (most APIs / events have an id)
#   no natural key                     -> hash (entity_id, op_type, timestamp)
#   exactly-once at the SOURCE         -> use the source's idempotency (Stripe, etc.)
#                                          rather than just the consumer's
#   ttl                                 -> >= broker redelivery window
#   Redis down                          -> degrade open; document the risk
#   payment / billing                   -> use BOTH consumer dedup AND provider idempotency
#
# Anti-pattern: idempotency by content hash rather than caller-supplied
# key. Two events with the same content but DIFFERENT intent (user
# paid twice for two different orders) collapse into one. Use a key
# the CALLER chose (UUID, request id, order id), not a hash of the
# payload.
```

## Decision Rule

```text
any at-least-once consumer        -> idempotency_key + Redis SETNX
caller can supply key              -> use it (most APIs / events have an id)
no natural key                     -> hash (entity_id, op_type, timestamp)
exactly-once at the SOURCE         -> use the source's idempotency (Stripe, etc.)
                                       rather than just the consumer's
ttl                                 -> >= broker redelivery window
Redis down                          -> degrade open; document the risk
payment / billing                   -> use BOTH consumer dedup AND provider idempotency
```

## Anti-Pattern

> [!warning] Anti-pattern
> idempotency by content hash rather than caller-supplied
> key. Two events with the same content but DIFFERENT intent (user
> paid twice for two different orders) collapse into one. Use a key
> the CALLER chose (UUID, request id, order id), not a hash of the
> payload.

## Tips

- Caller supplies the `idempotency_key` (Stripe/PayPal pattern). Server-side we'd be guessing what counts as "the same call"; the caller knows.
- TTL must be ≥ broker redelivery window. Kafka with 7-day retention → TTL = 7 days. Otherwise the dedup record expires before the duplicate arrives.
- Cache the OUTCOME, not just the claim. A duplicate should return the same response the original got — that's what HTTP idempotency keys promise.
- Release the claim (`r.delete(claim_key)`) on TRANSIENT failure so the retry can succeed. On PERMANENT failure, persist the error as the outcome so duplicates get the same error.
- For Redis-down degraded mode: execute anyway. Two duplicates without dedup is bad; failing the operation entirely is worse. Document the risk and rely on the broker's rate limit + provider idempotency.
- For payment-grade safety, don't rely on consumer-side dedup alone. The PROVIDER (Stripe, etc.) accepts an idempotency key too — pass yours through so even if our consumer dedup misses, the provider deduplicates.

## Common Mistake

> [!warning] Idempotency by content hash rather than a caller-supplied key. Two events with identical content but different INTENT (user pays twice for two different orders) collapse into one — and you fail to charge for the second. Use a key the caller chose (UUID, request id, business-level idempotency key); never a hash of the payload alone.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Hash of payload — collapses legit retries that share content
key = hashlib.sha256(json.dumps(payload).encode()).hexdigest()
```

**Senior:**
```python
# Caller-supplied — explicit and unambiguous
def charge(*, idempotency_key: str, amount: int): ...
# Caller passes UUID per intent.
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/messaging-queues/patterns/_Index|Messaging & Queues → Messaging Patterns — outbox, idempotency, dead-letter]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]
