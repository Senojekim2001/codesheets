export const meta = {
  "title": "Time Complexity & Performance",
  "domain": "javascript",
  "sheet": "complexity",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: Array Method Complexity ─────────────────────────────────────────
  {
    id: "array-complexity",
    title: "Array Method Complexity",
    entries: [
      {
        id: "array-push-pop",
        fn: "Array push/pop — O(1) Amortized",
        desc: "push() and pop() are O(1) amortized — the fastest array mutations.",
        category: "Array Complexity",
        subtitle: "O(1) amortized — V8 doubles backing store on resize",
        signature: "arr.push(x) // O(1) amortized | arr.pop() // O(1)",
        descLong: "push() appends to the end of the array. V8 maintains spare capacity and doubles the backing store when full, copying all elements. Over n pushes, total work is ~2n, so amortized cost is O(1). pop() removes from the end and is always O(1) — no resizing needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array push/pop — O(1) Amortized — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - push and pop at the end of an array — O(1)\n// STRENGTHS - Shows the simplest O(1) array operations\n// WEAKNESSES- No amortized analysis, no capacity discussion\n//\nconst arr = [1, 2, 3];\narr.push(4);        // O(1) amortized — appends to end\nconsole.log(arr);   // [1, 2, 3, 4]\narr.pop();          // O(1) — removes from end\nconsole.log(arr);   // [1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array push/pop — O(1) Amortized — common patterns you'll see in production.\n// APPROACH  - Combine Array push/pop — O(1) Amortized with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Batch push, push vs spread, capacity growth\n// STRENGTHS - Shows real-world push patterns and tradeoffs\n// WEAKNESSES- No engine internals, no memory analysis\n//\n// 1) BATCH PUSH — push multiple args at once is O(k) where k = args\nconst arr = [1, 2];\narr.push(3, 4, 5);   // O(3) — single resize, not 3 resizes\nconsole.log(arr);    // [1, 2, 3, 4, 5]\n// 2) PUSH vs SPREAD — spread creates a new array, push mutates\nconst a = [1, 2];\nconst b = [...a, 3];  // O(n) — copies all elements into new array\na.push(3);            // O(1) — mutates in place\n// 3) PRE-ALLOCATE when size is known — avoids repeated resizes\nconst sized = new Array(1000);\nfor (let i = 0; i < 1000; i++) sized[i] = i;  // O(n), no resizes\n// 4) push.apply for very large batches (avoids stack overflow)\nconst target = [1, 2, 3];\nconst source = Array.from({ length: 100000 }, (_, i) => i);\ntarget.push(...source);  // RangeError if source is too large\n// Use: target.push.apply(target, source);  // safe for large arrays"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array push/pop — O(1) Amortized — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - V8 capacity growth, amortized proof, benchmarking, decision guide\n// STRENGTHS - Engine-level understanding of why push is O(1) amortized\n// WEAKNESSES- N/A\n//\n// 1) V8 CAPACITY GROWTH — spare capacity doubles on resize\n//    Initial capacity: small. When full, V8 allocates 2x and copies.\n//    Over n pushes: copies happen at sizes 1, 2, 4, 8, ... n\n//    Total copies: 1 + 2 + 4 + ... + n ≈ 2n\n//    Amortized: 2n / n = O(1) per push\n// 2) BENCHMARK — push vs unshift on 100k elements\n//    push:  ~5ms    (O(1) amortized each)\n//    unshift: ~3000ms  (O(n) each -> O(n²) total)\n// 3) WHEN push IS NOT O(1) — the resize event itself is O(n)\n//    But it happens so infrequently that amortized cost is O(1).\n//    If you need guaranteed O(1) (not amortized), pre-allocate.\n// 4) ARRAY vs TYPED ARRAY — typed arrays have fixed capacity\n//    const buf = new Int32Array(1000);  // no resize, true O(1) per write\n//    But you can't push — must manage index manually.\n// Decision rule:\n//   add to end, mutation OK                  -> push() — O(1) amortized\n//   add to end, immutability required        -> [...arr, x] — O(n)\n//   remove from end                          -> pop() — O(1)\n//   known size, pre-allocate                 -> new Array(n) — avoids resizes\n//   very large batch append                  -> push.apply or loop\n//   need guaranteed O(1) (not amortized)     -> typed array with manual index\n//\n// Anti-pattern: using unshift() to add to front;\n//   unshift() is O(n) — it shifts every element. Use push + reverse or a deque."
                  }
        ],
        tips: [
                  "push() is O(1) amortized — V8 doubles capacity on resize, total copies ≈ 2n",
                  "pop() is always O(1) — no resize needed when shrinking",
                  "Pre-allocate with `new Array(n)` when size is known to avoid resizes",
                  "Use push.apply for very large batches — spread can stack overflow"
        ],
        mistake: "Using `unshift()` instead of `push()`. `unshift()` is O(n) because it shifts every element. `push()` is O(1) amortized.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst arr = [];\nfor (let i = 0; i < n; i++) arr.splice(arr.length, 0, i);\n// More explicit but longer",
          concise: "const arr = [];\nfor (let i = 0; i < n; i++) arr.push(i);",
        },
      },
      {
        id: "array-shift-unshift",
        fn: "Array shift/unshift — O(n)",
        desc: "shift() and unshift() are O(n) — they shift every element by one position.",
        category: "Array Complexity",
        subtitle: "O(n) — avoid in loops; use index pointer or linked list",
        signature: "arr.shift() // O(n) | arr.unshift(x) // O(n)",
        descLong: "shift() removes the first element and shifts all remaining elements left by one — O(n). unshift() inserts at the front and shifts all elements right by one — O(n). In a loop, this becomes O(n²). Use an index pointer, circular buffer, or linked list instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array shift/unshift — O(n) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - shift and unshift at the front of an array — O(n)\n// STRENGTHS - Shows why these are expensive on large arrays\n// WEAKNESSES- No alternative patterns\n//\nconst arr = [1, 2, 3, 4, 5];\narr.shift();       // O(n) — removes first, shifts [2,3,4,5] left\nconsole.log(arr);  // [2, 3, 4, 5]\narr.unshift(0);    // O(n) — shifts [2,3,4,5] right, inserts 0\nconsole.log(arr);  // [0, 2, 3, 4, 5]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array shift/unshift — O(n) — common patterns you'll see in production.\n// APPROACH  - Combine Array shift/unshift — O(n) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Index pointer to replace shift() in a queue loop\n// STRENGTHS - Shows the O(n²) -> O(n) refactor for queue patterns\n// WEAKNESSES- No circular buffer, no linked list\n//\n// BAD: O(n²) — shift() is O(n), called n times\nfunction processQueueBad(queue) {\n  while (queue.length) {\n    const item = queue.shift();   // O(n) each call!\n    process(item);\n  }\n}\n// GOOD: O(n) — use an index pointer, no shifting\nfunction processQueueGood(queue) {\n  let head = 0;\n  while (head < queue.length) {\n    const item = queue[head++];   // O(1) — just read\n    process(item);\n  }\n  // queue is \"consumed\" — head == queue.length\n}\n// For unshift: use push + reverse if you need LIFO-like front access\n// Or use a real deque (see dsa.js queue entry)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array shift/unshift — O(n) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Circular buffer, linked list, benchmarking, decision guide\n// STRENGTHS - The patterns that eliminate O(n) front operations\n// WEAKNESSES- N/A\n//\n// 1) CIRCULAR BUFFER — O(1) at both ends (see dsa.js for full impl)\n//    Use when you need a queue with frequent enqueue/dequeue\n// 2) BENCHMARK — shift() vs index pointer on 100k array\n//    shift() in loop:       ~3000ms  (O(n²))\n//    index pointer in loop: ~5ms     (O(n))\n// 3) TWO-POINTER TECHNIQUE — for in-place array processing\nfunction filterInPlace(arr, predicate) {\n  let write = 0;\n  for (let read = 0; read < arr.length; read++) {\n    if (predicate(arr[read])) {\n      arr[write++] = arr[read];  // O(1) — no shifting\n    }\n  }\n  arr.length = write;  // truncate\n  return arr;\n}\nconsole.log(filterInPlace([1, 2, 3, 4, 5], x => x % 2 === 0));  // [2, 4]\n// 4) REVERSE + POP — when you need LIFO from the front\n//    Instead of shift(), reverse the array once and pop()\n//    O(n) for reverse + O(1) per pop = O(n) total, vs O(n²) for n shifts\n// Decision rule:\n//   remove from front, small array (< 100)              -> shift() is fine\n//   remove from front, in a loop                        -> index pointer\n//   add to front, small array                           -> unshift() is fine\n//   add to front, in a loop                             -> push + reverse, or deque\n//   queue with frequent enqueue/dequeue                 -> circular buffer or linked list\n//   filter in-place without allocating new array        -> two-pointer write/read\n//\n// Anti-pattern: shift() inside a while loop;\n//   each shift() is O(n), so the loop is O(n²). Use an index pointer for O(n)."
                  }
        ],
        tips: [
                  "shift() and unshift() are O(n) — they physically move every element",
                  "Replace shift() in a loop with an index pointer for O(n) -> O(1) per step",
                  "For queues, use a circular buffer or linked list (see dsa.js)",
                  "Two-pointer write/read filters in-place without shifting"
        ],
        mistake: "Using `shift()` inside a while loop for queue processing. Each `shift()` is O(n), making the loop O(n²). Use an index pointer for O(n) total.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst arr = [1, 2, 3, 4, 5];\narr.splice(0, 1);\n// More explicit but longer",
          concise: "const arr = [1, 2, 3, 4, 5];\nconst q = arr.slice(1);",
        },
      },
      {
        id: "array-slice-splice",
        fn: "Array slice/splice — O(n)",
        desc: "slice() copies a portion, splice() mutates — both are O(n).",
        category: "Array Complexity",
        subtitle: "O(n) — slice copies, splice shifts; toSpliced is O(n) + allocation",
        signature: "arr.slice(start, end) // O(n) | arr.splice(i, d, ...items) // O(n)",
        descLong: "slice() creates a new array with copies of elements in the range — O(k) where k is the slice length. splice() removes/inserts at an index and shifts remaining elements — O(n). toSpliced() (ES2023) does the same immutably — O(n) + allocation. Both scan and/or shift elements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array slice/splice — O(n) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - slice copies a portion, splice mutates in place\n// STRENGTHS - Shows both operations and their results\n// WEAKNESSES- No complexity analysis, no toSpliced\n//\nconst arr = [1, 2, 3, 4, 5];\nconst part = arr.slice(1, 4);   // O(3) — copies elements at indices 1,2,3\nconsole.log(part);              // [2, 3, 4]\nconsole.log(arr);               // [1, 2, 3, 4, 5] — unchanged\nconst arr2 = [1, 2, 3, 4, 5];\narr2.splice(1, 2);              // O(n) — removes 2 elements at index 1, shifts rest\nconsole.log(arr2);              // [1, 4, 5]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array slice/splice — O(n) — common patterns you'll see in production.\n// APPROACH  - Combine Array slice/splice — O(n) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - toSpliced, insert, replace, and performance notes\n// STRENGTHS - Covers the 80% of slice/splice usage\n// WEAKNESSES- No benchmarking, no alternative patterns\n//\n// 1) IMMUTABLE splice with toSpliced() (ES2023)\nconst arr = [1, 2, 3, 4, 5];\nconst next = arr.toSpliced(1, 2);  // O(n) — new array, original untouched\nconsole.log(arr);   // [1, 2, 3, 4, 5]\nconsole.log(next);  // [1, 4, 5]\n// 2) INSERT with splice — O(n) due to shifting\nconst arr3 = ['a', 'b', 'd'];\narr3.splice(2, 0, 'c');  // insert 'c' at index 2\nconsole.log(arr3);       // ['a', 'b', 'c', 'd']\n// 3) REPLACE with splice — O(n)\nconst arr4 = [1, 2, 3];\narr4.splice(1, 1, 99);   // replace index 1 with 99\nconsole.log(arr4);       // [1, 99, 3]\n// 4) slice with negative indices — O(k)\nconst arr5 = [1, 2, 3, 4, 5];\narr5.slice(-2);           // [4, 5] — last 2 elements\narr5.slice(-3, -1);       // [3, 4] — exclude last 1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array slice/splice — O(n) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Benchmarking, alternatives, and decision guide\n// STRENGTHS - The patterns that avoid unnecessary O(n) copies\n// WEAKNESSES- N/A\n//\n// 1) BENCHMARK — splice vs filter vs toSpliced\n//    splice(0, 1) on 100k array:    ~2ms   (mutates, shifts)\n//    toSpliced(0, 1) on 100k array: ~3ms   (allocates new + shifts)\n//    filter() on 100k array:        ~5ms   (allocates new, scans all)\n//    For single removal: splice is fastest (no allocation)\n// 2) REMOVE BY VALUE — filter is O(n) but cleaner than find+splice\nconst arr = [1, 2, 3, 2, 4];\n// Option A: filter (immutable, removes all matches)\nconst noTwos = arr.filter(x => x !== 2);  // O(n), new array\n// Option B: find + splice (mutates, removes first match only)\nconst idx = arr.indexOf(2);\nif (idx !== -1) arr.splice(idx, 1);       // O(n) for splice + O(n) for indexOf\n// 3) SUBARRAY VIEW — avoid copying with a view object\nfunction subarrayView(arr, start, end) {\n  return {\n    get length() { return end - start; },\n    get(i) { return arr[start + i]; },\n    [Symbol.iterator]() {\n      let i = start;\n      return { next: () => i < end ? { value: arr[i++], done: false } : { done: true } };\n    },\n  };\n}\nconst view = subarrayView([1, 2, 3, 4, 5], 1, 4);  // O(1) — no copy\nconsole.log([...view]);  // [2, 3, 4]\n// Decision rule:\n//   copy a portion                                      -> slice() — O(k)\n//   remove by index, mutation OK                        -> splice() — O(n)\n//   remove by index, immutability required              -> toSpliced() — O(n)\n//   remove by condition                                 -> filter() — O(n)\n//   remove by value (first match)                       -> indexOf + splice — O(n)\n//   insert at position                                  -> splice() — O(n)\n//   replace at position                                 -> splice(i, 1, x) — O(n)\n//   view without copying                                -> subarray view — O(1)\n//\n// Anti-pattern: splice() in a loop to remove multiple elements;\n//   each splice shifts the array. Filter once or iterate backwards."
                  }
        ],
        tips: [
                  "slice() is O(k) where k is the slice length — it copies elements",
                  "splice() is O(n) — it shifts remaining elements after removal/insertion",
                  "toSpliced() (ES2023) is O(n) + allocation — immutable version of splice",
                  "For subarray access without copying, use a view object with O(1) creation"
        ],
        mistake: "Using `splice()` in a loop to remove multiple elements by value. Each `splice()` is O(n), making the loop O(n²). Use `filter()` once for O(n), or iterate backwards.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst copy = arr.slice();\ncopy.splice(2, 1, 'X');\n// More explicit but longer",
          concise: "const copy = arr.toSpliced(2, 1, 'X');",
        },
      },
      {
        id: "array-search",
        fn: "Array Search — indexOf/includes/find",
        desc: "Linear search methods are O(n) — use Set/Map for O(1) lookups.",
        category: "Array Complexity",
        subtitle: "O(n) for arrays; O(1) for Set/Map — choose the right structure",
        signature: "arr.includes(x) // O(n) | arr.find(fn) // O(n) | set.has(x) // O(1)",
        descLong: "indexOf(), includes(), find(), findIndex(), findLast() are all O(n) — they scan the array until a match is found. For frequent lookups, convert to a Set (for values) or Map (for key-value pairs) to get O(1) average lookups. For sorted arrays, use binary search for O(log n).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array Search — indexOf/includes/find — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Linear search methods — all O(n)\n// STRENGTHS - Shows the three most common search methods\n// WEAKNESSES- No Set/Map alternative, no binary search\n//\nconst arr = [1, 2, 3, 4, 5];\n// includes() — O(n) linear scan, returns boolean\nconsole.log(arr.includes(3));   // true\n// indexOf() — O(n) linear scan, returns index or -1\nconsole.log(arr.indexOf(3));    // 2\n// find() — O(n) linear scan with predicate, returns first match\nconsole.log(arr.find(x => x > 3));  // 4"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array Search — indexOf/includes/find — common patterns you'll see in production.\n// APPROACH  - Combine Array Search — indexOf/includes/find with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Replace O(n) array search with O(1) Set/Map lookup\n// STRENGTHS - Shows the most common performance refactor\n// WEAKNESSES- No binary search, no benchmarking\n//\n// BAD: O(n*m) — includes() is O(n), called m times\nconst allowed = ['admin', 'editor', 'moderator'];\nfor (const role of userRoles) {\n  if (allowed.includes(role)) { /* ... */ }  // O(n) each time\n}\n// GOOD: O(1) per lookup — convert to Set once\nconst allowedSet = new Set(allowed);\nfor (const role of userRoles) {\n  if (allowedSet.has(role)) { /* ... */ }    // O(1) each time\n}\n// For key-value lookups, use Map instead of scanning objects\nconst users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];\n// BAD: O(n) — find scans the array\nconst user = users.find(u => u.id === 2);\n// GOOD: O(1) — Map index built once\nconst userMap = new Map(users.map(u => [u.id, u]));\nconst user2 = userMap.get(2);  // O(1)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array Search — indexOf/includes/find — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Binary search, benchmarking, decision guide\n// STRENGTHS - The complete decision matrix for array search\n// WEAKNESSES- N/A\n//\n// 1) BINARY SEARCH on sorted array — O(log n)\nfunction binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}\n// 2) BENCHMARK — search 100k elements, 10k lookups\n//    array.includes():  ~500ms   (O(n) per lookup)\n//    Set.has():         ~1ms     (O(1) per lookup)\n//    binary search:     ~5ms     (O(log n) per lookup, sorted)\n// 3) BUILD INDEX ONCE — for repeated lookups by a key\nfunction buildIndex(arr, keyFn) {\n  const index = new Map();\n  for (const item of arr) index.set(keyFn(item), item);\n  return index;\n}\nconst userIndex = buildIndex(users, u => u.id);\n// Now userIndex.get(id) is O(1) for any future lookup\n// Decision rule:\n//   one-time search, unsorted array                     -> includes/find — O(n)\n//   repeated lookups by value                            -> Set — O(1) per lookup\n//   repeated lookups by key                              -> Map index — O(1) per lookup\n//   sorted array, any search                             -> binary search — O(log n)\n//   find first/last match with predicate                 -> find/findLast — O(n)\n//   check existence only                                 -> Set.has() — O(1)\n//   search from specific index                           -> includes(x, fromIndex) — O(n)\n//\n// Anti-pattern: array.includes() in a loop for membership testing;\n//   each includes() is O(n). Convert to Set once for O(1) per lookup."
                  }
        ],
        tips: [
                  "indexOf/includes/find/findIndex are all O(n) — they scan the array",
                  "Convert to Set once, look up many times: Set.has() is O(1)",
                  "For key-value lookups, build a Map index: `new Map(arr.map(x => [key(x), x]))`",
                  "For sorted arrays, binary search is O(log n) — see dsa.js"
        ],
        mistake: "Using `array.includes()` in a loop for membership testing. Each call is O(n). Convert to a Set once for O(1) per lookup.",
        shorthand: {
          verbose: "for (let i = 0; i < arr.length; i++) {\n  if (arr[i] === target) return i;\n}",
          concise: "const idx = arr.indexOf(target);",
        },
      },
      {
        id: "array-sort-complexity",
        fn: "Array sort — O(n log n)",
        desc: "sort() and toSorted() use TimSort — O(n log n) worst case, O(n) best case.",
        category: "Array Complexity",
        subtitle: "O(n log n) worst case — always pass a comparator for numbers",
        signature: "arr.sort((a, b) => a - b) // O(n log n) | arr.toSorted(cmp) // O(n log n)",
        descLong: "V8 uses TimSort (a hybrid merge/insertion sort). Best case O(n) for nearly-sorted data, worst case O(n log n). Always provide a comparator for numbers — default sort is lexicographic. toSorted() (ES2023) is O(n log n) + O(n) allocation for the new array.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array sort — O(n log n) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - sort with and without comparator\n// STRENGTHS - Shows the #1 sort pitfall: missing comparator\n// WEAKNESSES- No complexity analysis, no toSorted\n//\n// WRONG: default sort is lexicographic (string comparison)\n[10, 9, 2, 100].sort();                  // [10, 100, 2, 9] — WRONG\n// CORRECT: always pass a comparator for numbers\n[10, 9, 2, 100].sort((a, b) => a - b);   // [2, 9, 10, 100] — correct"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array sort — O(n log n) — common patterns you'll see in production.\n// APPROACH  - Combine Array sort — O(n log n) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - toSorted, multi-key sort, locale-aware sort\n// STRENGTHS - Covers the 80% of sorting patterns\n// WEAKNESSES- No TimSort internals, no partial sort\n//\n// 1) IMMUTABLE sort — toSorted() (ES2023)\nconst nums = [3, 1, 4, 1, 5];\nconst sorted = nums.toSorted((a, b) => a - b);  // O(n log n) + O(n) alloc\nconsole.log(nums);    // [3, 1, 4, 1, 5] — unchanged\n// 2) MULTI-KEY sort — O(n log n), chained comparator\nconst people = [\n  { first: 'John', last: 'Doe' },\n  { first: 'Jane', last: 'Doe' },\n  { first: 'Bob',  last: 'Smith' },\n];\npeople.toSorted((a, b) => {\n  const c = a.last.localeCompare(b.last);\n  return c !== 0 ? c : a.first.localeCompare(b.first);\n});\n// 3) LOCALE-AWARE sort with Intl.Collator — faster than localeCompare\nconst collator = new Intl.Collator('en', { numeric: true });\n['file10', 'file2', 'file1'].toSorted(collator.compare);\n// -> ['file1', 'file2', 'file10']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array sort — O(n log n) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - TimSort internals, partial sort, benchmarking, decision guide\n// STRENGTHS - Engine-level understanding of sort performance\n// WEAKNESSES- N/A\n//\n// 1) TIMSORT — V8's sort algorithm\n//    Best case: O(n)    — nearly-sorted data (detects runs)\n//    Average:   O(n log n)\n//    Worst:     O(n log n)\n//    Stable: yes (ES2019+)\n//    Space:    O(n/2) auxiliary\n// 2) PARTIAL SORT — top-K without sorting everything\n//    Full sort: O(n log n) for n=100k -> ~20ms\n//    Heap of size K: O(n log K) for K=10 -> ~2ms\n//    (see dsa.js heap entry for implementation)\n// 3) NEARLY-SORTED DATA — TimSort is O(n) on runs\n//    If data is already mostly sorted, sort() is nearly free.\n//    Inserting one element into a sorted array:\n//    BAD:  arr.push(x); arr.sort(cmp);  // O(n log n) — re-sorts everything\n//    GOOD: binary insert — O(n) for shift, O(log n) for find\nfunction sortedInsert(arr, x, cmp = (a, b) => a - b) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) { const mid = (lo + hi) >> 1; if (cmp(arr[mid], x) < 0) lo = mid + 1; else hi = mid; }\n  arr.splice(lo, 0, x);  // O(n) for splice, but O(log n) for find\n}\n// 4) OBJECT SORT by computed key — precompute for performance\n// BAD: comparator calls expensive function on every comparison\narr.sort((a, b) => expensiveKey(a) - expensiveKey(b));  // O(n log n * cost)\n// GOOD: precompute keys once — O(n * cost) + O(n log n) sort\nconst decorated = arr.map(x => [expensiveKey(x), x]);\ndecorated.sort((a, b) => a[0] - b[0]);\nconst result = decorated.map(([_, x]) => x);\n// Decision rule:\n//   sort numbers                                         -> .sort((a, b) => a - b)\n//   sort strings                                         -> .sort((a, b) => a.localeCompare(b))\n//   immutable sort                                       -> .toSorted(cmp)\n//   top-K only                                           -> heap of size K (O(n log K))\n//   insert into sorted array                             -> binary insert (O(n))\n//   nearly-sorted data                                   -> sort() is O(n) — TimSort detects runs\n//   sort by expensive key                                -> precompute (decorate-sort-undecorate)\n//   locale-aware sort                                    -> Intl.Collator\n//\n// Anti-pattern: re-sorting after inserting one element;\n//   sort() is O(n log n). Binary insert is O(n). For single insertions, use binary insert."
                  }
        ],
        tips: [
                  "V8 uses TimSort — O(n) on nearly-sorted data, O(n log n) worst case",
                  "Always pass a comparator for numbers — default sort is lexicographic",
                  "For top-K, a size-K heap is O(n log K) — faster than O(n log n) full sort",
                  "Precompute expensive sort keys (decorate-sort-undecorate) to avoid repeated calls"
        ],
        mistake: "Calling `.sort()` on numbers without a comparator. `[10, 9, 2].sort()` gives `[10, 2, 9]` — lexicographic order. Always pass `(a, b) => a - b`.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst sorted = arr.slice().sort((a, b) => a - b);\n// More explicit but longer",
          concise: "const sorted = arr.toSorted((a, b) => a - b);",
        },
      },
    ],
  },

  // ── Section 2: String & Object Complexity ─────────────────────────────────────────
  {
    id: "string-complexity",
    title: "String & Object Complexity",
    entries: [
      {
        id: "string-concat",
        fn: "String Concatenation — O(n²) in Loops",
        desc: "+= in a loop is O(n²) — use array.push + join for O(n).",
        category: "String Complexity",
        subtitle: "Strings are immutable — each += copies the entire string",
        signature: "parts.push(s); parts.join('') // O(n) | s += chunk // O(n²) in loop",
        descLong: "JS strings are immutable. Each += creates a new string, copying all previous characters. In a loop of n iterations with average string length k, total work is O(n²k). Using array.push() + join() is O(nk) — one allocation at the end. For template literals with dynamic parts, the same applies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of String Concatenation — O(n²) in Loops — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - += vs push+join for building a string\n// STRENGTHS - Shows the #1 string performance pitfall\n// WEAKNESSES- No complexity analysis, no template literals\n//\n// BAD: O(n²) — each += copies the entire accumulated string\nlet s = '';\nfor (let i = 0; i < 5; i++) s += i;\nconsole.log(s);  // '01234'\n// GOOD: O(n) — push fragments, join once at the end\nconst parts = [];\nfor (let i = 0; i < 5; i++) parts.push(i);\nconsole.log(parts.join(''));  // '01234'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of String Concatenation — O(n²) in Loops — common patterns you'll see in production.\n// APPROACH  - Combine String Concatenation — O(n²) in Loops with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Template literals, repeat, concat, and real-world patterns\n// STRENGTHS - Covers the 80% of string building patterns\n// WEAKNESSES- No benchmarking, no engine internals\n//\n// 1) TEMPLATE LITERALS are also O(n) per concatenation\n//    But they're fine for one-shot construction (not in a loop)\nconst html = `<div>${name}</div>`;  // O(k) — single allocation\n// 2) BUILD HTML — push + join pattern\nconst items = ['apple', 'banana', 'cherry'];\nconst html2 = items.map(item => `<li>${item}</li>`).join('');\n// '<li>apple</li><li>banana</li><li>cherry</li>'\n// 3) REPEAT — O(n) single allocation, not O(n²)\n'ab'.repeat(1000);  // O(n) — V8 optimizes this\n// 4) CONCAT — same as +=, O(n + m) for two strings\nconst a = 'hello';\nconst b = 'world';\nconst c = a + ' ' + b;  // O(n + m) — fine for one-shot\n// 5) JOIN with separator — O(n) total\n['a', 'b', 'c'].join(', ');  // 'a, b, c' — O(n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of String Concatenation — O(n²) in Loops — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Engine internals, benchmarking, rope strings, decision guide\n// STRENGTHS - The patterns that prevent string performance bugs\n// WEAKNESSES- N/A\n//\n// 1) WHY += IS O(n²) — strings are immutable in JS\n//    s += 'x' creates a NEW string of length |s|+1, copying all of s.\n//    In a loop: 1 + 2 + 3 + ... + n = O(n²) total characters copied.\n// 2) BENCHMARK — build a 100k character string\n//    += in loop:     ~2000ms  (O(n²))\n//    push + join:    ~5ms     (O(n))\n//    repeat:         ~1ms     (O(n), optimized)\n// 3) V8 OPTIMIZATION — flat strings vs cons strings\n//    V8 sometimes uses \"cons strings\" (rope-like) to defer concatenation.\n//    But this optimization is not guaranteed and breaks under certain patterns.\n//    Always use push + join for predictable O(n) performance.\n// 4) STRING BUILDER pattern — encapsulate the push+join idiom\nclass StringBuilder {\n  #parts = [];\n  append(s) { this.#parts.push(s); return this; }\n  toString() { return this.#parts.join(''); }\n  get length() { return this.#parts.reduce((a, p) => a + p.length, 0); }\n}\nconst sb = new StringBuilder();\nfor (let i = 0; i < 10000; i++) sb.append(i);\nconst result = sb.toString();  // O(n) — single join\n// 5) JSON STRINGIFY — O(n) but with high constant factor\n//    For large objects, JSON.stringify is the bottleneck.\n//    Consider streaming JSON or partial serialization for large data.\n// Decision rule:\n//   one-shot concatenation (2-3 parts)               -> template literal or +\n//   building a string in a loop                      -> push + join\n//   repeat a string n times                          -> .repeat(n)\n//   join array with separator                        -> .join(sep)\n//   building HTML/XML                                -> map + join\n//   very large string building                       -> StringBuilder class\n//   serializing objects                              -> JSON.stringify (O(n))\n//\n// Anti-pattern: string += in a loop;\n//   each += copies the entire string so far. Use array.push + join for O(n)."
                  }
        ],
        tips: [
                  "Strings are immutable — each += creates a new string, copying everything",
                  "Use `parts.push(fragment); parts.join('')` for O(n) string building in loops",
                  "V8 may use cons strings (rope-like) to defer concatenation, but don't rely on it",
                  "`.repeat(n)` is O(n) and optimized by V8 — never use a loop for repetition"
        ],
        mistake: "Using `string += chunk` inside a loop. Each concatenation copies the entire accumulated string, making it O(n²). Use `parts.push(chunk)` then `parts.join('')` for O(n).",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet s = '';\nfor (const part of parts) s += part;\n// More explicit but longer",
          concise: "const s = parts.join('');",
        },
      },
      {
        id: "object-spread",
        fn: "Object Spread & Copy — O(n)",
        desc: "Spread, Object.assign, and structuredClone are all O(n) in properties.",
        category: "Object Complexity",
        subtitle: "Shallow copy is O(n); deep copy is O(n * depth)",
        signature: "{ ...obj } // O(n) | Object.assign({}, obj) // O(n) | structuredClone(obj) // O(n*d)",
        descLong: "Object spread ({...obj}) and Object.assign both iterate all enumerable own properties — O(n) where n is property count. structuredClone() deep copies, traversing the entire object graph — O(n * d) where d is depth. For shallow copies, spread is the cleanest. For deep copies, structuredClone is the standard (ES2022+).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object Spread & Copy — O(n) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Shallow copy with spread, deep copy with structuredClone\n// STRENGTHS - Shows the two most common copy patterns\n// WEAKNESSES- No complexity analysis, no edge cases\n//\nconst obj = { a: 1, b: 2, c: { d: 3 } };\n// Shallow copy — O(n) in properties, nested objects are shared by reference\nconst shallow = { ...obj };\nshallow.a = 99;\nconsole.log(obj.a);      // 1 — top-level is copied\nshallow.c.d = 99;\nconsole.log(obj.c.d);    // 99 — nested object is shared!\n// Deep copy — O(n * depth), no shared references\nconst deep = structuredClone(obj);\ndeep.c.d = 0;\nconsole.log(obj.c.d);    // 99 — nested object is independent"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object Spread & Copy — O(n) — common patterns you'll see in production.\n// APPROACH  - Combine Object Spread & Copy — O(n) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Object.assign, merge, JSON round-trip, performance\n// STRENGTHS - Covers the 80% of object copy patterns\n// WEAKNESSES- No structuredClone edge cases, no benchmarking\n//\n// 1) Object.assign — same as spread but mutates the target\nconst target = { a: 1 };\nconst source = { b: 2, c: 3 };\nObject.assign(target, source);  // target is now { a: 1, b: 2, c: 3 }\n// 2) MERGE multiple objects — spread is cleaner\nconst merged = { ...defaults, ...overrides, ...userPrefs };\n// 3) JSON ROUND-TRIP — old deep copy trick (before structuredClone)\nconst jsonCopy = JSON.parse(JSON.stringify(obj));\n// Limitations: no functions, no Dates (become strings), no undefined, no circular refs\n// 4) SHALLOW COPY performance — spread vs Object.assign\n//    { ...obj }  — slightly faster in V8 (optimized in parser)\n//    Object.assign({}, obj) — same O(n), slightly more overhead\n// 5) CONDITIONAL SPREAD — include properties only if condition is true\nconst config = {\n  baseUrl: 'https://api.example.com',\n  ...(useAuth && { headers: { Authorization: `Bearer ${token}` } }),\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object Spread & Copy — O(n) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - structuredClone edge cases, benchmarking, decision guide\n// STRENGTHS - Production deep copy patterns and tradeoffs\n// WEAKNESSES- N/A\n//\n// 1) structuredClone — handles types JSON can't\nconst obj = {\n  date: new Date(),           // preserved (JSON makes it a string)\n  map: new Map([['a', 1]]),   // preserved\n  set: new Set([1, 2, 3]),    // preserved\n  regex: /foo/g,              // preserved\n  arrayBuffer: new ArrayBuffer(8),  // preserved\n  // func: () => {},          // TypeError! functions can't be cloned\n  // dom: document.body,      // TypeError! DOM nodes can't be cloned\n};\nconst clone = structuredClone(obj);\n// 2) BENCHMARK — copy a 1000-property object\n//    { ...obj }:              ~0.1ms  (shallow, O(n))\n//    Object.assign({}, obj):  ~0.15ms (shallow, O(n))\n//    JSON.parse(JSON.stringify): ~2ms  (deep, O(n*d), no special types)\n//    structuredClone(obj):    ~1ms    (deep, O(n*d), handles all types)\n// 3) PARTIAL DEEP COPY — deep copy only specific paths\nfunction partialDeepCopy(obj, deepKeys) {\n  const result = { ...obj };  // shallow copy all\n  for (const key of deepKeys) {\n    if (key in obj) result[key] = structuredClone(obj[key]);\n  }\n  return result;\n}\n// 4) IMMUTABLE UPDATE — shallow copy + override (React state pattern)\nfunction updateAtPath(obj, path, value) {\n  if (path.length === 1) return { ...obj, [path[0]]: value };\n  const [head, ...rest] = path;\n  return { ...obj, [head]: updateAtPath(obj[head], rest, value };\n}\n// Decision rule:\n//   shallow copy (top-level only)                       -> { ...obj } — O(n)\n//   merge objects                                       -> { ...a, ...b } — O(n+m)\n//   deep copy with standard types                       -> structuredClone() — O(n*d)\n//   deep copy with functions/DOM                        -> custom recursive clone\n//   deep copy (legacy, no special types)                -> JSON.parse(JSON.stringify())\n//   update nested path immutably                        -> shallow copies along path\n//   copy only specific keys deeply                      -> partial deep copy\n//\n// Anti-pattern: JSON.parse(JSON.stringify()) when structuredClone is available;\n//   structuredClone handles Date, Map, Set, RegExp, ArrayBuffer — JSON doesn't."
                  }
        ],
        tips: [
                  "Object spread is O(n) in properties — shallow copy, nested objects shared by reference",
                  "structuredClone() (ES2022) is the standard deep copy — handles Date, Map, Set, RegExp",
                  "JSON.parse(JSON.stringify()) loses Dates, Maps, Sets, functions, undefined",
                  "For React state, use shallow copies along the update path — not a full deep copy"
        ],
        mistake: "Using `JSON.parse(JSON.stringify())` for deep copy when `structuredClone()` is available. structuredClone handles Date, Map, Set, RegExp, and ArrayBuffer — JSON loses them.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst merged = Object.assign({}, a, b);\n// More explicit but longer",
          concise: "const merged = { ...a, ...b };",
        },
      },
      {
        id: "map-set-complexity",
        fn: "Map/Set Operations — O(1) Average",
        desc: "Map and Set have O(1) average for set/get/has/delete — O(n) for iteration.",
        category: "Object Complexity",
        subtitle: "O(1) average per operation; O(n) to build or iterate",
        signature: "map.set(k, v) // O(1) | map.get(k) // O(1) | set.has(x) // O(1)",
        descLong: "Map and Set use hash tables internally. set/get/has/delete are O(1) average, O(n) worst case (hash collision). Building a Map from an iterable is O(n). Iteration is O(n). Map preserves insertion order. WeakMap/WeakSet have same complexity but keys are weakly held (no iteration).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Map/Set Operations — O(1) Average — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Map and Set core operations — all O(1) average\n// STRENGTHS - Shows the O(1) operations that make Map/Set fast\n// WEAKNESSES- No complexity analysis, no iteration cost\n//\nconst map = new Map();\nmap.set('a', 1);     // O(1)\nmap.set('b', 2);     // O(1)\nconsole.log(map.get('a'));  // 1 — O(1)\nconsole.log(map.has('b'));  // true — O(1)\nmap.delete('a');     // O(1)\nconst set = new Set([1, 2, 3]);\nconsole.log(set.has(2));  // true — O(1)\nset.add(4);              // O(1\nset.delete(1);           // O(1)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Map/Set Operations — O(1) Average — common patterns you'll see in production.\n// APPROACH  - Combine Map/Set Operations — O(1) Average with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Build cost, iteration, size, and conversion\n// STRENGTHS - Covers the 80% of Map/Set usage with costs\n// WEAKNESSES- No hash collision discussion, no WeakMap\n//\n// 1) BUILD from iterable — O(n)\nconst arr = Array.from({ length: 1000 }, (_, i) => i);\nconst set = new Set(arr);    // O(n) — inserts each element\nconst map = new Map(arr.map(x => [x, x * 2]));  // O(n)\n// 2) ITERATION — O(n), preserves insertion order\nfor (const [k, v] of map) console.log(k, v);  // O(n)\nconst keys = [...map.keys()];    // O(n)\nconst values = [...map.values()]; // O(n)\n// 3) SIZE — O(1) (Map/Set track size internally)\nconsole.log(map.size);  // O(1) — not O(n) like Object.keys().length\n// 4) CLEAR — O(n) (must remove all entries)\nmap.clear();  // O(n)\n// 5) CONVERT to array — O(n)\nconst entries = [...map];       // [[k, v], ...]\nconst arr2 = [...set];          // [v, ...]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Map/Set Operations — O(1) Average — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Hash collision, WeakMap/WeakSet, benchmarking, decision guide\n// STRENGTHS - Engine-level understanding of Map/Set performance\n// WEAKNESSES- N/A\n//\n// 1) HASH COLLISION — worst case O(n) per operation\n//    V8 uses open addressing with linear probing.\n//    With a good hash function, collisions are rare -> O(1) average.\n//    With many collisions (adversarial input), degrades to O(n).\n//    Map/Set in V8 are generally very fast — collisions are handled well.\n// 2) BENCHMARK — Map vs Object for 10k key-value pairs\n//    Map.set():     ~0.5ms  (O(1) per insert, 10k inserts)\n//    obj[key] = v:  ~0.3ms  (O(1) per insert, 10k inserts)\n//    Map.get():     ~0.1ms  (O(1) per lookup, 10k lookups)\n//    obj[key]:      ~0.05ms (O(1) per lookup, 10k lookups)\n//    Object is slightly faster for string keys, but Map handles any key type.\n// 3) WEAKMAP / WEAKSET — O(1) but no iteration\n//    Keys must be objects. Entries are GC'd when key object dies.\n//    No .size, no iteration, no clearing — by design.\nconst cache = new WeakMap();\nfunction expensiveCompute(obj) {\n  if (cache.has(obj)) return cache.get(obj);  // O(1)\n  const result = /* ... */ {};\n  cache.set(obj, result);  // O(1) — auto-cleaned when obj is GC'd\n  return result;\n}\n// 4) MAP vs OBJECT — when to use which\n//    Map: any key type, frequent add/delete, need .size, need iteration order\n//    Object: string/symbol keys only, JSON serialization, prototype chain\n//    Map is faster for frequent add/delete; Object is faster for static keys\n// Decision rule:\n//   key-value with any key type                          -> Map — O(1) ops\n//   key-value with string keys, static                   -> Object — O(1) ops (slightly faster)\n//   unique values, membership testing                    -> Set — O(1) has()\n//   cache that should not leak                           -> WeakMap — O(1), auto GC\n//   tag objects without mutation                         -> WeakSet — O(1), auto GC\n//   need .size                                           -> Map/Set (Object needs Object.keys)\n//   need insertion-order iteration                       -> Map (Object order is nuanced)\n//   JSON serialization                                   -> Object (Map needs conversion)\n//\n// Anti-pattern: using Object for frequent add/delete with many keys;\n//   Map is optimized for this. Object has prototype chain overhead and key coercion."
                  }
        ],
        tips: [
                  "Map/Set operations are O(1) average — O(n) worst case with hash collisions",
                  "Building a Map/Set from an iterable is O(n) — one insert per element",
                  "Map.size is O(1) — Object needs Object.keys(obj).length which is O(n)",
                  "WeakMap/WeakSet have O(1) ops but no iteration, no .size — by design"
        ],
        mistake: "Using `Object.keys(obj).length` to check size. This is O(n). `Map.size` and `Set.size` are O(1).",
        shorthand: {
          verbose: "const seen = {};\nseen[key] = true;\nif (seen[key]) { /* ... */ }",
          concise: "const seen = new Set();\nseen.add(key);\nif (seen.has(key)) { /* ... */ }",
        },
      },
    ],
  },

  // ── Section 3: Performance Anti-Patterns & Refactors ─────────────────────────────────────────
  {
    id: "performance-patterns",
    title: "Performance Anti-Patterns & Refactors",
    entries: [
      {
        id: "nested-loops",
        fn: "Nested Loops — O(n²) Detection",
        desc: "Identify and refactor O(n²) nested loops into O(n) with hash maps.",
        category: "Performance",
        subtitle: "Spot the pattern: inner loop scans the same array as outer",
        signature: "for (x of arr) { for (y of arr) { ... } } // O(n²)",
        descLong: "Nested loops over the same array are O(n²). Common in pair-finding, duplicate detection, and intersection. Refactor to O(n) using a Set/Map to store seen elements, or sort + two-pointers for O(n log n). The key insight: if the inner loop searches for something, replace it with a hash lookup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Nested Loops — O(n²) Detection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Spot the O(n²) pattern and refactor to O(n)\n// STRENGTHS - Shows the classic duplicate detection refactor\n// WEAKNESSES- No pair-finding, no intersection\n//\n// BAD: O(n²) — nested loop to find duplicates\nfunction hasDuplicateBad(arr) {\n  for (let i = 0; i < arr.length; i++)\n    for (let j = i + 1; j < arr.length; j++)\n      if (arr[i] === arr[j]) return true;\n  return false;\n}\n// GOOD: O(n) — Set tracks seen elements\nfunction hasDuplicateGood(arr) {\n  const seen = new Set();\n  for (const x of arr) {\n    if (seen.has(x)) return true;\n    seen.add(x);\n  }\n  return false;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Nested Loops — O(n²) Detection — common patterns you'll see in production.\n// APPROACH  - Combine Nested Loops — O(n²) Detection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Intersection, pair-finding, frequency — all O(n²) -> O(n)\n// STRENGTHS - Covers the 80% of nested-loop refactors\n// WEAKNESSES- No sorting-based approaches\n//\n// 1) ARRAY INTERSECTION — O(n*m) -> O(n+m)\nfunction intersectBad(a, b) {\n  return a.filter(x => b.includes(x));  // O(n*m)\n}\nfunction intersectGood(a, b) {\n  const setB = new Set(b);\n  return a.filter(x => setB.has(x));   // O(n+m)\n}\n// 2) TWO SUM — O(n²) -> O(n)\nfunction twoSumBad(nums, target) {\n  for (let i = 0; i < nums.length; i++)\n    for (let j = i + 1; j < nums.length; j++)\n      if (nums[i] + nums[j] === target) return [i, j];\n  return null;\n}\nfunction twoSumGood(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (seen.has(comp)) return [seen.get(comp), i];\n    seen.set(nums[i], i);\n  }\n  return null;\n}\n// 3) FREQUENCY COUNT — O(n²) -> O(n)\nfunction freqBad(arr) {\n  return arr.map(x => [x, arr.filter(y => y === x).length]);  // O(n²)\n}\nfunction freqGood(arr) {\n  const freq = new Map();\n  for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);\n  return [...freq];  // O(n)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Nested Loops — O(n²) Detection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Sort+two-pointers, group-by, matrix patterns, decision guide\n// STRENGTHS - The complete toolkit for eliminating O(n²)\n// WEAKNESSES- N/A\n//\n// 1) SORT + TWO POINTERS — O(n²) -> O(n log n) for pair problems\n//    When you need pairs that satisfy a condition on a sorted array:\nfunction pairSumSorted(arr, target) {\n  arr.sort((a, b) => a - b);  // O(n log n)\n  let lo = 0, hi = arr.length - 1;\n  while (lo < hi) {\n    const sum = arr[lo] + arr[hi];\n    if (sum === target) return [arr[lo], arr[hi]];\n    if (sum < target) lo++; else hi--;\n  }\n  return null;\n}\n// 2) GROUP BY — O(n²) -> O(n) with Map\nfunction groupByBad(arr, keyFn) {\n  const groups = [];\n  for (const item of arr) {\n    const key = keyFn(item);\n    let group = groups.find(g => g.key === key);  // O(n) search!\n    if (!group) { group = { key, items: [] }; groups.push(group); }\n    group.items.push(item);\n  }\n  return groups;\n}\nfunction groupByGood(arr, keyFn) {\n  const groups = new Map();\n  for (const item of arr) {\n    const key = keyFn(item);\n    (groups.get(key) ?? groups.set(key, []).get(key)).push(item);\n  }\n  return groups;\n}\n// 3) MATRIX SEARCH — O(n*m) -> O(n + m) on sorted matrix\nfunction searchMatrix(matrix, target) {\n  if (!matrix.length) return false;\n  let row = 0, col = matrix[0].length - 1;  // start top-right\n  while (row < matrix.length && col >= 0) {\n    if (matrix[row][col] === target) return true;\n    if (matrix[row][col] < target) row++;\n    else col--;\n  }\n  return false;\n}\n// Decision rule:\n//   inner loop searches for a value                    -> Set/Map — O(n)\n//   inner loop counts occurrences                      -> Map frequency — O(n)\n//   inner loop checks membership                       -> Set.has() — O(n)\n//   pair-finding on sorted data                        -> sort + two pointers — O(n log n)\n//   pair-finding on unsorted data                      -> Map — O(n)\n//   group elements by key                              -> Map — O(n)\n//   search in sorted matrix                            -> staircase search — O(n + m)\n//\n// Anti-pattern: nested loop where inner loop searches;\n//   if the inner loop is looking for something, a hash map makes it O(1) per lookup."
                  }
        ],
        tips: [
                  "If the inner loop searches for a value, replace it with a Set/Map — O(n²) -> O(n)",
                  "For pair-finding on sorted arrays, use two pointers — O(n log n) total",
                  "For group-by, use Map — not array.find which is O(n) per group",
                  "Staircase search on sorted matrices is O(n + m) — start from top-right corner"
        ],
        mistake: "Using `arr.filter(x => otherArr.includes(x))` for array intersection. `includes()` is O(n), making it O(n*m). Use `const set = new Set(otherArr); arr.filter(x => set.has(x))` for O(n+m).",
        shorthand: {
          verbose: "for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    if (arr[i] + arr[j] === target) return [i, j];\n  }\n}",
          concise: "const seen = new Map();\nfor (let i = 0; i < n; i++) {\n  const need = target - arr[i];\n  if (seen.has(need)) return [seen.get(need), i];\n  seen.set(arr[i], i);\n}",
        },
      },
      {
        id: "chained-iteration",
        fn: "Chained Array Methods — O(n) per Chain",
        desc: "Each .map().filter().reduce() is a separate O(n) pass — fuse when possible.",
        category: "Performance",
        subtitle: "Multiple O(n) passes vs single-pass reduce — fuse for hot paths",
        signature: "arr.map(f).filter(g).reduce(h) // 3 passes, O(3n) | reduce // 1 pass, O(n)",
        descLong: "Chaining array methods is readable but each method creates a new intermediate array and iterates from scratch. map+filter+reduce is 3 passes (O(3n)). For hot paths, fuse into a single reduce or for loop (O(n)). For most code, the readability of chaining outweighs the constant-factor cost.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Chained Array Methods — O(n) per Chain — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Chained methods vs single-pass loop\n// STRENGTHS - Shows the readability vs performance tradeoff\n// WEAKNESSES- No reduce fusion, no benchmarking\n//\n// CHAINED: 3 passes, 2 intermediate arrays — O(3n)\nconst result = [1, 2, 3, 4, 5]\n  .map(x => x * 2)       // pass 1: [2, 4, 6, 8, 10]\n  .filter(x => x > 5)    // pass 2: [6, 8, 10]\n  .reduce((a, b) => a + b, 0);  // pass 3: 24\n// SINGLE PASS: 1 pass, no intermediates — O(n)\nlet sum = 0;\nfor (const x of [1, 2, 3, 4, 5]) {\n  const doubled = x * 2;\n  if (doubled > 5) sum += doubled;\n}\nconsole.log(sum);  // 24"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Chained Array Methods — O(n) per Chain — common patterns you'll see in production.\n// APPROACH  - Combine Chained Array Methods — O(n) per Chain with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Reduce fusion, flatMap, and when to optimize\n// STRENGTHS - Shows how to fuse chains without losing readability\n// WEAKNESSES- No benchmarking, no engine optimization discussion\n//\n// 1) REDUCE FUSION — map + filter in one reduce\nconst result = [1, 2, 3, 4, 5].reduce((acc, x) => {\n  const doubled = x * 2;\n  if (doubled > 5) acc.push(doubled);  // map + filter in one pass\n  return acc;\n}, []);\n// [6, 8, 10]\n// 2) flatMap — map + flat in one pass\nconst nested = [1, 2, 3].flatMap(x => [x, x * 10]);\n// [1, 10, 2, 20, 3, 30] — one pass, not .map().flat()\n// 3) WHEN TO OPTIMIZE — most code doesn't need this\n//    For n < 1000, the difference is < 1ms — not worth the readability cost.\n//    For n > 10000 or hot paths (called frequently), fuse into a single pass.\n// 4) CHAINING with toSorted — sort is O(n log n), so it dominates\n//    arr.filter(f).map(g).toSorted(cmp)  -> O(n) + O(n) + O(n log n) = O(n log n)\n//    The sort dominates, so fusing filter+map saves little."
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Chained Array Methods — O(n) per Chain — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Benchmarking, engine optimizations, transducers, decision guide\n// STRENGTHS - The patterns for when chaining matters and when it doesn't\n// WEAKNESSES- N/A\n//\n// 1) BENCHMARK — 100k elements, map + filter + reduce\n//    Chained:   ~15ms  (3 passes, 2 intermediate arrays)\n//    For loop:  ~5ms   (1 pass, no intermediates)\n//    Reduce:    ~8ms   (1 pass, 1 accumulator array)\n//    Difference is ~10ms — only matters in hot paths\n// 2) V8 OPTIMIZATION — inline caching and hidden classes\n//    V8 optimizes chained methods well for monomorphic call sites.\n//    But intermediate arrays still allocate — GC pressure matters.\n// 3) TRANSDUCERS — functional approach to fuse map/filter/reduce\n//    Libraries like Ramda provide transducers that compose transformations\n//    into a single pass without intermediate arrays.\n//    const xf = compose(map(x => x * 2), filter(x => x > 5));\n//    transduce(xf, (a, b) => a + b, 0, arr);  // single pass\n// 4) LAZY EVALUATION — generators for pipeline without intermediaries\nfunction* mapGen(arr, fn) { for (const x of arr) yield fn(x); }\nfunction* filterGen(arr, pred) { for (const x of arr) if (pred(x)) yield x; }\n// No intermediate arrays — each element flows through the pipeline one at a time\nconst lazy = [...filterGen(mapGen([1, 2, 3, 4, 5], x => x * 2), x => x > 5)];\n// [6, 8, 10] — only one array allocated (the final spread)\n// Decision rule:\n//   n < 1000 or non-hot path                          -> chain for readability\n//   n > 10000 or hot path                             -> fuse into single pass\n//   map + filter only                                 -> reduce or flatMap\n//   map + flat                                        -> flatMap (single pass)\n//   complex pipeline with early exit                  -> generators (lazy)\n//   functional purity required                        -> transducers\n//   sort in the chain                                 -> sort dominates, fusing others saves little\n//\n// Anti-pattern: fusing chains prematurely;\n//   for n < 1000, readability matters more than the ~10ms difference. Only fuse hot paths."
                  }
        ],
        tips: [
                  "Each chained method is a separate O(n) pass — map+filter+reduce is O(3n)",
                  "Fuse into a single reduce or for loop for hot paths with n > 10000",
                  "flatMap does map + flat in one pass — prefer over .map().flat()",
                  "Generators provide lazy evaluation — no intermediate arrays in the pipeline"
        ],
        mistake: "Prematurely fusing readable chained methods for small arrays. For n < 1000, the ~10ms difference doesn't matter. Only fuse hot paths with large data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst result = arr.map(x => x * 2).filter(x => x > 4).map(x => x + 1);\n// More explicit but longer",
          concise: "const result = arr.reduce((acc, x) => {\n  const d = x * 2;\n  if (d > 4) acc.push(d + 1);\n  return acc;\n}, []);",
        },
      },
      {
        id: "hot-path-optimization",
        fn: "Hot Path Optimization",
        desc: "Identify and optimize code that runs frequently or on large inputs.",
        category: "Performance",
        subtitle: "Measure first, optimize second — avoid premature optimization",
        signature: "console.time() | performance.now() | console.profile()",
        descLong: "A hot path is code that runs many times or processes large data. Optimize hot paths by: (1) reducing algorithmic complexity (O(n²) -> O(n)), (2) avoiding allocations in loops, (3) using typed arrays for numeric data, (4) caching/memoizing expensive computations. Always measure before and after — never optimize blindly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Hot Path Optimization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Measure with performance.now() before optimizing\n// STRENGTHS - Shows the basic profiling pattern\n// WEAKNESSES- No optimization techniques, no benchmarking methodology\n//\nconst { performance } = require('perf_hooks');  // Node.js\n// Browser: just use performance.now()\nfunction measure(fn, label) {\n  const start = performance.now();\n  fn();\n  const end = performance.now();\n  console.log(`${label}: ${(end - start).toFixed(2)}ms`);\n}\nmeasure(() => {\n  let sum = 0;\n  for (let i = 0; i < 1000000; i++) sum += i;\n}, 'sum 1M');  // ~5ms"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Hot Path Optimization — common patterns you'll see in production.\n// APPROACH  - Combine Hot Path Optimization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Avoid allocations, cache lookups, use typed arrays\n// STRENGTHS - The three most impactful optimizations\n// WEAKNESSES- No V8 internals, no deoptimization triggers\n//\n// 1) AVOID ALLOCATIONS in hot loops\n// BAD: creates a new object every iteration\nfunction bad(arr) {\n  return arr.map(x => ({ value: x, squared: x * x }));\n}\n// GOOD: pre-allocate typed arrays\nfunction good(arr) {\n  const values = new Float64Array(arr.length);\n  const squared = new Float64Array(arr.length);\n  for (let i = 0; i < arr.length; i++) {\n    values[i] = arr[i];\n    squared[i] = arr[i] * arr[i];\n  }\n  return { values, squared };\n}\n// 2) CACHE LOOKUPS — avoid repeated property access\n// BAD: arr.length accessed every iteration (V8 usually optimizes this, but...)\nfor (let i = 0; i < arr.length; i++) { ... }\n// GOOD: cache length (marginal, but helps in some engines)\nfor (let i = 0, len = arr.length; i < len; i++) { ... }\n// 3) USE TYPED ARRAYS for numeric data — no boxing, no GC pressure\n// BAD: regular array of numbers — each number may be boxed\nconst nums = [1.1, 2.2, 3.3];\n// GOOD: Float64Array — contiguous memory, no boxing\nconst nums64 = new Float64Array([1.1, 2.2, 3.3]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Hot Path Optimization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - V8 deoptimization, hidden classes, monomorphism, decision guide\n// STRENGTHS - Engine-level patterns for maximum performance\n// WEAKNESSES- N/A\n//\n// 1) HIDDEN CLASSES — V8 optimizes objects with stable shapes\n//    Adding/removing properties after creation creates new hidden classes.\n//    Always initialize all properties in the constructor.\nclass Point {\n  constructor(x, y) {\n    this.x = x;  // hidden class 1\n    this.y = y;  // hidden class 2\n    // DON'T add properties later: this.z = 0;  // new hidden class -> deopt\n  }\n}\n// 2) MONOMORPHISM — functions called with same argument types are optimized\n//    V8 inlines and optimizes monomorphic call sites.\n//    Passing different types (number then string) causes deoptimization.\nfunction add(a, b) { return a + b; }\nadd(1, 2);      // monomorphic — V8 optimizes\nadd('x', 'y');  // polymorphic — V8 deoptimizes (different hidden class)\n// 3) AVOID arguments object — use rest params or named params\n// BAD: arguments prevents some V8 optimizations\nfunction bad() { return Array.from(arguments).reduce((a, b) => a + b); }\n// GOOD: rest params are optimized\nfunction good(...args) { return args.reduce((a, b) => a + b); }\n// 4) BENCHMARK methodology — run multiple times, discard outliers\nfunction benchmark(fn, iterations = 100) {\n  // Warm up\n  for (let i = 0; i < 10; i++) fn();\n  // Measure\n  const times = [];\n  for (let i = 0; i < iterations; i++) {\n    const start = performance.now();\n    fn();\n    times.push(performance.now() - start);\n  }\n  times.sort((a, b) => a - b);\n  const median = times[Math.floor(times.length / 2)];\n  const p95 = times[Math.floor(times.length * 0.95)];\n  return { median, p95, min: times[0], max: times.at(-1) };\n}\n// Decision rule:\n//   code runs once or rarely                         -> don't optimize\n//   code runs in a loop with n < 1000                -> don't optimize\n//   code runs in a loop with n > 10000               -> reduce allocations\n//   code runs on every frame / every request         -> hot path, optimize\n//   numeric data processing                           -> typed arrays\n//   repeated expensive computation                    -> memoize\n//   object shape changes after creation               -> fix: init all props in constructor\n//   function receives mixed argument types            -> fix: keep monomorphic\n//\n// Anti-pattern: optimizing without measuring;\n//   intuition about performance is often wrong. Always benchmark before and after."
                  }
        ],
        tips: [
                  "Always measure with performance.now() before and after optimizing",
                  "Avoid object allocations in hot loops — pre-allocate typed arrays",
                  "Initialize all properties in constructors — adding properties later deoptimizes V8",
                  "Keep functions monomorphic — don't pass different types to the same function"
        ],
        mistake: "Optimizing code without measuring first. Intuition about performance is often wrong. Always benchmark before and after with `performance.now()`.",
        shorthand: {
          verbose: "for (let i = 0; i < arr.length; i++) {\n  if (arr[i].status === 'active' && arr[i].role === 'admin') {\n    results.push(arr[i]);\n  }\n}",
          concise: "const activeAdmins = arr.filter(x => x.status === 'active' && x.role === 'admin');",
        },
      },
    ],
  },
]

export default { meta, sections }
