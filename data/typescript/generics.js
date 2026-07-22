export const meta = {
  "title": "Generics",
  "domain": "typescript",
  "sheet": "generics",
  "icon": "🧬"
}

export const sections = [

  // ── Section 1: Generic Fundamentals ─────────────────────────────────────────
  {
    id: "generic-fundamentals",
    title: "Generic Fundamentals",
    entries: [
      {
        id: "generic-functions",
        fn: "Generic Functions",
        desc: "Functions that work over a variety of types while preserving the type relationship between inputs and outputs.",
        category: "Generic Fundamentals",
        subtitle: "Type-safe reusable functions",
        signature: "function fn<T>(arg: T): T",
        descLong: "Generics let you write functions that work with any type while maintaining type safety. The type parameter T is inferred from the argument at call time — no explicit annotation usually needed. You can have multiple type parameters and constrain them with extends.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction identity<T>(arg: T): T {\n  return arg;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Functions — common patterns you'll see in production.\n// APPROACH  - Combine Generic Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction pair<A, B>(a: A, b: B): [A, B] {\n  return [a, b];\n}\nfunction swap<T, U>(tuple: [T, U]): [U, T] {\n  return [tuple[1], tuple[0]];\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst id = identity<string>('hello'); // string\nconst p = pair(1, 'two');  // [1, 'two']"
                  }
        ],
        tips: [
                  "TypeScript usually infers T — only annotate when inference fails.",
                  "In .tsx files, write <T,> (trailing comma).",
                  "Use descriptive names for multiple params."
        ],
        mistake: "Using generics when any would work — if T isn't used in inputs and outputs, you might not need it.",
        shorthand: {
          verbose: "function identity<T>(arg: T): T {\n  return arg;\n}\nconst x = identity<string>('hello');",
          concise: "const identity = <T,>(arg: T): T => arg;\nconst x = identity('hello');",
        },
      },
      {
        id: "generic-arrow-functions",
        fn: "Generic Arrow Functions with JSX",
        desc: "Write generic arrow functions in .tsx files using trailing comma syntax to avoid JSX disambiguation.",
        category: "Generic Fundamentals",
        subtitle: "Arrow functions with type parameters in JSX",
        signature: "const fn = <T,>(arg: T): T => arg;",
        descLong: "In .tsx files, <T> at the start of an arrow function looks like a JSX tag to the parser. Add a trailing comma <T,> to disambiguate. This applies to arrow functions only — regular functions and methods don't have this issue. Essential for building type-safe higher-order components and utility functions in React.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Arrow Functions with JSX — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// ❌ In .tsx files, this looks like JSX\n// const identity = <T>(arg: T): T => arg;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Arrow Functions with JSX — common patterns you'll see in production.\n// APPROACH  - Combine Generic Arrow Functions with JSX with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// ✅ Use trailing comma in .tsx files\nconst identity = <T,>(arg: T): T => arg;\n// Works fine in .ts files (no ambiguity)\nconst identity2 = <T>(arg: T): T => arg;\n// Multiple type parameters\nconst pair = <A, B,>(a: A, b: B): [A, B] => [a, b];"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Arrow Functions with JSX — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Generic React hook in .tsx\nconst useArray = <T,>(initial: T[]): [T[], (item: T) => void] => {\n  const [arr, setArr] = React.useState(initial);\n  const add = (item: T) => setArr([...arr, item]);\n  return [arr, add];\n};\n// Higher-order component\nconst withGeneric = <T extends object,>(Component: React.FC<T>) => {\n  return (props: T) => <Component {...props} />;\n};"
                  }
        ],
        tips: [
                  "Only needed in .tsx files — use <T> in .ts files.",
                  "Trailing comma doesn't affect semantics — it's a syntax workaround.",
                  "Some editors auto-fix this — check your tsconfig and linter settings.",
                  "Generic constraints (T extends U) don't need trailing commas: <T extends U,> still works."
        ],
        mistake: "Forgetting the trailing comma in .tsx and seeing parse errors — always add <T,> for arrow functions in JSX files.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst identity = <T,>(arg: T): T => { return arg; };\n// More explicit but longer",
          concise: "const identity = <T,>(arg: T): T => arg;",
        },
      },
    ],
  },

  // ── Section 2: Utility Types ─────────────────────────────────────────
  {
    id: "utility-types",
    title: "Utility Types",
    entries: [
      {
        id: "mapped-types-utility",
        fn: "Mapped Types Deep Dive",
        desc: "Iterate over object keys and transform each property — create getters, setters, validators automatically.",
        category: "Utility Types",
        subtitle: "Transform types by iterating keys",
        signature: "type Getters<T> = { [K in keyof T as `get${Capitalize<K>}`]: () => T[K] }",
        descLong: "Mapped types ([K in keyof T]) iterate the keys of a type and create a new type. The value can reference T[K], and the key can be remapped using as. Used to create getters/setters, validators, readonly variants, and schema definitions from a single source type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mapped Types Deep Dive — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// User model\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  createdAt: Date;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mapped Types Deep Dive — common patterns you'll see in production.\n// APPROACH  - Combine Mapped Types Deep Dive with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Generate getter functions automatically\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\ntype UserGetters = Getters<User>;\n// {\n//   getId: () => string;\n//   getName: () => string;\n//   getEmail: () => string;\n//   getCreatedAt: () => Date;\n// }\n// Generate validators automatically\ntype Validators<T> = {\n  [K in keyof T]: (value: unknown) => value is T[K];\n};\nconst userValidators: Validators<User> = {\n  id: (v): v is string => typeof v === 'string',\n  name: (v): v is string => typeof v === 'string',\n  email: (v): v is string => typeof v === 'string',\n  createdAt: (v): v is Date => v instanceof Date,\n};\n// Filter out optional properties\ntype Required<T> = {\n  [K in keyof T]-?: T[K];\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mapped Types Deep Dive — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Add prefix to property names\ntype Prefixed<T, Prefix extends string> = {\n  [K in keyof T as `${Prefix}:${string & K}`]: T[K];\n};\ntype ApiUser = Prefixed<User, 'user'>;\n// { 'user:id': string; 'user:name': string; ... }\n// Remove properties matching a pattern\ntype OmitByType<T, U> = {\n  [K in keyof T as T[K] extends U ? never : K]: T[K];\n};\ntype UserWithoutDates = OmitByType<User, Date>;\n// { id: string; name: string; email: string }"
                  }
        ],
        tips: [
                  "The as clause remaps keys — use never to filter out certain keys.",
                  "keyof T returns the keys as a union — works with mapped types.",
                  "Capitalize, Uppercase, Lowercase, Uncapitalize are built-in transformers.",
                  "Recursive mapped types can cause compile-time complexity — be careful with deep nesting."
        ],
        mistake: "Expecting [K in keyof T] to work on unions — it works on the object type only. Wrap in a conditional to distribute over unions.",
        shorthand: {
          verbose: "type Getters<T> = {\n  [K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K];\n};",
          concise: "type Getters<T> = { [K in keyof T as \\`get${Capitalize<string & K>}\\`]: () => T[K]; };",
        },
      },
      {
        id: "conditional-types-distribution",
        fn: "Conditional Types & Distribution",
        desc: "Conditional types distribute over unions — T extends U ? X : Y applies to each member of T if T is a union.",
        category: "Utility Types",
        subtitle: "Type-level if/else with union distribution",
        signature: "type IsString<T> = T extends string ? true : false",
        descLong: "When T is a union in a conditional type, TypeScript applies the condition to each member separately, then unions the results. This is distributive behavior. Wrap T in a tuple [T] to prevent distribution and treat the union as a whole.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conditional Types & Distribution — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Distributive — applies to each member\ntype Flatten<T> = T extends any[] ? T[number] : T;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conditional Types & Distribution — common patterns you'll see in production.\n// APPROACH  - Combine Conditional Types & Distribution with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Str = Flatten<string>;        // string (not array, so T)\ntype Arr = Flatten<(string | number)[]>; // string | number (array, so T[number])\ntype Mixed = Flatten<string | number[]>;\n// = Flatten<string> | Flatten<number[]>\n// = string | number\n// Non-distributive — treats union as whole [wrapping prevents distribution]\ntype FlattenNonDist<T> = [T] extends [any[]] ? T[number] : T;\ntype TestDist = FlattenNonDist<string | number[]>;\n// = string | number[] (entire union doesn't extend array)\n// Real use: extract specific union members\ntype Extract<T, U> = T extends U ? T : never;\ntype Actions =\n  | { type: 'CREATE'; payload: string }\n  | { type: 'DELETE'; id: number }\n  | { type: 'UPDATE'; data: unknown };\ntype CreateAction = Extract<Actions, { type: 'CREATE' }>;\n// { type: 'CREATE'; payload: string }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conditional Types & Distribution — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Filter falsy types from a union\ntype Truthy<T> = T extends false | 0 | '' | null | undefined ? never : T;\ntype Value = Truthy<string | 0 | number | null>;\n// string | number (0, null removed)\n// Recursive conditional types\ntype DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends object\n    ? DeepReadonly<T[K]>\n    : T[K];\n};\ninterface Person {\n  name: string;\n  address: { city: string; zip: string };\n}\ntype ReadonlyPerson = DeepReadonly<Person>;\n// { readonly name: string; readonly address: { readonly city: string; readonly zip: string } }"
                  }
        ],
        tips: [
                  "Distributive behavior is the key to powerful type transformations.",
                  "Wrap in [] to prevent distribution when you need to check the entire type.",
                  "Most built-in types (Extract, Exclude) rely on distributive conditionals.",
                  "Recursive conditionals can be slow — use depth limits in practice."
        ],
        mistake: "Forgetting distribution — expecting Extract<string | number, string> to return just string, but it returns string (which is correct, not a mistake — but easy to misunderstand).",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Flatten<T> = T extends any[] ? T[number] : T;\ntype Mixed = Flatten<string | number[]>; // = string | number\n// More explicit but longer",
          concise: "type Flatten<T> = T extends any[] ? T[number] : T; // distributes over unions",
        },
      },
      {
        id: "generic-constraints-keyof",
        fn: "Generic Constraints with keyof",
        desc: "Use T extends keyof U to constrain T to be a valid key of another type parameter U.",
        category: "Utility Types",
        subtitle: "Type-safe property access in generics",
        signature: "function get<T, K extends keyof T>(obj: T, key: K): T[K]",
        descLong: "keyof T produces a union of T's keys. In a generic constraint T extends keyof U, T must be a valid key of U. This pattern enables type-safe property access where TypeScript knows exactly what type each property returns. Essential for building utility functions and ORM/query builders.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Constraints with keyof — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Type-safe object property getter\nfunction getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Constraints with keyof — common patterns you'll see in production.\n// APPROACH  - Combine Generic Constraints with keyof with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst user = { name: 'Alice', age: 30, email: 'alice@example.com' };\nconst name = getProperty(user, 'name');    // string\nconst age = getProperty(user, 'age');      // number\n// getProperty(user, 'phone');              // Error — 'phone' not a key\n// Database query builder with type-safe select\ninterface Schema {\n  users: { id: number; name: string; email: string };\n  posts: { id: number; title: string; body: string; authorId: number };\n}\nfunction query<T extends keyof Schema>(\n  table: T,\n  ...fields: (keyof Schema[T])[]\n) {\n  return { table, fields };\n}\nconst q1 = query('users', 'id', 'name');              // OK\n// const q2 = query('users', 'id', 'notAField');      // Error"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Constraints with keyof — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Mapped property getter — create getters for all properties\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\nfunction createGetters<T extends object>(obj: T): Getters<T> {\n  const getters = {} as Getters<T>;\n  for (const key in obj) {\n    const methodName = `get${key.charAt(0).toUpperCase()}${key.slice(1)}`;\n    (getters as any)[methodName] = () => obj[key];\n  }\n  return getters;\n}\nconst userGetters = createGetters({ name: 'Bob', age: 25 });\nuserGetters.getName();  // 'Bob'\nuserGetters.getAge();   // 25\n// Real Redux selector pattern\nfunction useSelector<T, K extends keyof T>(state: T, selector: (state: T) => T[K]): T[K] {\n  return selector(state);\n}\nconst appState = { user: { name: 'Alice' }, ui: { theme: 'dark' } };\nconst theme = useSelector(appState, (s) => s.ui.theme); // 'dark'"
                  }
        ],
        tips: [
                  "keyof T produces a union of T's property names as string literals.",
                  "T[K] in a return type makes TypeScript track the precise type of each property.",
                  "Combine with mapped types to generate types for all keys automatically.",
                  "keyof and T[K] are the foundation of type-safe ORM patterns."
        ],
        mistake: "Using keyof on a type parameter without extending it — K extends keyof T ensures K is a valid key before using T[K].",
        shorthand: {
          verbose: "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}",
          concise: "const getProperty = <T, K extends keyof T>(obj: T, key: K): T[K] => obj[key];",
        },
      },
      {
        id: "generic-classes",
        fn: "Generic Classes & Interfaces",
        desc: "Classes and interfaces with type parameters — build reusable containers, repositories, and services.",
        category: "Utility Types",
        subtitle: "Type-parameterized structures",
        signature: "class Container<T> { value: T }  |  interface Repo<T> { find(id: string): T }",
        descLong: "Generic classes and interfaces accept type parameters that flow through properties, methods, and return types. Used for collections, repositories, API clients, and state containers. You can constrain the type parameter (T extends Base) and provide defaults (T = unknown). Generic interfaces are common in dependency injection and plugin architectures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Classes & Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Generic repository pattern\ninterface Repository<T extends { id: string }> {\n  findById(id: string): Promise<T | null>;\n  findAll(filter?: Partial<T>): Promise<T[]>;\n  create(data: Omit<T, 'id'>): Promise<T>;\n  update(id: string, data: Partial<T>): Promise<T>;\n  delete(id: string): Promise<void>;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Classes & Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Generic Classes & Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Implementation for any entity\nclass InMemoryRepo<T extends { id: string }> implements Repository<T> {\n  private items: Map<string, T> = new Map();\n  async findById(id: string) { return this.items.get(id) ?? null; }\n  async findAll() { return [...this.items.values()]; }\n  async create(data: Omit<T, 'id'>) {\n    const item = { ...data, id: crypto.randomUUID() } as T;\n    this.items.set(item.id, item);\n    return item;\n  }\n  async update(id: string, data: Partial<T>) {\n    const existing = this.items.get(id);\n    if (!existing) throw new Error('Not found');\n    const updated = { ...existing, ...data };\n    this.items.set(id, updated);\n    return updated;\n  }\n  async delete(id: string) { this.items.delete(id); }\n}\n// Usage — fully typed\ninterface User { id: string; name: string; email: string }\nconst userRepo: Repository<User> = new InMemoryRepo<User>();\nconst user = await userRepo.create({ name: 'Alice', email: 'a@b.com' });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Classes & Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Generic result wrapper\nclass Result<T, E = Error> {\n  private constructor(\n    private readonly value?: T,\n    private readonly error?: E,\n  ) {}\n  static ok<T>(value: T) { return new Result<T>(value); }\n  static err<E>(error: E) { return new Result<never, E>(undefined, error); }\n  isOk(): boolean { return this.error === undefined; }\n  unwrap(): T {\n    if (this.error) throw this.error;\n    return this.value!;\n  }\n}"
                  }
        ],
        tips: [
                  "Constrain with T extends Base to guarantee minimum shape for type safety.",
                  "Default type parameters (T = unknown) make the generic optional at call sites.",
                  "Generic interfaces enable dependency injection — code against the interface, not the implementation.",
                  "Use Omit<T, \"id\"> for create methods to exclude auto-generated fields."
        ],
        mistake: "Making everything generic when a concrete type would be clearer — generics add complexity. Use them when the same logic genuinely applies to multiple types.",
        shorthand: {
          verbose: "class Repository<T extends { id: string }> {\n  async findById(id: string): Promise<T | null> { ... }\n}",
          concise: "class UserRepository extends Repository<User> { } // type-specific subclass",
        },
      },
      {
        id: "infer-keyword",
        fn: "infer Keyword",
        desc: "Extract types from within conditional types — pull out return types, argument types, or nested structures.",
        category: "Utility Types",
        subtitle: "Type-level pattern matching with infer",
        signature: "T extends Promise<infer U> ? U : T",
        descLong: "The infer keyword declares a type variable inside a conditional type — TypeScript infers its value from the matched pattern. Used to extract return types (ReturnType), parameter types (Parameters), promise inner types, array element types, and more. Multiple infer positions in one conditional are possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of infer Keyword — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract return type of a function\ntype MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of infer Keyword — common patterns you'll see in production.\n// APPROACH  - Combine infer Keyword with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Str = MyReturnType<() => string>;        // string\ntype Num = MyReturnType<(x: number) => number>; // number\n// Extract Promise inner type (unwrap)\ntype Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;\ntype Inner = Awaited<Promise<Promise<string>>>; // string\n// Extract first argument type\ntype FirstArg<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;\ntype Arg = FirstArg<(name: string, age: number) => void>; // string\n// Extract array element type\ntype ElementOf<T> = T extends (infer E)[] ? E : never;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of infer Keyword — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype El = ElementOf<string[]>;   // string\ntype El2 = ElementOf<[1, 'a']>; // 1 | 'a'\n// Extract object value types\ntype ValueOf<T> = T extends Record<string, infer V> ? V : never;\ntype Val = ValueOf<{ a: string; b: number }>; // string | number\n// Real-world: extract route params from a path pattern\ntype ExtractParams<T extends string> =\n  T extends `${string}:${infer Param}/${infer Rest}`\n    ? Param | ExtractParams<Rest>\n    : T extends `${string}:${infer Param}`\n    ? Param\n    : never;\ntype Params = ExtractParams<'/users/:userId/posts/:postId'>;\n// 'userId' | 'postId'\n// Built-in utility types that use infer:\ntype RT = ReturnType<typeof fetch>;       // Promise<Response>\ntype PT = Parameters<typeof setTimeout>;  // [callback: Function, ms?: number]\ntype CT = ConstructorParameters<typeof Date>; // various overloads"
                  }
        ],
        tips: [
                  "infer only works inside conditional types (T extends ... ? ... : ...).",
                  "Multiple infer positions extract multiple types from a single pattern.",
                  "Recursive infer types can parse string patterns — used in typed routers.",
                  "ReturnType, Parameters, InstanceType are all built on infer."
        ],
        mistake: "Using infer outside a conditional type — it is only valid in the extends clause of a conditional type expression.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\ntype Str = MyReturnType<() => string>; // string\n// More explicit but longer",
          concise: "type Str = ReturnType<() => string>; // built-in utility type",
        },
      },
      {
        id: "builtin-utility-types",
        fn: "Built-in Utility Types",
        desc: "TypeScript ships with Partial, Required, Pick, Omit, Record, Readonly, and more — use them before writing custom types.",
        category: "Utility Types",
        subtitle: "Standard type transformations",
        signature: "Partial<T> | Required<T> | Pick<T, K> | Omit<T, K> | Record<K, V>",
        descLong: "TypeScript includes ~20 built-in utility types for common transformations. Partial makes all properties optional (great for update payloads). Pick/Omit select or exclude properties. Record creates object types from key/value unions. Required makes all optional properties required. NonNullable removes null/undefined. These compose well together.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Built-in Utility Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  avatar?: string;\n  role: 'admin' | 'user';\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Built-in Utility Types — common patterns you'll see in production.\n// APPROACH  - Combine Built-in Utility Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Partial<T> — all properties optional (update payloads)\ntype UpdateUser = Partial<User>;\n// { id?: string; name?: string; email?: string; ... }\n// Required<T> — all properties required\ntype StrictUser = Required<User>;\n// avatar is now required\n// Pick<T, K> — select specific properties\ntype UserPreview = Pick<User, 'id' | 'name' | 'avatar'>;\n// Omit<T, K> — exclude specific properties\ntype CreateUser = Omit<User, 'id'>;\n// Record<K, V> — object with known key/value types\ntype Roles = Record<string, { permissions: string[] }>;\nconst roles: Roles = {\n  admin: { permissions: ['read', 'write', 'delete'] },\n  user: { permissions: ['read'] },\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Built-in Utility Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Readonly<T> — all properties readonly\ntype FrozenUser = Readonly<User>;\n// NonNullable<T> — remove null and undefined\ntype Name = NonNullable<string | null | undefined>; // string\n// ReturnType<T> — extract function return type\ntype FetchResult = ReturnType<typeof fetch>; // Promise<Response>\n// Composing utility types\ntype UserDTO = Readonly<Omit<User, 'role'>>;\ntype PatchPayload = Partial<Pick<User, 'name' | 'email' | 'avatar'>>;\n// Extract / Exclude — filter union members\ntype AdminRole = Extract<User['role'], 'admin'>; // 'admin'\ntype NonAdmin = Exclude<User['role'], 'admin'>;  // 'user'"
                  }
        ],
        tips: [
                  "Partial<T> + Pick<T, K> is a common pattern for typed update APIs.",
                  "Compose utilities: Readonly<Omit<T, \"id\">> chains transformations.",
                  "Record<string, T> replaces { [key: string]: T } with cleaner syntax.",
                  "Use Awaited<T> (TS 4.5+) to unwrap Promise<Promise<T>> to T."
        ],
        mistake: "Re-implementing Partial, Pick, or Omit by hand instead of using the built-in versions — the built-ins are optimized and well-tested.",
        shorthand: {
          verbose: "type UserUpdate = {\n  id?: string;\n  name?: string;\n  email?: string;\n  avatar?: string;\n};",
          concise: "type UserUpdate = Partial<User>; // all properties optional",
        },
      },
      {
        id: "generic-constraints",
        fn: "Generic Constraints",
        desc: "Constrain type parameters with extends to guarantee minimum structure — T extends U ensures T has all properties of U.",
        category: "Utility Types",
        subtitle: "Type parameter bounds and guarantees",
        signature: "function fn<T extends string>(arg: T): T  |  <T extends { length: number }>",
        descLong: "Generic constraints using extends enforce that a type parameter meets a minimum requirement. T extends string ensures T is a string or string literal. T extends object requires an object shape. T extends { length: number } requires a property. T extends keyof U links one parameter to another's keys. Constraints enable safer, more specific implementations and better IDE autocomplete.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Constraints — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Constrain to string literals\nfunction strLen<T extends string>(s: T): T {\n  return s;\n}\nconst s = strLen('hello'); // type: 'hello'\n// strLen(123); // Error"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Constraints — common patterns you'll see in production.\n// APPROACH  - Combine Generic Constraints with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Constrain to object with specific property\nfunction getLength<T extends { length: number }>(obj: T): number {\n  return obj.length;\n}\ngetLength('hello');        // OK\ngetLength([1, 2, 3]);      // OK\ngetLength({ length: 5 }); // OK\n// getLength(123);         // Error\n// Constrain to object type\nfunction copyObject<T extends object>(obj: T): T {\n  return { ...obj };\n}\n// Constrain with keyof\nfunction pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\ninterface User { name: string; age: number }\nconst user: User = { name: 'Alice', age: 30 };\nconst name = pluck(user, 'name'); // string\n// pluck(user, 'invalid');         // Error"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Constraints — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Multi-constraint with intersection\ntype HasIdAndName = { id: string } & { name: string };\nfunction process<T extends HasIdAndName>(obj: T): T {\n  return obj;\n}\n// Conditional constraint\nfunction isEqual<T extends string | number>(a: T, b: T): boolean {\n  return a === b;\n}"
                  }
        ],
        tips: [
                  "extends object is loose — functions, arrays, records all match.",
                  "keyof T in a constraint creates a dependency between type parameters.",
                  "Constraints improve error messages by catching mistakes early.",
                  "Multiple constraints use & : <T extends A & B>"
        ],
        mistake: "Using extends object when you need extends { [key: string]: any } — object is too broad for dictionaries.",
        shorthand: {
          verbose: "function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}",
          concise: "// K extends keyof T ensures K is a valid key of T",
        },
      },
      {
        id: "generic-defaults",
        fn: "Default Type Parameters",
        desc: "Provide default types for type parameters — <T = string> makes the parameter optional.",
        category: "Utility Types",
        subtitle: "Optional type parameters with defaults",
        signature: "<T = string>  |  <T = unknown>  |  <K extends keyof T = keyof T>",
        descLong: "Type parameters can have defaults using <T = DefaultType> syntax. When a generic is used without specifying the type, it falls back to the default. Defaults make generics more ergonomic — you don't need to specify every type parameter at call sites. Works with constraints: <T extends Base = DefaultImpl>.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Default Type Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple default\ntype Container<T = string> = {\n  value: T;\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Default Type Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Default Type Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst strContainer: Container = { value: 'hello' };      // T = string\nconst numContainer: Container<number> = { value: 42 };  // T = number\n// With constraints and defaults\ntype Handler<T extends Event = Event> = (event: T) => void;\nconst handleEvent: Handler = (e) => console.log(e); // T = Event\nconst handleClick: Handler<MouseEvent> = (e) => {   // T = MouseEvent\n  console.log(e.clientX);\n};\n// Multiple parameters with defaults\ntype Response<Data = unknown, Error = Error> = {\n  data?: Data;\n  error?: Error;\n};\ntype SuccessResponse = Response<User>; // Error = Error\ntype APIResponse = Response<User, ApiError>; // override both"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Default Type Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Default based on other parameter\ninterface Repo<Entity, Id = Entity['id']> {\n  findById(id: Id): Entity | null;\n}\ninterface User { id: string; name: string }\nconst userRepo: Repo<User> = {};           // Id = string (from User['id'])\nconst customRepo: Repo<User, number> = {}; // Id = number (override)\n// Generic function with default\nfunction createLogger<T = string>(prefix: T = '' as T): (msg: T) => void {\n  return (msg) => console.log(prefix, msg);\n}\nconst strLogger = createLogger();              // T = string\nconst numLogger = createLogger<number>(100);  // T = number"
                  }
        ],
        tips: [
                  "Defaults reduce boilerplate — use for commonly-used types like string, unknown, or Record<string, any>.",
                  "Defaults must be valid for any constraints — <T extends Base = Invalid> is an error.",
                  "Multiple defaults left-to-right: later defaults can reference earlier params.",
                  "Defaults are powerful in generic classes and utility type libraries."
        ],
        mistake: "Creating a default that violates the constraint — <T extends number = string> is invalid.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Container<T = string> = { value: T };\nconst c: Container = { value: 'hello' };\n// More explicit but longer",
          concise: "type Container<T = string> = { value: T };",
        },
      },
      {
        id: "conditional-generic",
        fn: "Conditional Types with Generics",
        desc: "Use conditional types (T extends U ? X : Y) inside generics — distributions over unions.",
        category: "Utility Types",
        subtitle: "Type-level branching with union distribution",
        signature: "T extends string ? true : false",
        descLong: "Conditional types with generics apply type-level if/else logic. When T is a union, conditions distribute — each member is tested separately. Wrap in [] to prevent distribution and test the entire union. Essential for building transformers, type predicates, and type-level pattern matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conditional Types with Generics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple conditional\ntype IsString<T> = T extends string ? true : false;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conditional Types with Generics — common patterns you'll see in production.\n// APPROACH  - Combine Conditional Types with Generics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype A = IsString<'hello'>;      // true\ntype B = IsString<number>;       // false\n// Distributive — each union member tested\ntype Flatten<T> = T extends any[] ? T[number] : T;\ntype X = Flatten<string>;           // string\ntype Y = Flatten<string | number[]>; // string | number (distributes)\n// Non-distributive — test entire union\ntype FlattenNonDist<T> = [T] extends [any[]] ? T[number] : T;\ntype Z = FlattenNonDist<string | number[]>; // string | number[]\n// Real use: extract promise inner type\ntype Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T;\ntype P = Unwrap<Promise<Promise<string>>>; // string"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conditional Types with Generics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Nested conditionals\ntype GetType<T> = T extends string\n  ? 'string'\n  : T extends number\n  ? 'number'\n  : T extends boolean\n  ? 'boolean'\n  : 'other';\ntype S = GetType<'test'>;  // 'string'\ntype N = GetType<42>;      // 'number'\n// Conditional with generics in class methods\nclass TypeguardHandler<T> {\n  handle<U extends T>(value: U): U extends string ? string : U {\n    return value as any;\n  }\n}\n// Union distribution example\ntype Actions = { type: 'CREATE'; id: string } | { type: 'DELETE'; id: number };\ntype ExtractCreateAction<T extends Actions> = T extends { type: 'CREATE' }\n  ? T\n  : never;\ntype Create = ExtractCreateAction<Actions>; // { type: 'CREATE'; id: string }"
                  }
        ],
        tips: [
                  "Distributive conditionals are powerful but can be surprising — wrap in [] to control distribution.",
                  "Use infer to extract types from patterns: T extends Array<infer E> ? E : never.",
                  "Recursive conditionals can validate deeply — common in typed parser combinators.",
                  "Conditional types can make compilation slower — monitor TypeScript build times."
        ],
        mistake: "Forgetting that conditionals distribute — T extends U ? A : B applies to each member if T is a union.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Flatten<T> = T extends any[] ? T[number] : T;\n// More explicit but longer",
          concise: "// Conditionals distribute over unions by default",
        },
      },
      {
        id: "generic-class",
        fn: "Generic Classes",
        desc: "Classes with type parameters — build type-safe containers, repositories, and state managers.",
        category: "Utility Types",
        subtitle: "Parameterized classes and inheritance",
        signature: "class Stack<T> { push(item: T): void; pop(): T | undefined }",
        descLong: "Generic classes accept type parameters that flow through properties, methods, and constructors. Type parameters are inherited by subclasses. Static members cannot reference instance type parameters. Used for collections (Stack, Queue), repositories, observers, and DI containers. Constraints can enforce minimum structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Simple generic stack\nclass Stack<T> {\n  private items: T[] = [];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Classes — common patterns you'll see in production.\n// APPROACH  - Combine Generic Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\npush(item: T): void {\n    this.items.push(item);\n  }\n  pop(): T | undefined {\n    return this.items.pop();\n  }\n  peek(): T | undefined {\n    return this.items[this.items.length - 1];\n  }\n}\nconst numStack = new Stack<number>();\nnumStack.push(1);\nnumStack.push(2);\nconst val = numStack.pop(); // number | undefined\n// Generic observer pattern\nclass EventEmitter<Events extends Record<string, any>> {\n  private listeners: Map<keyof Events, ((data: any) => void)[]> = new Map();\n  on<K extends keyof Events>(event: K, listener: (data: Events[K]) => void): void {\n    if (!this.listeners.has(event)) this.listeners.set(event, []);\n    this.listeners.get(event)!.push(listener);\n  }\n  emit<K extends keyof Events>(event: K, data: Events[K]): void {\n    this.listeners.get(event)?.forEach(l => l(data));\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface MyEvents {\n  login: { userId: string };\n  logout: void;\n}\nconst emitter = new EventEmitter<MyEvents>();\nemitter.on('login', (data) => console.log(data.userId)); // string\nemitter.emit('login', { userId: '123' });\n// Generic constrained to objects with id\nclass Repository<T extends { id: string }> {\n  protected items: Map<string, T> = new Map();\n  async save(item: T): Promise<void> {\n    this.items.set(item.id, item);\n  }\n  async findById(id: string): Promise<T | null> {\n    return this.items.get(id) ?? null;\n  }\n}\n// Subclass — type parameter flows down\ninterface User extends { id: string } {\n  name: string;\n}\nclass UserRepository extends Repository<User> {\n  async findByName(name: string): Promise<User | null> {\n    for (const user of this.items.values()) {\n      if (user.name === name) return user;\n    }\n    return null;\n  }\n}"
                  }
        ],
        tips: [
                  "Static members cannot reference instance type parameters — use class methods instead.",
                  "Type parameters flow through inheritance — subclasses inherit the parent's type parameter.",
                  "Constrain with T extends Base to guarantee structure inside the class.",
                  "Generic classes are powerful in Observer, Repository, and Container patterns."
        ],
        mistake: "Trying to use T in static methods — static members are shared across all instances, so the type parameter is inaccessible.",
        shorthand: {
          verbose: "class Stack<T> {\n  push(item: T) { ... }\n  pop(): T | undefined { ... }\n}",
          concise: "class Stack<T> { /* type-safe stack implementation */ }",
        },
      },
      {
        id: "infer-generics",
        fn: "Infer in Generic Constraints",
        desc: "Use infer inside generic constraints to extract and use type information — powerful pattern for custom utilities.",
        category: "Utility Types",
        subtitle: "Pattern matching in generic constraints",
        signature: "T extends { items: infer U[] } ? U : never",
        descLong: "infer allows extracting type information from within a constraint. When combined with generics, it enables type-level pattern matching. Extract element types from arrays, return types from functions, properties from objects. Common in building custom utility types and complex type transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Infer in Generic Constraints — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract element type from array\ntype ElementType<T> = T extends (infer E)[] ? E : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Infer in Generic Constraints — common patterns you'll see in production.\n// APPROACH  - Combine Infer in Generic Constraints with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Num = ElementType<number[]>; // number\n// Extract return type with generics\ntype GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\nconst myFunc = (x: number): string => x.toString();\ntype RT = GetReturnType<typeof myFunc>; // string\n// Extract nested types\ntype GetPromiseInner<T> = T extends Promise<infer U>\n  ? U extends Promise<infer V>\n    ? V\n    : U\n  : T;\ntype P1 = GetPromiseInner<Promise<string>>; // string\ntype P2 = GetPromiseInner<Promise<Promise<number>>>; // number\n// Extract properties of a specific type\ntype ExtractByType<T, U> = T extends (infer K extends keyof any) ? T[K] extends U ? K : never : never;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Infer in Generic Constraints — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface Data {\n  name: string;\n  age: number;\n  active: boolean;\n}\ntype StringKeys = {\n  [K in keyof Data]: Data[K] extends string ? K : never;\n}[keyof Data]; // 'name'\n// Build custom utilities — extract first argument\ntype FirstParam<T> = T extends (first: infer P, ...rest: any[]) => any ? P : never;\nfunction myHook(x: string, y: number) { return x + y; }\ntype FP = FirstParam<typeof myHook>; // string\n// Real use: Extract shape from constructor\ntype ExtractInstance<T> = T extends new (...args: any[]) => infer I ? I : never;\nclass User { name: string = 'Alice'; }\ntype UserInstance = ExtractInstance<typeof User>; // User"
                  }
        ],
        tips: [
                  "infer only works in conditional types — T extends Pattern ? infer : ...",
                  "Multiple infer positions in one condition are allowed.",
                  "Use infer with recursion to extract deeply nested types.",
                  "Common pattern: infer U[] then recursively call to get the inner type."
        ],
        mistake: "Using infer outside of conditional types — syntax error. infer is only valid in extends branches.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;\n// More explicit but longer",
          concise: "// Use infer in conditionals to extract types from patterns",
        },
      },
      {
        id: "mapped-generic",
        fn: "Mapped Generic Types",
        desc: "Combine mapped types with generics — transform every property of a type in generic contexts.",
        category: "Utility Types",
        subtitle: "Iterating and transforming generic properties",
        signature: "type Nullable<T> = { [K in keyof T]: T[K] | null }",
        descLong: "Mapped types ([K in keyof T]) work perfectly inside generics. Iterate over keys, transform values, rename keys, filter properties. Create getters/setters, validators, readonly variants, and schema definitions. Combine with conditional types for advanced transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mapped Generic Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Make every property nullable\ntype Nullable<T> = {\n  [K in keyof T]: T[K] | null;\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mapped Generic Types — common patterns you'll see in production.\n// APPROACH  - Combine Mapped Generic Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface User { name: string; age: number }\ntype NullableUser = Nullable<User>;\n// { name: string | null; age: number | null }\n// Create getters for all properties\ntype Getters<T> = {\n  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];\n};\nconst userGetters: Getters<User> = {\n  getName: () => 'Alice',\n  getAge: () => 30,\n};\n// Create validators\ntype Validators<T> = {\n  [K in keyof T]: (val: unknown) => val is T[K];\n};\nconst userValidators: Validators<User> = {\n  name: (v): v is string => typeof v === 'string',\n  age: (v): v is number => typeof v === 'number',\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mapped Generic Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Filter properties by type\ntype OnlyStrings<T> = {\n  [K in keyof T as T[K] extends string ? K : never]: T[K];\n};\ntype StringProps = OnlyStrings<User>; // { name: string }\n// Deep transform\ntype ReadonlyDeep<T> = {\n  readonly [K in keyof T]: T[K] extends object ? ReadonlyDeep<T[K]> : T[K];\n};\ninterface Config {\n  api: { url: string; timeout: number };\n  db: { host: string };\n}\ntype FrozenConfig = ReadonlyDeep<Config>;"
                  }
        ],
        tips: [
                  "as in mapped types remaps keys — use never to filter.",
                  "Capitalize, Uppercase, Lowercase transform key names.",
                  "Combine with conditional types to filter by value type.",
                  "Recursive mapped types can impact build time — use with caution."
        ],
        mistake: "Trying to use mapped types on unions — mapped types work on object types, not unions. Use conditional types to distribute first.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Nullable<T> = { [K in keyof T]: T[K] | null };\n// More explicit but longer",
          concise: "// Mapped types iterate keys and transform values",
        },
      },
      {
        id: "generic-tuple",
        fn: "Generic Tuples & Rest Elements",
        desc: "Generic tuple types with rest elements — extract heads, build pipelines, type variadic functions.",
        category: "Utility Types",
        subtitle: "Type-safe tuple manipulation",
        signature: "type Head<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never",
        descLong: "Tuples in generics allow precise typing of fixed-length arrays. Rest elements (...T[]) capture variable-length portions. Extract first, rest, reverse order, flatten. Build type-safe function pipelines, decorators, and middleware chains. Works with infer for powerful pattern matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Tuples & Rest Elements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Extract first element\ntype Head<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Tuples & Rest Elements — common patterns you'll see in production.\n// APPROACH  - Combine Generic Tuples & Rest Elements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype H = Head<[string, number, boolean]>; // string\n// Extract rest (all but first)\ntype Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : [];\ntype T = Tail<[string, number, boolean]>; // [number, boolean]\n// Reverse tuple\ntype Reverse<T extends unknown[]> = T extends [infer First, ...infer Rest]\n  ? [...Reverse<Rest>, First]\n  : [];\ntype Rev = Reverse<[1, 2, 3]>; // [3, 2, 1]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Tuples & Rest Elements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Variadic function parameters\ntype Concat = <T extends unknown[], U extends unknown[]>(\n  arr1: T,\n  arr2: U\n) => [...T, ...U];\nconst concat: Concat = (a, b) => [...a, ...b];\nconst result = concat([1, 2], ['a', 'b']); // [1, 2, 'a', 'b']\n// Build a function pipe\ntype Pipe<T extends unknown[]> = T extends [\n  (x: infer A) => infer B,\n  ...(infer Rest extends ((x: any) => any)[])\n]\n  ? [(x: A) => Pipe<[...Rest]>[0] extends (x: any) => infer C ? C : B]\n  : T;\n// Convert promise array to resolved types\ntype Resolved<T extends Promise<any>[]> = {\n  [K in keyof T]: T[K] extends Promise<infer U> ? U : never;\n};\ntype P = Resolved<[Promise<string>, Promise<number>]>;\n// [string, number]"
                  }
        ],
        tips: [
                  "Rest elements must come last in tuples: [first, ...rest] not [...rest, last].",
                  "infer with rest is powerful: [infer H, ...infer T] splits head/tail.",
                  "Variadic tuples enable type-safe function composition.",
                  "Reverse, Head, Tail are common tuple utility patterns."
        ],
        mistake: "Trying to extract types from tuples without rest — use [...infer Rest] to capture remaining elements.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Head<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;\n// More explicit but longer",
          concise: "// Rest elements capture variable-length portions of tuples",
        },
      },
      {
        id: "covariance-contravariance",
        fn: "Covariance & Contravariance",
        desc: "Variance in type systems — covariant return types, contravariant parameters, function assignability rules.",
        category: "Utility Types",
        subtitle: "Type relationship and substitution rules",
        signature: "Dog extends Animal => (arg: Animal) => Derived not assignable to (arg: Dog) => Base",
        descLong: "Covariance and contravariance define how subtypes relate in different contexts. Return types are covariant (Dog extends Animal, so returning Dog is safe where Animal is expected). Parameter types are contravariant (a function accepting Animal can replace one accepting Dog). Understanding variance explains assignment errors and method overrides. Essential for callback and function typing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Covariance & Contravariance — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Covariant return types (OK in inheritance)\nclass Animal {\n  move() { console.log('moving'); }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Covariance & Contravariance — common patterns you'll see in production.\n// APPROACH  - Combine Covariance & Contravariance with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass Dog extends Animal {\n  bark() { console.log('woof'); }\n}\nclass AnimalCareTaker {\n  getAnimal(): Animal {\n    return new Animal();\n  }\n}\nclass DogCareTaker extends AnimalCareTaker {\n  // OK: Dog is subtype of Animal (covariant return)\n  getAnimal(): Dog {\n    return new Dog();\n  }\n}\n// Contravariant parameters\ntype Handler<T> = (arg: T) => void;\nconst handleAnimal: Handler<Animal> = (a) => a.move();\nconst handleDog: Handler<Dog> = (d) => d.bark();\nconst fn1: Handler<Animal> = handleAnimal; // OK\n// const fn2: Handler<Dog> = handleAnimal; // Error: contravariant\n// Why: if you assign handleAnimal to a function expecting Handler<Dog>,\n// and then call it with a Dog, the function might only expect Animal\n// Function variance — parameter contravariance\ninterface Processor {\n  process(input: Dog): void;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Covariance & Contravariance — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass GeneralProcessor implements Processor {\n  process(input: Animal): void {\n    input.move(); // OK for any Animal\n  }\n}\nconst p: Processor = new GeneralProcessor(); // OK (contravariant params)\n// Array covariance\ntype AnimalArray = Animal[];\ntype DogArray = Dog[];\n// Dog[] does NOT extend Animal[] (invariant in strict mode)\nconst dogs: Dog[] = [new Dog()];\nconst animals: Animal[] = dogs; // OK in loose mode, risky!\n// Generic variance annotation (using in/out in TS 4.7+)\ninterface Producer<out T> {\n  produce(): T;\n}\ninterface Consumer<in T> {\n  consume(item: T): void;\n}\nconst dogProducer: Producer<Dog> = { produce: () => new Dog() };\nconst animalProducer: Producer<Animal> = dogProducer; // OK (out = covariant)\nconst animalConsumer: Consumer<Animal> = { consume: (a) => a.move() };\nconst dogConsumer: Consumer<Dog> = animalConsumer; // OK (in = contravariant)"
                  }
        ],
        tips: [
                  "Functions are contravariant in parameters, covariant in return types.",
                  "Arrays are invariant (not truly covariant) — assigning Dog[] to Animal[] is unsafe.",
                  "Generic in/out annotations (TS 4.7+) make variance explicit.",
                  "Variance issues cause \"not assignable\" errors in callbacks and inheritance."
        ],
        mistake: "Assuming Dog[] is assignable to Animal[] — arrays are invariant. Use readonly T[] or Array<Dog | Cat> for true covariance.",
        shorthand: {
          verbose: "interface Handler<T> { (arg: T): void }\nconst h: Handler<Animal> = (a) => a.move();\n// const h2: Handler<Dog> = h; // Error: contravariant",
          concise: "// Parameters are contravariant, returns are covariant",
        },
      },
    ],
  },
]

export default { meta, sections }
