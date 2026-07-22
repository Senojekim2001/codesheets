---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "kmeans"
title: "KMeans"
category: "Clustering"
subtitle: "Centroid-based clustering"
signature_short: "KMeans(n_clusters=3, n_init=10, random_state=42)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "KMeans"
  - "kmeans"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/clustering"
  - "tier/tiered"
---

# KMeans

> Centroid-based clustering

## Overview

Assigns samples to k clusters by minimizing within-cluster variance, requiring pre-specified number of clusters via Lloyd's algorithm.

## Signature

```python
KMeans(n_clusters=3, n_init=10, random_state=42)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - scale FIRST, fit KMeans with k clusters,
#             get labels.
# STRENGTHS - the fastest "give me clusters" path.
# WEAKNESSES- doesn't yet show how to PICK k or
#             handle non-spherical clusters.
#
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

clu = Pipeline([
    ("scale",  StandardScaler()),
    ("kmeans", KMeans(n_clusters=3, n_init=10, random_state=42)),
])
labels = clu.fit_predict(X)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday KMeans surface: pick k via
#             elbow (inertia) or silhouette, n_init=
#             "auto" or 10 to avoid bad seeds, predict
#             on new data via the fit Pipeline.
# STRENGTHS - the elbow + silhouette combo is the
#             standard "pick k" workflow.
# WEAKNESSES- KMeans assumes spherical clusters of
#             similar size — fails on irregular shapes.
#             Senior tier covers alternatives.
#
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# Elbow method — plot inertia vs k
inertias, sils = [], []
for k in range(2, 10):
    p = Pipeline([("scale", StandardScaler()),
                   ("km", KMeans(n_clusters=k, n_init=10,
                                  random_state=42))])
    p.fit(X)
    inertias.append(p.named_steps["km"].inertia_)
    sils.append(silhouette_score(p.named_steps["scale"].transform(X),
                                   p.named_steps["km"].labels_))

best_k = np.arange(2, 10)[np.argmax(sils)]
print(f"best k by silhouette: {best_k}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production KMeans: MiniBatchKMeans for
#             huge N (much faster, similar quality);
#             KMeans++ initialization is the default
#             and usually right; for non-spherical
#             clusters, switch to GaussianMixture or
#             DBSCAN. Always scale first.
# STRENGTHS - the algorithm-by-shape rule prevents
#             "KMeans gave nonsense clusters" on
#             elongated or density-varying data;
#             MiniBatchKMeans scales to millions.
# WEAKNESSES- MiniBatchKMeans is slightly less
#             accurate than full KMeans; GMM has its
#             own assumptions (Gaussian components).
#
from sklearn.cluster import KMeans, MiniBatchKMeans
from sklearn.mixture import GaussianMixture

# Big data — MiniBatchKMeans
clu = MiniBatchKMeans(
    n_clusters=8, batch_size=1024, n_init="auto",
    max_iter=100, random_state=42,
).fit(X_scaled)

# Non-spherical / unequal-size clusters -> GMM
gmm = GaussianMixture(n_components=8, covariance_type="full",
                       random_state=42).fit(X_scaled)
labels = gmm.predict(X_scaled)
proba = gmm.predict_proba(X_scaled)             # soft assignments

# Decision rule:
#   spherical clusters, similar sizes       -> KMeans
#   N > 1M                                  -> MiniBatchKMeans
#   non-spherical / overlapping clusters    -> GaussianMixture
#   irregular shapes / noise / unknown k    -> DBSCAN
#   hierarchical structure                  -> AgglomerativeClustering
#   need soft / probabilistic membership    -> GaussianMixture
#   want stable cluster ids                 -> n_init=20, fix random_state
#
# Anti-pattern: running KMeans on raw features and trusting the labels
#   KMeans uses Euclidean distance, so an unscaled column with values in
#   thousands dominates and effectively defines the clusters. Always
#   StandardScaler first. Also: picking k from the elbow alone is brittle
#   — pair with silhouette_score across k values and inspect cluster
#   sizes (a 95/2/2/1% split usually means k is wrong, not the data).
```

## Decision Rule

```text
spherical clusters, similar sizes       -> KMeans
N > 1M                                  -> MiniBatchKMeans
non-spherical / overlapping clusters    -> GaussianMixture
irregular shapes / noise / unknown k    -> DBSCAN
hierarchical structure                  -> AgglomerativeClustering
need soft / probabilistic membership    -> GaussianMixture
want stable cluster ids                 -> n_init=20, fix random_state
```

## Anti-Pattern

> [!warning] Anti-pattern
> running KMeans on raw features and trusting the labels
>   KMeans uses Euclidean distance, so an unscaled column with values in
>   thousands dominates and effectively defines the clusters. Always
>   StandardScaler first. Also: picking k from the elbow alone is brittle
>   — pair with silhouette_score across k values and inspect cluster
>   sizes (a 95/2/2/1% split usually means k is wrong, not the data).

## Tips

- Always scale features before KMeans
- Use elbow method to find optimal k (plot inertia vs k)
- Initialize with n_init=10 to avoid poor local optima
- For N > ~1M switch to `MiniBatchKMeans`; for non-spherical / overlapping clusters use `GaussianMixture`; for noise-tolerant arbitrary shapes use `DBSCAN`

## Common Mistake

> [!warning] Not scaling features; leads to distance dominance by high-variance features.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/ml/clustering/dbscan|DBSCAN (Machine Learning)]]
- [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding) (Machine Learning)]]
- [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering (Machine Learning)]]
- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
