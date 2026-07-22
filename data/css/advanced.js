export const meta = {
  "id": "advanced",
  "label": "Advanced CSS",
  "icon": "🎨",
  "description": "Advanced CSS: animations deep-dive, logical properties, accessibility, print styles, filters, masks, and scroll-driven effects."
}

export const sections = [

  // ── Section 1: Advanced Animations & Motion ─────────────────────────────────────────
  {
    id: "animations-deep",
    title: "Advanced Animations & Motion",
    entries: [
      {
        id: "animation-techniques",
        fn: "Multi-Step Animations & Orchestration",
        desc: "Complex keyframe sequences, staggered entrances, animation states, and coordinated motion.",
        category: "Animation",
        subtitle: "keyframes, animation-fill-mode, steps(), animation-play-state",
        signature: "@keyframes name { 0% {} 50% {} 100% {} }  |  animation: name 1s ease 0.2s both",
        descLong: "Multi-step keyframes create complex motion paths. animation-fill-mode controls state before/after: forwards keeps the end state, backwards applies 0% immediately, both does both. steps() creates frame-by-frame animation (typewriter, sprite sheets). animation-play-state pauses/resumes. Orchestrate staggered animations with custom properties and nth-child delays.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Multi-Step Animations & Orchestration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Multi-step keyframe animation ───────────────── */\n@keyframes slide-up-fade {\n  0%   { opacity: 0; transform: translateY(30px) scale(0.95); }\n  60%  { opacity: 1; transform: translateY(-5px) scale(1.02); }\n  100% { opacity: 1; transform: translateY(0) scale(1); }\n}\n\n.card {\n  animation: slide-up-fade 0.6s ease-out both;\n}\n\n/* ── Staggered entrance with CSS custom properties ── */\n.list-item {\n  --delay: 0;\n  opacity: 0;\n  animation: fade-in 0.4s ease-out both;\n  animation-delay: calc(var(--delay) * 80ms);\n}\n.list-item:nth-child(1) { --delay: 0; }\n.list-item:nth-child(2) { --delay: 1; }\n.list-item:nth-child(3) { --delay: 2; }\n.list-item:nth-child(4) { --delay: 3; }\n\n/* Or use nth-child directly */\n.item { animation: fade-in 0.3s ease both; }\n.item:nth-child(1) { animation-delay: 0ms; }\n.item:nth-child(2) { animation-delay: 80ms; }\n.item:nth-child(3) { animation-delay: 160ms; }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Multi-Step Animations & Orchestration — common patterns you'll see in production.\n// APPROACH  - Combine Multi-Step Animations & Orchestration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── steps() — frame-by-frame animation ─────────── */\n/* Typewriter effect */\n.typewriter {\n  width: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  border-right: 2px solid;\n  animation:\n    typing 3s steps(30) forwards,\n    blink 0.7s step-end infinite;\n}\n@keyframes typing { to { width: 100%; } }\n@keyframes blink { 50% { border-color: transparent; } }\n\n/* Sprite sheet animation */\n.sprite {\n  width: 64px;\n  height: 64px;\n  background: url('spritesheet.png');\n  animation: walk 0.8s steps(8) infinite;\n}\n@keyframes walk { to { background-position: -512px 0; } }\n\n/* ── animation-fill-mode ────────────────────────── */\n.appear {\n  animation: fade-in 0.5s ease 0.3s;\n  animation-fill-mode: backwards; /* applies 0% state during delay */\n  animation-fill-mode: forwards;  /* keeps 100% state after end */\n  animation-fill-mode: both;      /* both — almost always what you want */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Multi-Step Animations & Orchestration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── animation-play-state — pause/resume ────────── */\n.spinner {\n  animation: rotate 1s linear infinite;\n}\n.spinner.paused {\n  animation-play-state: paused;\n}\n/* Toggle via JS: el.classList.toggle('paused') */\n\n/* ── Composing multiple animations ──────────────── */\n.fancy-entrance {\n  animation:\n    slide-in 0.5s ease-out both,\n    glow 2s ease-in-out 0.5s infinite alternate;\n}\n\n@keyframes rotate { to { transform: rotate(360deg); } }\n@keyframes glow {\n  from { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }\n  to   { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }\n}"
                  }
        ],
        tips: [
                  "animation-fill-mode: both is almost always correct — it applies start state during delay AND keeps end state after.",
                  "steps(N) is perfect for sprite sheets and typewriter effects — it jumps between frames instead of tweening.",
                  "Use CSS custom properties for stagger delays — calc(var(--i) * 80ms) is cleaner than N separate rules.",
                  "Combine multiple animations with comma separation — each can have different timing and delay."
        ],
        mistake: "Forgetting animation-fill-mode when using animation-delay — without it, the element shows its default state during the delay, then jumps to the animation start, creating a flash.",
        shorthand: {
          verbose: "animation-name: slide-in;\nanimation-duration: 0.4s;\nanimation-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);\nanimation-iteration-count: 1;\nanimation-fill-mode: forwards;",
          concise: "animation: slide-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;",
        },
      },
      {
        id: "view-transitions",
        fn: "View Transitions & Page Animations",
        desc: "Animate between page states and route changes with the View Transitions API — smooth SPA-like transitions.",
        category: "Animation",
        subtitle: "view-transition-name, ::view-transition-*, startViewTransition",
        signature: "view-transition-name: hero  |  ::view-transition-old(hero)  |  document.startViewTransition()",
        descLong: "The View Transitions API animates DOM changes — page navigations, element additions/removals, or any state change. Assign view-transition-name to elements that should animate between states. The browser automatically cross-fades old and new states. Customize with ::view-transition-old() and ::view-transition-new() pseudo-elements. Works for SPAs (document.startViewTransition) and MPAs (@view-transition rule).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of View Transitions & Page Animations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic view transition ───────────────────────── */\n/* Elements with the same view-transition-name animate between states */\n.page-title {\n  view-transition-name: title;\n}\n\n.hero-image {\n  view-transition-name: hero;\n}\n\n/* ── Customize the transition animation ─────────── */\n::view-transition-old(title) {\n  animation: fade-out 0.3s ease-out;\n}\n\n::view-transition-new(title) {\n  animation: fade-in 0.3s ease-in;\n}\n\n/* Slide transition for page content */\n::view-transition-old(root) {\n  animation: slide-out-left 0.3s ease;\n}\n::view-transition-new(root) {\n  animation: slide-in-right 0.3s ease;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of View Transitions & Page Animations — common patterns you'll see in production.\n// APPROACH  - Combine View Transitions & Page Animations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@keyframes slide-out-left {\n  to { transform: translateX(-100%); opacity: 0; }\n}\n@keyframes slide-in-right {\n  from { transform: translateX(100%); opacity: 0; }\n}\n\n/* ── Hero image morph between pages ─────────────── */\n/* Page 1: thumbnail */\n.thumbnail { view-transition-name: hero; width: 200px; }\n\n/* Page 2: full image */\n.full-image { view-transition-name: hero; width: 100%; }\n/* Browser automatically morphs size + position! */\n\n/* ── MPA (Multi-Page App) view transitions ──────── */\n@view-transition {\n  navigation: auto;  /* enable for all same-origin navigations */\n}\n\n/* ── Reduce motion — always respect preferences ─── */\n@media (prefers-reduced-motion: reduce) {\n  ::view-transition-group(*),\n  ::view-transition-old(*),\n  ::view-transition-new(*) {\n    animation-duration: 0.01ms !important;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of View Transitions & Page Animations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── JavaScript trigger (SPA) ───────────────────── */\n// document.startViewTransition(() => {\n//   // Update the DOM here\n//   updateContent(newPageHTML);\n// });"
                  }
        ],
        tips: [
                  "view-transition-name must be unique per page — two elements with the same name causes the transition to fail.",
                  "The browser handles position and size morphing automatically — just give both elements the same transition name.",
                  "@view-transition { navigation: auto } enables transitions for ALL page navigations in MPAs — zero JavaScript.",
                  "Always include prefers-reduced-motion fallback — view transitions are motion-heavy."
        ],
        mistake: "Assigning view-transition-name to elements inside scrollable containers — the snapshot captures the element relative to the viewport, not the scroll position, causing jumpy transitions.",
        shorthand: {
          verbose: ".old-page { view-transition-name: page-transition; }\n@media (prefers-reduced-motion: no-preference) {\n  ::view-transition-old(page-transition) { animation: fade-out 0.3s; }\n  ::view-transition-new(page-transition) { animation: fade-in 0.3s; }\n}",
          concise: "view-transition-name: root;\n@supports (view-transition-name: root) {\n  document.startViewTransition(() => /* DOM update */);\n}",
        },
      },
      {
        id: "scroll-animations",
        fn: "Scroll-Driven Animations — Timeline & Ranges",
        desc: "Tie animation progress to scroll position — reveal on scroll, parallax, progress bars, all without JavaScript.",
        category: "Animation",
        subtitle: "animation-timeline: scroll(), view(), animation-range",
        signature: "animation-timeline: scroll()  |  animation-timeline: view()  |  animation-range: entry exit",
        descLong: "Scroll-driven animations tie @keyframes progress to scroll position instead of time. scroll() tracks the scroll container progress (0% at top, 100% at bottom). view() tracks element visibility in the viewport. animation-range controls when the animation starts and ends: entry (entering viewport), exit (leaving), contain (fully visible). Replaces Intersection Observer and scroll listeners for most reveal/parallax effects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Scroll-Driven Animations — Timeline & Ranges — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Progress bar tied to page scroll ────────────── */\n.progress-bar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 4px;\n  background: dodgerblue;\n  transform-origin: left;\n  animation: grow-x linear;\n  animation-timeline: scroll();  /* tied to page scroll */\n}\n@keyframes grow-x {\n  from { transform: scaleX(0); }\n  to   { transform: scaleX(1); }\n}\n\n/* ── Reveal elements on scroll ──────────────────── */\n.reveal {\n  animation: reveal-up linear both;\n  animation-timeline: view();\n  animation-range: entry 0% entry 100%;\n}\n@keyframes reveal-up {\n  from { opacity: 0; transform: translateY(40px); }\n  to   { opacity: 1; transform: translateY(0); }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Scroll-Driven Animations — Timeline & Ranges — common patterns you'll see in production.\n// APPROACH  - Combine Scroll-Driven Animations — Timeline & Ranges with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Parallax effect ────────────────────────────── */\n.parallax-bg {\n  animation: parallax linear;\n  animation-timeline: scroll();\n}\n@keyframes parallax {\n  from { transform: translateY(-30%); }\n  to   { transform: translateY(30%); }\n}\n\n/* ── Fade out as element exits ──────────────────── */\n.fade-on-exit {\n  animation: fade-out linear both;\n  animation-timeline: view();\n  animation-range: exit 0% exit 100%;\n}\n@keyframes fade-out {\n  from { opacity: 1; }\n  to   { opacity: 0; transform: scale(0.9); }\n}\n\n/* ── Scale while in view ────────────────────────── */\n.scale-while-visible {\n  animation: scale-up linear both;\n  animation-timeline: view();\n  animation-range: contain 0% contain 100%;\n}\n@keyframes scale-up {\n  from { transform: scale(0.8); }\n  to   { transform: scale(1); }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Scroll-Driven Animations — Timeline & Ranges — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Horizontal scroll-linked animation ─────────── */\n.carousel-container {\n  overflow-x: scroll;\n}\n.carousel-indicator {\n  animation: grow-x linear;\n  animation-timeline: scroll(nearest inline);\n  /* inline = horizontal axis */\n}\n\n/* ── Combine multiple scroll ranges ─────────────── */\n.sticky-header {\n  animation: shrink-header linear both;\n  animation-timeline: scroll();\n  animation-range: 0px 200px;  /* animate over first 200px of scroll */\n}\n@keyframes shrink-header {\n  from { padding: 24px 0; font-size: 2rem; }\n  to   { padding: 8px 0; font-size: 1rem; }\n}"
                  }
        ],
        tips: [
                  "animation-timeline: view() replaces Intersection Observer for scroll reveals — pure CSS, no JavaScript.",
                  "animation-range: entry 0% entry 100% means \"animate while entering viewport\" — most common for reveals.",
                  "scroll(nearest inline) targets horizontal scroll — useful for carousels and horizontal scroll sections.",
                  "Scroll-driven animations are GPU-accelerated and run off the main thread — smoother than JS scroll listeners."
        ],
        mistake: "Using scroll event listeners in JS for scroll-linked animations — they run on the main thread and cause jank. Scroll-driven CSS animations run off-thread and are buttery smooth.",
        shorthand: {
          verbose: "@supports (animation-timeline: scroll()) {\n  @scroll-timeline sidebar-scroll {\n    source: selector(#sidebar);\n    orientation: vertical;\n  }\n  .sidebar { animation: scroll-indicator 1s linear; animation-timeline: sidebar-scroll; }\n}",
          concise: "animation: progress-bar 1s linear;\nanimation-timeline: view();",
        },
      },
    ],
  },

  // ── Section 2: Logical Properties & Modern Layout ─────────────────────────────────────────
  {
    id: "logical-props",
    title: "Logical Properties & Modern Layout",
    entries: [
      {
        id: "logical-properties",
        fn: "Logical Properties — Internationalization-Ready CSS",
        desc: "Replace physical directions (left/right) with logical ones (inline-start/end) — essential for RTL and vertical writing.",
        category: "Layout",
        subtitle: "margin-inline, padding-block, inset-inline, border-inline",
        signature: "margin-inline: auto  |  padding-block: 16px  |  inset-inline-start: 0",
        descLong: "Logical properties replace physical directions with flow-relative ones. inline = the text direction (horizontal in English, vertical in CJK vertical writing). block = perpendicular to text. inline-start = left in LTR, right in RTL. This means one stylesheet works for all writing directions. Modern CSS prefers logical properties: margin-inline, padding-block, inset-inline-start, border-block-end, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Logical Properties — Internationalization-Ready CSS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Physical → Logical mapping ──────────────────── */\n/* In horizontal LTR (English):\n   inline = horizontal  |  block = vertical\n   inline-start = left  |  inline-end = right\n   block-start = top    |  block-end = bottom */\n\n/* ── Margin ─────────────────────────────────────── */\nmargin-left: 16px;    →  margin-inline-start: 16px;\nmargin-right: 16px;   →  margin-inline-end: 16px;\nmargin-top: 16px;     →  margin-block-start: 16px;\nmargin-bottom: 16px;  →  margin-block-end: 16px;\n\n/* Shorthand */\nmargin: 0 auto;       →  margin-inline: auto;  /* center horizontally */\nmargin: 16px 0;       →  margin-block: 16px;   /* top + bottom */\n\n/* ── Padding ────────────────────────────────────── */\npadding: 16px 24px;   →  padding-block: 16px; padding-inline: 24px;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Logical Properties — Internationalization-Ready CSS — common patterns you'll see in production.\n// APPROACH  - Combine Logical Properties — Internationalization-Ready CSS with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Sizing ─────────────────────────────────────── */\nwidth: 100%;          →  inline-size: 100%;\nheight: 100vh;        →  block-size: 100vh;\nmax-width: 1200px;    →  max-inline-size: 1200px;\nmin-height: 100vh;    →  min-block-size: 100vh;\n\n/* ── Inset (positioning) ────────────────────────── */\nleft: 0;              →  inset-inline-start: 0;\nright: 0;             →  inset-inline-end: 0;\ntop: 0;               →  inset-block-start: 0;\n\n/* ── Border ─────────────────────────────────────── */\nborder-left: 3px solid blue;  →  border-inline-start: 3px solid blue;\nborder-bottom: 1px solid #ddd; → border-block-end: 1px solid #ddd;\nborder-radius: 8px 0 0 8px;  →  border-start-start-radius: 8px;\n                                  border-end-start-radius: 8px;\n\n/* ── Practical example — sidebar layout ─────────── */\n.sidebar {\n  position: sticky;\n  inset-block-start: 80px;      /* top in LTR/RTL */\n  padding-inline-end: 24px;     /* right in LTR, left in RTL */\n  border-inline-end: 1px solid #ddd;\n  inline-size: 250px;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Logical Properties — Internationalization-Ready CSS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Text alignment ─────────────────────────────── */\ntext-align: left;     →  text-align: start;\ntext-align: right;    →  text-align: end;\n\n/* ── Overflow ───────────────────────────────────── */\noverflow-x: auto;     →  overflow-inline: auto;\noverflow-y: hidden;   →  overflow-block: hidden;"
                  }
        ],
        tips: [
                  "margin-inline: auto centers in any writing direction — it's the modern replacement for margin: 0 auto.",
                  "Start using logical properties now — they work in all browsers and make RTL support automatic.",
                  "inline-size/block-size replace width/height — but width/height still work, so migrate gradually.",
                  "text-align: start/end is already logical — it flips automatically in RTL without any extra code."
        ],
        mistake: "Using left/right for layout in apps that may need RTL support — you'd need to duplicate every rule with [dir=\"rtl\"]. Logical properties handle both directions with a single rule.",
        shorthand: {
          verbose: "margin-top: 1rem;\nmargin-right: 2rem;\nmargin-bottom: 1rem;\nmargin-left: 2rem;\npadding-left: 1rem;\ntext-align: left;",
          concise: "margin-block: 1rem;\nmargin-inline: 2rem;\npadding-inline-start: 1rem;\ntext-align: start;",
        },
      },
      {
        id: "filters-masks",
        fn: "Filters, Backdrop-Filter, Masks & Clip-Path",
        desc: "Visual effects: blur, grayscale, backdrop blur, CSS masks, and shape clipping for creative layouts.",
        category: "Effects",
        subtitle: "filter, backdrop-filter, mask, clip-path",
        signature: "filter: blur(4px)  |  backdrop-filter: blur(10px)  |  clip-path: polygon(...)",
        descLong: "CSS visual effects create depth and polish. filter applies effects to an element (blur, brightness, grayscale, drop-shadow). backdrop-filter applies effects to the area BEHIND an element (frosted glass). clip-path clips an element to a shape (circle, polygon, path). mask uses images or gradients to create complex transparency. mix-blend-mode composites elements like Photoshop layers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Filters, Backdrop-Filter, Masks & Clip-Path — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── filter — apply to element ───────────────────── */\n.grayscale    { filter: grayscale(100%); }\n.blur         { filter: blur(4px); }\n.bright       { filter: brightness(1.2); }\n.dim          { filter: brightness(0.7); }\n.contrast     { filter: contrast(1.5); }\n.saturate     { filter: saturate(2); }\n.sepia        { filter: sepia(80%); }\n.invert       { filter: invert(100%); }\n\n/* Combine multiple filters */\n.vintage {\n  filter: sepia(40%) contrast(1.1) brightness(0.9) saturate(1.2);\n}\n\n/* drop-shadow — follows element shape (unlike box-shadow) */\n.icon { filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.3)); }\n/* Works on transparent PNGs and SVGs! */\n\n/* Hover effect: color to grayscale */\n.card img { filter: grayscale(0%); transition: filter 0.3s; }\n.card:hover img { filter: grayscale(100%); }\n\n/* ── backdrop-filter — frosted glass ────────────── */\n.glass-card {\n  background: rgba(255, 255, 255, 0.15);\n  backdrop-filter: blur(12px) saturate(1.5);\n  -webkit-backdrop-filter: blur(12px) saturate(1.5);\n  border: 1px solid rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Filters, Backdrop-Filter, Masks & Clip-Path — common patterns you'll see in production.\n// APPROACH  - Combine Filters, Backdrop-Filter, Masks & Clip-Path with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.modal-overlay {\n  background: rgba(0, 0, 0, 0.3);\n  backdrop-filter: blur(8px);\n}\n\n/* ── clip-path — shape clipping ─────────────────── */\n.circle   { clip-path: circle(50%); }\n.diamond  { clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }\n.triangle { clip-path: polygon(50% 0, 100% 100%, 0 100%); }\n\n/* Angled section divider */\n.hero {\n  clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);\n}\n\n/* Animated clip-path */\n.reveal {\n  clip-path: inset(0 100% 0 0);\n  transition: clip-path 0.6s ease;\n}\n.reveal.visible {\n  clip-path: inset(0 0 0 0);\n}\n\n/* ── mask — gradient transparency ───────────────── */\n.fade-edge {\n  mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);\n  -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Filters, Backdrop-Filter, Masks & Clip-Path — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Text with gradient mask */\n.gradient-text {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n  background-clip: text;\n}\n\n/* ── mix-blend-mode — Photoshop-like compositing ── */\n.overlay-text {\n  mix-blend-mode: multiply;    /* darken */\n  mix-blend-mode: screen;      /* lighten */\n  mix-blend-mode: overlay;     /* contrast */\n  mix-blend-mode: difference;  /* invert colors where overlapping */\n}"
                  }
        ],
        tips: [
                  "drop-shadow follows the shape of transparent images — box-shadow always makes a rectangle.",
                  "backdrop-filter: blur() creates frosted glass — add -webkit- prefix for Safari support.",
                  "clip-path: polygon() can create any shape — use a visual clip-path generator tool to design paths.",
                  "mask-image with linear-gradient creates smooth fade-out edges — no image editing needed."
        ],
        mistake: "Using box-shadow on transparent PNGs/SVGs — it shadows the bounding box, not the shape. Use filter: drop-shadow() which follows the actual visible pixels.",
        shorthand: {
          verbose: "margin-top: 1rem;\nmargin-right: 2rem;\nmargin-bottom: 1rem;\nmargin-left: 2rem;\npadding-left: 1rem;\ntext-align: left;",
          concise: "margin-block: 1rem;\nmargin-inline: 2rem;\npadding-inline-start: 1rem;\ntext-align: start;",
        },
      },
    ],
  },

  // ── Section 3: Accessibility & Print ─────────────────────────────────────────
  {
    id: "accessibility",
    title: "Accessibility & Print",
    entries: [
      {
        id: "a11y-css",
        fn: "CSS Accessibility — Focus, Screen Readers & Reduced Motion",
        desc: "Make sites usable for everyone — visible focus indicators, screen reader utilities, color contrast, and motion preferences.",
        category: "Accessibility",
        subtitle: ":focus-visible, prefers-reduced-motion, prefers-contrast, sr-only",
        signature: ":focus-visible { outline: 2px solid }  |  @media (prefers-reduced-motion: reduce)",
        descLong: "Accessible CSS ensures all users can perceive and interact with content. Focus indicators must be visible for keyboard navigation (:focus-visible shows outlines only for keyboard). Screen reader text (.sr-only) provides context without visual display. prefers-reduced-motion and prefers-contrast respect user system preferences. Color contrast must meet WCAG guidelines (4.5:1 for normal text). prefers-color-scheme adapts to dark mode. Never use color alone to convey information.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Accessibility — Focus, Screen Readers & Reduced Motion — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Focus indicators ───────────────────────────── */\n/* :focus-visible — keyboard focus only (not mouse clicks) */\n:focus-visible {\n  outline: 2px solid dodgerblue;\n  outline-offset: 2px;\n}\n\n/* Custom focus styles per element */\nbutton:focus-visible {\n  outline: 2px solid var(--color-primary);\n  outline-offset: 2px;\n  border-radius: 4px;\n}\n\na:focus-visible {\n  outline: 2px solid currentColor;\n  outline-offset: 4px;\n  text-decoration: none;\n}\n\n/* NEVER do this: */\n/* *:focus { outline: none; } ← makes site inaccessible! */\n\n/* ── Screen reader only text ────────────────────── */\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Accessibility — Focus, Screen Readers & Reduced Motion — common patterns you'll see in production.\n// APPROACH  - Combine CSS Accessibility — Focus, Screen Readers & Reduced Motion with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Skip to main content link */\n.skip-link {\n  position: absolute;\n  top: -100%;\n  left: 50%;\n  transform: translateX(-50%);\n  padding: 8px 16px;\n  background: var(--color-primary);\n  color: white;\n  z-index: 9999;\n}\n.skip-link:focus {\n  top: 8px;  /* appears when focused via Tab */\n}\n\n/* ── Reduced motion ─────────────────────────────── */\n@media (prefers-reduced-motion: reduce) {\n  *,\n  *::before,\n  *::after {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n\n/* Or: provide reduced alternative */\n@media (prefers-reduced-motion: no-preference) {\n  .animate { animation: slide-in 0.5s ease; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Accessibility — Focus, Screen Readers & Reduced Motion — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── High contrast mode ─────────────────────────── */\n@media (prefers-contrast: more) {\n  :root {\n    --color-text: #000;\n    --color-bg: #fff;\n    --border-color: #000;\n  }\n  button {\n    border: 2px solid #000;\n  }\n}\n\n/* ── Forced colors (Windows High Contrast) ──────── */\n@media (forced-colors: active) {\n  .card {\n    border: 1px solid CanvasText;  /* system color keywords */\n  }\n  .icon { forced-color-adjust: none; } /* opt out for decorative */\n}\n\n/* ── Touch targets ──────────────────────────────── */\nbutton, a, input, select {\n  min-height: 44px;   /* WCAG minimum touch target */\n  min-width: 44px;\n}"
                  }
        ],
        tips: [
                  ":focus-visible is the correct modern approach — visible outlines for keyboard, hidden for mouse clicks.",
                  ".sr-only is essential for icon-only buttons — screen readers need text labels even if sighted users see an icon.",
                  "Always test with prefers-reduced-motion: reduce — some users have vestibular disorders triggered by animation.",
                  "44px minimum touch target is a WCAG requirement — small buttons and links are unusable on mobile."
        ],
        mistake: "Removing all focus outlines for aesthetics (*:focus { outline: none }) — keyboard users can't see where they are on the page. Use :focus-visible to show outlines only for keyboard navigation.",
        shorthand: {
          verbose: "@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; transition: none !important; }\n}\nbutton { color: red; }\ninput::placeholder { color: gray; }",
          concise: "@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; }\n}\nbutton { color: red; }\ninput::placeholder { color: gray; }",
        },
      },
      {
        id: "print-styles",
        fn: "Print Styles & @page Rules",
        desc: "Optimize pages for printing — hide nav, expand URLs, control page breaks, and set paper margins.",
        category: "Print",
        subtitle: "@media print, @page, break-before, break-inside",
        signature: "@media print { }  |  @page { margin: 2cm }  |  break-inside: avoid",
        descLong: "@media print targets printed output and PDF generation. Common tasks: hide navigation/ads, expand URLs after links, control page breaks (break-before, break-after, break-inside), set page margins with @page. Use pt/cm for print (not px/rem). Show link URLs with ::after content. Avoid backgrounds printing by default (users must enable). Print styles make articles, invoices, and reports look professional when printed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Print Styles & @page Rules — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Print stylesheet ───────────────────────────── */\n@media print {\n  /* Hide non-essential elements */\n  nav, .sidebar, .ads, .footer,\n  .no-print, button, .cookie-banner {\n    display: none !important;\n  }\n\n  /* Full width content */\n  body {\n    font-size: 12pt;\n    line-height: 1.5;\n    color: #000;\n    background: #fff;\n  }\n\n  .container {\n    max-width: 100%;\n    margin: 0;\n    padding: 0;\n  }\n\n  /* Show link URLs */\n  a[href]::after {\n    content: \" (\" attr(href) \")\";\n    font-size: 0.8em;\n    color: #666;\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Print Styles & @page Rules — common patterns you'll see in production.\n// APPROACH  - Combine Print Styles & @page Rules with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Don't show URLs for anchors or JS links */\n  a[href^=\"#\"]::after,\n  a[href^=\"javascript:\"]::after {\n    content: \"\";\n  }\n\n  /* ── Page break control ───────────────────────── */\n  h1, h2, h3 {\n    break-after: avoid;       /* don't break right after headings */\n  }\n\n  table, figure, .card {\n    break-inside: avoid;      /* don't split across pages */\n  }\n\n  .chapter {\n    break-before: page;       /* start on new page */\n  }\n\n  /* Keep at least 3 lines before/after a break */\n  p {\n    orphans: 3;    /* min lines at bottom of page */\n    widows: 3;     /* min lines at top of next page */\n  }\n\n  /* ── Page margins ─────────────────────────────── */\n  @page {\n    margin: 2cm;\n    size: A4;              /* or: letter, A3, etc. */\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Print Styles & @page Rules — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@page :first {\n    margin-top: 4cm;       /* extra top margin on first page */\n  }\n\n  /* ── Images ───────────────────────────────────── */\n  img {\n    max-width: 100% !important;\n    break-inside: avoid;\n  }\n\n  /* Force background printing for important elements */\n  .badge {\n    -webkit-print-color-adjust: exact;\n    print-color-adjust: exact;\n  }\n}"
                  }
        ],
        tips: [
                  "break-inside: avoid on cards, tables, and figures prevents awkward splits across pages.",
                  "Show link URLs with a::after { content: \" (\" attr(href) \")\"; } — essential for printed articles.",
                  "orphans and widows prevent single lines stranded at page breaks — set both to 3 for clean breaks.",
                  "print-color-adjust: exact forces background colors/images to print — browsers hide them by default."
        ],
        mistake: "Not testing print output — use browser DevTools (Rendering > Emulate CSS media type > print) to preview without wasting paper. Many sites look terrible printed.",
        shorthand: {
          verbose: "filter: brightness(1.1);\nfilter: contrast(1.2);\nfilter: hue-rotate(45deg);\nfilter: blur(2px);",
          concise: "filter: brightness(1.1) contrast(1.2) hue-rotate(45deg) blur(2px);",
        },
      },
    ],
  },

  // ── Section 4: Modern Techniques ─────────────────────────────────────────
  {
    id: "modern-techniques",
    title: "Modern Techniques",
    entries: [
      {
        id: "container-style-queries",
        fn: "Container Style Queries & @property",
        desc: "Query container styles (not just size), and define typed custom properties with @property for animation.",
        category: "Modern CSS",
        subtitle: "@container style(), @property, typed custom properties",
        signature: "@container style(--theme: dark) { }  |  @property --color { syntax: \"<color>\"; }",
        descLong: "Container style queries check the value of custom properties on a container — style components based on a parent's theme, state, or variant. @property registers custom properties with syntax, initial value, and inheritance — enabling animation of custom properties (normally impossible). With @property, you can animate gradients, colors, and any typed CSS value through custom properties.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Container Style Queries & @property — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Container style queries ─────────────────────── */\n.card-wrapper {\n  container-type: inline-size;\n  --variant: default;\n}\n\n.card-wrapper.featured { --variant: featured; }\n.card-wrapper.compact  { --variant: compact; }\n\n/* Style based on parent's custom property */\n@container style(--variant: featured) {\n  .card {\n    border: 2px solid gold;\n    background: linear-gradient(135deg, #fff9e6, #fff);\n  }\n  .card .title { color: #b8860b; }\n}\n\n@container style(--variant: compact) {\n  .card { padding: 8px; font-size: 0.875rem; }\n  .card .image { display: none; }\n}\n\n/* ── @property — typed custom properties ────────── */\n/* Register a custom property with type information */\n@property --gradient-angle {\n  syntax: \"<angle>\";\n  initial-value: 0deg;\n  inherits: false;\n}\n\n@property --color-start {\n  syntax: \"<color>\";\n  initial-value: #667eea;\n  inherits: false;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Container Style Queries & @property — common patterns you'll see in production.\n// APPROACH  - Combine Container Style Queries & @property with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@property --color-end {\n  syntax: \"<color>\";\n  initial-value: #764ba2;\n  inherits: false;\n}\n\n/* Now you can ANIMATE custom properties! */\n.gradient-bg {\n  --gradient-angle: 0deg;\n  background: linear-gradient(var(--gradient-angle), var(--color-start), var(--color-end));\n  transition: --gradient-angle 0.6s ease, --color-start 0.6s ease;\n}\n\n.gradient-bg:hover {\n  --gradient-angle: 180deg;\n  --color-start: #f093fb;\n}\n\n/* ── Animated gradient border ───────────────────── */\n@property --border-angle {\n  syntax: \"<angle>\";\n  initial-value: 0deg;\n  inherits: false;\n}\n\n.rainbow-border {\n  --border-angle: 0deg;\n  border: 2px solid transparent;\n  background:\n    linear-gradient(white, white) padding-box,\n    conic-gradient(from var(--border-angle), red, yellow, lime, aqua, blue, magenta, red) border-box;\n  animation: spin-border 3s linear infinite;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Container Style Queries & @property — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@keyframes spin-border {\n  to { --border-angle: 360deg; }\n}\n\n/* ── @property for percentage animation ─────────── */\n@property --progress {\n  syntax: \"<number>\";\n  initial-value: 0;\n  inherits: false;\n}\n\n.progress-ring {\n  --progress: 0;\n  background: conic-gradient(\n    dodgerblue calc(var(--progress) * 1%),\n    #eee calc(var(--progress) * 1%)\n  );\n  transition: --progress 1s ease;\n}\n.progress-ring.loaded { --progress: 75; }"
                  }
        ],
        tips: [
                  "@property makes gradient animations possible — without it, CSS can't interpolate custom property values.",
                  "Container style queries let you theme nested components via parent custom properties — no class toggling needed.",
                  "syntax: \"<color>\" enables color transitions on custom properties — smooth theme switches.",
                  "Use @property sparingly — it's powerful but adds complexity. Only use when you need to animate custom properties."
        ],
        mistake: "Trying to animate custom properties without @property — CSS treats unregistered custom properties as strings and can't interpolate them. @property tells the browser the type so it can animate.",
        shorthand: {
          verbose: ".card {\n  @container (min-width: 400px) {\n    grid-template-columns: 1fr 1fr;\n  }\n  @container style(--is-dark: true) {\n    background: #222;\n  }\n}",
          concise: "@container (width > 400px) and style(--theme: dark) {\n  .card { background: #222; }\n}",
        },
      },
      {
        id: "layers-scope",
        fn: "@layer, @scope & CSS Modules Patterns",
        desc: "Manage CSS architecture at scale — cascade layers for specificity control, @scope for style boundaries.",
        category: "Architecture",
        subtitle: "@layer, @scope, cascade layers, style encapsulation",
        signature: "@layer base, components, utilities  |  @scope (.card) to (.card-body) { }",
        descLong: "@layer (Cascade Layers) explicitly orders groups of styles — utilities always beat components, regardless of specificity. @scope limits styles to a DOM subtree, with optional lower boundary. Together they solve the two biggest CSS-at-scale problems: specificity wars and style leakage. Layers replace BEM naming conventions and !important hacks. Scope replaces Shadow DOM for most encapsulation needs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @layer, @scope & CSS Modules Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Cascade Layers — control specificity order ──── */\n/* Declare layer order FIRST */\n@layer reset, base, components, utilities;\n\n/* Styles in later layers always win, regardless of specificity */\n\n@layer reset {\n  *, *::before, *::after {\n    box-sizing: border-box;\n    margin: 0;\n    padding: 0;\n  }\n}\n\n@layer base {\n  body { font-family: system-ui; line-height: 1.6; }\n  h1, h2, h3 { line-height: 1.2; }\n  a { color: var(--color-primary); }\n}\n\n@layer components {\n  .btn {\n    display: inline-flex;\n    padding: 8px 16px;\n    border-radius: 6px;\n    font-weight: 500;\n  }\n  .card {\n    border: 1px solid var(--border-color);\n    border-radius: 8px;\n    padding: 16px;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @layer, @scope & CSS Modules Patterns — common patterns you'll see in production.\n// APPROACH  - Combine @layer, @scope & CSS Modules Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@layer utilities {\n  .text-center { text-align: center; }\n  .hidden { display: none; }\n  .mt-4 { margin-top: 16px; }\n  .flex { display: flex; }\n}\n/* .hidden { display: none } beats .card { display: grid }\n   because utilities layer is declared after components */\n\n/* ── Import third-party CSS into a layer ────────── */\n@import url(\"normalize.css\") layer(reset);\n@import url(\"component-lib.css\") layer(components);\n/* Your utilities always override the library! */\n\n/* ── @scope — style boundaries ──────────────────── */\n@scope (.card) {\n  /* These styles ONLY apply inside .card */\n  h2 { font-size: 1.25rem; }\n  p { color: var(--muted); }\n  a { text-decoration: none; }\n}\n\n/* With lower boundary — styles stop at .card-body */\n@scope (.card) to (.card-body) {\n  /* Only applies to card header area, not body */\n  * { font-weight: 600; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @layer, @scope & CSS Modules Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Combining layers + scope ───────────────────── */\n@layer components {\n  @scope (.alert) {\n    :scope { /* the .alert element itself */\n      padding: 12px 16px;\n      border-radius: 8px;\n      border-left: 4px solid;\n    }\n    .title { font-weight: 600; }\n    .message { opacity: 0.9; }\n  }\n}"
                  }
        ],
        tips: [
                  "Layer order determines winner, not specificity — a class in utilities beats an ID in components.",
                  "@import with layer() is how you tame third-party CSS — put it in a low-priority layer so your styles always win.",
                  "@scope replaces BEM naming and deep nesting — h2 inside @scope(.card) won't leak to other h2 elements.",
                  ":scope inside @scope refers to the scoping element itself — like & in Sass."
        ],
        mistake: "Using !important to override third-party CSS — it starts a specificity arms race. Use @import layer(vendor) to put their styles in a low-priority layer instead.",
        shorthand: {
          verbose: "@layer reset, base, components, utilities;\n@layer reset { * { margin: 0; } }\n@layer base { body { font-size: 16px; } }\n@layer components { .btn { padding: 8px; } }\n@layer utilities { .hidden { display: none; } }",
          concise: "@layer reset { * { margin: 0; } }\n@layer components { .btn { padding: 8px; } }\n@layer {\n  .local { color: blue; }\n}",
        },
      },
      {
        id: "performance",
        fn: "CSS Performance — contain, content-visibility, will-change",
        desc: "Optimize rendering performance — layout containment, lazy rendering, and GPU acceleration hints.",
        category: "Performance",
        subtitle: "contain, content-visibility, will-change, font-display",
        signature: "contain: layout  |  content-visibility: auto  |  will-change: transform",
        descLong: "CSS performance optimizations reduce layout thrashing and rendering cost. contain: layout tells the browser an element's internals don't affect the rest of the page. content-visibility: auto skips rendering for off-screen elements (like virtual scrolling). will-change hints the browser to prepare GPU layers. font-display: swap prevents invisible text during font loading. These are low-effort, high-impact optimizations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Performance — contain, content-visibility, will-change — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── contain — layout isolation ──────────────────── */\n.card {\n  contain: layout;\n  /* Changes inside .card don't trigger layout\n     recalculation of the rest of the page */\n}\n\n.sidebar {\n  contain: layout style paint;\n  /* layout: isolated layout\n     style: counters/quotes don't escape\n     paint: don't paint outside bounds */\n}\n\n/* ── content-visibility — lazy rendering ────────── */\n.article-section {\n  content-visibility: auto;\n  contain-intrinsic-size: auto 500px;\n  /* Browser skips rendering off-screen sections\n     contain-intrinsic-size gives an estimated height\n     so scrollbar doesn't jump */\n}\n\n/* Great for long pages, lists, feeds */\n.feed-item {\n  content-visibility: auto;\n  contain-intrinsic-size: auto 200px;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Performance — contain, content-visibility, will-change — common patterns you'll see in production.\n// APPROACH  - Combine CSS Performance — contain, content-visibility, will-change with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── will-change — GPU layer hint ───────────────── */\n.animated-card {\n  will-change: transform;\n  /* Tells browser to prepare a GPU layer BEFORE animation starts */\n  transition: transform 0.3s ease;\n}\n.animated-card:hover {\n  transform: translateY(-4px);\n}\n\n/* IMPORTANT: Remove will-change when not needed */\n/* Don't: will-change on every element (wastes GPU memory) */\n/* Do: add will-change right before animation, remove after */\n\n/* ── Font loading optimization ──────────────────── */\n@font-face {\n  font-family: \"Inter\";\n  src: url(\"/fonts/inter.woff2\") format(\"woff2\");\n  font-display: swap;  /* show fallback immediately, swap when loaded */\n  /* optional: font loads only if network is fast enough */\n  /* block: invisible text for 3s (bad!) */\n}\n\n/* Preload critical fonts in HTML:\n   <link rel=\"preload\" href=\"/fonts/inter.woff2\" as=\"font\" type=\"font/woff2\" crossorigin> */\n\n/* ── Avoid layout thrashing ─────────────────────── */\n/* Use transform instead of top/left for animation */\n.good { transform: translateX(100px); }  /* compositing only */\n.bad  { left: 100px; }                   /* triggers layout! */"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Performance — contain, content-visibility, will-change — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Use opacity + transform for all animations */\n/* These ONLY trigger compositing (fastest): */\n.animate {\n  transform: translateY(-4px) scale(1.02);\n  opacity: 0.9;\n  /* GPU-accelerated, no layout or paint! */\n}\n\n/* ── Reducing paint ─────────────────────────────── */\n/* Avoid expensive properties in animations: */\n/* EXPENSIVE: box-shadow, border-radius, filter (during animation) */\n/* CHEAP: transform, opacity */\n\n/* Instead of animating box-shadow: */\n.card::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  box-shadow: 0 12px 24px rgba(0,0,0,0.2);\n  opacity: 0;\n  transition: opacity 0.3s;\n}\n.card:hover::after { opacity: 1; }\n/* Animate OPACITY of the shadow, not the shadow itself */"
                  }
        ],
        tips: [
                  "content-visibility: auto can improve initial page load by 50%+ on long pages — off-screen content isn't rendered.",
                  "Only animate transform and opacity — every other property triggers expensive layout/paint recalculation.",
                  "will-change is a last resort — overuse wastes GPU memory. Only apply to elements about to animate.",
                  "contain-intrinsic-size prevents layout shift when content-visibility skips rendering — always include it."
        ],
        mistake: "Adding will-change: transform to every element — each one creates a GPU layer, consuming video memory. Use it only on elements about to animate, and remove it when the animation completes.",
        shorthand: {
          verbose: "transform: translateX(100px);\ntransform: scale(1.1);\ntransform: rotate(45deg);\nwill-change: transform;\ncontain: layout;",
          concise: "transform: translateX(100px) scale(1.1) rotate(45deg);\nwill-change: transform;\ncontain: layout;",
        },
      },
    ],
  },
]

export default { meta, sections }
