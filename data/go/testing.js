export const meta = {
  "id": "testing",
  "label": "Testing & Benchmarking",
  "icon": "✓",
  "description": "Testing package, benchmarks, table-driven tests, test helpers, golden files, fuzzing (Go 1.18+), and httptest."
}

export const sections = [

  // ── Section 1: Testing & Benchmarking ─────────────────────────────────────────
  {
    id: "testing",
    title: "Testing & Benchmarking",
    entries: [
      {
        id: "benchmarks",
        fn: "Benchmarks",
        desc: "Measure function performance with testing.B — run and compare code speed.",
        category: "Benchmarking",
        subtitle: "Performance measurement with go test -bench",
        signature: "func BenchmarkXxx(b *testing.B) { ... }",
        descLong: "Benchmark functions start with Benchmark and receive *testing.B. Loop b.N times (the framework determines N). Use b.ResetTimer() to exclude setup. Use b.StopTimer()/StartTimer() to exclude parts. Run with go test -bench=. to run all benchmarks. Compare with benchstat tool.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Benchmarks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"sort\"\n  \"strings\"\n  \"testing\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Benchmarks — common patterns you'll see in production.\n// APPROACH  - Combine Benchmarks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple benchmark\nfunc BenchmarkSort(b *testing.B) {\n  data := []int{3, 1, 4, 1, 5, 9, 2, 6}\n  b.ResetTimer()  // exclude setup time\n\n  for i := 0; i < b.N; i++ {\n    sort.Ints(data)\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Benchmarks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Benchmark with sub-benchmarks,func BenchmarkSortVariants(b *testing.B) {,  sizes := []struct {,    name string,    size int,  }{,    {\"10\", 10},,    {\"100\", 100},,    {\"1000\", 1000},,  },,  for _, sz := range sizes {,    b.Run(sz.name, func(b *testing.B) {,      data := make([]int, sz.size),      for i := 0; i < sz.size; i++ {,        data[i] = sz.size - i,      },      b.ResetTimer(),,      for i := 0; i < b.N; i++ {,        sort.Ints(data),      },    }),  },},\n\n// Benchmark with memory allocation tracking,func BenchmarkStringConcat(b *testing.B) {,  b.Run(\"plus\", func(b *testing.B) {,    b.ReportAllocs()  // report memory allocations,    for i := 0; i < b.N; i++ {,      s := \"a\" + \"b\" + \"c\",      _ = s,    },  }),,  b.Run(\"Builder\", func(b *testing.B) {,    b.ReportAllocs(),    for i := 0; i < b.N; i++ {,      var sb strings.Builder,      sb.WriteString(\"a\"),      sb.WriteString(\"b\"),      sb.WriteString(\"c\"),      _ = sb.String(),    },  }),},\n\n// Pause/resume timer (exclude expensive setup),func BenchmarkWithSetup(b *testing.B) {,  b.ResetTimer(),,  for i := 0; i < b.N; i++ {,    b.StopTimer(),    setup := expensiveSetup()  // excluded from measurement,    b.StartTimer(),,    processData(setup),  },},,func expensiveSetup() interface{} { return nil },func processData(x interface{}) {}"
                  }
        ],
        tips: [
                  "Run benchmarks: go test -bench=. -benchmem shows allocations.",
                  "b.ResetTimer() excludes setup code before the loop.",
                  "b.ReportAllocs() shows memory allocations per operation.",
                  "Use benchstat to compare benchmark runs: go install golang.org/x/perf/cmd/benchstat@latest",
                  "Avoid println() in benchmark loops — it adds overhead."
        ],
        mistake: "Calling b.ResetTimer() inside the loop — it resets each iteration, skewing results. Call it once before the loop.",
        shorthand: {
          verbose: "func BenchmarkSort(b *testing.B) {\n  data := makeTestData()\n  for i := 0; i < b.N; i++ {\n    sort.Ints(data)\n  }\n}",
          concise: "func BenchmarkSort(b *testing.B) {\n  data := makeTestData()\n  b.ResetTimer()\n  for i := 0; i < b.N; i++ { sort.Ints(data) }\n}",
        },
      },
      {
        id: "table-driven-tests",
        fn: "Table-Driven Tests",
        desc: "Organize tests: []struct{ name, input, want }, t.Run, subtests.",
        category: "Test Patterns",
        subtitle: "Structured test cases, subtest composition, parallel execution",
        signature: "for _, tt := range tests { t.Run(tt.name, func(t *testing.T) { ... }) }",
        descLong: "Table-driven tests organize test cases in a slice of structs. Each case becomes a subtest (t.Run), giving clear names and separate failure reporting. Subtests can run in parallel with t.Parallel(). Combine with helper functions for DRY assertions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Table-Driven Tests — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage strconv_test\n\nimport (\n  \"fmt\"\n  \"strconv\"\n  \"testing\"\n)\n\nfunc TestAtoi(t *testing.T) {\n  tests := []struct {\n    name      string\n    input     string\n    want      int\n    wantError bool\n  }{\n    {name: \"positive\", input: \"123\", want: 123},\n    {name: \"negative\", input: \"-456\", want: -456},\n    {name: \"zero\", input: \"0\", want: 0},\n    {name: \"invalid\", input: \"abc\", wantError: true},\n    {name: \"overflow\", input: \"999999999999999999\", wantError: true},\n  }\n\n  for _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n      t.Parallel()  // safe to run in parallel\n\n      got, err := strconv.Atoi(tt.input)\n\n      if (err != nil) != tt.wantError {\n        t.Errorf(\"error mismatch: got %v, want error=%v\", err, tt.wantError)\n      }\n\n      if !tt.wantError && got != tt.want {\n        t.Errorf(\"got %d, want %d\", got, tt.want)\n      }\n    })\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Table-Driven Tests — common patterns you'll see in production.\n// APPROACH  - Combine Table-Driven Tests with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// With setup/teardown per subtest\nfunc TestWithFixture(t *testing.T) {\n  tests := []struct {\n    name string\n    fn   func(t *testing.T)\n  }{\n    {\n      name: \"can create\",\n      fn: func(t *testing.T) {\n        db := setupDB(t)\n        defer teardownDB(t, db)\n        // test with db\n      },\n    },\n    {\n      name: \"can delete\",\n      fn: func(t *testing.T) {\n        db := setupDB(t)\n        defer teardownDB(t, db)\n        // test with db\n      },\n    },\n  }\n\n  for _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n      tt.fn(t)\n    })\n  }\n}\n\nfunc setupDB(t *testing.T) interface{} {\n  t.Helper()\n  return nil\n}\n\nfunc teardownDB(t *testing.T, db interface{}) {\n  t.Helper()\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Table-Driven Tests — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Assertion helper,func assertEqual(t *testing.T, got, want interface{}) {,  t.Helper(),  if got != want {,    t.Errorf(\"got %v, want %v\", got, want),  },}"
                  }
        ],
        tips: [
                  "t.Parallel() inside t.Run() makes subtests run concurrently — faster test execution.",
                  "t.Helper() on assertion helpers makes failure line numbers point to the test, not the helper.",
                  "Subtest names compose: parent/child — go test -run Parent/child runs specific subtests.",
                  "Skip tests with t.Skip(), mark as expected failure with t.Fail() + t.SkipNow().",
                  "Use subtests for setup/teardown per case — cleaner than test fixtures."
        ],
        mistake: "Not using t.Parallel() — table-driven subtests can run in parallel and are much faster. Always add t.Parallel() in subtests.",
        shorthand: {
          verbose: "for _, tt := range tests {\n  t.Run(tt.name, func(t *testing.T) {\n    result, err := strconv.Atoi(tt.input)\n    if err != nil != tt.wantError { t.Fail() }\n  })\n}",
          concise: "for _, tt := range tests {\n  t.Run(tt.name, func(t *testing.T) {\n    t.Parallel()\n    result, err := strconv.Atoi(tt.input)\n  })\n}",
        },
      },
      {
        id: "testify-basics",
        fn: "testify/assert & testify/require",
        desc: "Assertion library: assert.Equal, require.NoError, testify/mock.",
        category: "Test Utilities",
        subtitle: "assert vs require, rich assertions, mock.Mock",
        signature: "assert.Equal(t, expected, actual)  |  require.NoError(t, err)  |  mock.On().Return()",
        descLong: "testify/assert provides richer assertions (Equal, Contains, Error, etc.) with clear failure messages. assert.X continues; require.X stops the test. testify/mock helps mock interfaces without hand-writing. Many teams prefer testify over basic t.Errorf comparisons.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of testify/assert & testify/require — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage calc_test\n\nimport (\n  \"fmt\"\n  \"github.com/stretchr/testify/assert\"\n  \"github.com/stretchr/testify/mock\"\n  \"github.com/stretchr/testify/require\"\n  \"testing\"\n)\n\nfunc TestAssertions(t *testing.T) {\n  // Equal\n  assert.Equal(t, 2+2, 4)\n  assert.NotEqual(t, 2+2, 5)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of testify/assert & testify/require — common patterns you'll see in production.\n// APPROACH  - Combine testify/assert & testify/require with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Strings\n  assert.Contains(t, \"hello world\", \"world\")\n  assert.StartsWith(t, \"Go\", \"G\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of testify/assert & testify/require — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Arrays/slices,  assert.ElementsMatch(t, []int{1, 2, 3}, []int{3, 1, 2}),\n\n  // Errors,  result, err := divide(10, 0),  assert.Error(t, err, \"should have error\"),  assert.Nil(t, result),\n\n  // Stop test on first failure (require vs assert),  require.NoError(t, err)  // stops if error,},,func divide(a, b int) (int, error) {,  if b == 0 {,    return 0, fmt.Errorf(\"division by zero\"),  },  return a / b, nil,},\n\n// Mock example,type Database interface {,  Get(key string) (string, error),  Set(key, value string) error,},,type MockDB struct {,  mock.Mock,},,func (m *MockDB) Get(key string) (string, error) {,  args := m.Called(key),  return args.String(0), args.Error(1),},,func (m *MockDB) Set(key, value string) error {,  args := m.Called(key, value),  return args.Error(0),},,func TestWithMock(t *testing.T) {,  mockDB := new(MockDB),\n\n  // Expect a call,  mockDB.On(\"Get\", \"user:1\").Return(\"Alice\", nil),  mockDB.On(\"Set\", \"user:1\", \"Alice\").Return(nil),\n\n  // Call mock,  result, err := mockDB.Get(\"user:1\"),  require.NoError(t, err),  assert.Equal(t, \"Alice\", result),\n\n  // Verify all expectations met,  mockDB.AssertExpectations(t),\n\n  // Verify specific call count,  mockDB.AssertCalled(t, \"Get\", \"user:1\"),  mockDB.AssertNumberOfCalls(t, \"Get\", 1),},\n\n// Suite example,type MathSuite struct {,  *require.Assertions,},,func (s *MathSuite) Test_Addition() {,  assert.Equal(s.T(), 4, 2+2),}"
                  }
        ],
        tips: [
                  "testify/assert continues on failure; use for checks that don't stop the test.",
                  "testify/require stops on failure; use for critical assertions.",
                  "assert.Equal(t, expected, actual) — expected first (against Go convention but clearer).",
                  "testify/mock helps mock interfaces without hand-writing mocks.",
                  "Many projects prefer testify for cleaner error messages and less boilerplate."
        ],
        mistake: "Using assert everywhere — require is for critical assertions that should stop the test if they fail.",
        shorthand: {
          verbose: "result, err := divide(10, 0)\nif err == nil { t.Fail() }\nif result != 0 { t.Fail() }\n// test continues even after first failure",
          concise: "assert.Equal(t, want, got); require.NoError(t, err); mock.On().Return(); AssertExpectations(t)",
        },
      },
      {
        id: "testify-mocks",
        fn: "testify/mock — Interface Mocking",
        desc: "Mock interfaces: On().Return(), AssertCalled, call assertions.",
        category: "Test Utilities",
        subtitle: "mock.Mock, On().Return(), call expectations, assertions",
        signature: "mock.On(\"Method\", args).Return(...).Times(2)  |  m.AssertCalled(t, \"Method\", args)",
        descLong: "testify/mock generates mocks from interfaces. Define expectations with On().Return(). Supports call counts, run functions, and assertion after execution. Cleaner than hand-written mocks for complex interfaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of testify/mock — Interface Mocking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage service_test\n\nimport (\n  \"fmt\"\n  \"github.com/stretchr/testify/mock\"\n  \"github.com/stretchr/testify/require\"\n  \"testing\"\n)\n\ntype UserStore interface {\n  GetUser(id string) (string, error)\n  SaveUser(id, name string) error\n  DeleteUser(id string) error\n}\n\ntype MockUserStore struct {\n  mock.Mock\n}\n\nfunc (m *MockUserStore) GetUser(id string) (string, error) {\n  args := m.Called(id)\n  return args.String(0), args.Error(1)\n}\n\nfunc (m *MockUserStore) SaveUser(id, name string) error {\n  args := m.Called(id, name)\n  return args.Error(0)\n}\n\nfunc (m *MockUserStore) DeleteUser(id string) error {\n  args := m.Called(id)\n  return args.Error(0)\n}\n\nfunc TestUserService(t *testing.T) {\n  mock := new(MockUserStore)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of testify/mock — Interface Mocking — common patterns you'll see in production.\n// APPROACH  - Combine testify/mock — Interface Mocking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Setup expectations ────────────────────────\n  mock.On(\"GetUser\", \"123\").Return(\"Alice\", nil)\n  mock.On(\"SaveUser\", \"123\", \"Bob\").Return(nil)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of testify/mock — Interface Mocking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Call methods ──────────────────────────────,  user, err := mock.GetUser(\"123\"),  require.NoError(t, err),  require.Equal(t, \"Alice\", user),,  err = mock.SaveUser(\"123\", \"Bob\"),  require.NoError(t, err),\n\n  // ── Assert expectations ───────────────────────,  mock.AssertExpectations(t),  mock.AssertCalled(t, \"GetUser\", \"123\"),  mock.AssertNumberOfCalls(t, \"GetUser\", 1),  mock.AssertNotCalled(t, \"DeleteUser\"),},,func TestMockWithRun(t *testing.T) {,  mock := new(MockUserStore),\n\n  // Call handler function when expected,  mock.On(\"GetUser\", \"456\").Return(\"Charlie\", nil).Run(func(args mock.Arguments) {,    fmt.Println(\"GetUser called with:\", args.Get(0)),  }),,  mock.GetUser(\"456\"),  mock.AssertExpectations(t),},,func TestMockCallCount(t *testing.T) {,  mock := new(MockUserStore),\n\n  // Expect calls multiple times,  mock.On(\"SaveUser\", \"789\", \"Diana\").Return(nil).Times(3),,  mock.SaveUser(\"789\", \"Diana\"),  mock.SaveUser(\"789\", \"Diana\"),  mock.SaveUser(\"789\", \"Diana\"),,  mock.AssertCalled(t, \"SaveUser\", \"789\", \"Diana\"),  mock.AssertNumberOfCalls(t, \"SaveUser\", 3),},,func TestMockWithAnyArgs(t *testing.T) {,  mock := new(MockUserStore),\n\n  // Match any arguments,  mock.On(\"GetUser\", mock.Anything).Return(\"Unknown\", nil),  mock.On(\"SaveUser\", mock.AnythingOfType(\"string\"), mock.AnythingOfType(\"string\")).Return(nil),,  result, _ := mock.GetUser(\"any-id\"),  require.Equal(t, \"Unknown\", result),,  mock.AssertExpectations(t),}"
                  }
        ],
        tips: [
                  "On() defines expectation; Return() sets return value.",
                  "Times() specifies call count; omit for any number of calls.",
                  "Run() executes side effects or custom logic.",
                  "mock.Anything matches any argument; mock.AnythingOfType(type) matches type.",
                  "AssertExpectations checks all expectations were met — at the end of test."
        ],
        mistake: "Forgetting to call AssertExpectations — expectations are never validated.",
        shorthand: {
          verbose: "mock.On(\"Method\", arg1, arg2).Return(result, err)\nmethod(arg1, arg2)\nmock.AssertCalled(t, \"Method\", arg1, arg2)",
          concise: "mock.On(method, args).Return(...); call method; AssertExpectations(t); Times() for count",
        },
      },
      {
        id: "httptest-basics",
        fn: "net/http/httptest — HTTP Handler Testing",
        desc: "Test HTTP handlers: httptest.NewRecorder, httptest.NewServer.",
        category: "Integration Testing",
        subtitle: "ResponseRecorder, test servers, handler testing",
        signature: "httptest.NewRecorder()  |  httptest.NewServer(handler)  |  httptest.NewRequest(method, url, body)",
        descLong: "httptest provides tools for testing HTTP handlers and servers. NewRecorder captures responses. NewServer starts a test server with a handler. NewRequest creates test requests. No external network calls needed — everything in-process.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of net/http/httptest — HTTP Handler Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage api_test\n\nimport (\n  \"encoding/json\"\n  \"io\"\n  \"net/http\"\n  \"net/http/httptest\"\n  \"strings\"\n  \"testing\"\n)\n\nfunc helloHandler(w http.ResponseWriter, r *http.Request) {\n  w.Header().Set(\"Content-Type\", \"application/json\")\n  w.WriteHeader(http.StatusOK)\n  json.NewEncoder(w).Encode(map[string]string{\"message\": \"Hello\"})\n}\n\nfunc TestHandlerWithRecorder(t *testing.T) {\n  // Create a request to pass to handler\n  req, err := http.NewRequest(\"GET\", \"/hello\", nil)\n  if err != nil {\n    t.Fatal(err)\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of net/http/httptest — HTTP Handler Testing — common patterns you'll see in production.\n// APPROACH  - Combine net/http/httptest — HTTP Handler Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Create a ResponseRecorder to record responses\n  rr := httptest.NewRecorder()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of net/http/httptest — HTTP Handler Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Call handler with recorder,  handler := http.HandlerFunc(helloHandler),  handler.ServeHTTP(rr, req),\n\n  // Check status code,  if status := rr.Code; status != http.StatusOK {,    t.Errorf(\"handler returned %v, want %v\", status, http.StatusOK),  },\n\n  // Check Content-Type,  expected := \"application/json\",  if ct := rr.Header().Get(\"Content-Type\"); ct != expected {,    t.Errorf(\"handler returned %v, want %v\", ct, expected),  },\n\n  // Check body,  var result map[string]string,  json.Unmarshal(rr.Body.Bytes(), &result),  if result[\"message\"] != \"Hello\" {,    t.Errorf(\"handler returned %v\", result),  },},,func TestServerWithClient(t *testing.T) {,  // Create a test server,  server := httptest.NewServer(http.HandlerFunc(helloHandler)),  defer server.Close(),\n\n  // Make a request to the test server,  resp, err := http.Get(server.URL + \"/hello\"),  if err != nil {,    t.Fatal(err),  },  defer resp.Body.Close(),\n\n  // Check response,  if resp.StatusCode != http.StatusOK {,    t.Errorf(\"status: got %d, want %d\", resp.StatusCode, http.StatusOK),  },,  body, _ := io.ReadAll(resp.Body),  if !strings.Contains(string(body), \"Hello\") {,    t.Errorf(\"body: got %s\", string(body)),  },},,func TestRequestWithBody(t *testing.T) {,  body := strings.NewReader(`{\"name\":\"Alice\"}`),  req, _ := http.NewRequest(\"POST\", \"/users\", body),  req.Header.Set(\"Content-Type\", \"application/json\"),,  rr := httptest.NewRecorder(),  handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    w.WriteHeader(http.StatusCreated),    w.Write([]byte(\"User created\")),  }),,  handler.ServeHTTP(rr, req),,  if rr.Code != http.StatusCreated {,    t.Errorf(\"status: got %d, want %d\", rr.Code, http.StatusCreated),  },},,func TestHandlerError(t *testing.T) {,  errorHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    http.Error(w, \"Not found\", http.StatusNotFound),  }),,  req, _ := http.NewRequest(\"GET\", \"/notfound\", nil),  rr := httptest.NewRecorder(),,  errorHandler.ServeHTTP(rr, req),,  if rr.Code != http.StatusNotFound {,    t.Errorf(\"status: got %d, want %d\", rr.Code, http.StatusNotFound),  },,  if !strings.Contains(rr.Body.String(), \"Not found\") {,    t.Errorf(\"body missing error: %s\", rr.Body.String()),  },}"
                  }
        ],
        tips: [
                  "NewRecorder() captures response — check Code, Header(), Body.",
                  "NewServer() is for integration — tests the full http.Server stack.",
                  "NewRequest() creates requests with custom method, URL, body.",
                  "No external network calls — everything runs locally and fast.",
                  "Test handlers in isolation — mock dependencies with interfaces."
        ],
        mistake: "Testing through actual network calls — slower, flakier, requires external service.",
        shorthand: {
          verbose: "req, _ := http.NewRequest(\"GET\", url, nil)\nrr := httptest.NewRecorder()\nhandler.ServeHTTP(rr, req)\nif rr.Code != expected { t.Fail() }",
          concise: "httptest.NewRecorder() for handler isolation; NewServer() for integration; NewRequest() for test requests",
        },
      },
      {
        id: "go-test-flags",
        fn: "Test Flags & Options",
        desc: "go test flags: -run, -v, -count, -race, -bench, -cover.",
        category: "Test Utilities",
        subtitle: "Testing options, filtering, race detector, coverage",
        signature: "go test -run TestName -v -count=1 -race -cover",
        descLong: "go test command supports various flags. -run filters tests by pattern. -v shows output. -count repeats tests N times. -race detects data races. -bench runs benchmarks. -cover measures code coverage. -timeout sets execution timeout.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Flags & Options — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# Test examples (TestAdd, TestSubtract, etc.)\npackage math_test\n\nimport (\n  \"testing\"\n)\n\nfunc TestAdd(t *testing.T) {\n  if 2+2 != 4 {\n    t.Fail()\n  }\n}\n\nfunc TestSubtract(t *testing.T) {\n  if 5-3 != 2 {\n    t.Fail()\n  }\n}\n\nfunc TestMultiply(t *testing.T) {\n  if 3*4 != 12 {\n    t.Fail()\n  }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Flags & Options — common patterns you'll see in production.\n// APPROACH  - Combine Test Flags & Options with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# Command examples:\n# go test                          # Run all tests\n# go test -v                       # Verbose output\n# go test -run TestAdd             # Run only TestAdd\n# go test -run \"Test(Add|Subtract)\" # Run TestAdd or TestSubtract\n# go test -run TestAdd -v          # Verbose TestAdd\n# go test ./...                    # Run all packages\n# go test -count=3                 # Run each test 3 times\n# go test -count=5 -race           # Race detector + multiple runs\n# go test -race                    # Detect data races\n# go test -bench=.                 # Run all benchmarks\n# go test -bench=BenchmarkAdd      # Run specific benchmark\n# go test -benchmem                # Show memory stats\n# go test -cover                   # Coverage percentage\n# go test -coverprofile=cover.out  # Coverage report\n# go test -coverprofile=cover.out && go tool cover -html=cover.out\n# go test -timeout=5s              # Timeout after 5 seconds\n# go test -parallel=4              # Run tests in parallel (4 workers)\n# go test -short                   # Skip long tests (see t.Skip if testing.Short())\n# go test -failfast                # Stop on first failure"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Flags & Options — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Long test example:\nfunc TestLongRunning(t *testing.T) {\n  if testing.Short() {\n    t.Skip(\"Skipping long test in short mode\")\n  }\n  // long test logic\n}\n\n# Conditional test execution:\nfunc TestDependsOnEnv(t *testing.T) {\n  if os.Getenv(\"RUN_SLOW_TESTS\") == \"\" {\n    t.Skip(\"Skipping slow test (set RUN_SLOW_TESTS=1)\")\n  }\n  // test logic\n}"
                  }
        ],
        tips: [
                  "go test -v shows each test — useful for debugging.",
                  "go test -race detects data races — use regularly in CI.",
                  "go test -count=3 repeats tests for consistency.",
                  "go test -cover shows code coverage percentage.",
                  "go tool cover -html for interactive coverage report."
        ],
        mistake: "Not using -race — allows subtle data race bugs to slip through.",
        shorthand: {
          verbose: "go test\ngo test -run TestName\ngo test -bench=.\ngo test -cover",
          concise: "-run pattern; -v verbose; -count N; -race detector; -bench; -cover; -timeout T; -short to skip long tests",
        },
      },
      {
        id: "benchmarking-go",
        fn: "Benchmarking Best Practices",
        desc: "Benchmarks: b.N, b.ReportAllocs, pprof, comparing runs.",
        category: "Benchmarking",
        subtitle: "Micro-benchmarks, allocation tracking, CPU profiling",
        signature: "b.ResetTimer()  |  b.ReportAllocs()  |  go test -bench=. -cpuprofile=cpu.prof",
        descLong: "Write meaningful benchmarks. Use b.N to loop automatically. Reset timer to exclude setup. Report allocations with b.ReportAllocs(). Use benchstat to compare runs. Profile with -cpuprofile and pprof. Measure in realistic conditions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Benchmarking Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage bench_test\n\nimport (\n  \"fmt\"\n  \"strings\"\n  \"testing\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Benchmarking Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Benchmarking Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple string building benchmark\nfunc BenchmarkStringOps(b *testing.B) {\n  tests := []struct {\n    name string\n    fn   func(int) string\n  }{\n    {\n      name: \"concat_plus\",\n      fn: func(n int) string {\n        s := \"\"\n        for i := 0; i < n; i++ {\n          s += fmt.Sprintf(\"%d,\", i)\n        }\n        return s\n      },\n    },\n    {\n      name: \"concat_builder\",\n      fn: func(n int) string {\n        var sb strings.Builder\n        for i := 0; i < n; i++ {\n          fmt.Fprintf(&sb, \"%d,\", i)\n        }\n        return sb.String()\n      },\n    },\n    {\n      name: \"concat_slice\",\n      fn: func(n int) string {\n        parts := make([]string, 0, n)\n        for i := 0; i < n; i++ {\n          parts = append(parts, fmt.Sprintf(\"%d\", i))\n        }\n        return strings.Join(parts, \",\")\n      },\n    },\n  }\n\n  for _, tt := range tests {\n    b.Run(tt.name, func(b *testing.B) {\n      b.ReportAllocs()\n\n      for i := 0; i < b.N; i++ {\n        tt.fn(100)\n      }\n    })\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Benchmarking Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Benchmark with cleanup,func BenchmarkWithCleanup(b *testing.B) {,  b.Run(\"setup_and_teardown\", func(b *testing.B) {,    b.ReportAllocs(),,    for i := 0; i < b.N; i++ {,      b.StopTimer(),      setup := setupResource(),      b.StartTimer(),,      processResource(setup),,      b.StopTimer(),      teardownResource(setup),      b.StartTimer(),    },  }),},,func setupResource() interface{} { return nil },func processResource(x interface{}) {},func teardownResource(x interface{}) {},\n\n// Benchmark with sub-test varying parameters,func BenchmarkVaryingInput(b *testing.B) {,  sizes := []int{10, 100, 1000, 10000},,  for _, size := range sizes {,    data := make([]int, size),    for i := 0; i < size; i++ {,      data[i] = i,    },,    b.Run(fmt.Sprintf(\"n=%d\", size), func(b *testing.B) {,      b.ReportAllocs(),      b.ResetTimer(),,      for i := 0; i < b.N; i++ {,        _ = sumSlice(data),      },    }),  },},,func sumSlice(data []int) int {,  sum := 0,  for _, v := range data {,    sum += v,  },  return sum,},,# Running benchmarks:,# go test -bench=. -benchmem,# go test -bench=. -benchmem -benchtime=5s (run each for 5s),# go test -bench=BenchmarkStringOps -benchmem,# go test -bench=. -cpuprofile=cpu.prof && go tool pprof cpu.prof,,# Comparing benchmarks with benchstat:,# go install golang.org/x/perf/cmd/benchstat@latest,# go test -bench=. -benchmem > old.txt,# # Make changes to code,# go test -bench=. -benchmem > new.txt,# benchstat old.txt new.txt"
                  }
        ],
        tips: [
                  "b.N is automatic — framework adjusts to measure precisely.",
                  "b.ReportAllocs() reveals memory efficiency problems.",
                  "b.ResetTimer() after setup — don't measure setup time.",
                  "b.StopTimer()/StartTimer() for fine control.",
                  "benchstat compares old vs new — shows statistical significance."
        ],
        mistake: "Micro-optimizing for benchmarks that don't matter — measure real workloads first.",
        shorthand: {
          verbose: "for i := 0; i < b.N; i++ {\n  operation()\n}\nb.ReportAllocs()",
          concise: "go test -bench=. -benchmem; b.N auto-adjusts; b.ReportAllocs(); benchstat old.txt new.txt",
        },
      },
      {
        id: "fuzzing-go",
        fn: "Fuzzing (Go 1.18+)",
        desc: "Fuzz testing: f.Add(), f.Fuzz(), corpus, finding crashes.",
        category: "Advanced Testing",
        subtitle: "Property-based testing, random inputs, crash detection",
        signature: "func FuzzXxx(f *testing.F) { f.Add(...); f.Fuzz(func(t *testing.T, input T) { }) }",
        descLong: "Fuzzing (Go 1.18+) uses go-fuzz to generate random inputs and find crashes. Fuzz functions start with Fuzz and receive *testing.F. Call f.Add(corpus) to seed initial examples. f.Fuzz() defines the test logic. Run with go test -fuzz=Fuzz. Failing inputs are saved and re-run.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fuzzing (Go 1.18+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage url_test\n\nimport (\n  \"net/url\"\n  \"strings\"\n  \"testing\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fuzzing (Go 1.18+) — common patterns you'll see in production.\n// APPROACH  - Combine Fuzzing (Go 1.18+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Seed with known good examples\nfunc FuzzParseURL(f *testing.F) {\n  f.Add(\"http://example.com\")\n  f.Add(\"https://user:pass@host:8080/path?query=value#fragment\")\n  f.Add(\"file:///etc/passwd\")\n\n  f.Fuzz(func(t *testing.T, input string) {\n    // Fuzz testing: try parsing with random strings\n    u, err := url.Parse(input)\n    if err == nil {\n      // Should not panic or misbehave\n      _ = u.String()\n      _ = u.Query()\n    }\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fuzzing (Go 1.18+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fuzz with structured input (Go 1.20+),func FuzzJSON(f *testing.F) {,  type Input struct {,    Name string,    Age  int,  },,  f.Add(Input{\"Alice\", 30}),  f.Add(Input{\"\", 0}),,  f.Fuzz(func(t *testing.T, input Input) {,    if input.Age < 0 {,      t.Errorf(\"age should not be negative: %d\", input.Age),    },  }),},\n\n// Find edge cases,func FuzzDivide(f *testing.F) {,  f.Add(10, 2),  f.Add(100, 5),,  f.Fuzz(func(t *testing.T, a, b int) {,    if b == 0 {,      // Expected behavior,      return,    },    result := a / b,    if result*b > a {,      t.Errorf(\"math error: %d / %d = %d\", a, b, result),    },  }),},\n\n// Fuzzing string processing,func FuzzTrimSpace(f *testing.F) {,  f.Add(\"  hello  \"),  f.Add(\"\\t\\nworld\\r\\n\"),  f.Add(\"\\x00null\"),,  f.Fuzz(func(t *testing.T, input string) {,    result := strings.TrimSpace(input),    // Result should not have leading/trailing whitespace,    if len(result) > 0 {,      if result[0] == ' ' || result[len(result)-1] == ' ' {,        t.Errorf(\"TrimSpace failed: %q\", result),      },    },  }),},\n\n// Fuzzing with constraints,func FuzzWithConstraints(f *testing.F) {,  f.Add(\"valid input\"),,  f.Fuzz(func(t *testing.T, input string) {,    // Skip invalid inputs,    if len(input) > 1000 {,      t.Skip(),    },\n\n    // Test your function,    _ = processString(input),  }),},,func processString(s string) string {,  return strings.ToUpper(s),},,# Running fuzzing:,# go test -fuzz=Fuzz (runs continuously until stopped),# go test -fuzz=Fuzz -fuzztime=10s (run for 10 seconds),# go test -fuzz=Fuzz -fuzztime=1000000x (1M iterations),# go test -fuzz=FuzzXxx (specific fuzz test),,# Corpus directory: testdata/fuzz/FuzzName/,# Failing inputs saved automatically — re-run to verify fix"
                  }
        ],
        tips: [
                  "Run fuzzing: go test -fuzz=Fuzz -fuzztime=10s (runs for 10 seconds).",
                  "Failing inputs are saved in testdata/fuzz/FuzzName/ — re-run to verify fix.",
                  "f.Add() seeds the fuzzer with known good examples — fuzzer mutates these.",
                  "Keep fuzz tests fast — slow tests block the fuzzer from exploring.",
                  "Fuzzing is great for parsing, encoding, and any untrusted input processing."
        ],
        mistake: "Slow fuzz tests — the fuzzer runs the test thousands of times. Keep Fuzz functions fast (< 1ms).",
        shorthand: {
          verbose: "func FuzzParseURL(f *testing.F) {\n  f.Add(\"http://example.com\")\n  f.Add(\"https://user:pass@host:8080/path\")\n  f.Fuzz(func(t *testing.T, input string) {\n    u, _ := url.Parse(input)\n    if u != nil { _ = u.String() }\n  })\n}",
          concise: "func FuzzParseURL(f *testing.F) {\n  f.Add(\"http://example.com\")\n  f.Fuzz(func(t *testing.T, input string) {\n    url.Parse(input)\n  })\n}",
        },
      },
      {
        id: "testcontainers-go",
        fn: "testcontainers-go — Docker Containers for Tests",
        desc: "Spin up Postgres/Redis/etc in Docker for integration tests.",
        category: "Integration Testing",
        subtitle: "Docker containers, lifecycle management, test databases",
        signature: "testcontainers.GenericContainer(ctx, req)  |  container.Host(), container.MappedPort()",
        descLong: "testcontainers-go starts Docker containers for integration tests. Automatically manages lifecycle (start, stop, cleanup). Useful for testing against real databases, caches, message queues. No setup required — everything provisioned in test. Perfect for CI/CD pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of testcontainers-go — Docker Containers for Tests — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage integration_test\n\nimport (\n  \"context\"\n  \"database/sql\"\n  \"testing\"\n\n  \"github.com/testcontainers/testcontainers-go\"\n  \"github.com/testcontainers/testcontainers-go/wait\"\n  _ \"github.com/lib/pq\"\n)\n\nfunc TestWithPostgres(t *testing.T) {\n  ctx := context.Background()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of testcontainers-go — Docker Containers for Tests — common patterns you'll see in production.\n// APPROACH  - Combine testcontainers-go — Docker Containers for Tests with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Start Postgres container\n  req := testcontainers.ContainerRequest{\n    Image:        \"postgres:15-alpine\",\n    ExposedPorts: []string{\"5432/tcp\"},\n    Env: map[string]string{\n      \"POSTGRES_DB\":       \"testdb\",\n      \"POSTGRES_USER\":     \"postgres\",\n      \"POSTGRES_PASSWORD\": \"password\",\n    },\n    WaitingFor: wait.ForLog(\"database system is ready to accept connections\"),\n  }\n\n  container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{\n    ContainerRequest: req,\n    Started:          true,\n  })\n  if err != nil {\n    t.Fatal(err)\n  }\n  defer container.Terminate(ctx)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of testcontainers-go — Docker Containers for Tests — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Get connection details,  host, _ := container.Host(ctx),  port, _ := container.MappedPort(ctx, \"5432\"),\n\n  // Connect to database,  dsn := \"postgres://postgres:password@\" + host + \":\" + port.Port() + \"/testdb?sslmode=disable\",  db, err := sql.Open(\"postgres\", dsn),  if err != nil {,    t.Fatal(err),  },  defer db.Close(),\n\n  // Run tests with database,  if err := db.Ping(); err != nil {,    t.Fatal(err),  },,  t.Log(\"Successfully connected to test database\"),},\n\n// Redis example,func TestWithRedis(t *testing.T) {,  ctx := context.Background(),,  req := testcontainers.ContainerRequest{,    Image:        \"redis:7-alpine\",,    ExposedPorts: []string{\"6379/tcp\"},,    WaitingFor:   wait.ForLog(\"Ready to accept connections\"),,  },,  container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{,    ContainerRequest: req,,    Started:          true,,  }),  if err != nil {,    t.Fatal(err),  },  defer container.Terminate(ctx),,  host, _ := container.Host(ctx),  port, _ := container.MappedPort(ctx, \"6379\"),,  redisURL := \"redis://\" + host + \":\" + port.Port(),  t.Logf(\"Redis available at: %s\", redisURL),},\n\n// Multiple containers,func TestWithMultipleServices(t *testing.T) {,  ctx := context.Background(),\n\n  // Start both Postgres and Redis,  pgReq := testcontainers.ContainerRequest{,    Image:        \"postgres:15-alpine\",,    ExposedPorts: []string{\"5432/tcp\"},,    Env: map[string]string{,      \"POSTGRES_PASSWORD\": \"password\",,    },,    WaitingFor: wait.ForLog(\"ready to accept connections\"),,  },,  redisReq := testcontainers.ContainerRequest{,    Image:        \"redis:7-alpine\",,    ExposedPorts: []string{\"6379/tcp\"},,    WaitingFor:   wait.ForLog(\"Ready to accept connections\"),,  },,  pgContainer, _ := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{,    ContainerRequest: pgReq,,    Started:          true,,  }),  defer pgContainer.Terminate(ctx),,  redisContainer, _ := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{,    ContainerRequest: redisReq,,    Started:          true,,  }),  defer redisContainer.Terminate(ctx),\n\n  // Run integration tests against both,  t.Log(\"Both services running\"),}"
                  }
        ],
        tips: [
                  "Containers auto-cleanup after test — no manual teardown needed.",
                  "WaitingFor ensures service is ready before test starts.",
                  "Use MappedPort to get dynamic port (important in CI).",
                  "GenericContainer for any Docker image — not limited to databases.",
                  "Perfect for CI/CD — containers isolated, reproducible, no external deps."
        ],
        mistake: "Testing against a local database instance — breaks in CI and on different machines.",
        shorthand: {
          verbose: "container, _ := testcontainers.GenericContainer(ctx, req)\nhost, _ := container.Host(ctx)\nport, _ := container.MappedPort(ctx, \"port\")\ndefer container.Terminate(ctx)",
          concise: "testcontainers.GenericContainer() to start service; WaitingFor for readiness; MappedPort for connection; Terminate() to cleanup",
        },
      },
      {
        id: "golden-files",
        fn: "Golden File Testing",
        desc: "Compare against golden (expected) files — update with -update flag.",
        category: "Test Patterns",
        subtitle: "Reference-based regression testing, snapshot testing",
        signature: "if update { ioutil.WriteFile(golden, data) } else { expected, _ := ioutil.ReadFile(golden); if string(data) != expected { t.Errorf(...) } }",
        descLong: "Golden file testing compares output against a saved reference file. Useful for complex outputs (formatted text, JSON, HTML) where field-by-field comparison is tedious. Store golden files in testdata/. Update with go test -update or -args -update.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Golden File Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage format_test\n\nimport (\n  \"bytes\"\n  \"flag\"\n  \"io/ioutil\"\n  \"os\"\n  \"path/filepath\"\n  \"testing\"\n)\n\nvar update = flag.Bool(\"update\", false, \"update golden files\")\n\nfunc TestFormat(t *testing.T) {\n  tests := []struct {\n    name   string\n    input  string\n    golden string\n  }{\n    {\n      name:   \"simple\",\n      input:  \"hello world\",\n      golden: \"testdata/format_simple.golden\",\n    },\n    {\n      name:   \"multiline\",\n      input:  \"line1\nline2\nline3\",\n      golden: \"testdata/format_multiline.golden\",\n    },\n  }\n\n  for _, tt := range tests {\n    t.Run(tt.name, func(t *testing.T) {\n      // Generate output\n      output := formatText(tt.input)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Golden File Testing — common patterns you'll see in production.\n// APPROACH  - Combine Golden File Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Compare with golden\n      golden := filepath.Join(\"testdata\", tt.golden)\n\n      if *update {\n        // Update mode: save generated output as new golden\n        if err := os.MkdirAll(filepath.Dir(golden), 0755); err != nil {\n          t.Fatal(err)\n        }\n        if err := ioutil.WriteFile(golden, []byte(output), 0644); err != nil {\n          t.Fatal(err)\n        }\n        return\n      }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Golden File Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Normal mode: compare against golden,      expected, err := ioutil.ReadFile(golden),      if err != nil {,        t.Fatalf(\"failed to read golden file: %v\", err),      },,      if output != string(expected) {,        t.Errorf(\"output mismatch:,got:,%s,,want:,%s\", output, string(expected)),      },    }),  },},,func formatText(input string) string {,  var buf bytes.Buffer,  buf.WriteString(\"FORMATTED:,\"),  buf.WriteString(input),  buf.WriteString(\",:END,\"),  return buf.String(),},\n\n// Snapshot testing with just filename,func TestSnapshot(t *testing.T) {,  data := generateReport(),  snapfile := \"testdata/report.snap\",,  if *update {,    ioutil.WriteFile(snapfile, data, 0644),    return,  },,  expected, _ := ioutil.ReadFile(snapfile),  if !bytes.Equal(data, expected) {,    t.Errorf(\"snapshot mismatch. Update with -update flag\"),  },},,func generateReport() []byte {,  return []byte(\"Report: OK,\"),}"
                  }
        ],
        tips: [
                  "Run golden file tests: go test -run TestFormat",
                  "Update golden files: go test -update (or -args -update)",
                  "Store golden files in testdata/ directory — Git tracks them.",
                  "Use for complex outputs: formatted documents, JSON structures, rendered HTML.",
                  "Golden files are human-readable — review diffs carefully before updating."
        ],
        mistake: "Accidentally running tests with -update and committing changed golden files — always review the diff before updating.",
        shorthand: {
          verbose: "expected, _ := ioutil.ReadFile(goldenPath)\nif output != string(expected) {\n  t.Errorf(\"mismatch: %s\", output)\n}",
          concise: "if *update {\n  ioutil.WriteFile(goldenPath, output, 0644)\n} else {\n  expected, _ := ioutil.ReadFile(goldenPath)\n  if output != string(expected) { t.Fail() }\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
