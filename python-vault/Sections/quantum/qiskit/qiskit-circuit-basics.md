---
type: "entry"
domain: "python"
file: "quantum"
section: "qiskit"
id: "qiskit-circuit-basics"
title: "QuantumCircuit / gates / measure — build a circuit"
category: "qiskit"
subtitle: "QuantumCircuit(n_qubits, n_clbits), single-qubit gates (h, x, y, z, s, t, rx, ry, rz), two-qubit (cx, cz, swap, ccx), barrier (visualization), measure_all vs explicit measure, qc.compose for sub-circuits, qc.draw(\"mpl\"|\"text\"|\"latex\"), Qiskit 1.x removed legacy execute()"
signature_short: "qc = QuantumCircuit(n, n); qc.h(0); qc.cx(0, 1); qc.measure(range(n), range(n))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QuantumCircuit / gates / measure — build a circuit"
  - "qiskit-circuit-basics"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/qiskit"
  - "category/qiskit"
  - "tier/tiered"
---

# QuantumCircuit / gates / measure — build a circuit

> QuantumCircuit(n_qubits, n_clbits), single-qubit gates (h, x, y, z, s, t, rx, ry, rz), two-qubit (cx, cz, swap, ccx), barrier (visualization), measure_all vs explicit measure, qc.compose for sub-circuits, qc.draw("mpl"|"text"|"latex"), Qiskit 1.x removed legacy execute()

## Overview

A circuit lists qubits left-to-right but Qiskit reads bitstrings little-endian — qubit 0 is the rightmost bit in the result string. The basic gate set: H (Hadamard, superposition), X/Y/Z (Pauli), CX (CNOT, entanglement), RX/RY/RZ (parameterized rotations). `measure([q], [c])` collapses qubit `q` and writes the classical bit `c`. Three depths solve the SAME task — build the canonical 2-qubit Bell state circuit — at depths: minimal H + CX + measure → parameterized circuit (Parameter for theta) → reusable factory function returning a parameterized circuit, with explicit register names + barriers for clean diagrams.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Build a Bell state |00> + |11> circuit and draw it.
- **Junior** — SAME — Bell-style circuit — but parameterized so you can sweep the rotation angle.
- **Senior** — SAME — Bell-style parameterized circuit — production: factory function, named QuantumRegister, barriers between phases, measure_all helper, deterministic gate-count summary.

## Signature

```python
qc = QuantumCircuit(n, n); qc.h(0); qc.cx(0, 1); qc.measure(range(n), range(n))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Build a Bell state |00> + |11> circuit and draw it.
# APPROACH  - H on qubit 0, CX from 0 to 1, measure both.
# STRENGTHS - Five lines; the canonical entanglement example.
# WEAKNESSES- No parameterization; ASCII output unless you have matplotlib.
from qiskit import QuantumCircuit

qc = QuantumCircuit(2, 2)                             # 2 qubits, 2 classical bits
qc.h(0)                                                # superposition on qubit 0
qc.cx(0, 1)                                            # entangle 1 with 0
qc.measure([0, 1], [0, 1])                             # qubit 0 -> clbit 0, etc.

print(qc.draw("text"))
# Output:
#      ┌───┐     ┌─┐
# q_0: ┤ H ├──■──┤M├───
#      └───┘┌─┴─┐└╥┘┌─┐
# q_1: ─────┤ X ├─╫─┤M├
#           └───┘ ║ └╥┘
# c: 2/═══════════╩══╩═
#                 0  1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Bell-style circuit — but parameterized so you can
#             sweep the rotation angle.
# APPROACH  - Use Parameter('theta'); rx instead of h; bind values later.
# STRENGTHS - Reusable circuit; one transpile, many evaluations.
# WEAKNESSES- Still inline; not packaged as a function.
from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
import numpy as np

theta = Parameter("theta")

qc = QuantumCircuit(2, 2)
qc.rx(theta, 0)                                        # rotation around X by theta
qc.cx(0, 1)
qc.measure([0, 1], [0, 1])

# Bind the parameter at execution time:
bound_pi = qc.assign_parameters({theta: np.pi})        # full flip => |11>
bound_half = qc.assign_parameters({theta: np.pi / 2})  # superposition
print(bound_half.draw("text"))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Bell-style parameterized circuit — production: factory
#             function, named QuantumRegister, barriers between phases,
#             measure_all helper, deterministic gate-count summary.
# APPROACH  - Wrap in build_bell(theta=...); separate prep/measure phases.
# STRENGTHS - Reusable across simulators/hardware; readable diagrams; testable.
# WEAKNESSES- More structure for a 2-qubit example; pays off with 8+ qubits.
from __future__ import annotations
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit.circuit import Parameter, ParameterExpression
import numpy as np


def build_bell(theta: ParameterExpression | float | None = None) -> QuantumCircuit:
    """Bell-style entangler. theta=None gives the canonical |00>+|11>."""
    qr = QuantumRegister(2, name="q")
    cr = ClassicalRegister(2, name="c")
    qc = QuantumCircuit(qr, cr, name="bell")

    # --- prep ---
    if theta is None:
        qc.h(qr[0])                                    # canonical Hadamard
    else:
        qc.rx(theta, qr[0])                            # parameterized version

    qc.cx(qr[0], qr[1])                                # entangle
    qc.barrier(label="prep")                           # separator for diagrams

    # --- measure ---
    qc.measure(qr, cr)
    return qc


def gate_summary(qc: QuantumCircuit) -> dict:
    return {"depth": qc.depth(), "size": qc.size(),
            "ops": dict(qc.count_ops()),
            "n_params": len(qc.parameters)}


# Build canonical Bell circuit:
bell = build_bell()
print(bell.draw("text"))
print(gate_summary(bell))

# Build a parameterized version and bind two angles:
theta = Parameter("theta")
param = build_bell(theta)
for angle in (0.0, np.pi / 2, np.pi):
    bound = param.assign_parameters({theta: angle})
    print(f"theta={angle:.3f} -> {gate_summary(bound)}")

# Decision rule:
#   Quick prototype                          -> inline qc.h(0); qc.cx(0,1); ...
#   Reusable across many runs                -> factory function returning a circuit.
#   Many calls with different angles         -> Parameter + assign_parameters
#                                               (one transpile, many binds).
#   Need named registers in diagrams         -> QuantumRegister(name="...")
#                                               + ClassicalRegister(name="...").
#   Multiple sub-circuits                    -> qc.compose(other, qubits=[...]).
#   Need to inspect gate counts / depth      -> qc.count_ops() / qc.depth() / qc.size().
#   Need a clean visualization               -> qc.draw("mpl"); barriers separate phases.
#   Want OpenQASM output                     -> qc.qasm() (Qiskit <1.x) or qiskit.qasm3.dumps.

# Anti-pattern:
#   qc = QuantumCircuit(2)                   # forgot the classical bits
#   qc.measure([0, 1], [0, 1])                # raises CircuitError
# QuantumCircuit(n) creates a circuit with n qubits but ZERO classical
# bits. Use QuantumCircuit(n_qubits, n_clbits) or call qc.measure_all().
```

## Decision Rule

```text
Quick prototype                          -> inline qc.h(0); qc.cx(0,1); ...
Reusable across many runs                -> factory function returning a circuit.
Many calls with different angles         -> Parameter + assign_parameters
                                            (one transpile, many binds).
Need named registers in diagrams         -> QuantumRegister(name="...")
                                            + ClassicalRegister(name="...").
Multiple sub-circuits                    -> qc.compose(other, qubits=[...]).
Need to inspect gate counts / depth      -> qc.count_ops() / qc.depth() / qc.size().
Need a clean visualization               -> qc.draw("mpl"); barriers separate phases.
Want OpenQASM output                     -> qc.qasm() (Qiskit <1.x) or qiskit.qasm3.dumps.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   qc = QuantumCircuit(2)                   # forgot the classical bits
>   qc.measure([0, 1], [0, 1])                # raises CircuitError
> QuantumCircuit(n) creates a circuit with n qubits but ZERO classical
> bits. Use QuantumCircuit(n_qubits, n_clbits) or call qc.measure_all().

## Tips

- Qiskit reads bitstrings **little-endian** — qubit 0 is the rightmost character in the result string `'01'`.
- `QuantumCircuit(n)` creates n qubits but ZERO classical bits — use `QuantumCircuit(n, n)` or `qc.measure_all()`.
- Parameterize once with `Parameter("theta")`, transpile once, then `assign_parameters({theta: val})` for fast sweeps.
- Use named `QuantumRegister`/`ClassicalRegister` for readable diagrams in larger circuits.
- `qc.draw("mpl")` (needs matplotlib) is the publication-quality output; `"text"` works in any terminal.

## Common Mistake

> [!warning] Calling `qc.measure([0, 1], [0, 1])` on a `QuantumCircuit(2)` — only qubits exist, no classical bits to write to. Use `QuantumCircuit(2, 2)` or `qc.measure_all()`.

## See Also

- [[Sections/quantum/qiskit/qiskit-simulators-shots|Aer / Sampler / shots — run a circuit and read counts (Quantum)]]
- [[Sections/quantum/qiskit/qiskit-transpile|transpile / optimization_level — compile to a backend (Quantum)]]
- [[Sections/quantum/qiskit/_Index|Quantum → Qiskit — circuits, simulators, real hardware]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
