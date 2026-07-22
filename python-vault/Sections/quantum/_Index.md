---
type: "file-index"
domain: "python"
file: "quantum"
title: "Quantum"
tags:
  - "python"
  - "python/quantum"
  - "index"
---

# Quantum

> 6 entries across 4 sections.

## Qiskit — circuits, simulators, real hardware · 3

- [[Sections/quantum/qiskit/qiskit-circuit-basics|QuantumCircuit / gates / measure — build a circuit]] — A `QuantumCircuit(n_qubits, n_classical)` is the canvas. Add gates with `qc.h(q)`, `qc.cx(c, t)`, `qc.rx(theta, q)`. `qc.measure([q], [c])` writes qubit measurements into classical bits. `qc.draw("mpl")` renders a matplotlib circuit diagram.
- [[Sections/quantum/qiskit/qiskit-simulators-shots|Aer / Sampler / shots — run a circuit and read counts]] — In Qiskit 1.x the runtime path is `Sampler` (returns quasi-probabilities or counts) and `Estimator` (returns expectation values of observables). For local simulation use `qiskit-aer`; for IBM hardware use `qiskit-ibm-runtime`. Measurement returns SAMPLES — you set `shots=` and read counts.
- [[Sections/quantum/qiskit/qiskit-transpile|transpile / optimization_level — compile to a backend]] — `transpile(qc, backend)` rewrites your circuit using the backend's native gate set, maps logical qubits to physical qubits respecting the coupling graph, and optimizes (cancellations, merges, commutations). `optimization_level` 0 (none) → 3 (heaviest); 3 is default for hardware.

## Cirq — Google's NISQ-focused framework · 1

- [[Sections/quantum/cirq/cirq-circuit-basics|cirq.Circuit / GridQubit / measure — Cirq circuits]] — Cirq builds circuits from explicit qubit objects (`cirq.LineQubit(0)`, `cirq.GridQubit(0, 0)`) and gate appends. `cirq.Simulator()` runs it; `result.histogram` returns counts. Cirq prints bitstrings **left-to-right** — opposite of Qiskit.

## Quantum concepts cheatsheet · 1

- [[Sections/quantum/concepts/quantum-bell-superposition|Superposition / entanglement / Bell test — the canonical demos]] — Three building blocks every framework demonstrates: (1) **Superposition** — `H|0> = (|0> + |1>)/√2`, sampling gives ~50/50. (2) **Entanglement** — Bell state `(|00> + |11>)/√2`, sampling NEVER gives `01` or `10`. (3) **Bell inequality** — measure correlations across rotated bases; quantum predicts >√2 (CHSH), classical local-realism predicts ≤2.

## When to reach for which framework · 1

- [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework]] — Qiskit (IBM) for general-purpose research and IBM hardware. Cirq (Google) for NISQ + Sycamore-style 2D devices. PennyLane (Xanadu) for hybrid quantum-classical / autodiff / variational ML. Stim for very large Clifford-only circuits (error-correction codes, surface codes).
