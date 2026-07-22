export const meta = {
  "title": "Arrays",
  "domain": "javascript",
  "sheet": "arrays",
  "icon": "📦"
}

export const sections = [

  // ── Section 1: Array Fundamentals ─────────────────────────────────────────
  {
    id: "array-fundamentals",
    title: "Array Fundamentals",
    entries: [
      {
        id: "array-literal",
        fn: "Array Literal",
        desc: "Create arrays with literal syntax — the most concise and readable way to initialize arrays.",
        category: "Array Fundamentals",
        subtitle: "Constructing arrays with literal notation",
        signature: "[item1, item2, ...]  |  [...]",
        descLong: "The array literal [] is the preferred way to create arrays. Literals are more readable and efficient than Array() constructor calls. The spread operator [...arr] copies or combines arrays. Array.of() is useful when you need a single-element array (Array.of(3) produces [3], not an array of length 3).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array Literal — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest array literal: create arrays with [].\n// STRENGTHS - shows bracket syntax, mixed types, empty array.\n// WEAKNESSES- no spread, no Array.of, no copy semantics.\n//\n// GOAL: create an array with bracket literal syntax\nconst nums  = [1, 2, 3];\nconst words = ['apple', 'banana', 'cherry'];\nconst empty = [];\n// → brackets can hold any values, any mix of types"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array Literal — common patterns you'll see in production.\n// APPROACH  - Combine Array Literal with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - copy and combine arrays using spread operator.\n// STRENGTHS - covers the 80% case: shallow copy, merge, prepend/append.\n// WEAKNESSES- no deep copy, no Array.from, no Array.of.\n//\n// GOAL: copy and combine arrays using the spread operator\nconst original = [1, 2, 3];\n// WHY: spread makes a shallow copy — changes to copy won't affect original\nconst copy = [...original];\n// WHY: spread is cleaner than concat for merging\nconst combined = [...original, 4, 5];\n// → [1, 2, 3, 4, 5]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array Literal — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production array construction: Array.of vs Array(n),\n//             dense vs sparse arrays, structuredClone for deep copy,\n//             and Array.from for iterable conversion.\n// STRENGTHS - Array.of vs Array(n) gotcha; dense vs sparse; deep copy;\n//             Array.from with mapFn.\n// WEAKNESSES- no TypedArray comparison; no memory analysis.\n//\n// GOAL: use Array.of() to avoid the Array(n) single-arg gotcha\nArray.of(3);   // → [3]     one element: the number 3\nnew Array(3);  // → [,,,]   empty sparse array of length 3 — not what you want!\n// Dense vs sparse: Array(n) creates holes that forEach/map skip\nconst sparse = new Array(3);     // [empty × 3] — no indices\nconst dense  = Array.from({ length: 3 }); // [undefined, undefined, undefined]\nsparse.forEach(() => console.log('hi'));  // never runs\ndense.forEach(() => console.log('hi'));   // runs 3 times\n// Deep copy: spread only copies one level — nested objects are shared\nconst nested = [{ a: 1 }];\nconst shallow = [...nested];\nshallow[0].a = 99; // mutates nested[0] too!\nconst deep = structuredClone(nested); // true deep copy\ndeep[0].a = 99; // nested[0].a is still 1\n// Decision rule:\n//   simple array creation                                    -> []\n//   single numeric element                                   -> Array.of(n) or [n]\n//   shallow copy                                             -> [...arr]\n//   deep copy with nested objects                            -> structuredClone(arr)\n//   array from iterable + transform                          -> Array.from(iter, mapFn)\n//   fixed-length dense array                                 -> Array.from({ length: n })\n//\n// Anti-pattern: new Array(n) expecting [n];\n//   spread for deep copy (nested refs shared)."
                  }
        ],
        tips: [
                  "Prefer [] over new Array() — it's simpler and more idiomatic.",
                  "Spread [...arr] creates a shallow copy — nested objects are still shared references.",
                  "Use Array.of(n) only when you specifically need Array constructor behavior.",
                  "Array literals can be nested: const matrix = [[1,2],[3,4]]."
        ],
        mistake: "Using Array(5) expecting [5] — it creates a sparse array of length 5 with empty slots. Use Array.of(5) or [5] for a single-element array.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst arr = new Array();\narr.push(1); arr.push(2); arr.push(3);\n// More explicit but longer",
          concise: "const arr = [1, 2, 3];",
        },
      },
      {
        id: "array-from",
        fn: "Array.from()",
        desc: "Convert iterables and array-like objects to real arrays with optional mapping.",
        category: "Array Fundamentals",
        subtitle: "Constructing arrays from iterables",
        signature: "Array.from(iterable, mapFn?, thisArg?)",
        descLong: "Array.from() converts any iterable (Sets, Maps, strings, NodeLists) or array-like object (arguments, objects with length property) into a real array. The optional second argument is a map function applied to each element during construction — equivalent to .map() but in one pass.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array.from() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Array.from: convert iterable to array.\n// STRENGTHS - shows string to array, Set to array (dedup).\n// WEAKNESSES- no mapFn, no array-like, no NodeList.\n//\n// GOAL: convert a non-array into a real array\nArray.from('hello');              // → ['h', 'e', 'l', 'l', 'o']\nArray.from(new Set([1, 1, 2]));  // → [1, 2]  (deduplicates)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array.from() — common patterns you'll see in production.\n// APPROACH  - Combine Array.from() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - convert NodeList to array with inline mapping.\n// STRENGTHS - covers the 80% case: NodeList, mapFn, textContent extraction.\n// WEAKNESSES- no array-like objects, no performance comparison.\n//\n// GOAL: turn a DOM NodeList into an array so we can use .map()\nconst items = document.querySelectorAll('.item');\n// WHY: NodeList doesn't have .map() — Array.from() gives us a real array\nconst texts = Array.from(items, el => el.textContent);\n// → ['Item 1', 'Item 2', ...]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array.from() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Array.from: range generation, iterable\n//             conversion with map, arguments object, custom iterables,\n//             and Array.from vs [...spread] decision guide.\n// STRENGTHS - range generation; mapFn one-pass; arguments conversion;\n//             custom iterable; Array.from vs spread decision.\n// WEAKNESSES- no async iterator; no performance benchmarking.\n//\n// GOAL: generate a numeric range in one expression\n// WHY: { length: n } acts as an array-like object, mapFn replaces a separate .map() call\nconst range = Array.from({ length: 5 }, (_, i) => i + 1);\n// → [1, 2, 3, 4, 5]\n// Convert arguments object to real array (pre-rest-params pattern)\nfunction legacySum() {\n  const args = Array.from(arguments);\n  return args.reduce((a, b) => a + b, 0);\n}\n// Custom iterable to array\nclass Range {\n  constructor(start, end, step = 1) { this.start = start; this.end = end; this.step = step; }\n  *[Symbol.iterator]() {\n    for (let i = this.start; i <= this.end; i += this.step) yield i;\n  }\n}\nconst nums = Array.from(new Range(1, 10, 2)); // → [1, 3, 5, 7, 9]\n// One-pass map: Array.from(iter, mapFn) vs [...iter].map(mapFn)\n// Array.from is one pass; [...iter].map() is two passes + intermediate array\nconst doubled = Array.from(new Set([1, 2, 3]), n => n * 2); // → [2, 4, 6]\n// Decision rule:\n//   iterable to array, no transform                            -> [...iter]\n//   iterable to array + transform                              -> Array.from(iter, mapFn)\n//   array-like (has .length)                                   -> Array.from(obj)\n//   generate numeric range                                     -> Array.from({ length: n }, (_, i) => ...)\n//   Set/Map to array                                           -> [...set] or Array.from(set)\n//\n// Anti-pattern: [...iter].map(fn) when Array.from(iter, fn) does it in one pass."
                  }
        ],
        tips: [
                  "Array.from({ length: n }, (_, i) => i) is the idiomatic way to create a range of numbers.",
                  "Array.from(nodeList) converts a DOM NodeList to a real array so you can use .map().",
                  "The second parameter is a map function — more efficient than Array.from().map().",
                  "Works with any iterable: for (const x of myIterable) works, so Array.from(myIterable) works."
        ],
        mistake: "Using [...iterable] when you need mapping — use Array.from(iterable, mapFn) in a single call instead of [...iterable].map(mapFn).",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst mapped = [...set].map(x => x * 2);\n// More explicit but longer",
          concise: "const mapped = Array.from(set, x => x * 2);",
        },
      },
      {
        id: "foreach",
        fn: ".forEach()",
        desc: "Executes a callback for each element — for side effects only, returns undefined.",
        category: "Array Fundamentals",
        subtitle: "Side-effect iteration over every element",
        signature: "arr.forEach((element, index, array) => { })",
        descLong: "forEach is for performing side effects (logging, DOM updates, mutations). It always returns undefined and cannot be broken out of. If you need to transform data, use .map(). If you need to stop early, use for...of with break.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .forEach() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest forEach: iterate with side effects.\n// STRENGTHS - shows forEach callback, console.log per element.\n// WEAKNESSES- no index, no break, no async.\n//\n// GOAL: run a function on every element (side effects only)\nconst fruits = ['apple', 'banana', 'cherry'];\nfruits.forEach(fruit => {\n  console.log(fruit);\n});\n// → apple  banana  cherry"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .forEach() — common patterns you'll see in production.\n// APPROACH  - Combine .forEach() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - forEach with index and array reference in callback.\n// STRENGTHS - covers the 80% case: index, template literal, element + position.\n// WEAKNESSES- no break, no async iteration, no early exit.\n//\n// GOAL: use the index alongside each element\nconst scores = [85, 92, 78];\nscores.forEach((score, index) => {\n  // WHY: both element and position are available in the callback\n  console.log(`Student ${index + 1}: ${score}`);\n});\n// → Student 1: 85  Student 2: 92  Student 3: 78"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .forEach() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production forEach limitations: break with for...of,\n//             async iteration patterns, sparse array behavior,\n//             and forEach vs for...of vs for loop decision guide.\n// STRENGTHS - break/continue with for...of; async iteration; sparse\n//             array behavior; performance comparison.\n// WEAKNESSES- no benchmark numbers; no iterator protocol detail.\n//\n// GOAL: break early from iteration — forEach can't do this, use for...of instead\nconst nums = [1, 2, 3, 4, 5];\n// WHY: for...of supports break, forEach does not\nfor (const n of nums) {\n  if (n === 3) break;\n  console.log(n);\n}\n// → 1  2\n// Async iteration: forEach doesn't await — use for...of\nasync function processItems(items) {\n  for (const item of items) {\n    await processItem(item); // sequential, awaited\n  }\n}\n// Parallel alternative: Promise.all with .map()\nasync function processParallel(items) {\n  await Promise.all(items.map(item => processItem(item)));\n}\n// Sparse array: forEach skips holes\nconst sparse = [1, , 3]; // hole at index 1\nsparse.forEach(x => console.log(x)); // → 1, 3 (skips hole)\n// for...of also skips holes: → 1, 3\n// Classic for loop visits holes: → 1, undefined, 3\n// Decision rule:\n//   side effects, no early exit needed                          -> forEach\n//   need break/continue                                        -> for...of\n//   sequential async                                           -> for...of with await\n//   parallel async                                             -> Promise.all + .map()\n//   need index in async loop                                   -> for (let i = 0; ...)\n//   maximum performance (hot path)                             -> classic for loop\n//\n// Anti-pattern: await inside forEach callback;\n//   using forEach when you need the return value (it's undefined)."
                  }
        ],
        tips: [
                  "forEach cannot be stopped mid-iteration — use for...of with break if you need that.",
                  "forEach skips empty/sparse array slots — Array.from is safer for dense arrays.",
                  "Cannot use await directly inside forEach — use for...of or Promise.all with .map().",
                  "forEach always returns undefined — never assign its result."
        ],
        mistake: "Trying to use await inside a forEach callback — the async callback runs, but forEach doesn't wait for the promises. Use for...of or for...await...of instead.",
        shorthand: {
          verbose: "for (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}",
          concise: "arr.forEach(x => console.log(x));",
        },
      },
      {
        id: "map",
        fn: ".map()",
        desc: "Returns a new array by applying a transform function to each element.",
        category: "Array Fundamentals",
        subtitle: "Transform every element into a new array",
        signature: "arr.map((element, index, array) => newValue)",
        descLong: ".map() is a pure transformation — it always returns a new array of the same length. The original array is not modified. It is one of the most heavily used array methods in modern JS, especially in React for rendering lists.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .map() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest map: transform every element into a new array.\n// STRENGTHS - shows map callback, pure transformation, original unchanged.\n// WEAKNESSES- no index, no chaining, no object mapping.\n//\n// GOAL: transform every element and get a new array back\nconst nums    = [1, 2, 3, 4];\nconst doubled = nums.map(n => n * 2);\n// → [2, 4, 6, 8]  (original nums is unchanged)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .map() — common patterns you'll see in production.\n// APPROACH  - Combine .map() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - extract a field from an array of objects with map.\n// STRENGTHS - covers the 80% case: object property extraction, React list rendering.\n// WEAKNESSES- no chaining, no index usage, no null safety.\n//\n// GOAL: extract a specific field from an array of objects\nconst users = [\n  { name: 'Alice', age: 30 },\n  { name: 'Bob',   age: 25 },\n];\n// WHY: map lets us reshape every element the same way\nconst names = users.map(user => user.name);\n// → ['Alice', 'Bob']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .map() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production map patterns: chain map+filter+reduce, flatMap\n//             for one-to-many transforms, index-based rendering, and\n//             transducer-style single-pass optimization.\n// STRENGTHS - chaining; flatMap expand; index for keys; single-pass\n//             reduce alternative; performance guidance.\n// WEAKNESSES- no actual transducer library; no lazy evaluation.\n//\n// GOAL: chain map and filter to transform then narrow a dataset\nconst result = [1, 2, 3, 4, 5]\n  .map(n => n * 2)       // double every number  → [2, 4, 6, 8, 10]\n  .filter(n => n > 4)    // keep only > 4        → [6, 8, 10]\n  .reduce((sum, n) => sum + n, 0); // sum it up  → 24\n// One-to-many transform: flatMap expands each element\nconst pairs = [1, 2, 3].flatMap(n => [n, n * 10]);\n// → [1, 10, 2, 20, 3, 30]\n// React-style key generation with index\nconst items = ['a', 'b', 'c'].map((item, i) => ({ key: i, label: item }));\n// → [{ key: 0, label: 'a' }, { key: 1, label: 'b' }, { key: 2, label: 'c' }]\n// Single-pass: replace .map().filter() with a reduce to avoid intermediate arrays\nconst optimized = [1, 2, 3, 4, 5].reduce((acc, n) => {\n  const doubled = n * 2;\n  if (doubled > 4) acc.push(doubled);\n  return acc;\n}, []);\n// → [6, 8, 10]  (one pass, no intermediate array)\n// Decision rule:\n//   transform every element                                     -> .map()\n//   transform + filter in one pass                              -> .flatMap() or .reduce()\n//   one-to-many transform                                       -> .flatMap()\n//   need index for keys/ids                                     -> .map((el, i) => ...)\n//   large dataset + multiple chained ops                        -> single .reduce()\n//   side effects only                                           -> .forEach() not .map()\n//\n// Anti-pattern: .map() for side effects (ignoring return value);\n//   .map().filter().reduce() on very large arrays (use single reduce)."
                  }
        ],
        tips: [
                  ".map() always returns the same number of elements — use .filter() to remove elements.",
                  "Do not use .map() for side effects — use .forEach() instead.",
                  "Return explicitly in a block body: .map(n => { return n * 2; }) — easy to forget.",
                  "Chaining .map().filter() is readable but creates intermediate arrays — use .reduce() for heavy data pipelines."
        ],
        mistake: "Using .map() for side effects and ignoring the returned array. If you're not using the return value, use .forEach().",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst result = [];\nfor (const x of arr) result.push(x * 2);\n// More explicit but longer",
          concise: "const result = arr.map(x => x * 2);",
        },
      },
      {
        id: "filter",
        fn: ".filter()",
        desc: "Returns a new array containing only elements for which the callback returns truthy.",
        category: "Array Fundamentals",
        subtitle: "Create a subset based on a condition",
        signature: "arr.filter((element, index, array) => boolean)",
        descLong: ".filter() returns a new, potentially shorter array. The original is not modified. Falsy returns (false, null, undefined, 0, '') exclude the element. Chain with .map() to first filter then transform.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .filter() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest filter: keep elements that pass a test.\n// STRENGTHS - shows filter callback, boolean predicate, new array.\n// WEAKNESSES- no object filtering, no Boolean trick, no chaining.\n//\n// GOAL: keep only elements that pass a test\nconst nums  = [1, 2, 3, 4, 5, 6];\nconst evens = nums.filter(n => n % 2 === 0);\n// → [2, 4, 6]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .filter() — common patterns you'll see in production.\n// APPROACH  - Combine .filter() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - filter an array of objects by a property value.\n// STRENGTHS - covers the 80% case: object property filter, truthy check.\n// WEAKNESSES- no Boolean trick, no multi-condition, no debounce.\n//\n// GOAL: filter an array of objects by a property\nconst users = [\n  { name: 'Alice', active: true  },\n  { name: 'Bob',   active: false },\n  { name: 'Carol', active: true  },\n];\n// WHY: filter reads naturally — \"give me users where active is true\"\nconst activeUsers = users.filter(user => user.active);\n// → [{ name: 'Alice' }, { name: 'Carol' }]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .filter() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production filter patterns: Boolean for falsy removal,\n//             multi-condition filtering, deduplication, and\n//             filter vs find vs some decision guide.\n// STRENGTHS - Boolean trick; multi-condition; dedup with Set;\n//             filter+map chaining; performance notes.\n// WEAKNESSES- no lazy evaluation; no transducer.\n//\n// GOAL: remove all falsy values from a mixed array in one call\nconst dirty = [0, 'hello', null, 'world', undefined, 42, false];\n// WHY: Boolean is a function that coerces each element — falsy values are dropped\nconst clean = dirty.filter(Boolean);\n// → ['hello', 'world', 42]\n// Multi-condition filter with extracted predicate\nconst products = [\n  { name: 'Laptop', price: 999, inStock: true },\n  { name: 'Mouse', price: 25, inStock: false },\n  { name: 'Keyboard', price: 75, inStock: true },\n];\nconst affordable = products.filter(p => p.inStock && p.price < 100);\n// → [{ name: 'Keyboard', price: 75, inStock: true }]\n// Deduplicate using filter + indexOf (or use [...new Set(arr)])\nconst dupes = [1, 2, 2, 3, 3, 3];\nconst unique = dupes.filter((n, i, arr) => arr.indexOf(n) === i);\n// → [1, 2, 3]  (prefer [...new Set(dupes)] for readability)\n// Decision rule:\n//   keep elements matching a condition                           -> .filter(predicate)\n//   remove falsy values                                         -> .filter(Boolean)\n//   deduplicate primitives                                      -> [...new Set(arr)]\n//   find first match only                                       -> .find(predicate)\n//   check existence (boolean)                                   -> .some(predicate)\n//   filter + transform                                          -> .filter().map() or .flatMap()\n//\n// Anti-pattern: .filter() with side effects; using filter for\n//   existence checks when .some() short-circuits faster."
                  }
        ],
        tips: [
                  ".filter(Boolean) is an idiomatic way to remove all falsy values from an array.",
                  "Chain .filter().map() to narrow then transform — reads like English.",
                  ".filter() returns a new array even if nothing is removed — safe to chain.",
                  "For complex filtering logic, extract the predicate to a named function for readability."
        ],
        mistake: "Modifying elements inside .filter() — it should be a pure predicate only. Use .map() after .filter() for transformations.",
        shorthand: {
          verbose: "const result = [];\nfor (const x of arr) {\n  if (x > 0) result.push(x);\n}",
          concise: "const result = arr.filter(x => x > 0);",
        },
      },
      {
        id: "reduce",
        fn: ".reduce()",
        desc: "Reduces an array to a single value by applying an accumulator function.",
        category: "Array Fundamentals",
        subtitle: "Fold an array into a single value",
        signature: "arr.reduce((accumulator, current, index) => nextAcc, initialValue)",
        descLong: ".reduce() is the most powerful array method — it can implement map, filter, groupBy, and more. Always provide an initial value to avoid errors on empty arrays and to make the starting type explicit. The accumulator can be any type: number, string, array, or object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .reduce() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest reduce: sum all numbers with accumulator.\n// STRENGTHS - shows reduce callback, initial value, accumulator pattern.\n// WEAKNESSES- no object accumulator, no grouping, no flatMap alternative.\n//\n// GOAL: collapse an array down to a single value\nconst nums = [1, 2, 3, 4];\nconst sum  = nums.reduce((acc, n) => acc + n, 0);\n// → 10  (acc starts at 0, adds each number)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .reduce() — common patterns you'll see in production.\n// APPROACH  - Combine .reduce() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - count occurrences using an object accumulator.\n// STRENGTHS - covers the 80% case: object accumulator, tally pattern.\n// WEAKNESSES- no grouping, no nullish coalescing, no Object.groupBy.\n//\n// GOAL: count how many times each value appears\nconst votes = ['yes', 'no', 'yes', 'yes', 'no'];\n// WHY: the accumulator here is an object, not a number — reduce works with any type\nconst tally = votes.reduce((acc, vote) => {\n  acc[vote] = (acc[vote] || 0) + 1;\n  return acc;\n}, {});\n// → { yes: 3, no: 2 }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .reduce() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production reduce patterns: groupBy with ??=, pipeline\n//             as single reduce, flatten nested arrays, and\n//             reduce vs Object.groupBy decision guide.\n// STRENGTHS - groupBy with ??=; single-pass pipeline; flatten;\n//             pipe utility; Object.groupBy comparison.\n// WEAKNESSES- no transducer; no lazy evaluation.\n//\n// GOAL: group an array of objects into buckets by a key\nconst people = [\n  { name: 'Alice', dept: 'Eng' },\n  { name: 'Bob',   dept: 'HR'  },\n  { name: 'Carol', dept: 'Eng' },\n];\n// WHY: (acc[key] ??= []) initializes the array only if it doesn't exist yet\nconst byDept = people.reduce((acc, person) => {\n  (acc[person.dept] ??= []).push(person.name);\n  return acc;\n}, {});\n// → { Eng: ['Alice', 'Carol'], HR: ['Bob'] }\n// Single-pass pipeline: replace .map().filter().map() with one reduce\nconst pipeline = [1, 2, 3, 4, 5].reduce((acc, n) => {\n  const doubled = n * 2;\n  if (doubled > 4) acc.push(doubled + 1); // map + filter + map in one pass\n  return acc;\n}, []);\n// → [7, 9, 11]\n// Flatten nested arrays in one pass\nconst nested = [[1, 2], [3, 4], [5]];\nconst flat = nested.reduce((acc, arr) => acc.concat(arr), []);\n// → [1, 2, 3, 4, 5]  (prefer nested.flat() for readability)\n// Pipe utility: compose functions with reduce\nconst pipe = (fns) => (input) => fns.reduce((acc, fn) => fn(acc), input);\nconst transform = pipe([\n  x => x + 1,\n  x => x * 2,\n  x => x - 3,\n]);\ntransform(5); // → ((5+1)*2)-3 = 9\n// Decision rule:\n//   sum/product/count                                          -> .reduce() with number acc\n//   group into buckets                                         -> .reduce() or Object.groupBy (ES2024)\n//   single-pass map+filter                                     -> .reduce() into array\n//   compose functions                                          -> pipe with reduce\n//   flatten one level                                          -> .flat() not reduce\n//   simple sum                                                 -> .reduce() or for loop\n//\n// Anti-pattern: omitting initial value (breaks on empty array);\n//   using reduce when Object.groupBy is available."
                  }
        ],
        tips: [
                  "Always provide an initial value — omitting it uses the first element and breaks on empty arrays.",
                  "The accumulator's type is determined by the initial value — make it explicit.",
                  "Use Object.groupBy() (ES2024) for grouping instead of reduce when targeting modern environments.",
                  "Avoid deeply nested reduce logic — extract helper functions for readability."
        ],
        mistake: "Omitting the initial value — .reduce() without an initial value throws on an empty array and can produce wrong types on single-element arrays.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet sum = 0;\nfor (const x of arr) sum += x;\n// More explicit but longer",
          concise: "const sum = arr.reduce((a, x) => a + x, 0);",
        },
      },
    ],
  },

  // ── Section 2: Search, Sort & Mutate ─────────────────────────────────────────
  {
    id: "search-sort-mutate",
    title: "Search, Sort & Mutate",
    entries: [
      {
        id: "find",
        fn: ".find() / .findIndex()",
        desc: ".find() returns the first matching element; .findIndex() returns its index. Both return undefined/-1 if not found.",
        category: "Search, Sort & Mutate",
        subtitle: "Locate the first matching element",
        signature: "arr.find(predicate)  |  arr.findIndex(predicate)",
        descLong: "Both methods short-circuit — they stop iterating once the predicate returns truthy. .find() returns the element itself (or undefined); .findIndex() returns the index (or -1). Use .findLast() / .findLastIndex() (ES2023) to search from the end.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .find() / .findIndex() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest find: get first matching element.\n// STRENGTHS - shows find with predicate, short-circuit behavior.\n// WEAKNESSES- no findIndex, no null check, no findLast.\n//\n// GOAL: get the first element that matches a condition\nconst nums   = [5, 12, 8, 130, 44];\nconst found  = nums.find(n => n > 10);\n// → 12  (stops at the first match)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .find() / .findIndex() — common patterns you'll see in production.\n// APPROACH  - Combine .find() / .findIndex() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - find object by id and get its index with findIndex.\n// STRENGTHS - covers the 80% case: object lookup, findIndex, both return values.\n// WEAKNESSES- no null safety, no findLast, no update pattern.\n//\n// GOAL: find a specific object in an array by its id\nconst users = [\n  { id: 1, name: 'Alice' },\n  { id: 2, name: 'Bob'   },\n  { id: 3, name: 'Carol' },\n];\n// WHY: find returns the whole object, not just the index\nconst user  = users.find(u => u.id === 2);\nconst index = users.findIndex(u => u.id === 2);\n// → { id: 2, name: 'Bob' }\n// → 1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .find() / .findIndex() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production find patterns: null-safe access, update by\n//             index, findLast for most-recent match, and find vs\n//             some vs includes decision guide.\n// STRENGTHS - null-safe with optional chaining; update-in-place via\n//             findIndex; findLast for reverse search; decision guide.\n// WEAKNESSES- no binary search for sorted arrays; no Map index.\n//\n// GOAL: safely use the result — always check for undefined\nconst user = users.find(u => u.id === 99);\n// WHY: find returns undefined when nothing matches, not -1 (that's findIndex)\nif (user) {\n  console.log(user.name);\n} else {\n  console.log('Not found');\n}\n// Update by index: find the element, then mutate via index\nconst idx = users.findIndex(u => u.id === 2);\nif (idx !== -1) users[idx].name = 'Robert';\n// findLast: search from the end (ES2023)\nconst events = [\n  { type: 'click', time: 1 },\n  { type: 'scroll', time: 2 },\n  { type: 'click', time: 3 },\n];\nconst lastClick = events.findLast(e => e.type === 'click');\n// → { type: 'click', time: 3 }\n// Performance: build a Map for O(1) lookups by id\nconst userMap = new Map(users.map(u => [u.id, u]));\nuserMap.get(2); // → { id: 2, name: 'Robert' } — O(1) vs O(n) for find\n// Decision rule:\n//   first matching element                                      -> .find(predicate)\n//   index of first match                                        -> .findIndex(predicate)\n//   last matching element                                       -> .findLast(predicate)\n//   existence check (boolean)                                   -> .some(predicate)\n//   primitive membership                                        -> .includes(value)\n//   frequent lookups by key                                     -> Map for O(1)\n//   sorted array lookup                                         -> binary search\n//\n// Anti-pattern: checking .find() result with === -1;\n//   using .find() in a loop when a Map index would be O(1)."
                  }
        ],
        tips: [
                  ".find() returns a reference to the object — mutating it mutates the original array.",
                  "Use .findIndex() when you need to splice or update at the found position.",
                  "For simple primitive inclusion checks, .includes() is faster and clearer.",
                  "Check for undefined, not -1, when using .find() — use .findIndex() when you need the index."
        ],
        mistake: "Checking the result of .find() with === -1 — that's .findIndex() behavior. .find() returns undefined when nothing matches.",
        shorthand: {
          verbose: "let found;\nfor (const x of arr) {\n  if (x.id === 2) { found = x; break; }\n}",
          concise: "const found = arr.find(x => x.id === 2);",
        },
      },
      {
        id: "some-every",
        fn: ".some() / .every()",
        desc: ".some() returns true if any element matches; .every() returns true if all elements match.",
        category: "Search, Sort & Mutate",
        subtitle: "Boolean tests across the array",
        signature: "arr.some(predicate)  |  arr.every(predicate)",
        descLong: "Both short-circuit. .some() stops at the first truthy result and returns true. .every() stops at the first falsy result and returns false. Both return a boolean. .every() returns true for an empty array (vacuous truth); .some() returns false.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .some() / .every() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest some/every: check if any or all elements pass.\n// STRENGTHS - shows some() and every() with boolean predicates.\n// WEAKNESSES- no short-circuit detail, no empty array gotcha.\n//\n// GOAL: check whether any or all elements pass a condition\nconst nums = [1, 3, 5, 7, 8];\nnums.some(n => n % 2 === 0);  // → true   (8 is even)\nnums.every(n => n > 0);       // → true   (all are positive)\nnums.every(n => n % 2 === 0); // → false  (not all even)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .some() / .every() — common patterns you'll see in production.\n// APPROACH  - Combine .some() / .every() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - validate a form with every() for required fields.\n// STRENGTHS - covers the 80% case: form validation, short-circuit on failure.\n// WEAKNESSES- no empty array guard, no some() for existence.\n//\n// GOAL: validate a form — all fields must be non-empty\nconst fields = ['Alice', 'alice@example.com', ''];\n// WHY: every() returns false as soon as one field fails, no need for a manual loop\nconst allFilled = fields.every(f => f.trim().length > 0);\n// → false  (empty string at index 2 fails)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .some() / .every() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production some/every patterns: existence checks with\n//             some, vacuous truth guard, permission checking, and\n//             some vs every vs includes decision guide.\n// STRENGTHS - some for existence; vacuous truth guard; permission\n//             matrix; short-circuit behavior; decision guide.\n// WEAKNESSES- no performance benchmark; no De Morgan's law application.\n//\n// GOAL: use some() as a readable \"does this exist\" check\nconst records = [{ id: 1, status: 'ok' }, { id: 2, status: 'error' }];\n// WHY: some() is cleaner than findIndex() !== -1 for existence checks\nconst hasError = records.some(r => r.status === 'error');\n// → true\n// Vacuous truth: every([]) is always true — guard with .length\nconst valid = fields.length > 0 && fields.every(f => f.trim().length > 0);\n// Permission checking: some() for OR logic, every() for AND logic\nconst user = { roles: ['editor', 'viewer'] };\nconst canEdit = user.roles.some(r => ['admin', 'editor'].includes(r)); // → true\nconst canManageAll = user.roles.every(r => ['admin', 'editor'].includes(r)); // → false\n// De Morgan's: !arr.every(p) === arr.some(!p), and vice versa\nconst notAllValid = !fields.every(f => f.trim().length > 0);\nconst hasInvalid = fields.some(f => f.trim().length === 0);\n// These are equivalent — use whichever reads better\n// Decision rule:\n//   \"does any element match?\"                                  -> .some(predicate)\n//   \"do all elements match?\"                                   -> .every(predicate)\n//   existence check (boolean result)                            -> .some() not .find() !== undefined\n//   empty array should be invalid                               -> guard with .length > 0 &&\n//   OR logic across roles/permissions                           -> .some()\n//   AND logic across requirements                               -> .every()\n//\n// Anti-pattern: .findIndex(p) !== -1 when .some(p) is cleaner;\n//   every() on empty array without length guard (vacuous truth)."
                  }
        ],
        tips: [
                  "Both short-circuit — .some() stops at first truthy, .every() stops at first falsy.",
                  ".every() on an empty array always returns true — guard against this if it matters.",
                  "These are pure read operations — the array is not modified.",
                  "Use .some() as a readable replacement for: arr.findIndex(p) !== -1."
        ],
        mistake: "Expecting .every([]) to return false — it returns true (vacuous truth). Add an explicit length check if an empty array should be considered invalid.",
        shorthand: {
          verbose: "let hasErr = false;\nfor (const r of records) {\n  if (r.status === 'error') { hasErr = true; break; }\n}",
          concise: "const hasErr = records.some(r => r.status === 'error');",
        },
      },
      {
        id: "includes",
        fn: ".includes()",
        desc: "Returns true if the array contains the given value, using same-value-zero comparison.",
        category: "Search, Sort & Mutate",
        subtitle: "Simple value membership test",
        signature: "arr.includes(value, fromIndex?)",
        descLong: ".includes() uses same-value-zero comparison — like === but correctly handles NaN. Optional second argument sets the start index. Simpler than .indexOf() !== -1 for membership checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .includes() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest includes: check if a value exists in an array.\n// STRENGTHS - shows includes with boolean return, simple membership.\n// WEAKNESSES- no NaN handling, no fromIndex, no object limitation.\n//\n// GOAL: check if a value exists in an array\nconst fruits = ['apple', 'banana', 'cherry'];\nfruits.includes('banana'); // → true\nfruits.includes('mango');  // → false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .includes() — common patterns you'll see in production.\n// APPROACH  - Combine .includes() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - validate input against an allowed-values list with includes.\n// STRENGTHS - covers the 80% case: guard clause, allowed values, template literal error.\n// WEAKNESSES- no NaN, no object reference equality, no Set alternative.\n//\n// GOAL: validate input against a list of allowed values\nconst VALID_ROLES = ['admin', 'editor', 'viewer'];\nconst userRole    = 'editor';\n// WHY: includes reads naturally as a guard clause — cleaner than multiple === checks\nif (!VALID_ROLES.includes(userRole)) {\n  throw new Error(`Invalid role: ${userRole}`);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .includes() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production includes patterns: NaN handling, object\n//             reference equality limitation, Set for large arrays,\n//             fromIndex for partial search, and includes vs some\n//             decision guide.\n// STRENGTHS - NaN handling; object reference equality; Set for O(1);\n//             fromIndex partial search; decision guide.\n// WEAKNESSES- no binary search; no performance benchmarks.\n//\n// GOAL: handle NaN correctly — indexOf can't, includes can\nconst data = [1, 2, NaN, 4];\ndata.includes(NaN);   // → true   (correct)\ndata.indexOf(NaN);    // → -1     (broken — indexOf uses strict equality, NaN !== NaN)\n// Object membership: includes uses reference equality — use .some() for value matching\nconst users = [{ id: 1 }, { id: 2 }];\nusers.some(u => u.id === 1); // → true  (correct for objects)\n// fromIndex: search starting from a specific position\nconst arr = [1, 2, 3, 1, 2, 3];\narr.includes(2, 2);     // → true  (searches from index 2, finds 2 at index 4)\narr.includes(2, -3);    // → true  (negative fromIndex counts from end)\n// Set for O(1) membership on large arrays\nconst largeList = Array.from({ length: 100000 }, (_, i) => i);\nconst lookupSet = new Set(largeList);\n// largeList.includes(99999)  → O(n) scan\n// lookupSet.has(99999)       → O(1) lookup\n// Decision rule:\n//   primitive membership (string, number, boolean)               -> .includes(value)\n//   NaN membership                                              -> .includes(NaN) not .indexOf(NaN)\n//   object membership by property                               -> .some(item => item.id === targetId)\n//   large array, frequent lookups                               -> Set.has() for O(1)\n//   search from specific position                               -> .includes(value, fromIndex)\n//   multiple allowed values check                               -> [].includes(val) over || chains\n//\n// Anti-pattern: .indexOf(value) !== -1 when .includes(value) is cleaner;\n//   .includes() on objects expecting value equality (it's reference equality)."
                  }
        ],
        tips: [
                  "Use .includes() for simple \"is this value in the array\" checks over .indexOf() !== -1.",
                  ".includes() correctly handles NaN — .indexOf() does not.",
                  "For objects, .includes() checks reference equality — use .some() with a predicate instead.",
                  "Can replace multiple === comparisons: ['a','b','c'].includes(val) over val==='a'||val==='b'||val==='c'."
        ],
        mistake: "Using .includes() to check if an object is in an array by value — it uses reference equality. Use .some(item => item.id === targetId) for object matching.",
        shorthand: {
          verbose: "let found = false;\nfor (const x of arr) {\n  if (x === 3) { found = true; break; }\n}",
          concise: "const found = arr.includes(3);",
        },
      },
      {
        id: "splice",
        fn: ".splice()",
        desc: "Removes, replaces, or inserts elements in place. Mutates the original array.",
        category: "Search, Sort & Mutate",
        subtitle: "In-place insertion, removal, or replacement",
        signature: "arr.splice(start, deleteCount, ...items)",
        descLong: ".splice() is one of the few array methods that mutates in place. It returns an array of the removed elements. start can be negative (counts from end). Passing 0 for deleteCount allows pure insertion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .splice() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest splice: remove one element at a position.\n// STRENGTHS - shows splice with start + deleteCount, mutation.\n// WEAKNESSES- no insert, no replace, no toSpliced.\n//\n// GOAL: remove one element at a specific position\nconst arr = ['a', 'b', 'c', 'd'];\narr.splice(1, 1); // remove 1 element at index 1\n// → arr is now ['a', 'c', 'd']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .splice() — common patterns you'll see in production.\n// APPROACH  - Combine .splice() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - insert and replace elements using splice with deleteCount 0 and items.\n// STRENGTHS - covers the 80% case: insert, replace, multiple items.\n// WEAKNESSES- no negative index, no toSpliced, no return value capture.\n//\n// GOAL: insert and replace elements by position\nconst arr = ['a', 'b', 'c', 'd'];\n// WHY: deleteCount of 0 means insert without removing anything\narr.splice(1, 0, 'X');         // insert 'X' at index 1\n// → ['a', 'X', 'b', 'c', 'd']\n// WHY: deleteCount 1 + replacement items = replace that one slot\narr.splice(1, 1, 'Y', 'Z');   // replace 'X' with 'Y' and 'Z'\n// → ['a', 'Y', 'Z', 'b', 'c', 'd']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .splice() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production splice patterns: toSpliced for immutability,\n//             negative start index, return value capture, batch\n//             removal, and splice vs filter vs toSpliced decision guide.\n// STRENGTHS - toSpliced immutability; negative index; return value;\n//             batch removal; decision guide.\n// WEAKNESSES- no performance benchmark; no slice comparison.\n//\n// GOAL: use immutable .toSpliced() instead when the original must be preserved\nconst arr = ['a', 'b', 'c', 'd'];\n// WHY: .splice() mutates — in React or functional code that breaks things\nconst next = arr.toSpliced(1, 1, 'X'); // → ['a', 'X', 'c', 'd']\nconsole.log(arr); // → ['a', 'b', 'c', 'd']  original untouched\n// Negative start: counts from end\nconst arr2 = ['a', 'b', 'c', 'd'];\narr2.splice(-2, 1); // remove 1 element at index 2 (from end: -2)\n// → ['a', 'b', 'd']\n// Capture removed elements\nconst arr3 = ['a', 'b', 'c', 'd'];\nconst removed = arr3.splice(1, 2); // → ['b', 'c']\n// arr3 is now ['a', 'd']\n// Batch insert: splice multiple items at once\nconst arr4 = ['a', 'd'];\narr4.splice(1, 0, 'b', 'c'); // → ['a', 'b', 'c', 'd']\n// Empty in place: splice(0) keeps the same reference\nconst arr5 = [1, 2, 3];\narr5.splice(0); // arr5 is now [], same reference\n// Decision rule:\n//   remove by index, mutation OK                                -> .splice(start, count)\n//   remove by index, immutability required                      -> .toSpliced(start, count)\n//   remove by condition                                         -> .filter(predicate)\n//   insert at position                                          -> .splice(start, 0, ...items)\n//   replace at position                                         -> .splice(start, 1, ...items)\n//   empty array, keep reference                                 -> .splice(0)\n//   copy a portion                                              -> .slice(start, end)\n//\n// Anti-pattern: .splice() on React state;\n//   confusing .slice() (copy) with .splice() (mutate)."
                  }
        ],
        tips: [
                  ".splice() mutates — if you want an immutable remove, use .filter() or .toSpliced() (ES2023).",
                  "The return value is the array of removed elements — useful to capture when removing.",
                  "Use .toSpliced() for a non-mutating version (ES2023): const next = arr.toSpliced(1,1).",
                  "splice(0) empties the array in place — useful when you need to keep the same reference."
        ],
        mistake: "Confusing .slice() (returns a copy, non-mutating) with .splice() (mutates in place). If you need a copy, use .slice().",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst copy = arr.slice();\ncopy.splice(1, 1, 'X');\n// More explicit but longer",
          concise: "const copy = arr.toSpliced(1, 1, 'X');",
        },
      },
      {
        id: "push-pop",
        fn: ".push() / .pop()",
        desc: ".push() appends elements to the end; .pop() removes and returns the last element. Both mutate.",
        category: "Search, Sort & Mutate",
        subtitle: "Stack operations on the end of the array",
        signature: "arr.push(...items)  |  arr.pop()",
        descLong: "These are the primary stack operations. .push() returns the new array length. .pop() returns the removed element (or undefined for empty arrays). Both mutate the original array. For immutable alternatives, use spread: [...arr, item] for push, arr.slice(0,-1) for pop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .push() / .pop() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest push/pop: add to end and remove from end.\n// STRENGTHS - shows push returns length, pop returns element, mutation.\n// WEAKNESSES- no stack pattern, no immutable alternative, no queue.\n//\n// GOAL: add to the end and remove from the end of an array\nconst stack = [1, 2, 3];\nstack.push(4);  // → returns 4 (new length), stack is now [1, 2, 3, 4]\nstack.pop();    // → returns 4 (removed value), stack is now [1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .push() / .pop() — common patterns you'll see in production.\n// APPROACH  - Combine .push() / .pop() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - use an array as a LIFO stack with push/pop for navigation history.\n// STRENGTHS - covers the 80% case: stack pattern, push/pop pair, real use case.\n// WEAKNESSES- no immutable alternative, no queue, no shift/unshift.\n//\n// GOAL: use an array as a stack (last-in, first-out)\nconst history = [];\nhistory.push('/home');       // user navigates\nhistory.push('/about');\nhistory.push('/contact');\n// WHY: pop removes the last page — like a browser back button\nconst lastPage = history.pop();\n// → '/contact'   history is now ['/home', '/about']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .push() / .pop() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production push/pop patterns: immutable spread for React,\n//             queue with shift/unshift, push.apply for batch append,\n//             and push vs spread vs concat decision guide.\n// STRENGTHS - immutable spread; queue FIFO; batch append with push.apply;\n//             return value gotcha; decision guide.\n// WEAKNESSES- no performance benchmark; no linked list comparison.\n//\n// GOAL: avoid mutating state in React — use spread instead of push\nconst items = ['a', 'b', 'c'];\n// WHY: React won't re-render if you mutate the existing array directly\n// BAD:  items.push('d')           — mutates in place, React won't detect the change\nconst next = [...items, 'd'];   // → ['a', 'b', 'c', 'd']  new array reference\n// Immutable pop: slice(0, -1) or toReversed().pop() trick\nconst withoutLast = items.slice(0, -1); // → ['a', 'b']\n// Queue (FIFO): push to end, shift from front\nconst queue = [];\nqueue.push('task1'); queue.push('task2');\nconst next1 = queue.shift(); // → 'task1' (first in, first out)\n// queue is now ['task2']\n// Batch append: push.apply is faster than spread for very large arrays\nconst target = [1, 2, 3];\nconst source = [4, 5, 6];\ntarget.push(...source); // → [1, 2, 3, 4, 5, 6]\n// For very large arrays: target.push.apply(target, source) avoids stack overflow\n// Decision rule:\n//   add to end, mutation OK                                    -> .push(item)\n//   add to end, immutability required                          -> [...arr, item]\n//   remove from end, mutation OK                               -> .pop()\n//   remove from end, immutability required                     -> .slice(0, -1)\n//   add to front                                               -> .unshift(item) or [item, ...arr]\n//   remove from front (queue)                                  -> .shift()\n//   batch append                                               -> arr.push(...items)\n//   very large batch append                                    -> arr.push.apply(arr, items)\n//\n// Anti-pattern: .push() on React state (mutation not detected);\n//   .shift() on large arrays (O(n) — all indices shift down)."
                  }
        ],
        tips: [
                  "In React/functional code, prefer spread ([...arr, item]) over push to avoid mutating state.",
                  ".push() returns the new length, not the array — a common confusion.",
                  "For queue operations (FIFO), pair .push() with .shift() or use .unshift() with .pop().",
                  ".pop() on an empty array returns undefined, not an error."
        ],
        mistake: "Mutating a React state array with .push() directly — React won't detect the change. Create a new array with spread: setItems([...items, newItem]).",
        shorthand: {
          verbose: "const stack = [];\nstack.push(1); stack.push(2);\nconst top = stack[stack.length - 1];\nstack.splice(stack.length - 1, 1);",
          concise: "const stack = [];\nstack.push(1); stack.push(2);\nconst top = stack.at(-1);\nstack.pop();",
        },
      },
      {
        id: "sort",
        fn: ".sort()",
        desc: "Sorts array elements in place. Without a comparator, sorts as strings — always provide one for numbers.",
        category: "Search, Sort & Mutate",
        subtitle: "In-place sort with optional comparator",
        signature: "arr.sort((a, b) => a - b)",
        descLong: ".sort() mutates the original array and returns it. Without a comparator, elements are converted to strings and sorted lexicographically — this produces wrong results for numbers. The comparator should return negative (a before b), zero (equal), or positive (b before a). Use .toSorted() (ES2023) for a non-mutating sort.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .sort() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest sort: show why comparator is needed for numbers.\n// STRENGTHS - shows default string sort gotcha, numeric comparator fix.\n// WEAKNESSES- no object sorting, no localeCompare, no toSorted.\n//\n// GOAL: sort numbers correctly — always pass a comparator\n[10, 9, 2, 100].sort();               // → [10, 100, 2, 9]  WRONG (string order!)\n[10, 9, 2, 100].sort((a, b) => a - b); // → [2, 9, 10, 100] correct (numeric)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .sort() — common patterns you'll see in production.\n// APPROACH  - Combine .sort() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - sort objects by a string property using localeCompare.\n// STRENGTHS - covers the 80% case: object sorting, localeCompare, accent handling.\n// WEAKNESSES- no multi-key sort, no toSorted, no custom comparators.\n//\n// GOAL: sort an array of objects by a string property\nconst users = [\n  { name: 'Carol' },\n  { name: 'Alice' },\n  { name: 'Bob'   },\n];\n// WHY: localeCompare handles accents, case, and non-ASCII correctly\nusers.sort((a, b) => a.name.localeCompare(b.name));\n// → [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Carol' }]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .sort() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production sort patterns: toSorted for immutability,\n//             multi-key comparator, stable sort, locale-aware sorting,\n//             and sort vs toSorted decision guide.\n// STRENGTHS - toSorted immutability; multi-key sort; stable sort;\n//             locale-aware; decision guide.\n// WEAKNESSES- no Intl.Collator; no performance benchmark.\n//\n// GOAL: sort without mutating the original — use .toSorted()\nconst nums = [3, 1, 4, 1, 5, 9];\n// WHY: .sort() mutates in place — dangerous in React state or shared data\nconst ascending  = nums.toSorted((a, b) => a - b); // → [1, 1, 3, 4, 5, 9]\nconst descending = nums.toSorted((a, b) => b - a); // → [9, 5, 4, 3, 1, 1]\nconsole.log(nums); // → [3, 1, 4, 1, 5, 9]  original unchanged\n// Multi-key sort: sort by last name, then first name\nconst people = [\n  { first: 'John', last: 'Doe' },\n  { first: 'Jane', last: 'Doe' },\n  { first: 'Bob', last: 'Smith' },\n];\nconst sorted = people.toSorted((a, b) => {\n  const lastCmp = a.last.localeCompare(b.last);\n  return lastCmp !== 0 ? lastCmp : a.first.localeCompare(b.first);\n});\n// → [{ Jane, Doe }, { John, Doe }, { Bob, Smith }]\n// Intl.Collator for locale-aware sorting (better performance than localeCompare)\nconst collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });\nconst files = ['file10.txt', 'file2.txt', 'file1.txt'];\nfiles.toSorted(collator.compare); // → ['file1.txt', 'file2.txt', 'file10.txt']\n// Decision rule:\n//   sort numbers, mutation OK                                   -> .sort((a, b) => a - b)\n//   sort numbers, immutability required                         -> .toSorted((a, b) => a - b)\n//   sort strings                                               -> .sort((a, b) => a.localeCompare(b))\n//   sort strings with locale/numeric awareness                  -> Intl.Collator + .toSorted()\n//   sort by multiple keys                                      -> chained comparator with fallback\n//   sort objects by property                                   -> .toSorted((a, b) => a.prop - b.prop)\n//\n// Anti-pattern: .sort() without comparator on numbers (string sort);\n//   .sort() on React state (mutates original)."
                  }
        ],
        tips: [
                  "Always provide a comparator when sorting numbers — default string sort gives wrong results.",
                  "Use .toSorted() (ES2023) to get a sorted copy without mutating the original.",
                  "Use .localeCompare() for string sorting to handle accents and non-ASCII correctly.",
                  "The sort is not guaranteed to be stable in old engines — all modern engines use stable sort."
        ],
        mistake: "Calling .sort() on a number array without a comparator — [10, 9, 2].sort() gives [10, 2, 9] because it compares as strings.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst sorted = arr.slice().sort((a, b) => a - b);\n// More explicit but longer",
          concise: "const sorted = arr.toSorted((a, b) => a - b);",
        },
      },
      {
        id: "flat-flatmap",
        fn: ".flat() / .flatMap()",
        desc: ".flat() flattens nested arrays; .flatMap() maps then flattens one level.",
        category: "Search, Sort & Mutate",
        subtitle: "Flatten nested arrays",
        signature: "arr.flat(depth?)  |  arr.flatMap(fn)",
        descLong: ".flat() recursively flattens to the given depth (default 1). Infinity flattens all levels. .flatMap() is equivalent to .map().flat(1) but more efficient. Common for expanding one item into multiple or removing undefined from mapped results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .flat() / .flatMap() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest flat: flatten nested arrays by depth.\n// STRENGTHS - shows flat() default depth 1, flat(2) for deeper.\n// WEAKNESSES- no flatMap, no Infinity, no sparse array behavior.\n//\n// GOAL: flatten a nested array into a single level\nconst nested = [1, [2, 3], [4, [5]]];\nnested.flat();   // → [1, 2, 3, 4, [5]]   one level deep\nnested.flat(2);  // → [1, 2, 3, 4, 5]     two levels deep"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .flat() / .flatMap() — common patterns you'll see in production.\n// APPROACH  - Combine .flat() / .flatMap() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - split sentences into words with flatMap (map + flatten one level).\n// STRENGTHS - covers the 80% case: flatMap, string split, one-pass flatten.\n// WEAKNESSES- no filter+expand, no flat(Infinity), no sparse array.\n//\n// GOAL: split each sentence into words and get one flat list\nconst sentences = ['Hello World', 'Foo Bar'];\n// WHY: flatMap maps each string to an array of words, then flattens one level\nconst words = sentences.flatMap(s => s.split(' '));\n// → ['Hello', 'World', 'Foo', 'Bar']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .flat() / .flatMap() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production flat/flatMap patterns: filter+expand in one pass,\n//             flat(Infinity) for unknown depth, sparse array hole removal,\n//             recursive flatten, and flat vs flatMap vs reduce decision guide.\n// STRENGTHS - filter+expand; flat(Infinity); sparse hole removal;\n//             recursive flatten; decision guide.\n// WEAKNESSES- no performance benchmark; no tree traversal.\n//\n// GOAL: filter and expand in one pass using flatMap\nconst nums = [1, 2, 3, 4];\n// WHY: returning [] from flatMap is an idiomatic way to drop elements\n// returning [n, n*10] expands one element into two\nconst result = nums.flatMap(n =>\n  n % 2 === 0 ? [n, n * 10] : []\n);\n// → [2, 20, 4, 40]\n// flat(Infinity): flatten deeply nested structures of unknown depth\nconst deep = [1, [2, [3, [4, [5]]]]];\ndeep.flat(Infinity); // → [1, 2, 3, 4, 5]\n// flat() removes sparse array holes\nconst sparse = [1, , 3, , 5];\nsparse.flat(); // → [1, 3, 5]  (holes removed)\n// Recursive tree flatten with flatMap\nclass TreeNode {\n  constructor(value, children = []) { this.value = value; this.children = children; }\n}\nconst tree = new TreeNode(1, [\n  new TreeNode(2, [new TreeNode(4)]),\n  new TreeNode(3),\n]);\nfunction flattenTree(node) {\n  return [node.value, ...node.children.flatMap(flattenTree)];\n}\nflattenTree(tree); // → [1, 2, 4, 3]\n// Decision rule:\n//   flatten one level                                         -> .flat()\n//   flatten N levels                                          -> .flat(n)\n//   flatten unknown depth                                      -> .flat(Infinity)\n//   map + flatten one level                                    -> .flatMap(fn)\n//   filter + expand in one pass                                -> .flatMap(n => cond ? [items] : [])\n//   remove sparse holes                                        -> .flat()\n//   recursive tree flatten                                     -> recursive flatMap\n//\n// Anti-pattern: .map(fn).flat() when .flatMap(fn) does it in one pass;\n//   .flat(Infinity) when depth is known (unnecessary overhead)."
                  }
        ],
        tips: [
                  ".flatMap(fn) is more efficient than .map(fn).flat() — prefer it for combined map+flatten.",
                  "Returning [] from a flatMap callback is an idiomatic way to filter and expand simultaneously.",
                  "flat(Infinity) is useful for deeply nested structures of unknown depth.",
                  ".flat() removes empty slots in sparse arrays."
        ],
        mistake: "Chaining .map().flat() when .flatMap() does the same thing more efficiently and readably.",
        shorthand: {
          verbose: "const result = [];\nfor (const sub of nested) {\n  for (const x of sub) {\n    result.push(x * 2);\n  }\n}",
          concise: "const result = nested.flatMap(sub => sub.map(x => x * 2));",
        },
      },
    ],
  },

  // ── Section 3: Modern & Typed Arrays ─────────────────────────────────────────
  {
    id: "modern-typed-arrays",
    title: "Modern & Typed Arrays",
    entries: [
      {
        id: "tosorted",
        fn: ".toSorted()",
        desc: "Non-mutating version of .sort() — returns a new sorted array without modifying the original.",
        category: "Modern & Typed Arrays",
        subtitle: "Immutable array sort",
        signature: "arr.toSorted(compareFn?)",
        descLong: ".toSorted() (ES2023) is the non-mutating counterpart to .sort(). Returns a new sorted array while leaving the original unchanged. Takes the same comparator function as .sort(). Essential for React state updates and functional programming patterns where immutability is required.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .toSorted() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest toSorted: sort without mutating original.\n// STRENGTHS - shows toSorted with comparator, original preserved.\n// WEAKNESSES- no multi-direction, no React state, no chaining.\n//\n// GOAL: sort an array without changing the original\nconst nums   = [3, 1, 4, 1, 5];\nconst sorted = nums.toSorted((a, b) => a - b);\n// → [1, 1, 3, 4, 5]\nconsole.log(nums); // → [3, 1, 4, 1, 5]  original unchanged"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .toSorted() — common patterns you'll see in production.\n// APPROACH  - Combine .toSorted() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - sort in both directions without side effects on source.\n// STRENGTHS - covers the 80% case: ascending/descending, no mutation.\n// WEAKNESSES- no React state, no multi-key, no chaining.\n//\n// GOAL: sort in both directions without side effects\nconst scores = [88, 95, 72, 100, 60];\nconst lowest  = scores.toSorted((a, b) => a - b);\nconst highest = scores.toSorted((a, b) => b - a);\n// WHY: two separate sorted views from the same source, neither modifies scores\n// → lowest:  [60, 72, 88, 95, 100]\n// → highest: [100, 95, 88, 72, 60]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .toSorted() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production toSorted patterns: React state update,\n//             chained immutable operations, derived sorted views,\n//             and toSorted vs [...arr].sort() decision guide.\n// STRENGTHS - React state update; chained immutables; derived views;\n//             performance comparison; decision guide.\n// WEAKNESSES- no Intl.Collator; no benchmark numbers.\n//\n// GOAL: update React state with a sorted list — no spread wrapper needed\nconst [items, setItems] = useState(['banana', 'apple', 'cherry']);\nfunction sortAlpha() {\n  // WHY: toSorted returns a new array — React sees a new reference and re-renders\n  // Old pattern: setItems([...items].sort(...)) — extra spread allocation not needed\n  setItems(items.toSorted((a, b) => a.localeCompare(b)));\n}\n// Chained immutable operations: sort + filter + map in one pipeline\nconst data = [5, 3, 8, 1, 4, 9];\nconst top3 = data\n  .toSorted((a, b) => b - a)  // descending\n  .slice(0, 3)                 // top 3\n  .map(n => ({ value: n }));   // wrap in objects\n// → [{ value: 9 }, { value: 8 }, { value: 5 }]\n// Derived sorted view: keep original, render sorted without mutation\nconst products = [{ name: 'Z', price: 10 }, { name: 'A', price: 30 }];\nconst byPrice = products.toSorted((a, b) => a.price - b.price);\n// → [{ name: 'Z', price: 10 }, { name: 'A', price: 30 }]\n// Decision rule:\n//   sort + immutability required                                 -> .toSorted(cmp)\n//   sort + mutation acceptable                                   -> .sort(cmp)\n//   React state sort                                             -> .toSorted(cmp)\n//   sorted + sliced + mapped pipeline                            -> chain .toSorted().slice().map()\n//   old pattern [...arr].sort()                                  -> replace with .toSorted()\n//\n// Anti-pattern: [...arr].sort() when .toSorted() is available;\n//   .sort() on React state (mutates original, no re-render)."
                  }
        ],
        tips: [
                  ".toSorted() returns a new array — safe for React state updates without wrapping in spread.",
                  "Takes the same comparator function as .sort() — (a, b) => a - b for ascending numbers.",
                  "More idiomatic than [...arr].sort() for immutable code.",
                  "Available in Node 20+, all modern browsers since 2024."
        ],
        mistake: "Still using [...arr].sort() for React state — use arr.toSorted() directly. It's cleaner and purpose-built for immutability.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst sorted = arr.slice().sort((a, b) => a - b);\n// More explicit but longer",
          concise: "const sorted = arr.toSorted((a, b) => a - b);",
        },
      },
      {
        id: "toreversed",
        fn: ".toReversed()",
        desc: "Non-mutating version of .reverse() — returns a new reversed array without modifying the original.",
        category: "Modern & Typed Arrays",
        subtitle: "Immutable array reverse",
        signature: "arr.toReversed()",
        descLong: ".toReversed() (ES2023) is the non-mutating counterpart to .reverse(). Returns a new array with elements in reversed order, leaving the original array unchanged. No comparator function needed — it's a pure reverse operation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .toReversed() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest toReversed: reverse without mutating original.\n// STRENGTHS - shows toReversed, original preserved, no args needed.\n// WEAKNESSES- no chaining, no React state, no performance notes.\n//\n// GOAL: reverse an array without modifying the original\nconst nums     = [1, 2, 3, 4, 5];\nconst reversed = nums.toReversed();\n// → [5, 4, 3, 2, 1]\nconsole.log(nums); // → [1, 2, 3, 4, 5]  original unchanged"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .toReversed() — common patterns you'll see in production.\n// APPROACH  - Combine .toReversed() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - reverse a feed for display without mutating source.\n// STRENGTHS - covers the 80% case: reverse chronological, both views available.\n// WEAKNESSES- no chaining, no React state, no with() for index update.\n//\n// GOAL: show a feed in reverse chronological order\nconst events = ['login', 'view_page', 'add_to_cart', 'checkout'];\n// WHY: toReversed leaves the source array intact — we can display it both ways\nconst latestFirst = events.toReversed();\n// → ['checkout', 'add_to_cart', 'view_page', 'login']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .toReversed() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production toReversed patterns: chained immutable\n//             operations, React state update, pagination with\n//             toReversed + slice, and toReversed vs reverse decision guide.\n// STRENGTHS - chained immutables; React state; pagination; decision guide.\n// WEAKNESSES- no benchmark; no with() integration.\n//\n// GOAL: chain immutable operations cleanly\nconst nums = [3, 1, 4, 1, 5, 9];\n// WHY: toSorted + toReversed chains without any intermediate mutation\nconst result = nums\n  .toSorted((a, b) => a - b)   // ascending first\n  .toReversed();                // then flip to descending\n// → [9, 5, 4, 3, 1, 1]\n// React state: reverse a list immutably\nconst [items, setItems] = useState(['first', 'second', 'third']);\nfunction reverseList() {\n  setItems(items.toReversed()); // new reference → React re-renders\n}\n// Pagination: reverse + slice for \"latest N items\" view\nconst log = ['entry1', 'entry2', 'entry3', 'entry4', 'entry5'];\nconst latest3 = log.toReversed().slice(0, 3);\n// → ['entry5', 'entry4', 'entry3']\n// Immutable update + reverse: change one item, then reverse\nconst updated = nums.with(0, 99).toReversed();\n// → [9, 5, 1, 4, 1, 99]  (with() replaces index 0, then reverse)\n// Decision rule:\n//   reverse + immutability required                               -> .toReversed()\n//   reverse + mutation acceptable                                -> .reverse()\n//   React state reverse                                          -> .toReversed()\n//   latest N items                                               -> .toReversed().slice(0, n)\n//   sort descending via toSorted + toReversed                    -> chain both\n//   replace + reverse                                            -> .with(i, v).toReversed()\n//\n// Anti-pattern: [...arr].reverse() when .toReversed() is available;\n//   .reverse() on React state (mutates original, no re-render)."
                  }
        ],
        tips: [
                  "Perfect for React state updates — no need for spread wrapping.",
                  "Chainable with other immutable methods like .toSorted() and .toSpliced().",
                  ".reverse() mutates; .toReversed() returns a new array — match your intent.",
                  "Available in Node 20+, all modern browsers since 2024."
        ],
        mistake: "Using [...arr].reverse() for immutable reversal — use arr.toReversed() instead. It's clearer and avoids unnecessary array allocation.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst reversed = arr.slice().reverse();\n// More explicit but longer",
          concise: "const reversed = arr.toReversed();",
        },
      },
      {
        id: "tospliced",
        fn: ".toSpliced()",
        desc: "Non-mutating version of .splice() — returns a new array with inserted, replaced, or removed elements.",
        category: "Modern & Typed Arrays",
        subtitle: "Immutable array splice",
        signature: "arr.toSpliced(start, deleteCount?, ...items)",
        descLong: ".toSpliced() (ES2023) is the non-mutating counterpart to .splice(). Returns a new array with elements added, removed, or replaced at the specified index. Takes the same arguments as .splice() but leaves the original unchanged. Chainable with other immutable methods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .toSpliced() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest toSpliced: remove element by index immutably.\n// STRENGTHS - shows toSpliced with start + deleteCount, original preserved.\n// WEAKNESSES- no insert, no replace, no React state, no with().\n//\n// GOAL: remove an element by index without mutating the original\nconst arr    = ['a', 'b', 'c', 'd'];\nconst result = arr.toSpliced(1, 1); // remove 1 element at index 1\n// → ['a', 'c', 'd']\nconsole.log(arr); // → ['a', 'b', 'c', 'd']  original unchanged"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .toSpliced() — common patterns you'll see in production.\n// APPROACH  - Combine .toSpliced() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - insert and replace elements immutably with toSpliced.\n// STRENGTHS - covers the 80% case: insert (deleteCount 0), replace, multiple items.\n// WEAKNESSES- no React state, no with(), no negative index.\n//\n// GOAL: insert and replace elements immutably\nconst arr = ['a', 'b', 'c', 'd'];\n// WHY: same args as .splice() but returns a new array instead of mutating\nconst withInsert  = arr.toSpliced(1, 0, 'X');       // → ['a', 'X', 'b', 'c', 'd']\nconst withReplace = arr.toSpliced(1, 1, 'Y', 'Z');  // → ['a', 'Y', 'Z', 'c', 'd']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .toSpliced() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production toSpliced patterns: React state update by index,\n//             with() for single-element swap, chained immutable pipeline,\n//             and toSpliced vs splice vs with decision guide.\n// STRENGTHS - React state update; with() for single swap; chained pipeline;\n//             negative index; decision guide.\n// WEAKNESSES- no benchmark; no filter comparison.\n//\n// GOAL: update one item in a React state array by index\nconst [list, setList] = useState(['apple', 'banana', 'cherry']);\nfunction updateItem(index, newValue) {\n  // WHY: toSpliced replaces exactly one element and returns a fresh array\n  // React sees the new reference and re-renders\n  setList(list.toSpliced(index, 1, newValue));\n}\n// .with() for simpler single-element replacement (ES2023)\nconst arr = ['a', 'b', 'c'];\nconst updated = arr.with(1, 'X'); // → ['a', 'X', 'c']  (no deleteCount needed)\n// Remove item by value (find index, then toSpliced)\nfunction removeByValue(items, value) {\n  const idx = items.indexOf(value);\n  return idx !== -1 ? items.toSpliced(idx, 1) : items;\n}\n// Chained immutable pipeline: remove + insert + sort\nconst data = [3, 1, 4, 1, 5];\nconst result = data\n  .toSpliced(2, 1)           // remove index 2 → [3, 1, 1, 5]\n  .toSpliced(1, 0, 9)        // insert 9 at index 1 → [3, 9, 1, 1, 5]\n  .toSorted((a, b) => a - b); // sort → [1, 1, 3, 5, 9]\n// Decision rule:\n//   remove by index, immutability required                       -> .toSpliced(start, count)\n//   replace single element by index                              -> .with(index, value)\n//   insert at position, immutability required                    -> .toSpliced(start, 0, ...items)\n//   replace at position, immutability required                   -> .toSpliced(start, 1, ...items)\n//   remove by value                                             -> find index + .toSpliced()\n//   React state array update by index                           -> .toSpliced() or .with()\n//   mutation acceptable                                         -> .splice()\n//\n// Anti-pattern: .splice() on React state + spread wrapper;\n//   .toSpliced(i, 1, v) when .with(i, v) is simpler."
                  }
        ],
        tips: [
                  "Perfect for React state updates — immutable by default.",
                  "Takes the same arguments as .splice() — same behavior, no mutation.",
                  "Chainable with .toSorted(), .toReversed(), etc.",
                  "Also consider .with(index, value) for single-element replacement."
        ],
        mistake: "Using .splice() on React state and then wrapping in a spread — use .toSpliced() directly. It's immutable and avoids double-copying.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst copy = arr.slice();\ncopy.splice(1, 2);\n// More explicit but longer",
          concise: "const copy = arr.toSpliced(1, 2);",
        },
      },
      {
        id: "at",
        fn: ".at()",
        desc: "Access array elements by index, including negative indices counting from the end.",
        category: "Modern & Typed Arrays",
        subtitle: "Indexed access with negative support",
        signature: "arr.at(index)  — negative counts from end",
        descLong: ".at() works like bracket notation but accepts negative indices: -1 is the last element, -2 is second-to-last. More readable than arr[arr.length - 1] for tail access. Works on arrays and strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .at() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest .at(): access elements with negative indices.\n// STRENGTHS - shows .at(0), .at(-1), .at(-2) for first/last/second-to-last.\n// WEAKNESSES- no string usage, no TypedArray, no out-of-bounds.\n//\n// GOAL: access elements from the end using negative indices\nconst arr = ['a', 'b', 'c', 'd', 'e'];\narr.at(0);   // → 'a'   (first element)\narr.at(-1);  // → 'e'   (last element)\narr.at(-2);  // → 'd'   (second to last)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .at() — common patterns you'll see in production.\n// APPROACH  - Combine .at() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - use .at(-1) on strings for last character and file extension.\n// STRENGTHS - covers the 80% case: string .at(-1), split + at for extension.\n// WEAKNESSES- no TypedArray, no out-of-bounds, no chained .at().\n//\n// GOAL: get the last character of a string — works on strings too\nconst filename = 'report_2024.csv';\n// WHY: .at(-1) is cleaner than filename[filename.length - 1]\nconst lastChar = filename.at(-1);\n// → 'v'\nconst ext = filename.split('.').at(-1);\n// → 'csv'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .at() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production .at() patterns: replace arr[length-1],\n//             TypedArray access, out-of-bounds safety, chained .at()\n//             with split/pop, and .at() vs bracket notation decision guide.\n// STRENGTHS - replaces verbose pattern; TypedArray support; out-of-bounds\n//             safety; chained operations; decision guide.\n// WEAKNESSES- no benchmark; no iterator protocol.\n//\n// GOAL: replace arr[arr.length - 1] with the cleaner .at(-1) pattern\nconst history = ['page1', 'page2', 'page3'];\n// Old way — verbose and fragile:\nconst last = history[history.length - 1]; // → 'page3'\n// WHY: .at(-1) is shorter, reads as intent, and works on strings and TypedArrays too\nconst current = history.at(-1);           // → 'page3'\n// TypedArray: .at() works on Uint8Array, Float32Array, etc.\nconst bytes = new Uint8Array([10, 20, 30]);\nbytes.at(-1); // → 30\n// Out-of-bounds: returns undefined (not thrown error)\nconst small = [1, 2, 3];\nsmall.at(10);  // → undefined\nsmall.at(-10); // → undefined\n// Chained: split + at for parsing\nconst url = 'https://example.com/users/42/posts';\nconst userId = url.split('/').at(-2); // → '42'\nconst resource = url.split('/').at(-1); // → 'posts'\n// Decision rule:\n//   access last element                                         -> .at(-1)\n//   access first element                                        -> .at(0) or arr[0]\n//   access Nth from end                                         -> .at(-N)\n//   access on strings                                           -> str.at(-1)\n//   access on TypedArrays                                       -> typedArr.at(i)\n//   might be out-of-bounds                                      -> .at() returns undefined\n//   performance-critical hot path                               -> bracket notation (slightly faster)\n//\n// Anti-pattern: arr[arr.length - 1] when .at(-1) is available;\n//   .at() in a tight loop where bracket notation is faster."
                  }
        ],
        tips: [
                  ".at(-1) replaces the common arr[arr.length - 1] pattern cleanly.",
                  "Returns undefined for out-of-bounds indices — same as bracket notation.",
                  "Works on TypedArrays too: Int32Array, Float64Array, etc.",
                  "String.at(-1) is great for getting the last character."
        ],
        mistake: "Using arr[arr.length - 1] when arr.at(-1) is available — the negative index form is more readable and less error-prone.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst last = arr[arr.length - 1];\nconst second = arr[arr.length - 2];\n// More explicit but longer",
          concise: "const last = arr.at(-1);\nconst second = arr.at(-2);",
        },
      },
      {
        id: "object-groupby",
        fn: "Object.groupBy()",
        desc: "Group array elements into an object or Map by a key derived from each element.",
        category: "Modern & Typed Arrays",
        subtitle: "Group arrays into keyed buckets",
        signature: "Object.groupBy(array, keyFn)",
        descLong: "Object.groupBy (ES2024) replaces the common reduce-to-object grouping pattern. The callback returns the key; elements with the same key end up in the same array. Map.groupBy does the same but returns a Map, allowing any key type including objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.groupBy() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Object.groupBy: group by a derived key.\n// STRENGTHS - shows groupBy with string length, object result.\n// WEAKNESSES- no object grouping, no Map.groupBy, no reduce comparison.\n//\n// GOAL: group an array into buckets by a shared property\nconst words = ['one', 'two', 'three', 'four', 'five'];\nconst byLength = Object.groupBy(words, w => w.length);\n// → { 3: ['one', 'two'], 4: ['four', 'five'], 5: ['three'] }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.groupBy() — common patterns you'll see in production.\n// APPROACH  - Combine Object.groupBy() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - group employees by department with Object.groupBy.\n// STRENGTHS - covers the 80% case: object property grouping, accessing buckets.\n// WEAKNESSES- no Map.groupBy, no computed keys, no reduce replacement.\n//\n// GOAL: group employees by their department\nconst people = [\n  { name: 'Alice', dept: 'Eng' },\n  { name: 'Bob',   dept: 'HR'  },\n  { name: 'Carol', dept: 'Eng' },\n];\n// WHY: groupBy is more readable than a manual reduce pattern\nconst byDept = Object.groupBy(people, p => p.dept);\n// → { Eng: [{Alice}, {Carol}], HR: [{Bob}] }\nbyDept.Eng.map(p => p.name); // → ['Alice', 'Carol']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.groupBy() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production groupBy patterns: Map.groupBy for non-string keys,\n//             computed grouping keys, reduce replacement comparison,\n//             and Object.groupBy vs Map.groupBy vs reduce decision guide.\n// STRENGTHS - Map.groupBy; computed keys; reduce replacement;\n//             null-prototype object; decision guide.\n// WEAKNESSES- no lazy grouping; no streaming data.\n//\n// GOAL: use Map.groupBy when keys aren't strings\nconst items = ['apple', 'banana', 'avocado', 'blueberry'];\n// WHY: Map.groupBy supports any key type — here we key by first letter\nconst grouped = Map.groupBy(items, s => s[0]);\n// Map { 'a' => ['apple', 'avocado'], 'b' => ['banana', 'blueberry'] }\n// Computed grouping key: group by price range\nconst products = [\n  { name: 'Pen', price: 2 },\n  { name: 'Book', price: 15 },\n  { name: 'Laptop', price: 999 },\n  { name: 'Mouse', price: 25 },\n];\nconst byRange = Object.groupBy(products, p => {\n  if (p.price < 10) return 'cheap';\n  if (p.price < 100) return 'mid';\n  return 'premium';\n});\n// → { cheap: [{Pen}], mid: [{Book}, {Mouse}], premium: [{Laptop}] }\n// Equivalent reduce pattern (what groupBy replaces)\nconst byRangeReduce = products.reduce((acc, p) => {\n  const key = p.price < 10 ? 'cheap' : p.price < 100 ? 'mid' : 'premium';\n  (acc[key] ??= []).push(p);\n  return acc;\n}, {});\n// Result object has no prototype (Object.create(null))\n// → no inherited properties like toString, hasOwnProperty\nconst safe = Object.groupBy([1, 2, 3], n => n % 2 === 0 ? 'even' : 'odd');\n// 'toString' in safe → false (no prototype pollution risk)\n// Decision rule:\n//   group by string/symbol key                                     -> Object.groupBy()\n//   group by object/non-string key                                 -> Map.groupBy()\n//   group by computed condition                                    -> Object.groupBy(arr, fn)\n//   need prototype-free result                                     -> Object.groupBy (already null-proto)\n//   need to iterate groups in insertion order                       -> Map.groupBy (Map preserves order)\n//   pre-ES2024 environment                                         -> reduce with ??= pattern\n//\n// Anti-pattern: manual reduce grouping when Object.groupBy is available;\n//   Object.groupBy with object keys (they coerce to '[object Object]')."
                  }
        ],
        tips: [
                  "Object.groupBy keys must be strings or symbols — use Map.groupBy for object keys.",
                  "The result object has no prototype (Object.create(null)) — no inherited property conflicts.",
                  "Available in Node 21+ and all modern browsers (2024).",
                  "Replaces the popular _.groupBy from lodash for most use cases."
        ],
        mistake: "Still writing manual reduce-to-object grouping when Object.groupBy is available — the built-in is cleaner and more readable.",
        shorthand: {
          verbose: "const groups = {};\nfor (const item of items) {\n  (groups[item.type] ??= []).push(item);\n}",
          concise: "const groups = Object.groupBy(items, x => x.type);",
        },
      },
      {
        id: "findlast",
        fn: ".findLast() / .findLastIndex()",
        desc: "Search from the end of the array for the last element matching a predicate.",
        category: "Modern & Typed Arrays",
        subtitle: "Reverse-direction element search",
        signature: "arr.findLast(predicate)  |  arr.findLastIndex(predicate)",
        descLong: "findLast() and findLastIndex() (ES2023) search from the end of the array — the reverse of find() and findIndex(). Returns the last matching element or its index. Useful when you want the most recent match in a time-ordered array.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .findLast() / .findLastIndex() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest findLast: find last matching element from end.\n// STRENGTHS - shows findLast and findLastIndex, reverse search.\n// WEAKNESSES- no object search, no performance, no findLastIndex detail.\n//\n// GOAL: find the last element that matches a condition\nconst nums = [1, 2, 3, 4, 3, 2, 1];\nnums.findLast(n => n > 2);      // → 3  (last one > 2, at index 4)\nnums.findLastIndex(n => n > 2); // → 4  (its index)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .findLast() / .findLastIndex() — common patterns you'll see in production.\n// APPROACH  - Combine .findLast() / .findLastIndex() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - get most recent event of a type using findLast on time-ordered array.\n// STRENGTHS - covers the 80% case: object search, most-recent match, event log.\n// WEAKNESSES- no findLastIndex, no performance, no reverse+find comparison.\n//\n// GOAL: get the most recent event of a specific type\nconst events = [\n  { type: 'click',  time: 1 },\n  { type: 'scroll', time: 2 },\n  { type: 'click',  time: 3 },\n];\n// WHY: findLast searches from the end — the last match is the most recent\nconst lastClick = events.findLast(e => e.type === 'click');\n// → { type: 'click', time: 3 }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .findLast() / .findLastIndex() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production findLast patterns: avoid reverse+find allocation,\n//             findLastIndex for update-in-place, log analysis, and\n//             findLast vs reverse+find vs find decision guide.\n// STRENGTHS - avoids allocation; findLastIndex for updates; log analysis;\n//             performance comparison; decision guide.\n// WEAKNESSES- no benchmark numbers; no binary search alternative.\n//\n// GOAL: avoid reversing the array just to call find()\nconst log = [{ status: 'ok' }, { status: 'error' }, { status: 'ok' }];\n// Old (inefficient): creates a copy, reverses it, then searches\nconst old = [...log].reverse().find(e => e.status === 'error');\n// WHY: findLast avoids allocating a reversed copy\nconst latest = log.findLast(e => e.status === 'error');\n// → { status: 'error' }\n// findLastIndex: get index for update-in-place\nconst errorIdx = log.findLastIndex(e => e.status === 'error');\n// → 1\nif (errorIdx !== -1) log[errorIdx].resolved = true;\n// Log analysis: find last successful operation before a failure\nconst timeline = [\n  { op: 'read', ok: true },\n  { op: 'write', ok: true },\n  { op: 'read', ok: false },\n  { op: 'write', ok: true },\n];\nconst lastGoodBeforeFailure = timeline\n  .slice(0, timeline.findLastIndex(e => !e.ok))\n  .findLast(e => e.ok);\n// → { op: 'write', ok: true }\n// Decision rule:\n//   last matching element                                        -> .findLast(predicate)\n//   index of last match                                          -> .findLastIndex(predicate)\n//   first matching element                                       -> .find(predicate)\n//   most recent in time-ordered array                             -> .findLast()\n//   avoid array allocation                                       -> .findLast() not [...arr].reverse().find()\n//   need to update last match in place                           -> .findLastIndex() + bracket assignment\n//\n// Anti-pattern: [...arr].reverse().find() when .findLast() avoids allocation;\n//   .findLast() when you need the first match (use .find())."
                  }
        ],
        tips: [
                  "findLast() is semantically clearer than reversing then finding.",
                  "Returns undefined / -1 (like find/findIndex) when nothing matches.",
                  "Useful for log/event arrays where you want the most recent occurrence.",
                  "Available in Node 20+ and all modern browsers."
        ],
        mistake: "Creating a reversed copy just to use find() when findLast() does the same thing without allocation.",
        shorthand: {
          verbose: "let last;\nfor (let i = arr.length - 1; i >= 0; i--) {\n  if (arr[i].ok) { last = arr[i]; break; }\n}",
          concise: "const last = arr.findLast(x => x.ok);",
        },
      },
      {
        id: "arraybuffer",
        fn: "ArrayBuffer",
        desc: "Fixed-length raw binary memory buffers — the foundation for working with binary data in JavaScript.",
        category: "Modern & Typed Arrays",
        subtitle: "Raw binary data allocation",
        signature: "new ArrayBuffer(byteLength)",
        descLong: "ArrayBuffer represents a fixed-size raw binary memory block. It cannot be directly read or written — use TypedArrays or DataView as views into it. Multiple views can share the same buffer. Foundation for WebGL, WebAudio, File I/O, and network protocols.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ArrayBuffer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest ArrayBuffer: allocate raw binary memory.\n// STRENGTHS - shows ArrayBuffer allocation, byteLength, need for view.\n// WEAKNESSES- no TypedArray view, no DataView, no shared buffer.\n//\n// GOAL: allocate a block of raw binary memory\nconst buffer = new ArrayBuffer(16); // 16 bytes of memory\nconsole.log(buffer.byteLength);     // → 16\n// NOTE: you can't read or write to the buffer directly — you need a view"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ArrayBuffer — common patterns you'll see in production.\n// APPROACH  - Combine ArrayBuffer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - create a Uint8Array view to read and write buffer bytes.\n// STRENGTHS - covers the 80% case: TypedArray view, byte read/write, value range.\n// WEAKNESSES- no DataView, no endianness, no multiple views.\n//\n// GOAL: create a typed view to read and write the buffer\nconst buffer = new ArrayBuffer(8);\n// WHY: Uint8Array is a \"window\" into the buffer — treats each byte as 0–255\nconst view = new Uint8Array(buffer);\nview[0] = 255;\nview[1] = 128;\nconsole.log(view[0]); // → 255\nconsole.log(view[1]); // → 128"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ArrayBuffer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production ArrayBuffer patterns: DataView for byte-level\n//             control, multiple views sharing one buffer, endianness\n//             handling, SharedArrayBuffer for workers, and\n//             ArrayBuffer vs TypedArray decision guide.\n// STRENGTHS - DataView with endianness; multiple shared views;\n//             SharedArrayBuffer; byte offset views; decision guide.\n// WEAKNESSES- no Atomics; no transferable; no WebAssembly memory.\n//\n// GOAL: use DataView for precise byte-level control (e.g. binary protocols)\nconst buffer = new ArrayBuffer(8);\nconst dv     = new DataView(buffer);\n// WHY: DataView lets you control byte order (endianness) explicitly\ndv.setFloat32(0, 3.14, true);    // write 32-bit float at byte 0, little-endian\ndv.getFloat32(0, true);          // → 3.14\n// Multiple views share the same buffer — writes visible across views\nconst u8  = new Uint8Array(buffer);   // 8 elements (1 byte each)\nconst u32 = new Uint32Array(buffer);  // 2 elements (4 bytes each)\nu8[0] = 0xFF;\nconsole.log(u32[0]); // → 255  (same first 4 bytes, different interpretation)\n// Byte offset: create a view starting at a specific byte\nconst offset = new Uint8Array(buffer, 2, 4); // 4 bytes starting at offset 2\n// SharedArrayBuffer: shared memory between main thread and workers\n// (requires cross-origin isolation: COOP/COEP headers)\nconst shared = new SharedArrayBuffer(1024);\nconst sharedView = new Int32Array(shared);\n// Worker can access the same sharedView — use Atomics for safe access\n// Transfer ArrayBuffer to worker (zero-copy)\n// postMessage(buffer, [buffer]); // buffer is neutered in main thread after transfer\n// Decision rule:\n//   raw binary allocation                                       -> new ArrayBuffer(n)\n//   simple byte read/write                                      -> Uint8Array(buffer)\n//   precise byte-level control with endianness                   -> DataView(buffer)\n//   multiple interpretations of same memory                      -> multiple TypedArray views\n//   shared memory between threads                                -> SharedArrayBuffer + Atomics\n//   zero-copy transfer to worker                                 -> transfer ArrayBuffer\n//   resizable buffer                                             -> new ArrayBuffer({ maxByteLength })\n//\n// Anti-pattern: reading ArrayBuffer directly (no view);\n//   TypedArray when you need mixed types (use DataView)."
                  }
        ],
        tips: [
                  "ArrayBuffer itself is not readable — always use TypedArray or DataView views.",
                  "Multiple typed arrays can view the same buffer — they share underlying memory.",
                  "byteLength is immutable — you cannot resize an ArrayBuffer.",
                  "Used internally by File, Blob, fetch responses, and Canvas pixel data."
        ],
        mistake: "Trying to read directly from ArrayBuffer — you must create a view (Uint8Array, DataView, etc.) to access the data.",
        shorthand: {
          verbose: "const buf = new ArrayBuffer(16);\nconst view = new DataView(buf);\nview.setInt32(0, 42);",
          concise: "const buf = new ArrayBuffer(16);\nconst i32 = new Int32Array(buf);\ni32[0] = 42;",
        },
      },
      {
        id: "typed-arrays",
        fn: "TypedArrays",
        desc: "Typed array views into ArrayBuffers with specific numeric types (Uint8Array, Float32Array, etc.).",
        category: "Modern & Typed Arrays",
        subtitle: "Typed views of binary data",
        signature: "new Uint8Array(buffer)  |  new Float32Array(buffer)",
        descLong: "TypedArrays (Uint8Array, Int16Array, Float32Array, etc.) are views into an ArrayBuffer with a specific data type and endianness. Unlike regular arrays, they have fixed length and contain only numbers. They provide efficient access to binary data for image processing, audio, WebGL, and network I/O.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TypedArrays — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest TypedArray: store typed numbers in a fixed-size buffer.\n// STRENGTHS - shows Uint8Array creation, value assignment, value range 0–255.\n// WEAKNESSES- no ArrayBuffer backing, no TextEncoder, no multiple views.\n//\n// GOAL: store a sequence of typed numbers in a fixed-size buffer\nconst bytes = new Uint8Array(4); // 4 bytes, values 0–255 each\nbytes[0] = 255;\nbytes[1] = 128;\nbytes[2] = 0;\nconsole.log(bytes[0]); // → 255"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TypedArrays — common patterns you'll see in production.\n// APPROACH  - Combine TypedArrays with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - encode/decode strings with TextEncoder and TextDecoder.\n// STRENGTHS - covers the 80% case: string ↔ Uint8Array, UTF-8 encoding.\n// WEAKNESSES- no ArrayBuffer sharing, no clamped arrays, no subarray.\n//\n// GOAL: encode a string to bytes and decode it back\n// WHY: TypedArrays are the native way to handle raw string bytes in JS\nconst encoder = new TextEncoder();\nconst decoder = new TextDecoder();\nconst encoded = encoder.encode('hello'); // → Uint8Array [104, 101, 108, 108, 111]\nconst decoded = decoder.decode(encoded); // → 'hello'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TypedArrays — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production TypedArray patterns: multiple views on same\n//             buffer, subarray vs slice, clamped arrays for canvas,\n//             array methods on TypedArrays, and TypedArray vs regular\n//             array decision guide.\n// STRENGTHS - multiple shared views; subarray vs slice; Uint8ClampedArray;\n//             array methods; decision guide.\n// WEAKNESSES- no WebGL buffer; no performance benchmark.\n//\n// GOAL: create different typed views over the same buffer\nconst buffer = new ArrayBuffer(8);\nconst u8  = new Uint8Array(buffer);   // 8 elements (1 byte each)\nconst u32 = new Uint32Array(buffer);  // 2 elements (4 bytes each)\n// WHY: both views share the same memory — a write in one is visible in the other\nu8[0] = 0xFF;\nconsole.log(u32[0]); // → 255  (same first 4 bytes, different interpretation)\n// subarray vs slice: subarray shares memory, slice copies\nconst view = new Uint8Array([1, 2, 3, 4, 5]);\nconst sub = view.subarray(1, 3);   // → [2, 3]  shares buffer with view\nconst copied = view.slice(1, 3);   // → [2, 3]  new copy, independent\nsub[0] = 99;\nconsole.log(view[1]); // → 99  (subarray shares memory)\nconsole.log(copied[0]); // → 2  (slice is independent)\n// Uint8ClampedArray: values clamped to 0–255 (not wrapped)\n// Used by Canvas API for pixel manipulation\nconst clamped = new Uint8ClampedArray(4);\nclamped[0] = 300; // → 255 (clamped, not 300 % 256 = 44)\nclamped[1] = -10; // → 0   (clamped)\n// TypedArrays support array methods (return TypedArray, not regular array)\nconst doubled = new Uint8Array([1, 2, 3]).map(n => n * 2); // → Uint8Array [2, 4, 6]\nconst filtered = new Int32Array([1, 2, 3, 4]).filter(n => n > 2); // → Int32Array [3, 4]\nconst sum = new Float32Array([1.5, 2.5, 3.0]).reduce((a, b) => a + b, 0); // → 7.0\n// Decision rule:\n//   fixed-size numeric data                                      -> TypedArray\n//   byte-level data (network, file I/O)                          -> Uint8Array\n//   canvas pixel manipulation                                    -> Uint8ClampedArray\n//   floating point precision                                     -> Float64Array\n//   view into existing buffer without copy                       -> .subarray()\n//   copy a portion of TypedArray                                  -> .slice()\n//   string ↔ bytes                                               -> TextEncoder/TextDecoder\n//   variable-length data                                         -> regular array\n//\n// Anti-pattern: .push() on TypedArray (doesn't exist);\n//   regular array for fixed numeric data (wastes memory)."
                  }
        ],
        tips: [
                  "TypedArrays have fixed length — .push() and .pop() don't exist.",
                  "All elements must be numbers — TypedArray isn't suitable for mixed types.",
                  "Use TextEncoder/TextDecoder for string ↔ Uint8Array conversion.",
                  "TypedArrays support .map(), .filter(), .reduce(), and other array methods."
        ],
        mistake: "Treating a TypedArray like a regular array — it has fixed length and you cannot push/pop. Create a new one if you need to change size.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst nums = [1, 2, 3, 4];\nconst doubled = nums.map(x => x * 2);\n// More explicit but longer",
          concise: "const nums = new Int32Array([1, 2, 3, 4]);\nconst doubled = nums.map(x => x * 2);",
        },
      },
    ],
  },
]

export default { meta, sections }
