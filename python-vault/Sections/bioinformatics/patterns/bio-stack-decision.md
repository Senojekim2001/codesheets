---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "patterns"
id: "bio-stack-decision"
title: "Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools"
category: "patterns"
subtitle: "Biopython (sequences, BLAST, MSA APIs - good for teaching, sometimes too slow) vs pysam (htslib BAM/VCF/CRAM - production read/variant API) vs Snakemake (Python-native rule files, conda env per rule) vs Nextflow (Groovy DSL, Docker-first, Seqera Tower) vs CLI giants (samtools, bcftools, bwa, minimap2, DIAMOND, bedtools, mosdepth)"
signature_short: "# parse a sequence file        -> Biopython.SeqIO\\n# read BAM / VCF              -> pysam\\n# multi-step pipeline         -> Snakemake or Nextflow\\n# anything heavyweight        -> CLI tool via subprocess; Python is glue"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools"
  - "bio-stack-decision"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools

> Biopython (sequences, BLAST, MSA APIs - good for teaching, sometimes too slow) vs pysam (htslib BAM/VCF/CRAM - production read/variant API) vs Snakemake (Python-native rule files, conda env per rule) vs Nextflow (Groovy DSL, Docker-first, Seqera Tower) vs CLI giants (samtools, bcftools, bwa, minimap2, DIAMOND, bedtools, mosdepth)

## Overview

Biopython is the pedagogical Swiss army knife — slow for genome-scale work but unbeatable for teaching, format conversion, and single-sequence analysis. pysam is the htslib binding — same engine as samtools, fast enough for production. For multi-step pipelines (QC → align → call → annotate), reach for **Snakemake** (Python-native, simple, the right pick for solo / small teams) or **Nextflow** (Groovy DSL, Docker-first, dominant in industrial pharma + nf-core community pipelines). For raw speed, the C/Rust CLI giants (samtools, bcftools, minimap2, DIAMOND, mosdepth) beat anything you can write in Python. Three depths solve the SAME task — call variants from a FASTQ file end-to-end — at depths: pure-Python (Biopython) prototype → pysam-orchestrated subprocess pipeline → Snakemake DAG that runs the same steps with conda envs and resumable execution.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — "Pure Python" variant prototype: trim FASTQ + count reads.
- **Junior** — SAME — variant pipeline — but as a real subprocess pipeline: bwa mem -> samtools sort -> bcftools call.
- **Senior** — SAME — variant pipeline — production: Snakemake workflow, conda env per rule, resumable, parallel across samples.

## Signature

```python
# parse a sequence file        -> Biopython.SeqIO\n# read BAM / VCF              -> pysam\n# multi-step pipeline         -> Snakemake or Nextflow\n# anything heavyweight        -> CLI tool via subprocess; Python is glue
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - "Pure Python" variant prototype: trim FASTQ + count reads.
# APPROACH  - Biopython for FASTQ I/O.
# STRENGTHS - One language; no system deps.
# WEAKNESSES- Real variant calling needs alignment (bwa/minimap2) and a
#             caller (bcftools/GATK) - not Python's strength.
from Bio import SeqIO
from statistics import mean

n = 0
high_q = 0
for rec in SeqIO.parse("reads.fastq.gz", "fastq"):
    n += 1
    if mean(rec.letter_annotations["phred_quality"]) >= 30:
        high_q += 1

print(f"reads: {n}; high-quality: {high_q}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — variant pipeline — but as a real subprocess pipeline:
#             bwa mem -> samtools sort -> bcftools call.
# APPROACH  - Python orchestrates; CLI tools do the heavy lifting.
# STRENGTHS - 100x faster than Python for alignment / sort / call.
# WEAKNESSES- Not resumable; no parallelism over samples; no conda envs.
import subprocess
from pathlib import Path


def call_variants(reads_fq: Path, ref_fa: Path, out_bam: Path,
                  out_vcf: Path, *, threads: int = 4) -> None:
    # 1) Align + sort.
    subprocess.run(
        f"bwa mem -t {threads} {ref_fa} {reads_fq} | "
        f"samtools sort -@ {threads} -o {out_bam} -",
        shell=True, check=True,
    )
    subprocess.run(["samtools", "index", str(out_bam)], check=True)

    # 2) Call variants.
    subprocess.run(
        f"bcftools mpileup -f {ref_fa} {out_bam} | "
        f"bcftools call -mv --ploidy 2 -Oz -o {out_vcf}",
        shell=True, check=True,
    )
    subprocess.run(["bcftools", "index", str(out_vcf)], check=True)


call_variants(
    Path("reads.fastq.gz"), Path("ref.fasta"),
    Path("aligned.bam"), Path("variants.vcf.gz"),
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — variant pipeline — production: Snakemake workflow,
#             conda env per rule, resumable, parallel across samples.
# APPROACH  - Snakefile DSL with rules + wildcards; threads + resources;
#             samples in a config.yaml.
# STRENGTHS - Reproducible (per-rule conda); resumes after failure; runs
#             N samples in parallel; portable to clusters/cloud.
# WEAKNESSES- Snakemake is a separate tool to learn; Nextflow is more
#             common in industrial pharma but Groovy is heavier.

# === Snakefile ===
"""
configfile: "config.yaml"

SAMPLES = config["samples"]                 # ["s1", "s2", "s3"]
REF     = config["reference"]               # path to ref.fasta

rule all:
    input:
        expand("results/{s}.vcf.gz", s=SAMPLES)

rule align:
    input:
        fq  = "data/{sample}.fastq.gz",
        ref = REF,
    output:
        bam = "work/{sample}.bam",
    threads: 8
    resources:
        mem_mb = 16000
    conda: "envs/align.yaml"
    shell: '''
        bwa mem -t {threads} {input.ref} {input.fq} \
            | samtools sort -@ {threads} -o {output.bam} -
        samtools index {output.bam}
    '''

rule call:
    input:
        bam = "work/{sample}.bam",
        ref = REF,
    output:
        vcf = "results/{sample}.vcf.gz",
    threads: 4
    conda: "envs/call.yaml"
    shell: '''
        bcftools mpileup -f {input.ref} {input.bam} \
            | bcftools call -mv --ploidy 2 -Oz -o {output.vcf}
        bcftools index {output.vcf}
    '''
"""

# === envs/align.yaml ===
"""
channels: [bioconda, conda-forge]
dependencies:
  - bwa
  - samtools
"""

# === envs/call.yaml ===
"""
channels: [bioconda, conda-forge]
dependencies:
  - bcftools
"""

# === config.yaml ===
"""
samples:
  - sample_a
  - sample_b
reference: data/ref.fasta
"""

# Run with:
#   $ snakemake --use-conda --cores 16
# Resume an interrupted run by re-running the same command.

# Decision rule:
#   Teaching / one-off scripts                       -> Biopython.
#   Production read / variant access                  -> pysam.
#   Multi-step pipeline (>3 stages, multi-sample)     -> Snakemake or Nextflow.
#   Industrial pharma / dominant ecosystem            -> Nextflow (nf-core).
#   Solo / small team / Python-first                  -> Snakemake.
#   Anything heavyweight (align, sort, call, count)   -> CLI giants (bwa, samtools, bcftools,
#                                                        minimap2, DIAMOND, mosdepth, bedtools).
#   Massive cohorts (10k+ samples)                    -> Hail (Spark-based) or
#                                                        glow (Spark-based variant ops).
#   Need GUI for biologists                           -> Galaxy or terra.bio.

# Anti-pattern:
#   for read in SeqIO.parse(big_fastq):  ...
#       count_kmers_in_python(read.seq)
# Pure Python over 100M reads finishes next week. Pipe to a C tool:
#       jellyfish, BBTools, or sourmash for k-mers; bwa/minimap2 for alignment.
# Python is glue; let the C/Rust giants do the muscle work.
```

## Decision Rule

```text
Teaching / one-off scripts                       -> Biopython.
Production read / variant access                  -> pysam.
Multi-step pipeline (>3 stages, multi-sample)     -> Snakemake or Nextflow.
Industrial pharma / dominant ecosystem            -> Nextflow (nf-core).
Solo / small team / Python-first                  -> Snakemake.
Anything heavyweight (align, sort, call, count)   -> CLI giants (bwa, samtools, bcftools,
                                                     minimap2, DIAMOND, mosdepth, bedtools).
Massive cohorts (10k+ samples)                    -> Hail (Spark-based) or
                                                     glow (Spark-based variant ops).
Need GUI for biologists                           -> Galaxy or terra.bio.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for read in SeqIO.parse(big_fastq):  ...
>       count_kmers_in_python(read.seq)
> Pure Python over 100M reads finishes next week. Pipe to a C tool:
>       jellyfish, BBTools, or sourmash for k-mers; bwa/minimap2 for alignment.
> Python is glue; let the C/Rust giants do the muscle work.

## Tips

- **Biopython** for sequences (FASTA/FASTQ I/O, alignment objects); slow but unbeatable for teaching and one-off scripts.
- **pysam** for BAM/VCF/CRAM — same htslib as samtools, fast enough for production.
- **Snakemake** (Python DSL) and **Nextflow** (Groovy DSL) are the workflow managers; Snakemake for solo/small teams, Nextflow for industrial pharma + nf-core ecosystem.
- For raw speed, the C/Rust CLI giants (`bwa`, `samtools`, `bcftools`, `minimap2`, `DIAMOND`, `mosdepth`) beat anything pure-Python.
- Python's role in bioinformatics is **glue + analysis** — write the workflow, parse the outputs, plot the results. Never pure-Python a million reads.

## Common Mistake

> [!warning] Implementing alignment, k-mer counting, or variant calling in pure Python. The CLI giants are 100-1000× faster — your job is to orchestrate them, parse their outputs, and analyze the results.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/bioinformatics/patterns/_Index|Bioinformatics → When to reach for which bioinformatics stack]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
