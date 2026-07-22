export const meta = {
  "id": "core",
  "label": "Core Syntax",
  "icon": "🐹",
  "description": "Variables, types, constants, control flow, functions, defer, slices, and maps — the fundamentals of Go programming."
}

export const sections = [

  // ── Section 1: Core Syntax ─────────────────────────────────────────
  {
    id: "core-syntax",
    title: "Core Syntax",
    entries: [
      {
        id: "var-short-declare",
        fn: "Variable Declaration & Short Declaration",
        desc: "Declare variables with var, const, or the short declaration operator :=. Go infers types automatically.",
        category: "Variables & Types",
        subtitle: "var, const, and := declarations",
        signature: "var name Type = value  |  name := value",
        descLong: "Go supports three ways to declare variables: the var keyword (with optional initializer), const for compile-time constants, and := for short declaration (type-inferred, inside functions only). The := operator is idiomatic for local variables. Declared but unused variables cause compilation errors — use _ to discard values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variable Declaration & Short Declaration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"flag\"\n  \"fmt\"\n  \"log\"\n  \"os\"\n  \"strconv\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variable Declaration & Short Declaration — common patterns you'll see in production.\n// APPROACH  - Combine Variable Declaration & Short Declaration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Package-level constants and variables\nconst Version = \"1.0.0\"\n\nvar (\n  port    = 8080\n  timeout = 30\n)\n\nfunc main() {\n  // Parse command-line flags\n  dbURL := flag.String(\"db\", \"localhost\", \"database URL\")\n  verbose := flag.Bool(\"v\", false, \"verbose output\")\n  flag.Parse()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variable Declaration & Short Declaration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Short declarations — most idiomatic in functions,  name := \"Alice\",  age := 25,\n\n  // Multiple short declarations,  host, port := \"localhost\", 8080,\n\n  // Discard unwanted values with _,  user, err := fetchUser(*dbURL, \"user123\"),  if err != nil {,    log.Fatal(err),  },\n\n  // String to numeric conversion with error handling,  portStr := os.Getenv(\"PORT\"),  if portStr == \"\" {,    portStr = \"8080\",  },  p, err := strconv.Atoi(portStr),  if err != nil {,    log.Fatalf(\"invalid PORT: %v\", err),  },,  fmt.Printf(\"Server at %s:%d (user: %s, verbose: %v),\", host, p, name, *verbose),},,func fetchUser(dbURL, id string) (string, error) {,  return id, nil,}"
                  }
        ],
        tips: [
                  "Use := inside functions; var at package level — idiomatic Go style.",
                  "Unused variables are a compile error; use _ to silence them.",
                  "Go infers types from the right-hand side — no need to specify int, string, etc. when the type is obvious.",
                  "var without initialization uses zero values (0, \"\", nil, false)."
        ],
        mistake: "Declaring variables at package level with := — only allowed inside functions. Use var at package scope.",
        shorthand: {
          verbose: "var name string\nvar age int\nname = \"Alice\"\nage = 30",
          concise: "name := \"Alice\"\nage := 30",
        },
      },
      {
        id: "basic-types",
        fn: "Basic Types",
        desc: "Go's primitive types: integers (int, int8, uint), strings, booleans, floats, and complex numbers.",
        category: "Variables & Types",
        subtitle: "int, uint, string, bool, float64, complex128",
        signature: "int, int32, int64, uint, uint32, float32, float64, bool, string, complex64, complex128",
        descLong: "Go provides sized integers (int8, int16, int32, int64, uint8, uint16, uint32, uint64), a platform-dependent int/uint, floating-point (float32, float64), bool (true/false), and string (immutable UTF-8). Use int and float64 by default. Arithmetic on different types requires explicit conversion. Strings are immutable; indexing returns bytes, not runes (for Unicode support use rune slices or the strings package).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Basic Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  // Integer types\n  var a int = 42\n  var b int8 = -128\n  var c uint32 = 1000"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Basic Types — common patterns you'll see in production.\n// APPROACH  - Combine Basic Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Float types\n  var x float32 = 3.14\n  var y float64 = 2.718"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Basic Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Boolean,  var flag bool = true,\n\n  // String — immutable UTF-8,  var text string = \"Hello, World!\",\n\n  // Zero values (default when not initialized),  var uninitialized int       // 0,  var emptyStr string         // \"\",  var unsetBool bool          // false,\n\n  // Type conversion — explicit,  var count int = 100,  var precise float64 = float64(count),\n\n  // Rune for Unicode characters,  var char rune = 'A'  // 65,,  fmt.Printf(\"%T: %v\\n\", a, a),}"
                  }
        ],
        tips: [
                  "Use int and float64 by default; sized types (int32, float32) are rarely needed.",
                  "Type conversion is explicit — no implicit int-to-float or vice versa.",
                  "Strings are immutable and zero-indexed; indexing returns bytes (0-255), not runes.",
                  "Use rune for Unicode characters; use strconv or strings packages for complex string operations."
        ],
        mistake: "Comparing int and int64 without conversion, or using int when int64 is needed for API boundaries — Go requires explicit type conversion.",
        shorthand: {
          verbose: "var a int = 42\nvar b float64 = float64(a)\nvar c int64 = int64(a)",
          concise: "a := 42           // int\nb := float64(a)   // explicit conversion",
        },
      },
      {
        id: "const-iota",
        fn: "Constants and iota",
        desc: "Define compile-time constants with const. Use iota for sequential enumeration.",
        category: "Variables & Types",
        subtitle: "const declarations and enumeration with iota",
        signature: "const Name Type = Value  |  const ( A = iota; B; C )",
        descLong: "Constants are immutable values computed at compile time. Unlike variables, constants are not memory locations. The iota identifier generates sequential integers — useful for enums. Within a const block, each line increments iota. You can use expressions with iota (iota << 10 for powers of 2, _ to skip values). Constants are untyped until assigned.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Constants and iota — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Constants and iota — common patterns you'll see in production.\n// APPROACH  - Combine Constants and iota with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic constants\nconst Pi = 3.14159\nconst Greeting = \"Hello, Go!\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Constants and iota — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Typed constant,const MaxRetries int = 5,\n\n// iota — sequential enumeration (0-indexed),const (,  Sunday iota     // 0,  Monday          // 1,  Tuesday         // 2,  Wednesday       // 3,  Thursday        // 4,  Friday          // 5,  Saturday        // 6,),\n\n// iota with expressions — power of 2,const (,  _      = iota,  KB     = 1 << (10 * iota)  // 1024,  MB                         // 1048576,  GB                         // 1073741824,),\n\n// Multiple constants per iota,const (,  Read = 1 << iota  // 1,  Write             // 2,  Execute           // 4,),,type Status int,const (,  Pending Status = iota  // 0,  Active                 // 1,  Archived               // 2,),,func main() {,  fmt.Println(Sunday, Monday, Friday),  fmt.Println(Read, Write, Execute),  fmt.Println(KB, MB, GB),}"
                  }
        ],
        tips: [
                  "Use iota for bit flags and enums — cleaner than manually assigning 0, 1, 2, ...",
                  "Constants are untyped until used; cast to a type when needed.",
                  "Expression with iota (1 << iota) creates bit flags for permissions.",
                  "Skip iota values with _ = iota to leave gaps in the sequence."
        ],
        mistake: "Trying to modify a constant at runtime — constants are compile-time immutable. Use var for mutable values.",
        shorthand: {
          verbose: "const Pi = 3.14159\nconst (\n  A = iota\n  B = iota\n  C = iota\n)",
          concise: "const Pi = 3.14159\nconst (\n  A = iota\n  B\n  C\n)",
        },
      },
      {
        id: "if-else",
        fn: "If/Else Statements",
        desc: "Conditional branching with if, else if, and else. Conditions need not be parenthesized.",
        category: "Control Flow",
        subtitle: "Branching with if/else if/else",
        signature: "if condition { } else if { } else { }",
        descLong: "Go if statements don't require parentheses around the condition (style rule: no parentheses). Else must be on the same line as the closing brace. Short variable declarations are allowed before the condition: if x := getValue(); x > 0 { ... }. Go has no ternary operator — use if/else for conditional values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of If/Else Statements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\nfunc checkScore(score int) string {\n  // Simple if/else\n  if score >= 90 {\n    return \"A\"\n  } else if score >= 80 {\n    return \"B\"\n  } else if score >= 70 {\n    return \"C\"\n  } else {\n    return \"F\"\n  }\n}\n\nfunc login(user, pass string) bool {\n  // Short declaration in if condition (scope limited to if/else)\n  if err := validatePassword(pass); err != nil {\n    fmt.Println(\"Invalid password:\", err)\n    return false\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of If/Else Statements — common patterns you'll see in production.\n// APPROACH  - Combine If/Else Statements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Check exists\n  if user == \"\" {\n    return false\n  }\n\n  return true\n}\n\nfunc main() {\n  fmt.Println(checkScore(85))\n  fmt.Println(checkScore(72))\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of If/Else Statements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfunc validatePassword(p string) error {\n  if len(p) < 8 {\n    return fmt.Errorf(\"too short\")\n  }\n  return nil\n}"
                  }
        ],
        tips: [
                  "No parentheses around the condition — idiomatic Go style.",
                  "Declare and check in one line: if x := getValue(); x > 0 { ... }",
                  "else must be on the same line as the closing } of the if block.",
                  "Go has no ternary operator — use if/else or a small function for ternary-like logic."
        ],
        mistake: "Putting else on a new line — Go's parser requires it on the same line as }. Use gofmt to enforce correct style.",
        shorthand: {
          verbose: "if x > 0 {\n  return \"positive\"\n}\nelse {\n  return \"not positive\"\n}",
          concise: "if x > 0 {\n  return \"positive\"\n} else {\n  return \"not positive\"\n}",
        },
      },
      {
        id: "for-loop",
        fn: "For Loop (Go's Only Loop)",
        desc: "Go has one loop construct: for. Use for { } for infinite loops, for init; cond; post { } for C-style, and for range for iterating collections.",
        category: "Control Flow",
        subtitle: "for loops with init/cond/post, range, and infinite loops",
        signature: "for init; condition; post { }  |  for range collection { }  |  for { }",
        descLong: "Go has only one loop keyword: for. Three forms: (1) C-style: for i := 0; i < 10; i++ { }, (2) range-based: for i, v := range slice { }, (3) infinite: for { }. break and continue work as expected. Range loops over arrays, slices, maps, strings, and channels. For maps, range returns (key, value); for strings, range returns (index, rune).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of For Loop (Go's Only Loop) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  // C-style for loop\n  for i := 0; i < 5; i++ {\n    fmt.Println(i)\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of For Loop (Go's Only Loop) — common patterns you'll see in production.\n// APPROACH  - Combine For Loop (Go's Only Loop) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Range over slice (index, value)\n  fruits := []string{\"apple\", \"banana\", \"cherry\"}\n  for i, fruit := range fruits {\n    fmt.Printf(\"%d: %s\\n\", i, fruit)\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of For Loop (Go's Only Loop) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Range — index only (discard value with _),  for i := range fruits {,    fmt.Println(i),  },\n\n  // Range — value only,  for _, fruit := range fruits {,    fmt.Println(fruit),  },\n\n  // Range over string (returns rune, not byte),  for i, char := range \"Hello\" {,    fmt.Printf(\"%d: %c\\n\", i, char),  },\n\n  // Range over map (key, value),  ages := map[string]int{\"Alice\": 30, \"Bob\": 25},  for name, age := range ages {,    fmt.Printf(\"%s: %d\\n\", name, age),  },\n\n  // Infinite loop (break or return to exit),  count := 0,  for {,    count++,    if count > 3 {,      break,    },    fmt.Println(count),  },\n\n  // continue to skip iteration,  for i := 0; i < 5; i++ {,    if i == 2 {,      continue,    },    fmt.Println(i),  },}"
                  }
        ],
        tips: [
                  "Use range for clean, idiomatic iteration over collections.",
                  "Discard loop variables with _ instead of using a dummy variable name.",
                  "Range on strings returns runes, not bytes — for byte iteration, convert to []byte first.",
                  "Infinite for { } with break/return is clearer than while true in other languages."
        ],
        mistake: "Modifying the slice/map being iterated over during range — behavior is unpredictable. Copy the collection first if modification is needed.",
        shorthand: {
          verbose: "for i := 0; i < len(items); i++ {\n  if items[i].match() {\n    items = append(items[:i], items[i+1:]...)\n    i--\n  }\n}",
          concise: "for i, item := range items {\n  if item.match() {\n    // can't safely modify during range\n  }\n}",
        },
      },
      {
        id: "switch",
        fn: "Switch Statements",
        desc: "Control flow with switch/case. Cases need not be constants; each case is independent (no fall-through by default).",
        category: "Control Flow",
        subtitle: "Type-safe pattern matching and branching",
        signature: "switch expr { case val1: ... case val2: ... default: ... }",
        descLong: "Go switch statements support expression switches (switch on a value) and type switches (switch on type). Each case is independent — no fall-through by default (use fallthrough keyword if needed). Cases need not be constants. Switch without an expression tests true/false. Type switches check the dynamic type of an interface value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Switch Statements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"reflect\"\n)\n\nfunc getDayName(day int) string {\n  switch day {\n  case 1:\n    return \"Monday\"\n  case 2:\n    return \"Tuesday\"\n  case 3:\n    return \"Wednesday\"\n  case 4:\n    return \"Thursday\"\n  case 5:\n    return \"Friday\"\n  case 6, 7:  // multiple values in one case\n    return \"Weekend\"\n  default:\n    return \"Invalid day\"\n  }\n}\n\nfunc checkGrade(score int) string {\n  // Switch without expression — evaluates cases as boolean conditions\n  switch {\n  case score >= 90:\n    return \"A\"\n  case score >= 80:\n    return \"B\"\n  case score >= 70:\n    return \"C\"\n  default:\n    return \"F\"\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Switch Statements — common patterns you'll see in production.\n// APPROACH  - Combine Switch Statements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Type switch\nfunc describe(x interface{}) string {\n  switch v := x.(type) {\n  case string:\n    return fmt.Sprintf(\"String: %s\", v)\n  case int:\n    return fmt.Sprintf(\"Integer: %d\", v)\n  case bool:\n    return fmt.Sprintf(\"Boolean: %v\", v)\n  default:\n    return fmt.Sprintf(\"Unknown type: %v\", reflect.TypeOf(x))\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Switch Statements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfunc main() {\n  fmt.Println(getDayName(3))\n  fmt.Println(getDayName(6))\n  fmt.Println(checkGrade(85))\n  fmt.Println(describe(\"hello\"))\n  fmt.Println(describe(42))\n}"
                  }
        ],
        tips: [
                  "No fall-through by default — cases are independent. Use fallthrough keyword if needed.",
                  "Multiple values per case: case 6, 7: matches both.",
                  "Switch without expression tests boolean conditions — cleaner than if/else chains.",
                  "Type switch uses v := x.(type) to extract and match on the dynamic type."
        ],
        mistake: "Forgetting that cases don't fall-through — adding fallthrough when not intended. Test each case independently.",
        shorthand: {
          verbose: "switch x {\ncase 1: fmt.Println(\"one\");\ncase 2: fmt.Println(\"two\");\ncase 3: fmt.Println(\"three\");\ndefault: fmt.Println(\"other\");\n}",
          concise: "switch x {\ncase 1: fmt.Println(\"one\")\ncase 2: fmt.Println(\"two\")\ndefault: fmt.Println(\"other\")\n} // no fallthrough needed",
        },
      },
      {
        id: "functions-multi-return",
        fn: "Functions with Multiple Returns",
        desc: "Functions can return multiple values. Return error as the last value — idiomatic Go error handling.",
        category: "Functions & Defer",
        subtitle: "Named and unnamed returns, multiple return values",
        signature: "func Name(param Type) (retType1, retType2, error)",
        descLong: "Go functions can return multiple values, enabling idiomatic error handling (value, error). The error is always returned last by convention. Return values can be named in the function signature — named returns are automatically initialized to zero values and are returned by a bare return statement. Unnamed returns require explicit return values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Functions with Multiple Returns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"errors\"\n  \"fmt\"\n  \"strconv\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Functions with Multiple Returns — common patterns you'll see in production.\n// APPROACH  - Combine Functions with Multiple Returns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple return values — unnamed\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, errors.New(\"division by zero\")\n  }\n  return a / b, nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Functions with Multiple Returns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Named return values,func swap(a, b string) (first, second string) {,  first = b,  second = a,  return  // bare return — uses named returns,},\n\n// Error handling pattern,func parsePort(s string) (int, error) {,  port, err := strconv.Atoi(s),  if err != nil {,    return 0, fmt.Errorf(\"invalid port: %w\", err),  },  if port < 1 || port > 65535 {,    return 0, errors.New(\"port out of range\"),  },  return port, nil,},\n\n// Multiple named returns,func getCoords() (x, y int, ok bool) {,  x, y, ok = 10, 20, true,  return,},,func main() {,  result, err := divide(10, 2),  if err != nil {,    fmt.Println(\"Error:\", err),  } else {,    fmt.Println(\"Result:\", result),  },,  a, b := swap(\"hello\", \"world\"),  fmt.Println(a, b),,  port, err := parsePort(\"8080\"),  if err != nil {,    fmt.Println(\"Parse error:\", err),  } else {,    fmt.Println(\"Port:\", port),  },}"
                  }
        ],
        tips: [
                  "Always return error as the last value — Go convention.",
                  "Named returns are idiomatic for complex functions; bare return makes them clear.",
                  "Return (value, error) pattern allows callers to check errors immediately.",
                  "Blank identifier _ discards unwanted return values: _, err := f()"
        ],
        mistake: "Ignoring error return values or returning only error without the value — Go favors explicit error handling.",
        shorthand: {
          verbose: "// Manual / verbose approach\nf, _ := os.Open(\"file.txt\")\ndefer f.Close()\n// More explicit but longer",
          concise: "f, err := os.Open(\"file.txt\")\nif err != nil {\n  return err\n}\ndefer f.Close()",
        },
      },
      {
        id: "defer",
        fn: "Defer Statement",
        desc: "Defer schedules a function to run after the enclosing function returns. Ideal for cleanup: closing files, unlocking mutexes, or releasing resources.",
        category: "Functions & Defer",
        subtitle: "Deferred cleanup and resource release",
        signature: "defer functionCall()",
        descLong: "Defer postpones the execution of a function until the surrounding function returns. Arguments are evaluated immediately (when defer is encountered), but the function runs after return. Deferred calls execute in LIFO order (last-in, first-out). Common use: defer file.Close(), defer mu.Unlock(). Panics don't prevent deferred functions from running.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Defer Statement — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"os\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Defer Statement — common patterns you'll see in production.\n// APPROACH  - Combine Defer Statement with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Cleanup pattern with defer\nfunc readFile(name string) (string, error) {\n  file, err := os.Open(name)\n  if err != nil {\n    return \"\", err\n  }\n  defer file.Close()  // always closes, even on early return or panic"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Defer Statement — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Read and process file,  data := make([]byte, 1024),  n, _ := file.Read(data),  return string(data[:n]), nil,},\n\n// Deferred calls execute in LIFO order,func deferOrder() {,  defer fmt.Println(\"Third\"),  defer fmt.Println(\"Second\"),  defer fmt.Println(\"First\"),}  // Output: First, Second, Third,\n\n// Lock/unlock pattern,func protectedAccess(mu *sync.Mutex, resource *int) {,  mu.Lock(),  defer mu.Unlock()  // guaranteed to unlock,,  *resource += 1,  // Early return? Panic? Unlock still happens,},\n\n// Named return + defer for cleanup,func processData() (count int, err error) {,  f, err := os.Open(\"data.txt\"),  if err != nil {,    return 0, err,  },  defer f.Close(),\n\n  // Read and count lines,  scanner := bufio.NewScanner(f),  for scanner.Scan() {,    count++,  },  return count, scanner.Err()  // defers run before return,},,func main() {,  deferOrder(),}"
                  }
        ],
        tips: [
                  "Defer is LIFO — last deferred runs first. Visualize a stack.",
                  "Arguments are evaluated when defer is encountered, not when it runs.",
                  "Use defer file.Close() immediately after opening — prevents resource leaks.",
                  "Panics still trigger defers — use for guaranteed cleanup."
        ],
        mistake: "Deferring in a loop and expecting cleanup per iteration — defer runs at function exit, not loop iteration. Use RAII pattern (create/close per iteration) inside loops.",
        shorthand: {
          verbose: "for _, file := range files {\n  f, _ := os.Open(file)\n  defer f.Close()  // deferred until function exits\n}",
          concise: "for _, file := range files {\n  f, _ := os.Open(file)\n  f.Close()  // close immediately per iteration\n}",
        },
      },
      {
        id: "slices",
        fn: "Slices",
        desc: "Dynamic arrays — ordered collections with length and capacity. Slices share underlying array backing.",
        category: "Collections",
        subtitle: "Length, capacity, and slice operations",
        signature: "[]Type  |  make([]Type, len, cap)  |  arr[low:high]",
        descLong: "Slices are dynamic, ordered collections backed by an array. They have length (number of elements) and capacity (allocated space). Slicing (arr[1:3]) creates a new slice view over the same backing array. append() grows the slice, reallocating if needed. Slices are pass-by-value (copying the header), but modifications affect the backing array. Use copy() to deep-copy data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Slices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  // Slice literal\n  fruits := []string{\"apple\", \"banana\", \"cherry\"}\n  fmt.Println(fruits, len(fruits), cap(fruits))"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Slices — common patterns you'll see in production.\n// APPROACH  - Combine Slices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// make with length and capacity\n  numbers := make([]int, 5, 10)  // len=5, cap=10\n  fmt.Println(len(numbers), cap(numbers))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Slices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Slicing — creates a view,  slice1 := numbers[1:4]    // elements 1-3,  slice2 := numbers[:3]     // elements 0-2,  slice3 := numbers[2:]     // elements 2 to end,  fmt.Println(slice1, slice2, slice3),\n\n  // Append — grows the slice,  fruits = append(fruits, \"date\"),  fmt.Println(fruits),\n\n  // Append multiple values,  fruits = append(fruits, \"elderberry\", \"fig\"),  fmt.Println(fruits, len(fruits), cap(fruits)),\n\n  // Copy — deep copy to avoid shared backing,  original := []int{1, 2, 3, 4, 5},  copied := make([]int, len(original)),  copy(copied, original),  copied[0] = 999  // doesn't affect original,  fmt.Println(original, copied),\n\n  // Nil slice vs empty slice,  var nilSlice []int         // nil, len=0, cap=0,  emptySlice := []int{}      // not nil, len=0, cap=0,  fmt.Println(nilSlice == nil, emptySlice == nil),}"
                  }
        ],
        tips: [
                  "Slicing shares the backing array — modifications affect all slices over it.",
                  "append() may reallocate if capacity is exceeded; assign the result: slice = append(slice, val)",
                  "Use copy() for deep copying when you need independent data.",
                  "Slice header is (ptr, len, cap) — small, efficient to pass around."
        ],
        mistake: "Assuming append() always modifies the slice in-place — it may reallocate. Always assign: s = append(s, val).",
        shorthand: {
          verbose: "s := []int{1, 2, 3}\nappend(s, 4)  // result discarded!\nfmt.Println(s)  // [1 2 3]",
          concise: "s := []int{1, 2, 3}\ns = append(s, 4)  // must reassign\nfmt.Println(s)    // [1 2 3 4]",
        },
      },
      {
        id: "maps",
        fn: "Maps",
        desc: "Unordered key-value collections. Maps are reference types and must be initialized with make() or a literal.",
        category: "Collections",
        subtitle: "Hash maps and key-value lookups",
        signature: "map[KeyType]ValueType  |  make(map[KeyType]ValueType)",
        descLong: "Maps store key-value pairs and are unordered (iteration order is random). Keys must be comparable (support ==). Maps must be initialized with make() or a literal before use — nil maps are read-only. Access (m[key]) returns the value and a bool (ok) indicating presence. Delete with delete(m, key). Maps are reference types — sharing via assignment shares the underlying data structure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maps — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\nfunc main() {\n  // Map literal\n  ages := map[string]int{\n    \"Alice\": 30,\n    \"Bob\":   25,\n    \"Charlie\": 35,\n  }\n  fmt.Println(ages)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maps — common patterns you'll see in production.\n// APPROACH  - Combine Maps with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Access and existence check\n  age, ok := ages[\"Alice\"]\n  if ok {\n    fmt.Printf(\"Alice is %d\\n\", age)\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maps — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Non-existent key returns zero value,  fmt.Println(ages[\"David\"])  // 0,\n\n  // Add/update,  ages[\"David\"] = 40,  ages[\"Alice\"] = 31,  fmt.Println(ages),\n\n  // Delete,  delete(ages, \"Bob\"),  fmt.Println(ages),\n\n  // make with capacity hint,  cache := make(map[string][]byte, 100),\n\n  // Iteration (order is random),  for name, age := range ages {,    fmt.Printf(\"%s: %d\\n\", name, age),  },\n\n  // Keys only,  for name := range ages {,    fmt.Println(name),  },\n\n  // Map of slices,  groups := map[string][]string{,    \"team-a\": {\"Alice\", \"Bob\"},,    \"team-b\": {\"Charlie\", \"David\"},,  },  groups[\"team-a\"] = append(groups[\"team-a\"], \"Eve\"),  fmt.Println(groups),\n\n  // nil map — can read but not write,  var empty map[string]int,  // empty[\"key\"] = 1  // panic: assignment to entry in nil map,  fmt.Println(empty == nil),}"
                  }
        ],
        tips: [
                  "Check existence with _, ok := m[key] before using the value.",
                  "Nil maps can be read (return zero value) but panic on write. Always initialize with make() or a literal.",
                  "Map iteration order is random — never rely on order.",
                  "Keys must be comparable — no slices, functions, or other maps as keys."
        ],
        mistake: "Appending to a map value slice without reassigning — use m[key] = append(m[key], val).",
        shorthand: {
          verbose: "m := make(map[string][]int)\nm[\"nums\"] = []int{1, 2}\ntemp := m[\"nums\"]\ntemp = append(temp, 3)\nm[\"nums\"] = temp",
          concise: "m := make(map[string][]int)\nm[\"nums\"] = []int{1, 2}\nm[\"nums\"] = append(m[\"nums\"], 3)",
        },
      },
      {
        id: "blank-identifier",
        fn: "Blank Identifier _",
        desc: "The blank identifier discards values, imports, or satisfies unused variable constraints.",
        category: "Variables & Types",
        subtitle: "Intentional variable discard",
        signature: "_ = value  |  _, err := func()  |  import _ \"package\"",
        descLong: "The blank identifier _ tells the compiler to ignore a value. Use it to discard return values, suppress unused variable errors, or sideload package initialization (import _ \"package\"). The blank identifier is not a real variable — each _ is independent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Blank Identifier _ — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Blank Identifier _ — common patterns you'll see in production.\n// APPROACH  - Combine Blank Identifier _ with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Discard unwanted return values\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, fmt.Errorf(\"division by zero\")\n  }\n  return a / b, nil\n}\n\nfunc main() {\n  // Ignore the error\n  result, _ := divide(10, 2)\n  fmt.Println(result)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Blank Identifier _ — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Ignore the value,  _, err := divide(10, 0),  if err != nil {,    log.Fatal(err),  },\n\n  // Multiple blanks — each is independent,  _, _, third := 1, 2, 3,  fmt.Println(third),\n\n  // Blank in range — skip iteration variable,  numbers := []int{1, 2, 3, 4},  for _, n := range numbers {,    if n%2 == 0 {,      fmt.Println(n),    },  },\n\n  // Compile-time interface check,  var _ fmt.Stringer = MyType{},},,type MyType struct{},func (MyType) String() string { return \"mytype\" }"
                  }
        ],
        tips: [
                  "Each blank identifier is distinct — _ = a; _ = b has no shadowing issues.",
                  "Blank in for loops is idiomatic — don't use a dummy variable like i = 0.",
                  "Use _ for the first return value only when the error case is handled elsewhere.",
                  "import _ \"package\" runs package init() without using any exports — useful for side effects (database drivers)."
        ],
        mistake: "Ignoring all errors: _, _ := risky() — use explicit error checking. Blank identifier is for intentional discard, not error suppression.",
        shorthand: {
          verbose: "result1, _ := f1()\nresult2, _ := f2()\nif result1 == nil || result2 == nil {\n  log.Fatal(\"missing result\")\n}\nuse(result1, result2)",
          concise: "r1, _ := f1(); r2, _ := f2()\nuse(r1, r2)  // When intentionally discarding is clear",
        },
      },
      {
        id: "type-assertions",
        fn: "Type Assertions",
        desc: "Extract a concrete type from an interface value with x.(Type) or x.(Type) safely with the comma-ok form.",
        category: "Interfaces",
        subtitle: "Runtime type extraction from interface{}",
        signature: "x.(Type)  |  val, ok := x.(Type)",
        descLong: "Type assertions extract a concrete value from an interface. The single-value form panics if the type doesn't match; the two-value form (comma-ok) returns (value, false) on mismatch — idiomatic. Only use single-value assertions when you're certain of the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\nfunc main() {\n  var x interface{} = \"hello\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Assertions — common patterns you'll see in production.\n// APPROACH  - Combine Type Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Single value — panics if type is wrong\n  s := x.(string)\n  fmt.Println(s)  // \"hello\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Comma-ok — safe, idiomatic,  str, ok := x.(string),  if ok {,    fmt.Println(\"string:\", str),  },,  num, ok := x.(int),  if ok {,    fmt.Println(\"int:\", num),  } else {,    fmt.Println(\"not an int\"),  },\n\n  // Type assertion in a switch,  processValue(x),  processValue(42),  processValue(3.14),},,func processValue(x interface{}) {,  switch v := x.(type) {,  case string:,    fmt.Printf(\"string: %s (len=%d),\", v, len(v)),  case int:,    fmt.Printf(\"int: %d (doubled=%d),\", v, v*2),  case float64:,    fmt.Printf(\"float: %.2f (doubled=%.2f),\", v, v*2),  case nil:,    fmt.Println(\"nil value\"),  default:,    fmt.Printf(\"unknown type: %T,\", x),  },},\n\n// Safe type assertion helper,func toString(x interface{}) (string, error) {,  s, ok := x.(string),  if !ok {,    return \"\", fmt.Errorf(\"expected string, got %T\", x),  },  return s, nil,}"
                  }
        ],
        tips: [
                  "Always use comma-ok form for type assertions: val, ok := x.(T) — single-value form panics.",
                  "Type switches (x.(type)) are cleaner than chained type assertions.",
                  "x.(type) only works inside a switch — it returns only a single value (no comma-ok).",
                  "Type assertions extract the dynamic type, not the static type — interface{} needs runtime dispatch."
        ],
        mistake: "Using single-value assertions without certainty: x.(string) panics if x is not a string. Use comma-ok or switch for runtime safety.",
        shorthand: {
          verbose: "var i interface{} = \"hello\"\ns := i.(string)  // panics if i is not string\nfmt.Println(s)",
          concise: "s, ok := i.(string)\nif !ok { return err }\nfmt.Println(s)  // safe type extraction",
        },
      },
      {
        id: "pointers-dereferencing",
        fn: "Pointers & Dereferencing",
        desc: "Pointers hold memory addresses. Use & to take address, * to dereference, and auto-dereference in method calls.",
        category: "Variables & Types",
        subtitle: "Memory addresses and pointer operations",
        signature: "var p *T = &v  |  val := *p  |  p.field (auto-deref)",
        descLong: "Pointers store memory addresses. Take the address with & (addr-of), dereference with * (value-of). Go auto-dereferences pointers in method calls (p.method() is valid even if p is a pointer). Nil pointers are valid values that represent \"no address\"; dereferencing nil panics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pointers & Dereferencing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\ntype User struct {\n  Name  string\n  Email string\n}\n\nfunc main() {\n  // Create value and pointer\n  u := User{Name: \"Alice\", Email: \"alice@example.com\"}\n  p := &u  // address-of operator"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pointers & Dereferencing — common patterns you'll see in production.\n// APPROACH  - Combine Pointers & Dereferencing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Dereference\n  fmt.Println(*p)  // {Alice alice@example.com}\n  (*p).Name = \"Bob\"  // explicit dereference"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pointers & Dereferencing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Auto-dereference in method calls,  p.Email = \"bob@example.com\"  // equivalent to (*p).Email,  fmt.Println(u.Email)  // bob@example.com,\n\n  // Pointer to new allocation,  userPtr := &User{Name: \"Charlie\"},  fmt.Println(userPtr.Name),\n\n  // Nil pointers,  var nilPtr *User,  if nilPtr == nil {,    fmt.Println(\"pointer is nil\"),  },  // nilPtr.Name  // panic: nil pointer dereference,\n\n  // Pointer parameters allow mutation,  update(&u),  fmt.Println(u.Name)  // Updated,\n\n  // Pointer comparison,  p1 := &u,  p2 := &u,  fmt.Println(p1 == p2)  // true — same address,,  u2 := User{Name: \"Alice\"},  p3 := &u2,  fmt.Println(p1 == p3)  // false — different addresses,},\n\n// Pointer receiver — can mutate,func (u *User) UpdateName(name string) {,  u.Name = name,},\n\n// Function with pointer parameter,func update(u *User) {,  u.Name = \"Updated\",},\n\n// Compare pointers by value,func isSameUser(p1, p2 *User) bool {,  return p1 == p2  // true iff pointing to the same object,}"
                  }
        ],
        tips: [
                  "Go auto-dereferences pointers in method calls — p.field is equivalent to (*p).field.",
                  "Taking the address of a literal: &User{} — creates a heap-allocated value.",
                  "Use pointers for large structs or when mutation is needed; values for small, immutable types.",
                  "Dereferencing a nil pointer panics — always check p != nil before dereferencing."
        ],
        mistake: "Copying a pointer value and expecting independent data — *p1 and *p2 pointing to the same address share mutations. Copy the value, not the pointer.",
        shorthand: {
          verbose: "var p *int = &x\nvar p2 *int = p\n*p2 = 100  // also changes *p\nfmt.Println(*p, *p2)  // both 100",
          concise: "p := &x; p2 := p\n*p2 = 100  // Both reference same value",
        },
      },
      {
        id: "make-vs-new",
        fn: "make vs new",
        desc: "new allocates zeroed memory and returns a pointer. make initializes slices, maps, and channels with ready-to-use internal structures.",
        category: "Memory & Allocation",
        subtitle: "Allocation primitives for different types",
        signature: "new(T) *T  |  make([]T, len, cap)  |  make(map[K]V)  |  make(chan T)",
        descLong: "new(T) allocates zeroed memory and returns *T — works on any type. make(T) initializes slices, maps, and channels with their internal data structures ready to use. Only slices, maps, and channels can use make. For structs, use &T{} or new(T).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of make vs new — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\ntype Config struct {\n  Timeout int\n  Retries int\n}\n\nfunc main() {\n  // new allocates and zeros, returns pointer\n  cfg := new(Config)  // all fields zero-initialized\n  cfg.Timeout = 30\n  fmt.Println(*cfg)  // {30 0}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of make vs new — common patterns you'll see in production.\n// APPROACH  - Combine make vs new with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Equivalent to &Config{}\n  cfg2 := &Config{}\n  fmt.Println(cfg == cfg2)  // false — different addresses"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of make vs new — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// new with built-in types,  intPtr := new(int),  *intPtr = 42,  fmt.Println(*intPtr),\n\n  // make for slices — preallocated,  slice1 := make([]int, 3)           // len=3, cap=3,  slice2 := make([]int, 3, 10)       // len=3, cap=10,  slice3 := []int{}                  // empty, same as make([]int, 0),,  fmt.Println(len(slice1), cap(slice1))  // 3 3,  fmt.Println(len(slice2), cap(slice2))  // 3 10,\n\n  // make for maps — ready to receive keys,  m1 := make(map[string]int)       // empty map,  m2 := make(map[string]int, 100)  // hint capacity 100,  m3 := map[string]int{}           // equivalent to m1,  m1[\"a\"] = 1,  fmt.Println(m1),\n\n  // make for channels — ready to send/receive,  ch1 := make(chan int)       // unbuffered,  ch2 := make(chan int, 5)    // buffered, cap 5,  go func() {,    ch2 <- 10,  }(),  fmt.Println(<-ch2),\n\n  // new on slice — rarely used, creates *[]T not []T,  slicePtr := new([]int),  *slicePtr = append(*slicePtr, 1, 2, 3)  // awkward,  fmt.Println(*slicePtr),\n\n  // Proper way — use make directly,  properSlice := make([]int, 0, 10),  properSlice = append(properSlice, 1, 2, 3),  fmt.Println(properSlice),}"
                  }
        ],
        tips: [
                  "Use make for slices, maps, and channels — never use new for these.",
                  "Use &T{} for struct allocation — cleaner and idiomatic than new(T).",
                  "Pre-allocate slices with make([]T, 0, cap) to avoid repeated reallocations.",
                  "make with two args for maps (capacity hint) helps avoid resizing in tight loops."
        ],
        mistake: "Using new([]T) expecting a slice — new returns a pointer to a zero slice (*[]T), not a usable slice. Use make([]T, len, cap) instead.",
        shorthand: {
          verbose: "var m map[string]int\nm[\"key\"] = 1  // panic: assignment to nil map\nvar ch chan int\n<-ch  // deadlock: nil channel blocks",
          concise: "m := make(map[string]int)\nm[\"key\"] = 1  // initialized\nch := make(chan int)  // Ready to use",
        },
      },
      {
        id: "range-gotchas",
        fn: "Range Loop Gotchas",
        desc: "Understanding range semantics — loop variable capture, modifying collections, and nil channels.",
        category: "Control Flow",
        subtitle: "Common pitfalls with range loops",
        signature: "for i, v := range collection { }",
        descLong: "Range loops have subtle gotchas: loop variables are reused (capture by value in closures), modifying during iteration is unsafe, and range on nil slices/maps is allowed (but returns zero iterations). Always understand whether you're ranging over a copy or the original collection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Range Loop Gotchas — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)\n\nfunc main() {\n  // Gotcha 1: Loop variable capture\n  numbers := []int{1, 2, 3}\n  var funcs []func()\n\n  for _, n := range numbers {\n    funcs = append(funcs, func() {\n      fmt.Println(n)  // n is captured, not copied\n    })\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Range Loop Gotchas — common patterns you'll see in production.\n// APPROACH  - Combine Range Loop Gotchas with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// All print 3 (final value of n)\n  for _, f := range funcs {\n    f()\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Range Loop Gotchas — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fix: capture by value,  var fixedFuncs []func(),  for _, n := range numbers {,    n := n  // capture current n by value,    fixedFuncs = append(fixedFuncs, func() {,      fmt.Println(n)  // prints 1, 2, 3 correctly,    }),  },,  fmt.Println(\"Fixed version:\"),  for _, f := range fixedFuncs {,    f(),  },\n\n  // Gotcha 2: Modifying slice during range,  items := []int{1, 2, 3},  for _, item := range items {,    if item == 2 {,      items = append(items, 99)  // UB: may or may not iterate new element,    },    fmt.Println(item),  },\n\n  // Gotcha 3: nil ranges are allowed,  var nilSlice []int,  var nilMap map[string]int,  count := 0,  for range nilSlice {  // zero iterations,    count++,  },  for range nilMap {    // zero iterations,    count++,  },  fmt.Println(\"iterations:\", count)  // 0,\n\n  // Gotcha 4: Range on strings yields runes, not bytes,  s := \"hello\",  for i, ch := range s {,    fmt.Printf(\"%d: %c (type %T),\", i, ch, ch)  // ch is rune,  },\n\n  // Gotcha 5: Maps randomize iteration,  m := map[string]int{\"a\": 1, \"b\": 2, \"c\": 3},  fmt.Println(\"First iteration:\", keysInOrder(m)),  fmt.Println(\"Second iteration:\", keysInOrder(m))  // different order,\n\n  // Gotcha 6: Race condition in concurrent range,  safeChan := make(chan int, 3),  safeChan <- 1,  safeChan <- 2,  safeChan <- 3,  close(safeChan),\n\n  // Safe: channel is thread-safe,  for v := range safeChan {,    fmt.Println(v),  },},,func keysInOrder(m map[string]int) []string {,  var keys []string,  for k := range m {,    keys = append(keys, k),  },  return keys,},\n\n// Correct pattern: capture loop variable in closures,func startWorkers(count int) {,  var wg sync.WaitGroup,  for i := 0; i < count; i++ {,    wg.Add(1),    i := i  // capture i by value,    go func() {,      defer wg.Done(),      fmt.Println(\"worker\", i),    }(),  },  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Capture loop variables by value in closures: n := n before using in func() { }",
                  "Never modify a slice/map during range iteration — behavior is undefined.",
                  "Range on nil collections is safe — it simply iterates zero times.",
                  "Range on strings returns (index, rune) — to iterate bytes, convert to []byte first.",
                  "Map iteration order is randomized — never rely on iteration order."
        ],
        mistake: "Using loop variables directly in goroutines without capture: go func() { use(i) }() — all goroutines see the final i. Always capture: i := i before the func.",
        shorthand: {
          verbose: "for i, v := range items {\n  go func() {\n    fmt.Println(i)  // all see final i\n  }()\n}",
          concise: "for i, v := range items {\n  i := i; v := v\n  go func() { fmt.Println(i) }()  // captured",
        },
      },
      {
        id: "init-functions",
        fn: "init() Functions",
        desc: "Package initialization code run automatically before main() — useful for setup and validation.",
        category: "Functions & Defer",
        subtitle: "Automatic package-level initialization",
        signature: "func init() { ... }",
        descLong: "init() functions run automatically in each package during initialization, before any user code. Multiple init() functions in a package run in source file order. init() is useful for registering plugins, setting up globals, or validating assumptions. init() has no parameters or returns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of init() Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"flag\"\n  \"fmt\"\n  \"log\"\n)\n\nvar (\n  config = loadConfig()  // package-level var\n  logger = log.New(nil, \"\", 0)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of init() Functions — common patterns you'll see in production.\n// APPROACH  - Combine init() Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// First init in source order\nfunc init() {\n  fmt.Println(\"init 1: loading config\")\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of init() Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Multiple init functions allowed,func init() {,  fmt.Println(\"init 2: validating\"),  if config == \"\" {,    log.Fatal(\"config not loaded\"),  },},\n\n// Parse flags in init,func init() {,  flag.Parse(),},,func main() {,  // All inits have run by now,  fmt.Println(\"main() starts\"),  fmt.Println(\"config:\", config),},,func loadConfig() string {,  // Called during var initialization, before any init(),  return \"production\",},\n\n// Package registration pattern,type Handler func() error,,var handlers = make(map[string]Handler),,func RegisterHandler(name string, h Handler) {,  handlers[name] = h,},,func init() {,  // Register built-in handlers,  RegisterHandler(\"default\", func() error {,    fmt.Println(\"default handler\"),    return nil,  }),},\n\n// Another package might do:,// func init() {,//   RegisterHandler(\"custom\", customHandler),// }"
                  }
        ],
        tips: [
                  "init() runs before main() — useful for one-time setup.",
                  "Multiple init() functions are allowed; they run in source file order.",
                  "init() cannot be called explicitly — it's automatic.",
                  "Use blank imports (import _ \"package\") to run another package's init() without using its exports.",
                  "Avoid complex logic in init() — it makes startup time unpredictable and errors hard to trace."
        ],
        mistake: "Assuming init() executes in a specific order across packages — order is undefined. Keep init() simple and don't depend on side effects from other packages.",
        shorthand: {
          verbose: "func init() {\n  db := connectDB()\n  setupRoutes(db)\n  loadCache()\n  validateConfig()\n}",
          concise: "func init() {\n  sql.Register(\"mysql\", &mysql.Driver{})\n}  // Single responsibility per init",
        },
      },
      {
        id: "blank-identifier",
        fn: "Blank Identifier _",
        desc: "The blank identifier discards values, imports, or satisfies unused variable constraints.",
        category: "Variables & Types",
        subtitle: "Intentional variable discard",
        signature: "_ = value  |  _, err := func()  |  import _ \"package\"",
        descLong: "The blank identifier _ tells the compiler to ignore a value. Use it to discard return values, suppress unused variable errors, or sideload package initialization (import _ \"package\"). The blank identifier is not a real variable — each _ is independent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Blank Identifier _ — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Blank Identifier _ — common patterns you'll see in production.\n// APPROACH  - Combine Blank Identifier _ with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Discard unwanted return values\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, fmt.Errorf(\"division by zero\")\n  }\n  return a / b, nil\n}\n\nfunc main() {\n  // Ignore the error\n  result, _ := divide(10, 2)\n  fmt.Println(result)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Blank Identifier _ — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Ignore the value,  _, err := divide(10, 0),  if err != nil {,    log.Fatal(err),  },\n\n  // Multiple blanks — each is independent,  _, _, third := 1, 2, 3,  fmt.Println(third),\n\n  // Blank in range — skip iteration variable,  numbers := []int{1, 2, 3, 4},  for _, n := range numbers {,    if n%2 == 0 {,      fmt.Println(n),    },  },\n\n  // Compile-time interface check,  var _ fmt.Stringer = MyType{},},,type MyType struct{},func (MyType) String() string { return \"mytype\" }"
                  }
        ],
        tips: [
                  "Each blank identifier is distinct — _ = a; _ = b has no shadowing issues.",
                  "Blank in for loops is idiomatic — don't use a dummy variable like i = 0.",
                  "Use _ for the first return value only when the error case is handled elsewhere.",
                  "import _ \"package\" runs package init() without using any exports — useful for side effects (database drivers)."
        ],
        mistake: "Ignoring all errors: _, _ := risky() — use explicit error checking. Blank identifier is for intentional discard, not error suppression.",
        shorthand: {
          verbose: "result1, _ := f1()\nresult2, _ := f2()\nif result1 == nil || result2 == nil {\n  log.Fatal(\"missing result\")\n}\nuse(result1, result2)",
          concise: "r1, _ := f1(); r2, _ := f2()\nuse(r1, r2)  // When intentionally discarding is clear",
        },
      },
      {
        id: "type-assertions",
        fn: "Type Assertions",
        desc: "Extract a concrete type from an interface value with x.(Type) or x.(Type) safely with the comma-ok form.",
        category: "Interfaces",
        subtitle: "Runtime type extraction from interface{}",
        signature: "x.(Type)  |  val, ok := x.(Type)",
        descLong: "Type assertions extract a concrete value from an interface. The single-value form panics if the type doesn't match; the two-value form (comma-ok) returns (value, false) on mismatch — idiomatic. Only use single-value assertions when you're certain of the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\nfunc main() {\n  var x interface{} = \"hello\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Assertions — common patterns you'll see in production.\n// APPROACH  - Combine Type Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Single value — panics if type is wrong\n  s := x.(string)\n  fmt.Println(s)  // \"hello\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Comma-ok — safe, idiomatic,  str, ok := x.(string),  if ok {,    fmt.Println(\"string:\", str),  },,  num, ok := x.(int),  if ok {,    fmt.Println(\"int:\", num),  } else {,    fmt.Println(\"not an int\"),  },\n\n  // Type assertion in a switch,  processValue(x),  processValue(42),  processValue(3.14),},,func processValue(x interface{}) {,  switch v := x.(type) {,  case string:,    fmt.Printf(\"string: %s (len=%d),\", v, len(v)),  case int:,    fmt.Printf(\"int: %d (doubled=%d),\", v, v*2),  case float64:,    fmt.Printf(\"float: %.2f (doubled=%.2f),\", v, v*2),  case nil:,    fmt.Println(\"nil value\"),  default:,    fmt.Printf(\"unknown type: %T,\", x),  },},\n\n// Safe type assertion helper,func toString(x interface{}) (string, error) {,  s, ok := x.(string),  if !ok {,    return \"\", fmt.Errorf(\"expected string, got %T\", x),  },  return s, nil,}"
                  }
        ],
        tips: [
                  "Always use comma-ok form for type assertions: val, ok := x.(T) — single-value form panics.",
                  "Type switches (x.(type)) are cleaner than chained type assertions.",
                  "x.(type) only works inside a switch — it returns only a single value (no comma-ok).",
                  "Type assertions extract the dynamic type, not the static type — interface{} needs runtime dispatch."
        ],
        mistake: "Using single-value assertions without certainty: x.(string) panics if x is not a string. Use comma-ok or switch for runtime safety.",
        shorthand: {
          verbose: "var i interface{} = \"hello\"\ns := i.(string)  // panics if i is not string\nfmt.Println(s)",
          concise: "s, ok := i.(string)\nif !ok { return err }\nfmt.Println(s)  // safe type extraction",
        },
      },
      {
        id: "pointers-dereferencing",
        fn: "Pointers & Dereferencing",
        desc: "Pointers hold memory addresses. Use & to take address, * to dereference, and auto-dereference in method calls.",
        category: "Variables & Types",
        subtitle: "Memory addresses and pointer operations",
        signature: "var p *T = &v  |  val := *p  |  p.field (auto-deref)",
        descLong: "Pointers store memory addresses. Take the address with & (addr-of), dereference with * (value-of). Go auto-dereferences pointers in method calls (p.method() is valid even if p is a pointer). Nil pointers are valid values that represent \"no address\"; dereferencing nil panics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pointers & Dereferencing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\ntype User struct {\n  Name  string\n  Email string\n}\n\nfunc main() {\n  // Create value and pointer\n  u := User{Name: \"Alice\", Email: \"alice@example.com\"}\n  p := &u  // address-of operator"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pointers & Dereferencing — common patterns you'll see in production.\n// APPROACH  - Combine Pointers & Dereferencing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Dereference\n  fmt.Println(*p)  // {Alice alice@example.com}\n  (*p).Name = \"Bob\"  // explicit dereference"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pointers & Dereferencing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Auto-dereference in method calls,  p.Email = \"bob@example.com\"  // equivalent to (*p).Email,  fmt.Println(u.Email)  // bob@example.com,\n\n  // Pointer to new allocation,  userPtr := &User{Name: \"Charlie\"},  fmt.Println(userPtr.Name),\n\n  // Nil pointers,  var nilPtr *User,  if nilPtr == nil {,    fmt.Println(\"pointer is nil\"),  },  // nilPtr.Name  // panic: nil pointer dereference,\n\n  // Pointer parameters allow mutation,  update(&u),  fmt.Println(u.Name)  // Updated,\n\n  // Pointer comparison,  p1 := &u,  p2 := &u,  fmt.Println(p1 == p2)  // true — same address,,  u2 := User{Name: \"Alice\"},  p3 := &u2,  fmt.Println(p1 == p3)  // false — different addresses,},\n\n// Pointer receiver — can mutate,func (u *User) UpdateName(name string) {,  u.Name = name,},\n\n// Function with pointer parameter,func update(u *User) {,  u.Name = \"Updated\",},\n\n// Compare pointers by value,func isSameUser(p1, p2 *User) bool {,  return p1 == p2  // true iff pointing to the same object,}"
                  }
        ],
        tips: [
                  "Go auto-dereferences pointers in method calls — p.field is equivalent to (*p).field.",
                  "Taking the address of a literal: &User{} — creates a heap-allocated value.",
                  "Use pointers for large structs or when mutation is needed; values for small, immutable types.",
                  "Dereferencing a nil pointer panics — always check p != nil before dereferencing."
        ],
        mistake: "Copying a pointer value and expecting independent data — *p1 and *p2 pointing to the same address share mutations. Copy the value, not the pointer.",
        shorthand: {
          verbose: "var p *int = &x\nvar p2 *int = p\n*p2 = 100  // also changes *p\nfmt.Println(*p, *p2)  // both 100",
          concise: "p := &x; p2 := p\n*p2 = 100  // Both reference same value",
        },
      },
      {
        id: "make-vs-new",
        fn: "make vs new",
        desc: "new allocates zeroed memory and returns a pointer. make initializes slices, maps, and channels with ready-to-use internal structures.",
        category: "Memory & Allocation",
        subtitle: "Allocation primitives for different types",
        signature: "new(T) *T  |  make([]T, len, cap)  |  make(map[K]V)  |  make(chan T)",
        descLong: "new(T) allocates zeroed memory and returns *T — works on any type. make(T) initializes slices, maps, and channels with their internal data structures ready to use. Only slices, maps, and channels can use make. For structs, use &T{} or new(T).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of make vs new — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\ntype Config struct {\n  Timeout int\n  Retries int\n}\n\nfunc main() {\n  // new allocates and zeros, returns pointer\n  cfg := new(Config)  // all fields zero-initialized\n  cfg.Timeout = 30\n  fmt.Println(*cfg)  // {30 0}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of make vs new — common patterns you'll see in production.\n// APPROACH  - Combine make vs new with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Equivalent to &Config{}\n  cfg2 := &Config{}\n  fmt.Println(cfg == cfg2)  // false — different addresses"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of make vs new — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// new with built-in types,  intPtr := new(int),  *intPtr = 42,  fmt.Println(*intPtr),\n\n  // make for slices — preallocated,  slice1 := make([]int, 3)           // len=3, cap=3,  slice2 := make([]int, 3, 10)       // len=3, cap=10,  slice3 := []int{}                  // empty, same as make([]int, 0),,  fmt.Println(len(slice1), cap(slice1))  // 3 3,  fmt.Println(len(slice2), cap(slice2))  // 3 10,\n\n  // make for maps — ready to receive keys,  m1 := make(map[string]int)       // empty map,  m2 := make(map[string]int, 100)  // hint capacity 100,  m3 := map[string]int{}           // equivalent to m1,  m1[\"a\"] = 1,  fmt.Println(m1),\n\n  // make for channels — ready to send/receive,  ch1 := make(chan int)       // unbuffered,  ch2 := make(chan int, 5)    // buffered, cap 5,  go func() {,    ch2 <- 10,  }(),  fmt.Println(<-ch2),\n\n  // new on slice — rarely used, creates *[]T not []T,  slicePtr := new([]int),  *slicePtr = append(*slicePtr, 1, 2, 3)  // awkward,  fmt.Println(*slicePtr),\n\n  // Proper way — use make directly,  properSlice := make([]int, 0, 10),  properSlice = append(properSlice, 1, 2, 3),  fmt.Println(properSlice),}"
                  }
        ],
        tips: [
                  "Use make for slices, maps, and channels — never use new for these.",
                  "Use &T{} for struct allocation — cleaner and idiomatic than new(T).",
                  "Pre-allocate slices with make([]T, 0, cap) to avoid repeated reallocations.",
                  "make with two args for maps (capacity hint) helps avoid resizing in tight loops."
        ],
        mistake: "Using new([]T) expecting a slice — new returns a pointer to a zero slice (*[]T), not a usable slice. Use make([]T, len, cap) instead.",
        shorthand: {
          verbose: "var m map[string]int\nm[\"key\"] = 1  // panic: assignment to nil map\nvar ch chan int\n<-ch  // deadlock: nil channel blocks",
          concise: "m := make(map[string]int)\nm[\"key\"] = 1  // initialized\nch := make(chan int)  // Ready to use",
        },
      },
      {
        id: "range-gotchas",
        fn: "Range Loop Gotchas",
        desc: "Understanding range semantics — loop variable capture, modifying collections, and nil channels.",
        category: "Control Flow",
        subtitle: "Common pitfalls with range loops",
        signature: "for i, v := range collection { }",
        descLong: "Range loops have subtle gotchas: loop variables are reused (capture by value in closures), modifying during iteration is unsafe, and range on nil slices/maps is allowed (but returns zero iterations). Always understand whether you're ranging over a copy or the original collection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Range Loop Gotchas — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)\n\nfunc main() {\n  // Gotcha 1: Loop variable capture\n  numbers := []int{1, 2, 3}\n  var funcs []func()\n\n  for _, n := range numbers {\n    funcs = append(funcs, func() {\n      fmt.Println(n)  // n is captured, not copied\n    })\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Range Loop Gotchas — common patterns you'll see in production.\n// APPROACH  - Combine Range Loop Gotchas with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// All print 3 (final value of n)\n  for _, f := range funcs {\n    f()\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Range Loop Gotchas — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fix: capture by value,  var fixedFuncs []func(),  for _, n := range numbers {,    n := n  // capture current n by value,    fixedFuncs = append(fixedFuncs, func() {,      fmt.Println(n)  // prints 1, 2, 3 correctly,    }),  },,  fmt.Println(\"Fixed version:\"),  for _, f := range fixedFuncs {,    f(),  },\n\n  // Gotcha 2: Modifying slice during range,  items := []int{1, 2, 3},  for _, item := range items {,    if item == 2 {,      items = append(items, 99)  // UB: may or may not iterate new element,    },    fmt.Println(item),  },\n\n  // Gotcha 3: nil ranges are allowed,  var nilSlice []int,  var nilMap map[string]int,  count := 0,  for range nilSlice {  // zero iterations,    count++,  },  for range nilMap {    // zero iterations,    count++,  },  fmt.Println(\"iterations:\", count)  // 0,\n\n  // Gotcha 4: Range on strings yields runes, not bytes,  s := \"hello\",  for i, ch := range s {,    fmt.Printf(\"%d: %c (type %T),\", i, ch, ch)  // ch is rune,  },\n\n  // Gotcha 5: Maps randomize iteration,  m := map[string]int{\"a\": 1, \"b\": 2, \"c\": 3},  fmt.Println(\"First iteration:\", keysInOrder(m)),  fmt.Println(\"Second iteration:\", keysInOrder(m))  // different order,\n\n  // Gotcha 6: Race condition in concurrent range,  safeChan := make(chan int, 3),  safeChan <- 1,  safeChan <- 2,  safeChan <- 3,  close(safeChan),\n\n  // Safe: channel is thread-safe,  for v := range safeChan {,    fmt.Println(v),  },},,func keysInOrder(m map[string]int) []string {,  var keys []string,  for k := range m {,    keys = append(keys, k),  },  return keys,},\n\n// Correct pattern: capture loop variable in closures,func startWorkers(count int) {,  var wg sync.WaitGroup,  for i := 0; i < count; i++ {,    wg.Add(1),    i := i  // capture i by value,    go func() {,      defer wg.Done(),      fmt.Println(\"worker\", i),    }(),  },  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Capture loop variables by value in closures: n := n before using in func() { }",
                  "Never modify a slice/map during range iteration — behavior is undefined.",
                  "Range on nil collections is safe — it simply iterates zero times.",
                  "Range on strings returns (index, rune) — to iterate bytes, convert to []byte first.",
                  "Map iteration order is randomized — never rely on iteration order."
        ],
        mistake: "Using loop variables directly in goroutines without capture: go func() { use(i) }() — all goroutines see the final i. Always capture: i := i before the func.",
        shorthand: {
          verbose: "for i, v := range items {\n  go func() {\n    fmt.Println(i)  // all see final i\n  }()\n}",
          concise: "for i, v := range items {\n  i := i; v := v\n  go func() { fmt.Println(i) }()  // captured",
        },
      },
      {
        id: "init-functions",
        fn: "init() Functions",
        desc: "Package initialization code run automatically before main() — useful for setup and validation.",
        category: "Functions & Defer",
        subtitle: "Automatic package-level initialization",
        signature: "func init() { ... }",
        descLong: "init() functions run automatically in each package during initialization, before any user code. Multiple init() functions in a package run in source file order. init() is useful for registering plugins, setting up globals, or validating assumptions. init() has no parameters or returns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of init() Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"flag\"\n  \"fmt\"\n  \"log\"\n)\n\nvar (\n  config = loadConfig()  // package-level var\n  logger = log.New(nil, \"\", 0)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of init() Functions — common patterns you'll see in production.\n// APPROACH  - Combine init() Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// First init in source order\nfunc init() {\n  fmt.Println(\"init 1: loading config\")\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of init() Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Multiple init functions allowed,func init() {,  fmt.Println(\"init 2: validating\"),  if config == \"\" {,    log.Fatal(\"config not loaded\"),  },},\n\n// Parse flags in init,func init() {,  flag.Parse(),},,func main() {,  // All inits have run by now,  fmt.Println(\"main() starts\"),  fmt.Println(\"config:\", config),},,func loadConfig() string {,  // Called during var initialization, before any init(),  return \"production\",},\n\n// Package registration pattern,type Handler func() error,,var handlers = make(map[string]Handler),,func RegisterHandler(name string, h Handler) {,  handlers[name] = h,},,func init() {,  // Register built-in handlers,  RegisterHandler(\"default\", func() error {,    fmt.Println(\"default handler\"),    return nil,  }),},\n\n// Another package might do:,// func init() {,//   RegisterHandler(\"custom\", customHandler),// }"
                  }
        ],
        tips: [
                  "init() runs before main() — useful for one-time setup.",
                  "Multiple init() functions are allowed; they run in source file order.",
                  "init() cannot be called explicitly — it's automatic.",
                  "Use blank imports (import _ \"package\") to run another package's init() without using its exports.",
                  "Avoid complex logic in init() — it makes startup time unpredictable and errors hard to trace."
        ],
        mistake: "Assuming init() executes in a specific order across packages — order is undefined. Keep init() simple and don't depend on side effects from other packages.",
        shorthand: {
          verbose: "func init() {\n  db := connectDB()\n  setupRoutes(db)\n  loadCache()\n  validateConfig()\n}",
          concise: "func init() {\n  sql.Register(\"mysql\", &mysql.Driver{})\n}  // Single responsibility per init",
        },
      },
      {
        id: "blank-identifier",
        fn: "Blank Identifier _",
        desc: "The blank identifier discards values, imports, or satisfies unused variable constraints.",
        category: "Variables & Types",
        subtitle: "Intentional variable discard",
        signature: "_ = value  |  _, err := func()  |  import _ \"package\"",
        descLong: "The blank identifier _ tells the compiler to ignore a value. Use it to discard return values, suppress unused variable errors, or sideload package initialization (import _ \"package\"). The blank identifier is not a real variable — each _ is independent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Blank Identifier _ — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Blank Identifier _ — common patterns you'll see in production.\n// APPROACH  - Combine Blank Identifier _ with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Discard unwanted return values\nfunc divide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, fmt.Errorf(\"division by zero\")\n  }\n  return a / b, nil\n}\n\nfunc main() {\n  // Ignore the error\n  result, _ := divide(10, 2)\n  fmt.Println(result)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Blank Identifier _ — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Ignore the value,  _, err := divide(10, 0),  if err != nil {,    log.Fatal(err),  },\n\n  // Multiple blanks — each is independent,  _, _, third := 1, 2, 3,  fmt.Println(third),\n\n  // Blank in range — skip iteration variable,  numbers := []int{1, 2, 3, 4},  for _, n := range numbers {,    if n%2 == 0 {,      fmt.Println(n),    },  },\n\n  // Compile-time interface check,  var _ fmt.Stringer = MyType{},},,type MyType struct{},func (MyType) String() string { return \"mytype\" }"
                  }
        ],
        tips: [
                  "Each blank identifier is distinct — _ = a; _ = b has no shadowing issues.",
                  "Blank in for loops is idiomatic — don't use a dummy variable like i = 0.",
                  "Use _ for the first return value only when the error case is handled elsewhere.",
                  "import _ \"package\" runs package init() without using any exports — useful for side effects (database drivers)."
        ],
        mistake: "Ignoring all errors: _, _ := risky() — use explicit error checking. Blank identifier is for intentional discard, not error suppression.",
        shorthand: {
          verbose: "result1, _ := f1()\nresult2, _ := f2()\nif result1 == nil || result2 == nil {\n  log.Fatal(\"missing result\")\n}\nuse(result1, result2)",
          concise: "r1, _ := f1(); r2, _ := f2()\nuse(r1, r2)  // When intentionally discarding is clear",
        },
      },
      {
        id: "type-assertions",
        fn: "Type Assertions",
        desc: "Extract a concrete type from an interface value with x.(Type) or x.(Type) safely with the comma-ok form.",
        category: "Interfaces",
        subtitle: "Runtime type extraction from interface{}",
        signature: "x.(Type)  |  val, ok := x.(Type)",
        descLong: "Type assertions extract a concrete value from an interface. The single-value form panics if the type doesn't match; the two-value form (comma-ok) returns (value, false) on mismatch — idiomatic. Only use single-value assertions when you're certain of the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\nfunc main() {\n  var x interface{} = \"hello\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Assertions — common patterns you'll see in production.\n// APPROACH  - Combine Type Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Single value — panics if type is wrong\n  s := x.(string)\n  fmt.Println(s)  // \"hello\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Comma-ok — safe, idiomatic,  str, ok := x.(string),  if ok {,    fmt.Println(\"string:\", str),  },,  num, ok := x.(int),  if ok {,    fmt.Println(\"int:\", num),  } else {,    fmt.Println(\"not an int\"),  },\n\n  // Type assertion in a switch,  processValue(x),  processValue(42),  processValue(3.14),},,func processValue(x interface{}) {,  switch v := x.(type) {,  case string:,    fmt.Printf(\"string: %s (len=%d),\", v, len(v)),  case int:,    fmt.Printf(\"int: %d (doubled=%d),\", v, v*2),  case float64:,    fmt.Printf(\"float: %.2f (doubled=%.2f),\", v, v*2),  case nil:,    fmt.Println(\"nil value\"),  default:,    fmt.Printf(\"unknown type: %T,\", x),  },},\n\n// Safe type assertion helper,func toString(x interface{}) (string, error) {,  s, ok := x.(string),  if !ok {,    return \"\", fmt.Errorf(\"expected string, got %T\", x),  },  return s, nil,}"
                  }
        ],
        tips: [
                  "Always use comma-ok form for type assertions: val, ok := x.(T) — single-value form panics.",
                  "Type switches (x.(type)) are cleaner than chained type assertions.",
                  "x.(type) only works inside a switch — it returns only a single value (no comma-ok).",
                  "Type assertions extract the dynamic type, not the static type — interface{} needs runtime dispatch."
        ],
        mistake: "Using single-value assertions without certainty: x.(string) panics if x is not a string. Use comma-ok or switch for runtime safety.",
        shorthand: {
          verbose: "var i interface{} = \"hello\"\ns := i.(string)  // panics if i is not string\nfmt.Println(s)",
          concise: "s, ok := i.(string)\nif !ok { return err }\nfmt.Println(s)  // safe type extraction",
        },
      },
      {
        id: "pointers-dereferencing",
        fn: "Pointers & Dereferencing",
        desc: "Pointers hold memory addresses. Use & to take address, * to dereference, and auto-dereference in method calls.",
        category: "Variables & Types",
        subtitle: "Memory addresses and pointer operations",
        signature: "var p *T = &v  |  val := *p  |  p.field (auto-deref)",
        descLong: "Pointers store memory addresses. Take the address with & (addr-of), dereference with * (value-of). Go auto-dereferences pointers in method calls (p.method() is valid even if p is a pointer). Nil pointers are valid values that represent \"no address\"; dereferencing nil panics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pointers & Dereferencing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)\n\ntype User struct {\n  Name  string\n  Email string\n}\n\nfunc main() {\n  // Create value and pointer\n  u := User{Name: \"Alice\", Email: \"alice@example.com\"}\n  p := &u  // address-of operator"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pointers & Dereferencing — common patterns you'll see in production.\n// APPROACH  - Combine Pointers & Dereferencing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Dereference\n  fmt.Println(*p)  // {Alice alice@example.com}\n  (*p).Name = \"Bob\"  // explicit dereference"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pointers & Dereferencing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Auto-dereference in method calls,  p.Email = \"bob@example.com\"  // equivalent to (*p).Email,  fmt.Println(u.Email)  // bob@example.com,\n\n  // Pointer to new allocation,  userPtr := &User{Name: \"Charlie\"},  fmt.Println(userPtr.Name),\n\n  // Nil pointers,  var nilPtr *User,  if nilPtr == nil {,    fmt.Println(\"pointer is nil\"),  },  // nilPtr.Name  // panic: nil pointer dereference,\n\n  // Pointer parameters allow mutation,  update(&u),  fmt.Println(u.Name)  // Updated,\n\n  // Pointer comparison,  p1 := &u,  p2 := &u,  fmt.Println(p1 == p2)  // true — same address,,  u2 := User{Name: \"Alice\"},  p3 := &u2,  fmt.Println(p1 == p3)  // false — different addresses,},\n\n// Pointer receiver — can mutate,func (u *User) UpdateName(name string) {,  u.Name = name,},\n\n// Function with pointer parameter,func update(u *User) {,  u.Name = \"Updated\",},\n\n// Compare pointers by value,func isSameUser(p1, p2 *User) bool {,  return p1 == p2  // true iff pointing to the same object,}"
                  }
        ],
        tips: [
                  "Go auto-dereferences pointers in method calls — p.field is equivalent to (*p).field.",
                  "Taking the address of a literal: &User{} — creates a heap-allocated value.",
                  "Use pointers for large structs or when mutation is needed; values for small, immutable types.",
                  "Dereferencing a nil pointer panics — always check p != nil before dereferencing."
        ],
        mistake: "Copying a pointer value and expecting independent data — *p1 and *p2 pointing to the same address share mutations. Copy the value, not the pointer.",
        shorthand: {
          verbose: "var p *int = &x\nvar p2 *int = p\n*p2 = 100  // also changes *p\nfmt.Println(*p, *p2)  // both 100",
          concise: "p := &x; p2 := p\n*p2 = 100  // Both reference same value",
        },
      },
      {
        id: "make-vs-new",
        fn: "make vs new",
        desc: "new allocates zeroed memory and returns a pointer. make initializes slices, maps, and channels with ready-to-use internal structures.",
        category: "Memory & Allocation",
        subtitle: "Allocation primitives for different types",
        signature: "new(T) *T  |  make([]T, len, cap)  |  make(map[K]V)  |  make(chan T)",
        descLong: "new(T) allocates zeroed memory and returns *T — works on any type. make(T) initializes slices, maps, and channels with their internal data structures ready to use. Only slices, maps, and channels can use make. For structs, use &T{} or new(T).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of make vs new — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport \"fmt\"\n\ntype Config struct {\n  Timeout int\n  Retries int\n}\n\nfunc main() {\n  // new allocates and zeros, returns pointer\n  cfg := new(Config)  // all fields zero-initialized\n  cfg.Timeout = 30\n  fmt.Println(*cfg)  // {30 0}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of make vs new — common patterns you'll see in production.\n// APPROACH  - Combine make vs new with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Equivalent to &Config{}\n  cfg2 := &Config{}\n  fmt.Println(cfg == cfg2)  // false — different addresses"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of make vs new — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// new with built-in types,  intPtr := new(int),  *intPtr = 42,  fmt.Println(*intPtr),\n\n  // make for slices — preallocated,  slice1 := make([]int, 3)           // len=3, cap=3,  slice2 := make([]int, 3, 10)       // len=3, cap=10,  slice3 := []int{}                  // empty, same as make([]int, 0),,  fmt.Println(len(slice1), cap(slice1))  // 3 3,  fmt.Println(len(slice2), cap(slice2))  // 3 10,\n\n  // make for maps — ready to receive keys,  m1 := make(map[string]int)       // empty map,  m2 := make(map[string]int, 100)  // hint capacity 100,  m3 := map[string]int{}           // equivalent to m1,  m1[\"a\"] = 1,  fmt.Println(m1),\n\n  // make for channels — ready to send/receive,  ch1 := make(chan int)       // unbuffered,  ch2 := make(chan int, 5)    // buffered, cap 5,  go func() {,    ch2 <- 10,  }(),  fmt.Println(<-ch2),\n\n  // new on slice — rarely used, creates *[]T not []T,  slicePtr := new([]int),  *slicePtr = append(*slicePtr, 1, 2, 3)  // awkward,  fmt.Println(*slicePtr),\n\n  // Proper way — use make directly,  properSlice := make([]int, 0, 10),  properSlice = append(properSlice, 1, 2, 3),  fmt.Println(properSlice),}"
                  }
        ],
        tips: [
                  "Use make for slices, maps, and channels — never use new for these.",
                  "Use &T{} for struct allocation — cleaner and idiomatic than new(T).",
                  "Pre-allocate slices with make([]T, 0, cap) to avoid repeated reallocations.",
                  "make with two args for maps (capacity hint) helps avoid resizing in tight loops."
        ],
        mistake: "Using new([]T) expecting a slice — new returns a pointer to a zero slice (*[]T), not a usable slice. Use make([]T, len, cap) instead.",
        shorthand: {
          verbose: "var m map[string]int\nm[\"key\"] = 1  // panic: assignment to nil map\nvar ch chan int\n<-ch  // deadlock: nil channel blocks",
          concise: "m := make(map[string]int)\nm[\"key\"] = 1  // initialized\nch := make(chan int)  // Ready to use",
        },
      },
      {
        id: "range-gotchas",
        fn: "Range Loop Gotchas",
        desc: "Understanding range semantics — loop variable capture, modifying collections, and nil channels.",
        category: "Control Flow",
        subtitle: "Common pitfalls with range loops",
        signature: "for i, v := range collection { }",
        descLong: "Range loops have subtle gotchas: loop variables are reused (capture by value in closures), modifying during iteration is unsafe, and range on nil slices/maps is allowed (but returns zero iterations). Always understand whether you're ranging over a copy or the original collection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Range Loop Gotchas — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)\n\nfunc main() {\n  // Gotcha 1: Loop variable capture\n  numbers := []int{1, 2, 3}\n  var funcs []func()\n\n  for _, n := range numbers {\n    funcs = append(funcs, func() {\n      fmt.Println(n)  // n is captured, not copied\n    })\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Range Loop Gotchas — common patterns you'll see in production.\n// APPROACH  - Combine Range Loop Gotchas with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// All print 3 (final value of n)\n  for _, f := range funcs {\n    f()\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Range Loop Gotchas — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fix: capture by value,  var fixedFuncs []func(),  for _, n := range numbers {,    n := n  // capture current n by value,    fixedFuncs = append(fixedFuncs, func() {,      fmt.Println(n)  // prints 1, 2, 3 correctly,    }),  },,  fmt.Println(\"Fixed version:\"),  for _, f := range fixedFuncs {,    f(),  },\n\n  // Gotcha 2: Modifying slice during range,  items := []int{1, 2, 3},  for _, item := range items {,    if item == 2 {,      items = append(items, 99)  // UB: may or may not iterate new element,    },    fmt.Println(item),  },\n\n  // Gotcha 3: nil ranges are allowed,  var nilSlice []int,  var nilMap map[string]int,  count := 0,  for range nilSlice {  // zero iterations,    count++,  },  for range nilMap {    // zero iterations,    count++,  },  fmt.Println(\"iterations:\", count)  // 0,\n\n  // Gotcha 4: Range on strings yields runes, not bytes,  s := \"hello\",  for i, ch := range s {,    fmt.Printf(\"%d: %c (type %T),\", i, ch, ch)  // ch is rune,  },\n\n  // Gotcha 5: Maps randomize iteration,  m := map[string]int{\"a\": 1, \"b\": 2, \"c\": 3},  fmt.Println(\"First iteration:\", keysInOrder(m)),  fmt.Println(\"Second iteration:\", keysInOrder(m))  // different order,\n\n  // Gotcha 6: Race condition in concurrent range,  safeChan := make(chan int, 3),  safeChan <- 1,  safeChan <- 2,  safeChan <- 3,  close(safeChan),\n\n  // Safe: channel is thread-safe,  for v := range safeChan {,    fmt.Println(v),  },},,func keysInOrder(m map[string]int) []string {,  var keys []string,  for k := range m {,    keys = append(keys, k),  },  return keys,},\n\n// Correct pattern: capture loop variable in closures,func startWorkers(count int) {,  var wg sync.WaitGroup,  for i := 0; i < count; i++ {,    wg.Add(1),    i := i  // capture i by value,    go func() {,      defer wg.Done(),      fmt.Println(\"worker\", i),    }(),  },  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Capture loop variables by value in closures: n := n before using in func() { }",
                  "Never modify a slice/map during range iteration — behavior is undefined.",
                  "Range on nil collections is safe — it simply iterates zero times.",
                  "Range on strings returns (index, rune) — to iterate bytes, convert to []byte first.",
                  "Map iteration order is randomized — never rely on iteration order."
        ],
        mistake: "Using loop variables directly in goroutines without capture: go func() { use(i) }() — all goroutines see the final i. Always capture: i := i before the func.",
        shorthand: {
          verbose: "for i, v := range items {\n  go func() {\n    fmt.Println(i)  // all see final i\n  }()\n}",
          concise: "for i, v := range items {\n  i := i; v := v\n  go func() { fmt.Println(i) }()  // captured",
        },
      },
      {
        id: "init-functions",
        fn: "init() Functions",
        desc: "Package initialization code run automatically before main() — useful for setup and validation.",
        category: "Functions & Defer",
        subtitle: "Automatic package-level initialization",
        signature: "func init() { ... }",
        descLong: "init() functions run automatically in each package during initialization, before any user code. Multiple init() functions in a package run in source file order. init() is useful for registering plugins, setting up globals, or validating assumptions. init() has no parameters or returns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of init() Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"flag\"\n  \"fmt\"\n  \"log\"\n)\n\nvar (\n  config = loadConfig()  // package-level var\n  logger = log.New(nil, \"\", 0)\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of init() Functions — common patterns you'll see in production.\n// APPROACH  - Combine init() Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// First init in source order\nfunc init() {\n  fmt.Println(\"init 1: loading config\")\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of init() Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Multiple init functions allowed,func init() {,  fmt.Println(\"init 2: validating\"),  if config == \"\" {,    log.Fatal(\"config not loaded\"),  },},\n\n// Parse flags in init,func init() {,  flag.Parse(),},,func main() {,  // All inits have run by now,  fmt.Println(\"main() starts\"),  fmt.Println(\"config:\", config),},,func loadConfig() string {,  // Called during var initialization, before any init(),  return \"production\",},\n\n// Package registration pattern,type Handler func() error,,var handlers = make(map[string]Handler),,func RegisterHandler(name string, h Handler) {,  handlers[name] = h,},,func init() {,  // Register built-in handlers,  RegisterHandler(\"default\", func() error {,    fmt.Println(\"default handler\"),    return nil,  }),},\n\n// Another package might do:,// func init() {,//   RegisterHandler(\"custom\", customHandler),// }"
                  }
        ],
        tips: [
                  "init() runs before main() — useful for one-time setup.",
                  "Multiple init() functions are allowed; they run in source file order.",
                  "init() cannot be called explicitly — it's automatic.",
                  "Use blank imports (import _ \"package\") to run another package's init() without using its exports.",
                  "Avoid complex logic in init() — it makes startup time unpredictable and errors hard to trace."
        ],
        mistake: "Assuming init() executes in a specific order across packages — order is undefined. Keep init() simple and don't depend on side effects from other packages.",
        shorthand: {
          verbose: "func init() {\n  db := connectDB()\n  setupRoutes(db)\n  loadCache()\n  validateConfig()\n}",
          concise: "func init() {\n  sql.Register(\"mysql\", &mysql.Driver{})\n}  // Single responsibility per init",
        },
      },
    ],
  },
]

export default { meta, sections }
