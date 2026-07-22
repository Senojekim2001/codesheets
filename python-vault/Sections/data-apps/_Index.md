---
type: "file-index"
domain: "python"
file: "data-apps"
title: "Data Apps"
tags:
  - "python"
  - "python/data-apps"
  - "index"
---

# Data Apps

> 9 entries across 4 sections.

## Streamlit — dashboards, state, caching · 3

- [[Sections/data-apps/streamlit/streamlit-basics|Streamlit basics — script-as-app, widgets, layout]] — Streamlit re-runs your Python script top-to-bottom on every widget interaction. The mental model is "render the UI as a function of state". Right answer for internal dashboards in <100 lines.
- [[Sections/data-apps/streamlit/streamlit-state|Streamlit state — session_state, callbacks, forms]] — Persist values across reruns via `st.session_state`; trigger callbacks on widget change with `on_change=`; batch widgets with `st.form` so the script doesn't rerun until submit. The state model that makes Streamlit non-trivial.
- [[Sections/data-apps/streamlit/streamlit-data-flow|Streamlit caching — cache_data, cache_resource, downloads]] — `@st.cache_data` for expensive computations that return serializable values; `@st.cache_resource` for live connections; `st.download_button` for letting users grab the result. The performance discipline that makes Streamlit usable at scale.

## Dash — Plotly callbacks, layouts · 2

- [[Sections/data-apps/dash/dash-callbacks|Dash callbacks — Input/Output/State, chains, pattern-matching]] — Dash uses an explicit callback model: declare which Inputs trigger which Outputs; Dash wires the reactive graph. Versus Streamlit: Dash is more like "real React" — explicit dependency graph, no rerun model.
- [[Sections/data-apps/dash/dash-layouts|Dash layouts — bootstrap, theming, multi-page apps]] — Build responsive layouts with `dash-bootstrap-components` (`dbc`); theme via Bootswatch; multi-page apps via the `pages/` directory and `dash.register_page`. Production-grade UI without writing CSS.

## Gradio — ML demos, Blocks, Hugging Face · 2

- [[Sections/data-apps/gradio/gradio-interface|Gradio Interface — wrap a function as a UI]] — `gr.Interface(fn, inputs, outputs)` turns any Python function into a web UI. The Hugging Face standard for ML demos: image classifiers, text generators, audio transcribers — wrap and share in 5 lines.
- [[Sections/data-apps/gradio/gradio-blocks|Gradio Blocks — multi-tab UIs, events, state]] — `gr.Blocks` is Gradio's low-level layout primitive. Tabs, events (`.click`, `.change`, `.then`), conditional UI, cross-event `gr.State`. Use when `gr.Interface` is too restrictive.

## Deployment & Auth — multipage, sticky sessions, behind nginx · 2

- [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access]] — Multi-page Streamlit apps via the `pages/` directory; auth via streamlit-authenticator OR a reverse proxy; per-page RBAC. The pattern that takes Streamlit from prototype to internal tool.
- [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions]] — Streamlit is per-session stateful → sticky sessions required. Dash is mostly stateless. Gradio queues need WebSocket. The deployment matrix that determines whether your data app survives traffic.
