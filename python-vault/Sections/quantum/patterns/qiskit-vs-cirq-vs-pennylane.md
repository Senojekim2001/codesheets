---
type: "entry"
domain: "python"
file: "quantum"
section: "patterns"
id: "qiskit-vs-cirq-vs-pennylane"
title: "Qiskit vs Cirq vs PennyLane vs Stim — pick the framework"
category: "patterns"
subtitle: "Qiskit (largest ecosystem, IBM Runtime, Estimator/Sampler primitives, OpenQASM3) vs Cirq (Google, GridQubit, Sycamore, Stim integration) vs PennyLane (autograd/PyTorch interop, qml.qnode decorator, lightning.qubit fast simulator) vs Stim (Clifford-only, scales to 1000s of qubits, error-correction)"
signature_short: "# Qiskit: QuantumCircuit + Sampler/Estimator\\n# Cirq:   cirq.Circuit + Simulator\\n# PennyLane: @qml.qnode(dev) def circuit(): ...\\n# Stim:   stim.Circuit(\"H 0\\\\nCX 0 1\\\\nM 0 1\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Qiskit vs Cirq vs PennyLane vs Stim — pick the framework"
  - "qiskit-vs-cirq-vs-pennylane"
tags:
  - "python"
  - "python/quantum"
  - "python/quantum/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Qiskit vs Cirq vs PennyLane vs Stim — pick the framework

> Qiskit (largest ecosystem, IBM Runtime, Estimator/Sampler primitives, OpenQASM3) vs Cirq (Google, GridQubit, Sycamore, Stim integration) vs PennyLane (autograd/PyTorch interop, qml.qnode decorator, lightning.qubit fast simulator) vs Stim (Clifford-only, scales to 1000s of qubits, error-correction)

## Overview

Four frameworks, four strengths. **Qiskit**: best for 2026 IBM hardware, largest ecosystem (qiskit-experiments, qiskit-machine-learning, qiskit-nature). **Cirq**: tight integration with Google's grid topology, the cleanest API for circuits-as-data, and natural Stim interop. **PennyLane**: differentiable circuits via PyTorch/JAX/TF backends — the right choice for VQE / QAOA / quantum ML. **Stim**: Clifford simulator that scales to thousands of qubits — the only sane way to simulate surface codes. Three depths solve the SAME task — sample a Bell state — at depths: side-by-side Qiskit and Cirq → PennyLane with autograd over a parameterized angle → Stim for a thousand-qubit GHZ circuit (impossible in statevector frameworks).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Bell state in Qiskit and Cirq side-by-side.
- **Junior** — SAME — Bell-style — but in PennyLane with an autograd-able rotation angle and a gradient over a cost function.
- **Senior** — SAME — large entangled state — in Stim, a Clifford-only simulator that scales to thousands of qubits. Build a 1000-qubit GHZ state and sample it.

## Signature

```python
# Qiskit: QuantumCircuit + Sampler/Estimator\n# Cirq:   cirq.Circuit + Simulator\n# PennyLane: @qml.qnode(dev) def circuit(): ...\n# Stim:   stim.Circuit("H 0\\nCX 0 1\\nM 0 1")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Bell state in Qiskit and Cirq side-by-side.
# APPROACH  - Same circuit, different APIs.
# STRENGTHS - Lets you see the API style differences.
# WEAKNESSES- Doesn't show what each is BEST at.

# --- Qiskit ---
from qiskit import QuantumCircuit
from qiskit.primitives import StatevectorSampler

qc = QuantumCircuit(2, 2)
qc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])

job = StatevectorSampler().run([(qc,)], shots=1024)
counts = job.result()[0].data.meas.get_counts()
print("qiskit:", counts)

# --- Cirq ---
import cirq

q = cirq.LineQubit.range(2)
c = cirq.Circuit(cirq.H(q[0]), cirq.CNOT(q[0], q[1]), cirq.measure(*q, key="m"))
result = cirq.Simulator().run(c, repetitions=1024)
print("cirq:  ", result.histogram(key="m"))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Bell-style — but in PennyLane with an autograd-able
#             rotation angle and a gradient over a cost function.
# APPROACH  - @qml.qnode wraps the circuit; PennyLane returns gradients.
# STRENGTHS - Quantum + classical optimizer in one PyTorch-style loop.
# WEAKNESSES- For non-VQE work, the autograd overhead is wasted.
import pennylane as qml
import numpy as np

dev = qml.device("default.qubit", wires=2, shots=None)


@qml.qnode(dev, interface="autograd")
def circuit(theta):
    qml.RY(theta, wires=0)                            # parameterized prep
    qml.CNOT(wires=[0, 1])
    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))  # <Z_0 Z_1>


# At theta=0 the expectation is 1 (perfectly correlated |00>).
# At theta=pi it's also 1 (|11>). At theta=pi/2 it's 0 (mixed).
print("theta=0:    ", float(circuit(0.0)))
print("theta=pi/2: ", float(circuit(np.pi / 2)))

# Optimize: maximize the correlator (cost = -<Z_0 Z_1>).
opt = qml.GradientDescentOptimizer(stepsize=0.1)
theta = np.array(1.0, requires_grad=True)
for step in range(40):
    theta = opt.step(lambda t: -circuit(t), theta)
print(f"optimized theta = {float(theta):.4f}, cost = {float(-circuit(theta)):.4f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — large entangled state — in Stim, a Clifford-only
#             simulator that scales to thousands of qubits. Build a
#             1000-qubit GHZ state and sample it.
# APPROACH  - Stim's text DSL describes the circuit; sample via TableauSimulator.
# STRENGTHS - Polynomial-time Clifford simulation; statevector frameworks
#             would need 2^1000 amplitudes (impossible).
# WEAKNESSES- Clifford-only - no T gates, no rotations. For NISQ /
#             variational, use Qiskit / Cirq / PennyLane.
import stim
import numpy as np


def ghz_circuit(n: int) -> stim.Circuit:
    """1000-qubit GHZ: |0...0> + |1...1>. Clifford only - Stim handles it."""
    c = stim.Circuit()
    c.append("H", [0])
    for i in range(n - 1):
        c.append("CX", [i, i + 1])
    c.append("M", list(range(n)))                     # measure all
    return c


N = 1000
circ = ghz_circuit(N)
print(f"Stim circuit ops: {len(circ)} instructions")

sampler = circ.compile_sampler()
shots = 4
samples = sampler.sample(shots=shots)                 # (shots, N) int8 array
for i, s in enumerate(samples):
    bits = "".join(str(int(b)) for b in s)
    print(f"shot {i}: {bits[:8]}...{bits[-8:]}  (all-equal: {len(set(bits)) == 1})")

# Decision rule:
#   IBM hardware                                -> Qiskit + qiskit_ibm_runtime.
#   Google hardware / Sycamore-shape research   -> Cirq.
#   Variational / QML / hybrid optimization     -> PennyLane (autograd interop).
#   Quantum chemistry                            -> qiskit-nature OR PennyLane (qml.qchem).
#   Error correction / surface codes             -> Stim (Clifford-only but scales).
#   Multi-platform abstraction                   -> PennyLane (device='qiskit.aer' etc.).
#   Teaching / clean API                         -> Cirq.
#   Largest ecosystem in 2026                    -> Qiskit.
#   Need OpenQASM3 input/output                  -> Qiskit (best support today).

# Anti-pattern:
#   trying to simulate a 50-qubit non-Clifford circuit in any statevector framework
# 2^50 complex amplitudes = 16 PB of memory. Either:
#   (a) Reduce qubits to <30 for laptop, <40 for high-RAM server.
#   (b) Restrict to Clifford gates and use Stim.
#   (c) Use tensor-network simulators (e.g. cuTensorNet, quimb) for
#       circuits with low entanglement.
```

## Decision Rule

```text
IBM hardware                                -> Qiskit + qiskit_ibm_runtime.
Google hardware / Sycamore-shape research   -> Cirq.
Variational / QML / hybrid optimization     -> PennyLane (autograd interop).
Quantum chemistry                            -> qiskit-nature OR PennyLane (qml.qchem).
Error correction / surface codes             -> Stim (Clifford-only but scales).
Multi-platform abstraction                   -> PennyLane (device='qiskit.aer' etc.).
Teaching / clean API                         -> Cirq.
Largest ecosystem in 2026                    -> Qiskit.
Need OpenQASM3 input/output                  -> Qiskit (best support today).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   trying to simulate a 50-qubit non-Clifford circuit in any statevector framework
> 2^50 complex amplitudes = 16 PB of memory. Either:
>   (a) Reduce qubits to <30 for laptop, <40 for high-RAM server.
>   (b) Restrict to Clifford gates and use Stim.
>   (c) Use tensor-network simulators (e.g. cuTensorNet, quimb) for
>       circuits with low entanglement.

## Tips

- Qiskit: largest ecosystem in 2026; the right pick for IBM hardware and OpenQASM3.
- Cirq: clean API, GridQubit matches superconducting topology, native Stim interop.
- PennyLane: differentiable circuits with PyTorch/JAX backends — best for variational ML.
- Stim: Clifford-only simulator that scales to thousands of qubits — for surface codes / error correction.
- Statevector simulators die past ~30-40 qubits. For more, switch to Stim (if Clifford-only) or tensor networks.

## Common Mistake

> [!warning] Trying to simulate a 50-qubit general circuit in a statevector framework. 2^50 complex amplitudes = 16 PB of memory. Either use Stim (Clifford-only) or tensor-network simulators.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/quantum/patterns/_Index|Quantum → When to reach for which framework]]
- [[Sections/quantum/_Index|Quantum index]]
- [[_Index|Vault index]]
