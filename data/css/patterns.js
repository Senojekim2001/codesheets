export const meta = {
  "id": "patterns",
  "label": "Layout Patterns & Components",
  "icon": "🎨",
  "description": "CSS layout patterns: common component recipes, responsive patterns, utility classes, and production architecture."
}

export const sections = [

  // ── Section 1: Layout Patterns ─────────────────────────────────────────
  {
    id: "layout-patterns",
    title: "Layout Patterns",
    entries: [
      {
        id: "holy-grail",
        fn: "Page Layout Patterns — Holy Grail, Sidebar, Sticky Footer",
        desc: "Classic page layouts solved with modern CSS — sidebar + content, sticky footer, full-height apps.",
        category: "Layout",
        subtitle: "grid-template-areas, flex column, min-height: 100dvh",
        signature: "grid-template-areas: \"header header\" \"nav main\" \"footer footer\"",
        descLong: "Modern CSS makes classic layouts trivial. The holy grail (header, sidebar, content, footer) uses grid-template-areas. Sticky footers use flex column with flex: 1 on main. Full-height apps use min-height: 100dvh (dynamic viewport height for mobile). Sidebar layouts use grid with fr units. All these patterns are responsive with minimal code and no JavaScript.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Page Layout Patterns — Holy Grail, Sidebar, Sticky Footer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Holy grail layout ───────────────────────────── */\n.page {\n  display: grid;\n  grid-template-areas:\n    \"header header\"\n    \"sidebar main\"\n    \"footer footer\";\n  grid-template-columns: 250px 1fr;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100dvh;\n}\n.header  { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n.main    { grid-area: main; }\n.footer  { grid-area: footer; }\n\n/* Responsive: stack on mobile */\n@media (max-width: 768px) {\n  .page {\n    grid-template-areas:\n      \"header\"\n      \"main\"\n      \"sidebar\"\n      \"footer\";\n    grid-template-columns: 1fr;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Page Layout Patterns — Holy Grail, Sidebar, Sticky Footer — common patterns you'll see in production.\n// APPROACH  - Combine Page Layout Patterns — Holy Grail, Sidebar, Sticky Footer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Sticky footer (flex) ───────────────────────── */\nbody {\n  display: flex;\n  flex-direction: column;\n  min-height: 100dvh;\n}\nmain { flex: 1; }\n/* footer stays at bottom even with little content */\n\n/* ── Sidebar + content ──────────────────────────── */\n.layout {\n  display: grid;\n  grid-template-columns: minmax(200px, 300px) 1fr;\n  gap: 24px;\n}\n\n/* Collapsible sidebar */\n.layout:has(.sidebar[data-collapsed]) {\n  grid-template-columns: 60px 1fr;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Page Layout Patterns — Holy Grail, Sidebar, Sticky Footer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Full-bleed content within constrained layout ── */\n.wrapper {\n  --gutter: 16px;\n  display: grid;\n  grid-template-columns:\n    [full-start] var(--gutter)\n    [content-start] minmax(0, 1200px)\n    [content-end] var(--gutter)\n    [full-end];\n}\n.wrapper > * { grid-column: content; }\n.wrapper > .full-bleed { grid-column: full; }"
                  }
        ],
        tips: [
                  "grid-template-areas is the most readable layout tool — the code looks like the visual layout.",
                  "100dvh is better than 100vh on mobile — it accounts for the browser chrome that appears/disappears.",
                  "Full-bleed technique lets you break out of a constrained width while staying in the same grid.",
                  ":has(.sidebar[data-collapsed]) lets CSS react to sidebar state — no JS class toggling needed."
        ],
        mistake: "Using 100vh for full-height mobile layouts — on iOS, 100vh includes the area behind the browser address bar, causing content to be hidden. Use 100dvh instead.",
        shorthand: {
          verbose: "display: grid;\ngrid-template-columns: 250px 1fr 250px;\ngrid-template-rows: auto 1fr auto;\nheight: 100vh;\ngap: 16px;",
          concise: "display: grid;\ngrid: auto 1fr auto / 250px 1fr 250px;\nheight: 100vh;\ngap: 16px;",
        },
      },
      {
        id: "card-patterns",
        fn: "Card & Grid Patterns — Equal Heights, Masonry, Auto-fill",
        desc: "Responsive card grids, equal-height cards, masonry layouts, and auto-sizing patterns.",
        category: "Layout",
        subtitle: "auto-fill, minmax, subgrid, masonry, equal-height",
        signature: "grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))",
        descLong: "Card grids are the most common UI pattern. auto-fill + minmax creates responsive grids without media queries. subgrid aligns card internals (headers, footers) across columns. Equal-height cards use grid (automatic) or flex with align-items: stretch. Masonry layout (experimental) fills vertical gaps. Container queries let cards adapt to their container, not the viewport.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Card & Grid Patterns — Equal Heights, Masonry, Auto-fill — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Responsive auto-fill grid ───────────────────── */\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 24px;\n}\n/* Cards wrap automatically — no media queries! */\n\n/* ── Equal-height cards (grid does this by default) ─ */\n.card-grid { display: grid; }\n/* All cards in a row stretch to the tallest one */\n\n/* ── Subgrid — align card internals across columns ── */\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 24px;\n}\n.card {\n  display: grid;\n  grid-template-rows: subgrid;\n  grid-row: span 3;  /* header, body, footer */\n}\n/* All headers align, all footers align across columns! */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Card & Grid Patterns — Equal Heights, Masonry, Auto-fill — common patterns you'll see in production.\n// APPROACH  - Combine Card & Grid Patterns — Equal Heights, Masonry, Auto-fill with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Masonry layout (CSS, experimental) ─────────── */\n.masonry {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  grid-template-rows: masonry;  /* items fill vertical gaps */\n  gap: 16px;\n}\n\n/* Masonry fallback with columns */\n.masonry-fallback {\n  columns: 3;\n  column-gap: 24px;\n}\n.masonry-fallback > * {\n  break-inside: avoid;\n  margin-bottom: 24px;\n}\n\n/* ── Container query cards ──────────────────────── */\n.card-wrapper { container-type: inline-size; }\n\n.card {\n  display: flex;\n  flex-direction: column;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Card & Grid Patterns — Equal Heights, Masonry, Auto-fill — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@container (min-width: 400px) {\n  .card {\n    flex-direction: row;\n    align-items: center;\n  }\n  .card img { width: 200px; flex-shrink: 0; }\n}\n\n/* ── RAM pattern (Repeat, Auto, Minmax) ─────────── */\n/* 1 column → 2 → 3 → 4 as space allows */\n.grid-auto {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr));\n  gap: 16px;\n}\n/* min(100%, 250px) prevents overflow on very small screens */"
                  }
        ],
        tips: [
                  "repeat(auto-fill, minmax(300px, 1fr)) is the single most useful CSS grid pattern — fully responsive, zero breakpoints.",
                  "subgrid makes card headers/footers align across columns — the #1 requested grid feature.",
                  "min(100%, 250px) inside minmax prevents card overflow on tiny screens — 250px alone would overflow a 320px phone.",
                  "Container queries on cards mean the same component adapts in a sidebar vs. main content area."
        ],
        mistake: "Using auto-fit when you want consistent column widths — auto-fit stretches remaining items to fill space, so 2 items in a 4-column grid become 2 giant columns. Use auto-fill to keep column size consistent.",
        shorthand: {
          verbose: "// Manual / verbose approach\nborder: 1px solid #ddd;\nborder-radius: 8px;\npadding: 16px;\nbox-shadow: 0 2px 4px rgba(0,0,0,0.1);\nbackground: white;\n// More explicit but longer",
          concise: "border: 1px solid #ddd;\nborder-radius: 8px;\npadding: 16px;\nbox-shadow: 0 2px 4px rgba(0,0,0,0.1);\nbackground: white;",
        },
      },
      {
        id: "centering-patterns",
        fn: "Centering Patterns — Every Method Compared",
        desc: "The definitive guide to centering in CSS — flexbox, grid, position, margin, and when to use each.",
        category: "Layout",
        subtitle: "place-items: center, margin: auto, transform: translate",
        signature: "display: grid; place-items: center  |  display: flex; justify-content: center; align-items: center",
        descLong: "Centering in CSS has many approaches — the best one depends on context. Grid place-items: center is the shortest for both axes. Flexbox centering offers more control. margin: auto centers block elements horizontally. Absolute + translate centers within a positioned parent. Each method has specific use cases: grid for content centering, flex for component alignment, margin for document flow, absolute for overlays.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Centering Patterns — Every Method Compared — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Grid centering (shortest method) ───────────── */\n.center-grid {\n  display: grid;\n  place-items: center;\n  /* or: place-content: center (for the grid itself) */\n}\n\n/* ── Flexbox centering ──────────────────────────── */\n.center-flex {\n  display: flex;\n  justify-content: center;   /* horizontal */\n  align-items: center;        /* vertical */\n}\n\n/* ── Margin auto centering ──────────────────────── */\n/* Horizontal only — for block elements */\n.center-margin {\n  max-width: 800px;\n  margin-inline: auto;    /* left + right auto */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Centering Patterns — Every Method Compared — common patterns you'll see in production.\n// APPROACH  - Combine Centering Patterns — Every Method Compared with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Flex + margin auto — center one item */\n.spacer { margin-inline-start: auto; }\n/* Pushes element to the right in a flex container */\n\n/* ── Absolute + transform ───────────────────────── */\n.center-absolute {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n}\n\n/* Modern: inset + margin auto */\n.center-inset {\n  position: absolute;\n  inset: 0;\n  margin: auto;\n  width: fit-content;\n  height: fit-content;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Centering Patterns — Every Method Compared — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Centering text ─────────────────────────────── */\n.center-text {\n  text-align: center;          /* horizontal text */\n  vertical-align: middle;      /* inline/table-cell only */\n}\n\n/* ── When to use each method ────────────────────── */\n/* Grid place-items:     full-page centering, hero sections */\n/* Flex justify+align:   component internals, navbars */\n/* margin-inline: auto:  centering a constrained container */\n/* absolute + translate: modals, tooltips, overlays */\n/* text-align: center:   inline/text content only */"
                  }
        ],
        tips: [
                  "display: grid; place-items: center is the shortest way to center anything — 2 lines, both axes.",
                  "margin-inline: auto is the modern way to center a block element — replaces margin: 0 auto.",
                  "For absolute centering, inset: 0 + margin: auto is cleaner than top: 50% + transform: translate.",
                  "In flex containers, margin-inline-start: auto pushes an item to the right — great for \"last item right-aligned\"."
        ],
        mistake: "Using vertical-align: middle on a block element — it only works on inline, inline-block, and table-cell elements. For block elements, use flexbox or grid centering.",
        shorthand: {
          verbose: "display: flex;\nalign-items: center;\njustify-content: center;\nheight: 200px;",
          concise: "display: grid;\nplace-items: center;\nheight: 200px;",
        },
      },
    ],
  },

  // ── Section 2: Component Patterns ─────────────────────────────────────────
  {
    id: "component-patterns",
    title: "Component Patterns",
    entries: [
      {
        id: "buttons-forms",
        fn: "Button & Form Styling — Modern Patterns",
        desc: "Style buttons, inputs, and form elements with modern techniques — custom checkboxes, floating labels, validation states.",
        category: "Components",
        subtitle: "appearance: none, :user-valid, :user-invalid, accent-color",
        signature: "appearance: none  |  :user-valid { }  |  accent-color: dodgerblue",
        descLong: "Modern form styling uses appearance: none to remove browser defaults, then rebuilds with custom CSS. :user-valid/:user-invalid (replacing :valid/:invalid) only show validation after user interaction. accent-color themes checkboxes and radios without custom styling. Floating labels, toggle switches, and custom selects are common patterns. Always maintain focus indicators and touch target sizes (44px min).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Button & Form Styling — Modern Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Modern button system ────────────────────────── */\n.btn {\n  /* Reset */\n  appearance: none;\n  border: none;\n  background: none;\n  cursor: pointer;\n\n  /* Base styles */\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 20px;\n  border-radius: 8px;\n  font: inherit;\n  font-weight: 500;\n  line-height: 1;\n  min-height: 44px;       /* touch target */\n  transition: background 0.2s, transform 0.1s;\n\n  /* Primary variant */\n  background: var(--color-primary);\n  color: white;\n}\n.btn:hover { filter: brightness(0.9); }\n.btn:active { transform: scale(0.97); }\n.btn:disabled { opacity: 0.5; cursor: not-allowed; }\n\n/* Variants */\n.btn-outline {\n  background: transparent;\n  color: var(--color-primary);\n  box-shadow: inset 0 0 0 2px var(--color-primary);\n}\n.btn-ghost {\n  background: transparent;\n  color: var(--color-primary);\n}\n.btn-ghost:hover { background: var(--color-primary-bg); }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Button & Form Styling — Modern Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Button & Form Styling — Modern Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Custom text input ──────────────────────────── */\n.input {\n  appearance: none;\n  width: 100%;\n  padding: 10px 14px;\n  border: 1.5px solid var(--border-color, #d1d5db);\n  border-radius: 8px;\n  font: inherit;\n  background: var(--bg, white);\n  transition: border-color 0.2s, box-shadow 0.2s;\n}\n.input:focus {\n  outline: none;\n  border-color: var(--color-primary);\n  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);\n}\n\n/* Validation — only after user interacts! */\n.input:user-valid { border-color: #22c55e; }\n.input:user-invalid { border-color: #ef4444; }\n\n/* ── Floating label ─────────────────────────────── */\n.field { position: relative; }\n.field .input { padding-top: 20px; }\n.field .label {\n  position: absolute;\n  top: 50%;\n  left: 14px;\n  transform: translateY(-50%);\n  transition: all 0.2s;\n  color: var(--color-muted);\n  pointer-events: none;\n}\n.field .input:focus + .label,\n.field .input:not(:placeholder-shown) + .label {\n  top: 8px;\n  font-size: 0.75rem;\n  color: var(--color-primary);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Button & Form Styling — Modern Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Custom checkbox ────────────────────────────── */\n.checkbox {\n  appearance: none;\n  width: 20px;\n  height: 20px;\n  border: 2px solid var(--border-color);\n  border-radius: 4px;\n  cursor: pointer;\n  display: grid;\n  place-items: center;\n}\n.checkbox:checked {\n  background: var(--color-primary);\n  border-color: var(--color-primary);\n}\n.checkbox:checked::after {\n  content: \"\\2713\";\n  color: white;\n  font-size: 14px;\n}\n\n/* Or just theme native controls: */\n:root { accent-color: dodgerblue; }"
                  }
        ],
        tips: [
                  ":user-valid/:user-invalid only trigger after user interaction — no red borders on page load like :valid/:invalid.",
                  "accent-color themes ALL native form controls (checkbox, radio, range) with one line — good enough for many cases.",
                  "appearance: none removes browser defaults — required for custom checkboxes, selects, and range inputs.",
                  "min-height: 44px on buttons ensures WCAG touch target compliance — test on real mobile devices."
        ],
        mistake: "Using :valid/:invalid for form validation styling — they trigger immediately on page load, showing errors before the user has typed anything. Use :user-valid/:user-invalid instead.",
        shorthand: {
          verbose: "padding: 8px 16px;\nborder: 1px solid #ddd;\nborder-radius: 4px;\nbackground: white;\ncursor: pointer;\nfont-size: 1rem;",
          concise: "padding: 8px 16px;\nborder: 1px solid #ddd;\nborder-radius: 4px;\nbackground: white;\ncursor: pointer;",
        },
      },
      {
        id: "dialog-popover",
        fn: "Dialog, Popover & Toast Patterns",
        desc: "Native HTML dialog and popover elements styled with CSS — modals, dropdowns, tooltips, and toast notifications.",
        category: "Components",
        subtitle: "dialog, ::backdrop, popover, :popover-open, @starting-style",
        signature: "dialog::backdrop { }  |  [popover]:popover-open { }  |  @starting-style { }",
        descLong: "HTML dialog and popover elements provide native modal and popup behavior — focus trapping, keyboard handling, and dismissal built-in. CSS styles them: ::backdrop for the overlay behind modals, :popover-open for open state, @starting-style for entry animations (animating from display: none). These replace custom modal libraries with accessible, native solutions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dialog, Popover & Toast Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Dialog / Modal ──────────────────────────────── */\ndialog {\n  border: none;\n  border-radius: 12px;\n  padding: 24px;\n  max-width: min(500px, 90vw);\n  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n}\n\ndialog::backdrop {\n  background: rgba(0, 0, 0, 0.5);\n  backdrop-filter: blur(4px);\n}\n\n/* Animate dialog open */\ndialog {\n  opacity: 0;\n  transform: scale(0.95) translateY(10px);\n  transition: opacity 0.3s, transform 0.3s,\n              display 0.3s allow-discrete,\n              overlay 0.3s allow-discrete;\n}\n\ndialog[open] {\n  opacity: 1;\n  transform: scale(1) translateY(0);\n}\n\n/* Entry animation from display: none */\n@starting-style {\n  dialog[open] {\n    opacity: 0;\n    transform: scale(0.95) translateY(10px);\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dialog, Popover & Toast Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Dialog, Popover & Toast Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Popover — tooltips, dropdowns ──────────────── */\n[popover] {\n  border: 1px solid var(--border-color);\n  border-radius: 8px;\n  padding: 12px 16px;\n  box-shadow: 0 10px 25px rgb(0 0 0 / 0.1);\n  max-width: 300px;\n}\n\n/* Animate popover */\n[popover] {\n  opacity: 0;\n  transform: translateY(-4px);\n  transition: opacity 0.2s, transform 0.2s,\n              display 0.2s allow-discrete,\n              overlay 0.2s allow-discrete;\n}\n\n[popover]:popover-open {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n@starting-style {\n  [popover]:popover-open {\n    opacity: 0;\n    transform: translateY(-4px);\n  }\n}\n\n/* ── Toast notifications ────────────────────────── */\n.toast-container {\n  position: fixed;\n  bottom: 24px;\n  right: 24px;\n  display: flex;\n  flex-direction: column-reverse;\n  gap: 8px;\n  z-index: 9999;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dialog, Popover & Toast Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.toast {\n  padding: 12px 20px;\n  border-radius: 8px;\n  background: #1e293b;\n  color: white;\n  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);\n  animation: slide-in-right 0.3s ease, fade-out 0.3s ease 3s forwards;\n}\n.toast.success { border-left: 4px solid #22c55e; }\n.toast.error   { border-left: 4px solid #ef4444; }\n\n@keyframes slide-in-right {\n  from { transform: translateX(100%); opacity: 0; }\n}\n@keyframes fade-out {\n  to { opacity: 0; transform: translateX(50%); }\n}\n\n/* ── Anchor positioning (for tooltips/popovers) ─── */\n.trigger { anchor-name: --trigger; }\n.tooltip {\n  position: fixed;\n  position-anchor: --trigger;\n  bottom: anchor(top);\n  left: anchor(center);\n  translate: -50% -8px;\n}"
                  }
        ],
        tips: [
                  "dialog and popover are native HTML — they handle focus trapping, Esc dismissal, and accessibility automatically.",
                  "@starting-style enables animating from display: none — the missing piece for dialog/popover animations.",
                  "allow-discrete in transition enables transitioning display and overlay — required for entry/exit animations.",
                  "Anchor positioning ties popovers to trigger elements — no more JavaScript coordinate calculations."
        ],
        mistake: "Building custom modals with div + JS instead of native dialog — you lose built-in focus trapping, Esc key handling, inert background, and screen reader announcements. Use <dialog> and style with CSS.",
        shorthand: {
          verbose: "position: fixed;\ntop: 50%;\nleft: 50%;\ntransform: translate(-50%, -50%);\nbackground: white;\nborder-radius: 8px;\npadding: 24px;\nbox-shadow: 0 10px 40px rgba(0,0,0,0.2);",
          concise: "position: fixed;\ninset: 50% auto auto 50%;\ntranslate: -50% -50%;\nbackground: white;\nborder-radius: 8px;\npadding: 24px;\nbox-shadow: 0 10px 40px rgba(0,0,0,0.2);",
        },
      },
      {
        id: "dark-mode",
        fn: "Dark Mode & Theming Patterns",
        desc: "Implement light/dark themes with custom properties, system detection, and smooth theme transitions.",
        category: "Theming",
        subtitle: "prefers-color-scheme, color-scheme, light-dark(), data attributes",
        signature: "@media (prefers-color-scheme: dark) { }  |  color: light-dark(#111, #eee)",
        descLong: "Modern dark mode uses CSS custom properties on :root, overridden in a dark context. Detect system preference with prefers-color-scheme. Allow manual toggle with [data-theme=\"dark\"]. light-dark() is the newest approach — one function that resolves based on color-scheme. Transition themes smoothly. Ensure contrast meets WCAG 4.5:1 in both modes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dark Mode & Theming Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Method 1: Custom properties + media query ──── */\n:root {\n  --bg: #ffffff;\n  --bg-surface: #f8fafc;\n  --text: #0f172a;\n  --text-muted: #64748b;\n  --border: #e2e8f0;\n  --primary: #3b82f6;\n  --primary-hover: #2563eb;\n}\n\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #0f172a;\n    --bg-surface: #1e293b;\n    --text: #f1f5f9;\n    --text-muted: #94a3b8;\n    --border: #334155;\n    --primary: #60a5fa;\n    --primary-hover: #93bbfd;\n  }\n}\n\n/* ── Method 2: Manual toggle with data attribute ─── */\n[data-theme=\"dark\"] {\n  --bg: #0f172a;\n  --bg-surface: #1e293b;\n  --text: #f1f5f9;\n  /* ... same overrides */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dark Mode & Theming Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Dark Mode & Theming Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Method 3: light-dark() function (newest) ────── */\n:root {\n  color-scheme: light dark;  /* required for light-dark() */\n}\n\nbody {\n  background: light-dark(#ffffff, #0f172a);\n  color: light-dark(#0f172a, #f1f5f9);\n}\n\n.card {\n  background: light-dark(#f8fafc, #1e293b);\n  border-color: light-dark(#e2e8f0, #334155);\n}\n\n/* ── Smooth theme transition ────────────────────── */\n:root {\n  transition: background-color 0.3s ease, color 0.3s ease;\n}\n\n/* Or use view transition for page-level switch */\n/* document.startViewTransition(() => {\n     document.documentElement.dataset.theme = 'dark';\n   }); */\n\n/* ── Apply theme everywhere ─────────────────────── */\nbody {\n  background: var(--bg);\n  color: var(--text);\n}\n.card {\n  background: var(--bg-surface);\n  border: 1px solid var(--border);\n}\n.muted { color: var(--text-muted); }\na { color: var(--primary); }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dark Mode & Theming Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Images in dark mode ────────────────────────── */\n@media (prefers-color-scheme: dark) {\n  img:not([src*=\".svg\"]) {\n    filter: brightness(0.9) contrast(1.05);  /* slight dim */\n  }\n  /* Or use <picture> with different sources */\n}\n\n/* ── Color scheme for form controls ─────────────── */\n:root {\n  color-scheme: light dark;\n  /* Native inputs, scrollbars auto-adapt to dark mode */\n}"
                  }
        ],
        tips: [
                  "light-dark() is the cleanest syntax — one function, no media queries, resolves based on color-scheme.",
                  "color-scheme: light dark on :root makes native form controls and scrollbars adapt to dark mode automatically.",
                  "Support both system detection AND manual toggle — respect user preference but allow override.",
                  "Test dark mode images — bright images on dark backgrounds can be jarring. Dim them slightly."
        ],
        mistake: "Hardcoding colors instead of using CSS variables — changing themes requires touching every file. With variables, dark mode is just overriding :root values.",
        shorthand: {
          verbose: "@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #222;\n    --text: #eee;\n  }\n}\nbody {\n  background: var(--bg);\n  color: var(--text);\n}",
          concise: ":root {\n  --bg: white;\n  --text: #222;\n}\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #222;\n    --text: white;\n  }\n}\nbody {\n  background: var(--bg);\n  color: var(--text);\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
