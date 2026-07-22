---
type: "entry"
domain: "python"
file: "concurrency"
section: "subprocess"
id: "subprocess-run"
title: "subprocess — Running External Commands"
category: "Subprocess"
subtitle: "subprocess.run, check_output, Popen, pipes"
signature_short: "subprocess.run([\"cmd\", \"arg\"], capture_output=True, text=True, check=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "subprocess — Running External Commands"
  - "subprocess-run"
tags:
  - "python"
  - "python/concurrency"
  - "python/concurrency/subprocess"
  - "category/subprocess"
  - "tier/tiered"
---

# subprocess — Running External Commands

> subprocess.run, check_output, Popen, pipes

## Overview

subprocess.run() is the recommended way to run external commands. It captures stdout/stderr, checks return codes, and handles timeouts. Always pass commands as lists (not strings) to avoid shell injection. Use check=True to raise on non-zero exit codes. Popen provides low-level control for streaming output, piping between processes, and long-running subprocesses.

## Signature

```python
subprocess.run(["cmd", "arg"], capture_output=True, text=True, check=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - subprocess.run with the four flags every safe call needs
# STRENGTHS - List form (no shell), capture_output, text, check
# WEAKNESSES- No timeout, no error handling
#
import subprocess

result = subprocess.run(
    ["git", "rev-parse", "HEAD"],
    capture_output=True,                          # collect stdout + stderr
    text=True,                                    # decode bytes -> str
    check=True,                                   # raise on non-zero exit
)
print(result.stdout.strip())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Timeouts, typed error handling, cwd, pass stdin
# STRENGTHS - The 80%-case shape: safe, bounded, observable
# WEAKNESSES- No pipes; no streaming
#
import subprocess
from pathlib import Path

def git_log(repo: Path, n: int = 10) -> str:
    try:
        r = subprocess.run(
            ["git", "log", "--oneline", f"-n{n}"],
            cwd=repo,                              # change directory for THIS call
            capture_output=True, text=True,
            check=True,
            timeout=30,                            # mandatory; otherwise hangs forever
        )
        return r.stdout
    except subprocess.CalledProcessError as e:    # non-zero exit
        raise RuntimeError(f"git failed ({e.returncode}): {e.stderr.strip()}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("git log timed out after 30s")

# Pipe data IN through stdin
out = subprocess.run(
    ["wc", "-l"],
    input="line1\nline2\nline3\n",
    capture_output=True, text=True, check=True,
).stdout.strip()
print(out)                                         # "3"
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Streaming output, safe pipelines, env scoping, signal handling
# STRENGTHS - The patterns that turn subprocess into a robust shell layer
# WEAKNESSES- N/A
#
import os
import signal
import subprocess

# 1) STREAM stdout line-by-line — for long-running commands
def stream(cmd: list[str]):
    proc = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,                  # interleave stderr with stdout
        text=True, bufsize=1,                      # line-buffered
    )
    try:
        for line in proc.stdout:                   # yields as the process prints
            yield line.rstrip()
    finally:
        proc.stdout.close()
        rc = proc.wait()
        if rc != 0:
            raise RuntimeError(f"{cmd[0]} exited {rc}")

# 2) PIPELINE without shell=True — Python wires stdin/stdout between processes
def pipeline_grep_count(path: str, pattern: str) -> int:
    p1 = subprocess.Popen(["cat", path], stdout=subprocess.PIPE)
    p2 = subprocess.Popen(["grep", pattern], stdin=p1.stdout, stdout=subprocess.PIPE)
    p1.stdout.close()                              # let p1 get SIGPIPE on grep exit
    p3 = subprocess.Popen(["wc", "-l"], stdin=p2.stdout, stdout=subprocess.PIPE, text=True)
    p2.stdout.close()
    out, _ = p3.communicate()
    if any(p.wait() != 0 for p in (p1, p2, p3)):
        raise RuntimeError("pipeline failed")
    return int(out.strip())

# 3) ENV scoping — pass a CLEAN env, don't inherit secrets you don't need
clean_env = {"PATH": os.environ["PATH"], "HOME": os.environ["HOME"], "LANG": "C"}
subprocess.run(["my_tool"], env=clean_env, check=True, timeout=60)

# 4) Cancellation — kill ENTIRE process group, not just the leader
def run_killable(cmd, deadline=10.0):
    proc = subprocess.Popen(cmd, start_new_session=True)   # gives it its own group
    try:
        return proc.wait(timeout=deadline)
    except subprocess.TimeoutExpired:
        os.killpg(proc.pid, signal.SIGTERM)        # children die too
        proc.wait(timeout=5)
        if proc.returncode is None:
            os.killpg(proc.pid, signal.SIGKILL)
        raise

# Decision rule:
#   one-shot command, small output       -> subprocess.run(..., capture_output=True)
#   long-running, watch progress          -> Popen + iterate stdout
#   chain of unix commands                 -> Popen pipeline, NEVER shell=True
#   user-supplied input                    -> list form ALWAYS (no string interpolation)
#   needs deadline                          -> timeout= (run) or wait(timeout=) (Popen)
#   spawns child processes                  -> start_new_session=True + os.killpg on cleanup
#   need exit code only                      -> subprocess.call (don't capture if you don't need it)
#
# Anti-pattern: shell=True with f-string user input
#   subprocess.run(f"ls {user_input}", shell=True)
#   user_input = "; rm -rf /" -> game over. Use list form; the OS does NOT split
#   spaces or interpret ; & | in list args.
```

## Decision Rule

```text
one-shot command, small output       -> subprocess.run(..., capture_output=True)
long-running, watch progress          -> Popen + iterate stdout
chain of unix commands                 -> Popen pipeline, NEVER shell=True
user-supplied input                    -> list form ALWAYS (no string interpolation)
needs deadline                          -> timeout= (run) or wait(timeout=) (Popen)
spawns child processes                  -> start_new_session=True + os.killpg on cleanup
need exit code only                      -> subprocess.call (don't capture if you don't need it)
```

## Anti-Pattern

> [!warning] Anti-pattern
> shell=True with f-string user input
>   subprocess.run(f"ls {user_input}", shell=True)
>   user_input = "; rm -rf /" -> game over. Use list form; the OS does NOT split
>   spaces or interpret ; & | in list args.

## Tips

- Always use list form ["cmd", "arg1"] — never shell=True with user input (shell injection vulnerability).
- capture_output=True + text=True + check=True + timeout= is the standard recipe; without timeout, a hung child hangs your process forever.
- cwd parameter changes the working directory — essential for git commands and relative paths. Pass an explicit minimal `env=` dict so the child doesn't inherit secrets it doesn't need.
- For streaming output, use Popen with line-buffered stdout — subprocess.run() waits until the command finishes. For pipelines, wire stdin/stdout between Popens (NEVER `shell=True`). For cancellation, launch with `start_new_session=True` and call `os.killpg(proc.pid, SIGTERM)` so children die too.

## Common Mistake

> [!warning] `shell=True` with f-string user input — `subprocess.run(f"ls {user_input}", shell=True)` is a remote-code-execution vector. Use list form: the OS does NOT split spaces or interpret `; & |` in list args. Also: forgetting `start_new_session=True` means timeouts kill only the leader and orphaned children keep running.

## Shorthand (Junior → Senior)

**Junior:**
```python
import os
os.system("ls -la /tmp")
output = os.popen("git log").read()
```

**Senior:**
```python
result = subprocess.run(["git", "log", "-1"], capture_output=True, text=True, check=True)
```

## See Also

- [[Sections/concurrency/subprocess/_Index|Concurrency & Parallelism → Subprocess & Process Management]]
- [[Sections/concurrency/_Index|Concurrency & Parallelism index]]
- [[_Index|Vault index]]
