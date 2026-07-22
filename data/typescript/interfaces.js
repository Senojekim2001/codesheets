export const meta = {
  "title": "Interfaces & Type Aliases",
  "domain": "typescript",
  "sheet": "interfaces",
  "icon": "📐"
}

export const sections = [

  // ── Section 1: Interfaces & Type Aliases ─────────────────────────────────────────
  {
    id: "interfaces-type-aliases",
    title: "Interfaces & Type Aliases",
    entries: [
      {
        id: "interface-basics",
        fn: "interface",
        desc: "Defines the shape of an object — properties, methods, optional fields, and readonly constraints.",
        category: "Interfaces & Type Aliases",
        subtitle: "Named object shape contracts",
        signature: "interface Name { prop: type; method(): return; }",
        descLong: "Interfaces describe the shape of an object — what properties and methods it must have. They support optional properties (?), readonly modifiers, index signatures, and method signatures. Interfaces are open — you can add properties to them later via declaration merging. Prefer interfaces over type aliases for object shapes in public API.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of interface — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// API response type — readonly ID prevents accidental mutation\ninterface UserProfile {\n  readonly id: string;        // from database\n  name: string;\n  email: string;\n  avatar?: string;            // optional from API\n  role: 'admin' | 'user';\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of interface — common patterns you'll see in production.\n// APPROACH  - Combine interface with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Form submission sends partial data\ninterface UpdateUserInput {\n  name?: string;              // only these fields required\n  email?: string;\n  avatar?: string;\n}\n// HTTP handler receives typed request/response\nasync function handleProfileUpdate(\n  userId: string,\n  input: UpdateUserInput\n): Promise<UserProfile> {\n  const profile: UserProfile = {\n    id: userId,\n    name: input.name || 'Unknown',\n    email: input.email || '',\n    role: 'user',\n  };\n  return profile; // TS prevents forgetting readonly id\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of interface — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Index signature for HTTP headers (all string keys)\ninterface HeaderMap {\n  [key: string]: string | string[];\n}\nconst headers: HeaderMap = {\n  'content-type': 'application/json',\n  'set-cookie': ['a=1', 'b=2'],\n};"
                  }
        ],
        tips: [
                  "readonly prevents reassignment of the property after object creation.",
                  "Optional props (?) are T | undefined — don't confuse with a required prop of type T | undefined.",
                  "Index signatures allow any key of the specified type — all explicit props must match the value type.",
                  "Prefer interfaces over type aliases when defining object shapes for better error messages."
        ],
        mistake: "Marking a prop readonly thinking it deeply freezes the value — readonly only prevents reassigning the property reference. The object itself can still be mutated.",
        shorthand: {
          verbose: "interface Config {\n  readonly apiUrl: string;\n  readonly timeout: number;\n  readonly retries: number;\n}",
          concise: "interface Config { readonly apiUrl: string; readonly timeout: number; readonly retries: number; }",
        },
      },
      {
        id: "interface-extends",
        fn: "interface extends",
        desc: "Extends one or more interfaces to build a new interface with all inherited members.",
        category: "Interfaces & Type Aliases",
        subtitle: "Composing interfaces with inheritance",
        signature: "interface Child extends Parent, Mixin { }",
        descLong: "An interface can extend multiple other interfaces, inheriting all their members. The extending interface can override inherited properties with a narrower (more specific) type. extends is for interface-to-interface inheritance; implements is for classes adopting an interface.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of interface extends — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface Entity {\n  id: string;\n  createdAt: Date;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of interface extends — common patterns you'll see in production.\n// APPROACH  - Combine interface extends with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface Nameable {\n  name: string;\n}\n// Extend multiple interfaces\ninterface User extends Entity, Nameable {\n  email: string;\n  role: 'admin' | 'user';\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of interface extends — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Must implement ALL properties\nconst user: User = {\n  id: '1',\n  createdAt: new Date(),\n  name: 'Alice',\n  email: 'alice@example.com',\n  role: 'admin',\n};\n// Class implementing an interface\nclass UserService implements User {\n  id = '1';\n  createdAt = new Date();\n  name = 'Service';\n  email = 'svc@example.com';\n  role = 'admin' as const;\n}"
                  }
        ],
        tips: [
                  "extends for interfaces builds a new type; implements for classes enforces a contract.",
                  "A class can implement multiple interfaces: class Foo implements A, B { }.",
                  "Override inherited properties with a narrower type: admin: true (not boolean) to narrow.",
                  "Use abstract classes when you need shared implementation; interfaces for pure shape contracts."
        ],
        mistake: "Using implements on an interface when you mean extends — implements is a class keyword that enforces a contract. Interfaces use extends to inherit from other interfaces.",
        shorthand: {
          verbose: "interface Animal { name: string; age: number; }\ninterface Dog {\n  name: string;\n  age: number;\n  breed: string;\n  bark(): void;\n}",
          concise: "interface Animal { name: string; age: number; }\ninterface Dog extends Animal {\n  breed: string;\n  bark(): void;\n}",
        },
      },
      {
        id: "declaration-merging",
        fn: "Declaration Merging",
        desc: "Multiple interface declarations with the same name are merged into one — unique to interfaces.",
        category: "Interfaces & Type Aliases",
        subtitle: "Extend existing interfaces in separate files",
        signature: "interface Window { myLib: MyLib }  // adds to existing Window",
        descLong: "TypeScript merges multiple declarations of the same interface name. This enables augmenting built-in types (Window, Array, Request) or third-party library interfaces without modifying their source. Type aliases cannot be merged — a key reason to use interfaces for public APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Declaration Merging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Augment Express Request with custom properties\n// types/express.d.ts\ndeclare global {\n  namespace Express {\n    interface Request {\n      user?: { id: string; role: string };\n    }\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Declaration Merging — common patterns you'll see in production.\n// APPROACH  - Combine Declaration Merging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Now req.user is typed in all Express handlers\napp.get('/profile', (req, res) => {\n  req.user?.id; // typed!\n});\n// Augment Window\ninterface Window {\n  analytics: { track: (event: string) => void };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Declaration Merging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Augment an array\ninterface Array<T> {\n  first(): T | undefined;\n}\nArray.prototype.first = function() { return this[0]; };"
                  }
        ],
        tips: [
                  "Create a *.d.ts file for augmentations — keeps them separate from runtime code.",
                  "Use declare global {} to augment global interfaces inside a module.",
                  "Module augmentation uses declare module \"package\" {} to add types to third-party libs.",
                  "Type aliases don't merge — redeclaring a type alias is always an error."
        ],
        mistake: "Trying to augment a type alias — only interfaces support declaration merging. If a library exports a type alias, you may need to re-export it as an interface.",
        shorthand: {
          verbose: "// types/express.d.ts\ndeclare global {\n  namespace Express {\n    interface Request {\n      user?: { id: string; role: string };\n    }\n  }\n}",
          concise: "declare module 'express' { interface Request { user?: { id: string; role: string }; } }",
        },
      },
      {
        id: "type-alias",
        fn: "type",
        desc: "Creates a named alias for any type — primitives, unions, intersections, functions, and more.",
        category: "Interfaces & Type Aliases",
        subtitle: "Name any type expression",
        signature: "type Name = TypeExpression",
        descLong: "type creates a named alias for any type expression — not just objects. Use it for unions, intersections, function signatures, conditional types, and mapped types. Unlike interfaces, type aliases can't be extended after declaration (no declaration merging). For object shapes exposed in a public API, prefer interface.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of type — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Form state — union of possible states\ntype FormState = 'idle' | 'submitting' | 'success' | 'error';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of type — common patterns you'll see in production.\n// APPROACH  - Combine type with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// API response variants — discriminated by status\ntype ApiResponse<T> =\n  | { status: 'pending' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: string };\n// Event handler for DOM events\ntype InputHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;\ntype SubmitHandler = (data: FormData) => Promise<void>;\n// Fetch function shape — used across API calls\ntype FetchConfig = {\n  url: string;\n  method: 'GET' | 'POST' | 'PUT';\n  headers?: Record<string, string>;\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of type — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Recursively handle JSON from API\ntype JSONValue =\n  | string | number | boolean | null\n  | JSONValue[]\n  | { [key: string]: JSONValue };\n// Usage in component\nfunction renderApiResponse<T>(resp: ApiResponse<T>) {\n  if (resp.status === 'success') return resp.data;\n  if (resp.status === 'error') return resp.error;\n  return 'Loading...';\n}"
                  }
        ],
        tips: [
                  "Use type for unions, intersections, function types, and complex computed types.",
                  "Use interface for object shapes in APIs — better error messages and supports merging.",
                  "Recursive types (JSONValue) are only possible with type aliases, not interfaces.",
                  "Branded types (string & { brand }) create nominal typing in TypeScript's structural system."
        ],
        mistake: "Using type for everything including simple object shapes in a library — interfaces are better there because consumers can augment them. Mix both based on use case.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype ApiResponse<T> = { status: 'pending' } | { status: 'success'; data: T } | { status: 'error'; error: string };\n// More explicit but longer",
          concise: "type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; error: string };",
        },
      },
      {
        id: "overload-signatures",
        fn: "Function Overloads",
        desc: "Define multiple call signatures for a function so TypeScript can narrow the return type based on argument types.",
        category: "Interfaces & Type Aliases",
        subtitle: "Multiple typed call signatures",
        signature: "function fn(x: string): string\nfunction fn(x: number): number\nfunction fn(x: any): any { }",
        descLong: "Overloads define multiple public signatures followed by one implementation signature. TypeScript uses the overload signatures (not the implementation) for type checking. The implementation must be compatible with all overloads. Overloads are the correct tool when the return type depends on the input type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Overloads — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Overloads — return type depends on input type\nfunction parse(input: string): string[];\nfunction parse(input: number): number;\nfunction parse(input: string | number): string[] | number {\n  if (typeof input === 'string') return input.split(',');\n  return input * 2;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Overloads — common patterns you'll see in production.\n// APPROACH  - Combine Function Overloads with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst arr = parse('a,b,c'); // type: string[]\nconst num = parse(21);      // type: number\n// Interface with call signatures\ninterface Parser {\n  (input: string): string[];\n  (input: number): number;\n  version: string; // additional property\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Overloads — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Overloads in a class\nclass EventEmitter {\n  on(event: 'click', handler: (e: MouseEvent) => void): void;\n  on(event: 'keydown', handler: (e: KeyboardEvent) => void): void;\n  on(event: string, handler: (e: Event) => void): void {\n    // implementation\n  }\n}"
                  }
        ],
        tips: [
                  "Put more specific overloads first — TypeScript matches the first compatible overload.",
                  "The implementation signature is not visible to callers — keep it as wide as needed.",
                  "Prefer union types for simple cases; use overloads when the return type truly varies.",
                  "Generic functions often eliminate the need for overloads."
        ],
        mistake: "Adding the implementation signature to the public overloads — the implementation signature is not callable from outside. Only the overload signatures are.",
        shorthand: {
          verbose: "function parse(input: string): string[];\nfunction parse(input: number): number;\nfunction parse(input: string | number): string[] | number { ... }",
          concise: "const parse = (input: string | number): string[] | number => typeof input === 'string' ? input.split(',') : input * 2;",
        },
      },
      {
        id: "function-type-aliases",
        fn: "Function Type Aliases",
        desc: "Name function signatures with type aliases for reuse across parameters, properties, and variables.",
        category: "Interfaces & Type Aliases",
        subtitle: "Reusable named function signatures",
        signature: "type Handler = (event: Event) => void",
        descLong: "Function type aliases name a function signature for reuse. They can be generic, have optional parameters, and use rest parameters. Use type (not interface) for function types — though interface with a call signature is valid for hybrid types (callable + properties).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Type Aliases — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Validation function — check if item passes test\ntype Validator<T> = (item: T) => boolean;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Type Aliases — common patterns you'll see in production.\n// APPROACH  - Combine Function Type Aliases with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Transform function — convert API response\ntype Transformer<Input, Output> = (data: Input) => Output;\n// Event callback — handle user interactions\ntype ClickHandler = (e: React.MouseEvent<HTMLButtonElement>) => void;\n// Reuse validators across the codebase\nconst isEmailValid: Validator<string> = (email) =>\n  /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Type Aliases — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst isAgeValid: Validator<number> = (age) => age >= 18 && age <= 120;\n// Form validation — use validators on fields\nfunction validateForm(\n  email: string,\n  age: number,\n  validators: { email: Validator<string>; age: Validator<number> }\n) {\n  return {\n    email: validators.email(email),\n    age: validators.age(age),\n  };\n}\n// Reducer in Redux store — named reusable signature\ntype Reducer<State, Action> = (state: State, action: Action) => State;"
                  }
        ],
        tips: [
                  "Generic function types make utilities reusable: type Mapper<A, B> = (a: A) => B.",
                  "Use interface with a call signature for hybrid types (callable + properties).",
                  "Parameters<T> and ReturnType<T> extract parts of a function type alias.",
                  "Avoid naming function types as verbs — prefer nouns: Predicate not Predicates."
        ],
        mistake: "Re-declaring the same function signature in multiple places instead of creating a named type alias — changes must be made in multiple locations.",
        shorthand: {
          verbose: "function validate1(item: unknown): boolean { ... }\nfunction validate2(item: unknown): boolean { ... }\nfunction validate3(item: unknown): boolean { ... }",
          concise: "type Validator<T> = (item: T) => boolean;\nconst validate: Validator<unknown> = (item) => true;",
        },
      },
      {
        id: "readonly-types",
        fn: "Readonly Collections",
        desc: "ReadonlyArray<T>, ReadonlyMap<K,V>, and ReadonlySet<T> prevent mutation of collection types.",
        category: "Interfaces & Type Aliases",
        subtitle: "Immutable collection types",
        signature: "ReadonlyArray<T>  |  readonly T[]  |  ReadonlyMap<K, V>",
        descLong: "TypeScript has readonly variants of Array, Map, and Set that remove all mutating methods (.push, .set, .add, .delete, .clear). Use them as parameter types to communicate intent — the function promises not to modify the passed collection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Readonly Collections — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Function that only reads from an array\nfunction sum(nums: readonly number[]): number {\n  return nums.reduce((a, b) => a + b, 0);\n}\n// Equivalent: ReadonlyArray<number>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Readonly Collections — common patterns you'll see in production.\n// APPROACH  - Combine Readonly Collections with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst arr = [1, 2, 3];\nsum(arr); // OK — mutable arrays assignable to readonly\n// ReadonlyMap and ReadonlySet\nfunction lookupRole(roles: ReadonlyMap<string, string>, id: string) {\n  return roles.get(id); // .set() and .delete() not available\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Readonly Collections — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Readonly in interfaces\ninterface Config {\n  readonly apiUrl: string;\n  readonly timeout: number;\n}\n// Deep readonly with utility type\ntype DeepReadonly<T> = {\n  readonly [K in keyof T]: T[K] extends object\n    ? DeepReadonly<T[K]>\n    : T[K];\n};"
                  }
        ],
        tips: [
                  "Accept readonly parameters in functions to communicate \"I won't mutate this\".",
                  "Mutable arrays/maps are assignable to their readonly counterparts — no cast needed.",
                  "readonly T[] and ReadonlyArray<T> are identical — prefer the shorthand.",
                  "Readonly<T> makes all top-level properties readonly — use DeepReadonly for nested."
        ],
        mistake: "Mutating an array parameter inside a function when the caller doesn't expect it — annotate the param as readonly to make the contract explicit.",
        shorthand: {
          verbose: "function sum(nums: number[]): number { // caller expects num to stay unchanged\n  nums.push(0); // oops, mutated\n  return nums.reduce((a, b) => a + b, 0);\n}",
          concise: "function sum(nums: readonly number[]): number { // compiler prevents mutation\n  return nums.reduce((a, b) => a + b, 0);\n}",
        },
      },
      {
        id: "hybrid-types",
        fn: "Hybrid Types (Callable + Properties)",
        desc: "An interface that is both callable (function) and has properties — function with added methods.",
        category: "Interfaces & Type Aliases",
        subtitle: "Function interface with properties",
        signature: "interface Parser { (input: string): T; version: string; }",
        descLong: "A hybrid type is an interface that acts as both a function and an object — it has call signature(s) and also properties/methods. Used for constructors that also have static properties, functions with attached utility methods, or class-like factories. Type aliases cannot express hybrid types — only interfaces can.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Hybrid Types (Callable + Properties) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// jQuery-style — function with attached methods\ninterface QueryInterface {\n  (selector: string): Element[];\n  version: string;\n  extend(obj: Record<string, any>): void;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Hybrid Types (Callable + Properties) — common patterns you'll see in production.\n// APPROACH  - Combine Hybrid Types (Callable + Properties) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst $: QueryInterface = ((selector: string) => {\n  return document.querySelectorAll(selector) as any;\n}) as QueryInterface;\n$.version = '1.0.0';\n$.extend = (obj) => { /* merge */ };\n$('.button'); // callable\n$.version;    // property\n// Factory function with metadata\ninterface Factory<T> {\n  (data: unknown): T;\n  schema: { [K in keyof T]: string };\n  validate(value: unknown): value is T;\n}\nconst userFactory: Factory<{id: string, name: string}> = ((data) => {\n  return data as any;\n}) as Factory<{id: string, name: string}>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Hybrid Types (Callable + Properties) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nuserFactory.schema = { id: 'string', name: 'string' };\nuserFactory.validate = (v): v is any => true;\nconst user = userFactory({ id: '1', name: 'Alice' });\n// Event emitter — function that returns, but also has methods\ninterface EventHandler<T> {\n  (event: T): void;\n  once(event: T): void;\n  off(): void;\n}\n// Constructor hybrid type\ninterface MyClass {\n  new (name: string): { name: string };\n  staticMethod(): void;\n}"
                  }
        ],
        tips: [
                  "Hybrid types require interface — type aliases cannot have call signatures alongside properties.",
                  "Used for constructors (new is a call signature), jQuery-like plugins, and utility functions with attached methods.",
                  "Most code doesn't need hybrid types — separate the function from the object when possible.",
                  "Class constructors are hybrid types by default: you can call them (new) and access static properties."
        ],
        mistake: "Trying to define a hybrid type with type alias — use interface instead. type F = { (): void; prop: string } is invalid.",
        shorthand: {
          verbose: "// Without hybrid type — two separate structures\nfunction counter() { return count++; }\ncounter.reset = () => { count = 0; };\ncounter.value = 0;\n// TypeScript doesn't know about .reset or .value",
          concise: "interface Counter {\n  (start: number): string; // callable\n  interval: number;        // property\n  reset(): void;           // method\n}\ndeclare const c: Counter;\nc(10); c.reset(); c.interval;",
        },
      },
      {
        id: "index-signatures-deep",
        fn: "Index Signatures (Extended)",
        desc: "Allow objects to accept any key of a specified type — [key: string]: T or [key in K]: T.",
        category: "Interfaces & Type Aliases",
        subtitle: "Dynamic key access with constraints",
        signature: "interface Dict { [key: string]: string; [key: number]: number }",
        descLong: "Index signatures make an interface accept any key of the specified type. In TypeScript 4.4+, you can use mapped types ([K in KeyUnion]: T) directly in index signatures for more control. Useful for dictionaries, maps, lookups, and dynamic property access.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Index Signatures (Extended) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// String keys — any property name is allowed\ninterface HeaderMap {\n  [key: string]: string | string[];\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Index Signatures (Extended) — common patterns you'll see in production.\n// APPROACH  - Combine Index Signatures (Extended) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nconst headers: HeaderMap = {\n  'content-type': 'application/json',\n  'x-custom': ['value1', 'value2'],\n  'authorization': 'Bearer token', // any string key OK\n};\n// Both string and number keys\ninterface NumericAndString {\n  [key: string]: string;\n  [key: number]: number;\n}\nconst mixed: NumericAndString = {\n  name: 'Alice',\n  0: 10,\n  1: 20,\n};\n// Mapped type in index signature (TS 4.4+)\ntype Status = 'success' | 'error' | 'pending';\ninterface StatusMap {\n  [K in Status]: { code: number; message: string };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Index Signatures (Extended) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst statuses: StatusMap = {\n  success: { code: 200, message: 'OK' },\n  error: { code: 500, message: 'Server error' },\n  pending: { code: 202, message: 'Processing' },\n};\n// Explicit properties override index signature\ninterface Config {\n  [key: string]: string | number | boolean;\n  timeout: number; // explicit — must match value type\n  retries?: number; // optional explicit property\n}\n// Generic index signature\ninterface Store<T> {\n  [key: string]: T;\n}\nconst userStore: Store<{name: string}> = {\n  user1: { name: 'Alice' },\n  user2: { name: 'Bob' },\n};"
                  }
        ],
        tips: [
                  "Index signatures only match string and number (and symbol in TS 4.4+).",
                  "Explicit properties must match the index signature value type.",
                  "KeyofStringsOnly utility (K & string) filters keys to strings only.",
                  "Use mapped types in index signatures for precise control over allowed keys."
        ],
        mistake: "Assuming an index signature allows undefined values — [key: string]: T means every key exists with type T. Use T | undefined in the value type if keys are optional.",
        shorthand: {
          verbose: "interface HeaderMap {\n  [key: string]: string | string[];\n}",
          concise: "type HeaderMap = Record<string, string | string[]>;",
        },
      },
    ],
  },
]

export default { meta, sections }
