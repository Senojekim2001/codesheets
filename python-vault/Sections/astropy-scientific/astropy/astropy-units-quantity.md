---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "astropy"
id: "astropy-units-quantity"
title: "astropy.units / Quantity — values that carry units"
category: "astropy"
subtitle: "astropy.units (u.m, u.s, u.km/u.s, u.deg, u.arcsec, u.Jy), Quantity = number * unit, .to(target_unit), .to_value() to strip units, equivalencies (spectral, parallax, dimensionless_angles), Constants module (const.c, const.G, const.M_sun)"
signature_short: "q = 5 * u.km; q.to(u.m); q.value; (1 * u.eV).to(u.J, equivalencies=u.spectral())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "astropy.units / Quantity — values that carry units"
  - "astropy-units-quantity"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/astropy"
  - "category/astropy"
  - "tier/tiered"
---

# astropy.units / Quantity — values that carry units

> astropy.units (u.m, u.s, u.km/u.s, u.deg, u.arcsec, u.Jy), Quantity = number * unit, .to(target_unit), .to_value() to strip units, equivalencies (spectral, parallax, dimensionless_angles), Constants module (const.c, const.G, const.M_sun)

## Overview

Quantity wraps NumPy: arithmetic propagates units, `.to(target)` converts, `.to_value(target)` returns a plain number in those units. Some conversions need an "equivalency" — energy ↔ wavelength needs `u.spectral()`; angular size ↔ physical size needs `u.parallax()`. Constants like `const.c` and `const.G` are pre-typed Quantities. Three depths solve the SAME task — compute kinetic energy of a 70 kg human walking 1.4 m/s — at depths: bare numbers (no unit safety) → Quantity arithmetic → mixed-unit input (km/h) with `.to()` to canonical SI plus a sanity check via `dimensionless_angles`-style equivalency.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Compute kinetic energy of a 70 kg person walking 1.4 m/s.
- **Junior** — SAME — KE of a 70 kg person — using astropy units.
- **Senior** — SAME — KE — production: function that accepts ANY mass / speed unit, validates inputs, returns SI joules; physical constants from astropy.constants.

## Signature

```python
q = 5 * u.km; q.to(u.m); q.value; (1 * u.eV).to(u.J, equivalencies=u.spectral())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Compute kinetic energy of a 70 kg person walking 1.4 m/s.
# APPROACH  - Plain Python.
# STRENGTHS - Direct.
# WEAKNESSES- Nothing catches "I gave 1.4 km/h instead of 1.4 m/s".
m = 70.0                                              # kg
v = 1.4                                               # m/s
ke = 0.5 * m * v**2
print(ke, "J")                                        # 68.6 J -- correct only if you trusted the units
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — KE of a 70 kg person — using astropy units.
# APPROACH  - Multiply by units; let arithmetic propagate.
# STRENGTHS - Result CARRIES the unit; a unit-mismatch bug raises.
# WEAKNESSES- More verbose for trivial cases.
import astropy.units as u

m = 70 * u.kg
v = 1.4 * u.m / u.s

ke = 0.5 * m * v**2
print(ke)                                             # 68.6 J  (Quantity)
print(ke.to(u.J))                                     # explicit convert
print(ke.to_value(u.J))                               # plain float in joules

# Demonstrate the safety net:
try:
    bad = 0.5 * m * (5 * u.km / u.h)                  # mixing units? It works...
    print("ok:", bad.to(u.J))                         # ...because km/h is convertible.
    very_bad = m + (5 * u.kg / u.s)                   # incompatible units
except u.UnitConversionError as e:
    print("caught:", e)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — KE — production: function that accepts ANY mass / speed
#             unit, validates inputs, returns SI joules; physical constants
#             from astropy.constants.
# APPROACH  - Type-check via Quantity; .to(canonical) up front; const-driven.
# STRENGTHS - Reusable; rejects unitless inputs explicitly; SI-canonical.
# WEAKNESSES- Slight overhead vs raw floats; pays off in any pipeline
#             that mixes units across modules.
from __future__ import annotations
import astropy.units as u
from astropy import constants as const


def kinetic_energy(mass: u.Quantity, speed: u.Quantity) -> u.Quantity:
    """Return KE in SI joules for any mass/speed units. Raises on missing unit."""
    if not isinstance(mass, u.Quantity):
        raise TypeError("mass must be a Quantity (e.g. 70 * u.kg)")
    if not isinstance(speed, u.Quantity):
        raise TypeError("speed must be a Quantity (e.g. 1.4 * u.m / u.s)")

    m = mass.to(u.kg)
    v = speed.to(u.m / u.s)
    return (0.5 * m * v**2).to(u.J)


def relativistic_factor(speed: u.Quantity) -> float:
    """gamma = 1 / sqrt(1 - v^2/c^2). Returns dimensionless float."""
    v = speed.to(u.m / u.s)
    beta_sq = (v / const.c) ** 2                      # already dimensionless
    return float((1 / (1 - beta_sq).value ** 0.5))


# Use it - any unit input works.
print(kinetic_energy(70 * u.kg,  1.4 * u.m / u.s))     # 68.6 J
print(kinetic_energy(70 * u.kg,  5   * u.km / u.h))    # auto-converted
print(kinetic_energy(0.5 * const.M_sun.to(u.kg), 200 * u.km / u.s))

# Equivalencies for non-trivial conversions:
energy = (532 * u.nm).to(u.eV, equivalencies=u.spectral())
print(f"532 nm photon = {energy:.3f}")                 # 2.331 eV

# Decision rule:
#   Want compile-/runtime safety on units      -> Quantity everywhere; ban raw floats.
#   Performance-critical loops                  -> .to_value(canonical) early; raw NumPy inside.
#   Need physical constants                     -> astropy.constants (typed Quantities).
#   Need spectral / parallax conversions        -> equivalencies argument to .to().
#   Want to print with formatting                -> f"{q:.3f}" or q.to_string(format="latex").
#   Need to serialize across systems             -> store value + unit string;
#                                                   reconstruct with u.Unit(str).
#   Want pandas-aware unit DataFrames            -> astropy.table.Table or pint-pandas
#                                                   (NOT pandas + Quantity directly).

# Anti-pattern:
#   if mass > 50:                               # mass is a Quantity
#       ...
# Comparing a Quantity to a scalar uses the Quantity's value with its
# CURRENT unit - if mass got passed as grams, 50 means 50 grams. Always
# compare to a Quantity: if mass > 50 * u.kg.
```

## Decision Rule

```text
Want compile-/runtime safety on units      -> Quantity everywhere; ban raw floats.
Performance-critical loops                  -> .to_value(canonical) early; raw NumPy inside.
Need physical constants                     -> astropy.constants (typed Quantities).
Need spectral / parallax conversions        -> equivalencies argument to .to().
Want to print with formatting                -> f"{q:.3f}" or q.to_string(format="latex").
Need to serialize across systems             -> store value + unit string;
                                                reconstruct with u.Unit(str).
Want pandas-aware unit DataFrames            -> astropy.table.Table or pint-pandas
                                                (NOT pandas + Quantity directly).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   if mass > 50:                               # mass is a Quantity
>       ...
> Comparing a Quantity to a scalar uses the Quantity's value with its
> CURRENT unit - if mass got passed as grams, 50 means 50 grams. Always
> compare to a Quantity: if mass > 50 * u.kg.

## Tips

- `Quantity` arithmetic propagates units; `.to(target)` converts; `.to_value(target)` returns a bare number.
- Use `astropy.constants` (`const.c`, `const.G`, `const.M_sun`) for typed physical constants.
- For non-trivial conversions (wavelength↔energy, angular size↔distance), pass `equivalencies=u.spectral()` / `u.parallax()`.
- Compare quantities to other quantities — `if mass > 50 * u.kg`, not `if mass > 50`.
- For perf-critical inner loops, strip with `.to_value(canonical)` and operate on plain NumPy.

## Common Mistake

> [!warning] Comparing a Quantity to a bare scalar (`if mass > 50:`). The comparison uses the Quantity's current unit — if `mass` is in grams, 50 means 50 grams. Always wrap the threshold: `if mass > 50 * u.kg`.

## See Also

- [[Sections/astropy-scientific/astropy/astropy-skycoord|astropy.coordinates.SkyCoord — celestial coordinates (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/astropy-fits-io|astropy.io.fits — read and write FITS files (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/_Index|Astropy & Scientific → Astropy — units, time, coords, FITS]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
