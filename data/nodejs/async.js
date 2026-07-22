export const meta = {
  "title": "Async & Concurrency",
  "domain": "nodejs",
  "sheet": "async",
  "icon": "⚡"
}

export const sections = [

  // ── Section 1: Async & Concurrency ─────────────────────────────────────────
  {
    id: "async-concurrency",
    title: "Async & Concurrency",
    entries: [
      {
        id: "async-await-basics",
        fn: "async/await",
        desc: "Write asynchronous code that reads like synchronous code — the modern way to handle Promises in Node.js.",
        category: "Async Patterns",
        subtitle: "Promise-based concurrency with clean syntax",
        signature: "async function fn() { const result = await promise; return result; }",
        descLong: "async functions always return a Promise. The await keyword pauses execution until the Promise settles. Errors are caught with try/catch. async/await is syntactic sugar over .then() chains but much more readable. Always handle errors with try/catch or .catch() at the call site.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of async/await — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic async/await\nasync function fetchUser(userId) {\n  try {\n    const res = await fetch(`/api/users/${userId}`);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    const user = await res.json();\n    return user;\n  } catch (err) {\n    console.error('Fetch failed:', err.message);\n    throw err; // or return a default\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of async/await — common patterns you'll see in production.\n// APPROACH  - Combine async/await with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Sequential operations\nasync function processData() {\n  const user = await fetchUser(123);\n  const posts = await fetch(`/api/posts?userId=${user.id}`).then(r => r.json());\n  return { user, posts };\n}\n// Parallel operations with Promise.all\nasync function getMultiple() {\n  const [user, config] = await Promise.all([\n    fetchUser(123),\n    fetch('/api/config').then(r => r.json()),\n  ]);\n  return { user, config };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of async/await — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Call async functions (always returns a Promise)\nfetchUser(123).catch(err => console.error(err));"
                  }
        ],
        tips: [
                  "await can only be used inside async functions — use .then() at the top level or use top-level await in modules.",
                  "Promise.all() runs all Promises concurrently — perfect for fetching multiple resources in parallel.",
                  "Always wrap await in try/catch or chain .catch() — unhandled rejections crash the process.",
                  "Return a value from async function — it automatically wraps in a resolved Promise."
        ],
        mistake: "Using await in a loop instead of Promise.all() — this runs Promises sequentially instead of concurrently, killing performance.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "promise-all-allsettled",
        fn: "Promise.all / Promise.allSettled",
        desc: "Run multiple Promises concurrently — wait for all to resolve or handle partial failures gracefully.",
        category: "Async Patterns",
        subtitle: "Concurrent Promise execution",
        signature: "Promise.all(promises)  |  Promise.allSettled(promises)",
        descLong: "Promise.all(array) runs all Promises in parallel and rejects if ANY fail — useful for atomic operations. Promise.allSettled(array) waits for all and returns results with status (fulfilled/rejected) — ideal when you need all results regardless of errors. Always use Promise.all for critical multi-step operations, allSettled for resilient data fetching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.all / Promise.allSettled — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Promise.all — atomic (all or nothing)\nasync function fetchUserWithDependencies(userId) {\n  try {\n    const [user, posts, comments] = await Promise.all([\n      fetch(`/api/users/${userId}`).then(r => r.json()),\n      fetch(`/api/posts?userId=${userId}`).then(r => r.json()),\n      fetch(`/api/comments?userId=${userId}`).then(r => r.json()),\n    ]);\n    return { user, posts, comments };\n  } catch (err) {\n    // If ANY fails, the whole thing fails\n    throw new Error('Could not fetch user data');\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.all / Promise.allSettled — common patterns you'll see in production.\n// APPROACH  - Combine Promise.all / Promise.allSettled with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Promise.allSettled — resilient (partial failure OK)\nasync function fetchFromMultipleSources() {\n  const results = await Promise.allSettled([\n    fetch('https://api1.com/data').then(r => r.json()),\n    fetch('https://api2.com/data').then(r => r.json()),\n    fetch('https://api3.com/data').then(r => r.json()),\n  ]);\n  const fulfilled = results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n  const failed = results\n    .filter(r => r.status === 'rejected')\n    .map(r => r.reason);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.all / Promise.allSettled — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconsole.log(`Got ${fulfilled.length} results, ${failed.length} failed`);\n  return fulfilled;\n}"
                  }
        ],
        tips: [
                  "Promise.all() rejects immediately on first error — use allSettled() if you need results from all, even failed ones.",
                  "Wrap promises in try/catch inside the array to handle individual errors: Promise.all(promises.map(p => p.catch(e => null)))",
                  "Promise.all([]) returns an empty array immediately — no promises = instant resolution.",
                  "allSettled() always resolves with status/value or status/reason — never throws."
        ],
        mistake: "Using Promise.all for operations that might fail individually when you actually need the successful ones — use allSettled and filter results instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "promise-race-any",
        fn: "Promise.race / Promise.any",
        desc: "Race multiple Promises — wait for the first to settle (race) or the first to succeed (any).",
        category: "Concurrency",
        subtitle: "First-to-finish Promise patterns",
        signature: "Promise.race(promises)  |  Promise.any(promises)",
        descLong: "Promise.race() returns as soon as the first Promise settles (resolves or rejects). Promise.any() returns as soon as the first resolves (ignores rejections). Use race() for timeouts or competitive operations; use any() for fallback sources. Always handle the \"all rejected\" case with any().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise.race / Promise.any — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Promise.race — timeout pattern\nfunction fetchWithTimeout(url, timeoutMs) {\n  const timeout = new Promise((_, reject) =>\n    setTimeout(() => reject(new Error('Timeout')), timeoutMs)\n  );\n  return Promise.race([\n    fetch(url).then(r => r.json()),\n    timeout,\n  ]);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise.race / Promise.any — common patterns you'll see in production.\n// APPROACH  - Combine Promise.race / Promise.any with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Call it\nfetchWithTimeout('/api/users', 5000)\n  .then(data => console.log(data))\n  .catch(err => console.log('Failed or timed out:', err.message));\n// Promise.any — first success from multiple sources\nasync function fetchFromFallbacks(urls) {\n  try {\n    const data = await Promise.any(\n      urls.map(url => fetch(url).then(r => r.json()))\n    );\n    return data;\n  } catch (err) {\n    // AggregateError if all promises rejected\n    throw new Error('All sources failed');\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise.race / Promise.any — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Practical: first response wins\nconst firstResponse = await Promise.race([\n  fetch('https://primary-api.com/data').then(r => r.json()),\n  fetch('https://fallback-api.com/data').then(r => r.json()),\n]);"
                  }
        ],
        tips: [
                  "Promise.race() rejects if the first promise rejects — use Promise.any() to ignore individual failures.",
                  "Promise.any() throws AggregateError with all reasons if ALL promises reject — always handle it.",
                  "Use race() for timeout patterns: Promise.race([fetch(), timeout]).",
                  "race() is useful for \"first to complete\" operations like load-balancing across multiple servers."
        ],
        mistake: "Using Promise.race() for fallbacks when you should use Promise.any() — race will reject immediately if the first promise rejects, even if others would succeed.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "worker-threads",
        fn: "Worker Threads",
        desc: "Offload CPU-intensive work to separate threads — keeps the main event loop responsive.",
        category: "Concurrency",
        subtitle: "True parallelism for heavy computations",
        signature: "const worker = new Worker(\"./worker.js\")  →  worker.postMessage(data)",
        descLong: "Worker Threads run JavaScript in separate threads — perfect for crypto, image processing, or heavy calculations. Main thread sends data via postMessage(); workers receive via message event. Workers do NOT share memory by default — use SharedArrayBuffer for large data. Always handle errors with worker.on(\"error\").",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Threads — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// main.js\nimport { Worker } from 'worker_threads';\nimport path from 'path';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Threads — common patterns you'll see in production.\n// APPROACH  - Combine Worker Threads with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction runWorker(workerData) {\n  return new Promise((resolve, reject) => {\n    const worker = new Worker('./worker.js', { workerData });\n    worker.on('message', (result) => {\n      resolve(result);\n      worker.terminate();\n    });\n    worker.on('error', reject);\n    worker.on('exit', (code) => {\n      if (code !== 0) {\n        reject(new Error(`Worker stopped with code ${code}`));\n      }\n    });\n  });\n}\n// CPU-heavy operation\nconst result = await runWorker({ data: 'compute this' });\nconsole.log('Result:', result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Threads — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// ---- worker.js ----\nimport { parentPort, workerData } from 'worker_threads';\nfunction expensiveCalculation(data) {\n  // Simulate heavy work\n  let sum = 0;\n  for (let i = 0; i < 1_000_000_000; i++) {\n    sum += i;\n  }\n  return { computed: true, sum };\n}\nconst result = expensiveCalculation(workerData);\nparentPort.postMessage(result);"
                  }
        ],
        tips: [
                  "Worker Threads are TRUE parallelism — unlike async/await, they run on separate CPU cores.",
                  "Each worker is a separate V8 instance — significant memory overhead, so pool them for reuse.",
                  "Use worker-threads library or piscina for worker pooling in production.",
                  "SharedArrayBuffer allows zero-copy data passing but is complex — usually not worth it."
        ],
        mistake: "Spawning a new Worker for every single task — workers are expensive. Use a pool (piscina or node-worker-threads-pool) to reuse them.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "timers-eventloop",
        fn: "Timers: setTimeout, setImmediate, process.nextTick",
        desc: "Schedule code to run at different phases of the event loop — control execution order and avoid blocking.",
        category: "Concurrency",
        subtitle: "Event loop scheduling primitives",
        signature: "setTimeout(fn, ms)  |  setImmediate(fn)  |  process.nextTick(fn)",
        descLong: "process.nextTick() runs before any I/O; setImmediate() runs in the check phase; setTimeout() with 0ms runs in the timer phase. Timers are microtasks (nextTick) vs macrotasks (setImmediate, setTimeout). Understanding the event loop is essential for performance. Never use setTimeout for delays under 4ms in Node — use setImmediate.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Timers: setTimeout, setImmediate, process.nextTick — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Event loop order\nconsole.log('1. Sync');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Timers: setTimeout, setImmediate, process.nextTick — common patterns you'll see in production.\n// APPROACH  - Combine Timers: setTimeout, setImmediate, process.nextTick with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nprocess.nextTick(() => console.log('2. nextTick'));\nsetTimeout(() => console.log('4. setTimeout'), 0);\nsetImmediate(() => console.log('3. setImmediate'));\nPromise.resolve().then(() => console.log('2b. Promise'));\n// Output:\n// 1. Sync\n// 2. nextTick\n// 2b. Promise\n// 3. setImmediate\n// 4. setTimeout"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Timers: setTimeout, setImmediate, process.nextTick — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Practical: defer expensive work\nfunction processLargeArray(items) {\n  let index = 0;\n  function processChunk() {\n    const end = Math.min(index + 100, items.length);\n    for (let i = index; i < end; i++) {\n      heavyOperation(items[i]);\n    }\n    index = end;\n    if (index < items.length) {\n      setImmediate(processChunk); // Yield to other I/O\n    }\n  }\n  processChunk();\n}"
                  }
        ],
        tips: [
                  "process.nextTick() is faster than setImmediate() — runs earlier in the event loop phase.",
                  "Never use busy loops — use setImmediate() to yield control and process I/O requests.",
                  "Timers have minimum ~4ms resolution on most systems — don't rely on setTimeout(fn, 0) for tight loops.",
                  "setImmediate() is better for breaking up CPU work; setTimeout(fn, 0) is better for I/O."
        ],
        mistake: "Using synchronous loops to process huge datasets — blocks the event loop and makes the server unresponsive. Use setImmediate() to break it into chunks.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "abort-controller-signal",
        fn: "AbortController / AbortSignal",
        desc: "Cancel async operations — fetch requests, Promises, timers — with a unified abort API.",
        category: "Concurrency",
        subtitle: "Cancellation for long-running operations",
        signature: "const controller = new AbortController()  →  controller.signal  →  controller.abort()",
        descLong: "AbortController lets you cancel fetch, timers, and other async operations. Create a controller, pass controller.signal to fetch or setTimeout, then call controller.abort() to cancel. The signal emits an abort event and throws an AbortError in operations listening to it. Essential for cleanup and preventing memory leaks from orphaned requests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AbortController / AbortSignal — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// AbortController with fetch\nconst controller = new AbortController();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AbortController / AbortSignal — common patterns you'll see in production.\n// APPROACH  - Combine AbortController / AbortSignal with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Cancel after 5 seconds\nconst timeout = setTimeout(() => controller.abort(), 5000);\ntry {\n  const response = await fetch('/api/data', {\n    signal: controller.signal,\n  });\n  const data = await response.json();\n  return data;\n} catch (err) {\n  if (err.name === 'AbortError') {\n    console.log('Request was cancelled');\n  } else {\n    throw err;\n  }\n} finally {\n  clearTimeout(timeout);\n}\n// Custom async operation with abort support\nfunction delayedOperation(ms, signal) {\n  return new Promise((resolve, reject) => {\n    if (signal?.aborted) {\n      return reject(new DOMException('Aborted', 'AbortError'));\n    }\n    const timeout = setTimeout(resolve, ms);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AbortController / AbortSignal — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst abortHandler = () => {\n      clearTimeout(timeout);\n      reject(new DOMException('Aborted', 'AbortError'));\n    };\n    signal?.addEventListener('abort', abortHandler, { once: true });\n  });\n}\n// Cleanup with abort\nconst ctrl = new AbortController();\ndelayedOperation(3000, ctrl.signal).catch(console.error);\nsetTimeout(() => ctrl.abort(), 1000); // Cancel after 1 second"
                  }
        ],
        tips: [
                  "AbortSignal is supported by fetch, setTimeout (via AbortSignal.timeout()), and custom async functions.",
                  "Always check signal?.aborted in your async functions before starting work.",
                  "Use signal?.addEventListener(\"abort\", handler) or .throwIfAborted() to react to cancellation.",
                  "Clean up timers and listeners in finally {} blocks to prevent memory leaks."
        ],
        mistake: "Not handling AbortError in catch blocks — the error name is \"AbortError\", and you must check for it explicitly or it will crash.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "async-generators",
        fn: "Async Generators & Iterators",
        desc: "Use async generators (async function*) to yield Promises — perfect for async iteration with for await...of.",
        category: "Async Patterns",
        subtitle: "Async iteration with generators",
        signature: "async function* gen() { yield await promise; } → for await (const item of gen()) { }",
        descLong: "Async generators combine generators and async/await. They yield values (often from Promises) and can be iterated with for await...of. Essential for creating async iterables: database cursors, API pagination, streaming data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Async Generators & Iterators — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic async generator\nasync function* asyncCounter(max) {\n  for (let i = 1; i <= max; i++) {\n    // Simulate async operation\n    await new Promise(r => setTimeout(r, 100));\n    yield i;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Async Generators & Iterators — common patterns you'll see in production.\n// APPROACH  - Combine Async Generators & Iterators with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Consume with for await...of\nfor await (const num of asyncCounter(5)) {\n  console.log(num);\n}\n// Paginated API fetcher\nasync function* fetchPages(apiUrl, pageSize = 10) {\n  let page = 1;\n  while (true) {\n    try {\n      const response = await fetch(`${apiUrl}?page=${page}&limit=${pageSize}`);\n      const data = await response.json();\n      if (data.items.length === 0) break; // No more items\n      for (const item of data.items) {\n        yield item;\n      }\n      if (!data.hasMore) break;\n      page++;\n    } catch (err) {\n      console.error('Fetch error:', err);\n      throw err;\n    }\n  }\n}\n// Usage\nfor await (const user of fetchPages('https://api.example.com/users')) {\n  console.log('User:', user.name);\n}\n// Database cursor generator\nasync function* queryDatabase(query) {\n  const connection = await db.connect();\n  try {\n    const cursor = connection.query(query);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Async Generators & Iterators — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nwhile (true) {\n      const row = await cursor.next();\n      if (!row) break;\n      yield row;\n    }\n  } finally {\n    await connection.close();\n  }\n}\n// File reading by lines with async generator\nimport { createReadStream } from 'fs';\nimport { createInterface } from 'readline';\nasync function* readLines(filePath) {\n  const fileStream = createReadStream(filePath);\n  const rl = createInterface({\n    input: fileStream,\n    crlfDelay: Infinity,\n  });\n  for await (const line of rl) {\n    if (line.trim()) yield line;\n  }\n}\n// Usage\nfor await (const line of readLines('./data.txt')) {\n  console.log(line);\n}\n// Async generator with error handling\nasync function* safeAsyncGen(items) {\n  for (const item of items) {\n    try {\n      const result = await processItem(item);\n      yield result;\n    } catch (err) {\n      console.error(`Failed to process ${item}:`, err.message);\n      // Continue to next item instead of failing\n    }\n  }\n}\n// Chain generators\nasync function* combination() {\n  yield* asyncCounter(3);   // Yield all values from another generator\n  yield* fetchPages('/api'); // Then fetch pages\n}\nfor await (const item of combination()) {\n  console.log(item);\n}"
                  }
        ],
        tips: [
                  "Async generators are lazy — they only execute when iterated.",
                  "Use yield* to delegate to another generator (including async generators).",
                  "Always clean up resources (files, connections) in finally blocks when using async generators.",
                  "for await...of automatically handles errors — async generator errors propagate via catch."
        ],
        mistake: "Creating all items upfront in an array when you should use an async generator to process on-demand.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "promise-error-handling",
        fn: "Promise Error Handling",
        desc: "Catch promise rejections, handle unhandled rejections, and implement retry logic.",
        category: "Async Patterns",
        subtitle: "Robust error handling for Promises",
        signature: "promise.catch(err => {})  |  process.on(\"unhandledRejection\", handler)",
        descLong: "Every Promise must have error handling (try/catch in async, .catch(), or handler). Unhandled rejections are warnings (deprecated) or errors (newer Node). Implement exponential backoff retry for transient failures. Distinguish between recoverable (network timeout) and fatal (validation error) failures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Try/catch with async/await (recommended)\nasync function safeFetch(url) {\n  try {\n    const res = await fetch(url);\n    if (!res.ok) throw new Error(`HTTP ${res.status}`);\n    return await res.json();\n  } catch (err) {\n    if (err.name === 'TypeError') {\n      console.error('Network error:', err.message);\n    } else if (err instanceof SyntaxError) {\n      console.error('Invalid JSON:', err.message);\n    } else {\n      console.error('Fetch error:', err);\n    }\n    throw err; // Re-throw or return fallback\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Promise Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// .catch() pattern (for promise chains)\nfetch(url)\n  .then(res => res.json())\n  .then(data => processData(data))\n  .catch(err => {\n    console.error('Error in chain:', err);\n    return null; // Return fallback\n  });\n// Retry with exponential backoff\nasync function fetchWithRetry(url, maxRetries = 3, backoffMs = 1000) {\n  for (let attempt = 1; attempt <= maxRetries; attempt++) {\n    try {\n      const res = await fetch(url);\n      if (!res.ok) {\n        throw new Error(`HTTP ${res.status}`);\n      }\n      return await res.json();\n    } catch (err) {\n      const isLastAttempt = attempt === maxRetries;\n      // Don't retry on client errors (4xx)\n      if (err.statusCode >= 400 && err.statusCode < 500) {\n        throw err;\n      }\n      if (isLastAttempt) {\n        throw err; // Give up\n      }\n      const delay = backoffMs * Math.pow(2, attempt - 1);\n      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);\n      await new Promise(r => setTimeout(r, delay));\n    }\n  }\n}\n// Unhandled rejection handler (catch-all)\nprocess.on('unhandledRejection', (reason, promise) => {\n  console.error('Unhandled rejection:', reason);\n  console.error('Promise:', promise);\n  // Log to error tracking service (Sentry, etc)\n  process.exit(1); // Exit on unhandled error\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Promise.all with partial failure handling\nasync function fetchMultipleWithTolerance(urls) {\n  const results = await Promise.allSettled(\n    urls.map(url => fetchWithRetry(url))\n  );\n  const successes = results\n    .filter(r => r.status === 'fulfilled')\n    .map(r => r.value);\n  const failures = results\n    .filter(r => r.status === 'rejected')\n    .map((r, i) => ({ url: urls[i], error: r.reason }));\n  if (failures.length > 0) {\n    console.warn(`Failed to fetch ${failures.length} URLs`);\n  }\n  return successes;\n}\n// Error class for specific handling\nclass RetryableError extends Error {\n  constructor(message, isRetryable = true) {\n    super(message);\n    this.isRetryable = isRetryable;\n  }\n}\nasync function fetchSmart(url) {\n  try {\n    const res = await fetch(url, { timeout: 5000 });\n    if (res.status === 503) {\n      throw new RetryableError('Service temporarily unavailable');\n    }\n    if (res.status === 400) {\n      throw new RetryableError('Bad request', false); // Don't retry\n    }\n    return await res.json();\n  } catch (err) {\n    if (err instanceof TypeError && err.message.includes('timeout')) {\n      throw new RetryableError('Request timeout');\n    }\n    throw err;\n  }\n}"
                  }
        ],
        tips: [
                  "Always handle promise rejections — unhandled rejections will crash in future Node versions.",
                  "Use try/catch with async/await — cleaner than .then()/.catch() chains.",
                  "Implement exponential backoff for retries — prevents overwhelming a struggling service.",
                  "Distinguish between transient (retry) and permanent (fail fast) errors."
        ],
        mistake: "Creating a Promise without a .catch() or try/catch — unhandled rejections cause process crashes or warnings.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "concurrent-queue",
        fn: "Concurrent Queue Pattern",
        desc: "Process items with limited concurrency using a queue — avoid overwhelming services.",
        category: "Concurrency",
        subtitle: "Bounded concurrency queue",
        signature: "class Queue { async process(items, concurrency) { } }",
        descLong: "A queue limits concurrent operations to a fixed number. Useful for rate limiting, database connection pooling, or API clients that have request limits. Process items sequentially or in batches with bounded concurrency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Concurrent Queue Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nclass Queue {\n  constructor(concurrency = 5) {\n    this.concurrency = concurrency;\n    this.running = 0;\n    this.queue = [];\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Concurrent Queue Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Concurrent Queue Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nasync add(task) {\n    return new Promise((resolve, reject) => {\n      this.queue.push({ task, resolve, reject });\n      this.process();\n    });\n  }\n  async process() {\n    if (this.running >= this.concurrency || this.queue.length === 0) {\n      return;\n    }\n    this.running++;\n    const { task, resolve, reject } = this.queue.shift();\n    try {\n      const result = await task();\n      resolve(result);\n    } catch (err) {\n      reject(err);\n    } finally {\n      this.running--;\n      this.process(); // Process next item\n    }\n  }\n}\n// Usage: fetch multiple URLs with concurrency limit\nconst queue = new Queue(3); // Max 3 concurrent requests\nconst urls = [\n  'https://api.example.com/1',\n  'https://api.example.com/2',\n  'https://api.example.com/3',\n  // ... 100 more URLs\n];"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Concurrent Queue Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst fetchTasks = urls.map(url => () => fetch(url).then(r => r.json()));\nconst results = await Promise.all(\n  fetchTasks.map(task => queue.add(task))\n);\n// Batch processing with concurrency\nasync function processBatchWithConcurrency(items, processor, concurrency = 5) {\n  const queue = new Queue(concurrency);\n  return Promise.all(\n    items.map(item => queue.add(() => processor(item)))\n  );\n}\n// Process database records in batches\nconst records = await db.query('SELECT * FROM users');\nawait processBatchWithConcurrency(\n  records,\n  async (user) => {\n    // Send email to user\n    await mailer.send(user.email, 'Newsletter');\n  },\n  10 // 10 concurrent email sends\n);\n// Advanced queue with retry\nclass QueueWithRetry extends Queue {\n  async add(task, retries = 3) {\n    return new Promise((resolve, reject) => {\n      const wrapper = async () => {\n        let lastErr;\n        for (let attempt = 1; attempt <= retries; attempt++) {\n          try {\n            return await task();\n          } catch (err) {\n            lastErr = err;\n            if (attempt < retries) {\n              await new Promise(r => setTimeout(r, 1000 * attempt));\n            }\n          }\n        }\n        throw lastErr;\n      };\n      this.queue.push({ task: wrapper, resolve, reject });\n      this.process();\n    });\n  }\n}"
                  }
        ],
        tips: [
                  "Use pLimit or p-queue npm packages in production — they handle edge cases better than manual implementation.",
                  "Set concurrency based on resource limits: database connections, API rate limits, CPU cores.",
                  "Monitor queue length — if it grows unbounded, you have too much incoming traffic.",
                  "Implement backoff/retry in the queue for resilience."
        ],
        mistake: "Sending unlimited concurrent requests to an external API — causes throttling or IP bans. Use a queue to respect rate limits.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "microtask-vs-macrotask",
        fn: "Microtasks vs Macrotasks",
        desc: "Understand event loop phases: microtasks (Promises, nextTick) run before macrotasks (setTimeout, setImmediate).",
        category: "Concurrency",
        subtitle: "Event loop execution order",
        signature: "process.nextTick() [microtask]  <  setImmediate() [macrotask]  <  setTimeout() [macrotask]",
        descLong: "The event loop has phases. Microtasks (Promise.then, process.nextTick) run before macrotasks (setTimeout, setImmediate). Within a phase, all microtasks drain before moving to the next phase. Understanding this prevents timing bugs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Microtasks vs Macrotasks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Event loop demonstration\nconsole.log('1. Sync');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Microtasks vs Macrotasks — common patterns you'll see in production.\n// APPROACH  - Combine Microtasks vs Macrotasks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Microtask: Promise\nPromise.resolve().then(() => console.log('5. Promise.then'));\n// Microtask: process.nextTick\nprocess.nextTick(() => console.log('2. nextTick'));\n// Macrotask: setTimeout (timer phase)\nsetTimeout(() => console.log('7. setTimeout 0'), 0);\n// Microtask: Promise again\nPromise.resolve().then(() => console.log('6. Promise.then 2'));\n// Macrotask: setImmediate (check phase)\nsetImmediate(() => console.log('8. setImmediate'));\nconsole.log('4. Sync 2');\n// Expected output:\n// 1. Sync\n// 4. Sync 2\n// 2. nextTick\n// 5. Promise.then\n// 6. Promise.then 2\n// 7. setTimeout 0\n// 8. setImmediate\n// Practical: defer expensive work\nfunction processLargeArray(items, onProgress) {\n  let index = 0;\n  function processChunk() {\n    const chunkSize = 100;\n    const end = Math.min(index + chunkSize, items.length);\n    for (let i = index; i < end; i++) {\n      heavyOperation(items[i]);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Microtasks vs Macrotasks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nindex = end;\n    onProgress(Math.round((index / items.length) * 100));\n    if (index < items.length) {\n      // Use setImmediate to yield to other I/O\n      setImmediate(processChunk);\n    }\n  }\n  processChunk();\n}\n// nextTick vs setImmediate for deferral\nconst readyCallbacks = [];\nfunction onReady(callback) {\n  readyCallbacks.push(callback);\n}\nfunction ready() {\n  // Run immediately after sync code, before I/O\n  // Use for critical setup\n  process.nextTick(() => {\n    readyCallbacks.forEach(cb => cb());\n  });\n}\n// Vs setImmediate for non-critical work:\nfunction queueWork(fn) {\n  setImmediate(fn); // Run after I/O operations have a chance\n}\n// Microtask-heavy code (can starve I/O)\nasync function badExample() {\n  for (let i = 0; i < 1000; i++) {\n    // Creating 1000 microtasks blocks I/O\n    await Promise.resolve();\n  }\n}\n// Better: use setImmediate to yield\nasync function goodExample() {\n  for (let i = 0; i < 1000; i++) {\n    if (i % 100 === 0) {\n      // Yield every 100 iterations\n      await new Promise(r => setImmediate(r));\n    }\n    await Promise.resolve();\n  }\n}"
                  }
        ],
        tips: [
                  "nextTick runs before all I/O — use for critical setup but don't starve I/O.",
                  "setImmediate yields to pending I/O — better for long-running CPU work.",
                  "Avoid creating thousands of microtasks (Promises) in a loop — use setImmediate to break it up.",
                  "setTimeout with 0ms still waits for the timer phase (slower than setImmediate)."
        ],
        mistake: "Using nextTick for work that should yield to I/O — creates an I/O-starved event loop.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "async-context-continuation",
        fn: "AsyncLocalStorage (Context)",
        desc: "Store context data that flows through async calls — request IDs, user info, correlation IDs.",
        category: "Async Patterns",
        subtitle: "Async-aware context storage",
        signature: "const storage = new AsyncLocalStorage()  →  storage.run(value, fn)",
        descLong: "AsyncLocalStorage (Node 13.10+) stores values that are accessible throughout an async call chain without manual passing. Perfect for request-scoped data: user ID, request ID, trace ID. Each async context has its own storage, preventing data leaks between requests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AsyncLocalStorage (Context) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { AsyncLocalStorage } from 'async_hooks';\nimport express from 'express';\nimport crypto from 'crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AsyncLocalStorage (Context) — common patterns you'll see in production.\n// APPROACH  - Combine AsyncLocalStorage (Context) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Create storage for request context\nconst requestContext = new AsyncLocalStorage();\nconst app = express();\n// Middleware: create request context\napp.use((req, res, next) => {\n  const context = {\n    requestId: crypto.randomUUID(),\n    userId: req.user?.id || null,\n    startTime: Date.now(),\n  };\n  // Run the rest of the request in this context\n  requestContext.run(context, () => next());\n});\n// Helper to get current context\nfunction getContext() {\n  return requestContext.getStore();\n}\n// Logger that includes context\nfunction log(level, message, data = {}) {\n  const context = getContext();\n  console.log(JSON.stringify({\n    level,\n    message,\n    requestId: context?.requestId,\n    userId: context?.userId,\n    ...data,\n  }));\n}\n// Route handler\napp.post('/api/users', async (req, res) => {\n  log('info', 'Creating user', { email: req.body.email });\n  // Log is automatically scoped to this request's context\n  // Even in nested async calls\n  const user = await createUser(req.body);\n  log('info', 'User created', { userId: user.id });\n  res.json(user);\n});\n// Async helper function (context flows automatically)\nasync function createUser(data) {\n  // Can access context without passing it\n  const ctx = getContext();\n  log('debug', 'Validating user data');\n  const user = await db.users.create(data);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AsyncLocalStorage (Context) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nlog('debug', 'User saved to database');\n  return user;\n}\n// Database layer (context still available)\nconst db = {\n  users: {\n    create: async (data) => {\n      const ctx = getContext();\n      // Add requestId to database audit log\n      await db.execute(\n        'INSERT INTO users (email, created_by_request) VALUES (?, ?)',\n        [data.email, ctx.requestId]\n      );\n      return { id: 1, ...data };\n    },\n  },\n  execute: async (query, params) => {\n    const ctx = getContext();\n    // Log query with request context\n    console.log(`[${ctx.requestId}] Executing: ${query}`);\n  },\n};\n// Nested async operations preserve context\nasync function complexOperation() {\n  const ctx = getContext();\n  // Parallel operations (context preserved in all)\n  const [user, posts, comments] = await Promise.all([\n    fetchUser(),\n    fetchPosts(),\n    fetchComments(),\n  ]);\n  log('info', 'Fetched data', {\n    userCount: 1,\n    postCount: posts.length,\n    commentCount: comments.length,\n  });\n  return { user, posts, comments };\n}\nasync function fetchUser() {\n  const ctx = getContext();\n  log('debug', 'Fetching user');\n  const user = await db.users.findById(ctx.userId);\n  return user;\n}\napp.listen(3000);"
                  }
        ],
        tips: [
                  "AsyncLocalStorage is perfect for request-scoped data: requestId, userId, traceId.",
                  "Context is automatically inherited by child async operations — no manual passing.",
                  "Use with structured logging to correlate logs from a single request.",
                  "Context is isolated per request — no data leaks between requests."
        ],
        mistake: "Passing context as function parameters everywhere — use AsyncLocalStorage to avoid parameter pollution.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
    ],
  },
]

export default { meta, sections }
