---
type: "entry"
domain: "python"
file: "ml"
section: "clustering"
id: "pca"
title: "PCA (Principal Component Analysis)"
category: "Dimensionality Reduction"
subtitle: "Linear variance maximization"
signature_short: "PCA(n_components=2).fit_transform(X)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PCA (Principal Component Analysis)"
  - "pca"
tags:
  - "python"
  - "python/ml"
  - "python/ml/clustering"
  - "category/dimensionality-reduction"
  - "tier/tiered"
---

# PCA (Principal Component Analysis)

> Linear variance maximization

## Overview

Transforms data to orthogonal principal components maximizing variance, enabling visualization and noise reduction while preserving information.

## Signature

```python
PCA(n_components=2).fit_transform(X)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - linear projection to k orthogonal
#             components capturing maximum variance.
#             Scale first.
# STRENGTHS - the simplest dimensionality reduction.
# WEAKNESSES- doesn't yet show explained_variance_,
#             auto component count, or Pipeline
#             integration.
#
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

X_scaled = StandardScaler().fit_transform(X)
X_pca = PCA(n_components=2).fit_transform(X_scaled)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday PCA surface: pick
#             n_components by variance threshold
#             (e.g. 0.95), inspect explained_variance_
#             ratio_ to decide, integrate into a
#             Pipeline.
# STRENGTHS - n_components=0.95 is the most useful
#             form — pick "enough components for 95%
#             variance" automatically.
# WEAKNESSES- doesn't address whitening, kernel PCA,
#             or interpretability via loadings —
#             senior tier.
#
import numpy as np
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

# 95% variance retention
pipe = Pipeline([
    ("scale", StandardScaler()),
    ("pca",   PCA(n_components=0.95, random_state=42)),
])
X_pca = pipe.fit_transform(X)

pca = pipe.named_steps["pca"]
print(f"components used: {pca.n_components_}")
print(f"variance explained: {pca.explained_variance_ratio_.cumsum()}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production PCA: components_ × scaler.
#             scale_ gives interpretable loadings;
#             whiten=True for downstream models that
#             want decorrelated, unit-variance inputs;
#             KernelPCA for non-linear projection;
#             IncrementalPCA / TruncatedSVD when data
#             doesn't fit in memory.
# STRENGTHS - the loadings rule unlocks "what does
#             PC1 mean?"; KernelPCA handles non-linear
#             manifolds; IncrementalPCA scales
#             to streaming data.
# WEAKNESSES- whitening hurts some models; KernelPCA
#             is O(n^2) memory; TruncatedSVD doesn't
#             center the data (right for sparse
#             inputs).
#
import numpy as np
from sklearn.decomposition import (
    PCA, KernelPCA, IncrementalPCA, TruncatedSVD)
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler().fit(X)
X_scaled = scaler.transform(X)

pca = PCA(n_components=10, random_state=42).fit(X_scaled)

# Loadings — interpret each PC as a weighted feature combo
loadings = pca.components_                          # (n_components, n_features)
top_for_pc1 = np.argsort(np.abs(loadings[0]))[::-1][:5]
print("PC1 driven by:", [feature_names[i] for i in top_for_pc1])

# When sklearn's PCA is the wrong tool:
# KernelPCA(kernel="rbf", n_components=2)        # non-linear
# IncrementalPCA(n_components=10, batch_size=200) # streaming
# TruncatedSVD(n_components=100)                  # sparse / TF-IDF

# Decision rule:
#   linear, dense, fits in memory    -> PCA
#   non-linear manifold              -> KernelPCA
#   doesn't fit in memory            -> IncrementalPCA
#   sparse matrix (TF-IDF)           -> TruncatedSVD
#   visualization only (2D/3D)       -> t-SNE / UMAP
#   need a downstream model input    -> PCA(whiten=True) inside Pipeline
#   choose components by variance    -> n_components=0.95 (keep 95%)
#
# Anti-pattern: running PCA on unscaled features
#   PCA finds directions of maximum variance — without scaling, a
#   column with huge units (e.g., income in dollars) becomes PC1 and
#   the rest is irrelevant. Always StandardScaler first, except when
#   features share a scale (pixel intensities). Also: PCA before
#   train_test_split leaks test info — fit PCA inside a Pipeline.
```

## Decision Rule

```text
linear, dense, fits in memory    -> PCA
non-linear manifold              -> KernelPCA
doesn't fit in memory            -> IncrementalPCA
sparse matrix (TF-IDF)           -> TruncatedSVD
visualization only (2D/3D)       -> t-SNE / UMAP
need a downstream model input    -> PCA(whiten=True) inside Pipeline
choose components by variance    -> n_components=0.95 (keep 95%)
```

## Anti-Pattern

> [!warning] Anti-pattern
> running PCA on unscaled features
>   PCA finds directions of maximum variance — without scaling, a
>   column with huge units (e.g., income in dollars) becomes PC1 and
>   the rest is irrelevant. Always StandardScaler first, except when
>   features share a scale (pixel intensities). Also: PCA before
>   train_test_split leaks test info — fit PCA inside a Pipeline.

## Tips

- Always scale features before PCA
- Use n_components=0.95 to retain 95% of variance
- Interpret PCs via loadings to understand feature contributions
- Use `IncrementalPCA` when the matrix does not fit in memory; for sparse TF-IDF inputs reach for `TruncatedSVD` (PCA densifies and blows up RAM)

## Common Mistake

> [!warning] Not scaling features; variance dominated by high-scale variables.

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

- [[Sections/ml/clustering/_Index|Machine Learning → Clustering & Unsupervised Learning]]
- [[Sections/ml/_Index|Machine Learning index]]
- [[_Index|Vault index]]
