---
type: "entry"
domain: "python"
file: "embedded-micropython"
section: "tooling"
id: "micropython-mpremote"
title: "mpremote / mip / WebREPL — flash, deploy, debug"
category: "tooling"
subtitle: "mpremote (USB serial control: connect, repl, fs cp / ls / rm, run, mount, soft-reset, exec), mpremote mip install (package manager replacing upip), Thonny IDE for beginners, WebREPL for over-the-air, esptool.py for firmware flash, frozen modules (compile .py into firmware to save RAM)"
signature_short: "mpremote connect /dev/ttyACM0 fs cp main.py :main.py; mpremote mip install bme280; mpremote run script.py; mpremote mount ."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "mpremote / mip / WebREPL — flash, deploy, debug"
  - "micropython-mpremote"
tags:
  - "python"
  - "python/embedded-micropython"
  - "python/embedded-micropython/tooling"
  - "category/tooling"
  - "tier/tiered"
---

# mpremote / mip / WebREPL — flash, deploy, debug

> mpremote (USB serial control: connect, repl, fs cp / ls / rm, run, mount, soft-reset, exec), mpremote mip install (package manager replacing upip), Thonny IDE for beginners, WebREPL for over-the-air, esptool.py for firmware flash, frozen modules (compile .py into firmware to save RAM)

## Overview

`mpremote` is the one tool to learn. `connect /dev/ttyACM0` selects the board (or just `mpremote` to autodetect a single board). `repl` opens an interactive REPL. `fs cp local.py :remote.py` copies a file (`:` prefix means the board's filesystem). `mip install <pkg>` installs from PyPI/GitHub via the on-device `mip` package manager. `run script.py` executes a local script on the board (transient, not persisted). `mount .` mounts the current host directory as `/remote` on the board — perfect for live development. Three depths solve the SAME task — deploy and run a `main.py` on a board — at depths: copy `main.py` and reboot → `mount .` for live edit-test → CI script that flashes firmware, deploys files, runs a smoke test on the connected board.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Copy main.py to the board and watch it run.
- **Junior** — SAME — develop main.py against the board — but with mount so the local file IS the remote file (live edit).
- **Senior** — SAME — deploy a project — production: shell script that flashes firmware (esptool), deploys app + dependencies, runs a smoke test, returns nonzero on failure.

## Signature

```python
mpremote connect /dev/ttyACM0 fs cp main.py :main.py; mpremote mip install bme280; mpremote run script.py; mpremote mount .
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Copy main.py to the board and watch it run.
# APPROACH  - mpremote fs cp + mpremote reset + mpremote repl.
# STRENGTHS - Three commands.
# WEAKNESSES- Manual; no live edit; have to remember the device path.
"""
$ mpremote connect /dev/ttyACM0 fs cp main.py :main.py
$ mpremote connect /dev/ttyACM0 reset
$ mpremote connect /dev/ttyACM0 repl
# Ctrl-X to exit the REPL.

# Even shorter when only one board is plugged in:
$ mpremote fs cp main.py :main.py
$ mpremote reset
$ mpremote repl
"""
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — develop main.py against the board — but with mount
#             so the local file IS the remote file (live edit).
# APPROACH  - mpremote mount . then run main from the mounted dir.
# STRENGTHS - Edit on host, run on board, no copy step.
# WEAKNESSES- Only one mount per session; production deploy still needs cp.
"""
# In one terminal:
$ cd ~/code/sensor
$ mpremote mount .
# Now /remote on the board mirrors ~/code/sensor on the host.

# In another terminal (or after Ctrl-D in the mounted REPL):
$ mpremote exec "import sys; sys.path.insert(0, '/remote'); exec(open('/remote/main.py').read())"

# Install community drivers on the board:
$ mpremote mip install github:robert-hh/BME280
$ mpremote mip install github:miguelgrinberg/microdot

# List files on the board:
$ mpremote fs ls
"""
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — deploy a project — production: shell script that
#             flashes firmware (esptool), deploys app + dependencies,
#             runs a smoke test, returns nonzero on failure.
# APPROACH  - esptool.py for firmware; mpremote for files + smoke test;
#             smoke test prints SMOKE_OK on success.
# STRENGTHS - Reproducible deploy; CI-friendly; catches regressions.
# WEAKNESSES- USB device paths differ across OSes (/dev/ttyACM0 on Linux,
#             /dev/cu.usbmodem* on macOS, COM3 on Windows).
"""
#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-/dev/ttyACM0}"
FW_BIN="firmware/esp32-20260101-v1.23.0.bin"

echo "==> erase flash"
esptool.py --port "$PORT" erase_flash

echo "==> flash MicroPython firmware"
esptool.py --port "$PORT" --baud 460800 write_flash -z 0x1000 "$FW_BIN"

# Wait for device to come back as a serial port.
sleep 2

echo "==> install on-device packages"
mpremote connect "$PORT" mip install github:robert-hh/BME280
mpremote connect "$PORT" mip install umqtt.simple

echo "==> deploy app"
mpremote connect "$PORT" fs cp -r src/* :
mpremote connect "$PORT" fs cp config/secrets.py :secrets.py

echo "==> smoke test"
output=$(mpremote connect "$PORT" run tests/smoke.py)
echo "$output"
if ! grep -q "SMOKE_OK" <<< "$output"; then
    echo "smoke test FAILED"
    exit 1
fi

echo "==> reset into main.py"
mpremote connect "$PORT" reset
echo "OK"
"""

# tests/smoke.py example:
"""
import gc, machine

print('mem_free:', gc.mem_free())
print('freq:', machine.freq())
print('unique_id:', machine.unique_id().hex())

try:
    import bme280, network, umqtt.simple
    print('imports ok')
except ImportError as e:
    print('IMPORT FAIL:', e)
    raise SystemExit(1)

print('SMOKE_OK')
"""

# Decision rule:
#   Single board, dev workflow              -> mpremote (fs cp + reset + repl).
#   Live editing on the host                 -> mpremote mount.
#   Install community drivers                 -> mpremote mip install <pkg>.
#   Beginner-friendly IDE                     -> Thonny (built-in MicroPython support).
#   Over-the-air on ESP32 (no USB)           -> WebREPL.
#   Save RAM on a tight memory budget         -> freeze .py modules into the firmware
#                                                 (manifest.py + custom build).
#   Update firmware                            -> esptool.py for ESP32; uf2 drag-and-drop
#                                                 for Pico.
#   CI / automated deploys                    -> shell script wrapping the above.

# Anti-pattern:
#   ampy --port ... put main.py
# ampy is dead. mpremote is the official tool now and supports everything
# ampy did plus mip, mount, exec, run, etc. Just use mpremote.
"""
```

## Decision Rule

```text
Single board, dev workflow              -> mpremote (fs cp + reset + repl).
Live editing on the host                 -> mpremote mount.
Install community drivers                 -> mpremote mip install <pkg>.
Beginner-friendly IDE                     -> Thonny (built-in MicroPython support).
Over-the-air on ESP32 (no USB)           -> WebREPL.
Save RAM on a tight memory budget         -> freeze .py modules into the firmware
                                              (manifest.py + custom build).
Update firmware                            -> esptool.py for ESP32; uf2 drag-and-drop
                                              for Pico.
CI / automated deploys                    -> shell script wrapping the above.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   ampy --port ... put main.py
> ampy is dead. mpremote is the official tool now and supports everything
> ampy did plus mip, mount, exec, run, etc. Just use mpremote.

## Tips

- `mpremote` replaces ampy/rshell — one tool with `connect`, `fs`, `repl`, `run`, `exec`, `mount`, `mip`, `reset`.
- `mpremote mip install <pkg>` installs from PyPI or `github:user/repo` directly on the board — modern replacement for `upip`.
- `mpremote mount .` mirrors the host directory onto the board's filesystem — fastest dev loop, no `cp` step.
- For ESP32 firmware updates use `esptool.py write_flash`; for Pico just drag the `.uf2` file onto the BOOTSEL drive.
- Save RAM by **freezing** modules into the firmware (compile `.py` → `.mpy` → bake into a custom build) — only matters when you're memory-bound.

## Common Mistake

> [!warning] Reaching for `ampy` in 2026 — it's deprecated. Use `mpremote` (official) — same operations, more features, actively maintained.

## See Also

- [[Sections/embedded-micropython/tooling/_Index|MicroPython / Embedded → Tooling and dev workflow]]
- [[Sections/embedded-micropython/_Index|MicroPython / Embedded index]]
- [[_Index|Vault index]]
