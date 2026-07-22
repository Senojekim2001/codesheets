---
type: "entry"
domain: "python"
file: "quantum"
section: "qiskit"
id: "qiskit-simulators-shots"
title: "Aer / Sampler / shots — run a circuit and read counts"
category: "qiskit"
subtitle: "qiskit-aer (AerSimulator: statevector / qasm / density-matrix), qiskit.primitives.Sampler (counts/quasi-probs) vs Estimator (expectation values), shots= controls noise floor (1/sqrt(N) statistics), result.quasi_dists / result.data, IBM Runtime backend selection"
signature_short: "sampler = StatevectorSampler(); job = sampler.run([(qc,)], shots=8192); counts = job.result()[0].data.meas.get_counts()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Aer / Sampler / shots — run a circuit and read counts"
  - "qiskit-simulators-shots"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/qiskit"
  - "category/qiskit"
  - "tier/tiered"
---

# Aer / Sampler / shots — run a circuit and read counts

> qiskit-aer (AerSimulator: statevector / qasm / density-matrix), qiskit.primitives.Sampler (counts/quasi-probs) vs Estimator (expectation values), shots= controls noise floor (1/sqrt(N) statistics), result.quasi_dists / result.data, IBM Runtime backend selection

## Overview

Qiskit 1.x dropped the old `execute()` function; use `Sampler` (for measurement-based outputs) or `Estimator` (for `<psi|H|psi>` expectation values). Locally, `StatevectorSampler` runs noiseless; `qiskit_aer.AerSimulator` runs with optional noise models. `shots=` sets the sampling budget; statistical error is ~1/√shots. Three depths solve the SAME task — sample the Bell circuit and report the counts — at depths: AerSimulator + run + result.get_counts (legacy-feeling) → Sampler primitive (Qiskit 1.x idiomatic) → Sampler + noise model + multiple shot budgets to show statistical convergence.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Sample a Bell circuit 1000 times; print counts.
- **Junior** — SAME — sample Bell circuit — using the modern Sampler primitive.
- **Senior** — SAME — sample Bell circuit — production: noise model from a real backend, shot-budget sweep, statistical error reporting.

## Signature

```python
sampler = StatevectorSampler(); job = sampler.run([(qc,)], shots=8192); counts = job.result()[0].data.meas.get_counts()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Sample a Bell circuit 1000 times; print counts.
# APPROACH  - AerSimulator + qc.run + result.get_counts.
# STRENGTHS - Familiar interface; works in older Qiskit examples.
# WEAKNESSES- Older API; the modern path is the Sampler primitive (junior tier).
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator                  # pip install qiskit-aer

qc = QuantumCircuit(2, 2)
qc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])

sim = AerSimulator()
result = sim.run(qc, shots=1000).result()
counts = result.get_counts()
print(counts)                                          # e.g. {'00': 503, '11': 497}

# Bitstring order: '00' means clbit_1 clbit_0 -> qubits 1 and 0.
# Qiskit is little-endian: rightmost char = qubit 0.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sample Bell circuit — using the modern Sampler primitive.
# APPROACH  - StatevectorSampler from qiskit.primitives; pubs format.
# STRENGTHS - Qiskit 1.x idiomatic; same interface for sim and IBM Runtime.
# WEAKNESSES- The new "pub" tuple format is verbose for a single circuit.
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2, 2)
qc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])

sampler = StatevectorSampler()

# A "pub" (Primitive Unified Bloc) is a tuple of (circuit, [params], shots).
# For a non-parameterized circuit the tuple is just (circuit,).
job = sampler.run([(qc,)], shots=4096)
result = job.result()
data = result[0].data                                  # PubResult for our one pub
counts = data.meas.get_counts()                        # 'meas' = default classical register
print(counts)                                          # {'00': ~2048, '11': ~2048}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — sample Bell circuit — production: noise model from a
#             real backend, shot-budget sweep, statistical error reporting.
# APPROACH  - AerSimulator.from_backend(noise_backend); Sampler for the run;
#             relative-frequency table with Wilson confidence intervals.
# STRENGTHS - Calibrated to real-device noise; sensible error bars.
# WEAKNESSES- Need a backend for the noise model (FakeBackend works offline).
from __future__ import annotations
import math
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit_aer.primitives import SamplerV2 as AerSampler


# Wilson CI for a binomial proportion (better than normal at low counts).
def wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    if n == 0: return (0.0, 0.0)
    p = k / n
    denom = 1 + z**2 / n
    centre = (p + z**2 / (2 * n)) / denom
    half = (z / denom) * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2))
    return (max(0.0, centre - half), min(1.0, centre + half))


def bell() -> QuantumCircuit:
    qc = QuantumCircuit(2, 2, name="bell")
    qc.h(0); qc.cx(0, 1)
    qc.measure([0, 1], [0, 1])
    return qc


def run_with_noise(qc: QuantumCircuit, *, shots: int = 4096,
                   noise_backend=None) -> dict[str, int]:
    """Sample qc on AerSimulator with optional noise model."""
    if noise_backend is not None:
        # Build a noise model that mimics the backend's calibration.
        sim = AerSimulator.from_backend(noise_backend)
    else:
        sim = AerSimulator()                          # noiseless

    qc_t = transpile(qc, sim)                          # match basis gates
    sampler = AerSampler()
    pub_result = sampler.run([(qc_t,)], shots=shots).result()[0]
    return pub_result.data.meas.get_counts()


def report(counts: dict[str, int]) -> None:
    n = sum(counts.values())
    print(f"shots = {n}")
    for outcome in sorted(counts):
        k = counts[outcome]
        lo, hi = wilson_ci(k, n)
        print(f"  {outcome}: {k:5d}  {k/n:6.3f}  [{lo:.3f}, {hi:.3f}]")


# Noiseless reference
print("=== noiseless ===")
report(run_with_noise(bell(), shots=4096))

# Noisy run if a fake backend is available (offline; ships with qiskit-aer).
try:
    from qiskit_ibm_runtime.fake_provider import FakeManila
    print("\n=== with FakeManila noise ===")
    report(run_with_noise(bell(), shots=4096, noise_backend=FakeManila()))
except ImportError:
    pass

# Decision rule:
#   Want measurement counts                       -> Sampler primitive.
#   Want <psi|H|psi> for a Hamiltonian H          -> Estimator primitive.
#   Local noiseless                                -> StatevectorSampler / StatevectorEstimator.
#   Local with calibrated noise                    -> qiskit_aer.AerSimulator(.from_backend(b)).
#   Real IBM quantum hardware                      -> qiskit_ibm_runtime + Session.
#   Fast classical exact answer                    -> Statevector(qc).probabilities_dict().
#   Many parameterized executions                   -> transpile once, then bind values
#                                                       on the transpiled circuit.
#   Need stable counts                              -> shots >= 8192; std ~ 1/sqrt(N).

# Anti-pattern:
#   counts = sampler.run([(qc,)]).result()[0].data.meas.get_counts()
#   probs = {k: v / 1024 for k, v in counts.items()}        # assumed shots
# Hardcoding the divisor instead of summing counts. Always normalize by
# n = sum(counts.values()) - shots= can be ignored by some backends.
```

## Decision Rule

```text
Want measurement counts                       -> Sampler primitive.
Want <psi|H|psi> for a Hamiltonian H          -> Estimator primitive.
Local noiseless                                -> StatevectorSampler / StatevectorEstimator.
Local with calibrated noise                    -> qiskit_aer.AerSimulator(.from_backend(b)).
Real IBM quantum hardware                      -> qiskit_ibm_runtime + Session.
Fast classical exact answer                    -> Statevector(qc).probabilities_dict().
Many parameterized executions                   -> transpile once, then bind values
                                                    on the transpiled circuit.
Need stable counts                              -> shots >= 8192; std ~ 1/sqrt(N).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   counts = sampler.run([(qc,)]).result()[0].data.meas.get_counts()
>   probs = {k: v / 1024 for k, v in counts.items()}        # assumed shots
> Hardcoding the divisor instead of summing counts. Always normalize by
> n = sum(counts.values()) - shots= can be ignored by some backends.

## Tips

- Qiskit 1.x: use `Sampler` (counts/quasi-probabilities) and `Estimator` (expectation values). The legacy `execute()` is gone.
- Local noiseless: `qiskit.primitives.StatevectorSampler`. Local noise: `qiskit_aer.AerSimulator(.from_backend(b))`.
- Statistical error of counts is ~1/√shots — `shots=8192` for ~1% precision per outcome.
- Always `transpile(qc, backend)` before sampling — the basis gate set differs between simulators and hardware.
- For exact noiseless probabilities (no sampling), use `Statevector(qc).probabilities_dict()` — no shots needed.

## Common Mistake

> [!warning] Treating `counts.values()` as probabilities by dividing by an assumed `shots` value. Always `n = sum(counts.values())` then divide — `shots=` is a request, not a guarantee.

## See Also

- [[Sections/quantum/qiskit/qiskit-circuit-basics|QuantumCircuit / gates / measure — build a circuit (Quantum)]]
- [[Sections/quantum/qiskit/qiskit-transpile|transpile / optimization_level — compile to a backend (Quantum)]]
- [[Sections/quantum/qiskit/_Index|Quantum → Qiskit — circuits, simulators, real hardware]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
