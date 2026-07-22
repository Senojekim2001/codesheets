---
type: "entry"
domain: "python"
file: "gui-tkinter"
section: "advanced"
id: "tk-threading-after"
title: "after / threads / queue — Tk is single-threaded"
category: "advanced"
subtitle: "root.after(ms, fn), threading.Thread + queue.Queue handoff, drain pattern, mainloop is single-threaded, never touch widgets from a thread, after_idle for low-priority work"
signature_short: "root.after(ms, fn); q = queue.Queue(); root.after(50, drain)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "after / threads / queue — Tk is single-threaded"
  - "tk-threading-after"
tags:
  - "python"
  - "python/gui-tkinter"
  - "python/gui-tkinter/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# after / threads / queue — Tk is single-threaded

> root.after(ms, fn), threading.Thread + queue.Queue handoff, drain pattern, mainloop is single-threaded, never touch widgets from a thread, after_idle for low-priority work

## Overview

mainloop runs on one thread. Calling `.config()` from a worker thread will sometimes work, sometimes corrupt state, sometimes hang Tk for good. The pattern: workers do CPU/IO work and push results onto a `queue.Queue`; a `drain()` function called repeatedly via `root.after(50, drain)` reads the queue and updates widgets on the main thread. Three depths solve the SAME task — fetch a URL on a button click, update a label with the result — at depths: directly call `requests.get` in the click handler (UI freezes for the duration) → run in a thread and call `.config` from the thread (race conditions) → thread + queue + after-drain pattern (correct).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Click a button, fetch a URL, show its byte length.
- **Junior** — SAME — fetch URL on click — using a thread (bad: thread updates UI).
- **Senior** — SAME — fetch URL on click — production: thread + queue + after() drain. Cancel is graceful.

## Signature

```python
root.after(ms, fn); q = queue.Queue(); root.after(50, drain)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Click a button, fetch a URL, show its byte length.
# APPROACH  - Synchronous call in the click handler.
# STRENGTHS - Trivially simple; works for fast operations.
# WEAKNESSES- UI freezes during the request - no spinner, no cancel.
import tkinter as tk
from tkinter import ttk
import urllib.request

root = tk.Tk()
status = ttk.Label(root, text="(idle)"); status.pack(padx=12, pady=12)

def on_click():
    status.config(text="fetching...")
    root.update()                                     # forces a redraw before blocking
    data = urllib.request.urlopen("https://example.com").read()
    status.config(text=f"{len(data)} bytes")

ttk.Button(root, text="Fetch", command=on_click).pack()
root.mainloop()
# root.update() is a hack - real solution is threading + queue (junior tier).
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — fetch URL on click — using a thread (bad: thread updates UI).
# APPROACH  - Run the fetch in threading.Thread; thread calls status.config.
# STRENGTHS - UI doesn't freeze.
# WEAKNESSES- Direct widget updates from a thread - works most of the time
#             but can crash, deadlock, or paint stale state. NEVER do this
#             in production. Senior tier shows the right pattern.
import tkinter as tk
from tkinter import ttk
import threading
import urllib.request

root = tk.Tk()
status = ttk.Label(root, text="(idle)"); status.pack(padx=12, pady=12)

def fetch():
    status.config(text="fetching...")                 # !! widget call from thread
    data = urllib.request.urlopen("https://example.com").read()
    status.config(text=f"{len(data)} bytes")          # !! widget call from thread

def on_click():
    threading.Thread(target=fetch, daemon=True).start()

ttk.Button(root, text="Fetch", command=on_click).pack()
root.mainloop()
# Read this code, then read the senior tier. Never ship the version above.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — fetch URL on click — production: thread + queue +
#             after() drain. Cancel is graceful.
# APPROACH  - Worker pushes (status, payload) onto a queue.Queue;
#             root.after(50, drain) polls the queue from the main thread.
# STRENGTHS - Correct (no thread/UI races); responsive; cancellable.
# WEAKNESSES- More moving parts; queue polling has up-to-50ms latency.
from __future__ import annotations
import tkinter as tk
from tkinter import ttk
import queue
import threading
import urllib.request


class FetchApp:
    POLL_MS = 50

    def __init__(self) -> None:
        self.root = tk.Tk()
        self.root.title("fetch")
        self.root.geometry("360x140")

        self.status = ttk.Label(self.root, text="(idle)")
        self.status.pack(padx=12, pady=12)

        self.btn = ttk.Button(self.root, text="Fetch", command=self._on_click)
        self.btn.pack()

        # Worker -> GUI message queue.
        self.q: queue.Queue[tuple[str, object]] = queue.Queue()

        # Start the drain pump; runs forever on the main thread.
        self.root.after(self.POLL_MS, self._drain)

    # ---- main-thread side ----
    def _drain(self) -> None:
        try:
            while True:
                kind, payload = self.q.get_nowait()
                self._handle(kind, payload)
        except queue.Empty:
            pass
        finally:
            self.root.after(self.POLL_MS, self._drain)

    def _handle(self, kind: str, payload: object) -> None:
        if kind == "status":
            self.status.config(text=str(payload))
        elif kind == "done":
            self.status.config(text=f"{payload} bytes")
            self.btn.config(state="normal", text="Fetch")
        elif kind == "error":
            self.status.config(text=f"error: {payload}")
            self.btn.config(state="normal", text="Fetch")

    # ---- click + worker ----
    def _on_click(self) -> None:
        self.btn.config(state="disabled", text="Fetching...")
        threading.Thread(target=self._fetch, daemon=True).start()

    def _fetch(self) -> None:                         # runs in a worker thread
        try:
            self.q.put(("status", "fetching..."))
            data = urllib.request.urlopen("https://example.com", timeout=5).read()
            self.q.put(("done", len(data)))
        except Exception as e:
            self.q.put(("error", e))

    def run(self) -> None:
        self.root.mainloop()


if __name__ == "__main__":
    FetchApp().run()

# Decision rule:
#   Fast (< 50ms) work                       -> just do it in the callback.
#   IO-bound work (HTTP, file read)          -> threading.Thread + queue + after-drain.
#   CPU-bound work                           -> multiprocessing (NOT threading - GIL).
#   Need to schedule a one-shot future call  -> root.after(ms, fn).
#   Need a periodic ticker                   -> after() that reschedules itself.
#   Need to integrate with asyncio           -> tkinter has no native async; use a separate
#                                                thread running asyncio + queue handoff.
#   Need real-time-ish updates               -> POLL_MS = 16 (~60Hz) but watch CPU.

# Anti-pattern:
#   threading.Thread(target=lambda: label.config(text="done"))
# Direct widget calls from a non-main thread. Works on a quiet day,
# corrupts state on a noisy one. Always go through queue + after.
```

## Decision Rule

```text
Fast (< 50ms) work                       -> just do it in the callback.
IO-bound work (HTTP, file read)          -> threading.Thread + queue + after-drain.
CPU-bound work                           -> multiprocessing (NOT threading - GIL).
Need to schedule a one-shot future call  -> root.after(ms, fn).
Need a periodic ticker                   -> after() that reschedules itself.
Need to integrate with asyncio           -> tkinter has no native async; use a separate
                                             thread running asyncio + queue handoff.
Need real-time-ish updates               -> POLL_MS = 16 (~60Hz) but watch CPU.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   threading.Thread(target=lambda: label.config(text="done"))
> Direct widget calls from a non-main thread. Works on a quiet day,
> corrupts state on a noisy one. Always go through queue + after.

## Tips

- `root.after(ms, fn)` is the only safe scheduler — never `time.sleep()` in the GUI thread.
- Workers post to a `queue.Queue`; the main thread drains via `root.after(50, drain)`.
- CPU-bound work goes in a separate **process** (multiprocessing) — Python's GIL makes threads useless for it.
- Avoid `root.update()` mid-callback — it re-enters mainloop and can fire other events, leading to nasty bugs.
- For asyncio integration, run the loop in a thread and use `asyncio.run_coroutine_threadsafe` with a queue back to Tk.

## Common Mistake

> [!warning] Calling `widget.config()` from a worker thread. It looks like it works. It will crash in front of users. Use the queue + after-drain pattern.

## See Also

- [[Sections/gui-tkinter/advanced/tk-canvas|tk.Canvas — drawing, dragging, custom widgets (Tkinter)]]
- [[Sections/gui-tkinter/advanced/tk-async-loop|asyncio + Tk — running an async loop alongside mainloop (Tkinter)]]
- [[Sections/gui-tkinter/advanced/_Index|Tkinter → Threading, Canvas, async patterns]]
- [[Sections/gui-tkinter/_Index|Tkinter index]]
- [[_Index|Vault index]]
