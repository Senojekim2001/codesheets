---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "signals-slots"
id: "qt-qthread-worker"
title: "QThread + worker QObject — long-running tasks without freezing the UI"
category: "signals-slots"
subtitle: "QThread + worker QObject (worker.moveToThread(thread)), thread.started.connect(worker.run), signals to GUI auto-queued via Qt.AutoConnection, thread.quit / wait, QThreadPool + QRunnable for fire-and-forget tasks"
signature_short: "thread = QThread(); worker = Worker(); worker.moveToThread(thread); thread.started.connect(worker.run); worker.done.connect(thread.quit); thread.start()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QThread + worker QObject — long-running tasks without freezing the UI"
  - "qt-qthread-worker"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/signals-slots"
  - "category/signals-slots"
  - "tier/tiered"
---

# QThread + worker QObject — long-running tasks without freezing the UI

> QThread + worker QObject (worker.moveToThread(thread)), thread.started.connect(worker.run), signals to GUI auto-queued via Qt.AutoConnection, thread.quit / wait, QThreadPool + QRunnable for fire-and-forget tasks

## Overview

The worker-object pattern: `Worker` extends `QObject` with a `run()` slot and result/progress signals. Create a `QThread`, `worker.moveToThread(thread)`, connect `thread.started` → `worker.run`, connect worker signals to GUI slots, `thread.start()`. Cross-thread signals are queued through the GUI thread's event loop — the GUI side never has to think about locks. Three depths solve the SAME task — fetch a URL with `requests` and update a label — at depths: synchronous fetch (UI freezes) → QThread subclass with run() (works but discouraged) → worker-object pattern (the right way).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Click a button, fetch a URL, show byte length.
- **Junior** — SAME — async fetch on click — using QThread *subclass*.
- **Senior** — SAME — async fetch — production: worker-object pattern, reusable thread, cancellable, progress signals, clean teardown.

## Signature

```python
thread = QThread(); worker = Worker(); worker.moveToThread(thread); thread.started.connect(worker.run); worker.done.connect(thread.quit); thread.start()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Click a button, fetch a URL, show byte length.
# APPROACH  - Synchronous requests.get inside the click handler.
# STRENGTHS - Trivial.
# WEAKNESSES- UI freezes for the duration of the request. Unacceptable
#             for anything > 100ms.
import sys
import requests
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout

app = QApplication(sys.argv)
w = QWidget(); layout = QVBoxLayout(w)
label = QLabel("(idle)"); layout.addWidget(label)
btn = QPushButton("Fetch"); layout.addWidget(btn)

def on_click():
    label.setText("fetching...")
    app.processEvents()                                # forces a redraw - hack
    r = requests.get("https://example.com", timeout=5)
    label.setText(f"{len(r.content)} bytes")

btn.clicked.connect(on_click)
w.show(); sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — async fetch on click — using QThread *subclass*.
# APPROACH  - Override QThread.run; emit a signal when done.
# STRENGTHS - Works; no UI freeze.
# WEAKNESSES- Subclassing QThread is the older idiom; the worker-object
#             pattern (senior tier) is the Qt-blessed way and scales better.
import sys
import requests
from PySide6.QtCore import QThread, Signal
from PySide6.QtWidgets import QApplication, QWidget, QPushButton, QLabel, QVBoxLayout


class FetchThread(QThread):
    result = Signal(int)
    error  = Signal(str)

    def __init__(self, url: str) -> None:
        super().__init__()
        self.url = url

    def run(self) -> None:                            # runs on the new thread
        try:
            r = requests.get(self.url, timeout=5)
            self.result.emit(len(r.content))
        except Exception as e:
            self.error.emit(str(e))


app = QApplication(sys.argv)
w = QWidget(); layout = QVBoxLayout(w)
label = QLabel("(idle)"); layout.addWidget(label)
btn = QPushButton("Fetch"); layout.addWidget(btn)

threads: list[FetchThread] = []

def on_click():
    label.setText("fetching...")
    btn.setEnabled(False)
    t = FetchThread("https://example.com")
    t.result.connect(lambda n: label.setText(f"{n} bytes"))
    t.error .connect(lambda s: label.setText(f"error: {s}"))
    t.finished.connect(lambda: btn.setEnabled(True))
    threads.append(t)                                 # keep ref alive
    t.start()

btn.clicked.connect(on_click)
w.show(); sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — async fetch — production: worker-object pattern,
#             reusable thread, cancellable, progress signals, clean teardown.
# APPROACH  - Worker(QObject) moved onto QThread; signals for done/error/progress.
# STRENGTHS - Qt-blessed pattern; reusable across tasks; cancellable;
#             scales to multiple concurrent workers.
# WEAKNESSES- More setup; need to remember to call thread.quit + wait().
from __future__ import annotations
import sys
import time
import requests
from PySide6.QtCore import QObject, QThread, Signal, Slot
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget,
    QPushButton, QLabel, QVBoxLayout, QProgressBar,
)


class FetchWorker(QObject):
    """Lives on a worker thread. Communicates only via signals."""
    progress = Signal(int)                            # 0..100
    done     = Signal(int)                            # bytes
    error    = Signal(str)
    finished = Signal()

    def __init__(self, url: str) -> None:
        super().__init__()
        self.url = url
        self._cancel = False

    @Slot()
    def cancel(self) -> None:
        self._cancel = True

    @Slot()
    def run(self) -> None:
        try:
            with requests.get(self.url, stream=True, timeout=5) as r:
                total = int(r.headers.get("content-length") or 0)
                got = 0
                for chunk in r.iter_content(64 * 1024):
                    if self._cancel:
                        self.error.emit("cancelled")
                        return
                    got += len(chunk)
                    if total:
                        self.progress.emit(int(got * 100 / total))
                self.done.emit(got)
        except Exception as e:
            self.error.emit(str(e))
        finally:
            self.finished.emit()


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("threaded fetch")
        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        self.label = QLabel("(idle)"); layout.addWidget(self.label)
        self.bar = QProgressBar(); layout.addWidget(self.bar)
        self.btn = QPushButton("Fetch"); layout.addWidget(self.btn)
        self.cancel_btn = QPushButton("Cancel"); self.cancel_btn.setEnabled(False)
        layout.addWidget(self.cancel_btn)

        self.btn.clicked.connect(self._start)

        self._thread: QThread | None = None
        self._worker: FetchWorker | None = None

    def _start(self) -> None:
        self.label.setText("fetching..."); self.bar.setValue(0)
        self.btn.setEnabled(False); self.cancel_btn.setEnabled(True)

        self._thread = QThread(self)
        self._worker = FetchWorker("https://example.com")
        self._worker.moveToThread(self._thread)        # CRITICAL

        # Wire signals BEFORE starting.
        self._thread.started.connect(self._worker.run)
        self._worker.progress.connect(self.bar.setValue)
        self._worker.done.connect(self._on_done)
        self._worker.error.connect(self._on_error)
        self._worker.finished.connect(self._thread.quit)
        # Cleanup chain - delete worker + thread after they stop.
        self._worker.finished.connect(self._worker.deleteLater)
        self._thread.finished.connect(self._thread.deleteLater)

        # Cancel button: connect AFTER moveToThread so it dispatches via Qt.
        self.cancel_btn.clicked.connect(self._worker.cancel)

        self._thread.start()

    @Slot(int)
    def _on_done(self, n: int) -> None:
        self.label.setText(f"{n} bytes")
        self.btn.setEnabled(True); self.cancel_btn.setEnabled(False)

    @Slot(str)
    def _on_error(self, msg: str) -> None:
        self.label.setText(f"error: {msg}")
        self.btn.setEnabled(True); self.cancel_btn.setEnabled(False)

    def closeEvent(self, event) -> None:
        if self._thread and self._thread.isRunning():
            if self._worker: self._worker.cancel()
            self._thread.quit()
            self._thread.wait(2000)
        event.accept()


def main() -> int:
    app = QApplication(sys.argv)
    win = MainWindow(); win.show()
    return app.exec()


if __name__ == "__main__":
    sys.exit(main())

# Decision rule:
#   Long-running task with progress + cancel        -> QThread + worker-object (above).
#   One-shot fire-and-forget, many of them          -> QThreadPool + QRunnable.
#   Pure CPU work, GIL bound                        -> QProcess or multiprocessing
#                                                       (NOT QThread - GIL).
#   Lots of small async I/O calls                   -> asyncio in a separate thread + signals.
#   Simple "do this off the GUI thread"             -> QtConcurrent.run (PySide6 has it; PyQt6 doesn't).

# Anti-pattern:
#   class Worker(QThread):
#       def run(self): self.label.setText('done')   # touches GUI from worker
# Worker objects must NEVER touch widgets directly. Emit a signal; the
# main thread handles it. Even if it "works" most of the time, you'll
# eventually crash on a paint event during a cross-thread mutation.
```

## Decision Rule

```text
Long-running task with progress + cancel        -> QThread + worker-object (above).
One-shot fire-and-forget, many of them          -> QThreadPool + QRunnable.
Pure CPU work, GIL bound                        -> QProcess or multiprocessing
                                                    (NOT QThread - GIL).
Lots of small async I/O calls                   -> asyncio in a separate thread + signals.
Simple "do this off the GUI thread"             -> QtConcurrent.run (PySide6 has it; PyQt6 doesn't).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   class Worker(QThread):
>       def run(self): self.label.setText('done')   # touches GUI from worker
> Worker objects must NEVER touch widgets directly. Emit a signal; the
> main thread handles it. Even if it "works" most of the time, you'll
> eventually crash on a paint event during a cross-thread mutation.

## Tips

- Use the worker-object pattern (`worker.moveToThread(thread)`) — Qt docs explicitly recommend it over subclassing QThread.
- Signals across threads marshal automatically via the event loop — the worker emits, the GUI thread's slot runs.
- Always `thread.quit()` + `thread.wait()` (or `deleteLater`) to clean up — leaked QThreads warn at exit.
- For many small one-off tasks, use `QThreadPool` + `QRunnable` — Qt manages the thread lifecycle.
- Workers must never touch widgets directly — only emit signals. Otherwise you'll race the paint loop.

## Common Mistake

> [!warning] Worker code calling `widget.setText(...)` directly. Even if it appears to work, it races against Qt's paint thread and eventually crashes. Always emit a signal.

## See Also

- [[Sections/gui-pyqt/signals-slots/qt-signals-slots|Signal / Slot — Qt's callback system (PyQt / PySide)]]
- [[Sections/gui-pyqt/signals-slots/_Index|PyQt / PySide → Signals, slots, threading]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
