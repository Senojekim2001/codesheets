export const meta = {
  "id": "errors",
  "label": "Error Handling",
  "icon": "🚨",
  "description": "Go error patterns, wrapping, errors.Is/As, custom error types, and panic/recover."
}

export const sections = [

  // ── Section 1: Error Handling ─────────────────────────────────────────
  {
    id: "error-handling",
    title: "Error Handling",
    entries: [
      {
        id: "error-interface",
        fn: "error interface",
        desc: "Go errors are values implementing the error interface — just a type with an Error() string method.",
        category: "Error Basics",
        subtitle: "Errors as plain values",
        signature: "type error interface { Error() string }",
        descLong: "The error interface has a single method: Error() string. Return nil for success; return an error value for failure. errors.New() creates a simple static error. fmt.Errorf with %w wraps errors with context while preserving the original. Always handle errors immediately — idiom is to check err != nil right after the call.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of error interface — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"database/sql\"\n  \"errors\"\n  \"fmt\"\n  \"log/slog\"\n  \"net/http\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of error interface — common patterns you'll see in production.\n// APPROACH  - Combine error interface with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sentinel errors for specific failure modes\nvar (\n  ErrNotFound    = errors.New(\"not found\")\n  ErrUnauthorized = errors.New(\"unauthorized\")\n  ErrValidation  = errors.New(\"validation failed\")\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of error interface — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Realistic error handling in a handler,func getUserHandler(w http.ResponseWriter, r *http.Request, db *sql.DB) {,  id := r.PathValue(\"id\"),  user, err := fetchUser(r.Context(), db, id),  if err != nil {,    // Check sentinel errors,    if errors.Is(err, ErrNotFound) {,      http.Error(w, \"User not found\", http.StatusNotFound),      return,    },    if errors.Is(err, ErrUnauthorized) {,      http.Error(w, \"Unauthorized\", http.StatusForbidden),      return,    },    // Log unexpected errors,    slog.Error(\"failed to fetch user\", \"id\", id, \"err\", err),    http.Error(w, \"Internal server error\", http.StatusInternalServerError),    return,  },  // Success path,  w.Header().Set(\"Content-Type\", \"application/json\"),  w.WriteHeader(http.StatusOK),},,func fetchUser(ctx context.Context, db *sql.DB, id string) (*User, error) {,  if id == \"\" {,    return nil, fmt.Errorf(\"fetchUser: %w\", ErrValidation),  },  var user User,  err := db.QueryRowContext(ctx, \"SELECT id, name FROM users WHERE id = ?\", id).Scan(&user.ID, &user.Name),  if err == sql.ErrNoRows {,    return nil, fmt.Errorf(\"getUserById %q: %w\", id, ErrNotFound),  },  if err != nil {,    return nil, fmt.Errorf(\"query failed: %w\", err),  },  return &user, nil,}"
                  }
        ],
        tips: [
                  "Sentinel errors (var Err = errors.New(...)) are comparable with errors.Is across wrapping.",
                  "Add context to errors with fmt.Errorf(\"operation: %w\", err) — always wrap with %w.",
                  "errors.Is unwraps the chain; errors.As finds a target type in the chain.",
                  "Return errors, don't panic — panics are for unrecoverable programming bugs."
        ],
        mistake: "Using == to compare wrapped errors: err == ErrNotFound fails after wrapping. Use errors.Is(err, ErrNotFound) which unwraps the chain.",
        shorthand: {
          verbose: "// Manual / verbose approach\nreturn fmt.Errorf(\"operation failed: %v\", err)\n// More explicit but longer",
          concise: "return fmt.Errorf(\"operation failed: %w\", err)",
        },
      },
      {
        id: "custom-errors",
        fn: "Custom Error Types",
        desc: "Implement the error interface on a struct to carry structured error data.",
        category: "Error Basics",
        subtitle: "Structured errors with context",
        signature: "type MyError struct { ... }  func (e *MyError) Error() string",
        descLong: "Custom error types carry additional structured data beyond a message — HTTP status codes, validation field names, operation context. Implement Error() string to satisfy the error interface. Use errors.As() to extract the custom type from a wrapped error chain.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Error Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"errors\"\n  \"fmt\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Error Types — common patterns you'll see in production.\n// APPROACH  - Combine Custom Error Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Custom error type\ntype ValidationError struct {\n  Field   string\n  Message string\n}\n\nfunc (e *ValidationError) Error() string {\n  return fmt.Sprintf(\"validation error: %s — %s\", e.Field, e.Message)\n}\n\nfunc validateAge(age int) error {\n  if age < 0 {\n    return &ValidationError{Field: \"age\", Message: \"must be non-negative\"}\n  }\n  if age > 150 {\n    return &ValidationError{Field: \"age\", Message: \"unrealistically large\"}\n  }\n  return nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Error Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Extract with errors.As,err := validateAge(-1),var ve *ValidationError,if errors.As(err, &ve) {,  fmt.Printf(\"Field %q: %s,\", ve.Field, ve.Message),},\n\n// Wrap custom errors,return fmt.Errorf(\"createUser: %w\", &ValidationError{...})"
                  }
        ],
        tips: [
                  "Use a pointer receiver for Error() when the error type contains a pointer or needs identity.",
                  "errors.As traverses the wrapping chain — works even after fmt.Errorf(%w) wrapping.",
                  "The second arg to errors.As is a pointer to the target type: errors.As(err, &target).",
                  "Prefer returning errors over panicking for all expected failure conditions."
        ],
        mistake: "Using errors.Is to match a custom error type — Is compares values. For type-based matching, always use errors.As.",
        shorthand: {
          verbose: "// Manual / verbose approach\nve := &ValidationError{}\nif err == ve { }\n// More explicit but longer",
          concise: "var ve *ValidationError\nif errors.As(err, &ve) { }",
        },
      },
      {
        id: "panic-recover",
        fn: "panic / recover",
        desc: "panic unwinds the stack. recover() inside a deferred function catches it and returns the value.",
        category: "Panic & Recover",
        subtitle: "Last-resort error handling",
        signature: "defer func() { if r := recover(); r != nil { ... } }()",
        descLong: "panic stops normal execution and unwinds the goroutine's stack, running deferred functions. recover() called inside a deferred function captures the panic value and stops the unwind. Use panic only for genuinely unrecoverable situations (invariant violations, programmer bugs). HTTP servers should recover at the handler boundary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of panic / recover — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n  \"regexp\"\n  \"runtime/debug\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of panic / recover — common patterns you'll see in production.\n// APPROACH  - Combine panic / recover with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Panic — unrecoverable programmer error\nfunc MustCompile(expr string) *regexp.Regexp {\n  re, err := regexp.Compile(expr)\n  if err != nil {\n    panic(fmt.Sprintf(\"invalid regex %q: %v\", expr, err))\n  }\n  return re\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of panic / recover — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Recover at HTTP handler boundary,func safeHandler(h http.HandlerFunc) http.HandlerFunc {,  return func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if rec := recover(); rec != nil {,        log.Printf(\"panic: %v,%s\", rec, debug.Stack()),        http.Error(w, \"internal server error\", 500),      },    }(),    h(w, r),  },},\n\n// Must pattern — panics on setup errors,var re = MustCompile(`^d{4}-d{2}-d{2}$`)"
                  }
        ],
        tips: [
                  "The Must* naming convention (regexp.MustCompile) signals a function that panics on error.",
                  "Recover only works in the same goroutine — panics in other goroutines will still crash.",
                  "Always recover at goroutine boundaries (HTTP handlers, worker goroutines).",
                  "Use panic for programmer errors (nil pointer, out-of-bounds); use error for expected failures."
        ],
        mistake: "Using panic/recover for normal error handling — Go's convention is to return errors as values. Panic/recover is for exceptional, truly unrecoverable situations.",
        shorthand: {
          verbose: "// Manual / verbose approach\nif validate(input) != nil { panic(\"invalid\") }\n// More explicit but longer",
          concise: "if err := validate(input); err != nil { return err }",
        },
      },
      {
        id: "slog",
        fn: "log/slog",
        desc: "Go 1.21's built-in structured logging package — JSON output, log levels, and context-aware logging.",
        category: "Structured Logging",
        subtitle: "Structured JSON logging in the stdlib",
        signature: "slog.Info(\"msg\", \"key\", value)  |  slog.With(\"key\", val).Info(\"msg\")",
        descLong: "log/slog (Go 1.21) is the standard structured logger. It supports key-value attributes, log levels (Debug, Info, Warn, Error), JSON output, and context integration. Create child loggers with .With() to carry shared attributes. Custom handlers let you route logs to any backend.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of log/slog — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"log/slog\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of log/slog — common patterns you'll see in production.\n// APPROACH  - Combine log/slog with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Default logger — text output to stderr\nslog.Info(\"server started\", \"port\", 8080)\nslog.Error(\"database error\", \"err\", err, \"query\", sql)\nslog.Debug(\"cache hit\", \"key\", k, \"ttl\", ttl)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of log/slog — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// JSON handler for production,logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{,  Level: slog.LevelInfo,,})),slog.SetDefault(logger) // set as package default,\n\n// Structured output:,// {\"time\":\"...\",\"level\":\"INFO\",\"msg\":\"server started\",\"port\":8080},\n\n// Child logger — inherits attributes,requestLogger := logger.With(,  \"requestId\", uuid,,  \"userId\", userID,,),requestLogger.Info(\"processing request\"),requestLogger.Error(\"validation failed\", \"field\", \"email\"),\n\n// Context-aware logging,slog.InfoContext(ctx, \"handled\", \"duration\", time.Since(start))"
                  }
        ],
        tips: [
                  "Use key-value pairs, not fmt.Sprintf — structured data is searchable in log aggregators.",
                  ".With() creates a child logger that inherits all attributes — great for request context.",
                  "slog.SetDefault() replaces the global logger used by slog.Info/Error etc.",
                  "Use slog.LevelDebug only in development — disable with LevelInfo in production."
        ],
        mistake: "Using fmt.Sprintf to format log messages: slog.Info(fmt.Sprintf(\"user %s logged in\", id)) — pass the value as a structured attribute instead: slog.Info(\"user logged in\", \"userId\", id).",
        shorthand: {
          verbose: "// Manual / verbose approach\nslog.Info(fmt.Sprintf(\"user %s logged in\", id))\n// More explicit but longer",
          concise: "slog.Info(\"user logged in\", \"userId\", id)",
        },
      },
      {
        id: "errors-join",
        fn: "errors.Join() (Go 1.20)",
        desc: "Combine multiple errors into one — both errors.Is() and errors.As() work on each constituent error.",
        category: "Error Wrapping & Joining",
        subtitle: "Multi-error aggregation",
        signature: "err := errors.Join(err1, err2, err3)",
        descLong: "errors.Join (Go 1.20) combines multiple errors into a single error value. The resulting error's message is the newline-joined messages of non-nil inputs. errors.Is and errors.As traverse all constituent errors. nil inputs are ignored. Essential for validation functions that collect multiple field errors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of errors.Join() (Go 1.20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"errors\"\n  \"fmt\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of errors.Join() (Go 1.20) — common patterns you'll see in production.\n// APPROACH  - Combine errors.Join() (Go 1.20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Validate multiple fields, collect all errors\nfunc validateUser(u User) error {\n  var errs []error\n\n  if u.Name == \"\" {\n    errs = append(errs, fmt.Errorf(\"name: %w\", ErrRequired))\n  }\n  if !isValidEmail(u.Email) {\n    errs = append(errs, fmt.Errorf(\"email: %w\", ErrInvalidFormat))\n  }\n  if u.Age < 0 || u.Age > 150 {\n    errs = append(errs, fmt.Errorf(\"age: %w\", ErrOutOfRange))\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of errors.Join() (Go 1.20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nreturn errors.Join(errs...) // nil if errs is empty\n}\n\nerr := validateUser(u)\nif err != nil {\n  errors.Is(err, ErrRequired) // true if any field is required\n  fmt.Println(err)\n  // name: required\n  // email: invalid format\n}"
                  }
        ],
        tips: [
                  "errors.Join(nil, nil) returns nil — safe to call even when no errors occurred.",
                  "errors.Is and errors.As unwrap all constituent errors in a joined error.",
                  "Joined errors print with newlines between them — good for user-facing validation.",
                  "Spread a slice: errors.Join(errs...)  — Join accepts variadic errors."
        ],
        mistake: "Returning only the first validation error — users must fix issues one at a time. Collect all errors with errors.Join and return them together.",
        shorthand: {
          verbose: "// Manual / verbose approach\nif err := validate(field1); err != nil { return err }\nif err := validate(field2); err != nil { return err }\n// More explicit but longer",
          concise: "var errs []error\nerrs = append(errs, validate(field1))\nerrs = append(errs, validate(field2))\nreturn errors.Join(errs...)",
        },
      },
      {
        id: "error-wrapping-best-practices",
        fn: "Error Wrapping Best Practices",
        desc: "Wrapping errors with context using %w — chains for debugging while maintaining sentinel error checks.",
        category: "Error Wrapping & Joining",
        subtitle: "Adding context to errors in call chains",
        signature: "fmt.Errorf(\"operation: %w\", err)",
        descLong: "Always wrap errors with %w (not %v) to preserve the original error in a chain. errors.Is() and errors.As() traverse the chain. Add context at each layer showing what operation failed. Avoid wrapping the same error multiple times (only wrap once per function level).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Wrapping Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"database/sql\"\n  \"errors\"\n  \"fmt\"\n  \"log/slog\"\n  \"net/http\"\n)\n\nvar (\n  ErrNotFound    = errors.New(\"not found\")\n  ErrValidation  = errors.New(\"validation error\")\n  ErrDuplicate   = errors.New(\"duplicate entry\")\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Wrapping Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Error Wrapping Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Layer 1: Database\nfunc getUserFromDB(db *sql.DB, id string) (*User, error) {\n  var u User\n  err := db.QueryRow(\"SELECT id, name FROM users WHERE id = ?\", id).Scan(&u.ID, &u.Name)\n  if err == sql.ErrNoRows {\n    // Wrap with context and sentinel error\n    return nil, fmt.Errorf(\"getUserFromDB: %w\", ErrNotFound)\n  }\n  if err != nil {\n    // Wrap unexpected database errors\n    return nil, fmt.Errorf(\"getUserFromDB query failed: %w\", err)\n  }\n  return &u, nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Wrapping Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Layer 2: Service business logic,func GetUser(db *sql.DB, id string) (*User, error) {,  if id == \"\" {,    // Return sentinel error without wrapping,    return nil, ErrValidation,  },,  u, err := getUserFromDB(db, id),  if err != nil {,    // Add service-level context,    return nil, fmt.Errorf(\"GetUser: %w\", err),  },  return u, nil,},\n\n// Layer 3: HTTP handler,func handleGetUser(w http.ResponseWriter, r *http.Request, db *sql.DB) {,  id := r.PathValue(\"id\"),,  u, err := GetUser(db, id),  if err != nil {,    // Check the error chain,    if errors.Is(err, ErrValidation) {,      http.Error(w, \"invalid id\", http.StatusBadRequest),      return,    },    if errors.Is(err, ErrNotFound) {,      http.Error(w, \"user not found\", http.StatusNotFound),      return,    },\n\n    // Log unexpected errors,    slog.Error(\"failed to get user\",,      \"id\", id,,      \"error\", err,,    ),    http.Error(w, \"internal error\", http.StatusInternalServerError),    return,  },,  fmt.Fprintf(w, \"User: %s,\", u.Name),},,type User struct {,  ID   string,  Name string,},\n\n// Unwrap example,func inspectError(err error) {,  // Walk the chain manually,  for err != nil {,    fmt.Println(\"Error:\", err),    err = errors.Unwrap(err),  },\n\n  // Or use errors.As to find a specific type,  var customErr *CustomError,  if errors.As(err, &customErr) {,    fmt.Printf(\"Custom error: %s,\", customErr.Message),  },},,type CustomError struct {,  Message string,  Code    int,},,func (e *CustomError) Error() string {,  return fmt.Sprintf(\"code %d: %s\", e.Code, e.Message),},\n\n// Proper wrapping pattern,func operation1() error {,  // Just return the error or wrap it,  return fmt.Errorf(\"operation1 failed: %w\", ErrValidation),},,func operation2() error {,  err := operation1(),  if err != nil {,    // Add more context,    return fmt.Errorf(\"operation2 calling operation1: %w\", err),  },  return nil,},,func main() {,  err := operation2(),  if errors.Is(err, ErrValidation) {,    fmt.Println(\"Found validation error in chain\"),  },  fmt.Println(\"Full chain:\", err),}"
                  }
        ],
        tips: [
                  "Always wrap with %w (not %v) — preserves the original error in the chain.",
                  "Add context at each layer: fmt.Errorf(\"operation: %w\", err).",
                  "Use errors.Is() to check for sentinel errors — works through wrapping.",
                  "Unwrap() returns the original error; errors.Unwrap(err) for manual traversal.",
                  "Don't wrap the same error multiple times — wrap once per function level."
        ],
        mistake: "Using %v to wrap: fmt.Errorf(\"failed: %v\", err) — loses the chain. Always use %w.",
        shorthand: {
          verbose: "err := operation()\nif err != nil {\n  wrappedErr := fmt.Errorf(\"operation failed: %v\", err)\n  return wrappedErr  // Chain lost\n}",
          concise: "return fmt.Errorf(\"operation: %w\", err)\n// errors.Is(err, ErrTarget) still works",
        },
      },
      {
        id: "sentinel-errors-vs-typed",
        fn: "Sentinel Errors vs Typed Errors",
        desc: "When to use sentinel errors (errors.New) vs custom error types (struct) — trade-offs.",
        category: "Error Design",
        subtitle: "Choosing error patterns based on use case",
        signature: "var ErrNotFound = errors.New(...)  |  type ValidationError struct { ... }",
        descLong: "Sentinel errors (package-level var) are simple and idiomatic for known, unchanging error conditions. Typed errors are structs with fields for structured data. Sentinel errors work through wrapping (errors.Is). Typed errors require errors.As to extract. Choose based on whether you need to carry additional context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sentinel Errors vs Typed Errors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"errors\"\n  \"fmt\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sentinel Errors vs Typed Errors — common patterns you'll see in production.\n// APPROACH  - Combine Sentinel Errors vs Typed Errors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sentinel errors — known conditions, no data\nvar (\n  ErrNotFound = errors.New(\"not found\")\n  ErrEmpty    = errors.New(\"empty result\")\n  ErrTimeout  = errors.New(\"timeout\")\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sentinel Errors vs Typed Errors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom typed error — carries structured data,type ValidationError struct {,  Field   string,  Message string,},,func (e *ValidationError) Error() string {,  return fmt.Sprintf(\"validation: %s — %s\", e.Field, e.Message),},\n\n// HTTP status code error,type HTTPError struct {,  StatusCode int,  Message    string,},,func (e *HTTPError) Error() string {,  return fmt.Sprintf(\"HTTP %d: %s\", e.StatusCode, e.Message),},\n\n// Usage: Sentinel errors for known conditions,func findUser(id string) (*User, error) {,  if id == \"\" {,    return nil, ErrEmpty,  },  user, err := db.QueryUser(id),  if err != nil {,    return nil, fmt.Errorf(\"findUser: %w\", ErrNotFound),  },  return user, nil,},\n\n// Usage: Typed errors for rich context,func validateUser(name, email string) error {,  if name == \"\" {,    return &ValidationError{,      Field:   \"name\",,      Message: \"required\",,    },  },  if email == \"\" {,    return &ValidationError{,      Field:   \"email\",,      Message: \"required\",,    },  },  return nil,},\n\n// Handling,func handleErrors() {,  err := findUser(\"\"),  if errors.Is(err, ErrEmpty) {,    fmt.Println(\"ID is empty\"),  },  if errors.Is(err, ErrNotFound) {,    fmt.Println(\"User not found\"),  },,  err = validateUser(\"\", \"test@example.com\"),  var ve *ValidationError,  if errors.As(err, &ve) {,    fmt.Printf(\"Validation failed on %q: %s,\", ve.Field, ve.Message),  },},,type User struct {,  Name  string,  Email string,},\n\n// Pattern: Sentinel for predicates, typed for details,func processRequest(data []byte) error {,  // Common case — sentinel error is fine,  if len(data) == 0 {,    return ErrEmpty,  },\n\n  // Error with details — use typed error,  if !isValidJSON(data) {,    return &ValidationError{,      Field:   \"body\",,      Message: \"invalid JSON\",,    },  },,  return nil,},,func isValidJSON(data []byte) bool {,  return true,},\n\n// Combining: typed error can wrap sentinel,func complexOp() error {,  err := findUser(\"123\"),  if errors.Is(err, ErrNotFound) {,    return &ValidationError{,      Field:   \"userId\",,      Message: \"user does not exist\",,    },  },  return err,}"
                  }
        ],
        tips: [
                  "Sentinel errors: for known, simple failure modes with no extra data.",
                  "Typed errors: when you need to carry additional context.",
                  "errors.Is() checks sentinel errors through wrapping chains.",
                  "errors.As() extracts typed errors from chains.",
                  "Sentinel errors must be exported (var ErrXxx, not var errXxx)."
        ],
        mistake: "Using typed errors when sentinels would suffice — adds complexity. Use sentinels for simple \"not found\" cases.",
        shorthand: {
          verbose: "type NotFoundError struct {\n  ID string\n}\nfunc (e *NotFoundError) Error() string { ... }\nif _, ok := err.(*NotFoundError); ok { ... }",
          concise: "var ErrNotFound = errors.New(\"not found\")\nif errors.Is(err, ErrNotFound) { ... }",
        },
      },
      {
        id: "error-handling-patterns",
        fn: "Error Handling Patterns in Go",
        desc: "Common patterns: early return, resource cleanup with defer, error propagation, and recovery.",
        category: "Error Patterns",
        subtitle: "Idiomatic error handling strategies",
        signature: "if err != nil { return ... }  |  defer cleanup()  |  errors.Is/As",
        descLong: "Go emphasizes explicit error handling via early return. Always check errors immediately. Use defer for cleanup guaranteed to run. Propagate context up the call stack. Recover from panics only at boundaries (HTTP handlers, goroutines).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Handling Patterns in Go — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"bufio\"\n  \"context\"\n  \"errors\"\n  \"fmt\"\n  \"io\"\n  \"os\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Handling Patterns in Go — common patterns you'll see in production.\n// APPROACH  - Combine Error Handling Patterns in Go with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Pattern 1: Early return (idiomatic)\nfunc processFile(path string) (int, error) {\n  // Check immediately and return on error\n  file, err := os.Open(path)\n  if err != nil {\n    return 0, fmt.Errorf(\"open: %w\", err)\n  }\n  defer file.Close()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Handling Patterns in Go — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Next operation, same pattern,  scanner := bufio.NewScanner(file),  count := 0,  for scanner.Scan() {,    count++,  },  if err := scanner.Err(); err != nil {,    return 0, fmt.Errorf(\"scan: %w\", err),  },,  return count, nil,},\n\n// Pattern 2: Resource cleanup with defer,func readAndProcess(path string) error {,  file, err := os.Open(path),  if err != nil {,    return err,  },  // Guarantee close — even on error or panic,  defer file.Close(),,  return processData(file),},\n\n// Pattern 3: Context for timeouts and cancellation,func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {,  ctx, cancel := context.WithTimeout(ctx, 5*time.Second),  defer cancel()  // prevent resource leak,\n\n  // Long operation with cancellation,  return fetch(ctx, url),},\n\n// Pattern 4: Goroutine error collection,func parallelJobs(ctx context.Context, tasks []Task) error {,  var wg sync.WaitGroup,  errCh := make(chan error, len(tasks)),,  for _, task := range tasks {,    wg.Add(1),    go func(t Task) {,      defer wg.Done(),      select {,      case errCh <- t.Run(ctx):,      case <-ctx.Done():,        return,      },    }(task),  },,  go func() {,    wg.Wait(),    close(errCh),  }(),\n\n  // Collect first error,  for err := range errCh {,    if err != nil {,      return err,    },  },  return nil,},\n\n// Pattern 5: Error grouping (golang.org/x/sync/errgroup better),func multiErrors() error {,  var errs []error,,  if err := op1(); err != nil {,    errs = append(errs, err),  },  if err := op2(); err != nil {,    errs = append(errs, err),  },,  if len(errs) > 0 {,    return errors.Join(errs...),  },  return nil,},\n\n// Pattern 6: Sentinel vs recovery trade-off,func safeHTTPHandler(h http.HandlerFunc) http.HandlerFunc {,  return func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if rec := recover(); rec != nil {,        // Log panic but return gracefully,        fmt.Printf(\"panic: %v,\", rec),        http.Error(w, \"internal error\", 500),      },    }(),    h(w, r),  },},\n\n// Pattern 7: Unwrap and check multiple errors,func handleComplexError(err error) string {,  switch {,  case errors.Is(err, io.EOF):,    return \"end of file\",  case errors.Is(err, io.ErrUnexpectedEOF):,    return \"unexpected end of file\",  case errors.Is(err, context.DeadlineExceeded):,    return \"operation timed out\",  default:,    return fmt.Sprintf(\"unknown error: %v\", err),  },},,type Task interface {,  Run(ctx context.Context) error,},,func op1() error { return nil },func op2() error { return nil },,func processData(r io.Reader) error {,  return nil,},,func fetch(ctx context.Context, url string) ([]byte, error) {,  return nil, nil,},,import \"time\",import \"net/http\""
                  }
        ],
        tips: [
                  "Early return: check errors immediately and return — keeps indentation shallow.",
                  "defer for cleanup: always guaranteed to run (except os.Exit).",
                  "Context for cancellation: pass ctx to all I/O functions.",
                  "errors.Is() for sentinel checks, errors.As() for typed error extraction.",
                  "Recover only at goroutine boundaries — not for normal error handling."
        ],
        mistake: "Silently ignoring errors: _ = operation() — always handle or log errors explicitly.",
        shorthand: {
          verbose: "result, err := risky()\nif err != nil {\n  log.Fatal(err)\n}\n_ = result",
          concise: "result, err := risky()\nif err != nil { return fmt.Errorf(\"risky: %w\", err) }\n// Always check and propagate or log",
        },
      },
      {
        id: "error-wrapping-best-practices",
        fn: "Error Wrapping Best Practices",
        desc: "Wrapping errors with context using %w — chains for debugging while maintaining sentinel error checks.",
        category: "Error Wrapping & Joining",
        subtitle: "Adding context to errors in call chains",
        signature: "fmt.Errorf(\"operation: %w\", err)",
        descLong: "Always wrap errors with %w (not %v) to preserve the original error in a chain. errors.Is() and errors.As() traverse the chain. Add context at each layer showing what operation failed. Avoid wrapping the same error multiple times (only wrap once per function level).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Wrapping Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"database/sql\"\n  \"errors\"\n  \"fmt\"\n  \"log/slog\"\n  \"net/http\"\n)\n\nvar (\n  ErrNotFound    = errors.New(\"not found\")\n  ErrValidation  = errors.New(\"validation error\")\n  ErrDuplicate   = errors.New(\"duplicate entry\")\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Wrapping Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Error Wrapping Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Layer 1: Database\nfunc getUserFromDB(db *sql.DB, id string) (*User, error) {\n  var u User\n  err := db.QueryRow(\"SELECT id, name FROM users WHERE id = ?\", id).Scan(&u.ID, &u.Name)\n  if err == sql.ErrNoRows {\n    // Wrap with context and sentinel error\n    return nil, fmt.Errorf(\"getUserFromDB: %w\", ErrNotFound)\n  }\n  if err != nil {\n    // Wrap unexpected database errors\n    return nil, fmt.Errorf(\"getUserFromDB query failed: %w\", err)\n  }\n  return &u, nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Wrapping Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Layer 2: Service business logic,func GetUser(db *sql.DB, id string) (*User, error) {,  if id == \"\" {,    // Return sentinel error without wrapping,    return nil, ErrValidation,  },,  u, err := getUserFromDB(db, id),  if err != nil {,    // Add service-level context,    return nil, fmt.Errorf(\"GetUser: %w\", err),  },  return u, nil,},\n\n// Layer 3: HTTP handler,func handleGetUser(w http.ResponseWriter, r *http.Request, db *sql.DB) {,  id := r.PathValue(\"id\"),,  u, err := GetUser(db, id),  if err != nil {,    // Check the error chain,    if errors.Is(err, ErrValidation) {,      http.Error(w, \"invalid id\", http.StatusBadRequest),      return,    },    if errors.Is(err, ErrNotFound) {,      http.Error(w, \"user not found\", http.StatusNotFound),      return,    },\n\n    // Log unexpected errors,    slog.Error(\"failed to get user\",,      \"id\", id,,      \"error\", err,,    ),    http.Error(w, \"internal error\", http.StatusInternalServerError),    return,  },,  fmt.Fprintf(w, \"User: %s,\", u.Name),},,type User struct {,  ID   string,  Name string,},\n\n// Unwrap example,func inspectError(err error) {,  // Walk the chain manually,  for err != nil {,    fmt.Println(\"Error:\", err),    err = errors.Unwrap(err),  },\n\n  // Or use errors.As to find a specific type,  var customErr *CustomError,  if errors.As(err, &customErr) {,    fmt.Printf(\"Custom error: %s,\", customErr.Message),  },},,type CustomError struct {,  Message string,  Code    int,},,func (e *CustomError) Error() string {,  return fmt.Sprintf(\"code %d: %s\", e.Code, e.Message),},\n\n// Proper wrapping pattern,func operation1() error {,  // Just return the error or wrap it,  return fmt.Errorf(\"operation1 failed: %w\", ErrValidation),},,func operation2() error {,  err := operation1(),  if err != nil {,    // Add more context,    return fmt.Errorf(\"operation2 calling operation1: %w\", err),  },  return nil,},,func main() {,  err := operation2(),  if errors.Is(err, ErrValidation) {,    fmt.Println(\"Found validation error in chain\"),  },  fmt.Println(\"Full chain:\", err),}"
                  }
        ],
        tips: [
                  "Always wrap with %w (not %v) — preserves the original error in the chain.",
                  "Add context at each layer: fmt.Errorf(\"operation: %w\", err).",
                  "Use errors.Is() to check for sentinel errors — works through wrapping.",
                  "Unwrap() returns the original error; errors.Unwrap(err) for manual traversal.",
                  "Don't wrap the same error multiple times — wrap once per function level."
        ],
        mistake: "Using %v to wrap: fmt.Errorf(\"failed: %v\", err) — loses the chain. Always use %w.",
        shorthand: {
          verbose: "err := operation()\nif err != nil {\n  wrappedErr := fmt.Errorf(\"operation failed: %v\", err)\n  return wrappedErr  // Chain lost\n}",
          concise: "return fmt.Errorf(\"operation: %w\", err)\n// errors.Is(err, ErrTarget) still works",
        },
      },
      {
        id: "sentinel-errors-vs-typed",
        fn: "Sentinel Errors vs Typed Errors",
        desc: "When to use sentinel errors (errors.New) vs custom error types (struct) — trade-offs.",
        category: "Error Design",
        subtitle: "Choosing error patterns based on use case",
        signature: "var ErrNotFound = errors.New(...)  |  type ValidationError struct { ... }",
        descLong: "Sentinel errors (package-level var) are simple and idiomatic for known, unchanging error conditions. Typed errors are structs with fields for structured data. Sentinel errors work through wrapping (errors.Is). Typed errors require errors.As to extract. Choose based on whether you need to carry additional context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sentinel Errors vs Typed Errors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"errors\"\n  \"fmt\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sentinel Errors vs Typed Errors — common patterns you'll see in production.\n// APPROACH  - Combine Sentinel Errors vs Typed Errors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sentinel errors — known conditions, no data\nvar (\n  ErrNotFound = errors.New(\"not found\")\n  ErrEmpty    = errors.New(\"empty result\")\n  ErrTimeout  = errors.New(\"timeout\")\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sentinel Errors vs Typed Errors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom typed error — carries structured data,type ValidationError struct {,  Field   string,  Message string,},,func (e *ValidationError) Error() string {,  return fmt.Sprintf(\"validation: %s — %s\", e.Field, e.Message),},\n\n// HTTP status code error,type HTTPError struct {,  StatusCode int,  Message    string,},,func (e *HTTPError) Error() string {,  return fmt.Sprintf(\"HTTP %d: %s\", e.StatusCode, e.Message),},\n\n// Usage: Sentinel errors for known conditions,func findUser(id string) (*User, error) {,  if id == \"\" {,    return nil, ErrEmpty,  },  user, err := db.QueryUser(id),  if err != nil {,    return nil, fmt.Errorf(\"findUser: %w\", ErrNotFound),  },  return user, nil,},\n\n// Usage: Typed errors for rich context,func validateUser(name, email string) error {,  if name == \"\" {,    return &ValidationError{,      Field:   \"name\",,      Message: \"required\",,    },  },  if email == \"\" {,    return &ValidationError{,      Field:   \"email\",,      Message: \"required\",,    },  },  return nil,},\n\n// Handling,func handleErrors() {,  err := findUser(\"\"),  if errors.Is(err, ErrEmpty) {,    fmt.Println(\"ID is empty\"),  },  if errors.Is(err, ErrNotFound) {,    fmt.Println(\"User not found\"),  },,  err = validateUser(\"\", \"test@example.com\"),  var ve *ValidationError,  if errors.As(err, &ve) {,    fmt.Printf(\"Validation failed on %q: %s,\", ve.Field, ve.Message),  },},,type User struct {,  Name  string,  Email string,},\n\n// Pattern: Sentinel for predicates, typed for details,func processRequest(data []byte) error {,  // Common case — sentinel error is fine,  if len(data) == 0 {,    return ErrEmpty,  },\n\n  // Error with details — use typed error,  if !isValidJSON(data) {,    return &ValidationError{,      Field:   \"body\",,      Message: \"invalid JSON\",,    },  },,  return nil,},,func isValidJSON(data []byte) bool {,  return true,},\n\n// Combining: typed error can wrap sentinel,func complexOp() error {,  err := findUser(\"123\"),  if errors.Is(err, ErrNotFound) {,    return &ValidationError{,      Field:   \"userId\",,      Message: \"user does not exist\",,    },  },  return err,}"
                  }
        ],
        tips: [
                  "Sentinel errors: for known, simple failure modes with no extra data.",
                  "Typed errors: when you need to carry additional context.",
                  "errors.Is() checks sentinel errors through wrapping chains.",
                  "errors.As() extracts typed errors from chains.",
                  "Sentinel errors must be exported (var ErrXxx, not var errXxx)."
        ],
        mistake: "Using typed errors when sentinels would suffice — adds complexity. Use sentinels for simple \"not found\" cases.",
        shorthand: {
          verbose: "type NotFoundError struct {\n  ID string\n}\nfunc (e *NotFoundError) Error() string { ... }\nif _, ok := err.(*NotFoundError); ok { ... }",
          concise: "var ErrNotFound = errors.New(\"not found\")\nif errors.Is(err, ErrNotFound) { ... }",
        },
      },
      {
        id: "error-handling-patterns",
        fn: "Error Handling Patterns in Go",
        desc: "Common patterns: early return, resource cleanup with defer, error propagation, and recovery.",
        category: "Error Patterns",
        subtitle: "Idiomatic error handling strategies",
        signature: "if err != nil { return ... }  |  defer cleanup()  |  errors.Is/As",
        descLong: "Go emphasizes explicit error handling via early return. Always check errors immediately. Use defer for cleanup guaranteed to run. Propagate context up the call stack. Recover from panics only at boundaries (HTTP handlers, goroutines).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Handling Patterns in Go — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"bufio\"\n  \"context\"\n  \"errors\"\n  \"fmt\"\n  \"io\"\n  \"os\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Handling Patterns in Go — common patterns you'll see in production.\n// APPROACH  - Combine Error Handling Patterns in Go with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Pattern 1: Early return (idiomatic)\nfunc processFile(path string) (int, error) {\n  // Check immediately and return on error\n  file, err := os.Open(path)\n  if err != nil {\n    return 0, fmt.Errorf(\"open: %w\", err)\n  }\n  defer file.Close()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Handling Patterns in Go — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Next operation, same pattern,  scanner := bufio.NewScanner(file),  count := 0,  for scanner.Scan() {,    count++,  },  if err := scanner.Err(); err != nil {,    return 0, fmt.Errorf(\"scan: %w\", err),  },,  return count, nil,},\n\n// Pattern 2: Resource cleanup with defer,func readAndProcess(path string) error {,  file, err := os.Open(path),  if err != nil {,    return err,  },  // Guarantee close — even on error or panic,  defer file.Close(),,  return processData(file),},\n\n// Pattern 3: Context for timeouts and cancellation,func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {,  ctx, cancel := context.WithTimeout(ctx, 5*time.Second),  defer cancel()  // prevent resource leak,\n\n  // Long operation with cancellation,  return fetch(ctx, url),},\n\n// Pattern 4: Goroutine error collection,func parallelJobs(ctx context.Context, tasks []Task) error {,  var wg sync.WaitGroup,  errCh := make(chan error, len(tasks)),,  for _, task := range tasks {,    wg.Add(1),    go func(t Task) {,      defer wg.Done(),      select {,      case errCh <- t.Run(ctx):,      case <-ctx.Done():,        return,      },    }(task),  },,  go func() {,    wg.Wait(),    close(errCh),  }(),\n\n  // Collect first error,  for err := range errCh {,    if err != nil {,      return err,    },  },  return nil,},\n\n// Pattern 5: Error grouping (golang.org/x/sync/errgroup better),func multiErrors() error {,  var errs []error,,  if err := op1(); err != nil {,    errs = append(errs, err),  },  if err := op2(); err != nil {,    errs = append(errs, err),  },,  if len(errs) > 0 {,    return errors.Join(errs...),  },  return nil,},\n\n// Pattern 6: Sentinel vs recovery trade-off,func safeHTTPHandler(h http.HandlerFunc) http.HandlerFunc {,  return func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if rec := recover(); rec != nil {,        // Log panic but return gracefully,        fmt.Printf(\"panic: %v,\", rec),        http.Error(w, \"internal error\", 500),      },    }(),    h(w, r),  },},\n\n// Pattern 7: Unwrap and check multiple errors,func handleComplexError(err error) string {,  switch {,  case errors.Is(err, io.EOF):,    return \"end of file\",  case errors.Is(err, io.ErrUnexpectedEOF):,    return \"unexpected end of file\",  case errors.Is(err, context.DeadlineExceeded):,    return \"operation timed out\",  default:,    return fmt.Sprintf(\"unknown error: %v\", err),  },},,type Task interface {,  Run(ctx context.Context) error,},,func op1() error { return nil },func op2() error { return nil },,func processData(r io.Reader) error {,  return nil,},,func fetch(ctx context.Context, url string) ([]byte, error) {,  return nil, nil,},,import \"time\",import \"net/http\""
                  }
        ],
        tips: [
                  "Early return: check errors immediately and return — keeps indentation shallow.",
                  "defer for cleanup: always guaranteed to run (except os.Exit).",
                  "Context for cancellation: pass ctx to all I/O functions.",
                  "errors.Is() for sentinel checks, errors.As() for typed error extraction.",
                  "Recover only at goroutine boundaries — not for normal error handling."
        ],
        mistake: "Silently ignoring errors: _ = operation() — always handle or log errors explicitly.",
        shorthand: {
          verbose: "result, err := risky()\nif err != nil {\n  log.Fatal(err)\n}\n_ = result",
          concise: "result, err := risky()\nif err != nil { return fmt.Errorf(\"risky: %w\", err) }\n// Always check and propagate or log",
        },
      },
      {
        id: "error-wrapping-best-practices",
        fn: "Error Wrapping Best Practices",
        desc: "Wrapping errors with context using %w — chains for debugging while maintaining sentinel error checks.",
        category: "Error Wrapping & Joining",
        subtitle: "Adding context to errors in call chains",
        signature: "fmt.Errorf(\"operation: %w\", err)",
        descLong: "Always wrap errors with %w (not %v) to preserve the original error in a chain. errors.Is() and errors.As() traverse the chain. Add context at each layer showing what operation failed. Avoid wrapping the same error multiple times (only wrap once per function level).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Wrapping Best Practices — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"database/sql\"\n  \"errors\"\n  \"fmt\"\n  \"log/slog\"\n  \"net/http\"\n)\n\nvar (\n  ErrNotFound    = errors.New(\"not found\")\n  ErrValidation  = errors.New(\"validation error\")\n  ErrDuplicate   = errors.New(\"duplicate entry\")\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Wrapping Best Practices — common patterns you'll see in production.\n// APPROACH  - Combine Error Wrapping Best Practices with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Layer 1: Database\nfunc getUserFromDB(db *sql.DB, id string) (*User, error) {\n  var u User\n  err := db.QueryRow(\"SELECT id, name FROM users WHERE id = ?\", id).Scan(&u.ID, &u.Name)\n  if err == sql.ErrNoRows {\n    // Wrap with context and sentinel error\n    return nil, fmt.Errorf(\"getUserFromDB: %w\", ErrNotFound)\n  }\n  if err != nil {\n    // Wrap unexpected database errors\n    return nil, fmt.Errorf(\"getUserFromDB query failed: %w\", err)\n  }\n  return &u, nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Wrapping Best Practices — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Layer 2: Service business logic,func GetUser(db *sql.DB, id string) (*User, error) {,  if id == \"\" {,    // Return sentinel error without wrapping,    return nil, ErrValidation,  },,  u, err := getUserFromDB(db, id),  if err != nil {,    // Add service-level context,    return nil, fmt.Errorf(\"GetUser: %w\", err),  },  return u, nil,},\n\n// Layer 3: HTTP handler,func handleGetUser(w http.ResponseWriter, r *http.Request, db *sql.DB) {,  id := r.PathValue(\"id\"),,  u, err := GetUser(db, id),  if err != nil {,    // Check the error chain,    if errors.Is(err, ErrValidation) {,      http.Error(w, \"invalid id\", http.StatusBadRequest),      return,    },    if errors.Is(err, ErrNotFound) {,      http.Error(w, \"user not found\", http.StatusNotFound),      return,    },\n\n    // Log unexpected errors,    slog.Error(\"failed to get user\",,      \"id\", id,,      \"error\", err,,    ),    http.Error(w, \"internal error\", http.StatusInternalServerError),    return,  },,  fmt.Fprintf(w, \"User: %s,\", u.Name),},,type User struct {,  ID   string,  Name string,},\n\n// Unwrap example,func inspectError(err error) {,  // Walk the chain manually,  for err != nil {,    fmt.Println(\"Error:\", err),    err = errors.Unwrap(err),  },\n\n  // Or use errors.As to find a specific type,  var customErr *CustomError,  if errors.As(err, &customErr) {,    fmt.Printf(\"Custom error: %s,\", customErr.Message),  },},,type CustomError struct {,  Message string,  Code    int,},,func (e *CustomError) Error() string {,  return fmt.Sprintf(\"code %d: %s\", e.Code, e.Message),},\n\n// Proper wrapping pattern,func operation1() error {,  // Just return the error or wrap it,  return fmt.Errorf(\"operation1 failed: %w\", ErrValidation),},,func operation2() error {,  err := operation1(),  if err != nil {,    // Add more context,    return fmt.Errorf(\"operation2 calling operation1: %w\", err),  },  return nil,},,func main() {,  err := operation2(),  if errors.Is(err, ErrValidation) {,    fmt.Println(\"Found validation error in chain\"),  },  fmt.Println(\"Full chain:\", err),}"
                  }
        ],
        tips: [
                  "Always wrap with %w (not %v) — preserves the original error in the chain.",
                  "Add context at each layer: fmt.Errorf(\"operation: %w\", err).",
                  "Use errors.Is() to check for sentinel errors — works through wrapping.",
                  "Unwrap() returns the original error; errors.Unwrap(err) for manual traversal.",
                  "Don't wrap the same error multiple times — wrap once per function level."
        ],
        mistake: "Using %v to wrap: fmt.Errorf(\"failed: %v\", err) — loses the chain. Always use %w.",
        shorthand: {
          verbose: "err := operation()\nif err != nil {\n  wrappedErr := fmt.Errorf(\"operation failed: %v\", err)\n  return wrappedErr  // Chain lost\n}",
          concise: "return fmt.Errorf(\"operation: %w\", err)\n// errors.Is(err, ErrTarget) still works",
        },
      },
      {
        id: "sentinel-errors-vs-typed",
        fn: "Sentinel Errors vs Typed Errors",
        desc: "When to use sentinel errors (errors.New) vs custom error types (struct) — trade-offs.",
        category: "Error Design",
        subtitle: "Choosing error patterns based on use case",
        signature: "var ErrNotFound = errors.New(...)  |  type ValidationError struct { ... }",
        descLong: "Sentinel errors (package-level var) are simple and idiomatic for known, unchanging error conditions. Typed errors are structs with fields for structured data. Sentinel errors work through wrapping (errors.Is). Typed errors require errors.As to extract. Choose based on whether you need to carry additional context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sentinel Errors vs Typed Errors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"errors\"\n  \"fmt\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sentinel Errors vs Typed Errors — common patterns you'll see in production.\n// APPROACH  - Combine Sentinel Errors vs Typed Errors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sentinel errors — known conditions, no data\nvar (\n  ErrNotFound = errors.New(\"not found\")\n  ErrEmpty    = errors.New(\"empty result\")\n  ErrTimeout  = errors.New(\"timeout\")\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sentinel Errors vs Typed Errors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom typed error — carries structured data,type ValidationError struct {,  Field   string,  Message string,},,func (e *ValidationError) Error() string {,  return fmt.Sprintf(\"validation: %s — %s\", e.Field, e.Message),},\n\n// HTTP status code error,type HTTPError struct {,  StatusCode int,  Message    string,},,func (e *HTTPError) Error() string {,  return fmt.Sprintf(\"HTTP %d: %s\", e.StatusCode, e.Message),},\n\n// Usage: Sentinel errors for known conditions,func findUser(id string) (*User, error) {,  if id == \"\" {,    return nil, ErrEmpty,  },  user, err := db.QueryUser(id),  if err != nil {,    return nil, fmt.Errorf(\"findUser: %w\", ErrNotFound),  },  return user, nil,},\n\n// Usage: Typed errors for rich context,func validateUser(name, email string) error {,  if name == \"\" {,    return &ValidationError{,      Field:   \"name\",,      Message: \"required\",,    },  },  if email == \"\" {,    return &ValidationError{,      Field:   \"email\",,      Message: \"required\",,    },  },  return nil,},\n\n// Handling,func handleErrors() {,  err := findUser(\"\"),  if errors.Is(err, ErrEmpty) {,    fmt.Println(\"ID is empty\"),  },  if errors.Is(err, ErrNotFound) {,    fmt.Println(\"User not found\"),  },,  err = validateUser(\"\", \"test@example.com\"),  var ve *ValidationError,  if errors.As(err, &ve) {,    fmt.Printf(\"Validation failed on %q: %s,\", ve.Field, ve.Message),  },},,type User struct {,  Name  string,  Email string,},\n\n// Pattern: Sentinel for predicates, typed for details,func processRequest(data []byte) error {,  // Common case — sentinel error is fine,  if len(data) == 0 {,    return ErrEmpty,  },\n\n  // Error with details — use typed error,  if !isValidJSON(data) {,    return &ValidationError{,      Field:   \"body\",,      Message: \"invalid JSON\",,    },  },,  return nil,},,func isValidJSON(data []byte) bool {,  return true,},\n\n// Combining: typed error can wrap sentinel,func complexOp() error {,  err := findUser(\"123\"),  if errors.Is(err, ErrNotFound) {,    return &ValidationError{,      Field:   \"userId\",,      Message: \"user does not exist\",,    },  },  return err,}"
                  }
        ],
        tips: [
                  "Sentinel errors: for known, simple failure modes with no extra data.",
                  "Typed errors: when you need to carry additional context.",
                  "errors.Is() checks sentinel errors through wrapping chains.",
                  "errors.As() extracts typed errors from chains.",
                  "Sentinel errors must be exported (var ErrXxx, not var errXxx)."
        ],
        mistake: "Using typed errors when sentinels would suffice — adds complexity. Use sentinels for simple \"not found\" cases.",
        shorthand: {
          verbose: "type NotFoundError struct {\n  ID string\n}\nfunc (e *NotFoundError) Error() string { ... }\nif _, ok := err.(*NotFoundError); ok { ... }",
          concise: "var ErrNotFound = errors.New(\"not found\")\nif errors.Is(err, ErrNotFound) { ... }",
        },
      },
      {
        id: "error-handling-patterns",
        fn: "Error Handling Patterns in Go",
        desc: "Common patterns: early return, resource cleanup with defer, error propagation, and recovery.",
        category: "Error Patterns",
        subtitle: "Idiomatic error handling strategies",
        signature: "if err != nil { return ... }  |  defer cleanup()  |  errors.Is/As",
        descLong: "Go emphasizes explicit error handling via early return. Always check errors immediately. Use defer for cleanup guaranteed to run. Propagate context up the call stack. Recover from panics only at boundaries (HTTP handlers, goroutines).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Handling Patterns in Go — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"bufio\"\n  \"context\"\n  \"errors\"\n  \"fmt\"\n  \"io\"\n  \"os\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Handling Patterns in Go — common patterns you'll see in production.\n// APPROACH  - Combine Error Handling Patterns in Go with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Pattern 1: Early return (idiomatic)\nfunc processFile(path string) (int, error) {\n  // Check immediately and return on error\n  file, err := os.Open(path)\n  if err != nil {\n    return 0, fmt.Errorf(\"open: %w\", err)\n  }\n  defer file.Close()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Handling Patterns in Go — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Next operation, same pattern,  scanner := bufio.NewScanner(file),  count := 0,  for scanner.Scan() {,    count++,  },  if err := scanner.Err(); err != nil {,    return 0, fmt.Errorf(\"scan: %w\", err),  },,  return count, nil,},\n\n// Pattern 2: Resource cleanup with defer,func readAndProcess(path string) error {,  file, err := os.Open(path),  if err != nil {,    return err,  },  // Guarantee close — even on error or panic,  defer file.Close(),,  return processData(file),},\n\n// Pattern 3: Context for timeouts and cancellation,func fetchWithTimeout(ctx context.Context, url string) ([]byte, error) {,  ctx, cancel := context.WithTimeout(ctx, 5*time.Second),  defer cancel()  // prevent resource leak,\n\n  // Long operation with cancellation,  return fetch(ctx, url),},\n\n// Pattern 4: Goroutine error collection,func parallelJobs(ctx context.Context, tasks []Task) error {,  var wg sync.WaitGroup,  errCh := make(chan error, len(tasks)),,  for _, task := range tasks {,    wg.Add(1),    go func(t Task) {,      defer wg.Done(),      select {,      case errCh <- t.Run(ctx):,      case <-ctx.Done():,        return,      },    }(task),  },,  go func() {,    wg.Wait(),    close(errCh),  }(),\n\n  // Collect first error,  for err := range errCh {,    if err != nil {,      return err,    },  },  return nil,},\n\n// Pattern 5: Error grouping (golang.org/x/sync/errgroup better),func multiErrors() error {,  var errs []error,,  if err := op1(); err != nil {,    errs = append(errs, err),  },  if err := op2(); err != nil {,    errs = append(errs, err),  },,  if len(errs) > 0 {,    return errors.Join(errs...),  },  return nil,},\n\n// Pattern 6: Sentinel vs recovery trade-off,func safeHTTPHandler(h http.HandlerFunc) http.HandlerFunc {,  return func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if rec := recover(); rec != nil {,        // Log panic but return gracefully,        fmt.Printf(\"panic: %v,\", rec),        http.Error(w, \"internal error\", 500),      },    }(),    h(w, r),  },},\n\n// Pattern 7: Unwrap and check multiple errors,func handleComplexError(err error) string {,  switch {,  case errors.Is(err, io.EOF):,    return \"end of file\",  case errors.Is(err, io.ErrUnexpectedEOF):,    return \"unexpected end of file\",  case errors.Is(err, context.DeadlineExceeded):,    return \"operation timed out\",  default:,    return fmt.Sprintf(\"unknown error: %v\", err),  },},,type Task interface {,  Run(ctx context.Context) error,},,func op1() error { return nil },func op2() error { return nil },,func processData(r io.Reader) error {,  return nil,},,func fetch(ctx context.Context, url string) ([]byte, error) {,  return nil, nil,},,import \"time\",import \"net/http\""
                  }
        ],
        tips: [
                  "Early return: check errors immediately and return — keeps indentation shallow.",
                  "defer for cleanup: always guaranteed to run (except os.Exit).",
                  "Context for cancellation: pass ctx to all I/O functions.",
                  "errors.Is() for sentinel checks, errors.As() for typed error extraction.",
                  "Recover only at goroutine boundaries — not for normal error handling."
        ],
        mistake: "Silently ignoring errors: _ = operation() — always handle or log errors explicitly.",
        shorthand: {
          verbose: "// Manual / verbose approach\n_ = operation()\n// More explicit but longer",
          concise: "if err := operation(); err != nil { log.Error(err) }",
        },
      },
    ],
  },
]

export default { meta, sections }
