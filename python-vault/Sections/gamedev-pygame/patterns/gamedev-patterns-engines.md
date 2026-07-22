---
type: "entry"
domain: "python"
file: "gamedev-pygame"
section: "patterns"
id: "gamedev-patterns-engines"
title: "Game-state stack / scene manager / engine choice"
category: "patterns"
subtitle: "Scene base class with handle_event / update / draw, stack-based scene manager (push, pop, swap), pause via push, modal overlays, transition fades, pygame vs arcade (GPU-batched, faster) vs pyglet vs Godot (GDScript / Python via godot-python) vs Unity (C# only)"
signature_short: "class Scene: def handle_event(e): ...; def update(dt): ...; def draw(screen): ...\\nstack = [TitleScene()]; while ...: stack[-1].update(dt); stack[-1].draw(screen)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Game-state stack / scene manager / engine choice"
  - "gamedev-patterns-engines"
tags:
  - "python"
  - "python/gamedev-pygame"
  - "python/gamedev-pygame/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Game-state stack / scene manager / engine choice

> Scene base class with handle_event / update / draw, stack-based scene manager (push, pop, swap), pause via push, modal overlays, transition fades, pygame vs arcade (GPU-batched, faster) vs pyglet vs Godot (GDScript / Python via godot-python) vs Unity (C# only)

## Overview

A scene stack lets you push the pause menu without losing the gameplay scene underneath, transition with a fade, and pop back. For pure pygame, you implement the stack yourself; **arcade** ships a `View` class with the same idea but GPU-batched rendering. Beyond pygame: **arcade** for 2D with sprites at scale (10k+ sprites without dropping frames); **pyglet** for OpenGL-y stuff; **Godot** for a real engine (use GDScript — its native language — and embed Python via `godot-python` if you must). Unity is C#-only. Three depths solve the SAME task — title screen → play → game-over flow — at depths: ad-hoc state variable + if-chain → Scene stack with push/pop transitions → arcade.View skeleton with the same flow, demonstrating engine swap.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Title -> Play -> Game Over flow (press SPACE to advance).
- **Junior** — SAME — title/play/over — using a Scene stack.
- **Senior** — SAME — title/play/over — but in arcade (GPU-batched), showing the migration target when you outgrow pygame.

## Signature

```python
class Scene: def handle_event(e): ...; def update(dt): ...; def draw(screen): ...\nstack = [TitleScene()]; while ...: stack[-1].update(dt); stack[-1].draw(screen)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Title -> Play -> Game Over flow (press SPACE to advance).
# APPROACH  - One state variable + if/elif inside the loop.
# STRENGTHS - Smallest possible state machine.
# WEAKNESSES- Gets ugly past 2-3 states; no pause / overlay support.
import pygame, sys

pygame.init()
W, H = 640, 360
screen = pygame.display.set_mode((W, H))
clock  = pygame.time.Clock()
font   = pygame.font.SysFont("sans", 36)

state = "title"

while True:
    for e in pygame.event.get():
        if e.type == pygame.QUIT: pygame.quit(); sys.exit()
        if e.type == pygame.KEYDOWN and e.key == pygame.K_SPACE:
            state = {"title": "play", "play": "over", "over": "title"}[state]

    screen.fill((20, 20, 30))
    if state == "title":
        screen.blit(font.render("TITLE - press SPACE", True, (240, 240, 240)), (W//2 - 200, H//2))
    elif state == "play":
        screen.blit(font.render("PLAYING", True, (120, 220, 120)), (W//2 - 80, H//2))
    elif state == "over":
        screen.blit(font.render("GAME OVER", True, (220, 80, 80)),   (W//2 - 110, H//2))

    pygame.display.flip()
    clock.tick(60)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — title/play/over — using a Scene stack.
# APPROACH  - Scene base class; manager.push / pop / swap.
# STRENGTHS - Pause = push the pause scene; resume = pop. Clean overlays.
# WEAKNESSES- Pygame still software-rendered; no GPU sprite batching.
import pygame, sys


class Scene:
    def handle_event(self, event, manager): ...
    def update(self, dt, manager): ...
    def draw(self, screen): ...


class SceneManager:
    def __init__(self, initial: Scene): self.stack: list[Scene] = [initial]
    def push(self, s: Scene):  self.stack.append(s)
    def pop(self):             self.stack.pop()
    def swap(self, s: Scene):  self.stack[-1] = s
    @property
    def top(self) -> Scene:    return self.stack[-1]


class TitleScene(Scene):
    def handle_event(self, e, mgr):
        if e.type == pygame.KEYDOWN and e.key == pygame.K_SPACE:
            mgr.swap(PlayScene())

    def draw(self, screen):
        screen.fill((20, 20, 30))
        font = pygame.font.SysFont("sans", 36)
        screen.blit(font.render("TITLE - SPACE to play", True, (240, 240, 240)), (60, 140))


class PlayScene(Scene):
    def handle_event(self, e, mgr):
        if e.type == pygame.KEYDOWN:
            if e.key == pygame.K_p:     mgr.push(PauseScene())
            elif e.key == pygame.K_RETURN: mgr.swap(GameOverScene())

    def draw(self, screen):
        screen.fill((30, 60, 30))
        font = pygame.font.SysFont("sans", 28)
        screen.blit(font.render("PLAYING - P to pause / RETURN to die", True, (220, 220, 220)),
                    (40, 140))


class PauseScene(Scene):
    def handle_event(self, e, mgr):
        if e.type == pygame.KEYDOWN and e.key == pygame.K_p: mgr.pop()

    def draw(self, screen):
        # Translucent overlay: scene below still drew its frame.
        overlay = pygame.Surface(screen.get_size(), pygame.SRCALPHA)
        overlay.fill((0, 0, 0, 160))
        screen.blit(overlay, (0, 0))
        font = pygame.font.SysFont("sans", 36)
        screen.blit(font.render("PAUSED", True, (255, 255, 255)), (260, 150))


class GameOverScene(Scene):
    def handle_event(self, e, mgr):
        if e.type == pygame.KEYDOWN and e.key == pygame.K_SPACE: mgr.swap(TitleScene())

    def draw(self, screen):
        screen.fill((40, 20, 20))
        font = pygame.font.SysFont("sans", 36)
        screen.blit(font.render("GAME OVER - SPACE", True, (240, 80, 80)), (140, 150))


def main():
    pygame.init()
    screen = pygame.display.set_mode((640, 360))
    clock  = pygame.time.Clock()
    mgr    = SceneManager(TitleScene())

    while True:
        dt = clock.tick(60) / 1000.0
        for e in pygame.event.get():
            if e.type == pygame.QUIT: pygame.quit(); sys.exit()
            mgr.top.handle_event(e, mgr)

        # PauseScene wants the gameplay frame underneath - draw the
        # scene below first, then the top scene on top.
        for s in mgr.stack:
            s.draw(screen)

        # Only the top scene updates each frame (paused scenes are frozen).
        mgr.top.update(dt, mgr)

        pygame.display.flip()


main()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — title/play/over — but in arcade (GPU-batched), showing
#             the migration target when you outgrow pygame.
# APPROACH  - arcade.View with on_show / on_update / on_draw; window.show_view.
# STRENGTHS - GPU sprite batching (10k+ sprites at 60 FPS); same logical
#             structure as pygame Scene stack; modern arcade==3.x.
# WEAKNESSES- Different API to learn; arcade itself is opinionated about
#             coordinate origin (bottom-left).
import arcade


W, H = 640, 360


class TitleView(arcade.View):
    def on_draw(self):
        self.clear()
        arcade.draw_text(
            "TITLE - SPACE to play", W//2, H//2,
            arcade.color.WHITE, font_size=24, anchor_x="center",
        )

    def on_key_press(self, symbol, modifiers):
        if symbol == arcade.key.SPACE:
            self.window.show_view(PlayView())


class PlayView(arcade.View):
    def on_show_view(self):
        arcade.set_background_color(arcade.color.DARK_GREEN)

    def on_draw(self):
        self.clear()
        arcade.draw_text(
            "PLAYING - RETURN to die", W//2, H//2,
            arcade.color.WHITE, font_size=24, anchor_x="center",
        )

    def on_key_press(self, symbol, modifiers):
        if symbol == arcade.key.ENTER:
            self.window.show_view(GameOverView())


class GameOverView(arcade.View):
    def on_show_view(self):
        arcade.set_background_color(arcade.color.DARK_RED)

    def on_draw(self):
        self.clear()
        arcade.draw_text(
            "GAME OVER - SPACE", W//2, H//2,
            arcade.color.WHITE, font_size=24, anchor_x="center",
        )

    def on_key_press(self, symbol, modifiers):
        if symbol == arcade.key.SPACE:
            self.window.show_view(TitleView())


def main():
    window = arcade.Window(W, H, "scene demo")
    window.show_view(TitleView())
    arcade.run()


# main()

# Decision rule:
#   Tiny prototype                                -> single state variable.
#   Real game with menu / pause / overlays        -> Scene stack (junior tier).
#   2D, want GPU sprite batching + perf            -> arcade (3.x).
#   2D + retro effects + lower-level OpenGL        -> pyglet or moderngl-pygame.
#   2D/3D engine with editor + GDScript            -> Godot 4 (native; godot-python optional).
#   Want Python in Unity                            -> not happening; Unity is C#.
#   Mobile target                                   -> Pygbag (pygame -> WASM) or arcade -> WASM
#                                                     for web; Kivy / BeeWare for native.
#   Multiplayer netcode                              -> deterministic fixed-step (basics tier 3)
#                                                       + bsdiff snapshots; consider Mirror (Unity)
#                                                       or Godot HLAPI long-term.

# Anti-pattern:
#   global state = "play"
#   if state == "menu": ...elif state == "play": ...elif state == "shop": ...
# Past 3 states this becomes unmaintainable and impossible to add overlay
# behavior (pause-over-play). Switch to a Scene/View stack early.
```

## Decision Rule

```text
Tiny prototype                                -> single state variable.
Real game with menu / pause / overlays        -> Scene stack (junior tier).
2D, want GPU sprite batching + perf            -> arcade (3.x).
2D + retro effects + lower-level OpenGL        -> pyglet or moderngl-pygame.
2D/3D engine with editor + GDScript            -> Godot 4 (native; godot-python optional).
Want Python in Unity                            -> not happening; Unity is C#.
Mobile target                                   -> Pygbag (pygame -> WASM) or arcade -> WASM
                                                  for web; Kivy / BeeWare for native.
Multiplayer netcode                              -> deterministic fixed-step (basics tier 3)
                                                    + bsdiff snapshots; consider Mirror (Unity)
                                                    or Godot HLAPI long-term.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   global state = "play"
>   if state == "menu": ...elif state == "play": ...elif state == "shop": ...
> Past 3 states this becomes unmaintainable and impossible to add overlay
> behavior (pause-over-play). Switch to a Scene/View stack early.

## Tips

- A Scene/View stack handles menus, pauses, and overlays cleanly — push for overlays, pop to dismiss, swap to transition.
- Only the **top** scene receives `update`/`handle_event`; scenes below stay frozen — that's how pause works.
- **arcade** (3.x) is the GPU-accelerated next step from pygame — the same `View` idea, with sprite batching that holds 60 FPS at 10k+ sprites.
- For 2D/3D engines with editors, **Godot 4** is the open-source winner; GDScript is Python-like, and `godot-python` lets you write game logic in Python.
- For web-deployable pygame games, **Pygbag** ships pygame to WASM — `pygbag main.py` and you've got an itch.io build.

## Common Mistake

> [!warning] Long if/elif chains over a state variable. Past 3 states it becomes unmaintainable, and adding an overlay (pause-over-play) requires rewriting it. Switch to a Scene stack early.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/gamedev-pygame/patterns/_Index|Game Dev (pygame) → Game-loop patterns and engine choice]]
- [[Sections/gamedev-pygame/_Index|Game Dev (pygame) index]]
- [[_Index|Vault index]]
