export const meta = {
  "title": "Declarations & Module Patterns",
  "domain": "typescript",
  "sheet": "declarations",
  "icon": "📘"
}

export const sections = [

  // ── Section 1: Declaration Files & Ambient Types ─────────────────────────────────────────
  {
    id: "declaration-files",
    title: "Declaration Files & Ambient Types",
    entries: [
      {
        id: "dts-fundamentals",
        fn: "Declaration Files (.d.ts) — Type Definitions for JS Libraries",
        desc: "Write .d.ts files to add TypeScript types to JavaScript libraries, global variables, and third-party modules.",
        category: "Declarations",
        subtitle: "declare module, declare global, declare namespace, .d.ts",
        signature: "declare module \"lib\" { }  |  declare global { }  |  declare function fn(): void",
        descLong: "Declaration files (.d.ts) describe the shape of JavaScript code without providing implementations. They tell TypeScript the types of external libraries, global variables, and modules. DefinitelyTyped (@types/*) packages are community-maintained .d.ts files. When no @types package exists, write your own. declare module creates types for a module. declare global adds to the global scope. Triple-slash directives reference other declaration files.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Declaration Files (.d.ts) — Type Definitions for JS Libraries — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Create: types/analytics.d.ts\ndeclare module \"analytics\" {\n  interface AnalyticsConfig {\n    apiKey: string;\n    debug?: boolean;\n    endpoint?: string;\n  }\n  interface Event {\n    name: string;\n    properties?: Record<string, unknown>;\n    timestamp?: Date;\n  }\n  export function init(config: AnalyticsConfig): void;\n  export function track(event: string, props?: Record<string, unknown>): void;\n  export function identify(userId: string, traits?: Record<string, unknown>): void;\n  export function page(name?: string): void;\n  // Default export\n  const analytics: {\n    init: typeof init;\n    track: typeof track;\n    identify: typeof identify;\n    page: typeof page;\n  };\n  export default analytics;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Declaration Files (.d.ts) — Type Definitions for JS Libraries — common patterns you'll see in production.\n// APPROACH  - Combine Declaration Files (.d.ts) — Type Definitions for JS Libraries with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// globals.d.ts\ndeclare global {\n  // Window extensions\n  interface Window {\n    __APP_VERSION__: string;\n    gtag: (...args: unknown[]) => void;\n    dataLayer: Record<string, unknown>[];\n  }\n  // Global constants (injected by bundler)\n  const __DEV__: boolean;\n  const __API_URL__: string;\n  const __BUILD_TIME__: string;\n  // Extend existing global types\n  interface Array<T> {\n    customShuffle(): T[];\n  }\n}\n// Must export something to make this a module\nexport {};\n// For libraries that add to a global namespace\ndeclare namespace NodeJS {\n  interface ProcessEnv {\n    NODE_ENV: \"development\" | \"production\" | \"test\";\n    DATABASE_URL: string;\n    API_KEY: string;\n    PORT?: string;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Declaration Files (.d.ts) — Type Definitions for JS Libraries — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// css-modules.d.ts\ndeclare module \"*.module.css\" {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}\ndeclare module \"*.module.scss\" {\n  const classes: { readonly [key: string]: string };\n  export default classes;\n}\ndeclare module \"*.svg\" {\n  const content: React.FC<React.SVGProps<SVGSVGElement>>;\n  export default content;\n}\ndeclare module \"*.png\" {\n  const src: string;\n  export default src;\n}\ndeclare module \"*.json\" {\n  const value: unknown;\n  export default value;\n}"
                  }
        ],
        tips: [
                  "Check DefinitelyTyped first (@types/library-name) before writing your own .d.ts — most popular libraries are already typed.",
                  "declare global must be inside a module (file with import/export) — add export {} at the end if needed.",
                  "Use unknown instead of any in declaration files — it forces consumers to narrow types safely.",
                  "Put custom .d.ts files in a types/ directory and add it to tsconfig.json: \"typeRoots\": [\"./types\", \"./node_modules/@types\"]."
        ],
        mistake: "Using declare module without quotes (declare module MyLib) — this creates an ambient namespace, not a module declaration. Use declare module \"my-lib\" with quotes for npm packages.",
        shorthand: {
          verbose: "// Wrong: ambient namespace\ndeclare module MyLib { }\n\n// Should add to globals.d.ts then use",
          concise: "declare module \"lib-name\" { export function fn(): void; } for npm packages; declare global { interface Window { ... } }",
        },
      },
      {
        id: "module-augmentation",
        fn: "Module Augmentation & Declaration Merging",
        desc: "Extend existing library types without modifying source — add properties, methods, and interfaces to third-party modules.",
        category: "Declarations",
        subtitle: "declare module, interface merging, augmentation, extension",
        signature: "declare module \"express\" { interface Request { user?: User } }",
        descLong: "Module augmentation extends existing module types by re-declaring the module and adding to its interfaces. Declaration merging combines multiple declarations of the same name — interfaces merge automatically, namespaces merge with classes/functions. This is how you add custom properties to Express Request, extend Prisma Client, or add fields to third-party types without forking the library.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Module Augmentation & Declaration Merging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// types/express.d.ts\nimport { User } from \"../src/models/user\";\ndeclare module \"express-serve-static-core\" {\n  interface Request {\n    user?: User;\n    requestId: string;\n    startTime: number;\n  }\n  interface Response {\n    success(data: unknown): void;\n    error(message: string, status?: number): void;\n  }\n}\n// Now TypeScript knows about req.user, req.requestId\n// app.get(\"/profile\", (req, res) => {\n//   const user = req.user;  // typed as User | undefined\n// });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Module Augmentation & Declaration Merging — common patterns you'll see in production.\n// APPROACH  - Combine Module Augmentation & Declaration Merging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Extend MUI theme with custom colors\ndeclare module \"@mui/material/styles\" {\n  interface Palette {\n    neutral: Palette[\"primary\"];\n    gradient: {\n      primary: string;\n      secondary: string;\n    };\n  }\n  interface PaletteOptions {\n    neutral?: PaletteOptions[\"primary\"];\n    gradient?: {\n      primary: string;\n      secondary: string;\n    };\n  }\n}\n// Interfaces with the same name in the same scope merge\ninterface Config {\n  apiUrl: string;\n}\ninterface Config {\n  timeout: number;\n  retries: number;\n}\n// Resulting type:\n// interface Config {\n//   apiUrl: string;\n//   timeout: number;\n//   retries: number;\n// }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Module Augmentation & Declaration Merging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass Validator {\n  validate(input: string): boolean {\n    return Validator.patterns.email.test(input);\n  }\n}\nnamespace Validator {\n  export const patterns = {\n    email: /^[^@]+@[^@]+\\.[^@]+$/,\n    url: /^https?:\\/\\//,\n    phone: /^\\+?[\\d\\s-]+$/,\n  };\n  export type Result = {\n    valid: boolean;\n    errors: string[];\n  };\n}\n// Use: Validator.patterns.email  (namespace)\n// Use: new Validator().validate() (class)\n// Extend a library's type union\ndeclare module \"some-lib\" {\n  interface EventMap {\n    \"custom:event\": { detail: string };\n    \"custom:analytics\": { action: string; label: string };\n  }\n}"
                  }
        ],
        tips: [
                  "Module augmentation must import the original module — TypeScript needs to see the original types to merge with them.",
                  "Interfaces merge automatically, but type aliases do NOT — use interfaces when you need third-party extensibility.",
                  "Namespace + class merging lets you add static properties and types to a class — a powerful pattern for libraries.",
                  "Always put augmentations in .d.ts files, not .ts files — augmentations in .ts files can cause unexpected bundling issues."
        ],
        mistake: "Using type instead of interface for types that need augmentation — type aliases are closed (cannot be extended by consumers). Use interface when you want users to add properties via declaration merging.",
        shorthand: {
          verbose: "// type doesn't merge\ntype Config = { debug: boolean };\ndeclare module \"lib\" {\n  type Config = Config & { extra: string }; // doesn't merge\n}",
          concise: "interface IConfig { debug: boolean; }; declare module \"lib\" { interface IConfig { extra: string; } } for declaration merging",
        },
      },
      {
        id: "declaration-merging",
        fn: "Declaration Merging Patterns",
        desc: "Multiple interface declarations merge — namespace merging, class merging, function overloads.",
        category: "Declarations",
        subtitle: "Interface + interface, namespace + class, function overloads",
        signature: "interface X { a: T } interface X { b: U } results in { a: T; b: U }",
        descLong: "Declaration merging combines multiple declarations of the same name. Interfaces with the same name automatically merge their members. Namespaces can merge with classes/functions to add static properties. Function declarations can be overloaded. This is powerful for adding features without mutating the original declaration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Declaration Merging Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface Window {\n  myGlobal: string;\n}\ninterface Window {\n  myOtherGlobal: number;\n}\n// Merged into: { myGlobal: string; myOtherGlobal: number }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Declaration Merging Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Declaration Merging Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass Animal {\n  name: string;\n  constructor(name: string) {\n    this.name = name;\n  }\n}\nnamespace Animal {\n  export const species = 'unknown';\n  export const create = (name: string) => new Animal(name);\n}\n// Use: new Animal('dog')\n// Use: Animal.species\n// Use: Animal.create('cat')\nnamespace MyLib {\n  export interface Config {\n    debug: boolean;\n  }\n}\nnamespace MyLib {\n  export interface Config {\n    verbose?: boolean;\n  }\n  export function init(config: Config) {\n    // merged config has both debug and verbose\n  }\n}\nfunction createElement(tag: string): HTMLElement;\nfunction createElement(tag: string, props: Record<string, any>): HTMLElement;\nfunction createElement(tag: string, props?: Record<string, any>): HTMLElement {\n  const el = document.createElement(tag);\n  if (props) {\n    Object.assign(el, props);\n  }\n  return el;\n}\n// Can be called as:\n// createElement('div')\n// createElement('div', { class: 'active' })"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Declaration Merging Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// TypeScript's Array interface is extended by globals.d.ts\ninterface Array<T> {\n  customMethod(): T[];\n}\n// Now all arrays have customMethod()\n[1, 2, 3].customMethod();\n// file1.d.ts\nexport interface User {\n  id: string;\n  name: string;\n}\n// file2.d.ts\nimport \"./file1\";\ndeclare global {\n  interface User {\n    email: string;\n  }\n}\n// User now has id, name, email (from both files)"
                  }
        ],
        tips: [
                  "Interfaces merge by combining all members — no conflicts allowed for different types.",
                  "Classes can merge with namespaces to add static members.",
                  "Function overloads use multiple signatures before one implementation.",
                  "Only interfaces and namespaces merge — type aliases, classes (partially) do not."
        ],
        mistake: "Attempting to merge conflicting member types — if two interfaces declare the same key with different types, TypeScript errors. Ensure merged declarations are compatible.",
        shorthand: {
          verbose: "// Manual / verbose approach\ninterface X { a: string }; interface X { b: number }; // merged\n// More explicit but longer",
          concise: "Interfaces merge members; namespaces merge with classes for static members",
        },
      },
      {
        id: "global-augmentation",
        fn: "Global Augmentation with declare global",
        desc: "Augment the global scope from within modules — add to Window, Array, Object, process.env, etc.",
        category: "Declarations",
        subtitle: "declare global { } for modifying globals in modules",
        signature: "declare global { interface Window { custom: string } }",
        descLong: "The declare global block lets you extend global types from within a module file. You can augment Window, Array, Object, NodeJS.ProcessEnv, and custom global variables. This is how you type-safe globals injected by build tools or libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Global Augmentation with declare global — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// globals.d.ts\ndeclare global {\n  // Window properties (browser)\n  interface Window {\n    __DEV__: boolean;\n    __API_URL__: string;\n    gtag: (event: string, data?: Record<string, any>) => void;\n    analytics: {\n      track(event: string): void;\n      identify(id: string): void;\n    };\n  }\n  // Process environment (Node.js)\n  namespace NodeJS {\n    interface ProcessEnv {\n      NODE_ENV: 'development' | 'production' | 'test';\n      DATABASE_URL: string;\n      API_TOKEN: string;\n      LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';\n    }\n  }\n  // Global variables\n  const APP_VERSION: string;\n  const BUILD_TIME: number;\n  function globalHelper(x: number): string;\n  // Extend Array\n  interface Array<T> {\n    shuffle(): T[];\n    chunk(size: number): T[][];\n  }\n  // Extend Object\n  interface Object {\n    deepFreeze<T>(obj: T): Readonly<T>;\n  }\n  // Custom namespace\n  namespace CustomAPI {\n    interface Config {\n      apiKey: string;\n    }\n    function init(config: Config): void;\n  }\n}\n// Must export something to make this a module\nexport {};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Global Augmentation with declare global — common patterns you'll see in production.\n// APPROACH  - Combine Global Augmentation with declare global with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Now you can use:\n// window.__DEV__\n// process.env.DATABASE_URL\n// APP_VERSION"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Global Augmentation with declare global — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// globalHelper(5)\n// [1, 2, 3].shuffle()\n// Object.deepFreeze(obj)\n// CustomAPI.init({ apiKey: '...' })"
                  }
        ],
        tips: [
                  "declare global must be inside a module (has import/export) — add export {} if needed.",
                  "Global augmentations are merged with the actual global types — they add, not replace.",
                  "Useful for types injected by build tools (vite, webpack) or CDN scripts.",
                  "Be specific about types — avoid any in globals to prevent type safety leaks."
        ],
        mistake: "Putting declare global at the top level outside a module — it must be in a file with exports. Add export {} if your file doesn't export anything.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndeclare global { interface Window { custom: string } }\nexport {};\n// More explicit but longer",
          concise: "declare global { } in modules to extend Window, Array, process.env, etc.",
        },
      },
      {
        id: "ambient-modules",
        fn: "Ambient Module Declarations (Wildcard Declarations)",
        desc: "Declare types for assets — *.svg, *.css, *.json, wildcard module patterns.",
        category: "Declarations",
        subtitle: "declare module \"*.ext\" for static imports",
        signature: "declare module \"*.svg\" { const content: string; export default content; }",
        descLong: "Ambient module declarations let you declare types for non-JavaScript imports. Common for CSS modules, images, JSON, WASM, and other assets. When your bundler supports importing these files (Webpack, Vite), you declare what TypeScript should expect when importing them.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Ambient Module Declarations (Wildcard Declarations) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// SVG as React component\ndeclare module \"*.svg\" {\n  const content: React.FC<React.SVGProps<SVGSVGElement>>;\n  export default content;\n}\nimport Logo from \"./logo.svg\";\n<Logo width={100} />;  // typed\n// SVG as URL string\ndeclare module \"*.svg\" {\n  const content: string;\n  export default content;\n}\nimport LogoUrl from \"./logo.svg\";\n// LogoUrl is a string URL"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Ambient Module Declarations (Wildcard Declarations) — common patterns you'll see in production.\n// APPROACH  - Combine Ambient Module Declarations (Wildcard Declarations) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndeclare module \"*.png\" {\n  const src: string;\n  export default src;\n}\ndeclare module \"*.jpg\" {\n  const src: string;\n  export default src;\n}\ndeclare module \"*.gif\" {\n  const src: string;\n  export default src;\n}\nimport heroImage from \"./hero.png\";\n// heroImage is string URL\ndeclare module \"*.module.css\" {\n  const classes: {\n    readonly [key: string]: string;\n  };\n  export default classes;\n}\ndeclare module \"*.module.scss\" {\n  const classes: {\n    readonly [key: string]: string;\n  };\n  export default classes;\n}\nimport styles from \"./App.module.css\";\n// styles.container, styles.button, etc. are typed\ndeclare module \"*.json\" {\n  const content: unknown;\n  export default content;\n}\nimport config from \"./config.json\";\n// config is typed as unknown (you cast it)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Ambient Module Declarations (Wildcard Declarations) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ndeclare module \"*.wasm\" {\n  const wasmModule: WebAssembly.Module;\n  export default wasmModule;\n}\ndeclare module \"*.txt\" {\n  const content: string;\n  export default content;\n}\ndeclare module \"*.md\" {\n  const content: string;\n  export default content;\n}\nimport readmeText from \"./README.md\";\ndeclare module \"*.template.html\" {\n  const template: string;\n  export default template;\n}\ndeclare module \"!raw-loader!*\" {\n  const content: string;\n  export default content;\n}\n// Import with loader prefix (Webpack syntax)\nimport raw from \"!raw-loader!./data.txt\";"
                  }
        ],
        tips: [
                  "Wildcard declarations match imports ending with the pattern — *.svg matches any .svg file.",
                  "Use readonly for CSS module class names to prevent accidental mutations.",
                  "Different bundlers (Vite, Webpack, esbuild) support different assets — check your config.",
                  "You can declare multiple overlapping patterns — more specific patterns take precedence."
        ],
        mistake: "Forgetting to declare all asset types your bundler imports — this causes \"Cannot find module\" errors. Check your bundler config for supported loaders.",
        shorthand: {
          verbose: "// Manual / verbose approach\ndeclare module \"*.svg\" { const content: React.FC<React.SVGProps<SVGSVGElement>>; export default content; }\n// More explicit but longer",
          concise: "declare module \"*.ext\" for assets; wildcard patterns for bundler imports",
        },
      },
      {
        id: "triple-slash",
        fn: "Triple-Slash Directives",
        desc: "Use /// <reference types=\"...\" /> to reference other declaration files and type definitions.",
        category: "Declarations",
        subtitle: "/// <reference types, path, lib directives",
        signature: "/// <reference types=\"node\" />  ///  <reference path=\"./other.d.ts\" />",
        descLong: "Triple-slash directives are special comments that tell TypeScript to load type definitions or reference other files. They must appear at the top of a file. Common directives: types (load @types packages), path (reference .d.ts files), lib (include DOM or ES types). Mostly used in .d.ts files and older projects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Triple-Slash Directives — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n/// <reference types=\"node\" />\n// Now NodeJS, process, Buffer are available globally"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Triple-Slash Directives — common patterns you'll see in production.\n// APPROACH  - Combine Triple-Slash Directives with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n/// <reference path=\"./types/custom.d.ts\" />\n// Types from custom.d.ts are now available\n/// <reference lib=\"dom\" />\n/// <reference lib=\"es2020\" />\n// Document, Window, Promise, etc. are available\n// types/globals.d.ts\n/// <reference types=\"node\" />\n/// <reference types=\"react\" />\n/// <reference types=\"react-dom\" />\ndeclare global {\n  interface Window {\n    __DEV__: boolean;\n  }\n  namespace NodeJS {\n    interface ProcessEnv {\n      REACT_APP_API_URL: string;\n    }\n  }\n}\nexport {};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Triple-Slash Directives — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n/// <reference types=\"jest\" />\n/// <reference path=\"./test-helpers.d.ts\" />\n/// <reference lib=\"dom\" />\ndescribe('myTest', () => {\n  test('should work', () => {\n    expect(true).toBe(true);\n  });\n});\n// package.json\n{\n  \"typings\": \"dist/index.d.ts\"\n}\n// dist/index.d.ts\n/// <reference types=\"node\" />\nexport function myFunc(): void;\nexport interface MyInterface { }\n// consumers automatically get these types"
                  }
        ],
        tips: [
                  "Triple-slash directives must be the first lines in a file (only preceding comments allowed).",
                  "Use tsconfig.json \"types\" field instead of /// <reference types for most cases — it's clearer.",
                  "/// <reference path is rarely needed with modern bundlers — use imports instead.",
                  "lib directives are useful when you need to opt-in to specific TypeScript libs."
        ],
        mistake: "Putting triple-slash directives after regular code — they must be at the very top. The first non-comment line ends the triple-slash section.",
        shorthand: {
          verbose: "/// <reference types=\"node\" />\n/// <reference path=\"./other.d.ts\" />\n/// <reference lib=\"dom\" />",
          concise: "Triple-slash directives load type packages and reference .d.ts files; must be at top",
        },
      },
      {
        id: "dts-authoring",
        fn: "Authoring Declaration Files (.d.ts)",
        desc: "Writing .d.ts files — declare function, declare class, declare namespace, export syntax.",
        category: "Declarations",
        subtitle: "Creating types for untyped JavaScript code",
        signature: "declare function fn(x: T): U; declare class MyClass { }",
        descLong: "Declaration files are TypeScript-only files that describe the shape of JavaScript code without implementation. They use declare keywords to tell TypeScript about external libraries. You can declare functions, classes, namespaces, interfaces, types, and variables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Authoring Declaration Files (.d.ts) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// types/untyped-lib.d.ts\n// Declare a simple function\ndeclare function greet(name: string): string;\n// Declare multiple overloads\ndeclare function process(input: string): string;\ndeclare function process(input: number[]): number;\ndeclare function process(input: any): any;\n// Declare a class\ndeclare class APIClient {\n  constructor(apiKey: string);\n  get(url: string): Promise<unknown>;\n  post(url: string, data: unknown): Promise<unknown>;\n  private apiKey: string;\n}\n// Declare a namespace with nested members\ndeclare namespace Logger {\n  interface LogOptions {\n    timestamp?: boolean;\n    level?: 'info' | 'warn' | 'error';\n  }\n  function log(message: string, options?: LogOptions): void;\n  function info(message: string): void;\n  function warn(message: string): void;\n  function error(message: string, error?: Error): void;\n  const version: string;\n}\n// Declare interfaces and types\ndeclare interface User {\n  id: string;\n  name: string;\n  email: string;\n}\ndeclare type UserRole = 'admin' | 'user' | 'guest';\n// Declare variables\ndeclare const API_URL: string;\ndeclare const DATABASE_URL: string;\n// Declare modules (for when the lib is a module)\ndeclare module 'my-lib' {\n  export function getData(): Promise<unknown>;\n  export interface Config {\n    apiKey: string;\n    debug?: boolean;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Authoring Declaration Files (.d.ts) — common patterns you'll see in production.\n// APPROACH  - Combine Authoring Declaration Files (.d.ts) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Now you can import and use these declarations:\nconst greeting = greet('Alice');  // OK\nconst result = process([1, 2, 3]); // OK\nconst client = new APIClient('key123');\nconst response = await client.get('/api/users');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Authoring Declaration Files (.d.ts) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nLogger.log('Starting app', { level: 'info' });\nLogger.warn('This is a warning');\nconst user: User = { id: '1', name: 'Bob', email: 'bob@example.com' };\nconst role: UserRole = 'admin';"
                  }
        ],
        tips: [
                  "Use declare for all top-level definitions — declare function, declare class, declare namespace.",
                  "Interfaces and types don't need declare keyword — they're type-only.",
                  "You can use implement in .ts files to implement interfaces declared in .d.ts.",
                  "For module .d.ts files, use declare module \"name\" and export statements."
        ],
        mistake: "Including implementation in .d.ts files — declaration files are types-only. Never use `function foo() { ... }` — always use `declare function foo(...): ReturnType;`",
        shorthand: {
          verbose: "declare function myFunc(x: string): number;\ndeclare class MyClass { constructor(name: string); }\ndeclare namespace MyNamespace { }",
          concise: "Use declare keywords for functions, classes, namespaces; no implementations in .d.ts",
        },
      },
      {
        id: "type-only-imports",
        fn: "Type-Only Imports and Exports",
        desc: "Use import type { } and export type { } for bundler clarity — marks imports as type-only.",
        category: "Declarations",
        subtitle: "Distinguish types from values for tree-shaking",
        signature: "import type { TypeName } from \"module\"",
        descLong: "Type-only imports explicitly tell TypeScript and bundlers that an import is used only for types, never at runtime. This allows bundlers to safely remove the import and improves tree-shaking. Introduced in TS 3.8. Very useful in declaration files and when you want to re-export types without importing the value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type-Only Imports and Exports — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nimport type { User, Role } from \"./types\";\n// User and Role are only used in type positions\ninterface Admin extends User {\n  role: Role;\n}\n// Bundler knows to not import these at runtime"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type-Only Imports and Exports — common patterns you'll see in production.\n// APPROACH  - Combine Type-Only Imports and Exports with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nimport { formatDate } from \"./utils\"; // value\nimport type { FormattedDate } from \"./types\"; // type only\nconst formatted: FormattedDate = formatDate(new Date());\n// types/index.ts\nexport type { User, Role, Permission } from \"./auth\";\nexport type { ApiResponse, ApiError } from \"./api\";\n// Only types are exported, no values\nimport type { Database } from \"database-lib\";\n// Export without actually importing the runtime value\nexport type { Database };\ninterface AppContext {\n  db: Database;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type-Only Imports and Exports — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// service.ts\nimport type { User } from \"./types\"; // breaks circular import\nexport function getUser(id: string): User {\n  return { id, name: 'Unknown' };\n}\n// types.ts\nimport type { getUser } from \"./service\"; // only for types\ntype Service = typeof getUser;\nimport type { ComponentProps } from \"react\";\nexport interface ButtonProps extends ComponentProps<\"button\"> {\n  variant?: \"primary\" | \"secondary\";\n}\n// dist/index.d.ts\nexport type { User, Admin, Role } from \"./types\";\nexport { UserService } from \"./services\"; // value export\n// Consumers get types without runtime overhead"
                  }
        ],
        tips: [
                  "Use import type when the import is never used as a runtime value.",
                  "Bundlers (Webpack, esbuild, tsconfig isolatedModules) remove type-only imports automatically.",
                  "Mixing import type and regular imports in one line is not allowed — use separate statements.",
                  "TypeScript strict mode enables isolatedModules which flags unused imports — use import type to silence."
        ],
        mistake: "Using import type for something that's accessed at runtime — type-only imports are completely erased. If you need the value, use regular import.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport type { TypeName } from \"module\";\nimport { ValueName } from \"module\";\n// More explicit but longer",
          concise: "import type for types only; regular import for runtime values; helps tree-shaking",
        },
      },
      {
        id: "verbatim-module-syntax",
        fn: "Verbatim Module Syntax (tsconfig option)",
        desc: "verbatimModuleSyntax in tsconfig — enforces import/export syntax for clarity.",
        category: "Declarations",
        subtitle: "Strict module syntax control in declaration files",
        signature: "\"verbatimModuleSyntax\": true in compilerOptions",
        descLong: "The verbatimModuleSyntax compiler option (TS 5.0+) enforces stricter rules for imports and exports. When enabled, import/export must match the actual syntax — no auto-conversion between CommonJS and ESM. Forces explicit import type usage. Useful for library authors ensuring their declaration files are correct.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Verbatim Module Syntax (tsconfig option) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"verbatimModuleSyntax\": true\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Verbatim Module Syntax (tsconfig option) — common patterns you'll see in production.\n// APPROACH  - Combine Verbatim Module Syntax (tsconfig option) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// ✓ Correct: explicit type import\nimport type { User } from \"./types\";\n// ✓ Correct: regular import for value\nimport { getUser } from \"./service\";\n// ✗ Error: missing type keyword\nimport { User } from \"./types\";\n// Now User is used only in type position, TypeScript requires 'type'\n// index.d.ts\nexport type { User, Admin } from \"./types\"; // explicit type export\nexport { UserService } from \"./services\";  // value export\n// Consumers see clear distinction between types and values\n// CommonJS-style requires (still errors in strict mode)\n// const User = require(\"./types\");  // Error: not allowed\n// Must use ES module syntax\nimport type { User } from \"./types\"; // OK"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Verbatim Module Syntax (tsconfig option) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// A library that exports both\nexport type { APIOptions, ResponseType } from \"./api\";\nexport { APIClient } from \"./api\";\nexport { createClient } from \"./client\";\n// Users must use import type for types, regular import for values\n// Before: ambiguous\nexport interface Config { debug: boolean }\nexport const DEFAULT_CONFIG: Config = { debug: false };\n// After: clear\nexport type { Config };\nexport const DEFAULT_CONFIG: Config = { debug: false };\n// With verbatimModuleSyntax, the second form is required"
                  }
        ],
        tips: [
                  "verbatimModuleSyntax is great for library authors — ensures declaration files are precise.",
                  "When enabled, all type imports must use import type — no exceptions.",
                  "This option helps catch bugs where types are accidentally used at runtime.",
                  "Works best with strict: true and other strict compiler options."
        ],
        mistake: "Using import X from \"module\" when X is only used in type position — with verbatimModuleSyntax, you must use import type.",
        shorthand: {
          verbose: "// Manual / verbose approach\n\"verbatimModuleSyntax\": true enforces explicit import type for types-only\n// More explicit but longer",
          concise: "Enable for strict module syntax; library authors should use this",
        },
      },
      {
        id: "declare-const-enum",
        fn: "Const Enums in Declaration Files",
        desc: "const enum vs regular enum — inlining, restrictions in .d.ts files.",
        category: "Declarations",
        subtitle: "When to use const enums, .d.ts limitations",
        signature: "const enum Status { Active = \"active\", Inactive = \"inactive\" }",
        descLong: "Const enums are inlined at compile time (members replaced with their literal values). This reduces bundle size but loses the enum object at runtime. Declaration files have restrictions on const enums — consumers must use isolatedModules or they break. Understanding when to use const enum vs regular enum is important for library design.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Const Enums in Declaration Files — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nenum Status {\n  Active = \"active\",\n  Inactive = \"inactive\",\n  Pending = \"pending\"\n}\n// Compiles to runtime object:\n// var Status = { Active: \"active\", Inactive: \"inactive\", ... }\n// Can be imported and used at runtime\nimport { Status } from \"./enums\";\nconst current: Status = Status.Active;\nconsole.log(Status); // { Active: \"active\", ... }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Const Enums in Declaration Files — common patterns you'll see in production.\n// APPROACH  - Combine Const Enums in Declaration Files with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst enum Role {\n  Admin = \"admin\",\n  User = \"user\",\n  Guest = \"guest\"\n}\n// Compiles to literals (enum object erased):\nconst userRole: Role = \"user\"; // directly \"user\", not Role.User\n// Cannot access at runtime\n// Role.Admin; // Error: Role doesn't exist at runtime\n// types/status.d.ts\nexport const enum Color {\n  Red = \"red\",\n  Green = \"green\",\n  Blue = \"blue\"\n}\n// Consumer code must have isolatedModules or proper compilation:\n// ✓ OK in type position\nconst bgColor: Color = Color.Red;\n// ✗ Breaks without proper build config\n// console.log(Color.Red); // Runtime reference fails"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Const Enums in Declaration Files — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Use regular enum if:\n// - Users need the object at runtime\n// - You want to iterate over members\n// - You're not size-conscious\nenum HttpStatus {\n  Ok = 200,\n  Created = 201,\n  BadRequest = 400,\n  Unauthorized = 401\n}\n// Loop over status codes\nObject.values(HttpStatus).forEach(code => console.log(code));\n// Use const enum if:\n// - Only used in type positions\n// - Bundle size is critical\n// - You control the build pipeline\nconst enum Permission {\n  Read = \"read\",\n  Write = \"write\",\n  Delete = \"delete\"\n}\nfunction checkPermission(perm: Permission) {\n  // Permission inlined: effectively (perm: \"read\" | \"write\" | \"delete\")\n  return true;\n}\n// Avoid const enum in published .d.ts unless you document it clearly\n// Regular enum is safer for library authors\nexport enum ApiMethod {\n  GET = \"GET\",\n  POST = \"POST\",\n  PUT = \"PUT\"\n}\n// If you must use const enum, document it:\n/**\n * @remarks Const enum — inlined by TypeScript\n * Ensure your build uses TypeScript for compilation or esbuild with tsconfig\n */\nexport const enum Environment {\n  Dev = \"development\",\n  Prod = \"production\"\n}"
                  }
        ],
        tips: [
                  "Const enums are inlined — the enum object is completely erased from output.",
                  "Regular enums create a runtime object — useful if you need reflection or runtime access.",
                  "Const enum in .d.ts requires consumers to use TypeScript compiler (or esbuild respecting tsconfig).",
                  "For libraries, default to regular enum unless bundle size is critical."
        ],
        mistake: "Using const enum in a library .d.ts without documenting it — consumers may have issues if their build doesn't handle const enums. Regular enum is safer.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst enum inlines values; enum creates runtime object. Use regular enum in library .d.ts\n// More explicit but longer",
          concise: "const enum for zero-cost inlining; regular enum for runtime reflection",
        },
      },
      {
        id: "path-mapping",
        fn: "TypeScript Path Mapping (baseUrl, paths)",
        desc: "Configure baseUrl and paths in tsconfig for @ aliases — type-safe import paths.",
        category: "Declarations",
        subtitle: "tsconfig baseUrl and paths for clean imports",
        signature: "\"baseUrl\": \".\", \"paths\": { \"@/*\": [\"src/*\"] }",
        descLong: "Path mapping in tsconfig lets you create import aliases (like @/ for src/) and shorten import paths. This improves code clarity and refactoring. Bundlers (Webpack, Vite, esbuild) respect tsconfig paths. You can map multiple paths: @components, @utils, @types, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TypeScript Path Mapping (baseUrl, paths) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"baseUrl\": \".\",\n    \"paths\": {\n      \"@/*\": [\"src/*\"],\n      \"@components/*\": [\"src/components/*\"],\n      \"@utils/*\": [\"src/utils/*\"],\n      \"@types/*\": [\"src/types/*\"],\n      \"@stores/*\": [\"src/stores/*\"],\n      \"@pages/*\": [\"src/pages/*\"]\n    }\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TypeScript Path Mapping (baseUrl, paths) — common patterns you'll see in production.\n// APPROACH  - Combine TypeScript Path Mapping (baseUrl, paths) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// src/\n//   components/\n//   utils/\n//   types/\n//   stores/\n//   pages/\nimport Button from \"../../components/Button\";\nimport { formatDate } from \"../../utils/format\";\nimport type { User } from \"../../types/user\";\nimport Button from \"@components/Button\";\nimport { formatDate } from \"@utils/format\";\nimport type { User } from \"@types/user\";\n// Clearer, shorter, easier to refactor\n\"paths\": {\n  \"@\": [\"src\"],\n  \"@env\": [\"src/config/environment\"],\n  \"@types\": [\"src/types/index\"]\n}\n// Usage:\nimport \"@env\"; // imports src/config/environment\nimport type { Config } from \"@types\"; // imports from src/types/index"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TypeScript Path Mapping (baseUrl, paths) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n\"paths\": {\n  \"@/*\": [\"src/*\"],\n  \"@api/*\": [\"src/api/*\"],\n  \"@api/client\": [\"src/api/client/index\"],\n  \"@hooks/*\": [\"src/hooks/*\"],\n  \"@hooks/useAuth\": [\"src/hooks/useAuth\"]\n}\n\"paths\": {\n  \"my-lib\": [\"./src/index\"],\n  \"my-lib/*\": [\"./src/*\"]\n}\n// Bundler converts to proper dist/ paths on build\n\"paths\": {\n  \"@app/*\": [\"../app/src/*\"],\n  \"@lib/*\": [\"../lib/src/*\"],\n  \"@types/*\": [\"../shared/types/*\"]\n}\n// Import from other workspace packages"
                  }
        ],
        tips: [
                  "baseUrl is required for paths to work — relative to tsconfig location.",
                  "Use wildcard patterns (@/*) for maximum flexibility.",
                  "Bundlers automatically resolve paths — both dev and production builds work.",
                  "Path mapping doesn't affect runtime — it's purely TypeScript/IDE-level."
        ],
        mistake: "Forgetting to set baseUrl — paths don't work without it. Always set baseUrl: \".\" in compilerOptions.",
        shorthand: {
          verbose: "// Manual / verbose approach\n\"baseUrl\": \".\",\n\"paths\": { \"@/*\": [\"src/*\"], \"@components/*\": [\"src/components/*\"] }\n// More explicit but longer",
          concise: "Path mapping with baseUrl + paths for clean @ aliases; works in Vite, Webpack, esbuild",
        },
      },
    ],
  },
]

export default { meta, sections }
