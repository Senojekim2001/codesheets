---
type: "entry"
domain: "python"
file: "geospatial"
section: "rasterio"
id: "rasterio-mask-reproject"
title: "rasterio.mask / .warp.reproject — clip and reproject"
category: "rasterio"
subtitle: "rasterio.mask.mask (geometries iterable, crop=True to tighten bounds, all_touched= for partial pixels), rasterio.warp.reproject (Resampling enum: nearest for categorical, bilinear/cubic for continuous), meta = src.meta.copy() then override, calculate_default_transform helper"
signature_short: "masked, transform = mask.mask(src, geometries, crop=True); reproject(source=, destination=, src_transform=, dst_transform=, resampling=)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "rasterio.mask / .warp.reproject — clip and reproject"
  - "rasterio-mask-reproject"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/rasterio"
  - "category/rasterio"
  - "tier/tiered"
---

# rasterio.mask / .warp.reproject — clip and reproject

> rasterio.mask.mask (geometries iterable, crop=True to tighten bounds, all_touched= for partial pixels), rasterio.warp.reproject (Resampling enum: nearest for categorical, bilinear/cubic for continuous), meta = src.meta.copy() then override, calculate_default_transform helper

## Overview

`mask` clips to a polygon list; pass `crop=True` to also tighten the output bounds. `reproject` is GDAL's `gdalwarp` — use `Resampling.nearest` for categorical/integer rasters (land cover, classifications) and `bilinear`/`cubic` for continuous (DEM, reflectance). The standard write pattern: copy `src.meta`, override `height`, `width`, `transform`, `crs` as needed, then `with rasterio.open(dst, "w", **meta)`. Three depths solve the SAME task — clip a DEM to a watershed polygon and reproject to a local UTM zone — at depths: read → mask → write same CRS → mask + warp + write with proper meta → memory-pinned reproject + windowed mask for huge rasters.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Clip a DEM to a watershed polygon; save the clip.
- **Junior** — SAME — clip + reproject DEM to UTM zone — using warp.
- **Senior** — SAME — clip + reproject — production: pick resampling by dtype, write Cloud-Optimized GeoTIFF, preserve nodata.

## Signature

```python
masked, transform = mask.mask(src, geometries, crop=True); reproject(source=, destination=, src_transform=, dst_transform=, resampling=)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Clip a DEM to a watershed polygon; save the clip.
# APPROACH  - rasterio.mask.mask + write with copied metadata.
# STRENGTHS - Standard mask pattern.
# WEAKNESSES- Same CRS as input; no reprojection.
import rasterio
from rasterio.mask import mask
import geopandas as gpd

watershed = gpd.read_file("watershed.geojson")

with rasterio.open("dem.tif") as src:
    # geometries arg is an iterable of shapely-like dicts; feed in CRS-matched.
    geoms = watershed.to_crs(src.crs).geometry.tolist()
    out_arr, out_transform = mask(src, geoms, crop=True)
    out_meta = src.meta.copy()
    out_meta.update({
        "height":    out_arr.shape[1],
        "width":     out_arr.shape[2],
        "transform": out_transform,
    })

with rasterio.open("dem_clipped.tif", "w", **out_meta) as dst:
    dst.write(out_arr)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — clip + reproject DEM to UTM zone — using warp.
# APPROACH  - mask first, then reproject the clip.
# STRENGTHS - Output in meters (real distance/area math possible).
# WEAKNESSES- Two passes (mask then reproject); could be one with WarpedVRT.
import rasterio
from rasterio.mask import mask
from rasterio.warp import reproject, calculate_default_transform, Resampling
import geopandas as gpd
import numpy as np

watershed = gpd.read_file("watershed.geojson")
TARGET = "EPSG:32614"                                  # UTM zone 14N

with rasterio.open("dem.tif") as src:
    geoms = watershed.to_crs(src.crs).geometry.tolist()
    clipped, clipped_transform = mask(src, geoms, crop=True)
    src_meta = src.meta.copy()
    src_meta.update({
        "height": clipped.shape[1], "width": clipped.shape[2],
        "transform": clipped_transform,
    })

# Compute target transform + dimensions for the clip.
left, bottom, right, top = (
    clipped_transform.c,
    clipped_transform.f + clipped_transform.e * clipped.shape[1],
    clipped_transform.c + clipped_transform.a * clipped.shape[2],
    clipped_transform.f,
)
dst_transform, dst_w, dst_h = calculate_default_transform(
    src_meta["crs"], TARGET, clipped.shape[2], clipped.shape[1],
    left=left, bottom=bottom, right=right, top=top,
)

dst_arr = np.empty((src.count, dst_h, dst_w), dtype=src_meta["dtype"])

reproject(
    source=clipped,
    destination=dst_arr,
    src_transform=clipped_transform,
    src_crs=src_meta["crs"],
    dst_transform=dst_transform,
    dst_crs=TARGET,
    resampling=Resampling.bilinear,                   # continuous data
)

dst_meta = src_meta.copy()
dst_meta.update({"crs": TARGET, "transform": dst_transform,
                 "width": dst_w, "height": dst_h})

with rasterio.open("dem_clip_utm.tif", "w", **dst_meta) as dst:
    dst.write(dst_arr)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — clip + reproject — production: pick resampling by
#             dtype, write Cloud-Optimized GeoTIFF, preserve nodata.
# APPROACH  - One helper that wraps mask + reproject + COG output.
# STRENGTHS - Continuous and categorical data both correct; output is COG
#             (cloud-streamable); nodata preserved.
# WEAKNESSES- Requires rio-cogeo or GDAL with COG driver (common since GDAL 3.1).
from __future__ import annotations
import rasterio
from rasterio.mask import mask
from rasterio.warp import reproject, calculate_default_transform, Resampling
import geopandas as gpd
import numpy as np
from pathlib import Path


def _resampling_for(dtype: np.dtype) -> Resampling:
    """Categorical -> nearest; continuous -> bilinear."""
    return Resampling.nearest if np.issubdtype(dtype, np.integer) else Resampling.bilinear


def clip_and_reproject(
    src_path: Path, dst_path: Path,
    polygons: gpd.GeoDataFrame,
    *, target_crs: str = "EPSG:3857",
) -> None:
    with rasterio.open(src_path) as src:
        # 1) Clip
        polys = polygons.to_crs(src.crs).geometry.tolist()
        clipped, clipped_t = mask(src, polys, crop=True, nodata=src.nodata)
        src_crs    = src.crs
        src_dtype  = src.dtypes[0]
        src_count  = src.count
        src_nodata = src.nodata

    h, w = clipped.shape[1], clipped.shape[2]

    # 2) Compute target grid.
    left   = clipped_t.c
    top    = clipped_t.f
    right  = left + clipped_t.a * w
    bottom = top  + clipped_t.e * h

    dst_t, dst_w, dst_h = calculate_default_transform(
        src_crs, target_crs, w, h,
        left=left, bottom=bottom, right=right, top=top,
    )

    dst_arr = np.full((src_count, dst_h, dst_w),
                      src_nodata if src_nodata is not None else 0,
                      dtype=src_dtype)

    reproject(
        source=clipped, destination=dst_arr,
        src_transform=clipped_t, src_crs=src_crs,
        dst_transform=dst_t,     dst_crs=target_crs,
        src_nodata=src_nodata,   dst_nodata=src_nodata,
        resampling=_resampling_for(np.dtype(src_dtype)),
    )

    # 3) Write as COG (Cloud-Optimized GeoTIFF).
    profile = {
        "driver":    "COG",
        "dtype":     src_dtype,
        "count":     src_count,
        "crs":       target_crs,
        "transform": dst_t,
        "width":     dst_w,
        "height":    dst_h,
        "nodata":    src_nodata,
        "compress":  "deflate",
        "BIGTIFF":   "IF_SAFER",
    }
    with rasterio.open(dst_path, "w", **profile) as dst:
        dst.write(dst_arr)


watershed = gpd.read_file("watershed.geojson")
clip_and_reproject(Path("dem.tif"), Path("dem_clip.tif"), watershed)

# Decision rule:
#   Continuous data (DEM, reflectance, temp)    -> Resampling.bilinear or .cubic.
#   Categorical data (land cover, classes)      -> Resampling.nearest (NEVER bilinear).
#   Need exact area preservation                 -> Resampling.average (slower).
#   Single-step clip + reproject                 -> WarpedVRT inside one rasterio.open.
#   Pipeline output for re-use                   -> driver='COG' and overviews.
#   Many polygons, one raster                    -> rasterio.features.rasterize once
#                                                   then mask vs the rasterized version.
#   Loop over many small AOIs                    -> open the source ONCE; reuse the handle.

# Anti-pattern:
#   reproject(..., resampling=Resampling.bilinear)  # for a land-cover raster
# Bilinear interpolation between class IDs (1, 5, 9) creates pixels with
# value 3 or 7 - classes that don't exist. Always Resampling.nearest for
# categorical data.
```

## Decision Rule

```text
Continuous data (DEM, reflectance, temp)    -> Resampling.bilinear or .cubic.
Categorical data (land cover, classes)      -> Resampling.nearest (NEVER bilinear).
Need exact area preservation                 -> Resampling.average (slower).
Single-step clip + reproject                 -> WarpedVRT inside one rasterio.open.
Pipeline output for re-use                   -> driver='COG' and overviews.
Many polygons, one raster                    -> rasterio.features.rasterize once
                                                then mask vs the rasterized version.
Loop over many small AOIs                    -> open the source ONCE; reuse the handle.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   reproject(..., resampling=Resampling.bilinear)  # for a land-cover raster
> Bilinear interpolation between class IDs (1, 5, 9) creates pixels with
> value 3 or 7 - classes that don't exist. Always Resampling.nearest for
> categorical data.

## Tips

- Always copy `src.meta` and override only the changed keys (`height`, `width`, `transform`, `crs`) — keeps dtype, count, nodata consistent.
- `Resampling.nearest` for categorical data (classes/IDs); `bilinear`/`cubic` for continuous (DEM, reflectance).
- `mask(src, geoms, crop=True)` tightens output bounds to the polygon — without it you get the full raster with nodata outside.
- Modern GDAL (3.1+) has a `'COG'` driver that writes Cloud-Optimized GeoTIFFs directly — no rio-cogeo needed.
- For repeated AOI extractions on a large raster, open the source once and call `read(window=...)` per AOI — handle reuse is huge.

## Common Mistake

> [!warning] Bilinear-resampling a categorical (class-ID) raster — fractional class values appear that don't exist in the legend. Always use `Resampling.nearest` for categorical data.

## See Also

- [[Sections/geospatial/rasterio/rasterio-open-read|rasterio.open / .read / windows — read raster pixels (Geospatial)]]
- [[Sections/geospatial/rasterio/_Index|Geospatial → rasterio — raster I/O and windows]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
