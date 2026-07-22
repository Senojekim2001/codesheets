---
type: "entry"
domain: "python"
file: "geospatial"
section: "folium"
id: "folium-basic-markers"
title: "folium.Map / Marker / GeoJson — interactive maps in 5 lines"
category: "folium"
subtitle: "folium.Map (location=[lat, lon] in WGS84, tiles= \"OpenStreetMap\" / \"CartoDB positron\" / \"Stamen Terrain\"), Marker (popup, tooltip, icon=), GeoJson(data, style_function=, tooltip=), MarkerCluster for many markers, m.save / display in Jupyter, FeatureGroup + LayerControl"
signature_short: "m = folium.Map(location=[lat, lon], zoom_start=12); folium.Marker([lat, lon]).add_to(m); m.save(\"map.html\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "folium.Map / Marker / GeoJson — interactive maps in 5 lines"
  - "folium-basic-markers"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/folium"
  - "category/folium"
  - "tier/tiered"
---

# folium.Map / Marker / GeoJson — interactive maps in 5 lines

> folium.Map (location=[lat, lon] in WGS84, tiles= "OpenStreetMap" / "CartoDB positron" / "Stamen Terrain"), Marker (popup, tooltip, icon=), GeoJson(data, style_function=, tooltip=), MarkerCluster for many markers, m.save / display in Jupyter, FeatureGroup + LayerControl

## Overview

folium expects WGS84 lat/lon for locations (NOT projected). `Map` is the canvas; `Marker`/`GeoJson`/`Choropleth` are layers added with `.add_to(m)`. `MarkerCluster` is the right wrapper for >1000 points (clusters at low zoom). `LayerControl` adds the toggle button when you have multiple `FeatureGroup`s. Three depths solve the SAME task — show 5000 store locations with hover info — at depths: 5000 raw markers (slow) → MarkerCluster (smooth) → MarkerCluster + categorical FeatureGroups + tooltip with HTML + LayerControl.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Show 5000 store locations on a map.
- **Junior** — SAME — 5000 stores — using MarkerCluster (smooth at any zoom).
- **Senior** — SAME — store map — production: per-category FeatureGroups, rich HTML popups, LayerControl, Geocoded center, fit bounds.

## Signature

```python
m = folium.Map(location=[lat, lon], zoom_start=12); folium.Marker([lat, lon]).add_to(m); m.save("map.html")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Show 5000 store locations on a map.
# APPROACH  - Add 5000 Marker objects.
# STRENGTHS - Trivial.
# WEAKNESSES- Slow at low zoom (5000 markers all rendered); no clustering.
import folium

m = folium.Map(location=[39.5, -98.35], zoom_start=4)  # rough US center

# stores: list of dicts with lat, lon, name
stores = [
    {"lat": 40.7128, "lon": -74.0060, "name": "NYC"},
    {"lat": 34.0522, "lon": -118.2437, "name": "LA"},
    # ...
]
for s in stores:
    folium.Marker([s["lat"], s["lon"]], popup=s["name"]).add_to(m)

m.save("stores.html")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — 5000 stores — using MarkerCluster (smooth at any zoom).
# APPROACH  - folium.plugins.MarkerCluster; markers add to the cluster.
# STRENGTHS - Clusters at low zoom; expands as you zoom in.
# WEAKNESSES- All in one cluster; can't toggle by category.
import folium
from folium.plugins import MarkerCluster

m = folium.Map(location=[39.5, -98.35], zoom_start=4,
               tiles="CartoDB positron")              # cleaner basemap
cluster = MarkerCluster().add_to(m)

stores = [{"lat": 40.7128, "lon": -74.0060, "name": "NYC", "kind": "flagship"},
          {"lat": 34.0522, "lon": -118.2437, "name": "LA", "kind": "outlet"}]

for s in stores:
    folium.Marker(
        [s["lat"], s["lon"]],
        popup=folium.Popup(s["name"], max_width=200),
        tooltip=s["name"],                             # hover label
        icon=folium.Icon(color="blue" if s["kind"] == "flagship" else "gray"),
    ).add_to(cluster)

m.save("stores.html")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — store map — production: per-category FeatureGroups,
#             rich HTML popups, LayerControl, Geocoded center, fit bounds.
# APPROACH  - One MarkerCluster per category in its own FeatureGroup;
#             LayerControl toggles them; m.fit_bounds to the data.
# STRENGTHS - Toggleable layers; readable popups; auto-zoomed to data.
# WEAKNESSES- More setup; HTML in popups is easy to break (escape user data).
from __future__ import annotations
import folium
from folium.plugins import MarkerCluster
import html


COLOR_BY_KIND = {"flagship": "red", "outlet": "blue", "kiosk": "green"}


def render_store_map(stores: list[dict], out_path: str = "stores.html") -> None:
    if not stores:
        raise ValueError("no stores")

    # Auto-center on data; LayerControl below switches per kind.
    lats = [s["lat"] for s in stores]; lons = [s["lon"] for s in stores]
    m = folium.Map(
        location=[sum(lats) / len(lats), sum(lons) / len(lons)],
        tiles="CartoDB positron", control_scale=True,
    )

    groups: dict[str, folium.FeatureGroup] = {}
    for s in stores:
        kind = s.get("kind", "other")
        if kind not in groups:
            groups[kind] = folium.FeatureGroup(name=kind.capitalize())
            groups[kind].add_to(m)

        # Each kind gets its own MarkerCluster inside its FeatureGroup so
        # toggling the layer hides/shows that whole cluster.
        cluster = groups.get(f"_cluster_{kind}")
        if cluster is None:
            cluster = MarkerCluster().add_to(groups[kind])
            groups[f"_cluster_{kind}"] = cluster

        # Escape user-controlled fields - never trust raw input in HTML.
        name = html.escape(s["name"])
        addr = html.escape(s.get("address", ""))
        phone = html.escape(s.get("phone", ""))

        popup_html = f"""
        <div style="font-family:sans-serif;min-width:200px">
            <div style="font-weight:bold;font-size:14px">{name}</div>
            <div style="color:#666">{addr}</div>
            <div style="margin-top:6px">📞 {phone}</div>
        </div>
        """

        folium.Marker(
            [s["lat"], s["lon"]],
            popup=folium.Popup(popup_html, max_width=260),
            tooltip=name,
            icon=folium.Icon(color=COLOR_BY_KIND.get(kind, "gray"),
                             icon="info-sign"),
        ).add_to(cluster)

    folium.LayerControl(collapsed=False).add_to(m)
    # Auto-fit bounds to data extent.
    m.fit_bounds([[min(lats), min(lons)], [max(lats), max(lons)]])
    m.save(out_path)


# Demo
stores = [
    {"lat": 40.7128, "lon": -74.0060, "name": "NYC Flagship",
     "kind": "flagship", "address": "5th Ave", "phone": "+1 212 555 1212"},
    {"lat": 34.0522, "lon": -118.2437, "name": "LA Outlet",
     "kind": "outlet", "address": "Sunset Blvd", "phone": "+1 213 555 9988"},
]
render_store_map(stores)

# Decision rule:
#   < 500 markers                              -> bare folium.Marker is fine.
#   500 - 50k markers                           -> MarkerCluster.
#   > 50k markers                               -> Leaflet.heat (folium.plugins.HeatMap)
#                                                  or pydeck/lonboard for WebGL.
#   Polygons / GeoJSON                          -> folium.GeoJson(data, style_function=, tooltip=)
#                                                  or folium.Choropleth.
#   Need user toggleable layers                  -> FeatureGroup + LayerControl.
#   Need a basemap that's actually professional  -> tiles="CartoDB positron" / "CartoDB dark_matter".
#   Need offline tiles                           -> tiles=None + custom WMS / static tile server.
#   Producing artifacts repeatedly               -> save HTML; embed in iframe / Jupyter.

# Anti-pattern:
#   folium.Map(location=projected_xy)         # passes projected coords
# folium expects WGS84 lat/lon - if you pass UTM or web-mercator
# coordinates the marker lands in the Indian Ocean or thereabouts.
# Always to_crs(epsg=4326) before handing geometry to folium.
```

## Decision Rule

```text
< 500 markers                              -> bare folium.Marker is fine.
500 - 50k markers                           -> MarkerCluster.
> 50k markers                               -> Leaflet.heat (folium.plugins.HeatMap)
                                               or pydeck/lonboard for WebGL.
Polygons / GeoJSON                          -> folium.GeoJson(data, style_function=, tooltip=)
                                               or folium.Choropleth.
Need user toggleable layers                  -> FeatureGroup + LayerControl.
Need a basemap that's actually professional  -> tiles="CartoDB positron" / "CartoDB dark_matter".
Need offline tiles                           -> tiles=None + custom WMS / static tile server.
Producing artifacts repeatedly               -> save HTML; embed in iframe / Jupyter.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   folium.Map(location=projected_xy)         # passes projected coords
> folium expects WGS84 lat/lon - if you pass UTM or web-mercator
> coordinates the marker lands in the Indian Ocean or thereabouts.
> Always to_crs(epsg=4326) before handing geometry to folium.

## Tips

- folium expects WGS84 lat/lon (`location=[lat, lon]`) — reproject any projected GeoDataFrame first.
- `MarkerCluster` (`folium.plugins.MarkerCluster`) is essential beyond ~500 markers.
- `tiles="CartoDB positron"` is a clean professional basemap; `"CartoDB dark_matter"` for dark mode.
- For categorical layers, wrap each in a `FeatureGroup` and add a `LayerControl(collapsed=False)`.
- Always `html.escape` user-controlled text before stuffing into popup HTML — XSS in static maps is a real bug.

## Common Mistake

> [!warning] Passing projected coords (UTM, EPSG:3857) to `folium.Map(location=...)`. folium expects WGS84 lat/lon — projected coordinates land the marker in the wrong hemisphere. Always reproject to 4326.

## See Also

- [[Sections/geospatial/folium/_Index|Geospatial → folium — Leaflet maps in notebooks]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
