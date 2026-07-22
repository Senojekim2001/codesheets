---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "biopython"
id: "biopython-sequences-io"
title: "SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank"
category: "biopython"
subtitle: "Bio.SeqIO.parse (iterator), SeqIO.write (sequence or iterator), SeqRecord (id, seq, description, features, annotations), Seq object (.complement, .reverse_complement, .translate, .transcribe), FASTA vs FASTQ vs GenBank, Phred+33 (Sanger / Illumina 1.8+) vs Phred+64 (Illumina 1.3-1.7) quality encoding"
signature_short: "for rec in SeqIO.parse(\"reads.fastq\", \"fastq\"): rec.id, str(rec.seq), rec.letter_annotations[\"phred_quality\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank"
  - "biopython-sequences-io"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/biopython"
  - "category/biopython"
  - "tier/tiered"
---

# SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank

> Bio.SeqIO.parse (iterator), SeqIO.write (sequence or iterator), SeqRecord (id, seq, description, features, annotations), Seq object (.complement, .reverse_complement, .translate, .transcribe), FASTA vs FASTQ vs GenBank, Phred+33 (Sanger / Illumina 1.8+) vs Phred+64 (Illumina 1.3-1.7) quality encoding

## Overview

A `SeqRecord` is the central data class: `record.id` (accession), `record.seq` (a `Seq` object with biology-aware methods), `record.description` (free text), `record.features` (annotated regions, GenBank-style), `record.letter_annotations` (per-base data like FASTQ quality scores). The `Seq` object knows about complementation, reverse-complement, translation (DNA → protein), transcription. Always **iterate** with `parse` for files larger than RAM. Three depths solve the SAME task — extract reads above a quality threshold from a FASTQ file — at depths: load all records into memory and filter (only safe for tiny files) → streaming filter with iterator → streaming filter writing to gzipped output with summary stats and Phred+64 detection.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Filter FASTQ to reads with mean Phred quality >= 30.
- **Junior** — SAME — quality-filter FASTQ — but stream so any file size works.
- **Senior** — SAME — quality-filter FASTQ — production: gzip-aware I/O, Phred+33 vs Phred+64 detection, summary stats with std dev, optional minimum-length filter.

## Signature

```python
for rec in SeqIO.parse("reads.fastq", "fastq"): rec.id, str(rec.seq), rec.letter_annotations["phred_quality"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Filter FASTQ to reads with mean Phred quality >= 30.
# APPROACH  - Load all records, filter by mean(letter_annotations).
# STRENGTHS - 5 lines.
# WEAKNESSES- list(parse(...)) loads the whole file. Fine for 10 MB,
#             death for a 30 GB Illumina lane.
from Bio import SeqIO
from statistics import mean

records = list(SeqIO.parse("reads.fastq", "fastq"))    # !! everything in RAM
keep = [r for r in records
        if mean(r.letter_annotations["phred_quality"]) >= 30]

SeqIO.write(keep, "high_q.fastq", "fastq")
print(f"kept {len(keep)} of {len(records)}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — quality-filter FASTQ — but stream so any file size works.
# APPROACH  - Generator + SeqIO.write on the iterator.
# STRENGTHS - O(1) memory; works on multi-GB files.
# WEAKNESSES- No quality-encoding detection (assumes Phred+33).
from Bio import SeqIO
from statistics import mean


def high_quality(records, min_mean: float = 30.0):
    """Yield records whose per-base Phred mean >= min_mean."""
    for r in records:
        q = r.letter_annotations["phred_quality"]
        if q and mean(q) >= min_mean:
            yield r


def filter_fastq(src: str, dst: str, min_mean: float = 30.0) -> dict:
    n_in = n_out = 0
    def counter(it):
        nonlocal n_in, n_out
        for r in it:
            n_in += 1
            yield r

    src_it = SeqIO.parse(src, "fastq")
    written = SeqIO.write(high_quality(counter(src_it), min_mean), dst, "fastq")
    return {"input": n_in, "output": written}


print(filter_fastq("reads.fastq", "high_q.fastq", min_mean=30.0))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — quality-filter FASTQ — production: gzip-aware I/O,
#             Phred+33 vs Phred+64 detection, summary stats with std dev,
#             optional minimum-length filter.
# APPROACH  - gzip.open with "rt"; sniff first record's quality range to
#             pick encoding; statistics across the stream.
# STRENGTHS - Handles real-world Illumina/PacBio inputs; never loads
#             whole file; sane defaults; logs throughput.
# WEAKNESSES- Phred encoding heuristic is occasionally wrong on tiny files
#             (very short reads with all medium-quality bases).
from __future__ import annotations
import gzip
import time
import math
from pathlib import Path
from typing import Iterator
from Bio import SeqIO
from Bio.SeqRecord import SeqRecord


def _open_text(path: Path):
    return gzip.open(path, "rt") if path.suffix == ".gz" else open(path, "rt")


def _open_text_w(path: Path):
    return gzip.open(path, "wt") if path.suffix == ".gz" else open(path, "wt")


def detect_phred_encoding(path: Path, n_peek: int = 100) -> str:
    """Peek at the first n records' raw quality strings; pick fastq variant."""
    with _open_text(path) as fh:
        # Read raw lines: every 4th line starting at line index 3 is quality.
        chars: set[int] = set()
        for i, line in enumerate(fh):
            if i % 4 == 3:                            # quality line
                chars.update(map(ord, line.strip()))
            if i >= n_peek * 4:
                break
    if not chars:
        return "fastq"                                # default Phred+33
    lo, hi = min(chars), max(chars)
    # Phred+33 chars in [33, 73]; Phred+64 chars in [64, 104].
    if lo < 59:    return "fastq"                     # Phred+33 (Sanger / Illumina 1.8+)
    if hi > 79:    return "fastq-illumina"            # Phred+64 (Illumina 1.3-1.7)
    return "fastq"


def filter_fastq_pro(
    src: Path, dst: Path, *,
    min_mean_q: float = 30.0,
    min_length: int = 0,
) -> dict:
    fmt_in  = detect_phred_encoding(src)
    fmt_out = "fastq"                                 # always emit Phred+33

    n_in = n_out = 0
    sum_len = 0
    sum_q = 0.0
    sum_q_sq = 0.0
    t0 = time.time()

    def stream() -> Iterator[SeqRecord]:
        nonlocal n_in, n_out, sum_len, sum_q, sum_q_sq
        for r in SeqIO.parse(src_fh, fmt_in):
            n_in += 1
            q = r.letter_annotations["phred_quality"]
            if not q or len(r.seq) < min_length:
                continue
            mean_q = sum(q) / len(q)
            if mean_q < min_mean_q:
                continue
            n_out += 1
            sum_len += len(r.seq)
            sum_q += mean_q
            sum_q_sq += mean_q * mean_q
            yield r

    with _open_text(src) as src_fh, _open_text_w(dst) as dst_fh:
        SeqIO.write(stream(), dst_fh, fmt_out)

    dur = time.time() - t0
    mean_q = (sum_q / n_out) if n_out else 0.0
    var_q  = (sum_q_sq / n_out - mean_q * mean_q) if n_out else 0.0
    return {
        "in_format":  fmt_in,
        "input":      n_in,
        "output":     n_out,
        "kept_pct":   round(100 * n_out / max(1, n_in), 2),
        "mean_len":   (sum_len // n_out) if n_out else 0,
        "mean_q":     round(mean_q, 2),
        "std_q":      round(math.sqrt(max(0, var_q)), 2),
        "throughput_reads_per_s": int(n_in / max(dur, 1e-3)),
    }


print(filter_fastq_pro(
    Path("reads.fastq.gz"), Path("high_q.fastq.gz"),
    min_mean_q=30.0, min_length=50,
))

# Decision rule:
#   File fits in RAM (< 100 MB FASTQ)               -> SeqIO.parse + list is fine.
#   Multi-GB file                                    -> iterate; never list().
#   Need random access by id                         -> SeqIO.index (build .idx file).
#   Need both random + remote                        -> SeqIO.index_db (SQLite-backed).
#   Need to write many records                       -> SeqIO.write accepts an iterator.
#   FASTA records have huge sequences (chromosomes)  -> Bio.SeqIO + lazy seq via FastaTwoLineParser
#                                                       OR pysam.FastaFile for indexed reads.
#   Need .gz transparency                            -> gzip.open("...", "rt") then SeqIO.parse(fh, fmt).
#   Need Phred encoding detection                     -> sniff first ~100 quality lines (above).

# Anti-pattern:
#   records = list(SeqIO.parse("30GB.fastq", "fastq"))
# Loads 30 GB into RAM as Python objects (4-8x bloat). Iterate and write
# in one pass, OR if you need random access, use SeqIO.index_db.
```

## Decision Rule

```text
File fits in RAM (< 100 MB FASTQ)               -> SeqIO.parse + list is fine.
Multi-GB file                                    -> iterate; never list().
Need random access by id                         -> SeqIO.index (build .idx file).
Need both random + remote                        -> SeqIO.index_db (SQLite-backed).
Need to write many records                       -> SeqIO.write accepts an iterator.
FASTA records have huge sequences (chromosomes)  -> Bio.SeqIO + lazy seq via FastaTwoLineParser
                                                    OR pysam.FastaFile for indexed reads.
Need .gz transparency                            -> gzip.open("...", "rt") then SeqIO.parse(fh, fmt).
Need Phred encoding detection                     -> sniff first ~100 quality lines (above).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   records = list(SeqIO.parse("30GB.fastq", "fastq"))
> Loads 30 GB into RAM as Python objects (4-8x bloat). Iterate and write
> in one pass, OR if you need random access, use SeqIO.index_db.

## Tips

- Always **iterate** with `SeqIO.parse` — `list(SeqIO.parse(...))` loads the whole file.
- For random access by id, use `SeqIO.index(path, fmt)` (in-memory) or `SeqIO.index_db` (on-disk SQLite).
- Phred+33 (Sanger / Illumina 1.8+) is the modern standard; Phred+64 (Illumina 1.3-1.7) appears in old data — Biopython has both as `"fastq"` and `"fastq-illumina"`.
- Quality scores live in `record.letter_annotations["phred_quality"]` — a list of ints, one per base.
- Wrap `gzip.open(path, "rt")` around the file before `SeqIO.parse` to read `.fastq.gz` transparently.

## Common Mistake

> [!warning] Calling `list(SeqIO.parse("30GB.fastq", "fastq"))` — Biopython turns each record into a Python object, often 4-8× the original file size. Stream with the iterator instead.

## See Also

- [[Sections/bioinformatics/biopython/biopython-alignment-blast|PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST (Bioinformatics)]]
- [[Sections/bioinformatics/biopython/_Index|Bioinformatics → Biopython — sequences, FASTA/FASTQ, alignment]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
