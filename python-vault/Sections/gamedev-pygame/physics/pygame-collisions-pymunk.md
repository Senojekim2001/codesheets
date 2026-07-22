---
type: "entry"
domain: "python"
file: "gamedev-pygame"
section: "physics"
id: "pygame-collisions-pymunk"
title: "Rect collision / Mask / pymunk physics — when to upgrade"
category: "physics"
subtitle: "rect.colliderect / collidelist / collidelistall, Sprite.spritecollide(group, sprite, dokill=, collided=), pygame.mask.from_surface + Mask.overlap, pymunk Space + Body + Shape + step, pymunk units (pixels by convention but conversion is on you), draw a pymunk body via its shape -> pygame.draw"
signature_short: "rect.colliderect(other); pygame.mask.from_surface(s).overlap(m2, offset); space = pymunk.Space(); space.gravity = (0, 900); space.step(1/60)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Rect collision / Mask / pymunk physics — when to upgrade"
  - "pygame-collisions-pymunk"
tags:
  - "python"
  - "python/gamedev-pygame"
  - "python/gamedev-pygame/physics"
  - "category/physics"
  - "tier/tiered"
---

# Rect collision / Mask / pymunk physics — when to upgrade

> rect.colliderect / collidelist / collidelistall, Sprite.spritecollide(group, sprite, dokill=, collided=), pygame.mask.from_surface + Mask.overlap, pymunk Space + Body + Shape + step, pymunk units (pixels by convention but conversion is on you), draw a pymunk body via its shape -> pygame.draw

## Overview

Three tiers of collision. **Rect** is fast and simple — `colliderect`, `collidepoint`, `collidelist`. **Mask** is pixel-precise — make a `Mask` from each Sprite's alpha, call `mask.overlap(other_mask, offset)` for non-rectangular shapes. **pymunk** wraps Chipmunk2D, the same engine many indie games ship with — define `Space`, add `Body` (mass + position) and `Shape` (geometry + friction + elasticity), call `space.step(dt)` each frame; render by reading body positions back. Three depths solve the SAME task — make a player-controlled box bounce off walls — at depths: rect-only collision, manual reflection → mask collision against an irregular obstacle → pymunk physics with gravity, friction, and walls as static segments.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Box bounces off the four walls; rect-only collision.
- **Junior** — SAME — box bounces — but against an IRREGULAR obstacle (a star-shaped sprite) using mask collision.
- **Senior** — SAME — bouncing box — production: pymunk physics with gravity, friction, elasticity; pygame just renders.

## Signature

```python
rect.colliderect(other); pygame.mask.from_surface(s).overlap(m2, offset); space = pymunk.Space(); space.gravity = (0, 900); space.step(1/60)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Box bounces off the four walls; rect-only collision.
# APPROACH  - rect.colliderect against four wall rects; flip velocity.
# STRENGTHS - Trivial; no extra deps.
# WEAKNESSES- No gravity; no friction; no rotation; no irregular shapes.
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
clock = pygame.time.Clock()

box = pygame.Rect(100, 100, 40, 40)
vx, vy = 5, 4
walls = [
    pygame.Rect(0, 0, W, 1), pygame.Rect(0, H-1, W, 1),
    pygame.Rect(0, 0, 1, H), pygame.Rect(W-1, 0, 1, H),
]

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT: pygame.quit(); sys.exit()

    box.x += vx; box.y += vy
    for w in walls:
        if box.colliderect(w):
            if w.width >  w.height: vy = -vy        # horizontal wall
            else:                    vx = -vx       # vertical wall

    screen.fill((20, 20, 30))
    pygame.draw.rect(screen, (240, 220, 80), box)
    for w in walls: pygame.draw.rect(screen, (100, 100, 100), w)
    pygame.display.flip()
    clock.tick(60)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — box bounces — but against an IRREGULAR obstacle
#             (a star-shaped sprite) using mask collision.
# APPROACH  - Mask.from_surface for both; Mask.overlap with offset.
# STRENGTHS - Pixel-perfect against any shape.
# WEAKNESSES- Doesn't compute the contact normal; ad-hoc bounce.
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
clock  = pygame.time.Clock()

box_img = pygame.Surface((40, 40), pygame.SRCALPHA)
pygame.draw.rect(box_img, (240, 220, 80), box_img.get_rect())
box_rect = box_img.get_rect(topleft=(50, 50))
box_mask = pygame.mask.from_surface(box_img)

# Star-shape obstacle (loaded from a transparent PNG in real code).
star_img = pygame.image.load("star.png").convert_alpha()
star_rect = star_img.get_rect(center=(W//2, H//2))
star_mask = pygame.mask.from_surface(star_img)

vx, vy = 4, 3

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT: pygame.quit(); sys.exit()

    box_rect.x += vx; box_rect.y += vy

    # Window edges (rect collision is fine for axis-aligned boundaries).
    if box_rect.left < 0 or box_rect.right > W:  vx = -vx
    if box_rect.top  < 0 or box_rect.bottom > H: vy = -vy

    # Pixel-perfect against the star.
    offset = (star_rect.x - box_rect.x, star_rect.y - box_rect.y)
    if box_mask.overlap(star_mask, offset):
        # Crude reflection: flip both axes (real engine = compute normal).
        vx = -vx; vy = -vy

    screen.fill((20, 20, 30))
    screen.blit(star_img, star_rect)
    screen.blit(box_img,  box_rect)
    pygame.display.flip()
    clock.tick(60)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — bouncing box — production: pymunk physics with
#             gravity, friction, elasticity; pygame just renders.
# APPROACH  - pymunk.Space + dynamic Body + static walls; sync rect from
#             body.position each frame.
# STRENGTHS - Real physics: bounces feel right, falls under gravity,
#             friction with walls, joints/springs/constraints available.
# WEAKNESSES- pymunk is a separate dep; coordinate frames need care
#             (pymunk Y is up by default; flip when drawing).
from __future__ import annotations
import pygame
import sys
import pymunk


def to_pygame(p: pymunk.Vec2d, h: int) -> tuple[int, int]:
    """Convert pymunk world coords (Y up) to pygame screen coords (Y down)."""
    return int(p.x), int(h - p.y)


def main() -> None:
    pygame.init()
    W, H = 800, 450
    screen = pygame.display.set_mode((W, H))
    clock  = pygame.time.Clock()
    font   = pygame.font.SysFont("monospace", 14)

    # --- pymunk world ---
    space = pymunk.Space()
    space.gravity = (0, -900)                         # gravity points -Y in pymunk

    # Walls (static): bottom, left, right.
    static_lines = [
        pymunk.Segment(space.static_body, (0, 0),     (W, 0),     2),
        pymunk.Segment(space.static_body, (0, 0),     (0, H),     2),
        pymunk.Segment(space.static_body, (W, 0),     (W, H),     2),
    ]
    for s in static_lines:
        s.elasticity = 0.95
        s.friction   = 0.5
        space.add(s)

    # Dynamic box.
    mass, size = 1.0, 40
    moment = pymunk.moment_for_box(mass, (size, size))
    body = pymunk.Body(mass, moment)
    body.position = (100, H - 100)                    # pymunk world coords
    box_shape = pymunk.Poly.create_box(body, (size, size))
    box_shape.elasticity = 0.85
    box_shape.friction   = 0.4
    space.add(body, box_shape)

    PHYSICS_HZ = 240
    DT = 1.0 / PHYSICS_HZ

    while True:
        for e in pygame.event.get():
            if e.type == pygame.QUIT: pygame.quit(); sys.exit()
            elif e.type == pygame.MOUSEBUTTONDOWN:
                # Apply an impulse on click.
                mx, my = e.pos
                target = pymunk.Vec2d(mx, H - my) - body.position
                body.apply_impulse_at_local_point(target * 5)

        # Substep for stability.
        for _ in range(4):
            space.step(DT)

        screen.fill((20, 20, 30))

        # Walls.
        for s in static_lines:
            a = to_pygame(s.a, H); b = to_pygame(s.b, H)
            pygame.draw.line(screen, (180, 180, 180), a, b, 2)

        # Box: read 4 corners from the polygon shape.
        verts = [body.local_to_world(v) for v in box_shape.get_vertices()]
        verts_screen = [to_pygame(v, H) for v in verts]
        pygame.draw.polygon(screen, (240, 220, 80), verts_screen)

        screen.blit(font.render("click to apply impulse", True, (200, 200, 200)),
                    (10, 10))
        pygame.display.flip()
        clock.tick(60)


if __name__ == "__main__":
    main()

# Decision rule:
#   Axis-aligned arcade game                 -> rect.colliderect / collidelist.
#   Pixel-perfect against irregular shapes   -> pygame.mask.from_surface + Mask.overlap.
#   Need many vs many collision              -> sprite.groupcollide(g1, g2, dokill_a, dokill_b).
#   Need real physics (gravity, friction)    -> pymunk (Chipmunk2D); pygame just renders.
#   Need tile-based collision                 -> rect against grid cells; many engines do
#                                                 this faster than pymunk for tile maps.
#   Need 2D rigid body + joints + springs    -> pymunk.
#   Need 3D physics                            -> not pygame; reach for Panda3D + Bullet,
#                                                 or Godot/Unity with a Python script binding.
#   Need GPU sprite batching                   -> arcade or moderngl-pygame
#                                                 (pygame is software-rendered).

# Anti-pattern:
#   for s in obstacles:
#       if rect.colliderect(s.rect): handle(s)
# Linear scan over thousands of sprites kills the frame budget. Use
# pygame.sprite.Group + groupcollide, or a spatial hash for very
# large worlds.
```

## Decision Rule

```text
Axis-aligned arcade game                 -> rect.colliderect / collidelist.
Pixel-perfect against irregular shapes   -> pygame.mask.from_surface + Mask.overlap.
Need many vs many collision              -> sprite.groupcollide(g1, g2, dokill_a, dokill_b).
Need real physics (gravity, friction)    -> pymunk (Chipmunk2D); pygame just renders.
Need tile-based collision                 -> rect against grid cells; many engines do
                                              this faster than pymunk for tile maps.
Need 2D rigid body + joints + springs    -> pymunk.
Need 3D physics                            -> not pygame; reach for Panda3D + Bullet,
                                              or Godot/Unity with a Python script binding.
Need GPU sprite batching                   -> arcade or moderngl-pygame
                                              (pygame is software-rendered).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for s in obstacles:
>       if rect.colliderect(s.rect): handle(s)
> Linear scan over thousands of sprites kills the frame budget. Use
> pygame.sprite.Group + groupcollide, or a spatial hash for very
> large worlds.

## Tips

- Use `rect.colliderect` first — switch to masks only when you need pixel-perfect against irregular shapes.
- For many-vs-many, `pygame.sprite.groupcollide(group_a, group_b, dokill_a, dokill_b)` is much faster than nested loops.
- For real physics (gravity, friction, joints), reach for **pymunk** — pygame for render, pymunk for simulation.
- pymunk's default Y axis is **up** (world coords) — convert to pygame's Y-down screen coords explicitly.
- Substep `space.step(dt)` 2-8 times per frame for stability — fast bodies tunneling through walls is a sign you need more substeps.

## Common Mistake

> [!warning] Treating pymunk world coordinates as pygame screen coordinates — your gravity falls UP onscreen until you flip Y when rendering.

## See Also

- [[Sections/gamedev-pygame/physics/_Index|Game Dev (pygame) → Collisions and physics]]
- [[Sections/gamedev-pygame/_Index|Game Dev (pygame) index]]
- [[_Index|Vault index]]
