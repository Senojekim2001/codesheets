export const meta = {
  "title": "Narrowing",
  "domain": "typescript",
  "sheet": "narrowing",
  "icon": "🔍"
}

export const sections = [

  // ── Section 1: Narrowing & Guards ─────────────────────────────────────────
  {
    id: "narrowing-guards",
    title: "Narrowing & Guards",
    entries: [
      {
        id: "typeof-narrowing",
        fn: "typeof narrowing",
        desc: "TypeScript understands typeof checks and narrows the type inside the guarded branch.",
        category: "Narrowing & Guards",
        subtitle: "Primitive type narrowing",
        signature: "if (typeof x === \"string\") { /* x is string here */ }",
        descLong: "TypeScript performs control flow analysis — inside a typeof === \"string\" check, the variable is narrowed to string. Works for all JS typeof results: string, number, boolean, bigint, symbol, object, function, undefined. Handles truthiness narrowing, equality narrowing, and negation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of typeof narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction handle(value: string | number) {\n  if (typeof value === 'string') {\n    value.toUpperCase();\n  } else {\n    value.toFixed(2);\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of typeof narrowing — common patterns you'll see in production.\n// APPROACH  - Combine typeof narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction process(input: unknown) {\n  if (typeof input === 'string') {\n    return input.length;  // input: string\n  } else if (typeof input === 'number') {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of typeof narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn input * 2;     // input: number\n  }\n}"
                  }
        ],
        tips: [
                  "typeof null === \"object\" — check null separately.",
                  "Truthiness narrows away null/undefined/0.",
                  "TypeScript uses control flow analysis.",
                  "Switch statements also narrow."
        ],
        mistake: "Relying on truthiness to narrow 0 or empty string — use explicit checks.",
        shorthand: {
          verbose: "function handle(value: string | number | undefined) {\n  if (value !== undefined) {\n    // value: string | number\n  }\n}",
          concise: "function handle(value: string | number | undefined) {\n  if (typeof value === 'string') { value.toUpperCase(); }\n}",
        },
      },
      {
        id: "assertion-functions",
        fn: "Assertion Functions",
        desc: "Functions that throw on failure and narrow the type on success — used for runtime validation that narrows at compile time.",
        category: "Narrowing & Guards",
        subtitle: "Validate and narrow with thrown assertions",
        signature: "function assert(x: unknown): asserts x is T { if (!check(x)) throw new Error() }",
        descLong: "An assertion function returns void (no return value) but has an asserts type predicate. If the function returns normally, TypeScript narrows the type. If it throws, execution stops. Used for validation where failure is exceptional — the return value carries the information that the check passed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Assertion Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple assertion — just throws or passes\nfunction assertNumber(value: unknown): asserts value is number {\n  if (typeof value !== 'number') {\n    throw new Error(`Expected number, got ${typeof value}`);\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Assertion Functions — common patterns you'll see in production.\n// APPROACH  - Combine Assertion Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nlet data: unknown = JSON.parse('{\"count\": 5}');\n// data is unknown here\nassertNumber(data.count);  // Throws if not number\n// data.count is now number after the assertion!\n// Database assertion — row must exist\nfunction assertRowExists<T extends {id: string}>(row: T | null): asserts row is T {\n  if (row === null) {\n    throw new Error('Row not found');\n  }\n}\nasync function fetchUser(id: string): Promise<User | null> {\n  return db.users.findOne({id});\n}\nconst user = await fetchUser('123');\nassertRowExists(user);\n// user is narrowed to User (not null) after this line\n// Multi-condition assertion\nfunction assertValidEmail(email: unknown): asserts email is string {\n  if (typeof email !== 'string' || !email.includes('@')) {\n    throw new TypeError('Invalid email');\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Assertion Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Assert multiple conditions\nfunction assertValidUser(data: unknown): asserts data is {id: string, name: string} {\n  if (\n    typeof data !== 'object' ||\n    data === null ||\n    !('id' in data) ||\n    !('name' in data)\n  ) {\n    throw new Error('Invalid user');\n  }\n}\nconst userData = await fetch('/api/user').then(r => r.json());\nassertValidUser(userData);\n// userData is now { id: string, name: string }\n// Never assertion for exhaustiveness (special case)\nfunction assertNever(x: never, msg = 'Unexpected value'): never {\n  throw new Error(`${msg}: ${x}`);\n}\ntype Status = 'success' | 'error';\nfunction handle(status: Status) {\n  switch(status) {\n    case 'success': return 'OK';\n    case 'error': return 'Failed';\n    default: return assertNever(status); // Error if Status changes\n  }\n}"
                  }
        ],
        tips: [
                  "Assertion functions throw on failure — use for exceptional cases, not validation loops.",
                  "asserts x is T narrows the type after the assertion call.",
                  "Return type must be void or never — assertion happens through type narrowing, not return value.",
                  "Pair with Zod/ArkType for automatic assertion functions with schemas."
        ],
        mistake: "Writing an assertion that sometimes returns false without throwing — TypeScript trusts your assertion. If it doesn't throw, TypeScript assumes the check passed.",
        shorthand: {
          verbose: "function assertNumber(value: unknown): asserts value is number {\n  if (typeof value !== 'number') throw new Error('Expected number');\n}\nassertNumber(data);\n// data is now number",
          concise: "// Use built-in type guard if available:\nif (typeof data === 'number') { /* data: number */ }",
        },
      },
      {
        id: "custom-type-predicates",
        fn: "Custom Type Predicates",
        desc: "Functions returning x is T — TypeScript uses the function's boolean result to narrow types in calling scope.",
        category: "Narrowing & Guards",
        subtitle: "Custom boolean functions that narrow types",
        signature: "function isUser(x: unknown): x is User { ... }",
        descLong: "A type predicate function (x is T) returns a boolean, but TypeScript narrows x to T when the function returns true. This lets you encapsulate type-checking logic and reuse it — when isUser returns true, TypeScript treats x as User in the following code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Type Predicates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple type guard for interface\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Type Predicates — common patterns you'll see in production.\n// APPROACH  - Combine Custom Type Predicates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction isUser(value: unknown): value is User {\n  if (typeof value !== 'object' || value === null) return false;\n  const obj = value as Record<string, unknown>;\n  return (\n    typeof obj.id === 'string' &&\n    typeof obj.name === 'string' &&\n    typeof obj.email === 'string'\n  );\n}\n// Use in type guards\nconst data = await fetch('/api/user').then(r => r.json());\nif (isUser(data)) {\n  console.log(data.name); // User — fully typed\n} else {\n  console.log('Invalid user data');\n}\n// Filter array by type\nconst items: unknown[] = JSON.parse('[{\"type\":\"user\",...}, {\"type\":\"post\",...}]');\nconst users = items.filter(isUser); // users: User[]\n// Discriminated union with type predicate\ntype Result<T> =\n  | { ok: true; value: T }\n  | { ok: false; error: Error };\nfunction isSuccess<T>(result: Result<T>): result is {ok: true; value: T} {\n  return result.ok === true;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Type Predicates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction handleResult<T>(result: Result<T>) {\n  if (isSuccess(result)) {\n    console.log(result.value); // T\n  } else {\n    console.error(result.error);\n  }\n}\n// Generic type predicate\nfunction isArray<T>(value: unknown): value is T[] {\n  return Array.isArray(value);\n}\nfunction isOfType<T>(value: unknown, type: new () => T): value is T {\n  return value instanceof type;\n}\nconst maybeDate: unknown = new Date();\nif (isOfType(maybeDate, Date)) {\n  maybeDate.getFullYear(); // Date\n}"
                  }
        ],
        tips: [
                  "Type predicates are only as safe as their implementation — TypeScript trusts you.",
                  "Use array.filter(isPredicate) to narrow array element types.",
                  "Generic type predicates let you check instanceof or structural properties.",
                  "Zod, ArkType, and io-ts libraries generate type predicates automatically."
        ],
        mistake: "Writing a type predicate that doesn't actually validate properly — if isUser returns true for invalid data, you get runtime errors on \"typed\" values.",
        shorthand: {
          verbose: "function isUser(value: unknown): value is User {\n  if (typeof value !== 'object' || value === null) return false;\n  const obj = value as Record<string, unknown>;\n  return typeof obj.id === 'string' && typeof obj.name === 'string';\n}",
          concise: "const isUser = (v: unknown): v is User => v instanceof User || (typeof v === 'object' && v !== null && 'id' in v);",
        },
      },
      {
        id: "instanceof-narrowing",
        fn: "instanceof Narrowing",
        desc: "TypeScript narrows types after instanceof checks — works with classes and built-in constructors.",
        category: "Narrowing & Guards",
        subtitle: "Class-based type narrowing",
        signature: "if (x instanceof ClassName) { /* x is ClassName */ }",
        descLong: "instanceof checks whether a value was created by a specific constructor function. TypeScript narrows the type inside the guarded branch. Works with built-in types (Date, Error, Map, RegExp, Array) and custom classes. Does not work with interfaces or type aliases since they have no runtime representation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of instanceof Narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction formatValue(value: Date | string | number): string {\n  if (value instanceof Date) {\n    return value.toISOString();    // value: Date\n  } else if (typeof value === 'string') {\n    return value.toUpperCase();    // value: string\n  } else {\n    return value.toFixed(2);       // value: number\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of instanceof Narrowing — common patterns you'll see in production.\n// APPROACH  - Combine instanceof Narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Error handling with instanceof\nclass NotFoundError extends Error {\n  constructor(public resource: string) { super(resource + ' not found'); }\n}\nclass ValidationError extends Error {\n  constructor(public fields: string[]) { super('Validation failed'); }\n}\nfunction handleError(err: unknown) {\n  if (err instanceof NotFoundError) {\n    console.log('Missing:', err.resource);    // narrowed\n  } else if (err instanceof ValidationError) {\n    console.log('Fields:', err.fields);       // narrowed\n  } else if (err instanceof Error) {\n    console.log('Error:', err.message);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of instanceof Narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Works with built-in constructors\nfunction process(input: Map<string, number> | Set<number> | number[]) {\n  if (input instanceof Map) {\n    input.get('key');       // Map<string, number>\n  } else if (input instanceof Set) {\n    input.has(1);           // Set<number>\n  } else {\n    input.push(1);          // number[]\n  }\n}"
                  }
        ],
        tips: [
                  "instanceof checks the prototype chain — works with class hierarchies.",
                  "Cannot use instanceof with interfaces or type aliases — they are erased at runtime.",
                  "Combine with custom Error subclasses for typed catch blocks.",
                  "Array.isArray() is more reliable than instanceof Array for cross-realm arrays."
        ],
        mistake: "Using instanceof to check for an interface — interfaces do not exist at runtime. Use a type predicate function or the in operator instead.",
        shorthand: {
          verbose: "function formatValue(value: Date | string | number): string {\n  if (value instanceof Date) return value.toISOString();\n  if (typeof value === 'string') return value.toUpperCase();\n  return value.toFixed(2);\n}",
          concise: "const format = (v: Date | string | number): string =>\n  v instanceof Date ? v.toISOString() : typeof v === 'string' ? v.toUpperCase() : v.toFixed(2);",
        },
      },
      {
        id: "in-operator-narrowing",
        fn: "in Operator Narrowing",
        desc: "The in operator checks if a property exists on an object — TypeScript narrows to the branch where it does.",
        category: "Narrowing & Guards",
        subtitle: "Property existence narrowing",
        signature: "if (\"prop\" in obj) { /* obj has prop */ }",
        descLong: "The in operator tests whether a property name exists on an object (own or inherited). TypeScript uses this to narrow union types — if \"swim\" in animal is true, the type is narrowed to whichever union member has a swim property. This is the primary way to discriminate between interfaces in a union without a shared discriminant field.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of in Operator Narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface Fish { swim: () => void; name: string }\ninterface Bird { fly: () => void; name: string }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of in Operator Narrowing — common patterns you'll see in production.\n// APPROACH  - Combine in Operator Narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction move(animal: Fish | Bird) {\n  if ('swim' in animal) {\n    animal.swim();    // animal: Fish\n  } else {\n    animal.fly();     // animal: Bird\n  }\n}\n// Discriminating API response shapes\ntype SuccessResponse = { data: unknown[]; total: number };\ntype ErrorResponse = { error: string; code: number };\ntype ApiResponse = SuccessResponse | ErrorResponse;\nfunction handleResponse(res: ApiResponse) {\n  if ('error' in res) {\n    console.error(res.code, res.error);   // ErrorResponse\n  } else {\n    console.log(res.data, res.total);     // SuccessResponse\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of in Operator Narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Optional property check\ninterface BaseConfig { debug?: boolean; verbose?: boolean }\ninterface ProdConfig extends BaseConfig { apiKey: string }\ninterface DevConfig extends BaseConfig { mockData: boolean }\nfunction loadConfig(config: ProdConfig | DevConfig) {\n  if ('apiKey' in config) {\n    console.log('Production:', config.apiKey);\n  } else {\n    console.log('Dev mode, mock:', config.mockData);\n  }\n}"
                  }
        ],
        tips: [
                  "in checks existence (own or inherited), not truthiness — a property set to undefined still passes.",
                  "Works well when union members have unique properties but no shared discriminant.",
                  "Combine with typeof after in for additional narrowing on the property value.",
                  "Prefer discriminated unions (shared kind/type field) when designing new types."
        ],
        mistake: "Using in with a property that exists on multiple union members — it will not narrow correctly if the property is shared. Use a unique property or a discriminant field.",
        shorthand: {
          verbose: "interface Fish { swim: () => void; name: string }\ninterface Bird { fly: () => void; name: string }\nfunction move(animal: Fish | Bird) {\n  if ('swim' in animal) animal.swim();\n  else animal.fly();\n}",
          concise: "type Animal = { kind: 'fish'; swim: () => void } | { kind: 'bird'; fly: () => void };\n// Use discriminant instead of 'in' for clarity",
        },
      },
      {
        id: "discriminated-unions",
        fn: "Discriminated Unions",
        desc: "Union types with a shared literal property (discriminant) — enables exhaustive, type-safe switch/if narrowing.",
        category: "Narrowing & Guards",
        subtitle: "Tagged unions with a shared kind/type field",
        signature: "type A = { kind: \"a\"; ... } | { kind: \"b\"; ... }",
        descLong: "A discriminated union has a shared property (the discriminant) that is a literal type in each member. Switching on the discriminant narrows the type to the specific member. This is the most idiomatic pattern in TypeScript for modeling variants — API responses, state machines, AST nodes, Redux actions. The compiler checks exhaustiveness when you assign the narrowed value to never.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Discriminated Unions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// State machine — exhaustive switch\ntype RequestState =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: User[] }\n  | { status: 'error'; error: string };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Discriminated Unions — common patterns you'll see in production.\n// APPROACH  - Combine Discriminated Unions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction render(state: RequestState): string {\n  switch (state.status) {\n    case 'idle':    return 'Ready';\n    case 'loading': return 'Loading...';\n    case 'success': return state.data.map(u => u.name).join(', ');\n    case 'error':   return 'Error: ' + state.error;\n  }\n}\n// Redux-style actions\ntype Action =\n  | { type: 'ADD_TODO'; text: string }\n  | { type: 'TOGGLE_TODO'; id: number }\n  | { type: 'DELETE_TODO'; id: number };\nfunction reducer(state: Todo[], action: Action): Todo[] {\n  switch (action.type) {\n    case 'ADD_TODO':\n      return [...state, { id: Date.now(), text: action.text, done: false }];\n    case 'TOGGLE_TODO':\n      return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t);\n    case 'DELETE_TODO':\n      return state.filter(t => t.id !== action.id);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Discriminated Unions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Exhaustive check helper\nfunction assertNever(x: never): never {\n  throw new Error('Unhandled: ' + JSON.stringify(x));\n}\n// If you add a new Action type, TypeScript flags the missing case\ntype Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'rect'; width: number; height: number }\n  | { kind: 'triangle'; base: number; height: number };\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':   return Math.PI * shape.radius ** 2;\n    case 'rect':     return shape.width * shape.height;\n    case 'triangle': return 0.5 * shape.base * shape.height;\n    default:         return assertNever(shape);\n  }\n}"
                  }
        ],
        tips: [
                  "The discriminant must be a literal type (string, number, or boolean literal) in every member.",
                  "Use a default: assertNever(x) to catch unhandled cases at compile time.",
                  "Discriminated unions are the TypeScript equivalent of Rust enums or Haskell ADTs.",
                  "Redux, XState, and most state management libraries rely on this pattern."
        ],
        mistake: "Using a non-literal type (string instead of \"success\") as the discriminant — TypeScript cannot narrow unless the property is a specific literal in each variant.",
        shorthand: {
          verbose: "type State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: string };\nfunction render(state: State) {\n  switch (state.status) {\n    case 'idle': return <p>Ready</p>;\n    case 'success': return <p>{state.data}</p>;\n  }\n}",
          concise: "switch (state.status) { case 'success': return state.data; // fully narrowed }",
        },
      },
      {
        id: "control-flow-narrowing",
        fn: "Control Flow Analysis",
        desc: "TypeScript tracks type changes through if/else, switch, return, throw, and assignment — automatically narrowing as you go.",
        category: "Narrowing & Guards",
        subtitle: "Automatic narrowing through code paths",
        signature: "if (x != null) { /* x is not null/undefined */ }",
        descLong: "TypeScript performs control flow analysis (CFA) to narrow types at every point in your code. After a null check, the variable is non-nullable. After a return/throw, the remaining code has the narrowed type. Equality checks (===, !==, ==, !=) narrow. Truthiness checks narrow away null/undefined/0/empty string. Assignment narrows the type to the assigned value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Control Flow Analysis — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Null check narrows away null/undefined\nfunction greet(name: string | null | undefined): string {\n  if (name == null) {          // == null catches both null and undefined\n    return 'Anonymous';\n  }\n  return 'Hello, ' + name;    // name: string\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Control Flow Analysis — common patterns you'll see in production.\n// APPROACH  - Combine Control Flow Analysis with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Early return pattern — guard clause\nfunction processUser(user: User | null): string {\n  if (!user) return 'No user';\n  // user is User from here on — no else needed\n  return user.name.toUpperCase();\n}\n// Throw narrows remaining code\nfunction getUser(id: string): User {\n  const user = db.get(id);\n  if (!user) throw new NotFoundError(id);\n  return user;  // user: User (not null)\n}\n// Truthiness narrowing\nfunction format(value: string | null | undefined): string {\n  if (value) {\n    return value.trim();    // string (not null, not undefined, not \"\")\n  }\n  return '(empty)';\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Control Flow Analysis — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Equality narrowing\nfunction compare(a: string | number, b: string | boolean) {\n  if (a === b) {\n    // Both are string — only common type\n    a.toUpperCase();  // a: string\n    b.toUpperCase();  // b: string\n  }\n}\n// Assignment narrowing\nlet x: string | number;\nx = 'hello';\nx.toUpperCase();   // x: string\nx = 42;\nx.toFixed(2);      // x: number\n// Nullish coalescing narrows\nconst val: string | undefined = getOptional();\nconst safe = val ?? 'default';  // safe: string"
                  }
        ],
        tips: [
                  "Use == null (double equals) to catch both null and undefined in one check.",
                  "Guard clauses (early return/throw) keep the happy path unindented.",
                  "Truthiness check narrows away null, undefined, 0, NaN, and empty string.",
                  "Optional chaining (?.) does NOT narrow — the result type includes undefined."
        ],
        mistake: "Assuming optional chaining (obj?.prop) narrows the parent object — it does not. The result is T | undefined, and the object remains its original union type.",
        shorthand: {
          verbose: "function greet(name: string | null | undefined): string {\n  if (name == null) return 'Anonymous';\n  return 'Hello, ' + name; // name: string\n}",
          concise: "const greet = (name: string | null | undefined): string => name ? 'Hello, ' + name : 'Anonymous';",
        },
      },
      {
        id: "discriminated-union-narrowing",
        fn: "Discriminated Union Narrowing with Switch",
        desc: "Switch on a discriminant property to narrowly type each union member — exhaustive checking with never.",
        category: "Narrowing & Guards",
        subtitle: "Tagged unions, exhaustive switching, common property narrowing",
        signature: "switch (shape.kind) { case \"circle\": /* shape is now narrowed */ }",
        descLong: "Discriminated unions (tagged unions) have a shared literal property that uniquely identifies each variant. Switching on the discriminant narrows the type to that specific member. This is the most type-safe pattern for modeling variants — the compiler ensures all cases are handled, and each branch has the correct properties.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Discriminated Union Narrowing with Switch — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype ApiResponse<T> =\n  | { status: 'success'; data: T; timestamp: number }\n  | { status: 'error'; error: string; code: number }\n  | { status: 'loading'; progress: number }\n  | { status: 'cached'; data: T; stale: boolean };\n// Switch narrows to specific member\nfunction handleResponse<T>(response: ApiResponse<T>): string {\n  switch (response.status) {\n    case 'success':\n      return `Success: ${response.data}, time: ${response.timestamp}`;  // response.data available\n    case 'error':\n      return `Error ${response.code}: ${response.error}`;  // response.code, response.error available\n    case 'loading':\n      return `Loading ${response.progress}%`;  // response.progress available\n    case 'cached':\n      return `Cached ${response.stale ? \"(stale)\" : \"(fresh)\"}`;  // response.stale available\n    default:\n      return assertNever(response);  // Error if new status added without handling\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Discriminated Union Narrowing with Switch — common patterns you'll see in production.\n// APPROACH  - Combine Discriminated Union Narrowing with Switch with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction assertNever(x: never): never {\n  throw new Error(`Unexpected: ${x}`);\n}\ntype Event =\n  | { type: 'click'; x: number; y: number; button: number }\n  | { type: 'keydown'; key: string; code: string; shiftKey: boolean }\n  | { type: 'wheel'; deltaX: number; deltaY: number };\nfunction handleEvent(event: Event): void {\n  switch (event.type) {\n    case 'click':\n      console.log(`Clicked at (${event.x}, ${event.y})`);\n      break;\n    case 'keydown':\n      if (event.shiftKey) {\n        console.log(`Shift+${event.key}`);\n      }\n      break;\n    case 'wheel':\n      console.log(`Scrolled: dx=${event.deltaX}, dy=${event.deltaY}`);\n      break;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Discriminated Union Narrowing with Switch — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Action =\n  | { type: 'SET_USER'; user: { id: string; name: string } }\n  | { type: 'LOGOUT' }\n  | { type: 'SET_LOADING'; isLoading: boolean };\nfunction reducer(state: AppState, action: Action): AppState {\n  switch (action.type) {\n    case 'SET_USER':\n      return { ...state, user: action.user };  // action.user is typed\n    case 'LOGOUT':\n      return { ...state, user: null };\n    case 'SET_LOADING':\n      return { ...state, isLoading: action.isLoading };\n    default:\n      return assertNever(action);\n  }\n}\ntype Shape =\n  | { kind: 'circle'; radius: number }\n  | { kind: 'square'; side: number }\n  | { kind: 'rectangle'; width: number; height: number };\n// Narrow by common 'kind' property\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case 'circle':\n      return Math.PI * shape.radius ** 2;\n    case 'square':\n      return shape.side ** 2;\n    case 'rectangle':\n      return shape.width * shape.height;\n  }\n}"
                  }
        ],
        tips: [
                  "The discriminant must be a literal type in each union member — not just any string.",
                  "Use default: assertNever(x) to catch missing cases at compile time.",
                  "Discriminated unions are exhaustive — TypeScript ensures all members are handled.",
                  "If you add a new variant, the switch will error until you handle it."
        ],
        mistake: "Using a non-literal type as the discriminant (e.g., type: string instead of type: \"success\") — TypeScript cannot narrow.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype State = { status: \"idle\" } | { status: \"loading\" } | { status: \"success\"; data: T };\nswitch (state.status) { case \"success\": return state.data; }\n// More explicit but longer",
          concise: "// Discriminant must be literal in each member; default: assertNever to catch missing",
        },
      },
      {
        id: "array-narrowing",
        fn: "Array & Tuple Narrowing",
        desc: "Array.isArray() narrows to array type, tuple narrowing via length checks, readonly array narrowing.",
        category: "Narrowing & Guards",
        subtitle: "Array type guards, tuple type narrowing, readonly arrays",
        signature: "Array.isArray(x)  |  x.length === 2  |  x as const satisfies readonly [string, number]",
        descLong: "Array.isArray() narrows unknown to array type. Tuples can be narrowed by checking length — if x.length === 3, x is a 3-element tuple. Readonly arrays are distinct from mutable ones at the type level. Proper narrowing prevents out-of-bounds access and maintains type safety with tuple elements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Array & Tuple Narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction processData(data: unknown): void {\n  if (Array.isArray(data)) {\n    // data is unknown[] here\n    data.forEach((item) => console.log(item));\n    data.map((x) => x.toString());  // ✓\n  } else {\n    // data is not an array\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Array & Tuple Narrowing — common patterns you'll see in production.\n// APPROACH  - Combine Array & Tuple Narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Coords = [number, number];\ntype RGB = [number, number, number];\nfunction handleValue(value: Coords | RGB | number[]): string {\n  if (value.length === 2) {\n    // value is Coords — exactly [number, number]\n    return `Point: (${value[0]}, ${value[1]})`;\n  } else if (value.length === 3) {\n    // value is RGB — exactly [number, number, number]\n    return `Color: rgb(${value[0]}, ${value[1]}, ${value[2]})`;\n  } else {\n    // value is number[]\n    return `Array of ${value.length} numbers`;\n  }\n}\nfunction processArray(arr: readonly string[] | string[]): void {\n  if (Array.isArray(arr)) {\n    // Still not narrowed — both branches could be Array\n    // Use type predicate for more precision\n  }\n}\ntype Predicate<T> = (x: unknown) => x is T;\nconst isReadonlyArray: Predicate<readonly unknown[]> = (x): x is readonly unknown[] => {\n  return Array.isArray(x) || (typeof x === 'object' && x !== null && 'length' in x);\n};\ntype Request =\n  | readonly ['GET', string]\n  | readonly ['POST', string, Record<string, unknown>]\n  | readonly ['DELETE', string];\nfunction handleRequest(req: Request): string {\n  const [method, url, body] = req;\n  if (method === 'GET') {\n    return `GET ${url}`;\n  } else if (method === 'POST') {\n    return `POST ${url} with ${JSON.stringify(body)}`;\n  } else if (method === 'DELETE') {\n    return `DELETE ${url}`;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Array & Tuple Narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction filterNumbers(arr: (string | number | null)[]): number[] {\n  return arr.filter((x): x is number => typeof x === 'number');\n}\n// Array.filter with type predicate\nconst items: (string | number)[] = [\"a\", 1, \"b\", 2];\nconst numbers = items.filter((x): x is number => typeof x === 'number');\n// numbers: number[]\ntype Response = [status: number, data: unknown] | [status: number, data: unknown, cached: boolean];\nfunction handleResponse(res: Response): void {\n  const [status, data, cached] = res;\n  if (res.length === 3) {\n    // res is [number, unknown, boolean]\n    console.log(`Status ${res[0]}, cached: ${res[2]}`);\n  } else {\n    // res is [number, unknown]\n    console.log(`Status ${res[0]}`);\n  }\n}"
                  }
        ],
        tips: [
                  "Array.isArray() is more reliable than instanceof Array for cross-realm arrays.",
                  "Tuple narrowing by length works because tuple lengths are fixed at the type level.",
                  "Use type predicates (x is T[]) in filter() to narrow array element types.",
                  "Readonly arrays cannot be narrowed by checking Array.isArray() — they might be tuples."
        ],
        mistake: "Assuming .length check narrows an array to a specific length — you need an exhaustiveness check or explicit comparisons.",
        shorthand: {
          verbose: "function handle(x: unknown): void {\n  if (Array.isArray(x) && x.length === 2) {\n    const [a, b] = x;  // Still x[i] is unknown\n  }\n}",
          concise: "if (Array.isArray(x) && x.length === 2) { /* x is 2-element tuple */ }",
        },
      },
      {
        id: "nullable-narrowing",
        fn: "Null/Undefined Narrowing & Optional Chaining",
        desc: "Narrow null/undefined with explicit checks, nullish coalescing (??) vs OR (||), optional chaining does not narrow.",
        category: "Narrowing & Guards",
        subtitle: "Nullish checks, optional chaining behavior, coalescing operators",
        signature: "x == null  |  x ?? defaultValue  |  obj?.prop (does NOT narrow obj)",
        descLong: "Null and undefined can be narrowed by direct checks (x != null catches both), nullish coalescing (??), and falsy checks. However, optional chaining (?.) does NOT narrow the object itself — the result is always T | undefined. Understand the difference: == null checks for both, ?? replaces nullish, || replaces falsy.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Null/Undefined Narrowing & Optional Chaining — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction greet(name: string | null | undefined): string {\n  // == null catches both null and undefined\n  if (name == null) {\n    return 'Anonymous';\n  }\n  // name is string here\n  return 'Hello ' + name;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Null/Undefined Narrowing & Optional Chaining — common patterns you'll see in production.\n// APPROACH  - Combine Null/Undefined Narrowing & Optional Chaining with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction getUserEmail(user: User | null): string {\n  const email = user?.email ?? 'unknown@example.com';\n  return email;  // string\n}\nconst count: number | null = 0;\n// || replaces all falsy (0, \"\", false, null, undefined)\nconst displayCount1 = count || 1;  // 1 (oops, 0 is falsy)\n// ?? replaces only nullish (null, undefined)\nconst displayCount2 = count ?? 1;  // 0 (correct, 0 is not nullish)\ninterface Config {\n  api?: { url: string; timeout: number };\n}\nfunction getApiUrl(config: Config): string {\n  const url = config.api?.url;  // string | undefined\n  // config is still Config (not narrowed)\n  // You still need to check the property result\n  if (url) {\n    return url;  // url: string\n  }\n  return 'default';\n}\ninterface User {\n  profile?: {\n    address?: {\n      city?: string;\n    };\n  };\n}\nfunction getCity(user: User): string {\n  return user.profile?.address?.city ?? 'Unknown';  // string\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Null/Undefined Narrowing & Optional Chaining — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction processUser(user: User | null | undefined): void {\n  // Guard clause — early return\n  if (!user) return;\n  // user is definitely User here (not null/undefined)\n  console.log(user.name);\n}\ninterface Maybe<T> {\n  value: T | null | undefined;\n}\nfunction extract<T>(m: Maybe<T>): T | null {\n  // Check for nullish\n  if (m.value == null) {\n    return null;\n  }\n  // m.value: T (non-null, non-undefined)\n  return m.value;\n}\nconst config: { timeout?: number } = getConfig();\nconst timeout = config.timeout ?? 5000;  // timeout: number\ninterface Settings {\n  theme?: { dark?: boolean };\n}\nconst settings: Settings = {};\nconst isDark = settings.theme?.dark;  // boolean | undefined\n// settings.theme is still Settings[\"theme\"] (potentially undefined)"
                  }
        ],
        tips: [
                  "== null catches both null and undefined in one check — more idiomatic than !== undefined.",
                  "?? (nullish coalescing) only replaces null/undefined, ?? || (OR) replaces all falsy values.",
                  "Optional chaining (?.) does NOT narrow — it only safely accesses and returns T | undefined.",
                  "Use guard clauses (early return) to narrow within a function body."
        ],
        mistake: "Assuming optional chaining narrows the object — it doesn't. config.api?.url returns string | undefined, but config.api is still potentially undefined.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst url = config?.api?.url || 'default';\n// url might be 'default' even if config.api.url === ''\n// More explicit but longer",
          concise: "const url = config?.api?.url ?? 'default'; // Only nullish (null/undefined) triggers default",
        },
      },
      {
        id: "satisfies-narrowing",
        fn: "Using satisfies for Inference Narrowing",
        desc: "The satisfies operator enables type checking without widening — preserves literal types for better inference.",
        category: "Narrowing & Guards",
        subtitle: "satisfies operator, literal type preservation, inference without assertion",
        signature: "const x = value satisfies Type;  // checks type without widening",
        descLong: "satisfies (TypeScript 4.9+) validates an expression against a type without changing the inferred type. Unlike type annotations (: Type), which widen literals, satisfies checks without widening. This preserves literal types for auto-complete, union discrimination, and more precise inference while still catching type errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Using satisfies for Inference Narrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Route = {\n  path: string;\n  method: \"GET\" | \"POST\" | \"PUT\" | \"DELETE\";\n  handler: () => void;\n};\n// With type annotation — widens method to union type\nconst route1: Route = {\n  path: \"/users\",\n  method: \"GET\",  // now typed as \"GET\" | \"POST\" | \"PUT\" | \"DELETE\"\n  handler: () => {},\n};\n// route1.method → \"GET\" | \"POST\" | \"PUT\" | \"DELETE\" (wide)\n// With satisfies — preserves literal type\nconst route2 = {\n  path: \"/users\",\n  method: \"GET\",  // stays as literal \"GET\"\n  handler: () => {},\n} satisfies Route;\n// route2.method → \"GET\" (narrow, precise)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Using satisfies for Inference Narrowing — common patterns you'll see in production.\n// APPROACH  - Combine Using satisfies for Inference Narrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst routes = {\n  home: { path: \"/\", method: \"GET\" as const },\n  createUser: { path: \"/users\", method: \"POST\" as const },\n  updateUser: { path: \"/users/:id\", method: \"PUT\" as const },\n} satisfies Record<string, Route>;\n// routes.home.method → \"GET\" (literal)\n// routes[\"createUser\"].method → \"POST\" (literal)\ntype Message =\n  | { type: \"text\"; content: string }\n  | { type: \"image\"; url: string }\n  | { type: \"video\"; url: string; duration: number };\nconst messages = [\n  { type: \"text\", content: \"Hello\" },\n  { type: \"image\", url: \"pic.jpg\" },\n  { type: \"video\", url: \"video.mp4\", duration: 120 },\n] satisfies Message[];\n// messages[0].type → \"text\" (literal, not string)\n// TypeScript can narrow in a switch\n// Both preserve literal types\nconst config1 = {\n  env: \"development\",\n  debug: true,\n} as const;\nconst config2 = {\n  env: \"development\",\n  debug: true,\n} satisfies { env: string; debug: boolean };\n// config1: { readonly env: \"development\"; readonly debug: true }\n// config2: { env: \"development\"; debug: boolean } — not readonly, more flexible"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Using satisfies for Inference Narrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Colors = \"red\" | \"green\" | \"blue\";\nconst palette = {\n  red: \"#ff0000\",\n  green: \"#00ff00\",\n  blue: \"#0000ff\",\n  // purple: \"#ff00ff\",  // Error! \"purple\" not in Colors\n} satisfies Record<Colors, string>;\n// Accessing palette.red → \"#ff0000\" (literal string, not generic string)\nfunction defineApi<const T>(spec: T & { baseUrl: string }): T {\n  return spec;\n}\nconst api = defineApi({\n  baseUrl: \"https://api.example.com\",\n  endpoints: {\n    users: { method: \"GET\", path: \"/users\" },\n    posts: { method: \"GET\", path: \"/posts\" },\n  }\n});\n// API type preserves literal path/method types"
                  }
        ],
        tips: [
                  "satisfies validates type without widening — combine with as const when you need immutability.",
                  "Use satisfies for Record<K, V> to catch missing/extra keys while preserving literal types.",
                  "satisfies is better than type annotation (:) when you want inference to be preserved.",
                  "Const type parameters <const T> in generic functions work with satisfies for maximum precision."
        ],
        mistake: "Using type annotations instead of satisfies when you want to preserve literal types — annotations widen, satisfies narrows.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst route: Route = { method: \"GET\", ... };\n// route.method is \"GET\" | \"POST\" | \"PUT\" | \"DELETE\"\n// More explicit but longer",
          concise: "const route = { method: \"GET\", ... } satisfies Route;\n// route.method is \"GET\" (literal)",
        },
      },
    ],
  },
]

export default { meta, sections }
