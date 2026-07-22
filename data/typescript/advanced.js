export const meta = {
  "title": "Advanced TypeScript Types",
  "domain": "typescript",
  "sheet": "advanced",
  "icon": "🧠"
}

export const sections = [

  // ── Section 1: Advanced Types ─────────────────────────────────────────
  {
    id: "advanced-types",
    title: "Advanced Types",
    entries: [
      {
        id: "mapped-types",
        fn: "Mapped Types",
        desc: "Transform every property of an existing type by iterating over its keys with [K in keyof T].",
        category: "Advanced Types",
        subtitle: "Transform object types property by property",
        signature: "type Mapped<T> = { [K in keyof T]: Transform }",
        descLong: "Mapped types iterate over the keys of a type and produce a new type by transforming each property. You can add/remove optional (?), readonly modifiers using + and - prefixes. The as clause (remapping) lets you rename or filter keys. Most built-in utility types (Partial, Readonly, Pick) are implemented as mapped types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mapped Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface User {\n  id: string;\n  name: string;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mapped Types — common patterns you'll see in production.\n// APPROACH  - Combine Mapped Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype UserPartial = {\n  [K in keyof User]?: User[K];\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mapped Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};"
                  }
        ],
        tips: [
                  "as clause remaps keys.",
                  "never filters out keys.",
                  "- prefix removes modifiers.",
                  "Mapped types work on objects only."
        ],
        mistake: "Expecting mapped types to work distributively over unions.",
        shorthand: {
          verbose: "interface User { name: string; age: number; }\ntype UserReadonly = {\n  readonly name: string;\n  readonly age: number;\n};",
          concise: "type UserReadonly = Readonly<User>;",
        },
      },
      {
        id: "deep-readonly-utility",
        fn: "DeepReadonly<T>",
        desc: "Recursively makes all properties (including nested ones) readonly at every level.",
        category: "Advanced Types",
        subtitle: "Deep immutability for nested objects",
        signature: "type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> }",
        descLong: "TypeScript's built-in Readonly<T> is shallow — nested objects remain mutable. DeepReadonly recursively applies readonly to all levels. Useful for Redux state, API responses you want to treat as immutable, and ensuring deep immutability without runtime Object.freeze().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DeepReadonly<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends object\n    ? DeepReadonly<T[K]>\n    : T[K];\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DeepReadonly<T> — common patterns you'll see in production.\n// APPROACH  - Combine DeepReadonly<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface State {\n  user: {\n    profile: {\n      name: string;\n      address: {\n        city: string;\n        zip: string;\n      };\n    };\n  };\n  settings: {\n    theme: 'light' | 'dark';\n  };\n}\ntype ReadonlyState = DeepReadonly<State>;\n// All properties at all levels are readonly\nconst state: ReadonlyState = {\n  user: {\n    profile: {\n      name: 'Alice',\n      address: { city: 'NYC', zip: '10001' },\n    },\n  },\n  settings: { theme: 'light' },\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DeepReadonly<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// All of these are errors:\n// state.user = {...};\n// state.user.profile.name = 'Bob';\n// state.user.profile.address.city = 'LA';\n// state.settings.theme = 'dark';\n// Redux reducer returns ReadonlyState\nfunction appReducer(\n  state: ReadonlyState = initialState,\n  action: AnyAction\n): ReadonlyState {\n  // TypeScript prevents accidental mutations\n  // Must return new objects, not mutate existing ones\n  return {\n    ...state,\n    user: {\n      ...state.user,\n      profile: {\n        ...state.user.profile,\n        name: 'New Name', // rebuild, don't mutate\n      },\n    },\n  };\n}\n// API response — treat as immutable\nasync function fetchAppState(): Promise<DeepReadonly<State>> {\n  const resp = await fetch('/api/state').then(r => r.json());\n  return resp; // guaranteed never to be mutated\n}"
                  }
        ],
        tips: [
                  "DeepReadonly is built into some libraries (Redux Toolkit, Zod) — check before reinventing.",
                  "The base case for primitives matters — don't recurse into string, number, etc.",
                  "For arrays, decide: should the array itself be readonly? Should elements be readonly?",
                  "DeepReadonly is purely compile-time — doesn't create runtime immutability."
        ],
        mistake: "Expecting DeepReadonly to enforce immutability at runtime — it's only a type constraint. Use Object.freeze() recursively if you need runtime enforcement.",
        shorthand: {
          verbose: "type DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]] : T[K];\n};",
          concise: "type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };",
        },
      },
      {
        id: "utility-types-advanced",
        fn: "Advanced Utility Types (Paths, Values)",
        desc: "Extract all possible paths to values (Paths<T>) and get all values (Values<T>) from a type recursively.",
        category: "Advanced Types",
        subtitle: "Navigate and extract from complex types",
        signature: "type Paths<T> = T extends object ? {[K in keyof T]: K | Paths<T[K]>}[keyof T] : never",
        descLong: "Advanced utility types help you navigate and extract from complex nested types. Paths<T> gives all dot-notation paths through an object (like \"user.profile.name\"). Values<T> gives all possible values. These are useful for strongly-typed config accessors, path validation, and exhaustiveness checking in object traversal.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Utility Types (Paths, Values) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Get all valid paths through an object\ntype Paths<T, K extends keyof T = keyof T> = K extends string | number\n  ? T[K] extends Record<string, any>\n    ? `${K}` | `${K}.${Paths<T[K]>}`\n    : `${K}`\n  : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Utility Types (Paths, Values) — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Utility Types (Paths, Values) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Get all possible values\ntype Values<T> = T extends object ? T[keyof T] | Values<T[keyof T]> : T;\ninterface Config {\n  server: {\n    host: string;\n    port: number;\n    tls: {\n      enabled: boolean;\n      cert: string;\n    };\n  };\n  db: {\n    url: string;\n    pool: number;\n  };\n}\ntype ConfigPaths = Paths<Config>;\n// 'server' | 'server.host' | 'server.port' | 'server.tls' |\n// 'server.tls.enabled' | 'server.tls.cert' | 'db' | 'db.url' | 'db.pool'\ntype ConfigValues = Values<Config>;\n// string | number | boolean\n// Type-safe config accessor\nfunction getConfig<P extends Paths<Config>>(path: P): any {\n  return path.split('.').reduce((obj, key) => obj[key], config as any);\n}\nconst host = getConfig('server.host');        // OK\nconst port = getConfig('server.port');        // OK\n// getConfig('server.invalidPath');            // Error"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Utility Types (Paths, Values) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Navigate through config safely\ntype Navigate<T, P extends string> = P extends `${infer K}.${infer Rest}`\n  ? K extends keyof T\n    ? Navigate<T[K], Rest>\n    : never\n  : P extends keyof T\n    ? T[P]\n    : never;\ntype HostType = Navigate<Config, 'server.host'>;  // string\ntype PortType = Navigate<Config, 'server.port'>;  // number\ntype BadPath = Navigate<Config, 'server.bad'>;    // never\n// Merge multiple option objects with type safety\ntype Merge<T, U> = {\n  [K in keyof (T & U)]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never;\n};\ninterface DefaultOptions { timeout: number; retries: number }\ninterface UserOptions { timeout?: number }\ntype FinalOptions = Merge<DefaultOptions, UserOptions>;\n// { timeout: number; retries: number }"
                  }
        ],
        tips: [
                  "Paths and Values are useful for config libraries and strongly-typed APIs.",
                  "These types are recursive — be careful with very deep structures and compile time.",
                  "Use string template types to build paths with dot notation.",
                  "Navigate<T, Path> is a generic version of the indexed access operator T[K]."
        ],
        mistake: "Creating huge Paths/Values types on very deep nesting — the number of paths grows exponentially. Test compiler performance on your actual data shapes.",
        shorthand: {
          verbose: "type Paths<T, K extends keyof T = keyof T> = K extends string | number\n  ? T[K] extends Record<string, any>\n    ? \\`${K}\\` | \\`${K}.${Paths<T[K]>}\\`\n    : \\`${K}\\`\n  : never;",
          concise: "type ConfigPaths = Paths<Config>; // 'server' | 'server.host' | 'server.port' | ...",
        },
      },
      {
        id: "template-literal-types",
        fn: "Template Literal Types",
        desc: "Use template literals in type position to create string-based types with ${string}, Capitalize, Uppercase, Lowercase, Uncapitalize.",
        category: "Advanced Types",
        subtitle: "String manipulation at the type level",
        signature: "type EventName = `on${Capitalize<T>}`",
        descLong: "Template literal types let you build union types from string patterns. You can use intrinsic utilities (Capitalize, Uppercase, Lowercase, Uncapitalize) to transform case. Combined with mapped types, they create type-safe event names, API endpoints, and getter/setter patterns. Template literals work in conditional types, mapped types, and can extract parts of strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Literal Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Event handler names from event types\ntype EventType = 'click' | 'focus' | 'blur';\ntype EventHandler = `on${Capitalize<EventType>}`;\n// 'onClick' | 'onFocus' | 'onBlur'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Literal Types — common patterns you'll see in production.\n// APPROACH  - Combine Template Literal Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// API route patterns\ntype HTTPMethod = 'get' | 'post' | 'put' | 'delete';\ntype APIVersion = 'v1' | 'v2';\ntype Route = `/api/${APIVersion}/users/${string}`;\n// '/api/v1/users/{id}' | '/api/v2/users/{id}' | ...\n// Case transformations\ntype Uppercase<T extends string> = T extends `${infer F}${infer Rest}`\n  ? `${Uppercase<F>}${Uppercase<Rest>}`\n  : T;\ntype Config = 'api_url' | 'db_host' | 'redis_port';\ntype ConfigEnv = `${Uppercase<Config>}`;\n// 'API_URL' | 'DB_HOST' | 'REDIS_PORT'\n// Extract from union types using template literals\ntype EventName = 'onClick' | 'onFocus' | 'onBlur' | 'onChange';\ntype ExtractEventType<E> = E extends `on${infer T}` ? T : never;\ntype ButtonEvent = ExtractEventType<'onClick'>; // 'Click'\ntype InputEvent = ExtractEventType<'onChange'>; // 'Change'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Literal Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Getter/Setter generation\ntype Getters<T extends Record<string, any>> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\ntype Setters<T extends Record<string, any>> = {\n  [K in keyof T as `set${Capitalize<string & K>}`]: (val: T[K]) => void;\n};\ninterface User {\n  name: string;\n  age: number;\n  email: string;\n}\ntype UserGetters = Getters<User>;\n// { getName: () => string; getAge: () => number; getEmail: () => string; }\ntype UserSetters = Setters<User>;\n// { setName: (val: string) => void; setAge: (val: number) => void; ... }"
                  }
        ],
        tips: [
                  "Capitalize only affects the first character — use custom transforms for full uppercase.",
                  "Template literals extract with infer — great for parsing string unions.",
                  "Combine with mapped types (as clause) for powerful transformations.",
                  "Remember Uncapitalize to reverse Capitalize for generics."
        ],
        mistake: "Using Uppercase/Lowercase recursively when you want to uppercase only the first letter — use Capitalize instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype EventHandler = 'on' + Capitalize<EventType>;\n// More explicit but longer",
          concise: "type EventHandler = `on${Capitalize<EventType>}`;",
        },
      },
      {
        id: "conditional-types",
        fn: "Conditional Types",
        desc: "Conditionally choose types with T extends U ? X : Y — basic structure, distributive behavior with unions.",
        category: "Advanced Types",
        subtitle: "Type-level if/then/else logic",
        signature: "type Conditional<T> = T extends U ? X : Y",
        descLong: "Conditional types enable type-level branching. They follow the pattern T extends U ? X : Y. When T is a union, the conditional distributes over each member (distributive conditional types). This is powerful for building type utilities that adapt to their input. You can nest conditionals and combine them with infer for advanced type extraction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conditional Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic conditional type\ntype IsString<T> = T extends string ? true : false;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conditional Types — common patterns you'll see in production.\n// APPROACH  - Combine Conditional Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype A = IsString<'hello'>;        // true\ntype B = IsString<42>;             // false\ntype C = IsString<string>;         // true\n// Conditional with union — distributive\ntype Flatten<T> = T extends Array<infer U> ? U : T;\ntype Str = Flatten<string[]>;      // string\ntype Num = Flatten<42>;            // 42\ntype Union = Flatten<(string | number)[]>; // string | number\n// Flattens over each union member\n// Extracting function return types\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\ntype AddReturn = ReturnType<(a: number, b: number) => number>;  // number\ntype StrReturn = ReturnType<() => string>;                       // string\ntype VoidReturn = ReturnType<() => void>;                        // void\n// Async return type extraction\ntype AsyncValue<T> = T extends Promise<infer U> ? U : T;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conditional Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype PromiseStr = AsyncValue<Promise<string>>;     // string\ntype JustStr = AsyncValue<string>;                 // string\ntype Nested = AsyncValue<Promise<Promise<number>>>; // Promise<number>\n// Preventing distributivity with tuple wrapping\ntype NonDistributive<T> = [T] extends [U extends V ? X : Y] ? X : Y;\n// Array vs object detection\ntype IsArray<T> = T extends Array<any> ? true : false;\ntype IsObject<T> = T extends Record<string, any> ? true : false;\ntype A1 = IsArray<string[]>;       // true\ntype A2 = IsArray<{ length: 5 }>;  // false (not actually an array)\ntype O1 = IsObject<{ x: 1 }>;      // true\ntype O2 = IsObject<string[]>;      // true (arrays are objects!)\n// Function type detection\ntype IsFunction<T> = T extends Function ? true : false;\ntype F1 = IsFunction<() => void>;      // true\ntype F2 = IsFunction<Function>;        // true\ntype F3 = IsFunction<{ (): void }>;    // true"
                  }
        ],
        tips: [
                  "Distributive conditional types: conditional is applied to each union member separately.",
                  "To prevent distribution, wrap in a tuple: [T] extends [Pattern] ? X : Y.",
                  "Combine with infer for powerful type extraction from complex types.",
                  "Nested conditionals work but can slow the compiler — consider helper types."
        ],
        mistake: "Expecting never to be falsy in conditionals — never is the bottom type. Conditionals still evaluate, not short-circuit.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype ReturnType<T extends Function> = T extends (...args: any[]) => infer R ? R : never;\n// More explicit but longer",
          concise: "T extends U ? X : Y for branching; infer R to extract from patterns",
        },
      },
      {
        id: "infer-keyword",
        fn: "Infer in Conditional Types",
        desc: "Extract types from patterns with infer keyword — ReturnType, Parameters, PromiseType, custom extractors.",
        category: "Advanced Types",
        subtitle: "Type extraction from complex structures",
        signature: "type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never",
        descLong: "The infer keyword captures a type that matches a pattern within a conditional type. It's only valid in conditional type extends clauses. Use infer to extract function return types, promise values, array elements, object properties, and custom patterns. This is the foundation for many type utilities.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Infer in Conditional Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract function return type\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Infer in Conditional Types — common patterns you'll see in production.\n// APPROACH  - Combine Infer in Conditional Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Ret = ReturnType<(x: number) => string>;  // string\ntype VoidRet = ReturnType<() => void>;         // void\n// Extract function parameters\ntype Parameters<T> = T extends (...args: infer P) => any ? P : never;\ntype Params = Parameters<(a: string, b: number) => void>;\n// [a: string, b: number]\n// Extract specific parameter\ntype FirstParam<T> = T extends (arg: infer P, ...rest: any[]) => any ? P : never;\ntype LastParam<T> = T extends (...args: any[], arg: infer P) => any ? P : never;\ntype FP = FirstParam<(x: string, y: number) => void>; // string\ntype LP = LastParam<(x: string, y: number) => void>;  // number\n// Extract promise value\ntype PromiseType<T> = T extends Promise<infer U> ? U : never;\ntype ValueInPromise = PromiseType<Promise<string>>; // string\n// Recursively unwrap promises (handle nested promises)\ntype Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;\ntype NestedPromise = Awaited<Promise<Promise<number>>>; // number\ntype JustValue = Awaited<string>;                       // string"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Infer in Conditional Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Extract array element type\ntype ElementType<T> = T extends (infer E)[] ? E : never;\ntype Element = ElementType<string[]>;  // string\ntype ElementNum = ElementType<number[]>; // number\n// Extract object property type\ntype PropertyType<T, K extends keyof T> = T[K];\ninterface User {\n  name: string;\n  age: number;\n}\ntype NameType = PropertyType<User, 'name'>; // string\n// Extract from mapped type keys\ntype Keys<T> = T extends Record<infer K, any> ? K : never;\ntype ConfigKeys = Keys<{ api: string; db: string }>; // 'api' | 'db'\n// Complex pattern: extract from discriminated union\ntype UnionValue<T> = T extends { type: infer Type; value: infer Value }\n  ? { type: Type; value: Value }\n  : never;\ntype Result = UnionValue<{ type: 'error'; value: string }>;\n// { type: 'error'; value: string }"
                  }
        ],
        tips: [
                  "infer must be inside a conditional extends clause — it captures the first match.",
                  "Multiple infer in same pattern captures different parts of the match.",
                  "Infer works left-to-right for function parameters — last param is harder to extract.",
                  "Use Awaited instead of manual Promise recursion for better compatibility."
        ],
        mistake: "Using infer outside of conditional type extends — it's a syntax error. Always write infer inside T extends Pattern.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\n// More explicit but longer",
          concise: "infer R captures matched types; ReturnType, Parameters, PromiseType are stdlib utilities",
        },
      },
      {
        id: "mapped-modifiers",
        fn: "Mapped Type Modifiers",
        desc: "Add/remove modifiers with +readonly, -readonly, +?, -? in mapped types.",
        category: "Advanced Types",
        subtitle: "Control property mutability and optionality",
        signature: "type Mutable<T> = { -readonly [K in keyof T]: T[K] }",
        descLong: "Mapped types can manipulate two property modifiers: readonly and optional (?). Use + to add, - to remove. This enables powerful transformations: Mutable (remove readonly), Required (remove ?), Partial (add ?). The pattern is particularly useful for creating inverse operations of built-in utilities.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mapped Type Modifiers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Remove readonly modifier\ntype Mutable<T> = {\n  -readonly [K in keyof T]: T[K];\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mapped Type Modifiers — common patterns you'll see in production.\n// APPROACH  - Combine Mapped Type Modifiers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype ReadonlyUser = {\n  readonly name: string;\n  readonly age: number;\n};\ntype MutableUser = Mutable<ReadonlyUser>;\n// { name: string; age: number; }\n// Remove optional modifier (make required)\ntype Required<T> = {\n  [K in keyof T]-?: T[K];\n};\ntype PartialConfig = {\n  debug?: boolean;\n  timeout?: number;\n  retries?: number;\n};\ntype StrictConfig = Required<PartialConfig>;\n// { debug: boolean; timeout: number; retries: number; }\n// Add optional modifier\ntype Partial<T> = {\n  [K in keyof T]?: T[K];\n};\ninterface Strict {\n  name: string;\n  age: number;\n}\ntype FlexibleStrict = Partial<Strict>;\n// { name?: string; age?: number; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mapped Type Modifiers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Add readonly modifier\ntype Readonly<T> = {\n  +readonly [K in keyof T]: T[K];\n};\n// Combined: remove readonly AND optional\ntype Concrete<T> = {\n  -readonly [K in keyof T]-?: T[K];\n};\ntype FlexibleData = {\n  readonly id?: string;\n  readonly name?: string;\n};\ntype ImmutableRequired = Concrete<FlexibleData>;\n// { readonly id: string; readonly name: string; }\n// Selective modifier application based on value type\ntype ReadonlyIfFunction<T> = {\n  readonly [K in keyof T]: T[K] extends Function ? T[K] : Partial<T[K]>;\n};\ninterface API {\n  fetch: (url: string) => Promise<any>;\n  cache: { data?: Record<string, any> };\n}\ntype SafeAPI = ReadonlyIfFunction<API>;\n// { readonly fetch: (...) => Promise<any>; readonly cache?: { data?: Record<string, any> } }"
                  }
        ],
        tips: [
                  "Use - to remove modifiers, + to add (+ is optional but explicit).",
                  "Combined -readonly -? makes all properties required and mutable.",
                  "+readonly +? adds both modifiers.",
                  "These work on every key in the mapped type — not selective per key."
        ],
        mistake: "Forgetting that modifiers apply to ALL keys — you can't conditionally apply to specific properties in a single type. Use conditional types inside mapped types for selective behavior.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Mutable<T> = { -readonly [K in keyof T]: T[K] };\ntype Required<T> = { [K in keyof T]-?: T[K] };\n// More explicit but longer",
          concise: "-readonly removes readonly; -? removes optional; combined -readonly -? for full mutability+required",
        },
      },
      {
        id: "recursive-types",
        fn: "Recursive Type Aliases",
        desc: "Create self-referential types for linked lists, trees, JSON structures, deep partial/readonly.",
        category: "Advanced Types",
        subtitle: "Navigate arbitrarily nested structures",
        signature: "type Tree<T> = { value: T; left?: Tree<T>; right?: Tree<T> }",
        descLong: "Recursive type aliases reference themselves, enabling type definitions for tree structures, linked lists, and deeply nested data. TypeScript allows recursion with a base case. Recursive types are useful for JSON type definitions, AST structures, and generic deep transformations. Be cautious of infinite loops — ensure there's a termination path.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Recursive Type Aliases — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Linked list node\ntype LinkedList<T> = T | { value: T; next: LinkedList<T> };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Recursive Type Aliases — common patterns you'll see in production.\n// APPROACH  - Combine Recursive Type Aliases with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst list: LinkedList<number> = {\n  value: 1,\n  next: {\n    value: 2,\n    next: {\n      value: 3,\n      next: 3 // end with value or node\n    }\n  }\n};\n// Binary search tree\ntype Tree<T> = {\n  value: T;\n  left?: Tree<T>;\n  right?: Tree<T>;\n};\nconst tree: Tree<number> = {\n  value: 5,\n  left: { value: 3 },\n  right: {\n    value: 7,\n    left: { value: 6 },\n  }\n};\n// JSON-like structure\ntype JSONValue =\n  | null\n  | boolean\n  | number\n  | string\n  | JSONValue[]\n  | { [key: string]: JSONValue };\nconst data: JSONValue = {\n  name: 'Alice',\n  age: 30,\n  hobbies: ['reading', 'coding'],\n  metadata: {\n    created: '2024-01-01',\n    tags: ['ts', 'types'],\n    nested: {\n      deep: true,\n      value: 42\n    }\n  }\n};\n// Deep partial (all levels optional)\ntype DeepPartial<T> = T extends object\n  ? {\n      [K in keyof T]?: DeepPartial<T[K]>;\n    }\n  : T;\ninterface Config {\n  server: {\n    host: string;\n    port: number;\n    ssl: {\n      enabled: boolean;\n      cert: string;\n    };\n  };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Recursive Type Aliases — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype PartialConfig = DeepPartial<Config>;\n// All nested properties are optional\n// Graph representation\ntype GraphNode<T> = {\n  id: string;\n  value: T;\n  edges: GraphNode<T>[];\n};\n// Menu tree with nested submenus\ntype MenuItem = {\n  label: string;\n  icon?: string;\n  href?: string;\n  submenu?: MenuItem[];\n};\nconst menu: MenuItem = {\n  label: 'File',\n  submenu: [\n    { label: 'New', href: '/new' },\n    {\n      label: 'Open Recent',\n      submenu: [\n        { label: 'project1.ts', href: '/open?p=1' },\n        { label: 'project2.ts', href: '/open?p=2' }\n      ]\n    }\n  ]\n};\n// Count depth of recursive structure\ntype Depth<T> = T extends object\n  ? 1 + (Depth<T[keyof T]> extends number ? Depth<T[keyof T]> : 0)\n  : 0;\ntype D = Depth<{ a: { b: { c: number } } }>; // roughly 4"
                  }
        ],
        tips: [
                  "Always ensure base cases — primitives or simple types — to avoid infinite recursion.",
                  "Watch compiler performance with very deep recursion — TypeScript has recursion depth limits.",
                  "Recursive types are powerful for schema validation (Zod, tRPC) and runtime type checking.",
                  "Use conditional types (T extends object ?) to detect when to stop recursing."
        ],
        mistake: "Infinite recursion without base case — type Tree<T> = Tree<T> will error. Always have at least one non-recursive branch.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Tree<T> = { value: T; left?: Tree<T>; right?: Tree<T> };\n// More explicit but longer",
          concise: "Self-referential types for lists, trees, JSON; use base cases to avoid infinite loops",
        },
      },
      {
        id: "variadic-tuples",
        fn: "Variadic Tuple Types",
        desc: "Spread operators in tuples — [T, ...U], function argument spreading, concat types.",
        category: "Advanced Types",
        subtitle: "Dynamic tuple composition and spreading",
        signature: "type Concat<T extends any[], U extends any[]> = [...T, ...U]",
        descLong: "Variadic tuple types allow spread syntax (...T) in tuple type position. This enables type-safe function overloads, argument forwarding, and tuple concatenation. Combined with conditional types and infer, variadic tuples let you build type-level list operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variadic Tuple Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Concatenate two tuples\ntype Concat<T extends any[], U extends any[]> = [...T, ...U];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variadic Tuple Types — common patterns you'll see in production.\n// APPROACH  - Combine Variadic Tuple Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype T1 = Concat<[number, string], [boolean]>;\n// [number, string, boolean]\n// Prepend to tuple\ntype Prepend<E, T extends any[]> = [E, ...T];\ntype WithId = Prepend<string, [number, boolean]>;\n// [string, number, boolean]\n// Append to tuple\ntype Append<T extends any[], E> = [...T, E];\ntype WithStatus = Append<[number, string], 'active' | 'inactive'>;\n// [number, string, 'active' | 'inactive']\n// Get all but last element\ntype Init<T extends any[]> = T extends [...infer Rest, any] ? Rest : [];\ntype AllButLast = Init<[1, 2, 3, 4]>;\n// [1, 2, 3]\n// Get last element\ntype Last<T extends any[]> = T extends [...any[], infer L] ? L : never;\ntype LastElement = Last<[string, number, boolean]>;\n// boolean\n// Forward function arguments\ntype Parameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;\ntype FuncParams = Parameters<(a: string, b: number) => void>;\n// [a: string, b: number]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variadic Tuple Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Function composition with variadic args\ntype Compose<F extends (...args: any[]) => any, G extends (...args: any[]) => any> =\n  (...args: Parameters<F>) => ReturnType<G>;\ntype AddAndStringify = Compose<\n  (a: number, b: number) => number,\n  (n: number) => string\n>;\n// (...args: [a: number, b: number]) => string\n// Tuple with optional spread\ntype Spread<T extends any[]> = [number, ...T, string];\ntype WithBounds = Spread<[boolean, boolean]>;\n// [number, boolean, boolean, string]\n// Variadic function types\nfunction formatMessage<T extends any[]>(\n  format: string,\n  ...args: T\n): string {\n  // T captures all arguments after format\n  return format;\n}\nconst msg = formatMessage('Hello %s, you are %d', 'Alice', 30);\n// Tuple filter by type\ntype FilterByType<T extends any[], U> = T extends [infer F extends U, ...infer Rest]\n  ? [F, ...FilterByType<Rest, U>]\n  : [];\ntype Strings = FilterByType<[string, 1, 'hello', number, 'world'], string>;\n// [string, 'hello', 'world']\n// Reverse a tuple\ntype Reverse<T extends any[]> = T extends [infer F, ...infer Rest]\n  ? [...Reverse<Rest>, F]\n  : [];\ntype Reversed = Reverse<[1, 2, 3, 4]>;\n// [4, 3, 2, 1]"
                  }
        ],
        tips: [
                  "Variadic tuples support rest at any position: [T, ...U, V] is valid.",
                  "Distribute infer carefully — [infer F, ...infer Rest] processes one element at a time.",
                  "Use variadic tuples for strongly-typed API parameter builders.",
                  "Recursive variadic types can impact compiler performance on large tuples."
        ],
        mistake: "Using variadic tuples with multiple rest operators in the same level — only one unbounded rest allowed. Use conditional recursion instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Concat<T extends any[], U extends any[]> = [...T, ...U];\n// More explicit but longer",
          concise: "[...T, ...U] spreads tuples; infer with rest for element-by-element processing",
        },
      },
      {
        id: "const-assertion",
        fn: "Const Assertion (as const)",
        desc: "Use as const to create readonly tuples, literal types, prevent widening.",
        category: "Advanced Types",
        subtitle: "Preserve literal types and immutability",
        signature: "const tuple = [1, 2, 3] as const",
        descLong: "The as const assertion tells TypeScript to infer the narrowest possible types. Arrays become readonly tuples with literal types, objects become readonly with literal property keys, and string/number literals stay literal instead of widening to string/number. Essential for type-safe config, route builders, and API contracts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Const Assertion (as const) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Without as const — widened types\nconst colors1 = ['red', 'green', 'blue'];\n// type: string[]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Const Assertion (as const) — common patterns you'll see in production.\n// APPROACH  - Combine Const Assertion (as const) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst colors2 = ['red', 'green', 'blue'] as const;\n// type: readonly ['red', 'green', 'blue']\n// Use in type-safe color palette\ntype ColorPalette = typeof colors2; // readonly ['red', 'green', 'blue']\ntype ValidColor = ColorPalette[number]; // 'red' | 'green' | 'blue'\n// Objects with as const\nconst config = {\n  environment: 'production',\n  debug: false,\n  port: 3000\n} as const;\ntype Config = typeof config;\n// {\n//   readonly environment: 'production';\n//   readonly debug: false;\n//   readonly port: 3000;\n// }\ntype Environment = Config['environment']; // 'production', not string\n// API route definition\nconst routes = {\n  users: {\n    list: 'GET /api/users',\n    detail: 'GET /api/users/:id',\n    create: 'POST /api/users',\n    update: 'PUT /api/users/:id'\n  },\n  posts: {\n    list: 'GET /api/posts',\n    create: 'POST /api/posts'\n  }\n} as const;\ntype Route = typeof routes[keyof typeof routes][keyof typeof routes[keyof typeof routes]];\n// 'GET /api/users' | 'GET /api/users/:id' | ..."
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Const Assertion (as const) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Tuple with as const for function overloads\ntype HttpMethods = typeof HTTP_METHODS;\nconst HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE'] as const;\ntype Method = HttpMethods[number]; // 'GET' | 'POST' | 'PUT' | 'DELETE'\n// Extract keys as type\nconst FEATURE_FLAGS = {\n  darkMode: true,\n  betaFeatures: false,\n  newUI: true\n} as const;\ntype FeatureFlag = keyof typeof FEATURE_FLAGS;\n// 'darkMode' | 'betaFeatures' | 'newUI'\nfunction isFeatureEnabled(flag: FeatureFlag): boolean {\n  return FEATURE_FLAGS[flag];\n}\n// Readonly nested structures\nconst schema = {\n  user: {\n    fields: ['id', 'name', 'email'] as const,\n    required: true\n  },\n  post: {\n    fields: ['id', 'title', 'content', 'authorId'] as const,\n    required: true\n  }\n} as const;\ntype UserField = typeof schema.user.fields[number]; // 'id' | 'name' | 'email'"
                  }
        ],
        tips: [
                  "as const is recursive — applied to all nested properties automatically.",
                  "Use with typeof to extract literal types for config/constants.",
                  "Readonly properties prevent accidental mutations at compile time.",
                  "as const allows exhaustiveness checking with unions of literals."
        ],
        mistake: "Forgetting that as const creates readonly types — if you need mutability, choose specific properties for const instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst arr = ['a', 'b'] as const; // readonly ['a', 'b']\ntype Element = typeof arr[number]; // 'a' | 'b'\n// More explicit but longer",
          concise: "as const narrows literals; use with typeof to extract literal union types",
        },
      },
      {
        id: "satisfies-operator",
        fn: "Satisfies Operator",
        desc: "Use satisfies to validate shape without widening types — preserves literal types while checking constraints.",
        category: "Advanced Types",
        subtitle: "Type check without losing literal precision",
        signature: "const value = {...} satisfies SomeInterface",
        descLong: "The satisfies operator (TypeScript 4.9+) checks that a value matches a type, but doesn't widen the inferred type. Unlike as Type assertions, satisfies preserves literal types and makes full use of the value's actual shape. Useful for config validation, ensuring data contracts, and catching errors without sacrificing type inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Satisfies Operator — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Without satisfies — loses literal types\nconst config1 = {\n  environment: 'production',\n  port: 3000\n};\n// type: { environment: string; port: number }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Satisfies Operator — common patterns you'll see in production.\n// APPROACH  - Combine Satisfies Operator with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// With satisfies — preserves literals while validating\ninterface Config {\n  environment: 'development' | 'production' | 'test';\n  port: number;\n  debug?: boolean;\n}\nconst config2 = {\n  environment: 'production',\n  port: 3000,\n  debug: false\n} satisfies Config;\n// type: { environment: 'production'; port: 3000; debug: false }\n// Access with full literal knowledge\ntype Env = typeof config2.environment; // 'production', not string\n// Validation without type narrowing\nconst colors = {\n  primary: '#ff0000',\n  secondary: '#00ff00',\n  accent: '#0000ff'\n} satisfies Record<string, `#${string}`>;\n// Still knows exact keys and values\ntype PrimaryColor = typeof colors.primary; // '#ff0000'\ntype ColorKey = keyof typeof colors; // 'primary' | 'secondary' | 'accent'\n// Route mapping validation\nconst routes = {\n  home: { path: '/', component: 'HomePage' },\n  about: { path: '/about', component: 'AboutPage' },\n  contact: { path: '/contact', component: 'ContactPage' }\n} satisfies Record<string, { path: string; component: string }>;\ntype RouteName = keyof typeof routes; // 'home' | 'about' | 'contact'\ntype HomePage = typeof routes.home.component; // 'HomePage'\n// Enum-like pattern with satisfies\nconst STATUS = {\n  PENDING: 'pending',\n  ACTIVE: 'active',\n  INACTIVE: 'inactive'\n} satisfies Record<string, string>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Satisfies Operator — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype StatusValue = typeof STATUS[keyof typeof STATUS];\n// 'pending' | 'active' | 'inactive'\n// Ensure all events are handled\ntype EventHandlers = {\n  onClick: (e: MouseEvent) => void;\n  onBlur: (e: FocusEvent) => void;\n  onFocus: (e: FocusEvent) => void;\n};\nconst handlers = {\n  onClick: (e) => console.log(e),\n  onBlur: (e) => console.log(e),\n  onFocus: (e) => console.log(e)\n} satisfies EventHandlers;\n// Catch missing handlers — satisfies validates against interface\n// If you omit 'onBlur', you get an error\n// But you still know exact handler types\n// API response validation\ninterface ApiResponse {\n  status: 'success' | 'error';\n  data?: unknown;\n  error?: string;\n}\nconst response = {\n  status: 'success',\n  data: { id: 1, name: 'Alice' }\n} satisfies ApiResponse;\ntype ResponseData = typeof response.data; // { id: 1; name: 'Alice' }, not unknown"
                  }
        ],
        tips: [
                  "satisfies validates without widening — unlike as, it preserves literal types.",
                  "Use when you need type checking but want to keep narrow inference.",
                  "Great for config, route definitions, and exhaustiveness checking.",
                  "satisfies appears on assignment; if it fails, the code doesn't type-check."
        ],
        mistake: "Using satisfies when you actually need type narrowing — satisfies checks shape but doesn't narrow. Use type guards or as const instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst config = {...} as Config; // widens\nconst config = {...} satisfies Config; // preserves literals\n// More explicit but longer",
          concise: "satisfies checks without narrowing; preserves literal types and inference",
        },
      },
      {
        id: "type-predicates",
        fn: "Type Predicates (is keyword)",
        desc: "User-defined type guards with is keyword — narrow types in conditional branches.",
        category: "Advanced Types",
        subtitle: "Custom type narrowing in control flow",
        signature: "function isString(value: unknown): value is string { ... }",
        descLong: "Type predicates use the is keyword to create custom type guards. A function returning value is Type tells TypeScript to narrow the type in conditional branches. Essential for runtime checks (error handling, polymorphism) while maintaining type safety.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Predicates (is keyword) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic type predicate\nfunction isString(value: unknown): value is string {\n  return typeof value === 'string';\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Predicates (is keyword) — common patterns you'll see in production.\n// APPROACH  - Combine Type Predicates (is keyword) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst input: unknown = 'hello';\nif (isString(input)) {\n  console.log(input.toUpperCase()); // input narrowed to string\n}\n// Check if error is Error instance\nfunction isError(value: unknown): value is Error {\n  return value instanceof Error;\n}\ntry {\n  // ...\n} catch (error) {\n  if (isError(error)) {\n    console.log(error.message); // error is Error here\n  } else {\n    console.log('Unknown error:', error);\n  }\n}\n// Array element filtering with type guard\nfunction isNotNull<T>(value: T | null): value is T {\n  return value !== null;\n}\nconst items = [1, null, 2, null, 3];\nconst filtered = items.filter(isNotNull);\n// type of filtered: (number | null)[] still, but now we know it's safe\n// Better: use as const with satisfies\nconst filtered2 = items.filter((x): x is number => x !== null);\n// type of filtered2: number[] (actually narrowed)\n// Discriminated union type guard\ntype Shape = Circle | Square | Triangle;\ninterface Circle {\n  kind: 'circle';\n  radius: number;\n}\ninterface Square {\n  kind: 'square';\n  side: number;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Predicates (is keyword) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface Triangle {\n  kind: 'triangle';\n  base: number;\n  height: number;\n}\nfunction isCircle(shape: Shape): shape is Circle {\n  return shape.kind === 'circle';\n}\nfunction isSquare(shape: Shape): shape is Square {\n  return shape.kind === 'square';\n}\nfunction getArea(shape: Shape): number {\n  if (isCircle(shape)) {\n    return Math.PI * shape.radius ** 2; // shape is Circle\n  }\n  if (isSquare(shape)) {\n    return shape.side ** 2; // shape is Square\n  }\n  // triangle\n  return (shape.base * shape.height) / 2;\n}\n// Check if value matches interface shape\nfunction isUser(value: unknown): value is User {\n  return (\n    typeof value === 'object' &&\n    value !== null &&\n    'id' in value &&\n    'name' in value &&\n    typeof (value as any).id === 'string' &&\n    typeof (value as any).name === 'string'\n  );\n}\ninterface User {\n  id: string;\n  name: string;\n  email?: string;\n}\nconst data: unknown = { id: '1', name: 'Alice', email: 'alice@example.com' };\nif (isUser(data)) {\n  console.log(data.id); // safely access User properties\n}\n// Promise resolution narrowing\nfunction isPromise<T>(value: unknown): value is Promise<T> {\n  return value instanceof Promise;\n}\nasync function processValue(value: unknown): Promise<void> {\n  if (isPromise(value)) {\n    const resolved = await value;\n    // resolved is T\n  } else {\n    // value is unknown\n  }\n}"
                  }
        ],
        tips: [
                  "Type predicates return boolean and use is keyword to signal type narrowing.",
                  "Type guard is checked at runtime — ensure the logic matches the type claim.",
                  "Combine with filter() using inline type predicates: items.filter((x): x is T => ...)",
                  "Type guards are the standard pattern for runtime polymorphism in TypeScript."
        ],
        mistake: "Lying in type predicates — if isString returns true but the value isn't actually a string, you break type safety. Ensure the runtime check matches the type claim.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfunction isString(value: unknown): value is string { return typeof value === 'string'; }\n// More explicit but longer",
          concise: "value is Type narrows in conditionals; use instanceof or typeof checks inside",
        },
      },
      {
        id: "template-string-unions",
        fn: "Extracting from Template String Unions",
        desc: "Extract parts of union types using template literals — parse event names, route patterns, etc.",
        category: "Advanced Types",
        subtitle: "String pattern matching in types",
        signature: "EventName extends `on${infer T}` ? T : never",
        descLong: "Template literals in conditional types let you parse and extract patterns from string unions. Combined with infer, you can break apart strings, extract prefixes/suffixes, and build reverse mappings. Useful for event systems, API route parsing, and pattern-based transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Extracting from Template String Unions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract event type from event handler name\ntype EventHandlers = 'onClick' | 'onFocus' | 'onBlur' | 'onChange';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Extracting from Template String Unions — common patterns you'll see in production.\n// APPROACH  - Combine Extracting from Template String Unions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype ExtractEventType<E extends EventHandlers> = E extends `on${infer T}`\n  ? T\n  : never;\ntype ClickEvent = ExtractEventType<'onClick'>; // 'Click'\ntype FocusEvent = ExtractEventType<'onFocus'>; // 'Focus'\ntype ChangeEvent = ExtractEventType<'onChange'>; // 'Change'\n// Extract HTTP method and path from route string\ntype Routes = 'GET /api/users' | 'POST /api/users' | 'PUT /api/users/:id' | 'DELETE /api/users/:id';\ntype ExtractMethod<R extends Routes> = R extends `${infer M} /${infer _}`\n  ? M\n  : never;\ntype GetMethods = ExtractMethod<Routes>; // 'GET' | 'POST' | 'PUT' | 'DELETE'\ntype ExtractPath<R extends Routes> = R extends `${infer _} ${infer P}`\n  ? P\n  : never;\ntype GetPaths = ExtractPath<Routes>; // '/api/users' | '/api/users/:id'\n// Parse CSS property names\ntype CSSProperties = 'background-color' | 'border-radius' | 'padding-top';\ntype ToCamelCase<S extends string> = S extends `${infer First}-${infer Rest}`\n  ? `${First}${ToCamelCase<Capitalize<Rest>>}`\n  : S;\ntype CamelCaseProps = ToCamelCase<CSSProperties>;\n// 'backgroundColor' | 'borderRadius' | 'paddingTop'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Extracting from Template String Unions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Build reverse map: type to handler\ntype EventTypeHandlerMap = {\n  [K in EventHandlers as ExtractEventType<K>]: (e: Event) => void;\n};\n// { Click: ...; Focus: ...; Blur: ...; Change: ... }\n// Parse environment variables pattern\ntype EnvVar = 'API_KEY' | 'DB_HOST' | 'DB_PORT' | 'REDIS_URL';\ntype EnvPrefix<E extends EnvVar, P extends string> = E extends `${P}_${infer Rest}`\n  ? Rest\n  : never;\ntype DbEnvs = EnvPrefix<EnvVar, 'DB'>; // 'HOST' | 'PORT'\n// Extract query parameters from URL pattern\ntype URLPattern = '/users/:id' | '/posts/:postId' | '/users/:id/posts/:postId';\ntype ExtractParams<U extends URLPattern> = U extends `${infer _}::${infer P}`\n  ? P\n  : U extends `${infer _}:${infer P}/:${infer Rest}`\n  ? P | ExtractParams<`/::${Rest}`>\n  : U extends `${infer _}:${infer P}`\n  ? P\n  : never;\ntype UserIdParam = ExtractParams<'/users/:id'>; // 'id'\ntype PostParams = ExtractParams<'/users/:id/posts/:postId'>; // 'id' | 'postId'\n// Build object from parameter names\ntype QueryObject<U extends URLPattern> = {\n  [K in ExtractParams<U>]: string | number;\n};\ntype UserQuery = QueryObject<'/users/:id'>; // { id: string | number }\ntype PostQuery = QueryObject<'/users/:id/posts/:postId'>; // { id: ...; postId: ... }"
                  }
        ],
        tips: [
                  "infer with template literals captures parts; use multiple infers to extract multiple segments.",
                  "Recursive templates (template calling itself) parse complex patterns.",
                  "Useful for building type-safe route builders, event systems, and parsers.",
                  "Template string patterns are evaluated at compile time — no runtime cost."
        ],
        mistake: "Not accounting for order of conditionals — template matching is left-to-right. More specific patterns should come first.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Extract<S extends string> = S extends \\`${infer P}:${infer R}\\` ? P | Extract<R> : S;\n// More explicit but longer",
          concise: "Combine template literals with infer for pattern-based extraction and transformation",
        },
      },
    ],
  },
]

export default { meta, sections }
