---
type: "entry"
domain: "python"
file: "gamedev-pygame"
section: "basics"
id: "pygame-event-loop"
title: "pygame.init / display / event loop / clock"
category: "basics"
subtitle: "pygame.init / display.set_mode (size, flags=DOUBLEBUF | SCALED), event loop with pygame.event.get (QUIT, KEYDOWN, MOUSEBUTTONDOWN), Clock.tick(60) (returns elapsed ms), display.flip vs display.update (rect list), surface.fill for clear, pygame.quit() on exit"
signature_short: "pygame.init(); screen = pygame.display.set_mode((w, h)); clock = pygame.time.Clock(); while running: ... clock.tick(60)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pygame.init / display / event loop / clock"
  - "pygame-event-loop"
tags:
  - "python"
  - "python/gamedev-pygame"
  - "python/gamedev-pygame/basics"
  - "category/basics"
  - "tier/tiered"
---

# pygame.init / display / event loop / clock

> pygame.init / display.set_mode (size, flags=DOUBLEBUF | SCALED), event loop with pygame.event.get (QUIT, KEYDOWN, MOUSEBUTTONDOWN), Clock.tick(60) (returns elapsed ms), display.flip vs display.update (rect list), surface.fill for clear, pygame.quit() on exit

## Overview

The standard skeleton: init pygame; create the display surface (`set_mode`); enter `while running`. Each iteration: drain `pygame.event.get()` for input, update game state, redraw to the screen surface, `display.flip()` to swap buffers, `clock.tick(fps)` to cap frame rate (and return milliseconds since the last call — useful as `dt`). `display.flip()` redraws the whole window; `display.update(rect_list)` is faster on slow GPUs but needs you to track dirty rectangles. Three depths solve the SAME task — show a bouncing ball — at depths: minimal frame-rate-coupled loop → fixed-timestep update with `dt`-scaled physics → fixed-timestep simulation with frame-time accumulator and decoupled render.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Bouncing ball - press ESC to quit.
- **Junior** — SAME — bouncing ball — but motion is in pixels per SECOND so it's framerate-independent.
- **Senior** — SAME — bouncing ball — production: fixed-step physics with a time accumulator so simulation is deterministic regardless of render rate; render-only interpolation between physics steps.

## Signature

```python
pygame.init(); screen = pygame.display.set_mode((w, h)); clock = pygame.time.Clock(); while running: ... clock.tick(60)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Bouncing ball - press ESC to quit.
# APPROACH  - Standard event loop; velocity in pixels per FRAME.
# STRENGTHS - Smallest possible pygame example.
# WEAKNESSES- Speed depends on frame rate (60 FPS vs 144 FPS = 2.4x faster).
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
pygame.display.set_caption("bouncer")
clock  = pygame.time.Clock()

x, y     = 100, 50
vx, vy   = 4, 3
radius   = 20

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT or (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
            pygame.quit(); sys.exit()

    # update
    x += vx; y += vy
    if x < radius or x > W - radius: vx = -vx
    if y < radius or y > H - radius: vy = -vy

    # draw
    screen.fill((20, 20, 30))
    pygame.draw.circle(screen, (240, 220, 80), (x, y), radius)
    pygame.display.flip()

    clock.tick(60)                                   # cap at 60 FPS
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — bouncing ball — but motion is in pixels per SECOND
#             so it's framerate-independent.
# APPROACH  - dt = clock.tick(60) / 1000.0; velocity in px/s.
# STRENGTHS - Same speed at 30, 60, 144 Hz.
# WEAKNESSES- dt-scaled motion can still pass through walls at very low
#             frame rates; senior tier fixes with a fixed-step accumulator.
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
clock  = pygame.time.Clock()

x, y   = 100.0, 50.0
vx, vy = 240.0, 180.0                                # pixels per SECOND
radius = 20

while True:
    dt = clock.tick(60) / 1000.0                     # seconds since last frame
    for e in pygame.event.get():
        if e.type == pygame.QUIT or \
           (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
            pygame.quit(); sys.exit()

    x += vx * dt; y += vy * dt
    if x < radius or x > W - radius:
        vx = -vx; x = max(radius, min(W - radius, x))
    if y < radius or y > H - radius:
        vy = -vy; y = max(radius, min(H - radius, y))

    screen.fill((20, 20, 30))
    pygame.draw.circle(screen, (240, 220, 80), (int(x), int(y)), radius)
    pygame.display.flip()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — bouncing ball — production: fixed-step physics with a
#             time accumulator so simulation is deterministic regardless of
#             render rate; render-only interpolation between physics steps.
# APPROACH  - Glenn Fiedler's "Fix Your Timestep" pattern: accumulate real
#             time, run N physics steps of constant dt, render at the
#             leftover alpha between steps.
# STRENGTHS - Deterministic; reproducible saves/replays; smooth render.
# WEAKNESSES- Slightly more complex; mostly invisible until you do
#             multiplayer / replay or hit very slow frames.
from __future__ import annotations
import pygame
import sys
from dataclasses import dataclass


@dataclass
class State:
    x: float; y: float
    vx: float; vy: float


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def step_physics(s: State, dt: float, w: int, h: int, r: int) -> State:
    nx = s.x + s.vx * dt
    ny = s.y + s.vy * dt
    nvx, nvy = s.vx, s.vy
    if nx < r or nx > w - r:
        nvx = -nvx
        nx = max(r, min(w - r, nx))
    if ny < r or ny > h - r:
        nvy = -nvy
        ny = max(r, min(h - r, ny))
    return State(nx, ny, nvx, nvy)


def main() -> None:
    pygame.init()
    W, H = 800, 450
    screen = pygame.display.set_mode((W, H))
    clock  = pygame.time.Clock()

    R = 20
    cur = State(100.0, 50.0, 240.0, 180.0)
    prev = cur                                        # for interpolation

    PHYSICS_HZ = 120
    FIXED_DT = 1.0 / PHYSICS_HZ
    accumulator = 0.0
    MAX_FRAME_DT = 0.25                                # avoid spiral-of-death

    while True:
        frame_dt = min(clock.tick(0) / 1000.0, MAX_FRAME_DT)   # uncapped render
        for e in pygame.event.get():
            if e.type == pygame.QUIT or \
               (e.type == pygame.KEYDOWN and e.key == pygame.K_ESCAPE):
                pygame.quit(); sys.exit()

        accumulator += frame_dt
        # Run fixed-step physics until we've consumed real time.
        while accumulator >= FIXED_DT:
            prev = cur
            cur  = step_physics(cur, FIXED_DT, W, H, R)
            accumulator -= FIXED_DT

        # Render at interpolated position between prev (t-FIXED_DT) and cur.
        alpha = accumulator / FIXED_DT
        rx = lerp(prev.x, cur.x, alpha)
        ry = lerp(prev.y, cur.y, alpha)

        screen.fill((20, 20, 30))
        pygame.draw.circle(screen, (240, 220, 80), (int(rx), int(ry)), R)
        pygame.display.flip()


if __name__ == "__main__":
    main()

# Decision rule:
#   Toy / jam / hours-old prototype          -> frame-coupled (intro tier).
#   Anything you'll polish                    -> dt-scaled (junior tier).
#   Multiplayer / determinism / replay        -> fixed-step + accumulator
#                                                + render interpolation (senior tier).
#   Need exact framerate cap                  -> clock.tick(60).
#   Need uncapped render with vsync            -> set_mode(..., vsync=1) and
#                                                clock.tick(0).
#   Need lower CPU when minimized              -> check display.get_active(); sleep
#                                                more aggressively when not active.
#   Need to skip render but keep simulation    -> headless mode set DISPLAYSURF=
#                                                pygame.Surface (no flip).

# Anti-pattern:
#   pygame.time.delay(16)                    # inside the loop instead of clock.tick
# delay() blocks; clock.tick() targets a frame rate AND returns elapsed
# time you can use as dt. Always use Clock for the loop pacing.
```

## Decision Rule

```text
Toy / jam / hours-old prototype          -> frame-coupled (intro tier).
Anything you'll polish                    -> dt-scaled (junior tier).
Multiplayer / determinism / replay        -> fixed-step + accumulator
                                             + render interpolation (senior tier).
Need exact framerate cap                  -> clock.tick(60).
Need uncapped render with vsync            -> set_mode(..., vsync=1) and
                                             clock.tick(0).
Need lower CPU when minimized              -> check display.get_active(); sleep
                                             more aggressively when not active.
Need to skip render but keep simulation    -> headless mode set DISPLAYSURF=
                                             pygame.Surface (no flip).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   pygame.time.delay(16)                    # inside the loop instead of clock.tick
> delay() blocks; clock.tick() targets a frame rate AND returns elapsed
> time you can use as dt. Always use Clock for the loop pacing.

## Tips

- Always pace with `pygame.time.Clock().tick(fps)` — never `time.sleep()` or `pygame.time.delay()` in the loop.
- For framerate-independent motion use seconds: `dt = clock.tick(60) / 1000.0`, then `x += vx * dt`.
- For deterministic physics (multiplayer, replays), use a fixed-step + accumulator pattern.
- `display.flip()` swaps the whole buffer; `display.update(rects)` updates only dirty rects (faster on slow GPUs).
- On startup, set `set_mode((w, h), pygame.SCALED | pygame.RESIZABLE)` for letterboxed scaling on HiDPI displays.

## Common Mistake

> [!warning] Hard-coded movement like `x += 4` per frame — the ball moves twice as fast on a 144 Hz monitor. Always scale by `dt`.

## See Also

- [[Sections/gamedev-pygame/basics/pygame-surface-rect|Surface / Rect / blit / convert — the drawing primitives (Game Dev (pygame))]]
- [[Sections/gamedev-pygame/basics/_Index|Game Dev (pygame) → Display, event loop, the game frame]]
- [[Sections/gamedev-pygame/_Index|Game Dev (pygame) index]]
- [[_Index|Vault index]]
