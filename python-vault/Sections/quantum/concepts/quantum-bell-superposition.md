---
type: "entry"
domain: "python"
file: "quantum"
section: "concepts"
id: "quantum-bell-superposition"
title: "Superposition / entanglement / Bell test — the canonical demos"
category: "concepts"
subtitle: "H gate (Hadamard), Bell state preparation (H + CX), correlated measurement outcomes (no 01/10), single-qubit rotations RX/RY/RZ on the Bloch sphere, CHSH operator estimation, statevector vs sampled probabilities"
signature_short: "qc.h(0)              # superposition\\nqc.h(0); qc.cx(0,1)  # entanglement\\nqc.ry(theta, q)      # rotate before measuring"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Superposition / entanglement / Bell test — the canonical demos"
  - "quantum-bell-superposition"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/concepts"
  - "category/concepts"
  - "tier/tiered"
---

# Superposition / entanglement / Bell test — the canonical demos

> H gate (Hadamard), Bell state preparation (H + CX), correlated measurement outcomes (no 01/10), single-qubit rotations RX/RY/RZ on the Bloch sphere, CHSH operator estimation, statevector vs sampled probabilities

## Overview

Three escalating demos. (1) Single H on |0> — sampling shows ~50/50 split. (2) H + CX — outcomes correlate perfectly: only `00` or `11`. (3) Bell test (CHSH): rotate measurement basis on each qubit, compute the four correlators, check `|S| > 2`. The CHSH bound is the cleanest "quantum is doing something classical can't" demo. Three depths solve the SAME task — show that a Bell pair is correlated — at depths: H + CX + sample (visual) → exact statevector probabilities (no shots) → CHSH-style correlator across rotated bases reporting S vs the classical bound of 2.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show that a Bell pair always gives 00 or 11.
- **Junior** — SAME — show Bell correlation — but EXACTLY via statevector.
- **Senior** — SAME — prove the Bell pair is non-classical — CHSH inequality.

## Signature

```python
qc.h(0)              # superposition\nqc.h(0); qc.cx(0,1)  # entanglement\nqc.ry(theta, q)      # rotate before measuring
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show that a Bell pair always gives 00 or 11.
# APPROACH  - H + CX + sample 1000 times.
# STRENGTHS - Visual; the canonical "entanglement is real" demo.
# WEAKNESSES- Statistical noise on small N; can't prove no-01 from samples.
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

qc = QuantumCircuit(2, 2)
qc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])

counts = AerSimulator().run(qc, shots=2000).result().get_counts()
print(counts)
# Expected: {'00': ~1000, '11': ~1000}, NEVER '01' or '10'.
# Compare with two independent qubits in superposition:
#   qc2 = QuantumCircuit(2, 2); qc2.h(0); qc2.h(1); qc2.measure(...)
#   counts -> ~25% for each of 00, 01, 10, 11.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — show Bell correlation — but EXACTLY via statevector.
# APPROACH  - Statevector(qc) -> probabilities_dict.
# STRENGTHS - Exact; no sampling noise; provably 0% on 01 and 10.
# WEAKNESSES- Doesn't scale past ~25 qubits (statevector is 2^n complex amps).
from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
import numpy as np

qc = QuantumCircuit(2)                                # no measurement for Statevector
qc.h(0); qc.cx(0, 1)

sv = Statevector(qc)
print("amplitudes:", sv.data)                         # complex array of length 4
print("probabilities:", sv.probabilities_dict())
# {'00': 0.5, '11': 0.5}  -  EXACTLY zero on 01 and 10.

# Compare with the unentangled product state:
qc2 = QuantumCircuit(2)
qc2.h(0); qc2.h(1)
print("product (HxH):", Statevector(qc2).probabilities_dict())
# {'00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — prove the Bell pair is non-classical — CHSH inequality.
# APPROACH  - Measure four correlators E(a, b) at chosen rotation angles;
#             classical bound on |S| is 2; quantum reaches 2*sqrt(2).
# STRENGTHS - The cleanest quantum-vs-classical experimental signature.
# WEAKNESSES- Needs many shots per setting; deviation from 2*sqrt(2)
#             measures the device's noise.
from __future__ import annotations
import math
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import numpy as np


def chsh_circuit(theta_a: float, theta_b: float) -> QuantumCircuit:
    """Bell pair, then rotate qubit 0 by theta_a (RY) and qubit 1 by theta_b."""
    qc = QuantumCircuit(2, 2)
    qc.h(0); qc.cx(0, 1)
    qc.ry(theta_a, 0)
    qc.ry(theta_b, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def correlator(theta_a: float, theta_b: float, *, shots: int = 8192) -> float:
    """E = P(equal) - P(unequal) in {0, 1} encoding -> in [-1, +1]."""
    qc = chsh_circuit(theta_a, theta_b)
    counts = AerSimulator().run(qc, shots=shots).result().get_counts()
    n = sum(counts.values())
    equal = counts.get("00", 0) + counts.get("11", 0)
    return (equal - (n - equal)) / n


# Optimal CHSH angles: a in {0, pi/2}; b in {pi/4, -pi/4}.
a, a_p = 0.0, math.pi / 2
b, b_p = math.pi / 4, -math.pi / 4

E_ab   = correlator(a,   b)
E_ab_p = correlator(a,   b_p)
E_a_pb = correlator(a_p, b)
E_a_pb_p = correlator(a_p, b_p)

S = E_ab - E_ab_p + E_a_pb + E_a_pb_p
print(f"E(a,b)   = {E_ab:+.3f}")
print(f"E(a,b')  = {E_ab_p:+.3f}")
print(f"E(a',b)  = {E_a_pb:+.3f}")
print(f"E(a',b') = {E_a_pb_p:+.3f}")
print(f"|S|      = {abs(S):.3f}    (classical bound: 2;  quantum max: {2*math.sqrt(2):.3f})")

# Decision rule:
#   Need to demonstrate superposition         -> single H on |0>; sample many shots.
#   Need to demonstrate entanglement          -> Bell state (H + CX); show no 01/10.
#   Need to PROVE quantumness                  -> CHSH or any Bell inequality.
#   Need exact probabilities                   -> Statevector(qc).probabilities_dict()
#                                                  (no measurement).
#   Need exact unitary                          -> qiskit.quantum_info.Operator(qc).
#   Need expectation <psi|H|psi>                -> Estimator + SparsePauliOp(H).
#   Need to estimate fidelity vs ideal         -> measure in many bases; do tomography
#                                                  (qiskit-experiments has helpers).
#   Need scalable verification                  -> randomized benchmarking, NOT statevector.

# Anti-pattern:
#   counts.get('01', 0) > 0  ->  "the Bell state is broken"
# Some 01/10 counts are EXPECTED on noisy hardware - readout error,
# decoherence, gate infidelity. Compare to the noiseless baseline AND
# look at the magnitude (a few percent is normal; 25% means a wiring bug).
```

## Decision Rule

```text
Need to demonstrate superposition         -> single H on |0>; sample many shots.
Need to demonstrate entanglement          -> Bell state (H + CX); show no 01/10.
Need to PROVE quantumness                  -> CHSH or any Bell inequality.
Need exact probabilities                   -> Statevector(qc).probabilities_dict()
                                               (no measurement).
Need exact unitary                          -> qiskit.quantum_info.Operator(qc).
Need expectation <psi|H|psi>                -> Estimator + SparsePauliOp(H).
Need to estimate fidelity vs ideal         -> measure in many bases; do tomography
                                               (qiskit-experiments has helpers).
Need scalable verification                  -> randomized benchmarking, NOT statevector.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   counts.get('01', 0) > 0  ->  "the Bell state is broken"
> Some 01/10 counts are EXPECTED on noisy hardware - readout error,
> decoherence, gate infidelity. Compare to the noiseless baseline AND
> look at the magnitude (a few percent is normal; 25% means a wiring bug).

## Tips

- Single H on |0> = superposition; H + CX = Bell state; rotated measurements + correlator = Bell test (CHSH).
- For exact noiseless probabilities, use `Statevector(qc).probabilities_dict()` — no shots needed.
- CHSH classical bound is 2; quantum maximum is 2√2 ≈ 2.83. Hardware below ~2.4 is noisy.
- A few percent on the "forbidden" outcomes (01, 10 for a Bell state) on real hardware is normal — readout + decoherence.
- For larger demos, look at GHZ states (|00...0> + |11...1>) — same idea but n-qubit.

## Common Mistake

> [!warning] Treating any non-zero count on the "wrong" outcome as a bug. Real hardware gives ~1-5% on forbidden outcomes — readout and gate errors. Compare to a noiseless baseline.

## See Also

- [[Sections/quantum/concepts/_Index|Quantum → Quantum concepts cheatsheet]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
