---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "sympy"
id: "sympy-symbolic-math"
title: "symbols / solve / diff / integrate / lambdify"
category: "sympy"
subtitle: "sp.symbols (real=True, positive=True for tighter assumptions), sp.Eq (symbolic equality), sp.solve / nsolve / linsolve, sp.diff (partial derivatives via tuples), sp.integrate (definite via tuple bounds), sp.simplify / expand / factor / cancel, sp.lambdify (compile to numpy / jax / cython), sp.latex for typesetting"
signature_short: "x, y = sp.symbols(\"x y\", real=True); sol = sp.solve([eq1, eq2], [x, y]); f = sp.lambdify((x, y), expr, \"numpy\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "symbols / solve / diff / integrate / lambdify"
  - "sympy-symbolic-math"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/sympy"
  - "category/sympy"
  - "tier/tiered"
---

# symbols / solve / diff / integrate / lambdify

> sp.symbols (real=True, positive=True for tighter assumptions), sp.Eq (symbolic equality), sp.solve / nsolve / linsolve, sp.diff (partial derivatives via tuples), sp.integrate (definite via tuple bounds), sp.simplify / expand / factor / cancel, sp.lambdify (compile to numpy / jax / cython), sp.latex for typesetting

## Overview

SymPy treats symbols as algebraic variables — operations build expression trees rather than evaluating. `solve` handles polynomial systems analytically (use `nsolve` for numerical root-finding when there's no closed form). `diff(expr, x)` differentiates; `diff(expr, x, 2)` is the second derivative; `diff(expr, x, y)` is mixed partial. `integrate(expr, x)` is indefinite, `integrate(expr, (x, a, b))` is definite. `lambdify` compiles a SymPy expression to fast NumPy/JAX/cython — bridge to numerical pipelines. Three depths solve the SAME task — solve a quadratic, differentiate, evaluate at points — at depths: bare solve + diff (printed) → assumptions (real, positive) + simplify + lambdify → full optimization workflow with Newton's method on the symbolic gradient.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Solve x^2 - 5x + 6 = 0; differentiate the LHS; evaluate at x=4.
- **Junior** — SAME — solve, differentiate, evaluate — but use assumptions (real) and lambdify the derivative for fast NumPy evaluation.
- **Senior** — SAME — work with f(x) = x^2 - 5x + 6 — production: solve AND optimize via Newton's method on the symbolic gradient, with a SymPy-derived Jacobian and lambdified callables.

## Signature

```python
x, y = sp.symbols("x y", real=True); sol = sp.solve([eq1, eq2], [x, y]); f = sp.lambdify((x, y), expr, "numpy")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Solve x^2 - 5x + 6 = 0; differentiate the LHS; evaluate at x=4.
# APPROACH  - sp.symbols + sp.solve + sp.diff.
# STRENGTHS - Symbolic; exact roots.
# WEAKNESSES- No assumptions => may return complex roots in general.
import sympy as sp

x = sp.symbols("x")
expr = x**2 - 5*x + 6

roots = sp.solve(expr, x)
deriv = sp.diff(expr, x)
print("roots:", roots)                                # [2, 3]
print("derivative:", deriv)                           # 2*x - 5
print("derivative at 4:", deriv.subs(x, 4))           # 3
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — solve, differentiate, evaluate — but use assumptions
#             (real) and lambdify the derivative for fast NumPy evaluation.
# APPROACH  - symbols(real=True) + lambdify(numpy).
# STRENGTHS - Tighter assumption set; symbolic -> compiled NumPy callable.
# WEAKNESSES- Wider expressions can be slow to lambdify; cache the result.
import sympy as sp
import numpy as np

x = sp.symbols("x", real=True)
expr = x**2 - 5*x + 6

roots = sp.solve(expr, x)
deriv = sp.diff(expr, x)
print("roots:", roots)
print("derivative:", deriv)

# Compile the derivative to a NumPy-vectorized function.
f = sp.lambdify(x, deriv, "numpy")
xs = np.linspace(0, 10, 5)
print("derivative at xs:", f(xs))                     # vectorized: [-5, -2.5, 0, 2.5, 5]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — work with f(x) = x^2 - 5x + 6 — production: solve
#             AND optimize via Newton's method on the symbolic gradient,
#             with a SymPy-derived Jacobian and lambdified callables.
# APPROACH  - Symbolic gradient + Hessian via sp.diff; lambdify both;
#             scipy.optimize.newton or root_scalar for numeric solve.
# STRENGTHS - Exact derivatives (no finite-difference noise); fast eval
#             via NumPy backend.
# WEAKNESSES- For many-variable problems you still want JAX autodiff -
#             SymPy is for moderate symbolic expressions, not deep nets.
from __future__ import annotations
import sympy as sp
import numpy as np
from scipy.optimize import newton


# Symbolic problem: minimize f(x, y) = (x - 3)^2 + (y + 1)^2 + sin(x) cos(y)
x, y = sp.symbols("x y", real=True)
f = (x - 3)**2 + (y + 1)**2 + sp.sin(x) * sp.cos(y)

grad = sp.Matrix([sp.diff(f, x), sp.diff(f, y)])      # 2-vector
hess = sp.hessian(f, (x, y))                          # 2x2 matrix
print("grad:", grad.T)
print("hess:", hess)

# Compile to NumPy.
f_np    = sp.lambdify((x, y), f,    "numpy")
grad_np = sp.lambdify((x, y), grad, "numpy")
hess_np = sp.lambdify((x, y), hess, "numpy")


def newton_step(p: np.ndarray) -> np.ndarray:
    g = np.array(grad_np(*p), dtype=float).flatten()
    H = np.array(hess_np(*p), dtype=float)
    return p - np.linalg.solve(H, g)


p = np.array([0.0, 0.0])
for i in range(15):
    p_new = newton_step(p)
    if np.linalg.norm(p_new - p) < 1e-10:
        break
    p = p_new
print(f"converged at p = {p}, f(p) = {f_np(*p):.6f}")

# 1D case via scipy.optimize.newton on the lambdified derivative:
g1d = sp.diff((x - 3)**2 + sp.sin(x), x)
g1d_np = sp.lambdify(x, g1d, "numpy")
root = newton(g1d_np, x0=0.0, tol=1e-10)
print(f"1D minimizer ~ {root:.6f}")

# Decision rule:
#   Need EXACT roots / closed form              -> sp.solve.
#   Numeric root only                            -> sp.nsolve(eq, var, x0) or scipy.optimize.
#   Need exact derivatives                       -> sp.diff (single var) or sp.Matrix +
#                                                   sp.diff for Jacobians.
#   Need to USE the result in a hot loop         -> sp.lambdify(args, expr, "numpy").
#   Symbolic expression too big for lambdify     -> common cause of slowness; sp.simplify
#                                                   or sp.cse (common sub-expression elim) first.
#   Need autodiff with deep nets                  -> JAX (autograd) or PyTorch.
#   Need integrals you can also evaluate          -> sp.integrate + lambdify;
#                                                   for purely numeric, scipy.integrate.quad.
#   Need typeset output                            -> sp.latex(expr) for LaTeX strings.

# Anti-pattern:
#   for i in range(1_000_000):
#       y = expr.subs(x, i).evalf()                  # symbolic in a hot loop
# .subs + .evalf is slow (Python overhead per call). Always lambdify ONCE
# and call the compiled function on a NumPy array.
```

## Decision Rule

```text
Need EXACT roots / closed form              -> sp.solve.
Numeric root only                            -> sp.nsolve(eq, var, x0) or scipy.optimize.
Need exact derivatives                       -> sp.diff (single var) or sp.Matrix +
                                                sp.diff for Jacobians.
Need to USE the result in a hot loop         -> sp.lambdify(args, expr, "numpy").
Symbolic expression too big for lambdify     -> common cause of slowness; sp.simplify
                                                or sp.cse (common sub-expression elim) first.
Need autodiff with deep nets                  -> JAX (autograd) or PyTorch.
Need integrals you can also evaluate          -> sp.integrate + lambdify;
                                                for purely numeric, scipy.integrate.quad.
Need typeset output                            -> sp.latex(expr) for LaTeX strings.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for i in range(1_000_000):
>       y = expr.subs(x, i).evalf()                  # symbolic in a hot loop
> .subs + .evalf is slow (Python overhead per call). Always lambdify ONCE
> and call the compiled function on a NumPy array.

## Tips

- Declare assumptions on symbols (`real=True`, `positive=True`, `integer=True`) — solve and simplify give tighter results.
- Use `sp.simplify`, `sp.expand`, `sp.factor`, `sp.cancel`, `sp.together` to reshape expressions (and avoid each other when possible).
- `sp.lambdify((x, y), expr, "numpy")` compiles a symbolic expression into a vectorized NumPy callable — the bridge to fast numeric work.
- For exact rational arithmetic, use `sp.Rational(1, 3)`, not `1/3` (which is a Python float).
- For systems of equations, `sp.linsolve` (linear) is much faster than `sp.solve` and returns parametric solutions cleanly.

## Common Mistake

> [!warning] Calling `expr.subs(x, val).evalf()` inside a hot loop. Each call rebuilds the expression tree. **Lambdify once**, then call the compiled function on NumPy arrays.

## See Also

- [[Sections/astropy-scientific/sympy/_Index|Astropy & Scientific → SymPy — exact symbolic math]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
