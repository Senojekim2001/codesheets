---
type: "entry"
domain: "python"
file: "geospatial"
section: "shapely"
id: "shapely-geometry-types"
title: "Point / LineString / Polygon / Multi* — geometry constructors"
category: "shapely"
subtitle: "shapely.geometry: Point / LineString / LinearRing / Polygon (exterior + holes) / MultiPoint / MultiLineString / MultiPolygon / GeometryCollection, properties (area, length, centroid, bounds, is_valid, is_simple), constructors take (x, y) tuples in CRS units, shapely 2.0 is immutable / vectorized"
signature_short: "Point(x, y); LineString([(x, y), ...]); Polygon([(x, y), ...], holes=[[...]]); geom.area; geom.bounds"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Point / LineString / Polygon / Multi* — geometry constructors"
  - "shapely-geometry-types"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/shapely"
  - "category/shapely"
  - "tier/tiered"
---

# Point / LineString / Polygon / Multi* — geometry constructors

> shapely.geometry: Point / LineString / LinearRing / Polygon (exterior + holes) / MultiPoint / MultiLineString / MultiPolygon / GeometryCollection, properties (area, length, centroid, bounds, is_valid, is_simple), constructors take (x, y) tuples in CRS units, shapely 2.0 is immutable / vectorized

## Overview

Shapely models OGC geometries: points, lines, polygons (with optional interior holes), and multi-versions of each. All are immutable in Shapely 2.0 — operations return new objects. Properties include `area` (in CRS units²), `length` (perimeter for polygons; chain length for lines), `centroid`, `bounds = (minx, miny, maxx, maxy)`, `envelope` (axis-aligned bbox). Three depths solve the SAME task — describe a polygon (area, perimeter, centroid) — at depths: bare Polygon constructor and properties → polygon with holes + validity check → robust constructor that fixes self-intersections via buffer(0) and validates explicitly.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Build a polygon and print area/perimeter/centroid.
- **Junior** — SAME — polygon properties — but with an interior hole and validity check.
- **Senior** — SAME — polygon properties — production: build polygons from a points stream, fix self-intersections via buffer(0), report validity issues explicitly.

## Signature

```python
Point(x, y); LineString([(x, y), ...]); Polygon([(x, y), ...], holes=[[...]]); geom.area; geom.bounds
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Build a polygon and print area/perimeter/centroid.
# APPROACH  - Polygon constructor with a list of (x, y) tuples.
# STRENGTHS - Three lines.
# WEAKNESSES- No validation; first/last point doesn't auto-close in some
#             contexts (Shapely closes for you, GeoJSON requires explicit).
from shapely.geometry import Polygon, Point

square = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])
print("area:",      square.area)                      # 100.0
print("perimeter:", square.length)                    # 40.0 (perimeter)
print("centroid:",  square.centroid)                  # POINT (5 5)
print("bounds:",    square.bounds)                    # (0, 0, 10, 10)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — polygon properties — but with an interior hole and
#             validity check.
# APPROACH  - Polygon with holes=[...]; .is_valid sanity check.
# STRENGTHS - Models a real-world polygon (donut); catches bad geometry.
# WEAKNESSES- Doesn't auto-fix invalid geometry.
from shapely.geometry import Polygon
from shapely.validation import explain_validity

# A 10x10 square with a 4x4 square hole in the middle.
exterior = [(0, 0), (10, 0), (10, 10), (0, 10)]
hole     = [(3, 3), (7, 3), (7, 7), (3, 7)]
poly = Polygon(exterior, holes=[hole])

print("area:",     poly.area)                        # 100 - 16 = 84
print("length:",   poly.length)                      # outer perimeter + hole perimeter
print("valid:",    poly.is_valid)                    # True
print("explain:",  explain_validity(poly))           # 'Valid Geometry'
print("centroid:", poly.centroid)                    # not always inside the polygon!

# Warning: the centroid CAN fall outside the polygon for L-shapes or
# polygons with holes. Use representative_point() if you need a point
# guaranteed to be inside.
print("rep_point:", poly.representative_point())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — polygon properties — production: build polygons from
#             a points stream, fix self-intersections via buffer(0), report
#             validity issues explicitly.
# APPROACH  - Validate; if invalid, try .make_valid (Shapely 2.0); compute
#             properties only on the valid geometry.
# STRENGTHS - Survives messy real-world polygons; explicit error reporting.
# WEAKNESSES- buffer(0) can split a polygon into a MultiPolygon - handle it.
from __future__ import annotations
from shapely.geometry import Polygon, MultiPolygon
from shapely import make_valid                         # shapely 2.0
from shapely.validation import explain_validity


def safe_polygon(coords: list[tuple[float, float]],
                 holes: list[list[tuple[float, float]]] | None = None
                 ) -> Polygon | MultiPolygon:
    """Build a polygon, repair if needed, return a valid geometry."""
    poly = Polygon(coords, holes=holes or [])
    if poly.is_valid:
        return poly
    print(f"invalid: {explain_validity(poly)} - repairing via make_valid")
    fixed = make_valid(poly)
    if fixed.is_empty:
        raise ValueError("polygon could not be repaired")
    return fixed


def describe(geom) -> dict:
    """Return area, perimeter, centroid, rep_point, bounds for any polygon."""
    if isinstance(geom, MultiPolygon):
        # Sum across parts; centroid is computed over the multi.
        return {
            "type":      geom.geom_type,
            "area":      sum(p.area for p in geom.geoms),
            "length":    sum(p.length for p in geom.geoms),
            "centroid":  geom.centroid,
            "rep_point": geom.representative_point(),
            "bounds":    geom.bounds,
            "n_parts":   len(geom.geoms),
        }
    return {
        "type":      geom.geom_type,
        "area":      geom.area,
        "length":    geom.length,
        "centroid":  geom.centroid,
        "rep_point": geom.representative_point(),
        "bounds":    geom.bounds,
    }


# Bowtie (self-intersecting) polygon - classic invalid case.
bowtie = [(0, 0), (10, 10), (10, 0), (0, 10)]
fixed = safe_polygon(bowtie)
print(describe(fixed))

# Decision rule:
#   Single object                            -> Point / LineString / Polygon.
#   Multiple disjoint of one kind            -> MultiPoint / MultiLineString / MultiPolygon.
#   Mixed kinds                              -> GeometryCollection.
#   Always-inside-the-shape point            -> .representative_point() (NOT .centroid).
#   Just need the bounding box                -> .bounds (tuple) or .envelope (Polygon).
#   Need to ensure validity                  -> .is_valid + make_valid (Shapely 2.0)
#                                              or buffer(0) (legacy fix).
#   Need to merge touching polygons           -> shapely.ops.unary_union(list_of_polys).
#   Need to split a polygon by a line         -> shapely.ops.split.

# Anti-pattern:
#   poly.centroid                            # for an L-shape
# Centroid of an L-shape is OUTSIDE the polygon. Use representative_point()
# when you need a point known to lie inside.
```

## Decision Rule

```text
Single object                            -> Point / LineString / Polygon.
Multiple disjoint of one kind            -> MultiPoint / MultiLineString / MultiPolygon.
Mixed kinds                              -> GeometryCollection.
Always-inside-the-shape point            -> .representative_point() (NOT .centroid).
Just need the bounding box                -> .bounds (tuple) or .envelope (Polygon).
Need to ensure validity                  -> .is_valid + make_valid (Shapely 2.0)
                                           or buffer(0) (legacy fix).
Need to merge touching polygons           -> shapely.ops.unary_union(list_of_polys).
Need to split a polygon by a line         -> shapely.ops.split.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   poly.centroid                            # for an L-shape
> Centroid of an L-shape is OUTSIDE the polygon. Use representative_point()
> when you need a point known to lie inside.

## Tips

- Shapely 2.0 geometries are immutable — every operation returns a new geometry.
- Polygon constructor: `Polygon(exterior_coords, holes=[hole_coords, ...])`.
- `.centroid` can fall outside non-convex shapes; use `.representative_point()` for "guaranteed inside".
- `.bounds` returns `(minx, miny, maxx, maxy)`; `.envelope` returns a Polygon of that bbox.
- Fix self-intersecting polygons with `make_valid(geom)` (Shapely 2.0) or the legacy `geom.buffer(0)`.

## Common Mistake

> [!warning] Treating `.centroid` as the "inside-the-shape representative point" — for L-shapes and polygons with holes, the centroid can fall outside the polygon. Use `.representative_point()`.

## See Also

- [[Sections/geospatial/shapely/shapely-spatial-predicates|intersects / within / contains / distance / buffer — geometry algebra (Geospatial)]]
- [[Sections/geospatial/shapely/_Index|Geospatial → Shapely — geometry algebra]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
