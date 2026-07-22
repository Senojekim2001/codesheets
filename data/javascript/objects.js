export const meta = {
  "title": "Objects & Classes",
  "domain": "javascript",
  "sheet": "objects",
  "icon": "🏛️"
}

export const sections = [

  // ── Section 1: Object Fundamentals ─────────────────────────────────────────
  {
    id: "object-fundamentals",
    title: "Object Fundamentals",
    entries: [
      {
        id: "object-literal",
        fn: "Object Literal",
        desc: "Create objects with {key: value} syntax, shorthand properties, computed keys, and method shorthand.",
        category: "Object Fundamentals",
        subtitle: "Inline object construction syntax",
        signature: "{ key, [expr]: val, method() {} }",
        descLong: "Modern JS object literals support shorthand properties (when variable name matches key), computed property names, and method shorthand syntax. These make creating objects clean and expressive.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object Literal — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest object literal: key-value pairs.\n// STRENGTHS - one line; shows basic object creation.\n// WEAKNESSES- no shorthand, no computed keys, no methods.\n//\n// GOAL: build an object with literals\nconst user = { name: 'Alice', age: 30 };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object Literal — common patterns you'll see in production.\n// APPROACH  - Combine Object Literal with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - shorthand properties, computed keys, and method shorthand.\n// STRENGTHS - covers the 80% case: shorthand, computed keys, getters.\n// WEAKNESSES- no spread, no private fields, no static methods.\n//\n// GOAL: use shorthand, computed keys, and methods\n// WHY: shorthand when variable name matches key\nconst name = 'Alice';\nconst age = 30;\nconst user = { name, age };\n// WHY: computed keys for dynamic property names\nconst field = 'email';\nconst record = { [field]: 'alice@example.com' };\n// WHY: method shorthand is cleaner\nconst obj = {\n  greet() { return `Hi, ${this.name}`; },\n  get fullName() { return `${this.first} ${this.last}`; }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object Literal — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production object construction: factory functions with\n//             computed keys, frozen config objects, and object literal\n//             vs class decision framework.\n// STRENGTHS - factory pattern with computed keys; frozen config;\n//             clear literal vs class guidance.\n// WEAKNESSES- no prototype chain discussion; no Symbol keys.\n//\n// GOAL: build objects idiomatically\n// WHY: method shorthand cannot be used with new\n// Factory function with computed keys and validation\nfunction createUser(name, role, extra = {}) {\n  const id = crypto.randomUUID();\n  return {\n    id,\n    name,\n    role,\n    createdAt: new Date(),\n    [`can_${role}`]: true,\n    ...extra,\n    greet() { return `Hi, I'm ${this.name}`; },\n    get isAdmin() { return this.role === 'admin'; },\n  };\n}\nconst admin = createUser('Alice', 'admin', { department: 'eng' });\n// { id, name: 'Alice', role: 'admin', createdAt, can_admin: true, department: 'eng', greet(), isAdmin: true }\n// Frozen config object with computed keys\nconst ENV = 'production';\nconst config = Object.freeze({\n  [`API_URL_${ENV}`]: 'https://api.example.com',\n  timeout: 5000,\n  retries: 3,\n});\n// Decision rule:\n//   fixed known keys                                         -> literal syntax\n//   dynamic keys                                             -> computed property names\n//   simple data + behavior                                   -> object literal / factory\n//   constructor/inheritance                                  -> class\n//   immutable config                                         -> Object.freeze + literal\n//\n// Anti-pattern: method shorthand as constructor; using class when a\n//   factory function is simpler and more flexible."
                  }
        ],
        tips: [
                  "Shorthand properties (just { name } instead of { name: name }) reduce repetition.",
                  "Computed keys ([expr]) allow dynamic property names at creation time.",
                  "Method shorthand (fn() {}) is equivalent to fn: function() {} but cannot be used with new.",
                  "Object literals are often preferable to classes for simple data + behavior bundles."
        ],
        mistake: "Using method shorthand and expecting it to work as a constructor. Shorthand methods cannot be called with new — use function expressions or class syntax for constructors.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-assign-spread",
        fn: "Object.assign() / Spread",
        desc: "Merge or copy object properties. Spread (...) is the modern idiomatic way.",
        category: "Object Fundamentals",
        subtitle: "Merging and shallow copying objects",
        signature: "{ ...obj }  |  Object.assign(target, ...sources)",
        descLong: "Both perform a shallow copy/merge — nested objects are copied by reference. Spread is more readable and idiomatic in modern JS. Object.assign() mutates the target. Use spread to create new objects without mutation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.assign() / Spread — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest spread/assign: shallow copy and merge.\n// STRENGTHS - two lines; shows copy and merge.\n// WEAKNESSES- no shallow copy warning, no Object.assign.\n//\n// GOAL: copy and merge objects\nconst copy = { ...original };\nconst merged = { ...defaults, ...overrides };"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.assign() / Spread — common patterns you'll see in production.\n// APPROACH  - Combine Object.assign() / Spread with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - understand shallow copy, override behavior, and Object.assign.\n// STRENGTHS - covers the 80% case: spread merge, Object.assign, shallow copy warning.\n// WEAKNESSES- no deep copy solution, no immutable update patterns.\n//\n// GOAL: understand shallow copy and override behavior\n// WHY: later spread wins\nconst defaults = { color: 'blue', size: 'md' };\nconst overrides = { color: 'red', padding: 8 };\nconst merged = { ...defaults, ...overrides };\n// { color: 'red', size: 'md', padding: 8 }\n// WHY: Object.assign mutates the first argument\nObject.assign({}, defaults, overrides);\n// WHY: nested objects are shared\nconst a = { nested: { x: 1 } };\nconst b = { ...a };\nb.nested.x = 99; // mutates a.nested too!"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.assign() / Spread — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production object merging: deep merge utility, immutable\n//             state updates, and structuredClone for deep copies.\n// STRENGTHS - deep merge function; immutable nested update pattern;\n//             structuredClone for true deep copy.\n// WEAKNESSES- no performance benchmark; deep merge is simplistic.\n//\n// GOAL: merge objects correctly\n// WHY: spread/assign are shallow — nested objects are shared\n// Deep merge utility (does not mutate inputs)\nfunction deepMerge(target, ...sources) {\n  const result = { ...target };\n  for (const source of sources) {\n    for (const key of Object.keys(source)) {\n      const tVal = result[key];\n      const sVal = source[key];\n      if (isObject(tVal) && isObject(sVal)) {\n        result[key] = deepMerge(tVal, sVal);\n      } else {\n        result[key] = sVal;\n      }\n    }\n  }\n  return result;\n}\nfunction isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }\n// Immutable nested state update (React-friendly)\nconst state = { user: { profile: { name: 'Alice' } } };\nconst updated = {\n  ...state,\n  user: { ...state.user, profile: { ...state.user.profile, name: 'Bob' } },\n};\n// state is unchanged; updated.user.profile.name === 'Bob'\n// True deep copy with structuredClone\nconst original = { nested: { date: new Date(), list: [1, 2] } };\nconst deepCopy = structuredClone(original);\ndeepCopy.nested.list.push(3); // original.nested.list is still [1, 2]\n// Decision rule:\n//   shallow copy or merge with overrides                           -> spread\n//   mutating an existing target                                    -> Object.assign(target, ...)\n//   true deep copy                                                 -> structuredClone\n//   immutable state update (React)                                  -> { ...state, field: value }\n//   deep merge nested objects                                      -> deepMerge utility\n//\n// Anti-pattern: assuming nested objects are copied by spread; using\n//   JSON.parse(JSON.stringify()) for deep clone (loses Date, Map, undefined)."
                  }
        ],
        tips: [
                  "Spread creates a new object — prefer it over Object.assign() for immutable updates.",
                  "Properties later in the spread win — put overrides after defaults.",
                  "Both are shallow — nested objects are still shared references.",
                  "Use structured clone or a deep-clone library when you need a true deep copy."
        ],
        mistake: "Assuming spread creates a deep copy — nested objects are still shared. Mutating a nested property on the copy also mutates the original.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-keys-values-entries",
        fn: "Object.keys() / .values() / .entries()",
        desc: "Return arrays of an object's own enumerable property keys, values, or [key, value] pairs.",
        category: "Object Fundamentals",
        subtitle: "Enumerate own enumerable properties",
        signature: "Object.keys(obj)  |  Object.values(obj)  |  Object.entries(obj)",
        descLong: "All three return arrays of an object's own (not inherited) enumerable properties. .entries() is especially useful for iterating key-value pairs in for...of loops or converting to a Map. Pair with Object.fromEntries() to transform objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.keys() / .values() / .entries() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest enumeration: keys, values, entries.\n// STRENGTHS - three lines; shows all three methods.\n// WEAKNESSES- no iteration, no fromEntries, no symbol handling.\n//\n// GOAL: enumerate object keys, values, and entries\nconst user = { name: 'Alice', age: 30 };\nObject.keys(user);    // ['name', 'age']\nObject.values(user);  // ['Alice', 30]\nObject.entries(user); // [['name','Alice'],['age',30]]"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.keys() / .values() / .entries() — common patterns you'll see in production.\n// APPROACH  - Combine Object.keys() / .values() / .entries() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - iterate with entries, transform with fromEntries.\n// STRENGTHS - covers the 80% case: for...of iteration, object transformation.\n// WEAKNESSES- no symbol key handling, no property order discussion.\n//\n// GOAL: iterate and transform objects\n// WHY: entries are perfect for for...of loops\nfor (const [key, val] of Object.entries(user)) {\n  console.log(`${key}: ${val}`);\n}\n// WHY: pair with Object.fromEntries to transform\nconst upper = Object.fromEntries(\n  Object.entries(user).map(([k, v]) =>\n    [k, typeof v === 'string' ? v.toUpperCase() : v]\n  )\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.keys() / .values() / .entries() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production object enumeration: safe iteration, Map conversion,\n//             symbol key handling, and property order guarantees.\n// STRENGTHS - safe iteration with Object.hasOwn; Map conversion; symbol keys\n//             via Reflect.ownKeys; property order explanation.\n// WEAKNESSES- no performance comparison of approaches.\n//\n// GOAL: enumerate safely and efficiently\n// WHY: these return only own enumerable string-keyed properties\n// Safe iteration: filter inherited props in for...in\nconst obj = Object.create({ inherited: true });\nobj.own = 1;\nfor (const key in obj) {\n  if (Object.hasOwn(obj, key)) console.log(key, obj[key]); // 'own' only\n}\n// Object to Map and back\nconst map = new Map(Object.entries(obj));\nconst back = Object.fromEntries(map);\n// All keys including symbols and non-enumerable\nconst allKeys = Reflect.ownKeys(obj); // strings + symbols\n// Property order: integer keys sort numerically, then string keys in insertion order\nconst ordered = { b: 1, 2: 'two', a: 3, 1: 'one' };\nObject.keys(ordered); // ['1', '2', 'b', 'a']\n// Transform with filter and map in one pass\nfunction pickBy(obj, predicate) {\n  return Object.fromEntries(\n    Object.entries(obj).filter(([k, v]) => predicate(v, k))\n  );\n}\nconst positives = pickBy({ a: 1, b: -2, c: 3 }, v => v > 0);\n// { a: 1, c: 3 }\n// Decision rule:\n//   list of keys                                              -> Object.keys\n//   list of values                                            -> Object.values\n//   key+value iteration                                       -> Object.entries\n//   object -> Map                                             -> new Map(Object.entries(obj))\n//   all keys including symbols                                -> Reflect.ownKeys\n//   filter object properties                                  -> Object.fromEntries + filter\n//\n// Anti-pattern: for...in without hasOwn/HasOwn check; expecting Object.keys\n//   to include symbol keys."
                  }
        ],
        tips: [
                  "Pair Object.entries() with Object.fromEntries() for clean object transformations.",
                  "These only return own enumerable properties — inherited or symbol keys are excluded.",
                  "Property order follows insertion order for string keys (integers sort first numerically).",
                  "Convert an object to a Map: new Map(Object.entries(obj))."
        ],
        mistake: "Using a for...in loop expecting only own properties — it also iterates inherited enumerable properties. Use Object.keys() + forEach or for...of instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-freeze",
        fn: "Object.freeze()",
        desc: "Makes an object immutable — prevents adding, removing, or modifying properties.",
        category: "Object Fundamentals",
        subtitle: "Shallow immutability for objects",
        signature: "Object.freeze(obj)",
        descLong: "Object.freeze() prevents any modifications to the frozen object. In strict mode, attempted mutations throw TypeError; in sloppy mode, they silently fail. Freeze is shallow — nested objects are not frozen. Returns the same object (frozen in place).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.freeze() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest freeze: make a config object immutable.\n// STRENGTHS - one line; shows Object.freeze and mutation prevention.\n// WEAKNESSES- no shallow freeze warning, no deepFreeze.\n//\n// GOAL: make an object immutable\nconst config = Object.freeze({ API_URL: 'https://api.example.com', TIMEOUT: 5000 });\nconfig.API_URL = 'changed'; // fails in strict mode"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.freeze() — common patterns you'll see in production.\n// APPROACH  - Combine Object.freeze() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - understand shallow freeze and implement deepFreeze helper.\n// STRENGTHS - covers the 80% case: shallow freeze warning, deepFreeze utility.\n// WEAKNESSES- no Object.isFrozen check, no seal comparison.\n//\n// GOAL: understand shallow freeze and nested objects\n// WHY: freeze is shallow\nconst config = Object.freeze({ nested: { retries: 3 } });\nconfig.nested.retries = 99; // still works!\n// WHY: deep freeze helper\nfunction deepFreeze(obj) {\n  Object.values(obj).forEach(v =>\n    typeof v === 'object' && v !== null && deepFreeze(v)\n  );\n  return Object.freeze(obj);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.freeze() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production immutability: deepFreeze with cycle detection,\n//             Object.isFrozen checks, seal vs freeze comparison, and\n//             immutable state pattern.\n// STRENGTHS - cycle-safe deepFreeze; isFrozen guard; seal vs freeze\n//             comparison; immutable update pattern.\n// WEAKNESSES- no performance discussion; no library alternatives.\n//\n// GOAL: use freeze correctly\n// WHY: use Object.isFrozen to check\n// Deep freeze with cycle detection\nfunction deepFreezeSafe(obj, seen = new WeakSet()) {\n  if (obj === null || typeof obj !== 'object') return obj;\n  if (seen.has(obj) || Object.isFrozen(obj)) return obj;\n  seen.add(obj);\n  Object.values(obj).forEach(v => deepFreezeSafe(v, seen));\n  return Object.freeze(obj);\n}\n// Seal vs Freeze comparison\nconst sealed = Object.seal({ a: 1, b: 2 });\nsealed.a = 99;   // OK — existing props can be modified\nsealed.c = 3;    // fails — no new props\ndelete sealed.a; // fails — no deletion\nconst frozen = Object.freeze({ a: 1, b: 2 });\nfrozen.a = 99;   // fails — no modification at all\n// Immutable state update pattern (React-friendly)\nconst state = Object.freeze({ count: 0, items: [] });\n// Instead of mutating, create a new frozen object\nconst nextState = Object.freeze({\n  ...state,\n  count: state.count + 1,\n  items: [...state.items, 'new'],\n});\n// Decision rule:\n//   config constants / lookup tables                             -> Object.freeze\n//   deep immutability                                            -> deepFreezeSafe helper\n//   allow value changes but not structure                        -> Object.seal\n//   React state                                                  -> never freeze, replace instead\n//   check if already frozen                                      -> Object.isFrozen\n//\n// Anti-pattern: assuming nested objects are frozen; freezing React state\n//   objects (prevents re-render detection)."
                  }
        ],
        tips: [
                  "Object.freeze() is shallow — implement deepFreeze or use a library for deep immutability.",
                  "Frozen objects work great for config constants and lookup tables.",
                  "Check if frozen with Object.isFrozen(obj).",
                  "In React, avoid freezing state objects — you need to replace them, not mutate them."
        ],
        mistake: "Assuming Object.freeze() deep-freezes nested objects — only the top-level properties are immutable. Nested object properties can still be mutated.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Classes & Advanced ─────────────────────────────────────────
  {
    id: "classes-advanced",
    title: "Classes & Advanced",
    entries: [
      {
        id: "class-syntax",
        fn: "class",
        desc: "Syntactic sugar over prototypal inheritance for defining object blueprints.",
        category: "Classes & Advanced",
        subtitle: "Blueprint for object creation",
        signature: "class Name extends Base { constructor() {} }",
        descLong: "ES6 class syntax provides a clean way to create constructor functions and set up prototype chains. Under the hood it's still prototype-based, not classical OOP. Class bodies are always in strict mode. Private fields (#) and static methods are well-supported.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of class — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest class: constructor, property, method.\n// STRENGTHS - shows class declaration, constructor, and method syntax.\n// WEAKNESSES- no inheritance, no private fields, no static methods.\n//\n// GOAL: define and use a class\nclass Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} makes a sound`; }\n}\nconst a = new Animal('Rex');\nconsole.log(a.speak());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of class — common patterns you'll see in production.\n// APPROACH  - Combine class with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - inheritance, private fields, static methods, and chaining.\n// STRENGTHS - covers the 80% case: extends, #private, static factory, super.\n// WEAKNESSES- no accessor fields, no static blocks, no mixins.\n//\n// GOAL: use inheritance, private fields, static methods\n// WHY: private fields (#) are not accessible outside the class\nclass Animal {\n  #sound;\n  constructor(name, sound) {\n    this.name = name;\n    this.#sound = sound;\n  }\n  speak() { return `${this.name} says ${this.#sound}`; }\n  static create(name, sound) { return new Animal(name, sound); }\n}\n// WHY: super() must be called before using this in subclass\nclass Dog extends Animal {\n  constructor(name) {\n    super(name, 'woof');\n    this.tricks = [];\n  }\n  learn(trick) { this.tricks.push(trick); return this; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of class — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production class design: private fields with accessors,\n//             static initialization blocks, arrow function class fields\n//             for auto-binding, and abstract base class pattern.\n// STRENGTHS - private fields + accessors; static block; auto-bound methods;\n//             abstract base pattern with enforcement.\n// WEAKNESSES- no multiple inheritance/mixin pattern; no WeakMap privacy.\n//\n// GOAL: use classes correctly\n// WHY: class bodies are strict mode\nclass EventEmitter {\n  #listeners = new Map();  // private field\n  static #instanceCount = 0; // private static\n  // Static initialization block (ES2022)\n  static {\n    EventEmitter.#instanceCount = 0;\n  }\n  constructor() {\n    EventEmitter.#instanceCount++;\n  }\n  // Arrow function class field: auto-binds this\n  on = (event, handler) => {\n    if (!this.#listeners.has(event)) this.#listeners.set(event, new Set());\n    this.#listeners.get(event).add(handler);\n    return () => this.#listeners.get(event)?.delete(handler); // unsubscribe\n  };\n  emit(event, ...args) {\n    this.#listeners.get(event)?.forEach(h => h(...args));\n  }\n  static get instanceCount() { return EventEmitter.#instanceCount; }\n}\n// Abstract base class pattern\nclass Repository {\n  constructor() {\n    if (this.constructor === Repository) {\n      throw new Error('Repository is abstract; subclass it');\n    }\n  }\n  async findById(id) { throw new Error('findById not implemented'); }\n  async save(entity) { throw new Error('save not implemented'); }\n}\nclass UserRepository extends Repository {\n  #db;\n  constructor(db) { super(); this.#db = db; }\n  async findById(id) { return this.#db.query('SELECT * FROM users WHERE id = ?', [id]); }\n  async save(user) { return this.#db.query('INSERT INTO users SET ?', user); }\n}\n// Decision rule:\n//   constructor/inheritance                               -> class\n//   simple data + behavior                                -> object literal / factory\n//   true privacy                                          -> private fields (#)\n//   utility factory                                       -> static method\n//   auto-bound event handlers                             -> arrow class field\n//   shared initialization                                 -> static block\n//   enforce subclassing                                   -> abstract base class\n//\n// Anti-pattern: forgetting super() in a subclass; using #private for\n//   everything when WeakMap is simpler for external privacy."
                  }
        ],
        tips: [
                  "Private fields (#) are truly private — not accessible outside the class, even in subclasses.",
                  "Use static methods for factory patterns or utility methods that don't need an instance.",
                  "Always call super() in a subclass constructor before accessing this.",
                  "Arrow method class fields (method = () => {}) auto-bind this — useful for React event handlers."
        ],
        mistake: "Forgetting to call super() in a derived class constructor — accessing this before super() throws a ReferenceError.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "getters-setters",
        fn: "get / set",
        desc: "Define computed properties or intercepted assignments using accessor descriptors.",
        category: "Classes & Advanced",
        subtitle: "Computed and validated property access",
        signature: "get propName() {}  |  set propName(val) {}",
        descLong: "Getters run code when a property is read; setters run code when a property is assigned. They look like regular property access to the caller but execute logic under the hood. Useful for computed values, validation, lazy initialization, and deprecation wrappers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of get / set — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest getter/setter: backing field with accessors.\n// STRENGTHS - shows get/set syntax and property-style access.\n// WEAKNESSES- no validation, no computed values, no class usage.\n//\n// GOAL: define computed properties\nconst obj = {\n  _x: 0,\n  get x() { return this._x; },\n  set x(v) { this._x = v; }\n};\nobj.x = 5;\nconsole.log(obj.x);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of get / set — common patterns you'll see in production.\n// APPROACH  - Combine get / set with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - validate assignments and compute derived values in a class.\n// STRENGTHS - covers the 80% case: validation in setter, computed getter.\n// WEAKNESSES- no memoization, no lazy init, no deprecation wrapper.\n//\n// GOAL: validate assignments and compute derived values\n// WHY: setters can validate\nclass Temperature {\n  constructor(celsius) { this._celsius = celsius; }\n  get fahrenheit() { return this._celsius * 9 / 5 + 32; }\n  set celsius(val) {\n    if (val < -273.15) throw new RangeError('Below absolute zero');\n    this._celsius = val;\n  }\n  get celsius() { return this._celsius; }\n}\nconst t = new Temperature(0);\nt.fahrenheit; // 32\nt.celsius = 100;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of get / set — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production getter/setter patterns: memoized computed\n//             properties, lazy initialization, deprecation wrappers,\n//             and private field accessors.\n// STRENGTHS - memoized getter; lazy init pattern; deprecation wrapper;\n//             private field with accessor.\n// WEAKNESSES- no performance profiling; no Proxy-based alternatives.\n//\n// GOAL: use getters and setters effectively\n// WHY: getters run on every access — avoid heavy computation\nclass Config {\n  #data = null;\n  #cachedHash = null;\n  #hashDirty = true;\n  // Lazy initialization: load data on first access\n  get data() {\n    if (this.#data === null) {\n      this.#data = this.#loadFromDisk();\n    }\n    return this.#data;\n  }\n  // Memoized computed property: recompute only when dirty\n  get hash() {\n    if (this.#hashDirty) {\n      this.#cachedHash = this.#computeHash();\n      this.#hashDirty = false;\n    }\n    return this.#cachedHash;\n  }\n  set data(value) {\n    this.#data = value;\n    this.#hashDirty = true; // invalidate cache\n  }\n  #loadFromDisk() { return JSON.parse('{}'); }\n  #computeHash() { return String(this.#data); }\n}\n// Deprecation wrapper pattern\nfunction deprecateGet(obj, oldKey, newKey) {\n  let warned = false;\n  Object.defineProperty(obj, oldKey, {\n    get() {\n      if (!warned) {\n        console.warn(`${oldKey} is deprecated, use ${newKey} instead`);\n        warned = true;\n      }\n      return this[newKey];\n    },\n    set(v) { this[newKey] = v; },\n    configurable: true,\n  });\n}\nconst api = { newName: 'value' };\ndeprecateGet(api, 'oldName', 'newName');\napi.oldName; // warns, returns 'value'\n// Decision rule:\n//   computed read-only property                            -> getter only\n//   validated assignment                                   -> setter\n//   computed read/write derived value                      -> both\n//   heavy computation on access                            -> memoize with dirty flag\n//   first-use expensive resource                           -> lazy init getter\n//   migrating API surface                                  -> deprecation wrapper\n//\n// Anti-pattern: calling a getter with parentheses; heavy computation in\n//   getter without memoization."
                  }
        ],
        tips: [
                  "Getters are called without parentheses — they look like regular property reads.",
                  "Define both get and set for read-write computed properties; getter-only makes it read-only.",
                  "Avoid heavy computations in getters — they run on every access. Memoize if needed.",
                  "Also works in object literals: const obj = { get name() {} }."
        ],
        mistake: "Calling a getter with parentheses — obj.name() would try to invoke the returned value as a function. Getters are accessed as properties, not called.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-destructuring",
        fn: "Object Destructuring",
        desc: "Extract object properties into variables in a single, concise statement.",
        category: "Object Fundamentals",
        subtitle: "Unpack properties into named variables",
        signature: "const { a, b } = obj  |  const { a: renamed } = obj",
        descLong: "Object destructuring extracts properties into local variables. You can rename them, provide defaults, nest destructuring, and use rest (...) to collect remaining properties. Also works in function parameters for named-argument patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object Destructuring — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest destructuring: extract properties into variables.\n// STRENGTHS - one line; shows basic destructuring.\n// WEAKNESSES- no rename, no defaults, no rest, no nested.\n//\n// GOAL: extract properties into variables\nconst { name, age } = user;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object Destructuring — common patterns you'll see in production.\n// APPROACH  - Combine Object Destructuring with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - rename, defaults, rest, nested, and function parameter destructuring.\n// STRENGTHS - covers the 80% case: rename, defaults, rest, nested guard.\n// WEAKNESSES- no null guard, no deep nested, no swapping.\n//\n// GOAL: rename, default values, rest, nested\n// WHY: rename and defaults in one statement\nconst { name: username, theme = 'dark' } = user;\n// WHY: rest collects remaining properties\nconst { role, ...rest } = user;\n// WHY: nested with a guard\nconst { address: { city } = {} } = user;\n// WHY: function parameter destructuring\nfunction greet({ name, age = 0 }) { return `${name} is ${age}`; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object Destructuring — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production destructuring: null-safe patterns, deep nested\n//             extraction, variable swapping, and configurable function\n//             parameters with validation.\n// STRENGTHS - null-safe with ??; deep nested extraction; variable swap;\n//             configurable function params with defaults and validation.\n// WEAKNESSES- no destructuring in for...of with Map entries.\n//\n// GOAL: destructure safely and idiomatically\n// WHY: destructure null/undefined without guard -> TypeError\n// Null-safe destructuring\nconst { name, age } = user ?? {};\n// Deep nested extraction with multiple defaults\nconst {\n  profile: {\n    address: {\n      coordinates: { lat, lng } = { lat: 0, lng: 0 }\n    } = {}\n  } = {}\n} = response ?? {};\n// Variable swap without temp\nlet a = 1, b = 2;\n[a, b] = [b, a]; // a=2, b=1\n// Configurable function parameters with validation\nfunction createService({\n  url,\n  timeout = 5000,\n  retries = 3,\n  headers = {},\n  ...rest\n} = {}) {\n  if (!url) throw new Error('url is required');\n  return { url, timeout, retries, headers, ...rest };\n}\n// Destructuring with computed property names\nconst key = 'dynamic';\nconst { [key]: value } = obj;\n// Decision rule:\n//   extracting a few properties                                  -> const { a, b } = obj\n//   renaming / defaults                                          -> const { a: renamed, b = defaultVal }\n//   null/undefined object                                        -> const { a } = obj ?? {}\n//   nested object with possible missing path                     -> const { inner: { x } = {} } = obj\n//   function with many optional params                           -> destructured parameter with defaults\n//   swap variables                                               -> [a, b] = [b, a]\n//\n// Anti-pattern: destructuring without null guard; deeply nested\n//   destructuring that's hard to read (extract to separate statements)."
                  }
        ],
        tips: [
                  "Use destructuring in function parameters for named arguments with defaults.",
                  "Rest in destructuring (...rest) collects all remaining own enumerable properties.",
                  "Nested destructuring can get hard to read — extract to separate statements for clarity.",
                  "Destructuring assignment (without declaration): ({ a, b } = obj) — needs parentheses."
        ],
        mistake: "Destructuring a potentially null/undefined object without a default — const { x } = null throws TypeError. Guard with const { x } = obj ?? {}.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "proxy-advanced",
        fn: "Proxy Traps",
        desc: "Full list of available Proxy traps — get, set, has, deleteProperty, apply, construct, and more.",
        category: "Classes & Advanced",
        subtitle: "Intercept any object operation",
        signature: "new Proxy(target, { get, set, has, deleteProperty, apply })",
        descLong: "Proxy supports 13 traps covering every fundamental object operation. Beyond get/set, you can intercept: has (in operator), deleteProperty (delete), apply (function calls), construct (new), ownKeys (Object.keys), getOwnPropertyDescriptor, defineProperty, preventExtensions, isExtensible, getPrototypeOf, setPrototypeOf.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Proxy Traps — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Proxy: intercept get and set with defaults.\n// STRENGTHS - shows Proxy constructor, get/set traps, and fallback value.\n// WEAKNESSES- no validation, no has trap, no Reflect usage.\n//\n// GOAL: intercept object reads and writes\nconst p = new Proxy({}, {\n  get(t, k) { return t[k] ?? 'missing'; },\n  set(t, k, v) { t[k] = v; return true; }\n});\np.a = 1;\nconsole.log(p.a);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Proxy Traps — common patterns you'll see in production.\n// APPROACH  - Combine Proxy Traps with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - validation proxy with schema, and has trap for 'in' operator.\n// STRENGTHS - covers the 80% case: set validation, get existence check, has trap.\n// WEAKNESSES- no Reflect, no apply/construct traps, no ownKeys.\n//\n// GOAL: use Proxy traps for validation and 'in'\n// WHY: set trap must return true for success\nfunction createValidated(schema) {\n  return new Proxy({}, {\n    set(target, key, value) {\n      const validator = schema[key];\n      if (validator && !validator(value)) throw new TypeError(`Invalid ${key}`);\n      target[key] = value;\n      return true;\n    },\n    get(target, key) {\n      if (!(key in target)) throw new ReferenceError(`No property: ${key}`);\n      return target[key];\n    }\n  });\n}\n// WHY: has trap intercepts 'in' operator\nconst range = new Proxy({}, {\n  has(_, key) { const n = Number(key); return n >= 1 && n <= 100; }\n});\n50 in range; // true"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Proxy Traps — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Proxy patterns: observable object with Reflect,\n//             apply trap for function wrapping, and ownKeys for property\n//             filtering.\n// STRENGTHS - Reflect inside traps; observable pattern; apply trap;\n//             ownKeys for hidden properties.\n// WEAKNESSES- no construct trap example; no performance discussion.\n//\n// GOAL: use Proxy for metaprogramming\n// WHY: use Reflect inside traps to preserve default behavior and this binding\n// Observable proxy: logs all access and mutations\nfunction createObservable(target, onChange) {\n  return new Proxy(target, {\n    get(obj, key, receiver) {\n      const value = Reflect.get(obj, key, receiver);\n      console.log(`GET ${String(key)}`);\n      return value;\n    },\n    set(obj, key, value, receiver) {\n      const oldValue = obj[key];\n      const result = Reflect.set(obj, key, value, receiver);\n      if (oldValue !== value) onChange(key, oldValue, value);\n      return result;\n    },\n    deleteProperty(obj, key) {\n      const had = key in obj;\n      const result = Reflect.deleteProperty(obj, key);\n      if (had && result) onChange(key, obj[key], undefined);\n      return result;\n    },\n  });\n}\n// Apply trap: wrap function with logging/memoization\nfunction wrap(fn) {\n  return new Proxy(fn, {\n    apply(target, thisArg, args) {\n      console.log(`Calling ${target.name} with`, args);\n      return Reflect.apply(target, thisArg, args);\n    },\n  });\n}\nconst loggedAdd = wrap((a, b) => a + b);\nloggedAdd(1, 2); // logs, returns 3\n// ownKeys trap: hide private properties from enumeration\nconst obj = { _private: 'secret', public: 'data' };\nconst filtered = new Proxy(obj, {\n  ownKeys(target) {\n    return Reflect.ownKeys(target).filter(k => !k.startsWith('_'));\n  },\n  getOwnPropertyDescriptor(target, key) {\n    if (key.startsWith('_')) return undefined; // hide from for...in\n    return Reflect.getOwnPropertyDescriptor(target, key);\n  },\n});\nObject.keys(filtered); // ['public']\n// Decision rule:\n//   validation / access control                                   -> get/set traps\n//   logging / instrumentation                                     -> wrap in Proxy\n//   function call interception                                    -> apply trap\n//   hide/filter properties                                        -> ownKeys trap\n//   preserve default behavior in traps                            -> Reflect.*\n//\n// Anti-pattern: not returning true from set trap; using target[key]\n//   directly in traps instead of Reflect (breaks prototype chain)."
                  }
        ],
        tips: [
                  "set trap must return true to indicate success — returning false throws TypeError in strict mode.",
                  "ownKeys trap lets you hide or add keys from Object.keys(), for...in, and spread.",
                  "apply trap intercepts function calls — useful for logging, memoization, or function wrappers.",
                  "Reflect methods provide the default behavior for each trap — use them to avoid infinite recursion."
        ],
        mistake: "Writing a set trap that does not return true — the proxy silently treats the assignment as failed in strict mode, throwing TypeError.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "reflect",
        fn: "Reflect",
        desc: "Provides methods corresponding to each Proxy trap — call default behavior inside traps without recursion.",
        category: "Classes & Advanced",
        subtitle: "Meta-programming operations as functions",
        signature: "Reflect.get(target, key)  |  Reflect.set(target, key, val)",
        descLong: "Reflect has a static method for each Proxy trap, providing the default behavior. Always use Reflect inside Proxy traps to avoid infinite recursion or bypassing the prototype chain. Reflect.apply replaces Function.prototype.apply for safer invocation. Reflect methods return booleans (Reflect.set, deleteProperty) instead of throwing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Reflect — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Reflect: call default object operations as functions.\n// STRENGTHS - shows Reflect.get, set, has as function calls.\n// WEAKNESSES- no Proxy integration, no receiver, no apply/construct.\n//\n// GOAL: call default object operations as functions\nReflect.get(obj, 'key');\nReflect.set(obj, 'key', 'value');\nReflect.has(obj, 'key');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Reflect — common patterns you'll see in production.\n// APPROACH  - Combine Reflect with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - use Reflect inside Proxy traps and for standalone operations.\n// STRENGTHS - covers the 80% case: Reflect in get/set traps, ownKeys, deleteProperty, apply.\n// WEAKNESSES- no receiver explanation, no construct, no return value comparison.\n//\n// GOAL: use Reflect inside Proxy traps\n// WHY: preserves receiver (this) binding and avoids recursion\nconst logProxy = new Proxy(target, {\n  get(obj, key, receiver) {\n    console.log(`GET ${key}`);\n    return Reflect.get(obj, key, receiver);\n  },\n  set(obj, key, value, receiver) {\n    console.log(`SET ${key} = ${value}`);\n    return Reflect.set(obj, key, value, receiver);\n  }\n});\n// WHY: standalone Reflect methods\nReflect.ownKeys(obj);             // all own keys incl. symbols\nReflect.deleteProperty(obj, 'x'); // returns boolean\nReflect.apply(fn, thisArg, args);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Reflect — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Reflect usage: receiver-aware proxy forwarding,\n//             Reflect.construct for subclassing, and boolean-return\n//             patterns for safe property manipulation.\n// STRENGTHS - receiver in get/set; Reflect.construct with NewTarget;\n//             boolean returns for safe defineProperty/delete.\n// WEAKNESSES- no performance comparison with direct property access.\n//\n// GOAL: use Reflect for safe meta-programming\n// WHY: pass receiver to get/set for correct prototype chain behavior\n// Receiver-aware proxy: getters on prototype work correctly\nclass Base {\n  get derived() { return this._val * 2; }\n}\nconst proxy = new Proxy(new Base(), {\n  get(target, key, receiver) {\n    // Reflect.get with receiver ensures 'this' is the proxy, not target\n    return Reflect.get(target, key, receiver);\n  },\n  set(target, key, value, receiver) {\n    return Reflect.set(target, key, value, receiver);\n  },\n});\nproxy._val = 21;\nproxy.derived; // 42 — getter runs with receiver as this\n// Reflect.construct: control prototype chain\nfunction Animal(name) { this.name = name; }\nfunction Dog(name) { return Reflect.construct(Animal, [name], Dog); }\nDog.prototype = Object.create(Animal.prototype);\nDog.prototype.bark = function() { return 'woof'; };\nconst d = new Dog('Rex');\n// d instanceof Dog && d instanceof Animal && d.bark() === 'woof'\n// Safe property manipulation with boolean returns\nfunction safeDefine(obj, key, descriptor) {\n  if (!Reflect.defineProperty(obj, key, descriptor)) {\n    throw new Error(`Cannot define ${String(key)}`);\n  }\n  return obj;\n}\nfunction safeDelete(obj, key) {\n  return Reflect.deleteProperty(obj, key);\n}\n// safeDelete({ x: 1 }, 'x') -> true\n// safeDelete(Object.freeze({ x: 1 }), 'x') -> false\n// Decision rule:\n//   inside Proxy traps                                        -> Reflect.*\n//   all own keys incl symbols                                -> Reflect.ownKeys\n//   safe delete that returns bool                            -> Reflect.deleteProperty\n//   calling fn with array args                               -> Reflect.apply\n//   constructing with specific prototype                     -> Reflect.construct\n//   defineProperty without throwing                          -> Reflect.defineProperty\n//\n// Anti-pattern: target[key] directly in traps (breaks getters in\n//   prototype chain); using Object methods in Proxy traps."
                  }
        ],
        tips: [
                  "Always pass receiver to Reflect.get/set — it correctly handles prototype chain getters/setters.",
                  "Reflect.ownKeys returns string + symbol keys — superset of Object.keys().",
                  "Reflect methods return booleans instead of throwing — better for conditional logic.",
                  "Reflect.construct(Target, args, NewTarget) is useful for subclassing."
        ],
        mistake: "Returning target[key] directly in a get trap instead of Reflect.get(target, key, receiver) — breaks getters that use this in the prototype chain.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-hasown",
        fn: "Object.hasOwn()",
        desc: "Modern replacement for obj.hasOwnProperty() — safer and works on prototype-less objects.",
        category: "Classes & Advanced",
        subtitle: "Safe own-property existence check",
        signature: "Object.hasOwn(obj, key)",
        descLong: "Object.hasOwn(obj, key) (ES2022) is the safe, modern replacement for obj.hasOwnProperty(key). It works on prototype-less objects (Object.create(null)) where .hasOwnProperty would throw. It's also not overridable by a property shadowing hasOwnProperty on the object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.hasOwn() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest hasOwn: check if a property is own (not inherited).\n// STRENGTHS - shows Object.hasOwn vs inherited property check.\n// WEAKNESSES- no null-prototype object, no for...in guard.\n//\n// GOAL: check if a property is an own property\nconst obj = { a: 1, b: 2 };\nObject.hasOwn(obj, 'a');  // true\nObject.hasOwn(obj, 'toString'); // false — inherited"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.hasOwn() — common patterns you'll see in production.\n// APPROACH  - Combine Object.hasOwn() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - safely iterate own properties and work with null-prototype objects.\n// STRENGTHS - covers the 80% case: null-prototype dict, for...in guard.\n// WEAKNESSES- no comparison with hasOwnProperty, no performance notes.\n//\n// GOAL: safely iterate own properties\n// WHY: works on null-prototype objects where hasOwnProperty fails\nconst dict = Object.create(null);\ndict.key = 'val';\nObject.hasOwn(dict, 'key'); // true\nfor (const key in obj) {\n  if (Object.hasOwn(obj, key)) {\n    console.log(key, obj[key]);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.hasOwn() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production hasOwn patterns: safe property iteration utility,\n//             comparison with hasOwnProperty, and null-prototype dictionary\n//             pattern for safe key lookup.\n// STRENGTHS - safe iteration utility; hasOwnProperty vs hasOwn comparison;\n//             null-prototype dict with safe access.\n// WEAKNESSES- no Symbol key handling; no performance benchmark.\n//\n// GOAL: prefer Object.hasOwn over fragile hasOwnProperty\n// WHY: not overridable by a property shadowing hasOwnProperty\n// Safe own-property iteration utility\nfunction forEachOwn(obj, callback) {\n  for (const key in obj) {\n    if (Object.hasOwn(obj, key)) callback(key, obj[key]);\n  }\n}\n// hasOwnProperty is fragile: can be shadowed\nconst evil = { hasOwnProperty: 'gotcha' };\nevil.hasOwnProperty('hasOwnProperty'); // TypeError: not a function\nObject.hasOwn(evil, 'hasOwnProperty'); // true — works correctly\n// Null-prototype dictionary: no inherited props, safe for arbitrary keys\nfunction createDict() {\n  return Object.create(null);\n}\nconst dict = createDict();\ndict.constructor = 'safe'; // no prototype.constructor to conflict with\ndict.toString = 'safe';   // no prototype.toString to conflict with\nObject.hasOwn(dict, 'toString'); // true — it's own, not inherited\n// Filter own properties into a new object\nfunction pickOwn(obj, keys) {\n  const result = {};\n  for (const key of keys) {\n    if (Object.hasOwn(obj, key)) result[key] = obj[key];\n  }\n  return result;\n}\n// pickOwn({ a: 1, b: 2, c: 3 }, ['a', 'c', 'd']) -> { a: 1, c: 3 }\n// Decision rule:\n//   own property check                                     -> Object.hasOwn(obj, key)\n//   inherited properties                                   -> 'key' in obj\n//   null-prototype dictionaries                            -> Object.hasOwn\n//   for...in loops                                         -> guard with Object.hasOwn\n//   legacy environments (pre-ES2022)                       -> Object.prototype.hasOwnProperty.call(obj, key)\n//\n// Anti-pattern: obj.hasOwnProperty() on arbitrary objects; for...in\n//   without hasOwn guard (includes inherited properties)."
                  }
        ],
        tips: [
                  "Object.hasOwn is the preferred replacement for hasOwnProperty in all new code.",
                  "Use it in for...in loops to filter out inherited properties.",
                  "Object.create(null) is a useful pattern for pure dictionaries — no prototype collisions.",
                  "Available in Node 16.9+ and all modern browsers."
        ],
        mistake: "Calling obj.hasOwnProperty() on an object created with Object.create(null) — it has no prototype and no hasOwnProperty method. Use Object.hasOwn() instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "structured-clone",
        fn: "structuredClone()",
        desc: "Deep-clones a value using the structured clone algorithm — handles dates, maps, sets, and circular refs.",
        category: "Classes & Advanced",
        subtitle: "Native deep clone without libraries",
        signature: "structuredClone(value, { transfer? })",
        descLong: "structuredClone() is the built-in deep clone. It handles circular references, Date, Map, Set, RegExp, ArrayBuffer, TypedArray, and deeply nested objects. It does NOT clone functions, DOM nodes, or class instances' prototype methods. Available natively without any library.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of structuredClone() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest structuredClone: deep clone a nested object.\n// STRENGTHS - shows structuredClone prevents shared nested references.\n// WEAKNESSES- no circular refs, no transfer, no type limitations.\n//\n// GOAL: deep clone an object\nconst original = { a: 1, b: { c: 2 } };\nconst clone = structuredClone(original);\nclone.b.c = 99;\nconsole.log(original.b.c); // 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of structuredClone() — common patterns you'll see in production.\n// APPROACH  - Combine structuredClone() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - clone complex types (Date, Map, Set) and handle circular refs.\n// STRENGTHS - covers the 80% case: circular refs, Date/Map preservation, transfer.\n// WEAKNESSES- no error handling, no type limitations, no fallback.\n//\n// GOAL: clone complex types and handle circular refs\n// WHY: structuredClone preserves Date, Map, Set, typed arrays\nconst original = {\n  name: 'Alice',\n  born: new Date('1990-01-01'),\n  scores: [95, 87, 92],\n  meta: new Map([['key', 'val']]),\n  self: null,\n};\noriginal.self = original; // circular reference\nconst clone = structuredClone(original);\n// WHY: transferable objects can be moved\nconst buffer = new ArrayBuffer(1024);\nconst transferred = structuredClone(buffer, { transfer: [buffer] });\n// buffer is now detached"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of structuredClone() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production deep clone: safe clone with error handling,\n//             transfer for zero-copy ArrayBuffer moves, JSON fallback for\n//             unsupported types, and class instance preservation strategy.\n// STRENGTHS - error handling with JSON fallback; transfer for zero-copy;\n//             class instance rehydration pattern.\n// WEAKNESSES- no performance benchmark vs JSON; no worker-based cloning.\n//\n// GOAL: use structuredClone safely\n// WHY: cannot clone functions or DOM nodes\n// Safe clone with fallback\nfunction safeClone(value, transfer = []) {\n  try {\n    return structuredClone(value, transfer.length ? { transfer } : undefined);\n  } catch (e) {\n    if (e instanceof DataCloneError) {\n      // Fallback: lossy JSON clone for unsupported types\n      return JSON.parse(JSON.stringify(value));\n    }\n    throw e;\n  }\n}\n// Zero-copy transfer of ArrayBuffer between contexts\nfunction sendToWorker(worker, data) {\n  // Extract transferable ArrayBuffers from data\n  const transferables = [];\n  function collect(obj) {\n    if (obj instanceof ArrayBuffer) transferables.push(obj);\n    else if (obj && typeof obj === 'object') {\n      for (const v of Object.values(obj)) collect(v);\n    }\n  }\n  collect(data);\n  const cloned = structuredClone(data, { transfer: transferables });\n  worker.postMessage(cloned);\n}\n// Class instance rehydration: clone data, then re-instantiate\nclass User {\n  constructor(data) { Object.assign(this, data); }\n  get displayName() { return `${this.first} ${this.last}`; }\n}\nconst original = new User({ first: 'Alice', last: 'Smith', id: 1 });\n// structuredClone loses the prototype — rehydrate\nconst clonedData = structuredClone(original);\nconst clonedUser = new User(clonedData);\nclonedUser.displayName; // 'Alice Smith'\n// Decision rule:\n//   deep clone of plain data                                -> structuredClone\n//   clone with functions/DOM nodes                           -> not supported, use safeClone fallback\n//   move ArrayBuffer without copy                            -> { transfer: [buffer] }\n//   class instances                                          -> clone data + rehydrate via constructor\n//   legacy fallback                                          -> JSON.parse(JSON.stringify()) (lossy)\n//\n// Anti-pattern: JSON.parse(JSON.stringify(obj)) for complex data (loses\n//   Date, Map, Set, undefined, throws on circular refs)."
                  }
        ],
        tips: [
                  "structuredClone handles everything JSON.parse(JSON.stringify()) cannot: Date, Map, Set, undefined, circular refs.",
                  "Transfer option moves Transferable objects (ArrayBuffer) without copying — zero cost.",
                  "Functions, DOM nodes, and class prototype methods are lost — structuredClone is for data, not code.",
                  "Available in Node 17+, all modern browsers, and workers."
        ],
        mistake: "Still using JSON.parse(JSON.stringify(obj)) for deep cloning — it loses Date precision, drops undefined/functions, and throws on circular refs. Use structuredClone().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "iterator-protocol",
        fn: "Iterator Protocol",
        desc: "Define custom iteration behavior with Symbol.iterator.",
        category: "Advanced Objects",
        subtitle: "Make objects work with for...of and spread",
        signature: "obj[Symbol.iterator] = function() { return { next() { ... } } }",
        descLong: "Make custom objects iterable by implementing Symbol.iterator. Returns an object with a next() method that yields { value, done }. Enables for...of loops, destructuring, and spread operator on custom objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Iterator Protocol — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest iterator: make a range object iterable.\n// STRENGTHS - shows Symbol.iterator, next(), for...of, and spread.\n// WEAKNESSES- no class iterator, no infinite sequence, no generator comparison.\n//\n// GOAL: make a custom object iterable\nconst range = {\n  start: 1,\n  end: 5,\n  [Symbol.iterator]() {\n    let current = this.start;\n    return {\n      next() {\n        return current <= this.end\n          ? { value: current++, done: false }\n          : { done: true };\n      }\n    };\n  }\n};\nfor (const n of range) console.log(n);\nconsole.log([...range]);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Iterator Protocol — common patterns you'll see in production.\n// APPROACH  - Combine Iterator Protocol with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - class iterator and infinite iterator with break.\n// STRENGTHS - covers the 80% case: class Symbol.iterator, infinite sequence.\n// WEAKNESSES- no generator, no return/throw methods, no lazy evaluation.\n//\n// GOAL: implement iterators for classes and reverse ranges\n// WHY: class iterator\nclass Deck {\n  constructor(cards) { this.cards = cards; }\n  [Symbol.iterator]() {\n    let i = 0;\n    return { next: () => i < this.cards.length ? { value: this.cards[i++], done: false } : { done: true } };\n  }\n}\n// WHY: infinite iterator with break\nconst infiniteCounter = {\n  [Symbol.iterator]() {\n    let count = 0;\n    return { next: () => ({ value: count++, done: false }) };\n  }\n};\nlet i = 0;\nfor (const num of infiniteCounter) {\n  if (i++ >= 3) break;\n  console.log(num);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Iterator Protocol — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production iterator patterns: lazy sequence generator,\n//             iterator with return() for cleanup, and a custom collection\n//             class supporting for...of, spread, and destructuring.\n// STRENGTHS - lazy generator; return() for early cleanup; full iterable\n//             collection class; map/filter helpers.\n// WEAKNESSES- no async iterator; no throw() method.\n//\n// GOAL: use iterator protocol effectively\n// WHY: generators implement Symbol.iterator automatically\n// Lazy sequence: generate values on demand\nclass LazySequence {\n  #generator;\n  constructor(gen) { this.#generator = gen; }\n  [Symbol.iterator]() { return this.#generator(); }\n  map(fn) {\n    return new LazySequence(function* () {\n      for (const v of this) yield fn(v);\n    }.bind(this));\n  }\n  filter(pred) {\n    return new LazySequence(function* () {\n      for (const v of this) if (pred(v)) yield v;\n    }.bind(this));\n  }\n  take(n) {\n    return new LazySequence(function* () {\n      let i = 0;\n      for (const v of this) { if (i++ >= n) break; yield v; }\n    }.bind(this));\n  }\n}\n// Usage: lazy natural numbers\nconst naturals = new LazySequence(function* () {\n  let n = 1;\n  while (true) yield n++;\n});\nconst result = [...naturals.filter(n => n % 2 === 0).map(n => n * 10).take(3)];\n// [20, 40, 60]\n// Iterator with return() for cleanup (e.g., file handles, connections)\nfunction readLines(lines) {\n  let i = 0;\n  return {\n    next() {\n      return i < lines.length\n        ? { value: lines[i++], done: false }\n        : { done: true };\n    },\n    return() {\n      console.log('Iterator closed early');\n      return { done: true };\n    },\n  };\n}\n// for (const line of readLines(data)) { if (line === 'STOP') break; }\n// -> logs 'Iterator closed early'\n// Decision rule:\n//   custom iterable collection                               -> implement Symbol.iterator\n//   lazy sequence                                            -> generator function\n//   infinite sequence                                        -> iterator + break or take()\n//   cleanup on early exit                                    -> return() method\n//   chaining transformations                                 -> lazy sequence class\n//\n// Anti-pattern: returning the array instead of an iterator object;\n//   not implementing return() when resources need cleanup."
                  }
        ],
        tips: [
                  "Symbol.iterator is a well-known symbol — objects with it are iterable",
                  "next() must return { value: x, done: bool }. When done=true, value is ignored",
                  "Generators (function*) implement Symbol.iterator automatically",
                  "Makes custom objects work with for...of, destructuring, and spread — powerful for APIs"
        ],
        mistake: "Returning array from Symbol.iterator instead of iterator object. Must return { next() { ... } }, not the array itself.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "proxy-trap-patterns",
        fn: "Proxy (Advanced Traps)",
        desc: "Intercept and customize object behavior with detailed trap patterns.",
        category: "Advanced Objects",
        subtitle: "Logging, validation, caching, lazy properties via Proxy",
        signature: "new Proxy(target, handler)",
        descLong: "Proxies intercept operations on objects. Beyond basic get/set, use traps for validation, logging, lazy initialization, auto-vivification, and protecting properties.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Proxy (Advanced Traps) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Proxy: intercept get and set with defaults.\n// STRENGTHS - shows Proxy constructor, get/set traps, fallback value.\n// WEAKNESSES- no validation, no logging, no lazy init.\n//\n// GOAL: intercept property access and assignment\nconst p = new Proxy({}, {\n  get(target, prop) { return target[prop] ?? 'missing'; },\n  set(target, prop, value) { target[prop] = value; return true; }\n});\np.name = 'Alice';\nconsole.log(p.name);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Proxy (Advanced Traps) — common patterns you'll see in production.\n// APPROACH  - Combine Proxy (Advanced Traps) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - validation, logging, and lazy initialization via Proxy traps.\n// STRENGTHS - covers the 80% case: set validation, get logging, lazy init.\n// WEAKNESSES- no Reflect, no negative indices, no performance notes.\n//\n// GOAL: validation, logging, lazy init, and negative indices\n// WHY: validation trap\nconst user = new Proxy({}, {\n  set(target, prop, value) {\n    if (prop === 'age' && (value < 0 || value > 150)) throw new Error('Invalid age');\n    target[prop] = value;\n    return true;\n  }\n});\n// WHY: logging trap\nconst person = new Proxy({ name: 'Bob' }, {\n  get(t, p) { console.log('GET', p); return t[p]; },\n  set(t, p, v) { console.log('SET', p, v); t[p] = v; return true; }\n});\n// WHY: lazy initialization\nconst config = new Proxy({}, {\n  get(t, p) {\n    if (!(p in t)) t[p] = fetchExpensiveData(p);\n    return t[p];\n  }\n});"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Proxy (Advanced Traps) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Proxy patterns: memoized get trap with TTL,\n//             negative array indices, and revocable proxies for security.\n// STRENGTHS - memoized get with TTL; negative index emulation; revocable\n//             proxy for secure API exposure.\n// WEAKNESSES- no performance benchmark; no Proxy in Node.js worker threads.\n//\n// GOAL: use Proxy traps responsibly\n// WHY: Proxies have overhead — avoid on hot paths\n// Memoized get trap with TTL cache\nfunction createCached(target, ttlMs = 60000) {\n  const cache = new Map();\n  return new Proxy(target, {\n    get(obj, key, receiver) {\n      const now = Date.now();\n      const cached = cache.get(key);\n      if (cached && now - cached.time < ttlMs) return cached.value;\n      const value = Reflect.get(obj, key, receiver);\n      cache.set(key, { value, time: now });\n      return value;\n    },\n  });\n}\n// Negative array indices (Python-style)\nfunction negativeIndex(arr) {\n  return new Proxy(arr, {\n    get(target, prop, receiver) {\n      const n = Number(prop);\n      if (Number.isInteger(n) && n < 0) {\n        return target[target.length + n];\n      }\n      return Reflect.get(target, prop, receiver);\n    },\n  });\n}\nconst arr = negativeIndex([10, 20, 30, 40]);\narr[-1]; // 40\narr[-2]; // 30\n// Revocable proxy: revoke to prevent further access\nconst { proxy, revoke } = Proxy.revocable(sensitiveData, {\n  get(target, key) {\n    if (key.startsWith('_')) throw new Error('Private access');\n    return Reflect.get(target, key);\n  }\n});\n// Use proxy safely...\nrevoke(); // after use, revoke access\n// proxy.anyProp; // TypeError: illegal operation attempted on a revoked proxy\n// Decision rule:\n//   validation / access control                              -> set/get traps\n//   logging / instrumentation                                -> wrap target in Proxy\n//   lazy property initialization                             -> get trap with cache\n//   cached reads with expiry                                 -> memoized get with TTL\n//   Python-style negative indices                            -> get trap with integer check\n//   temporary API exposure                                   -> Proxy.revocable\n//\n// Anti-pattern: not returning true from set trap; using Proxy on hot\n//   paths without performance testing."
                  }
        ],
        tips: [
                  "Common traps: get, set, has, deleteProperty, ownKeys, getOwnPropertyDescriptor",
                  "Apply pattern: use Reflect.get() inside trap to call original behavior: Reflect.get(target, prop)",
                  "Validation + logging: stack multiple concerns in one handler",
                  "Performance: Proxies have overhead — avoid on hot paths"
        ],
        mistake: "Not returning true from set trap. Strict mode throws error if set handler returns false — always return true on success.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "weakmap-weakset",
        fn: "WeakMap & WeakSet",
        desc: "Collections that allow garbage collection of keys/values.",
        category: "Data Structures",
        subtitle: "Prevent memory leaks with weak references",
        signature: "new WeakMap()\nnew WeakSet()",
        descLong: "WeakMap and WeakSet hold weak references — if no other code references the key, GC removes it. Perfect for private data, DOM node metadata, and caches that should clean up automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WeakMap & WeakSet — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest WeakMap: associate data with an object.\n// STRENGTHS - shows WeakMap set/get with object key.\n// WEAKNESSES- no WeakSet, no GC explanation, no private data pattern.\n//\n// GOAL: associate data with objects without preventing GC\nconst cache = new WeakMap();\nconst key = { id: 1 };\ncache.set(key, 'data');\nconsole.log(cache.get(key)); // 'data'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WeakMap & WeakSet — common patterns you'll see in production.\n// APPROACH  - Combine WeakMap & WeakSet with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - private data with WeakMap and deduplication with WeakSet.\n// STRENGTHS - covers the 80% case: private instance data, seen-tracking.\n// WEAKNESSES- no GC behavior demo, no DOM metadata pattern.\n//\n// GOAL: private data and deduplication with WeakMap/WeakSet\n// WHY: WeakMap for private instance data\nconst privateData = new WeakMap();\nclass User {\n  constructor(name, password) {\n    this.name = name;\n    privateData.set(this, { password });\n  }\n  validatePassword(pwd) {\n    return privateData.get(this)?.password === pwd;\n  }\n}\n// WHY: WeakSet for tracking seen objects\nconst seen = new WeakSet();\nfunction processObject(obj) {\n  if (seen.has(obj)) return 'already processed';\n  seen.add(obj);\n  return 'processing';\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WeakMap & WeakSet — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production WeakMap/WeakSet patterns: DOM node metadata,\n//             memoization cache, and event listener tracking with\n//             automatic cleanup.\n// STRENGTHS - DOM metadata pattern; memoization with auto-cleanup;\n//             event listener tracking; comparison with Map/Set.\n// WEAKNESSES- no WeakRef/FinalizationRegistry; no performance benchmark.\n//\n// GOAL: use WeakMap/WeakSet correctly\n// WHY: not iterable, no .size, no primitive keys\n// DOM node metadata: auto-cleanup when nodes are removed\nconst nodeData = new WeakMap();\nfunction setNodeMeta(node, meta) { nodeData.set(node, meta); }\nfunction getNodeMeta(node) { return nodeData.get(node); }\n// When node is removed from DOM and GC'd, metadata is freed too\n// Memoization cache: auto-cleanup when args are GC'd\nfunction memoize(fn) {\n  const cache = new WeakMap();\n  return function(arg) {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}\nconst memoizedRender = memoize((component) => expensiveRender(component));\n// Event listener tracking: auto-cleanup when objects are GC'd\nconst listeners = new WeakMap();\nclass EventEmitter {\n  on(event, handler) {\n    if (!listeners.has(this)) listeners.set(this, new Map());\n    listeners.get(this).set(event, handler);\n    return () => listeners.get(this)?.delete(event);\n  }\n  emit(event, ...args) {\n    listeners.get(this)?.get(event)?.(...args);\n  }\n}\n// WeakSet: track processed objects without preventing GC\nconst processed = new WeakSet();\nfunction processOnce(obj) {\n  if (processed.has(obj)) return null;\n  processed.add(obj);\n  return transform(obj);\n}\n// Decision rule:\n//   private data attached to objects                       -> WeakMap\n//   mark objects as seen/processed                         -> WeakSet\n//   enumerate contents or iterate                          -> Map / Set\n//   primitive keys                                         -> Map / Set\n//   DOM node metadata                                      -> WeakMap\n//   memoization with object args                           -> WeakMap\n//\n// Anti-pattern: using WeakMap when you need iteration; using primitive\n//   keys (WeakMap only accepts objects)."
                  }
        ],
        tips: [
                  "WeakMap/WeakSet only accept objects as keys/values — not strings, numbers, etc.",
                  "Not enumerable — cannot iterate or inspect contents (privacy benefit)",
                  "Perfect for associating metadata with objects that may be deleted (DOM nodes, users)",
                  "Automatically cleaned up by GC — prevents memory leaks from forgotten references"
        ],
        mistake: "Using WeakMap when you need iteration. Use Map/Set if you need .keys(), .values(), or to enumerate. WeakMap is specifically for weak references.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "reflect-api",
        fn: "Reflect API",
        desc: "Unified API for object operations and introspection.",
        category: "Advanced Objects",
        subtitle: "Consistent, standardized way to work with object properties",
        signature: "Reflect.get(obj, prop)\nReflect.set(obj, prop, value)\nReflect.has(obj, prop)\nReflect.ownKeys(obj)",
        descLong: "Reflect mirrors common object operations (Object.keys, etc.) but also works with Proxies. Use Reflect inside Proxy handlers to forward operations to the target cleanly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Reflect API — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest Reflect: basic object operations as functions.\n// STRENGTHS - shows get, set, has, deleteProperty, ownKeys.\n// WEAKNESSES- no Proxy integration, no receiver, no apply/construct.\n//\n// GOAL: use Reflect for object operations\nconst obj = { name: 'Alice', age: 30 };\nReflect.get(obj, 'name');\nReflect.set(obj, 'age', 31);\nReflect.has(obj, 'name');\nReflect.deleteProperty(obj, 'age');\nReflect.ownKeys(obj);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Reflect API — common patterns you'll see in production.\n// APPROACH  - Combine Reflect API with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - Reflect inside Proxy traps and for function/constructor calls.\n// STRENGTHS - covers the 80% case: receiver-aware traps, apply, construct.\n// WEAKNESSES- no boolean return comparison, no defineProperty, no ownKeys.\n//\n// GOAL: use Reflect inside Proxy traps and for function/constructor calls\n// WHY: Reflect preserves receiver binding\nconst handler = {\n  get(target, prop, receiver) {\n    console.log('GET', prop);\n    return Reflect.get(target, prop, receiver);\n  },\n  set(target, prop, value, receiver) {\n    console.log('SET', prop, value);\n    return Reflect.set(target, prop, value, receiver);\n  }\n};\nconst proxy = new Proxy({ count: 0 }, handler);\n// WHY: Reflect.apply and Reflect.construct\nfunction greet(greeting) { return `${greeting} ${this.name}`; }\nReflect.apply(greet, { name: 'Bob' }, ['Hello']);\nclass Person { constructor(name) { this.name = name; } }\nReflect.construct(Person, ['Alice']);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Reflect API — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production Reflect usage: receiver-aware proxy forwarding,\n//             Reflect.construct for subclassing, boolean-return patterns\n//             for safe property manipulation, and ownKeys for complete\n//             enumeration.\n// STRENGTHS - receiver in get/set; Reflect.construct with NewTarget;\n//             boolean returns for safe defineProperty/delete; ownKeys.\n// WEAKNESSES- no performance comparison with direct property access.\n//\n// GOAL: prefer Reflect over Object methods in meta-programming\n// WHY: Reflect methods return booleans instead of throwing\n// Receiver-aware proxy: getters on prototype work correctly\nclass Base {\n  get derived() { return this._val * 2; }\n}\nconst proxy = new Proxy(new Base(), {\n  get(target, key, receiver) {\n    return Reflect.get(target, key, receiver);\n  },\n  set(target, key, value, receiver) {\n    return Reflect.set(target, key, value, receiver);\n  },\n});\nproxy._val = 21;\nproxy.derived; // 42 — getter runs with receiver as this\n// Reflect.construct: control prototype chain\nfunction Animal(name) { this.name = name; }\nfunction Dog(name) { return Reflect.construct(Animal, [name], Dog); }\nDog.prototype = Object.create(Animal.prototype);\nDog.prototype.bark = function() { return 'woof'; };\nconst d = new Dog('Rex');\n// d instanceof Dog && d instanceof Animal && d.bark() === 'woof'\n// Safe property manipulation with boolean returns\nfunction safeDefine(obj, key, descriptor) {\n  if (!Reflect.defineProperty(obj, key, descriptor)) {\n    throw new Error(`Cannot define ${String(key)}`);\n  }\n  return obj;\n}\nfunction safeDelete(obj, key) {\n  return Reflect.deleteProperty(obj, key);\n}\n// safeDelete({ x: 1 }, 'x') -> true\n// safeDelete(Object.freeze({ x: 1 }), 'x') -> false\n// Complete key enumeration including symbols\nconst sym = Symbol('hidden');\nconst obj = { a: 1, [sym]: 2, b: 3 };\nReflect.ownKeys(obj); // ['a', 'b', Symbol(hidden)]\n// Decision rule:\n//   Proxy trap forwarding                                     -> Reflect.*\n//   own keys incl symbols                                     -> Reflect.ownKeys\n//   safe delete/define                                        -> Reflect.deleteProperty / Reflect.defineProperty\n//   invoking fn with specific this                            -> Reflect.apply\n//   creating object with specific constructor                 -> Reflect.construct\n//\n// Anti-pattern: using Object methods in Proxy traps (ignores receiver);\n//   using delete operator instead of Reflect.deleteProperty (no boolean)."
                  }
        ],
        tips: [
                  "Reflect methods return true/false on success/failure (unlike Object methods which throw)",
                  "Always use Reflect in Proxy traps to preserve prototype chain and descriptor behavior",
                  "Reflect is not an object to instantiate — all methods are static: Reflect.get(...)",
                  "Reflect.ownKeys gets both string and symbol keys — more complete than Object.keys"
        ],
        mistake: "Using Object methods in Proxy handlers instead of Reflect. Reflect correctly handles the receiver (proxy instance), which Object methods ignore.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "structured-clone",
        fn: "structuredClone()",
        desc: "Deep clone objects including Date, Map, Set, typed arrays.",
        category: "Objects",
        subtitle: "Better than JSON.parse(JSON.stringify()) for complex objects",
        signature: "structuredClone(value)",
        descLong: "structuredClone() performs deep cloning respecting object types (Date stays Date, Map stays Map). Faster and more complete than JSON method. Uses HTML Structured Clone Algorithm.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of structuredClone() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest structuredClone: deep clone a nested object.\n// STRENGTHS - shows structuredClone prevents shared nested references.\n// WEAKNESSES- no circular refs, no transfer, no type limitations.\n//\n// GOAL: deep clone an object\nconst original = { a: 1, b: { c: 2 } };\nconst cloned = structuredClone(original);\ncloned.b.c = 99;\nconsole.log(original.b.c); // 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of structuredClone() — common patterns you'll see in production.\n// APPROACH  - Combine structuredClone() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - clone complex data types (Date, Map, Set) and use transfer.\n// STRENGTHS - covers the 80% case: Date/Map preservation, ArrayBuffer transfer.\n// WEAKNESSES- no error handling, no circular refs, no type limitations.\n//\n// GOAL: clone complex data types\n// WHY: preserves Date, Map, Set, typed arrays\nconst dateOriginal = { date: new Date('2026-03-16') };\nconst dateCloned = structuredClone(dateOriginal);\ndateCloned.date.setFullYear(2030);\nconsole.log(dateOriginal.date.getFullYear()); // 2026\nconst mapOriginal = { map: new Map([['a', 1]]) };\nconst mapCloned = structuredClone(mapOriginal);\n// WHY: transfer moves ArrayBuffer ownership\nconst arrayBuffer = new ArrayBuffer(16);\nconst clonedBuffer = structuredClone(arrayBuffer, { transfer: [arrayBuffer] });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of structuredClone() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production structuredClone: safe clone with error handling,\n//             transfer for zero-copy, and JSON fallback for unsupported types.\n// STRENGTHS - error handling with JSON fallback; transfer for zero-copy;\n//             type limitation documentation.\n// WEAKNESSES- no class instance rehydration; no worker-based cloning.\n//\n// GOAL: use structuredClone correctly\n// WHY: cannot clone functions or DOM nodes\n// Safe clone with fallback for unsupported types\nfunction safeClone(value, transfer = []) {\n  try {\n    return structuredClone(value, transfer.length ? { transfer } : undefined);\n  } catch (e) {\n    if (e instanceof DataCloneError) {\n      // Fallback: lossy JSON clone for unsupported types\n      return JSON.parse(JSON.stringify(value));\n    }\n    throw e;\n  }\n}\n// Transfer ArrayBuffer to worker (zero-copy)\nfunction sendToWorker(worker, data) {\n  const transferables = [];\n  function collect(obj) {\n    if (obj instanceof ArrayBuffer) transferables.push(obj);\n    else if (obj && typeof obj === 'object') {\n      for (const v of Object.values(obj)) collect(v);\n    }\n  }\n  collect(data);\n  const cloned = structuredClone(data, { transfer: transferables });\n  worker.postMessage(cloned);\n}\n// What structuredClone supports vs not:\n// Supported: Object, Array, Date, Map, Set, RegExp, ArrayBuffer,\n//            TypedArray, Blob, File, Error, circular refs\n// NOT supported: Function, DOM nodes, class prototype methods, Symbols\n// Decision rule:\n//   deep clone of plain data                                -> structuredClone\n//   preserving Date/Map/Set/typed arrays                    -> structuredClone\n//   clone with functions/DOM nodes                          -> not supported, use safeClone\n//   move ArrayBuffer between contexts                       -> { transfer: [...] }\n//   legacy fallback                                          -> JSON.parse(JSON.stringify()) (lossy)\n//\n// Anti-pattern: JSON.parse(JSON.stringify(obj)) for complex data (loses\n//   Date, Map, Set, undefined, throws on circular refs)."
                  }
        ],
        tips: [
                  "Much better than JSON.parse(JSON.stringify()) for preserving Date, Map, Set, typed arrays",
                  "Cannot clone functions or DOM nodes (will throw)",
                  "Transfer option for ArrayBuffer/MessagePort — moves ownership instead of copying",
                  "Returns completely independent clone — no shared references"
        ],
        mistake: "Using JSON method for deep clone of complex objects. JSON loses Date type, Map structure, etc. Use structuredClone() instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
