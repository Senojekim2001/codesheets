---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "agglomerative_clustering"
title: "AgglomerativeClustering"
category: "Clustering"
subtitle: "Hierarchical agglomerative"
signature_short: "AgglomerativeClustering(n_clusters=3, linkage='ward')"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "AgglomerativeClustering"
  - "agglomerative_clustering"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/clustering"
  - "tier/tiered"
---

# AgglomerativeClustering

> Hierarchical agglomerative

## Overview

Builds hierarchical cluster tree by iteratively merging closest samples/clusters, producing dendrogram without pre-specifying cluster count.

## Signature

```python
AgglomerativeClustering(n_clusters=3, linkage='ward')
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - hierarchical: each point starts as its
#             own cluster, then merge closest pairs
#             until k clusters remain.
# STRENGTHS - produces a hierarchy (dendrogram)
#             showing relationships, not just a flat
#             partition.
# WEAKNESSES- O(n^2) memory; slow on big data.
#
from sklearn.cluster import AgglomerativeClustering
labels = AgglomerativeClustering(n_clusters=3, linkage="ward")\
    .fit_predict(X_scaled)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday surface: pick linkage by
#             cluster shape (ward=compact,
#             complete=conservative, average=
#             balanced, single=elongated). Use scipy
#             dendrogram to visualize the merge
#             history.
# STRENGTHS - the linkage-by-shape rule is the most
#             important AgglomerativeClustering
#             decision.
# WEAKNESSES- doesn't address distance_threshold
#             (dynamic k via cut height) or scale
#             concerns — senior.
#
import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.cluster import AgglomerativeClustering

# Cluster
agg = AgglomerativeClustering(n_clusters=3, linkage="ward")
labels = agg.fit_predict(X_scaled)

# Visualize the merge tree
Z = linkage(X_scaled, method="ward")
dendrogram(Z, truncate_mode="lastp", p=20)
plt.xlabel("sample"); plt.ylabel("distance")

# Linkage choices
# ward     - minimizes within-cluster variance (compact, KMeans-like)
# complete - max distance (chaining-resistant, conservative)
# average  - mean distance (balanced)
# single   - min distance (elongated chains; "friend of friend")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production hierarchical clustering: use
#             distance_threshold instead of n_clusters
#             when you don't know k (the dendrogram
#             cut height becomes the decision); for
#             N > ~10k use BIRCH or MiniBatchKMeans
#             (Agglomerative is O(n^2) memory);
#             always scale first.
# STRENGTHS - distance_threshold lets the data pick
#             k; BIRCH scales hierarchical-style
#             clustering to big data.
# WEAKNESSES- distance_threshold requires a sane
#             scale (always standardize); BIRCH has
#             its own threshold parameter to tune.
#
from sklearn.cluster import AgglomerativeClustering, Birch

# Pick k from a height threshold instead of fixing k
agg = AgglomerativeClustering(
    n_clusters=None,
    distance_threshold=2.5,                  # cut at this distance
    linkage="ward",
)
agg.fit(X_scaled)
print(f"clusters found: {agg.n_clusters_}")

# At scale — BIRCH is hierarchical-style but O(n)
brc = Birch(n_clusters=None, threshold=0.5).fit(X_scaled)

# Decision rule:
#   small N, want hierarchy             -> AgglomerativeClustering
#   small N, k unknown                  -> AgglomerativeClustering(distance_threshold=)
#   large N (>10k)                      -> BIRCH or MiniBatchKMeans
#   compact convex clusters             -> linkage="ward" (Euclidean only)
#   chain-shaped / connected components -> linkage="single"
#   conservative tight clusters         -> linkage="complete"
#   need a dendrogram to inspect cuts   -> scipy.cluster.hierarchy + linkage()
#
# Anti-pattern: running AgglomerativeClustering on 100k rows in a notebook
#   The classic O(n^2) memory and time blow up — the kernel dies or
#   freezes for an hour. For N > ~10k use BIRCH (linear in N) or
#   sub-sample to fit, then assign new points by nearest centroid.
#   Also: linkage="ward" requires Euclidean distance; pairing it with
#   metric="cosine" silently raises an error or gives nonsense.
```

## Decision Rule

```text
small N, want hierarchy             -> AgglomerativeClustering
small N, k unknown                  -> AgglomerativeClustering(distance_threshold=)
large N (>10k)                      -> BIRCH or MiniBatchKMeans
compact convex clusters             -> linkage="ward" (Euclidean only)
chain-shaped / connected components -> linkage="single"
conservative tight clusters         -> linkage="complete"
need a dendrogram to inspect cuts   -> scipy.cluster.hierarchy + linkage()
```

## Anti-Pattern

> [!warning] Anti-pattern
> running AgglomerativeClustering on 100k rows in a notebook
>   The classic O(n^2) memory and time blow up — the kernel dies or
>   freezes for an hour. For N > ~10k use BIRCH (linear in N) or
>   sub-sample to fit, then assign new points by nearest centroid.
>   Also: linkage="ward" requires Euclidean distance; pairing it with
>   metric="cosine" silently raises an error or gives nonsense.

## Tips

- linkage="ward" minimizes variance (similar to KMeans)
- linkage="complete" uses maximum distance (conservative)
- linkage="average" uses mean distance (balanced)

## Common Mistake

> [!warning] Not tuning linkage type; impacts cluster shapes and results.

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

- [[Sections/ml/clustering/kmeans|KMeans (Machine Learning)]]
- [[Sections/ml/clustering/dbscan|DBSCAN (Machine Learning)]]
- [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding) (Machine Learning)]]
- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
