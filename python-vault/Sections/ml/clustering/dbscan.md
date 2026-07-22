---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "dbscan"
title: "DBSCAN"
category: "Clustering"
subtitle: "Density-based partitioning"
signature_short: "DBSCAN(eps=0.3, min_samples=5)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "DBSCAN"
  - "dbscan"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/clustering"
  - "tier/tiered"
---

# DBSCAN

> Density-based partitioning

## Overview

Groups nearby samples and marks outliers as noise based on density, naturally finding arbitrary cluster shapes without pre-specifying count.

## Signature

```python
DBSCAN(eps=0.3, min_samples=5)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - density-based: cluster points within
#             eps distance (need at least min_samples
#             neighbors). Outliers get label -1.
# STRENGTHS - finds arbitrary cluster shapes; no need
#             to specify k.
# WEAKNESSES- doesn't yet show eps tuning or
#             interpretation of label -1.
#
from sklearn.cluster import DBSCAN
labels = DBSCAN(eps=0.5, min_samples=5).fit_predict(X_scaled)
# label -1 = noise / outlier
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday DBSCAN surface: scale
#             first, pick eps via the k-distance
#             graph (the "knee" of sorted k-NN
#             distances), report cluster count and
#             noise rate.
# STRENGTHS - the k-distance graph is the principled
#             way to choose eps.
# WEAKNESSES- doesn't address HDBSCAN (more robust
#             to varying density) — senior tier.
#
import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors

# Pick eps — k-distance graph
k = 5
nn = NearestNeighbors(n_neighbors=k).fit(X_scaled)
dists, _ = nn.kneighbors(X_scaled)
sorted_kth = np.sort(dists[:, -1])
# Plot sorted_kth — the "knee" is the right eps
# eps = ~ knee value

clu = DBSCAN(eps=0.5, min_samples=k).fit(X_scaled)
labels = clu.labels_

n_clusters = (labels != -1).any() and (set(labels) - {-1})
n_noise    = (labels == -1).sum()
print(f"clusters: {len(n_clusters)},  noise points: {n_noise}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production density clustering: HDBSCAN
#             handles varying density (DBSCAN's main
#             weakness); for huge N use ball_tree
#             algorithm; the noise rate is a useful
#             quality signal — too high means eps too
#             small.
# STRENGTHS - HDBSCAN automatically picks min_cluster
#             _size and handles density variations;
#             noise-rate diagnostics catch bad eps
#             choices.
# WEAKNESSES- HDBSCAN is a separate package; ball_tree
#             only helps when dimensions stay
#             reasonable (<20).
#
from sklearn.cluster import DBSCAN

clu = DBSCAN(
    eps=0.5, min_samples=10,
    algorithm="ball_tree",                  # faster on big N, low dims
    n_jobs=-1,
).fit(X_scaled)

labels = clu.labels_
noise_rate = (labels == -1).mean()
if noise_rate > 0.5:
    print("WARNING: >50% noise — eps too small, density too uneven")

# When DBSCAN's fixed eps fails — HDBSCAN
# pip install hdbscan
# import hdbscan
# clu = hdbscan.HDBSCAN(min_cluster_size=10).fit(X_scaled)
# labels = clu.labels_

# Decision rule:
#   spherical-ish clusters, known k        -> KMeans
#   irregular shapes, single density       -> DBSCAN
#   irregular shapes, varying density      -> HDBSCAN
#   small N, want hierarchy                -> AgglomerativeClustering
#   high-dim data (> 30 features)          -> reduce dims first (PCA/UMAP)
#   very large N                           -> HDBSCAN with approx algorithms
#   need eps with no domain prior          -> k-distance plot, look for elbow
#
# Anti-pattern: copy-pasting eps=0.5 from a tutorial
#   eps depends on the scale and distance distribution of YOUR features.
#   Without scaling, 0.5 is meaningless; with scaling it may still be wrong.
#   Use a k-distance plot (sorted distance to k-th nearest neighbor) and
#   pick eps at the elbow. If noise rate exceeds 50%, eps is too small.
```

## Decision Rule

```text
spherical-ish clusters, known k        -> KMeans
irregular shapes, single density       -> DBSCAN
irregular shapes, varying density      -> HDBSCAN
small N, want hierarchy                -> AgglomerativeClustering
high-dim data (> 30 features)          -> reduce dims first (PCA/UMAP)
very large N                           -> HDBSCAN with approx algorithms
need eps with no domain prior          -> k-distance plot, look for elbow
```

## Anti-Pattern

> [!warning] Anti-pattern
> copy-pasting eps=0.5 from a tutorial
>   eps depends on the scale and distance distribution of YOUR features.
>   Without scaling, 0.5 is meaningless; with scaling it may still be wrong.
>   Use a k-distance plot (sorted distance to k-th nearest neighbor) and
>   pick eps at the elbow. If noise rate exceeds 50%, eps is too small.

## Tips

- eps controls neighborhood distance; use k-distance graph to select
- min_samples defines minimum neighbors to form core sample
- No need to pre-specify number of clusters

## Common Mistake

> [!warning] Not tuning eps and min_samples; uses heuristics or domain knowledge.

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
- [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding) (Machine Learning)]]
- [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering (Machine Learning)]]
- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
