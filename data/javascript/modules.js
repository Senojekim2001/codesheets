export const meta = {
  "title": "Modules & Bundlers",
  "domain": "javascript",
  "sheet": "modules",
  "icon": "📦"
}

export const sections = [

  // ── Section 1: ES Modules ─────────────────────────────────────────
  {
    id: "es-modules",
    title: "ES Modules",
    entries: [
      {
        id: "esm-export",
        fn: "Export Syntax",
        desc: "Named exports, default export, re-exports",
        category: "Fundamentals",
        subtitle: "Multiple ways to export from a module",
        signature: "export [default] { name } | export default value | export { a, b } from \"./mod\"",
        descLong: "ES modules support named exports (export multiple items), a single default export per module, and re-exporting from other modules. Named exports are explicit; default exports are implicit. Re-exports aggregate code from dependencies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Export Syntax — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest exports: named const, named function, default class.\n// STRENGTHS - three lines; shows all three export styles.\n// WEAKNESSES- no re-exports, no barrel pattern, no tree-shaking note.\n//\n// GOAL: export values from a module\nexport const add = (a, b) => a + b;\nexport function multiply(a, b) { return a * b; }\nexport default class Calculator {}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Export Syntax — common patterns you'll see in production.\n// APPROACH  - Combine Export Syntax with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - combine named, default, and re-exports in a barrel file.\n// STRENGTHS - covers the 80% case: named + default + re-exports + wildcard.\n// WEAKNESSES- no tree-shaking impact discussion; no export type annotation.\n//\n// GOAL: combine named, default, and re-exports\n// WHY: named exports are explicit and tree-shakeable\n// WHY: default exports are best for the primary API of a module\nexport const add = (a, b) => a + b;\nexport default class Calculator {}\n// WHY: re-export from another module to create a barrel\nexport { add, multiply } from \"./math\";\nexport { default as Calc } from \"./calculator\";\n// NOTE: export * does not re-export defaults\nexport * from \"./utils\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Export Syntax — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production module API design: named vs default trade-offs,\n//             barrel file with explicit re-exports, and a type-safe\n//             public API surface.\n// STRENGTHS - clear named vs default guidance; explicit barrel pattern;\n//             tree-shaking implications explained.\n// WEAKNESSES- no runtime validation of exported API surface.\n//\n// GOAL: design a module's public API\n// WHY: named exports are preferred for libraries (tree-shaking, explicit imports)\n// Library module: all named exports for tree-shaking\nexport const add = (a, b) => a + b;\nexport const subtract = (a, b) => a - b;\nexport const multiply = (a, b) => a * b;\nexport const divide = (a, b) => a / b;\n// Single primary class: default export is fine\nexport default class Calculator {\n  constructor() { this.history = []; }\n  run(fn, ...args) { const r = fn(...args); this.history.push(r); return r; }\n}\n// Barrel file (index.js): explicit re-exports only\n// export { add, subtract, multiply, divide } from \"./math\";\n// export { default as Calculator } from \"./calculator\";\n// export { formatDate } from \"./utils\";\n// — consumers import from the barrel, not internal paths\n// Decision rule:\n//   library / utility module                          -> named exports\n//   single primary class/function per file            -> default export\n//   aggregate internal modules for public API         -> explicit re-exports\n//   wildcard re-export                                -> avoid (hides API, hurts tree-shaking)\n//\n// Anti-pattern: multiple default exports in one module; using export * in\n//   barrel files which prevents tree-shaking and hides the public API."
                  }
        ],
        tips: [
                  "Use named exports for modularity; use default for the primary export",
                  "Re-exports in index.js create \"barrel\" files for cleaner API surfaces",
                  "export * does not re-export defaults from the source module"
        ],
        mistake: "Trying to have multiple default exports in one module (only one allowed)",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "esm-import",
        fn: "Import Syntax",
        desc: "Named, default, namespace imports, and aliasing",
        category: "Fundamentals",
        subtitle: "Different ways to consume exported values",
        signature: "import name from \"./mod\" | import { a, b } from \"./mod\" | import * as ns from \"./mod\"",
        descLong: "ES imports pull in exports from other modules. Named imports select specific exports, default imports bring in the default export, and namespace imports create an object containing all named exports. The `as` keyword creates aliases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Import Syntax — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest imports: default, named, namespace, and alias.\n// STRENGTHS - four lines; shows all four import styles.\n// WEAKNESSES- no mixed imports, no tree-shaking note, no side-effect imports.\n//\n// GOAL: import values from another module\nimport Calculator from \"./calculator\";           // default\nimport { add, multiply } from \"./math\";         // named\nimport * as math from \"./math\";                 // namespace\nimport { add as sum } from \"./math\";            // alias"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Import Syntax — common patterns you'll see in production.\n// APPROACH  - Combine Import Syntax with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - mixed import styles, aliasing to avoid conflicts, and\n//             namespace usage.\n// STRENGTHS - covers the 80% case: mixed default+named, alias, namespace.\n// WEAKNESSES- no dynamic import, no side-effect import, no type import.\n//\n// GOAL: mix import styles and avoid conflicts\n// WHY: named imports are tree-shakeable\n// WHY: namespace imports are useful for large modules\nimport Calc, { add, multiply } from \"./utils\";\nimport { add as sum } from \"./math\";\nmath.add(2, 3); // 5"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Import Syntax — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production import patterns: tree-shaking best practices,\n//             side-effect imports, dynamic imports for code splitting,\n//             and a module loading utility with caching.\n// STRENGTHS - tree-shaking guidance; side-effect import explanation;\n//             cached dynamic import pattern; import order conventions.\n// WEAKNESSES- no TypeScript type-only imports (JS-only context).\n//\n// GOAL: choose import patterns for maintainability\n// WHY: named imports make dependencies explicit and enable tree-shaking\n// Side-effect import: runs module code, no bindings imported\nimport \"./polyfills\";\nimport \"./styles.css\";\n// Named imports: tree-shakeable, explicit dependencies\nimport { add, multiply } from \"./math\";\n// Cached dynamic import: avoid re-fetching on hot paths\nconst moduleCache = new Map();\nasync function loadModule(path) {\n  if (!moduleCache.has(path)) {\n    moduleCache.set(path, import(path));\n  }\n  return moduleCache.get(path);\n}\n// Usage: load heavy module on demand\nconst heavy = await loadModule(\"./heavy-processor\");\nheavy.process(data);\n// Decision rule:\n//   importing a few specific exports                  -> named imports\n//   importing many from one module                    -> namespace import or named list\n//   naming conflicts                                  -> alias with 'as'\n//   primary export of a module                        -> default import\n//   module needed only for side effects               -> side-effect import (no bindings)\n//   module needed on demand                           -> dynamic import() with caching\n//\n// Anti-pattern: wildcard imports when only one export is used; awaiting\n//   dynamic import in a hot path without caching; side-effect imports\n//   that could be deferred."
                  }
        ],
        tips: [
                  "Use named imports for selective imports; namespace imports are useful for large modules",
                  "Aliasing prevents naming conflicts when importing from multiple modules",
                  "Tree-shaking works best with named imports (unused named exports can be eliminated)"
        ],
        mistake: "Mixing default and named imports in wrong order: import { a } Calc from \"./mod\" (wrong syntax)",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "dynamic-import",
        fn: "Dynamic Import",
        desc: "import() for lazy loading, code splitting, conditional imports",
        category: "Advanced",
        subtitle: "Load modules at runtime, not parse-time",
        signature: "import(path) -> Promise<module>",
        descLong: "Dynamic imports use import() function syntax to load modules at runtime, returning a Promise. This enables code splitting, lazy loading, and conditional imports. Bundlers automatically split chunks at dynamic import boundaries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dynamic Import — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest dynamic import: await import() at runtime.\n// STRENGTHS - two lines; shows import() returns a module namespace.\n// WEAKNESSES- no error handling, no code splitting explanation, no caching.\n//\n// GOAL: load a module at runtime\nconst math = await import(\"./math\");\nmath.add(2, 3);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dynamic Import — common patterns you'll see in production.\n// APPROACH  - Combine Dynamic Import with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - lazy loading and conditional loading with dynamic import.\n// STRENGTHS - covers the 80% case: lazy function, conditional path, React.lazy.\n// WEAKNESSES- no error handling, no preload, no caching.\n//\n// GOAL: lazy load and conditional loading\n// WHY: dynamic import returns a Promise and splits bundles\nconst loadModule = async () => {\n  const math = await import(\"./math\");\n  return math.add(2, 3);\n};\nasync function loadCalculator(type) {\n  const module = await import(`./calculators/${type}`);\n  return new module.default();\n}\n// WHY: React lazy loading\nconst HeavyComponent = React.lazy(() => import(\"./HeavyComponent\"));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dynamic Import — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production dynamic import patterns: route-based splitting,\n//             preload hints, error handling with fallback, and a\n//             cached loader for hot paths.\n// STRENGTHS - route-level splitting; preload via link; error recovery;\n//             cache prevents re-fetching.\n// WEAKNESSES- cache invalidation strategy is simplistic.\n//\n// GOAL: use dynamic imports for performance\n// WHY: bundlers create separate chunks at dynamic import boundaries\n// Route-based code splitting\nconst routes = {\n  home: () => import(\"./pages/Home\"),\n  about: () => import(\"./pages/About\"),\n  settings: () => import(\"./pages/Settings\"),\n};\nasync function navigate(page) {\n  const mod = await routes[page]();\n  return mod.default;\n}\n// Preload hint: start fetching before navigation\nfunction preloadRoute(page) {\n  routes[page](); // fire and forget — chunk loads in background\n}\n// Error handling with fallback\nasync function loadFeature(name) {\n  try {\n    const mod = await import(`./features/${name}`);\n    return mod.default;\n  } catch (e) {\n    console.error(`Failed to load ${name}:`, e);\n    return null;\n  }\n}\n// Cached loader for hot paths\nconst cache = new Map();\nasync function cachedImport(path) {\n  if (!cache.has(path)) cache.set(path, import(path));\n  return cache.get(path);\n}\n// Decision rule:\n//   route-based code splitting                         -> dynamic import at route boundary\n//   conditional feature loading                        -> dynamic import inside event handler\n//   large dependency loaded on demand                  -> dynamic import with preload\n//   always-needed module                               -> static import\n//   hot path with repeated imports                     -> cached dynamic import\n//\n// Anti-pattern: awaiting a dynamic import in a hot path without caching;\n//   no error handling on dynamic imports that may fail (network, missing module)."
                  }
        ],
        tips: [
                  "Dynamic imports return a Promise; use await or .then() to access the module",
                  "Bundlers create separate chunks at dynamic import boundaries for code splitting",
                  "Useful for conditional features, route-based splitting, and polyfills"
        ],
        mistake: "Forgetting to await the import() Promise or not handling rejection",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "import-meta",
        fn: "import.meta Object",
        desc: "import.meta.url, import.meta.env, import.meta.resolve",
        category: "Advanced",
        subtitle: "Module metadata and environment access",
        signature: "import.meta.url | import.meta.env | import.meta.resolve(specifier)",
        descLong: "import.meta is a special object containing module metadata. import.meta.url is the URL of the current module; import.meta.env holds environment variables (in Vite); import.meta.resolve resolves module specifiers to URLs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of import.meta Object — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest import.meta: read module URL and build relative path.\n// STRENGTHS - two lines; shows import.meta.url and new URL() for relative paths.\n// WEAKNESSES- no env vars, no resolve, no cross-environment notes.\n//\n// GOAL: read module metadata\nconsole.log(import.meta.url); // file URL of current module\nconst configPath = new URL(\"./config.json\", import.meta.url);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of import.meta Object — common patterns you'll see in production.\n// APPROACH  - Combine import.meta Object with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - import.meta for env vars (Vite), module resolution, and\n//             __dirname equivalent in ESM.\n// STRENGTHS - covers the 80% case: env vars, resolve, URL-based dir.\n// WEAKNESSES- no cross-environment fallback, no Node vs browser distinction.\n//\n// GOAL: use import.meta for env and resolution\n// WHY: ESM has no __dirname/__filename; use import.meta.url\nconst apiUrl = import.meta.env.VITE_API_URL;\nconst isDev = import.meta.env.DEV;\nconst isProd = import.meta.env.PROD;\nconst resolved = import.meta.resolve(\"./utils\");\nconst currentDir = new URL(\".\", import.meta.url);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of import.meta Object — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production import.meta patterns: cross-environment __dirname\n//             polyfill, env var validation, and safe file path resolution.\n// STRENGTHS - cross-environment compatibility; env validation utility;\n//             fileURLToPath for Node.js fs operations.\n// WEAKNESSES- import.meta.env is Vite-specific; Node.js has different env access.\n//\n// GOAL: use import.meta safely across environments\n// WHY: import.meta.env is environment-specific (Vite exposes only VITE_ vars to client)\n// Cross-environment __dirname polyfill for ESM\nimport { fileURLToPath } from \"node:url\";\nimport { dirname, join } from \"node:path\";\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = dirname(__filename);\nconst configPath = join(__dirname, \"config.json\");\n// Env var validation utility (Vite-style)\nfunction getEnv(key, fallback) {\n  const val = import.meta.env[key];\n  if (val === undefined) {\n    if (fallback !== undefined) return fallback;\n    throw new Error(`Missing env var: ${key}`);\n  }\n  return val;\n}\nconst apiUrl = getEnv(\"VITE_API_URL\", \"http://localhost:3000\");\nconst maxRetries = Number(getEnv(\"VITE_MAX_RETRIES\", \"3\"));\n// Safe relative file loading in Node.js ESM\nasync function loadConfig() {\n  const url = new URL(\"./config.json\", import.meta.url);\n  const response = await fetch(url);\n  return response.json();\n}\n// Decision rule:\n//   need __dirname equivalent in ESM                 -> new URL('.', import.meta.url)\n//   need current module file path                    -> new URL(import.meta.url).pathname\n//   Vite environment variables (client)              -> import.meta.env.VITE_*\n//   runtime module resolution in Node                -> import.meta.resolve (when supported)\n//   Node.js fs operations from ESM                   -> fileURLToPath(import.meta.url)\n//\n// Anti-pattern: accessing non-VITE_ env vars in client-side Vite code;\n//   using __dirname directly in ESM (it's undefined)."
                  }
        ],
        tips: [
                  "import.meta.url enables relative paths without __dirname in ESM",
                  "Vite injects environment variables as import.meta.env at build time",
                  "Use import.meta.resolve for safe module path resolution in Node.js"
        ],
        mistake: "Trying to access import.meta.env variables without VITE_ prefix in Vite projects",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Module Patterns ─────────────────────────────────────────
  {
    id: "module-patterns",
    title: "Module Patterns",
    entries: [
      {
        id: "barrel-exports",
        fn: "Barrel Exports",
        desc: "Aggregate and re-export via index.js files",
        category: "Patterns",
        subtitle: "Provide clean public API surfaces",
        signature: "export { a } from \"./module-a\"; export { b } from \"./module-b\"",
        descLong: "Barrel exports use an index.js file to re-export symbols from internal modules, creating a clean public API. Consumers import from the barrel instead of internal paths. Pro: cleaner imports and easier refactoring. Con: can enable unintended imports and make tree-shaking harder.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Barrel Exports — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest barrel file: re-export from index.js.\n// STRENGTHS - shows barrel creation and clean consumer import.\n// WEAKNESSES- no export * warning, no tree-shaking impact.\n//\n// GOAL: expose a clean public API from a directory\n// src/components/index.js\nexport { Button } from \"./Button\";\nexport { Card } from \"./Card\";\n// Consumer\nimport { Button, Card } from \"@/components\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Barrel Exports — common patterns you'll see in production.\n// APPROACH  - Combine Barrel Exports with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - barrel files for cleaner imports with explicit re-exports\n//             and wildcard warning.\n// STRENGTHS - covers the 80% case: explicit re-exports, wildcard warning.\n// WEAKNESSES- no deep import anti-pattern, no bundle analysis note.\n//\n// GOAL: use barrel files for cleaner imports\n// WHY: barrels centralize exports and hide internal paths\n// src/utils/index.js\nexport { formatDate } from \"./formatDate\";\nexport { parseJson } from \"./parseJson\";\n// Consumer\nimport { formatDate, parseJson } from \"@/utils\";\n// WHY: wildcard re-exports disable tree-shaking\nexport * from \"./Button\"; // avoid"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Barrel Exports — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production barrel file design: explicit re-exports, package\n//             boundary barrels, and a barrel audit utility.\n// STRENGTHS - explicit re-export pattern; package boundary guidance;\n//             barrel audit function to detect wildcard re-exports.\n// WEAKNESSES- barrel audit is simplistic; real tools like eslint exist.\n//\n// GOAL: decide when barrel files help or hurt\n// WHY: barrels simplify imports but can mask bundle impact\n// Package barrel (package.json exports field)\n// \"exports\": {\n//   \".\": \"./dist/index.js\",\n//   \"./utils\": \"./dist/utils/index.js\",\n//   \"./components\": \"./dist/components/index.js\"\n// }\n// Explicit barrel: src/index.js\n// export { Button, Card, Input } from \"./components\";\n// export { formatDate, parseJson } from \"./utils\";\n// export { Store } from \"./store\";\n// Barrel audit: detect wildcard re-exports that hurt tree-shaking\nfunction auditBarrel(exports) {\n  const wildcards = exports.filter(e => e.includes('export *'));\n  const explicit = exports.filter(e => !e.includes('export *'));\n  return {\n    total: exports.length,\n    explicit: explicit.length,\n    wildcards: wildcards.length,\n    recommendation: wildcards.length > 0\n      ? 'Replace export * with explicit named re-exports'\n      : 'OK: all re-exports are explicit',\n  };\n}\n// Decision rule:\n//   package/library public API                              -> barrel with explicit re-exports\n//   internal directory consumed by many files                 -> barrel for ergonomics\n//   tree-shaking critical                                     -> avoid export *, use explicit list\n//   barrel import of another barrel                         -> avoid (deep imports)\n//\n// Anti-pattern: export * from every module in a barrel; barrel files\n//   that re-export from other barrel files (deep import chains)."
                  }
        ],
        tips: [
                  "Barrels centralize exports; update index.js once instead of many files",
                  "Using export * can prevent tree-shaking; explicitly export what you want",
                  "Organize barrels at package boundaries for better API design"
        ],
        mistake: "Overusing barrel files with export * everywhere, killing tree-shaking benefits",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "circular-deps",
        fn: "Circular Dependencies",
        desc: "How ESM handles circular imports and prevention strategies",
        category: "Patterns",
        subtitle: "Manage mutual dependencies safely",
        signature: "a imports b, b imports a — ESM creates partial bindings",
        descLong: "Circular dependencies occur when module A imports B and B imports A. ESM handles this with partial module binding: importing happens before evaluation. If you access a binding before it is defined, you get undefined. Break cycles by importing inside functions, using separate entry points, or restructuring code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Circular Dependencies — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest circular dependency: A imports B, B imports A.\n// STRENGTHS - shows the problem clearly in two files.\n// WEAKNESSES- no solution shown, no ESM binding explanation.\n//\n// GOAL: understand the circular dependency problem\n// a.js\nimport { b } from \"./b\";\nexport const a = () => b() + 1;\n// b.js\nimport { a } from \"./a\";\nexport const b = () => a() + 2;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Circular Dependencies — common patterns you'll see in production.\n// APPROACH  - Combine Circular Dependencies with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - break cycles with dynamic import inside functions or extract\n//             a shared module.\n// STRENGTHS - covers the 80% case: dynamic import solution, shared module.\n// WEAKNESSES- no initialization order explanation, no bundler warning note.\n//\n// GOAL: break cycles with lazy imports or shared modules\n// WHY: ESM binds first, evaluates later — top-level access can be undefined\n// SOLUTION 1: dynamic import inside function\nexport const a = async () => {\n  const { b } = await import(\"./b\");\n  return b() + 1;\n};\n// SOLUTION 2: shared module\nexport const sharedFunc = () => 42;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Circular Dependencies — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production circular dependency resolution: shared state\n//             module, deferred access pattern, and a cycle detection utility.\n// STRENGTHS - shared state pattern; deferred access with dynamic import;\n//             cycle detection function for module graphs.\n// WEAKNESSES- cycle detection is simplistic; real tools like madge exist.\n//\n// GOAL: prevent and resolve circular dependencies in production\n// WHY: circular deps create brittle initialization order\n// Pattern 1: Extract shared state into a third module\n// shared.js\n// export const state = { count: 0 };\n// a.js: import { state } from \"./shared\"; state.count++;\n// b.js: import { state } from \"./shared\"; console.log(state.count);\n// Pattern 2: Deferred access — only use binding inside functions\n// a.js\nimport { b } from \"./b\";\nexport function a() { return b() + 1; } // OK: b is bound by call time\n// b.js\nimport { a } from \"./a\";\nexport function b() { return a() + 2; } // OK: a is bound by call time\n// Pattern 3: Cycle detection utility\nfunction detectCycles(graph) {\n  const visited = new Set();\n  const stack = new Set();\n  const cycles = [];\n  function dfs(node, path) {\n    if (stack.has(node)) {\n      cycles.push([...path.slice(path.indexOf(node)), node]);\n      return;\n    }\n    if (visited.has(node)) return;\n    visited.add(node);\n    stack.add(node);\n    for (const dep of graph[node] || []) dfs(dep, [...path, node]);\n    stack.delete(node);\n  }\n  for (const node of Object.keys(graph)) dfs(node, []);\n  return cycles;\n}\n// detectCycles({ a: ['b'], b: ['a'] }) -> [['a', 'b', 'a']]\n// Decision rule:\n//   two modules depend on each other at runtime             -> extract shared module\n//   dependency only needed inside function                  -> deferred access is safe\n//   dependency needed at top level                          -> dynamic import inside init\n//   design phase                                            -> prefer unidirectional dependency graph\n//\n// Anti-pattern: top-level use of an imported binding in a circular chain;\n//   ignoring bundler circular dependency warnings."
                  }
        ],
        tips: [
                  "Use import() inside functions to defer loading until both modules are initialized",
                  "Create a \"shared\" module for common dependencies to break the cycle",
                  "Detect circular deps with bundler warnings (webpack, Vite both warn)"
        ],
        mistake: "Accessing exports at module top-level before they are defined in circular chains",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "tree-shaking",
        fn: "Tree-Shaking",
        desc: "Write code that bundlers can eliminate as unused",
        category: "Optimization",
        subtitle: "Remove dead code during bundling",
        signature: "\"sideEffects\": false in package.json enables aggressive tree-shaking",
        descLong: "Tree-shaking is bundler DCE (dead code elimination) that removes unused exports. Works best with named exports, pure functions, and \"sideEffects\": false. Bundlers mark code as side-effect-free and exclude unused exports from the bundle.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tree-Shaking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest tree-shaking: named exports, unused code removed.\n// STRENGTHS - shows how bundlers eliminate unused named exports.\n// WEAKNESSES- no sideEffects config, no default export comparison.\n//\n// GOAL: write code that bundlers can remove when unused\nexport const add = (a, b) => a + b;\nexport const subtract = (a, b) => a - b;\n// main.js only imports add\nimport { add } from \"./math\";\n// subtract is removed from bundle"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tree-Shaking — common patterns you'll see in production.\n// APPROACH  - Combine Tree-Shaking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - configure tree-shaking via package.json sideEffects and\n//             understand named vs default export impact.\n// STRENGTHS - covers the 80% case: sideEffects config, explicit side-effect list.\n// WEAKNESSES- no runtime reflection discussion, no bundler-specific notes.\n//\n// GOAL: configure tree-shaking via package.json and exports\n// WHY: named exports are easier to eliminate than default exports\n// package.json\n{\n  \"sideEffects\": false,\n  \"main\": \"./dist/index.js\",\n  \"module\": \"./dist/index.esm.js\"\n}\n// WHY: mark files with side-effects explicitly\n{\n  \"sideEffects\": [\"./src/polyfill.js\", \"*.css\"]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tree-Shaking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production tree-shaking: named vs default export analysis,\n//             side-effect patterns that prevent DCE, and a utility to\n//             audit exports for tree-shakeability.\n// STRENGTHS - clear named vs default comparison; side-effect patterns;\n//             export audit utility; pure function annotation.\n// WEAKNESSES- no bundler-specific (webpack/rollup) configuration details.\n//\n// GOAL: maximize tree-shaking effectiveness\n// WHY: default exports of objects force bundlers to keep the whole object\n// BAD: default export of object — bundler keeps everything\n// export default { add, subtract, multiply, divide, format, parse };\n// GOOD: named exports — bundler eliminates unused\nexport const add = (a, b) => a + b;\nexport const subtract = (a, b) => a - b;\nexport const multiply = (a, b) => a * b;\nexport const divide = (a, b) => a / b;\n// Side-effect patterns that prevent tree-shaking:\n// 1. Global mutation at module level\n// window.myLib = true; // prevents DCE of entire module\n// 2. Prototype modification\n// Array.prototype.custom = function() {}; // side effect\n// 3. Class with side-effecting constructor\n// export class Logger { constructor() { fetch('/log'); } }\n// Pure function annotation (webpack/rollup)\n/*#__PURE__*/ function pureAdd(a, b) { return a + b; }\n// Export audit: check if a module is tree-shakeable\nfunction auditExports(exports, imports) {\n  const used = new Set(imports.flatMap(i => i.specifiers));\n  const unused = exports.filter(e => !used.has(e));\n  return {\n    total: exports.length,\n    used: used.size,\n    unused: unused.length,\n    unusedNames: unused,\n    shakeable: unused.length > 0,\n  };\n}\n// auditExports(['add','subtract','multiply'], [{specifiers:['add']}])\n// -> { total: 3, used: 1, unused: 2, unusedNames: ['subtract','multiply'], shakeable: true }\n// Decision rule:\n//   library code                                            -> named exports\n//   mark side-effect-free package                           -> \"sideEffects\": false\n//   polyfills/global CSS                                    -> list in \"sideEffects\"\n//   runtime reflection/eval                                 -> avoid (prevents static analysis)\n//   utility functions with no side effects                  -> annotate with /*#__PURE__*/\n//\n// Anti-pattern: default export of an object containing many utilities;\n//   global mutation at module top level; computed property keys\n//   that prevent static analysis."
                  }
        ],
        tips: [
                  "Use named exports; default exports are harder to tree-shake",
                  "Mark modules as \"sideEffects\": false to enable aggressive elimination",
                  "Avoid runtime reflection (eval, computed keys) which prevents tree-shaking"
        ],
        mistake: "Using default exports everywhere then expecting tree-shaking to work",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "module-workers",
        fn: "Web Workers with Modules",
        desc: "Use ES modules inside Web Workers",
        category: "Advanced",
        subtitle: "Modern worker setup with type: \"module\"",
        signature: "new Worker(path, { type: \"module\" }) enables ESM in workers",
        descLong: "Web Workers can import ESM modules using type: \"module\" option. This enables code reuse, modern syntax, and bundler support in worker threads. The worker can import shared utilities and use async/await.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Web Workers with Modules — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest module worker: create with type: \"module\".\n// STRENGTHS - three lines; shows worker creation and message passing.\n// WEAKNESSES- no error handling, no shared utilities, no bundler integration.\n//\n// GOAL: run ES modules inside a Web Worker\nconst worker = new Worker(\"./worker.js\", { type: \"module\" });\nworker.postMessage({ task: \"process\", data: [1, 2, 3] });\nworker.onmessage = (e) => console.log(\"Result:\", e.data);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Web Workers with Modules — common patterns you'll see in production.\n// APPROACH  - Combine Web Workers with Modules with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - share utilities between main thread and worker using ESM imports.\n// STRENGTHS - covers the 80% case: shared utils, async processing, postMessage.\n// WEAKNESSES- no error handling, no transferable objects, no termination.\n//\n// GOAL: share utilities between main thread and worker\n// WHY: type: \"module\" lets worker.js use import/export\nimport { processData } from \"./shared-utils\";\nself.onmessage = async (e) => {\n  const { task, data } = e.data;\n  if (task === \"process\") {\n    const result = await processData(data);\n    self.postMessage({ success: true, result });\n  }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Web Workers with Modules — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production module worker integration: promise-based wrapper,\n//             transferable objects, error handling, and bundler-compatible\n//             worker URL resolution.\n// STRENGTHS - promise-based API; transferable objects for zero-copy;\n//             error handling; import.meta.url for ESM worker paths.\n// WEAKNESSES- no worker pool; no SharedArrayBuffer support.\n//\n// GOAL: integrate module workers with bundlers\n// WHY: Vite/Webpack can bundle worker modules as separate chunks\n// Promise-based worker wrapper\nclass ModuleWorker {\n  #worker = null;\n  #pending = new Map();\n  #nextId = 0;\n  constructor(workerPath, options = {}) {\n    this.#worker = new Worker(workerPath, { type: \"module\", ...options });\n    this.#worker.onmessage = (e) => {\n      const { id, result, error } = e.data;\n      const cb = this.#pending.get(id);\n      if (!cb) return;\n      this.#pending.delete(id);\n      error ? cb.reject(new Error(error)) : cb.resolve(result);\n    };\n    this.#worker.onerror = (e) => {\n      for (const [, cb] of this.#pending) cb.reject(new Error(e.message));\n      this.#pending.clear();\n    };\n  }\n  exec(task, transferables = []) {\n    return new Promise((resolve, reject) => {\n      const id = this.#nextId++;\n      this.#pending.set(id, { resolve, reject });\n      this.#worker.postMessage({ id, task }, transferables);\n    });\n  }\n  terminate() {\n    this.#worker.terminate();\n    this.#pending.clear();\n  }\n}\n// Usage with transferable ArrayBuffer (zero-copy)\nconst worker = new ModuleWorker(\n  new URL(\"./processor.js\", import.meta.url)\n);\nconst buffer = new ArrayBuffer(1024);\nconst result = await worker.exec({ data: buffer }, [buffer]);\nworker.terminate();\n// Decision rule:\n//   worker needs shared ESM utilities                    -> type: \"module\"\n//   bundler targets workers                              -> use framework helpers (Vite ?worker, Comlink)\n//   worker path resolution in ESM                        -> new URL('./worker.js', import.meta.url)\n//   large data transfer (zero-copy)                      -> transferable objects\n//   classic worker without imports                       -> omit type or use inline script\n//\n// Anti-pattern: using import/export in a worker without type: \"module\";\n//   not terminating workers when done; copying large buffers instead of\n//   using transferables."
                  }
        ],
        tips: [
                  "type: \"module\" enables ESM syntax (import/export) in workers",
                  "Create shared utility files to reuse code between main thread and workers",
                  "Bundlers (Webpack, Vite) can optimize worker imports and code splitting"
        ],
        mistake: "Forgetting type: \"module\" and trying to use import/export syntax in worker.js",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Vite ─────────────────────────────────────────
  {
    id: "vite",
    title: "Vite",
    entries: [
      {
        id: "vite-config",
        fn: "Vite Configuration",
        desc: "vite.config.js — plugins, aliases, build options, server config",
        category: "Build Tools",
        subtitle: "Configure Vite behavior",
        signature: "export default defineConfig({ plugins: [], resolve: {}, build: {}, server: {} })",
        descLong: "vite.config.js configures Vite's dev server, build output, and plugin ecosystem. Key sections: plugins (extend functionality), resolve (module resolution), build (production output), and server (dev server behavior).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vite Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Vite config: plugins and server port.\n// STRENGTHS - shows defineConfig, plugin array, and server config.\n// WEAKNESSES- no aliases, no build options, no proxy.\n//\n// GOAL: configure Vite for a React project\nimport { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\nexport default defineConfig({\n  plugins: [react()],\n  server: { port: 3000 }\n});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vite Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Vite Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Vite config with aliases, build target, and dev server proxy.\n// STRENGTHS - covers the 80% case: aliases, build options, proxy.\n// WEAKNESSES- no library mode, no environment-specific config, no SSR.\n//\n// GOAL: add aliases, build, and proxy settings\n// WHY: resolve.alias shortens imports\nimport { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\nimport { resolve } from \"path\";\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      \"@\": resolve(__dirname, \"src\"),\n      \"@components\": resolve(__dirname, \"src/components\")\n    }\n  },\n  build: { target: \"es2020\", outDir: \"dist\" },\n  server: {\n    port: 3000,\n    proxy: { \"/api\": \"http://localhost:5000\" }\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vite Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Vite config: environment-specific overrides,\n//             library mode, conditional plugins, and ESM-safe __dirname.\n// STRENGTHS - env-specific config; library mode with externals; ESM-safe\n//             path resolution; conditional plugin loading.\n// WEAKNESSES- no SSR config; no worker plugin configuration.\n//\n// GOAL: tune Vite for production\n// WHY: defineConfig gives typed config and better IDE support\nimport { defineConfig } from \"vite\";\nimport react from \"@vitejs/plugin-react\";\nimport { resolve, dirname } from \"node:path\";\nimport { fileURLToPath } from \"node:url\";\nconst __dirname = dirname(fileURLToPath(import.meta.url));\nexport default defineConfig(({ mode }) => {\n  const isLib = process.env.BUILD_LIB === \"true\";\n  const isDev = mode === \"development\";\n  // Library mode config\n  if (isLib) {\n    return {\n      build: {\n        lib: {\n          entry: resolve(__dirname, \"src/index.js\"),\n          name: \"MyLib\",\n          formats: [\"es\", \"umd\"],\n          fileName: (format) => `my-lib.${format}.js`,\n        },\n        rollupOptions: {\n          external: [\"react\", \"react-dom\"],\n          output: { globals: { react: \"React\", \"react-dom\": \"ReactDOM\" } },\n        },\n      },\n    };\n  }\n  // App mode config\n  return {\n    plugins: [react()],\n    resolve: {\n      alias: {\n        \"@\": resolve(__dirname, \"src\"),\n        \"@components\": resolve(__dirname, \"src/components\"),\n      },\n    },\n    build: {\n      target: \"es2020\",\n      outDir: \"dist\",\n      sourcemap: isDev,\n      rollupOptions: {\n        output: {\n          manualChunks: {\n            vendor: [\"react\", \"react-dom\"],\n            utils: [\"lodash-es\"],\n          },\n        },\n      },\n    },\n    server: {\n      port: 3000,\n      proxy: { \"/api\": \"http://localhost:5000\" },\n    },\n  };\n});\n// Decision rule:\n//   dev server tweaks (port, proxy)                   -> server config\n//   import path aliases                                -> resolve.alias\n//   library publishing                                 -> build.lib + rollupOptions.external\n//   framework support                                  -> plugins array\n//   environment-specific config                        -> function form: defineConfig(({ mode }) => {})\n//\n// Anti-pattern: using __dirname without handling ESM differences in Vite config;\n//   hardcoding mode checks instead of using the mode parameter."
                  }
        ],
        tips: [
                  "Use resolve.alias for clean import paths (@/components instead of ../../)",
                  "Define plugins array to extend functionality (Vue, React, Svelte, etc.)",
                  "Configure build options for production optimization (minify, target)"
        ],
        mistake: "Not defining resolve.alias leading to long relative imports throughout the project",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "vite-env",
        fn: "Vite Environment Variables",
        desc: "import.meta.env, .env files, VITE_ prefix, type safety",
        category: "Configuration",
        subtitle: "Access environment variables in Vite projects",
        signature: "import.meta.env.VITE_KEY or import.meta.env.MODE / DEV / PROD",
        descLong: "Vite loads .env files and injects them into import.meta.env at build time. Only variables prefixed with VITE_ are exposed to the client for security. Use .env, .env.local, .env.production, etc. Create vite-env.d.ts for type safety.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vite Environment Variables — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Vite env vars: .env file and import.meta.env.\n// STRENGTHS - shows .env file, VITE_ prefix, and DEV flag.\n// WEAKNESSES- no type safety, no per-mode files, no security notes.\n//\n// GOAL: read environment variables in Vite\n// .env\nVITE_API_URL=https://api.example.com\n// main.js\nconsole.log(import.meta.env.VITE_API_URL);\nconsole.log(import.meta.env.DEV);  // true in dev"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vite Environment Variables — common patterns you'll see in production.\n// APPROACH  - Combine Vite Environment Variables with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - manage env files per-mode and add type declarations for\n//             autocomplete.\n// STRENGTHS - covers the 80% case: per-mode .env, type declarations.\n// WEAKNESSES- no runtime validation, no secret handling, no SSR notes.\n//\n// GOAL: manage env files and type safety\n// WHY: only VITE_ prefixed vars are exposed to client\n// .env.production\nVITE_API_URL=https://prod-api.example.com\n// WHY: type declarations for autocomplete\n// vite-env.d.ts\ninterface ImportMetaEnv {\n  readonly VITE_API_URL: string;\n}\ninterface ImportMeta {\n  readonly env: ImportMetaEnv;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vite Environment Variables — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production env var handling: validation utility, per-mode\n//             files, secret detection, and typed access with fallbacks.\n// STRENGTHS - runtime validation; secret detection; typed access with\n//             fallbacks; per-mode file precedence explained.\n// WEAKNESSES- no SSR-specific handling (Vite SSR uses different env access).\n//\n// GOAL: handle env variables correctly in Vite\n// WHY: non-VITE_ vars are not injected into client bundle (security)\n// WHY: import.meta.env is replaced at build time, not runtime\n// Env file precedence (highest to lowest):\n//   .env.[mode].local  >  .env.[mode]  >  .env.local  >  .env\n// Typed env access with validation and fallbacks\nfunction getEnv(key, fallback) {\n  const val = import.meta.env[key];\n  if (val === undefined || val === '') {\n    if (fallback !== undefined) return fallback;\n    throw new Error(`Missing required env var: ${key}`);\n  }\n  return val;\n}\n// Secret detection: warn if VITE_ prefix is used for sensitive vars\nconst SENSITIVE_KEYS = ['SECRET', 'PRIVATE', 'TOKEN', 'PASSWORD', 'KEY'];\nfunction checkEnvSecurity() {\n  const envKeys = Object.keys(import.meta.env);\n  for (const key of envKeys) {\n    if (!key.startsWith('VITE_')) continue;\n    const upper = key.toUpperCase();\n    if (SENSITIVE_KEYS.some(s => upper.includes(s))) {\n      console.warn(`⚠ ${key} looks sensitive — VITE_ vars are exposed to client!`);\n    }\n  }\n}\ncheckEnvSecurity();\n// Usage\nconst apiUrl = getEnv('VITE_API_URL', 'http://localhost:3000');\nconst maxRetries = Number(getEnv('VITE_MAX_RETRIES', '3'));\nconst isProd = import.meta.env.PROD;\nconst isDev = import.meta.env.DEV;\nconst mode = import.meta.env.MODE;\n// Decision rule:\n//   public client variable                                -> VITE_ prefix in .env\n//   secret/server variable                                -> keep out of client, use server endpoints\n//   type safety                                           -> vite-env.d.ts\n//   per-mode overrides                                    -> .env.development, .env.production\n//   runtime validation                                    -> getEnv() with fallback\n//\n// Anti-pattern: storing secrets in .env with VITE_ prefix; expecting\n//   process.env to work in browser; not validating env vars at startup."
                  }
        ],
        tips: [
                  "Use VITE_ prefix to expose variables to client (non-VITE_ are server-only)",
                  "Create vite-env.d.ts to get TypeScript autocomplete for import.meta.env",
                  "Use .env.local for local overrides (ignored by git)"
        ],
        mistake: "Expecting process.env to work like in Node.js (doesn't exist in browser)",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "vite-build",
        fn: "Vite Build Output",
        desc: "Chunk splitting, library mode, rollupOptions, output config",
        category: "Build Tools",
        subtitle: "Optimize production builds",
        signature: "build: { rollupOptions: {}, lib: {}, chunkSizeWarningLimit: number }",
        descLong: "Vite's build config controls output chunks, code splitting, and library packaging. Use rollupOptions for advanced Rollup settings, lib mode for publishing libraries, and chunkSizeWarningLimit to control warnings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vite Build Output — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Vite build config: split vendor chunks.\n// STRENGTHS - shows manualChunks for vendor separation.\n// WEAKNESSES- no library mode, no chunk size config, no sourcemap.\n//\n// GOAL: split chunks and configure Vite build\nexport default {\n  build: {\n    outDir: \"dist\",\n    rollupOptions: {\n      output: {\n        manualChunks: { vendor: [\"react\", \"react-dom\"] }\n      }\n    }\n  }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vite Build Output — common patterns you'll see in production.\n// APPROACH  - Combine Vite Build Output with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - optimize caching with manualChunks and build a library.\n// STRENGTHS - covers the 80% case: vendor/utils split, library mode, externals.\n// WEAKNESSES- no dynamic chunk function, no asset inlining, no CSS code split.\n//\n// GOAL: optimize caching and build a library\n// WHY: manualChunks separates vendor code for long-term caching\nexport default {\n  build: {\n    chunkSizeWarningLimit: 1000,\n    rollupOptions: {\n      output: {\n        manualChunks: {\n          vendor: [\"react\", \"react-dom\"],\n          utils: [\"lodash\", \"axios\"]\n        }\n      }\n    }\n  }\n};\n// WHY: library mode for publishable packages\nexport default {\n  build: {\n    lib: {\n      entry: \"src/index.ts\",\n      name: \"MyLib\",\n      fileName: (format) => `my-lib.${format}.js`\n    },\n    rollupOptions: {\n      external: [\"react\"],\n      output: { globals: { react: \"React\" } }\n    }\n  }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vite Build Output — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Vite build tuning: dynamic manualChunks function,\n//             asset inlining thresholds, CSS code splitting, and library\n//             mode with multiple formats.\n// STRENGTHS - dynamic chunk function for smart splitting; asset inlining;\n//             CSS code split; multi-format library output.\n// WEAKNESSES- no SSR build config; no worker chunk handling.\n//\n// GOAL: tune Vite build output for performance\n// WHY: chunking improves cacheability but too many chunks hurt HTTP/1\n// Dynamic manualChunks: split by node_modules vs app code\nexport default {\n  build: {\n    outDir: \"dist\",\n    sourcemap: true,\n    chunkSizeWarningLimit: 1500,\n    assetsInlineLimit: 4096, // inline assets < 4KB as base64\n    cssCodeSplit: true, // split CSS per chunk\n    rollupOptions: {\n      output: {\n        manualChunks(id) {\n          if (id.includes('node_modules')) {\n            if (id.includes('react')) return 'react-vendor';\n            if (id.includes('lodash')) return 'utils-vendor';\n            return 'vendor';\n          }\n          // App code: split by route directory\n          if (id.includes('/pages/')) {\n            const match = id.match(//pages/(w+)/);\n            return match ? `page-${match[1]}` : undefined;\n          }\n        },\n        chunkFileNames: 'js/[name]-[hash].js',\n        assetFileNames: 'assets/[name]-[hash][extname]',\n      },\n    },\n  },\n};\n// Multi-format library build\nexport default {\n  build: {\n    lib: {\n      entry: {\n        index: \"src/index.ts\",\n        utils: \"src/utils.ts\",\n      },\n      formats: [\"es\", \"cjs\", \"umd\"],\n      fileName: (format, name) => `${name}.${format}.js`,\n    },\n    rollupOptions: {\n      external: [/^@my-scope//, \"react\", \"react-dom\"],\n      output: { globals: { react: \"React\", \"react-dom\": \"ReactDOM\" } },\n    },\n  },\n};\n// Decision rule:\n//   app with heavy vendor deps                              -> manualChunks by vendor/utils\n//   smart splitting by package                              -> manualChunks function\n//   publishing a library                                    -> build.lib + external\n//   suppress size warnings                                  -> chunkSizeWarningLimit\n//   inline small assets                                     -> assetsInlineLimit\n//   per-chunk CSS                                           -> cssCodeSplit: true\n//\n// Anti-pattern: splitting every dependency into its own chunk; not setting\n//   chunkFileNames with hash (breaks long-term caching)."
                  }
        ],
        tips: [
                  "manualChunks splits vendor and utility code into separate files for caching",
                  "lib mode packages your code as a reusable library with UMD/ESM outputs",
                  "Set chunkSizeWarningLimit to suppress or adjust size warnings"
        ],
        mistake: "Not configuring manualChunks and ending up with one huge JS file",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: Webpack ─────────────────────────────────────────
  {
    id: "webpack",
    title: "Webpack",
    entries: [
      {
        id: "webpack-config",
        fn: "Webpack Configuration",
        desc: "webpack.config.js — entry, output, loaders, mode",
        category: "Build Tools",
        subtitle: "Core webpack setup",
        signature: "{ entry, output, module: { rules: [] }, mode: \"development\" | \"production\" }",
        descLong: "webpack.config.js defines entry points, output paths, how to transform files with loaders, and build mode. Loaders (babel-loader, css-loader, etc.) transform code; plugins enhance the build. Mode activates optimizations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Webpack Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest webpack config: entry, output, and mode.\n// STRENGTHS - shows the three core webpack concepts.\n// WEAKNESSES- no loaders, no plugins, no devtool.\n//\n// GOAL: basic webpack config\nmodule.exports = {\n  mode: \"production\",\n  entry: \"./src/index.js\",\n  output: {\n    path: __dirname + \"/dist\",\n    filename: \"bundle.js\"\n  }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Webpack Configuration — common patterns you'll see in production.\n// APPROACH  - Combine Webpack Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - add loaders for JSX, CSS, and assets with source maps.\n// STRENGTHS - covers the 80% case: babel-loader, css-loader, asset modules.\n// WEAKNESSES- no plugins, no optimization config, no environment-specific config.\n//\n// GOAL: add loaders for JSX, CSS, and assets\n// WHY: loaders transform source files before bundling\nmodule.exports = {\n  mode: \"production\",\n  entry: \"./src/index.js\",\n  output: { path: __dirname + \"/dist\", filename: \"bundle.js\" },\n  module: {\n    rules: [\n      {\n        test: /.jsx?$/,\n        exclude: /node_modules/,\n        use: {\n          loader: \"babel-loader\",\n          options: { presets: [\"@babel/preset-react\", \"@babel/preset-env\"] }\n        }\n      },\n      { test: /.css$/, use: [\"style-loader\", \"css-loader\"] },\n      { test: /.(png|jpg|gif)$/, type: \"asset/resource\" }\n    ]\n  },\n  devtool: \"source-map\"\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Webpack Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production webpack config: environment-specific configs,\n//             MiniCssExtractPlugin for CSS, cache-loader for speed,\n//             and asset module tuning.\n// STRENGTHS - env-specific config; CSS extraction in prod; cache-loader;\n//             asset module with inline limit; resolve extensions.\n// WEAKNESSES- no webpack 5 module federation; no persistent cache config.\n//\n// GOAL: tune webpack for production\n// WHY: mode enables built-in optimization/minification\nconst { merge } = require(\"webpack-merge\");\nconst MiniCssExtractPlugin = require(\"mini-css-extract-plugin\");\n// Base config\nconst base = {\n  entry: \"./src/index.js\",\n  output: {\n    path: __dirname + \"/dist\",\n    filename: \"[name].[contenthash].js\",\n    clean: true,\n  },\n  resolve: { extensions: [\".js\", \".jsx\", \".ts\", \".tsx\"] },\n  module: {\n    rules: [\n      {\n        test: /.(js|jsx|ts|tsx)$/,\n        exclude: /node_modules/,\n        use: {\n          loader: \"babel-loader\",\n          options: {\n            cacheDirectory: true, // cache transpilation results\n            presets: [\"@babel/preset-env\", \"@babel/preset-react\", \"@babel/preset-typescript\"],\n          },\n        },\n      },\n      {\n        test: /.css$/,\n        use: [MiniCssExtractPlugin.loader, \"css-loader\", \"postcss-loader\"],\n      },\n      {\n        test: /.(png|jpg|gif|svg)$/,\n        type: \"asset\",\n        parser: { dataUrlCondition: { maxSize: 8 * 1024 } }, // inline < 8KB\n      },\n    ],\n  },\n};\n// Development config\nconst dev = merge(base, {\n  mode: \"development\",\n  devtool: \"eval-cheap-module-source-map\",\n  devServer: {\n    hot: true,\n    port: 3000,\n    historyApiFallback: true,\n  },\n});\n// Production config\nconst prod = merge(base, {\n  mode: \"production\",\n  devtool: \"source-map\",\n  plugins: [\n    new MiniCssExtractPlugin({\n      filename: \"css/[name].[contenthash].css\",\n    }),\n  ],\n  optimization: {\n    splitChunks: { chunks: \"all\" },\n    runtimeChunk: \"single\",\n  },\n});\nmodule.exports = (env) => (env.development ? dev : prod);\n// Decision rule:\n//   transpile JSX/ESNext                                   -> babel-loader with exclude: /node_modules/\n//   inline styles in dev                                   -> style-loader + css-loader\n//   extract CSS in production                              -> MiniCssExtractPlugin.loader\n//   debug production                                       -> devtool: \"source-map\"\n//   speed up rebuilds                                      -> cacheDirectory: true in babel-loader\n//   environment-specific config                            -> webpack-merge with base/dev/prod\n//\n// Anti-pattern: including node_modules in babel-loader; using style-loader\n//   in production (use MiniCssExtractPlugin); not using contenthash in\n//   filenames (breaks long-term caching)."
                  }
        ],
        tips: [
                  "Use babel-loader for JSX/ES6+ transpilation",
                  "css-loader + style-loader for CSS; MiniCssExtractPlugin for separate CSS files",
                  "Set mode: \"production\" for minification and optimization"
        ],
        mistake: "Forgetting to exclude node_modules in babel-loader rules",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "webpack-plugins",
        fn: "Webpack Plugins",
        desc: "HtmlWebpackPlugin, MiniCssExtractPlugin, DefinePlugin, common plugins",
        category: "Build Tools",
        subtitle: "Extend webpack build process",
        signature: "plugins: [new HtmlWebpackPlugin(), new MiniCssExtractPlugin()]",
        descLong: "Webpack plugins extend the build pipeline. HtmlWebpackPlugin generates HTML files, MiniCssExtractPlugin extracts CSS to separate files, DefinePlugin injects global variables. Plugins integrate with webpack's lifecycle.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Webpack Plugins — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest webpack plugins: HtmlWebpackPlugin and MiniCssExtractPlugin.\n// STRENGTHS - shows the two most common plugins in a config.\n// WEAKNESSES- no DefinePlugin, no minification options, no loader integration.\n//\n// GOAL: add common webpack plugins\nconst HtmlWebpackPlugin = require(\"html-webpack-plugin\");\nconst MiniCssExtractPlugin = require(\"mini-css-extract-plugin\");\nmodule.exports = {\n  plugins: [\n    new HtmlWebpackPlugin({ template: \"src/index.html\" }),\n    new MiniCssExtractPlugin()\n  ]\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Webpack Plugins — common patterns you'll see in production.\n// APPROACH  - Combine Webpack Plugins with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - plugins for HTML generation, CSS extraction, and build-time\n//             globals with DefinePlugin.\n// STRENGTHS - covers the 80% case: HtmlMinification, contenthash CSS, DefinePlugin.\n// WEAKNESSES- no environment-specific plugin selection, no CopyWebpackPlugin.\n//\n// GOAL: use plugins for HTML, CSS extraction, and env constants\n// WHY: HtmlWebpackPlugin injects script/link tags into HTML\n// WHY: MiniCssExtractPlugin outputs a separate CSS file for caching\nconst webpack = require(\"webpack\");\nmodule.exports = {\n  plugins: [\n    new HtmlWebpackPlugin({\n      template: \"src/index.html\",\n      minify: { collapseWhitespace: true }\n    }),\n    new MiniCssExtractPlugin({\n      filename: \"styles/[name].[contenthash].css\"\n    }),\n    new webpack.DefinePlugin({\n      \"process.env.API_URL\": JSON.stringify(\"https://api.example.com\"),\n      __DEV__: JSON.stringify(true)\n    })\n  ],\n  module: {\n    rules: [\n      { test: /.css$/, use: [MiniCssExtractPlugin.loader, \"css-loader\"] }\n    ]\n  }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Webpack Plugins — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production webpack plugins: environment-aware plugin selection,\n//             BundleAnalyzerPlugin for diagnostics, CopyWebpackPlugin for\n//             static assets, and conditional DefinePlugin values.\n// STRENGTHS - env-aware plugins; bundle analysis; static asset copying;\n//             typed DefinePlugin values from .env.\n// WEAKNESSES- no webpack 5 PersistentCachePlugin; no HotModuleReplacementPlugin.\n//\n// GOAL: choose plugins and loaders correctly\n// WHY: DefinePlugin values must be JSON.stringify'd\nconst webpack = require(\"webpack\");\nconst { merge } = require(\"webpack-merge\");\nconst HtmlWebpackPlugin = require(\"html-webpack-plugin\");\nconst MiniCssExtractPlugin = require(\"mini-css-extract-plugin\");\nconst BundleAnalyzerPlugin = require(\"webpack-bundle-analyzer\").BundleAnalyzerPlugin;\nconst CopyWebpackPlugin = require(\"copy-webpack-plugin\");\n// Environment-aware plugin selection\nfunction getPlugins(isProd) {\n  const plugins = [\n    new HtmlWebpackPlugin({\n      template: \"src/index.html\",\n      minify: isProd ? {\n        collapseWhitespace: true,\n        removeComments: true,\n        removeRedundantAttributes: true,\n      } : false,\n    }),\n  ];\n  if (isProd) {\n    plugins.push(\n      new MiniCssExtractPlugin({\n        filename: \"css/[name].[contenthash].css\",\n        chunkFilename: \"css/[id].[contenthash].css\",\n      }),\n      new CopyWebpackPlugin({\n        patterns: [{ from: \"public\", to: \"\", globOptions: { ignore: [\"**/index.html\"] } }],\n      }),\n      new webpack.DefinePlugin({\n        \"process.env.NODE_ENV\": JSON.stringify(\"production\"),\n        \"process.env.API_URL\": JSON.stringify(process.env.API_URL || \"https://api.example.com\"),\n      })\n    );\n  } else {\n    plugins.push(\n      new webpack.DefinePlugin({\n        \"process.env.NODE_ENV\": JSON.stringify(\"development\"),\n        \"process.env.API_URL\": JSON.stringify(\"http://localhost:3000\"),\n      })\n    );\n  }\n  // Bundle analysis on demand\n  if (process.env.ANALYZE) {\n    plugins.push(new BundleAnalyzerPlugin({ analyzerMode: \"static\" }));\n  }\n  return plugins;\n}\n// Usage in webpack config\n// module.exports = (env) => ({\n//   plugins: getPlugins(env.production),\n//   module: {\n//     rules: [\n//       { test: /.css$/, use: [env.production ? MiniCssExtractPlugin.loader : \"style-loader\", \"css-loader\"] }\n//     ]\n//   }\n// });\n// Decision rule:\n//   generate HTML with injected assets                    -> HtmlWebpackPlugin\n//   extract CSS to file in production                     -> MiniCssExtractPlugin\n//   inject build-time globals                             -> DefinePlugin\n//   CSS in dev (HMR)                                      -> style-loader + css-loader\n//   copy static files to output                           -> CopyWebpackPlugin\n//   diagnose bundle bloat                                 -> BundleAnalyzerPlugin\n//\n// Anti-pattern: using style-loader and MiniCssExtractPlugin.loader together;\n//   not JSON.stringify'ing DefinePlugin values; running BundleAnalyzerPlugin\n//   in production builds unconditionally."
                  }
        ],
        tips: [
                  "HtmlWebpackPlugin auto-injects bundled assets into HTML template",
                  "MiniCssExtractPlugin creates separate CSS file (better caching than inline)",
                  "DefinePlugin provides build-time constants accessible in code"
        ],
        mistake: "Using style-loader with MiniCssExtractPlugin (use MiniCssExtractPlugin.loader instead)",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "webpack-optimization",
        fn: "Webpack Code Splitting",
        desc: "SplitChunksPlugin, lazy loading, bundle analysis",
        category: "Optimization",
        subtitle: "Optimize bundle size and load performance",
        signature: "optimization: { splitChunks: { chunks: \"all\", cacheGroups: {} } }",
        descLong: "Webpack's SplitChunksPlugin divides bundles into chunks for better caching and parallel loading. cacheGroups define how to split vendor, shared, and app code. Lazy loading via dynamic import creates on-demand chunks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Webpack Code Splitting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest webpack code splitting: splitChunks with chunks: \"all\".\n// STRENGTHS - one config block; shows basic chunk splitting.\n// WEAKNESSES- no cacheGroups, no dynamic import, no bundle analysis.\n//\n// GOAL: split bundles into shared chunks\nmodule.exports = {\n  optimization: {\n    splitChunks: { chunks: \"all\" }\n  }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Webpack Code Splitting — common patterns you'll see in production.\n// APPROACH  - Combine Webpack Code Splitting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - configure vendor/common cacheGroups and lazy loading via\n//             dynamic import.\n// STRENGTHS - covers the 80% case: cacheGroups, dynamic import, reuseExistingChunk.\n// WEAKNESSES- no bundle analysis, no HTTP/2 tuning, no prefetch hints.\n//\n// GOAL: configure vendor/common chunks and lazy loading\n// WHY: cacheGroups controls how chunks are created\nmodule.exports = {\n  entry: \"./src/index.js\",\n  output: { path: __dirname + \"/dist\" },\n  optimization: {\n    splitChunks: {\n      chunks: \"all\",\n      cacheGroups: {\n        vendor: {\n          test: /[\\\\/]node_modules[\\\\/]/,\n          name: \"vendors\",\n          priority: 10\n        },\n        common: {\n          minChunks: 2,\n          priority: 5,\n          reuseExistingChunk: true\n        }\n      }\n    }\n  }\n};\n// WHY: dynamic import creates on-demand chunks\nbutton.addEventListener(\"click\", async () => {\n  const module = await import(\"./heavy-feature\");\n  module.init();\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Webpack Code Splitting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production webpack code splitting: fine-grained cacheGroups,\n//             webpack magic comments for chunk naming and prefetch,\n//             runtimeChunk separation, and bundle analysis integration.\n// STRENGTHS - granular vendor splitting; magic comments for prefetch/preload;\n//             runtimeChunk for stable entry chunks; analysis setup.\n// WEAKNESSES- no module federation; no HTTP/2 push configuration.\n//\n// GOAL: optimize webpack bundle output\n// WHY: splitChunks improves caching but needs tuning for HTTP/2 vs HTTP/1\n// Fine-grained cacheGroups for optimal caching\nmodule.exports = {\n  optimization: {\n    runtimeChunk: \"single\", // separate runtime from app code\n    splitChunks: {\n      chunks: \"all\",\n      maxInitialRequests: Infinity,\n      minSize: 20 * 1024, // 20KB minimum for a separate chunk\n      cacheGroups: {\n        reactVendor: {\n          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,\n          name: \"react-vendor\",\n          priority: 20,\n        },\n        uiVendor: {\n          test: /[\\/]node_modules[\\/](@mui|antd|chakra)[\\/]/,\n          name: \"ui-vendor\",\n          priority: 15,\n        },\n        utilsVendor: {\n          test: /[\\/]node_modules[\\/](lodash|axios|dayjs)[\\/]/,\n          name: \"utils-vendor\",\n          priority: 10,\n        },\n        common: {\n          minChunks: 2,\n          priority: 5,\n          reuseExistingChunk: true,\n        },\n      },\n    },\n  },\n};\n// Magic comments: name chunks, prefetch, preload\nconst lazyModule = import(\n  /* webpackChunkName: \"dashboard\" */\n  /* webpackPrefetch: true */\n  \"./pages/Dashboard\"\n);\n// Prefetch on hover for faster navigation\nlink.addEventListener(\"mouseenter\", () => {\n  import(/* webpackChunkName: \"settings\" */ /* webpackPrefetch: true */ \"./pages/Settings\");\n});\n// Bundle analysis config\n// npm install --save-dev webpack-bundle-analyzer\n// Run: ANALYZE=1 webpack --mode production\nconst BundleAnalyzerPlugin = require(\"webpack-bundle-analyzer\").BundleAnalyzerPlugin;\nconst plugins = process.env.ANALYZE\n  ? [new BundleAnalyzerPlugin({ analyzerMode: \"static\", openAnalyzer: false })]\n  : [];\n// Decision rule:\n//   vendor deps shared across entry points                -> cacheGroups.vendor\n//   granular vendor splitting for better caching           -> separate cacheGroups per framework\n//   code used in multiple chunks                          -> cacheGroups.common\n//   on-demand feature loading                             -> dynamic import() with webpackChunkName\n//   faster navigation                                     -> webpackPrefetch magic comment\n//   diagnose bundle bloat                                 -> webpack-bundle-analyzer\n//   stable entry chunk hashes                             -> runtimeChunk: \"single\"\n//\n// Anti-pattern: over-splitting into many tiny chunks for HTTP/1 clients;\n//   not using webpackChunkName (unreadable chunk names); not setting\n//   minSize (too many tiny chunks)."
                  }
        ],
        tips: [
                  "splitChunks with cacheGroups separates vendor code from app for better caching",
                  "Use dynamic import() for route-based or feature-based code splitting",
                  "webpack-bundle-analyzer visualizes bundle composition for optimization opportunities"
        ],
        mistake: "Using dynamic import without configuring splitChunks (no chunking happens)",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
