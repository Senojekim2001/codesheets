---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "pysam"
id: "pysam-bam-pileup"
title: "pysam.AlignmentFile / fetch / pileup — read BAM"
category: "pysam"
subtitle: "pysam.AlignmentFile (mode \"rb\" for BAM, \"rc\" for CRAM, \"r\" for SAM), .fetch (needs .bai/.csi index — pysam.index() to build), .pileup (per-column iteration, min_base_quality, max_depth), 0-based half-open coords (BAM) vs 1-based (VCF/SAM text), AlignedSegment fields (query_name, reference_start, cigar, mapping_quality, is_reverse)"
signature_short: "with pysam.AlignmentFile(path, \"rb\") as bam: for read in bam.fetch(\"chr1\", 1000, 2000): ... for col in bam.pileup(\"chr1\", 1000, 2000): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pysam.AlignmentFile / fetch / pileup — read BAM"
  - "pysam-bam-pileup"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/pysam"
  - "category/pysam"
  - "tier/tiered"
---

# pysam.AlignmentFile / fetch / pileup — read BAM

> pysam.AlignmentFile (mode "rb" for BAM, "rc" for CRAM, "r" for SAM), .fetch (needs .bai/.csi index — pysam.index() to build), .pileup (per-column iteration, min_base_quality, max_depth), 0-based half-open coords (BAM) vs 1-based (VCF/SAM text), AlignedSegment fields (query_name, reference_start, cigar, mapping_quality, is_reverse)

## Overview

`fetch(contig, start, end)` returns reads OVERLAPPING the region; `pileup` gives per-position columns (`PileupColumn` with `.reference_pos`, `.nsegments`, `.pileups`). Both need an index — `pysam.index("aligned.bam")` builds `aligned.bam.bai`. The `AlignedSegment` exposes everything you need: `query_name`, `reference_start` (0-based!), `cigartuples`, `mapping_quality`, `is_reverse`, `query_sequence`, `query_qualities`. Three depths solve the SAME task — count how many reads cover position chr1:1,000,000 with mapq ≥ 20 — at depths: bare fetch + Python counter → pileup() filtered by base/mapping quality → multi-region scan with pileup, per-allele frequency, depth distribution.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Count high-quality reads covering chr1:1,000,000.
- **Junior** — SAME — coverage at chr1:1,000,000 — but using pileup which gives the actual called base + base quality per read.
- **Senior** — SAME — depth + allele frequencies at many sites — production: stream a list of variants (BED-like input), per-site report, handle CRAM with reference, parallelizable per chromosome.

## Signature

```python
with pysam.AlignmentFile(path, "rb") as bam: for read in bam.fetch("chr1", 1000, 2000): ... for col in bam.pileup("chr1", 1000, 2000): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Count high-quality reads covering chr1:1,000,000.
# APPROACH  - bam.fetch over a 1-bp window; filter on mapping_quality.
# STRENGTHS - Direct; iterates only reads in the region (with index).
# WEAKNESSES- Doesn't filter by base quality; counts every overlapping
#             read regardless of which base it shows.
import pysam

# BAM must be indexed: $ samtools index aligned.bam   (or pysam.index("aligned.bam"))
with pysam.AlignmentFile("aligned.bam", "rb") as bam:
    pos = 1_000_000                                   # 0-based pysam coords (genomic ~1Mb)
    n = 0
    for read in bam.fetch("chr1", pos, pos + 1):
        if read.is_unmapped or read.is_duplicate:
            continue
        if read.mapping_quality < 20:
            continue
        n += 1
print(f"high-quality reads covering chr1:{pos}: {n}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — coverage at chr1:1,000,000 — but using pileup which
#             gives the actual called base + base quality per read.
# APPROACH  - bam.pileup with min_base_quality + min_mapping_quality.
# STRENGTHS - Per-base allele counts (the real coverage view).
# WEAKNESSES- pileup is slower than fetch; truncate=True is essential.
import pysam
from collections import Counter

with pysam.AlignmentFile("aligned.bam", "rb") as bam:
    pos = 1_000_000
    counts: Counter = Counter()

    # truncate=True = only yield columns inside the (start, end) window.
    # Without it, pileup walks every position any read in the region touches.
    for col in bam.pileup("chr1", pos, pos + 1,
                          truncate=True,
                          min_base_quality=20,
                          min_mapping_quality=20):
        if col.reference_pos != pos:
            continue
        # col.get_query_sequences returns the called base per read at this column.
        for base in col.get_query_sequences():
            if base:                                  # '' = skip / del / refskip
                counts[base.upper()] += 1
    print(f"chr1:{pos} alleles: {dict(counts)}")     # e.g. {'A': 38, 'G': 2}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — depth + allele frequencies at many sites — production:
#             stream a list of variants (BED-like input), per-site report,
#             handle CRAM with reference, parallelizable per chromosome.
# APPROACH  - Open AlignmentFile once per worker; iterate sites; pileup
#             with truncate; collect dict of records.
# STRENGTHS - Sub-second per region; readable per-site stats; CRAM-aware.
# WEAKNESSES- Multiprocessing requires per-worker file handle (no fork-safe).
from __future__ import annotations
import pysam
from collections import Counter
from dataclasses import dataclass
from pathlib import Path


@dataclass
class SiteStats:
    contig: str
    pos: int                                          # 0-based
    depth: int
    alleles: dict[str, int]
    ref_allele: str | None = None

    @property
    def ref_frac(self) -> float:
        if not self.ref_allele or self.depth == 0:
            return float("nan")
        return self.alleles.get(self.ref_allele, 0) / self.depth


def site_stats(
    bam: pysam.AlignmentFile,
    contig: str, pos: int,                            # 0-based!
    *, min_bq: int = 20, min_mq: int = 20,
    ref_fasta: pysam.FastaFile | None = None,
) -> SiteStats:
    counts: Counter = Counter()
    for col in bam.pileup(contig, pos, pos + 1,
                          truncate=True,
                          min_base_quality=min_bq,
                          min_mapping_quality=min_mq):
        if col.reference_pos != pos:
            continue
        for b in col.get_query_sequences(mark_matches=False, mark_ends=False,
                                         add_indels=False):
            if b:
                counts[b.upper()] += 1
    ref = ref_fasta.fetch(contig, pos, pos + 1).upper() if ref_fasta else None
    return SiteStats(
        contig=contig, pos=pos,
        depth=sum(counts.values()),
        alleles=dict(counts),
        ref_allele=ref,
    )


def scan_sites(bam_path: Path, sites: list[tuple[str, int]],
               ref_fasta_path: Path | None = None) -> list[SiteStats]:
    """sites: list of (contig, 0-based pos)."""
    mode = "rc" if bam_path.suffix == ".cram" else "rb"
    with pysam.AlignmentFile(bam_path, mode,
                             reference_filename=str(ref_fasta_path) if ref_fasta_path else None
                             ) as bam:
        ref = pysam.FastaFile(str(ref_fasta_path)) if ref_fasta_path else None
        try:
            return [site_stats(bam, c, p, ref_fasta=ref) for c, p in sites]
        finally:
            if ref: ref.close()


# Use it (positions in 0-based pysam coords)
sites = [("chr1", 999_999), ("chr1", 1_000_000), ("chr1", 1_000_001)]
results = scan_sites(Path("aligned.bam"), sites,
                     ref_fasta_path=Path("ref.fasta"))   # ref.fasta.fai must exist
for s in results:
    print(f"{s.contig}:{s.pos+1}  depth={s.depth}  ref={s.ref_allele}  "
          f"alleles={s.alleles}  ref_frac={s.ref_frac:.3f}")

# Decision rule:
#   Iterate every read                       -> bam.fetch (no contig) - whole file.
#   Region of reads                           -> bam.fetch(contig, start, end) (needs .bai).
#   Per-base column view                      -> bam.pileup(contig, start, end, truncate=True).
#   Need ALL columns including indels        -> add_indels=True in get_query_sequences.
#   CRAM file                                 -> mode="rc" + reference_filename=.
#   Need genomic depth across regions         -> bedtools genomecov (faster) or mosdepth.
#   Multi-process scan                        -> open AlignmentFile inside the worker
#                                                (NOT in parent and pass).
#   Coordinates from a VCF                    -> VCF is 1-based; subtract 1 before fetch.

# Anti-pattern:
#   for col in bam.pileup("chr1", 1000, 2000): ...    # without truncate=True
# pileup walks every position TOUCHED by any read overlapping (1000, 2000) -
# can extend hundreds of bp outside your window. Always pass truncate=True.
```

## Decision Rule

```text
Iterate every read                       -> bam.fetch (no contig) - whole file.
Region of reads                           -> bam.fetch(contig, start, end) (needs .bai).
Per-base column view                      -> bam.pileup(contig, start, end, truncate=True).
Need ALL columns including indels        -> add_indels=True in get_query_sequences.
CRAM file                                 -> mode="rc" + reference_filename=.
Need genomic depth across regions         -> bedtools genomecov (faster) or mosdepth.
Multi-process scan                        -> open AlignmentFile inside the worker
                                             (NOT in parent and pass).
Coordinates from a VCF                    -> VCF is 1-based; subtract 1 before fetch.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for col in bam.pileup("chr1", 1000, 2000): ...    # without truncate=True
> pileup walks every position TOUCHED by any read overlapping (1000, 2000) -
> can extend hundreds of bp outside your window. Always pass truncate=True.

## Tips

- pysam coordinates are **0-based half-open** — the BAM/BED convention. VCF is 1-based — subtract 1 before passing positions.
- `fetch` needs an index (`.bai` or `.csi`); `pysam.index("aligned.bam")` builds one.
- `pileup(..., truncate=True)` keeps the iteration inside your window — without it, pileup walks every position touched by any overlapping read.
- For CRAM, open with `mode="rc"` and `reference_filename=` — CRAM stores reads compressed against a reference.
- For depth-only at scale, `mosdepth` (CLI) is 10× faster than any pysam loop.

## Common Mistake

> [!warning] Forgetting `truncate=True` on `pileup` — it walks every column touched by any overlapping read, often hundreds of bp outside your window.

## See Also

- [[Sections/bioinformatics/pysam/pysam-vcf|pysam.VariantFile — read and filter VCF/BCF (Bioinformatics)]]
- [[Sections/bioinformatics/pysam/_Index|Bioinformatics → pysam — BAM/SAM/VCF/CRAM]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
