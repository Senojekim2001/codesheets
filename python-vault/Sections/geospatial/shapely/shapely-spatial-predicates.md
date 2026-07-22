---
type: "entry"
domain: "python"
file: "geospatial"
section: "shapely"
id: "shapely-spatial-predicates"
title: "intersects / within / contains / distance / buffer — geometry algebra"
category: "shapely"
subtitle: "predicates (intersects, within, contains, touches, crosses, overlaps, disjoint, equals), operations (intersection, union, difference, symmetric_difference), buffer(distance, resolution=, cap_style=, join_style=), distance(other), DE-9IM relate string for nuanced relations"
signature_short: "a.intersects(b); a.within(b); a.intersection(b); a.distance(b); a.buffer(50)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "intersects / within / contains / distance / buffer — geometry algebra"
  - "shapely-spatial-predicates"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/shapely"
  - "category/shapely"
  - "tier/tiered"
---

# intersects / within / contains / distance / buffer — geometry algebra

> predicates (intersects, within, contains, touches, crosses, overlaps, disjoint, equals), operations (intersection, union, difference, symmetric_difference), buffer(distance, resolution=, cap_style=, join_style=), distance(other), DE-9IM relate string for nuanced relations

## Overview

Shapely predicates return booleans; operations return geometries. `buffer(d)` enlarges (positive d) or shrinks (negative d) by `d` units of the CRS — fundamental for "within X meters" queries (combine with a meter-based CRS first). Three depths solve the SAME task — find points within 1 km of a road — at depths: nested loop with `point.distance(road) < 1000` → `buffer(1000)` + single `intersects` per point → vectorized `shapely.intersects` across full arrays with sindex from the GeoDataFrame.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find points within 1 km of a road LineString.
- **Junior** — SAME — points within 1 km of road — buffer + intersects.
- **Senior** — SAME — points within 1 km of road — production: vectorized Shapely 2.0 ops via geopandas, with spatial index.

## Signature

```python
a.intersects(b); a.within(b); a.intersection(b); a.distance(b); a.buffer(50)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find points within 1 km of a road LineString.
# APPROACH  - Loop, distance() per point.
# STRENGTHS - Demonstrates predicates.
# WEAKNESSES- O(N) function calls in Python; slow for large N.
from shapely.geometry import Point, LineString

road = LineString([(0, 0), (1000, 0), (1000, 1000)])

points = [Point(50, 50), Point(2000, 0), Point(995, 500)]

near = [p for p in points if p.distance(road) <= 1000]
print(len(near), "near road")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — points within 1 km of road — buffer + intersects.
# APPROACH  - road.buffer(1000) -> Polygon; for each point, intersects.
# STRENGTHS - Single buffer; clear "within X meters" idiom.
# WEAKNESSES- Still per-point loop in Python.
from shapely.geometry import Point, LineString

road = LineString([(0, 0), (1000, 0), (1000, 1000)])

# Buffer the road by 1000 units (whatever CRS units are - meters if projected).
buffer = road.buffer(1000)                            # Polygon

points = [Point(50, 50), Point(2000, 0), Point(995, 500)]
near = [p for p in points if p.intersects(buffer)]    # contains/within also work
print(len(near))

# Buffer parameters worth knowing:
#   resolution=  (segments per quarter-circle on rounded caps; default 16)
#   cap_style=1  round (default); 2 flat; 3 square
#   join_style=1 round (default); 2 mitre; 3 bevel
# For "exactly the rectangle 1000m wide on either side", use cap_style=2.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — points within 1 km of road — production: vectorized
#             Shapely 2.0 ops via geopandas, with spatial index.
# APPROACH  - Build buffer; sjoin points against it (sindex applied
#             automatically); add distance column.
# STRENGTHS - Scales to millions of points (sindex); single vectorized op;
#             returns a GeoDataFrame with distance to use downstream.
# WEAKNESSES- Buffer is approximate (segmented circle); for exact distance,
#             keep distance() not buffer-then-intersects.
from __future__ import annotations
import geopandas as gpd
from shapely.geometry import Point, LineString
import numpy as np


def points_near_line(
    points: gpd.GeoDataFrame,
    line: gpd.GeoDataFrame | LineString,
    *,
    distance_m: float,
    metric_epsg: int = 3857,
) -> gpd.GeoDataFrame:
    """Return points within distance_m of the line, with distance column."""
    if isinstance(line, LineString):
        line = gpd.GeoDataFrame(geometry=[line], crs=points.crs)

    # Reproject both to a meter CRS so distance is in meters.
    pts = points.to_crs(epsg=metric_epsg)
    ln  = line.to_crs(epsg=metric_epsg)

    # Buffer the line; combine into one polygon for indexing.
    buffer_geom = ln.geometry.buffer(distance_m).unary_union
    buffer_gdf = gpd.GeoDataFrame(geometry=[buffer_geom], crs=ln.crs)

    # sjoin with predicate='intersects' uses the sindex automatically.
    in_buf = gpd.sjoin(pts, buffer_gdf, how="inner", predicate="intersects")

    # Add EXACT distance to the (un-buffered) line. Vectorized over the
    # geometry column - O(n) but in C.
    line_geom = ln.geometry.unary_union
    in_buf["dist_m"] = in_buf.geometry.distance(line_geom)
    return in_buf.drop(columns=["index_right"]).reset_index(drop=True)


# Demo
points = gpd.GeoDataFrame(
    {"id": list(range(5))},
    geometry=[Point(50, 50), Point(2000, 0), Point(995, 500),
              Point(-100, 50), Point(1500, 1500)],
    crs=3857,
)
road_gdf = gpd.GeoDataFrame(
    geometry=[LineString([(0, 0), (1000, 0), (1000, 1000)])], crs=3857,
)
near = points_near_line(points, road_gdf, distance_m=1000)
print(near[["id", "dist_m"]])

# Decision rule:
#   "Within X meters of geometry G"           -> G.buffer(X) + intersects
#                                                 (or sjoin with the buffer).
#   "Exact closest distance"                  -> a.distance(b).
#   "Touch but don't overlap"                 -> .touches.
#   "Properly inside (no shared boundary)"    -> .within (or .contains_properly).
#   "Disjoint"                                -> a.disjoint(b)
#                                                 (faster than not a.intersects(b)).
#   Snap a point to a line                    -> shapely.ops.nearest_points(line, point).
#   Set algebra (intersection/union/diff)     -> .intersection / .union / .difference.
#   Need clean cap style for buffer corridor  -> buffer(d, cap_style=2) for flat caps.

# Anti-pattern:
#   gdf_4326.buffer(0.001)                    # buffer in DEGREES!
# 0.001 degrees is ~111 m at the equator but only ~80 m at 45°N -
# inconsistent. For "within X meters", reproject to a meter CRS first.
```

## Decision Rule

```text
"Within X meters of geometry G"           -> G.buffer(X) + intersects
                                              (or sjoin with the buffer).
"Exact closest distance"                  -> a.distance(b).
"Touch but don't overlap"                 -> .touches.
"Properly inside (no shared boundary)"    -> .within (or .contains_properly).
"Disjoint"                                -> a.disjoint(b)
                                              (faster than not a.intersects(b)).
Snap a point to a line                    -> shapely.ops.nearest_points(line, point).
Set algebra (intersection/union/diff)     -> .intersection / .union / .difference.
Need clean cap style for buffer corridor  -> buffer(d, cap_style=2) for flat caps.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   gdf_4326.buffer(0.001)                    # buffer in DEGREES!
> 0.001 degrees is ~111 m at the equator but only ~80 m at 45°N -
> inconsistent. For "within X meters", reproject to a meter CRS first.

## Tips

- `buffer(d)` is in CRS units — reproject to a meter CRS before passing meters.
- Predicates: `intersects`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `disjoint`, `equals`.
- Operations: `intersection`, `union`, `difference`, `symmetric_difference` — all return new geometries.
- `shapely.ops.unary_union(list)` merges many geometries into one — much faster than chained unions.
- Use `buffer(d, cap_style=2, join_style=2)` for sharp/flat-edged buffers (rectangles, mitred corners).

## Common Mistake

> [!warning] Calling `geom.buffer(0.001)` on a WGS84 geometry expecting "1 mm". 0.001° ≈ 111 m at the equator, ~80 m at 45° N — inconsistent and meaningless. Reproject first.

## See Also

- [[Sections/geospatial/shapely/shapely-geometry-types|Point / LineString / Polygon / Multi* — geometry constructors (Geospatial)]]
- [[Sections/geospatial/shapely/_Index|Geospatial → Shapely — geometry algebra]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
