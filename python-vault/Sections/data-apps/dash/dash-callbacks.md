---
type: "entry"
domain: "python"
file: "data-apps"
section: "dash"
id: "dash-callbacks"
title: "Dash callbacks — Input/Output/State, chains, pattern-matching"
category: "Dash"
subtitle: "@callback Input/Output/State, prevent_initial_call, ctx.triggered_id, MATCH/ALL pattern matching, clientside_callback, background callbacks"
signature_short: "@callback(Output(\"graph\", \"figure\"), Input(\"dropdown\", \"value\"))
def update_graph(value): return px.bar(...)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dash callbacks — Input/Output/State, chains, pattern-matching"
  - "dash-callbacks"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/dash"
  - "category/dash"
  - "tier/tiered"
---

# Dash callbacks — Input/Output/State, chains, pattern-matching

> @callback Input/Output/State, prevent_initial_call, ctx.triggered_id, MATCH/ALL pattern matching, clientside_callback, background callbacks

## Overview

Dash apps declare a layout (a tree of components) and callbacks (functions that map `Input`s to `Output`s). When an Input changes, Dash invokes the callback and updates the matching Output. No rerun-the-whole-script — only callbacks whose Inputs changed fire. The model is more verbose than Streamlit but better for complex callback chains, dynamic UIs, and apps that need to scale to many users (no per-session statefulness in the script). The three examples solve the SAME concrete task — dropdown picks a region; chart updates; selection in chart triggers a detail panel — at three depths: basic Input/Output → chains + State (read-without-trigger) + `prevent_initial_call` → pattern-matching for dynamic UIs + background callbacks for slow work.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Dropdown picks a region; bar chart updates.
- **Junior** — SAME — but with a chained callback (chart selection drives a detail panel), State for read-without-trigger, and prevent_initial_call for tidy startup.
- **Senior** — SAME — production: pattern-matching callbacks for dynamic N filters, background callbacks for slow queries via DiskCache, clientside_callback for snappy UI updates.

## Signature

```python
@callback(Output("graph", "figure"), Input("dropdown", "value"))
def update_graph(value): return px.bar(...)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Dropdown picks a region; bar chart updates.
import dash
from dash import dcc, html, Input, Output, callback
import pandas as pd
import plotly.express as px

df = pd.read_csv("sales.csv")

app = dash.Dash(__name__)
app.layout = html.Div([
    html.H1("Sales by category"),
    dcc.Dropdown(
        id="region",
        options=[{"label": r, "value": r} for r in sorted(df["region"].unique())],
        value="us",
    ),
    dcc.Graph(id="chart"),
])

@callback(Output("chart", "figure"), Input("region", "value"))
def update_chart(region: str):
    sub = df[df["region"] == region]
    return px.bar(sub.groupby("category")["amount"].sum().reset_index(),
                  x="category", y="amount")

if __name__ == "__main__":
    app.run(debug=True)
# Run: $ python app.py  → http://localhost:8050
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with a chained callback (chart selection
#             drives a detail panel), State for read-without-trigger,
#             and prevent_initial_call for tidy startup.
import dash
from dash import dcc, html, Input, Output, State, callback, ctx
import pandas as pd
import plotly.express as px

df = pd.read_csv("sales.csv")

app = dash.Dash(__name__)
app.layout = html.Div([
    html.H1("Sales explorer"),
    html.Div([
        dcc.Dropdown(id="region",
                     options=[{"label": r, "value": r} for r in sorted(df["region"].unique())],
                     value="us"),
        dcc.RangeSlider(id="amt-range", min=0, max=10_000, step=100, value=[0, 10_000]),
    ], style={"display": "flex", "gap": "1rem"}),
    dcc.Graph(id="chart"),
    html.Div(id="detail-panel"),
    dcc.Store(id="filters-state"),                     # client-side store for cross-callback state
])

# Callback 1: filters → store + chart.
@callback(
    Output("chart", "figure"),
    Output("filters-state", "data"),
    Input("region", "value"),
    Input("amt-range", "value"),
)
def update_chart(region, amt_range):
    lo, hi = amt_range
    sub = df[(df["region"] == region) & (df["amount"].between(lo, hi))]
    fig = px.bar(sub.groupby("category")["amount"].sum().reset_index(),
                 x="category", y="amount")
    fig.update_layout(clickmode="event+select")
    return fig, {"region": region, "lo": lo, "hi": hi}

# Callback 2: chart click → detail panel; uses State (no trigger).
@callback(
    Output("detail-panel", "children"),
    Input("chart", "clickData"),
    State("filters-state", "data"),
    prevent_initial_call=True,                         # don't fire on page load
)
def show_detail(click_data, filters):
    if not click_data:
        return "Click a bar to see details."
    category = click_data["points"][0]["x"]
    sub = df[(df["region"] == filters["region"]) & (df["category"] == category)]
    return html.Table([
        html.Tr([html.Th("Order"), html.Th("Amount")]),
        *[html.Tr([html.Td(r.id), html.Td(f"${r.amount:.0f}")]) for r in sub.head(10).itertuples()],
    ])

if __name__ == "__main__":
    app.run(debug=True)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: pattern-matching callbacks for dynamic
#             N filters, background callbacks for slow queries via
#             DiskCache, clientside_callback for snappy UI updates.
import dash
from dash import dcc, html, Input, Output, State, callback, ALL, MATCH, ctx
from dash.long_callback import DiskcacheLongCallbackManager
import diskcache
import pandas as pd
import plotly.express as px
import time

# === Long-callback manager (background work) ===
cache = diskcache.Cache("./.dash-cache")
long_cb_manager = DiskcacheLongCallbackManager(cache)

app = dash.Dash(__name__, long_callback_manager=long_cb_manager)

# === Pattern-matching IDs ===
# Dynamically-added filter rows have IDs like {"type": "filter", "index": N}
app.layout = html.Div([
    html.H1("Dynamic filters"),
    html.Button("Add filter", id="add-filter"),
    html.Div(id="filter-rows", children=[]),
    dcc.Graph(id="result-chart"),
    html.Button("Run report", id="run-report"),
    html.Div(id="report-status"),
])

# Add filter row dynamically.
@callback(
    Output("filter-rows", "children"),
    Input("add-filter", "n_clicks"),
    State("filter-rows", "children"),
    prevent_initial_call=True,
)
def add_filter_row(_n, existing):
    idx = len(existing or [])
    return (existing or []) + [
        html.Div([
            dcc.Dropdown(
                id={"type": "filter-field", "index": idx},
                options=[{"label": c, "value": c} for c in ["region", "category", "amount"]],
            ),
            dcc.Input(
                id={"type": "filter-value", "index": idx},
                placeholder="value",
            ),
        ], style={"display": "flex", "gap": "1rem"})
    ]

# Pattern-matching callback: gathers ALL filter rows.
@callback(
    Output("result-chart", "figure"),
    Input({"type": "filter-field", "index": ALL}, "value"),
    Input({"type": "filter-value", "index": ALL}, "value"),
)
def update_with_dynamic_filters(fields, values):
    df = pd.read_csv("sales.csv")
    for field, value in zip(fields or [], values or []):
        if field and value:
            df = df[df[field].astype(str) == str(value)]
    return px.bar(df.groupby("category")["amount"].sum().reset_index(),
                  x="category", y="amount")

# === Long callback (background) for slow report ===
@callback(
    output=Output("report-status", "children"),
    inputs=Input("run-report", "n_clicks"),
    background=True,
    manager=long_cb_manager,
    running=[
        (Output("run-report", "disabled"), True, False),
    ],
    progress=Output("report-status", "children"),
    prevent_initial_call=True,
)
def run_report(set_progress, _n):
    for i in range(10):
        time.sleep(0.5)
        set_progress(f"Processing... {(i+1)*10}%")
    return "Report complete!"

# === Clientside callback — runs in browser, zero server round-trip ===
app.clientside_callback(
    "function(value) { return value ? 'Selected: ' + value : 'Nothing selected'; }",
    Output("display-clientside", "children"),
    Input("dropdown-clientside", "value"),
)

# Decision rule:
#   simple input -> output                -> @callback Input/Output
#   read state without triggering         -> State()
#   chained callbacks                      -> chain Outputs to next Inputs
#   dynamic N filters/charts              -> pattern-matching IDs + ALL/MATCH
#   slow operation (>2s)                  -> background=True with long_callback_manager
#   snappy UI tweaks                      -> clientside_callback (browser JS)
#   prevent on page load                   -> prevent_initial_call=True
#   "which input fired?"                   -> ctx.triggered_id
#   "all callbacks at once" pattern        -> use one callback with multiple Outputs
#   share state across callbacks          -> dcc.Store (browser-side) OR url query
#   horizontal scaling                     -> Dash is stateless per request; scales freely
#   multi-page                              -> dash.register_page + use_pages=True
#
# Anti-pattern: writing to a global Python variable from inside a
# callback. Dash workers may serve different requests on different
# threads/processes; global mutation = race conditions and
# cross-user data leaks. Use dcc.Store (browser-side state),
# pass values through the callback graph, or persist to a
# real backend.
```

## Decision Rule

```text
simple input -> output                -> @callback Input/Output
read state without triggering         -> State()
chained callbacks                      -> chain Outputs to next Inputs
dynamic N filters/charts              -> pattern-matching IDs + ALL/MATCH
slow operation (>2s)                  -> background=True with long_callback_manager
snappy UI tweaks                      -> clientside_callback (browser JS)
prevent on page load                   -> prevent_initial_call=True
"which input fired?"                   -> ctx.triggered_id
"all callbacks at once" pattern        -> use one callback with multiple Outputs
share state across callbacks          -> dcc.Store (browser-side) OR url query
horizontal scaling                     -> Dash is stateless per request; scales freely
multi-page                              -> dash.register_page + use_pages=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing to a global Python variable from inside a
> callback. Dash workers may serve different requests on different
> threads/processes; global mutation = race conditions and
> cross-user data leaks. Use dcc.Store (browser-side state),
> pass values through the callback graph, or persist to a
> real backend.

## Tips

- `@callback(Output, Input)` is the explicit reactive graph. Inputs trigger; State reads-without-triggering; Output receives.
- `prevent_initial_call=True` prevents the callback from firing on page load — useful when the callback needs an explicit user action.
- `ctx.triggered_id` tells you WHICH input fired the callback (when multiple Inputs share a callback). Essential for "which button was clicked".
- Pattern-matching IDs (`{"type": "filter", "index": N}` + `ALL`/`MATCH`) let you build dynamic UIs (add/remove rows). The MATCH version pairs by index across components.
- `background=True` + `long_callback_manager` runs slow callbacks in a worker process so the UI stays responsive. Pair with `running=[(Output, True, False)]` to disable the trigger button during work.
- `clientside_callback` runs JavaScript in the browser — zero server round-trip. Use for snappy formatting/display logic that doesn't need server data.

## Common Mistake

> [!warning] Writing to a global Python variable from inside a callback. Dash workers serve different requests on different threads/processes — global mutation causes race conditions and (worse) cross-user data leaks where user A's state appears in user B's session. Use `dcc.Store` (browser-side, per-session) or pass values explicitly through the callback graph.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Global mutation — cross-user data leak
USER_FILTERS = {}
@callback(...)
def store(value):
    USER_FILTERS["region"] = value   # which user???
```

**Senior:**
```python
# dcc.Store (browser-side, per-session)
dcc.Store(id="user-filters")
@callback(Output("user-filters", "data"), Input("region", "value"))
def store(value): return {"region": value}
```

## See Also

- [[Sections/data-apps/dash/dash-layouts|Dash layouts — bootstrap, theming, multi-page apps (Data Apps)]]
- [[Sections/data-apps/dash/_Index|Data Apps → Dash — Plotly callbacks, layouts]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
