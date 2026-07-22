---
type: "entry"
domain: "python"
file: "data-apps"
section: "streamlit"
id: "streamlit-data-flow"
title: "Streamlit caching — cache_data, cache_resource, downloads"
category: "Streamlit"
subtitle: "@st.cache_data, @st.cache_resource, ttl, max_entries, hash_funcs, st.spinner, st.progress, st.download_button, async data loading"
signature_short: "@st.cache_data(ttl=300, max_entries=10) def load(uid: int) -> pd.DataFrame: ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Streamlit caching — cache_data, cache_resource, downloads"
  - "streamlit-data-flow"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/streamlit"
  - "category/streamlit"
  - "tier/tiered"
---

# Streamlit caching — cache_data, cache_resource, downloads

> @st.cache_data, @st.cache_resource, ttl, max_entries, hash_funcs, st.spinner, st.progress, st.download_button, async data loading

## Overview

Streamlit's rerun model means EVERY interaction re-executes the script. Without caching, an expensive query runs on every keystroke. Two decorators: `@st.cache_data` for functions returning SERIALIZABLE values (DataFrames, lists, numpy arrays — Streamlit pickles + dedupes) and `@st.cache_resource` for SHARED RESOURCES (DB connections, ML models — one instance for all sessions). Choose by what the function returns: data → cache_data; live object → cache_resource. The three examples solve the SAME concrete task — compute an expensive aggregation per uploaded file; show progress; let user download — at three depths: `@st.cache_data` + `st.download_button` → TTL, `max_entries`, `st.cache_resource` for DB pools → production with Redis-backed cache, async loading, `hash_funcs` for unhashable args.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Compute an expensive aggregation per upload; show progress; let user download the result.
- **Junior** — SAME — but cache with TTL + bounded entries; use cache_resource for the DB pool; progress bar for chunked work; show cache stats.
- **Senior** — SAME — production: Redis-backed cache for cross-session dedup, async data loading, hash_funcs for unhashable args, when to invalidate.

## Signature

```python
@st.cache_data(ttl=300, max_entries=10) def load(uid: int) -> pd.DataFrame: ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Compute an expensive aggregation per upload; show
#             progress; let user download the result.
import streamlit as st
import pandas as pd
import time

@st.cache_data
def aggregate(df: pd.DataFrame) -> pd.DataFrame:
    time.sleep(2)                                      # simulate slow op
    return df.groupby("category")["amount"].agg(["sum", "mean", "count"]).reset_index()

uploaded = st.file_uploader("Upload CSV", type=["csv"])
if uploaded:
    df = pd.read_csv(uploaded)
    with st.spinner("Aggregating..."):
        result = aggregate(df)
    st.dataframe(result)
    st.download_button(
        label="Download CSV",
        data=result.to_csv(index=False),
        file_name="aggregate.csv",
        mime="text/csv",
    )
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but cache with TTL + bounded entries; use
#             cache_resource for the DB pool; progress bar for chunked
#             work; show cache stats.
import streamlit as st
import pandas as pd
import sqlalchemy as sa
import time
from io import BytesIO

# === cache_resource: shared across ALL sessions; one DB pool ===
@st.cache_resource
def get_engine():
    return sa.create_engine("postgresql+psycopg://app:secret@db/app",
                            pool_size=5, pool_pre_ping=True)

# === cache_data: per-input; serializable returns ===
@st.cache_data(ttl=300, max_entries=10, show_spinner="Loading...")
def query_users(role: str) -> pd.DataFrame:
    engine = get_engine()                              # cached_resource: shared
    with engine.connect() as conn:
        return pd.read_sql(
            "SELECT id, name, email, created_at FROM users WHERE role = :r",
            conn, params={"r": role},
        )

@st.cache_data(ttl=600, show_spinner=False)
def aggregate_chunked(df: pd.DataFrame) -> pd.DataFrame:
    """Chunked agg with progress feedback."""
    progress = st.progress(0, text="Processing...")
    chunks = []
    n = max(1, len(df) // 10)
    for i in range(0, len(df), n):
        chunk = df.iloc[i:i + n]
        chunks.append(chunk.groupby("category")["amount"].sum())
        progress.progress(min(1.0, (i + n) / len(df)), f"{(i+n)/len(df):.0%}")
        time.sleep(0.05)
    progress.empty()
    return pd.concat(chunks).groupby(level=0).sum().reset_index()

# === UI ===
st.title("User report")
role = st.sidebar.selectbox("Role", ["viewer", "editor", "admin"])

users_df = query_users(role)
st.metric("Users", len(users_df))
st.dataframe(users_df, use_container_width=True)

# Excel download (binary).
buf = BytesIO()
with pd.ExcelWriter(buf, engine="openpyxl") as writer:
    users_df.to_excel(writer, sheet_name="Users", index=False)

st.download_button(
    "Download Excel",
    data=buf.getvalue(),
    file_name=f"users_{role}.xlsx",
    mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
)

# Cache management — useful for "force refresh" buttons.
if st.button("Clear cache"):
    st.cache_data.clear()
    st.rerun()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: Redis-backed cache for cross-session
#             dedup, async data loading, hash_funcs for unhashable
#             args, when to invalidate.
import streamlit as st
import pandas as pd
import asyncio, hashlib, json, time
from io import BytesIO
import redis

# === Cross-session cache via Redis ===
# st.cache_data is per-process; a 5-replica deployment caches 5 times.
# For shared cache, wrap a Redis layer.
r = redis.Redis.from_url("redis://localhost:6379/0", decode_responses=False)

def redis_cached(*, key_prefix: str, ttl: int = 300):
    """Wrap a function with Redis-backed cache. Falls back to call on Redis error."""
    def deco(fn):
        def wrapper(*args, **kwargs):
            cache_key = f"st:{key_prefix}:" + hashlib.sha256(
                json.dumps([args, kwargs], default=str, sort_keys=True).encode()
            ).hexdigest()[:16]
            try:
                cached = r.get(cache_key)
                if cached:
                    import pickle
                    return pickle.loads(cached)
            except redis.RedisError:
                pass
            result = fn(*args, **kwargs)
            try:
                import pickle
                r.set(cache_key, pickle.dumps(result), ex=ttl)
            except redis.RedisError:
                pass
            return result
        return wrapper
    return deco

@st.cache_data(ttl=300)
@redis_cached(key_prefix="users", ttl=300)
def load_users(role: str) -> pd.DataFrame:
    # Two-tier cache: local @st.cache_data for in-process; Redis for cross-replica.
    return _slow_db_query(role)

def _slow_db_query(role: str) -> pd.DataFrame: ...

# === Custom hash for unhashable args ===
class Filters:
    def __init__(self, region: str, since: str): self.region, self.since = region, since

@st.cache_data(hash_funcs={Filters: lambda f: (f.region, f.since)})
def load_filtered(filters: Filters) -> pd.DataFrame: ...

# === Async data loading — Streamlit doesn't natively support async ===
def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            return asyncio.ensure_future(coro)
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)

@st.cache_data
def load_from_api():
    async def _go():
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get("https://api.example.com/data")
            return resp.json()
    return run_async(_go())

# Decision rule:
#   serializable return (DF, list, np)  -> @st.cache_data
#   live object (DB pool, ML model)     -> @st.cache_resource
#   per-input dedup                      -> @st.cache_data; key by args
#   global singleton                      -> @st.cache_resource (shared across sessions)
#   want TTL                              -> ttl=N seconds
#   bounded memory                        -> max_entries=N
#   force re-fetch                        -> .clear() OR caller passes a "version" arg
#   unhashable args                       -> hash_funcs={MyType: lambda x: x.id}
#   async function                        -> wrap in run_until_complete inside @st.cache_data
#   cross-replica dedup                   -> Redis cache layer above @st.cache_data
#   model loading                         -> @st.cache_resource (one model per process)
#   download a DataFrame                 -> df.to_csv(index=False) -> bytes -> st.download_button
#
# Anti-pattern: @st.cache_data on a function returning a DB connection
# or live model object. cache_data PICKLES the return value; pickle
# of a connection serializes the connection state, which doesn't
# unpickle to a working connection. Use @st.cache_resource for live
# objects (it stores by reference, no pickle).
```

## Decision Rule

```text
serializable return (DF, list, np)  -> @st.cache_data
live object (DB pool, ML model)     -> @st.cache_resource
per-input dedup                      -> @st.cache_data; key by args
global singleton                      -> @st.cache_resource (shared across sessions)
want TTL                              -> ttl=N seconds
bounded memory                        -> max_entries=N
force re-fetch                        -> .clear() OR caller passes a "version" arg
unhashable args                       -> hash_funcs={MyType: lambda x: x.id}
async function                        -> wrap in run_until_complete inside @st.cache_data
cross-replica dedup                   -> Redis cache layer above @st.cache_data
model loading                         -> @st.cache_resource (one model per process)
download a DataFrame                 -> df.to_csv(index=False) -> bytes -> st.download_button
```

## Anti-Pattern

> [!warning] Anti-pattern
> @st.cache_data on a function returning a DB connection
> or live model object. cache_data PICKLES the return value; pickle
> of a connection serializes the connection state, which doesn't
> unpickle to a working connection. Use @st.cache_resource for live
> objects (it stores by reference, no pickle).

## Tips

- Choose decorator by return type: serializable (DataFrame, dict, list, np.ndarray) → `@st.cache_data`; live object (DB connection, ML model, file handle) → `@st.cache_resource`.
- Set `ttl=N` on `@st.cache_data` for time-bound caches. Pair with `max_entries=N` so memory is bounded.
- `show_spinner="Loading..."` argument shows a spinner during the cached call; users get feedback for slow first-runs.
- For unhashable args (custom classes), pass `hash_funcs={MyType: lambda x: x.id}` so cache_data knows how to key on them.
- Streamlit doesn't natively support async. Wrap async work in `asyncio.run()` (or use a helper that handles event-loop-already-running).
- For multi-replica deployments, `@st.cache_data` is per-process — your 5 replicas cache 5 times. Add a Redis layer for shared cache.

## Common Mistake

> [!warning] `@st.cache_data` on a function returning a DB connection or ML model. cache_data PICKLES the return value; pickling a connection serializes its state, which doesn't unpickle to a working connection (you'll get cryptic "connection closed" errors at second use). Use `@st.cache_resource` for any live object.

## Shorthand (Junior → Senior)

**Junior:**
```python
# cache_data on a connection — pickle round-trip breaks it
@st.cache_data
def get_engine(): return create_engine(URL)
```

**Senior:**
```python
# cache_resource — stored by reference, not pickled
@st.cache_resource
def get_engine(): return create_engine(URL)
```

## See Also

- [[Sections/data-apps/streamlit/streamlit-basics|Streamlit basics — script-as-app, widgets, layout (Data Apps)]]
- [[Sections/data-apps/streamlit/streamlit-state|Streamlit state — session_state, callbacks, forms (Data Apps)]]
- [[Sections/data-apps/streamlit/_Index|Data Apps → Streamlit — dashboards, state, caching]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
