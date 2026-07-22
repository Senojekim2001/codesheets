export const meta = {
  "title": "Data Structures & Algorithms",
  "domain": "javascript",
  "sheet": "dsa",
  "icon": "🌲"
}

export const sections = [

  // ── Section 1: Core Data Structures & Sorting ─────────────────────────────────────────
  {
    id: "structures",
    title: "Core Data Structures & Sorting",
    entries: [
      {
        id: "stack",
        fn: "Stack",
        desc: "Last-In, First-Out sequential container.",
        category: "Structures",
        subtitle: "Use an array — push() pushes, pop() pops from the top",
        signature: "stack.push(x) | stack.pop() | stack.at(-1)",
        descLong: "A stack follows LIFO order. JS arrays work perfectly as stacks — push() appends, pop() removes from the end. Both are O(1) amortized. Use stack.at(-1) to peek without removing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Stack — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - An array IS a stack: push() pushes, pop() pops\n// STRENGTHS - Smallest valid stack; O(1) amortized for both\n// WEAKNESSES- No real-world use case; no peek discussion\n//\nconst stack = [];\nstack.push(1);           // push\nstack.push(2);\nstack.push(3);\nconsole.log(stack.at(-1)); // 3 — peek (no removal)\nconsole.log(stack.pop());  // 3 — pop from top\nconsole.log(stack);        // [1, 2]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Stack — common patterns you'll see in production.\n// APPROACH  - Combine Stack with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Two classic uses: balanced parens, postfix eval\n// STRENGTHS - Shows the LIFO mental model on real problems\n// WEAKNESSES- No monotonic stack patterns yet\n//\nfunction isBalanced(s) {\n  const pair = { ')': '(', ']': '[', '}': '{' };\n  const stack = [];\n  for (const c of s) {\n    if ('([{'.includes(c)) stack.push(c);\n    else if (')]}'.includes(c)) {\n      if (stack.pop() !== pair[c]) return false;\n    }\n  }\n  return stack.length === 0;\n}\nconsole.log(isBalanced('([{}])'));           // true\nconsole.log(isBalanced('([)]'));             // false\nfunction evalPostfix(expr) {\n  const stack = [];\n  const ops = {\n    '+': (a, b) => a + b, '-': (a, b) => a - b,\n    '*': (a, b) => a * b, '/': (a, b) => Math.trunc(a / b),\n  };\n  for (const tok of expr.split(' ')) {\n    if (tok in ops) {\n      const b = stack.pop(), a = stack.pop();\n      stack.push(ops[tok](a, b));\n    } else { stack.push(Number(tok)); }\n  }\n  return stack[0];\n}\nconsole.log(evalPostfix('2 3 + 4 *'));       // 20"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Stack — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Monotonic stack; iterative DFS; undo/redo\n// STRENGTHS - Patterns that turn \"use a stack\" into a real tool\n// WEAKNESSES- N/A\n//\n// 1) MONOTONIC STACK — \"next greater element\" in O(n)\nfunction nextGreater(nums) {\n  const n = nums.length;\n  const out = new Array(n).fill(-1);\n  const stack = [];                           // holds INDICES, not values\n  for (let i = 0; i < n; i++) {\n    while (stack.length && nums[stack.at(-1)] < nums[i]) {\n      out[stack.pop()] = nums[i];\n    }\n    stack.push(i);\n  }\n  return out;\n}\n// nextGreater([2, 1, 2, 4, 3]) -> [4, 2, 4, -1, -1]\n// 2) ITERATIVE DFS — avoid stack overflow on deep input\nfunction dfs(graph, start) {\n  const visited = new Set();\n  const stack = [start];\n  while (stack.length) {\n    const node = stack.pop();\n    if (visited.has(node)) continue;\n    visited.add(node);\n    stack.push(...(graph.get(node) ?? []).reverse());\n  }\n  return visited;\n}\n// 3) Undo/redo with two stacks\nclass UndoRedo {\n  #undo = []; #redo = [];\n  do(action)    { this.#undo.push(action); action.apply(); this.#redo = []; }\n  undo()        { const a = this.#undo.pop(); if (a) { a.revert(); this.#redo.push(a); } }\n  redo()        { const a = this.#redo.pop(); if (a) { a.apply();   this.#undo.push(a); } }\n}\n// Decision rule:\n//   simple LIFO                         -> array with push/pop\n//   \"next greater / smaller\" problem    -> monotonic stack of INDICES\n//   tree/graph DFS, deep input          -> iterative stack, NOT recursion\n//   parsing nested structure            -> stack of \"open\" markers\n//   undo/redo                           -> two stacks (undo + redo)\n//\n// Anti-pattern: stack.shift()\n//   That removes from the FRONT and is O(n). pop() removes from the TOP and is O(1)."
                  }
        ],
        tips: [
                  "JS array as stack is O(1) amortized for both push and pop",
                  "`stack.at(-1)` peeks the top without removing",
                  "Stacks power: function call frames, undo operations, DFS, expression parsing",
                  "Use iterative DFS for deep graphs — JS engines have ~10k-25k recursion limits"
        ],
        mistake: "Using `shift()` thinking it pops from the \"top\". `shift()` is O(n) and removes from the front. A stack pops from the back: `pop()`.",
        shorthand: {
          verbose: "const stack = [];\nstack.push(1); stack.push(2);\nconst top = stack[stack.length - 1];\nstack.pop();",
          concise: "const stack = [];\nstack.push(1); stack.push(2);\nconst top = stack.at(-1);\nstack.pop();",
        },
      },
      {
        id: "queue",
        fn: "Queue",
        desc: "First-In, First-Out container — JS has no built-in deque, so use push/shift or a custom class.",
        category: "Structures",
        subtitle: "Array push/shift for small queues; custom class for performance",
        signature: "q.push(x) | q.shift() | q[0]",
        descLong: "JS arrays can act as queues with push() to enqueue and shift() to dequeue, but shift() is O(n). For performance-critical code, use a circular buffer or a linked-list-based queue. For BFS and small queues, push/shift is fine.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Queue — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Array push + shift = FIFO (but shift is O(n))\n// STRENGTHS - Smallest valid queue; works for small inputs\n// WEAKNESSES- shift() is O(n) — don't use for large queues\n//\nconst q = [];\nq.push(1); q.push(2); q.push(3);   // enqueue at the right\nconsole.log(q.shift());            // 1 — FIFO dequeue\nconsole.log(q[0]);                 // 2 — peek without removing"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Queue — common patterns you'll see in production.\n// APPROACH  - Combine Queue with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - BFS using a queue, level-by-level\n// STRENGTHS - The canonical use case for FIFO\n// WEAKNESSES- shift() is O(n); no circular buffer yet\n//\nfunction bfs(graph, start) {\n  const visited = new Set([start]);\n  const q = [start];\n  const order = [];\n  while (q.length) {\n    const node = q.shift();               // FIFO -> visits by distance\n    order.push(node);\n    for (const next of graph[node] ?? []) {\n      if (!visited.has(next)) {\n        visited.add(next);\n        q.push(next);\n      }\n    }\n  }\n  return order;\n}\nconst graph = { 0: [1, 2], 1: [3], 2: [3], 3: [] };\nconsole.log(bfs(graph, 0));               // [0, 1, 2, 3]\n// Shortest path in an UNWEIGHTED graph\nfunction shortestPath(graph, src, dst) {\n  const parent = new Map([[src, null]]);\n  const q = [src];\n  while (q.length) {\n    const n = q.shift();\n    if (n === dst) {\n      const path = [];\n      let cur = n;\n      while (cur !== null) { path.push(cur); cur = parent.get(cur); }\n      return path.reverse();\n    }\n    for (const next of graph[n] ?? []) {\n      if (!parent.has(next)) { parent.set(next, n); q.push(next); }\n    }\n  }\n  return null;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Queue — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - O(1) circular buffer queue; linked-list queue; decision guide\n// STRENGTHS - The decision matrix that prevents the wrong primitive\n// WEAKNESSES- N/A\n//\n// 1) CIRCULAR BUFFER — O(1) enqueue/dequeue, fixed capacity\nclass CircularQueue {\n  constructor(capacity) {\n    this.buf = new Array(capacity);\n    this.head = 0; this.tail = 0; this.size = 0;\n    this.cap = capacity;\n  }\n  push(x) {\n    if (this.size === this.cap) throw new Error('Queue full');\n    this.buf[this.tail] = x;\n    this.tail = (this.tail + 1) % this.cap;\n    this.size++;\n  }\n  shift() {\n    if (this.size === 0) return undefined;\n    const x = this.buf[this.head];\n    this.head = (this.head + 1) % this.cap;\n    this.size--;\n    return x;\n  }\n  peek() { return this.size ? this.buf[this.head] : undefined; }\n}\n// 2) LINKED-LIST QUEUE — O(1) enqueue/dequeue, unbounded\nclass Node { constructor(val) { this.val = val; this.next = null; } }\nclass LinkedQueue {\n  #head = null; #tail = null; #size = 0;\n  push(x) {\n    const node = new Node(x);\n    if (this.#tail) this.#tail.next = node;\n    else            this.#head = node;\n    this.#tail = node;\n    this.#size++;\n  }\n  shift() {\n    if (!this.#head) return undefined;\n    const x = this.#head.val;\n    this.#head = this.#head.next;\n    if (!this.#head) this.#tail = null;\n    this.#size--;\n    return x;\n  }\n  get length() { return this.#size; }\n}\n// Decision rule:\n//   small queue, simple code               -> array push/shift (O(n) shift is fine)\n//   performance-critical, fixed capacity    -> CircularQueue\n//   performance-critical, unbounded         -> LinkedQueue\n//   BFS on small/medium graph               -> array push/shift\n//   BFS on huge graph                       -> LinkedQueue\n//   producer/consumer across async          -> async queue with promises\n//\n// Anti-pattern: array shift() on a large queue\n//   O(n) — every dequeue physically shifts the rest. Use a circular buffer\n//   or linked list for queues that grow beyond a few hundred elements."
                  }
        ],
        tips: [
                  "`shift()` is O(n) — fine for small queues, use a circular buffer or linked list for large ones",
                  "BFS always uses a queue; DFS always uses a stack (or recursion)",
                  "JS has no built-in deque — implement one with a circular buffer or linked list",
                  "For async producer/consumer, use a promise-based queue pattern"
        ],
        mistake: "Using `shift()` on a large queue. This is O(n) — it physically shifts every remaining element. Use a circular buffer or linked list for O(1) dequeue.",
        shorthand: {
          verbose: "const queue = [];\nqueue.push(1); queue.push(2);\nconst first = queue.shift();",
          concise: "const queue = [];\nqueue.push(1); queue.push(2);\nconst first = queue[0];\nqueue.splice(0, 1);",
        },
      },
      {
        id: "linked-list",
        fn: "Linked List",
        desc: "Node-based linear structure — O(1) insert/delete at head, O(n) random access.",
        category: "Structures",
        subtitle: "Singly and doubly linked lists from scratch",
        signature: "class Node { constructor(val) { this.val = val; this.next = null; } }",
        descLong: "JS has no built-in linked list — arrays serve most use cases. But linked lists are essential for queues, hash map buckets, and interview problems. Singly linked: O(1) head insert/delete. Doubly linked: O(1) at both ends, O(1) deletion if you have the node reference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Linked List — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Build a singly linked list node by node\n// STRENGTHS - Smallest valid linked list; shows the node/next structure\n// WEAKNESSES- No traversal, no insertion, no deletion\n//\nclass Node {\n  constructor(val) { this.val = val; this.next = null; }\n}\nconst head = new Node(1);\nhead.next = new Node(2);\nhead.next.next = new Node(3);\n// Traverse: 1 -> 2 -> 3 -> null\nlet cur = head;\nwhile (cur) { console.log(cur.val); cur = cur.next; }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Linked List — common patterns you'll see in production.\n// APPROACH  - Combine Linked List with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Singly linked list with prepend, append, delete, and reverse\n// STRENGTHS - Covers the 80% of linked list operations\n// WEAKNESSES- No doubly linked; no cycle detection\n//\nclass Node {\n  constructor(val) { this.val = val; this.next = null; }\n}\nclass SinglyLinkedList {\n  #head = null; #size = 0;\n  prepend(val) {\n    const node = new Node(val);\n    node.next = this.#head; this.#head = node; this.#size++;\n    return this;\n  }\n  append(val) {\n    const node = new Node(val);\n    if (!this.#head) { this.#head = node; }\n    else { let cur = this.#head; while (cur.next) cur = cur.next; cur.next = node; }\n    this.#size++; return this;\n  }\n  delete(val) {\n    if (!this.#head) return false;\n    if (this.#head.val === val) { this.#head = this.#head.next; this.#size--; return true; }\n    let cur = this.#head;\n    while (cur.next && cur.next.val !== val) cur = cur.next;\n    if (cur.next) { cur.next = cur.next.next; this.#size--; return true; }\n    return false;\n  }\n  reverse() {\n    let prev = null, cur = this.#head;\n    while (cur) { const next = cur.next; cur.next = prev; prev = cur; cur = next; }\n    this.#head = prev; return this;\n  }\n  get length() { return this.#size; }\n  toArray() {\n    const arr = []; let cur = this.#head;\n    while (cur) { arr.push(cur.val); cur = cur.next; }\n    return arr;\n  }\n}\nconst list = new SinglyLinkedList();\nlist.append(1).append(2).append(3).prepend(0);\nconsole.log(list.toArray());  // [0, 1, 2, 3]\nlist.reverse();\nconsole.log(list.toArray());  // [3, 2, 1, 0]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Linked List — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Doubly linked list, cycle detection (Floyd), merge sort, find middle\n// STRENGTHS - The patterns that make linked lists useful in production\n// WEAKNESSES- N/A\n//\n// 1) DOUBLY LINKED LIST — O(1) deletion when you have the node\nclass DNode {\n  constructor(val) { this.val = val; this.prev = null; this.next = null; }\n}\nclass DoublyLinkedList {\n  #head = null; #tail = null;\n  prepend(val) {\n    const node = new DNode(val);\n    if (!this.#head) { this.#head = this.#tail = node; }\n    else { node.next = this.#head; this.#head.prev = node; this.#head = node; }\n  }\n  removeNode(node) {\n    if (node.prev) node.prev.next = node.next; else this.#head = node.next;\n    if (node.next) node.next.prev = node.prev; else this.#tail = node.prev;\n  }\n}\n// 2) FLOYD'S CYCLE DETECTION — O(n) time, O(1) space\nfunction hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next; fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n// 3) MERGE TWO SORTED LISTS — recursive pointer rewiring\nfunction mergeSorted(a, b) {\n  if (!a) return b; if (!b) return a;\n  if (a.val <= b.val) { a.next = mergeSorted(a.next, b); return a; }\n  else { b.next = mergeSorted(a, b.next); return b; }\n}\n// 4) FIND MIDDLE — fast/slow pointer (no length tracking needed)\nfunction findMiddle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }\n  return slow;\n}\n// Decision rule:\n//   need O(1) head insert/delete              -> singly linked list\n//   need O(1) tail insert + O(1) delete       -> doubly linked list\n//   need O(1) random access                   -> array (not linked list)\n//   detect cycle in a list                    -> Floyd's tortoise/hare\n//   merge two sorted lists                    -> recursive pointer rewiring\n//   find middle without length                -> fast/slow pointer\n//\n// Anti-pattern: using a linked list when you need random access;\n//   linked list arr[i] is O(n) — arrays are O(1)."
                  }
        ],
        tips: [
                  "JS has no built-in linked list — arrays cover most use cases",
                  "Singly linked: O(1) prepend, O(n) append unless you track tail",
                  "Doubly linked: O(1) deletion when you have the node reference",
                  "Use fast/slow pointers for cycle detection and middle-finding without length"
        ],
        mistake: "Using a linked list when you need random access by index. Linked list access is O(n); arrays are O(1). Use arrays unless you need O(1) insertion/deletion at known positions.",
        shorthand: {
          verbose: "class Node {\n  constructor(val) { this.val = val; this.next = null; }\n}",
          concise: "const node = { val, next: null };",
        },
      },
      {
        id: "hashmap",
        fn: "HashMap / Map",
        desc: "O(1) average key-value lookup — the most-used data structure.",
        category: "Structures",
        subtitle: "Map vs Object vs WeakMap — pick the right key-value store",
        signature: "new Map() | map.set(k, v) | map.get(k) | map.has(k)",
        descLong: "JS has three key-value stores: plain objects (string/symbol keys), Map (any key type, preserves insertion order, iterable), and WeakMap (object keys only, garbage-collectible). Map is the right default for hash map use.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HashMap / Map — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Map with set/get/has/delete — O(1) average\n// STRENGTHS - Smallest valid hash map; shows all core operations\n// WEAKNESSES- No Object comparison, no iteration, no WeakMap\n//\nconst map = new Map();\nmap.set('name', 'Alice');\nmap.set('age', 30);\nconsole.log(map.get('name'));   // 'Alice'\nconsole.log(map.has('age'));    // true\nconsole.log(map.size);          // 2\nmap.delete('age');\nconsole.log(map.size);          // 1"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HashMap / Map — common patterns you'll see in production.\n// APPROACH  - Combine HashMap / Map with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Frequency counter, two-sum, and iteration patterns\n// STRENGTHS - Covers the 80% of Map usage in algorithms\n// WEAKNESSES- No WeakMap, no Object vs Map decision guide\n//\n// 1) FREQUENCY COUNTER — count occurrences in O(n)\nfunction frequency(arr) {\n  const freq = new Map();\n  for (const x of arr) freq.set(x, (freq.get(x) ?? 0) + 1);\n  return freq;\n}\nconsole.log(frequency([1, 2, 2, 3, 3, 3]));  // Map { 1=>1, 2=>2, 3=>3 }\n// 2) TWO SUM — find two numbers that add to target in O(n)\nfunction twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (seen.has(comp)) return [seen.get(comp), i];\n    seen.set(nums[i], i);\n  }\n  return null;\n}\nconsole.log(twoSum([2, 7, 11, 15], 9));  // [0, 1]\n// 3) ITERATION — Map preserves insertion order\nconst map = new Map([['a', 1], ['b', 2], ['c', 3]]);\nfor (const [key, value] of map) console.log(key, value);\nconst entries = [...map];       // [['a',1], ['b',2], ['c',3]]\nconst keys = [...map.keys()];   // ['a', 'b', 'c']\nconst values = [...map.values()]; // [1, 2, 3]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HashMap / Map — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Map vs Object vs WeakMap; object keys; LRU cache; performance\n// STRENGTHS - The decision matrix for choosing the right key-value store\n// WEAKNESSES- N/A\n//\n// 1) OBJECT KEYS — Map can use objects as keys (Object cannot)\nconst objKey = { id: 1 };\nconst map = new Map();\nmap.set(objKey, 'user data');\nmap.get(objKey);                    // 'user data'\n// Object keys use reference equality — two { id: 1 } are NOT the same key\n// 2) WEAKMAP — keys are garbage-collected when the object dies\nconst weak = new WeakMap();\nlet user = { name: 'Alice' };\nweak.set(user, { meta: 'session data' });\nuser = null;                        // entry eligible for GC — no memory leak\n// 3) LRU CACHE — Map preserves insertion order; delete+set = \"move to end\"\nclass LRU {\n  #cap; #map;\n  constructor(capacity) { this.#cap = capacity; this.#map = new Map(); }\n  get(key) {\n    if (!this.#map.has(key)) return -1;\n    const val = this.#map.get(key);\n    this.#map.delete(key); this.#map.set(key, val);  // move to end\n    return val;\n  }\n  put(key, val) {\n    if (this.#map.has(key)) this.#map.delete(key);\n    this.#map.set(key, val);\n    if (this.#map.size > this.#cap) {\n      const oldest = this.#map.keys().next().value;\n      this.#map.delete(oldest);\n    }\n  }\n}\n// Decision rule:\n//   string/symbol keys only, small set              -> plain object\n//   any key type (objects, numbers, functions)       -> Map\n//   need insertion-order iteration                   -> Map\n//   need .size property                              -> Map\n//   object keys that should GC when object dies      -> WeakMap\n//   frequent add/delete on large dataset             -> Map (faster than object)\n//   LRU cache                                        -> Map with delete+set trick\n//   JSON serialization needed                        -> plain object\n//\n// Anti-pattern: using plain objects as a hash map with non-string keys;\n//   object keys are coerced to strings — { 1: 'a' } and { '1': 'a' } collide."
                  }
        ],
        tips: [
                  "Map accepts any key type — Object only accepts strings/symbols",
                  "Map preserves insertion order; Object key order is more nuanced",
                  "WeakMap keys are weakly held — entries vanish when the key object is GC'd",
                  "Map has .size; Object needs Object.keys(obj).length"
        ],
        mistake: "Using a plain Object as a hash map with non-string keys. Object keys are coerced to strings. Use `Map` for any-key lookups.",
        shorthand: {
          verbose: "const map = {};\nmap['key'] = 'value';\nconst val = map['key'];",
          concise: "const map = new Map();\nmap.set('key', 'value');\nconst val = map.get('key');",
        },
      },
      {
        id: "set",
        fn: "Set",
        desc: "Collection of unique values — O(1) add, delete, has.",
        category: "Structures",
        subtitle: "Deduplication, membership testing, and set operations",
        signature: "new Set() | set.add(x) | set.has(x) | set.delete(x)",
        descLong: "Set stores unique values of any type. O(1) average for add/delete/has. Use for deduplication, membership testing, and tracking visited elements. WeakSet is the weakly-held version for object members only.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Set — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Set with add/has/delete/size — O(1) average\n// STRENGTHS - Smallest valid set; shows all core operations\n// WEAKNESSES- No dedup, no set operations, no iteration\n//\nconst set = new Set();\nset.add(1); set.add(2); set.add(3); set.add(1);  // duplicate ignored\nconsole.log(set.has(2));  // true\nconsole.log(set.size);    // 3\nset.delete(2);\nconsole.log(set.size);    // 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Set — common patterns you'll see in production.\n// APPROACH  - Combine Set with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Deduplication, membership testing, and iteration\n// STRENGTHS - Covers the 80% of Set usage in daily code\n// WEAKNESSES- No set operations (union, intersection, difference)\n//\n// 1) DEDUPLICATE an array\nconst unique = [...new Set([1, 2, 2, 3, 3, 3, 4])]; // [1, 2, 3, 4]\n// 2) MEMBERSHIP testing — O(1) vs array.includes() O(n)\nconst validStatuses = new Set(['ok', 'error', 'pending']);\nconsole.log(validStatuses.has('ok'));      // true\n// 3) ITERATION — Set preserves insertion order\nfor (const val of new Set(['a', 'b', 'c'])) console.log(val);\n// 4) TRACKING visited elements in graph traversal\nfunction hasCycle(graph) {\n  const visited = new Set();\n  function dfs(node, parent) {\n    visited.add(node);\n    for (const next of graph[node] ?? []) {\n      if (next === parent) continue;\n      if (visited.has(next) || dfs(next, node)) return true;\n    }\n    return false;\n  }\n  return dfs(0, -1);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Set — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Set operations, WeakSet, and performance patterns\n// STRENGTHS - Union/intersection/difference; WeakSet; decision guide\n// WEAKNESSES- N/A\n//\nconst a = new Set([1, 2, 3, 4]);\nconst b = new Set([3, 4, 5, 6]);\nconst union        = new Set([...a, ...b]);\nconst intersection = new Set([...a].filter(x => b.has(x)));\nconst difference   = new Set([...a].filter(x => !b.has(x)));\nconst symDiff      = new Set(\n  [...a].filter(x => !b.has(x)).concat([...b].filter(x => !a.has(x)))\n);\n// WEAKSET — members are GC'd when the object dies\nconst processed = new WeakSet();\nfunction processOnce(obj) {\n  if (processed.has(obj)) return;\n  processed.add(obj);             // auto-cleaned when obj is GC'd\n}\n// Decision rule:\n//   deduplicate an array                    -> [...new Set(arr)]\n//   membership testing (frequent)           -> Set.has()\n//   track visited nodes/elements            -> Set\n//   union / intersection / difference       -> spread + filter\n//   tag objects as \"processed\"              -> WeakSet\n//   need index access                       -> array (Set has no indexing)\n//\n// Anti-pattern: array.includes() for frequent membership on large arrays;\n//   Set.has() is O(1) while includes() is O(n)."
                  }
        ],
        tips: [
                  "`[...new Set(arr)]` deduplicates an array in one expression",
                  "Set.has() is O(1) — use it over array.includes() for frequent membership tests",
                  "Set preserves insertion order — it's not unordered like some languages' sets",
                  "WeakSet lets you tag objects as \"processed\" without memory leaks"
        ],
        mistake: "Using `array.includes()` for frequent membership testing on large arrays. `Set.has()` is O(1) while `includes()` is O(n). Convert to a Set once, look up many times.",
        shorthand: {
          verbose: "const seen = {};\nseen[x] = true;\nif (seen[y]) { /* ... */ }",
          concise: "const seen = new Set();\nseen.add(x);\nif (seen.has(y)) { /* ... */ }",
        },
      },
      {
        id: "heap",
        fn: "Heap",
        desc: "Partially sorted tree — O(log n) insert, O(1) min/max access.",
        category: "Structures",
        subtitle: "Min-heap and max-heap with an array-backed binary tree",
        signature: "class Heap { push(x) | pop() | peek() }",
        descLong: "JS has no built-in heap or priority queue. A binary heap uses an array where the parent at index i has children at 2i+1 and 2i+2. Min-heap: parent <= children. Max-heap: parent >= children. O(log n) push and pop, O(1) peek. Essential for Dijkstra, scheduling, and top-K problems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Heap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Array-backed min-heap with push and pop\n// STRENGTHS - Smallest valid heap; shows sift-up and sift-down\n// WEAKNESSES- No max-heap, no heapify, no top-K\n//\nclass MinHeap {\n  #heap = [];\n  push(x) { this.#heap.push(x); this.#siftUp(this.#heap.length - 1); }\n  pop() {\n    if (!this.#heap.length) return undefined;\n    const top = this.#heap[0];\n    const last = this.#heap.pop();\n    if (this.#heap.length) { this.#heap[0] = last; this.#siftDown(0); }\n    return top;\n  }\n  peek() { return this.#heap[0]; }\n  get size() { return this.#heap.length; }\n  #siftUp(i) {\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.#heap[i] >= this.#heap[p]) break;\n      [this.#heap[i], this.#heap[p]] = [this.#heap[p], this.#heap[i]];\n      i = p;\n    }\n  }\n  #siftDown(i) {\n    const n = this.#heap.length;\n    while (true) {\n      const l = 2*i+1, r = 2*i+2;\n      let s = i;\n      if (l < n && this.#heap[l] < this.#heap[s]) s = l;\n      if (r < n && this.#heap[r] < this.#heap[s]) s = r;\n      if (s === i) break;\n      [this.#heap[i], this.#heap[s]] = [this.#heap[s], this.#heap[i]];\n      i = s;\n    }\n  }\n}\nconst h = new MinHeap();\nh.push(5); h.push(1); h.push(3);\nconsole.log(h.peek());  // 1\nconsole.log(h.pop());   // 1\nconsole.log(h.pop());   // 3"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Heap — common patterns you'll see in production.\n// APPROACH  - Combine Heap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Generic heap with comparator; Kth largest; max-heap\n// STRENGTHS - Covers the 80% of heap usage in algorithms\n// WEAKNESSES- No Dijkstra, no streaming top-K\n//\nclass Heap {\n  #heap = []; #cmp;\n  constructor(cmp = (a, b) => a - b) { this.#cmp = cmp; }\n  push(x) { this.#heap.push(x); this.#siftUp(this.#heap.length - 1); }\n  pop() {\n    if (!this.#heap.length) return undefined;\n    const top = this.#heap[0];\n    const last = this.#heap.pop();\n    if (this.#heap.length) { this.#heap[0] = last; this.#siftDown(0); }\n    return top;\n  }\n  peek() { return this.#heap[0]; }\n  get size() { return this.#heap.length; }\n  #siftUp(i) {\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.#cmp(this.#heap[i], this.#heap[p]) >= 0) break;\n      [this.#heap[i], this.#heap[p]] = [this.#heap[p], this.#heap[i]];\n      i = p;\n    }\n  }\n  #siftDown(i) {\n    const n = this.#heap.length;\n    while (true) {\n      const l = 2*i+1, r = 2*i+2;\n      let s = i;\n      if (l < n && this.#cmp(this.#heap[l], this.#heap[s]) < 0) s = l;\n      if (r < n && this.#cmp(this.#heap[r], this.#heap[s]) < 0) s = r;\n      if (s === i) break;\n      [this.#heap[i], this.#heap[s]] = [this.#heap[s], this.#heap[i]];\n      i = s;\n    }\n  }\n}\n// KTH LARGEST — maintain a min-heap of size K\nfunction kthLargest(nums, k) {\n  const heap = new Heap();\n  for (const n of nums) { heap.push(n); if (heap.size > k) heap.pop(); }\n  return heap.peek();\n}\nconsole.log(kthLargest([3, 2, 1, 5, 6, 4], 2));  // 5\n// MAX-HEAP — flip the comparator\nconst maxHeap = new Heap((a, b) => b - a);\nmaxHeap.push(3); maxHeap.push(1); maxHeap.push(5);\nconsole.log(maxHeap.pop());  // 5"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Heap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Dijkstra; streaming top-K; merge K sorted arrays; decision guide\n// STRENGTHS - The patterns that make heaps essential in production\n// WEAKNESSES- N/A\n//\n// 1) DIJKSTRA — shortest path in weighted graph with min-heap\nfunction dijkstra(graph, src) {\n  const dist = new Map();\n  for (const node of Object.keys(graph)) dist.set(Number(node), Infinity);\n  dist.set(src, 0);\n  const heap = new Heap((a, b) => a[0] - b[0]);  // [distance, node]\n  heap.push([0, src]);\n  while (heap.size) {\n    const [d, u] = heap.pop();\n    if (d > dist.get(u)) continue;\n    for (const [v, w] of graph[u] ?? []) {\n      const nd = d + w;\n      if (nd < dist.get(v)) { dist.set(v, nd); heap.push([nd, v]); }\n    }\n  }\n  return dist;\n}\n// 2) STREAMING TOP-K — keep a min-heap of size K across a data stream\nclass TopK {\n  #k; #heap;\n  constructor(k) { this.#k = k; this.#heap = new Heap(); }\n  add(x) { this.#heap.push(x); if (this.#heap.size > this.#k) this.#heap.pop(); }\n  topK() { return [...this.#heap.heap].sort((a, b) => b - a); }\n}\n// 3) MERGE K SORTED ARRAYS — push first element of each, pop smallest, push next\nfunction mergeK(arrays) {\n  const heap = new Heap((a, b) => a[0] - b[0]);\n  arrays.forEach((arr, i) => { if (arr.length) heap.push([arr[0], i, 0]); });\n  const result = [];\n  while (heap.size) {\n    const [val, ai, ei] = heap.pop();\n    result.push(val);\n    if (ei + 1 < arrays[ai].length) heap.push([arrays[ai][ei+1], ai, ei+1]);\n  }\n  return result;\n}\n// Decision rule:\n//   need \"smallest/largest so far\"                         -> min/max heap\n//   Kth largest / smallest                                 -> heap of size K\n//   streaming top-K                                        -> min-heap, evict when > K\n//   Dijkstra / A* / Prim                                   -> min-heap as priority queue\n//   merge K sorted sequences                               -> min-heap with source tracking\n//   just need max/min once                                 -> Math.max/min or .sort()\n//\n// Anti-pattern: sorting the entire array to find top-K;\n//   .sort() is O(n log n); a size-K heap is O(n log K). For K << n, the heap wins."
                  }
        ],
        tips: [
                  "JS has no built-in heap — implement one with an array (parent at i, children at 2i+1/2i+2)",
                  "Min-heap of size K gives O(n log K) top-K — better than O(n log n) full sort",
                  "Heapify (build from array) is O(n) — start from the last parent",
                  "Use a comparator for max-heap: `new Heap((a, b) => b - a)`"
        ],
        mistake: "Sorting the entire array to find the top-K elements. `.sort()` is O(n log n); a size-K heap is O(n log K), which is much faster when K is small.",
        shorthand: {
          verbose: "const heap = [];\nheap.push(val);\nheap.sort((a, b) => a - b);\nconst min = heap.shift();",
          concise: "const heap = new MinHeap();\nheap.push(val);\nconst min = heap.pop();",
        },
      },
      {
        id: "graph",
        fn: "Graph",
        desc: "Nodes connected by edges — represented as adjacency list.",
        category: "Structures",
        subtitle: "Adjacency list, BFS, DFS, Dijkstra, and topological sort",
        signature: "const graph = new Map(); graph.set(node, [[neighbor, weight]])",
        descLong: "Graphs model networks, dependencies, and relationships. Adjacency list (Map of node -> neighbors) is the standard representation. O(V+E) for BFS/DFS. Weighted graphs use [neighbor, weight] pairs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Graph — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Adjacency list with Map; add edges; traverse\n// STRENGTHS - Smallest valid graph; shows undirected edges\n// WEAKNESSES- No weighted edges, no BFS/DFS, no algorithms\n//\nconst graph = new Map();\nfunction addEdge(u, v) {\n  if (!graph.has(u)) graph.set(u, []);\n  if (!graph.has(v)) graph.set(v, []);\n  graph.get(u).push(v);\n  graph.get(v).push(u);                  // remove for directed graph\n}\naddEdge(0, 1); addEdge(0, 2); addEdge(1, 3); addEdge(2, 3);\nfor (const n of graph.get(0)) console.log(n);  // 1, 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Graph — common patterns you'll see in production.\n// APPROACH  - Combine Graph with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - BFS shortest path, DFS traversal, cycle detection\n// STRENGTHS - Covers the 80% of graph algorithms\n// WEAKNESSES- No weighted graphs, no topological sort\n//\n// 1) BFS — shortest path in unweighted graph\nfunction bfsShortestPath(graph, src, dst) {\n  const visited = new Set([src]);\n  const queue = [[src, [src]]];\n  while (queue.length) {\n    const [node, path] = queue.shift();\n    if (node === dst) return path;\n    for (const next of graph.get(node) ?? []) {\n      if (!visited.has(next)) {\n        visited.add(next);\n        queue.push([next, [...path, next]]);\n      }\n    }\n  }\n  return null;\n}\n// 2) DFS — recursive traversal with visited set\nfunction dfs(graph, node, visited = new Set()) {\n  if (visited.has(node)) return;\n  visited.add(node);\n  console.log(node);\n  for (const next of graph.get(node) ?? []) dfs(graph, next, visited);\n}\n// 3) CYCLE DETECTION in directed graph — DFS with \"in progress\" set\nfunction hasCycle(graph) {\n  const visited = new Set();\n  const inProgress = new Set();\n  function dfs(u) {\n    if (inProgress.has(u)) return true;\n    if (visited.has(u)) return false;\n    visited.add(u); inProgress.add(u);\n    for (const v of graph.get(u) ?? []) if (dfs(v)) return true;\n    inProgress.delete(u);\n    return false;\n  }\n  for (const node of graph.keys()) if (!visited.has(node) && dfs(node)) return true;\n  return false;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Graph — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Topological sort, connected components, union-find, decision guide\n// STRENGTHS - The algorithms that make graphs useful in production\n// WEAKNESSES- N/A\n//\n// 1) TOPOLOGICAL SORT — DFS-based, for DAGs (dependency ordering)\nfunction topoSort(graph) {\n  const visited = new Set();\n  const stack = [];\n  function dfs(u) {\n    if (visited.has(u)) return;\n    visited.add(u);\n    for (const [v] of graph.get(u) ?? []) dfs(v);\n    stack.push(u);                           // post-order\n  }\n  for (const node of graph.keys()) dfs(node);\n  return stack.reverse();\n}\n// 2) UNION-FIND (Disjoint Set) — path compression + union by rank\nclass UnionFind {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.rank = new Array(n).fill(0);\n    this.count = n;\n  }\n  find(x) {\n    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);\n    return this.parent[x];\n  }\n  union(a, b) {\n    const ra = this.find(a), rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.rank[ra] < this.rank[rb]) this.parent[ra] = rb;\n    else if (this.rank[ra] > this.rank[rb]) this.parent[rb] = ra;\n    else { this.parent[rb] = ra; this.rank[ra]++; }\n    this.count--;\n    return true;\n  }\n}\n// 3) CONNECTED COMPONENTS — count isolated groups with union-find\nfunction countComponents(n, edges) {\n  const uf = new UnionFind(n);\n  for (const [a, b] of edges) uf.union(a, b);\n  return uf.count;\n}\n// Decision rule:\n//   unweighted shortest path                                -> BFS\n//   weighted shortest path                                  -> Dijkstra (min-heap)\n//   dependency ordering (DAG)                               -> topological sort\n//   cycle detection (directed)                              -> DFS with in-progress set\n//   cycle detection (undirected)                            -> union-find or DFS\n//   connected components / dynamic connectivity             -> union-find\n//   all-pairs shortest path                                 -> Floyd-Warshall (O(V^3))\n//   minimum spanning tree                                   -> Prim or Kruskal\n//\n// Anti-pattern: BFS on a weighted graph for shortest path;\n//   BFS assumes uniform edge weights. Use Dijkstra for weighted graphs."
                  }
        ],
        tips: [
                  "Adjacency list (Map of arrays) is the standard representation — O(V+E) traversal",
                  "BFS finds shortest path in unweighted graphs; Dijkstra for weighted",
                  "Union-Find with path compression gives near-O(1) amortized find/union",
                  "Topological sort only works on DAGs — detect cycles first"
        ],
        mistake: "Using BFS for shortest path on a weighted graph. BFS assumes all edges have equal weight. Use Dijkstra's algorithm with a min-heap for weighted graphs.",
        shorthand: {
          verbose: "const graph = {};\ngraph['A'] = ['B', 'C'];\ngraph['B'] = ['D'];",
          concise: "const graph = new Map([\n  ['A', ['B', 'C']],\n  ['B', ['D']],\n]);",
        },
      },
      {
        id: "trie",
        fn: "Trie",
        desc: "Prefix tree for O(L) word insert, search, and prefix matching.",
        category: "Structures",
        subtitle: "Autocomplete, spell-check, and prefix-based search",
        signature: "class TrieNode { children = new Map(); isEnd = false; }",
        descLong: "A trie stores strings character by character in a tree. Each node has a Map of children (char -> TrieNode) and an isEnd flag. O(L) for insert/search where L is word length. Used for autocomplete, spell-check, IP routing, and prefix matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Trie — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Trie node with Map children; insert and search\n// STRENGTHS - Smallest valid trie; shows the node structure\n// WEAKNESSES- No startsWith, no delete, no autocomplete\n//\nclass TrieNode {\n  constructor() { this.children = new Map(); this.isEnd = false; }\n}\nclass Trie {\n  #root = new TrieNode();\n  insert(word) {\n    let node = this.#root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch);\n    }\n    node.isEnd = true;\n  }\n  search(word) {\n    let node = this.#root;\n    for (const ch of word) {\n      node = node.children.get(ch);\n      if (!node) return false;\n    }\n    return node.isEnd;\n  }\n}\nconst trie = new Trie();\ntrie.insert('cat'); trie.insert('car');\nconsole.log(trie.search('cat'));  // true\nconsole.log(trie.search('can'));  // false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Trie — common patterns you'll see in production.\n// APPROACH  - Combine Trie with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - startsWith, delete, and word collection\n// STRENGTHS - Covers the 80% of trie operations\n// WEAKNESSES- No autocomplete, no compression\n//\nclass TrieNode {\n  constructor() { this.children = new Map(); this.isEnd = false; }\n}\nclass Trie {\n  #root = new TrieNode();\n  insert(word) {\n    let node = this.#root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch);\n    }\n    node.isEnd = true;\n  }\n  startsWith(prefix) {\n    let node = this.#root;\n    for (const ch of prefix) {\n      node = node.children.get(ch);\n      if (!node) return false;\n    }\n    return true;\n  }\n  delete(word) {\n    function dfs(node, i) {\n      if (i === word.length) {\n        node.isEnd = false;\n        return node.children.size === 0;\n      }\n      const child = node.children.get(word[i]);\n      if (!child) return false;\n      if (dfs(child, i + 1)) {\n        node.children.delete(word[i]);\n        return node.children.size === 0 && !node.isEnd;\n      }\n      return false;\n    }\n    dfs(this.#root, 0);\n  }\n  wordsWithPrefix(prefix) {\n    let node = this.#root;\n    for (const ch of prefix) {\n      node = node.children.get(ch);\n      if (!node) return [];\n    }\n    const results = [];\n    function dfs(n, path) {\n      if (n.isEnd) results.push(prefix + path);\n      for (const [ch, child] of n.children) dfs(child, path + ch);\n    }\n    dfs(node, '');\n    return results;\n  }\n}\nconst trie = new Trie();\ntrie.insert('cat'); trie.insert('car'); trie.insert('card');\nconsole.log(trie.startsWith('ca'));        // true\nconsole.log(trie.wordsWithPrefix('ca'));   // ['cat', 'car', 'card']\ntrie.delete('car');\nconsole.log(trie.wordsWithPrefix('ca'));   // ['cat', 'card']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Trie — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Autocomplete with ranking, word search II, decision guide\n// STRENGTHS - Production-ready trie patterns\n// WEAKNESSES- N/A\n//\n// 1) AUTOCOMPLETE with frequency ranking\nclass AutocompleteTrie {\n  #root = new TrieNode();\n  insert(word, freq = 1) {\n    let node = this.#root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch);\n    }\n    node.isEnd = true;\n    node.freq = (node.freq ?? 0) + freq;\n  }\n  suggest(prefix, limit = 5) {\n    let node = this.#root;\n    for (const ch of prefix) {\n      node = node.children.get(ch);\n      if (!node) return [];\n    }\n    const results = [];\n    function dfs(n, path) {\n      if (n.isEnd) results.push({ word: prefix + path, freq: n.freq });\n      for (const [ch, child] of n.children) dfs(child, path + ch);\n    }\n    dfs(node, '');\n    return results.sort((a, b) => b.freq - a.freq)\n      .slice(0, limit).map(r => r.word);\n  }\n}\n// 2) WORD SEARCH II — find all words from a board using a trie\nfunction findWords(board, words) {\n  const trie = new Trie();\n  for (const w of words) trie.insert(w);\n  const result = new Set();\n  const rows = board.length, cols = board[0].length;\n  function dfs(r, c, node, path) {\n    if (r < 0 || r >= rows || c < 0 || c >= cols) return;\n    const ch = board[r][c];\n    const child = node.children.get(ch);\n    if (!child) return;\n    board[r][c] = '#';\n    if (child.isEnd) result.add(path + ch);\n    dfs(r+1, c, child, path + ch);\n    dfs(r-1, c, child, path + ch);\n    dfs(r, c+1, child, path + ch);\n    dfs(r, c-1, child, path + ch);\n    board[r][c] = ch;\n  }\n  for (let r = 0; r < rows; r++)\n    for (let c = 0; c < cols; c++)\n      dfs(r, c, trie.#root, '');\n  return [...result];\n}\n// Decision rule:\n//   prefix matching / autocomplete                            -> trie\n//   exact word lookup                                         -> Set (simpler, same O(L))\n//   spell-check / fuzzy search                                -> trie with edit distance\n//   IP routing / longest prefix match                         -> trie\n//   dictionary with many shared prefixes                      -> trie (saves memory)\n//   few words, no prefix queries                              -> Set (trie overhead not worth it)\n//\n// Anti-pattern: using a trie for exact-match-only lookups;\n//   a Set gives O(L) search with far less memory and code."
                  }
        ],
        tips: [
                  "Trie gives O(L) insert/search where L is word length — independent of dictionary size",
                  "Use Map for children — supports any character set including Unicode",
                  "Autocomplete: store frequency at end nodes, DFS to collect, sort by frequency",
                  "Trie excels when many words share prefixes — memory efficient for dictionaries"
        ],
        mistake: "Using a trie for exact-match-only lookups when a Set would suffice. A Set gives O(L) search with far less memory. Use a trie only when you need prefix matching or autocomplete.",
        shorthand: {
          verbose: "class TrieNode {\n  constructor() { this.children = {}; this.isEnd = false; }\n}",
          concise: "const node = { children: new Map(), isEnd: false };",
        },
      },
      {
        id: "binary-search",
        fn: "Binary Search",
        desc: "O(log n) search on sorted arrays.",
        category: "Structures",
        subtitle: "Find target, insertion point, or boundary in sorted data",
        signature: "while (lo < hi) { mid = (lo + hi) >> 1 }",
        descLong: "Binary search halves the search space each iteration — O(log n). Requires sorted input. JS has no built-in binary search (Array.indexOf is linear). Use the lo < hi pattern with mid = (lo + hi) >> 1. Works for finding exact match, insertion point, or boundary (first/last occurrence).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Binary Search — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Classic binary search for exact match\n// STRENGTHS - Smallest valid binary search; shows the loop invariant\n// WEAKNESSES- No insertion point, no boundary search\n//\nfunction binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target)  lo = mid + 1;\n    else                     hi = mid - 1;\n  }\n  return -1;\n}\nconsole.log(binarySearch([1, 3, 5, 7, 9, 11], 7));  // 3\nconsole.log(binarySearch([1, 3, 5, 7, 9, 11], 6));  // -1"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Binary Search — common patterns you'll see in production.\n// APPROACH  - Combine Binary Search with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Lower bound, upper bound, first/last occurrence\n// STRENGTHS - Covers the 80% of binary search variants\n// WEAKNESSES- No search on answer space, no rotated array\n//\n// LOWER BOUND — first index where target could be inserted\nfunction lowerBound(arr, target) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] < target) lo = mid + 1;\n    else                    hi = mid;\n  }\n  return lo;                              // first index >= target\n}\n// UPPER BOUND — first index strictly greater than target\nfunction upperBound(arr, target) {\n  let lo = 0, hi = arr.length;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] <= target) lo = mid + 1;\n    else                     hi = mid;\n  }\n  return lo;                              // first index > target\n}\nconst arr = [1, 2, 2, 2, 3, 4, 5];\nconsole.log(lowerBound(arr, 2));  // 1 (first 2)\nconsole.log(upperBound(arr, 2));  // 4 (first > 2, i.e. 3)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Binary Search — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Search on answer space, rotated array, peak finding, decision guide\n// STRENGTHS - The patterns that make binary search a versatile tool\n// WEAKNESSES- N/A\n//\n// 1) BINARY SEARCH ON ANSWER SPACE — not on an array, on a range\nfunction shipWithinDays(weights, days) {\n  let lo = Math.max(...weights);\n  let hi = weights.reduce((a, b) => a + b, 0);\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    let need = 1, load = 0;\n    for (const w of weights) {\n      if (load + w > mid) { need++; load = 0; }\n      load += w;\n    }\n    if (need <= days) hi = mid;\n    else              lo = mid + 1;\n  }\n  return lo;\n}\n// 2) SEARCH IN ROTATED SORTED ARRAY\nfunction searchRotated(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === target) return mid;\n    if (arr[lo] <= arr[mid]) {\n      if (target >= arr[lo] && target < arr[mid]) hi = mid - 1;\n      else lo = mid + 1;\n    } else {\n      if (target > arr[mid] && target <= arr[hi]) lo = mid + 1;\n      else hi = mid - 1;\n    }\n  }\n  return -1;\n}\nconsole.log(searchRotated([4, 5, 6, 7, 0, 1, 2], 0));  // 4\n// 3) FIND PEAK ELEMENT — local maximum in O(log n)\nfunction findPeak(arr) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] > arr[mid + 1]) hi = mid;\n    else                         lo = mid + 1;\n  }\n  return lo;\n}\n// Decision rule:\n//   exact match in sorted array                               -> binary search\n//   insertion point                                           -> lower bound\n//   first/last occurrence                                     -> lower/upper bound\n//   \"find minimum feasible value\"                             -> binary search on answer space\n//   search in rotated sorted array                            -> modified binary search\n//   find local peak                                           -> binary search comparing mid and mid+1\n//   unsorted array                                            -> linear search or sort first\n//\n// Anti-pattern: linear scan on a sorted array;\n//   if the data is sorted, binary search is O(log n) vs O(n) for linear scan."
                  }
        ],
        tips: [
                  "Use `mid = (lo + hi) >> 1` — bitwise shift avoids integer overflow issues",
                  "Lower bound finds the first index >= target; upper bound finds first index > target",
                  "Binary search works on answer spaces, not just arrays — \"find minimum feasible value\"",
                  "JS has no built-in binary search — Array.indexOf and Array.includes are O(n)"
        ],
        mistake: "Using `Array.indexOf()` on a sorted array. `indexOf` is O(n) linear scan. If the array is sorted, implement binary search for O(log n).",
        shorthand: {
          verbose: "let lo = 0, hi = arr.length - 1;\nwhile (lo <= hi) {\n  const mid = Math.floor((lo + hi) / 2);\n  if (arr[mid] === target) return mid;\n  arr[mid] < target ? lo = mid + 1 : hi = mid - 1;\n}",
          concise: "let lo = 0, hi = arr.length - 1;\nwhile (lo <= hi) {\n  const mid = (lo + hi) >> 1;\n  if (arr[mid] === target) return mid;\n  arr[mid] < target ? lo = mid + 1 : hi = mid - 1;\n}",
        },
      },
      {
        id: "sorting-patterns",
        fn: "Sorting Patterns",
        desc: "Custom comparators, stable sort, and partial sort with heap.",
        category: "Structures",
        subtitle: "Sort by key, multi-key sort, and top-K without full sort",
        signature: "arr.sort((a, b) => a - b) | arr.toSorted(cmp)",
        descLong: "JS sort is stable (ES2019+) and uses TimSort (V8) — O(n log n) worst case. Always provide a comparator for numbers. Use toSorted() for immutable sort. For top-K, a heap is O(n log K) vs O(n log n) for full sort. Multi-key sort uses chained comparators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sorting Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Sort numbers with a comparator; sort strings with localeCompare\n// STRENGTHS - Shows the two most common sort patterns\n// WEAKNESSES- No multi-key, no custom objects, no partial sort\n//\n// Numbers — always pass a comparator (default is string sort!)\n[10, 9, 2, 100].sort();                  // [10, 100, 2, 9] — WRONG\n[10, 9, 2, 100].sort((a, b) => a - b);   // [2, 9, 10, 100] — correct\n// Strings — use localeCompare for accent/case-safe sorting\n['banana', 'apple', 'cherry'].sort((a, b) => a.localeCompare(b));\n// -> ['apple', 'banana', 'cherry']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sorting Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Sorting Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Sort objects by property, multi-key sort, immutable sort\n// STRENGTHS - Covers the 80% of sorting in real code\n// WEAKNESSES- No partial sort, no Intl.Collator\n//\n// 1) SORT OBJECTS by a numeric property\nconst users = [\n  { name: 'Alice', age: 30 },\n  { name: 'Bob',   age: 25 },\n  { name: 'Carol', age: 35 },\n];\nconst byAge = users.toSorted((a, b) => a.age - b.age);\n// -> [{Bob, 25}, {Alice, 30}, {Carol, 35}]\n// 2) MULTI-KEY sort — sort by last name, then first name\nconst people = [\n  { first: 'John', last: 'Doe' },\n  { first: 'Jane', last: 'Doe' },\n  { first: 'Bob',  last: 'Smith' },\n];\nconst sorted = people.toSorted((a, b) => {\n  const lastCmp = a.last.localeCompare(b.last);\n  return lastCmp !== 0 ? lastCmp : a.first.localeCompare(b.first);\n});\n// -> [{Jane, Doe}, {John, Doe}, {Bob, Smith}]\n// 3) IMMUTABLE sort with toSorted() (ES2023)\nconst nums = [3, 1, 4, 1, 5];\nconst sorted2 = nums.toSorted((a, b) => a - b);\nconsole.log(nums);     // [3, 1, 4, 1, 5] — original preserved\nconsole.log(sorted2);  // [1, 1, 3, 4, 5]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sorting Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Intl.Collator, partial sort with heap, stability, decision guide\n// STRENGTHS - Production sorting patterns beyond simple comparators\n// WEAKNESSES- N/A\n//\n// 1) INTL.COLLATOR — locale-aware, numeric, case-insensitive\nconst collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });\nconst files = ['file10.txt', 'file2.txt', 'file1.txt'];\nfiles.toSorted(collator.compare);\n// -> ['file1.txt', 'file2.txt', 'file10.txt']\n// 2) PARTIAL SORT — top-K without sorting the entire array\n//    Use a min-heap of size K: O(n log K) vs O(n log n) for full sort\nfunction topK(arr, k) {\n  const heap = new MinHeap();\n  for (const x of arr) {\n    heap.push(x);\n    if (heap.size > k) heap.pop();\n  }\n  const result = [];\n  while (heap.size) result.push(heap.pop());\n  return result.reverse();\n}\nconsole.log(topK([3, 1, 4, 1, 5, 9, 2, 6], 3));  // [9, 6, 5]\n// 3) SORT STABILITY — ES2019+ guarantees stable sort\nconst items = [\n  { v: 1, tag: 'a' }, { v: 1, tag: 'b' }, { v: 0, tag: 'c' },\n];\nitems.toSorted((a, b) => a.v - b.v);\n// -> [{0,'c'}, {1,'a'}, {1,'b'}] — 'a' before 'b' preserved (stable)\n// Decision rule:\n//   sort numbers                                              -> .sort((a, b) => a - b)\n//   sort strings                                              -> .sort((a, b) => a.localeCompare(b))\n//   sort strings with numeric/locale awareness                -> Intl.Collator + .toSorted()\n//   sort objects by property                                  -> .toSorted((a, b) => a.prop - b.prop)\n//   sort by multiple keys                                     -> chained comparator with fallback\n//   top-K only (not full sort)                                -> min-heap of size K\n//   immutable sort                                            -> .toSorted() (ES2023)\n//   very large array, only top-K needed                       -> heap, not full sort\n//\n// Anti-pattern: .sort() without a comparator on numbers;\n//   default sort converts to strings — [10, 9, 2].sort() gives [10, 2, 9]."
                  }
        ],
        tips: [
                  "Always provide a comparator for numbers — default sort is lexicographic (string order)",
                  "Use .toSorted() (ES2023) for immutable sort — original array is preserved",
                  "Multi-key sort: chain comparators with `return cmp1 !== 0 ? cmp1 : cmp2`",
                  "For top-K, a size-K heap is O(n log K) — faster than O(n log n) full sort when K is small"
        ],
        mistake: "Calling `.sort()` on a number array without a comparator. `[10, 9, 2].sort()` gives `[10, 2, 9]` because it compares as strings. Always pass `(a, b) => a - b`.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst sorted = arr.slice().sort((a, b) => a - b);\n// More explicit but longer",
          concise: "const sorted = arr.toSorted((a, b) => a - b);",
        },
      },
    ],
  },

  // ── Section 2: Algorithm Patterns & Complexity ─────────────────────────────────────────
  {
    id: "algorithms",
    title: "Algorithm Patterns & Complexity",
    entries: [
      {
        id: "two-pointers",
        fn: "Two Pointers",
        desc: "O(n) pattern for pair-finding on sorted arrays.",
        category: "Algorithms",
        subtitle: "Opposite-direction and same-direction pointer patterns",
        signature: "let lo = 0, hi = arr.length - 1; while (lo < hi) { ... }",
        descLong: "Two pointers move through an array to find pairs, triplets, or subarrays. Opposite direction (lo/hi converging) works on sorted arrays for pair-sum. Same direction (fast/slow) works for deduplication and partitioning. O(n) time, O(1) space.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Two Pointers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Two pointers converging from both ends of a sorted array\n// STRENGTHS - Smallest valid two-pointer; shows the lo/hi convergence\n// WEAKNESSES- No same-direction pattern, no three-sum\n//\nfunction twoSumSorted(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo < hi) {\n    const sum = arr[lo] + arr[hi];\n    if (sum === target) return [lo, hi];\n    if (sum < target)   lo++;\n    else                hi--;\n  }\n  return null;\n}\nconsole.log(twoSumSorted([1, 2, 3, 4, 6, 8], 10));  // [2, 5]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Two Pointers — common patterns you'll see in production.\n// APPROACH  - Combine Two Pointers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Three-sum, container with most water, deduplication\n// STRENGTHS - Covers the 80% of two-pointer patterns\n// WEAKNESSES- No sliding window, no partitioning\n//\n// 1) THREE SUM — fix one element, two-pointer on the rest\nfunction threeSum(arr, target) {\n  arr.sort((a, b) => a - b);\n  const result = [];\n  for (let i = 0; i < arr.length - 2; i++) {\n    if (i > 0 && arr[i] === arr[i - 1]) continue;  // skip duplicates\n    let lo = i + 1, hi = arr.length - 1;\n    while (lo < hi) {\n      const sum = arr[i] + arr[lo] + arr[hi];\n      if (sum === target) {\n        result.push([arr[i], arr[lo], arr[hi]]);\n        while (lo < hi && arr[lo] === arr[lo + 1]) lo++;\n        while (lo < hi && arr[hi] === arr[hi - 1]) hi--;\n        lo++; hi--;\n      } else if (sum < target) lo++;\n      else                     hi--;\n    }\n  }\n  return result;\n}\nconsole.log(threeSum([-1, 0, 1, 2, -1, -4], 0));  // [[-1, -1, 2], [-1, 0, 1]]\n// 2) CONTAINER WITH MOST WATER — max area between two lines\nfunction maxArea(height) {\n  let lo = 0, hi = height.length - 1, max = 0;\n  while (lo < hi) {\n    const area = Math.min(height[lo], height[hi]) * (hi - lo);\n    max = Math.max(max, area);\n    if (height[lo] < height[hi]) lo++;\n    else                          hi--;\n  }\n  return max;\n}\n// 3) SAME-DIRECTION — remove duplicates in-place from sorted array\nfunction removeDuplicates(arr) {\n  if (arr.length === 0) return 0;\n  let slow = 0;\n  for (let fast = 1; fast < arr.length; fast++) {\n    if (arr[fast] !== arr[slow]) {\n      slow++;\n      arr[slow] = arr[fast];\n    }\n  }\n  return slow + 1;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Two Pointers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Partitioning, palindrome check, subarray sum, decision guide\n// STRENGTHS - The patterns that make two pointers versatile\n// WEAKNESSES- N/A\n//\n// 1) PARTITION — Dutch national flag (three-way partition)\nfunction threeWayPartition(arr, pivot) {\n  let lo = 0, mid = 0, hi = arr.length - 1;\n  while (mid <= hi) {\n    if (arr[mid] < pivot)       { [arr[lo], arr[mid]] = [arr[mid], arr[lo]]; lo++; mid++; }\n    else if (arr[mid] > pivot)  { [arr[mid], arr[hi]]  = [arr[hi], arr[mid]];  hi--; }\n    else                         mid++;\n  }\n  return arr;\n}\n// 2) PALINDROME CHECK — two pointers from both ends\nfunction isPalindrome(s) {\n  let lo = 0, hi = s.length - 1;\n  while (lo < hi) {\n    if (s[lo] !== s[hi]) return false;\n    lo++; hi--;\n  }\n  return true;\n}\n// 3) SUBARRAY SUM equals K — prefix sum + hash map\nfunction subarraySum(nums, k) {\n  const prefixCount = new Map([[0, 1]]);\n  let sum = 0, count = 0;\n  for (const n of nums) {\n    sum += n;\n    if (prefixCount.has(sum - k)) count += prefixCount.get(sum - k);\n    prefixCount.set(sum, (prefixCount.get(sum) ?? 0) + 1);\n  }\n  return count;\n}\n// Decision rule:\n//   pair sum on sorted array                                 -> opposite-direction two pointers\n//   three sum                                                 -> fix one + two-pointer on rest\n//   remove duplicates in-place                                -> same-direction (slow/fast)\n//   partition around pivot                                    -> three-way (Dutch flag)\n//   palindrome check                                          -> opposite-direction\n//   subarray sum = K                                          -> prefix sum + hash map\n//   pair sum on unsorted array                                -> hash map (not two-pointer)\n//\n// Anti-pattern: two-pointer pair sum on an unsorted array;\n//   two-pointer requires sorted input. Use a hash map for unsorted."
                  }
        ],
        tips: [
                  "Two pointers require a sorted array for pair-finding — sort first if needed",
                  "Opposite direction (lo/hi) for pair-finding; same direction (slow/fast) for dedup/partition",
                  "Three-way partition (Dutch flag) handles duplicates around a pivot in O(n)",
                  "For unsorted pair-sum, use a hash map — two pointers only work on sorted data"
        ],
        mistake: "Using two pointers for pair-sum on an unsorted array without sorting first. Two-pointer pair-finding requires sorted input. Use a hash map for O(n) unsorted pair-sum.",
        shorthand: {
          verbose: "for (let i = 0; i < arr.length; i++) {\n  for (let j = i + 1; j < arr.length; j++) {\n    if (arr[i] + arr[j] === target) return [i, j];\n  }\n}",
          concise: "let l = 0, r = arr.length - 1;\nwhile (l < r) {\n  const sum = arr[l] + arr[r];\n  if (sum === target) return [l, r];\n  sum < target ? l++ : r--;\n}",
        },
      },
      {
        id: "sliding-window",
        fn: "Sliding Window",
        desc: "O(n) pattern for subarray and substring problems.",
        category: "Algorithms",
        subtitle: "Fixed-size and variable-size window with running aggregate",
        signature: "let lo = 0; for (let hi = 0; hi < n; hi++) { ... }",
        descLong: "A sliding window maintains a subarray [lo, hi] that expands by moving hi forward and shrinks by moving lo forward. O(n) because each element is visited at most twice. Fixed-size windows maintain a constant width; variable-size windows expand/shrink based on a condition.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sliding Window — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Fixed-size sliding window: max sum of K consecutive elements\n// STRENGTHS - Smallest valid sliding window; shows the running sum pattern\n// WEAKNESSES- No variable-size window, no substring problems\n//\nfunction maxSumK(arr, k) {\n  let sum = 0;\n  for (let i = 0; i < k; i++) sum += arr[i];   // initial window\n  let max = sum;\n  for (let i = k; i < arr.length; i++) {\n    sum += arr[i] - arr[i - k];                 // slide: add new, remove old\n    max = Math.max(max, sum);\n  }\n  return max;\n}\nconsole.log(maxSumK([1, 4, 2, 10, 23, 3, 1, 0, 20], 4));  // 39"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sliding Window — common patterns you'll see in production.\n// APPROACH  - Combine Sliding Window with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Variable-size window: longest substring without repeating chars\n// STRENGTHS - Covers the 80% of sliding window problems\n// WEAKNESSES- No monotonic deque, no character frequency\n//\n// 1) LONGEST SUBSTRING without repeating characters\nfunction lengthOfLongestSubstring(s) {\n  const seen = new Map();\n  let lo = 0, max = 0;\n  for (let hi = 0; hi < s.length; hi++) {\n    if (seen.has(s[hi]) && seen.get(s[hi]) >= lo) {\n      lo = seen.get(s[hi]) + 1;\n    }\n    seen.set(s[hi], hi);\n    max = Math.max(max, hi - lo + 1);\n  }\n  return max;\n}\nconsole.log(lengthOfLongestSubstring('abcabcbb'));  // 3\n// 2) MINIMUM SIZE subarray sum >= target\nfunction minSubarrayLen(target, nums) {\n  let lo = 0, sum = 0, min = Infinity;\n  for (let hi = 0; hi < nums.length; hi++) {\n    sum += nums[hi];\n    while (sum >= target) {\n      min = Math.min(min, hi - lo + 1);\n      sum -= nums[lo++];\n    }\n  }\n  return min === Infinity ? 0 : min;\n}\nconsole.log(minSubarrayLen(7, [2, 3, 1, 2, 4, 3]));  // 2"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sliding Window — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Monotonic deque window max, K distinct chars, decision guide\n// STRENGTHS - The patterns that make sliding windows powerful\n// WEAKNESSES- N/A\n//\n// 1) SLIDING WINDOW MAXIMUM — monotonic deque of indices\nfunction maxSlidingWindow(nums, k) {\n  const deque = [];                            // indices, values decreasing\n  const result = [];\n  for (let i = 0; i < nums.length; i++) {\n    while (deque.length && deque[0] <= i - k) deque.shift();\n    while (deque.length && nums[deque.at(-1)] < nums[i]) deque.pop();\n    deque.push(i);\n    if (i >= k - 1) result.push(nums[deque[0]]);\n  }\n  return result;\n}\nconsole.log(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3));\n// -> [3, 3, 5, 5, 6, 7]\n// 2) LONGEST SUBSTRING with at most K distinct characters\nfunction longestKDistinct(s, k) {\n  const freq = new Map();\n  let lo = 0, max = 0;\n  for (let hi = 0; hi < s.length; hi++) {\n    freq.set(s[hi], (freq.get(s[hi]) ?? 0) + 1);\n    while (freq.size > k) {\n      const count = freq.get(s[lo]) - 1;\n      if (count === 0) freq.delete(s[lo]);\n      else             freq.set(s[lo], count);\n      lo++;\n    }\n    max = Math.max(max, hi - lo + 1);\n  }\n  return max;\n}\n// Decision rule:\n//   fixed-size window (sum/max of K consecutive)              -> running aggregate\n//   variable-size window (longest/shortest with condition)    -> expand hi, shrink lo\n//   sliding window maximum                                    -> monotonic deque\n//   longest substring with constraint                         -> hash map + two pointers\n//   need running max/min in window                            -> monotonic deque\n//   need running sum only                                     -> simple running sum\n//\n// Anti-pattern: recomputing the window aggregate from scratch each step;\n//   slide the window: add the new element, remove the old. O(1) per step, not O(k)."
                  }
        ],
        tips: [
                  "Sliding window is O(n) — each element enters and leaves the window at most once",
                  "Fixed-size: maintain running sum/aggregate; slide by adding new and removing old",
                  "Variable-size: expand hi, shrink lo while condition is violated",
                  "For window max/min, use a monotonic deque — not recomputation"
        ],
        mistake: "Recomputing the window sum from scratch at each position. This is O(n*k). Slide the window by adding the new element and subtracting the old one for O(1) per step.",
        shorthand: {
          verbose: "for (let i = 0; i <= arr.length - k; i++) {\n  let sum = 0;\n  for (let j = i; j < i + k; j++) sum += arr[j];\n  max = Math.max(max, sum);\n}",
          concise: "let sum = arr.slice(0, k).reduce((a, b) => a + b);\nfor (let i = k; i < arr.length; i++) {\n  sum += arr[i] - arr[i - k];\n  max = Math.max(max, sum);\n}",
        },
      },
      {
        id: "recursion",
        fn: "Recursion",
        desc: "Solve problems by reducing to smaller instances of the same problem.",
        category: "Algorithms",
        subtitle: "Base case, recursive case, memoization, and stack overflow",
        signature: "function f(n) { if (base) return; return f(n - 1) }",
        descLong: "Recursion breaks a problem into a base case and a recursive case. JS engines typically allow ~10k-25k recursive calls before stack overflow. For deep recursion, use iteration with an explicit stack, or trampolining. Memoization with a Map caches results to avoid exponential blowup.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Recursion — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Classic factorial and Fibonacci with base case\n// STRENGTHS - Smallest valid recursion; shows base case + recursive case\n// WEAKNESSES- No memoization, no stack overflow awareness\n//\nfunction factorial(n) {\n  if (n <= 1) return 1;              // base case\n  return n * factorial(n - 1);       // recursive case\n}\nconsole.log(factorial(5));           // 120\nfunction fib(n) {\n  if (n <= 1) return n;\n  return fib(n - 1) + fib(n - 2);    // O(2^n) — exponential without memo!\n}\nconsole.log(fib(10));                // 55"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Recursion — common patterns you'll see in production.\n// APPROACH  - Combine Recursion with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Memoized Fibonacci, tree traversal, recursive binary search\n// STRENGTHS - Covers the 80% of recursion with memoization\n// WEAKNESSES- No tail call optimization, no trampolining\n//\n// 1) MEMOIZED Fibonacci — O(n) with caching\nfunction fibMemo(n, memo = new Map()) {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);\n  memo.set(n, result);\n  return result;\n}\nconsole.log(fibMemo(50));             // 12586269025 (instant)\n// 2) TREE TRAVERSAL — recursive DFS\nfunction traverse(node) {\n  if (!node) return;\n  console.log(node.val);              // pre-order\n  traverse(node.left);\n  traverse(node.right);\n}\n// 3) RECURSIVE BINARY SEARCH\nfunction binarySearch(arr, target, lo = 0, hi = arr.length - 1) {\n  if (lo > hi) return -1;\n  const mid = (lo + hi) >> 1;\n  if (arr[mid] === target) return mid;\n  if (arr[mid] < target)  return binarySearch(arr, target, mid + 1, hi);\n  return binarySearch(arr, target, lo, mid - 1);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Recursion — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Stack overflow, trampolining, iterative conversion, decision guide\n// STRENGTHS - The patterns that make recursion safe in production\n// WEAKNESSES- N/A\n//\n// 1) STACK OVERFLOW — JS engines limit recursion depth (~10k-25k)\n//    Test your engine's limit:\n// function depth(d) { try { return depth(d + 1); } catch { return d; } }\n// 2) TRAMPOLINING — convert recursive calls to iterative loop\nfunction trampoline(fn) {\n  return (...args) => {\n    let result = fn(...args);\n    while (typeof result === 'function') result = result();\n    return result;\n  };\n}\nconst fibTramp = trampoline(function fib(n, a = 0, b = 1) {\n  if (n === 0) return a;\n  return () => fib(n - 1, b, a + b);   // return a thunk, not a call\n});\nconsole.log(fibTramp(10000));           // works — no stack overflow\n// 3) ITERATIVE CONVERSION — explicit stack for DFS\nfunction dfsIterative(root) {\n  if (!root) return [];\n  const stack = [root];\n  const result = [];\n  while (stack.length) {\n    const node = stack.pop();\n    result.push(node.val);\n    if (node.right) stack.push(node.right);\n    if (node.left)  stack.push(node.left);\n  }\n  return result;\n}\n// 4) MEMOIZATION wrapper\nfunction memoize(fn) {\n  const cache = new Map();\n  return function(...args) {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn.apply(this, args);\n    cache.set(key, result);\n    return result;\n  };\n}\n// Decision rule:\n//   simple recursion, shallow depth (< 1000)                   -> direct recursion\n//   overlapping subproblems                                    -> memoization with Map\n//   deep recursion (> 10k)                                     -> trampolining or iterative\n//   tree/graph traversal                                       -> iterative with explicit stack\n//   tail-recursive function                                    -> may optimize in Safari (not V8)\n//   need to cache results                                      -> memoize wrapper\n//   mutual recursion                                           -> trampolining\n//\n// Anti-pattern: naive Fibonacci without memoization;\n//   fib(40) makes ~1 billion calls. Memoized fib(40) makes ~80 calls."
                  }
        ],
        tips: [
                  "JS engines limit recursion to ~10k-25k calls — use iteration for deep recursion",
                  "Memoization with a Map turns exponential Fibonacci into O(n)",
                  "Tail call optimization is only in Safari — don't rely on it for V8/Chrome/Node",
                  "Convert recursive DFS to iterative with an explicit stack to avoid overflow"
        ],
        mistake: "Naive recursive Fibonacci without memoization. `fib(40)` makes over a billion calls. Add a Map cache to reduce it to ~80 calls.",
        shorthand: {
          verbose: "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}",
          concise: "const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);",
        },
      },
      {
        id: "dynamic-programming",
        fn: "Dynamic Programming",
        desc: "Memoization and tabulation for overlapping subproblems.",
        category: "Algorithms",
        subtitle: "Top-down memoization vs bottom-up tabulation",
        signature: "memo.set(n, f(n-1) + f(n-2)) | dp[i] = dp[i-1] + dp[i-2]",
        descLong: "DP solves problems with overlapping subproblems and optimal substructure. Top-down (memoization): recursive with a cache. Bottom-up (tabulation): iterative, fills a table — faster constant factor, no stack overflow. Space optimization: keep only the last row/column.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Programming — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - Fibonacci: top-down memo vs bottom-up tabulation\n// STRENGTHS - Shows both DP styles side by side\n// WEAKNESSES- No space optimization, no 2D DP\n//\n// Top-down (memoization)\nfunction fibMemo(n, memo = new Map()) {\n  if (n <= 1) return n;\n  if (memo.has(n)) return memo.get(n);\n  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);\n  memo.set(n, result);\n  return result;\n}\n// Bottom-up (tabulation)\nfunction fibTab(n) {\n  if (n <= 1) return n;\n  const dp = new Array(n + 1);\n  dp[0] = 0; dp[1] = 1;\n  for (let i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];\n  return dp[n];\n}\nconsole.log(fibMemo(20));  // 6765\nconsole.log(fibTab(20));   // 6765"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Programming — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Programming with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Climbing stairs, coin change, knapsack, space optimization\n// STRENGTHS - Covers the 80% of DP patterns\n// WEAKNESSES- No 2D DP, no interval DP\n//\n// 1) CLIMBING STAIRS — space-optimized (only need last 2 values)\nfunction climbStairs(n) {\n  if (n <= 2) return n;\n  let prev2 = 1, prev1 = 2;\n  for (let i = 3; i <= n; i++) {\n    const cur = prev1 + prev2;\n    prev2 = prev1; prev1 = cur;\n  }\n  return prev1;\n}\nconsole.log(climbStairs(5));  // 8\n// 2) COIN CHANGE — minimum coins to make amount\nfunction coinChange(coins, amount) {\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i++) {\n    for (const coin of coins) {\n      if (coin <= i) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}\nconsole.log(coinChange([1, 5, 10, 25], 36));  // 3\n// 3) 0/1 KNAPSACK — max value with weight limit\nfunction knapsack(weights, values, capacity) {\n  const dp = new Array(capacity + 1).fill(0);\n  for (let i = 0; i < weights.length; i++) {\n    for (let w = capacity; w >= weights[i]; w--) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}\nconsole.log(knapsack([2, 3, 4, 5], [3, 4, 5, 6], 8));  // 10"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Programming — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - 2D DP, edit distance, LIS, decision guide\n// STRENGTHS - The patterns that make DP a versatile tool\n// WEAKNESSES- N/A\n//\n// 1) LONGEST COMMON SUBSEQUENCE — 2D DP\nfunction lcs(s1, s2) {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;\n      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[m][n];\n}\nconsole.log(lcs('abcde', 'ace'));  // 3\n// 2) EDIT DISTANCE (Levenshtein)\nfunction editDistance(s1, s2) {\n  const m = s1.length, n = s2.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));\n  for (let i = 0; i <= m; i++) dp[i][0] = i;\n  for (let j = 0; j <= n; j++) dp[0][j] = j;\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (s1[i - 1] === s2[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n    }\n  }\n  return dp[m][n];\n}\nconsole.log(editDistance('horse', 'ros'));  // 3\n// 3) LONGEST INCREASING SUBSEQUENCE — O(n log n) with binary search\nfunction lis(nums) {\n  const tails = [];\n  for (const x of nums) {\n    let lo = 0, hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < x) lo = mid + 1;\n      else                hi = mid;\n    }\n    if (lo === tails.length) tails.push(x);\n    else                      tails[lo] = x;\n  }\n  return tails.length;\n}\nconsole.log(lis([10, 9, 2, 5, 3, 7, 101, 18]));  // 4\n// Decision rule:\n//   overlapping subproblems + optimal substructure              -> DP\n//   need only last row/column                                   -> space-optimize to O(1) or O(n)\n//   count number of ways                                        -> 1D DP\n//   minimize/optimize (coins, knapsack)                         -> 1D DP\n//   two sequences (LCS, edit distance)                          -> 2D DP\n//   intervals (matrix chain, burst balloons)                    -> interval DP\n//   longest increasing subsequence                              -> binary search + tails array\n//   need to reconstruct the solution                            -> store parent pointers\n//\n// Anti-pattern: naive recursion on overlapping subproblems without memoization;\n//   fib(40) without memo = ~1B calls. With memo = ~80. Always cache."
                  }
        ],
        tips: [
                  "Top-down (memoization) is intuitive; bottom-up (tabulation) is faster and avoids stack overflow",
                  "Space optimization: if dp[i] only depends on dp[i-1], keep just the last row",
                  "0/1 knapsack: iterate weights in reverse to avoid using an item twice",
                  "LIS in O(n log n): maintain a tails array and binary search for insertion point"
        ],
        mistake: "Using naive recursion on overlapping subproblems without memoization. Always add a cache — the difference between exponential and polynomial time.",
        shorthand: {
          verbose: "function fib(n) {\n  if (n < 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}",
          concise: "const fib = (n, memo = {}) =>\n  n < 2 ? n : (memo[n] ??= fib(n - 1, memo) + fib(n - 2, memo));",
        },
      },
      {
        id: "big-o",
        fn: "Big-O Reference",
        desc: "Common time complexities and JS built-in operation costs.",
        category: "Algorithms",
        subtitle: "Know the cost of every array method and loop pattern",
        signature: "O(1) | O(log n) | O(n) | O(n log n) | O(n²)",
        descLong: "Big-O describes how runtime grows with input size. Knowing JS built-in costs is critical: push/pop are O(1), shift/unshift are O(n), sort is O(n log n), includes/indexOf are O(n), Map/Set.has are O(1). Choosing the right method can change O(n²) to O(n).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Big-O Reference — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - The five common complexity classes with examples\n// STRENGTHS - Shows each class with a concrete JS example\n// WEAKNESSES- No built-in cost table, no amortized analysis\n//\n// O(1) — constant time, independent of input size\nfunction first(arr) { return arr[0]; }\n// O(log n) — halves the search space each step\nfunction binarySearch(arr, target) {\n  let lo = 0, hi = arr.length - 1;\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) lo = mid + 1; else hi = mid - 1;\n  }\n  return -1;\n}\n// O(n) — linear scan, each element visited once\nfunction sum(arr) { return arr.reduce((a, b) => a + b, 0); }\n// O(n log n) — comparison sort\nfunction sort(arr) { return arr.toSorted((a, b) => a - b); }\n// O(n²) — nested loop over the same array\nfunction bubbleSort(arr) {\n  for (let i = 0; i < arr.length; i++)\n    for (let j = 0; j < arr.length - 1; j++)\n      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n  return arr;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Big-O Reference — common patterns you'll see in production.\n// APPROACH  - Combine Big-O Reference with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - JS built-in operation cost table\n// STRENGTHS - The reference table every JS developer should know\n// WEAKNESSES- No amortized analysis, no hidden class impact\n//\n// ── Array methods ──────────────────────────────────────────\n// push()          O(1) amortized    pop()           O(1)\n// shift()         O(n)              unshift()       O(n)\n// splice(i, d)    O(n)              slice()         O(n)\n// concat()        O(n)              flat()          O(n)\n// indexOf()       O(n)              includes()      O(n)\n// find()          O(n)              findIndex()     O(n)\n// sort()          O(n log n)        reverse()       O(n)\n// fill()          O(n)              copyWithin()    O(n)\n// at(i)           O(1)              join()          O(n)\n// toSorted()      O(n log n)        toReversed()    O(n)\n// ── Map / Set ──────────────────────────────────────────────\n// Map.set()       O(1) avg          Map.get()       O(1) avg\n// Map.has()       O(1) avg          Map.delete()    O(1) avg\n// Set.add()       O(1) avg          Set.has()       O(1) avg\n// [...map]        O(n)              new Map(iter)   O(n)\n// ── String ─────────────────────────────────────────────────\n// str[i]          O(1)              str.length      O(1)\n// str.concat()    O(n)              str.slice()     O(n)\n// str.indexOf()   O(n)              str.replace()   O(n)\n// str.split()     O(n)              str.repeat(n)   O(n)\n// str + str2      O(n + m)          str.trim()      O(n)\n// ── Object ─────────────────────────────────────────────────\n// obj[key]        O(1) avg          delete obj[k]   O(1) avg\n// Object.keys()   O(n)              Object.entries() O(n)\n// { ...obj }      O(n)              JSON.stringify() O(n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Big-O Reference — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - Amortized analysis, hidden costs, O(n²) -> O(n) refactors, decision guide\n// STRENGTHS - The patterns that prevent performance bugs in production\n// WEAKNESSES- N/A\n//\n// 1) AMORTIZED O(1) — push() is O(1) amortized but occasionally O(n)\n//    V8 doubles the backing store when full, copying all elements.\n//    Over n pushes: n + 1 + 2 + 4 + ... ≈ 2n total -> O(1) amortized.\n// 2) HIDDEN O(n²) — string concatenation in a loop\n// BAD: O(n²) — each += creates a new string, copying all previous chars\nlet s = '';\nfor (let i = 0; i < 10000; i++) s += i;       // O(n²)\n// GOOD: O(n) — join does one allocation\nconst parts = [];\nfor (let i = 0; i < 10000; i++) parts.push(i);\nconst s2 = parts.join('');                     // O(n)\n// 3) HIDDEN O(n²) — shift() in a loop\n// BAD: O(n²) — each shift() is O(n)\nwhile (q.length) { process(q.shift()); }\n// GOOD: O(n) — use an index pointer\nlet head = 0;\nwhile (head < q.length) { process(q[head++]); }\n// 4) O(n) -> O(1) — replace array.includes() with Set.has()\n// BAD: O(n*m) — includes is O(n), called m times\nfor (const x of list) { if (allowed.includes(x)) ... }\n// GOOD: O(m) — Set.has() is O(1)\nconst allowedSet = new Set(allowed);\nfor (const x of list) { if (allowedSet.has(x)) ... }\n// 5) O(n log n) -> O(n) — replace sort + first-K with heap\n// BAD: O(n log n) — full sort to get top-K\nconst top3 = arr.sort((a, b) => b - a).slice(0, 3);\n// GOOD: O(n log K) — heap of size K\n// (see heap entry for implementation)\n// Decision rule:\n//   building a string in a loop                    -> .push() + .join(), not +=\n//   queue with frequent dequeue                    -> index pointer or linked list, not shift()\n//   frequent membership testing                    -> Set, not array.includes()\n//   top-K from large array                         -> heap, not full sort\n//   key-value with frequent add/delete             -> Map, not plain object\n//   need O(1) random access                        -> array, not linked list\n//   need O(1) lookup by key                        -> Map/Set, not array scan\n//\n// Anti-pattern: string += in a loop;\n//   each concatenation copies the entire string so far. Use array.push + join."
                  }
        ],
        tips: [
                  "push/pop are O(1); shift/unshift are O(n) — never use shift() in a loop",
                  "Map.has() and Set.has() are O(1) — use them over array.includes() for frequent lookups",
                  "String += in a loop is O(n²) — use array.push() + join() for O(n)",
                  "sort is O(n log n) — for top-K, a size-K heap is O(n log K)"
        ],
        mistake: "Using `string += chunk` inside a loop. Each concatenation copies the entire accumulated string, making it O(n²). Use `parts.push(chunk)` then `parts.join('')` for O(n).",
        shorthand: {
          verbose: "for (let i = 0; i < n; i++) {\n  for (let j = 0; j < n; j++) {\n    console.log(i, j);\n  }\n}",
          concise: "for (let i = 0; i < n; i++) {\n  console.log(i);\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
