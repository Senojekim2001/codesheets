export const meta = {
  "title": "Types",
  "domain": "typescript",
  "sheet": "types",
  "icon": "🔷"
}

export const sections = [

  // ── Section 1: Types & Primitives ─────────────────────────────────────────
  {
    id: "types-primitives",
    title: "Types & Primitives",
    entries: [
      {
        id: "basic-types",
        fn: "Basic Types",
        desc: "TypeScript's core primitive types: string, number, boolean, null, undefined, symbol, bigint.",
        category: "Types & Primitives",
        subtitle: "The seven primitive types",
        signature: "let x: string  |  let y: number  |  let z: boolean",
        descLong: "TypeScript mirrors JavaScript's primitives with static types. Type annotations are optional when TypeScript can infer the type from the initializer. Use lowercase string/number/boolean — the capitalized versions (String, Number, Boolean) refer to object wrapper types and should be avoided.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Basic Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nlet str: string = 'hello';\nlet num: number = 42;\nlet bool: boolean = true;\nlet nums: number[] = [1, 2, 3];\nlet tuple: [string, number] = ['age', 30];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Basic Types — common patterns you'll see in production.\n// APPROACH  - Combine Basic Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction add(a: number, b: number): number {\n  return a + b;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Basic Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst result = add(5, 3);  // 8\nconst message: string = `Sum: ${result}`;\nconst sym: symbol = Symbol('id');\nconst big: bigint = 9007199254740991n;"
                  }
        ],
        tips: [
                  "Always use lowercase string/number/boolean — uppercase versions are boxed object types.",
                  "Let TypeScript infer types when possible.",
                  "Readonly arrays: readonly string[] prevents mutation.",
                  "Use unknown instead of any for external data."
        ],
        mistake: "Using String (capitalized) instead of string.",
        shorthand: {
          verbose: "let str: string = 'hello';\nlet num: number = 42;\nlet bool: boolean = true;",
          concise: "const str: string = 'hello';\nconst num: number = 42;\nconst bool: boolean = true;",
        },
      },
      {
        id: "ts-console-debug",
        fn: "console.log & Type Debugging",
        desc: "Log values and inspect inferred types at compile time and runtime.",
        category: "Types & Primitives",
        subtitle: "console.log, satisfies, typeof, type assertions in debug context",
        signature: "console.log(val)  |  const x = expr satisfies Type  |  typeof val",
        descLong: "TypeScript uses the same console.log as JavaScript — the runtime is identical. The TS-specific skill is debugging types at compile time: hover over a variable in VS Code to see its inferred type, use satisfies to verify a type without widening it, and use @ts-expect-error to test that a type correctly rejects bad input.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of console.log & Type Debugging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// See also: javascript:console-log for full API reference\nconst user = { id: 1, name: 'Alice', role: 'admin' as const };\nconsole.log(user);             // { id: 1, name: 'Alice', role: 'admin' }\nconsole.log(typeof user.id);  // 'number'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of console.log & Type Debugging — common patterns you'll see in production.\n// APPROACH  - Combine console.log & Type Debugging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// In VS Code: hover over a variable to see its inferred type.\n// Use a dummy assignment to force the type to appear in errors:\nconst x = Math.random() > 0.5 ? 'hello' : 42;\n// Hover x → string | number\ntype Role = 'admin' | 'user' | 'guest';\nconst config = {\n  role: 'admin',\n  timeout: 5000,\n} satisfies { role: Role; timeout: number };\n// config.role is still typed as 'admin' (not widened to Role)\n// If role were 'superuser' → compile error\ninterface ApiResponse<T> {\n  data: T;\n  status: number;\n  ok: boolean;\n}\nfunction logResponse<T>(res: ApiResponse<T>): void {\n  console.log(`[${res.status}] ok=${res.ok}`, res.data);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of console.log & Type Debugging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst raw: unknown = JSON.parse('{\"id\":1}');\nconsole.log((raw as { id: number }).id);  // 1 — assert at point of use\n// @ts-expect-error  ← TS will error if the next line does NOT error\nconst bad: string = 42;\nfunction debug(val: string | number | boolean) {\n  if (typeof val === 'string') console.log('string:', val.toUpperCase());\n  if (typeof val === 'number') console.log('number:', val.toFixed(2));\n  if (typeof val === 'boolean') console.log('bool:', val);\n}"
                  }
        ],
        tips: [
                  "Hover over any variable in VS Code to see its exact inferred type — faster than adding console.log.",
                  "satisfies checks the type without changing inference — use it instead of explicit type annotations when you want both a type check and the narrowest inferred type.",
                  "@ts-expect-error is the test-friendly way to verify that bad code correctly produces a compile error.",
                  "console.log(JSON.stringify(val, null, 2)) gives a clean, deep snapshot — avoids the live-reference problem in DevTools."
        ],
        mistake: "Using `as unknown as WrongType` to suppress TypeScript errors while debugging — this defeats type safety and often hides real bugs. Use satisfies or explicit type guards to debug the actual type mismatch instead.",
        shorthand: {
          verbose: "// Widen type to see all fields\nconst x: Record<string, unknown> = complexObj;\nconsole.log(x);",
          concise: "// Keep narrow type, log directly\nconsole.log(complexObj satisfies ExpectedType);",
        },
      },
      {
        id: "readonly-arrays",
        fn: "Readonly Arrays",
        desc: "readonly T[] prevents mutation — .push(), .splice(), and assignment are all type errors.",
        category: "Types & Primitives",
        subtitle: "Immutable array types",
        signature: "readonly T[]  |  ReadonlyArray<T>",
        descLong: "readonly T[] is a read-only array type where all mutating methods are removed. It's not enforced at runtime by JavaScript — it's purely a compile-time TypeScript check. Useful for function parameters to signal \"I won't modify this array\" and for tuple types. readonly T[] and ReadonlyArray<T> are identical.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Readonly Arrays — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Function that reads but never modifies\nfunction sum(nums: readonly number[]): number {\n  return nums.reduce((a, b) => a + b, 0);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Readonly Arrays — common patterns you'll see in production.\n// APPROACH  - Combine Readonly Arrays with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst arr = [1, 2, 3];\nsum(arr); // OK — mutable array assignable to readonly\n// readonly prevents mutations\nfunction bad(items: readonly string[]): void {\n  // items.push('hello');    // Error — push not available\n  // items[0] = 'world';     // Error — no assignment\n  // items.splice(0, 1);     // Error\n  const len = items.length; // OK — reading is fine\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Readonly Arrays — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Readonly tuple\ntype Point = readonly [number, number];\nconst p: Point = [10, 20];\n// p[0] = 5;  // Error — readonly\n// Declare readonly in interface\ninterface Config {\n  readonly apiUrl: string;\n  readonly timeout: number;\n  readonly retries: number;\n}"
                  }
        ],
        tips: [
                  "readonly T[] and ReadonlyArray<T> are identical — prefer the shorthand.",
                  "Mutable arrays are assignable to readonly arrays (contravariance).",
                  "readonly is purely compile-time — use Object.freeze() if you need runtime immutability.",
                  "Readonly<T[]> makes the array reference immutable but not deeply."
        ],
        mistake: "Expecting readonly to prevent mutation at runtime — it's only a type check. Use Object.freeze() or Object.seal() for runtime immutability.",
        shorthand: {
          verbose: "function sum(nums: readonly number[]): number {\n  let total = 0;\n  for (let i = 0; i < nums.length; i++) {\n    total += nums[i];\n  }\n  return total;\n}",
          concise: "const sum = (nums: readonly number[]): number =>\n  nums.reduce((a, b) => a + b, 0);",
        },
      },
      {
        id: "template-literal-types-intro",
        fn: "Template Literal Types",
        desc: "Build string types by combining literals and unions using template syntax — `on${Event}`.",
        category: "Types & Primitives",
        subtitle: "Construct type strings from unions",
        signature: "type Handler = `on${'click' | 'focus'}`",
        descLong: "Template literal types work at the type level — combining a template with a union distributes it: `on${'click' | 'focus'}` becomes `\"onclick\" | \"onfocus\"`. Used for event handler names, CSS variables, API route names, and builder patterns. TypeScript also provides Uppercase, Lowercase, Capitalize, and Uncapitalize utilities.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Literal Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// DOM event names\ntype DomEvent = 'click' | 'focus' | 'blur' | 'change';\ntype EventHandler = `on${Capitalize<DomEvent>}`;\n// EventHandler = 'onClick' | 'onFocus' | 'onBlur' | 'onChange'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Literal Types — common patterns you'll see in production.\n// APPROACH  - Combine Template Literal Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Build CSS variable names\ntype Color = 'primary' | 'secondary' | 'danger';\ntype CssVar = `--color-${Color}`;\n// CssVar = '--color-primary' | '--color-secondary' | '--color-danger'\n// Extract parts with infer\ntype ExtractEvent<T extends string> =\n  T extends `on${infer Event}` ? Event : never;\ntype ClickEvent = ExtractEvent<'onClick'>; // 'Click'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Literal Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Form field namespacing\ntype Field = 'email' | 'password' | 'username';\ntype FormKey = `form${Capitalize<Field>}`;\nconst key: FormKey = 'formEmail'; // OK\n// const bad: FormKey = 'formWrong'; // Error"
                  }
        ],
        tips: [
                  "Template literal types distribute over unions automatically.",
                  "Combine with Capitalize/Lowercase for case transformation.",
                  "Use infer inside conditionals to extract parts of string patterns.",
                  "Avoid creating huge unions (10+ members × 10+ members = 100+ types) — can slow the compiler."
        ],
        mistake: "Creating massive template literal unions with many base types and suffixes — O(n*m) explosion causes compiler slowdown. Test build times on large combinations.",
        shorthand: {
          verbose: "type Color = 'primary' | 'secondary' | 'danger';\ntype CssVar = \\`--color-${Color}\\`;\ntype Primary = '--color-primary';\ntype Secondary = '--color-secondary';\ntype Danger = '--color-danger';",
          concise: "type CssVar = \\`--color-${'primary' | 'secondary' | 'danger'}\\`;",
        },
      },
      {
        id: "union-intersection",
        fn: "Union & Intersection Types",
        desc: "Union (A | B) means either type. Intersection (A & B) means both types combined.",
        category: "Types & Primitives",
        subtitle: "Compose types with | and &",
        signature: "type Result = Success | Failure  |  type Both = A & B",
        descLong: "Union types accept values matching any member — narrow with typeof, in, or discriminants before accessing type-specific properties. Intersection types merge all members into one — the resulting type has every property from both. Unions model \"one of these\" (API responses, event types). Intersections model \"all of these\" (mixins, extending shapes).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Union & Intersection Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Union — one of these shapes\ntype ApiResponse =\n  | { status: 'ok'; data: User[] }\n  | { status: 'error'; message: string };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Union & Intersection Types — common patterns you'll see in production.\n// APPROACH  - Combine Union & Intersection Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction handle(res: ApiResponse) {\n  if (res.status === 'ok') {\n    console.log(res.data);       // narrowed to success branch\n  } else {\n    console.error(res.message);  // narrowed to error branch\n  }\n}\n// Intersection — merge two shapes\ntype Timestamped = { createdAt: Date; updatedAt: Date };\ntype Identifiable = { id: string };\ntype Entity = Timestamped & Identifiable;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Union & Intersection Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst user: Entity = {\n  id: '1',\n  createdAt: new Date(),\n  updatedAt: new Date(),\n};\n// Union with functions\ntype StringOrNumber = string | number;\nfunction format(value: StringOrNumber): string {\n  return typeof value === 'number'\n    ? value.toFixed(2)\n    : value.toUpperCase();\n}"
                  }
        ],
        tips: [
                  "Discriminated unions (shared literal field like status) enable exhaustive narrowing.",
                  "Intersection of conflicting primitives (string & number) resolves to never.",
                  "Prefer union types over enums for string-based variants — they are more flexible.",
                  "Use Extract<Union, Subset> and Exclude<Union, Subset> to filter union members."
        ],
        mistake: "Accessing a property that only exists on one union member without narrowing first — TypeScript only allows properties common to all members until you discriminate.",
        shorthand: {
          verbose: "// Without union types — using any or overloads\nfunction padLeft(value: any, padding: any): string {\n  if (typeof padding === 'number') {\n    return ' '.repeat(padding) + value;\n  }\n  return padding + value;\n}",
          concise: "type StringOrNumber = string | number;\ntype AdminUser = User & Admin; // intersection: has ALL properties of both\nfunction padLeft(value: string, padding: string | number): string {\n  return typeof padding === 'number' ? ' '.repeat(padding) + value : padding + value;\n}",
        },
      },
      {
        id: "literal-types",
        fn: "Literal Types",
        desc: "Narrow a type to an exact value: specific strings, numbers, or booleans.",
        category: "Types & Primitives",
        subtitle: "Exact value types",
        signature: "type Direction = \"north\" | \"south\" | \"east\" | \"west\"",
        descLong: "Literal types restrict a variable to one exact value or a union of exact values. Combined with union types, they create type-safe enumerations without the enum keyword. const assertions (as const) infer literal types automatically. Literal types work with strings, numbers, booleans, and even template literals.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Literal Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// String literal union — replaces enum for many use cases\ntype HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';\ntype Status = 'idle' | 'loading' | 'success' | 'error';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Literal Types — common patterns you'll see in production.\n// APPROACH  - Combine Literal Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction request(url: string, method: HttpMethod): void {\n  fetch(url, { method });\n}\nrequest('/api/users', 'GET');    // OK\n// request('/api', 'OPTIONS');   // Error — not in union\n// Numeric literal\ntype DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;\nconst roll: DiceRoll = 4;       // OK\n// const bad: DiceRoll = 7;     // Error\n// Boolean literal\ntype True = true;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Literal Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// as const — infers literal types from values\nconst config = {\n  apiUrl: 'https://api.example.com',\n  timeout: 5000,\n  retries: 3,\n} as const;\n// config.apiUrl is 'https://api.example.com', not string\n// config.timeout is 5000, not number\n// as const on arrays — becomes readonly tuple of literals\nconst methods = ['GET', 'POST'] as const;\n// type is readonly ['GET', 'POST'], not string[]"
                  }
        ],
        tips: [
                  "as const infers the narrowest possible literal type — use it for config objects.",
                  "String literal unions are often preferable to enums — they work with JSON natively.",
                  "const assertions make all properties readonly and all values literal.",
                  "Literal types are erased at runtime — they exist only at compile time."
        ],
        mistake: "Declaring a variable with let instead of const and expecting a literal type — let infers the widened type (string vs \"hello\"). Use const or as const.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet status: 'idle' = 'idle';\nlet status2: 'idle' | 'loading' | 'success' | 'error' = 'idle';\n// More explicit but longer",
          concise: "const status = 'idle' as const; // inferred as literal \"idle\"",
        },
      },
      {
        id: "enums",
        fn: "Enums",
        desc: "Named constants with auto-incrementing numeric values or explicit string values.",
        category: "Types & Primitives",
        subtitle: "Named constant groups",
        signature: "enum Direction { Up, Down, Left, Right }",
        descLong: "Enums create a set of named constants. Numeric enums auto-increment from 0 (or a specified start). String enums require explicit values for every member but produce cleaner runtime output. const enums are fully inlined at compile time — no runtime object. In modern TypeScript, string literal unions are often preferred over enums because they work directly with JSON and require no import.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Enums — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Numeric enum — auto-incrementing\nenum Direction {\n  Up = 0,\n  Down,    // 1\n  Left,    // 2\n  Right,   // 3\n}\nconst d: Direction = Direction.Up;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Enums — common patterns you'll see in production.\n// APPROACH  - Combine Enums with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// String enum — explicit values (recommended)\nenum LogLevel {\n  Debug = 'DEBUG',\n  Info = 'INFO',\n  Warn = 'WARN',\n  Error = 'ERROR',\n}\nfunction log(level: LogLevel, message: string) {\n  console.log(`[${level}] ${message}`);\n}\nlog(LogLevel.Info, 'Server started');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Enums — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// const enum — inlined at compile time, no runtime object\nconst enum HttpStatus {\n  OK = 200,\n  NotFound = 404,\n  ServerError = 500,\n}\nconst status = HttpStatus.OK;  // compiled to: const status = 200;\n// Reverse mapping (numeric enums only)\nenum Color { Red, Green, Blue }\nColor[0];    // 'Red'\nColor.Red;   // 0"
                  }
        ],
        tips: [
                  "Prefer string enums — they produce readable values in logs and JSON.",
                  "const enum is fully erased at compile time — best for performance-critical code.",
                  "String literal unions (\"a\" | \"b\") are often simpler than enums for API types.",
                  "Numeric enums support reverse mapping (value → name); string enums do not."
        ],
        mistake: "Using numeric enums for API responses that serialize to JSON — the JSON will contain numbers (0, 1, 2) not names. Use string enums or literal unions instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nenum Status { Idle = 'IDLE', Loading = 'LOADING', Success = 'SUCCESS', Error = 'ERROR' }\nconst s: Status = Status.Idle;\n// More explicit but longer",
          concise: "type Status = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'; // simpler, JSON-friendly",
        },
      },
      {
        id: "unknown-any-never",
        fn: "unknown vs any vs never",
        desc: "unknown is the safe top type (must narrow before use). any disables checking. never is the empty/bottom type.",
        category: "Types & Primitives",
        subtitle: "Top and bottom types",
        signature: "unknown (safe)  |  any (unsafe)  |  never (impossible)",
        descLong: "unknown accepts any value but requires narrowing before you can use it — the safe alternative to any. any disables all type checking on a value — use it only as a last resort during migration. never represents values that can never occur: functions that always throw, exhaustive switch defaults, or impossible intersections (string & number). Use never for exhaustive checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of unknown vs any vs never — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// unknown — must narrow before use\nfunction parseJSON(raw: string): unknown {\n  return JSON.parse(raw);\n}\nconst data = parseJSON('{\"name\":\"Alice\"}');\n// data.name;             // Error — unknown is not indexable\nif (typeof data === 'object' && data !== null && 'name' in data) {\n  console.log(data.name); // OK — narrowed\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of unknown vs any vs never — common patterns you'll see in production.\n// APPROACH  - Combine unknown vs any vs never with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// any — disables type checking (avoid)\nlet risky: any = 'hello';\nrisky.nonExistentMethod();  // No error — any skips all checks\n// never — exhaustive switch pattern\ntype Shape = { kind: 'circle'; r: number } | { kind: 'rect'; w: number; h: number };\nfunction area(s: Shape): number {\n  switch (s.kind) {\n    case 'circle': return Math.PI * s.r ** 2;\n    case 'rect':   return s.w * s.h;\n    default:\n      const _exhaustive: never = s;  // Error if a case is missing\n      return _exhaustive;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of unknown vs any vs never — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// never in functions — never returns\nfunction fail(msg: string): never {\n  throw new Error(msg);\n}\n// Type guard function with unknown\nfunction isUser(val: unknown): val is { name: string; email: string } {\n  return typeof val === 'object' && val !== null\n    && 'name' in val && 'email' in val;\n}"
                  }
        ],
        tips: [
                  "Default to unknown over any for untyped external data (API responses, JSON).",
                  "The never type in a default branch catches missing cases at compile time.",
                  "Functions that always throw or loop forever have return type never.",
                  "unknown & T simplifies to T; unknown | T simplifies to unknown."
        ],
        mistake: "Using any instead of unknown for external data — any silently disables type checking and lets bugs through. unknown forces you to validate the shape before using it.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet data: any = JSON.parse('{}');\ndata.name; // no error but risky\n// More explicit but longer",
          concise: "let data: unknown = JSON.parse('{}');\nif (typeof data === 'object' && data !== null) // must narrow first",
        },
      },
      {
        id: "type-assertions",
        fn: "Type Assertions (as)",
        desc: "Tell the compiler to treat a value as a specific type when you know more than it does.",
        category: "Types & Primitives",
        subtitle: "Override inferred types with as",
        signature: "value as Type  |  <Type>value",
        descLong: "Type assertions override TypeScript inference when you have knowledge the compiler lacks — such as after a DOM query or when deserializing data you have validated. Assertions do NOT perform runtime conversion; they only affect the type system. Double assertions (as unknown as T) bypass normal compatibility checks and should be avoided except in tests. Prefer type guards over assertions when possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Assertions (as) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// DOM element — compiler does not know the element type\nconst input = document.getElementById('email') as HTMLInputElement;\ninput.value = 'alice@example.com';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Assertions (as) — common patterns you'll see in production.\n// APPROACH  - Combine Type Assertions (as) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Non-null assertion — ! asserts value is not null/undefined\nconst canvas = document.querySelector('canvas')!;\nconst ctx = canvas.getContext('2d')!;\n// Asserting after validation\ninterface User { id: string; name: string; role: 'admin' | 'user' }\nfunction parseUser(raw: unknown): User {\n  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid');\n  const obj = raw as Record<string, unknown>;\n  if (typeof obj.id !== 'string') throw new Error('Missing id');\n  if (typeof obj.name !== 'string') throw new Error('Missing name');\n  return raw as User;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Assertions (as) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// const assertion — narrow to literal types\nconst routes = ['/', '/about', '/contact'] as const;\ntype Route = (typeof routes)[number];\n// Route = '/' | '/about' | '/contact'\n// satisfies — validate type without widening\nconst palette = {\n  red: [255, 0, 0],\n  green: '#00ff00',\n} satisfies Record<string, string | number[]>;\n// palette.red is still number[] (not widened to string | number[])"
                  }
        ],
        tips: [
                  "Prefer type guards (typeof, instanceof, in) over assertions when possible.",
                  "Non-null assertion (!) should be used sparingly — it hides potential null bugs.",
                  "satisfies (TS 5.0+) validates a type without widening — often better than as.",
                  "as const narrows to the most specific literal type — great for config objects."
        ],
        mistake: "Using as to force-cast incompatible types instead of fixing the underlying type mismatch. Assertions bypass safety — if the runtime value does not match, you get silent bugs.",
        shorthand: {
          verbose: "const elem = document.getElementById('id');\nif (elem !== null && elem instanceof HTMLInputElement) {\n  elem.value = 'text';\n}",
          concise: "const input = document.getElementById('id') as HTMLInputElement;\ninput.value = 'text';",
        },
      },
      {
        id: "tuple-types",
        fn: "Tuple Types",
        desc: "Fixed-length arrays where each position has a specific type.",
        category: "Types & Primitives",
        subtitle: "Positional typed arrays",
        signature: "[Type1, Type2, ...]  |  [...Type[]]",
        descLong: "Tuples define arrays with a known number of elements where each element has its own type. They are useful for function return values (returning multiple values), CSV row types, and coordinates. Labeled tuples (name: Type) improve readability. Rest elements (...Type[]) create variadic tuples. Readonly tuples prevent mutation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tuple Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Basic tuple — fixed position types\ntype Point = [number, number];\nconst origin: Point = [0, 0];\nconst [x, y] = origin;  // destructured with correct types"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tuple Types — common patterns you'll see in production.\n// APPROACH  - Combine Tuple Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Labeled tuple — self-documenting\ntype Range = [start: number, end: number];\ntype UserRow = [id: number, name: string, active: boolean];\n// Optional elements\ntype OptionalTuple = [string, number?];\nconst a: OptionalTuple = ['hello'];\nconst b: OptionalTuple = ['hello', 42];\n// Rest elements — variadic tuples\ntype StringThenNumbers = [string, ...number[]];\nconst row: StringThenNumbers = ['sum', 1, 2, 3, 4];"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tuple Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Function returning tuple\nfunction minMax(arr: number[]): [min: number, max: number] {\n  return [Math.min(...arr), Math.max(...arr)];\n}\nconst [min, max] = minMax([5, 1, 9, 3]);\n// Readonly tuple\ntype Coord = readonly [number, number, number];\nconst p: Coord = [1, 2, 3];\n// p[0] = 10;  // Error — readonly\n// Spread in function parameters\ntype Args = [url: string, method: string, body?: object];\nfunction request(...args: Args) {\n  const [url, method, body] = args;\n}"
                  }
        ],
        tips: [
                  "Use labeled tuples for readability — [start: number, end: number] is clearer than [number, number].",
                  "Destructuring tuples gives each variable its correct type automatically.",
                  "Readonly tuples (readonly [...]) prevent accidental mutation.",
                  "Variadic tuple types enable typed spread/rest patterns for function arguments."
        ],
        mistake: "Using a tuple where an object would be clearer — [string, number, boolean] is opaque. If the tuple exceeds 3 elements, consider a named interface instead.",
        shorthand: {
          verbose: "type Result = [string, number];\nconst [message, code] = result;\nconst msg: string = message;\nconst c: number = code;",
          concise: "type Result = [message: string, code: number];\nconst [message, code] = result; // labeled tuple, types inferred",
        },
      },
    ],
  },
]

export default { meta, sections }
