export const meta = {
  "title": "NumPy",
  "domain": "python",
  "sheet": "numpy",
  "icon": "🔢"
}

export const sections = [

  // ── Section 1: Array Creation ─────────────────────────────────────────
  {
    id: "creation",
    title: "Array Creation",
    entries: [
      {
        id: "np-array",
        fn: "np.array()",
        desc: "Create a NumPy array from a Python list or nested list.",
        category: "Creation",
        subtitle: "The fundamental constructor — specify dtype= for clarity",
        signature: "np.array(data, dtype=None)",
        descLong: "np.array() converts Python lists, tuples, or nested lists into a NumPy ndarray. Arrays are fixed-type and store data in contiguous memory — this is why they are 10-100x faster than lists for numeric operations. Always specify dtype= for clarity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.array() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             ndarray. Inspect the basic attributes.\n#             plus shape plus dtype\" — in five lines.\n#             or the copy/view distinction that bites real code.\n#\nimport numpy as np\na = np.array([1, 2, 3, 4, 5])\na.shape       # (5,)\na.dtype       # dtype('int64')\na.size        # 5"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.array() — common patterns you'll see in production.\n# APPROACH  - Combine np.array() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             explicit dtype= for clarity and memory, the\n#             attribute cluster you inspect daily, and the\n#             copy-vs-view distinction with .astype always\n#             returning a copy.\n#             pinned dtype, a known shape, and an explicit\n#             decision about whether downstream changes should\n#             propagate.\n#             different lengths quietly produce object dtype)\n#             or pyarrow-backed ext dtypes — senior tier.\n#\nimport numpy as np\n# 2D from nested lists; pin dtype for memory and clarity\nA = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.int32)\nA.shape, A.ndim, A.dtype          # ((2, 3), 2, dtype('int32'))\n# Float vs bool variants\nnp.array([1, 2, 3], dtype=np.float64)\nnp.array([1, 0, 1], dtype=np.bool_)\n# Inspect the cluster\nA.itemsize, A.nbytes              # (4, 24)  — bytes per elem, total bytes\n# Type conversion always returns a NEW array\nB = A.astype(np.float32)\n# Copy vs view — view shares memory with original\nv = A.view()\nv[0, 0] = 99\nA[0, 0]                            # 99 — view propagates writes"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.array() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             early (object dtype is almost always a bug), pin\n#             dtype + memory layout (C vs Fortran order) on\n#             purpose for downstream speed, and use np.ascontiguousarray\n#             when crossing into C/Cython/torch.\n#             collapse (vectorized ops fall back to Python\n#             loops); explicit memory order matters when handing\n#             buffers to GPU/Cython code; ascontiguousarray is\n#             the canonical \"make this array C-friendly\" call.\n#             arrays still confuse code that assumes C-order;\n#             ascontiguousarray copies if the source isn't\n#             already contiguous — fine, but worth knowing.\n#\nimport numpy as np\n# 1. Detect ragged input — np.array silently produces object dtype\ndef safe_array(data, dtype=None):\n    arr = np.asarray(data, dtype=dtype)\n    if arr.dtype == object:\n        raise TypeError(\n            \"ragged or non-numeric input -> object dtype; \"\n            \"all rows must share length and a numeric type\"\n        )\n    return arr\n# safe_array([[1, 2], [3, 4, 5]])     # raises -> ragged\n# safe_array([[1, 2], [3, 4]])        # ok\n# 2. Memory order — C (row-major) vs F (column-major)\nA = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float64, order=\"C\")\nF = np.asfortranarray(A)\nA.flags[\"C_CONTIGUOUS\"], F.flags[\"F_CONTIGUOUS\"]   # (True, True)\n# 3. Hand a buffer to a C extension / GPU library\nbuf = np.ascontiguousarray(some_array, dtype=np.float32)   # forced C + dtype\n# 4. asarray vs array — avoid an unnecessary copy\nsrc = np.array([1, 2, 3])\nnp.asarray(src) is src                  # True  — no copy\nnp.array(src)   is src                  # False — always copies\n# Anti-pattern: relying on inferred dtype for numeric pipelines\n#   a = np.array([1, 2, 3])          # int64 on Linux/macOS, int32 on Windows\n# Always pin: np.array(..., dtype=np.int32)\n#\n# Decision rule:\n#   already an ndarray, want no copy             -> np.asarray(x)\n#   need a guaranteed independent copy           -> np.array(x) or x.copy()\n#   change dtype only                            -> x.astype(dtype) (always copies)\n#   handing buffer to C/Cython/torch/cuda        -> np.ascontiguousarray(x, dtype=...)\n#   column-major consumer (LAPACK/Fortran)       -> np.asfortranarray(x)\n#   ragged or mixed-type input                   -> reject early; refuse object dtype\n#   memory-tight numeric grid                    -> pin dtype=np.float32 / np.int32"
                  }
        ],
        tips: [
                  "Use `dtype=np.float32` instead of default `float64` when memory matters — halves storage",
                  "NumPy infers dtype from the data — mixed int/float input gives float64",
                  "`a.copy()` makes an independent array; `a.view()` shares memory with the original",
                  "`a.astype(np.float32)` always returns a copy — the dtype is changed"
        ],
        mistake: "Creating a 2D array with rows of different lengths: `np.array([[1,2],[3,4,5]])`. This creates a 1D array of Python lists, not a 2D ndarray. All rows must have the same length.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "np-zeros",
        fn: "np.zeros()",
        desc: "Create an array filled with zeros.",
        category: "Creation",
        subtitle: "Safe zero-initialized array — use np.empty() only when you will fill every element",
        signature: "np.zeros(shape, dtype=float)",
        descLong: "np.zeros() creates an array of a given shape filled with 0.0 (float64 by default). np.zeros_like() creates a zero array matching an existing array's shape and dtype. np.empty() is faster but contains uninitialized garbage — only use it when you will write to every element.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.zeros() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             That's the whole feature.\n#             reads the same in 1D and 2D.\n#             the np.full / np.eye family of related allocators.\n#\nimport numpy as np\nnp.zeros(5)            # [0. 0. 0. 0. 0.]   — 1D\nnp.zeros((3, 4))       # 3x4 matrix of zeros\nnp.zeros((2, 3, 4))    # 3D tensor"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.zeros() — common patterns you'll see in production.\n# APPROACH  - Combine np.zeros() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             with explicit dtype, the *_like helpers that match\n#             an existing array, and np.eye for identity matrices.\n#             match an upstream shape, build a constant matrix\n#             with the right dtype.\n#             memory looks like zeros until it doesn't) or the\n#             \"build by accumulation\" anti-pattern — senior tier.\n#\nimport numpy as np\n# Typed allocators — pin the dtype on purpose\nnp.zeros((3, 3), dtype=np.int32)\nnp.zeros((3, 3), dtype=bool)              # all False\n# *_like — match an existing array's shape AND dtype\nnp.zeros_like(a)\nnp.zeros_like(a, dtype=np.float32)        # override dtype only\n# np.full — any constant fill, clearer than ones * value\nnp.full((3, 3), 7)\nnp.full((2, 2), np.inf)\nnp.full_like(a, fill_value=99)\n# np.eye / np.identity — identity matrix\nnp.eye(4)                                 # 4x4 identity (float)\nnp.eye(4, dtype=int)\nnp.eye(4, k=1)                            # ones on superdiagonal"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.zeros() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             into them rather than appending; reach for np.empty\n#             ONLY when every element is overwritten before read;\n#             use np.zeros for boolean masks initialized to False;\n#             align dtype/order with downstream consumers.\n#             in a loop; np.empty is a real optimization when\n#             you'll fill every cell; explicit dtype/order\n#             prevents silent copies at boundaries.\n#             write; pre-sizing requires knowing the shape up\n#             front; F-order arrays surprise C-order consumers.\n#\nimport numpy as np\n# 1. Pre-size and fill — never accumulate with np.concatenate in a loop\ndef squared(xs):\n    out = np.empty(len(xs), dtype=np.float32)     # uninitialized -> safe IF\n    for i, x in enumerate(xs):                    # we write every cell\n        out[i] = x * x\n    return out\n# 2. Boolean mask — zeros (False) is the safe default\nkeep = np.zeros(len(arr), dtype=bool)\nkeep[some_indices] = True\nfiltered = arr[keep]\n# 3. Match an existing array's MEMORY LAYOUT, not just dtype\nA = np.asfortranarray(np.random.randn(1000, 100))\nB = np.zeros_like(A)                              # also F-contiguous\n# 4. When zeros isn't what you want\n#    np.zeros          - zero-initialized; safe default\n#    np.empty          - uninitialized; faster, only safe if you'll\n#                        write every cell before any read\n#    np.full(shape, v) - any constant; clearer than zeros + add v\n#    np.zeros_like(a)  - matches shape AND dtype AND order\n# Anti-pattern: building arrays by appending\n#   out = np.array([])\n#   for x in xs: out = np.append(out, fn(x))    # O(n^2) — copies every iteration\n# Right: pre-size with np.empty / np.zeros, then fill in-place.\n#\n# Decision rule:\n#   need zeros, will read before fill            -> np.zeros(shape, dtype=...)\n#   will overwrite every cell before any read    -> np.empty(shape, dtype=...)\n#   need a constant value other than 0           -> np.full(shape, value, dtype=...)\n#   match an existing array's shape+dtype+order  -> np.zeros_like(a) / np.empty_like(a)\n#   identity / diagonal matrix                   -> np.eye / np.identity\n#   boolean mask defaulting to False             -> np.zeros(shape, dtype=bool)\n#   accumulating results in a loop               -> pre-size + index-write, never np.append"
                  }
        ],
        tips: [
                  "Default dtype is `float64` — specify `dtype=int` or `dtype=bool` when needed",
                  "`np.zeros_like(a)` is the clearest way to create a zero array with the same shape as an existing one",
                  "`np.empty()` is faster than `np.zeros()` but contains garbage — only safe when every element will be written",
                  "`np.full((n, m), val)` is cleaner than `np.zeros(...) + val` or `np.ones(...) * val`",
                  "Pre-size the result array (`np.empty(n)`/`np.zeros(n)`) and fill in-place — `np.append` in a loop is O(n²) because it copies the whole array each iteration"
        ],
        mistake: "Using `np.empty()` expecting zeros. It returns uninitialized memory — values can be anything. Use `np.zeros()` if you need actual zeros.",
        shorthand: {
          verbose: "import numpy as np\nnp.zeros(5)                      # [0. 0. 0. 0. 0.]\nnp.zeros((3, 4))                 # 3×4 matrix of zeros\nnp.zeros((2, 3, 4))              # 3D — shape (2,3,4)",
          concise: "np.eye(4, k=1)                   # ones on first superdiagonal",
        },
      },
      {
        id: "np-ones",
        fn: "np.ones()",
        desc: "Create an array filled with ones.",
        category: "Creation",
        subtitle: "One-initialized array — useful for masks, weights, and initialization",
        signature: "np.ones(shape, dtype=float)",
        descLong: "np.ones() creates an array filled with 1.0. Commonly used for weight arrays, boolean masks (all True), and as a starting point for multiplicative operations. np.ones_like() creates a ones array matching an existing array.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.ones() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             as np.zeros.\n#             instantly familiar.\n#             weights, all-True masks, homogeneous coordinates).\n#\nimport numpy as np\nnp.ones(5)               # [1. 1. 1. 1. 1.]\nnp.ones((3, 3))          # 3x3 matrix of ones"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.ones() — common patterns you'll see in production.\n# APPROACH  - Combine np.ones() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             that sum to 1, all-True boolean masks you then\n#             clear selectively, and the homogeneous-coordinates\n#             trick (append a column of 1s for affine transforms).\n#             real numerical code; the use cases stick because\n#             they're patterns you'll meet weekly.\n#             np.full(...) — that's the senior decision rule.\n#\nimport numpy as np\n# Typed and shaped variants\nnp.ones((3, 3), dtype=np.int32)\nnp.ones((3, 3), dtype=bool)        # True everywhere\n# *_like — match an existing array\nnp.ones_like(a)\n# Uniform weights — n weights that sum to 1\nn = 10\nweights = np.ones(n) / n           # 1/n each, sums to 1.0\n# All-True mask, then carve out exclusions\nmask = np.ones(arr.shape, dtype=bool)\nmask[bad_indices] = False\nclean = arr[mask]\n# Homogeneous coordinates — add a column of 1s (affine transforms)\nX = np.random.randn(100, 3)\nX_h = np.hstack([X, np.ones((100, 1))])      # shape (100, 4)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.ones() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             np.full(shape, v) over np.ones * v (clearer\n#             intent, one allocation), use np.ones_like to\n#             carry shape AND dtype AND order, and watch out\n#             for \"ones-then-multiply\" patterns hiding broadcast\n#             bugs.\n#             communicates intent at the call site; *_like\n#             prevents the dtype-mismatch class of bugs at\n#             buffer boundaries.\n#             time (rare problem); ones-then-multiply still\n#             reads naturally to many people, so this is more\n#             of a code-review preference than a correctness rule.\n#\nimport numpy as np\n# 1. np.full beats ones * value — one allocation, explicit intent\nbad  = np.ones((1000, 1000)) * 5.0     # alloc, then full pass to multiply\ngood = np.full((1000, 1000), 5.0,      # one alloc, value baked in\n                dtype=np.float32)\n# 2. *_like inherits shape AND dtype AND order — usually what you want\nA = np.asfortranarray(np.random.randn(100, 50))\nB = np.ones_like(A)                    # F-order, float64, shape (100, 50)\n# 3. Avoid \"ones-then-broadcast\" silent bugs\n# Wrong:\n#   weights = np.ones(n_features) * scale\n#   X * weights[:, None]              # easy to forget the [:, None]\n# Right (clearer intent and dimensional safety):\nW = np.full((1, n_features), scale)    # explicit row vector\nresult = X * W                         # broadcasting is unambiguous\n# 4. When np.ones IS the right tool\n#    - uniform weights that sum to 1 -> ones(n) / n  (clearer than full(n, 1/n))\n#    - all-True boolean mask         -> ones(shape, bool)\n#    - constant column for affine    -> hstack with ones((m, 1))\n#\n# Decision rule:\n#   need ones (literal 1.0)                      -> np.ones(shape, dtype=...)\n#   need any other constant value                -> np.full(shape, value)\n#   uniform weights that sum to 1                -> np.ones(n) / n\n#   all-True boolean mask, then carve exclusions -> np.ones(shape, dtype=bool)\n#   match existing array's shape+dtype+order     -> np.ones_like(a)\n#   homogeneous coords / affine 1-column         -> np.hstack([X, np.ones((m, 1))])\n#   identity matrix                              -> np.eye, NOT np.ones (diff thing)\n#\n# Anti-pattern: np.ones(shape) * value to fake a constant array\n#   Two passes (allocate + multiply), obscures intent, can promote dtype\n#   silently (ones is float64; * int gives float64 again). Use\n#   np.full(shape, value, dtype=...) — one allocation, explicit value, no dtype drift."
                  }
        ],
        tips: [
                  "`np.ones((n, 1))` creates a column vector — useful for homogeneous coordinates and broadcasting",
                  "`np.ones(n, dtype=bool)` creates an all-True mask — then set specific elements to False",
                  "`np.ones_like(a)` copies shape and dtype — safer than hardcoding the shape",
                  "For non-1 fill values, use `np.full(shape, value)` — more explicit than `np.ones(...) * value`"
        ],
        mistake: "Using `np.ones((n,)) * val` to create an array of a constant value. `np.full((n,), val)` is clearer and communicates intent directly.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "np-arange",
        fn: "np.arange()",
        desc: "Generate values from start to stop with a fixed step.",
        category: "Creation",
        subtitle: "Like Python range() but returns an array — avoid float steps",
        signature: "np.arange(start, stop, step)",
        descLong: "np.arange() generates values from start up to (not including) stop with a given step — like Python range() but returns an ndarray. For float steps, use np.linspace() instead — floating-point rounding can give ±1 element with arange.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.arange() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             returns an ndarray. Stop is exclusive.\n#             range() so the call shape is instantly familiar.\n#             with a float step is unreliable) — junior tier.\n#\nimport numpy as np\nnp.arange(5)            # [0 1 2 3 4]\nnp.arange(2, 8)         # [2 3 4 5 6 7]\nnp.arange(0, 10, 2)     # [0 2 4 6 8]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.arange() — common patterns you'll see in production.\n# APPROACH  - Combine np.arange() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             negative step, dtype overrides, common-use\n#             idioms (index into arr by length, generate x for\n#             a plot). End with the cardinal rule: NEVER use\n#             arange with a float step — use linspace instead.\n#             code; the float-step warning is the single most\n#             important thing to know about arange.\n#             the \"lazy alternative\" — senior tier.\n#\nimport numpy as np\n# Countdown\nnp.arange(10, 0, -1)               # [10 9 8 ... 1]\n# Force dtype\nnp.arange(5, dtype=float)          # [0. 1. 2. 3. 4.]\n# Common pattern — indices for a known array\nindices = np.arange(len(arr))\n# Common pattern — x-values for a numeric plot\nx = np.arange(0, 100)\ny = x ** 2\n# CARDINAL RULE: do not use a float step\n# np.arange(0.0, 1.0, 0.1)        # may give 10 OR 11 elements\n# Use linspace when you need an exact count of float points:\nnp.linspace(0.0, 1.0, 11)          # exactly 11 elements"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.arange() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             linspace for any float spacing, watch large\n#             allocations (use a generator or iter_batches for\n#             huge ranges), and align dtype with downstream\n#             consumers.\n#             linspace is correct under all spacing requests;\n#             dtype hygiene at the call site prevents silent\n#             promotion later.\n#             approaches give up vectorization; dtype= is one\n#             more thing to remember on every allocation.\n#\nimport numpy as np\n# 1. Integer-only — pin the dtype, especially on Windows\nidx = np.arange(n_rows, dtype=np.int64)\n# 2. Float spacing -> linspace, not arange\nxs = np.linspace(0.0, 1.0, num=101)        # exactly 101 points\n# 3. Huge ranges — don't materialize 100M ints if you can iterate\ndef index_chunks(n, batch=1_000_000):\n    for start in range(0, n, batch):\n        yield np.arange(start, min(start + batch, n), dtype=np.int64)\n# 4. Quick guide\n#    integer step, integer values   -> np.arange\n#    float spacing                  -> np.linspace\n#    log spacing                    -> np.geomspace (linspace on log scale)\n#    just need to iterate           -> Python range() (no allocation)\n# Anti-pattern: float arange in production\n#   np.arange(0.0, 1.0, 0.1)        # off-by-one is implementation-defined\n# Use np.linspace(0, 1, 11) and trust the count.\n#\n# Decision rule:\n#   integer start/stop/step                      -> np.arange(start, stop, step)\n#   need exactly N float points                  -> np.linspace(start, stop, N)\n#   log-spaced points (e.g. learning rates)      -> np.geomspace(start, stop, N)\n#   only iterating, no array needed              -> Python range() (no allocation)\n#   indices into an existing array               -> np.arange(len(arr), dtype=np.int64)\n#   countdown                                    -> np.arange(stop, 0, -1)\n#   huge range, can't fit in memory              -> chunk via generator + np.arange per batch"
                  }
        ],
        tips: [
                  "For integer sequences `np.arange` is safe; for float steps use `np.linspace` — no rounding surprises",
                  "`np.arange(n)` is equivalent to `np.array(range(n))` but much faster",
                  "Stop is **exclusive** — same as Python `range()`: `np.arange(0, 5)` gives `[0,1,2,3,4]`",
                  "When you need a specific number of points between two values, use `np.linspace` instead"
        ],
        mistake: "`np.arange(0, 1, 0.1)` may return 10 or 11 points depending on floating-point rounding. Use `np.linspace(0, 1, 11)` when you need a guaranteed exact count.",
        shorthand: {
          verbose: "import numpy as np\nnp.arange(5)              # [0 1 2 3 4]\nnp.arange(2, 8)           # [2 3 4 5 6 7]\nnp.arange(0, 10, 2)       # [0 2 4 6 8]   — step of 2",
          concise: "y = x ** 2",
        },
      },
      {
        id: "np-linspace",
        fn: "np.linspace()",
        desc: "Generate exactly N evenly spaced values between start and stop.",
        category: "Creation",
        subtitle: "Count-based spacing — stop is inclusive, exact number guaranteed",
        signature: "np.linspace(start, stop, num=50, endpoint=True)",
        descLong: "np.linspace() generates exactly num values evenly spaced between start and stop (inclusive by default). Unlike arange(), the count is guaranteed regardless of floating-point rounding. Use it for plotting and numerical analysis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.linspace() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             two values, endpoint included.\n#             step, you always get the count you asked for.\n#             log-spaced alternatives — junior tier.\n#\nimport numpy as np\nnp.linspace(0, 1, 11)            # [0.0  0.1  0.2  ...  1.0]\nnp.linspace(0, 100, 101)         # exactly 101 points, 0..100"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.linspace() — common patterns you'll see in production.\n# APPROACH  - Combine np.linspace() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             periodic signals, retstep=True to recover the\n#             actual step, and the log-spaced cousins\n#             (geomspace, logspace) for log-axis plots and\n#             scaling sweeps.\n#             plot grids, FFT input grids, hyperparameter sweeps.\n#             \"linspace vs arange vs range\" decision rule —\n#             senior tier.\n#\nimport numpy as np\n# Periodic signal — exclude endpoint to avoid duplicating 0 == 2*pi\nx = np.linspace(0, 2 * np.pi, 100, endpoint=False)\ny = np.sin(x)\n# Get the step size too\nvalues, step = np.linspace(0, 1, 11, retstep=True)   # step == 0.1\n# Log-spaced sweeps for hyperparameter search / log axes\nnp.logspace(0, 3, 4)             # [1, 10, 100, 1000]   (base 10)\nnp.geomspace(1, 1000, 4)         # [1, 10, 100, 1000]   (linspace on log scale)\n# Common plot grid\nxs = np.linspace(-3, 3, 200)\nys = np.exp(-xs ** 2)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.linspace() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             default float64 is wasteful, prefer geomspace over\n#             logspace (more intuitive args), and pick\n#             linspace vs arange vs Python range deliberately.\n#             reads more naturally than logspace; the decision\n#             rule eliminates a class of \"off by one element\"\n#             bugs.\n#             the endpoints for very long arrays; geomspace\n#             requires both endpoints positive and same sign.\n#\nimport numpy as np\n# 1. Memory-tight grid — pin dtype\nx = np.linspace(0.0, 1.0, num=10_000_001, dtype=np.float32)\n# 2. Hyperparameter sweep — geomspace > logspace for intuitive args\nlrs = np.geomspace(1e-5, 1e-1, num=9)        # 9 learning rates, log-spaced\n# 3. Plot grid that excludes a singularity\neps = 1e-9\nxs = np.linspace(eps, np.pi - eps, 1000)     # avoid 0 and pi exactly\n# 4. Spacing quick guide\n#    need exactly N float points         -> np.linspace(start, stop, N)\n#    need integer-step sequence          -> np.arange(start, stop, step)\n#    need log-spaced points              -> np.geomspace(start, stop, N)\n#    just need to iterate (no array)     -> Python range() — no allocation\n# 5. retstep= when the step matters downstream\nxs, dx = np.linspace(0, T, num=N, retstep=True)\n# Numerical integration: integral ~= (ys.sum() - 0.5*(ys[0]+ys[-1])) * dx\n#\n# Decision rule:\n#   need exactly N points incl endpoints         -> np.linspace(a, b, N)\n#   periodic signal (avoid duplicate at 2*pi)    -> np.linspace(0, 2*pi, N, endpoint=False)\n#   numerical integration / step needed          -> np.linspace(..., retstep=True)\n#   log-spaced (intuitive args)                  -> np.geomspace(a, b, N)\n#   log-spaced via exponent (legacy)             -> np.logspace(start_exp, stop_exp, N)\n#   integer indices                              -> np.arange(N), NOT np.linspace(0, N-1, N)\n#   memory-tight grid (>1M points)               -> np.linspace(..., dtype=np.float32)\n#\n# Anti-pattern: np.linspace(0, n-1, n) to get integer indices\n#   Returns float64, costs 8N bytes, and you'll lose precision past 2**53.\n#   Use np.arange(n) — int dtype, half the memory, exact, and faster."
                  }
        ],
        tips: [
                  "Use `linspace` for plotting — you control exactly how many points you get",
                  "`endpoint=False` is equivalent to `np.arange` behavior — useful for periodic signals",
                  "`retstep=True` also returns the step size — handy to verify spacing",
                  "`np.geomspace(a, b, n)` is linspace on a log scale — better than `np.logspace` for intuitive use"
        ],
        mistake: "Using `np.linspace(0, n-1, n)` to get integer indices. Just use `np.arange(n)` — it is clearer and faster.",
        shorthand: {
          verbose: "import numpy as np\nnp.linspace(0, 1, 11)         # [0.0  0.1  0.2  ...  1.0] — 11 points\nnp.linspace(0, 1, 5)          # [0.    0.25  0.5  0.75  1. ] — 5 points\nnp.linspace(0, 100, 101)      # 0 to 100 inclusive",
          concise: "np.geomspace(1, 1000, 4)      # [1, 10, 100, 1000] — geometric",
        },
      },
      {
        id: "np-random",
        fn: "np.random.default_rng()",
        desc: "Generate random arrays with the modern NumPy random API.",
        category: "Creation",
        subtitle: "default_rng(seed) for reproducible results — replaces legacy np.random",
        signature: "rng = np.random.default_rng(seed=42)",
        descLong: "The modern NumPy random API uses default_rng() to create a Generator object. Always pass a seed for reproducibility. This replaces the legacy np.random.seed() / np.random.rand() API which used global state.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.random.default_rng() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             draw a few uniform samples and integers.\n#             reproducible thanks to the seed.\n#             choice/shuffle, or the legacy-API anti-pattern.\n#\nimport numpy as np\nrng = np.random.default_rng(seed=42)\nrng.random(5)                      # uniform [0, 1)\nrng.integers(0, 10, size=5)        # ints in [0, 10) exclusive"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.random.default_rng() — common patterns you'll see in production.\n# APPROACH  - Combine np.random.default_rng() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             binomial/poisson/exponential, choice with and\n#             without replacement, shuffle vs permutation.\n#             Always seed for reproducibility.\n#             generate a synthetic dataset, sample without\n#             replacement, shuffle for an epoch.\n#             SeedSequence.spawn, or the \"global state is bad\"\n#             rule for libraries — senior tier.\n#\nimport numpy as np\nrng = np.random.default_rng(seed=42)\n# Distributions\nrng.normal(loc=0, scale=1, size=(3, 3))           # mean=0, std=1\nrng.uniform(low=0, high=10, size=100)\nrng.binomial(n=10, p=0.5, size=100)\nrng.poisson(lam=3, size=100)\nrng.exponential(scale=1.0, size=100)\n# Choice — sampling with or without replacement\nrng.choice([\"a\", \"b\", \"c\"], size=10, replace=True)\nrng.choice(100, size=10, replace=False)            # 10 distinct ints in [0,100)\n# Shuffle vs permutation\narr = np.arange(10)\nrng.shuffle(arr)                                   # in-place\nshuffled = rng.permutation(arr)                    # returns a new array"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.random.default_rng() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             np.random.* (global state); use SeedSequence to\n#             spawn independent streams across workers; pin a\n#             seed at the boundary (config or CLI) and pass the\n#             rng down — don't call default_rng() in deep code.\n#             pattern for parallelism; passing rng down keeps\n#             functions deterministic given their inputs;\n#             SeedSequence is reproducible and lock-free.\n#             SeedSequence syntax is one more thing to learn;\n#             some libraries still expect a numpy global seed.\n#\nimport numpy as np\nfrom numpy.random import default_rng, SeedSequence\n# 1. Seed at the boundary (config / CLI), inject rng into helpers\ndef make_dataset(rng: np.random.Generator, n: int):\n    return rng.normal(size=(n, 4))\nROOT_SEED = 42\nrng = default_rng(ROOT_SEED)\ndata = make_dataset(rng, 1000)\n# 2. Independent streams for parallel workers\nss = SeedSequence(ROOT_SEED)\nworker_seeds = ss.spawn(8)                  # 8 independent child sequences\nworker_rngs  = [default_rng(s) for s in worker_seeds]\n# Each worker uses its own rng — no global state, no cross-talk.\n# 3. Reproducible ML split\ndef stratified_indices(y: np.ndarray, frac: float, rng):\n    out = []\n    for cls in np.unique(y):\n        idx = np.flatnonzero(y == cls)\n        rng.shuffle(idx)\n        cut = int(len(idx) * frac)\n        out.append(idx[:cut])\n    return np.concatenate(out)\n# 4. Common pitfalls\n#    np.random.seed(42)        - global state; threading-unsafe; AVOID\n#    np.random.rand(5)         - legacy API; use rng.random(5)\n#    Calling default_rng() inside a hot loop -> different seed each call\n#\n# Decision rule:\n#   single-threaded reproducible script          -> rng = default_rng(seed)\n#   library code (no global state allowed)       -> accept rng parameter, never create one\n#   parallel workers / multiprocessing           -> SeedSequence(seed).spawn(N) per worker\n#   uniform [0,1) samples                        -> rng.random(size)\n#   integers in a half-open range                -> rng.integers(low, high, size)\n#   sample without replacement                   -> rng.choice(pop, size, replace=False)\n#   full-corpus shuffle in place                 -> rng.shuffle(arr)\n#   need a fresh shuffled copy                   -> rng.permutation(arr)\n#\n# Anti-pattern: np.random.seed(42) + np.random.rand(...) (legacy global API)\n#   Global RNG state is shared across threads, libraries, and notebooks — one\n#   stray call elsewhere reorders your sequence and breaks reproducibility.\n#   Use rng = np.random.default_rng(42) and pass rng explicitly through code."
                  }
        ],
        tips: [
                  "Always use `default_rng(seed)` — not the legacy `np.random.seed()` which is global state",
                  "The same seed gives the same sequence — essential for reproducible experiments",
                  "`rng.integers(lo, hi)` is exclusive at `hi` — like Python `range(lo, hi)`",
                  "For ML: set both `np.random.default_rng(42)` and `random.seed(42)` for full reproducibility"
        ],
        mistake: "Using the legacy API: `np.random.rand()` or `np.random.seed(42)`. The seed is global state — it interferes across threads and modules. Use `rng = np.random.default_rng(42)` instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 2: Indexing & Slicing ─────────────────────────────────────────
  {
    id: "indexing",
    title: "Indexing & Slicing",
    entries: [
      {
        id: "array-slicing",
        fn: "Array slicing",
        desc: "Select subarrays by position using start:stop:step syntax.",
        category: "Indexing",
        subtitle: "Slices return views — modifying them modifies the original",
        signature: "a[start:stop:step, ...]",
        descLong: "NumPy slices return views — they share memory with the original array. Modifying a slice modifies the original. Use .copy() when you need an independent copy. Slicing is O(1) because no data is copied.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Array slicing — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             slice ranges with start:stop. Reads like Python\n#             list slicing.\n#             from list slicing.\n#             critical view-vs-copy distinction.\n#\nimport numpy as np\na = np.array([10, 20, 30, 40, 50])\na[0]        # 10\na[-1]       # 50\na[1:4]      # array([20, 30, 40])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Array slicing — common patterns you'll see in production.\n# APPROACH  - Combine Array slicing with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             notation, strided slices for \"every other row\",\n#             reversal with [::-1], and the critical rule that\n#             slices are VIEWS — modifying them modifies the\n#             source array.\n#             know about NumPy slicing; shows the canonical\n#             [::, ::] strided form.\n#             or the contiguity considerations — senior tier.\n#\nimport numpy as np\n# Sales: 4 stores x 6 quarters\nsales = np.array([\n    [120, 145, 180, 210, 195, 230],\n    [98,  110, 130, 150, 165, 180],\n    [210, 220, 240, 260, 280, 310],\n    [150, 160, 175, 190, 200, 215],\n])\n# 2D indexing: [row, col]\nsales[0, 0]              # 120     — Store A, Q1\nsales[-1, -1]            # 215     — last store, last quarter\nsales[1:3, 2:5]          # 2x3 sub-block, stores B-C, Q3-Q5\nsales[::2, ::2]          # every other store AND quarter\nsales[:, ::-1]           # all quarters reversed\n# CRITICAL: slices are VIEWS — modifying propagates to source\nq1 = sales[:, 0]\nq1[0] = 999\nsales[0, 0]              # 999 — view propagated the write\nq1.base is sales         # True — q1 shares memory with sales\n# Use .copy() when you need independence\nq1_copy = sales[:, 0].copy()\nq1_copy[0] = 0\nsales[0, 0]              # still 999 — copy is independent"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Array slicing — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             reuse, check contiguity (.flags) before handing\n#             arrays to C extensions, and make the view-vs-copy\n#             choice deliberate at function boundaries.\n#             reusable; .flags exposes hidden non-contiguity\n#             that breaks zero-copy interop with C/Cython/torch;\n#             explicit copy at boundaries documents intent.\n#             flags adds boilerplate; over-aggressive .copy()\n#             defeats the point of zero-copy slicing.\n#\nimport numpy as np\n# 1. Reusable slice patterns\nroi = np.s_[10:50, 20:80]              # named slice — apply to many arrays\nimg_roi  = image[roi]\nmask_roi = mask[roi]\n# 2. Check contiguity — slices can be non-contiguous\nA = np.arange(60).reshape(6, 10)\nstrided = A[:, ::2]                    # every other column\nstrided.flags[\"C_CONTIGUOUS\"]          # False\nnp.ascontiguousarray(strided)          # forces a contiguous copy\n# 3. View at the boundary — make the choice explicit\ndef normalize_in_place(buf: np.ndarray) -> None:\n    \"\"\"Mutates the underlying array — caller must understand.\"\"\"\n    buf -= buf.mean()\n    buf /= buf.std()\ndef normalize(arr: np.ndarray) -> np.ndarray:\n    \"\"\"Returns a NEW array — safe across function boundaries.\"\"\"\n    out = arr.astype(np.float32, copy=True)\n    normalize_in_place(out)\n    return out\n# 4. Tell view from copy explicitly\nsub = A[1:3]\nsub.base is A                          # True  -> view\nA[1:3].copy().base is None             # True  -> independent\n# Anti-pattern: passing a non-contiguous slice to a C extension\n#   torch.from_numpy(A[:, ::2])        # non-contiguous; may copy or fail\n# Right: torch.from_numpy(np.ascontiguousarray(A[:, ::2]))\n#\n# Decision rule:\n#   contiguous range, share memory               -> a[start:stop] (view, free)\n#   need independent buffer for caller           -> a[start:stop].copy()\n#   non-contiguous selection (specific indices)  -> fancy indexing a[[i, j, k]]\n#   filter by condition                          -> boolean mask a[mask]\n#   reusable slice pattern across many arrays    -> roi = np.s_[10:50, :]\n#   reverse axis                                 -> a[::-1]   or a[:, ::-1]\n#   handing buffer to C/Cython/torch             -> np.ascontiguousarray(slice)"
                  }
        ],
        tips: [
                  "Slices are views — free O(1) operation, but modifications propagate to the original",
                  "Use `.copy()` when you need to modify a slice without affecting the source array",
                  "`a.base is None` checks if an array owns its data (True = owns, None = owns, not None = view)",
                  "`a[::-1]` reverses a 1D array; `a[:, ::-1]` reverses columns of a 2D array",
                  "Strided slices like `A[:, ::2]` are not C-contiguous — wrap with `np.ascontiguousarray()` before handing to torch/ctypes/cython, otherwise the binding may copy or fail"
        ],
        mistake: "Assuming `b = a[1:3]` creates an independent copy. It is a view — `b[0] = 99` also changes `a[1]`. Use `b = a[1:3].copy()` for independence.",
        shorthand: {
          verbose: "import numpy as np\nsales = np.array([\n[120, 145, 180, 210, 195, 230],  # Store A\n[98, 110, 130, 150, 165, 180],   # Store B",
          concise: "q1_copy.base is None  # True — owns data",
        },
      },
      {
        id: "boolean-masking",
        fn: "Boolean masking",
        desc: "Select elements where a condition is True.",
        category: "Indexing",
        subtitle: "Returns a copy — combine conditions with & | ~",
        signature: "a[a > 0] | a[(a > 0) & (a < 10)]",
        descLong: "Boolean indexing creates a boolean array and uses it to select elements. Always returns a copy (not a view). Combine multiple conditions with & (and), | (or), ~ (not) — never Python `and`/`or`/`not`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Boolean masking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Reads exactly like a SQL WHERE.\n#             no list comp.\n#             conditions or the in-place assignment trick.\n#\nimport numpy as np\nscores = np.array([85, 42, 92, 38, 88])\nscores[scores >= 80]     # array([85, 92, 88])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Boolean masking — common patterns you'll see in production.\n# APPROACH  - Combine Boolean masking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             conditions with &/|/~ (NEVER Python and/or/not),\n#             in-place clipping via mask assignment, and\n#             extracting flat values from a 2D array.\n#             \"scores[mask] = value\" is the canonical clip\n#             idiom; 2D mask flattening is what value-extraction\n#             actually does.\n#             integer-codes-via-cumsum tricks — senior tier.\n#\nimport numpy as np\nscores = np.array([85, 42, 92, 38, 88, 76, 29, 94, 67, 81])\n# Single and combined conditions\nscores[scores >= 80]                    # high\nscores[(scores >= 80) & (scores <= 90)] # band\nscores[(scores < 40) | (scores > 95)]   # outliers\nscores[~(scores >= 80)]                 # complement\n# In-place clipping via mask assignment\nclean = scores.copy()\nclean[clean < 50] = 50                  # floor at 50\n# 2D: extract values where condition is true (returns flat 1D)\nregions = np.array([[82, 91, 78],\n                    [45, 38, 52],\n                    [88, 85, 79]])\nhigh = regions[regions > 80]            # [82, 91, 88, 85]\n# Boolean mask itself is a useful return — same shape as input\ntarget_met = regions > 80                # 2D bool array"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Boolean masking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             and/or/not (raises ValueError on arrays); reach\n#             for np.where for ternaries, np.select for\n#             multi-branch, and np.clip for the simplest\n#             clamp; reuse a mask across columns for\n#             dimensional safety.\n#             cover ~95% of \"if/else over arrays\" cases;\n#             reusing one mask across columns prevents the\n#             \"different rows masked per column\" bug.\n#             read; np.clip only handles min/max bounds; mask\n#             arithmetic doesn't help when the branches need\n#             completely different code paths.\n#\nimport numpy as np\nscores = np.array([85, 42, 92, 38, 88, 76, 29, 94, 67, 81])\n# 1. Anti-pattern that ALWAYS fails on arrays\n# scores[scores > 0 and scores < 10]    # ValueError — Python and on arrays\n# Right:\nscores[(scores > 0) & (scores < 10)]\n# 2. Vectorized ternary — np.where(cond, x, y)\nadjusted = np.where(scores >= 80, scores * 1.10, scores * 0.90)\n# 3. Multi-branch — np.select beats nested np.where for clarity\nratings = np.select(\n    [scores < 40, scores < 70, scores >= 90],\n    [\"poor\",     \"average\",   \"excellent\"],\n    default=\"good\",\n)\n# 4. Simplest min/max clamp — np.clip beats mask assignment\nclipped = np.clip(scores, 50, 100)        # floor at 50, ceil at 100\n# 5. Reuse one mask across columns for dimensional safety\ndata = np.random.randn(100, 4)\nkeep = (data[:, 0] > 0) & (data[:, 1] < 1)\ndata_keep = data[keep]                    # same rows kept across all 4 cols\n# Decision rule:\n#   single filter                                -> a[mask]\n#   binary if/else                               -> np.where(mask, x, y)\n#   3+ branches                                  -> np.select([masks], [values], default=...)\n#   floor / ceiling clamp                        -> np.clip(a, lo, hi)\n#   combining conditions                         -> use & | ~ with parens, NEVER and/or/not\n#   need rows from a 2D array                    -> 1D row-mask: a[a[:, k] > t]\n#   need to set values in place                  -> a[mask] = value (no allocation)\n#\n# Anti-pattern: using Python and/or/not (or missing parens) on array conditions\n#   scores[scores > 0 and scores < 10]   # ValueError: ambiguous truth value\n#   scores[scores > 0 & scores < 10]     # wrong precedence; evaluates 0 & scores\n#   The bitwise ops &/|/~ have LOWER precedence than comparison, so each\n#   comparison must be parenthesized: scores[(scores > 0) & (scores < 10)]."
                  }
        ],
        tips: [
                  "Boolean indexing always returns a **copy** — unlike slicing which returns a view",
                  "Use `&`, `|`, `~` for conditions — never Python `and`, `or`, `not` on arrays",
                  "`np.where(cond, x, y)` is the vectorized ternary — much faster than any loop",
                  "`a[mask] = value` sets values in-place without creating intermediate arrays"
        ],
        mistake: "`a[a > 0 and a < 10]` raises ValueError. Python `and` calls `bool()` on arrays. Use `a[(a > 0) & (a < 10)]` with parentheses around each condition.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "fancy-indexing",
        fn: "Fancy indexing",
        desc: "Select elements using integer arrays or lists of indices.",
        category: "Indexing",
        subtitle: "Always returns a copy — enables non-contiguous selection",
        signature: "a[[0, 2, 4]] | a[[rows], [cols]]",
        descLong: "Fancy indexing selects elements by passing an array of indices. It always returns a copy (never a view). Useful for selecting non-contiguous rows/columns or reordering elements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Fancy indexing — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             indices. Order and duplicates are honored.\n#             pattern; reads as \"give me indices 4, 1, 2 in\n#             that order\".\n#             together) or the COPY rule that distinguishes it\n#             from slicing.\n#\nimport numpy as np\na = np.array([10, 20, 30, 40, 50])\na[[4, 1, 2]]            # array([50, 20, 30])\na[[0, 0, 1, 1]]         # array([10, 10, 20, 20]) — repeats allowed"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Fancy indexing — common patterns you'll see in production.\n# APPROACH  - Combine Fancy indexing with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             selection, parallel index arrays for picking\n#             specific cells, and the rule that fancy indexing\n#             ALWAYS returns a copy (vs slices, which return\n#             views).\n#             rows, reorder rows, extract diagonal-style cells\n#             via parallel indices.\n#             indexing or the in-place assignment idiom —\n#             senior tier.\n#\nimport numpy as np\nsales = np.array([\n    [1200, 1450, 1800],     # Widget\n    [ 980, 1100, 1300],     # Gadget\n    [2100, 2200, 2400],     # Doohickey\n    [1500, 1600, 1750],     # Gizmo\n])\n# Row selection\nsales[[0, 2]]                                # Widget + Doohickey\nsales[[3, 0, 2, 1]]                          # reordered rows\n# Column selection\nsales[:, [0, 2]]                             # cols 0 and 2\n# Specific (row, col) cells via parallel index arrays\nrows = np.array([0, 1, 2, 3])\ncols = np.array([0, 1, 2, 0])\nsales[rows, cols]                            # one cell per (row, col) pair\n# Fancy indexing returns a COPY — modifying it doesn't touch source\nsubset = sales[[1, 3]]\nsubset[0, 0] = 0\nsales[1, 0]                                  # still 980 — subset is independent"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Fancy indexing — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             cross-products of rows and columns (clearer than\n#             nested indexing), in-place assignment via fancy\n#             indices, and np.argsort + fancy indexing as the\n#             standard \"co-sort multiple arrays\" pattern.\n#             AND these columns\"; in-place fancy assignment is\n#             how you scatter values into specific positions;\n#             argsort-then-index is the canonical co-sort.\n#             fancy assignment with repeated indices can have\n#             surprising last-write-wins semantics; co-sort\n#             requires the same length on every related array.\n#\nimport numpy as np\nA = np.arange(20).reshape(4, 5)\n# 1. np.ix_ — cartesian \"rows AND cols\" cross-product\nrows = [0, 2, 3]\ncols = [1, 4]\nA[np.ix_(rows, cols)]                  # shape (3, 2) — every combo\n# 2. In-place assignment scatters values into specific positions\nout = np.zeros((5, 5))\nrows = np.array([0, 1, 2, 3])\ncols = np.array([0, 1, 2, 3])\nout[rows, cols] = [10, 20, 30, 40]     # writes to (0,0), (1,1), (2,2), (3,3)\n# 3. Co-sort multiple arrays — argsort + fancy indexing\namounts = np.array([300, 100, 200, 50])\nlabels  = np.array([\"a\", \"b\", \"c\", \"d\"])\norder   = np.argsort(amounts)                # ascending\namounts_sorted = amounts[order]              # [50, 100, 200, 300]\nlabels_sorted  = labels[order]               # ['d', 'b', 'c', 'a']\n# 4. take and put — clearer alternatives in some contexts\nnp.take(A, [0, 2, 3], axis=0)                # like A[[0,2,3], :]\nbuf = np.zeros(10)\nnp.put(buf, [1, 3, 5], [100, 200, 300])      # scatter values\n# Anti-pattern: nested fancy indexing without np.ix_\n#   A[[0, 2, 3]][:, [1, 4]]               # creates an intermediate copy\n# Right:\n#   A[np.ix_([0, 2, 3], [1, 4])]          # one selection, no intermediate\n#\n# Decision rule:\n#   pick rows in given order                     -> A[row_indices]\n#   pick cols in given order                     -> A[:, col_indices]\n#   parallel pick of (row, col) cells            -> A[rows, cols] (zipped)\n#   cartesian rows x cols                        -> A[np.ix_(rows, cols)]\n#   reorder by another array's sort key          -> A[np.argsort(key)]\n#   scatter values into specific positions       -> A[rows, cols] = values\n#   alternative API in some codebases            -> np.take / np.put"
                  }
        ],
        tips: [
                  "Fancy indexing always returns a **copy** — unlike slicing which returns a view",
                  "You can repeat indices: `a[[0, 0, 1]]` returns `[a[0], a[0], a[1]]`",
                  "`a[np.argsort(a)]` sorts by value using fancy indexing — useful for sorting multiple arrays together",
                  "Fancy indexing is slower than slicing — slicing is O(1), fancy indexing is O(k) where k is indices"
        ],
        mistake: "Trying to set values with fancy indexing through a temporary: `b = a[[0,2]]; b[0] = 99`. Since it is a copy, `a` is unchanged. Use `a[[0,2]] = 99` directly.",
        shorthand: {
          verbose: "import numpy as np\nrevenue = np.array([1200, 3400, 2100, 950, 5600, 1800])\ntop_customers = revenue[[4, 1, 2]]  # [5600, 3400, 2100]\nduplicates = revenue[[0, 0, 1, 1]]  # [1200, 1200, 3400, 3400]",
          concise: "print(revenue[1])  # still 3400 — subset is independent",
        },
      },
      {
        id: "np-unique",
        fn: "np.unique()",
        desc: "Find unique elements and optionally their counts or inverse indices.",
        category: "Indexing",
        subtitle: "Deduplicate and count — return_counts=True for frequency",
        signature: "np.unique(a, return_counts=False, return_inverse=False)",
        descLong: "np.unique() returns the sorted unique elements of an array. With return_counts=True it also returns how many times each unique value appears. With return_inverse=True it returns the indices that reconstruct the original array from the unique values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.unique() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             That's the whole feature.\n#             back\" — and it's vectorized.\n#             or the 2D axis= variant.\n#\nimport numpy as np\nids = np.array([101, 105, 101, 103, 105, 101])\nnp.unique(ids)              # array([101, 103, 105])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.unique() — common patterns you'll see in production.\n# APPROACH  - Combine np.unique() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             frequency, return_inverse for \"rebuild original\n#             from unique values\" (factorization), and axis=0\n#             for unique rows of a 2D array.\n#             frequency tables, integer-encoding categorical\n#             data, deduplicating rows.\n#             non-sorted output or the SORTING cost of np.unique\n#             on huge arrays — senior tier.\n#\nimport numpy as np\nids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])\n# Frequency table — sorted unique values plus their counts\nunique, counts = np.unique(ids, return_counts=True)\n# unique: [101 102 103 105]\n# counts: [3 1 2 3]\n# Factorize — encode each value as an integer code\nunique, codes = np.unique(ids, return_inverse=True)\n# codes is the same length as ids; ids == unique[codes]\n# First-occurrence index for each unique value\nunique, first_idx = np.unique(ids, return_index=True)\n# Unique rows of a 2D array\norders = np.array([\n    [101, 100],\n    [105,  50],\n    [101, 100],            # duplicate row\n    [105,  75],\n])\nnp.unique(orders, axis=0)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.unique() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (sorted, slower) and pd.unique (insertion-order,\n#             faster) based on what you actually need; reach\n#             for return_inverse to encode large categorical\n#             columns; bin big counts via np.bincount when the\n#             values are small non-negative ints.\n#             returns insertion order which is sometimes the\n#             right answer; np.bincount is the fastest path\n#             for \"count occurrences of small ints\".\n#             might be pure NumPy; np.bincount only works for\n#             non-negative int values; return_inverse on huge\n#             arrays still has to sort to find unique values.\n#\nimport numpy as np\nids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])\n# 1. Categorical encoding via return_inverse\nunique, codes = np.unique(ids, return_inverse=True)\n# codes is now an int array suitable as model input or DB key\n# 2. Fast counting for small non-negative ints\nsmall = np.array([0, 1, 1, 2, 2, 2, 3])\nnp.bincount(small)              # array([1, 2, 3, 1])  — index = value, val = count\n# Much faster than np.unique(..., return_counts=True) for this case\n# 3. Need insertion order, not sorted? -> pandas\n# import pandas as pd\n# pd.unique(ids)                # preserves first-seen order\n# 4. Unique rows of a structured frame\nA = np.array([[1, \"a\"], [2, \"b\"], [1, \"a\"]])\n# np.unique struggles with mixed dtypes; structured arrays or\n# pandas DataFrame.drop_duplicates() are the right tools.\n# Decision rule:\n#   sorted unique values, generic dtype          -> np.unique(a)\n#   insertion-order, mixed dtype                 -> pd.unique(a)\n#   counts of small non-negative ints            -> np.bincount(a) (fastest)\n#   unique rows of 2D numeric array              -> np.unique(A, axis=0)\n#   unique rows of mixed-dtype frame             -> df.drop_duplicates()\n#   need integer-encoding of a categorical col   -> np.unique(a, return_inverse=True)\n#   need first-occurrence positions              -> np.unique(a, return_index=True)\n#\n# Anti-pattern: list(set(arr.tolist())) to deduplicate a NumPy array\n#   Round-trips through Python objects (slow + extra memory), loses sort\n#   order, and breaks dtype (everything becomes Python int/float). Use\n#   np.unique(arr) — vectorized, dtype-preserving, sorted."
                  }
        ],
        tips: [
                  "`np.unique()` always returns sorted values — if you need unsorted unique values use `dict.fromkeys()` or `pd.unique()`",
                  "`return_counts=True` is the numpy equivalent of `value_counts()` in pandas",
                  "`return_inverse=True` lets you reconstruct the original array: `vals[inverse]`",
                  "For 2D unique rows: `np.unique(A, axis=0)` — each row treated as one element",
                  "For counts of small non-negative integers, `np.bincount(a)` is dramatically faster than `np.unique(a, return_counts=True)`"
        ],
        mistake: "Using `set(a.tolist())` to get unique values from a NumPy array. It converts to Python, loses dtype, and is slower. Use `np.unique(a)` directly.",
        shorthand: {
          verbose: "import numpy as np\nproduct_ids = np.array([101, 105, 101, 103, 105, 101, 102, 103, 105])\nunique = np.unique(product_ids)  # [101 102 103 105]\nunique, counts = np.unique(product_ids, return_counts=True)",
          concise: "np.unique(orders, axis=0)  # Unique rows",
        },
      },
      {
        id: "np-where",
        fn: "np.where()",
        desc: "Vectorized conditional — choose between two values element-wise.",
        category: "Indexing",
        subtitle: "Replace if/else loops over arrays",
        signature: "np.where(condition, x, y) | np.where(condition)",
        descLong: "np.where(cond, x, y) returns x where cond is True, y elsewhere — the vectorized ternary. With one argument, np.where(cond) returns the indices where cond is True (same as np.nonzero).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.where() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             x where cond is True, y elsewhere.\n#             with a single C-speed call.\n#             returns indices) or how to handle 3+ branches.\n#\nimport numpy as np\nsales = np.array([1200, 950, 2100, 1500, 800, 2300])\nadjusted = np.where(sales >= 1500, sales * 1.10, sales * 0.90)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.where() — common patterns you'll see in production.\n# APPROACH  - Combine np.where() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             branches, the one-arg form for \"give me indices\n#             where the condition is true\", and works\n#             unchanged on 2D arrays.\n#             a feature column conditionally, find positions\n#             matching a condition, transform a 2D array.\n#             fast — np.select is the right tool there\n#             (senior tier).\n#\nimport numpy as np\nsales = np.array([1200, 950, 2100, 1500, 800, 2300])\n# Scalar branches -> a string column\nstatus = np.where(sales >= 1500, \"Exceeded\", \"Below target\")\n# Mixed branches -> mathematical adjustment\nimproved = np.where(sales >= 1500, sales, sales * 1.15)\n# One-arg form returns indices of True (per axis as a tuple)\nabove_idx = np.where(sales >= 1500)[0]   # 1D array of positions\n# Works the same on 2D\nregions = np.array([\n    [1200, 1450, 1800],\n    [ 950, 1100, 1300],\n    [2100, 2200, 2400],\n])\nnp.where(regions >= 1500, \"Good\", \"Needs Work\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.where() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             over nested np.where for 3+ branches (readable\n#             and faster), use np.where(cond) to get indices\n#             when you actually want positions, and reach for\n#             np.clip when the logic is \"clamp to range\".\n#             unreadable nesting; np.where(cond) is the\n#             vectorized indexOf; np.clip is the simplest\n#             clamp.\n#             short-circuit), so guard heavy computations;\n#             np.where(cond) returns a tuple — easy to forget\n#             the [0] for 1D arrays.\n#\nimport numpy as np\nsales = np.array([1200, 950, 2100, 1500, 800, 2300])\n# 1. Multi-branch — np.select beats nested np.where\nrating = np.select(\n    [sales < 1000, sales < 1500, sales >= 2000],\n    [\"poor\",       \"fair\",       \"excellent\"],\n    default=\"good\",\n)\n# 2. Indices of matching positions\nmask = sales >= 1500\nidx  = np.where(mask)[0]                # array of positions\n# np.flatnonzero(mask) is equivalent, slightly clearer for 1D\n# 3. Clamping is simpler with np.clip than np.where\nclipped = np.clip(sales, 1000, 2000)    # floor 1000, ceil 2000\n# 4. Watch for double-evaluation in np.where branches\n# Wrong (computes BOTH every time):\n#   out = np.where(cond, expensive_a(x), expensive_b(x))\n# Right: compute and select\na = expensive_a(x)\nb = expensive_b(x)\nout = np.where(cond, a, b)\n# Or pre-mask if branches are conditional on data quality:\nout = np.empty_like(x)\nout[ cond] = expensive_a(x[ cond])\nout[~cond] = expensive_b(x[~cond])\n#\n# Decision rule:\n#   binary if/else over arrays                   -> np.where(cond, x, y)\n#   3+ branches                                  -> np.select([conds], [vals], default)\n#   floor/ceiling clamp only                     -> np.clip(a, lo, hi)\n#   need indices where cond is True              -> np.flatnonzero(cond) or np.where(cond)[0]\n#   apply expensive fn only to True/False rows   -> pre-mask: out[cond] = f(x[cond])\n#   piecewise polynomial (closed-form ranges)    -> np.piecewise(x, conds, funcs)\n#   bool input, just want True positions         -> np.argwhere(cond) for (i,j) tuples\n#\n# Anti-pattern: np.where(cond, expensive_a(x), expensive_b(x))\n#   np.where is NOT short-circuiting — both branches are fully computed for\n#   every element, then combined. If a branch is expensive or has side\n#   effects (warnings, divide-by-zero), pre-compute via masked indexing\n#   instead: out = np.empty_like(x); out[cond] = a(x[cond]); out[~cond] = b(...)."
                  }
        ],
        tips: [
                  "`np.where(cond, x, y)` — x and y can be scalars, arrays, or mixed",
                  "For 3+ conditions use `np.select(conditions, choices, default)` instead of nested `np.where`",
                  "`np.where(cond)` (one argument) returns a tuple of index arrays — one per dimension",
                  "np.where is computed for all elements — there is no short-circuit, unlike Python if/else"
        ],
        mistake: "Using nested np.where for 3+ conditions. It becomes unreadable fast. Use `np.select([cond1, cond2, cond3], [val1, val2, val3], default=val4)` instead.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 3: Operations, Math & Performance ─────────────────────────────────────────
  {
    id: "operations",
    title: "Operations, Math & Performance",
    entries: [
      {
        id: "vectorized-ops",
        fn: "Vectorized operations",
        desc: "Apply element-wise arithmetic to arrays without loops.",
        category: "Operations",
        subtitle: "Array arithmetic in C — 10-100x faster than Python loops",
        signature: "a + b | a * b (element-wise) | a @ b (matrix multiply)",
        descLong: "NumPy vectorized operations apply to every element at C speed without Python loops. Operators (+, -, *, /, **, //, %) are all element-wise. Use @ or np.dot() for matrix multiplication.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Vectorized operations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             operators. No loops.\n#             write math, get C speed.\n#             matrix-multiply confusion (* is element-wise!).\n#\nimport numpy as np\na = np.array([1., 4., 9., 16.])\nb = np.array([2., 2., 3., 4.])\na + b              # element-wise\na * b              # element-wise (NOT matrix multiply)\na ** 2             # element-wise power"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Vectorized operations — common patterns you'll see in production.\n# APPROACH  - Combine Vectorized operations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             ufuncs (sqrt, exp, log, sin, etc.), comparisons\n#             producing boolean masks, and the * vs @ matrix-\n#             multiply trap.\n#             matrix-multiply distinction is the most common\n#             source of \"wrong shape\" bugs.\n#             memory savings, or the safe-divide pattern —\n#             senior tier.\n#\nimport numpy as np\na = np.array([1., 4., 9., 16.])\n# Scalar broadcast and comparisons\na + 10                       # add to every element\na > 3                        # [False True True True]\n# ufuncs — element-wise math\nnp.sqrt(a); np.exp(a); np.log(a)\nnp.sin(a); np.cos(a); np.abs(a - 5)\nnp.floor(a); np.ceil(a); np.round(a, 2)\n# Matrix multiply vs element-wise — DIFFERENT operators\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\nA @ B                        # matrix multiply  -> [[19, 22], [43, 50]]\nA * B                        # ELEMENT-WISE     -> [[5, 12], [21, 32]]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Vectorized operations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             allocations, ufunc out= for explicit destination\n#             buffers, np.errstate for division/log safety, and\n#             the rule that np.vectorize is a CONVENIENCE\n#             wrapper — it does NOT speed code up.\n#             loops; np.errstate prevents NaN/inf from\n#             silently propagating; calling out the\n#             np.vectorize myth saves people from a common\n#             trap.\n#             expect mutation; out= requires the right shape;\n#             np.errstate is a context manager, easy to forget.\n#\nimport numpy as np\na = np.linspace(0.1, 10, 1_000_000, dtype=np.float32)\n# 1. In-place arithmetic — no allocation\na += 1                        # write to same memory\na *= 2\n# 2. ufunc out= — explicit destination\nout = np.empty_like(a)\nnp.multiply(a, 3.0, out=out)  # write into out\n# 3. Safe division / log under known-bad inputs\nwith np.errstate(divide=\"ignore\", invalid=\"ignore\"):\n    ratio = np.where(b != 0, a / b, 0.0)\n    log_a = np.where(a > 0, np.log(a), -np.inf)\n# 4. np.vectorize is a Python-loop convenience, NOT a speed-up\n# slow = np.vectorize(some_python_fn)(arr)     # still a Python loop\n# Right: rewrite using ufuncs / np.where / np.select for real speed.\n# Decision rule:\n#   element-wise math (+, -, *, /, **)           -> direct operators / ufuncs\n#   matrix product (rows x cols)                 -> @ or np.matmul (NEVER *)\n#   batched matmul over leading axes             -> @ broadcasts; np.einsum for clarity\n#   memory-tight inner loop                      -> in-place += / *= or out= kwarg\n#   division/log over data that may be 0/neg     -> np.errstate(...) + np.where guard\n#   want NaN-aware math                          -> np.nansum / np.nanmean / np.nan_to_num\n#   need to call a Python fn over each element   -> rewrite with ufuncs (NOT np.vectorize)\n#\n# Anti-pattern: np.vectorize(fn) thinking it gives speed\n#   np.vectorize is a CONVENIENCE wrapper around a Python for-loop — it does\n#   NOT release the GIL or use C code. It is sometimes 100x slower than the\n#   equivalent ufunc/np.where formulation. Refactor the function in terms of\n#   array ops (np.where, np.select, ufuncs); only fall back to np.vectorize\n#   for genuinely scalar-only logic where speed doesn't matter."
                  }
        ],
        tips: [
                  "`a @ b` is matrix multiply; `a * b` is element-wise — confusing them is the #1 NumPy mistake",
                  "Vectorized operations run in C — a loop over 1M elements takes ~1s in Python, ~1ms in NumPy",
                  "`np.clip(a, lo, hi)` is the vectorized clamp — no loop needed",
                  "`np.maximum(a, b)` is element-wise max between two arrays; `np.max(a)` is the max of one array"
        ],
        mistake: "Using `a * b` for matrix multiplication. This is element-wise. Use `a @ b` or `np.dot(a, b)` for matrix multiplication.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([1., 4., 9., 16.])\nb = np.array([2., 2., 3., 4.])\na + b               # [3., 6., 12., 20.]",
          concise: "A * B               # [[5,12],[21,32]] — element-wise!",
        },
      },
      {
        id: "np-clip",
        fn: "np.clip()",
        desc: "Clamp array values to a specified range.",
        category: "Operations",
        subtitle: "Values below min become min, above max become max",
        signature: "np.clip(a, a_min, a_max)",
        descLong: "np.clip() restricts every element to the range [a_min, a_max]. Values below a_min become a_min; values above a_max become a_max. Vectorized and fast — no loops needed. Also available as a.clip(min, max).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.clip() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             one call.\n#             clearer, faster single call.\n#             clipping, or the per-element-bounds form.\n#\nimport numpy as np\na = np.array([-3, -1, 0, 2, 5, 8, 12])\nnp.clip(a, 0, 10)            # [0, 0, 0, 2, 5, 8, 10]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.clip() — common patterns you'll see in production.\n# APPROACH  - Combine np.clip() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             None, the method form, and the practical use\n#             cases (pixel normalization, log safety,\n#             gradient clipping in ML).\n#             the patterns repeat across image processing,\n#             numerical stability, and ML training loops.\n#             per-element bounds form — senior tier.\n#\nimport numpy as np\na = np.array([-3, -1, 0, 2, 5, 8, 12])\n# One-sided — None means \"no bound\"\nnp.clip(a, 0, None)          # floor at 0, no ceiling\nnp.clip(a, None, 5)          # ceiling at 5, no floor\n# Method form\na.clip(0, 10)\n# Pixel normalization\npixels = np.random.randint(-10, 300, (100, 100))\nvalid  = np.clip(pixels, 0, 255)\n# Log safety — avoid log(0)\nlogits = np.array([0.0001, 0.5, 0.9999])\nsafe = np.clip(logits, 1e-7, 1 - 1e-7)\n# Gradient clipping in ML\n# gradients = np.clip(gradients, -1.0, 1.0)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.clip() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             min/max per row), in-place clipping with out=,\n#             and picking np.clip vs np.minimum/maximum vs\n#             mask assignment based on the actual shape of\n#             the bound.\n#             cases without a Python loop; out= avoids\n#             allocation; clear decision rule across the four\n#             clamp idioms.\n#             out= requires the right dtype; np.clip is\n#             dtype-strict (clipping a float into an int array\n#             can silently truncate).\n#\nimport numpy as np\n# 1. Per-element bounds — different floor/ceiling per index\nvals = np.array([3, 0, 8, 12])\nlo   = np.array([0, 1, 2, 0])\nhi   = np.array([5, 5, 5, 10])\nnp.clip(vals, lo, hi)              # [3, 1, 5, 10]\n# 2. In-place to avoid allocation\nbig = np.random.randn(10_000_000).astype(np.float32)\nnp.clip(big, -3.0, 3.0, out=big)   # same memory, no copy\n# 3. Quick guide\n#    bound by [lo, hi] both sides     -> np.clip(a, lo, hi)\n#    element-wise max of TWO arrays   -> np.maximum(a, b)\n#    element-wise min of TWO arrays   -> np.minimum(a, b)\n#    set values WHERE mask is true    -> a[mask] = value\n# 4. Watch dtype on int targets\nints = np.array([-3, 5, 12], dtype=np.int8)\nnp.clip(ints, -2, 10)              # works\n# np.clip(ints, -200, 200)         # silently saturates inside int8 range\n#\n# Decision rule:\n#   clamp to [lo, hi] both sides                 -> np.clip(a, lo, hi)\n#   one-sided clamp (floor only, ceiling only)   -> np.clip(a, lo, None) / np.clip(a, None, hi)\n#   per-element bounds                           -> np.clip(a, lo_arr, hi_arr) (broadcastable)\n#   element-wise max of two arrays               -> np.maximum(a, b)\n#   element-wise min of two arrays               -> np.minimum(a, b)\n#   in-place clipping for huge arrays            -> np.clip(a, lo, hi, out=a)\n#   ML gradient clipping by global norm          -> rescale, NOT element-wise clip\n#\n# Anti-pattern: np.minimum(np.maximum(a, lo), hi) instead of np.clip\n#   Two passes, two temporaries, less readable, and slightly slower than the\n#   single np.clip call. Worse, it's easy to get the order wrong (max/min\n#   swapped) — the bug is silent. Use np.clip(a, lo, hi) as the primary clamp."
                  }
        ],
        tips: [
                  "`np.clip(a, 0, None)` clips only the lower bound — `None` means no bound on that side",
                  "Gradient clipping in neural networks: `np.clip(grads, -max_norm, max_norm)`",
                  "Clip probabilities before log: `np.clip(p, 1e-7, 1-1e-7)` prevents `log(0) = -inf`",
                  "`a.clip(lo, hi, out=a)` clips in-place with no copy — saves memory for large arrays"
        ],
        mistake: "Using `np.minimum(np.maximum(a, lo), hi)` for clamping. `np.clip(a, lo, hi)` is shorter, clearer, and slightly faster.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([-3, -1, 0, 2, 5, 8, 12])\nnp.clip(a, 0, 10)     # [0, 0, 0, 2, 5, 8, 10]\nnp.clip(a, 0, None)   # [0, 0, 0, 2, 5, 8, 12] — clip only below",
          concise: "np.clip(np.array([3, 0, 8]), lo, hi)   # [3, 1, 5]",
        },
      },
      {
        id: "broadcasting",
        fn: "Broadcasting",
        desc: "Operate on arrays of different shapes by automatically expanding dimensions.",
        category: "Operations",
        subtitle: "Align shapes from the right — dimensions must match or be 1",
        signature: "a[2,3] + b[3] → b broadcast to [2,3]",
        descLong: "Broadcasting allows operations between arrays of different shapes. NumPy automatically expands dimensions of size 1 to match the other array. Shapes are compared from the right — dimensions must be equal or one of them must be 1.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Broadcasting — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             1D vector along the missing axis automatically.\n#             (2,3) + shape (3,) just works.\n#             broadcasting, or the keepdims=True trick.\n#\nimport numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])     # shape (2, 3)\nb = np.array([10, 20, 30])                # shape (3,)\na + b                                     # b broadcast to (2, 3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Broadcasting — common patterns you'll see in production.\n# APPROACH  - Combine Broadcasting with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             shapes from the right, every dimension must be\n#             equal or one of them is 1. Demonstrate column-\n#             vector broadcasting and the keepdims=True\n#             pattern for \"center each row\".\n#             broadcasting; outer product via broadcasting is\n#             the trick that makes ML code concise.\n#             \"broadcasting blew up my memory\" trap — senior\n#             tier.\n#\nimport numpy as np\na = np.array([[1, 2, 3], [4, 5, 6]])     # (2, 3)\n# Column vector broadcasts along columns\nc = np.array([[100], [200]])             # (2, 1)\na + c                                    # broadcast to (2, 3)\n# Outer product via broadcasting\nrow = np.array([1, 2, 3])                # (3,)\ncol = np.array([[1], [2], [3]])          # (3, 1)\nrow * col                                # 3x3 multiplication table\n# Center each row — keepdims=True keeps the (n,1) shape so it broadcasts\na - a.mean(axis=1, keepdims=True)\n# Scale each column\na / a.std(axis=0)\n# Compatibility cheat-sheet (align from the RIGHT):\n#   (3, 4) + (4,)   -> OK: (3, 4)\n#   (3, 4) + (3, 1) -> OK: (3, 4)\n#   (3, 4) + (3,)   -> ERROR  (4 vs 3 don't match)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Broadcasting — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (free vs allocates), use np.broadcast_to for an\n#             explicit zero-copy expansion, watch out for\n#             \"broadcasting blew up to (N, M, K)\" memory\n#             surprises, and sanity-check intermediate shapes\n#             with .shape asserts.\n#             broadcast_to documents intent; shape asserts\n#             catch dimension errors at development time\n#             instead of at runtime.\n#             implicit broadcasting can produce huge arrays\n#             from small inputs (the (1000, 1, 1000) case);\n#             reasoning about 3+ axis broadcasting takes\n#             practice.\n#\nimport numpy as np\nX = np.random.rand(100, 3)            # (100, 3)\nweights = np.array([0.5, 0.3, 0.2])\n# 1. Broadcast vs tile — same result, broadcasting is FREE\nslow = np.tile(weights, (100, 1)) * X    # allocates (100, 3) copy\nfast = weights * X                       # zero-allocation broadcast\n# 2. Explicit zero-copy expansion when you need a view shape\nW_view = np.broadcast_to(weights, (100, 3))   # read-only view\n# 3. Memory blowup trap — small inputs, BIG output\na = np.random.rand(1000, 1)            # (1000, 1)\nb = np.random.rand(1, 1000)            # (1, 1000)\n# c = a + b                            # OK — (1000, 1000)\n# d = a * b * np.ones((1000, 1000))    # 8MB explicit; OK to reason about\n# But this stacks:\n# a[:, None] + b[None, :, None]        # (1000, 1000, 1000) -> 8GB\n# 4. Defensive shape asserts at function boundaries\ndef normalize_rows(x: np.ndarray) -> np.ndarray:\n    assert x.ndim == 2, f\"expected 2D, got {x.shape}\"\n    mu = x.mean(axis=1, keepdims=True)\n    sd = x.std(axis=1, keepdims=True)\n    return (x - mu) / sd                # all broadcasts cleanly\n# Anti-pattern: using axis= without keepdims=True\n# bad = a - a.mean(axis=1)              # ValueError — shape mismatch\n# right = a - a.mean(axis=1, keepdims=True)\n#\n# Decision rule:\n#   add a row vector to every row                -> rely on broadcasting (1D shape (k,))\n#   add a column vector to every column          -> reshape to (n, 1) or use [:, None]\n#   center each row / column                     -> reduce with keepdims=True, then subtract\n#   need an explicit zero-copy expanded view     -> np.broadcast_to(a, target_shape)\n#   need a writable expanded copy                -> np.tile (allocates) — only if you must\n#   shape mismatch you can't reason about        -> assert .shape at boundaries\n#   axis insertion for broadcasting              -> a[:, None] / a[None, :] (clearer than reshape)"
                  }
        ],
        tips: [
                  "Broadcasting rule: align shapes from the right — each dimension must match or be 1",
                  "`keepdims=True` preserves the reduced axis as size-1, enabling broadcasting back to the original shape",
                  "`a - a.mean(axis=1, keepdims=True)` centers each row — the classic use of keepdims",
                  "If shapes are incompatible, NumPy raises `ValueError: operands could not be broadcast`"
        ],
        mistake: "`a.mean(axis=1)` returns shape `(n,)` — subtracting it from `a` of shape `(n,m)` fails because shapes `m` and `n` do not align. Use `keepdims=True` to get shape `(n,1)` which broadcasts correctly.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([[1, 2, 3],\n[4, 5, 6]])   # shape (2, 3)\nb = np.array([10, 20, 30]) # shape (3,) → broadcast to (2, 3)",
          concise: "a / a.std(axis=0)",
        },
      },
      {
        id: "np-meshgrid",
        fn: "np.meshgrid()",
        desc: "Create coordinate matrices from coordinate vectors.",
        category: "Operations",
        subtitle: "Generate (X, Y) grids for 2D function evaluation and plotting",
        signature: "X, Y = np.meshgrid(x, y)",
        descLong: "np.meshgrid() takes N 1D arrays and returns N coordinate matrices. Used for evaluating 2D functions over a grid, creating contour plots, and generating all combinations of two arrays. indexing=\"ij\" uses matrix indexing (row, col); indexing=\"xy\" (default) uses Cartesian (x, y).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.meshgrid() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             coordinate matrices. Evaluate a function over\n#             the resulting grid.\n#             vectors -> Z = f(X, Y) over the whole grid.\n#             indexing=\"ij\" vs \"xy\", or the \"all combinations\"\n#             use case.\n#\nimport numpy as np\nx = np.linspace(-3, 3, 100)\ny = np.linspace(-3, 3, 100)\nX, Y = np.meshgrid(x, y)             # both shape (100, 100)\nZ = np.sin(X) * np.cos(Y)             # f over the grid"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.meshgrid() — common patterns you'll see in production.\n# APPROACH  - Combine np.meshgrid() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             \"all combinations of two arrays\" (cartesian\n#             product), and the sparse=True flag for memory\n#             efficiency on large grids.\n#             modeling code; sparse=True is the single most\n#             useful option once grids get large.\n#             conventions or the np.mgrid alternative —\n#             senior tier.\n#\nimport numpy as np\n# Contour-ready grid\nx = np.linspace(-3, 3, 100)\ny = np.linspace(-3, 3, 100)\nX, Y = np.meshgrid(x, y)\nZ = np.exp(-(X**2 + Y**2) / 2)        # 2D Gaussian\n# plt.contourf(X, Y, Z)\n# All (x, y) combinations — cartesian product\nx_pts = np.array([1, 2, 3])\ny_pts = np.array([10, 20])\nX, Y = np.meshgrid(x_pts, y_pts)\npairs = np.column_stack([X.ravel(), Y.ravel()])\n# [[1,10],[2,10],[3,10],[1,20],[2,20],[3,20]]\n# Memory-efficient alternative — sparse=True returns broadcast-ready arrays\nXs, Ys = np.meshgrid(x, y, sparse=True)\n# Xs.shape == (1, 100), Ys.shape == (100, 1)\nZs = np.sin(Xs) * np.cos(Ys)          # broadcasts to (100, 100)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.meshgrid() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             implicit broadcasting (xs[:, None], ys[None, :])\n#             over dense materialized grids; pick indexing=\n#             (\"xy\" cartesian for plotting, \"ij\" matrix for\n#             tensor work) deliberately; for huge grids,\n#             stream computation instead of materializing.\n#             big grids; explicit indexing= avoids the \"rows\n#             vs cols flipped\" plotting bug; streaming keeps\n#             memory bounded for very large evaluations.\n#             syntax; indexing= conventions are subtle and\n#             often only matter at integration boundaries\n#             (matplotlib expects xy; tensor libs often ij).\n#\nimport numpy as np\nx = np.linspace(-3, 3, 1000)\ny = np.linspace(-3, 3, 1000)\n# 1. Skip meshgrid entirely — broadcast is free\nZ = np.sin(x[None, :]) * np.cos(y[:, None])    # shape (1000, 1000)\n# 2. Indexing convention — pick on purpose\nX, Y = np.meshgrid(x, y, indexing=\"xy\")        # default; matplotlib-friendly\n# X is row-major; X[i, j] = x[j], Y[i, j] = y[i]\nXij, Yij = np.meshgrid(x, y, indexing=\"ij\")    # tensor-style\n# Xij[i, j] = x[i], Yij[i, j] = y[j]\n# 3. Stream rows for huge grids that don't fit in memory\ndef integrate_2d(f, x, y):\n    total = 0.0\n    for yi in y:\n        total += np.sum(f(x, yi))               # one row at a time\n    return total\n# 4. np.mgrid — alternative compact syntax (returns dense by default)\nX, Y = np.mgrid[-3:3:100j, -3:3:100j]           # complex step = \"include endpoint\"\n# Open form (sparse-equivalent): np.ogrid[-3:3:100j, -3:3:100j]\n# Decision rule:\n#   plotting on a small grid                     -> np.meshgrid(x, y)  (default xy)\n#   tensor / matrix-indexed math                 -> np.meshgrid(x, y, indexing=\"ij\")\n#   memory-tight large grid                      -> sparse=True OR broadcast x[None,:] * y[:,None]\n#   compact slice-syntax form                    -> np.mgrid[-3:3:100j, -3:3:100j]\n#   open / sparse slice-syntax form              -> np.ogrid[-3:3:100j, -3:3:100j]\n#   very large grid you can't materialize        -> stream a row at a time\n#   need (x, y) pair list, not 2 grids           -> np.column_stack([X.ravel(), Y.ravel()])\n#\n# Anti-pattern: dense np.meshgrid for a 1000x1000 grid you only sum over\n#   meshgrid(x, y) without sparse=True allocates two N*M float64 arrays\n#   (16 MB each at 1000x1000, gigabytes at 10000x10000). For element-wise\n#   evaluation of f(x, y), use sparse=True or skip meshgrid entirely:\n#   Z = f(x[None, :], y[:, None]) broadcasts with no extra allocation."
                  }
        ],
        tips: [
                  "`sparse=True` returns shape (1,n) and (m,1) arrays that broadcast — saves memory for large grids",
                  "Z.shape is (len(y), len(x)) — rows correspond to y values, columns to x values",
                  "For 3D grids: `X, Y, Z = np.meshgrid(x, y, z)` — each output is 3D",
                  "np.mgrid is an alternative: `X, Y = np.mgrid[-3:3:100j, -3:3:100j]`"
        ],
        mistake: "Forgetting that Z has shape (len(y), len(x)) not (len(x), len(y)). Passing X and Z with swapped axes to a plotting function produces a transposed plot.",
        shorthand: {
          verbose: "import numpy as np\nimport matplotlib.pyplot as plt\nx = np.linspace(-3, 3, 100)\ny = np.linspace(-3, 3, 100)",
          concise: "X, Y = np.meshgrid(x, y, sparse=True)",
        },
      },
      {
        id: "np-nan",
        fn: "np.nan handling",
        desc: "Detect, replace, and compute safely with NaN values.",
        category: "Operations",
        subtitle: "np.isnan() to detect, np.nan_to_num() to replace, nan* functions to ignore",
        signature: "np.isnan(a) | np.nanmean(a) | np.nan_to_num(a, nan=0)",
        descLong: "NaN (Not a Number) is the floating-point sentinel for missing values. NaN propagates through arithmetic — any operation with NaN returns NaN. Use np.isnan() to detect, np.nan_to_num() to replace, and nan-prefixed aggregation functions (nanmean, nansum, etc.) to ignore NaN.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.nan handling — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             == (NaN != NaN by IEEE rule).\n#             isfinite/isinf companions.\n#\nimport numpy as np\na = np.array([1.0, 2.0, np.nan, 4.0, np.nan])\nnp.isnan(a)              # [F F T F T]\nnp.isnan(a).sum()        # 2\n# WRONG — NaN comparisons are always False\n# a == np.nan            # all False, even where NaN exists"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.nan handling — common patterns you'll see in production.\n# APPROACH  - Combine np.nan handling with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             aggregations to ignore NaN, np.nan_to_num to\n#             replace, boolean masks to drop, and isfinite\n#             vs isnan vs isinf for the full numerical-\n#             pathology picture.\n#             numeric code; the isfinite check is the safest\n#             \"numbers only\" filter.\n#             products or the \"convert to NaN before ops\"\n#             pattern — senior tier.\n#\nimport numpy as np\na = np.array([1.0, 2.0, np.nan, 4.0, np.nan])\n# NaN propagates — plain aggregations return NaN\na.sum()                  # nan\na.mean()                 # nan\n# NaN-safe aggregations — ignore NaN entries\nnp.nansum(a)             # 7.0\nnp.nanmean(a)            # 2.333...\nnp.nanstd(a); np.nanmax(a); np.nanmin(a)\nnp.nanpercentile(a, 75)\n# Replace NaN (and optionally inf)\nnp.nan_to_num(a, nan=0.0)\nnp.nan_to_num(a, nan=0.0, posinf=1e10, neginf=-1e10)\n# Drop NaN via mask\na[~np.isnan(a)]          # [1., 2., 4.]\na[np.isfinite(a)]        # same, AND drops inf\n# isfinite vs isnan vs isinf\nb = np.array([1, np.nan, np.inf, -np.inf])\nnp.isnan(b);   np.isinf(b);   np.isfinite(b)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.nan handling — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             boundaries (drop, fill, propagate, raise);\n#             convert sentinel values (-999, \"\") to NaN\n#             before numeric ops; use np.errstate to silence\n#             \"invalid value\" warnings only where you've\n#             already handled them.\n#             auditable; sentinel-conversion is a single-pass\n#             clean-up; np.errstate keeps logs honest.\n#             forget); per-function policy adds boilerplate;\n#             converting \"\" -> NaN requires the column to be\n#             float dtype already.\n#\nimport numpy as np\n# 1. Convert sentinel values to NaN before numeric ops\nraw = np.array([1.0, -999.0, 3.0, -999.0])\nclean = np.where(raw == -999, np.nan, raw)\n# 2. Explicit per-function policy\ndef safe_mean(x: np.ndarray, *, policy: str = \"ignore\") -> float:\n    if policy == \"ignore\":\n        return float(np.nanmean(x))\n    if policy == \"drop\":\n        return float(np.mean(x[~np.isnan(x)]))\n    if policy == \"raise\":\n        if np.isnan(x).any():\n            raise ValueError(\"input contains NaN\")\n        return float(np.mean(x))\n    raise ValueError(policy)\n# 3. Silence the \"invalid value\" warning ONLY where handled\nwith np.errstate(invalid=\"ignore\"):\n    log_safe = np.where(a > 0, np.log(a), -np.inf)\n# 4. Watch matrix products — NaN propagates entire rows/cols\nA = np.array([[1.0, np.nan], [3.0, 4.0]])\nA @ np.array([1.0, 1.0])             # any NaN in a row -> NaN in the output\n# Anti-pattern: comparing with == np.nan\n#   a[a == np.nan]                   # always empty\n# Right: a[np.isnan(a)]\n#\n# Decision rule:\n#   detect NaN positions                         -> np.isnan(a)\n#   detect any non-finite (NaN, +inf, -inf)      -> ~np.isfinite(a)\n#   aggregate while ignoring NaN                 -> np.nansum / np.nanmean / np.nanstd\n#   replace NaN with a fill value                -> np.nan_to_num(a, nan=0)\n#   drop NaN entries                             -> a[~np.isnan(a)] or a[np.isfinite(a)]\n#   sentinel value (e.g. -999) -> NaN            -> np.where(a == -999, np.nan, a)\n#   want to fail loudly on NaN input             -> if np.isnan(a).any(): raise\n#   want to suppress numpy invalid warnings      -> with np.errstate(invalid=\"ignore\"):"
                  }
        ],
        tips: [
                  "NaN comparisons always return False — `np.nan == np.nan` is False. Use `np.isnan()` to check",
                  "`np.nanmean()` etc. silently ignore NaN — always check with `np.isnan().sum()` first to know how many were dropped",
                  "`np.isfinite(a)` is stricter than `~np.isnan(a)` — it also excludes `inf` and `-inf`",
                  "`np.nan_to_num(a)` replaces NaN with 0, inf with a large number — useful before feeding to ML models"
        ],
        mistake: "Checking `a == np.nan` to find NaN values. This always returns False because NaN is not equal to anything, including itself. Use `np.isnan(a)` instead.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([1.0, 2.0, np.nan, 4.0, np.nan])\nnp.isnan(a)             # [F, F, T, F, T]\nnp.isnan(a).sum()       # 2 — count of NaN",
          concise: "np.isfinite(b)          # [T, F, F, F]",
        },
      },
      {
        id: "aggregations",
        fn: "Aggregations",
        desc: "Reduce arrays along an axis — sum, mean, std, min, max.",
        category: "Operations",
        subtitle: "axis=0 collapses rows (per column), axis=1 collapses columns (per row)",
        signature: "a.sum(axis=0) | a.mean() | np.percentile(a, 75)",
        descLong: "Aggregation functions reduce an array along a specified axis. axis=0 collapses rows — the result has the shape of a single row. axis=1 collapses columns — the result has the shape of a single column. No axis argument aggregates everything.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Aggregations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             sum/mean/min/max.\n#             shape for any dim.\n#             argument) or the keepdims=True habit.\n#\nimport numpy as np\na = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=float)\na.sum()           # 45\na.mean()          # 5.0\na.min(); a.max()  # 1.0, 9.0"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Aggregations — common patterns you'll see in production.\n# APPROACH  - Combine Aggregations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             collapses ROWS (per-column result), axis=1\n#             collapses COLUMNS (per-row result). Use\n#             keepdims=True when you need to broadcast the\n#             result back. Cumulative ops and argmin/argmax\n#             follow the same axis convention.\n#             vectorized data analysis; keepdims=True is the\n#             single most useful flag for \"use the reduction\n#             as a feature\".\n#             dtype-promotion gotcha — senior tier.\n#\nimport numpy as np\na = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]], dtype=float)\n# axis=0 collapses ROWS -> per-column result\na.sum(axis=0)            # [12, 15, 18]\na.mean(axis=0)           # column means\n# axis=1 collapses COLS -> per-row result\na.sum(axis=1)            # [ 6, 15, 24]\na.mean(axis=1)           # row means\n# keepdims=True keeps the reduced axis as size-1 for broadcasting\na - a.mean(axis=1, keepdims=True)        # center each row\n# Cumulative\na.cumsum()                # flatten, then cumsum\na.cumsum(axis=1)          # running sum along rows\n# Index reductions\na.argmin(axis=0)          # row-index of min per column\na.argmax(axis=1)          # col-index of max per row\n# Percentiles\nnp.percentile(a, [25, 50, 75])\nnp.median(a)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Aggregations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (nansum/nanmean) when input quality is unknown;\n#             dtype= argument to pin output type and avoid\n#             integer overflow on large sums; weighted ops via\n#             np.average; tuple-axis reduction for batch ops.\n#             dtype= prevents int32 overflow on huge sums;\n#             weighted average is the right tool for \"average\n#             weighted by count\"; tuple-axis is essential for\n#             batched tensor ops.\n#             how many were dropped or you'll never notice\n#             upstream data issues; dtype= override doesn't\n#             prevent precision loss in float32->float64\n#             chains.\n#\nimport numpy as np\n# 1. NaN-safe aggregations on potentially-dirty data\ndata = np.array([1.0, 2.0, np.nan, 4.0])\nn_dropped = np.isnan(data).sum()\nresult = np.nanmean(data)\n# log_metric(\"nan_dropped\", n_dropped)\n# 2. dtype= to prevent int overflow\nbig = np.full(10**8, 30, dtype=np.int32)\nbig.sum()                 # may overflow int32 silently\nbig.sum(dtype=np.int64)   # safe — accumulates as int64\n# 3. Weighted aggregation\nprices = np.array([10.0, 20.0, 30.0])\ncounts = np.array([100,  50,   25])\nnp.average(prices, weights=counts)        # weighted mean\n# 4. Tuple-axis reduction — batch tensor ops\nbatch = np.random.randn(32, 64, 64)       # (B, H, W)\nbatch.mean(axis=(1, 2))                   # one mean per item, shape (32,)\nbatch.std(axis=(1, 2), keepdims=True)     # shape (32, 1, 1)\n# Decision rule:\n#   may contain NaN                              -> nan-prefixed (log dropped count)\n#   integer dtype, large sum                     -> .sum(dtype=np.int64) explicitly\n#   weighted by another column                   -> np.average(arr, weights=...)\n#   batch reduction (B, ...)                     -> axis=tuple(remaining dims)\n#   need to broadcast result back                -> keepdims=True\n#   want index of min/max, not value             -> argmin / argmax (NOT min/max)\n#   percentile or median                         -> np.percentile / np.median\n#\n# Anti-pattern: int32 .sum() over a large array silently overflowing\n#   big = np.full(10**8, 30, dtype=np.int32); big.sum()  # wraps past 2**31\n#   The result is a wrong, deterministic-looking integer with no warning.\n#   Pin accumulator dtype: big.sum(dtype=np.int64), or upcast first\n#   (big.astype(np.int64).sum()). Same applies to float32 * very-long means."
                  }
        ],
        tips: [
                  "`axis=0` reduces rows → result shape is the column shape; `axis=1` reduces columns → result shape is the row shape",
                  "`keepdims=True` preserves the reduced axis as size-1 — essential for broadcasting results back",
                  "`argmax()` returns indices, `max()` returns values — they are distinct functions",
                  "`np.nanmean()`, `np.nansum()` etc. ignore NaN — always prefer these over `mean()` when NaN may exist"
        ],
        mistake: "`a.mean(axis=1)` gives shape `(n,)`. Subtracting from `a` of shape `(n,m)` raises a broadcast error. Use `a.mean(axis=1, keepdims=True)` to get shape `(n,1)` which broadcasts correctly.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([[1,2,3],[4,5,6],[7,8,9]], dtype=float)\na.sum()      # 45\na.mean()     # 5.0",
          concise: "np.median(a)",
        },
      },
      {
        id: "np-diff",
        fn: "np.diff()",
        desc: "Compute differences between consecutive elements.",
        category: "Operations",
        subtitle: "First difference, nth order, along any axis",
        signature: "np.diff(a, n=1, axis=-1)",
        descLong: "np.diff() computes the discrete difference between consecutive elements: out[i] = a[i+1] - a[i]. The result has one fewer element than the input. n= controls the order (apply diff n times). Useful for detecting changes, derivatives, and checking if an array is sorted.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.diff() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Result has one fewer element.\n#             derivative\".\n#             axis=, or prepend/append for length preservation.\n#\nimport numpy as np\na = np.array([1, 3, 6, 10, 15])\nnp.diff(a)               # [2, 3, 4, 5]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.diff() — common patterns you'll see in production.\n# APPROACH  - Combine np.diff() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             axis-aware diff for 2D, prepend/append to keep\n#             length, and the canonical use cases (is-sorted\n#             check, percent change, detecting category\n#             changes).\n#             signal code; the prepend/append trick is the\n#             single most-asked numpy question on this topic.\n#             NaN or higher-order signal-processing diffs —\n#             senior tier.\n#\nimport numpy as np\na = np.array([1, 3, 6, 10, 15])\n# nth-order\nnp.diff(a, n=2)          # [1, 1, 1] — second difference\n# 2D — choose the axis\nA = np.array([[1, 3, 6], [2, 5, 9]])\nnp.diff(A, axis=0)        # row differences (collapses rows by 1)\nnp.diff(A, axis=1)        # column differences\n# Is the array sorted?\nnp.all(np.diff(a) >= 0)   # True == non-decreasing\nnp.all(np.diff(a) > 0)    # True == strictly increasing\n# Keep the same length with prepend/append\nnp.diff(a, prepend=0)     # [1, 2, 3, 4, 5]\nnp.diff(a, append=20)     # [2, 3, 4, 5, 5]\n# Percent change\nnp.diff(a) / a[:-1] * 100\n# Detect where a categorical-like array changes value\nx = np.array([1, 1, 2, 2, 3, 1])\nnp.where(np.diff(x) != 0)[0] + 1     # change-point indices"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.diff() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             the inverse of cumsum\"; reach for np.gradient\n#             when you want a centered (more accurate) finite\n#             difference; on time-series, prefer pandas\n#             .diff() because it preserves index alignment\n#             and handles NaN.\n#             algorithms; np.gradient is the right tool for\n#             physics-style derivatives; pandas .diff handles\n#             irregular timestamps cleanly.\n#             (passes-pass spacing= for non-uniform); pandas\n#             alignment is per-row (slower than vectorized\n#             numpy diff for plain arrays).\n#\nimport numpy as np\na = np.array([1, 3, 6, 10, 15])\n# 1. Diff and cumsum are inverses (up to the missing first element)\nd = np.diff(a)\nnp.concatenate(([a[0]], a[0] + np.cumsum(d)))    # reconstructs a\n# 2. np.gradient — centered finite difference (better near boundaries)\nxs = np.linspace(0, 2 * np.pi, 100)\nys = np.sin(xs)\ndy_dx = np.gradient(ys, xs)                      # ~ cos(xs)\n# 3. Non-uniform spacing\nt = np.array([0.0, 0.1, 0.3, 0.6, 1.0])           # irregular\ny = np.array([0.0, 1.0, 4.0, 9.0, 16.0])\nnp.gradient(y, t)                                 # adapts to spacing\n# 4. Time-series in pandas — index-aware, NaN-safe\n# import pandas as pd\n# s.diff()                # day-over-day\n# s.diff(periods=7)       # week-over-week\n# s.pct_change()          # relative change\n# Decision rule:\n#   plain consecutive deltas                     -> np.diff(a)\n#   need same length as input                    -> np.diff(a, prepend=a[0])\n#   nth-order (e.g. discrete acceleration)       -> np.diff(a, n=2)\n#   centered / boundary-accurate                 -> np.gradient(y, x)\n#   non-uniform spacing                          -> np.gradient(y, t)  (NOT np.diff/dt)\n#   pandas time-series, NaN-safe                 -> Series.diff() / .pct_change()\n#   reconstruct values from diffs                -> a[0] + np.cumsum(d)\n#\n# Anti-pattern: forgetting np.diff shrinks the array, then misaligning indices\n#   diffs = np.diff(prices); pct = diffs / prices  # ValueError or wrong:\n#   diffs has length N-1, prices has length N. The pct change is\n#   diffs / prices[:-1] (or [1:] depending on convention). When in doubt\n#   use prepend= to keep the original length, or step up to pandas .pct_change()."
                  }
        ],
        tips: [
                  "Result has `len(a) - 1` elements — use `prepend=` or `append=` to preserve length",
                  "`np.all(np.diff(a) >= 0)` is the fastest way to check if an array is non-decreasing",
                  "`np.diff(a, n=2)` is the discrete second derivative — useful in signal processing",
                  "For pandas, `.diff()` is the equivalent and handles NaN correctly"
        ],
        mistake: "Expecting np.diff() to return the same length array. It always returns n fewer elements. Use `prepend=a[0]` to get the same length with 0 as the first difference.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "np-argmax",
        fn: "np.argmax() / np.argmin()",
        desc: "Return the index of the maximum or minimum value.",
        category: "Operations",
        subtitle: "Index not value — use along axis= for per-row or per-column",
        signature: "np.argmax(a, axis=None) | np.argmin(a, axis=None)",
        descLong: "argmax() returns the index of the maximum value, argmin() the minimum. Without axis= they operate on the flattened array. With axis= they return the index along that axis — one index per row or column. Use with fancy indexing to extract the max/min values themselves.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.argmax() / np.argmin() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             not the value. Use the index to fetch the value.\n#             distinguishes it from np.max (\"what is the max?\").\n#             trick for 2D flat indices.\n#\nimport numpy as np\na = np.array([3, 1, 4, 1, 5, 9, 2, 6])\nnp.argmax(a)              # 5  — index of 9\na[np.argmax(a)]           # 9  — value at that index"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.argmax() / np.argmin() — common patterns you'll see in production.\n# APPROACH  - Combine np.argmax() / np.argmin() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             axis=, unravel_index for converting a flat index\n#             back to (row, col), and the canonical \"fetch\n#             the row's max value\" pattern with arange.\n#             class extraction, finding the brightest pixel,\n#             ranking.\n#             FIRST occurrence), all-positions retrieval, or\n#             argpartition for top-K — senior tier.\n#\nimport numpy as np\nA = np.array([[3, 1, 4],\n              [1, 5, 9],\n              [2, 6, 2]])\n# axis= — index per column or per row\nnp.argmax(A, axis=0)              # max per COLUMN\nnp.argmax(A, axis=1)              # max per ROW\n# Flat index back to 2D coords\nidx = np.argmax(A)                # single flat index\nnp.unravel_index(idx, A.shape)    # (1, 2)\n# Fetch the row's max value using fancy indexing\nA[np.arange(A.shape[0]), np.argmax(A, axis=1)]   # [4, 9, 6]\n# argsort — indices that WOULD sort the array\norder = np.argsort(a)\na[order]                          # sorted ascending\na[np.argsort(a)[::-1]]            # sorted descending"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.argmax() / np.argmin() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (O(n) vs O(n log n) for full sort), use\n#             np.flatnonzero(a == a.max()) when ties matter,\n#             and reach for the canonical \"predicted class\n#             from logits\" pattern in ML code.\n#             argsort when you only need top-K; tie-aware\n#             retrieval is the right answer when the FIRST\n#             max is misleading; the ML predicted-class\n#             pattern is the canonical use of argmax in\n#             practice.\n#             are subtle (the rest is unordered); ties are\n#             actually-rare on float arrays so people forget\n#             until production data hits.\n#\nimport numpy as np\n# 1. Top-K via argpartition — O(n), much faster than full sort\narr = np.random.rand(1_000_000)\nk = 10\ntop_k_idx = np.argpartition(arr, -k)[-k:]    # K largest, unordered\ntop_k_idx = top_k_idx[np.argsort(arr[top_k_idx])[::-1]]   # then sort the K\ntop_k = arr[top_k_idx]\n# 2. ALL positions of the max (ties matter)\na = np.array([1, 5, 3, 5, 5])\nnp.argmax(a)                                  # 1   — first only\nnp.flatnonzero(a == a.max())                  # [1, 3, 4]  — all maxima\n# 3. ML pattern — predicted class from logits / probabilities\nlogits = np.random.randn(32, 10)              # (B, num_classes)\npreds  = logits.argmax(axis=1)                # (B,)  predicted class\n# 4. Combined with broadcasting — find the column of the row max\n# for each row in batch\nA = np.random.rand(8, 5)\ncol_of_max = A.argmax(axis=1)                 # (8,)\nrow_max    = A[np.arange(len(A)), col_of_max] # (8,)\n# Decision rule:\n#   single global index of max                   -> np.argmax(a)\n#   index along an axis                          -> np.argmax(a, axis=N)\n#   2D max position back to (row, col)           -> np.unravel_index(np.argmax(A), A.shape)\n#   top-K (small k vs n)                         -> np.argpartition(a, -k)[-k:]\n#   all positions where max occurs (ties)        -> np.flatnonzero(a == a.max())\n#   sorted indices (full ordering)               -> np.argsort(a)  (O(n log n))\n#   ML predicted class from logits/probs         -> logits.argmax(axis=-1)\n#\n# Anti-pattern: np.argmax(A) on a 2D array expecting per-row indices\n#   Without axis=, argmax returns a single FLAT index over the whole array,\n#   which is almost never what the caller wanted. For per-row max use\n#   A.argmax(axis=1); for per-column use axis=0; if you really did want a\n#   global 2D position, pair argmax with np.unravel_index(idx, A.shape)."
                  }
        ],
        tips: [
                  "`np.unravel_index(np.argmax(A), A.shape)` converts a flat index to (row, col)",
                  "`a[np.argmax(a)]` is equivalent to `np.max(a)` — but argmax gives you the position",
                  "`np.argsort(a)` returns indices that would sort the array — use for indirect sorting",
                  "For multiple max values (ties), argmax returns only the first — use `np.where(a == a.max())` for all"
        ],
        mistake: "Using `np.argmax(A)` on a 2D array expecting row-wise results. Without axis=, it returns the flat index. Use `np.argmax(A, axis=1)` for per-row max index.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([3, 1, 4, 1, 5, 9, 2, 6])\nnp.argmax(a)      # 5 — index of 9\nnp.argmin(a)      # 1 — index of first 1",
          concise: "np.argsort(a)[::-1]      # descending sort indices",
        },
      },
      {
        id: "np-sort",
        fn: "np.sort() / np.argsort()",
        desc: "Sort array values or get the sorting indices.",
        category: "Operations",
        subtitle: "np.sort returns a copy; a.sort() sorts in-place; argsort for indirect sort",
        signature: "np.sort(a, axis=-1) | a.sort() | np.argsort(a)",
        descLong: "np.sort() returns a sorted copy; the .sort() method sorts in-place. argsort() returns the indices that would sort the array — useful for sorting multiple arrays by the same order or getting rank. axis= controls which dimension is sorted.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.sort() / np.argsort() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             method sorts IN-PLACE. Pick deliberately.\n#             lines.\n#             sort.\n#\nimport numpy as np\na = np.array([3, 1, 4, 1, 5])\nnp.sort(a)               # [1 1 3 4 5]  — copy, a unchanged\na.sort()                 # in-place — a is now sorted"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.sort() / np.argsort() — common patterns you'll see in production.\n# APPROACH  - Combine np.sort() / np.argsort() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             [::-1], 2D axis=1 (per row) vs axis=0 (per\n#             col), argsort for indirect sort across multiple\n#             arrays, and rank via double argsort.\n#             code: rank rows, sort multiple arrays\n#             together, descending top-N.\n#             preservation or the \"sort by multiple keys\"\n#             pattern via lexsort — senior tier.\n#\nimport numpy as np\na = np.array([3, 1, 4, 1, 5, 9, 2, 6])\n# Descending — reverse the result\nnp.sort(a)[::-1]\n# 2D — pick the axis\nA = np.array([[3, 1, 4], [1, 5, 9]])\nnp.sort(A, axis=1)        # sort each row\nnp.sort(A, axis=0)        # sort each column\n# argsort — indices that sort\norder = np.argsort(a)\na[order]                  # sorted\n# Indirect: sort multiple arrays by one key\nnames  = np.array([\"Bob\", \"Alice\", \"Carol\"])\nscores = np.array([85, 92, 78])\norder  = np.argsort(scores)[::-1]      # descending by score\nnames[order]; scores[order]\n# Rank (0-based)\nnp.argsort(np.argsort(scores))         # [1, 2, 0]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.sort() / np.argsort() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             preserve insertion order; np.lexsort for\n#             multi-key sorts (last key is primary); reach\n#             for argpartition when only the top-K matters\n#             (faster than full sort).\n#             tie-aware ranking; lexsort is THE way to sort\n#             by (col1 ASC, col2 DESC) without converting to\n#             pandas; argpartition cuts O(n log n) to O(n)\n#             for top-K.\n#             counter-intuitive (read carefully); stable sort\n#             is slightly slower than the default; argpartition\n#             ordering inside the partition is unspecified.\n#\nimport numpy as np\n# 1. Stable sort — preserve original order on ties\na = np.array([3, 1, 4, 1, 5, 9, 2, 6])\norder = np.argsort(a, kind=\"stable\")\n# ties (the two 1s) keep their original positional order\n# 2. Multi-key sort with np.lexsort (LAST KEY IS PRIMARY)\nnames = np.array([\"Bob\", \"Alice\", \"Carol\", \"Alice\"])\nages  = np.array([30,    25,      30,      35])\n# Sort by name ASC, then age ASC within each name\norder = np.lexsort((ages, names))      # ages secondary, names primary\nnames[order]; ages[order]\n# 3. Top-K without full sort — np.argpartition is O(n)\narr = np.random.rand(1_000_000)\nk = 10\ntop_k_idx = np.argpartition(arr, -k)[-k:]            # K largest, unordered\ntop_k_idx = top_k_idx[np.argsort(arr[top_k_idx])[::-1]]\ntop_k = arr[top_k_idx]\n# Decision rule:\n#   small array OR full ordering needed          -> np.sort(a)\n#   in-place sort (no extra copy)                -> a.sort()\n#   ties must preserve original order            -> np.sort(a, kind=\"stable\")\n#   sort by multiple columns                     -> np.lexsort((secondary, primary))\n#   only top-K matters                           -> np.argpartition + small final sort\n#   indices that would sort (indirect sort)      -> np.argsort(a)\n#   descending                                   -> np.sort(a)[::-1] (no ascending= kwarg)\n#\n# Anti-pattern: sorted(arr.tolist()) on a NumPy array\n#   Round-trips through Python objects: O(n) box/unbox, loses dtype\n#   (int64 -> Python int), allocates a Python list, then forces a back-copy\n#   if you need an ndarray. np.sort(arr) is dtype-preserving, vectorized,\n#   and 5-50x faster on numeric arrays. Same for np.argsort over sorted(...)."
                  }
        ],
        tips: [
                  "`np.sort(a)` returns a copy; `a.sort()` is in-place — be explicit about which you want",
                  "`np.sort(a)[::-1]` for descending — there is no ascending=False argument in NumPy",
                  "`argsort` is the key to sorting multiple arrays by the same criterion",
                  "`np.argsort(np.argsort(a))` gives the rank of each element (0-based)"
        ],
        mistake: "Using `sorted(a.tolist())` to sort a NumPy array. This converts to Python list, loses dtype, and is much slower. Use `np.sort(a)` directly.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([3, 1, 4, 1, 5, 9, 2, 6])\nnp.sort(a)            # [1, 1, 2, 3, 4, 5, 6, 9]\na                     # unchanged",
          concise: "np.argsort(np.argsort(scores))   # [1, 2, 0] (0-based rank)",
        },
      },
      {
        id: "np-linalg",
        fn: "np.linalg",
        desc: "Linear algebra — solve systems, invert matrices, eigenvalues, SVD.",
        category: "Operations",
        subtitle: "solve() for linear systems, eig() for eigenvalues, svd() for decomposition",
        signature: "np.linalg.solve(A, b) | np.linalg.eig(A) | np.linalg.svd(A)",
        descLong: "np.linalg provides standard linear algebra routines. solve() solves Ax=b more stably than computing the inverse. eig() returns eigenvalues and eigenvectors. svd() decomposes a matrix for PCA and dimensionality reduction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.linalg — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             lines.\n#             stability) or the broader linalg toolkit.\n#\nimport numpy as np\nA = np.array([[2, 1], [-1, 3]], dtype=float)\nb = np.array([5, 10], dtype=float)\nx = np.linalg.solve(A, b)\nnp.allclose(A @ x, b)            # True"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.linalg — common patterns you'll see in production.\n# APPROACH  - Combine np.linalg with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             rank for invertibility checks, norms (vector L2,\n#             matrix Frobenius), eigendecomposition for\n#             characteristic analysis, SVD as the foundation\n#             of PCA, and lstsq for overdetermined systems.\n#             numerical / ML code.\n#             (condition number, ill-conditioned systems) or\n#             batched matrix ops — senior tier.\n#\nimport numpy as np\nA = np.array([[2, 1], [-1, 3]], dtype=float)\n# Solve Ax = b — preferred over inv (better numerics)\nb = np.array([5, 10], dtype=float)\nx = np.linalg.solve(A, b)\n# Properties\nnp.linalg.det(A)\nnp.linalg.matrix_rank(A)\nnp.linalg.norm(b)                # L2 vector norm\nnp.linalg.norm(A, \"fro\")         # Frobenius matrix norm\n# Eigendecomposition\neigvals, eigvecs = np.linalg.eig(A)\n# SVD — basis for PCA\nU, s, Vt = np.linalg.svd(A)\n# Least squares for overdetermined Ax ~ b\nA_tall = np.random.randn(100, 3)\nb_vec  = np.random.randn(100)\nx_ls, residuals, rank, sv = np.linalg.lstsq(A_tall, b_vec, rcond=None)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.linalg — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             solve), check condition number for stability,\n#             prefer scipy.linalg for advanced decompositions\n#             and batch-aware routines, and use np.linalg\n#             broadcasting for batches of small matrices.\n#             numerical hygiene rule; cond() flags\n#             ill-conditioned problems before they explode;\n#             batched broadcasting is how you do \"1000\n#             3x3 inversions\" without a Python loop.\n#             covers; condition checks add a small cost; batch\n#             linalg breaks if any matrix in the batch is\n#             singular.\n#\nimport numpy as np\n# 1. Numerical hygiene — check before solve\nA = np.array([[1.0, 2.0], [2.0, 4.0001]])\nnp.linalg.cond(A)                       # very large -> near-singular\n# Use np.linalg.lstsq for ill-conditioned systems instead of solve\n# 2. Batched matrix operations — broadcasting along leading axes\nbatch_A = np.random.randn(1000, 3, 3)\nbatch_b = np.random.randn(1000, 3)\nbatch_x = np.linalg.solve(batch_A, batch_b)        # vectorized over batch\n# 3. PCA via SVD on a centered data matrix\nX = np.random.randn(1000, 50)\nXc = X - X.mean(axis=0, keepdims=True)\nU, s, Vt = np.linalg.svd(Xc, full_matrices=False)\nexplained_var = s ** 2 / (len(X) - 1)\nX_2d = Xc @ Vt.T[:, :2]                            # project to 2 components\n# 4. When numpy isn't enough — scipy.linalg has more decompositions,\n#    explicit triangular solvers, sparse routines, etc.\n# from scipy.linalg import lu, qr, cholesky\n# Standing rule:\n#   inv(A) @ b   -> never\n#   solve(A, b)  -> always (well-conditioned)\n#   lstsq(A, b)  -> always (ill-conditioned or rectangular)\n#\n# Decision rule:\n#   square, well-conditioned Ax=b                -> np.linalg.solve(A, b)\n#   rectangular or ill-conditioned Ax~b          -> np.linalg.lstsq(A, b, rcond=None)\n#   need explicit determinant                    -> np.linalg.det(A) (rare in practice)\n#   eigen-decomposition (symmetric matrix)       -> np.linalg.eigh (faster, real eigvals)\n#   eigen-decomposition (general matrix)         -> np.linalg.eig\n#   PCA / dimensionality reduction               -> np.linalg.svd(X_centered, full_matrices=False)\n#   batched operations on small matrices         -> stack -> np.linalg.solve broadcasts\n#   advanced (LU, QR, Cholesky, sparse)          -> scipy.linalg / scipy.sparse.linalg\n#\n# Anti-pattern: x = np.linalg.inv(A) @ b\n#   Computing the explicit inverse is both slower (forms a full matrix) AND\n#   numerically less stable (amplifies ill-conditioning) than np.linalg.solve.\n#   It only ever wins if you reuse inv(A) against many b vectors at once —\n#   even then, factorize once with scipy.linalg.lu_factor and reuse the LU."
                  }
        ],
        tips: [
                  "`np.linalg.solve(A, b)` is more numerically stable than `np.linalg.inv(A) @ b` — always prefer solve",
                  "Check `np.linalg.cond(A)` before solving — a large condition number means the system is ill-conditioned",
                  "SVD is the foundation of PCA — the columns of U are the principal components",
                  "For batch matrix operations, numpy broadcasts along the first axes: `np.linalg.solve(batch_A, batch_b)`"
        ],
        mistake: "Using `np.linalg.inv(A) @ b` to solve a linear system. This is less numerically stable and slower than `np.linalg.solve(A, b)`. Always use solve().",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "np-einsum",
        fn: "np.einsum()",
        desc: "Express complex tensor operations with Einstein summation notation.",
        category: "Performance",
        subtitle: "Concise, fast tensor contractions — beats explicit loops",
        signature: "np.einsum(\"ij,jk->ik\", A, B)",
        descLong: "np.einsum() expresses tensor operations using Einstein summation notation. Repeated indices are summed over. It can express matrix multiply, dot products, outer products, traces, and batch operations concisely and efficiently.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.einsum() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             \"ij,jk->ik\" reads as \"shared index j gets\n#             summed; (i, k) survive in the output\".\n#             code; reading it once explains the rule.\n#             (transpose, trace, batch, element-wise) — those\n#             are where einsum earns its keep.\n#\nimport numpy as np\nA = np.random.randn(100, 50)\nB = np.random.randn(50, 30)\nnp.einsum(\"ij,jk->ik\", A, B)        # matrix multiply, same as A @ B"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.einsum() — common patterns you'll see in production.\n# APPROACH  - Combine np.einsum() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             product, element-wise multiply, axis sums,\n#             trace, transpose, and batched matrix multiply.\n#             Each as a one-line einsum.\n#             expresses most contraction patterns clearly.\n#             multi-tensor contractions or the \"@ is\n#             usually faster for simple cases\" rule —\n#             senior tier.\n#\nimport numpy as np\nA = np.random.randn(100, 50)\nv = np.random.randn(100)\nw = np.random.randn(100)\n# Dot product\nnp.einsum(\"i,i->\", v, w)                   # scalar\n# Outer product\nnp.einsum(\"i,j->ij\", v[:5], w[:5])         # (5, 5)\n# Element-wise multiply\nnp.einsum(\"i,i->i\", v, w)\n# Axis sums\nnp.einsum(\"ij->j\", A)                      # column sums  (== A.sum(axis=0))\nnp.einsum(\"ij->i\", A)                      # row sums\n# Trace\nnp.einsum(\"ii->\", A[:50, :50])             # == np.trace\n# Transpose\nnp.einsum(\"ij->ji\", A)                     # == A.T\n# Batched matrix multiply — b is the batch axis\nbatch_A = np.random.randn(10, 4, 3)\nbatch_B = np.random.randn(10, 3, 5)\nnp.einsum(\"bij,bjk->bik\", batch_A, batch_B)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.einsum() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             multi-tensor contractions (numpy picks the best\n#             contraction order), prefer @ / matmul / np.dot\n#             for simple matmul (often faster), and reach for\n#             einsum when the contraction is genuinely\n#             complex (attention, tensor train, multi-axis\n#             sum).\n#             contractions; explicit decision rule prevents\n#             einsum overuse; complex tensor ops are far more\n#             readable in einsum than chained reshape/matmul.\n#             for long expressions; einsum loses some perf vs\n#             specialized BLAS for large simple matmul; the\n#             notation is dense.\n#\nimport numpy as np\n# 1. Multi-tensor contraction with optimize=True\nA = np.random.randn(100, 50)\nB = np.random.randn(50, 30)\nC = np.random.randn(30, 20)\nout = np.einsum(\"ij,jk,kl->il\", A, B, C, optimize=True)\n# Internally numpy picks the best parenthesization\n# 2. Attention pattern — Q (B, H, T, D) @ K^T (B, H, D, T)\nB, H, T, D = 8, 12, 64, 64\nQ = np.random.randn(B, H, T, D).astype(np.float32)\nK = np.random.randn(B, H, T, D).astype(np.float32)\nscores = np.einsum(\"bhtd,bhsd->bhts\", Q, K)        # (B, H, T, T)\n# 3. Quick guide\n#   simple matmul (2D)              -> A @ B   (fastest, clearest)\n#   batch matmul (B, M, N) @ (B, N, K) -> A @ B  (broadcasts) or einsum\n#   tensor contraction over many axes  -> einsum (often the only readable option)\n#   chained 3+ tensor contraction      -> einsum(..., optimize=True)\n# 4. Mnemonic for reading einsum:\n#   \"indices that appear in BOTH inputs and NOT in output -> summed\"\n#   \"indices that appear in only one input AND in output -> kept\"\n#\n# Decision rule:\n#   simple 2D matmul                             -> A @ B (faster than einsum)\n#   batch matmul (..., M, N) @ (..., N, K)       -> A @ B (broadcasts cleanly)\n#   simple dot product / vector-matrix           -> np.dot / @ (clearer than einsum)\n#   transpose                                    -> A.T (NOT einsum(\"ij->ji\", A))\n#   axis sum / column sum                        -> A.sum(axis=...) (NOT einsum)\n#   contraction over many axes (attention, etc.) -> einsum (most readable)\n#   chained 3+ tensor contraction                -> einsum(..., optimize=True)\n#\n# Anti-pattern: reaching for einsum for ops that have a simpler builtin\n#   np.einsum(\"i,i->\", v, w)         # use np.dot(v, w)\n#   np.einsum(\"ij->ji\", A)           # use A.T\n#   np.einsum(\"ij->j\", A)            # use A.sum(axis=0)\n#   einsum is slower for these (no BLAS dispatch in the simple case) and\n#   harder to read at a glance. Save einsum for genuinely multi-axis ops."
                  }
        ],
        tips: [
                  "Subscripts: `ij,jk->ik` means contract over `j` — the shared index",
                  "Any omitted output index is summed over: `ij->i` sums along j (row sums)",
                  "einsum with `optimize=True` finds the most efficient contraction order",
                  "For simple matrix ops, `@` and `np.dot` are often faster — use einsum for complex contractions"
        ],
        mistake: "Writing einsum without the output subscript for operations that should not sum. `np.einsum(\"ij,ij\", A, B)` sums everything; `np.einsum(\"ij,ij->ij\", A, B)` is element-wise multiply.",
        shorthand: {
          verbose: "import numpy as np\nA = np.random.randn(100, 50)\nB = np.random.randn(50, 30)\nv = np.random.randn(100)",
          concise: "np.einsum('ij->ji', A)    # same as A.T",
        },
      },
      {
        id: "np-dtype-perf",
        fn: "dtype optimization",
        desc: "Choose numeric types to reduce memory and increase speed.",
        category: "Operations",
        subtitle: "float32 halves memory; C-contiguous layout is fastest",
        signature: "a.astype(np.float32) | np.ascontiguousarray(a)",
        descLong: "NumPy performance depends heavily on dtype and memory layout. float32 uses half the memory of float64. C-contiguous arrays (row-major) are fastest for row operations; Fortran-contiguous (column-major) for column operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dtype optimization — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             with .nbytes / .itemsize.\n#             halves memory vs the default float64.\n#             the np.vectorize trap.\n#\nimport numpy as np\na = np.arange(1_000_000, dtype=np.float32)\na.itemsize, a.nbytes        # (4, 4_000_000)   — half of float64"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dtype optimization — common patterns you'll see in production.\n# APPROACH  - Combine dtype optimization with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             in-place ops to avoid allocations, contiguity\n#             checks before C-extension boundaries, and the\n#             out= argument for explicit destination buffers.\n#             memory, no copies, contiguous layout, no\n#             temporary allocations.\n#             to choose between numpy / numba / cython for\n#             real bottlenecks — senior tier.\n#\nimport numpy as np\n# Memory: pick the smallest correct dtype\n# float64 (default) 8B  | float32 4B\n# int64             8B  | int32 4B  | int16 2B  | bool 1B\na = np.arange(1e6, dtype=np.float32)\n# Convert (always a copy)\na.astype(np.float32)\na.astype(np.int32)\n# Check contiguity\na.flags[\"C_CONTIGUOUS\"]\na.flags[\"F_CONTIGUOUS\"]\na = np.ascontiguousarray(a)            # force C-order\n# In-place math — no allocation\na += 1\na *= 2\n# Explicit output buffer\nb = np.random.rand(len(a)).astype(np.float32)\nnp.add(a, b, out=a)                    # writes into a's memory"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dtype optimization — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             optimizing; reach for the right tool by tier\n#             (vectorized -> numexpr -> numba -> Cython);\n#             pin dtype at the boundary (load time / config),\n#             not deep in functions; np.vectorize is NOT a\n#             speedup — it's a Python loop in disguise.\n#             decision tree experts use; calling out the\n#             np.vectorize myth saves people from a common\n#             trap; boundary-pinning prevents silent\n#             precision loss.\n#             setup is its own learning curve; some specialized\n#             BLAS-friendly ops are already at peak perf with\n#             plain numpy.\n#\nimport numpy as np\n# 1. Profile FIRST, optimize SECOND\n# %timeit fn(arr)             # in Jupyter\n# import cProfile; cProfile.run(\"fn(arr)\")\n# Identify the actual bottleneck before changing anything.\n# 2. Tier of optimization tools\n#    a) Pure numpy vectorization — the default; usually enough\n#    b) numexpr (out-of-core, multi-thread) for chained float ops\n#    c) numba @njit when numpy alone isn't fast enough\n#    d) Cython / C extension for the last 2-3x\n# import numexpr as ne\n# ne.evaluate(\"a*b + c*d\")               # 2-4x faster than chained numpy\n# from numba import njit\n# @njit\n# def kernel(a, b):                       # JIT-compiled to C-level speed\n#     out = np.empty_like(a)\n#     for i in range(len(a)):\n#         out[i] = a[i] * a[i] + b[i]\n#     return out\n# 3. Pin dtype at the boundary, not in helpers\ndef load_data(path: str) -> np.ndarray:\n    arr = np.load(path).astype(np.float32, copy=False)\n    return np.ascontiguousarray(arr)\n# 4. Common pitfalls\n#    np.vectorize(fn)         # Python loop in disguise — no speedup\n#    np.append in a loop      # O(n^2) — collect then concatenate once\n#    inv(A) @ b               # numerically unstable — use solve(A, b)\n#    repeated reshape/copy    # check .flags first; ascontiguousarray once\n# Decision rule:\n#   default numeric work                         -> plain numpy + correct dtype\n#   memory-tight inner loop                      -> in-place += / *= / out= kwarg\n#   chained pure-float ufuncs (a*b + c*d)        -> numexpr.evaluate(\"...\")\n#   custom scalar kernel needed                  -> numba @njit (or @vectorize)\n#   want last 2-3x for a known hot path          -> Cython / C extension\n#   moving to GPU                                -> cupy (numpy-compatible) or torch\n#   I/O or Python-dominated time                 -> profile first; numpy won't help\n#   half-precision OK (ML inference)             -> dtype=np.float16 (smaller, watch overflow)\n#\n# Anti-pattern: pre-emptively rewriting numpy code in numba/cython \"for speed\"\n#   The optimization order is: (1) profile to confirm the bottleneck,\n#   (2) try plain numpy vectorization (often gets 90%), (3) numexpr or numba\n#   only for proven hot paths. Jumping to numba/cython first costs build\n#   complexity and dependencies for code that wasn't actually the bottleneck."
                  }
        ],
        tips: [
                  "float32 is acceptable for most ML tasks and halves memory vs float64",
                  "In-place operations (`+=`, `*=`) avoid allocating a new array — critical in memory-bound loops",
                  "`np.add(a, b, out=a)` is the most explicit in-place operation",
                  "Avoid repeated concatenation in a loop — allocate the result array first with `np.empty(final_shape)` and fill it"
        ],
        mistake: "Using `np.vectorize()` thinking it speeds things up. It is a convenience wrapper that loops in Python — same speed as a for loop. Use actual ufuncs or Numba for real speedup.",
        shorthand: {
          verbose: "import numpy as np\na = np.arange(1e6, dtype=np.float32)   # 4MB vs 8MB\na.itemsize   # 4\na.nbytes     # 4000000",
          concise: "np.add(a, b, out=a)    # explicit output array",
        },
      },
    ],
  },

  // ── Section 4: Shape & Structure ─────────────────────────────────────────
  {
    id: "shape",
    title: "Shape & Structure",
    entries: [
      {
        id: "reshape",
        fn: "np.reshape()",
        desc: "Change the shape of an array without changing its data.",
        category: "Shape",
        subtitle: "Use -1 to infer one dimension — returns a view when possible",
        signature: "a.reshape(3, 4) | a.reshape(-1, 4) | a.ravel()",
        descLong: "reshape() changes the dimensions of an array. The total number of elements must remain the same. Use -1 for one dimension and NumPy infers it. reshape() returns a view when possible — modifying it modifies the original.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.reshape() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             element count must stay the same.\n#             distinction, or newaxis for broadcasting.\n#\nimport numpy as np\na = np.arange(12)\na.reshape(3, 4)              # 12 elements -> 3x4 matrix"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.reshape() — common patterns you'll see in production.\n# APPROACH  - Combine np.reshape() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             dim, transpose with .T, add/remove size-1 axes\n#             with newaxis/squeeze, and the column-vector\n#             trick that makes broadcasting work.\n#             daily; -1 + reshape is the most useful idiom\n#             for \"I know columns, infer rows\".\n#             or contiguity issues for downstream consumers\n#             — senior tier.\n#\nimport numpy as np\na = np.arange(12)\n# -1 = \"infer this dimension\"\na.reshape(3, -1)             # (3, 4)\na.reshape(-1, 4)             # (3, 4)\na.reshape(-1)                # (12,)  — flatten to 1D\n# Transpose — free O(1), returns a view\nA = a.reshape(3, 4)\nA.T                          # (4, 3) view\n# Add / remove size-1 dimensions\nv = np.array([1, 2, 3])\nv[np.newaxis, :]             # (1, 3)  — row vector\nv[:, np.newaxis]             # (3, 1)  — column vector (broadcast-ready)\nnp.expand_dims(v, axis=0)    # same as v[np.newaxis, :]\nnp.squeeze(np.array([[[1, 2, 3]]]))   # remove all size-1 dims"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.reshape() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             always-copy), check contiguity before passing\n#             reshaped arrays to C extensions, prefer\n#             np.ascontiguousarray when shape changes leave a\n#             non-contiguous result, and use shape assertions\n#             at function boundaries.\n#             contiguous; contiguity checks prevent silent\n#             copies at C-extension boundaries; shape asserts\n#             catch mistakes early.\n#             isn't contiguous), so the \"no copy\" guarantee\n#             is conditional; ascontiguousarray costs a copy\n#             when needed; shape asserts add a few lines of\n#             ceremony.\n#\nimport numpy as np\na = np.arange(12).reshape(3, 4)\n# 1. Flatten vs ravel — view-when-possible vs always-copy\nflat_view = a.ravel()                # view if a is contiguous\nflat_copy = a.flatten()              # always a new array\n# 2. Reshape can return a non-contiguous view — check before\n#    handing to C extensions\nb = a.T.reshape(2, 6)                # may not be contiguous\nb.flags[\"C_CONTIGUOUS\"]              # check\nbuf = np.ascontiguousarray(b)        # forced contiguous, dtype-preserved\n# 3. Shape assertions at function boundaries\ndef take_batch(x: np.ndarray) -> np.ndarray:\n    assert x.ndim == 3 and x.shape[1:] == (64, 64), (\n        f\"expected (B, 64, 64); got {x.shape}\"\n    )\n    return x.reshape(x.shape[0], -1)         # flatten each sample\n# 4. Common ML reshapes\nimages = np.random.rand(32, 64, 64)          # (B, H, W)\nflat   = images.reshape(32, -1)              # (B, 64*64)\nchw    = images[:, np.newaxis, :, :]         # (B, 1, H, W)  add channel axis\n# Anti-pattern: assuming reshape is free\n#   reshape on a non-contiguous strided view -> may COPY silently\n# Right: check .flags[\"C_CONTIGUOUS\"] when handing buffers across\n# library boundaries (torch.from_numpy, ctypes, cython).\n#\n# Decision rule:\n#   know shape exactly                           -> a.reshape(rows, cols)\n#   know one dim, infer other                    -> a.reshape(-1, cols) or a.reshape(rows, -1)\n#   flatten to 1D, prefer view                   -> a.ravel()\n#   flatten to 1D, want a copy                   -> a.flatten()\n#   add a size-1 axis (broadcast prep)           -> a[:, None] or a[np.newaxis, :]\n#   remove all size-1 axes                       -> np.squeeze(a)\n#   transpose                                    -> a.T (view, free)\n#   need contiguous after reshape (for C/torch)  -> np.ascontiguousarray(a.reshape(...))"
                  }
        ],
        tips: [
                  "`-1` in reshape means \"infer this dimension\" — `a.reshape(-1, 4)` always gives 4 columns",
                  "`a.T` is a free O(1) transposition — it is a view, not a copy",
                  "`a.ravel()` returns a view when the array is contiguous; `a.flatten()` always copies",
                  "`np.newaxis` is just `None` — `a[None, :]` works too, but `np.newaxis` is more readable",
                  "reshape is not free on non-contiguous strided views — it may silently copy. Check `a.flags[\"C_CONTIGUOUS\"]` before handing buffers to torch/ctypes/cython"
        ],
        mistake: "Confusing `reshape(-1)` with `flatten()`. `reshape(-1)` returns a view (when possible); `flatten()` always returns a copy.",
        shorthand: {
          verbose: "import numpy as np\na = np.arange(12)\na.reshape(3, 4)          # shape (12,) → (3, 4)\na.reshape(2, 2, 3)       # → (2, 2, 3)",
          concise: "v.reshape(-1, 1)         # (3,1) column vector",
        },
      },
      {
        id: "np-stack",
        fn: "np.stack()",
        desc: "Join arrays along a NEW axis.",
        category: "Shape",
        subtitle: "All arrays must have identical shapes — creates one new dimension",
        signature: "np.stack([a, b, c], axis=0)",
        descLong: "np.stack() joins a sequence of arrays along a new axis. All input arrays must have exactly the same shape. The result has one more dimension than the inputs. axis= controls where the new dimension is inserted.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.stack() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             axis=0 stacks vertically, axis=1 column-wise.\n#             it ADDS a dimension.\n#             show how the choice maps to \"batch axis\" in ML.\n#\nimport numpy as np\na = np.array([1, 2, 3])      # shape (3,)\nb = np.array([4, 5, 6])      # shape (3,)\nnp.stack([a, b], axis=0)     # shape (2, 3)\nnp.stack([a, b], axis=1)     # shape (3, 2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.stack() — common patterns you'll see in production.\n# APPROACH  - Combine np.stack() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             along a new batch axis (the canonical ML\n#             pattern), the vstack/hstack convenience\n#             wrappers, and the rule that stack REQUIRES\n#             matching shapes.\n#             list of (H, W) arrays into a (B, H, W) batch.\n#             decision rule explicitly or the slow-loop\n#             anti-pattern — senior tier.\n#\nimport numpy as np\n# 2D inputs — stack creates a NEW dimension at axis=\nA = np.ones((3, 4))\nB = np.ones((3, 4))\nnp.stack([A, B], axis=0)             # (2, 3, 4)  new batch dim at front\nnp.stack([A, B], axis=2)             # (3, 4, 2)  new dim at back\n# Build a batch from a list of same-shape samples\nsamples = [np.random.randn(64, 64) for _ in range(32)]\nbatch = np.stack(samples, axis=0)    # (32, 64, 64)\n# Convenience wrappers — but be careful what they actually do\nnp.vstack([a, b])                    # for 1D this is stack(axis=0)\nnp.hstack([a, b])                    # for 1D this is concatenate (NOT stack)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.stack() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             stack/concatenate in a loop (O(n^2)); collect into\n#             a list and stack once; pre-allocate when shapes\n#             are known up front; pick stack vs concatenate\n#             based on \"new axis\" vs \"extend existing axis\".\n#             pre-allocation is even faster when shapes are\n#             known; the decision rule eliminates the\n#             stack/concatenate confusion entirely.\n#             array; pre-allocation requires knowing the\n#             count in advance; very large stacks may want\n#             explicit dtype/order to avoid copies.\n#\nimport numpy as np\n# 1. Anti-pattern: accumulate by repeated stack — O(n^2)\n# batch = np.empty((0, 64, 64))\n# for sample in samples:\n#     batch = np.concatenate([batch, sample[None]], axis=0)   # SLOW\n# 2. Right: collect into a list, stack once\nbuf = []\nfor sample in samples:\n    buf.append(process(sample))\nbatch = np.stack(buf, axis=0)          # one allocation\n# 3. Faster still: pre-allocate when shapes are known\nbatch = np.empty((len(samples), 64, 64), dtype=np.float32)\nfor i, sample in enumerate(samples):\n    batch[i] = process(sample)         # write in-place, zero copies\n# 4. Quick guide: stack vs concatenate\n#    \"I have N items, I want N to become a NEW axis\"          -> stack\n#    \"I have arrays I want to extend along an EXISTING axis\"  -> concatenate\n#\n#    np.stack([(H,W), (H,W)], axis=0)        -> (2, H, W)        new axis\n#    np.concatenate([(H,W), (H,W)], axis=0)  -> (2*H, W)         extends rows\n# 5. vstack/hstack/dstack — readable but easy to misuse\n#    vstack([1D_a, 1D_b]) -> (2, N)     stack-like\n#    vstack([2D_a, 2D_b]) -> (Ra+Rb, C) concatenate-like\n#    Pick stack/concatenate explicitly when the array dim might vary.\n#\n# Decision rule:\n#   N items become a NEW axis (build a batch)    -> np.stack([...], axis=0)\n#   extend an EXISTING axis (more rows / cols)   -> np.concatenate([...], axis=k)\n#   1D arrays as columns of a 2D matrix          -> np.column_stack(arrays)\n#   building a batch from a known count          -> pre-allocate np.empty + index-write\n#   building incrementally, count unknown        -> append to list, np.stack ONCE at end\n#   need same axis convention but unsure dim     -> np.stack/concatenate explicitly (NOT vstack)\n#   stacking samples from a generator            -> np.fromiter or list-then-stack\n#\n# Anti-pattern: growing a batch via repeated np.stack/np.concatenate in a loop\n#   batch = np.empty((0, 64, 64))\n#   for s in samples:\n#       batch = np.concatenate([batch, s[None]], axis=0)   # O(n^2) — copies every iter\n#   Right: collect into a Python list and stack ONCE at the end, OR pre-allocate\n#   np.empty((N, 64, 64), dtype=...) up front and write batch[i] = s."
                  }
        ],
        tips: [
                  "`np.stack()` requires all arrays to have the **exact same shape** — use `np.concatenate()` for different sizes",
                  "`axis=0` (default) adds the new axis at the front — `axis=-1` adds it at the back",
                  "Stack is conceptually \"adding a new dimension\" — concatenate is \"extending an existing one\"",
                  "`np.vstack` is `stack(axis=0)` for 1D, but `concatenate(axis=0)` for 2D+ — be careful",
                  "Collect samples into a Python list and stack ONCE at the end — repeated stack/concatenate inside a loop is O(n²) because each call copies the growing buffer"
        ],
        mistake: "Confusing `np.stack` and `np.concatenate`. stack([shape(3,)], [shape(3,)]) → shape (2,3) — new axis. concatenate([shape(3,)], [shape(3,)]) → shape (6,) — extended axis.",
        shorthand: {
          verbose: "import pandas as pd\nimport numpy as np\na = np.array([1, 2, 3])   # shape (3,)\nb = np.array([4, 5, 6])   # shape (3,)",
          concise: "np.hstack([a, b])           # concatenate along axis 1 (not stack)",
        },
      },
      {
        id: "np-concatenate",
        fn: "np.concatenate()",
        desc: "Join arrays along an EXISTING axis.",
        category: "Shape",
        subtitle: "Shapes must match on all axes except the concatenation axis",
        signature: "np.concatenate([a, b], axis=0)",
        descLong: "np.concatenate() joins arrays along an existing axis. Input shapes must match on every axis except the one being concatenated. No new dimensions are created. np.vstack, hstack, dstack, and column_stack are convenience wrappers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.concatenate() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             dimension is added. Shapes must match on every\n#             axis except the one being concatenated.\n#             \"put these next to each other\".\n#             split() inverse — junior tier.\n#\nimport numpy as np\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])\nnp.concatenate([a, b])         # [1, 2, 3, 4, 5, 6]\nnp.concatenate([a, b, a])      # [1, 2, 3, 4, 5, 6, 1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.concatenate() — common patterns you'll see in production.\n# APPROACH  - Combine np.concatenate() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             column joins via axis=, the vstack/hstack/\n#             column_stack/dstack convenience family, and\n#             np.split as the inverse.\n#             stack rows, stack columns, build a feature\n#             matrix from 1D arrays, split a result back into\n#             chunks.\n#             O(n^2)\" anti-pattern or the dtype-promotion\n#             trap — senior tier.\n#\nimport numpy as np\nA = np.array([[1, 2], [3, 4]])\nB = np.array([[5, 6], [7, 8]])\n# Row-wise (axis=0) and column-wise (axis=1)\nnp.concatenate([A, B], axis=0)         # (4, 2)\nnp.concatenate([A, B], axis=1)         # (2, 4)\n# Convenience wrappers\nnp.vstack([A, B])                      # axis=0 for 2D+\nnp.hstack([A, B])                      # axis=1 for 2D+\nnp.column_stack([np.array([1, 2, 3]),  # 1D arrays as columns\n                  np.array([4, 5, 6])]) # -> (3, 2)\nnp.dstack([A, B])                       # axis=2 (depth)\n# Inverse: split\nnp.split(np.arange(12), 3)             # 3 equal parts\nnp.split(np.arange(12), [3, 7])        # split at indices 3 and 7\nnp.array_split(np.arange(11), 3)       # allow unequal splits"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.concatenate() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             repeatedly in a loop (O(n^2)); pre-allocate or\n#             collect-then-concatenate; align dtypes before\n#             joining (silent promotion to object kills\n#             performance); pick concatenate vs stack vs r_/c_\n#             on purpose.\n#             scalable approach; explicit dtype alignment\n#             prevents object-dtype fallback; r_/c_ are\n#             concise alternatives for ad-hoc joins.\n#             array (no avoiding it); dtype alignment adds a\n#             pre-flight check; r_/c_ syntax is dense.\n#\nimport numpy as np\n# 1. Anti-pattern: O(n^2) concat in a loop\n# out = np.array([])\n# for chunk in chunks:\n#     out = np.concatenate([out, chunk])      # copies whole array each step\n# 2. Right: collect, concatenate once\nparts = []\nfor chunk in chunks:\n    parts.append(process(chunk))\nbig = np.concatenate(parts)                    # one allocation\n# 3. Even better when shapes/dtypes are known: pre-allocate\ntotal_len = sum(len(c) for c in chunks)\nbig = np.empty(total_len, dtype=np.float32)\ni = 0\nfor c in chunks:\n    big[i:i + len(c)] = c\n    i += len(c)\n# 4. Dtype alignment — avoid silent object fallback\nA = np.array([1, 2, 3], dtype=np.int32)\nB = np.array([4.0, 5.0, 6.0], dtype=np.float64)\nnp.concatenate([A, B]).dtype                   # promotes to float64 — OK\n# But mixing object with numeric collapses to object — performance dies:\n# np.concatenate([np.array([1, 2]), np.array([\"a\"])])  -> object dtype\n# 5. r_ / c_ — concise alternatives for inline use\nnp.r_[1:5, 0, 0, [10, 20, 30]]                 # 1D row-wise concat\nnp.c_[np.array([1, 2, 3]), np.array([4, 5, 6])] # 1D arrays as columns -> (3,2)\n# Decision rule:\n#   extend existing axis (more rows / cols)      -> np.concatenate(arrays, axis=k)\n#   create a NEW axis (build a batch)            -> np.stack(arrays, axis=k)\n#   1D arrays as columns of a 2D matrix          -> np.column_stack or np.c_\n#   inline ad-hoc 1D joins                       -> np.r_[a, b, [10, 20]]\n#   stack RGB channels into (H, W, 3)            -> np.dstack or np.stack(axis=-1)\n#   need to flatten then concat                  -> np.concatenate([...], axis=None)\n#   inverse — split a big array                  -> np.split / np.array_split\n#\n# Anti-pattern: out = np.array([]); for c in chunks: out = np.concatenate([out, c])\n#   Each iteration allocates a NEW array of the cumulative size and copies\n#   everything seen so far — total O(n^2) work and O(n) peak memory churn.\n#   Fix: append to a Python list and call np.concatenate(parts) ONCE at the\n#   end, or pre-allocate np.empty(total_len) and slice-assign each chunk."
                  }
        ],
        tips: [
                  "All shapes must match **except** on the concatenation axis",
                  "`np.column_stack([a, b])` treats 1D arrays as columns — handy for building feature matrices",
                  "Avoid repeated concatenation in a loop — it is O(n²). Collect in a list then concatenate once",
                  "`axis=None` first flattens all arrays then concatenates — same as `np.concatenate([a.ravel(), b.ravel()])`"
        ],
        mistake: "Concatenating in a loop: `result = np.concatenate([result, new_row])` on each iteration is O(n²). Append to a Python list, then call `np.concatenate(list)` once at the end.",
        shorthand: {
          verbose: "import pandas as pd\nimport numpy as np\na = np.array([1, 2, 3])\nb = np.array([4, 5, 6])",
          concise: "np.array_split(a, 5)             # allow unequal splits",
        },
      },
      {
        id: "np-tile",
        fn: "np.tile()",
        desc: "Repeat an entire array a specified number of times.",
        category: "Shape",
        subtitle: "Copies the whole array along new axes — useful for broadcasting",
        signature: "np.tile(a, reps)",
        descLong: "np.tile() repeats the entire array a specified number of times. Unlike repeat, which duplicates individual elements, tile copies the whole array structure. Use for broadcasting setup, creating test data, and expanding arrays for element-wise operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.tile() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             tile = \"copy the tape\".\n#             distinguishes tile from repeat.\n#             alternatives, or the memory cost of materializing\n#             a tiled array.\n#\nimport numpy as np\na = np.array([1, 2, 3])\nnp.tile(a, 3)            # [1, 2, 3, 1, 2, 3, 1, 2, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.tile() — common patterns you'll see in production.\n# APPROACH  - Combine np.tile() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (rows, cols), expanding a 1D weight vector to 2D\n#             so it can multiply a 2D matrix, and the\n#             tile-vs-repeat distinction.\n#             though broadcasting itself usually wins (senior).\n#             broadcasting would have done the same job for\n#             free — senior tier covers this.\n#\nimport numpy as np\na = np.array([1, 2, 3])\n# 2D tiling — (rows, cols)\nnp.tile(a, (2, 3))                       # 2 rows, each = a tiled 3x\n# Expand 1D weights to 2D\nweights = np.array([0.5, 0.3, 0.2])\nnp.tile(weights, (100, 1))               # (100, 3)  — same weights per row\n# tile copies the WHOLE array; repeat duplicates each ELEMENT\nnp.tile([1, 2, 3], 2)                    # [1, 2, 3, 1, 2, 3]\nnp.repeat([1, 2, 3], 2)                  # [1, 1, 2, 2, 3, 3]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.tile() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             np.tile whenever possible. Tiling materializes\n#             the array (real memory cost); broadcasting is\n#             free (zero-allocation virtual repeat). Reach for\n#             tile only when an actual contiguous, repeated\n#             buffer is needed (interfacing with C, exporting\n#             a CSV, etc.).\n#             frames; explicit np.broadcast_to documents\n#             intent; sticking to tile only when materialization\n#             is required keeps memory bounded.\n#             is sometimes the only option (some libraries\n#             reject broadcast views); reasoning about\n#             broadcasting requires understanding shape rules.\n#\nimport numpy as np\nX = np.random.rand(100, 3)               # 100 samples, 3 features\nweights = np.array([0.5, 0.3, 0.2])\n# Tile materializes a copy — wasteful for plain element-wise math\nW_tile = np.tile(weights, (100, 1))      # allocates 100*3 floats\nout_tile = X * W_tile\n# Broadcasting — same result, zero extra memory\nout_bcast = X * weights                  # weights virtually broadcast to (100, 3)\n# When you NEED an explicit broadcast view (read-only, no copy)\nW_view = np.broadcast_to(weights, (100, 3))   # zero-alloc, read-only\n# When tile is actually the right tool\n#   - exporting a repeated row to CSV (need a real buffer)\n#   - feeding a C extension that demands contiguous memory\n#   - pre-padding before in-place writes\nbuffer = np.tile([0.0, 0.0], (10000, 1))      # real (10000, 2) buffer\n# Decision rule:\n#   element-wise math against a 1D vector        -> broadcast (free, no allocation)\n#   need a real, writable buffer                 -> np.tile(a, reps)\n#   need a read-only virtual view                -> np.broadcast_to(a, shape)\n#   repeat each element (NOT the array)          -> np.repeat(a, n)\n#   need to expand for cross-product math        -> [:, None] / [None, :] (broadcast)\n#   exporting repeated rows for CSV/C buffer     -> np.tile (must materialize)\n#   building a constant-filled array             -> np.full (NOT tile of [val])\n#\n# Anti-pattern: np.tile(weights, (N, 1)) just to multiply a (N, k) matrix\n#   X * np.tile(weights, (N, 1))   # allocates an N*k copy of weights\n#   Broadcasting does the same math for free: X * weights — NumPy virtually\n#   expands the 1D vector along the leading axis with zero allocation. Only\n#   reach for tile when a downstream consumer (C code, CSV writer, in-place\n#   sink) genuinely needs a contiguous repeated buffer."
                  }
        ],
        tips: [
                  "`np.tile(a, (rows, cols))` is the standard way to expand a 1D array to 2D for broadcasting",
                  "tile repeats the entire array structure — use repeat() to duplicate individual elements",
                  "For memory efficiency, use broadcasting instead of tile when possible — tile creates a copy",
                  "Mnemonic: tile = \"copy the whole tape\"; repeat = \"stutter each element\"",
                  "When you need a read-only virtual view (no allocation), reach for `np.broadcast_to` — tile only when you need a real writable buffer"
        ],
        mistake: "Confusing tile and repeat. `np.tile([1,2,3], 2)` gives [1,2,3,1,2,3]. `np.repeat([1,2,3], 2)` gives [1,1,2,2,3,3]. They are opposite operations.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "np-repeat",
        fn: "np.repeat()",
        desc: "Repeat each individual element of an array.",
        category: "Shape",
        subtitle: "Duplicates each element — not the whole array",
        signature: "np.repeat(a, repeats, axis=None)",
        descLong: "np.repeat() repeats each individual element of an array a specified number of times. Unlike tile, which copies the whole array, repeat duplicates individual elements. You can specify different repeat counts for each element or apply repetition along a specific axis.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of np.repeat() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             repeat = \"stutter each element\".\n#             tile is immediate.\n#             the axis= argument for 2D arrays.\n#\nimport numpy as np\na = np.array([1, 2, 3])\nnp.repeat(a, 3)              # [1, 1, 1, 2, 2, 2, 3, 3, 3]\nnp.repeat(a, 2)              # [1, 1, 2, 2, 3, 3]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of np.repeat() — common patterns you'll see in production.\n# APPROACH  - Combine np.repeat() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             counts (different N per element), axis-aware\n#             repeat for 2D arrays (rows or columns), and the\n#             default axis=None which flattens-then-repeats.\n#             a label vector, expand groups, \"explode\"\n#             group-counts.\n#             trade-off or the broadcasting alternative —\n#             senior tier.\n#\nimport numpy as np\na = np.array([1, 2, 3])\n# Variable counts — duplicate each element a different N times\nnp.repeat(a, [1, 2, 3])              # [1, 2, 2, 3, 3, 3]\n# 2D — pick the axis\nA = np.array([[1, 2], [3, 4]])\nnp.repeat(A, 2, axis=0)              # repeat each ROW twice\n# [[1, 2], [1, 2], [3, 4], [3, 4]]\nnp.repeat(A, 2, axis=1)              # repeat each COL twice\n# [[1, 1, 2, 2], [3, 3, 4, 4]]\n# axis=None (default) flattens first\nnp.repeat(A, 2)                      # [1, 1, 2, 2, 3, 3, 4, 4]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of np.repeat() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             group-counts column to a full label vector,\n#             building a \"row index\" alongside group sizes,\n#             and the tile-vs-repeat decision rule. For\n#             pandas-shaped data, prefer pd.DataFrame.explode\n#             over manual repeat.\n#             how repeat shows up in real ETL; combining\n#             repeat with arange yields the canonical row-id\n#             vector for ungrouped reconstruction.\n#             for huge expansions consider streaming or\n#             sparse representations; pandas explode handles\n#             missing/empty groups more gracefully.\n#\nimport numpy as np\n# 1. Expand group counts to a full label vector\ngroups = np.array([\"A\", \"B\", \"C\"])\nsizes  = np.array([2, 3, 1])\nlabels = np.repeat(groups, sizes)        # ['A', 'A', 'B', 'B', 'B', 'C']\n# 2. Reconstruct group-id alongside the labels\ngroup_ids = np.repeat(np.arange(len(sizes)), sizes)\n# [0, 0, 1, 1, 1, 2]\n# 3. Quick guide\n#    duplicate each ELEMENT             -> np.repeat\n#    duplicate the WHOLE array          -> np.tile\n#    expand a list-column in pandas     -> df.explode(\"col\")\n#    just want broadcasting             -> nothing — let numpy do it\n# 4. Mnemonic\n#    repeat([1,2,3], 2) -> [1, 1, 2, 2, 3, 3]    \"stutter each\"\n#    tile  ([1,2,3], 2) -> [1, 2, 3, 1, 2, 3]    \"copy the tape\"\n# Anti-pattern (legacy): using repeat where broadcasting would do\n# big = np.repeat(weights[None, :], n_rows, axis=0)    # materializes copy\n# Right (zero-alloc):\n# X * weights   # numpy broadcasts weights to match X automatically\n#\n# Decision rule:\n#   stutter each element a fixed N times         -> np.repeat(a, n)\n#   stutter each element a DIFFERENT N times     -> np.repeat(a, [n0, n1, n2, ...])\n#   repeat each row of a 2D array                -> np.repeat(A, n, axis=0)\n#   repeat the WHOLE array                       -> np.tile(a, reps)\n#   expand group-counts to a label vector        -> np.repeat(groups, sizes)\n#   build a row-id alongside groups              -> np.repeat(np.arange(k), sizes)\n#   pandas list-column                           -> df.explode(\"col\")\n#   just need element-wise alignment             -> broadcasting (no allocation)\n#\n# Anti-pattern: np.repeat(weights[None, :], n_rows, axis=0) to broadcast-prep\n#   Materializes a real (n_rows, k) copy of weights just to multiply against\n#   X of the same shape. NumPy already broadcasts the 1D weights for free —\n#   X * weights does the same math with zero extra allocation. Only use\n#   np.repeat when you genuinely need the expanded values stored (e.g. as a\n#   label vector aligned with another array)."
                  }
        ],
        tips: [
                  "`np.repeat(a, counts)` with a list repeats each element a different number of times",
                  "repeat() with axis duplicates along that axis; axis=None flattens first",
                  "Use repeat() to upsample data or expand labels for broadcasting",
                  "Mnemonic: repeat = \"stutter each element\"; tile = \"copy the whole tape\"",
                  "If you only need element-wise alignment for arithmetic, broadcast directly (`X * weights`) — `np.repeat` allocates a real materialized copy"
        ],
        mistake: "Confusing repeat and tile. `np.repeat([1,2,3], 2)` gives [1,1,2,2,3,3]. `np.tile([1,2,3], 2)` gives [1,2,3,1,2,3]. They duplicate different things.",
        shorthand: {
          verbose: "import numpy as np\na = np.array([1, 2, 3])\nnp.repeat(a, 3)       # [1,1,1,2,2,2,3,3,3]\nnp.repeat(a, 2)       # [1,1,2,2,3,3]",
          concise: "np.repeat(A, 2)  # [1,1,2,2,3,3,4,4]",
        },
      },
    ],
  },
]

export default { meta, sections }
