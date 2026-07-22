export const meta = {
  "title": "Advanced Patterns",
  "domain": "typescript",
  "sheet": "advanced-patterns",
  "icon": "🧩"
}

export const sections = [

  // ── Section 1: Branded & Nominal Types ─────────────────────────────────────────
  {
    id: "branded-types",
    title: "Branded & Nominal Types",
    entries: [
      {
        id: "branded-types",
        fn: "Branded Types — Compile-Time Safety for Primitives",
        desc: "Prevent mixing up IDs, currencies, and units by branding primitive types with unique compile-time tags.",
        category: "Patterns",
        subtitle: "Brand<T, B>, nominal typing, tagged types, opaque types",
        signature: "type UserId = string & { __brand: \"UserId\" }  |  type USD = number & { __brand: \"USD\" }",
        descLong: "TypeScript uses structural typing — two identical shapes are interchangeable. This means a UserId (string) can be passed where an OrderId (string) is expected. Branded types add a phantom property (__brand) that exists only at the type level, creating nominal-like typing. This prevents accidentally mixing user IDs with order IDs, dollars with euros, or pixels with rems. The brand never exists at runtime — zero overhead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Branded Types — Compile-Time Safety for Primitives — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Brand<T, B extends string> = T & { readonly __brand: B };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Branded Types — Compile-Time Safety for Primitives — common patterns you'll see in production.\n// APPROACH  - Combine Branded Types — Compile-Time Safety for Primitives with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype UserId    = Brand<string, \"UserId\">;\ntype OrderId   = Brand<string, \"OrderId\">;\ntype ProductId = Brand<string, \"ProductId\">;\n// Constructor functions (the only way to create branded values)\nfunction UserId(id: string): UserId { return id as UserId; }\nfunction OrderId(id: string): OrderId { return id as OrderId; }\nfunction getUser(id: UserId): Promise<User> { /* ... */ }\nfunction getOrder(id: OrderId): Promise<Order> { /* ... */ }\nconst userId = UserId(\"usr_123\");\nconst orderId = OrderId(\"ord_456\");\ngetUser(userId);    // ✓\ngetUser(orderId);   // ✗ Type error! OrderId is not UserId\ngetUser(\"raw_str\"); // ✗ Type error! string is not UserId\ntype USD = Brand<number, \"USD\">;\ntype EUR = Brand<number, \"EUR\">;\nfunction USD(amount: number): USD { return amount as USD; }\nfunction EUR(amount: number): EUR { return amount as EUR; }\nfunction chargeUSD(amount: USD): void { /* ... */ }\nchargeUSD(USD(9.99));    // ✓\nchargeUSD(EUR(9.99));    // ✗ Type error!\nchargeUSD(9.99);         // ✗ Type error!"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Branded Types — Compile-Time Safety for Primitives — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Email       = Brand<string, \"Email\">;\ntype NonEmpty    = Brand<string, \"NonEmpty\">;\ntype PositiveInt = Brand<number, \"PositiveInt\">;\nfunction validateEmail(input: string): Email | null {\n  return /^[^@]+@[^@]+\\.[^@]+$/.test(input) ? (input as Email) : null;\n}\nfunction ensurePositive(n: number): PositiveInt {\n  if (n <= 0) throw new Error(\"Must be positive\");\n  return n as PositiveInt;\n}\nfunction sendEmail(to: Email, subject: string): void {\n  // Guaranteed to be a validated email at compile time\n}\n// import { z } from \"zod\";\n// const Email = z.string().email().brand<\"Email\">();\n// type Email = z.infer<typeof Email>;\n// const parsed = Email.parse(\"a@b.com\"); // typed as Email"
                  }
        ],
        tips: [
                  "Brand constructors are the only way to create branded values — this forces validation at the boundary.",
                  "Branded types have zero runtime cost — the __brand property exists only in the type system.",
                  "Zod .brand<T>() combines runtime validation with compile-time branding — parse once, type-safe everywhere.",
                  "Use branded types for any primitive that has semantic meaning: IDs, currencies, units, validated strings."
        ],
        mistake: "Using plain string/number for entity IDs across your codebase — it is trivially easy to pass a UserId where an OrderId is expected. Branded types catch this at compile time with zero runtime cost.",
        shorthand: {
          verbose: "function getUser(id: string) {}\nconst uid = \"usr_123\";\nconst oid = \"ord_456\";\ngetUser(oid); // oops, no type error",
          concise: "type UserId = string & { readonly brand: unique symbol }; constructor functions to create",
        },
      },
      {
        id: "satisfies-const",
        fn: "satisfies & as const — Precise Type Inference",
        desc: "Use satisfies for type checking without widening, and as const for immutable literal types.",
        category: "Patterns",
        subtitle: "satisfies, as const, const type parameters, literal inference",
        signature: "expr satisfies Type  |  as const  |  <const T>(arg: T)",
        descLong: "The satisfies operator (TS 5.0+) validates that an expression matches a type WITHOUT widening the inferred type. Unlike type annotation (: Type), satisfies preserves literal types, union discrimination, and auto-complete. as const creates deeply readonly literal types — turning [\"a\", \"b\"] from string[] into readonly [\"a\", \"b\"]. Const type parameters (<const T>) capture literal types from function arguments. Together, these enable maximally precise type inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of satisfies & as const — Precise Type Inference — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Route = {\n  path: string;\n  method: \"GET\" | \"POST\" | \"PUT\" | \"DELETE\";\n  handler: () => void;\n};\n// With type annotation — loses literal types\nconst routeAnnotated: Route = {\n  path: \"/users\",\n  method: \"GET\",           // typed as \"GET\" | \"POST\" | \"PUT\" | \"DELETE\"\n  handler: () => {},\n};\n// routeAnnotated.method → \"GET\" | \"POST\" | \"PUT\" | \"DELETE\" (wide)\n// With satisfies — preserves literal types\nconst routeSatisfies = {\n  path: \"/users\",\n  method: \"GET\",           // typed as \"GET\" (narrow!)\n  handler: () => {},\n} satisfies Route;\n// routeSatisfies.method → \"GET\" (precise)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of satisfies & as const — Precise Type Inference — common patterns you'll see in production.\n// APPROACH  - Combine satisfies & as const — Precise Type Inference with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Color = \"red\" | \"green\" | \"blue\";\nconst palette = {\n  red:   { hex: \"#ff0000\", rgb: [255, 0, 0] },\n  green: { hex: \"#00ff00\", rgb: [0, 255, 0] },\n  blue:  { hex: \"#0000ff\", rgb: [0, 0, 255] },\n  // purple: ...  // Error! \"purple\" is not in Color\n} satisfies Record<Color, { hex: string; rgb: number[] }>;\npalette.red.hex;    // ✓ auto-complete works!\npalette.red.rgb[0]; // ✓ typed as number\nconst routes = [\"/home\", \"/about\", \"/contact\"] as const;\n// type: readonly [\"/home\", \"/about\", \"/contact\"]\n// Without as const: string[]\ntype Route2 = (typeof routes)[number];\n// \"/home\" | \"/about\" | \"/contact\"\nconst config = {\n  api: \"https://api.example.com\",\n  timeout: 5000,\n  retries: 3,\n} as const;\n// All properties are readonly with literal types"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of satisfies & as const — Precise Type Inference — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\n// Without const: T inferred as string[]\nfunction defineRoutes<const T extends readonly string[]>(routes: T) {\n  return routes;\n}\nconst myRoutes = defineRoutes([\"/home\", \"/about\"]);\n// type: readonly [\"/home\", \"/about\"] — not string[]\nconst endpoints = {\n  users:    { method: \"GET\",  path: \"/api/users\" },\n  createUser: { method: \"POST\", path: \"/api/users\" },\n} as const satisfies Record<string, { method: string; path: string }>;\n// endpoints.users.method → \"GET\" (literal, readonly)"
                  }
        ],
        tips: [
                  "satisfies validates without widening — use it when you want both type-checking AND precise inference.",
                  "as const satisfies Record<K, V> is the gold standard — immutable, validated, and maximally precise.",
                  "const type parameters (<const T>) capture literal types from arguments — essential for builder patterns.",
                  "satisfies catches excess properties that type annotations miss — it is strictly more precise."
        ],
        mistake: "Using type annotations (: Type) when you want precise inference — annotations widen literals. satisfies validates the type while preserving the exact inferred type.",
        shorthand: {
          verbose: "const route: Route = {\n  method: \"GET\", // loses literal type\n  ...\n};\nroute.method; // \"GET\" | \"POST\" | \"PUT\" | \"DELETE\"",
          concise: "satisfies Type validates without widening; as const for immutable literals; <const T> type params capture literals",
        },
      },
    ],
  },

  // ── Section 2: Type-Safe Design Patterns ─────────────────────────────────────────
  {
    id: "type-safe-patterns",
    title: "Type-Safe Design Patterns",
    entries: [
      {
        id: "exhaustive-matching",
        fn: "Exhaustive Matching & Discriminated Unions",
        desc: "Ensure every variant is handled with discriminated unions and never-based exhaustive checking.",
        category: "Patterns",
        subtitle: "discriminated union, exhaustive switch, never, assertNever",
        signature: "type Action = { type: \"add\" } | { type: \"remove\" }  |  assertNever(action)",
        descLong: "Discriminated unions use a shared literal property (the discriminant) to distinguish variants. TypeScript narrows the type in each switch/if branch. Exhaustive checking ensures every variant is handled — if you add a new variant, the compiler errors everywhere it is not handled. The assertNever pattern uses the never type: if a value reaches it, TypeScript knows a case was missed. This prevents bugs when adding new variants to unions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Exhaustive Matching & Discriminated Unions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Shape =\n  | { kind: \"circle\";    radius: number }\n  | { kind: \"rectangle\"; width: number; height: number }\n  | { kind: \"triangle\";  base: number; height: number };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Exhaustive Matching & Discriminated Unions — common patterns you'll see in production.\n// APPROACH  - Combine Exhaustive Matching & Discriminated Unions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction assertNever(x: never): never {\n  throw new Error(\"Unexpected value: \" + JSON.stringify(x));\n}\nfunction area(shape: Shape): number {\n  switch (shape.kind) {\n    case \"circle\":\n      return Math.PI * shape.radius ** 2;\n    case \"rectangle\":\n      return shape.width * shape.height;\n    case \"triangle\":\n      return (shape.base * shape.height) / 2;\n    default:\n      return assertNever(shape);\n      // If you add a new shape and forget a case,\n      // TypeScript errors here: \"Argument of type\n      // { kind: 'pentagon'; ... } is not assignable to never\"\n  }\n}\ntype AsyncState<T> =\n  | { status: \"idle\" }\n  | { status: \"loading\" }\n  | { status: \"success\"; data: T }\n  | { status: \"error\";   error: Error };\nfunction renderState<T>(state: AsyncState<T>): string {\n  switch (state.status) {\n    case \"idle\":    return \"Ready\";\n    case \"loading\": return \"Loading...\";\n    case \"success\": return \"Data: \" + JSON.stringify(state.data);\n    case \"error\":   return \"Error: \" + state.error.message;\n    // No default needed — TypeScript knows all cases handled\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Exhaustive Matching & Discriminated Unions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Action =\n  | { type: \"ADD_TODO\";    payload: { text: string } }\n  | { type: \"TOGGLE_TODO\"; payload: { id: number } }\n  | { type: \"DELETE_TODO\";  payload: { id: number } };\nfunction reducer(state: Todo[], action: Action): Todo[] {\n  switch (action.type) {\n    case \"ADD_TODO\":\n      return [...state, { id: Date.now(), text: action.payload.text, done: false }];\n    case \"TOGGLE_TODO\":\n      return state.map(t =>\n        t.id === action.payload.id ? { ...t, done: !t.done } : t);\n    case \"DELETE_TODO\":\n      return state.filter(t => t.id !== action.payload.id);\n    default:\n      return assertNever(action);\n  }\n}\nconst areaCalculators: {\n  [K in Shape[\"kind\"]]: (s: Extract<Shape, { kind: K }>) => number;\n} = {\n  circle:    (s) => Math.PI * s.radius ** 2,\n  rectangle: (s) => s.width * s.height,\n  triangle:  (s) => (s.base * s.height) / 2,\n  // Missing any shape kind → compile error!\n};\nfunction area2(shape: Shape): number {\n  return areaCalculators[shape.kind](shape as any);\n}"
                  }
        ],
        tips: [
                  "assertNever in the default case catches unhandled variants at compile time — add it to every discriminated union switch.",
                  "Exhaustive object maps (Record<Union, Handler>) are an alternative to switch — TypeScript ensures every key is present.",
                  "The discriminant property must be a literal type (string, number, boolean) — not a general string or number.",
                  "Extract<Union, { kind: K }> narrows a union to a specific variant — useful in generic handlers."
        ],
        mistake: "Using a default case that returns a fallback value instead of assertNever — this silently handles new variants with wrong behavior. assertNever makes the compiler tell you about unhandled cases.",
        shorthand: {
          verbose: "switch (action.type) {\n  case \"add\": return ...;\n  default: return state; // oops, silently handles unknown\n}",
          concise: "discriminated union with literal discriminant; switch every case; default: assertNever(x) where x: never",
        },
      },
      {
        id: "builder-pattern",
        fn: "Type-Safe Builder & Fluent API Patterns",
        desc: "Build complex objects with compile-time validation: required fields, ordering constraints, and chainable APIs.",
        category: "Patterns",
        subtitle: "builder pattern, fluent API, phantom types, step builder",
        signature: "builder.field(value).field2(value).build()  |  Chainable<Required, Optional>",
        descLong: "Type-safe builders use TypeScript generics to track which fields have been set at compile time. Each method returns a new type that records the field as \"set\". The build() method is only available when all required fields are present. This prevents runtime errors from missing fields and provides auto-complete for remaining fields. Phantom types (generic parameters that exist only in the type system) track state without runtime overhead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type-Safe Builder & Fluent API Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype QueryConfig = {\n  table: string;\n  columns: string[];\n  where?: string;\n  orderBy?: string;\n  limit?: number;\n};\n// Track which required fields have been set\ntype BuilderState = {\n  hasTable: boolean;\n  hasColumns: boolean;\n};\nclass QueryBuilder<State extends BuilderState = { hasTable: false; hasColumns: false }> {\n  private config: Partial<QueryConfig> = {};\n  table(name: string): QueryBuilder<State & { hasTable: true }> {\n    this.config.table = name;\n    return this as any;\n  }\n  columns(...cols: string[]): QueryBuilder<State & { hasColumns: true }> {\n    this.config.columns = cols;\n    return this as any;\n  }\n  where(condition: string): this {\n    this.config.where = condition;\n    return this;\n  }\n  orderBy(col: string): this {\n    this.config.orderBy = col;\n    return this;\n  }\n  limit(n: number): this {\n    this.config.limit = n;\n    return this;\n  }\n  // build() only available when both required fields are set\n  build(\n    this: QueryBuilder<{ hasTable: true; hasColumns: true }>\n  ): QueryConfig {\n    return this.config as QueryConfig;\n  }\n}\n// Usage:\nconst query = new QueryBuilder()\n  .table(\"users\")                    // ← sets hasTable: true\n  .columns(\"id\", \"name\", \"email\")   // ← sets hasColumns: true\n  .where(\"active = true\")\n  .orderBy(\"name\")\n  .limit(10)\n  .build();                          // ✓ — both required fields set\n// This would fail at compile time:\n// new QueryBuilder()\n//   .table(\"users\")\n//   .build();  // ✗ Error: hasColumns is false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type-Safe Builder & Fluent API Patterns — common patterns you'll see in production.\n// APPROACH  - Combine Type-Safe Builder & Fluent API Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass RequestBuilder {\n  private opts: Record<string, unknown> = {};\n  url(url: string) { this.opts.url = url; return this; }\n  method(m: \"GET\" | \"POST\" | \"PUT\" | \"DELETE\") { this.opts.method = m; return this; }\n  header(key: string, value: string) {\n    const headers = (this.opts.headers || {}) as Record<string, string>;\n    headers[key] = value;\n    this.opts.headers = headers;\n    return this;\n  }\n  body(data: unknown) { this.opts.body = JSON.stringify(data); return this; }\n  timeout(ms: number) { this.opts.timeout = ms; return this; }\n  async send<T>(): Promise<T> {\n    const res = await fetch(this.opts.url as string, this.opts as any);\n    return res.json();\n  }\n}\nconst data = await new RequestBuilder()\n  .url(\"/api/users\")\n  .method(\"POST\")\n  .header(\"Content-Type\", \"application/json\")\n  .body({ name: \"Alice\" })\n  .timeout(5000)\n  .send<{ id: string }>();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type-Safe Builder & Fluent API Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction pipe<A, B>(fn1: (a: A) => B): (a: A) => B;\nfunction pipe<A, B, C>(fn1: (a: A) => B, fn2: (b: B) => C): (a: A) => C;\nfunction pipe<A, B, C, D>(\n  fn1: (a: A) => B, fn2: (b: B) => C, fn3: (c: C) => D\n): (a: A) => D;\nfunction pipe(...fns: Function[]) {\n  return (x: unknown) => fns.reduce((v, f) => f(v), x);\n}\nconst process = pipe(\n  (s: string) => s.trim(),\n  (s: string) => s.toLowerCase(),\n  (s: string) => s.split(\" \")\n);\n// process: (s: string) => string[]"
                  }
        ],
        tips: [
                  "Phantom generic parameters track builder state at compile time — the build() method restricts its this type to require all fields.",
                  "Return this from chainable methods — TypeScript preserves the concrete subclass type through the chain.",
                  "Use function overloads for pipe/compose — TypeScript infers types through each step of the chain.",
                  "The builder pattern is ideal for complex configuration objects, query builders, and request constructors."
        ],
        mistake: "Returning void from builder methods instead of this — you lose method chaining. Always return this (or a new typed builder instance for state-tracking builders).",
        shorthand: {
          verbose: "class QueryBuilder {\n  table(name: string): void {\n    this.config.table = name;\n  }\n}\n// Can't chain: builder.table('users').select(...)",
          concise: "class Builder { field(val: T): this { ... return this; } } or QueryBuilder<State & { hasField: true }> for state tracking",
        },
      },
      {
        id: "higher-kinded-types",
        fn: "Higher-Kinded Type Simulation",
        desc: "Simulate higher-kinded types with type families — encode functors, monads, and generic abstractions.",
        category: "Advanced",
        subtitle: "HKT, type families, functors, monads",
        signature: "type HKT<F, A>  |  type Map<F extends HKT, A> = F[\"map\"][A]",
        descLong: "TypeScript does not support true higher-kinded types (a type taking a type parameter), but you can simulate them using the higher-kinded type (HKT) pattern. An HKT is a type family — a type that maps different concrete types to implementations. Used for creating generic functor/monad abstractions, functional libraries (fp-ts), and type-safe utility libraries. This is advanced but powerful for library authors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Higher-Kinded Type Simulation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Kind is a phantom type describing the \"shape\" (like a type constructor)\ntype HKT<F, A> = { readonly __F: F; readonly __A: A; };\n// Extract the unwrapped value from an HKT instance\ntype Unwrap<H extends HKT<any, any>> = H[\"__A\"];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Higher-Kinded Type Simulation — common patterns you'll see in production.\n// APPROACH  - Combine Higher-Kinded Type Simulation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Functor<F> = {\n  map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B>;\n};\ntype ArrayHKT = { readonly __F: \"Array\" };\ntype ArrayInstance<A> = HKT<ArrayHKT, A>;\n// Implementation for Array functor\nconst arrayFunctor: Functor<ArrayHKT> = {\n  map: <A, B>(\n    fa: ArrayInstance<A>,\n    f: (a: A) => B\n  ): ArrayInstance<B> => {\n    return (fa as unknown as A[]).map(f) as ArrayInstance<B>;\n  }\n};\n// Usage\nconst nums: ArrayInstance<number> = [1, 2, 3] as ArrayInstance<number>;\nconst doubled = arrayFunctor.map(nums, (x) => x * 2);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Higher-Kinded Type Simulation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype OptionHKT = { readonly __F: \"Option\" };\ntype OptionInstance<A> = HKT<OptionHKT, A>;\ntype Option<A> = { kind: \"some\"; value: A } | { kind: \"none\" };\nconst optionFunctor: Functor<OptionHKT> = {\n  map: <A, B>(\n    fa: OptionInstance<A>,\n    f: (a: A) => B\n  ): OptionInstance<B> => {\n    const opt = fa as unknown as Option<A>;\n    if (opt.kind === \"some\") {\n      return { kind: \"some\", value: f(opt.value) } as OptionInstance<B>;\n    }\n    return { kind: \"none\" } as OptionInstance<B>;\n  }\n};\n// Monad operations (flatMap/bind)\ntype Monad<F> = Functor<F> & {\n  flatMap: <A, B>(fa: HKT<F, A>, f: (a: A) => HKT<F, B>) => HKT<F, B>;\n  pure: <A>(a: A) => HKT<F, A>;\n};\nconst optionMonad: Monad<OptionHKT> = {\n  map: optionFunctor.map,\n  flatMap: <A, B>(\n    fa: OptionInstance<A>,\n    f: (a: A) => OptionInstance<B>\n  ): OptionInstance<B> => {\n    const opt = fa as unknown as Option<A>;\n    if (opt.kind === \"some\") {\n      return f(opt.value);\n    }\n    return { kind: \"none\" } as OptionInstance<B>;\n  },\n  pure: <A>(a: A): OptionInstance<A> => {\n    return { kind: \"some\", value: a } as OptionInstance<A>;\n  }\n};"
                  }
        ],
        tips: [
                  "HKT requires two phantom properties: __F (the \"type constructor\") and __A (the wrapped type).",
                  "This pattern is used by fp-ts, Haskell-inspired functional libraries, and type-safe effect systems.",
                  "The HKT pattern lets you write generic code for any functor/monad — a type-safe alternative to \"any\".",
                  "Most application code does not need HKTs — they are for library authors building abstractions."
        ],
        mistake: "Forgetting that HKT is a simulation, not true higher-kinded types — TypeScript cannot pass \"F\" as a type constructor directly. You must use the phantom property pattern.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype HKT<F, A> = { readonly __F: F; readonly __A: A };\ntype Functor<F> = { map: <A, B>(fa: HKT<F, A>, f: (a: A) => B) => HKT<F, B> };\n// More explicit but longer",
          concise: "// HKT pattern for generic functor/monad abstractions; used in fp-ts",
        },
      },
      {
        id: "type-level-arithmetic",
        fn: "Type-Level Arithmetic & Programming",
        desc: "Use recursive types to perform computation at the type level — addition, array length, tuple operations.",
        category: "Advanced",
        subtitle: "Recursive types, type-level computation",
        signature: "type Add<A, B> = A extends number ? ...",
        descLong: "TypeScript supports recursive types and conditional types, allowing computation at the type level. You can compute the length of a tuple, add numbers as type parameters, build type-safe arrays, and encode stateful operations in the type system. This is used for advanced libraries (Zod, io-ts), type-safe APIs, and proving type-level invariants.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type-Level Arithmetic & Programming — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Length<T extends readonly unknown[]> = T[\"length\"];\ntype LenHello = Length<[1, 2, 3]>;  // 3\ntype LenEmpty = Length<[]>;         // 0"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type-Level Arithmetic & Programming — common patterns you'll see in production.\n// APPROACH  - Combine Type-Level Arithmetic & Programming with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Index<T extends readonly unknown[], N extends number> =\n  N extends 0 ? T[0] :\n  N extends 1 ? T[1] :\n  N extends 2 ? T[2] :\n  never;\ntype Elem0 = Index<[\"a\", \"b\", \"c\"], 0>;  // \"a\"\ntype Add<A extends number, B extends number> =\n  [1, 1, 1, 1, 1] extends readonly [unknown, ...infer Rest]\n    ? Rest extends readonly [unknown, ...infer Rest2]\n      ? [...Array<Rest[\"length\"]>, ...Array<B>][\"length\"]\n      : never\n    : never;\n// Simpler: build arrays and measure length\ntype BuildArray<N extends number, Acc extends unknown[] = []> =\n  Acc[\"length\"] extends N ? Acc : BuildArray<N, [...Acc, 1]>;\ntype AddSimple<A extends number, B extends number> = [\n  ...BuildArray<A>,\n  ...BuildArray<B>\n][\"length\"];\ntype Add5_3 = AddSimple<5, 3>;  // 8\ntype Flatten<T extends readonly unknown[]> =\n  T extends readonly [infer Head extends readonly unknown[], ...infer Rest extends readonly unknown[][]]\n    ? [...Head, ...Flatten<Rest>]\n    : T extends readonly [infer Head, ...infer Rest]\n    ? [Head, ...Flatten<Rest>]\n    : [];\ntype Flat1 = Flatten<[[1, 2], [3, 4]]>;  // [1, 2, 3, 4]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type-Level Arithmetic & Programming — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Tuple<N extends number, T = unknown, Acc extends T[] = []> =\n  Acc[\"length\"] extends N ? Acc : Tuple<N, T, [...Acc, T]>;\ntype Vec5 = Tuple<5, number>;  // [number, number, number, number, number]\ntype ReplaceAll<S extends string, From extends string, To extends string> =\n  S extends `${infer Before}${From}${infer After}`\n    ? `${Before}${To}${ReplaceAll<After, From, To>}`\n    : S;\ntype Result = ReplaceAll<\"hello world world\", \"world\", \"there\">;  // \"hello there there\""
                  }
        ],
        tips: [
                  "Recursive types are powerful but slow the type checker — use sparingly and with depth limits.",
                  "BuildArray pattern is the standard way to count to a number at the type level.",
                  "Type-level arithmetic is used for validating fixed-size vectors, matrix operations, and protocol buffers.",
                  "Most type-level programming is for library authors — application code rarely needs it."
        ],
        mistake: "Creating infinitely recursive types without a base case — the type checker will hang. Always have a termination condition.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Tuple<N, T, Acc = []> = Acc[\"length\"] extends N ? Acc : Tuple<N, T, [...Acc, T]>;\n// More explicit but longer",
          concise: "// Type-level recursion for length/arithmetic; build arrays of specific size",
        },
      },
      {
        id: "phantom-types",
        fn: "Phantom Types — Compile-Time State Encoding",
        desc: "Encode state and validity in type parameters — validated/unvalidated, safe/unsafe, different protocol states.",
        category: "Advanced",
        subtitle: "Phantom type parameters, type-level state machines",
        signature: "type Validated<T, State> = T & { readonly __state: State }",
        descLong: "A phantom type is a type parameter that does not appear in any value — it exists only in the type system. Use phantom types to encode state (validated/unvalidated), transitions (initial/connected/closed), or constraints (safe/unsafe). Functions return differently-typed values based on the phantom state, preventing type errors from invalid sequences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Phantom Types — Compile-Time State Encoding — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Unvalidated = { readonly __unvalidated: never };\ntype Validated = { readonly __validated: never };\n// Phantom type wrapping a value\ntype Data<T, State> = { value: T; readonly __state?: State };\n// Constructor — creates unvalidated data\nfunction data<T>(value: T): Data<T, Unvalidated> {\n  return { value };\n}\n// Validator — returns validated data\nfunction validate<T>(d: Data<T, Unvalidated>): Data<T, Validated> {\n  // validation logic\n  return d as Data<T, Validated>;\n}\n// This only works with validated data\nfunction use<T>(d: Data<T, Validated>): T {\n  return d.value;\n}\n// Usage:\nconst x = data({ count: 5 });           // Data<{count: 5}, Unvalidated>\nconst validated = validate(x);          // Data<{count: 5}, Validated>\nconst result = use(validated);          // ✓\n// This would error:\n// use(x);  // ✗ Data<..., Unvalidated> is not assignable to Data<..., Validated>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Phantom Types — Compile-Time State Encoding — common patterns you'll see in production.\n// APPROACH  - Combine Phantom Types — Compile-Time State Encoding with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Idle = { readonly __idle: never };\ntype Connecting = { readonly __connecting: never };\ntype Connected = { readonly __connected: never };\nclass Connection<State = Idle> {\n  private url: string;\n  constructor(url: string) {\n    this.url = url;\n  }\n  connect(this: Connection<Idle>): Connection<Connecting> {\n    console.log(\"Connecting to \" + this.url);\n    return this as Connection<Connecting>;\n  }\n  onConnected(this: Connection<Connecting>, cb: () => void): Connection<Connected> {\n    console.log(\"Connected, running callback\");\n    cb();\n    return this as Connection<Connected>;\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Phantom Types — Compile-Time State Encoding — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nsend(this: Connection<Connected>, data: string): void {\n    console.log(\"Sending: \" + data);\n  }\n  close(this: Connection<Connected>): Connection<Idle> {\n    console.log(\"Closed\");\n    return this as Connection<Idle>;\n  }\n}\n// Usage — enforces correct order\nconst conn = new Connection(\"ws://localhost\");\nconn.connect().onConnected(() => {\n  console.log(\"Ready!\");\n}).send(\"Hello\");  // ✓\n// These would error:\n// conn.send(\"Hello\");  // ✗ Idle is not Connected\n// conn.connect().send(\"Hello\");  // ✗ Connecting is not Connected"
                  }
        ],
        tips: [
                  "Phantom types have zero runtime cost — the __state property never actually exists.",
                  "Perfect for enforcing protocol correctness (connect → auth → use → close).",
                  "Combined with builder patterns for state machine validation.",
                  "Common in database drivers, protocol handlers, and resource management."
        ],
        mistake: "Phantom type properties appearing in runtime code — they only exist in the type system. Never try to access __state at runtime.",
        shorthand: {
          verbose: "type Data<T, State> = { value: T };\nfunction validate<T>(d: Data<T, Unvalidated>): Data<T, Validated> { ... }\nfunction use<T>(d: Data<T, Validated>): T { ... }",
          concise: "// Use phantom type parameters to encode state transitions at compile time",
        },
      },
      {
        id: "opaque-types",
        fn: "Opaque & Branded Types — Preventing Structural Subtyping",
        desc: "Create truly unique types that cannot be substituted — brand types with unique symbols for compile-time tagging.",
        category: "Advanced",
        subtitle: "Branded types, unique symbols, structural vs nominal",
        signature: "type UserId = string & { readonly __brand: unique symbol }",
        descLong: "TypeScript uses structural typing — { x: number } is assignable to any other { x: number }. Opaque types prevent this by adding a brand property that references a unique symbol. The symbol is never exported, so only module-internal functions can construct the branded type. This creates true nominal typing — a UserId from one module is different from a UserId from another module.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Opaque & Branded Types — Preventing Structural Subtyping — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ndeclare const UserId_brand: unique symbol;\ntype UserId = string & { [UserId_brand]: true };\n// Create branded value (only inside the module that defines the brand)\nfunction makeUserId(id: string): UserId {\n  return id as UserId;\n}\n// Only makeUserId can create a UserId — callers cannot cast directly\nfunction getUser(id: UserId): Promise<User> {\n  // fetch logic\n}\nconst id = \"usr_123\";\n// getUser(id);  // ✗ string is not UserId\ngetUser(makeUserId(id));  // ✓"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Opaque & Branded Types — Preventing Structural Subtyping — common patterns you'll see in production.\n// APPROACH  - Combine Opaque & Branded Types — Preventing Structural Subtyping with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ndeclare const Email_brand: unique symbol;\ndeclare const Validated_brand: unique symbol;\ntype Email = string & { [Email_brand]: true };\ntype ValidatedEmail = Email & { [Validated_brand]: true };\nfunction makeEmail(email: string): Email {\n  return email as Email;\n}\nfunction validateEmail(email: Email): ValidatedEmail {\n  if (!email.includes(\"@\")) throw new Error(\"Invalid email\");\n  return email as ValidatedEmail;\n}\ndeclare const OrderId_brand: unique symbol;\ntype OrderId = string & { [OrderId_brand]: true };\nfunction makeOrderId(id: string): OrderId {\n  return id as OrderId;\n}\nfunction getOrder(id: OrderId): Promise<Order> { /* ... */ }\nconst userId = makeUserId(\"u_123\");\nconst orderId = makeOrderId(\"o_456\");\ngetUser(userId);     // ✓\ngetOrder(orderId);   // ✓\ngetUser(orderId);    // ✗ OrderId is not assignable to UserId\ngetOrder(userId);    // ✗ UserId is not assignable to OrderId"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Opaque & Branded Types — Preventing Structural Subtyping — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass PositiveInt {\n  private readonly __brand!: \"PositiveInt\";\n  constructor(private value: number) {\n    if (value <= 0) throw new Error(\"Must be positive\");\n  }\n  get val() { return this.value; }\n}\nfunction needsPositive(n: PositiveInt) { console.log(n.val); }\nneedsPositive(new PositiveInt(5));  // ✓\nneedsPositive(5);  // ✗ number is not PositiveInt"
                  }
        ],
        tips: [
                  "Unique symbols are truly unique — each declaration creates a distinct brand.",
                  "Branded types work across module boundaries — only the module defining the brand can create values.",
                  "Use opaque types for semantic types like UserId, OrderId, Email — not just string.",
                  "Class-based branding (newtype) works but unique symbols are more idiomatic."
        ],
        mistake: "Exporting the brand symbol — once exported, external code can cast any string to your branded type. Keep brands internal.",
        shorthand: {
          verbose: "declare const UserId_brand: unique symbol;\ntype UserId = string & { [UserId_brand]: true };\nfunction makeUserId(id: string): UserId { return id as UserId; }",
          concise: "// Branded types prevent structural subtyping; only constructor functions can create branded values",
        },
      },
      {
        id: "correlated-types",
        fn: "Correlated Union Records — Type-Safe Payload Mapping",
        desc: "Map union discriminants to their data payload — { [K in Kind]: { kind: K; data: KindData[K] } }[Kind].",
        category: "Advanced",
        subtitle: "Correlated unions, keyof patterns, mapped unions",
        signature: "type KindMap = { tag: TagData; user: UserData } | ...",
        descLong: "Correlated types use mapped types to ensure that each union member has the correct payload type. When you have a union of actions with different payload types, mapping ensures type safety — setting the action.type=user automatically requires a user-shaped payload. This pattern is essential for Redux actions, event handlers, and API responses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Correlated Union Records — Type-Safe Payload Mapping — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype ActionPayloads = {\n  \"ADD_TODO\": { text: string };\n  \"TOGGLE_TODO\": { id: number };\n  \"DELETE_TODO\": { id: number };\n  \"SET_FILTER\": { filter: \"all\" | \"active\" | \"done\" };\n};\n// Correlated union — each kind is paired with its payload\ntype Action = {\n  [K in keyof ActionPayloads]: {\n    type: K;\n    payload: ActionPayloads[K];\n  };\n}[keyof ActionPayloads];\n// Equivalent expanded:\n// type Action =\n//   | { type: \"ADD_TODO\"; payload: { text: string } }\n//   | { type: \"TOGGLE_TODO\"; payload: { id: number } }\n//   | { type: \"DELETE_TODO\"; payload: { id: number } }\n//   | { type: \"SET_FILTER\"; payload: { filter: \"all\" | \"active\" | \"done\" } };\n// Type-safe dispatch\nfunction dispatch(action: Action): void {\n  switch (action.type) {\n    case \"ADD_TODO\":\n      console.log(action.payload.text);  // ✓ text: string\n      break;\n    case \"TOGGLE_TODO\":\n      console.log(action.payload.id);    // ✓ id: number\n      break;\n    case \"DELETE_TODO\":\n      console.log(action.payload.id);\n      break;\n    case \"SET_FILTER\":\n      console.log(action.payload.filter);  // ✓ filter: \"all\" | \"active\" | \"done\"\n      break;\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Correlated Union Records — Type-Safe Payload Mapping — common patterns you'll see in production.\n// APPROACH  - Combine Correlated Union Records — Type-Safe Payload Mapping with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype ActionPayloadOf<K extends keyof ActionPayloads> = ActionPayloads[K];\ntype AddPayload = ActionPayloadOf<\"ADD_TODO\">;  // { text: string }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Correlated Union Records — Type-Safe Payload Mapping — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype EventPayloads = {\n  \"user.created\": { userId: string; email: string };\n  \"user.updated\": { userId: string; changes: Partial<{ email: string }> };\n  \"order.placed\": { orderId: string; total: number };\n};\ntype Event = {\n  [K in keyof EventPayloads]: {\n    type: K;\n    data: EventPayloads[K];\n  };\n}[keyof EventPayloads];\nfunction onEvent(event: Event): void {\n  if (event.type === \"user.created\") {\n    console.log(event.data.userId, event.data.email);\n  } else if (event.type === \"order.placed\") {\n    console.log(event.data.orderId, event.data.total);\n  }\n}"
                  }
        ],
        tips: [
                  "Correlated unions prevent payload type mismatches — { type: \"A\"; payload: BPayload } is a compile error.",
                  "Use keyof + mapped types to stay DRY — change the payload map and all unions update automatically.",
                  "Extract specific action payloads with mapped types: ActionPayloadOf<K>.",
                  "Redux Toolkit uses this pattern extensively for type-safe dispatch."
        ],
        mistake: "Writing discriminated unions manually instead of deriving from a payload map — you can forget to update one side when changing payloads.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype ActionPayloads = { \"ADD\": {...}, \"REMOVE\": {...} };\ntype Action = { [K in keyof AP]: { type: K; payload: AP[K] } }[keyof AP];\n// More explicit but longer",
          concise: "// Correlated unions map discriminant to payload automatically; type-safe action systems",
        },
      },
      {
        id: "exhaustive-check",
        fn: "Exhaustive Union Checking with never",
        desc: "Use the never type and assertNever to catch unhandled union cases at compile time.",
        category: "Advanced",
        subtitle: "Exhaustive checking, never type, type guards",
        signature: "function assertNever(x: never): never { throw new Error(...) }",
        descLong: "When all union members are handled in a switch/if chain, the remaining type is never. If a new union member is added, the type is no longer never, and the default case receives it. Assigning to never triggers a compile error. This pattern prevents bugs from unhandled cases — critical for discriminated unions, Redux actions, and state machines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Exhaustive Union Checking with never — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nfunction assertNever(x: never, msg?: string): never {\n  throw new Error(msg || `Unexpected value: ${x}`);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Exhaustive Union Checking with never — common patterns you'll see in production.\n// APPROACH  - Combine Exhaustive Union Checking with never with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype Status = \"idle\" | \"loading\" | \"success\" | \"error\";\nfunction handleStatus(status: Status): string {\n  switch (status) {\n    case \"idle\":    return \"Ready\";\n    case \"loading\": return \"Loading...\";\n    case \"success\": return \"Done!\";\n    case \"error\":   return \"Failed\";\n    default:\n      return assertNever(status);\n      // If you add a new status, TypeScript errors here:\n      // Argument of type 'string' is not assignable to 'never'\n  }\n}\ntype Request<T> =\n  | { status: \"idle\" }\n  | { status: \"loading\" }\n  | { status: \"success\"; data: T }\n  | { status: \"error\"; error: Error }\n  | { status: \"partial\"; data: T; error: Error };\nfunction render<T>(req: Request<T>): string {\n  switch (req.status) {\n    case \"idle\":      return \"...\";\n    case \"loading\":   return \"Loading\";\n    case \"success\":   return JSON.stringify(req.data);\n    case \"error\":     return req.error.message;\n    case \"partial\":   return req.data + \" (⚠ \" + req.error.message + \")\";\n    default:          return assertNever(req);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Exhaustive Union Checking with never — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype RequestStatus = \"idle\" | \"loading\" | \"success\" | \"error\";\nconst handlers: { [K in RequestStatus]: (req: Request<unknown>) => string } = {\n  \"idle\":    (req) => \"Ready\",\n  \"loading\": (req) => \"Loading\",\n  \"success\": (req) => \"Done\",\n  \"error\":   (req) => \"Error\",\n  // Missing any key → compile error!\n};\nfunction match<U extends { kind: string }>(value: U): <T>(\n  cases: { [K in U[\"kind\"]]: (v: Extract<U, { kind: K }>) => T }\n) => T {\n  return (cases) => {\n    const handler = cases[value.kind as any];\n    return (handler as any)(value);\n  };\n}\ntype Animal =\n  | { kind: \"dog\"; breed: string }\n  | { kind: \"cat\"; color: string }\n  | { kind: \"bird\"; canFly: boolean };\nconst sound = match<Animal>({\n  kind: \"dog\",\n  breed: \"Labrador\"\n})({\n  dog: (a) => \"Woof! I'm a \" + a.breed,\n  cat: (a) => \"Meow! I'm \" + a.color,\n  bird: (a) => a.canFly ? \"I can fly!\" : \"I cannot fly\",\n  // Missing case → error at compile time!\n});"
                  }
        ],
        tips: [
                  "assertNever must be in a path TypeScript knows is unreachable — typically the default case.",
                  "Union exhaustiveness checking requires that every case is explicitly handled, no fallthrough.",
                  "The never type is TypeScript magic — assigning to never always errors (unless the value truly is never).",
                  "Object map patterns { [K in U]: handler } enforce exhaustiveness — missing a key is a compile error."
        ],
        mistake: "Having a default case that returns a fallback value instead of assertNever — it silently handles new union members with wrong behavior.",
        shorthand: {
          verbose: "switch (status) {\n  case \"idle\": return \"...\";\n  case \"loading\": return \"...\";\n  default: return \"Unknown\";  // Oops, silently handles new status\n}",
          concise: "// default: assertNever(status) — compile error if status union changes",
        },
      },
      {
        id: "deep-readonly",
        fn: "DeepReadonly — Recursive Readonly Types",
        desc: "Recursively make all properties readonly, including nested objects and arrays.",
        category: "Advanced",
        subtitle: "Recursive utility types, readonly mapping",
        signature: "type DeepReadonly<T> = T extends any[] ? readonly DeepReadonly<T[number]>[] : ...",
        descLong: "The built-in Readonly<T> only freezes the top level. DeepReadonly recursively applies readonly to all nested properties, arrays, tuples, and objects. Useful for immutable data structures, Redux state, and preventing accidental mutations of deeply nested data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of DeepReadonly — Recursive Readonly Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype DeepReadonly<T> = T extends (infer R)[]\n  ? readonly DeepReadonly<R>[]\n  : T extends Function\n  ? T\n  : T extends object\n  ? {\n      readonly [K in keyof T]: DeepReadonly<T[K]>;\n    }\n  : T;\n// Usage\ninterface State {\n  user: { id: number; name: string };\n  posts: Array<{ id: number; title: string; tags: string[] }>;\n}\ntype ReadonlyState = DeepReadonly<State>;\n// Equivalent to:\n// {\n//   readonly user: {\n//     readonly id: number;\n//     readonly name: string;\n//   };\n//   readonly posts: readonly {\n//     readonly id: number;\n//     readonly title: string;\n//     readonly tags: readonly string[];\n//   }[];\n// }\nconst state: ReadonlyState = {\n  user: { id: 1, name: \"Alice\" },\n  posts: [\n    { id: 1, title: \"First\", tags: [\"ts\"] }\n  ]\n};\n// These would all error:\n// state.user.name = \"Bob\";          // ✗ readonly\n// state.posts[0].title = \"Changed\"; // ✗ readonly\n// state.posts.push(...);            // ✗ readonly array"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of DeepReadonly — Recursive Readonly Types — common patterns you'll see in production.\n// APPROACH  - Combine DeepReadonly — Recursive Readonly Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ntype DeepReadonlyWithDates<T> = T extends Date\n  ? Date\n  : T extends (infer R)[]\n  ? readonly DeepReadonlyWithDates<R>[]\n  : T extends Function\n  ? T\n  : T extends object\n  ? {\n      readonly [K in keyof T]: DeepReadonlyWithDates<T[K]>;\n    }\n  : T;\ninterface AppState {\n  auth: {\n    user: { id: string; email: string } | null;\n    token: string;\n  };\n  ui: {\n    theme: \"light\" | \"dark\";\n    sidebarOpen: boolean;\n  };\n}\n// Selector returns immutable state\nconst selectState = (state: AppState): DeepReadonly<AppState> => {\n  return state; // TypeScript ensures returned state is not mutated\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of DeepReadonly — Recursive Readonly Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ntype Config = {\n  database: { host: string; port: number };\n  cache: { ttl: number; enabled: boolean };\n};\ntype ReadonlyConfig = DeepReadonly<Config>;\nconst config: ReadonlyConfig = {\n  database: { host: \"localhost\", port: 5432 },\n  cache: { ttl: 3600, enabled: true }\n};"
                  }
        ],
        tips: [
                  "DeepReadonly breaks reference equality for nested objects — be aware when comparing state in memoization.",
                  "Use for Redux selectors and immutable state libraries to document intent.",
                  "Combine with Omit/Pick for selective readonly — DeepReadonly<Pick<State, \"posts\">>.",
                  "Most object mutations should be prevented at the type level before runtime."
        ],
        mistake: "Applying DeepReadonly to a mutable value and then mutating it elsewhere — the type says it is readonly but the reference is still mutable.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype DeepReadonly<T> = T extends any[] ? readonly DeepReadonly<T[number]>[] : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]>; } : T;\n// More explicit but longer",
          concise: "// Recursively readonly all nested properties, arrays, objects; useful for immutable state",
        },
      },
    ],
  },
]

export default { meta, sections }
