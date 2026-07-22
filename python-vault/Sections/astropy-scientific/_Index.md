---
type: "file-index"
domain: "python"
file: "astropy-scientific"
title: "Astropy & Scientific"
tags:
  - "python"
  - "python/astropy-scientific"
  - "index"
---

# Astropy & Scientific

> 6 entries across 4 sections.

## Astropy — units, time, coords, FITS · 3

- [[Sections/astropy-scientific/astropy/astropy-units-quantity|astropy.units / Quantity — values that carry units]] — A `Quantity` is a NumPy array tagged with a unit (`5 * u.m`, `np.array([1,2,3]) * u.km/u.s`). Arithmetic propagates and converts units; `.to(target)` reprojects (`(3 * u.km).to(u.m)` → `3000 m`). Catches unit-mismatch bugs at *runtime* before they ruin a calculation.
- [[Sections/astropy-scientific/astropy/astropy-skycoord|astropy.coordinates.SkyCoord — celestial coordinates]] — `SkyCoord(ra, dec, frame=, unit=, obstime=)` is the celestial-coordinate workhorse. Transform between frames (`.transform_to("galactic")`), compute angular separations (`.separation(other)`), match catalogs (`.match_to_catalog_sky(other)`). Always pass units explicitly — bare floats are ambiguous between deg and hourangle.
- [[Sections/astropy-scientific/astropy/astropy-fits-io|astropy.io.fits — read and write FITS files]] — FITS is the astronomy standard for images, spectra, and tables. Open with `fits.open(path)`; access HDUs by index or name (`hdul[0]`, `hdul["SCI"]`); read header/data with `.header` / `.data`. **Always use a `with` block** — FITS uses memory-mapped data that goes stale when the file closes.

## NetworkX — graph algorithms · 1

- [[Sections/astropy-scientific/networkx/networkx-graphs-paths|nx.Graph / DiGraph / shortest_path / centrality]] — NetworkX is pure-Python graphs: `Graph()` (undirected), `DiGraph()` (directed), `MultiGraph()`. Add nodes/edges (`add_edge(u, v, weight=)`), then run algorithms (`shortest_path`, `pagerank`, `betweenness_centrality`, `connected_components`). Beautiful API; **slow on >100k nodes** — switch to igraph or graph-tool for scale.

## SymPy — exact symbolic math · 1

- [[Sections/astropy-scientific/sympy/sympy-symbolic-math|symbols / solve / diff / integrate / lambdify]] — SymPy is a CAS in pure Python: declare `symbols("x y")`, build expressions, simplify, differentiate, integrate, solve. Convert symbolic expressions into fast NumPy callables with `lambdify(args, expr, "numpy")`. The right tool for **exact** answers; for numeric work at scale, hand off to NumPy/JAX.

## When to reach for which scientific stack · 1

- [[Sections/astropy-scientific/patterns/scientific-stack-decision|astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool]] — astropy = astronomy domain (units, time, coords, FITS, WCS). scipy = numerical generalist (linalg, ODEs, optimization, statistics). sympy = exact symbolic. JAX = autodiff + GPU/TPU NumPy. igraph / graph-tool = graphs at scale. The Python role is glue across these — no single library does everything.
