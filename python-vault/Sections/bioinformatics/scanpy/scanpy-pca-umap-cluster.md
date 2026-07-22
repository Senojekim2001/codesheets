---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "scanpy"
id: "scanpy-pca-umap-cluster"
title: "normalize → HVG → PCA → neighbors → UMAP → leiden"
category: "scanpy"
subtitle: "sc.pp.normalize_total (target_sum=1e4 default), sc.pp.log1p, sc.pp.highly_variable_genes (n_top_genes or flavor='seurat_v3'), sc.pp.scale (zero-mean per gene; gentle for batch effects), sc.tl.pca (n_comps=50 default), sc.pp.neighbors (n_neighbors=15, n_pcs=), sc.tl.leiden (resolution=), sc.tl.umap, sc.pl.* for plots"
signature_short: "sc.pp.normalize_total(adata, target_sum=1e4); sc.pp.log1p(adata); sc.pp.highly_variable_genes(adata); sc.pp.pca(adata); sc.pp.neighbors(adata); sc.tl.leiden(adata, resolution=0.5); sc.tl.umap(adata)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "normalize → HVG → PCA → neighbors → UMAP → leiden"
  - "scanpy-pca-umap-cluster"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/scanpy"
  - "category/scanpy"
  - "tier/tiered"
---

# normalize → HVG → PCA → neighbors → UMAP → leiden

> sc.pp.normalize_total (target_sum=1e4 default), sc.pp.log1p, sc.pp.highly_variable_genes (n_top_genes or flavor='seurat_v3'), sc.pp.scale (zero-mean per gene; gentle for batch effects), sc.tl.pca (n_comps=50 default), sc.pp.neighbors (n_neighbors=15, n_pcs=), sc.tl.leiden (resolution=), sc.tl.umap, sc.pl.* for plots

## Overview

The pipeline is a chain of in-place mutations. Order matters: normalize → log → HVG → scale → PCA → neighbors → cluster + UMAP. `resolution=` on `leiden` controls cluster granularity (0.4-1.5 typical). For batch correction, swap PCA for `harmony` or `scvi` integration before neighbors. Three depths solve the SAME task — cluster a QC'd dataset and plot the UMAP — at depths: minimal pipeline → keep raw in layers, plot HVG, leiden + UMAP → full pipeline with batch-aware HVG, parameter logging, marker-gene table per cluster.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Cluster a QC'd AnnData; plot UMAP colored by cluster.
- **Junior** — SAME — cluster + UMAP — preserve raw counts; pick HVGs.
- **Senior** — SAME — cluster + UMAP — production: batch-aware HVG + optional Harmony integration, parameter logging in .uns, marker-gene table per cluster.

## Signature

```python
sc.pp.normalize_total(adata, target_sum=1e4); sc.pp.log1p(adata); sc.pp.highly_variable_genes(adata); sc.pp.pca(adata); sc.pp.neighbors(adata); sc.tl.leiden(adata, resolution=0.5); sc.tl.umap(adata)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Cluster a QC'd AnnData; plot UMAP colored by cluster.
# APPROACH  - The 7-line scanpy default pipeline.
# STRENGTHS - Smallest possible workflow.
# WEAKNESSES- Loses raw counts after log1p; no HVG selection
#             (PCA on all genes is noisier).
import scanpy as sc

adata = sc.read_h5ad("qc_filtered.h5ad")

sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
sc.pp.pca(adata, n_comps=30)
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30)
sc.tl.leiden(adata, resolution=0.5)
sc.tl.umap(adata)

sc.pl.umap(adata, color="leiden", save="_clusters.png")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — cluster + UMAP — preserve raw counts; pick HVGs.
# APPROACH  - Cache counts in .layers["counts"]; sc.pp.highly_variable_genes
#             with seurat_v3 flavor (uses raw counts).
# STRENGTHS - Standard practice; reversible normalization; cleaner PCA.
# WEAKNESSES- seurat_v3 needs raw counts (not log) - run BEFORE log1p.
import scanpy as sc

adata = sc.read_h5ad("qc_filtered.h5ad")

# Stash the raw counts layer BEFORE we mutate .X.
adata.layers["counts"] = adata.X.copy()

# HVG with seurat_v3 needs raw counts.
sc.pp.highly_variable_genes(adata, flavor="seurat_v3", n_top_genes=2000,
                            layer="counts")

sc.pp.normalize_total(adata, target_sum=1e4)
sc.pp.log1p(adata)
adata.raw = adata                                      # snapshot for plotting marker genes

# PCA on HVGs only (less noise).
sc.pp.scale(adata, max_value=10)                       # cap z-scores
sc.pp.pca(adata, n_comps=50, use_highly_variable=True)
sc.pp.neighbors(adata, n_neighbors=15, n_pcs=30)
sc.tl.leiden(adata, resolution=0.5)
sc.tl.umap(adata)

sc.pl.umap(adata, color=["leiden", "n_genes_by_counts", "pct_counts_mt"],
           save="_clusters.png")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — cluster + UMAP — production: batch-aware HVG +
#             optional Harmony integration, parameter logging in .uns,
#             marker-gene table per cluster.
# APPROACH  - HVG with batch_key for cross-sample stability; if batch
#             column exists, run harmonypy on the PCA; rank_genes_groups
#             for cluster markers; save markers as a CSV alongside h5ad.
# STRENGTHS - Reproducible; batch-corrected; downstream-ready markers.
# WEAKNESSES- harmonypy is a separate dep; large datasets benefit from
#             scvi-tools instead (slower training, better integration).
from __future__ import annotations
import scanpy as sc
import pandas as pd
from pathlib import Path

try:
    import harmonypy as hm
except ImportError:
    hm = None


def cluster_and_annotate(
    adata,
    *, batch_key: str | None = None,
    n_top_genes: int = 2000, n_pcs: int = 30,
    resolution: float = 0.5,
    out_h5ad: Path | None = None,
    out_markers: Path | None = None,
):
    # 1) Stash raw counts.
    adata.layers["counts"] = adata.X.copy()

    # 2) Batch-aware HVG selection.
    sc.pp.highly_variable_genes(
        adata, flavor="seurat_v3", n_top_genes=n_top_genes,
        layer="counts", batch_key=batch_key,
    )

    # 3) Normalize + log + scale.
    sc.pp.normalize_total(adata, target_sum=1e4)
    sc.pp.log1p(adata)
    adata.raw = adata
    sc.pp.scale(adata, max_value=10)

    # 4) PCA on HVGs.
    sc.pp.pca(adata, n_comps=50, use_highly_variable=True)

    # 5) Optional Harmony batch correction.
    if batch_key and batch_key in adata.obs and hm is not None:
        ho = hm.run_harmony(adata.obsm["X_pca"], adata.obs, batch_key)
        adata.obsm["X_pca_harmony"] = ho.Z_corr.T
        rep = "X_pca_harmony"
    else:
        rep = "X_pca"

    # 6) Neighbors -> cluster -> UMAP.
    sc.pp.neighbors(adata, n_neighbors=15, n_pcs=n_pcs, use_rep=rep)
    sc.tl.leiden(adata, resolution=resolution)
    sc.tl.umap(adata)

    # 7) Per-cluster marker genes.
    sc.tl.rank_genes_groups(adata, groupby="leiden", method="wilcoxon")
    markers = pd.DataFrame({
        cluster: [adata.uns["rank_genes_groups"]["names"][cluster][i]
                  for i in range(20)]
        for cluster in adata.obs["leiden"].cat.categories
    })

    # 8) Provenance.
    adata.uns["pipeline"] = {
        "n_top_genes": n_top_genes,
        "n_pcs":       n_pcs,
        "resolution":  resolution,
        "batch_key":   batch_key,
        "integration": "harmony" if (batch_key and hm) else "none",
    }

    if out_h5ad:    adata.write_h5ad(out_h5ad, compression="gzip")
    if out_markers: markers.to_csv(out_markers, index=False)
    return adata, markers


adata = sc.read_h5ad("qc_filtered.h5ad")
adata, markers = cluster_and_annotate(
    adata, batch_key="sample",
    out_h5ad=Path("clustered.h5ad"),
    out_markers=Path("markers.csv"),
)
print(markers.head(10))

# Decision rule:
#   Single sample, exploratory                  -> default pipeline (no batch_key).
#   Multiple samples / patients                 -> batch_key on HVG + Harmony or scvi.
#   Need batch correction with deep learning    -> scvi-tools (slower; better at noise).
#   Want fewer / more clusters                  -> tune leiden resolution (0.4 -> 1.5).
#   Visualization                                -> UMAP for general; t-SNE if you must.
#   Trajectory analysis                          -> scanpy.tl.dpt or scvelo (RNA velocity).
#   Differential expression cluster vs rest      -> rank_genes_groups (Wilcoxon default).
#   Differential expression between conditions   -> pseudobulk + DESeq2 / edgeR (NOT cluster-level
#                                                    Wilcoxon - underpowered + biased).

# Anti-pattern:
#   sc.tl.rank_genes_groups(adata, ..., use_raw=False)
#                                              # after sc.pp.scale
# Z-scored expression has near-zero mean - rank_genes_groups produces
# nonsensical fold-changes. Either run BEFORE scale, or set use_raw=True
# (scanpy stashes pre-scale data in adata.raw if you assigned it).
```

## Decision Rule

```text
Single sample, exploratory                  -> default pipeline (no batch_key).
Multiple samples / patients                 -> batch_key on HVG + Harmony or scvi.
Need batch correction with deep learning    -> scvi-tools (slower; better at noise).
Want fewer / more clusters                  -> tune leiden resolution (0.4 -> 1.5).
Visualization                                -> UMAP for general; t-SNE if you must.
Trajectory analysis                          -> scanpy.tl.dpt or scvelo (RNA velocity).
Differential expression cluster vs rest      -> rank_genes_groups (Wilcoxon default).
Differential expression between conditions   -> pseudobulk + DESeq2 / edgeR (NOT cluster-level
                                                 Wilcoxon - underpowered + biased).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   sc.tl.rank_genes_groups(adata, ..., use_raw=False)
>                                              # after sc.pp.scale
> Z-scored expression has near-zero mean - rank_genes_groups produces
> nonsensical fold-changes. Either run BEFORE scale, or set use_raw=True
> (scanpy stashes pre-scale data in adata.raw if you assigned it).

## Tips

- Standard pipeline order: HVG (on counts) → normalize_total → log1p → scale → PCA → neighbors → leiden + UMAP.
- Stash raw counts in `adata.layers["counts"]` and `adata.raw = adata` (post-log) so plots have the right values.
- Tune `leiden` resolution from 0.4 (coarse) to 1.5 (fine) — there's no "right" cluster count.
- For multi-sample data, pass `batch_key` to `highly_variable_genes` and integrate with **Harmony** or **scvi-tools**.
- For differential expression between conditions, use **pseudobulk + DESeq2/edgeR** — cluster-level Wilcoxon underestimates p-values.

## Common Mistake

> [!warning] Running `rank_genes_groups` after `sc.pp.scale` without `use_raw=True` — z-scored expression has ~zero mean, fold-changes are meaningless. Set `adata.raw = adata` before scaling and pass `use_raw=True`.

## See Also

- [[Sections/bioinformatics/scanpy/scanpy-anndata-basics|AnnData / sc.read — load + inspect a single-cell dataset (Bioinformatics)]]
- [[Sections/bioinformatics/scanpy/_Index|Bioinformatics → scanpy + AnnData — single-cell RNA-seq]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
