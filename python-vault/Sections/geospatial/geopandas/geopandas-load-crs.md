---
type: "entry"
domain: "python"
file: "geospatial"
section: "geopandas"
id: "geopandas-load-crs"
title: "gpd.read_file / set_crs / to_crs — load + project"
category: "geopandas"
subtitle: "gpd.read_file (any OGR driver: .shp / .geojson / .gpkg / .parquet), gdf.crs property, set_crs (declare without transforming) vs to_crs (reproject coordinates), EPSG:4326 (WGS84 lat/lon) vs EPSG:3857 (web mercator) vs UTM zones (meters), geometry column convention"
signature_short: "gdf = gpd.read_file(path); gdf.crs; gdf = gdf.to_crs(epsg=3857); gdf.set_crs(epsg=4326, inplace=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "gpd.read_file / set_crs / to_crs — load + project"
  - "geopandas-load-crs"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/geopandas"
  - "category/geopandas"
  - "tier/tiered"
---

# gpd.read_file / set_crs / to_crs — load + project

> gpd.read_file (any OGR driver: .shp / .geojson / .gpkg / .parquet), gdf.crs property, set_crs (declare without transforming) vs to_crs (reproject coordinates), EPSG:4326 (WGS84 lat/lon) vs EPSG:3857 (web mercator) vs UTM zones (meters), geometry column convention

## Overview

A `GeoDataFrame` is a pandas DataFrame plus a geometry column and a CRS. Read with `gpd.read_file` (auto-detects format). The two CRS methods do different things: `set_crs` declares the CRS without transforming coordinates (use when the file lacks one), `to_crs` reprojects coordinates to a new CRS. Three depths solve the SAME task — load a shapefile, reproject to web mercator for plotting alongside web tiles — at depths: read + plot directly (CRS mismatch shows up as misalignment) → `to_crs(epsg=3857)` → defensive reading: detect missing CRS, set it, then reproject, with parquet caching.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load a shapefile and inspect the geodataframe.
- **Junior** — SAME — load + reproject to web mercator for plotting.
- **Senior** — SAME — load shapefile, reproject — production: detect missing CRS, declare it, reproject, cache as parquet for fast reload.

## Signature

```python
gdf = gpd.read_file(path); gdf.crs; gdf = gdf.to_crs(epsg=3857); gdf.set_crs(epsg=4326, inplace=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load a shapefile and inspect the geodataframe.
# APPROACH  - gpd.read_file; check .head() and .crs.
# STRENGTHS - One line; works on any OGR format.
# WEAKNESSES- Doesn't reproject; ignores CRS issues.
import geopandas as gpd

gdf = gpd.read_file("countries.shp")
print(gdf.head())
print(gdf.crs)                                        # e.g. EPSG:4326
print(gdf.geometry.iloc[0].geom_type)                # e.g. 'MultiPolygon'
print(gdf.shape)                                      # (rows, cols)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — load + reproject to web mercator for plotting.
# APPROACH  - read_file -> to_crs(epsg=3857).
# STRENGTHS - Coordinates now match XYZ web tiles; plot looks right.
# WEAKNESSES- Crashes if the source file has no CRS at all.
import geopandas as gpd
import matplotlib.pyplot as plt

gdf = gpd.read_file("countries.shp")
print("source CRS:", gdf.crs)

# Reproject to Web Mercator (EPSG:3857) for compatibility with tile maps.
gdf_web = gdf.to_crs(epsg=3857)
print("target CRS:", gdf_web.crs)

ax = gdf_web.plot(figsize=(10, 6), edgecolor="black", facecolor="none")
ax.set_axis_off()
plt.savefig("countries.png", dpi=120)

# Note: distances and areas in EPSG:3857 are NOT in meters - the
# projection distorts area at high latitudes. Use to_crs to a UTM zone
# or the local equal-area CRS for measurements.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — load shapefile, reproject — production: detect missing
#             CRS, declare it, reproject, cache as parquet for fast reload.
# APPROACH  - Defensive read; set_crs vs to_crs; gpd.read_parquet for speed.
# STRENGTHS - Survives malformed/legacy data; 5-50x faster reloads.
# WEAKNESSES- More plumbing; need to know the source CRS to set when missing.
from __future__ import annotations
import geopandas as gpd
from pathlib import Path


def load_geodata(
    src: Path,
    *,
    target_epsg: int = 3857,
    fallback_source_epsg: int | None = None,
    cache_dir: Path = Path(".cache/geo"),
) -> gpd.GeoDataFrame:
    """Read with parquet cache; declare missing CRS; reproject."""
    cache_dir.mkdir(parents=True, exist_ok=True)
    cache = cache_dir / f"{src.stem}_{target_epsg}.parquet"
    if cache.exists() and cache.stat().st_mtime >= src.stat().st_mtime:
        return gpd.read_parquet(cache)

    gdf = gpd.read_file(src)

    # If the source has no CRS, declare it (set_crs - no coord transform).
    if gdf.crs is None:
        if fallback_source_epsg is None:
            raise ValueError(
                f"{src} has no CRS metadata. Pass fallback_source_epsg= "
                "(commonly 4326 for lat/lon shapefiles)."
            )
        gdf = gdf.set_crs(epsg=fallback_source_epsg)

    # Reproject if target differs from source.
    if gdf.crs.to_epsg() != target_epsg:
        gdf = gdf.to_crs(epsg=target_epsg)

    # Drop empty / invalid geometries.
    gdf = gdf[~gdf.geometry.is_empty & gdf.geometry.is_valid].copy()

    gdf.to_parquet(cache, index=False)                # ~10x faster reads
    return gdf


gdf = load_geodata(Path("countries.shp"),
                   target_epsg=3857, fallback_source_epsg=4326)
print(gdf.crs, len(gdf))

# Decision rule:
#   File has correct CRS metadata             -> read_file + to_crs.
#   File has NO CRS / wrong CRS                -> set_crs (declare) then to_crs (reproject).
#   You want to MEASURE distance/area          -> reproject to a CRS in METERS
#                                                 (UTM zone, or local equal-area).
#   You want to PLOT alongside web tiles       -> EPSG:3857.
#   You want to STORE / SHARE a dataset        -> EPSG:4326 (most universal).
#   You want fast reloads of huge GeoDFs       -> gpd.to_parquet + gpd.read_parquet.
#   You want to read just a region (huge file) -> gpd.read_file(path, bbox=(x1,y1,x2,y2)).
#   Want a stable column name for geometry      -> gdf.rename_geometry('geom') if needed.

# Anti-pattern:
#   gdf.area                                  # gdf is in EPSG:4326 (degrees)
# Returns "areas" in degrees-squared - meaningless. Always reproject to a
# meter-based CRS before using .area / .length / .distance.
```

## Decision Rule

```text
File has correct CRS metadata             -> read_file + to_crs.
File has NO CRS / wrong CRS                -> set_crs (declare) then to_crs (reproject).
You want to MEASURE distance/area          -> reproject to a CRS in METERS
                                              (UTM zone, or local equal-area).
You want to PLOT alongside web tiles       -> EPSG:3857.
You want to STORE / SHARE a dataset        -> EPSG:4326 (most universal).
You want fast reloads of huge GeoDFs       -> gpd.to_parquet + gpd.read_parquet.
You want to read just a region (huge file) -> gpd.read_file(path, bbox=(x1,y1,x2,y2)).
Want a stable column name for geometry      -> gdf.rename_geometry('geom') if needed.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   gdf.area                                  # gdf is in EPSG:4326 (degrees)
> Returns "areas" in degrees-squared - meaningless. Always reproject to a
> meter-based CRS before using .area / .length / .distance.

## Tips

- `gpd.read_file` auto-detects the format from the extension (`.shp`, `.geojson`, `.gpkg`, `.parquet`).
- `set_crs` declares without transforming; `to_crs` actually reprojects coordinates.
- EPSG:4326 = WGS84 lat/lon (sharing); EPSG:3857 = web mercator (tile maps); UTM zones / equal-area = measurements.
- For huge files, pass `bbox=(x1,y1,x2,y2)` or `mask=geometry` to read only a region.
- Cache as GeoParquet (`gpd.to_parquet`) — 5-50× faster than re-reading shapefiles.

## Common Mistake

> [!warning] Calling `.area` or `.length` on a WGS84 (lat/lon) GeoDataFrame — values are in degrees², which are meaningless. Always reproject to a meter-based CRS first.

## See Also

- [[Sections/geospatial/geopandas/geopandas-spatial-joins|gpd.sjoin / gpd.overlay — combine geometries by location (Geospatial)]]
- [[Sections/geospatial/geopandas/geopandas-plot-explore|GeoDataFrame.plot / .explore — static and interactive maps (Geospatial)]]
- [[Sections/geospatial/geopandas/_Index|Geospatial → GeoPandas — vector data as a DataFrame]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
