export const meta = {
  "title": "Type Patterns",
  "domain": "typescript",
  "sheet": "patterns",
  "icon": "🎨"
}

export const sections = [

  // ── Section 1: Type Patterns ─────────────────────────────────────────
  {
    id: "type-patterns",
    title: "Type Patterns",
    entries: [
      {
        id: "builder-pattern-typed",
        fn: "Builder Pattern (Typed)",
        desc: "Fluent interface for constructing complex objects with compile-time type safety — chainable setters with proper typing.",
        category: "Type Patterns",
        subtitle: "Fluent object construction with narrowing",
        signature: "class QueryBuilder<T> { where(cond: string): QueryBuilder<T> { return this } }",
        descLong: "The builder pattern creates objects through method chaining. With generics and conditional types, you can track what fields have been set and ensure only fully-initialized objects are returned. Each builder step narrows or extends the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Builder Pattern (Typed) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// SQL query builder with type safety\nclass QueryBuilder<T, Selected extends keyof T = never> {\n  private query: string = '';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Builder Pattern (Typed) — common patterns you'll see in production.\n// APPROACH  - Combine Builder Pattern (Typed) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nselect<K extends keyof T>(...fields: K[]): QueryBuilder<T, K> {\n    this.query += `SELECT ${String(fields).join(', ')}`;\n    return this as any;\n  }\n  where(condition: string): QueryBuilder<T, Selected> {\n    this.query += ` WHERE ${condition}`;\n    return this;\n  }\n  execute(): Promise<Pick<T, Selected>[]> {\n    return fetch(this.query).then(r => r.json());\n  }\n}\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  role: 'admin' | 'user';\n}\n// Builder pattern chains method calls\nconst query = new QueryBuilder<User>()\n  .select('id', 'name')\n  .where('role = \"admin\"');\n// Type at this point: QueryBuilder<User, 'id' | 'name'>\nconst results: Promise<Pick<User, 'id' | 'name'>[]> = query.execute();\n// Form builder with required fields\nclass FormBuilder<T, Required extends keyof T = never> {\n  private fields: Record<string, any> = {};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Builder Pattern (Typed) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfield<K extends keyof T>(name: K, defaultValue: T[K]): FormBuilder<T, Required | K> {\n    this.fields[name as string] = defaultValue;\n    return this as any;\n  }\n  build(): Required extends keyof T ? { form: T } : never {\n    if (Object.keys(this.fields).length < /* all required */) {\n      throw new Error('Missing required fields');\n    }\n    return { form: this.fields } as any;\n  }\n}\n// HTTP request builder\nclass RequestBuilder<T = undefined> {\n  private method: string = 'GET';\n  private url: string = '';\n  private body?: unknown;\n  request(method: string, url: string): RequestBuilder<undefined> {\n    this.method = method;\n    this.url = url;\n    return this;\n  }\n  send<B>(data: B): RequestBuilder<B> {\n    this.body = data;\n    return this as any;\n  }\n  async execute(): Promise<T> {\n    const resp = await fetch(this.url, {\n      method: this.method,\n      body: this.body ? JSON.stringify(this.body) : undefined,\n    });\n    return resp.json();\n  }\n}\n// Usage\nconst result = new RequestBuilder<{id: string}>()\n  .request('POST', '/api/users')\n  .send({ name: 'Alice', email: 'alice@example.com' })\n  .execute();"
                  }
        ],
        tips: [
                  "Generics track the builder state — each method can narrow or extend the type.",
                  "Return this as any is necessary to cast to the new type — the cast is safe if your builder logic is correct.",
                  "Fluent APIs enable method chaining — each call returns the builder for the next step.",
                  "Use conditional types in return values to enforce preconditions (all required fields set)."
        ],
        mistake: "Building a complex object without type-checking intermediate states — use generics to track what's been set and prevent premature finalization.",
        shorthand: {
          verbose: "const query = new QueryBuilder<User>()\n  .select('id', 'name')\n  .where('role = \"admin\"')\n  .execute(); // type: Promise<Pick<User, 'id' | 'name'>[]>",
          concise: "// Fluent API with generics tracking builder state",
        },
      },
      {
        id: "factory-pattern",
        fn: "Factory Pattern",
        desc: "Functions that create and type objects based on input — encapsulate construction logic with proper return types.",
        category: "Type Patterns",
        subtitle: "Type-safe object construction factories",
        signature: "function createUser(data: unknown): User | null { ... }",
        descLong: "Factory functions encapsulate object creation. With conditional types and type guards, they can return different types based on inputs. Factories are cleaner than constructors for complex validation and initialization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Factory Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Discriminated factory function\ntype Animal = { type: 'dog'; breed: string } | { type: 'cat'; color: string };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Factory Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Factory Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction createAnimal(type: 'dog', breed: string): {type: 'dog'; breed: string};\nfunction createAnimal(type: 'cat', color: string): {type: 'cat'; color: string};\nfunction createAnimal(type: string, param: string): Animal {\n  if (type === 'dog') return { type: 'dog', breed: param };\n  if (type === 'cat') return { type: 'cat', color: param };\n  throw new Error('Unknown animal type');\n}\nconst dog = createAnimal('dog', 'Golden Retriever'); // { type: 'dog'; breed: string }\nconst cat = createAnimal('cat', 'Orange');           // { type: 'cat'; color: string }\n// Database entity factory with validation\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n  createdAt: Date;\n}\nfunction createUser(data: unknown): User | null {\n  if (typeof data !== 'object' || data === null) return null;\n  const obj = data as Record<string, unknown>;\n  if (\n    typeof obj.id !== 'string' ||\n    typeof obj.name !== 'string' ||\n    typeof obj.email !== 'string'\n  ) {\n    return null;\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Factory Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nreturn {\n    id: obj.id,\n    name: obj.name,\n    email: obj.email,\n    createdAt: new Date(),\n  };\n}\n// API response factory\ntype ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };\nfunction createApiResult<T>(\n  isSuccess: boolean,\n  data: T | null,\n  error: string | null\n): ApiResult<T> {\n  if (isSuccess && data !== null) {\n    return { ok: true, data };\n  }\n  return { ok: false, error: error || 'Unknown error' };\n}\n// Generic factory with constraints\nfunction createCollection<T extends {id: string}>(items: T[]): Map<string, T> {\n  const map = new Map<string, T>();\n  items.forEach(item => map.set(item.id, item));\n  return map;\n}\nconst users = [{id: '1', name: 'Alice'}, {id: '2', name: 'Bob'}];\nconst userMap = createCollection(users); // Map<string, {id: string; name: string}>"
                  }
        ],
        tips: [
                  "Factory functions with overload signatures enable type-driven dispatch.",
                  "Validation in factories prevents invalid objects from being created.",
                  "Generic factories can work with any type that satisfies constraints.",
                  "Return discriminated unions to track success/failure at the type level."
        ],
        mistake: "Using loose factories that return any — validate inputs and return specific types for full type safety.",
        shorthand: {
          verbose: "// Manual factory without type safety\nfunction createUser(role: string) {\n  if (role === 'admin') {\n    return { role: 'admin', canDelete: true, canEdit: true };\n  } else {\n    return { role: 'user', canDelete: false, canEdit: false };\n  }\n}",
          concise: "type UserRole = 'admin' | 'user';\nconst createUser = (role: UserRole) => ({\n  role,\n  canDelete: role === 'admin',\n  canEdit: role === 'admin',\n} as const);",
        },
      },
      {
        id: "repository-pattern-typed",
        fn: "Repository Pattern",
        desc: "Generic data access abstraction — encapsulates query logic for entities with full type safety.",
        category: "Type Patterns",
        subtitle: "Type-safe data access layer",
        signature: "class Repository<T extends Entity> { async findById(id: string): Promise<T> { } }",
        descLong: "The repository pattern abstracts data access. A generic repository can work with any entity type that extends a base shape. Queries are typed — you get full IntelliSense and compile-time type checking for all operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Repository Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Base entity interface\ninterface Entity {\n  id: string;\n  createdAt: Date;\n  updatedAt: Date;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Repository Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Repository Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\n// Generic repository\nclass Repository<T extends Entity> {\n  private data: Map<string, T> = new Map();\n  async create(entity: Omit<T, keyof Entity>): Promise<T> {\n    const now = new Date();\n    const doc: T = {\n      id: crypto.randomUUID(),\n      createdAt: now,\n      updatedAt: now,\n      ...entity,\n    } as T;\n    this.data.set(doc.id, doc);\n    return doc;\n  }\n  async findById(id: string): Promise<T | null> {\n    return this.data.get(id) || null;\n  }\n  async findAll(): Promise<T[]> {\n    return Array.from(this.data.values());\n  }\n  async update(id: string, patch: Partial<Omit<T, keyof Entity>>): Promise<T | null> {\n    const entity = this.data.get(id);\n    if (!entity) return null;\n    const updated: T = {\n      ...entity,\n      ...patch,\n      updatedAt: new Date(),\n    } as T;\n    this.data.set(id, updated);\n    return updated;\n  }\n  async delete(id: string): Promise<boolean> {\n    return this.data.delete(id);\n  }\n}\n// User and Post entities\ninterface User extends Entity {\n  name: string;\n  email: string;\n  role: 'admin' | 'user';\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Repository Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\ninterface Post extends Entity {\n  title: string;\n  content: string;\n  authorId: string;\n}\n// Use typed repositories\nclass UserService {\n  private userRepository = new Repository<User>();\n  async createUser(name: string, email: string): Promise<User> {\n    return this.userRepository.create({ name, email, role: 'user' });\n  }\n  async getUser(id: string): Promise<User | null> {\n    return this.userRepository.findById(id);\n  }\n}\n// Query builder repository extension\nclass QueryableRepository<T extends Entity> extends Repository<T> {\n  async find(predicate: (entity: T) => boolean): Promise<T[]> {\n    const all = await this.findAll();\n    return all.filter(predicate);\n  }\n  async findOne(predicate: (entity: T) => boolean): Promise<T | null> {\n    const all = await this.findAll();\n    return all.find(predicate) || null;\n  }\n}\n// More queries with full type safety\nconst userRepo = new QueryableRepository<User>();\nconst adminUsers = await userRepo.find(u => u.role === 'admin');\nconst firstAdmin = await userRepo.findOne(u => u.role === 'admin');"
                  }
        ],
        tips: [
                  "Generic repositories work with any entity type — reuse across your app.",
                  "Extend the base repository for specific query patterns (findByEmail, etc).",
                  "Omit<T, keyof Entity> in create() prevents users from setting id/createdAt/updatedAt.",
                  "Repositories abstract storage — swap in-memory with database without changing types."
        ],
        mistake: "Making repositories too specific — keep them generic for reuse. Add query methods to subclasses for entity-specific queries.",
        shorthand: {
          verbose: "class Repository<T extends Entity> {\n  async findById(id: string): Promise<T | null> { ... }\n  async create(entity: Omit<T, keyof Entity>): Promise<T> { ... }\n}",
          concise: "// Generic repository works with any entity type",
        },
      },
      {
        id: "dependency-injection-typed",
        fn: "Dependency Injection",
        desc: "Pass dependencies as constructor parameters with strong typing — enables loose coupling and testability.",
        category: "Type Patterns",
        subtitle: "Type-safe constructor-based dependency injection",
        signature: "class UserService { constructor(private db: Database, private logger: Logger) {} }",
        descLong: "Dependency injection makes code testable and decoupled. With TypeScript, you declare dependencies as constructor parameters with explicit types. The type system ensures all dependencies are provided correctly at instantiation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dependency Injection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Define service interfaces\ninterface Logger {\n  log(msg: string): void;\n  error(msg: string, err?: Error): void;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dependency Injection — common patterns you'll see in production.\n// APPROACH  - Combine Dependency Injection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\ninterface Database {\n  query<T>(sql: string): Promise<T[]>;\n  exec(sql: string): Promise<void>;\n}\ninterface Cache {\n  get<T>(key: string): T | null;\n  set<T>(key: string, value: T): void;\n}\n// Services depend on interfaces\nclass UserService {\n  constructor(\n    private db: Database,\n    private logger: Logger,\n    private cache: Cache\n  ) {}\n  async getUser(id: string): Promise<{id: string; name: string} | null> {\n    const cacheKey = `user:${id}`;\n    // Check cache\n    const cached = this.cache.get<{id: string; name: string}>(cacheKey);\n    if (cached) {\n      this.logger.log(`Cache hit: ${cacheKey}`);\n      return cached;\n    }\n    try {\n      const results = await this.db.query<{id: string; name: string}>(\n        `SELECT * FROM users WHERE id = ${id}`\n      );\n      const user = results[0] || null;\n      if (user) {\n        this.cache.set(cacheKey, user);\n      }\n      return user;\n    } catch (err) {\n      this.logger.error('Failed to fetch user', err as Error);\n      return null;\n    }\n  }\n}\n// Test implementations with mock types\nclass MockLogger implements Logger {\n  log() {}\n  error() {}\n}\nclass MockDatabase implements Database {\n  async query<T>(): Promise<T[]> { return []; }\n  async exec(): Promise<void> {}\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dependency Injection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass MockCache implements Cache {\n  private data = new Map<string, any>();\n  get<T>(key: string): T | null { return this.data.get(key) || null; }\n  set<T>(key: string, value: T): void { this.data.set(key, value); }\n}\n// Easy to test — just pass mocks\nconst testLogger = new MockLogger();\nconst testDb = new MockDatabase();\nconst testCache = new MockCache();\nconst service = new UserService(testDb, testLogger, testCache);\nconst user = await service.getUser('123'); // Same interface, different implementation\n// DI Container (advanced)\nclass Container {\n  private services = new Map<string, any>();\n  register<T>(key: string, factory: () => T): void {\n    this.services.set(key, factory);\n  }\n  get<T>(key: string): T {\n    const factory = this.services.get(key);\n    if (!factory) throw new Error(`Service not found: ${key}`);\n    return factory();\n  }\n}\nconst container = new Container();\ncontainer.register('logger', () => new MockLogger());\ncontainer.register('db', () => new MockDatabase());\ncontainer.register('cache', () => new MockCache());\ncontainer.register('userService', () =>\n  new UserService(\n    container.get('db'),\n    container.get('logger'),\n    container.get('cache')\n  )\n);\nconst injectedService = container.get<UserService>('userService');"
                  }
        ],
        tips: [
                  "Use interfaces for dependencies — enables mocking in tests.",
                  "Constructor injection is the cleanest — dependencies are explicit.",
                  "Mock objects must implement the interface — compile-time verification.",
                  "DI containers are useful for large apps — start with constructor injection."
        ],
        mistake: "Using global singletons or service locators instead of constructor injection — harder to test and mock.",
        shorthand: {
          verbose: "class UserService {\n  constructor(\n    private db: Database,\n    private logger: Logger,\n    private cache: Cache\n  ) {}\n}",
          concise: "// Constructor injection makes dependencies explicit and testable",
        },
      },
      {
        id: "state-machine-typed",
        fn: "State Machine (Typed)",
        desc: "Discriminated unions for state machines — impossible states are unrepresentable at compile time.",
        category: "Type Patterns",
        subtitle: "Type-safe state transitions",
        signature: "type State = {status: \"idle\"} | {status: \"loading\"} | {status: \"done\"; data: T}",
        descLong: "State machines with discriminated unions prevent invalid state combinations. A form cannot be both idle and submitting. An API response cannot have both data and error. Each state is a separate type with only its valid properties.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of State Machine (Typed) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\n// Traffic light state machine\ntype TrafficLightState = 'red' | 'yellow' | 'green';"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of State Machine (Typed) — common patterns you'll see in production.\n// APPROACH  - Combine State Machine (Typed) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction nextState(current: TrafficLightState): TrafficLightState {\n  switch (current) {\n    case 'red': return 'green';\n    case 'green': return 'yellow';\n    case 'yellow': return 'red';\n  }\n}\n// Async operation with discriminated state\ntype AsyncState<T> =\n  | { status: 'idle' }\n  | { status: 'loading' }\n  | { status: 'success'; data: T }\n  | { status: 'error'; error: Error };\nfunction handleAsyncState<T>(state: AsyncState<T>) {\n  switch (state.status) {\n    case 'idle':\n      return <p>Not started</p>;\n    case 'loading':\n      return <Spinner />;\n    case 'success':\n      return <Result data={state.data} />;  // state.data is typed T\n    case 'error':\n      return <ErrorMsg error={state.error} />; // state.error is Error\n  }\n}\n// Form submission state machine\ntype FormState =\n  | { state: 'untouched'; values: Record<string, string> }\n  | { state: 'editing'; values: Record<string, string> }\n  | { state: 'validating'; values: Record<string, string> }\n  | { state: 'submitting'; values: Record<string, string> }\n  | { state: 'success'; submittedValues: Record<string, string> }\n  | { state: 'error'; values: Record<string, string>; error: string };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of State Machine (Typed) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nfunction submitForm(formState: FormState): Promise<FormState> {\n  if (formState.state !== 'validating') {\n    throw new Error('Can only submit from validating state');\n  }\n  return fetch('/api/submit', {\n    method: 'POST',\n    body: JSON.stringify(formState.values),\n  })\n    .then(() => ({\n      state: 'success' as const,\n      submittedValues: formState.values,\n    }))\n    .catch((err) => ({\n      state: 'error' as const,\n      values: formState.values,\n      error: err.message,\n    }));\n}\n// Authentication state machine\ntype AuthState =\n  | { status: 'unauthenticated' }\n  | { status: 'authenticating'; username: string }\n  | { status: 'authenticated'; user: {id: string; name: string}; token: string }\n  | { status: 'error'; message: string };\nfunction canAccess(auth: AuthState, resource: string): boolean {\n  if (auth.status !== 'authenticated') {\n    return false; // TypeScript knows auth.user doesn't exist here\n  }\n  return auth.user.id !== ''; // auth.user is narrowed to {id, name}\n}"
                  }
        ],
        tips: [
                  "Discriminated unions prevent impossible states — model them as separate type members.",
                  "Switch on the discriminant property (status, state) for exhaustive checking.",
                  "Each state branch can have only its relevant properties — no undefined checks needed.",
                  "Use readonly on the discriminant to prevent accidental mutations."
        ],
        mistake: "Using optional properties for state: {status: string; data?: T; error?: string} — allows impossible states like both data and error. Use discriminated unions instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype State = { status: 'idle' } | { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error };\n// More explicit but longer",
          concise: "// Discriminated unions prevent impossible states at compile time",
        },
      },
      {
        id: "builder-pattern-ts",
        fn: "Builder Pattern — Method Chaining with Type Safety",
        desc: "Construct complex objects step-by-step with fluent interface — each step narrows or extends the type.",
        category: "Type Patterns",
        subtitle: "Fluent interface, this returns, type narrowing, step-by-step construction",
        signature: "class Builder<T> { method(): Builder<T> { return this } }",
        descLong: "The builder pattern creates objects through method chaining. Each call returns this (or a narrowed/extended type). Perfect for SQL queries, HTTP requests, form construction, and any multi-step initialization. With generics, you can track which steps have been completed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Builder Pattern — Method Chaining with Type Safety — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\nclass StringBuilder {\n  private content: string = '';\n  append(text: string): this {\n    this.content += text;\n    return this;\n  }\n  appendLine(text: string): this {\n    this.content += text + '\\n';\n    return this;\n  }\n  build(): string {\n    return this.content;\n  }\n}\n// Usage: method chaining\nconst result = new StringBuilder()\n  .append('Hello ')\n  .append('World')\n  .appendLine('!')\n  .append('TypeScript')\n  .build();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Builder Pattern — Method Chaining with Type Safety — common patterns you'll see in production.\n// APPROACH  - Combine Builder Pattern — Method Chaining with Type Safety with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass UrlBuilder {\n  private url: string;\n  private params: Record<string, string> = {};\n  constructor(baseUrl: string) {\n    this.url = baseUrl;\n  }\n  path(...segments: string[]): this {\n    this.url += '/' + segments.join('/');\n    return this;\n  }\n  param(key: string, value: string | number): this {\n    this.params[key] = String(value);\n    return this;\n  }\n  build(): string {\n    const queryString = Object.entries(this.params)\n      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)\n      .join('&');\n    return this.url + (queryString ? '?' + queryString : '');\n  }\n}\n// Usage\nconst url = new UrlBuilder('https://api.example.com')\n  .path('api', 'v1', 'users')\n  .param('page', 1)\n  .param('limit', 10)\n  .param('sort', 'name')\n  .build();\n// https://api.example.com/api/v1/users?page=1&limit=10&sort=name\nclass RequestBuilder<T = undefined> {\n  private method: string = 'GET';\n  private url: string = '';\n  private headers: Record<string, string> = {};\n  private body?: unknown;\n  setMethod(method: 'GET' | 'POST' | 'PUT' | 'DELETE'): this {\n    this.method = method;\n    return this;\n  }\n  setUrl(url: string): this {\n    this.url = url;\n    return this;\n  }\n  header(key: string, value: string): this {\n    this.headers[key] = value;\n    return this;\n  }\n  jsonBody<B>(data: B): RequestBuilder<B> {\n    this.body = data;\n    this.headers['Content-Type'] = 'application/json';\n    return this as any;\n  }\n  async execute(): Promise<T> {\n    const response = await fetch(this.url, {\n      method: this.method,\n      headers: this.headers,\n      body: this.body ? JSON.stringify(this.body) : undefined,\n    });\n    return response.json();\n  }\n}\n// Usage with type tracking\ninterface CreateUserResponse {\n  id: string;\n  name: string;\n  email: string;\n}\nconst response = await new RequestBuilder<CreateUserResponse>()\n  .setMethod('POST')\n  .setUrl('/api/users')\n  .header('Authorization', 'Bearer token')\n  .jsonBody({ name: 'Alice', email: 'alice@example.com' })\n  .execute();\n// response is typed as CreateUserResponse"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Builder Pattern — Method Chaining with Type Safety — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass QueryBuilder<T, Selected extends keyof T = never> {\n  private query: string = '';\n  select<K extends keyof T>(...fields: K[]): QueryBuilder<T, K> {\n    this.query += `SELECT ${String(fields).join(', ')} `;\n    return this as any;\n  }\n  from(table: string): this {\n    this.query += `FROM ${table} `;\n    return this;\n  }\n  where(condition: string): this {\n    this.query += `WHERE ${condition} `;\n    return this;\n  }\n  build(): string {\n    return this.query.trim();\n  }\n}\nconst sqlQuery = new QueryBuilder<{ id: string; name: string; email: string }>()\n  .select('id', 'name')\n  .from('users')\n  .where('active = true')\n  .build();\n// SELECT id, name FROM users WHERE active = true"
                  }
        ],
        tips: [
                  "Return this for method chaining — users can call multiple methods in sequence.",
                  "Return this as any when changing the generic type — narrows or extends the builder state.",
                  "Build step-by-step — each method modifies internal state and returns the builder.",
                  "build() method finalizes and returns the result — prevent partial builds with type system."
        ],
        mistake: "Returning void instead of this — breaks method chaining.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst builder = new QueryBuilder(); builder.select(...); builder.from(...); builder.where(...); const query = builder.build();\n// More explicit but longer",
          concise: "new QueryBuilder().select(...).from(...).where(...).build(); // Fluent chaining",
        },
      },
      {
        id: "result-type",
        fn: "Result/Either Type — Error Handling Without Exceptions",
        desc: "Return Result<T, E> instead of throwing — explicit error handling, composable operations.",
        category: "Type Patterns",
        subtitle: "Result<T, E>, Ok/Err, Result chaining, map/flatMap",
        signature: "type Result<T, E> = { ok: true; value: T } | { ok: false; error: E }",
        descLong: "Instead of throwing exceptions, return a Result type that represents success or failure. Errors are values, not control flow. Composable with map/flatMap. Similar to Rust's Result, Go's error returns, or Haskell's Either. Prevents unwinding the call stack.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Result/Either Type — Error Handling Without Exceptions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };\nfunction ok<T, E>(value: T): Result<T, E> {\n  return { ok: true, value };\n}\nfunction err<T, E>(error: E): Result<T, E> {\n  return { ok: false, error };\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Result/Either Type — Error Handling Without Exceptions — common patterns you'll see in production.\n// APPROACH  - Combine Result/Either Type — Error Handling Without Exceptions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass Database {\n  async getUser(id: string): Promise<Result<{ id: string; name: string }, string>> {\n    try {\n      if (!id) {\n        return err('User ID required');\n      }\n      const response = await fetch(`/api/users/${id}`);\n      if (!response.ok) {\n        return err(`HTTP ${response.status}`);\n      }\n      const user = await response.json();\n      return ok(user);\n    } catch (e) {\n      return err(e instanceof Error ? e.message : 'Unknown error');\n    }\n  }\n}\nconst db = new Database();\nconst result = await db.getUser('user-123');\nif (result.ok) {\n  console.log('User found:', result.value.name);\n} else {\n  console.error('Error:', result.error);\n}\ninterface Result<T, E = Error> {\n  ok: true;\n  value: T;\n}\n| {\n  ok: false;\n  error: E;\n}\n// Helper functions for composition\nfunction map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {\n  return result.ok ? { ok: true, value: fn(result.value) } : result;\n}\nfunction flatMap<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {\n  return result.ok ? fn(result.value) : result;\n}\n// Usage: chaining operations\nconst processUser = async (userId: string): Promise<Result<string, string>> => {\n  const userResult = await db.getUser(userId);\n  return flatMap(userResult, (user) => {\n    if (user.name.length === 0) {\n      return err('Invalid user name');\n    }\n    return ok(user.name.toUpperCase());\n  });\n};\nconst output = await processUser('user-123');\nif (output.ok) {\n  console.log('Processed:', output.value);\n} else {\n  console.log('Failed:', output.error);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Result/Either Type — Error Handling Without Exceptions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst combineResults = <T, U, E>(\n  r1: Result<T, E>,\n  r2: Result<U, E>,\n  fn: (t: T, u: U) => string\n): Result<string, E> => {\n  if (!r1.ok) return r1;\n  if (!r2.ok) return r2;\n  return ok(fn(r1.value, r2.value));\n};\ntype ApiError = { type: 'network'; code: number } | { type: 'validation'; fields: string[] };\ntype ApiResult<T> = Result<T, ApiError>;\nconst apiCall = (): ApiResult<{ status: string }> => {\n  // ... API logic\n  return err({ type: 'validation', fields: ['email', 'name'] });\n};\nconst result = apiCall();\nif (!result.ok) {\n  switch (result.error.type) {\n    case 'network':\n      console.error(`Network error: ${result.error.code}`);\n      break;\n    case 'validation':\n      console.error(`Validation failed: ${result.error.fields.join(', ')}`);\n      break;\n  }\n}"
                  }
        ],
        tips: [
                  "Result makes error cases explicit — no surprise exceptions.",
                  "flatMap chains Result operations — compose multiple fallible operations.",
                  "Use union types for structured error information.",
                  "Result is like Promise but synchronous — both represent eventual values."
        ],
        mistake: "Mixing exceptions and Result types — commit to one style in a module.",
        shorthand: {
          verbose: "try {\n  const user = await db.getUser(id);\n  const processed = processUser(user);\n  return processed;\n} catch (e) {\n  console.error(e);\n}",
          concise: "const userResult = await db.getUser(id); if (userResult.ok) { return processUser(userResult.value); } else { console.error(userResult.error); }",
        },
      },
      {
        id: "option-type",
        fn: "Option/Maybe Type — Null-Safe Operations",
        desc: "Represent optional values as Some(value) | None — eliminates null checks.",
        category: "Type Patterns",
        subtitle: "Some<T>, None, map, flatMap, getOrElse, no null checks",
        signature: "type Option<T> = { some: true; value: T } | { some: false }",
        descLong: "Option (also called Maybe) wraps optional values. Instead of null/undefined, values are either Some(value) or None. Composable with map/flatMap. Eliminates null reference errors — TypeScript forces you to handle the None case.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Option/Maybe Type — Null-Safe Operations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ntype Option<T> = { tag: 'some'; value: T } | { tag: 'none' };\nfunction Some<T>(value: T): Option<T> {\n  return { tag: 'some', value };\n}\nfunction None<T>(): Option<T> {\n  return { tag: 'none' };\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Option/Maybe Type — Null-Safe Operations — common patterns you'll see in production.\n// APPROACH  - Combine Option/Maybe Type — Null-Safe Operations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nfunction map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U> {\n  return option.tag === 'some' ? Some(fn(option.value)) : None();\n}\nfunction flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U> {\n  return option.tag === 'some' ? fn(option.value) : None();\n}\nfunction getOrElse<T>(option: Option<T>, defaultValue: T): T {\n  return option.tag === 'some' ? option.value : defaultValue;\n}\nfunction isSome<T>(option: Option<T>): boolean {\n  return option.tag === 'some';\n}\nclass UserRepository {\n  private users = new Map<string, { id: string; name: string }>();\n  findById(id: string): Option<{ id: string; name: string }> {\n    const user = this.users.get(id);\n    return user ? Some(user) : None();\n  }\n  findByEmail(email: string): Option<{ id: string; name: string }> {\n    for (const user of this.users.values()) {\n      if (user.name === email) return Some(user);\n    }\n    return None();\n  }\n}\nconst repo = new UserRepository();\n// Pattern match on Option\nconst userOption = repo.findById('user-123');\nif (userOption.tag === 'some') {\n  console.log('Found user:', userOption.value.name);\n} else {\n  console.log('User not found');\n}\nconst userName = map(\n  repo.findById('user-123'),\n  (user) => user.name.toUpperCase()\n);\nif (userName.tag === 'some') {\n  console.log(userName.value); // User name in uppercase\n} else {\n  console.log('No user found');\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Option/Maybe Type — Null-Safe Operations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst getManagerName = (userId: string): Option<string> => {\n  return flatMap(repo.findById(userId), (user) => {\n    // Get manager info from user\n    const managerId = 'manager-' + userId;\n    return map(repo.findById(managerId), (manager) => manager.name);\n  });\n};\nconst displayName = (userId: string): string => {\n  return getOrElse(\n    map(repo.findById(userId), (user) => user.name),\n    'Anonymous'\n  );\n};\nconst combineNames = (userId1: string, userId2: string): Option<string> => {\n  return flatMap(repo.findById(userId1), (user1) => {\n    return map(repo.findById(userId2), (user2) => {\n      return `${user1.name} & ${user2.name}`;\n    });\n  });\n};\nconst result = combineNames('user-1', 'user-2');\n// Returns Some(\"Alice & Bob\") or None()"
                  }
        ],
        tips: [
                  "Option makes null checks compile-time enforced — TypeScript prevents accessing .value on None.",
                  "map() transforms the value if Some, does nothing if None.",
                  "flatMap() chains Option operations — eliminates nested None checks.",
                  "getOrElse() provides fallback values for None cases."
        ],
        mistake: "Using optional chaining (?.) everywhere instead of Option — Option is more explicit.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst user = repo.findById(id); if (user) { console.log(user.name); } else { console.log('Not found'); }\n// More explicit but longer",
          concise: "const result = map(repo.findById(id), u => u.name); console.log(isSome(result) ? result.value : 'Not found');",
        },
      },
      {
        id: "event-emitter-ts",
        fn: "Type-Safe Event Emitter",
        desc: "EventEmitter with typed events — compiler enforces correct event names and payloads.",
        category: "Type Patterns",
        subtitle: "EventMap, typed on/emit, discriminated unions, event handling",
        signature: "class EventEmitter<EventMap> { on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): this }",
        descLong: "Standard Node.js EventEmitter is untyped. With generic EventMap, each event has a typed payload. TypeScript ensures you emit the right data for each event and handle the right types in listeners. Perfect for pub/sub, state machines, and reactive systems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type-Safe Event Emitter — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface UserEvents {\n  'user:created': { id: string; name: string };\n  'user:updated': { id: string; changes: Partial<{ name: string }> };\n  'user:deleted': { id: string };\n  'error': Error;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type-Safe Event Emitter — common patterns you'll see in production.\n// APPROACH  - Combine Type-Safe Event Emitter with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass EventEmitter<EventMap> {\n  private listeners: Map<keyof EventMap, Function[]> = new Map();\n  on<K extends keyof EventMap>(\n    event: K,\n    handler: (data: EventMap[K]) => void\n  ): this {\n    if (!this.listeners.has(event)) {\n      this.listeners.set(event, []);\n    }\n    this.listeners.get(event)!.push(handler);\n    return this;\n  }\n  off<K extends keyof EventMap>(\n    event: K,\n    handler: (data: EventMap[K]) => void\n  ): this {\n    const handlers = this.listeners.get(event);\n    if (handlers) {\n      const index = handlers.indexOf(handler);\n      if (index > -1) {\n        handlers.splice(index, 1);\n      }\n    }\n    return this;\n  }\n  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): boolean {\n    const handlers = this.listeners.get(event);\n    if (!handlers) return false;\n    handlers.forEach((handler) => handler(data));\n    return true;\n  }\n  once<K extends keyof EventMap>(\n    event: K,\n    handler: (data: EventMap[K]) => void\n  ): this {\n    const onceHandler = (data: EventMap[K]) => {\n      handler(data);\n      this.off(event, onceHandler);\n    };\n    return this.on(event, onceHandler);\n  }\n}\nclass UserService extends EventEmitter<UserEvents> {\n  createUser(name: string): string {\n    const id = 'user-' + Math.random();\n    this.emit('user:created', { id, name }); // ✓ Correct payload\n    // this.emit('user:created', { id }); // ✗ Missing name\n    // this.emit('unknown', {}); // ✗ Unknown event\n    return id;\n  }\n  updateUser(id: string, changes: Partial<{ name: string }>): void {\n    this.emit('user:updated', { id, changes });\n  }\n  deleteUser(id: string): void {\n    this.emit('user:deleted', { id });\n  }\n}\nconst userService = new UserService();\nuserService.on('user:created', (data) => {\n  console.log(`Created user: ${data.name}`); // data.id and data.name available\n  // console.log(data.unknown); // ✗ unknown field\n});\nuserService.on('user:deleted', (data) => {\n  console.log(`Deleted user: ${data.id}`); // Only id available\n});\nuserService.on('error', (err) => {\n  console.error('Error:', err.message);\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type-Safe Event Emitter — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nuserService.once('user:created', (data) => {\n  console.log(`First user created: ${data.name}`); // Fires once\n});\nuserService\n  .on('user:created', (data) => console.log('Created:', data.id))\n  .on('user:updated', (data) => console.log('Updated:', data.id))\n  .on('user:deleted', (data) => console.log('Deleted:', data.id));"
                  }
        ],
        tips: [
                  "EventMap is a discriminated union of events — each event has a unique payload type.",
                  "on() enforces both event name and data type — compile-time verification.",
                  "once() for single-fire listeners — automatically removed after first emission.",
                  "Return this for method chaining — allows fluent listener registration."
        ],
        mistake: "Using string literals for event names instead of typed on/emit — loses all type safety.",
        shorthand: {
          verbose: "// Manual / verbose approach\nemitter.on('user:created', (data) => { }); // Any data, no type checking\nemitter.emit('user:created', { anything: 123 }); // Any payload\n// More explicit but longer",
          concise: "userService.on('user:created', (data: UserEvents['user:created']) => { });",
        },
      },
      {
        id: "dependency-injection-ts",
        fn: "Dependency Injection with Interfaces",
        desc: "Constructor injection with interface-based loose coupling — easy to test, mock, and extend.",
        category: "Type Patterns",
        subtitle: "Constructor injection, interfaces, DI container, factories",
        signature: "class Service { constructor(private dependency: Interface) {} }",
        descLong: "Dependency injection decouples components. Interfaces define contracts. Implementations inject via constructor. Easy to test with mocks. Scales with DI containers for large apps. TypeScript enforces that all dependencies are satisfied at compile time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dependency Injection with Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface Logger {\n  log(message: string): void;\n  error(message: string, error?: Error): void;\n}\ninterface UserRepository {\n  findById(id: string): Promise<{ id: string; name: string } | null>;\n  save(user: { name: string }): Promise<{ id: string; name: string }>;\n}\ninterface EmailService {\n  send(to: string, subject: string, body: string): Promise<void>;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dependency Injection with Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Dependency Injection with Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass ConsoleLogger implements Logger {\n  log(message: string): void {\n    console.log(message);\n  }\n  error(message: string, error?: Error): void {\n    console.error(message, error);\n  }\n}\nclass InMemoryUserRepository implements UserRepository {\n  private users = new Map<string, { id: string; name: string }>();\n  async findById(id: string) {\n    return this.users.get(id) || null;\n  }\n  async save(user: { name: string }) {\n    const id = 'user-' + Math.random();\n    const doc = { id, ...user };\n    this.users.set(id, doc);\n    return doc;\n  }\n}\nclass MockEmailService implements EmailService {\n  async send(to: string, subject: string, body: string): Promise<void> {\n    console.log(`Mock email to ${to}: ${subject}`);\n  }\n}\nclass UserService {\n  constructor(\n    private logger: Logger,\n    private userRepository: UserRepository,\n    private emailService: EmailService\n  ) {}\n  async createUser(name: string): Promise<{ id: string; name: string }> {\n    this.logger.log(`Creating user: ${name}`);\n    const user = await this.userRepository.save({ name });\n    await this.emailService.send(\n      `user-${user.id}@example.com`,\n      'Welcome!',\n      `Welcome ${user.name}`\n    );\n    return user;\n  }\n  async getUser(id: string): Promise<{ id: string; name: string } | null> {\n    return this.userRepository.findById(id);\n  }\n}\nconst testLogger = new ConsoleLogger();\nconst testRepo = new InMemoryUserRepository();\nconst testEmail = new MockEmailService();\nconst userService = new UserService(testLogger, testRepo, testEmail);\nconst newUser = await userService.createUser('Alice');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dependency Injection with Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nclass Container {\n  private singletons = new Map<string, any>();\n  register<T>(key: string, factory: () => T): void {\n    this.singletons.set(key, factory);\n  }\n  get<T>(key: string): T {\n    const factory = this.singletons.get(key);\n    if (!factory) throw new Error(`No factory registered for ${key}`);\n    return factory();\n  }\n}\nconst container = new Container();\n// Register implementations\ncontainer.register('logger', () => new ConsoleLogger());\ncontainer.register('userRepository', () => new InMemoryUserRepository());\ncontainer.register('emailService', () => new MockEmailService());\n// Register service\ncontainer.register('userService', () => {\n  return new UserService(\n    container.get<Logger>('logger'),\n    container.get<UserRepository>('userRepository'),\n    container.get<EmailService>('emailService')\n  );\n});\n// Use the container\nconst service = container.get<UserService>('userService');\nclass RealEmailService implements EmailService {\n  async send(to: string, subject: string, body: string): Promise<void> {\n    // Actually send email via SMTP\n  }\n}\n// Just replace the registration\ncontainer.register('emailService', () => new RealEmailService());\nconst realService = container.get<UserService>('userService'); // Uses RealEmailService now"
                  }
        ],
        tips: [
                  "Define interfaces for all dependencies — enables mocking in tests.",
                  "Constructor parameters are explicit — easy to see what a class depends on.",
                  "Inject interfaces, not concrete classes — easy to swap implementations.",
                  "DI containers are useful for large apps — start with manual injection."
        ],
        mistake: "Using global singletons or service locators — harder to test and replace.",
        shorthand: {
          verbose: "// Manual / verbose approach\nclass UserService { private logger = console; private repo = db; }\n// More explicit but longer",
          concise: "class UserService { constructor(private logger: Logger, private repo: Repository) {} }",
        },
      },
      {
        id: "command-pattern-ts",
        fn: "Command Pattern — Undo/Redo with Type Safety",
        desc: "Encapsulate actions as Command objects — enables undo/redo, logging, and queuing.",
        category: "Type Patterns",
        subtitle: "Command interface, execute/undo, command history, discriminated unions",
        signature: "interface Command { execute(): void; undo(): void; }",
        descLong: "The command pattern wraps actions as objects. Each command knows how to execute and undo itself. Build undo/redo stacks, log commands, or queue them. With discriminated unions, each command type has specific parameters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Command Pattern — Undo/Redo with Type Safety — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - simplest usage — core API only\n// STRENGTHS - easy to understand, shows the basics\n// WEAKNESSES- no error handling, no edge cases\n//\ninterface Command {\n  execute(): void;\n  undo(): void;\n  description: string;\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Command Pattern — Undo/Redo with Type Safety — common patterns you'll see in production.\n// APPROACH  - Combine Command Pattern — Undo/Redo with Type Safety with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - real-world usage with proper patterns\n// STRENGTHS - production-ready, handles common cases\n// WEAKNESSES- no advanced optimization\n//\nclass SetNameCommand implements Command {\n  description = 'Set name';\n  constructor(\n    private target: { name: string },\n    private newName: string,\n    private previousName: string\n  ) {}\n  execute(): void {\n    this.target.name = this.newName;\n  }\n  undo(): void {\n    this.target.name = this.previousName;\n  }\n}\nclass AddItemCommand implements Command {\n  description = 'Add item';\n  constructor(\n    private list: string[],\n    private item: string,\n    private index: number\n  ) {}\n  execute(): void {\n    this.list.splice(this.index, 0, this.item);\n  }\n  undo(): void {\n    this.list.splice(this.index, 1);\n  }\n}\nclass DeleteItemCommand implements Command {\n  description = 'Delete item';\n  private deletedItem: string = '';\n  constructor(private list: string[], private index: number) {}\n  execute(): void {\n    this.deletedItem = this.list[this.index];\n    this.list.splice(this.index, 1);\n  }\n  undo(): void {\n    this.list.splice(this.index, 0, this.deletedItem);\n  }\n}\nclass CommandHistory {\n  private history: Command[] = [];\n  private currentIndex: number = -1;\n  execute(command: Command): void {\n    command.execute();\n    this.history = this.history.slice(0, this.currentIndex + 1);\n    this.history.push(command);\n    this.currentIndex++;\n  }\n  undo(): boolean {\n    if (this.currentIndex < 0) return false;\n    const command = this.history[this.currentIndex];\n    command.undo();\n    this.currentIndex--;\n    return true;\n  }\n  redo(): boolean {\n    if (this.currentIndex >= this.history.length - 1) return false;\n    this.currentIndex++;\n    const command = this.history[this.currentIndex];\n    command.execute();\n    return true;\n  }\n  canUndo(): boolean {\n    return this.currentIndex >= 0;\n  }\n  canRedo(): boolean {\n    return this.currentIndex < this.history.length - 1;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Command Pattern — Undo/Redo with Type Safety — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - advanced patterns, edge cases, and decision rules\n// STRENGTHS - comprehensive, handles edge cases\n// WEAKNESSES- N/A\n//\nconst history = new CommandHistory();\nconst user = { name: 'Alice' };\nconst items: string[] = [];\n// Execute commands\nhistory.execute(new SetNameCommand(user, 'Bob', 'Alice'));\nhistory.execute(new AddItemCommand(items, 'Apple', 0));\nhistory.execute(new AddItemCommand(items, 'Banana', 1));\nconsole.log(user.name); // \"Bob\"\nconsole.log(items); // [\"Apple\", \"Banana\"]\n// Undo\nhistory.undo();\nconsole.log(items); // [\"Apple\"]\nhistory.undo();\nconsole.log(items); // []\nhistory.undo();\nconsole.log(user.name); // \"Alice\"\n// Redo\nhistory.redo();\nconsole.log(user.name); // \"Bob\"\ntype TextCommand =\n  | { type: 'insertText'; position: number; text: string }\n  | { type: 'deleteText'; position: number; length: number }\n  | { type: 'replaceText'; position: number; length: number; text: string };\nclass TextEditor {\n  private history: TextCommand[] = [];\n  private content: string = '';\n  execute(command: TextCommand): void {\n    switch (command.type) {\n      case 'insertText':\n        this.content =\n          this.content.slice(0, command.position) +\n          command.text +\n          this.content.slice(command.position);\n        break;\n      case 'deleteText':\n        this.content =\n          this.content.slice(0, command.position) +\n          this.content.slice(command.position + command.length);\n        break;\n      case 'replaceText':\n        this.content =\n          this.content.slice(0, command.position) +\n          command.text +\n          this.content.slice(command.position + command.length);\n        break;\n    }\n    this.history.push(command);\n  }\n}"
                  }
        ],
        tips: [
                  "Command objects encapsulate an action and its undo logic.",
                  "CommandHistory maintains a stack — enables undo/redo.",
                  "Each command knows how to reverse itself — prevents data duplication.",
                  "Discriminated unions for command types — TypeScript ensures exhaustive handling."
        ],
        mistake: "Implementing undo by storing state snapshots — commands are more efficient.",
        shorthand: {
          verbose: "// Manual / verbose approach\ninterface Command { execute(): void; undo(): void; }\nclass SetNameCommand implements Command { execute() { ... } undo() { ... } }\n// More explicit but longer",
          concise: "// Command pattern: actions as objects, undo/redo via history stack",
        },
      },
    ],
  },
]

export default { meta, sections }
