export const meta = {
  "title": "ES6+ Modern Features",
  "domain": "javascript",
  "sheet": "es6",
  "icon": "✨"
}

export const sections = [

  // ── Section 1: Modern Syntax & Collections ─────────────────────────────────────────
  {
    id: "modern-syntax",
    title: "Modern Syntax & Collections",
    entries: [
      {
        id: "template-literals",
        fn: "Template Literals",
        desc: "Backtick strings that support embedded expressions and multi-line content.",
        category: "Modern Syntax & Collections",
        subtitle: "String interpolation and multiline strings",
        signature: "`text ${expression} text`",
        descLong: "Template literals use backtick delimiters and support ${...} interpolation of any expression. They preserve line breaks, making multi-line strings natural. Tagged templates allow custom string processing by prefixing with a tag function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Literals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest template literal: interpolate a variable with ${}.\n// STRENGTHS - two lines; shows backtick syntax + ${expression}.\n// WEAKNESSES- no multi-line, no tagged templates, no nesting.\n//\n// GOAL: interpolate variables into strings\nconst name = 'Alice';\n`Hello, ${name}! Welcome.`;  // 'Hello, Alice! Welcome.'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Literals — common patterns you'll see in production.\n// APPROACH  - Combine Template Literals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - template literal recipes: HTML rendering with multi-line,\n//             tagged templates for SQL parameterization.\n// STRENGTHS - covers the 80% case: multi-line HTML, expression interpolation,\n//             ternary inside ${}, and a basic SQL tag.\n// WEAKNESSES- no XSS escaping in HTML; SQL tag doesn't handle edge cases.\n//\n// GOAL: use template literals for HTML and multi-line strings\n// WHY: template literals preserve line breaks and support any expression\nfunction renderUserCard(user) {\n  const { id, name, email, role, verified } = user;\n  return `\n    <div class=\"card\" data-id=\"${id}\">\n      <h3>${name}</h3>\n      <p>${email}</p>\n      <span class=\"badge badge-${role.toLowerCase()}\">${role}</span>\n      <span class=\"status ${verified ? 'verified' : 'unverified'}\">\n        ${verified ? '✓ Verified' : 'Pending'}\n      </span>\n    </div>`;\n}\n// WHY: tagged templates for SQL, HTML escaping, GraphQL\nfunction sql(strings, ...values) {\n  return { query: strings.join('?'), params: values };\n}\nconst { query, params } = sql`SELECT * FROM users WHERE id = ${userId}`;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Literals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a production-safe HTML tag with context-aware escaping,\n//             a SQL tag with parameterized queries, and String.raw usage.\n// STRENGTHS - prevents XSS via context-aware escaping; SQL tag returns\n//             parameterized query objects; String.raw preserves backslashes.\n// WEAKNESSES- HTML tag doesn't handle attribute context vs text context\n//             fully (real libs like lit-html do this better).\n//\n// GOAL: production tagged templates for safe string processing\n// WHY: tagged templates prevent XSS, SQL injection, etc.\nfunction html(strings, ...values) {\n  const escape = (s) => String(s)\n    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')\n    .replace(/\"/g, '&quot;').replace(/'/g, '&#39;');\n  return strings.reduce((acc, str, i) =>\n    acc + str + (i < values.length ? escape(values[i]) : ''), '');\n}\nconst safe = html`<div>${userInput}</div>`; // safely escaped\n// SQL tag: returns { query, params } for parameterized execution\nfunction sql(strings, ...values) {\n  return {\n    query: strings.join('?'),\n    params: values,\n    execute(db) { return db.query(this.query, this.params); },\n  };\n}\nconst q = sql`SELECT * FROM users WHERE id = ${userId} AND status = ${'active'}`;\n// q.query  -> 'SELECT * FROM users WHERE id = ? AND status = ?'\n// q.params -> [userId, 'active']\n// String.raw preserves backslashes (useful for regex, Windows paths)\nconst regex = String.raw`\\d+\\.\\d+`;  // '\\d+\\.\\d+' (not 'd+.d+')\n// Decision rule:\n//   simple interpolation                             -> template literal\n//   multi-line strings                               -> template literal\n//   safe HTML/SQL/GraphQL                            -> tagged template\n//   raw strings (backslashes preserved)              -> String.raw`...`\n//   user input in HTML                               -> html`` tag with escaping\n//   user input in SQL                                -> sql`` tag with params\n//\n// Anti-pattern: using string concatenation for multi-variable strings;\n//   interpolating user input directly into HTML or SQL without a tag."
                  }
        ],
        tips: [
                  "Template literals shine for SQL, HTML, and other multi-line strings that need interpolation.",
                  "Tagged templates (like gql`...`, css`...`, html`...`) are used by many popular libraries.",
                  "You can call any expression inside ${} — ternaries, function calls, math.",
                  "Backticks themselves inside a template literal need escaping: \\`."
        ],
        mistake: "Using string concatenation (+) when template literals would be clearer — especially for strings with multiple variables or multi-line content.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "array-destructuring",
        fn: "Array Destructuring",
        desc: "Unpack array elements into named variables by position.",
        category: "Modern Syntax & Collections",
        subtitle: "Positional unpacking of arrays",
        signature: "const [a, b, ...rest] = arr",
        descLong: "Array destructuring assigns array elements to variables by position. You can skip elements with commas, provide defaults, and collect remaining elements with rest. Commonly used with function return values, useState, and any positional tuple-like return.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array Destructuring — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest array destructuring: unpack first, second, and rest.\n// STRENGTHS - four lines; shows positional unpacking + rest collection.\n// WEAKNESSES- no defaults, no skipping, no swapping.\n//\n// GOAL: unpack array elements into named variables\nconst [first, second, ...rest] = [1, 2, 3, 4];\nfirst;   // 1\nsecond;  // 2\nrest;    // [3, 4]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array Destructuring — common patterns you'll see in production.\n// APPROACH  - Combine Array Destructuring with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - array destructuring recipes: React useState, variable swap,\n//             defaults for missing elements, and destructuring in loops.\n// STRENGTHS - covers the 80% case: hooks, swap, defaults, loop unpacking.\n// WEAKNESSES- no skipping, no nested destructuring, no function params.\n//\n// GOAL: use destructuring for React hooks, swaps, and defaults\n// WHY: React useState relies on array destructuring\nconst [user, setUser] = useState(null);\n// WHY: swap variables without temp\nlet x = 10, y = 20;\n[x, y] = [y, x]; // x=20, y=10\n// WHY: defaults for missing elements\nconst [lat = 0, lon = 0] = [];\n// WHY: destructure in loops\n[[1, 'a'], [2, 'b']].forEach(([id, name]) => {\n  console.log(`${id}: ${name}`);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array Destructuring — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production array destructuring: tuple-style returns, skipping\n//             elements, nested destructuring, and function parameter defaults.\n// STRENGTHS - tuple returns are self-documenting; skipping avoids unused vars;\n//             nested destructuring handles complex data shapes.\n// WEAKNESSES- over-using array destructuring on objects reduces readability.\n//\n// GOAL: production array destructuring patterns\n// WHY: tuple-style returns pair naturally with array destructuring\n// Tuple-style return + destructuring\nfunction minMax(arr) {\n  return [Math.min(...arr), Math.max(...arr)];\n}\nconst [min, max] = minMax([3, 1, 4, 1, 5, 9]);\n// Skip elements with commas\nconst [, , third] = [10, 20, 30, 40]; // third = 30\n// Nested array destructuring\nconst [[x1, y1], [x2, y2]] = [[0, 0], [10, 20]];\n// Destructure in function params with defaults\nfunction processConfig([host = 'localhost', port = 3000, ...rest] = []) {\n  return { host, port, extra: rest };\n}\nprocessConfig(['api.example.com', 443, 'v2']);\n// { host: 'api.example.com', port: 443, extra: ['v2'] }\n// Multiple return values (idiomatic tuple pattern)\nfunction partition(arr, predicate) {\n  const pass = [], fail = [];\n  for (const item of arr) (predicate(item) ? pass : fail).push(item);\n  return [pass, fail];\n}\nconst [evens, odds] = partition([1, 2, 3, 4, 5, 6], n => n % 2 === 0);\n// evens = [2, 4, 6], odds = [1, 3, 5]\n// Decision rule:\n//   positional values (tuples, useState)             -> array destructuring\n//   named properties (objects)                       -> object destructuring\n//   swap variables                                   -> [a, b] = [b, a]\n//   collect remaining elements                       -> ...rest\n//   skip elements                                    -> commas: const [,, third] = arr\n//   multiple return values                           -> tuple return + destructuring\n//\n// Anti-pattern: over-using array destructuring on objects (use object\n//   destructuring instead); destructuring arrays with >5 elements (positional\n//   confusion — use object destructuring or named tuple pattern)."
                  }
        ],
        tips: [
                  "Use array destructuring for tuple-style returns: function minMax() { return [min, max]; }.",
                  "Swap two variables without a temp: [a, b] = [b, a].",
                  "React's useState hook relies on array destructuring for its [value, setter] pattern.",
                  "Skip elements with empty commas: const [,, third] = arr."
        ],
        mistake: "Over-using array destructuring on objects — object destructuring is almost always clearer since it names the properties explicitly.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "spread-operator",
        fn: "Spread Operator (...)",
        desc: "Expands an iterable into individual elements in function calls, array literals, or object literals.",
        category: "Modern Syntax & Collections",
        subtitle: "Unpack iterables inline",
        signature: "[...arr]  |  fn(...args)  |  { ...obj }",
        descLong: "Spread works in three contexts: array literals (expands elements), function calls (passes elements as arguments), and object literals (copies own enumerable properties). All three produce shallow copies. In function calls, spread replaces the need for .apply().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Spread Operator (...) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest spread: merge two arrays and two objects.\n// STRENGTHS - two lines; shows array spread + object spread.\n// WEAKNESSES- shallow copy only; no nested merge; no function call spread.\n//\n// GOAL: copy and merge arrays and objects\nconst combined = [...[1, 2], ...[3, 4]];  // [1, 2, 3, 4]\nconst merged = { ...{ a: 1 }, ...{ b: 2 } };  // { a: 1, b: 2 }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Spread Operator (...) — common patterns you'll see in production.\n// APPROACH  - Combine Spread Operator (...) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - spread recipes: immutable object update, nested update, array\n//             insert/remove, merge with priority, and function call spread.\n// STRENGTHS - covers the 80% case: immutable updates, merging, fn calls.\n// WEAKNESSES- shallow copy only; no deep merge; no spread of non-iterables.\n//\n// GOAL: use spread for immutable updates and merging\n// WHY: immutable object update — copy + override\nconst user = { id: 1, name: 'Alice' };\nconst updated = { ...user, name: 'Bob' };\n// WHY: nested immutable update\nconst state = { user: { name: 'Bob', age: 30 } };\nconst newState = { ...state, user: { ...state.user, age: 31 } };\n// WHY: immutable array insert/remove\nconst items = ['a', 'b', 'c'];\nconst inserted = [...items.slice(0, 1), 'x', ...items.slice(1)]; // ['a', 'x', 'b', 'c']\n// WHY: merge with priority (later overrides earlier)\nconst config = { ...defaults, ...overrides };\n// WHY: spread in function calls replaces .apply()\nMath.max(...[10, 5, 20]); // 20"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Spread Operator (...) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production spread patterns: deep-aware immutable updates,\n//             spreading iterables (Set, Map, generators), and a deep merge\n//             helper that handles nested objects correctly.\n// STRENGTHS - shows shallow vs deep copy distinction; spreads any iterable;\n//             deep merge helper prevents reference sharing bugs.\n// WEAKNESSES- deep merge helper is simple (no array merge strategy).\n//\n// GOAL: use spread correctly in production\n// WHY: spread is shallow — nested objects share references\n// Shallow copy — nested object is shared!\nconst original = { user: { name: 'Alice' } };\nconst shallow = { ...original };\nshallow.user.name = 'Bob';\noriginal.user.name; // 'Bob' (shared reference!)\n// Deep-aware immutable update (spread at each level)\nconst deepUpdated = { ...original, user: { ...original.user, name: 'Charlie' } };\ndeepUpdated.user.name = 'Dave';\noriginal.user.name; // 'Charlie' (safe)\n// Spread any iterable: Set, Map, generator, string\nconst unique = [...new Set([1, 1, 2, 3])]; // [1, 2, 3]\nconst letters = [...'hello']; // ['h', 'e', 'l', 'l', 'o']\nfunction* gen() { yield 1; yield 2; yield 3; }\nconst fromGen = [...gen()]; // [1, 2, 3]\n// Deep merge helper using spread + recursion\nfunction deepMerge(target, ...sources) {\n  if (!sources.length) return target;\n  const [source, ...rest] = sources;\n  const result = { ...target };\n  for (const key of Object.keys(source)) {\n    if (isObject(target[key]) && isObject(source[key])) {\n      result[key] = deepMerge(target[key], source[key]);\n    } else {\n      result[key] = source[key]; // later overrides earlier\n    }\n  }\n  return deepMerge(result, ...rest);\n}\nfunction isObject(v) { return v && typeof v === 'object' && !Array.isArray(v); }\nconst merged = deepMerge(\n  { db: { host: 'localhost', port: 3000 }, cache: true },\n  { db: { port: 5432 }, debug: false }\n);\n// { db: { host: 'localhost', port: 5432 }, cache: true, debug: false }\n// Decision rule:\n//   copy/merge arrays                                -> [...arr1, ...arr2]\n//   copy/merge objects                               -> { ...obj1, ...obj2 }\n//   immutable state update                           -> { ...prev, field: newVal }\n//   function call with array args                    -> fn(...args)\n//   deep clone needed                                -> structuredClone() not spread\n//   nested immutable update                          -> spread at each level (above)\n//   deep merge objects                               -> deepMerge helper (above)\n//\n// Anti-pattern: spreading a non-iterable in an array literal; expecting spread\n//   to deep-copy nested objects (it's shallow); using spread for deep clone\n//   instead of structuredClone()."
                  }
        ],
        tips: [
                  "Spread in function calls replaces Function.prototype.apply — cleaner and more readable.",
                  "Object spread properties later in the list override earlier ones.",
                  "Spread is shallow — nested objects/arrays are still references to the same memory.",
                  "You can spread any iterable: strings, Sets, Maps, generator results."
        ],
        mistake: "Spreading a non-iterable object in an array literal: [...obj] throws TypeError. Objects are only spreadable inside other objects ({...obj}), not arrays.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "map",
        fn: "Map",
        desc: "A key-value collection that allows any value as a key (not just strings) and preserves insertion order.",
        category: "Modern Syntax & Collections",
        subtitle: "Key-value store with any key type",
        signature: "new Map([[key, val], ...])  |  map.set(k, v).get(k)",
        descLong: "Map is like an object but keys can be anything (objects, functions, primitives). It preserves insertion order, has a .size property, and is directly iterable. For frequent add/delete operations, Map outperforms plain objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Map — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Map: set string, number, and object keys; get/has/size.\n// STRENGTHS - six lines; shows any key type + basic API.\n// WEAKNESSES- no iteration, no deletion, no use case shown.\n//\n// GOAL: store key-value pairs with any key type\nconst map = new Map();\nmap.set('name', 'Alice');\nmap.set(1, 'one');\nmap.set({ id: 1 }, 'object key');\nmap.get('name');  // 'Alice'\nmap.has(1);       // true\nmap.size;         // 3"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Map — common patterns you'll see in production.\n// APPROACH  - Combine Map with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Map recipes: caching, deduplication by field, and ordered\n//             iteration with for...of yielding [key, value] pairs.\n// STRENGTHS - covers the 80% case: cache, dedupe, iterate, spread values.\n// WEAKNESSES- no LRU eviction; no Map vs object decision framework.\n//\n// GOAL: use Map for caching, deduplication, and ordered iteration\n// WHY: Map preserves insertion order and is directly iterable\nconst cache = new Map();\ncache.set('user:1', { name: 'Alice' });\ncache.has('user:1');  // true\n// WHY: Map for deduplication by field\nfunction deduplicateByField(items, field) {\n  const seen = new Map();\n  for (const item of items) {\n    if (!seen.has(item[field])) {\n      seen.set(item[field], item);\n    }\n  }\n  return [...seen.values()];\n}\n// WHY: Map is iterable — for...of yields [key, value] pairs\nfor (const [key, value] of map) {\n  console.log(key, value);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Map — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - an LRU cache built on Map with insertion-order semantics,\n//             plus a performance comparison showing Map vs object for\n//             frequent mutations.\n// STRENGTHS - LRU eviction prevents unbounded growth; Map's insertion order\n//             makes LRU trivial; O(1) get/set/delete.\n// WEAKNESSES- LRU cache is single-threaded; no TTL support.\n//\n// GOAL: production Map usage — LRU cache with eviction\n// WHY: Map preserves insertion order — perfect for LRU (least recently used)\nclass LRUCache {\n  #cache = new Map();\n  #maxSize;\n  constructor(maxSize = 100) {\n    this.#maxSize = maxSize;\n  }\n  get(key) {\n    if (!this.#cache.has(key)) return undefined;\n    // Move to end (most recently used) by re-inserting\n    const value = this.#cache.get(key);\n    this.#cache.delete(key);\n    this.#cache.set(key, value);\n    return value;\n  }\n  set(key, value) {\n    if (this.#cache.has(key)) this.#cache.delete(key);\n    this.#cache.set(key, value);\n    // Evict oldest (first entry) if over capacity\n    if (this.#cache.size > this.#maxSize) {\n      const oldestKey = this.#cache.keys().next().value;\n      this.#cache.delete(oldestKey);\n    }\n  }\n  get size() { return this.#cache.size; }\n  has(key) { return this.#cache.has(key); }\n  clear() { this.#cache.clear(); }\n}\n// Usage\nconst cache = new LRUCache(3);\ncache.set('a', 1); cache.set('b', 2); cache.set('c', 3);\ncache.get('a'); // 1 — 'a' is now most recently used\ncache.set('d', 4); // evicts 'b' (least recently used)\ncache.has('b'); // false\n// Performance: Map vs object for frequent mutations\n// Map: O(1) set/get/delete, no prototype chain, no key coercion\n// Object: keys coerced to strings, prototype pollution risk, slower delete\n// Decision rule:\n//   keys are non-string (objects, numbers)           -> Map\n//   need insertion-order iteration                   -> Map\n//   frequent add/delete operations                   -> Map\n//   simple string-keyed config                       -> plain object\n//   keys are objects + want GC                       -> WeakMap\n//   need LRU/cache eviction                          -> Map + LRU pattern (above)\n//\n// Anti-pattern: using plain object for dynamic/non-string keys; using object\n//   for frequent delete (slow); not evicting from a cache (memory leak)."
                  }
        ],
        tips: [
                  "Use Map when keys are non-string or when you need guaranteed insertion-order iteration.",
                  "Map.size is a property, not a method — no parentheses needed.",
                  "Map is directly iterable with for...of — no need for Object.entries().",
                  "Use WeakMap when keys are objects and you want garbage collection (e.g., private data patterns)."
        ],
        mistake: "Using a plain object when keys are dynamic or non-string — an object with numeric or object keys silently converts them to strings. Use Map instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "set",
        fn: "Set",
        desc: "A collection of unique values in insertion order. Great for deduplication.",
        category: "Modern Syntax & Collections",
        subtitle: "Unique-value collection",
        signature: "new Set([...values])  |  set.add(v).has(v)",
        descLong: "Set stores unique values of any type. Duplicate additions are silently ignored. Has O(1) .has() lookups. The most common use case is deduplication of an array with [...new Set(arr)].",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Set — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Set: deduplicate an array with [...new Set(arr)].\n// STRENGTHS - one liner; shows the idiomatic dedup pattern.\n// WEAKNESSES- no membership check, no set operations, no iteration shown.\n//\n// GOAL: deduplicate an array\nconst arr = [1, 2, 2, 3, 3, 3];\nconst unique = [...new Set(arr)];  // [1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Set — common patterns you'll see in production.\n// APPROACH  - Combine Set with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Set recipes: membership tracking, deduplication by field,\n//             and set operations (difference via filter + has).\n// STRENGTHS - covers the 80% case: add, has, dedupe, set difference.\n// WEAKNESSES- no union/intersection; no WeakSet comparison.\n//\n// GOAL: use Set for deduplication and membership tracking\n// WHY: Set has O(1) .has() — much faster than array .includes()\nconst visited = new Set();\nvisited.add('page1');\nvisited.has('page1');  // true\n// WHY: deduplicate by field with a Set\nfunction removeDuplicates(items, compareFn) {\n  const seen = new Set();\n  return items.filter(item => {\n    const key = compareFn(item);\n    if (seen.has(key)) return false;\n    seen.add(key);\n    return true;\n  });\n}\n// WHY: Set operations — filter one set against another\nconst all = new Set(['js', 'python', 'go']);\nconst featured = new Set(['js', 'go']);\nconst other = new Set([...all].filter(t => !featured.has(t)));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Set — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a SetOperations utility class with union, intersection,\n//             difference, and symmetric difference; plus a performance\n//             note on Set vs array for membership checks.\n// STRENGTHS - all common set operations in one place; O(n) not O(n*m);\n//             works with any iterable.\n// WEAKNESSES- creates new Sets each time (no in-place mutation).\n//\n// GOAL: production set operations and efficient membership checks\n// WHY: Set.has() is O(1); array.includes() is O(n) — matters for large collections\nclass SetOps {\n  static union(a, b) {\n    return new Set([...a, ...b]);\n  }\n  static intersection(a, b) {\n    return new Set([...a].filter(x => b.has(x)));\n  }\n  static difference(a, b) {\n    return new Set([...a].filter(x => !b.has(x)));\n  }\n  static symmetricDifference(a, b) {\n    return new Set(\n      [...a].filter(x => !b.has(x)).concat([...b].filter(x => !a.has(x)))\n    );\n  }\n  static isSubset(small, big) {\n    return [...small].every(x => big.has(x));\n  }\n  static isDisjoint(a, b) {\n    return [...a].every(x => !b.has(x));\n  }\n}\n// Usage\nconst a = new Set([1, 2, 3, 4]);\nconst b = new Set([3, 4, 5, 6]);\nSetOps.union(a, b);              // {1, 2, 3, 4, 5, 6}\nSetOps.intersection(a, b);       // {3, 4}\nSetOps.difference(a, b);         // {1, 2}\nSetOps.symmetricDifference(a, b); // {1, 2, 5, 6}\nSetOps.isSubset(new Set([3, 4]), a); // true\nSetOps.isDisjoint(new Set([1]), new Set([5])); // true\n// Performance: Set.has() vs array.includes() for membership\n// 10,000 items: Set.has() ~0.01ms, array.includes() ~5ms (500x slower)\n// Decision rule:\n//   array deduplication                              -> [...new Set(arr)]\n//   O(1) membership check                            -> Set.has()\n//   track visited/processed items                    -> Set\n//   track visited objects (GC-friendly)              -> WeakSet\n//   set operations (union, intersection, diff)       -> SetOps class (above)\n//   large collection membership                      -> Set (O(1) vs array O(n))\n//\n// Anti-pattern: using indexOf for membership in large arrays; using arrays\n//   for deduplication with filter+includes (O(n^2)); not using Set for\n//   visited-tracking in graph traversal (slow lookups)."
                  }
        ],
        tips: [
                  "[...new Set(arr)] is the idiomatic one-liner for array deduplication.",
                  "Set uses SameValueZero equality — NaN is treated as equal to NaN.",
                  "Set is iterable in insertion order — spread or for...of to get values.",
                  "Use WeakSet for object membership tracking without preventing garbage collection."
        ],
        mistake: "Using indexOf to check membership in a large array for deduplication — use a Set for O(1) lookups instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Advanced ES6+ ─────────────────────────────────────────
  {
    id: "advanced-es6",
    title: "Advanced ES6+",
    entries: [
      {
        id: "symbol-iterator",
        fn: "Symbol.iterator",
        desc: "The well-known symbol that makes an object iterable — used by for...of, spread, and destructuring.",
        category: "Advanced ES6+",
        subtitle: "Make any object iterable",
        signature: "obj[Symbol.iterator] = function*() { yield ... }",
        descLong: "Any object with a [Symbol.iterator] method is iterable. The method must return an iterator — an object with a .next() method that returns { value, done } objects. Generator functions are the easiest way to create iterators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Symbol.iterator — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Symbol.iterator: make a range object iterable.\n// STRENGTHS - shows the iterator protocol: next() returning {value, done}.\n// WEAKNESSES- no generator shortcut; no yield* delegation.\n//\n// GOAL: make an object iterable with Symbol.iterator\nconst range = {\n  from: 1, to: 3,\n  [Symbol.iterator]() {\n    let current = this.from;\n    return { next: () => current <= this.to\n      ? { done: false, value: current++ }\n      : { done: true } };\n  }\n};\n[...range]; // [1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Symbol.iterator — common patterns you'll see in production.\n// APPROACH  - Combine Symbol.iterator with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - iterator protocol recipes: manual [Symbol.iterator] with\n//             next(), and the generator function* shortcut.\n// STRENGTHS - covers the 80% case: manual iterator + generator shortcut.\n// WEAKNESSES- no yield* delegation; no return() / throw() methods.\n//\n// GOAL: implement the iterator protocol for custom objects\n// WHY: any object with [Symbol.iterator] works with for...of and spread\nfunction makeRange(start, end) {\n  return {\n    [Symbol.iterator]() {\n      let current = start;\n      return {\n        next() {\n          if (current <= end) return { value: current++, done: false };\n          return { value: undefined, done: true };\n        }\n      };\n    }\n  };\n}\nfor (const n of makeRange(1, 5)) { console.log(n); } // 1, 2, 3, 4, 5\n// WHY: generator functions are the easiest way to create iterators\nfunction* rangeGen(n) { for (let i = 0; i < n; i++) yield i; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Symbol.iterator — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production iterable patterns: a lazy paginated API iterator,\n//             a tree-walker using yield*, and a custom collection class\n//             with Symbol.iterator for seamless integration with for...of.\n// STRENGTHS - lazy evaluation (only fetches pages on demand); yield* delegates\n//             to sub-iterables; custom collections work with spread/Array.from.\n// WEAKNESSES- async iteration needs async generators (separate pattern).\n//\n// GOAL: production iterables for lazy sequences and tree traversal\n// WHY: iterables work with for...of, spread, Array.from(), Promise.all()\n// Lazy paginated API iterator — only fetches pages on demand\nfunction createPager(fetchPage, pageSize = 20) {\n  return {\n    [Symbol.iterator]() {\n      let page = 0, items = [], idx = 0, done = false;\n      return {\n        next() {\n          if (idx >= items.length && !done) {\n            const result = fetchPage(page++, pageSize);\n            items = result.items;\n            done = result.done;\n            idx = 0;\n          }\n          if (idx < items.length) return { value: items[idx++], done: false };\n          return { value: undefined, done: true };\n        }\n      };\n    }\n  };\n}\n// Tree walker using yield* for recursive delegation\nfunction* walkTree(node) {\n  yield node.value;\n  for (const child of node.children || []) {\n    yield* walkTree(child); // delegate to subtree\n  }\n}\nconst tree = {\n  value: 1, children: [\n    { value: 2, children: [{ value: 4 }, { value: 5 }] },\n    { value: 3, children: [{ value: 6 }] },\n  ]\n};\n[...walkTree(tree)]; // [1, 2, 4, 5, 3, 6]\n// Custom collection class with iterable protocol\nclass UniqueList {\n  #items = new Set();\n  add(item) { this.#items.add(item); return this; }\n  get size() { return this.#items.size; }\n  [Symbol.iterator]() { return this.#items[Symbol.iterator](); }\n}\nconst list = new UniqueList();\nlist.add(1).add(2).add(1).add(3);\n[...list]; // [1, 2, 3]\nArray.from(list); // [1, 2, 3]\n// Decision rule:\n//   simple custom iteration                         -> generator function*\n//   complex iteration with state                    -> manual [Symbol.iterator] + next()\n//   delegate to existing iterable                   -> yield* otherIterable\n//   lazy/infinite sequence                          -> generator or manual iterator\n//   custom collection                               -> implement [Symbol.iterator]\n//\n// Anti-pattern: implementing .next() without [Symbol.iterator]; eagerly\n//   loading all data when a lazy iterator would suffice."
                  }
        ],
        tips: [
                  "Iterables work with for...of, spread, destructuring, Array.from(), and Promise.all().",
                  "Generator functions (*) are the easiest way to implement the iterator protocol.",
                  "Built-in iterables: Arrays, Strings, Maps, Sets, NodeLists, arguments.",
                  "An iterable can also be its own iterator by returning this from [Symbol.iterator]."
        ],
        mistake: "Implementing .next() but forgetting to include the [Symbol.iterator] method — the object won't work with for...of or spread without it.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "generators",
        fn: "function*",
        desc: "Generator functions that can pause execution with yield and resume, enabling lazy sequences.",
        category: "Advanced ES6+",
        subtitle: "Pausable functions for lazy sequences",
        signature: "function* gen() { yield value }",
        descLong: "Generators are functions that can suspend and resume. They produce an iterator automatically. Each call to .next() runs until the next yield, returning { value, done }. Generators are great for infinite sequences, lazy pipelines, and complex async coordination (with co-routine patterns).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of function* — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest generator: count up with yield, spread into array.\n// STRENGTHS - four lines; shows function* + yield + spread.\n// WEAKNESSES- no yield* delegation, no next(value) bidirectional, no infinite.\n//\n// GOAL: create a lazy, pausable iterator with yield\nfunction* countUp(n) {\n  for (let i = 0; i < n; i++) {\n    yield i;\n  }\n}\n[...countUp(5)];  // [0, 1, 2, 3, 4]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of function* — common patterns you'll see in production.\n// APPROACH  - Combine function* with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - generator recipes: range with step, infinite naturals with\n//             yield*, and a take() helper to pull N values.\n// STRENGTHS - covers the 80% case: finite range, infinite sequence, take.\n// WEAKNESSES- no next(value) bidirectional; no async generators.\n//\n// GOAL: build ranges and pipelines with generators\n// WHY: generators are lazy — computation happens only on pull\nfunction* range(start, end, step = 1) {\n  for (let i = start; i <= end; i += step) yield i;\n}\n[...range(1, 10, 2)]; // [1, 3, 5, 7, 9]\n// WHY: compose generators with yield* to delegate\nfunction* naturals() {\n  let n = 1;\n  while (true) yield n++;\n}\nfunction take(n, iterable) {\n  const result = [];\n  for (const val of iterable) {\n    result.push(val);\n    if (result.length === n) return result;\n  }\n}\ntake(5, naturals()); // [1, 2, 3, 4, 5]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of function* — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production generator patterns: a lazy transform pipeline,\n//             bidirectional next(value) for state machines, and an async\n//             generator for streaming data with for await...of.\n// STRENGTHS - lazy pipelines avoid intermediate arrays; bidirectional\n//             generators replace stateful classes; async generators stream.\n// WEAKNESSES- generators are single-use (must recreate to iterate again).\n//\n// GOAL: production generators for pipelines, state machines, and async streams\n// WHY: generators are lazy — computation happens only on pull\n// Lazy transform pipeline — no intermediate arrays\nfunction* mapGen(iterable, fn) {\n  for (const x of iterable) yield fn(x);\n}\nfunction* filterGen(iterable, predicate) {\n  for (const x of iterable) if (predicate(x)) yield x;\n}\nfunction* takeGen(iterable, n) {\n  let count = 0;\n  for (const x of iterable) {\n    if (count++ >= n) return;\n    yield x;\n  }\n}\n// Compose: filter evens -> square -> take 3 (lazy, no intermediate arrays)\nconst result = [...takeGen(mapGen(filterGen(naturals(), x => x % 2 === 0), x => x * x), 3)];\n// [4, 16, 36] (2^2, 4^2, 6^2)\n// Bidirectional generator — state machine via next(value)\nfunction* counter(initial = 0) {\n  let count = initial;\n  while (true) {\n    const command = yield count;\n    if (command === 'inc') count++;\n    else if (command === 'dec') count--;\n    else if (command === 'reset') count = 0;\n  }\n}\nconst gen = counter(10);\ngen.next();        // { value: 10, done: false }\ngen.next('inc');   // { value: 11, done: false }\ngen.next('inc');   // { value: 12, done: false }\ngen.next('reset'); // { value: 0, done: false }\n// Async generator for streaming data\nasync function* fetchStream(url) {\n  let page = 1;\n  while (true) {\n    const res = await fetch(`${url}?page=${page}`);\n    const data = await res.json();\n    if (data.items.length === 0) return;\n    for (const item of data.items) yield item;\n    page++;\n  }\n}\n// Consume with for await...of\n// for await (const item of fetchStream('/api/items')) {\n//   console.log(item);\n// }\n// Decision rule:\n//   lazy finite/infinite sequences                  -> generator\n//   transform pipelines                             -> compose generators (above)\n//   async streams                                   -> async generator + for await...of\n//   maintain state without classes                  -> generator with yield/next(value)\n//   bidirectional communication                     -> next(value) sends to yield expression\n//\n// Anti-pattern: trying to reuse an exhausted generator (must create new);\n//   eagerly collecting generator output when lazy consumption would save\n//   memory; using generators for synchronous hot loops (function call overhead)."
                  }
        ],
        tips: [
                  "yield* delegates to another iterable — useful for composing generators.",
                  "Generators can receive values back via next(value) — the yielded expression evaluates to it.",
                  "Generators are lazy — computation only happens when you pull the next value.",
                  "Async generators (async function*) pair with for await...of for async streams."
        ],
        mistake: "Trying to restart a generator — once done: true, the generator is exhausted. Create a new generator instance to iterate again.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "proxy",
        fn: "Proxy",
        desc: "Wraps an object and intercepts fundamental operations like property access, assignment, and function calls.",
        category: "Advanced ES6+",
        subtitle: "Intercept object operations with traps",
        signature: "new Proxy(target, handler)",
        descLong: "Proxy wraps a target object with a handler containing \"traps\" for intercepting operations. Common traps: get (property read), set (property write), has (in operator), deleteProperty, apply (function calls). Used by Vue 3's reactivity system, validation libraries, and ORM proxies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Proxy — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Proxy: intercept get and set on a plain object.\n// STRENGTHS - shows get/set traps + default for missing keys.\n// WEAKNESSES- no validation, no Reflect, no has/deleteProperty traps.\n//\n// GOAL: intercept reads and writes on an object\nconst handler = {\n  get(target, key) {\n    return key in target ? target[key] : `No key: ${key}`;\n  },\n  set(target, key, value) {\n    target[key] = value;\n    return true;\n  }\n};\nconst proxy = new Proxy({}, handler);\nproxy.x = 5;\nproxy.x;       // 5\nproxy.missing; // 'No key: missing'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Proxy — common patterns you'll see in production.\n// APPROACH  - Combine Proxy with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Proxy recipes: validation via set trap, logging via get trap,\n//             and Reflect for default behavior inside traps.\n// STRENGTHS - covers the 80% case: validate, log, Reflect.get/set.\n// WEAKNESSES- no nested proxy; no has/deleteProperty/apply traps.\n//\n// GOAL: use Proxy for validation, defaults, and logging\n// WHY: set trap validates writes before mutating\nconst handler = {\n  get(target, key) {\n    console.log(`Getting ${key}`);\n    return key in target ? target[key] : `No key: ${key}`;\n  },\n  set(target, key, value) {\n    if (typeof value !== 'number') throw new TypeError('Must be number');\n    target[key] = value;\n    return true; // WHY: set trap must return true or throws in strict mode\n  },\n};\n// WHY: use Reflect inside traps for default behavior\nconst handler2 = {\n  get(target, key, receiver) {\n    return Reflect.get(target, key, receiver);\n  }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Proxy — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a reactive state system using Proxy with get/set traps,\n//             a validation proxy with schema-based type checking, and\n//             a negative-index array proxy using the get trap.\n// STRENGTHS - reactivity system (Vue 3 style); schema validation in one proxy;\n//             negative array indices via Proxy.\n// WEAKNESSES- Proxy has performance overhead per access; not suitable for\n//             hot loops; can't proxy primitive values.\n//\n// GOAL: production Proxy patterns — reactivity, validation, and custom arrays\n// WHY: Proxy powers Vue 3 reactivity and many validation/ORM libs\n// Reactive state — notify subscribers on change (Vue 3 pattern)\nfunction reactive(target) {\n  const subscribers = new Set();\n  return {\n    proxy: new Proxy(target, {\n      get(t, key, receiver) {\n        const value = Reflect.get(t, key, receiver);\n        return typeof value === 'object' && value !== null\n          ? reactive(value).proxy // deep reactivity\n          : value;\n      },\n      set(t, key, value, receiver) {\n        const old = t[key];\n        const result = Reflect.set(t, key, value, receiver);\n        if (old !== value) subscribers.forEach(fn => fn(key, value, old));\n        return result;\n      },\n    }),\n    subscribe(fn) { subscribers.add(fn); return () => subscribers.delete(fn); },\n  };\n}\nconst state = reactive({ count: 0, user: { name: 'Alice' } });\nstate.subscribe((key, val) => console.log(`${key} changed to ${val}`));\nstate.proxy.count = 1; // logs: count changed to 1\n// Schema validation proxy\nfunction validated(obj, schema) {\n  return new Proxy(obj, {\n    set(target, key, value) {\n      const rule = schema[key];\n      if (rule && !rule.validate(value)) {\n        throw new TypeError(`Invalid ${key}: ${rule.message}`);\n      }\n      target[key] = value;\n      return true;\n    },\n  });\n}\nconst user = validated({}, {\n  age: { validate: v => typeof v === 'number' && v >= 0, message: 'must be non-negative number' },\n  name: { validate: v => typeof v === 'string' && v.length > 0, message: 'must be non-empty string' },\n});\nuser.name = 'Alice'; // OK\n// user.age = -1; // throws TypeError\n// Negative-index array proxy\nconst arr = ['a', 'b', 'c', 'd'];\nconst negativeArr = new Proxy(arr, {\n  get(target, key) {\n    const idx = Number(key);\n    if (Number.isInteger(idx) && idx < 0) return target[target.length + idx];\n    return Reflect.get(target, key);\n  }\n});\nnegativeArr[-1]; // 'd'\nnegativeArr[-2]; // 'c'\n// Decision rule:\n//   intercept reads/writes without changing API surface           -> Proxy\n//   validate property assignments                                  -> set trap\n//   track access for reactivity or logging                         -> get/has traps\n//   simple validation with known schema                            -> class getters/setters\n//   deep reactivity                                               -> recursive Proxy in get trap\n//   custom array behavior (negative indices, etc.)                -> Proxy on array\n//\n// Anti-pattern: forgetting to return true from set trap; proxying hot loops\n//   (per-access overhead); using Proxy for simple validation when getters/\n//   setters suffice; not using Reflect inside traps (manual access breaks\n//   receiver/inheritance semantics)."
                  }
        ],
        tips: [
                  "Always return true from set traps — returning false (or nothing) throws a TypeError in strict mode.",
                  "Proxy is the engine behind Vue 3 reactivity — setting a property notifies computed dependencies.",
                  "Use Reflect inside traps to call the default behavior: Reflect.get(target, key, receiver).",
                  "Proxy wraps by reference — changes through the proxy affect the original target object."
        ],
        mistake: "Forgetting to return true from the set trap — the operation is considered to have failed and throws a TypeError.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "weakmap",
        fn: "WeakMap",
        desc: "A Map where keys must be objects and are held weakly — entries are GC'd when the key is no longer referenced.",
        category: "Advanced ES6+",
        subtitle: "Object-keyed map that doesn't prevent GC",
        signature: "const wm = new WeakMap()  →  wm.set(obj, val)  wm.get(obj)",
        descLong: "WeakMap keys must be objects (or non-registered symbols). When the key object has no other references, the entry is garbage collected. This prevents memory leaks when associating metadata with DOM nodes or class instances. WeakMap is not iterable — you cannot enumerate its entries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WeakMap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest WeakMap: attach private data to a class instance.\n// STRENGTHS - shows set/get pattern; data is GC'd when instance is dereferenced.\n// WEAKNESSES- no iteration, no .size; modern #private fields are preferred.\n//\n// GOAL: attach private data to objects without preventing GC\nconst _private = new WeakMap();\nclass Counter {\n  constructor() { _private.set(this, { count: 0 }); }\n  increment() { _private.get(this).count++; }\n  get value() { return _private.get(this).count; }\n}\nconst c = new Counter();\nc.increment();\nc.value; // 1"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WeakMap — common patterns you'll see in production.\n// APPROACH  - Combine WeakMap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - WeakMap recipes: DOM node metadata (no leak after removal),\n//             and private class data pattern (pre-#private fields).\n// STRENGTHS - covers the 80% case: DOM metadata + private state.\n// WEAKNESSES- no #private field comparison; no non-iterable caveat shown.\n//\n// GOAL: use WeakMap for DOM metadata and private state\n// WHY: WeakMap keys must be objects — primitives throw TypeError\n// WHY: WeakMap entries are GC'd when key is unreachable\nconst nodeData = new WeakMap();\nconst btn = document.querySelector('#btn');\nnodeData.set(btn, { clicks: 0 });\n// WHY: private class data before #private fields\nconst _private = new WeakMap();\nclass User {\n  constructor(name) { _private.set(this, { name }); }\n  getName() { return _private.get(this).name; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WeakMap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production WeakMap patterns: a memoization cache keyed by\n//             function arguments (objects), a DOM event listener tracker\n//             that auto-cleans, and a comparison with modern #private fields.\n// STRENGTHS - memoization cache auto-cleans when args are GC'd; DOM tracker\n//             prevents leaks; shows when to use WeakMap vs #private fields.\n// WEAKNESSES- WeakMap can't be inspected/debugged (no iteration); only object keys.\n//\n// GOAL: production WeakMap for memoization, DOM tracking, and private state\n// WHY: WeakMap entries are GC'd when key is unreachable — prevents memory leaks\n// Memoization cache keyed by argument objects (auto-cleaned when args are GC'd)\nfunction memoize(fn) {\n  const cache = new WeakMap();\n  return function(arg) {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}\nconst expensiveCompute = memoize((obj) => {\n  return Object.keys(obj).reduce((sum, k) => sum + obj[k], 0);\n});\nconst data = { a: 1, b: 2, c: 3 };\nexpensiveCompute(data); // 6 (computed)\nexpensiveCompute(data); // 6 (cached)\n// When 'data' is dereferenced, the cache entry is GC'd automatically\n// DOM event listener tracker — auto-cleans when nodes are removed\nconst listenerTracker = new WeakMap();\nfunction addTrackedListener(node, event, handler) {\n  node.addEventListener(event, handler);\n  const entry = listenerTracker.get(node) || [];\n  entry.push({ event, handler });\n  listenerTracker.set(node, entry);\n}\nfunction removeAllListeners(node) {\n  const entries = listenerTracker.get(node) || [];\n  entries.forEach(({ event, handler }) => node.removeEventListener(event, handler));\n  listenerTracker.delete(node);\n}\n// When node is removed from DOM and dereferenced, WeakMap entry is GC'd\n// Modern alternative: #private fields (ES2022+)\nclass User {\n  #name; // true private field\n  constructor(name) { this.#name = name; }\n  getName() { return this.#name; }\n}\n// #private fields are simpler but: not GC-friendly for external metadata,\n// can't be used cross-instance, and require modern JS target.\n// Decision rule:\n//   private data per object instance              -> WeakMap (legacy) or #private fields (modern)\n//   DOM node metadata                             -> WeakMap\n//   keys are primitives or need iteration         -> Map\n//   memoization with object args                  -> WeakMap (auto-cleanup)\n//   cross-instance private data                   -> WeakMap (shared instance)\n//\n// Anti-pattern: using Map for DOM/node metadata — leaks memory; using WeakMap\n//   when you need to iterate or check .size; using WeakMap with primitive keys\n//   (throws TypeError)."
                  }
        ],
        tips: [
                  "WeakMap is the classic pattern for private class data before # private fields existed.",
                  "Keys must be objects — attempting to use a primitive throws TypeError.",
                  "WeakMap is non-iterable — no .keys(), .values(), .entries(), or .size.",
                  "DOM node metadata is a primary use case — no leak when nodes are removed."
        ],
        mistake: "Using a regular Map to associate data with DOM nodes — the Map holds strong references and prevents GC even after nodes are removed. Use WeakMap.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "weakset",
        fn: "WeakSet",
        desc: "A Set of weakly-held objects — useful for tracking object membership without preventing GC.",
        category: "Advanced ES6+",
        subtitle: "GC-friendly object membership tracking",
        signature: "const ws = new WeakSet()  →  ws.add(obj)  ws.has(obj)",
        descLong: "WeakSet is a collection of objects held weakly — objects are automatically removed when GC'd. Like WeakMap, it is non-iterable. Primary use: tracking whether an object has been processed/visited without polluting the object itself or preventing collection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WeakSet — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest WeakSet: track visited objects without preventing GC.\n// STRENGTHS - five lines; shows add/has pattern for visited tracking.\n// WEAKNESSES- no iteration, no .size; only objects as values.\n//\n// GOAL: track object membership without preventing GC\nconst visited = new WeakSet();\nfunction visit(node) {\n  if (visited.has(node)) return;\n  visited.add(node);\n  // process...\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WeakSet — common patterns you'll see in production.\n// APPROACH  - Combine WeakSet with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - WeakSet recipes: recursive node processing (cycle prevention),\n//             and duplicate request prevention.\n// STRENGTHS - covers the 80% case: cycle detection + dedup processing.\n// WEAKNESSES- no comparison with Set; no GC demo.\n//\n// GOAL: use WeakSet in recursive processing and pipelines\n// WHY: WeakSet only holds objects, and they are GC'd when unreachable\nfunction processNode(node) {\n  if (visited.has(node)) return; // already processed\n  visited.add(node);\n  for (const child of node.children) {\n    processNode(child);\n  }\n}\n// WHY: prevent duplicate processing of request objects\nconst processed = new WeakSet();\nfunction handle(request) {\n  if (processed.has(request)) throw new Error('Request already handled');\n  processed.add(request);\n  return doWork(request);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WeakSet — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production WeakSet patterns: a JSON cycle-safe serializer,\n//             a frozen-object guard, and a comparison with Set for\n//             long-lived vs short-lived tracking.\n// STRENGTHS - cycle-safe stringify without polluting objects; frozen guard\n//             prevents mutation; auto-GC when objects go out of scope.\n// WEAKNESSES- WeakSet is not inspectable (no .size, no iteration); only objects.\n//\n// GOAL: production WeakSet for cycle-safe serialization and object guards\n// WHY: WeakSet avoids polluting objects with boolean flags; entries are GC'd\n// Cycle-safe JSON stringify using WeakSet for visited tracking\nfunction safeStringify(obj) {\n  const seen = new WeakSet();\n  return JSON.stringify(obj, (key, value) => {\n    if (typeof value === 'object' && value !== null) {\n      if (seen.has(value)) return '[Circular]';\n      seen.add(value);\n    }\n    return value;\n  }, 2);\n}\nconst a = { name: 'a' };\nconst b = { name: 'b', ref: a };\na.ref = b; // circular: a -> b -> a\nsafeStringify(a);\n// { \"name\": \"a\", \"ref\": { \"name\": \"b\", \"ref\": \"[Circular]\" } }\n// Frozen-object guard — prevent mutation of already-frozen objects\nconst frozen = new WeakSet();\nfunction deepFreeze(obj) {\n  if (frozen.has(obj)) return obj; // already frozen\n  Object.freeze(obj);\n  frozen.add(obj);\n  for (const key of Object.keys(obj)) {\n    if (typeof obj[key] === 'object' && obj[key] !== null) deepFreeze(obj[key]);\n  }\n  return obj;\n}\nconst config = deepFreeze({ api: { key: 'secret' }, debug: false });\n// config.api.key = 'hacked'; // throws in strict mode\n// Set vs WeakSet decision:\n// Set: need iteration, .size, or primitive values — but holds strong refs\n// WeakSet: only objects, no iteration — but GC-friendly (no leaks)\n// Decision rule:\n//   track visited/processed objects (GC-friendly)       -> WeakSet\n//   membership of primitives or need iteration          -> Set\n//   track object relationships with associated data     -> WeakMap\n//   cycle-safe serialization                            -> WeakSet (above)\n//   prevent duplicate processing of request objects     -> WeakSet\n//\n// Anti-pattern: using Set for visited object tracking in long-lived structures\n//   (prevents GC); using WeakSet when you need to iterate or check .size;\n//   using WeakSet with primitive values (throws TypeError)."
                  }
        ],
        tips: [
                  "WeakSet only stores objects — no primitives.",
                  "Non-iterable: no .forEach(), .values(), or .size — only .add(), .has(), .delete().",
                  "Objects in WeakSet are GC'd when no other references exist — no memory leak.",
                  "Use WeakSet instead of a boolean property on objects to avoid polluting them."
        ],
        mistake: "Using a regular Set to track visited nodes in a recursive algorithm — it prevents GC. Use WeakSet so entries disappear when objects are no longer needed.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "tagged-template-literals",
        fn: "Tagged Template Literals",
        desc: "Prefix a template literal with a function to process the strings and values with custom logic.",
        category: "Advanced ES6+",
        subtitle: "Custom template literal processing",
        signature: "tag`template ${expr} string`",
        descLong: "A tag function receives the template parts as a strings array and the interpolated values as separate arguments. It can return anything — a string, object, or DOM node. Used extensively: gql`...` for GraphQL, css`...` for styled-components, html`...` for lit-html, and sql`...` for safe queries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tagged Template Literals — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest tagged template: a greet function that uppercases the name.\n// STRENGTHS - shows tag function receiving (strings, ...values).\n// WEAKNESSES- no escaping, no strings.raw, no multiple values.\n//\n// GOAL: prefix a template literal with a function to process parts and values\nfunction greet(strings, name) {\n  return strings[0] + name.toUpperCase() + strings[1];\n}\nconst name = 'alice';\ngreet`Hello, ${name}!`; // 'Hello, ALICE!'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tagged Template Literals — common patterns you'll see in production.\n// APPROACH  - Combine Tagged Template Literals with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - tagged template recipes: HTML escaping tag and SQL\n//             parameterized query tag.\n// STRENGTHS - covers the 80% case: XSS prevention + SQL injection prevention.\n// WEAKNESSES- HTML tag doesn't handle attribute context; SQL tag is basic.\n//\n// GOAL: build safe HTML and SQL tags\n// WHY: tags receive (strings, ...values); strings.length === values.length + 1\nfunction html(strings, ...values) {\n  return strings.reduce((result, str, i) => {\n    const value = values[i - 1];\n    const safe = String(value)\n      .replace(/&/g, '&amp;')\n      .replace(/</g, '&lt;')\n      .replace(/>/g, '&gt;');\n    return result + safe + str;\n  });\n}\nconst userInput = '<script>alert(\"xss\")</script>';\nhtml`<p>Hello, ${userInput}!</p>`;\n// WHY: SQL tag for parameterized queries\nfunction sql(strings, ...values) {\n  const query = strings.join('?');\n  return { query, params: values };\n}\nsql`SELECT * FROM users WHERE id = ${userId}`;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tagged Template Literals — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production tagged templates: a CSS-in-JS tag with interpolation,\n//             a GraphQL tag returning parsed AST, and strings.raw for regex.\n// STRENGTHS - tags can return any type (string, object, AST); strings.raw\n//             preserves backslashes; shows real-world library patterns.\n// WEAKNESSES- CSS tag doesn't handle scoped class hashing; GraphQL tag\n//             doesn't validate against schema.\n//\n// GOAL: production tagged templates for CSS, GraphQL, and raw strings\n// WHY: tags can return strings, DOM nodes, React components, query objects\n// CSS-in-JS tag (styled-components pattern)\nfunction css(strings, ...values) {\n  const style = strings.reduce((acc, str, i) =>\n    acc + str + (i < values.length ? String(values[i]) : ''), '');\n  return { style, className: 'css-' + hash(style) };\n}\nfunction hash(s) { return s.length.toString(36); }\nconst button = css`\n  color: ${'blue'};\n  padding: ${'8px 16px'};\n`;\n// button.style -> 'color: blue; padding: 8px 16px;'\n// button.className -> 'css-30'\n// GraphQL tag (Apollo pattern)\nfunction gql(strings, ...values) {\n  const query = strings.reduce((acc, str, i) =>\n    acc + str + (i < values.length ? String(values[i]) : ''), '');\n  return { kind: 'Document', query, definitions: parseQuery(query) };\n}\nfunction parseQuery(q) { return q.split('{')[0].trim(); }\nconst GET_USER = gql`\n  query GetUser(${'$id: ID!'}) {\n    user(id: ${'$id'}) {\n      name\n      email\n    }\n  }\n`;\n// GET_USER.query -> 'query GetUser($id: ID!) { user(id: $id) { name email } }'\n// String.raw preserves backslashes (regex, Windows paths)\nconst pattern = String.raw`\\d{2,4}\\.\\d{2}`; // '\\d{2,4}\\.\\d{2}'\nconst winPath = String.raw`C:\\Users\\\\admin\\\\file.txt`;\n// Decision rule:\n//   safe HTML interpolation                         -> html`` tag with escaping\n//   SQL with parameters                             -> sql`` tag returning {query, params}\n//   CSS-in-JS / GraphQL                             -> library-provided tag (above pattern)\n//   raw strings (backslashes preserved)             -> String.raw`...`\n//   return non-string types                          -> tag returns object/AST/component\n//\n// Anti-pattern: interpolating user input directly into SQL literals; using\n//   regular template literals for HTML without a tag (XSS risk); ignoring\n//   strings.raw when backslash preservation is needed."
                  }
        ],
        tips: [
                  "strings.raw property gives the raw string with escape sequences unprocessed.",
                  "strings.length is always values.length + 1 — there is always one more string than value.",
                  "The tag function can return any type — styled-components returns a React component.",
                  "String.raw is a built-in tag that returns the raw string with backslashes unprocessed."
        ],
        mistake: "Building SQL queries with regular template literals: `SELECT * FROM users WHERE id = ${id}` — this enables SQL injection. Use a parameterized sql tag instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "optional-chaining-advanced",
        fn: "Optional Chaining (?.) - Advanced Patterns",
        desc: "Safely access nested properties, methods, and computed values.",
        category: "Modern Syntax",
        subtitle: "Nullish short-circuit with ?.[], ?.() syntax",
        signature: "obj?.prop\nobj?.[expr]\nfunc?.(args)\narray?.[index]",
        descLong: "Optional chaining (?.) safely accesses properties even if intermediate values are null/undefined. Works with property access (?.prop), computed access (?.[ ]), method calls (?.()), and optional chaining short-circuits falsy checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Optional Chaining (?.) - Advanced Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest optional chaining: safely access nested properties.\n// STRENGTHS - three lines; shows ?. for existing and missing paths.\n// WEAKNESSES- no method calls, no computed access, no ?? fallback.\n//\n// GOAL: safely access nested properties\nconst user = { address: { city: 'NYC' } };\nuser?.address?.city;   // 'NYC'\nuser?.phone?.number;   // undefined (no error)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Optional Chaining (?.) - Advanced Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Optional Chaining (?.) - Advanced Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - optional chaining recipes: computed access, method calls,\n//             callback invocation, and ?? for defaults.\n// STRENGTHS - covers the 80% case: ?.[], ?.(), ?? fallback.\n// WEAKNESSES- no performance note; no destructuring with ?..\n//\n// GOAL: use optional chaining for methods, computed keys, and arrays\n// WHY: short-circuits on null/undefined without throwing\nconst data = { items: [1, 2, 3] };\ndata?.items?.[0];       // 1\nconst obj = {\n  getName: () => 'Alice',\n  getEmail: null\n};\nobj.getName?.();        // 'Alice'\nobj.getEmail?.();       // undefined\nclass Modal {\n  constructor(options = {}) {\n    this.onOpen = options.onOpen;\n    this.onClose = options.onClose;\n  }\n  open() { this.onOpen?.(); this.show(); }\n  close() { this.onClose?.(); this.hide(); }\n}\n// WHY: combine with nullish coalescing for defaults\nconst config = {};\nconst timeout = config?.settings?.timeout ?? 5000;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Optional Chaining (?.) - Advanced Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production optional chaining patterns: API response parsing,\n//             event handler maps, DOM access with fallback, and a\n//             performance comparison with direct access.\n// STRENGTHS - safe deep access without verbose && chains; combines with ??\n//             for default values; short-circuits efficiently.\n// WEAKNESSES- over-using ?. on guaranteed objects adds unnecessary overhead;\n//   can hide bugs (null where you don't expect it).\n//\n// GOAL: production optional chaining for API parsing, DOM, and event maps\n// WHY: short-circuit stops evaluation once null/undefined is hit\n// API response parsing — deep nested data with safe fallbacks\nfunction getUserAvatar(apiResponse) {\n  return apiResponse?.data?.user?.profile?.avatar?.url\n    ?? '/default-avatar.png';\n}\n// Without optional chaining (equivalent, verbose):\n//   apiResponse && apiResponse.data && apiResponse.data.user &&\n//   apiResponse.data.user.profile && apiResponse.data.user.profile.avatar &&\n//   apiResponse.data.user.profile.avatar.url || '/default-avatar.png'\n// Event handler map — call only if handler exists\nconst handlers = {\n  click: (e) => console.log('clicked', e.target),\n  // hover: undefined — no handler registered\n};\nfunction dispatch(type, event) {\n  handlers[type]?.(event); // no-op if handler missing\n}\ndispatch('click', { target: 'btn' }); // logs\ndispatch('hover', { target: 'btn' }); // no-op, no error\n// DOM access with fallback\nconst title = document?.querySelector?.('.title')?.textContent ?? 'Untitled';\n// Computed access with optional chaining\nfunction getValue(obj, key) {\n  return obj?.[key] ?? null;\n}\n// Performance: ?. adds ~1 check per level vs direct access\n// Only use when null/undefined is genuinely possible\n// On guaranteed objects, direct access is faster (no extra check)\n// Decision rule:\n//   deep property access where intermediate may be null       -> obj?.a?.b\n//   optional method/callback invocation                        -> fn?.()\n//   provide fallback for missing value                         -> obj?.prop ?? default\n//   all intermediate values are guaranteed objects              -> direct property access (cheaper)\n//   DOM access (may not exist)                                 -> document?.querySelector?.()\n//   event handler dispatch                                     -> handlers[type]?.(event)\n//\n// Anti-pattern: over-using optional chaining on guaranteed objects (hides\n//   bugs, adds overhead); using ?. when you should validate and throw;\n//   chaining >5 levels (refactor the data shape or use a getter)."
                  }
        ],
        tips: [
                  "Optional chaining short-circuits — if any level is null/undefined, rest is skipped (efficient)",
                  "Returns undefined if chain is broken — use ?? to provide defaults",
                  "Works with destructuring: const { name } = user?.profile; — name is undefined if profile is null",
                  "Combine with nullish coalescing (??) to set defaults: user?.email ?? \"no-email@example.com\""
        ],
        mistake: "Confusing ?. with &&. Optional chaining is cleaner: user?.address?.city vs user && user.address && user.address.city",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "nullish-coalescing-operator",
        fn: "Nullish Coalescing Operator (??)",
        desc: "Default value only for null/undefined (not falsy values).",
        category: "Modern Syntax",
        subtitle: "Distinguish null from 0, \"\", false",
        signature: "value ?? defaultValue",
        descLong: "The ?? operator returns right operand only if left is null or undefined. Unlike ||, it doesn't treat 0, \"\", false, or NaN as falsy — perfect for defaults where these are valid values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Nullish Coalescing Operator (??) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest nullish coalescing: default for null/undefined only.\n// STRENGTHS - three lines; shows || vs ?? difference with 0.\n// WEAKNESSES- no chaining, no ?? with optional chaining, no precedence.\n//\n// GOAL: default only for null/undefined, not all falsy values\nconst age = 0;\nconsole.log(age || 18);  // 18 (wrong: treats 0 as falsy)\nconsole.log(age ?? 18);  // 0 (correct)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Nullish Coalescing Operator (??) — common patterns you'll see in production.\n// APPROACH  - Combine Nullish Coalescing Operator (??) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - nullish coalescing recipes: settings with 0/false/'' as valid,\n//             chain fallbacks, and combine with optional chaining.\n// STRENGTHS - covers the 80% case: ?? vs ||, chaining, ?? + ?..\n// WEAKNESSES- no precedence note (&& and ?? mixing); no function default params.\n//\n// GOAL: use ?? where 0, '', false, NaN are valid\n// WHY: || treats every falsy value as missing, ?? only null/undefined\nconst title = '';\nconsole.log(title || 'Untitled');  // 'Untitled' (wrong)\nconsole.log(title ?? 'Untitled');  // '' (correct)\nconst settings = {\n  notifications: false,\n  maxRetries: 0,\n  theme: null\n};\nconsole.log(settings.notifications ?? true); // false\nconsole.log(settings.maxRetries ?? 3);       // 0\nconsole.log(settings.theme ?? 'light');        // 'light'\n// WHY: chain fallbacks and combine with optional chaining\nconst value = null ?? undefined ?? 0 ?? 'default'; // 0\nconst timeout = config?.timeout ?? 5000;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Nullish Coalescing Operator (??) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production nullish coalescing patterns: config resolution with\n//             layered defaults, function parameter defaults with ??, and\n//             a comparison table of ?? vs || for each falsy value.\n// STRENGTHS - layered defaults are explicit and readable; ?? in function\n//             params handles null/undefined from API responses; clear\n//             decision framework for ?? vs ||.\n// WEAKNESSES- cannot mix && and ?? without parentheses (SyntaxError).\n//\n// GOAL: production nullish coalescing for config, params, and API defaults\n// WHY: ?? only checks null/undefined — 0, '', false, NaN are valid values\n// Layered config resolution: explicit > env > defaults\nfunction resolveConfig(userConfig = {}) {\n  const defaults = { port: 3000, host: 'localhost', retries: 3, debug: false };\n  const env = {\n    port: process.env.PORT ? Number(process.env.PORT) : undefined,\n    host: process.env.HOST,\n    retries: process.env.RETRIES ? Number(process.env.RETRIES) : undefined,\n    debug: process.env.DEBUG === 'true' ? true : undefined,\n  };\n  // Layer: user config > env > defaults (?? preserves 0 and false)\n  return {\n    port: userConfig.port ?? env.port ?? defaults.port,\n    host: userConfig.host ?? env.host ?? defaults.host,\n    retries: userConfig.retries ?? env.retries ?? defaults.retries,\n    debug: userConfig.debug ?? env.debug ?? defaults.debug,\n  };\n}\nresolveConfig({ port: 0, debug: false });\n// { port: 0, host: 'localhost', retries: 3, debug: false }\n// With || instead of ??: port would be 3000 (wrong!), debug would be false (ok by accident)\n// Function parameter defaults with ?? (handles null from API)\nfunction formatDate(date, options = {}) {\n  const locale = options.locale ?? 'en-US';\n  const timezone = options.timezone ?? 'UTC';\n  return new Intl.DateTimeFormat(locale, { timeZone: timezone }).format(date);\n}\nformatDate(new Date(), { locale: null }); // uses 'en-US' (null -> default)\n// ?? vs || truth table for falsy values:\n//   value     || default    ?? default\n//   null      default       default\n//   undefined default       default\n//   0         default       0          (?? preserves)\n//   ''        default       ''         (?? preserves)\n//   false     default       false      (?? preserves)\n//   NaN       default       NaN        (?? preserves)\n// Decision rule:\n//   default for possibly-null config/API fields                -> ??\n//   default for booleans or numbers where 0/false valid        -> ??\n//   fall back on any falsy value (e.g., disable empty strings) -> ||\n//   optional chaining + default                                -> obj?.prop ?? default\n//   layered defaults (user > env > defaults)                   -> ?? chain (above)\n//   function params where null comes from API                  -> ?? in body (above)\n//\n// Anti-pattern: using || for numeric/flag defaults (0 and false are valid);\n//   mixing && and ?? without parentheses (SyntaxError); using ?? when you\n//   actually want to treat '' or NaN as missing (use || instead)."
                  }
        ],
        tips: [
                  "Use ?? for defaults where 0, \"\", false are valid values — not ||",
                  "Combine with optional chaining: obj?.prop ?? defaultValue",
                  "Chaining: a ?? b ?? c reads left-to-right, stops at first non-null",
                  "Cannot mix && and ?? without parentheses — use ( ) to disambiguate"
        ],
        mistake: "Using || when ?? needed. Results in incorrect defaults when 0, empty string, or false are valid values.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
