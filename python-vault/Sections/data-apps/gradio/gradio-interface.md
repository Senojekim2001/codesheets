---
type: "entry"
domain: "python"
file: "data-apps"
section: "gradio"
id: "gradio-interface"
title: "Gradio Interface — wrap a function as a UI"
category: "Gradio"
subtitle: "gr.Interface, type-inferred widgets, examples=, queue, batch=, .launch(share=True), Hugging Face Spaces, ChatInterface"
signature_short: "gr.Interface(fn=predict, inputs=gr.Image(), outputs=gr.Label()).launch(share=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Gradio Interface — wrap a function as a UI"
  - "gradio-interface"
tags:
  - "python"
  - "python/data-apps"
  - "python/data-apps/gradio"
  - "category/gradio"
  - "tier/tiered"
---

# Gradio Interface — wrap a function as a UI

> gr.Interface, type-inferred widgets, examples=, queue, batch=, .launch(share=True), Hugging Face Spaces, ChatInterface

## Overview

Gradio (Hugging Face) is the dominant choice for "wrap an ML model as a web demo". `gr.Interface(fn, inputs, outputs)` introspects type hints AND component args to build the right widgets — no layout code needed for simple cases. `share=True` creates a public tunnel URL (works through firewalls). Hugging Face Spaces hosts Gradio apps for free with GPU support. For chatbots, `gr.ChatInterface` handles multi-turn UI. The three examples solve the SAME concrete task — wrap an image classifier as a web demo with examples and a public URL — at three depths: minimal `gr.Interface` → multi-input + examples + queue for concurrent users → `gr.ChatInterface` for streaming LLM, OAuth, deployment to HF Spaces.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Wrap an image classifier as a web UI. pip install gradio
- **Junior** — SAME — multiple inputs (image + threshold slider), examples, batched inference, queue for concurrent users.
- **Senior** — SAME — production: streaming LLM via ChatInterface, OAuth-gated, deployed to Hugging Face Spaces with GPU.

## Signature

```python
gr.Interface(fn=predict, inputs=gr.Image(), outputs=gr.Label()).launch(share=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Wrap an image classifier as a web UI.
# pip install gradio
import gradio as gr

def classify(image):
    # Imagine: PyTorch / TF model.
    return {"cat": 0.6, "dog": 0.3, "bird": 0.1}

demo = gr.Interface(
    fn=classify,
    inputs=gr.Image(type="pil"),
    outputs=gr.Label(num_top_classes=3),
    title="Image classifier",
)
demo.launch(share=True)
# share=True prints a public *.gradio.live URL (tunnels through HF servers).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — multiple inputs (image + threshold slider),
#             examples, batched inference, queue for concurrent users.
import gradio as gr
from PIL import Image
import numpy as np

EXAMPLES = [
    ["examples/cat.jpg", 0.5],
    ["examples/dog.jpg", 0.5],
    ["examples/bird.jpg", 0.3],
]

def classify_batch(images: list, threshold: float) -> list:
    """Batched: receives lists when batch=True."""
    out = []
    for img in images:
        scores = {"cat": 0.6, "dog": 0.3, "bird": 0.1}
        # Filter by threshold.
        out.append({k: v for k, v in scores.items() if v >= threshold})
    return [out]                                       # list of lists for batched

demo = gr.Interface(
    fn=classify_batch,
    inputs=[
        gr.Image(type="pil", label="Upload image"),
        gr.Slider(0.0, 1.0, value=0.5, label="Confidence threshold"),
    ],
    outputs=gr.Label(num_top_classes=3),
    examples=EXAMPLES,
    cache_examples=True,                               # pre-compute on launch
    title="Image classifier",
    description="Upload an image; results filtered by threshold.",
    batch=True, max_batch_size=4,                      # batch up to 4 concurrent requests
)

demo.queue(default_concurrency_limit=10)               # max 10 concurrent
demo.launch()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: streaming LLM via ChatInterface,
#             OAuth-gated, deployed to Hugging Face Spaces with GPU.
import gradio as gr
import os, time
from typing import Iterator

# === Streaming chat (OpenAI-style) ===
def chat_stream(message: str, history: list[dict]) -> Iterator[str]:
    """Yield tokens; Gradio streams them to the UI."""
    full_response = ""
    # Imagine: OpenAI streaming or local model with token-by-token.
    for token in ["Hello", " there", "!", " How", " can", " I", " help?"]:
        full_response += token
        time.sleep(0.05)
        yield full_response                            # cumulative; Gradio renders progressively

demo = gr.ChatInterface(
    fn=chat_stream,
    type="messages",                                   # OpenAI message format
    title="Chat demo",
    examples=["What's the weather?", "Tell me a joke", "Explain Streamlit"],
    multimodal=False,                                   # set True for image+text inputs
    cache_examples=False,
)

# === Auth ===
# Built-in basic auth:
demo.launch(
    auth=("user", os.environ.get("GRADIO_PASSWORD", "secret")),
    auth_message="Internal demo",
    server_name="0.0.0.0",
    server_port=7860,
)
# Or OAuth via HF Spaces (when deployed there):
# demo.launch()  # HF Spaces handles OAuth via Settings > Access; gr.OAuthProfile in fn signature.

# === Deploying to HF Spaces ===
# 1. Create a Space at huggingface.co/new-space (Gradio template).
# 2. Push your repo:
#    $ git remote add space https://huggingface.co/spaces/USER/myapp
#    $ git push space main
# 3. README.md frontmatter configures the Space:
#    ---
#    title: My Demo
#    emoji: 🤖
#    colorFrom: blue
#    colorTo: purple
#    sdk: gradio
#    sdk_version: 4.44.0
#    app_file: app.py
#    pinned: false
#    hardware: t4-small        # GPU; or cpu-basic for free
#    ---
# 4. Spaces auto-builds; live at huggingface.co/spaces/USER/myapp

# === Programmatic API client ===
# Gradio apps expose a JSON API; call from Python:
# from gradio_client import Client
# client = Client("USER/myapp")
# result = client.predict("hello", api_name="/chat")

# Decision rule:
#   single function → demo                  -> gr.Interface
#   multi-turn chatbot                       -> gr.ChatInterface (built-in streaming)
#   complex multi-input UI                   -> gr.Blocks (next entry)
#   public share with no infra                -> .launch(share=True) tunnel
#   permanent free hosting                   -> Hugging Face Spaces
#   GPU                                       -> HF Spaces hardware= or self-host
#   batched inference                         -> batch=True, max_batch_size=N
#   queue for concurrent users               -> .queue(default_concurrency_limit=N)
#   pre-computed examples                     -> cache_examples=True
#   auth                                      -> auth=(user, pass) or OAuth via HF
#   programmatic call                         -> gradio_client.Client; HTTP API auto-generated
#   embed in another site                     -> iframe with HF Spaces URL
#
# Anti-pattern: launching with share=True in production. The
# *.gradio.live URL is public AND temporary (72-hour TTL). For
# production, deploy to HF Spaces (free for public, paid for private)
# or self-host behind a real load balancer.
```

## Decision Rule

```text
single function → demo                  -> gr.Interface
multi-turn chatbot                       -> gr.ChatInterface (built-in streaming)
complex multi-input UI                   -> gr.Blocks (next entry)
public share with no infra                -> .launch(share=True) tunnel
permanent free hosting                   -> Hugging Face Spaces
GPU                                       -> HF Spaces hardware= or self-host
batched inference                         -> batch=True, max_batch_size=N
queue for concurrent users               -> .queue(default_concurrency_limit=N)
pre-computed examples                     -> cache_examples=True
auth                                      -> auth=(user, pass) or OAuth via HF
programmatic call                         -> gradio_client.Client; HTTP API auto-generated
embed in another site                     -> iframe with HF Spaces URL
```

## Anti-Pattern

> [!warning] Anti-pattern
> launching with share=True in production. The
> *.gradio.live URL is public AND temporary (72-hour TTL). For
> production, deploy to HF Spaces (free for public, paid for private)
> or self-host behind a real load balancer.

## Tips

- `gr.Interface(fn, inputs, outputs)` handles 80% of demos. Components match argument types: `gr.Image` ↔ PIL Image / numpy / file path; `gr.Audio` ↔ tuple(rate, np.array); `gr.Dataframe` ↔ pandas.
- Use `examples=[[...], [...]]` to pre-populate input examples. `cache_examples=True` runs them once at launch and caches outputs.
- `batch=True, max_batch_size=N` accepts batched calls — your function receives lists. Critical for ML inference where batching gets 5-10× speedup.
- `.queue(default_concurrency_limit=N)` controls concurrent users. Default is 1 — bump for parallel inference (GPU-bound, batch=True is even better).
- For chatbots, `gr.ChatInterface` is purpose-built — multi-turn history, streaming via generator, OpenAI message format. Don't reinvent.
- Deploy to Hugging Face Spaces for free permanent hosting (community plan) — GPU available paid. The `share=True` tunnel URL is dev-only.

## Common Mistake

> [!warning] Launching with `share=True` in production. The `*.gradio.live` URL is public AND temporary (72-hour TTL). Users hit a dead URL after a couple days; debugging is opaque (you didn't set up any infra). Deploy to HF Spaces (free, permanent) or self-host behind a real LB.

## Shorthand (Junior → Senior)

**Junior:**
```python
# share=True — public, temporary, no auth
demo.launch(share=True)
```

**Senior:**
```python
# HF Spaces deployment — permanent, optional auth, GPU
$ git push space main    # via huggingface.co/spaces/USER/myapp
```

## See Also

- [[Sections/data-apps/gradio/gradio-blocks|Gradio Blocks — multi-tab UIs, events, state (Data Apps)]]
- [[Sections/data-apps/gradio/_Index|Data Apps → Gradio — ML demos, Blocks, Hugging Face]]
- [[Sections/data-apps/_Index|Data Apps index]]
- [[_Index|Vault index]]
