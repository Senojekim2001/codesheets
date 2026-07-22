export const meta = {
  "title": "Core JavaScript",
  "domain": "javascript",
  "sheet": "core",
  "icon": "🟨"
}

export const sections = [

  // ── Section 1: Types & Functions ─────────────────────────────────────────
  {
    id: "types-functions",
    title: "Types & Functions",
    entries: [
      {
        id: "let-const",
        fn: "let / const",
        desc: "Block-scoped variable declarations. Prefer const by default; use let when reassignment is needed.",
        category: "Types & Functions",
        subtitle: "Block-scoped variable declarations",
        signature: "let name = value  |  const name = value",
        descLong: "const prevents reassignment of the binding (not deep immutability of objects). let is block-scoped and does not hoist to a usable value. Both are temporal dead zone (TDZ) safe — accessing them before declaration throws a ReferenceError.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of let / const — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest declaration: const for constants, let for variables.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: declare block-scoped variables\nconst API_URL = 'https://api.example.com/v2';\nconst MAX_RETRIES = 3;\nlet attempts = 0;\nwhile (attempts < MAX_RETRIES) {\n  attempts++;\n}\n// Block scoping — each iteration gets its own binding\nfor (let i = 0; i < 3; i++) {\n  console.log(i); // 0, 1, 2\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of let / const — common patterns you'll see in production.\n// APPROACH  - Combine let / const with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns and idioms a working developer\n//             reaches for daily (const objects, let reassignment, block scoping).\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like immutability,\n//             temporal dead zone debugging, or production patterns.\n//\n// GOAL: use const for objects and let for reassignable values\n// WHY: const prevents accidental reassignment — default to it\nconst config = { theme: 'dark', lang: 'en' };\n// WHY: const objects are mutable — only the binding is locked\nconfig.theme = 'light';   // OK — mutating property\n// config = {};            // TypeError — can't reassign binding\n// WHY: let when you need to reassign (counters, accumulators)\nlet retries = 0;\nwhile (retries < MAX_RETRIES) {\n  retries++;\n}\n// WHY: let in for loops creates a new binding per iteration\n// With var: would print 3, 3, 3 (shared binding)\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100); // 0, 1, 2\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of let / const — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: immutability, TDZ safety,\n//             destructuring defaults, and const-correctness patterns.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling (ESLint prefer-const); communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a tooling context (linters, TypeScript) that may not exist yet.\n//\n// GOAL: enforce immutability and prevent TDZ bugs\n// WHY: Object.freeze() for shallow immutability of const objects\nconst FROZEN_CONFIG = Object.freeze({ theme: 'dark', lang: 'en' });\n// FROZEN_CONFIG.theme = 'light'; // TypeError in strict mode\n// WHY: destructure with const for immutable bindings\nconst { theme, lang } = FROZEN_CONFIG;\n// WHY: const in for...of — each iteration gets a fresh const binding\nconst items = ['a', 'b', 'c'];\nfor (const item of items) {\n  console.log(item); // const per iteration — no reassignment needed\n}\n// NOTE: ESLint prefer-const rule catches let that could be const\n// NOTE: TypeScript's readonly modifier adds compile-time immutability\n//\n// Decision rule:\n//   value never changes after init              -> const\n//   value reassigned (counter, flag, state)     -> let\n//   value from outer scope, used in closure     -> const (capture the binding)\n//   loop variable in for(;;) or for...of        -> let (for), const (for...of if no reassign)\n//   object whose properties change              -> const (binding stays, props mutate)\n//   object that must be deeply immutable         -> const + Object.freeze() or Immutable.js\n//   variable that could be undefined at init    -> let (const requires initializer)\n//\n// Anti-pattern: using var in modern code.\n//   var is function-scoped, hoists with undefined, and leaks out of blocks.\n//   It causes the infamous loop-closure bug and pollutes the global scope.\n//   Use let/const exclusively — configure ESLint no-var rule to enforce."
                  }
        ],
        tips: [
                  "Default to const — switch to let only when you need to reassign.",
                  "const does NOT make objects or arrays immutable; use Object.freeze() for that.",
                  "Both let and const are block-scoped: they live only inside their {} block.",
                  "Accessing a let/const before its declaration throws ReferenceError (TDZ)."
        ],
        mistake: "Assuming const makes objects immutable. const only prevents rebinding the variable — the object's properties are still fully mutable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "console-log",
        fn: "console.log / warn / error / table",
        desc: "Write output to the browser console or Node.js stdout.",
        category: "I/O",
        subtitle: "console.log, warn, error, table, group, time — DevTools output",
        signature: "console.log(...args)  |  console.error(msg)  |  console.table(obj)",
        descLong: "console is a built-in object available in browsers and Node.js. log/warn/error differ by log level and styling in DevTools. console.table renders arrays/objects as a formatted table. console.time/timeEnd measure elapsed time. In Node.js, console.log writes to stdout and console.error to stderr.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of console.log / warn / error / table — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest calls: log, warn, error with basic values.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: write values to the console\nconsole.log('Hello, World!');\nconsole.log('Name:', 'Alice', 'Score:', 95);\nconsole.log({ name: 'Alice', score: 95 });\nconsole.warn('something odd');\nconsole.error('something broke');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of console.log / warn / error / table — common patterns you'll see in production.\n// APPROACH  - Combine console.log / warn / error / table with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common methods and patterns a working developer\n//             reaches for daily (table, group, time, string interpolation).\n// STRENGTHS - covers the 80% case for real projects; teaches the methods you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like logging\n//             frameworks, production log levels, or structured logging.\n//\n// GOAL: use table, group, time, and template literals for debugging\nconst name = 'Alice', score = 95;\n// WHY: template literals for clean string interpolation\nconsole.log(`${name} scored ${score}%`);\n// WHY: console.table renders arrays of objects as a formatted grid\nconsole.table([{ name: 'Alice', score: 95 }, { name: 'Bob', score: 82 }]);\n// WHY: group/groupEnd collates related logs\nconsole.group('Request cycle');\nconsole.log('sending...');\nconsole.log('response received');\nconsole.groupEnd();\n// WHY: time/timeEnd measures elapsed time\nconsole.time('render');\n// ...expensive operation...\nconsole.timeEnd('render');   // render: 12.345ms\n// WHY: assert only logs when condition is false\nconsole.assert(score > 50, 'Score too low:', score);\n// WHY: count tracks how many times a label is called\nconsole.count('hit');   // hit: 1\nconsole.count('hit');   // hit: 2"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of console.log / warn / error / table — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: structured logging, log levels,\n//             snapshot safety, and migration from console to proper loggers.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with logging/monitoring; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (logging framework) that may not exist yet.\n//\n// GOAL: use console safely in dev and migrate to structured logging in prod\n// WHY: console.log(obj) shows a live reference — snapshot it for debugging\nconst obj = { count: 0 };\nconsole.log(JSON.parse(JSON.stringify(obj))); // frozen snapshot\nobj.count = 5; // the logged snapshot still shows { count: 0 }\n// WHY: console.dir for DOM nodes shows properties, not HTML\nconsole.dir(document.body);\n// WHY: printf-style for precise formatting\nconsole.log('%s scored %d%%', name, score);\nconsole.log('%cStyled', 'color:blue; font-weight:bold'); // CSS in browser\n// NOTE: in Node.js, util.inspect(obj, { depth: null, colors: true }) for deep inspection\n// NOTE: in production, replace console with a logger (winston, pino) for log levels\n//\n// Decision rule:\n//   quick debug / REPL / one-off script           -> console.log()\n//   inspecting arrays of objects                  -> console.table()\n//   measuring performance                         -> console.time() / timeEnd()\n//   grouping related output                       -> console.group() / groupEnd()\n//   conditional logging (dev only)                -> console.assert()\n//   production service / library                  -> winston / pino with log levels\n//   browser production                            -> strip console calls via bundler (terser drop_console)\n//   Node.js production                            -> process.stdout.write() or structured JSON logger\n//\n// Anti-pattern: shipping console.log to production.\n//   console.log is synchronous in Node.js (blocks the event loop), leaks sensitive data,\n//   cannot be filtered by level, and has no structured output. Use a proper logger\n//   from day one — the cost is one import; the payoff is configurable verbosity,\n//   log rotation, and structured JSON for log aggregation systems."
                  }
        ],
        tips: [
                  "console.table() is the most underused method — it renders arrays of objects as a readable grid.",
                  "console.log(obj) in Chrome DevTools shows a live reference — the object may have mutated by the time you expand it. Use console.log(JSON.parse(JSON.stringify(obj))) for a snapshot.",
                  "In Node.js, util.inspect(obj, { depth: null, colors: true }) gives deep inspection beyond console.log.",
                  "Remove all console.log calls before production — use a logger like winston or pino with log levels instead."
        ],
        mistake: "console.log({ myVar }) — using shorthand object syntax to label the variable is intentional and recommended! It logs { myVar: value } instead of just the raw value, so you always know what you're looking at.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "typeof",
        fn: "typeof",
        desc: "Returns a string indicating the type of an operand.",
        category: "Types & Functions",
        subtitle: "Runtime type inspection operator",
        signature: "typeof value",
        descLong: "typeof is an operator (not a function) that returns one of: \"undefined\", \"boolean\", \"number\", \"bigint\", \"string\", \"symbol\", \"object\", or \"function\". It is safe to call on undeclared variables. Note the infamous typeof null === \"object\" quirk.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of typeof — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest typeof checks for basic types.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: check the type of a value at runtime\ntypeof 'hello';    // 'string'\ntypeof 42;         // 'number'\ntypeof true;       // 'boolean'\ntypeof undefined;  // 'undefined'\ntypeof {};         // 'object'\ntypeof [];         // 'object'  ← arrays are objects\ntypeof null;       // 'object'  ← historical bug"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of typeof — common patterns you'll see in production.\n// APPROACH  - Combine typeof with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: type guards, safe undefined checks,\n//             and the null quirk workaround.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like custom type\n//             checking, instanceof chains, or production validation.\n//\n// GOAL: use typeof for function guards and safe undefined checks\n// WHY: typeof lets you branch on type for input validation\nfunction formatValue(val) {\n  if (typeof val === 'string')    return val.trim();\n  if (typeof val === 'number')    return val.toFixed(2);\n  if (typeof val === 'boolean')   return val ? 'Yes' : 'No';\n  if (typeof val === 'undefined') return '—';\n  return String(val);\n}\n// WHY: typeof on undeclared vars returns 'undefined' without throwing\nif (typeof myGlobal !== 'undefined') {\n  // safe to use myGlobal\n}\n// WHY: typeof null is 'object' — must special-case\nif (val === null) { /* handle null */ }\n// WHY: Array.isArray() distinguishes arrays from plain objects\nArray.isArray([]);  // true"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of typeof — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: comprehensive type checking,\n//             instanceof for custom classes, Symbol.toStringTag, and edge cases.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with type systems; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (TypeScript, validation libs) that may not exist yet.\n//\n// GOAL: robust type checking with fallbacks for edge cases\n// WHY: typeof + instanceof covers built-ins and custom classes\nfunction getType(val) {\n  if (val === null) return 'null';\n  if (Array.isArray(val)) return 'array';\n  const t = typeof val;\n  if (t !== 'object') return t;\n  // WHY: Object.prototype.toString gives the internal [[Class]]\n  return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();\n}\n// WHY: instanceof checks the prototype chain — works with custom classes\nclass User {}\nconst u = new User();\nu instanceof User;   // true\nu instanceof Object; // true (inherits)\n// WHY: Symbol.toStringTag lets objects customize typeof-like behavior\nconst tagged = { [Symbol.toStringTag]: 'MyType' };\nObject.prototype.toString.call(tagged); // '[object MyType]'\n// NOTE: TypeScript makes most runtime typeof checks unnecessary\n// NOTE: zod, yup, joi for schema-based runtime validation\n//\n// Decision rule:\n//   check primitive type (string, number, etc.)  -> typeof\n//   check for array specifically                  -> Array.isArray()\n//   check for null specifically                   -> val === null\n//   check custom class instance                   -> instanceof\n//   safe check for potentially undeclared global  -> typeof globalVar !== 'undefined'\n//   get precise type string for any value         -> Object.prototype.toString.call(val)\n//   production input validation                   -> zod / yup schema (not manual typeof)\n//\n// Anti-pattern: using typeof to check for arrays.\n//   typeof [] returns 'object' — indistinguishable from {} and null.\n//   Always use Array.isArray() for array detection."
                  }
        ],
        tips: [
                  "Use Array.isArray(val) to distinguish arrays from plain objects.",
                  "Use val === null to check for null specifically.",
                  "typeof undeclaredVar returns \"undefined\" without throwing — useful for feature detection.",
                  "typeof is an operator, not a function — no parentheses needed (though they're harmless)."
        ],
        mistake: "Using typeof to check for arrays — it returns \"object\" for arrays. Always use Array.isArray() instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "type-coercion",
        fn: "== vs ===",
        desc: "Loose equality (==) coerces types before comparing; strict equality (===) does not.",
        category: "Types & Functions",
        subtitle: "Equality and type coercion",
        signature: "a == b  |  a === b",
        descLong: "The == operator applies a complex set of type-coercion rules (the Abstract Equality Comparison algorithm) before comparing, leading to surprising results. === checks both value and type without coercion. Always prefer === unless you have a specific reason for loose comparison.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of == vs === — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest comparison: == coerces, === does not.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: understand the difference between == and ===\n0 == false;   // true  (coercion: false → 0)\n0 === false;  // false (different types, no coercion)\n'' == false;  // true  (both coerce to 0)\n'' === false; // false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of == vs === — common patterns you'll see in production.\n// APPROACH  - Combine == vs === with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: always use ===, the null==undefined\n//             exception, and real-world input validation bugs.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like Object.is(),\n//             NaN handling, or linting enforcement.\n//\n// GOAL: use === everywhere and understand the one == exception\n// WHY: === is explicit — no surprising coercion\n// The surprising coercion table\nnull == undefined;  // true  (special case in spec — the ONE acceptable ==)\nnull == 0;          // false (null only == undefined)\n// WHY: real-world bug — \"0\" == false is true\nconst input = document.querySelector('#age').value; // \"0\"\nif (input == false) {\n  // BUG: \"0\" == false is true! Valid age rejected\n}\n// WHY: === avoids this — only matches exact type and value\nif (input === '') {\n  // CORRECT: only matches empty string\n}\n// WHY: val == null catches both null and undefined — intentional shorthand\nif (value == null) {\n  // Matches both null and undefined\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of == vs === — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: Object.is() for edge cases,\n//             NaN handling, linting enforcement, and type-safe comparisons.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling (ESLint eqeqeq); communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a tooling context (linters) that may not exist yet.\n//\n// GOAL: enforce strict equality with tooling and handle edge cases\n// WHY: Object.is() handles NaN and -0 correctly (unlike ===)\nObject.is(NaN, NaN);    // true  (=== would be false)\nObject.is(0, -0);       // false (=== would be true)\nObject.is(null, null);  // true  (same as ===)\n// WHY: Number.isNaN() is the correct NaN check (not isNaN or ===)\nNumber.isNaN(NaN);       // true\nNumber.isNaN('hello');   // false (global isNaN would coerce to true)\n// WHY: SameValueZero (used in Map/Set/Array.includes) is like === but NaN matches NaN\nconst set = new Set([NaN]);\nset.has(NaN);  // true (uses SameValueZero)\n// NOTE: ESLint eqeqeq rule enforces === everywhere\n// NOTE: eqeqeq: ['error', 'always', { null: 'never' }] allows == null\n//\n// Decision rule:\n//   general comparison                            -> === (strict equality)\n//   check for both null and undefined             -> val == null (the one exception)\n//   need NaN-aware equality                       -> Object.is(a, b)\n//   check for NaN specifically                    -> Number.isNaN(val)\n//   Map/Set key comparison                        -> SameValueZero (built-in, NaN matches NaN)\n//   deep object comparison                        -> lodash.isEqual / fast-deep-equal\n//\n// Anti-pattern: using == for general comparisons.\n//   == applies the Abstract Equality Comparison algorithm which coerces types\n//   in surprising ways. '' == false, '\\t\\n' == 0, and [1] == '1' are all true.\n//   Adopt ESLint eqeqeq to enforce === everywhere — the one exception (== null)\n//   can be explicitly allowed in the config."
                  }
        ],
        tips: [
                  "Use === in all new code — it is explicit and predictable.",
                  "The one common intentional use of == is null check: val == null catches both null and undefined.",
                  "Object.is(a, b) is like === but handles NaN and -0 correctly.",
                  "NaN === NaN is false — use Number.isNaN(val) to check for NaN."
        ],
        mistake: "Using == for comparisons and being surprised by coercion. Adopt a linter rule (eslint: eqeqeq) to enforce === everywhere.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "nullish",
        fn: "null / undefined",
        desc: "null is an explicit empty value; undefined is the absence of any assigned value.",
        category: "Types & Functions",
        subtitle: "Two flavors of nothingness",
        signature: "let x = null  |  let y  // y is undefined",
        descLong: "undefined is the default value of uninitialized variables, missing function arguments, and absent object properties. null is an intentional empty value you assign explicitly. Both are falsy. Use ?? (nullish coalescing) or ?. (optional chaining) rather than || or && to safely handle them.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of null / undefined — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: undefined is default absence, null is explicit empty.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: understand the two flavors of nothingness\nlet a;          // undefined (no value assigned)\nlet b = null;   // null (explicitly empty)\n// Both are falsy\nif (!a) console.log('a is falsy');\nif (!b) console.log('b is falsy');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of null / undefined — common patterns you'll see in production.\n// APPROACH  - Combine null / undefined with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: ?? for defaults, ?. for safe access,\n//             and the distinction between falsy and nullish.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like strict null\n//             checking, TypeScript's strictNullChecks, or validation libraries.\n//\n// GOAL: use ?? and ?. to safely handle null/undefined\n// WHY: ?. short-circuits to undefined if any link is null/undefined\nconst city = user?.address?.city ?? 'Unknown';\n// WHY: ?? only replaces null/undefined — preserves 0, '', false\n0 ?? 'default';    // 0   (not replaced — 0 is valid)\n'' ?? 'default';   // ''  (not replaced — '' is valid)\nnull ?? 'default'; // 'default' (replaced)\n// WHY: || replaces ALL falsy values — dangerous for 0 and ''\n0 || 'default';    // 'default' (0 is falsy — BUG!)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of null / undefined — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: strict null checking, TypeScript\n//             integration, defensive patterns, and API boundary handling.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with type systems; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (TypeScript) that may not exist yet.\n//\n// GOAL: enforce null safety at the type level and API boundaries\n// WHY: TypeScript strictNullChecks catches null/undefined at compile time\n// WHY: validate at API boundaries — null means \"intentionally empty\"\nfunction processUser(user) {\n  // WHY: assert non-null at boundaries\n  if (user == null) throw new Error('User is required');\n  // WHY: destructure with defaults for safe extraction\n  const { name = 'Anonymous', email = null } = user;\n  // WHY: null means \"no value provided\" — distinct from undefined\n  return { name, email: email ?? 'not provided' };\n}\n// WHY: typeof null === 'object' is a legacy bug — always test explicitly\ntypeof null;  // 'object' ← historical bug, never fixed\n// NOTE: Function parameters missing at call time are undefined, not null\n// NOTE: JSON.stringify omits undefined values but preserves null\n//\n// Decision rule:\n//   variable not yet assigned                    -> undefined (JS default)\n//   intentionally empty / \"no value\"             -> null (explicit intent)\n//   missing function argument                    -> undefined (JS default)\n//   absent object property                       -> undefined (JS default)\n//   API response: field not present              -> undefined (omit from JSON)\n//   API response: field explicitly empty         -> null (include in JSON)\n//   default value for null/undefined             -> ?? (nullish coalescing)\n//   default value for any falsy                  -> || (logical OR)\n//   safe nested property access                  -> ?. (optional chaining)\n//\n// Anti-pattern: using || for defaults when 0 or '' are valid.\n//   || treats 0, '', and false as falsy and replaces them.\n//   Use ?? to only fall back on null/undefined — it preserves\n//   legitimate falsy values like zero and empty string."
                  }
        ],
        tips: [
                  "Prefer ?? over || for defaults: || replaces all falsy values (0, ''), ?? only replaces null/undefined.",
                  "Use ?. (optional chaining) to safely access nested properties without null checks.",
                  "typeof null === \"object\" is a legacy bug in the language — always test null === null explicitly.",
                  "Function parameters missing at call time are undefined, not null."
        ],
        mistake: "Using || for default values when 0 or empty string are valid inputs. Use ?? instead to only fall back on null/undefined.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "arrow-functions",
        fn: "Arrow Functions",
        desc: "Concise function syntax that lexically binds this from the enclosing scope.",
        category: "Types & Functions",
        subtitle: "Concise syntax with lexical this",
        signature: "(params) => expression  |  (params) => { statements }",
        descLong: "Arrow functions do not have their own this, arguments, super, or new.target bindings — they inherit from the enclosing lexical scope. They cannot be used as constructors. For single-expression bodies the return is implicit. For returning object literals, wrap in parentheses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Arrow Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest arrow: single param, implicit return.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: write concise functions with arrow syntax\nconst double = x => x * 2;\nconst add = (a, b) => a + b;\ndouble(5);  // 10\nadd(2, 3);  // 5"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Arrow Functions — common patterns you'll see in production.\n// APPROACH  - Combine Arrow Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: block bodies, object returns,\n//             lexical this for callbacks, and when NOT to use arrows.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like performance\n//             implications, binding patterns, or production conventions.\n//\n// GOAL: use arrows for callbacks and understand lexical this\n// WHY: block body needs explicit return\nconst greet = name => {\n  const msg = `Hello, ${name}!`;\n  return msg;\n};\n// WHY: returning an object literal — wrap in () to avoid parsing ambiguity\nconst toObj = (x, y) => ({ x, y });\n// WHY: lexical this — arrow inherits this from enclosing scope\nclass Timer {\n  start() {\n    setInterval(() => {\n      this.tick(); // 'this' is the Timer instance — no .bind() needed\n    }, 1000);\n  }\n}\n// WHY: NOT for object methods — this would be outer scope, not the object\nconst obj = {\n  name: 'Alice',\n  greet: () => console.log(this.name), // BUG: this is not obj\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Arrow Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: when to use arrows vs regular\n//             functions, performance considerations, and binding patterns.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: choose the right function form for each context\n// WHY: arrow in class fields auto-binds — no constructor .bind() needed\nclass Component {\n  // WHY: arrow class field — this is always the instance\n  handleClick = () => {\n    this.setState({ clicked: true });\n  };\n  // WHY: regular method — this depends on caller (can be rebound)\n  render() {\n    return this.props.children;\n  }\n}\n// WHY: arrow functions cannot be constructors — TypeError\n// const F = () => {}; new F(); // TypeError\n// WHY: arrow functions have no arguments object — use rest params\nconst logAll = (...args) => console.log(args);\n// NOTE: arrow functions are slightly slower to instantiate than regular functions\n// NOTE: prefer function declarations for top-level utilities (hoisting benefit)\n//\n// Decision rule:\n//   callback with lexical this needed            -> arrow function\n//   array method (.map, .filter, .reduce)        -> arrow function\n//   object method (needs dynamic this)            -> method shorthand or function\n//   class method (may be passed as callback)      -> arrow class field\n//   constructor / prototype method                -> regular function (not arrow)\n//   top-level utility (hoisting helpful)          -> function declaration\n//   event handler in React class component        -> arrow class field or .bind()\n//   generator function                            -> function* (arrows can't be generators)\n//\n// Anti-pattern: using arrow functions as object methods.\n//   Arrow functions inherit this from the enclosing scope, not the object.\n//   const obj = { greet: () => this.name } — this is window/undefined, not obj.\n//   Use method shorthand: { greet() { return this.name; } } instead."
                  }
        ],
        tips: [
                  "Use arrow functions for callbacks and array methods where you want lexical this.",
                  "Avoid arrow functions for object methods — this will refer to the outer scope, not the object.",
                  "Never use arrow functions as constructors — they throw TypeError if called with new.",
                  "For returning object literals inline, wrap the object in parentheses: x => ({ key: x })."
        ],
        mistake: "Using an arrow function as an object method and wondering why this is undefined. Object methods need regular function syntax to get the correct this.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "default-params",
        fn: "Default Parameters",
        desc: "Assigns fallback values to function parameters when arguments are undefined.",
        category: "Types & Functions",
        subtitle: "Fallback values for missing arguments",
        signature: "function fn(param = defaultValue)",
        descLong: "Default parameters are evaluated at call time, not definition time. They trigger only when the argument is undefined (not null). Later parameters can reference earlier ones. Avoids the old pattern of param = param || default inside the body.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Default Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: default values for missing arguments.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: provide fallback values for function parameters\nfunction greet(name = 'World') {\n  return `Hello, ${name}!`;\n}\ngreet();         // 'Hello, World!'\ngreet('Alice');  // 'Hello, Alice!'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Default Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Default Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: multiple defaults, referencing\n//             earlier params, and the undefined-vs-null distinction.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like destructuring\n//             defaults, complex default expressions, or production patterns.\n//\n// GOAL: use defaults for optional parameters and understand edge cases\n// WHY: defaults only fire for undefined — null bypasses the default\nfunction greet(name = 'World', greeting = 'Hello') {\n  return `${greeting}, ${name}!`;\n}\ngreet();                // 'Hello, World!'\ngreet('Alice');         // 'Hello, Alice!'\ngreet(undefined, 'Hi'); // 'Hi, World!'  (undefined triggers default)\ngreet(null, 'Hi');      // 'Hi, null'    (null does NOT trigger default)\n// WHY: later params can reference earlier ones\nfunction rect(width, height = width) {\n  return width * height;\n}\nrect(5);    // 25 (square — height defaults to width)\nrect(5, 3); // 15"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Default Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: destructuring defaults,\n//             required parameter patterns, and avoiding shared-state bugs.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use destructuring defaults and required-param patterns\n// WHY: destructuring with defaults for options objects\nfunction fetchData(url, { method = 'GET', timeout = 5000, retries = 3 } = {}) {\n  return fetch(url, { method, signal: AbortSignal.timeout(timeout) });\n}\n// WHY: required parameter pattern — throws if missing\nconst required = (name) => { throw new Error(`${name} is required`); };\nfunction createUser(name = required('name'), age) {\n  return { name, age };\n}\n// WHY: defaults are evaluated at call time — fresh objects each call\nfunction append(item, list = []) {\n  list.push(item);\n  return list;\n}\nappend(1); // [1] — fresh array each call (no shared state)\n// NOTE: avoid using || for defaults — it swallows 0 and ''\n// NOTE: TypeScript makes default params even safer with type checking\n//\n// Decision rule:\n//   simple scalar default                         -> param = value\n//   options object with defaults                  -> destructure with = {}\n//   required parameter (throw if missing)         -> param = required('name')\n//   default that references earlier param         -> param2 = param1\n//   default that must be fresh each call          -> param = [] or param = {} (evaluated at call time)\n//   complex default (computed, conditional)       -> check inside body with ??\n//\n// Anti-pattern: using || for defaults in the function body.\n//   function fn(x) { x = x || 'default'; } — this replaces 0, '', and false.\n//   Use default parameters (fn(x = 'default')) or ?? (x = x ?? 'default') instead."
                  }
        ],
        tips: [
                  "Defaults only fire for undefined — passing null, 0, or '' bypasses the default.",
                  "Complex defaults (objects, arrays) are created fresh on each call — no shared-state bug.",
                  "Required parameters should come before optional ones for clean call signatures.",
                  "Avoid using || in the function body for defaults — it swallows 0 and ''."
        ],
        mistake: "Passing null expecting the default to apply — only undefined triggers a default parameter.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "rest-params",
        fn: "Rest Parameters",
        desc: "Collects all remaining arguments into a real array.",
        category: "Types & Functions",
        subtitle: "Gather trailing arguments into an array",
        signature: "function fn(...rest)",
        descLong: "Rest parameters collect all remaining arguments into a true Array, unlike the old arguments object which is array-like but not a real Array. Must be the last parameter. Can be combined with named parameters before it.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rest Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: collect all args into an array.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: gather all arguments into a real array\nfunction sum(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\nsum(1, 2, 3, 4); // 10"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rest Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Rest Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: named params before rest,\n//             spreading rest back out, and replacing the arguments object.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like performance\n//             with large argument lists or production patterns.\n//\n// GOAL: combine named params with rest and spread\n// WHY: named params before rest — rest must be last\nfunction log(level, ...messages) {\n  console.log(`[${level}]`, ...messages);\n}\nlog('INFO', 'Server started', 'on port 3000');\n// [INFO] Server started on port 3000\n// WHY: rest gives a real Array — .map(), .filter(), .reduce() all work\nfunction append(first, second, ...rest) {\n  return [first, second, ...rest];\n}\n// WHY: rest replaces the legacy arguments object (which is array-like, not Array)\nfunction legacy() {\n  console.log(arguments); // array-like, no .map() etc.\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rest Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: performance with large arg lists,\n//             rest in arrow functions, and combining with destructuring.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use rest params safely in production contexts\n// WHY: rest in arrow functions — arguments doesn't exist in arrows\nconst max = (...nums) => Math.max(...nums);\n// WHY: rest with destructuring — split head from tail\nconst [first, ...rest] = [1, 2, 3, 4];\nfirst; // 1\nrest;  // [2, 3, 4]\n// WHY: rest in object destructuring — pick off known keys\nconst { password, ...safeUser } = user;\n// safeUser has everything except password\n// NOTE: rest params create a new array each call — avoid in hot loops\n// NOTE: spread has an argument count limit (~65536 in V8) — use .apply() for huge arrays\n//\n// Decision rule:\n//   variadic function (any number of args)        -> ...rest\n//   named params + remaining args                 -> fn(first, second, ...rest)\n//   replace arguments object                      -> ...rest (real Array)\n//   arrow function needing variadic args          -> ...rest (arguments doesn't exist)\n//   array destructuring (head + tail)             -> const [first, ...rest] = arr\n//   object destructuring (omit known keys)        -> const { known, ...rest } = obj\n//   spread arguments to another function          -> fn(...args)\n//\n// Anti-pattern: using the arguments object in modern code.\n//   arguments is array-like (no .map, .filter), doesn't exist in arrow functions,\n//   and doesn't work with default parameters. Use rest parameters (...args) instead —\n//   they produce a real Array and work everywhere."
                  }
        ],
        tips: [
                  "Rest parameters produce a real Array — you can call .map(), .filter(), etc. directly.",
                  "arguments is array-like but lacks array methods — prefer rest parameters in new code.",
                  "Rest must be the last parameter — function fn(...a, b) is a SyntaxError.",
                  "Combine with named params: function fn(first, second, ...rest)."
        ],
        mistake: "Using the legacy arguments object inside arrow functions — it does not exist there. Use rest parameters instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "closures",
        fn: "Closures",
        desc: "A function that retains access to its lexical scope even when called outside that scope.",
        category: "Types & Functions",
        subtitle: "Functions remembering their birth scope",
        signature: "function outer() { let x; return function inner() { /* uses x */ } }",
        descLong: "Every function in JavaScript forms a closure over the variables in its enclosing scope. This enables data encapsulation, factory functions, and the module pattern. Closures capture the variable binding, not the value — a common source of bugs in loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Closures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: a function that remembers a variable.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: create a function that remembers its outer scope\nfunction makeCounter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Closures — common patterns you'll see in production.\n// APPROACH  - Combine Closures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: factory functions, data privacy,\n//             and the classic loop-closure bug with let vs var.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like memory\n//             management, WeakRef, or production module patterns.\n//\n// GOAL: use closures for data encapsulation and understand the loop bug\n// WHY: closures hide internal state — count is private\nfunction makeCounter(start = 0) {\n  let count = start;\n  return {\n    increment() { count++; },\n    decrement() { count--; },\n    value()     { return count; },\n  };\n}\nconst c = makeCounter(10);\nc.increment();\nc.increment();\nc.value(); // 12 — count is inaccessible from outside\n// WHY: let creates a new binding per iteration — fixes the classic loop bug\nfor (let i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 100);\n}\n// Prints: 0, 1, 2  (let = new binding per iteration)\n// With var: would print 3, 3, 3 (shared binding)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Closures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: memory management, module pattern,\n//             once() pattern, and avoiding closure leaks.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use closures for production patterns without memory leaks\n// WHY: once() pattern — ensures a function runs only once\nfunction once(fn) {\n  let called = false, result;\n  return function(...args) {\n    if (!called) {\n      called = true;\n      result = fn.apply(this, args);\n    }\n    return result;\n  };\n}\n// WHY: memoize with closure — cache results by argument\nfunction memoize(fn) {\n  const cache = new Map();\n  return function(arg) {\n    if (cache.has(arg)) return cache.get(arg);\n    const result = fn(arg);\n    cache.set(arg, result);\n    return result;\n  };\n}\n// WHY: closures capture the variable binding, not the value\n// Use let in loops to get a fresh binding per iteration\n// Use an IIFE or .bind() if you must use var\n// NOTE: closures keep outer scopes alive — avoid holding large objects in long-lived closures\n// NOTE: use WeakRef for caches that shouldn't prevent GC\n//\n// Decision rule:\n//   data privacy / encapsulation                  -> closure (factory function)\n//   run function only once                         -> once() wrapper\n//   cache expensive computation                    -> memoize() with closure\n//   loop with async callback                       -> let (new binding per iteration)\n//   module pattern (public API + private state)    -> IIFE returning object of methods\n//   event handler with per-instance state          -> closure in constructor\n//   cache that shouldn't prevent GC                -> WeakRef or WeakMap\n//\n// Anti-pattern: using var in loops with async callbacks.\n//   var is function-scoped — all iterations share one binding.\n//   All callbacks see the final value. Use let (block-scoped, new binding per iteration)\n//   or wrap in an IIFE to capture the current value."
                  }
        ],
        tips: [
                  "Closures are the basis of data privacy in JS — variables in the outer function are not accessible externally.",
                  "The loop-closure bug: using var in a for loop shares one binding — use let to get a new binding per iteration.",
                  "Closures keep the outer scope alive in memory — avoid accidentally holding large objects.",
                  "Module pattern uses closures to expose a public API while hiding implementation details."
        ],
        mistake: "Using var in a for loop with async callbacks — all callbacks share the same var binding and see the final value. Switch to let.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Control Flow & Scope ─────────────────────────────────────────
  {
    id: "control-flow-scope",
    title: "Control Flow & Scope",
    entries: [
      {
        id: "for-of",
        fn: "for...of",
        desc: "Iterates over the values of any iterable (arrays, strings, Maps, Sets, generators).",
        category: "Control Flow & Scope",
        subtitle: "Value iteration over iterables",
        signature: "for (const value of iterable)",
        descLong: "for...of works with any object implementing the iterable protocol (Symbol.iterator). It gives you values directly, unlike for...in which iterates keys. Works with break, continue, and return. Use for...of over forEach when you need to break early or use await.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of for...of — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: iterate over array values.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: iterate over values in an array\nconst nums = [10, 20, 30];\nfor (const n of nums) {\n  console.log(n); // 10, 20, 30\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of for...of — common patterns you'll see in production.\n// APPROACH  - Combine for...of with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: strings, entries() for index,\n//             break/continue, and Maps/Sets.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like async iteration,\n//             custom iterables, or performance considerations.\n//\n// GOAL: use for...of with various iterables and control flow\n// WHY: works with any iterable — strings, Maps, Sets\nfor (const char of 'hello') {\n  console.log(char); // h, e, l, l, o\n}\n// WHY: entries() gives [index, value] pairs\nfor (const [i, val] of nums.entries()) {\n  console.log(i, val); // 0 10, 1 20, 2 30\n}\n// WHY: break and continue work — unlike forEach\nfor (const n of nums) {\n  if (n > 15) break;\n}\n// WHY: for...of vs for...in — of gives values, in gives keys\nfor (const key in nums) { console.log(key); } // \"0\", \"1\", \"2\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of for...of — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: async iteration, custom iterables,\n//             for-await-of, and choosing the right loop for the job.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with async patterns; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: choose the right iteration pattern for production\n// WHY: for...of supports await — forEach does not\nasync function processItems(urls) {\n  for (const url of urls) {\n    const data = await fetch(url); // await works here\n    console.log(data);\n  }\n}\n// WHY: for-await-of for async iterables (streams, generators)\nasync function* asyncGen() { yield 1; yield 2; }\nfor await (const val of asyncGen()) {\n  console.log(val);\n}\n// WHY: custom iterable via Symbol.iterator\nconst range = {\n  from: 1, to: 5,\n  [Symbol.iterator]() {\n    return { current: this.from, last: this.to,\n      next() {\n        return this.current <= this.last\n          ? { done: false, value: this.current++ }\n          : { done: true };\n      }\n    };\n  }\n};\nfor (const n of range) { console.log(n); } // 1,2,3,4,5\n// NOTE: forEach can't break/continue/await — use for...of instead\n//\n// Decision rule:\n//   iterate array values                           -> for...of\n//   iterate with index                              -> for...of + .entries()\n//   iterate object keys                             -> for...in or Object.keys()\n//   need break/continue/return                      -> for...of (not forEach)\n//   need await inside loop                          -> for...of (not forEach)\n//   async iterable (stream, async generator)        -> for await...of\n//   transform every element (no side effects)       -> .map()\n//   filter + transform                              -> .filter().map()\n//   reduce to single value                          -> .reduce()\n//\n// Anti-pattern: using for...in on arrays.\n//   for...in iterates enumerable property keys as strings (\"0\",\"1\",\"2\"),\n//   includes inherited properties, and does not guarantee order.\n//   Use for...of for values or .forEach() for side effects."
                  }
        ],
        tips: [
                  "Use for...of for arrays, strings, Maps, Sets, and generators.",
                  "for...in iterates over enumerable property keys — avoid it for arrays.",
                  "Use array.entries() to get both index and value in a for...of loop.",
                  "for...of supports await inside async functions; forEach callbacks do not."
        ],
        mistake: "Using for...in on an array — it iterates string keys (\"0\",\"1\",\"2\") and may include inherited properties. Use for...of instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "optional-chaining",
        fn: "?.",
        desc: "Safely accesses nested properties, returning undefined instead of throwing if any link is null/undefined.",
        category: "Control Flow & Scope",
        subtitle: "Safe navigation through nested objects",
        signature: "obj?.prop  |  obj?.[expr]  |  fn?.()",
        descLong: "Optional chaining short-circuits and returns undefined as soon as it encounters null or undefined in the chain. Works for property access (?.prop), bracket notation (?.[key]), and function calls (?.()). Can be combined with nullish coalescing (??) for defaults.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ?. — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: safe property access without throwing.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: safely access nested properties\nconst user = { address: null };\n// Without ?. — throws TypeError\n// user.address.city  // TypeError\n// With ?. — returns undefined instead of throwing\nuser?.address?.city;  // undefined"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ?. — common patterns you'll see in production.\n// APPROACH  - Combine ?. with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: combining with ??, method calls,\n//             array indexing, and bracket notation.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like over-use\n//             masking bugs, or production validation patterns.\n//\n// GOAL: use ?. with ?? for safe access with defaults\n// WHY: combine ?. with ?? for a clean fallback\nuser?.address?.city ?? 'N/A';  // 'N/A'\n// WHY: ?.() calls a method only if it exists\nuser.getProfile?.();  // undefined if method missing\n// WHY: ?.[] for dynamic/bracket access\nconst key = 'zip';\nconst zip = user?.address?.[key] ?? 'unknown';\n// WHY: short-circuits — stops at first null/undefined\nconst deep = a?.b?.c?.d;  // undefined if any link is null/undefined"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ?. — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: when NOT to use ?., defensive\n//             vs intentional null handling, and TypeScript integration.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with type systems; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (TypeScript) that may not exist yet.\n//\n// GOAL: use ?. intentionally — not as a blanket safety net\n// WHY: ?. on required data masks bugs — validate at boundaries instead\nfunction processOrder(order) {\n  // WHY: assert required fields exist — fail fast\n  if (!order?.id) throw new Error('Order ID required');\n  // WHY: ?. for truly optional fields\n  const discount = order?.coupon?.discount ?? 0;\n  // WHY: ?. for API responses where shape is uncertain\n  const userName = apiResponse?.data?.user?.name ?? 'Unknown';\n}\n// WHY: ?. in assignment context — only valid for property access, not assignment\n// obj?.prop = 5; // SyntaxError — can't assign through ?.\n// NOTE: TypeScript's strictNullChecks makes ?. less necessary at compile time\n// NOTE: excessive ?. hides bugs — use it only where null/undefined is expected\n//\n// Decision rule:\n//   optional / maybe-present property               -> ?.\n//   required property (should always exist)          -> direct access (fail fast)\n//   API response with uncertain shape               -> ?. + ?? for defaults\n//   optional callback                                -> fn?.()\n//   dynamic key on maybe-null object                -> obj?.[key]\n//   deeply nested optional chain                    -> ?. at each nullable level\n//   assignment to nested property                   -> cannot use ?. — check manually\n//\n// Anti-pattern: using ?. everywhere defensively.\n//   Sprinkling ?. on every property access hides bugs where a value should\n//   always exist. Validate at API/function boundaries, use TypeScript for\n//   compile-time safety, and reserve ?. for genuinely optional data."
                  }
        ],
        tips: [
                  "Combine ?. with ?? for safe access with a fallback: obj?.prop ?? 'default'.",
                  "?. short-circuits the whole expression — nothing after the ?. is evaluated if it encounters null/undefined.",
                  "Use ?.() to call a function only if it exists — great for optional callbacks.",
                  "Don't over-use — excessive ?. may hide genuine programming errors."
        ],
        mistake: "Using ?. on every property access defensively, masking bugs where a property should always exist. Only use it where absence is an expected valid state.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "short-circuit",
        fn: "&& / || / ??",
        desc: "Logical operators that short-circuit evaluation and return one of their operands (not always a boolean).",
        category: "Control Flow & Scope",
        subtitle: "Short-circuit evaluation operators",
        signature: "a && b  |  a || b  |  a ?? b",
        descLong: "&& returns the first falsy operand or the last value. || returns the first truthy operand or the last value. ?? returns the right operand only if the left is null or undefined (not for 0 or ''). All three can be used for conditional expressions and default values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of && / || / ?? — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: && and || for conditional logic.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: use && and || for short-circuit evaluation\n// && — returns first falsy or last value\ntrue && 'hello';   // 'hello'\nfalse && 'never';  // false\n// || — returns first truthy or last value\nnull || 'default';  // 'default'\n'hello' || 'world'; // 'hello'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of && / || / ?? — common patterns you'll see in production.\n// APPROACH  - Combine && / || / ?? with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: guarded calls, default values,\n//             and the critical difference between || and ??.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like logical\n//             assignment operators or production validation.\n//\n// GOAL: use short-circuit operators for defaults and guarded execution\n// WHY: && for guarded calls — only call if truthy\nuser && user.name;  // user.name (if user is truthy)\nisReady && startProcess();  // startProcess only called if isReady\n// WHY: || for defaults — but beware: 0 and '' are falsy\nnull || 'default';  // 'default'\n0 || 'default';     // 'default'  ← 0 is falsy! BUG if 0 is valid\n'' || 'default';    // 'default'  ← '' is falsy! BUG if '' is valid\n// WHY: ?? only falls back on null/undefined — preserves 0 and ''\n0 ?? 'default';     // 0   ← 0 is NOT nullish (correct!)\n'' ?? 'default';    // ''  ← '' is NOT nullish (correct!)\nnull ?? 'default';  // 'default'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of && / || / ?? — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: choosing the right operator,\n//             logical assignment (&&=, ||=, ??=), and React patterns.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with frameworks; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: choose the right short-circuit operator for each context\n// WHY: ??= for lazy initialization — only assigns if null/undefined\nobj.cache ??= new Map();\n// WHY: ||= for falsy defaults — assigns if falsy\nconfig.retries ||= 3;\n// WHY: &&= for conditional transformation\nstr &&= str.trim();  // only trim if str is truthy\n// WHY: React pattern — conditional rendering\n// {isLoading && <Spinner />}  // renders Spinner only if isLoading\n// {data?.length > 0 && <List items={data} />}\n// NOTE: these operators return operand values, not booleans\n// NOTE: use !! to coerce to boolean: !!value\n//\n// Decision rule:\n//   default for null/undefined only                 -> ?? (nullish coalescing)\n//   default for any falsy (0, '', false included)   -> ||\n//   conditional execution (guard)                   -> &&\n//   lazy initialize (only if null/undefined)        -> ??=\n//   conditional transform (only if truthy)          -> &&=\n//   fill in falsy default                           -> ||=\n//   React conditional rendering                     -> && (but watch for 0/falsy)\n//\n// Anti-pattern: using || for defaults when 0 or '' are valid.\n//   || treats 0, '', and false as falsy and replaces them.\n//   Use ?? to only fall back on null/undefined — it preserves\n//   legitimate falsy values like zero and empty string."
                  }
        ],
        tips: [
                  "Use ?? instead of || when 0, '', or false are valid values you want to keep.",
                  "&&= and ||= and ??= are logical assignment shorthand operators (ES2021).",
                  "a && b() is a common pattern for guarded calls — calls b() only if a is truthy.",
                  "These operators return operand values, not booleans — use !! to coerce to boolean if needed."
        ],
        mistake: "Using || for a default value when 0 is a valid result. Use ?? to only replace null/undefined.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "hoisting",
        fn: "Hoisting",
        desc: "Variable and function declarations are moved to the top of their scope during compilation.",
        category: "Control Flow & Scope",
        subtitle: "How JS lifts declarations before execution",
        signature: "// var declarations and function declarations are hoisted",
        descLong: "Function declarations are fully hoisted — you can call them before their definition in source code. var declarations are hoisted but initialized to undefined until the assignment line. let and const are hoisted to the top of their block but remain in the Temporal Dead Zone (TDZ) until the declaration is reached.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Hoisting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: function declarations are callable before definition.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: understand that function declarations are hoisted\ngreet('Alice'); // works! (function is hoisted)\nfunction greet(name) { console.log('Hello', name); }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Hoisting — common patterns you'll see in production.\n// APPROACH  - Combine Hoisting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: var hoisting (undefined),\n//             TDZ for let/const, and function expressions NOT hoisted.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like class hoisting,\n//             import hoisting, or production conventions.\n//\n// GOAL: understand what hoists and what doesn't\n// WHY: var is hoisted as undefined — accessible but not useful before assignment\nconsole.log(x); // undefined (not ReferenceError — var is hoisted)\nvar x = 5;\nconsole.log(x); // 5\n// WHY: let/const are hoisted but in TDZ — ReferenceError before declaration\n// console.log(y); // ReferenceError: Cannot access 'y' before initialization\nlet y = 5;\n// WHY: function expressions are NOT hoisted — TypeError if called early\n// add(1, 2); // TypeError: add is not a function\nconst add = (a, b) => a + b;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Hoisting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: class hoisting, import hoisting,\n//             best practices for declaration order, and linting rules.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: write hoisting-safe code with clear declaration order\n// WHY: class declarations are hoisted but in TDZ — can't use before declaration\nclass Queue {\n  #items = [];\n  enqueue(v) { this.#items.push(v); return this; }\n  dequeue()  { return this.#items.shift(); }\n}\n// WHY: function declarations are fully hoisted — safe to call before definition\nprocessQueue(new Queue().enqueue(1).enqueue(2));\nfunction processQueue(q) {\n  while (q.dequeue() !== undefined) { /* drain */ }\n}\n// WHY: const + arrow is NOT hoisted — TDZ applies, so declare before use\nconst createQueue = () => new Queue();  // must appear before any call to createQueue()\n//\n// Decision rule:\n//   top-level utility function                     -> function declaration (hoisting is a feature)\n//   callback / variable holding a function         -> const + arrow (no hoisting needed)\n//   variable that must be initialized first        -> const/let at top of scope\n//   class declaration                              -> declare before use (TDZ applies)\n//   module-level constant                          -> const at top of file\n//\n// Anti-pattern: relying on var hoisting for program logic.\n//   var hoists as undefined, leading to subtle bugs where a variable\n//   is accessed before its assignment. Use let/const and declare at the\n//   top of the scope — the TDZ error is a feature, not a bug."
                  }
        ],
        tips: [
                  "Prefer function declarations for top-level utilities — their hoisting makes code order less fragile.",
                  "Never rely on var hoisting — declare variables at the top of their scope explicitly.",
                  "Arrow functions and function expressions assigned to const/let are not callable before their line.",
                  "Class declarations are hoisted but also in TDZ — instantiating before the class declaration throws."
        ],
        mistake: "Assuming function expressions (const fn = () => {}) are hoisted like function declarations — they are not. They throw TypeError if called before their declaration.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "this-keyword",
        fn: "this",
        desc: "Refers to the object that is currently executing the function, determined by how the function is called.",
        category: "Control Flow & Scope",
        subtitle: "Dynamic context binding",
        signature: "this  (value depends on call site)",
        descLong: "this is determined at runtime based on the call site, not where the function is defined (except for arrow functions). In a method call, this is the object. In a plain function call, this is undefined (strict mode) or the global object. Use .bind(), .call(), .apply() to explicitly set this.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of this — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: this in a method refers to the object.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: understand that this depends on how a function is called\nconst obj = {\n  name: 'Alice',\n  greet() { return `Hi, I'm ${this.name}`; }\n};\nobj.greet(); // \"Hi, I'm Alice\" — this is obj"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of this — common patterns you'll see in production.\n// APPROACH  - Combine this with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: losing this, .bind/.call/.apply,\n//             and arrow functions for lexical this.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like class fields,\n//             event handlers, or framework-specific this patterns.\n//\n// GOAL: control this with .bind(), .call(), .apply(), and arrow functions\n// WHY: this is lost when a method is detached from its object\nconst fn = obj.greet;\nfn(); // \"Hi, I'm undefined\" (strict mode) — this is not obj\n// WHY: .call() and .apply() set this for a single invocation\nfn.call(obj);   // \"Hi, I'm Alice\"\nfn.apply(obj);  // \"Hi, I'm Alice\"\n// WHY: .bind() returns a new function permanently bound to this\nconst bound = fn.bind(obj);\nbound();  // \"Hi, I'm Alice\"\n// WHY: arrow functions inherit this from the enclosing scope\nclass Timer {\n  start() {\n    setTimeout(() => {\n      this.tick(); // 'this' = Timer instance — no .bind() needed\n    }, 1000);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of this — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: arrow class fields, event handlers,\n//             strict mode, and framework-specific this patterns.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with frameworks; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: never lose this in production code\n// WHY: arrow class field — this is always the instance (no .bind() in constructor)\nclass Component {\n  // WHY: arrow class field auto-binds — safe to pass as callback\n  handleClick = () => {\n    this.setState({ clicked: true });\n  };\n  // WHY: regular method — this depends on caller\n  render() {\n    return this.props.children;\n  }\n}\n// WHY: in strict mode, plain function this is undefined (not global)\nfunction strictFn() { 'use strict'; return this; }\nstrictFn(); // undefined\n// WHY: .call(thisArg, ...args) vs .apply(thisArg, [args])\nMath.max.call(null, 1, 2, 3);   // 3 (spread args)\nMath.max.apply(null, [1, 2, 3]); // 3 (array args)\n// NOTE: React class components: bind in constructor or use arrow class fields\n// NOTE: Vue options API: methods are auto-bound to the component instance\n//\n// Decision rule:\n//   method called on object                        -> this = object (natural)\n//   method passed as callback                      -> .bind(this) or arrow class field\n//   one-time this override                         -> .call(thisArg, ...args)\n//   array of args with this override               -> .apply(thisArg, args)\n//   permanent this binding                         -> .bind(thisArg)\n//   callback inside method (needs outer this)      -> arrow function\n//   event handler in class component               -> arrow class field\n//\n// Anti-pattern: passing a method as a callback without binding.\n//   arr.forEach(obj.method) — this inside method is undefined/global, not obj.\n//   Use arr.forEach(obj.method.bind(obj)) or arr.forEach(() => obj.method())\n//   or declare the method as an arrow class field."
                  }
        ],
        tips: [
                  "Arrow functions inherit this from the enclosing scope — great for callbacks inside methods.",
                  ".bind(obj) returns a new function permanently bound to obj — useful for event handlers.",
                  "In strict mode, this in a plain function call is undefined — not the global object.",
                  "Class methods lose their this when passed as callbacks — use arrow methods or .bind() in the constructor."
        ],
        mistake: "Passing a method as a callback (arr.forEach(obj.method)) and losing this. Either use .bind(obj) or an arrow wrapper: () => obj.method().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "try-catch",
        fn: "try / catch / finally",
        desc: "Handles runtime errors gracefully without crashing the program.",
        category: "Control Flow & Scope",
        subtitle: "Structured exception handling",
        signature: "try { } catch (err) { } finally { }",
        descLong: "The try block runs the risky code. If an error is thrown, execution jumps to catch. finally always runs — whether or not an error occurred — making it ideal for cleanup. You can re-throw errors after logging or partial handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of try / catch / finally — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: try/catch to prevent crashes.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: catch errors without crashing\ntry {\n  const data = JSON.parse(rawInput);\n  console.log(data);\n} catch (err) {\n  console.error('Invalid JSON:', err.message);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of try / catch / finally — common patterns you'll see in production.\n// APPROACH  - Combine try / catch / finally with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: instanceof for error types,\n//             finally for cleanup, and re-throwing unknown errors.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like custom error\n//             hierarchies, async error handling, or production logging.\n//\n// GOAL: handle specific errors and always clean up\n// WHY: instanceof distinguishes error types\ntry {\n  const data = JSON.parse(rawInput);\n  processData(data);\n} catch (err) {\n  if (err instanceof SyntaxError) {\n    console.error('Invalid JSON:', err.message);\n  } else {\n    throw err; // WHY: re-throw errors you can't handle\n  }\n} finally {\n  cleanup(); // WHY: finally always runs — ideal for cleanup\n}\n// WHY: custom error classes for domain-specific errors\nclass ValidationError extends Error {\n  constructor(message, field) {\n    super(message);\n    this.name = 'ValidationError';\n    this.field = field;\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of try / catch / finally — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: error hierarchies, Error.cause\n//             chaining, async error handling, and structured logging.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with monitoring; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (logging, monitoring) that may not exist yet.\n//\n// GOAL: build a production-grade error handling strategy\n// WHY: error hierarchy with status codes for HTTP APIs\nclass AppError extends Error {\n  constructor(message, statusCode, options) {\n    super(message, options); // options.cause for chaining (ES2022)\n    this.name = 'AppError';\n    this.statusCode = statusCode;\n  }\n}\nclass NotFoundError extends AppError {\n  constructor(resource) {\n    super(`${resource} not found`, 404);\n    this.name = 'NotFoundError';\n  }\n}\n// WHY: Error.cause chains root causes (ES2022)\ntry {\n  const data = JSON.parse(rawInput);\n} catch (parseErr) {\n  throw new AppError('Failed to parse input', 400, { cause: parseErr });\n}\n// WHY: async error handling — await in try/catch works\nasync function fetchUser(id) {\n  try {\n    const res = await fetch(`/api/users/${id}`);\n    if (!res.ok) throw new AppError('Request failed', res.status);\n    return await res.json();\n  } catch (err) {\n    if (err instanceof AppError) throw err; // re-throw known errors\n    throw new AppError('Network error', 500, { cause: err });\n  }\n}\n// NOTE: never use empty catch blocks — at minimum log and re-throw\n// NOTE: global error handlers: window.onerror (browser), process.on('uncaughtException') (Node)\n//\n// Decision rule:\n//   parse/validation that may fail                  -> try/catch\n//   distinguish error types                         -> instanceof in catch\n//   cleanup (close connections, stop spinners)      -> finally\n//   can't handle the error                          -> re-throw\n//   add context to an error                         -> wrap in custom error with cause\n//   HTTP API error handling                         -> custom error hierarchy with status codes\n//   unhandled rejection / global error              -> window.onerror / process.on('uncaughtException')\n//\n// Anti-pattern: empty catch blocks that swallow errors.\n//   catch(err) {} silently discards errors, making bugs impossible to find.\n//   At minimum, log the error. If you can't handle it, re-throw."
                  }
        ],
        tips: [
                  "Always re-throw errors you didn't specifically handle — swallowing unknown errors hides bugs.",
                  "Use instanceof to handle different error types differently in catch.",
                  "finally is ideal for releasing resources (closing connections, stopping spinners).",
                  "Create custom Error subclasses for domain-specific errors — makes catch branches cleaner."
        ],
        mistake: "Using an empty catch block (catch(err) {}) that silently swallows errors. At minimum, log the error and re-throw if you can't handle it.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "esm-import-export",
        fn: "import / export",
        desc: "ES Module syntax for splitting code across files with static, analyzable dependencies.",
        category: "Control Flow & Scope",
        subtitle: "Native JS module system",
        signature: "export const x = ...  |  import { x } from './file.js'",
        descLong: "ES Modules are statically analyzed at parse time, enabling tree-shaking by bundlers. Named exports allow multiple exports per file; default exports allow one main export. import() (dynamic import) is a function that returns a Promise and enables code splitting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of import / export — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: export and import between files.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: split code across files with export and import\n// math.js\nexport const PI = 3.14159;\nexport function add(a, b) { return a + b; }\n// main.js\nimport { PI, add } from './math.js';\nconsole.log(add(PI, 1));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of import / export — common patterns you'll see in production.\n// APPROACH  - Combine import / export with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: default exports, aliases,\n//             namespace imports, and dynamic imports.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like tree-shaking,\n//             bundler configuration, or production module strategies.\n//\n// GOAL: use named, default, and dynamic imports\n// WHY: default export — one main thing per file\nexport default class User {\n  constructor(name) { this.name = name; }\n}\n// WHY: import aliases avoid naming conflicts\nimport { add as sum } from './math.js';\n// WHY: namespace import — all exports under one object\nimport * as math from './math.js';\nmath.add(1, 2);\n// WHY: dynamic import returns a Promise — enables code splitting\nconst module = await import('./heavy.js');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of import / export — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: tree-shaking, re-exports,\n//             barrel files, dynamic import patterns, and bundler integration.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with bundlers; communicates engineering intent to teammates.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context (bundler) that may not exist yet.\n//\n// GOAL: structure modules for tree-shaking and maintainability\n// WHY: named exports enable tree-shaking — bundlers can eliminate unused exports\n// WHY: barrel file pattern — re-export from a single entry point\n// index.js\nexport { add, multiply } from './math.js';\nexport { default as User } from './user.js';\n// WHY: lazy loading with dynamic import + React\n// const HeavyComponent = React.lazy(() => import('./HeavyComponent'));\n// WHY: import.meta for module metadata\nconsole.log(import.meta.url); // file:///path/to/module.js\n// WHY: side-effect imports — runs the module without importing bindings\nimport './polyfills.js';\n// NOTE: named exports are better for tree-shaking than default exports\n// NOTE: many teams ban default exports for consistent renaming and IDE support\n//\n// Decision rule:\n//   utility function / constant                     -> named export\n//   main class/component of a file                  -> default export (or named, team preference)\n//   re-export from barrel file                      -> export { ... } from './file'\n//   code splitting / lazy loading                   -> dynamic import()\n//   side-effect only (polyfills, CSS)               -> import './file'\n//   namespace (many exports from one module)        -> import * as ns from './file'\n//   avoid naming conflict                           -> import { x as alias }\n//\n// Anti-pattern: mixing default and named exports inconsistently.\n//   Pick a convention — many teams ban default exports entirely because\n//   they make refactoring harder (renaming isn't propagated) and IDE\n//   auto-import is less reliable. Named exports are explicit and consistent."
                  }
        ],
        tips: [
                  "Named exports are better for utilities — they let consumers import only what they need.",
                  "Default exports are idiomatic for main class/component of a file, but make renaming inconsistent.",
                  "Dynamic import(() => import(...)) enables lazy loading and code splitting in bundlers.",
                  "Import paths must include the file extension in native ESM (browser/Deno); bundlers like webpack/Vite typically relax this."
        ],
        mistake: "Mixing default and named exports inconsistently across a codebase. Pick a convention — many teams ban default exports for better refactoring and IDE support.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Prototypes & Modern Features ─────────────────────────────────────────
  {
    id: "prototypes-modern",
    title: "Prototypes & Modern Features",
    entries: [
      {
        id: "prototype-chain",
        fn: "Prototype Chain",
        desc: "Every object has a [[Prototype]] link forming a chain — property lookup walks up this chain.",
        category: "Prototypes & Modern Features",
        subtitle: "JavaScript's inheritance mechanism",
        signature: "Object.getPrototypeOf(obj)  |  Object.create(proto)",
        descLong: "JavaScript uses prototypal inheritance. When you access a property, JS first checks the object itself, then its prototype, then that prototype's prototype, until null is reached. Object.create(proto) creates an object with a specific prototype. class syntax is sugar over this prototype system.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Prototype Chain — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: objects inherit from other objects.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: understand that objects inherit properties from their prototype\nconst animal = { breathe() { return 'breathing'; } };\nconst dog = Object.create(animal);\ndog.bark = function() { return 'woof'; };\ndog.bark();    // 'woof' — own property\ndog.breathe(); // 'breathing' — inherited from animal"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Prototype Chain — common patterns you'll see in production.\n// APPROACH  - Combine Prototype Chain with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: hasOwnProperty vs in,\n//             Object.hasOwn, and prototype inspection.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like prototype\n//             pollution, security, or class syntax internals.\n//\n// GOAL: distinguish own properties from inherited ones\n// WHY: Object.getPrototypeOf inspects the chain\nObject.getPrototypeOf(dog) === animal; // true\n// WHY: hasOwnProperty checks own (not inherited) properties\ndog.hasOwnProperty('bark');    // true  — own\ndog.hasOwnProperty('breathe'); // false — inherited\n// WHY: 'in' operator checks the entire chain\n'breathe' in dog;  // true — found on prototype\n// WHY: Object.hasOwn is the modern, safer alternative\nObject.hasOwn(dog, 'bark'); // true (ES2022)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Prototype Chain — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: prototype pollution prevention,\n//             null-prototype objects, and class syntax internals.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with security practices; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use prototypes safely and understand class internals\n// WHY: Object.create(null) — no prototype, safe for dictionaries\nconst dict = Object.create(null);\ndict.toString = 'custom'; // no conflict with Object.prototype.toString\n// WHY: Object.setPrototypeOf is slow — prefer Object.create()\n// Object.setPrototypeOf(obj, proto); // AVOID — deoptimizes the object\n// WHY: class syntax is sugar over prototypes\nclass Animal {\n  breathe() { return 'breathing'; }\n}\nclass Dog extends Animal {\n  bark() { return 'woof'; }\n}\n// Dog.prototype.__proto__ === Animal.prototype  // true\n// WHY: prototype pollution is a security risk — validate merged objects\n// Object.freeze(Object.prototype) prevents pollution attacks\n// NOTE: for...in iterates inherited enumerable properties — use Object.keys() for own-only\n//\n// Decision rule:\n//   simple inheritance                              -> Object.create(proto)\n//   dictionary / map with arbitrary keys            -> Object.create(null) or Map\n//   check own vs inherited property                 -> Object.hasOwn(obj, key)\n//   check if property exists anywhere in chain      -> key in obj\n//   class-based OOP                                 -> class extends (sugar over prototypes)\n//   prevent prototype pollution                     -> Object.freeze(Object.prototype)\n//\n// Anti-pattern: using for...in without hasOwnProperty filter.\n//   for...in iterates all enumerable properties including inherited ones.\n//   Always filter with Object.hasOwn() or use Object.keys()/Object.entries()."
                  }
        ],
        tips: [
                  "Object.hasOwn(obj, key) is the modern replacement for obj.hasOwnProperty(key) — safer against prototype tampering.",
                  "Object.create(null) creates a truly empty object with no prototype — useful for safe dictionaries.",
                  "for...in iterates all enumerable properties including inherited ones — use Object.keys() for own-only.",
                  "Class syntax creates the same prototype chain under the hood — understanding this helps debug class issues."
        ],
        mistake: "Using for...in on an object and not filtering with hasOwnProperty — inherited enumerable properties will appear unexpectedly.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "property-descriptors",
        fn: "Object.defineProperty()",
        desc: "Define or modify properties with fine-grained control over enumerability, writability, and configurability.",
        category: "Prototypes & Modern Features",
        subtitle: "Low-level property control",
        signature: "Object.defineProperty(obj, key, descriptor)",
        descLong: "Every property has a descriptor with: value, writable (can reassign), enumerable (shows in for...in/Object.keys), configurable (can delete/redefine). Object.defineProperty gives full control. Object.getOwnPropertyDescriptor reads the descriptor. Object.defineProperties defines multiple at once.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.defineProperty() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: define a read-only property.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: create a property that cannot be changed\nconst obj = {};\nObject.defineProperty(obj, 'PI', {\n  value: 3.14159,\n  writable: false,\n});\nobj.PI;       // 3.14159\nobj.PI = 99;  // silently fails (TypeError in strict mode)\nobj.PI;       // still 3.14159"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.defineProperty() — common patterns you'll see in production.\n// APPROACH  - Combine Object.defineProperty() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: all descriptor flags,\n//             getters/setters, and reading descriptors.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like performance\n//             implications or production patterns.\n//\n// GOAL: control property behavior with descriptors\n// WHY: writable, enumerable, configurable give fine-grained control\nObject.defineProperty(obj, 'SECRET', {\n  value: 'hidden',\n  writable: false,\n  enumerable: false,    // WHY: won't show in Object.keys or JSON.stringify\n  configurable: false,  // WHY: can't delete or redefine\n});\n// WHY: getter/setter via descriptor — computed properties\nObject.defineProperty(obj, 'fullName', {\n  get() { return `${this.first} ${this.last}`; },\n  set(val) { [this.first, this.last] = val.split(' '); },\n  enumerable: true,\n  configurable: true,\n});\n// WHY: read back the descriptor\nObject.getOwnPropertyDescriptor(obj, 'PI');\n// { value: 3.14159, writable: false, enumerable: true, configurable: false }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.defineProperty() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: default descriptor values,\n//             Object.defineProperties for bulk, and perfect cloning.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with library patterns; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use descriptors for library-grade property control\n// WHY: defineProperty defaults to false for writable/enumerable/configurable\n// (opposite of regular assignment which defaults to true)\n// WHY: Object.defineProperties for multiple properties at once\nObject.defineProperties(obj, {\n  id:   { value: 1, writable: false, enumerable: true },\n  name: { value: 'Alice', writable: true, enumerable: true },\n});\n// WHY: Object.getOwnPropertyDescriptors for perfect cloning\nconst clone = Object.create(\n  Object.getPrototypeOf(original),\n  Object.getOwnPropertyDescriptors(original)\n);\n// Preserves getters, setters, non-enumerable, non-writable properties\n// NOTE: libraries use non-enumerable properties to hide internal metadata\n// NOTE: Object.freeze() sets writable:false AND configurable:false on all properties\n//\n// Decision rule:\n//   read-only constant                              -> writable: false\n//   hide from JSON.stringify / Object.keys          -> enumerable: false\n//   prevent deletion or redefinition                -> configurable: false\n//   computed property (getter/setter)               -> get() / set() in descriptor\n//   bulk property definitions                       -> Object.defineProperties()\n//   perfect object clone (preserve all descriptors) -> Object.getOwnPropertyDescriptors()\n//   freeze entire object                            -> Object.freeze() (simpler than manual)\n//\n// Anti-pattern: forgetting that defineProperty defaults differ from assignment.\n//   Regular assignment: writable=true, enumerable=true, configurable=true.\n//   defineProperty: writable=false, enumerable=false, configurable=false.\n//   Always explicitly set the flags you need."
                  }
        ],
        tips: [
                  "New properties added via defineProperty default to writable: false, enumerable: false, configurable: false — opposite of assignment.",
                  "Object.getOwnPropertyNames() returns all own keys including non-enumerable ones.",
                  "Object.getOwnPropertyDescriptors() returns all descriptors — useful for perfect object cloning.",
                  "Libraries use non-enumerable properties to hide internal metadata from JSON.stringify and loops."
        ],
        mistake: "Assuming Object.freeze() uses defineProperty internally with writable: false — freeze also prevents adding/deleting properties.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "object-create",
        fn: "Object.create() / Object.assign()",
        desc: "Object.create sets the prototype explicitly. Object.assign copies own enumerable properties.",
        category: "Prototypes & Modern Features",
        subtitle: "Prototype-aware object construction",
        signature: "Object.create(proto, descriptors?)  |  Object.assign(target, ...sources)",
        descLong: "Object.create(proto) creates a new object whose [[Prototype]] is proto. Pass null for a prototype-free dictionary. A second argument accepts property descriptors. Object.assign copies own enumerable string-keyed properties — it's a shallow merge that mutates the target.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Object.create() / Object.assign() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: Object.assign to merge objects.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: merge objects and create prototype-linked objects\nconst defaults = { theme: 'light' };\nconst settings = { theme: 'dark', lang: 'en' };\nconst merged = Object.assign({}, defaults, settings);\n// { theme: 'dark', lang: 'en' }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Object.create() / Object.assign() — common patterns you'll see in production.\n// APPROACH  - Combine Object.create() / Object.assign() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: prototype-free dictionaries,\n//             prototype-based inheritance, and spread vs assign.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like deep cloning,\n//             getter/setter behavior, or production patterns.\n//\n// GOAL: use Object.create for inheritance and Object.assign for merging\n// WHY: Object.create(null) — no prototype baggage, safe for any key\nconst dict = Object.create(null);\ndict['toString'] = 'my value'; // no conflict with Object.prototype\n// WHY: Object.create with prototype for inheritance\nconst Vehicle = {\n  describe() { return `${this.type} going ${this.speed}mph`; }\n};\nconst car = Object.create(Vehicle);\ncar.type = 'car';\ncar.speed = 60;\ncar.describe(); // 'car going 60mph'\n// WHY: spread {...obj} is usually preferred over Object.assign\nconst merged2 = { ...defaults, ...settings };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Object.create() / Object.assign() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: deep cloning, getter/setter\n//             behavior, structuredClone, and perfect cloning.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with modern APIs; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: choose the right object creation/copy strategy\n// WHY: Object.assign triggers setters — spread copies values directly\nconst target = { set x(v) { this._x = v; } };\nObject.assign(target, { x: 5 }); // triggers setter — target._x = 5\nconst spread = { ...target, x: 5 }; // copies the getter's value, not the setter\n// WHY: structuredClone for deep copies (Node 17+, browsers)\nconst deep = structuredClone(original);\n// Handles: objects, arrays, Map, Set, Date, RegExp, ArrayBuffer\n// Does NOT handle: functions, DOM nodes, symbols\n// WHY: perfect clone preserving all descriptors\nconst perfect = Object.create(\n  Object.getPrototypeOf(original),\n  Object.getOwnPropertyDescriptors(original)\n);\n// NOTE: Object.assign is shallow — nested objects are shared references\n// NOTE: JSON.parse(JSON.stringify(obj)) loses functions, dates, undefined\n//\n// Decision rule:\n//   shallow merge                                   -> { ...a, ...b } (spread)\n//   merge with setter triggers                      -> Object.assign(target, src)\n//   prototype-free dictionary                       -> Object.create(null) or Map\n//   prototype-based inheritance                     -> Object.create(proto)\n//   deep clone (modern)                             -> structuredClone(obj)\n//   deep clone (legacy, JSON-safe data)             -> JSON.parse(JSON.stringify(obj))\n//   perfect clone (preserve descriptors)            -> Object.create + getOwnPropertyDescriptors\n//\n// Anti-pattern: using Object.assign thinking it deep-clones.\n//   Object.assign only copies own enumerable properties one level deep.\n//   Nested objects are shared references. Use structuredClone() for deep copies."
                  }
        ],
        tips: [
                  "Object.create(null) is the correct type for a pure string-keyed map with no prototype baggage.",
                  "Object.assign triggers setters on the target — spread ({...obj}) copies the values directly.",
                  "Spread is shallower than Object.assign for some edge cases with getters.",
                  "Object.getOwnPropertyDescriptors + Object.create is the most complete object clone."
        ],
        mistake: "Using Object.assign({}, src) thinking it deep-clones — it only copies one level. Use structuredClone() for deep copies.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "symbol",
        fn: "Symbol()",
        desc: "Creates a unique, immutable primitive value — guaranteed to not collide with any other property key.",
        category: "Prototypes & Modern Features",
        subtitle: "Unique property keys and meta-programming hooks",
        signature: "const sym = Symbol(\"description\")",
        descLong: "Symbols are unique primitives — no two symbols are ever equal. They're used as non-colliding property keys (for library metadata, private-ish properties), and as well-known hooks (Symbol.iterator, Symbol.toPrimitive) that customize built-in language behaviors. Symbol.for(key) creates/retrieves a global registry symbol.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Symbol() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: symbols are always unique.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: create unique, non-colliding property keys\nconst id = Symbol('id');\nconst id2 = Symbol('id');\nid === id2; // false — always unique, even with same description"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Symbol() — common patterns you'll see in production.\n// APPROACH  - Combine Symbol() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: symbol property keys,\n//             global registry, and well-known symbols.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like security,\n//             private fields, or production meta-programming.\n//\n// GOAL: use symbols for non-colliding keys and custom type coercion\n// WHY: symbol keys are invisible to JSON.stringify and for...in\nconst user = { name: 'Alice', [id]: 42 };\nuser[id]; // 42 — accessible, but hidden from enumeration\n// WHY: Symbol.for() for shared symbols across realms\nconst s1 = Symbol.for('shared');\nconst s2 = Symbol.for('shared');\ns1 === s2; // true — same registry entry\n// WHY: Symbol.toPrimitive customizes type coercion\nconst money = {\n  amount: 100,\n  [Symbol.toPrimitive](hint) {\n    if (hint === 'string') return `$${this.amount}`;\n    return this.amount;\n  }\n};\n`${money}`; // '$100' (string hint)\nmoney + 50;  // 150    (number hint)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Symbol() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: privacy limitations,\n//             well-known symbols for meta-programming, and class private fields.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with language features; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use symbols correctly and know when to use private fields instead\n// WHY: Symbol.iterator makes any object iterable\nconst range = {\n  from: 1, to: 3,\n  [Symbol.iterator]() {\n    let current = this.from;\n    return { next: () => current <= this.to\n      ? { done: false, value: current++ }\n      : { done: true } };\n  }\n};\n[...range]; // [1, 2, 3]\n// WHY: symbols are NOT truly private — discoverable via Object.getOwnPropertySymbols()\nObject.getOwnPropertySymbols(user); // [Symbol(id)]\n// WHY: class private fields (#) provide real privacy (ES2022)\nclass User {\n  #id = Symbol('id'); // truly private — not discoverable\n  getId() { return this.#id; }\n}\n// NOTE: well-known symbols: Symbol.iterator, Symbol.toPrimitive, Symbol.toStringTag, Symbol.asyncIterator\n//\n// Decision rule:\n//   unique property key (no collision)              -> Symbol()\n//   shared key across realms / libraries            -> Symbol.for('key')\n//   custom type coercion (string/number)            -> Symbol.toPrimitive\n//   make object iterable                            -> Symbol.iterator\n//   custom toString output                          -> Symbol.toStringTag\n//   real privacy (not discoverable)                 -> class private fields (#)\n//   library metadata (hidden from users)            -> Symbol (acceptable, not truly private)\n//\n// Anti-pattern: using Symbol as a security mechanism.\n//   Symbols are discoverable via Object.getOwnPropertySymbols().\n//   For real privacy, use class private fields (#field) — they are\n//   truly inaccessible from outside the class."
                  }
        ],
        tips: [
                  "Symbol keys are invisible to JSON.stringify, Object.keys(), and for...in — use for truly private metadata.",
                  "Symbol.for() creates a cross-realm shared symbol — useful for library inter-op.",
                  "Symbol.toPrimitive is called on type coercion — implement for custom number/string conversion.",
                  "Symbol.iterator makes any object work with for...of and spread."
        ],
        mistake: "Using Symbol as a security mechanism for private data — symbols are discoverable via Object.getOwnPropertySymbols(). Use class private fields (#) for real privacy.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "weakref",
        fn: "WeakRef / FinalizationRegistry",
        desc: "WeakRef holds a weak reference to an object that doesn't prevent garbage collection.",
        category: "Prototypes & Modern Features",
        subtitle: "GC-friendly object references",
        signature: "const ref = new WeakRef(target)  →  ref.deref()",
        descLong: "A WeakRef holds a reference that won't prevent garbage collection. ref.deref() returns the object or undefined if it was collected. FinalizationRegistry runs a callback after an object is collected. Both are advanced — most code should not need them. Primary use: caching without preventing GC.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WeakRef / FinalizationRegistry — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: a weak reference that doesn't prevent GC.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: hold a reference that doesn't prevent garbage collection\nconst ref = new WeakRef(largeObject);\n// ...later...\nconst obj = ref.deref(); // returns object or undefined if collected"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WeakRef / FinalizationRegistry — common patterns you'll see in production.\n// APPROACH  - Combine WeakRef / FinalizationRegistry with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: cache with WeakRef,\n//             FinalizationRegistry for cleanup callbacks.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like GC timing,\n//             non-determinism, or production cache strategies.\n//\n// GOAL: build a cache that doesn't prevent garbage collection\n// WHY: WeakRef cache — entries can be collected when memory is needed\nclass WeakCache {\n  #cache = new Map();\n  set(key, value) { this.#cache.set(key, new WeakRef(value)); }\n  get(key) {\n    const ref = this.#cache.get(key);\n    if (!ref) return undefined;\n    const value = ref.deref();\n    if (!value) { this.#cache.delete(key); return undefined; }\n    return value;\n  }\n}\n// WHY: FinalizationRegistry runs a callback after GC collects an object\nconst registry = new FinalizationRegistry(key => {\n  console.log(`Object with key ${key} was collected`);\n});\nlet obj = { data: 'important' };\nregistry.register(obj, 'myObj');\nobj = null; // eligible for GC"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WeakRef / FinalizationRegistry — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: GC non-determinism,\n//             WeakRef vs WeakMap, and when NOT to use these APIs.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with system understanding; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: know when to use WeakRef and when to avoid it\n// WHY: GC timing is non-deterministic — don't rely on FinalizationRegistry for logic\n// The callback may run seconds later or never (if the page closes first)\n// WHY: WeakMap is almost always the right tool for associating data with objects\nconst metadata = new WeakMap();\nmetadata.set(obj, { created: Date.now() });\n// obj is collected → metadata entry is automatically removed\n// WHY: WeakRef is for caches where you need the target outside a map\n// Use case: image cache, computed-value cache, observable targets\n// NOTE: most code should NOT use WeakRef or FinalizationRegistry\n// NOTE: prefer WeakMap for \"data associated with an object\"\n//\n// Decision rule:\n//   associate data with an object (auto-cleanup)    -> WeakMap\n//   cache where entries should not prevent GC       -> WeakRef (advanced)\n//   run cleanup when object is collected            -> FinalizationRegistry (advanced)\n//   general-purpose weak pointer                    -> DON'T — use WeakMap\n//\n// Anti-pattern: using WeakRef where WeakMap would work.\n//   WeakMap is simpler, more predictable, and sufficient for most\n//   \"weakly hold object\" use cases. WeakRef is an advanced API\n//   for specialized caching scenarios only."
                  }
        ],
        tips: [
                  "Always check deref() result — the object may have been collected between calls.",
                  "Don't use WeakRef as a general-purpose weak pointer — it's for caches and observables only.",
                  "GC timing is non-deterministic — don't rely on FinalizationRegistry for program logic.",
                  "WeakMap is almost always the right tool for associating data with objects — use WeakRef only when you need the target outside a map."
        ],
        mistake: "Using WeakRef where WeakMap would work — WeakMap is simpler and sufficient for most \"weakly hold object\" use cases.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "logical-assignment-ops",
        fn: "Logical Assignment (&&=, ||=, ??=)",
        desc: "Assign a value only if a condition is met — combining logical operators with assignment.",
        category: "Prototypes & Modern Features",
        subtitle: "Conditional assignment shorthand",
        signature: "x &&= y  |  x ||= y  |  x ??= y",
        descLong: "&&= assigns only if the left side is truthy. ||= assigns only if the left side is falsy. ??= assigns only if the left side is null or undefined. All short-circuit — the right side is not evaluated if the condition isn't met. More concise and semantically clearer than if/else alternatives.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Logical Assignment (&&=, ||=, ??=) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: ??= for lazy initialization.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: assign a value only if the variable is null/undefined\nlet cache;\ncache ??= new Map();  // assigns Map (cache was undefined)\ncache ??= new Map();  // no-op (cache already has a value)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Logical Assignment (&&=, ||=, ??=) — common patterns you'll see in production.\n// APPROACH  - Combine Logical Assignment (&&=, ||=, ??=) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: all three operators,\n//             the critical ||= vs ??= distinction, and lazy init.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like performance\n//             in hot paths or production conventions.\n//\n// GOAL: use logical assignment for concise conditional updates\n// WHY: &&= assigns only if truthy — conditional transformation\nlet user = { name: 'Alice', prefs: null };\nuser.prefs &&= { theme: 'dark' }; // no-op, prefs is null\nuser.name &&= user.name.toUpperCase(); // 'ALICE'\n// WHY: ||= assigns only if falsy — beware: 0 is falsy!\nlet config = { timeout: 0 };\nconfig.timeout ||= 3000; // sets to 3000 — 0 is falsy! (BUG if 0 is valid)\n// WHY: ??= assigns only if null/undefined — safest for defaults\nlet settings = { timeout: 0, name: null };\nsettings.timeout ??= 3000; // keeps 0 — not nullish (correct!)\nsettings.name ??= 'default'; // sets to 'default'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Logical Assignment (&&=, ||=, ??=) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: choosing the right operator,\n//             short-circuit behavior, and avoiding subtle bugs.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with code review standards; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: choose the correct logical assignment operator\n// WHY: all three short-circuit — right side only evaluates if assignment happens\nlet count = 0;\ncount ||= expensiveDefault(); // calls expensiveDefault() — 0 is falsy\ncount ??= expensiveDefault(); // does NOT call — 0 is not nullish\n// WHY: ??= for lazy initialization is the most common production pattern\nclass Service {\n  #cache;\n  getCache() {\n    this.#cache ??= new Map(); // lazy init — only creates Map once\n    return this.#cache;\n  }\n}\n// WHY: &&= for conditional transformation chains\nfunction normalize(str) {\n  str &&= str.trim();\n  str &&= str.toLowerCase();\n  return str;\n}\n// NOTE: ||= can unexpectedly overwrite 0, \"\", false\n// NOTE: ??= is the safest default — only replaces null/undefined\n//\n// Decision rule:\n//   lazy initialize (only if null/undefined)        -> ??=\n//   fill in falsy default (0, '', false included)   -> ||=\n//   conditional transform (only if truthy)          -> &&=\n//   numeric default where 0 is valid                -> ??= (NOT ||=)\n//   string default where '' is valid                -> ??= (NOT ||=)\n//\n// Anti-pattern: using ||= for numeric defaults when 0 is valid.\n//   ||= treats 0 as falsy and overwrites it. Use ??= to only\n//   replace null/undefined — it preserves legitimate zero values."
                  }
        ],
        tips: [
                  "??= is the safest for defaults — it only fills in null/undefined, preserving 0 and \"\".",
                  "||= can unexpectedly overwrite 0, \"\", or false — be deliberate about which you need.",
                  "&&= is useful for conditional transformation: str &&= str.trim().",
                  "All three are short-circuit — the right side only evaluates if the assignment will happen."
        ],
        mistake: "Using ||= for numeric defaults when 0 is valid — ||= treats 0 as falsy and overwrites it. Use ??= instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "numeric-separators",
        fn: "Numeric Separators (_)",
        desc: "Underscores in numeric literals improve readability without changing the value.",
        category: "Prototypes & Modern Features",
        subtitle: "Readable large number literals",
        signature: "1_000_000  |  0xFF_EC_D5  |  0b1010_0001",
        descLong: "Numeric separators (ES2021) allow underscores between digits in numeric literals for readability. They work with decimal, hex (0x), binary (0b), octal (0o), and BigInt literals. The underscore has no effect on the value — it's purely cosmetic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Numeric Separators (_) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: underscores make large numbers readable.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: make large numbers readable with underscores\nconst million = 1_000_000;\nconst billion = 1_000_000_000;\n1_000 === 1000; // true — underscores are cosmetic only"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Numeric Separators (_) — common patterns you'll see in production.\n// APPROACH  - Combine Numeric Separators (_) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: hex, binary, BigInt,\n//             and byte groupings.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like bundler\n//             compatibility or production conventions.\n//\n// GOAL: use separators across all numeric literal types\n// WHY: hex colors with byte grouping\nconst color = 0xFF_EC_D5_AB;\n// WHY: binary flags grouped by nibble\nconst FLAG = 0b1010_0001_0000;\n// WHY: BigInt with thousand separators\nconst bigNum = 9_007_199_254_740_991n;\n// WHY: byte-sized groupings\nconst MAX_BUFFER = 1_024 * 1_024; // 1MB\n// WHY: decimal precision grouping\nconst pi = 3.141_592_653;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Numeric Separators (_) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: valid/invalid positions,\n//             bundler compatibility, and team conventions.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with tooling; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use numeric separators correctly in production\n// WHY: valid positions — only between digits\n1_000_000;       // OK\n0xDE_AD_BE_EF;   // OK\n0b1010_0001;     // OK\n// WHY: invalid positions — SyntaxError\n// _100;    // cannot start with _\n// 100_;    // cannot end with _\n// 1._0;    // cannot be next to decimal point\n// 1_.0;    // cannot be next to decimal point\n// NOTE: supported in all modern browsers and Node.js 12.5+\n// NOTE: TypeScript supports since 2.7\n// NOTE: bundlers (webpack, Vite, esbuild) all support numeric separators\n//\n// Decision rule:\n//   large decimal numbers                          -> group by thousands: 1_000_000\n//   hex colors / addresses                         -> group by byte: 0xFF_EC_D5\n//   binary flags                                   -> group by nibble: 0b1010_0001\n//   BigInt large values                            -> group by thousands: 1_000n\n//   byte counts                                    -> group by power: 1_024 * 1_024\n//\n// Anti-pattern: putting underscores in invalid positions.\n//   _1000, 1000_, 1._0, 1_.0 are all SyntaxErrors.\n//   Underscores can only appear between digits."
                  }
        ],
        tips: [
                  "Use separators to group digits in thousands, byte addresses, or binary flag fields.",
                  "Cannot appear at the start, end, or next to a decimal point: _100, 100_, 1._0 are errors.",
                  "Works with BigInt literals: 1_000n.",
                  "Recognized by all modern bundlers and transpilers."
        ],
        mistake: "Putting underscores at the start or end: _1000 or 1000_ — these are syntax errors. Underscores can only appear between digits.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "intl-api",
        fn: "Intl API",
        desc: "Format numbers, dates, and strings for different locales.",
        category: "Internationalization",
        subtitle: "Locale-aware formatting without external libraries",
        signature: "new Intl.DateTimeFormat(locales, options).format(date)\nnew Intl.NumberFormat(locales, options).format(number)\nnew Intl.Collator(locales, options).compare(str1, str2)",
        descLong: "The Intl API provides locale-aware formatting for dates, numbers, and strings. Format currency symbols, date patterns, number decimals per locale. Collator handles language-aware string comparison for sorting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Intl API — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: format a date and number for a locale.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: format dates and numbers for different locales\nconst date = new Date('2026-03-16');\nnew Intl.DateTimeFormat('en-US').format(date); // \"3/16/2026\"\nnew Intl.DateTimeFormat('de-DE').format(date); // \"16.3.2026\"\nnew Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.56); // \"$1,234.56\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Intl API — common patterns you'll see in production.\n// APPROACH  - Combine Intl API with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: detailed date options,\n//             currency/percent formatting, collation, and relative time.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like performance,\n//             caching formatters, or production i18n strategies.\n//\n// GOAL: use Intl for common formatting and sorting tasks\n// WHY: detailed date formatting with weekday, month names\nnew Intl.DateTimeFormat('fr-FR', {\n  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'\n}).format(date); // \"lundi 16 mars 2026\"\n// WHY: currency formatting adapts symbol position and decimal separator\nnew Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(1234.56); // \"1.234,56 €\"\n// WHY: percent formatting\nnew Intl.NumberFormat('en-US', { style: 'percent' }).format(0.875); // \"87%\"\n// WHY: locale-aware string sorting\nconst fruits = ['ä-pple', 'zebra', 'apple'];\nnew Intl.Collator('de-DE').compare('ä', 'z'); // -1 (ä sorts before z in German)\n// WHY: relative time formatting\nconst rtf = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });\nrtf.format(-1, 'day');  // \"yesterday\"\nrtf.format(3, 'day');   // \"in 3 days\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Intl API — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: caching formatters,\n//             ListFormat, PluralRules, and i18n library decisions.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with i18n strategies; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use Intl efficiently in production\n// WHY: cache formatters — creating them is expensive\nconst currencyCache = new Map();\nfunction formatCurrency(amount, locale, currency) {\n  const key = `${locale}|${currency}`;\n  if (!currencyCache.has(key)) {\n    currencyCache.set(key, new Intl.NumberFormat(locale, { style: 'currency', currency }));\n  }\n  return currencyCache.get(key).format(amount);\n}\n// WHY: Intl.ListFormat for natural language lists\nnew Intl.ListFormat('en', { style: 'long', type: 'conjunction' })\n  .format(['apple', 'banana', 'cherry']); // \"apple, banana, and cherry\"\n// WHY: Intl.PluralRules for pluralization\nconst pr = new Intl.PluralRules('en-US');\npr.select(0); // 'other'\npr.select(1); // 'one'\n// NOTE: for full i18n (translations, ICU messages), use a library like react-intl or i18next\n// NOTE: Intl is built-in — no bundle size cost\n//\n// Decision rule:\n//   simple date/number formatting                   -> Intl.DateTimeFormat / NumberFormat\n//   locale-aware string sorting                     -> Intl.Collator\n//   relative time (\"3 days ago\")                    -> Intl.RelativeTimeFormat\n//   natural language lists                          -> Intl.ListFormat\n//   pluralization rules                             -> Intl.PluralRules\n//   full i18n (translations, ICU messages)          -> react-intl / i18next\n//   performance: reuse formatters                   -> cache Intl instances\n//\n// Anti-pattern: hard-coding date/number formats.\n//   \"MM/DD/YYYY\" or \"$1,234.56\" breaks in non-US locales.\n//   Intl adapts automatically — use it instead of manual formatting."
                  }
        ],
        tips: [
                  "Intl.DateTimeFormat supports 12-hour/24-hour, weekday names, timezone display — very flexible",
                  "Intl.NumberFormat handles grouping, decimals, and minus signs per locale automatically",
                  "Collator.compare() is used with Array.sort() for locale-aware sorting (not simple < operator)",
                  "ListFormat (experimental): new Intl.ListFormat(\"en\").format([\"apple\", \"banana\", \"cherry\"]) → \"apple, banana, and cherry\""
        ],
        mistake: "Hard-coding number/date formatting (commas, slashes) instead of using Intl. Breaks in different locales — Intl adapts automatically.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "regexp-named-groups",
        fn: "RegExp Named Groups",
        desc: "Extract regex matches by name, not just index.",
        category: "RegExp",
        subtitle: "Self-documenting regex capture groups",
        signature: "/(?<name>pattern)/g",
        descLong: "Named groups make regexes readable. Instead of accessing match[1], match[2], access match.groups.name. Combine with .replace() for powerful text transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RegExp Named Groups — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: named capture groups in a regex.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: extract regex matches by name instead of index\nconst dateRegex = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;\nconst { year, month, day } = '2026-03-16'.match(dateRegex).groups;\nconsole.log(`${month}/${day}/${year}`); // \"03/16/2026\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RegExp Named Groups — common patterns you'll see in production.\n// APPROACH  - Combine RegExp Named Groups with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: email parsing, replace with\n//             named backreferences, and destructuring groups.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like multiple\n//             matches with /g flag or production validation.\n//\n// GOAL: use named groups for readable regex extraction and replacement\n// WHY: named groups are self-documenting — no more match[1], match[2]\nconst emailRegex = /(?<user>[\\w.-]+)@(?<domain>[\\w.-]+)\\.(?<tld>\\w+)/;\nconst match = 'alice@company.com'.match(emailRegex);\nmatch.groups.user;   // \"alice\"\nmatch.groups.domain; // \"company\"\n// WHY: $<name> backreferences in replace()\nconst url = 'https://example.com/api/users';\nurl.replace(/https:\\/\\/(?<domain>[^/]+)\\/(?<path>.+)/, 'https://new-$<domain>/$<path>');\n// \"https://new-example.com/api/users\"\n// WHY: destructure groups directly\nconst fnRegex = /(?<fn>\\w+)\\((?<args>[^)]*)\\)/;\nconst { fn, args } = 'calculate(x, y)'.match(fnRegex).groups;\nfn;   // \"calculate\"\nargs; // \"x, y\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RegExp Named Groups — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: multiple matches with /g,\n//             matchAll for iteration, and browser compatibility.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with modern APIs; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use named groups in production regex patterns\n// WHY: String.matchAll with /g for iterating all matches with named groups\nconst logPattern = /\\[(?<level>\\w+)\\] (?<message>.+)/g;\nconst logs = '[INFO] Started\\n[ERROR] Failed\\n[DEBUG] x=5';\nfor (const m of logs.matchAll(logPattern)) {\n  console.log(`${m.groups.level}: ${m.groups.message}`);\n}\n// INFO: Started\n// ERROR: Failed\n// DEBUG: x=5\n// WHY: named groups with exec() loop for per-match processing\nconst pattern = /(?<key>\\w+)=(?<value>\\w+)/g;\nlet m;\nwhile ((m = pattern.exec('a=1 b=2 c=3')) !== null) {\n  console.log(m.groups.key, m.groups.value);\n}\n// NOTE: named groups supported in Chrome 64+, Firefox 78+, Node.js 10+\n// NOTE: use transpiler (Babel) for older browser support\n//\n// Decision rule:\n//   simple extraction (one match)                   -> .match(regex).groups\n//   multiple matches with iteration                 -> .matchAll(regex) or exec() loop\n//   replace with named backreferences               -> .replace(regex, '$<name>')\n//   destructure groups into variables               -> const { a, b } = str.match(re).groups\n//   need index-based access too                     -> groups still available alongside [1], [2]\n//\n// Anti-pattern: using numeric indices when named groups are available.\n//   match[1], match[2] is fragile — reordering groups in the regex\n//   silently breaks the code. Named groups (match.groups.name)\n//   are self-documenting and survive regex refactoring."
                  }
        ],
        tips: [
                  "Syntax: (?<groupName>...) wraps a group. Access via match.groups.groupName",
                  "Combine with String.replace(): $<groupName> backreferences in replacement string",
                  "Works with /g flag for multiple matches. Each match returns same group names",
                  "Backward compatible: older browsers may not support. Use transpiler or feature detection"
        ],
        mistake: "Still using numeric indices (match[1], match[2]) when named groups available. Switch to match.groups.name for readability.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "generator-yield",
        fn: "Generators (function*)",
        desc: "Create pausable functions that yield values one at a time.",
        category: "Advanced Functions",
        subtitle: "Lazy evaluation with yield keyword",
        signature: "function* generatorName() { yield value; ... }",
        descLong: "Generators are functions that pause via yield and resume later. Perfect for lazy evaluation, infinite sequences, and iterating large datasets without loading all into memory.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generators (function*) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: a generator that yields values one at a time.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: create a pausable function that yields values\nfunction* countToN(n) {\n  for (let i = 1; i <= n; i++) {\n    yield i;\n  }\n}\nconst counter = countToN(3);\ncounter.next(); // { value: 1, done: false }\ncounter.next(); // { value: 2, done: false }\ncounter.next(); // { value: 3, done: false }\ncounter.next(); // { value: undefined, done: true }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generators (function*) — common patterns you'll see in production.\n// APPROACH  - Combine Generators (function*) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: for...of iteration, infinite\n//             sequences, and two-way communication with .next(val).\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like async\n//             generators, error handling, or production patterns.\n//\n// GOAL: use generators for lazy evaluation and infinite sequences\n// WHY: generators work with for...of — values are pulled on demand\nfor (const num of countToN(5)) {\n  console.log(num); // 1, 2, 3, 4, 5\n}\n// WHY: infinite sequences — evaluate only as needed\nfunction* fibonacci() {\n  let [a, b] = [0, 1];\n  while (true) {\n    yield a;\n    [a, b] = [b, a + b];\n  }\n}\nconst fib = fibonacci();\nfib.next().value; // 0\nfib.next().value; // 1\nfib.next().value; // 1\nfib.next().value; // 2\n// WHY: two-way communication — .next(val) sends value back into generator\nfunction* doubleEach() {\n  const x = yield 'waiting for input';\n  const y = yield x * 2;\n  return y;\n}\nconst gen = doubleEach();\ngen.next();      // { value: 'waiting for input', done: false }\ngen.next(5);     // { value: 10, done: false } (sends 5, yields 5*2)\ngen.next(20);    // { value: 20, done: true }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generators (function*) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: async generators, yield*\n//             delegation, error propagation, and practical use cases.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with async patterns; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use generators for production patterns\n// WHY: async generator — yield + await for streaming data\nasync function* fetchPages(urls) {\n  for (const url of urls) {\n    const res = await fetch(url);\n    yield await res.json();\n  }\n}\n// WHY: yield* delegates to another generator or iterable\nfunction* flatten(arrays) {\n  for (const arr of arrays) {\n    yield* arr; // delegates to array's iterator\n  }\n}\n[...flatten([[1, 2], [3, 4]])]; // [1, 2, 3, 4]\n// WHY: generator.throw() and generator.return() for control\nfunction* controlled() {\n  try { yield 1; yield 2; }\n  catch (e) { console.log('caught:', e); }\n}\nconst c = controlled();\nc.next();          // { value: 1, done: false }\nc.throw('oops');   // \"caught: oops\", { value: undefined, done: true }\n// NOTE: generators are lazy — values are computed only when .next() is called\n// NOTE: spread [...gen] or Array.from(gen) materializes the entire generator\n//\n// Decision rule:\n//   lazy sequence (compute on demand)               -> generator function*\n//   infinite sequence (fibonacci, random)            -> generator function*\n//   streaming / paginated data                       -> async generator function*\n//   delegate to sub-iterator                         -> yield* otherGen\n//   two-way communication with iterator              -> .next(val) into generator\n//   materialize all values at once                   -> [...gen] or Array.from(gen)\n//\n// Anti-pattern: calling a generator as a normal function.\n//   myGenerator() returns an iterator, it doesn't execute the body.\n//   You must call .next() or use for...of to consume values."
                  }
        ],
        tips: [
                  "yield pauses execution. call .next() to resume and get next value",
                  "Perfect for infinite sequences (fibonacci, random stream) — evaluate only as needed",
                  "Works with for...of, spread operator: [...gen], Array.from(gen)",
                  "Generator functions are not auto-executed — call them to get iterator"
        ],
        mistake: "Calling generator as normal function. Must call it to get iterator: const gen = myGenerator(); then use gen.next().",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "custom-errors",
        fn: "Custom Error Classes",
        desc: "Extend Error to create typed, catchable error hierarchies with custom properties for structured error handling.",
        category: "Prototypes & Modern Features",
        subtitle: "Structured error types",
        signature: "class MyError extends Error { constructor(msg) { super(msg); this.name = \"MyError\" } }",
        descLong: "Custom error classes extend the built-in Error and carry domain-specific data (status codes, field names, retry info). Use instanceof to catch specific error types. Always set this.name for clean stack traces. Common patterns: HttpError with status, ValidationError with fields, NotFoundError with resource. Error.cause (ES2022) chains errors for root-cause tracking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Error Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: extend Error with a custom name.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: create a custom error type for better error handling\nclass ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = 'ValidationError';\n  }\n}\nthrow new ValidationError('Email is required');"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Error Classes — common patterns you'll see in production.\n// APPROACH  - Combine Custom Error Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: custom properties,\n//             instanceof checks, and error hierarchies.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like Error.cause\n//             chaining or production error handling strategies.\n//\n// GOAL: build typed errors with domain-specific data\n// WHY: custom properties carry context (status codes, field names)\nclass HttpError extends Error {\n  constructor(status, message) {\n    super(message);\n    this.name = 'HttpError';\n    this.status = status;\n  }\n}\nclass ValidationError extends Error {\n  constructor(fields) {\n    super('Validation failed');\n    this.name = 'ValidationError';\n    this.fields = fields;\n  }\n}\n// WHY: instanceof distinguishes error types in catch blocks\ntry {\n  throw new HttpError(404, 'User not found');\n} catch (err) {\n  if (err instanceof HttpError) {\n    console.log(`HTTP ${err.status}: ${err.message}`);\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Error Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: Error.cause chaining,\n//             error hierarchies, and structured error handling.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with monitoring; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: build a production-grade error hierarchy\n// WHY: base AppError with status code and cause chaining\nclass AppError extends Error {\n  constructor(message, statusCode, options) {\n    super(message, options); // options.cause for chaining (ES2022)\n    this.name = 'AppError';\n    this.statusCode = statusCode;\n  }\n}\n// WHY: specialized subclasses for specific error types\nclass NotFoundError extends AppError {\n  constructor(resource) {\n    super(`${resource} not found`, 404);\n    this.name = 'NotFoundError';\n  }\n}\nclass UnauthorizedError extends AppError {\n  constructor(message = 'Unauthorized') {\n    super(message, 401);\n    this.name = 'UnauthorizedError';\n  }\n}\n// WHY: Error.cause chains root causes for debugging\ntry {\n  JSON.parse(invalidInput);\n} catch (parseErr) {\n  throw new AppError('Failed to parse request', 400, { cause: parseErr });\n}\n// NOTE: always set this.name for clean stack traces\n// NOTE: use error hierarchies for HTTP APIs — status codes map to error types\n//\n// Decision rule:\n//   simple domain error                              -> extend Error, set this.name\n//   HTTP API error with status code                  -> AppError subclass with statusCode\n//   validation error with field-level details        -> ValidationError with fields object\n//   chain root cause                                 -> Error.cause in options (ES2022)\n//   distinguish error types in catch                 -> instanceof checks\n//\n// Anti-pattern: throwing plain Error with string messages.\n//   throw new Error('User not found') — can't distinguish from other errors.\n//   Use custom error classes with instanceof for typed error handling."
                  }
        ],
        tips: [
                  "Always set this.name — stack traces use it instead of generic \"Error\".",
                  "Use Error.cause (ES2022) to chain the original error for debugging.",
                  "instanceof checks the prototype chain — catches parent classes too.",
                  "Avoid catching and swallowing errors silently — always log or rethrow."
        ],
        mistake: "Throwing plain strings (throw \"bad\") instead of Error objects — strings have no stack trace, no name, and cannot be caught by type.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "web-workers",
        fn: "Web Workers",
        desc: "Run JavaScript in background threads to keep the main thread responsive for UI.",
        category: "Prototypes & Modern Features",
        subtitle: "Background thread execution",
        signature: "const worker = new Worker(\"worker.js\")  |  worker.postMessage(data)",
        descLong: "Web Workers run scripts in a separate thread with their own global scope (no access to DOM, window, or document). Communication is via postMessage/onmessage with structured cloning. Use for CPU-intensive tasks: parsing large datasets, image processing, encryption, or complex calculations. SharedWorker shares one worker across tabs. Transferable objects (ArrayBuffer) move data without copying.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Web Workers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: create a worker and send/receive messages.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: run code in a background thread\n// main.js\nconst worker = new Worker('worker.js');\nworker.postMessage([3, 1, 2]);\nworker.onmessage = (event) => console.log('Result:', event.data);\n// worker.js\nself.onmessage = (event) => {\n  const sorted = event.data.sort((a, b) => a - b);\n  self.postMessage(sorted);\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Web Workers — common patterns you'll see in production.\n// APPROACH  - Combine Web Workers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: typed messages, error handling,\n//             transferable objects, and inline workers.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like SharedWorker,\n//             worker pools, or production patterns.\n//\n// GOAL: use workers for CPU-intensive tasks with proper error handling\n// WHY: typed messages with type field for routing\nworker.postMessage({ type: 'sort', data: hugeArray });\nworker.onmessage = (event) => {\n  const { type, result } = event.data;\n  if (type === 'sorted') renderTable(result);\n};\n// WHY: onerror for worker crash handling\nworker.onerror = (err) => console.error('Worker error:', err.message);\n// WHY: transferable objects — zero-copy for large data\nconst buffer = new ArrayBuffer(1024 * 1024);\nworker.postMessage({ buffer }, [buffer]);\n// buffer.byteLength is now 0 — ownership transferred\n// WHY: inline worker via Blob URL — no separate file needed\nconst blob = new Blob([`\n  self.onmessage = (e) => { self.postMessage(e.data.map(x => x * 2)); };\n`], { type: 'application/javascript' });\nconst inlineWorker = new Worker(URL.createObjectURL(blob));\n// WHY: terminate when done\nworker.terminate();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Web Workers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: worker pools, SharedWorker,\n//             importScripts, and structured clone limitations.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with build tools; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use workers in production with proper patterns\n// WHY: importScripts for loading dependencies in workers\n// self.importScripts('lib.js', 'utils.js');\n// WHY: SharedWorker — one worker shared across multiple tabs\n// const shared = new SharedWorker('shared.js');\n// shared.port.postMessage(data);\n// shared.port.onmessage = (e) => console.log(e.data);\n// WHY: worker pool pattern — limit concurrency\nclass WorkerPool {\n  constructor(url, size = navigator.hardwareConcurrency || 4) {\n    this.workers = Array.from({ length: size }, () => new Worker(url));\n    this.queue = [];\n  }\n  run(data) {\n    const worker = this.workers.pop() || this.workers[0];\n    return new Promise(resolve => {\n      worker.onmessage = (e) => { this.workers.push(worker); resolve(e.data); };\n      worker.postMessage(data);\n    });\n  }\n}\n// NOTE: structured clone can't transfer functions, DOM nodes, or errors\n// NOTE: use Comlink library for RPC-style worker communication\n// NOTE: Vite/Webpack handle worker bundling with new Worker(new URL('./w.js', import.meta.url))\n//\n// Decision rule:\n//   CPU-intensive task (sorting, parsing, crypto)    -> Web Worker\n//   keep main thread responsive for UI               -> Web Worker\n//   large data transfer (zero-copy)                  -> Transferable objects\n//   one worker shared across tabs                    -> SharedWorker\n//   limit concurrent workers                         -> Worker pool pattern\n//   RPC-style communication                          -> Comlink library\n//   service worker (offline, caching, push)          -> Service Worker (different API)\n//\n// Anti-pattern: accessing DOM or window inside a worker.\n//   Workers have no DOM, window, or document. Use self for the global scope\n//   and importScripts() for loading dependencies."
                  }
        ],
        tips: [
                  "Workers have no DOM access — they can only compute and return results.",
                  "Use Transferable objects (ArrayBuffer) for large data to avoid copying overhead.",
                  "Terminate workers when done: worker.terminate() frees the thread.",
                  "SharedWorker allows multiple tabs to share one worker instance."
        ],
        mistake: "Sending large objects via postMessage without transferring — structured cloning copies all data. Use transferable ArrayBuffers for large binary data.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "indexeddb",
        fn: "IndexedDB",
        desc: "Client-side NoSQL database for storing large structured data with indexes and transactions.",
        category: "Prototypes & Modern Features",
        subtitle: "Browser-native structured storage",
        signature: "indexedDB.open(name, version) → request.onsuccess",
        descLong: "IndexedDB is a transactional, asynchronous key-value store in the browser. It stores structured data (objects, files, blobs) with optional indexes for fast queries. Capacity is much larger than localStorage (~50MB+ vs 5MB). Uses object stores (like tables), transactions for data integrity, and cursors for iteration. The API is event-based but easily wrapped with Promises or libraries like idb.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of IndexedDB — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - show the simplest: open a database and create a store.\n// STRENGTHS - fastest to read; teaches the core idea without distraction;\n//             matches what you'd type into a REPL or a quick script.\n// WEAKNESSES- relies on default behavior that may not fit real inputs;\n//             skips edge cases, validation, and any production concerns.\n//\n// GOAL: open an IndexedDB database and create an object store\nconst request = indexedDB.open('MyApp', 1);\nrequest.onupgradeneeded = (event) => {\n  const db = event.target.result;\n  db.createObjectStore('users', { keyPath: 'id' });\n};\nrequest.onsuccess = (event) => {\n  const db = event.target.result;\n  console.log('Database opened:', db.name);\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of IndexedDB — common patterns you'll see in production.\n// APPROACH  - Combine IndexedDB with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - layer in the common patterns: CRUD operations, indexes,\n//             transactions, and the idb library wrapper.\n// STRENGTHS - covers the 80% case for real projects; teaches the patterns you'll\n//             meet in code reviews; balances clarity with practical control.\n// WEAKNESSES- still trusts inputs and skips deeper concerns like schema\n//             migrations, cursor iteration, or production patterns.\n//\n// GOAL: perform CRUD operations with transactions and indexes\n// WHY: onupgradeneeded for schema creation — runs only on version bumps\nrequest.onupgradeneeded = (event) => {\n  const db = event.target.result;\n  const store = db.createObjectStore('users', { keyPath: 'id' });\n  store.createIndex('email', 'email', { unique: true });\n};\n// WHY: transactions group operations — readwrite for writes\nrequest.onsuccess = (event) => {\n  const db = event.target.result;\n  // Write\n  const tx = db.transaction('users', 'readwrite');\n  tx.objectStore('users').put({ id: '1', name: 'Alice', email: 'alice@example.com' });\n  // Read by key\n  db.transaction('users').objectStore('users').get('1').onsuccess = (e) => {\n    console.log(e.target.result);\n  };\n  // Query by index\n  const idx = db.transaction('users').objectStore('users').index('email');\n  idx.get('alice@example.com').onsuccess = (e) => console.log(e.target.result);\n};\n// WHY: idb library wraps IndexedDB with Promises (recommended)\nimport { openDB } from 'idb';\nconst db = await openDB('MyApp', 1, {\n  upgrade(db) { db.createObjectStore('users', { keyPath: 'id' }); },\n});\nawait db.put('users', { id: '1', name: 'Alice' });\nconst user = await db.get('users', '1');"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of IndexedDB — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - address production concerns: schema migrations, cursor\n//             iteration, error handling, and localStorage vs IndexedDB.\n// STRENGTHS - safe to ship; handles edge cases and failure modes; integrates\n//             with production patterns; communicates engineering intent.\n// WEAKNESSES- more verbose and harder to scan; can over-engineer simple tasks;\n//             assumes a system context that may not exist yet.\n//\n// GOAL: use IndexedDB in production with proper patterns\n// WHY: schema migration — check oldVersion to migrate existing data\nrequest.onupgradeneeded = (event) => {\n  const db = event.target.result;\n  const oldVersion = event.oldVersion;\n  if (oldVersion < 1) {\n    db.createObjectStore('users', { keyPath: 'id' });\n  }\n  if (oldVersion < 2) {\n    db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });\n  }\n};\n// WHY: cursor iteration for range queries and pagination\nfunction getAllUsers(db) {\n  return new Promise((resolve) => {\n    const tx = db.transaction('users');\n    const store = tx.objectStore('users');\n    const users = [];\n    store.openCursor().onsuccess = (e) => {\n      const cursor = e.target.result;\n      if (cursor) { users.push(cursor.value); cursor.continue(); }\n      else resolve(users);\n    };\n  });\n}\n// NOTE: IndexedDB capacity is ~50MB+ (vs localStorage ~5MB)\n// NOTE: IndexedDB is async — never blocks the main thread\n// NOTE: transactions auto-commit when all requests complete\n//\n// Decision rule:\n//   simple key-value (small data)                   -> localStorage\n//   structured data with queries                    -> IndexedDB\n//   large binary data (files, blobs)                -> IndexedDB\n//   offline-first app data                          -> IndexedDB + service worker\n//   Promise-based wrapper                           -> idb library\n//   SQL-like queries                                -> consider Dexie.js or Lovefield\n//\n// Anti-pattern: using localStorage for large datasets.\n//   localStorage is synchronous (blocks UI), limited to ~5MB, and stores\n//   only strings. Use IndexedDB for structured data, large datasets,\n//   or anything requiring indexes and queries."
                  }
        ],
        tips: [
                  "Use the idb library for a Promise-based wrapper — raw IndexedDB is verbose.",
                  "Always version your schema — onupgradeneeded runs only on version bumps.",
                  "Transactions auto-commit when all requests complete — no explicit commit needed.",
                  "IndexedDB is async and non-blocking — it never freezes the UI."
        ],
        mistake: "Using localStorage for large datasets — it is synchronous, blocks the main thread, limited to ~5MB, and can only store strings. Use IndexedDB for anything beyond simple key-value pairs.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
