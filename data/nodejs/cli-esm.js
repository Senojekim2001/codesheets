export const meta = {
  "title": "ESM, CLI & Caching",
  "domain": "nodejs",
  "sheet": "cli-esm",
  "icon": "📦"
}

export const sections = [

  // ── Section 1: Native ESM & CLI Development ─────────────────────────────────────────
  {
    id: "esm-cli",
    title: "Native ESM & CLI Development",
    entries: [
      {
        id: "native-esm",
        fn: "Native ESM — import/export & Package Exports Map",
        desc: "Configure Node.js for native ES modules: package.json type/exports, conditional exports, dual CJS/ESM packages, and top-level await.",
        category: "ESM",
        subtitle: "\"type\": \"module\", exports map, import/require, conditional exports, top-level await",
        signature: "\"type\": \"module\"  |  \"exports\": { \"import\": \"./dist/index.mjs\", \"require\": \"./dist/index.cjs\" }",
        descLong: "Node.js natively supports ES modules. Set \"type\": \"module\" in package.json to use import/export in .js files. The \"exports\" field defines the public API of your package — it replaces \"main\" and controls what consumers can import. Conditional exports serve different code for import vs require. Subpath exports expose specific entry points. Top-level await works in ESM files. For libraries, publish dual CJS/ESM using exports map to support both ecosystems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Native ESM — import/export & Package Exports Map — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// {\n//   \"name\": \"my-package\",\n//   \"type\": \"module\",\n//   \"exports\": {\n//     \".\": {\n//       \"import\": \"./dist/index.js\",\n//       \"require\": \"./dist/index.cjs\",\n//       \"types\": \"./dist/index.d.ts\"\n//     },\n//     \"./utils\": {\n//       \"import\": \"./dist/utils.js\",\n//       \"require\": \"./dist/utils.cjs\"\n//     }\n//   },\n//   \"files\": [\"dist\"]\n// }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Native ESM — import/export & Package Exports Map — common patterns you'll see in production.\n// APPROACH  - Combine Native ESM — import/export & Package Exports Map with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { readFile } from 'node:fs/promises';\nimport { join, dirname } from 'node:path';\nimport { fileURLToPath } from 'node:url';\n// __dirname equivalent in ESM\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\n// Dynamic import (works for CJS modules too)\nconst chalk = await import('chalk');\n// Import JSON (requires assertion)\nimport config from './config.json' with { type: 'json' };\nconst data = await readFile(join(__dirname, 'data.txt'), 'utf-8');\nconst db = await connectDatabase();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Native ESM — import/export & Package Exports Map — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nimport { Command } from 'commander';\nimport ora from 'ora';\nconst program = new Command();\nprogram\n  .name('my-cli')\n  .description('A powerful CLI tool')\n  .version('1.0.0');\nprogram\n  .command('deploy')\n  .description('Deploy the application')\n  .argument('<environment>', 'Target environment')\n  .option('-f, --force', 'Skip confirmation', false)\n  .option('-t, --tag <tag>', 'Docker image tag', 'latest')\n  .action(async (environment, options) => {\n    const spinner = ora('Deploying...').start();\n    try {\n      await deploy(environment, options);\n      spinner.succeed('Deployed successfully');\n    } catch (err) {\n      spinner.fail(err.message);\n      process.exit(1);\n    }\n  });\nprogram\n  .command('init')\n  .description('Initialize a new project')\n  .action(async () => {\n    // Interactive prompts\n    const { default: inquirer } = await import('inquirer');\n    const answers = await inquirer.prompt([\n      { type: 'input', name: 'name', message: 'Project name:' },\n      { type: 'list', name: 'template', message: 'Template:', choices: ['express', 'fastify', 'koa'] },\n      { type: 'confirm', name: 'typescript', message: 'Use TypeScript?', default: true },\n    ]);\n    console.log('Creating project:', answers);\n  });\nprogram.parse();"
                  }
        ],
        tips: [
                  "\"type\": \"module\" makes all .js files ESM — use .cjs extension for any CommonJS files you still need.",
                  "The \"exports\" field is a security boundary — consumers can only import paths you explicitly expose.",
                  "import.meta.url replaces __filename; use fileURLToPath() and dirname() to get __dirname equivalent.",
                  "Commander + ora + inquirer is the standard Node.js CLI stack: commands, spinners, and interactive prompts."
        ],
        mistake: "Using require() in ESM files — require is not available in ES modules. Use import or await import() for dynamic imports. If you need CJS interop, use createRequire from \"node:module\".",
        shorthand: {
          verbose: "// Old CommonJS way\nconst fs = require('fs');\nconst path = require('path');\nconst __dirname = path.dirname(require.main.filename);",
          concise: "import { readFile } from 'node:fs/promises'; import.meta.url + fileURLToPath + dirname",
        },
      },
      {
        id: "caching-grpc",
        fn: "Caching Strategies & gRPC in Node.js",
        desc: "In-memory and Redis caching patterns, cache invalidation, and gRPC service implementation.",
        category: "Caching",
        subtitle: "node-cache, Redis, TTL, cache-aside, write-through, gRPC, protobuf",
        signature: "new NodeCache({ stdTTL: 600 })  |  redis.get/set  |  grpc.Server",
        descLong: "Caching reduces latency and database load. In-memory caches (node-cache, Map with TTL) are fastest but per-process. Redis provides shared caching across instances with TTL, pub/sub for invalidation, and persistence. Cache-aside pattern: check cache first, fetch from source on miss, store in cache. Write-through: write to cache and source simultaneously. gRPC provides high-performance binary RPC using Protocol Buffers — 10x faster than REST for service-to-service communication.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Caching Strategies & gRPC in Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport NodeCache from 'node-cache';\nconst cache = new NodeCache({\n  stdTTL: 600,        // default 10 min TTL\n  checkperiod: 120,   // cleanup every 2 min\n  maxKeys: 10000,     // memory bound\n});\n// Cache-aside pattern\nasync function getUser(id) {\n  const cacheKey = `user:${id}`;\n  const cached = cache.get(cacheKey);\n  if (cached) return cached;\n  const user = await db.users.findUnique({ where: { id } });\n  if (user) cache.set(cacheKey, user, 300); // 5 min TTL\n  return user;\n}\n// Invalidate on mutation\nasync function updateUser(id, data) {\n  const user = await db.users.update({ where: { id }, data });\n  cache.del(`user:${id}`);          // invalidate cache\n  cache.del('users:list');            // invalidate list cache\n  return user;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Caching Strategies & gRPC in Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Caching Strategies & gRPC in Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { createClient } from 'redis';\nconst redis = createClient({ url: process.env.REDIS_URL });\nawait redis.connect();\nasync function getCachedData(key, fetchFn, ttl = 600) {\n  const cached = await redis.get(key);\n  if (cached) return JSON.parse(cached);\n  const data = await fetchFn();\n  await redis.setEx(key, ttl, JSON.stringify(data));\n  return data;\n}\n// Usage\nconst products = await getCachedData(\n  'products:featured',\n  () => db.products.findMany({ where: { featured: true } }),\n  300,\n);\n// Cache invalidation with pattern\nasync function invalidateUserCaches(userId) {\n  const keys = await redis.keys(`user:${userId}:*`);\n  if (keys.length > 0) await redis.del(keys);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Caching Strategies & gRPC in Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// user.proto:\n// syntax = \"proto3\";\n// service UserService {\n//   rpc GetUser (GetUserRequest) returns (User);\n//   rpc ListUsers (ListUsersRequest) returns (stream User);\n// }\n// message GetUserRequest { int32 id = 1; }\n// message User { int32 id = 1; string name = 2; string email = 3; }\nimport * as grpc from '@grpc/grpc-js';\nimport * as protoLoader from '@grpc/proto-loader';\nconst packageDef = protoLoader.loadSync('user.proto');\nconst proto = grpc.loadPackageDefinition(packageDef);\nconst server = new grpc.Server();\nserver.addService(proto.UserService.service, {\n  getUser: async (call, callback) => {\n    const user = await db.users.findUnique({ where: { id: call.request.id } });\n    callback(null, user);\n  },\n  listUsers: async (call) => {\n    const users = await db.users.findMany();\n    for (const user of users) {\n      call.write(user);\n    }\n    call.end();\n  },\n});\nserver.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {\n  console.log('gRPC server on :50051');\n});"
                  }
        ],
        tips: [
                  "Use in-memory cache for single-instance apps; Redis for multi-instance — in-memory is 100x faster but not shared.",
                  "Always set TTL on cache entries — stale data without expiration is worse than no cache.",
                  "redis.keys() is O(N) and blocks — use SCAN in production for pattern-based invalidation.",
                  "gRPC streaming (server-side) is ideal for large datasets — it sends items one at a time instead of buffering the entire response."
        ],
        mistake: "Caching without an invalidation strategy — cache that is never invalidated serves stale data indefinitely. Always invalidate on write or set appropriate TTLs.",
        shorthand: {
          verbose: "const cached = cache.get(key);\nif (!cached) {\n  const data = await fetchData();\n  cache.set(key, data, 600);\n  return data;\n}\nreturn cached;",
          concise: "cache-aside: check cache → fetch on miss → cache with TTL; Redis pattern: keys(), setEx(), del()",
        },
      },
      {
        id: "esm-node",
        fn: "Native ESM in Node.js",
        desc: "Enable ES modules: \"type\": \"module\", .mjs files, __dirname workaround.",
        category: "ESM",
        subtitle: "\"type\": \"module\", import/export, .mjs extension, __dirname",
        signature: "\"type\": \"module\" in package.json  |  import/export  |  import.meta.url + fileURLToPath",
        descLong: "Node.js supports native ES modules. Set \"type\": \"module\" in package.json to use import/export in .js files. Alternatively use .mjs extension. import.meta.url replaces __filename; fileURLToPath() + dirname() provides __dirname.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Native ESM in Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json\n{\n  \"type\": \"module\",\n  \"name\": \"my-app\"\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Native ESM in Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Native ESM in Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// app.js — ESM syntax\nimport express from 'express';\nimport { readFile } from 'node:fs/promises';\nimport { fileURLToPath } from 'node:url';\nimport { dirname } from 'node:path';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\nconst app = express();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Native ESM in Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\napp.get('/', (req, res) => {\n  res.send('ESM works!');\n});\napp.listen(3000);"
                  }
        ],
        tips: [
                  "\"type\": \"module\" makes all .js files ESM — use .cjs for any CommonJS files.",
                  "Top-level await works automatically in ESM — no need for async IIFE.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Mixing require() in ESM files — require is not available.",
        shorthand: {
          verbose: "// Manual / verbose approach\n\"type\": \"module\" in package.json; import/export syntax; const __dirname = dirname(fileURLToPath(import.meta.url));\n// More explicit but longer",
          concise: "\"type\": \"module\" + import/export + import.meta.url + fileURLToPath/dirname",
        },
      },
      {
        id: "esm-cjs-interop",
        fn: "ESM/CJS Interop",
        desc: "Use CommonJS modules in ESM: createRequire, default imports, named exports.",
        category: "ESM",
        subtitle: "createRequire, default imports, CJS → ESM compatibility",
        signature: "createRequire(import.meta.url)  |  import config from \"./file.cjs\"",
        descLong: "ESM can import CommonJS using createRequire (dynamic). Named exports from CJS not directly available — use default import. CJS cannot require() ESM directly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ESM/CJS Interop — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ESM file importing CJS\nimport { createRequire } from 'node:module';\nconst require = createRequire(import.meta.url);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ESM/CJS Interop — common patterns you'll see in production.\n// APPROACH  - Combine ESM/CJS Interop with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Require a CJS module\nconst fs = require('node:fs');\nconst oldModule = require('./legacy.cjs');\n// Or use dynamic import\nconst cjsModule = await import('./legacy.cjs');\nconsole.log(cjsModule.default);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ESM/CJS Interop — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Default import from CJS\nimport config from './config.cjs' with { type: 'commonjs' };"
                  }
        ],
        tips: [
                  "createRequire is simpler for single CJS requires.",
                  "Dynamic import() works for both CJS and ESM.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Forgetting that CJS named exports are not directly accessible in ESM.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport { createRequire } from 'node:module'; const require = createRequire(import.meta.url); const mod = require('./file.cjs');\n// More explicit but longer",
          concise: "createRequire(import.meta.url) or await import('./file.cjs')",
        },
      },
      {
        id: "package-json-exports",
        fn: "package.json Exports Field",
        desc: "Define public API with exports: conditional exports, subpath exports, dual CJS/ESM.",
        category: "ESM",
        subtitle: "exports field, conditional exports, subpath exports, import/require conditions",
        signature: "\"exports\": { \".\": {...}, \"./utils\": {...} }  |  \"import\"/\"require\" conditions",
        descLong: "The exports field controls what consumers can import from your package. Supports conditional exports (different code for import vs require). Subpath exports expose specific files. Replaces main field.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of package.json Exports Field — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json\n{\n  \"name\": \"my-lib\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",\n  \"exports\": {\n    \".\": {\n      \"import\": \"./dist/index.js\",\n      \"require\": \"./dist/index.cjs\",\n      \"types\": \"./dist/index.d.ts\"\n    },\n    \"./utils\": {\n      \"import\": \"./dist/utils.js\",\n      \"require\": \"./dist/utils.cjs\"\n    },\n    \"./package.json\": \"./package.json\"\n  },\n  \"files\": [\"dist\"]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of package.json Exports Field — common patterns you'll see in production.\n// APPROACH  - Combine package.json Exports Field with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Consumer can do:\n// import { foo } from 'my-lib';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of package.json Exports Field — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// import { bar } from 'my-lib/utils';\n// const x = require('my-lib'); // uses .cjs"
                  }
        ],
        tips: [
                  "Conditional exports serve different code — enables dual CJS/ESM publishing.",
                  "Types condition for TypeScript — always include.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Forgetting \"types\" condition — TypeScript can't find types.",
        shorthand: {
          verbose: "// Manual / verbose approach\n\"exports\": { \".\": { \"import\": \"./dist/index.js\", \"require\": \"./dist/index.cjs\", \"types\": \"./dist/index.d.ts\" } }\n// More explicit but longer",
          concise: "exports with import/require/types conditions + subpath exports",
        },
      },
      {
        id: "tsx-node",
        fn: "Running TypeScript in Node",
        desc: "Run TypeScript files directly: tsx, ts-node/esm, source maps.",
        category: "CLI",
        subtitle: "tsx, ts-node/esm, --import tsx/esm, source maps",
        signature: "tsx script.ts  |  node --loader tsx/esm script.ts  |  NODE_OPTIONS",
        descLong: "tsx and ts-node let you run .ts files directly. tsx is faster, ESM-first. ts-node/esm for ESM. Both support source maps for debugging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Running TypeScript in Node — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Install\n// npm install tsx\n// or ts-node"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Running TypeScript in Node — common patterns you'll see in production.\n// APPROACH  - Combine Running TypeScript in Node with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Run with tsx (recommended)\n// tsx src/app.ts\n// Or with node loader\n// node --loader tsx/esm src/app.ts\n// src/app.ts\nimport { readFile } from 'node:fs/promises';\nimport express from 'express';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Running TypeScript in Node — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface User {\n  id: number;\n  name: string;\n}\nconst users: User[] = [];\nconst app = express();\napp.get('/users', (req, res) => res.json(users));\napp.listen(3000);"
                  }
        ],
        tips: [
                  "tsx is faster than ts-node — prefer it for dev.",
                  "Source maps work automatically — errors show .ts file names.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Compiling TypeScript separately instead of using tsx/ts-node.",
        shorthand: {
          verbose: "// Manual / verbose approach\nnpm install tsx; tsx script.ts\n// More explicit but longer",
          concise: "tsx for fast TypeScript execution; node --loader tsx/esm for ESM",
        },
      },
      {
        id: "commander-basics",
        fn: "Commander.js CLI Framework",
        desc: "Build CLIs: commands, options, arguments, subcommands with Commander.",
        category: "CLI",
        subtitle: "program.command(), options, arguments, action",
        signature: "program.command(\"cmd\").option(\"-f, --flag\").action(fn)",
        descLong: "Commander.js simplifies CLI building. Define commands, options (flags), arguments, subcommands. Auto-generates help text. Handles parsing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Commander.js CLI Framework — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { Command } from 'commander';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Commander.js CLI Framework — common patterns you'll see in production.\n// APPROACH  - Combine Commander.js CLI Framework with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst program = new Command();\nprogram\n  .name('mycli')\n  .description('My awesome CLI')\n  .version('1.0.0');\n// Simple command\nprogram\n  .command('hello')\n  .description('Say hello')\n  .action(() => console.log('Hello!'));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Commander.js CLI Framework — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Command with options and args\nprogram\n  .command('deploy <env>')\n  .description('Deploy to environment')\n  .option('-f, --force', 'Skip confirmation')\n  .option('-t, --tag <tag>', 'Image tag', 'latest')\n  .action((env, options) => {\n    console.log(`Deploying to ${env}`, options);\n  });\n// Subcommand\nprogram\n  .command('config <action>')\n  .description('Manage config')\n  .action((action) => {\n    if (action === 'show') console.log(config);\n  });\nprogram.parse();"
                  }
        ],
        tips: [
                  "Commander auto-generates --help and --version.",
                  "Use <arg> for required, [arg] for optional arguments.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not calling program.parse() — nothing will run.",
        shorthand: {
          verbose: "// Manual / verbose approach\nnew Command().command('cmd').option('-f').action((args, opts) => {}).parse();\n// More explicit but longer",
          concise: "program.command('cmd').option('-f, --flag').action(fn).parse()",
        },
      },
      {
        id: "inquirer-basics",
        fn: "Inquirer.js Interactive Prompts",
        desc: "Build interactive CLIs: text input, selects, checkboxes, confirmations.",
        category: "CLI",
        subtitle: "inquirer.prompt(), type options: input/list/checkbox/confirm",
        signature: "inquirer.prompt([{ type, name, message, choices }])",
        descLong: "Inquirer provides interactive prompts: input (text), list (select one), checkbox (select many), confirm (yes/no). Returns answers object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Inquirer.js Interactive Prompts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport inquirer from 'inquirer';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Inquirer.js Interactive Prompts — common patterns you'll see in production.\n// APPROACH  - Combine Inquirer.js Interactive Prompts with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst answers = await inquirer.prompt([\n  {\n    type: 'input',\n    name: 'projectName',\n    message: 'Project name:',\n    default: 'my-app',\n  },\n  {\n    type: 'list',\n    name: 'template',\n    message: 'Choose template:',\n    choices: ['express', 'fastify', 'koa', 'hono'],\n  },\n  {\n    type: 'checkbox',\n    name: 'features',\n    message: 'Select features:',\n    choices: [\n      { name: 'TypeScript', checked: true },\n      'ESLint',\n      'Prettier',\n      'Testing',\n    ],\n  },\n  {\n    type: 'confirm',\n    name: 'createGit',\n    message: 'Initialize git?',\n    default: true,\n  },\n]);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Inquirer.js Interactive Prompts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconsole.log(answers);\n// { projectName: 'my-app', template: 'express', features: [...], ... }"
                  }
        ],
        tips: [
                  "list returns single choice; checkbox returns array.",
                  "Use default and checked for better UX.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not awaiting inquirer.prompt() — won't get answers.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst a = await inquirer.prompt([ { type: 'input', name: 'x', message: 'Enter x:' } ]);\n// More explicit but longer",
          concise: "inquirer.prompt([{ type: 'list'/'input'/'checkbox'/'confirm', name, message, choices }])",
        },
      },
      {
        id: "chalk-ora",
        fn: "Chalk & Ora: Colors & Spinners",
        desc: "CLI UX: colored output (chalk), spinners/progress (ora).",
        category: "CLI",
        subtitle: "chalk.red/blue/green, ora spinners, progress tracking",
        signature: "chalk.red(text)  |  ora(\"msg\").start()|succeed()|fail()",
        descLong: "Chalk colors terminal text. Ora shows spinners and progress. Combine for professional CLI UX.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Chalk & Ora: Colors & Spinners — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport chalk from 'chalk';\nimport ora from 'ora';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Chalk & Ora: Colors & Spinners — common patterns you'll see in production.\n// APPROACH  - Combine Chalk & Ora: Colors & Spinners with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Colors\nconsole.log(chalk.green('✓ Success'));\nconsole.log(chalk.red('✗ Error'));\nconsole.log(chalk.yellow('! Warning'));\nconsole.log(chalk.blue.bold('Title'));\n// Spinner\nconst spinner = ora('Loading data...').start();\nsetTimeout(() => {\n  spinner.succeed('Data loaded!');\n}, 2000);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Chalk & Ora: Colors & Spinners — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Fail spinner\nconst spinner2 = ora('Processing...').start();\nsetTimeout(() => {\n  spinner2.fail('Processing failed');\n}, 1000);\n// Combined with function\nasync function deployApp() {\n  const spinner = ora('Deploying...').start();\n  try {\n    await runDeploy();\n    spinner.succeed(chalk.green('Deployed successfully'));\n  } catch (err) {\n    spinner.fail(chalk.red('Deploy failed: ' + err.message));\n  }\n}"
                  }
        ],
        tips: [
                  "Spinners auto-stop on succeed()/fail()/stop().",
                  "Combine with console.log() for multi-line output.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not stopping spinner — output looks messy.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst s = ora('msg').start(); await work(); s.succeed('done');\n// More explicit but longer",
          concise: "chalk.color(text) + ora('msg').start/succeed/fail",
        },
      },
      {
        id: "cli-config",
        fn: "Reading Configuration in CLIs",
        desc: "CLI config: cosmiconfig, dotenv, env vars, --flag parsing.",
        category: "CLI",
        subtitle: "cosmiconfig, dotenv, process.env, flag parsing",
        signature: "cosmiconfig(\"myapp\")  |  dotenv.config()  |  process.env.VAR",
        descLong: "Load config from multiple sources: files (.myapprc, .myapprc.json), env vars (.env), CLI flags. cosmiconfig searches up directory tree.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Reading Configuration in CLIs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { cosmiconfig } from 'cosmiconfig';\nimport dotenv from 'dotenv';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Reading Configuration in CLIs — common patterns you'll see in production.\n// APPROACH  - Combine Reading Configuration in CLIs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Load .env file\ndotenv.config({ path: '.env.local' });\n// Load config via cosmiconfig\nconst explorer = cosmiconfig('myapp');\nconst result = await explorer.search();\nconst config = result?.config || {};\n// Or read directly\nconst envConfig = {\n  apiUrl: process.env.API_URL || 'https://api.example.com',\n  debug: process.env.DEBUG === 'true',\n  timeout: parseInt(process.env.TIMEOUT || '5000'),\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Reading Configuration in CLIs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Parse CLI flags\nfunction parseArgs(argv) {\n  const args = {};\n  for (let i = 0; i < argv.length; i++) {\n    if (argv[i].startsWith('--')) {\n      const key = argv[i].slice(2);\n      args[key] = argv[i + 1] || true;\n      i++;\n    }\n  }\n  return args;\n}\nconst cliArgs = parseArgs(process.argv.slice(2));\nconst finalConfig = { ...config, ...envConfig, ...cliArgs };"
                  }
        ],
        tips: [
                  "cosmiconfig searches up: .myapprc → .myapprc.json → package.json → .myapprc.cjs.",
                  "CLI flags override env vars and config files.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not loading .env — secrets exposed or hardcoded.",
        shorthand: {
          verbose: "// Manual / verbose approach\ncosmiconfig('name').search(); dotenv.config(); process.env.VAR\n// More explicit but longer",
          concise: "cosmiconfig + dotenv + process.env + CLI flag parsing",
        },
      },
      {
        id: "cli-testing",
        fn: "Testing CLI Tools",
        desc: "Test CLIs: spawn process, assert stdout/stderr, exitCode.",
        category: "CLI",
        subtitle: "execa, execaSync, stdout/stderr assertions",
        signature: "execa(\"cli\", args)  |  { stdout, stderr, exitCode }",
        descLong: "Test CLIs by spawning them as subprocesses. execa runs async, returns stdout/stderr/exitCode. Assert outputs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Testing CLI Tools — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport { execa } from 'execa';\nimport { test } from 'vitest';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Testing CLI Tools — common patterns you'll see in production.\n// APPROACH  - Combine Testing CLI Tools with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntest('cli deploy command', async () => {\n  const { stdout } = await execa('node', ['cli.js', 'deploy', 'staging']);\n  expect(stdout).toContain('Deployed');\n});\ntest('cli with --help flag', async () => {\n  const { stdout } = await execa('node', ['cli.js', '--help']);\n  expect(stdout).toContain('Usage:');\n  expect(stdout).toContain('deploy');\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Testing CLI Tools — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntest('cli error handling', async () => {\n  try {\n    await execa('node', ['cli.js', 'invalid-cmd']);\n  } catch (err) {\n    expect(err.exitCode).toBe(1);\n    expect(err.stderr).toContain('Unknown command');\n  }\n});"
                  }
        ],
        tips: [
                  "execa throws on non-zero exit — wrap in try/catch.",
                  "All stdout/stderr captured — perfect for testing.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not testing CLI error cases — failures go undetected.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst { stdout, stderr, exitCode } = await execa('cmd', args); expect(stdout).toContain('...');\n// More explicit but longer",
          concise: "execa('cli', args) → { stdout, stderr, exitCode }; assert outputs",
        },
      },
      {
        id: "cli-distribution",
        fn: "Distributing CLI Tools",
        desc: "Package CLIs: bin field, hashbang, pkg, esbuild bundling.",
        category: "CLI",
        subtitle: "bin in package.json, #!/usr/bin/env node, pkg executable",
        signature: "\"bin\": { \"mycli\": \"./bin/cli.js\" }  |  #!/usr/bin/env node",
        descLong: "Publish CLIs via npm. Add bin field to package.json. Add hashbang to entry point. Users get command in PATH. Use pkg to bundle as standalone executable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Distributing CLI Tools — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json\n{\n  \"name\": \"my-cli\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",\n  \"bin\": {\n    \"mycli\": \"./bin/cli.js\"\n  },\n  \"files\": [\"bin\"]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Distributing CLI Tools — common patterns you'll see in production.\n// APPROACH  - Combine Distributing CLI Tools with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// bin/cli.js\n#!/usr/bin/env node\nimport { Command } from 'commander';\nconst program = new Command();\nprogram.command('hello').action(() => console.log('Hello from CLI!'));\nprogram.parse();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Distributing CLI Tools — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// After npm install -g my-cli, users can:\n// $ mycli hello\n// Alternative: bundle with pkg\n// npm install -g pkg\n// pkg bin/cli.js --output mycli\n// Or esbuild for single file\n// esbuild bin/cli.js --bundle --platform=node --outfile=cli-bundled.js"
                  }
        ],
        tips: [
                  "Hashbang #!/usr/bin/env node enables direct execution.",
                  "pkg creates standalone .exe/.app — no Node.js needed to run.",
                  "Consider edge cases: empty inputs, concurrent access, and resource cleanup."
        ],
        mistake: "Not including bin field — CLI won't be installed as command.",
        shorthand: {
          verbose: "// Manual / verbose approach\n\"bin\": { \"name\": \"./bin/cli.js\" }; #!/usr/bin/env node at top\n// More explicit but longer",
          concise: "bin field + hashbang + pkg for standalone or esbuild for bundling",
        },
      },
    ],
  },
]

export default { meta, sections }
