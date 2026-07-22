---
type: "entry"
domain: "python"
file: "geospatial"
section: "geopandas"
id: "geopandas-spatial-joins"
title: "gpd.sjoin / gpd.overlay — combine geometries by location"
category: "geopandas"
subtitle: "gpd.sjoin (predicates: intersects, within, contains, touches, crosses), how= (left, right, inner), gpd.sjoin_nearest (KNN), gpd.overlay (intersection, union, difference, symmetric_difference), spatial index (auto-built sindex), CRS-must-match before join"
signature_short: "gpd.sjoin(left, right, how=\"inner\", predicate=\"intersects\"); gpd.overlay(a, b, how=\"intersection\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gpd.sjoin / gpd.overlay — combine geometries by location"
  - "geopandas-spatial-joins"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/geopandas"
  - "category/geopandas"
  - "tier/tiered"
---

# gpd.sjoin / gpd.overlay — combine geometries by location

> gpd.sjoin (predicates: intersects, within, contains, touches, crosses), how= (left, right, inner), gpd.sjoin_nearest (KNN), gpd.overlay (intersection, union, difference, symmetric_difference), spatial index (auto-built sindex), CRS-must-match before join

## Overview

`sjoin` joins rows from two GeoDataFrames where the geometries satisfy a predicate (`intersects`, `within`, `contains`, etc.). `sjoin_nearest` finds the nearest neighbor — handy for "which polygon is each point in/near". `overlay` returns geometries from set operations (the intersection of two polygon layers). Three depths solve the SAME task — count cell-tower points inside each county polygon — at depths: nested for-loop with `.contains` (slow) → `gpd.sjoin(predicate="within")` + groupby → projected, sjoin_nearest with distance, with CRS sanity check.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Count cell towers inside each county.
- **Junior** — SAME — towers per county — using gpd.sjoin (right way).
- **Senior** — SAME — towers per county — production: explicit CRS handling (project to a meter CRS for "nearest within X meters"), sjoin_nearest fallback for towers outside polygons.

## Signature

```python
gpd.sjoin(left, right, how="inner", predicate="intersects"); gpd.overlay(a, b, how="intersection")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Count cell towers inside each county.
# APPROACH  - Nested loop: for each county, count points within.
# STRENGTHS - Demonstrates the operation.
# WEAKNESSES- O(N*M); 1000 counties x 100k points = 100M checks. Glacial.
import geopandas as gpd

counties = gpd.read_file("counties.geojson")
towers   = gpd.read_file("cell_towers.geojson")

counts = []
for _, c in counties.iterrows():
    n = towers.geometry.within(c.geometry).sum()
    counts.append(n)
counties["tower_count"] = counts
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — towers per county — using gpd.sjoin (right way).
# APPROACH  - sjoin with predicate='within'; group by county id.
# STRENGTHS - Uses the spatial index automatically; fast.
# WEAKNESSES- Crashes if the two GeoDataFrames don't share a CRS.
import geopandas as gpd

counties = gpd.read_file("counties.geojson")
towers   = gpd.read_file("cell_towers.geojson")

# CRITICAL: both sides must share a CRS.
if towers.crs != counties.crs:
    towers = towers.to_crs(counties.crs)

joined = gpd.sjoin(towers, counties, how="inner", predicate="within")
counts = joined.groupby("county_id").size().rename("tower_count")

# Merge counts back onto the counties layer.
counties = counties.merge(counts, on="county_id", how="left").fillna({"tower_count": 0})
print(counties[["name", "tower_count"]].head())

# Predicates available:
#   intersects  - overlap or touch
#   within      - left geom is fully inside right
#   contains    - right geom is fully inside left
#   touches     - share a boundary but no interior
#   crosses     - 1D crosses 2D etc.
#   overlaps    - same dim, partial overlap
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — towers per county — production: explicit CRS handling
#             (project to a meter CRS for "nearest within X meters"),
#             sjoin_nearest fallback for towers outside polygons.
# APPROACH  - sjoin within polygons; for unmatched, sjoin_nearest with
#             distance threshold; report counts + median distance.
# STRENGTHS - Handles "border-of-polygon" towers; reports tower-to-county
#             distance; fast (one indexed pass each).
# WEAKNESSES- More logic; need to choose a meter-based CRS (UTM zone).
from __future__ import annotations
import geopandas as gpd


def assign_towers_to_counties(
    counties: gpd.GeoDataFrame,
    towers: gpd.GeoDataFrame,
    *,
    metric_epsg: int = 3857,                          # rough; swap for local UTM
    snap_distance_m: float = 250.0,
) -> gpd.GeoDataFrame:
    """Return towers with assigned county_id and snap distance."""
    # Make absolutely sure both sides are in the SAME meter CRS.
    counties_m = counties.to_crs(epsg=metric_epsg)
    towers_m   = towers.to_crs(epsg=metric_epsg)

    # 1) Strict within: every tower inside a county.
    inside = gpd.sjoin(
        towers_m, counties_m[["county_id", "geometry"]],
        how="left", predicate="within",
    )

    # 2) For towers NOT inside any county, snap to nearest within snap_distance.
    misses = inside[inside.county_id.isna()].drop(columns=["index_right", "county_id"])
    if not misses.empty:
        snapped = gpd.sjoin_nearest(
            misses, counties_m[["county_id", "geometry"]],
            max_distance=snap_distance_m,
            distance_col="snap_dist_m",
        )
        inside = inside[~inside.county_id.isna()].assign(snap_dist_m=0.0)
        inside = gpd.GeoDataFrame(
            (
                __import__("pandas").concat([inside, snapped], ignore_index=True)
            ),
            geometry="geometry", crs=towers_m.crs,
        )

    return inside


counties = gpd.read_file("counties.geojson")
towers   = gpd.read_file("cell_towers.geojson")
result = assign_towers_to_counties(counties, towers, snap_distance_m=500.0)

per_county = result.groupby("county_id").agg(
    n_towers=("county_id", "size"),
    median_snap_m=("snap_dist_m", "median"),
)
print(per_county.head())

# Decision rule:
#   "Which polygon contains each point?"          -> sjoin(predicate='within').
#   "Polygons that intersect this region"          -> sjoin(predicate='intersects').
#   "Closest feature to each point"                -> sjoin_nearest (max_distance optional).
#   Need set algebra (intersect 2 polygon layers)  -> gpd.overlay.
#   Need cells of a tessellation                   -> overlay(union) of two layers.
#   Many points, fewer polygons                    -> sjoin scales well (sindex on right side).
#   Need DISTANCE in meters                         -> reproject both to a meter CRS (UTM
#                                                       zone) before sjoin_nearest.
#   Performance falling off                         -> gdf.sindex; or save as parquet so
#                                                       reads are vectorized.

# Anti-pattern:
#   gpd.sjoin(left, right)                       # different CRS - silent garbage
# sjoin doesn't always raise on CRS mismatch in older versions; even when
# it warns, beginners ignore the warning. Result is "0 matches" because
# coordinates from different CRSs never overlap in the same numeric range.
```

## Decision Rule

```text
"Which polygon contains each point?"          -> sjoin(predicate='within').
"Polygons that intersect this region"          -> sjoin(predicate='intersects').
"Closest feature to each point"                -> sjoin_nearest (max_distance optional).
Need set algebra (intersect 2 polygon layers)  -> gpd.overlay.
Need cells of a tessellation                   -> overlay(union) of two layers.
Many points, fewer polygons                    -> sjoin scales well (sindex on right side).
Need DISTANCE in meters                         -> reproject both to a meter CRS (UTM
                                                    zone) before sjoin_nearest.
Performance falling off                         -> gdf.sindex; or save as parquet so
                                                    reads are vectorized.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   gpd.sjoin(left, right)                       # different CRS - silent garbage
> sjoin doesn't always raise on CRS mismatch in older versions; even when
> it warns, beginners ignore the warning. Result is "0 matches" because
> coordinates from different CRSs never overlap in the same numeric range.

## Tips

- Both sides of `sjoin` must share a CRS — reproject before joining.
- `sjoin` predicates: `intersects`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `covers`.
- `sjoin_nearest(max_distance=, distance_col=)` is the right tool for "snap each point to the closest polygon".
- `overlay` returns new geometries (set operations); `sjoin` keeps the left side's geometry and adds right-side columns.
- GeoPandas builds a spatial index (`gdf.sindex`) lazily; explicit access just confirms it exists.

## Common Mistake

> [!warning] Spatial-joining two GeoDataFrames in different CRSs. The numeric ranges don't overlap, so the join returns "0 matches" — looks like the data is wrong, but it's a CRS bug.

## See Also

- [[Sections/geospatial/geopandas/geopandas-load-crs|gpd.read_file / set_crs / to_crs — load + project (Geospatial)]]
- [[Sections/geospatial/geopandas/geopandas-plot-explore|GeoDataFrame.plot / .explore — static and interactive maps (Geospatial)]]
- [[Sections/geospatial/geopandas/_Index|Geospatial → GeoPandas — vector data as a DataFrame]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
