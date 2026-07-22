---
type: "entry"
domain: "python"
file: "geospatial"
section: "geopandas"
id: "geopandas-plot-explore"
title: "GeoDataFrame.plot / .explore — static and interactive maps"
category: "geopandas"
subtitle: "gdf.plot (matplotlib, column=, categorical=, legend=, scheme= via mapclassify), gdf.explore (folium interactive, tiles=), contextily.add_basemap for tile background, common cmaps (viridis, plasma, RdYlBu_r), classification schemes (Quantiles, NaturalBreaks, EqualInterval)"
signature_short: "ax = gdf.plot(column=\"pop\", scheme=\"Quantiles\", cmap=\"viridis\", legend=True); gdf.explore(column=\"pop\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "GeoDataFrame.plot / .explore — static and interactive maps"
  - "geopandas-plot-explore"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/geopandas"
  - "category/geopandas"
  - "tier/tiered"
---

# GeoDataFrame.plot / .explore — static and interactive maps

> gdf.plot (matplotlib, column=, categorical=, legend=, scheme= via mapclassify), gdf.explore (folium interactive, tiles=), contextily.add_basemap for tile background, common cmaps (viridis, plasma, RdYlBu_r), classification schemes (Quantiles, NaturalBreaks, EqualInterval)

## Overview

`plot` produces a matplotlib Axes — chain `contextily.add_basemap(ax)` to overlay basemap tiles. For choropleths, pass `column=` and a `scheme=` (`"Quantiles"`, `"NaturalBreaks"`) from `mapclassify`. `explore` gives a Leaflet map in the notebook — pan/zoom/click. Three depths solve the SAME task — choropleth of population by county — at depths: gdf.plot with `column="pop"` (default linear color) → quantile classification + colorbar + basemap tiles → side-by-side static (for report) and interactive (for exploration) outputs.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Choropleth of population by county.
- **Junior** — SAME — choropleth — quantile classification + better colormap.
- **Senior** — SAME — choropleth — production: static (for report) + a webmap (for exploration); basemap tiles; missing-data style.

## Signature

```python
ax = gdf.plot(column="pop", scheme="Quantiles", cmap="viridis", legend=True); gdf.explore(column="pop")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Choropleth of population by county.
# APPROACH  - gdf.plot(column='pop').
# STRENGTHS - One line.
# WEAKNESSES- Linear color scaling; one outlier washes everything out.
import geopandas as gpd

gdf = gpd.read_file("counties.geojson")
ax = gdf.plot(column="pop", legend=True, figsize=(10, 6))
ax.set_axis_off()
ax.figure.savefig("pop.png", dpi=120)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — choropleth — quantile classification + better colormap.
# APPROACH  - scheme='Quantiles' (needs mapclassify); cmap='viridis'.
# STRENGTHS - Each color bin holds ~equal counties; one outlier doesn't
#             flatten the rest of the palette.
# WEAKNESSES- No basemap; isolated island of color.
import geopandas as gpd
import matplotlib.pyplot as plt

gdf = gpd.read_file("counties.geojson")

ax = gdf.plot(
    column="pop",
    scheme="Quantiles",                                # needs: pip install mapclassify
    k=7,                                               # 7 bins
    cmap="viridis",
    legend=True,
    legend_kwds={"loc": "lower right", "fontsize": 8},
    edgecolor="white",
    linewidth=0.3,
    figsize=(10, 6),
)
ax.set_axis_off()
plt.savefig("pop.png", dpi=120, bbox_inches="tight")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — choropleth — production: static (for report) + a
#             webmap (for exploration); basemap tiles; missing-data style.
# APPROACH  - contextily basemap; gdf.explore for interactive map.
# STRENGTHS - Two artifacts from one pipeline; missing values handled;
#             web mercator basemap aligned via to_crs(3857).
# WEAKNESSES- contextily fetches tiles - online dependency at build time.
from __future__ import annotations
import geopandas as gpd
import matplotlib.pyplot as plt
import contextily as cx
from pathlib import Path


def render_choropleth(
    src: Path, *,
    column: str = "pop",
    scheme: str = "NaturalBreaks",
    k: int = 7,
    cmap: str = "viridis",
    out_png: Path = Path("pop.png"),
    out_html: Path = Path("pop.html"),
) -> dict:
    gdf = gpd.read_file(src)

    # Reproject to web mercator for tile alignment.
    gdf_web = gdf.to_crs(epsg=3857)

    # --- Static (matplotlib) ---
    fig, ax = plt.subplots(figsize=(11, 7))

    # Style for missing values explicitly.
    gdf_web.plot(
        column=column,
        scheme=scheme,
        k=k,
        cmap=cmap,
        legend=True,
        legend_kwds={"loc": "lower right", "fontsize": 8},
        missing_kwds={"color": "lightgrey", "label": "no data", "hatch": "///"},
        edgecolor="white",
        linewidth=0.3,
        ax=ax,
    )
    cx.add_basemap(ax, source=cx.providers.CartoDB.PositronNoLabels, attribution_size=6)
    ax.set_axis_off()
    fig.savefig(out_png, dpi=150, bbox_inches="tight")
    plt.close(fig)

    # --- Interactive (folium via gdf.explore) ---
    m = gdf.to_crs(epsg=4326).explore(
        column=column,
        scheme=scheme, k=k,
        cmap=cmap,
        tiles="CartoDB positron",
        legend=True,
        tooltip=True,
        style_kwds={"color": "white", "weight": 0.4, "fillOpacity": 0.85},
    )
    m.save(out_html)

    return {"png": str(out_png), "html": str(out_html), "rows": len(gdf)}


info = render_choropleth(Path("counties.geojson"), column="pop")
print(info)

# Decision rule:
#   Static map for a PDF / report           -> gdf.plot + matplotlib + contextily.
#   Interactive map for a notebook          -> gdf.explore (returns folium Map).
#   Many features (>50k)                    -> use lonboard or pydeck (WebGL); folium chokes.
#   Need classification bins                -> scheme= 'Quantiles' / 'NaturalBreaks' /
#                                              'EqualInterval' (requires mapclassify).
#   Diverging data (gain/loss)              -> cmap='RdYlBu_r' or 'BrBG'.
#   Sequential data (counts/density)        -> cmap='viridis' / 'plasma' / 'YlOrRd'.
#   Need basemap tiles                      -> contextily for static, tiles= for explore.
#   Missing values                          -> missing_kwds= dict in plot().

# Anti-pattern:
#   gdf.plot(column='pop')                  # cmap='viridis' default linear
# A single outlier (NYC, 8M) flattens every other county to dark blue.
# Use scheme='Quantiles' or 'NaturalBreaks' for any real-world data
# distribution.
```

## Decision Rule

```text
Static map for a PDF / report           -> gdf.plot + matplotlib + contextily.
Interactive map for a notebook          -> gdf.explore (returns folium Map).
Many features (>50k)                    -> use lonboard or pydeck (WebGL); folium chokes.
Need classification bins                -> scheme= 'Quantiles' / 'NaturalBreaks' /
                                           'EqualInterval' (requires mapclassify).
Diverging data (gain/loss)              -> cmap='RdYlBu_r' or 'BrBG'.
Sequential data (counts/density)        -> cmap='viridis' / 'plasma' / 'YlOrRd'.
Need basemap tiles                      -> contextily for static, tiles= for explore.
Missing values                          -> missing_kwds= dict in plot().
```

## Anti-Pattern

> [!warning] Anti-pattern
>   gdf.plot(column='pop')                  # cmap='viridis' default linear
> A single outlier (NYC, 8M) flattens every other county to dark blue.
> Use scheme='Quantiles' or 'NaturalBreaks' for any real-world data
> distribution.

## Tips

- `gdf.plot()` returns a matplotlib `Axes` — chain `contextily.add_basemap(ax)` for tile backgrounds.
- `gdf.explore()` returns a `folium.Map` — `.save("foo.html")` to drop on a server or open in a browser.
- For real-world choropleths, always set `scheme=` (`Quantiles` or `NaturalBreaks`) — linear scaling hides everything.
- For >50k features, switch to `lonboard` or `pydeck` (WebGL) — folium is canvas-based and slow.
- `missing_kwds=` styles NaN polygons distinctly; never let "no data" share a color with low-data.

## Common Mistake

> [!warning] Linear-scaled choropleth on long-tailed data — one big city dominates the colormap and every other county looks identical. Use a quantile / natural-breaks scheme.

## See Also

- [[Sections/geospatial/geopandas/geopandas-load-crs|gpd.read_file / set_crs / to_crs — load + project (Geospatial)]]
- [[Sections/geospatial/geopandas/geopandas-spatial-joins|gpd.sjoin / gpd.overlay — combine geometries by location (Geospatial)]]
- [[Sections/geospatial/geopandas/_Index|Geospatial → GeoPandas — vector data as a DataFrame]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
