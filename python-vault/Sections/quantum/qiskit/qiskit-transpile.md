---
type: "entry"
domain: "python"
file: "quantum"
section: "qiskit"
id: "qiskit-transpile"
title: "transpile / optimization_level — compile to a backend"
category: "qiskit"
subtitle: "transpile(qc, backend, optimization_level=0..3, basis_gates=, coupling_map=, layout_method=, routing_method=), preset pass managers, generate_preset_pass_manager (Qiskit 1.x), depth + 2-qubit-gate count as quality metrics, layout vs routing vs translation"
signature_short: "qc_t = transpile(qc, backend=, optimization_level=3); pm = generate_preset_pass_manager(target=backend.target, optimization_level=2)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "transpile / optimization_level — compile to a backend"
  - "qiskit-transpile"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/qiskit"
  - "category/qiskit"
  - "tier/tiered"
---

# transpile / optimization_level — compile to a backend

> transpile(qc, backend, optimization_level=0..3, basis_gates=, coupling_map=, layout_method=, routing_method=), preset pass managers, generate_preset_pass_manager (Qiskit 1.x), depth + 2-qubit-gate count as quality metrics, layout vs routing vs translation

## Overview

A logical circuit usually contains gates the hardware can't do natively (no `H` on superconducting qubits — only `X`, `SX`, `RZ`, `ECR/CX`). transpile decomposes everything into the backend's basis, picks a physical-qubit layout, inserts SWAPs to satisfy the coupling map, then optimizes. The 2-qubit gate count after transpile is your fidelity proxy — minimize it. Three depths solve the SAME task — transpile a 4-qubit circuit for a fake backend and report depth — at depths: bare `transpile(qc, backend)` → loop over optimization_level 0/1/2/3 with metrics → custom pass manager + multiple seed_transpiler runs (transpilation is randomized) keeping the best.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Transpile a 4-qubit circuit for a backend; check depth.
- **Junior** — SAME — transpile + report — sweep optimization_level 0..3.
- **Senior** — SAME — transpile a 4-qubit circuit — production: multiple random seeds, keep the lowest 2q-gate count, fall back to a pass manager if you need custom passes.

## Signature

```python
qc_t = transpile(qc, backend=, optimization_level=3); pm = generate_preset_pass_manager(target=backend.target, optimization_level=2)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Transpile a 4-qubit circuit for a backend; check depth.
# APPROACH  - transpile(qc, backend); report depth + 2q gates.
# STRENGTHS - One call.
# WEAKNESSES- Default optimization_level=1; misses easy wins from level 3.
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime.fake_provider import FakeManila

qc = QuantumCircuit(4)
qc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)

backend = FakeManila()
qc_t = transpile(qc, backend)                          # default optimization_level=1
print("logical depth:",   qc.depth())
print("physical depth:",  qc_t.depth())
print("2q gates after:",  sum(qc_t.count_ops().get(g, 0) for g in ("cx", "ecr")))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — transpile + report — sweep optimization_level 0..3.
# APPROACH  - Loop the levels; report depth and 2q gate count.
# STRENGTHS - Shows the trade-off (level 3 takes longer to compile but
#             produces shorter circuits with fewer 2q gates).
# WEAKNESSES- Single seed; transpilation is stochastic above level 1.
from qiskit import QuantumCircuit, transpile
from qiskit_ibm_runtime.fake_provider import FakeManila

qc = QuantumCircuit(4)
qc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)
qc.measure_all()

backend = FakeManila()

print(f"{'level':>5} {'depth':>6} {'2q':>4} {'size':>5}")
for level in (0, 1, 2, 3):
    t = transpile(qc, backend, optimization_level=level, seed_transpiler=42)
    twoq = sum(t.count_ops().get(g, 0) for g in ("cx", "ecr"))
    print(f"{level:>5} {t.depth():>6} {twoq:>4} {t.size():>5}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — transpile a 4-qubit circuit — production: multiple
#             random seeds, keep the lowest 2q-gate count, fall back to
#             a pass manager if you need custom passes.
# APPROACH  - generate_preset_pass_manager + seed sweep + best-of-N.
# STRENGTHS - Mitigates transpile randomness; reports best result;
#             extensible with custom passes.
# WEAKNESSES- N transpiles take N times longer.
from __future__ import annotations
from qiskit import QuantumCircuit, transpile
from qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager
from qiskit_ibm_runtime.fake_provider import FakeManila


def best_transpile(
    qc: QuantumCircuit, backend, *,
    optimization_level: int = 3,
    n_seeds: int = 16,
) -> tuple[QuantumCircuit, dict]:
    """Run N seeds of the preset pass manager; keep the best by 2q-gate count."""
    pm = generate_preset_pass_manager(
        optimization_level=optimization_level,
        backend=backend,
    )
    twoq_basis = ("cx", "ecr", "cz")
    best_t = None
    best_metrics: dict = {"two_q": 10**9}
    for seed in range(n_seeds):
        # seed_transpiler controls layout + routing randomness.
        pm.seed_transpiler = seed
        t = pm.run(qc)
        m = {
            "depth": t.depth(),
            "two_q": sum(t.count_ops().get(g, 0) for g in twoq_basis),
            "size":  t.size(),
            "seed":  seed,
        }
        if (m["two_q"], m["depth"]) < (best_metrics["two_q"], best_metrics.get("depth", 10**9)):
            best_t = t
            best_metrics = m
    return best_t, best_metrics


qc = QuantumCircuit(4)
qc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)
qc.measure_all()

best, metrics = best_transpile(qc, FakeManila(), optimization_level=3, n_seeds=16)
print(f"best -> depth={metrics['depth']}, 2q={metrics['two_q']}, "
      f"size={metrics['size']}, seed={metrics['seed']}")

# Decision rule:
#   Local simulator                       -> any optimization_level; cheap.
#   Real hardware                          -> optimization_level=3 minimum.
#   Care about 2q gate count               -> sweep n_seeds (transpile is stochastic).
#   Need a CUSTOM pass                     -> generate_preset_pass_manager(...).run(qc)
#                                             + insert your pass.
#   Need to lock layout (topology study)   -> initial_layout=[...] (physical qubits).
#   Need to control routing                -> routing_method='sabre' (default) /
#                                             'lookahead' / 'basic'.
#   Need basis gates explicitly            -> basis_gates=['rz','sx','cx'] (no backend).
#   Want OpenQASM output for another tool  -> qasm3.dumps(qc_t).

# Anti-pattern:
#   sampler.run([(qc,)])                  # qc not transpiled for the backend
# IBM Runtime accepts ANY circuit but silently transpiles with default
# settings - usually optimization_level=1 + a random seed. For research
# results you want the BEST 2q gate count - transpile yourself with
# multiple seeds at level 3 first.
```

## Decision Rule

```text
Local simulator                       -> any optimization_level; cheap.
Real hardware                          -> optimization_level=3 minimum.
Care about 2q gate count               -> sweep n_seeds (transpile is stochastic).
Need a CUSTOM pass                     -> generate_preset_pass_manager(...).run(qc)
                                          + insert your pass.
Need to lock layout (topology study)   -> initial_layout=[...] (physical qubits).
Need to control routing                -> routing_method='sabre' (default) /
                                          'lookahead' / 'basic'.
Need basis gates explicitly            -> basis_gates=['rz','sx','cx'] (no backend).
Want OpenQASM output for another tool  -> qasm3.dumps(qc_t).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   sampler.run([(qc,)])                  # qc not transpiled for the backend
> IBM Runtime accepts ANY circuit but silently transpiles with default
> settings - usually optimization_level=1 + a random seed. For research
> results you want the BEST 2q gate count - transpile yourself with
> multiple seeds at level 3 first.

## Tips

- `optimization_level=3` is the heaviest preset and the default for hardware — use it when you ship.
- The 2-qubit gate count after transpile is your fidelity proxy — minimize it.
- Transpilation is stochastic past level 1 — run with multiple `seed_transpiler` values and keep the best.
- For custom passes, use `generate_preset_pass_manager(...)` and insert your pass into its passes.
- `qiskit_aer` simulators don't need transpile for correctness, but transpile lets them mirror hardware noise behavior.

## Common Mistake

> [!warning] Submitting a logical circuit to IBM Runtime without transpiling — Runtime silently transpiles at level 1 with one seed. For real research, transpile yourself at level 3 across multiple seeds.

## See Also

- [[Sections/quantum/qiskit/qiskit-circuit-basics|QuantumCircuit / gates / measure — build a circuit (Quantum)]]
- [[Sections/quantum/qiskit/qiskit-simulators-shots|Aer / Sampler / shots — run a circuit and read counts (Quantum)]]
- [[Sections/quantum/qiskit/_Index|Quantum → Qiskit — circuits, simulators, real hardware]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
