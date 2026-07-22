---
type: "file-index"
domain: "python"
file: "gamedev-pygame"
title: "Game Dev (pygame)"
tags:
  - "python"
  - "python/gamedev-pygame"
  - "index"
---

# Game Dev (pygame)

> 4 entries across 3 sections.

## Display, event loop, the game frame · 2

- [[Sections/gamedev-pygame/basics/pygame-event-loop|pygame.init / display / event loop / clock]] — Every pygame app is the same shape: `pygame.init()` → create a display surface → loop {handle events → update state → draw → flip → tick the clock}. Use `pygame.time.Clock()` to cap framerate; never `time.sleep()` inside the loop.
- [[Sections/gamedev-pygame/basics/pygame-surface-rect|Surface / Rect / blit / convert — the drawing primitives]] — `Surface` is a 2D pixel buffer; `screen` is the special one tied to the window. `Rect` is `(x, y, w, h)` with collision/positioning helpers. **Always call `.convert()` (opaque) or `.convert_alpha()` (with transparency) right after loading an image** — un-converted surfaces blit 5-10× slower.

## Collisions and physics · 1

- [[Sections/gamedev-pygame/physics/pygame-collisions-pymunk|Rect collision / Mask / pymunk physics — when to upgrade]] — For arcade games, `rect.colliderect(other)` is enough. For pixel-perfect, use `pygame.mask.from_surface(surf)` + `Mask.overlap`. For real physics (gravity, friction, joints), use `pymunk` (Chipmunk2D bindings) — pygame for rendering, pymunk for simulation.

## Game-loop patterns and engine choice · 1

- [[Sections/gamedev-pygame/patterns/gamedev-patterns-engines|Game-state stack / scene manager / engine choice]] — Most games are state machines: title → menu → play → pause → game-over. Implement as a stack of `Scene` objects (each with `handle_event`, `update(dt)`, `draw(screen)`); push/pop transitions. For polished 2D, **arcade** is faster than pygame; for full engines reach for **Godot** or **Unity** — Python's role becomes integration, not the runtime.
