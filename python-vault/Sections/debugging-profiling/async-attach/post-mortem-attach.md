---
type: "entry"
domain: "python"
file: "debugging-profiling"
section: "async-attach"
id: "post-mortem-attach"
title: "Production attach — inspect a live process without restart"
category: "Production Debugging"
subtitle: "py-spy dump, debugpy.listen, debugpy --attach, manhole.install, aiomonitor, ssh tunnel, kubectl port-forward, ptrace permissions"
signature_short: "py-spy dump --pid 12345   # or: debugpy --listen 0.0.0.0:5678 --pid 12345"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Production attach — inspect a live process without restart"
  - "post-mortem-attach"
tags:
  - "python"
  - "python/debugging-profiling"
  - "python/debugging-profiling/async-attach"
  - "category/production-debugging"
  - "tier/tiered"
---

# Production attach — inspect a live process without restart

> py-spy dump, debugpy.listen, debugpy --attach, manhole.install, aiomonitor, ssh tunnel, kubectl port-forward, ptrace permissions

## Overview

When a production service is hung, slow, or returning wrong data, you have three goals — see what each thread is doing, peek at runtime state, and ideally not restart the process. Each goal has a different tool: py-spy dump for instant non-interactive stacks; manhole or aiomonitor for in-process REPL; debugpy for full IDE attach. Each has different security requirements: ptrace capability for py-spy/debugpy; a localhost socket for manhole; an open telnet for aiomonitor. The three examples solve the SAME concrete task — a Kubernetes pod is misbehaving and you need to inspect it without restart — at three depths: py-spy dump for instant stacks → manhole REPL for live state inspection → debugpy attach over a port-forwarded socket for full breakpoint-driven debugging.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — A production process is misbehaving (slow, hung, wrong output). Inspect it without restart.
- **Junior** — SAME — but you need to inspect VARIABLES (cache contents, config flags, what's in a queue) — stacks aren't enough.
- **Senior** — SAME — production-grade: full IDE-driven debugging on a container in a Kubernetes pod, with breakpoints, watch expressions, and step-through. No code change to the running pod.

## Signature

```python
py-spy dump --pid 12345   # or: debugpy --listen 0.0.0.0:5678 --pid 12345
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - A production process is misbehaving (slow, hung, wrong output).
#             Inspect it without restart.
# APPROACH  - py-spy dump --pid <PID>: prints a Python traceback for every
#             thread in the process, instantly. No code change required.
# STRENGTHS - Stdlib of production debugging; one command; works on any
#             unmodified process; near-zero overhead during the dump.
# WEAKNESSES- Stack-only — you see WHAT each thread is doing, not the
#             values of locals. For state inspection, see junior tier.

# Install once on each host where you'll diagnose:
#   $ pip install py-spy            # or apt/brew

# Find the PID.
#   $ pgrep -f myapp
#   12345

# Dump every thread's Python stack.
#   $ py-spy dump --pid 12345
#   Process 12345: /usr/bin/python /app/server.py
#   Python v3.12.0 (/usr/bin/python)
#
#   Thread 12345 (active+gil): "MainThread"
#       transform (image_proc.py:142)
#       process_image (handler.py:58)
#       handle_request (server.py:23)
#
#   Thread 12347 (idle): "asyncio_0"
#       _run_once (asyncio/base_events.py:1909)
#       run_forever (asyncio/base_events.py:608)

# Do it three times in a row to spot stuck threads vs progressing ones.
#   $ for i in 1 2 3; do py-spy dump --pid 12345; sleep 1; done

# Permission: ptrace_scope=1 (default on Linux) requires root or
# CAP_SYS_PTRACE. Grant once:
#   $ sudo setcap cap_sys_ptrace=ep $(which py-spy)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but you need to inspect VARIABLES (cache contents,
#             config flags, what's in a queue) — stacks aren't enough.
# APPROACH  - manhole.install() opens a local UNIX-socket REPL into the
#             running process. Connect with 'manhole-cli'; you get a full
#             Python prompt with the process's globals/locals available.
# STRENGTHS - Live state inspection, mutation, even hot-reload tricks;
#             works while the process keeps serving requests.
# WEAKNESSES- Requires opt-in code — manhole.install() at startup. Plan
#             this BEFORE the incident; can't be added live.

# At startup, in your main entrypoint:
import manhole
manhole.install(
    locals={"app": None},                            # extras to expose in the REPL
    socket_path="/tmp/manhole-myapp.sock",
    oneshot_on="USR2",                                # 'kill -USR2 <pid>' opens a one-shot REPL
)

# Now from another shell on the same host:
#   $ manhole-cli
#   Python 3.12.0
#   (ManholeConsole)
#   >>> import sys
#   >>> [m for m in sys.modules if "myapp" in m]
#   ['myapp', 'myapp.handlers', ...]
#   >>> from myapp import CACHE
#   >>> len(CACHE)
#   42103
#   >>> import gc; len([o for o in gc.get_objects() if isinstance(o, MyObj)])
#   1

# For asyncio services, aiomonitor is the equivalent — opens a telnet REPL
# bound to the loop, with task introspection commands (ps, where, cancel).

import asyncio, aiomonitor
async def main():
    loop = asyncio.get_running_loop()
    with aiomonitor.start_monitor(loop, host="127.0.0.1", port=50101):
        await serve_forever()

# From another shell:
#   $ python -m aiomonitor.cli           # connects to 127.0.0.1:50101
#   monitor> ps                           # list tasks
#   monitor> console                      # drop into a Python REPL inside the loop
#   >>> import myapp.state
#   >>> myapp.state.queue.qsize()
#   137

async def serve_forever():
    await asyncio.sleep(3600)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production-grade: full IDE-driven debugging on a
#             container in a Kubernetes pod, with breakpoints, watch
#             expressions, and step-through. No code change to the
#             running pod.
# APPROACH  - debugpy installed in image (or via ephemeral debug container);
#             listen on a port; kubectl port-forward to localhost; VS Code
#             attach. Combine with py-spy dump for "where to set the
#             breakpoint" and manhole for "ad-hoc REPL".
# STRENGTHS - Full debugger experience on a live prod process; the
#             ultimate triage tool when everything else fails.
# WEAKNESSES- HEAVY: pauses the process when a breakpoint fires; never
#             use on a request-serving pod under load. Take the pod out
#             of the load balancer first, OR use on a dedicated debug
#             replica.

# 1) Code-side: import-and-listen pattern. Wrap in env-guard so prod
#    builds don't accidentally enable it.
import os, debugpy, signal

def maybe_enable_debugpy() -> None:
    if os.environ.get("ENABLE_DEBUGPY") != "1":
        return
    debugpy.listen(("0.0.0.0", 5678))
    print("debugpy listening on :5678")               # waits for attach
    if os.environ.get("DEBUGPY_WAIT") == "1":
        debugpy.wait_for_client()

# Or attach to an already-running process WITHOUT code change:
#   $ python -m debugpy --listen 0.0.0.0:5678 --pid 12345
# (only works if debugpy is installed in the same Python; needs ptrace)

maybe_enable_debugpy()

# 2) Kubernetes workflow.
#    a) Take the pod out of the LB:
#       $ kubectl patch pod myapp-xxxx -p '{"metadata":{"labels":{"serving":"false"}}}'
#       (assumes Service selector includes 'serving=true')
#
#    b) Port-forward debugpy to your laptop:
#       $ kubectl port-forward myapp-xxxx 5678:5678
#
#    c) VS Code: launch.json
#       {
#         "name": "Attach to k8s pod",
#         "type": "python",
#         "request": "attach",
#         "connect": { "host": "localhost", "port": 5678 },
#         "pathMappings": [{ "localRoot": "${workspaceFolder}",
#                            "remoteRoot": "/app" }]
#       }
#       Press F5 -> attached. Set breakpoints, evaluate expressions, step.
#
#    d) Done? Re-add the pod to the LB:
#       $ kubectl patch pod myapp-xxxx -p '{"metadata":{"labels":{"serving":"true"}}}'

# 3) Ephemeral debug container (no debugpy in production image needed).
#       $ kubectl debug -it myapp-xxxx \
#             --target=myapp-container \
#             --image=python:3.12 \
#             --share-processes \
#             -- bash
#       (in the debug container)
#       $ pip install debugpy
#       $ python -m debugpy --listen 0.0.0.0:5678 --pid 1
#       (back on host)
#       $ kubectl port-forward myapp-xxxx 5678:5678

# 4) Signal-driven dump (no client required) — fallback when port-forward
#    is impossible. Combine py-spy dump with faulthandler.register(SIGUSR1).
def install_dump_signal() -> None:
    import faulthandler
    out = open("/var/log/myapp/threads.log", "a", buffering=1)
    if hasattr(signal, "SIGUSR1"):
        faulthandler.register(signal.SIGUSR1, file=out, all_threads=True)

# Decision rule:
#   "what is each thread doing right now?"   -> py-spy dump --pid (no code change)
#   "what's in this cache / queue?"          -> manhole.install() at startup; manhole-cli
#   "I need a full debugger with breakpoints" -> debugpy.listen + VS Code attach
#   asyncio service, live introspection      -> aiomonitor (TUI + telnet REPL)
#   no code change AND no debugpy installed  -> kubectl debug ephemeral container
#   container has no shell                    -> ephemeral debug container brings the shell
#   prod pod under live traffic              -> remove from LB FIRST; debugger pauses block
#   security: ptrace not granted             -> setcap cap_sys_ptrace=ep on the binary
#   Python segfaulting                       -> faulthandler.enable() — pdb won't help
#   process hung at C level (extension)      -> gdb -p <PID>; py-spy --native; not pdb
#
# Anti-pattern: setting a breakpoint via debugpy on a production pod that's
# still receiving traffic. The debugger pauses the process at the
# breakpoint; every concurrent request waits; the load balancer marks the
# pod healthy because TCP is up; latency p99 spikes; eventually the pod
# is killed mid-debug-session for being too slow. ALWAYS remove the pod
# from the load balancer FIRST (label flip, deregister from service mesh,
# or use a dedicated debug replica) before attaching debugpy.
```

## Decision Rule

```text
"what is each thread doing right now?"   -> py-spy dump --pid (no code change)
"what's in this cache / queue?"          -> manhole.install() at startup; manhole-cli
"I need a full debugger with breakpoints" -> debugpy.listen + VS Code attach
asyncio service, live introspection      -> aiomonitor (TUI + telnet REPL)
no code change AND no debugpy installed  -> kubectl debug ephemeral container
container has no shell                    -> ephemeral debug container brings the shell
prod pod under live traffic              -> remove from LB FIRST; debugger pauses block
security: ptrace not granted             -> setcap cap_sys_ptrace=ep on the binary
Python segfaulting                       -> faulthandler.enable() — pdb won't help
process hung at C level (extension)      -> gdb -p <PID>; py-spy --native; not pdb
```

## Anti-Pattern

> [!warning] Anti-pattern
> setting a breakpoint via debugpy on a production pod that's
> still receiving traffic. The debugger pauses the process at the
> breakpoint; every concurrent request waits; the load balancer marks the
> pod healthy because TCP is up; latency p99 spikes; eventually the pod
> is killed mid-debug-session for being too slow. ALWAYS remove the pod
> from the load balancer FIRST (label flip, deregister from service mesh,
> or use a dedicated debug replica) before attaching debugpy.

## Tips

- py-spy dump is the right starting point for ANY production-debug session — it costs nothing, requires no code change, and tells you what every thread is doing. Reach for it before opening a debugger.
- manhole and aiomonitor BOTH require opt-in code at startup (manhole.install / start_monitor). You cannot retro-fit them onto a process that's already running. Add at startup in every long-lived service; the binary cost is essentially zero.
- debugpy --listen + kubectl port-forward is the cleanest "attach VS Code to a pod" pipeline. Pair with --pid to attach to an already-running process without restart.
- ALWAYS remove a pod from the load balancer before setting breakpoints with debugpy. The debugger pauses ALL threads — concurrent requests stall, latency spikes, the pod gets killed mid-session.
- For "no code change, no debugpy in image" diagnosis, kubectl debug with --share-processes runs an ephemeral container in the same PID namespace. Install py-spy / debugpy in the debug container; target PID 1 (which is the app process inside the pod).
- Combine tools: py-spy dump finds WHERE the slow code is (gives you a file:line); manhole/debugpy lets you peek at WHY (locals, cache state). One narrows; the other answers.

## Common Mistake

> [!warning] Setting a debugpy breakpoint on a pod still receiving traffic. The debugger pauses the process; concurrent requests wait; the load balancer marks it healthy because TCP is up; p99 latency spikes; eventually the pod gets OOMKilled or healthcheck-killed mid-session. Remove the pod from the load balancer (label flip / deregister) BEFORE attaching, or use a dedicated debug replica.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Breakpoint on a live pod — kills concurrent traffic
$ kubectl port-forward live-pod 5678:5678
# (attach VS Code, set breakpoint — every request stalls)
```

**Senior:**
```python
# Take the pod out of the LB first
$ kubectl label pod live-pod serving=false  # service selector excludes it
$ kubectl port-forward live-pod 5678:5678
# (attach safely — only your debug session hits this pod)
```

## See Also

- [[Sections/debugging-profiling/async-attach/_Index|Debugging & Profiling → Async Debugging & Production Attach]]
- [[Sections/debugging-profiling/_Index|Debugging & Profiling index]]
- [[_Index|Vault index]]
