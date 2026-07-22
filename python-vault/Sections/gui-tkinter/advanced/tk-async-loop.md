---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "advanced"
id: "tk-async-loop"
title: "asyncio + Tk — running an async loop alongside mainloop"
category: "advanced"
subtitle: "asyncio.new_event_loop in worker thread, run_coroutine_threadsafe (GUI -> async), queue.Queue (async -> GUI), root.after drain, awaiting future.result() vs callback"
signature_short: "asyncio.run_coroutine_threadsafe(coro, loop); future.add_done_callback(lambda f: q.put(f.result()))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "asyncio + Tk — running an async loop alongside mainloop"
  - "tk-async-loop"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# asyncio + Tk — running an async loop alongside mainloop

> asyncio.new_event_loop in worker thread, run_coroutine_threadsafe (GUI -> async), queue.Queue (async -> GUI), root.after drain, awaiting future.result() vs callback

## Overview

Two threads: the GUI thread runs `mainloop`; an asyncio thread runs `loop.run_forever()`. To call an async function from a click handler, use `asyncio.run_coroutine_threadsafe(coro, loop)` — that returns a `concurrent.futures.Future` you can attach a callback to. The callback (still on the asyncio thread) puts a result on a `queue.Queue`; Tk's drain reads it. Three depths solve the SAME task — fetch a URL with httpx and show the byte length — at depths: blocking requests in handler → asyncio.run() per click (creates+destroys a loop, slow) → persistent asyncio loop in a thread + run_coroutine_threadsafe + queue drain.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Click button -> fetch a URL -> show byte length.
- **Junior** — SAME — async fetch — but creating an asyncio loop per click.
- **Senior** — SAME — async fetch — production: persistent asyncio loop in a worker thread, GUI -> coro via run_coroutine_threadsafe, coro -> GUI via queue + after-drain.

## Signature

```python
asyncio.run_coroutine_threadsafe(coro, loop); future.add_done_callback(lambda f: q.put(f.result()))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Click button -> fetch a URL -> show byte length.
# APPROACH  - Sync requests.get inside the click handler.
# STRENGTHS - No asyncio at all.
# WEAKNESSES- UI freezes during the request.
import tkinter as tk
from tkinter import ttk
import requests

root = tk.Tk()
status = ttk.Label(root, text="(idle)"); status.pack(padx=12, pady=12)

def on_click():
    status.config(text="fetching...")
    root.update()
    r = requests.get("https://example.com", timeout=5)
    status.config(text=f"{len(r.content)} bytes")

ttk.Button(root, text="Fetch", command=on_click).pack()
root.mainloop()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — async fetch — but creating an asyncio loop per click.
# APPROACH  - asyncio.run() inside the click handler in a thread.
# STRENGTHS - Demonstrates async/await; UI doesn't freeze.
# WEAKNESSES- New loop per click is wasteful; can't await across calls;
#             async libs that cache connections (httpx) lose state.
import tkinter as tk
from tkinter import ttk
import asyncio
import threading
import httpx

root = tk.Tk()
status = ttk.Label(root, text="(idle)"); status.pack(padx=12, pady=12)


async def fetch():
    async with httpx.AsyncClient() as client:
        r = await client.get("https://example.com", timeout=5)
        return len(r.content)


def runner():
    n = asyncio.run(fetch())                          # new loop, new client
    status.config(text=f"{n} bytes")                  # !! widget call from thread


def on_click():
    status.config(text="fetching...")
    threading.Thread(target=runner, daemon=True).start()


ttk.Button(root, text="Fetch", command=on_click).pack()
root.mainloop()
# This works most of the time but suffers all the threading-rules
# violations the senior tier fixes.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — async fetch — production: persistent asyncio loop in a
#             worker thread, GUI -> coro via run_coroutine_threadsafe,
#             coro -> GUI via queue + after-drain.
# APPROACH  - One loop, one httpx.AsyncClient (reused), threadsafe handoff.
# STRENGTHS - Connection pooling; correct widget access; clean shutdown.
# WEAKNESSES- More setup; two threads to reason about.
from __future__ import annotations
import tkinter as tk
from tkinter import ttk
import asyncio
import queue
import threading
import httpx


class AsyncTk:
    """Persistent asyncio loop on a worker thread, with thread-safe handoff."""

    def __init__(self) -> None:
        self.loop = asyncio.new_event_loop()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        self.client: httpx.AsyncClient | None = None
        # Initialise the client on the loop thread.
        asyncio.run_coroutine_threadsafe(self._setup(), self.loop).result()

    def _run(self) -> None:
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    async def _setup(self) -> None:
        self.client = httpx.AsyncClient(timeout=5)

    def submit(self, coro):
        """Run a coroutine on the asyncio thread; returns a Future."""
        return asyncio.run_coroutine_threadsafe(coro, self.loop)

    def shutdown(self) -> None:
        if self.client is not None:
            asyncio.run_coroutine_threadsafe(self.client.aclose(), self.loop).result()
        self.loop.call_soon_threadsafe(self.loop.stop)


class App:
    POLL_MS = 50

    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("async fetch")
        self.root.geometry("360x140")

        self.async_tk = AsyncTk()
        self.q: queue.Queue[tuple[str, object]] = queue.Queue()

        self.status = ttk.Label(self.root, text="(idle)")
        self.status.pack(padx=12, pady=12)
        self.btn = ttk.Button(self.root, text="Fetch", command=self._on_click)
        self.btn.pack()

        self.root.protocol("WM_DELETE_WINDOW", self._on_close)
        self.root.after(self.POLL_MS, self._drain)

    # ---- coroutine ----
    async def _fetch(self) -> int:
        assert self.async_tk.client is not None
        r = await self.async_tk.client.get("https://example.com")
        return len(r.content)

    # ---- main thread plumbing ----
    def _on_click(self) -> None:
        self.btn.config(state="disabled", text="Fetching...")
        fut = self.async_tk.submit(self._fetch())
        # Callback runs ON THE ASYNCIO THREAD - just push to queue.
        fut.add_done_callback(lambda f: self.q.put(
            ("done", f.result()) if not f.exception() else ("error", f.exception())
        ))

    def _drain(self) -> None:
        try:
            while True:
                kind, payload = self.q.get_nowait()
                if kind == "done":
                    self.status.config(text=f"{payload} bytes")
                else:
                    self.status.config(text=f"error: {payload}")
                self.btn.config(state="normal", text="Fetch")
        except queue.Empty:
            pass
        finally:
            self.root.after(self.POLL_MS, self._drain)

    def _on_close(self) -> None:
        self.async_tk.shutdown()
        self.root.destroy()

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    App().run()

# Decision rule:
#   Sync libraries only                       -> threading.Thread + queue (no asyncio).
#   Single async call, very rare              -> asyncio.run() in a thread (junior tier).
#   Many async calls, shared client/state     -> persistent loop pattern (above).
#   Need to await across multiple Tk events   -> persistent loop + futures.
#   Want to use anyio/asyncqt                 -> they exist; pure stdlib gets you 90%.

# Anti-pattern:
#   loop.run_until_complete(coro)             # called from inside a callback
# This blocks the asyncio thread waiting for the coro AND blocks the GUI
# thread if you called it from there. Always use run_coroutine_threadsafe
# from the GUI thread; never call loop methods directly from outside the
# loop's thread.
```

## Decision Rule

```text
Sync libraries only                       -> threading.Thread + queue (no asyncio).
Single async call, very rare              -> asyncio.run() in a thread (junior tier).
Many async calls, shared client/state     -> persistent loop pattern (above).
Need to await across multiple Tk events   -> persistent loop + futures.
Want to use anyio/asyncqt                 -> they exist; pure stdlib gets you 90%.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   loop.run_until_complete(coro)             # called from inside a callback
> This blocks the asyncio thread waiting for the coro AND blocks the GUI
> thread if you called it from there. Always use run_coroutine_threadsafe
> from the GUI thread; never call loop methods directly from outside the
> loop's thread.

## Tips

- Run asyncio in its own daemon thread; never call loop methods from the GUI thread except `run_coroutine_threadsafe` and `call_soon_threadsafe`.
- GUI → coro: `asyncio.run_coroutine_threadsafe(coro, loop)` returns a `concurrent.futures.Future`.
- Coro → GUI: callback on the future puts a result on a `queue.Queue`; main thread drains via `after`.
- Reuse a single `httpx.AsyncClient` (or any async client) across calls — the per-click `asyncio.run` antipattern destroys connection pools.
- For pure stdlib, this pattern is enough; libraries like `asyncqt`/`anyio` exist for tighter integration.

## Common Mistake

> [!warning] Calling `loop.run_until_complete()` from a Tk callback. It blocks the GUI thread; the whole app freezes until the coroutine returns.

## See Also

- [[Sections/gui-tkinter/advanced/tk-threading-after|after / threads / queue — Tk is single-threaded (Tkinter)]]
- [[Sections/gui-tkinter/advanced/tk-canvas|tk.Canvas — drawing, dragging, custom widgets (Tkinter)]]
- [[Sections/gui-tkinter/advanced/_Index|Tkinter → Threading, Canvas, async patterns]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
