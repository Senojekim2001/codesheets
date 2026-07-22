export const meta = {
  "title": "DOM & Browser APIs",
  "domain": "javascript",
  "sheet": "dom",
  "icon": "🌐"
}

export const sections = [

  // ── Section 1: DOM Core ─────────────────────────────────────────
  {
    id: "dom-core",
    title: "DOM Core",
    entries: [
      {
        id: "query-selector",
        fn: "querySelector() / querySelectorAll()",
        desc: "Select DOM elements using CSS selector syntax. querySelector returns one; querySelectorAll returns a static NodeList.",
        category: "DOM Core",
        subtitle: "CSS-powered element selection",
        signature: "document.querySelector(css)  |  document.querySelectorAll(css)",
        descLong: "querySelector returns the first matching element or null. querySelectorAll returns a static NodeList of all matches. Both accept any valid CSS selector. Call on an element to scope the search to its descendants. Unlike getElementsByClassName, the NodeList from querySelectorAll does not live-update.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of querySelector() / querySelectorAll() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest querySelector: select by ID, class, selector.\n// STRENGTHS - shows querySelector, querySelectorAll with CSS selectors.\n// WEAKNESSES- no iteration, no scoping, no performance notes.\n//\n// GOAL: select elements with CSS selectors\nconst btn = document.querySelector('#submit-btn');\nconst first = document.querySelector('.card');\nconst items = document.querySelectorAll('.list-item');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of querySelector() / querySelectorAll() — common patterns you'll see in production.\n// APPROACH  - Combine querySelector() / querySelectorAll() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - iterate NodeList and scope queries to parent elements.\n// STRENGTHS - covers the 80% case: spread NodeList, scoped querySelector.\n// WEAKNESSES- no live vs static discussion, no performance comparison.\n//\n// GOAL: iterate over matches and scope queries\n// WHY: NodeList is not an Array — spread it for array methods\nconst items = document.querySelectorAll('.list-item');\n[...items].forEach(item => item.classList.add('active'));\n// WHY: scoped query searches only descendants\nconst nav = document.querySelector('nav');\nconst links = nav.querySelectorAll('a');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of querySelector() / querySelectorAll() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production DOM selection: cached selectors, live vs static\n//             collections, scoped search utilities, and performance\n//             comparison of query methods.\n// STRENGTHS - cached selector utility; live vs static tradeoffs;\n//             scoped search helper; performance guidance.\n// WEAKNESSES- no IntersectionObserver integration; no Shadow DOM.\n//\n// GOAL: choose query methods for performance\n// WHY: querySelectorAll returns a static snapshot (not live)\n// WHY: getElementById is faster than querySelector('#id')\n// Cached selector: avoid repeated DOM queries\nconst queryCache = new WeakMap();\nfunction $(selector, parent = document) {\n  const key = selector + (parent === document ? '' : ':' + parent.id);\n  if (queryCache.has(parent)) {\n    const cache = queryCache.get(parent);\n    if (cache.has(key)) return cache.get(key);\n  }\n  const result = parent.querySelector(selector);\n  if (queryCache.has(parent)) queryCache.get(parent).set(key, result);\n  else queryCache.set(parent, new Map([[key, result]]));\n  return result;\n}\n// Live vs static collections\nconst liveItems = document.getElementsByClassName('item');    // HTMLCollection — live\nconst staticItems = document.querySelectorAll('.item');         // NodeList — static\n// liveItems updates automatically when DOM changes; staticItems does not\n// Scoped search helper with null safety\nfunction queryAll(selector, parent = document) {\n  return [...parent.querySelectorAll(selector)];\n}\nfunction queryFirst(selector, parent = document) {\n  return parent.querySelector(selector) ?? null;\n}\n// Performance: getElementById is O(1) hash lookup\n// querySelector('#id') is O(n) selector matching\n// For ID lookups in hot code, prefer getElementById\n// Decision rule:\n//   unique element by ID                              -> getElementById\n//   first matching element                             -> querySelector\n//   all matching elements                              -> querySelectorAll\n//   live collection needed                             -> getElementsByTagName/ClassName\n//   scoped search                                      -> parent.querySelectorAll\n//   repeated same query                                -> cache the result\n//\n// Anti-pattern: calling .map() directly on a NodeList; querying DOM\n//   in a loop instead of caching."
                  }
        ],
        tips: [
                  "Scope queries to a parent element to avoid scanning the entire document.",
                  "Convert NodeList to Array with [...nodeList] or Array.from() to use .map(), .filter().",
                  "querySelectorAll returns a static snapshot — it does not update if the DOM changes.",
                  "Use #id for single unique elements; .class for groups; [attr] for attribute matches."
        ],
        mistake: "Calling .map() directly on a NodeList — it's not an Array. Spread it first: [...document.querySelectorAll('.item')].map(...).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "getbyid",
        fn: "getElementById()",
        desc: "The fastest way to select a single element by its unique ID.",
        category: "DOM Core",
        subtitle: "Fast single-element lookup by ID",
        signature: "document.getElementById(id)",
        descLong: "getElementById is the most performant DOM selector — internally optimized with a hash lookup. Returns null if not found. IDs must be unique per document. Only available on document, not on element nodes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of getElementById() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest getElementById: fast single-element lookup.\n// STRENGTHS - shows getElementById for form and button elements.\n// WEAKNESSES- no null check, no form validation, no event handling.\n//\n// GOAL: get an element by ID quickly\nconst form = document.getElementById('contact-form');\nconst btn = document.getElementById('submit-btn');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of getElementById() — common patterns you'll see in production.\n// APPROACH  - Combine getElementById() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - getElementById for form validation workflow with null safety.\n// STRENGTHS - covers the 80% case: null checks, form validation, event binding.\n// WEAKNESSES- no error display pattern, no accessibility.\n//\n// GOAL: use getElementById for form validation workflow\n// WHY: fastest selector (hash lookup)\nfunction validateForm() {\n  const form = document.getElementById('contact-form');\n  const emailInput = document.getElementById('email');\n  const nameInput = document.getElementById('name');\n  if (!form || !emailInput || !nameInput) return;\n  const email = emailInput.value.trim();\n  const name = nameInput.value.trim();\n  const errors = [];\n  if (!name) errors.push('Name is required');\n  if (!email.match(/^[^s@]+@[^s@]+.[^s@]+$/)) errors.push('Invalid email');\n  const errorEl = document.getElementById('form-errors');\n  errorEl.textContent = errors.join(', ');\n  errorEl.classList.toggle('visible', errors.length > 0);\n}\ndocument.getElementById('submit-btn')?.addEventListener('click', validateForm);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of getElementById() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production getElementById patterns: typed element helper,\n//             batch lookup utility, and scoped ID fallback with\n//             querySelector for Shadow DOM.\n// STRENGTHS - typed helper with generics; batch lookup; Shadow DOM\n//             fallback; null-safe access patterns.\n// WEAKNESSES- no performance benchmark; no SSR considerations.\n//\n// GOAL: use getElementById efficiently\n// WHY: only available on document, not elements\n// WHY: IDs should be unique; duplicate IDs are invalid HTML\n// Typed element helper with null safety\nfunction getById(id) {\n  const el = document.getElementById(id);\n  if (!el) return null;\n  return el;\n}\n// Usage with type narrowing\nconst input = getById('email');\nif (input instanceof HTMLInputElement) {\n  input.value; // TypeScript knows it's an input\n}\n// Batch lookup utility\nfunction getByIds(ids) {\n  return Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));\n}\nconst { name, email, phone } = getByIds(['name', 'email', 'phone']);\n// All are Element | null — check before use\n// Scoped ID lookup: getElementById is document-only, so use\n// querySelector for scoped searches inside containers\nfunction scopedById(root, id) {\n  // getElementById is global; for scoped, use querySelector\n  return root.querySelector(`#${CSS.escape(id)}`);\n}\n// Shadow DOM: getElementById doesn't pierce shadow boundaries\nfunction deepGetById(root, id) {\n  const el = root.getElementById?.(id);\n  if (el) return el;\n  for (const child of root.children ?? []) {\n    const found = deepGetById(child, id);\n    if (found) return found;\n    if (child.shadowRoot) {\n      const shadowFound = deepGetById(child.shadowRoot, id);\n      if (shadowFound) return shadowFound;\n    }\n  }\n  return null;\n}\n// Decision rule:\n//   selecting a unique element by ID                        -> getElementById\n//   scoped lookup inside an element                         -> element.querySelector('#id')\n//   null safety                                             -> optional chaining or guard\n//   batch ID lookups                                        -> getByIds utility\n//   Shadow DOM elements                                     -> deepGetById traversal\n//\n// Anti-pattern: element.getElementById(); using querySelector('#id')\n//   when getElementById is available (slower)."
                  }
        ],
        tips: [
                  "getElementById is faster than querySelector(\"#id\") — prefer it in performance-sensitive code.",
                  "Always null-check the result before accessing properties.",
                  "Only call on document — unlike querySelector, it's not available on element nodes.",
                  "IDs should be unique in the document — multiple same IDs is invalid HTML."
        ],
        mistake: "Calling element.getElementById() — it's only available on document. Use document.getElementById() or element.querySelector(\"#id\") for scoped lookups.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "classlist",
        fn: "classList",
        desc: "Add, remove, toggle, and check CSS classes on elements without touching className directly.",
        category: "DOM Core",
        subtitle: "Safely manage an element's CSS classes",
        signature: "el.classList.add() | .remove() | .toggle() | .contains()",
        descLong: "classList provides methods to safely modify individual classes without overwriting all classes (as className = \"\" does). .toggle() accepts an optional boolean second argument to force-add or force-remove.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of classList — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest classList: add, remove, toggle, contains.\n// STRENGTHS - shows all four classList methods on a single element.\n// WEAKNESSES- no toggle with boolean, no replace, no theme pattern.\n//\n// GOAL: add, remove, and toggle CSS classes\nconst el = document.querySelector('.card');\nel.classList.add('active');\nel.classList.remove('hidden');\nel.classList.toggle('selected');\nconsole.log(el.classList.contains('active')); // true"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of classList — common patterns you'll see in production.\n// APPROACH  - Combine classList with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - classList for state management and theme toggling.\n// STRENGTHS - covers the 80% case: toggle with boolean, localStorage theme.\n// WEAKNESSES- no replace, no SVG, no data-* attribute pattern.\n//\n// GOAL: use classList for state and themes\n// WHY: toggle with boolean argument is cleaner than if/else\nconst html = document.documentElement;\nconst isDark = localStorage.getItem('theme') === 'dark';\nhtml.classList.toggle('dark-mode', isDark);\ndocument.getElementById('theme-toggle')?.addEventListener('click', () => {\n  html.classList.toggle('dark-mode');\n  localStorage.setItem('theme', html.classList.contains('dark-mode') ? 'dark' : 'light');\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of classList — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production classList patterns: state machine with data-*\n//             attributes, classList.replace, SVG support, and batch\n//             class operations via classList.forEach.\n// STRENGTHS - state machine pattern; replace for transitions; SVG\n//             classList; batch operations; CSS custom properties.\n// WEAKNESSES- no animation coordination; no Web Animations API.\n//\n// GOAL: manage classes safely and performantly\n// WHY: classList.add is idempotent; prefer CSS classes over inline style\n// State machine: use data-* for multi-state, classList for binary\nfunction setState(el, state) {\n  el.dataset.state = state;\n  el.classList.toggle('is-loading', state === 'loading');\n  el.classList.toggle('is-error', state === 'error');\n  el.classList.toggle('is-success', state === 'success');\n  el.classList.toggle('is-idle', state === 'idle');\n}\n// CSS: [data-state=\"loading\"] .spinner { display: block; }\n// classList.replace: swap one class for another (returns boolean)\nconst changed = el.classList.replace('btn-primary', 'btn-secondary');\n// changed === true if 'btn-primary' was present and replaced\n// SVG elements: classList works in modern browsers\nconst svg = document.querySelector('svg');\nsvg.classList.add('animated');\nsvg.classList.toggle('hidden', !isVisible);\n// Batch class operations\nfunction applyClasses(el, add = [], remove = []) {\n  add.forEach(cls => el.classList.add(cls));\n  remove.forEach(cls => el.classList.remove(cls));\n}\napplyClasses(card, ['active', 'highlighted'], ['disabled', 'dimmed']);\n// CSS custom properties for dynamic values (don't use classes for these)\nel.style.setProperty('--rotation', angle + 'deg');\n// CSS: .card { transform: rotate(var(--rotation, 0deg)); }\n// Decision rule:\n//   toggle a boolean state class                          -> classList.toggle\n//   force add/remove with boolean                         -> toggle(cls, bool)\n//   replace one class with another                        -> classList.replace\n//   multiple related states                               -> data-* attributes + toggle\n//   dynamic numeric values                                -> CSS custom properties\n//   batch add/remove                                      -> forEach on classList\n//\n// Anti-pattern: el.className = 'active' (wipes other classes);\n//   using inline style for state that should be a CSS class."
                  }
        ],
        tips: [
                  "classList.toggle(cls, bool) is cleaner than an if/else add/remove pattern.",
                  "Use CSS classes for state (active, hidden, expanded) instead of inline styles.",
                  "classList.add() ignores duplicates — safe to call multiple times.",
                  "classList works on SVG elements too in modern browsers."
        ],
        mistake: "Using el.className = \"active\" which wipes out ALL existing classes. Use classList.add(\"active\") to safely add one class.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "createelement",
        fn: "createElement()",
        desc: "Create new DOM elements in memory before inserting them into the document.",
        category: "DOM Core",
        subtitle: "Programmatically create elements",
        signature: "document.createElement(tagName)",
        descLong: "createElement() creates a detached element — it exists in memory but not yet in the DOM tree. Configure it (set classes, attributes, properties) before inserting. This two-step approach (create, configure, then insert) avoids reflows and repaints. Use append(), prepend(), or insertAdjacentElement() to place it in the DOM.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of createElement() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest createElement: create, set text, insert, remove.\n// STRENGTHS - shows createElement, textContent, appendChild, remove.\n// WEAKNESSES- no attributes, no nested elements, no DocumentFragment.\n//\n// GOAL: create and insert an element\nconst li = document.createElement('li');\nli.textContent = 'New item';\ndocument.body.appendChild(li);\nli.remove();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of createElement() — common patterns you'll see in production.\n// APPROACH  - Combine createElement() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - configure element before inserting: classes, id, dataset, attributes.\n// STRENGTHS - covers the 80% case: off-DOM construction, nested elements.\n// WEAKNESSES- no DocumentFragment, no template element, no XSS discussion.\n//\n// GOAL: configure an element before inserting\n// WHY: off-DOM construction avoids intermediate reflows\nconst li = document.createElement('li');\nli.textContent = 'New item';\nli.classList.add('list-item');\nli.id = 'item-1';\nli.dataset.id = '123';\nli.setAttribute('role', 'menuitem');\nconst span = document.createElement('span');\nspan.textContent = 'Badge';\nli.appendChild(span);\nconst ul = document.querySelector('ul');\nul.appendChild(li);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of createElement() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production element creation: element factory with\n//             attributes/children, DocumentFragment for batch inserts,\n//             <template> for reusable HTML, and XSS-safe text handling.\n// STRENGTHS - element factory function; DocumentFragment batch;\n//             <template> cloning; XSS prevention with textContent.\n// WEAKNESSES- no Web Components; no Shadow DOM; no custom elements.\n//\n// GOAL: create DOM elements efficiently\n// WHY: set text with textContent, not innerHTML (XSS risk)\n// WHY: use DocumentFragment for many nodes\n// Element factory: create configured elements in one call\nfunction h(tag, attrs = {}, ...children) {\n  const el = document.createElement(tag);\n  for (const [key, value] of Object.entries(attrs)) {\n    if (key === 'class') el.className = value;\n    else if (key === 'dataset') Object.assign(el.dataset, value);\n    else if (key.startsWith('on') && typeof value === 'function')\n      el.addEventListener(key.slice(2).toLowerCase(), value);\n    else if (key in el) el[key] = value;\n    else el.setAttribute(key, value);\n  }\n  for (const child of children) {\n    if (typeof child === 'string') el.appendChild(document.createTextNode(child));\n    else if (child instanceof Node) el.appendChild(child);\n  }\n  return el;\n}\n// Usage: h('div', { class: 'card', dataset: { id: 1 } }, 'Hello', h('span', {}, '!'))\n// DocumentFragment: batch insert many nodes (one reflow)\nfunction renderList(items, container) {\n  const frag = document.createDocumentFragment();\n  for (const item of items) {\n    frag.appendChild(h('li', { class: 'item', dataset: { id: item.id } }, item.name));\n  }\n  container.replaceChildren(frag); // modern: clears + appends in one op\n}\n// <template> element: reusable HTML chunks\n// HTML: <template id=\"row-tmpl\"><tr><td class=\"name\"></td><td class=\"qty\"></td></tr></template>\nfunction createRow(data) {\n  const tmpl = document.getElementById('row-tmpl');\n  const clone = tmpl.content.cloneNode(true);\n  clone.querySelector('.name').textContent = data.name; // XSS-safe\n  clone.querySelector('.qty').textContent = String(data.qty);\n  return clone;\n}\n// XSS prevention: never use innerHTML with user data\nfunction safeSetContent(el, html) {\n  // Option 1: textContent (escapes everything)\n  el.textContent = html;\n  // Option 2: DOMParser for trusted-but-sanitized HTML\n  // const parsed = new DOMParser().parseFromString(html, 'text/html');\n  // el.replaceChildren(...parsed.body.childNodes);\n}\n// Decision rule:\n//   single element insertion                               -> createElement + append\n//   many elements                                          -> DocumentFragment\n//   reusable HTML template                                 -> <template> element\n//   element factory (like hyperscript)                     -> h() helper\n//   text from untrusted source                             -> textContent, never innerHTML\n//   clear + insert in one op                               -> replaceChildren()\n//\n// Anti-pattern: inserting in a loop; using innerHTML for user data;\n//   building HTML strings instead of DOM nodes."
                  }
        ],
        tips: [
                  "Building elements off-DOM then inserting once avoids multiple reflows for large structures.",
                  "Configure all properties before inserting — results in better performance.",
                  "Set text with .textContent (safe) — avoid innerHTML for user data (XSS risk).",
                  ".remove() is the modern way to remove an element — no need for parentNode.removeChild()."
        ],
        mistake: "Creating elements and immediately inserting them in a loop — each insertion triggers reflow. Build them all, then insert once with DocumentFragment.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "append",
        fn: "append() / prepend() / before() / after()",
        desc: "Insert elements or text into the DOM relative to a target element.",
        category: "DOM Core",
        subtitle: "Insert nodes and text into the document",
        signature: "parent.append(...nodes)  |  el.before(...nodes)  |  el.after(...nodes)",
        descLong: "append() adds children to the end of an element. prepend() adds them at the start. before() and after() insert relative to the element itself. All methods accept multiple arguments (both nodes and strings). Strings are auto-converted to text nodes. Use appendChild() for single-node insertion in performance-critical code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of append() / prepend() / before() / after() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest insertion: append, prepend, remove.\n// STRENGTHS - shows append, prepend, remove on a single element.\n// WEAKNESSES- no before/after, no multiple args, no strings.\n//\n// GOAL: insert elements relative to others\nconst ul = document.querySelector('ul');\nconst li = document.createElement('li');\nul.append(li);     // end\nul.prepend(li);    // start\nli.remove();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of append() / prepend() / before() / after() — common patterns you'll see in production.\n// APPROACH  - Combine append() / prepend() / before() / after() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - modern insertion methods: before/after, multiple args, replaceWith.\n// STRENGTHS - covers the 80% case: before, after, append with strings, replaceWith.\n// WEAKNESSES- no DocumentFragment, no insertAdjacentHTML, no performance notes.\n//\n// GOAL: use modern insertion methods\n// WHY: append/prepend accept multiple nodes and strings\nconst ref = document.querySelector('.active');\nref.before(li);\nref.after(li);\nul.append('Text', li, document.createElement('span'));\nref.replaceWith(document.createElement('div'));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of append() / prepend() / before() / after() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production insertion patterns: DocumentFragment batch,\n//             insertAdjacentHTML for templated HTML, replaceChildren for\n//             full container swap, and reflow-minimizing strategies.\n// STRENGTHS - DocumentFragment batch; insertAdjacentHTML positions;\n//             replaceChildren for atomic swap; reflow comparison.\n// WEAKNESSES- no Web Components slotting; no Shadow DOM.\n//\n// GOAL: choose insertion methods for performance\n// WHY: append/appendChild both insert at end; append is more flexible\n// WHY: multiple insertions in a loop cause reflows\n// DocumentFragment: batch many insertions into one reflow\nfunction appendItems(container, items) {\n  const frag = document.createDocumentFragment();\n  for (const item of items) {\n    const li = document.createElement('li');\n    li.textContent = item;\n    frag.appendChild(li);\n  }\n  container.append(frag); // one reflow for all items\n}\n// insertAdjacentHTML: insert HTML string at a position\n// Positions: 'beforebegin', 'afterbegin', 'beforeend', 'afterend'\nconst list = document.querySelector('ul');\nlist.insertAdjacentHTML('beforeend', '<li>Item</li>'); // append HTML\nlist.insertAdjacentHTML('afterbegin', '<li>First</li>'); // prepend HTML\n// Note: innerHTML+= parses the entire container; insertAdjacentHTML is faster\n// replaceChildren: atomic clear + insert (one reflow)\nfunction updateList(container, items) {\n  const frag = document.createDocumentFragment();\n  for (const item of items) {\n    const li = document.createElement('li');\n    li.textContent = item.name;\n    frag.appendChild(li);\n  }\n  container.replaceChildren(frag); // clears old children + appends new\n}\n// vs container.innerHTML = ''; container.append(...nodes); // two operations\n// Move elements (no clone needed — append moves the node)\nfunction moveItem(item, fromList, toList) {\n  toList.append(item); // item is removed from fromList automatically\n}\n// Decision rule:\n//   insert at end, multiple args                            -> append\n//   insert at start                                         -> prepend\n//   insert adjacent to sibling                             -> before/after\n//   many nodes                                              -> DocumentFragment + append\n//   insert HTML string at position                          -> insertAdjacentHTML\n//   clear + insert atomically                               -> replaceChildren\n//   move existing node                                      -> append (auto-removes from old parent)\n//\n// Anti-pattern: appendChild in a tight loop; innerHTML += for\n//   appending (re-parses entire container)."
                  }
        ],
        tips: [
                  ".append() accepts multiple nodes and strings — very flexible and readable.",
                  "Strings are auto-converted to text nodes — no need for createTextNode().",
                  ".before() and .after() work on any element, not just children.",
                  "Use DocumentFragment to batch multiple insertions for better performance."
        ],
        mistake: "Using .appendChild() for every element in a loop — append() with multiple args in one call is better. Or use DocumentFragment to batch.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Events & APIs ─────────────────────────────────────────
  {
    id: "events-storage",
    title: "Events & APIs",
    entries: [
      {
        id: "addeventlistener",
        fn: "addEventListener()",
        desc: "Registers a handler for an event on an element. Supports options like once, passive, and capture.",
        category: "Events & APIs",
        subtitle: "Attach event handlers to elements",
        signature: "el.addEventListener(type, handler, options?)",
        descLong: "addEventListener is the recommended way to handle events — it allows multiple handlers per event, and supports removal. The options object controls behavior: once removes after first fire, passive hints the handler won't call preventDefault (boosts scroll performance), capture changes phase.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of addEventListener() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest addEventListener: click handler on a button.\n// STRENGTHS - shows addEventListener with event object and e.target.\n// WEAKNESSES- no removal, no options, no delegation.\n//\n// GOAL: attach an event listener\nconst btn = document.querySelector('#btn');\nbtn.addEventListener('click', (e) => console.log('clicked', e.target));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of addEventListener() — common patterns you'll see in production.\n// APPROACH  - Combine addEventListener() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - remove listeners, once/passive options, and event delegation.\n// STRENGTHS - covers the 80% case: named handler removal, once, passive, delegation.\n// WEAKNESSES- no AbortController cleanup, no capture phase, no signal.\n//\n// GOAL: remove listeners and use options/delegation\n// WHY: named handler is required for removal\nfunction handleClick(e) { console.log('clicked'); }\nbtn.addEventListener('click', handleClick);\nbtn.removeEventListener('click', handleClick);\n// WHY: once and passive options\nbtn.addEventListener('click', handler, { once: true });\nwindow.addEventListener('scroll', handler, { passive: true });\n// WHY: event delegation\nul.addEventListener('click', e => {\n  if (e.target.matches('li')) handleItemClick(e.target);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of addEventListener() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production event handling: AbortController for batch\n//             cleanup, signal-based listener management, capture phase\n//             for interception, and a typed event delegation utility.\n// STRENGTHS - AbortController batch cleanup; signal-based removal;\n//             capture phase; delegation utility with closest.\n// WEAKNESSES- no Web Components events; no cross-origin postMessage.\n//\n// GOAL: use addEventListener efficiently\n// WHY: once: true auto-removes after fire\n// WHY: passive: true improves scroll performance\n// WHY: delegation reduces listener count\n// AbortController: batch-remove all listeners for a component\nfunction createComponent(element) {\n  const ac = new AbortController();\n  element.addEventListener('click', handleClick, { signal: ac.signal });\n  element.addEventListener('mouseenter', handleHover, { signal: ac.signal });\n  window.addEventListener('resize', handleResize, { signal: ac.signal, passive: true });\n  // Cleanup: one call removes all listeners on this signal\n  function destroy() { ac.abort(); }\n  return { destroy };\n}\n// const { destroy } = createComponent(el);\n// destroy(); // all listeners removed\n// Capture phase: intercept events before they reach the target\ndocument.addEventListener('click', (e) => {\n  // Runs in capture phase (top-down) before target's listeners\n  if (e.target.matches('[data-confirm]')) {\n    if (!confirm(e.target.dataset.confirm)) e.preventDefault();\n  }\n}, { capture: true });\n// Typed event delegation utility\nfunction delegate(parent, selector, event, handler, options = {}) {\n  const listener = (e) => {\n    const target = e.target.closest(selector);\n    if (target && parent.contains(target)) handler(e, target);\n  };\n  parent.addEventListener(event, listener, options);\n  return () => parent.removeEventListener(event, listener, options);\n}\n// Usage: const off = delegate(list, '.item', 'click', (e, item) => {\n//   item.classList.toggle('selected');\n// });\n// off(); // remove delegation\n// Decision rule:\n//   many similar children                                  -> delegation on parent\n//   one-shot event                                         -> { once: true }\n//   scroll/touch where preventDefault not used             -> { passive: true }\n//   batch cleanup (component teardown)                     -> AbortController + signal\n//   intercept before target                                -> { capture: true }\n//   cleanup required                                       -> removeEventListener or signal.abort()\n//\n// Anti-pattern: anonymous listener you later try to remove;\n//   adding 100 listeners instead of one delegated listener."
                  }
        ],
        tips: [
                  "Event delegation (one listener on parent) is more efficient than many listeners on children.",
                  "{ once: true } auto-removes after first fire — great for one-shot events.",
                  "{ passive: true } on scroll/touch events tells the browser you won't prevent default, enabling smoother scrolling.",
                  "Always remove event listeners you no longer need — especially in SPAs to prevent memory leaks."
        ],
        mistake: "Adding an inline function to addEventListener and trying to remove it later — you can't remove an anonymous function. Store a reference to the handler.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "event-propagation",
        fn: "event.stopPropagation() / preventDefault()",
        desc: "Control event bubbling and suppress default browser behavior.",
        category: "Events & APIs",
        subtitle: "Event flow control",
        signature: "e.stopPropagation()  |  e.preventDefault()",
        descLong: "Events bubble up through ancestors by default. stopPropagation() prevents the event from reaching parent handlers. preventDefault() cancels the browser's default action (form submit, link navigation, checkbox toggle) without stopping propagation. stopImmediatePropagation() prevents other handlers on the same element.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of event.stopPropagation() / preventDefault() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest event control: preventDefault and stopPropagation.\n// STRENGTHS - shows preventDefault on link, stopPropagation to isolate clicks.\n// WEAKNESSES- no stopImmediatePropagation, no defaultPrevented, no capture.\n//\n// GOAL: stop default behavior and bubbling\nlink.addEventListener('click', (e) => {\n  e.preventDefault();\n  e.stopPropagation();\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of event.stopPropagation() / preventDefault() — common patterns you'll see in production.\n// APPROACH  - Combine event.stopPropagation() / preventDefault() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - form submission with preventDefault and child isolation.\n// STRENGTHS - covers the 80% case: form submit, FormData, child stopPropagation.\n// WEAKNESSES- no stopImmediatePropagation, no defaultPrevented check.\n//\n// GOAL: handle forms and isolate clicks\n// WHY: preventDefault cancels the browser default (form submit, link nav)\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n  const data = new FormData(e.target);\n  submitViaAjax(data);\n});\n// WHY: stopPropagation prevents the event from reaching parent handlers\nchild.addEventListener('click', (e) => {\n  e.stopPropagation();\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of event.stopPropagation() / preventDefault() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production event flow: stopImmediatePropagation for handler\n//             priority, defaultPrevented for cooperative cancellation,\n//             capture vs bubble phase control, and a modal overlay pattern.\n// STRENGTHS - stopImmediatePropagation; defaultPrevented check; capture\n//             phase; modal outside-click pattern; event flow diagram.\n// WEAKNESSES- no Shadow DOM retargeting; no composedPath.\n//\n// GOAL: control event flow correctly\n// WHY: preventDefault does not stop bubbling\n// WHY: stopPropagation can break delegation and third-party libs\n// stopImmediatePropagation: prevent other handlers on SAME element\nbutton.addEventListener('click', (e) => {\n  console.log('first handler runs');\n  e.stopImmediatePropagation();\n});\nbutton.addEventListener('click', (e) => {\n  console.log('second handler never runs');\n});\n// defaultPrevented: cooperative cancellation between handlers\ndocument.addEventListener('click', (e) => {\n  if (e.defaultPrevented) return; // another handler already cancelled\n  if (e.target.matches('[data-action]')) {\n    e.preventDefault();\n    handleAction(e.target.dataset.action);\n  }\n});\n// Modal overlay: capture phase to detect outside clicks\nfunction createModal(modalEl) {\n  function onOutsideClick(e) {\n    if (!modalEl.contains(e.target)) {\n      closeModal();\n    }\n  }\n  // Use capture: true so we catch the event before modal's own handlers\n  document.addEventListener('click', onOutsideClick, { capture: true });\n  return () => document.removeEventListener('click', onOutsideClick, { capture: true });\n}\n// Event flow: Capture (top-down) -> Target -> Bubble (bottom-up)\n// document -> html -> body -> div -> button -> div -> body -> html -> document\n//   ^--- capture phase ---^         ^--- bubble phase ---^\n// Decision rule:\n//   cancel browser default (form/link)                      -> preventDefault\n//   isolate event from parent handlers                      -> stopPropagation (rarely)\n//   prevent other handlers on same element                  -> stopImmediatePropagation\n//   inspect prior cancellations                             -> e.defaultPrevented\n//   intercept before target                                 -> { capture: true }\n//   outside-click detection                                 -> capture + contains check\n//\n// Anti-pattern: stopPropagation as a default; calling\n//   stopPropagation when preventDefault was the intent."
                  }
        ],
        tips: [
                  "Use preventDefault() for form submissions to handle validation and async submission.",
                  "Be careful with stopPropagation() — it can break third-party libraries listening at higher levels.",
                  "e.target is the element that triggered the event; e.currentTarget is the element with the handler.",
                  "Events also have a capture phase (top-down). Pass { capture: true } to listen in capture phase."
        ],
        mistake: "Calling stopPropagation() everywhere as a band-aid — it breaks event delegation patterns. Only call it when intentionally isolating an element.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "localstorage",
        fn: "localStorage / sessionStorage",
        desc: "Browser key-value stores that persist across page reloads. localStorage is permanent; sessionStorage is tab-scoped.",
        category: "Events & APIs",
        subtitle: "Client-side persistent key-value storage",
        signature: "localStorage.setItem(key, val)  |  getItem(key)  |  removeItem(key)",
        descLong: "Both APIs are synchronous and store only strings. localStorage persists until explicitly cleared; sessionStorage persists only for the tab session. Serialize objects with JSON.stringify/parse. Storage is limited to ~5MB and is same-origin only.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of localStorage / sessionStorage — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest localStorage: set, get, remove strings.\n// STRENGTHS - shows setItem, getItem, removeItem.\n// WEAKNESSES- no JSON, no error handling, no sessionStorage.\n//\n// GOAL: store and retrieve strings in the browser\nlocalStorage.setItem('theme', 'dark');\nconst theme = localStorage.getItem('theme');\nlocalStorage.removeItem('theme');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of localStorage / sessionStorage — common patterns you'll see in production.\n// APPROACH  - Combine localStorage / sessionStorage with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - persist objects with JSON and sync across tabs via storage event.\n// STRENGTHS - covers the 80% case: JSON.stringify/parse, storage event.\n// WEAKNESSES- no try/catch, no schema validation, no IndexedDB comparison.\n//\n// GOAL: persist objects and sync across tabs\n// WHY: localStorage only stores strings\nconst settings = { theme: 'dark' };\nlocalStorage.setItem('app-settings', JSON.stringify(settings));\nconst loaded = JSON.parse(localStorage.getItem('app-settings'));\n// WHY: storage event fires in other tabs\nwindow.addEventListener('storage', (e) => {\n  if (e.key === 'app-settings') console.log('settings changed');\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of localStorage / sessionStorage — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production storage patterns: typed storage wrapper with\n//             schema validation, TTL expiry, cross-tab sync via\n//             BroadcastChannel, and safe JSON parse with fallback.\n// STRENGTHS - typed wrapper with defaults; TTL expiry; cross-tab sync;\n//             safe parse; quota error handling.\n// WEAKNESSES- no IndexedDB migration; no encryption.\n//\n// GOAL: use local/session storage safely\n// WHY: synchronous and can block main thread for large data\n// WHY: treat stored data as untrusted input\n// Typed storage wrapper with schema validation and TTL\nclass SafeStorage {\n  #storage; #prefix;\n  constructor(storage = localStorage, prefix = 'app:') {\n    this.#storage = storage;\n    this.#prefix = prefix;\n  }\n  get(key, fallback = null) {\n    try {\n      const raw = this.#storage.getItem(this.#prefix + key);\n      if (!raw) return fallback;\n      const { value, expiry } = JSON.parse(raw);\n      if (expiry && Date.now() > expiry) {\n        this.#storage.removeItem(this.#prefix + key);\n        return fallback;\n      }\n      return value;\n    } catch { return fallback; }\n  }\n  set(key, value, ttlMs) {\n    try {\n      const data = JSON.stringify({\n        value,\n        expiry: ttlMs ? Date.now() + ttlMs : null,\n      });\n      this.#storage.setItem(this.#prefix + key, data);\n      return true;\n    } catch (e) {\n      if (e.name === 'QuotaExceededError') console.warn('Storage quota exceeded');\n      return false;\n    }\n  }\n  remove(key) { this.#storage.removeItem(this.#prefix + key); }\n  clear() {\n    for (const key of Object.keys(this.#storage)) {\n      if (key.startsWith(this.#prefix)) this.#storage.removeItem(key);\n    }\n  }\n}\n// Cross-tab sync via BroadcastChannel (more reliable than storage event)\nconst channel = new BroadcastChannel('app-sync');\nfunction broadcastChange(key, value) {\n  channel.postMessage({ key, value, source: 'tab-' + Math.random() });\n}\nchannel.onmessage = (e) => {\n  if (e.data.key === 'theme') applyTheme(e.data.value);\n};\n// Usage\nconst store = new SafeStorage(localStorage, 'myapp:');\nstore.set('theme', 'dark', 86400000); // expires in 24h\nstore.get('theme', 'light'); // 'dark' or 'light' if expired/missing\n// Decision rule:\n//   small user preferences                                    -> localStorage\n//   temporary per-tab state                                   -> sessionStorage\n//   structured/large data                                     -> IndexedDB\n//   secrets                                                   -> never client storage\n//   TTL-based cache                                           -> SafeStorage with ttlMs\n//   cross-tab real-time sync                                  -> BroadcastChannel\n//\n// Anti-pattern: storing objects without JSON.stringify; storing\n//   large data in localStorage (blocks main thread)."
                  }
        ],
        tips: [
                  "Always wrap JSON.parse in try/catch — stored data may be corrupted or from old schema.",
                  "The storage event fires in OTHER tabs/windows, not the one that set the value.",
                  "localStorage is synchronous and can block the main thread for large reads — consider IndexedDB for large data.",
                  "Treat localStorage as untrusted input — validate/sanitize before use."
        ],
        mistake: "Storing objects directly — localStorage only stores strings. Objects become \"[object Object]\". Always use JSON.stringify() to store and JSON.parse() to retrieve.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "intersection-observer",
        fn: "IntersectionObserver",
        desc: "Asynchronously observes when an element enters or leaves the viewport or a specified root.",
        category: "Events & APIs",
        subtitle: "Viewport visibility tracking",
        signature: "new IntersectionObserver(callback, options)",
        descLong: "IntersectionObserver is the performant, modern way to detect when elements enter or leave the viewport — no scroll listeners, no getBoundingClientRect. Widely used for lazy loading images, infinite scroll, and scroll-driven animations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of IntersectionObserver — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest IntersectionObserver: detect viewport entry.\n// STRENGTHS - shows observer, observe, isIntersecting, unobserve.\n// WEAKNESSES- no rootMargin, no threshold, no multiple elements.\n//\n// GOAL: detect when an element enters the viewport\nconst observer = new IntersectionObserver((entries) => {\n  entries.forEach(entry => {\n    if (entry.isIntersecting) {\n      entry.target.classList.add('visible');\n      observer.unobserve(entry.target);\n    }\n  });\n});\nobserver.observe(document.querySelector('.lazy'));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of IntersectionObserver — common patterns you'll see in production.\n// APPROACH  - Combine IntersectionObserver with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - lazy-load images with rootMargin and threshold options.\n// STRENGTHS - covers the 80% case: rootMargin preloading, threshold, multiple elements.\n// WEAKNESSES- no disconnect, no intersectionRatio, no scroll direction.\n//\n// GOAL: lazy-load images and trigger animations\n// WHY: rootMargin triggers early; threshold controls how much must be visible\nconst observer = new IntersectionObserver(\n  (entries) => {\n    entries.forEach(entry => {\n      if (entry.isIntersecting) {\n        entry.target.src = entry.target.dataset.src;\n        observer.unobserve(entry.target);\n      }\n    });\n  },\n  { root: null, rootMargin: '200px', threshold: 0.1 }\n);\ndocument.querySelectorAll('.lazy').forEach(el => observer.observe(el));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of IntersectionObserver — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production IntersectionObserver: lazy-load with srcset,\n//             infinite scroll with sentinel, scroll-direction animations,\n//             and a reusable observer factory with auto-cleanup.\n// STRENGTHS - srcset lazy loading; sentinel-based infinite scroll;\n//             scroll direction detection; observer factory.\n// WEAKNESSES- no virtual scrolling; no priority hints.\n//\n// GOAL: use IntersectionObserver for performance\n// WHY: avoids scroll listeners and getBoundingClientRect\n// WHY: threshold 0 means one pixel; 1 means fully visible\n// Lazy-load images with srcset\nfunction setupLazyImages() {\n  const observer = new IntersectionObserver((entries) => {\n    for (const entry of entries) {\n      if (!entry.isIntersecting) continue;\n      const img = entry.target;\n      if (img.dataset.srcset) img.srcset = img.dataset.srcset;\n      if (img.dataset.src) img.src = img.dataset.src;\n      img.classList.add('loaded');\n      observer.unobserve(img);\n    }\n  }, { rootMargin: '300px 0px', threshold: 0.01 });\n  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));\n  return () => observer.disconnect();\n}\n// Infinite scroll with sentinel element\nfunction setupInfiniteScroll(container, loadMore) {\n  const sentinel = document.createElement('div');\n  sentinel.className = 'scroll-sentinel';\n  container.appendChild(sentinel);\n  const observer = new IntersectionObserver((entries) => {\n    if (entries[0].isIntersecting) loadMore();\n  }, { root: container, rootMargin: '0px 0px 500px 0px' });\n  observer.observe(sentinel);\n  return () => { observer.disconnect(); sentinel.remove(); };\n}\n// Scroll-direction-aware animations\nfunction setupScrollAnimations() {\n  const observer = new IntersectionObserver((entries) => {\n    for (const entry of entries) {\n      if (entry.isIntersecting) {\n        entry.target.classList.add('in-view');\n        entry.target.classList.remove('out-view');\n      } else {\n        entry.target.classList.remove('in-view');\n        entry.target.classList.add('out-view');\n      }\n    }\n  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });\n  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));\n  return () => observer.disconnect();\n}\n// Decision rule:\n//   lazy load images/iframes                                -> IntersectionObserver\n//   infinite scroll trigger                                 -> sentinel + rootMargin\n//   element visibility analytics                            -> unobserve after trigger\n//   scroll-driven animations                                -> threshold array\n//   measuring precise layout                                -> getBoundingClientRect (costly)\n//\n// Anti-pattern: scroll listener + getBoundingClientRect;\n//   not disconnecting observers on page navigation."
                  }
        ],
        tips: [
                  "threshold: 0 triggers as soon as a single pixel is visible; 1 requires full visibility.",
                  "Call observer.unobserve(el) after handling to avoid repeat callbacks.",
                  "rootMargin lets you trigger early (\"200px\") — great for preloading before elements are visible.",
                  "Much more performant than scroll event listeners + getBoundingClientRect()."
        ],
        mistake: "Using a scroll event listener + getBoundingClientRect() to detect visibility — this runs on every scroll tick and hurts performance. Use IntersectionObserver instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "debounce-throttle",
        fn: "Debounce / Throttle",
        desc: "Debounce delays execution until activity stops; throttle limits execution to once per interval.",
        category: "Events & APIs",
        subtitle: "Rate-limit high-frequency event handlers",
        signature: "debounce(fn, delay)  |  throttle(fn, interval)",
        descLong: "Debounce: fires the function only after the specified delay has passed without another call — ideal for search-as-you-type. Throttle: fires at most once per interval regardless of call frequency — ideal for scroll or resize handlers. Both improve performance by reducing execution frequency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Debounce / Throttle — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest debounce: delay execution until input stops.\n// STRENGTHS - shows debounce with clearTimeout/setTimeout pattern.\n// WEAKNESSES- no cancel, no leading edge, no throttle.\n//\n// GOAL: debounce user input\nfunction debounce(fn, delay) {\n  let timer;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}\nconst search = debounce(query => fetchResults(query), 300);\ninput.addEventListener('input', e => search(e.target.value));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Debounce / Throttle — common patterns you'll see in production.\n// APPROACH  - Combine Debounce / Throttle with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - throttle high-frequency events with time-based limiting.\n// STRENGTHS - covers the 80% case: throttle for scroll/resize.\n// WEAKNESSES- no cancel, no leading/trailing edge, no rAF throttle.\n//\n// GOAL: throttle high-frequency events\n// WHY: throttle runs at most once per interval\nfunction throttle(fn, interval) {\n  let lastRun = 0;\n  return (...args) => {\n    const now = Date.now();\n    if (now - lastRun >= interval) {\n      lastRun = now;\n      fn(...args);\n    }\n  };\n}\nwindow.addEventListener('scroll', throttle(updateNav, 200));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Debounce / Throttle — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production rate limiting: debounce/throttle with cancel,\n//             flush, leading/trailing options, rAF-based throttle for\n//             visual updates, and React-safe memoization.\n// STRENGTHS - cancel/flush methods; leading/trailing edge; rAF throttle;\n//             React useRef pattern.\n// WEAKNESSES- no requestIdleCallback; no IntersectionObserver alternative.\n//\n// GOAL: choose debounce vs throttle\n// WHY: debounce waits for idle; throttle limits rate\n// WHY: React needs stable references (useMemo/useCallback)\n// Production debounce with cancel, flush, and leading/trailing\nfunction debounce(fn, delay, { leading = false, trailing = true } = {}) {\n  let timer = null;\n  let lastArgs = null;\n  function invoke() { fn(...lastArgs); lastArgs = null; }\n  const debounced = (...args) => {\n    lastArgs = args;\n    if (timer) clearTimeout(timer);\n    else if (leading) invoke();\n    timer = setTimeout(() => {\n      timer = null;\n      if (trailing && lastArgs) invoke();\n    }, delay);\n  };\n  debounced.cancel = () => { clearTimeout(timer); timer = null; lastArgs = null; };\n  debounced.flush = () => { if (timer) { clearTimeout(timer); timer = null; invoke(); } };\n  return debounced;\n}\n// Production throttle with cancel and leading/trailing\nfunction throttle(fn, interval, { leading = true, trailing = true } = {}) {\n  let lastRun = 0;\n  let timer = null;\n  let lastArgs = null;\n  const throttled = (...args) => {\n    const now = Date.now();\n    const remaining = interval - (now - lastRun);\n    lastArgs = args;\n    if (remaining <= 0) {\n      if (timer) { clearTimeout(timer); timer = null; }\n      lastRun = now;\n      fn(...args);\n    } else if (!timer && trailing) {\n      timer = setTimeout(() => {\n        lastRun = Date.now();\n        timer = null;\n        fn(...lastArgs);\n      }, remaining);\n    }\n  };\n  throttled.cancel = () => { clearTimeout(timer); timer = null; lastRun = 0; };\n  return throttled;\n}\n// rAF-based throttle for visual updates (synced to repaint)\nfunction rafThrottle(fn) {\n  let queued = false;\n  let lastArgs = null;\n  return (...args) => {\n    lastArgs = args;\n    if (queued) return;\n    queued = true;\n    requestAnimationFrame(() => {\n      queued = false;\n      fn(...lastArgs);\n    });\n  };\n}\n// Usage: window.addEventListener('scroll', rafThrottle(updateParallax));\n// React-safe debounce (survives re-renders)\n// function useDebounce(fn, delay) {\n//   const ref = useRef(debounce(fn, delay));\n//   useEffect(() => () => ref.current.cancel(), []);\n//   return ref.current;\n// }\n// Decision rule:\n//   user input (search, form validation)                    -> debounce\n//   continuous events (scroll, resize)                       -> throttle\n//   visual updates (parallax, animation)                     -> rAF throttle\n//   one-shot or leading edge                               -> debounce with leading option\n//   React component                                        -> useMemo/useRef for stable fn\n//\n// Anti-pattern: creating debounced fn inside render; using\n//   setInterval for visual updates instead of rAF."
                  }
        ],
        tips: [
                  "Debounce for user input (search, form validation); throttle for continuous events (scroll, resize).",
                  "Lodash provides battle-tested _.debounce() and _.throttle() with cancel() and flush() methods.",
                  "In React, debounce/throttle functions should be created with useCallback or useMemo to survive re-renders.",
                  "Leading vs trailing: debounce can fire on the leading edge (immediately) or trailing edge (after idle)."
        ],
        mistake: "Creating a debounced function inside a React component's render — it creates a new debounced function each render, breaking the debounce. Use useMemo or useCallback.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "mutation-observer",
        fn: "MutationObserver",
        desc: "Observe DOM mutations — added/removed nodes, attribute changes, and text content changes.",
        category: "Events & APIs",
        subtitle: "React to DOM changes asynchronously",
        signature: "new MutationObserver(callback)  →  observer.observe(target, config)",
        descLong: "MutationObserver delivers batched DOM mutation records asynchronously (as a microtask). Far more performant than polling or mutation events. The callback receives an array of MutationRecord objects. Always call observer.disconnect() in cleanup to prevent memory leaks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of MutationObserver — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest MutationObserver: watch for DOM changes.\n// STRENGTHS - shows MutationObserver, observe with childList/subtree.\n// WEAKNESSES- no attribute changes, no disconnect, no addedNodes.\n//\n// GOAL: watch for DOM changes\nconst observer = new MutationObserver((mutations) => {\n  mutations.forEach(mutation => console.log(mutation.type, mutation.target));\n});\nobserver.observe(document.body, { childList: true, subtree: true });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of MutationObserver — common patterns you'll see in production.\n// APPROACH  - Combine MutationObserver with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - react to added nodes and attribute changes with batched delivery.\n// STRENGTHS - covers the 80% case: childList addedNodes, attributes, subtree.\n// WEAKNESSES- no disconnect cleanup, no characterData, no debounce.\n//\n// GOAL: react to added nodes and attribute changes\n// WHY: batched async delivery\nconst observer = new MutationObserver((mutations) => {\n  for (const mutation of mutations) {\n    if (mutation.type === 'childList') {\n      mutation.addedNodes.forEach(node => console.log('Added:', node));\n    }\n    if (mutation.type === 'attributes') {\n      console.log(`${mutation.attributeName} changed`);\n    }\n  }\n});\nobserver.observe(document.body, {\n  childList: true,\n  subtree: true,\n  attributes: true\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of MutationObserver — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production MutationObserver: auto-init widgets on injected\n//             content, attribute change debouncing, scoped observation\n//             with cleanup, and a reusable observer factory.\n// STRENGTHS - auto-init pattern; debounced attribute changes; scoped\n//             observer with disconnect; factory with cleanup return.\n// WEAKNESSES- no performance benchmark on large DOM; no IntersectionObserver combo.\n//\n// GOAL: use MutationObserver correctly\n// WHY: subtree on large DOM is expensive\n// WHY: always disconnect to avoid leaks\n// Auto-initialize widgets when content is injected\nfunction autoInitWidgets(root = document.body) {\n  const init = (node) => {\n    if (node.nodeType !== Node.ELEMENT_NODE) return;\n    if (node.matches('[data-widget]') && !node.dataset.initialized) {\n      node.dataset.initialized = 'true';\n      initWidget(node);\n    }\n    node.querySelectorAll?.('[data-widget]:not([data-initialized])').forEach(el => {\n      el.dataset.initialized = 'true';\n      initWidget(el);\n    });\n  };\n  const observer = new MutationObserver((mutations) => {\n    for (const mutation of mutations) {\n      mutation.addedNodes.forEach(init);\n    }\n  });\n  observer.observe(root, { childList: true, subtree: true });\n  // Initialize existing widgets\n  root.querySelectorAll('[data-widget]:not([data-initialized])').forEach(init);\n  return () => observer.disconnect();\n}\n// Debounced attribute observer: batch rapid attribute changes\nfunction observeAttributes(el, callback, debounceMs = 100) {\n  let timer = null;\n  const observer = new MutationObserver((mutations) => {\n    if (timer) clearTimeout(timer);\n    timer = setTimeout(() => {\n      timer = null;\n      callback(mutations);\n    }, debounceMs);\n  });\n  observer.observe(el, { attributes: true, attributeOldValue: true });\n  return () => { observer.disconnect(); if (timer) clearTimeout(timer); };\n}\n// Scoped observer: watch only a specific container\nfunction watchContainer(container, onAdded, onRemoved) {\n  const observer = new MutationObserver((mutations) => {\n    for (const mutation of mutations) {\n      mutation.addedNodes.forEach(node => {\n        if (node.nodeType === Node.ELEMENT_NODE) onAdded(node);\n      });\n      mutation.removedNodes.forEach(node => {\n        if (node.nodeType === Node.ELEMENT_NODE) onRemoved(node);\n      });\n    }\n  });\n  observer.observe(container, { childList: true, subtree: false });\n  return () => observer.disconnect();\n}\n// Decision rule:\n//   third-party content injection                             -> MutationObserver\n//   custom element polyfills                                  -> observe attributes/children\n//   reacting to state changes                                 -> prefer events or framework reactivity\n//   large DOM                                                 -> narrow observe target (no subtree)\n//   rapid attribute changes                                   -> debounced observer\n//\n// Anti-pattern: polling DOM with setInterval; subtree: true on\n//   document.body for a large SPA."
                  }
        ],
        tips: [
                  "MutationObserver is batched and async — mutations accumulate and are delivered together.",
                  "subtree: true watches the entire descendant tree — be careful with large DOM trees.",
                  "Use it for: polyfilling custom elements, auto-initializing third-party widgets, watching for injected content.",
                  "disconnect() in cleanup prevents memory leaks and stale callbacks."
        ],
        mistake: "Polling the DOM with setInterval to detect changes — MutationObserver is far more efficient and immediate.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "resize-observer",
        fn: "ResizeObserver",
        desc: "Observe changes to an element's size — more reliable than window resize events for component-level sizing.",
        category: "Events & APIs",
        subtitle: "Element-level size change detection",
        signature: "new ResizeObserver(callback)  →  observer.observe(element)",
        descLong: "ResizeObserver fires when an element's content or border box size changes. Unlike the window resize event, it tracks individual elements and fires on any size change trigger (CSS, font load, layout). Entries include contentRect with the new dimensions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ResizeObserver — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest ResizeObserver: watch element size changes.\n// STRENGTHS - shows ResizeObserver, contentRect, observe.\n// WEAKNESSES- no unobserve, no disconnect, no borderBoxSize.\n//\n// GOAL: watch an element's size changes\nconst observer = new ResizeObserver((entries) => {\n  for (const entry of entries) {\n    const { width, height } = entry.contentRect;\n    console.log(width, height);\n  }\n});\nobserver.observe(document.querySelector('.card'));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ResizeObserver — common patterns you'll see in production.\n// APPROACH  - Combine ResizeObserver with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - react to container size and clean up with unobserve/disconnect.\n// STRENGTHS - covers the 80% case: contentRect, class toggle, cleanup.\n// WEAKNESSES- no borderBoxSize, no feedback loop prevention.\n//\n// GOAL: react to container size and clean up\n// WHY: contentRect is the inner size; borderBoxSize includes border\nconst resizeObserver = new ResizeObserver((entries) => {\n  for (const entry of entries) {\n    const { width } = entry.contentRect;\n    entry.target.classList.toggle('compact', width < 400);\n  }\n});\nresizeObserver.observe(document.querySelector('.card'));\nresizeObserver.unobserve(element);\nresizeObserver.disconnect();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ResizeObserver — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production ResizeObserver: container query polyfill,\n//             breakpoint-based responsive classes, feedback loop\n//             prevention, and a reusable observer factory.\n// STRENGTHS - container query polyfill; breakpoint system; feedback\n//             loop guard; factory with cleanup.\n// WEAKNESSES- no CSS container queries (@container) comparison.\n//\n// GOAL: choose ResizeObserver over window resize\n// WHY: fires when element size changes, not just viewport\n// WHY: avoid layout thrashing by reading sizes once per frame\n// Container query polyfill: responsive classes based on container width\nfunction setupContainerQueries(breakpoints = { sm: 640, md: 768, lg: 1024 }) {\n  const sorted = Object.entries(breakpoints).sort((a, b) => a[1] - b[1]);\n  const observer = new ResizeObserver((entries) => {\n    for (const entry of entries) {\n      const width = entry.contentRect.width;\n      const el = entry.target;\n      sorted.forEach(([name]) => el.classList.remove('cq-' + name));\n      for (const [name, min] of sorted) {\n        if (width >= min) el.classList.add('cq-' + name);\n        else break;\n      }\n      el.dataset.containerWidth = Math.round(width);\n    }\n  });\n  document.querySelectorAll('[data-container-query]').forEach(el => observer.observe(el));\n  return () => observer.disconnect();\n}\n// CSS: .cq-md .sidebar { flex-direction: row; }\n// Feedback loop prevention: avoid triggering layout changes in callback\nfunction safeResizeObserve(el, callback) {\n  let isUpdating = false;\n  const observer = new ResizeObserver((entries) => {\n    if (isUpdating) return;\n    isUpdating = true;\n    requestAnimationFrame(() => {\n      callback(entries);\n      isUpdating = false;\n    });\n  });\n  observer.observe(el);\n  return () => observer.disconnect();\n}\n// Multiple elements with shared observer\nfunction observeElements(selector, callback) {\n  const observer = new ResizeObserver(callback);\n  document.querySelectorAll(selector).forEach(el => observer.observe(el));\n  return () => observer.disconnect();\n}\n// Decision rule:\n//   element-level responsive behavior                         -> ResizeObserver\n//   viewport-only changes                                     -> window resize\n//   polyfill container queries                                -> ResizeObserver + class toggle\n//   reading size in animation loop                            -> bad for performance\n//   triggering layout in callback                             -> use rAF guard\n//\n// Anti-pattern: window.addEventListener('resize') per element;\n//   triggering layout changes inside the callback (feedback loop)."
                  }
        ],
        tips: [
                  "ResizeObserver is the correct tool for \"container queries\" when CSS container queries aren't enough.",
                  "Avoid triggering layout changes inside the callback — it can cause feedback loops.",
                  "contentRect gives the inner size; borderBoxSize gives the full element size.",
                  "Fires once immediately after observe() with the current size."
        ],
        mistake: "Using window.addEventListener(\"resize\") to track element size — window resize doesn't fire for CSS-driven size changes. Use ResizeObserver.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "raf",
        fn: "requestAnimationFrame()",
        desc: "Schedule a callback before the next browser repaint — the correct way to drive animations.",
        category: "Events & APIs",
        subtitle: "Frame-synchronized animation loop",
        signature: "const id = requestAnimationFrame(callback)  |  cancelAnimationFrame(id)",
        descLong: "requestAnimationFrame (rAF) runs a callback just before the browser repaints, at the display's refresh rate (~60fps). Callbacks are paused when the tab is hidden — saving battery and CPU. Always cancel with cancelAnimationFrame on cleanup. Each callback receives a DOMHighResTimeStamp for delta calculation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of requestAnimationFrame() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest rAF: animate an element and cancel.\n// STRENGTHS - shows requestAnimationFrame, cancelAnimationFrame.\n// WEAKNESSES- no delta time, no pause, no batch read/write.\n//\n// GOAL: schedule a callback before the next repaint\nfunction animate() {\n  el.style.left = (parseInt(el.style.left || 0) + 1) + 'px';\n  requestAnimationFrame(animate);\n}\nconst animId = requestAnimationFrame(animate);\ncancelAnimationFrame(animId);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of requestAnimationFrame() — common patterns you'll see in production.\n// APPROACH  - Combine requestAnimationFrame() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - frame-rate-independent animation with delta time.\n// STRENGTHS - covers the 80% case: DOMHighResTimeStamp, delta, transform.\n// WEAKNESSES- no pause/resume, no batch read/write, no visibility handling.\n//\n// GOAL: build a frame-rate-independent animation\n// WHY: timestamp is DOMHighResTimeStamp\nlet animId;\nlet lastTime = 0;\nfunction animate(timestamp) {\n  const delta = timestamp - lastTime;\n  lastTime = timestamp;\n  x += velocity * (delta / 1000);\n  element.style.transform = `translateX(${x}px)`;\n  animId = requestAnimationFrame(animate);\n}\nanimId = requestAnimationFrame(animate);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of requestAnimationFrame() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production rAF: animation loop with pause/resume, batch\n//             DOM reads before writes to avoid layout thrash, visibility\n//             auto-pause, and a reusable animation controller.\n// STRENGTHS - pause/resume; delta time; batch read/write; visibility\n//             auto-pause; cleanup on destroy.\n// WEAKNESSES- no Web Animations API comparison; no easing functions.\n//\n// GOAL: use rAF for smooth, efficient updates\n// WHY: rAF pauses in hidden tabs\n// WHY: batch DOM reads before writes to avoid layout thrash\n// Animation controller with pause/resume and cleanup\nclass AnimationLoop {\n  #callback; #rafId = null; #lastTime = 0; #running = false;\n  constructor(callback) { this.#callback = callback; }\n  start() {\n    if (this.#running) return;\n    this.#running = true;\n    this.#lastTime = performance.now();\n    this.#tick(this.#lastTime);\n  }\n  #tick(time) {\n    if (!this.#running) return;\n    const delta = time - this.#lastTime;\n    this.#lastTime = time;\n    this.#callback(delta, time);\n    this.#rafId = requestAnimationFrame((t) => this.#tick(t));\n  }\n  pause() {\n    this.#running = false;\n    if (this.#rafId) cancelAnimationFrame(this.#rafId);\n  }\n  resume() { this.start(); }\n  destroy() { this.pause(); this.#callback = null; }\n}\n// Batch read/write to avoid layout thrash\nfunction batchUpdates(reads, writes) {\n  const values = reads.map(fn => fn());\n  writes.forEach((fn, i) => fn(values[i]));\n}\n// Usage in animation loop:\n// batchUpdates(\n//   [() => el.offsetWidth, () => el.offsetHeight],\n//   [w => el.style.width = w * 2 + 'px', h => el.style.height = h * 2 + 'px']\n// );\n// Visibility-aware: auto-pause when tab hidden\ndocument.addEventListener('visibilitychange', () => {\n  if (document.hidden) loop.pause();\n  else loop.resume();\n});\n// Usage\nconst loop = new AnimationLoop((delta, time) => {\n  x += velocity * (delta / 1000);\n  element.style.transform = `translateX(${x}px)`;\n});\nloop.start();\n// loop.pause(); loop.resume(); loop.destroy();\n// Decision rule:\n//   visual animation                                          -> requestAnimationFrame\n//   game/physics loop                                        -> rAF + delta time\n//   one-shot layout read                                     -> rAF after writes settle\n//   batch DOM updates                                        -> read phase then write phase\n//   fixed-interval polling                                   -> setInterval (rarely)\n//   pause on hidden tab                                      -> visibilitychange + pause\n//\n// Anti-pattern: setInterval for animation; reading layout\n//   properties in a loop (layout thrash)."
                  }
        ],
        tips: [
                  "Always use delta time for physics — makes animation frame-rate independent.",
                  "rAF pauses automatically in hidden tabs — animations don't waste resources.",
                  "Use rAF for any DOM mutation that should be synced to repaint, not just Canvas.",
                  "Batch DOM reads before writes — rAF is the right boundary to separate read/write phases."
        ],
        mistake: "Using setInterval for animations — it fires at a fixed rate regardless of frame rate, causing jank. requestAnimationFrame syncs to the display refresh rate.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "custom-events",
        fn: "CustomEvent",
        desc: "Create and dispatch custom DOM events with arbitrary data payloads.",
        category: "Events & APIs",
        subtitle: "Custom event dispatch with data",
        signature: "new CustomEvent(\"type\", { detail, bubbles, cancelable })",
        descLong: "CustomEvent extends Event to carry arbitrary data in the detail property. Dispatch with element.dispatchEvent(). Set bubbles: true for the event to bubble up through ancestors. Combine with addEventListener for loose coupling between unrelated components.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CustomEvent — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest CustomEvent: dispatch and listen with detail.\n// STRENGTHS - shows CustomEvent, detail, dispatchEvent, addEventListener.\n// WEAKNESSES- no bubbles, no cancelable, no Web Components.\n//\n// GOAL: dispatch and listen for a custom event\nconst el = document.querySelector('.component');\nel.addEventListener('dataLoaded', (e) => console.log(e.detail));\nel.dispatchEvent(new CustomEvent('dataLoaded', { detail: { id: 1 } }));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CustomEvent — common patterns you'll see in production.\n// APPROACH  - Combine CustomEvent with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - bubbles/cancelable options and Web Components dispatch.\n// STRENGTHS - covers the 80% case: bubbles, cancelable, HTMLElement dispatch.\n// WEAKNESSES- no composed, no event delegation, no typed detail.\n//\n// GOAL: use bubbles and cancelable correctly\n// WHY: bubbles: true enables parent handlers\nfunction notifyUserLoggedIn(user) {\n  document.dispatchEvent(new CustomEvent('userLoggedIn', {\n    detail: { user },\n    bubbles: true,\n    cancelable: true\n  }));\n}\ndocument.addEventListener('userLoggedIn', (e) => {\n  console.log('Logged in:', e.detail.user.name);\n});\n// WHY: Web Components dispatch CustomEvents\nclass ToggleSwitch extends HTMLElement {\n  toggle() {\n    this.checked = !this.checked;\n    this.dispatchEvent(new CustomEvent('change', {\n      detail: { checked: this.checked },\n      bubbles: true\n    }));\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CustomEvent — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production CustomEvent patterns: event bus with typed\n//             channels, composed events for Shadow DOM, cancelable\n//             veto pattern, and a Web Component with event API.\n// STRENGTHS - typed event bus; composed for Shadow DOM; cancelable\n//             veto; Web Component event lifecycle.\n// WEAKNESSES- no postMessage; no BroadcastChannel.\n//\n// GOAL: use CustomEvent for loose coupling\n// WHY: detail should be structured-cloneable\n// WHY: cancelable: true lets listeners call preventDefault\n// Typed event bus: decoupled communication between modules\nclass EventBus {\n  #target = new EventTarget();\n  on(type, handler, options) {\n    this.#target.addEventListener(type, handler, options);\n    return () => this.#target.removeEventListener(type, handler, options);\n  }\n  once(type, handler) {\n    return this.on(type, handler, { once: true });\n  }\n  emit(type, detail, { bubbles = false, cancelable = false } = {}) {\n    return this.#target.dispatchEvent(\n      new CustomEvent(type, { detail, bubbles, cancelable })\n    );\n  }\n}\n// Usage\nconst bus = new EventBus();\nconst off = bus.on('user:login', (e) => console.log(e.detail.user));\nbus.emit('user:login', { user: { name: 'Alice' } });\noff(); // unsubscribe\n// Composed events: cross Shadow DOM boundary\nclass DatePicker extends HTMLElement {\n  #value = null;\n  set value(v) {\n    this.#value = v;\n    this.dispatchEvent(new CustomEvent('date:change', {\n      detail: { value: v },\n      bubbles: true,\n      composed: true,\n    }));\n  }\n  get value() { return this.#value; }\n}\ncustomElements.define('date-picker', DatePicker);\n// document.querySelector('date-picker').addEventListener('date:change', e => {\n//   console.log('Date changed:', e.detail.value);\n// });\n// Cancelable veto pattern\nfunction dispatchAction(action, data) {\n  const allowed = document.dispatchEvent(new CustomEvent('action:' + action, {\n    detail: data,\n    bubbles: true,\n    cancelable: true,\n  }));\n  if (allowed) executeAction(action, data);\n  else console.log('Action was vetoed by a listener');\n}\n// document.addEventListener('action:delete', e => {\n//   if (!confirm('Delete?')) e.preventDefault(); // veto\n// });\n// Decision rule:\n//   component-to-app communication                            -> CustomEvent on document\n//   parent-child coupling                                     -> props/callbacks or framework events\n//   allow veto                                               -> cancelable: true\n//   event delegation                                          -> bubbles: true\n//   Shadow DOM boundary                                       -> composed: true\n//   decoupled pub/sub                                         -> EventBus with EventTarget\n//\n// Anti-pattern: plain Event with global state mutation;\n//   forgetting composed: true for Shadow DOM events."
                  }
        ],
        tips: [
                  "bubbles: true lets parent elements listen for the event — enables event delegation.",
                  "detail can be any structured-cloneable value — objects, arrays, primitives.",
                  "Custom events are the standard communication channel for Web Components.",
                  "Use e.preventDefault() + cancelable: true to allow listeners to veto an action."
        ],
        mistake: "Passing data by mutating a shared object and dispatching a plain Event — use CustomEvent with detail instead for clean, self-contained payloads.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "closest",
        fn: ".closest()",
        desc: "Traverse up the DOM tree to find the first ancestor matching a CSS selector.",
        category: "Events & APIs",
        subtitle: "Ancestor search and traversal",
        signature: "el.closest(selector)",
        descLong: ".closest() walks up the DOM tree (including the element itself) and returns the first ancestor element matching the CSS selector, or null if none found. Short-circuits at first match. Essential for event delegation — find the logical target even if the click lands on a child element (e.g., icon inside button).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .closest() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest closest: find nearest ancestor matching selector.\n// STRENGTHS - shows closest with CSS selector, returns element or null.\n// WEAKNESSES- no event delegation, no chaining, no null safety.\n//\n// GOAL: find the nearest ancestor matching a selector\nconst item = document.querySelector('.child').closest('.list-item');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .closest() — common patterns you'll see in production.\n// APPROACH  - Combine .closest() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - closest in event delegation and chaining with optional chaining.\n// STRENGTHS - covers the 80% case: delegated click, closest for logical target, chaining.\n// WEAKNESSES- no data-action routing, no null guard pattern.\n//\n// GOAL: use closest in event delegation\n// WHY: e.target may be a child of the intended clickable element\ndocument.querySelector('.list').addEventListener('click', (e) => {\n  const item = e.target.closest('.list-item');\n  if (!item) return;\n  item.classList.toggle('selected');\n});\n// WHY: chaining closest calls\nconst deleteBtn = e.target.closest('[data-action=\"delete\"]');\nconst card = deleteBtn?.closest('.card');\ncard?.remove();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .closest() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production closest patterns: data-action routing, nested\n//             delegation with closest, ancestor traversal utility, and\n//             safe removal with container checks.\n// STRENGTHS - data-action routing; nested delegation; ancestor\n//             traversal utility; container containment check.\n// WEAKNESSES- no Shadow DOM piercing; no composedPath.\n//\n// GOAL: traverse safely and efficiently\n// WHY: closest includes the element itself\n// WHY: returns null if no match\n// Data-action routing: single delegated handler for all actions\ndocument.addEventListener('click', (e) => {\n  const actionEl = e.target.closest('[data-action]');\n  if (!actionEl) return;\n  const action = actionEl.dataset.action;\n  const handlers = {\n    delete: () => actionEl.closest('.item')?.remove(),\n    edit: () => openEditor(actionEl.closest('.item')),\n    toggle: () => actionEl.classList.toggle('expanded'),\n    close: () => actionEl.closest('.modal')?.remove(),\n  };\n  handlers[action]?.();\n});\n// Nested delegation: handle clicks within a specific container\nfunction setupTableActions(table) {\n  table.addEventListener('click', (e) => {\n    const row = e.target.closest('tr');\n    if (!row || !table.contains(row)) return;\n    const action = e.target.closest('[data-action]');\n    if (!action) return;\n    const id = row.dataset.id;\n    if (action.dataset.action === 'select') row.classList.toggle('selected');\n    if (action.dataset.action === 'expand') toggleRowDetails(row, id);\n  });\n}\n// Ancestor traversal utility: find first ancestor matching predicate\nfunction findAncestor(el, predicate) {\n  let current = el;\n  while (current && current !== document.body) {\n    if (predicate(current)) return current;\n    current = current.parentElement;\n  }\n  return null;\n}\n// Usage: findAncestor(el, node => node.tagName === 'FORM')\n// Decision rule:\n//   event delegation with nested targets                       -> e.target.closest(selector)\n//   null-safe traversal                                        -> optional chaining\n//   complex selector                                           -> any valid CSS selector\n//   data-action routing                                        -> closest('[data-action]')\n//   custom predicate                                           -> findAncestor utility\n//\n// Anti-pattern: using e.target directly in delegated handlers;\n//   manual parentElement walking instead of closest()."
                  }
        ],
        tips: [
                  "closest() includes the element itself — el.closest(\"div\") returns el if el is a div.",
                  "Returns null if no match found — safe with optional chaining: el.closest(\".item\")?.id.",
                  "Use in event delegation to find the logical target regardless of click depth.",
                  "Works with any valid CSS selector: attribute selectors, pseudo-classes, combinators, etc."
        ],
        mistake: "Using e.target directly in delegated handlers — clicks on child elements will target the wrong element. Always use e.target.closest() to find the intended logical target.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "matches",
        fn: ".matches()",
        desc: "Test if an element matches a CSS selector — returns boolean.",
        category: "Events & APIs",
        subtitle: "Selector matching test",
        signature: "el.matches(selector)",
        descLong: ".matches() tests whether the element itself matches a CSS selector. Returns true or false. Common in event delegation to quickly check the target element. More readable than manual class/attribute checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .matches() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest matches: test if element matches a CSS selector.\n// STRENGTHS - shows el.matches() returning boolean.\n// WEAKNESSES- no event routing, no complex selectors.\n//\n// GOAL: test if an element matches a selector\nconst el = document.querySelector('.card');\nconsole.log(el.matches('.active')); // boolean"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .matches() — common patterns you'll see in production.\n// APPROACH  - Combine .matches() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - route events with matches for different element types.\n// STRENGTHS - covers the 80% case: button, dismiss, checkbox routing.\n// WEAKNESSES- no closest integration, no data-action pattern.\n//\n// GOAL: route events with matches\n// WHY: matches accepts any CSS selector\ndocument.addEventListener('click', (e) => {\n  if (e.target.matches('button')) handleButtonClick(e.target);\n  if (e.target.matches('.dismiss-btn')) dismiss();\n  if (e.target.matches('input[type=\"checkbox\"]:checked')) console.log('checked');\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .matches() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production matches patterns: combined matches + closest\n//             for robust event routing, selector-based action dispatcher,\n//             and element visibility/ state checking.\n// STRENGTHS - matches + closest combo; action dispatcher; state\n//             checking; matches vs closest decision guide.\n// WEAKNESSES- no Shadow DOM; no composedPath.\n//\n// GOAL: use matches for clean element checks\n// WHY: more reliable than className string checks\n// Combined matches + closest for robust event routing\ndocument.addEventListener('click', (e) => {\n  // Check the direct target first, then walk up for logical parent\n  const target = e.target.matches('[data-action]')\n    ? e.target\n    : e.target.closest('[data-action]');\n  if (!target) return;\n  const { action, id } = target.dataset;\n  if (action === 'delete') deleteItem(id);\n  if (action === 'edit') editItem(id);\n});\n// Selector-based action dispatcher\nfunction createDispatcher(handlers) {\n  return (e) => {\n    for (const [selector, handler] of Object.entries(handlers)) {\n      if (e.target.matches(selector)) {\n        handler(e);\n        return; // first match wins\n      }\n    }\n  };\n}\nconst dispatch = createDispatcher({\n  'button[data-loading]': (e) => e.target.disabled = true,\n  '.dismiss-btn': (e) => e.target.closest('.alert')?.remove(),\n  'input[type=\"checkbox\"]': (e) => toggleSelect(e.target),\n  '[data-dropdown-toggle]': (e) => toggleDropdown(e.target),\n});\ndocument.addEventListener('click', dispatch);\n// State checking with matches\nfunction isInteractive(el) {\n  return el.matches('button, a, input, select, textarea, [tabindex]:not([tabindex=\"-1\"])');\n}\nfunction isHidden(el) {\n  return el.matches('[hidden], [aria-hidden=\"true\"], .hidden');\n}\n// Decision rule:\n//   check element itself against selector                          -> el.matches(selector)\n//   find ancestor/self in event delegation                         -> el.closest(selector)\n//   routing events                                                  -> if/else with matches\n//   first-match-wins routing                                        -> createDispatcher\n//   accessibility checks                                            -> matches with selector list\n//\n// Anti-pattern: el.className.includes('card'); using matches when\n//   closest is needed for nested elements."
                  }
        ],
        tips: [
                  ".matches() replaces verbose className/attribute checking — much cleaner.",
                  "Accepts any valid CSS selector: attributes, pseudo-classes, pseudo-elements (test only).",
                  "Often paired with e.target in event handlers to route to different handlers.",
                  "Short-circuits efficiently — faster than getting all matching elements."
        ],
        mistake: "Using string methods to check for classes: el.className.includes(\"card\"). Use el.matches(\".card\") instead — it's more reliable and readable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "document-fragment",
        fn: "DocumentFragment",
        desc: "A lightweight, off-DOM container for building multiple nodes before a single batch insert.",
        category: "Events & APIs",
        subtitle: "Batch DOM insertion without reflow",
        signature: "const frag = document.createDocumentFragment()",
        descLong: "DocumentFragment is a minimal DOM node that lives off-document. Build a tree of elements inside it, then append it once to the live DOM — triggering only one reflow instead of N. When appended, the fragment itself is not inserted — only its children move.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DocumentFragment — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest DocumentFragment: build nodes off-DOM, insert once.\n// STRENGTHS - shows createDocumentFragment, appendChild, single reflow.\n// WEAKNESSES- no template element, no replaceChildren.\n//\n// GOAL: build nodes off-DOM and insert once\nconst frag = document.createDocumentFragment();\nfor (const item of items) {\n  const li = document.createElement('li');\n  li.textContent = item;\n  frag.appendChild(li);\n}\ndocument.querySelector('ul').appendChild(frag);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DocumentFragment — common patterns you'll see in production.\n// APPROACH  - Combine DocumentFragment with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - <template> for reusable HTML and DocumentFragment for batch lists.\n// STRENGTHS - covers the 80% case: template.cloneNode, dataset, fragment batch.\n// WEAKNESSES- no replaceChildren, no diffing, no performance comparison.\n//\n// GOAL: use <template> for reusable HTML\n// WHY: DocumentFragment avoids one reflow per element\nconst tmpl = document.querySelector('#card-template');\nconst clone = tmpl.content.cloneNode(true);\nclone.querySelector('.title').textContent = 'My Card';\ndocument.body.appendChild(clone);\n// WHY: appending fragment moves its children, not the fragment itself\nconst fragment = document.createDocumentFragment();\nitems.forEach(item => {\n  const li = document.createElement('li');\n  li.textContent = item.name;\n  li.dataset.id = item.id;\n  fragment.appendChild(li);\n});\ndocument.querySelector('ul').appendChild(fragment);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DocumentFragment — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production DocumentFragment patterns: replaceChildren for\n//             atomic swap, template-based row factory, diff-based update\n//             for partial re-renders, and cloneNode performance.\n// STRENGTHS - replaceChildren atomic swap; template row factory;\n//             partial diff update; cloneNode(true) vs createElement.\n// WEAKNESSES- no virtual DOM; no keyed reconciliation.\n//\n// GOAL: minimize DOM reflows during bulk inserts\n// WHY: live DOM insertions in loops are expensive\n// WHY: <template> content is inert until cloned\n// Atomic swap: clear + insert in one operation (one reflow)\nfunction renderList(container, items) {\n  const frag = document.createDocumentFragment();\n  for (const item of items) {\n    const li = document.createElement('li');\n    li.textContent = item.name;\n    li.dataset.id = item.id;\n    frag.appendChild(li);\n  }\n  container.replaceChildren(frag); // clears old + appends new atomically\n}\n// Template-based row factory: reusable HTML structure\n// HTML: <template id=\"row-tmpl\"><tr><td class=\"name\"></td><td class=\"qty\"></td><td><button class=\"del\">Delete</button></td></tr></template>\nfunction createRow(data) {\n  const tmpl = document.getElementById('row-tmpl');\n  const clone = tmpl.content.cloneNode(true);\n  const row = clone.querySelector('tr');\n  row.dataset.id = data.id;\n  clone.querySelector('.name').textContent = data.name;\n  clone.querySelector('.qty').textContent = String(data.qty);\n  clone.querySelector('.del').addEventListener('click', () => row.remove());\n  return clone;\n}\n// Partial diff: update only changed items (minimize DOM mutations)\nfunction updateList(container, newItems) {\n  const existing = new Map(\n    [...container.children].map(el => [el.dataset.id, el])\n  );\n  const frag = document.createDocumentFragment();\n  for (const item of newItems) {\n    const existingEl = existing.get(String(item.id));\n    if (existingEl) {\n      if (existingEl.textContent !== item.name) existingEl.textContent = item.name;\n      frag.appendChild(existingEl); // reorder if needed\n      existing.delete(String(item.id));\n    } else {\n      const li = document.createElement('li');\n      li.textContent = item.name;\n      li.dataset.id = item.id;\n      frag.appendChild(li);\n    }\n  }\n  container.replaceChildren(frag);\n}\n// Decision rule:\n//   many nodes to insert                                       -> DocumentFragment\n//   reusable HTML chunks                                       -> <template>\n//   single element                                             -> createElement + append\n//   clear + insert atomically                                  -> replaceChildren(frag)\n//   partial update (add/remove/reorder)                        -> diff + replaceChildren\n//   React/Vue/Angular                                          -> framework handles this\n//\n// Anti-pattern: appending in a loop; innerHTML += for appending;\n//   full re-render when a partial diff would suffice."
                  }
        ],
        tips: [
                  "DocumentFragment triggers one reflow on insertion vs one per element — significant for large lists.",
                  "The <template> element's .content property is a DocumentFragment — the modern pattern for reusable HTML.",
                  "fragment.children is empty after appending — all children moved to the target.",
                  "Use it whenever appending more than 2-3 nodes in a loop."
        ],
        mistake: "Appending elements inside a loop directly to the live DOM — each append triggers a reflow. Build in a DocumentFragment then append once.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "history-api",
        fn: "History API",
        desc: "Manipulate browser history and URL without page reloads — the foundation of client-side routing.",
        category: "Events & APIs",
        subtitle: "Client-side URL and history control",
        signature: "history.pushState(state, \"\", url)  |  history.replaceState()",
        descLong: "The History API lets you change the URL and manage browser history without navigation. pushState adds a new history entry; replaceState modifies the current one. The popstate event fires on back/forward navigation. This is the foundation all SPA routers (React Router, Vue Router) are built on.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of History API — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest History API: change URL without reload.\n// STRENGTHS - shows pushState with state object and URL.\n// WEAKNESSES- no popstate listener, no replaceState, no routing.\n//\n// GOAL: change the URL without reloading\nhistory.pushState({ page: 'profile' }, '', '/profile');\nhistory.back();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of History API — common patterns you'll see in production.\n// APPROACH  - Combine History API with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - SPA routing with pushState/replaceState and popstate handler.\n// STRENGTHS - covers the 80% case: pushState, replaceState, popstate, URL parsing.\n// WEAKNESSES- no scroll restoration, no route matching, no base path.\n//\n// GOAL: handle SPA routing with history\n// WHY: pushState does not trigger popstate; back/forward does\nhistory.pushState({ page: 'profile' }, '', '/profile');\nhistory.replaceState({ page: 'home' }, '', '/');\nwindow.addEventListener('popstate', (e) => {\n  renderPage(e.state?.page ?? 'home');\n});\n// WHY: use URL constructor for parsing\nconst url = new URL(window.location.href);\nurl.searchParams.get('tab');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of History API — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production SPA router: route matching with regex patterns,\n//             scroll restoration, replaceState for transient state,\n//             popstate with state recovery, and a link interceptor.\n// STRENGTHS - route matcher; scroll restoration; link interceptor;\n//             state recovery; replaceState vs pushState guidance.\n// WEAKNESSES- no nested routes; no lazy loading; no code splitting.\n//\n// GOAL: manage browser history in SPAs\n// WHY: replaceState for transient states\n// WHY: pushState for navigable states\n// WHY: state object should be serializable\n// Minimal SPA router with route matching\nclass Router {\n  #routes = [];\n  #current = null;\n  add(pattern, handler) {\n    this.#routes.push({ pattern: new RegExp(pattern), handler });\n    return this;\n  }\n  start() {\n    window.addEventListener('popstate', (e) => this.#handle(e.state));\n    // Intercept internal links\n    document.addEventListener('click', (e) => {\n      const link = e.target.closest('a[href^=\"/\"]');\n      if (!link) return;\n      e.preventDefault();\n      this.navigate(link.getAttribute('href'));\n    });\n    this.#handle(history.state); // initial route\n  }\n  navigate(path, { replace = false } = {}) {\n    const state = { path, scrollY: window.scrollY };\n    if (replace) history.replaceState(state, '', path);\n    else history.pushState(state, '', path);\n    this.#handle(state);\n  }\n  #handle(state) {\n    const path = state?.path ?? window.location.pathname;\n    for (const { pattern, handler } of this.#routes) {\n      const match = path.match(pattern);\n      if (match) {\n        this.#current = { path, params: match.slice(1) };\n        handler(match.slice(1));\n        // Restore scroll position or reset\n        window.scrollTo(0, state?.scrollY ?? 0);\n        return;\n      }\n    }\n    console.warn('No route matched:', path);\n  }\n}\n// Usage\nconst router = new Router();\nrouter\n  .add('^/users/(\\w+)$', ([username]) => renderUser(username))\n  .add('^/settings$', () => renderSettings())\n  .add('^/$', () => renderHome());\nrouter.start();\n// Transient state: update URL without adding history entry\nfunction setActiveTab(tab) {\n  const url = new URL(window.location.href);\n  url.searchParams.set('tab', tab);\n  router.navigate(url.pathname + url.search, { replace: true });\n}\n// Decision rule:\n//   navigable route change                                      -> pushState\n//   transient state (tab, filter)                               -> replaceState\n//   restoring UI on back/forward                                 -> popstate handler\n//   URL parsing                                                  -> new URL(location.href)\n//   scroll position                                              -> store in state object\n//   internal link clicks                                         -> intercept + preventDefault\n//\n// Anti-pattern: pushState without a popstate listener;\n//   full page reload for internal navigation."
                  }
        ],
        tips: [
                  "Always listen to popstate to handle back/forward navigation — pushState alone doesn't trigger it.",
                  "Serialize page state into the state object — restore it on popstate.",
                  "replaceState is better than pushState for transient states (active tab) that shouldn't pollute history.",
                  "Use new URL(window.location.href) for reliable URL parsing — don't regex the href."
        ],
        mistake: "Calling pushState and forgetting the popstate handler — users clicking back will see the new URL but the wrong content.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
