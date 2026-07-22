export const meta = {
  "id": "quantum",
  "label": "Quantum",
  "icon": "⚛️",
  "description": "Quantum computing in Python: Qiskit (IBM, dominant in 2026 with the v1.x API), Cirq (Google, NISQ-friendly), PennyLane (differentiable / hybrid quantum-classical). Three things you keep getting wrong: qubit ordering (Qiskit is little-endian, Cirq is left-to-right), measurement returns SAMPLES not probabilities, and noiseless simulators flatter your circuits — always test on a noisy backend before claiming \"it works on hardware\"."
}

export const sections = [

  // ── Section 1: Qiskit — circuits, simulators, real hardware ─────────────────────────────────────────
  {
    id: "qiskit",
    title: "Qiskit — circuits, simulators, real hardware",
    entries: [
      {
        id: "qiskit-circuit-basics",
        fn: "QuantumCircuit / gates / measure — build a circuit",
        desc: "A `QuantumCircuit(n_qubits, n_classical)` is the canvas. Add gates with `qc.h(q)`, `qc.cx(c, t)`, `qc.rx(theta, q)`. `qc.measure([q], [c])` writes qubit measurements into classical bits. `qc.draw(\"mpl\")` renders a matplotlib circuit diagram.",
        category: "qiskit",
        subtitle: "QuantumCircuit(n_qubits, n_clbits), single-qubit gates (h, x, y, z, s, t, rx, ry, rz), two-qubit (cx, cz, swap, ccx), barrier (visualization), measure_all vs explicit measure, qc.compose for sub-circuits, qc.draw(\"mpl\"|\"text\"|\"latex\"), Qiskit 1.x removed legacy execute()",
        signature: "qc = QuantumCircuit(n, n); qc.h(0); qc.cx(0, 1); qc.measure(range(n), range(n))",
        descLong: "A circuit lists qubits left-to-right but Qiskit reads bitstrings little-endian — qubit 0 is the rightmost bit in the result string. The basic gate set: H (Hadamard, superposition), X/Y/Z (Pauli), CX (CNOT, entanglement), RX/RY/RZ (parameterized rotations). `measure([q], [c])` collapses qubit `q` and writes the classical bit `c`. Three depths solve the SAME task — build the canonical 2-qubit Bell state circuit — at depths: minimal H + CX + measure → parameterized circuit (Parameter for theta) → reusable factory function returning a parameterized circuit, with explicit register names + barriers for clean diagrams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Build a Bell state |00> + |11> circuit and draw it.\n# APPROACH  - H on qubit 0, CX from 0 to 1, measure both.\n# STRENGTHS - Five lines; the canonical entanglement example.\n# WEAKNESSES- No parameterization; ASCII output unless you have matplotlib.\nfrom qiskit import QuantumCircuit\n\nqc = QuantumCircuit(2, 2)                             # 2 qubits, 2 classical bits\nqc.h(0)                                                # superposition on qubit 0\nqc.cx(0, 1)                                            # entangle 1 with 0\nqc.measure([0, 1], [0, 1])                             # qubit 0 -> clbit 0, etc.\n\nprint(qc.draw(\"text\"))\n# Output:\n#      ┌───┐     ┌─┐\n# q_0: ┤ H ├──■──┤M├───\n#      └───┘┌─┴─┐└╥┘┌─┐\n# q_1: ─────┤ X ├─╫─┤M├\n#           └───┘ ║ └╥┘\n# c: 2/═══════════╩══╩═\n#                 0  1\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — Bell-style circuit — but parameterized so you can\n#             sweep the rotation angle.\n# APPROACH  - Use Parameter('theta'); rx instead of h; bind values later.\n# STRENGTHS - Reusable circuit; one transpile, many evaluations.\n# WEAKNESSES- Still inline; not packaged as a function.\nfrom qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\nimport numpy as np\n\ntheta = Parameter(\"theta\")\n\nqc = QuantumCircuit(2, 2)\nqc.rx(theta, 0)                                        # rotation around X by theta\nqc.cx(0, 1)\nqc.measure([0, 1], [0, 1])\n\n# Bind the parameter at execution time:\nbound_pi = qc.assign_parameters({theta: np.pi})        # full flip => |11>\nbound_half = qc.assign_parameters({theta: np.pi / 2})  # superposition\nprint(bound_half.draw(\"text\"))\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — Bell-style parameterized circuit — production: factory\n#             function, named QuantumRegister, barriers between phases,\n#             measure_all helper, deterministic gate-count summary.\n# APPROACH  - Wrap in build_bell(theta=...); separate prep/measure phases.\n# STRENGTHS - Reusable across simulators/hardware; readable diagrams; testable.\n# WEAKNESSES- More structure for a 2-qubit example; pays off with 8+ qubits.\nfrom __future__ import annotations\nfrom qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\nfrom qiskit.circuit import Parameter, ParameterExpression\nimport numpy as np\n\n\ndef build_bell(theta: ParameterExpression | float | None = None) -> QuantumCircuit:\n    \"\"\"Bell-style entangler. theta=None gives the canonical |00>+|11>.\"\"\"\n    qr = QuantumRegister(2, name=\"q\")\n    cr = ClassicalRegister(2, name=\"c\")\n    qc = QuantumCircuit(qr, cr, name=\"bell\")\n\n    # --- prep ---\n    if theta is None:\n        qc.h(qr[0])                                    # canonical Hadamard\n    else:\n        qc.rx(theta, qr[0])                            # parameterized version\n\n    qc.cx(qr[0], qr[1])                                # entangle\n    qc.barrier(label=\"prep\")                           # separator for diagrams\n\n    # --- measure ---\n    qc.measure(qr, cr)\n    return qc\n\n\ndef gate_summary(qc: QuantumCircuit) -> dict:\n    return {\"depth\": qc.depth(), \"size\": qc.size(),\n            \"ops\": dict(qc.count_ops()),\n            \"n_params\": len(qc.parameters)}\n\n\n# Build canonical Bell circuit:\nbell = build_bell()\nprint(bell.draw(\"text\"))\nprint(gate_summary(bell))\n\n# Build a parameterized version and bind two angles:\ntheta = Parameter(\"theta\")\nparam = build_bell(theta)\nfor angle in (0.0, np.pi / 2, np.pi):\n    bound = param.assign_parameters({theta: angle})\n    print(f\"theta={angle:.3f} -> {gate_summary(bound)}\")\n\n# Decision rule:\n#   Quick prototype                          -> inline qc.h(0); qc.cx(0,1); ...\n#   Reusable across many runs                -> factory function returning a circuit.\n#   Many calls with different angles         -> Parameter + assign_parameters\n#                                               (one transpile, many binds).\n#   Need named registers in diagrams         -> QuantumRegister(name=\"...\")\n#                                               + ClassicalRegister(name=\"...\").\n#   Multiple sub-circuits                    -> qc.compose(other, qubits=[...]).\n#   Need to inspect gate counts / depth      -> qc.count_ops() / qc.depth() / qc.size().\n#   Need a clean visualization               -> qc.draw(\"mpl\"); barriers separate phases.\n#   Want OpenQASM output                     -> qc.qasm() (Qiskit <1.x) or qiskit.qasm3.dumps.\n\n# Anti-pattern:\n#   qc = QuantumCircuit(2)                   # forgot the classical bits\n#   qc.measure([0, 1], [0, 1])                # raises CircuitError\n# QuantumCircuit(n) creates a circuit with n qubits but ZERO classical\n# bits. Use QuantumCircuit(n_qubits, n_clbits) or call qc.measure_all().\n"
                  }
        ],
        tips: [
                  "Qiskit reads bitstrings **little-endian** — qubit 0 is the rightmost character in the result string `'01'`.",
                  "`QuantumCircuit(n)` creates n qubits but ZERO classical bits — use `QuantumCircuit(n, n)` or `qc.measure_all()`.",
                  "Parameterize once with `Parameter(\"theta\")`, transpile once, then `assign_parameters({theta: val})` for fast sweeps.",
                  "Use named `QuantumRegister`/`ClassicalRegister` for readable diagrams in larger circuits.",
                  "`qc.draw(\"mpl\")` (needs matplotlib) is the publication-quality output; `\"text\"` works in any terminal."
        ],
        mistake: "Calling `qc.measure([0, 1], [0, 1])` on a `QuantumCircuit(2)` — only qubits exist, no classical bits to write to. Use `QuantumCircuit(2, 2)` or `qc.measure_all()`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "qiskit-simulators-shots",
        fn: "Aer / Sampler / shots — run a circuit and read counts",
        desc: "In Qiskit 1.x the runtime path is `Sampler` (returns quasi-probabilities or counts) and `Estimator` (returns expectation values of observables). For local simulation use `qiskit-aer`; for IBM hardware use `qiskit-ibm-runtime`. Measurement returns SAMPLES — you set `shots=` and read counts.",
        category: "qiskit",
        subtitle: "qiskit-aer (AerSimulator: statevector / qasm / density-matrix), qiskit.primitives.Sampler (counts/quasi-probs) vs Estimator (expectation values), shots= controls noise floor (1/sqrt(N) statistics), result.quasi_dists / result.data, IBM Runtime backend selection",
        signature: "sampler = StatevectorSampler(); job = sampler.run([(qc,)], shots=8192); counts = job.result()[0].data.meas.get_counts()",
        descLong: "Qiskit 1.x dropped the old `execute()` function; use `Sampler` (for measurement-based outputs) or `Estimator` (for `<psi|H|psi>` expectation values). Locally, `StatevectorSampler` runs noiseless; `qiskit_aer.AerSimulator` runs with optional noise models. `shots=` sets the sampling budget; statistical error is ~1/√shots. Three depths solve the SAME task — sample the Bell circuit and report the counts — at depths: AerSimulator + run + result.get_counts (legacy-feeling) → Sampler primitive (Qiskit 1.x idiomatic) → Sampler + noise model + multiple shot budgets to show statistical convergence.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Sample a Bell circuit 1000 times; print counts.\n# APPROACH  - AerSimulator + qc.run + result.get_counts.\n# STRENGTHS - Familiar interface; works in older Qiskit examples.\n# WEAKNESSES- Older API; the modern path is the Sampler primitive (junior tier).\nfrom qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator                  # pip install qiskit-aer\n\nqc = QuantumCircuit(2, 2)\nqc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])\n\nsim = AerSimulator()\nresult = sim.run(qc, shots=1000).result()\ncounts = result.get_counts()\nprint(counts)                                          # e.g. {'00': 503, '11': 497}\n\n# Bitstring order: '00' means clbit_1 clbit_0 -> qubits 1 and 0.\n# Qiskit is little-endian: rightmost char = qubit 0.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — sample Bell circuit — using the modern Sampler primitive.\n# APPROACH  - StatevectorSampler from qiskit.primitives; pubs format.\n# STRENGTHS - Qiskit 1.x idiomatic; same interface for sim and IBM Runtime.\n# WEAKNESSES- The new \"pub\" tuple format is verbose for a single circuit.\nfrom qiskit import QuantumCircuit\nfrom qiskit.primitives import StatevectorSampler\n\nqc = QuantumCircuit(2, 2)\nqc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])\n\nsampler = StatevectorSampler()\n\n# A \"pub\" (Primitive Unified Bloc) is a tuple of (circuit, [params], shots).\n# For a non-parameterized circuit the tuple is just (circuit,).\njob = sampler.run([(qc,)], shots=4096)\nresult = job.result()\ndata = result[0].data                                  # PubResult for our one pub\ncounts = data.meas.get_counts()                        # 'meas' = default classical register\nprint(counts)                                          # {'00': ~2048, '11': ~2048}\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — sample Bell circuit — production: noise model from a\n#             real backend, shot-budget sweep, statistical error reporting.\n# APPROACH  - AerSimulator.from_backend(noise_backend); Sampler for the run;\n#             relative-frequency table with Wilson confidence intervals.\n# STRENGTHS - Calibrated to real-device noise; sensible error bars.\n# WEAKNESSES- Need a backend for the noise model (FakeBackend works offline).\nfrom __future__ import annotations\nimport math\nfrom qiskit import QuantumCircuit, transpile\nfrom qiskit_aer import AerSimulator\nfrom qiskit_aer.primitives import SamplerV2 as AerSampler\n\n\n# Wilson CI for a binomial proportion (better than normal at low counts).\ndef wilson_ci(k: int, n: int, z: float = 1.96) -> tuple[float, float]:\n    if n == 0: return (0.0, 0.0)\n    p = k / n\n    denom = 1 + z**2 / n\n    centre = (p + z**2 / (2 * n)) / denom\n    half = (z / denom) * math.sqrt(p * (1 - p) / n + z**2 / (4 * n**2))\n    return (max(0.0, centre - half), min(1.0, centre + half))\n\n\ndef bell() -> QuantumCircuit:\n    qc = QuantumCircuit(2, 2, name=\"bell\")\n    qc.h(0); qc.cx(0, 1)\n    qc.measure([0, 1], [0, 1])\n    return qc\n\n\ndef run_with_noise(qc: QuantumCircuit, *, shots: int = 4096,\n                   noise_backend=None) -> dict[str, int]:\n    \"\"\"Sample qc on AerSimulator with optional noise model.\"\"\"\n    if noise_backend is not None:\n        # Build a noise model that mimics the backend's calibration.\n        sim = AerSimulator.from_backend(noise_backend)\n    else:\n        sim = AerSimulator()                          # noiseless\n\n    qc_t = transpile(qc, sim)                          # match basis gates\n    sampler = AerSampler()\n    pub_result = sampler.run([(qc_t,)], shots=shots).result()[0]\n    return pub_result.data.meas.get_counts()\n\n\ndef report(counts: dict[str, int]) -> None:\n    n = sum(counts.values())\n    print(f\"shots = {n}\")\n    for outcome in sorted(counts):\n        k = counts[outcome]\n        lo, hi = wilson_ci(k, n)\n        print(f\"  {outcome}: {k:5d}  {k/n:6.3f}  [{lo:.3f}, {hi:.3f}]\")\n\n\n# Noiseless reference\nprint(\"=== noiseless ===\")\nreport(run_with_noise(bell(), shots=4096))\n\n# Noisy run if a fake backend is available (offline; ships with qiskit-aer).\ntry:\n    from qiskit_ibm_runtime.fake_provider import FakeManila\n    print(\"\\n=== with FakeManila noise ===\")\n    report(run_with_noise(bell(), shots=4096, noise_backend=FakeManila()))\nexcept ImportError:\n    pass\n\n# Decision rule:\n#   Want measurement counts                       -> Sampler primitive.\n#   Want <psi|H|psi> for a Hamiltonian H          -> Estimator primitive.\n#   Local noiseless                                -> StatevectorSampler / StatevectorEstimator.\n#   Local with calibrated noise                    -> qiskit_aer.AerSimulator(.from_backend(b)).\n#   Real IBM quantum hardware                      -> qiskit_ibm_runtime + Session.\n#   Fast classical exact answer                    -> Statevector(qc).probabilities_dict().\n#   Many parameterized executions                   -> transpile once, then bind values\n#                                                       on the transpiled circuit.\n#   Need stable counts                              -> shots >= 8192; std ~ 1/sqrt(N).\n\n# Anti-pattern:\n#   counts = sampler.run([(qc,)]).result()[0].data.meas.get_counts()\n#   probs = {k: v / 1024 for k, v in counts.items()}        # assumed shots\n# Hardcoding the divisor instead of summing counts. Always normalize by\n# n = sum(counts.values()) - shots= can be ignored by some backends.\n"
                  }
        ],
        tips: [
                  "Qiskit 1.x: use `Sampler` (counts/quasi-probabilities) and `Estimator` (expectation values). The legacy `execute()` is gone.",
                  "Local noiseless: `qiskit.primitives.StatevectorSampler`. Local noise: `qiskit_aer.AerSimulator(.from_backend(b))`.",
                  "Statistical error of counts is ~1/√shots — `shots=8192` for ~1% precision per outcome.",
                  "Always `transpile(qc, backend)` before sampling — the basis gate set differs between simulators and hardware.",
                  "For exact noiseless probabilities (no sampling), use `Statevector(qc).probabilities_dict()` — no shots needed."
        ],
        mistake: "Treating `counts.values()` as probabilities by dividing by an assumed `shots` value. Always `n = sum(counts.values())` then divide — `shots=` is a request, not a guarantee.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "qiskit-transpile",
        fn: "transpile / optimization_level — compile to a backend",
        desc: "`transpile(qc, backend)` rewrites your circuit using the backend's native gate set, maps logical qubits to physical qubits respecting the coupling graph, and optimizes (cancellations, merges, commutations). `optimization_level` 0 (none) → 3 (heaviest); 3 is default for hardware.",
        category: "qiskit",
        subtitle: "transpile(qc, backend, optimization_level=0..3, basis_gates=, coupling_map=, layout_method=, routing_method=), preset pass managers, generate_preset_pass_manager (Qiskit 1.x), depth + 2-qubit-gate count as quality metrics, layout vs routing vs translation",
        signature: "qc_t = transpile(qc, backend=, optimization_level=3); pm = generate_preset_pass_manager(target=backend.target, optimization_level=2)",
        descLong: "A logical circuit usually contains gates the hardware can't do natively (no `H` on superconducting qubits — only `X`, `SX`, `RZ`, `ECR/CX`). transpile decomposes everything into the backend's basis, picks a physical-qubit layout, inserts SWAPs to satisfy the coupling map, then optimizes. The 2-qubit gate count after transpile is your fidelity proxy — minimize it. Three depths solve the SAME task — transpile a 4-qubit circuit for a fake backend and report depth — at depths: bare `transpile(qc, backend)` → loop over optimization_level 0/1/2/3 with metrics → custom pass manager + multiple seed_transpiler runs (transpilation is randomized) keeping the best.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Transpile a 4-qubit circuit for a backend; check depth.\n# APPROACH  - transpile(qc, backend); report depth + 2q gates.\n# STRENGTHS - One call.\n# WEAKNESSES- Default optimization_level=1; misses easy wins from level 3.\nfrom qiskit import QuantumCircuit, transpile\nfrom qiskit_ibm_runtime.fake_provider import FakeManila\n\nqc = QuantumCircuit(4)\nqc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)\n\nbackend = FakeManila()\nqc_t = transpile(qc, backend)                          # default optimization_level=1\nprint(\"logical depth:\",   qc.depth())\nprint(\"physical depth:\",  qc_t.depth())\nprint(\"2q gates after:\",  sum(qc_t.count_ops().get(g, 0) for g in (\"cx\", \"ecr\")))\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — transpile + report — sweep optimization_level 0..3.\n# APPROACH  - Loop the levels; report depth and 2q gate count.\n# STRENGTHS - Shows the trade-off (level 3 takes longer to compile but\n#             produces shorter circuits with fewer 2q gates).\n# WEAKNESSES- Single seed; transpilation is stochastic above level 1.\nfrom qiskit import QuantumCircuit, transpile\nfrom qiskit_ibm_runtime.fake_provider import FakeManila\n\nqc = QuantumCircuit(4)\nqc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)\nqc.measure_all()\n\nbackend = FakeManila()\n\nprint(f\"{'level':>5} {'depth':>6} {'2q':>4} {'size':>5}\")\nfor level in (0, 1, 2, 3):\n    t = transpile(qc, backend, optimization_level=level, seed_transpiler=42)\n    twoq = sum(t.count_ops().get(g, 0) for g in (\"cx\", \"ecr\"))\n    print(f\"{level:>5} {t.depth():>6} {twoq:>4} {t.size():>5}\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — transpile a 4-qubit circuit — production: multiple\n#             random seeds, keep the lowest 2q-gate count, fall back to\n#             a pass manager if you need custom passes.\n# APPROACH  - generate_preset_pass_manager + seed sweep + best-of-N.\n# STRENGTHS - Mitigates transpile randomness; reports best result;\n#             extensible with custom passes.\n# WEAKNESSES- N transpiles take N times longer.\nfrom __future__ import annotations\nfrom qiskit import QuantumCircuit, transpile\nfrom qiskit.transpiler.preset_passmanagers import generate_preset_pass_manager\nfrom qiskit_ibm_runtime.fake_provider import FakeManila\n\n\ndef best_transpile(\n    qc: QuantumCircuit, backend, *,\n    optimization_level: int = 3,\n    n_seeds: int = 16,\n) -> tuple[QuantumCircuit, dict]:\n    \"\"\"Run N seeds of the preset pass manager; keep the best by 2q-gate count.\"\"\"\n    pm = generate_preset_pass_manager(\n        optimization_level=optimization_level,\n        backend=backend,\n    )\n    twoq_basis = (\"cx\", \"ecr\", \"cz\")\n    best_t = None\n    best_metrics: dict = {\"two_q\": 10**9}\n    for seed in range(n_seeds):\n        # seed_transpiler controls layout + routing randomness.\n        pm.seed_transpiler = seed\n        t = pm.run(qc)\n        m = {\n            \"depth\": t.depth(),\n            \"two_q\": sum(t.count_ops().get(g, 0) for g in twoq_basis),\n            \"size\":  t.size(),\n            \"seed\":  seed,\n        }\n        if (m[\"two_q\"], m[\"depth\"]) < (best_metrics[\"two_q\"], best_metrics.get(\"depth\", 10**9)):\n            best_t = t\n            best_metrics = m\n    return best_t, best_metrics\n\n\nqc = QuantumCircuit(4)\nqc.h(0); qc.cx(0, 1); qc.cx(1, 2); qc.cx(2, 3)\nqc.measure_all()\n\nbest, metrics = best_transpile(qc, FakeManila(), optimization_level=3, n_seeds=16)\nprint(f\"best -> depth={metrics['depth']}, 2q={metrics['two_q']}, \"\n      f\"size={metrics['size']}, seed={metrics['seed']}\")\n\n# Decision rule:\n#   Local simulator                       -> any optimization_level; cheap.\n#   Real hardware                          -> optimization_level=3 minimum.\n#   Care about 2q gate count               -> sweep n_seeds (transpile is stochastic).\n#   Need a CUSTOM pass                     -> generate_preset_pass_manager(...).run(qc)\n#                                             + insert your pass.\n#   Need to lock layout (topology study)   -> initial_layout=[...] (physical qubits).\n#   Need to control routing                -> routing_method='sabre' (default) /\n#                                             'lookahead' / 'basic'.\n#   Need basis gates explicitly            -> basis_gates=['rz','sx','cx'] (no backend).\n#   Want OpenQASM output for another tool  -> qasm3.dumps(qc_t).\n\n# Anti-pattern:\n#   sampler.run([(qc,)])                  # qc not transpiled for the backend\n# IBM Runtime accepts ANY circuit but silently transpiles with default\n# settings - usually optimization_level=1 + a random seed. For research\n# results you want the BEST 2q gate count - transpile yourself with\n# multiple seeds at level 3 first.\n"
                  }
        ],
        tips: [
                  "`optimization_level=3` is the heaviest preset and the default for hardware — use it when you ship.",
                  "The 2-qubit gate count after transpile is your fidelity proxy — minimize it.",
                  "Transpilation is stochastic past level 1 — run with multiple `seed_transpiler` values and keep the best.",
                  "For custom passes, use `generate_preset_pass_manager(...)` and insert your pass into its passes.",
                  "`qiskit_aer` simulators don't need transpile for correctness, but transpile lets them mirror hardware noise behavior."
        ],
        mistake: "Submitting a logical circuit to IBM Runtime without transpiling — Runtime silently transpiles at level 1 with one seed. For real research, transpile yourself at level 3 across multiple seeds.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Cirq — Google's NISQ-focused framework ─────────────────────────────────────────
  {
    id: "cirq",
    title: "Cirq — Google's NISQ-focused framework",
    entries: [
      {
        id: "cirq-circuit-basics",
        fn: "cirq.Circuit / GridQubit / measure — Cirq circuits",
        desc: "Cirq builds circuits from explicit qubit objects (`cirq.LineQubit(0)`, `cirq.GridQubit(0, 0)`) and gate appends. `cirq.Simulator()` runs it; `result.histogram` returns counts. Cirq prints bitstrings **left-to-right** — opposite of Qiskit.",
        category: "cirq",
        subtitle: "cirq.LineQubit / GridQubit (explicit qubit objects, not indices), cirq.Circuit + append, gates (cirq.H, cirq.X, cirq.CNOT, cirq.rx, cirq.measure), cirq.Simulator() run + result.histogram, big-endian bitstring order (opposite of Qiskit), cirq.unitary(circuit) for exact unitary",
        signature: "q = cirq.LineQubit.range(2); c = cirq.Circuit([cirq.H(q[0]), cirq.CNOT(q[0], q[1]), cirq.measure(*q, key=\"m\")]); cirq.Simulator().run(c, repetitions=1000)",
        descLong: "Cirq is qubit-explicit: you create `cirq.LineQubit` (1D) or `cirq.GridQubit(row, col)` (2D, matches superconducting topologies) objects and pass them to gates. Circuits are appended (`Circuit.append([gates])`); `cirq.measure(*qubits, key=\"name\")` writes one named result. Three depths solve the SAME task — Bell state in Cirq, sampled — at depths: minimal Circuit + Simulator → GridQubit (matches device), histogram + frequencies → noisy simulator with `cirq.depolarize` channel and per-key statistics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Bell state in Cirq, 1000 shots, print counts.\n# APPROACH  - LineQubit + Circuit + Simulator.run.\n# STRENGTHS - Clean object model (qubits are first-class).\n# WEAKNESSES- Bitstring ordering is left-to-right (opposite of Qiskit).\nimport cirq\n\nq0, q1 = cirq.LineQubit.range(2)\ncircuit = cirq.Circuit(\n    cirq.H(q0),\n    cirq.CNOT(q0, q1),\n    cirq.measure(q0, q1, key=\"m\"),\n)\n\nresult = cirq.Simulator().run(circuit, repetitions=1000)\nprint(circuit)\nprint(result.histogram(key=\"m\"))                       # Counter({0: ~500, 3: ~500})\n# Histogram keys are integers: bits read left-to-right.\n# 0 = \"00\", 3 = \"11\" - the Bell outcomes.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — Bell sampled — but on GridQubit (matches Sycamore-like\n#             device layout) and print clean frequencies.\n# APPROACH  - GridQubit(row, col); decode int->bitstring; freq table.\n# STRENGTHS - Layout matches real superconducting devices; readable output.\n# WEAKNESSES- Still noiseless.\nimport cirq\nfrom collections import Counter\n\n# Two adjacent qubits on a 2D grid - same shape as Google Sycamore.\nq00 = cirq.GridQubit(0, 0)\nq01 = cirq.GridQubit(0, 1)\n\ncircuit = cirq.Circuit(\n    cirq.H(q00),\n    cirq.CNOT(q00, q01),\n    cirq.measure(q00, q01, key=\"m\"),\n)\nprint(circuit)\n\nshots = 4096\nresult = cirq.Simulator().run(circuit, repetitions=shots)\nhist: Counter = result.histogram(key=\"m\")\n\n# Convert int outcomes to bitstrings for printing.\ndef to_bits(i: int, n: int) -> str:\n    return format(i, f\"0{n}b\")\n\nprint(f\"{'outcome':>8} {'count':>6} {'freq':>7}\")\nfor k in sorted(hist):\n    print(f\"{to_bits(k, 2):>8} {hist[k]:>6} {hist[k]/shots:>7.3f}\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — Bell on GridQubit — production: noisy simulator with\n#             depolarizing channel after each gate; statistics across\n#             multiple noise levels.\n# APPROACH  - cirq.NoiseModel via cirq.depolarize; sweep error rates;\n#             return frequencies + how far from ideal (TVD).\n# STRENGTHS - Realistic NISQ behavior; quantifies \"how broken is it\".\n# WEAKNESSES- depolarize is a toy noise model; real device fidelity needs\n#             calibration data (T1, T2, gate errors per qubit).\nfrom __future__ import annotations\nimport cirq\nimport numpy as np\nfrom collections import Counter\n\n\ndef bell_circuit(n: int = 2) -> tuple[cirq.Circuit, list[cirq.Qid]]:\n    qs = cirq.LineQubit.range(n)\n    c = cirq.Circuit(cirq.H(qs[0]),\n                     *(cirq.CNOT(qs[i], qs[i + 1]) for i in range(n - 1)),\n                     cirq.measure(*qs, key=\"m\"))\n    return c, qs\n\n\ndef freqs(hist: Counter, n_bits: int, shots: int) -> dict[str, float]:\n    return {format(k, f\"0{n_bits}b\"): hist[k] / shots\n            for k in sorted(hist)}\n\n\ndef tvd(p: dict[str, float], q: dict[str, float]) -> float:\n    \"\"\"Total Variation Distance between two distributions.\"\"\"\n    keys = set(p) | set(q)\n    return 0.5 * sum(abs(p.get(k, 0) - q.get(k, 0)) for k in keys)\n\n\ndef run(p_error: float, *, shots: int = 4096) -> dict[str, float]:\n    circuit, qs = bell_circuit(2)\n    if p_error > 0:\n        # Apply depolarizing noise after every gate.\n        noisy = circuit.with_noise(cirq.depolarize(p=p_error))\n    else:\n        noisy = circuit\n    sim = cirq.DensityMatrixSimulator() if p_error > 0 else cirq.Simulator()\n    result = sim.run(noisy, repetitions=shots)\n    return freqs(result.histogram(key=\"m\"), 2, shots)\n\n\nideal = {\"00\": 0.5, \"11\": 0.5}\nprint(f\"{'p_error':>8} {'00':>5} {'01':>5} {'10':>5} {'11':>5} {'TVD':>5}\")\nfor p in (0.0, 0.001, 0.005, 0.01, 0.05):\n    f = run(p)\n    print(f\"{p:>8.3f} \"\n          f\"{f.get('00',0):>5.3f} {f.get('01',0):>5.3f} \"\n          f\"{f.get('10',0):>5.3f} {f.get('11',0):>5.3f} \"\n          f\"{tvd(f, ideal):>5.3f}\")\n\n# Decision rule:\n#   Want a 2D-topology-aware circuit         -> cirq.GridQubit(row, col).\n#   Linear chain                              -> cirq.LineQubit.range(n).\n#   Need named qubits                         -> cirq.NamedQubit('alice').\n#   Statevector exact answer                  -> cirq.Simulator().simulate(c)\n#                                                .final_state_vector.\n#   Sampled counts                            -> cirq.Simulator().run(c, repetitions=).\n#   Noisy simulation                          -> circuit.with_noise(channel) +\n#                                                 DensityMatrixSimulator.\n#   Want the unitary matrix                   -> cirq.unitary(circuit).\n#   Want SVG / text                           -> print(circuit) for ASCII; cirq.\n#                                                 contrib SVG drawer for diagrams.\n\n# Anti-pattern:\n#   cirq.Simulator().run(circuit_with_noise)   # state vector sim + noisy circuit\n# Simulator() is statevector-only; noise channels need DensityMatrixSimulator\n# (or Clifford-only Stim for big circuits). Wrong simulator -> noise is\n# silently ignored.\n"
                  }
        ],
        tips: [
                  "Cirq qubits are objects (`LineQubit(0)`, `GridQubit(row, col)`) — pass them to gates instead of integers.",
                  "Cirq histogram keys are integers; bits are read **left-to-right** (opposite of Qiskit's little-endian).",
                  "For exact statevector use `simulator.simulate(c).final_state_vector`; for samples use `simulator.run(c, repetitions=)`.",
                  "Noisy circuits need `DensityMatrixSimulator()` — `Simulator()` silently ignores noise channels.",
                  "`cirq.unitary(circuit)` returns the exact unitary matrix — handy for verifying small circuits."
        ],
        mistake: "Running a noisy circuit with `cirq.Simulator()` (statevector). The noise channels are silently dropped; you get the noiseless answer. Use `DensityMatrixSimulator()`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Quantum concepts cheatsheet ─────────────────────────────────────────
  {
    id: "concepts",
    title: "Quantum concepts cheatsheet",
    entries: [
      {
        id: "quantum-bell-superposition",
        fn: "Superposition / entanglement / Bell test — the canonical demos",
        desc: "Three building blocks every framework demonstrates: (1) **Superposition** — `H|0> = (|0> + |1>)/√2`, sampling gives ~50/50. (2) **Entanglement** — Bell state `(|00> + |11>)/√2`, sampling NEVER gives `01` or `10`. (3) **Bell inequality** — measure correlations across rotated bases; quantum predicts >√2 (CHSH), classical local-realism predicts ≤2.",
        category: "concepts",
        subtitle: "H gate (Hadamard), Bell state preparation (H + CX), correlated measurement outcomes (no 01/10), single-qubit rotations RX/RY/RZ on the Bloch sphere, CHSH operator estimation, statevector vs sampled probabilities",
        signature: "qc.h(0)              # superposition\\nqc.h(0); qc.cx(0,1)  # entanglement\\nqc.ry(theta, q)      # rotate before measuring",
        descLong: "Three escalating demos. (1) Single H on |0> — sampling shows ~50/50 split. (2) H + CX — outcomes correlate perfectly: only `00` or `11`. (3) Bell test (CHSH): rotate measurement basis on each qubit, compute the four correlators, check `|S| > 2`. The CHSH bound is the cleanest \"quantum is doing something classical can't\" demo. Three depths solve the SAME task — show that a Bell pair is correlated — at depths: H + CX + sample (visual) → exact statevector probabilities (no shots) → CHSH-style correlator across rotated bases reporting S vs the classical bound of 2.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Show that a Bell pair always gives 00 or 11.\n# APPROACH  - H + CX + sample 1000 times.\n# STRENGTHS - Visual; the canonical \"entanglement is real\" demo.\n# WEAKNESSES- Statistical noise on small N; can't prove no-01 from samples.\nfrom qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\n\nqc = QuantumCircuit(2, 2)\nqc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])\n\ncounts = AerSimulator().run(qc, shots=2000).result().get_counts()\nprint(counts)\n# Expected: {'00': ~1000, '11': ~1000}, NEVER '01' or '10'.\n# Compare with two independent qubits in superposition:\n#   qc2 = QuantumCircuit(2, 2); qc2.h(0); qc2.h(1); qc2.measure(...)\n#   counts -> ~25% for each of 00, 01, 10, 11.\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — show Bell correlation — but EXACTLY via statevector.\n# APPROACH  - Statevector(qc) -> probabilities_dict.\n# STRENGTHS - Exact; no sampling noise; provably 0% on 01 and 10.\n# WEAKNESSES- Doesn't scale past ~25 qubits (statevector is 2^n complex amps).\nfrom qiskit import QuantumCircuit\nfrom qiskit.quantum_info import Statevector\nimport numpy as np\n\nqc = QuantumCircuit(2)                                # no measurement for Statevector\nqc.h(0); qc.cx(0, 1)\n\nsv = Statevector(qc)\nprint(\"amplitudes:\", sv.data)                         # complex array of length 4\nprint(\"probabilities:\", sv.probabilities_dict())\n# {'00': 0.5, '11': 0.5}  -  EXACTLY zero on 01 and 10.\n\n# Compare with the unentangled product state:\nqc2 = QuantumCircuit(2)\nqc2.h(0); qc2.h(1)\nprint(\"product (HxH):\", Statevector(qc2).probabilities_dict())\n# {'00': 0.25, '01': 0.25, '10': 0.25, '11': 0.25}\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — prove the Bell pair is non-classical — CHSH inequality.\n# APPROACH  - Measure four correlators E(a, b) at chosen rotation angles;\n#             classical bound on |S| is 2; quantum reaches 2*sqrt(2).\n# STRENGTHS - The cleanest quantum-vs-classical experimental signature.\n# WEAKNESSES- Needs many shots per setting; deviation from 2*sqrt(2)\n#             measures the device's noise.\nfrom __future__ import annotations\nimport math\nfrom qiskit import QuantumCircuit\nfrom qiskit_aer import AerSimulator\nimport numpy as np\n\n\ndef chsh_circuit(theta_a: float, theta_b: float) -> QuantumCircuit:\n    \"\"\"Bell pair, then rotate qubit 0 by theta_a (RY) and qubit 1 by theta_b.\"\"\"\n    qc = QuantumCircuit(2, 2)\n    qc.h(0); qc.cx(0, 1)\n    qc.ry(theta_a, 0)\n    qc.ry(theta_b, 1)\n    qc.measure([0, 1], [0, 1])\n    return qc\n\n\ndef correlator(theta_a: float, theta_b: float, *, shots: int = 8192) -> float:\n    \"\"\"E = P(equal) - P(unequal) in {0, 1} encoding -> in [-1, +1].\"\"\"\n    qc = chsh_circuit(theta_a, theta_b)\n    counts = AerSimulator().run(qc, shots=shots).result().get_counts()\n    n = sum(counts.values())\n    equal = counts.get(\"00\", 0) + counts.get(\"11\", 0)\n    return (equal - (n - equal)) / n\n\n\n# Optimal CHSH angles: a in {0, pi/2}; b in {pi/4, -pi/4}.\na, a_p = 0.0, math.pi / 2\nb, b_p = math.pi / 4, -math.pi / 4\n\nE_ab   = correlator(a,   b)\nE_ab_p = correlator(a,   b_p)\nE_a_pb = correlator(a_p, b)\nE_a_pb_p = correlator(a_p, b_p)\n\nS = E_ab - E_ab_p + E_a_pb + E_a_pb_p\nprint(f\"E(a,b)   = {E_ab:+.3f}\")\nprint(f\"E(a,b')  = {E_ab_p:+.3f}\")\nprint(f\"E(a',b)  = {E_a_pb:+.3f}\")\nprint(f\"E(a',b') = {E_a_pb_p:+.3f}\")\nprint(f\"|S|      = {abs(S):.3f}    (classical bound: 2;  quantum max: {2*math.sqrt(2):.3f})\")\n\n# Decision rule:\n#   Need to demonstrate superposition         -> single H on |0>; sample many shots.\n#   Need to demonstrate entanglement          -> Bell state (H + CX); show no 01/10.\n#   Need to PROVE quantumness                  -> CHSH or any Bell inequality.\n#   Need exact probabilities                   -> Statevector(qc).probabilities_dict()\n#                                                  (no measurement).\n#   Need exact unitary                          -> qiskit.quantum_info.Operator(qc).\n#   Need expectation <psi|H|psi>                -> Estimator + SparsePauliOp(H).\n#   Need to estimate fidelity vs ideal         -> measure in many bases; do tomography\n#                                                  (qiskit-experiments has helpers).\n#   Need scalable verification                  -> randomized benchmarking, NOT statevector.\n\n# Anti-pattern:\n#   counts.get('01', 0) > 0  ->  \"the Bell state is broken\"\n# Some 01/10 counts are EXPECTED on noisy hardware - readout error,\n# decoherence, gate infidelity. Compare to the noiseless baseline AND\n# look at the magnitude (a few percent is normal; 25% means a wiring bug).\n"
                  }
        ],
        tips: [
                  "Single H on |0> = superposition; H + CX = Bell state; rotated measurements + correlator = Bell test (CHSH).",
                  "For exact noiseless probabilities, use `Statevector(qc).probabilities_dict()` — no shots needed.",
                  "CHSH classical bound is 2; quantum maximum is 2√2 ≈ 2.83. Hardware below ~2.4 is noisy.",
                  "A few percent on the \"forbidden\" outcomes (01, 10 for a Bell state) on real hardware is normal — readout + decoherence.",
                  "For larger demos, look at GHZ states (|00...0> + |11...1>) — same idea but n-qubit."
        ],
        mistake: "Treating any non-zero count on the \"wrong\" outcome as a bug. Real hardware gives ~1-5% on forbidden outcomes — readout and gate errors. Compare to a noiseless baseline.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: When to reach for which framework ─────────────────────────────────────────
  {
    id: "patterns",
    title: "When to reach for which framework",
    entries: [
      {
        id: "qiskit-vs-cirq-vs-pennylane",
        fn: "Qiskit vs Cirq vs PennyLane vs Stim — pick the framework",
        desc: "Qiskit (IBM) for general-purpose research and IBM hardware. Cirq (Google) for NISQ + Sycamore-style 2D devices. PennyLane (Xanadu) for hybrid quantum-classical / autodiff / variational ML. Stim for very large Clifford-only circuits (error-correction codes, surface codes).",
        category: "patterns",
        subtitle: "Qiskit (largest ecosystem, IBM Runtime, Estimator/Sampler primitives, OpenQASM3) vs Cirq (Google, GridQubit, Sycamore, Stim integration) vs PennyLane (autograd/PyTorch interop, qml.qnode decorator, lightning.qubit fast simulator) vs Stim (Clifford-only, scales to 1000s of qubits, error-correction)",
        signature: "# Qiskit: QuantumCircuit + Sampler/Estimator\\n# Cirq:   cirq.Circuit + Simulator\\n# PennyLane: @qml.qnode(dev) def circuit(): ...\\n# Stim:   stim.Circuit(\"H 0\\\\nCX 0 1\\\\nM 0 1\")",
        descLong: "Four frameworks, four strengths. **Qiskit**: best for 2026 IBM hardware, largest ecosystem (qiskit-experiments, qiskit-machine-learning, qiskit-nature). **Cirq**: tight integration with Google's grid topology, the cleanest API for circuits-as-data, and natural Stim interop. **PennyLane**: differentiable circuits via PyTorch/JAX/TF backends — the right choice for VQE / QAOA / quantum ML. **Stim**: Clifford simulator that scales to thousands of qubits — the only sane way to simulate surface codes. Three depths solve the SAME task — sample a Bell state — at depths: side-by-side Qiskit and Cirq → PennyLane with autograd over a parameterized angle → Stim for a thousand-qubit GHZ circuit (impossible in statevector frameworks).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Bell state in Qiskit and Cirq side-by-side.\n# APPROACH  - Same circuit, different APIs.\n# STRENGTHS - Lets you see the API style differences.\n# WEAKNESSES- Doesn't show what each is BEST at.\n\n# --- Qiskit ---\nfrom qiskit import QuantumCircuit\nfrom qiskit.primitives import StatevectorSampler\n\nqc = QuantumCircuit(2, 2)\nqc.h(0); qc.cx(0, 1); qc.measure([0, 1], [0, 1])\n\njob = StatevectorSampler().run([(qc,)], shots=1024)\ncounts = job.result()[0].data.meas.get_counts()\nprint(\"qiskit:\", counts)\n\n# --- Cirq ---\nimport cirq\n\nq = cirq.LineQubit.range(2)\nc = cirq.Circuit(cirq.H(q[0]), cirq.CNOT(q[0], q[1]), cirq.measure(*q, key=\"m\"))\nresult = cirq.Simulator().run(c, repetitions=1024)\nprint(\"cirq:  \", result.histogram(key=\"m\"))\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — Bell-style — but in PennyLane with an autograd-able\n#             rotation angle and a gradient over a cost function.\n# APPROACH  - @qml.qnode wraps the circuit; PennyLane returns gradients.\n# STRENGTHS - Quantum + classical optimizer in one PyTorch-style loop.\n# WEAKNESSES- For non-VQE work, the autograd overhead is wasted.\nimport pennylane as qml\nimport numpy as np\n\ndev = qml.device(\"default.qubit\", wires=2, shots=None)\n\n\n@qml.qnode(dev, interface=\"autograd\")\ndef circuit(theta):\n    qml.RY(theta, wires=0)                            # parameterized prep\n    qml.CNOT(wires=[0, 1])\n    return qml.expval(qml.PauliZ(0) @ qml.PauliZ(1))  # <Z_0 Z_1>\n\n\n# At theta=0 the expectation is 1 (perfectly correlated |00>).\n# At theta=pi it's also 1 (|11>). At theta=pi/2 it's 0 (mixed).\nprint(\"theta=0:    \", float(circuit(0.0)))\nprint(\"theta=pi/2: \", float(circuit(np.pi / 2)))\n\n# Optimize: maximize the correlator (cost = -<Z_0 Z_1>).\nopt = qml.GradientDescentOptimizer(stepsize=0.1)\ntheta = np.array(1.0, requires_grad=True)\nfor step in range(40):\n    theta = opt.step(lambda t: -circuit(t), theta)\nprint(f\"optimized theta = {float(theta):.4f}, cost = {float(-circuit(theta)):.4f}\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — large entangled state — in Stim, a Clifford-only\n#             simulator that scales to thousands of qubits. Build a\n#             1000-qubit GHZ state and sample it.\n# APPROACH  - Stim's text DSL describes the circuit; sample via TableauSimulator.\n# STRENGTHS - Polynomial-time Clifford simulation; statevector frameworks\n#             would need 2^1000 amplitudes (impossible).\n# WEAKNESSES- Clifford-only - no T gates, no rotations. For NISQ /\n#             variational, use Qiskit / Cirq / PennyLane.\nimport stim\nimport numpy as np\n\n\ndef ghz_circuit(n: int) -> stim.Circuit:\n    \"\"\"1000-qubit GHZ: |0...0> + |1...1>. Clifford only - Stim handles it.\"\"\"\n    c = stim.Circuit()\n    c.append(\"H\", [0])\n    for i in range(n - 1):\n        c.append(\"CX\", [i, i + 1])\n    c.append(\"M\", list(range(n)))                     # measure all\n    return c\n\n\nN = 1000\ncirc = ghz_circuit(N)\nprint(f\"Stim circuit ops: {len(circ)} instructions\")\n\nsampler = circ.compile_sampler()\nshots = 4\nsamples = sampler.sample(shots=shots)                 # (shots, N) int8 array\nfor i, s in enumerate(samples):\n    bits = \"\".join(str(int(b)) for b in s)\n    print(f\"shot {i}: {bits[:8]}...{bits[-8:]}  (all-equal: {len(set(bits)) == 1})\")\n\n# Decision rule:\n#   IBM hardware                                -> Qiskit + qiskit_ibm_runtime.\n#   Google hardware / Sycamore-shape research   -> Cirq.\n#   Variational / QML / hybrid optimization     -> PennyLane (autograd interop).\n#   Quantum chemistry                            -> qiskit-nature OR PennyLane (qml.qchem).\n#   Error correction / surface codes             -> Stim (Clifford-only but scales).\n#   Multi-platform abstraction                   -> PennyLane (device='qiskit.aer' etc.).\n#   Teaching / clean API                         -> Cirq.\n#   Largest ecosystem in 2026                    -> Qiskit.\n#   Need OpenQASM3 input/output                  -> Qiskit (best support today).\n\n# Anti-pattern:\n#   trying to simulate a 50-qubit non-Clifford circuit in any statevector framework\n# 2^50 complex amplitudes = 16 PB of memory. Either:\n#   (a) Reduce qubits to <30 for laptop, <40 for high-RAM server.\n#   (b) Restrict to Clifford gates and use Stim.\n#   (c) Use tensor-network simulators (e.g. cuTensorNet, quimb) for\n#       circuits with low entanglement.\n"
                  }
        ],
        tips: [
                  "Qiskit: largest ecosystem in 2026; the right pick for IBM hardware and OpenQASM3.",
                  "Cirq: clean API, GridQubit matches superconducting topology, native Stim interop.",
                  "PennyLane: differentiable circuits with PyTorch/JAX backends — best for variational ML.",
                  "Stim: Clifford-only simulator that scales to thousands of qubits — for surface codes / error correction.",
                  "Statevector simulators die past ~30-40 qubits. For more, switch to Stim (if Clifford-only) or tensor networks."
        ],
        mistake: "Trying to simulate a 50-qubit general circuit in a statevector framework. 2^50 complex amplitudes = 16 PB of memory. Either use Stim (Clifford-only) or tensor-network simulators.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
