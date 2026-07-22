---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "astropy"
id: "astropy-skycoord"
title: "astropy.coordinates.SkyCoord — celestial coordinates"
category: "astropy"
subtitle: "SkyCoord (ra, dec, unit=, frame= \"icrs\"/\"fk5\"/\"galactic\"/\"altaz\"), .transform_to(frame_or_string), .separation (returns Quantity in degrees), .match_to_catalog_sky (KD-tree sky matching), Galactic l/b, AltAz needs obstime + EarthLocation, parsing \"10h21m00s +41d12m00s\" strings"
signature_short: "c = SkyCoord(ra=10.625*u.deg, dec=41.2*u.deg, frame=\"icrs\"); c.galactic.l, c.galactic.b; c.separation(other)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "astropy.coordinates.SkyCoord — celestial coordinates"
  - "astropy-skycoord"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/astropy"
  - "category/astropy"
  - "tier/tiered"
---

# astropy.coordinates.SkyCoord — celestial coordinates

> SkyCoord (ra, dec, unit=, frame= "icrs"/"fk5"/"galactic"/"altaz"), .transform_to(frame_or_string), .separation (returns Quantity in degrees), .match_to_catalog_sky (KD-tree sky matching), Galactic l/b, AltAz needs obstime + EarthLocation, parsing "10h21m00s +41d12m00s" strings

## Overview

A `SkyCoord` knows its frame (`icrs` is the modern default — equivalent to FK5 J2000.0 to <0.1″). For horizon coordinates (alt/az), you must supply an `obstime` and an `EarthLocation`. Catalog cross-matching uses an internal KD-tree — `match_to_catalog_sky` returns indices + separations in O(N log N). Three depths solve the SAME task — find which Hipparcos catalog star is closest to a given RA/Dec — at depths: linear-search `separation` over 100 candidates → `match_to_catalog_sky` against the full catalog → multi-frame transform with `obstime` + galactic-coordinate filter + Hipparcos-vs-Gaia-DR3 epoch correction.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find which of 5 candidate stars is closest to M31 (Andromeda).
- **Junior** — SAME — closest match — using match_to_catalog_sky on a larger pretend catalog.
- **Senior** — SAME — sky matching — production: ICRS + obstime, galactic filter (avoid the plane), Gaia-DR3-style proper motion epoch correction so old-catalog positions land on the new epoch.

## Signature

```python
c = SkyCoord(ra=10.625*u.deg, dec=41.2*u.deg, frame="icrs"); c.galactic.l, c.galactic.b; c.separation(other)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find which of 5 candidate stars is closest to M31 (Andromeda).
# APPROACH  - SkyCoord for M31, loop over candidates, .separation.
# STRENGTHS - Demonstrates ICRS + separation.
# WEAKNESSES- O(N) linear search; will be slow on real catalogs.
import astropy.units as u
from astropy.coordinates import SkyCoord

m31 = SkyCoord(ra=10.6847 * u.deg, dec=41.269 * u.deg, frame="icrs")

candidates = SkyCoord(
    ra=[10.0, 10.5, 10.7, 11.0, 12.0] * u.deg,
    dec=[41.0, 41.2, 41.3, 41.0, 40.0] * u.deg,
    frame="icrs",
)
seps = candidates.separation(m31)                     # Angle (Quantity in deg)
i = int(seps.argmin())
print(f"closest is index {i}, sep = {seps[i].to(u.arcmin):.2f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — closest match — using match_to_catalog_sky on a
#             larger pretend catalog.
# APPROACH  - SkyCoord arrays + KD-tree match.
# STRENGTHS - O(N log N) for matching; scales to millions.
# WEAKNESSES- Returns ONE match per query - for k-NN use search_around_sky.
import astropy.units as u
import numpy as np
from astropy.coordinates import SkyCoord

rng = np.random.default_rng(42)
n = 100_000
catalog = SkyCoord(
    ra=rng.uniform(0, 360, size=n) * u.deg,
    dec=rng.uniform(-90, 90, size=n) * u.deg,
    frame="icrs",
)

queries = SkyCoord(
    ra=[10.6847, 83.633, 187.706] * u.deg,            # M31, M1, M87
    dec=[41.269, 22.014, 12.391]   * u.deg,
    frame="icrs",
)

idx, sep2d, _ = queries.match_to_catalog_sky(catalog)
for q, i, s in zip(queries, idx, sep2d):
    print(f"query=({q.ra:.3f}, {q.dec:.3f})  match={i}  sep={s.to(u.arcmin):.2f}")

# For all matches within X arcsec, use search_around_sky:
# i_q, i_c, sep_2d, sep_3d = queries.search_around_sky(catalog, 30 * u.arcsec)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — sky matching — production: ICRS + obstime, galactic
#             filter (avoid the plane), Gaia-DR3-style proper motion epoch
#             correction so old-catalog positions land on the new epoch.
# APPROACH  - apply_space_motion(new_obstime); galactic latitude cut;
#             match in target epoch.
# STRENGTHS - Catches the "the star moved" bug that ruins old-catalog joins.
# WEAKNESSES- Needs proper motions (pmra, pmdec) and obstime to do PM
#             correction; falls back to no-correction when missing.
from __future__ import annotations
import astropy.units as u
import numpy as np
from astropy.coordinates import SkyCoord
from astropy.time import Time


def cross_match(
    queries: SkyCoord,
    catalog: SkyCoord,
    *,
    target_obstime: Time | None = None,
    galactic_latitude_cut_deg: float | None = 10.0,    # avoid Milky Way plane
    max_sep: u.Quantity = 5 * u.arcsec,
) -> tuple[np.ndarray, u.Quantity, np.ndarray]:
    """Return (catalog_idx, sep, mask) for queries in catalog.

    catalog_idx: shape (N,), -1 where no match within max_sep.
    sep:         Quantity, separation to the matched object.
    mask:        boolean, True where a valid match exists.
    """
    cat = catalog
    # 1) Epoch correction: if catalog has space motion + obstime, propagate.
    if target_obstime is not None and getattr(cat, "obstime", None) is not None:
        try:
            cat = cat.apply_space_motion(new_obstime=target_obstime)
        except (ValueError, AttributeError):
            pass                                        # missing PM/parallax - skip

    # 2) Galactic-plane filter (optional).
    if galactic_latitude_cut_deg is not None:
        keep = np.abs(cat.galactic.b.to(u.deg).value) > galactic_latitude_cut_deg
        cat = cat[keep]
        keep_indices = np.where(keep)[0]
    else:
        keep_indices = np.arange(len(cat))

    idx_local, sep, _ = queries.match_to_catalog_sky(cat)
    mask = sep <= max_sep
    catalog_idx = np.where(mask, keep_indices[idx_local], -1)
    return catalog_idx, sep, mask


# Demo
rng = np.random.default_rng(7)
n = 50_000
catalog = SkyCoord(
    ra=rng.uniform(0, 360, n) * u.deg,
    dec=rng.uniform(-30, 30, n) * u.deg,
    frame="icrs",
)
queries = SkyCoord(
    ra=[10.7, 83.6, 187.7] * u.deg,
    dec=[41.27, 22.0, 12.4] * u.deg,
    frame="icrs",
)
idx, sep, mask = cross_match(queries, catalog,
                             max_sep=5 * u.arcmin, galactic_latitude_cut_deg=10.0)
for q, i, s, ok in zip(queries, idx, sep, mask):
    print(f"q=({q.ra:.2f},{q.dec:.2f})  match={i}  sep={s.to(u.arcmin):.2f}  matched={ok}")

# Decision rule:
#   Single coordinate                            -> SkyCoord(ra, dec, unit=, frame=).
#   ICRS modern catalog (Gaia, etc.)             -> frame="icrs" (default).
#   Old FK4 / B1950 data                         -> frame="fk4", equinox="B1950".
#   Galactic l/b                                 -> .transform_to("galactic") or .galactic.
#   Horizon (alt/az)                             -> AltAz frame + obstime + EarthLocation.
#   Pairwise distance                            -> a.separation(b) -> Angle Quantity.
#   N x M matching                               -> match_to_catalog_sky (1-NN).
#   All within radius                            -> search_around_sky.
#   Old catalog vs modern epoch                  -> apply_space_motion(new_obstime=...) when
#                                                   PM and parallax are available.

# Anti-pattern:
#   SkyCoord(ra=10.685, dec=41.27)              # bare floats
# Astropy raises if unit= is missing - the units are too important to
# guess. Always pass unit=(u.deg, u.deg) (or u.hourangle for RA).
```

## Decision Rule

```text
Single coordinate                            -> SkyCoord(ra, dec, unit=, frame=).
ICRS modern catalog (Gaia, etc.)             -> frame="icrs" (default).
Old FK4 / B1950 data                         -> frame="fk4", equinox="B1950".
Galactic l/b                                 -> .transform_to("galactic") or .galactic.
Horizon (alt/az)                             -> AltAz frame + obstime + EarthLocation.
Pairwise distance                            -> a.separation(b) -> Angle Quantity.
N x M matching                               -> match_to_catalog_sky (1-NN).
All within radius                            -> search_around_sky.
Old catalog vs modern epoch                  -> apply_space_motion(new_obstime=...) when
                                                PM and parallax are available.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   SkyCoord(ra=10.685, dec=41.27)              # bare floats
> Astropy raises if unit= is missing - the units are too important to
> guess. Always pass unit=(u.deg, u.deg) (or u.hourangle for RA).

## Tips

- Always pass units to `SkyCoord` — bare floats raise; mixing degrees and hourangles is too easy without them.
- `.transform_to("galactic")` / `.galactic` gives Galactic `(l, b)`; `AltAz` needs `obstime` + `EarthLocation`.
- `match_to_catalog_sky` is 1-NN; for all neighbors within a radius, use `search_around_sky`.
- For epoch differences, call `apply_space_motion(new_obstime=...)` — Gaia DR3 catalog joined to legacy data is the canonical pitfall.
- `SkyCoord` arrays support standard NumPy slicing — `coords[mask]`, `coords[i:j]` work.

## Common Mistake

> [!warning] Constructing a `SkyCoord` without explicit units — astropy raises (correctly) because `(10.685, 41.27)` could be degrees, hours, or radians. Always pass `unit=(u.deg, u.deg)` or `u.hourangle`.

## See Also

- [[Sections/astropy-scientific/astropy/astropy-units-quantity|astropy.units / Quantity — values that carry units (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/astropy-fits-io|astropy.io.fits — read and write FITS files (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/_Index|Astropy & Scientific → Astropy — units, time, coords, FITS]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
