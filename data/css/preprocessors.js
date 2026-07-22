export const meta = {
  "id": "preprocessors",
  "label": "Tailwind & Utility Frameworks",
  "icon": "🛠️",
  "description": "Tailwind CSS, CSS custom properties systems, PostCSS, and modern CSS utility patterns."
}

export const sections = [

  // ── Section 1: Tailwind CSS & CSS Custom Properties ─────────────────────────────────────────
  {
    id: "tailwind",
    title: "Tailwind CSS & CSS Custom Properties",
    entries: [
      {
        id: "tailwind-fundamentals",
        fn: "Tailwind CSS — Utility-First Workflow",
        desc: "Build UIs with composable utility classes: responsive prefixes, state variants, dark mode, and custom configuration.",
        category: "Tailwind",
        subtitle: "utility classes, responsive prefixes, hover/focus, dark:, @apply",
        signature: "class=\"flex items-center gap-4 p-6 md:p-8 hover:bg-gray-100 dark:bg-gray-900\"",
        descLong: "Tailwind CSS is a utility-first framework where you compose designs with small, single-purpose classes. Responsive design uses breakpoint prefixes (sm:, md:, lg:). State variants handle hover (hover:), focus (focus:), active (active:), and group interactions (group-hover:). Dark mode uses the dark: prefix. Custom values use square bracket notation (w-[350px]). Tailwind purges unused CSS in production, resulting in tiny bundle sizes (typically 5-10KB). Configuration via tailwind.config.js extends or overrides the default design system.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tailwind CSS — Utility-First Workflow — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n<!-- Responsive card with Tailwind -->\n<div class=\"\n  mx-auto max-w-sm\n  rounded-xl bg-white shadow-lg\n  overflow-hidden\n  dark:bg-gray-800\n  transition-shadow hover:shadow-xl\n\">\n  <img class=\"h-48 w-full object-cover\" src=\"photo.jpg\" alt=\"\" />\n\n  <div class=\"p-6 space-y-3\">\n    <h2 class=\"\n      text-xl font-bold text-gray-900\n      dark:text-white\n    \">Card Title</h2>\n\n    <p class=\"text-gray-600 dark:text-gray-300 line-clamp-2\">\n      Description text that gets truncated after two lines.\n    </p>\n\n    <div class=\"flex items-center gap-2\">\n      <span class=\"\n        inline-flex items-center\n        rounded-full bg-blue-100 px-2.5 py-0.5\n        text-xs font-medium text-blue-800\n        dark:bg-blue-900 dark:text-blue-200\n      \">Badge</span>\n    </div>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tailwind CSS — Utility-First Workflow — common patterns you'll see in production.\n// APPROACH  - Combine Tailwind CSS — Utility-First Workflow with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n<button class=\"\n      w-full rounded-lg bg-blue-600 px-4 py-2.5\n      text-sm font-semibold text-white\n      hover:bg-blue-700 focus:outline-none\n      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2\n      active:bg-blue-800\n      disabled:opacity-50 disabled:cursor-not-allowed\n      transition-colors\n    \">\n      Action\n    </button>\n  </div>\n</div>\n\n<!-- Responsive layout with breakpoint prefixes -->\n<div class=\"\n  grid grid-cols-1 gap-4 p-4\n  sm:grid-cols-2 sm:gap-6\n  lg:grid-cols-3 lg:gap-8 lg:p-8\n  xl:grid-cols-4\n\">\n  <!-- Cards auto-adjust: 1 col mobile → 4 col desktop -->\n</div>\n\n<!-- Group hover — parent hover affects children -->\n<a href=\"#\" class=\"group block rounded-lg p-6 hover:bg-gray-50\">\n  <h3 class=\"text-gray-900 group-hover:text-blue-600 transition-colors\">\n    Title\n  </h3>\n  <span class=\"text-gray-400 group-hover:text-gray-600\">\n    Read more →\n  </span>\n</a>"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tailwind CSS — Utility-First Workflow — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n<!-- Arbitrary values (escape hatch) -->\n<div class=\"w-[350px] h-[calc(100vh-4rem)] bg-[#1a1a2e] text-[13px]\">\n  Custom values when design tokens don't fit\n</div>\n\n<!-- tailwind.config.js -->\n<!-- module.exports = {                                -->\n<!--   content: ['./src/**/*.{js,jsx,ts,tsx}'],        -->\n<!--   darkMode: 'class',                              -->\n<!--   theme: {                                        -->\n<!--     extend: {                                     -->\n<!--       colors: { brand: '#3b82f6' },               -->\n<!--       fontFamily: { sans: ['Inter', 'sans-serif'] } -->\n<!--     }                                             -->\n<!--   }                                               -->\n<!-- }                                                 -->"
                  }
        ],
        tips: [
                  "Breakpoint prefixes are mobile-first: sm: means 640px+, md: 768px+, lg: 1024px+. Base classes = mobile.",
                  "group-hover: lets parent hover state affect children — wrap the parent with class=\"group\".",
                  "Arbitrary values [350px] work for any utility — use sparingly, prefer design tokens for consistency.",
                  "dark: prefix + darkMode: \"class\" lets you toggle dark mode with JavaScript (add/remove \"dark\" class on <html>)."
        ],
        mistake: "Using @apply extensively to create component classes — this defeats the purpose of utility-first CSS. Use @apply only for highly-repeated base elements (button, input). Use component abstraction (React/Vue) instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n<div class=\"padding-top: 16px padding-right: 24px padding-bottom: 16px padding-left: 24px text-lg font-bold text-blue-600\">Button</div>\n// More explicit but longer",
          concise: "<div class=\"px-6 py-4 text-lg font-bold text-blue-600\">Button</div>",
        },
      },
      {
        id: "design-tokens",
        fn: "CSS Custom Properties — Design Token Systems",
        desc: "Build scalable design systems with CSS custom properties: tokens, theming, component APIs, and runtime switching.",
        category: "Design Systems",
        subtitle: "CSS variables, :root, data-theme, component API, fallback values",
        signature: ":root { --color-primary: #3b82f6 }  |  var(--color-primary, fallback)",
        descLong: "CSS custom properties (variables) create maintainable design systems. Define tokens at :root for global values (colors, spacing, typography). Override at any level for theming (data-theme attributes), component variants, or responsive changes. Unlike Sass variables, custom properties are live — they cascade, inherit, and can be changed with JavaScript at runtime. This enables theme switching, user preferences, and dynamic styling without rebuilding CSS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Custom Properties — Design Token Systems — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Global design tokens ─────────────────────────── */\n:root {\n  /* Colors — semantic tokens */\n  --color-primary:    #3b82f6;\n  --color-primary-hover: #2563eb;\n  --color-surface:    #ffffff;\n  --color-surface-alt: #f8fafc;\n  --color-text:       #1e293b;\n  --color-text-muted: #64748b;\n  --color-border:     #e2e8f0;\n  --color-error:      #ef4444;\n  --color-success:    #22c55e;\n\n  /* Spacing scale */\n  --space-1: 0.25rem;\n  --space-2: 0.5rem;\n  --space-3: 0.75rem;\n  --space-4: 1rem;\n  --space-6: 1.5rem;\n  --space-8: 2rem;\n\n  /* Typography */\n  --font-sans: 'Inter', system-ui, sans-serif;\n  --font-mono: 'JetBrains Mono', monospace;\n  --radius-sm: 0.375rem;\n  --radius-md: 0.5rem;\n  --radius-lg: 0.75rem;\n\n  /* Shadows */\n  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.05);\n  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.07);\n}\n\n/* ── Dark theme override ─────────────────────────── */\n[data-theme=\"dark\"] {\n  --color-primary:    #60a5fa;\n  --color-surface:    #1e293b;\n  --color-surface-alt: #0f172a;\n  --color-text:       #f1f5f9;\n  --color-text-muted: #94a3b8;\n  --color-border:     #334155;\n  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.3);\n  --shadow-md: 0 4px 6px rgb(0 0 0 / 0.4);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Custom Properties — Design Token Systems — common patterns you'll see in production.\n// APPROACH  - Combine CSS Custom Properties — Design Token Systems with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Components use tokens — auto-adapt to theme */\n.card {\n  background: var(--color-surface);\n  border: 1px solid var(--color-border);\n  border-radius: var(--radius-lg);\n  padding: var(--space-6);\n  box-shadow: var(--shadow-sm);\n  color: var(--color-text);\n}\n\n/* ── Component-level custom properties (API) ─────── */\n.button {\n  --btn-bg: var(--color-primary);\n  --btn-text: white;\n  --btn-radius: var(--radius-md);\n  --btn-padding: var(--space-2) var(--space-4);\n\n  background: var(--btn-bg);\n  color: var(--btn-text);\n  border-radius: var(--btn-radius);\n  padding: var(--btn-padding);\n}\n\n/* Variants override component variables */\n.button--secondary {\n  --btn-bg: transparent;\n  --btn-text: var(--color-primary);\n}\n\n.button--danger {\n  --btn-bg: var(--color-error);\n}\n\n/* ── Theme switching with JavaScript ─────────────── */\n/* document.documentElement.dataset.theme = 'dark'; */\n/* document.documentElement.dataset.theme = 'light'; */"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Custom Properties — Design Token Systems — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Responsive tokens (no media queries in components) */\n:root {\n  --content-width: 100%;\n  --header-height: 3.5rem;\n}\n\n@media (min-width: 768px) {\n  :root {\n    --content-width: 720px;\n    --header-height: 4rem;\n  }\n}\n\n@media (min-width: 1024px) {\n  :root { --content-width: 960px; }\n}\n\n.container {\n  max-width: var(--content-width);\n  margin: 0 auto;\n}"
                  }
        ],
        tips: [
                  "Use semantic token names (--color-primary, not --blue-500) — they communicate purpose and make theming trivial.",
                  "Component-level custom properties (--btn-bg) create a styling API — variants just override the variable, not the entire rule.",
                  "Custom properties cascade — set them at :root for global, override at [data-theme] for themes, or at component level for variants.",
                  "Unlike Sass variables, custom properties are live at runtime — JavaScript can read and change them without rebuilding CSS."
        ],
        mistake: "Hardcoding colors throughout CSS instead of using custom properties — when you need to add dark mode or rebrand, you must find and change every color value. Tokens make this a one-line change.",
        shorthand: {
          verbose: ":root {\n  --spacing-xs: 4px;\n  --spacing-sm: 8px;\n  --spacing-md: 16px;\n  --spacing-lg: 24px;\n  --color-primary: #3b82f6;\n}\n.btn {\n  padding: var(--spacing-md) var(--spacing-lg);\n  background: var(--color-primary);\n}",
          concise: ":root {\n  --space: 8px;\n  --primary: #3b82f6;\n}\n.btn {\n  padding: calc(var(--space) * 2) calc(var(--space) * 3);\n  background: var(--primary);\n}",
        },
      },
    ],
  },

  // ── Section 2: Sass & SCSS ─────────────────────────────────────────
  {
    id: "sass-scss",
    title: "Sass & SCSS",
    entries: [
      {
        id: "sass-variables-maps",
        fn: "Sass Variables vs CSS Custom Properties",
        desc: "Understand when to use Sass $variables with maps vs modern CSS custom properties for design tokens.",
        category: "Sass",
        subtitle: "Sass variables, CSS custom properties, maps, map.get(), token systems",
        signature: "$var: value  |  map.get($map, key)  |  var(--css-prop)",
        descLong: "Sass variables ($var) are compile-time constants — fast, scoped, no runtime overhead. Use them for build-time values that never change. Maps are Sass data structures for organizing related values ($colors: (primary: #3b82f6, dark: #2563eb)). CSS custom properties (variables) are runtime-accessible, can be modified with JavaScript, cascade like normal CSS, and inherit through the DOM. Modern approach: use CSS custom properties for tokens (colors, spacing) that might be themed or dynamic. Use Sass variables for values that never change or for loop/condition logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sass Variables vs CSS Custom Properties — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Sass variables — compile-time constants ────── */\n$primary: #3b82f6;\n$radius: 0.5rem;\n$z-modal: 1000;\n\n.button {\n  background: $primary;\n  border-radius: $radius;\n}\n\n/* ── Sass maps for related tokens ────────────────── */\n$colors: (\n  primary: #3b82f6,\n  primary-dark: #2563eb,\n  primary-light: #60a5fa,\n  surface: #ffffff,\n  surface-alt: #f8fafc,\n  text: #1e293b,\n  error: #ef4444,\n);\n\n$spacing: (\n  xs: 0.25rem,\n  sm: 0.5rem,\n  md: 1rem,\n  lg: 1.5rem,\n  xl: 2rem,\n);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sass Variables vs CSS Custom Properties — common patterns you'll see in production.\n// APPROACH  - Combine Sass Variables vs CSS Custom Properties with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Use map.get() to access values */\n.button {\n  background: map.get($colors, primary);\n  padding: map.get($spacing, md);\n\n  &:hover {\n    background: map.get($colors, primary-dark);\n  }\n}\n\n/* ── CSS custom properties — runtime and dynamic ─── */\n:root {\n  --color-primary: #3b82f6;\n  --color-primary-dark: #2563eb;\n  --space-md: 1rem;\n}\n\n[data-theme=\"dark\"] {\n  --color-primary: #60a5fa;\n}\n\n.button {\n  background: var(--color-primary);\n  padding: var(--space-md);\n}\n\n/* ── Hybrid approach: Sass maps → CSS custom properties */\n@each $name, $value in $colors {\n  --color-#{$name}: #{$value};\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sass Variables vs CSS Custom Properties — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@each $name, $value in $spacing {\n  --space-#{$name}: #{$value};\n}\n\n/* ── Component API with CSS custom properties ──── */\n.button {\n  --btn-bg: var(--color-primary);\n  --btn-text: white;\n  --btn-size: md;\n\n  background: var(--btn-bg);\n  color: var(--btn-text);\n  padding: var(--space-var(--btn-size));\n}\n\n/* Variants override the component API */\n.button--secondary {\n  --btn-bg: transparent;\n  --btn-text: var(--color-primary);\n}"
                  }
        ],
        tips: [
                  "Use Sass $variables for things that never change — build efficiency. Use CSS variables for things that change — runtime flexibility.",
                  "Maps keep related Sass values organized — $colors, $spacing, $breakpoints. Use @each to iterate and generate utilities.",
                  "Combine both: use Sass maps at build time to generate CSS custom properties that designers can modify at runtime.",
                  "CSS custom properties cascade and inherit — they auto-theme when overridden at [data-theme]. Sass variables require recompilation."
        ],
        mistake: "Using only CSS custom properties for everything including hard-coded build values — you lose compile-time optimization and variable scoping. Use both: Sass for logic/build-time, CSS variables for themeable tokens.",
        shorthand: {
          verbose: "$primary-color: #3b82f6;\n$secondary-color: #8b5cf6;\n$tertiary-color: #06b6d4;\n\n.primary { color: $primary-color; }\n.secondary { color: $secondary-color; }\n.tertiary { color: $tertiary-color; }",
          concise: "$colors: (primary: #3b82f6, secondary: #8b5cf6, tertiary: #06b6d4);\n@each $name, $color in $colors {\n  .#{$name} { color: $color; }\n}",
        },
      },
      {
        id: "sass-mixins",
        fn: "@mixin & @include — Reusable Style Blocks",
        desc: "Create reusable mixins with arguments, default values, and content blocks for powerful abstraction.",
        category: "Sass",
        subtitle: "@mixin, @include, arguments, default values, @content, variadic arguments",
        signature: "@mixin name($arg: default) { }  |  @include name($value)",
        descLong: "Mixins are reusable blocks of CSS generated at build time. @mixin defines a template with parameters. @include outputs the mixin wherever needed. Arguments can have defaults. @content allows the caller to pass a block of CSS that gets inserted. Mixins are perfect for media query wrappers, vendor prefixes, accessibility patterns, and any repeated CSS structure. Unlike functions, mixins generate CSS directly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @mixin & @include — Reusable Style Blocks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic mixin ─────────────────────────────────── */\n@mixin button-base {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 0.375rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 200ms ease;\n}\n\n.button { @include button-base; }\n.btn { @include button-base; }\n\n/* ── Mixin with arguments ────────────────────────── */\n@mixin button-variant($bg, $text) {\n  background: $bg;\n  color: $text;\n\n  &:hover {\n    opacity: 0.9;\n  }\n}\n\n.button--primary {\n  @include button-base;\n  @include button-variant(#3b82f6, white);\n}\n\n.button--secondary {\n  @include button-base;\n  @include button-variant(transparent, #3b82f6);\n  border: 1px solid #3b82f6;\n}\n\n/* ── Default arguments ───────────────────────────── */\n@mixin flex-center($direction: row, $gap: 1rem) {\n  display: flex;\n  flex-direction: $direction;\n  align-items: center;\n  justify-content: center;\n  gap: $gap;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @mixin & @include — Reusable Style Blocks — common patterns you'll see in production.\n// APPROACH  - Combine @mixin & @include — Reusable Style Blocks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.hero { @include flex-center(); }\n.sidebar { @include flex-center(column, 1.5rem); }\n\n/* ── @content block — caller passes CSS ──────────── */\n@mixin responsive($breakpoint) {\n  @if $breakpoint == 'md' {\n    @media (min-width: 768px) { @content; }\n  } @else if $breakpoint == 'lg' {\n    @media (min-width: 1024px) { @content; }\n  }\n}\n\n.card {\n  padding: 1rem;\n\n  @include responsive('md') {\n    padding: 1.5rem;\n    display: grid;\n    grid-template-columns: 1fr 2fr;\n  }\n\n  @include responsive('lg') {\n    padding: 2rem;\n  }\n}\n\n/* ── Hover state mixin ───────────────────────────── */\n@mixin on-hover {\n  @media (hover: hover) {\n    &:hover { @content; }\n  }\n}\n\n.link {\n  color: #3b82f6;\n  text-decoration: none;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @mixin & @include — Reusable Style Blocks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@include on-hover {\n    text-decoration: underline;\n  }\n}\n\n/* ── Accessibility mixin ────────────────────────── */\n@mixin focus-ring($color: #3b82f6) {\n  outline: 2px solid $color;\n  outline-offset: 2px;\n}\n\nbutton {\n  &:focus-visible {\n    @include focus-ring();\n  }\n}\n\n/* ── Variadic arguments (multiple values) ────────── */\n@mixin shadows($shadows...) {\n  box-shadow: $shadows;\n}\n\n.card {\n  @include shadows(\n    0 1px 2px rgba(0,0,0,0.05),\n    0 4px 6px rgba(0,0,0,0.07),\n    0 10px 15px rgba(0,0,0,0.1)\n  );\n}"
                  }
        ],
        tips: [
                  "@content lets callers pass CSS blocks to a mixin — perfect for responsive wrappers, states, and extending behavior.",
                  "Mixins generate CSS at compile time, no runtime overhead — use them instead of doing the same thing manually.",
                  "Default arguments make mixins flexible — @mixin flex-center($direction: row) means @include flex-center() works without arguments.",
                  "Use mixins for structural patterns (button styles, flex centers, focus rings) — avoid @include inside loops as it duplicates CSS."
        ],
        mistake: "Creating a mixin for every tiny reuse (1-2 lines) — this bloats the codebase. Only make mixins for 3+ line patterns that you use multiple times.",
        shorthand: {
          verbose: ".button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.5rem 1rem;\n  border-radius: 0.375rem;\n  font-weight: 600;\n}\n.input {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 0.5rem 1rem;\n  border-radius: 0.375rem;\n}",
          concise: "@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.button { @include flex-center; padding: 0.5rem 1rem; }\n.input { @include flex-center; }",
        },
      },
      {
        id: "sass-functions",
        fn: "@function & @return — Custom CSS Functions",
        desc: "Write custom Sass functions for color utilities, math, and reusable calculations.",
        category: "Sass",
        subtitle: "@function, @return, color functions, math functions, custom utilities",
        signature: "@function name($arg) { @return value }  |  function-call($value)",
        descLong: "Sass @function defines a reusable calculation that returns a value. Unlike mixins which generate CSS, functions compute and return values (numbers, colors, strings) usable in any property. Create functions for color manipulation (darken, tint, shade), math (grid calculations, modular scales), unit conversions, and string manipulation. Functions make code DRY by centralizing logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @function & @return — Custom CSS Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Simple math function ────────────────────────── */\n@function grid-gap($cols, $width: 100%) {\n  @return calc(($width - (($cols - 1) * 1rem)) / $cols);\n}\n\n.grid-3 {\n  width: grid-gap(3);    /* returns calc((100% - 2rem) / 3) */\n}\n\n/* ── Color manipulation functions ────────────────── */\n@function tint($color, $amount: 10%) {\n  @return mix(white, $color, $amount);\n}\n\n@function shade($color, $amount: 10%) {\n  @return mix(black, $color, $amount);\n}\n\n:root {\n  --brand: #3b82f6;\n  --brand-light: #{tint(#3b82f6)};      /* 10% lighter */\n  --brand-lighter: #{tint(#3b82f6, 20%)};\n  --brand-dark: #{shade(#3b82f6)};      /* 10% darker */\n}\n\n/* ── Modular scale function ──────────────────────── */\n$font-scale: 1.25;\n\n@function scale($level) {\n  @return 1rem * pow($font-scale, $level);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @function & @return — Custom CSS Functions — common patterns you'll see in production.\n// APPROACH  - Combine @function & @return — Custom CSS Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nh1 { font-size: scale(4); }    /* 1rem * 1.25^4 = 2.44rem */\nh2 { font-size: scale(3); }\nh3 { font-size: scale(2); }\np  { font-size: scale(0); }\n\n/* ── String functions ────────────────────────────── */\n@function strip-unit($value) {\n  @return $value / ($value * 0 + 1);\n}\n\n@function to-em($px-value, $base: 16px) {\n  @return #{strip-unit($px-value) / strip-unit($base)}em;\n}\n\nbody { font-size: to-em(18px); }    /* 1.125em */\n\n/* ── Complex color function with conditions ───────── */\n@function color-contrast($color) {\n  $lightness: lightness($color);\n  @if ($lightness > 50%) {\n    @return black;\n  } @else {\n    @return white;\n  }\n}\n\n.card {\n  background: #3b82f6;\n  color: color-contrast(#3b82f6);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @function & @return — Custom CSS Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Accessibility contrast function ────────────── */\n@function wcag-contrast($color1, $color2) {\n  $l1: lightness($color1);\n  $l2: lightness($color2);\n  $lighter: max($l1, $l2);\n  $darker: min($l1, $l2);\n\n  @return ($lighter + 0.05) / ($darker + 0.05);\n}\n\n/* Returns ratio for WCAG AA (4.5:1), AAA (7:1) compliance */\n\n/* ── List manipulation ────────────────────────────── */\n@function get-breakpoint($size) {\n  $breakpoints: (\n    xs: 320px,\n    sm: 640px,\n    md: 768px,\n    lg: 1024px,\n    xl: 1280px,\n  );\n\n  @return map.get($breakpoints, $size);\n}\n\n@media (min-width: get-breakpoint(md)) {\n  .container { max-width: 720px; }\n}"
                  }
        ],
        tips: [
                  "@function with @return computes values at build time — use for math, colors, and conversions that you use many times.",
                  "Sass has built-in functions: lighten(), darken(), saturate(), mix(), pow(), round(), etc. Build custom functions on top.",
                  "Functions must return a value — if you just need to output CSS, use @mixin instead.",
                  "Use strip-unit() to remove units from numbers for calculations: $size-px / strip-unit($base) = em ratio."
        ],
        mistake: "Creating functions for one-off calculations instead of using them only for reusable logic — if you use it once, just write the calculation inline.",
        shorthand: {
          verbose: "$primary: #3b82f6;\n$primary-light: mix(white, $primary, 10%);\n$primary-dark: mix(black, $primary, 10%);",
          concise: "@function tint($c, $a: 10%) { @return mix(white, $c, $a); }\n$primary: #3b82f6;\n$primary-light: tint($primary);\n$primary-dark: tint($primary, -10%);",
        },
      },
      {
        id: "sass-loops",
        fn: "@each, @for, @while — Generating Utilities",
        desc: "Use loops to generate utility classes, variants, and scale systems without repetition.",
        category: "Sass",
        subtitle: "@each, @for, @while, loops with maps, generating utilities",
        signature: "@each $item in $list { }  |  @for $i from 1 through 10 { }",
        descLong: "Sass loops generate repetitive CSS automatically. @each iterates over lists/maps (perfect for generating color utilities, spacing scales). @for counts from one number to another (perfect for z-index, opacity steps). @while runs while a condition is true. Loops prevent writing the same CSS 100 times and make it trivial to add new values to your system.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @each, @for, @while — Generating Utilities — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── @each with a map ───────────────────────────── */\n$colors: (\n  primary: #3b82f6,\n  secondary: #8b5cf6,\n  success: #22c55e,\n  warning: #f59e0b,\n  error: #ef4444,\n);\n\n/* Generate color utility classes */\n@each $name, $color in $colors {\n  .bg-#{$name} { background-color: $color; }\n  .text-#{$name} { color: $color; }\n  .border-#{$name} { border-color: $color; }\n}\n\n/* Generates:\n   .bg-primary { background-color: #3b82f6; }\n   .text-primary { color: #3b82f6; }\n   ... for each color\n*/\n\n/* ── @each with a list ───────────────────────────── */\n$sizes: (xs, sm, md, lg, xl);\n\n@each $size in $sizes {\n  .text-#{$size} {\n    /* Would pair with font-size calculation */\n  }\n}\n\n/* ── @for counting loop ──────────────────────────── */\n/* Generate z-index utilities: z-1, z-2, z-10, z-20, z-50 */\n@for $i from 1 through 50 {\n  .z-#{$i * 10} { z-index: $i * 10; }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @each, @for, @while — Generating Utilities — common patterns you'll see in production.\n// APPROACH  - Combine @each, @for, @while — Generating Utilities with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── @for with opacity scale ────────────────────── */\n@for $i from 0 through 10 {\n  $opacity: $i / 10;\n  .opacity-#{$i * 10} { opacity: $opacity; }\n}\n\n/* Generates:\n   .opacity-0 { opacity: 0; }\n   .opacity-10 { opacity: 0.1; }\n   ... .opacity-100 { opacity: 1; }\n*/\n\n/* ── Spacing scale with @for ────────────────────── */\n$space-base: 0.25rem;\n\n@for $i from 1 through 20 {\n  $space: $space-base * $i;\n  .p-#{$i} { padding: $space; }\n  .m-#{$i} { margin: $space; }\n  .gap-#{$i} { gap: $space; }\n}\n\n/* ── Complex loop with conditions ────────────────── */\n$breakpoints: (\n  xs: 0,\n  sm: 640px,\n  md: 768px,\n  lg: 1024px,\n  xl: 1280px,\n);\n\n@each $name, $breakpoint in $breakpoints {\n  @if $breakpoint == 0 {\n    /* Base styles — no prefix for xs */\n    .container { width: 100%; }\n  } @else {\n    @media (min-width: $breakpoint) {\n      .#{$name}\\:w-full { width: 100%; }\n      .#{$name}\\:hidden { display: none; }\n    }\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @each, @for, @while — Generating Utilities — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── @while loop (less common) ───────────────────── */\n$counter: 1;\n\n@while $counter <= 5 {\n  .item-#{$counter} {\n    order: $counter;\n  }\n  $counter: $counter + 1;\n}\n\n/* ── Nested loops for color variants ────────────── */\n$colors: (primary: #3b82f6, secondary: #8b5cf6);\n$shades: (50, 100, 200, 500, 700, 900);\n\n@each $color-name, $color-base in $colors {\n  @each $shade in $shades {\n    $factor: $shade / 500;\n    .bg-#{$color-name}-#{$shade} {\n      background-color: adjust-hue($color-base, $factor * 10);\n    }\n  }\n}"
                  }
        ],
        tips: [
                  "@each over maps keeps your loops semantic — instead of looping 0-10, loop $colors and generate what you actually need.",
                  "Use string interpolation #{$variable} to embed loop variables in class names: .text-#{$size}.",
                  "@for with index $i is faster for numeric sequences than @each with explicit lists.",
                  "Nested loops create exhaustive combinations — use for color-shade matrices, responsive-utility combinations."
        ],
        mistake: "Using loops to generate CSS you only use once — @each $color in $colors generates utilities, but don't @each to build a single component. Use @mixin for single-use patterns.",
        shorthand: {
          verbose: ".p-1 { padding: 0.25rem; }\n.p-2 { padding: 0.5rem; }\n.p-3 { padding: 0.75rem; }\n.p-4 { padding: 1rem; }\n.p-5 { padding: 1.25rem; }",
          concise: "@for $i from 1 through 5 {\n  .p-#{$i} { padding: 0.25rem * $i; }\n}",
        },
      },
      {
        id: "sass-placeholders",
        fn: "%placeholder & @extend — DRY Selector Patterns",
        desc: "Use placeholders to define reusable selector patterns without bloating output. Contrast with mixins.",
        category: "Sass",
        subtitle: "%placeholder, @extend, selector inheritance, avoiding bloat",
        signature: "%name { }  |  @extend %name",
        descLong: "Placeholders (%name) are CSS patterns that are not output unless extended with @extend. When you @extend, Sass combines selectors efficiently (not duplicating CSS). Placeholders prevent cascade issues and selector bloat compared to mixins. Use placeholders for base styles that multiple selectors share. Use @extend for \"is-a\" relationships; use mixins for \"has-a\" structural patterns. Warning: @extend can cause specificity surprises and makes code dependencies invisible — use sparingly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of %placeholder & @extend — DRY Selector Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic placeholder pattern ──────────────────── */\n%truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.username { @extend %truncate; }\n.bio { @extend %truncate; }\n\n/* Output:\n   .username, .bio {\n     overflow: hidden;\n     text-overflow: ellipsis;\n     white-space: nowrap;\n   }\n   (One rule, not duplicated!)\n*/\n\n/* ── Placeholder vs Mixin comparison ────────────── */\n/* PLACEHOLDER: shares a single rule */\n%flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.button { @extend %flex-center; }\n.nav { @extend %flex-center; }\n\n/* Outputs:\n   .button, .nav {\n     display: flex;\n     align-items: center;\n     justify-content: center;\n   }\n*/\n\n/* MIXIN: duplicates the rule */\n@mixin flex-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of %placeholder & @extend — DRY Selector Patterns — common patterns you'll see in production.\n// APPROACH  - Combine %placeholder & @extend — DRY Selector Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.button { @include flex-center; }\n.nav { @include flex-center; }\n\n/* Outputs (duplicated):\n   .button {\n     display: flex;\n     align-items: center;\n     justify-content: center;\n   }\n   .nav {\n     display: flex;\n     align-items: center;\n     justify-content: center;\n   }\n*/\n\n/* ── Placeholders with pseudo-classes ───────────── */\n%focus-ring {\n  outline: 2px solid #3b82f6;\n  outline-offset: 2px;\n\n  &:focus { @extend %focus-ring; }\n}\n\nbutton { @extend %focus-ring; }\ninput { @extend %focus-ring; }\n\n/* ── Placeholder inheritance chains ─────────────── */\n%reset-list {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n%nav-base {\n  @extend %reset-list;\n  display: flex;\n  gap: 1rem;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of %placeholder & @extend — DRY Selector Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nnav ul { @extend %nav-base; }\n\n/* ── Silent classes vs visible utilities ─────────── */\n/* %silent-class won't appear unless @extend used */\n%hidden-visually {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n}\n\n.sr-only { @extend %hidden-visually; }\n.visually-hidden { @extend %hidden-visually; }\n\n/* ── When NOT to use @extend ────────────────────── */\n/* Bad: @extend chains create specificity issues */\n%base { color: blue; }\n%derived { @extend %base; font-size: 1.5rem; }\n\n.element { @extend %derived; }\n\n/* Good: use composable mixins instead */\n@mixin base { color: blue; }\n@mixin derived { @include base; font-size: 1.5rem; }\n\n.element { @include derived; }"
                  }
        ],
        tips: [
                  "Placeholders only output if @extend is used — no dead code. Mixins always output via @include.",
                  "@extend merges selectors efficiently: .a, .b { color: red } instead of two rules. Better for CSS size.",
                  "@extend can cause specificity surprises and hidden dependencies — use mixins by default, @extend only for obvious relationships.",
                  "Never @extend across media queries — a placeholder at root can't be extended inside @media — use mixins instead."
        ],
        mistake: "Overusing @extend for everything — leads to confusing selector chains and makes code dependencies invisible. Use @mixin for structural patterns, @extend only for base style inheritance.",
        shorthand: {
          verbose: ".button {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.username {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}",
          concise: "%truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.button { @extend %truncate; }\n.username { @extend %truncate; }",
        },
      },
      {
        id: "sass-modules",
        fn: "@use & @forward — Sass Modules & Namespacing",
        desc: "Organize Sass with the module system: @use for imports, @forward for re-exports, namespacing, and as *.",
        category: "Sass",
        subtitle: "@use, @forward, namespacing, as *, with(), module variables",
        signature: "@use \"path/file\"  |  @forward \"path/file\"  |  @use \"file\" as *",
        descLong: "@use replaces @import with proper namespacing — prevents global variable pollution. Import a file and its contents are accessed via namespace (colors.primary). @use \"path\" as * removes the namespace for cleaner syntax. @forward re-exports from dependencies. @use with() provides configuration at import time. This is how modern Sass projects organize code without global variable conflicts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of @use & @forward — Sass Modules & Namespacing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── File: _colors.scss ────────────────────────── */\n$primary: #3b82f6;\n$secondary: #8b5cf6;\n$error: #ef4444;\n\n/* ── File: _spacing.scss ───────────────────────── */\n$xs: 0.25rem;\n$sm: 0.5rem;\n$md: 1rem;\n$lg: 1.5rem;\n$xl: 2rem;\n\n/* ── File: _variables.scss ─────────────────────── */\n@use \"colors\";\n@use \"spacing\";\n\n/* Access via namespace */\nbody {\n  background: colors.$primary;\n  padding: spacing.$lg;\n}\n\n/* ── File: _mixins.scss ────────────────────────── */\n@use \"variables\";\n\n@mixin button-base {\n  padding: variables.$spacing-md variables.$spacing-lg;\n  border-radius: 0.375rem;\n  background: variables.$colors-primary;\n}\n\n/* ── File: main.scss (entry point) ────────────── */\n/* Import with namespace */\n@use \"variables\" as vars;\n@use \"mixins\" as btn;\n\n.button {\n  @include btn.button-base;\n  color: vars.$text;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of @use & @forward — Sass Modules & Namespacing — common patterns you'll see in production.\n// APPROACH  - Combine @use & @forward — Sass Modules & Namespacing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── @use with default namespace ────────────────── */\n@use \"variables\";\n\n.card {\n  background: variables.$surface;\n  color: variables.$text;\n}\n\n/* ── @use as * (no namespace) ───────────────────── */\n@use \"variables\" as *;\n\n.card {\n  background: $surface;    /* no \"variables.\" prefix */\n  color: $text;\n}\n\n/* ── @use with() — pass configuration ──────────── */\n@use \"mixins\" with (\n  $breakpoint-md: 800px,\n  $breakpoint-lg: 1200px\n);\n\n/* ── File: _config.scss ────────────────────────── */\n$sizes: (\n  xs: 320px,\n  sm: 640px,\n  md: 768px,\n  lg: 1024px,\n) !default;  /* !default allows override */\n\n/* ── File: _responsive.scss ──────────────────── */\n@use \"config\" with (\n  $sizes: (\n    xs: 320px,\n    sm: 600px,   /* different breakpoint */\n    md: 800px,\n    lg: 1200px,\n  )\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of @use & @forward — Sass Modules & Namespacing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── @forward for re-exports ────────────────────── */\n@forward \"colors\";      /* re-export colors */\n@forward \"spacing\";     /* re-export spacing */\n\n/* File importing \"index.scss\" gets both */\n\n/* ── File: theme/dark.scss (theme override) ────── */\n@use \"../variables\" as v;\n\n$colors: (\n  primary: #60a5fa,\n  surface: #1e293b,\n  text: #f1f5f9,\n);\n\n/* ── File: app.scss ────────────────────────────── */\n@use \"theme/dark\" as dark;\n@use \"variables\" as light;\n\nbody {\n  background: light.$colors-surface;\n  color: light.$colors-text;\n}\n\n[data-theme=\"dark\"] {\n  background: dark.$colors-surface;\n  color: dark.$colors-text;\n}"
                  }
        ],
        tips: [
                  "@use replaces @import entirely in modern Sass — prevents variable name collisions with namespacing.",
                  "@use \"path\" as * removes namespace prefix for cleaner syntax — use sparingly to avoid ambiguity.",
                  "@use with() lets you configure imported files at import time — great for theme switching and customization.",
                  "@forward re-exports public APIs — create an index.scss that forwards all submodules for convenient importing."
        ],
        mistake: "Mixing @import and @use in the same project — leads to confusion. Convert fully to @use for all imports.",
        shorthand: {
          verbose: "/* Old @import style - global namespace */\n@import \"variables\";\n@import \"colors\";\n@import \"mixins\";\n/* All variables global, risk of collisions */",
          concise: "/* Modern @use style - namespaced */\n@use \"variables\";\n@use \"colors\";\n@use \"mixins\";\n/* Access via variables.$name, colors.$name, etc. */",
        },
      },
      {
        id: "sass-nesting",
        fn: "Sass Nesting & Parent Selector (&)",
        desc: "Organize related styles with Sass nesting: parent selector, BEM patterns, nesting best practices.",
        category: "Sass",
        subtitle: "& parent selector, nesting depth, BEM nesting, ampersand variations",
        signature: ".parent { & .child { } &:hover { } }",
        descLong: "Sass nesting groups related selectors together, improving readability and reducing repetition. & represents the parent selector. Use & for pseudo-classes (&:hover), pseudo-elements (&::before), and child selectors (& .child). BEM components nest naturally in Sass. Deep nesting (3+ levels) creates overly specific selectors — avoid. Modern CSS now has native nesting too, but Sass has more flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sass Nesting & Parent Selector (&) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic nesting ────────────────────────────────── */\n.card {\n  padding: 1.5rem;\n  border-radius: 0.75rem;\n  background: var(--surface);\n\n  .title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }\n\n  .description {\n    color: var(--text-muted);\n    margin-top: 0.5rem;\n  }\n}\n\n/* Compiles to:\n   .card { ... }\n   .card .title { ... }\n   .card .description { ... }\n*/\n\n/* ── Parent selector (&) with pseudo-classes ──── */\n.button {\n  padding: 0.5rem 1rem;\n  background: var(--primary);\n  border-radius: 0.375rem;\n\n  &:hover {\n    background: var(--primary-dark);\n  }\n\n  &:active {\n    transform: scale(0.98);\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n}\n\n/* ── Ampersand at different positions ──────────── */\n.button {\n  padding: 0.5rem 1rem;\n\n  /* Element within button */\n  & span { font-weight: 600; }\n\n  /* Sibling combinator */\n  & + .button { margin-left: 0.5rem; }\n\n  /* Descendant */\n  & .icon { margin-right: 0.5rem; }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sass Nesting & Parent Selector (&) — common patterns you'll see in production.\n// APPROACH  - Combine Sass Nesting & Parent Selector (&) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Child combinator */\n  & > svg { width: 1.5rem; }\n}\n\n/* ── BEM nesting ─────────────────────────────── */\n.card {\n  padding: 1.5rem;\n  background: var(--surface);\n\n  &__header {\n    display: flex;\n    align-items: center;\n    justify-content: space-between;\n    margin-bottom: 1rem;\n  }\n\n  &__title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }\n\n  &__content {\n    line-height: 1.6;\n  }\n\n  &--featured {\n    border: 2px solid var(--primary);\n    background: var(--primary-subtle);\n  }\n\n  &--compact {\n    padding: 1rem;\n  }\n\n  &:hover {\n    box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  }\n}\n\n/* Compiles to:\n   .card { ... }\n   .card__header { ... }\n   .card__title { ... }\n   .card--featured { ... }\n   .card--featured:hover { ... }\n*/\n\n/* ── Nesting depth limit (avoid deep nesting) ─── */\n/* GOOD: 2 levels */\n.container {\n  & .item {\n    color: blue;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sass Nesting & Parent Selector (&) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* BAD: 5 levels (too specific, hard to override) */\n.container {\n  & .grid {\n    & .row {\n      & .cell {\n        & .text {\n          & span {\n            color: blue;\n          }\n        }\n      }\n    }\n  }\n}\n\n/* ── Using & with pseudo-elements ────────────── */\n.button {\n  position: relative;\n\n  &::before {\n    content: \"\";\n    position: absolute;\n    inset: 0;\n    background: linear-gradient(135deg, transparent, white);\n    opacity: 0;\n  }\n\n  &:hover::before {\n    opacity: 0.2;\n  }\n}\n\n/* ── Nesting with @media queries ────────────── */\n.sidebar {\n  width: 300px;\n\n  @media (max-width: 768px) {\n    width: 100%;\n    display: none;\n\n    &.open {\n      display: block;\n    }\n  }\n\n  & .nav {\n    display: flex;\n    flex-direction: column;\n  }\n}"
                  }
        ],
        tips: [
                  "Nest 2-3 levels max — deeper nesting creates overly specific selectors hard to override.",
                  "& can appear anywhere in a selector: & .child, .parent &, & + .sibling. Powerful for complex relationships.",
                  "BEM nesting is clean: .card { &__header { } &--featured { } } groups the whole component logically.",
                  "Use & to reference parent in pseudo-classes/elements — much cleaner than writing .class:hover repeatedly."
        ],
        mistake: "Nesting everything deeply without limit — creates selectors like .a { & .b { & .c { } } } with specificity you can't override. Flatten to 2-3 levels.",
        shorthand: {
          verbose: ".card {\n  padding: 1.5rem;\n}\n.card:hover {\n  background: #f0f0f0;\n}\n.card .title {\n  font-size: 1.25rem;\n}\n.card.featured {\n  border: 2px solid blue;\n}",
          concise: ".card {\n  padding: 1.5rem;\n\n  &:hover { background: #f0f0f0; }\n  & .title { font-size: 1.25rem; }\n  &.featured { border: 2px solid blue; }\n}",
        },
      },
    ],
  },

  // ── Section 3: PostCSS & CSS Nesting ─────────────────────────────────────────
  {
    id: "postcss",
    title: "PostCSS & CSS Nesting",
    entries: [
      {
        id: "postcss-setup",
        fn: "PostCSS Plugins — Setup & Configuration",
        desc: "Configure PostCSS with plugins: autoprefixer, preset-env, nesting, and custom transforms.",
        category: "PostCSS",
        subtitle: "postcss.config.js, plugins, autoprefixer, preset-env, plugin order",
        signature: "postcss: [ autoprefixer(), preset() ]  |  postcss.config.js exports plugins",
        descLong: "PostCSS is a CSS parser and plugin system. plugins transform CSS at build time. Common plugins: autoprefixer adds vendor prefixes (-webkit-, -moz-). preset-env converts modern CSS to older browser syntax. postcss-nesting enables CSS nesting. Define plugins in postcss.config.js. Plugin order matters — run nesting before autoprefixer. PostCSS is the foundation for modern CSS tooling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PostCSS Plugins — Setup & Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── File: postcss.config.js ────────────────────── */\nmodule.exports = {\n  plugins: [\n    // Nesting first (transforms @ rules)\n    require('postcss-nesting'),"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PostCSS Plugins — Setup & Configuration — common patterns you'll see in production.\n// APPROACH  - Combine PostCSS Plugins — Setup & Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Then preset-env (converts modern to older syntax)\n    require('postcss-preset-env')({\n      stage: 3,\n      features: {\n        'nesting-rules': false,  // already handled by postcss-nesting\n        'custom-properties': false,\n      },\n    }),"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PostCSS Plugins — Setup & Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Autoprefixer last (adds vendor prefixes),    require('autoprefixer'),,  ],,};,,/* ── Input: Modern CSS with nesting ────────────── */,.card {,  padding: 1rem;,  display: flex;,,  /* Native CSS nesting */,  & .title {,    font-size: 1.25rem;,    font-weight: 600;,  },,  &:hover {,    box-shadow: 0 4px 12px rgba(0,0,0,0.1);,  },,  /* Modern feature: lab() color */,  background: lab(50% 20 30);,,  /* Modern: grid lines */,  & {,    display: grid;,    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));,  },},,/* ── Input: Custom properties used ────────────── */,:root {,  --primary: #3b82f6;,},,.button {,  background: var(--primary);,},,/* ── Output after PostCSS processing ─────────── */,/* postcss-nesting flattens nesting */,.card {,  padding: 1rem;,  display: flex;,  background: lab(50% 20 30);,  display: grid;,  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));,},,.card .title {,  font-size: 1.25rem;,  font-weight: 600;,},,.card:hover {,  box-shadow: 0 4px 12px rgba(0,0,0,0.1);,},,/* preset-env converts lab() to fallback if needed */,.card {,  background: rgb(248, 180, 108);,  background: lab(50% 20 30);,},,/* autoprefixer adds prefixes */,.button {,  background: #3b82f6;,},,/* ── File: .browserslistrc (targets) ────────────── */,defaults,> 1%,last 2 versions,,/* ── Using with Webpack/Vite ────────────────────── */,/* vite.config.js */,export default {,  css: {,    postcss: './postcss.config.js',,  },,};,,/* ── Popular PostCSS plugins ────────────────────── */,/* autoprefixer: adds -webkit-, -moz- prefixes */,/* postcss-preset-env: modern CSS → older syntax */,/* postcss-nesting: enables CSS nesting */,/* postcss-import: inline @import statements */,/* purgecss: removes unused CSS */,/* cssnano: minifies CSS */,/* postcss-custom-media: extends media queries */,/* postcss-logical: logical properties (inline vs block) */"
                  }
        ],
        tips: [
                  "Plugin order matters — nesting/transforms first, then preset-env, then autoprefixer.",
                  "Browserslist (.browserslistrc) controls what features preset-env transforms — \"defaults\" covers ~90% of users.",
                  "PostCSS is unopinionated — you choose plugins. Contrast with Sass which is a language.",
                  "autoprefixer usually only needed for flexbox/grid on older IE — most modern browsers don't need prefixes."
        ],
        mistake: "Not configuring .browserslistrc and letting PostCSS add unnecessary prefixes for ancient browsers — update targets to cover real users.",
        shorthand: {
          verbose: "module.exports = {\n  plugins: {\n    autoprefixer: {},\n    'postcss-preset-env': {},\n    'postcss-nesting': {},\n  }\n};",
          concise: "module.exports = {\n  plugins: [\n    require('postcss-nesting'),\n    require('postcss-preset-env'),\n    require('autoprefixer'),\n  ],\n};",
        },
      },
      {
        id: "css-nesting-native",
        fn: "Native CSS Nesting (2023) — No Build Tool Needed",
        desc: "CSS nesting without Sass or PostCSS: browser-native nesting, & selector, @nest rule.",
        category: "CSS",
        subtitle: "CSS nesting, & selector, @nest, browser support (2024+)",
        signature: ".card { & .title { } &:hover { } }",
        descLong: "Native CSS nesting (2023+) brings nesting to browsers without preprocessors. Works like Sass: use & for parent, nest pseudo-classes and children. @nest can be used explicitly (though & is preferred). All modern browsers support it. This eliminates the main reason to use Sass/PostCSS for many projects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Native CSS Nesting (2023) — No Build Tool Needed — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic native CSS nesting ───────────────────── */\n.card {\n  padding: 1.5rem;\n  background: white;\n  border-radius: 0.75rem;\n\n  /* Child selector */\n  & .title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }\n\n  /* Pseudo-class */\n  &:hover {\n    box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n  }\n\n  /* Pseudo-element */\n  &::before {\n    content: \"\";\n    position: absolute;\n    top: 0;\n    left: 0;\n  }\n}\n\n/* ── Using @nest explicitly ──────────────────── */\n.button {\n  padding: 0.5rem 1rem;\n  background: #3b82f6;\n  color: white;\n\n  /* @nest can be explicit (less common) */\n  @nest &:hover {\n    background: #2563eb;\n  }\n\n  /* But & shorthand is preferred */\n  &:active {\n    transform: scale(0.98);\n  }\n}\n\n/* ── BEM with native nesting ────────────────── */\n.card {\n  padding: 1.5rem;\n\n  &__header {\n    display: flex;\n    justify-content: space-between;\n    margin-bottom: 1rem;\n\n    /* Can nest deeply but don't */\n    & .close-button {\n      cursor: pointer;\n    }\n  }\n\n  &__title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Native CSS Nesting (2023) — No Build Tool Needed — common patterns you'll see in production.\n// APPROACH  - Combine Native CSS Nesting (2023) — No Build Tool Needed with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Modifier */\n  &--featured {\n    border: 2px solid #3b82f6;\n    background: #e0e7ff;\n  }\n\n  /* Alternate */\n  &--compact {\n    padding: 1rem;\n\n    /* Nesting inside modifier */\n    & .title {\n      font-size: 1rem;\n    }\n  }\n}\n\n/* ── Multiple nesting ────────────────────────── */\n.form-group {\n  margin-bottom: 1.5rem;\n\n  & label {\n    display: block;\n    font-weight: 500;\n    margin-bottom: 0.5rem;\n  }\n\n  & input,\n  & textarea,\n  & select {\n    width: 100%;\n    padding: 0.5rem;\n    border: 1px solid #d1d5db;\n    border-radius: 0.375rem;\n  }\n\n  /* Pseudo-class on input */\n  & input:focus,\n  & textarea:focus,\n  & select:focus {\n    outline: none;\n    border-color: #3b82f6;\n    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);\n  }\n\n  /* Error state */\n  &.error input {\n    border-color: #ef4444;\n  }\n\n  &.error & .error-message {\n    color: #ef4444;\n    font-size: 0.875rem;\n    margin-top: 0.25rem;\n  }\n}\n\n/* ── Media queries inside nesting ──────────── */\n.sidebar {\n  width: 300px;\n  background: var(--surface);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Native CSS Nesting (2023) — No Build Tool Needed — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n& nav {\n    padding: 1rem;\n  }\n\n  /* Nested media query */\n  @media (max-width: 768px) {\n    width: 100%;\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    right: 0;\n    height: 60px;\n    display: flex;\n\n    & nav {\n      flex: 1;\n      padding: 0.5rem;\n    }\n  }\n}\n\n/* ── Ampersand variations ────────────────────── */\n.button {\n  padding: 0.5rem 1rem;\n\n  /* Parent + pseudo */\n  &:hover { background: darkblue; }\n\n  /* Parent + class */\n  &.secondary { background: gray; }\n\n  /* Parent + child */\n  & span { font-weight: 600; }\n\n  /* Sibling */\n  & + .button { margin-left: 0.5rem; }\n\n  /* Multiple nesting levels (avoid deep!) */\n  & strong {\n    font-weight: 700;\n\n    /* Two levels ok, but three+ gets hard to manage */\n    & em {\n      font-style: italic;\n    }\n  }\n}\n\n/* ── Browser support check ────────────────────── */\n@supports (selector(&)) {\n  /* CSS nesting supported */\n  .modern {\n    & .nested { color: blue; }\n  }\n}\n\n@supports not (selector(&)) {\n  /* Fallback for older browsers */\n  .modern .nested { color: blue; }\n}"
                  }
        ],
        tips: [
                  "Native CSS nesting works in all modern browsers (Firefox 117+, Chrome 120+, Safari 17.2+).",
                  "& is the parent selector — use it for pseudo-classes, pseudo-elements, and descendant selectors.",
                  "Nesting depth advice: 2-3 levels is clean, 4+ becomes hard to read and creates overly specific selectors.",
                  "Media queries inside rules (@media inside .class) are a game-changer for component-scoped responsive styles."
        ],
        mistake: "Deeply nesting (5+ levels) just because you can — creates overly specific selectors that are hard to override. Flatten to 2-3 levels.",
        shorthand: {
          verbose: ".card {\n  padding: 1rem;\n}\n.card:hover {\n  background: #f0f0f0;\n}\n.card .title {\n  font-size: 1.25rem;\n}",
          concise: ".card {\n  padding: 1rem;\n  &:hover { background: #f0f0f0; }\n  & .title { font-size: 1.25rem; }\n}",
        },
      },
    ],
  },

  // ── Section 4: CSS-in-JS & CSS Modules ─────────────────────────────────────────
  {
    id: "css-in-js",
    title: "CSS-in-JS & CSS Modules",
    entries: [
      {
        id: "css-modules",
        fn: "CSS Modules — Scoped Styles & Type Safety",
        desc: "Scope CSS locally per component: CSS Modules prevent naming conflicts, enable TypeScript types.",
        category: "CSS-in-JS",
        subtitle: "CSS Modules, .module.css, :local, composes, className binding",
        signature: "import styles from \"./Button.module.css\"  |  className={styles.button}",
        descLong: "CSS Modules scope styles locally by converting class names to unique hashes at build time. .button becomes .Button_button__a1b2c. Prevents naming conflicts in large projects. composes combines multiple classes. TypeScript support auto-generates types for className autocomplete. Modern approach for component-scoped styling without CSS-in-JS libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS Modules — Scoped Styles & Type Safety — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── File: Button.module.css ────────────────────── */\n.button {\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 0.375rem;\n  font-weight: 600;\n  cursor: pointer;\n  transition: all 200ms ease;\n}\n\n.button:hover {\n  opacity: 0.9;\n}\n\n.primary {\n  background: #3b82f6;\n  color: white;\n}\n\n.secondary {\n  background: transparent;\n  border: 1px solid #3b82f6;\n  color: #3b82f6;\n}\n\n.disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n  pointer-events: none;\n}\n\n/* ── Using composes ──────────────────────────── */\n.primaryButton {\n  composes: button;\n  composes: primary;\n}\n\n.secondaryButton {\n  composes: button;\n  composes: secondary;\n}\n\n/* ── File: Button.tsx ───────────────────────── */\nimport styles from './Button.module.css';\n\ninterface ButtonProps {\n  variant?: 'primary' | 'secondary';\n  disabled?: boolean;\n  children: React.ReactNode;\n}\n\nexport function Button({ variant = 'primary', disabled, children }: ButtonProps) {\n  const classes = [\n    styles.button,\n    variant === 'primary' && styles.primary,\n    variant === 'secondary' && styles.secondary,\n    disabled && styles.disabled,\n  ]\n    .filter(Boolean)\n    .join(' ');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS Modules — Scoped Styles & Type Safety — common patterns you'll see in production.\n// APPROACH  - Combine CSS Modules — Scoped Styles & Type Safety with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nreturn (\n    <button className={classes} disabled={disabled}>\n      {children}\n    </button>\n  );\n}\n\n/* ── Type-safe import (TypeScript) ──────────── */\n/* Option 1: css-modules types plugin */\ndeclare module '*.module.css' {\n  const styles: Record<string, string>;\n  export default styles;\n}\n\n/* Option 2: typed-css-modules (auto-generated) */\n/* Generates Button.module.css.d.ts with types */\nexport const button: string;\nexport const primary: string;\nexport const secondary: string;\nexport const disabled: string;\n\n/* ── Usage with autocomplete ────────────────── */\n// styles.button      ✓ autocomplete\n// styles.primaryBtn  ✗ error (doesn't exist)\n\n/* ── CSS Modules with composition ──────────── */\n/* File: _shared.module.css */\n.flexCenter {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.focusRing {\n  outline: 2px solid #3b82f6;\n  outline-offset: 2px;\n}\n\n/* File: Form.module.css */\n.input {\n  composes: focusRing from './_shared.module.css';\n  padding: 0.5rem;\n  border: 1px solid #d1d5db;\n  border-radius: 0.375rem;\n}\n\n.buttonWrapper {\n  composes: flexCenter from './_shared.module.css';\n  gap: 0.5rem;\n  margin-top: 1rem;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS Modules — Scoped Styles & Type Safety — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── :local and :global in CSS Modules ────── */\n/* By default, everything in .module.css is local */\n.button { color: blue; }  /* becomes .Button_button__a1b2c */\n\n/* Explicitly global with :global */\n:global(.custom-third-party-class) {\n  color: red;\n}\n\n/* or use :global() on a specific rule */\n.button :global(.icon) {\n  margin-right: 0.5rem;\n}\n\n/* ── Webpack/Vite config for CSS Modules ─── */\n/* vite.config.js */\nexport default {\n  css: {\n    modules: {\n      localsConvention: 'camelCase',  // cssModuleClass becomes cssModuleClass\n      generateScopedName: '[name]_[local]_[hash:base64:5]',\n    },\n  },\n};\n\n/* webpack.config.js */\nmodule: {\n  rules: [\n    {\n      test: /\\.module\\.css$/,\n      use: [\n        'style-loader',\n        {\n          loader: 'css-loader',\n          options: {\n            modules: true,\n          },\n        },\n      ],\n    },\n  ],\n}"
                  }
        ],
        tips: [
                  "CSS Modules prevent naming conflicts — two components can both have .button without conflicts.",
                  "composes merges multiple CSS classes — .primaryButton: composes: button; composes: primary;",
                  "TypeScript support: typed-css-modules auto-generates .d.ts files with type safety for class names.",
                  "Use CSS Modules for component-scoped styles — great for design systems and large teams."
        ],
        mistake: "Using global CSS selectors in CSS Modules (no :local scope) — defeats the purpose. Keep everything local unless explicitly ::global().",
        shorthand: {
          verbose: "/* Button.tsx */\nconst buttonClass = 'button' + ' ' + (variant === 'primary' ? 'primary' : 'secondary');\n<button className={buttonClass} />\n\n/* Button.css */\n.button { ... }\n.primary { ... }\n.secondary { ... }",
          concise: "/* Button.tsx */\nimport styles from './Button.module.css';\n<button className={[styles.button, styles[variant]].join(' ')} />\n\n/* Button.module.css */\n.button { ... }\n.primary { ... }\n.secondary { ... }",
        },
      },
      {
        id: "css-in-js-patterns",
        fn: "CSS-in-JS Patterns — styled-components vs Emotion vs vanilla-extract",
        desc: "Compare CSS-in-JS libraries: runtime (styled-components, Emotion) vs zero-runtime (vanilla-extract).",
        category: "CSS-in-JS",
        subtitle: "styled-components, Emotion, vanilla-extract, template literals, runtime cost",
        signature: "styled.button`...`  |  css`...`  |  style({ ... })",
        descLong: "CSS-in-JS libraries enable writing CSS in JavaScript. Runtime libraries (styled-components, Emotion) generate CSS dynamically in the browser — add JS overhead but enable dynamic styling. Zero-runtime libraries (vanilla-extract) generate CSS at build time — no runtime cost. Choose based on needs: dynamic styling (runtime), static components (zero-runtime), design systems (either).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CSS-in-JS Patterns — styled-components vs Emotion vs vanilla-extract — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── styled-components (runtime) ──────────────────── */\nimport styled from 'styled-components';\n\nconst StyledButton = styled.button`\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 0.375rem;\n  background: ${props => props.primary ? '#3b82f6' : 'transparent'};\n  color: ${props => props.primary ? 'white' : '#3b82f6'};\n  cursor: pointer;\n  transition: all 200ms ease;\n\n  &:hover {\n    opacity: 0.9;\n  }\n\n  &:disabled {\n    opacity: 0.5;\n    cursor: not-allowed;\n  }\n`;\n\nexport function Button({ primary, disabled, children }) {\n  return (\n    <StyledButton primary={primary} disabled={disabled}>\n      {children}\n    </StyledButton>\n  );\n}\n\n/* ── Emotion (runtime, smaller than styled-components) */\nimport { css } from '@emotion/react';\nimport styled from '@emotion/styled';\n\nconst buttonStyles = css`\n  padding: 0.5rem 1rem;\n  border: none;\n  border-radius: 0.375rem;\n  cursor: pointer;\n`;\n\nconst StyledButton = styled.button`\n  ${buttonStyles};\n  background: ${props => props.primary ? '#3b82f6' : 'transparent'};\n\n  &:hover {\n    opacity: 0.9;\n  }\n`;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CSS-in-JS Patterns — styled-components vs Emotion vs vanilla-extract — common patterns you'll see in production.\n// APPROACH  - Combine CSS-in-JS Patterns — styled-components vs Emotion vs vanilla-extract with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── vanilla-extract (zero-runtime) ──────────────── */\n/* File: Button.css.ts */\nimport { style } from '@vanilla-extract/css';\n\nexport const button = style({\n  padding: '0.5rem 1rem',\n  border: 'none',\n  borderRadius: '0.375rem',\n  cursor: 'pointer',\n  transition: 'all 200ms ease',\n\n  ':hover': {\n    opacity: 0.9,\n  },\n\n  ':disabled': {\n    opacity: 0.5,\n    cursor: 'not-allowed',\n  },\n});\n\nexport const primary = style({\n  background: '#3b82f6',\n  color: 'white',\n});\n\nexport const secondary = style({\n  background: 'transparent',\n  border: '1px solid #3b82f6',\n  color: '#3b82f6',\n});\n\n/* File: Button.tsx */\nimport * as styles from './Button.css';\n\ninterface ButtonProps {\n  variant?: 'primary' | 'secondary';\n  disabled?: boolean;\n  children: React.ReactNode;\n}\n\nexport function Button({ variant = 'primary', disabled, children }: ButtonProps) {\n  const variantClass = variant === 'primary' ? styles.primary : styles.secondary;\n  return (\n    <button className={[`${styles.button}`, variantClass].join(' ')} disabled={disabled}>\n      {children}\n    </button>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CSS-in-JS Patterns — styled-components vs Emotion vs vanilla-extract — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Comparison table ────────────────────────── */\n/* styled-components:\n   - Runtime CSS generation\n   - Dynamic styling: ${props => ...}\n   - Large bundle (~13KB gzip)\n   - Theme provider for design tokens\n   - Good for: dynamic UIs, theming\n\n   Emotion:\n   - Runtime CSS generation (smaller ~7KB)\n   - Supports CSS-in-JS and styled\n   - Similar API to styled-components\n   - Good for: optimized bundle size, mix of approaches\n\n   vanilla-extract:\n   - Zero-runtime (CSS generated at build time)\n   - Type-safe style objects\n   - No dynamic styling (static only)\n   - Excellent bundle size (~0KB runtime)\n   - Good for: design systems, static components, performance\n*/\n\n/* ── When to use each ────────────────────────── */\n/* Use styled-components if:\n   - You need dynamic styling based on props\n   - You're building interactive UIs with lots of variations\n   - Bundle size is not critical\n\n   Use Emotion if:\n   - You want something lightweight but similar to styled-components\n   - You prefer a smaller bundle\n\n   Use vanilla-extract if:\n   - Your styles are static (no dynamic props)\n   - You're building a design system\n   - Bundle size and performance are critical\n   - You want 100% type-safe CSS\n*/"
                  }
        ],
        tips: [
                  "Runtime (styled-components/Emotion) generates CSS in browser — adds JS parsing/execution overhead. Use for highly dynamic UIs.",
                  "Zero-runtime (vanilla-extract) generates CSS at build time — no runtime cost, but no dynamic styling. Use for design systems.",
                  "styled-components + theme provider is great for design tokens and dark mode switching.",
                  "vanilla-extract has zero runtime overhead and excellent TypeScript support — increasingly popular choice."
        ],
        mistake: "Using runtime CSS-in-JS for a static design system — vanilla-extract is much more efficient. Reserve styled-components for dynamic, interactive UIs.",
        shorthand: {
          verbose: "/* CSS file approach */\n.button { padding: 0.5rem 1rem; }\n.primary { background: #3b82f6; }\n\n/* React */\nclassName={[`button`, isPrimary ? 'primary' : ''].join(' ')}",
          concise: "/* styled-components */\nconst Button = styled.button`\n  padding: 0.5rem 1rem;\n  background: ${p => p.primary ? '#3b82f6' : 'none'};\n`",
        },
      },
      {
        id: "vanilla-extract",
        fn: "vanilla-extract — Type-Safe, Zero-Runtime CSS",
        desc: "Build design systems with vanilla-extract: style(), styleVariants(), createTheme(), fully type-safe.",
        category: "CSS-in-JS",
        subtitle: "style(), styleVariants(), createTheme(), @layer, zero-runtime, TypeScript first",
        signature: "style({ ... })  |  styleVariants({ ... })  |  createTheme({ ... })",
        descLong: "vanilla-extract generates CSS at build time (zero runtime overhead). Write styles as TypeScript objects — fully typed. style() for single styles, styleVariants() for multiple variants. createTheme() for design tokens and themeable values. The output is plain CSS files. Perfect for design systems, component libraries, and performance-critical applications.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of vanilla-extract — Type-Safe, Zero-Runtime CSS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── File: Button.css.ts ────────────────────────── */\nimport { style, styleVariants } from '@vanilla-extract/css';\n\n/* Base button styles */\nconst buttonBase = style({\n  padding: '0.5rem 1rem',\n  border: 'none',\n  borderRadius: '0.375rem',\n  fontWeight: 600,\n  cursor: 'pointer',\n  transition: 'all 200ms ease',\n\n  ':hover': {\n    opacity: 0.9,\n  },\n\n  ':disabled': {\n    opacity: 0.5,\n    cursor: 'not-allowed',\n    pointerEvents: 'none',\n  },\n});\n\n/* Variants — one style per variant */\nexport const button = styleVariants({\n  primary: [\n    buttonBase,\n    {\n      background: '#3b82f6',\n      color: 'white',\n    },\n  ],\n  secondary: [\n    buttonBase,\n    {\n      background: 'transparent',\n      border: '1px solid #3b82f6',\n      color: '#3b82f6',\n    },\n  ],\n  danger: [\n    buttonBase,\n    {\n      background: '#ef4444',\n      color: 'white',\n    },\n  ],\n});\n\nexport const size = styleVariants({\n  sm: { padding: '0.25rem 0.75rem', fontSize: '0.875rem' },\n  md: { padding: '0.5rem 1rem', fontSize: '1rem' },\n  lg: { padding: '0.75rem 1.5rem', fontSize: '1.125rem' },\n});\n\n/* ── File: theme.css.ts ─────────────────────── */\nimport { createTheme } from '@vanilla-extract/css';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of vanilla-extract — Type-Safe, Zero-Runtime CSS — common patterns you'll see in production.\n// APPROACH  - Combine vanilla-extract — Type-Safe, Zero-Runtime CSS with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nexport const [lightTheme, darkTheme] = createTheme({\n  color: {\n    primary: '#3b82f6',\n    primary_dark: '#2563eb',\n    surface: '#ffffff',\n    surface_alt: '#f8fafc',\n    text: '#1e293b',\n    text_muted: '#64748b',\n    border: '#e2e8f0',\n  },\n  spacing: {\n    xs: '0.25rem',\n    sm: '0.5rem',\n    md: '1rem',\n    lg: '1.5rem',\n    xl: '2rem',\n  },\n  radius: {\n    sm: '0.375rem',\n    md: '0.5rem',\n    lg: '0.75rem',\n  },\n  shadow: {\n    sm: '0 1px 2px rgb(0 0 0 / 0.05)',\n    md: '0 4px 6px rgb(0 0 0 / 0.07)',\n    lg: '0 10px 15px rgb(0 0 0 / 0.1)',\n  },\n});\n\n/* ── File: Card.css.ts ──────────────────────── */\nimport { style } from '@vanilla-extract/css';\nimport { vars } from './theme.css';\n\nexport const card = style({\n  padding: vars.spacing.md,\n  background: vars.color.surface,\n  border: `1px solid ${vars.color.border}`,\n  borderRadius: vars.radius.lg,\n  boxShadow: vars.shadow.md,\n  color: vars.color.text,\n});\n\nexport const cardFeatured = style({\n  border: `2px solid ${vars.color.primary}`,\n  background: vars.color.surface_alt,\n});\n\n/* ── File: Button.tsx ───────────────────────── */\nimport { button, size } from './Button.css';\nimport type { ComponentProps } from 'react';\n\ninterface ButtonProps extends ComponentProps<'button'> {\n  variant?: keyof typeof button;\n  size?: keyof typeof size;\n}\n\nexport function Button({\n  variant = 'primary',\n  size: sizeVariant = 'md',\n  children,\n  ...props\n}: ButtonProps) {\n  return (\n    <button\n      className={`${button[variant]} ${size[sizeVariant]}`}\n      {...props}\n    >\n      {children}\n    </button>\n  );\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of vanilla-extract — Type-Safe, Zero-Runtime CSS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── File: App.tsx ──────────────────────────── */\nimport { darkTheme, lightTheme } from './theme.css';\nimport { card } from './Card.css';\n\nexport function App({ isDark }: { isDark: boolean }) {\n  return (\n    <div className={isDark ? darkTheme : lightTheme}>\n      <div className={card}>\n        <h1>Hello</h1>\n      </div>\n    </div>\n  );\n}\n\n/* ── Complex variant combinations ──────────── */\nexport const buttonCompound = styleVariants({\n  'primary-sm': [button.primary, size.sm],\n  'primary-lg': [button.primary, size.lg],\n  'secondary-sm': [button.secondary, size.sm],\n  'secondary-lg': [button.secondary, size.lg],\n});\n\n/* ── @layer for cascade management ──────────── */\nimport { layer } from '@vanilla-extract/css';\n\nconst reset = layer('reset');\nconst base = layer('base');\nconst components = layer('components');\nconst utilities = layer('utilities');\n\nexport const myComponent = style({\n  '@layer': components,\n  padding: '1rem',\n});\n\n/* ── Type-safe variant selection ────────────── */\n// button['primary'] ✓ autocomplete\n// button['notReal']  ✗ TypeScript error\n\nexport type ButtonVariant = keyof typeof button;\n// ButtonVariant = 'primary' | 'secondary' | 'danger'"
                  }
        ],
        tips: [
                  "vanilla-extract generates plain CSS files at build time — zero runtime overhead compared to styled-components.",
                  "styleVariants() creates multiple class variants — better than if statements in className.",
                  "createTheme() generates CSS custom properties automatically — themes are type-safe and fully trackable.",
                  "Compose styles with arrays: style([baseStyle, conditionalStyle]) to combine multiple style definitions."
        ],
        mistake: "Trying to use dynamic styling (props-based colors) in vanilla-extract — it generates CSS at build time. Use component state + CSS custom properties for true dynamic styling.",
        shorthand: {
          verbose: "/* styled-components */\nconst Button = styled.button`\n  padding: ${p => p.size === 'lg' ? '1rem' : '0.5rem'};\n  background: ${p => p.variant === 'primary' ? '#3b82f6' : 'transparent'};\n`;",
          concise: "/* vanilla-extract */\nexport const size = styleVariants({\n  lg: { padding: '1rem' },\n  sm: { padding: '0.5rem' },\n});\nexport const color = styleVariants({\n  primary: { background: '#3b82f6' },\n  secondary: { background: 'transparent' },\n});",
        },
      },
    ],
  },
]

export default { meta, sections }
