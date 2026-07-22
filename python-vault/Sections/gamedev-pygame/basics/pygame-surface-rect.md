---
type: "entry"
domain: "python"
file: "gamedev-pygame"
section: "basics"
id: "pygame-surface-rect"
title: "Surface / Rect / blit / convert — the drawing primitives"
category: "basics"
subtitle: "pygame.Surface (off-screen surfaces for compositing), .convert() (opaque) vs .convert_alpha() (transparent PNG), screen.blit(surface, (x, y)), Rect (x, y, w, h) + .move_ip / .colliderect / .collidepoint, get_rect() helper, SRCALPHA flag for new transparent surfaces, dirty-rect rendering with display.update(rect_list)"
signature_short: "img = pygame.image.load(\"p.png\").convert_alpha(); rect = img.get_rect(center=(x, y)); screen.blit(img, rect)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Surface / Rect / blit / convert — the drawing primitives"
  - "pygame-surface-rect"
tags:
  - "python"
  - "python/gamedev-pygame"
  - "python/gamedev-pygame/basics"
  - "category/basics"
  - "tier/tiered"
---

# Surface / Rect / blit / convert — the drawing primitives

> pygame.Surface (off-screen surfaces for compositing), .convert() (opaque) vs .convert_alpha() (transparent PNG), screen.blit(surface, (x, y)), Rect (x, y, w, h) + .move_ip / .colliderect / .collidepoint, get_rect() helper, SRCALPHA flag for new transparent surfaces, dirty-rect rendering with display.update(rect_list)

## Overview

A `Surface` is `(width, height, depth, flags)`; the `screen` you get from `set_mode` is one. Loaded images come in a generic format — `.convert()` matches them to the screen format (5-10× faster blit), `.convert_alpha()` does the same and preserves a per-pixel alpha channel. `Rect` is the geometric workhorse: positioning (`get_rect(center=, topleft=)`), in-place motion (`move_ip(dx, dy)`), collision tests (`colliderect`, `collidelist`, `collidepoint`). Three depths solve the SAME task — load a sprite, move it with arrow keys, draw it bouncing off the edges — at depths: blit at integer pos → Rect-driven position with `clamp_ip` → group of sprites with sprite class + dirty-rect render for performance.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Load a sprite, move it with arrow keys.
- **Junior** — SAME — sprite + arrow keys — using Rect for position and clamp_ip for boundaries; .convert_alpha() for fast blit.
- **Senior** — SAME — controllable sprite — production: pygame.sprite.Sprite subclass, sprite group, dirty-rect rendering, normalized diagonal movement.

## Signature

```python
img = pygame.image.load("p.png").convert_alpha(); rect = img.get_rect(center=(x, y)); screen.blit(img, rect)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Load a sprite, move it with arrow keys.
# APPROACH  - Track an (x, y); blit each frame.
# STRENGTHS - Three lines of game logic.
# WEAKNESSES- Forgets .convert_alpha(); slow blit; no Rect; no boundary check.
import pygame, sys

pygame.init()
screen = pygame.display.set_mode((640, 360))
clock = pygame.time.Clock()

img = pygame.image.load("ship.png")                  # !! no .convert_alpha()
x, y = 100, 100

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT: pygame.quit(); sys.exit()

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT]:  x -= 4
    if keys[pygame.K_RIGHT]: x += 4
    if keys[pygame.K_UP]:    y -= 4
    if keys[pygame.K_DOWN]:  y += 4

    screen.fill((20, 20, 30))
    screen.blit(img, (x, y))
    pygame.display.flip()
    clock.tick(60)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — sprite + arrow keys — using Rect for position and
#             clamp_ip for boundaries; .convert_alpha() for fast blit.
# APPROACH  - rect = img.get_rect(center=(x, y)); rect.move_ip + clamp_ip.
# STRENGTHS - 5-10x faster blit; clean boundary clamp; collision-ready.
# WEAKNESSES- Single sprite; no group / batched rendering.
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
clock  = pygame.time.Clock()

img  = pygame.image.load("ship.png").convert_alpha()  # match screen format + alpha
rect = img.get_rect(center=(W // 2, H // 2))
bounds = pygame.Rect(0, 0, W, H)

SPEED = 240   # px/s

while True:
    dt = clock.tick(60) / 1000.0
    for e in pygame.event.get():
        if e.type == pygame.QUIT: pygame.quit(); sys.exit()

    keys = pygame.key.get_pressed()
    dx = (keys[pygame.K_RIGHT] - keys[pygame.K_LEFT]) * SPEED * dt
    dy = (keys[pygame.K_DOWN]  - keys[pygame.K_UP])   * SPEED * dt
    rect.move_ip(int(dx), int(dy))
    rect.clamp_ip(bounds)                             # keep inside the window

    screen.fill((20, 20, 30))
    screen.blit(img, rect)
    pygame.display.flip()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — controllable sprite — production: pygame.sprite.Sprite
#             subclass, sprite group, dirty-rect rendering, normalized
#             diagonal movement.
# APPROACH  - Group.draw + Group.update + display.update(dirty rects).
# STRENGTHS - Scales to many sprites; only dirty rects redraw each frame;
#             diagonal speed not 1.41x faster.
# WEAKNESSES- Dirty-rect tracking has a small CPU cost; on modern GPUs
#             plain display.flip() is often fine.
from __future__ import annotations
import pygame
import sys
import math


class Player(pygame.sprite.Sprite):
    SPEED = 240.0  # px/s

    def __init__(self, image: pygame.Surface, pos: tuple[int, int]):
        super().__init__()
        self.image = image
        self.rect  = image.get_rect(center=pos)
        # Float position so motion isn't quantized to int every frame.
        self._fx, self._fy = float(self.rect.x), float(self.rect.y)

    def update(self, dt: float, bounds: pygame.Rect) -> None:
        keys = pygame.key.get_pressed()
        dx = keys[pygame.K_RIGHT] - keys[pygame.K_LEFT]
        dy = keys[pygame.K_DOWN]  - keys[pygame.K_UP]
        if dx or dy:
            mag = math.hypot(dx, dy)
            dx /= mag; dy /= mag                      # normalize diagonal
        self._fx += dx * self.SPEED * dt
        self._fy += dy * self.SPEED * dt
        self.rect.x = int(self._fx); self.rect.y = int(self._fy)
        self.rect.clamp_ip(bounds)
        self._fx, self._fy = self.rect.x, self.rect.y


def main() -> None:
    pygame.init()
    W, H = 800, 450
    screen = pygame.display.set_mode((W, H))
    bg = pygame.Surface(screen.get_size()).convert()
    bg.fill((20, 20, 30))
    screen.blit(bg, (0, 0))
    pygame.display.flip()

    clock = pygame.time.Clock()
    img   = pygame.image.load("ship.png").convert_alpha()
    player = Player(img, (W // 2, H // 2))
    sprites = pygame.sprite.Group(player)
    bounds = pygame.Rect(0, 0, W, H)

    while True:
        dt = clock.tick(60) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT: pygame.quit(); sys.exit()

        # Erase old positions with the background.
        sprites.clear(screen, bg)
        sprites.update(dt, bounds)
        # draw() returns a list of dirty rects (changed regions).
        dirty = sprites.draw(screen)
        pygame.display.update(dirty)


if __name__ == "__main__":
    main()

# Decision rule:
#   Always after image.load                       -> .convert() (opaque) or .convert_alpha().
#   Need a Rect from a surface                    -> surf.get_rect(topleft=, center=, midbottom=).
#   Need to keep a sprite inside a window          -> rect.clamp_ip(bounds).
#   Need fast collision against many              -> rect.collidelist / collidelistall.
#   Need pixel-perfect collision                   -> pygame.mask.from_surface + Mask.overlap.
#   Need transparent off-screen surface            -> pygame.Surface(size, SRCALPHA).
#   Many moving sprites                            -> pygame.sprite.Group + dirty-rect update.
#   Single full-screen background                  -> blit + display.flip(); dirty rects waste CPU.

# Anti-pattern:
#   img = pygame.image.load("ship.png")           # never .convert()ed
# Loaded surfaces are in a generic 32-bit RGBA format; blitting against
# the screen requires per-pixel format conversion every frame. .convert()
# bakes that conversion ONCE at load time. Always do it.
```

## Decision Rule

```text
Always after image.load                       -> .convert() (opaque) or .convert_alpha().
Need a Rect from a surface                    -> surf.get_rect(topleft=, center=, midbottom=).
Need to keep a sprite inside a window          -> rect.clamp_ip(bounds).
Need fast collision against many              -> rect.collidelist / collidelistall.
Need pixel-perfect collision                   -> pygame.mask.from_surface + Mask.overlap.
Need transparent off-screen surface            -> pygame.Surface(size, SRCALPHA).
Many moving sprites                            -> pygame.sprite.Group + dirty-rect update.
Single full-screen background                  -> blit + display.flip(); dirty rects waste CPU.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   img = pygame.image.load("ship.png")           # never .convert()ed
> Loaded surfaces are in a generic 32-bit RGBA format; blitting against
> the screen requires per-pixel format conversion every frame. .convert()
> bakes that conversion ONCE at load time. Always do it.

## Tips

- Always `.convert()` (opaque) or `.convert_alpha()` (transparent) right after `pygame.image.load(...)` — 5-10× faster blit.
- Use `surface.get_rect(center=...)` / `topleft=...` / `midbottom=...` to anchor positioning.
- Float position internally, `int()` only when assigning to `rect.x/y` — int truncation drops sub-pixel motion.
- Normalize diagonal movement (`math.hypot`) — otherwise diagonal speed is √2 ≈ 1.41× cardinal speed.
- `pygame.sprite.Group` + `Group.draw / update / clear` + `display.update(dirty)` is the standard pattern for many sprites.

## Common Mistake

> [!warning] Calling `pygame.image.load(...)` without `.convert_alpha()`. Each blit re-runs format conversion; framerate tanks at 100+ sprites.

## See Also

- [[Sections/gamedev-pygame/basics/pygame-event-loop|pygame.init / display / event loop / clock (Game Dev (pygame))]]
- [[Sections/gamedev-pygame/basics/_Index|Game Dev (pygame) → Display, event loop, the game frame]]
- [[Sections/gamedev-pygame/_Index|Game Dev (pygame) index]]
- [[_Index|Vault index]]
