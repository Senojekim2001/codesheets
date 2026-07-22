---
type: "entry"
domain: "python"
file: "packaging"
section: "distribution"
id: "package-structure"
title: "Package Structure — src/ Layout & __init__.py"
category: "Packaging"
subtitle: "src/ layout, __init__.py, __all__, namespace packages"
signature_short: "src/my_package/__init__.py  |  __all__ = [\"func1\", \"class1\"]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Package Structure — src/ Layout & __init__.py"
  - "package-structure"
tags:
  - "python"
  - "python/packaging"
  - "python/packaging/distribution"
  - "category/packaging"
  - "tier/tiered"
---

# Package Structure — src/ Layout & __init__.py

> src/ layout, __init__.py, __all__, namespace packages

## Overview

The src/ layout separates source code from tests and config, preventing accidental imports of the development version. __init__.py makes a directory a package. __all__ explicitly exports the public API. Namespace packages allow multiple packages to share a namespace (rare, use for plugins). Best practice: use src/my_package/ structure with pyproject.toml [tool.hatch.build.targets.wheel] packages = ["src/my_package"].

## Signature

```python
src/my_package/__init__.py  |  __all__ = ["func1", "class1"]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One package directory under src/, an __init__.py, tests in a sibling tests/ folder.
# STRENGTHS - 'pip install -e .' makes 'import my_package' work the same as it will after install.
# WEAKNESSES- One layer of indirection (src/) confuses newcomers used to flat layouts.
# Tree:
#   my-package/
#   ├── pyproject.toml
#   ├── README.md
#   ├── src/
#   │   └── my_package/
#   │       ├── __init__.py
#   │       └── core.py
#   └── tests/
#       └── test_core.py

# src/my_package/__init__.py:
"""My package."""
__version__ = "0.1.0"
from .core import greet
__all__ = ["greet", "__version__"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - src/ layout, explicit __all__, sub-packages, py.typed marker, conftest.py at tests root.
# STRENGTHS - Tests import the INSTALLED package -- catches missing files / bad MANIFEST early.
# WEAKNESSES- 'editable' installs across multiple sub-packages need importlib_resources for data files.
# Tree:
#   my-package/
#   ├── pyproject.toml
#   ├── src/
#   │   └── my_package/
#   │       ├── __init__.py
#   │       ├── py.typed                # ship type hints (PEP 561)
#   │       ├── core.py
#   │       ├── cli.py
#   │       └── plugins/
#   │           ├── __init__.py
#   │           └── http.py
#   └── tests/
#       ├── conftest.py
#       └── test_core.py

# src/my_package/__init__.py
"""Public surface only -- internals stay inside the package."""
from .core import Pipeline, process
from .cli import main as cli_main

__all__ = ["Pipeline", "process", "cli_main"]    # 'import *' obeys this
__version__ = "1.0.0"

# pyproject.toml essentials:
# [tool.hatch.build.targets.wheel]
# packages = ["src/my_package"]
#
# # Include data files alongside code:
# [tool.hatch.build.targets.wheel.force-include]
# "src/my_package/py.typed" = "my_package/py.typed"
# "src/my_package/data/templates" = "my_package/data/templates"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - src/ layout, namespace packages for plugins, importlib.resources for data, lazy imports for fast startup.
# STRENGTHS - Hermetic imports, plugin-friendly, fast CLI startup; ships type hints; package tests import the wheel.
# WEAKNESSES- Namespace packages require ALL members to omit __init__.py at the namespace root -- mix-ups break imports silently.
# 1) Namespace package for plug-ins (PEP 420):
#    Multiple distributions can extend the SAME root, e.g.:
#      myapp_plugins/auth/__init__.py     (in package 'myapp-plugins-auth')
#      myapp_plugins/db/__init__.py       (in package 'myapp-plugins-db')
#    The namespace 'myapp_plugins' has NO __init__.py anywhere.

# 2) Lazy-import root __init__.py keeps CLI startup snappy:
# src/my_package/__init__.py
import importlib
from typing import TYPE_CHECKING

if TYPE_CHECKING:                    # mypy / IDE see real names
    from .core import Pipeline, process

__all__ = ["Pipeline", "process"]
_LAZY = {"Pipeline": "my_package.core", "process": "my_package.core"}

def __getattr__(name: str):           # PEP 562 module __getattr__
    if name in _LAZY:
        mod = importlib.import_module(_LAZY[name])
        val = getattr(mod, name)
        globals()[name] = val          # cache for next access
        return val
    raise AttributeError(name)

# 3) Data files via importlib.resources -- works for zip, wheel, editable:
import importlib.resources as resources
def load_template(name: str) -> str:
    return resources.files("my_package.data.templates").joinpath(name).read_text(encoding="utf-8")

# 4) Plug-in discovery via entry points:
# pyproject.toml:
#   [project.entry-points."my_package.plugins"]
#   http = "my_package.plugins.http:Plugin"
#
# In code:
from importlib.metadata import entry_points
def load_plugins() -> dict:
    return {ep.name: ep.load() for ep in entry_points(group="my_package.plugins")}

# Decision rule:
#   library you intend to ship                  -> src/ layout, ALWAYS
#   single-file script                          -> flat layout fine; no need for src/
#   ships type hints                            -> add py.typed marker AND include in wheel
#   package data files (templates, schemas)     -> importlib.resources, NOT __file__-relative paths
#   plug-in surface for third parties           -> entry_points group OR PEP 420 namespace package
#   fast CLI startup                            -> lazy __getattr__ in root __init__; defer heavy imports
#   need to expose internal helpers in tests    -> tests import via 'from my_package._internal import x',
#                                                   prefix internals with '_' so __all__ + IDEs hide them
#
# Anti-pattern: 'from my_package import *' as the only documentation of your
# public API. Without __all__, callers see and depend on private names; you can
# never refactor internals without breaking them. Define __all__ explicitly.
```

## Decision Rule

```text
library you intend to ship                  -> src/ layout, ALWAYS
single-file script                          -> flat layout fine; no need for src/
ships type hints                            -> add py.typed marker AND include in wheel
package data files (templates, schemas)     -> importlib.resources, NOT __file__-relative paths
plug-in surface for third parties           -> entry_points group OR PEP 420 namespace package
fast CLI startup                            -> lazy __getattr__ in root __init__; defer heavy imports
need to expose internal helpers in tests    -> tests import via 'from my_package._internal import x',
                                                prefix internals with '_' so __all__ + IDEs hide them
```

## Anti-Pattern

> [!warning] Anti-pattern
> 'from my_package import *' as the only documentation of your
> public API. Without __all__, callers see and depend on private names; you can
> never refactor internals without breaking them. Define __all__ explicitly.

## Tips

- Use src/ layout — tests import the installed package, not the development version. This catches import errors early.
- __all__ is explicit — everyone sees exactly what's part of the public API. Omit __ prefixed items.
- Namespace packages are rare — only use them for plugin systems where multiple vendors share a namespace; expose plug-in surfaces via [project.entry-points] groups loaded with importlib.metadata.entry_points.
- Empty __init__.py is fine — it just marks the directory as a package. Read package data with `importlib.resources.files("pkg.data").joinpath(...)`, NOT __file__-relative paths (works in zips, wheels, editable installs). For fast CLI startup, use PEP 562 module __getattr__ to lazy-import heavy submodules.

## Common Mistake

> [!warning] `from my_package import *` as the only documentation of your public API — without __all__, callers see and depend on private names; you can never refactor internals without breaking them. Define __all__ explicitly. Also: putting code at root instead of src/ masks import issues until release.

## Shorthand (Junior → Senior)

**Junior:**
```python
my_package/
├── core.py
├── utils.py
└── __init__.py
```

**Senior:**
```python
src/my_package/
├── __init__.py
├── core.py
└── utils.py
```

## See Also

- [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager (Packaging, CLI & Tooling)]]
- [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing (Packaging, CLI & Tooling)]]
- [[Sections/packaging/distribution/_Index|Packaging, CLI & Tooling → Distribution & Publishing]]
- [[Sections/packaging/_Index|Packaging, CLI & Tooling index]]
- [[_Index|Vault index]]
