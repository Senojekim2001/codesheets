---
type: "entry"
domain: "python"
file: "gui-pyqt"
section: "styling"
id: "qt-threadpool-runnable"
title: "QThreadPool / QRunnable — fire-and-forget tasks"
category: "styling"
subtitle: "QThreadPool.globalInstance(), QRunnable.run() override, QObject signal carrier (QRunnable can't emit signals directly), priority + auto-delete defaults, Qt6 has QtConcurrent.run for one-shot lambdas"
signature_short: "class Job(QRunnable): def run(self): ...; pool.start(Job())"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "QThreadPool / QRunnable — fire-and-forget tasks"
  - "qt-threadpool-runnable"
tags:
  - "python"
  - "python/gui-pyqt"
  - "python/gui-pyqt/styling"
  - "category/styling"
  - "tier/tiered"
---

# QThreadPool / QRunnable — fire-and-forget tasks

> QThreadPool.globalInstance(), QRunnable.run() override, QObject signal carrier (QRunnable can't emit signals directly), priority + auto-delete defaults, Qt6 has QtConcurrent.run for one-shot lambdas

## Overview

QRunnable is intentionally minimal: override `run()`, hand it to the pool. It can't emit signals (it's not a QObject) — the pattern is to give it a tiny `QObject` "signals" carrier as a member and emit through that. The global thread pool sizes itself to CPU count, reuses threads, and auto-deletes runnables by default. Three depths solve the SAME task — fire 10 background tasks and update a progress label as each finishes — at depths: 10 separate QThreads (heavy) → QRunnable + global thread pool (right way) → QRunnable + signals carrier + progress aggregation + cancellation flag.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Run 10 background "jobs"; print as each finishes.
- **Junior** — SAME — 10 background jobs — using QThreadPool + QRunnable.
- **Senior** — SAME — 10 background jobs — production: progress label updates on each completion; cancel button stops further dispatch.

## Signature

```python
class Job(QRunnable): def run(self): ...; pool.start(Job())
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Run 10 background "jobs"; print as each finishes.
# APPROACH  - 10 QThreads, each runs a function and finishes.
# STRENGTHS - Conceptually simple.
# WEAKNESSES- Spawns and tears down 10 native threads; expensive.
import sys, time, random
from PySide6.QtCore import QThread
from PySide6.QtWidgets import QApplication, QPushButton

class Job(QThread):
    def __init__(self, i: int) -> None:
        super().__init__(); self.i = i
    def run(self) -> None:
        time.sleep(random.random())                   # pretend work
        print(f"job {self.i} done")

app = QApplication(sys.argv)
btn = QPushButton("Start")
threads: list[Job] = []
def go():
    for i in range(10):
        t = Job(i); threads.append(t); t.start()
btn.clicked.connect(go); btn.show()
sys.exit(app.exec())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — 10 background jobs — using QThreadPool + QRunnable.
# APPROACH  - One pool, 10 runnables; pool sizes itself to CPU count.
# STRENGTHS - Cheap to dispatch many; reuses threads.
# WEAKNESSES- QRunnable can't emit signals; need a carrier (senior tier).
import sys, time, random
from PySide6.QtCore import QRunnable, QThreadPool
from PySide6.QtWidgets import QApplication, QPushButton

class Job(QRunnable):
    def __init__(self, i: int) -> None:
        super().__init__()
        self.i = i

    def run(self) -> None:                            # runs on a pool thread
        time.sleep(random.random())
        print(f"job {self.i} done")                   # !! prints from worker thread

app = QApplication(sys.argv)
pool = QThreadPool.globalInstance()
print(f"max threads: {pool.maxThreadCount()}")

btn = QPushButton("Start")
def go():
    for i in range(10):
        pool.start(Job(i))
btn.clicked.connect(go); btn.show()

sys.exit(app.exec())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — 10 background jobs — production: progress label updates
#             on each completion; cancel button stops further dispatch.
# APPROACH  - QRunnable + a JobSignals(QObject) carrier; aggregator slot
#             counts completions; QThreadPool drives concurrency.
# STRENGTHS - Cheap, correct GUI updates via signals; cancellable.
# WEAKNESSES- Once a runnable starts, it runs to completion - cancel only
#             prevents future dispatch (or check a flag inside run()).
from __future__ import annotations
import sys
import time
import random
from PySide6.QtCore import QObject, QRunnable, QThreadPool, Signal, Slot
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QPushButton, QLabel,
)


class JobSignals(QObject):
    """Signal carrier for QRunnable (which is not a QObject)."""
    started  = Signal(int)
    finished = Signal(int)
    error    = Signal(int, str)


class Job(QRunnable):
    def __init__(self, i: int, cancel_flag: list[bool]) -> None:
        super().__init__()
        self.i = i
        self._cancel_flag = cancel_flag               # shared mutable list[bool]
        self.signals = JobSignals()

    @Slot()
    def run(self) -> None:                            # on a pool thread
        if self._cancel_flag[0]:
            return
        try:
            self.signals.started.emit(self.i)
            time.sleep(random.uniform(0.2, 0.8))      # pretend work
            self.signals.finished.emit(self.i)
        except Exception as e:
            self.signals.error.emit(self.i, str(e))


class MainWindow(QMainWindow):
    TOTAL = 10

    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("QThreadPool")
        self.pool = QThreadPool.globalInstance()
        self._cancel = [False]
        self._done = 0

        central = QWidget(); self.setCentralWidget(central)
        layout = QVBoxLayout(central)
        self.label = QLabel(f"0 / {self.TOTAL}"); layout.addWidget(self.label)

        self.start_btn  = QPushButton("Start"); layout.addWidget(self.start_btn)
        self.cancel_btn = QPushButton("Cancel"); self.cancel_btn.setEnabled(False)
        layout.addWidget(self.cancel_btn)

        self.start_btn.clicked.connect(self._start)
        self.cancel_btn.clicked.connect(self._cancel_all)

    def _start(self) -> None:
        self._cancel[0] = False
        self._done = 0
        self.label.setText(f"0 / {self.TOTAL}")
        self.start_btn.setEnabled(False)
        self.cancel_btn.setEnabled(True)

        for i in range(self.TOTAL):
            job = Job(i, self._cancel)
            job.signals.finished.connect(self._on_finished)
            job.signals.error   .connect(lambda i, e: print("err", i, e))
            self.pool.start(job)

    @Slot(int)
    def _on_finished(self, _i: int) -> None:
        self._done += 1
        self.label.setText(f"{self._done} / {self.TOTAL}")
        if self._done == self.TOTAL:
            self.start_btn.setEnabled(True)
            self.cancel_btn.setEnabled(False)

    def _cancel_all(self) -> None:
        # Setting the shared flag prevents already-queued runnables from
        # doing real work (they exit early). The pool itself doesn't
        # support cancelling already-running jobs.
        self._cancel[0] = True
        self.cancel_btn.setEnabled(False)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    w = MainWindow(); w.show()
    sys.exit(app.exec())

# Decision rule:
#   Many short tasks                          -> QThreadPool + QRunnable.
#   Single long-running task with progress    -> QThread + worker QObject.
#   Pure CPU work (numpy, image processing)   -> multiprocessing or QProcess
#                                                (QThreads share the GIL).
#   Need signals from QRunnable               -> separate JobSignals(QObject) member.
#   Need to cancel mid-job                    -> shared cancel flag the run() polls.
#   Want backpressure                          -> pool.setMaxThreadCount(N).
#   One-line "run this lambda off-thread"      -> QtConcurrent.run (PySide6).

# Anti-pattern:
#   class Job(QRunnable, QObject):       # multiple inheritance with QObject
# QRunnable is intentionally not a QObject. Don't try to combine; use a
# separate signal-carrier object. Multiple-inheritance with QObject is
# brittle in Python because of the metaclass Qt uses.
```

## Decision Rule

```text
Many short tasks                          -> QThreadPool + QRunnable.
Single long-running task with progress    -> QThread + worker QObject.
Pure CPU work (numpy, image processing)   -> multiprocessing or QProcess
                                             (QThreads share the GIL).
Need signals from QRunnable               -> separate JobSignals(QObject) member.
Need to cancel mid-job                    -> shared cancel flag the run() polls.
Want backpressure                          -> pool.setMaxThreadCount(N).
One-line "run this lambda off-thread"      -> QtConcurrent.run (PySide6).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   class Job(QRunnable, QObject):       # multiple inheritance with QObject
> QRunnable is intentionally not a QObject. Don't try to combine; use a
> separate signal-carrier object. Multiple-inheritance with QObject is
> brittle in Python because of the metaclass Qt uses.

## Tips

- `QThreadPool.globalInstance()` is shared and sized to CPU count; sufficient for most apps.
- `QRunnable` isn't a QObject — give it a `signals = QObject()` member to emit across threads.
- Auto-delete (`setAutoDelete(True)`, the default) means the pool deletes the runnable after `run()`; don't reuse runnables.
- For backpressure, `pool.setMaxThreadCount(N)` caps concurrency.
- For pure CPU work, threads share the GIL — use `multiprocessing` or `QProcess` instead.

## Common Mistake

> [!warning] Trying to multiply-inherit `class Job(QRunnable, QObject)`. Qt's metaclass + Python multiple inheritance is brittle; use a separate signal-carrier.

## See Also

- [[Sections/gui-pyqt/styling/qt-qss-styling|Qt Style Sheets (QSS) — CSS-like styling (PyQt / PySide)]]
- [[Sections/gui-pyqt/styling/_Index|PyQt / PySide → Styling, dialogs, and threadpools]]
- [[Sections/gui-pyqt/_Index|PyQt / PySide index]]
- [[_Index|Vault index]]
