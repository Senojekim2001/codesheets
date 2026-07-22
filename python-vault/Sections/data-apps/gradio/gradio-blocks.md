---
type: "entry"
domain: "python"
file: "data-apps"
section: "gradio"
id: "gradio-blocks"
title: "Gradio Blocks — multi-tab UIs, events, state"
category: "Gradio"
subtitle: "gr.Blocks, gr.Tabs / Tab, .click() / .change() / .submit(), .then() chains, gr.State, conditional visibility, mounted in FastAPI"
signature_short: "with gr.Blocks() as demo:
    btn = gr.Button(\"Go\")
    out = gr.Textbox()
    btn.click(fn, inputs=[...], outputs=[out])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Gradio Blocks — multi-tab UIs, events, state"
  - "gradio-blocks"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/gradio"
  - "category/gradio"
  - "tier/tiered"
---

# Gradio Blocks — multi-tab UIs, events, state

> gr.Blocks, gr.Tabs / Tab, .click() / .change() / .submit(), .then() chains, gr.State, conditional visibility, mounted in FastAPI

## Overview

`gr.Blocks` exposes Gradio's full layout + event system: `with gr.Blocks() as demo:` opens a context; widgets attach to events via `.click()`, `.change()`, `.submit()`. Events return `Dependency` objects you can chain with `.then(other_fn, ...)`. `gr.State` holds per-session state across events. Use Blocks when you need: tabs, sidebars, conditional UI, multi-step flows, or anything Interface can't express. The three examples solve the SAME concrete task — multi-tab UI: Tab 1 generates text, Tab 2 transforms it, results persist across tabs — at three depths: basic tabs + buttons → events with State + conditional visibility → mounted in FastAPI with auth, queue management, custom theming.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Two-tab UI; tab 1 generates a greeting; tab 2 echoes it.
- **Junior** — SAME — but state persists across tabs; chained events (.then); conditional visibility.
- **Senior** — SAME — production: mounted in FastAPI for shared auth + API endpoints; custom theme; queue management for ML.

## Signature

```python
with gr.Blocks() as demo:
    btn = gr.Button("Go")
    out = gr.Textbox()
    btn.click(fn, inputs=[...], outputs=[out])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Two-tab UI; tab 1 generates a greeting; tab 2 echoes it.
import gradio as gr

with gr.Blocks() as demo:
    gr.Markdown("# Multi-tab demo")
    with gr.Tabs():
        with gr.Tab("Generate"):
            name = gr.Textbox(label="Name")
            greet_btn = gr.Button("Greet")
            greeting = gr.Textbox(label="Greeting", interactive=False)

            greet_btn.click(
                fn=lambda n: f"Hello, {n}!",
                inputs=name,
                outputs=greeting,
            )
        with gr.Tab("Echo"):
            echo_in = gr.Textbox(label="Input")
            echo_out = gr.Textbox(label="Output")
            echo_in.change(lambda x: x.upper(), echo_in, echo_out)

demo.launch()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but state persists across tabs; chained events
#             (.then); conditional visibility.
import gradio as gr

def generate(prompt: str) -> str:
    return f"Generated: {prompt[:50]}..."

def transform(text: str, op: str) -> str:
    return text.upper() if op == "upper" else text.lower()

with gr.Blocks(title="Generate + Transform") as demo:
    gr.Markdown("# Pipeline demo")

    # gr.State holds session-scoped data across tabs.
    last_generated = gr.State(value="")

    with gr.Tabs() as tabs:
        with gr.Tab("Generate"):
            prompt = gr.Textbox(label="Prompt", lines=3)
            gen_btn = gr.Button("Generate", variant="primary")
            gen_out = gr.Textbox(label="Output", interactive=False)
            advanced = gr.Checkbox(label="Show advanced", value=False)
            seed = gr.Number(label="Seed", value=42, visible=False)

            # Show/hide seed based on checkbox.
            advanced.change(
                fn=lambda v: gr.update(visible=v),
                inputs=advanced,
                outputs=seed,
            )

            # Chain: generate → save to state → switch to Transform tab.
            gen_btn.click(
                fn=generate, inputs=prompt, outputs=gen_out,
            ).then(
                fn=lambda x: x, inputs=gen_out, outputs=last_generated,
            ).then(
                fn=lambda: gr.Tabs(selected=1), inputs=None, outputs=tabs,
            )

        with gr.Tab("Transform"):
            xform_in = gr.Textbox(label="Input (auto-filled)")
            op = gr.Radio(["upper", "lower"], label="Op", value="upper")
            xform_btn = gr.Button("Transform")
            xform_out = gr.Textbox(label="Result")

            # On tab change, copy state into the textbox.
            demo.load(
                fn=lambda x: x,
                inputs=last_generated,
                outputs=xform_in,
            )

            xform_btn.click(transform, [xform_in, op], xform_out)

demo.launch()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: mounted in FastAPI for shared auth +
#             API endpoints; custom theme; queue management for ML.
import gradio as gr
from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import RedirectResponse
import os

# === Custom theme ===
theme = gr.themes.Soft(
    primary_hue="blue", secondary_hue="indigo",
    font=[gr.themes.GoogleFont("Inter"), "ui-sans-serif", "system-ui"],
)

def generate(prompt: str, temp: float = 0.7) -> str:
    return f"[generated with t={temp}] {prompt[:80]}"

def get_user_safe(token: str | None) -> dict | None:
    if not token: return None
    return {"id": "u-1", "name": "Alice"} if token == "valid-token" else None

# === Build the Gradio app ===
with gr.Blocks(theme=theme, title="Production demo", analytics_enabled=False) as demo:
    user_info = gr.State(value=None)

    with gr.Row():
        gr.Markdown("# AI Studio")
        login_status = gr.Markdown("Not logged in")

    with gr.Tabs():
        with gr.Tab("Generate"):
            prompt = gr.Textbox(label="Prompt", lines=3)
            with gr.Row():
                temp = gr.Slider(0.0, 1.5, value=0.7, label="Temperature")
                go_btn = gr.Button("Generate", variant="primary")
            output = gr.Textbox(label="Output", interactive=False, lines=5)

            go_btn.click(
                fn=generate, inputs=[prompt, temp], outputs=output,
                concurrency_limit=4,                   # max 4 concurrent gen calls
                api_name="generate",                    # exposed at /api/generate
            )

        with gr.Tab("History"):
            history = gr.Dataframe(headers=["timestamp", "prompt", "output"], label="Recent")
            refresh_btn = gr.Button("Refresh")
            refresh_btn.click(fn=lambda: [], inputs=None, outputs=history)

    demo.queue(default_concurrency_limit=10, max_size=50)

# === Mount inside FastAPI ===
app = FastAPI()

@app.get("/")
async def root():
    return RedirectResponse(url="/gradio")

@app.get("/api/health")
async def health():
    return {"ok": True}

# Mount the Gradio app at /gradio.
app = gr.mount_gradio_app(app, demo, path="/gradio")

# Run with uvicorn:
#   $ uvicorn app:app --host 0.0.0.0 --port 7860
# Now you have:
#   /                  -> redirects to /gradio
#   /gradio            -> Gradio UI
#   /gradio/api/...    -> Gradio's auto-generated REST API
#   /api/health        -> custom FastAPI route

# Decision rule:
#   simple wrap a fn                       -> gr.Interface
#   multi-tab / complex layout              -> gr.Blocks
#   chatbot                                  -> gr.ChatInterface
#   chained events                           -> .click(...).then(...).then(...)
#   conditional UI                           -> gr.update(visible=...) on event
#   per-session state                        -> gr.State (browser-scoped)
#   queue / concurrency control              -> demo.queue + concurrency_limit per event
#   shared auth / custom routes              -> mount in FastAPI via mount_gradio_app
#   public free hosting                      -> Hugging Face Spaces
#   programmatic access                       -> api_name="..." + gradio_client.Client
#   custom theme                              -> gr.themes.Soft/Default with overrides
#   streaming LLM                             -> generator function in .click() + ChatInterface
#   websocket / long-poll                     -> gr.queue handles it; don't roll your own
#
# Anti-pattern: storing per-session state in module-level globals.
# Multiple users share the same Python process; one user's state
# leaks into another's view. Use gr.State (browser-scoped) for
# per-session data.
```

## Decision Rule

```text
simple wrap a fn                       -> gr.Interface
multi-tab / complex layout              -> gr.Blocks
chatbot                                  -> gr.ChatInterface
chained events                           -> .click(...).then(...).then(...)
conditional UI                           -> gr.update(visible=...) on event
per-session state                        -> gr.State (browser-scoped)
queue / concurrency control              -> demo.queue + concurrency_limit per event
shared auth / custom routes              -> mount in FastAPI via mount_gradio_app
public free hosting                      -> Hugging Face Spaces
programmatic access                       -> api_name="..." + gradio_client.Client
custom theme                              -> gr.themes.Soft/Default with overrides
streaming LLM                             -> generator function in .click() + ChatInterface
websocket / long-poll                     -> gr.queue handles it; don't roll your own
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing per-session state in module-level globals.
> Multiple users share the same Python process; one user's state
> leaks into another's view. Use gr.State (browser-scoped) for
> per-session data.

## Tips

- `gr.Blocks` lets you express any layout. Tabs, rows, columns, accordions — all components nest naturally inside the `with gr.Blocks():` context.
- Events return `Dependency` objects. Chain with `.then(fn, inputs, outputs)` — chained event runs AFTER the previous one finishes, with the previous output as input.
- `gr.State(value=...)` is per-browser-session storage. Use for cross-tab data, undo history, conversation context.
- `gr.update(visible=False, value=..., interactive=...)` lets one event modify multiple props of a target component. Returned by an event function; Gradio applies the update.
- `mount_gradio_app(app, demo, path="/gradio")` embeds Gradio inside FastAPI. Lets you share auth, add custom routes, deploy as one app.
- For ML demos, `concurrency_limit` per event is the per-endpoint queue. Set it to your GPU's parallelism (e.g., batch_size for batched inference).

## Common Mistake

> [!warning] Storing per-session state in module-level globals. Multiple users share the same Python process; one user's `LAST_PROMPT = "..."` leaks into another's view (cross-user data leak). Use `gr.State(value=...)` — browser-session scoped, no leakage.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Module global — shared across users
LAST_PROMPT = ""
def go(p):
    global LAST_PROMPT
    LAST_PROMPT = p
    return f"Got: {p}"
```

**Senior:**
```python
# gr.State — per-session, no leak
last = gr.State("")
def go(p, prev): return f"Got: {p} (was: {prev})", p
btn.click(go, [prompt, last], [out, last])
```

## See Also

- [[Sections/data-apps/gradio/gradio-interface|Gradio Interface — wrap a function as a UI (Data Apps)]]
- [[Sections/data-apps/gradio/_Index|Data Apps → Gradio — ML demos, Blocks, Hugging Face]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
