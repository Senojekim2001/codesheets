---
type: "entry"
domain: "python"
file: "bioinformatics"
section: "biopython"
id: "biopython-alignment-blast"
title: "PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST"
category: "biopython"
subtitle: "PairwiseAligner (mode='global'/'local', substitution_matrix=, open_gap_score=, extend_gap_score=), Bio.Align.substitution_matrices.load(\"BLOSUM62\"), NCBIWWW.qblast (program=, database=, sequence=) -> XML, NCBIXML.parse, MSA via Bio.Align.MultipleSeqAlignment, mafft / muscle via subprocess for >2 sequences"
signature_short: "aligner = PairwiseAligner(mode=\"local\", substitution_matrix=BLOSUM62); alignments = aligner.align(seq_a, seq_b)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST"
  - "biopython-alignment-blast"
tags:
  - "python"
  - "python/bioinformatics"
  - "python/bioinformatics/biopython"
  - "category/biopython"
  - "tier/tiered"
---

# PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST

> PairwiseAligner (mode='global'/'local', substitution_matrix=, open_gap_score=, extend_gap_score=), Bio.Align.substitution_matrices.load("BLOSUM62"), NCBIWWW.qblast (program=, database=, sequence=) -> XML, NCBIXML.parse, MSA via Bio.Align.MultipleSeqAlignment, mafft / muscle via subprocess for >2 sequences

## Overview

`PairwiseAligner` exposes Needleman-Wunsch (`mode="global"`) and Smith-Waterman (`mode="local"`) with all the standard parameters (`open_gap_score`, `extend_gap_score`, `substitution_matrix`). Use the matched substitution matrix for protein vs DNA. For database hits, `NCBIWWW.qblast` is fine for one-off scripts but rate-limited and slow — for any real workload, install local BLAST+ binaries and call `blastp -query ...`. Three depths solve the SAME task — find the closest match for a query protein in a reference set — at depths: PairwiseAligner against each reference (O(N) global aligns) → remote NCBI BLAST → local BLAST+ via subprocess + parsed XML/JSON output.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Pairwise local-align two protein sequences and print the score.
- **Junior** — SAME — find the best match — across a list of reference proteins.
- **Senior** — SAME — find best match for a query protein — production: run local BLAST+ via subprocess against an indexed FASTA database; parse JSON output; return top N hits with e-value.

## Signature

```python
aligner = PairwiseAligner(mode="local", substitution_matrix=BLOSUM62); alignments = aligner.align(seq_a, seq_b)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Pairwise local-align two protein sequences and print the score.
# APPROACH  - PairwiseAligner with BLOSUM62 substitution matrix.
# STRENGTHS - Stdlib of biopython; no external tools.
# WEAKNESSES- O(L1 * L2) memory + time; not a database search.
from Bio.Align import PairwiseAligner, substitution_matrices

aligner = PairwiseAligner()
aligner.mode = "local"                                # Smith-Waterman
aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
aligner.open_gap_score   = -10
aligner.extend_gap_score = -1

seq_a = "MEEPQSDPSV"
seq_b = "MEDPQSDISL"

alignments = aligner.align(seq_a, seq_b)
best = alignments[0]
print("score:", best.score)
print(best)                                           # prints the formatted alignment
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — find the best match — across a list of reference proteins.
# APPROACH  - Loop, score each reference; keep the top hit.
# STRENGTHS - Works without any tool installed; deterministic.
# WEAKNESSES- O(N * L^2) - fine for a few hundred refs, glacial for >1000.
from Bio.Align import PairwiseAligner, substitution_matrices

aligner = PairwiseAligner()
aligner.mode = "local"
aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")
aligner.open_gap_score   = -10
aligner.extend_gap_score = -1

query = "MEEPQSDPSVEPPLSQETFSDLWKLLPENN"
references = {
    "p53_human":  "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQ",
    "p53_mouse":  "MEDSQSDISLELPLSQETFSGLWKLLPPEDILPSPHCMDDLLLPQDVEEFFE",
    "myo_a":      "MGLSDGEWQLVLNVWGKVEADIPGHGQEVLIRLFKGHPETLEKFDKFKHLKS",
}

scored = []
for name, ref in references.items():
    score = aligner.align(query, ref)[0].score
    scored.append((score, name))

best_score, best_name = max(scored)
print(f"best: {best_name}  score={best_score:.1f}")
for s, n in sorted(scored, reverse=True):
    print(f"  {n:>12}  {s:7.1f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — find best match for a query protein — production: run
#             local BLAST+ via subprocess against an indexed FASTA database;
#             parse JSON output; return top N hits with e-value.
# APPROACH  - blastp -query - -db <db> -outfmt 15 (JSON), feed query via stdin.
# STRENGTHS - Sub-second on 100k-protein databases; e-values + identity %;
#             scales to genome-sized references.
# WEAKNESSES- Need BLAST+ installed (apt install ncbi-blast+ / brew); db
#             must be pre-formatted with makeblastdb.
from __future__ import annotations
import subprocess
import json
import shutil


def _ensure_blast() -> None:
    if shutil.which("blastp") is None:
        raise RuntimeError(
            "blastp not on PATH. Install BLAST+ (apt install ncbi-blast+, "
            "brew install blast) and run: makeblastdb -in refs.fasta "
            "-dbtype prot -out refs_db   (once)."
        )


def blastp_top_hits(query_seq: str, db_path: str, *,
                    top_n: int = 5, evalue: float = 1e-3) -> list[dict]:
    _ensure_blast()
    fasta_in = f">query\n{query_seq}\n"
    proc = subprocess.run(
        ["blastp", "-db", db_path, "-outfmt", "15",        # 15 = single-file JSON
         "-evalue", str(evalue), "-max_target_seqs", str(top_n)],
        input=fasta_in, text=True, capture_output=True, check=True,
    )
    payload = json.loads(proc.stdout)
    hits_out: list[dict] = []
    # Schema: BlastOutput2 -> [report] -> results.search.hits[]
    for report in payload["BlastOutput2"]:
        search = report["report"]["results"]["search"]
        for hit in search.get("hits", []):
            hsp = hit["hsps"][0]                             # best HSP
            hits_out.append({
                "id":      hit["description"][0]["id"],
                "title":   hit["description"][0]["title"],
                "length":  hit["len"],
                "evalue":  hsp["evalue"],
                "score":   hsp["score"],
                "bit_score": hsp["bit_score"],
                "identity_pct": round(100 * hsp["identity"] / hsp["align_len"], 2),
                "align_len":    hsp["align_len"],
            })
    return hits_out


query = "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQ"
hits = blastp_top_hits(query, db_path="refs_db", top_n=5)
for h in hits:
    print(f"{h['id']:>20} e={h['evalue']:.1e} id%={h['identity_pct']} bit={h['bit_score']}")

# Decision rule:
#   Two sequences, just need score             -> PairwiseAligner.
#   Two sequences with custom matrix            -> PairwiseAligner + substitution_matrices.load.
#   < 100 references                             -> loop PairwiseAligner.
#   100s-1000s of references                     -> local BLAST+ (blastp / blastn).
#   Genomic-scale (mouse vs human refs)          -> minimap2 (DNA) / DIAMOND (protein, 1000x BLAST).
#   One-off, no install                          -> Bio.Blast.NCBIWWW.qblast (rate-limited; slow).
#   Multiple-sequence alignment (>2 seqs)        -> mafft or muscle via subprocess (don't write your own).
#   Need exact match counting                    -> not alignment - use a k-mer index (mash, sourmash).

# Anti-pattern:
#   while True:
#       NCBIWWW.qblast(...)
# NCBI rate-limits and IP-blocks bursty remote BLAST. Local BLAST+ is
# ~1000x faster for any production workload.
```

## Decision Rule

```text
Two sequences, just need score             -> PairwiseAligner.
Two sequences with custom matrix            -> PairwiseAligner + substitution_matrices.load.
< 100 references                             -> loop PairwiseAligner.
100s-1000s of references                     -> local BLAST+ (blastp / blastn).
Genomic-scale (mouse vs human refs)          -> minimap2 (DNA) / DIAMOND (protein, 1000x BLAST).
One-off, no install                          -> Bio.Blast.NCBIWWW.qblast (rate-limited; slow).
Multiple-sequence alignment (>2 seqs)        -> mafft or muscle via subprocess (don't write your own).
Need exact match counting                    -> not alignment - use a k-mer index (mash, sourmash).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   while True:
>       NCBIWWW.qblast(...)
> NCBI rate-limits and IP-blocks bursty remote BLAST. Local BLAST+ is
> ~1000x faster for any production workload.

## Tips

- `PairwiseAligner` covers global (`mode="global"`) and local (`mode="local"`) — set `substitution_matrix` and gap scores explicitly.
- Load standard matrices with `Bio.Align.substitution_matrices.load("BLOSUM62" / "PAM250" / "DNAFULL")`.
- For database searches, use **local BLAST+** (`blastp`, `blastn`) via subprocess — `NCBIWWW.qblast` is rate-limited.
- For protein-vs-protein at scale, **DIAMOND** is ~1000× faster than BLAST with comparable sensitivity.
- For DNA at genomic scale, **minimap2** dominates — Biopython doesn't replace it.

## Common Mistake

> [!warning] Hammering `NCBIWWW.qblast` in a loop — NCBI rate-limits and IP-blocks bursty remote BLAST. Install BLAST+ locally for any real workload.

## See Also

- [[Sections/bioinformatics/biopython/biopython-sequences-io|SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank (Bioinformatics)]]
- [[Sections/bioinformatics/biopython/_Index|Bioinformatics → Biopython — sequences, FASTA/FASTQ, alignment]]
- [[Sections/bioinformatics/_Index|Bioinformatics index]]
- [[_Index|Vault index]]
