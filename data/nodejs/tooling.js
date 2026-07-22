export const meta = {
  "title": "npm & Tooling",
  "domain": "nodejs",
  "sheet": "tooling",
  "icon": "🛠️"
}

export const sections = [

  // ── Section 1: npm & Tooling ─────────────────────────────────────────
  {
    id: "npm-tooling",
    title: "npm & Tooling",
    entries: [
      {
        id: "package-json-fields",
        fn: "package.json",
        desc: "The manifest for a Node.js project — defines scripts, dependencies, module type, and exports.",
        category: "package.json",
        subtitle: "Project configuration manifest",
        signature: "{ \"name\", \"scripts\", \"dependencies\", \"type\", \"exports\" }",
        descLong: "package.json is the central config file for a Node.js project. type: \"module\" enables ESM (import/export) throughout the project. The exports field defines the public API of a package. scripts are npm lifecycle hooks and shortcuts. engines specifies minimum Node version.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of package.json — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n{\n  \"name\": \"my-api\",\n  \"version\": \"1.0.0\",\n  \"type\": \"module\",        // enables ESM (import/export)\n  \"main\": \"./dist/index.js\",\n  \"exports\": {\n    \".\": \"./dist/index.js\","
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of package.json — common patterns you'll see in production.\n// APPROACH  - Combine package.json with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n\"./utils\": \"./dist/utils.js\"\n  },\n  \"scripts\": {\n    \"dev\":     \"node --watch src/index.js\",\n    \"build\":   \"tsc\",\n    \"start\":   \"node dist/index.js\",\n    \"test\":    \"node --test\","
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of package.json — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n\"lint\":    \"eslint src/\",\n    \"prepare\": \"npm run build\"  // runs before npm publish\n  },\n  \"engines\": { \"node\": \">=20\" },\n  \"dependencies\": { \"express\": \"^4.18.0\" },\n  \"devDependencies\": { \"typescript\": \"^5.0.0\" }\n}"
                  }
        ],
        tips: [
                  "type: \"module\" is required for ESM — without it, .js files are treated as CommonJS.",
                  "node --watch (Node 18+) restarts on file changes — no nodemon needed for development.",
                  "Use exact versions in package-lock.json / npm ci for reproducible production builds.",
                  "The prepare script runs on npm install and before npm publish — good for build steps."
        ],
        mistake: "Installing everything as a dependency instead of splitting into dependencies and devDependencies — production images become unnecessarily large.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "npm-commands",
        fn: "npm Commands",
        desc: "Essential npm CLI commands for managing packages and running scripts.",
        category: "package.json",
        subtitle: "Package and script management",
        signature: "npm install  |  npm ci  |  npm run  |  npm audit",
        descLong: "npm is the default package manager for Node.js. npm ci installs exactly what's in package-lock.json — use it in CI/CD. npm run executes scripts from package.json. npm audit checks for known vulnerabilities. npx runs packages without installing globally.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of npm Commands — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n# Install all dependencies\nnpm install"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of npm Commands — common patterns you'll see in production.\n// APPROACH  - Combine npm Commands with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n# CI/CD — exact installs, no lock file modification\nnpm ci\n# Add a dependency\nnpm install express\nnpm install -D typescript       # dev dependency\nnpm install -E lodash           # exact version (no ^)\n# Run scripts\nnpm run dev\nnpm run build\nnpm test                        # shorthand for npm run test\nnpm start                       # shorthand for npm run start\n# Global tools\nnpm install -g pnpm"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of npm Commands — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n# Audit and fix\nnpm audit\nnpm audit fix\n# Run without installing globally\nnpx create-next-app@latest\n# List outdated packages\nnpm outdated\nnpm update"
                  }
        ],
        tips: [
                  "Use npm ci in Docker and CI — it's faster and strictly respects the lock file.",
                  "pnpm is a faster alternative to npm with better monorepo support.",
                  "npm run env prints all environment variables available in scripts.",
                  "npm pack lets you test what will actually be published before running npm publish."
        ],
        mistake: "Running npm install in CI/CD instead of npm ci — npm install can update package-lock.json, causing non-reproducible builds.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "dotenv",
        fn: "dotenv",
        desc: "Loads .env file variables into process.env at startup.",
        category: "Environment Variables",
        subtitle: "Load .env files into process.env",
        signature: "import \"dotenv/config\"  (ESM)  |  require(\"dotenv\").config()  (CJS)",
        descLong: "dotenv reads a .env file and populates process.env with its key=value pairs. Load it as early as possible — before any code that reads process.env. Node 20.6+ has built-in .env support via --env-file flag. Never commit .env files to version control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of dotenv — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ESM — import side-effect style (simplest)\nimport 'dotenv/config';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of dotenv — common patterns you'll see in production.\n// APPROACH  - Combine dotenv with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CJS\nrequire('dotenv').config();\n// Node 20.6+ — built-in, no package needed\n// node --env-file=.env src/index.js\n// .env file\nPORT=3000\nDATABASE_URL=postgres://user:pass@localhost/db\nJWT_SECRET=supersecret\nNODE_ENV=development"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of dotenv — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Validate required vars at startup\nfunction requireEnv(key) {\n  const val = process.env[key];\n  if (!val) throw new Error(`Missing required env var: ${key}`);\n  return val;\n}\nconst config = {\n  port: Number(process.env.PORT ?? 3000),\n  dbUrl: requireEnv('DATABASE_URL'),\n  jwtSecret: requireEnv('JWT_SECRET'),\n};\nexport default config;"
                  }
        ],
        tips: [
                  "Commit a .env.example with all keys but no values — documents required config.",
                  "Add .env to .gitignore immediately when starting a project.",
                  "Validate and coerce env vars at startup with a config module — fail fast on misconfiguration.",
                  "For production, inject secrets via the deployment platform (Vercel, Railway, AWS SSM) not .env files."
        ],
        mistake: "Reading process.env.SOME_KEY scattered throughout the codebase — centralize all env access in a config.js module that validates at startup.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "node-debug",
        fn: "Node.js Debugger",
        desc: "Debug Node.js apps with the built-in inspector protocol, VS Code, or node --inspect.",
        category: "Debugging",
        subtitle: "Breakpoints and step-through debugging",
        signature: "node --inspect src/index.js  |  node --inspect-brk",
        descLong: "Node.js has a built-in V8 inspector. --inspect starts the inspector and waits for a debugger to attach. --inspect-brk also pauses before the first line. Connect VS Code with the Node.js attach launch config. The debugger; statement sets a programmatic breakpoint.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Node.js Debugger — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json\n{\n  \"scripts\": {\n    \"debug\": \"node --inspect-brk src/index.js\"\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Node.js Debugger — common patterns you'll see in production.\n// APPROACH  - Combine Node.js Debugger with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// VS Code launch.json\n{\n  \"configurations\": [\n    {\n      \"type\": \"node\",\n      \"request\": \"launch\",\n      \"name\": \"Debug\",\n      \"runtimeExecutable\": \"npm\",\n      \"runtimeArgs\": [\"run\", \"dev\"],\n      \"skipFiles\": [\"<node_internals>/**\"]\n    },\n    {\n      \"type\": \"node\",\n      \"request\": \"attach\",\n      \"name\": \"Attach\",\n      \"port\": 9229\n    }\n  ]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Node.js Debugger — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Programmatic breakpoint\nfunction riskyFunction() {\n  debugger; // pauses here when a debugger is attached\n  // ...\n}"
                  }
        ],
        tips: [
                  "--inspect-brk pauses before the first line — useful for debugging startup code.",
                  "VS Code's \"JavaScript Debug Terminal\" automatically attaches to any Node process you run.",
                  "Use the DEBUG env variable with the debug npm package for conditional logging: DEBUG=app:* node app.js.",
                  "clinic.js (npm i -g clinic) profiles CPU, memory, and event loop lag for performance debugging."
        ],
        mistake: "Using console.log-driven debugging exclusively for complex bugs — the step debugger with variable inspection is orders of magnitude faster for tracking down state issues.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "pino-logger",
        fn: "pino (Structured Logging)",
        desc: "Fast, low-overhead JSON logger for Node.js — the production standard for structured logs.",
        category: "Structured Logging",
        subtitle: "JSON logging for production observability",
        signature: "import pino from \"pino\"  →  logger.info({ userId }, \"message\")",
        descLong: "pino is the fastest Node.js logger — it writes newline-delimited JSON with minimal overhead. Structured logs (JSON) are parseable by log aggregators (Datadog, Splunk, CloudWatch). Child loggers inherit context (requestId, userId) so every log in a request chain carries the same metadata.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of pino (Structured Logging) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport pino from 'pino';\nimport crypto from 'crypto';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of pino (Structured Logging) — common patterns you'll see in production.\n// APPROACH  - Combine pino (Structured Logging) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// Base logger\nconst logger = pino({\n  level: process.env.LOG_LEVEL ?? 'info',\n  // Pretty print in dev only:\n  transport: process.env.NODE_ENV !== 'production'\n    ? { target: 'pino-pretty' }\n    : undefined,\n});\n// Structured fields + message\nlogger.info({ userId: '123', action: 'login' }, 'User logged in');\nlogger.error({ err, requestId }, 'Database query failed');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of pino (Structured Logging) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Child logger — inherits + adds context\nconst requestLogger = logger.child({ requestId: req.id, userId });\nrequestLogger.info('Processing request');   // includes requestId + userId\nrequestLogger.debug({ query }, 'DB query'); // includes all context\n// Express middleware\napp.use((req, res, next) => {\n  req.log = logger.child({ requestId: crypto.randomUUID() });\n  req.log.info({ method: req.method, url: req.url }, 'Request received');\n  next();\n});"
                  }
        ],
        tips: [
                  "Always log structured data as the first argument (object) and the message as the second.",
                  "Child loggers are cheap — create one per request for automatic context propagation.",
                  "pino-pretty is for development only — never use it in production (it's slow).",
                  "Log at the right level: debug for development detail, info for business events, error for failures."
        ],
        mistake: "Using console.log in production — it has no log levels, no structured output, and is significantly slower than pino. Switch to a structured logger.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "dual-package",
        fn: "Package Exports Field",
        desc: "The exports field in package.json defines the public API and supports conditional exports for ESM/CJS.",
        category: "ESM & Package Exports",
        subtitle: "Modern package entry point control",
        signature: "\"exports\": { \".\": { \"import\": \"./dist/index.mjs\", \"require\": \"./dist/index.cjs\" } }",
        descLong: "The exports field (Node 12+) replaces main and controls exactly which files consumers can import. Conditional exports let you ship both ESM and CJS from one package. Subpath exports expose specific entry points. Files not listed in exports are inaccessible to consumers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Package Exports Field — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json — dual ESM/CJS package\n{\n  \"name\": \"my-lib\",\n  \"exports\": {\n    \".\": {\n      \"import\":  \"./dist/index.mjs\",   // ESM consumers\n      \"require\": \"./dist/index.cjs\",   // CJS consumers\n      \"types\":   \"./dist/index.d.ts\"   // TypeScript\n    },\n    \"./utils\": {\n      \"import\":  \"./dist/utils.mjs\",\n      \"require\": \"./dist/utils.cjs\"\n    }\n  },\n  \"main\":  \"./dist/index.cjs\",  // fallback for older Node\n  \"module\":\"./dist/index.mjs\",  // bundler hint\n  \"types\": \"./dist/index.d.ts\"\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Package Exports Field — common patterns you'll see in production.\n// APPROACH  - Combine Package Exports Field with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Consumer — ESM\nimport { fn } from 'my-lib';\nimport { helper } from 'my-lib/utils';\n// Consumer — CJS\nconst { fn } = require('my-lib');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Package Exports Field — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Build both with tsup (zero-config)\n// tsup src/index.ts --format esm,cjs --dts"
                  }
        ],
        tips: [
                  "tsup is the easiest way to build dual ESM/CJS packages — one command, zero config.",
                  "The exports field takes precedence over main — always define both.",
                  "Use \".\" for the main entry and named subpaths for secondary entry points.",
                  "Never expose internal files in exports — only expose the public API."
        ],
        mistake: "Relying only on the main field — it doesn't support ESM/CJS conditions. Modern Node and bundlers use exports first.",
        shorthand: {
          verbose: "// Old way: single main field, no ESM/CJS split\n// package.json\n{\n  \"name\": \"my-lib\",\n  \"main\": \"./index.js\"\n}\n// Consumers always get CJS — no ESM support",
          concise: "// Modern way: conditional exports for both ESM + CJS\n\"exports\": {\n  \".\": { \"import\": \"./dist/index.mjs\", \"require\": \"./dist/index.cjs\" }\n}",
        },
      },
      {
        id: "vitest-testing",
        fn: "vitest (Testing)",
        desc: "Vite-native test runner compatible with Jest API — fast, TypeScript-first, with built-in coverage.",
        category: "ESM & Package Exports",
        subtitle: "Modern unit testing for Node.js projects",
        signature: "import { describe, it, expect, vi } from \"vitest\"",
        descLong: "vitest is the fastest modern test runner — it uses Vite for transforms, supports ESM natively, and is compatible with the Jest API so migrating is trivial. Built-in TypeScript support, snapshot testing, coverage via v8 or istanbul, and a browser mode for DOM testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of vitest (Testing) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// math.test.ts\nimport { describe, it, expect, vi, beforeEach } from 'vitest';\nimport { add, fetchUser } from './math';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of vitest (Testing) — common patterns you'll see in production.\n// APPROACH  - Combine vitest (Testing) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndescribe('add', () => {\n  it('adds two numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n  it('handles negatives', () => {\n    expect(add(-1, 1)).toBe(0);\n  });\n});\n// Mocking\nvi.mock('./api', () => ({\n  fetchUser: vi.fn().mockResolvedValue({ id: '1', name: 'Alice' }),\n}));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of vitest (Testing) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ndescribe('fetchUser', () => {\n  beforeEach(() => vi.clearAllMocks());\n  it('returns a user', async () => {\n    const user = await fetchUser('1');\n    expect(user.name).toBe('Alice');\n    expect(fetchUser).toHaveBeenCalledWith('1');\n  });\n});\n// package.json\n// \"test\": \"vitest\",\n// \"coverage\": \"vitest run --coverage\""
                  }
        ],
        tips: [
                  "vitest watch mode (default) re-runs affected tests on file change — fast feedback.",
                  "vi.mock() is hoisted to the top of the file automatically — no need to move imports.",
                  "Use @vitest/coverage-v8 for fast native coverage; @vitest/coverage-istanbul for compatibility.",
                  "vitest.config.ts extends your vite.config.ts automatically — minimal setup."
        ],
        mistake: "Using Jest with ESM and fighting transform configuration — vitest supports ESM natively with zero configuration.",
        shorthand: {
          verbose: "import { describe, it, expect, beforeEach } from 'vitest';\n\ndescribe('add()', () => {\n  it('should add two numbers', () => {\n    const result = add(2, 3);\n    expect(result).toBe(5);\n  });\n  it('should handle negatives', () => {\n    expect(add(-1, 1)).toBe(0);\n  });\n});",
          concise: "import { test, expect } from 'vitest';\ntest('add(2, 3) === 5', () => expect(add(2, 3)).toBe(5));\ntest('add(-1, 1) === 0', () => expect(add(-1, 1)).toBe(0));",
        },
      },
      {
        id: "env-validation",
        fn: "Environment Validation with Zod",
        desc: "Validate and type all environment variables at startup — fail fast on misconfiguration.",
        category: "ESM & Package Exports",
        subtitle: "Type-safe runtime env validation",
        signature: "const env = z.object({ PORT: z.coerce.number() }).parse(process.env)",
        descLong: "Accessing process.env without validation leads to runtime errors from missing or malformed values. Validating with Zod at startup gives you: typed access, clear error messages listing every missing variable, and coercion (strings to numbers/booleans). The env object becomes the single source of truth.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Environment Validation with Zod — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// lib/env.ts\nimport { z } from 'zod';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Environment Validation with Zod — common patterns you'll see in production.\n// APPROACH  - Combine Environment Validation with Zod with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst envSchema = z.object({\n  NODE_ENV:     z.enum(['development', 'production', 'test']),\n  PORT:         z.coerce.number().default(3000),\n  DATABASE_URL: z.string().url(),\n  JWT_SECRET:   z.string().min(32, 'JWT_SECRET must be at least 32 chars'),\n  REDIS_URL:    z.string().url().optional(),\n  LOG_LEVEL:    z.enum(['trace','debug','info','warn','error']).default('info'),\n});\n// Throws on startup with clear error if anything is missing/invalid\nexport const env = envSchema.parse(process.env);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Environment Validation with Zod — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Usage — fully typed\nimport { env } from './lib/env.js';\nconst server = app.listen(env.PORT);\nconst db = new Pool({ connectionString: env.DATABASE_URL });"
                  }
        ],
        tips: [
                  "z.coerce.number() converts string \"3000\" to number 3000 — process.env values are always strings.",
                  "z.coerce.boolean() converts \"true\"/\"false\" strings to booleans.",
                  ".default() provides a fallback — no need to use ?? everywhere in the code.",
                  "Run the validation as the very first thing in your app entry point — before any other imports."
        ],
        mistake: "Accessing process.env.PORT throughout the codebase without validation — a missing variable causes a silent undefined that breaks at an unpredictable point. Validate at startup.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "esm-cjs-modules",
        fn: "ESM vs CommonJS",
        desc: "Modern ESM (import/export) vs legacy CommonJS (require) — interoperability and migration.",
        category: "Module Systems",
        subtitle: "Understanding ES modules and CommonJS",
        signature: "import { fn } from \"module\"  vs  const { fn } = require(\"module\")",
        descLong: "Node supports both ESM (import/export, async) and CommonJS (require, sync). type: \"module\" in package.json enables ESM. ESM is the standard, but CommonJS still works. Mixing is tricky. Use .mjs for ESM in CJS projects. Node 16+ has stable interoperability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ESM vs CommonJS — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ESM (modern, recommended)\n// file.mjs or package.json with \"type\": \"module\"\nimport fs from 'fs/promises';\nimport { helper } from './lib.js';\nimport pkg from './package.json' assert { type: 'json' };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ESM vs CommonJS — common patterns you'll see in production.\n// APPROACH  - Combine ESM vs CommonJS with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nexport const myFunc = () => {};\nexport default { hello: 'world' };\n// CommonJS (legacy, still works)\n// file.js or package.json without \"type\": \"module\"\nconst fs = require('fs');\nconst { helper } = require('./lib');\nmodule.exports = {\n  myFunc: () => {},\n};\nmodule.exports.default = { hello: 'world' };\n// Dual package: support both ESM and CJS\n// package.json\n{\n  \"name\": \"my-lib\",\n  \"type\": \"module\",\n  \"exports\": {\n    \".\": {\n      \"import\": \"./dist/index.mjs\",\n      \"require\": \"./dist/index.cjs\"\n    }\n  },\n  \"main\": \"./dist/index.cjs\"  // fallback\n}\n// Interop: ESM importing CJS\n// ESM file\nimport cjsModule from './legacy.cjs'; // Default export\nconsole.log(cjsModule.myFunc); // Access CommonJS exports\n// Interop: CJS importing ESM (not async-friendly)\n// CommonJS file\nimport('./esm-module.mjs').then(mod => {\n  console.log(mod.myFunc);\n});\n// ESM: import JSON with assertion\nimport config from './config.json' assert { type: 'json' };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ESM vs CommonJS — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// ESM: top-level await\nconst data = await fetch('/api/data').then(r => r.json());\n// ESM: dynamic imports\nconst module = await import('./dynamic.js');\n// ESM: no __dirname, compute it\nimport { fileURLToPath } from 'url';\nimport path from 'path';\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);\n// .mjs workaround in CommonJS project\n// src/worker.mjs (force ESM even with \"type\": \"commonjs\")\nimport { Worker } from 'worker_threads';\nexport function createWorker() {\n  return new Worker('./worker.mjs');\n}\n// src/index.js (CJS)\nconst { createWorker } = require('./worker.mjs'); // Can require .mjs"
                  }
        ],
        tips: [
                  "Use ESM (import/export) in new projects — it's the future and is now stable.",
                  "If mixing, use .mjs for ESM files in CommonJS projects.",
                  "The exports field in package.json supports both ESM and CJS consumers.",
                  "Top-level await only works in ESM — use dynamic import() in CommonJS."
        ],
        mistake: "Trying to use import/export in a CommonJS project without \"type\": \"module\" — Node treats .js as CJS by default.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "node-inspector-profiling",
        fn: "Node Inspector & Profiling",
        desc: "Profile CPU and memory — use --inspect, DevTools, or clinic.js for performance analysis.",
        category: "Performance & Debugging",
        subtitle: "Advanced profiling and tracing",
        signature: "node --inspect-brk --prof app.js  |  clinic.js doctor app.js",
        descLong: "The --prof flag creates a V8 profile (isolate file) that can be analyzed with node --prof-process. clinic.js is simpler — it detects bottlenecks automatically (CPU, memory, event loop lag). Chrome DevTools via --inspect provides real-time visual inspection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Node Inspector & Profiling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport express from 'express';\nimport heapdump from 'heapdump';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Node Inspector & Profiling — common patterns you'll see in production.\n// APPROACH  - Combine Node Inspector & Profiling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst app = express();\n// package.json scripts\n{\n  \"scripts\": {\n    \"debug\": \"node --inspect-brk src/index.js\",\n    \"profile:cpu\": \"node --prof src/index.js\",\n    \"profile:memory\": \"node --expose-gc src/index.js\",\n    \"analyze\": \"clinic doctor -- node src/index.js\",\n    \"heap-snapshot\": \"node --heap-prof src/index.js\"\n  }\n}\n// Using --prof\n// 1. Run with profiling:\n//    node --prof src/index.js\n// 2. Creates isolate-*.log file\n// 3. Process it:\n//    node --prof-process isolate-*.log > profile.txt\n// Using Chrome DevTools (--inspect)\n// 1. Run: node --inspect src/index.js\n// 2. Open chrome://inspect\n// 3. Click \"inspect\"\n// 4. Use DevTools: Performance tab, Memory tab, etc\n// Programmatic heap snapshot\napp.get('/heap-snapshot', (req, res) => {\n  heapdump.writeSnapshot(`./heap-${Date.now()}.heapsnapshot`);\n  res.send('Heap snapshot written');\n});\n// Memory monitoring middleware\napp.use((req, res, next) => {\n  const before = process.memoryUsage();\n  res.on('finish', () => {\n    const after = process.memoryUsage();\n    const delta = {\n      heapUsed: Math.round((after.heapUsed - before.heapUsed) / 1024),\n      external: Math.round((after.external - before.external) / 1024),\n    };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Node Inspector & Profiling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nif (delta.heapUsed > 1000) { // More than 1MB\n      console.warn(`Large memory spike: ${delta.heapUsed}KB`, {\n        path: req.path,\n        method: req.method,\n      });\n    }\n  });\n  next();\n});\n// CPU-intensive function with profiling\nfunction expensiveCalculation(n) {\n  let sum = 0;\n  for (let i = 0; i < n; i++) {\n    sum += Math.sqrt(i);\n  }\n  return sum;\n}\n// Wrap for timing\nfunction profileFunction(fn, label) {\n  return function (...args) {\n    const start = process.hrtime.bigint();\n    const result = fn(...args);\n    const end = process.hrtime.bigint();\n    const duration = Number(end - start) / 1_000_000; // Convert to ms\n    console.log(`${label}: ${duration.toFixed(2)}ms`);\n    return result;\n  };\n}\nconst profiled = profileFunction(\n  () => expensiveCalculation(100_000_000),\n  'Expensive calc'\n);\nprofiled();\n// Trace events (V8 trace)\n// node --trace-events-enabled src/index.js\n// Creates trace-*.json file, open in chrome://tracing"
                  }
        ],
        tips: [
                  "clinic.js is easiest for identifying bottlenecks — run \"npm run analyze\" and it diagnoses CPU, memory, or event loop issues.",
                  "--prof creates detailed V8 profiles but requires post-processing. Use DevTools or clinic.js for easier visualization.",
                  "Memory leaks show as ever-increasing heap usage — take heap snapshots before and after the leak to compare.",
                  "Use console.time/timeEnd for simple timing measurements without tools."
        ],
        mistake: "Profiling in production without understanding the performance tool — use clinic.js for automatic diagnosis.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "docker-nodejs-production",
        fn: "Docker for Node.js",
        desc: "Build and run Node.js apps in Docker — multi-stage builds, health checks, signal handling.",
        category: "Deployment",
        subtitle: "Containerizing Node.js applications",
        signature: "FROM node:20-alpine  |  docker build -t app:latest .",
        descLong: "Docker packages Node apps with dependencies. Multi-stage builds reduce image size (dev dependencies removed). Handle SIGTERM gracefully so Docker can shut down cleanly. Set NODE_ENV=production to optimize startup. Use Alpine Linux for smaller images.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Docker for Node.js — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Dockerfile (multi-stage)\nFROM node:20-alpine AS builder"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Docker for Node.js — common patterns you'll see in production.\n// APPROACH  - Combine Docker for Node.js with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --only=production\n# Development stage (optional)\nFROM node:20-alpine AS development\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\n# Production stage\nFROM node:20-alpine AS production\nENV NODE_ENV=production\nWORKDIR /app\n# Copy production dependencies from builder\nCOPY --from=builder /app/node_modules ./node_modules\nCOPY --from=builder /app/package*.json ./\n# Copy source code\nCOPY src ./src\nCOPY public ./public\n# Non-root user for security\nRUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001\nUSER nodejs\nEXPOSE 3000\nHEALTHCHECK --interval=10s --timeout=3s --start-period=5s \\\n  CMD node -e \"require('http').get('http://localhost:3000/health', (r) => { if (r.statusCode !== 200) throw new Error(r.statusCode) })\"\nCMD [\"node\", \"src/index.js\"]\n// .dockerignore\nnode_modules\nnpm-debug.log\n.git\n.env\n.env.local\ndist\n.next\ncoverage\n// src/index.js - handle graceful shutdown\nimport http from 'http';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Docker for Node.js — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst server = http.createServer((req, res) => {\n  if (req.url === '/health') {\n    res.writeHead(200);\n    res.end('OK');\n    return;\n  }\n  res.writeHead(200);\n  res.end('Server running');\n});\nconst PORT = process.env.PORT || 3000;\nserver.listen(PORT, () => {\n  console.log(`Server listening on port ${PORT}`);\n});\n// Graceful shutdown on SIGTERM (Docker sends this)\nlet isShuttingDown = false;\nprocess.on('SIGTERM', () => {\n  if (isShuttingDown) return;\n  isShuttingDown = true;\n  console.log('SIGTERM received, closing gracefully...');\n  // Stop accepting new connections\n  server.close(() => {\n    console.log('Server closed');\n    process.exit(0);\n  });\n  // Force exit after timeout\n  setTimeout(() => {\n    console.error('Forced exit after timeout');\n    process.exit(1);\n  }, 10_000); // 10 seconds\n});\n// docker-compose.yml\nversion: '3.8'\nservices:\n  app:\n    build: .\n    container_name: my-app\n    ports:\n      - \"3000:3000\"\n    environment:\n      NODE_ENV: production\n      DATABASE_URL: postgres://user:pass@db:5432/app\n    depends_on:\n      - db\n    restart: unless-stopped\n    healthcheck:\n      test: [\"CMD\", \"wget\", \"--quiet\", \"--tries=1\", \"--spider\", \"http://localhost:3000/health\"]\n      interval: 10s\n      timeout: 5s\n      retries: 3\n  db:\n    image: postgres:15-alpine\n    environment:\n      POSTGRES_USER: user\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: app\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\nvolumes:\n  postgres_data:"
                  }
        ],
        tips: [
                  "Use node:X-alpine for smaller images (~200MB vs ~1GB for node:X-bullseye).",
                  "Multi-stage builds remove dev dependencies — production image is much smaller.",
                  "Health checks tell Docker if your app is responsive — required for orchestration.",
                  "Always handle SIGTERM gracefully — Docker sends it for shutdown, not SIGKILL."
        ],
        mistake: "Running as root in Docker — use a non-root user for security.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "pm2-process-manager",
        fn: "PM2 Process Manager",
        desc: "Manage Node.js processes in production — clustering, restarts, monitoring, zero-downtime updates.",
        category: "Deployment",
        subtitle: "Process orchestration and monitoring",
        signature: "pm2 start app.js -i max  |  pm2 reload all",
        descLong: "PM2 automatically restarts crashed processes, manages clustering, handles logs, and enables zero-downtime deployments. Simpler alternative to systemd for process management. ecosystem.config.js allows declaring apps, env vars, and clustering.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PM2 Process Manager — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ecosystem.config.js\nmodule.exports = {\n  apps: [\n    {\n      name: 'api',\n      script: 'src/index.js',\n      instances: 'max',           // Use all CPU cores\n      exec_mode: 'cluster',       // Cluster mode\n      env: {\n        NODE_ENV: 'development',\n        PORT: 3000,\n      },\n      env_production: {\n        NODE_ENV: 'production',\n        PORT: 3000,\n      },\n      // Auto-restart on file changes (dev)\n      watch: true,\n      ignore_watch: ['node_modules', 'logs'],\n      // Log file rotation\n      max_memory_restart: '500M',\n      error_file: 'logs/error.log',\n      out_file: 'logs/out.log',\n      log_date_format: 'YYYY-MM-DD HH:mm:ss',\n      // Graceful shutdown\n      listen_timeout: 3000,\n      kill_timeout: 5000,\n      // Health check\n      wait_ready: true,\n      max_restarts: 10,\n      min_uptime: '10s',\n    },\n    {\n      name: 'worker',\n      script: 'src/worker.js',\n      instances: 2,\n      exec_mode: 'fork',          // Single process\n      env_production: {\n        NODE_ENV: 'production',\n      },\n    },\n  ],\n  deploy: {\n    production: {\n      user: 'ubuntu',\n      host: 'api.example.com',\n      key: '~/.ssh/id_rsa',\n      ref: 'origin/main',\n      repo: 'git@github.com:user/repo.git',\n      path: '/var/www/app',\n      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.js --env production',\n    },\n  },\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PM2 Process Manager — common patterns you'll see in production.\n// APPROACH  - Combine PM2 Process Manager with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CLI commands\n// pm2 start ecosystem.config.js              -- Start all apps\n// pm2 restart api                             -- Restart specific app\n// pm2 reload all                              -- Zero-downtime reload (cluster mode)\n// pm2 stop all                                -- Stop all processes\n// pm2 logs                                    -- View realtime logs\n// pm2 monit                                   -- Monitor CPU/memory\n// pm2 delete all                              -- Remove all processes\n// pm2 save                                    -- Save process list\n// pm2 startup                                 -- Auto-start on reboot\n// pm2 deploy production                       -- Deploy to production\n// src/index.js - signal handling for PM2\nimport http from 'http';\nconst server = http.createServer((req, res) => {\n  res.end('OK');\n});\nserver.listen(3000);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PM2 Process Manager — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// PM2 sends SIGINT for reload in cluster mode\nprocess.on('SIGINT', () => {\n  console.log('Shutting down gracefully...');\n  server.close(() => {\n    process.exit(0);\n  });\n});\n// Signal that app is ready (wait_ready)\nprocess.send('ready');\n// Automatic restart on uncaught exception\nprocess.on('uncaughtException', (err) => {\n  console.error('Uncaught exception:', err);\n  process.exit(1); // PM2 will restart\n});\n// Monitor with PM2 Plus (premium)\n// npm install pm2-plus\n// pm2 link YOUR_API_KEY YOUR_SECRET_KEY\n// Apps stream metrics to dashboard"
                  }
        ],
        tips: [
                  "Use instances: \"max\" for cluster mode — automatically spawns one worker per CPU core.",
                  "reload (not restart) for zero-downtime updates in cluster mode.",
                  "watch: true enables auto-reload during development.",
                  "Set max_memory_restart to auto-restart if memory usage exceeds threshold."
        ],
        mistake: "Using restart instead of reload — restart stops the app, causing downtime. Use reload for zero-downtime.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Old way\n// More explicit but longer",
          concise: "// New way",
        },
      },
      {
        id: "error-tracking-sentry",
        fn: "Error Tracking with Sentry",
        desc: "Capture and track errors in production — Sentry integration for error monitoring and alerting.",
        category: "Monitoring & Logging",
        subtitle: "Production error aggregation",
        signature: "Sentry.init({ dsn })  |  Sentry.captureException(err)",
        descLong: "Sentry captures unhandled exceptions, crashes, and performance issues. Integration is simple: initialize with DSN, attach middleware. Errors are aggregated on the Sentry dashboard with stack traces, context, and alerts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Tracking with Sentry — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport Sentry from '@sentry/node';\nimport Tracing from '@sentry/tracing';\nimport express from 'express';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Tracking with Sentry — common patterns you'll see in production.\n// APPROACH  - Combine Error Tracking with Sentry with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Initialize Sentry\nSentry.init({\n  dsn: process.env.SENTRY_DSN,\n  environment: process.env.NODE_ENV,\n  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,\n  integrations: [\n    new Sentry.Integrations.Http({ tracing: true }),\n    new Tracing.Integrations.Express({\n      app: true,\n      request: true,\n    }),\n  ],\n});\nconst app = express();\n// Sentry request handler (early middleware)\napp.use(Sentry.Handlers.requestHandler());\napp.use(Sentry.Handlers.tracingHandler());\n// Routes\napp.get('/test-error', () => {\n  throw new Error('This is a test error');\n});\napp.get('/test-sentry', (req, res) => {\n  Sentry.captureMessage('Test message', 'info');\n  res.send('Sentry message sent');\n});\n// Error handler with Sentry\napp.use((err, req, res, next) => {\n  // Capture the error\n  Sentry.captureException(err, {\n    level: 'error',\n    tags: {\n      path: req.path,\n      method: req.method,\n    },\n    user: {\n      id: req.user?.id,\n      email: req.user?.email,\n    },\n  });\n  res.status(500).json({ error: 'Internal server error' });\n});\n// Sentry error handler (last middleware)\napp.use(Sentry.Handlers.errorHandler());\n// Unhandled rejection handler\nprocess.on('unhandledRejection', (reason, promise) => {\n  Sentry.captureException(reason);\n  console.error('Unhandled rejection:', reason);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Tracking with Sentry — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\napp.listen(3000);\n// Manual error reporting\napp.post('/api/action', async (req, res) => {\n  try {\n    const result = await riskyOperation();\n    res.json(result);\n  } catch (err) {\n    // Manually report with context\n    Sentry.withScope((scope) => {\n      scope.setContext('operation', {\n        action: 'riskyOperation',\n        userId: req.user?.id,\n      });\n      scope.setLevel('warning');\n      Sentry.captureException(err);\n    });\n    res.status(500).json({ error: 'Operation failed' });\n  }\n});\n// Performance monitoring\napp.get('/api/slow', (req, res) => {\n  const transaction = Sentry.startTransaction({\n    op: 'http.server',\n    name: 'GET /api/slow',\n  });\n  try {\n    const span = transaction.startChild({\n      op: 'db.query',\n      description: 'Fetch users',\n    });\n    // Simulate work\n    const start = Date.now();\n    while (Date.now() - start < 1000) {} // 1 second\n    span.finish();\n    res.json({ status: 'ok' });\n  } finally {\n    transaction.finish();\n  }\n});\nexport default app;"
                  }
        ],
        tips: [
                  "Initialize Sentry early in your app before other middleware.",
                  "Attach error handler as the last middleware — it catches errors from all routes.",
                  "Use withScope to add context (user, request data) to errors for easier debugging.",
                  "Set tracesSampleRate to balance performance tracking vs sampling overhead."
        ],
        mistake: "Not setting up error handler middleware — unhandled errors won't be reported to Sentry.",
        shorthand: {
          verbose: "// Manually wrap every route in try/catch and log to console:\napp.get('/api/data', async (req, res) => {\n  try {\n    const data = await fetchData();\n    res.json(data);\n  } catch (err) {\n    console.error('Error:', err);\n    res.status(500).json({ error: 'Failed' });\n  }\n});",
          concise: "Sentry.init({ dsn: process.env.SENTRY_DSN });\napp.use(Sentry.Handlers.requestHandler());\n// ... routes ...\napp.use(Sentry.Handlers.errorHandler()); // catches all unhandled errors",
        },
      },
    ],
  },
]

export default { meta, sections }
