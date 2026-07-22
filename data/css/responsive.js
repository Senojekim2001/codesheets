export const meta = {
  "id": "responsive",
  "label": "Responsive Design",
  "icon": "📱",
  "description": "Responsive CSS: media queries, container queries, fluid typography, responsive images, and mobile-first patterns."
}

export const sections = [

  // ── Section 1: Media & Container Queries ─────────────────────────────────────────
  {
    id: "media-queries",
    title: "Media & Container Queries",
    entries: [
      {
        id: "media-query-fundamentals",
        fn: "Media Queries — Breakpoints & Mobile-First",
        desc: "Adapt layouts to screen size with media queries: mobile-first approach, standard breakpoints, and feature queries.",
        category: "Responsive",
        subtitle: "@media, min-width, max-width, prefers-color-scheme, @supports",
        signature: "@media (min-width: 768px) { }  |  @media (prefers-color-scheme: dark) { }",
        descLong: "Media queries apply styles conditionally based on viewport size, device features, or user preferences. Mobile-first uses min-width (start small, add complexity). Desktop-first uses max-width (start large, simplify). Standard breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl). Feature queries (@supports) test CSS property support. Preference queries detect dark mode, reduced motion, contrast preferences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Media Queries — Breakpoints & Mobile-First — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Mobile-first breakpoints (recommended) ──────── */\n/* Base styles = mobile (no media query needed) */\n.container {\n  padding: 1rem;\n  display: flex;\n  flex-direction: column;\n  gap: 1rem;\n}\n\n/* sm — 640px+ */\n@media (min-width: 640px) {\n  .container {\n    padding: 1.5rem;\n  }\n}\n\n/* md — 768px+ (tablets) */\n@media (min-width: 768px) {\n  .container {\n    flex-direction: row;\n    flex-wrap: wrap;\n    padding: 2rem;\n  }\n  .card { flex: 1 1 calc(50% - 0.5rem); }\n}\n\n/* lg — 1024px+ (laptops) */\n@media (min-width: 1024px) {\n  .container {\n    max-width: 1024px;\n    margin: 0 auto;\n  }\n  .card { flex: 1 1 calc(33.333% - 0.67rem); }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Media Queries — Breakpoints & Mobile-First — common patterns you'll see in production.\n// APPROACH  - Combine Media Queries — Breakpoints & Mobile-First with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* xl — 1280px+ (desktops) */\n@media (min-width: 1280px) {\n  .container { max-width: 1200px; }\n}\n\n/* ── Preference media queries ────────────────────── */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #1a1a2e;\n    --text: #e0e0e0;\n    --surface: #16213e;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * { animation-duration: 0.01ms !important; }\n}\n\n@media (prefers-contrast: high) {\n  :root { --border: 2px solid black; }\n}\n\n/* ── Combining conditions ────────────────────────── */\n@media (min-width: 768px) and (orientation: landscape) {\n  .sidebar { display: block; }\n}\n\n@media (hover: hover) and (pointer: fine) {\n  /* Desktop with mouse — show hover effects */\n  .button:hover { transform: scale(1.05); }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Media Queries — Breakpoints & Mobile-First — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@media (hover: none) {\n  /* Touch devices — no hover, larger tap targets */\n  .button { min-height: 44px; }\n}\n\n/* ── Feature queries (@supports) ─────────────────── */\n@supports (display: grid) {\n  .layout { display: grid; }\n}\n\n@supports (container-type: inline-size) {\n  .wrapper { container-type: inline-size; }\n}\n\n/* ── Range syntax (modern browsers) ──────────────── */\n@media (640px <= width < 1024px) {\n  /* Tablet range only */\n}\n\n@media (width >= 768px) {\n  /* Same as min-width: 768px */\n}"
                  }
        ],
        tips: [
                  "Mobile-first (min-width) is the standard approach — start with mobile styles, progressively enhance for larger screens.",
                  "(hover: hover) and (pointer: fine) targets desktop mouse users — use it to add hover effects only where appropriate.",
                  "The modern range syntax (640px <= width < 1024px) is cleaner than combining min-width and max-width — supported in all modern browsers.",
                  "prefers-color-scheme: dark + CSS custom properties = dark mode with minimal extra CSS."
        ],
        mistake: "Using max-width (desktop-first) and then overriding everything for mobile — this leads to more CSS and harder maintenance. Use min-width (mobile-first) and progressively add complexity.",
        shorthand: {
          verbose: "body { font-size: 14px; }\n@media (min-width: 768px) {\n  body { font-size: 16px; }\n}\n@media (min-width: 1024px) {\n  body { font-size: 18px; }\n}",
          concise: "body { font-size: clamp(14px, 2vw, 18px); }",
        },
      },
      {
        id: "container-queries",
        fn: "Container Queries — Component-Level Responsiveness",
        desc: "Adapt component layout based on parent container size, not viewport — truly reusable responsive components.",
        category: "Responsive",
        subtitle: "container-type, @container, container-name, cqi units",
        signature: "container-type: inline-size  |  @container (min-width: 400px) { }  |  cqi",
        descLong: "Container queries let components respond to their container size, not the viewport. This means a card component automatically switches from vertical to horizontal layout when placed in a wider container, regardless of screen size. Set container-type: inline-size on the parent, then use @container queries on children. Container query units (cqi, cqw, cqh) are relative to the container. This is the biggest CSS advancement for component-based design.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Container Queries — Component-Level Responsiveness — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Define a containment context ─────────────────── */\n.card-wrapper {\n  container-type: inline-size;\n  container-name: card;\n}\n\n/* ── Respond to container width ──────────────────── */\n.card {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n}\n\n.card-image {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n  border-radius: 0.5rem;\n}\n\n/* When container is 400px+ → horizontal layout */\n@container card (min-width: 400px) {\n  .card {\n    flex-direction: row;\n    align-items: center;\n  }\n  .card-image {\n    width: 40%;\n    aspect-ratio: 1;\n  }\n  .card-content {\n    flex: 1;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Container Queries — Component-Level Responsiveness — common patterns you'll see in production.\n// APPROACH  - Combine Container Queries — Component-Level Responsiveness with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* When container is 600px+ → featured layout */\n@container card (min-width: 600px) {\n  .card {\n    flex-direction: row;\n    gap: 1.5rem;\n  }\n  .card-image { width: 50%; }\n  .card-title { font-size: 1.5rem; }\n}\n\n/* ── Container query units ───────────────────────── */\n.responsive-text {\n  /* cqi = 1% of container inline size */\n  font-size: clamp(1rem, 3cqi, 2rem);\n  padding: 2cqi;\n}\n\n/* ── Unnamed container (matches nearest ancestor) ── */\n.sidebar {\n  container-type: inline-size;\n  /* no name — @container queries match this */\n}\n\n@container (min-width: 250px) {\n  .nav-item {\n    display: flex;\n    gap: 0.5rem;\n  }\n  .nav-label { display: inline; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Container Queries — Component-Level Responsiveness — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@container (max-width: 249px) {\n  .nav-item { text-align: center; }\n  .nav-label { display: none; }\n  /* Icons only in narrow sidebar */\n}\n\n/* ── Real-world: dashboard widget ────────────────── */\n.widget-container {\n  container-type: inline-size;\n  container-name: widget;\n}\n\n@container widget (min-width: 300px) {\n  .widget-stats { display: grid; grid-template-columns: 1fr 1fr; }\n}\n\n@container widget (min-width: 500px) {\n  .widget-stats { grid-template-columns: repeat(4, 1fr); }\n  .widget-chart { display: block; }\n}"
                  }
        ],
        tips: [
                  "container-type: inline-size measures width only — use it for most cases. container-type: size measures both width and height.",
                  "Container queries make truly reusable components — the same card works in a sidebar, main content, and full-width hero.",
                  "cqi units (1% of container width) replace viewport-relative sizing inside components — use with clamp() for fluid typography.",
                  "Container queries work with CSS Grid, Flexbox, and any layout — they just change when styles apply."
        ],
        mistake: "Using viewport media queries for component layout changes — a card in a sidebar needs different breakpoints than the same card in main content. Container queries solve this by responding to the parent, not the viewport.",
        shorthand: {
          verbose: ".card-wrapper {\n  container-type: inline-size;\n}\n@container (min-width: 400px) {\n  .card { grid-template-columns: 1fr 1fr; }\n}",
          concise: ".card-wrapper { container-type: inline-size; }\n@container (width > 400px) {\n  .card { grid-template-columns: 1fr 1fr; }\n}",
        },
      },
    ],
  },

  // ── Section 2: Fluid Typography & Images ─────────────────────────────────────────
  {
    id: "fluid-images",
    title: "Fluid Typography & Images",
    entries: [
      {
        id: "fluid-typography",
        fn: "Fluid Typography & Spacing with clamp()",
        desc: "Smoothly scale text and spacing between viewport sizes with clamp(), min(), max(), and viewport units.",
        category: "Fluid",
        subtitle: "clamp(), min(), max(), vw, rem, fluid scale, modular scale",
        signature: "clamp(min, preferred, max)  |  font-size: clamp(1rem, 2.5vw, 2rem)",
        descLong: "Fluid typography scales smoothly between a minimum and maximum size based on viewport width, eliminating abrupt breakpoint jumps. clamp(min, preferred, max) is the key function: the min and max are fixed sizes (rem), the preferred is viewport-relative (vw). This creates text that is readable on phones and appropriately large on desktops without any media queries. Apply the same pattern to spacing, padding, and gaps for fully fluid layouts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fluid Typography & Spacing with clamp() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Fluid typography with clamp() ────────────────── */\n:root {\n  /* clamp(minimum, preferred, maximum) */\n  --fs-sm:   clamp(0.875rem, 0.8rem + 0.25vw, 1rem);\n  --fs-base: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);\n  --fs-lg:   clamp(1.25rem, 1rem + 1vw, 1.75rem);\n  --fs-xl:   clamp(1.5rem, 1rem + 2vw, 2.5rem);\n  --fs-2xl:  clamp(2rem, 1rem + 3vw, 4rem);\n  --fs-hero: clamp(2.5rem, 1rem + 5vw, 6rem);\n}\n\nh1 { font-size: var(--fs-hero); }\nh2 { font-size: var(--fs-2xl); }\nh3 { font-size: var(--fs-xl); }\np  { font-size: var(--fs-base); }\n\n/* ── Fluid spacing ───────────────────────────────── */\n:root {\n  --space-xs:  clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem);\n  --space-sm:  clamp(0.5rem, 0.4rem + 0.5vw, 1rem);\n  --space-md:  clamp(1rem, 0.75rem + 1vw, 2rem);\n  --space-lg:  clamp(1.5rem, 1rem + 2vw, 3rem);\n  --space-xl:  clamp(2rem, 1rem + 3vw, 5rem);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fluid Typography & Spacing with clamp() — common patterns you'll see in production.\n// APPROACH  - Combine Fluid Typography & Spacing with clamp() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.section { padding: var(--space-xl) var(--space-md); }\n.card    { padding: var(--space-md); gap: var(--space-sm); }\n\n/* ── min() and max() ─────────────────────────────── */\n/* Container that's 90% of viewport but max 1200px */\n.container {\n  width: min(90%, 1200px);\n  margin: 0 auto;\n}\n\n/* Padding that's at least 1rem but grows with viewport */\n.hero {\n  padding: max(2rem, 5vh) max(1rem, 5vw);\n}\n\n/* ── Full fluid scale system ─────────────────────── */\n/* Utopia-style fluid scale (utopia.fyi) */\n/* Step -1: small text */\n.text-sm { font-size: clamp(0.8rem, 0.77rem + 0.17vw, 0.89rem); }\n/* Step 0: body text */\n.text-base { font-size: clamp(1rem, 0.96rem + 0.22vw, 1.13rem); }\n/* Step 1: large text */\n.text-lg { font-size: clamp(1.25rem, 1.19rem + 0.29vw, 1.41rem); }\n/* Step 2: headings */\n.text-xl { font-size: clamp(1.56rem, 1.48rem + 0.42vw, 1.78rem); }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fluid Typography & Spacing with clamp() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Responsive grid without media queries ───────── */\n.auto-grid {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fill,\n    minmax(min(250px, 100%), 1fr)\n  );\n  gap: var(--space-md);\n}\n/* Cards auto-wrap: 1 column on mobile, 2-3-4 as space allows */"
                  }
        ],
        tips: [
                  "clamp(1rem, 0.5rem + 2vw, 3rem) gives smooth scaling — the middle value (vw-based) controls the rate of change.",
                  "utopia.fyi generates fluid type and spacing scales — paste the CSS custom properties directly into your project.",
                  "min(90%, 1200px) replaces max-width + width: 100% — one line for a responsive container.",
                  "grid with auto-fill + minmax(min(250px, 100%), 1fr) creates a responsive grid with zero media queries."
        ],
        mistake: "Using vw units alone for font-size (font-size: 5vw) — text becomes unreadably small on mobile and huge on desktop. Always use clamp() to set minimum and maximum bounds.",
        shorthand: {
          verbose: "h1 {\n  font-size: 1.5rem;\n}\n@media (min-width: 768px) {\n  h1 { font-size: 2rem; }\n}\n@media (min-width: 1024px) {\n  h1 { font-size: 2.5rem; }\n}",
          concise: "h1 { font-size: clamp(1.5rem, 5vw, 2.5rem); }",
        },
      },
      {
        id: "responsive-images",
        fn: "Responsive Images — srcset, sizes & picture",
        desc: "Serve optimal images for every device: resolution switching with srcset, art direction with picture, and modern formats.",
        category: "Images",
        subtitle: "srcset, sizes, picture, source, loading=lazy, aspect-ratio",
        signature: "<img srcset=\"sm.jpg 400w, lg.jpg 800w\" sizes=\"(max-width: 768px) 100vw, 50vw\">",
        descLong: "Responsive images serve different files based on viewport size and pixel density. srcset with w descriptors lists available image widths. sizes tells the browser how wide the image will be displayed. The browser picks the optimal file. <picture> with <source> enables art direction (different crops) and format selection (WebP/AVIF with fallback). loading=\"lazy\" defers off-screen images. aspect-ratio prevents layout shift during loading.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Responsive Images — srcset, sizes & picture — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- Resolution switching with srcset + sizes -->\n<img\n  srcset=\"\n    hero-400.jpg   400w,\n    hero-800.jpg   800w,\n    hero-1200.jpg 1200w,\n    hero-1600.jpg 1600w\n  \"\n  sizes=\"\n    (max-width: 640px) 100vw,\n    (max-width: 1024px) 75vw,\n    50vw\n  \"\n  src=\"hero-800.jpg\"\n  alt=\"Hero image\"\n  loading=\"lazy\"\n  decoding=\"async\"\n  width=\"800\"\n  height=\"450\"\n/>\n\n<!-- Art direction with picture (different crops) -->\n<picture>\n  <!-- Mobile: square crop -->\n  <source\n    media=\"(max-width: 640px)\"\n    srcset=\"hero-mobile.jpg\"\n  />\n  <!-- Tablet: wide crop -->\n  <source\n    media=\"(max-width: 1024px)\"\n    srcset=\"hero-tablet.jpg\"\n  />\n  <!-- Desktop: full panoramic -->\n  <img src=\"hero-desktop.jpg\" alt=\"Hero\" />\n</picture>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Responsive Images — srcset, sizes & picture — common patterns you'll see in production.\n// APPROACH  - Combine Responsive Images — srcset, sizes & picture with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<!-- Modern formats with fallback -->\n<picture>\n  <source type=\"image/avif\" srcset=\"photo.avif\" />\n  <source type=\"image/webp\" srcset=\"photo.webp\" />\n  <img src=\"photo.jpg\" alt=\"Photo\" />\n</picture>\n\n<!-- CSS: prevent layout shift -->\n<style>\nimg {\n  max-width: 100%;\n  height: auto;\n  aspect-ratio: 16 / 9;      /* reserve space before load */\n  object-fit: cover;\n  background: #f0f0f0;       /* placeholder color */\n}\n\n/* Responsive background image */\n.hero-bg {\n  background-image: url('hero-800.jpg');\n  background-size: cover;\n  background-position: center;\n}\n\n@media (min-width: 1200px) {\n  .hero-bg {\n    background-image: url('hero-1600.jpg');\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Responsive Images — srcset, sizes & picture — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Modern: image-set() for CSS backgrounds */\n.hero-bg {\n  background-image: image-set(\n    url('hero.avif') type('image/avif'),\n    url('hero.webp') type('image/webp'),\n    url('hero.jpg') type('image/jpeg')\n  );\n}\n</style>"
                  }
        ],
        tips: [
                  "Always set width and height attributes on <img> — the browser calculates aspect-ratio to prevent layout shift (CLS).",
                  "sizes tells the browser how wide the image displays — without it, the browser assumes 100vw and may download too-large images.",
                  "AVIF is 50% smaller than JPEG, WebP is 25-30% smaller — use <picture> to serve modern formats with JPEG fallback.",
                  "loading=\"lazy\" + decoding=\"async\" defers off-screen images — but do NOT lazy-load above-the-fold (hero) images."
        ],
        mistake: "Using srcset without sizes — the browser defaults to sizes=\"100vw\" which means it downloads the largest image even if the display area is only 50% of the viewport. Always specify sizes.",
        shorthand: {
          verbose: "<img src=\"small.jpg\" alt=\"\">\n<img src=\"medium.jpg\" alt=\"\" media=\"(min-width: 768px)\">\n<img src=\"large.jpg\" alt=\"\" media=\"(min-width: 1024px)\">",
          concise: "<img src=\"large.jpg\" srcset=\"small.jpg 480w, medium.jpg 768w\" alt=\"\">",
        },
      },
      {
        id: "aspect-ratio",
        fn: "aspect-ratio Property — Maintain Proportions",
        desc: "Reserve space for images and videos: aspect-ratio prevents layout shift, works with object-fit.",
        category: "Layout",
        subtitle: "aspect-ratio, 16/9, object-fit, intrinsic sizing, layout shift prevention",
        signature: "aspect-ratio: 16 / 9  |  aspect-ratio: 1  |  aspect-ratio: auto",
        descLong: "aspect-ratio reserves space for images/videos before loading, preventing layout shift (CLS metric). Set it on containers or images themselves. 16/9 for video, 1 for square, 4/3 for older content. pair with object-fit: cover for cropped images or object-fit: contain for full images. aspect-ratio: auto works with sized images.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of aspect-ratio Property — Maintain Proportions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Video container ────────────────────────────── */\n.video-container {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  background: #000;\n  overflow: hidden;\n}\n\n.video-container iframe {\n  width: 100%;\n  height: 100%;\n}\n\n/* ── Image gallery with consistent sizes ────── */\n.image-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n.image-item {\n  aspect-ratio: 4 / 3;\n  overflow: hidden;\n  border-radius: 0.5rem;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of aspect-ratio Property — Maintain Proportions — common patterns you'll see in production.\n// APPROACH  - Combine aspect-ratio Property — Maintain Proportions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.image-item img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n/* ── Profile picture (square) ────────────────── */\n.avatar {\n  width: 100px;\n  aspect-ratio: 1;\n  border-radius: 50%;\n  object-fit: cover;\n}\n\n/* ── Responsive aspect ratio ────────────────── */\n.hero-image {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n  background: #f0f0f0;  /* placeholder color */\n}\n\n/* Different aspect on mobile */\n@media (max-width: 768px) {\n  .hero-image {\n    aspect-ratio: 3 / 2;  /* taller on mobile */\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of aspect-ratio Property — Maintain Proportions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── With intrinsic dimensions ────────────────– */\n.card-image {\n  width: 100%;\n  aspect-ratio: 3 / 2;\n  object-fit: cover;\n  background: linear-gradient(135deg, #f0f0f0 25%, transparent 25%);\n}\n\n/* ── Auto aspect ratio (maintains natural size) – */\n.natural-image {\n  width: 100%;\n  aspect-ratio: auto;\n  object-fit: contain;\n  max-height: 500px;\n}"
                  }
        ],
        tips: [
                  "Always set aspect-ratio on image containers — prevents layout shift (CLS) and improves perceived performance.",
                  "object-fit: cover crops the image to fill the space (common for galleries). object-fit: contain fits the whole image.",
                  "Responsive aspect-ratio: different ratios on mobile/desktop with media queries.",
                  "aspect-ratio works with any element, not just images — perfect for placeholder loading states."
        ],
        mistake: "Setting only width on images without aspect-ratio — content reflows as the image loads, causing layout shift.",
        shorthand: {
          verbose: "<style>\n.image {\n  width: 100%;\n  height: 300px;\n  overflow: hidden;\n}\n</style>",
          concise: "<style>\n.image {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n}\n</style>",
        },
      },
      {
        id: "logical-properties",
        fn: "Logical Properties — LTR/RTL Aware Spacing",
        desc: "Write CSS that works in any text direction: margin-inline, padding-block, border-start.",
        category: "Responsive",
        subtitle: "margin-inline, padding-block, inset, border-inline-start, writing-mode",
        signature: "margin-inline: 1rem  |  padding-block-end: 2rem  |  border-inline-start: 1px",
        descLong: "Logical properties use inline (left-right in LTR, right-left in RTL) and block (top-bottom) axes instead of absolute directions. margin-left becomes margin-inline-start. This makes CSS automatically adapt to writing direction without media queries. Essential for international sites supporting RTL languages (Arabic, Hebrew).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Logical Properties — LTR/RTL Aware Spacing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Logical properties ────────────────────────── */\n.card {\n  /* Instead of margin-left and margin-right */\n  margin-inline: 1rem;\n\n  /* Instead of margin-top and margin-bottom */\n  margin-block: 1rem;\n\n  /* Instead of padding-left and padding-right */\n  padding-inline: 1.5rem;\n\n  /* Instead of padding-top and padding-bottom */\n  padding-block: 1.5rem;\n}\n\n/* ── Logical borders ───────────────────────── */\n.sidebar {\n  /* Border on left in LTR, right in RTL */\n  border-inline-end: 2px solid #3b82f6;\n  padding-inline-end: 1rem;\n}\n\n.input-group {\n  /* Border on right in LTR, left in RTL */\n  border-inline-start: 1px solid #d1d5db;\n}\n\n/* ── Inset (logical positioning) ────────────– */\n.overlay {\n  position: absolute;\n  inset: 0;  /* top: 0; right: 0; bottom: 0; left: 0 */\n}\n\n.popup {\n  position: absolute;\n  inset-inline: auto;     /* left and right in LTR */\n  inset-block-start: 1rem;  /* top */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Logical Properties — LTR/RTL Aware Spacing — common patterns you'll see in production.\n// APPROACH  - Combine Logical Properties — LTR/RTL Aware Spacing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Logical sizing (width/height variants) –– */\n.flex-item {\n  /* Content-based width (horizontal) */\n  inline-size: 100%;\n\n  /* Content-based height (vertical) */\n  block-size: auto;\n}\n\n/* ── Full logical equivalent ────────────────– */\n/* Old way (absolute directions) */\n.button {\n  margin-left: 1rem;\n  margin-right: 1rem;\n  margin-top: 0.5rem;\n  margin-bottom: 0.5rem;\n  padding-left: 1.5rem;\n  padding-right: 1.5rem;\n  border-left: 1px solid #d1d5db;\n}\n\n/* New way (logical directions) */\n.button {\n  margin-inline: 1rem;\n  margin-block: 0.5rem;\n  padding-inline: 1.5rem;\n  border-inline-start: 1px solid #d1d5db;\n}\n\n/* ── RTL support automatically ────────────── */\nhtml[dir=\"rtl\"] {\n  /* No need to rewrite CSS! Logical properties auto-flip */\n}\n\n/* ── Text alignment with logical properties – */\n.text-start {\n  text-align: start;  /* left in LTR, right in RTL */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Logical Properties — LTR/RTL Aware Spacing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.text-end {\n  text-align: end;    /* right in LTR, left in RTL */\n}\n\n/* ── Grid with logical properties ──────────– */\n.grid {\n  display: grid;\n  gap: 1rem;\n  grid-template-columns: auto 1fr;  /* still works */\n}\n\n.grid-item {\n  /* Space on the inline-start (left/right) */\n  margin-inline-start: auto;\n}\n\n/* ── Complete responsive card (logical) ───– */\n.card {\n  padding-block: 1.5rem;\n  padding-inline: 1.5rem;\n  border-inline-start: 4px solid #3b82f6;\n  margin-block-end: 1rem;\n}\n\n.card-header {\n  margin-block-end: 1rem;\n  padding-inline-end: 0;\n}\n\n.card-title {\n  margin-block: 0;\n  text-align: start;\n}"
                  }
        ],
        tips: [
                  "margin-inline covers both left/right. margin-block covers top/bottom. Much cleaner than four separate rules.",
                  "border-inline-start is left in LTR, right in RTL — perfect for visual emphasis.",
                  "Set dir=\"rtl\" on html and logical properties automatically flip — no CSS changes needed.",
                  "text-align: start/end is better than left/right — respects the document direction."
        ],
        mistake: "Using left/right/top/bottom properties in international projects — breaks RTL layouts. Use logical properties instead.",
        shorthand: {
          verbose: "margin-left: 1rem;\nmargin-right: 1rem;\nmargin-top: 0.5rem;\nmargin-bottom: 0.5rem;",
          concise: "margin-inline: 1rem;\nmargin-block: 0.5rem;",
        },
      },
      {
        id: "viewport-units",
        fn: "Modern Viewport Units — dvh, svh, lvh, cqw",
        desc: "Use dynamic viewport units for mobile: dvh accounts for address bar, cqw for container-relative.",
        category: "Responsive",
        subtitle: "dvh, svh, lvh, 100vh, cqw, cqh, mobile viewport",
        signature: "height: 100dvh  |  height: 100svh  |  width: 50cqw",
        descLong: "100vh on mobile includes the address bar, making it taller than the visible area. dvh (dynamic viewport height) accounts for UI chrome. svh (small viewport height) is fixed size. lvh (large viewport height) is consistent. cqw (container query width) is 1% of container width. Use dvh for full-screen layouts, cqw inside container queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modern Viewport Units — dvh, svh, lvh, cqw — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── 100vh problem on mobile ──────────────────── */\n/* Old way — 100vh includes address bar on mobile */\n.hero {\n  height: 100vh;\n  /* On mobile, content gets cut off or scrolls unexpectedly */\n}\n\n/* ── Modern solution: dvh (dynamic viewport height) */\n.hero {\n  height: 100dvh;\n  /* Accounts for address bar, perfect height on mobile */\n}\n\n/* ── Fallback for older browsers ──────────── */\n.hero {\n  height: 100vh;           /* fallback */\n  height: 100dvh;          /* modern browsers */\n}\n\n/* ── Viewport unit variants ──────────────── */\n.small-height {\n  height: 100svh;          /* small viewport height (without address bar) */\n}\n\n.large-height {\n  height: 100lvh;          /* large viewport height (with address bar) */\n}\n\n.dynamic-height {\n  height: 100dvh;          /* dynamic (changes with address bar visibility) */\n}\n\n/* ── Full-screen landing page with dvh ────– */\n.fullpage-section {\n  height: 100dvh;\n  width: 100%;\n  display: grid;\n  place-items: center;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modern Viewport Units — dvh, svh, lvh, cqw — common patterns you'll see in production.\n// APPROACH  - Combine Modern Viewport Units — dvh, svh, lvh, cqw with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.fullpage-section:nth-child(1) {\n  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n}\n\n.fullpage-section:nth-child(2) {\n  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);\n}\n\n/* ── Flexible height: minimum dvh ──────────– */\n.hero {\n  min-height: 100dvh;      /* at least full height */\n}\n\n/* ── Container query units (cqw) ──────────– */\n.container {\n  container-type: inline-size;\n}\n\n.container-item {\n  width: 100cqw;           /* 100% of container width */\n  padding: 5cqw;           /* 5% of container width padding */\n  font-size: clamp(1rem, 5cqw, 3rem);  /* fluid sizing in container */\n}\n\n/* ── Combining viewport and container units – */\n.responsive-box {\n  width: min(100%, 80vw);  /* 80% viewport width, but not more than 100% */\n  height: 50dvh;           /* 50% of dynamic viewport height */\n}\n\n/* ── Mobile full-screen modal with dvh ────– */\n.modal {\n  position: fixed;\n  inset: 0;\n  display: flex;\n  flex-direction: column;\n  background: white;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modern Viewport Units — dvh, svh, lvh, cqw — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.modal-header {\n  padding: 1rem;\n  border-bottom: 1px solid #e2e8f0;\n}\n\n.modal-body {\n  flex: 1;\n  overflow-y: auto;\n  /* Takes remaining height accounting for address bar */\n}\n\n/* ── Different units for different contexts – */\nbody {\n  height: 100dvh;          /* body fills viewport with address bar */\n}\n\n.scroll-container {\n  height: 100svh;          /* fixed height, doesn't change */\n}\n\n.flex-container {\n  min-height: 100lvh;      /* at least large viewport height */\n}\n\n.query-box {\n  width: 25cqw;            /* 25% of container width */\n  height: 50cqh;           /* 50% of container height */\n}"
                  }
        ],
        tips: [
                  "100dvh on mobile accounts for the address bar — use this for hero sections, full-screen modals.",
                  "svh is fixed, dvh is dynamic (changes when address bar appears/disappears), lvh is max size.",
                  "Container query units (cqw, cqh) are relative to the container, not viewport — use inside @container.",
                  "Always provide fallback: height: 100vh; height: 100dvh; for older browser support."
        ],
        mistake: "Using 100vh for mobile hero sections without accounting for address bar — content gets cut off. Use 100dvh instead.",
        shorthand: {
          verbose: "/* Multiple rules for viewport heights */\nheight: 100vh;\nheight: 100dvh;\nheight: 100svh;",
          concise: "/* Use dvh for mobile-friendly full-screen */\nheight: 100dvh;",
        },
      },
      {
        id: "media-features",
        fn: "Advanced Media Features — Color Scheme, Motion, Contrast",
        desc: "Detect user preferences: prefers-color-scheme, prefers-reduced-motion, prefers-contrast, hover.",
        category: "Responsive",
        subtitle: "prefers-color-scheme, prefers-reduced-motion, prefers-contrast, hover, pointer",
        signature: "@media (prefers-color-scheme: dark) { }  |  @media (prefers-reduced-motion: reduce) { }",
        descLong: "Media features query device/user settings, not just screen size. prefers-color-scheme: dark/light detects OS dark mode. prefers-reduced-motion: reduce disables animations for users with motion sensitivity. prefers-contrast: more highlights accessibility needs. hover/pointer detect device capabilities. Use these to respect user preferences without requiring settings UI.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Media Features — Color Scheme, Motion, Contrast — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Dark mode detection ────────────────────────── */\n@media (prefers-color-scheme: light) {\n  :root {\n    --bg: #ffffff;\n    --text: #1a1a1a;\n    --border: #e2e8f0;\n  }\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #1a1a1a;\n    --text: #ffffff;\n    --border: #333333;\n  }\n}\n\nbody {\n  background: var(--bg);\n  color: var(--text);\n}\n\n/* ── Reduced motion detection ────────────────– */\n/* Default: animations enabled */\n.button {\n  transition: all 200ms ease;\n}\n\n.button:hover {\n  transform: translateY(-2px);\n}\n\n/* User prefers reduced motion: disable animations */\n@media (prefers-reduced-motion: reduce) {\n  * {\n    animation-duration: 0.01ms !important;\n    animation-iteration-count: 1 !important;\n    transition-duration: 0.01ms !important;\n  }\n\n  .button {\n    transition: none;\n  }\n\n  .button:hover {\n    transform: none;\n  }\n}\n\n/* ── Better: respect motion preference ────── */\n@media (prefers-reduced-motion: no-preference) {\n  .button {\n    transition: all 200ms ease;\n  }\n\n  .button:hover {\n    transform: translateY(-2px);\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Media Features — Color Scheme, Motion, Contrast — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Media Features — Color Scheme, Motion, Contrast with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Contrast preferences ────────────────── */\n@media (prefers-contrast: more) {\n  /* Increase contrast for accessibility */\n  :root {\n    --border: #000000;     /* darker border */\n  }\n\n  .card {\n    border: 2px solid var(--border);\n  }\n}\n\n@media (prefers-contrast: less) {\n  /* Reduce contrast for certain users */\n  :root {\n    --border: #cccccc;\n  }\n}\n\n/* ── Hover capability detection ──────────── */\n@media (hover: hover) and (pointer: fine) {\n  /* Desktop with mouse — show hover effects */\n  .link {\n    text-decoration: none;\n  }\n\n  .link:hover {\n    text-decoration: underline;\n    color: #3b82f6;\n  }\n}\n\n@media (hover: none) {\n  /* Touch devices — no hover effects */\n  .link {\n    text-decoration: underline;\n  }\n\n  .button {\n    min-height: 44px;      /* larger touch targets */\n  }\n}\n\n/* ── Pointer type (fine vs coarse) ──────── */\n@media (pointer: fine) {\n  /* Mouse or stylus — small targets ok */\n  .icon-button {\n    width: 24px;\n    height: 24px;\n  }\n}\n\n@media (pointer: coarse) {\n  /* Touch — need bigger targets */\n  .icon-button {\n    width: 44px;\n    height: 44px;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Media Features — Color Scheme, Motion, Contrast — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Combining multiple features ────────── */\n@media (prefers-color-scheme: dark) and (prefers-contrast: more) {\n  /* Dark mode with high contrast request */\n  :root {\n    --bg: #000000;         /* pure black */\n    --text: #ffffff;       /* pure white */\n  }\n}\n\n@media (prefers-reduced-motion: reduce) and (hover: none) {\n  /* Touch device that prefers reduced motion */\n  * {\n    animation-duration: 0.01ms;\n  }\n}\n\n/* ── Complete responsive design with features */\n.card {\n  padding: 1.5rem;\n  background: var(--bg);\n  color: var(--text);\n  border: 1px solid var(--border);\n  border-radius: 0.75rem;\n  transition: box-shadow 200ms ease;\n}\n\n@media (hover: hover) {\n  .card:hover {\n    box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .card {\n    transition: none;\n  }\n}\n\n/* ── Light/dark mode with custom properties – */\n@media (prefers-color-scheme: dark) {\n  .card {\n    background: light-dark(white, #1a1a1a);\n    color: light-dark(#1a1a1a, white);\n  }\n}"
                  }
        ],
        tips: [
                  "prefers-color-scheme: dark/light works with CSS custom properties — one set of vars for both themes.",
                  "prefers-reduced-motion: reduce is critical accessibility — always respect it.",
                  "hover: hover + pointer: fine targets desktop with mouse — use for subtle hover effects.",
                  "hover: none targets touch devices — don't rely on hover states, ensure content is accessible without them."
        ],
        mistake: "Not testing prefers-reduced-motion — users with motion sensitivity experience discomfort. Always provide a no-motion version.",
        shorthand: {
          verbose: "@media (prefers-color-scheme: light) { ... }\n@media (prefers-color-scheme: dark) { ... }\n@media (prefers-reduced-motion: reduce) { ... }",
          concise: "@media (prefers-color-scheme: dark) { --bg: #1a1a1a; }\n@media (prefers-reduced-motion: reduce) { * { animation: none; } }",
        },
      },
    ],
  },

  // ── Section 3: Advanced Responsive Patterns ─────────────────────────────────────────
  {
    id: "additional-responsive",
    title: "Advanced Responsive Patterns",
    entries: [
      {
        id: "responsive-grid",
        fn: "Responsive Grid Patterns — auto-fill, auto-fit, minmax",
        desc: "Create responsive grids without media queries: auto-fill, auto-fit, minmax for flexible layouts.",
        category: "Grid",
        subtitle: "auto-fill, auto-fit, minmax(), grid-template-columns, responsive without breakpoints",
        signature: "grid-template-columns: repeat(auto-fill, minmax(250px, 1fr))",
        descLong: "CSS Grid repeat() with auto-fill or auto-fit and minmax() creates fully responsive grids without media queries. auto-fill creates tracks even if empty. auto-fit collapses empty tracks. minmax(min, max) sets flexible item sizes. This pattern adapts from 1 to N columns based on available space.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Responsive Grid Patterns — auto-fill, auto-fit, minmax — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Auto-fill with minmax (basic pattern) ──────── */\n.gallery {\n  display: grid;\n  gap: 1rem;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n}\n\n/* Mobile: 1 column (if viewport < 250px, items shrink to fit)\n   300px+: 1 column\n   500px+: 2 columns\n   750px+: 3 columns\n   1000px+: 4 columns\n   All automatic!\n*/\n\n/* ── auto-fill vs auto-fit ──────────────────── */\n.grid-fill {\n  /* auto-fill: creates empty tracks if needed */\n  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));\n}\n\n.grid-fit {\n  /* auto-fit: collapses empty tracks */\n  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));\n}\n\n/* auto-fit usually looks better — no empty space on the right */\n\n/* ── Responsive card grid ────────────────────── */\n.card-grid {\n  display: grid;\n  gap: 1.5rem;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(300px, 100%), 1fr)\n  );\n}\n\n.card {\n  padding: 1.5rem;\n  background: white;\n  border-radius: 0.75rem;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}\n\n/* Mobile: 1 column (cards full width)\n   768px+: 2 columns\n   1024px+: 3 columns\n   Automatically!\n*/"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Responsive Grid Patterns — auto-fill, auto-fit, minmax — common patterns you'll see in production.\n// APPROACH  - Combine Responsive Grid Patterns — auto-fill, auto-fit, minmax with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Minmax with clamp ──────────────────────── */\n.responsive-grid {\n  display: grid;\n  gap: 1rem;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(clamp(200px, 30vw, 400px), 1fr)\n  );\n}\n\n/* Items: 200px minimum, 30vw preferred (fluid), 400px maximum */\n\n/* ── Sidebar layout without media queries ──── */\n.sidebar-layout {\n  display: grid;\n  gap: 2rem;\n  grid-template-columns: minmax(0, 1fr) minmax(250px, 300px);\n}\n\n.main { /* takes remaining space */ }\n.sidebar { /* fixed ~300px width */ }\n\n/* On small screens, items stack (not ideal) */\n/* Better with auto-fit: */\n\n.sidebar-layout {\n  display: grid;\n  gap: 2rem;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(250px, 100%), 1fr)\n  );\n}\n\n/* Mobile: full width\n   Desktop: side by side\n*/\n\n/* ── Product grid with consistent gaps ─────– */\n.product-grid {\n  display: grid;\n  gap: 1.5rem;\n  grid-template-columns: repeat(\n    auto-fill,\n    minmax(180px, 1fr)\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Responsive Grid Patterns — auto-fill, auto-fit, minmax — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.product {\n  aspect-ratio: 3 / 4;\n  border-radius: 0.5rem;\n  overflow: hidden;\n  background: #f0f0f0;\n}\n\n/* ── Multi-row auto-layout ──────────────────– */\n.flex-grid {\n  display: grid;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(100px, 100%), 150px)\n  );\n  gap: 1rem;\n}\n\n/* Items: minimum 100px (or 100% if less space), preferred 150px */\n\n/* ── Combining with :has() for dynamic layouts – */\n.grid-adaptive {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\n/* Adjust grid if container is very wide */\n.grid-adaptive:has(> :nth-child(5)) {\n  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));\n}\n\n/* ── Fit-content for max-width without fixed size */\n.container {\n  display: grid;\n  grid-template-columns:\n    1fr\n    min(90%, 1200px)\n    1fr;\n}\n\n.container > * {\n  grid-column: 2;  /* content in middle track */\n}"
                  }
        ],
        tips: [
                  "repeat(auto-fit, minmax(250px, 1fr)) is the magic responsive grid pattern — no media queries needed.",
                  "auto-fit collapses empty tracks (usually looks better). auto-fill leaves them visible.",
                  "min(300px, 100%) ensures items never go below 300px but don't overflow on tiny screens.",
                  "Pair with gap for consistent spacing — no need to calculate grid gutter math."
        ],
        mistake: "Using fixed column counts (grid-template-columns: 1fr 1fr 1fr) instead of auto-fit — requires media queries to change.",
        shorthand: {
          verbose: "@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n}\n@media (min-width: 769px) {\n  .grid { grid-template-columns: 1fr 1fr; }\n}\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: 1fr 1fr 1fr; }\n}",
          concise: ".grid {\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n}",
        },
      },
      {
        id: "responsive-layout-patterns",
        fn: "Common Responsive Layouts — Holy Grail, Sidebar, Sticky Footer",
        desc: "Build common layouts with CSS Grid and Flexbox: full-height layout, sidebar, card grid, sticky footer.",
        category: "Patterns",
        subtitle: "Holy Grail layout, sidebar layout, sticky footer, grid, flexbox",
        signature: "display: grid | flexbox  |  grid-template-rows/columns  |  gap",
        descLong: "Proven responsive layout patterns built with modern CSS Grid and Flexbox. Holy Grail (header, content, footer) uses grid-template-rows. Sidebar layout uses minmax() for flexible content. Sticky footer stays at bottom even with little content. Card grids use auto-fit. All adapt smoothly from mobile to desktop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Common Responsive Layouts — Holy Grail, Sidebar, Sticky Footer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Holy Grail Layout (header, main, footer) ──── */\nbody {\n  display: grid;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100dvh;\n  gap: 0;\n}\n\nheader {\n  grid-row: 1;\n  background: #2c3e50;\n  color: white;\n  padding: 1rem;\n}\n\nmain {\n  grid-row: 2;\n  overflow-y: auto;\n}\n\nfooter {\n  grid-row: 3;\n  background: #34495e;\n  color: white;\n  padding: 2rem;\n  text-align: center;\n}\n\n/* ── Sidebar + Content Layout ────────────────– */\n.layout {\n  display: grid;\n  grid-template-columns: 250px 1fr;\n  min-height: 100dvh;\n  gap: 0;\n}\n\n.sidebar {\n  background: #f8f9fa;\n  padding: 1.5rem;\n  overflow-y: auto;\n  border-right: 1px solid #e2e8f0;\n}\n\n.content {\n  padding: 2rem;\n  overflow-y: auto;\n}\n\n/* Responsive: stack on mobile */\n@media (max-width: 768px) {\n  .layout {\n    grid-template-columns: 1fr;\n  }\n\n  .sidebar {\n    position: fixed;\n    width: 250px;\n    left: -250px;\n    height: 100dvh;\n    transition: left 300ms ease;\n    z-index: 1000;\n  }\n\n  .sidebar.open {\n    left: 0;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Common Responsive Layouts — Holy Grail, Sidebar, Sticky Footer — common patterns you'll see in production.\n// APPROACH  - Combine Common Responsive Layouts — Holy Grail, Sidebar, Sticky Footer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Sticky Footer (footer stays at bottom) ──– */\n.wrapper {\n  display: flex;\n  flex-direction: column;\n  min-height: 100dvh;\n}\n\n.content {\n  flex: 1;  /* grows to fill space */\n}\n\nfooter {\n  flex-shrink: 0;  /* stays full height */\n  background: #2c3e50;\n  padding: 2rem;\n}\n\n/* ── Card Grid Pattern ──────────────────────── */\n.card-container {\n  display: grid;\n  gap: 1.5rem;\n  grid-template-columns: repeat(\n    auto-fit,\n    minmax(min(300px, 100%), 1fr)\n  );\n  padding: 2rem;\n}\n\n.card {\n  border-radius: 0.75rem;\n  overflow: hidden;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n  display: flex;\n  flex-direction: column;\n}\n\n.card-image {\n  width: 100%;\n  aspect-ratio: 16 / 9;\n  object-fit: cover;\n}\n\n.card-body {\n  padding: 1.5rem;\n  flex: 1;\n  display: flex;\n  flex-direction: column;\n}\n\n.card-title {\n  margin: 0 0 0.5rem 0;\n  font-size: 1.125rem;\n  font-weight: 600;\n}\n\n.card-text {\n  margin: 0;\n  color: #6b7280;\n  flex: 1;\n}\n\n/* ── Dashboard with 12-column grid ──────────– */\n.dashboard {\n  display: grid;\n  gap: 1.5rem;\n  grid-template-columns: repeat(12, 1fr);\n  padding: 2rem;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Common Responsive Layouts — Holy Grail, Sidebar, Sticky Footer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.widget {\n  padding: 1.5rem;\n  background: white;\n  border-radius: 0.75rem;\n  box-shadow: 0 1px 3px rgba(0,0,0,0.1);\n}\n\n.widget-full { grid-column: span 12; }      /* full width */\n.widget-half { grid-column: span 6; }       /* 50% width */\n.widget-third { grid-column: span 4; }      /* 33% width */\n.widget-quarter { grid-column: span 3; }    /* 25% width */\n\n/* Responsive: collapse to 1 column */\n@media (max-width: 1024px) {\n  .widget-half { grid-column: span 12; }\n  .widget-third { grid-column: span 12; }\n  .widget-quarter { grid-column: span 12; }\n}\n\n/* ── Centered container with max-width ────– */\n.container {\n  display: grid;\n  grid-template-columns: 1fr min(90%, 1200px) 1fr;\n  gap: 1rem;\n}\n\n.container > * {\n  grid-column: 2;  /* all children in the middle */\n}\n\n/* ── Navigation + Content ────────────────── */\n.page-layout {\n  display: grid;\n  grid-template-areas:\n    \"header\"\n    \"nav\"\n    \"main\"\n    \"footer\";\n  min-height: 100dvh;\n}\n\nheader { grid-area: header; }\nnav { grid-area: nav; }\nmain { grid-area: main; flex: 1; }\nfooter { grid-area: footer; }\n\n/* Desktop: side-by-side */\n@media (min-width: 768px) {\n  .page-layout {\n    grid-template-columns: 200px 1fr;\n    grid-template-areas:\n      \"header header\"\n      \"nav main\"\n      \"footer footer\";\n  }\n}"
                  }
        ],
        tips: [
                  "Holy Grail: min-height: 100dvh on body + grid-template-rows: auto 1fr auto ensures footer sticks.",
                  "Sidebar layout uses grid-template-columns with fixed + flexible: 250px 1fr. Adjust the fixed width as needed.",
                  "Card grid with repeat(auto-fit, minmax(...)) adapts column count automatically.",
                  "sticky footer with flex: 1 on content keeps footer at bottom even with minimal content."
        ],
        mistake: "Using fixed heights instead of min-height or flexible layouts — breaks on different content/viewport sizes.",
        shorthand: {
          verbose: "<div style=\"display: flex; flex-direction: column; height: 100vh;\">\n  <header></header>\n  <main style=\"flex: 1;\"></main>\n  <footer></footer>\n</div>",
          concise: "body {\n  display: grid;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100dvh;\n}",
        },
      },
      {
        id: "print-styles",
        fn: "@media print — Print-Friendly Styling",
        desc: "Optimize CSS for printing: hide navigation, adjust colors, control page breaks.",
        category: "Media",
        subtitle: "@media print, page-break-*, @page, print-specific colors",
        signature: "@media print { }  |  page-break-after: avoid  |  @page { size: A4 }",
        descLong: "@media print applies styles only when printing to PDF or paper. Hide navigation, adjust colors (dark backgrounds won't print well), enable page breaks. Use page-break-before: avoid on headings, page-break-inside: avoid on content blocks. @page sets page size, margins. This ensures printouts are readable and professional.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @media print — Print-Friendly Styling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Print-friendly styles ──────────────────────── */\n@media print {\n  /* Hide interactive elements */\n  nav, .sidebar, header, footer { display: none; }\n\n  /* Remove box shadows for print */\n  * { box-shadow: none; }\n\n  /* Adjust text color for printing */\n  body {\n    color: black;\n    background: white;\n  }\n\n  /* Dark backgrounds become unreadable in print */\n  .dark-card {\n    background: white;\n    border: 1px solid #cccccc;\n  }\n\n  /* Remove link underlines for cleaner print */\n  a { text-decoration: none; }\n\n  /* Add URL after links for reference */\n  a[href]:after { content: \" (\" attr(href) \")\"; }\n\n  /* Make print layout single column */\n  .layout {\n    grid-template-columns: 1fr;\n  }\n}\n\n/* ── Page break control ──────────────────── */\n@media print {\n  /* Prevent page break inside paragraphs */\n  p { page-break-inside: avoid; }\n\n  /* Always start chapters on new page */\n  h1, h2 { page-break-before: always; }\n\n  /* Keep headings with content */\n  h3 {\n    page-break-after: avoid;\n  }\n\n  /* Never break tables mid-row */\n  table { page-break-inside: avoid; }\n\n  /* Lists together on one page */\n  ul, ol { page-break-inside: avoid; }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @media print — Print-Friendly Styling — common patterns you'll see in production.\n// APPROACH  - Combine @media print — Print-Friendly Styling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Images don't break */\n  img { page-break-inside: avoid; }\n}\n\n/* ── Set page size and margins ──────────────– */\n@page {\n  size: A4;\n  margin: 1in;\n}\n\n@page :first {\n  margin-top: 2in;          /* more space on first page */\n}\n\n/* ── Adjust text for print readability ────── */\n@media print {\n  body {\n    font-size: 12pt;\n    line-height: 1.5;\n    max-width: 8in;         /* standard paper width */\n  }\n\n  h1 { font-size: 24pt; }\n  h2 { font-size: 18pt; }\n  h3 { font-size: 14pt; }\n\n  code, pre {\n    background: #f0f0f0;\n    padding: 0.5em;\n    font-size: 10pt;\n  }\n}\n\n/* ── Document styling for print ──────────── */\n@media print {\n  .document {\n    padding: 1in;\n  }\n\n  .document-title {\n    text-align: center;\n    font-size: 24pt;\n    margin-bottom: 0.5in;\n    page-break-after: avoid;\n  }\n\n  .document-body {\n    column-count: 1;\n    column-gap: 0;\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @media print — Print-Friendly Styling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.page-break { page-break-after: always; }\n\n  /* Avoid orphans and widows */\n  p {\n    orphans: 3;\n    widows: 3;\n  }\n}\n\n/* ── Hiding specific elements for print ────– */\n@media print {\n  .no-print { display: none; }\n  .print-only { display: block; }\n\n  /* Hide form inputs */\n  input, button, textarea { display: none; }\n\n  /* Print addresses for envelopes */\n  .address-block {\n    display: block;\n    padding: 1in;\n    page-break-after: avoid;\n  }\n}\n\n/* ── Color adjustments for print ─────────– */\n@media print {\n  /* Remove colors that don't print well */\n  .highlight {\n    color: black;\n    background: transparent;\n    border: 1px solid black;\n  }\n\n  /* Ensure text is dark */\n  :root {\n    --text-color: black;\n    --bg-color: white;\n  }\n\n  /* Inverted colors: white text on dark in screen */\n  /* becomes black text on white in print */\n  .dark-section {\n    color: black;\n    background: white;\n  }\n}"
                  }
        ],
        tips: [
                  "@media print hides nav, sidebars, footers — users don't need to print navigation.",
                  "Remove box-shadow, dark backgrounds, and bright colors — they don't print well and waste ink.",
                  "page-break-inside: avoid on cards, tables, images keeps them together on the page.",
                  "page-break-after: always on h1 starts new chapters on new pages — better for documents."
        ],
        mistake: "Forgetting @media print testing — print layout can be completely broken. Always test print preview before shipping.",
        shorthand: {
          verbose: "@media print {\n  nav { display: none; }\n  header { display: none; }\n  footer { display: none; }\n  body { color: black; background: white; }\n}",
          concise: "@media print {\n  nav, header, footer { display: none; }\n  body { color: black; background: white; }\n}",
        },
      },
      {
        id: "touch-targets",
        fn: "Touch-Friendly Design — Minimum 44px, Touch Targets",
        desc: "Optimize for touch: 44px minimum tap target, prevent hover-only states, touch-action.",
        category: "Accessibility",
        subtitle: "44px touch target, touch-action, hover: none, pointer: coarse",
        signature: "min-width: 44px; min-height: 44px;  |  touch-action: manipulation",
        descLong: "Touch targets need to be at least 44x44px for comfortable tapping (WCAG 2.1). Small buttons (24px) are hard to tap accurately on mobile. Avoid hover-only states — touch devices can't hover. use @media (hover: none) to provide touch-friendly alternatives. touch-action controls how gestures work (zoom, pan).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Touch-Friendly Design — Minimum 44px, Touch Targets — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Minimum touch target size ────────────────────– */\nbutton, a, input[type=\"checkbox\"], input[type=\"radio\"] {\n  min-width: 44px;\n  min-height: 44px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n/* ── Touch-friendly button ────────────────────– */\n.button {\n  padding: 0.75rem 1.5rem;\n  min-height: 44px;\n  font-size: 1rem;\n  border: none;\n  border-radius: 0.375rem;\n  cursor: pointer;\n}\n\n/* ── Larger touch targets on mobile ──────────– */\n@media (hover: none) and (pointer: coarse) {\n  button, a[role=\"button\"] {\n    min-height: 48px;       /* even larger for touch */\n    padding: 1rem;\n  }\n\n  input, textarea, select {\n    min-height: 44px;\n    padding: 0.75rem;\n    font-size: 16px;        /* 16px prevents zoom on iOS */\n  }\n}\n\n/* ── Avoid hover-only interactions ──────────– */\n/* Bad: hover only, not touch-friendly */\n.dropdown {\n  display: none;\n}\n\n.menu:hover .dropdown {\n  display: block;\n}\n\n/* Good: work on both hover and click/focus */\n.menu {\n  position: relative;\n}\n\n.menu-button {\n  min-height: 44px;\n  cursor: pointer;\n}\n\n.dropdown {\n  display: none;\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 10;\n  min-width: 200px;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Touch-Friendly Design — Minimum 44px, Touch Targets — common patterns you'll see in production.\n// APPROACH  - Combine Touch-Friendly Design — Minimum 44px, Touch Targets with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Show on hover (desktop) */\n@media (hover: hover) {\n  .menu:hover .dropdown { display: block; }\n}\n\n/* Show on focus/click (mobile) */\n.menu-button:focus ~ .dropdown,\n.menu-button.open ~ .dropdown {\n  display: block;\n}\n\n/* ── Touch-action for gestures ────────────– */\n.carousel {\n  touch-action: pan-y;       /* allow vertical scroll, but not horizontal */\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n}\n\n.pinch-to-zoom {\n  touch-action: pinch-zoom;  /* only pinch-zoom, no panning */\n}\n\n.no-gestures {\n  touch-action: none;        /* disable all gestures */\n}\n\n/* ── Tap feedback ───────────────────────────– */\nbutton {\n  transition: opacity 100ms ease;\n}\n\nbutton:active {\n  opacity: 0.8;              /* visual feedback on tap */\n}\n\n/* ── Icon button with padding ───────────────– */\n.icon-button {\n  width: 44px;\n  height: 44px;\n  padding: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 0.375rem;\n}\n\n.icon-button svg {\n  width: 24px;\n  height: 24px;\n  pointer-events: none;      /* click goes to button, not svg */\n}\n\n/* ── Form inputs for mobile ────────────────– */\ninput[type=\"text\"],\ninput[type=\"email\"],\ninput[type=\"password\"],\ntextarea {\n  min-height: 44px;\n  padding: 0.75rem;\n  font-size: 16px;           /* 16px = no auto-zoom on iOS */\n  border: 1px solid #d1d5db;\n  border-radius: 0.375rem;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Touch-Friendly Design — Minimum 44px, Touch Targets — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Touch target spacing ─────────────────── */\n.button-group {\n  display: flex;\n  gap: 0.5rem;               /* minimum space between targets */\n}\n\n.button-group button {\n  flex: 1;\n  min-height: 44px;\n}\n\n/* ── Avoid double-tap zoom ────────────────── */\nbutton, a {\n  /* Prevents double-tap zoom on touch devices */\n  touch-action: manipulation;\n}\n\n/* ── Mobile form example ────────────────── */\n@media (hover: none) and (pointer: coarse) {\n  .form-group {\n    margin-bottom: 1.5rem;\n  }\n\n  label {\n    display: block;\n    margin-bottom: 0.5rem;\n    font-weight: 600;\n  }\n\n  input, textarea, select {\n    width: 100%;\n    min-height: 44px;\n    padding: 0.75rem;\n    font-size: 16px;\n    border: 1px solid #d1d5db;\n    border-radius: 0.375rem;\n  }\n\n  button {\n    width: 100%;\n    min-height: 48px;\n    padding: 1rem;\n    font-size: 1.125rem;\n  }\n}"
                  }
        ],
        tips: [
                  "44x44px is the WCAG 2.1 minimum tap target size — anything smaller is hard to tap accurately.",
                  "Use @media (hover: none) and (pointer: coarse) to target touch devices — provide click/focus alternatives to hover.",
                  "touch-action: manipulation prevents double-tap zoom delay — removes 300ms delay on touch interactions.",
                  "font-size: 16px on inputs prevents unwanted zoom on iOS Safari — essential for mobile UX."
        ],
        mistake: "Making buttons too small (24px) or relying only on hover states — touch users can't tap accurately or interact at all.",
        shorthand: {
          verbose: "button {\n  width: 30px;\n  height: 30px;\n}\n\n.menu:hover .dropdown { display: block; }",
          concise: "button {\n  min-width: 44px;\n  min-height: 44px;\n}\n\n@media (hover: hover) {\n  .menu:hover .dropdown { display: block; }\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
