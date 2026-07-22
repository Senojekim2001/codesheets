---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "pysam"
id: "pysam-vcf"
title: "pysam.VariantFile — read and filter VCF/BCF"
category: "pysam"
subtitle: "pysam.VariantFile (read .vcf / .vcf.gz / .bcf), 1-based positions, .pos vs .start (0-based attribute), .info[...] for AF/DP/etc., .samples[name] for per-sample fields, .filter for PASS/FAIL flags, fetch needs tabix index (vcf.gz.tbi)"
signature_short: "with pysam.VariantFile(path) as vcf: for rec in vcf.fetch(\"chr1\", start, end): rec.pos, rec.ref, rec.alts, rec.samples[\"NA12878\"][\"GT\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pysam.VariantFile — read and filter VCF/BCF"
  - "pysam-vcf"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/pysam"
  - "category/pysam"
  - "tier/tiered"
---

# pysam.VariantFile — read and filter VCF/BCF

> pysam.VariantFile (read .vcf / .vcf.gz / .bcf), 1-based positions, .pos vs .start (0-based attribute), .info[...] for AF/DP/etc., .samples[name] for per-sample fields, .filter for PASS/FAIL flags, fetch needs tabix index (vcf.gz.tbi)

## Overview

`VariantFile` reads VCF (uncompressed or bgzipped) and BCF. `record.pos` is 1-based (matches VCF spec); `record.start` is 0-based (matches BAM/pysam). `record.alts` is a tuple of alt alleles. `record.info[k]` returns header-typed values; `record.samples[sample_name][format_key]` accesses per-sample data (`GT`, `DP`, `AD`, `GQ`). For region queries you need a tabix index (`pysam.tabix_index("variants.vcf.gz", preset="vcf")`). Three depths solve the SAME task — list rare variants (AF < 0.01) in a region with PASS filter — at depths: open + iterate + filter → use fetch on a tabix-indexed file → multi-sample genotype filter (require ≥1 het carrier with DP ≥ 10 and GQ ≥ 30).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Print rare PASS SNVs (AF < 0.01) on chr1.
- **Junior** — SAME — rare PASS SNVs on chr1:1M-2M — using region fetch.
- **Senior** — SAME — rare PASS SNVs — production: require >= 1 het carrier with DP >= 10 and GQ >= 30, write filtered VCF + summary table.

## Signature

```python
with pysam.VariantFile(path) as vcf: for rec in vcf.fetch("chr1", start, end): rec.pos, rec.ref, rec.alts, rec.samples["NA12878"]["GT"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Print rare PASS SNVs (AF < 0.01) on chr1.
# APPROACH  - Iterate all records; filter in Python.
# STRENGTHS - Three lines.
# WEAKNESSES- Whole-file scan; no random access; no sample-level checks.
import pysam

with pysam.VariantFile("variants.vcf.gz") as vcf:
    for rec in vcf:
        if rec.contig != "chr1":
            continue
        if "PASS" not in rec.filter:
            continue
        af = rec.info.get("AF", (0,))[0]              # AF is often a tuple
        if af < 0.01:
            print(f"{rec.contig}:{rec.pos} {rec.ref}>{','.join(rec.alts)}  AF={af}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — rare PASS SNVs on chr1:1M-2M — using region fetch.
# APPROACH  - VariantFile.fetch(contig, start_0based, end_0based).
# STRENGTHS - O(region) instead of O(file); needs .vcf.gz.tbi index.
# WEAKNESSES- Index assumed; will RuntimeError if missing.
import pysam

# Build the tabix index once if missing:
# pysam.tabix_index("variants.vcf.gz", preset="vcf", force=False)

with pysam.VariantFile("variants.vcf.gz") as vcf:
    # fetch coordinates are 0-based half-open (BAM-style, NOT VCF 1-based).
    # rec.pos is still reported as 1-based.
    for rec in vcf.fetch("chr1", 1_000_000 - 1, 2_000_000):
        if "PASS" not in rec.filter:
            continue
        if len(rec.ref) != 1 or any(len(a) != 1 for a in rec.alts):
            continue                                   # SNVs only
        af = rec.info.get("AF", (0,))[0]
        if af < 0.01:
            print(f"{rec.contig}:{rec.pos} {rec.ref}>{','.join(rec.alts)}  AF={af}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — rare PASS SNVs — production: require >= 1 het carrier
#             with DP >= 10 and GQ >= 30, write filtered VCF + summary table.
# APPROACH  - Stream-filter; write via VariantFile("w") with copied header;
#             collect per-sample carrier counts.
# STRENGTHS - Real callset filtering; preserves header; outputs new VCF +
#             summary CSV; sample-aware.
# WEAKNESSES- Genotype semantics differ for haploid / multi-allelic - this
#             example assumes diploid biallelic SNVs.
from __future__ import annotations
import csv
import pysam
from collections import Counter
from pathlib import Path


def is_snv(rec) -> bool:
    return len(rec.ref) == 1 and rec.alts and all(len(a) == 1 for a in rec.alts)


def is_het(gt: tuple | None) -> bool:
    if gt is None or None in gt:
        return False
    return len(set(gt)) == 2 and 0 in gt              # 0/1, 1/0


def carrier_count(rec, *, min_dp: int = 10, min_gq: int = 30) -> int:
    n = 0
    for sample in rec.samples.values():
        gt = sample.get("GT")
        if not is_het(gt):
            continue
        dp = sample.get("DP") or 0
        gq = sample.get("GQ") or 0
        if dp >= min_dp and gq >= min_gq:
            n += 1
    return n


def filter_callset(
    src: Path, out_vcf: Path, out_csv: Path,
    *, contig: str, start: int, end: int,           # 0-based
    max_af: float = 0.01,
    min_carriers: int = 1,
) -> dict:
    counts = Counter()
    with pysam.VariantFile(src) as vcf_in:
        with pysam.VariantFile(out_vcf, "w", header=vcf_in.header) as vcf_out, \
             open(out_csv, "w", newline="") as csv_fh:
            writer = csv.writer(csv_fh)
            writer.writerow(["contig", "pos", "ref", "alts", "AF", "n_carriers"])

            for rec in vcf_in.fetch(contig, start, end):
                counts["total"] += 1
                if "PASS" not in rec.filter:                     continue
                if not is_snv(rec):                              continue
                af = rec.info.get("AF", (0,))[0]
                if af >= max_af:                                  continue
                n = carrier_count(rec)
                if n < min_carriers:                              continue

                vcf_out.write(rec)
                writer.writerow([rec.contig, rec.pos, rec.ref,
                                 ",".join(rec.alts), af, n])
                counts["kept"] += 1
    return dict(counts)


print(filter_callset(
    Path("variants.vcf.gz"),
    out_vcf=Path("rare_pass.vcf.gz"),
    out_csv=Path("rare_pass.csv"),
    contig="chr1", start=1_000_000 - 1, end=2_000_000,
))

# Decision rule:
#   Whole-file scan                              -> for rec in VariantFile(...).
#   Region scan                                  -> .fetch(contig, start, end) on .vcf.gz +
#                                                    .tbi index.
#   Need to write VCF                            -> VariantFile("...vcf.gz", "w", header=...).
#   Multi-sample callset                          -> rec.samples[name][KEY] for per-sample fields.
#   Indel-aware                                   -> handle len(ref) and any len(alt) > 1.
#   Multi-allelic (split or join)                 -> use bcftools norm -m for splitting.
#   Coordinates between BAM and VCF              -> BAM/pysam 0-based; VCF.pos 1-based;
#                                                    VCF.start 0-based attribute exists.
#   Massive callset (gnomAD whole genome)         -> bcftools query is faster than Python.

# Anti-pattern:
#   bam.fetch("chr1", rec.pos, rec.pos + 1)       # rec.pos is 1-based
# Off-by-one because BAM coords are 0-based. Use rec.start (0-based) or
# subtract: bam.fetch("chr1", rec.pos - 1, rec.pos).
```

## Decision Rule

```text
Whole-file scan                              -> for rec in VariantFile(...).
Region scan                                  -> .fetch(contig, start, end) on .vcf.gz +
                                                 .tbi index.
Need to write VCF                            -> VariantFile("...vcf.gz", "w", header=...).
Multi-sample callset                          -> rec.samples[name][KEY] for per-sample fields.
Indel-aware                                   -> handle len(ref) and any len(alt) > 1.
Multi-allelic (split or join)                 -> use bcftools norm -m for splitting.
Coordinates between BAM and VCF              -> BAM/pysam 0-based; VCF.pos 1-based;
                                                 VCF.start 0-based attribute exists.
Massive callset (gnomAD whole genome)         -> bcftools query is faster than Python.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   bam.fetch("chr1", rec.pos, rec.pos + 1)       # rec.pos is 1-based
> Off-by-one because BAM coords are 0-based. Use rec.start (0-based) or
> subtract: bam.fetch("chr1", rec.pos - 1, rec.pos).

## Tips

- `record.pos` is **1-based** (VCF convention); `record.start` is **0-based** (BAM-compatible).
- For region fetch you need a tabix index — build with `pysam.tabix_index(path, preset="vcf")`.
- INFO fields are typed by the header — `record.info["AF"]` returns the right Python type (tuple, int, float).
- Per-sample data lives in `record.samples[name][KEY]` — `GT`, `DP`, `AD`, `GQ`, `PL` are the common ones.
- For very large VCFs (gnomAD whole-genome), `bcftools query` is faster than any Python loop.

## Common Mistake

> [!warning] Mixing VCF's 1-based `pos` with BAM/pysam's 0-based `fetch` — off-by-one bugs that misalign reads and variants. Use `record.start` (0-based) when feeding BAM APIs.

## See Also

- [[Sections/bioinformatics/pysam/pysam-bam-pileup|pysam.AlignmentFile / fetch / pileup — read BAM (Bioinformatics)]]
- [[Sections/bioinformatics/pysam/_Index|Bioinformatics → pysam — BAM/SAM/VCF/CRAM]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
