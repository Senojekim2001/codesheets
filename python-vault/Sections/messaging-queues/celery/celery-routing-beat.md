---
type: "entry"
domain: "python"
file: "messaging-queues"
section: "celery"
id: "celery-routing-beat"
title: "Celery routing & beat — queues, priorities, scheduled tasks"
category: "Celery"
subtitle: "task_routes, -Q queue_name, beat_schedule, crontab, django-celery-beat (DB-backed), redbeat (Redis-backed), priority queues"
signature_short: "app.conf.task_routes = {\"email.*\": {\"queue\": \"email\"}}
app.conf.beat_schedule = {\"daily-report\": {\"task\": \"...\", \"schedule\": crontab(hour=2)}}"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Celery routing & beat — queues, priorities, scheduled tasks"
  - "celery-routing-beat"
tags:
  - "python"
  - "python/messaging-queues"
  - "python/messaging-queues/celery"
  - "category/celery"
  - "tier/tiered"
---

# Celery routing & beat — queues, priorities, scheduled tasks

> task_routes, -Q queue_name, beat_schedule, crontab, django-celery-beat (DB-backed), redbeat (Redis-backed), priority queues

## Overview

A real Celery deployment has multiple queues — `email` (slow I/O), `cpu_heavy` (image processing), `urgent` (priority work) — each with its own workers. Routing rules send tasks to the right queue; per-queue concurrency tunes parallelism. Beat is the scheduler: cron-style recurring tasks via `crontab(hour=2)` or interval via `every 5 minutes`. The default file-based beat scheduler doesn't coordinate across instances; for HA you need `django-celery-beat` (DB-backed) or `redbeat` (Redis-backed) so multiple beat schedulers don't double-fire. The three examples solve the SAME concrete task — route the email task to a dedicated worker AND schedule a daily report task at 02:00 UTC, surviving beat-instance restarts — at three depths: per-task `queue=` argument → `task_routes` dict + `beat_schedule` with `crontab` → production with redbeat for HA, priority queues, and per-queue worker tuning.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Route the email task to a dedicated worker; run a daily report task at 02:00 UTC.
- **Junior** — SAME — but use task_routes for declarative routing (caller-side queue= becomes optional); add per-queue concurrency tuning.
- **Senior** — SAME — production: redbeat for HA-capable scheduler, priority queues for urgent tasks, comprehensive routing with conditional logic.

## Signature

```python
app.conf.task_routes = {"email.*": {"queue": "email"}}
app.conf.beat_schedule = {"daily-report": {"task": "...", "schedule": crontab(hour=2)}}
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Route the email task to a dedicated worker; run a daily
#             report task at 02:00 UTC.
# APPROACH  - apply_async with queue= for routing; beat_schedule
#             dict for the cron-style schedule.
# STRENGTHS - Two-line schedule; works for one beat instance.
# WEAKNESSES- Default beat scheduler is file-based and not HA — junior
#             tier adds task_routes (cleaner) and senior moves to redbeat.
from celery import Celery
from celery.schedules import crontab

app = Celery("myapp", broker="redis://localhost:6379/0")

# === Tasks ===
@app.task(name="email.send")
def send_email(to: str, subject: str): ...

@app.task(name="reports.daily")
def daily_report(): ...

# === Routing — at call site (intro tier) ===
def enqueue_email(to: str, subject: str):
    # Send to the 'email' queue, not the default.
    send_email.apply_async(args=[to, subject], queue="email")

# === Beat schedule — recurring tasks ===
app.conf.beat_schedule = {
    "daily-report-2am-utc": {
        "task": "reports.daily",
        "schedule": crontab(hour=2, minute=0),       # every day at 02:00 UTC
        "options": {"queue": "reports"},              # route the scheduled task too
    },
}
app.conf.timezone = "UTC"

# === Run ===
# Worker for email queue:
#   $ celery -A myapp worker -Q email --concurrency=4
# Worker for reports queue:
#   $ celery -A myapp worker -Q reports --concurrency=1
# Beat scheduler (one instance, in production needs HA — see senior tier):
#   $ celery -A myapp beat --loglevel=info
#
# Behavior:
#   send_email.apply_async(..., queue="email")
#     -> message lands on 'email' queue
#     -> only the worker subscribed to -Q email picks it up
#   At 02:00 UTC daily, beat enqueues 'reports.daily' on 'reports' queue.

# Multiple queues per worker — also fine:
#   $ celery -A myapp worker -Q email,reports --concurrency=4
# This worker handles both; useful for low-traffic queues.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use task_routes for declarative routing
#             (caller-side queue= becomes optional); add per-queue
#             concurrency tuning.
# APPROACH  - task_routes maps task names (with wildcards) to queues;
#             worker -Q + --concurrency tunes per queue; max-tasks-per-
#             child bounds memory growth.
# STRENGTHS- Routing decisions live in config (one place to audit);
#             callers don't need to remember queue names.
# WEAKNESSES- Default beat scheduler is still single-instance; senior
#             tier moves to redbeat for HA.
from celery import Celery
from celery.schedules import crontab

app = Celery("myapp", broker="redis://localhost:6379/0")

# === Declarative routing ===
app.conf.task_routes = {
    "email.*":      {"queue": "email"},
    "reports.*":    {"queue": "reports"},
    "cpu_heavy.*":  {"queue": "cpu_heavy"},
    # Default queue catches anything not matching above.
}
app.conf.task_default_queue = "default"

# === Beat schedule ===
app.conf.beat_schedule = {
    "daily-report-utc-02": {
        "task": "reports.daily",
        "schedule": crontab(hour=2, minute=0),
    },
    "hourly-cleanup": {
        "task": "cleanup.expire_sessions",
        "schedule": crontab(minute=15),               # every hour at HH:15
    },
    "every-5-min-healthcheck": {
        "task": "ops.healthcheck_external_api",
        "schedule": 300.0,                             # every 300 seconds
    },
}
app.conf.timezone = "UTC"

# === Tasks ===
@app.task(name="email.send")
def send_email(to: str, subject: str): ...

@app.task(name="reports.daily")
def daily_report(): ...

@app.task(name="cpu_heavy.transform_image")
def transform_image(image_id: int): ...

# Now callers don't pass queue=; task_routes handles it:
#   send_email.delay("a@b.com", "Hi")        # auto -> 'email' queue
#   transform_image.delay(42)                # auto -> 'cpu_heavy' queue

# === Per-queue worker tuning ===
# 'email' is I/O-bound (SMTP calls); high concurrency.
#   $ celery -A myapp worker -Q email --concurrency=16 \
#       --prefetch-multiplier=4
#
# 'cpu_heavy' is CPU-bound; concurrency = number of cores.
#   $ celery -A myapp worker -Q cpu_heavy --concurrency=4 \
#       --prefetch-multiplier=1 \
#       --max-tasks-per-child=10
#
# 'reports' runs once a day; minimal concurrency.
#   $ celery -A myapp worker -Q reports --concurrency=1
#
# Tuning notes:
#   --concurrency       - number of sub-processes
#                         I/O-bound: 2-16× cores; CPU-bound: == cores
#   --prefetch-multiplier - how many tasks each worker grabs ahead.
#                         Long tasks: 1; short tasks: 4-8.
#   --max-tasks-per-child - recycle worker after N tasks; bounds
#                         memory leaks (similar to gunicorn --max-requests)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: redbeat for HA-capable scheduler,
#             priority queues for urgent tasks, comprehensive routing
#             with conditional logic.
# APPROACH  - redbeat puts beat schedule in Redis; multiple beat
#             instances can run safely (election + lease ensures
#             single-fire). Priority via separate queues that workers
#             consume in order.
# STRENGTHS - Beat scheduler isn't a SPOF; urgent tasks bypass
#             slow ones; routing handles complex cases.
# WEAKNESSES- redbeat adds a Redis dep (already there) + an election
#             lease to manage. Priority queues need careful naming.
from celery import Celery
from celery.schedules import crontab
from kombu import Queue

# pip install celery-redbeat
# https://github.com/sibson/redbeat

app = Celery("myapp",
             broker="redis://localhost:6379/0",
             backend="redis://localhost:6379/1")

# === Redbeat — HA scheduler ===
# Multiple beat instances run safely; redbeat's lock ensures only
# one is "active" at a time. Schedules live in Redis under redbeat:*
# keys; reload at runtime by writing new keys.
app.conf.beat_scheduler = "redbeat.RedBeatScheduler"
app.conf.redbeat_redis_url = "redis://localhost:6379/0"
app.conf.redbeat_lock_timeout = 90                    # election TTL

# === Priority queues ===
# Workers consume queues in ORDER given; tasks on 'urgent' beat
# tasks on 'default'. Each queue is a separate Redis list under the hood.
app.conf.task_queues = (
    Queue("urgent",   routing_key="urgent.#"),
    Queue("default",  routing_key="default.#"),
    Queue("reports",  routing_key="reports.#"),
    Queue("email",    routing_key="email.#"),
    Queue("cpu_heavy", routing_key="cpu_heavy.#"),
    Queue("dlq",      routing_key="dlq.#"),
)

app.conf.task_routes = {
    "urgent.*":     {"queue": "urgent",    "routing_key": "urgent.task"},
    "email.*":      {"queue": "email",     "routing_key": "email.task"},
    "reports.*":    {"queue": "reports",   "routing_key": "reports.task"},
    "cpu_heavy.*":  {"queue": "cpu_heavy", "routing_key": "cpu_heavy.task"},
}
app.conf.task_default_queue = "default"

# === Schedule (managed via redbeat at runtime, also init here) ===
app.conf.beat_schedule = {
    "daily-report-utc-02": {
        "task": "reports.daily",
        "schedule": crontab(hour=2, minute=0),
    },
    "weekly-cleanup-monday-01": {
        "task": "cleanup.weekly",
        "schedule": crontab(hour=1, minute=0, day_of_week="monday"),
    },
    "every-5-min-healthcheck": {
        "task": "ops.healthcheck",
        "schedule": 300.0,
    },
}
app.conf.timezone = "UTC"

# === Worker invocation — production ===
# Urgent + default worker (one consumes urgent first):
#   $ celery -A myapp worker -Q urgent,default \
#       --concurrency=8 --prefetch-multiplier=4 \
#       --max-tasks-per-child=1000
#
# Email worker:
#   $ celery -A myapp worker -Q email --concurrency=16 \
#       --prefetch-multiplier=4 --max-tasks-per-child=1000
#
# CPU-heavy worker (separate machine ideally):
#   $ celery -A myapp worker -Q cpu_heavy --concurrency=4 \
#       --prefetch-multiplier=1 --max-tasks-per-child=10
#
# Beat scheduler (multiple instances OK with redbeat):
#   $ celery -A myapp beat --scheduler=redbeat.RedBeatScheduler \
#       --loglevel=info
#
# DLQ worker:
#   $ celery -A myapp worker -Q dlq --concurrency=1

# === Dynamic schedule manipulation (redbeat) ===
# At runtime, add/remove/modify schedules without restarting beat:
from redbeat import RedBeatSchedulerEntry
from celery.schedules import crontab

def add_user_scheduled_task(user_id: int, schedule_cron: str):
    """e.g., user wants a daily 09:00 UTC summary email."""
    parts = schedule_cron.split()                      # "0 9 * * *"
    sched = crontab(minute=parts[0], hour=parts[1])
    entry = RedBeatSchedulerEntry(
        name=f"user-{user_id}-daily-summary",
        task="reports.user_summary",
        schedule=sched,
        args=[user_id],
        app=app,
    )
    entry.save()                                       # writes to Redis; beat picks up

def remove_user_scheduled_task(user_id: int):
    entry = RedBeatSchedulerEntry.from_key(
        f"redbeat:user-{user_id}-daily-summary", app=app)
    entry.delete()

# Decision rule:
#   single queue, single worker        -> default queue + default scheduler
#   I/O-bound vs CPU-bound mix          -> separate queues; per-queue concurrency
#   tasks must run urgently             -> priority queue consumed first
#   slow + fast tasks together         -> separate queues; slow can't block fast
#   recurring tasks                     -> beat_schedule; crontab for cron-style
#   one beat instance is single-point   -> redbeat for HA
#   per-tenant schedules                -> redbeat dynamic entries; manage at runtime
#   long-tail of rare tasks            -> single 'default' queue catches all
#   different machines per queue        -> separate worker fleets; -Q name per fleet
#   prefetch tuning                     -> long tasks: 1; short tasks: 4-8
#   memory leaks in workers            -> --max-tasks-per-child=N
#   need cluster-wide visibility       -> Flower OR celery-prometheus-exporter
#   timezone                            -> always set; UTC is least surprising
#   schedule timezone vs server clock   -> set timezone in conf; cron uses that
#
# Anti-pattern: running multiple celery beat instances WITHOUT redbeat
# (or django-celery-beat). Default scheduler is file-based and per-
# instance; if you run two beat processes, they both fire every
# scheduled task — duplicate work, possibly conflicting state. For
# any HA deployment, switch to redbeat (Redis-backed) or
# django-celery-beat (DB-backed); both ensure single-fire across
# multiple beat instances.
```

## Decision Rule

```text
single queue, single worker        -> default queue + default scheduler
I/O-bound vs CPU-bound mix          -> separate queues; per-queue concurrency
tasks must run urgently             -> priority queue consumed first
slow + fast tasks together         -> separate queues; slow can't block fast
recurring tasks                     -> beat_schedule; crontab for cron-style
one beat instance is single-point   -> redbeat for HA
per-tenant schedules                -> redbeat dynamic entries; manage at runtime
long-tail of rare tasks            -> single 'default' queue catches all
different machines per queue        -> separate worker fleets; -Q name per fleet
prefetch tuning                     -> long tasks: 1; short tasks: 4-8
memory leaks in workers            -> --max-tasks-per-child=N
need cluster-wide visibility       -> Flower OR celery-prometheus-exporter
timezone                            -> always set; UTC is least surprising
schedule timezone vs server clock   -> set timezone in conf; cron uses that
```

## Anti-Pattern

> [!warning] Anti-pattern
> running multiple celery beat instances WITHOUT redbeat
> (or django-celery-beat). Default scheduler is file-based and per-
> instance; if you run two beat processes, they both fire every
> scheduled task — duplicate work, possibly conflicting state. For
> any HA deployment, switch to redbeat (Redis-backed) or
> django-celery-beat (DB-backed); both ensure single-fire across
> multiple beat instances.

## Tips

- Use `task_routes` for declarative routing — callers don't need to remember queue names. Wildcards (`"email.*"`) match by task name prefix.
- Separate I/O-bound and CPU-bound work into different queues with different concurrency. I/O can have `--concurrency=16`; CPU should be `==` cores.
- `--prefetch-multiplier=1` for slow tasks; `4-8` for fast tasks. Default of 4 means each worker grabs 4 tasks ahead — bad if tasks are slow (long task hogs 4 slots).
- `--max-tasks-per-child=N` recycles worker subprocesses after N tasks. Bounds memory leaks (analogous to gunicorn `--max-requests`). Set to 100-1000 depending on task memory.
- For recurring tasks, the file-based beat scheduler is single-instance only. For HA, use `redbeat` (Redis-backed) or `django-celery-beat` (DB-backed).
- Always set `app.conf.timezone = "UTC"`. Without it, crontab schedules use the worker's system timezone, which causes chaos when workers run in different regions.

## Common Mistake

> [!warning] Running multiple `celery beat` instances WITHOUT redbeat or django-celery-beat. The default scheduler is file-based and per-instance; two beat processes both fire every scheduled task — duplicate work, conflicting state, hourly emails sent twice. For any HA setup, switch to redbeat (Redis) or django-celery-beat (DB) — both ensure single-fire across instances.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Two beat instances, default scheduler — duplicate fires
$ celery -A myapp beat       # instance 1
$ celery -A myapp beat       # instance 2 — fires the same tasks!
```

**Senior:**
```python
# Redbeat — multiple beat instances coordinate via Redis
app.conf.beat_scheduler = "redbeat.RedBeatScheduler"
$ celery -A myapp beat --scheduler=redbeat.RedBeatScheduler
```

## See Also

- [[Sections/messaging-queues/celery/celery-tasks|Celery tasks — define, enqueue, retrieve results (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/celery-retries|Celery retries — backoff, dead-letter, idempotency (Messaging & Queues)]]
- [[Sections/messaging-queues/celery/_Index|Messaging & Queues → Celery — task queues, retries, scheduling]]
- [[Sections/messaging-queues/_Index|Messaging & Queues index]]
- [[_Index|Vault index]]
