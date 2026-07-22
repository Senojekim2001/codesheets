export const meta = {
  "title": "tsconfig & Tooling",
  "domain": "typescript",
  "sheet": "config",
  "icon": "⚙️"
}

export const sections = [

  // ── Section 1: Configuration & Build ─────────────────────────────────────────
  {
    id: "configuration-build",
    title: "Configuration & Build",
    entries: [
      {
        id: "tsconfig-essentials",
        fn: "tsconfig.json",
        desc: "Configures the TypeScript compiler — strict mode, module system, output target, and paths.",
        category: "Configuration & Build",
        subtitle: "Essential compiler configuration",
        signature: "{ \"compilerOptions\": { \"strict\": true, \"target\": \"ES2022\" } }",
        descLong: "tsconfig.json controls all TypeScript compiler behavior. strict: true enables the full set of strictness checks (strictNullChecks, noImplicitAny, etc.) — always enable it for new projects. target controls the emitted JS syntax level. module controls the import/export system. outDir sets the output directory.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of tsconfig.json — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json — modern Node.js project\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",           // compiled JS syntax level\n    \"module\": \"NodeNext\",         // module system (ESM-aware)\n    \"moduleResolution\": \"NodeNext\","
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of tsconfig.json — common patterns you'll see in production.\n// APPROACH  - Combine tsconfig.json with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n\"lib\": [\"ES2022\"],\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\",\n    \"strict\": true,               // enable all strict checks\n    \"noUncheckedIndexedAccess\": true, // arr[0] is T | undefined\n    \"exactOptionalPropertyTypes\": true,"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of tsconfig.json — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n\"skipLibCheck\": true,         // skip .d.ts checking (faster)\n    \"declaration\": true,          // emit .d.ts files\n    \"declarationMap\": true,       // source maps for .d.ts\n    \"sourceMap\": true\n  },\n  \"include\": [\"src/**/*\"],\n  \"exclude\": [\"node_modules\", \"dist\"]\n}"
                  }
        ],
        tips: [
                  "Always enable strict: true — it catches real bugs and makes types trustworthy.",
                  "noUncheckedIndexedAccess makes array access return T | undefined — catches out-of-bounds bugs.",
                  "skipLibCheck: true speeds up compilation by skipping validation of node_modules .d.ts files.",
                  "Use @tsconfig/recommended or @tsconfig/node20 as a base to avoid boilerplate."
        ],
        mistake: "Starting without strict: true and turning it on later — you'll face a backlog of errors. Always enable strict from day one.",
        shorthand: {
          verbose: "{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"NodeNext\",\n    \"strict\": true,\n    \"declaration\": true,\n    \"outDir\": \"./dist\"\n  }\n}",
          concise: "{ \"extends\": \"@tsconfig/recommended\", \"compilerOptions\": { \"strict\": true } }",
        },
      },
      {
        id: "strict-mode",
        fn: "Strict Mode Flags",
        desc: "strict: true enables a bundle of checks — strictNullChecks, noImplicitAny, strictFunctionTypes, and more.",
        category: "Configuration & Build",
        subtitle: "What strict mode actually enables",
        signature: "\"strict\": true  (enables 8 sub-flags)",
        descLong: "strict: true is a shorthand that enables: strictNullChecks (null/undefined are their own types), noImplicitAny (parameters need explicit types), strictFunctionTypes (function parameter contravariance), strictBindCallApply, strictPropertyInitialization, strictNullChecks, noImplicitThis, and useUnknownInCatchVariables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Strict Mode Flags — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// strictNullChecks — null and undefined are separate types\nlet name: string = null; // Error with strictNullChecks\nlet name: string | null = null; // OK"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Strict Mode Flags — common patterns you'll see in production.\n// APPROACH  - Combine Strict Mode Flags with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// noImplicitAny — must annotate when TS can't infer\nfunction add(a, b) { return a + b; }       // Error\nfunction add(a: number, b: number) { ... } // OK\n// strictPropertyInitialization — must init in constructor\nclass User {\n  name: string; // Error — not assigned in constructor\n  constructor() {}\n}\nclass User {\n  name: string;\n  constructor() { this.name = ''; } // OK\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Strict Mode Flags — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// useUnknownInCatchVariables (TS 4.4+)\ntry { ... } catch (err) {\n  err.message; // Error — err is unknown\n  if (err instanceof Error) err.message; // OK\n}"
                  }
        ],
        tips: [
                  "Enable individual flags selectively when migrating a large codebase to strict mode.",
                  "strictNullChecks is the most impactful — enables the entire null-safety story.",
                  "noImplicitAny catches all implicit any parameters — the main typing discipline enforcer.",
                  "useUnknownInCatchVariables (in strict) makes catch variables unknown instead of any."
        ],
        mistake: "Disabling strictNullChecks to \"fix\" errors — this re-introduces the billion-dollar mistake of null pointer exceptions. Address the null cases properly.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet name: string = null; // error with strictNullChecks\nlet name: string | null = null; // ok\n// More explicit but longer",
          concise: "// strict: true enables all checks; individual flags are redundant",
        },
      },
      {
        id: "declaration-files",
        fn: ".d.ts Declaration Files",
        desc: "Type-only files that describe the shape of a module without any runtime code.",
        category: "Configuration & Build",
        subtitle: "Type definitions for JS code and modules",
        signature: "declare module \"pkg\" { export function fn(): void }",
        descLong: "Declaration files (.d.ts) describe the types of modules without containing runtime code. TypeScript ships with lib.*.d.ts for built-ins. @types/* packages provide community declarations for third-party libraries. You write them to type untyped JS, global variables, or to augment existing types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .d.ts Declaration Files — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// global.d.ts — declare global variables\ndeclare const __DEV__: boolean;\ndeclare const __VERSION__: string;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .d.ts Declaration Files — common patterns you'll see in production.\n// APPROACH  - Combine .d.ts Declaration Files with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Augment an existing module\n// types/express.d.ts\ndeclare module 'express' {\n  interface Request {\n    user?: { id: string; role: string };\n  }\n}\n// Type an untyped JS module\n// types/legacy-lib.d.ts\ndeclare module 'legacy-lib' {\n  export function compute(x: number): number;\n  export const VERSION: string;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .d.ts Declaration Files — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Ambient class declaration\ndeclare class EventEmitter {\n  on(event: string, listener: Function): this;\n  emit(event: string, ...args: any[]): boolean;\n}"
                  }
        ],
        tips: [
                  "Add @types/node, @types/react, etc. to devDependencies for type support.",
                  "Use declare global {} inside a module file (.ts) to add global declarations.",
                  "Set \"declaration\": true in tsconfig to auto-generate .d.ts from your TypeScript source.",
                  "typeRoots in tsconfig controls where TypeScript looks for @types packages."
        ],
        mistake: "Using declare module to override (not augment) a third-party module — your declaration replaces the original. Use interface merging inside declare module to add to it.",
        shorthand: {
          verbose: "declare global {\n  interface Window {\n    analytics: { track(event: string): void };\n  }\n}",
          concise: "// .d.ts files can augment globals without runtime code",
        },
      },
      {
        id: "path-aliases",
        fn: "Path Aliases",
        desc: "Map short import paths to directories using paths in tsconfig to avoid ../../ chains.",
        category: "Configuration & Build",
        subtitle: "Clean imports with path mapping",
        signature: "\"paths\": { \"@/*\": [\"./src/*\"] }",
        descLong: "Path aliases in tsconfig.json map import prefixes to directories. This eliminates deep relative imports like ../../../components/Button. Note: tsconfig paths only affect type checking — bundlers (Vite, webpack) and Node need separate configuration to resolve the same aliases at runtime.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Path Aliases — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"baseUrl\": \".\",\n    \"paths\": {\n      \"@/*\":          [\"./src/*\"],\n      \"@components/*\": [\"./src/components/*\"],\n      \"@lib/*\":       [\"./src/lib/*\"],\n      \"@types/*\":     [\"./src/types/*\"]\n    }\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Path Aliases — common patterns you'll see in production.\n// APPROACH  - Combine Path Aliases with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Before — relative hell\nimport { Button } from '../../../components/ui/Button';\nimport { db } from '../../../../lib/database';\n// After — clean aliases\nimport { Button } from '@components/ui/Button';\nimport { db } from '@lib/database';"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Path Aliases — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Vite also needs aliases (vite.config.ts)\nimport { resolve } from 'path';\nexport default {\n  resolve: { alias: { '@': resolve(__dirname, 'src') } }\n};"
                  }
        ],
        tips: [
                  "tsconfig paths alone don't work at runtime — configure your bundler/loader to match.",
                  "Next.js and Vite both support automatic path alias setup from tsconfig.",
                  "Use tsconfig-paths for Node.js runtime resolution without a bundler.",
                  "Keep alias prefixes short (@, ~, #) and distinct to avoid conflicts."
        ],
        mistake: "Setting up tsconfig paths and wondering why imports fail at runtime — tsconfig only covers the type checker. Add matching aliases to your bundler config too.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport { Button } from '../../../components/ui/Button';\nimport { db } from '../../../../lib/database';\n// More explicit but longer",
          concise: "import { Button } from '@components/ui/Button';\nimport { db } from '@lib/database'; // clean with path aliases",
        },
      },
      {
        id: "project-references",
        fn: "Project References",
        desc: "Split a large TypeScript codebase into composable sub-projects for faster incremental builds.",
        category: "Configuration & Build",
        subtitle: "Monorepo and multi-package builds",
        signature: "{ \"references\": [{ \"path\": \"../shared\" }], \"composite\": true }",
        descLong: "Project references (composite: true) let TypeScript understand dependencies between packages. tsc --build (tsbuild) builds only what changed. Each referenced project must have composite: true and declaration: true. Essential for monorepos — each package compiles independently and references siblings by their .d.ts output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Project References — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// packages/shared/tsconfig.json\n{\n  \"compilerOptions\": {\n    \"composite\": true,       // required for referenced projects\n    \"declaration\": true,     // emit .d.ts files\n    \"outDir\": \"./dist\"\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Project References — common patterns you'll see in production.\n// APPROACH  - Combine Project References with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// packages/api/tsconfig.json\n{\n  \"compilerOptions\": {\n    \"composite\": true,\n    \"outDir\": \"./dist\"\n  },\n  \"references\": [\n    { \"path\": \"../shared\" }  // depends on shared package\n  ]\n}\n// Root tsconfig.json (solution file)\n{\n  \"files\": [],               // no files at root\n  \"references\": [\n    { \"path\": \"./packages/shared\" },\n    { \"path\": \"./packages/api\" },\n    { \"path\": \"./packages/web\" }\n  ]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Project References — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Build all — only rebuilds changed packages\n// tsc --build\n// tsc --build --watch"
                  }
        ],
        tips: [
                  "tsc --build rebuilds only packages whose source or dependencies changed.",
                  "composite: true enforces that declaration: true and incremental: true are set.",
                  "Use --clean to delete all build outputs and start fresh.",
                  "IDE \"go to definition\" works across packages — references are transparent in editors."
        ],
        mistake: "Not setting composite: true in referenced packages — tsc --build will error because composite is required for a project to be referenced.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// packages/shared/tsconfig.json\n{ \"compilerOptions\": { \"composite\": true, \"declaration\": true }, ... }\n// More explicit but longer",
          concise: "// Use \"composite\": true to enable project references in monorepos",
        },
      },
      {
        id: "verbatim-module-syntax",
        fn: "verbatimModuleSyntax",
        desc: "Enforces explicit import type / export type for type-only imports, preventing runtime errors from erased imports.",
        category: "Configuration & Build",
        subtitle: "Explicit type-only imports",
        signature: "\"verbatimModuleSyntax\": true  →  import type { T } from ...",
        descLong: "verbatimModuleSyntax (TypeScript 5.0) replaces the older importsNotUsedAsValues and preserveValueImports flags. It requires that type-only imports use import type and type-only exports use export type. This prevents build tools from accidentally emitting imports for types that will be erased.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of verbatimModuleSyntax — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"verbatimModuleSyntax\": true\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of verbatimModuleSyntax — common patterns you'll see in production.\n// APPROACH  - Combine verbatimModuleSyntax with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// BAD — type import without 'type' keyword\nimport { User, createUser } from './user';   // Error if User is type-only\n// TypeScript forces: import type { User }\n// GOOD — explicit split\nimport type { User } from './user';          // type-only, erased at compile time\nimport { createUser } from './user';         // value import, kept in output"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of verbatimModuleSyntax — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Re-export types explicitly\nexport type { User } from './user';\nexport { createUser } from './user';\n// Inline type modifier\nimport { type User, createUser } from './user'; // mixed import"
                  }
        ],
        tips: [
                  "verbatimModuleSyntax replaces importsNotUsedAsValues: error in new projects.",
                  "import type is zero-cost at runtime — the import is completely erased.",
                  "Bundlers like Vite and esbuild work better with explicit type imports.",
                  "Use the inline type modifier for mixed imports: import { type A, b }."
        ],
        mistake: "Importing types without import type in a verbatimModuleSyntax project — TypeScript will error, and bundlers may fail because they're unsure if the import is a value.",
        shorthand: {
          verbose: "import { User, createUser } from './user'; // error if User is type-only\nimport type { User } from './user';\nimport { createUser } from './user'; // correct split",
          concise: "import type { User } from './user'; // explicit, zero-cost",
        },
      },
      {
        id: "type-check-ci",
        fn: "tsc --noEmit",
        desc: "Run the TypeScript type checker in CI without emitting output files — validate types without touching the build.",
        category: "Configuration & Build",
        subtitle: "Type-check only, no file output",
        signature: "tsc --noEmit  |  tsc --noEmit --watch",
        descLong: "tsc --noEmit runs the full type-checker but skips writing JavaScript and .d.ts files. Essential for CI pipelines where a bundler (Vite, esbuild, SWC) handles compilation — TypeScript is used only for types. Pair with --incremental for faster re-checks by caching the previous state.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of tsc --noEmit — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json scripts\n{\n  \"scripts\": {\n    \"typecheck\":       \"tsc --noEmit\",\n    \"typecheck:watch\": \"tsc --noEmit --watch\",\n    \"build\":           \"vite build\"     // Vite handles emit\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of tsc --noEmit — common patterns you'll see in production.\n// APPROACH  - Combine tsc --noEmit with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// CI pipeline (e.g., GitHub Actions)\n// - run: npm run typecheck\n// tsconfig.json — for type-check-only projects\n{\n  \"compilerOptions\": {\n    \"noEmit\": true,              // never emit files\n    \"incremental\": true,         // cache for faster re-checks\n    \"tsBuildInfoFile\": \".tsbuildinfo\"\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of tsc --noEmit — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Separate tsconfig for type checking vs building\n// tsconfig.json        — base config with noEmit\n// tsconfig.build.json  — extends base, adds emit options"
                  }
        ],
        tips: [
                  "Most modern setups use Vite/esbuild for fast builds + tsc --noEmit for type safety.",
                  "--incremental with .tsbuildinfo caches the type-check state — much faster in CI.",
                  "Run typecheck in parallel with unit tests in CI to minimize wall time.",
                  "skipLibCheck: true dramatically speeds up --noEmit runs in large projects."
        ],
        mistake: "Using tsc for both type checking and emitting in a Vite/webpack project — let the bundler emit and use tsc --noEmit for type validation only.",
        shorthand: {
          verbose: "// package.json scripts\n\"typecheck\": \"tsc --noEmit\",\n\"build\": \"vite build\",\n\"validate\": \"npm run typecheck && npm run test && npm run build\"",
          concise: "// Separate type-check from build for faster iteration",
        },
      },
      {
        id: "declaration-maps",
        fn: "Declaration Maps",
        desc: "Source maps for .d.ts files (declarationMap: true) — jump to original TypeScript source when hovering on types.",
        category: "Configuration & Build",
        subtitle: "Source map support for type definitions",
        signature: "\"declaration\": true, \"declarationMap\": true",
        descLong: "Declaration maps (.d.ts.map files) map compiled declaration files back to their source TypeScript. Enables IDE \"go to definition\" to jump to your .ts source instead of .d.ts. Essential for library authors — users of your library can navigate to the actual source code with proper context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Declaration Maps — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json (library project)\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"ESNext\",\n    \"declaration\": true,         // emit .d.ts files\n    \"declarationMap\": true,      // emit .d.ts.map files\n    \"sourceMap\": true,           // emit .js.map files\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\",\n    \"strict\": true\n  },\n  \"include\": [\"src/**/*\"]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Declaration Maps — common patterns you'll see in production.\n// APPROACH  - Combine Declaration Maps with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// src/utils.ts\nexport function parseDate(input: string): Date {\n  return new Date(input);\n}\nexport interface User {\n  id: string;\n  name: string;\n  createdAt: Date;\n}\n// Compiled output:\n// dist/utils.d.ts\n// dist/utils.d.ts.map\n// dist/utils.js\n// dist/utils.js.map"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Declaration Maps — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// When a consumer hovers on parseDate or User in their IDE,\n// \"go to definition\" jumps to src/utils.ts with proper context.\n// package.json (library)\n{\n  \"name\": \"my-lib\",\n  \"main\": \"./dist/utils.js\",\n  \"types\": \"./dist/utils.d.ts\",\n  \"typesVersions\": {\n    \">=4.2\": {\n      \"*\": [\"./dist/utils.d.ts\"]\n    }\n  }\n}"
                  }
        ],
        tips: [
                  "Declaration maps are zero runtime cost — they're only consumed by build tools and IDEs.",
                  "For published libraries, declaration maps improve IDE experience for consumers.",
                  "Combine with sourceMap: true for comprehensive debugging support.",
                  "Enable in any library that exports types — makes the source discoverable."
        ],
        mistake: "Omitting declaration maps on a public library — users can't navigate to source. Always enable both declaration and declarationMap for published types.",
        shorthand: {
          verbose: "// Manual / verbose approach\n{ \"compilerOptions\": { \"declaration\": true, \"declarationMap\": true, \"sourceMap\": true } }\n// More explicit but longer",
          concise: "// declarationMap enables \"go to definition\" for library consumers",
        },
      },
      {
        id: "monorepo-workspace",
        fn: "Monorepo Setup with Workspaces",
        desc: "Configure TypeScript in a monorepo with npm/yarn workspaces — shared tsconfig base and package references.",
        category: "Configuration & Build",
        subtitle: "Multi-package monorepo configuration",
        signature: "\"references\": [{ \"path\": \"../shared\" }]  +  npm workspaces",
        descLong: "Monorepos using npm workspaces and TypeScript project references enable independent type-checking and compilation for each package while sharing a base config. Each package has its own tsconfig.json referencing dependencies as relative paths. The root tsconfig uses \"references\" to define the build order.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Monorepo Setup with Workspaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Root package.json (monorepo)\n{\n  \"name\": \"monorepo\",\n  \"private\": true,\n  \"workspaces\": [\n    \"packages/*\"\n  ]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Monorepo Setup with Workspaces — common patterns you'll see in production.\n// APPROACH  - Combine Monorepo Setup with Workspaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Root tsconfig.json (base configuration)\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"ESNext\",\n    \"strict\": true,\n    \"declaration\": true,\n    \"sourceMap\": true,\n    \"skipLibCheck\": true\n  }\n}\n// Root tsconfig.json (solution file with references)\n{\n  \"files\": [],\n  \"references\": [\n    { \"path\": \"./packages/shared\" },\n    { \"path\": \"./packages/api\" },\n    { \"path\": \"./packages/web\" }\n  ]\n}\n// packages/shared/tsconfig.json\n{\n  \"extends\": \"../../tsconfig.json\",\n  \"compilerOptions\": {\n    \"composite\": true,\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\"\n  },\n  \"include\": [\"src/**/*\"]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Monorepo Setup with Workspaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// packages/api/tsconfig.json\n{\n  \"extends\": \"../../tsconfig.json\",\n  \"compilerOptions\": {\n    \"composite\": true,\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\"\n  },\n  \"references\": [\n    { \"path\": \"../shared\" }\n  ],\n  \"include\": [\"src/**/*\"]\n}\n// packages/web/tsconfig.json\n{\n  \"extends\": \"../../tsconfig.json\",\n  \"compilerOptions\": {\n    \"composite\": true,\n    \"outDir\": \"./dist\",\n    \"rootDir\": \"./src\",\n    \"jsx\": \"react-jsx\"\n  },\n  \"references\": [\n    { \"path\": \"../shared\" }\n  ],\n  \"include\": [\"src/**/*\"]\n}\n// Build commands\n// npm run build              (delegates to each package)\n// tsc --build               (builds all in dependency order)\n// tsc --build --watch       (watches all packages)\n// tsc --build packages/api  (builds only api and dependencies)"
                  }
        ],
        tips: [
                  "Root tsconfig with \"files\": [] and \"references\" is a solution file — not itself compiled.",
                  "Each package extends the root config — reduces duplication.",
                  "composite: true in each package enables project references.",
                  "tsc --build understands the dependency graph and incremental builds efficiently."
        ],
        mistake: "Forgetting composite: true in a referenced package — tsc --build will fail because project references require composite.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Root tsconfig.json\n{ \"files\": [], \"references\": [{ \"path\": \"./packages/shared\" }, ...] }\n// More explicit but longer",
          concise: "// Monorepos use root solution file + composite in each package",
        },
      },
      {
        id: "type-checking-ci",
        fn: "Type Checking in CI",
        desc: "Run tsc --noEmit in CI pipelines to validate types separately from the build step.",
        category: "Configuration & Build",
        subtitle: "Fast parallel type validation",
        signature: "\"typecheck\": \"tsc --noEmit --incremental\"",
        descLong: "Modern setups separate type checking (tsc) from compilation (Vite/esbuild). tsc --noEmit validates types without emitting files. Using --incremental with a .tsbuildinfo cache makes repeated type-checks fast. Run in CI in parallel with unit tests for comprehensive validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Checking in CI — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// package.json\n{\n  \"scripts\": {\n    \"typecheck\":       \"tsc --noEmit\",\n    \"typecheck:watch\": \"tsc --noEmit --watch\",\n    \"build\":           \"vite build\",\n    \"test\":            \"vitest\",\n    \"lint\":            \"eslint src\",\n    \"validate\":        \"npm run typecheck && npm run lint && npm run test\"\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Checking in CI — common patterns you'll see in production.\n// APPROACH  - Combine Type Checking in CI with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// tsconfig.json (for type-checking only)\n{\n  \"compilerOptions\": {\n    \"target\": \"ES2022\",\n    \"module\": \"ESNext\",\n    \"lib\": [\"ES2022\", \"DOM\"],\n    \"strict\": true,\n    \"noEmit\": true,              // don't emit files\n    \"incremental\": true,         // cache for speed\n    \"tsBuildInfoFile\": \".tsbuildinfo\",\n    \"skipLibCheck\": true,        // skip node_modules validation\n    \"isolatedModules\": true      // ensure each file is independent\n  }\n}\n// GitHub Actions CI example\nname: CI\non: [push, pull_request]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Checking in CI — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 20 }\n      - run: npm ci\n      - run: npm run typecheck  # Fast — no build needed\n      - run: npm run lint\n      - run: npm run test\n      - run: npm run build      # Build in parallel would be faster\n// VS Code settings.json\n{\n  \"[typescript]\": {\n    \"editor.formatOnSave\": true,\n    \"editor.defaultFormatter\": \"esbenp.prettier-vscode\"\n  },\n  \"typescript.tsserver.experimental.enableProjectDiagnostics\": true,\n  \"typescript.enablePromptUseWorkspaceTsdk\": true\n}"
                  }
        ],
        tips: [
                  "tsc --noEmit + --incremental is fast — use in local dev too (npm run typecheck:watch).",
                  "skipLibCheck: true dramatically speeds up type-checking large projects.",
                  "isolatedModules: true ensures each file stands alone — better for transpilers.",
                  "Run typecheck in CI in parallel with tests to minimize total pipeline time."
        ],
        mistake: "Using tsc for both type-checking and compiling — separate the concerns. Use tsc --noEmit for types, let Vite/esbuild handle compilation.",
        shorthand: {
          verbose: "// CI pipeline\nrun: npm run typecheck  # fast, no emit\nrun: npm run lint\nrun: npm run test\nrun: npm run build      # vite handles compilation",
          concise: "// Run tsc --noEmit + tests in parallel before build",
        },
      },
    ],
  },
]

export default { meta, sections }
