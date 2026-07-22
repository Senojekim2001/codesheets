---
type: "entry"
domain: "python"
file: "geospatial"
section: "patterns"
id: "geo-stack-decision"
title: "GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack"
category: "patterns"
subtitle: "GeoPandas (in-RAM, ~10M-row sweet spot, sklearn-friendly), PostGIS (server-side, ST_* SQL functions, indexes, multi-user), DuckDB-spatial (single-binary, parquet-native, fast joins), xarray + rioxarray (n-D rasters: time + bands + y + x), Apache Sedona (Spark scale)"
signature_short: "# GeoPandas: gpd.read_file/sjoin\\n# PostGIS: SELECT ST_Intersects(a.geom, b.geom) ...\\n# DuckDB: INSTALL spatial; SELECT ST_Intersects(...) FROM read_parquet(...)\\n# xarray: rioxarray.open_rasterio(..., chunks=\"auto\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack"
  - "geo-stack-decision"
tags:
  - "python"
  - "python/geospatial"
  - "python/geospatial/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack

> GeoPandas (in-RAM, ~10M-row sweet spot, sklearn-friendly), PostGIS (server-side, ST_* SQL functions, indexes, multi-user), DuckDB-spatial (single-binary, parquet-native, fast joins), xarray + rioxarray (n-D rasters: time + bands + y + x), Apache Sedona (Spark scale)

## Overview

GeoPandas is the productivity sweet spot up to ~10M rows on a laptop. Past that, PostGIS gives you server-side spatial joins, R-tree indexes, and multi-user concurrency — but you're writing SQL. DuckDB-spatial reads geoparquet directly and runs `ST_*` functions on it — the right pick for "I have a folder of parquet files and want to spatial-join". xarray + rioxarray turn rasters into n-dimensional labeled arrays — essential for time-series stacks (Sentinel-2 weekly, ERA5 climate). Three depths solve the SAME task — count points per polygon — at depths: GeoPandas sjoin (in-RAM) → PostGIS ST_Intersects (SQL, indexed) → DuckDB-spatial across parquet (single-machine, fast).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Count points per polygon in GeoPandas.
- **Junior** — SAME — count points per polygon — in PostGIS via SQLAlchemy.
- **Senior** — SAME — points-per-polygon — using DuckDB-spatial directly on local geoparquet files. Single binary, no server.

## Signature

```python
# GeoPandas: gpd.read_file/sjoin\n# PostGIS: SELECT ST_Intersects(a.geom, b.geom) ...\n# DuckDB: INSTALL spatial; SELECT ST_Intersects(...) FROM read_parquet(...)\n# xarray: rioxarray.open_rasterio(..., chunks="auto")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Count points per polygon in GeoPandas.
# APPROACH  - sjoin + groupby.
# STRENGTHS - 3 lines; works up to ~10M rows on a laptop.
# WEAKNESSES- Single-machine RAM bound; no concurrency.
import geopandas as gpd

polys  = gpd.read_file("polys.geojson")
points = gpd.read_file("points.geojson")
if points.crs != polys.crs:
    points = points.to_crs(polys.crs)

joined = gpd.sjoin(points, polys, how="inner", predicate="within")
counts = joined.groupby("poly_id").size().rename("n")
print(counts.head())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — count points per polygon — in PostGIS via SQLAlchemy.
# APPROACH  - ST_Intersects against an indexed geom column.
# STRENGTHS - Scales to 100M+ rows; multi-user; persisted state.
# WEAKNESSES- Need a Postgres + PostGIS instance; SQL not Python.
import sqlalchemy as sa

engine = sa.create_engine("postgresql+psycopg://user:pw@host/db")

sql = """
    SELECT
        p.poly_id,
        COUNT(*) AS n
    FROM polygons p
    JOIN points  pt ON ST_Intersects(p.geom, pt.geom)   -- uses GiST index
    GROUP BY p.poly_id
    ORDER BY n DESC
    LIMIT 100;
"""

with engine.connect() as conn:
    rows = conn.execute(sa.text(sql)).all()
for r in rows:
    print(r)

# Required setup (once, by DBA):
#   CREATE EXTENSION postgis;
#   CREATE INDEX ON polygons USING GIST (geom);
#   CREATE INDEX ON points  USING GIST (geom);
# Without GiST indexes the join is O(N*M) and unusable past ~1M rows.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — points-per-polygon — using DuckDB-spatial directly on
#             local geoparquet files. Single binary, no server.
# APPROACH  - INSTALL spatial; ST_Intersects across read_parquet().
# STRENGTHS - One process, no server, queries scale to TB on disk;
#             columnar parquet read is cache-friendly.
# WEAKNESSES- Single-machine; not multi-user; spatial extension is newer
#             than GeoPandas / PostGIS so coverage of ST_* funcs is smaller.
import duckdb


con = duckdb.connect()
con.execute("INSTALL spatial; LOAD spatial;")

# Tell DuckDB which parquet files to treat as spatial.
con.execute("""
    CREATE OR REPLACE VIEW polys AS
    SELECT *, ST_GeomFromWKB(geometry) AS geom
    FROM read_parquet('s3://bucket/polys/*.parquet');

    CREATE OR REPLACE VIEW points AS
    SELECT *, ST_GeomFromWKB(geometry) AS geom
    FROM read_parquet('s3://bucket/points/*.parquet');
""")

result = con.execute("""
    SELECT
        p.poly_id,
        COUNT(*) AS n
    FROM polys  p
    JOIN points pt ON ST_Intersects(p.geom, pt.geom)
    GROUP BY p.poly_id
    ORDER BY n DESC
    LIMIT 100;
""").df()                                              # back to pandas

print(result.head())

# Decision rule:
#   < 10M rows, iterating in a notebook            -> GeoPandas.
#   > 10M rows, one machine, parquet files          -> DuckDB-spatial.
#   > 100M rows, multi-user, persistent             -> PostGIS.
#   Distributed (TB+) batch jobs                     -> Apache Sedona on Spark.
#   Time-series of rasters (Sentinel-2 weekly)       -> xarray + rioxarray + dask
#                                                       (chunks across time + space).
#   Tile-served vector for web maps                   -> tippecanoe -> mbtiles -> tile server.
#   Need transactional writes (collab editing)        -> PostGIS (only PostGIS gives ACID
#                                                       on geometries).
#   Need ad-hoc SQL on local files                    -> DuckDB-spatial.

# Anti-pattern:
#   gpd.read_file('huge.gpkg')  # 80M rows
# Loads the whole file into RAM; OOMs on most machines. Either move the
# join to PostGIS / DuckDB, or read by chunks (rows= / bbox= filters,
# parquet columns, etc.).
```

## Decision Rule

```text
< 10M rows, iterating in a notebook            -> GeoPandas.
> 10M rows, one machine, parquet files          -> DuckDB-spatial.
> 100M rows, multi-user, persistent             -> PostGIS.
Distributed (TB+) batch jobs                     -> Apache Sedona on Spark.
Time-series of rasters (Sentinel-2 weekly)       -> xarray + rioxarray + dask
                                                    (chunks across time + space).
Tile-served vector for web maps                   -> tippecanoe -> mbtiles -> tile server.
Need transactional writes (collab editing)        -> PostGIS (only PostGIS gives ACID
                                                    on geometries).
Need ad-hoc SQL on local files                    -> DuckDB-spatial.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   gpd.read_file('huge.gpkg')  # 80M rows
> Loads the whole file into RAM; OOMs on most machines. Either move the
> join to PostGIS / DuckDB, or read by chunks (rows= / bbox= filters,
> parquet columns, etc.).

## Tips

- GeoPandas: best up to ~10M rows on a laptop; great for iteration and sklearn.
- PostGIS: the right pick for multi-user, persistent, indexed spatial workloads.
- DuckDB-spatial: single-binary, parquet-native, blazing for ad-hoc local queries.
- xarray + rioxarray: model n-dimensional rasters (time × bands × y × x) with dask chunking.
- Apache Sedona: distributed (Spark) when the data crosses one-machine bounds.

## Common Mistake

> [!warning] Loading an 80M-row GeoPackage with `gpd.read_file` and OOM-ing the laptop. Move the join to PostGIS or DuckDB-spatial, or use bbox/column filters when reading.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework (Quantum)]]
- [[Sections/geospatial/patterns/_Index|Geospatial → When to reach for which geo tool]]
- [[Sections/geospatial/_Index|Geospatial index]]
- [[_Index|Vault index]]
