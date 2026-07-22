---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "scanpy"
id: "scanpy-anndata-basics"
title: "AnnData / sc.read — load + inspect a single-cell dataset"
category: "scanpy"
subtitle: "AnnData (.X cells x genes, .obs DataFrame per cell, .var per gene, .obsm dict of embeddings, .layers raw vs normalized, .uns unstructured), sc.read_h5ad / read_10x_h5 / read_csv, sparse vs dense .X (csr_matrix typical), in-place mutation discipline (.copy() defensively)"
signature_short: "adata = sc.read_h5ad(\"data.h5ad\"); adata.obs[\"sample\"]; adata.var[\"gene_symbols\"]; adata.obsm[\"X_pca\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "AnnData / sc.read — load + inspect a single-cell dataset"
  - "scanpy-anndata-basics"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/scanpy"
  - "category/scanpy"
  - "tier/tiered"
---

# AnnData / sc.read — load + inspect a single-cell dataset

> AnnData (.X cells x genes, .obs DataFrame per cell, .var per gene, .obsm dict of embeddings, .layers raw vs normalized, .uns unstructured), sc.read_h5ad / read_10x_h5 / read_csv, sparse vs dense .X (csr_matrix typical), in-place mutation discipline (.copy() defensively)

## Overview

`AnnData` keeps cells (observations) as rows and genes (variables) as columns. `.obs` and `.var` are pandas DataFrames keyed by the index. The matrix `.X` is usually a `scipy.sparse.csr_matrix` for memory efficiency — many scanpy functions assume sparse and silently densify if not. **Mutating an AnnData in place is the convention** — `sc.pp.normalize_total(adata)` modifies adata; defensive copies (`adata.copy()`) before destructive steps prevent surprise. Three depths solve the SAME task — load a 10x matrix, inspect cells/genes, save as h5ad — at depths: read_10x_h5 + print shape → check sparsity, dtype, mt% → quality-control filter (mt%, min genes, min cells) and persist.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load a 10x single-cell matrix; print shape and head of obs.
- **Junior** — SAME — load 10x — plus mitochondrial gene annotation and basic QC fields.
- **Senior** — SAME — load 10x — production: QC metrics, doublet flag, standard filters (min genes, max mt%, max counts), persist as .h5ad with provenance in .uns.

## Signature

```python
adata = sc.read_h5ad("data.h5ad"); adata.obs["sample"]; adata.var["gene_symbols"]; adata.obsm["X_pca"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load a 10x single-cell matrix; print shape and head of obs.
# APPROACH  - sc.read_10x_h5 + adata.shape + adata.obs.head().
# STRENGTHS - One call.
# WEAKNESSES- No QC; .X may be huge sparse matrix; densifying it OOMs.
import scanpy as sc

adata = sc.read_10x_h5("filtered_feature_bc_matrix.h5")
print(adata)                                          # AnnData repr
print("shape:", adata.shape)                          # (n_cells, n_genes)
print(adata.obs.head())                               # often empty after raw load
print(adata.var.head())                               # gene_ids + gene_symbols
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — load 10x — plus mitochondrial gene annotation and
#             basic QC fields.
# APPROACH  - var_names_make_unique + tag mt genes + sc.pp.calculate_qc_metrics.
# STRENGTHS - Adds n_genes_by_counts, total_counts, pct_counts_mt to .obs.
# WEAKNESSES- Doesn't filter yet.
import scanpy as sc

adata = sc.read_10x_h5("filtered_feature_bc_matrix.h5")
adata.var_names_make_unique()                          # 10x can have duplicate symbols

# Mitochondrial QC: human mt genes start with "MT-"; mouse with "mt-".
adata.var["mt"] = adata.var_names.str.startswith("MT-")

sc.pp.calculate_qc_metrics(
    adata, qc_vars=["mt"], inplace=True, percent_top=None, log1p=False,
)

print(adata.obs[["n_genes_by_counts", "total_counts", "pct_counts_mt"]].describe())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — load 10x — production: QC metrics, doublet flag,
#             standard filters (min genes, max mt%, max counts), persist
#             as .h5ad with provenance in .uns.
# APPROACH  - All-in-one load_and_qc helper; record decisions in .uns;
#             return a copy so the original raw is untouched.
# STRENGTHS - Reproducible; provenance lives with the data; threshold
#             choices visible to downstream code.
# WEAKNESSES- Doublet detection uses scrublet (extra dep); thresholds
#             still need biological judgment per dataset.
from __future__ import annotations
import scanpy as sc
import scrublet as scr                                # pip install scrublet
import numpy as np
from pathlib import Path
from datetime import datetime, timezone


def load_and_qc(
    h5_path: Path,
    *,
    min_genes_per_cell: int = 200,
    min_cells_per_gene: int = 3,
    max_pct_mt: float = 20.0,
    max_total_counts: int | None = None,             # set after looking at distribution
    species: str = "human",                           # "human" -> MT-, "mouse" -> mt-
):
    adata = sc.read_10x_h5(h5_path)
    adata.var_names_make_unique()

    # 1) Annotate mt genes.
    mt_prefix = "MT-" if species == "human" else "mt-"
    adata.var["mt"] = adata.var_names.str.startswith(mt_prefix)

    # 2) QC metrics.
    sc.pp.calculate_qc_metrics(
        adata, qc_vars=["mt"], inplace=True,
        percent_top=None, log1p=False,
    )

    # 3) Doublet detection (Scrublet).
    counts = adata.X.toarray() if not hasattr(adata.X, "toarray") else adata.X
    scrub = scr.Scrublet(adata.X)
    doublet_scores, predicted_doublets = scrub.scrub_doublets(verbose=False)
    adata.obs["doublet_score"] = doublet_scores
    adata.obs["predicted_doublet"] = predicted_doublets.astype(bool)

    # 4) Filters.
    pre = adata.shape[0]
    sc.pp.filter_cells(adata, min_genes=min_genes_per_cell)
    sc.pp.filter_genes(adata, min_cells=min_cells_per_gene)
    adata = adata[adata.obs.pct_counts_mt < max_pct_mt].copy()
    if max_total_counts is not None:
        adata = adata[adata.obs.total_counts < max_total_counts].copy()
    adata = adata[~adata.obs.predicted_doublet].copy()

    # 5) Provenance.
    adata.uns["qc"] = {
        "filters": {
            "min_genes_per_cell":  min_genes_per_cell,
            "min_cells_per_gene":  min_cells_per_gene,
            "max_pct_mt":          max_pct_mt,
            "max_total_counts":    max_total_counts,
            "drop_doublets":       True,
        },
        "input_path":      str(h5_path),
        "input_n_cells":   int(pre),
        "kept_n_cells":    int(adata.shape[0]),
        "kept_n_genes":    int(adata.shape[1]),
        "species":         species,
        "loaded_at_utc":   datetime.now(timezone.utc).isoformat(),
        "scanpy_version":  sc.__version__,
    }
    return adata


adata = load_and_qc(Path("filtered_feature_bc_matrix.h5"),
                    species="human", max_pct_mt=15.0)
adata.write_h5ad("qc_filtered.h5ad", compression="gzip")
print(adata.uns["qc"])

# Decision rule:
#   10x output (.h5)                      -> sc.read_10x_h5.
#   10x mtx folder                         -> sc.read_10x_mtx.
#   .h5ad                                 -> sc.read_h5ad (round-trip from previous step).
#   csv / tsv counts                      -> sc.read_csv / read_text (slow; rare).
#   Sparse vs dense .X                    -> keep sparse (csr_matrix); densify only what
#                                            you need to plot.
#   Need provenance with the data         -> stash thresholds in adata.uns.
#   Want to undo a step                   -> .copy() the AnnData defensively.
#   Multiple samples                       -> read each, set adata.obs["batch"], then
#                                            adata.concatenate(...) or ad.concat([...]).

# Anti-pattern:
#   adata.X = adata.X.toarray()         # turn sparse into dense in place
# A 100k-cell x 30k-gene dense matrix is ~24 GB float32. Most scanpy
# functions handle sparse - keep it sparse. Densify only the slice you
# need (e.g. a marker-gene heatmap).
```

## Decision Rule

```text
10x output (.h5)                      -> sc.read_10x_h5.
10x mtx folder                         -> sc.read_10x_mtx.
.h5ad                                 -> sc.read_h5ad (round-trip from previous step).
csv / tsv counts                      -> sc.read_csv / read_text (slow; rare).
Sparse vs dense .X                    -> keep sparse (csr_matrix); densify only what
                                         you need to plot.
Need provenance with the data         -> stash thresholds in adata.uns.
Want to undo a step                   -> .copy() the AnnData defensively.
Multiple samples                       -> read each, set adata.obs["batch"], then
                                         adata.concatenate(...) or ad.concat([...]).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   adata.X = adata.X.toarray()         # turn sparse into dense in place
> A 100k-cell x 30k-gene dense matrix is ~24 GB float32. Most scanpy
> functions handle sparse - keep it sparse. Densify only the slice you
> need (e.g. a marker-gene heatmap).

## Tips

- `AnnData` layout: `.X` matrix (cells × genes), `.obs` per-cell metadata (DataFrame), `.var` per-gene metadata, `.obsm`/`.varm` embeddings, `.uns` unstructured.
- `.X` is usually a `scipy.sparse.csr_matrix` — leave it sparse; densifying a typical scRNA-seq matrix OOMs immediately.
- After `sc.read_10x_*`, always `adata.var_names_make_unique()` — 10x can ship duplicate gene symbols.
- Mitochondrial gene prefix is `"MT-"` for human, `"mt-"` for mouse, `"Mt-"` or `"mt:"` for some non-mammals — check before tagging.
- Stash QC thresholds in `adata.uns` so downstream consumers see your filtering choices alongside the data.

## Common Mistake

> [!warning] Calling `adata.X = adata.X.toarray()` to "make it easier" — turns a sparse 10⁵×3·10⁴ matrix into ~24 GB of float32. Keep sparse; densify only the slice you need.

## See Also

- [[Sections/bioinformatics/scanpy/scanpy-pca-umap-cluster|normalize → HVG → PCA → neighbors → UMAP → leiden (Bioinformatics)]]
- [[Sections/bioinformatics/scanpy/_Index|Bioinformatics → scanpy + AnnData — single-cell RNA-seq]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
