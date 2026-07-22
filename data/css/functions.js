export const meta = {
  "id": "functions",
  "label": "CSS Functions & Modern Features",
  "icon": "🔧",
  "description": "Modern CSS functions (calc, clamp, min, max, color-mix), native nesting, scroll-snap, custom properties as design tokens, and scoped styles."
}

export const sections = [

  // ── Section 1: CSS Functions & Calculations ─────────────────────────────────────────
  {
    id: "css-functions",
    title: "CSS Functions & Calculations",
    entries: [
      {
        id: "calc-clamp-minmax",
        fn: "calc(), clamp(), min(), max() — Dynamic Values",
        desc: "Compute values dynamically: calc for arithmetic, clamp for responsive ranges, min/max for constraint-based sizing.",
        category: "Functions",
        subtitle: "calc(), clamp(), min(), max(), nested calc, mixed units",
        signature: "calc(100% - 2rem)  |  clamp(1rem, 2.5vw, 2rem)  |  min(50vw, 600px)  |  max(300px, 30%)",
        descLong: "CSS math functions compute values at render time, mixing units freely. calc() does arithmetic with +, -, *, /. clamp(min, preferred, max) constrains a value between bounds — the foundation of fluid typography. min() picks the smallest value; max() picks the largest. These functions nest inside each other and work in any property that accepts a length, percentage, angle, or number. They eliminate most media query breakpoints for sizing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of calc(), clamp(), min(), max() — Dynamic Values — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── calc() — arithmetic with mixed units ─────────── */\n.sidebar {\n  width: calc(100% - 300px);         /* subtract fixed from fluid */\n  padding: calc(1rem + 0.5vw);       /* responsive padding */\n  margin-top: calc(var(--header-h) + 1rem);  /* use custom props */\n}\n\n/* Nested calc (outer calc optional in modern browsers) */\n.grid-item {\n  width: calc((100% - (3 * 1rem)) / 4);  /* 4-column with gaps */\n}\n\n/* ── clamp() — responsive with min/max bounds ──────── */\n/* clamp(minimum, preferred, maximum) */\nh1 {\n  /* Fluid type: 1.5rem at small screens, scales with vw, caps at 3rem */\n  font-size: clamp(1.5rem, 4vw + 0.5rem, 3rem);\n}\n\n.container {\n  width: clamp(320px, 90%, 1200px);   /* responsive container */\n  padding: clamp(1rem, 3vw, 3rem);    /* responsive padding */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of calc(), clamp(), min(), max() — Dynamic Values — common patterns you'll see in production.\n// APPROACH  - Combine calc(), clamp(), min(), max() — Dynamic Values with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.card {\n  /* Fluid gap that never gets too small or too large */\n  gap: clamp(0.5rem, 2vw, 2rem);\n}\n\n/* ── min() — pick the smaller value ──────────────── */\n.hero {\n  height: min(100vh, 800px);         /* full viewport but capped */\n  width: min(90%, 1200px);           /* responsive with max-width */\n  padding: min(5vw, 4rem);           /* responsive but bounded */\n}\n\n/* min() replaces media queries for max-width: */\n.content {\n  width: min(100% - 2rem, 65ch);     /* readable line length */\n}\n\n/* ── max() — pick the larger value ──────────────── */\n.sidebar {\n  width: max(250px, 25%);            /* at least 250px */\n  font-size: max(16px, 1rem);        /* accessibility minimum */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of calc(), clamp(), min(), max() — Dynamic Values — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Combining functions ─────────────────────────── */\n.layout {\n  /* Sidebar that's 300px or 25%, whichever is larger, \n     but never more than 400px */\n  --sidebar: clamp(250px, 25%, 400px);\n  grid-template-columns: var(--sidebar) 1fr;\n  gap: max(1rem, 2vw);\n}\n\n/* Fluid type scale using clamp */\n:root {\n  --text-xs:  clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);\n  --text-sm:  clamp(0.875rem, 0.8rem + 0.35vw, 1rem);\n  --text-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);\n  --text-lg:  clamp(1.125rem, 1rem + 0.6vw, 1.25rem);\n  --text-xl:  clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);\n  --text-2xl: clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem);\n  --text-3xl: clamp(1.875rem, 1.5rem + 2vw, 3rem);\n}"
                  }
        ],
        tips: [
                  "clamp(min, preferred, max) replaces most responsive font-size media queries — one line instead of multiple breakpoints.",
                  "min(100% - 2rem, 65ch) is the modern pattern for readable line length — no max-width or media queries needed.",
                  "calc() requires spaces around + and - operators: calc(100%-2rem) fails silently but calc(100% - 2rem) works.",
                  "These functions work in any numeric property: font-size, width, padding, gap, grid-template-columns, border-radius, etc."
        ],
        mistake: "Using media queries for responsive sizing that clamp() handles better — clamp(1rem, 2.5vw + 0.5rem, 2rem) is a single fluid line that replaces 3+ media query breakpoints for font-size.",
        shorthand: {
          verbose: "width: 100%;\nmax-width: 1200px;\nmin-width: 320px;",
          concise: "width: clamp(320px, 100%, 1200px);",
        },
      },
      {
        id: "color-functions",
        fn: "color-mix(), oklch() & Modern Color Functions",
        desc: "Modern CSS color: color-mix for blending, oklch for perceptual uniformity, relative colors, and dynamic theming.",
        category: "Color",
        subtitle: "color-mix(), oklch(), relative color syntax, light-dark(), contrast-color()",
        signature: "color-mix(in oklch, color1 50%, color2)  |  oklch(70% 0.15 250)  |  light-dark()",
        descLong: "Modern CSS color functions go far beyond hex and rgb. color-mix() blends two colors in any color space — ideal for hover states, tints, and shades without preprocessors. oklch() provides perceptually uniform colors (same lightness looks equally bright across hues). Relative color syntax modifies individual channels. light-dark() picks a color based on color-scheme. These replace Sass color functions with native CSS that respects user preferences and works with custom properties.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of color-mix(), oklch() & Modern Color Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── color-mix() — blend colors natively ──────────── */\n.button {\n  background: var(--brand);\n}\n.button:hover {\n  /* 20% black mixed in = darken effect */\n  background: color-mix(in oklch, var(--brand) 80%, black);\n}\n.button:active {\n  background: color-mix(in oklch, var(--brand) 70%, black);\n}\n\n/* Tint (lighten): mix with white */\n.badge {\n  background: color-mix(in oklch, var(--brand) 20%, white);\n  color: var(--brand);\n}\n\n/* Semi-transparent overlay */\n.overlay {\n  background: color-mix(in srgb, var(--brand) 50%, transparent);\n}\n\n/* ── oklch() — perceptually uniform color ──────────── */\n/* oklch(lightness chroma hue) */\n:root {\n  --brand-50:  oklch(95% 0.05 250);   /* very light */\n  --brand-100: oklch(90% 0.08 250);\n  --brand-200: oklch(80% 0.12 250);\n  --brand-500: oklch(55% 0.20 250);   /* base brand */\n  --brand-700: oklch(40% 0.18 250);\n  --brand-900: oklch(25% 0.12 250);   /* very dark */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of color-mix(), oklch() & Modern Color Functions — common patterns you'll see in production.\n// APPROACH  - Combine color-mix(), oklch() & Modern Color Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Change hue for different accent colors */\n  --success: oklch(65% 0.20 145);     /* green */\n  --warning: oklch(75% 0.18 80);      /* amber */\n  --error:   oklch(55% 0.22 25);      /* red */\n}\n\n/* ── light-dark() — auto theme colors ────────────── */\n:root {\n  color-scheme: light dark;\n}\n\nbody {\n  background: light-dark(#ffffff, #1a1a1a);\n  color: light-dark(#1a1a1a, #e5e5e5);\n}\n\n.card {\n  background: light-dark(\n    oklch(98% 0.01 250),\n    oklch(22% 0.02 250)\n  );\n  border: 1px solid light-dark(\n    oklch(85% 0.02 250),\n    oklch(35% 0.02 250)\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of color-mix(), oklch() & Modern Color Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Design token system with color-mix ──────────── */\n:root {\n  --brand: oklch(55% 0.20 250);\n\n  /* Auto-generate palette from single brand color */\n  --brand-light: color-mix(in oklch, var(--brand) 30%, white);\n  --brand-lighter: color-mix(in oklch, var(--brand) 15%, white);\n  --brand-dark: color-mix(in oklch, var(--brand) 70%, black);\n  --brand-darker: color-mix(in oklch, var(--brand) 50%, black);\n  --brand-subtle: color-mix(in oklch, var(--brand) 10%, white);\n}"
                  }
        ],
        tips: [
                  "color-mix(in oklch, ...) produces more natural blends than srgb — oklch is perceptually uniform so 50% lightness looks 50% bright.",
                  "color-mix replaces Sass darken()/lighten() — mix with black to darken, white to lighten, transparent for opacity.",
                  "light-dark() reads the user's color-scheme preference — set color-scheme: light dark on :root to enable it.",
                  "oklch hue is a 0-360 degree wheel: 0=pink, 80=amber, 145=green, 250=blue, 320=purple. Same lightness=same perceived brightness."
        ],
        mistake: "Generating color palettes with hsl lightness — hsl(120, 80%, 50%) green and hsl(60, 80%, 50%) yellow have the same \"lightness\" but look completely different. oklch fixes this: equal L values are equally bright.",
        shorthand: {
          verbose: "color: #ff0000;\ncolor: rgb(255, 0, 0);\ncolor: hsl(0, 100%, 50%);",
          concise: "color: hsl(0 100% 50%);\ncolor: oklch(50% 0.3 0);",
        },
      },
    ],
  },

  // ── Section 2: Native Nesting & Scroll Snap ─────────────────────────────────────────
  {
    id: "nesting-scroll",
    title: "Native Nesting & Scroll Snap",
    entries: [
      {
        id: "css-nesting",
        fn: "CSS Native Nesting — No Preprocessor Required",
        desc: "Nest CSS rules natively: child selectors, pseudo-classes, media queries, and the & selector.",
        category: "Nesting",
        subtitle: "& selector, nested rules, @media inside rules, @layer, :is(), :has()",
        signature: ".card { & .title { } &:hover { } @media (width > 768px) { } }",
        descLong: "Native CSS nesting (baseline 2024) eliminates the need for Sass/Less just for nesting. Use & to reference the parent selector. Nest pseudo-classes (&:hover), child selectors (& .child), and media queries (@media inside rules). Works with @layer for cascade management. Combine with :is() for compact selectors and :has() for parent selectors. This is the single biggest CSS quality-of-life improvement — groups related styles together without a build step.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Native Nesting — No Preprocessor Required — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic nesting ────────────────────────────────── */\n.card {\n  padding: 1.5rem;\n  border-radius: 0.75rem;\n  background: var(--surface);\n\n  /* Child element */\n  & .title {\n    font-size: var(--text-lg);\n    font-weight: 600;\n    margin-bottom: 0.5rem;\n  }\n\n  & .body {\n    color: var(--text-muted);\n    line-height: 1.6;\n  }\n\n  /* Pseudo-classes */\n  &:hover {\n    box-shadow: 0 4px 12px oklch(0% 0 0 / 0.1);\n    transform: translateY(-2px);\n  }\n\n  &:focus-within {\n    outline: 2px solid var(--brand);\n  }\n\n  /* Pseudo-elements */\n  &::before {\n    content: \"\";\n    position: absolute;\n    inset: 0;\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Native Nesting — No Preprocessor Required — common patterns you'll see in production.\n// APPROACH  - Combine CSS Native Nesting — No Preprocessor Required with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Modifier classes */\n  &.featured {\n    border: 2px solid var(--brand);\n  }\n\n  &.disabled {\n    opacity: 0.5;\n    pointer-events: none;\n  }\n\n  /* Nested media queries */\n  @media (width > 768px) {\n    padding: 2rem;\n    display: grid;\n    grid-template-columns: 1fr 2fr;\n  }\n}\n\n/* ── :has() — parent selector ────────────────────── */\n/* Style parent based on children */\n.form-group {\n  padding: 1rem;\n\n  &:has(input:invalid) {\n    border-left: 3px solid var(--error);\n  }\n\n  &:has(input:focus) {\n    background: var(--brand-subtle);\n  }\n}\n\n/* ── @layer — cascade management ─────────────────── */\n@layer reset, base, components, utilities;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Native Nesting — No Preprocessor Required — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@layer base {\n  body {\n    font-family: system-ui, sans-serif;\n    line-height: 1.6;\n  }\n}\n\n@layer components {\n  .btn {\n    padding: 0.5rem 1rem;\n    border-radius: 0.375rem;\n\n    &.primary {\n      background: var(--brand);\n      color: white;\n    }\n  }\n}\n\n@layer utilities {\n  .sr-only {\n    position: absolute;\n    width: 1px;\n    height: 1px;\n    overflow: hidden;\n    clip: rect(0, 0, 0, 0);\n  }\n}"
                  }
        ],
        tips: [
                  "Native nesting works in all modern browsers (2024+) — you no longer need Sass/Less just for nesting.",
                  ":has() is the long-awaited \"parent selector\" — .card:has(img) styles cards that contain images.",
                  "@layer controls cascade priority explicitly — later layers always win regardless of specificity.",
                  "Nest @media inside rules to co-locate responsive styles with their component — much easier to maintain."
        ],
        mistake: "Deeply nesting beyond 3 levels — .page { & .section { & .card { & .title { & span { } } } } } creates overly specific selectors. Keep nesting to 2-3 levels max, same as with Sass.",
        shorthand: {
          verbose: ".btn {\n  padding: 8px 16px;\n  border-radius: 4px;\n}\n.btn:hover {\n  background: var(--primary);\n}\n.btn.disabled {\n  opacity: 0.5;\n}",
          concise: ".btn {\n  padding: 8px 16px;\n  border-radius: 4px;\n  \n  &:hover {\n    background: var(--primary);\n  }\n  \n  &.disabled {\n    opacity: 0.5;\n  }\n}",
        },
      },
      {
        id: "scroll-snap",
        fn: "Scroll Snap & Scroll Behavior — Native Carousels",
        desc: "Build smooth scrolling experiences: scroll-snap for carousels, scroll-behavior for anchors, scrollbar styling, and overscroll.",
        category: "Scroll",
        subtitle: "scroll-snap-type, scroll-snap-align, scroll-behavior, scroll-margin, overscroll-behavior",
        signature: "scroll-snap-type: x mandatory  |  scroll-snap-align: center  |  scroll-behavior: smooth",
        descLong: "CSS scroll snap creates native carousel/slider experiences without JavaScript. scroll-snap-type on the container enables snapping (x for horizontal, y for vertical; mandatory forces snap, proximity allows free scroll near edges). scroll-snap-align on children controls alignment (start, center, end). scroll-behavior: smooth enables animated scrolling for anchor links. scroll-margin creates offsets for fixed headers. overscroll-behavior prevents scroll chaining (modal scrolling bleeding into the page).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Scroll Snap & Scroll Behavior — Native Carousels — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Horizontal carousel (no JS!) ─────────────────── */\n.carousel {\n  display: flex;\n  gap: 1rem;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  scroll-padding: 1rem;         /* offset for padding */\n  -webkit-overflow-scrolling: touch;\n\n  /* Hide scrollbar but keep scroll */\n  scrollbar-width: none;\n  &::-webkit-scrollbar { display: none; }\n}\n\n.carousel-item {\n  flex: 0 0 min(300px, 85%);   /* card width */\n  scroll-snap-align: center;    /* snap to center */\n  border-radius: 1rem;\n  overflow: hidden;\n}\n\n/* ── Vertical full-page sections ─────────────────── */\n.fullpage {\n  height: 100vh;\n  overflow-y: auto;\n  scroll-snap-type: y mandatory;\n}\n\n.fullpage > section {\n  height: 100vh;\n  scroll-snap-align: start;\n  display: grid;\n  place-items: center;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Scroll Snap & Scroll Behavior — Native Carousels — common patterns you'll see in production.\n// APPROACH  - Combine Scroll Snap & Scroll Behavior — Native Carousels with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Smooth scrolling for anchor links ───────────── */\nhtml {\n  scroll-behavior: smooth;    /* smooth #anchor navigation */\n}\n\n/* Respect user preferences */\n@media (prefers-reduced-motion: reduce) {\n  html { scroll-behavior: auto; }\n}\n\n/* ── scroll-margin for fixed headers ─────────────── */\n/* When clicking #section anchor, offset for sticky header */\n[id] {\n  scroll-margin-top: 5rem;    /* height of fixed header */\n}\n\n/* ── overscroll-behavior — prevent scroll chaining ── */\n.modal {\n  overflow-y: auto;\n  overscroll-behavior: contain;  /* don't scroll body behind modal */\n}\n\n/* Prevent pull-to-refresh on mobile */\nbody {\n  overscroll-behavior-y: none;\n}\n\n/* ── Custom scrollbar styling ────────────────────── */\n.scrollable {\n  overflow-y: auto;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Scroll Snap & Scroll Behavior — Native Carousels — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Firefox */\n  scrollbar-width: thin;\n  scrollbar-color: var(--brand) transparent;\n\n  /* Webkit (Chrome, Safari, Edge) */\n  &::-webkit-scrollbar {\n    width: 8px;\n  }\n  &::-webkit-scrollbar-track {\n    background: transparent;\n  }\n  &::-webkit-scrollbar-thumb {\n    background: var(--brand);\n    border-radius: 4px;\n  }\n}"
                  }
        ],
        tips: [
                  "scroll-snap-type: x mandatory + scroll-snap-align: center creates a native carousel with zero JavaScript.",
                  "overscroll-behavior: contain on modals prevents background scroll bleed — one of the most common scroll UX bugs.",
                  "scroll-margin-top offsets anchor links for fixed/sticky headers — add it to all [id] elements globally.",
                  "Always wrap scroll-behavior: smooth in prefers-reduced-motion check — some users get motion sickness from smooth scrolling."
        ],
        mistake: "Using JavaScript scroll libraries for simple carousels — CSS scroll-snap handles horizontal/vertical carousels natively with better performance. Only reach for JS when you need programmatic control or complex animations.",
        shorthand: {
          verbose: "// Manual / verbose approach\nscroll-snap-type: x mandatory;\nscroll-snap-align: start;\nscroll-padding: 20px;\n// More explicit but longer",
          concise: "scroll-snap-type: x mandatory;\nscroll-snap-align: start;\nscroll-padding: 20px;",
        },
      },
      {
        id: "gradient-functions",
        fn: "Gradient Functions — linear, radial, conic, repeating",
        desc: "Create gradients natively: linear-gradient, radial-gradient, conic-gradient with multiple stops.",
        category: "Functions",
        subtitle: "linear-gradient, radial-gradient, conic-gradient, repeating-*, color stops",
        signature: "linear-gradient(90deg, color1, color2)  |  radial-gradient(circle, color1, color2)",
        descLong: "Gradient functions create smooth color transitions without images. linear-gradient for directional blends (0deg = up, 90deg = right). radial-gradient for circular/elliptical blends from center. conic-gradient for pie/wheel gradients. repeating-* variants tile the gradient. Color stops control transition points with percentages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Gradient Functions — linear, radial, conic, repeating — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Linear gradients ────────────────────────────── */\n.button-primary {\n  background: linear-gradient(90deg, #3b82f6, #2563eb);\n}\n\n.banner {\n  background: linear-gradient(\n    180deg,\n    #667eea 0%,\n    #764ba2 100%\n  );\n}\n\n/* Common angles */\n/* 0deg = top to bottom */\n/* 90deg = left to right */\n/* 180deg = bottom to top */\n/* 270deg = right to left */\n/* 45deg = diagonal */\n\n.card {\n  background: linear-gradient(\n    135deg,\n    rgba(255,255,255,0.1) 0%,\n    rgba(255,255,255,0) 100%\n  );\n}\n\n/* ── Radial gradients ──────────────────────────– */\n.circle-gradient {\n  background: radial-gradient(\n    circle,\n    #3b82f6 0%,\n    #1e3a8a 100%\n  );\n}\n\n.ellipse-gradient {\n  background: radial-gradient(\n    ellipse 400px 200px,\n    #f59e0b 0%,\n    transparent 70%\n  );\n}\n\n/* Positioned radial gradient */\n.spotlight {\n  background: radial-gradient(\n    circle at 30% 50%,\n    #fbbf24 0%,\n    transparent 70%\n  );\n}\n\n/* ── Conic gradients (pie/wheel) ───────────– */\n.color-wheel {\n  background: conic-gradient(\n    red,\n    yellow,\n    lime,\n    cyan,\n    blue,\n    magenta,\n    red\n  );\n  border-radius: 50%;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Gradient Functions — linear, radial, conic, repeating — common patterns you'll see in production.\n// APPROACH  - Combine Gradient Functions — linear, radial, conic, repeating with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.pie-chart {\n  background: conic-gradient(\n    #3b82f6 0deg 90deg,       /* 25% blue */\n    #8b5cf6 90deg 180deg,     /* 25% purple */\n    #f59e0b 180deg 270deg,    /* 25% amber */\n    #ef4444 270deg 360deg     /* 25% red */\n  );\n  border-radius: 50%;\n}\n\n/* Offset conic gradient */\n.gauge {\n  background: conic-gradient(\n    from 0deg at 50% 100%,\n    red,\n    yellow,\n    green\n  );\n}\n\n/* ── Repeating gradients ────────────────────– */\n.striped {\n  background: repeating-linear-gradient(\n    45deg,\n    #3b82f6,\n    #3b82f6 10px,\n    white 10px,\n    white 20px\n  );\n}\n\n.checkerboard {\n  background: repeating-conic-gradient(\n    #ffffff 0deg 90deg,\n    #e2e8f0 90deg 180deg\n  );\n  background-size: 20px 20px;\n}\n\n/* ── Multiple color stops ──────────────────– */\n.multi-stop {\n  background: linear-gradient(\n    90deg,\n    red 0%,\n    yellow 25%,\n    lime 50%,\n    cyan 75%,\n    blue 100%\n  );\n}\n\n.smooth-transition {\n  background: linear-gradient(\n    90deg,\n    #3b82f6 0%,\n    #3b82f6 30%,           /* solid blue */\n    #8b5cf6 50%,           /* transition zone */\n    #8b5cf6 70%,           /* solid purple */\n    #f59e0b 100%\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Gradient Functions — linear, radial, conic, repeating — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Gradient text ────────────────────────── */\n.gradient-text {\n  background: linear-gradient(\n    90deg,\n    #3b82f6,\n    #8b5cf6,\n    #f59e0b\n  );\n  background-clip: text;\n  -webkit-background-clip: text;\n  -webkit-text-fill-color: transparent;\n}\n\n/* ── Diagonal background ─────────────────── */\n.diagonal-bg {\n  background: linear-gradient(\n    135deg,\n    #667eea 0%,\n    #764ba2 100%\n  );\n  min-height: 100vh;\n}\n\n/* ── Fade to transparent ────────────────────– */\n.fade-bottom {\n  background: linear-gradient(\n    180deg,\n    rgba(0,0,0,0.8) 0%,\n    transparent 100%\n  );\n}\n\n/* ── Multiple gradients combined ─────────– */\n.complex-bg {\n  background:\n    radial-gradient(circle at 20% 50%, rgba(255,0,0,0.1) 0%, transparent 50%),\n    radial-gradient(circle at 80% 50%, rgba(0,0,255,0.1) 0%, transparent 50%),\n    linear-gradient(90deg, #f0f0f0, white);\n}"
                  }
        ],
        tips: [
                  "linear-gradient(90deg, color1, color2) creates a left-to-right gradient.",
                  "Color stops with % control where colors transition — 0% 25% creates hard edge, 0% 50% creates gradual transition.",
                  "radial-gradient(circle at 30% 50%, ...) positions the gradient center.",
                  "repeating-linear-gradient tiles the gradient — perfect for stripes and patterns."
        ],
        mistake: "Using image files for simple gradients — CSS gradients are smaller, scalable, and animatable.",
        shorthand: {
          verbose: "background-image: url('gradient.png');\nbackground-size: cover;\nbackground-repeat: no-repeat;",
          concise: "background: linear-gradient(90deg, #3b82f6, #8b5cf6);",
        },
      },
      {
        id: "transform-functions",
        fn: "Transform Functions — translate, rotate, scale, skew, matrix",
        desc: "Manipulate element position and shape: translate, rotate, scale, skew, matrix transforms.",
        category: "Functions",
        subtitle: "transform, translate(), rotate(), scale(), skew(), matrix(), perspective()",
        signature: "transform: translate(10px, 20px) rotate(45deg) scale(1.5)",
        descLong: "Transform functions modify elements in 2D or 3D space. translate() moves the element, rotate() spins, scale() resizes, skew() shears. All are GPU-accelerated (unlike margin/left). Combine multiple transforms with spaces. Matrix is the low-level form. Perspective enables 3D effects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Transform Functions — translate, rotate, scale, skew, matrix — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Translate (move) ──────────────────────────── */\n.box {\n  transform: translate(20px, 10px);  /* x, y movement */\n}\n\n.box-x {\n  transform: translateX(50px);       /* x only */\n}\n\n.box-3d {\n  transform: translate3d(20px, 10px, 5px);  /* x, y, z */\n}\n\n/* ── Rotate ────────────────────────────────────– */\n.rotate-45 {\n  transform: rotate(45deg);          /* 2D rotation */\n}\n\n.rotate-3d {\n  transform: rotateX(45deg);         /* rotate around x-axis */\n  transform: rotateY(45deg);         /* rotate around y-axis */\n  transform: rotateZ(45deg);         /* rotate around z-axis (same as rotate) */\n}\n\n/* ── Scale (resize) ────────────────────────── */\n.scale-up {\n  transform: scale(1.5);             /* 150% size */\n}\n\n.scale-both {\n  transform: scale(1.2, 0.8);        /* x: 120%, y: 80% */\n}\n\n.scale-x {\n  transform: scaleX(2);              /* double width */\n}\n\n/* ── Skew (shear) ──────────────────────────── */\n.skew-x {\n  transform: skew(10deg);            /* skew horizontally */\n}\n\n.skew-both {\n  transform: skew(10deg, 20deg);     /* skew x and y */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Transform Functions — translate, rotate, scale, skew, matrix — common patterns you'll see in production.\n// APPROACH  - Combine Transform Functions — translate, rotate, scale, skew, matrix with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Combined transforms ────────────────────– */\n.hero-image {\n  transform: translate(-50%, -50%) rotate(5deg) scale(1.05);\n}\n\n/* Order matters! Different order = different result */\n.order-1 {\n  transform: translate(50px) rotate(45deg);\n}\n\n.order-2 {\n  transform: rotate(45deg) translate(50px);\n}\n\n/* ── Transform origin (pivot point) ────────– */\n.rotate-from-corner {\n  transform: rotate(45deg);\n  transform-origin: top left;  /* rotate around top-left corner */\n}\n\n.rotate-from-center {\n  transform-origin: center;    /* default */\n}\n\n.scale-from-bottom {\n  transform: scale(1.2);\n  transform-origin: bottom center;\n}\n\n/* ── 3D perspective ────────────────────────– */\n.perspective-container {\n  perspective: 1000px;  /* controls depth effect */\n}\n\n.perspective-container .card {\n  transform: rotateX(15deg) rotateY(10deg);\n}\n\n/* ── Matrix (low-level) ────────────────────– */\n/* matrix(a, b, c, d, tx, ty) */\n.matrix-transform {\n  transform: matrix(1, 0, 0, 1, 50, 10);  /* equivalent to translate(50px, 10px) */\n}\n\n/* ── Transitions with transforms ─────────– */\n.button {\n  transition: transform 200ms ease;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Transform Functions — translate, rotate, scale, skew, matrix — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.button:hover {\n  transform: translateY(-2px) scale(1.05);\n}\n\n/* ── Centering with transform ────────────– */\n.centered {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n/* ── Flip animation (using scaleX) ──────– */\n.flip {\n  transform: scaleX(-1);  /* mirror horizontally */\n}\n\n.flip-both {\n  transform: scaleX(-1) scaleY(-1);  /* mirror both axes */\n}\n\n/* ── Rotating spinner ──────────────────── */\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n\n.spinner {\n  animation: spin 2s linear infinite;\n}\n\n/* ── Will-change hint ──────────────────– */\n.animated-box {\n  will-change: transform;  /* tell browser to optimize for transform */\n  transform: translate(0);\n}\n\n.animated-box:hover {\n  transform: translate(10px, 10px) rotate(5deg);\n}"
                  }
        ],
        tips: [
                  "Transforms are GPU-accelerated — much faster than changing top/left. Always use transform for animations.",
                  "transform: translate(-50%, -50%) on position: absolute with top/left: 50% centers an element perfectly.",
                  "Multiple transforms: transform: translateX(50px) rotate(45deg) scale(1.1) — all apply.",
                  "will-change: transform tells the browser to optimize — use before animations."
        ],
        mistake: "Animating margin/left/top instead of transform — causes repaints and jank. Use transform always.",
        shorthand: {
          verbose: "position: absolute;\ntop: 50%;\nleft: 50%;\nmargin-left: -50px;\nmargin-top: -50px;",
          concise: "position: absolute;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);",
        },
      },
      {
        id: "filter-functions",
        fn: "filter Property — blur, brightness, contrast, drop-shadow, hue-rotate",
        desc: "Apply visual effects to elements: blur, brightness, contrast, drop-shadow, hue-rotate, saturate.",
        category: "Functions",
        subtitle: "filter, blur(), brightness(), contrast(), drop-shadow(), hue-rotate(), saturate()",
        signature: "filter: blur(5px) brightness(1.2) contrast(1.5)",
        descLong: "The filter property applies graphical effects like image editors. blur() softens, brightness() lightens/darkens, contrast() increases/decreases color differences, drop-shadow() adds shadows, hue-rotate() shifts colors, saturate() controls color intensity. Combine multiple filters with spaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of filter Property — blur, brightness, contrast, drop-shadow, hue-rotate — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Blur ──────────────────────────────────────────– */\n.blur-light {\n  filter: blur(5px);\n}\n\n.blur-heavy {\n  filter: blur(20px);\n}\n\n/* ── Brightness ────────────────────────────── */\n.darker {\n  filter: brightness(0.8);    /* 80% brightness = darker */\n}\n\n.brighter {\n  filter: brightness(1.2);    /* 120% brightness = lighter */\n}\n\n/* ── Contrast ──────────────────────────────– */\n.low-contrast {\n  filter: contrast(0.8);      /* 80% contrast = muted colors */\n}\n\n.high-contrast {\n  filter: contrast(1.5);      /* 150% contrast = vibrant */\n}\n\n/* ── Drop shadow ───────────────────────────– */\n.shadow {\n  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));\n}\n\n/* Better than box-shadow for images/SVG */\n.image {\n  filter: drop-shadow(5px 5px 10px rgba(0,0,0,0.3));\n}\n\n/* ── Hue rotate (shift colors) ────────────– */\n.rotate-hue {\n  filter: hue-rotate(45deg);  /* shift all colors by 45 degrees */\n}\n\n.invert-colors {\n  filter: hue-rotate(180deg);\n}\n\n/* ── Saturate (color intensity) ──────────– */\n.desaturate {\n  filter: saturate(0);        /* grayscale */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of filter Property — blur, brightness, contrast, drop-shadow, hue-rotate — common patterns you'll see in production.\n// APPROACH  - Combine filter Property — blur, brightness, contrast, drop-shadow, hue-rotate with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.muted-colors {\n  filter: saturate(0.5);      /* 50% color intensity */\n}\n\n.vibrant-colors {\n  filter: saturate(2);        /* 200% color intensity */\n}\n\n/* ── Grayscale ────────────────────────────– */\n.grayscale {\n  filter: grayscale(1);       /* 100% grayscale */\n}\n\n.grayscale-partial {\n  filter: grayscale(0.5);     /* 50% grayscale */\n}\n\n/* ── Invert ────────────────────────────────– */\n.inverted {\n  filter: invert(1);          /* 100% inverted = negative */\n}\n\n/* ── Sepia (brownish tone) ────────────────– */\n.sepia {\n  filter: sepia(1);           /* 100% sepia */\n}\n\n/* ── Opacity (different from filter opacity) */\n.opacity-filter {\n  filter: opacity(0.5);       /* affects element as whole */\n}\n\n/* ── Combine multiple filters ──────────── */\n.instagram-like {\n  filter: contrast(1.2) saturate(1.5) brightness(1.1);\n}\n\n.vintage-photo {\n  filter: sepia(0.5) grayscale(0.3) contrast(1.1);\n}\n\n.night-mode {\n  filter: brightness(0.8) contrast(1.2);\n}\n\n/* ── Hover effect with filters ─────────– */\n.hover-brighten:hover {\n  filter: brightness(1.1);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of filter Property — blur, brightness, contrast, drop-shadow, hue-rotate — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.hover-blur:hover {\n  filter: blur(2px);\n}\n\n/* ── Transitions with filters ──────────– */\n.filter-transition {\n  transition: filter 300ms ease;\n  filter: grayscale(0);\n}\n\n.filter-transition:hover {\n  filter: grayscale(1);\n}\n\n/* ── Image hover effects ───────────────– */\n.image-gallery img {\n  filter: brightness(0.9) saturate(0.8);\n  transition: filter 300ms ease;\n}\n\n.image-gallery img:hover {\n  filter: brightness(1) saturate(1);\n}\n\n/* ── Backdrop filter (blur behind) ────– */\n.glass-effect {\n  backdrop-filter: blur(10px);\n  background: rgba(255,255,255,0.1);\n}\n\n/* ── Combining drop-shadow with transform */\n.floating-card {\n  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));\n  transform: translateY(-5px);\n  transition: all 300ms ease;\n}\n\n.floating-card:hover {\n  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.2));\n  transform: translateY(-10px);\n}"
                  }
        ],
        tips: [
                  "drop-shadow() on filter works better than box-shadow for images/SVG — it follows the shape.",
                  "Combine filters: filter: brightness(1.2) contrast(1.5) saturate(0.8) — all apply.",
                  "saturate(0) = grayscale, saturate(2) = extra vibrant. brightness(0.5) = 50% brightness.",
                  "backdrop-filter: blur() creates glass effect — browser support is good but check for older IE."
        ],
        mistake: "Using filter: opacity() instead of element opacity — filters are more expensive. Use opacity property when possible.",
        shorthand: {
          verbose: "img {\n  filter: brightness(0.9);\n  filter: contrast(1.1);\n  filter: saturate(0.9);\n}",
          concise: "img {\n  filter: brightness(0.9) contrast(1.1) saturate(0.9);\n}",
        },
      },
      {
        id: "counter-functions",
        fn: "CSS Counters — Automatic Numbering",
        desc: "Generate automatic numbering: counter-reset, counter-increment, counter() function.",
        category: "Functions",
        subtitle: "counter(), counters(), counter-reset, counter-increment, ::before, ::after",
        signature: "counter-reset: name  |  counter-increment: name  |  content: counter(name)",
        descLong: "CSS counters automatically number elements without JavaScript. counter-reset starts a counter, counter-increment advances it. Use counter() in content property to display the number. Perfect for heading numbers, list items, and chapter counting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Counters — Automatic Numbering — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic section numbering ────────────────────– */\nbody {\n  counter-reset: section;    /* start section counter at 0 */\n}\n\nh1 {\n  counter-increment: section;  /* increment by 1 */\n}\n\nh1::before {\n  content: counter(section) \". \";  /* display: \"1. \", \"2. \", etc */\n}\n\n/* Heading displays as: \"1. Title\", \"2. Title\", etc */\n\n/* ── Subsection (nested counters) ──────────– */\nbody {\n  counter-reset: section subsection;\n}\n\nh1 {\n  counter-increment: section;\n  counter-reset: subsection;  /* reset subsection when section changes */\n}\n\nh2 {\n  counter-increment: subsection;\n}\n\nh1::before {\n  content: counter(section) \". \";\n}\n\nh2::before {\n  content: counter(section) \".\" counter(subsection) \" \";\n}\n\n/* Displays as: \"1. Heading\", \"1.1 Subheading\", \"1.2 Subheading\", \"2. Heading\" */\n\n/* ── Automatic list numbering ──────────────– */\n.custom-list {\n  counter-reset: item;\n  list-style: none;\n  padding-left: 0;\n}\n\n.custom-list li {\n  counter-increment: item;\n  margin-bottom: 1rem;\n}\n\n.custom-list li::before {\n  content: counter(item) \". \";\n  font-weight: 600;\n  color: #3b82f6;\n  margin-right: 0.5rem;\n}\n\n/* ── Alphabet numbering ────────────────────– */\n.alpha-list {\n  counter-reset: alpha;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Counters — Automatic Numbering — common patterns you'll see in production.\n// APPROACH  - Combine CSS Counters — Automatic Numbering with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.alpha-list li {\n  counter-increment: alpha;\n}\n\n.alpha-list li::before {\n  content: counter(alpha, lower-alpha) \") \";  /* a), b), c) */\n}\n\n/* Counter styles: decimal, lower-alpha, upper-alpha, lower-roman, upper-roman */\n\n/* ── Breadcrumb numbering ──────────────────– */\n.breadcrumb {\n  counter-reset: breadcrumb;\n}\n\n.breadcrumb > li {\n  counter-increment: breadcrumb;\n}\n\n.breadcrumb li::after {\n  content: \" (\" counter(breadcrumb) \") \";\n}\n\n/* ── footnote numbering ────────────────────– */\n.article {\n  counter-reset: footnote;\n}\n\n.footnote {\n  counter-increment: footnote;\n}\n\n.footnote::after {\n  content: \"[\" counter(footnote) \"]\";\n  font-size: 0.875em;\n  vertical-align: super;\n  color: #3b82f6;\n}\n\n/* ── Table of contents generation ──────── */\n.toc {\n  counter-reset: toc-h1 toc-h2;\n}\n\n.toc h1 {\n  counter-increment: toc-h1;\n  counter-reset: toc-h2;\n}\n\n.toc h2 {\n  counter-increment: toc-h2;\n}\n\n.toc h1::before {\n  content: counter(toc-h1) \" \";\n}\n\n.toc h2::before {\n  content: counter(toc-h1) \".\" counter(toc-h2) \" \";\n  margin-left: 2rem;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Counters — Automatic Numbering — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── counters() for deep nesting ────────– */\nol {\n  counter-reset: nested;\n}\n\nol li {\n  counter-increment: nested;\n}\n\nol li::before {\n  content: counters(nested, \".\") \" \";  /* handles arbitrary nesting depth */\n}\n\n/* Displays as: 1 1.1 1.1.1 1.2 1.2.1 2 2.1 etc */\n\n/* ── Styled counter display ────────────– */\n.step {\n  counter-increment: step-counter;\n}\n\n.step::before {\n  content: counter(step-counter);\n  display: inline-flex;\n  width: 32px;\n  height: 32px;\n  align-items: center;\n  justify-content: center;\n  background: #3b82f6;\n  color: white;\n  border-radius: 50%;\n  margin-right: 1rem;\n  font-weight: 600;\n}\n\n/* ── Timeline numbering ────────────────── */\n.timeline {\n  counter-reset: timeline;\n  position: relative;\n}\n\n.timeline-item {\n  counter-increment: timeline;\n  padding-left: 3rem;\n  position: relative;\n  margin-bottom: 2rem;\n}\n\n.timeline-item::before {\n  content: counter(timeline);\n  position: absolute;\n  left: 0;\n  width: 2rem;\n  height: 2rem;\n  background: #3b82f6;\n  color: white;\n  border-radius: 50%;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}"
                  }
        ],
        tips: [
                  "counter-reset: counter1 counter2 resets multiple counters at once.",
                  "counters(name, \".\") for deeply nested lists — handles arbitrary nesting.",
                  "Use ::before or ::after to display the counter in content property.",
                  "Counter styles: decimal (1,2,3), lower-alpha (a,b,c), upper-roman (I,II,III)."
        ],
        mistake: "Forgetting counter-reset when moving to a new context — counters continue incrementing. Use counter-reset to start fresh.",
        shorthand: {
          verbose: "<h1><span>1</span> Heading</h1>\n<h1><span>2</span> Heading</h1>\n<h1><span>3</span> Heading</h1>",
          concise: "h1 { counter-increment: section; }\nh1::before { content: counter(section) \" \"; }",
        },
      },
      {
        id: "env-function",
        fn: "env() Function — Safe Area Insets & Notch Support",
        desc: "Handle device notches and safe areas: env(safe-area-inset-*) for mobile devices.",
        category: "Functions",
        subtitle: "env(), safe-area-inset-*, notch support, viewport-fit",
        signature: "padding: env(safe-area-inset-bottom)  |  viewport-fit=cover",
        descLong: "The env() function provides device-specific values. safe-area-inset-top/bottom/left/right are distances from the safe area (avoiding notches, home indicators). Set viewport-fit=cover in the meta viewport tag to use full screen including notch areas, then use env() to add padding where needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of env() Function — Safe Area Insets & Notch Support — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Meta viewport with notch support ────────────– */\n/* Add to HTML <head> */\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n\n/* ── Safe area padding ────────────────────────── */\nbody {\n  padding-top: env(safe-area-inset-top);\n  padding-left: env(safe-area-inset-left);\n  padding-right: env(safe-area-inset-right);\n  padding-bottom: env(safe-area-inset-bottom);\n}\n\n/* ── Header with notch awareness ───────────– */\nheader {\n  padding-top: max(1rem, env(safe-area-inset-top));\n  padding-left: max(1rem, env(safe-area-inset-left));\n  padding-right: max(1rem, env(safe-area-inset-right));\n}\n\n/* Ensures at least 1rem padding, but more if notch requires it */\n\n/* ── Fixed bottom navigation (with home indicator) */\n.bottom-nav {\n  position: fixed;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  padding-bottom: env(safe-area-inset-bottom);\n  min-height: 60px;\n  background: white;\n  border-top: 1px solid #e2e8f0;\n}\n\n/* ── Fixed sidebar (with notch) ────────────– */\n.sidebar {\n  position: fixed;\n  left: 0;\n  top: 0;\n  bottom: 0;\n  width: 250px;\n  padding-left: env(safe-area-inset-left);\n}\n\n/* ── Notch-aware modal ────────────────────– */\n.modal {\n  position: fixed;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  margin-top: env(safe-area-inset-top);\n  margin-bottom: env(safe-area-inset-bottom);\n  margin-left: env(safe-area-inset-left);\n  margin-right: env(safe-area-inset-right);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of env() Function — Safe Area Insets & Notch Support — common patterns you'll see in production.\n// APPROACH  - Combine env() Function — Safe Area Insets & Notch Support with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Full-screen video (avoid notch) ───────– */\n.video-fullscreen {\n  width: 100%;\n  height: 100vh;\n  position: fixed;\n  top: 0;\n  left: 0;\n  padding-top: env(safe-area-inset-top);\n  padding-bottom: env(safe-area-inset-bottom);\n  padding-left: env(safe-area-inset-left);\n  padding-right: env(safe-area-inset-right);\n}\n\n/* ── Safe area aware grid layout ────────── */\n.fullscreen-grid {\n  display: grid;\n  grid-template-columns:\n    env(safe-area-inset-left)\n    1fr\n    env(safe-area-inset-right);\n  grid-template-rows:\n    env(safe-area-inset-top)\n    1fr\n    env(safe-area-inset-bottom);\n  min-height: 100vh;\n}\n\n.content {\n  grid-column: 2;\n  grid-row: 2;\n}\n\n/* ── Status bar aware layout ───────────── */\n.app-frame {\n  display: flex;\n  flex-direction: column;\n  height: 100vh;\n  padding-top: env(safe-area-inset-top);\n}\n\n.header {\n  flex-shrink: 0;\n  background: white;\n  border-bottom: 1px solid #e2e8f0;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of env() Function — Safe Area Insets & Notch Support — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.content {\n  flex: 1;\n  overflow-y: auto;\n}\n\n.footer {\n  flex-shrink: 0;\n  padding-bottom: env(safe-area-inset-bottom);\n}\n\n/* ── Handling multiple safe areas (iPad split view) */\n.split-view {\n  display: grid;\n  grid-template-columns:\n    env(safe-area-inset-left)\n    1fr\n    calc(1fr - env(safe-area-inset-right));\n  gap: 1rem;\n}\n\n/* ── Fallback for older browsers (no env support) */\nheader {\n  padding-top: max(1rem, env(safe-area-inset-top, 1rem));\n}\n\n/* If env() not supported, uses 1rem fallback */\n\n/* ── Note: env() values are constants, not inherited */\n/* All safe-area insets are measured from device edges */\n/* env(safe-area-inset-top) = notch height on iPhone X+\n   env(safe-area-inset-bottom) = home indicator area on iPhone\n   env(safe-area-inset-left) = notch side width (e.g., Dynamic Island)\n   env(safe-area-inset-right) = notch side width (e.g., Dynamic Island)\n*/"
                  }
        ],
        tips: [
                  "Add viewport-fit=cover to <meta viewport> to use the full screen including notch areas.",
                  "env(safe-area-inset-*) returns 0px if no notch, so it's safe to use everywhere.",
                  "Use max(desired, env(...)) to ensure minimum padding while respecting safe areas.",
                  "Fixed elements (headers, navs) should use env() insets to avoid being hidden behind notches."
        ],
        mistake: "Not using viewport-fit=cover and env() insets — content gets hidden behind notches on iPhone/Android devices.",
        shorthand: {
          verbose: "/* Without viewport-fit */\npadding: 1rem;\n\n/* Content might hide behind notch */",
          concise: "<!-- In <head> -->\n<meta name=\"viewport\" content=\"viewport-fit=cover\">\n\n<!-- In CSS -->\npadding: max(1rem, env(safe-area-inset-bottom));",
        },
      },
      {
        id: "shape-functions",
        fn: "clip-path with Shapes — polygon, circle, ellipse, path()",
        desc: "Create non-rectangular shapes with clip-path: polygon, circle, ellipse, inset, path().",
        category: "Functions",
        subtitle: "clip-path, polygon(), circle(), ellipse(), inset(), path()",
        signature: "clip-path: polygon(0% 0%, 100% 0%, 100% 80%, 0% 100%)",
        descLong: "clip-path masks elements to custom shapes. polygon() for arbitrary shapes using coordinates. circle(radius at x y) for circles. ellipse(rx ry at x y) for ellipses. inset(top right bottom left) for rectangles with rounded insets. path() for SVG-like paths. All support animation and transitions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of clip-path with Shapes — polygon, circle, ellipse, path() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Polygon shapes ────────────────────────────── */\n/* Triangle pointing right */\n.triangle {\n  width: 100px;\n  height: 100px;\n  background: #3b82f6;\n  clip-path: polygon(0% 0%, 100% 50%, 0% 100%);\n}\n\n/* Chevron */\n.chevron {\n  width: 100px;\n  height: 100px;\n  background: #8b5cf6;\n  clip-path: polygon(\n    0% 0%,\n    70% 0%,\n    100% 50%,\n    70% 100%,\n    0% 100%,\n    30% 50%\n  );\n}\n\n/* Hexagon */\n.hexagon {\n  width: 100px;\n  height: 100px;\n  background: #f59e0b;\n  clip-path: polygon(\n    50% 0%,\n    100% 25%,\n    100% 75%,\n    50% 100%,\n    0% 75%,\n    0% 25%\n  );\n}\n\n/* ── Circle and ellipse ────────────────── */\n.circle {\n  width: 100px;\n  height: 100px;\n  background: #22c55e;\n  clip-path: circle(50%);  /* 50% of element size */\n}\n\n.circle-centered {\n  width: 200px;\n  height: 100px;\n  background: #22c55e;\n  clip-path: circle(50px at 100px 50px);  /* circle at specific position */\n}\n\n.ellipse {\n  width: 200px;\n  height: 100px;\n  background: #06b6d4;\n  clip-path: ellipse(100px 50px);  /* horizontal radius, vertical radius */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of clip-path with Shapes — polygon, circle, ellipse, path() — common patterns you'll see in production.\n// APPROACH  - Combine clip-path with Shapes — polygon, circle, ellipse, path() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Inset (rectangle with rounded corners) */\n.inset-shape {\n  width: 200px;\n  height: 100px;\n  background: #ef4444;\n  clip-path: inset(20px 40px);  /* top/bottom, left/right insets */\n}\n\n.inset-radius {\n  width: 200px;\n  height: 100px;\n  background: #ec4899;\n  clip-path: inset(20px 40px round 10px);  /* with border-radius */\n}\n\n/* ── Image shapes ──────────────────────── */\n.profile-circle {\n  width: 200px;\n  height: 200px;\n  background-image: url('profile.jpg');\n  background-size: cover;\n  clip-path: circle(50%);\n}\n\n.profile-polygon {\n  width: 200px;\n  height: 200px;\n  background-image: url('profile.jpg');\n  background-size: cover;\n  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);\n}\n\n/* ── Text revealed through shapes ────── */\n.text-shape {\n  width: 300px;\n  font-size: 2rem;\n  font-weight: 600;\n  color: #3b82f6;\n  clip-path: polygon(\n    0% 0%,\n    100% 0%,\n    100% 70%,\n    50% 100%,\n    0% 70%\n  );\n}\n\n/* ── Diagonal banner ────────────────────– */\n.diagonal-banner {\n  padding: 2rem;\n  background: linear-gradient(135deg, #667eea, #764ba2);\n  color: white;\n  clip-path: polygon(0% 0%, 100% 0%, 100% 85%, 0% 100%);\n}\n\n/* ── Animated clip-path ────────────────– */\n.animated-shape {\n  width: 100px;\n  height: 100px;\n  background: #3b82f6;\n  clip-path: circle(30%);\n  transition: clip-path 300ms ease;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of clip-path with Shapes — polygon, circle, ellipse, path() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.animated-shape:hover {\n  clip-path: circle(50%);  /* expands on hover */\n}\n\n/* ── Complex polygon (star) ────────────– */\n.star {\n  width: 100px;\n  height: 100px;\n  background: #fbbf24;\n  clip-path: polygon(\n    50% 0%,\n    61% 35%,\n    98% 35%,\n    68% 57%,\n    79% 91%,\n    50% 70%,\n    21% 91%,\n    32% 57%,\n    2% 35%,\n    39% 35%\n  );\n}\n\n/* ── SVG path in clip-path ────────────── */\n.custom-path {\n  width: 200px;\n  height: 200px;\n  background: #3b82f6;\n  clip-path: path('M 0,0 L 100,0 Q 150,50 100,100 L 0,100 Z');\n}\n\n/* ── Mask image (alternative to clip-path) */\n.masked {\n  width: 200px;\n  height: 200px;\n  background-image: url('image.jpg');\n  background-size: cover;\n  mask-image: url('mask.png');\n  mask-size: cover;\n}\n\n/* ── Combining with animations ──────── */\n@keyframes shrink {\n  from { clip-path: circle(100%); }\n  to { clip-path: circle(0%); }\n}\n\n.shrinking-shape {\n  animation: shrink 2s ease infinite;\n}"
                  }
        ],
        tips: [
                  "polygon() coordinates are percentages — 0% 0% is top-left, 100% 100% is bottom-right.",
                  "circle(50%) is 50% of the element size. circle(50px at 100px 50px) is absolute size at position.",
                  "clip-path animates smoothly with same shape (polygon to polygon, circle to circle).",
                  "clip-path is GPU-accelerated and more performant than masking images."
        ],
        mistake: "Trying to animate between different shapes (circle to polygon) — doesn't work smoothly. Keep shapes the same type.",
        shorthand: {
          verbose: "// Manual / verbose approach\n<div style=\"width: 100px; height: 100px; background: blue; border-radius: 50%; margin: 50px auto;\"></div>\n// More explicit but longer",
          concise: "<div style=\"width: 100px; height: 100px; background: blue; clip-path: circle(50%);\"></div>",
        },
      },
      {
        id: "grid-functions",
        fn: "Grid Functions — repeat(), minmax(), fit-content(), auto",
        desc: "CSS Grid layout functions: repeat(), minmax(), fit-content(), auto sizing.",
        category: "Grid",
        subtitle: "repeat(), minmax(), fit-content(), auto, grid-template-columns",
        signature: "repeat(3, 1fr)  |  minmax(200px, 1fr)  |  fit-content(300px)",
        descLong: "Grid functions control column/row sizing. repeat(count, size) creates N equal tracks. minmax(min, max) sets flexible ranges. fit-content() is like min(100%, max-content). auto fills available space. Combine them for responsive grids without media queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Grid Functions — repeat(), minmax(), fit-content(), auto — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── repeat() — create multiple tracks ──────────– */\n.grid-3-equal {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);  /* 3 equal columns */\n}\n\n.grid-4-fixed {\n  display: grid;\n  grid-template-columns: repeat(4, 200px);  /* 4 × 200px columns */\n}\n\n/* ── repeat() with patterns ────────────────– */\n.grid-pattern {\n  display: grid;\n  grid-template-columns: repeat(3, 2fr 1fr);  /* 3 × (wide, narrow) pattern */\n}\n\n/* Outputs: 2fr 1fr 2fr 1fr 2fr 1fr (6 columns total) */\n\n/* ── repeat(auto-fill, minmax()) — responsive no-breakpoint grid */\n.auto-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n  gap: 1rem;\n}\n\n/* Mobile: 1 column\n   Tablet: 2-3 columns\n   Desktop: 4+ columns\n   All automatic based on space\n*/\n\n/* ── minmax() for flexible sizing ──────────– */\n.flexible-grid {\n  display: grid;\n  grid-template-columns: minmax(200px, 1fr);  /* 200px minimum, grows to 1fr */\n}\n\n.two-column-balanced {\n  display: grid;\n  grid-template-columns: minmax(300px, 1fr) minmax(250px, 1fr);\n}\n\n/* Each column: at least 300px/250px, grows equally */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Grid Functions — repeat(), minmax(), fit-content(), auto — common patterns you'll see in production.\n// APPROACH  - Combine Grid Functions — repeat(), minmax(), fit-content(), auto with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── fit-content() — size based on content ──– */\n.content-sized {\n  display: grid;\n  grid-template-columns: fit-content(300px) 1fr;\n}\n\n/* First column: shrinks to content (max 300px), second fills remaining */\n\n.sidebar-content {\n  display: grid;\n  grid-template-columns: fit-content(400px) 1fr;\n  gap: 2rem;\n}\n\n/* ── auto keyword ──────────────────────────– */\n.auto-sizing {\n  display: grid;\n  grid-template-columns: auto 1fr auto;  /* first and third: content width, middle: fills space */\n}\n\n.mixed-sizing {\n  display: grid;\n  grid-template-columns: 100px auto 1fr auto;\n}\n\n/* ── Complex responsive layout ────────────– */\n.dashboard {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(250px, 100%), 1fr)\n  );\n  gap: 1.5rem;\n}\n\n/* Mobile: 1 column\n   Tablet: 2 columns\n   Desktop: 3-4 columns\n   Automatic!\n*/\n\n/* ── repeat() with auto-fit/auto-fill ──── */\n.auto-fit-grid {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(150px, 1fr)\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Grid Functions — repeat(), minmax(), fit-content(), auto — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* auto-fit: collapses empty tracks (looks better)\n   auto-fill: keeps empty tracks (more spacing on right)\n*/\n\n/* ── Named grid lines ──────────────────────– */\n.named-grid {\n  display: grid;\n  grid-template-columns:\n    [left] minmax(200px, 1fr)\n    [main-start] minmax(300px, 2fr)\n    [main-end] minmax(150px, 1fr)\n    [right];\n}\n\n.content {\n  grid-column: main-start / main-end;\n}\n\n/* ── Responsive columns with clamp ────────– */\n.clamp-grid {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(clamp(150px, 25%, 300px), 1fr)\n  );\n  gap: 1rem;\n}\n\n/* Columns: min 150px, preferred 25% viewport, max 300px */\n\n/* ── Grid auto-flow ────────────────────────– */\n.dense-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));\n  grid-auto-flow: dense;  /* fills gaps with items that don't fit */\n}"
                  }
        ],
        tips: [
                  "repeat(auto-fit, minmax(250px, 1fr)) is the magic responsive grid pattern.",
                  "minmax(min, max) is always more flexible than fixed sizes.",
                  "fit-content(value) is like min(100%, max-content) with a max limit.",
                  "auto in grid-template-columns = content width (like fit-content with no max)."
        ],
        mistake: "Using fixed columns (repeat(3, 1fr)) instead of repeat(auto-fit, minmax(...)) — requires media queries for responsiveness.",
        shorthand: {
          verbose: "@media (max-width: 768px) {\n  grid-template-columns: 1fr;\n}\n@media (min-width: 769px) {\n  grid-template-columns: 1fr 1fr;\n}",
          concise: "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));",
        },
      },
      {
        id: "custom-props-advanced",
        fn: "@property — Registered Custom Properties with Type Checking",
        desc: "Advanced custom properties: @property for type safety, inheritance control, fallback values.",
        category: "Custom Properties",
        subtitle: "@property, syntax, initial-value, inherits, registered properties, animation",
        signature: "@property --color { syntax: \"<color>\"; initial-value: blue; inherits: true; }",
        descLong: "@property registers custom properties with type information. syntax defines the type (<color>, <number>, <length>, etc.). initial-value provides a default. inherits controls cascade behavior. Registered properties enable animations and provide validation. More powerful than simple CSS variables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @property — Registered Custom Properties with Type Checking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic registered property ──────────────────– */\n@property --primary-color {\n  syntax: \"<color>\";\n  initial-value: #3b82f6;\n  inherits: false;\n}\n\n:root {\n  --primary-color: #3b82f6;\n}\n\n.button {\n  background: var(--primary-color);\n}\n\n/* ── Inheritable property ──────────────────– */\n@property --text-color {\n  syntax: \"<color>\";\n  initial-value: black;\n  inherits: true;         /* children inherit this */\n}\n\n:root {\n  --text-color: black;\n}\n\n.container {\n  --text-color: blue;     /* applies to .container and children */\n}\n\n.container p {\n  color: var(--text-color);  /* blue, inherited */\n}\n\n/* ── Number type with constraints ──────────– */\n@property --opacity-value {\n  syntax: \"<number>\";\n  initial-value: 1;\n  inherits: false;\n}\n\n.card {\n  --opacity-value: 0.8;\n  opacity: var(--opacity-value);\n}\n\n/* ── Length property ───────────────────────– */\n@property --spacing {\n  syntax: \"<length>\";\n  initial-value: 1rem;\n  inherits: false;\n}\n\n.container {\n  padding: var(--spacing);\n}\n\n/* ── Percentage property ────────────────────– */\n@property --width-percent {\n  syntax: \"<percentage>\";\n  initial-value: 50%;\n  inherits: false;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @property — Registered Custom Properties with Type Checking — common patterns you'll see in production.\n// APPROACH  - Combine @property — Registered Custom Properties with Type Checking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.sidebar {\n  width: var(--width-percent);\n}\n\n/* ── Animatable property ────────────────── */\n@property --rotation {\n  syntax: \"<angle>\";\n  initial-value: 0deg;\n  inherits: false;\n}\n\n.spinner {\n  animation: spin 2s linear infinite;\n}\n\n@keyframes spin {\n  from { --rotation: 0deg; }\n  to { --rotation: 360deg; }\n}\n\n.spinner {\n  transform: rotate(var(--rotation));\n}\n\n/* ── Multiple syntax options ────────────── */\n@property --shadow {\n  syntax: \"<shadow>\";\n  initial-value: 0 0 0 rgba(0,0,0,0);\n  inherits: false;\n}\n\n.card {\n  --shadow: 0 4px 6px rgba(0,0,0,0.1);\n  box-shadow: var(--shadow);\n}\n\n/* ── Custom property with fallback ────── */\n@property --brand-color {\n  syntax: \"<color>\";\n  initial-value: blue;\n  inherits: false;\n}\n\n.button {\n  background: var(--brand-color, #3b82f6);  /* fallback if not set */\n}\n\n/* ── Registering in JavaScript ──────────– */\n/* CSS.registerProperty({\n  name: \"--my-color\",\n  syntax: \"<color>\",\n  initialValue: \"#c0ffee\",\n  inherits: false\n}); */\n\n/* ── Type-checked property prevents errors ─ */\n@property --animation-speed {\n  syntax: \"<number>\";\n  initial-value: 1;\n  inherits: false;\n}\n\n.element {\n  --animation-speed: 1.5;      /* valid: number */\n  animation-duration: calc(var(--animation-speed) * 1s);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @property — Registered Custom Properties with Type Checking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Theme switching with registered properties */\n@property --primary {\n  syntax: \"<color>\";\n  initial-value: #3b82f6;\n  inherits: true;\n}\n\n:root {\n  --primary: #3b82f6;\n}\n\n:root.dark {\n  --primary: #60a5fa;\n}\n\n.button {\n  background: var(--primary);\n  transition: --primary 300ms ease;  /* smooth color change */\n}\n\n/* ── Complex syntax (future CSS 4) ───── */\n@property --gap-spacing {\n  syntax: \"<length>+ | <percentage>+\";  /* can be length or percentage */\n  initial-value: 1rem;\n  inherits: false;\n}\n\n.grid {\n  gap: var(--gap-spacing);\n}\n\n/* ── Registered property in component ──– */\n@property --card-bg {\n  syntax: \"<color>\";\n  initial-value: white;\n  inherits: false;\n}\n\n@property --card-radius {\n  syntax: \"<length>\";\n  initial-value: 0.5rem;\n  inherits: false;\n}\n\n.card {\n  --card-bg: white;\n  --card-radius: 0.75rem;\n  background: var(--card-bg);\n  border-radius: var(--card-radius);\n}\n\n.card:hover {\n  --card-bg: #f0f0f0;\n  --card-radius: 1rem;\n  transition: all 300ms ease;\n}"
                  }
        ],
        tips: [
                  "@property with syntax validation prevents typos — browser warns if value doesn't match syntax.",
                  "inherits: true makes a custom property cascade like normal CSS properties.",
                  "Registered properties can be animated — var(--color) in an animation now works smoothly.",
                  "initial-value provides a fallback if the property is not set anywhere."
        ],
        mistake: "Not using @property and trying to animate custom properties with transition — doesn't work smoothly without @property registration.",
        shorthand: {
          verbose: ":root {\n  --primary: #3b82f6;\n  --primary: #60a5fa;  /* in dark mode */\n}",
          concise: "@property --primary {\n  syntax: \"<color>\";\n  initial-value: #3b82f6;\n  inherits: false;\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
