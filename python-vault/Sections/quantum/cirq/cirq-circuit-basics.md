---
type: "entry"
domain: "python"
file: "quantum"
section: "cirq"
id: "cirq-circuit-basics"
title: "cirq.Circuit / GridQubit / measure — Cirq circuits"
category: "cirq"
subtitle: "cirq.LineQubit / GridQubit (explicit qubit objects, not indices), cirq.Circuit + append, gates (cirq.H, cirq.X, cirq.CNOT, cirq.rx, cirq.measure), cirq.Simulator() run + result.histogram, big-endian bitstring order (opposite of Qiskit), cirq.unitary(circuit) for exact unitary"
signature_short: "q = cirq.LineQubit.range(2); c = cirq.Circuit([cirq.H(q[0]), cirq.CNOT(q[0], q[1]), cirq.measure(*q, key=\"m\")]); cirq.Simulator().run(c, repetitions=1000)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "cirq.Circuit / GridQubit / measure — Cirq circuits"
  - "cirq-circuit-basics"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/cirq"
  - "category/cirq"
  - "tier/tiered"
---

# cirq.Circuit / GridQubit / measure — Cirq circuits

> cirq.LineQubit / GridQubit (explicit qubit objects, not indices), cirq.Circuit + append, gates (cirq.H, cirq.X, cirq.CNOT, cirq.rx, cirq.measure), cirq.Simulator() run + result.histogram, big-endian bitstring order (opposite of Qiskit), cirq.unitary(circuit) for exact unitary

## Overview

Cirq is qubit-explicit: you create `cirq.LineQubit` (1D) or `cirq.GridQubit(row, col)` (2D, matches superconducting topologies) objects and pass them to gates. Circuits are appended (`Circuit.append([gates])`); `cirq.measure(*qubits, key="name")` writes one named result. Three depths solve the SAME task — Bell state in Cirq, sampled — at depths: minimal Circuit + Simulator → GridQubit (matches device), histogram + frequencies → noisy simulator with `cirq.depolarize` channel and per-key statistics.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Bell state in Cirq, 1000 shots, print counts.
- **Junior** — SAME — Bell sampled — but on GridQubit (matches Sycamore-like device layout) and print clean frequencies.
- **Senior** — SAME — Bell on GridQubit — production: noisy simulator with depolarizing channel after each gate; statistics across multiple noise levels.

## Signature

```python
q = cirq.LineQubit.range(2); c = cirq.Circuit([cirq.H(q[0]), cirq.CNOT(q[0], q[1]), cirq.measure(*q, key="m")]); cirq.Simulator().run(c, repetitions=1000)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Bell state in Cirq, 1000 shots, print counts.
# APPROACH  - LineQubit + Circuit + Simulator.run.
# STRENGTHS - Clean object model (qubits are first-class).
# WEAKNESSES- Bitstring ordering is left-to-right (opposite of Qiskit).
import cirq

q0, q1 = cirq.LineQubit.range(2)
circuit = cirq.Circuit(
    cirq.H(q0),
    cirq.CNOT(q0, q1),
    cirq.measure(q0, q1, key="m"),
)

result = cirq.Simulator().run(circuit, repetitions=1000)
print(circuit)
print(result.histogram(key="m"))                       # Counter({0: ~500, 3: ~500})
# Histogram keys are integers: bits read left-to-right.
# 0 = "00", 3 = "11" - the Bell outcomes.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Bell sampled — but on GridQubit (matches Sycamore-like
#             device layout) and print clean frequencies.
# APPROACH  - GridQubit(row, col); decode int->bitstring; freq table.
# STRENGTHS - Layout matches real superconducting devices; readable output.
# WEAKNESSES- Still noiseless.
import cirq
from collections import Counter

# Two adjacent qubits on a 2D grid - same shape as Google Sycamore.
q00 = cirq.GridQubit(0, 0)
q01 = cirq.GridQubit(0, 1)

circuit = cirq.Circuit(
    cirq.H(q00),
    cirq.CNOT(q00, q01),
    cirq.measure(q00, q01, key="m"),
)
print(circuit)

shots = 4096
result = cirq.Simulator().run(circuit, repetitions=shots)
hist: Counter = result.histogram(key="m")

# Convert int outcomes to bitstrings for printing.
def to_bits(i: int, n: int) -> str:
    return format(i, f"0{n}b")

print(f"{'outcome':>8} {'count':>6} {'freq':>7}")
for k in sorted(hist):
    print(f"{to_bits(k, 2):>8} {hist[k]:>6} {hist[k]/shots:>7.3f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Bell on GridQubit — production: noisy simulator with
#             depolarizing channel after each gate; statistics across
#             multiple noise levels.
# APPROACH  - cirq.NoiseModel via cirq.depolarize; sweep error rates;
#             return frequencies + how far from ideal (TVD).
# STRENGTHS - Realistic NISQ behavior; quantifies "how broken is it".
# WEAKNESSES- depolarize is a toy noise model; real device fidelity needs
#             calibration data (T1, T2, gate errors per qubit).
from __future__ import annotations
import cirq
import numpy as np
from collections import Counter


def bell_circuit(n: int = 2) -> tuple[cirq.Circuit, list[cirq.Qid]]:
    qs = cirq.LineQubit.range(n)
    c = cirq.Circuit(cirq.H(qs[0]),
                     *(cirq.CNOT(qs[i], qs[i + 1]) for i in range(n - 1)),
                     cirq.measure(*qs, key="m"))
    return c, qs


def freqs(hist: Counter, n_bits: int, shots: int) -> dict[str, float]:
    return {format(k, f"0{n_bits}b"): hist[k] / shots
            for k in sorted(hist)}


def tvd(p: dict[str, float], q: dict[str, float]) -> float:
    """Total Variation Distance between two distributions."""
    keys = set(p) | set(q)
    return 0.5 * sum(abs(p.get(k, 0) - q.get(k, 0)) for k in keys)


def run(p_error: float, *, shots: int = 4096) -> dict[str, float]:
    circuit, qs = bell_circuit(2)
    if p_error > 0:
        # Apply depolarizing noise after every gate.
        noisy = circuit.with_noise(cirq.depolarize(p=p_error))
    else:
        noisy = circuit
    sim = cirq.DensityMatrixSimulator() if p_error > 0 else cirq.Simulator()
    result = sim.run(noisy, repetitions=shots)
    return freqs(result.histogram(key="m"), 2, shots)


ideal = {"00": 0.5, "11": 0.5}
print(f"{'p_error':>8} {'00':>5} {'01':>5} {'10':>5} {'11':>5} {'TVD':>5}")
for p in (0.0, 0.001, 0.005, 0.01, 0.05):
    f = run(p)
    print(f"{p:>8.3f} "
          f"{f.get('00',0):>5.3f} {f.get('01',0):>5.3f} "
          f"{f.get('10',0):>5.3f} {f.get('11',0):>5.3f} "
          f"{tvd(f, ideal):>5.3f}")

# Decision rule:
#   Want a 2D-topology-aware circuit         -> cirq.GridQubit(row, col).
#   Linear chain                              -> cirq.LineQubit.range(n).
#   Need named qubits                         -> cirq.NamedQubit('alice').
#   Statevector exact answer                  -> cirq.Simulator().simulate(c)
#                                                .final_state_vector.
#   Sampled counts                            -> cirq.Simulator().run(c, repetitions=).
#   Noisy simulation                          -> circuit.with_noise(channel) +
#                                                 DensityMatrixSimulator.
#   Want the unitary matrix                   -> cirq.unitary(circuit).
#   Want SVG / text                           -> print(circuit) for ASCII; cirq.
#                                                 contrib SVG drawer for diagrams.

# Anti-pattern:
#   cirq.Simulator().run(circuit_with_noise)   # state vector sim + noisy circuit
# Simulator() is statevector-only; noise channels need DensityMatrixSimulator
# (or Clifford-only Stim for big circuits). Wrong simulator -> noise is
# silently ignored.
```

## Decision Rule

```text
Want a 2D-topology-aware circuit         -> cirq.GridQubit(row, col).
Linear chain                              -> cirq.LineQubit.range(n).
Need named qubits                         -> cirq.NamedQubit('alice').
Statevector exact answer                  -> cirq.Simulator().simulate(c)
                                             .final_state_vector.
Sampled counts                            -> cirq.Simulator().run(c, repetitions=).
Noisy simulation                          -> circuit.with_noise(channel) +
                                              DensityMatrixSimulator.
Want the unitary matrix                   -> cirq.unitary(circuit).
Want SVG / text                           -> print(circuit) for ASCII; cirq.
                                              contrib SVG drawer for diagrams.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   cirq.Simulator().run(circuit_with_noise)   # state vector sim + noisy circuit
> Simulator() is statevector-only; noise channels need DensityMatrixSimulator
> (or Clifford-only Stim for big circuits). Wrong simulator -> noise is
> silently ignored.

## Tips

- Cirq qubits are objects (`LineQubit(0)`, `GridQubit(row, col)`) — pass them to gates instead of integers.
- Cirq histogram keys are integers; bits are read **left-to-right** (opposite of Qiskit's little-endian).
- For exact statevector use `simulator.simulate(c).final_state_vector`; for samples use `simulator.run(c, repetitions=)`.
- Noisy circuits need `DensityMatrixSimulator()` — `Simulator()` silently ignores noise channels.
- `cirq.unitary(circuit)` returns the exact unitary matrix — handy for verifying small circuits.

## Common Mistake

> [!warning] Running a noisy circuit with `cirq.Simulator()` (statevector). The noise channels are silently dropped; you get the noiseless answer. Use `DensityMatrixSimulator()`.

## See Also

- [[Sections/quantum/cirq/_Index|Quantum → Cirq — Google's NISQ-focused framework]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
