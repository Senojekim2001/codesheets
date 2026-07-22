export const meta = {
  "title": "Memory Management & GC",
  "domain": "javascript",
  "sheet": "memory",
  "icon": "🧠"
}

export const sections = [

  // ── Section 1: Garbage Collection Fundamentals ─────────────────────────────────────────
  {
    id: "gc-fundamentals",
    title: "Garbage Collection Fundamentals",
    entries: [
      {
        id: "mark-and-sweep",
        fn: "Mark-and-Sweep GC",
        desc: "V8 uses generational mark-and-sweep — mark reachable objects, sweep the rest.",
        category: "GC Fundamentals",
        subtitle: "Reachability determines liveness — no manual free() needed",
        signature: "root -> obj -> child // all reachable; orphan // unreachable -> GC'd",
        descLong: "V8 uses a generational garbage collector. The heap is split into young generation (nursery, ~1-8MB) and old generation. New objects start in the nursery. Minor GCs scavenge the nursery frequently (~1-10ms). Objects that survive two minor GCs are promoted to the old generation. Major GCs mark-and-sweep the old generation (can cause pauses of 10-100ms+). An object is collected when no references to it remain reachable from roots (global, stack, registers).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mark-and-Sweep GC — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Show reachability: if nothing points to it, GC collects it\n// STRENGTHS - Simplest mental model of JS garbage collection\n// WEAKNESSES- No generational GC, no V8 specifics\n//\n// When obj goes out of scope and nothing references it, GC frees it\nfunction makeTemp() {\n  const obj = { a: 1, b: 2 };  // allocated on heap\n  return obj.a + obj.b;        // return primitive, not obj\n}\nconst result = makeTemp();  // obj is now unreachable -> eligible for GC\n// obj cannot be accessed anymore — no reference exists\n// Keeping a reference prevents GC\nlet kept = { data: 'important' };\nkept = null;  // now the object is unreachable -> eligible for GC"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mark-and-Sweep GC — common patterns you'll see in production.\n// APPROACH  - Combine Mark-and-Sweep GC with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Closures holding references, accidental retention, timers\n// STRENGTHS - Shows the most common memory leak patterns\n// WEAKNESSES- No V8 heap specifics, no WeakRef\n//\n// 1) CLOSURE holding a reference — prevents GC of large objects\nfunction createHandler() {\n  const hugeData = new Array(1e6).fill(0);  // ~8MB\n  return () => console.log(hugeData.length);  // closure holds hugeData\n}\nconst handler = createHandler();  // hugeData stays alive as long as handler exists\n// Fix: extract only what you need\nfunction createHandlerGood() {\n  const hugeData = new Array(1e6).fill(0);\n  const len = hugeData.length;  // capture primitive, not the array\n  return () => console.log(len);  // hugeData can be GC'd after createHandlerGood returns\n}\n// 2) TIMER leak — setInterval callback holds reference forever\nconst data = { big: new Array(1e6).fill(0) };\nconst timer = setInterval(() => console.log(data.big.length), 1000);\n// Fix: clear the interval when done\nclearInterval(timer);  // data can now be GC'd\n// 3) EVENT LISTENER leak — listener holds reference, never removed\nconst element = document.getElementById('btn');\nconst payload = { big: new Array(1e6).fill(0) };\nelement.addEventListener('click', () => console.log(payload));\n// Fix: use AbortController or removeEventListener\nconst controller = new AbortController();\nelement.addEventListener('click', () => console.log(payload), { signal: controller.signal });\ncontroller.abort();  // listener removed, payload can be GC'd"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mark-and-Sweep GC — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - V8 generational GC, heap stats, GC triggers, decision guide\n// STRENGTHS - Engine-level understanding of memory lifecycle\n// WEAKNESSES- N/A\n//\n// 1) V8 GENERATIONAL HEAP\n//    Young gen (nursery): ~1-8MB, short-lived objects, minor GC ~1-10ms\n//    Old gen: larger, long-lived objects, major GC 10-100ms+ (mark-sweep)\n//    Promotion: objects surviving 2 minor GCs move to old gen\n//    Large objects: allocated directly in large object space (LOS)\n// 2) HEAP STATS — Node.js\n// const v8 = require('v8');\n// const stats = v8.getHeapStatistics();\n// console.log(stats);\n// {\n//   total_heap_size: ~16MB,\n//   used_heap_size: ~8MB,\n//   heap_size_limit: ~2GB (default),\n//   ...\n// }\n// 3) PROCESS MEMORY — Node.js\n// console.log(process.memoryUsage());\n// {\n//   rss: 35MB,          // resident set size (total process memory)\n//   heapTotal: 16MB,    // V8 heap total (allocated)\n//   heapUsed: 8MB,      // V8 heap used (live objects)\n//   external: 2MB,      // C++ objects (Buffer, etc.)\n//   arrayBuffers: 1MB,  // ArrayBuffer and SharedArrayBuffer\n// }\n// 4) TRIGGER GC manually (debug only — --expose-gc flag)\n// node --expose-gc -e \"global.gc(); console.log('forced GC')\"\n// 5) DETECTING LEAKS — monitor heapUsed over time\nconst snapshots = [];\nsetInterval(() => {\n  const mem = process.memoryUsage();\n  snapshots.push({ time: Date.now(), heapUsed: mem.heapUsed });\n  if (snapshots.length > 100) {\n    const trend = snapshots.at(-1).heapUsed - snapshots[0].heapUsed;\n    if (trend > 1e6) console.warn('Possible memory leak: heap grew', trend, 'bytes');\n  }\n}, 5000);\n// Decision rule:\n//   object goes out of scope, no references              -> GC collects automatically\n//   closure captures large object                        -> extract primitives before returning\n//   setInterval/setTimeout with data reference           -> clear when done\n//   event listener with data reference                   -> AbortController or removeEventListener\n//   long-running process with growing heap               -> monitor heapUsed, use heap snapshots\n//   need to hold weak reference                           -> WeakRef / WeakMap / WeakSet\n//   need to know heap size                                -> process.memoryUsage() or v8.getHeapStatistics()\n//\n// Anti-pattern: storing large objects in module-level variables that are never cleared;\n//   they live forever in old gen and major GC won't collect them if reachable."
                  }
        ],
        tips: [
                  "V8 uses generational GC: minor GCs (~1-10ms) for young gen, major GCs (10-100ms+) for old gen",
                  "Objects surviving 2 minor GCs are promoted to old generation",
                  "Closures, timers, and event listeners are the most common sources of memory leaks",
                  "Monitor `process.memoryUsage().heapUsed` over time to detect leaks in long-running processes"
        ],
        mistake: "Storing large objects in module-level variables that are never cleared. They live forever in old gen and major GC won't collect them as long as they're reachable.",
        shorthand: {
          verbose: "let obj = { data: largeArray };\nobj = null;\n// Wait for GC",
          concise: "let obj = { data: largeArray };\nobj = null;\nglobal.gc?.();",
        },
      },
      {
        id: "weak-refs",
        fn: "WeakRef, WeakMap, WeakSet",
        desc: "Hold weak references that don't prevent GC of the referent.",
        category: "GC Fundamentals",
        subtitle: "WeakRef for objects, WeakMap for key-value, WeakSet for membership",
        signature: "new WeakRef(obj) | new WeakMap() | new WeakSet()",
        descLong: "Weak references allow the GC to collect objects when no strong references remain. WeakRef wraps an object — deref() returns the object or undefined if collected. WeakMap keys are weakly held — when a key object is GC'd, its entry disappears. WeakSet works similarly. None of these are iterable (by design — the GC can change contents at any time).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WeakRef, WeakMap, WeakSet — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - WeakMap lets keys be GC'd when no strong reference remains\n// STRENGTHS - Shows the basic weak reference pattern\n// WEAKNESSES- No WeakRef, no FinalizationRegistry\n//\n// WeakMap: when the key object is GC'd, the entry vanishes\nconst cache = new WeakMap();\nlet obj = { id: 1, data: 'expensive computation' };\ncache.set(obj, { result: 'cached' });\nconsole.log(cache.get(obj));  // { result: 'cached' }\nobj = null;  // now obj is unreachable -> GC collects it -> cache entry vanishes\n// cache.get(originalObj) would return undefined after GC"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WeakRef, WeakMap, WeakSet — common patterns you'll see in production.\n// APPROACH  - Combine WeakRef, WeakMap, WeakSet with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - WeakMap for metadata, WeakSet for tagging, WeakRef for caching\n// STRENGTHS - Covers the 80% of weak reference use cases\n// WEAKNESSES- No FinalizationRegistry, no cleanup\n//\n// 1) WEAKMAP for per-object metadata — no leak when object is GC'd\nconst metadata = new WeakMap();\nfunction addMeta(obj, meta) { metadata.set(obj, meta); }\nfunction getMeta(obj) { return metadata.get(obj); }\nconst domNode = { tag: 'div' };\naddMeta(domNode, { tooltip: 'Click me', validated: true });\nconsole.log(getMeta(domNode));  // { tooltip: 'Click me', validated: true }\n// When domNode is GC'd, metadata entry disappears automatically\n// 2) WEAKSET for tagging — \"has this object been processed?\"\nconst processed = new WeakSet();\nfunction process(obj) {\n  if (processed.has(obj)) return;  // skip if already done\n  processed.add(obj);\n  // ... do work ...\n}\n// 3) WEAKREF for cache — allow GC under memory pressure\nconst cache = new Map();\nfunction getCached(key, factory) {\n  const ref = cache.get(key);\n  if (ref) {\n    const obj = ref.deref();\n    if (obj) return obj;  // still alive\n  }\n  const obj = factory();\n  cache.set(key, new WeakRef(obj));\n  return obj;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WeakRef, WeakMap, WeakSet — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - FinalizationRegistry, cleanup callbacks, decision guide\n// STRENGTHS - Production patterns for weak references and cleanup\n// WEAKNESSES- N/A\n//\n// 1) FINALIZATION REGISTRY — run cleanup when object is GC'd\n//    WARNING: callback is NOT guaranteed to run, and timing is non-deterministic\nconst registry = new FinalizationRegistry((heldValue) => {\n  console.log('Object GC'd, cleaning up:', heldValue);\n  // e.g., close file handles, release native resources\n});\nlet resource = { fd: openSomeResource() };\nregistry.register(resource, 'resource-123');  // 'resource-123' is the held value\nresource = null;  // eventually GC runs -> callback fires with 'resource-123'\n// 2) WEAKREF + FINALIZATION — cache with cleanup\nconst cache = new Map();\nconst cleanup = new FinalizationRegistry(key => {\n  // Remove stale cache entry when value is GC'd\n  const ref = cache.get(key);\n  if (ref && !ref.deref()) cache.delete(key);\n});\nfunction getOrCreate(key, factory) {\n  const ref = cache.get(key);\n  if (ref) {\n    const val = ref.deref();\n    if (val) return val;\n  }\n  const val = factory();\n  cache.set(key, new WeakRef(val));\n  cleanup.register(val, key);\n  return val;\n}\n// 3) WEAKMAP vs MAP — when to use which\n//    WeakMap: keys are objects, no iteration needed, auto-cleanup on GC\n//    Map: any key type, need iteration, need .size, manual cleanup\n//    WeakMap is NOT a \"better Map\" — it's for a different use case\n// 4) EVENT TARGET + ABORTCONTROLLER — modern cleanup pattern\n//    More reliable than WeakRef for event listener cleanup\nconst controller = new AbortController();\nelement.addEventListener('click', handler, { signal: controller.signal });\n// Later: controller.abort() removes the listener — deterministic, not GC-dependent\n// Decision rule:\n//   metadata attached to objects (DOM nodes, class instances)  -> WeakMap\n//   \"has this been processed/visited?\" tagging                 -> WeakSet\n//   cache that should yield to memory pressure                  -> WeakRef + Map\n//   cleanup when object is GC'd (best-effort, non-deterministic) -> FinalizationRegistry\n//   deterministic cleanup (event listeners, timers)             -> AbortController / clearInterval\n//   need to iterate or check size                               -> Map/Set, not Weak variants\n//   key is a primitive (string, number)                         -> Map, not WeakMap\n//\n// Anti-pattern: relying on FinalizationRegistry for critical cleanup;\n//   the callback may never fire (e.g., process exits before GC). Use deterministic cleanup."
                  }
        ],
        tips: [
                  "WeakMap keys must be objects — when the key is GC'd, the entry vanishes automatically",
                  "WeakRef.deref() returns the object or undefined if it's been collected",
                  "FinalizationRegistry callbacks are best-effort and non-deterministic — don't rely on them for critical cleanup",
                  "WeakMap/WeakSet are not iterable and have no .size — by design (GC can change contents at any time)"
        ],
        mistake: "Relying on FinalizationRegistry for critical resource cleanup. The callback may never fire if the process exits before GC runs. Use deterministic cleanup (AbortController, clearInterval, finally blocks).",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst cache = new Map();\ncache.set(key, largeObject);\n// More explicit but longer",
          concise: "const cache = new WeakMap();\ncache.set(keyObj, largeObject);",
        },
      },
    ],
  },

  // ── Section 2: Memory Leaks & Detection ─────────────────────────────────────────
  {
    id: "memory-leaks",
    title: "Memory Leaks & Detection",
    entries: [
      {
        id: "common-leaks",
        fn: "Common Memory Leak Patterns",
        desc: "Closures, timers, listeners, caches, and detached DOM nodes.",
        category: "Memory Leaks",
        subtitle: "The five leak patterns every JS developer should know",
        signature: "closure | setInterval | addEventListener | Map cache | detached DOM",
        descLong: "The five most common memory leaks in JS: (1) closures capturing large objects, (2) timers never cleared, (3) event listeners never removed, (4) unbounded caches/maps, (5) detached DOM nodes still referenced by JS. Each prevents GC from collecting objects that are no longer needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Common Memory Leak Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Show the five leak patterns in their simplest form\n// STRENGTHS - Quick identification of each pattern\n// WEAKNESSES- No fixes, no detection\n//\n// 1) CLOSURE leak — captures more than needed\nfunction leakyHandler() {\n  const huge = new Array(1e6).fill(0);\n  return () => console.log('clicked');  // huge is captured but never used!\n}\n// 2) TIMER leak — never cleared\nsetInterval(() => console.log('tick'), 1000);  // runs forever\n// 3) LISTENER leak — never removed\ndocument.addEventListener('click', () => console.log('click'));\n// 4) CACHE leak — unbounded growth\nconst cache = new Map();\nfunction getResult(key) {\n  if (!cache.has(key)) cache.set(key, expensiveCompute(key));\n  return cache.get(key);\n}\n// cache grows forever — no eviction\n// 5) DETACHED DOM — removed from document but still referenced\nconst node = document.createElement('div');\ndocument.body.appendChild(node);\ndocument.body.removeChild(node);\n// if 'node' is still referenced in JS, it can't be GC'd"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Common Memory Leak Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Common Memory Leak Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Fix each leak pattern with the standard solution\n// STRENGTHS - Shows the fix for each of the five patterns\n// WEAKNESSES- No LRU cache, no heap snapshot debugging\n//\n// 1) CLOSURE fix — capture only primitives\nfunction cleanHandler() {\n  const huge = new Array(1e6).fill(0);\n  const len = huge.length;  // extract what you need\n  return () => console.log(len);  // huge can be GC'd after return\n}\n// 2) TIMER fix — store and clear\nconst timer = setInterval(() => console.log('tick'), 1000);\n// later:\nclearInterval(timer);\n// 3) LISTENER fix — AbortController (modern) or removeEventListener\nconst controller = new AbortController();\ndocument.addEventListener('click', () => console.log('click'), {\n  signal: controller.signal,\n});\n// later:\ncontroller.abort();\n// 4) CACHE fix — LRU with max size\nclass LRUCache {\n  #max; #map = new Map();\n  constructor(max = 100) { this.#max = max; }\n  get(key) {\n    if (!this.#map.has(key)) return undefined;\n    const val = this.#map.get(key);\n    this.#map.delete(key); this.#map.set(key, val);  // move to end (most recent)\n    return val;\n  }\n  set(key, val) {\n    if (this.#map.has(key)) this.#map.delete(key);\n    this.#map.set(key, val);\n    if (this.#map.size > this.#max) {\n      const oldest = this.#map.keys().next().value;\n      this.#map.delete(oldest);  // evict least recently used\n    }\n  }\n}\n// 5) DETACHED DOM fix — null the reference after removal\nlet node = document.createElement('div');\ndocument.body.appendChild(node);\ndocument.body.removeChild(node);\nnode = null;  // now GC can collect it"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Common Memory Leak Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Heap snapshots, --inspect, Chrome DevTools, decision guide\n// STRENGTHS - Production debugging techniques for memory leaks\n// WEAKNESSES- N/A\n//\n// 1) DETECT LEAKS — monitor heap growth over time\nclass HeapMonitor {\n  #snapshots = [];\n  #interval;\n  start(intervalMs = 10000) {\n    this.#interval = setInterval(() => {\n      const mem = process.memoryUsage();\n      this.#snapshots.push({ t: Date.now(), heap: mem.heapUsed, rss: mem.rss });\n      if (this.#snapshots.length > 60) this.#snapshots.shift();\n    }, intervalMs);\n  }\n  stop() { clearInterval(this.#interval); }\n  report() {\n    if (this.#snapshots.length < 2) return 'Not enough data';\n    const first = this.#snapshots[0];\n    const last = this.#snapshots.at(-1);\n    const growth = last.heap - first.heap;\n    const duration = (last.t - first.t) / 1000;\n    return {\n      durationSec: duration,\n      heapGrowthMB: (growth / 1e6).toFixed(2),\n      leakSuspected: growth > 1e6,  // > 1MB growth\n      samples: this.#snapshots.length,\n    };\n  }\n}\n// 2) HEAP SNAPSHOT — Chrome DevTools\n//    Open DevTools > Memory > Heap snapshot\n//    Take snapshot, run workload, take another\n//    Compare: sort by \"delta\" to find growing objects\n//    Look for: detached DOM nodes, closures, large arrays\n// 3) NODE.JS --inspect — connect Chrome DevTools to Node\n//    node --inspect server.js\n//    Open chrome://inspect in browser\n//    Take heap snapshots, record allocation timeline\n// 4) ALLOCATION TIMELINE — find what's allocating\n//    DevTools > Memory > Allocation timeline\n//    Record while running workload\n//    Blue bars = still alive, gray bars = GC'd\n//    Lots of blue bars growing = potential leak\n// 5) COMMON LEAK IN SPAs — detached DOM after route change\n//    After removing components, ensure all references are cleared:\n//    - Event listeners (AbortController)\n//    - Timers (clearInterval)\n//    - Closures referencing DOM nodes\n//    - IntersectionObserver/MutationObserver disconnect\n//    - WebSocket close\n// Decision rule:\n//   closure capturing large object                        -> extract primitives\n//   setInterval/setTimeout with data ref                  -> clear when done\n//   addEventListener with data ref                        -> AbortController\n//   unbounded cache                                       -> LRU with max size\n//   detached DOM node                                     -> null the reference\n//   long-running process, growing heap                    -> HeapMonitor + heap snapshots\n//   need to find what's leaking                           -> Chrome DevTools heap snapshot comparison\n//   need to find what's allocating                        -> allocation timeline\n//\n// Anti-pattern: adding event listeners in a loop without removing old ones;\n//   each iteration adds a new listener. The old ones hold references and accumulate."
                  }
        ],
        tips: [
                  "The five leak patterns: closures, timers, listeners, unbounded caches, detached DOM",
                  "Use AbortController for deterministic event listener cleanup — more reliable than WeakRef",
                  "LRU cache with max size prevents unbounded Map growth — evict oldest entries",
                  "Chrome DevTools heap snapshot comparison: sort by \"delta\" to find growing objects"
        ],
        mistake: "Adding event listeners in a loop without removing old ones. Each iteration adds a new listener that holds references and accumulates — a classic SPA memory leak.",
        shorthand: {
          verbose: "const cache = new Map();\ncache.set(id, data);\n// cache grows forever",
          concise: "const cache = new Map();\ncache.set(id, data);\nif (cache.size > 1000) cache.delete(cache.keys().next().value);",
        },
      },
      {
        id: "buffer-memory",
        fn: "Buffer & Typed Array Memory",
        desc: "Buffers and typed arrays use external memory outside the V8 heap.",
        category: "Memory Leaks",
        subtitle: "External memory — not tracked by heapUsed, shown in external/arrayBuffers",
        signature: "Buffer.alloc(n) | new Float64Array(n) | new ArrayBuffer(n)",
        descLong: "Buffer (Node.js) and TypedArray/ArrayBuffer (browser + Node) allocate memory outside the V8 heap. This shows up as `external` in process.memoryUsage(). Large allocations are not subject to V8 GC pauses but still need to be dereferenced for collection. Buffer.alloc() is safe (zeroed), Buffer.allocUnsafe() is fast but may contain stale data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Buffer & Typed Array Memory — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Buffer and TypedArray basics — external memory\n// STRENGTHS - Shows allocation and basic usage\n// WEAKNESSES- No memory management, no performance\n//\n// Buffer (Node.js only) — raw binary data outside V8 heap\nconst buf = Buffer.alloc(1024);    // 1KB, zeroed — safe\nbuf.write('Hello');\nconsole.log(buf.toString('utf8', 0, 5));  // 'Hello'\n// TypedArray — browser + Node, typed view on ArrayBuffer\nconst f64 = new Float64Array(100);  // 800 bytes, zeroed\nf64[0] = 3.14;\nconsole.log(f64[0]);  // 3.14\n// ArrayBuffer — raw buffer, no view\nconst raw = new ArrayBuffer(1024);  // 1KB\nconst view = new Uint8Array(raw);   // view into the same buffer\nview[0] = 255;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Buffer & Typed Array Memory — common patterns you'll see in production.\n// APPROACH  - Combine Buffer & Typed Array Memory with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - allocUnsafe, shared buffers, memory tracking, pooling\n// STRENGTHS - Covers the 80% of binary data patterns\n// WEAKNESSES- No SharedArrayBuffer, no Atomics\n//\n// 1) Buffer.allocUnsafe — faster but may contain stale data\nconst fast = Buffer.allocUnsafe(1024);  // NOT zeroed — may have old data\n// Only use if you will immediately overwrite all bytes\nfast.fill(0);  // explicitly clear if needed\n// 2) MEMORY TRACKING — external memory not in heapUsed\nconst big = Buffer.alloc(10 * 1024 * 1024);  // 10MB\nconst mem = process.memoryUsage();\nconsole.log({\n  heapUsed: (mem.heapUsed / 1e6).toFixed(1) + 'MB',     // V8 heap\n  external: (mem.external / 1e6).toFixed(1) + 'MB',     // Buffer/TypedArray\n  arrayBuffers: (mem.arrayBuffers / 1e6).toFixed(1) + 'MB',\n});\n// 3) BUFFER POOL — reuse buffers to avoid allocation churn\nconst pool = {\n  buffers: [],\n  acquire(size) {\n    const idx = this.buffers.findIndex(b => b.length >= size);\n    return idx >= 0 ? this.buffers.splice(idx, 1)[0] : Buffer.allocUnsafe(size);\n  },\n  release(buf) { this.buffers.push(buf); },\n};\n// 4) TYPED ARRAY VIEWS — multiple views on same buffer\nconst shared = new ArrayBuffer(32);\nconst i32 = new Int32Array(shared);   // 8 x int32\nconst f32 = new Float32Array(shared); // 8 x float32\ni32[0] = 42;\nconsole.log(f32[0]);  // reinterpret bits of 42 as float32"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Buffer & Typed Array Memory — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - SharedArrayBuffer, Atomics, transfer, decision guide\n// STRENGTHS - Production patterns for high-performance binary data\n// WEAKNESSES- N/A\n//\n// 1) SHARED ARRAY BUFFER — shared memory between threads (workers)\n//    Requires: --cross-origin-isolation headers (COOP/COEP)\nconst sab = new SharedArrayBuffer(1024);\nconst i32 = new Int32Array(sab);\n// Share with worker: worker.postMessage(sab);\n// Both main thread and worker can read/write the same memory\n// 2) ATOMICS — safe concurrent access to SharedArrayBuffer\nAtomics.store(i32, 0, 42);     // atomic write\nconst val = Atomics.load(i32, 0);  // atomic read\nAtomics.add(i32, 0, 1);        // atomic increment\nAtomics.compareExchange(i32, 0, 42, 99);  // CAS: if [0]==42, set to 99\n// 3) TRANSFERABLE — zero-copy transfer of ArrayBuffer to worker\nconst buffer = new ArrayBuffer(1024);\nconst view = new Uint8Array(buffer);\nview[0] = 255;\nworker.postMessage(buffer, [buffer]);  // transfers ownership, no copy\n// After transfer: buffer.byteLength === 0 (detached), can't use it anymore\n// 4) BUFFER.concat — allocates new buffer, O(total length)\nconst chunks = [Buffer.from('Hello'), Buffer.from(' '), Buffer.from('World')];\nconst combined = Buffer.concat(chunks);  // O(n) — new allocation\nconsole.log(combined.toString());  // 'Hello World'\n// 5) DETACHED BUFFERS — after transfer, check before use\nfunction isDetached(buf) {\n  return buf.byteLength === 0 && buf !== null;\n}\n// Decision rule:\n//   raw binary data, Node.js only                         -> Buffer.alloc()\n//   raw binary data, browser + Node                       -> TypedArray/ArrayBuffer\n//   maximum speed, will overwrite immediately             -> Buffer.allocUnsafe()\n//   share memory between worker and main                  -> SharedArrayBuffer\n//   safe concurrent access to shared memory               -> Atomics\n//   zero-copy transfer to worker                          -> postMessage(buf, [buf])\n//   reuse buffers to avoid GC churn                       -> buffer pool\n//   multiple typed views on same memory                   -> shared ArrayBuffer + views\n//\n// Anti-pattern: Buffer.allocUnsafe() without filling;\n//   it may contain stale data from freed memory. Use alloc() if you won't overwrite everything."
                  }
        ],
        tips: [
                  "Buffer and TypedArray memory is external to V8 heap — tracked in `process.memoryUsage().external`",
                  "Buffer.allocUnsafe() is faster but may contain stale data — only use if you'll overwrite all bytes",
                  "Transfer ArrayBuffer to worker with `postMessage(buf, [buf])` for zero-copy — buffer is detached after",
                  "SharedArrayBuffer + Atomics enable safe shared memory between threads (requires COOP/COEP headers)"
        ],
        mistake: "Using `Buffer.allocUnsafe()` without filling the buffer. It may contain stale data from previously freed memory. Use `Buffer.alloc()` if you won't immediately overwrite all bytes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst buf = Buffer.alloc(1024);\n// More explicit but longer",
          concise: "const buf = Buffer.allocUnsafe(1024);",
        },
      },
    ],
  },

  // ── Section 3: Memory Optimization Patterns ─────────────────────────────────────────
  {
    id: "memory-optimization",
    title: "Memory Optimization Patterns",
    entries: [
      {
        id: "object-pool",
        fn: "Object Pool Pattern",
        desc: "Reuse objects to avoid GC pressure from frequent allocation.",
        category: "Optimization",
        subtitle: "Pre-allocate, reuse, reset — avoid allocation churn in hot paths",
        signature: "pool.acquire() | pool.release(obj) | obj.reset()",
        descLong: "Object pooling pre-allocates a set of objects and reuses them instead of creating new ones. This reduces GC pressure in hot paths with frequent allocation/deallocation. Common in game loops, particle systems, and request handlers. Tradeoff: higher steady-state memory usage, but fewer GC pauses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object Pool Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Simple pool: acquire from free list, release back\n// STRENGTHS - Shows the core pool pattern\n// WEAKNESSES- No reset, no max size, no pre-allocation\n//\nclass SimplePool {\n  #free = [];\n  acquire() { return this.#free.pop() ?? {}; }\n  release(obj) { this.#free.push(obj); }\n}\nconst pool = new SimplePool();\nconst obj = pool.acquire();\nobj.x = 1; obj.y = 2;\n// use obj...\npool.release(obj);  // return to pool instead of letting GC collect"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object Pool Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Object Pool Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Reset on release, pre-allocate, factory pattern\n// STRENGTHS - Covers the 80% of pooling needs\n// WEAKNESSES- No max size, no metrics\n//\nclass ObjectPool {\n  #free = [];\n  #factory;\n  #resetFn;\n  constructor(factory, resetFn, preAllocate = 10) {\n    this.#factory = factory;\n    this.#resetFn = resetFn;\n    for (let i = 0; i < preAllocate; i++) this.#free.push(factory());\n  }\n  acquire() {\n    const obj = this.#free.pop() ?? this.#factory();\n    return obj;\n  }\n  release(obj) {\n    this.#resetFn(obj);\n    this.#free.push(obj);\n  }\n  get size() { return this.#free.length; }\n}\n// Usage: pool particle objects in a game loop\nconst particles = new ObjectPool(\n  () => ({ x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '' }),\n  (p) => { p.x = 0; p.y = 0; p.vx = 0; p.vy = 0; p.life = 0; p.color = ''; },\n  100,  // pre-allocate 100 particles\n);\n// In animation frame:\nconst p = particles.acquire();\np.x = 100; p.y = 200; p.vx = 1; p.life = 60; p.color = 'red';\n// ... render particle ...\nparticles.release(p);  // reset and return to pool"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object Pool Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Max size, metrics, weak refs, decision guide\n// STRENGTHS - Production-grade pooling with monitoring\n// WEAKNESSES- N/A\n//\nclass ProductionPool {\n  #free = [];\n  #inUse = new Set();\n  #factory; #resetFn;\n  #maxSize; #created = 0; #reused = 0;\n  constructor(factory, resetFn, { preAllocate = 10, maxSize = 1000 } = {}) {\n    this.#factory = factory;\n    this.#resetFn = resetFn;\n    this.#maxSize = maxSize;\n    for (let i = 0; i < preAllocate; i++) {\n      this.#free.push(factory());\n      this.#created++;\n    }\n  }\n  acquire() {\n    let obj;\n    if (this.#free.length > 0) {\n      obj = this.#free.pop();\n      this.#reused++;\n    } else {\n      obj = this.#factory();\n      this.#created++;\n    }\n    this.#inUse.add(obj);\n    return obj;\n  }\n  release(obj) {\n    if (!this.#inUse.has(obj)) return;  // not from this pool\n    this.#inUse.delete(obj);\n    this.#resetFn(obj);\n    if (this.#free.length < this.#maxSize) {\n      this.#free.push(obj);\n    }\n    // else: let GC collect — pool is full\n  }\n  get metrics() {\n    return {\n      free: this.#free.length,\n      inUse: this.#inUse.size,\n      created: this.#created,\n      reused: this.#reused,\n      hitRate: this.#created > 0 ? (this.#reused / (this.#created + this.#reused)).toFixed(2) : 0,\n    };\n  }\n}\n// Decision rule:\n//   frequent alloc/dealloc of same type in hot path     -> object pool\n//   game loop / particle system                         -> pool with pre-allocation\n//   request handlers in server                          -> pool if alloc is expensive\n//   one-time object creation                            -> no pool, let GC handle it\n//   objects with complex state                          -> pool with thorough reset\n//   need to track pool efficiency                       -> metrics with hitRate\n//   pool grows too large                                -> maxSize, let GC collect overflow\n//\n// Anti-pattern: pooling objects that are cheap to allocate;\n//   pooling adds complexity. Only pool when allocation cost is measurable."
                  }
        ],
        tips: [
                  "Object pooling reduces GC pressure by reusing objects instead of allocating new ones",
                  "Always reset object state on release — stale data is a common pooling bug",
                  "Pre-allocate the expected working set to avoid allocations during steady state",
                  "Track hit rate (reused / total) — if it's low, the pool isn't helping"
        ],
        mistake: "Pooling objects that are cheap to allocate (small, simple objects). Pooling adds complexity and steady-state memory. Only pool when allocation cost is measurable in hot paths.",
        shorthand: {
          verbose: "const obj = new ExpensiveObject();\n// ... use ...\n// discard (GC collects)",
          concise: "const obj = pool.acquire();\n// ... use ...\npool.release(obj);",
        },
      },
      {
        id: "structural-sharing",
        fn: "Structural Sharing & Immutability",
        desc: "Immutable data structures share unchanged parts to reduce memory.",
        category: "Optimization",
        subtitle: "Copy-on-write: only the changed path is copied, rest is shared",
        signature: "{ ...obj, key: newVal } // shallow copy, rest shared",
        descLong: "Structural sharing means when you \"modify\" an immutable structure, only the path from root to the changed node is copied — all other branches are shared by reference. This makes immutability affordable: O(log n) for balanced trees, O(1) for shallow object spread at the top level. Libraries like Immer use structural sharing under the hood.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Structural Sharing & Immutability — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Shallow spread shares unchanged references\n// STRENGTHS - Shows the simplest structural sharing\n// WEAKNESSES- No deep update, no Immer\n//\nconst state = { user: { name: 'Alice' }, posts: [1, 2, 3] };\n// Shallow copy: 'posts' array is shared by reference, not copied\nconst nextState = { ...state, user: { name: 'Bob' } };\nconsole.log(state.posts === nextState.posts);  // true — shared!\nconsole.log(state.user === nextState.user);    // false — new object\n// Only the 'user' branch was copied; 'posts' is shared"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Structural Sharing & Immutability — common patterns you'll see in production.\n// APPROACH  - Combine Structural Sharing & Immutability with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Deep immutable update, Immer, memory savings\n// STRENGTHS - Shows practical immutable update patterns\n// WEAKNESSES- No persistent data structures, no benchmarking\n//\n// 1) DEEP UPDATE — copy only the path that changes\nconst state = {\n  user: { profile: { name: 'Alice', age: 30 } },\n  posts: [1, 2, 3],\n};\n// Update user.profile.name — copy path: state -> user -> profile\nconst nextState = {\n  ...state,\n  user: {\n    ...state.user,\n    profile: { ...state.user.profile, name: 'Bob' },\n  },\n};\n// 'posts' is shared, 'user.profile.age' is shared, only 'name' changed\n// 2) IMMER — structural sharing without manual spread\nimport { produce } from 'immer';\nconst next = produce(state, draft => {\n  draft.user.profile.name = 'Bob';  // looks like mutation, but it's copy-on-write\n});\n// Immer copies only the path that changed, shares everything else\n// 3) ARRAY immutable update — copy the array, share elements\nconst items = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];\nconst updated = items.map(item =>\n  item.id === 2 ? { ...item, name: 'C' } : item  // only item 2 is new\n);\nconsole.log(items[0] === updated[0]);  // true — element 0 is shared\nconsole.log(items[1] === updated[1]);  // false — element 1 is new"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Structural Sharing & Immutability — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Persistent data structures, benchmarking, decision guide\n// STRENGTHS - Advanced patterns for memory-efficient immutability\n// WEAKNESSES- N/A\n//\n// 1) PERSISTENT VECTOR — O(log32 n) updates with structural sharing\n//    Libraries: Immutable.js (Map, List), Clojure-style persistent vectors\n//    Each update copies ~32 nodes (the path from root to leaf), shares the rest.\n//    For n = 1M elements: ~5 levels, copy 5 * 32 = 160 references per update.\n// 2) BENCHMARK — immutable update of 10k-element array\n//    Full copy: items.map(...)         ~2ms   (copies all 10k elements)\n//    Immer:     produce(items, ...)    ~0.5ms (copies only changed path)\n//    Immutable.js: list.set(i, val)    ~0.1ms (persistent vector, O(log n))\n// 3) IMMER WITH PATCHES — track changes for undo/redo\nimport { produceWithPatches } from 'immer';\nconst [nextState, patches] = produceWithPatches(state, draft => {\n  draft.user.profile.name = 'Bob';\n  draft.user.profile.age = 31;\n});\n// patches: [{ op: 'replace', path: ['user', 'profile', 'name'], value: 'Bob' }, ...]\n// Apply patches: import { applyPatches } from 'immer'; applyPatches(state, patches);\n// 4) FROZEN OBJECTS — Object.freeze for true immutability (dev mode)\nfunction deepFreeze(obj) {\n  Object.freeze(obj);\n  for (const val of Object.values(obj)) {\n    if (typeof val === 'object' && val !== null) deepFreeze(val);\n  }\n  return obj;\n}\n// Note: Object.freeze is O(n) — don't use in hot paths, use in dev/build only\n// Decision rule:\n//   shallow immutable update (top-level only)           -> { ...obj, key: val }\n//   deep immutable update (nested path)                 -> manual spread or Immer\n//   frequent updates on large immutable data            -> Immer or Immutable.js\n//   need undo/redo                                      -> Immer with patches\n//   true immutability enforcement (dev)                 -> Object.freeze / deepFreeze\n//   maximum performance for large immutable collections  -> Immutable.js persistent data structures\n//   simple state, few updates                           -> spread (no library needed)\n//\n// Anti-pattern: deep-cloning the entire state on every update;\n//   use structural sharing — copy only the path that changes, share the rest."
                  }
        ],
        tips: [
                  "Structural sharing copies only the changed path — unchanged branches are shared by reference",
                  "Immer provides copy-on-write with structural sharing — looks like mutation, but isn't",
                  "Immutable.js persistent vectors give O(log32 n) updates — ~5 levels for 1M elements",
                  "Object.freeze is O(n) — use in dev/build only, not in hot paths"
        ],
        mistake: "Deep-cloning the entire state on every immutable update. Use structural sharing — copy only the path that changes and share the rest by reference.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst updated = Object.assign({}, state, { count: state.count + 1 });\n// More explicit but longer",
          concise: "const updated = { ...state, count: state.count + 1 };",
        },
      },
    ],
  },
]

export default { meta, sections }
