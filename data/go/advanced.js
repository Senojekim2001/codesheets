export const meta = {
  "id": "go-advanced",
  "label": "Advanced Go",
  "icon": "🐹",
  "description": "Advanced Go: generics, reflection, embed, context patterns, testing, and performance."
}

export const sections = [

  // ── Section 1: Generics ─────────────────────────────────────────
  {
    id: "generics",
    title: "Generics",
    entries: [
      {
        id: "generic-functions",
        fn: "Generic Functions & Type Constraints",
        desc: "Write functions that work with multiple types using type parameters and constraints.",
        category: "Generics",
        subtitle: "func F[T constraint](x T)  |  comparable, any, ~int",
        signature: "func Map[T, U any](s []T, fn func(T) U) []U",
        descLong: "Go 1.18+ generics use type parameters in square brackets. Constraints restrict which types are allowed: any (no restriction), comparable (supports ==), or custom interfaces with type sets. The ~ operator matches underlying types (e.g., ~int matches type MyInt int). Use generics for data structures, utility functions, and algorithms that work across types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Functions & Type Constraints — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"cmp\"\n    \"fmt\"\n    \"slices\"\n    \"golang.org/x/exp/constraints\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Functions & Type Constraints — common patterns you'll see in production.\n// APPROACH  - Combine Generic Functions & Type Constraints with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Generic function with any constraint\nfunc Map[T, U any](s []T, fn func(T) U) []U {\n    result := make([]U, len(s))\n    for i, v := range s {\n        result[i] = fn(v)\n    }\n    return result\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Functions & Type Constraints — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Filter with predicate,func Filter[T any](s []T, pred func(T) bool) []T {,    var result []T,    for _, v := range s {,        if pred(v) {,            result = append(result, v),        },    },    return result,},\n\n// Reduce/fold,func Reduce[T, U any](s []T, init U, fn func(U, T) U) U {,    acc := init,    for _, v := range s {,        acc = fn(acc, v),    },    return acc,},\n\n// Custom constraint with type sets,type Number interface {,    ~int | ~int32 | ~int64 | ~float32 | ~float64,},,func Sum[T Number](nums []T) T {,    var total T,    for _, n := range nums {,        total += n,    },    return total,},\n\n// Generic data structure,type Pair[T, U any] struct {,    First  T,    Second U,},,func NewPair[T, U any](first T, second U) Pair[T, U] {,    return Pair[T, U]{First: first, Second: second},},\n\n// Comparable constraint for Contains,func Contains[T comparable](s []T, target T) bool {,    for _, v := range s {,        if v == target {,            return true,        },    },    return false,},,func main() {,    nums := []int{1, 2, 3, 4, 5},    doubled := Map(nums, func(n int) int { return n * 2 }),    evens := Filter(nums, func(n int) bool { return n%2 == 0 }),    sum := Reduce(nums, 0, func(acc, n int) int { return acc + n }),,    fmt.Println(doubled) // [2 4 6 8 10],    fmt.Println(evens)   // [2 4],    fmt.Println(sum)     // 15,\n\n    // stdlib generics (Go 1.21+),    slices.Sort(nums),    idx, found := slices.BinarySearch(nums, 3),    maxVal := slices.Max(nums),    fmt.Println(idx, found, maxVal),}"
                  }
        ],
        tips: [
                  "Use any instead of interface{} — it's the same thing but more readable as a constraint.",
                  "The ~ operator matches underlying types: ~int matches type UserID int — essential for custom types.",
                  "Go 1.21 slices and maps packages provide generic utilities — prefer them over hand-rolling.",
                  "Start with concrete types, then generalize — don't make everything generic prematurely."
        ],
        mistake: "Using generics for everything — Go's philosophy favors simplicity. If a function only works with one or two types, use concrete types or interfaces. Generics add complexity.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfunc Process[T any](items []T) {}\n// For a one-off function, just use concrete types\n// More explicit but longer",
          concise: "func Min[T constraints.Ordered](a, b T) T { if a < b { return a }; return b }; type Pair[T,U any] struct { ... }",
        },
      },
      {
        id: "generic-data-structures",
        fn: "Generic Data Structures",
        desc: "Build type-safe collections — stacks, queues, sets, ordered maps, and result types with generics.",
        category: "Generics",
        subtitle: "Stack[T], Set[T], Result[T], OrderedMap[K,V]",
        signature: "type Stack[T any] struct { items []T }  |  type Result[T any] struct { Value T; Err error }",
        descLong: "Generics shine for data structures: type-safe containers without interface{} casts. Stack, queue, set, priority queue, LRU cache — all benefit from generics. The Result[T] pattern (like Rust's Result) wraps a value or error. Generic methods have the same type parameters as their receiver. Go doesn't support method-level type parameters (only struct-level).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Data Structures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage collections"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Data Structures — common patterns you'll see in production.\n// APPROACH  - Combine Generic Data Structures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Generic Stack ───────────────────────────────────\ntype Stack[T any] struct {\n    items []T\n}\n\nfunc (s *Stack[T]) Push(item T) {\n    s.items = append(s.items, item)\n}\n\nfunc (s *Stack[T]) Pop() (T, bool) {\n    if len(s.items) == 0 {\n        var zero T\n        return zero, false\n    }\n    item := s.items[len(s.items)-1]\n    s.items = s.items[:len(s.items)-1]\n    return item, true\n}\n\nfunc (s *Stack[T]) Peek() (T, bool) {\n    if len(s.items) == 0 {\n        var zero T\n        return zero, false\n    }\n    return s.items[len(s.items)-1], true\n}\n\nfunc (s *Stack[T]) Len() int { return len(s.items) }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Data Structures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Generic Set ─────────────────────────────────────,type Set[T comparable] struct {,    items map[T]struct{},},,func NewSet[T comparable](items ...T) Set[T] {,    s := Set[T]{items: make(map[T]struct{})},    for _, item := range items {,        s.Add(item),    },    return s,},,func (s Set[T]) Add(item T)         { s.items[item] = struct{}{} },func (s Set[T]) Remove(item T)      { delete(s.items, item) },func (s Set[T]) Contains(item T) bool { _, ok := s.items[item]; return ok },func (s Set[T]) Len() int           { return len(s.items) },,func (s Set[T]) Union(other Set[T]) Set[T] {,    result := NewSet[T](),    for k := range s.items { result.Add(k) },    for k := range other.items { result.Add(k) },    return result,},,func (s Set[T]) Intersection(other Set[T]) Set[T] {,    result := NewSet[T](),    for k := range s.items {,        if other.Contains(k) { result.Add(k) },    },    return result,},\n\n// ── Result type (like Rust) ─────────────────────────,type Result[T any] struct {,    Value T,    Err   error,},,func Ok[T any](v T) Result[T]       { return Result[T]{Value: v} },func Err[T any](err error) Result[T] { return Result[T]{Err: err} },,func (r Result[T]) Unwrap() T {,    if r.Err != nil { panic(r.Err) },    return r.Value,},,func (r Result[T]) UnwrapOr(fallback T) T {,    if r.Err != nil { return fallback },    return r.Value,},\n\n// Usage:,// s := NewSet[string](\"a\", \"b\", \"c\"),// s.Add(\"d\"),// fmt.Println(s.Contains(\"a\")) // true,// stack := &Stack[int]{},// stack.Push(42),// val, ok := stack.Pop() // 42, true"
                  }
        ],
        tips: [
                  "var zero T gives you the zero value for any type — use it when you need to return a \"nothing\" value.",
                  "Set uses map[T]struct{} — struct{} takes zero bytes, making it the most memory-efficient set implementation.",
                  "Go doesn't support method-level generics — type parameters must be on the struct, not individual methods.",
                  "Generic types compose well: Stack[Result[int]] is a stack of results, fully type-safe."
        ],
        mistake: "Adding methods with new type parameters to a generic type — Go only allows struct-level type params on methods. func (s Stack[T]) Map[U any](...) won't compile. Use a standalone function instead.",
        shorthand: {
          verbose: "// Can't compile\nfunc (s Stack[T]) Map[U any](fn func(T) U) Stack[U] {\n  ...\n}",
          concise: "type Stack[T any] struct { items []T }; func (s *Stack[T]) Push(v T) { ... }; use standalone func for new types",
        },
      },
    ],
  },

  // ── Section 2: Reflect & Embed ─────────────────────────────────────────
  {
    id: "reflect-embed",
    title: "Reflect & Embed",
    entries: [
      {
        id: "reflect-basics",
        fn: "Reflection — Runtime Type Inspection",
        desc: "Inspect and manipulate types and values at runtime — struct tags, dynamic dispatch, and marshaling.",
        category: "Reflection",
        subtitle: "reflect.TypeOf, reflect.ValueOf, struct tags",
        signature: "reflect.TypeOf(x)  |  reflect.ValueOf(x)  |  field.Tag.Get(\"json\")",
        descLong: "The reflect package inspects types and values at runtime. reflect.TypeOf returns type metadata (name, kind, struct fields, methods). reflect.ValueOf wraps a value for runtime manipulation. Struct tags (like `json:\"name\"`) are accessed via reflection — this is how encoding/json, GORM, and validation libraries work. Use sparingly — reflection is slow and loses compile-time safety.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Reflection — Runtime Type Inspection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"fmt\"\n    \"reflect\"\n    \"strings\"\n)\n\ntype User struct {\n    Name    string  `json:\"name\" validate:\"required\"`\n    Email   string  `json:\"email\" validate:\"required,email\"`\n    Age     int     `json:\"age,omitempty\" validate:\"min=0,max=150\"`\n    Admin   bool    `json:\"-\"`  // excluded from JSON\n}\n\nfunc inspectStruct(v any) {\n    t := reflect.TypeOf(v)\n    val := reflect.ValueOf(v)\n\n    if t.Kind() == reflect.Ptr {\n        t = t.Elem()\n        val = val.Elem()\n    }\n\n    fmt.Printf(\"Type: %s (Kind: %s)\\n\", t.Name(), t.Kind())\n    fmt.Printf(\"Fields: %d\\n\\n\", t.NumField())\n\n    for i := 0; i < t.NumField(); i++ {\n        field := t.Field(i)\n        value := val.Field(i)\n        jsonTag := field.Tag.Get(\"json\")\n        validateTag := field.Tag.Get(\"validate\")\n\n        fmt.Printf(\"  %s (%s) = %v\\n\", field.Name, field.Type, value)\n        fmt.Printf(\"    json: %q, validate: %q\\n\", jsonTag, validateTag)\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Reflection — Runtime Type Inspection — common patterns you'll see in production.\n// APPROACH  - Combine Reflection — Runtime Type Inspection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Build a simple struct validator using reflection\nfunc Validate(v any) []string {\n    var errors []string\n    t := reflect.TypeOf(v)\n    val := reflect.ValueOf(v)\n\n    for i := 0; i < t.NumField(); i++ {\n        field := t.Field(i)\n        value := val.Field(i)\n        tag := field.Tag.Get(\"validate\")\n\n        if strings.Contains(tag, \"required\") {\n            if value.IsZero() {\n                errors = append(errors, fmt.Sprintf(\"%s is required\", field.Name))\n            }\n        }\n    }\n    return errors\n}\n\nfunc main() {\n    user := User{Name: \"Alice\", Email: \"alice@example.com\", Age: 30}\n    inspectStruct(user)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Reflection — Runtime Type Inspection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Validation,    empty := User{},    errs := Validate(empty),    for _, e := range errs {,        fmt.Println(\"Error:\", e),    },    // Error: Name is required,    // Error: Email is required,\n\n    // Dynamic value setting (must use pointer),    rv := reflect.ValueOf(&user).Elem(),    rv.FieldByName(\"Name\").SetString(\"Bob\"),    fmt.Println(user.Name) // \"Bob\",}"
                  }
        ],
        tips: [
                  "reflect.TypeOf gives type metadata; reflect.ValueOf gives the actual value — you usually need both.",
                  "To modify values via reflection, pass a pointer: reflect.ValueOf(&x).Elem().Set(newValue).",
                  "Struct tags are the primary use of reflection in practice — JSON, DB, validation all use them.",
                  "reflect is 10-100x slower than direct code — cache reflect.Type results when processing many values."
        ],
        mistake: "Using reflection for things that generics or interfaces can handle — reflection bypasses the type system, is slow, and panics on type mismatches. Use it only when you truly need runtime type inspection.",
        shorthand: {
          verbose: "// Slow reflection approach\nrv := reflect.ValueOf(x)\nif rv.Kind() == reflect.String {\n  val := rv.String()\n}",
          concise: "reflect.TypeOf(v).Kind(); field.Tag.Get(\"json\"); use generics or interfaces instead when possible",
        },
      },
      {
        id: "embed-directive",
        fn: "go:embed — Embed Files at Compile Time",
        desc: "Embed static files (templates, SQL, config) directly into the Go binary — no external files needed at runtime.",
        category: "Build",
        subtitle: "//go:embed for files, directories, and file systems",
        signature: "//go:embed file.txt  |  //go:embed templates/*  |  embed.FS",
        descLong: "The embed package (Go 1.16+) embeds files into the compiled binary. Embed individual files as string or []byte, or entire directories as embed.FS. The binary is self-contained — no need to ship static files alongside it. Perfect for HTML templates, SQL migrations, default configs, and static web assets. Files are read-only and available at compile time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of go:embed — Embed Files at Compile Time — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"embed\"\n    \"fmt\"\n    \"html/template\"\n    \"io/fs\"\n    \"net/http\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of go:embed — Embed Files at Compile Time — common patterns you'll see in production.\n// APPROACH  - Combine go:embed — Embed Files at Compile Time with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Embed a single file as string\n//go:embed version.txt\nvar version string"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of go:embed — Embed Files at Compile Time — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Embed a single file as bytes,//go:embed config/defaults.json,var defaultConfig []byte,\n\n// Embed entire directory as filesystem,//go:embed templates/*,var templateFS embed.FS,\n\n// Embed multiple patterns,//go:embed static/css/* static/js/* static/images/*,var staticFiles embed.FS,\n\n// Embed SQL migrations,//go:embed migrations/*.sql,var migrationsFS embed.FS,,func main() {,    fmt.Println(\"Version:\", version),\n\n    // Parse templates from embedded FS,    tmpl, err := template.ParseFS(templateFS, \"templates/*.html\"),    if err != nil {,        panic(err),    },\n\n    // Serve static files,    staticHandler := http.FileServer(http.FS(staticFiles)),    http.Handle(\"/static/\", staticHandler),\n\n    // Read embedded migration files,    entries, _ := fs.ReadDir(migrationsFS, \"migrations\"),    for _, entry := range entries {,        data, _ := migrationsFS.ReadFile(\"migrations/\" + entry.Name()),        fmt.Printf(\"Migration %s: %d bytes\\n\", entry.Name(), len(data)),    },\n\n    // Serve templates,    http.HandleFunc(\"/\", func(w http.ResponseWriter, r *http.Request) {,        tmpl.ExecuteTemplate(w, \"index.html\", map[string]string{,            \"Title\":   \"My App\",,            \"Version\": version,,        }),    }),,    http.ListenAndServe(\":8080\", nil),}"
                  }
        ],
        tips: [
                  "//go:embed must be a comment directly above a var declaration — no blank lines between them.",
                  "embed.FS implements fs.FS — it works with template.ParseFS, http.FS, and all fs.* functions.",
                  "Embedded files are read-only and baked into the binary at compile time — no runtime file access needed.",
                  "Use //go:embed all:dir to include hidden files (dotfiles) — by default they're excluded."
        ],
        mistake: "Putting //go:embed in a function body — it only works at package level on var declarations. The directive must be a comment immediately above a package-level var.",
        shorthand: {
          verbose: "// Wrong: in function\nfunc init() {\n  //go:embed files/*\n  var content embed.FS\n}",
          concise: "//go:embed file.txt followed by var Content string; //go:embed dir/* for embed.FS; works only at package level",
        },
      },
    ],
  },

  // ── Section 3: Testing & Benchmarking ─────────────────────────────────────────
  {
    id: "testing-bench",
    title: "Testing & Benchmarking",
    entries: [
      {
        id: "table-driven-tests",
        fn: "Table-Driven Tests & Subtests",
        desc: "Go's idiomatic testing pattern — define test cases as a table, run each as a subtest with t.Run.",
        category: "Testing",
        subtitle: "testing.T, t.Run, table-driven, t.Parallel",
        signature: "func TestFoo(t *testing.T)  |  t.Run(\"name\", func(t *testing.T) { ... })",
        descLong: "Table-driven tests define test cases as a slice of structs, then iterate with t.Run() for named subtests. This is Go's standard testing pattern — used throughout the standard library. Each subtest has its own name (shown on failure), can run in parallel, and can be run individually with -run. Use t.Helper() in helper functions to get correct line numbers in failures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Table-Driven Tests & Subtests — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage math\n\nimport \"testing\"\n\nfunc Add(a, b int) int { return a + b }\n\nfunc TestAdd(t *testing.T) {\n    tests := []struct {\n        name     string\n        a, b     int\n        expected int\n    }{\n        {\"positive\", 2, 3, 5},\n        {\"negative\", -1, -2, -3},\n        {\"zero\", 0, 0, 0},\n        {\"mixed\", -1, 5, 4},\n        {\"large\", 1_000_000, 2_000_000, 3_000_000},\n    }\n\n    for _, tt := range tests {\n        t.Run(tt.name, func(t *testing.T) {\n            t.Parallel()  // run subtests concurrently\n            got := Add(tt.a, tt.b)\n            if got != tt.expected {\n                t.Errorf(\"Add(%d, %d) = %d, want %d\", tt.a, tt.b, got, tt.expected)\n            }\n        })\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Table-Driven Tests & Subtests — common patterns you'll see in production.\n// APPROACH  - Combine Table-Driven Tests & Subtests with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Helper function with t.Helper()\nfunc assertEqual[T comparable](t *testing.T, got, want T) {\n    t.Helper()  // error reports caller's line, not this function's\n    if got != want {\n        t.Errorf(\"got %v, want %v\", got, want)\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Table-Driven Tests & Subtests — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Test with setup and cleanup,func TestDatabase(t *testing.T) {,    db := setupTestDB(t),    t.Cleanup(func() {,        db.Close()  // runs after test completes,    }),,    t.Run(\"Insert\", func(t *testing.T) {,        err := db.Insert(\"key\", \"value\"),        if err != nil {,            t.Fatalf(\"Insert failed: %v\", err),        },    }),,    t.Run(\"Get\", func(t *testing.T) {,        val, err := db.Get(\"key\"),        if err != nil {,            t.Fatalf(\"Get failed: %v\", err),        },        assertEqual(t, val, \"value\"),    }),},\n\n// go test -v                     # verbose output,// go test -run TestAdd/positive  # run specific subtest,// go test -count=1               # disable test caching,// go test -race                  # race detector,// go test -cover                 # coverage report"
                  }
        ],
        tips: [
                  "Always use t.Run for subtests — failures show which case failed, and you can run individual cases with -run.",
                  "t.Parallel() runs subtests concurrently — great for I/O tests, but be careful with shared state.",
                  "t.Cleanup() is cleaner than defer — it runs after the test AND all its subtests complete.",
                  "t.Helper() in assertion helpers makes error messages point to the caller, not the helper function."
        ],
        mistake: "Capturing the loop variable in parallel subtests (Go <1.22): the closure captures a pointer to tt, which changes. Use tt := tt or upgrade to Go 1.22+ where loop variables are per-iteration.",
        shorthand: {
          verbose: "for _, tt := range tests {\n  t.Run(tt.name, func(t *testing.T) {\n    t.Parallel()\n    // tt captured by reference, points to current loop var\n  })\n}",
          concise: "for _, tt := range tests { tt := tt; t.Run(...) } // Go 1.21; or upgrade to Go 1.22+ for automatic per-iteration binding",
        },
      },
      {
        id: "benchmarks",
        fn: "Benchmarks & Profiling",
        desc: "Measure function performance with b.N loops, compare implementations, and generate CPU/memory profiles.",
        category: "Testing",
        subtitle: "testing.B, b.N, -bench, -cpuprofile, pprof",
        signature: "func BenchmarkFoo(b *testing.B) { for i := 0; i < b.N; i++ { ... } }",
        descLong: "Go benchmarks run a function b.N times, automatically adjusting N for statistical reliability. Compare implementations with benchstat. Generate CPU and memory profiles with -cpuprofile/-memprofile, then analyze with pprof. b.ResetTimer() excludes setup time. b.ReportAllocs() includes allocation counts. Use sub-benchmarks for parameter sweeps.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Benchmarks & Profiling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"fmt\"\n    \"strings\"\n    \"testing\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Benchmarks & Profiling — common patterns you'll see in production.\n// APPROACH  - Combine Benchmarks & Profiling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic benchmark\nfunc BenchmarkConcat(b *testing.B) {\n    for i := 0; i < b.N; i++ {\n        s := \"\"\n        for j := 0; j < 100; j++ {\n            s += \"x\"\n        }\n    }\n}\n\nfunc BenchmarkBuilder(b *testing.B) {\n    for i := 0; i < b.N; i++ {\n        var sb strings.Builder\n        for j := 0; j < 100; j++ {\n            sb.WriteString(\"x\")\n        }\n        _ = sb.String()\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Benchmarks & Profiling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Sub-benchmarks for parameter sweep,func BenchmarkSort(b *testing.B) {,    sizes := []int{10, 100, 1000, 10000},    for _, size := range sizes {,        b.Run(fmt.Sprintf(\"size=%d\", size), func(b *testing.B) {,            data := generateRandomSlice(size),            b.ResetTimer()  // exclude setup,            for i := 0; i < b.N; i++ {,                slices.Sort(slices.Clone(data)),            },        }),    },},\n\n// Track allocations,func BenchmarkAllocations(b *testing.B) {,    b.ReportAllocs(),    for i := 0; i < b.N; i++ {,        m := make(map[string]int, 100),        for j := 0; j < 100; j++ {,            m[fmt.Sprintf(\"key%d\", j)] = j,        },    },},\n\n// Commands:,// go test -bench=.                          # run all benchmarks,// go test -bench=BenchmarkConcat -count=5   # 5 runs for benchstat,// go test -bench=. -benchmem                # include memory stats,// go test -bench=. -cpuprofile=cpu.prof     # CPU profile,// go test -bench=. -memprofile=mem.prof     # memory profile,// go tool pprof cpu.prof                    # interactive analysis,// go tool pprof -http=:8080 cpu.prof        # web UI"
                  }
        ],
        tips: [
                  "b.ResetTimer() after setup ensures only the code under test is measured.",
                  "Use -count=5 and benchstat to compare: statistically significant differences, not just one run.",
                  "b.ReportAllocs() shows allocations per operation — often the biggest performance differentiator.",
                  "go tool pprof -http=:8080 launches a web UI with flame graphs — the fastest way to find bottlenecks."
        ],
        mistake: "Drawing conclusions from a single benchmark run — variance is high. Use -count=5 or more and benchstat for statistically meaningful comparisons.",
        shorthand: {
          verbose: "// Manual / verbose approach\ngo test -bench=. # one run, could be lucky\n# Results are noisy\n// More explicit but longer",
          concise: "go test -bench=. -count=5 -benchmem; go tool pprof -http=:8080 cpu.prof for web UI; b.ResetTimer() excludes setup",
        },
      },
    ],
  },
]

export default { meta, sections }
