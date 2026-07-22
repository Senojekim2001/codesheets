---
type: "file-index"
domain: "python"
file: "gui-pyqt"
title: "PyQt / PySide"
tags:
  - "python"
  - "python/gui-pyqt"
  - "index"
---

# PyQt / PySide

> 9 entries across 5 sections.

## QApplication, QWidget, the event loop · 2

- [[Sections/gui-pyqt/basics/qt-qapplication-qwidget|QApplication / QWidget / app.exec — minimal Qt app]] — A Qt app is exactly one `QApplication`, a top-level widget (`QWidget`/`QMainWindow`), `widget.show()`, and `app.exec()` to run the event loop. PySide6 uses `app.exec()`; PyQt6 also uses `app.exec()` (the trailing-underscore form is gone in Qt6).
- [[Sections/gui-pyqt/basics/qt-pyqt-vs-pyside|PyQt6 vs PySide6 — pick one (and how to switch later)]] — PySide6 is the official, LGPL-licensed binding (use for commercial work without paying). PyQt6 is Riverbank's GPL/commercial binding. APIs are 99% identical — `Signal` vs `pyqtSignal`, `Slot` vs `pyqtSlot`, `exec()` vs `exec()`. A small compat shim makes code dual-binding.

## Signals, slots, threading · 2

- [[Sections/gui-pyqt/signals-slots/qt-signals-slots|Signal / Slot — Qt's callback system]] — Signals are typed events emitted from QObjects; slots are callables connected to them. `signal.connect(slot)` is the wiring; `signal.emit(args)` triggers it. Cross-thread connections marshal automatically — the magic that makes worker→GUI communication safe.
- [[Sections/gui-pyqt/signals-slots/qt-qthread-worker|QThread + worker QObject — long-running tasks without freezing the UI]] — Move a `QObject` worker to a `QThread`; communicate via signals. The Qt-blessed pattern is the "worker object" idiom (NOT subclassing QThread). Cross-thread signals are queued automatically — the worker can emit safely from any thread.

## Widgets, models, views · 2

- [[Sections/gui-pyqt/widgets/qt-input-widgets|QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets]] — The standard input widgets and their signals: `QLineEdit.textChanged`, `QComboBox.currentTextChanged`, `QSpinBox.valueChanged`, `QCheckBox.toggled`. Each pairs with a setter (`setText`/`setCurrentText`/`setValue`/`setChecked`) for two-way state.
- [[Sections/gui-pyqt/widgets/qt-listview-tableview|QListView / QTableView — model/view for data]] — Qt's model/view splits data (model) from display (view). For most cases use the convenience widgets `QListWidget` / `QTableWidget` (data + view in one). For real datasets or virtualization, define a `QAbstractTableModel` and pair with a `QSortFilterProxyModel` for free sorting/filtering.

## Layouts and stacked containers · 1

- [[Sections/gui-pyqt/layouts/qt-layouts|QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout]] — Five layouts cover everything: VBox/HBox stack one direction, Grid is rows×cols, Form is auto-aligned label+input, Stacked switches between pages. Layouts can nest. Setting a layout on a widget transfers ownership — the layout manages its children.

## Styling, dialogs, and threadpools · 2

- [[Sections/gui-pyqt/styling/qt-qss-styling|Qt Style Sheets (QSS) — CSS-like styling]] — Qt Style Sheets are CSS-flavored: selectors, properties, pseudo-states (`:hover`, `:focus`, `:disabled`). Apply with `widget.setStyleSheet(qss)` or app-wide via `app.setStyleSheet`. The right tool for theming, dark mode, and custom widget looks.
- [[Sections/gui-pyqt/styling/qt-threadpool-runnable|QThreadPool / QRunnable — fire-and-forget tasks]] — For "I just want to run this off the GUI thread" — `QThreadPool` reuses worker threads, `QRunnable` is the unit of work. Combine with a tiny `QObject` signal carrier for callbacks. Lower overhead than spawning QThreads when you have many short tasks.
