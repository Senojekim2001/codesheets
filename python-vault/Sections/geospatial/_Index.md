---
type: "file-index"
domain: "python"
file: "geospatial"
title: "Geospatial"
tags:
  - "python"
  - "python/geospatial"
  - "index"
---

# Geospatial

> 9 entries across 5 sections.

## GeoPandas — vector data as a DataFrame · 3

- [[Sections/geospatial/geopandas/geopandas-load-crs|gpd.read_file / set_crs / to_crs — load + project]] — GeoPandas reads any OGR-supported format (shapefile, GeoJSON, GeoPackage, FlatGeobuf, etc.). The `geometry` column holds Shapely objects; the `.crs` property holds the spatial reference. **Always check the CRS** — measurements in WGS84 lat/lon degrees are nonsense; reproject to UTM (or any equal-area / equal-distance CRS) first.
- [[Sections/geospatial/geopandas/geopandas-spatial-joins|gpd.sjoin / gpd.overlay — combine geometries by location]] — Spatial joins are pandas joins keyed on geometry, not values. `sjoin` does point-in-polygon / overlap-based joins; `overlay` does set operations (intersection, union, difference). Both require both sides to share a CRS.
- [[Sections/geospatial/geopandas/geopandas-plot-explore|GeoDataFrame.plot / .explore — static and interactive maps]] — `gdf.plot()` is matplotlib-backed (static, ready for reports). `gdf.explore()` returns a folium map (interactive, notebook-ready). Both use the same parameters: `column=` for choropleths, `categorical=`, `legend=`, `cmap=`.

## Shapely — geometry algebra · 2

- [[Sections/geospatial/shapely/shapely-geometry-types|Point / LineString / Polygon / Multi* — geometry constructors]] — Shapely 2.0 geometries are immutable NumPy-backed objects: `Point(x, y)`, `LineString([(x, y), ...])`, `Polygon([(x, y), ...])`, plus their `Multi*` counterparts and `GeometryCollection`. Use `.area`, `.length`, `.centroid`, `.bounds`, `.envelope` for derived quantities.
- [[Sections/geospatial/shapely/shapely-spatial-predicates|intersects / within / contains / distance / buffer — geometry algebra]] — Predicates: `a.intersects(b)`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `disjoint`. Operations: `a.intersection(b)`, `union`, `difference`, `symmetric_difference`. Use `buffer(d)` to grow geometries (the standard "within X meters" trick).

## rasterio — raster I/O and windows · 2

- [[Sections/geospatial/rasterio/rasterio-open-read|rasterio.open / .read / windows — read raster pixels]] — rasterio reads any GDAL-supported raster (GeoTIFF, JP2, ECW, COG). Open with `rasterio.open(path)`; read bands with `.read()` or specific bands with `.read([1, 2, 3])`. Read just a region via `windows` — essential for rasters too big for RAM.
- [[Sections/geospatial/rasterio/rasterio-mask-reproject|rasterio.mask / .warp.reproject — clip and reproject]] — `rasterio.mask.mask` clips a raster to a polygon (everything outside becomes nodata). `rasterio.warp.reproject` resamples to a new CRS or grid. Both write to a destination dataset using the same `meta` dict pattern: copy from source, override what changes.

## folium — Leaflet maps in notebooks · 1

- [[Sections/geospatial/folium/folium-basic-markers|folium.Map / Marker / GeoJson — interactive maps in 5 lines]] — folium is a thin Python wrapper over Leaflet.js. Create a `Map(location=[lat, lon], zoom_start=)`, add `Marker`s, `GeoJson`, `Choropleth`, save with `m.save("map.html")`. The notebook displays it inline.

## When to reach for which geo tool · 1

- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack]] — GeoPandas for a desktop-friendly DataFrame workflow. PostGIS when the data is too big for one machine and queries can be expressed in SQL. DuckDB-spatial for fast local joins on parquet/geoparquet. xarray + rioxarray for n-dimensional rasters (time × bands × y × x).
