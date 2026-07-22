---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "patterns"
id: "scientific-stack-decision"
title: "astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool"
category: "patterns"
subtitle: "astropy (units + Quantity, SkyCoord, FITS, Time, WCS - astronomy-domain), scipy (linalg, integrate, optimize, signal, stats, sparse - generalist), sympy (exact symbolic CAS), JAX (autodiff + jit + vmap, GPU/TPU; lax_numpy interop), igraph (C-core, 10-100x NetworkX), graph-tool (C++ + OpenMP, fastest), specialized (sunpy for solar, pyteomics for mass-spec, biopython for sequences)"
signature_short: "# astronomy units/time/coords  -> astropy\\n# numerical methods            -> scipy\\n# exact algebra                -> sympy\\n# autodiff + GPU               -> JAX\\n# graphs at scale              -> igraph or graph-tool"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool"
  - "scientific-stack-decision"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool

> astropy (units + Quantity, SkyCoord, FITS, Time, WCS - astronomy-domain), scipy (linalg, integrate, optimize, signal, stats, sparse - generalist), sympy (exact symbolic CAS), JAX (autodiff + jit + vmap, GPU/TPU; lax_numpy interop), igraph (C-core, 10-100x NetworkX), graph-tool (C++ + OpenMP, fastest), specialized (sunpy for solar, pyteomics for mass-spec, biopython for sequences)

## Overview

Each library solves a different problem. astropy is the astronomy-domain Swiss army knife — units, time scales, sky coordinates, FITS, WCS. scipy is the workhorse for numeric methods (linalg, optimize, integrate, signal, stats). sympy gives exact symbolic answers. JAX is NumPy-on-XLA with autodiff and GPU/TPU — the modern replacement for autograd. For graphs, igraph (C core) is 10-100× faster than NetworkX; graph-tool (C++ + OpenMP) is the fastest. Three depths solve the SAME task — fit a 2D Gaussian to an image — at depths: scipy.optimize.curve_fit (CPU, finite-diff Jacobian) → JAX with jit + autodiff (fast on big images, GPU-able) → astropy.modeling LevMarLSQFitter for FITS + units integration.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Fit a 2D Gaussian to a small image with scipy.
- **Junior** — SAME — Gaussian fit — but using JAX (autodiff + jit).
- **Senior** — SAME — 2D Gaussian fit — production: astropy modeling for

## Signature

```python
# astronomy units/time/coords  -> astropy\n# numerical methods            -> scipy\n# exact algebra                -> sympy\n# autodiff + GPU               -> JAX\n# graphs at scale              -> igraph or graph-tool
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Fit a 2D Gaussian to a small image with scipy.
# APPROACH  - Define model + scipy.optimize.curve_fit.
# STRENGTHS - Single library; works for any model.
# WEAKNESSES- Finite-difference Jacobian; slow for big images;
#             no autodiff; no GPU.
import numpy as np
from scipy.optimize import curve_fit


def gauss2d(xy, amp, x0, y0, sx, sy, offset):
    x, y = xy
    return offset + amp * np.exp(-(((x - x0) / sx)**2 + ((y - y0) / sy)**2) / 2)


# Synthetic image with a Gaussian + noise.
rng = np.random.default_rng(0)
H = W = 64
y, x = np.mgrid[:H, :W]
true_params = (10.0, 31.5, 31.5, 5.0, 7.0, 1.0)
img = gauss2d((x, y), *true_params) + rng.normal(0, 0.5, (H, W))

xy = np.vstack([x.ravel(), y.ravel()])
popt, _ = curve_fit(gauss2d, xy, img.ravel(), p0=(8, 30, 30, 4, 4, 0))
print("fitted:", popt)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Gaussian fit — but using JAX (autodiff + jit).
# APPROACH  - jax.jit + jax.grad; minimize with optax or scipy on the
#             jit'd cost.
# STRENGTHS - Exact gradient; jit gives near-C speed; transparently moves
#             to GPU with jax.devices.
# WEAKNESSES- JAX overhead for tiny problems; learning curve for vmap/jit.
import jax
import jax.numpy as jnp
from jax import jit, grad
import numpy as np
from scipy.optimize import minimize


def gauss2d_jax(params, x, y):
    amp, x0, y0, sx, sy, offset = params
    return offset + amp * jnp.exp(-(((x - x0)/sx)**2 + ((y - y0)/sy)**2) / 2)


def cost(params, x, y, img):
    pred = gauss2d_jax(params, x, y)
    return jnp.mean((pred - img)**2)


# JIT-compile cost + its gradient.
cost_jit = jit(cost)
grad_jit = jit(grad(cost, argnums=0))

H = W = 64
y_arr, x_arr = jnp.mgrid[:H, :W].astype(jnp.float32)
true_params = jnp.array([10.0, 31.5, 31.5, 5.0, 7.0, 1.0])
rng = np.random.default_rng(0)
img = np.array(gauss2d_jax(true_params, x_arr, y_arr)) + rng.normal(0, 0.5, (H, W))
img_j = jnp.asarray(img)

p0 = np.array([8., 30., 30., 4., 4., 0.])
res = minimize(
    lambda p: float(cost_jit(jnp.asarray(p), x_arr, y_arr, img_j)),
    p0,
    jac=lambda p: np.asarray(grad_jit(jnp.asarray(p), x_arr, y_arr, img_j)),
    method="BFGS",
)
print("fitted:", res.x)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — 2D Gaussian fit — production: astropy modeling for
#             FITS-aware fits with units, plus a JAX vmap-batched solver
#             for fitting MANY sources in one go.
# APPROACH  - astropy.modeling for unit-aware single fits; JAX vmap for
#             batched fits across image stacks.
# STRENGTHS - Two patterns side by side; pick the right tool per use case.
# WEAKNESSES- Two libraries to know; JAX install (CPU/GPU) is heavier
#             than scipy.
import astropy.units as u
from astropy.modeling import models, fitting
import numpy as np

# --- Astropy path: unit-aware, FITS-friendly ---
y, x = np.mgrid[:64, :64]
true = models.Gaussian2D(amplitude=10, x_mean=31.5, y_mean=31.5,
                         x_stddev=5, y_stddev=7)
rng = np.random.default_rng(0)
img = true(x, y) + rng.normal(0, 0.5, (64, 64))

g_init = models.Gaussian2D(amplitude=8, x_mean=30, y_mean=30,
                           x_stddev=4, y_stddev=4)
fitter = fitting.LevMarLSQFitter()
g_fit  = fitter(g_init, x, y, img)
print("astropy fit:", g_fit)


# --- JAX path: batched fits across many small images ---
import jax
import jax.numpy as jnp
from jax import jit, vmap
import optax


def make_grid(H, W):
    yy, xx = jnp.mgrid[:H, :W].astype(jnp.float32)
    return xx, yy


def gauss2d(params, xx, yy):
    amp, x0, y0, sx, sy, off = params
    return off + amp * jnp.exp(-(((xx - x0)/sx)**2 + ((yy - y0)/sy)**2) / 2)


def loss(params, xx, yy, img):
    return jnp.mean((gauss2d(params, xx, yy) - img) ** 2)


# Single-image fit step (Adam).
loss_grad = jax.value_and_grad(loss)


@jit
def step(params, opt_state, xx, yy, img, opt):
    val, g = loss_grad(params, xx, yy, img)
    updates, opt_state = opt.update(g, opt_state, params)
    return optax.apply_updates(params, updates), opt_state, val


def fit_one(img, n_iters: int = 200):
    H, W = img.shape
    xx, yy = make_grid(H, W)
    params = jnp.array([img.max(), W / 2, H / 2, W / 8, H / 8, img.min()])
    opt = optax.adam(0.1)
    opt_state = opt.init(params)
    for _ in range(n_iters):
        params, opt_state, _ = step(params, opt_state, xx, yy, img, opt)
    return params


# Fit a STACK of N images in parallel via vmap.
fit_batch = jit(vmap(fit_one))


# stack: (N, H, W)
true_params = jnp.array([
    [10, 31.5, 31.5, 5, 7, 1],
    [ 8, 20.0, 40.0, 4, 4, 0],
    [12, 45.0, 15.0, 3, 6, 0],
])
xx, yy = make_grid(64, 64)
stack = jnp.stack([gauss2d(p, xx, yy) for p in true_params])
stack = stack + jax.random.normal(jax.random.PRNGKey(0), stack.shape) * 0.5

fits = fit_batch(stack)
print("jax batched fits:\n", np.array(fits))

# Decision rule:
#   Domain-specific astronomy ops               -> astropy (units / coords / FITS / time).
#   Generic numerical methods                    -> scipy (linalg / optimize / integrate / stats).
#   Exact symbolic                               -> sympy.
#   Autodiff + GPU                               -> JAX (jit / grad / vmap).
#   Train deep nets                              -> PyTorch.
#   Graph algorithms                             -> NetworkX (small) -> igraph -> graph-tool.
#   Spark-scale arrays                            -> Dask or Ray.
#   Out-of-core arrays                            -> Zarr / xarray + dask.
#   Solar physics                                -> sunpy (built on astropy).
#   Mass spec                                    -> pyteomics.
#   Time series tabular                          -> pandas / polars.

# Anti-pattern:
#   re-implementing scipy.optimize.minimize in pure Python "for clarity"
# scipy.optimize is decades of optimization research. Either USE it or
# move to JAX/jaxopt for autodiff. Don't roll your own gradient descent
# unless the topic IS gradient descent.
```

## Decision Rule

```text
Domain-specific astronomy ops               -> astropy (units / coords / FITS / time).
Generic numerical methods                    -> scipy (linalg / optimize / integrate / stats).
Exact symbolic                               -> sympy.
Autodiff + GPU                               -> JAX (jit / grad / vmap).
Train deep nets                              -> PyTorch.
Graph algorithms                             -> NetworkX (small) -> igraph -> graph-tool.
Spark-scale arrays                            -> Dask or Ray.
Out-of-core arrays                            -> Zarr / xarray + dask.
Solar physics                                -> sunpy (built on astropy).
Mass spec                                    -> pyteomics.
Time series tabular                          -> pandas / polars.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   re-implementing scipy.optimize.minimize in pure Python "for clarity"
> scipy.optimize is decades of optimization research. Either USE it or
> move to JAX/jaxopt for autodiff. Don't roll your own gradient descent
> unless the topic IS gradient descent.

## Tips

- **astropy** owns the astronomy domain: units, time scales, coordinate frames, FITS, WCS — the right tool the moment your data has a sky position.
- **scipy** is the numerical generalist: linalg, optimize, integrate, signal, sparse, stats. Reach for it before you reach for "I'll just write the algorithm myself".
- **SymPy** for exact symbolic answers; **JAX** for autodiff + GPU on numerical pipelines; **PyTorch** for deep nets.
- For graphs: NetworkX (productivity, small) → igraph (10-100× faster) → graph-tool (C++ + OpenMP, fastest).
- Domain-specific siblings: **sunpy** (solar, built on astropy), **pyteomics** (mass spec), **biopython** (sequences) — let them carry the domain knowledge.

## Common Mistake

> [!warning] Re-implementing `scipy.optimize.minimize` "for clarity". scipy carries decades of optimization research. Either use it or move to JAX/jaxopt for autodiff — don't roll your own gradient descent unless that's the topic.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/astropy-scientific/patterns/_Index|Astropy & Scientific → When to reach for which scientific stack]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
