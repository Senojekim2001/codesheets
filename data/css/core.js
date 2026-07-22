export const meta = {
  "id": "core",
  "label": "Core CSS",
  "icon": "🎨",
  "description": "Core CSS: selectors, the box model, flexbox, grid, positioning, colors, typography, transitions, animations, and custom properties."
}

export const sections = [

  // ── Section 1: Selectors & Specificity ─────────────────────────────────────────
  {
    id: "selectors",
    title: "Selectors & Specificity",
    entries: [
      {
        id: "basic-selectors",
        fn: "Basic & Combinator Selectors",
        desc: "Target elements by type, class, ID, attribute, and relationship — the foundation of all CSS.",
        category: "Selectors",
        subtitle: ".class, #id, [attr], >, +, ~, :is(), :where()",
        signature: "selector { property: value; }",
        descLong: "CSS selectors target HTML elements for styling. Type selectors (div), class selectors (.card), and ID selectors (#hero) are the basics. Combinator selectors define relationships: descendant (A B), child (A > B), adjacent sibling (A + B), general sibling (A ~ B). :is() and :where() group selectors — :is() carries the highest specificity of its arguments, :where() always has zero specificity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Basic & Combinator Selectors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Type, class, ID ─────────────────────────────── */\nh1 { font-size: 2rem; }\n.card { border-radius: 8px; }\n#hero { min-height: 100vh; }\n\n/* ── Attribute selectors ────────────────────────────── */\na[href]              { color: blue; }        /* has attribute */\na[href^=\"https\"]     { color: green; }       /* starts with */\na[href$=\".pdf\"]      { color: red; }         /* ends with */\na[href*=\"example\"]   { text-decoration: underline; } /* contains */\ninput[type=\"email\"]  { border-color: teal; }\n\n/* ── Combinators ────────────────────────────────────── */\nnav a          { color: white; }    /* descendant (any depth) */\nnav > a        { font-weight: bold; } /* direct child only */\nh2 + p         { margin-top: 0; }   /* adjacent sibling (next) */\nh2 ~ p         { color: #666; }     /* general sibling (all after) */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Basic & Combinator Selectors — common patterns you'll see in production.\n// APPROACH  - Combine Basic & Combinator Selectors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── :is() — grouping with specificity ──────────────── */\n:is(h1, h2, h3) { line-height: 1.2; }\n/* Same as: h1 { line-height: 1.2; } h2 { ... } h3 { ... } */\n\narticle :is(h1, h2, h3) { color: navy; }\n/* Matches h1, h2, h3 inside article */\n\n/* ── :where() — grouping with ZERO specificity ──────── */\n:where(h1, h2, h3) { margin-top: 1em; }\n/* Easy to override — specificity is (0,0,0) */\n\n/* ── :not() — negation ──────────────────────────────── */\ninput:not([type=\"submit\"]) { border: 1px solid #ccc; }\nli:not(:last-child) { margin-bottom: 8px; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Basic & Combinator Selectors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── :has() — parent selector (game-changer!) ───────── */\n.card:has(img) { padding: 0; }           /* card containing an img */\n.card:has(> .badge) { border-color: gold; } /* card with direct .badge child */\nh2:has(+ p) { margin-bottom: 0.5em; }   /* h2 followed by p */"
                  }
        ],
        tips: [
                  ":has() is the long-awaited \"parent selector\" — it selects elements based on their descendants or siblings.",
                  ":is() reduces repetition but carries max specificity of its arguments — :is(#id, .class) has ID-level specificity.",
                  ":where() is identical to :is() but always has zero specificity — perfect for reset/base styles that should be easily overridable.",
                  "Attribute selectors are case-insensitive with the i flag: [href$=\".PDF\" i] matches .pdf, .PDF, .Pdf."
        ],
        mistake: "Using :is() in reset stylesheets — its specificity matches the most specific argument. Use :where() instead so all rules remain easily overridable.",
        shorthand: {
          verbose: "/* Explicit selectors without grouping */\n.card { border-radius: 8px; }\n.card-title { font-size: 1.2em; }\n.card-text { color: #666; }\ninput[type=\"text\"] { border: 1px solid #ccc; }\ninput[type=\"email\"] { border: 1px solid #ccc; }\narticle h1 { color: navy; }\narticle h2 { color: navy; }\narticle h3 { color: navy; }",
          concise: ":is(.card, .card-title, .card-text) { }\n:is(input[type=\"text\"], input[type=\"email\"]) { border: 1px solid #ccc; }\n:is(article h1, article h2, article h3) { color: navy; }",
        },
      },
      {
        id: "pseudo-classes-elements",
        fn: "Pseudo-Classes & Pseudo-Elements",
        desc: "Style states (:hover, :focus), structural positions (:nth-child), and generated content (::before, ::after).",
        category: "Selectors",
        subtitle: ":hover, :nth-child(), :focus-visible, ::before, ::after",
        signature: "selector:pseudo-class { }  |  selector::pseudo-element { }",
        descLong: "Pseudo-classes select elements in specific states (:hover, :focus, :active) or structural positions (:first-child, :nth-child, :last-of-type). Pseudo-elements create virtual elements: ::before and ::after add content, ::placeholder styles input placeholders, ::selection styles highlighted text. Modern pseudo-classes: :focus-visible (keyboard focus only), :focus-within (parent of focused element).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pseudo-Classes & Pseudo-Elements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── State pseudo-classes ────────────────────────── */\na:hover   { text-decoration: underline; }\na:active  { color: darkblue; }\nbutton:disabled { opacity: 0.5; cursor: not-allowed; }\n\n/* :focus-visible — only keyboard focus (not click) */\nbutton:focus-visible {\n  outline: 2px solid dodgerblue;\n  outline-offset: 2px;\n}\n\n/* :focus-within — parent of focused element */\n.search-bar:focus-within {\n  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);\n}\n\n/* ── Structural pseudo-classes ──────────────────── */\nli:first-child  { font-weight: bold; }\nli:last-child   { border-bottom: none; }\nli:nth-child(odd)  { background: #f9f9f9; }   /* zebra stripes */\nli:nth-child(3n)   { color: red; }             /* every 3rd */\nli:nth-child(n+4)  { opacity: 0.7; }           /* 4th and beyond */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pseudo-Classes & Pseudo-Elements — common patterns you'll see in production.\n// APPROACH  - Combine Pseudo-Classes & Pseudo-Elements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* :nth-of-type — counts only matching elements */\np:first-of-type { font-size: 1.2em; }   /* first <p>, ignoring other elements */\n\n/* :only-child, :empty */\nli:only-child { list-style: none; }\ndiv:empty { display: none; }\n\n/* ── Pseudo-elements ────────────────────────────── */\n/* ::before / ::after — generated content */\n.required::after {\n  content: \" *\";\n  color: red;\n}\n\nblockquote::before {\n  content: \"\\201C\";  /* opening curly quote */\n  font-size: 3em;\n  color: #ccc;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pseudo-Classes & Pseudo-Elements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ::placeholder */\ninput::placeholder {\n  color: #999;\n  font-style: italic;\n}\n\n/* ::selection — highlighted text */\n::selection {\n  background: #264f78;\n  color: white;\n}\n\n/* ::marker — list bullet/number */\nli::marker {\n  color: dodgerblue;\n  font-weight: bold;\n}"
                  }
        ],
        tips: [
                  ":focus-visible shows outlines only for keyboard navigation — users clicking buttons won't see outlines.",
                  "::before and ::after require content: \"\" to appear — even if you just want a decorative element.",
                  ":nth-child(2n) = even, :nth-child(2n+1) = odd — or use the keyword shorthands :nth-child(even/odd).",
                  "::marker lets you style list bullets/numbers independently — no need for list-style: none hacks."
        ],
        mistake: "Removing all focus outlines with *:focus { outline: none } for aesthetics — this makes the site inaccessible to keyboard users. Use :focus-visible instead to only hide outlines for mouse clicks.",
        shorthand: {
          verbose: "a:hover { text-decoration: underline; }\na:visited { color: purple; }\ninput:focus { border-color: blue; }\nli:first-child { font-weight: bold; }\nli:last-child { margin-bottom: 0; }\np:first-of-type { font-size: 1.1em; }",
          concise: "a:hover { text-decoration: underline; }\n:is(input):focus { border-color: blue; }\nli:first-child { font-weight: bold; }\nli:last-child { margin-bottom: 0; }",
        },
      },
      {
        id: "specificity-cascade",
        fn: "Specificity, Cascade & Inheritance",
        desc: "How CSS resolves conflicts — specificity scoring, cascade layers, !important, and inheritance.",
        category: "Selectors",
        subtitle: "Specificity: (ID, Class, Type)  |  @layer  |  inherit, initial, unset",
        signature: "#id > .class > element  |  @layer base, components, utilities;",
        descLong: "When multiple rules target the same element, CSS resolves conflicts via: (1) Origin & importance (!important > normal), (2) Specificity — scored as (IDs, Classes, Types): #nav .link = (1,1,0), (3) Source order — later rules win. @layer (Cascade Layers) adds explicit ordering between groups of styles. Inheritance passes certain properties (color, font-*) from parent to child. Use inherit/initial/unset/revert to control inheritance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Specificity, Cascade & Inheritance — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Specificity Examples ────────────────────────── */\n/*                              (ID, Class, Type) */\np                            /* (0, 0, 1)  */\n.card                        /* (0, 1, 0)  */\np.intro                      /* (0, 1, 1)  */\n#hero                        /* (1, 0, 0)  */\n#hero .title                 /* (1, 1, 0)  */\nnav#main ul.menu > li a:hover /* (1, 2, 4) */\n\n/* ── Cascade Layers (@layer) ────────────────────── */\n/* Declare layer order first */\n@layer reset, base, components, utilities;\n\n@layer reset {\n  *, *::before, *::after { box-sizing: border-box; margin: 0; }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Specificity, Cascade & Inheritance — common patterns you'll see in production.\n// APPROACH  - Combine Specificity, Cascade & Inheritance with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@layer base {\n  body { font-family: system-ui; line-height: 1.6; }\n  a { color: dodgerblue; }\n}\n\n@layer components {\n  .btn { padding: 8px 16px; border-radius: 4px; }\n  .card { border: 1px solid #ddd; border-radius: 8px; }\n}\n\n@layer utilities {\n  .text-center { text-align: center; }\n  .hidden { display: none; }\n}\n/* utilities always wins over components, regardless of specificity */"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Specificity, Cascade & Inheritance — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Inheritance keywords ───────────────────────── */\n.child {\n  color: inherit;    /* explicitly inherit from parent */\n  border: initial;   /* reset to browser default */\n  margin: unset;     /* inherit if inheritable, else initial */\n  padding: revert;   /* revert to browser stylesheet value */\n}\n\n/* Force inheritance on non-inheriting properties */\n.card * {\n  border-color: inherit;  /* border doesn't normally inherit */\n}\n\n/* ── !important (use sparingly) ─────────────────── */\n.override { color: red !important; }  /* beats everything except another !important with higher specificity */"
                  }
        ],
        tips: [
                  "@layer is the modern way to manage CSS conflicts — declare layer order once, then specificity battles disappear.",
                  "Specificity is NOT a single number — (1,0,0) always beats (0,99,99). IDs always beat any number of classes.",
                  "unset is the smartest keyword: inherits for inheritable properties (color), resets for others (border).",
                  "revert undoes your CSS and falls back to the browser default — useful for responsive overrides."
        ],
        mistake: "Over-using !important to fix specificity issues — it creates a specificity arms race. Use @layer or refactor selectors to lower specificity instead.",
        shorthand: {
          verbose: "nav a { color: white; }\nnav a:hover { color: yellow; }\n.menu .item { padding: 8px; }\n.menu .item:active { background: #333; }\n#main-nav { position: fixed; }",
          concise: "@layer reset, base, components, utilities;\n@layer base { nav a { color: white; } }\n@layer components { .menu .item { padding: 8px; } }",
        },
      },
    ],
  },

  // ── Section 2: Box Model & Layout ─────────────────────────────────────────
  {
    id: "box-model",
    title: "Box Model & Layout",
    entries: [
      {
        id: "box-model-basics",
        fn: "Box Model — Content, Padding, Border, Margin",
        desc: "Every element is a box — understand content, padding, border, and margin to control spacing and sizing.",
        category: "Layout",
        subtitle: "box-sizing, margin collapsing, display, overflow",
        signature: "box-sizing: border-box  |  display: block | inline | inline-block | none",
        descLong: "The CSS box model wraps every element in content + padding + border + margin. box-sizing: border-box makes width/height include padding and border (the intuitive behavior). Margin collapsing: adjacent vertical margins overlap instead of adding. display controls flow: block (full width), inline (no width/height), inline-block (inline with dimensions), none (removed from flow). overflow handles content that exceeds its container.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Box Model — Content, Padding, Border, Margin — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Always use border-box ───────────────────────── */\n*, *::before, *::after {\n  box-sizing: border-box;  /* width includes padding + border */\n}\n\n/* Without border-box: width: 200px + padding: 20px + border: 2px = 244px total\n   With border-box: width: 200px total (content shrinks to fit) */\n\n/* ── Box model properties ───────────────────────── */\n.card {\n  width: 300px;\n  padding: 16px;          /* inside the border */\n  border: 1px solid #ddd;\n  margin: 16px;           /* outside the border */\n  margin-bottom: 24px;\n}\n\n/* Shorthand: top right bottom left (clockwise) */\npadding: 10px 20px 10px 20px;\npadding: 10px 20px;       /* top/bottom 10, left/right 20 */\npadding: 10px;            /* all sides 10 */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Box Model — Content, Padding, Border, Margin — common patterns you'll see in production.\n// APPROACH  - Combine Box Model — Content, Padding, Border, Margin with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Margin collapsing ──────────────────────────── */\n/* Vertical margins collapse: the larger one wins */\nh2 { margin-bottom: 20px; }\np  { margin-top: 16px; }\n/* Gap between h2 and p is 20px, not 36px */\n\n/* Prevent collapsing with: */\n.container {\n  display: flow-root;     /* creates a new block formatting context */\n  /* or: overflow: hidden; or padding: 1px; or border: 1px; */\n}\n\n/* ── Display types ──────────────────────────────── */\n.block    { display: block; }         /* full width, new line */\n.inline   { display: inline; }        /* no width/height, flows in text */\n.ib       { display: inline-block; }  /* inline + respects width/height */\n.hidden   { display: none; }          /* removed from layout entirely */\n\n/* ── Overflow ───────────────────────────────────── */\n.container {\n  overflow: hidden;    /* clip overflowing content */\n  overflow: scroll;    /* always show scrollbars */\n  overflow: auto;      /* scrollbars only when needed */\n  overflow-x: auto;    /* horizontal scroll only */\n  overflow-y: hidden;  /* clip vertical overflow */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Box Model — Content, Padding, Border, Margin — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Sizing ─────────────────────────────────────── */\n.responsive {\n  width: 100%;\n  max-width: 1200px;\n  min-height: 100vh;\n  margin-inline: auto;  /* center horizontally */\n}"
                  }
        ],
        tips: [
                  "Always set box-sizing: border-box globally — it makes sizing intuitive and matches how designers think.",
                  "margin-inline: auto centers a block element horizontally — the modern shorthand for margin: 0 auto.",
                  "display: flow-root is the cleanest way to prevent margin collapsing — no side effects like overflow: hidden.",
                  "Use min-height instead of height for containers — content can grow beyond fixed heights on small screens."
        ],
        mistake: "Setting fixed height on text containers — content overflows on small screens or when text is larger. Use min-height or let height be auto (the default).",
        shorthand: {
          verbose: "padding-top: 16px;\npadding-right: 16px;\npadding-bottom: 16px;\npadding-left: 16px;\nmargin-top: 16px;\nmargin-right: 16px;\nmargin-bottom: 16px;\nmargin-left: 16px;",
          concise: "padding: 16px;\nmargin: 16px;",
        },
      },
      {
        id: "positioning",
        fn: "Positioning — static, relative, absolute, fixed, sticky",
        desc: "Control element placement with positioning contexts — overlays, sticky headers, and tooltips.",
        category: "Layout",
        subtitle: "position: relative | absolute | fixed | sticky, z-index, inset",
        signature: "position: absolute; top: 0; right: 0;  |  position: sticky; top: 0;",
        descLong: "position controls how elements are placed. static (default): normal flow. relative: offset from normal position (creates positioning context for children). absolute: positioned relative to nearest positioned ancestor. fixed: positioned relative to viewport (stays on scroll). sticky: acts like relative until a scroll threshold, then becomes fixed. z-index controls stacking order (only works on positioned elements).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Positioning — static, relative, absolute, fixed, sticky — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Relative — offset from normal position ─────── */\n.tooltip-trigger {\n  position: relative;  /* creates positioning context */\n}\n\n/* ── Absolute — relative to positioned ancestor ──── */\n.tooltip {\n  position: absolute;\n  bottom: 100%;        /* above the trigger */\n  left: 50%;\n  transform: translateX(-50%);  /* center horizontally */\n  z-index: 10;\n}\n\n/* Badge on a card corner */\n.card { position: relative; }\n.badge {\n  position: absolute;\n  top: -8px;\n  right: -8px;\n  z-index: 1;\n}\n\n/* ── Fixed — viewport-relative, survives scroll ──── */\n.navbar {\n  position: fixed;\n  top: 0;\n  left: 0;\n  right: 0;          /* or: inset: 0 auto auto 0; + width: 100% */\n  z-index: 100;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Positioning — static, relative, absolute, fixed, sticky — common patterns you'll see in production.\n// APPROACH  - Combine Positioning — static, relative, absolute, fixed, sticky with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Full-screen overlay */\n.modal-backdrop {\n  position: fixed;\n  inset: 0;          /* top: 0; right: 0; bottom: 0; left: 0; */\n  background: rgba(0, 0, 0, 0.5);\n  z-index: 999;\n}\n\n/* ── Sticky — relative until scroll threshold ────── */\n.table-header {\n  position: sticky;\n  top: 0;             /* sticks when scrolled to top of container */\n  background: white;\n  z-index: 10;\n}\n\n/* Sticky sidebar */\n.sidebar {\n  position: sticky;\n  top: 80px;          /* below the fixed navbar */\n  height: fit-content;\n}\n\n/* ── inset shorthand ────────────────────────────── */\n.overlay {\n  position: absolute;\n  inset: 0;                    /* all sides 0 */\n  inset: 10px 20px;            /* top/bottom 10, left/right 20 */\n  inset: 10px 20px 30px 40px;  /* top right bottom left */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Positioning — static, relative, absolute, fixed, sticky — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── z-index management ─────────────────────────── */\n:root {\n  --z-dropdown: 100;\n  --z-sticky:   200;\n  --z-modal:    300;\n  --z-toast:    400;\n}"
                  }
        ],
        tips: [
                  "inset: 0 is shorthand for top/right/bottom/left all zero — much cleaner for overlays and backdrops.",
                  "position: sticky requires a top (or bottom) value and a scrollable ancestor — without them it won't stick.",
                  "Use CSS custom properties for z-index values — avoids the \"z-index: 99999\" arms race.",
                  "transform: translateX(-50%) with left: 50% centers an absolute element — works for any width."
        ],
        mistake: "Using position: absolute without a positioned ancestor — the element positions relative to the viewport (actually the initial containing block). Always set position: relative on the parent.",
        shorthand: {
          verbose: "position: absolute;\ntop: 0;\nright: 0;\nbottom: auto;\nleft: auto;\nz-index: 10;",
          concise: "position: absolute;\ninset: 0 0 auto auto;\nz-index: 10;",
        },
      },
    ],
  },

  // ── Section 3: Flexbox ─────────────────────────────────────────
  {
    id: "flexbox",
    title: "Flexbox",
    entries: [
      {
        id: "flex-container",
        fn: "Flexbox Container — Direction, Alignment & Wrapping",
        desc: "One-dimensional layout — align items along a main axis and cross axis with powerful distribution controls.",
        category: "Flexbox",
        subtitle: "display: flex, justify-content, align-items, flex-wrap, gap",
        signature: "display: flex; justify-content: center; align-items: center; gap: 16px;",
        descLong: "Flexbox lays out children along one axis. The container sets direction (row/column), wrapping, and alignment. justify-content aligns on the main axis (horizontal for row). align-items aligns on the cross axis (vertical for row). flex-wrap allows items to wrap to new lines. gap adds consistent spacing between items (replaces margin hacks). Combine these properties to center, distribute, and align any layout.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Flexbox Container — Direction, Alignment & Wrapping — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic flex container ────────────────────────── */\n.container {\n  display: flex;\n  gap: 16px;                /* space between items */\n}\n\n/* ── Main axis alignment (justify-content) ──────── */\n.container {\n  justify-content: flex-start;    /* default — pack to start */\n  justify-content: center;        /* center all items */\n  justify-content: flex-end;      /* pack to end */\n  justify-content: space-between; /* first at start, last at end */\n  justify-content: space-around;  /* equal space around each */\n  justify-content: space-evenly;  /* equal space between all */\n}\n\n/* ── Cross axis alignment (align-items) ─────────── */\n.container {\n  align-items: stretch;      /* default — fill container height */\n  align-items: flex-start;   /* align to top */\n  align-items: center;       /* center vertically */\n  align-items: flex-end;     /* align to bottom */\n  align-items: baseline;     /* align text baselines */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Flexbox Container — Direction, Alignment & Wrapping — common patterns you'll see in production.\n// APPROACH  - Combine Flexbox Container — Direction, Alignment & Wrapping with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Direction ──────────────────────────────────── */\n.row     { flex-direction: row; }            /* horizontal (default) */\n.column  { flex-direction: column; }         /* vertical */\n.row-rev { flex-direction: row-reverse; }    /* right to left */\n\n/* ── Wrapping ───────────────────────────────────── */\n.wrap { flex-wrap: wrap; }\n/* Items wrap to next line instead of overflowing */\n\n/* align-content — controls wrapped lines */\n.container {\n  flex-wrap: wrap;\n  align-content: flex-start;  /* pack wrapped lines to top */\n  align-content: center;      /* center wrapped lines */\n  align-content: space-between; /* distribute wrapped lines */\n}\n\n/* ── Common patterns ────────────────────────────── */\n/* Center anything */\n.center-all {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Flexbox Container — Direction, Alignment & Wrapping — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Navigation bar */\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0 24px;\n}\n\n/* Card row that wraps */\n.card-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 24px;\n}"
                  }
        ],
        tips: [
                  "gap works in flexbox (not just grid) — it replaced the old margin-on-children hack.",
                  "justify-content: space-between is perfect for navbars — logo left, links right, no margin calculations.",
                  "align-items: baseline aligns text across items of different sizes — great for mixed-size cards.",
                  "flex-wrap: wrap + gap creates a responsive layout without media queries when combined with flex item sizing."
        ],
        mistake: "Using margin for spacing between flex items — gap is cleaner: no \"first/last child\" exceptions, no negative margin wrappers, and it only adds space between items.",
        shorthand: {
          verbose: "display: flex;\nflex-direction: row;\njustify-content: center;\nalign-items: center;\nflex-wrap: wrap;\ngap: 16px;",
          concise: "display: flex;\njustify-content: center;\nalign-items: center;\nflex-wrap: wrap;\ngap: 16px;",
        },
      },
      {
        id: "flex-items",
        fn: "Flex Items — grow, shrink, basis & order",
        desc: "Control how individual items grow, shrink, and size themselves within a flex container.",
        category: "Flexbox",
        subtitle: "flex-grow, flex-shrink, flex-basis, flex shorthand, order",
        signature: "flex: 1  |  flex: 0 0 300px  |  align-self: center",
        descLong: "Flex items have three key properties: flex-grow (how much extra space to take), flex-shrink (how much to shrink when space is tight), flex-basis (initial size before growing/shrinking). The flex shorthand combines all three. flex: 1 means \"grow to fill available space\". flex: 0 0 auto means \"don't grow, don't shrink, use content size\". align-self overrides the container's align-items for one item. order changes visual order without changing HTML.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Flex Items — grow, shrink, basis & order — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── flex shorthand: grow shrink basis ───────────── */\n.item { flex: 1; }          /* flex: 1 1 0% — grow equally, shrink, basis 0 */\n.item { flex: none; }       /* flex: 0 0 auto — fixed size, no grow/shrink */\n.item { flex: 0 0 300px; }  /* fixed 300px, no grow, no shrink */\n.item { flex: 2 1 0%; }     /* takes 2x space compared to flex: 1 siblings */\n\n/* ── Common layouts ─────────────────────────────── */\n/* Sidebar + main content */\n.layout {\n  display: flex;\n  gap: 24px;\n}\n.sidebar { flex: 0 0 250px; }  /* fixed 250px sidebar */\n.main    { flex: 1; }          /* main fills remaining space */\n\n/* Equal-width columns */\n.columns { display: flex; gap: 16px; }\n.columns > * { flex: 1; }  /* all children equal width */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Flex Items — grow, shrink, basis & order — common patterns you'll see in production.\n// APPROACH  - Combine Flex Items — grow, shrink, basis & order with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Fixed + fluid + fixed (holy grail) */\n.holy-grail { display: flex; }\n.left-sidebar  { flex: 0 0 200px; }\n.content       { flex: 1; }\n.right-sidebar { flex: 0 0 200px; }\n\n/* ── align-self — per-item cross-axis alignment ──── */\n.container { display: flex; align-items: flex-start; }\n.special   { align-self: center; }    /* this one is centered */\n.bottom    { align-self: flex-end; }   /* this one at bottom */\n\n/* ── order — visual reorder ─────────────────────── */\n.first-visually  { order: -1; }  /* moves before default (0) */\n.last-visually   { order: 1; }   /* moves after default (0) */\n\n/* ── Responsive cards with wrapping ─────────────── */\n.card-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 24px;\n}\n.card {\n  flex: 1 1 300px;  /* grow, shrink, min 300px — auto-wraps! */\n  max-width: 400px;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Flex Items — grow, shrink, basis & order — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Sticky footer pattern ──────────────────────── */\nbody {\n  display: flex;\n  flex-direction: column;\n  min-height: 100vh;\n}\nmain   { flex: 1; }   /* main grows, pushing footer down */\nfooter { flex: none; } /* footer stays at natural height */"
                  }
        ],
        tips: [
                  "flex: 1 1 300px on wrapped items creates a responsive grid without media queries — items wrap when narrower than 300px.",
                  "flex: 1 makes an item fill available space — perfect for the main content area next to a fixed sidebar.",
                  "The sticky footer pattern (body as flex column, main with flex: 1) works everywhere — no JavaScript needed.",
                  "align-self lets you break one item out of the group alignment — center a button while others are at the top."
        ],
        mistake: "Using flex-basis: 0 without flex-grow — the item collapses to zero width. flex: 1 sets basis to 0 AND grow to 1, which is the correct combination.",
        shorthand: {
          verbose: "flex-grow: 1;\nflex-shrink: 1;\nflex-basis: auto;\norder: 0;",
          concise: "flex: 1;\norder: 0;",
        },
      },
    ],
  },

  // ── Section 4: CSS Grid ─────────────────────────────────────────
  {
    id: "grid",
    title: "CSS Grid",
    entries: [
      {
        id: "grid-container",
        fn: "Grid Container — Rows, Columns & Areas",
        desc: "Two-dimensional layout — define rows, columns, and named areas for complex page layouts.",
        category: "Grid",
        subtitle: "grid-template-columns, grid-template-rows, grid-template-areas, gap",
        signature: "display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;",
        descLong: "CSS Grid is a two-dimensional layout system. Define columns and rows on the container, and items automatically fill the grid. fr units distribute free space proportionally. repeat() avoids repetition. minmax() sets size constraints. auto-fill/auto-fit create responsive grids without media queries. grid-template-areas lets you name regions and place items by name — the most readable way to define complex layouts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Grid Container — Rows, Columns & Areas — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Basic grid ─────────────────────────────────── */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */\n  gap: 24px;\n}\n\n/* ── fr units — fractional free space ───────────── */\n.layout {\n  display: grid;\n  grid-template-columns: 250px 1fr;      /* sidebar + fluid main */\n  grid-template-columns: 1fr 2fr 1fr;    /* 1:2:1 ratio */\n  grid-template-columns: auto 1fr auto;  /* content-sized + fluid */\n}\n\n/* ── repeat() ───────────────────────────────────── */\ngrid-template-columns: repeat(4, 1fr);          /* 4 equal columns */\ngrid-template-columns: repeat(3, 1fr 2fr);      /* pattern: 1fr 2fr 1fr 2fr 1fr 2fr */\n\n/* ── Responsive grid — auto-fill / auto-fit ────── */\n.responsive-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 24px;\n}\n/* Creates as many 300px+ columns as fit — fully responsive, no media queries! */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Grid Container — Rows, Columns & Areas — common patterns you'll see in production.\n// APPROACH  - Combine Grid Container — Rows, Columns & Areas with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* auto-fit vs auto-fill:\n   auto-fill: keeps empty tracks (space remains)\n   auto-fit:  collapses empty tracks (items stretch) */\n\n/* ── grid-template-areas — named layout ─────────── */\n.page {\n  display: grid;\n  grid-template-areas:\n    \"header header  header\"\n    \"nav    content sidebar\"\n    \"footer footer  footer\";\n  grid-template-columns: 200px 1fr 200px;\n  grid-template-rows: auto 1fr auto;\n  min-height: 100vh;\n}\n\n.header  { grid-area: header; }\n.nav     { grid-area: nav; }\n.content { grid-area: content; }\n.sidebar { grid-area: sidebar; }\n.footer  { grid-area: footer; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Grid Container — Rows, Columns & Areas — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Explicit rows ──────────────────────────────── */\n.grid {\n  grid-template-rows: 60px 1fr 40px;        /* header, content, footer */\n  grid-auto-rows: minmax(100px, auto);       /* implicit rows: at least 100px */\n}\n\n/* ── Alignment (works like flexbox) ─────────────── */\n.grid {\n  justify-items: center;   /* horizontal alignment of items in their cells */\n  align-items: center;     /* vertical alignment */\n  place-items: center;     /* shorthand for both */\n\n  justify-content: center; /* horizontal alignment of the entire grid */\n  align-content: center;   /* vertical alignment of the grid */\n  place-content: center;   /* shorthand for both */\n}"
                  }
        ],
        tips: [
                  "repeat(auto-fill, minmax(300px, 1fr)) is the most useful one-liner — fully responsive grid, zero media queries.",
                  "grid-template-areas is the most readable way to define page layouts — the code looks like the visual layout.",
                  "Use fr units instead of percentages — fr accounts for gaps automatically, percentages don't.",
                  "place-items: center is the shortest way to center items in their grid cells — combines justify + align."
        ],
        mistake: "Using auto-fit when you want consistent column widths — auto-fit stretches items to fill space, so 2 items in a 4-column grid become 2 giant columns. Use auto-fill to maintain the column size.",
        shorthand: {
          verbose: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngrid-template-rows: auto;\ngrid-gap: 16px;",
          concise: "display: grid;\ngrid-template-columns: repeat(3, 1fr);\ngap: 16px;",
        },
      },
      {
        id: "grid-items",
        fn: "Grid Item Placement — Spanning & Positioning",
        desc: "Place items across rows and columns — span, named lines, and explicit positioning.",
        category: "Grid",
        subtitle: "grid-column, grid-row, span, grid-area",
        signature: "grid-column: 1 / 3  |  grid-column: span 2  |  grid-row: 1 / -1",
        descLong: "Grid items can be explicitly placed using line numbers. grid-column: 1 / 3 spans columns 1 to 3. grid-column: span 2 spans 2 columns from wherever the item is. Negative numbers count from the end: grid-column: 1 / -1 spans the full width. grid-area is shorthand for row-start / column-start / row-end / column-end. Items can overlap — use z-index to control stacking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Grid Item Placement — Spanning & Positioning — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Column / row placement ──────────────────────── */\n.wide {\n  grid-column: 1 / 3;       /* columns 1 to 3 (spans 2) */\n  grid-column: 1 / -1;      /* full width (1 to last line) */\n  grid-column: span 2;      /* span 2 columns from auto position */\n}\n\n.tall {\n  grid-row: 1 / 3;          /* rows 1 to 3 */\n  grid-row: span 3;         /* span 3 rows */\n}\n\n/* ── Dashboard layout example ───────────────────── */\n.dashboard {\n  display: grid;\n  grid-template-columns: repeat(4, 1fr);\n  grid-auto-rows: minmax(150px, auto);\n  gap: 16px;\n}\n\n.stat-card  { /* takes 1x1 by default */ }\n.chart      { grid-column: span 2; grid-row: span 2; }\n.full-width { grid-column: 1 / -1; }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Grid Item Placement — Spanning & Positioning — common patterns you'll see in production.\n// APPROACH  - Combine Grid Item Placement — Spanning & Positioning with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Named grid lines ───────────────────────────── */\n.layout {\n  grid-template-columns:\n    [sidebar-start] 250px [sidebar-end content-start] 1fr [content-end];\n}\n.sidebar { grid-column: sidebar-start / sidebar-end; }\n.content { grid-column: content-start / content-end; }\n\n/* ── Overlapping items ──────────────────────────── */\n.hero-image {\n  grid-column: 1 / -1;\n  grid-row: 1 / 3;\n}\n.hero-text {\n  grid-column: 1 / 3;\n  grid-row: 1 / 3;     /* same area — overlaps! */\n  z-index: 1;           /* on top of image */\n  align-self: center;\n  padding: 40px;\n  color: white;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Grid Item Placement — Spanning & Positioning — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── Subgrid (inherit parent grid tracks) ────────── */\n.card-grid {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 24px;\n}\n.card {\n  display: grid;\n  grid-template-rows: subgrid;  /* use parent's row tracks */\n  grid-row: span 3;             /* card spans 3 parent rows */\n}\n/* All card headers, bodies, footers align across columns! */"
                  }
        ],
        tips: [
                  "grid-column: 1 / -1 is the most reliable \"full width\" — it works regardless of how many columns exist.",
                  "subgrid aligns nested grid items with the parent grid — essential for card layouts where headers should line up.",
                  "Grid items can overlap by placing them in the same area — great for hero sections with text over images.",
                  "span 2 is simpler than calculating exact line numbers — use it when you just need an item to be wider/taller."
        ],
        mistake: "Forgetting that grid line numbers are 1-based, not 0-based — grid-column: 0 is invalid. The first line is 1, and the last line of a 3-column grid is 4 (or -1).",
        shorthand: {
          verbose: "grid-column-start: 1;\ngrid-column-end: 3;\ngrid-row-start: 1;\ngrid-row-end: 2;",
          concise: "grid-column: 1 / 3;\ngrid-row: 1 / 2;",
        },
      },
    ],
  },

  // ── Section 5: Colors & Typography ─────────────────────────────────────────
  {
    id: "colors-typography",
    title: "Colors & Typography",
    entries: [
      {
        id: "modern-colors",
        fn: "Modern Color Systems — HSL, oklch, color-mix",
        desc: "Define colors with intuitive models — HSL for human-readable, oklch for perceptual uniformity, color-mix for blending.",
        category: "Colors",
        subtitle: "hsl(), oklch(), color-mix(), currentColor, accent-color",
        signature: "hsl(220 90% 56%)  |  oklch(70% 0.15 250)  |  color-mix(in srgb, red 50%, blue)",
        descLong: "Modern CSS offers powerful color functions beyond hex and rgb. hsl() is human-readable: hue (0-360°), saturation (%), lightness (%). oklch() is perceptually uniform: same lightness looks equally bright across hues. color-mix() blends two colors in any color space. All support alpha (transparency) as a fourth value. currentColor inherits the text color — useful for borders and SVGs. accent-color themes form controls.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modern Color Systems — HSL, oklch, color-mix — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── HSL — human-readable ────────────────────────── */\n.primary {\n  color: hsl(220 90% 56%);              /* blue */\n  color: hsl(220 90% 56% / 0.8);        /* 80% opacity */\n}\n\n/* Easy to create color variations */\n:root {\n  --hue: 220;\n  --primary:       hsl(var(--hue) 90% 56%);\n  --primary-light: hsl(var(--hue) 90% 70%);\n  --primary-dark:  hsl(var(--hue) 90% 40%);\n  --primary-bg:    hsl(var(--hue) 90% 96%);\n}\n\n/* ── oklch — perceptually uniform ───────────────── */\n/* Same lightness (60%) looks equally bright for ALL hues */\n.red    { color: oklch(60% 0.2 25); }\n.green  { color: oklch(60% 0.2 145); }\n.blue   { color: oklch(60% 0.2 265); }\n\n/* Design system with oklch */\n:root {\n  --brand: oklch(65% 0.19 250);\n  --brand-hover: oklch(55% 0.19 250);    /* just darken L */\n  --brand-subtle: oklch(95% 0.03 250);   /* very light bg */\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modern Color Systems — HSL, oklch, color-mix — common patterns you'll see in production.\n// APPROACH  - Combine Modern Color Systems — HSL, oklch, color-mix with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── color-mix() — blend colors ─────────────────── */\n.hover-bg {\n  background: color-mix(in srgb, var(--primary) 10%, transparent);\n}\n\n.muted {\n  color: color-mix(in oklch, var(--text-color) 60%, transparent);\n}\n\n/* Create a palette from one color */\n:root {\n  --base: dodgerblue;\n  --light: color-mix(in oklch, var(--base) 30%, white);\n  --dark:  color-mix(in oklch, var(--base) 70%, black);\n}\n\n/* ── currentColor — inherit text color ──────────── */\n.btn {\n  color: dodgerblue;\n  border: 2px solid currentColor;  /* same as text color */\n}\n.btn svg { fill: currentColor; }   /* icon matches text */"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modern Color Systems — HSL, oklch, color-mix — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* ── accent-color — theme form controls ─────────── */\n:root {\n  accent-color: dodgerblue;\n}\n/* Checkboxes, radios, range sliders, progress bars all use this color */\n\n/* ── Light/dark with light-dark() ───────────────── */\n:root {\n  color-scheme: light dark;\n}\n.card {\n  background: light-dark(#ffffff, #1a1a2e);\n  color: light-dark(#111, #eee);\n}"
                  }
        ],
        tips: [
                  "oklch is the future of CSS color — same lightness value produces visually equal brightness across all hues.",
                  "Create a full color palette with one hue variable + HSL lightness variations — change the hue, entire theme updates.",
                  "color-mix(in oklch, ...) produces better blends than srgb — no muddy middle tones.",
                  "accent-color themes ALL native form controls with one line — no more custom checkbox hacks for basic theming."
        ],
        mistake: "Using hex colors for a design system — you can't easily create variations. hsl(220 90% 56%) is the same blue, but you can generate light/dark variants by changing the lightness.",
        shorthand: {
          verbose: "color: #1e40af;\nbackground-color: #dbeafe;\nborder-color: #0284c7;\nbox-shadow: 0 0 0 2px rgba(3, 102, 214, 0.5);",
          concise: "color: hsl(220 90% 56%);\nbackground: hsl(220 84% 78%);\nborder-color: hsl(200 100% 50%);\nbox-shadow: 0 0 0 2px hsl(220 90% 56% / 0.5);",
        },
      },
      {
        id: "typography",
        fn: "Typography — Fonts, Sizing & Text Layout",
        desc: "System fonts, fluid type, line clamping, and text styling — modern approaches to readable typography.",
        category: "Typography",
        subtitle: "font, clamp(), line-clamp, text-wrap: balance",
        signature: "font-size: clamp(1rem, 2.5vw, 2rem)  |  text-wrap: balance",
        descLong: "Modern CSS typography uses system font stacks for performance, clamp() for fluid responsive sizing, -webkit-line-clamp for truncation, and text-wrap: balance for even-looking headings. font-display: swap prevents invisible text during web font loading. Variable fonts provide multiple weights in one file. Use rem for sizing (respects user preferences) and unitless line-height.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Typography — Fonts, Sizing & Text Layout — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── System font stack ───────────────────────────── */\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont,\n    \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n  line-height: 1.6;      /* unitless — multiplied by font-size */\n  -webkit-font-smoothing: antialiased;\n}\n\n/* Monospace */\ncode, pre {\n  font-family: ui-monospace, \"Cascadia Code\", \"Fira Code\",\n    Menlo, Consolas, monospace;\n}\n\n/* ── Fluid typography with clamp() ──────────────── */\nh1 { font-size: clamp(2rem, 5vw, 4rem); }\nh2 { font-size: clamp(1.5rem, 3vw, 2.5rem); }\np  { font-size: clamp(1rem, 1.5vw, 1.25rem); }\n/* Min size, preferred (viewport-relative), max size */\n\n/* ── Text wrapping ──────────────────────────────── */\nh1 { text-wrap: balance; }     /* even line lengths for headings */\np  { text-wrap: pretty; }      /* avoid orphan words on last line */"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Typography — Fonts, Sizing & Text Layout — common patterns you'll see in production.\n// APPROACH  - Combine Typography — Fonts, Sizing & Text Layout with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Line clamping (truncate after N lines) ──────── */\n.excerpt {\n  display: -webkit-box;\n  -webkit-line-clamp: 3;\n  -webkit-box-orient: vertical;\n  overflow: hidden;\n}\n\n/* Single line truncation */\n.title {\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n/* ── Variable fonts ─────────────────────────────── */\n@font-face {\n  font-family: \"Inter\";\n  src: url(\"/fonts/Inter-Variable.woff2\") format(\"woff2\");\n  font-weight: 100 900;     /* full weight range */\n  font-display: swap;        /* show fallback immediately */\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Typography — Fonts, Sizing & Text Layout — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.thin    { font-weight: 300; }\n.regular { font-weight: 400; }\n.bold    { font-weight: 700; }\n.black   { font-weight: 900; }\n.between { font-weight: 550; }  /* any value in range! */\n\n/* ── Font feature settings ──────────────────────── */\n.tabular-nums {\n  font-variant-numeric: tabular-nums;  /* fixed-width numbers for tables */\n}\n.oldstyle-nums {\n  font-variant-numeric: oldstyle-nums; /* numbers with descenders */\n}\n.small-caps {\n  font-variant-caps: small-caps;\n}"
                  }
        ],
        tips: [
                  "clamp(1rem, 2.5vw, 2rem) creates fluid text that smoothly scales — no breakpoints needed for font sizes.",
                  "text-wrap: balance makes headings look polished — lines break more evenly instead of one long line + one short.",
                  "font-display: swap shows the fallback font immediately, then swaps in the web font — no invisible text.",
                  "font-variant-numeric: tabular-nums makes numbers align in columns — essential for data tables and prices."
        ],
        mistake: "Setting line-height with units (line-height: 24px) — it doesn't scale with font-size changes. Use unitless values (line-height: 1.6) so it's always proportional.",
        shorthand: {
          verbose: "font-family: \"Georgia\", serif;\nfont-size: 1rem;\nfont-weight: 400;\nfont-style: normal;\nline-height: 1.6;\nletter-spacing: 0;",
          concise: "font: 400 1rem / 1.6 \"Georgia\", serif;\nletter-spacing: 0;",
        },
      },
    ],
  },

  // ── Section 6: Custom Properties & Transitions ─────────────────────────────────────────
  {
    id: "custom-props",
    title: "Custom Properties & Transitions",
    entries: [
      {
        id: "custom-properties",
        fn: "Custom Properties (CSS Variables)",
        desc: "Define reusable values with -- prefix — theming, dark mode, responsive design, and component APIs.",
        category: "Variables",
        subtitle: "--name: value, var(--name), var(--name, fallback)",
        signature: ":root { --color: blue; }  |  color: var(--color, gray);",
        descLong: "Custom properties (CSS variables) store values for reuse. Defined with -- prefix, accessed with var(). They cascade and inherit like regular properties — set on :root for globals, on components for scoped values. They're live: changing a variable updates all uses instantly (great for themes and dark mode). Unlike preprocessor variables (Sass $var), they exist at runtime and can be changed via JavaScript.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Properties (CSS Variables) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Global theme variables ──────────────────────── */\n:root {\n  /* Colors */\n  --color-primary: hsl(220 90% 56%);\n  --color-primary-hover: hsl(220 90% 46%);\n  --color-surface: #ffffff;\n  --color-text: #111827;\n  --color-muted: #6b7280;\n\n  /* Spacing scale */\n  --space-xs: 4px;\n  --space-sm: 8px;\n  --space-md: 16px;\n  --space-lg: 24px;\n  --space-xl: 48px;\n\n  /* Typography */\n  --font-sans: system-ui, sans-serif;\n  --font-mono: ui-monospace, monospace;\n\n  /* Borders */\n  --radius-sm: 4px;\n  --radius-md: 8px;\n  --radius-lg: 16px;\n  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Properties (CSS Variables) — common patterns you'll see in production.\n// APPROACH  - Combine Custom Properties (CSS Variables) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* ── Dark mode override ─────────────────────────── */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --color-surface: #0f172a;\n    --color-text: #f1f5f9;\n    --color-muted: #94a3b8;\n  }\n}\n\n/* Manual dark mode toggle */\n[data-theme=\"dark\"] {\n  --color-surface: #0f172a;\n  --color-text: #f1f5f9;\n}\n\n/* ── Component-scoped variables ─────────────────── */\n.btn {\n  --btn-bg: var(--color-primary);\n  --btn-color: white;\n  --btn-padding: var(--space-sm) var(--space-md);\n\n  background: var(--btn-bg);\n  color: var(--btn-color);\n  padding: var(--btn-padding);\n  border-radius: var(--radius-md);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Properties (CSS Variables) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.btn:hover { --btn-bg: var(--color-primary-hover); }\n\n/* Variants override the variable */\n.btn-outline {\n  --btn-bg: transparent;\n  --btn-color: var(--color-primary);\n  border: 2px solid var(--color-primary);\n}\n\n/* ── Fallback values ────────────────────────────── */\n.card {\n  background: var(--card-bg, var(--color-surface));  /* nested fallback */\n  padding: var(--card-padding, var(--space-md));\n}\n\n/* ── JS interaction ─────────────────────────────── */\n/* document.documentElement.style.setProperty('--color-primary', 'red') */"
                  }
        ],
        tips: [
                  "Define component APIs with scoped variables — consumers override --btn-bg without touching internal styles.",
                  "var(--x, fallback) provides a default — var(--card-bg, white) uses white if --card-bg isn't defined.",
                  "Dark mode is just changing a few :root variables — all components update automatically if they use variables.",
                  "JS can set variables with element.style.setProperty(\"--x\", value) — bridges CSS and JavaScript."
        ],
        mistake: "Defining variables on * (universal selector) instead of :root — variables on * don't inherit properly and cause performance issues. Use :root for globals, specific selectors for scoped variables.",
        shorthand: {
          verbose: ":root {\n  --primary-color: #3b82f6;\n  --text-size: 16px;\n  --spacing: 8px;\n}\n.card {\n  color: #3b82f6;\n  padding: 8px;\n  font-size: 16px;\n}",
          concise: ":root {\n  --primary: #3b82f6;\n  --spacing: 8px;\n}\n.card {\n  color: var(--primary);\n  padding: var(--spacing);\n}",
        },
      },
      {
        id: "transitions-animations",
        fn: "Transitions & Animations",
        desc: "Smooth state changes with transitions, complex motion with keyframes, and scroll-driven animations.",
        category: "Motion",
        subtitle: "transition, @keyframes, animation, scroll-timeline",
        signature: "transition: all 0.3s ease  |  animation: fade-in 0.5s ease-out",
        descLong: "Transitions animate property changes between states (hover, focus, class toggle). @keyframes define multi-step animations. transition is for simple A→B changes; animation is for complex multi-step or looping motion. Modern: scroll-driven animations tie animation progress to scroll position (no JS). prefers-reduced-motion respects user preferences for less motion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Transitions & Animations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Transitions ─────────────────────────────────── */\n.btn {\n  background: var(--color-primary);\n  transform: translateY(0);\n  transition: background 0.2s ease, transform 0.2s ease;\n}\n.btn:hover {\n  background: var(--color-primary-hover);\n  transform: translateY(-2px);\n}\n\n/* Transition specific properties (not 'all') for performance */\n.card {\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n}\n.card:hover {\n  transform: translateY(-4px);\n  box-shadow: 0 12px 24px rgb(0 0 0 / 0.15);\n}\n\n/* ── Keyframe animations ────────────────────────── */\n@keyframes fade-in {\n  from { opacity: 0; transform: translateY(10px); }\n  to   { opacity: 1; transform: translateY(0); }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Transitions & Animations — common patterns you'll see in production.\n// APPROACH  - Combine Transitions & Animations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n.animate-in {\n  animation: fade-in 0.5s ease-out forwards;\n}\n\n/* Multi-step animation */\n@keyframes pulse {\n  0%, 100% { transform: scale(1); }\n  50%      { transform: scale(1.05); }\n}\n\n.pulse { animation: pulse 2s ease-in-out infinite; }\n\n/* Staggered entrance */\n.item { animation: fade-in 0.4s ease-out backwards; }\n.item:nth-child(1) { animation-delay: 0.0s; }\n.item:nth-child(2) { animation-delay: 0.1s; }\n.item:nth-child(3) { animation-delay: 0.2s; }\n\n/* ── Scroll-driven animation ────────────────────── */\n@keyframes reveal {\n  from { opacity: 0; transform: translateY(30px); }\n  to   { opacity: 1; transform: translateY(0); }\n}\n\n.scroll-reveal {\n  animation: reveal linear both;\n  animation-timeline: view();      /* tied to element visibility */\n  animation-range: entry 0% entry 100%;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Transitions & Animations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/* Progress bar tied to page scroll */\n.scroll-progress {\n  animation: grow-width linear;\n  animation-timeline: scroll();    /* tied to scroll position */\n}\n@keyframes grow-width {\n  from { transform: scaleX(0); }\n  to   { transform: scaleX(1); }\n}\n\n/* ── Respect user preferences ───────────────────── */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}"
                  }
        ],
        tips: [
                  "Transition only the properties that change — transition: all is a performance trap on complex elements.",
                  "Only animate transform and opacity for 60fps — other properties (width, height, top) trigger expensive layout recalculations.",
                  "animation-timeline: view() creates scroll-driven reveals without any JavaScript — pure CSS.",
                  "Always include prefers-reduced-motion: reduce — some users experience motion sickness from animations."
        ],
        mistake: "Animating width/height/top/left — these trigger layout recalculation every frame (jank). Use transform: translateX/Y for movement and transform: scale for size changes — GPU-accelerated and smooth.",
        shorthand: {
          verbose: "color: #1e40af;\nbackground-color: #dbeafe;\nborder-color: #0284c7;\nbox-shadow: 0 0 0 2px rgba(3, 102, 214, 0.5);",
          concise: "color: hsl(220 90% 56%);\nbackground: hsl(220 84% 78%);\nborder-color: hsl(200 100% 50%);\nbox-shadow: 0 0 0 2px hsl(220 90% 56% / 0.5);",
        },
      },
    ],
  },

  // ── Section 7: Responsive Design ─────────────────────────────────────────
  {
    id: "responsive",
    title: "Responsive Design",
    entries: [
      {
        id: "media-container-queries",
        fn: "Media Queries & Container Queries",
        desc: "Adapt layouts to viewport size with media queries and to component size with container queries.",
        category: "Responsive",
        subtitle: "@media, @container, min-width, prefers-color-scheme",
        signature: "@media (min-width: 768px) { }  |  @container (min-width: 400px) { }",
        descLong: "Media queries adapt to the viewport: @media (min-width: 768px) targets tablets and up. Mobile-first means writing base styles for mobile, then adding complexity in min-width queries. Container queries adapt to the parent container's size — a card can change layout based on where it's placed, not the viewport. Preference queries detect dark mode, reduced motion, and contrast preferences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Media Queries & Container Queries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Mobile-first media queries ──────────────────── */\n/* Base: mobile styles */\n.grid {\n  display: grid;\n  grid-template-columns: 1fr;\n  gap: 16px;\n}\n\n/* Tablet (768px+) */\n@media (min-width: 768px) {\n  .grid { grid-template-columns: repeat(2, 1fr); }\n}\n\n/* Desktop (1024px+) */\n@media (min-width: 1024px) {\n  .grid { grid-template-columns: repeat(3, 1fr); }\n}\n\n/* Large desktop (1280px+) */\n@media (min-width: 1280px) {\n  .grid { grid-template-columns: repeat(4, 1fr); }\n}\n\n/* ── Container queries ──────────────────────────── */\n/* Define containment on parent */\n.card-wrapper {\n  container-type: inline-size;\n  container-name: card;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Media Queries & Container Queries — common patterns you'll see in production.\n// APPROACH  - Combine Media Queries & Container Queries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Card layout adapts to ITS container, not viewport */\n.card { display: flex; flex-direction: column; }\n\n@container card (min-width: 400px) {\n  .card {\n    flex-direction: row;        /* horizontal layout when wide enough */\n    align-items: center;\n  }\n  .card img { width: 150px; }\n}\n\n@container card (min-width: 600px) {\n  .card { gap: 24px; }\n  .card .actions { display: flex; }\n}\n\n/* ── Preference queries ─────────────────────────── */\n@media (prefers-color-scheme: dark) {\n  :root {\n    --bg: #0f172a;\n    --text: #e2e8f0;\n  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * { animation-duration: 0.01ms !important; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Media Queries & Container Queries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n@media (prefers-contrast: more) {\n  :root { --border-color: #000; }\n}\n\n/* ── Range syntax (modern) ──────────────────────── */\n@media (768px <= width < 1024px) {\n  /* tablet only */\n}\n\n@media (width >= 1024px) {\n  /* desktop and up */\n}\n\n/* ── Responsive units ───────────────────────────── */\n.hero {\n  padding: clamp(2rem, 5vw, 6rem);\n  font-size: clamp(1.5rem, 4vw, 3rem);\n  min-height: 100dvh;    /* dvh = dynamic viewport height (mobile-friendly) */\n}"
                  }
        ],
        tips: [
                  "Container queries let the same card component adapt in sidebar vs main content — media queries can't do this.",
                  "Mobile-first (min-width) produces cleaner CSS than desktop-first (max-width) — base is simple, complexity is added.",
                  "dvh (dynamic viewport height) accounts for mobile browser chrome — 100vh causes overflow on iOS, 100dvh doesn't.",
                  "The range syntax (768px <= width < 1024px) is more readable than min-width + max-width combinations."
        ],
        mistake: "Using only media queries for component layout — a card in a sidebar and in main content gets the same styles at the same viewport width. Container queries make components truly reusable.",
        shorthand: {
          verbose: "font-family: \"Georgia\", serif;\nfont-size: 1rem;\nfont-weight: 400;\nfont-style: normal;\nline-height: 1.6;\nletter-spacing: 0;",
          concise: "font: 400 1rem / 1.6 \"Georgia\", serif;\nletter-spacing: 0;",
        },
      },
      {
        id: "modern-css-features",
        fn: "Modern CSS Features — Nesting, :has, Scroll Snap",
        desc: "Native CSS nesting, parent selector :has(), scroll snap, and other cutting-edge features.",
        category: "Modern CSS",
        subtitle: "CSS nesting, :has(), scroll-snap, aspect-ratio, @scope",
        signature: ".card { &:hover { } & .title { } }  |  scroll-snap-type: x mandatory",
        descLong: "Native CSS nesting (no preprocessor needed) groups related styles. :has() selects parents based on children (the \"parent selector\"). scroll-snap creates carousels and paginated scrolling. aspect-ratio maintains proportions. @scope limits styles to a DOM subtree. These features reduce JavaScript dependencies and preprocessor reliance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modern CSS Features — Nesting, :has, Scroll Snap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n/* ── Native CSS nesting ──────────────────────────── */\n.card {\n  padding: 16px;\n  border-radius: 8px;\n\n  & .title {\n    font-size: 1.25rem;\n    font-weight: 600;\n  }\n\n  & .body {\n    color: var(--color-muted);\n  }\n\n  &:hover {\n    box-shadow: var(--shadow-md);\n  }\n\n  &.featured {\n    border: 2px solid var(--color-primary);\n  }\n\n  @media (min-width: 768px) {\n    & { padding: 24px; }  /* media queries nest too! */\n  }\n}\n\n/* ── :has() — style parents based on children ────── */\n/* Form group with error */\n.form-group:has(.error) {\n  border-color: red;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modern CSS Features — Nesting, :has, Scroll Snap — common patterns you'll see in production.\n// APPROACH  - Combine Modern CSS Features — Nesting, :has, Scroll Snap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/* Figure with caption gets less margin */\nfigure:has(figcaption) {\n  margin-bottom: 0.5em;\n}\n\n/* Nav with many items switches to hamburger */\nnav:has(> :nth-child(6)) {\n  /* more than 5 children? show mobile menu */\n}\n\n/* ── Scroll snap ────────────────────────────────── */\n/* Horizontal carousel */\n.carousel {\n  display: flex;\n  overflow-x: auto;\n  scroll-snap-type: x mandatory;\n  gap: 16px;\n  scroll-padding: 16px;\n}\n\n.carousel > * {\n  scroll-snap-align: start;\n  flex: 0 0 300px;\n}\n\n/* Full-page vertical snapping */\n.page-sections {\n  scroll-snap-type: y mandatory;\n  overflow-y: scroll;\n  height: 100vh;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modern CSS Features — Nesting, :has, Scroll Snap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.page-sections > section {\n  scroll-snap-align: start;\n  height: 100vh;\n}\n\n/* ── aspect-ratio ───────────────────────────────── */\n.video-embed { aspect-ratio: 16 / 9; }\n.avatar      { aspect-ratio: 1; border-radius: 50%; }\n.card-image  { aspect-ratio: 4 / 3; object-fit: cover; }\n\n/* ── @scope — limit styles to a subtree ─────────── */\n@scope (.card) to (.card-body) {\n  /* Styles only apply between .card and .card-body */\n  p { margin: 0; }\n  a { color: inherit; }\n}"
                  }
        ],
        tips: [
                  "Native CSS nesting works in all modern browsers — no Sass/PostCSS needed for & nesting anymore.",
                  ":has() + :nth-child creates quantity queries — style a container differently based on how many children it has.",
                  "scroll-snap-type: x mandatory creates smooth carousels without any JavaScript library.",
                  "aspect-ratio replaces the old padding-bottom percentage hack — aspect-ratio: 16/9 just works."
        ],
        mistake: "Using the old padding-bottom hack for aspect ratios: .wrapper { padding-bottom: 56.25%; position: relative; } — aspect-ratio: 16/9 does the same thing in one line, with no positioning tricks.",
        shorthand: {
          verbose: ":root {\n  --primary-color: #3b82f6;\n  --text-size: 16px;\n  --spacing: 8px;\n}\n.card {\n  color: #3b82f6;\n  padding: 8px;\n  font-size: 16px;\n}",
          concise: ":root {\n  --primary: #3b82f6;\n  --spacing: 8px;\n}\n.card {\n  color: var(--primary);\n  padding: var(--spacing);\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
