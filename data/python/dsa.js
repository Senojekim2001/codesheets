export const meta = {
  "title": "Data Structures & Algorithms",
  "domain": "python",
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
        subtitle: "Use a list — append() pushes, pop() pops from the top",
        signature: "stack.append(x) | stack.pop() | stack[-1]",
        descLong: "A stack follows LIFO order. Python lists work perfectly as stacks — append() pushes, pop() removes from the top. For thread safety use queue.LifoQueue.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Stack — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nstack = []\nstack.append(1)            # push\nstack.append(2)\nstack.append(3)\nprint(stack[-1])           # 3 — peek (no removal)\nprint(stack.pop())         # 3 — pop from top\nprint(stack)               # [1, 2]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Stack — common patterns you'll see in production.\n# APPROACH  - Combine Stack with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\ndef is_balanced(s: str) -> bool:\n    pair = {\")\": \"(\", \"]\": \"[\", \"}\": \"{\"}\n    stack = []\n    for c in s:\n        if c in \"([{\":\n            stack.append(c)\n        elif c in \")]}\":\n            if not stack or stack.pop() != pair[c]:\n                return False\n    return not stack                            # empty == fully matched\nprint(is_balanced(\"([{}])\"))                    # True\nprint(is_balanced(\"([)]\"))                      # False\ndef eval_postfix(expr: str) -> int:\n    \"\"\"Evaluate Reverse Polish Notation: '2 3 + 4 *' -> 20.\"\"\"\n    stack: list[int] = []\n    OPS = {\"+\": int.__add__, \"-\": int.__sub__, \"*\": int.__mul__, \"/\": int.__floordiv__}\n    for tok in expr.split():\n        if tok in OPS:\n            b, a = stack.pop(), stack.pop()       # second pop is FIRST operand\n            stack.append(OPS[tok](a, b))\n        else:\n            stack.append(int(tok))\n    return stack[0]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Stack — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) MONOTONIC STACK — \"next greater element\" in O(n)\n#    Maintain a stack whose values are STRICTLY decreasing from bottom to top.\n#    When a bigger value arrives, pop everything smaller and resolve their answers.\ndef next_greater(nums: list[int]) -> list[int]:\n    n = len(nums)\n    out = [-1] * n\n    stack: list[int] = []                        # holds INDICES, not values\n    for i, x in enumerate(nums):\n        while stack and nums[stack[-1]] < x:\n            out[stack.pop()] = x\n        stack.append(i)\n    return out\n# next_greater([2, 1, 2, 4, 3])  -> [4, 2, 4, -1, -1]\n# 2) ITERATIVE DFS — avoid Python's ~1000 recursion limit\ndef dfs(graph, start):\n    visited = set()\n    stack = [start]\n    while stack:\n        node = stack.pop()                       # pop from TOP -> LIFO -> DFS\n        if node in visited: continue\n        visited.add(node)\n        # reverse so neighbors are visited in declared order\n        stack.extend(reversed(graph.get(node, ())))\n    return visited\n# 3) Thread-safe stack — queue.LifoQueue in producer/consumer code\n# from queue import LifoQueue\n# q = LifoQueue(); q.put(1); q.get()           # blocks until item available\n# Decision rule:\n#   simple LIFO                        -> list with append/pop\n#   thread-safe LIFO                   -> queue.LifoQueue\n#   \"next greater / smaller\" problem    -> monotonic stack of INDICES\n#   tree/graph DFS, deep input          -> iterative stack, NOT recursion\n#   parsing nested structure            -> stack of \"open\" markers\n#\n# Anti-pattern: stack.pop(0)\n#   That removes from the FRONT and is O(n) — it shifts every other element.\n#   pop() (no args) removes from the TOP and is O(1). They are not interchangeable."
                  }
        ],
        tips: [
                  "Python list as stack is O(1) amortized for both append and pop",
                  "`stack[-1]` peeks the top without removing — no separate peek method needed",
                  "For thread-safe stacks use `queue.LifoQueue`",
                  "Stacks power: function call frames, undo operations, DFS, expression parsing"
        ],
        mistake: "Using `list.pop(0)` thinking it pops from the \"top\". `pop(0)` is O(n) and removes from the front (bottom). A stack pops from the back (top): `list.pop()`.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "queue",
        fn: "Queue",
        desc: "First-In, First-Out container with O(1) operations at both ends.",
        category: "Structures",
        subtitle: "Use collections.deque — never list.pop(0)",
        signature: "from collections import deque; q.append(x); q.popleft()",
        descLong: "Use collections.deque for queues — it has O(1) append and popleft from both ends. A plain list has O(n) pop(0) because it shifts every element. For thread-safe producer/consumer patterns use queue.Queue.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Queue — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom collections import deque\nq = deque()\nq.append(1); q.append(2); q.append(3)            # enqueue at the right\nprint(q.popleft())                                # 1 — FIFO dequeue\nprint(q[0])                                       # peek without removing"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Queue — common patterns you'll see in production.\n# APPROACH  - Combine Queue with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom collections import deque\ndef bfs(graph: dict[int, list[int]], start: int) -> list[int]:\n    visited = {start}\n    q       = deque([start])\n    order   = []\n    while q:\n        node = q.popleft()                        # FIFO -> visits by distance\n        order.append(node)\n        for nxt in graph[node]:\n            if nxt not in visited:\n                visited.add(nxt)\n                q.append(nxt)\n    return order\ngraph = {0: [1, 2], 1: [3], 2: [3], 3: []}\nprint(bfs(graph, 0))                              # [0, 1, 2, 3]\n# Shortest path in an UNWEIGHTED graph — track parents during BFS\ndef shortest_path(graph, src, dst):\n    parent: dict[int, int | None] = {src: None}\n    q = deque([src])\n    while q:\n        n = q.popleft()\n        if n == dst:\n            path = []\n            while n is not None:\n                path.append(n); n = parent[n]\n            return list(reversed(path))\n        for nxt in graph[n]:\n            if nxt not in parent:\n                parent[nxt] = n\n                q.append(nxt)\n    return None"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Queue — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom collections import deque\n# 1) collections.deque — FAST, in one thread, no synchronization\n#    O(1) at both ends; constant-factor faster than queue.Queue\nq = deque(maxlen=1000)                            # bounded ring buffer\n# 2) queue.Queue — THREAD-safe FIFO; producers / consumers across threads\nfrom queue import Queue, Empty\ntq: Queue[int] = Queue(maxsize=100)\ndef producer():\n    tq.put(42, timeout=5)                         # blocks if full -> backpressure\ndef consumer():\n    try:    item = tq.get(timeout=5)              # blocks until item available\n    except Empty: return None\n    finally: tq.task_done()                       # pair every get() with task_done()\n# 3) asyncio.Queue — async-aware; works with await; NOT thread-safe by itself\nimport asyncio\nasync def aworker(q: asyncio.Queue):\n    while True:\n        item = await q.get()                       # cooperative, non-blocking\n        try:    await handle(item)\n        finally: q.task_done()\n# 4) multiprocessing.Queue — across processes; serializes via pickle\nfrom multiprocessing import Queue as MPQueue\nmq = MPQueue()                                     # IPC-safe; pickled hop per put/get\n# 5) PriorityQueue — when you need ordering, not arrival\nfrom queue import PriorityQueue\npq = PriorityQueue()\npq.put((1, \"urgent\"))\npq.put((10, \"low\"))\nprint(pq.get())                                    # (1, 'urgent')\n# Decision rule:\n#   single-threaded FIFO                  -> collections.deque (fastest)\n#   producer/consumer across threads       -> queue.Queue\n#   producer/consumer across coroutines    -> asyncio.Queue\n#   producer/consumer across processes     -> multiprocessing.Queue\n#   ordered processing (urgency)            -> queue.PriorityQueue / heapq\n#   bounded ring buffer (last N)            -> deque(maxlen=N)\n#\n# Anti-pattern: list.pop(0) for a queue\n#   O(n) — every dequeue physically shifts the rest. Even on tiny inputs the\n#   overhead is unnecessary. deque.popleft() is O(1) and safer.\nasync def handle(_): pass"
                  }
        ],
        tips: [
                  "`deque.popleft()` is O(1); `list.pop(0)` is O(n) — always use deque for queues",
                  "`queue.Queue` is thread-safe; `collections.deque` is not — use the right one for your context",
                  "Deque supports both ends: `appendleft` / `popleft` on the left, `append` / `pop` on the right",
                  "BFS always uses a queue; DFS always uses a stack (or recursion)"
        ],
        mistake: "Using `list.pop(0)` for a queue. This is O(n) — it physically shifts every remaining element. Use `deque.popleft()` for O(1).",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "deque",
        fn: "Deque",
        desc: "Double-ended queue — O(1) operations at both ends.",
        category: "Structures",
        subtitle: "Sliding window buffer, undo/redo, BFS, and more",
        signature: "deque(maxlen=n) | appendleft() | popleft() | rotate()",
        descLong: "collections.deque is a doubly linked list with O(1) access at both ends. maxlen= creates a fixed-size circular buffer — old items drop off the other end automatically. rotate() shifts all elements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Deque — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom collections import deque\nd = deque([1, 2, 3])\nd.appendleft(0)                                  # [0, 1, 2, 3]\nd.append(4)                                       # [0, 1, 2, 3, 4]\nprint(d.popleft())                                # 0\nprint(d.pop())                                    # 4"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Deque — common patterns you'll see in production.\n# APPROACH  - Combine Deque with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom collections import deque\n# 1) maxlen — ring buffer; old items auto-drop\nlast3 = deque(maxlen=3)\nfor x in [1, 2, 3, 4, 5]:\n    last3.append(x)\nprint(list(last3))                                # [3, 4, 5]\n# 2) rotate — shift all elements (positive: right; negative: left)\nd = deque([1, 2, 3, 4, 5])\nd.rotate(2);   print(d)                            # deque([4, 5, 1, 2, 3])\nd.rotate(-1);  print(d)                            # deque([5, 1, 2, 3, 4])\n# 3) Sliding-window MAXIMUM in O(n) — store INDICES of \"useful\" elements\ndef max_window(nums: list[int], k: int) -> list[int]:\n    q: deque[int] = deque()                       # indices; values are decreasing\n    out = []\n    for i, x in enumerate(nums):\n        while q and nums[q[-1]] < x:\n            q.pop()                               # newcomers can only beat older smaller ones\n        q.append(i)\n        if q[0] <= i - k:\n            q.popleft()                           # window slid past head\n        if i >= k - 1:\n            out.append(nums[q[0]])                # head is always the max in [i-k+1, i]\n    return out\nprint(max_window([1, 3, -1, -3, 5, 3, 6, 7], 3))  # [3, 3, 5, 5, 6, 7]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Deque — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom collections import deque\n# 1) Performance — deque is O(1) at the ends, O(n) IN THE MIDDLE\n#    list is O(1) for indexed read d[i] and O(n) at the front (pop(0))\n#    Pick by where you mutate / read most.\ndeque_d = deque([1, 2, 3, 4])                     # NOT random-access friendly\nlist_l  = [1, 2, 3, 4]                            # great for d[i]\n# 2) Monotonic deque — generalizes \"max of last k\" to many sliding-window problems\n#    - max:    pop right while smaller\n#    - min:    pop right while larger\n#    - same family solves: shortest subarray with sum >= K, jump-game, etc.\ndef min_window(nums, k):\n    q: deque[int] = deque()\n    out = []\n    for i, x in enumerate(nums):\n        while q and nums[q[-1]] > x:               # FLIP comparison for min\n            q.pop()\n        q.append(i)\n        if q[0] <= i - k: q.popleft()\n        if i >= k - 1: out.append(nums[q[0]])\n    return out\n# 3) Iterative DFS with deque used as a STACK (no extra import needed)\ndef dfs_iter(graph, start):\n    seen, stack = set(), deque([start])\n    while stack:\n        node = stack.pop()                         # right-end pop -> LIFO\n        if node in seen: continue\n        seen.add(node)\n        stack.extend(reversed(graph.get(node, ())))\n    return seen\n# 4) Don't use deque if you need INDEX SLICING — list is O(k) for d[i:j], deque isn't.\n#    Convert at the boundary: list(d) is O(n).\n# Decision rule:\n#   FIFO with O(1) at both ends           -> deque\n#   ring buffer \"last N items\"             -> deque(maxlen=N)\n#   sliding-window min/max in O(n)         -> monotonic deque of INDICES\n#   random index reads (d[i] often)         -> list\n#   thread-safe                              -> queue.Queue (NOT deque)\n#   thread-safe rotate / cycle               -> use a Lock around deque\n#\n# Anti-pattern: deque[i] in a hot loop\n#   Each access is O(n) — much slower than list[i]. If you need both ends-fast\n#   AND indexed reads, materialize the deque to a list when reads dominate."
                  }
        ],
        tips: [
                  "`deque(maxlen=n)` is the cleanest fixed-size sliding window — old items auto-drop",
                  "`rotate(n)` rotates right for positive n, left for negative — in O(n) time",
                  "Deque is O(n) for random access by index — use list if you need frequent middle access",
                  "Works as both stack and queue — call the right end for the right behavior"
        ],
        mistake: "Using deque for random index access: `d[i]`. Unlike lists, deque is O(n) for middle access. If you need frequent indexed access, use a list instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "heap",
        fn: "Heap",
        desc: "Partially sorted tree — O(log n) insert, O(1) min access.",
        category: "Structures",
        subtitle: "Min-heap via heapq — negate values for max-heap",
        signature: "heapq.heappush(h, x) | heapq.heappop(h) | h[0] to peek",
        descLong: "Python's heapq module implements a min-heap. The smallest element is always at h[0]. For a max-heap, negate values. For complex objects, store (priority, item) tuples — they compare lexicographically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Heap — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport heapq\nh: list[int] = []\nheapq.heappush(h, 5)\nheapq.heappush(h, 1)\nheapq.heappush(h, 3)\nprint(h[0])                                   # 1 — peek the min\nprint(heapq.heappop(h))                       # 1 — pop the min"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Heap — common patterns you'll see in production.\n# APPROACH  - Combine Heap with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport heapq\n# 1) heapify in O(n) — turns any list into a heap in place\nnums = [3, 1, 4, 1, 5, 9, 2, 6]\nheapq.heapify(nums)\nprint(heapq.heappop(nums))                    # 1\n# 2) Max-heap — Python only ships a min-heap, so NEGATE values\nmax_h: list[int] = []\nfor n in [3, 1, 4, 1, 5]:\n    heapq.heappush(max_h, -n)\nprint(-heapq.heappop(max_h))                  # 5 (the actual max)\n# 3) Top-k WITHOUT sorting — O(n log k), beats sorted() when k is small\nheapq.nlargest(3, nums)                       # [9, 6, 5]\nheapq.nsmallest(3, nums, key=abs)             # k closest to 0\n# 4) k-way merge of sorted iterables — streaming, O(N log k)\nlist(heapq.merge([1, 4, 7], [2, 5, 8], [3, 6, 9]))\n# [1, 2, 3, 4, 5, 6, 7, 8, 9]\n# K closest points to origin\ndef k_closest(points: list[tuple[float, float]], k: int):\n    return heapq.nsmallest(k, points, key=lambda p: p[0]**2 + p[1]**2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Heap — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport heapq\nimport itertools\n# 1) Tie-breaking — items with equal priority should NOT be compared by value\n#    Add a monotonic counter so the heap is fully deterministic.\ncounter = itertools.count()\npq: list[tuple[int, int, dict]] = []\ndef push_task(priority: int, task: dict):\n    heapq.heappush(pq, (priority, next(counter), task))    # counter breaks ties\ndef pop_task():\n    return heapq.heappop(pq)[2]\n# 2) heappushpop / heapreplace — push and pop in ONE step (cheaper than two)\n#    Use to maintain a \"top-k\" heap of size k:\ndef top_k_streaming(stream, k: int) -> list[int]:\n    heap: list[int] = []\n    for x in stream:\n        if len(heap) < k:\n            heapq.heappush(heap, x)\n        elif x > heap[0]:                          # only swap if it can knock out smallest\n            heapq.heapreplace(heap, x)             # ONE call: pop AND push\n    return sorted(heap, reverse=True)\n# 3) Running median — two heaps (max on the left, min on the right)\nclass RunningMedian:\n    def __init__(self):\n        self.lo: list[int] = []                    # max-heap (negated)\n        self.hi: list[int] = []                    # min-heap\n    def add(self, x: int):\n        heapq.heappush(self.lo, -heapq.heappushpop(self.hi, x))\n        if len(self.lo) > len(self.hi) + 1:\n            heapq.heappush(self.hi, -heapq.heappop(self.lo))\n    def median(self) -> float:\n        if len(self.lo) > len(self.hi):\n            return -self.lo[0]\n        return (-self.lo[0] + self.hi[0]) / 2\n# 4) heap is NOT sorted past index 0\n#    The only guaranteed order is the partial-order property: each parent <= children.\n#    Don't iterate h to read in sorted order; pop one at a time, or sorted(h).\n# 5) For COMPLEX comparisons, store (key, tiebreak, payload) tuples — NOT a class\n#    with __lt__, unless you're sure objects of equal priority should never tie.\n# Decision rule:\n#   ordered processing of a stream         -> heapq with (priority, counter, item)\n#   bounded \"top-k\" memory                  -> push/replace into a size-k min-heap\n#   merge sorted streams                     -> heapq.merge (lazy, doesn't load all)\n#   running median / percentile (low N)     -> two heaps (max-left, min-right)\n#   need to remove an arbitrary item          -> heap-with-tombstones (lazy delete)\n#   thread-safe priority queue                -> queue.PriorityQueue\n#\n# Anti-pattern: scanning past h[0] thinking it's \"the second smallest\"\n#   The heap's index layout is partial; h[1] is \"smaller than its descendants\",\n#   not \"second-smallest overall.\" Always pop or use nsmallest to get order."
                  }
        ],
        tips: [
                  "Python heapq is a MIN-heap — smallest element is always at index 0",
                  "For max-heap, negate values: `heappush(h, -val)`, then `-heappop(h)` to get the true max",
                  "`heapq.nlargest(k, data, key=fn)` is O(n log k) — faster than `sorted()` when k is small",
                  "`heapq.merge(*sorted_lists)` merges k sorted iterables in O(n log k) without loading all into memory"
        ],
        mistake: "Indexing heap for second-smallest: `h[1]`. A heap only guarantees `h[0]` is minimum — other positions are not sorted.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "priority-queue",
        fn: "Priority Queue",
        desc: "Process items by priority, not insertion order.",
        category: "Structures",
        subtitle: "Store (priority, item) tuples — lowest priority number first",
        signature: "heapq.heappush(h, (priority, item)) | heapq.heappop(h)",
        descLong: "A priority queue processes the highest-priority item first. In Python, implement with heapq using (priority, item) tuples. Lowest number = highest priority (min-heap). For equal priorities, add a tie-breaking counter to avoid comparing items.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Priority Queue — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport heapq\ntasks: list[tuple[int, str]] = []\nheapq.heappush(tasks, (1, \"low priority\"))\nheapq.heappush(tasks, (0, \"urgent\"))\nheapq.heappush(tasks, (2, \"optional\"))\nprint(heapq.heappop(tasks))                     # (0, 'urgent')"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Priority Queue — common patterns you'll see in production.\n# APPROACH  - Combine Priority Queue with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport heapq\nimport itertools\n# 1) Tie-break — counter as MIDDLE element so items are NEVER compared\nclass PriorityQueue:\n    def __init__(self):\n        self._h: list[tuple[int, int, object]] = []\n        self._tie = itertools.count()             # monotonically increasing\n    def push(self, priority: int, item):\n        heapq.heappush(self._h, (priority, next(self._tie), item))\n    def pop(self):\n        priority, _, item = heapq.heappop(self._h)\n        return priority, item\npq = PriorityQueue()\npq.push(1, {\"id\": 1})\npq.push(1, {\"id\": 2})                            # SAME priority — counter breaks tie\npq.push(0, {\"id\": 3})\nprint(pq.pop())                                   # (0, {'id': 3})\n# 2) Max-priority queue — negate the priority\nhigh_first: list[tuple[int, str]] = []\nheapq.heappush(high_first, (-5, \"VIP\"))\nheapq.heappush(high_first, (-1, \"normal\"))\nprio, item = heapq.heappop(high_first); print(-prio, item)   # 5 VIP\n# 3) Dijkstra — priority queue is the engine\ndef dijkstra(graph, src):\n    dist = {src: 0}\n    pq   = [(0, src)]\n    while pq:\n        d, node = heapq.heappop(pq)\n        if d > dist.get(node, float(\"inf\")):     # stale entry; skip\n            continue\n        for nbr, w in graph[node]:\n            nd = d + w\n            if nd < dist.get(nbr, float(\"inf\")):\n                dist[nbr] = nd\n                heapq.heappush(pq, (nd, nbr))\n    return dist"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Priority Queue — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport heapq\nimport itertools\nfrom queue import PriorityQueue as ThreadSafePQ\n# 1) heapq has NO decrease-key — use the \"stale entry\" trick:\n#    push the new (lower) priority; when you pop, check if it matches the\n#    CURRENT distance/cost and skip stale entries.\ndef dijkstra_stale(graph, src):\n    dist = {src: 0}\n    pq   = [(0, src)]\n    while pq:\n        d, node = heapq.heappop(pq)\n        if d > dist.get(node, float(\"inf\")):     # ignored stale entry\n            continue\n        for nbr, w in graph[node]:\n            nd = d + w\n            if nd < dist.get(nbr, float(\"inf\")):\n                dist[nbr] = nd\n                heapq.heappush(pq, (nd, nbr))    # leaves OLD entry in heap (stale)\n    return dist\n# 2) Lazy delete — for \"remove arbitrary item\" without rebuilding the heap\n#    Mark a token as deleted; skip it on pop.\nclass CancelableQueue:\n    REMOVED = object()\n    def __init__(self):\n        self._h: list[list] = []                  # entries are MUTABLE lists\n        self._index: dict[object, list] = {}\n        self._tie = itertools.count()\n    def push(self, priority, item):\n        entry = [priority, next(self._tie), item]\n        self._index[id(item)] = entry\n        heapq.heappush(self._h, entry)\n    def cancel(self, item):\n        entry = self._index.pop(id(item), None)\n        if entry is not None:\n            entry[-1] = self.REMOVED              # mark; the heap stays valid\n    def pop(self):\n        while self._h:\n            _, _, item = heapq.heappop(self._h)\n            if item is not self.REMOVED:\n                self._index.pop(id(item), None)\n                return item\n        raise IndexError(\"empty\")\n# 3) Thread-safe priority queue — for producer/consumer code\ntq = ThreadSafePQ()\ntq.put((1, \"task A\"))\ntq.put((0, \"task B\"))\nprint(tq.get())                                   # (0, 'task B')   — blocks if empty\n# 4) When NOT to roll your own\n#    - Need fast decrease-key on huge graphs    -> Fibonacci/pairing heap (rare in Python)\n#    - Need a real priority queue across procs  -> Redis sorted set (ZADD/ZPOPMIN)\n#    - Need TTL / scheduled jobs                 -> APScheduler / Celery, NOT heapq\n# Decision rule:\n#   simple in-process priority order        -> heapq with (priority, counter, item)\n#   max-priority                              -> negate the priority\n#   thread-safe                                -> queue.PriorityQueue\n#   need to cancel queued items                -> lazy-delete with sentinel\n#   need to lower a key after insert            -> stale-entry pattern (re-push)\n#   distributed                                  -> Redis ZSET, not heapq\n#\n# Anti-pattern: pushing (priority, item) where item is non-comparable\n#   When two priorities tie, Python compares the items — and if they don't\n#   define __lt__ you get TypeError mid-run. ALWAYS use (priority, counter, item)."
                  }
        ],
        tips: [
                  "Always add a tie-breaking counter as the middle element: `(priority, counter, item)` — prevents errors when items are not comparable",
                  "For max-priority-queue (highest number first), negate the priority: `heappush(h, (-priority, item))`",
                  "Mark stale entries with a tombstone or check `d > dist[node]` rather than removing — heapq has no efficient decrease-key",
                  "Use `queue.PriorityQueue` for thread-safe priority queues in concurrent code"
        ],
        mistake: "Storing `(priority, item)` where item is a non-comparable object (like a custom class without `__lt__`). When two priorities are equal, Python tries to compare the items and raises TypeError. Always add a unique counter as the tiebreaker.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "hashmap",
        fn: "HashMap",
        desc: "O(1) average key-value lookup — the most-used data structure.",
        category: "Structures",
        subtitle: "dict, defaultdict, Counter — all backed by hash tables",
        signature: "d.get(key, default) | defaultdict(list) | Counter(iterable)",
        descLong: "Python dict is a hash map with O(1) average case for get/set/delete. Common patterns: frequency counting with Counter, grouping with defaultdict, two-sum style index lookup, and memoization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of HashMap — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nd = {\"alice\": 1, \"bob\": 2}\nprint(d.get(\"alice\"))                             # 1\nprint(d.get(\"carol\", 0))                          # 0  — no KeyError"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of HashMap — common patterns you'll see in production.\n# APPROACH  - Combine HashMap with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom collections import Counter, defaultdict\n# 1) Frequency count — Counter never KeyErrors and supports most_common\nwords = \"the quick brown fox the fox\".split()\nc = Counter(words)\nprint(c.most_common(2))                            # [('the', 2), ('fox', 2)]\nprint(c[\"missing\"])                                # 0 (not KeyError)\n# 2) Group-by — one-liner with defaultdict(list)\nitems = [{\"k\": \"a\", \"v\": 1}, {\"k\": \"a\", \"v\": 2}, {\"k\": \"b\", \"v\": 3}]\ngroups: defaultdict[str, list] = defaultdict(list)\nfor it in items:\n    groups[it[\"k\"]].append(it[\"v\"])\nprint(dict(groups))                                # {'a': [1, 2], 'b': [3]}\n# 3) Two-sum — store seen values in a dict, look up complement in O(1)\ndef two_sum(nums: list[int], target: int) -> list[int]:\n    seen: dict[int, int] = {}                      # value -> index\n    for i, n in enumerate(nums):\n        if (target - n) in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\nprint(two_sum([2, 7, 11, 15], 9))                  # [0, 1]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of HashMap — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom collections import OrderedDict\nfrom functools import lru_cache\n# 1) lru_cache — memoization without rolling your own dict\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n# Reset between tests:\n# fib.cache_clear()\n# 2) Hashable KEYS — list / dict / set are NOT hashable; convert at the boundary\n@lru_cache\ndef count_unique(items: tuple[int, ...]) -> int:    # tuple, not list\n    return len(set(items))\n# 3) Default-factory pitfall — defaultdict CREATES entries on missing-key access\nfrom collections import defaultdict\ng: defaultdict[str, list] = defaultdict(list)\n_ = g[\"new_key\"]                                    # creates an empty list!\nprint(dict(g))                                      # {'new_key': []}\n# To check without creation, use:  \"new_key\" in g  or  g.get(\"new_key\")\n# 4) Build an LRU cache from scratch — useful when you can't import functools\nclass LRU:\n    def __init__(self, capacity: int):\n        self._cap = capacity\n        self._d: OrderedDict[object, object] = OrderedDict()\n    def get(self, key):\n        if key not in self._d: return None\n        self._d.move_to_end(key)                    # mark as most-recent\n        return self._d[key]\n    def put(self, key, value):\n        if key in self._d:\n            self._d.move_to_end(key)\n        self._d[key] = value\n        if len(self._d) > self._cap:\n            self._d.popitem(last=False)             # evict OLDEST\n# 5) When dict ISN'T enough\n#    - need ordered keys with min/max         -> sorted list / SortedDict (sortedcontainers)\n#    - need \"any item\" without picking key     -> dict has popitem() (returns LAST inserted)\n#    - thread-safe counters                     -> threading.Lock around updates\n# Decision rule:\n#   O(1) lookup, simple                       -> dict\n#   counts / frequencies                       -> Counter\n#   group-by / accumulate                      -> defaultdict(list / int / set)\n#   memoize a pure function                    -> @lru_cache(maxsize=None)\n#   need keys ORDERED                          -> dict in modern Python keeps insertion order\n#                                                (use sortedcontainers.SortedDict for sorted keys)\n#   bounded cache                                -> LRU via OrderedDict + move_to_end\n#\n# Anti-pattern: \"if key in d: d[key]\" then \"else: d[key] = default\"\n#   Two lookups when one suffices. Use d.get(key, default) (read-only) or\n#   d.setdefault(key, default) (writes default if missing) — single lookup."
                  }
        ],
        tips: [
                  "dict is the most versatile data structure — frequency counting, grouping, memoization, index lookup",
                  "`Counter` never raises KeyError for missing keys — returns 0",
                  "`defaultdict(list)` is the cleanest groupby pattern — no need to check if key exists before appending",
                  "Check `if key in d` before `d[key]`, or use `d.get(key, default)` — never rely on KeyError for control flow"
        ],
        mistake: "Checking `if key in d` then accessing `d[key]` separately — two lookups. Use `d.get(key, default)` for one lookup, or `try/except KeyError`.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "linked-list",
        fn: "Linked List",
        desc: "Node-based linear structure — O(1) insert/delete at head.",
        category: "Structures",
        subtitle: "Singly linked list — common in interview problems",
        signature: "class ListNode: val; next = None",
        descLong: "Python does not have a built-in linked list (deque is backed by a doubly linked list, but its nodes are not exposed). In interviews you typically receive a ListNode class. Key patterns: traverse, reverse, detect cycle, find middle.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Linked List — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\ndef to_list(head):\n    out = []\n    while head:                                  # walk until None\n        out.append(head.val)\n        head = head.next\n    return out\nhead = ListNode(1, ListNode(2, ListNode(3)))\nprint(to_list(head))                              # [1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Linked List — common patterns you'll see in production.\n# APPROACH  - Combine Linked List with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n# 1) REVERSE in place — three pointers; SAVE the next pointer FIRST\ndef reverse(head):\n    prev, cur = None, head\n    while cur:\n        nxt      = cur.next                       # save before overwriting\n        cur.next = prev\n        prev, cur = cur, nxt\n    return prev                                   # new head\n# 2) MIDDLE — slow advances 1, fast advances 2; when fast hits end, slow == middle\ndef middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow\n# 3) CYCLE detection — Floyd's tortoise & hare\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:                          # they meet -> cycle exists\n            return True\n    return False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Linked List — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val, self.next = val, next\n# 1) DUMMY HEAD — eliminates \"head might be deleted\" edge cases\ndef remove_value(head, target):\n    dummy = ListNode(0, head)                     # ALWAYS exists\n    prev, cur = dummy, head\n    while cur:\n        if cur.val == target:\n            prev.next = cur.next                  # never need to special-case head\n        else:\n            prev = cur\n        cur = cur.next\n    return dummy.next                             # may be different from original head\n# 2) K-th from END — two-pointer with k-step lead; ONE pass, O(1) space\ndef remove_nth_from_end(head, k):\n    dummy = ListNode(0, head)\n    fast = slow = dummy\n    for _ in range(k): fast = fast.next            # advance fast k steps\n    while fast.next:\n        fast, slow = fast.next, slow.next         # walk together; slow ends at (k+1)-th from end\n    slow.next = slow.next.next                    # delete the k-th from end\n    return dummy.next\n# 3) CYCLE START — Floyd's: after meeting, walk one pointer from head and one\n#    from the meeting point; they meet at the cycle start.\ndef cycle_start(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast:                          # phase 1: detect cycle\n            slow = head                           # phase 2: find the start\n            while slow is not fast:\n                slow, fast = slow.next, fast.next\n            return slow\n    return None\n# 4) MERGE two sorted lists — dummy + tail pointer\ndef merge(a, b):\n    dummy = tail = ListNode()\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b                            # attach remaining tail\n    return dummy.next\n# 5) Recursion vs iteration — Python's stack ~1000 deep; iterative for big inputs\n#    Iterative reversal is O(1) space; recursive reversal is O(n) stack space.\n# Decision rule:\n#   modify around the head                     -> dummy head node\n#   \"k-th from end\" / \"remove nth\"             -> two-pointer with k-step lead\n#   detect cycle existence                       -> Floyd's tortoise & hare\n#   find cycle ENTRY                             -> Floyd's + restart from head\n#   merge sorted lists                           -> dummy + tail pointer\n#   reverse / partition                          -> iterative; recursion blows stack on big inputs\n#\n# Anti-pattern: cur.next = prev WITHOUT saving cur.next first\n#   You've just orphaned the rest of the list. The first line of any reversal\n#   loop should be:  nxt = cur.next."
                  }
        ],
        tips: [
                  "Always use a dummy head node for insertion/deletion — eliminates edge cases at the true head",
                  "Fast/slow pointers (Floyd's) solve: cycle detection, middle finding, nth-from-end in O(1) space",
                  "Draw the pointer moves on paper before coding — visualizing node reassignment prevents bugs",
                  "In Python interviews, linked list problems often test pointer manipulation, not the language itself"
        ],
        mistake: "Losing the rest of the list during reversal. Save `nxt = cur.next` before overwriting `cur.next = prev`. Failing to save `nxt` first is the most common reversal bug.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "graph",
        fn: "Graph",
        desc: "Nodes connected by edges — represented as adjacency list.",
        category: "Structures",
        subtitle: "BFS for shortest path, DFS for connectivity and cycles",
        signature: "graph = defaultdict(list) | bfs(graph, start) | dfs(graph, start)",
        descLong: "Graphs are represented in Python as adjacency lists — a dict mapping each node to its list of neighbors. BFS (breadth-first) finds shortest paths in unweighted graphs. DFS (depth-first) detects connectivity, cycles, and topological order.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Graph — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom collections import defaultdict, deque\ngraph: defaultdict[int, list[int]] = defaultdict(list)\nfor u, v in [(0, 1), (0, 2), (1, 3), (2, 3)]:\n    graph[u].append(v)\n    graph[v].append(u)                            # undirected: add reverse edge\ndef bfs(g, start):\n    seen, q = {start}, deque([start])\n    out = []\n    while q:\n        n = q.popleft()                           # FIFO -> level by level\n        out.append(n)\n        for nb in g[n]:\n            if nb not in seen:\n                seen.add(nb); q.append(nb)\n    return out\nprint(bfs(graph, 0))                              # [0, 1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Graph — common patterns you'll see in production.\n# APPROACH  - Combine Graph with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom collections import defaultdict, deque\n# 1) Shortest path on UNWEIGHTED graph — BFS + parent map (NO path-list copying)\ndef shortest_path(g, src, dst):\n    parent = {src: None}\n    q = deque([src])\n    while q:\n        n = q.popleft()\n        if n == dst:                              # reconstruct the path\n            path = []\n            while n is not None:\n                path.append(n); n = parent[n]\n            return path[::-1]\n        for nb in g[n]:\n            if nb not in parent:\n                parent[nb] = n\n                q.append(nb)\n    return None\n# 2) DFS — iterative (uses a stack)\ndef dfs_iter(g, src):\n    seen, stack, out = set(), [src], []\n    while stack:\n        n = stack.pop()                           # right-end pop -> LIFO -> DFS\n        if n in seen: continue\n        seen.add(n); out.append(n)\n        stack.extend(reversed(g[n]))              # reverse so leftmost is visited first\n    return out\n# 3) DFS — recursive (cleaner for trees / small graphs)\ndef dfs_rec(g, n, seen=None):\n    if seen is None: seen = set()\n    seen.add(n)\n    for nb in g[n]:\n        if nb not in seen:\n            dfs_rec(g, nb, seen)\n    return seen"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Graph — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport heapq\nfrom collections import defaultdict, deque\n# 1) TOPOLOGICAL SORT — Kahn's algorithm (BFS over indegrees)\ndef topo_sort(n: int, edges: list[tuple[int, int]]) -> list[int] | None:\n    g: defaultdict[int, list[int]] = defaultdict(list)\n    indeg = [0] * n\n    for u, v in edges:\n        g[u].append(v); indeg[v] += 1\n    q = deque(i for i, d in enumerate(indeg) if d == 0)\n    out = []\n    while q:\n        n_ = q.popleft(); out.append(n_)\n        for nb in g[n_]:\n            indeg[nb] -= 1\n            if indeg[nb] == 0: q.append(nb)\n    return out if len(out) == n else None         # None -> cycle present\n# 2) CYCLE DETECTION on a DIRECTED graph — three-color DFS\ndef has_cycle_directed(g):\n    WHITE, GRAY, BLACK = 0, 1, 2\n    color = defaultdict(lambda: WHITE)\n    def dfs(n):\n        if color[n] == GRAY: return True          # back-edge -> cycle\n        if color[n] == BLACK: return False\n        color[n] = GRAY\n        for nb in g[n]:\n            if dfs(nb): return True\n        color[n] = BLACK\n        return False\n    return any(dfs(n) for n in list(g))\n# 3) DIJKSTRA — weighted shortest path; priority queue with stale-entry skip\ndef dijkstra(g, src):\n    dist = {src: 0}\n    pq   = [(0, src)]\n    while pq:\n        d, node = heapq.heappop(pq)\n        if d > dist.get(node, float(\"inf\")):     # stale; ignore\n            continue\n        for nb, w in g[node]:\n            nd = d + w\n            if nd < dist.get(nb, float(\"inf\")):\n                dist[nb] = nd\n                heapq.heappush(pq, (nd, nb))\n    return dist\n# 4) Visited DISCIPLINE — the #1 graph bug\n#    BFS: mark visited when ENQUEUEING (not when dequeueing); otherwise the\n#    same node gets enqueued multiple times -> O(n^2).\n#    DFS iterative: check visited AFTER popping is OK; just don't re-explore.\n# 5) Recursion limits — Python's default ~1000 frames blows up on big graphs\n#    Use iterative DFS, or bump it: sys.setrecursionlimit(10_000)\n# Decision rule:\n#   shortest path, UNWEIGHTED          -> BFS + parent map\n#   shortest path, WEIGHTED (>= 0)      -> Dijkstra (heap)\n#   shortest path, NEGATIVE weights      -> Bellman-Ford\n#   cycle in directed graph               -> three-color DFS\n#   topological order                     -> Kahn's BFS or post-order DFS\n#   connected components                   -> DFS / BFS / union-find\n#   small dense graph                      -> adjacency MATRIX (n*n bool)\n#   big sparse graph                       -> adjacency LIST (default)\n#\n# Anti-pattern: marking visited when DEQUEUEING in BFS\n#   The same node gets pushed multiple times before it's first popped.\n#   Mark visited the moment you ENQUEUE — once per node, total."
                  }
        ],
        tips: [
                  "BFS = queue, DFS = stack (or recursion) — this is the single most important graph rule",
                  "Always track `visited` before adding to the queue/stack, not after popping — prevents revisiting",
                  "For directed graphs, do not add the reverse edge when building the adjacency list",
                  "BFS gives the shortest path in unweighted graphs — for weighted graphs, use Dijkstra"
        ],
        mistake: "Adding a node to `visited` when *popping* from the queue instead of when *pushing*. This allows the same node to be added to the queue multiple times, causing O(n²) work.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "trie",
        fn: "Trie",
        desc: "Prefix tree for O(L) word insert, search, and prefix matching.",
        category: "Structures",
        subtitle: "Efficient prefix search — autocomplete, spell check, IP routing",
        signature: "class TrieNode: children={}; is_end=False",
        descLong: "A Trie (prefix tree) stores strings character by character, sharing common prefixes. Insert and search are O(L) where L is the word length. Used for autocomplete, spell checking, and IP routing. Can be implemented with nested dicts or TrieNode objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Trie — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nclass Trie:\n    END = \"#\"\n    def __init__(self): self.root = {}\n    def insert(self, word):\n        node = self.root\n        for c in word:\n            node = node.setdefault(c, {})        # create child if missing\n        node[self.END] = True\n    def search(self, word):\n        node = self.root\n        for c in word:\n            if c not in node: return False\n            node = node[c]\n        return self.END in node                   # word fully present\nprint(Trie().__class__.__name__)                  # 'Trie'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Trie — common patterns you'll see in production.\n# APPROACH  - Combine Trie with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nclass Trie:\n    END = \"#\"\n    def __init__(self):\n        self.root: dict = {}\n    def insert(self, word: str):\n        node = self.root\n        for c in word:\n            node = node.setdefault(c, {})\n        node[self.END] = True\n    def search(self, word: str) -> bool:\n        node = self._walk(word)\n        return node is not None and self.END in node\n    def starts_with(self, prefix: str) -> bool:\n        return self._walk(prefix) is not None\n    def autocomplete(self, prefix: str) -> list[str]:\n        node = self._walk(prefix)\n        if node is None: return []\n        out: list[str] = []\n        def dfs(n, path):\n            if self.END in n: out.append(prefix + path)\n            for c, child in n.items():\n                if c != self.END:\n                    dfs(child, path + c)\n        dfs(node, \"\")\n        return out\n    def _walk(self, s: str):                      # walk to node; return None if missing\n        node = self.root\n        for c in s:\n            if c not in node: return None\n            node = node[c]\n        return node\nt = Trie()\nfor w in [\"apple\", \"app\", \"application\", \"apt\"]:\n    t.insert(w)\nprint(t.starts_with(\"app\"))                       # True\nprint(sorted(t.autocomplete(\"app\")))              # ['app', 'apple', 'application']"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Trie — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom typing import Optional\nclass TrieNode:\n    __slots__ = (\"children\", \"word\", \"count\")     # millions of nodes -> memory matters\n    def __init__(self):\n        self.children: dict[str, \"TrieNode\"] = {}\n        self.word:     Optional[str] = None       # the FULL word at this node, or None\n        self.count:    int = 0                     # how many words pass through (for prefix freq)\nclass Trie:\n    def __init__(self): self.root = TrieNode()\n    def insert(self, word: str):\n        node = self.root\n        for c in word:\n            node.count += 1\n            node = node.children.setdefault(c, TrieNode())\n        node.count += 1\n        node.word = word\n    def delete(self, word: str) -> bool:\n        # Delete returns True if a word was actually removed; prunes empty branches\n        path: list[tuple[TrieNode, str]] = []\n        node = self.root\n        for c in word:\n            if c not in node.children: return False\n            path.append((node, c))\n            node = node.children[c]\n        if node.word != word: return False\n        node.word = None\n        # Prune empty subtrees\n        for parent, c in reversed(path):\n            child = parent.children[c]\n            if not child.children and child.word is None:\n                del parent.children[c]\n            else:\n                break\n        return True\n    def prefix_count(self, prefix: str) -> int:\n        node = self.root\n        for c in prefix:\n            if c not in node.children: return 0\n            node = node.children[c]\n        return node.count\n# 1) DON'T reach for a trie when:\n#    - alphabet is huge (Unicode) and tree fan-out blows memory\n#    - you only need exact-match lookup -> dict / set is faster and simpler\n#    - prefixes are rare -> hash + sorted list is enough\n# 2) DO reach for a trie when:\n#    - autocomplete / spell-check / IP routing\n#    - many words share long prefixes\n#    - you need O(L) prefix queries regardless of dictionary size\n# 3) Compressed trie / Patricia tree / radix tree — collapse single-child chains\n#    into edge labels. Saves a LOT of memory at the cost of code complexity.\n# 4) Aho-Corasick — trie with failure links for multi-pattern string matching\n#    (find all of N patterns in a text in O(text + matches)).\n# Decision rule:\n#   exact-match lookup only                 -> set / dict, NOT trie\n#   prefix search + small alphabet          -> Trie (nested dict or TrieNode)\n#   memory-tight + millions of words         -> compressed trie or DAFSA\n#   match many patterns at once              -> Aho-Corasick\n#   IP routing / longest-prefix match         -> radix trie\n#\n# Anti-pattern: storing whole words at every level\n#   That's just a list lookup with extra steps. The whole point of a trie is\n#   sharing prefixes among nodes. If you find yourself doing it, switch to a set."
                  }
        ],
        tips: [
                  "The dict-based trie is simpler to write in interviews — nested dicts with a `\"#\"` end marker",
                  "Tries beat hash sets for prefix queries: `starts_with()` is O(L) regardless of dictionary size",
                  "Space trade-off: tries use more memory than hash sets but enable prefix operations",
                  "`node.setdefault(ch, {})` is the cleanest insert idiom — creates child if absent, returns it"
        ],
        mistake: "Storing full words at every node instead of building the character-by-character tree. This defeats the purpose — shared prefixes should share nodes.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "binary-search",
        fn: "Binary search",
        desc: "O(log n) search on sorted arrays.",
        category: "Search",
        subtitle: "Use bisect module — or implement with lo/hi/mid pattern",
        signature: "bisect.bisect_left(a, x) | bisect.bisect_right(a, x)",
        descLong: "Binary search finds a value in O(log n) by halving the search space each step. Python's bisect module provides production-ready binary search. Implement manually only to understand the lo/hi/mid pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Binary search — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport bisect\na = [1, 3, 5, 7, 9]\ni = bisect.bisect_left(a, 5)                      # 2 — index of first 5\nprint(i, a[i] if i < len(a) and a[i] == 5 else \"missing\")\nbisect.insort(a, 4)                                # keeps array sorted\nprint(a)                                           # [1, 3, 4, 5, 7, 9]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Binary search — common patterns you'll see in production.\n# APPROACH  - Combine Binary search with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport bisect\na = [1, 3, 5, 5, 5, 7, 9]\nprint(bisect.bisect_left(a, 5))                   # 2 — FIRST index of 5\nprint(bisect.bisect_right(a, 5))                  # 5 — index AFTER last 5\n# count in range [lo, hi] inclusive: bisect_right(hi) - bisect_left(lo)\ndef count_in_range(arr, lo, hi):\n    return bisect.bisect_right(arr, hi) - bisect.bisect_left(arr, lo)\nprint(count_in_range(a, 3, 5))                    # 4\n# Manual binary search — exact match\ndef bsearch(arr: list[int], target: int) -> int:\n    lo, hi = 0, len(arr) - 1\n    while lo <= hi:                               # closed interval [lo, hi]\n        mid = (lo + hi) // 2\n        if arr[mid] == target: return mid\n        if arr[mid] < target:  lo = mid + 1\n        else:                  hi = mid - 1\n    return -1                                      # not found\nprint(bsearch(a, 7))                              # 5"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Binary search — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport bisect\n# 1) bisect with key= (3.10+) — search on a derived key WITHOUT building a parallel array\npeople = [{\"age\": 20}, {\"age\": 30}, {\"age\": 40}]\ni = bisect.bisect_left(people, 35, key=lambda p: p[\"age\"])\n# i = 2 -> insert position to keep sorted by age\n# 2) BINARY SEARCH ON THE ANSWER — search space is a range of VALUES, not an array.\n#    Use when the predicate \"can we do it in T?\" is monotonic (false then true).\ndef min_days_to_bloom(flowers: list[int], k: int) -> int:\n    def can_bloom(days: int) -> bool:\n        bouquets = run = 0\n        for d in flowers:\n            run = run + 1 if d <= days else 0\n            if run == k:\n                bouquets += 1\n                run = 0\n        return bouquets >= 1\n    lo, hi = min(flowers), max(flowers)\n    while lo < hi:                                # half-open [lo, hi)\n        mid = (lo + hi) // 2\n        if can_bloom(mid):                        # works at mid; try smaller\n            hi = mid\n        else:                                     # need more time\n            lo = mid + 1\n    return lo\n# 3) FIND-FIRST-TRUE pattern — generalize \"binary search on the answer\"\ndef first_true(lo: int, hi: int, predicate) -> int:\n    while lo < hi:\n        mid = (lo + hi) // 2\n        if predicate(mid): hi = mid               # mid works -> may also at smaller\n        else:              lo = mid + 1            # mid doesn't -> must go bigger\n    return lo                                      # smallest x where predicate is True\n# 4) Off-by-one survival kit\n#    - \"<= hi\" with hi = len-1   <-> closed interval; mid = (lo+hi)//2\n#    - \"<  hi\" with hi = len     <-> half-open; same loop body, lo<hi\n#    Pick ONE convention and stick to it. Most bugs come from mixing them.\n# 5) Rotated array, peak finding, search 2D matrix — all bsearch variants.\n#    Pattern: find a monotonic INVARIANT that lets you discard half each step.\n# Decision rule:\n#   look up in a sorted ARRAY                 -> bisect_left / bisect_right\n#   keep an array sorted while inserting       -> bisect.insort\n#   \"minimum capacity / max threshold\" Q&A     -> binary search on the answer\n#   need to search by a derived key             -> bisect(..., key=...) (3.10+)\n#   need exact match index                       -> bisect_left then verify a[i]==x\n#   range count between lo and hi inclusive    -> bisect_right(hi) - bisect_left(lo)\n#\n# Anti-pattern: rolling your own \"find first occurrence\" with mid+/-1 boundaries\n#   It's bisect_left in two characters. Avoid the off-by-one trap by reaching\n#   for the stdlib first; only hand-roll when you're searching on the ANSWER."
                  }
        ],
        tips: [
                  "Use `bisect` module in production — no need to implement binary search from scratch",
                  "`bisect_left` gives the index of the first occurrence; `bisect_right` gives one past the last",
                  "\"Binary search on the answer\" — when the search space is a range of values, not an array",
                  "`lo + (hi - lo) // 2` avoids integer overflow in other languages — fine in Python but good habit"
        ],
        mistake: "Using `lo <= hi` with `mid = (lo + hi) // 2` but not handling the termination correctly. For \"find first/last occurrence\" the boundary conditions differ — use bisect_left/right instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "sorting-patterns",
        fn: "Sorting patterns",
        desc: "Custom sort keys, stable sort, and partial sort with heapq.",
        category: "Search",
        subtitle: "key=, reverse=, stability, and when to use heapq instead",
        signature: "sorted(it, key=fn, reverse=True) | heapq.nlargest(k, data)",
        descLong: "Python's sort is Timsort — O(n log n), stable, and highly optimized. Use key= for custom ordering. Stability means equal-key elements preserve their original order — this enables multi-key sorts with multiple sort passes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Sorting patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nnums = [3, 1, 4, 1, 5, 9, 2]\nprint(sorted(nums))                               # [1, 1, 2, 3, 4, 5, 9]   new list\nwords = [\"banana\", \"fig\", \"apple\"]\nwords.sort(key=len)                                # in place, returns None\nprint(words)                                       # ['fig', 'apple', 'banana']"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Sorting patterns — common patterns you'll see in production.\n# APPROACH  - Combine Sorting patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom operator import attrgetter, itemgetter\n# 1) MULTI-KEY via tuple — earlier components dominate; '-' for descending on numbers\nstudents = [(\"Alice\", 90), (\"Bob\", 85), (\"Carol\", 90)]\nstudents.sort(key=lambda s: (-s[1], s[0]))         # score desc, then name asc\nprint(students)                                    # [('Alice', 90), ('Carol', 90), ('Bob', 85)]\n# 2) attrgetter / itemgetter — faster than lambda; cleaner intent\npeople = [{\"age\": 30, \"name\": \"A\"}, {\"age\": 25, \"name\": \"B\"}]\npeople.sort(key=itemgetter(\"age\"))                 # like lambda x: x[\"age\"]\nclass Emp:\n    def __init__(self, salary, name): self.salary, self.name = salary, name\nemps = [Emp(80, \"A\"), Emp(50, \"B\")]\nemps.sort(key=attrgetter(\"salary\"))                # like lambda e: e.salary\n# 3) STABLE multi-pass — sort secondary first, then primary\ndata = [{\"dept\": \"eng\", \"name\": \"Bob\"},\n        {\"dept\": \"sales\", \"name\": \"Alice\"},\n        {\"dept\": \"eng\", \"name\": \"Alice\"}]\ndata.sort(key=itemgetter(\"name\"))                  # secondary first\ndata.sort(key=itemgetter(\"dept\"))                  # primary; name order preserved within dept\n# 4) reverse=True — descending without negating the key\nprint(sorted([3, 1, 4, 1, 5], reverse=True))       # [5, 4, 3, 1, 1]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Sorting patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport functools\nimport heapq\n# 1) cmp_to_key — when the order can't be expressed as a single key\n#    Classic example: largest concatenated number ([10, 2] -> \"210\", not \"102\")\ndef cmp(a: str, b: str) -> int:\n    return -1 if a + b > b + a else (1 if a + b < b + a else 0)\nnums = [\"10\", \"2\", \"3\", \"30\", \"34\"]\nprint(\"\".join(sorted(nums, key=functools.cmp_to_key(cmp))))   # '34330210' (largest)\n# 2) TOP-K — heapq.nlargest beats sorted()[:k] when k << n\n#    sorted()[:k]  is O(n log n)\n#    heapq.nlargest is O(n log k)\nbig = list(range(1_000_000))\ntop_5 = heapq.nlargest(5, big, key=lambda x: -x)              # five SMALLEST via key trick\n# 3) \"Schwartzian transform\" — precompute the key when it's expensive\n#    Without: key fn called O(n log n) times -> N expensive calls\n#    With:    key called once per item; sort works on cached pairs\ndef slow_key(item): return expensive(item)\nitems = [...]\ndecorated = [(slow_key(it), it) for it in items]               # one call per item\ndecorated.sort()                                                # sort the (key, item) pairs\nitems_sorted = [it for _, it in decorated]\n# Equivalent shortcut: sorted(items, key=slow_key) — Python actually CACHES keys this way\n# 4) sorted() vs list.sort() — pick by mutation\n#    sorted(lst)        returns NEW list, original unchanged\n#    lst.sort()          mutates IN PLACE, returns None\n#    NEVER assign the return: lst = lst.sort()  -> lst becomes None\n# 5) WHEN NOT TO SORT\n#    \"Top k items\"          -> heapq.nlargest / nsmallest (no full sort)\n#    \"Median\"                -> selection algorithm (statistics.median, or quickselect)\n#    \"Streaming data\"        -> running heaps; sort assumes whole data fits\n#    \"Sort by hash bucket\"   -> bucket / counting sort if range is small\n# 6) Custom-typed sort — implement __lt__ once instead of passing key= everywhere\nclass Version:\n    def __init__(self, major, minor): self.major, self.minor = major, minor\n    def __lt__(self, other):\n        return (self.major, self.minor) < (other.major, other.minor)\n# Decision rule:\n#   simple sorted output                       -> sorted(seq) or seq.sort()\n#   sort by one field                            -> key=itemgetter / attrgetter\n#   sort by multiple fields                      -> key returns a TUPLE\n#   key is expensive to compute                  -> Python already caches; just write key=\n#   ordering can't be expressed as a single key  -> cmp_to_key\n#   need ONLY top-k                              -> heapq.nlargest / nsmallest\n#   need a median / quantile                      -> statistics.median or quickselect\n#\n# Anti-pattern: lst = lst.sort()\n#   list.sort() returns None; lst becomes None and your next line crashes.\n#   Use lst.sort() (no assignment) or new = sorted(lst).\ndef expensive(x): return x"
                  }
        ],
        tips: [
                  "Python sort is stable — equal elements keep their original relative order",
                  "Multi-key sort with two passes works because of stability: sort secondary first, then primary",
                  "`operator.itemgetter` is faster than `lambda x: x[i]` for dict/tuple access",
                  "For top-k: `heapq.nlargest(k, data)` beats `sorted()[-k:]` when k is much smaller than n"
        ],
        mistake: "`lst = lst.sort()` assigns `None` to `lst`. `list.sort()` sorts in-place and returns `None`. Use `lst.sort()` without assignment, or `new = sorted(lst)`.",
        shorthand: {
          verbose: "import pandas as pd\nstudents = [(\"Alice\",90), (\"Bob\",85), (\"Carol\",90)]\nstudents.sort(key=lambda s: (-s[1], s[0]))\nfrom operator import attrgetter, itemgetter",
          concise: "lst.sort(key=len)                # in-place, returns None",
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
        category: "Patterns",
        subtitle: "Start at both ends and move inward — requires sorted input",
        signature: "lo, hi = 0, len(arr)-1; while lo < hi: ...",
        descLong: "Two pointers solve many array problems in O(n) instead of O(n²). One pointer starts at each end and they move toward each other based on the comparison. Requires sorted input for pair-sum problems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Two Pointers — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\ndef two_sum_sorted(nums: list[int], target: int) -> list[int]:\n    lo, hi = 0, len(nums) - 1\n    while lo < hi:\n        s = nums[lo] + nums[hi]\n        if s == target: return [lo, hi]\n        if s < target:  lo += 1                   # need bigger sum -> move LO up\n        else:           hi -= 1                   # need smaller   -> move HI down\n    return []\nprint(two_sum_sorted([1, 3, 4, 5, 7, 11], 9))     # [1, 4]  (3 + 7)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Two Pointers — common patterns you'll see in production.\n# APPROACH  - Combine Two Pointers with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# 1) SAME DIRECTION — slow/fast partitioning (in-place dedup of sorted array)\ndef dedup_sorted(nums: list[int]) -> int:\n    if not nums: return 0\n    slow = 0\n    for fast in range(1, len(nums)):\n        if nums[fast] != nums[slow]:\n            slow += 1\n            nums[slow] = nums[fast]\n    return slow + 1                               # length of unique prefix\na = [1, 1, 2, 3, 3, 4]\nn = dedup_sorted(a); print(a[:n])                  # [1, 2, 3, 4]\n# 2) OPPOSITE ENDS — palindrome / reverse / sum-target\ndef is_palindrome(s: str) -> bool:\n    lo, hi = 0, len(s) - 1\n    while lo < hi:\n        if s[lo] != s[hi]: return False\n        lo += 1; hi -= 1\n    return True\n# 3) FAST/SLOW on linked list — cycle detect (Floyd's)\nclass Node:\n    def __init__(self, val, nxt=None): self.val, self.next = val, nxt\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow, fast = slow.next, fast.next.next\n        if slow is fast: return True\n    return False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Two Pointers — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) 3-SUM — sort, fix one element, two-pointer the rest. O(n^2) total.\ndef three_sum(nums: list[int]) -> list[list[int]]:\n    nums.sort()\n    out, n = [], len(nums)\n    for i in range(n - 2):\n        if i and nums[i] == nums[i - 1]:           # skip duplicate fixed values\n            continue\n        if nums[i] > 0:                            # since sorted, no triplet sums to 0\n            break\n        lo, hi = i + 1, n - 1\n        while lo < hi:\n            s = nums[i] + nums[lo] + nums[hi]\n            if s == 0:\n                out.append([nums[i], nums[lo], nums[hi]])\n                lo += 1; hi -= 1\n                while lo < hi and nums[lo] == nums[lo - 1]: lo += 1   # dedup\n                while lo < hi and nums[hi] == nums[hi + 1]: hi -= 1\n            elif s < 0: lo += 1\n            else:       hi -= 1\n    return out\n# 2) DUTCH NATIONAL FLAG — partition into < pivot, == pivot, > pivot in O(n)\ndef sort_colors(nums: list[int]) -> None:          # values are 0, 1, or 2\n    lo, mid, hi = 0, 0, len(nums) - 1\n    while mid <= hi:\n        if nums[mid] == 0:\n            nums[lo], nums[mid] = nums[mid], nums[lo]\n            lo += 1; mid += 1\n        elif nums[mid] == 2:\n            nums[mid], nums[hi] = nums[hi], nums[mid]\n            hi -= 1                                # don't advance mid; new mid not yet checked\n        else:\n            mid += 1\n# 3) Container with most water — opposite-end with greedy shrink\ndef max_area(height: list[int]) -> int:\n    lo, hi, best = 0, len(height) - 1, 0\n    while lo < hi:\n        best = max(best, (hi - lo) * min(height[lo], height[hi]))\n        if height[lo] < height[hi]: lo += 1        # always move the SHORTER side\n        else:                       hi -= 1\n    return best\n# Decision rule:\n#   pair-sum on SORTED array               -> opposite ends, converge\n#   pair-sum on UNSORTED array             -> hash map (two-sum O(n))\n#   in-place dedup / partition              -> same-direction (slow/fast)\n#   palindrome / reverse                    -> opposite ends\n#   linked-list middle / cycle              -> fast/slow pointers\n#   3-sum / 4-sum                            -> sort + fix + two-pointer\n#   3-way partition (Dutch flag)             -> three pointers\n#\n# Anti-pattern: two-pointer on UNSORTED data for pair-sum\n#   The technique relies on monotonic movement — it doesn't work without sorted\n#   input. Either sort first (O(n log n)) or switch to a hash map (O(n))."
                  }
        ],
        tips: [
                  "Two pointers require sorted input (or at least structured/partitioned data)",
                  "Fast/slow pointers detect cycles and find midpoints in O(1) extra space",
                  "Sliding window is a variant where both pointers move in the same direction",
                  "For three-sum: sort first, then fix one element and use two pointers for the remaining pair"
        ],
        mistake: "Applying two-pointer directly to an unsorted array for pair-sum problems. Sort first (O(n log n)), then two-pointer (O(n)), giving O(n log n) total.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "sliding-window",
        fn: "Sliding Window",
        desc: "O(n) pattern for subarray and substring problems.",
        category: "Patterns",
        subtitle: "Expand right, shrink left — maintain a running state",
        signature: "left = 0; for right in range(len(arr)): ...",
        descLong: "Sliding window solves subarray/substring problems in O(n) by maintaining a window of elements. Expand the right pointer to include more; shrink the left pointer when the window violates a constraint. Maintain a running state rather than recomputing from scratch each step.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Sliding Window — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\ndef max_sum_k(nums: list[int], k: int) -> int:\n    window = sum(nums[:k])                        # initial window\n    best   = window\n    for i in range(k, len(nums)):\n        window += nums[i] - nums[i - k]            # add new, drop old: O(1) per step\n        best    = max(best, window)\n    return best\nprint(max_sum_k([2, 1, 5, 1, 3, 2], 3))           # 9 (5+1+3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Sliding Window — common patterns you'll see in production.\n# APPROACH  - Combine Sliding Window with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\ndef longest_no_repeat(s: str) -> int:\n    last: dict[str, int] = {}                     # char -> last index seen\n    left = best = 0\n    for right, ch in enumerate(s):\n        # If the char was seen INSIDE the current window, shrink from the left\n        if ch in last and last[ch] >= left:\n            left = last[ch] + 1                   # jump past the prior occurrence\n        last[ch] = right\n        best = max(best, right - left + 1)\n    return best\nprint(longest_no_repeat(\"abcabcbb\"))              # 3 (\"abc\")\nprint(longest_no_repeat(\"pwwkew\"))                # 3 (\"wke\")\n# At-most-K-distinct chars — same expand/shrink shape, different invariant\nfrom collections import Counter\ndef at_most_k(s: str, k: int) -> int:\n    cnt: Counter[str] = Counter()\n    left = best = 0\n    for right, ch in enumerate(s):\n        cnt[ch] += 1\n        while len(cnt) > k:                       # invariant: at most k distinct\n            cnt[s[left]] -= 1\n            if cnt[s[left]] == 0: del cnt[s[left]]\n            left += 1\n        best = max(best, right - left + 1)\n    return best"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Sliding Window — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom collections import Counter, deque\n# 1) MIN WINDOW SUBSTRING — smallest window containing all chars of t\ndef min_window(s: str, t: str) -> str:\n    need = Counter(t)\n    missing = len(t)\n    lo = best_lo = best_hi = 0\n    for hi, ch in enumerate(s, 1):\n        if need[ch] > 0: missing -= 1             # only count if still needed\n        need[ch] -= 1\n        if missing == 0:\n            # SHRINK left while still valid\n            while need[s[lo]] < 0:\n                need[s[lo]] += 1\n                lo += 1\n            if best_hi == 0 or hi - lo < best_hi - best_lo:\n                best_lo, best_hi = lo, hi\n            # Move left past one needed char to invalidate, continue search\n            need[s[lo]] += 1\n            missing += 1\n            lo += 1\n    return s[best_lo:best_hi]\n# 2) WINDOW MAXIMUM — monotonic deque (covered in deque entry; recap here)\ndef max_in_window(nums: list[int], k: int) -> list[int]:\n    q: deque[int] = deque()                       # indices, values DECREASING\n    out = []\n    for i, x in enumerate(nums):\n        while q and nums[q[-1]] < x: q.pop()\n        q.append(i)\n        if q[0] <= i - k: q.popleft()\n        if i >= k - 1: out.append(nums[q[0]])\n    return out\n# 3) \"EXACTLY K\" trick — count(exactly k) = count(at most k) - count(at most k-1)\n#    A common tactic when \"exactly K distinct\" is hard but \"at most K\" is easy.\ndef subarrays_with_k_distinct(nums: list[int], k: int) -> int:\n    def at_most(k):\n        cnt: Counter = Counter()\n        left = total = 0\n        for right, x in enumerate(nums):\n            cnt[x] += 1\n            while len(cnt) > k:\n                cnt[nums[left]] -= 1\n                if cnt[nums[left]] == 0: del cnt[nums[left]]\n                left += 1\n            total += right - left + 1\n        return total\n    return at_most(k) - at_most(k - 1)\n# Decision rule:\n#   sum / max / min over fixed window         -> O(1) per step incremental update\n#   \"longest / shortest valid window\"          -> variable window; expand right, shrink left\n#   window MAX/MIN in O(n)                      -> monotonic deque of indices\n#   \"exactly K distinct\"                          -> at_most(K) - at_most(K-1)\n#   needs to UNDO partial work on shrink         -> Counter/dict, decrement on left++\n#\n# Anti-pattern: recomputing the window from scratch each step\n#   That makes it O(n*k) and defeats the entire point. Maintain a running sum,\n#   counter, or deque so each shift is O(1) amortized."
                  }
        ],
        tips: [
                  "Fixed window: slide by adding the new right element and removing the outgoing left element",
                  "Variable window: expand until the constraint is violated, then shrink left until it is satisfied again",
                  "Track a running counter or sum — never recompute the window from scratch on each step",
                  "Common constraints: at most k distinct chars, sum equals target, all chars of t present"
        ],
        mistake: "Recomputing the window result from scratch each step — O(n·k) instead of O(n). Track a running total and update incrementally: `window += nums[right] - nums[right-k]`.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "recursion",
        fn: "Recursion",
        desc: "Solve problems by reducing to smaller instances of the same problem.",
        category: "Patterns",
        subtitle: "Base case + recursive case — watch stack depth and memoization",
        signature: "def fn(n): if base_case: return val; return fn(n-1)",
        descLong: "Recursion breaks a problem into a base case (trivially solved) and a recursive case (reduces toward the base). Python's default recursion limit is 1000 — use sys.setrecursionlimit() or convert to iteration for deep recursion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Recursion — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\ndef factorial(n: int) -> int:\n    if n <= 1:                                    # BASE CASE — exit condition\n        return 1\n    return n * factorial(n - 1)                   # RECURSIVE CASE — toward base\nprint(factorial(5))                                # 120"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Recursion — common patterns you'll see in production.\n# APPROACH  - Combine Recursion with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nclass TreeNode:\n    def __init__(self, val, left=None, right=None):\n        self.val, self.left, self.right = val, left, right\n# 1) Tree traversal — naturally recursive\ndef inorder(node) -> list:\n    if not node: return []\n    return inorder(node.left) + [node.val] + inorder(node.right)\ndef max_depth(node) -> int:\n    if not node: return 0\n    return 1 + max(max_depth(node.left), max_depth(node.right))\n# 2) Backtracking — build/explore choices, undo on backtrack\ndef subsets(nums: list[int]) -> list[list[int]]:\n    out, cur = [], []\n    def backtrack(i: int):\n        if i == len(nums):\n            out.append(cur.copy())                # SNAPSHOT — cur is mutated below\n            return\n        # exclude nums[i]\n        backtrack(i + 1)\n        # include nums[i]\n        cur.append(nums[i])\n        backtrack(i + 1)\n        cur.pop()                                  # undo on backtrack\n    backtrack(0)\n    return out\nprint(subsets([1, 2, 3]))                          # 8 subsets\n# 3) Convert to iteration with explicit stack — for big inputs\ndef inorder_iter(root):\n    stack, out = [], []\n    cur = root\n    while cur or stack:\n        while cur:                                # go left\n            stack.append(cur); cur = cur.left\n        cur = stack.pop()                         # process\n        out.append(cur.val)\n        cur = cur.right                           # go right\n    return out"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Recursion — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport sys\nfrom functools import lru_cache\n# 1) MEMOIZATION — turns exponential recursion into linear\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\n# fib(100) without lru_cache: ~10^20 calls. With it: 100 calls.\n# 2) RECURSION LIMIT — Python's default is ~1000. Raise it OR convert to iteration.\nsys.setrecursionlimit(10_000)                     # use SPARINGLY\n# Better: rewrite as iteration when you know the depth is data-dependent.\n# 3) Python has NO tail-call optimization — tail recursion blows the stack.\n#    Convert to a loop manually:\ndef factorial_tail(n, acc=1):                      # TAIL recursion (looks elegant)\n    return acc if n <= 1 else factorial_tail(n - 1, n * acc)\ndef factorial_iter(n):                             # but this is what you SHIP\n    acc = 1\n    for i in range(2, n + 1): acc *= i\n    return acc\n# 4) DIVIDE & CONQUER — recursion shines when problem halves\ndef merge_sort(a: list[int]) -> list[int]:\n    if len(a) <= 1: return a\n    mid = len(a) // 2\n    left  = merge_sort(a[:mid])\n    right = merge_sort(a[mid:])\n    out, i, j = [], 0, 0\n    while i < len(left) and j < len(right):\n        if left[i] <= right[j]: out.append(left[i]);  i += 1\n        else:                    out.append(right[j]); j += 1\n    out.extend(left[i:]); out.extend(right[j:])\n    return out\n# 5) MUTUAL recursion / co-recursion — two functions calling each other.\n#    Trampolining (loop + state machine) is how to make this iterative if depth is huge.\n# 6) When DP recursion uses a list/dict in the args -> NOT cacheable (unhashable)\n#    Convert lists to tuples at the boundary, or use bottom-up tabulation.\n# Decision rule:\n#   tree / DAG traversal                       -> recursion\n#   \"all subsets / permutations / combos\"      -> recursion + backtracking\n#   overlapping subproblems                      -> recursion + @lru_cache\n#   depth could exceed ~1000                    -> iterate, OR setrecursionlimit\n#   tail-recursive shape                          -> rewrite as a loop (no TCO in Python)\n#   divide-and-conquer                           -> recursion (merge sort, quickselect)\n#   data-shaped LIKE a recursion problem        -> consider iterative DP or BFS instead\n#\n# Anti-pattern: missing OR weaker base case\n#   Infinite recursion -> RecursionError. Always write the base case FIRST and\n#   verify that every recursive call moves strictly toward it."
                  }
        ],
        tips: [
                  "Always define the base case first — it is the exit condition that prevents infinite recursion",
                  "Python default recursion limit is 1000 — convert to iteration for depth > 1000",
                  "Tree problems are naturally recursive — the base case is usually `if not node: return`",
                  "Add `@lru_cache(None)` to any recursive function with overlapping subproblems"
        ],
        mistake: "Forgetting the base case or writing it wrong, causing infinite recursion and `RecursionError`. Write the base case first, test it separately, then write the recursive case.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "dynamic-programming",
        fn: "Dynamic Programming",
        desc: "Memoization and tabulation for overlapping subproblems.",
        category: "Patterns",
        subtitle: "Cache results — @lru_cache for top-down, dp[] for bottom-up",
        signature: "@lru_cache(None) def dp(n): ... | dp = [0] * n",
        descLong: "Dynamic programming caches results of overlapping subproblems. Top-down (memoization) uses recursion + cache. Bottom-up (tabulation) builds a table iteratively. Start with top-down to get correctness, then optimize with bottom-up if needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Dynamic Programming — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom functools import lru_cache\n@lru_cache(maxsize=None)\ndef fib(n: int) -> int:\n    if n < 2: return n                            # base case\n    return fib(n - 1) + fib(n - 2)                # without lru_cache: O(2^n)\nprint(fib(50))                                     # instant; without cache, hours"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Dynamic Programming — common patterns you'll see in production.\n# APPROACH  - Combine Dynamic Programming with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# 1) BOTTOM-UP tabulation — same logic, no recursion\ndef fib_tab(n: int) -> int:\n    if n < 2: return n\n    dp = [0] * (n + 1); dp[1] = 1\n    for i in range(2, n + 1):\n        dp[i] = dp[i - 1] + dp[i - 2]\n    return dp[n]\n# 2) SPACE-OPTIMIZED — keep only the rows you actually use\ndef fib_o1(n: int) -> int:\n    a, b = 0, 1\n    for _ in range(n):\n        a, b = b, a + b\n    return a\n# 3) Coin change — minimum coins for an amount (unbounded knapsack)\ndef coin_change(coins: list[int], amount: int) -> int:\n    INF = amount + 1                              # sentinel: \"more than possible\"\n    dp = [INF] * (amount + 1)\n    dp[0] = 0\n    for x in range(1, amount + 1):\n        for c in coins:\n            if c <= x:\n                dp[x] = min(dp[x], dp[x - c] + 1)\n    return -1 if dp[amount] == INF else dp[amount]\nprint(coin_change([1, 2, 5], 11))                  # 3 (5+5+1)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Dynamic Programming — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom functools import lru_cache\n# 1) DP STATE DESIGN — what changes between recursive calls?\n#    state = the args of your recursion. Cache key = the state.\n#    Examples:\n#       fib(n)                     -> state = n          -> 1D dp\n#       knapsack(i, capacity)      -> state = (i, cap)   -> 2D dp\n#       edit_distance(i, j)        -> state = (i, j)     -> 2D dp\n# 2) 2D DP — Longest Common Subsequence\ndef lcs(a: str, b: str) -> int:\n    n, m = len(a), len(b)\n    dp = [[0] * (m + 1) for _ in range(n + 1)]\n    for i in range(n):\n        for j in range(m):\n            if a[i] == b[j]:\n                dp[i + 1][j + 1] = dp[i][j] + 1\n            else:\n                dp[i + 1][j + 1] = max(dp[i + 1][j], dp[i][j + 1])\n    return dp[n][m]\n# 3) ROLLING ARRAY — only previous row needed -> O(m) space instead of O(n*m)\ndef lcs_optim(a: str, b: str) -> int:\n    prev = [0] * (len(b) + 1)\n    for i, ca in enumerate(a):\n        cur = [0] * (len(b) + 1)\n        for j, cb in enumerate(b):\n            cur[j + 1] = prev[j] + 1 if ca == cb else max(cur[j], prev[j + 1])\n        prev = cur\n    return prev[-1]\n# 4) Longest Increasing Subsequence — O(n log n) with patience sorting\nimport bisect\ndef lis(nums: list[int]) -> int:\n    tails: list[int] = []\n    for x in nums:\n        i = bisect.bisect_left(tails, x)\n        if i == len(tails): tails.append(x)\n        else:               tails[i] = x          # replace; tails stays sorted\n    return len(tails)\n# 5) TOP-DOWN vs BOTTOM-UP — pick by the shape of the state graph\n#    Top-down (@lru_cache): cleaner, easy to write, only computes REACHED states\n#    Bottom-up (table):     usually 2-5x faster, allows space optimization, no recursion limit\n#    Start top-down for correctness; convert to bottom-up if you need speed/memory.\n# 6) When you can convert to ITERATION with O(1) space\n#    If dp[i] depends only on dp[i-1] and dp[i-2] (or a fixed window), keep\n#    only those values, not the whole array.\n# Decision rule:\n#   \"looks recursive but exponential\"          -> @lru_cache(maxsize=None)\n#   need speed / no recursion                  -> bottom-up tabulation\n#   only previous row matters                  -> rolling array (O(m) not O(n*m))\n#   can derive a closed form                    -> use it; DP is overkill\n#   LIS / longest increasing                    -> bisect-based O(n log n)\n#   problem doesn't have overlapping subproblems -> NOT DP; greedy or D&C\n#\n# Anti-pattern: re-running the recursion in TESTS without cache_clear()\n#   The cache persists across tests. Either decorate locally inside the function\n#   under test, or call fn.cache_clear() in test setup."
                  }
        ],
        tips: [
                  "Start with `@lru_cache` top-down — get it correct first, optimize later if needed",
                  "Identify the DP state: what changes between recursive calls? That is your table dimension",
                  "Space optimize by keeping only the rows you need (often just current + previous)",
                  "DP = recursion + memoization. If you can write the recursion, adding `@lru_cache` gives you DP"
        ],
        mistake: "Plain recursion on overlapping subproblems — `fib(50)` without memoization makes 2^50 calls. Add `@lru_cache(None)` or convert to tabulation.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "big-o",
        fn: "Big-O Reference",
        desc: "Common time complexities and Python built-in operation costs.",
        category: "Complexity",
        subtitle: "O(1) → O(log n) → O(n) → O(n log n) → O(n²) → O(2ⁿ)",
        signature: "O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ)",
        descLong: "Big-O describes how runtime or memory grows with input size n. Focus on the dominant term and drop constants. Knowing Python built-in complexities lets you write efficient code without profiling first.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Big-O Reference — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\n# Big-O ladder:\n#   O(1)         constant      — d[k], s.add(x)\n#   O(log n)     logarithmic    — bisect, heappush, heappop\n#   O(n)         linear         — for x in arr, x in list, sum(arr)\n#   O(n log n)   linearithmic   — sorted(arr), arr.sort()\n#   O(n^2)       quadratic      — nested for-for over the same array\n#   O(2^n)       exponential    — all subsets, naive Fibonacci recursion\n#\n# Drop constants: O(2n + 5) = O(n).  Keep dominant term: O(n^2 + n) = O(n^2)."
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Big-O Reference — common patterns you'll see in production.\n# APPROACH  - Combine Big-O Reference with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\n# list (dynamic array)\n#   lst[i]               O(1)\n#   lst.append(x)        O(1) amortized   <- doubling under the hood\n#   lst.pop()            O(1)              <- pops from the END\n#   lst.pop(0)           O(n)              <- shifts every other element!\n#   lst.insert(i, x)     O(n)\n#   x in lst             O(n)              <- linear scan\n#   lst.sort()           O(n log n)        <- Timsort, stable\n#\n# dict / set (hash tables)\n#   d[k] / s.add(x)      O(1) average\n#   k in d / x in s      O(1) average\n#   iteration            O(n)\n#\n# collections.deque (doubly linked list)\n#   appendleft / popleft O(1)\n#   d[i]                 O(n)              <- middle access is slow!\n#\n# heapq (binary heap on list)\n#   heappush / heappop   O(log n)\n#   heapify(lst)         O(n)              <- not O(n log n)!\n#   nlargest / nsmallest O(n log k)        <- beats sorted()[:k] when k << n\n#\n# bisect (binary search on sorted list)\n#   bisect_left/right    O(log n) for the search; insort is O(n) total because of shift\nprint(\"memorize this list\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Big-O Reference — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\n# 1) MOST common upgrades\n#    O(n^2) repeated \"x in big_list\" -> precompute set: O(n) once, then O(1) per query\nbig = list(range(1_000_000))\nquick = set(big)                                  # one O(n) build...\ndef is_member(x): return x in quick               # ...turns each lookup O(1)\n#    O(n) \"list.pop(0) in a loop\"   -> deque.popleft() (O(1))\n#    O(n^2) \"build string with +=\"  -> \"\".join(parts)\n#    O(n log n) \"sorted(arr)[:k]\"   -> heapq.nlargest / nsmallest (O(n log k))\n# 2) AMORTIZATION\n#    list.append is \"amortized O(1)\" — most appends are O(1), occasional resize\n#    is O(n), but averaged out it's constant. Don't over-optimize for the resize.\n# 3) Average vs worst case\n#    dict / set are O(1) AVERAGE; worst-case is O(n) when many keys hash-collide.\n#    For adversarial input, use sorted structures or salt the hash (str hashes\n#    are randomized by default with PYTHONHASHSEED).\n# 4) SPACE complexity bites too\n#    Recursive O(2^n) algorithms also use O(n) STACK space (recursion depth).\n#    DP with a 2D table is O(n*m) memory; a rolling array can drop it to O(m).\n# 5) Profile before optimizing\nimport cProfile\ndef hot_path():\n    return sum(i*i for i in range(10_000))\n# cProfile.run(\"hot_path()\")   # surfaces actual hotspots, not assumed ones\n# 6) Common Python-specific traps\n#    - Repeated string concatenation in a loop: O(n^2) (strings are immutable)\n#    - \"for x in dict.keys()\" then \"if x in dict\": double lookup\n#    - sorted([...])[:1] when min(...) suffices: O(n log n) vs O(n)\n#    - Building a list with [:] copies, repeatedly: O(n) per copy\n# 7) Big-O hides constants — but constants matter\n#    O(n) numpy on a million floats beats O(n) Python loop by 50-100x.\n#    O(n log n) Timsort on near-sorted data approaches O(n) in practice.\n# Decision rule:\n#   x in lst inside a loop                -> set lookup\n#   list.pop(0) inside a loop              -> deque.popleft()\n#   string += in a loop                     -> \"\".join(...)\n#   sorted(...)[:k] for small k             -> heapq.nlargest\n#   recursion explodes                      -> @lru_cache\n#   nested for-for over same data            -> hash map / two-pointer / sort\n#   slicing huge lists in a loop             -> indices, NOT slices\n#\n# Anti-pattern: micro-optimizing past readability before profiling\n#   The 5% you guess at is rarely the 50% you'd find by measuring. Use cProfile\n#   or pytest-benchmark to find the real hot spot, then choose the right Big-O."
                  }
        ],
        tips: [
                  "dict/set lookups are O(1) — convert lists to sets when doing repeated membership tests",
                  "`list.pop(0)` is O(n) — use `deque.popleft()` for O(1) queue operations",
                  "Nested loops → look for a hash map to reduce O(n²) to O(n)",
                  "Sorted array → think binary search to reduce O(n) search to O(log n)"
        ],
        mistake: "`if x in large_list` inside a loop: O(n) per check → O(n²) total. Convert to set once: `lookup = set(large_list)`, then `if x in lookup` is O(1) per check.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
