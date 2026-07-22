export const meta = {
  "id": "stdlib",
  "label": "Standard Library",
  "icon": "📚",
  "description": "fmt, strings, slices, maps, time, http, io, os, and context."
}

export const sections = [

  // ── Section 1: Standard Library ─────────────────────────────────────────
  {
    id: "standard-library",
    title: "Standard Library",
    entries: [
      {
        id: "fmt",
        fn: "fmt package",
        desc: "Formatted I/O — Printf, Sprintf, Errorf, and format verbs.",
        category: "fmt & strings",
        subtitle: "Formatted printing and string building",
        signature: "fmt.Printf(format, args...)  |  fmt.Sprintf  |  fmt.Errorf",
        descLong: "The fmt package provides formatted I/O. Key verbs: %v (default), %+v (struct with field names), %#v (Go syntax), %T (type), %d (int), %f (float), %s (string), %q (quoted string), %p (pointer), %w (error wrapping in Errorf). Println adds a newline; Print does not.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of fmt package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Print verbs\ntype Point struct{ X, Y int }\np := Point{1, 2}\n\nfmt.Printf(\"%v\n\",  p)   // {1 2}\nfmt.Printf(\"%+v\n\", p)   // {X:1 Y:2}\nfmt.Printf(\"%#v\n\", p)   // main.Point{X:1, Y:2}\nfmt.Printf(\"%T\n\",  p)   // main.Point\nfmt.Printf(\"%d\n\",  42)  // 42\nfmt.Printf(\"%05d\n\",42)  // 00042\nfmt.Printf(\"%.2f\n\",3.14159) // 3.14\nfmt.Printf(\"%q\n\", \"hi\")     // \"hi\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of fmt package — common patterns you'll see in production.\n// APPROACH  - Combine fmt package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sprintf — format to string\ns := fmt.Sprintf(\"Hello, %s! You are %d.\", \"Alice\", 30)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of fmt package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fprintf — format to writer,fmt.Fprintf(os.Stderr, \"error: %v,\", err),\n\n// Errorf with wrapping,err := fmt.Errorf(\"fetchUser %d: %w\", id, ErrNotFound)"
                  }
        ],
        tips: [
                  "%w in Errorf wraps the error for errors.Is/As — always use it over %v for errors.",
                  "%q quotes strings and escapes special characters — useful for error messages.",
                  "fmt.Stringer interface (String() string) customizes %v formatting for your types.",
                  "strings.Builder is more efficient than repeated fmt.Sprintf concatenation."
        ],
        mistake: "Using fmt.Sprintf to build SQL queries with user input — always use parameterized queries. Never interpolate user input into SQL strings.",
        shorthand: {
          verbose: "// Manual / verbose approach\nquery := fmt.Sprintf(\"SELECT * FROM users WHERE id = %d\", userID)\n// More explicit but longer",
          concise: "db.QueryRow(\"SELECT * FROM users WHERE id = $1\", userID)",
        },
      },
      {
        id: "strings-package",
        fn: "strings package",
        desc: "String manipulation — Contains, Split, Join, Trim, Replace, ToUpper, Builder.",
        category: "fmt & strings",
        subtitle: "String inspection and transformation",
        signature: "strings.Contains(s, sub)  |  strings.Split(s, sep)  |  strings.Builder",
        descLong: "The strings package provides all common string operations. strings.Builder is efficient for building strings in a loop — avoids the O(n²) cost of repeated concatenation. strings.NewReader creates an io.Reader from a string.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of strings package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"strings\"\n\ns := \"Hello, World!\"\n\nstrings.Contains(s, \"World\")       // true\nstrings.HasPrefix(s, \"Hello\")      // true\nstrings.HasSuffix(s, \"!\")          // true\nstrings.Count(s, \"l\")              // 3\nstrings.Index(s, \"World\")          // 7\n\nstrings.ToUpper(s)                 // \"HELLO, WORLD!\"\nstrings.ToLower(s)                 // \"hello, world!\"\nstrings.TrimSpace(\"  hello  \")     // \"hello\"\nstrings.Trim(\"--hello--\", \"-\")     // \"hello\"\n\nstrings.Split(\"a,b,c\", \",\")        // [\"a\",\"b\",\"c\"]\nstrings.Join([]string{\"a\",\"b\"}, \"-\") // \"a-b\"\nstrings.Replace(\"aaa\", \"a\", \"b\", 2) // \"bba\"\nstrings.ReplaceAll(\"aaa\",\"a\",\"b\")   // \"bbb\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of strings package — common patterns you'll see in production.\n// APPROACH  - Combine strings package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Efficient string building\nvar sb strings.Builder\nfor i := 0; i < 5; i++ {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of strings package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfmt.Fprintf(&sb, \"item%d\n\", i)\n}\nresult := sb.String()"
                  }
        ],
        tips: [
                  "Use strings.Builder for loops that build strings — much faster than + concatenation.",
                  "strings.Cut(s, sep) splits at the first occurrence and returns (before, after, found) — cleaner than Split for key=value.",
                  "strings.Fields(s) splits on any whitespace — equivalent to s.split() in Python.",
                  "strings.NewReader(s) creates an io.Reader — useful for passing string content to APIs expecting a reader."
        ],
        mistake: "Building strings with + in a loop: s += piece creates a new allocation each iteration. Use strings.Builder or strings.Join for efficiency.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvar s string\nfor _, part := range parts { s += part }\n// More explicit but longer",
          concise: "var sb strings.Builder\nfor _, part := range parts { sb.WriteString(part) }\ns := sb.String()",
        },
      },
      {
        id: "slices",
        fn: "Slices",
        desc: "Dynamic arrays in Go — backed by an array, with length and capacity. append grows automatically.",
        category: "Slices & Maps",
        subtitle: "Go's dynamic array type",
        signature: "[]T  |  make([]T, len, cap)  |  append(slice, elems...)",
        descLong: "A slice is a view over an underlying array with length and capacity. append returns a new slice (possibly with a new backing array). Pre-allocate with make([]T, 0, cap) to avoid repeated reallocations. The slices package (Go 1.21) provides generic utility functions: Contains, Sort, Index, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Slices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Create\nnums := []int{1, 2, 3}\nempty := make([]int, 0, 10) // len=0, cap=10"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Slices — common patterns you'll see in production.\n// APPROACH  - Combine Slices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Append\nnums = append(nums, 4, 5)\nnums = append(nums, []int{6, 7}...)  // spread another slice"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Slices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Slice expressions,s := nums[1:4]   // [2 3 4] — shares underlying array,s2 := nums[2:]   // [3 4 5 6 7],copy := nums[:]  // full slice,\n\n// Length and capacity,len(nums) // 7,cap(nums),\n\n// Copy — independent slice,dst := make([]int, len(nums)),copy(dst, nums),\n\n// Go 1.21 slices package,import \"slices\",slices.Contains(nums, 3)   // true,slices.Sort(nums),slices.Index(nums, 3)      // index or -1"
                  }
        ],
        tips: [
                  "Pre-allocate with make([]T, 0, n) when you know the approximate size — avoids repeated reallocations.",
                  "append returns a new slice — always reassign: s = append(s, item).",
                  "Slicing shares the backing array — mutations to a sub-slice affect the original.",
                  "Use the slices package (Go 1.21) for Contains, Sort, Reverse instead of rolling your own."
        ],
        mistake: "Appending to a slice without reassigning: append(s, item) instead of s = append(s, item) — the original slice is unchanged since append returns a new slice.",
        shorthand: {
          verbose: "// Manual / verbose approach\ns := []int{1, 2}\nappend(s, 3)  // result discarded\n// More explicit but longer",
          concise: "s := []int{1, 2}\ns = append(s, 3)",
        },
      },
      {
        id: "maps",
        fn: "Maps",
        desc: "Hash maps with map[K]V syntax. Always initialize with make() or literal. Check existence with two-value assignment.",
        category: "Slices & Maps",
        subtitle: "Go's built-in hash map",
        signature: "make(map[K]V)  |  m[key]  |  val, ok := m[key]",
        descLong: "Maps are Go's hash map type. They must be initialized before use (make or literal). Accessing a missing key returns the zero value, not an error — use the two-value form to check existence. Maps are not safe for concurrent access — use sync.Map or a mutex.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Maps — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"fmt\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Maps — common patterns you'll see in production.\n// APPROACH  - Combine Maps with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Create\nm := make(map[string]int)\nm2 := map[string]int{\"a\": 1, \"b\": 2}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Maps — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Set / get,m[\"key\"] = 42,val := m[\"key\"]  // 42; returns 0 if missing,\n\n// Check existence,val, ok := m[\"missing\"]  // ok = false, val = 0,if !ok {,  fmt.Println(\"key not found\"),},\n\n// Delete,delete(m, \"key\"),\n\n// Length,len(m),\n\n// Iterate (random order),for k, v := range m {,  fmt.Printf(\"%s: %d,\", k, v),},\n\n// Nested map,nested := make(map[string]map[string]int),nested[\"user\"] = make(map[string]int),nested[\"user\"][\"count\"] = 5"
                  }
        ],
        tips: [
                  "Always use the two-value form (v, ok := m[k]) to distinguish missing keys from zero values.",
                  "Maps are not safe for concurrent reads + writes — use sync.RWMutex or sync.Map.",
                  "Iteration order is randomized by design — never depend on map order.",
                  "Use maps.Keys() and maps.Values() from the maps package (Go 1.21)."
        ],
        mistake: "Writing to a nil map: var m map[string]int; m[\"key\"] = 1 panics. Always initialize with make() or a literal.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvar m map[string]int\nm[\"key\"] = 1  // panic\n// More explicit but longer",
          concise: "m := make(map[string]int)\nm[\"key\"] = 1",
        },
      },
      {
        id: "http-server",
        fn: "net/http Server",
        desc: "Go's built-in HTTP server — handlers, ServeMux, middleware, and serving static files.",
        category: "HTTP & Context",
        subtitle: "Production-capable built-in HTTP server",
        signature: "http.HandleFunc(pattern, handler)  |  http.ListenAndServe(addr, mux)",
        descLong: "Go's net/http package has a production-quality HTTP server built in. Go 1.22 enhanced ServeMux with method and wildcard routing. Handlers implement http.Handler (ServeHTTP) or use http.HandlerFunc. Middleware is a function that takes and returns an http.Handler.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of net/http Server — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"log\"\n  \"log/slog\"\n  \"net/http\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of net/http Server — common patterns you'll see in production.\n// APPROACH  - Combine net/http Server with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Logging middleware\nfunc loggingMiddleware(next http.Handler) http.Handler {\n  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n    start := time.Now()\n    wrapped := &responseWriter{ResponseWriter: w, statusCode: 200}\n    next.ServeHTTP(wrapped, r)\n    slog.Info(\"request completed\",\n      \"method\", r.Method,\n      \"path\", r.URL.Path,\n      \"status\", wrapped.statusCode,\n      \"duration_ms\", time.Since(start).Milliseconds(),\n    )\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of net/http Server — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Recovery middleware,func recoveryMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if err := recover(); err != nil {,        slog.Error(\"panic recovered\", \"error\", err),        http.Error(w, \"Internal Server Error\", http.StatusInternalServerError),      },    }(),    next.ServeHTTP(w, r),  }),},\n\n// Handler with context awareness,func getUserHandler(w http.ResponseWriter, r *http.Request) {,  id := r.PathValue(\"id\"),  // Simulate work with timeout,  ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second),  defer cancel(),,  user, err := fetchUser(ctx, id),  if err != nil {,    http.Error(w, \"Not found\", http.StatusNotFound),    return,  },  w.Header().Set(\"Content-Type\", \"application/json\"),  w.WriteHeader(http.StatusOK),},,func main() {,  mux := http.NewServeMux(),\n\n  // Routes with Go 1.22+ patterns,  mux.HandleFunc(\"GET /users/{id}\", getUserHandler),  mux.HandleFunc(\"GET /health\", func(w http.ResponseWriter, r *http.Request) {,    w.WriteHeader(http.StatusOK),  }),\n\n  // Apply middleware chain,  var handler http.Handler = mux,  handler = recoveryMiddleware(handler),  handler = loggingMiddleware(handler),\n\n  // Configured server with timeouts,  server := &http.Server{,    Addr:           \":8080\",,    Handler:        handler,,    ReadTimeout:    15 * time.Second,,    WriteTimeout:   15 * time.Second,,    IdleTimeout:    60 * time.Second,,    MaxHeaderBytes: 1 << 20,,  },,  slog.Info(\"starting server\", \"addr\", server.Addr),  log.Fatal(server.ListenAndServe()),},\n\n// Helper for response tracking,type responseWriter struct {,  http.ResponseWriter,  statusCode int,},,func (rw *responseWriter) WriteHeader(code int) {,  rw.statusCode = code,  rw.ResponseWriter.WriteHeader(code),}"
                  }
        ],
        tips: [
                  "Go 1.22 added method routing and {wildcards} to ServeMux — no router library needed for many apps.",
                  "Always set timeouts on http.Server: ReadTimeout, WriteTimeout, IdleTimeout.",
                  "http.ResponseWriter must write headers before the body — set with w.Header().Set().",
                  "Use r.PathValue(\"name\") (Go 1.22) to read wildcard values from the URL."
        ],
        mistake: "Using the default http.ListenAndServe without a custom server — the default has no timeouts and is vulnerable to slowloris attacks. Always use a configured *http.Server.",
        shorthand: {
          verbose: "// Manual / verbose approach\nhttp.ListenAndServe(\":8080\", handler)  // no timeouts\n// More explicit but longer",
          concise: "srv := &http.Server{\n  Addr: \":8080\",\n  Handler: handler,\n  ReadTimeout: 5*time.Second,\n}\nsrv.ListenAndServe()",
        },
      },
      {
        id: "context",
        fn: "context",
        desc: "Carries deadlines, cancellations, and request-scoped values across API boundaries.",
        category: "HTTP & Context",
        subtitle: "Cancellation and deadline propagation",
        signature: "ctx, cancel := context.WithTimeout(parent, dur)  |  defer cancel()",
        descLong: "context.Context is Go's standard mechanism for cancellation, deadlines, and request-scoped values. Always pass context as the first argument to functions that do I/O. WithTimeout, WithDeadline, and WithCancel create derived contexts. Always call the cancel function to release resources.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of context — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"context\"\n  \"errors\"\n  \"fmt\"\n  \"net/http\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of context — common patterns you'll see in production.\n// APPROACH  - Combine context with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// WithTimeout — auto-cancels after duration\nctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\ndefer cancel()  // always call cancel to release resources\n\nreq, _ := http.NewRequestWithContext(ctx, \"GET\", url, nil)\nresp, err := http.DefaultClient.Do(req)\nif err != nil {\n  if errors.Is(ctx.Err(), context.DeadlineExceeded) {\n    return nil, fmt.Errorf(\"request timed out\")\n  }\n  return nil, err\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of context — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// WithCancel — manual cancellation,ctx, cancel := context.WithCancel(context.Background()),go worker(ctx),time.Sleep(3 * time.Second),cancel()  // signal worker to stop,\n\n// Values — request-scoped data,type ctxKey string,ctx = context.WithValue(ctx, ctxKey(\"userID\"), \"123\"),userID := ctx.Value(ctxKey(\"userID\")).(string)"
                  }
        ],
        tips: [
                  "Always pass ctx as the first argument by convention: func Do(ctx context.Context, ...)",
                  "Always defer cancel() — even if you cancel early, the defer is a safety net.",
                  "Use a custom unexported type for context keys to avoid collisions: type ctxKey string.",
                  "context.Background() is the root context for main, tests, and top-level server handlers."
        ],
        mistake: "Storing context in a struct field — context should be passed explicitly through function parameters, not stored. This is a Go idiom enforced by the context package docs.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype Handler struct { Ctx context.Context }\nh.Ctx.Done()\n// More explicit but longer",
          concise: "func (h *Handler) ServeHTTP(ctx context.Context, w ResponseWriter) {\n  <-ctx.Done()\n}",
        },
      },
      {
        id: "go-testing",
        fn: "testing package",
        desc: "Go's built-in test framework — table-driven tests, subtests, benchmarks, and test helpers.",
        category: "Testing",
        subtitle: "Built-in test runner and assertion patterns",
        signature: "func TestXxx(t *testing.T)  |  t.Run(name, func(t *testing.T))",
        descLong: "Go's testing package is built in — no third-party framework needed. Test functions start with Test; benchmarks with Benchmark; examples with Example. Table-driven tests with t.Run() for subtests are the idiomatic Go testing pattern. t.Helper() marks a function as a test helper so errors report the caller's line.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of testing package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage math_test\n\nimport (\n  \"testing\"\n  \"github.com/example/math\"\n)\n\nfunc TestAdd(t *testing.T) {\n  // Table-driven test\n  tests := []struct {\n    name string\n    a, b int\n    want int\n  }{\n    {\"positive\", 2, 3, 5},\n    {\"negative\", -1, -1, -2},\n    {\"zero\",      0, 0,  0},\n  }\n\n  for _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n      got := math.Add(tt.a, tt.b)\n      if got != tt.want {\n        t.Errorf(\"Add(%d, %d) = %d, want %d\", tt.a, tt.b, got, tt.want)\n      }\n    })\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of testing package — common patterns you'll see in production.\n// APPROACH  - Combine testing package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Test helper — t.Helper() makes errors point to the caller\nfunc assertEqual(t *testing.T, got, want int) {\n  t.Helper()\n  if got != want {\n    t.Errorf(\"got %d, want %d\", got, want)\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of testing package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Benchmark,func BenchmarkAdd(b *testing.B) {,  for b.N > 0; b.N-- {,    math.Add(1, 2),  },}"
                  }
        ],
        tips: [
                  "Table-driven tests with t.Run() give each case an independent failure and clear name.",
                  "t.Helper() in helpers makes failure lines point to the test, not the helper function.",
                  "Run specific tests: go test -run TestAdd/positive",
                  "Use testify/assert for richer assertions: assert.Equal(t, want, got)."
        ],
        mistake: "Not using t.Helper() in assertion helpers — error messages will point to the helper line, not the failing test case line.",
        shorthand: {
          verbose: "func assertEqual(t *testing.T, got, want string) {\n  if got != want { t.Errorf(\"got %s, want %s\", got, want) }\n}",
          concise: "func assertEqual(t *testing.T, got, want string) {\n  t.Helper()\n  if got != want { t.Errorf(\"got %s, want %s\", got, want) }\n}",
        },
      },
      {
        id: "httptest",
        fn: "httptest package",
        desc: "Test HTTP handlers without starting a real server — httptest.NewRecorder() and httptest.NewServer().",
        category: "Testing",
        subtitle: "In-process HTTP handler testing",
        signature: "w := httptest.NewRecorder()  |  srv := httptest.NewServer(handler)",
        descLong: "The httptest package provides two approaches: httptest.NewRecorder() tests a handler in-process with no network, and httptest.NewServer() starts a real local HTTP server for integration tests. Both are lightweight, fast, and require no cleanup configuration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of httptest package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"net/http\"\n  \"net/http/httptest\"\n  \"testing\"\n)\n\nfunc TestHealthHandler(t *testing.T) {\n  // In-process test — no network\n  req := httptest.NewRequest(\"GET\", \"/health\", nil)\n  w   := httptest.NewRecorder()\n\n  HealthHandler(w, req)\n\n  resp := w.Result()\n  if resp.StatusCode != http.StatusOK {\n    t.Errorf(\"status = %d, want %d\", resp.StatusCode, http.StatusOK)\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of httptest package — common patterns you'll see in production.\n// APPROACH  - Combine httptest package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Full integration test with real server\nfunc TestIntegration(t *testing.T) {\n  ts := httptest.NewServer(http.HandlerFunc(HealthHandler))\n  defer ts.Close()\n\n  resp, err := http.Get(ts.URL + \"/health\")\n  if err != nil { t.Fatal(err) }\n  defer resp.Body.Close()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of httptest package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nif resp.StatusCode != http.StatusOK {\n    t.Errorf(\"status = %d, want 200\", resp.StatusCode)\n  }\n}"
                  }
        ],
        tips: [
                  "httptest.NewRecorder() is faster — use it for unit testing individual handlers.",
                  "httptest.NewServer() is better for testing middleware chains and routing.",
                  "Always defer ts.Close() to clean up the test server.",
                  "w.Result() builds a *http.Response from the recorder — use it to check headers and body."
        ],
        mistake: "Starting a real HTTP server on a fixed port in tests — it fails if the port is in use. Use httptest.NewServer() which picks a free port automatically.",
        shorthand: {
          verbose: "// Manual / verbose approach\nfunc TestAPI(t *testing.T) {\n  http.ListenAndServe(\":9999\", handler)  // fixed port\n// More explicit but longer",
          concise: "func TestAPI(t *testing.T) {\n  srv := httptest.NewServer(handler)\n  defer srv.Close()\n  resp, _ := http.Get(srv.URL + \"/api\")\n}",
        },
      },
      {
        id: "sort-package",
        fn: "sort package",
        desc: "Sort slices with sort.Slice — and use the generic slices.Sort for comparable types in Go 1.21.",
        category: "Sort & Time",
        subtitle: "Flexible slice sorting",
        signature: "sort.Slice(s, func(i, j int) bool)  |  slices.Sort(s)",
        descLong: "sort.Slice sorts in-place using a less function. For simple comparable types, slices.Sort (Go 1.21) is cleaner. sort.Search performs binary search on a sorted slice. sort.SliceStable preserves relative order of equal elements.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sort package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"sort\"\n  \"slices\"\n)\n\nusers := []User{\n  {Name: \"Carol\", Age: 25},\n  {Name: \"Alice\", Age: 30},\n  {Name: \"Bob\",   Age: 25},\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sort package — common patterns you'll see in production.\n// APPROACH  - Combine sort package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sort by age, then name\nsort.Slice(users, func(i, j int) bool {\n  if users[i].Age != users[j].Age {\n    return users[i].Age < users[j].Age\n  }\n  return users[i].Name < users[j].Name\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sort package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Go 1.21 — generic sort for ordered types,nums := []int{5, 2, 8, 1},slices.Sort(nums)            // ascending,slices.SortFunc(users, func(a, b User) int {,  return strings.Compare(a.Name, b.Name),}),\n\n// Binary search,sorted := []int{1, 3, 5, 7, 9},i, found := slices.BinarySearch(sorted, 5) // 2, true,\n\n// Check if sorted,slices.IsSorted(nums) // true"
                  }
        ],
        tips: [
                  "slices.Sort (Go 1.21) is cleaner and safer than sort.Slice for comparable types.",
                  "slices.SortFunc takes a cmp function returning int (negative/zero/positive) like cmp.Compare.",
                  "sort.SliceStable is needed when preserving original order of equal elements matters.",
                  "sort.Search finds the first index where f(i) is true — useful for custom binary search."
        ],
        mistake: "Using sort.Slice on a slice of ints when slices.Sort(nums) is simpler, safer, and reads better.",
        shorthand: {
          verbose: "// Manual / verbose approach\nsort.Slice(nums, func(i, j int) bool { return nums[i] < nums[j] })\n// More explicit but longer",
          concise: "slices.Sort(nums)  // Go 1.21+",
        },
      },
      {
        id: "time-package",
        fn: "time package",
        desc: "Parse, format, measure, and manipulate time — Go's time package with reference time layouts.",
        category: "Sort & Time",
        subtitle: "Time parsing, formatting, and arithmetic",
        signature: "time.Now()  |  time.Parse(layout, s)  |  t.Format(layout)",
        descLong: "Go's time package uses a unique reference time for layouts: Mon Jan 2 15:04:05 MST 2006 (the mnemonic: 1 2 3 4 5 6 7). Parse and Format use this reference time — the exact value of each field tells Go the format. time.Duration is typed — always use time.Second, time.Millisecond etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of time package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"fmt\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of time package — common patterns you'll see in production.\n// APPROACH  - Combine time package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Current time\nnow := time.Now()\nnow.UTC()       // UTC equivalent\nnow.Unix()      // Unix timestamp (seconds)\nnow.UnixMilli() // milliseconds"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of time package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Format — use reference time Mon Jan 2 15:04:05 MST 2006,now.Format(\"2006-01-02\")          // \"2024-03-15\",now.Format(\"2006-01-02 15:04:05\") // \"2024-03-15 14:30:00\",now.Format(time.RFC3339)          // \"2024-03-15T14:30:00Z\",\n\n// Parse,t, err := time.Parse(\"2006-01-02\", \"2024-03-15\"),t, err = time.Parse(time.RFC3339, \"2024-03-15T14:30:00Z\"),\n\n// Arithmetic,future := now.Add(24 * time.Hour),past   := now.Add(-7 * 24 * time.Hour),diff   := future.Sub(now) // time.Duration,\n\n// Duration,d := 2*time.Hour + 30*time.Minute,d.Hours()   // 2.5,d.Minutes() // 150,d.String()  // \"2h30m0s\",\n\n// Ticker,ticker := time.NewTicker(5 * time.Second),defer ticker.Stop(),for t := range ticker.C { fmt.Println(t) }"
                  }
        ],
        tips: [
                  "The reference time is January 2, 15:04:05, 2006, MST — memorize it or use time.RFC3339.",
                  "Always use typed durations: 5*time.Second, not just 5 — prevents unit confusion.",
                  "time.Since(t) is shorthand for time.Now().Sub(t) — very common for timing.",
                  "time.After(d) returns a channel that receives after duration d — useful in select."
        ],
        mistake: "Using a custom format string that guesses the layout — Go's layout system uses the reference time, not strftime patterns. \"YYYY-MM-DD\" is wrong; \"2006-01-02\" is correct.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntime.Parse(\"YYYY-MM-DD\", \"2024-01-15\")  // wrong\n// More explicit but longer",
          concise: "time.Parse(\"2006-01-02\", \"2024-01-15\")  // correct",
        },
      },
      {
        id: "encoding-json",
        fn: "encoding/json",
        desc: "Marshal Go structs to JSON and unmarshal JSON back — automatic type conversion and custom marshaling.",
        category: "Encoding & Serialization",
        subtitle: "JSON marshaling and unmarshaling",
        signature: "json.Marshal(v) []byte  |  json.Unmarshal(data, &v)",
        descLong: "encoding/json converts between Go values and JSON. Marshal returns []byte; Unmarshal populates a pointer. Struct tags control field names and options (omitempty, omit with -). For custom behavior, implement json.Marshaler and json.Unmarshaler interfaces. json.RawMessage preserves the original JSON bytes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of encoding/json — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"encoding/json\"\n  \"fmt\"\n  \"log\"\n  \"time\"\n)\n\ntype Post struct {\n  ID        int       `json:\"id\"`\n  Title     string    `json:\"title\"`\n  Body      string    `json:\"body,omitempty\"`\n  Published bool      `json:\"published\"`\n  CreatedAt time.Time `json:\"created_at\"`\n  Metadata  json.RawMessage `json:\"metadata\"`\n}\n\nfunc main() {\n  // Unmarshal JSON to struct\n  jsonData := `{\n    \"id\": 1,\n    \"title\": \"Hello Go\",\n    \"published\": true,\n    \"created_at\": \"2024-03-15T10:30:00Z\",\n    \"metadata\": {\"views\": 100, \"tags\": [\"go\", \"json\"]}\n  }`\n\n  var post Post\n  err := json.Unmarshal([]byte(jsonData), &post)\n  if err != nil {\n    log.Fatal(err)\n  }\n  fmt.Printf(\"%+v\n\", post)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of encoding/json — common patterns you'll see in production.\n// APPROACH  - Combine encoding/json with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Marshal struct to JSON\n  post2 := Post{\n    ID:        2,\n    Title:     \"Advanced Go\",\n    Published: true,\n    CreatedAt: time.Now(),\n  }\n\n  data, err := json.Marshal(post2)\n  if err != nil {\n    log.Fatal(err)\n  }\n  fmt.Println(string(data))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of encoding/json — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Pretty print,  prettyData, _ := json.MarshalIndent(post2, \"\", \"  \"),  fmt.Println(string(prettyData)),\n\n  // Custom JSON marshaling,  p := CustomType{Value: 42},  customJSON, _ := json.Marshal(p),  fmt.Println(\"Custom:\", string(customJSON)),\n\n  // Unmarshal into map for dynamic structure,  var raw map[string]interface{},  json.Unmarshal([]byte(jsonData), &raw),  fmt.Println(\"Raw title:\", raw[\"title\"]),},\n\n// Custom marshaler,type CustomType struct {,  Value int,},,func (ct CustomType) MarshalJSON() ([]byte, error) {,  return json.Marshal(map[string]interface{}{,    \"custom_value\": ct.Value * 2,,  }),},,func (ct *CustomType) UnmarshalJSON(data []byte) error {,  var obj map[string]interface{},  if err := json.Unmarshal(data, &obj); err != nil {,    return err,  },  if val, ok := obj[\"custom_value\"].(float64); ok {,    ct.Value = int(val / 2),  },  return nil,}"
                  }
        ],
        tips: [
                  "Struct field names must be exported (uppercase) to be marshaled.",
                  "Use `json:\"name\"` tags to rename fields in JSON output.",
                  "omitempty skips the field when zero value — very common for optional fields.",
                  "json:\"-\" permanently omits a field from JSON; never include it.",
                  "Unmarshal needs a pointer: json.Unmarshal(data, &v), not &v will panic.",
                  "json.RawMessage preserves the original bytes — useful for fields with unknown structure."
        ],
        mistake: "Unmarshaling into a non-pointer: var post Post; json.Unmarshal(data, post) fails. Always use &post.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvar post Post\njson.Unmarshal(data, post)  // error\n// More explicit but longer",
          concise: "var post Post\njson.Unmarshal(data, &post)",
        },
      },
      {
        id: "os-io-files",
        fn: "os / io (Files & I/O)",
        desc: "Read and write files with os.ReadFile, os.WriteFile, and io utilities — common file operations.",
        category: "Files & I/O",
        subtitle: "File operations and I/O abstractions",
        signature: "os.ReadFile(name)  |  os.WriteFile(name, data, perm)  |  io.Copy(dst, src)",
        descLong: "os.ReadFile reads entire files into memory; os.WriteFile writes data and creates the file (or truncates if exists). Both handle errors properly. io.Copy efficiently copies between readers and writers. io.Reader and io.Writer are the fundamental abstractions — many APIs accept them for flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of os / io (Files & I/O) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"bufio\"\n  \"fmt\"\n  \"io\"\n  \"log\"\n  \"os\"\n  \"strings\"\n)\n\nfunc main() {\n  // ReadFile — read entire file\n  data, err := os.ReadFile(\"data.txt\")\n  if err != nil {\n    log.Fatal(err)\n  }\n  fmt.Println(\"File contents:\", string(data))"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of os / io (Files & I/O) — common patterns you'll see in production.\n// APPROACH  - Combine os / io (Files & I/O) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// WriteFile — create or truncate and write\n  err = os.WriteFile(\"output.txt\", []byte(\"Hello, World!\n\"), 0644)\n  if err != nil {\n    log.Fatal(err)\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of os / io (Files & I/O) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Append to file,  f, err := os.OpenFile(\"output.txt\", os.O_APPEND|os.O_WRONLY, 0644),  if err != nil {,    log.Fatal(err),  },  defer f.Close(),  fmt.Fprintln(f, \"Appended line\"),\n\n  // Copy between readers and writers,  src := strings.NewReader(\"source data\"),  dst, _ := os.Create(\"dest.txt\"),  defer dst.Close(),  n, err := io.Copy(dst, src),  if err != nil {,    log.Fatal(err),  },  fmt.Printf(\"Copied %d bytes,\", n),\n\n  // Read line-by-line with bufio,  input := strings.NewReader(\"line1,line2,line3,\"),  scanner := bufio.NewScanner(input),  for scanner.Scan() {,    fmt.Println(\"Line:\", scanner.Text()),  },  if err := scanner.Err(); err != nil {,    log.Fatal(err),  },\n\n  // Read with io.Reader interface (accepts *os.File, bytes.Reader, etc.),  processReader(src),},\n\n// Generic function accepting io.Reader,func processReader(r io.Reader) error {,  data, err := io.ReadAll(r),  if err != nil {,    return err,  },  fmt.Println(\"Processed:\", len(data), \"bytes\"),  return nil,},\n\n// File metadata,func fileInfo() {,  info, err := os.Stat(\"data.txt\"),  if err != nil {,    log.Fatal(err),  },  fmt.Printf(\"Name: %s,\", info.Name()),  fmt.Printf(\"Size: %d bytes,\", info.Size()),  fmt.Printf(\"IsDir: %v,\", info.IsDir()),  fmt.Printf(\"Modified: %v,\", info.ModTime()),},\n\n// Walk directory,func walkDir(path string) {,  err := filepath.Walk(path, func(path string, info os.FileInfo, err error) error {,    if err != nil {,      return err,    },    if !info.IsDir() {,      fmt.Println(path),    },    return nil,  }),  if err != nil {,    log.Fatal(err),  },}"
                  }
        ],
        tips: [
                  "os.ReadFile loads the entire file — fine for small files, consider streaming for large ones.",
                  "os.WriteFile with 0644 permissions is typical for text files (rw-r--r--).",
                  "io.Copy is the idiomatic way to copy between readers and writers — efficient and works with any reader/writer pair.",
                  "Always defer Close() on files opened with os.Open or os.OpenFile.",
                  "Accept io.Reader/io.Writer in function signatures for flexibility — works with files, buffers, networks, etc."
        ],
        mistake: "Ignoring Close() errors: defer f.Close() ignores flush errors. For write-critical operations, check: if err := f.Close(); err != nil { ... }",
        shorthand: {
          verbose: "// Manual / verbose approach\ndefer f.Close()  // ignores error\n// More explicit but longer",
          concise: "defer func() {\n  if err := f.Close(); err != nil { log.Error(err) }\n}()",
        },
      },
      {
        id: "regexp",
        fn: "regexp package",
        desc: "Regular expressions — compile patterns and use them to match, find, and replace strings.",
        category: "Text Processing",
        subtitle: "Pattern matching and extraction",
        signature: "regexp.Compile(pattern)  |  regexp.MustCompile(pattern)  |  re.FindString(s)",
        descLong: "regexp.Compile returns (*Regexp, error); MustCompile panics on error. Use MustCompile at package level for literals. Compiled regexps are safe for concurrent use. Methods: FindString, FindAll, Split, ReplaceAll. Use raw strings (backticks) to avoid escaping backslashes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of regexp package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"regexp\"\n  \"strings\"\n)\n\nvar (\n  // Compile at package level — reuse, not thread-safe unless compiled once\n  emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$`)\n  phoneRegex = regexp.MustCompile(`^d{3}-d{3}-d{4}$`)\n)\n\nfunc main() {\n  // Compile with error handling\n  ipRegex, err := regexp.Compile(`^d{1,3}(.d{1,3}){3}$`)\n  if err != nil {\n    log.Fatal(err)\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of regexp package — common patterns you'll see in production.\n// APPROACH  - Combine regexp package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Match — true/false\n  fmt.Println(ipRegex.MatchString(\"192.168.1.1\"))   // true\n  fmt.Println(ipRegex.MatchString(\"256.0.0.0\"))     // true (bad pattern, passes!)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of regexp package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// FindString — first match,  text := \"Contact: john@example.com or alice@test.org\",  email := emailRegex.FindString(text),  fmt.Println(\"Found:\", email)  // john@example.com,\n\n  // FindAllString — all matches,  emails := emailRegex.FindAllString(text, -1),  for _, e := range emails {,    fmt.Println(e),  },\n\n  // FindStringSubmatch — capture groups,  pattern := regexp.MustCompile(`(w+)s*=s*(.*)`),  line := \"name = John\",  matches := pattern.FindStringSubmatch(line),  if len(matches) > 0 {,    fmt.Printf(\"Key: %s, Value: %s,\", matches[1], matches[2]),  },\n\n  // ReplaceAllString — substitute,  dirty := \"The cat and the dog\",  clean := regexp.MustCompile(`(cat|dog)`).ReplaceAllString(dirty, \"animal\"),  fmt.Println(clean)  // The animal and the animal,\n\n  // Split with regex,  csv := regexp.MustCompile(`,s*`),  fields := csv.Split(\"apple, banana, orange\", -1),  fmt.Println(fields)  // [apple banana orange],\n\n  // Validate email,  fmt.Println(isValidEmail(\"test@example.com\"))   // true,  fmt.Println(isValidEmail(\"invalid.email@\"))     // false,},,func isValidEmail(email string) bool {,  return emailRegex.MatchString(email),},\n\n// Extract structured data,type LogEntry struct {,  Timestamp string,  Level     string,  Message   string,},,func parseLog(line string) (*LogEntry, error) {,  pattern := regexp.MustCompile(`[(.*?)] [(w+)] (.*)`),  matches := pattern.FindStringSubmatch(line),  if len(matches) < 4 {,    return nil, fmt.Errorf(\"invalid format\"),  },  return &LogEntry{,    Timestamp: matches[1],,    Level:     matches[2],,    Message:   matches[3],,  }, nil,}"
                  }
        ],
        tips: [
                  "Compile regexps at package level and reuse them — Compile is expensive.",
                  "MustCompile panics on error — use it only for literals known to be valid.",
                  "Use raw strings (backticks) to avoid escaping backslashes: `\\d+` not \"\\\\d+\".",
                  "FindAllString with -1 means \"find all\" (limit=-1); 0 or positive limits results.",
                  "Capture groups in FindStringSubmatch: [0] is full match, [1+] are groups."
        ],
        mistake: "Recompiling the same pattern repeatedly: for _, s := range strings { regexp.Compile(pattern) } — compile once, use many times.",
        shorthand: {
          verbose: "for _, s := range items {\n  re := regexp.Compile(pattern)\n  if re.MatchString(s) { }\n}",
          concise: "re := regexp.MustCompile(pattern)\nfor _, s := range items {\n  if re.MatchString(s) { }\n}",
        },
      },
      {
        id: "bytes-package",
        fn: "bytes package",
        desc: "Byte slice manipulation — Buffer, Join, Split, Contains, and Replace analogous to strings.",
        category: "Text Processing",
        subtitle: "Efficient byte slice operations",
        signature: "bytes.Buffer  |  bytes.Join(slices, sep)  |  bytes.Contains(b, sub)",
        descLong: "The bytes package mirrors strings for byte slices. bytes.Buffer is a resizable byte buffer useful for building or streaming data. Methods like Split, Join, Contains, and Replace work on []byte. bytes.Reader wraps []byte as an io.Reader.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of bytes package — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"bytes\"\n  \"fmt\"\n  \"io\"\n)\n\nfunc main() {\n  // bytes.Buffer — efficient dynamic byte building\n  var buf bytes.Buffer\n  fmt.Fprintf(&buf, \"Hello, %s!\n\", \"World\")\n  buf.WriteString(\"Line 2\n\")\n  buf.WriteByte('X')\n\n  fmt.Println(\"Buffer contents:\", buf.String())\n  fmt.Println(\"Buffer length:\", buf.Len())"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of bytes package — common patterns you'll see in production.\n// APPROACH  - Combine bytes package with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Reset and reuse\n  buf.Reset()\n  fmt.Fprintf(&buf, \"New content\")\n  fmt.Println(buf.String())"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of bytes package — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// bytes.Join — concatenate slices with separator,  lines := [][]byte{,    []byte(\"first\"),,    []byte(\"second\"),,    []byte(\"third\"),,  },  joined := bytes.Join(lines, []byte(\", \")),  fmt.Println(string(joined))  // first, second, third,\n\n  // bytes.Split — split on separator,  data := []byte(\"apple,banana,cherry\"),  parts := bytes.Split(data, []byte(\",\")),  for _, p := range parts {,    fmt.Println(string(p)),  },\n\n  // bytes.Contains / HasPrefix / HasSuffix,  haystack := []byte(\"Hello, World!\"),  fmt.Println(bytes.Contains(haystack, []byte(\"World\")))     // true,  fmt.Println(bytes.HasPrefix(haystack, []byte(\"Hello\")))    // true,  fmt.Println(bytes.HasSuffix(haystack, []byte(\"!\")))        // true,\n\n  // bytes.Index / LastIndex,  idx := bytes.Index(haystack, []byte(\"o\")),  fmt.Println(\"First 'o' at:\", idx)  // 4,\n\n  // bytes.Replace / ReplaceAll,  original := []byte(\"cat and cat\"),  replaced := bytes.ReplaceAll(original, []byte(\"cat\"), []byte(\"dog\")),  fmt.Println(string(replaced))  // dog and dog,\n\n  // bytes.ToUpper / ToLower,  upper := bytes.ToUpper([]byte(\"hello\")),  fmt.Println(string(upper))  // HELLO,\n\n  // bytes.TrimSpace / Trim,  trimmed := bytes.TrimSpace([]byte(\"  hello  \")),  fmt.Println(string(trimmed))  // hello,\n\n  // bytes.Reader — wrap []byte as io.Reader,  br := bytes.NewReader([]byte(\"123456789\")),  buf2 := make([]byte, 3),  n, _ := br.Read(buf2),  fmt.Printf(\"Read %d bytes: %s,\", n, string(buf2)),\n\n  // bytes.Buffer as io.Writer,  var writeBuf bytes.Buffer,  io.WriteString(&writeBuf, \"efficient writing\"),  fmt.Println(writeBuf.String()),},\n\n// Parse CSV-like data efficiently,func parseCSV(data []byte) [][]string {,  var result [][]string,  for _, line := range bytes.Split(data, []byte(\",\")) {,    if len(line) == 0 {,      continue,    },    fields := bytes.Split(line, []byte(\",\")),    var row []string,    for _, f := range fields {,      row = append(row, string(bytes.TrimSpace(f))),    },    result = append(result, row),  },  return result,}"
                  }
        ],
        tips: [
                  "bytes.Buffer is much more efficient than repeated []byte concatenation with +.",
                  "bytes package mirrors strings exactly — if you know strings, bytes is identical for byte slices.",
                  "bytes.Reader wraps []byte as io.Reader — useful for APIs expecting readers.",
                  "Pre-allocate the buffer: buf := bytes.NewBuffer(make([]byte, 0, expectedSize)) to avoid reallocations.",
                  "bytes.Fields() splits on any whitespace — equivalent to strings.Fields()."
        ],
        mistake: "Building large byte slices with repeated += : result += piece creates new allocations each iteration. Use bytes.Buffer or bytes.Join instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvar result []byte\nfor _, part := range parts { result = append(result, part...) }\n// More explicit but longer",
          concise: "var buf bytes.Buffer\nfor _, part := range parts { buf.Write(part) }\nresult := buf.Bytes()",
        },
      },
      {
        id: "database-sql-basics",
        fn: "database/sql (Basics)",
        desc: "SQL database operations — open connections, query, scan rows, and prepared statements.",
        category: "Databases",
        subtitle: "SQL database access basics",
        signature: "sql.Open(driver, dsn)  |  db.QueryRow(sql, args).Scan(&var)  |  db.Query(sql, args)",
        descLong: "database/sql provides database-agnostic SQL access. sql.Open returns a connection pool (not a single connection). Query returns rows to iterate; QueryRow returns at most one row. Use parameterized queries to prevent SQL injection. Prepared statements are optional but useful for repeated queries. Always close rows and database connections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of database/sql (Basics) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"database/sql\"\n  \"fmt\"\n  \"log\"\n  \"time\"\n\n  _ \"github.com/lib/pq\"  // postgres driver — blank import to register\n)\n\ntype User struct {\n  ID    int\n  Name  string\n  Email string\n  Age   int\n}\n\nfunc main() {\n  // Open connection pool\n  db, err := sql.Open(\"postgres\", \"user=postgres dbname=testdb sslmode=disable\")\n  if err != nil {\n    log.Fatal(err)\n  }\n  defer db.Close()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of database/sql (Basics) — common patterns you'll see in production.\n// APPROACH  - Combine database/sql (Basics) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Test connection\n  ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)\n  defer cancel()\n  if err := db.PingContext(ctx); err != nil {\n    log.Fatal(err)\n  }\n  fmt.Println(\"Database connected\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of database/sql (Basics) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// QueryRow — single row,  var user User,  err = db.QueryRowContext(ctx,,    \"SELECT id, name, email, age FROM users WHERE id = $1\",,    1).Scan(&user.ID, &user.Name, &user.Email, &user.Age),  if err == sql.ErrNoRows {,    fmt.Println(\"No user found\"),  } else if err != nil {,    log.Fatal(err),  } else {,    fmt.Printf(\"User: %+v,\", user),  },\n\n  // Query — multiple rows,  rows, err := db.QueryContext(ctx, \"SELECT id, name, email FROM users LIMIT 10\"),  if err != nil {,    log.Fatal(err),  },  defer rows.Close(),,  var users []User,  for rows.Next() {,    var u User,    if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {,      log.Fatal(err),    },    users = append(users, u),  },  if err := rows.Err(); err != nil {,    log.Fatal(err),  },  fmt.Printf(\"Found %d users,\", len(users)),\n\n  // Exec — insert, update, delete,  result, err := db.ExecContext(ctx,,    \"INSERT INTO users (name, email, age) VALUES ($1, $2, $3)\",,    \"Alice\", \"alice@example.com\", 30),  if err != nil {,    log.Fatal(err),  },  lastID, _ := result.LastInsertId(),  rowsAffected, _ := result.RowsAffected(),  fmt.Printf(\"Inserted ID: %d, Rows affected: %d,\", lastID, rowsAffected),\n\n  // Prepared statement — reuse for efficiency,  stmt, err := db.PrepareContext(ctx, \"SELECT id, name FROM users WHERE age > $1\"),  if err != nil {,    log.Fatal(err),  },  defer stmt.Close(),,  for age := 18; age <= 30; age += 5 {,    rows, _ := stmt.QueryContext(ctx, age),    for rows.Next() {,      var id int,      var name string,      rows.Scan(&id, &name),      fmt.Printf(\"Age > %d: %s,\", age, name),    },    rows.Close(),  },\n\n  // Transaction,  tx, err := db.BeginTx(ctx, nil),  if err != nil {,    log.Fatal(err),  },\n\n  // Multiple operations,  _, err = tx.ExecContext(ctx, \"INSERT INTO users (name, email) VALUES ($1, $2)\", \"Bob\", \"bob@example.com\"),  if err != nil {,    tx.Rollback(),    log.Fatal(err),  },,  if err := tx.Commit(); err != nil {,    log.Fatal(err),  },  fmt.Println(\"Transaction committed\"),}"
                  }
        ],
        tips: [
                  "Always use parameterized queries (? for MySQL, $1 for Postgres) to prevent SQL injection.",
                  "sql.Open does not connect immediately — use Ping() or PingContext() to verify connectivity.",
                  "Always defer rows.Close() after Query() to release the connection back to the pool.",
                  "Use context.WithTimeout() for all database operations to prevent hanging on slow queries.",
                  "Prepared statements are useful when running the same query many times with different parameters."
        ],
        mistake: "Building SQL strings with string concatenation: fmt.Sprintf(\"SELECT * FROM users WHERE id = %d\", id) — use parameterized queries instead: db.QueryRow(\"SELECT * FROM users WHERE id = $1\", id).",
        shorthand: {
          verbose: "// Manual / verbose approach\nquery := \"SELECT * FROM users WHERE id = \" + id\n// More explicit but longer",
          concise: "db.QueryRow(\"SELECT * FROM users WHERE id = $1\", id)",
        },
      },
    ],
  },
]

export default { meta, sections }
