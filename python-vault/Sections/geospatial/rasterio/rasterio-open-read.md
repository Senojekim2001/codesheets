---
type: "entry"
domain: "python"
file: "geospatial"
section: "rasterio"
id: "rasterio-open-read"
title: "rasterio.open / .read / windows — read raster pixels"
category: "rasterio"
subtitle: "rasterio.open as context manager, src.read (all bands HxWxN or single band 2D), src.read_masks, windows (rasterio.windows.from_bounds, Window(col_off, row_off, width, height)), Cloud-Optimized GeoTIFF (COG) for remote streaming, src.transform / .crs / .nodata / .dtypes"
signature_short: "with rasterio.open(path) as src: arr = src.read(); arr = src.read(window=Window(col_off, row_off, w, h))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "rasterio.open / .read / windows — read raster pixels"
  - "rasterio-open-read"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/rasterio"
  - "category/rasterio"
  - "tier/tiered"
---

# rasterio.open / .read / windows — read raster pixels

> rasterio.open as context manager, src.read (all bands HxWxN or single band 2D), src.read_masks, windows (rasterio.windows.from_bounds, Window(col_off, row_off, width, height)), Cloud-Optimized GeoTIFF (COG) for remote streaming, src.transform / .crs / .nodata / .dtypes

## Overview

A raster is `(bands, rows, cols)`; `src.read()` returns the full array, `src.read(1)` returns a single band as `(rows, cols)`. Crucial properties: `src.transform` (affine pixel→world coords), `src.crs`, `src.bounds`, `src.shape`, `src.nodata`. For huge files, read by `Window` (col_off, row_off, width, height) — only loads that subset. Three depths solve the SAME task — read a Sentinel-2 RGB tile and compute mean reflectance — at depths: full read into RAM → window read of a bbox → COG-aware streaming + masked array (handle nodata) + reproject-on-read.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read all bands of a raster, print shape + dtype.
- **Junior** — SAME — read a tile — but only a region (window) and compute mean reflectance, ignoring nodata.
- **Senior** — SAME — read raster region + stats — production: COG-friendly remote read, reproject-on-the-fly with WarpedVRT, NDVI calc with band aliases.

## Signature

```python
with rasterio.open(path) as src: arr = src.read(); arr = src.read(window=Window(col_off, row_off, w, h))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read all bands of a raster, print shape + dtype.
# APPROACH  - rasterio.open + src.read.
# STRENGTHS - Three lines.
# WEAKNESSES- Reads the whole file into RAM; ignores nodata pixels;
#             Sentinel-2 tiles can be ~1 GB.
import rasterio

with rasterio.open("scene.tif") as src:
    arr = src.read()                                  # (bands, rows, cols)
    print(arr.shape, arr.dtype)                       # e.g. (3, 10980, 10980) uint16
    print("crs:", src.crs)
    print("transform:", src.transform)                # affine
    print("bounds:", src.bounds)                      # (left, bottom, right, top)
    print("nodata:", src.nodata)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — read a tile — but only a region (window) and compute
#             mean reflectance, ignoring nodata.
# APPROACH  - windows.from_bounds + masked=True.
# STRENGTHS - Doesn't blow RAM on huge rasters; respects nodata.
# WEAKNESSES- Still single-thread; no overview / pyramid use.
import rasterio
from rasterio.windows import from_bounds
import numpy as np

# Region of interest (in CRS units of the raster).
minx, miny, maxx, maxy = 500000, 4000000, 510000, 4010000

with rasterio.open("scene.tif") as src:
    win = from_bounds(minx, miny, maxx, maxy, transform=src.transform)
    print("window:", win)                             # Window(col_off=, row_off=, width=, height=)

    # masked=True returns a numpy MaskedArray that hides nodata pixels.
    arr = src.read(window=win, masked=True)           # (bands, rows, cols)
    print(arr.shape, arr.fill_value)

    # Mean per band, ignoring masked pixels.
    band_means = arr.mean(axis=(1, 2))
    print({i + 1: float(m) for i, m in enumerate(band_means)})
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — read raster region + stats — production: COG-friendly
#             remote read, reproject-on-the-fly with WarpedVRT, NDVI calc
#             with band aliases.
# APPROACH  - rasterio.Env for GDAL options (vsicurl); WarpedVRT for
#             reprojection without writing to disk; band-name lookup.
# STRENGTHS - Streams from S3/HTTP; reprojects without temp files;
#             readable per-band semantics.
# WEAKNESSES- COG path requires the source to actually be a COG.
from __future__ import annotations
import rasterio
from rasterio.windows import from_bounds
from rasterio.vrt import WarpedVRT
from rasterio.enums import Resampling
import numpy as np


# Sentinel-2 example: assume bands 1=B04 (red), 2=B08 (NIR).
def read_ndvi_window(
    src_uri: str,                                     # "s3://..." or "https://..." for COG
    *, bbox: tuple[float, float, float, float],
    target_epsg: int = 3857,
    target_res: float = 10.0,                         # meters/pixel
) -> dict:
    """Streamed read + on-the-fly reproject + NDVI."""
    # GDAL_HTTP_VERSION=2 + retries help on flaky CDNs; CACHE controls RAM cache.
    env = rasterio.Env(
        GDAL_HTTP_VERSION="2",
        GDAL_HTTP_MAX_RETRY=3,
        CPL_VSIL_CURL_CHUNK_SIZE=10 * 1024 * 1024,
    )
    with env, rasterio.open(src_uri) as src:
        with WarpedVRT(
            src,
            crs=f"EPSG:{target_epsg}",
            resampling=Resampling.bilinear,
            src_nodata=src.nodata,
            nodata=src.nodata,
            res=(target_res, target_res),
        ) as vrt:
            # Window in the VRT (target) CRS coordinates.
            win = from_bounds(*bbox, transform=vrt.transform)

            red = vrt.read(1, window=win, masked=True).astype("float32")
            nir = vrt.read(2, window=win, masked=True).astype("float32")

    ndvi = (nir - red) / (nir + red + 1e-9)
    return {
        "ndvi_mean":  float(ndvi.mean()),
        "ndvi_std":   float(ndvi.std()),
        "valid_frac": float(ndvi.count() / ndvi.size),
        "shape":      ndvi.shape,
    }


# Use it (replace with a real COG URL)
# stats = read_ndvi_window("s3://bucket/scene.tif",
#                         bbox=(-13_634_000, 4_530_000, -13_624_000, 4_540_000),
#                         target_epsg=3857)
# print(stats)

# Decision rule:
#   File on local disk, fits in RAM            -> rasterio.open + read().
#   Huge file or just a region                 -> Window-based read (above).
#   Need to reproject pixels                   -> WarpedVRT (no temp file) or rio.warp.reproject.
#   File is on S3 / HTTP and is a COG          -> rasterio.open(uri) directly; lazy read.
#   File is on S3 but NOT a COG                -> download first; non-COG random access is slow.
#   nodata matters                              -> read(..., masked=True) and use the mask.
#   Many bands, only need a few                 -> read([4, 8, 11]); skip the rest.
#   Need overviews / pyramids                   -> use src.overviews(1) and read(..., out_shape=).

# Anti-pattern:
#   src.read()                                  # whole 10980x10980 raster
# Reads ~2.5 GB for a single Sentinel-2 RGB tile and dies on 8GB laptops.
# Always use windows for anything bigger than ~1000x1000 pixels.
```

## Decision Rule

```text
File on local disk, fits in RAM            -> rasterio.open + read().
Huge file or just a region                 -> Window-based read (above).
Need to reproject pixels                   -> WarpedVRT (no temp file) or rio.warp.reproject.
File is on S3 / HTTP and is a COG          -> rasterio.open(uri) directly; lazy read.
File is on S3 but NOT a COG                -> download first; non-COG random access is slow.
nodata matters                              -> read(..., masked=True) and use the mask.
Many bands, only need a few                 -> read([4, 8, 11]); skip the rest.
Need overviews / pyramids                   -> use src.overviews(1) and read(..., out_shape=).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   src.read()                                  # whole 10980x10980 raster
> Reads ~2.5 GB for a single Sentinel-2 RGB tile and dies on 8GB laptops.
> Always use windows for anything bigger than ~1000x1000 pixels.

## Tips

- `src.read()` returns `(bands, rows, cols)`; `src.read(1)` returns a single band `(rows, cols)`.
- `Window(col_off, row_off, width, height)` is in pixel coords; `windows.from_bounds(...)` builds one from CRS coords.
- `masked=True` returns a `MaskedArray` that hides `nodata` pixels — almost always what you want.
- Cloud-Optimized GeoTIFFs (COGs) on S3/HTTP support partial reads — open the URL directly, no download.
- `WarpedVRT` reprojects on the fly without writing a new file — combine with `from_bounds` to read a target-CRS region.

## Common Mistake

> [!warning] Reading a Sentinel-2 tile with `src.read()` — you load 2 GB of pixels you don't need. Use a Window for any subset bigger than ~1000×1000.

## See Also

- [[Sections/geospatial/rasterio/rasterio-mask-reproject|rasterio.mask / .warp.reproject — clip and reproject (Geospatial)]]
- [[Sections/geospatial/rasterio/_Index|Geospatial → rasterio — raster I/O and windows]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
