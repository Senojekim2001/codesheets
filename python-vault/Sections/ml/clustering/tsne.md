---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "tsne"
title: "t-SNE (t-Distributed Stochastic Neighbor Embedding)"
category: "Clustering"
subtitle: "Non-linear neighborhood preservation"
signature_short: "TSNE(n_components=2, perplexity=30, max_iter=1000)  # n_iter renamed to max_iter in sklearn 1.5"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "t-SNE (t-Distributed Stochastic Neighbor Embedding)"
  - "tsne"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/clustering"
  - "tier/tiered"
---

# t-SNE (t-Distributed Stochastic Neighbor Embedding)

> Non-linear neighborhood preservation

## Overview

Projects high-dimensional data to 2D/3D preserving local neighbor relationships, excellent for visualization but not suitable for downstream models.

## Signature

```python
TSNE(n_components=2, perplexity=30, max_iter=1000)  # n_iter renamed to max_iter in sklearn 1.5
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - non-linear projection to 2D for
#             visualization only. perplexity ~ "size
#             of local neighborhood".
# STRENGTHS - reveals cluster structure that PCA
#             can't.
# WEAKNESSES- VISUALIZATION ONLY — never use t-SNE
#             output as features for downstream
#             models.
#
from sklearn.manifold import TSNE
X_2d = TSNE(n_components=2, random_state=42).fit_transform(X)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday t-SNE surface: tune
#             perplexity (5-50), reduce to 50D with
#             PCA first if N or D is large (faster
#             and cleaner), color the projection by
#             a known label.
# STRENGTHS - the PCA-then-t-SNE pipeline is the
#             standard high-D visualization recipe;
#             coloring by class is what makes the
#             projection interpretable.
# WEAKNESSES- doesn't address UMAP (often better
#             than t-SNE for downstream use) —
#             senior tier.
#
import numpy as np
from sklearn.manifold import TSNE
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)

# Reduce to 50D first if D > 50 — faster, cleaner
X_pca = PCA(n_components=min(50, X_scaled.shape[1]),
             random_state=42).fit_transform(X_scaled)

X_2d = TSNE(
    n_components=2,
    perplexity=30,                          # 5-50; smaller = local detail
    learning_rate="auto",
    init="pca",                              # better than random init
    random_state=42,
).fit_transform(X_pca)

# import seaborn as sns
# sns.scatterplot(x=X_2d[:, 0], y=X_2d[:, 1], hue=labels)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production rule: t-SNE is for visual
#             EDA only. UMAP is faster, more stable,
#             and produces better-shaped projections
#             — and unlike t-SNE, UMAP can be used
#             for downstream tasks (preserves more
#             global structure).
# STRENGTHS - UMAP is now the industry-standard
#             default for visualization and embedding;
#             explicit "t-SNE for viz only" rule
#             prevents downstream-task misuse.
# WEAKNESSES- UMAP is a separate package; both
#             methods are stochastic — multiple runs
#             give different layouts.
#
from sklearn.manifold import TSNE

# t-SNE is fine for one-off EDA
X_tsne = TSNE(n_components=2, perplexity=30,
               init="pca", random_state=42).fit_transform(X_pca)

# UMAP — better default for visualization AND embeddings
# pip install umap-learn
# import umap
# reducer = umap.UMAP(
#     n_components=2,
#     n_neighbors=15,                       # local vs global tradeoff
#     min_dist=0.1,                          # how tight clusters are
#     random_state=42,
# )
# X_umap = reducer.fit_transform(X_pca)
# # UMAP output IS safe to use as features (unlike t-SNE)

# Decision rule:
#   high-D visualization, one-off     -> t-SNE (init="pca", perplexity tuned)
#   high-D viz + downstream features  -> UMAP
#   linear, interpretable             -> PCA
#   need to embed NEW data later      -> UMAP (transform), NOT t-SNE
#   small dataset (< 1k)              -> low perplexity (5-15)
#   large dataset (> 50k)             -> reduce with PCA to 50 first, then UMAP
#   never                             -> t-SNE output as model features
#
# Anti-pattern: feeding t-SNE coordinates into a downstream classifier
#   t-SNE distances are non-metric and not preserved across runs — the
#   same point can land in different clusters with a new random_state.
#   Use UMAP if you need a stable, low-dim feature representation, or
#   keep t-SNE strictly as a visual EDA tool. Also: skipping PCA pre-
#   reduction on >50 features makes t-SNE crawl AND degrades layout.
```

## Decision Rule

```text
high-D visualization, one-off     -> t-SNE (init="pca", perplexity tuned)
high-D viz + downstream features  -> UMAP
linear, interpretable             -> PCA
need to embed NEW data later      -> UMAP (transform), NOT t-SNE
small dataset (< 1k)              -> low perplexity (5-15)
large dataset (> 50k)             -> reduce with PCA to 50 first, then UMAP
never                             -> t-SNE output as model features
```

## Anti-Pattern

> [!warning] Anti-pattern
> feeding t-SNE coordinates into a downstream classifier
>   t-SNE distances are non-metric and not preserved across runs — the
>   same point can land in different clusters with a new random_state.
>   Use UMAP if you need a stable, low-dim feature representation, or
>   keep t-SNE strictly as a visual EDA tool. Also: skipping PCA pre-
>   reduction on >50 features makes t-SNE crawl AND degrades layout.

## Tips

- Use for visualization only; not for downstream ML tasks
- Tune perplexity (typically 5-50) based on dataset size
- Set n_iter >= 1000 for convergence
- If you need a low-D embedding that doubles as model features, use UMAP — its output is reusable, t-SNE distances are visualization-only

## Common Mistake

> [!warning] Using t-SNE output as features for models; use PCA or other transformations instead.

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

- [[Sections/ml/clustering/kmeans|KMeans (Machine Learning)]]
- [[Sections/ml/clustering/dbscan|DBSCAN (Machine Learning)]]
- [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering (Machine Learning)]]
- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
