---
type: "entry"
domain: "python"
file: "data-engineering"
section: "etl-patterns"
id: "etl-extract"
title: "ETL: Extract — Reading from Multiple Sources"
category: "ETL"
subtitle: "CSV, JSON, Parquet, SQL read patterns, API pagination, cloud storage (S3, GCS)"
signature_short: "pd.read_csv()  |  spark.read.csv()  |  requests.get()  |  boto3.client(\"s3\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "ETL: Extract — Reading from Multiple Sources"
  - "etl-extract"
tags:
  - "python"
  - "python/data-engineering"
  - "python/data-engineering/etl-patterns"
  - "category/etl"
  - "tier/tiered"
---

# ETL: Extract — Reading from Multiple Sources

> CSV, JSON, Parquet, SQL read patterns, API pagination, cloud storage (S3, GCS)

## Overview

Extraction is the first ETL stage — reading data from diverse sources into memory/DataFrames. Batch sources: CSV, JSON, Parquet files (local or cloud storage). Real-time: SQL databases (incremental queries), APIs (with pagination), message queues. Handle authentication, retry logic, and incremental loads (only new/changed data since last run).

## Signature

```python
pd.read_csv()  |  spark.read.csv()  |  requests.get()  |  boto3.client("s3")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The three readers you'll use first: CSV, JSON, Parquet
# STRENGTHS - One pandas line per source format
# WEAKNESSES- No remote sources, no error handling, no incremental logic
#
import pandas as pd

df_csv     = pd.read_csv("data/sales.csv")
df_json    = pd.read_json("data/events.json", lines=True)   # newline-delimited JSON
df_parquet = pd.read_parquet("data/sales.parquet")          # types preserved
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - SQL incremental, paginated API with timeouts, S3 globbed reads
# STRENGTHS - The three remote-source patterns most pipelines need
# WEAKNESSES- No retries with exponential backoff, no idempotent watermark
#
from datetime import datetime, timedelta
import pandas as pd
import requests
import sqlalchemy as sa

# 1) SQL incremental — pull only rows changed since last run
engine = sa.create_engine("postgresql://user:pass@host/db")
last_run = datetime.utcnow() - timedelta(days=1)

# Use parameter binding, not f-string interpolation (SQL injection risk)
df = pd.read_sql(
    sa.text("SELECT * FROM raw_sales WHERE updated_at > :since"),
    engine,
    params={"since": last_run},
)

# 2) Paginated API with a timeout
def fetch_paginated(url: str, page_size: int = 100):
    out, page = [], 1
    while True:
        r = requests.get(url, params={"page": page, "limit": page_size}, timeout=10)
        r.raise_for_status()
        body = r.json()
        if not body:
            break
        out.extend(body)
        page += 1
    return out

orders = pd.DataFrame(fetch_paginated("https://api.example.com/orders"))

# 3) Cloud storage — Pandas reads s3:// directly when fsspec/s3fs is installed
df_s3 = pd.read_parquet("s3://my-bucket/sales/2024-*.parquet")  # globbing built in
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Watermark-based incremental, retry/backoff, streaming downloads, schema enforcement
# STRENGTHS - The hardening that turns "extract" from fragile to repeatable
# WEAKNESSES- N/A
#
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
import pandas as pd
import requests
import sqlalchemy as sa

# 1) Watermark stored on disk — survives restarts; pipelines stay idempotent
WATERMARK = Path("/var/etl/sales.watermark")

@contextmanager
def watermark_window():
    last = datetime.fromisoformat(WATERMARK.read_text()) if WATERMARK.exists() else datetime(1970, 1, 1, tzinfo=timezone.utc)
    new_high = datetime.now(timezone.utc)
    yield last, new_high
    # ONLY advance the watermark if the load below succeeded
    WATERMARK.write_text(new_high.isoformat())

with watermark_window() as (since, until):
    df = pd.read_sql(
        sa.text("SELECT * FROM raw_sales WHERE updated_at > :since AND updated_at <= :until"),
        engine, params={"since": since, "until": until},
    )
    # ... transform + load ...

# 2) Robust HTTP — retry with exponential backoff via urllib3
from urllib3.util import Retry
from requests.adapters import HTTPAdapter

def http():
    s = requests.Session()
    s.mount("https://", HTTPAdapter(max_retries=Retry(
        total=5, backoff_factor=0.5,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "POST"],
    )))
    return s

# 3) Streaming downloads — never materialize a 5 GB body in memory
def stream_to_parquet(url: str, out: str):
    with http().get(url, stream=True, timeout=60) as r:
        r.raise_for_status()
        with open(out, "wb") as f:
            for chunk in r.iter_content(chunk_size=1024 * 1024):
                f.write(chunk)
    return pd.read_parquet(out)

# 4) Schema-enforced read — fail loud on a column or dtype regression
import pandera as pa
from pandera.typing import DataFrame, Series

class RawSalesSchema(pa.DataFrameModel):
    order_id:    Series[str]
    customer_id: Series[int]   = pa.Field(gt=0)
    amount:      Series[float] = pa.Field(gt=0)
    updated_at:  Series[pa.DateTime]

    class Config:
        coerce = True
        strict = True

@pa.check_types
def extract_sales(since: datetime) -> DataFrame[RawSalesSchema]:
    return pd.read_sql(
        sa.text("SELECT * FROM raw_sales WHERE updated_at > :since"),
        engine, params={"since": since},
    )

# Decision rule:
#   small static file, local                -> pd.read_csv / pd.read_parquet
#   periodic SQL pull                         -> incremental WHERE updated_at > :since
#   API with pagination                        -> Session with Retry + timeout
#   cloud lake (S3 / GCS / ADLS)               -> Parquet glob via fsspec
#   data > driver RAM                          -> stream to disk, then read in chunks
#   need idempotent re-runs                     -> on-disk watermark, advance ONLY on success
#   schema must not regress                    -> Pandera @check_types at the boundary
#
# Anti-pattern: f-string SQL interpolation
#   query = f"SELECT * FROM sales WHERE region = '{user}'"   # SQL injection
#   Use sa.text() with bound :params — it parameterizes the query at the driver.

engine = None
```

## Decision Rule

```text
small static file, local                -> pd.read_csv / pd.read_parquet
periodic SQL pull                         -> incremental WHERE updated_at > :since
API with pagination                        -> Session with Retry + timeout
cloud lake (S3 / GCS / ADLS)               -> Parquet glob via fsspec
data > driver RAM                          -> stream to disk, then read in chunks
need idempotent re-runs                     -> on-disk watermark, advance ONLY on success
schema must not regress                    -> Pandera @check_types at the boundary
```

## Anti-Pattern

> [!warning] Anti-pattern
> f-string SQL interpolation
>   query = f"SELECT * FROM sales WHERE region = '{user}'"   # SQL injection
>   Use sa.text() with bound :params — it parameterizes the query at the driver.

## Tips

- For large files, use Parquet (compressed, preserves types) over CSV (uncompressed, loses schema).
- Implement incremental extraction (only new/changed data) to reduce data transfer and processing time.
- Use retry logic and timeouts for APIs and remote sources — transient failures are common.
- Always validate extracted data counts and schema before transformation — catch bad data early.

## Common Mistake

> [!warning] Reading entire remote tables without incremental logic — wastes bandwidth and processing. Always query only new data since last run.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
engine = create_engine("postgresql://...")
query = "SELECT * FROM sales WHERE date > '2024-01-01'"
df = pd.read_sql(query, engine)
```

**Senior:**
```python
df = pd.read_sql("SELECT * FROM sales WHERE date > '2024-01-01'", engine)
```

## See Also

- [[Sections/data-engineering/etl-patterns/etl-transform|ETL: Transform — Cleaning & Standardizing Data (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/etl-load|ETL: Load — Writing to Warehouse & Cloud (Data Engineering)]]
- [[Sections/data-engineering/etl-patterns/_Index|Data Engineering → ETL & Pipeline Patterns]]
- [[Sections/data-engineering/_Index|Data Engineering index]]
- [[_Index|Vault index]]
