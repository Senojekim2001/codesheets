---
type: "entry"
domain: "python"
file: "data-apps"
section: "streamlit"
id: "streamlit-state"
title: "Streamlit state — session_state, callbacks, forms"
category: "Streamlit"
subtitle: "st.session_state, key=, on_change / on_click callbacks, st.form / st.form_submit_button, clear_on_submit, programmatic state mutation"
signature_short: "st.session_state[\"count\"] = 0
if st.button(\"inc\", on_click=lambda: st.session_state.update(count=st.session_state.count + 1)): ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Streamlit state — session_state, callbacks, forms"
  - "streamlit-state"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/streamlit"
  - "category/streamlit"
  - "tier/tiered"
---

# Streamlit state — session_state, callbacks, forms

> st.session_state, key=, on_change / on_click callbacks, st.form / st.form_submit_button, clear_on_submit, programmatic state mutation

## Overview

Streamlit reruns the script every interaction — but `st.session_state` is a per-browser-session dict that survives reruns. Widgets with a `key=` argument auto-bind to `session_state[key]`. Callbacks (`on_change=`, `on_click=`) fire ONCE per interaction, BEFORE the rerun, so they're where you mutate state. `st.form` batches a group of widgets — the script DOESN'T rerun on each input, only on form submission. The three examples solve the SAME concrete task — a counter with increment/reset, plus a multi-step form that doesn't fire its API call until submit — at three depths: bare `session_state` + button → callbacks + `st.form` for batching → production patterns (state versioning, programmatic reset, double-submit prevention).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Counter with increment + reset; survives reruns.
- **Junior** — SAME — plus a multi-field form that calls an API only when SUBMIT is clicked (not every keystroke).
- **Senior** — SAME — production: typed state container, double-submit prevention, state-version-aware widgets, useState-style hook helper.

## Signature

```python
st.session_state["count"] = 0
if st.button("inc", on_click=lambda: st.session_state.update(count=st.session_state.count + 1)): ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Counter with increment + reset; survives reruns.
# APPROACH  - Initialize st.session_state["count"]; mutate via button.
import streamlit as st

if "count" not in st.session_state:
    st.session_state["count"] = 0

st.write(f"Count: **{st.session_state['count']}**")

if st.button("Increment"):
    st.session_state["count"] += 1
    # Streamlit reruns automatically after this block.

if st.button("Reset"):
    st.session_state["count"] = 0
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — plus a multi-field form that calls an API only
#             when SUBMIT is clicked (not every keystroke).
# APPROACH  - on_click= callback for atomic mutations; st.form
#             batches inputs; clear_on_submit resets fields.
import streamlit as st
import time

# === Counter via callbacks ===
def init_state():
    st.session_state.setdefault("count", 0)
init_state()

def inc():    st.session_state["count"] += 1
def dec():    st.session_state["count"] -= 1
def reset():  st.session_state["count"] = 0

st.metric("Count", st.session_state["count"])
c1, c2, c3 = st.columns(3)
c1.button("➕ Inc", on_click=inc, use_container_width=True)
c2.button("➖ Dec", on_click=dec, use_container_width=True)
c3.button("⟲ Reset", on_click=reset, use_container_width=True)

# === Multi-field form — API fires ONCE on submit ===
st.divider()
st.subheader("Create user")

with st.form("create_user", clear_on_submit=True):
    name  = st.text_input("Name")
    email = st.text_input("Email")
    role  = st.selectbox("Role", ["viewer", "editor", "admin"])
    submitted = st.form_submit_button("Create")

if submitted:
    # This runs ONLY on submit — no reruns mid-typing.
    if not name or "@" not in email:
        st.error("Invalid input")
    else:
        with st.spinner("Calling API..."):
            time.sleep(0.5)                            # imagine: requests.post(...)
        st.success(f"Created {name} ({role})")

# Why st.form matters:
#   Without form: typing in the email field reruns the script + maybe
#   triggers any side-effect logic. With form: NO rerun until submit.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: typed state container, double-submit
#             prevention, state-version-aware widgets, useState-style
#             hook helper.
# APPROACH  - dataclass for state schema; in_flight flag prevents
#             double-submit; key= versioning forces widget reset on
#             logical state change.
import streamlit as st
import time
from dataclasses import dataclass, field
from typing import Any, Callable, TypeVar
import uuid

T = TypeVar("T")

# === Typed state container ===
@dataclass
class AppState:
    count: int = 0
    user_form_in_flight: bool = False
    last_created_user_id: str | None = None
    state_version: int = 0                             # bump to reset all keyed widgets

def state() -> AppState:
    if "_state" not in st.session_state:
        st.session_state["_state"] = AppState()
    return st.session_state["_state"]

# === Hook-style helper ===
def use_state(key: str, default: T) -> tuple[T, Callable[[T], None]]:
    """React-style: returns (value, setter)."""
    if key not in st.session_state:
        st.session_state[key] = default
    def setter(v: T) -> None:
        st.session_state[key] = v
    return st.session_state[key], setter

# === Counter ===
s = state()
st.metric("Count", s.count)
c1, c2 = st.columns(2)
if c1.button("➕"):
    s.count += 1
    st.rerun()
if c2.button("Reset"):
    s.count = 0
    s.state_version += 1                               # bump → child keyed widgets reset
    st.rerun()

# === Form with double-submit prevention ===
st.divider()

# Key derived from state_version forces fresh widget on Reset.
form_key = f"create_user_v{s.state_version}"

with st.form(form_key, clear_on_submit=False):
    name = st.text_input("Name", key=f"name_{s.state_version}")
    email = st.text_input("Email", key=f"email_{s.state_version}")
    submitted = st.form_submit_button(
        "Create",
        disabled=s.user_form_in_flight,                # gray out during in-flight
    )

if submitted and not s.user_form_in_flight:
    s.user_form_in_flight = True
    try:
        if not name or "@" not in email:
            st.error("Invalid input")
        else:
            with st.spinner("Creating..."):
                time.sleep(1.0)                        # imagine API call
                user_id = str(uuid.uuid4())
            s.last_created_user_id = user_id
            st.success(f"Created user {user_id}")
    finally:
        s.user_form_in_flight = False

# === Cross-page state — session_state is per-tab ===
# In a multipage app, st.session_state persists across pages of the
# same browser tab but NOT across tabs. For cross-tab state,
# persist to a backend (DB, Redis) keyed by user_id from auth.

# Decision rule:
#   widget value persists across reruns -> key= argument auto-binds to session_state
#   reset everything                     -> bump a state_version; use it in widget keys
#   batch inputs                         -> st.form + form_submit_button
#   on-change callback                   -> on_change=, on_click= (fires BEFORE rerun)
#   typed state                          -> dataclass in session_state["_state"]
#   double-submit                        -> in_flight flag + disabled= on the button
#   share state across tabs              -> NOT session_state; DB / Redis keyed by user
#   useState-style                        -> use_state helper returning (value, setter)
#   programmatic refresh                  -> st.rerun() forces re-render now
#   query-param-driven state              -> st.query_params (deep linking)
#
# Anti-pattern: mutating session_state INSIDE the body of the script
# (not in a callback or button handler). The mutation happens during
# render; downstream widgets read the new value; the next rerun
# re-mutates; you get an infinite loop or visual flicker. Always
# mutate state in callbacks (on_click, on_change) which fire BEFORE
# the rerun.
```

## Decision Rule

```text
widget value persists across reruns -> key= argument auto-binds to session_state
reset everything                     -> bump a state_version; use it in widget keys
batch inputs                         -> st.form + form_submit_button
on-change callback                   -> on_change=, on_click= (fires BEFORE rerun)
typed state                          -> dataclass in session_state["_state"]
double-submit                        -> in_flight flag + disabled= on the button
share state across tabs              -> NOT session_state; DB / Redis keyed by user
useState-style                        -> use_state helper returning (value, setter)
programmatic refresh                  -> st.rerun() forces re-render now
query-param-driven state              -> st.query_params (deep linking)
```

## Anti-Pattern

> [!warning] Anti-pattern
> mutating session_state INSIDE the body of the script
> (not in a callback or button handler). The mutation happens during
> render; downstream widgets read the new value; the next rerun
> re-mutates; you get an infinite loop or visual flicker. Always
> mutate state in callbacks (on_click, on_change) which fire BEFORE
> the rerun.

## Tips

- Widgets with `key=` auto-sync to `st.session_state[key]`. Reading from session_state and reading the widget return value give the same answer.
- Callbacks (`on_change`, `on_click`) fire BEFORE the rerun. Mutate state there, not in the script body — body mutations cause flicker or loops.
- `st.form` batches widgets — the script does NOT rerun on each input, only on `form_submit_button`. Critical for forms with many fields.
- `st.rerun()` triggers an immediate rerun. Use after a state mutation that needs to take effect before the rest of the page renders.
- For a "reset everything" button, bump a `state_version` integer and include it in widget keys (`key=f"name_v{state_version}"`). The new key creates a fresh widget.
- `disabled=in_flight_flag` on a submit button + clearing the flag in `finally` is the simplest double-submit prevention.

## Common Mistake

> [!warning] Mutating `st.session_state` directly in the script body (not in a callback). The mutation runs during render; downstream widgets see new values; the next rerun re-mutates. Result: infinite loop or visual flicker. Always mutate in `on_change`/`on_click` callbacks, which run BEFORE the rerun.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Mutation in body — flicker / infinite rerun
if st.session_state.count > 10:
    st.session_state.count = 0   # mid-render mutation
```

**Senior:**
```python
# Mutation in callback — fires once, then rerun
def reset(): st.session_state.count = 0
st.button("Reset", on_click=reset)
```

## See Also

- [[Sections/data-apps/streamlit/streamlit-basics|Streamlit basics — script-as-app, widgets, layout (Data Apps)]]
- [[Sections/data-apps/streamlit/streamlit-data-flow|Streamlit caching — cache_data, cache_resource, downloads (Data Apps)]]
- [[Sections/data-apps/streamlit/_Index|Data Apps → Streamlit — dashboards, state, caching]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
