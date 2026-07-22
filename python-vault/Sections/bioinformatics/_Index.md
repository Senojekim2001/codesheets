---
type: "file-index"
domain: "python"
file: "bioinformatics"
title: "Bioinformatics"
tags:
  - "python"
  - "python/bioinformatics"
  - "index"
---

# Bioinformatics

> 7 entries across 4 sections.

## Biopython — sequences, FASTA/FASTQ, alignment · 2

- [[Sections/bioinformatics/biopython/biopython-sequences-io|SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank]] — Biopython models biological sequences as `SeqRecord` (a `Seq` plus id, description, features, annotations). `SeqIO.parse(path, format)` returns an iterator over records — never load 30 GB FASTQ into a list. `SeqIO.write` reverses the trip. Formats: `"fasta"`, `"fastq"`, `"genbank"`, `"embl"` — and many more via the underlying `Bio.SeqIO` framework.
- [[Sections/bioinformatics/biopython/biopython-alignment-blast|PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST]] — For a quick pairwise alignment, `Bio.Align.PairwiseAligner` does global (Needleman-Wunsch) or local (Smith-Waterman) with substitution matrices like `BLOSUM62`. For database searches, `Bio.Blast.NCBIWWW.qblast` runs remote BLAST against NCBI; for production use, install BLAST locally and run `blastn`/`blastp` via `subprocess`.

## pysam — BAM/SAM/VCF/CRAM · 2

- [[Sections/bioinformatics/pysam/pysam-bam-pileup|pysam.AlignmentFile / fetch / pileup — read BAM]] — `pysam` wraps htslib (the same C library samtools/bcftools use). `AlignmentFile("aligned.bam", "rb")` opens a BAM; `.fetch(contig, start, end)` iterates reads in a region (requires an `aligned.bam.bai` index); `.pileup(...)` gives per-base column iteration. **Coordinates are 0-based half-open** in pysam — the opposite of VCF.
- [[Sections/bioinformatics/pysam/pysam-vcf|pysam.VariantFile — read and filter VCF/BCF]] — `pysam.VariantFile("variants.vcf.gz", "r")` opens a tabix-indexed VCF/BCF. Iterate records; access `.contig`, `.pos` (1-based!), `.ref`, `.alts`, `.qual`, `.filter`, `.samples[name]["GT"]`, `.info["AF"]`. **VCF is 1-based** while BAM/pysam coords are 0-based — every cross-format script needs a +/-1.

## scanpy + AnnData — single-cell RNA-seq · 2

- [[Sections/bioinformatics/scanpy/scanpy-anndata-basics|AnnData / sc.read — load + inspect a single-cell dataset]] — `AnnData` is the single-cell analogue of a DataFrame: `.X` is the cells×genes count matrix; `.obs` is per-cell metadata (sample, batch, cluster); `.var` is per-gene metadata; `.obsm["X_umap"]` holds embeddings; `.uns` is unstructured (parameters, color maps). `scanpy.read_h5ad` and `read_10x_h5` cover most loads.
- [[Sections/bioinformatics/scanpy/scanpy-pca-umap-cluster|normalize → HVG → PCA → neighbors → UMAP → leiden]] — The standard scanpy workflow: normalize counts (`normalize_total`), log1p, pick highly variable genes (`highly_variable_genes`), scale, PCA, neighbors graph (kNN over PCA), Leiden clustering, UMAP for visualization. Save intermediate state in `adata.layers["counts"]` if you want to keep raw counts available.

## When to reach for which bioinformatics stack · 1

- [[Sections/bioinformatics/patterns/bio-stack-decision|Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools]] — Biopython is the classroom toolbox; pysam is the production read/variant API; Snakemake / Nextflow are workflow managers (the right place for multi-step pipelines); CLI tools (samtools, bcftools, bwa, minimap2, DIAMOND) are usually faster than any pure-Python equivalent. The Python role is glue, not muscle.
