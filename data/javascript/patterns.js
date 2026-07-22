export const meta = {
  "title": "JavaScript Patterns",
  "domain": "javascript",
  "sheet": "patterns",
  "icon": "🧩"
}

export const sections = [

  // ── Section 1: Design & Functional Patterns ─────────────────────────────────────────
  {
    id: "design-functional",
    title: "Design & Functional Patterns",
    entries: [
      {
        id: "currying",
        fn: "Currying",
        desc: "Transform a multi-argument function into a chain of single-argument functions.",
        category: "Design & Functional Patterns",
        subtitle: "Partial application via nested functions",
        signature: "const fn = a => b => c => result",
        descLong: "Currying creates partially applied functions — you can call the function with some arguments now and the rest later. This enables creating specialized versions of general functions and building pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Currying — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the shape of currying: nested arrow functions that\n//             take one argument at a time.\n// STRENGTHS - fastest way to see partial application; no library needed;\n//             reads like the mathematical definition.\n// WEAKNESSES- hard-codes arity; can't be called with all args at once;\n//             no reuse story yet.\n//\n// GOAL: turn a 2-arg function into a chain of 1-arg functions\nconst multiply = a => b => a * b;\nconst double = multiply(2);   // partially applied — remembers a = 2\ndouble(5);                    // 10\nmultiply(3)(4);               // 12 — supply both one at a time"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Currying — common patterns you'll see in production.\n// APPROACH  - Combine Currying with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - use currying where it pays off day-to-day: pre-configured\n//             factories and reusable predicates.\n// STRENGTHS - the 80% case — specialize a general function once, reuse it\n//             everywhere; reads cleanly in .filter/.map callbacks.\n// WEAKNESSES- each function fixes its own arity by hand; no generic curry\n//             helper; no handling of \"call with all args at once\".\n//\n// GOAL: build reusable, pre-configured functions\n// WHY: fix the event name once, reuse the handler binder everywhere\nconst on = event => handler => element => {\n  element.addEventListener(event, handler);\n  return element;\n};\nconst onClick = on('click');\nonClick(() => console.log('clicked'))(document.body);\n// WHY: curried predicates read naturally inside array methods\nconst minLength = min => str => str.length >= min;\n['short', 'longenough'].filter(minLength(8)); // ['longenough']\n// WHY: partial application of a formatter\nconst format = locale => currency => amount =>\n  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);\nconst usd = format('en-US')('USD');\nusd(19.99); // '$19.99'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Currying — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a generic auto-curry that works both curried and all-at-once,\n//             plus the composition pattern currying exists to enable.\n// STRENGTHS - production-ready: flexible arity, integrates with pipe/compose,\n//             matches what lodash/Ramda give you; documents when NOT to use it.\n// WEAKNESSES- reflection on fn.length breaks for variadic/default params;\n//             debugging deep curried chains is harder than plain calls.\n//\n// GOAL: curry any function and feed it into a pipeline\n// WHY: auto-curry accepts args one-at-a-time OR all at once\nconst curry = (fn, arity = fn.length) =>\n  function curried(...args) {\n    return args.length >= arity\n      ? fn.apply(this, args)\n      : (...rest) => curried.apply(this, [...args, ...rest]);\n  };\nconst add = curry((a, b, c) => a + b + c);\nadd(1)(2)(3);   // 6\nadd(1, 2)(3);   // 6\nadd(1, 2, 3);   // 6 — flexible call styles\n// WHY: currying makes every step of a pipe unary\nconst pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);\nconst applyDiscount = curry((rate, price) => price * (1 - rate));\nconst addTax = curry((rate, price) => price * (1 + rate));\nconst checkout = pipe(applyDiscount(0.1), addTax(0.08));\ncheckout(100); // 97.2\n// Decision rule:\n//   the same function is partially applied in many places  -> curry it\n//   functional pipeline of unary steps                     -> curry + pipe/compose\n//   variadic / default-param function                      -> pass explicit arity\n//   heavy production use                                    -> lodash _.curry / Ramda\n//\n// Anti-pattern: currying a function that is only ever called once with all\n//   its arguments. It adds indirection and a harder stack trace for zero\n//   reuse benefit — just call fn(a, b, c) directly."
                  }
        ],
        tips: [
                  "Currying is most useful when the same function will be partially applied in many places.",
                  "Arrow function currying (a => b => ...) is clean but hard to call with all args at once.",
                  "Lodash _.curry() creates auto-curried functions that work both curried and uncurried.",
                  "Currying enables function composition pipelines — each step expects exactly one argument."
        ],
        mistake: "Over-currying simple utilities that are only called in one place — it adds cognitive overhead without benefit. Use currying when partial application actually happens.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "memoization",
        fn: "Memoization",
        desc: "Cache the results of expensive function calls and return the cached result for repeated inputs.",
        category: "Design & Functional Patterns",
        subtitle: "Cache expensive computation results",
        signature: "const memo = fn => { const cache = new Map(); return ... }",
        descLong: "Memoization is a caching strategy for pure functions. For each unique input, the result is computed once and stored. Subsequent calls with the same input return the cached value. Most effective for expensive computations or recursive algorithms with overlapping subproblems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Memoization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the minimal memoizer: a Map keyed by the stringified args.\n// STRENGTHS - shows the whole idea (check cache -> compute -> store) in a\n//             few lines; drop-in wrapper around any pure function.\n// WEAKNESSES- cache grows forever; JSON.stringify keys break on functions,\n//             symbols, and circular objects; ignores 'this'.\n//\n// GOAL: compute once per unique input, reuse the result after\nfunction memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}\nconst slowSquare = memoize(n => n * n);\nslowSquare(4); // computes -> 16\nslowSquare(4); // cache hit -> 16"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Memoization — common patterns you'll see in production.\n// APPROACH  - Combine Memoization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - add the two things real code needs: a size cap and support\n//             for recursive functions that call themselves.\n// STRENGTHS - bounded memory via a simple LRU eviction; turns exponential\n//             recursion (naive Fibonacci) into linear time.\n// WEAKNESSES- still uses JSON.stringify keys; eviction is oldest-inserted,\n//             not true least-recently-used; not safe for object identity.\n//\n// GOAL: memoize with a size limit and support recursion\n// WHY: cap the cache so long-running processes don't leak memory\nfunction memoizeWithLimit(fn, maxSize = 100) {\n  const cache = new Map();\n  return function (...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    // WHY: evict the oldest entry once we hit the cap\n    if (cache.size >= maxSize) cache.delete(cache.keys().next().value);\n    cache.set(key, result);\n    return result;\n  };\n}\n// WHY: the memoized binding is used inside the body, so recursion is cached\nconst fib = memoizeWithLimit(n => (n <= 1 ? n : fib(n - 1) + fib(n - 2)));\nfib(50); // fast — each n computed once"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Memoization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production memoization: object-identity keys via WeakMap and a\n//             true LRU using Map insertion order, plus a custom key resolver.\n// STRENGTHS - no memory leak for object args (WeakMap), correct LRU recency,\n//             pluggable key function for non-serializable inputs.\n// WEAKNESSES- more moving parts; WeakMap path only works for single object\n//             args; wrong for impure functions no matter how it's built.\n//\n// GOAL: memoize safely under real memory and key constraints\n// WHY: WeakMap keys let the GC reclaim entries when the object arg dies\nfunction memoizeByObject(fn) {\n  const cache = new WeakMap();\n  return obj => {\n    if (cache.has(obj)) return cache.get(obj);\n    const result = fn(obj);\n    cache.set(obj, result);\n    return result;\n  };\n}\n// WHY: true LRU — touch on read so hot keys survive eviction\nfunction memoizeLRU(fn, { maxSize = 100, key = JSON.stringify } = {}) {\n  const cache = new Map();\n  return (...args) => {\n    const k = key(args);\n    if (cache.has(k)) {\n      const v = cache.get(k);\n      cache.delete(k);      // re-insert to mark as most-recently-used\n      cache.set(k, v);\n      return v;\n    }\n    const result = fn(...args);\n    if (cache.size >= maxSize) cache.delete(cache.keys().next().value);\n    cache.set(k, result);\n    return result;\n  };\n}\n// Decision rule:\n//   pure fn, small primitive keyspace          -> plain Map memoize\n//   single object argument                      -> WeakMap (auto-GC)\n//   large/unbounded keyspace                    -> bounded LRU\n//   non-serializable args                       -> custom key resolver\n//   React render caching                        -> useMemo / useCallback\n//\n// Anti-pattern: memoizing an impure function (reads Date.now(), a DB, random,\n//   or mutable external state). The first result is cached forever, so callers\n//   silently get stale data. Only memoize deterministic, side-effect-free code."
                  }
        ],
        tips: [
                  "Only memoize pure functions — functions with side effects should not be memoized.",
                  "JSON.stringify as the cache key fails for functions, symbols, or circular objects — use a Map with the arg itself for single-argument functions.",
                  "React's useMemo and useCallback are memoization for component rendering.",
                  "Consider cache size — unbounded caches can leak memory. Add a max-size LRU for production."
        ],
        mistake: "Memoizing a function that has side effects or depends on external state — the cache will return stale results when the external state changes.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "compose-pipe",
        fn: "compose() / pipe()",
        desc: "Combine multiple single-argument functions into one. compose() applies right-to-left; pipe() left-to-right.",
        category: "Design & Functional Patterns",
        subtitle: "Chain functions into a pipeline",
        signature: "pipe(f, g, h)(x)  ===  h(g(f(x)))",
        descLong: "Compose and pipe are the foundation of functional programming pipelines. pipe() passes the result of each function as the input to the next (left to right — more readable). compose() applies right to left (mathematical convention). Both require all functions to be unary (single argument).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of compose() / pipe() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - define pipe with a single reduce and run three tiny steps.\n// STRENGTHS - shows the core identity pipe(f,g,h)(x) === h(g(f(x))) in one\n//             line; no dependencies; easy to trace by hand.\n// WEAKNESSES- assumes every step is unary; no async; no error handling.\n//\n// GOAL: chain unary functions left-to-right\nconst pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);\nconst transform = pipe(\n  x => x * 2,   // 3 -> 6\n  x => x + 1,   // 6 -> 7\n  x => x * x,   // 7 -> 49\n);\ntransform(3); // 49"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of compose() / pipe() — common patterns you'll see in production.\n// APPROACH  - Combine compose() / pipe() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - pair pipe with compose and use them on a realistic data\n//             transformation (normalizing user input into a slug).\n// STRENGTHS - the 80% case: readable left-to-right flow, plus the\n//             right-to-left compose variant for math-style composition.\n// WEAKNESSES- still synchronous and unary-only; no short-circuit on failure.\n//\n// GOAL: build readable data-transformation pipelines\n// WHY: pipe reads top-to-bottom; compose applies right-to-left\nconst pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);\nconst compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);\n// WHY: each step does one job, so the pipeline documents itself\nconst slugify = pipe(\n  s => s.trim(),\n  s => s.toLowerCase(),\n  s => s.replace(/\\s+/g, '-'),\n);\nslugify('  Hello World  '); // 'hello-world'\n// WHY: compose(f, g)(x) === f(g(x)) — same steps, reversed order\nconst shout = compose(\n  s => s + '!',\n  s => s.toUpperCase(),\n);\nshout('hi'); // 'HI!'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of compose() / pipe() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - an async pipe that awaits each step, plus how to feed\n//             multi-arg functions in via currying.\n// STRENGTHS - production-ready: handles promise-returning steps, keeps\n//             steps unary through partial application, fails fast on reject.\n// WEAKNESSES- async pipe serializes steps (no parallelism); deep pipelines\n//             produce opaque stack traces when a middle step throws.\n//\n// GOAL: compose sync and async transformations safely\n// WHY: reduce over resolved promises so each step can be async\nconst pipeAsync = (...fns) => x =>\n  fns.reduce((p, f) => p.then(f), Promise.resolve(x));\nconst enrichUser = pipeAsync(\n  id => fetchUser(id),          // async\n  user => ({ ...user, seen: Date.now() }),\n  user => saveUser(user),       // async\n);\n// await enrichUser(1);\n// WHY: multi-arg functions must be curried to fit a unary pipeline\nconst curry = fn => a => b => fn(a, b);\nconst add = curry((a, b) => a + b);\nconst scale = curry((k, x) => k * x);\nconst compute = pipe(add(10), scale(2));\ncompute(5); // (5 + 10) * 2 = 30\n// Decision rule:\n//   sequential sync transforms                 -> pipe\n//   right-to-left / math convention             -> compose\n//   any step returns a Promise                  -> pipeAsync\n//   multi-arg step                              -> curry it to unary first\n//   production FP at scale                       -> Ramda / lodash-fp (auto-curried)\n//\n// Anti-pattern: passing a multi-argument function straight into pipe. Each\n//   step receives ONLY the previous step's single return value, so extra\n//   params are silently undefined. Curry first: pipe(add(1), multiply(2))."
                  }
        ],
        tips: [
                  "pipe() is easier to read than compose() for most developers — prefer it.",
                  "All functions in the pipeline must be unary — use currying to convert multi-arg functions.",
                  "For async pipelines, use async reduce: fns.reduce((p, f) => p.then(f), Promise.resolve(x)).",
                  "Ramda and Lodash/fp provide production-grade pipe/compose with auto-curry."
        ],
        mistake: "Passing multi-argument functions directly to pipe — each step receives only the previous step's output. Curry them first: pipe(add(1), multiply(2)).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "observer-pattern",
        fn: "Observer / EventEmitter",
        desc: "A pattern where an object (subject) notifies a list of dependents (observers) of state changes.",
        category: "Design & Functional Patterns",
        subtitle: "Subscribe/publish event broadcasting",
        signature: "emitter.on(event, handler)  |  emitter.emit(event, data)",
        descLong: "The Observer pattern (also called pub/sub or EventEmitter) decouples components that need to react to events from the component that produces them. Used everywhere in Node.js (EventEmitter), React (custom hooks), and browser events. Unsubscribing is critical to avoid memory leaks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Observer / EventEmitter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - a minimal EventEmitter: register handlers, fire events, and\n//             return an unsubscribe function from on().\n// STRENGTHS - captures the whole pattern (on/off/emit) in one small class;\n//             the returned unsubscribe makes cleanup obvious from day one.\n// WEAKNESSES- no once(), no error isolation between handlers, no wildcards.\n//\n// GOAL: broadcast events to any number of subscribers\nclass EventEmitter {\n  #handlers = new Map();\n  on(event, handler) {\n    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());\n    this.#handlers.get(event).add(handler);\n    return () => this.off(event, handler); // unsubscribe\n  }\n  off(event, handler) { this.#handlers.get(event)?.delete(handler); }\n  emit(event, ...args) { this.#handlers.get(event)?.forEach(h => h(...args)); }\n}\nconst bus = new EventEmitter();\nconst stop = bus.on('login', user => console.log(user.name));\nbus.emit('login', { name: 'Alice' }); // 'Alice'\nstop(); // unsubscribed"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Observer / EventEmitter — common patterns you'll see in production.\n// APPROACH  - Combine Observer / EventEmitter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - add once() for one-shot listeners and show the real reason\n//             unsubscribe matters: component lifecycle cleanup.\n// STRENGTHS - the 80% case for app code — auto-removing listeners and a\n//             tracked list of unsubscribes that a component tears down.\n// WEAKNESSES- one throwing handler still aborts the rest of emit(); no async\n//             handler support; no max-listener warning.\n//\n// GOAL: support one-shot listeners and lifecycle cleanup\nclass EventEmitter {\n  #handlers = new Map();\n  on(event, handler, { once = false } = {}) {\n    const wrapped = once\n      ? (...args) => { handler(...args); this.off(event, wrapped); }\n      : handler;\n    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());\n    this.#handlers.get(event).add(wrapped);\n    return () => this.off(event, wrapped);\n  }\n  once(event, handler) { return this.on(event, handler, { once: true }); }\n  off(event, handler) { this.#handlers.get(event)?.delete(handler); }\n  emit(event, ...args) { this.#handlers.get(event)?.forEach(h => h(...args)); }\n}\n// WHY: collect unsubscribes so destroy() can release them all at once\nclass UserWidget {\n  #unsub = [];\n  mount(bus) {\n    this.#unsub.push(bus.on('login', u => this.render(u)));\n    this.#unsub.push(bus.once('ready', () => this.init()));\n  }\n  destroy() { this.#unsub.forEach(off => off()); this.#unsub = []; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Observer / EventEmitter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production emitter: isolate handler errors so one bad listener\n//             can't break the rest, and prefer the native EventTarget when\n//             the DOM/standard API is a better fit.\n// STRENGTHS - resilient emit (try/catch per handler), leak-safe cleanup,\n//             clear guidance on when to reach for the platform instead.\n// WEAKNESSES- synchronous fan-out only; for cross-process/pub-sub at scale\n//             you want a real message broker, not an in-memory emitter.\n//\n// GOAL: emit safely and know when to use the platform\n// WHY: a throwing subscriber must not stop other subscribers\nclass SafeEmitter {\n  #handlers = new Map();\n  on(event, handler) {\n    (this.#handlers.get(event) ?? this.#handlers.set(event, new Set()).get(event)).add(handler);\n    return () => this.#handlers.get(event)?.delete(handler);\n  }\n  emit(event, ...args) {\n    for (const h of this.#handlers.get(event) ?? []) {\n      try { h(...args); }\n      catch (err) { console.error(`handler for \"${event}\" threw:`, err); }\n    }\n  }\n}\n// WHY: the browser already ships a battle-tested emitter — EventTarget\nclass Store extends EventTarget {\n  #state = {};\n  set(key, value) {\n    this.#state[key] = value;\n    this.dispatchEvent(new CustomEvent('change', { detail: { key, value } }));\n  }\n}\n// const off = (s => { const cb = e => {}; s.addEventListener('change', cb);\n//                     return () => s.removeEventListener('change', cb); });\n// Decision rule:\n//   decoupled in-app event bus                  -> custom EventEmitter\n//   DOM / standard events                        -> EventTarget + CustomEvent\n//   framework component comms                    -> built-in state/props/context\n//   one-shot notification                        -> once()\n//   cross-process / durable delivery             -> real broker (Redis, MQ), not this\n//\n// Anti-pattern: subscribing without ever unsubscribing. Each live handler\n//   pins the emitter AND the handler's closure in memory, so long-lived\n//   emitters accumulate dead listeners — a classic leak. Always store and\n//   call the unsubscribe function on teardown."
                  }
        ],
        tips: [
                  "Return an unsubscribe function from .on() for easy cleanup.",
                  "Use a Set for handlers (not Array) to prevent duplicate registrations.",
                  "Always unsubscribe in React effects, Vue lifecycle hooks, and component cleanup.",
                  "EventTarget (built into browsers) offers native addEventListener/removeEventListener — consider extending it."
        ],
        mistake: "Never cleaning up subscriptions — each subscription holds a reference to the handler and the event emitter, preventing garbage collection and causing memory leaks.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "singleton",
        fn: "Singleton",
        desc: "Ensures a class has only one instance and provides global access to it.",
        category: "Design & Functional Patterns",
        subtitle: "One instance shared across the app",
        signature: "// ES module as singleton  |  class with static instance",
        descLong: "In JavaScript, an ES module is a natural singleton — it's evaluated once and its exports are cached. For class-based singletons, use a static property. Singletons are useful for shared state (config, cache, connection pool) but can make testing harder.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Singleton — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest singleton: module-level state behind a getter\n//             that lazily creates the instance on first use.\n// STRENGTHS - zero ceremony; the module cache guarantees one instance;\n//             lazy so the connection isn't opened until needed.\n// WEAKNESSES- global mutable state; hard to reset between tests; hides the\n//             dependency from callers.\n//\n// GOAL: share one lazily-created instance across the app\nlet connection = null;\nexport function getConnection() {\n  if (!connection) connection = createDbConnection();\n  return connection; // same instance every call\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Singleton — common patterns you'll see in production.\n// APPROACH  - Combine Singleton with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - the class-based form with a private static instance and a\n//             getInstance() accessor using logical-nullish assignment.\n// STRENGTHS - the 80% textbook form; encapsulates construction; ??= makes\n//             \"create once, reuse after\" a single line.\n// WEAKNESSES- still global state; the static instance persists across tests\n//             in the same module realm, so tests can bleed into each other.\n//\n// GOAL: guarantee a single configured instance via a class\nclass Config {\n  static #instance = null;\n  #settings;\n  constructor() { this.#settings = { theme: 'dark', lang: 'en' }; }\n  static getInstance() {\n    return (Config.#instance ??= new Config());\n  }\n  get(key) { return this.#settings[key]; }\n}\nconst a = Config.getInstance();\nconst b = Config.getInstance();\na === b; // true — same instance"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Singleton — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - make the singleton testable: expose a factory + a reset hook,\n//             or better, inject the dependency instead of reaching for global\n//             state. Shows both the pragmatic and the principled option.\n// STRENGTHS - keeps the one-instance guarantee where it helps (pools, config)\n//             while staying unit-testable; documents the DI escape hatch.\n// WEAKNESSES- DI adds wiring boilerplate; a reset() hook is a code smell if\n//             overused — it exists mainly to make tests deterministic.\n//\n// GOAL: keep single-instance benefits without wrecking testability\n// WHY: a factory closure gives one instance PLUS a reset for tests\nfunction createConnectionPool(config) {\n  let pool = null;\n  return {\n    get: () => (pool ??= openPool(config)),\n    reset: () => { pool?.drain(); pool = null; }, // test teardown\n  };\n}\nexport const db = createConnectionPool({ max: 10 });\n// db.get() -> same pool;  in tests: afterEach(() => db.reset())\n// WHY: dependency injection avoids the global entirely — pass what you need\nclass OrderService {\n  constructor(connection) { this.connection = connection; } // injected\n  save(order) { return this.connection.query('INSERT ...', order); }\n}\n// prod:  new OrderService(db.get())\n// test:  new OrderService(fakeConnection)  // no global to mock\n// Decision rule:\n//   shared resource, one per process (pool, cache)   -> module/factory singleton\n//   config read everywhere                            -> module-level singleton\n//   service you unit-test in isolation                -> dependency injection\n//   genuinely need multiple instances                 -> plain class / factory\n//\n// Anti-pattern: reaching for a singleton to avoid passing a reference around.\n//   It couples every consumer to global state, makes call sites lie about\n//   their dependencies, and turns parallel tests flaky because they all share\n//   the same mutable instance. Inject dependencies unless the resource is\n//   genuinely process-wide."
                  }
        ],
        tips: [
                  "ES modules are naturally singletons — a simple module with state is often better than a class.",
                  "Singletons are hard to test because they share state between tests — reset or mock them.",
                  "Prefer dependency injection over singletons for testability in large codebases.",
                  "The module-level variable pattern is less boilerplate than a full class singleton."
        ],
        mistake: "Using a global singleton for everything — singletons introduce hidden coupling and make unit testing difficult because state persists across tests.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Utility Patterns ─────────────────────────────────────────
  {
    id: "utility-patterns",
    title: "Utility Patterns",
    entries: [
      {
        id: "deep-clone",
        fn: "structuredClone()",
        desc: "Creates a deep clone of an object using the structured clone algorithm. Built into modern JS.",
        category: "Utility Patterns",
        subtitle: "Native deep clone without libraries",
        signature: "structuredClone(value)",
        descLong: "structuredClone() is the modern, native way to deep clone objects. It handles circular references, Date, Map, Set, ArrayBuffer, and nested objects. It does NOT clone functions, DOM nodes, or class instances with prototype methods. Available in Node 17+, all modern browsers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of structuredClone() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - one call to the native structuredClone(), then prove the copy\n//             is independent by mutating a nested field.\n// STRENGTHS - no library, one line, true deep copy; the mutation test makes\n//             \"deep vs shallow\" concrete.\n// WEAKNESSES- says nothing yet about what structuredClone can't handle.\n//\n// GOAL: deep-copy a nested object so edits don't leak back\nconst original = { name: 'Alice', address: { city: 'Portland' } };\nconst clone = structuredClone(original);\nclone.address.city = 'Seattle';\noriginal.address.city; // 'Portland' — original untouched"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of structuredClone() — common patterns you'll see in production.\n// APPROACH  - Combine structuredClone() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - clone the data types the JSON hack silently breaks (Date, Map,\n//             Set, RegExp) and a circular reference, then show what's dropped.\n// STRENGTHS - the 80% case: real app state has Dates and Maps; demonstrates\n//             both what survives and what throws/strips.\n// WEAKNESSES- class instances lose their prototype (become plain objects);\n//             no fallback strategy for unsupported values.\n//\n// GOAL: clone rich, real-world data structures\n// WHY: structuredClone preserves Date, Map, Set, ArrayBuffer, RegExp, and cycles\nconst data = {\n  date: new Date('2024-01-01'),\n  tags: new Set(['a', 'b']),\n  index: new Map([['a', 1]]),\n  pattern: /\\d+/g,\n  self: null,\n};\ndata.self = data;               // circular reference\nconst clone = structuredClone(data);\nclone.index.get('a');           // 1 — Map preserved\nclone.self === clone;           // true — cycle rewired to the clone\n// WHY: functions and DOM nodes are NOT cloneable\ntry {\n  structuredClone({ fn: () => 42 });\n} catch (err) {\n  err.name; // 'DataCloneError'\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of structuredClone() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - handle the case structuredClone can't: class instances that\n//             must keep their prototype/methods. Show a constructor-aware\n//             clone and where each strategy belongs.\n// STRENGTHS - production-correct: preserves behavior (methods) not just data;\n//             picks the cheapest tool per data shape.\n// WEAKNESSES- custom clone must be maintained per class; deep custom cloning\n//             of large graphs is slower than a native structured clone.\n//\n// GOAL: clone data AND behavior correctly\n// WHY: structuredClone copies fields but drops the prototype — methods vanish\nclass Money {\n  constructor(cents) { this.cents = cents; }\n  format() { return `$${(this.cents / 100).toFixed(2)}`; }\n}\nconst price = new Money(1999);\nconst bad = structuredClone(price);\n// bad.format();            // TypeError — prototype lost\n// WHY: reconstruct through the constructor to keep methods\nconst clonePrice = new Money(price.cents);\nclonePrice.format(); // '$19.99'\n// WHY: for arbitrary class graphs, define an explicit clone contract\nclass Cart {\n  constructor(items = []) { this.items = items; }\n  clone() { return new Cart(structuredClone(this.items)); } // data deep, class rebuilt\n}\n// Decision rule:\n//   plain data (Date/Map/Set/ArrayBuffer/cycles)  -> structuredClone\n//   hot path, plain JSON, no special types         -> JSON.parse(JSON.stringify())\n//   class instance with methods                    -> constructor / explicit clone()\n//   functions, DOM nodes, sockets                   -> not cloneable — rethink the design\n//\n// Anti-pattern: JSON.parse(JSON.stringify(obj)) as a general deep clone. It\n//   turns Date into a string, drops undefined and functions, throws on cycles,\n//   and mangles Map/Set into {}. Use it only for known-plain JSON data."
                  }
        ],
        tips: [
                  "structuredClone() is the preferred deep clone — no library needed in modern environments.",
                  "It handles Date, Map, Set, RegExp, ArrayBuffer correctly — JSON.parse(JSON.stringify()) doesn't.",
                  "Functions, DOM nodes, and class method prototypes are NOT cloned.",
                  "JSON.parse(JSON.stringify(obj)) is still a quick hack for plain JSON-serializable objects."
        ],
        mistake: "Using JSON.parse(JSON.stringify(obj)) for deep cloning — it silently drops functions, turns Dates into strings, and throws on undefined or circular references.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "regex",
        fn: "RegExp",
        desc: "Regular expressions for pattern matching and text transformation.",
        category: "Utility Patterns",
        subtitle: "Pattern matching and text processing",
        signature: "/pattern/flags  |  new RegExp(pattern, flags)",
        descLong: "Regular expressions in JS are objects. Key methods: test() (boolean match), match()/matchAll() (extract), replace()/replaceAll() (transform), split() (split). Flags: g (global), i (case-insensitive), m (multiline), s (dot matches newline), d (indices).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RegExp — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - a literal regex plus the two most common methods: test() for a\n//             boolean and match() to pull a substring out.\n// STRENGTHS - shows the shape of a pattern and the two verbs you reach for\n//             first; no flags or groups to distract.\n// WEAKNESSES- no extraction of named parts, no global matching, no dynamic\n//             patterns yet.\n//\n// GOAL: check whether text matches and pull a value out\nconst email = /^[\\w.+-]+@[\\w.-]+\\.[\\w.]+$/;\nemail.test('user@example.com');       // true\n'Call 555-1234'.match(/\\d{3}-\\d{4}/); // ['555-1234']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RegExp — common patterns you'll see in production.\n// APPROACH  - Combine RegExp with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - the everyday toolkit: named capture groups, replace() with a\n//             function, and matchAll() to iterate every match.\n// STRENGTHS - the 80% case for parsing and transforming text; named groups\n//             make the pattern self-documenting.\n// WEAKNESSES- patterns are still static; no escaping of user input; no\n//             discussion of catastrophic backtracking.\n//\n// GOAL: extract structured data and transform text\n// WHY: named groups read far better than numeric indices\nconst { groups } = '2024-03-15'.match(\n  /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/,\n);\ngroups.year; // '2024'\n// WHY: replace() takes a function — compute each replacement\n'hello world'.replace(/\\b\\w/g, c => c.toUpperCase()); // 'Hello World'\n// WHY: matchAll + spread collects every global match with its groups\nconst phones = [...'555-1234 or 555-5678'.matchAll(/\\d{3}-\\d{4}/g)]\n  .map(m => m[0]); // ['555-1234', '555-5678']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RegExp — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - build patterns from dynamic/user input safely, and avoid the\n//             two production footguns: unescaped input and ReDoS backtracking.\n// STRENGTHS - ships securely: escapes interpolated text, hoists compiled\n//             regexes, and flags stateful-lastIndex gotchas with the g flag.\n// WEAKNESSES- hand-rolled escaping covers the standard metacharacters but not\n//             every exotic Unicode case; complex grammars still want a parser.\n//\n// GOAL: construct regexes from runtime values without bugs or exploits\n// WHY: interpolating raw user input lets them inject metacharacters\nconst escapeRegExp = s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\nfunction makeSearch(term) {\n  return new RegExp(escapeRegExp(term), 'gi'); // safe, case-insensitive\n}\nmakeSearch('a.b(c)').test('a.b(c)'); // true — dots/parens matched literally\n// WHY: a /g regex is STATEFUL — lastIndex persists across .test()/.exec()\nconst re = /foo/g;\nre.test('foo'); // true\nre.test('foo'); // false! lastIndex moved past the match\n// Fix: don't reuse a /g regex for repeated test() — drop g or reset lastIndex.\n// WHY: hoist compiled patterns out of hot loops — construction isn't free\nconst TOKEN = /\\w+/g; // compile once, reuse\n// Decision rule:\n//   static pattern                         -> /literal/flags\n//   pattern built from runtime values       -> new RegExp(escapeRegExp(x), flags)\n//   extract every match (+ groups)          -> matchAll / /g\n//   boolean membership test                 -> test() (avoid /g statefulness)\n//   nested/recursive grammar                -> a real parser, not regex\n//\n// Anti-pattern: new RegExp(userInput) with no escaping. A user string like\n//   '(' throws, and '(a+)+$' against a long input triggers catastrophic\n//   backtracking (ReDoS) that hangs the thread. Always escape, and bound\n//   untrusted patterns."
                  }
        ],
        tips: [
                  "Use named capture groups (?<name>...) for self-documenting patterns.",
                  "matchAll() returns an iterator of all matches with capture groups — use [...str.matchAll(re)].",
                  "Test regexes interactively at regex101.com before using in code.",
                  "Create regexes outside loops — RegExp construction is not free when using new RegExp()."
        ],
        mistake: "Forgetting the g (global) flag when expecting multiple matches — without g, .match() returns only the first match.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "factory-function",
        fn: "Factory Functions",
        desc: "Functions that return objects — a closure-based alternative to classes with true private state.",
        category: "Design & Functional Patterns",
        subtitle: "Objects via functions, not constructors",
        signature: "function createThing(params) { return { methods } }",
        descLong: "Factory functions create and return plain objects. Closure variables are truly private — no WeakMap needed. No new, no this, no prototype chain complications. Disadvantage: each instance gets its own copy of every method rather than sharing them via prototype.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Factory Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - a function that closes over a local variable and returns an\n//             object of methods that read/write it.\n// STRENGTHS - true privacy with no #fields, no new, no this; the returned\n//             object is the whole public API.\n// WEAKNESSES- each call allocates fresh copies of every method; no shared\n//             prototype.\n//\n// GOAL: build an object with genuinely private state\nfunction createCounter() {\n  let count = 0; // private — only the closure can touch it\n  return {\n    increment() { return ++count; },\n    decrement() { return --count; },\n    get() { return count; },\n  };\n}\nconst c = createCounter();\nc.increment(); // 1\nc.count;       // undefined — inaccessible from outside"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Factory Functions — common patterns you'll see in production.\n// APPROACH  - Combine Factory Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - a realistic factory: an HTTP client that captures config in the\n//             closure and exposes a small verb-based API.\n// STRENGTHS - the 80% case — configuration lives privately, methods share it,\n//             and callers get a clean get/post surface.\n// WEAKNESSES- one closure per client (fine for a handful); no retry/interceptor\n//             layering; still recreates methods per instance.\n//\n// GOAL: encapsulate configuration behind a small API\nfunction createHttpClient(baseURL, { timeout = 5000, token } = {}) {\n  const headers = {\n    'Content-Type': 'application/json',\n    ...(token && { Authorization: `Bearer ${token}` }),\n  };\n  async function request(method, path, data) {\n    const controller = new AbortController();\n    const timer = setTimeout(() => controller.abort(), timeout);\n    try {\n      const res = await fetch(baseURL + path, {\n        method, headers,\n        body: data ? JSON.stringify(data) : undefined,\n        signal: controller.signal,\n      });\n      if (!res.ok) throw new Error(res.statusText);\n      return res.json();\n    } finally { clearTimeout(timer); }\n  }\n  return {\n    get: path => request('GET', path),\n    post: (path, data) => request('POST', path, data),\n  };\n}\nconst api = createHttpClient('/v2', { token: 'abc' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Factory Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - use factories for their real superpower — composition via\n//             mixins — and show the memory tradeoff vs class prototypes so\n//             the choice is informed, not stylistic.\n// STRENGTHS - flexible object assembly without inheritance chains; behaviors\n//             compose cleanly; documents when a class is the better call.\n// WEAKNESSES- per-instance method copies cost memory at high instance counts;\n//             no instanceof; harder to leverage engine prototype optimizations.\n//\n// GOAL: compose behavior and know the class tradeoff\n// WHY: mixins let you assemble objects from independent capability slices\nconst canFly = state => ({ fly: () => `${state.name} takes off` });\nconst canSwim = state => ({ swim: () => `${state.name} dives` });\nfunction createDuck(name) {\n  const state = { name };\n  return { ...state, ...canFly(state), ...canSwim(state) }; // compose, don't inherit\n}\ncreateDuck('Donald').fly(); // 'Donald takes off'\n// WHY: at scale, prototype sharing (class) uses one method copy for all\n//      instances; a factory allocates methods per object.\nclass Particle {                 // 100k of these -> methods shared via prototype\n  constructor(x, y) { this.x = x; this.y = y; }\n  move(dx, dy) { this.x += dx; this.y += dy; }\n}\n// Decision rule:\n//   true private state + small instance count   -> factory (closure privacy)\n//   many instances + shared methods (hot path)  -> class / prototype\n//   assemble behavior from parts                 -> factory + mixins\n//   need instanceof / extends / super           -> class\n//\n// Anti-pattern: using a factory to spin up hundreds of thousands of objects\n//   with heavy methods. Every instance duplicates the closures, blowing up\n//   memory and defeating the engine's shape/inline-cache optimizations. Use a\n//   class so the methods live once on the prototype."
                  }
        ],
        tips: [
                  "Factory functions provide true privacy via closure — no need for # private fields.",
                  "Each instance gets its own method copies — higher memory use than class prototype sharing.",
                  "Compose factories with mixins (spread) instead of inheritance for flexible composition.",
                  "No new required — great for immutable functional patterns."
        ],
        mistake: "Choosing between class and factory purely on syntax preference — use factory when you need true closure privacy, class when you need prototype sharing or inheritance.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "module-pattern",
        fn: "Module Pattern / IIFE",
        desc: "Use an IIFE to create a private scope and expose only a public API.",
        category: "Design & Functional Patterns",
        subtitle: "Encapsulation via immediately invoked functions",
        signature: "const module = (function() { return publicAPI; })()",
        descLong: "The Module pattern uses an IIFE (Immediately Invoked Function Expression) to create a private scope. Only what's returned is public. Pre-dates ES modules but still useful for bundled scripts and immediately-initialized singletons. The revealing module variant returns an object of references to private functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Module Pattern / IIFE — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - wrap state in an IIFE and return only the methods that form the\n//             public API; the inner variable stays private.\n// STRENGTHS - shows the core idea (private scope + returned API) with no\n//             build step; runs in any script tag.\n// WEAKNESSES- pre-modules technique; not tree-shakeable or statically\n//             analyzable; one-off, not reusable across files.\n//\n// GOAL: create a private scope and expose a public API\nconst counter = (function () {\n  let n = 0; // private to the IIFE\n  return {\n    inc() { return ++n; },\n    dec() { return --n; },\n    get() { return n; },\n  };\n})();\ncounter.inc(); // 1\ncounter.n;     // undefined — private"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Module Pattern / IIFE — common patterns you'll see in production.\n// APPROACH  - Combine Module Pattern / IIFE with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - a realistic module: a cart with a private array and a curated\n//             surface, including a getter for a derived value.\n// STRENGTHS - the 80% legacy pattern — encapsulated state, named public\n//             methods, and no leakage of internal data structures.\n// WEAKNESSES- singleton by construction (one cart); testing it means resetting\n//             shared state; superseded by ES modules for new code.\n//\n// GOAL: encapsulate mutable state behind a clean interface\nconst cart = (function () {\n  const items = []; // private\n  function add(item) { items.push(item); }\n  function remove(id) {\n    const i = items.findIndex(x => x.id === id);\n    if (i !== -1) items.splice(i, 1);\n  }\n  function total() { return items.reduce((sum, x) => sum + x.price, 0); }\n  return { add, remove, total, get count() { return items.length; } };\n})();\ncart.add({ id: 1, price: 9.99 });\ncart.total(); // 9.99\ncart.items;   // undefined — internal array is hidden"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Module Pattern / IIFE — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - contrast the IIFE module with its modern replacement (ES\n//             modules) and show the one place IIFEs still earn their keep:\n//             isolating third-party/global-polluting scripts.\n// STRENGTHS - makes the migration explicit; keeps the IIFE for genuine scope\n//             isolation while pushing reusable code to import/export.\n// WEAKNESSES- IIFE modules can't be tree-shaken or type-checked across files;\n//             overusing them in a bundled app fragments the module graph.\n//\n// GOAL: choose IIFE vs ES module deliberately\n// WHY: ES modules give static analysis, tree-shaking, and per-file privacy\n// counter.js\nlet n = 0;                                   // private to the module file\nexport const inc = () => ++n;\nexport const get = () => n;\n// consumer: import { inc, get } from './counter.js';\n// WHY: an IIFE still shines for isolating a script that pollutes globals\n(function () {\n  'use strict';\n  const original = window.onerror;           // capture without leaking vars\n  window.onerror = (...args) => { report(...args); return original?.(...args); };\n})();\n// Decision rule:\n//   new app with a bundler                 -> ES modules (import/export)\n//   reusable library code                   -> ES modules\n//   isolate a legacy/global-polluting script -> IIFE wrapper\n//   one-shot init that must run immediately  -> IIFE\n//\n// Anti-pattern: hand-rolling the IIFE module pattern inside a modern\n//   ES-module codebase. You lose tree-shaking and static analysis, and you\n//   reinvent per-file privacy that modules already give you for free. Reach\n//   for IIFEs only to isolate code you don't control."
                  }
        ],
        tips: [
                  "ES modules are the modern replacement — prefer them for new code.",
                  "IIFE pattern is still useful for isolated polyfills and immediately-run setup code.",
                  "The revealing module variant names the returned properties explicitly for clarity.",
                  "Wrap third-party scripts that pollute globals in an IIFE to isolate their scope."
        ],
        mistake: "Using the module pattern when ES modules are available — import/export is cleaner, statically analyzable, and tree-shakeable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "lazy-evaluation",
        fn: "Lazy Evaluation",
        desc: "Defer expensive computation until the result is actually needed.",
        category: "Utility Patterns",
        subtitle: "Compute on demand, cache the result",
        signature: "let _cache; function get() { return _cache ??= expensive(); }",
        descLong: "Lazy evaluation defers expensive operations (parsing, network, computation) until first use. The result is then cached so subsequent calls are instant. Implement with a closure, nullish assignment, or a getter with a backing field.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lazy Evaluation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - one backing variable plus ??= so the expensive call runs on the\n//             first access and is reused after.\n// STRENGTHS - the whole idea in three lines; ??= reads as \"compute once\".\n// WEAKNESSES- module-level mutable cache; no reset; assumes the value never\n//             legitimately becomes null/undefined.\n//\n// GOAL: compute an expensive value only on first use\nlet cached;\nfunction getConfig() {\n  return (cached ??= parseConfig()); // parseConfig() runs once\n}\ngetConfig(); // parses\ngetConfig(); // returns cached result"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lazy Evaluation — common patterns you'll see in production.\n// APPROACH  - Combine Lazy Evaluation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - a reusable lazy() wrapper plus the self-replacing getter trick\n//             for lazily-computed object properties.\n// STRENGTHS - the 80% case: wrap any thunk once, and the getter permanently\n//             swaps itself for the computed value (zero overhead after).\n// WEAKNESSES- caches forever; if inputs change the value goes stale; the ??=\n//             form recomputes when the result is genuinely null/undefined.\n//\n// GOAL: make lazy initialization reusable\n// WHY: capture the thunk in a closure so callers just invoke it\nfunction lazy(fn) {\n  let value, computed = false;\n  return () => {\n    if (!computed) { value = fn(); computed = true; } // handles null results\n    return value;\n  };\n}\nconst config = lazy(() => parseHugeConfig(rawData));\nconfig(); // computes\nconfig(); // cached\n// WHY: a getter can overwrite itself with a plain value after first read\nclass Report {\n  constructor(data) { this.data = data; }\n  get summary() {\n    const value = computeSummary(this.data);\n    Object.defineProperty(this, 'summary', { value }); // future reads skip the getter\n    return value;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lazy Evaluation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production lazy value with invalidation, plus a Proxy-based lazy\n//             module loader so an optional heavy dependency loads on demand.\n// STRENGTHS - handles the real hazard (stale cache) with explicit\n//             invalidation, and defers expensive imports until first touch.\n// WEAKNESSES- invalidation is manual — you must know the dependencies; a Proxy\n//             adds a small per-access cost and can surprise debuggers.\n//\n// GOAL: cache lazily but stay correct when inputs change\n// WHY: pair the cache with a version key so it recomputes on change\nfunction memoizedBy(getKey, compute) {\n  let key, value;\n  return input => {\n    const k = getKey(input);\n    if (k !== key) { key = k; value = compute(input); } // recompute on key change\n    return value;\n  };\n}\nconst layout = memoizedBy(el => el.clientWidth, el => measure(el)); // re-measures on resize\n// WHY: defer a heavy module until a method is actually called\nconst heavy = new Proxy({}, {\n  get(_t, prop) {\n    return async (...args) => {\n      const mod = await import('./heavy-analytics.js'); // loaded once, on first use\n      return mod[prop](...args);\n    };\n  },\n});\n// heavy.track('click') -> triggers the dynamic import lazily\n// Decision rule:\n//   expensive, maybe-unused startup work    -> lazy init (??= / lazy())\n//   value derived from mutable input         -> memoize with an invalidation key\n//   optional heavy dependency                -> dynamic import() on first use\n//   computed-once object property            -> self-replacing getter\n//\n// Anti-pattern: doing expensive work at module load (top-level parse, connect,\n//   or compute) for a feature that may never run. It slows every startup and\n//   cold start for zero benefit. Defer it behind a lazy accessor."
                  }
        ],
        tips: [
                  "Object.defineProperty in a getter replaces itself with a value — subsequent accesses bypass the getter entirely.",
                  "Use ??= for simple single-value lazy init: cache ??= expensiveCall().",
                  "Lazy initialization is critical for modules with slow startup — only pay the cost if the feature is used.",
                  "Be careful with lazy values that depend on mutable state — stale cache can cause bugs."
        ],
        mistake: "Computing expensive values at module load time when they might never be needed — always initialize lazily for anything non-trivial.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "strategy-pattern",
        fn: "Strategy Pattern",
        desc: "Define a family of algorithms and make them interchangeable at runtime.",
        category: "Utility Patterns",
        subtitle: "Swap algorithms at runtime",
        signature: "function process(data, strategy) { return strategy(data) }",
        descLong: "The Strategy pattern encapsulates interchangeable algorithms behind a common interface — usually a function signature in JS. The context calls the strategy without knowing its implementation. JS first-class functions make this lightweight: just pass the function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Strategy Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - an object of functions keyed by name, selected at call time.\n// STRENGTHS - the whole pattern in JS: first-class functions in a lookup\n//             table replace a class hierarchy entirely.\n// WEAKNESSES- no default/unknown-key handling; strategies take fixed args.\n//\n// GOAL: pick an interchangeable algorithm by name\nconst strategies = {\n  add: (a, b) => a + b,\n  sub: (a, b) => a - b,\n};\nconst compute = (a, b, name) => strategies[name](a, b);\ncompute(2, 3, 'add'); // 5\ncompute(9, 4, 'sub'); // 5"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Strategy Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Strategy Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - two real uses: swappable payment backends selected from user\n//             data, and composable validation rules combined with every().\n// STRENGTHS - the 80% case — runtime selection from config, and rule\n//             composition without branching if/else ladders.\n// WEAKNESSES- no guard for an unknown strategy key; validators return only a\n//             boolean (no message about which rule failed).\n//\n// GOAL: select behavior from data and compose rules\n// WHY: the payment method is data, so the strategy is a lookup, not a switch\nconst paymentStrategies = {\n  creditCard: (amount, card) =>\n    fetch('/api/pay/card', { method: 'POST', body: JSON.stringify({ amount, card }) }).then(r => r.json()),\n  paypal: (amount, email) =>\n    fetch('/api/pay/paypal', { method: 'POST', body: JSON.stringify({ amount, email }) }).then(r => r.json()),\n};\nconst method = user.preferredPayment ?? 'creditCard';\nawait paymentStrategies[method](99.99, credentials);\n// WHY: each validator is a pure predicate — compose them with every()\nconst rules = {\n  minLen8: v => v.length >= 8,\n  noSpaces: v => !v.includes(' '),\n  strong: v => /[A-Z]/.test(v) && /[0-9]/.test(v),\n};\nconst isValid = Object.values(rules).every(rule => rule(password));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Strategy Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production concerns: guard unknown strategies with a default,\n//             build stateful strategies via factories, and separate the\n//             decision (which rule failed) from the effect.\n// STRENGTHS - safe against bad keys, supports configurable/stateful\n//             strategies, and returns actionable results, not just booleans.\n// WEAKNESSES- a registry adds indirection; over-abstracting a two-branch\n//             decision into strategies is more code than an if.\n//\n// GOAL: make strategy selection safe and informative\n// WHY: never call an undefined strategy — fall back explicitly\nfunction resolve(registry, key, fallback = 'default') {\n  return registry[key] ?? registry[fallback];\n}\n// WHY: a factory returns a configured (stateful) strategy\nconst makeRetry = (attempts) => async (task) => {\n  for (let i = 0; i < attempts; i++) {\n    try { return await task(); } catch (e) { if (i === attempts - 1) throw e; }\n  }\n};\nconst retry3 = makeRetry(3); // reusable, configured strategy\n// WHY: return WHICH rules failed, not just pass/fail — the caller decides UX\nconst rules = {\n  minLen8: v => v.length >= 8,\n  strong:  v => /[A-Z]/.test(v) && /\\d/.test(v),\n};\nfunction validate(value) {\n  const failed = Object.entries(rules)\n    .filter(([, rule]) => !rule(value))\n    .map(([name]) => name);\n  return { valid: failed.length === 0, failed }; // decision, no side effects\n}\n// Decision rule:\n//   interchangeable algorithm chosen at runtime  -> object/Map of functions\n//   unknown/user-supplied key                     -> resolve with a default\n//   configurable or stateful behavior             -> factory returning a strategy\n//   compose many rules                            -> array.every / .some / reduce\n//   need which rule failed                         -> return data, don't just branch\n//\n// Anti-pattern: modeling simple strategies as a class hierarchy with an\n//   abstract base and one subclass per algorithm. In JS a plain object of\n//   functions does the same job with a fraction of the code and no 'this'\n//   or inheritance ceremony."
                  }
        ],
        tips: [
                  "In JS, the Strategy pattern is often just passing a function — no class hierarchy needed.",
                  "Store strategies in an object/Map for named, swappable, runtime-selectable algorithms.",
                  "Strategies should be pure functions — no side effects.",
                  "Compose strategies: combine multiple validators with every() or some()."
        ],
        mistake: "Building deep class hierarchies for strategies when a plain object of functions achieves the same result with far less code.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
