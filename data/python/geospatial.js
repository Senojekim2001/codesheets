export const meta = {
  "id": "geospatial",
  "label": "Geospatial",
  "icon": "🗺️",
  "description": "Vector + raster geospatial in Python: GeoPandas (vector data as a DataFrame), Shapely (geometry algebra), rasterio (raster I/O + windows), folium (Leaflet maps in notebooks). The thing you keep getting wrong is CRS — coordinates are meaningless without one. Web mercator (EPSG:3857) for tiles, WGS84 (EPSG:4326) for lat/lon, projected CRS (UTM zones / state plane) for measurements."
}

export const sections = [

  // ── Section 1: GeoPandas — vector data as a DataFrame ─────────────────────────────────────────
  {
    id: "geopandas",
    title: "GeoPandas — vector data as a DataFrame",
    entries: [
      {
        id: "geopandas-load-crs",
        fn: "gpd.read_file / set_crs / to_crs — load + project",
        desc: "GeoPandas reads any OGR-supported format (shapefile, GeoJSON, GeoPackage, FlatGeobuf, etc.). The `geometry` column holds Shapely objects; the `.crs` property holds the spatial reference. **Always check the CRS** — measurements in WGS84 lat/lon degrees are nonsense; reproject to UTM (or any equal-area / equal-distance CRS) first.",
        category: "geopandas",
        subtitle: "gpd.read_file (any OGR driver: .shp / .geojson / .gpkg / .parquet), gdf.crs property, set_crs (declare without transforming) vs to_crs (reproject coordinates), EPSG:4326 (WGS84 lat/lon) vs EPSG:3857 (web mercator) vs UTM zones (meters), geometry column convention",
        signature: "gdf = gpd.read_file(path); gdf.crs; gdf = gdf.to_crs(epsg=3857); gdf.set_crs(epsg=4326, inplace=True)",
        descLong: "A `GeoDataFrame` is a pandas DataFrame plus a geometry column and a CRS. Read with `gpd.read_file` (auto-detects format). The two CRS methods do different things: `set_crs` declares the CRS without transforming coordinates (use when the file lacks one), `to_crs` reprojects coordinates to a new CRS. Three depths solve the SAME task — load a shapefile, reproject to web mercator for plotting alongside web tiles — at depths: read + plot directly (CRS mismatch shows up as misalignment) → `to_crs(epsg=3857)` → defensive reading: detect missing CRS, set it, then reproject, with parquet caching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Load a shapefile and inspect the geodataframe.\n# APPROACH  - gpd.read_file; check .head() and .crs.\n# STRENGTHS - One line; works on any OGR format.\n# WEAKNESSES- Doesn't reproject; ignores CRS issues.\nimport geopandas as gpd\n\ngdf = gpd.read_file(\"countries.shp\")\nprint(gdf.head())\nprint(gdf.crs)                                        # e.g. EPSG:4326\nprint(gdf.geometry.iloc[0].geom_type)                # e.g. 'MultiPolygon'\nprint(gdf.shape)                                      # (rows, cols)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — load + reproject to web mercator for plotting.\n# APPROACH  - read_file -> to_crs(epsg=3857).\n# STRENGTHS - Coordinates now match XYZ web tiles; plot looks right.\n# WEAKNESSES- Crashes if the source file has no CRS at all.\nimport geopandas as gpd\nimport matplotlib.pyplot as plt\n\ngdf = gpd.read_file(\"countries.shp\")\nprint(\"source CRS:\", gdf.crs)\n\n# Reproject to Web Mercator (EPSG:3857) for compatibility with tile maps.\ngdf_web = gdf.to_crs(epsg=3857)\nprint(\"target CRS:\", gdf_web.crs)\n\nax = gdf_web.plot(figsize=(10, 6), edgecolor=\"black\", facecolor=\"none\")\nax.set_axis_off()\nplt.savefig(\"countries.png\", dpi=120)\n\n# Note: distances and areas in EPSG:3857 are NOT in meters - the\n# projection distorts area at high latitudes. Use to_crs to a UTM zone\n# or the local equal-area CRS for measurements.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — load shapefile, reproject — production: detect missing\n#             CRS, declare it, reproject, cache as parquet for fast reload.\n# APPROACH  - Defensive read; set_crs vs to_crs; gpd.read_parquet for speed.\n# STRENGTHS - Survives malformed/legacy data; 5-50x faster reloads.\n# WEAKNESSES- More plumbing; need to know the source CRS to set when missing.\nfrom __future__ import annotations\nimport geopandas as gpd\nfrom pathlib import Path\n\n\ndef load_geodata(\n    src: Path,\n    *,\n    target_epsg: int = 3857,\n    fallback_source_epsg: int | None = None,\n    cache_dir: Path = Path(\".cache/geo\"),\n) -> gpd.GeoDataFrame:\n    \"\"\"Read with parquet cache; declare missing CRS; reproject.\"\"\"\n    cache_dir.mkdir(parents=True, exist_ok=True)\n    cache = cache_dir / f\"{src.stem}_{target_epsg}.parquet\"\n    if cache.exists() and cache.stat().st_mtime >= src.stat().st_mtime:\n        return gpd.read_parquet(cache)\n\n    gdf = gpd.read_file(src)\n\n    # If the source has no CRS, declare it (set_crs - no coord transform).\n    if gdf.crs is None:\n        if fallback_source_epsg is None:\n            raise ValueError(\n                f\"{src} has no CRS metadata. Pass fallback_source_epsg= \"\n                \"(commonly 4326 for lat/lon shapefiles).\"\n            )\n        gdf = gdf.set_crs(epsg=fallback_source_epsg)\n\n    # Reproject if target differs from source.\n    if gdf.crs.to_epsg() != target_epsg:\n        gdf = gdf.to_crs(epsg=target_epsg)\n\n    # Drop empty / invalid geometries.\n    gdf = gdf[~gdf.geometry.is_empty & gdf.geometry.is_valid].copy()\n\n    gdf.to_parquet(cache, index=False)                # ~10x faster reads\n    return gdf\n\n\ngdf = load_geodata(Path(\"countries.shp\"),\n                   target_epsg=3857, fallback_source_epsg=4326)\nprint(gdf.crs, len(gdf))\n\n# Decision rule:\n#   File has correct CRS metadata             -> read_file + to_crs.\n#   File has NO CRS / wrong CRS                -> set_crs (declare) then to_crs (reproject).\n#   You want to MEASURE distance/area          -> reproject to a CRS in METERS\n#                                                 (UTM zone, or local equal-area).\n#   You want to PLOT alongside web tiles       -> EPSG:3857.\n#   You want to STORE / SHARE a dataset        -> EPSG:4326 (most universal).\n#   You want fast reloads of huge GeoDFs       -> gpd.to_parquet + gpd.read_parquet.\n#   You want to read just a region (huge file) -> gpd.read_file(path, bbox=(x1,y1,x2,y2)).\n#   Want a stable column name for geometry      -> gdf.rename_geometry('geom') if needed.\n\n# Anti-pattern:\n#   gdf.area                                  # gdf is in EPSG:4326 (degrees)\n# Returns \"areas\" in degrees-squared - meaningless. Always reproject to a\n# meter-based CRS before using .area / .length / .distance.\n"
                  }
        ],
        tips: [
                  "`gpd.read_file` auto-detects the format from the extension (`.shp`, `.geojson`, `.gpkg`, `.parquet`).",
                  "`set_crs` declares without transforming; `to_crs` actually reprojects coordinates.",
                  "EPSG:4326 = WGS84 lat/lon (sharing); EPSG:3857 = web mercator (tile maps); UTM zones / equal-area = measurements.",
                  "For huge files, pass `bbox=(x1,y1,x2,y2)` or `mask=geometry` to read only a region.",
                  "Cache as GeoParquet (`gpd.to_parquet`) — 5-50× faster than re-reading shapefiles."
        ],
        mistake: "Calling `.area` or `.length` on a WGS84 (lat/lon) GeoDataFrame — values are in degrees², which are meaningless. Always reproject to a meter-based CRS first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "geopandas-spatial-joins",
        fn: "gpd.sjoin / gpd.overlay — combine geometries by location",
        desc: "Spatial joins are pandas joins keyed on geometry, not values. `sjoin` does point-in-polygon / overlap-based joins; `overlay` does set operations (intersection, union, difference). Both require both sides to share a CRS.",
        category: "geopandas",
        subtitle: "gpd.sjoin (predicates: intersects, within, contains, touches, crosses), how= (left, right, inner), gpd.sjoin_nearest (KNN), gpd.overlay (intersection, union, difference, symmetric_difference), spatial index (auto-built sindex), CRS-must-match before join",
        signature: "gpd.sjoin(left, right, how=\"inner\", predicate=\"intersects\"); gpd.overlay(a, b, how=\"intersection\")",
        descLong: "`sjoin` joins rows from two GeoDataFrames where the geometries satisfy a predicate (`intersects`, `within`, `contains`, etc.). `sjoin_nearest` finds the nearest neighbor — handy for \"which polygon is each point in/near\". `overlay` returns geometries from set operations (the intersection of two polygon layers). Three depths solve the SAME task — count cell-tower points inside each county polygon — at depths: nested for-loop with `.contains` (slow) → `gpd.sjoin(predicate=\"within\")` + groupby → projected, sjoin_nearest with distance, with CRS sanity check.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Count cell towers inside each county.\n# APPROACH  - Nested loop: for each county, count points within.\n# STRENGTHS - Demonstrates the operation.\n# WEAKNESSES- O(N*M); 1000 counties x 100k points = 100M checks. Glacial.\nimport geopandas as gpd\n\ncounties = gpd.read_file(\"counties.geojson\")\ntowers   = gpd.read_file(\"cell_towers.geojson\")\n\ncounts = []\nfor _, c in counties.iterrows():\n    n = towers.geometry.within(c.geometry).sum()\n    counts.append(n)\ncounties[\"tower_count\"] = counts\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — towers per county — using gpd.sjoin (right way).\n# APPROACH  - sjoin with predicate='within'; group by county id.\n# STRENGTHS - Uses the spatial index automatically; fast.\n# WEAKNESSES- Crashes if the two GeoDataFrames don't share a CRS.\nimport geopandas as gpd\n\ncounties = gpd.read_file(\"counties.geojson\")\ntowers   = gpd.read_file(\"cell_towers.geojson\")\n\n# CRITICAL: both sides must share a CRS.\nif towers.crs != counties.crs:\n    towers = towers.to_crs(counties.crs)\n\njoined = gpd.sjoin(towers, counties, how=\"inner\", predicate=\"within\")\ncounts = joined.groupby(\"county_id\").size().rename(\"tower_count\")\n\n# Merge counts back onto the counties layer.\ncounties = counties.merge(counts, on=\"county_id\", how=\"left\").fillna({\"tower_count\": 0})\nprint(counties[[\"name\", \"tower_count\"]].head())\n\n# Predicates available:\n#   intersects  - overlap or touch\n#   within      - left geom is fully inside right\n#   contains    - right geom is fully inside left\n#   touches     - share a boundary but no interior\n#   crosses     - 1D crosses 2D etc.\n#   overlaps    - same dim, partial overlap\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — towers per county — production: explicit CRS handling\n#             (project to a meter CRS for \"nearest within X meters\"),\n#             sjoin_nearest fallback for towers outside polygons.\n# APPROACH  - sjoin within polygons; for unmatched, sjoin_nearest with\n#             distance threshold; report counts + median distance.\n# STRENGTHS - Handles \"border-of-polygon\" towers; reports tower-to-county\n#             distance; fast (one indexed pass each).\n# WEAKNESSES- More logic; need to choose a meter-based CRS (UTM zone).\nfrom __future__ import annotations\nimport geopandas as gpd\n\n\ndef assign_towers_to_counties(\n    counties: gpd.GeoDataFrame,\n    towers: gpd.GeoDataFrame,\n    *,\n    metric_epsg: int = 3857,                          # rough; swap for local UTM\n    snap_distance_m: float = 250.0,\n) -> gpd.GeoDataFrame:\n    \"\"\"Return towers with assigned county_id and snap distance.\"\"\"\n    # Make absolutely sure both sides are in the SAME meter CRS.\n    counties_m = counties.to_crs(epsg=metric_epsg)\n    towers_m   = towers.to_crs(epsg=metric_epsg)\n\n    # 1) Strict within: every tower inside a county.\n    inside = gpd.sjoin(\n        towers_m, counties_m[[\"county_id\", \"geometry\"]],\n        how=\"left\", predicate=\"within\",\n    )\n\n    # 2) For towers NOT inside any county, snap to nearest within snap_distance.\n    misses = inside[inside.county_id.isna()].drop(columns=[\"index_right\", \"county_id\"])\n    if not misses.empty:\n        snapped = gpd.sjoin_nearest(\n            misses, counties_m[[\"county_id\", \"geometry\"]],\n            max_distance=snap_distance_m,\n            distance_col=\"snap_dist_m\",\n        )\n        inside = inside[~inside.county_id.isna()].assign(snap_dist_m=0.0)\n        inside = gpd.GeoDataFrame(\n            (\n                __import__(\"pandas\").concat([inside, snapped], ignore_index=True)\n            ),\n            geometry=\"geometry\", crs=towers_m.crs,\n        )\n\n    return inside\n\n\ncounties = gpd.read_file(\"counties.geojson\")\ntowers   = gpd.read_file(\"cell_towers.geojson\")\nresult = assign_towers_to_counties(counties, towers, snap_distance_m=500.0)\n\nper_county = result.groupby(\"county_id\").agg(\n    n_towers=(\"county_id\", \"size\"),\n    median_snap_m=(\"snap_dist_m\", \"median\"),\n)\nprint(per_county.head())\n\n# Decision rule:\n#   \"Which polygon contains each point?\"          -> sjoin(predicate='within').\n#   \"Polygons that intersect this region\"          -> sjoin(predicate='intersects').\n#   \"Closest feature to each point\"                -> sjoin_nearest (max_distance optional).\n#   Need set algebra (intersect 2 polygon layers)  -> gpd.overlay.\n#   Need cells of a tessellation                   -> overlay(union) of two layers.\n#   Many points, fewer polygons                    -> sjoin scales well (sindex on right side).\n#   Need DISTANCE in meters                         -> reproject both to a meter CRS (UTM\n#                                                       zone) before sjoin_nearest.\n#   Performance falling off                         -> gdf.sindex; or save as parquet so\n#                                                       reads are vectorized.\n\n# Anti-pattern:\n#   gpd.sjoin(left, right)                       # different CRS - silent garbage\n# sjoin doesn't always raise on CRS mismatch in older versions; even when\n# it warns, beginners ignore the warning. Result is \"0 matches\" because\n# coordinates from different CRSs never overlap in the same numeric range.\n"
                  }
        ],
        tips: [
                  "Both sides of `sjoin` must share a CRS — reproject before joining.",
                  "`sjoin` predicates: `intersects`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `covers`.",
                  "`sjoin_nearest(max_distance=, distance_col=)` is the right tool for \"snap each point to the closest polygon\".",
                  "`overlay` returns new geometries (set operations); `sjoin` keeps the left side's geometry and adds right-side columns.",
                  "GeoPandas builds a spatial index (`gdf.sindex`) lazily; explicit access just confirms it exists."
        ],
        mistake: "Spatial-joining two GeoDataFrames in different CRSs. The numeric ranges don't overlap, so the join returns \"0 matches\" — looks like the data is wrong, but it's a CRS bug.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "geopandas-plot-explore",
        fn: "GeoDataFrame.plot / .explore — static and interactive maps",
        desc: "`gdf.plot()` is matplotlib-backed (static, ready for reports). `gdf.explore()` returns a folium map (interactive, notebook-ready). Both use the same parameters: `column=` for choropleths, `categorical=`, `legend=`, `cmap=`.",
        category: "geopandas",
        subtitle: "gdf.plot (matplotlib, column=, categorical=, legend=, scheme= via mapclassify), gdf.explore (folium interactive, tiles=), contextily.add_basemap for tile background, common cmaps (viridis, plasma, RdYlBu_r), classification schemes (Quantiles, NaturalBreaks, EqualInterval)",
        signature: "ax = gdf.plot(column=\"pop\", scheme=\"Quantiles\", cmap=\"viridis\", legend=True); gdf.explore(column=\"pop\")",
        descLong: "`plot` produces a matplotlib Axes — chain `contextily.add_basemap(ax)` to overlay basemap tiles. For choropleths, pass `column=` and a `scheme=` (`\"Quantiles\"`, `\"NaturalBreaks\"`) from `mapclassify`. `explore` gives a Leaflet map in the notebook — pan/zoom/click. Three depths solve the SAME task — choropleth of population by county — at depths: gdf.plot with `column=\"pop\"` (default linear color) → quantile classification + colorbar + basemap tiles → side-by-side static (for report) and interactive (for exploration) outputs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Choropleth of population by county.\n# APPROACH  - gdf.plot(column='pop').\n# STRENGTHS - One line.\n# WEAKNESSES- Linear color scaling; one outlier washes everything out.\nimport geopandas as gpd\n\ngdf = gpd.read_file(\"counties.geojson\")\nax = gdf.plot(column=\"pop\", legend=True, figsize=(10, 6))\nax.set_axis_off()\nax.figure.savefig(\"pop.png\", dpi=120)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — choropleth — quantile classification + better colormap.\n# APPROACH  - scheme='Quantiles' (needs mapclassify); cmap='viridis'.\n# STRENGTHS - Each color bin holds ~equal counties; one outlier doesn't\n#             flatten the rest of the palette.\n# WEAKNESSES- No basemap; isolated island of color.\nimport geopandas as gpd\nimport matplotlib.pyplot as plt\n\ngdf = gpd.read_file(\"counties.geojson\")\n\nax = gdf.plot(\n    column=\"pop\",\n    scheme=\"Quantiles\",                                # needs: pip install mapclassify\n    k=7,                                               # 7 bins\n    cmap=\"viridis\",\n    legend=True,\n    legend_kwds={\"loc\": \"lower right\", \"fontsize\": 8},\n    edgecolor=\"white\",\n    linewidth=0.3,\n    figsize=(10, 6),\n)\nax.set_axis_off()\nplt.savefig(\"pop.png\", dpi=120, bbox_inches=\"tight\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — choropleth — production: static (for report) + a\n#             webmap (for exploration); basemap tiles; missing-data style.\n# APPROACH  - contextily basemap; gdf.explore for interactive map.\n# STRENGTHS - Two artifacts from one pipeline; missing values handled;\n#             web mercator basemap aligned via to_crs(3857).\n# WEAKNESSES- contextily fetches tiles - online dependency at build time.\nfrom __future__ import annotations\nimport geopandas as gpd\nimport matplotlib.pyplot as plt\nimport contextily as cx\nfrom pathlib import Path\n\n\ndef render_choropleth(\n    src: Path, *,\n    column: str = \"pop\",\n    scheme: str = \"NaturalBreaks\",\n    k: int = 7,\n    cmap: str = \"viridis\",\n    out_png: Path = Path(\"pop.png\"),\n    out_html: Path = Path(\"pop.html\"),\n) -> dict:\n    gdf = gpd.read_file(src)\n\n    # Reproject to web mercator for tile alignment.\n    gdf_web = gdf.to_crs(epsg=3857)\n\n    # --- Static (matplotlib) ---\n    fig, ax = plt.subplots(figsize=(11, 7))\n\n    # Style for missing values explicitly.\n    gdf_web.plot(\n        column=column,\n        scheme=scheme,\n        k=k,\n        cmap=cmap,\n        legend=True,\n        legend_kwds={\"loc\": \"lower right\", \"fontsize\": 8},\n        missing_kwds={\"color\": \"lightgrey\", \"label\": \"no data\", \"hatch\": \"///\"},\n        edgecolor=\"white\",\n        linewidth=0.3,\n        ax=ax,\n    )\n    cx.add_basemap(ax, source=cx.providers.CartoDB.PositronNoLabels, attribution_size=6)\n    ax.set_axis_off()\n    fig.savefig(out_png, dpi=150, bbox_inches=\"tight\")\n    plt.close(fig)\n\n    # --- Interactive (folium via gdf.explore) ---\n    m = gdf.to_crs(epsg=4326).explore(\n        column=column,\n        scheme=scheme, k=k,\n        cmap=cmap,\n        tiles=\"CartoDB positron\",\n        legend=True,\n        tooltip=True,\n        style_kwds={\"color\": \"white\", \"weight\": 0.4, \"fillOpacity\": 0.85},\n    )\n    m.save(out_html)\n\n    return {\"png\": str(out_png), \"html\": str(out_html), \"rows\": len(gdf)}\n\n\ninfo = render_choropleth(Path(\"counties.geojson\"), column=\"pop\")\nprint(info)\n\n# Decision rule:\n#   Static map for a PDF / report           -> gdf.plot + matplotlib + contextily.\n#   Interactive map for a notebook          -> gdf.explore (returns folium Map).\n#   Many features (>50k)                    -> use lonboard or pydeck (WebGL); folium chokes.\n#   Need classification bins                -> scheme= 'Quantiles' / 'NaturalBreaks' /\n#                                              'EqualInterval' (requires mapclassify).\n#   Diverging data (gain/loss)              -> cmap='RdYlBu_r' or 'BrBG'.\n#   Sequential data (counts/density)        -> cmap='viridis' / 'plasma' / 'YlOrRd'.\n#   Need basemap tiles                      -> contextily for static, tiles= for explore.\n#   Missing values                          -> missing_kwds= dict in plot().\n\n# Anti-pattern:\n#   gdf.plot(column='pop')                  # cmap='viridis' default linear\n# A single outlier (NYC, 8M) flattens every other county to dark blue.\n# Use scheme='Quantiles' or 'NaturalBreaks' for any real-world data\n# distribution.\n"
                  }
        ],
        tips: [
                  "`gdf.plot()` returns a matplotlib `Axes` — chain `contextily.add_basemap(ax)` for tile backgrounds.",
                  "`gdf.explore()` returns a `folium.Map` — `.save(\"foo.html\")` to drop on a server or open in a browser.",
                  "For real-world choropleths, always set `scheme=` (`Quantiles` or `NaturalBreaks`) — linear scaling hides everything.",
                  "For >50k features, switch to `lonboard` or `pydeck` (WebGL) — folium is canvas-based and slow.",
                  "`missing_kwds=` styles NaN polygons distinctly; never let \"no data\" share a color with low-data."
        ],
        mistake: "Linear-scaled choropleth on long-tailed data — one big city dominates the colormap and every other county looks identical. Use a quantile / natural-breaks scheme.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Shapely — geometry algebra ─────────────────────────────────────────
  {
    id: "shapely",
    title: "Shapely — geometry algebra",
    entries: [
      {
        id: "shapely-geometry-types",
        fn: "Point / LineString / Polygon / Multi* — geometry constructors",
        desc: "Shapely 2.0 geometries are immutable NumPy-backed objects: `Point(x, y)`, `LineString([(x, y), ...])`, `Polygon([(x, y), ...])`, plus their `Multi*` counterparts and `GeometryCollection`. Use `.area`, `.length`, `.centroid`, `.bounds`, `.envelope` for derived quantities.",
        category: "shapely",
        subtitle: "shapely.geometry: Point / LineString / LinearRing / Polygon (exterior + holes) / MultiPoint / MultiLineString / MultiPolygon / GeometryCollection, properties (area, length, centroid, bounds, is_valid, is_simple), constructors take (x, y) tuples in CRS units, shapely 2.0 is immutable / vectorized",
        signature: "Point(x, y); LineString([(x, y), ...]); Polygon([(x, y), ...], holes=[[...]]); geom.area; geom.bounds",
        descLong: "Shapely models OGC geometries: points, lines, polygons (with optional interior holes), and multi-versions of each. All are immutable in Shapely 2.0 — operations return new objects. Properties include `area` (in CRS units²), `length` (perimeter for polygons; chain length for lines), `centroid`, `bounds = (minx, miny, maxx, maxy)`, `envelope` (axis-aligned bbox). Three depths solve the SAME task — describe a polygon (area, perimeter, centroid) — at depths: bare Polygon constructor and properties → polygon with holes + validity check → robust constructor that fixes self-intersections via buffer(0) and validates explicitly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Build a polygon and print area/perimeter/centroid.\n# APPROACH  - Polygon constructor with a list of (x, y) tuples.\n# STRENGTHS - Three lines.\n# WEAKNESSES- No validation; first/last point doesn't auto-close in some\n#             contexts (Shapely closes for you, GeoJSON requires explicit).\nfrom shapely.geometry import Polygon, Point\n\nsquare = Polygon([(0, 0), (10, 0), (10, 10), (0, 10)])\nprint(\"area:\",      square.area)                      # 100.0\nprint(\"perimeter:\", square.length)                    # 40.0 (perimeter)\nprint(\"centroid:\",  square.centroid)                  # POINT (5 5)\nprint(\"bounds:\",    square.bounds)                    # (0, 0, 10, 10)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — polygon properties — but with an interior hole and\n#             validity check.\n# APPROACH  - Polygon with holes=[...]; .is_valid sanity check.\n# STRENGTHS - Models a real-world polygon (donut); catches bad geometry.\n# WEAKNESSES- Doesn't auto-fix invalid geometry.\nfrom shapely.geometry import Polygon\nfrom shapely.validation import explain_validity\n\n# A 10x10 square with a 4x4 square hole in the middle.\nexterior = [(0, 0), (10, 0), (10, 10), (0, 10)]\nhole     = [(3, 3), (7, 3), (7, 7), (3, 7)]\npoly = Polygon(exterior, holes=[hole])\n\nprint(\"area:\",     poly.area)                        # 100 - 16 = 84\nprint(\"length:\",   poly.length)                      # outer perimeter + hole perimeter\nprint(\"valid:\",    poly.is_valid)                    # True\nprint(\"explain:\",  explain_validity(poly))           # 'Valid Geometry'\nprint(\"centroid:\", poly.centroid)                    # not always inside the polygon!\n\n# Warning: the centroid CAN fall outside the polygon for L-shapes or\n# polygons with holes. Use representative_point() if you need a point\n# guaranteed to be inside.\nprint(\"rep_point:\", poly.representative_point())\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — polygon properties — production: build polygons from\n#             a points stream, fix self-intersections via buffer(0), report\n#             validity issues explicitly.\n# APPROACH  - Validate; if invalid, try .make_valid (Shapely 2.0); compute\n#             properties only on the valid geometry.\n# STRENGTHS - Survives messy real-world polygons; explicit error reporting.\n# WEAKNESSES- buffer(0) can split a polygon into a MultiPolygon - handle it.\nfrom __future__ import annotations\nfrom shapely.geometry import Polygon, MultiPolygon\nfrom shapely import make_valid                         # shapely 2.0\nfrom shapely.validation import explain_validity\n\n\ndef safe_polygon(coords: list[tuple[float, float]],\n                 holes: list[list[tuple[float, float]]] | None = None\n                 ) -> Polygon | MultiPolygon:\n    \"\"\"Build a polygon, repair if needed, return a valid geometry.\"\"\"\n    poly = Polygon(coords, holes=holes or [])\n    if poly.is_valid:\n        return poly\n    print(f\"invalid: {explain_validity(poly)} - repairing via make_valid\")\n    fixed = make_valid(poly)\n    if fixed.is_empty:\n        raise ValueError(\"polygon could not be repaired\")\n    return fixed\n\n\ndef describe(geom) -> dict:\n    \"\"\"Return area, perimeter, centroid, rep_point, bounds for any polygon.\"\"\"\n    if isinstance(geom, MultiPolygon):\n        # Sum across parts; centroid is computed over the multi.\n        return {\n            \"type\":      geom.geom_type,\n            \"area\":      sum(p.area for p in geom.geoms),\n            \"length\":    sum(p.length for p in geom.geoms),\n            \"centroid\":  geom.centroid,\n            \"rep_point\": geom.representative_point(),\n            \"bounds\":    geom.bounds,\n            \"n_parts\":   len(geom.geoms),\n        }\n    return {\n        \"type\":      geom.geom_type,\n        \"area\":      geom.area,\n        \"length\":    geom.length,\n        \"centroid\":  geom.centroid,\n        \"rep_point\": geom.representative_point(),\n        \"bounds\":    geom.bounds,\n    }\n\n\n# Bowtie (self-intersecting) polygon - classic invalid case.\nbowtie = [(0, 0), (10, 10), (10, 0), (0, 10)]\nfixed = safe_polygon(bowtie)\nprint(describe(fixed))\n\n# Decision rule:\n#   Single object                            -> Point / LineString / Polygon.\n#   Multiple disjoint of one kind            -> MultiPoint / MultiLineString / MultiPolygon.\n#   Mixed kinds                              -> GeometryCollection.\n#   Always-inside-the-shape point            -> .representative_point() (NOT .centroid).\n#   Just need the bounding box                -> .bounds (tuple) or .envelope (Polygon).\n#   Need to ensure validity                  -> .is_valid + make_valid (Shapely 2.0)\n#                                              or buffer(0) (legacy fix).\n#   Need to merge touching polygons           -> shapely.ops.unary_union(list_of_polys).\n#   Need to split a polygon by a line         -> shapely.ops.split.\n\n# Anti-pattern:\n#   poly.centroid                            # for an L-shape\n# Centroid of an L-shape is OUTSIDE the polygon. Use representative_point()\n# when you need a point known to lie inside.\n"
                  }
        ],
        tips: [
                  "Shapely 2.0 geometries are immutable — every operation returns a new geometry.",
                  "Polygon constructor: `Polygon(exterior_coords, holes=[hole_coords, ...])`.",
                  "`.centroid` can fall outside non-convex shapes; use `.representative_point()` for \"guaranteed inside\".",
                  "`.bounds` returns `(minx, miny, maxx, maxy)`; `.envelope` returns a Polygon of that bbox.",
                  "Fix self-intersecting polygons with `make_valid(geom)` (Shapely 2.0) or the legacy `geom.buffer(0)`."
        ],
        mistake: "Treating `.centroid` as the \"inside-the-shape representative point\" — for L-shapes and polygons with holes, the centroid can fall outside the polygon. Use `.representative_point()`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "shapely-spatial-predicates",
        fn: "intersects / within / contains / distance / buffer — geometry algebra",
        desc: "Predicates: `a.intersects(b)`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `disjoint`. Operations: `a.intersection(b)`, `union`, `difference`, `symmetric_difference`. Use `buffer(d)` to grow geometries (the standard \"within X meters\" trick).",
        category: "shapely",
        subtitle: "predicates (intersects, within, contains, touches, crosses, overlaps, disjoint, equals), operations (intersection, union, difference, symmetric_difference), buffer(distance, resolution=, cap_style=, join_style=), distance(other), DE-9IM relate string for nuanced relations",
        signature: "a.intersects(b); a.within(b); a.intersection(b); a.distance(b); a.buffer(50)",
        descLong: "Shapely predicates return booleans; operations return geometries. `buffer(d)` enlarges (positive d) or shrinks (negative d) by `d` units of the CRS — fundamental for \"within X meters\" queries (combine with a meter-based CRS first). Three depths solve the SAME task — find points within 1 km of a road — at depths: nested loop with `point.distance(road) < 1000` → `buffer(1000)` + single `intersects` per point → vectorized `shapely.intersects` across full arrays with sindex from the GeoDataFrame.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Find points within 1 km of a road LineString.\n# APPROACH  - Loop, distance() per point.\n# STRENGTHS - Demonstrates predicates.\n# WEAKNESSES- O(N) function calls in Python; slow for large N.\nfrom shapely.geometry import Point, LineString\n\nroad = LineString([(0, 0), (1000, 0), (1000, 1000)])\n\npoints = [Point(50, 50), Point(2000, 0), Point(995, 500)]\n\nnear = [p for p in points if p.distance(road) <= 1000]\nprint(len(near), \"near road\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — points within 1 km of road — buffer + intersects.\n# APPROACH  - road.buffer(1000) -> Polygon; for each point, intersects.\n# STRENGTHS - Single buffer; clear \"within X meters\" idiom.\n# WEAKNESSES- Still per-point loop in Python.\nfrom shapely.geometry import Point, LineString\n\nroad = LineString([(0, 0), (1000, 0), (1000, 1000)])\n\n# Buffer the road by 1000 units (whatever CRS units are - meters if projected).\nbuffer = road.buffer(1000)                            # Polygon\n\npoints = [Point(50, 50), Point(2000, 0), Point(995, 500)]\nnear = [p for p in points if p.intersects(buffer)]    # contains/within also work\nprint(len(near))\n\n# Buffer parameters worth knowing:\n#   resolution=  (segments per quarter-circle on rounded caps; default 16)\n#   cap_style=1  round (default); 2 flat; 3 square\n#   join_style=1 round (default); 2 mitre; 3 bevel\n# For \"exactly the rectangle 1000m wide on either side\", use cap_style=2.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — points within 1 km of road — production: vectorized\n#             Shapely 2.0 ops via geopandas, with spatial index.\n# APPROACH  - Build buffer; sjoin points against it (sindex applied\n#             automatically); add distance column.\n# STRENGTHS - Scales to millions of points (sindex); single vectorized op;\n#             returns a GeoDataFrame with distance to use downstream.\n# WEAKNESSES- Buffer is approximate (segmented circle); for exact distance,\n#             keep distance() not buffer-then-intersects.\nfrom __future__ import annotations\nimport geopandas as gpd\nfrom shapely.geometry import Point, LineString\nimport numpy as np\n\n\ndef points_near_line(\n    points: gpd.GeoDataFrame,\n    line: gpd.GeoDataFrame | LineString,\n    *,\n    distance_m: float,\n    metric_epsg: int = 3857,\n) -> gpd.GeoDataFrame:\n    \"\"\"Return points within distance_m of the line, with distance column.\"\"\"\n    if isinstance(line, LineString):\n        line = gpd.GeoDataFrame(geometry=[line], crs=points.crs)\n\n    # Reproject both to a meter CRS so distance is in meters.\n    pts = points.to_crs(epsg=metric_epsg)\n    ln  = line.to_crs(epsg=metric_epsg)\n\n    # Buffer the line; combine into one polygon for indexing.\n    buffer_geom = ln.geometry.buffer(distance_m).unary_union\n    buffer_gdf = gpd.GeoDataFrame(geometry=[buffer_geom], crs=ln.crs)\n\n    # sjoin with predicate='intersects' uses the sindex automatically.\n    in_buf = gpd.sjoin(pts, buffer_gdf, how=\"inner\", predicate=\"intersects\")\n\n    # Add EXACT distance to the (un-buffered) line. Vectorized over the\n    # geometry column - O(n) but in C.\n    line_geom = ln.geometry.unary_union\n    in_buf[\"dist_m\"] = in_buf.geometry.distance(line_geom)\n    return in_buf.drop(columns=[\"index_right\"]).reset_index(drop=True)\n\n\n# Demo\npoints = gpd.GeoDataFrame(\n    {\"id\": list(range(5))},\n    geometry=[Point(50, 50), Point(2000, 0), Point(995, 500),\n              Point(-100, 50), Point(1500, 1500)],\n    crs=3857,\n)\nroad_gdf = gpd.GeoDataFrame(\n    geometry=[LineString([(0, 0), (1000, 0), (1000, 1000)])], crs=3857,\n)\nnear = points_near_line(points, road_gdf, distance_m=1000)\nprint(near[[\"id\", \"dist_m\"]])\n\n# Decision rule:\n#   \"Within X meters of geometry G\"           -> G.buffer(X) + intersects\n#                                                 (or sjoin with the buffer).\n#   \"Exact closest distance\"                  -> a.distance(b).\n#   \"Touch but don't overlap\"                 -> .touches.\n#   \"Properly inside (no shared boundary)\"    -> .within (or .contains_properly).\n#   \"Disjoint\"                                -> a.disjoint(b)\n#                                                 (faster than not a.intersects(b)).\n#   Snap a point to a line                    -> shapely.ops.nearest_points(line, point).\n#   Set algebra (intersection/union/diff)     -> .intersection / .union / .difference.\n#   Need clean cap style for buffer corridor  -> buffer(d, cap_style=2) for flat caps.\n\n# Anti-pattern:\n#   gdf_4326.buffer(0.001)                    # buffer in DEGREES!\n# 0.001 degrees is ~111 m at the equator but only ~80 m at 45°N -\n# inconsistent. For \"within X meters\", reproject to a meter CRS first.\n"
                  }
        ],
        tips: [
                  "`buffer(d)` is in CRS units — reproject to a meter CRS before passing meters.",
                  "Predicates: `intersects`, `within`, `contains`, `touches`, `crosses`, `overlaps`, `disjoint`, `equals`.",
                  "Operations: `intersection`, `union`, `difference`, `symmetric_difference` — all return new geometries.",
                  "`shapely.ops.unary_union(list)` merges many geometries into one — much faster than chained unions.",
                  "Use `buffer(d, cap_style=2, join_style=2)` for sharp/flat-edged buffers (rectangles, mitred corners)."
        ],
        mistake: "Calling `geom.buffer(0.001)` on a WGS84 geometry expecting \"1 mm\". 0.001° ≈ 111 m at the equator, ~80 m at 45° N — inconsistent and meaningless. Reproject first.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: rasterio — raster I/O and windows ─────────────────────────────────────────
  {
    id: "rasterio",
    title: "rasterio — raster I/O and windows",
    entries: [
      {
        id: "rasterio-open-read",
        fn: "rasterio.open / .read / windows — read raster pixels",
        desc: "rasterio reads any GDAL-supported raster (GeoTIFF, JP2, ECW, COG). Open with `rasterio.open(path)`; read bands with `.read()` or specific bands with `.read([1, 2, 3])`. Read just a region via `windows` — essential for rasters too big for RAM.",
        category: "rasterio",
        subtitle: "rasterio.open as context manager, src.read (all bands HxWxN or single band 2D), src.read_masks, windows (rasterio.windows.from_bounds, Window(col_off, row_off, width, height)), Cloud-Optimized GeoTIFF (COG) for remote streaming, src.transform / .crs / .nodata / .dtypes",
        signature: "with rasterio.open(path) as src: arr = src.read(); arr = src.read(window=Window(col_off, row_off, w, h))",
        descLong: "A raster is `(bands, rows, cols)`; `src.read()` returns the full array, `src.read(1)` returns a single band as `(rows, cols)`. Crucial properties: `src.transform` (affine pixel→world coords), `src.crs`, `src.bounds`, `src.shape`, `src.nodata`. For huge files, read by `Window` (col_off, row_off, width, height) — only loads that subset. Three depths solve the SAME task — read a Sentinel-2 RGB tile and compute mean reflectance — at depths: full read into RAM → window read of a bbox → COG-aware streaming + masked array (handle nodata) + reproject-on-read.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Read all bands of a raster, print shape + dtype.\n# APPROACH  - rasterio.open + src.read.\n# STRENGTHS - Three lines.\n# WEAKNESSES- Reads the whole file into RAM; ignores nodata pixels;\n#             Sentinel-2 tiles can be ~1 GB.\nimport rasterio\n\nwith rasterio.open(\"scene.tif\") as src:\n    arr = src.read()                                  # (bands, rows, cols)\n    print(arr.shape, arr.dtype)                       # e.g. (3, 10980, 10980) uint16\n    print(\"crs:\", src.crs)\n    print(\"transform:\", src.transform)                # affine\n    print(\"bounds:\", src.bounds)                      # (left, bottom, right, top)\n    print(\"nodata:\", src.nodata)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — read a tile — but only a region (window) and compute\n#             mean reflectance, ignoring nodata.\n# APPROACH  - windows.from_bounds + masked=True.\n# STRENGTHS - Doesn't blow RAM on huge rasters; respects nodata.\n# WEAKNESSES- Still single-thread; no overview / pyramid use.\nimport rasterio\nfrom rasterio.windows import from_bounds\nimport numpy as np\n\n# Region of interest (in CRS units of the raster).\nminx, miny, maxx, maxy = 500000, 4000000, 510000, 4010000\n\nwith rasterio.open(\"scene.tif\") as src:\n    win = from_bounds(minx, miny, maxx, maxy, transform=src.transform)\n    print(\"window:\", win)                             # Window(col_off=, row_off=, width=, height=)\n\n    # masked=True returns a numpy MaskedArray that hides nodata pixels.\n    arr = src.read(window=win, masked=True)           # (bands, rows, cols)\n    print(arr.shape, arr.fill_value)\n\n    # Mean per band, ignoring masked pixels.\n    band_means = arr.mean(axis=(1, 2))\n    print({i + 1: float(m) for i, m in enumerate(band_means)})\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — read raster region + stats — production: COG-friendly\n#             remote read, reproject-on-the-fly with WarpedVRT, NDVI calc\n#             with band aliases.\n# APPROACH  - rasterio.Env for GDAL options (vsicurl); WarpedVRT for\n#             reprojection without writing to disk; band-name lookup.\n# STRENGTHS - Streams from S3/HTTP; reprojects without temp files;\n#             readable per-band semantics.\n# WEAKNESSES- COG path requires the source to actually be a COG.\nfrom __future__ import annotations\nimport rasterio\nfrom rasterio.windows import from_bounds\nfrom rasterio.vrt import WarpedVRT\nfrom rasterio.enums import Resampling\nimport numpy as np\n\n\n# Sentinel-2 example: assume bands 1=B04 (red), 2=B08 (NIR).\ndef read_ndvi_window(\n    src_uri: str,                                     # \"s3://...\" or \"https://...\" for COG\n    *, bbox: tuple[float, float, float, float],\n    target_epsg: int = 3857,\n    target_res: float = 10.0,                         # meters/pixel\n) -> dict:\n    \"\"\"Streamed read + on-the-fly reproject + NDVI.\"\"\"\n    # GDAL_HTTP_VERSION=2 + retries help on flaky CDNs; CACHE controls RAM cache.\n    env = rasterio.Env(\n        GDAL_HTTP_VERSION=\"2\",\n        GDAL_HTTP_MAX_RETRY=3,\n        CPL_VSIL_CURL_CHUNK_SIZE=10 * 1024 * 1024,\n    )\n    with env, rasterio.open(src_uri) as src:\n        with WarpedVRT(\n            src,\n            crs=f\"EPSG:{target_epsg}\",\n            resampling=Resampling.bilinear,\n            src_nodata=src.nodata,\n            nodata=src.nodata,\n            res=(target_res, target_res),\n        ) as vrt:\n            # Window in the VRT (target) CRS coordinates.\n            win = from_bounds(*bbox, transform=vrt.transform)\n\n            red = vrt.read(1, window=win, masked=True).astype(\"float32\")\n            nir = vrt.read(2, window=win, masked=True).astype(\"float32\")\n\n    ndvi = (nir - red) / (nir + red + 1e-9)\n    return {\n        \"ndvi_mean\":  float(ndvi.mean()),\n        \"ndvi_std\":   float(ndvi.std()),\n        \"valid_frac\": float(ndvi.count() / ndvi.size),\n        \"shape\":      ndvi.shape,\n    }\n\n\n# Use it (replace with a real COG URL)\n# stats = read_ndvi_window(\"s3://bucket/scene.tif\",\n#                         bbox=(-13_634_000, 4_530_000, -13_624_000, 4_540_000),\n#                         target_epsg=3857)\n# print(stats)\n\n# Decision rule:\n#   File on local disk, fits in RAM            -> rasterio.open + read().\n#   Huge file or just a region                 -> Window-based read (above).\n#   Need to reproject pixels                   -> WarpedVRT (no temp file) or rio.warp.reproject.\n#   File is on S3 / HTTP and is a COG          -> rasterio.open(uri) directly; lazy read.\n#   File is on S3 but NOT a COG                -> download first; non-COG random access is slow.\n#   nodata matters                              -> read(..., masked=True) and use the mask.\n#   Many bands, only need a few                 -> read([4, 8, 11]); skip the rest.\n#   Need overviews / pyramids                   -> use src.overviews(1) and read(..., out_shape=).\n\n# Anti-pattern:\n#   src.read()                                  # whole 10980x10980 raster\n# Reads ~2.5 GB for a single Sentinel-2 RGB tile and dies on 8GB laptops.\n# Always use windows for anything bigger than ~1000x1000 pixels.\n"
                  }
        ],
        tips: [
                  "`src.read()` returns `(bands, rows, cols)`; `src.read(1)` returns a single band `(rows, cols)`.",
                  "`Window(col_off, row_off, width, height)` is in pixel coords; `windows.from_bounds(...)` builds one from CRS coords.",
                  "`masked=True` returns a `MaskedArray` that hides `nodata` pixels — almost always what you want.",
                  "Cloud-Optimized GeoTIFFs (COGs) on S3/HTTP support partial reads — open the URL directly, no download.",
                  "`WarpedVRT` reprojects on the fly without writing a new file — combine with `from_bounds` to read a target-CRS region."
        ],
        mistake: "Reading a Sentinel-2 tile with `src.read()` — you load 2 GB of pixels you don't need. Use a Window for any subset bigger than ~1000×1000.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "rasterio-mask-reproject",
        fn: "rasterio.mask / .warp.reproject — clip and reproject",
        desc: "`rasterio.mask.mask` clips a raster to a polygon (everything outside becomes nodata). `rasterio.warp.reproject` resamples to a new CRS or grid. Both write to a destination dataset using the same `meta` dict pattern: copy from source, override what changes.",
        category: "rasterio",
        subtitle: "rasterio.mask.mask (geometries iterable, crop=True to tighten bounds, all_touched= for partial pixels), rasterio.warp.reproject (Resampling enum: nearest for categorical, bilinear/cubic for continuous), meta = src.meta.copy() then override, calculate_default_transform helper",
        signature: "masked, transform = mask.mask(src, geometries, crop=True); reproject(source=, destination=, src_transform=, dst_transform=, resampling=)",
        descLong: "`mask` clips to a polygon list; pass `crop=True` to also tighten the output bounds. `reproject` is GDAL's `gdalwarp` — use `Resampling.nearest` for categorical/integer rasters (land cover, classifications) and `bilinear`/`cubic` for continuous (DEM, reflectance). The standard write pattern: copy `src.meta`, override `height`, `width`, `transform`, `crs` as needed, then `with rasterio.open(dst, \"w\", **meta)`. Three depths solve the SAME task — clip a DEM to a watershed polygon and reproject to a local UTM zone — at depths: read → mask → write same CRS → mask + warp + write with proper meta → memory-pinned reproject + windowed mask for huge rasters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Clip a DEM to a watershed polygon; save the clip.\n# APPROACH  - rasterio.mask.mask + write with copied metadata.\n# STRENGTHS - Standard mask pattern.\n# WEAKNESSES- Same CRS as input; no reprojection.\nimport rasterio\nfrom rasterio.mask import mask\nimport geopandas as gpd\n\nwatershed = gpd.read_file(\"watershed.geojson\")\n\nwith rasterio.open(\"dem.tif\") as src:\n    # geometries arg is an iterable of shapely-like dicts; feed in CRS-matched.\n    geoms = watershed.to_crs(src.crs).geometry.tolist()\n    out_arr, out_transform = mask(src, geoms, crop=True)\n    out_meta = src.meta.copy()\n    out_meta.update({\n        \"height\":    out_arr.shape[1],\n        \"width\":     out_arr.shape[2],\n        \"transform\": out_transform,\n    })\n\nwith rasterio.open(\"dem_clipped.tif\", \"w\", **out_meta) as dst:\n    dst.write(out_arr)\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — clip + reproject DEM to UTM zone — using warp.\n# APPROACH  - mask first, then reproject the clip.\n# STRENGTHS - Output in meters (real distance/area math possible).\n# WEAKNESSES- Two passes (mask then reproject); could be one with WarpedVRT.\nimport rasterio\nfrom rasterio.mask import mask\nfrom rasterio.warp import reproject, calculate_default_transform, Resampling\nimport geopandas as gpd\nimport numpy as np\n\nwatershed = gpd.read_file(\"watershed.geojson\")\nTARGET = \"EPSG:32614\"                                  # UTM zone 14N\n\nwith rasterio.open(\"dem.tif\") as src:\n    geoms = watershed.to_crs(src.crs).geometry.tolist()\n    clipped, clipped_transform = mask(src, geoms, crop=True)\n    src_meta = src.meta.copy()\n    src_meta.update({\n        \"height\": clipped.shape[1], \"width\": clipped.shape[2],\n        \"transform\": clipped_transform,\n    })\n\n# Compute target transform + dimensions for the clip.\nleft, bottom, right, top = (\n    clipped_transform.c,\n    clipped_transform.f + clipped_transform.e * clipped.shape[1],\n    clipped_transform.c + clipped_transform.a * clipped.shape[2],\n    clipped_transform.f,\n)\ndst_transform, dst_w, dst_h = calculate_default_transform(\n    src_meta[\"crs\"], TARGET, clipped.shape[2], clipped.shape[1],\n    left=left, bottom=bottom, right=right, top=top,\n)\n\ndst_arr = np.empty((src.count, dst_h, dst_w), dtype=src_meta[\"dtype\"])\n\nreproject(\n    source=clipped,\n    destination=dst_arr,\n    src_transform=clipped_transform,\n    src_crs=src_meta[\"crs\"],\n    dst_transform=dst_transform,\n    dst_crs=TARGET,\n    resampling=Resampling.bilinear,                   # continuous data\n)\n\ndst_meta = src_meta.copy()\ndst_meta.update({\"crs\": TARGET, \"transform\": dst_transform,\n                 \"width\": dst_w, \"height\": dst_h})\n\nwith rasterio.open(\"dem_clip_utm.tif\", \"w\", **dst_meta) as dst:\n    dst.write(dst_arr)\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — clip + reproject — production: pick resampling by\n#             dtype, write Cloud-Optimized GeoTIFF, preserve nodata.\n# APPROACH  - One helper that wraps mask + reproject + COG output.\n# STRENGTHS - Continuous and categorical data both correct; output is COG\n#             (cloud-streamable); nodata preserved.\n# WEAKNESSES- Requires rio-cogeo or GDAL with COG driver (common since GDAL 3.1).\nfrom __future__ import annotations\nimport rasterio\nfrom rasterio.mask import mask\nfrom rasterio.warp import reproject, calculate_default_transform, Resampling\nimport geopandas as gpd\nimport numpy as np\nfrom pathlib import Path\n\n\ndef _resampling_for(dtype: np.dtype) -> Resampling:\n    \"\"\"Categorical -> nearest; continuous -> bilinear.\"\"\"\n    return Resampling.nearest if np.issubdtype(dtype, np.integer) else Resampling.bilinear\n\n\ndef clip_and_reproject(\n    src_path: Path, dst_path: Path,\n    polygons: gpd.GeoDataFrame,\n    *, target_crs: str = \"EPSG:3857\",\n) -> None:\n    with rasterio.open(src_path) as src:\n        # 1) Clip\n        polys = polygons.to_crs(src.crs).geometry.tolist()\n        clipped, clipped_t = mask(src, polys, crop=True, nodata=src.nodata)\n        src_crs    = src.crs\n        src_dtype  = src.dtypes[0]\n        src_count  = src.count\n        src_nodata = src.nodata\n\n    h, w = clipped.shape[1], clipped.shape[2]\n\n    # 2) Compute target grid.\n    left   = clipped_t.c\n    top    = clipped_t.f\n    right  = left + clipped_t.a * w\n    bottom = top  + clipped_t.e * h\n\n    dst_t, dst_w, dst_h = calculate_default_transform(\n        src_crs, target_crs, w, h,\n        left=left, bottom=bottom, right=right, top=top,\n    )\n\n    dst_arr = np.full((src_count, dst_h, dst_w),\n                      src_nodata if src_nodata is not None else 0,\n                      dtype=src_dtype)\n\n    reproject(\n        source=clipped, destination=dst_arr,\n        src_transform=clipped_t, src_crs=src_crs,\n        dst_transform=dst_t,     dst_crs=target_crs,\n        src_nodata=src_nodata,   dst_nodata=src_nodata,\n        resampling=_resampling_for(np.dtype(src_dtype)),\n    )\n\n    # 3) Write as COG (Cloud-Optimized GeoTIFF).\n    profile = {\n        \"driver\":    \"COG\",\n        \"dtype\":     src_dtype,\n        \"count\":     src_count,\n        \"crs\":       target_crs,\n        \"transform\": dst_t,\n        \"width\":     dst_w,\n        \"height\":    dst_h,\n        \"nodata\":    src_nodata,\n        \"compress\":  \"deflate\",\n        \"BIGTIFF\":   \"IF_SAFER\",\n    }\n    with rasterio.open(dst_path, \"w\", **profile) as dst:\n        dst.write(dst_arr)\n\n\nwatershed = gpd.read_file(\"watershed.geojson\")\nclip_and_reproject(Path(\"dem.tif\"), Path(\"dem_clip.tif\"), watershed)\n\n# Decision rule:\n#   Continuous data (DEM, reflectance, temp)    -> Resampling.bilinear or .cubic.\n#   Categorical data (land cover, classes)      -> Resampling.nearest (NEVER bilinear).\n#   Need exact area preservation                 -> Resampling.average (slower).\n#   Single-step clip + reproject                 -> WarpedVRT inside one rasterio.open.\n#   Pipeline output for re-use                   -> driver='COG' and overviews.\n#   Many polygons, one raster                    -> rasterio.features.rasterize once\n#                                                   then mask vs the rasterized version.\n#   Loop over many small AOIs                    -> open the source ONCE; reuse the handle.\n\n# Anti-pattern:\n#   reproject(..., resampling=Resampling.bilinear)  # for a land-cover raster\n# Bilinear interpolation between class IDs (1, 5, 9) creates pixels with\n# value 3 or 7 - classes that don't exist. Always Resampling.nearest for\n# categorical data.\n"
                  }
        ],
        tips: [
                  "Always copy `src.meta` and override only the changed keys (`height`, `width`, `transform`, `crs`) — keeps dtype, count, nodata consistent.",
                  "`Resampling.nearest` for categorical data (classes/IDs); `bilinear`/`cubic` for continuous (DEM, reflectance).",
                  "`mask(src, geoms, crop=True)` tightens output bounds to the polygon — without it you get the full raster with nodata outside.",
                  "Modern GDAL (3.1+) has a `'COG'` driver that writes Cloud-Optimized GeoTIFFs directly — no rio-cogeo needed.",
                  "For repeated AOI extractions on a large raster, open the source once and call `read(window=...)` per AOI — handle reuse is huge."
        ],
        mistake: "Bilinear-resampling a categorical (class-ID) raster — fractional class values appear that don't exist in the legend. Always use `Resampling.nearest` for categorical data.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: folium — Leaflet maps in notebooks ─────────────────────────────────────────
  {
    id: "folium",
    title: "folium — Leaflet maps in notebooks",
    entries: [
      {
        id: "folium-basic-markers",
        fn: "folium.Map / Marker / GeoJson — interactive maps in 5 lines",
        desc: "folium is a thin Python wrapper over Leaflet.js. Create a `Map(location=[lat, lon], zoom_start=)`, add `Marker`s, `GeoJson`, `Choropleth`, save with `m.save(\"map.html\")`. The notebook displays it inline.",
        category: "folium",
        subtitle: "folium.Map (location=[lat, lon] in WGS84, tiles= \"OpenStreetMap\" / \"CartoDB positron\" / \"Stamen Terrain\"), Marker (popup, tooltip, icon=), GeoJson(data, style_function=, tooltip=), MarkerCluster for many markers, m.save / display in Jupyter, FeatureGroup + LayerControl",
        signature: "m = folium.Map(location=[lat, lon], zoom_start=12); folium.Marker([lat, lon]).add_to(m); m.save(\"map.html\")",
        descLong: "folium expects WGS84 lat/lon for locations (NOT projected). `Map` is the canvas; `Marker`/`GeoJson`/`Choropleth` are layers added with `.add_to(m)`. `MarkerCluster` is the right wrapper for >1000 points (clusters at low zoom). `LayerControl` adds the toggle button when you have multiple `FeatureGroup`s. Three depths solve the SAME task — show 5000 store locations with hover info — at depths: 5000 raw markers (slow) → MarkerCluster (smooth) → MarkerCluster + categorical FeatureGroups + tooltip with HTML + LayerControl.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Show 5000 store locations on a map.\n# APPROACH  - Add 5000 Marker objects.\n# STRENGTHS - Trivial.\n# WEAKNESSES- Slow at low zoom (5000 markers all rendered); no clustering.\nimport folium\n\nm = folium.Map(location=[39.5, -98.35], zoom_start=4)  # rough US center\n\n# stores: list of dicts with lat, lon, name\nstores = [\n    {\"lat\": 40.7128, \"lon\": -74.0060, \"name\": \"NYC\"},\n    {\"lat\": 34.0522, \"lon\": -118.2437, \"name\": \"LA\"},\n    # ...\n]\nfor s in stores:\n    folium.Marker([s[\"lat\"], s[\"lon\"]], popup=s[\"name\"]).add_to(m)\n\nm.save(\"stores.html\")\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — 5000 stores — using MarkerCluster (smooth at any zoom).\n# APPROACH  - folium.plugins.MarkerCluster; markers add to the cluster.\n# STRENGTHS - Clusters at low zoom; expands as you zoom in.\n# WEAKNESSES- All in one cluster; can't toggle by category.\nimport folium\nfrom folium.plugins import MarkerCluster\n\nm = folium.Map(location=[39.5, -98.35], zoom_start=4,\n               tiles=\"CartoDB positron\")              # cleaner basemap\ncluster = MarkerCluster().add_to(m)\n\nstores = [{\"lat\": 40.7128, \"lon\": -74.0060, \"name\": \"NYC\", \"kind\": \"flagship\"},\n          {\"lat\": 34.0522, \"lon\": -118.2437, \"name\": \"LA\", \"kind\": \"outlet\"}]\n\nfor s in stores:\n    folium.Marker(\n        [s[\"lat\"], s[\"lon\"]],\n        popup=folium.Popup(s[\"name\"], max_width=200),\n        tooltip=s[\"name\"],                             # hover label\n        icon=folium.Icon(color=\"blue\" if s[\"kind\"] == \"flagship\" else \"gray\"),\n    ).add_to(cluster)\n\nm.save(\"stores.html\")\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — store map — production: per-category FeatureGroups,\n#             rich HTML popups, LayerControl, Geocoded center, fit bounds.\n# APPROACH  - One MarkerCluster per category in its own FeatureGroup;\n#             LayerControl toggles them; m.fit_bounds to the data.\n# STRENGTHS - Toggleable layers; readable popups; auto-zoomed to data.\n# WEAKNESSES- More setup; HTML in popups is easy to break (escape user data).\nfrom __future__ import annotations\nimport folium\nfrom folium.plugins import MarkerCluster\nimport html\n\n\nCOLOR_BY_KIND = {\"flagship\": \"red\", \"outlet\": \"blue\", \"kiosk\": \"green\"}\n\n\ndef render_store_map(stores: list[dict], out_path: str = \"stores.html\") -> None:\n    if not stores:\n        raise ValueError(\"no stores\")\n\n    # Auto-center on data; LayerControl below switches per kind.\n    lats = [s[\"lat\"] for s in stores]; lons = [s[\"lon\"] for s in stores]\n    m = folium.Map(\n        location=[sum(lats) / len(lats), sum(lons) / len(lons)],\n        tiles=\"CartoDB positron\", control_scale=True,\n    )\n\n    groups: dict[str, folium.FeatureGroup] = {}\n    for s in stores:\n        kind = s.get(\"kind\", \"other\")\n        if kind not in groups:\n            groups[kind] = folium.FeatureGroup(name=kind.capitalize())\n            groups[kind].add_to(m)\n\n        # Each kind gets its own MarkerCluster inside its FeatureGroup so\n        # toggling the layer hides/shows that whole cluster.\n        cluster = groups.get(f\"_cluster_{kind}\")\n        if cluster is None:\n            cluster = MarkerCluster().add_to(groups[kind])\n            groups[f\"_cluster_{kind}\"] = cluster\n\n        # Escape user-controlled fields - never trust raw input in HTML.\n        name = html.escape(s[\"name\"])\n        addr = html.escape(s.get(\"address\", \"\"))\n        phone = html.escape(s.get(\"phone\", \"\"))\n\n        popup_html = f\"\"\"\n        <div style=\"font-family:sans-serif;min-width:200px\">\n            <div style=\"font-weight:bold;font-size:14px\">{name}</div>\n            <div style=\"color:#666\">{addr}</div>\n            <div style=\"margin-top:6px\">📞 {phone}</div>\n        </div>\n        \"\"\"\n\n        folium.Marker(\n            [s[\"lat\"], s[\"lon\"]],\n            popup=folium.Popup(popup_html, max_width=260),\n            tooltip=name,\n            icon=folium.Icon(color=COLOR_BY_KIND.get(kind, \"gray\"),\n                             icon=\"info-sign\"),\n        ).add_to(cluster)\n\n    folium.LayerControl(collapsed=False).add_to(m)\n    # Auto-fit bounds to data extent.\n    m.fit_bounds([[min(lats), min(lons)], [max(lats), max(lons)]])\n    m.save(out_path)\n\n\n# Demo\nstores = [\n    {\"lat\": 40.7128, \"lon\": -74.0060, \"name\": \"NYC Flagship\",\n     \"kind\": \"flagship\", \"address\": \"5th Ave\", \"phone\": \"+1 212 555 1212\"},\n    {\"lat\": 34.0522, \"lon\": -118.2437, \"name\": \"LA Outlet\",\n     \"kind\": \"outlet\", \"address\": \"Sunset Blvd\", \"phone\": \"+1 213 555 9988\"},\n]\nrender_store_map(stores)\n\n# Decision rule:\n#   < 500 markers                              -> bare folium.Marker is fine.\n#   500 - 50k markers                           -> MarkerCluster.\n#   > 50k markers                               -> Leaflet.heat (folium.plugins.HeatMap)\n#                                                  or pydeck/lonboard for WebGL.\n#   Polygons / GeoJSON                          -> folium.GeoJson(data, style_function=, tooltip=)\n#                                                  or folium.Choropleth.\n#   Need user toggleable layers                  -> FeatureGroup + LayerControl.\n#   Need a basemap that's actually professional  -> tiles=\"CartoDB positron\" / \"CartoDB dark_matter\".\n#   Need offline tiles                           -> tiles=None + custom WMS / static tile server.\n#   Producing artifacts repeatedly               -> save HTML; embed in iframe / Jupyter.\n\n# Anti-pattern:\n#   folium.Map(location=projected_xy)         # passes projected coords\n# folium expects WGS84 lat/lon - if you pass UTM or web-mercator\n# coordinates the marker lands in the Indian Ocean or thereabouts.\n# Always to_crs(epsg=4326) before handing geometry to folium.\n"
                  }
        ],
        tips: [
                  "folium expects WGS84 lat/lon (`location=[lat, lon]`) — reproject any projected GeoDataFrame first.",
                  "`MarkerCluster` (`folium.plugins.MarkerCluster`) is essential beyond ~500 markers.",
                  "`tiles=\"CartoDB positron\"` is a clean professional basemap; `\"CartoDB dark_matter\"` for dark mode.",
                  "For categorical layers, wrap each in a `FeatureGroup` and add a `LayerControl(collapsed=False)`.",
                  "Always `html.escape` user-controlled text before stuffing into popup HTML — XSS in static maps is a real bug."
        ],
        mistake: "Passing projected coords (UTM, EPSG:3857) to `folium.Map(location=...)`. folium expects WGS84 lat/lon — projected coordinates land the marker in the wrong hemisphere. Always reproject to 4326.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 5: When to reach for which geo tool ─────────────────────────────────────────
  {
    id: "patterns",
    title: "When to reach for which geo tool",
    entries: [
      {
        id: "geo-stack-decision",
        fn: "GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack",
        desc: "GeoPandas for a desktop-friendly DataFrame workflow. PostGIS when the data is too big for one machine and queries can be expressed in SQL. DuckDB-spatial for fast local joins on parquet/geoparquet. xarray + rioxarray for n-dimensional rasters (time × bands × y × x).",
        category: "patterns",
        subtitle: "GeoPandas (in-RAM, ~10M-row sweet spot, sklearn-friendly), PostGIS (server-side, ST_* SQL functions, indexes, multi-user), DuckDB-spatial (single-binary, parquet-native, fast joins), xarray + rioxarray (n-D rasters: time + bands + y + x), Apache Sedona (Spark scale)",
        signature: "# GeoPandas: gpd.read_file/sjoin\\n# PostGIS: SELECT ST_Intersects(a.geom, b.geom) ...\\n# DuckDB: INSTALL spatial; SELECT ST_Intersects(...) FROM read_parquet(...)\\n# xarray: rioxarray.open_rasterio(..., chunks=\"auto\")",
        descLong: "GeoPandas is the productivity sweet spot up to ~10M rows on a laptop. Past that, PostGIS gives you server-side spatial joins, R-tree indexes, and multi-user concurrency — but you're writing SQL. DuckDB-spatial reads geoparquet directly and runs `ST_*` functions on it — the right pick for \"I have a folder of parquet files and want to spatial-join\". xarray + rioxarray turn rasters into n-dimensional labeled arrays — essential for time-series stacks (Sentinel-2 weekly, ERA5 climate). Three depths solve the SAME task — count points per polygon — at depths: GeoPandas sjoin (in-RAM) → PostGIS ST_Intersects (SQL, indexed) → DuckDB-spatial across parquet (single-machine, fast).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Count points per polygon in GeoPandas.\n# APPROACH  - sjoin + groupby.\n# STRENGTHS - 3 lines; works up to ~10M rows on a laptop.\n# WEAKNESSES- Single-machine RAM bound; no concurrency.\nimport geopandas as gpd\n\npolys  = gpd.read_file(\"polys.geojson\")\npoints = gpd.read_file(\"points.geojson\")\nif points.crs != polys.crs:\n    points = points.to_crs(polys.crs)\n\njoined = gpd.sjoin(points, polys, how=\"inner\", predicate=\"within\")\ncounts = joined.groupby(\"poly_id\").size().rename(\"n\")\nprint(counts.head())\n"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - SAME — count points per polygon — in PostGIS via SQLAlchemy.\n# APPROACH  - ST_Intersects against an indexed geom column.\n# STRENGTHS - Scales to 100M+ rows; multi-user; persisted state.\n# WEAKNESSES- Need a Postgres + PostGIS instance; SQL not Python.\nimport sqlalchemy as sa\n\nengine = sa.create_engine(\"postgresql+psycopg://user:pw@host/db\")\n\nsql = \"\"\"\n    SELECT\n        p.poly_id,\n        COUNT(*) AS n\n    FROM polygons p\n    JOIN points  pt ON ST_Intersects(p.geom, pt.geom)   -- uses GiST index\n    GROUP BY p.poly_id\n    ORDER BY n DESC\n    LIMIT 100;\n\"\"\"\n\nwith engine.connect() as conn:\n    rows = conn.execute(sa.text(sql)).all()\nfor r in rows:\n    print(r)\n\n# Required setup (once, by DBA):\n#   CREATE EXTENSION postgis;\n#   CREATE INDEX ON polygons USING GIST (geom);\n#   CREATE INDEX ON points  USING GIST (geom);\n# Without GiST indexes the join is O(N*M) and unusable past ~1M rows.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - SAME — points-per-polygon — using DuckDB-spatial directly on\n#             local geoparquet files. Single binary, no server.\n# APPROACH  - INSTALL spatial; ST_Intersects across read_parquet().\n# STRENGTHS - One process, no server, queries scale to TB on disk;\n#             columnar parquet read is cache-friendly.\n# WEAKNESSES- Single-machine; not multi-user; spatial extension is newer\n#             than GeoPandas / PostGIS so coverage of ST_* funcs is smaller.\nimport duckdb\n\n\ncon = duckdb.connect()\ncon.execute(\"INSTALL spatial; LOAD spatial;\")\n\n# Tell DuckDB which parquet files to treat as spatial.\ncon.execute(\"\"\"\n    CREATE OR REPLACE VIEW polys AS\n    SELECT *, ST_GeomFromWKB(geometry) AS geom\n    FROM read_parquet('s3://bucket/polys/*.parquet');\n\n    CREATE OR REPLACE VIEW points AS\n    SELECT *, ST_GeomFromWKB(geometry) AS geom\n    FROM read_parquet('s3://bucket/points/*.parquet');\n\"\"\")\n\nresult = con.execute(\"\"\"\n    SELECT\n        p.poly_id,\n        COUNT(*) AS n\n    FROM polys  p\n    JOIN points pt ON ST_Intersects(p.geom, pt.geom)\n    GROUP BY p.poly_id\n    ORDER BY n DESC\n    LIMIT 100;\n\"\"\").df()                                              # back to pandas\n\nprint(result.head())\n\n# Decision rule:\n#   < 10M rows, iterating in a notebook            -> GeoPandas.\n#   > 10M rows, one machine, parquet files          -> DuckDB-spatial.\n#   > 100M rows, multi-user, persistent             -> PostGIS.\n#   Distributed (TB+) batch jobs                     -> Apache Sedona on Spark.\n#   Time-series of rasters (Sentinel-2 weekly)       -> xarray + rioxarray + dask\n#                                                       (chunks across time + space).\n#   Tile-served vector for web maps                   -> tippecanoe -> mbtiles -> tile server.\n#   Need transactional writes (collab editing)        -> PostGIS (only PostGIS gives ACID\n#                                                       on geometries).\n#   Need ad-hoc SQL on local files                    -> DuckDB-spatial.\n\n# Anti-pattern:\n#   gpd.read_file('huge.gpkg')  # 80M rows\n# Loads the whole file into RAM; OOMs on most machines. Either move the\n# join to PostGIS / DuckDB, or read by chunks (rows= / bbox= filters,\n# parquet columns, etc.).\n"
                  }
        ],
        tips: [
                  "GeoPandas: best up to ~10M rows on a laptop; great for iteration and sklearn.",
                  "PostGIS: the right pick for multi-user, persistent, indexed spatial workloads.",
                  "DuckDB-spatial: single-binary, parquet-native, blazing for ad-hoc local queries.",
                  "xarray + rioxarray: model n-dimensional rasters (time × bands × y × x) with dask chunking.",
                  "Apache Sedona: distributed (Spark) when the data crosses one-machine bounds."
        ],
        mistake: "Loading an 80M-row GeoPackage with `gpd.read_file` and OOM-ing the laptop. Move the join to PostGIS or DuckDB-spatial, or use bbox/column filters when reading.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
