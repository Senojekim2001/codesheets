---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "networkx"
id: "networkx-graphs-paths"
title: "nx.Graph / DiGraph / shortest_path / centrality"
category: "networkx"
subtitle: "nx.Graph (undirected) / DiGraph (directed) / MultiGraph (parallel edges), add_node / add_edge (weight=), shortest_path (Dijkstra default; weight=) and shortest_path_length, connected_components / strongly_connected_components, pagerank, betweenness_centrality, scale ceiling ~50-100k nodes (then igraph or graph-tool)"
signature_short: "g = nx.Graph(); g.add_edge(\"a\",\"b\", weight=2); nx.shortest_path(g, \"a\", \"b\", weight=\"weight\"); nx.pagerank(g)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nx.Graph / DiGraph / shortest_path / centrality"
  - "networkx-graphs-paths"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/networkx"
  - "category/networkx"
  - "tier/tiered"
---

# nx.Graph / DiGraph / shortest_path / centrality

> nx.Graph (undirected) / DiGraph (directed) / MultiGraph (parallel edges), add_node / add_edge (weight=), shortest_path (Dijkstra default; weight=) and shortest_path_length, connected_components / strongly_connected_components, pagerank, betweenness_centrality, scale ceiling ~50-100k nodes (then igraph or graph-tool)

## Overview

Build a graph by adding edges; nodes are inferred. Edge attributes are kwargs (`weight=`, `color=`, anything). Algorithms accept a `weight=attribute_name` argument — Dijkstra over weighted edges, PageRank with edge weights, etc. Three depths solve the SAME task — find the shortest path between two cities through a road network — at depths: unweighted graph + `shortest_path` → weighted graph (km) + Dijkstra → directed graph with travel time, multi-source `single_source_dijkstra_path_length` for "everywhere reachable in 30 min".

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find the shortest (fewest hops) path from A to D.
- **Junior** — SAME — A to D — but with weighted edges (km between cities).
- **Senior** — SAME — shortest path on a road network — production: directed graph (one-way streets), travel-time weights, multi-source "isochrone" (everywhere reachable in <= 30 min), centrality on the travel-time graph for hub identification.

## Signature

```python
g = nx.Graph(); g.add_edge("a","b", weight=2); nx.shortest_path(g, "a", "b", weight="weight"); nx.pagerank(g)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find the shortest (fewest hops) path from A to D.
# APPROACH  - Undirected nx.Graph + nx.shortest_path (BFS by default).
# STRENGTHS - Three lines.
# WEAKNESSES- Hop-count, not distance; "shortest" rarely means "fewest hops".
import networkx as nx

g = nx.Graph()
g.add_edges_from([("A", "B"), ("B", "C"), ("C", "D"), ("A", "D")])
print(nx.shortest_path(g, "A", "D"))                  # ['A', 'D'] - direct edge wins
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — A to D — but with weighted edges (km between cities).
# APPROACH  - add_edge(weight=...); shortest_path(weight="weight").
# STRENGTHS - Real distance-based shortest path (Dijkstra).
# WEAKNESSES- Undirected; doesn't model one-way streets.
import networkx as nx

g = nx.Graph()
edges = [
    ("A", "B", 5),
    ("B", "C", 4),
    ("C", "D", 2),
    ("A", "D", 12),                                   # direct but longer
    ("B", "D", 7),
]
for u, v, w in edges:
    g.add_edge(u, v, weight=w)

path = nx.shortest_path(g, "A", "D", weight="weight")
dist = nx.shortest_path_length(g, "A", "D", weight="weight")
print(path, "total km:", dist)                        # ['A', 'B', 'C', 'D']  total: 11
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — shortest path on a road network — production: directed
#             graph (one-way streets), travel-time weights, multi-source
#             "isochrone" (everywhere reachable in <= 30 min), centrality
#             on the travel-time graph for hub identification.
# APPROACH  - DiGraph with travel_time per edge; single_source_dijkstra
#             gives the isochrone; betweenness_centrality finds bottlenecks.
# STRENGTHS - Real-world directed/weighted modeling; reusable analyses.
# WEAKNESSES- > ~50k nodes -> igraph or graph-tool (10-100x faster).
from __future__ import annotations
import networkx as nx
from typing import Iterable


def build_road_network(edges: Iterable[tuple[str, str, float]]) -> nx.DiGraph:
    """edges: (origin, destination, travel_time_minutes). One-way edges only."""
    g = nx.DiGraph()
    for u, v, t in edges:
        g.add_edge(u, v, travel_time=t)
    return g


def isochrone(g: nx.DiGraph, origin: str, max_minutes: float) -> dict[str, float]:
    """All nodes reachable from origin within max_minutes -> {node: time}."""
    return nx.single_source_dijkstra_path_length(
        g, origin, cutoff=max_minutes, weight="travel_time",
    )


def hubs(g: nx.DiGraph, k: int = 5) -> list[tuple[str, float]]:
    """Top-k nodes by travel-time-weighted betweenness centrality."""
    bc = nx.betweenness_centrality(g, weight="travel_time", normalized=True)
    return sorted(bc.items(), key=lambda kv: kv[1], reverse=True)[:k]


# --- Demo ---
edges = [
    ("A", "B", 5),  ("B", "A", 5),
    ("B", "C", 8),  ("C", "B", 8),
    ("C", "D", 3),                                    # one-way!
    ("A", "D", 25),
    ("B", "D", 12), ("D", "B", 12),
    ("D", "E", 4),  ("E", "D", 4),
]
g = build_road_network(edges)

print("shortest A -> D:", nx.shortest_path(g, "A", "D", weight="travel_time"),
      "time:", nx.shortest_path_length(g, "A", "D", weight="travel_time"))

# Everywhere reachable from A within 20 minutes:
iso = isochrone(g, "A", 20.0)
print("20-min isochrone from A:", iso)

# Top-3 hub nodes by betweenness on travel time:
print("top hubs:", hubs(g, k=3))

# Decision rule:
#   < 50k nodes, productivity over speed              -> NetworkX (Pythonic API).
#   100k-10M nodes                                     -> igraph (C core, Python bindings).
#   10M+ nodes / billion edges                         -> graph-tool (C++ + OpenMP) or
#                                                       cuGraph (GPU).
#   Need shortest path                                 -> nx.shortest_path(weight=).
#   All-pairs shortest paths                            -> nx.floyd_warshall_numpy
#                                                       (dense; O(n^3 * 8 bytes)).
#   Weighted PageRank / centrality                     -> nx.pagerank / betweenness_centrality
#                                                       with weight=.
#   Communities                                         -> nx.community.louvain_communities (3.x)
#                                                       or python-louvain.
#   Persist a graph                                     -> nx.write_gpickle / write_gml /
#                                                       write_graphml; for parquet, use NetworkX
#                                                       to_pandas_edgelist.

# Anti-pattern:
#   for i in range(1_000_000):
#       g.add_edge(...)                              # NetworkX nodes are dicts of dicts
# 1M edges in NetworkX easily takes 10 GB and 5 minutes. For that scale,
# build with igraph (g = ig.Graph(edges=edges)) or graph-tool.
```

## Decision Rule

```text
< 50k nodes, productivity over speed              -> NetworkX (Pythonic API).
100k-10M nodes                                     -> igraph (C core, Python bindings).
10M+ nodes / billion edges                         -> graph-tool (C++ + OpenMP) or
                                                    cuGraph (GPU).
Need shortest path                                 -> nx.shortest_path(weight=).
All-pairs shortest paths                            -> nx.floyd_warshall_numpy
                                                    (dense; O(n^3 * 8 bytes)).
Weighted PageRank / centrality                     -> nx.pagerank / betweenness_centrality
                                                    with weight=.
Communities                                         -> nx.community.louvain_communities (3.x)
                                                    or python-louvain.
Persist a graph                                     -> nx.write_gpickle / write_gml /
                                                    write_graphml; for parquet, use NetworkX
                                                    to_pandas_edgelist.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for i in range(1_000_000):
>       g.add_edge(...)                              # NetworkX nodes are dicts of dicts
> 1M edges in NetworkX easily takes 10 GB and 5 minutes. For that scale,
> build with igraph (g = ig.Graph(edges=edges)) or graph-tool.

## Tips

- Use `nx.Graph` for undirected, `nx.DiGraph` for directed, `nx.MultiGraph` if parallel edges have different attributes.
- Edge attributes are arbitrary kwargs; `nx.shortest_path(..., weight="travel_time")` references the attribute name.
- `single_source_dijkstra_path_length(g, src, cutoff=X)` is the right tool for "everywhere reachable in ≤ X" (isochrones, broadcast radius).
- Betweenness centrality is O(V·E) — slow on big graphs; use approximate `betweenness_centrality(k=samples)` past ~10k nodes.
- NetworkX caps out around 50-100k nodes for productivity; switch to **igraph** (10-100× faster) or **graph-tool** (C++) for scale.

## Common Mistake

> [!warning] Building a million-edge graph in NetworkX. Each node is a Python dict-of-dicts — memory and runtime explode. Use **igraph** for >50k nodes.

## See Also

- [[Sections/astropy-scientific/networkx/_Index|Astropy & Scientific → NetworkX — graph algorithms]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
