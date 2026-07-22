---
type: "entry"
domain: "python"
file: "data-engineering"
section: "dask"
id: "dask-delayed"
title: "Dask Delayed — Task Graphs for Custom Logic"
category: "Distributed"
subtitle: "@dask.delayed, task dependencies, dask.compute(), task graphs"
signature_short: "@dask.delayed  |  delayed_result = func(arg)  |  dask.compute(*results)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dask Delayed — Task Graphs for Custom Logic"
  - "dask-delayed"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/dask"
  - "category/distributed"
  - "tier/tiered"
---

# Dask Delayed — Task Graphs for Custom Logic

> @dask.delayed, task dependencies, dask.compute(), task graphs

## Overview

Dask.delayed turns Python functions into lazy tasks that build a DAG (task graph). @dask.delayed wraps functions so they don't execute immediately — instead, they return Delayed objects. Chain calls to build a computation graph. dask.compute() executes the full graph in parallel. Useful for custom Python logic, ML pipelines, and heterogeneous workflows.

## Signature

```python
@dask.delayed  |  delayed_result = func(arg)  |  dask.compute(*results)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - @dask.delayed makes a function lazy; dask.compute runs the graph
# STRENGTHS - The minimum: a function, two inputs, parallel execution
# WEAKNESSES- No dependency between tasks; no graph visualization
#
import dask
from dask import delayed

@delayed
def square(x):
    return x * x

results = dask.compute(square(2), square(3), square(5))   # runs in parallel
print(results)                                             # (4, 9, 25)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Build a multi-step graph (load -> transform -> save), run once
# STRENGTHS - Shows how delayed functions compose into a DAG
# WEAKNESSES- Doesn't cover meta inference / type traps
#
import dask
from dask import delayed

@delayed
def load(path):           # I/O
    return {"path": path, "rows": [1, 2, 3]}

@delayed
def transform(d):         # CPU
    return {**d, "rows": [r * 2 for r in d["rows"]]}

@delayed
def save(d, out):
    return f"wrote {len(d['rows'])} rows to {out}"

# Build the graph — nothing runs yet
files = ["a.csv", "b.csv", "c.csv"]
graph = [save(transform(load(p)), p.replace(".csv", ".out")) for p in files]

# ONE compute() runs the whole graph in parallel, scheduling I/O + CPU as it can
print(dask.compute(*graph))

# Inspect the DAG (requires graphviz)
# graph[0].visualize(filename="dag.png")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When delayed is right; pure tasks; caching; pitfalls; vs concurrent.futures
# STRENGTHS - Captures the design rules that separate Dask from a thread pool
# WEAKNESSES- N/A
#
import dask
from dask import delayed
from dask.distributed import Client

# 1) Make tasks PURE — same inputs -> same outputs, no global mutation.
#    Dask freely re-runs tasks on retry / scheduler failover.
@delayed(pure=True)                                   # results are cacheable
def fetch(url):
    return {"url": url, "body": "..."}                # no global side-effects

# 2) Pass primitive args; avoid huge unpicklable objects (open file handles, locks)
#    Bad:  delayed(process)(open(path))
#    Good: delayed(process)(path)                       # let the worker open it

# 3) Composition: tasks reference other tasks, not raw values.
@delayed
def parse(raw):                  return {"size": len(raw["body"])}
@delayed
def aggregate(parses):           return sum(p["size"] for p in parses)

urls = ["a", "b", "c"]
graph = aggregate([parse(fetch(u)) for u in urls])

# 4) Switch from threads to processes / cluster by changing the scheduler — no code changes
with Client(n_workers=8):
    total = graph.compute()                            # parallel across processes
# OR: dask.compute(graph, scheduler="threads")          # threads (default for delayed)
# OR: dask.compute(graph, scheduler="processes")        # bypass GIL on CPU work

# 5) Mix delayed with dask.dataframe — BUT prefer dataframe ops when the data is tabular
#    Use delayed for HETEROGENEOUS workflows (API + DB + ML model) that don't fit a frame.

# Decision rule:
#   independent tasks, simple parallel       -> concurrent.futures.ThreadPoolExecutor
#   tasks form a DAG (deps between them)      -> @dask.delayed
#   tabular data                                -> dask.dataframe (or Polars / Spark)
#   hundreds of thousands of tiny tasks        -> batch them; Dask scheduler overhead is real
#   need cluster execution                      -> @dask.delayed + dask.distributed.Client
#   Python function with side effects           -> stop; refactor to be pure first
#
# Anti-pattern: calling a delayed function the same way as a normal one
#   result = transform(load("a.csv")).result()        # forgot dask.compute()
#   You're holding Delayed objects; nothing has run. Either dask.compute() the
#   final node, or call .compute() on the leaf you want.
```

## Decision Rule

```text
independent tasks, simple parallel       -> concurrent.futures.ThreadPoolExecutor
tasks form a DAG (deps between them)      -> @dask.delayed
tabular data                                -> dask.dataframe (or Polars / Spark)
hundreds of thousands of tiny tasks        -> batch them; Dask scheduler overhead is real
need cluster execution                      -> @dask.delayed + dask.distributed.Client
Python function with side effects           -> stop; refactor to be pure first
```

## Anti-Pattern

> [!warning] Anti-pattern
> calling a delayed function the same way as a normal one
>   result = transform(load("a.csv")).result()        # forgot dask.compute()
>   You're holding Delayed objects; nothing has run. Either dask.compute() the
>   final node, or call .compute() on the leaf you want.

## Tips

- @delayed turns any Python function into a task — no special syntax needed inside the function.
- Chain delayed calls to build the DAG — the structure becomes the execution plan.
- dask.compute(*delayed_objects) executes all tasks in optimal order, parallelizing independent tasks.
- Use @delayed for heterogeneous workflows: ML, API calls, custom Python logic. For data, use dask.dataframe or dask.bag.

## Common Mistake

> [!warning] Calling the delayed function directly instead of using the returned Delayed object — causes immediate execution instead of lazy scheduling.

## Shorthand (Junior → Senior)

**Junior:**
```python
@delayed
def process(x):
    return x * 2

result1 = process(10)
result2 = process(20)
output1, output2 = dask.compute(result1, result2)
```

**Senior:**
```python
@delayed
def process(x): return x * 2
dask.compute(process(10), process(20))
```

## See Also

- [[Sections/data-engineering/dask/dask-dataframe|Dask DataFrames — Lazy Distributed Data (Data Engineering)]]
- [[Sections/data-engineering/dask/dask-distributed|Dask Distributed — Multi-Machine Execution (Data Engineering)]]
- [[Sections/data-engineering/dask/_Index|Data Engineering → Dask — Distributed Computing]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]
