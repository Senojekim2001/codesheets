export const meta = {
  "title": "Async & Promises",
  "domain": "javascript",
  "sheet": "async",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: Promises & Async Syntax ─────────────────────────────────────────
  {
    id: "promises-async-syntax",
    title: "Promises & Async Syntax",
    entries: [
      {
        id: "promise-basics",
        fn: "new Promise()",
        desc: "Creates a promise — an object representing the eventual completion or failure of an async operation.",
        category: "Promises & Async Syntax",
        subtitle: "The foundation of async JS",
        signature: "new Promise((resolve, reject) => { })",
        descLong: "A Promise is in one of three states: pending, fulfilled, or rejected. Once settled it never changes. The executor function runs synchronously; resolve() or reject() settle the promise. .then() and .catch() schedule microtasks, running before the next macrotask.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of new Promise() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Promise: create, resolve, chain .then/.catch.\n// STRENGTHS - two lines; shows new Promise + .then + .catch.\n// WEAKNESSES- no reject shown, no chaining, no finally.\n//\n// GOAL: create and chain a Promise\nconst p = new Promise(resolve => resolve('done'));\np.then(val => console.log(val)).catch(err => console.error(err));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of new Promise() — common patterns you'll see in production.\n// APPROACH  - Combine new Promise() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Promise recipes: resolve/reject, chain transforms, .finally.\n// STRENGTHS - covers the 80% case: create, reject, chain, finally.\n// WEAKNESSES- no error propagation between chains; no async/await.\n//\n// GOAL: build a promise with resolve/reject and chain transforms\n// WHY: .then returns a new Promise; returning a value wraps it\nconst fetchUser = id => new Promise((resolve, reject) => {\n  if (!id) { reject(new Error('ID required')); return; }\n  setTimeout(() => resolve({ id, name: 'Alice' }), 100);\n});\nfetchUser(1)\n  .then(user => user.name)   // → Promise<string>\n  .then(name => console.log(name))\n  .catch(err => console.error(err.message))\n  .finally(() => console.log('Done'));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of new Promise() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a promise-based task queue with concurrency control,\n//             retry logic, and proper error propagation.\n// STRENGTHS - concurrency limiting prevents overload; retry with backoff;\n//             clear error propagation through the chain.\n// WEAKNESSES- more complex than raw Promise; no cancellation support.\n//\n// GOAL: production Promise patterns — task queue with retry\n// WHY: Promises are single-fire; resolve/reject only the first call\nclass TaskQueue {\n  #queue = [];\n  #active = 0;\n  #maxConcurrent;\n  constructor(maxConcurrent = 5) {\n    this.#maxConcurrent = maxConcurrent;\n  }\n  add(task) {\n    return new Promise((resolve, reject) => {\n      this.#queue.push({ task, resolve, reject });\n      this.#runNext();\n    });\n  }\n  #runNext() {\n    if (this.#active >= this.#maxConcurrent || this.#queue.length === 0) return;\n    const { task, resolve, reject } = this.#queue.shift();\n    this.#active++;\n    Promise.resolve()\n      .then(() => task())\n      .then(resolve, reject)\n      .finally(() => {\n        this.#active--;\n        this.#runNext();\n      });\n  }\n}\n// Retry with exponential backoff\nfunction withRetry(fn, retries = 3, delay = 1000) {\n  return fn().catch(err => {\n    if (retries <= 0) throw err;\n    return new Promise(r => setTimeout(r, delay))\n      .then(() => withRetry(fn, retries - 1, delay * 2));\n  });\n}\n// Usage\nconst queue = new TaskQueue(3);\nconst results = await Promise.all(\n  urls.map(url => queue.add(() =>\n    withRetry(() => fetch(url).then(r => r.json()), 3, 500)\n  ))\n);\n// Decision rule:\n//   one-time async operation                                  -> Promise\n//   sequential async steps                                    -> .then chain or async/await\n//   cleanup after async work                                  -> .finally\n//   repeated/reactive async values                            -> avoid raw Promise, use callbacks or streams\n//   concurrency limiting                                      -> TaskQueue (above)\n//   retry with backoff                                        -> withRetry (above)\n//\n// Anti-pattern: forgetting to return in a .then callback; creating unbounded\n//   concurrent promises (use a queue); not retrying transient failures."
                  }
        ],
        tips: [
                  "A settled promise never changes state — calling resolve() then reject() only honors the first call.",
                  ".then() returns a new Promise, enabling chaining.",
                  ".finally() runs on both resolve and reject — great for cleanup.",
                  "Returning a value from .then() wraps it in a resolved Promise automatically."
        ],
        mistake: "Forgetting to return inside a .then() chain — without return, the next .then() receives undefined instead of the transformed value.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "promise-all",
        fn: "Promise.all()",
        desc: "Resolves when all promises resolve; rejects immediately if any promise rejects.",
        category: "Promises & Async Syntax",
        subtitle: "Parallel execution, fail-fast",
        signature: "Promise.all(iterable)",
        descLong: "Promise.all() runs all promises in parallel and resolves with an array of results in the same order as the input, regardless of completion order. It rejects immediately (fail-fast) when any promise rejects. Use Promise.allSettled() when you want all results even if some fail.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.all() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Promise.all: run two promises in parallel.\n// STRENGTHS - three lines; shows Promise.all + destructuring.\n// WEAKNESSES- no error handling, no real async, no fail-fast demo.\n//\n// GOAL: run independent promises in parallel\nconst [a, b] = await Promise.all([\n  Promise.resolve(1),\n  Promise.resolve(2)\n]);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.all() — common patterns you'll see in production.\n// APPROACH  - Combine Promise.all() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Promise.all recipes: parallel fetch, fail-fast behavior.\n// STRENGTHS - covers the 80% case: parallel fetch + fail-fast demo.\n// WEAKNESSES- no partial success handling; no concurrency limiting.\n//\n// GOAL: fetch multiple resources at once\n// WHY: Promise.all is faster than sequential awaits for independent work\nconst [user, posts, comments] = await Promise.all([\n  fetch('/api/user/1').then(r => r.json()),\n  fetch('/api/posts').then(r => r.json()),\n  fetch('/api/comments').then(r => r.json()),\n]);\n// WHY: fail-fast — first rejection aborts\nconst results = await Promise.all([\n  Promise.resolve('a'),\n  Promise.reject(new Error('oops')),\n  Promise.resolve('c'),\n]).catch(err => err.message); // 'oops'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.all() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a batch fetch utility with concurrency limiting, partial\n//             success handling via allSettled, and a comparison table\n//             of all four Promise combinators.\n// STRENGTHS - concurrency limiting prevents server overload; partial success\n//             via allSettled; clear decision framework for combinator choice.\n// WEAKNESSES- more complex than raw Promise.all; no retry logic.\n//\n// GOAL: production batch fetching with concurrency and partial success\n// WHY: Promise.all is fail-fast; any rejection aborts all\nasync function batchFetch(urls, { concurrency = 5, tolerateFailures = false } = {}) {\n  const results = [];\n  for (let i = 0; i < urls.length; i += concurrency) {\n    const batch = urls.slice(i, i + concurrency);\n    if (tolerateFailures) {\n      const settled = await Promise.allSettled(\n        batch.map(url => fetch(url).then(r => r.json()))\n      );\n      results.push(...settled);\n    } else {\n      const batchResults = await Promise.all(\n        batch.map(url => fetch(url).then(r => r.json()))\n      );\n      results.push(...batchResults);\n    }\n  }\n  return results;\n}\n// Usage: fetch 100 URLs, 5 at a time, tolerate failures\nconst data = await batchFetch(urls, { concurrency: 5, tolerateFailures: true });\nconst successes = data.filter(r => r.status === 'fulfilled').map(r => r.value);\nconst failures = data.filter(r => r.status === 'rejected').map(r => r.reason);\n// Promise combinator comparison:\n//   Promise.all       — all must succeed, fail-fast, returns values[]\n//   Promise.allSettled— never rejects, returns {status, value/reason}[]\n//   Promise.race      — first settled (resolve OR reject) wins\n//   Promise.any       — first fulfilled wins, AggregateError if all reject\n// Decision rule:\n//   independent async tasks, all must succeed                -> Promise.all\n//   need all outcomes regardless of failure                    -> Promise.allSettled\n//   first settled (resolve or reject) wins                   -> Promise.race\n//   first success wins, tolerate failures                    -> Promise.any\n//   large batch with concurrency limit                       -> batchFetch (above)\n//\n// Anti-pattern: sequential awaits for independent network calls; unbounded\n//   Promise.all on 1000+ URLs (server overload); using all when allSettled\n//   is needed for partial success."
                  }
        ],
        tips: [
                  "Promise.all() is faster than sequential awaits when operations are independent.",
                  "Use Promise.allSettled() when you need all results regardless of failure.",
                  "Use Promise.race() to get whichever promise settles first.",
                  "Use Promise.any() (ES2021) to resolve with the first successful one, ignoring rejections."
        ],
        mistake: "Using sequential awaits (await a; await b;) when requests are independent — run them in parallel with Promise.all() for better performance.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "promise-allsettled",
        fn: "Promise.allSettled()",
        desc: "Waits for all promises to settle (resolve or reject) and returns all outcomes.",
        category: "Promises & Async Syntax",
        subtitle: "Parallel execution, no fail-fast",
        signature: "Promise.allSettled(iterable)",
        descLong: "Unlike Promise.all(), Promise.allSettled() never rejects. It always resolves with an array of {status: \"fulfilled\", value} or {status: \"rejected\", reason} objects for each input promise. Use when you need to handle each outcome individually.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.allSettled() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest allSettled: wait for resolve and reject, see both.\n// STRENGTHS - shows {status, value} and {status, reason} shapes.\n// WEAKNESSES- no filtering, no batch use case.\n//\n// GOAL: wait for all promises to settle, regardless of outcome\nconst results = await Promise.allSettled([\n  Promise.resolve('a'),\n  Promise.reject('b')\n]);\n// [{ status: 'fulfilled', value: 'a' }, { status: 'rejected', reason: 'b' }]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.allSettled() — common patterns you'll see in production.\n// APPROACH  - Combine Promise.allSettled() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - allSettled recipes: batch fetch with mixed results, filter\n//             successes and failures.\n// STRENGTHS - covers the 80% case: batch fetch, partition by status.\n// WEAKNESSES- no retry for failures; no concurrency limiting.\n//\n// GOAL: process mixed results from batch operations\n// WHY: allSettled never rejects; returns status objects\nconst results = await Promise.allSettled([\n  fetch('/api/primary'),\n  fetch('/api/secondary'),\n  fetch('/api/tertiary'),\n]);\nresults.forEach(result => {\n  if (result.status === 'fulfilled') {\n    console.log('Success:', result.value);\n  } else {\n    console.error('Failed:', result.reason);\n  }\n});\nconst successes = results\n  .filter(r => r.status === 'fulfilled')\n  .map(r => r.value);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.allSettled() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a resilient batch processor using allSettled with automatic\n//             retry of failed items and a summary report.\n// STRENGTHS - partial success with retry; clear summary of successes/failures;\n//             never throws on batch failures.\n// WEAKNESSES- retry adds latency; no backoff between retries.\n//\n// GOAL: production batch processing with allSettled and retry\n// WHY: safer default than Promise.all for bulk/batch work\nasync function resilientBatch(items, fn, { retries = 2, concurrency = 10 } = {}) {\n  const results = await Promise.allSettled(\n    items.map(item => retry(() => fn(item), retries))\n  );\n  const succeeded = results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n  const failed = results\n    .filter(r => r.status === 'rejected')\n    .map((r, i) => ({ item: items[i], reason: r.reason.message }));\n  return { succeeded, failed, total: items.length };\n}\nfunction retry(fn, retries) {\n  return fn().catch(err => {\n    if (retries <= 0) throw err;\n    return retry(fn, retries - 1);\n  });\n}\n// Usage: send notifications to 1000 users, tolerate failures\nconst { succeeded, failed, total } = await resilientBatch(\n  users,\n  user => fetch('/api/notify', { method: 'POST', body: JSON.stringify(user) }),\n  { retries: 3, concurrency: 20 }\n);\nconsole.log(`${succeeded.length}/${total} succeeded, ${failed.length} failed`);\nif (failed.length > 0) {\n  // Log failures for manual retry or dead-letter queue\n  failed.forEach(f => console.error(`Failed for ${f.item.id}: ${f.reason}`));\n}\n// Decision rule:\n//   batch operations where partial success is OK              -> Promise.allSettled\n//   one failure should abort the entire batch               -> Promise.all\n//   need to report per-item status                            -> allSettled + partition by status\n//   retry failed items                                        -> resilientBatch (above)\n//\n// Anti-pattern: using Promise.all for bulk background jobs that should tolerate\n//   failures; not checking result.status before accessing .value/.reason."
                  }
        ],
        tips: [
                  "Great for batch operations where partial success is acceptable (e.g., sending to multiple endpoints).",
                  "Always check result.status before accessing .value or .reason.",
                  "Promise.allSettled() is the safe default when you don't want one failure to abort everything.",
                  "Pair with .filter(r => r.status === 'fulfilled').map(r => r.value) to extract successes."
        ],
        mistake: "Using Promise.all() when partial failure is expected — use Promise.allSettled() if you want to process each result individually.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "async-await-basics",
        fn: "async / await",
        desc: "Write asynchronous code that reads like synchronous code using async functions and await expressions.",
        category: "Promises & Async Syntax",
        subtitle: "Synchronous-looking async code",
        signature: "async function fn() { const val = await promise; }",
        descLong: "An async function always returns a Promise. await pauses execution of the async function until the awaited Promise settles, then resumes with the resolved value. await can only be used inside async functions (or at the top level of ES modules).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of async / await — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest async/await: async function returns a promise.\n// STRENGTHS - four lines; shows async function + await.\n// WEAKNESSES- no try/catch, no chaining, no parallel awaits.\n//\n// GOAL: write async code that looks synchronous\nasync function greet() {\n  return 'hello';\n}\nconst result = await greet(); // 'hello'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of async / await — common patterns you'll see in production.\n// APPROACH  - Combine async / await with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - async/await recipes: fetch with error handling, try/catch,\n//             and a safe wrapper returning result objects.\n// STRENGTHS - covers the 80% case: await fetch, check ok, try/catch.\n// WEAKNESSES- no parallel awaits; no error typing.\n//\n// GOAL: fetch and handle errors with async/await\n// WHY: async function always returns a Promise\nasync function getUser(id) {\n  const response = await fetch(`/api/users/${id}`);\n  if (!response.ok) throw new Error(`HTTP ${response.status}`);\n  return await response.json();\n}\n// WHY: try/catch keeps error handling linear\nasync function safeGetUser(id) {\n  try {\n    const user = await getUser(id);\n    return { success: true, user };\n  } catch (err) {\n    return { success: false, error: err.message };\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of async / await — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production async/await patterns: parallel vs sequential awaits,\n//             error boundary wrapper, and async iteration with concurrency.\n// STRENGTHS - parallel awaits for independent work; Go-style error wrapper;\n//             concurrent processing with controlled concurrency.\n// WEAKNESSES- more boilerplate than raw .then chains for simple cases.\n//\n// GOAL: production async/await patterns\n// WHY: await only pauses the current async function, not the whole thread\n// Parallel vs sequential: know the difference\nasync function loadDashboard(userId) {\n  // BAD: sequential — 3x latency\n  // const user = await getUser(userId);\n  // const posts = await getPosts(userId);\n  // const comments = await getComments(userId);\n  // GOOD: parallel — 1x latency (independent calls)\n  const [user, posts, comments] = await Promise.all([\n    getUser(userId),\n    getPosts(userId),\n    getComments(userId),\n  ]);\n  return { user, posts, comments };\n}\n// Go-style error wrapper — avoids nested try/catch\nfunction go(promise) {\n  return promise.then(data => [null, data]).catch(err => [err, null]);\n}\nconst [err, user] = await go(getUser(1));\nif (err) { console.error('Failed:', err.message); return; }\nconsole.log(user);\n// Concurrent processing with limited concurrency\nasync function processConcurrent(items, fn, concurrency = 5) {\n  const results = [];\n  for (let i = 0; i < items.length; i += concurrency) {\n    const batch = items.slice(i, i + concurrency);\n    const batchResults = await Promise.all(batch.map(fn));\n    results.push(...batchResults);\n  }\n  return results;\n}\n// Sequential with dependency chain (await is correct here)\nasync function fetchAndEnrich(id) {\n  const user = await getUser(id);       // need user.id for next call\n  const profile = await getProfile(user.id); // depends on user\n  const settings = await getSettings(profile.theme); // depends on profile\n  return { user, profile, settings };\n}\n// Decision rule:\n//   sequential dependent async steps                    -> async/await with try/catch\n//   independent parallel tasks                         -> Promise.all\n//   error transformation                                -> catch + rethrow or return result object\n//   module initialization                               -> top-level await in ESM\n//   avoid nested try/catch                              -> go() wrapper (above)\n//   controlled concurrency                              -> processConcurrent (above)\n//\n// Anti-pattern: awaiting independent promises sequentially (3x latency);\n//   using async/await for simple fire-and-forget; not handling rejections."
                  }
        ],
        tips: [
                  "async functions always return a Promise — even if you return a plain value.",
                  "Use try/catch with async/await instead of .catch() for cleaner error handling.",
                  "await only pauses the current async function — other code continues running.",
                  "Top-level await works in ES modules (type=\"module\" in browsers, .mjs in Node)."
        ],
        mistake: "Using await in a non-async function — it causes a SyntaxError. The enclosing function must be async.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "async-error-handling",
        fn: "Async Error Handling",
        desc: "Pattern for handling errors in async/await code without deeply nested try/catch blocks.",
        category: "Promises & Async Syntax",
        subtitle: "Clean error handling for async flows",
        signature: "try { await fn() } catch(err) { }",
        descLong: "Every await expression can throw if the underlying Promise rejects. Wrapping in try/catch is idiomatic. For a Go-style approach, wrap the call and return [error, data] to avoid nesting. Always handle rejections — unhandled rejections crash Node processes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Async Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest async error handling: try/catch around await.\n// STRENGTHS - five lines; shows try/catch with await.\n// WEAKNESSES- no error typing, no retry, no [err, data] pattern.\n//\n// GOAL: handle async errors with try/catch\ntry {\n  const user = await fetchUser(1);\n} catch (err) {\n  console.error(err);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Async Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Async Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - async error handling recipes: multi-await try/catch and\n//             Go-style [err, data] helper for linear call sites.\n// STRENGTHS - covers the 80% case: try/catch + to() helper.\n// WEAKNESSES- no error classification; no global handler.\n//\n// GOAL: wrap multiple awaits and use a [err, data] helper\n// WHY: first rejection jumps to catch\nasync function loadProfile(id) {\n  try {\n    const user = await fetchUser(id);\n    const posts = await fetchPosts(user.id);\n    return { user, posts };\n  } catch (err) {\n    console.error('Load failed:', err);\n    return null;\n  }\n}\n// WHY: Go-style helper keeps call sites linear\nconst to = promise => promise.then(data => [null, data]).catch(err => [err, null]);\nconst [err, user] = await to(fetchUser(1));\nif (err) { /* handle */ }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Async Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production async error handling: typed error classes,\n//             retryable vs fatal classification, global unhandled rejection\n//             handler, and a retry-with-backoff utility.\n// STRENGTHS - error classes enable precise catch branches; retryable\n//             classification prevents retrying fatal errors; global handler\n//             prevents silent crashes.\n// WEAKNESSES- more boilerplate; requires discipline to use typed errors.\n//\n// GOAL: production async error handling with classification and retry\n// WHY: unhandled rejections can crash Node processes\nclass AppError extends Error {\n  constructor(message, code, retryable = false) {\n    super(message);\n    this.code = code;\n    this.retryable = retryable;\n  }\n}\nclass NetworkError extends AppError {\n  constructor(message) { super(message, 'NETWORK', true); }\n}\nclass AuthError extends AppError {\n  constructor(message) { super(message, 'AUTH', false); }\n}\n// Retry only retryable errors with exponential backoff\nasync function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {\n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (err instanceof AppError && !err.retryable) throw err;\n      if (attempt === maxRetries) throw err;\n      const delay = baseDelay * Math.pow(2, attempt);\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n}\n// Usage: retry network errors, fail fast on auth errors\ntry {\n  const data = await retryWithBackoff(() => fetch('/api/data').then(r => {\n    if (r.status === 401) throw new AuthError('Unauthorized');\n    if (!r.ok) throw new NetworkError(`HTTP ${r.status}`);\n    return r.json();\n  }));\n} catch (err) {\n  if (err instanceof AuthError) redirectToLogin();\n  else if (err instanceof NetworkError) showOfflineMessage();\n  else throw err; // unknown error\n}\n// Global safety net (Node.js)\nprocess.on('unhandledRejection', (reason) => {\n  console.error('Unhandled rejection:', reason);\n  // Optionally: log to monitoring service, then exit\n});\n// Decision rule:\n//   normal sequential async flow                         -> try/catch\n//   avoid nested try/catch                               -> [err, data] helper\n//   global safety net                                    -> process.on('unhandledRejection')\n//   retry logic                                          -> retryWithBackoff (above)\n//   classify errors                                      -> AppError subclasses (above)\n//\n// Anti-pattern: silently swallowing errors with empty catch; retrying fatal\n//   errors (auth, validation); not registering unhandledRejection handler."
                  }
        ],
        tips: [
                  "A single try/catch can wrap multiple awaits — the first rejection jumps to catch.",
                  "In Node.js, add a process.on(\"unhandledRejection\") handler to catch escaping rejections.",
                  "The to() / safe() helper pattern keeps code linear without nested try blocks.",
                  "Distinguish between retryable errors (network timeouts) and fatal ones (auth failure) in catch."
        ],
        mistake: "Forgetting to handle rejections — in Node, unhandled promise rejections terminate the process. Always add .catch() or try/catch.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "fetch-basics",
        fn: "fetch()",
        desc: "Makes HTTP requests and returns a Promise that resolves to a Response object.",
        category: "Promises & Async Syntax",
        subtitle: "Browser-native HTTP client",
        signature: "fetch(url, options?)",
        descLong: "fetch() is the modern replacement for XMLHttpRequest. It returns a Promise that resolves when the HTTP response headers arrive — not when the body is downloaded. You must check response.ok and separately call response.json() or response.text() to read the body. A network failure rejects; a 4xx/5xx does NOT reject.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of fetch() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest fetch: GET JSON from an API endpoint.\n// STRENGTHS - two lines; shows fetch + .json().\n// WEAKNESSES- no error handling, no res.ok check, no headers.\n//\n// GOAL: make a basic HTTP request\nconst res = await fetch('/api/users');\nconst users = await res.json();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of fetch() — common patterns you'll see in production.\n// APPROACH  - Combine fetch() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - fetch recipes: check res.ok, POST with JSON, auth headers.\n// STRENGTHS - covers the 80% case: GET, POST, auth header.\n// WEAKNESSES- no retry, no cancellation, no response body cloning.\n//\n// GOAL: check status and send JSON/headers\n// WHY: fetch resolves on 4xx/5xx; check res.ok\nconst res = await fetch('/api/users');\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst users = await res.json();\n// WHY: POST with JSON body\nconst res2 = await fetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ name: 'Alice' })\n});\n// WHY: auth header\nconst res3 = await fetch('/api/protected', {\n  headers: { Authorization: `Bearer ${token}` }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of fetch() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a production fetch wrapper with timeout, retry, response\n//             cloning for logging, and typed error classes.\n// STRENGTHS - timeout via AbortSignal; retry with backoff; response cloning\n//             for error logging; clear error hierarchy.\n// WEAKNESSES- no streaming support; no upload progress.\n//\n// GOAL: production fetch wrapper with timeout and retry\nclass FetchError extends Error {\n  constructor(message, status, url) {\n    super(message);\n    this.status = status;\n    this.url = url;\n  }\n}\nasync function safeFetch(url, options = {}) {\n  const { timeout = 8000, retries = 2, ...fetchOpts } = options;\n  for (let attempt = 0; attempt <= retries; attempt++) {\n    try {\n      const response = await fetch(url, {\n        ...fetchOpts,\n        signal: options.signal ?? AbortSignal.timeout(timeout),\n      });\n      if (!response.ok) {\n        // Clone for error logging before body is consumed\n        const body = await response.clone().text();\n        throw new FetchError(`HTTP ${response.status}: ${response.statusText}`, response.status, url);\n      }\n      return response;\n    } catch (err) {\n      if (err instanceof FetchError && err.status < 500) throw err; // don't retry 4xx\n      if (err.name === 'AbortError' && !options.signal) throw err; // timeout, not cancellation\n      if (attempt === retries) throw err;\n      await new Promise(r => setTimeout(r, 500 * Math.pow(2, attempt)));\n    }\n  }\n}\n// Usage\nconst res = await safeFetch('/api/users', { timeout: 5000, retries: 3 });\nconst users = await res.json();\n// POST with JSON\nconst created = await safeFetch('/api/users', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },\n  body: JSON.stringify({ name: 'Alice' }),\n});\n// Decision rule:\n//   simple JSON fetch                                    -> fetch + res.ok + .json()\n//   request cancellation                                 -> AbortController\n//   upload/download progress                             -> XMLHttpRequest or ReadableStream\n//   retry/backoff                                        -> safeFetch (above)\n//   timeout                                              -> AbortSignal.timeout(ms)\n//\n// Anti-pattern: calling .json() twice or ignoring res.ok; not retrying 5xx;\n//   retrying 4xx (client errors won't fix themselves)."
                  }
        ],
        tips: [
                  "Always check res.ok — fetch only rejects on network failure, not on 4xx/5xx responses.",
                  "Always set Content-Type: application/json when sending JSON body.",
                  "Response body can only be read once — call .json(), .text(), or .blob() exactly once.",
                  "Use AbortController to cancel in-flight fetch requests on component unmount or timeout."
        ],
        mistake: "Assuming fetch rejects on 404 or 500 — it only rejects on network errors. Always check response.ok before processing the response.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "abort-controller",
        fn: "AbortController",
        desc: "Cancels in-flight fetch requests or other async operations via an AbortSignal.",
        category: "Promises & Async Syntax",
        subtitle: "Cancel fetch requests on demand",
        signature: "const controller = new AbortController()  |  controller.abort()",
        descLong: "AbortController creates a controller with a .signal. Pass the signal to fetch to make the request cancellable. Calling controller.abort() immediately rejects the fetch promise with an AbortError. Critical for React effects (cancel on unmount) and timeouts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AbortController — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest AbortController: create, pass signal, abort.\n// STRENGTHS - three lines; shows controller + signal + abort.\n// WEAKNESSES- no error handling, no timeout, no React cleanup.\n//\n// GOAL: cancel a fetch request\nconst ctrl = new AbortController();\nfetch('/api/data', { signal: ctrl.signal });\nctrl.abort();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AbortController — common patterns you'll see in production.\n// APPROACH  - Combine AbortController with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - AbortController recipes: timeout, React cleanup, error detection.\n// STRENGTHS - covers the 80% case: timeout, React useEffect cleanup, AbortError.\n// WEAKNESSES- no shared signal for multiple requests; no AbortSignal.timeout.\n//\n// GOAL: use AbortController for timeouts and React cleanup\n// WHY: err.name === 'AbortError' distinguishes cancel from failure\nconst controller = new AbortController();\nconst { signal } = controller;\nconst fetchWithCancel = async () => {\n  try {\n    const res = await fetch('/api/data', { signal });\n    return await res.json();\n  } catch (err) {\n    if (err.name === 'AbortError') console.log('Request cancelled');\n    else throw err;\n  }\n};\n// WHY: abort after timeout\nsetTimeout(() => controller.abort(), 5000);\n// WHY: cleanup in React effect\nuseEffect(() => {\n  const ctrl = new AbortController();\n  loadData(ctrl.signal);\n  return () => ctrl.abort();\n}, []);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AbortController — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - a production cancellation manager: shared signals, timeout\n//             composition, React-safe data loading, and graceful degradation.\n// STRENGTHS - one signal cancels multiple requests; timeout composition;\n//             React-safe with cleanup; AbortError detection.\n// WEAKNESSES- AbortSignal.timeout may not be available in older environments.\n//\n// GOAL: production cancellation management\n// WHY: one controller/signal can cancel multiple requests\nclass CancelToken {\n  #controller = new AbortController();\n  get signal() { return this.#controller.signal; }\n  abort() { this.#controller.abort(); }\n  // Compose with a timeout signal — aborts on either\n  withTimeout(ms) {\n    const timeoutSignal = AbortSignal.timeout(ms);\n    const combined = AbortSignal.any([this.signal, timeoutSignal]);\n    return combined;\n  }\n  get aborted() { return this.#controller.signal.aborted; }\n}\n// React-safe data loading hook\nfunction useFetch(url, options = {}) {\n  const [data, setData] = useState(null);\n  const [error, setError] = useState(null);\n  const [loading, setLoading] = useState(true);\n  useEffect(() => {\n    const token = new CancelToken();\n    setLoading(true);\n    fetch(url, { ...options, signal: token.withTimeout(8000) })\n      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })\n      .then(d => { if (!token.aborted) setData(d); })\n      .catch(e => { if (!token.aborted) setError(e); })\n      .finally(() => { if (!token.aborted) setLoading(false); });\n    return () => token.abort();\n  }, [url]);\n  return { data, error, loading };\n}\n// Shared cancellation: cancel all related requests at once\nconst batchToken = new CancelToken();\nawait Promise.allSettled([\n  fetch('/api/users', { signal: batchToken.signal }),\n  fetch('/api/posts', { signal: batchToken.signal }),\n  fetch('/api/comments', { signal: batchToken.signal }),\n]);\n// batchToken.abort(); // cancels all three\n// Decision rule:\n//   user-initiated cancellation                         -> controller.abort()\n//   automatic timeout                                   -> AbortSignal.timeout(ms)\n//   React effect cleanup                                -> abort in useEffect cleanup\n//   multiple related requests                            -> share one signal\n//   timeout + manual cancel                              -> AbortSignal.any (above)\n//\n// Anti-pattern: not checking err.name before rethrowing; not aborting in React\n//   cleanup (state updates on unmounted component); creating separate controllers\n//   for related requests that should cancel together."
                  }
        ],
        tips: [
                  "Always check err.name === \"AbortError\" to distinguish cancellations from real errors.",
                  "One AbortController can cancel multiple fetch requests using the same signal.",
                  "In React effects, abort in the cleanup function to avoid setting state on unmounted components.",
                  "AbortSignal.timeout(ms) (modern browsers) creates a self-aborting signal — no controller needed."
        ],
        mistake: "Not cleaning up fetch requests in React effects — the component may be unmounted before the response arrives, causing state updates on unmounted components.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Async Patterns ─────────────────────────────────────────
  {
    id: "async-patterns",
    title: "Async Patterns",
    entries: [
      {
        id: "event-loop",
        fn: "Event Loop",
        desc: "JavaScript's single-threaded concurrency model — call stack, microtask queue, and macrotask queue.",
        category: "Async Patterns",
        subtitle: "Understanding JS execution order",
        signature: "// call stack → microtasks → macrotasks → repeat",
        descLong: "The event loop processes tasks in order: (1) run synchronous code on the call stack, (2) drain the microtask queue (Promises, queueMicrotask), (3) pick the next macrotask (setTimeout, setInterval, I/O), repeat. Promise .then() callbacks are microtasks — they run before the next setTimeout.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Event Loop — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest event loop demo: sync, microtask, macrotask order.\n// STRENGTHS - five lines; shows execution order clearly.\n// WEAKNESSES- no queueMicrotask, no process.nextTick, no long task demo.\n//\n// GOAL: see sync, microtask, and macrotask order\nconsole.log('sync 1');\nsetTimeout(() => console.log('macrotask'), 0);\nPromise.resolve().then(() => console.log('microtask'));\nconsole.log('sync 2');\n// sync 1, sync 2, microtask, macrotask"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Event Loop — common patterns you'll see in production.\n// APPROACH  - Combine Event Loop with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - event loop recipes: .then chaining order, queueMicrotask,\n//             and understanding microtask draining.\n// STRENGTHS - covers the 80% case: .then chain order, queueMicrotask.\n// WEAKNESSES- no process.nextTick, no long task blocking demo.\n//\n// GOAL: understand Promise .then scheduling\n// WHY: microtasks drain before the next macrotask\nconsole.log('1 — sync');\nsetTimeout(() => console.log('4 — macrotask'), 0);\nPromise.resolve()\n  .then(() => console.log('2 — microtask'))\n  .then(() => console.log('3 — microtask 2'));\nconsole.log('1.5 — sync');\n// 1, 1.5, 2, 3, 4"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Event Loop — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production event loop reasoning: long task detection,\n//             yielding to prevent jank, and a scheduler utility that\n//             breaks up heavy synchronous work.\n// STRENGTHS - prevents UI jank by yielding; measures task duration;\n//             clear scheduling decision framework.\n// WEAKNESSES- scheduler adds overhead for small tasks; browser-specific.\n//\n// GOAL: production event loop management\n// WHY: long sync blocks starve microtasks and macrotasks\n// Yield to the event loop to prevent jank\nfunction nextFrame() {\n  return new Promise(resolve => requestAnimationFrame(resolve));\n}\nfunction nextTask() {\n  return new Promise(resolve => setTimeout(resolve, 0));\n}\n// Break up heavy synchronous work into chunks\nasync function processChunk(items, fn, chunkSize = 100) {\n  for (let i = 0; i < items.length; i += chunkSize) {\n    const chunk = items.slice(i, i + chunkSize);\n    chunk.forEach(fn);\n    // Yield to let the browser render / handle input\n    if (i + chunkSize < items.length) await nextFrame();\n  }\n}\n// Detect long tasks that cause jank\nconst observer = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    if (entry.duration > 50) {\n      console.warn(`Long task: ${entry.duration.toFixed(0)}ms`);\n    }\n  }\n});\nobserver.observe({ entryTypes: ['longtask'] });\n// Usage: process 10k items without blocking UI\nawait processChunk(bigArray, item => transform(item), 200);\n// Decision rule:\n//   defer work ASAP without yielding to rendering            -> queueMicrotask\n//   schedule work after current task                         -> Promise.resolve().then()\n//   schedule work after a delay/minimum yield                -> setTimeout/setImmediate\n//   I/O or heavy CPU                                         -> consider Worker/Worker Threads\n//   break up heavy sync work                                 -> processChunk (above)\n//   detect jank-causing tasks                                -> PerformanceObserver (above)\n//\n// Anti-pattern: scheduling many microtasks that cause long task jank; running\n//   heavy sync loops without yielding; blocking the event loop with JSON.parse\n//   on huge payloads."
                  }
        ],
        tips: [
                  "Microtasks (Promises) always run before the next macrotask (setTimeout) — even setTimeout(fn, 0).",
                  "Long synchronous code blocks the event loop — use async patterns for heavy work.",
                  "queueMicrotask() schedules a microtask explicitly — useful for library authors.",
                  "In Node.js, process.nextTick() runs even before regular microtasks."
        ],
        mistake: "Assuming setTimeout(fn, 0) runs \"immediately\" — it runs after all pending microtasks (Promises) are resolved.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "promise-race",
        fn: "Promise.race()",
        desc: "Resolves or rejects with the first settled promise — whichever finishes first.",
        category: "Async Patterns",
        subtitle: "First settled wins",
        signature: "Promise.race(iterable)",
        descLong: "Promise.race() returns a promise that settles as soon as the first input promise settles — whether that's a resolve or reject. Useful for implementing timeouts, hedged requests, and racing a fetch against a fallback.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.race() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Promise.race: first settled wins.\n// STRENGTHS - four lines; shows race between resolve and timeout.\n// WEAKNESSES- no cancellation of loser; no real timeout pattern.\n//\n// GOAL: resolve or reject with the first settled promise\nconst result = await Promise.race([\n  Promise.resolve('quick'),\n  new Promise((_, reject) => setTimeout(reject, 100))\n]); // 'quick'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.race() — common patterns you'll see in production.\n// APPROACH  - Combine Promise.race() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Promise.race recipes: timeout wrapper, cache-vs-network race.\n// STRENGTHS - covers the 80% case: withTimeout + cache race.\n// WEAKNESSES- losing promise keeps running; no AbortController cancellation.\n//\n// GOAL: implement timeouts and race against cache\n// WHY: race settles on first resolve OR reject\nfunction withTimeout(promise, ms) {\n  const timeout = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error('Timeout')), ms)\n  );\n  return Promise.race([promise, timeout]);\n}\nconst data = await withTimeout(fetch('/api/slow'), 3000);\n// WHY: first cache hit wins\nconst result = await Promise.race([\n  cache.get(key),\n  fetch('/api/data').then(r => r.json())\n]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.race() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Promise.race patterns: cancellable timeout with\n//             AbortController, hedged requests (race primary vs fallback),\n//             and a comparison with Promise.any.\n// STRENGTHS - cancels losing promise via AbortController; hedged requests\n//             for low-latency; clear decision framework.\n// WEAKNESSES- AbortController adds complexity; hedged requests double load.\n//\n// GOAL: production Promise.race with cancellation and hedged requests\n// WHY: losing promises keep running unless cancelled\n// Cancellable timeout — aborts the fetch if it loses the race\nasync function fetchWithTimeout(url, ms, options = {}) {\n  const controller = new AbortController();\n  const timeoutId = setTimeout(() => controller.abort(), ms);\n  try {\n    const res = await fetch(url, { ...options, signal: controller.signal });\n    return res;\n  } catch (err) {\n    if (err.name === 'AbortError') throw new Error(`Timeout after ${ms}ms`);\n    throw err;\n  } finally {\n    clearTimeout(timeoutId);\n  }\n}\n// Hedged request: race primary vs fallback, cancel the loser\nasync function hedgedFetch(primaryUrl, fallbackUrl, options = {}) {\n  const primaryController = new AbortController();\n  const fallbackController = new AbortController();\n  const primary = fetch(primaryUrl, { ...options, signal: primaryController.signal })\n    .then(r => { fallbackController.abort(); return r; });\n  const fallback = fetch(fallbackUrl, { ...options, signal: fallbackController.signal })\n    .then(r => { primaryController.abort(); return r; });\n  return Promise.race([primary, fallback]);\n}\n// Usage\nconst res = await fetchWithTimeout('/api/data', 3000);\nconst hedged = await hedgedFetch('https://primary.example.com/data', 'https://fallback.example.com/data');\n// Decision rule:\n//   enforce a timeout on a promise                      -> Promise.race with timeout\n//   first result regardless of success/failure            -> Promise.race\n//   first success, ignore failures                          -> Promise.any\n//   cancelling losers                                       -> AbortController (above)\n//   hedged requests (low latency)                       -> hedgedFetch (above)\n//\n// Anti-pattern: using race when any would do; not cancelling losing promises\n//   (wasted bandwidth); Promise.race([]) is forever pending."
                  }
        ],
        tips: [
                  "Promise.race() settles on the first resolve OR reject — unlike Promise.any() which ignores rejections.",
                  "Use AbortController + AbortSignal.timeout() as a cleaner timeout alternative to race().",
                  "Losing promises continue running — use AbortController to cancel them.",
                  "Promise.race([]) returns a forever-pending promise (edge case to avoid)."
        ],
        mistake: "Expecting Promise.race() to ignore rejections — it does not. Use Promise.any() if you want to wait for the first successful resolution.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "promise-any",
        fn: "Promise.any()",
        desc: "Resolves with the first fulfilled promise. Only rejects if ALL promises reject (AggregateError).",
        category: "Async Patterns",
        subtitle: "First success wins, ignores individual failures",
        signature: "Promise.any(iterable)",
        descLong: "Promise.any() (ES2021) resolves as soon as any promise fulfills, ignoring rejections. Only rejects if every input promise rejects — with an AggregateError containing all rejection reasons. Ideal for trying multiple sources and taking the first that succeeds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.any() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Promise.any: first success wins, ignore rejections.\n// STRENGTHS - shows Promise.any + AggregateError for total failure.\n// WEAKNESSES- no real async, no multi-source pattern.\n//\n// GOAL: get the first successful promise, ignoring rejections\ntry {\n  const result = await Promise.any([\n    Promise.reject('fail'),\n    Promise.resolve('success')\n  ]);\n  console.log(result); // 'success'\n} catch (err) {\n  err instanceof AggregateError; // true if all fail\n  err.errors; // array of reasons\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.any() — common patterns you'll see in production.\n// APPROACH  - Combine Promise.any() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Promise.any recipes: multi-CDN fetch, AggregateError handling.\n// STRENGTHS - covers the 80% case: redundant sources + total failure handling.\n// WEAKNESSES- no cancellation of losing requests; no timeout.\n//\n// GOAL: try multiple sources and handle total failure\n// WHY: any resolves with the first fulfilled promise\nconst asset = await Promise.any([\n  fetch('https://cdn1.example.com/lib.js'),\n  fetch('https://cdn2.example.com/lib.js'),\n  fetch('https://cdn3.example.com/lib.js'),\n]);\n// WHY: all rejected -> AggregateError\ntry {\n  await Promise.any([\n    Promise.reject(new Error('cdn1 down')),\n    Promise.reject(new Error('cdn2 down'))\n  ]);\n} catch (err) {\n  err.errors; // [Error, Error]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.any() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Promise.any patterns: multi-region API fallback,\n//             stale-while-revalidate with cache, and AggregateError reporting.\n// STRENGTHS - resilient multi-region fetching; cache fallback; structured\n//             error reporting on total failure.\n// WEAKNESSES- losing requests keep running (no cancellation); adds latency\n//   if all sources fail (waits for all to reject).\n//\n// GOAL: production Promise.any for resilient sourcing\n// WHY: any ignores individual rejections; race does not\n// Multi-region API with cache fallback\nasync function resilientFetch(path, options = {}) {\n  const regions = ['us-east', 'us-west', 'eu-central'];\n  try {\n    const response = await Promise.any(\n      regions.map(region =>\n        fetch(`https://${region}.api.example.com${path}`, options)\n          .then(r => {\n            if (!r.ok) throw new Error(`${region}: HTTP ${r.status}`);\n            return r;\n          })\n      )\n    );\n    return response;\n  } catch (err) {\n    // All regions failed — try cache as last resort\n    const cached = await cache.get(path);\n    if (cached) return cached;\n    // Report all failures\n    throw new AggregateError(\n      err.errors,\n      `All regions failed for ${path}`\n    );\n  }\n}\n// Stale-while-revalidate: serve cache immediately, revalidate in background\nasync function swrFetch(key, fetcher) {\n  const cached = cache.get(key);\n  const fetchPromise = fetcher().then(fresh => {\n    cache.set(key, fresh);\n    return fresh;\n  });\n  // If cache exists, race cache (immediate) vs fetch (fresh)\n  // If cache is null, Promise.any just waits for fetch\n  return Promise.any([\n    cached ? Promise.resolve(cached) : Promise.reject(new Error('no cache')),\n    fetchPromise,\n  ]);\n}\n// Usage\nconst data = await resilientFetch('/api/users');\nconst content = await swrFetch('homepage', () => fetch('/api/homepage').then(r => r.json()));\n// Decision rule:\n//   redundant sources, use first success                 -> Promise.any\n//   first settled regardless of outcome                  -> Promise.race\n//   all must succeed                                     -> Promise.all\n//   empty input                                          -> always AggregateError\n//   stale-while-revalidate                               -> swrFetch (above)\n//\n// Anti-pattern: using race when some peers are expected to fail; not handling\n//   AggregateError when all sources fail; not providing a cache fallback."
                  }
        ],
        tips: [
                  "AggregateError.errors contains all individual rejection reasons when all fail.",
                  "Promise.any() is the correct choice for \"try multiple sources, use first success\" patterns.",
                  "Unlike Promise.race(), Promise.any() does not reject on individual promise rejections.",
                  "Empty input [] always rejects with AggregateError."
        ],
        mistake: "Using Promise.race() when you want to tolerate individual failures — race() rejects on the first rejection. Use Promise.any() to ignore failures and find the first success.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "async-generators",
        fn: "Async Generators",
        desc: "Async functions that can yield values over time — combine generator laziness with async/await.",
        category: "Async Patterns",
        subtitle: "Lazy async sequences",
        signature: "async function* gen() { yield await fetch(...) }",
        descLong: "Async generators are async functions that yield values. Each yield pauses until the consumer calls .next(), which returns a Promise. They implement the async iterable protocol and work with for await...of. Ideal for paginated API results, streaming data, and async pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Async Generators — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest async generator: yield values over time.\n// STRENGTHS - five lines; shows async function* + yield + for await.\n// WEAKNESSES- no real async, no pagination, no error handling.\n//\n// GOAL: create a lazy async sequence\nasync function* count() {\n  yield await Promise.resolve(1);\n  yield await Promise.resolve(2);\n}\nfor await (const n of count()) console.log(n);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Async Generators — common patterns you'll see in production.\n// APPROACH  - Combine Async Generators with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - async generator recipes: paginated API fetching, processing\n//             page-by-page without loading everything into memory.\n// STRENGTHS - covers the 80% case: pagination + for await consumption.\n// WEAKNESSES- no error handling, no concurrency, no backpressure.\n//\n// GOAL: paginate API results with async generators\n// WHY: process page-by-page without loading everything into memory\nasync function* fetchPages(url) {\n  let nextUrl = url;\n  while (nextUrl) {\n    const res = await fetch(nextUrl);\n    const { data, next } = await res.json();\n    yield data;\n    nextUrl = next;\n  }\n}\nfor await (const page of fetchPages('/api/posts')) {\n  await processPage(page);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Async Generators — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production async generator patterns: transform pipeline,\n//             batched processing with concurrency, and cleanup with\n//             finally blocks on break/return.\n// STRENGTHS - lazy evaluation with low memory; composable transform pipeline;\n//             cleanup via finally on early break.\n// WEAKNESSES- sequential by nature; no parallelism within a single generator.\n//\n// GOAL: production async generators for streams and pipelines\n// WHY: break in for await triggers the generator's finally block\n// Transform pipeline: filter + map over async iterable\nasync function* filter(asyncIter, predicate) {\n  for await (const item of asyncIter) {\n    if (predicate(item)) yield item;\n  }\n}\nasync function* map(asyncIter, mapper) {\n  for await (const item of asyncIter) {\n    yield mapper(item);\n  }\n}\nasync function* take(asyncIter, n) {\n  let count = 0;\n  for await (const item of asyncIter) {\n    if (count++ >= n) break; // triggers finally in upstream\n    yield item;\n  }\n}\n// Usage: fetch pages, filter active users, map to DTOs, take first 50\nconst pipeline = take(\n  map(\n    filter(fetchPages('/api/users'), user => user.active),\n    user => ({ id: user.id, name: user.name })\n  ),\n  50\n);\nfor await (const dto of pipeline) {\n  console.log(dto);\n}\n// Batched processing with concurrency inside a generator\nasync function* batched(asyncIter, batchSize = 10) {\n  let batch = [];\n  for await (const item of asyncIter) {\n    batch.push(item);\n    if (batch.length >= batchSize) {\n      yield batch;\n      batch = [];\n    }\n  }\n  if (batch.length > 0) yield batch;\n}\n// Usage: process items in batches of 20\nfor await (const batch of batched(fetchPages('/api/items'), 20)) {\n  await Promise.all(batch.map(processItem));\n}\n// Decision rule:\n//   paginated/streamed async data                         -> async generator\n//   transform async iterable                                -> async generator wrapper (above)\n//   need backpressure                                     -> use streams instead\n//   simple list of promises                               -> Promise.all\n//   composable transforms                                  -> filter/map/take (above)\n//\n// Anti-pattern: buffering all pages into memory; not handling break/return\n//   (cleanup in finally); using async generators when you need parallelism."
                  }
        ],
        tips: [
                  "for await...of is the idiomatic consumer for async generators.",
                  "Use async generators for streaming data — they pull data on demand rather than buffering all at once.",
                  "Always handle cleanup: a break in for await...of triggers the generator's finally block.",
                  "Return statement in an async generator becomes the final done: true iteration result."
        ],
        mistake: "Fetching all pages into an array before processing — async generators let you process page-by-page with lower memory usage.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "for-await-of",
        fn: "for await...of",
        desc: "Iterate over async iterables — Promises, async generators, ReadableStreams, and Node.js streams.",
        category: "Async Patterns",
        subtitle: "Async iteration over any async iterable",
        signature: "for await (const item of asyncIterable) { }",
        descLong: "for await...of works on any object implementing the async iterator protocol (Symbol.asyncIterator). This includes async generators, Node.js streams, the Streams API ReadableStream, and arrays of promises. Must be inside an async function or top-level module.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of for await...of — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest for await...of: iterate over an array of promises.\n// STRENGTHS - four lines; shows for await over promises.\n// WEAKNESSES- sequential only; no streams, no generators, no break.\n//\n// GOAL: iterate over an async iterable\nconst promises = [Promise.resolve(1), Promise.resolve(2)];\nfor await (const n of promises) {\n  console.log(n);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of for await...of — common patterns you'll see in production.\n// APPROACH  - Combine for await...of with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - for await...of recipes: async generators, promise arrays,\n//             and Node.js streams.\n// STRENGTHS - covers the 80% case: generators, promises, streams.\n// WEAKNESSES- sequential only; no parallel processing; no break demo.\n//\n// GOAL: consume async generators, streams, and promises\n// WHY: for await...of works with any Symbol.asyncIterator\nfor await (const page of fetchPages('/api/items')) {\n  // process page\n}\n// WHY: sequential over array of promises\nconst promises = [fetch(url1), fetch(url2), fetch(url3)];\nfor await (const res of promises) {\n  console.log(await res.json());\n}\n// WHY: Node.js readable streams are async iterables\nimport { createReadStream } from 'fs';\nconst stream = createReadStream('./file.txt', { encoding: 'utf8' });\nfor await (const chunk of stream) {\n  process.stdout.write(chunk);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of for await...of — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production for await...of patterns: stream processing with\n//             early termination, custom async iterable, and a comparison\n//             with Promise.all for parallel vs sequential.\n// STRENGTHS - early break with cleanup; custom async iterable protocol;\n//             clear parallel vs sequential decision.\n// WEAKNESSES- sequential by default; no backpressure handling.\n//\n// GOAL: production for await...of patterns\n// WHY: for await...of is sequential, not parallel\n// Custom async iterable (without generator)\nconst range = {\n  from: 1, to: 5,\n  [Symbol.asyncIterator]() {\n    let current = this.from;\n    const last = this.to;\n    return {\n      next() {\n        return new Promise(resolve => {\n          setTimeout(() => {\n            if (current <= last) {\n              resolve({ value: current++, done: false });\n            } else {\n              resolve({ value: undefined, done: true });\n            }\n          }, 100);\n        });\n      },\n      return() { // called on break\n        console.log('Iterator cleanup');\n        return Promise.resolve({ done: true });\n      },\n    };\n  },\n};\n// Early termination with break triggers return()\nfor await (const n of range) {\n  console.log(n);\n  if (n === 3) break; // logs: 1, 2, 3, 'Iterator cleanup'\n}\n// Stream processing with transform\nasync function processStream(stream) {\n  const results = [];\n  for await (const chunk of stream) {\n    const parsed = JSON.parse(chunk);\n    if (parsed.type === 'end') break;\n    results.push(parsed.data);\n  }\n  return results;\n}\n// Parallel vs sequential decision:\n// for await...of: sequential, each item waits for previous to resolve\n// Promise.all:    parallel, all items start immediately\nconst urls = ['/api/a', '/api/b', '/api/c'];\n// Sequential (use when order matters or APIs have rate limits)\nfor await (const res of urls.map(u => fetch(u))) {\n  console.log(await res.json());\n}\n// Parallel (use when independent and no rate limits)\nconst responses = await Promise.all(urls.map(u => fetch(u).then(r => r.json())));\n// Decision rule:\n//   stream/generator data                                  -> for await...of\n//   array of promises (parallel)                             -> Promise.all\n//   array of promises (sequential)                           -> for await...of\n//   Node.js streams with backpressure                        -> pipeline/pump\n//   early termination with cleanup                           -> break + return() (above)\n//   custom async iterable                                   -> Symbol.asyncIterator (above)\n//\n// Anti-pattern: using for await...of for parallel work (it's sequential);\n//   not implementing return() on custom iterables (no cleanup on break)."
                  }
        ],
        tips: [
                  "for await...of over an array of Promises processes them sequentially — use Promise.all() for parallel.",
                  "break inside for await...of calls the iterator's return() method — triggers cleanup.",
                  "Works at top level in ES modules (top-level await).",
                  "ReadableStream from fetch response is async iterable in modern environments."
        ],
        mistake: "Using for await...of when you want parallel execution — it awaits each item sequentially. For parallel processing, use Promise.all(array.map(async item => ...)).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "abort-controller-async",
        fn: "AbortController (Async Cancellation)",
        desc: "Cancel fetch requests and abort async operations.",
        category: "Async",
        subtitle: "Graceful cancellation of in-flight requests",
        signature: "const controller = new AbortController()\nfetch(url, { signal: controller.signal })\ncontroller.abort()",
        descLong: "AbortController allows canceling fetch requests and any other operation that accepts an AbortSignal. Useful for cleanup, timeouts, and user-initiated cancellations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AbortController (Async Cancellation) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest AbortController: cancel fetch and detect AbortError.\n// STRENGTHS - six lines; shows signal, abort, and AbortError detection.\n// WEAKNESSES- no timeout, no shared signal, no React cleanup.\n//\n// GOAL: cancel a fetch request and detect cancellation\nconst controller = new AbortController();\nfetch('/api/data', { signal: controller.signal })\n  .catch(err => {\n    if (err.name === 'AbortError') console.log('Cancelled');\n  });\ncontroller.abort();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AbortController (Async Cancellation) — common patterns you'll see in production.\n// APPROACH  - Combine AbortController (Async Cancellation) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - AbortController recipes: shared signal for multiple requests,\n//             timeout wrapper with cleanup.\n// STRENGTHS - covers the 80% case: shared signal + timeout wrapper.\n// WEAKNESSES- no React cleanup; no AbortSignal.timeout; no composition.\n//\n// GOAL: share a controller and build a timeout helper\n// WHY: one signal can cancel multiple requests\nconst controller2 = new AbortController();\nPromise.all([\n  fetch('/api/users', { signal: controller2.signal }),\n  fetch('/api/posts', { signal: controller2.signal }),\n  fetch('/api/comments', { signal: controller2.signal })\n]);\nsetTimeout(() => controller2.abort(), 3000);\n// WHY: timeout wrapper\nasync function fetchWithTimeout(url, timeoutMs = 5000) {\n  const controller = new AbortController();\n  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);\n  try {\n    const response = await fetch(url, { signal: controller.signal });\n    clearTimeout(timeoutId);\n    return response.json();\n  } catch (err) {\n    if (err.name === 'AbortError') throw new Error(`Request timeout after ${timeoutMs}ms`);\n    throw err;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AbortController (Async Cancellation) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production async cancellation: a cancellable task manager that\n//             supports nested cancellation, periodic abort checks, and\n//             graceful cleanup on abort.\n// STRENGTHS - nested cancellation scopes; periodic abort checks for long tasks;\n//             cleanup callbacks run on abort; works with any async operation.\n// WEAKNESSES- adds boilerplate; requires discipline to check signal.aborted.\n//\n// GOAL: production async cancellation manager\n// WHY: signal.aborted can be checked before starting work\nclass CancelScope {\n  #controller = new AbortController();\n  #cleanupCallbacks = [];\n  get signal() { return this.#controller.signal; }\n  get aborted() { return this.#controller.signal.aborted; }\n  abort(reason) {\n    this.#controller.abort(reason);\n    this.#runCleanup();\n  }\n  onCancel(cb) { this.#cleanupCallbacks.push(cb); }\n  #runCleanup() {\n    for (const cb of this.#cleanupCallbacks) {\n      try { cb(); } catch (e) { console.error('Cleanup error:', e); }\n    }\n    this.#cleanupCallbacks = [];\n  }\n  // Create a child scope — aborting parent aborts children\n  fork() {\n    const child = new CancelScope();\n    this.onCancel(() => child.abort());\n    return child;\n  }\n}\n// Long-running task with periodic abort checks\nasync function processData(data, scope) {\n  const results = [];\n  for (let i = 0; i < data.length; i++) {\n    if (scope.aborted) throw new Error('Task cancelled');\n    // Check every 100 items\n    if (i % 100 === 0) await new Promise(r => setTimeout(r, 0)); // yield\n    results.push(transform(data[i]));\n  }\n  return results;\n}\n// Usage: parent scope cancels all children\nconst parent = new CancelScope();\nconst fetchScope = parent.fork();\nconst processScope = parent.fork();\nfetchScope.onCancel(() => console.log('Fetch cancelled'));\nprocessScope.onCancel(() => console.log('Processing cancelled'));\n// Start tasks\nconst fetchPromise = fetch('/api/data', { signal: fetchScope.signal })\n  .then(r => r.json());\nconst processPromise = fetchPromise.then(data => processData(data, processScope));\n// Cancel everything (e.g., user navigated away)\n// parent.abort(); // logs: Fetch cancelled, Processing cancelled\n// Decision rule:\n//   single request with timeout                            -> AbortSignal.timeout(ms)\n//   multiple related requests                              -> share AbortController\n//   React effect cleanup                                   -> abort on unmount\n//   long-running task                                      -> check signal.aborted periodically\n//   nested cancellation scopes                             -> CancelScope.fork() (above)\n//   cleanup on abort                                       -> onCancel() (above)\n//\n// Anti-pattern: not distinguishing AbortError from real errors; not checking\n//   signal.aborted in long-running loops; not running cleanup on abort."
                  }
        ],
        tips: [
                  "AbortError is thrown when .abort() called — check err.name === \"AbortError\" to distinguish from network errors",
                  "Each controller manages one signal — create multiple controllers for independent cancellation",
                  "Works with any async operation that accepts AbortSignal (fetch, some readableStream APIs)",
                  "AbortSignal.timeout(ms) creates auto-aborting signal (modern browsers): fetch(url, { signal: AbortSignal.timeout(5000) })"
        ],
        mistake: "Not checking signal.aborted before starting async work. Always check before fetch to avoid unnecessary network requests.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "top-level-await",
        fn: "Top-Level Await",
        desc: "Use await at module top level (not inside async function).",
        category: "Async",
        subtitle: "Async module initialization without async function wrapper",
        signature: "await asyncFunction() // in module scope",
        descLong: "In ES modules, await can be used at the top level without wrapping in async function. Useful for loading configuration, initializing databases, or waiting for resources before module executes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Top-Level Await — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest top-level await: fetch config at module load.\n// STRENGTHS - three lines; shows await outside async function in ESM.\n// WEAKNESSES- no error handling, no parallel, no fallback.\n//\n// GOAL: use await at module top level\nconst config = await fetch('/api/config').then(r => r.json());\nexport { config };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Top-Level Await — common patterns you'll see in production.\n// APPROACH  - Combine Top-Level Await with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - top-level await recipes: DB initialization, conditional\n//             dynamic import based on environment.\n// STRENGTHS - covers the 80% case: init + conditional loading.\n// WEAKNESSES- no error handling, no parallel init, no fallback.\n//\n// GOAL: initialize modules and load conditionally\n// WHY: importing module blocks until top-level awaits resolve\nconst db = await initDatabase();\nexport { db };\n// Conditional async loading\nlet cache = null;\nif (process.env.NODE_ENV === 'production') {\n  cache = await import('./cache-redis.js').then(m => m.default);\n} else {\n  cache = await import('./cache-memory.js').then(m => m.default);\n}\nexport { cache };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Top-Level Await — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production top-level await patterns: parallel initialization\n//             with Promise.all, fallback with try/catch, and a comparison\n//             with async IIFE for CommonJS compatibility.\n// STRENGTHS - parallel init reduces startup time; fallback prevents module\n//             load failure; clear CJS vs ESM guidance.\n// WEAKNESSES- top-level await blocks all importing modules; errors prevent load.\n//\n// GOAL: production top-level await patterns\n// WHY: only works in ES modules (type=\"module\" or .mjs), not CJS\n// Parallel initialization — multiple independent resources\nconst [db, cache, features] = await Promise.all([\n  initDatabase(),\n  initCache(),\n  fetch('/api/features').then(r => r.json()),\n]);\nexport { db, cache, features };\n// Fallback on failure — don't let one failure block the entire module\nlet analytics = null;\ntry {\n  analytics = await import('./analytics.js').then(m => m.default);\n} catch (err) {\n  console.warn('Analytics failed to load, using noop:', err.message);\n  analytics = { track: () => {}, identify: () => {} };\n}\nexport { analytics };\n// Conditional feature loading with config\nconst config = await fetch('/api/config').then(r => r.json());\nconst experimental = config.features?.experimental\n  ? await import('./experimental.js').then(m => m.default)\n  : null;\nexport { experimental };\n// CommonJS fallback (when ESM is not available)\n// In CommonJS, use async IIFE instead:\n// (async () => {\n//   const config = await fetch('/api/config').then(r => r.json());\n//   module.exports = { config };\n// })();\n// Decision rule:\n//   module initialization data                              -> top-level await\n//   multiple independent resources                          -> Promise.all at top level\n//   fallback on failure                                     -> wrap in try/catch\n//   CommonJS / Node without ESM                             -> wrap in async IIFE\n//   conditional feature loading                             -> dynamic import + await\n//\n// Anti-pattern: heavy sequential top-level awaits blocking app startup; not\n//   providing fallbacks for non-critical resources; using top-level await in\n//   CommonJS (SyntaxError); blocking on slow external APIs without timeout."
                  }
        ],
        tips: [
                  "Only works in ES modules (type=\"module\" in HTML or .mjs files), not CommonJS",
                  "Importing module with top-level await blocks until all awaits resolve",
                  "Useful for config loading, database initialization, feature flag checks",
                  "Error in top-level await prevents module import — use try/catch if fallback needed"
        ],
        mistake: "Using top-level await in CommonJS or assuming synchronous module load. Top-level await is async — importing modules may delay further execution.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
