export const meta = {
  "title": "Advanced Utility Types",
  "domain": "typescript",
  "sheet": "utility-types",
  "icon": "🔧"
}

export const sections = [

  // ── Section 1: Deep Transformations ─────────────────────────────────────────
  {
    id: "deep-transformations",
    title: "Deep Transformations",
    entries: [
      {
        id: "deeppartial-extended",
        fn: "DeepPartial<T> (Extended)",
        desc: "Recursively makes all properties optional at every nesting level — for nested PATCH payloads.",
        category: "Advanced Utility Types",
        subtitle: "Recursive optional for nested updates",
        signature: "type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T",
        descLong: "DeepPartial recursively applies optional to all levels of nesting. Built-in Partial is shallow — nested objects stay fully required. Essential for update APIs, form changes, and PATCH endpoints where you might only change one nested field.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DeepPartial<T> (Extended) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype DeepPartial<T> = T extends object ? {\n  [K in keyof T]?: DeepPartial<T[K]>;\n} : T;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DeepPartial<T> (Extended) — common patterns you'll see in production.\n// APPROACH  - Combine DeepPartial<T> (Extended) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Redux Toolkit slice state\ninterface AppState {\n  user: {\n    profile: {\n      firstName: string;\n      lastName: string;\n      avatar: {\n        url: string;\n        alt: string;\n      };\n    };\n    preferences: {\n      theme: 'light' | 'dark';\n      notifications: {\n        email: boolean;\n        sms: boolean;\n      };\n    };\n  };\n  ui: {\n    modal: {\n      open: boolean;\n      title: string;\n    };\n  };\n}\n// With shallow Partial — nested objects require all fields\ntype ShallowUpdate = Partial<AppState>;\nconst bad: ShallowUpdate = {\n  user: {\n    profile: { firstName: 'John' }, // Error — missing lastName, avatar\n  },\n};\n// With DeepPartial — any field at any level is optional\ntype DeepUpdate = DeepPartial<AppState>;\nconst good: DeepUpdate = {\n  user: {\n    profile: { firstName: 'John' },\n    preferences: { notifications: { email: false } },\n  },\n  ui: { modal: { open: true } },\n};\n// API handler with DeepPartial\nasync function patchState(patch: DeepUpdate): Promise<AppState> {\n  return fetch('/api/state', {\n    method: 'PATCH',\n    body: JSON.stringify(patch),\n  }).then(r => r.json());\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DeepPartial<T> (Extended) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Array-aware DeepPartial\ntype DeepPartialArray<T> = T extends (infer U)[]\n  ? DeepPartialArray<U>[]\n  : T extends object\n  ? { [K in keyof T]?: DeepPartialArray<T[K]> }\n  : T;\ninterface Data {\n  items: { id: string; value: number; tags: string[] }[];\n  metadata: { count: number };\n}\nconst patch: DeepPartialArray<Data> = {\n  items: [{ tags: ['new'] }],\n  metadata: { count: 0 },\n};"
                  }
        ],
        tips: [
                  "DeepPartial is in Redux Toolkit, Zod, and other libraries — check before implementing.",
                  "Be careful with array elements — should they be optional too? Decide based on use case.",
                  "For date fields, add special handling if needed — don't try to deep-partial a Date instance.",
                  "Combine with Omit to exclude sensitive fields: DeepPartial<Omit<T, \"id\" | \"secret\">>."
        ],
        mistake: "Using Partial for nested updates and wondering why nested objects still need all fields — use DeepPartial instead for recursive optionality.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;\n// More explicit but longer",
          concise: "// DeepPartial makes all levels optional recursively",
        },
      },
      {
        id: "flattenkeys",
        fn: "FlattenKeys<T>",
        desc: "Extract all possible dot-notation paths through a nested object as a string literal union.",
        category: "Advanced Utility Types",
        subtitle: "Generate all navigation paths",
        signature: "type Paths<T> = T extends object ? {[K in keyof T]: K | `${K}.${Paths<T[K]>}`}[keyof T] : never",
        descLong: "FlattenKeys generates all possible path strings to values in a nested type. Useful for strongly-typed config accessors, path-based validation, and exhaustive path checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of FlattenKeys<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Generate all dot-notation paths\ntype Paths<T, K extends keyof T = keyof T> = K extends string | number\n  ? T[K] extends Record<string, any>\n    ? `${K}` | `${K}.${Paths<T[K]>}`\n    : `${K}`\n  : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of FlattenKeys<T> — common patterns you'll see in production.\n// APPROACH  - Combine FlattenKeys<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface Config {\n  server: {\n    host: string;\n    port: number;\n    ssl: {\n      enabled: boolean;\n      cert: string;\n    };\n  };\n  database: {\n    url: string;\n    pool: number;\n    timeout: number;\n  };\n}\ntype ConfigPaths = Paths<Config>;\n// 'server' | 'server.host' | 'server.port' | 'server.ssl' | 'server.ssl.enabled' |\n// 'server.ssl.cert' | 'database' | 'database.url' | 'database.pool' | 'database.timeout'\n// Type-safe config accessor\nfunction getConfig<P extends ConfigPaths>(path: P): any {\n  return path.split('.').reduce((obj, key) => obj[key], config);\n}\nconst host = getConfig('server.host');          // OK\nconst port = getConfig('server.port');          // OK\nconst enabled = getConfig('server.ssl.enabled'); // OK\n// getConfig('server.invalid');                   // Error — not a valid path"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of FlattenKeys<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// With default values\ntype GetConfig = <P extends ConfigPaths>(path: P, defaultValue?: any) => any;\nconst getConfig2: GetConfig = (path, defaultValue) => {\n  // Implementation that returns value or default\n};\n// Typed config setter\ntype SetConfig = <P extends ConfigPaths>(path: P, value: any) => void;"
                  }
        ],
        tips: [
                  "Paths work on any nested object — config, settings, state, etc.",
                  "Combine with Navigate<T, P> to get the type at a path.",
                  "Use in config libraries, validation frameworks, and form state management.",
                  "The union can be very large for deep structures — test build times."
        ],
        mistake: "Using string keys without type safety — \"server.invalid\" won't error at runtime. Use Paths to restrict to valid keys at compile time.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype ConfigPaths = Paths<Config>;\n// 'server' | 'server.host' | 'server.port' | 'server.ssl' | ...\n// More explicit but longer",
          concise: "// Paths generates all valid dot-notation paths as a union",
        },
      },
      {
        id: "values-type",
        fn: "Values<T>",
        desc: "Extract all possible values from a type recursively — union of all leaf values.",
        category: "Advanced Utility Types",
        subtitle: "All possible values from nested structures",
        signature: "type Values<T> = T extends object ? T[keyof T] | Values<T[keyof T]> : T",
        descLong: "Values<T> traverses a type and unions all possible values at every level. Useful for validation unions, exhaustiveness checking, and serialization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Values<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract all values from a type\ntype Values<T> = T extends object ? T[keyof T] | Values<T[keyof T]> : T;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Values<T> — common patterns you'll see in production.\n// APPROACH  - Combine Values<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface Schema {\n  user: {\n    name: string;\n    age: number;\n    active: boolean;\n  };\n  config: {\n    timeout: number;\n    retries: number;\n  };\n}\ntype AllValues = Values<Schema>;\n// string | number | boolean\n// Real use: validate that a value belongs to a schema\nfunction isValidValue(schema: Schema, value: any): value is Values<Schema> {\n  const checkValue = (v: any, s: any): boolean => {\n    if (typeof s !== 'object' || s === null) {\n      return typeof v === typeof s;\n    }\n    for (const key in s) {\n      if (checkValue(value, s[key])) return true;\n    }\n    return false;\n  };\n  return checkValue(value, schema);\n}\n// Config with specific value sets\ntype Status = {\n  code: 200 | 201 | 400 | 401 | 403 | 404 | 500;\n  message: string;\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Values<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype StatusValues = Values<Status>;\n// 200 | 201 | 400 | 401 | 403 | 404 | 500 | string\n// Extract numeric values only\ntype NumericValues<T> = T extends object\n  ? T[keyof T] extends number\n    ? T[keyof T] | NumericValues<T[keyof T]>\n    : NumericValues<T[keyof T]>\n  : T extends number\n  ? T\n  : never;\ntype OnlyNumbers = NumericValues<{a: 1, b: {c: 2}, d: 'string'}>; // 1 | 2"
                  }
        ],
        tips: [
                  "Values recursively includes nested values — results can be very large unions.",
                  "Combine with Exclude to filter out specific value types: Exclude<Values<T>, string>.",
                  "Use for validation frameworks that need to accept any value from a schema.",
                  "Large value unions can slow compilation — be careful on deeply nested types."
        ],
        mistake: "Creating a large Values union and then trying to narrow it — consider using more specific filters like NumericValues or filtering within the traversal.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype AllValues = Values<Schema>; // string | number | boolean\n// More explicit but longer",
          concise: "// Values recursively extracts all possible values from nested types",
        },
      },
      {
        id: "override-properties",
        fn: "OverrideProperties<T, U>",
        desc: "Override specific properties of T with properties from U — merge with selective replacement.",
        category: "Advanced Utility Types",
        subtitle: "Selective property overrides",
        signature: "type Override<T, U> = Omit<T, keyof U> & U",
        descLong: "OverrideProperties allows you to take a base type and selectively override specific properties while keeping the rest. Useful for creating variant types, extending interfaces for specific use cases, and building configuration variants.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OverrideProperties<T, U> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple override pattern\ntype Override<T, U> = Omit<T, keyof U> & U;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OverrideProperties<T, U> — common patterns you'll see in production.\n// APPROACH  - Combine OverrideProperties<T, U> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  role: 'admin' | 'user';\n  createdAt: Date;\n}\n// Create a variant where role is narrowed\ntype AdminUser = Override<User, { role: 'admin' }>;\n// { id: string; name: string; email: string; role: 'admin'; createdAt: Date }\n// Create a variant where email is required string format\ntype ValidatedUser = Override<User, { email: string & {_brand: 'email'} }>;\n// Multi-property override\ntype UserDTO = Override<User, {\n  createdAt: string; // ISO format in JSON\n  role: string;      // string instead of literal\n}>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OverrideProperties<T, U> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Conditional override based on a flag\ntype ConditionalOverride<T, U, Condition extends boolean> = Condition extends true\n  ? Override<T, U>\n  : T;\n// API request with different types than database\ninterface DBUser {\n  id: string;\n  name: string;\n  email: string;\n  password: string;\n  createdAt: Date;\n  updatedAt: Date;\n}\ninterface APIUser {\n  id: string;\n  name: string;\n  email: string;\n  createdAt: string;\n  updatedAt: string;\n  password?: never; // never to prevent exposure\n}\n// Transform DB user to API user\ntype DBToAPI<T extends DBUser> = Override<T, {\n  password: never;\n  createdAt: string;\n  updatedAt: string;\n}>;"
                  }
        ],
        tips: [
                  "Override with & preserves all original properties except those replaced.",
                  "Use Omit<T, keyof U> & U to drop U's keys from T, then add U back.",
                  "Useful for creating API response types from database types.",
                  "Combine with Conditional types for variant creation."
        ],
        mistake: "Using Partial<U> in override — this makes U's keys optional. Use full U to override completely, Partial<U> to make overrides optional.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Override<T, U> = Omit<T, keyof U> & U;\n// More explicit but longer",
          concise: "// Override drops U's keys from T, then adds U back",
        },
      },
    ],
  },

  // ── Section 2: Composition & Combination ─────────────────────────────────────────
  {
    id: "composition-patterns",
    title: "Composition & Combination",
    entries: [
      {
        id: "exact-type",
        fn: "Exact<T, U>",
        desc: "Ensure type T is exactly U (structurally identical) — stricter than assignability.",
        category: "Advanced Utility Types",
        subtitle: "Structural type equality check",
        signature: "type Exact<T, U> = T extends U ? (U extends T ? T : never) : never",
        descLong: "Exact ensures structural equivalence — T and U must have the exact same properties. Stricter than extends. Used in tests, validation, and ensuring two types don't drift apart due to refactoring.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Exact<T, U> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Exact<T, U> = [T, U] extends [U, T] ? T : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Exact<T, U> — common patterns you'll see in production.\n// APPROACH  - Combine Exact<T, U> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Test that types are equivalent\ninterface User {\n  id: string;\n  name: string;\n}\ninterface UserDTO {\n  id: string;\n  name: string;\n}\n// These are structurally identical\ntype IsExact = Exact<User, UserDTO>; // User (passes)\n// This would fail\ninterface Admin {\n  id: string;\n  name: string;\n  role: 'admin';\n}\n// type NotExact = Exact<User, Admin>; // never (fails)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Exact<T, U> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Use in function signatures\nfunction transform<T, U>(mapper: (t: T) => U): Exact<T, U> extends never\n  ? 'Types must be exactly equal'\n  : (t: T) => U {\n  return mapper as any;\n}\n// Test type compatibility in unit tests\nimport { expectType } from 'tsd';\ntype Response = { status: number; data: unknown };\ntype Expected = { status: number; data: unknown };\n// This test passes if they're exactly equal\nexpectType<Exact<Response, Expected>>(true as any);"
                  }
        ],
        tips: [
                  "Exact uses mutual extends for true equality — stricter than single direction.",
                  "Used in library type tests to ensure breaking changes are caught.",
                  "tsd (TypeScript Definition Testing) library provides expectType.",
                  "Useful for regression testing when refactoring — ensure types don't drift."
        ],
        mistake: "Using T extends U to check equality — it only checks one direction. Use Exact for true equivalence.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Exact<T, U> = [T, U] extends [U, T] ? T : never;\n// More explicit but longer",
          concise: "// Exact uses mutual extends for structural equivalence",
        },
      },
      {
        id: "nonnull-deep",
        fn: "NonNullableDeep<T>",
        desc: "Recursively removes null and undefined from all properties at all levels.",
        category: "Advanced Utility Types",
        subtitle: "Deep null/undefined filtering",
        signature: "type NonNullableDeep<T> = T extends (infer U)[] ? NonNullableDeep<U>[] : T extends object ? {[K in keyof T]: NonNullableDeep<T[K]>} : Exclude<T, null | undefined>",
        descLong: "NonNullableDeep recursively applies NonNullable to all levels of nesting. Used when you want to guarantee no null/undefined values exist anywhere in a structure after validation or data transformation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of NonNullableDeep<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype NonNullableDeep<T> = T extends (infer U)[]\n  ? NonNullableDeep<U>[]\n  : T extends object\n  ? { [K in keyof T]: NonNullableDeep<T[K]> }\n  : Exclude<T, null | undefined>;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of NonNullableDeep<T> — common patterns you'll see in production.\n// APPROACH  - Combine NonNullableDeep<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// API response with partial nulls\ninterface APIResponse {\n  user: {\n    id: string;\n    name: string | null;\n    email: string | null;\n    profile: {\n      bio: string | null;\n      avatar: string | null;\n    } | null;\n  } | null;\n  timestamp: number | null;\n}\n// After validation/transformation, guarantee no nulls\ntype ValidatedResponse = NonNullableDeep<APIResponse>;\n// {\n//   user: {\n//     id: string;\n//     name: string;\n//     email: string;\n//     profile: {\n//       bio: string;\n//       avatar: string;\n//     };\n//   };\n//   timestamp: number;\n// }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of NonNullableDeep<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Array of objects with optional fields\ninterface Item {\n  id: string;\n  value: number | null;\n  tags: string[] | null;\n}\ntype ValidItems = NonNullableDeep<Item[]>;\n// Item is { id: string; value: number; tags: string[] }[]"
                  }
        ],
        tips: [
                  "NonNullableDeep is stronger than NonNullable — handles nested nullability.",
                  "Combine with type guards to ensure values are actually non-null after extraction.",
                  "Useful after validation with Zod/ArkType — they can guarantee the narrowed type.",
                  "Be careful with circular types — recursion must terminate."
        ],
        mistake: "Using NonNullable on nested types — it only removes null/undefined from the immediate type. Use NonNullableDeep for all levels.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype NonNullableDeep<T> = T extends (infer U)[] ? NonNullableDeep<U>[] : T extends object ? {[K in keyof T]: NonNullableDeep<T[K]>} : Exclude<T, null | undefined>;\n// More explicit but longer",
          concise: "// NonNullableDeep recursively removes null/undefined from all levels",
        },
      },
      {
        id: "record-type",
        fn: "Record<K, V>",
        desc: "Create object types with specific keys and value types — type-safe dictionaries and maps.",
        category: "Advanced Utility Types",
        subtitle: "Key-value object types",
        signature: "Record<string, unknown>  |  Record<\"admin\" | \"user\", Role>",
        descLong: "Record<K, V> constructs an object type where keys are K and all values are V. K can be a union of literals, keyof a type, or a string/number. Cleaner than { [key: K]: V } and enables type-safe access to dynamically keyed objects. Common in config objects, role maps, and caches.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Record<K, V> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple record\ntype Roles = Record<string, { permissions: string[] }>;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Record<K, V> — common patterns you'll see in production.\n// APPROACH  - Combine Record<K, V> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst roles: Roles = {\n  admin: { permissions: ['read', 'write', 'delete'] },\n  user: { permissions: ['read'] },\n  guest: { permissions: [] },\n};\nconst adminPerms = roles['admin'].permissions; // string[]\n// Literal union keys\ntype Status = 'pending' | 'success' | 'error';\ntype StatusMessage = Record<Status, string>;\nconst messages: StatusMessage = {\n  pending: 'Loading...',\n  success: 'Done!',\n  error: 'Something went wrong',\n};\n// Keys from a type\ninterface User { id: string; name: string; email: string }\ntype UserFields = Record<keyof User, string>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Record<K, V> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst fields: UserFields = {\n  id: 'ID',\n  name: 'Full Name',\n  email: 'Email Address',\n};\n// Use in React — component registry\ntype ComponentRegistry = Record<'Button' | 'Input' | 'Modal', React.FC<any>>;\nconst components: ComponentRegistry = {\n  Button: (props) => <button {...props} />,\n  Input: (props) => <input {...props} />,\n  Modal: (props) => <div role=\"dialog\" {...props} />,\n};\n// Cache with Record\ntype CacheEntry<T> = { value: T; expiry: number };\ntype Cache<Keys extends string, T> = Record<Keys, CacheEntry<T>>;\ntype AppCache = Cache<'users' | 'posts' | 'comments', any>;"
                  }
        ],
        tips: [
                  "Record<K, V> is cleaner than { [key in K]: V } for object literals.",
                  "K must be a union of literals, string, number, or keyof T — not object.",
                  "Combine Record with keyof to auto-generate keys from an interface.",
                  "Use Record for component registries, translation maps, and role/permission systems."
        ],
        mistake: "Using Record with a non-literal key type like object — K must be a union type or primitive.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Roles = Record<string, { permissions: string[] }>;\n// More explicit but longer",
          concise: "// Record<K, V> creates objects with specific key/value types",
        },
      },
      {
        id: "extract-exclude",
        fn: "Extract & Exclude",
        desc: "Filter union types — Extract<T, U> keeps members matching U, Exclude removes them.",
        category: "Advanced Utility Types",
        subtitle: "Union type filtering",
        signature: "Extract<T, U>  |  Exclude<T, U>",
        descLong: "Extract and Exclude are conditional types that filter unions. Extract<T, U> returns union members of T that extend U. Exclude<T, U> returns members that don't extend U. Used for discriminating unions, filtering specific types, and type narrowing at the type level.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Extract & Exclude — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract specific union members\ntype Actions = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Extract & Exclude — common patterns you'll see in production.\n// APPROACH  - Combine Extract & Exclude with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype WritableActions = Extract<Actions, 'CREATE' | 'UPDATE' | 'DELETE'>;\n// 'CREATE' | 'UPDATE' | 'DELETE'\ntype ReadableActions = Exclude<Actions, 'CREATE' | 'UPDATE' | 'DELETE'>;\n// 'READ'\n// Extract from discriminated unions\ntype Response =\n  | { status: 'success'; data: string }\n  | { status: 'error'; error: Error }\n  | { status: 'loading' };\ntype SuccessResponse = Extract<Response, { status: 'success' }>;\n// { status: 'success'; data: string }\ntype ErrorResponse = Extract<Response, { status: 'error' }>;\n// { status: 'error'; error: Error }\n// Filter types from a union\ntype Primitives = string | number | boolean | object | null | undefined;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Extract & Exclude — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype NullableValues = Extract<Primitives, null | undefined>;\n// null | undefined\ntype NonNullPrimitives = Exclude<Primitives, null | undefined>;\n// string | number | boolean | object\n// Extract function types from union\ntype Mixed = string | number | (() => void) | { foo: string } | (() => number);\ntype Functions = Extract<Mixed, (...args: any[]) => any>;\n// (() => void) | (() => number)\ntype NonFunctions = Exclude<Mixed, (...args: any[]) => any>;\n// string | number | { foo: string }\n// Real use: filter valid props from a component\ntype ValidHTMLElements = Extract<'div' | 'span' | 'Component' | 'custom', keyof JSX.IntrinsicElements>;"
                  }
        ],
        tips: [
                  "Extract/Exclude are built-in and always preferred over custom implementations.",
                  "Used with discriminated unions for type-safe pattern matching.",
                  "Extracting with (...args: any[]) => any filters function types.",
                  "Combine with other utilities to build complex type filters."
        ],
        mistake: "Using Extract incorrectly on non-union types — both work on unions. Use conditional types for single types.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype WritableActions = Extract<Actions, 'CREATE' | 'UPDATE' | 'DELETE'>;\n// More explicit but longer",
          concise: "// Extract keeps matching members, Exclude removes them",
        },
      },
      {
        id: "nonnullable",
        fn: "NonNullable<T>",
        desc: "Remove null and undefined from a union — narrows optional types.",
        category: "Advanced Utility Types",
        subtitle: "Exclude null/undefined from types",
        signature: "NonNullable<T | null | undefined>",
        descLong: "NonNullable<T> is equivalent to Exclude<T, null | undefined>. Removes null and undefined from unions. Often used after type guards or optional chaining. Works with ?? (nullish coalescing) operator in runtime code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of NonNullable<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Remove null/undefined from optional\ntype MaybeString = string | null | undefined;\ntype DefiniteString = NonNullable<MaybeString>; // string"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of NonNullable<T> — common patterns you'll see in production.\n// APPROACH  - Combine NonNullable<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Function parameter narrowing\nfunction process(input: string | null | undefined): void {\n  // Type is still string | null | undefined here\n  const safe: NonNullable<typeof input> = input!; // unsafe cast\n}\n// Use with type guard\nfunction processValue(value: string | null | undefined) {\n  if (value !== null && value !== undefined) {\n    // TypeScript narrows automatically — NonNullable not needed in guard\n    const safe: typeof value = value; // narrowed to string\n  }\n}\n// Destructuring with nullish coalescing\ninterface Config {\n  timeout?: number | null;\n  retries?: number | null;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of NonNullable<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction connect(config: Config) {\n  type SafeConfig = {\n    timeout: NonNullable<Config['timeout']>;\n    retries: NonNullable<Config['retries']>;\n  };\n  // Use ?? to provide defaults\n  const safe: SafeConfig = {\n    timeout: config.timeout ?? 5000,\n    retries: config.retries ?? 3,\n  };\n}\n// Real use: API response with optional fields\ninterface User { id: string; name: string | null }\ntype UserNonNull = {\n  [K in keyof User]: NonNullable<User[K]>;\n};\n// { id: string; name: string }"
                  }
        ],
        tips: [
                  "NonNullable is often used after runtime narrowing, but TypeScript handles narrowing automatically.",
                  "Combine with ?? (nullish coalescing) for default values.",
                  "For deep non-null removal, use NonNullableDeep instead.",
                  "In most cases, rely on type narrowing over NonNullable casts."
        ],
        mistake: "Using NonNullable with non-null assertion (!) instead of proper type guards — prefer runtime checks.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Safe = NonNullable<string | null | undefined>; // string\n// More explicit but longer",
          concise: "// NonNullable = Exclude<T, null | undefined>",
        },
      },
      {
        id: "awaited-type",
        fn: "Awaited<T>",
        desc: "Recursively unwrap Promise types — Promise<Promise<T>> becomes T.",
        category: "Advanced Utility Types",
        subtitle: "Promise type unwrapping",
        signature: "Awaited<Promise<string>>  |  Awaited<Promise<Promise<number>>>",
        descLong: "Awaited<T> unwraps Promise types recursively. Useful for extracting the resolved type of async functions, promises in arrays, or deeply nested promise chains. Works at the type level — doesn't affect runtime behavior. Available in TypeScript 4.5+.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Awaited<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Unwrap single promise\ntype Result = Awaited<Promise<string>>; // string"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Awaited<T> — common patterns you'll see in production.\n// APPROACH  - Combine Awaited<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Unwrap nested promises\ntype Nested = Awaited<Promise<Promise<number>>>; // number\n// Extract async function return type\nasync function fetchUser(): Promise<User> {\n  return { id: '1', name: 'Alice' };\n}\ntype FetchResult = Awaited<ReturnType<typeof fetchUser>>; // User\n// Array of promises\ntype Promises = Promise<string>[];\ntype Resolved = Awaited<Promises[number]>; // string\n// Works with complex promise chains\ntype PromiseChain = Promise<Promise<Promise<{ data: string }>>>;\ntype ChainResolved = Awaited<PromiseChain>; // { data: string }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Awaited<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Real use: extract resolved value from promise\nasync function processData(data: Promise<{ id: string; values: number[] }>) {\n  const resolved: Awaited<typeof data> = await data;\n  console.log(resolved.id, resolved.values);\n}\n// Use in React with async data\ntype AsyncData<T> = Promise<T>;\nasync function getConfig(): AsyncData<{ host: string; port: number }> {\n  return { host: 'localhost', port: 3000 };\n}\ntype ConfigType = Awaited<ReturnType<typeof getConfig>>;\n// { host: string; port: number }"
                  }
        ],
        tips: [
                  "Awaited recursively unwraps — use it instead of manually unwrapping nested promises.",
                  "Available in TypeScript 4.5+ — check your version.",
                  "Works with any type — if not a promise, returns the type as-is.",
                  "Useful with async/await function return types."
        ],
        mistake: "Trying to use Awaited before TypeScript 4.5 — check your version or update.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Result = Awaited<Promise<Promise<string>>>; // string\n// More explicit but longer",
          concise: "// Awaited recursively unwraps Promise types",
        },
      },
      {
        id: "custom-utility-omitdeep",
        fn: "Custom Utilities: OmitDeep, PickByValue, RequireAtLeastOne",
        desc: "Build your own utility types for advanced transformations — common patterns for real-world use.",
        category: "Advanced Utility Types",
        subtitle: "Practical custom utility types",
        signature: "OmitDeep<T, K>  |  PickByValue<T, V>  |  RequireAtLeastOne<T>",
        descLong: "Beyond built-in utilities, custom types solve specific problems. OmitDeep removes properties at all nesting levels. PickByValue selects properties by their value type. RequireAtLeastOne ensures at least one property is required. These patterns appear in real codebases and form the basis for type-level libraries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Utilities: OmitDeep, PickByValue, RequireAtLeastOne — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// OmitDeep — recursively omit properties\ntype OmitDeep<T, K extends string> = T extends object\n  ? {\n      [P in keyof T as P extends K ? never : P]: OmitDeep<T[P], K>;\n    }\n  : T;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Utilities: OmitDeep, PickByValue, RequireAtLeastOne — common patterns you'll see in production.\n// APPROACH  - Combine Custom Utilities: OmitDeep, PickByValue, RequireAtLeastOne with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface User {\n  id: string;\n  password: string;\n  profile: {\n    name: string;\n    password: string;\n  };\n}\ntype SafeUser = OmitDeep<User, 'password'>;\n// { id: string; profile: { name: string } }\n// PickByValue — select properties by value type\ntype PickByValue<T, V> = {\n  [K in keyof T as T[K] extends V ? K : never]: T[K];\n};\ninterface Config {\n  host: string;\n  port: number;\n  debug: boolean;\n  timeout: number;\n}\ntype NumericConfig = PickByValue<Config, number>;\n// { port: number; timeout: number }\ntype BooleanConfig = PickByValue<Config, boolean>;\n// { debug: boolean }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Utilities: OmitDeep, PickByValue, RequireAtLeastOne — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// RequireAtLeastOne — at least one property required\ntype RequireAtLeastOne<T> = {\n  [K in keyof T]-?: Omit<T, K> & Required<Pick<T, K>>;\n}[keyof T];\ninterface Options {\n  name?: string;\n  email?: string;\n  phone?: string;\n}\ntype RequiredOptions = RequireAtLeastOne<Options>;\n// { name: string; email?: string; phone?: string } |\n// { name?: string; email: string; phone?: string } |\n// { name?: string; email?: string; phone: string }\n// Real use: form validation\nfunction validateOptions(opts: RequiredOptions): void {\n  if ('name' in opts) console.log('Has name:', opts.name);\n  if ('email' in opts) console.log('Has email:', opts.email);\n}\n// Flatten — remove one level of nesting\ntype Flatten<T> = T extends (infer U)[] ? U : T extends Promise<infer U> ? U : T;\ntype FlatArray = Flatten<string[]>; // string\ntype FlatPromise = Flatten<Promise<number>>; // number"
                  }
        ],
        tips: [
                  "OmitDeep is useful for removing sensitive data from nested objects.",
                  "PickByValue enables type-safe filtering by value type.",
                  "RequireAtLeastOne enforces at least one property without forcing all.",
                  "These patterns appear in libraries like ts-essentials and ts-toolbelt."
        ],
        mistake: "Not accounting for arrays in recursive types — add special handling for T extends any[].",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype OmitDeep<T, K extends string> = T extends object ? { [P in keyof T as P extends K ? never : P]: OmitDeep<T[P], K> } : T;\n// More explicit but longer",
          concise: "// OmitDeep removes properties at all nesting levels",
        },
      },
      {
        id: "parameters-returntype",
        fn: "Parameters, ReturnType, ConstructorParameters, InstanceType",
        desc: "Extract function signatures and constructor info — reflect on function shapes.",
        category: "Advanced Utility Types",
        subtitle: "Function reflection utilities",
        signature: "Parameters<T>  |  ReturnType<T>  |  ConstructorParameters<T>  |  InstanceType<T>",
        descLong: "These built-in utilities extract information from function and class types. Parameters<T> gets all parameter types as a tuple. ReturnType<T> gets the return type. ConstructorParameters<T> and InstanceType<T> work on classes. Essential for higher-order functions, decorators, and type-safe mocking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Parameters, ReturnType, ConstructorParameters, InstanceType — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract parameters as tuple\nfunction greet(name: string, age: number): string {\n  return `Hello ${name}, age ${age}`;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Parameters, ReturnType, ConstructorParameters, InstanceType — common patterns you'll see in production.\n// APPROACH  - Combine Parameters, ReturnType, ConstructorParameters, InstanceType with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype GreetParams = Parameters<typeof greet>; // [string, number]\n// Extract return type\ntype GreetReturn = ReturnType<typeof greet>; // string\n// Use with function variables\nconst handler = (x: number, y: string): boolean => true;\ntype HandlerParams = Parameters<typeof handler>; // [number, string]\ntype HandlerReturn = ReturnType<typeof handler>; // boolean\n// ConstructorParameters — class constructor info\nclass User {\n  constructor(id: string, name: string) {}\n}\ntype UserConstructorParams = ConstructorParameters<typeof User>; // [string, string]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Parameters, ReturnType, ConstructorParameters, InstanceType — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// InstanceType — extract instance type from class\ntype UserInstance = InstanceType<typeof User>; // User\n// Real use: generic function wrapper\nfunction logCall<T extends (...args: any[]) => any>(fn: T) {\n  return ((...args: Parameters<T>): ReturnType<T> => {\n    console.log('Called with:', args);\n    return fn(...args);\n  }) as T;\n}\nconst loggedGreet = logCall(greet);\n// Same signature as original greet\n// Type-safe mock builder\nfunction mockFn<T extends (...args: any[]) => any>(\n  implementation: (...args: Parameters<T>) => ReturnType<T>\n): T {\n  return implementation as T;\n}\nconst mockedHandler = mockFn<typeof handler>((x, y) => true);"
                  }
        ],
        tips: [
                  "Parameters returns a tuple — unpack with [infer P1, infer P2] or use P[number].",
                  "ReturnType works with typeof for concrete functions.",
                  "ConstructorParameters and InstanceType are essential for class decorators.",
                  "These utilities enable advanced patterns like function wrappers and mocks."
        ],
        mistake: "Using Parameters/ReturnType on the function itself instead of typeof — always use typeof with concrete functions.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Params = Parameters<typeof myFunc>; type Return = ReturnType<typeof myFunc>;\n// More explicit but longer",
          concise: "// Extract function shapes for reflection",
        },
      },
      {
        id: "thistype",
        fn: "ThisType<T>",
        desc: "Type the this context in object methods — useful for object literal method typing.",
        category: "Advanced Utility Types",
        subtitle: "Typing this in object methods",
        signature: "const obj: { method(): void } & ThisType<{ prop: string }>",
        descLong: "ThisType<T> provides a way to type the this context in object method definitions. Used when defining object methods that reference this, it narrows the type of this to T. Essential for proper typing of plain object definitions and plugin architectures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ThisType<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Type this in object methods\ntype Person = {\n  name: string;\n  greet(): void;\n} & ThisType<{ name: string }>;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ThisType<T> — common patterns you'll see in production.\n// APPROACH  - Combine ThisType<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst person: Person = {\n  name: 'Alice',\n  greet() {\n    console.log(`Hello, I'm ${this.name}`); // this.name is typed\n  },\n};\n// Plugin system with typed this\ntype Plugin = {\n  init(): void;\n  run(data: any): void;\n} & ThisType<{ config: { debug: boolean }; logger: (msg: string) => void }>;\nconst myPlugin: Plugin = {\n  init() {\n    console.log('Config:', this.config);\n  },\n  run(data) {\n    if (this.config.debug) {\n      this.logger('Running with data: ' + JSON.stringify(data));\n    }\n  },\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ThisType<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Generic ThisType for object builders\nfunction withMethods<T>(obj: T): T & { log: (msg: string) => void } {\n  return {\n    ...obj,\n    log(msg: string) {\n      console.log(msg);\n    },\n  } as any;\n}\n// Real use: Vue.js component setup\ntype VueComponent = {\n  data(): { count: number };\n  increment(): void;\n  decrement(): void;\n} & ThisType<{ count: number }>;\nconst component: VueComponent = {\n  data() {\n    return { count: 0 };\n  },\n  increment() {\n    this.count++; // this.count is typed correctly\n  },\n  decrement() {\n    this.count--;\n  },\n};"
                  }
        ],
        tips: [
                  "ThisType works with & to augment the object type with a this context.",
                  "Essential for plain object method definitions.",
                  "Common in framework-specific types (Vue, Ember).",
                  "Alternative: use classes or arrow function methods for implicit typing."
        ],
        mistake: "Using ThisType on a class — classes already have implicit this typing. Use ThisType for plain objects.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Obj = { method(): void } & ThisType<{ prop: string }>;\nconst obj: Obj = { method() { this.prop; } };\n// More explicit but longer",
          concise: "// ThisType explicitly types this in object methods",
        },
      },
      {
        id: "template-utility",
        fn: "Template Literal Types",
        desc: "Capitalize, Uppercase, Lowercase, Uncapitalize — transform string types.",
        category: "Advanced Utility Types",
        subtitle: "String literal transformations",
        signature: "Capitalize<\"hello\">  |  Uppercase<\"foo\">  |  Lowercase<\"BAR\">",
        descLong: "TypeScript provides built-in string manipulation types. Capitalize changes first letter to uppercase. Uppercase converts to all uppercase. Lowercase to all lowercase. Uncapitalize does the opposite of Capitalize. Use with mapped types to transform property names or create variant names.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Literal Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic string transformations\ntype HelloCap = Capitalize<'hello'>; // 'Hello'\ntype HelloUp = Uppercase<'hello'>; // 'HELLO'\ntype HelloDown = Lowercase<'HELLO'>; // 'hello'\ntype HelloUnCap = Uncapitalize<'Hello'>; // 'hello'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Literal Types — common patterns you'll see in production.\n// APPROACH  - Combine Template Literal Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Use with mapped types — create getters\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\ninterface User { name: string; email: string }\ntype UserGetters = Getters<User>;\n// { getName: () => string; getEmail: () => string }\n// Create setters\ntype Setters<T> = {\n  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;\n};\ntype UserSetters = Setters<User>;\n// { setName: (value: string) => void; setEmail: (value: string) => void }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Literal Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Template literal types for CSS classes\ntype CSSClass<T extends string> = `css-${Lowercase<T>}`;\ntype ButtonClass = CSSClass<'PrimaryButton'>; // 'css-primarybutton'\n// Generate route names\ntype RouteNames = 'Dashboard' | 'Settings' | 'Profile';\ntype RoutePaths = `/${Lowercase<RouteNames>}`;\n// '/' | '/dashboard' | '/settings' | '/profile' (need to handle this correctly)\ntype RouteMap = {\n  [K in RouteNames as Lowercase<K>]: `/${Lowercase<K>}`;\n};\n// { dashboard: '/dashboard'; settings: '/settings'; profile: '/profile' }"
                  }
        ],
        tips: [
                  "Capitalize/Uppercase/Lowercase work on string literal types.",
                  "Combine with mapped types to auto-generate method names.",
                  "Common in ORM libraries for generating database column names.",
                  "Use Capitalize with template literals for naming conventions."
        ],
        mistake: "Using these on non-literal string types — they work on literal types. Generic string doesn't transform.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Upper = Uppercase<\"hello\">; // \"HELLO\"\n// More explicit but longer",
          concise: "// Capitalize, Uppercase, Lowercase transform string literals",
        },
      },
      {
        id: "flatten-type",
        fn: "Flatten<T> & Deep Flattening",
        desc: "Create custom Flatten utilities for arrays and nested types — simplify complex structures.",
        category: "Advanced Utility Types",
        subtitle: "Custom type flattening",
        signature: "type Flatten<T> = T extends (infer U)[] ? U : T",
        descLong: "Flatten extracts element types from arrays or unwraps one level of nesting. DeepFlatten recursively removes all array wrapping. DeepFlattenObject flattens nested object properties. Useful for state management, API responses, and simplifying complex types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Flatten<T> & Deep Flattening — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic flatten — one level\ntype Flatten<T> = T extends (infer U)[] ? U : T;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Flatten<T> & Deep Flattening — common patterns you'll see in production.\n// APPROACH  - Combine Flatten<T> & Deep Flattening with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype FlatString = Flatten<string[]>; // string\ntype FlatNum = Flatten<[1, 2, 3]>;   // 1 | 2 | 3\ntype FlatStr = Flatten<string>;      // string (not array, unchanged)\n// Deep flatten — all levels\ntype DeepFlatten<T> = T extends (infer U)[]\n  ? DeepFlatten<U>\n  : T extends Promise<infer U>\n  ? DeepFlatten<U>\n  : T;\ntype Deep = DeepFlatten<string[][][]>; // string\ntype DeepPromise = DeepFlatten<Promise<Promise<number>>>; // number\n// Flatten object properties recursively\ntype FlattenObject<T> = T extends object\n  ? {\n      [K in keyof T]-?: T[K] extends Array<infer U>\n        ? U extends object\n          ? FlattenObject<U>\n          : U\n        : T[K] extends object\n        ? FlattenObject<T[K]>\n        : T[K];\n    }\n  : T;\ninterface Data {\n  user: { name: string };\n  items: { id: string; tags: string[] }[];\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Flatten<T> & Deep Flattening — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Flattened = FlattenObject<Data>;\n// Simplifies nested structures\n// Flatten union types with arrays\ntype FlattenUnion<T> = T extends any[] ? T[number] : T;\ntype Mixed = FlattenUnion<string | number[] | (boolean | object)[]>;\n// Resolves complex unions\n// Real use: GraphQL response flattening\ninterface GQLResponse {\n  user: {\n    posts: {\n      comments: {\n        author: { name: string };\n      }[];\n    }[];\n  };\n}\ntype Flat = DeepFlatten<GQLResponse>; // Extracts all primitive types"
                  }
        ],
        tips: [
                  "Flatten is useful for simplifying deeply nested types.",
                  "DeepFlatten handles arrays, promises, and objects — watch recursion depth.",
                  "Use infer to extract element types from arrays.",
                  "Combine flatten with other utilities for complex transformations."
        ],
        mistake: "Creating infinite recursion with flatten — add a base case for non-array, non-promise types.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Flatten<T> = T extends (infer U)[] ? U : T;\n// More explicit but longer",
          concise: "// Flatten extracts element types or unwraps one level",
        },
      },
    ],
  },
]

export default { meta, sections }
