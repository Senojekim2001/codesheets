---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "graph"
title: "Graph"
category: "Structures"
subtitle: "BFS for shortest path, DFS for connectivity and cycles"
signature_short: "graph = defaultdict(list) | bfs(graph, start) | dfs(graph, start)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Graph"
  - "graph"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Graph

> BFS for shortest path, DFS for connectivity and cycles

## Overview

Graphs are represented in Python as adjacency lists — a dict mapping each node to its list of neighbors. BFS (breadth-first) finds shortest paths in unweighted graphs. DFS (depth-first) detects connectivity, cycles, and topological order.

## Signature

```python
graph = defaultdict(list) | bfs(graph, start) | dfs(graph, start)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Adjacency list as a dict; BFS visit-order
# STRENGTHS - Smallest valid graph code; covers the data layout
# WEAKNESSES- No DFS, no shortest-path
#
from collections import defaultdict, deque

graph: defaultdict[int, list[int]] = defaultdict(list)
for u, v in [(0, 1), (0, 2), (1, 3), (2, 3)]:
    graph[u].append(v)
    graph[v].append(u)                            # undirected: add reverse edge

def bfs(g, start):
    seen, q = {start}, deque([start])
    out = []
    while q:
        n = q.popleft()                           # FIFO -> level by level
        out.append(n)
        for nb in g[n]:
            if nb not in seen:
                seen.add(nb); q.append(nb)
    return out

print(bfs(graph, 0))                              # [0, 1, 2, 3]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - BFS with parent tracking for shortest path; DFS iterative + recursive
# STRENGTHS - The two traversal shapes that solve most graph problems
# WEAKNESSES- No weighted edges; no topological sort
#
from collections import defaultdict, deque

# 1) Shortest path on UNWEIGHTED graph — BFS + parent map (NO path-list copying)
def shortest_path(g, src, dst):
    parent = {src: None}
    q = deque([src])
    while q:
        n = q.popleft()
        if n == dst:                              # reconstruct the path
            path = []
            while n is not None:
                path.append(n); n = parent[n]
            return path[::-1]
        for nb in g[n]:
            if nb not in parent:
                parent[nb] = n
                q.append(nb)
    return None

# 2) DFS — iterative (uses a stack)
def dfs_iter(g, src):
    seen, stack, out = set(), [src], []
    while stack:
        n = stack.pop()                           # right-end pop -> LIFO -> DFS
        if n in seen: continue
        seen.add(n); out.append(n)
        stack.extend(reversed(g[n]))              # reverse so leftmost is visited first
    return out

# 3) DFS — recursive (cleaner for trees / small graphs)
def dfs_rec(g, n, seen=None):
    if seen is None: seen = set()
    seen.add(n)
    for nb in g[n]:
        if nb not in seen:
            dfs_rec(g, nb, seen)
    return seen
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Topological sort, cycle detection, weighted shortest path (Dijkstra)
# STRENGTHS - The patterns that turn DFS/BFS into real algorithms
# WEAKNESSES- N/A
#
import heapq
from collections import defaultdict, deque

# 1) TOPOLOGICAL SORT — Kahn's algorithm (BFS over indegrees)
def topo_sort(n: int, edges: list[tuple[int, int]]) -> list[int] | None:
    g: defaultdict[int, list[int]] = defaultdict(list)
    indeg = [0] * n
    for u, v in edges:
        g[u].append(v); indeg[v] += 1
    q = deque(i for i, d in enumerate(indeg) if d == 0)
    out = []
    while q:
        n_ = q.popleft(); out.append(n_)
        for nb in g[n_]:
            indeg[nb] -= 1
            if indeg[nb] == 0: q.append(nb)
    return out if len(out) == n else None         # None -> cycle present

# 2) CYCLE DETECTION on a DIRECTED graph — three-color DFS
def has_cycle_directed(g):
    WHITE, GRAY, BLACK = 0, 1, 2
    color = defaultdict(lambda: WHITE)
    def dfs(n):
        if color[n] == GRAY: return True          # back-edge -> cycle
        if color[n] == BLACK: return False
        color[n] = GRAY
        for nb in g[n]:
            if dfs(nb): return True
        color[n] = BLACK
        return False
    return any(dfs(n) for n in list(g))

# 3) DIJKSTRA — weighted shortest path; priority queue with stale-entry skip
def dijkstra(g, src):
    dist = {src: 0}
    pq   = [(0, src)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):     # stale; ignore
            continue
        for nb, w in g[node]:
            nd = d + w
            if nd < dist.get(nb, float("inf")):
                dist[nb] = nd
                heapq.heappush(pq, (nd, nb))
    return dist

# 4) Visited DISCIPLINE — the #1 graph bug
#    BFS: mark visited when ENQUEUEING (not when dequeueing); otherwise the
#    same node gets enqueued multiple times -> O(n^2).
#    DFS iterative: check visited AFTER popping is OK; just don't re-explore.

# 5) Recursion limits — Python's default ~1000 frames blows up on big graphs
#    Use iterative DFS, or bump it: sys.setrecursionlimit(10_000)

# Decision rule:
#   shortest path, UNWEIGHTED          -> BFS + parent map
#   shortest path, WEIGHTED (>= 0)      -> Dijkstra (heap)
#   shortest path, NEGATIVE weights      -> Bellman-Ford
#   cycle in directed graph               -> three-color DFS
#   topological order                     -> Kahn's BFS or post-order DFS
#   connected components                   -> DFS / BFS / union-find
#   small dense graph                      -> adjacency MATRIX (n*n bool)
#   big sparse graph                       -> adjacency LIST (default)
#
# Anti-pattern: marking visited when DEQUEUEING in BFS
#   The same node gets pushed multiple times before it's first popped.
#   Mark visited the moment you ENQUEUE — once per node, total.
```

## Decision Rule

```text
shortest path, UNWEIGHTED          -> BFS + parent map
shortest path, WEIGHTED (>= 0)      -> Dijkstra (heap)
shortest path, NEGATIVE weights      -> Bellman-Ford
cycle in directed graph               -> three-color DFS
topological order                     -> Kahn's BFS or post-order DFS
connected components                   -> DFS / BFS / union-find
small dense graph                      -> adjacency MATRIX (n*n bool)
big sparse graph                       -> adjacency LIST (default)
```

## Anti-Pattern

> [!warning] Anti-pattern
> marking visited when DEQUEUEING in BFS
>   The same node gets pushed multiple times before it's first popped.
>   Mark visited the moment you ENQUEUE — once per node, total.

## Tips

- BFS = queue, DFS = stack (or recursion) — this is the single most important graph rule
- Always track `visited` before adding to the queue/stack, not after popping — prevents revisiting
- For directed graphs, do not add the reverse edge when building the adjacency list
- BFS gives the shortest path in unweighted graphs — for weighted graphs, use Dijkstra

## Common Mistake

> [!warning] Adding a node to `visited` when *popping* from the queue instead of when *pushing*. This allows the same node to be added to the queue multiple times, causing O(n²) work.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/dsa/structures/stack|Stack (Data Structures & Algos)]]
- [[Sections/dsa/structures/queue|Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/deque|Deque (Data Structures & Algos)]]
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]
