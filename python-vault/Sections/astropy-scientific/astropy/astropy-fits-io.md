---
type: "entry"
domain: "python"
file: "astropy-scientific"
section: "astropy"
id: "astropy-fits-io"
title: "astropy.io.fits — read and write FITS files"
category: "astropy"
subtitle: "fits.open as context manager, HDUList indexing (0-based; PrimaryHDU often empty for tables), .header (FITS keyword dict), .data (numpy ndarray for images, FITS_rec for tables), fits.getdata / fits.getheader (one-shot, no list management), BinTableHDU vs ImageHDU, WCS from header, lazy-loaded data via memmap"
signature_short: "with fits.open(path) as hdul: hdr = hdul[0].header; img = hdul[0].data; tbl = hdul[\"EVENTS\"].data"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "astropy.io.fits — read and write FITS files"
  - "astropy-fits-io"
tags:
  - "python"
  - "python/astropy-scientific"
  - "python/astropy-scientific/astropy"
  - "category/astropy"
  - "tier/tiered"
---

# astropy.io.fits — read and write FITS files

> fits.open as context manager, HDUList indexing (0-based; PrimaryHDU often empty for tables), .header (FITS keyword dict), .data (numpy ndarray for images, FITS_rec for tables), fits.getdata / fits.getheader (one-shot, no list management), BinTableHDU vs ImageHDU, WCS from header, lazy-loaded data via memmap

## Overview

`fits.open(path)` returns an `HDUList` — a list of HDU objects, each with `.header` and `.data`. The primary HDU is index 0; named extensions can be accessed by index or by `EXTNAME`. By default `.data` is memory-mapped — fast, but the array becomes invalid the moment the file closes. Always use `with` blocks. For one-shot reads, `fits.getdata` and `fits.getheader` skip the HDUList overhead. Three depths solve the SAME task — read a FITS image and its WCS — at depths: bare `fits.getdata` → context-managed `fits.open` with header inspection → `WCS` reconstruction with sky-pixel conversions and a memmap-safe `.copy()`.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read a FITS image; print shape and a header keyword.
- **Junior** — SAME — read FITS image — but inspect HDU layout and pull the WCS from the header.
- **Senior** — SAME — FITS image + WCS — production: helper that returns a dict with image, header dict, WCS, and BinTable contents from any extension; safe across context-manager close.

## Signature

```python
with fits.open(path) as hdul: hdr = hdul[0].header; img = hdul[0].data; tbl = hdul["EVENTS"].data
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read a FITS image; print shape and a header keyword.
# APPROACH  - fits.getdata + fits.getheader (one-shot helpers).
# STRENGTHS - Two lines.
# WEAKNESSES- No HDU inspection; no WCS; no memmap-safe copy if you keep
#             the array around for long.
from astropy.io import fits

data = fits.getdata("image.fits")                     # ndarray (H, W) or (H, W, ..)
header = fits.getheader("image.fits")
print("shape:", data.shape, "dtype:", data.dtype)
print("OBJECT:", header.get("OBJECT"))
print("EXPTIME:", header.get("EXPTIME"))
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — read FITS image — but inspect HDU layout and pull the
#             WCS from the header.
# APPROACH  - fits.open with a context manager; iterate HDUs.
# STRENGTHS - Reveals multi-extension files; WCS-aware.
# WEAKNESSES- Data is still memory-mapped; goes stale outside the with-block.
from astropy.io import fits
from astropy.wcs import WCS

with fits.open("image.fits") as hdul:
    print(hdul.info())                                # human-readable HDU table

    primary = hdul[0]
    sci = hdul["SCI"] if "SCI" in [h.name for h in hdul] else primary

    print(f"OBJECT={sci.header.get('OBJECT')}  shape={sci.data.shape}")

    # Sky <-> pixel via WCS.
    wcs = WCS(sci.header)
    sky = wcs.pixel_to_world(100.5, 100.5)            # SkyCoord at pixel (100.5, 100.5)
    print("sky at pixel (100.5, 100.5):", sky)

    # IMPORTANT: copy data BEFORE leaving the with-block if you want to
    # use it later - memmap is invalidated on close.
    img = sci.data.copy()

print("img shape (after close):", img.shape)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — FITS image + WCS — production: helper that returns a
#             dict with image, header dict, WCS, and BinTable contents
#             from any extension; safe across context-manager close.
# APPROACH  - One pass, copy data eagerly, return typed dict.
# STRENGTHS - Caller never has to know about memmap; WCS reconstructed
#             once; tables come back as numpy structured arrays.
# WEAKNESSES- Eager copy means peak RAM = file size briefly.
from __future__ import annotations
from astropy.io import fits
from astropy.wcs import WCS
from pathlib import Path
import numpy as np


def read_fits(path: Path, *, image_hdu: str | int = 0) -> dict:
    """Return image + WCS + header + tables, all detached from memmap."""
    out: dict = {"path": str(path), "tables": {}}
    with fits.open(path, memmap=True) as hdul:
        out["info"] = [
            {"index": i, "name": h.name, "kind": type(h).__name__,
             "shape": getattr(h.data, "shape", None) if h.data is not None else None}
            for i, h in enumerate(hdul)
        ]

        # Image extension - copy out of memmap immediately.
        sci = hdul[image_hdu]
        if sci.data is None:
            raise RuntimeError(f"HDU {image_hdu!r} has no data")
        out["image"]  = sci.data.copy()
        out["header"] = dict(sci.header)
        try:
            out["wcs"] = WCS(sci.header)
        except Exception:
            out["wcs"] = None

        # Pull all BinTableHDUs into structured arrays.
        for h in hdul:
            if isinstance(h, fits.BinTableHDU) and h.data is not None:
                out["tables"][h.name] = np.array(h.data, copy=True)
    return out


def write_fits(path: Path, image: np.ndarray, *,
               header: dict | None = None, overwrite: bool = False) -> None:
    hdu = fits.PrimaryHDU(data=image)
    if header:
        for k, v in header.items():
            hdu.header[k] = v
    fits.HDUList([hdu]).writeto(path, overwrite=overwrite)


# Use it
result = read_fits(Path("image.fits"))
img = result["image"]
wcs: WCS = result["wcs"]
print("image:", img.shape, img.dtype)
print("WCS naxis:", wcs.naxis if wcs else None)

# Sky -> pixel for a known coordinate.
if wcs is not None:
    import astropy.units as u
    from astropy.coordinates import SkyCoord
    target = SkyCoord(ra=10.6847 * u.deg, dec=41.269 * u.deg, frame="icrs")
    px, py = wcs.world_to_pixel(target)
    print(f"M31 falls at pixel ({px:.1f}, {py:.1f})")

write_fits(Path("out.fits"), img, header={"OBJECT": "demo"}, overwrite=True)

# Decision rule:
#   One-shot read of one HDU                  -> fits.getdata / fits.getheader.
#   Multi-extension or unknown layout          -> fits.open + hdul.info() + with-block.
#   Need WCS                                    -> astropy.wcs.WCS(header).
#   FITS table                                  -> BinTableHDU.data is a record array;
#                                                  np.array(...) copies it out of memmap.
#   Need to keep data after close              -> .data.copy() or memmap=False.
#   Streaming write                              -> fits.append (one HDU at a time).
#   Compressed FITS (.fits.fz)                   -> handled transparently by fits.open.
#   Header-only inspection                       -> fits.getheader (no data load).

# Anti-pattern:
#   data = fits.open("img.fits")[0].data       # no with-block; memmap dangling
# Outside a with-block the FITS file may close, and accessing .data later
# raises a confusing OSError. Always use 'with' and .copy() if you need
# the array to outlive the block.
```

## Decision Rule

```text
One-shot read of one HDU                  -> fits.getdata / fits.getheader.
Multi-extension or unknown layout          -> fits.open + hdul.info() + with-block.
Need WCS                                    -> astropy.wcs.WCS(header).
FITS table                                  -> BinTableHDU.data is a record array;
                                               np.array(...) copies it out of memmap.
Need to keep data after close              -> .data.copy() or memmap=False.
Streaming write                              -> fits.append (one HDU at a time).
Compressed FITS (.fits.fz)                   -> handled transparently by fits.open.
Header-only inspection                       -> fits.getheader (no data load).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   data = fits.open("img.fits")[0].data       # no with-block; memmap dangling
> Outside a with-block the FITS file may close, and accessing .data later
> raises a confusing OSError. Always use 'with' and .copy() if you need
> the array to outlive the block.

## Tips

- Always use `with fits.open(path) as hdul:` — `.data` is memory-mapped and goes stale on close.
- For one-shot reads, `fits.getdata(path, ext=N)` and `fits.getheader(path, ext=N)` skip the HDUList ceremony.
- Tables are `BinTableHDU.data` — a NumPy record array. `np.array(tbl, copy=True)` decouples it from the memmap.
- `astropy.wcs.WCS(header)` reconstructs world-pixel transforms; `wcs.pixel_to_world(x, y)` returns a `SkyCoord`.
- `fits.append(path, hdu)` streams one HDU at a time — useful for incremental writes during a long pipeline.

## Common Mistake

> [!warning] Reading FITS data without a `with` block (`data = fits.open(path)[0].data`). The file may close before you use the array, and the memmap raises a cryptic `OSError`. Use `with fits.open(...) as hdul:` and `.copy()` if you need the data to outlive the block.

## See Also

- [[Sections/astropy-scientific/astropy/astropy-units-quantity|astropy.units / Quantity — values that carry units (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/astropy-skycoord|astropy.coordinates.SkyCoord — celestial coordinates (Astropy & Scientific)]]
- [[Sections/astropy-scientific/astropy/_Index|Astropy & Scientific → Astropy — units, time, coords, FITS]]
- [[Sections/astropy-scientific/_Index|Astropy & Scientific index]]
- [[_Index|Vault index]]
