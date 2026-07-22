---
type: "entry"
domain: "python"
file: "data-apps"
section: "streamlit"
id: "streamlit-basics"
title: "Streamlit basics — script-as-app, widgets, layout"
category: "Streamlit"
subtitle: "streamlit run, st.title / write / dataframe / metric, st.selectbox / slider / file_uploader, st.sidebar, st.columns, the rerun model"
signature_short: "streamlit run app.py    # the script reruns on every widget change"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Streamlit basics — script-as-app, widgets, layout"
  - "streamlit-basics"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/streamlit"
  - "category/streamlit"
  - "tier/tiered"
---

# Streamlit basics — script-as-app, widgets, layout

> streamlit run, st.title / write / dataframe / metric, st.selectbox / slider / file_uploader, st.sidebar, st.columns, the rerun model

## Overview

Streamlit's model: every widget interaction (slider, button, selectbox) re-runs the entire script from top to bottom; widgets return their current value; the layout is a function of those values. This is jarring at first — there's no callback model, no event loop, no React-style component tree. The win: a 30-line script becomes a working UI; data-pipeline output becomes interactive in minutes; no JS, no HTML, no CSS for 90% of cases. The three examples solve the SAME concrete task — load a CSV, show summary stats, let the user filter by a column — at three depths: minimal `st.dataframe` + `selectbox` → sidebar layout + metrics + file uploader → production with theming, multi-column layout, performance tuning, and when to leave Streamlit.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load a CSV; show summary stats; filter by a column.
- **Junior** — SAME — but cache the CSV load, use sidebar for controls, show metrics in columns, accept user-uploaded CSVs.
- **Senior** — SAME — production: theming via .streamlit/config.toml, st.fragment for partial reruns (Streamlit 1.33+), error boundaries, query-param-driven deep links, when Streamlit's model becomes a problem.

## Signature

```python
streamlit run app.py    # the script reruns on every widget change
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load a CSV; show summary stats; filter by a column.
# APPROACH  - Read the CSV at module load; st.selectbox returns the
#             chosen value; filter pandas DataFrame; render.
# STRENGTHS - 15-line dashboard; live in 30 seconds via streamlit run.
# WEAKNESSES- CSV reloads on every interaction; no caching yet.
import pandas as pd
import streamlit as st

st.title("Sales dashboard")

# CSV load runs on EVERY rerun (every widget change).
df = pd.read_csv("sales.csv")

# Filter widget — returns the chosen value on every rerun.
region = st.selectbox("Region", options=["All"] + sorted(df["region"].unique().tolist()))

if region != "All":
    df = df[df["region"] == region]

st.write(f"**{len(df):,}** rows after filter")
st.dataframe(df.head(100))
st.bar_chart(df.groupby("category")["amount"].sum())

# Run:
#   $ pip install streamlit pandas
#   $ streamlit run app.py
# Opens browser at http://localhost:8501.
#
# Key insight: every widget interaction reruns the WHOLE script.
# That's why CSV reload is the next thing to fix (junior tier).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but cache the CSV load, use sidebar for controls,
#             show metrics in columns, accept user-uploaded CSVs.
# APPROACH  - @st.cache_data on the loader; st.sidebar context for
#             control panel; st.columns for side-by-side metrics.
# STRENGTHS- File loaded once; UI feels snappy on widget changes;
#             accepts a user upload as input.
import pandas as pd
import streamlit as st

st.set_page_config(page_title="Sales dashboard", layout="wide")
st.title("Sales dashboard")

# === Cached data load — runs ONCE per unique input ===
@st.cache_data
def load_csv(path_or_buffer) -> pd.DataFrame:
    return pd.read_csv(path_or_buffer)

# === Sidebar controls ===
with st.sidebar:
    st.header("Filters")
    uploaded = st.file_uploader("Upload CSV", type=["csv"])
    region   = st.selectbox("Region", ["All", "us", "eu", "apac"])
    min_amt  = st.slider("Min amount ($)", 0, 10_000, 0, step=100)

# === Main pane ===
if uploaded is None:
    st.info("Upload a CSV in the sidebar to begin.")
    st.stop()                                          # halt rendering below

df = load_csv(uploaded)
if region != "All":
    df = df[df["region"] == region]
df = df[df["amount"] >= min_amt]

# Metrics in three columns.
col_a, col_b, col_c = st.columns(3)
col_a.metric("Rows",        f"{len(df):,}")
col_b.metric("Revenue",     f"${df['amount'].sum():,.0f}")
col_c.metric("Avg order",   f"${df['amount'].mean():.2f}")

# Tabs for sections.
tab_data, tab_chart = st.tabs(["Data", "Charts"])
with tab_data:
    st.dataframe(df, use_container_width=True)
with tab_chart:
    st.bar_chart(df.groupby("category")["amount"].sum())
    st.line_chart(df.groupby("date")["amount"].sum())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: theming via .streamlit/config.toml,
#             st.fragment for partial reruns (Streamlit 1.33+),
#             error boundaries, query-param-driven deep links, when
#             Streamlit's model becomes a problem.
# APPROACH  - st.fragment scopes a rerun to one section; query_params
#             persist filter state in URL; ErrorBoundary swallows
#             exceptions in a section without crashing the page.
# STRENGTHS - Heavy charts don't rerun on unrelated widget changes;
#             URLs are deep-linkable; one bad cell doesn't blank the page.
# WEAKNESSES- Streamlit's per-session statefulness limits horizontal
#             scaling — see deployment entry for the workarounds.
import pandas as pd
import streamlit as st
from contextlib import contextmanager

st.set_page_config(
    page_title="Sales dashboard",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# === Theming via .streamlit/config.toml ===
# [theme]
# base="dark"
# primaryColor="#5cf"
# backgroundColor="#0e1117"

# === Cached load ===
@st.cache_data(ttl=300, show_spinner="Loading sales data...")
def load_csv(path_or_buffer) -> pd.DataFrame:
    return pd.read_csv(path_or_buffer)

# === Error boundary ===
@contextmanager
def error_boundary(name: str):
    try:
        yield
    except Exception as e:
        st.error(f"**{name} failed:** {type(e).__name__}: {e}")
        with st.expander("Traceback"):
            import traceback
            st.code(traceback.format_exc())

# === Query-param state — URL deep-linking ===
qp = st.query_params
default_region = qp.get("region", "All")
default_min    = int(qp.get("min_amt", "0"))

with st.sidebar:
    st.header("Filters")
    uploaded = st.file_uploader("Upload CSV", type=["csv"])
    region   = st.selectbox(
        "Region", ["All", "us", "eu", "apac"],
        index=["All", "us", "eu", "apac"].index(default_region),
    )
    min_amt  = st.slider("Min amount ($)", 0, 10_000, default_min, step=100)

# Persist filters in URL.
st.query_params["region"]  = region
st.query_params["min_amt"] = str(min_amt)

if uploaded is None:
    st.info("Upload a CSV to begin.")
    st.stop()

df = load_csv(uploaded)
if region != "All":
    df = df[df["region"] == region]
df = df[df["amount"] >= min_amt]

# === Fragments (Streamlit 1.33+): partial reruns ===
@st.fragment
def chart_panel(df: pd.DataFrame):
    """This block reruns ONLY when widgets inside it change."""
    chart_type = st.radio("Chart type", ["bar", "line"], horizontal=True)
    if chart_type == "bar":
        st.bar_chart(df.groupby("category")["amount"].sum())
    else:
        st.line_chart(df.groupby("date")["amount"].sum())

with error_boundary("Charts"):
    chart_panel(df)

with error_boundary("Data table"):
    st.dataframe(df, use_container_width=True, height=400)

# Decision rule:
#   internal dashboard, <2 weeks       -> Streamlit
#   ML demo, share via URL              -> Gradio
#   complex callback chains, prod UX    -> Dash (next entries)
#   per-user persistent state           -> Streamlit OK; mind sticky sessions in deployment
#   multi-tenant SaaS                   -> NOT Streamlit; build a real frontend
#   need cell-level reactive logic     -> st.fragment for partial reruns
#   share state across browser tabs    -> NOT in Streamlit; URL params + backend
#   100k+ row tables                    -> AgGrid component; native st.dataframe is fine to ~10k
#   real-time streaming                 -> st.write_stream + generator (LLM-style)
#   deep links                          -> st.query_params (read + write)
#   theming                             -> .streamlit/config.toml [theme]
#   logged-in users                      -> reverse proxy auth (multipage-auth entry)
#
# Anti-pattern: doing expensive work outside @st.cache_data. EVERY
# widget interaction reruns the script top-to-bottom; uncached
# DB queries, file reads, or model loads run on every keystroke. Wrap
# all expensive operations in @st.cache_data (for serializable
# results) or @st.cache_resource (for live connections).
```

## Decision Rule

```text
internal dashboard, <2 weeks       -> Streamlit
ML demo, share via URL              -> Gradio
complex callback chains, prod UX    -> Dash (next entries)
per-user persistent state           -> Streamlit OK; mind sticky sessions in deployment
multi-tenant SaaS                   -> NOT Streamlit; build a real frontend
need cell-level reactive logic     -> st.fragment for partial reruns
share state across browser tabs    -> NOT in Streamlit; URL params + backend
100k+ row tables                    -> AgGrid component; native st.dataframe is fine to ~10k
real-time streaming                 -> st.write_stream + generator (LLM-style)
deep links                          -> st.query_params (read + write)
theming                             -> .streamlit/config.toml [theme]
logged-in users                      -> reverse proxy auth (multipage-auth entry)
```

## Anti-Pattern

> [!warning] Anti-pattern
> doing expensive work outside @st.cache_data. EVERY
> widget interaction reruns the script top-to-bottom; uncached
> DB queries, file reads, or model loads run on every keystroke. Wrap
> all expensive operations in @st.cache_data (for serializable
> results) or @st.cache_resource (for live connections).

## Tips

- Streamlit reruns the WHOLE script on every widget change. Wrap expensive operations in `@st.cache_data` (for serializable returns) or `@st.cache_resource` (for live connections like DB pools).
- `st.set_page_config(layout="wide")` is essential for dashboards — default centered layout wastes ~40% of screen.
- `st.fragment` (1.33+) scopes a rerun to one section. A widget inside the fragment only reruns the fragment, not the whole page — critical for heavy charts.
- `st.query_params` (read + write) makes filter state deep-linkable. Users can bookmark `?region=us&min_amt=500` and land on the filtered view.
- For >10k row tables, native `st.dataframe` slows down. Use `streamlit-aggrid` for pivot/group/sort UX at scale.
- Use `st.stop()` to halt rendering when prerequisites are missing. Cleaner than wrapping the rest of the script in `if condition:`.

## Common Mistake

> [!warning] Doing expensive work outside `@st.cache_data`. Every widget interaction reruns the entire script top-to-bottom; uncached DB queries, large CSV reads, or model loads run on every keystroke. The UI feels broken (10s response per slider tick). Wrap all expensive ops in `@st.cache_data` or `@st.cache_resource`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Reads CSV on every rerun (every keystroke)
df = pd.read_csv("big.csv")
```

**Senior:**
```python
# Cached: loaded once, reused
@st.cache_data
def load(): return pd.read_csv("big.csv")
df = load()
```

## See Also

- [[Sections/data-apps/streamlit/streamlit-state|Streamlit state — session_state, callbacks, forms (Data Apps)]]
- [[Sections/data-apps/streamlit/streamlit-data-flow|Streamlit caching — cache_data, cache_resource, downloads (Data Apps)]]
- [[Sections/data-apps/streamlit/_Index|Data Apps → Streamlit — dashboards, state, caching]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
