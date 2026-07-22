---
type: "entry"
domain: "python"
file: "notebooks"
section: "jupyter-basics"
id: "jupyter-kernel-management"
title: "Kernels & environments — per-project Python, JupyterLab vs notebook"
category: "Jupyter Basics"
subtitle: "ipykernel install, jupyter kernelspec list, project-specific venvs, JupyterLab vs notebook (classic), nb_conda_kernels for conda, .jupyter/jupyter_server_config.py"
signature_short: "python -m ipykernel install --user --name=myproject --display-name=\"Python (myproject)\""
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Kernels & environments — per-project Python, JupyterLab vs notebook"
  - "jupyter-kernel-management"
tags:
  - "python"
  - "python/notebooks"
  - "python/notebooks/jupyter-basics"
  - "category/jupyter-basics"
  - "tier/tiered"
---

# Kernels & environments — per-project Python, JupyterLab vs notebook

> ipykernel install, jupyter kernelspec list, project-specific venvs, JupyterLab vs notebook (classic), nb_conda_kernels for conda, .jupyter/jupyter_server_config.py

## Overview

A Jupyter kernel is a Python process started by the notebook server. By default a single kernel uses the system Python — broken once you have more than one project. The discipline: each project gets its own venv AND its own registered kernel (`python -m ipykernel install --user --name=myproject`). Switch kernels via the notebook UI or `Kernel → Change kernel`. JupyterLab is the active UI (lab >= 4.0); the old `notebook` package is now nbclassic. The three examples solve the SAME concrete task — set up a project-specific kernel, work in JupyterLab — at three depths: install ipykernel into a venv → kernelspec management + display names → production with kernelspec.json customization, env vars, resource limits.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Set up a per-project kernel. Each project: own venv, own kernel.
- **Junior** — SAME — but with explicit kernelspec, env vars, conda support.
- **Senior** — SAME — production: shared team kernels via JupyterHub, resource-limited via JupyterLab Pro / KubeSpawner.

## Signature

```python
python -m ipykernel install --user --name=myproject --display-name="Python (myproject)"
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Set up a per-project kernel.
# Each project: own venv, own kernel.

# In your project venv:
#   $ python -m venv .venv
#   $ source .venv/bin/activate
#   $ pip install ipykernel pandas numpy
#   $ python -m ipykernel install --user --name=myproject --display-name="Python (myproject)"

# Now in JupyterLab:
#   Kernel menu → Change kernel → "Python (myproject)"

# List installed kernels:
#   $ jupyter kernelspec list
#   Available kernels:
#     python3        /usr/local/share/jupyter/kernels/python3      (system)
#     myproject      /Users/me/.local/share/jupyter/kernels/myproject

# Remove a kernel:
#   $ jupyter kernelspec remove myproject

# Why per-project:
#   - One project needs pandas 1.5; another needs 2.x. Same kernel breaks one.
#   - Conflicting deps (numpy 1 vs numpy 2 ABI) crash imports.
#   - Reproducibility: the kernel maps to the project's pinned env.

# JupyterLab vs notebook:
#   $ pip install jupyterlab        # modern UI; recommended
#   $ jupyter lab
#   $ pip install notebook           # classic UI (nbclassic in lab>=4)
#   $ jupyter notebook
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with explicit kernelspec, env vars, conda support.

# === Better install: full kernelspec.json ===
# After 'python -m ipykernel install', edit:
#   ~/.local/share/jupyter/kernels/myproject/kernel.json
# {
#  "argv": [
#    "/path/to/project/.venv/bin/python",
#    "-m", "ipykernel_launcher",
#    "-f", "{connection_file}"
#  ],
#  "display_name": "Python (myproject)",
#  "language": "python",
#  "env": {
#    "PYTHONPATH": "/path/to/project/src",
#    "DATABASE_URL": "postgresql://..."
#  },
#  "metadata": {
#    "debugger": true
#  }
# }

# === Conda kernels via nb_conda_kernels ===
# pip install nb_conda_kernels
# Now Jupyter shows ALL conda envs as kernels automatically.

# === Direnv + auto-activate ===
# .envrc in project root:
#   export VIRTUAL_ENV="$(pwd)/.venv"
#   PATH_add "$VIRTUAL_ENV/bin"
# Then: $ direnv allow
# Now cd into the project automatically activates the venv.

# === pip install -e . in dev ===
# Always install your project in editable mode in its venv:
#   $ pip install -e .
# This makes your package importable AND pickable up edits with autoreload.

# === Useful kernel commands ===
# Restart kernel:        Kernel → Restart (or 0 0)
# Restart + run all:     Kernel → Restart and Run All
# Interrupt:              Kernel → Interrupt (or i i)
# Reset namespace:        %reset -f

# Check what kernel a notebook expects:
import json
with open("notebook.ipynb") as f:
    nb = json.load(f)
print(nb["metadata"]["kernelspec"])
# {"name": "myproject", "display_name": "Python (myproject)", "language": "python"}
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: shared team kernels via JupyterHub,
#             resource-limited via JupyterLab Pro / KubeSpawner.

# === JupyterHub: multi-user notebook server ===
# Each user gets their own kernel; admin manages shared images.

# Install JupyterHub:
#   $ pip install jupyterhub
#   $ npm install -g configurable-http-proxy
#   $ jupyterhub --generate-config

# === DockerSpawner: each user spawns a container ===
# jupyterhub_config.py:
# c.JupyterHub.spawner_class = "dockerspawner.DockerSpawner"
# c.DockerSpawner.image = "jupyter/datascience-notebook:python-3.12"
# c.DockerSpawner.network_name = "jupyterhub-net"
# c.DockerSpawner.notebook_dir = "/home/jovyan/work"
# c.DockerSpawner.volumes = {"jupyterhub-user-{username}": "/home/jovyan/work"}
# c.DockerSpawner.mem_limit = "4G"
# c.DockerSpawner.cpu_limit = 2

# === KubeSpawner: each user gets a pod ===
# c.JupyterHub.spawner_class = "kubespawner.KubeSpawner"
# c.KubeSpawner.image = "myorg/jupyter-base:1.4.2"
# c.KubeSpawner.cpu_limit = 2
# c.KubeSpawner.mem_limit = "4G"
# c.KubeSpawner.profile_list = [
#     {"display_name": "Standard", "default": True,
#      "kubespawner_override": {"image": "myorg/jupyter-base:1.4.2"}},
#     {"display_name": "GPU (T4)",
#      "kubespawner_override": {"image": "myorg/jupyter-gpu:1.4.2",
#                               "extra_resource_limits": {"nvidia.com/gpu": 1}}},
# ]

# === Authentication ===
# c.JupyterHub.authenticator_class = "oauthenticator.GitHubOAuthenticator"
# c.GitHubOAuthenticator.client_id = "..."
# c.GitHubOAuthenticator.client_secret = "..."
# Or LDAP, OIDC, dummy (dev only).

# Decision rule:
#   one user, one machine                 -> jupyter lab + venv + ipykernel
#   per-project envs                        -> ipykernel install --name=PROJECT (always)
#   conda user                              -> nb_conda_kernels for auto-discovery
#   team of N users                         -> JupyterHub
#   team needs GPU                          -> KubeSpawner with GPU profile
#   need notebooks behind auth              -> JupyterHub + OAuthenticator
#   need to scale to 100s of users          -> JupyterHub on k8s; per-pod limits
#   notebook breaks across kernels          -> kernel.json env section; pin python path
#   want JupyterLab, not classic            -> pip install jupyterlab; jupyter lab
#   want classic                             -> pip install notebook; jupyter notebook
#   want both                                -> jupyter-server hosts both
#   notebook in CI                           -> nbval / pytest-notebook (later entry)
#   shareable read-only                       -> nbconvert to HTML; OR Voila
#
# Anti-pattern: installing project deps into the system Python or the
# default 'python3' kernel. First time you have two projects with
# conflicting versions of pandas, both notebooks break. Always: venv
# per project, kernel per venv, and notebooks pin the kernel name in
# their metadata.
```

## Decision Rule

```text
one user, one machine                 -> jupyter lab + venv + ipykernel
per-project envs                        -> ipykernel install --name=PROJECT (always)
conda user                              -> nb_conda_kernels for auto-discovery
team of N users                         -> JupyterHub
team needs GPU                          -> KubeSpawner with GPU profile
need notebooks behind auth              -> JupyterHub + OAuthenticator
need to scale to 100s of users          -> JupyterHub on k8s; per-pod limits
notebook breaks across kernels          -> kernel.json env section; pin python path
want JupyterLab, not classic            -> pip install jupyterlab; jupyter lab
want classic                             -> pip install notebook; jupyter notebook
want both                                -> jupyter-server hosts both
notebook in CI                           -> nbval / pytest-notebook (later entry)
shareable read-only                       -> nbconvert to HTML; OR Voila
```

## Anti-Pattern

> [!warning] Anti-pattern
> installing project deps into the system Python or the
> default 'python3' kernel. First time you have two projects with
> conflicting versions of pandas, both notebooks break. Always: venv
> per project, kernel per venv, and notebooks pin the kernel name in
> their metadata.

## Tips

- Always install `ipykernel` per-venv: `python -m ipykernel install --user --name=PROJECT`. Never share kernels across projects.
- `jupyter kernelspec list` shows all installed kernels and their python paths — first stop when "wrong package version" mysteries appear.
- For shared env vars, edit `kernel.json`'s `env` field — the kernel inherits these on launch. Useful for `DATABASE_URL`, `PYTHONPATH`, etc.
- JupyterLab (>= 4.0) is the modern UI; `jupyter notebook` (now nbclassic) lives on for muscle-memory users. Both share the kernel infrastructure.
- For team deployments, JupyterHub + KubeSpawner gives each user a pod with their own kernel + resource limits. GPU profiles for ML teams.
- Use `nb_conda_kernels` if your team uses conda — it auto-discovers conda envs as kernels (no manual install per env).

## Common Mistake

> [!warning] Installing project dependencies into the system `python3` kernel. First time you have two projects with conflicting `pandas` versions, both notebooks break — and the fix (uninstall + reinstall) breaks the OTHER project. Always: venv per project, kernel per venv, kernel name in notebook metadata.

## Shorthand (Junior → Senior)

**Junior:**
```python
# All projects share the system kernel — version conflicts inevitable
$ pip install pandas numpy
$ jupyter notebook
```

**Senior:**
```python
# Per-project venv + kernel
$ python -m venv .venv && source .venv/bin/activate
$ pip install -e . ipykernel
$ python -m ipykernel install --user --name=myproject
```

## See Also

- [[Sections/notebooks/jupyter-basics/jupyter-magic-commands|IPython magic commands — %time, %autoreload, %%writefile (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/ipython-display-widgets|IPython.display & ipywidgets — rich output and interactivity (Notebooks)]]
- [[Sections/notebooks/jupyter-basics/_Index|Notebooks → Jupyter basics — magics, display, kernels]]
- [[Sections/notebooks/_Index|Notebooks index]]
- [[_Index|Vault index]]
