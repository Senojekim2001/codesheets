export const meta = {
  "title": "Regex",
  "domain": "javascript",
  "sheet": "regex",
  "icon": "🔍"
}

export const sections = [

  // ── Section 1: Creating & Testing ─────────────────────────────────────────
  {
    id: "basics",
    title: "Creating & Testing",
    entries: [
      {
        id: "regex-literal",
        fn: "Regex literals & .test()",
        desc: "Create regex inline; .test() returns boolean",
        category: "Basics",
        subtitle: "/pattern/flags",
        signature: "/pattern/flags  |  new RegExp(str, flags)",
        descLong: "Regex literals (/pattern/) are compiled at parse time. RegExp constructor takes a string (escape backslashes). .test() returns true/false. .exec() returns match array or null.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Regex literals & .test() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest regex: test if a string matches a pattern.\n// STRENGTHS - three lines; shows regex literal + .test().\n// WEAKNESSES- no groups, no dynamic patterns, no flags explanation.\n//\n// GOAL: test if a string matches a pattern\nconst emailRe = /^[\\w.+-]+@[\\w-]+\\.[\\w.]+$/i;\nemailRe.test('user@example.com');  // true\nemailRe.test('not-an-email');      // false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Regex literals & .test() — common patterns you'll see in production.\n// APPROACH  - Combine Regex literals & .test() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - regex recipes: literals for static patterns, RegExp constructor\n//             for dynamic patterns from variables.\n// STRENGTHS - covers the 80% case: literal vs constructor, escape note.\n// WEAKNESSES- no escapeRegex helper; no performance comparison.\n//\n// GOAL: use regex literals for static patterns, constructor for dynamic ones\n// WHY: regex literals are compiled at parse time — better performance\nconst emailRe = /^[\\w.+-]+@[\\w-]+\\.[\\w.]+$/i;\nemailRe.test('user@example.com');  // true\n// WHY: RegExp constructor for dynamic patterns from variables\nconst word = 'hello';\nconst re = new RegExp(`\\\\b${word}\\\\b`, 'gi');\nre.test('Say hello there');  // true\n// NOTE: escape backslashes in constructor strings — \\\\b becomes \\b"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Regex literals & .test() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production regex creation: cached literals, escapeRegex helper,\n//             constructor for dynamic patterns, .test() vs .exec() choice.\n// STRENGTHS - escapeRegex prevents injection; cached literals avoid recompilation;\n//             clear decision framework.\n// WEAKNESSES- escapeRegex is not complete for all edge cases.\n//\n// GOAL: choose the right regex creation method for production\n// WHY: regex literal — compiled once at parse time, best for static patterns\nconst EMAIL_RE = /^[\\w.+-]+@[\\w-]+\\.[\\w.]+$/i;\n// WHY: RegExp constructor — for patterns built from user input or variables\nfunction createWordBoundary(word) {\n  return new RegExp(`\\\\b${escapeRegex(word)}\\\\b`, 'gi');\n}\n// WHY: escape regex special chars when building from user input\nfunction escapeRegex(str) {\n  return str.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');\n}\n// NOTE: .test() is faster than .exec() when you only need true/false\n// NOTE: cached regex literals at module scope avoid recompilation\n//\n// Decision rule:\n//   static pattern (known at dev time)              -> regex literal /pattern/flags\n//   dynamic pattern (built from variables)          -> new RegExp(str, flags)\n//   user input in pattern                           -> escapeRegex() first\n//   only need boolean match result                  -> .test()\n//   need match details (groups, index)              -> .exec() or .match()\n//\n// Anti-pattern: forgetting to escape backslashes in RegExp constructor.\n//   new RegExp('\\bword\\b') creates /bwordb/ — the \\b is consumed by the string.\n//   Use new RegExp('\\\\bword\\\\b') to get /\\bword\\b/."
                  }
        ],
        tips: [
                  "Use regex literals for static patterns (better performance)",
                  "Use RegExp constructor for dynamic patterns built from variables",
                  ".test() is faster than .exec() when you only need true/false"
        ],
        mistake: "Forgetting to escape backslashes in RegExp constructor strings — \\\\b becomes \\b in the actual pattern",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "regex-exec",
        fn: ".exec() method",
        desc: "Returns match array with index, input, groups; null if no match",
        category: "Basics",
        subtitle: "regex.exec(str)",
        signature: "regex.exec(str) → [match, group1, group2, ...] | null",
        descLong: ".exec() returns the first match as an array where [0] is the full match, [1+] are capture groups, and properties: index (position), input (string), groups (named captures). Returns null if no match. With /g flag, each call advances lastIndex.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .exec() method — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest .exec(): extract capture groups from a match.\n// STRENGTHS - five lines; shows .exec() with groups.\n// WEAKNESSES- no /g iteration, no index property, no null check.\n//\n// GOAL: extract capture groups from a match\nconst re = /(\\w+)@([\\w.]+)/;\nconst match = re.exec('contact: user@example.com');\nmatch[0];  // 'user@example.com' (full match)\nmatch[1];  // 'user' (first group)\nmatch[2];  // 'example.com' (second group)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .exec() method — common patterns you'll see in production.\n// APPROACH  - Combine .exec() method with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - .exec() recipes: capture groups, match position, /g iteration.\n// STRENGTHS - covers the 80% case: groups, index, while loop with /g.\n// WEAKNESSES- no lastIndex reset; no .matchAll() comparison.\n//\n// GOAL: use .exec() for capture groups and match position\n// WHY: .exec() returns groups, index, and input properties\nconst re = /(\\w+)@([\\w.]+)/;\nconst match = re.exec('contact: user@example.com');\nmatch[0];     // 'user@example.com'\nmatch[1];     // 'user'\nmatch[2];     // 'example.com'\nmatch.index;  // 9 (position in string)\n// WHY: with /g flag, .exec() advances lastIndex for iteration\nconst globalRe = /(\\d+)/g;\nlet m;\nwhile ((m = globalRe.exec('10 20 30')) !== null) {\n  console.log(m[1]);  // 10, 20, 30\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .exec() method — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production .exec() patterns: safe destructure with fallback,\n//             lastIndex reset, .matchAll() comparison, and a tokenizer\n//             using /y sticky flag.\n// STRENGTHS - safe destructure handles null; lastIndex reset prevents bugs;\n//             .matchAll() is stateless alternative; tokenizer shows /y usage.\n// WEAKNESSES- .exec() with /g is stateful and error-prone; prefer .matchAll().\n//\n// GOAL: use .exec() correctly in production loops\n// WHY: .exec() with /g is stateful — lastIndex persists between calls\n// Safe destructure with fallback for no match\nconst [, user, domain] = /(\\w+)@(\\w+)/.exec('john@example.com') || [];\n// user='john', domain='example.com' — safe even if no match\n// Reset lastIndex before reusing /g regex in a new loop\nconst globalRe = /(\\d+)/g;\nglobalRe.lastIndex = 0; // reset before reuse\nlet m;\nwhile ((m = globalRe.exec('10 20 30')) !== null) {\n  console.log(m[1]); // 10, 20, 30\n}\n// Stateless alternative: .matchAll() (no lastIndex to manage)\nfor (const match of '10 20 30'.matchAll(/(\\d+)/g)) {\n  console.log(match[1]); // 10, 20, 30\n}\n// Tokenizer using /y sticky flag — match only at exact position\nfunction tokenize(input) {\n  const tokens = [];\n  const ws = /\\s+/y;\n  const num = /\\d+/y;\n  const id = /[a-zA-Z_]+/y;\n  let pos = 0;\n  while (pos < input.length) {\n    ws.lastIndex = pos;\n    if (ws.exec(input)) { pos = ws.lastIndex; continue; }\n    for (const [type, re] of [['num', num], ['id', id]]) {\n      re.lastIndex = pos;\n      const m = re.exec(input);\n      if (m) { tokens.push({ type, value: m[0] }); pos = re.lastIndex; break; }\n    }\n    if (pos < input.length) throw new Error('Unexpected char at ' + pos);\n  }\n  return tokens;\n}\ntokenize('hello 42 world');\n// [{type:'id',value:'hello'},{type:'num',value:'42'},{type:'id',value:'world'}]\n// Decision rule:\n//   need capture groups + match position            -> .exec()\n//   iterate all matches with groups                 -> .matchAll() (stateless)\n//   iterate with /g and need lastIndex control      -> .exec() loop\n//   only need boolean result                        -> .test()\n//   tokenizer / strict position matching            -> /y sticky flag (above)\n//\n// Anti-pattern: reusing /g regex in multiple loops without resetting lastIndex;\n//   using .exec() when .matchAll() is simpler and stateless."
                  }
        ],
        tips: [
                  "Use .exec() when you need capture groups or match position",
                  ".exec() with /g flag has stateful lastIndex — reset by reassigning or creating new regex",
                  "For multiple matches without state, use .matchAll() instead"
        ],
        mistake: "Assuming .exec() returns same object each call — it returns new array each time, but regex object's lastIndex changes with /g flag",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "regex-flags",
        fn: "Regex flags",
        desc: "g=global, i=case-insensitive, m=multiline, s=dotall, u=unicode, v=unicodeSets",
        category: "Basics",
        subtitle: "/pattern/flags",
        signature: "/pattern/[gimsuv]+ or RegExp(str, flags)",
        descLong: "Flags modify regex behavior: g=all matches, i=ignore case, m=^ $ match line boundaries, s=. includes newline, u=unicode mode, v=unicode sets & properties. Flags can be combined. Without /g, methods return only first match.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Regex flags — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest flags demo: /i, /s, /u in three lines.\n// STRENGTHS - shows case-insensitive, dotall, and unicode in one snippet.\n// WEAKNESSES- no /g, /m, /v; no combined flags.\n//\n// GOAL: understand what each flag does\n/hello/i.test('HELLO');  // true — case-insensitive\n/a.b/s.test('a\\nb');     // true — dot matches newline\n/\\p{Emoji}/u.test('😀');  // true — unicode mode"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Regex flags — common patterns you'll see in production.\n// APPROACH  - Combine Regex flags with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - flag recipes: /gm for line-by-line, /i for classes, /u for\n//             unicode property escapes.\n// STRENGTHS - covers the 80% case: combined flags, /m, /i, /u.\n// WEAKNESSES- no /s, /v; no flag interaction gotchas.\n//\n// GOAL: combine flags for common tasks\n// WHY: /g for all matches, /m for line-by-line\nconst text = 'start\\nline2\\nend';\ntext.match(/^.+$/gm);  // ['start', 'line2', 'end']\n// WHY: /i applies to character classes too\n/[a-z]+/i.test('HELLO');  // true\n// WHY: /u enables \\p{} unicode property escapes\n/\\p{Script=Greek}/u.test('Λ');  // true"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Regex flags — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production flag usage: a flag reference table, /g + .exec()\n//             gotcha, /v unicode sets, and flag inspection.\n// STRENGTHS - comprehensive flag reference; /g statefulness warning;\n//             /v for set operations; regex.flags inspection.\n// WEAKNESSES- /v is not universally supported yet; /y not covered here.\n//\n// GOAL: know flag interactions and gotchas in production\n// WHY: /g changes .exec() behavior — lastIndex persists\n// Flag reference table:\n//   g  global       — all matches (not just first)\n//   i  ignoreCase   — case-insensitive matching\n//   m  multiline    — ^ $ match line boundaries\n//   s  dotAll       — . matches newline\n//   u  unicode      — \\p{} property escapes, code point semantics\n//   v  unicodeSets  — /v supersedes /u: set operations + string properties\n//   y  sticky       — match only at lastIndex position\n// /g + .exec() statefulness gotcha\nconst re = /\\d+/g;\nre.exec('10 20 30')[0]; // '10'\nre.exec('10 20 30')[0]; // '20' (lastIndex advanced!)\nre.exec('10 20 30');     // null (lastIndex at end)\nre.lastIndex = 0;       // reset for reuse\n// /v unicode sets — set operations in character classes\nconst letters = /[\\p{Letter}&&\\p{ASCII}]/v;  // letters that are also ASCII\nconst emoji = /[\\p{Emoji}--\\p{Number}]/v;  // emojis excluding number symbols\n// Inspect flags at runtime\nconst pattern = /hello/gimsu;\npattern.flags; // 'gimsu'\n// Decision rule:\n//   replace all occurrences                          -> /g\n//   case-insensitive matching                        -> /i\n//   ^ $ match per-line                               -> /m\n//   . match newline                                  -> /s\n//   unicode property escapes                         -> /u\n//   unicode sets & string properties                 -> /v\n//   strict position matching (tokenizer)             -> /y\n//\n// Anti-pattern: using /g with .match() then expecting .lastIndex to reset;\n//   using /u when /v is available (broader set operations); combining /m\n//   without /g when you need all line matches."
                  }
        ],
        tips: [
                  "/g flag enables .matchAll(), changes .exec() behavior, and needed for .replace() to replace all",
                  "/i applies to both pattern and character classes (affects [a-z])",
                  "/m changes ^ $ to match line starts/ends, not just string boundaries"
        ],
        mistake: "Using /g flag with .match() then expecting .lastIndex to reset between calls — create new regex or use .matchAll()",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: String Methods ─────────────────────────────────────────
  {
    id: "string-methods",
    title: "String Methods",
    entries: [
      {
        id: "str-match",
        fn: "str.match() vs str.matchAll()",
        desc: "match() returns array or null; matchAll() returns iterator of all matches",
        category: "String Methods",
        subtitle: "str.match(regex) | str.matchAll(regex)",
        signature: "str.match(regex) → [match, ...] | null  |  str.matchAll(regex) → Iterator<match>",
        descLong: ".match() returns all matches if /g flag used, else first match only. Returns null if no match. .matchAll() always returns an iterator (loop with for...of), requires /g flag, and includes capture groups in each iteration. matchAll() is stateless.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of str.match() vs str.matchAll() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest .match(): get all matches from a string.\n// STRENGTHS - two lines; shows .match() with /g flag.\n// WEAKNESSES- no groups, no .matchAll(), no null check.\n//\n// GOAL: get all matches from a string\nconst str = 'cat dog cat bird cat';\nstr.match(/\\b\\w{3}\\b/g);  // ['cat', 'dog', 'cat', 'cat']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of str.match() vs str.matchAll() — common patterns you'll see in production.\n// APPROACH  - Combine str.match() vs str.matchAll() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - .match() recipes: with/without /g, .matchAll() for groups.\n// STRENGTHS - covers the 80% case: /g vs no-/g, .matchAll() iterator.\n// WEAKNESSES- no null handling; no Array.from on matchAll.\n//\n// GOAL: use .match() with and without /g, and .matchAll() for groups\n// WHY: .match() with /g returns all matches as strings\n'cat dog cat'.match(/\\b\\w{3}\\b/g);  // ['cat', 'dog', 'cat']\n// WHY: .match() without /g returns first match with details\n'cat dog cat'.match(/\\b\\w{3}\\b/);  // ['cat', index: 0, ...]\n// WHY: .matchAll() returns iterator with capture groups (requires /g)\nconst re = /(\\w{3})\\s(\\w{3})/g;\nfor (const m of 'cat dog cat bird'.matchAll(re)) {\n  console.log(m[1], m[2]);  // 'cat' 'dog', 'cat' 'bird'\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of str.match() vs str.matchAll() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production match patterns: null-safe extraction, .matchAll()\n//             with named groups, and converting iterator to array.\n// STRENGTHS - null-safe with ??; named groups in matchAll; Array.from for\n//             materializing matchAll results.\n// WEAKNESSES- .matchAll() requires /g; materializing large results uses memory.\n//\n// GOAL: choose the right match method for production\n// WHY: .match() returns null on no match — check with ?? or !== null\n// Null-safe extraction with .match()\nconst email = 'Contact: john@example.com'.match(/(?<user>\\w+)@(?<domain>[\\w.]+)/);\nconst { user, domain } = email?.groups ?? {};\n// user='john', domain='example.com'\n// .matchAll() with named groups — extract all key=value pairs\nconst input = 'name=Alice age=30 city=NYC';\nconst pairs = [...input.matchAll(/(?<key>\\w+)=(?<value>\\w+)/g)]\n  .map(m => [m.groups.key, m.groups.value]);\n// [['name','Alice'], ['age','30'], ['city','NYC']]\nconst config = Object.fromEntries(pairs);\n// { name: 'Alice', age: '30', city: 'NYC' }\n// .match() with /g returns null on no match — use ?? [] for safety\nconst numbers = 'no digits here'.match(/\\d+/g) ?? [];\n// [] (not null)\n// Decision rule:\n//   all matches as strings (no groups needed)        -> .match(/pattern/g)\n//   first match with groups, index, input            -> .match(/pattern/) or .exec()\n//   iterate all matches with capture groups          -> .matchAll(/pattern/g)\n//   only need boolean result                         -> .test()\n//   null-safe extraction                             -> ?? fallback (above)\n//   materialize matchAll into array                  -> [...str.matchAll(re)] (above)\n//\n// Anti-pattern: using .match() without /g expecting all matches; not checking\n//   for null before accessing .groups; using .exec() loop when .matchAll()\n//   is simpler and stateless."
                  }
        ],
        tips: [
                  ".match() returns null on no match, not empty array — check with !== null",
                  ".matchAll() requires /g flag; without it throws TypeError",
                  ".matchAll() is stateless — safe to call in loops without index reset"
        ],
        mistake: "Using .match() without /g and trying to access all matches — only gets first; use /g flag or .matchAll()",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "str-replace",
        fn: "str.replace() with regex & captures",
        desc: "Replace with regex; capture refs $1, $2; callback for dynamic replacements",
        category: "String Methods",
        subtitle: "str.replace(regex, replacement) | str.replaceAll(regex, replacement)",
        signature: "str.replace(regex, str|fn) → str  |  str.replaceAll(regex, str|fn) → str",
        descLong: ".replace() replaces first match; use /g flag for all. Replacement can be string with $& (full match), $1-$9 (captures), or function called per match. .replaceAll() always replaces all (requires /g or string pattern). Callback receives (match, p1, p2, ..., offset, string, groups).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of str.replace() with regex & captures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest .replace(): swap words with capture references.\n// STRENGTHS - one line; shows $1, $2 in replacement string.\n// WEAKNESSES- no /g, no callback, no named groups.\n//\n// GOAL: swap words with capture references\n'hello world'.replace(/(\\w+)\\s(\\w+)/, '$2 $1');  // 'world hello'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of str.replace() with regex & captures — common patterns you'll see in production.\n// APPROACH  - Combine str.replace() with regex & captures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - .replace() recipes: capture refs with /g, callback for dynamic\n//             replacements, named groups in callback.\n// STRENGTHS - covers the 80% case: $1/$2, callback, named groups.\n// WEAKNESSES- no .replaceAll(); no $& / $<name> in string replacement.\n//\n// GOAL: use capture references and callbacks for replacements\n// WHY: $1, $2 reference capture groups in replacement string\n'John Smith, Jane Doe'.replace(/(\\w+)\\s(\\w+)/g, '$2, $1');\n// 'Smith, John, Doe, Jane'\n// WHY: callback for dynamic replacements\n'hello world'.replace(/(\\w+)/g, (match) => match.toUpperCase());\n// 'HELLO WORLD'\n// WHY: callback receives groups object for named captures\n'user@example.com'.replace(\n  /(?<name>\\w+)@(?<domain>[\\w.]+)/,\n  (match, p1, p2, offset, string, groups) => `${groups.name}@***`\n);  // 'user@***'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of str.replace() with regex & captures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production .replace() patterns: .replaceAll(), $<name> syntax,\n//             $& / $` / $' special patterns, and a mini template engine.\n// STRENGTHS - .replaceAll() for explicit intent; $<name> for readable refs;\n//             callback with offset for position-aware replacements.\n// WEAKNESSES- callback adds overhead for simple replacements.\n//\n// GOAL: production .replace() with all replacement patterns\n// WHY: /g flag needed to replace all occurrences; .replaceAll() is explicit\n// .replaceAll() — explicit intent to replace all (requires /g or string)\n'a-b-c'.replaceAll('-', '_');  // 'a_b_c'\n'a-b-c'.replaceAll(/-/g, '_'); // 'a_b_c' (regex needs /g)\n// $<name> references named groups in replacement string\n'2024-03-23'.replace(\n  /(?<year>d{4})-(?<month>d{2})-(?<day>d{2})/,\n  '$<day>/$<month>/$<year>'\n);  // '23/03/2024'\n// Special replacement patterns:\n//   $&  = full match      $` = before match      $' = after match\n'hello'.replace(/l/, '[$&]');    // 'he[l]lo'\n// Mini template engine using callback + named groups\nfunction template(str, vars) {\n  return str.replace(/${(?<name>w+)}/g, (match, _, __, ___, ____, groups) =>\n    vars[groups.name] ?? match\n  );\n}\ntemplate('Hello ${name}, you are ${age}', { name: 'Alice', age: '30' });\n// 'Hello Alice, you are 30'\n// Decision rule:\n//   replace first occurrence only                    -> .replace(regex, str|fn)\n//   replace all occurrences                          -> .replace(/pattern/g, str|fn)\n//   replace all (explicit intent)                    -> .replaceAll(regex, str|fn)\n//   dynamic replacement logic                        -> callback function\n//   named group in replacement                       -> $<name> in string\n//   template interpolation                           -> callback + named groups (above)\n//\n// Anti-pattern: forgetting /g flag when intending to replace all; using\n//   .replace() when .replaceAll() expresses intent more clearly; using string\n//   replacement when callback is needed for dynamic logic."
                  }
        ],
        tips: [
                  "Use /g flag to replace all occurrences, not just first",
                  "In replacement string, $& = full match, $` = before, $' = after",
                  "Callback function gives access to groups object for named captures"
        ],
        mistake: "Forgetting /g flag when intending to replace all — .replace() without /g only replaces first",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "str-split",
        fn: "str.split() with regex",
        desc: "Split string on regex pattern; captures become array elements",
        category: "String Methods",
        subtitle: "str.split(regex|str, limit?)",
        signature: "str.split(regex, limit?) → [parts...]",
        descLong: ".split() divides string by separator (regex or string). If regex has capture groups, captured text is included in result array. Optional limit truncates results. Returns array even if no match (whole string as one element).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of str.split() with regex — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest .split(): split a string on a regex pattern.\n// STRENGTHS - one line; shows .split() with regex delimiter.\n// WEAKNESSES- no capture groups, no limit, no multiple delimiters.\n//\n// GOAL: split a string on a regex pattern\n'apple, banana, cherry'.split(/,\\s*/);  // ['apple', 'banana', 'cherry']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of str.split() with regex — common patterns you'll see in production.\n// APPROACH  - Combine str.split() with regex with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - .split() recipes: capture groups in result, multiple delimiters,\n//             limit truncation.\n// STRENGTHS - covers the 80% case: captures, character class, limit.\n// WEAKNESSES- no nested groups; no empty string edge case.\n//\n// GOAL: split with capture groups and multiple delimiters\n// WHY: capture groups in regex are included in the result array\n'a1b2c3'.split(/(\\d)/);  // ['a', '1', 'b', '2', 'c', '3']\n// WHY: character class matches any of multiple delimiters\n'apple; banana, cherry | date'.split(/[,;|]\\s*/);\n// ['apple', 'banana', 'cherry', 'date']\n// WHY: limit truncates the result\n'one:two:three:four'.split(/:/, 2);  // ['one', 'two']"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of str.split() with regex — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production .split() patterns: capture vs non-capture comparison,\n//             CSV parser, character splitting, and nested group handling.\n// STRENGTHS - clear /,/ vs /(,)/ comparison; CSV parser with quoted fields;\n//             character splitting with lookahead.\n// WEAKNESSES- CSV parser is simplified (no embedded newlines).\n//\n// GOAL: use split correctly in production\n// WHY: /,/ and /(,)/ produce different results — captures are included\n// Capture vs non-capture comparison\n'a,b,c'.split(/,/);     // ['a', 'b', 'c']\n'a,b,c'.split(/(,)/);  // ['a', ',', 'b', ',', 'c'] — delimiters included\n// CSV parser using split with capture groups\nfunction parseCSV(line) {\n  // Split on commas that are not inside quotes\n  return line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)\n    .map(field => field.replace(/^\"|\"$/g, ''));\n}\nparseCSV('Alice,30,\"NYC, NY\"');  // ['Alice', '30', 'NYC, NY']\n// Split string into characters (including surrogates)\n'hello'.split(/(?=.)/u);  // ['h', 'e', 'l', 'l', 'o']\n// Or use spread: [...'hello']  // ['h', 'e', 'l', 'l', 'o']\n// Nested groups — numbering is left-to-right by opening parenthesis\nconst m = /(a(b)c)/.exec('abc');\nm[1]; // 'abc' (outer group)\nm[2]; // 'b'   (inner group)\n// Decision rule:\n//   simple delimiter                                 -> .split('string')\n//   multiple delimiters                              -> .split(/[delims]/)\n//   include delimiters in result                     -> .split(/(delim)/)\n//   limit number of splits                           -> .split(regex, limit)\n//   CSV / complex delimiter logic                    -> lookahead split (above)\n//   split into characters                            -> [...str] or .split(/(?=.)/u)\n//\n// Anti-pattern: forgetting capture groups are included in split result;\n//   using .split('') for characters (breaks surrogate pairs); not handling\n//   quoted fields in CSV with simple comma split."
                  }
        ],
        tips: [
                  "Capture groups in regex pattern are included in split result",
                  "Character class [,;|] matches any delimiter efficiently",
                  ".split() with empty match (like /(?=.)/) creates array of characters"
        ],
        mistake: "Forgetting that capture groups are included — /,/ and /(,)/ produce different results",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Groups & Captures ─────────────────────────────────────────
  {
    id: "groups-captures",
    title: "Groups & Captures",
    entries: [
      {
        id: "capture-groups",
        fn: "Numbered capture groups",
        desc: "Group with (pattern); access via match[1], match[2], etc.",
        category: "Groups",
        subtitle: "(pattern) creates numbered group",
        signature: "(pattern) → match[1], match[2], ...",
        descLong: "Parentheses create numbered capture groups. Index 0 is full match, [1] is first group, [2] is second, etc. Groups can be nested. In replacement strings, reference with $1, $2, etc. Use groups property on match array for named access or .exec() result.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Numbered capture groups — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest capture groups: extract user and domain by number.\n// STRENGTHS - four lines; shows .exec() with match[1], match[2].\n// WEAKNESSES- no nested groups, no optional groups, no replacement.\n//\n// GOAL: extract groups by number\nconst re = /(\\w+)@([\\w.]+)/;\nconst match = re.exec('john@example.com');\nmatch[1];  // 'john'\nmatch[2];  // 'example.com'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Numbered capture groups — common patterns you'll see in production.\n// APPROACH  - Combine Numbered capture groups with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - numbered group recipes: URL extraction, date reformatting\n//             with $1/$2/$3 replacement.\n// STRENGTHS - covers the 80% case: extraction + replacement with $ refs.\n// WEAKNESSES- no nested groups, no optional group handling.\n//\n// GOAL: use numbered groups for extraction and replacement\n// WHY: index 0 is full match, [1] is first group, [2] is second\nconst m = /https?:\\/\\/([\\w.-]+)(\\/[\\w./]*)?/.exec('https://example.com/path');\nm[1];  // 'example.com'\nm[2];  // '/path'\n// WHY: $1, $2 in replacement reference capture groups\n'2024-03-23'.replace(/(\\d{4})-(\\d{2})-(\\d{2})/, '$3/$2/$1');\n// '23/03/2024'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Numbered capture groups — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production numbered groups: nested group numbering, optional\n//             group handling, safe destructure with fallback, and a log\n//             parser using multiple groups.\n// STRENGTHS - safe destructure handles null; nested numbering explained;\n//             log parser shows real-world multi-group extraction.\n// WEAKNESSES- numbered groups become unreadable with 5+ groups.\n//\n// GOAL: use numbered groups correctly in production\n// WHY: nested groups are numbered left-to-right by opening parenthesis\n// Nested group numbering — left-to-right by opening paren\nconst m = /(a)(b(c))/.exec('abc');\nm[1]; // 'a'\nm[2]; // 'bc'\nm[3]; // 'c'\n// Optional groups may be undefined — check before using\nconst [, protocol, host, port] = /(https?)://([w.-]+)(?::(d+))?/.exec('https://example.com') || [];\nport; // undefined (no port in URL)\n// Safe destructure with fallback for no match\nconst [, user, domain] = /(w+)@(w+)/.exec('not-an-email') || [];\n// user=undefined, domain=undefined — no crash\n// Log parser: extract timestamp, level, message from log lines\nconst logRe = /[(d{4}-d{2}-d{2})] (w+): (.*)/;\nconst [, date, level, message] = logRe.exec('[2024-03-23] ERROR: Connection failed') || [];\n// date='2024-03-23', level='ERROR', message='Connection failed'\n// Decision rule:\n//   simple extraction (few groups)                   -> numbered groups match[1], match[2]\n//   complex pattern (many groups)                    -> named groups (?<name>)\n//   safe destructure with fallback                   -> const [, a, b] = re.exec(str) || []\n//   nested groups                                    -> number by opening paren order\n//   optional groups                                  -> check for undefined\n//\n// Anti-pattern: counting groups starting at 0. match[0] is the full match;\n//   not checking optional groups for undefined before use."
                  }
        ],
        tips: [
                  "Group numbering starts at 1; index 0 is always the full match",
                  "Nested groups are numbered left-to-right by opening parenthesis",
                  "For optional groups, check if match[n] is undefined before using"
        ],
        mistake: "Counting groups starting at 0 — match[0] is the full match, first group is match[1]",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "named-groups",
        fn: "Named capture groups",
        desc: "Group with (?<name>pattern); access via match.groups.name",
        category: "Groups",
        subtitle: "(?<name>pattern) creates named group",
        signature: "(?<name>pattern) → match.groups.name",
        descLong: "Named groups improve readability. Use (?<name>...) syntax. Access via .groups property on match array or .exec() result. In replacement strings, reference with $<name>. Much clearer than $1, $2 for complex patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Named capture groups — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest named groups: extract user and domain by name.\n// STRENGTHS - four lines; shows (?<name>) + .groups access.\n// WEAKNESSES- no replacement, no destructure, no .matchAll().\n//\n// GOAL: extract named groups from a match\nconst re = /(?<user>\\w+)@(?<domain>[\\w.]+)/;\nconst match = re.exec('john@example.com');\nmatch.groups.user;    // 'john'\nmatch.groups.domain;  // 'example.com'"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Named capture groups — common patterns you'll see in production.\n// APPROACH  - Combine Named capture groups with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - named group recipes: extraction with .groups, replacement with\n//             $<name> syntax.\n// STRENGTHS - covers the 80% case: .groups access + $<name> replacement.\n// WEAKNESSES- no destructure, no .matchAll(), no null check.\n//\n// GOAL: use named groups for extraction and replacement\n// WHY: named groups are self-documenting — clearer than $1, $2\nconst result = 'jane@company.org'.match(/(?<email>\\w+@[\\w.]+)/);\nresult.groups.email;  // 'jane@company.org'\n// WHY: $<name> references named groups in replacement\n'555-123-4567'.replace(\n  /(?<area>\\d{3})-(?<line>\\d{3})-(?<num>\\d{4})/,\n  '($<area>) $<line>-$<num>'\n);  // '(555) 123-4567'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Named capture groups — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production named groups: destructure .groups, .matchAll() with\n//             named groups, null-safe access, and a URL parser.\n// STRENGTHS - destructure for clean extraction; .matchAll() for iteration;\n//             null-safe with ??; URL parser shows real-world usage.\n// WEAKNESSES- .groups is undefined if no named groups in pattern.\n//\n// GOAL: use named groups in production patterns\n// WHY: named groups survive regex refactoring — reordering doesn't break code\n// Destructure .groups for clean extraction\nconst { year, month, day } = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/\n  .exec('2024-03-23').groups;\n// year='2024', month='03', day='23'\n// Null-safe access with ??\nconst { user, domain } = /(?<user>\\w+)@(?<domain>[\\w.]+)/\n  .exec('not-an-email')?.groups ?? {};\n// user=undefined, domain=undefined — no crash\n// .matchAll() with named groups — parse all key=value pairs\nconst input = 'name=Alice age=30 city=NYC';\nconst config = Object.fromEntries(\n  [...input.matchAll(/(?<key>\\w+)=(?<value>\\w+)/g)]\n    .map(m => [m.groups.key, m.groups.value])\n);\n// { name: 'Alice', age: '30', city: 'NYC' }\n// URL parser with named groups\nfunction parseUrl(url) {\n  const m = url.match(\n    /^(?<scheme>https?):\\/\\/(?<host>[\\w.-]+)(?::(?<port>\\d+))?(?<path>\\/[\\w./]*)?$/\n  );\n  return m?.groups ?? null;\n}\nparseUrl('https://example.com:8080/api/users');\n// { scheme: 'https', host: 'example.com', port: '8080', path: '/api/users' }\n// Decision rule:\n//   complex pattern with many groups                 -> named groups (?<name>)\n//   simple extraction (1-2 groups)                   -> numbered groups are fine\n//   replacement with readable references             -> $<name> in replacement\n//   destructure into variables                       -> const { a, b } = match.groups\n//   null-safe extraction                             -> match?.groups ?? {}\n//\n// Anti-pattern: using numbered groups for complex patterns that will be refactored;\n//   not null-checking .groups when match may fail."
                  }
        ],
        tips: [
                  "Named groups make patterns self-documenting — use them for clarity over numbered groups",
                  ".groups property only exists on match results with named groups",
                  "Named groups can coexist with numbered groups; all appear in result"
        ],
        mistake: "Accessing named groups on match array with bracket notation — use .groups.name, not .groups[1]",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "non-capturing",
        fn: "Non-capturing groups",
        desc: "Group with (?:pattern); groups but no capture; useful for alternation & quantifiers",
        category: "Groups",
        subtitle: "(?:pattern) creates group without capture",
        signature: "(?:pattern) → not included in match array",
        descLong: "Non-capturing groups (?:...) let you use grouping for quantifiers or alternation without creating a capture. Slightly faster, no polluting match array. Useful for (cat|dog)? or (?:https?://).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Non-capturing groups — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest non-capturing group: alternation without capture.\n// STRENGTHS - two lines; shows (?:...) with alternation.\n// WEAKNESSES- no quantifiers, no comparison with capturing, no extraction.\n//\n// GOAL: group without capturing\n/(?:red|green|blue)/.test('red');    // true\n/(?:red|green|blue)/.test('yellow'); // false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Non-capturing groups — common patterns you'll see in production.\n// APPROACH  - Combine Non-capturing groups with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - non-capturing group recipes: quantifiers on groups, optional\n//             protocol prefix, comparison with capturing groups.\n// STRENGTHS - covers the 80% case: (?:...)+, (?:...)?, capture vs non-capture.\n// WEAKNESSES- no nested non-capturing; no performance note.\n//\n// GOAL: use non-capturing groups for alternation and quantifiers\n// WHY: (?:...) groups logic without polluting match array\n/(?:na)+/.test('nanana');  // true\n// WHY: optional protocol without capturing it\nconst url = /(?:https?:\\/\\/)?([\\w.-]+)/;\nurl.exec('https://example.com')[1];  // 'example.com' (no protocol in group)\n// WHY: compare to captured — match[1] would be 'https://' with capturing group"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Non-capturing groups — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production non-capturing groups: keeping match array clean,\n//             nested non-capturing, quantified groups, and a comparison\n//             showing how captures shift indices.\n// STRENGTHS - clear capture vs non-capture index comparison; nested groups;\n//             quantified alternation; practical URL pattern.\n// WEAKNESSES- performance difference is negligible in most cases.\n//\n// GOAL: use non-capturing groups in production\n// WHY: non-capturing groups keep match array clean and indexed correctly\n// Capture vs non-capture: index shifting\nconst captured = /(https?)(\\/\\/)([\\w.-]+)/.exec('https://example.com');\n// captured[1]='https', captured[2]='//', captured[3]='example.com'\nconst clean = /(?:https?)(?:\\/\\/)([\\w.-]+)/.exec('https://example.com');\n// clean[1]='example.com' — only the capturing group is in the result\n// Nested non-capturing with quantified alternation\nconst colorRe = /(?:rgb\\((?:\\d+\\s*,\\s*){2}\\d+\\))/;\ncolorRe.test('rgb(255, 128, 0)');  // true\n// Optional prefix with quantifier\nconst phoneRe = /(?:\\+1\\s*)?(\\d{3})[-.\\s]?(\\d{4})/;\nconst [, area, line] = phoneRe.exec('+1 555-1234') || [];\n// area='555', line='1234'\n// Decision rule:\n//   grouping for alternation/quantifier only         -> (?:...)\n//   need to extract the grouped value                -> (...)\n//   optional prefix/suffix to discard                -> (?:...)?\n//   keep match array indices clean                   -> (?:...) for non-extracted\n//\n// Anti-pattern: using capturing groups when you only need grouping; this\n//   pollutes the match array and shifts group indices."
                  }
        ],
        tips: [
                  "Use (?:...) for grouping logic you don't need to extract",
                  "Non-capturing groups help keep match array clean and indexed correctly",
                  "Quantifiers like + * ? ? work on groups: (?:pattern)* or (?:pattern){n}"
        ],
        mistake: "Using capturing groups when you only need grouping for quantifiers — adds unnecessary array bloat",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "lookahead-lookbehind",
        fn: "Lookahead & lookbehind assertions",
        desc: "Zero-width assertions: (?=...) (?!...) (?<=...) (?<!...) — match position, not content",
        category: "Groups",
        subtitle: "(?=pos) (?!neg) (?<=pre) (?<!nopre)",
        signature: "(?=...) positive lookahead  |  (?!...) negative  |  (?<=...) positive lookbehind  |  (?<!...) negative",
        descLong: "Lookaheads and lookbehinds are zero-width assertions that match positions. Lookahead (?=...) checks ahead without consuming. Negative lookahead (?!...) succeeds if pattern does NOT follow. Lookbehind (?<=...) checks behind. Negative lookbehind (?<!...) succeeds if pattern does NOT precede. Useful for conditional matching.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lookahead & lookbehind assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest lookahead: match digits followed by 'px' without\n//             including 'px' in the match.\n// STRENGTHS - one line; shows positive lookahead (?=...).\n// WEAKNESSES- no negative lookahead, no lookbehind, no /g flag.\n//\n// GOAL: match digits followed by 'px' without including 'px'\n'12px 34em'.match(/\\d+(?=px)/);  // ['12']"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lookahead & lookbehind assertions — common patterns you'll see in production.\n// APPROACH  - Combine Lookahead & lookbehind assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - all four lookaround types: positive/negative lookahead and\n//             lookbehind with practical examples.\n// STRENGTHS - covers the 80% case: all four lookaround types.\n// WEAKNESSES- no combined lookarounds; no variable-length lookbehind note.\n//\n// GOAL: use all four lookaround types\n// WHY: positive lookahead — match digits followed by 'px'\n'12px 34em'.match(/\\d+(?=px)/g);   // ['12']\n// WHY: negative lookahead — match digits NOT followed by 'px'\n'12px 34em'.match(/\\d+(?!px)/g);   // ['34']\n// WHY: positive lookbehind — match words after '@'\n'contact @john'.match(/(?<=@)\\w+/);  // ['john']\n// WHY: negative lookbehind — match words NOT preceded by '@'\n// (?<!@) ensures the word doesn't follow @"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lookahead & lookbehind assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production lookaround patterns: password validation, price\n//             extraction, word boundary replacement, and combined assertions.\n// STRENGTHS - real-world password rules; price without currency; combined\n//             lookaround for precise matching; zero-width explanation.\n// WEAKNESSES- lookbehind must be fixed-length in most JS engines.\n//\n// GOAL: use lookarounds in production patterns\n// WHY: lookarounds are zero-width — they don't consume matched text\n// Password validation: min 8 chars, must have uppercase, lowercase, digit\nfunction isValidPassword(pw) {\n  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(pw);\n}\nisValidPassword('Abc12345');  // true\nisValidPassword('abc12345');  // false (no uppercase)\n// Price extraction without currency symbol\n'$12.99 €15.50'.match(/(?<=[$€])\\d+\\.\\d{2}/g);  // ['12.99', '15.50']\n// Match words not preceded by 'un' (negative lookbehind)\n'happy unhappy lucky unlucky'.match(/\\b(?!un)\\w+/g);\n// ['happy', 'lucky'] — skips words starting with 'un'\n// Combined: match 'cat' only when followed by 'dog' and preceded by 'the'\n'the cat dog a cat dog'.match(/(?<=the )cat(?= dog)/g);  // ['cat']\n// Decision rule:\n//   match X only if followed by Y                  -> X(?=Y)\n//   match X only if NOT followed by Y              -> X(?!Y)\n//   match X only if preceded by Y                  -> (?<=Y)X\n//   match X only if NOT preceded by Y              -> (?<!Y)X\n//   multiple conditions on same position           -> chain lookarounds\n//\n// Anti-pattern: thinking lookahead/lookbehind captures the assertion;\n//   using variable-length lookbehind (?<=a*) which most engines reject."
                  }
        ],
        tips: [
                  "Lookaheads/behinds are zero-width — they don't consume matched text",
                  "Lookbehind must be fixed-length in most JS engines (no * or +)",
                  "Use to assert context without including it in the match"
        ],
        mistake: "Thinking lookahead/lookbehind captures or includes the assertion — they match position only",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: Patterns & Flags ─────────────────────────────────────────
  {
    id: "patterns-flags-advanced",
    title: "Patterns & Flags",
    entries: [
      {
        id: "character-classes",
        fn: "Character classes & shorthand",
        desc: "\\d \\w \\s \\b [abc] [^abc] — match character types",
        category: "Patterns",
        subtitle: "[...] \\d \\D \\w \\W \\s \\S \\b \\B",
        signature: "\\d digit [0-9]  |  \\w word [a-zA-Z0-9_]  |  \\s space [\\t\\n\\r\\f\\v]  |  \\b word boundary",
        descLong: "\\d = digits, \\D = non-digits. \\w = word (letters, digits, underscore), \\W = non-word. \\s = whitespace, \\S = non-whitespace. \\b = word boundary (between \\w and \\W). [abc] = any of a/b/c. [^abc] = any except a/b/c. [a-z] = range.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Character classes & shorthand — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest character classes: \\d, \\w, \\s shorthand tests.\n// STRENGTHS - three lines; shows digit, word, and whitespace classes.\n// WEAKNESSES- no negated classes, no custom [...], no \\b.\n//\n// GOAL: match character types with shorthand classes\n/\\d{3}-\\d{4}/.test('555-1234');  // true — digits\n/\\w+/.test('hello123');           // true — word chars\n/\\s+/.test('  ');                 // true — whitespace"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Character classes & shorthand — common patterns you'll see in production.\n// APPROACH  - Combine Character classes & shorthand with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - character class recipes: negated shorthands, custom [abc] and\n//             [^abc], word boundary \\b.\n// STRENGTHS - covers the 80% case: \\D/\\W/\\S, custom classes, \\b.\n// WEAKNESSES- no ranges, no unicode classes, no /i interaction.\n//\n// GOAL: use character classes and negated shorthands\n// WHY: \\D, \\W, \\S are negated versions\n/\\D+/.test('abc');   // true (no digits)\n/\\W+/.test('!@#');   // true (no word chars)\n// WHY: custom character classes with [abc] and [^abc]\n/[aeiou]/.test('hello');     // true (vowel)\n/[^aeiou]/.test('xyz');      // true (consonant)\n/[a-z0-9]/.test('x5');       // true (letter or digit)\n// WHY: \\b matches word boundary — useful for whole words\n/\\bword\\b/.test('word ');   // true\n/\\bword\\b/.test('word123'); // false"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Character classes & shorthand — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production character classes: \\w vs [a-zA-Z] distinction,\n//             unicode property escapes with /u, range gotchas, and a\n//             practical slug validator.\n// STRENGTHS - \\w includes underscore explained; unicode \\p{} with /u;\n//             range ordering gotcha; practical validation function.\n// WEAKNESSES- /u flag not supported in very old engines.\n//\n// GOAL: use character classes efficiently in production\n// WHY: \\w includes underscore — use [a-zA-Z] for letters only\n// \\w vs [a-zA-Z] — underscore matters\n/\\w+/.test('hello_world');    // true (underscore is \\w)\n/[a-zA-Z]+/.test('hello_world'); // false at underscore\n// Unicode property escapes with /u flag\n/\\p{L}+/u.test('Hello');       // true (any letter in any script)\n/\\p{N}+/u.test('123');         // true (any number in any script)\n/\\p{Script=Han}+/u.test('你好'); // true (Chinese characters)\n// Range gotcha: [a-z] is ASCII only without /u\n// /i flag makes [a-z] match uppercase too\n/[a-z]+/i.test('HELLO');  // true\n// Practical slug validator\nfunction isValidSlug(slug) {\n  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);\n}\nisValidSlug('my-article-title');  // true\nisValidSlug('-leading-dash');     // false\nisValidSlug('trailing-dash-');    // false\nisValidSlug('UPPER');             // false\n// Decision rule:\n//   any digit                                        -> \\d\n//   any non-digit                                    -> \\D\n//   any word character                               -> \\w\n//   any whitespace                                   -> \\s\n//   custom set of characters                         -> [abc]\n//   any character except these                       -> [^abc]\n//   whole word match                                 -> \\bword\\b\n//   letters only (no underscore)                     -> [a-zA-Z]\n//   unicode categories                               -> \\p{} with /u flag\n//\n// Anti-pattern: using [0-9] instead of \\d; using \\w when you need letters\n//   only (\\w includes underscore); forgetting /u for \\p{} escapes."
                  }
        ],
        tips: [
                  "\\w includes underscore — use [a-zA-Z] if you need letters only",
                  "[^...] is negation; use \\D \\W \\S for negated shorthands",
                  "\\b matches between word and non-word, at string start/end — useful for whole words"
        ],
        mistake: "Using [0-9] instead of \\d or \\w instead of [a-z] — shorthands are clearer and often optimized",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "quantifiers",
        fn: "Quantifiers & anchors",
        desc: "* + ? {n,m} — repetition; ^ $ — anchors; greedy vs lazy",
        category: "Patterns",
        subtitle: "* + ? {n} {n,m} ^ $ greedy lazy",
        signature: "* zero+  |  + one+  |  ? zero-one  |  {n} exactly  |  {n,m} range  |  ^ start  |  $ end",
        descLong: "Quantifiers repeat preceding element. * (0+), + (1+), ? (0-1), {n} (exactly), {n,m} (n to m). Anchors ^ (start), $ (end). Greedy by default (take most). Lazy (take least) with ? after quantifier: *?, +?, ??, {n,m}?",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Quantifiers & anchors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest quantifiers: *, +, ? for repetition.\n// STRENGTHS - three lines; shows zero-or-more, one-or-more, optional.\n// WEAKNESSES- no {n}, no anchors, no greedy vs lazy.\n//\n// GOAL: use quantifiers for repetition\n/a*b/.test('b');          // true — 0 or more a\n/a+b/.test('aaab');       // true — 1 or more a\n/colou?r/.test('color');  // true — u optional"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Quantifiers & anchors — common patterns you'll see in production.\n// APPROACH  - Combine Quantifiers & anchors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - quantifier recipes: exact counts {n}, ranges {n,m}, anchors\n//             ^ $, and greedy vs lazy comparison.\n// STRENGTHS - covers the 80% case: {n}, {n,m}, anchors, greedy vs lazy.\n// WEAKNESSES- no backtracking explanation, no [^delim]+ alternative.\n//\n// GOAL: use exact counts, anchors, and lazy quantifiers\n// WHY: {n} exactly, {n,m} range, {n,} at least n\n/\\d{5}/.test('12345');     // true (exactly 5)\n/\\d{2,4}/.test('123');     // true (2-4 digits)\n// WHY: ^ start, $ end — anchors match positions\n/^hello/.test('hello world');  // true (starts with)\n/world$/.test('hello world');  // true (ends with)\n// WHY: greedy vs lazy — .* matches to last >, .*? to first >\n'<tag>content</tag>'.match(/<.*>/)[0];   // '<tag>content</tag>'\n'<tag>content</tag>'.match(/<.*?>/)[0];  // '<tag>'"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Quantifiers & anchors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production quantifier patterns: catastrophic backtracking,\n//             [^delim]+ vs .*? performance, possessive alternatives, and\n//             a practical HTML tag extractor.\n// STRENGTHS - catastrophic backtracking explained; [^>]+ faster than .*?;\n//             anchored validation; practical tag extraction.\n// WEAKNESSES- JS lacks possessive quantifiers (no *+); relies on alternation.\n//\n// GOAL: use quantifiers efficiently in production\n// WHY: lazy quantifiers are slower — use [^delim]+ when possible\n// Catastrophic backtracking: (a+)+ on 'aaaaaaaaaaaaaaaaaaaab'\n// The engine tries every possible split of a's before failing — O(2^n)\n// Fix: use a+ (no nested quantifier) or atomic group alternative\n// [^>]+ is faster than .*? for matching between delimiters\n'<a><b><c>'.match(/<[^>]+>/g);  // ['<a>', '<b>', '<c>'] — fast\n'<a><b><c>'.match(/<.*?>/g);    // ['<a>', '<b>', '<c>'] — slower (lazy)\n// Anchored validation with exact quantifiers\nfunction isValidIPv4(ip) {\n  return /^(?:\\d{1,3}\\.){3}\\d{1,3}$/.test(ip);\n}\nisValidIPv4('192.168.1.1');  // true\nisValidIPv4('999.999.999.999');  // true (loose — doesn't check 0-255)\n// Stricter with range check\nfunction isValidIPv4Strict(ip) {\n  const octet = '(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)';\n  return new RegExp(`^(?:${octet}\\.){3}${octet}$`).test(ip);\n}\nisValidIPv4Strict('192.168.1.1');    // true\nisValidIPv4Strict('256.1.1.1');      // false\n// Decision rule:\n//   zero or more                                     -> *\n//   one or more                                      -> +\n//   optional (zero or one)                           -> ?\n//   exact count                                      -> {n}\n//   range                                            -> {n,m}\n//   match between delimiters                         -> [^delim]+ (not .*?)\n//   avoid catastrophic backtracking                  -> no nested quantifiers like (a+)+\n//\n// Anti-pattern: using greedy .* when you need lazy .*?; using .*? when\n//   [^delim]+ is faster and clearer; nested quantifiers (a+)+ causing\n//   catastrophic backtracking on long inputs."
                  }
        ],
        tips: [
                  "Lazy quantifiers are slower — use only when necessary for correctness",
                  "Anchors ^ $ refer to string/line (with /m) boundaries, not word positions",
                  "Greedy matching often causes backtracking — use lazy or be specific like [^>]+ instead of .*"
        ],
        mistake: "Using greedy .* when you need lazy .*? — leading to over-matching",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "global-flag",
        fn: "Global & sticky flags",
        desc: "/g flag enables .matchAll(), multi-match .exec(), affects replacement; /y sticky flag",
        category: "Flags",
        subtitle: "/g global | /y sticky",
        signature: "/pattern/g | /pattern/y",
        descLong: "/g (global) flag makes methods return all matches. .exec() with /g advances stateful lastIndex; without /g only first match. .match() with /g returns array; without returns single match. /y (sticky) flag matches only at lastIndex position, strict positioning. /g + /y combined: global + sticky.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Global & sticky flags — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest /g flag: replace all vs first occurrence.\n// STRENGTHS - two lines; shows /g vs no-/g in .replace().\n// WEAKNESSES- no .exec() loop, no .matchAll(), no /y sticky.\n//\n// GOAL: replace all occurrences with /g flag\n'hello hello hello'.replace(/hello/g, 'hi');  // 'hi hi hi'\n'hello hello hello'.replace(/hello/, 'hi');   // 'hi hello hello' (no /g)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Global & sticky flags — common patterns you'll see in production.\n// APPROACH  - Combine Global & sticky flags with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - /g and /y recipes: .exec() loop with /g, .match() with /g,\n//             /y sticky flag for position-based matching.\n// STRENGTHS - covers the 80% case: /g exec loop, /g match, /y sticky.\n// WEAKNESSES- no lastIndex reset; no .matchAll() comparison; no /gy combo.\n//\n// GOAL: use /g for multi-match and /y for sticky matching\n// WHY: /g with .exec() loop — lastIndex advances each call\nconst re = /(\\w+)=(\\d+)/g;\nlet match;\nwhile ((match = re.exec('a=1 b=2 c=3')) !== null) {\n  console.log(match[1], match[2]);  // a 1, b 2, c 3\n}\n// WHY: .match() with /g returns all matches as array\n'apple banana apple'.match(/apple/g);  // ['apple', 'apple']\n// WHY: /y sticky flag — match only at exact lastIndex position\nconst sticky = /\\w+/y;\nsticky.lastIndex = 0;\nsticky.exec('hello world');  // ['hello'] at position 0"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Global & sticky flags — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production /g and /y patterns: lastIndex reset, .matchAll()\n//             as stateless alternative, /gy combined sticky+global, and a\n//             practical token scanner.\n// STRENGTHS - lastIndex reset prevents bugs; .matchAll() is stateless;\n//             /gy for strict sequential matching; token scanner shows /y.\n// WEAKNESSES- /g statefulness is a common source of bugs; /y is niche.\n//\n// GOAL: use /g and /y correctly in production\n// WHY: /g makes .exec() stateful — reset lastIndex or recreate regex\n// lastIndex reset before reuse in a new loop\nconst re = /\\w+/g;\nre.lastIndex = 0; // always reset before reuse\nlet m;\nwhile ((m = re.exec('hello world foo')) !== null) {\n  console.log(m[0]); // hello, world, foo\n}\n// .matchAll() is stateless — no lastIndex to manage (preferred)\nfor (const match of 'hello world foo'.matchAll(/\\w+/g)) {\n  console.log(match[0]); // hello, world, foo\n}\n// /gy combined: global + sticky — match sequentially with no gaps\nconst strict = /\\w+/gy;\nstrict.exec('hello world');  // ['hello'] at 0\nstrict.exec('hello world');  // ['world'] at 6 (next position)\n// Fails if there's a gap: /\\w+/gy on '  hello' at 0 returns null\n// Practical token scanner using /y\nfunction scan(input) {\n  const tokens = [];\n  const patterns = [\n    ['NUMBER', /\\d+/y],\n    ['IDENT', /[a-zA-Z_]+/y],\n    ['OP', /[=+*/-]/y],\n    ['WS', /\\s+/y],\n  ];\n  let pos = 0;\n  while (pos < input.length) {\n    let matched = false;\n    for (const [type, re] of patterns) {\n      re.lastIndex = pos;\n      const m = re.exec(input);\n      if (m) {\n        if (type !== 'WS') tokens.push({ type, value: m[0] });\n        pos = re.lastIndex;\n        matched = true;\n        break;\n      }\n    }\n    if (!matched) throw new Error('Unexpected char at ' + pos);\n  }\n  return tokens;\n}\nscan('x = 42 + y');  // [{type:'IDENT',value:'x'},{type:'OP',value:'='},{type:'NUMBER',value:'42'},{type:'OP',value:'+'},{type:'IDENT',value:'y'}]\n// Decision rule:\n//   replace all occurrences                          -> /g\n//   iterate all matches with groups                  -> .matchAll() with /g\n//   stateful iteration with position control         -> .exec() with /g\n//   strict position matching (tokenizer)             -> /y\n//   sequential matching with no gaps                 -> /gy\n//\n// Anti-pattern: reusing /g regex in multiple loops without resetting lastIndex;\n//   using .exec() loop when .matchAll() is simpler and stateless."
                  }
        ],
        tips: [
                  "/g flag is required for .matchAll() and for .replace() to replace all occurrences",
                  "/y (sticky) is rarely used — useful for tokenizers where position matters",
                  "Always reset or recreate regex with /g before looping via .exec()"
        ],
        mistake: "Reusing /g regex in multiple .exec() loops without resetting lastIndex — state persists",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "common-patterns",
        fn: "Common copy-paste patterns",
        desc: "Email, URL, phone, date, slug — ready-to-use regex patterns",
        category: "Patterns",
        subtitle: "Email URL Phone Date Slug",
        signature: "Common practical patterns for validation",
        descLong: "Pre-built patterns for common validation tasks. Email pattern: simple version catches most cases. URL: http/https with domain. Phone: common formats. Date: ISO, US, EU. Slug: lowercase alphanumeric + hyphens. These are simplified — production often needs stricter validation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Common copy-paste patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// APPROACH  - the simplest common patterns: email and URL validation.\n// STRENGTHS - two lines; shows email and URL regex in one snippet.\n// WEAKNESSES- no phone, date, slug; no strictness notes.\n//\n// GOAL: validate common formats with ready-to-use patterns\n/^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/.test('user@example.com');  // true — email\n/^https?:\\/\\/[\\w.-]+\\.[a-z]{2,}/i.test('https://example.com');  // true — URL"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Common copy-paste patterns — common patterns you'll see in production.\n// APPROACH  - Combine Common copy-paste patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// APPROACH  - common validation patterns: email, phone, date, slug, username.\n// STRENGTHS - covers the 80% case: 5 ready-to-use patterns with comments.\n// WEAKNESSES- patterns are loose; no strictness notes; no URL pattern.\n//\n// GOAL: use common validation patterns\n// WHY: email — simple, not RFC-compliant, good enough for most\nconst email = /^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/;\n// WHY: phone — US format (123) 456-7890 or 123-456-7890\nconst phone = /^(\\(?\\d{3}\\)?[\\s.-]?)?\\d{3}[\\s.-]?\\d{4}$/;\n// WHY: date ISO — YYYY-MM-DD\nconst dateISO = /^\\d{4}-\\d{2}-\\d{2}$/;\n// WHY: slug — lowercase alphanumeric with hyphens\nconst slug = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;\n// WHY: username — 3-16 chars, no leading digit\nconst username = /^[a-z_][a-z0-9_]{2,15}$/i;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Common copy-paste patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// APPROACH  - production common patterns: a validation utility with strict\n//             and loose modes, RFC-aware email notes, and a pattern registry.\n// STRENGTHS - strict vs loose modes; pattern registry with test cases;\n//             clear guidance on regex vs dedicated libraries.\n// WEAKNESSES- patterns are still simplified; production email validation\n//             needs dedicated library for full RFC 5322 compliance.\n//\n// GOAL: know when to use regex vs dedicated libraries\n// WHY: these patterns are intentionally loose — tighten for your needs\n// Pattern registry with test cases\nconst patterns = {\n  email: {\n    loose: /^[\\w.+-]+@[\\w-]+\\.[\\w.-]+$/,\n    strict: /^(?:[a-zA-Z0-9!#$%&'*+/=?^_~.-]+\\.)+[a-zA-Z0-9!#$%&'*+/=?^_~.-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,\n  },\n  url: {\n    loose: /^https?:\\/\\/[\\w.-]+\\.[a-z]{2,}/i,\n    strict: /^https?:\\/(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)|(?:(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,})(?::\\d+)?(?:\\/[\\w./?-=&%#]*)?$/,\n  },\n  phone: /^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$/,\n  dateISO: /^\\d{4}-\\d{2}-\\d{2}$/,\n  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,\n};\n// Validation utility with strict/loose mode\nfunction validate(value, type, { strict = false } = {}) {\n  const p = patterns[type];\n  const re = p.loose ? (strict ? p.strict : p.loose) : p;\n  return re.test(value);\n}\nvalidate('user@example.com', 'email');                    // true (loose)\nvalidate('user@example.com', 'email', { strict: true }); // true (strict)\nvalidate('a@b', 'email');                                // true (loose — too loose!)\nvalidate('a@b', 'email', { strict: true });              // false (strict rejects)\n// Date validation with range check (regex can't check ranges)\nfunction isValidDate(str) {\n  if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(str)) return false;\n  const [y, m, d] = str.split('-').map(Number);\n  const date = new Date(y, m - 1, d);\n  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;\n}\nisValidDate('2024-02-30');  // false (Feb 30 doesn't exist)\nisValidDate('2024-02-29');  // true (2024 is a leap year)\n// Decision rule:\n//   quick client-side validation                      -> regex pattern\n//   strict validation (security, compliance)          -> dedicated library\n//   server-side validation                            -> always validate server-side too\n//   date range validation                             -> regex + Date check (above)\n//   email RFC 5322 compliance                         -> dedicated library (not regex)\n//\n// Anti-pattern: using /.+@.+/ which matches invalid emails like a@b;\n//   relying on regex alone for date validation (can't check ranges);\n//   not validating server-side in addition to client-side."
                  }
        ],
        tips: [
                  "Test patterns with real data before production — edge cases vary",
                  "For strict validation, use dedicated libraries (email-validator, is-valid-domain)",
                  "These patterns are intentionally loose — tighten based on your specific needs"
        ],
        mistake: "Using overly simple patterns like /.+@.+/ which match invalid emails like a@b",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },
]

export default { meta, sections }
