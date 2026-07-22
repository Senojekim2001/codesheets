export const meta = {
  "title": "Core Modules",
  "domain": "nodejs",
  "sheet": "core",
  "icon": "📦"
}

export const sections = [

  // ── Section 1: Core Modules ─────────────────────────────────────────
  {
    id: "core-modules",
    title: "Core Modules",
    entries: [
      {
        id: "node-console-stdout",
        fn: "console.log / process.stdout / process.stderr",
        desc: "Write to stdout and stderr — and how Node.js output differs from the browser.",
        category: "I/O",
        subtitle: "console.log, process.stdout.write, process.stderr, synchronous flushing",
        signature: "console.log(...args)  |  process.stdout.write(str)  |  process.stderr.write(str)",
        descLong: "In Node.js, console.log writes to process.stdout and console.error writes to process.stderr — both are synchronous when writing to a TTY (terminal) but asynchronous when piped. process.stdout.write() gives fine-grained control (no auto-newline, returns bool if buffer is drained). For production, replace console.log with pino or winston for structured JSON logging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of console.log / process.stdout / process.stderr — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nconsole.log('Hello, Node!');               // → stdout\nconsole.error('Something broke');          // → stderr\nconsole.warn('Check this');               // → stderr\nconsole.log('Name: %s, PID: %d', 'app', process.pid);  // printf-style"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of console.log / process.stdout / process.stderr — common patterns you'll see in production.\n// APPROACH  - Combine console.log / process.stdout / process.stderr with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nprocess.stdout.write('loading');\nprocess.stdout.write('.');\nprocess.stdout.write('.');\nprocess.stdout.write(' done\\n');           // loading.. done\n// Progress indicator in a loop:\nfor (let i = 0; i <= 100; i += 10) {\n  process.stdout.write(`\\rProgress: ${i}%  `);  // \\r rewrites line\n  // (would need actual async delay between writes)\n}\nprocess.stdout.write('\\n');\nprocess.stderr.write('Error: connection refused\\n');\n// Separate from stdout — can pipe them independently:\n// node app.js > output.log 2> errors.log\nif (process.stdout.isTTY) {\n  console.log('\\x1b[32m%s\\x1b[0m', 'Green text in terminal');\n} else {\n  console.log('Plain text (piped to file)');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of console.log / process.stdout / process.stderr — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst user = { id: 1, name: 'Alice', role: 'admin' };\nconsole.log(user);                         // { id: 1, name: 'Alice', role: 'admin' }\nconsole.log(JSON.stringify(user, null, 2)); // pretty-printed JSON\n// util.inspect for deep/circular structures:\nconst { inspect } = require('util');\nconsole.log(inspect(user, { depth: null, colors: true }));\n// const pino = require('pino');\n// const logger = pino({ level: 'info' });\n// logger.info({ userId: 1 }, 'User logged in');\n// → {\"level\":30,\"time\":...,\"userId\":1,\"msg\":\"User logged in\"}"
                  }
        ],
        tips: [
                  "process.stdout.write() is lower-level than console.log — use it when you need \\r (carriage return) for in-place updates like progress bars.",
                  "console.log is synchronous when writing to a TTY but async when piped — data can be lost on process.exit(). Use process.stdout.write() with a callback or await a drain event for guaranteed flushing.",
                  "process.stderr is unbuffered — writes are always immediate. Use it for errors and diagnostics so they never get lost.",
                  "In production Node.js apps, use pino (fastest) or winston — they give log levels, JSON output, and near-zero overhead when a level is disabled."
        ],
        mistake: "Calling process.exit(0) immediately after console.log in a piped context. The log may not flush before the process exits. Use process.stdout.write(msg, () => process.exit(0)) to exit only after the write completes.",
        shorthand: {
          verbose: "// Manual / verbose approach\nprocess.stdout.write(JSON.stringify(obj) + '\\n')\n// More explicit but longer",
          concise: "console.log(obj)  // auto-serializes and adds newline",
        },
      },
      {
        id: "fs-readwrite-file",
        fn: "fs.readFile() / fs.writeFile()",
        desc: "Read and write files asynchronously using Promises — the modern, non-blocking way.",
        category: "File System",
        subtitle: "Promise-based file I/O",
        signature: "await fs.promises.readFile(path, encoding)  |  await fs.promises.writeFile(path, data)",
        descLong: "fs.promises provides Promise-based file operations. readFile() reads entire file into memory — best for small files. writeFile() overwrites the file; use appendFile() to append. Always handle encoding (utf8, binary). For large files, use streams instead. Promises avoid callback hell and work with async/await.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of fs.readFile() / fs.writeFile() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport fs from 'fs/promises';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of fs.readFile() / fs.writeFile() — common patterns you'll see in production.\n// APPROACH  - Combine fs.readFile() / fs.writeFile() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Read a JSON config file\nasync function loadConfig(path) {\n  try {\n    const data = await fs.readFile(path, 'utf8');\n    return JSON.parse(data);\n  } catch (err) {\n    if (err.code === 'ENOENT') {\n      console.warn('Config file not found, using defaults');\n      return {};\n    }\n    throw err;\n  }\n}\n// Write JSON to file atomically\nasync function saveConfig(path, config) {\n  const temp = path + '.tmp';\n  await fs.writeFile(temp, JSON.stringify(config, null, 2), 'utf8');\n  await fs.rename(temp, path); // atomic replace\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of fs.readFile() / fs.writeFile() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Batch process files\nasync function processLogs() {\n  const logs = await fs.readFile('/var/log/app.log', 'utf8');\n  const lines = logs.split('\\n').filter(l => l.includes('ERROR'));\n  await fs.writeFile('/tmp/errors.txt', lines.join('\\n'), 'utf8');\n}"
                  }
        ],
        tips: [
                  "Always handle ENOENT (file not found) separately — it's a normal error, not a bug.",
                  "For atomic writes, write to a temp file then fs.rename() — prevents partial writes on crash.",
                  "readFile() loads entire file into memory — for files >100MB, use fs.createReadStream() instead.",
                  "Use fs/promises import, not util.promisify(fs.readFile) — native promises are faster and cleaner."
        ],
        mistake: "Calling fs.readFileSync() in production or on large files — it blocks the entire event loop. Always use async/promises.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "fs-readdir-stat",
        fn: "fs.readdir() / fs.stat()",
        desc: "List directory contents and inspect file metadata — essential for directory walking and validation.",
        category: "File System",
        subtitle: "Directory enumeration and file metadata",
        signature: "await fs.promises.readdir(dir, options)  |  await fs.promises.stat(path)",
        descLong: "readdir() lists files in a directory. Pass { withFileTypes: true } to get Dirent objects with isFile()/isDirectory() methods — essential for recursion. stat() returns metadata: size, mode, mtime, atime. Use lstat() to detect symlinks. Combine readdir + stat for tree walking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of fs.readdir() / fs.stat() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport fs from 'fs/promises';\nimport path from 'path';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of fs.readdir() / fs.stat() — common patterns you'll see in production.\n// APPROACH  - Combine fs.readdir() / fs.stat() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Recursive directory walk\nasync function walkDir(dir) {\n  const entries = await fs.readdir(dir, { withFileTypes: true });\n  const results = [];\n  for (const entry of entries) {\n    const fullPath = path.join(dir, entry.name);\n    const stats = await fs.stat(fullPath);\n    if (entry.isDirectory()) {\n      results.push(...await walkDir(fullPath)); // recurse\n    } else {\n      results.push({\n        path: fullPath,\n        size: stats.size,\n        modified: stats.mtime,\n      });\n    }\n  }\n  return results;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of fs.readdir() / fs.stat() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Find large files\nasync function findLargeFiles(dir, minSizeMB) {\n  const threshold = minSizeMB * 1024 * 1024;\n  const all = await walkDir(dir);\n  return all.filter(f => f.size > threshold);\n}\n// Usage\nconst large = await findLargeFiles('.', 10); // 10MB+\nconsole.log('Large files:', large);"
                  }
        ],
        tips: [
                  "Always use { withFileTypes: true } in readdir() — saves an extra stat() call per entry.",
                  "isDirectory() is more reliable than checking the name — avoids false positives with extension-less dirs.",
                  "Use fs.lstat() instead of fs.stat() to detect symlinks without following them.",
                  "For very deep trees (>1000 levels), use fs.opendir() for streaming to avoid memory bloat."
        ],
        mistake: "Checking path.extname() without isDirectory() — directories can have dots too (e.g., \"node_modules.bak\"). Always use isFile()/isDirectory().",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "path-join-resolve",
        fn: "path.join() / path.resolve()",
        desc: "Combine path segments safely, handling .. and . and platform differences (Windows vs Unix).",
        category: "Path & OS",
        subtitle: "Cross-platform path manipulation",
        signature: "path.join(...segments)  |  path.resolve(...segments)",
        descLong: "path.join() concatenates segments and normalizes (removes ..). path.resolve() does the same but returns an absolute path relative to cwd. Always use these instead of string concatenation — they handle Windows \\ vs / automatically. Never hardcode separator.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of path.join() / path.resolve() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport path from 'path';\nimport { fileURLToPath } from 'url';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of path.join() / path.resolve() — common patterns you'll see in production.\n// APPROACH  - Combine path.join() / path.resolve() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Get current module directory (ESM)\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n// Safe path construction\nconst configPath = path.join(__dirname, '..', 'config', 'app.json');\n// Absolute resolution\nconst uploadDir = path.resolve(process.cwd(), 'public', 'uploads');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of path.join() / path.resolve() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Normalize messy paths\nconst messyPath = '/home/user/../user/./docs//file.txt';\nconst clean = path.normalize(messyPath); // /home/user/docs/file.txt\n// Extract parts\nconst filePath = '/var/lib/app/data.json';\nconsole.log(path.dirname(filePath));   // /var/lib/app\nconsole.log(path.basename(filePath));  // data.json\nconsole.log(path.extname(filePath));   // .json\nconsole.log(path.parse(filePath));     // { dir, base, ext, ... }\n// Build paths dynamically\nfunction getLogFile(timestamp) {\n  return path.join('/var/log', new Date(timestamp).toISOString().split('T')[0] + '.log');\n}"
                  }
        ],
        tips: [
                  "Never use __dirname in ESM — import { fileURLToPath } and compute it manually.",
                  "path.resolve() is absolute; path.join() is relative to current dir — understand the difference.",
                  "Always use path methods, never string concat — Windows users will thank you.",
                  "Use path.relative() to compute relative paths between two absolute paths."
        ],
        mistake: "Using hardcoded \"/\" separators in paths — breaks on Windows where the separator is \"\\\". Always use path module methods.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "os-module",
        fn: "os Module (cpus, platform, homedir)",
        desc: "Get system information: CPU count, platform (Windows/Linux/Mac), home directory, temp dir.",
        category: "Path & OS",
        subtitle: "System introspection",
        signature: "os.cpus()  |  os.platform()  |  os.homedir()  |  os.tmpdir()",
        descLong: "The os module provides info about the host system. cpus() returns array of CPU objects with model and speed. platform() is \"linux\", \"darwin\", \"win32\", etc. homedir() is the user's home directory. tmpdir() is for temporary files. Useful for worker pool sizing, conditional logic, and logging system context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of os Module (cpus, platform, homedir) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport os from 'os';\nimport path from 'path';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of os Module (cpus, platform, homedir) — common patterns you'll see in production.\n// APPROACH  - Combine os Module (cpus, platform, homedir) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CPU-aware worker pool sizing\nfunction getOptimalWorkerCount() {\n  const cpuCount = os.cpus().length;\n  // Heuristic: use cores * 1.5 for I/O-heavy, cores * 0.5 for CPU-heavy\n  return Math.max(2, Math.floor(cpuCount * 1.5));\n}\n// Platform-specific logic\nfunction getConfigDir() {\n  const home = os.homedir();\n  const platform = os.platform();\n  switch (platform) {\n    case 'darwin':\n      return path.join(home, 'Library', 'Application Support', 'myapp');\n    case 'win32':\n      return path.join(home, 'AppData', 'Local', 'myapp');\n    default: // linux, freebsd, etc\n      return path.join(home, '.config', 'myapp');\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of os Module (cpus, platform, homedir) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// System info for logging\nfunction getSystemInfo() {\n  return {\n    platform: os.platform(),\n    release: os.release(),\n    arch: os.arch(),\n    cpuCount: os.cpus().length,\n    totalMemory: os.totalmem(),\n    freeMemory: os.freemem(),\n    uptime: os.uptime(),\n  };\n}\n// Monitor memory usage\nsetInterval(() => {\n  const free = os.freemem();\n  const total = os.totalmem();\n  const pct = ((total - free) / total * 100).toFixed(1);\n  console.log(`Memory: ${pct}% used`);\n}, 5000);"
                  }
        ],
        tips: [
                  "os.cpus() returns an array — length is core count, not logical processor count.",
                  "Never hardcode /tmp or /var/tmp — use os.tmpdir() for cross-platform compatibility.",
                  "os.homedir() might fail in containerized or CI environments — always provide a fallback.",
                  "Use os.arch() to warn users running on unsupported architectures (e.g., ARM on x86-only binary)."
        ],
        mistake: "Hardcoding platform-specific paths like /home or C:\\Users instead of computing them with os.homedir() + path.join().",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "process-basics",
        fn: "process (env, argv, exit, cwd)",
        desc: "Access environment variables, command-line arguments, change working directory, and exit the process.",
        category: "Process & Events",
        subtitle: "Global process object",
        signature: "process.env.VAR  |  process.argv  |  process.exit(code)  |  process.cwd()",
        descLong: "process.env is an object of environment variables (from shell or .env). process.argv is array of command-line args ([node, script, ...userArgs]). process.exit(code) terminates the process; code 0 = success, non-zero = error. process.cwd() returns working dir. Always handle SIGTERM/SIGINT for graceful shutdown in servers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of process (env, argv, exit, cwd) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport dotenv from 'dotenv';\ndotenv.config(); // load .env file"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of process (env, argv, exit, cwd) — common patterns you'll see in production.\n// APPROACH  - Combine process (env, argv, exit, cwd) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Environment config\nconst port = process.env.PORT ?? 3000;\nconst nodeEnv = process.env.NODE_ENV ?? 'development';\nconst dbUrl = process.env.DATABASE_URL;\nif (!dbUrl) {\n  console.error('DATABASE_URL not set');\n  process.exit(1);\n}\n// Parse command-line arguments\nconst args = process.argv.slice(2); // skip 'node' and script name\nconst verbose = args.includes('--verbose');\nconst outputFile = args.find(a => a.startsWith('--output='))?.split('=')[1];\nconsole.log(`Running in ${nodeEnv} mode on port ${port}`);\nconsole.log('Working dir:', process.cwd());\nif (verbose) console.log('Verbose mode enabled');\n// Graceful shutdown\nlet isShuttingDown = false;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of process (env, argv, exit, cwd) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nasync function shutdown(signal) {\n  if (isShuttingDown) return;\n  isShuttingDown = true;\n  console.log(`Caught ${signal}, closing gracefully...`);\n  // Close server, drain connections, etc.\n  await server.close();\n  // Cleanup\n  console.log('Shutdown complete');\n  process.exit(0);\n}\nprocess.on('SIGTERM', () => shutdown('SIGTERM'));\nprocess.on('SIGINT', () => shutdown('SIGINT'));"
                  }
        ],
        tips: [
                  "Always check process.env.NODE_ENV in conditionals — set it in your .env or deployment config.",
                  "Use dotenv early (top of entry point) to load .env before other modules.",
                  "process.argv[0] is the Node executable, [1] is the script — user args start at [2].",
                  "Use --verbose, --output=file.txt, not -v -o file.txt — minimist or yargs help parse complex args."
        ],
        mistake: "Not handling SIGTERM/SIGINT — Docker and systemd send SIGTERM on shutdown. Without handlers, connections close abruptly.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "event-emitter",
        fn: "EventEmitter",
        desc: "Emit and listen to custom events — the foundation of Node.js async patterns (streams, etc).",
        category: "Process & Events",
        subtitle: "Custom event system",
        signature: "class MyClass extends EventEmitter { this.emit(name, ...args) }  →  instance.on(name, handler)",
        descLong: "EventEmitter is a class in the events module. Extend it to add custom event support. emit() triggers listeners. on() registers a listener; once() registers for one call only. Listeners receive args passed to emit(). Always assign a default error listener to prevent crashes on unhandled errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of EventEmitter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { EventEmitter } from 'events';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of EventEmitter — common patterns you'll see in production.\n// APPROACH  - Combine EventEmitter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Custom event-driven class\nclass Database extends EventEmitter {\n  constructor() {\n    super();\n    this.connected = false;\n  }\n  async connect(url) {\n    try {\n      // Simulate connection\n      await new Promise(r => setTimeout(r, 100));\n      this.connected = true;\n      this.emit('connected', { url });\n    } catch (err) {\n      this.emit('error', err);\n    }\n  }\n  async query(sql) {\n    if (!this.connected) {\n      this.emit('error', new Error('Not connected'));\n      return;\n    }\n    this.emit('query-start', { sql });\n    try {\n      const result = { rows: [] }; // fake result\n      this.emit('query-end', { sql, duration: 5 });\n      return result;\n    } catch (err) {\n      this.emit('error', err);\n    }\n  }\n}\n// Usage\nconst db = new Database();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of EventEmitter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ndb.on('connected', (info) => {\n  console.log('DB connected:', info.url);\n});\ndb.on('query-start', ({ sql }) => {\n  console.log('Running:', sql);\n});\ndb.on('query-end', ({ sql, duration }) => {\n  console.log(`Query took ${duration}ms`);\n});\n// Error handler is mandatory\ndb.on('error', (err) => {\n  console.error('DB error:', err.message);\n});\nawait db.connect('postgres://localhost');\nawait db.query('SELECT * FROM users');"
                  }
        ],
        tips: [
                  "Always attach an error listener — unhandled error events crash the process.",
                  "Use once() for one-time events (connected, ready, loaded) — avoids memory leaks from stale listeners.",
                  "Call removeListener() or removeAllListeners() to cleanup when objects are destroyed.",
                  "EventEmitter.setMaxListeners(n) changes the warning threshold — default 10 listeners per event."
        ],
        mistake: "Not handling the error event — if emit(\"error\") is called with no listener, it crashes the process immediately.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "child-process-exec-spawn",
        fn: "child_process (exec, spawn)",
        desc: "Execute external programs and shell commands — for scripts, ffmpeg, git, or any CLI tool.",
        category: "Child Processes",
        subtitle: "Running subprocesses and shell commands",
        signature: "exec(command, callback)  |  spawn(cmd, args, options)",
        descLong: "exec() runs a shell command and buffers output in callback — simple but unsafe with user input. spawn() launches a process and returns streams for stdout/stderr — memory-efficient for large output. execFile() is like exec() but without shell (safer). Always sanitize command args if from user input; better to use spawn with array args.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of child_process (exec, spawn) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { exec, spawn } from 'child_process';\nimport { promisify } from 'util';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of child_process (exec, spawn) — common patterns you'll see in production.\n// APPROACH  - Combine child_process (exec, spawn) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst execAsync = promisify(exec);\n// Simple command with exec (buffered output)\nasync function getGitStatus() {\n  try {\n    const { stdout } = await execAsync('git status --porcelain');\n    return stdout.trim().split('\\n');\n  } catch (err) {\n    console.error('Git failed:', err.message);\n    return [];\n  }\n}\n// Streaming with spawn (for large output)\nfunction convertVideo(inputFile, outputFile) {\n  return new Promise((resolve, reject) => {\n    const ffmpeg = spawn('ffmpeg', [\n      '-i', inputFile,\n      '-vf', 'scale=1280:720',\n      '-c:a', 'aac',\n      outputFile,\n    ]);\n    let error = '';\n    ffmpeg.stderr.on('data', (data) => {\n      error += data.toString();\n      // Log progress\n      const match = data.toString().match(/time=([\\d:]+)/);\n      if (match) console.log('Progress:', match[1]);\n    });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of child_process (exec, spawn) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nffmpeg.on('close', (code) => {\n      if (code === 0) {\n        resolve();\n      } else {\n        reject(new Error(`ffmpeg failed: ${error}`));\n      }\n    });\n    ffmpeg.on('error', reject);\n  });\n}\n// Safe command execution (no shell injection)\nfunction runTests(pattern) {\n  const child = spawn('npm', ['test', '--', pattern], {\n    stdio: 'inherit', // forward output directly\n  });\n  return new Promise((resolve, reject) => {\n    child.on('exit', (code) => {\n      code === 0 ? resolve() : reject(new Error(`Tests failed: code ${code}`));\n    });\n  });\n}"
                  }
        ],
        tips: [
                  "exec() buffers output — only use for small outputs (<1MB). Use spawn() for streaming/large output.",
                  "Never do exec(`command ${userInput}`) — use spawn with array args instead to prevent shell injection.",
                  "Set stdio: \"inherit\" in spawn to forward output directly — useful for interactive CLIs.",
                  "Always handle close event, not exit — data may still arrive after exit before close."
        ],
        mistake: "Using exec() to run ffmpeg, tar, or other tools with large output — the buffer fills memory. Use spawn() with streaming.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "crypto-module",
        fn: "crypto Module",
        desc: "Hash, encrypt, generate random values, and sign data — cryptographic operations for security.",
        category: "Core Modules",
        subtitle: "Cryptographic primitives",
        signature: "crypto.createHash(algo)  |  crypto.randomBytes(size)  |  crypto.createCipher(algo, key)",
        descLong: "The crypto module provides cryptographic functions. createHash() computes digests (SHA256, MD5). randomBytes() generates secure random data — use this for tokens, salts, and IVs. createHmac() computes message authentication codes. For password hashing, use bcrypt or argon2; for encryption, use createCipheriv() with a proper IV and auth tag (GCM mode).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of crypto Module — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport crypto from 'crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of crypto Module — common patterns you'll see in production.\n// APPROACH  - Combine crypto Module with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Hash (SHA256)\nfunction hashPassword(password) {\n  return crypto\n    .createHash('sha256')\n    .update(password)\n    .digest('hex');\n}\n// Secure random token\nfunction generateToken() {\n  return crypto.randomBytes(32).toString('hex');\n}\n// HMAC (for message authentication)\nfunction hmacSign(message, secret) {\n  return crypto\n    .createHmac('sha256', secret)\n    .update(message)\n    .digest('hex');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of crypto Module — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Encrypt with AES-256-GCM (authenticated encryption)\nfunction encrypt(plaintext, key, iv) {\n  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);\n  const encrypted = Buffer.concat([\n    cipher.update(plaintext, 'utf8'),\n    cipher.final(),\n  ]);\n  const authTag = cipher.getAuthTag();\n  return { encrypted, authTag };\n}\n// Decrypt\nfunction decrypt(encrypted, authTag, key, iv) {\n  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);\n  decipher.setAuthTag(authTag);\n  return decipher.update(encrypted) + decipher.final('utf8');\n}\n// Verify HMAC\nfunction verifyHmac(message, signature, secret) {\n  const expected = hmacSign(message, secret);\n  return crypto.timingSafeEqual(\n    Buffer.from(expected),\n    Buffer.from(signature)\n  );\n}"
                  }
        ],
        tips: [
                  "Never use MD5 or SHA1 for passwords — use bcrypt, scrypt, or argon2 instead.",
                  "crypto.timingSafeEqual() prevents timing attacks when comparing sensitive values.",
                  "Always use authenticated encryption (GCM, ChaCha20-Poly1305) — never use ECB or CBC without authentication.",
                  "Generate a fresh random IV for each encryption operation — never reuse an IV with the same key."
        ],
        mistake: "Using crypto.createCipher() (deprecated) which uses weak key derivation. Use createCipheriv() with a proper KDF like PBKDF2 or scrypt.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "worker-threads-pool",
        fn: "Worker Thread Pool Pattern",
        desc: "Create a reusable pool of Worker Threads to process CPU-intensive tasks efficiently.",
        category: "Child Processes",
        subtitle: "Worker thread pooling for scalable computation",
        signature: "class WorkerPool { enqueue(task) { /* assign to worker */ } }",
        descLong: "Creating a new Worker for each task is expensive. A worker pool maintains a fixed number of workers and queues tasks. When a worker finishes, it processes the next task in the queue. This pattern is essential for CPU-heavy apps that need to stay responsive.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Thread Pool Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Worker } from 'worker_threads';\nimport { EventEmitter } from 'events';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Thread Pool Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Worker Thread Pool Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass WorkerPool extends EventEmitter {\n  constructor(workerScript, poolSize = 4) {\n    super();\n    this.workers = [];\n    this.taskQueue = [];\n    this.activeCount = 0;\n    for (let i = 0; i < poolSize; i++) {\n      const worker = new Worker(workerScript);\n      worker.on('message', (result) => this._handleWorkerMessage(result));\n      worker.on('error', (err) => this.emit('error', err));\n      this.workers.push(worker);\n    }\n  }\n  async enqueue(task) {\n    return new Promise((resolve, reject) => {\n      this.taskQueue.push({ task, resolve, reject });\n      this._processQueue();\n    });\n  }\n  _processQueue() {\n    while (this.taskQueue.length > 0 && this.activeCount < this.workers.length) {\n      const { task, resolve, reject } = this.taskQueue.shift();\n      const worker = this.workers[this.activeCount];\n      this.activeCount++;\n      worker.once('message', (result) => {\n        this.activeCount--;\n        resolve(result);\n        this._processQueue();\n      });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Thread Pool Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nworker.once('error', (err) => {\n        this.activeCount--;\n        reject(err);\n        this._processQueue();\n      });\n      worker.postMessage(task);\n    }\n  }\n  terminate() {\n    return Promise.all(this.workers.map(w => w.terminate()));\n  }\n}\n// Usage\nconst pool = new WorkerPool('./heavy-compute.js', 4);\nconst results = await Promise.all([\n  pool.enqueue({ data: 'task1' }),\n  pool.enqueue({ data: 'task2' }),\n  pool.enqueue({ data: 'task3' }),\n]);\nawait pool.terminate();"
                  }
        ],
        tips: [
                  "Pool size should match os.cpus().length — one worker per core avoids context switching.",
                  "Use piscina or node-worker-threads-pool in production — they are battle-tested and handle edge cases.",
                  "Monitor queue depth to detect if your pool is undersized — log warnings when queue grows unbounded.",
                  "Reuse workers for multiple tasks — creating new workers is expensive."
        ],
        mistake: "Creating a new Worker for every task — this defeats the purpose of pooling and causes significant overhead.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "url-module",
        fn: "URL Module",
        desc: "Parse and construct URLs safely — handle components (protocol, hostname, pathname, query) correctly.",
        category: "Path & OS",
        subtitle: "URL parsing and construction",
        signature: "new URL(href, base)  |  url.parse(urlString)  |  url.format(urlObject)",
        descLong: "The URL class (WHATWG standard) is the modern way to parse URLs. url.parse() is legacy. The URL object has properties: protocol, hostname, pathname, search, hash. Use URLSearchParams for query string manipulation. Never concatenate URLs as strings — use the URL class.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of URL Module — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { URL, URLSearchParams } from 'url';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of URL Module — common patterns you'll see in production.\n// APPROACH  - Combine URL Module with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Parse a URL\nconst myUrl = new URL('https://user:pass@example.com:8080/path?key=value#section');\nconsole.log(myUrl.protocol);    // 'https:'\nconsole.log(myUrl.hostname);    // 'example.com'\nconsole.log(myUrl.port);        // '8080'\nconsole.log(myUrl.pathname);    // '/path'\nconsole.log(myUrl.search);      // '?key=value'\nconsole.log(myUrl.hash);        // '#section'\nconsole.log(myUrl.origin);      // 'https://example.com:8080'\n// Modify components\nmyUrl.pathname = '/new-path';\nmyUrl.search = '?foo=bar';\nconsole.log(myUrl.href); // Updated full URL"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of URL Module — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Query parameters\nconst params = new URLSearchParams('a=1&b=2');\nparams.append('c', '3');\nparams.delete('b');\nconsole.log(params.toString()); // 'a=1&c=3'\n// Build a URL from parts\nconst built = new URL('https://api.example.com');\nbuilt.pathname = '/v1/users';\nbuilt.searchParams.append('filter', 'active');\nbuilt.searchParams.append('limit', '10');\nconsole.log(built.href);\n// 'https://api.example.com/v1/users?filter=active&limit=10'\n// Resolve relative URLs\nconst base = new URL('https://example.com/docs/');\nconst relative = new URL('../api', base);\nconsole.log(relative.href); // 'https://example.com/api'"
                  }
        ],
        tips: [
                  "Use the URL class, not url.parse() — url.parse is legacy and less reliable.",
                  "URLSearchParams handles encoding/decoding — never manually encode query strings.",
                  "Use url.resolve() for relative URL resolution, or new URL(relative, base).",
                  "url.format(urlObject) reconstructs a URL from parsed parts — useful when modifying specific components."
        ],
        mistake: "String concatenation for URL building: `protocol + \"://\" + host + \"/\" + path` — breaks on edge cases. Use the URL class.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "events-advanced",
        fn: "EventEmitter Advanced",
        desc: "Deep dive into EventEmitter: once, removeListener, listeners, and memory leak prevention.",
        category: "Process & Events",
        subtitle: "Advanced event patterns and cleanup",
        signature: "emitter.once(name, fn)  |  emitter.listeners(name)  |  emitter.removeAllListeners()",
        descLong: "EventEmitter has methods for lifecycle management. once() registers a single-fire listener. listeners() returns all listeners for an event. removeListener() unsubscribes. Memory leaks occur when listeners accumulate on long-lived emitters. Use once() for ephemeral events and clean up in destructors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of EventEmitter Advanced — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { EventEmitter } from 'events';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of EventEmitter Advanced — common patterns you'll see in production.\n// APPROACH  - Combine EventEmitter Advanced with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass DataSource extends EventEmitter {\n  async connect() {\n    // one-time listeners\n    this.once('connected', () => console.log('Connected!'));\n    this.once('error', (err) => console.error('Connection failed:', err));\n    setTimeout(() => this.emit('connected'), 100);\n  }\n  async disconnect() {\n    // Clean up all listeners\n    this.removeAllListeners();\n  }\n}\nconst source = new DataSource();\nawait source.connect();\n// Check listener count\nconsole.log(source.listenerCount('connected')); // 1\nconsole.log(source.listeners('connected'));     // [Function]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of EventEmitter Advanced — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Manual listener management\nfunction logData(data) {\n  console.log('Data:', data);\n}\nsource.on('data', logData);\nsource.on('data', (data) => console.log('Duplicate:', data));\nconsole.log(source.listenerCount('data')); // 2\n// Remove specific listener\nsource.removeListener('data', logData);\nconsole.log(source.listenerCount('data')); // 1\n// Event forwarding pattern (reduce duplicates)\nconst proxy = new EventEmitter();\nsource.on('message', (msg) => proxy.emit('message', msg));\n// Max listeners warning (default 10)\nconst heavy = new EventEmitter();\nfor (let i = 0; i < 15; i++) {\n  heavy.on('event', () => {});\n}\n// Warns: MaxListenersExceededWarning\n// Solution:\nheavy.setMaxListeners(20);"
                  }
        ],
        tips: [
                  "Use once() for single-fire events — avoids memory leaks from forgotten cleanup.",
                  "Call removeAllListeners() in destructors or shutdown handlers.",
                  "Monitor listenerCount() in production — unbounded growth indicates a leak.",
                  "setMaxListeners() silences warnings but doesn't fix leaks — investigate why listeners accumulate."
        ],
        mistake: "Using on() repeatedly without cleanup — listeners accumulate indefinitely on long-lived objects, causing memory leaks and performance degradation.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "cluster-module",
        fn: "cluster Module",
        desc: "Spawn multiple worker processes to utilize all CPU cores — distribute load across processes.",
        category: "Child Processes",
        subtitle: "Multi-process clustering for scaling",
        signature: "if (cluster.isPrimary) { cluster.fork() } else { /* worker code */ }",
        descLong: "The cluster module forks multiple Node processes, one per CPU core. The primary (master) process manages workers. Workers run independently and can crash without affecting others. Use for CPU-bound apps or to isolate workload. Socket/server handles can be shared across workers via the primary process.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of cluster Module — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport cluster from 'cluster';\nimport http from 'http';\nimport os from 'os';\nimport process from 'process';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of cluster Module — common patterns you'll see in production.\n// APPROACH  - Combine cluster Module with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst numCPUs = os.cpus().length;\nif (cluster.isPrimary) {\n  console.log(`Primary ${process.pid} is running`);\n  // Fork workers\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n  // Restart crashed workers\n  cluster.on('exit', (worker, code, signal) => {\n    console.log(`Worker ${worker.process.pid} died (${signal || code})`);\n    console.log('Starting a new worker...');\n    cluster.fork();\n  });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of cluster Module — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Graceful shutdown\n  process.on('SIGTERM', () => {\n    console.log('Shutting down cluster...');\n    for (const id in cluster.workers) {\n      cluster.workers[id].kill();\n    }\n    process.exit(0);\n  });\n} else {\n  // Worker code\n  const server = http.createServer((req, res) => {\n    res.writeHead(200);\n    res.end(`Handled by worker ${process.pid}\\n`);\n  });\n  server.listen(3000);\n  console.log(`Worker ${process.pid} started`);\n  // Graceful shutdown\n  process.on('SIGTERM', () => {\n    console.log(`Worker ${process.pid} shutting down`);\n    server.close(() => process.exit(0));\n  });\n}"
                  }
        ],
        tips: [
                  "One worker per CPU core is the standard — more workers cause context switching overhead.",
                  "Always handle worker crashes and restart them — workers will occasionally die.",
                  "Use a load balancer (nginx, HAProxy) in front of clustered apps, not Node's cluster alone.",
                  "PM2 with cluster mode is easier than manual clustering in production."
        ],
        mistake: "Assuming cluster automatically load-balances incoming traffic — it doesn't. Use a reverse proxy (nginx) in front.",
        shorthand: {
          verbose: "if (cluster.isPrimary) {\n  for (let i = 0; i < numCPUs; i++) {\n    cluster.fork();\n  }\n} else {\n  const server = http.createServer((req, res) => {\n    res.writeHead(200);\n    res.end(`Worker ${process.pid}\\n`);\n  });\n  server.listen(3000);\n}",
          concise: "if (cluster.isPrimary) {\n  for (let i = 0; i < os.cpus().length; i++) cluster.fork();\n} else {\n  http.createServer((req, res) => res.end(`Worker ${process.pid}\\n`)).listen(3000);\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
