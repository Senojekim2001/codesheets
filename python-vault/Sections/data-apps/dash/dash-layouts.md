---
type: "entry"
domain: "python"
file: "data-apps"
section: "dash"
id: "dash-layouts"
title: "Dash layouts — bootstrap, theming, multi-page apps"
category: "Dash"
subtitle: "dbc.Container/Row/Col, dbc.themes, dbc.Card / Navbar / Tabs, dash.register_page, use_pages=True, query string state, dark mode toggle"
signature_short: "app = Dash(use_pages=True, external_stylesheets=[dbc.themes.BOOTSTRAP])
# pages/home.py: dash.register_page(__name__, path=\"/\")"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Dash layouts — bootstrap, theming, multi-page apps"
  - "dash-layouts"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/dash"
  - "category/dash"
  - "tier/tiered"
---

# Dash layouts — bootstrap, theming, multi-page apps

> dbc.Container/Row/Col, dbc.themes, dbc.Card / Navbar / Tabs, dash.register_page, use_pages=True, query string state, dark mode toggle

## Overview

`dash-bootstrap-components` (dbc) wraps Bootstrap into Dash components — `dbc.Row`, `dbc.Col`, `dbc.Card`, `dbc.Navbar`. Bootstrap's grid system gives you responsive layouts (mobile, tablet, desktop) without writing CSS. Theming via `dbc.themes` swaps the entire color palette via Bootswatch. Multi-page apps: `pages/home.py`, `pages/users.py`; each calls `dash.register_page(__name__)`; `app = Dash(use_pages=True)` wires routing. The three examples solve the SAME concrete task — 3-column layout (sidebar, main, detail), themed, responsive on mobile, multi-page navigation — at three depths: html.Div + style → dbc.Container/Row/Col + dbc.Card → multi-page with dark-mode toggle, header navbar, deep linking via dcc.Location.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — 3-column layout: sidebar, main chart, detail panel.
- **Junior** — SAME — but responsive, themed via Bootstrap, with cards. pip install dash-bootstrap-components
- **Senior** — SAME — multi-page app with header nav, dark-mode toggle, query-string-driven state. Project structure: app.py               <- main Dash app pages/home.py        <- registered as path="/" pages/users.py       <- registered as path="/users" pages/reports.py     <- registered as path="/reports"

## Signature

```python
app = Dash(use_pages=True, external_stylesheets=[dbc.themes.BOOTSTRAP])
# pages/home.py: dash.register_page(__name__, path="/")
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - 3-column layout: sidebar, main chart, detail panel.
import dash
from dash import dcc, html

app = dash.Dash(__name__)
app.layout = html.Div([
    html.Div([html.H3("Filters"), dcc.Dropdown(id="r", options=["us","eu"])],
             style={"width": "20%", "padding": "1rem", "background": "#f0f0f0"}),
    html.Div([dcc.Graph(id="chart")],
             style={"width": "55%", "padding": "1rem"}),
    html.Div([html.H3("Detail"), html.Pre(id="detail")],
             style={"width": "25%", "padding": "1rem", "background": "#fafafa"}),
], style={"display": "flex"})

# Works, but: not responsive (3 columns at any width); inline styles;
# no theming. Junior tier upgrades to dbc.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but responsive, themed via Bootstrap, with cards.
# pip install dash-bootstrap-components
import dash
from dash import dcc, html
import dash_bootstrap_components as dbc

app = dash.Dash(__name__, external_stylesheets=[dbc.themes.FLATLY])

app.layout = dbc.Container([
    dbc.Navbar(
        dbc.Container([
            dbc.NavbarBrand("Sales Explorer", className="ms-2"),
            dbc.Nav([
                dbc.NavItem(dbc.NavLink("Home", href="/")),
                dbc.NavItem(dbc.NavLink("Users", href="/users")),
            ]),
        ]),
        color="primary", dark=True, className="mb-3",
    ),
    dbc.Row([
        # Sidebar — 3 cols on lg screens, full width on mobile.
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Filters"),
                dbc.CardBody([
                    dcc.Dropdown(id="region", options=["us", "eu"]),
                    html.Div(className="mt-3"),
                    dcc.RangeSlider(id="amt-range", min=0, max=10_000),
                ]),
            ], className="mb-3"),
        ], lg=3, md=12),

        # Main pane — 6 cols on lg, full on mobile.
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Sales by category"),
                dbc.CardBody([dcc.Graph(id="chart")]),
            ]),
        ], lg=6, md=12),

        # Detail — 3 cols on lg, full on mobile.
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("Detail"),
                dbc.CardBody([html.Div(id="detail")]),
            ]),
        ], lg=3, md=12),
    ]),
], fluid=True)

# Available themes via dbc.themes:
#   BOOTSTRAP, FLATLY (default-ish), DARKLY, CYBORG, SOLAR, ...
#   Browse: https://bootswatch.com
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — multi-page app with header nav, dark-mode toggle,
#             query-string-driven state.
# Project structure:
#   app.py               <- main Dash app
#   pages/home.py        <- registered as path="/"
#   pages/users.py       <- registered as path="/users"
#   pages/reports.py     <- registered as path="/reports"

# === app.py ===
import dash
from dash import Dash, html, dcc, Input, Output, callback, page_container
import dash_bootstrap_components as dbc

app = Dash(
    __name__,
    use_pages=True,                                    # auto-discover pages/
    external_stylesheets=[dbc.themes.BOOTSTRAP],
    suppress_callback_exceptions=True,
)

app.layout = dbc.Container([
    # Persistent location component (URL state).
    dcc.Location(id="url"),
    # Theme stylesheet swap target.
    html.Link(id="theme-link", rel="stylesheet", href=dbc.themes.BOOTSTRAP),

    # Header navbar.
    dbc.Navbar(
        dbc.Container([
            dbc.NavbarBrand("Sales Hub", href="/"),
            dbc.Nav([
                dbc.NavLink(p["name"], href=p["path"], active="exact")
                for p in dash.page_registry.values()
            ], pills=True),
            html.Div(className="ms-auto", children=[
                dbc.Switch(id="theme-toggle", label="Dark", value=False),
            ]),
        ], fluid=True),
        color="dark", dark=True, className="mb-3",
    ),

    # Page content slot.
    page_container,
], fluid=True)

@callback(Output("theme-link", "href"), Input("theme-toggle", "value"))
def toggle_theme(dark: bool):
    return dbc.themes.DARKLY if dark else dbc.themes.BOOTSTRAP

if __name__ == "__main__":
    app.run(debug=True)

# === pages/home.py ===
# import dash, dash_bootstrap_components as dbc
# from dash import html, dcc
#
# dash.register_page(__name__, path="/", name="Home")
#
# layout = dbc.Container([
#     html.H1("Welcome"),
#     dbc.Row([
#         dbc.Col(dbc.Card([dbc.CardBody("Card 1")])),
#         dbc.Col(dbc.Card([dbc.CardBody("Card 2")])),
#         dbc.Col(dbc.Card([dbc.CardBody("Card 3")])),
#     ]),
# ])

# === pages/users.py ===
# import dash, dash_bootstrap_components as dbc
# from dash import html, dcc, callback, Input, Output
#
# dash.register_page(__name__, path="/users", name="Users")
#
# def layout(role: str | None = None, **kw):
#     # query-string param: /users?role=admin
#     return dbc.Container([
#         html.H1(f"Users (role={role or 'any'})"),
#         html.Div(id="users-table"),
#     ])
#
# @callback(Output("users-table", "children"), Input("role", "value"))
# def render(role): ...

# Decision rule:
#   responsive layout                       -> dbc.Row + dbc.Col with breakpoint args
#   theming                                  -> dbc.themes.* + Bootswatch reference
#   dark mode toggle                         -> swap external_stylesheets via Output
#   multi-page                               -> use_pages=True + pages/ dir + register_page
#   active link highlighting                  -> dbc.NavLink active="exact"
#   query-string state                        -> page-level layout(role=...) signature
#   browser back/forward                       -> dcc.Location handles automatically
#   complex auth                               -> reverse proxy auth; per-page check via callback
#   custom CSS                                  -> assets/ dir; auto-loaded
#   embedded in Flask                           -> server=Flask(__name__); Dash(server=server)
#   alternative theming framework              -> dash-mantine-components (DMC)
#
# Anti-pattern: hardcoding pixel widths in inline styles for layout.
# Looks fine on dev laptop, broken on mobile, broken on 4K monitor.
# Use dbc.Row/Col with responsive breakpoints (lg=, md=, sm=) — they
# adapt automatically.
```

## Decision Rule

```text
responsive layout                       -> dbc.Row + dbc.Col with breakpoint args
theming                                  -> dbc.themes.* + Bootswatch reference
dark mode toggle                         -> swap external_stylesheets via Output
multi-page                               -> use_pages=True + pages/ dir + register_page
active link highlighting                  -> dbc.NavLink active="exact"
query-string state                        -> page-level layout(role=...) signature
browser back/forward                       -> dcc.Location handles automatically
complex auth                               -> reverse proxy auth; per-page check via callback
custom CSS                                  -> assets/ dir; auto-loaded
embedded in Flask                           -> server=Flask(__name__); Dash(server=server)
alternative theming framework              -> dash-mantine-components (DMC)
```

## Anti-Pattern

> [!warning] Anti-pattern
> hardcoding pixel widths in inline styles for layout.
> Looks fine on dev laptop, broken on mobile, broken on 4K monitor.
> Use dbc.Row/Col with responsive breakpoints (lg=, md=, sm=) — they
> adapt automatically.

## Tips

- `dash-bootstrap-components` (`dbc`) wraps Bootstrap. `dbc.Row` + `dbc.Col` with breakpoint arguments (`lg=3, md=6, sm=12`) gives responsive layouts without CSS.
- Theme via `dbc.themes.X` — Bootswatch themes covered: BOOTSTRAP, FLATLY, DARKLY, CYBORG, SOLAR, etc. Swap by changing `external_stylesheets`.
- For multi-page: `Dash(use_pages=True)` + `pages/` directory; each page calls `dash.register_page(__name__, path="/...")`. The `page_container` in your layout renders the active page.
- `dcc.Location(id="url")` is the source of truth for URL state. Browser back/forward works automatically; query params are passed to page `layout(**kwargs)`.
- Dynamic theme switching: bind a callback to update `external_stylesheets` Output; users get dark/light mode without page reload.
- For custom CSS, drop `.css` files in `assets/` — Dash auto-loads them.

## Common Mistake

> [!warning] Hardcoded pixel widths in inline styles. Looks fine on dev laptop, broken on mobile (overflow), broken on 4K (everything tiny). Use `dbc.Row` + `dbc.Col(lg=3, md=12)` — Bootstrap's grid auto-stacks on small screens.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Pixel widths — only works at one screen size
html.Div([...], style={"width": "300px"})
```

**Senior:**
```python
# Responsive grid — adapts to screen size
dbc.Col([...], lg=3, md=6, sm=12)
```

## See Also

- [[Sections/data-apps/dash/dash-callbacks|Dash callbacks — Input/Output/State, chains, pattern-matching (Data Apps)]]
- [[Sections/data-apps/dash/_Index|Data Apps → Dash — Plotly callbacks, layouts]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
