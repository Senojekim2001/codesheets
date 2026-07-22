export const meta = {
  "title": "Advanced Node.js",
  "domain": "nodejs",
  "sheet": "advanced",
  "icon": "🟢"
}

export const sections = [

  // ── Section 1: Scaling & Process Management ─────────────────────────────────────────
  {
    id: "scaling",
    title: "Scaling & Process Management",
    entries: [
      {
        id: "cluster-module",
        fn: "Cluster Module — Multi-Process Scaling",
        desc: "Fork worker processes to utilize all CPU cores — one process per core for maximum throughput.",
        category: "Scaling",
        subtitle: "cluster.fork(), worker management, zero-downtime restart",
        signature: "cluster.isPrimary  |  cluster.fork()  |  cluster.on(\"exit\", fn)",
        descLong: "Node.js is single-threaded, but the cluster module forks multiple worker processes sharing the same port. The OS load-balances incoming connections across workers. Each worker is a full Node.js process with its own event loop and memory. Use for CPU-bound HTTP servers. PM2 provides production-ready clustering with monitoring and zero-downtime reloads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cluster Module — Multi-Process Scaling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport cluster from 'node:cluster';\nimport http from 'node:http';\nimport os from 'node:os';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cluster Module — Multi-Process Scaling — common patterns you'll see in production.\n// APPROACH  - Combine Cluster Module — Multi-Process Scaling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst numCPUs = os.availableParallelism(); // or os.cpus().length\nif (cluster.isPrimary) {\n  console.log(`Primary ${process.pid} forking ${numCPUs} workers`);\n  // Fork workers\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n  // Replace dead workers\n  cluster.on('exit', (worker, code, signal) => {\n    console.log(`Worker ${worker.process.pid} died (${signal || code})`);\n    if (!worker.exitedAfterDisconnect) {\n      console.log('Starting replacement worker...');\n      cluster.fork();\n    }\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cluster Module — Multi-Process Scaling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Zero-downtime restart\n  process.on('SIGUSR2', () => {\n    const workers = Object.values(cluster.workers);\n    const restartWorker = (index) => {\n      if (index >= workers.length) return;\n      const worker = workers[index];\n      worker.disconnect();\n      worker.on('exit', () => {\n        if (!worker.exitedAfterDisconnect) return;\n        const newWorker = cluster.fork();\n        newWorker.on('listening', () => restartWorker(index + 1));\n      });\n    };\n    restartWorker(0);\n  });\n} else {\n  // Workers share the same port\n  http.createServer((req, res) => {\n    res.writeHead(200);\n    res.end(`Worker ${process.pid} handled this request\\n`);\n  }).listen(3000);\n  console.log(`Worker ${process.pid} started`);\n}\n// Production alternative: PM2\n// pm2 start app.js -i max         # fork per CPU\n// pm2 reload app                  # zero-downtime restart\n// pm2 monit                       # real-time monitoring"
                  }
        ],
        tips: [
                  "Use os.availableParallelism() (Node 19+) instead of os.cpus().length — it respects cgroup CPU limits in containers.",
                  "Workers don't share memory — use Redis or a message broker for shared state between workers.",
                  "PM2 handles clustering, monitoring, log management, and zero-downtime reloads — use it in production.",
                  "In Docker/Kubernetes, run one process per container and scale with replicas instead of clustering."
        ],
        mistake: "Using cluster for CPU-intensive computation — each worker still has one thread. Use worker_threads for CPU-bound tasks and cluster for scaling I/O-bound HTTP servers.",
        shorthand: {
          verbose: "// Manual fork loop\nif (cluster.isPrimary) {\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n  cluster.on('exit', (w) => {\n    if (!w.exitedAfterDisconnect) cluster.fork();\n  });\n}",
          concise: "cluster.fork() in isPrimary block; cluster.on('exit') for auto-restart",
        },
      },
      {
        id: "worker-threads",
        fn: "Worker Threads — CPU-Bound Tasks",
        desc: "Run CPU-intensive code in parallel threads without blocking the main event loop.",
        category: "Scaling",
        subtitle: "new Worker(), postMessage, SharedArrayBuffer",
        signature: "new Worker(\"./task.js\", { workerData })  |  parentPort.postMessage(result)",
        descLong: "Worker threads run JavaScript in parallel OS threads with their own V8 isolates. Unlike cluster (separate processes), workers can share memory via SharedArrayBuffer. Use for CPU-heavy tasks: image processing, crypto, parsing, compression. Communication via postMessage (structured clone) or shared memory. The main thread stays responsive for HTTP requests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Threads — CPU-Bound Tasks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// main.js — dispatch work to a thread pool\nimport { Worker } from 'node:worker_threads';\nimport os from 'node:os';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Threads — CPU-Bound Tasks — common patterns you'll see in production.\n// APPROACH  - Combine Worker Threads — CPU-Bound Tasks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Thread pool\nclass WorkerPool {\n  #workers = [];\n  #queue = [];\n  constructor(workerFile, size = os.availableParallelism()) {\n    for (let i = 0; i < size; i++) {\n      this.#addWorker(workerFile);\n    }\n  }\n  #addWorker(file) {\n    const worker = new Worker(file);\n    worker.on('message', (result) => {\n      worker._resolve(result);\n      worker._busy = false;\n      this.#processQueue();\n    });\n    worker._busy = false;\n    this.#workers.push(worker);\n  }\n  #processQueue() {\n    const idle = this.#workers.find(w => !w._busy);\n    if (!idle || this.#queue.length === 0) return;\n    const { data, resolve } = this.#queue.shift();\n    idle._busy = true;\n    idle._resolve = resolve;\n    idle.postMessage(data);\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Threads — CPU-Bound Tasks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nrun(data) {\n    return new Promise(resolve => {\n      this.#queue.push({ data, resolve });\n      this.#processQueue();\n    });\n  }\n}\n// Usage\nconst pool = new WorkerPool('./hash-worker.js', 4);\nconst results = await Promise.all(\n  passwords.map(pw => pool.run(pw))\n);\n// hash-worker.js\nimport { parentPort } from 'node:worker_threads';\nimport { scryptSync } from 'node:crypto';\nparentPort.on('message', (password) => {\n  const hash = scryptSync(password, 'salt', 64).toString('hex');\n  parentPort.postMessage(hash);\n});"
                  }
        ],
        tips: [
                  "Worker threads share the process but have separate V8 isolates — module-level variables are NOT shared.",
                  "postMessage uses structured clone (deep copy) — use SharedArrayBuffer for zero-copy data sharing.",
                  "Create a thread pool and reuse workers — spawning a new Worker per task is expensive (~5ms overhead).",
                  "Use Atomics with SharedArrayBuffer for lock-free synchronization between threads."
        ],
        mistake: "Creating a new Worker for every small task — Worker startup costs ~5ms and allocates a new V8 isolate. Pool workers and reuse them for repeated tasks.",
        shorthand: {
          verbose: "// Create worker per task\nfor (const item of items) {\n  const w = new Worker('./worker.js');\n  w.on('message', resolve);\n  w.postMessage(item);\n}",
          concise: "new Worker('./worker.js', { workerData }) with thread pool + postMessage",
        },
      },
      {
        id: "child-process",
        fn: "Child Process — Shell Commands & IPC",
        desc: "Spawn external processes, run shell commands, and communicate with child processes via IPC.",
        category: "Process",
        subtitle: "exec, execFile, spawn, fork, IPC messaging",
        signature: "execFile(\"cmd\", args)  |  spawn(\"cmd\", args, { stdio })  |  fork(\"script.js\")",
        descLong: "child_process runs external programs from Node.js. exec: runs a shell command, buffers output (good for small output). execFile: runs a binary directly without a shell (safer, faster). spawn: streams stdio (good for large output). fork: spawns a Node.js process with built-in IPC channel. Always prefer execFile over exec to avoid shell injection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Child Process — Shell Commands & IPC — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { exec, execFile, spawn, fork } from 'node:child_process';\nimport { promisify } from 'node:util';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Child Process — Shell Commands & IPC — common patterns you'll see in production.\n// APPROACH  - Combine Child Process — Shell Commands & IPC with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst execAsync = promisify(exec);\nconst execFileAsync = promisify(execFile);\n// exec — shell command (buffers output)\nconst { stdout } = await execAsync('ls -la /tmp');\nconsole.log(stdout);\n// execFile — safer, no shell (preferred)\nconst { stdout: gitLog } = await execFileAsync('git', ['log', '--oneline', '-5']);\n// spawn — streaming (for large output)\nconst child = spawn('find', ['/home', '-name', '*.js'], {\n  stdio: ['ignore', 'pipe', 'pipe'],\n});\nconst chunks = [];\nchild.stdout.on('data', (chunk) => chunks.push(chunk));\nchild.on('close', (code) => {\n  const output = Buffer.concat(chunks).toString();\n  console.log(`Found ${output.split('\\n').length} files (exit: ${code})`);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Child Process — Shell Commands & IPC — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// fork — Node.js child with IPC\n// parent.js\nconst worker = fork('./heavy-computation.js');\nworker.send({ task: 'fibonacci', n: 45 });\nworker.on('message', (result) => {\n  console.log('Result:', result);\n  worker.kill();\n});\n// heavy-computation.js\n// process.on('message', ({ task, n }) => {\n//   const result = fibonacci(n);\n//   process.send(result);\n// });\n// Timeout and abort\nconst controller = new AbortController();\nsetTimeout(() => controller.abort(), 5000);\ntry {\n  const { stdout } = await execFileAsync('slow-command', [], {\n    signal: controller.signal,\n    timeout: 10000,\n  });\n} catch (err) {\n  if (err.killed) console.log('Process timed out');\n}"
                  }
        ],
        tips: [
                  "Use execFile over exec — exec runs through a shell, making it vulnerable to command injection.",
                  "spawn streams output — use for commands that produce large output (find, grep, log tailing).",
                  "fork() creates a Node.js child with built-in IPC — use process.send()/on(\"message\") for communication.",
                  "Always set a timeout on external commands — a hung process blocks the parent indefinitely."
        ],
        mistake: "Using exec with user input: exec(`grep ${userInput} file`) — this is command injection. User could input \"; rm -rf /\". Use execFile with args array instead.",
        shorthand: {
          verbose: "const child = spawn('find', ['/dir']);\nlet data = '';\nchild.stdout.on('data', (chunk) => {\n  data += chunk;\n});\nchild.on('close', (code) => {\n  console.log(data);\n});",
          concise: "const { stdout } = await execFileAsync('cmd', args); or spawn() for streaming",
        },
      },
    ],
  },

  // ── Section 2: Diagnostics & Security ─────────────────────────────────────────
  {
    id: "diagnostics-security",
    title: "Diagnostics & Security",
    entries: [
      {
        id: "diagnostics-debugging",
        fn: "Diagnostics & Performance Profiling",
        desc: "Profile CPU, detect memory leaks, trace async operations, and generate heap snapshots.",
        category: "Diagnostics",
        subtitle: "--inspect, heap snapshots, perf_hooks, async_hooks",
        signature: "node --inspect app.js  |  perf_hooks.performance.mark()  |  --heap-prof",
        descLong: "Node.js has built-in diagnostic tools. --inspect enables Chrome DevTools debugging. perf_hooks measures precise timings. --heap-prof generates heap profiles for memory leak detection. diagnostics_channel provides event-based observability. Use clinic.js for automated performance analysis. process.memoryUsage() tracks memory consumption over time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Diagnostics & Performance Profiling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { performance, PerformanceObserver } from 'node:perf_hooks';\n// Mark and measure\nperformance.mark('start-db');\nawait queryDatabase();\nperformance.mark('end-db');\nperformance.measure('DB Query', 'start-db', 'end-db');\n// Observer for all measurements\nconst obs = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);\n  }\n});\nobs.observe({ entryTypes: ['measure'] });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Diagnostics & Performance Profiling — common patterns you'll see in production.\n// APPROACH  - Combine Diagnostics & Performance Profiling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction logMemory() {\n  const mem = process.memoryUsage();\n  console.log({\n    rss: `${(mem.rss / 1024 / 1024).toFixed(1)}MB`,\n    heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(1)}MB`,\n    heapTotal: `${(mem.heapTotal / 1024 / 1024).toFixed(1)}MB`,\n    external: `${(mem.external / 1024 / 1024).toFixed(1)}MB`,\n  });\n}\nsetInterval(logMemory, 10000);\nimport v8 from 'node:v8';\nimport fs from 'node:fs';\nfunction takeHeapSnapshot() {\n  const filename = `heap-${Date.now()}.heapsnapshot`;\n  const stream = v8.writeHeapSnapshot(filename);\n  console.log(`Heap snapshot written to ${stream}`);\n  // Open in Chrome DevTools → Memory tab\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Diagnostics & Performance Profiling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nlet lastCheck = performance.now();\nsetInterval(() => {\n  const now = performance.now();\n  const lag = now - lastCheck - 1000;  // expected 1000ms\n  if (lag > 100) console.warn(`Event loop lag: ${lag.toFixed(0)}ms`);\n  lastCheck = now;\n}, 1000);\n// CLI diagnostic commands:\n// node --inspect app.js              # Chrome DevTools debugger\n// node --prof app.js                 # V8 CPU profile\n// node --prof-process isolate-*.log  # Process profile\n// node --heap-prof app.js            # Heap allocation profile\n// npx clinic doctor -- node app.js   # Automated analysis"
                  }
        ],
        tips: [
                  "performance.mark()/measure() is precise (microseconds) — use for benchmarking specific operations.",
                  "Take heap snapshots at intervals to find growing objects — compare snapshots in Chrome DevTools.",
                  "Event loop lag >100ms means your server is blocking — profile CPU usage to find the culprit.",
                  "clinic.js (npm) automates detection of event loop issues, I/O bottlenecks, and memory leaks."
        ],
        mistake: "Using console.time() for production monitoring — it writes to stdout (I/O) and can't be programmatically consumed. Use perf_hooks for structured performance data.",
        shorthand: {
          verbose: "console.time('db');\n// ... do work\nconsole.timeEnd('db');\n// or process.memoryUsage() manually logged",
          concise: "node --inspect for Chrome DevTools; perf_hooks.performance.mark/measure(); --prof + node --prof-process",
        },
      },
      {
        id: "security-best-practices",
        fn: "Security Best Practices",
        desc: "Protect Node.js applications — input validation, rate limiting, helmet, CORS, and dependency auditing.",
        category: "Security",
        subtitle: "helmet, rate-limit, cors, npm audit, input sanitization",
        signature: "app.use(helmet())  |  app.use(rateLimit({ max: 100 }))  |  npm audit",
        descLong: "Node.js security covers multiple layers: HTTP headers (helmet), rate limiting (express-rate-limit), CORS configuration, input validation (zod/joi), SQL/NoSQL injection prevention (parameterized queries), dependency auditing (npm audit), and secrets management. Follow OWASP guidelines. Never trust client input — validate and sanitize everything.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Security Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport helmet from 'helmet';\nimport rateLimit from 'express-rate-limit';\nimport cors from 'cors';\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Security Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Security Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Security headers (XSS, clickjacking, MIME sniffing protection)\napp.use(helmet());\n// CORS — restrict to known origins\napp.use(cors({\n  origin: ['https://myapp.com', 'https://admin.myapp.com'],\n  methods: ['GET', 'POST', 'PUT', 'DELETE'],\n  credentials: true,\n}));\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000,  // 15 minutes\n  max: 100,                    // 100 requests per window\n  standardHeaders: true,\n  legacyHeaders: false,\n  message: { error: 'Too many requests, try again later' },\n});\napp.use('/api/', limiter);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Security Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Stricter limit for auth routes\nconst authLimiter = rateLimit({ windowMs: 60000, max: 5 });\napp.use('/api/auth/', authLimiter);\n// Input validation with Zod\nconst createUserSchema = z.object({\n  name: z.string().min(1).max(100).trim(),\n  email: z.string().email().toLowerCase(),\n  age: z.number().int().min(0).max(150).optional(),\n});\napp.post('/api/users', async (req, res) => {\n  const result = createUserSchema.safeParse(req.body);\n  if (!result.success) {\n    return res.status(400).json({ errors: result.error.flatten() });\n  }\n  const { name, email, age } = result.data;  // validated & typed\n  // Use parameterized queries — NEVER string interpolation\n  await db.query('INSERT INTO users (name, email) VALUES ($1, $2)', [name, email]);\n});\n// npm audit — check dependencies for vulnerabilities\n// npm audit\n// npm audit fix\n// npm audit --production   # only production deps"
                  }
        ],
        tips: [
                  "helmet() sets 15+ security headers in one line — always use it as the first middleware.",
                  "Rate limit auth endpoints aggressively (5/min) — brute force attacks target login and password reset.",
                  "Validate ALL input with Zod/Joi on the server — client-side validation is easily bypassed.",
                  "Run npm audit in CI — fail the build if high/critical vulnerabilities are found."
        ],
        mistake: "Using cors({ origin: \"*\" }) in production — it allows any website to make authenticated requests to your API. Whitelist specific origins.",
        shorthand: {
          verbose: "app.use((req, res, next) => {\n  if (req.headers.origin === 'https://myapp.com') {\n    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);\n  }\n  next();\n});\napp.use((req, res, next) => {\n  const input = req.body.name;\n  if (!input.match(/^[a-z]+$/)) return res.status(400);\n  next();\n});",
          concise: "helmet() + rateLimit() + cors({ origin: ['https://myapp.com'] }) + zod.parse(req.body)",
        },
      },
      {
        id: "graceful-shutdown",
        fn: "Graceful Shutdown & Error Handling",
        desc: "Handle process signals, drain connections, and implement global error handling for production stability.",
        category: "Production",
        subtitle: "SIGTERM handling, uncaughtException, connection draining",
        signature: "process.on(\"SIGTERM\", shutdown)  |  process.on(\"unhandledRejection\", handler)",
        descLong: "Production Node.js must handle shutdown signals (SIGTERM from Docker/K8s, SIGINT from Ctrl+C) gracefully — stop accepting new connections, finish in-flight requests, close database pools, then exit. Uncaught exceptions and unhandled promise rejections should be logged and the process restarted (not ignored). PM2 or Kubernetes handle automatic restarts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Graceful Shutdown & Error Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport http from 'node:http';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Graceful Shutdown & Error Handling — common patterns you'll see in production.\n// APPROACH  - Combine Graceful Shutdown & Error Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst server = http.createServer(app);\nconst connections = new Set();\n// Track active connections\nserver.on('connection', (conn) => {\n  connections.add(conn);\n  conn.on('close', () => connections.delete(conn));\n});\n// Graceful shutdown\nasync function shutdown(signal) {\n  console.log(`${signal} received. Starting graceful shutdown...`);\n  // 1. Stop accepting new connections\n  server.close(() => {\n    console.log('HTTP server closed');\n  });\n  // 2. Close idle keep-alive connections\n  for (const conn of connections) {\n    conn.end();\n  }\n  // 3. Close database connections\n  try {\n    await db.end();\n    console.log('Database pool closed');\n  } catch (err) {\n    console.error('Error closing database:', err);\n  }\n  // 4. Close other resources (Redis, message queues, etc.)\n  await redis.quit();\n  await messageQueue.close();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Graceful Shutdown & Error Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// 5. Force exit after timeout\n  setTimeout(() => {\n    console.error('Forced shutdown after timeout');\n    process.exit(1);\n  }, 30000).unref();\n  process.exit(0);\n}\nprocess.on('SIGTERM', () => shutdown('SIGTERM'));\nprocess.on('SIGINT', () => shutdown('SIGINT'));\n// Global error handlers\nprocess.on('uncaughtException', (err) => {\n  console.error('Uncaught Exception:', err);\n  // Log to monitoring service, then exit (process is in unknown state)\n  shutdown('uncaughtException');\n});\nprocess.on('unhandledRejection', (reason, promise) => {\n  console.error('Unhandled Rejection at:', promise, 'reason:', reason);\n  // In Node 15+, unhandled rejections crash by default (correct behavior)\n});\n// Health check endpoint (for load balancers)\napp.get('/health', (req, res) => {\n  if (shuttingDown) return res.status(503).json({ status: 'shutting down' });\n  res.json({ status: 'ok', uptime: process.uptime() });\n});\nserver.listen(3000, () => console.log('Server running on port 3000'));"
                  }
        ],
        tips: [
                  "Kubernetes sends SIGTERM, then waits 30s before SIGKILL — use all 30s to drain connections gracefully.",
                  "Set server.keepAliveTimeout and server.headersTimeout to avoid hanging connections during shutdown.",
                  "After uncaughtException, the process is in an unknown state — log the error and EXIT, don't continue.",
                  "Health check endpoints should return 503 during shutdown — so load balancers stop routing traffic."
        ],
        mistake: "Calling process.exit() immediately on SIGTERM — it kills in-flight requests, causing 502 errors for users. Always drain existing connections before exiting.",
        shorthand: {
          verbose: "process.on('SIGTERM', () => {\n  console.log('Exiting...');\n  process.exit(0);\n});",
          concise: "process.on('SIGTERM', () => { server.close(() => { db.close(); process.exit(0); }) })",
        },
      },
      {
        id: "worker-threads",
        fn: "Worker Threads — CPU-Bound Tasks",
        desc: "Run CPU-intensive code in parallel threads: new Worker(), workerData, parentPort communication.",
        category: "Scaling",
        subtitle: "worker_threads, Worker pool, postMessage, SharedArrayBuffer",
        signature: "new Worker(\"./worker.js\", { workerData })  |  parentPort.on(\"message\", fn)  |  postMessage(result)",
        descLong: "Worker threads execute JavaScript in parallel OS threads with separate V8 isolates. Unlike cluster (separate processes), threads share memory via SharedArrayBuffer. Ideal for CPU-bound work: crypto, compression, image processing. Main thread stays responsive for I/O.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Threads — CPU-Bound Tasks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// main.js — thread pool manager\nimport { Worker } from 'node:worker_threads';\nimport os from 'node:os';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Threads — CPU-Bound Tasks — common patterns you'll see in production.\n// APPROACH  - Combine Worker Threads — CPU-Bound Tasks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass ThreadPool {\n  #workers = [];\n  #queue = [];\n  constructor(script, poolSize = os.availableParallelism()) {\n    for (let i = 0; i < poolSize; i++) {\n      this.#createWorker(script);\n    }\n  }\n  #createWorker(script) {\n    const worker = new Worker(script);\n    worker.on('message', (result) => {\n      worker._resolve?.(result);\n      worker._busy = false;\n      this.#process();\n    });\n    worker._busy = false;\n    this.#workers.push(worker);\n  }\n  #process() {\n    const idle = this.#workers.find(w => !w._busy);\n    if (!idle || !this.#queue.length) return;\n    const { data, resolve } = this.#queue.shift();\n    idle._busy = true;\n    idle._resolve = resolve;\n    idle.postMessage(data);\n  }\n  run(data) {\n    return new Promise(resolve => {\n      this.#queue.push({ data, resolve });\n      this.#process();\n    });\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Threads — CPU-Bound Tasks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst pool = new ThreadPool('./crypto-worker.js', 4);\n// Hash 100 passwords in parallel\nconst hashes = await Promise.all(\n  passwords.map(pw => pool.run(pw))\n);\n// crypto-worker.js\nimport { parentPort } from 'node:worker_threads';\nimport { scryptSync } from 'node:crypto';\nparentPort.on('message', (password) => {\n  const hash = scryptSync(password, 'salt', 64).toString('hex');\n  parentPort.postMessage(hash);\n});"
                  }
        ],
        tips: [
                  "Thread startup costs ~5ms — pool and reuse workers.",
                  "postMessage uses structured clone (deep copy) — zero-copy with SharedArrayBuffer.",
                  "Worker threads share the process — memory is cheaper than cluster."
        ],
        mistake: "Creating new Worker per task instead of pooling — huge overhead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nnew Worker(script); worker.on('message', resolve); worker.postMessage(data);\n// More explicit but longer",
          concise: "Worker pool + postMessage for CPU-intensive work",
        },
      },
      {
        id: "cluster-module-advanced",
        fn: "Cluster Module — Multi-Process Scaling",
        desc: "Fork worker processes to utilize all CPU cores — one process per core for maximum throughput.",
        category: "Scaling",
        subtitle: "cluster.fork(), worker management, zero-downtime restart",
        signature: "cluster.isPrimary  |  cluster.fork()  |  cluster.on(\"exit\", fn)",
        descLong: "Node.js is single-threaded, but the cluster module forks multiple worker processes sharing the same port. The OS load-balances incoming connections across workers. Each worker is a full Node.js process with its own event loop and memory. Use for CPU-bound HTTP servers. PM2 provides production-ready clustering with monitoring and zero-downtime reloads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cluster Module — Multi-Process Scaling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport cluster from 'node:cluster';\nimport http from 'node:http';\nimport os from 'node:os';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cluster Module — Multi-Process Scaling — common patterns you'll see in production.\n// APPROACH  - Combine Cluster Module — Multi-Process Scaling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst numCPUs = os.availableParallelism();\nif (cluster.isPrimary) {\n  console.log(`Primary ${process.pid} forking ${numCPUs} workers`);\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cluster Module — Multi-Process Scaling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ncluster.on('exit', (worker, code, signal) => {\n    console.log(`Worker ${worker.process.pid} died (${signal || code})`);\n    if (!worker.exitedAfterDisconnect) {\n      console.log('Starting replacement...');\n      cluster.fork();\n    }\n  });\n  // Zero-downtime reload\n  process.on('SIGUSR2', () => {\n    const workers = Object.values(cluster.workers);\n    const restart = (idx) => {\n      if (idx >= workers.length) return;\n      workers[idx].disconnect();\n      workers[idx].on('exit', () => {\n        const newWorker = cluster.fork();\n        newWorker.on('listening', () => restart(idx + 1));\n      });\n    };\n    restart(0);\n  });\n} else {\n  http.createServer((req, res) => {\n    res.end(`Worker ${process.pid}\\n`);\n  }).listen(3000);\n}"
                  }
        ],
        tips: [
                  "In Docker/K8s, run one process per container instead of clustering.",
                  "PM2 abstracts clustering — simpler than manual fork management.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using cluster for CPU-intensive work — use worker_threads instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ncluster.fork() loop in isPrimary; cluster.on('exit') to restart\n// More explicit but longer",
          concise: "isPrimary branch: fork workers + exit handler; else: listen on port",
        },
      },
      {
        id: "vm-module",
        fn: "VM Module — Sandboxed Code Execution",
        desc: "Run untrusted code safely: vm.Script, vm.runInNewContext with isolated scope.",
        category: "Execution",
        subtitle: "vm.Script, vm.runInNewContext, vm.runInThisContext, context isolation",
        signature: "new vm.Script(code)  |  vm.runInNewContext(code, context)  |  script.runInContext(context)",
        descLong: "The vm module executes JavaScript in isolated contexts. Useful for running untrusted code, templates, expressions. Context isolation prevents access to globals. Cannot prevent resource exhaustion (CPU, memory).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of VM Module — Sandboxed Code Execution — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport vm from 'node:vm';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of VM Module — Sandboxed Code Execution — common patterns you'll see in production.\n// APPROACH  - Combine VM Module — Sandboxed Code Execution with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Simple expression evaluation\nconst script = new vm.Script('a + b');\nconst context = { a: 5, b: 3 };\nconst result = script.runInNewContext(context);\nconsole.log(result); // 8\n// Template evaluation with custom context\nconst userCode = 'return name.toUpperCase() + \"!\"';\nconst sandbox = { name: 'alice' };\nconst output = vm.runInThisContext(\n  `(function() { ${userCode} })()`,\n  { displayErrors: true }\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of VM Module — Sandboxed Code Execution — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Safer: run in completely new context (no access to process/require)\nconst isolatedContext = vm.createContext({\n  Math,\n  String,\n  Array,\n  JSON,\n  // SAFE: no process, fs, require, eval\n});\nconst tplScript = new vm.Script('JSON.stringify({ x: 1 + 1 })');\nconst tplResult = tplScript.runInContext(isolatedContext);\nconsole.log(tplResult); // {\"x\":2}"
                  }
        ],
        tips: [
                  "vm.runInNewContext is safest — isolated from all globals.",
                  "Still vulnerable to infinite loops/memory exhaustion — set timeout/limits.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Running user code without vm — allows access to require, process, fs.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst script = new vm.Script(code); const context = vm.createContext(sandbox); script.runInContext(context);\n// More explicit but longer",
          concise: "vm.Script + vm.runInNewContext for code isolation",
        },
      },
      {
        id: "diagnostics-channel",
        fn: "Diagnostics Channel — Framework Observability",
        desc: "Subscribe to framework events: http, database, queues — for monitoring without patching.",
        category: "Diagnostics",
        subtitle: "diagnostics_channel, channel.publish, subscribe",
        signature: "channel.subscribe(listener)  |  channel.publish(data)  |  diagnostic:http:*",
        descLong: "diagnostics_channel lets frameworks emit structured events without patching code. Subscribers listen for http requests, database queries, async operations. Core for observability and APM.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Diagnostics Channel — Framework Observability — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { channel } from 'node:diagnostics_channel';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Diagnostics Channel — Framework Observability — common patterns you'll see in production.\n// APPROACH  - Combine Diagnostics Channel — Framework Observability with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Subscribe to HTTP requests (Node.js built-in)\nconst httpChannel = channel.channel('http.client.request.start');\nhttpChannel.subscribe((msg) => {\n  console.log('HTTP request:', {\n    url: msg.request.url,\n    method: msg.request.method,\n    timestamp: Date.now(),\n  });\n});\n// Custom channel for application\nconst appEvents = channel.channel('app:order:created');\nappEvents.subscribe((data) => {\n  console.log('Order created:', data.orderId);\n  sendMetrics(data);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Diagnostics Channel — Framework Observability — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Publish custom event\nfunction createOrder(order) {\n  const saved = db.orders.insert(order);\n  appEvents.publish({\n    orderId: saved.id,\n    amount: saved.total,\n    timestamp: Date.now(),\n  });\n  return saved;\n}\n// List all channels\nconst allChannels = channel.findOrCreate('myapp:*');"
                  }
        ],
        tips: [
                  "Channels only work if subscribed — zero overhead when unused.",
                  "Built-in channels: http.client.*, http.server.*, sql.* (with driver support).",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not subscribing to channels — missing observability data.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst ch = channel.channel('app:event'); ch.subscribe(msg => {}); ch.publish({ data });\n// More explicit but longer",
          concise: "channel.subscribe() for events; channel.publish() to emit",
        },
      },
      {
        id: "node-perf-hooks",
        fn: "Performance Hooks — Timing & Observability",
        desc: "Measure performance: mark(), measure(), PerformanceObserver, resource timing.",
        category: "Diagnostics",
        subtitle: "performance.mark/measure, PerformanceObserver, timing precision",
        signature: "performance.mark(name)  |  performance.measure(name, start, end)  |  new PerformanceObserver(cb)",
        descLong: "perf_hooks provides microsecond-precision timing. mark() records time points. measure() computes duration. PerformanceObserver listens for measurements. Better than console.time() for structured metrics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Performance Hooks — Timing & Observability — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { performance, PerformanceObserver } from 'node:perf_hooks';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Performance Hooks — Timing & Observability — common patterns you'll see in production.\n// APPROACH  - Combine Performance Hooks — Timing & Observability with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Manual timing\nperformance.mark('db-start');\nconst users = await db.users.findMany();\nperformance.mark('db-end');\nperformance.measure('Database Query', 'db-start', 'db-end');\n// Observer pattern\nconst obs = new PerformanceObserver((list) => {\n  for (const entry of list.getEntries()) {\n    console.log(`${entry.name}: ${entry.duration.toFixed(2)}ms`);\n    if (entry.duration > 100) {\n      console.warn('Slow operation detected');\n    }\n  }\n});\nobs.observe({ entryTypes: ['measure', 'function'] });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Performance Hooks — Timing & Observability — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Detailed timing\nperformance.mark('api-start', { detail: { endpoint: '/users' } });\nawait handleRequest();\nperformance.mark('api-end', { detail: { endpoint: '/users' } });\nperformance.measure('API Response', 'api-start', 'api-end');\n// Get all entries\nconst entries = performance.getEntries();\nconsole.log(entries);"
                  }
        ],
        tips: [
                  "Marks cost nearly nothing — use liberally in production.",
                  "PerformanceObserver enables structured, programmatic metric collection.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using console.time() — not programmatic, can't send to monitoring systems.",
        shorthand: {
          verbose: "// Manual / verbose approach\nperformance.mark('start'); await work(); performance.mark('end'); performance.measure('time', 'start', 'end');\n// More explicit but longer",
          concise: "mark() + measure() + PerformanceObserver for structured timing",
        },
      },
      {
        id: "node-crypto-modern",
        fn: "Node.js Crypto — Modern APIs",
        desc: "Cryptography: crypto.subtle (Web Crypto), randomUUID, hkdf, secure random.",
        category: "Security",
        subtitle: "crypto.subtle, randomUUID, hkdf, generateKeyPair, encrypt/decrypt",
        signature: "crypto.subtle.digest(algo, data)  |  crypto.randomUUID()  |  crypto.hkdf()",
        descLong: "crypto module provides modern Web Crypto APIs (crypto.subtle) plus Node extensions. Supports digest, sign, encrypt, key generation. crypto.randomUUID() generates v4 UUIDs. crypto.hkdf() derives keys. Always prefer crypto.subtle for standard algorithms.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Node.js Crypto — Modern APIs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport crypto from 'node:crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Node.js Crypto — Modern APIs — common patterns you'll see in production.\n// APPROACH  - Combine Node.js Crypto — Modern APIs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Generate random UUID\nconst userId = crypto.randomUUID();\n// Generate secure random bytes\nconst token = crypto.randomBytes(32).toString('hex');\n// SHA-256 digest\nconst message = 'hello world';\nconst hash = crypto.createHash('sha256')\n  .update(message)\n  .digest('hex');\n// Web Crypto API (modern, standardized)\nconst data = new TextEncoder().encode('secret');\nconst digest = await crypto.subtle.digest('SHA-256', data);\nconsole.log(Buffer.from(digest).toString('hex'));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Node.js Crypto — Modern APIs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// HKDF key derivation\ncrypto.hkdf('sha256', Buffer.from('inputKey'), Buffer.from('salt'), Buffer.from('info'), 32, (err, derivedKey) => {\n  if (err) throw err;\n  console.log(derivedKey.toString('hex'));\n});\n// Generate asymmetric key pair\nconst { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {\n  modulusLength: 2048,\n  publicKeyEncoding: { type: 'spki', format: 'pem' },\n  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },\n});\n// Sign and verify\nconst sign = crypto.createSign('sha256');\nsign.update('message');\nconst signature = sign.sign(privateKey);\nconst verify = crypto.createVerify('sha256');\nverify.update('message');\nconst valid = verify.verify(publicKey, signature);"
                  }
        ],
        tips: [
                  "randomBytes + randomUUID are cryptographically secure.",
                  "Use crypto.subtle for standard algorithms (NIST) — best compatibility.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using Math.random() for security — it's predictable.",
        shorthand: {
          verbose: "// Manual / verbose approach\ncrypto.randomUUID(); crypto.randomBytes(n); crypto.createHash('sha256').update(data).digest('hex');\n// More explicit but longer",
          concise: "randomUUID() + randomBytes() + crypto.subtle.digest() + hkdf",
        },
      },
      {
        id: "node-readline",
        fn: "Readline Module — Interactive Input",
        desc: "Read user input line-by-line: readline.createInterface, question(), async iteration.",
        category: "I/O",
        subtitle: "createInterface, question, readline/promises, line events",
        signature: "createInterface({ input, output })  |  rl.question(prompt)  |  for await...of rl",
        descLong: "readline reads input stream line-by-line. createInterface for callbacks. readline/promises for async/await. Used for interactive CLIs, REPLs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Readline Module — Interactive Input — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport readline from 'node:readline/promises';\nimport { stdin, stdout } from 'node:process';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Readline Module — Interactive Input — common patterns you'll see in production.\n// APPROACH  - Combine Readline Module — Interactive Input with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst rl = readline.createInterface({ input: stdin, output: stdout });\n// Prompt for input\nconst name = await rl.question('What is your name? ');\nconst age = await rl.question('How old are you? ');\nconsole.log(`Hello ${name}, age ${age}!`);\nrl.close();\n// Read file line-by-line\nimport fs from 'node:fs';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Readline Module — Interactive Input — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst fileRl = readline.createInterface({\n  input: fs.createReadStream('data.txt'),\n  crlfDelay: Infinity,\n});\nfor await (const line of fileRl) {\n  console.log(`Line: ${line}`);\n}\n// Interactive loop\nconst rl2 = readline.createInterface({ input: stdin, output: stdout });\nfor await (const line of rl2) {\n  if (line === 'exit') break;\n  console.log('You typed:', line);\n}"
                  }
        ],
        tips: [
                  "readline/promises is easier with async/await.",
                  "for await...of automatically handles line events.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not closing readline interface — leaves process hanging.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst rl = readline.createInterface({ input, output }); const ans = await rl.question('?'); rl.close();\n// More explicit but longer",
          concise: "readline/promises + createInterface + for await...of",
        },
      },
      {
        id: "node-sqlite",
        fn: "Built-in SQLite (Node 22+)",
        desc: "Use SQLite directly in Node.js: new DatabaseSync(), no npm install needed.",
        category: "Databases",
        subtitle: "DatabaseSync, exec(), prepare(), synchronous API, no dependencies",
        signature: "new DatabaseSync(\":memory:\")  |  db.exec(sql)  |  db.prepare(sql).get/all/run()",
        descLong: "Node 22+ includes built-in SQLite via node:sqlite. Synchronous API (blocks event loop but simple). Perfect for development, testing, embedded databases. No setup required.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Built-in SQLite (Node 22+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { DatabaseSync } from 'node:sqlite';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Built-in SQLite (Node 22+) — common patterns you'll see in production.\n// APPROACH  - Combine Built-in SQLite (Node 22+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// In-memory or file-based\nconst db = new DatabaseSync(':memory:');\n// const db = new DatabaseSync('data.db');\n// Create table\ndb.exec(`\n  CREATE TABLE users (\n    id INTEGER PRIMARY KEY,\n    name TEXT NOT NULL,\n    email TEXT UNIQUE\n  )\n`);\n// Prepare and run\nconst insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');\ninsert.run('Alice', 'alice@example.com');\ninsert.run('Bob', 'bob@example.com');\n// Query\nconst select = db.prepare('SELECT * FROM users WHERE name = ?');\nconst user = select.get('Alice');\nconsole.log(user); // { id: 1, name: 'Alice', email: 'alice@example.com' }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Built-in SQLite (Node 22+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Get all rows\nconst allUsers = select.all();\n// Count\nconst count = db.prepare('SELECT COUNT(*) as count FROM users').get();\nconsole.log(count.count);\n// Close\ndb.close();"
                  }
        ],
        tips: [
                  "Synchronous API is simple but blocks — fine for small queries, not OLTP.",
                  "Excellent for local development, testing, config storage.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Using in high-concurrency server — synchronous API will block.",
        shorthand: {
          verbose: "// Manual / verbose approach\nnew DatabaseSync(':memory:'); db.exec(sql); db.prepare(sql).run(args);\n// More explicit but longer",
          concise: "DatabaseSync(':memory:') + exec() + prepare().get/all/run()",
        },
      },
      {
        id: "abort-controller-node",
        fn: "AbortController in Node.js",
        desc: "Cancel async operations: AbortSignal.timeout(), fetch, streams, timeouts.",
        category: "I/O",
        subtitle: "AbortController, AbortSignal.timeout(), signal propagation",
        signature: "new AbortController()  |  AbortSignal.timeout(ms)  |  signal in fetch/fs",
        descLong: "AbortController cancels fetch, streams, timers. AbortSignal.timeout() auto-aborts after ms. Chain via signal option.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of AbortController in Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { fetch } from 'node:http';\nimport fs from 'node:fs/promises';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of AbortController in Node.js — common patterns you'll see in production.\n// APPROACH  - Combine AbortController in Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Manual abort\nconst controller = new AbortController();\nconst timeoutId = setTimeout(() => {\n  controller.abort();\n}, 5000);\ntry {\n  const res = await fetch('https://api.example.com/data', {\n    signal: controller.signal\n  });\n  clearTimeout(timeoutId);\n  const data = await res.json();\n  console.log(data);\n} catch (err) {\n  if (err.name === 'AbortError') {\n    console.log('Fetched aborted/timed out');\n  }\n}\n// AbortSignal.timeout() — automatic\nconst signal = AbortSignal.timeout(5000);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of AbortController in Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntry {\n  const res = await fetch('https://example.com', { signal });\n  const data = await res.json();\n} catch (err) {\n  if (err.name === 'AbortError') {\n    console.log('Request timed out');\n  }\n}\n// Works with streams\nconst readStream = fs.createReadStream('large-file.txt');\nreadStream.pipe(process.stdout);\n// Cancel after 10s\nconst abortStream = AbortSignal.timeout(10000);\nabortStream.addEventListener('abort', () => {\n  readStream.destroy();\n  console.log('Stream cancelled');\n});"
                  }
        ],
        tips: [
                  "AbortSignal.timeout() is the easiest timeout pattern.",
                  "Works across fetch, fs, streams — consistent cancellation API.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not handling AbortError — unhandled rejection.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst controller = new AbortController(); setTimeout(() => controller.abort(), ms); await fetch(url, { signal: controller.signal });\n// More explicit but longer",
          concise: "AbortSignal.timeout(ms) + try/catch for AbortError",
        },
      },
    ],
  },
]

export default { meta, sections }
