---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "silhouette_score"
title: "silhouette_score"
category: "Clustering Evaluation"
subtitle: "Silhouette coefficient"
signature_short: "silhouette_score(X, labels)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "silhouette_score"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/clustering-evaluation"
  - "tier/tiered"
---

# silhouette_score

> Silhouette coefficient

## Overview

Calculates average silhouette coefficient measuring cluster cohesion (similarity within cluster) and separation (dissimilarity with other clusters).

## Signature

```python
silhouette_score(X, labels)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - score in [-1, 1]. Higher = clusters
#             are tight and well separated. Pass the
#             same X you clustered.
# STRENGTHS - the universal "is my clustering any
#             good?" metric.
# WEAKNESSES- doesn't yet show k-selection or
#             per-sample diagnosis.
#
from sklearn.metrics import silhouette_score
silhouette_score(X_scaled, labels)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday silhouette workflow: sweep
#             k, pick the highest silhouette, use
#             silhouette_samples to find which points
#             are poorly clustered.
# STRENGTHS - the silhouette sweep is the standard
#             "pick k for KMeans" tool; per-sample
#             scores expose individual misclusters.
# WEAKNESSES- silhouette is biased toward convex
#             clusters — DBSCAN clusters can score
#             low even when clearly correct. Senior
#             tier covers alternatives.
#
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score, silhouette_samples

scores = []
for k in range(2, 10):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_scaled)
    scores.append(silhouette_score(X_scaled, km.labels_))

best_k = np.arange(2, 10)[np.argmax(scores)]
print(f"best k by silhouette: {best_k}, score {max(scores):.3f}")

# Per-sample — find badly-clustered points
km = KMeans(n_clusters=best_k, n_init=10, random_state=42).fit(X_scaled)
per_sample = silhouette_samples(X_scaled, km.labels_)
bad = per_sample < 0
print(f"{bad.sum()} points with negative silhouette")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production cluster validation: pair
#             silhouette with Davies-Bouldin (lower
#             better) and Calinski-Harabasz (higher
#             better) — three indices catch what one
#             misses. For density-based clustering
#             (DBSCAN/HDBSCAN), use noise rate +
#             cluster stability instead.
# STRENGTHS - the three-index sweep is the standard
#             "validate clustering" panel; explicit
#             rules for density-based methods
#             prevent misapplied silhouette.
# WEAKNESSES- internal indices are heuristic — domain
#             knowledge / labeled validation > metric
#             scores when available.
#
import numpy as np
from sklearn.cluster import KMeans
from sklearn.metrics import (
    silhouette_score, davies_bouldin_score,
    calinski_harabasz_score)

results = []
for k in range(2, 10):
    km = KMeans(n_clusters=k, n_init=10, random_state=42).fit(X_scaled)
    results.append({
        "k":        k,
        "silhouette":  silhouette_score(X_scaled, km.labels_),
        "db":          davies_bouldin_score(X_scaled, km.labels_),       # lower better
        "ch":          calinski_harabasz_score(X_scaled, km.labels_),    # higher better
    })

# Compare across all three
best_by_sil = max(results, key=lambda r: r["silhouette"])
best_by_db  = min(results, key=lambda r: r["db"])
best_by_ch  = max(results, key=lambda r: r["ch"])

# Decision rule:
#   convex clusters (KMeans / GMM)        -> silhouette + DB + CH
#   density-based (DBSCAN / HDBSCAN)      -> noise rate + cluster persistence
#   labeled validation set available      -> homogeneity / completeness / V-measure
#   no validation possible                -> domain knowledge / visual inspection
#   want per-sample score                 -> silhouette_samples (find bad rows)
#   compare two clusterings, same data    -> Adjusted Rand Index (ARI)
#   high-D data, slow on big N            -> sample 1-5k rows for the score
#
# Anti-pattern: applying silhouette_score to DBSCAN output including noise (-1)
#   silhouette treats noise label -1 as a regular cluster, which is
#   meaningless and tanks the score. Filter to mask = labels != -1
#   first, or use density-aware metrics (noise rate, HDBSCAN stability).
#   Also: silhouette tends to favor low k — pair with the elbow plot
#   so you don't accidentally collapse everything into 2 clusters.
```

## Decision Rule

```text
convex clusters (KMeans / GMM)        -> silhouette + DB + CH
density-based (DBSCAN / HDBSCAN)      -> noise rate + cluster persistence
labeled validation set available      -> homogeneity / completeness / V-measure
no validation possible                -> domain knowledge / visual inspection
want per-sample score                 -> silhouette_samples (find bad rows)
compare two clusterings, same data    -> Adjusted Rand Index (ARI)
high-D data, slow on big N            -> sample 1-5k rows for the score
```

## Anti-Pattern

> [!warning] Anti-pattern
> applying silhouette_score to DBSCAN output including noise (-1)
>   silhouette treats noise label -1 as a regular cluster, which is
>   meaningless and tanks the score. Filter to mask = labels != -1
>   first, or use density-aware metrics (noise rate, HDBSCAN stability).
>   Also: silhouette tends to favor low k — pair with the elbow plot
>   so you don't accidentally collapse everything into 2 clusters.

## Tips

- Range [-1, 1]; higher is better; >0.5 generally good
- Use to find optimal cluster count for KMeans
- silhouette_samples() shows per-sample scores for inspection

## Common Mistake

> [!warning] Relying only on silhouette score; combine with domain knowledge.

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

- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
