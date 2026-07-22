export const meta = {
  "id": "animations",
  "label": "Animations & Transitions",
  "icon": "🎬",
  "description": "CSS transitions, keyframe animations, scroll-driven animations, View Transitions API, and motion best practices."
}

export const sections = [

  // ── Section 1: Transitions & Transforms ─────────────────────────────────────────
  {
    id: "transitions",
    title: "Transitions & Transforms",
    entries: [
      {
        id: "transition-fundamentals",
        fn: "CSS Transitions — Smooth Property Changes",
        desc: "Animate property changes with transition shorthand: property, duration, timing function, and delay.",
        category: "Transitions",
        subtitle: "transition, transition-property, timing functions, will-change",
        signature: "transition: property duration timing-fn delay  |  transition: all 0.3s ease",
        descLong: "CSS transitions animate property changes between two states. Only some properties are animatable (color, opacity, transform, width — not display or grid-template). The transition shorthand takes property, duration, timing function, and delay. Use specific properties instead of \"all\" for performance. cubic-bezier() creates custom easing curves. will-change hints the browser to optimize for upcoming changes but should be used sparingly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Transitions — Smooth Property Changes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Transition shorthand ─────────────────────────── */\n.button {\n  background: #3b82f6;\n  color: white;\n  padding: 0.75rem 1.5rem;\n  border-radius: 0.5rem;\n  /* transition: property duration timing-fn delay */\n  transition: background 0.2s ease,\n              transform 0.2s ease,\n              box-shadow 0.2s ease;\n}\n\n.button:hover {\n  background: #2563eb;\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);\n}\n\n.button:active {\n  transform: translateY(0);\n  transition-duration: 0.1s;  /* faster snap back */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Transitions — Smooth Property Changes — common patterns you'll see in production.\n// APPROACH  - Combine CSS Transitions — Smooth Property Changes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Timing functions ────────────────────────────── */\n.ease-linear    { transition-timing-function: linear; }\n.ease-in        { transition-timing-function: ease-in; }        /* slow start */\n.ease-out       { transition-timing-function: ease-out; }       /* slow end */\n.ease-in-out    { transition-timing-function: ease-in-out; }    /* slow both */\n.ease-default   { transition-timing-function: ease; }           /* default */\n\n/* Custom cubic-bezier — design at cubic-bezier.com */\n.bounce-out     { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }\n.smooth-decel   { transition-timing-function: cubic-bezier(0, 0, 0.2, 1); }\n\n/* ── Transition individual properties (performant) ── */\n.card {\n  /* Only animate transform & opacity — GPU-accelerated */\n  transition: transform 0.3s ease, opacity 0.3s ease;\n  will-change: transform;  /* hint browser, use sparingly */\n}\n\n.card:hover {\n  transform: scale(1.02);\n  opacity: 0.95;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Transitions — Smooth Property Changes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Staggered transitions via delay ─────────────── */\n.nav-item:nth-child(1) { transition-delay: 0ms; }\n.nav-item:nth-child(2) { transition-delay: 50ms; }\n.nav-item:nth-child(3) { transition-delay: 100ms; }\n.nav-item:nth-child(4) { transition-delay: 150ms; }\n\n/* ── Transition on class toggle ──────────────────── */\n.sidebar {\n  transform: translateX(-100%);\n  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.sidebar.open {\n  transform: translateX(0);\n}"
                  }
        ],
        tips: [
                  "Only transform and opacity are truly GPU-accelerated — animate these instead of width/height/top/left for 60fps.",
                  "Use specific properties (transition: opacity 0.3s) not transition: all — \"all\" triggers transitions on every property change.",
                  "cubic-bezier.com lets you visually design custom easing curves — copy the values directly into CSS.",
                  "will-change should be added just before animation starts and removed after — permanent will-change wastes GPU memory."
        ],
        mistake: "Animating width/height/top/left — these trigger layout recalculation (reflow) on every frame. Use transform: translateX/translateY/scale instead, which only trigger compositing (GPU-accelerated).",
        shorthand: {
          verbose: "transition-property: background-color;\ntransition-duration: 0.3s;\ntransition-timing-function: ease;\ntransition-delay: 0s;",
          concise: "transition: background-color 0.3s ease;",
        },
      },
      {
        id: "transforms",
        fn: "CSS Transforms — 2D & 3D Manipulations",
        desc: "Translate, rotate, scale, and skew elements in 2D and 3D space with hardware-accelerated transforms.",
        category: "Transforms",
        subtitle: "translate, rotate, scale, skew, perspective, transform-origin",
        signature: "transform: translate() rotate() scale()  |  perspective()  |  transform-style: preserve-3d",
        descLong: "CSS transforms modify element rendering without affecting layout flow. 2D transforms include translate (move), rotate (spin), scale (resize), and skew (tilt). 3D transforms add perspective, rotateX/Y/Z, and translateZ for depth. transform-origin controls the pivot point. Individual transform properties (translate, rotate, scale) in modern CSS allow independent animation. Transforms are GPU-accelerated and do not trigger reflow.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Transforms — 2D & 3D Manipulations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── 2D transforms ────────────────────────────────── */\n.move    { transform: translate(50px, 20px); }\n.move-x  { transform: translateX(100px); }\n.move-y  { transform: translateY(-50px); }\n.spin    { transform: rotate(45deg); }\n.grow    { transform: scale(1.5); }\n.grow-xy { transform: scale(1.5, 0.8); }       /* x, y separately */\n.tilt    { transform: skew(10deg, 5deg); }\n\n/* Combine multiple transforms (order matters!) */\n.complex { transform: translateX(50px) rotate(45deg) scale(1.2); }\n\n/* ── transform-origin — pivot point ──────────────── */\n.from-center  { transform-origin: center; }            /* default */\n.from-corner  { transform-origin: top left; }\n.from-bottom  { transform-origin: bottom center; }\n.custom       { transform-origin: 20% 80%; }\n\n/* Spinning from corner vs center */\n.spin-center { transform: rotate(90deg); transform-origin: center; }\n.spin-corner { transform: rotate(90deg); transform-origin: top left; }\n\n/* ── 3D transforms ───────────────────────────────── */\n.scene {\n  perspective: 1000px;           /* depth for children */\n  perspective-origin: center;    /* vanishing point */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Transforms — 2D & 3D Manipulations — common patterns you'll see in production.\n// APPROACH  - Combine CSS Transforms — 2D & 3D Manipulations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.card-3d {\n  transform-style: preserve-3d;  /* enable 3D for children */\n  transition: transform 0.6s;\n}\n\n.card-3d:hover {\n  transform: rotateY(180deg);\n}\n\n/* Front and back faces */\n.card-face {\n  position: absolute;\n  width: 100%;\n  height: 100%;\n  backface-visibility: hidden;   /* hide when facing away */\n}\n\n.card-back {\n  transform: rotateY(180deg);\n}\n\n/* ── Modern individual transform properties ──────── */\n/* Can animate each independently! */\n.modern {\n  translate: 50px 20px;\n  rotate: 45deg;\n  scale: 1.2;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Transforms — 2D & 3D Manipulations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.modern:hover {\n  /* Only scale changes — translate & rotate unaffected */\n  scale: 1.5;\n  transition: scale 0.3s ease;\n}\n\n/* ── Practical: tooltip arrow ────────────────────── */\n.tooltip::after {\n  content: \"\";\n  position: absolute;\n  bottom: -6px;\n  left: 50%;\n  transform: translateX(-50%) rotate(45deg);\n  width: 12px;\n  height: 12px;\n  background: inherit;\n}"
                  }
        ],
        tips: [
                  "Transform order matters: translate then rotate gives different results than rotate then translate — transforms apply right-to-left.",
                  "Individual transform properties (translate, rotate, scale) let you animate each independently without restating the others.",
                  "perspective: 1000px is a good default for subtle 3D effects — lower values create more dramatic perspective distortion.",
                  "backface-visibility: hidden is essential for flip cards — without it, the back face shows through as a mirror image."
        ],
        mistake: "Using translate without units (transform: translate(50, 20)) — CSS requires units for translate values. Use translate(50px, 20px) or translate(10%, 5%).",
        shorthand: {
          verbose: "transform: translateY(-4px);\ntransform: scale(1.1);\ntransform: rotate(45deg);",
          concise: "transform: translateY(-4px) scale(1.1) rotate(45deg);",
        },
      },
    ],
  },

  // ── Section 2: Keyframe Animations ─────────────────────────────────────────
  {
    id: "keyframes",
    title: "Keyframe Animations",
    entries: [
      {
        id: "keyframe-animations",
        fn: "@keyframes — Multi-Step Animations",
        desc: "Define complex multi-step animations with @keyframes, control playback with animation properties.",
        category: "Animations",
        subtitle: "@keyframes, animation, animation-fill-mode, steps(), iteration-count",
        signature: "@keyframes name { from {} to {} }  |  animation: name duration timing iteration  |  animation-play-state",
        descLong: "@keyframes defines animation sequences with percentage-based waypoints (from/0% to to/100%). The animation shorthand applies keyframes with duration, timing, delay, iteration count, direction, fill mode, and play state. animation-fill-mode controls styles before/after animation. animation-direction: alternate creates back-and-forth motion. steps() timing creates sprite-sheet and typewriter effects. Multiple animations can run simultaneously on one element.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @keyframes — Multi-Step Animations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic keyframe animation ─────────────────────── */\n@keyframes fadeIn {\n  from { opacity: 0; transform: translateY(20px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.fade-in {\n  animation: fadeIn 0.5s ease forwards;\n  /* name | duration | timing | fill-mode */\n}\n\n/* ── Multi-step keyframes ────────────────────────── */\n@keyframes pulse {\n  0%   { transform: scale(1); }\n  50%  { transform: scale(1.05); }\n  100% { transform: scale(1); }\n}\n\n.pulse { animation: pulse 2s ease-in-out infinite; }\n\n/* ── Bounce animation ────────────────────────────── */\n@keyframes bounce {\n  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }\n  40%  { transform: translateY(-30px); }\n  60%  { transform: translateY(-15px); }\n}\n\n.bounce { animation: bounce 1s ease infinite; }\n\n/* ── Spinner / loading ───────────────────────────── */\n@keyframes spin {\n  to { transform: rotate(360deg); }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @keyframes — Multi-Step Animations — common patterns you'll see in production.\n// APPROACH  - Combine @keyframes — Multi-Step Animations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.spinner {\n  width: 24px;\n  height: 24px;\n  border: 3px solid #e5e7eb;\n  border-top-color: #3b82f6;\n  border-radius: 50%;\n  animation: spin 0.8s linear infinite;\n}\n\n/* ── animation-fill-mode ─────────────────────────── */\n/* none:      resets to original styles after animation */\n/* forwards:  keeps final keyframe styles */\n/* backwards: applies first keyframe styles during delay */\n/* both:      combines forwards + backwards */\n.appear {\n  opacity: 0;\n  animation: fadeIn 0.5s ease 0.3s both;\n  /* \"both\" → stays invisible during 0.3s delay, */\n  /* then animates, then keeps final state */\n}\n\n/* ── animation-direction ─────────────────────────── */\n.ping-pong {\n  animation: pulse 1s ease-in-out infinite alternate;\n  /* alternate: plays forward then backward */\n}\n\n/* ── steps() — sprite sheets & typewriter ────────── */\n@keyframes typewriter {\n  from { width: 0; }\n  to   { width: 12ch; }     /* 12 characters */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @keyframes — Multi-Step Animations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@keyframes blink {\n  50% { border-color: transparent; }\n}\n\n.typewriter {\n  font-family: monospace;\n  overflow: hidden;\n  white-space: nowrap;\n  border-right: 2px solid;\n  animation:\n    typewriter 2s steps(12) forwards,\n    blink 0.7s step-end infinite;\n}\n\n/* ── Multiple animations on one element ──────────── */\n.dramatic-entrance {\n  animation:\n    fadeIn 0.5s ease forwards,\n    pulse 2s ease-in-out 0.5s infinite;\n  /* fade in first, then pulse continuously */\n}\n\n/* ── Animation play state (pause/resume) ─────────── */\n.animated-bg {\n  animation: gradientShift 10s ease infinite;\n}\n\n.animated-bg:hover {\n  animation-play-state: paused;\n}"
                  }
        ],
        tips: [
                  "animation-fill-mode: forwards keeps the final frame styles — without it, the element snaps back to its pre-animation state.",
                  "Use both fill mode with delayed animations — backwards applies the 0% frame during the delay period.",
                  "steps(N) divides the animation into N discrete frames — perfect for sprite sheets and typewriter effects.",
                  "animation-play-state: paused lets users pause animations on hover — a good accessibility and UX pattern."
        ],
        mistake: "Forgetting animation-fill-mode: forwards — the element snaps back to its original state after the animation ends. Add \"forwards\" or \"both\" to keep the final keyframe styles.",
        shorthand: {
          verbose: "animation-name: slide-in;\nanimation-duration: 0.5s;\nanimation-timing-function: ease-out;\nanimation-fill-mode: forwards;",
          concise: "animation: slide-in 0.5s ease-out forwards;",
        },
      },
      {
        id: "scroll-animations",
        fn: "Scroll-Driven Animations & View Transitions",
        desc: "Animate elements based on scroll position with scroll-timeline, and smooth page transitions with the View Transitions API.",
        category: "Animations",
        subtitle: "scroll-timeline, view-timeline, animation-timeline, View Transitions API",
        signature: "animation-timeline: scroll()  |  animation-timeline: view()  |  document.startViewTransition()",
        descLong: "Scroll-driven animations (CSS-only, no JS) link animation progress to scroll position. animation-timeline: scroll() ties animation to the scroll container. animation-timeline: view() triggers animation when an element enters the viewport (replacing Intersection Observer for animations). The View Transitions API creates smooth transitions between page states or routes — morphing elements, crossfading, and shared element transitions. Both are modern, performant alternatives to JS scroll libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Scroll-Driven Animations & View Transitions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Scroll-driven animation (CSS only) ──────────── */\n/* Progress bar that fills as user scrolls */\n.scroll-progress {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 4px;\n  background: #3b82f6;\n  transform-origin: left;\n  animation: scaleProgress linear;\n  animation-timeline: scroll();   /* tied to scroll position */\n}\n\n@keyframes scaleProgress {\n  from { transform: scaleX(0); }\n  to   { transform: scaleX(1); }\n}\n\n/* ── View-timeline — animate on viewport entry ───── */\n/* Fade in elements as they scroll into view */\n.reveal {\n  opacity: 0;\n  transform: translateY(40px);\n  animation: revealUp linear both;\n  animation-timeline: view();           /* triggers on viewport entry */\n  animation-range: entry 0% entry 100%; /* animate during entry phase */\n}\n\n@keyframes revealUp {\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Scroll-Driven Animations & View Transitions — common patterns you'll see in production.\n// APPROACH  - Combine Scroll-Driven Animations & View Transitions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Parallax with scroll-timeline ───────────────── */\n.parallax-bg {\n  animation: parallax linear;\n  animation-timeline: scroll();\n}\n\n@keyframes parallax {\n  from { transform: translateY(0); }\n  to   { transform: translateY(-200px); }\n}\n\n/* ── animation-range — control when animation plays ─ */\n.stagger-reveal {\n  animation: revealUp linear both;\n  animation-timeline: view();\n  animation-range: entry 10% cover 30%;\n  /* Start at 10% entered, complete at 30% covered */\n}\n\n/* ── View Transitions API (JS + CSS) ─────────────── */\n/* In JavaScript: */\n/* document.startViewTransition(() => {              */\n/*   updateDOM();  // your DOM changes               */\n/* });                                                */\n\n/* CSS rules for the transition: */\n::view-transition-old(root) {\n  animation: fadeOut 0.3s ease;\n}\n\n::view-transition-new(root) {\n  animation: fadeIn 0.3s ease;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Scroll-Driven Animations & View Transitions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Named view transitions (shared elements) ────── */\n.product-image {\n  view-transition-name: hero-image;\n}\n\n/* Animate the specific element between states */\n::view-transition-old(hero-image) {\n  animation: scaleDown 0.3s ease;\n}\n\n::view-transition-new(hero-image) {\n  animation: scaleUp 0.3s ease;\n}\n\n/* ── Cross-document view transitions (MPA) ───────── */\n/* In <head> of both pages: */\n/* <meta name=\"view-transition\" content=\"same-origin\"> */\n\n/* Same CSS rules apply — browser handles the rest */\n\n@keyframes fadeOut  { to { opacity: 0; } }\n@keyframes scaleDown { to { transform: scale(0.95); opacity: 0; } }\n@keyframes scaleUp { from { transform: scale(0.95); opacity: 0; } }"
                  }
        ],
        tips: [
                  "animation-timeline: view() replaces Intersection Observer for scroll-triggered animations — pure CSS, no JavaScript needed.",
                  "animation-range controls exactly when the scroll animation starts and ends — entry, cover, exit phases with percentages.",
                  "View Transitions API creates native page transition effects — crossfades, morphing, shared element animations.",
                  "view-transition-name creates shared element transitions — the browser morphs the element between old and new states."
        ],
        mistake: "Using JavaScript scroll event listeners for scroll-linked animations — they run on the main thread and cause jank. Use animation-timeline: scroll() which runs on the compositor thread at 60fps.",
        shorthand: {
          verbose: "animation-timeline: view();\nanimation: fade-in 0.5s;\nanimation-range: entry 0%, cover 100%;",
          concise: "animation: fade-in 0.5s linear;\nanimation-timeline: view();",
        },
      },
    ],
  },

  // ── Section 3: Motion Best Practices ─────────────────────────────────────────
  {
    id: "motion-practices",
    title: "Motion Best Practices",
    entries: [
      {
        id: "reduced-motion",
        fn: "Accessible Motion — prefers-reduced-motion & Performance",
        desc: "Respect user motion preferences, optimize animation performance, and follow motion design best practices.",
        category: "Accessibility",
        subtitle: "prefers-reduced-motion, will-change, compositing, GPU layers",
        signature: "@media (prefers-reduced-motion: reduce)  |  will-change: transform  |  contain: layout",
        descLong: "Accessible animation respects users who experience motion sickness or vestibular disorders. prefers-reduced-motion media query disables or reduces animations for these users. Performance-wise, only opacity and transform are composited (GPU-accelerated) — animating other properties triggers expensive layout/paint. will-change creates a new compositing layer but overuse wastes GPU memory. The contain property limits browser recalculation scope.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Accessible Motion — prefers-reduced-motion & Performance — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Respect reduced motion preference ────────────── */\n/* Approach 1: Remove animations entirely */\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n\n/* Approach 2: Reduce, don't remove (preferred) */\n@media (prefers-reduced-motion: reduce) {\n  .hero-animation {\n    /* Replace slide-in with simple fade */\n    animation: fadeIn 0.3s ease forwards;\n  }\n\n  .parallax-section {\n    /* Disable parallax, keep content visible */\n    transform: none !important;\n    animation: none;\n  }\n}\n\n/* Approach 3: Opt-in motion (progressive enhancement) */\n.card {\n  /* No animation by default */\n  opacity: 1;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Accessible Motion — prefers-reduced-motion & Performance — common patterns you'll see in production.\n// APPROACH  - Combine Accessible Motion — prefers-reduced-motion & Performance with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@media (prefers-reduced-motion: no-preference) {\n  .card {\n    /* Add animation only if user hasn't opted out */\n    animation: fadeSlideIn 0.5s ease forwards;\n  }\n}\n\n/* ── Performance: composited properties only ─────── */\n/* FAST (composited — GPU thread): */\n.fast {\n  transform: translateX(100px);  /* GPU-accelerated */\n  opacity: 0.5;                  /* GPU-accelerated */\n}\n\n/* SLOW (triggers layout/paint — main thread): */\n.slow {\n  left: 100px;      /* triggers layout */\n  width: 200px;     /* triggers layout */\n  height: 200px;    /* triggers layout */\n  margin-left: 10px; /* triggers layout */\n  padding: 20px;    /* triggers layout */\n  border-width: 2px; /* triggers layout */\n  font-size: 16px;  /* triggers layout */\n  background: red;  /* triggers paint (no layout) */\n  color: blue;      /* triggers paint (no layout) */\n  box-shadow: ...;  /* triggers paint (no layout) */\n}\n\n/* ── will-change — use sparingly ─────────────────── */\n/* Good: add before animation, remove after */\n.card:hover {\n  will-change: transform;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Accessible Motion — prefers-reduced-motion & Performance — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Bad: permanent will-change on many elements */\n/* .every-element { will-change: transform; }  ← wastes GPU memory */\n\n/* ── contain — limit recalculation scope ─────────── */\n.widget {\n  contain: layout style;\n  /* Changes inside don't affect outside layout */\n  /* Lets browser skip recalculating outer elements */\n}\n\n/* ── Animation duration guidelines ───────────────── */\n/* Micro-interactions: 100-200ms (button hover, toggle) */\n/* Entrances:          200-400ms (modals, cards appearing) */\n/* Exits:              150-300ms (faster than entrances) */\n/* Page transitions:   300-500ms (route changes) */\n/* Complex sequences:  500ms-1s  (onboarding, celebrations) */\n\n/* ── Easing guidelines ───────────────────────────── */\n/* Entering: ease-out (fast start, gentle landing) */\n/* Exiting:  ease-in (gentle start, fast exit) */\n/* Moving:   ease-in-out (smooth both ends) */\n/* UI feedback: ease or cubic-bezier(0.4, 0, 0.2, 1) */"
                  }
        ],
        tips: [
                  "prefers-reduced-motion: no-preference as opt-in (progressive enhancement) is better than reduce as opt-out — animations work only when welcome.",
                  "Only transform and opacity avoid layout/paint — everything else is expensive. Use transform: translateX() instead of left/margin.",
                  "Animation durations should feel instant for micro-interactions (100-200ms) and comfortable for entrances (200-400ms).",
                  "Exits should be faster than entrances — users want to see the new content, not watch the old content leave."
        ],
        mistake: "Ignoring prefers-reduced-motion — approximately 1 in 3 users have motion sensitivity settings enabled. Always provide a reduced-motion alternative for essential animations.",
        shorthand: {
          verbose: "// Manual / verbose approach\n@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}\n.animate { animation: slide-in 0.3s ease; }\n// More explicit but longer",
          concise: "@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}\n.animate { animation: slide-in 0.3s ease; }",
        },
      },
    ],
  },
]

export default { meta, sections }
