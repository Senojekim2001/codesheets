---
type: "entry"
domain: "python"
file: "data-engineering"
section: "dask"
id: "dask-distributed"
title: "Dask Distributed — Multi-Machine Execution"
category: "Distributed"
subtitle: "Client(), distributed scheduler, futures, client.submit(), .result()"
signature_short: "Client(scheduler_address)  |  client.submit(func, *args)  |  future.result()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dask Distributed — Multi-Machine Execution"
  - "dask-distributed"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/dask"
  - "category/distributed"
  - "tier/tiered"
---

# Dask Distributed — Multi-Machine Execution

> Client(), distributed scheduler, futures, client.submit(), .result()

## Overview

Dask Distributed provides a cluster scheduler — run tasks across multiple machines. Client connects to a scheduler; workers execute tasks. client.submit() submits a task and returns a Future (async result). .result() blocks and waits for completion. Use for scaling out Dask workflows to multiple nodes, reducing execution time for large datasets.

## Signature

```python
Client(scheduler_address)  |  client.submit(func, *args)  |  future.result()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - LocalCluster for laptops; Client; submit one function
# STRENGTHS - Smallest valid distributed setup; runs on one machine
# WEAKNESSES- No futures, no remote cluster, no shutdown discussion
#
from dask.distributed import Client, LocalCluster

cluster = LocalCluster(n_workers=2, threads_per_worker=2)
client  = Client(cluster)
print(client)                                # dashboard URL printed

future = client.submit(lambda x: x * x, 5)
print(future.result())                       # 25

client.close(); cluster.close()              # always tear down
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - submit + gather, as_completed, map-reduce, context manager
# STRENGTHS - The four patterns you'll use across most distributed Dask code
# WEAKNESSES- No remote scheduler, no resource specs
#
from dask.distributed import Client, as_completed

with Client(n_workers=4, threads_per_worker=2) as client:
    # 1) submit returns a Future (non-blocking)
    futures = [client.submit(lambda x: x * 2, i) for i in range(10)]

    # 2) gather blocks until ALL are done
    print(client.gather(futures))                          # [0, 2, 4, ..., 18]

    # 3) as_completed yields Futures as they finish — start downstream work earlier
    for f in as_completed(futures):
        print("done:", f.result())

    # 4) Map / reduce — parallel map, then a single reduce step
    chunks = [[1,2,3], [4,5,6], [7,8,9]]
    chunk_sums = client.map(sum, chunks)                   # vectorized submit
    total = sum(client.gather(chunk_sums))                 # reduce on the driver
    print("total:", total)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Remote clusters, scatter, resource-tagged tasks, error handling, observability
# STRENGTHS - The patterns that make distributed Dask production-grade
# WEAKNESSES- N/A
#
from dask.distributed import Client, as_completed, fire_and_forget
import dask

# 1) Connect to a REMOTE scheduler — same code as local
# client = Client("tcp://scheduler.internal:8786")
client = Client(n_workers=4, threads_per_worker=2)         # local for the demo

# 2) Scatter — broadcast LARGE shared data ONCE per worker, not per task
big_lookup = {i: i * 10 for i in range(1_000_000)}
shared = client.scatter(big_lookup, broadcast=True)         # one network copy per worker

def lookup(key, table):                                     # closure-friendly signature
    return table.get(key, -1)

futures = [client.submit(lookup, k, shared) for k in range(100)]
print(client.gather(futures)[:5])

# 3) Resource-tagged tasks — pin GPU work to GPU workers
#    Workers started with: dask-worker scheduler:8786 --resources "GPU=1"
def gpu_inference(x):    return x * 2
gpu_futures = [client.submit(gpu_inference, x, resources={"GPU": 1}) for x in range(8)]

# 4) Error handling — Future.result() re-raises the worker exception in the driver
def maybe_fail(x):
    if x == 7: raise ValueError("nope")
    return x

futs = [client.submit(maybe_fail, i) for i in range(10)]
for f in as_completed(futs):
    try:
        print(f.result())
    except Exception as e:
        print("task failed:", e)                            # stays running for the rest

# 5) Fire-and-forget — submit work that doesn't need a return value
fire_and_forget(client.submit(lambda: write_metric("ok"), pure=False))

# 6) Observability — the dashboard is a real production tool
print("Dashboard:", client.dashboard_link)                  # http://...:8787

client.close()

# Decision rule:
#   one machine, prototype                  -> Client(n_workers=N)  (LocalCluster)
#   prod on one node, GIL-bound CPU         -> processes; threads_per_worker=1
#   multi-node                                -> dask-scheduler + dask-worker; client.connect to URL
#   shared big lookup table                   -> client.scatter(..., broadcast=True)
#   GPU / specialized workers                 -> --resources tag + submit(resources={...})
#   stream of results                          -> as_completed (start downstream early)
#   "fire and forget" job                      -> fire_and_forget; the driver can exit
#
# Anti-pattern: hammering the cluster with millions of tiny submits
#   Scheduler overhead dominates; throughput plummets. Batch into chunks of
#   ~1000 items, OR use dask.bag / dask.dataframe with proper partition sizes.

def write_metric(_): pass
```

## Decision Rule

```text
one machine, prototype                  -> Client(n_workers=N)  (LocalCluster)
prod on one node, GIL-bound CPU         -> processes; threads_per_worker=1
multi-node                                -> dask-scheduler + dask-worker; client.connect to URL
shared big lookup table                   -> client.scatter(..., broadcast=True)
GPU / specialized workers                 -> --resources tag + submit(resources={...})
stream of results                          -> as_completed (start downstream early)
"fire and forget" job                      -> fire_and_forget; the driver can exit
```

## Anti-Pattern

> [!warning] Anti-pattern
> hammering the cluster with millions of tiny submits
>   Scheduler overhead dominates; throughput plummets. Batch into chunks of
>   ~1000 items, OR use dask.bag / dask.dataframe with proper partition sizes.

## Tips

- Use LocalCluster() for testing locally; for production, deploy scheduler + workers across machines.
- client.submit() returns a Future immediately (non-blocking) — use .result() to wait or as_completed() to process as ready.
- client.gather() collects results from multiple futures — blocks until all complete.
- Use map_partitions() with Dask DataFrames before Distributed for most tasks — Distributed is for custom Python logic.

## Common Mistake

> [!warning] Submitting huge numbers of tiny tasks — creates overhead. Batch them or partition data first.

## Shorthand (Junior → Senior)

**Junior:**
```python
from dask.distributed import Client, LocalCluster
cluster = LocalCluster(n_workers=4)
client = Client(cluster)
futures = [client.submit(func, arg) for arg in args]
results = client.gather(futures)
```

**Senior:**
```python
client = Client()  # Connect to running cluster
results = client.gather([client.submit(func, arg) for arg in args])
```

## See Also

- [[Sections/data-engineering/dask/dask-dataframe|Dask DataFrames — Lazy Distributed Data (Data Engineering)]]
- [[Sections/data-engineering/dask/dask-delayed|Dask Delayed — Task Graphs for Custom Logic (Data Engineering)]]
- [[Sections/data-engineering/dask/_Index|Data Engineering → Dask — Distributed Computing]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]
