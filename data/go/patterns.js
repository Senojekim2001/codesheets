export const meta = {
  "id": "patterns",
  "label": "Design Patterns",
  "icon": "🏛️",
  "description": "Builder pattern, dependency injection, middleware, repository pattern, factory, and other Go idioms."
}

export const sections = [

  // ── Section 1: Design Patterns & Idioms ─────────────────────────────────────────
  {
    id: "design-patterns",
    title: "Design Patterns & Idioms",
    entries: [
      {
        id: "builder-pattern",
        fn: "Builder Pattern",
        desc: "Construct complex objects step-by-step — alternative to many constructor parameters.",
        category: "Construction Patterns",
        subtitle: "Fluent interface for object construction",
        signature: "builder.SetField(value).SetOther(val2).Build()",
        descLong: "Builder pattern separates construction from representation. Use a builder struct with methods that set fields and return the builder (for chaining). Call Build() to create the final object. Simpler than long parameter lists, more flexible than fixed constructors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Builder Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"time\"\n)\n\ntype Request struct {\n  Method   string\n  URL      string\n  Headers  map[string]string\n  Timeout  time.Duration\n  Retries  int\n}\n\ntype RequestBuilder struct {\n  method   string\n  url      string\n  headers  map[string]string\n  timeout  time.Duration\n  retries  int\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Builder Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Builder Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// New builder with defaults\nfunc NewRequestBuilder(url string) *RequestBuilder {\n  return &RequestBuilder{\n    method:  \"GET\",\n    url:     url,\n    headers: make(map[string]string),\n    timeout: 30 * time.Second,\n    retries: 1,\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Builder Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Chainable setters,func (b *RequestBuilder) Method(m string) *RequestBuilder {,  b.method = m,  return b,},,func (b *RequestBuilder) Header(key, value string) *RequestBuilder {,  b.headers[key] = value,  return b,},,func (b *RequestBuilder) Timeout(d time.Duration) *RequestBuilder {,  b.timeout = d,  return b,},,func (b *RequestBuilder) Retries(r int) *RequestBuilder {,  b.retries = r,  return b,},\n\n// Build creates the final object,func (b *RequestBuilder) Build() *Request {,  if b.url == \"\" {,    panic(\"URL is required\"),  },  return &Request{,    Method:  b.method,,    URL:     b.url,,    Headers: b.headers,,    Timeout: b.timeout,,    Retries: b.retries,,  },},,func main() {,  // Fluent, readable construction,  req := NewRequestBuilder(\"https://api.example.com/users\").,    Method(\"POST\").,    Header(\"Content-Type\", \"application/json\").,    Header(\"Authorization\", \"Bearer token\").,    Timeout(5 * time.Second).,    Retries(3).,    Build(),,  fmt.Printf(\"%+v,\", req),}"
                  }
        ],
        tips: [
                  "Builder methods return the builder for chaining — each method should return *Builder.",
                  "Set sensible defaults in the constructor — Build() shouldn't require many fields.",
                  "Validate in Build(), not in setters — allows partial configuration.",
                  "Alternative: use functional options pattern (more idiomatic in Go).",
                  "Builder is great for domain objects with many optional fields."
        ],
        mistake: "Returning the built object from setters instead of the builder — breaks chaining.",
        shorthand: {
          verbose: "req := NewRequestBuilder(\"https://api.example.com/users\")\nreq.Method(\"POST\")\nreq.Header(\"Content-Type\", \"application/json\")\nreq.Timeout(5*time.Second)\nbuiltReq := req.Build()",
          concise: "req := NewRequestBuilder(\"https://api.example.com/users\").\n  Method(\"POST\").\n  Header(\"Content-Type\", \"application/json\").\n  Build()",
        },
      },
      {
        id: "dependency-injection",
        fn: "Dependency Injection",
        desc: "Pass dependencies as function/constructor arguments instead of globals — testability and flexibility.",
        category: "Architecture Patterns",
        subtitle: "Explicit dependency management",
        signature: "func NewService(db Database, logger Logger) *Service",
        descLong: "Dependency injection (DI) passes dependencies explicitly rather than having objects create or access them globally. Enables easy testing with mocks, loose coupling, and clear dependency graphs. Go favors constructor injection over field injection.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Dependency Injection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Dependency Injection — common patterns you'll see in production.\n// APPROACH  - Combine Dependency Injection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Interfaces for dependencies\ntype Logger interface {\n  Info(msg string)\n  Error(msg string, err error)\n}\n\ntype Database interface {\n  Get(id string) (string, error)\n  Save(id, value string) error\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Dependency Injection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Service depends on Logger and Database,type UserService struct {,  db     Database,  logger Logger,},\n\n// Constructor-based injection,func NewUserService(db Database, logger Logger) *UserService {,  return &UserService{,    db:     db,,    logger: logger,,  },},,func (s *UserService) GetUser(id string) (string, error) {,  s.logger.Info(\"fetching user: \" + id),  user, err := s.db.Get(id),  if err != nil {,    s.logger.Error(\"failed to fetch user\", err),    return \"\", err,  },  return user, nil,},\n\n// Real implementations,type RealLogger struct{},,func (l *RealLogger) Info(msg string)              { log.Println(\"INFO:\", msg) },func (l *RealLogger) Error(msg string, err error) { log.Println(\"ERROR:\", msg, err) },,type RealDB struct{},,func (db *RealDB) Get(id string) (string, error) { return \"User \" + id, nil },func (db *RealDB) Save(id, value string) error   { return nil },\n\n// Mock implementations for testing,type MockLogger struct {,  messages []string,  errors   []string,},,func (l *MockLogger) Info(msg string)              { l.messages = append(l.messages, msg) },func (l *MockLogger) Error(msg string, err error) { l.errors = append(l.errors, msg) },,type MockDB struct {,  data map[string]string,},,func (db *MockDB) Get(id string) (string, error) { return db.data[id], nil },func (db *MockDB) Save(id, value string) error   { db.data[id] = value; return nil },,func main() {,  // Production,  logger := &RealLogger{},  db := &RealDB{},  svc := NewUserService(db, logger),  user, _ := svc.GetUser(\"123\"),  fmt.Println(user),\n\n  // Testing with mocks,  mockLogger := &MockLogger{},  mockDB := &MockDB{data: map[string]string{\"456\": \"Mock User\"}},  testSvc := NewUserService(mockDB, mockLogger),  user, _ = testSvc.GetUser(\"456\"),  fmt.Println(\"Test user:\", user),  fmt.Println(\"Log messages:\", mockLogger.messages),}"
                  }
        ],
        tips: [
                  "Inject interfaces, not concrete types — enables easy mocking.",
                  "Pass dependencies to constructors — clearer than hidden globals.",
                  "Each dependency is optional to test — write minimal mocks.",
                  "Use wire package (github.com/google/wire) for automated DI in large projects.",
                  "Small projects can skip DI — use globals only when necessary."
        ],
        mistake: "Injecting concrete types instead of interfaces — limits testability. Always inject interfaces.",
        shorthand: {
          verbose: "svc := NewUserService(realDB, realLogger)\n// testing requires real DB setup\n\ntestSvc := NewUserService(mockDB, mockLogger)\n// easy to test with mocks",
          concise: "// Inject interfaces, not implementations\nfunc NewUserService(db Database, logger Logger) *UserService\n// implementations are swappable",
        },
      },
      {
        id: "middleware",
        fn: "Middleware Pattern",
        desc: "Wrap HTTP handlers to add cross-cutting concerns — logging, auth, metrics.",
        category: "HTTP Patterns",
        subtitle: "Handler composition for shared logic",
        signature: "func middleware(next http.Handler) http.Handler",
        descLong: "Middleware is a function that takes an http.Handler and returns an http.Handler. Chain multiple middleware to add logging, authentication, metrics, error recovery. The middleware pattern is fundamental to Go HTTP servers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Middleware Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"log/slog\"\n  \"net/http\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Middleware Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Middleware Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Logging middleware\nfunc loggingMiddleware(next http.Handler) http.Handler {\n  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n    start := time.Now()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Middleware Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Wrap response writer to capture status code,    wrapped := &responseWriter{ResponseWriter: w, statusCode: 200},\n\n    // Call next handler,    next.ServeHTTP(wrapped, r),\n\n    // Log after response,    duration := time.Since(start),    slog.Info(\"request completed\",,      \"method\", r.Method,,      \"path\", r.URL.Path,,      \"status\", wrapped.statusCode,,      \"duration_ms\", duration.Milliseconds(),,    ),  }),},\n\n// Auth middleware,func authMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    token := r.Header.Get(\"Authorization\"),    if token == \"\" {,      http.Error(w, \"Unauthorized\", http.StatusUnauthorized),      return,    },    // Validate token...,    next.ServeHTTP(w, r),  }),},\n\n// Recovery middleware,func recoveryMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if err := recover(); err != nil {,        slog.Error(\"panic recovered\", \"error\", err),        http.Error(w, \"Internal Server Error\", http.StatusInternalServerError),      },    }(),    next.ServeHTTP(w, r),  }),},\n\n// Context middleware — store request-scoped data,func contextMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    // Add to context,    ctx := r.Context(),    ctx = context.WithValue(ctx, \"requestID\", generateID()),    ctx = context.WithValue(ctx, \"userID\", \"123\"),,    next.ServeHTTP(w, r.WithContext(ctx)),  }),},\n\n// Helper to track response status,type responseWriter struct {,  http.ResponseWriter,  statusCode int,},,func (rw *responseWriter) WriteHeader(code int) {,  rw.statusCode = code,  rw.ResponseWriter.WriteHeader(code),},,func generateID() string { return fmt.Sprintf(\"req_%d\", time.Now().UnixNano()) },\n\n// Handler,func handleGetUser(w http.ResponseWriter, r *http.Request) {,  requestID := r.Context().Value(\"requestID\"),  fmt.Fprintf(w, \"Getting user (request: %v),\", requestID),},,func main() {,  // Compose middleware chain,  var handler http.Handler = http.HandlerFunc(handleGetUser),\n\n  // Innermost middleware runs first,  handler = contextMiddleware(handler),  handler = authMiddleware(handler),  handler = recoveryMiddleware(handler),  handler = loggingMiddleware(handler)  // outermost,,  http.Handle(\"/user\", handler),\n\n  // Or use a helper for cleaner composition,  mux := http.NewServeMux(),  mux.HandleFunc(\"/user\", handleGetUser),\n\n  // Apply stack,  finalHandler := chain(,    mux,,    loggingMiddleware,,    authMiddleware,,    recoveryMiddleware,,  ),,  http.ListenAndServe(\":8080\", finalHandler),},\n\n// Helper to chain middleware,func chain(handler http.Handler, middleware ...func(http.Handler) http.Handler) http.Handler {,  for i := len(middleware) - 1; i >= 0; i-- {,    handler = middleware[i](handler),  },  return handler,}"
                  }
        ],
        tips: [
                  "Middleware order matters — outermost runs first, innermost last.",
                  "Chain middleware in reverse order: chain(h, a, b, c) applies c(b(a(h))).",
                  "Use type wrapper (like responseWriter) to intercept response writes.",
                  "Context is the standard way to pass request-scoped data.",
                  "Common middleware: logging, auth, CORS, metrics, compression, request ID."
        ],
        mistake: "Forgetting to call next.ServeHTTP() in middleware — handler chain breaks and nothing else runs.",
        shorthand: {
          verbose: "handler := http.HandlerFunc(handleGetUser)\nhandler = loggingMiddleware(handler)\nhandler = authMiddleware(handler)\nhandler = recoveryMiddleware(handler)\nhttp.Handle(\"/user\", handler)",
          concise: "handler := chain(\n  http.HandlerFunc(handleGetUser),\n  loggingMiddleware,\n  authMiddleware,\n)\nhttp.Handle(\"/user\", handler)",
        },
      },
      {
        id: "interface-segregation",
        fn: "Interface Segregation",
        desc: "Small, focused interfaces — clients depend only on what they use.",
        category: "Design Principles",
        subtitle: "Minimal interface contracts",
        signature: "type Reader interface { Read() ([]byte, error) }",
        descLong: "Go favors small, single-method interfaces (io.Reader, io.Writer, fmt.Stringer). Larger interfaces force implementers to provide unused methods. Segregate large interfaces into smaller ones. Client code should depend on the smallest interface it needs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Interface Segregation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"io\"\n  \"log\"\n  \"os\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Interface Segregation — common patterns you'll see in production.\n// APPROACH  - Combine Interface Segregation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Bad: large interface with many unrelated methods\ntype BadStorage interface {\n  Read(key string) (string, error)\n  Write(key, value string) error\n  Delete(key string) error\n  List() ([]string, error)\n  Backup() error\n  Restore() error\n  Metrics() map[string]int\n  Health() error\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Interface Segregation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Good: segregated, focused interfaces,type Reader interface {,  Read(key string) (string, error),},,type Writer interface {,  Write(key, value string) error,},,type Deleter interface {,  Delete(key string) error,},\n\n// Compose as needed,type Storage interface {,  Reader,  Writer,  Deleter,},\n\n// Function accepts only what it needs,func fetchValue(r Reader, key string) string {,  val, err := r.Read(key),  if err != nil {,    log.Fatal(err),  },  return val,},\n\n// Can pass anything that implements Reader,type MemoryStore struct {,  data map[string]string,},,func (m *MemoryStore) Read(key string) (string, error) {,  val, ok := m.data[key],  if !ok {,    return \"\", fmt.Errorf(\"not found\"),  },  return val, nil,},\n\n// Even a simple function implementing Reader,func simpleReader(key string) (string, error) {,  return \"value\", nil,},\n\n// Go stdlib examples — all small, focused,// io.Reader: Read(p []byte) (n int, err error),// io.Writer: Write(p []byte) (n int, err error),// io.ReadWriter: Reader + Writer,// fmt.Stringer: String() string,// sort.Interface: Len(), Less(i, j int) bool, Swap(i, j int),,func main() {,  store := &MemoryStore{data: map[string]string{\"key\": \"value\"}},  val := fetchValue(store, \"key\"),  fmt.Println(val),\n\n  // io.Copy works with any Reader/Writer,  src := store,  fmt.Fprintf(os.Stdout, \"%v\", src),}"
                  }
        ],
        tips: [
                  "Prefer 1-3 method interfaces — 1 method is ideal (io.Reader, io.Writer).",
                  "Compose interfaces from smaller pieces: type ReadWriter interface { Reader; Writer }",
                  "Client code should depend on the smallest interface it needs — not the full API.",
                  "Go stdlib interfaces are great examples: io.Reader, io.Writer, fmt.Stringer.",
                  "Interface segregation enables multiple implementations to work the same way."
        ],
        mistake: "Creating large interfaces with many methods — forces implementers to implement unused methods. Keep interfaces focused.",
        shorthand: {
          verbose: "type BadStorage interface {\n  Read() error\n  Write() error\n  Delete() error\n  Backup() error\n  Metrics() error\n}",
          concise: "type Reader interface { Read(key string) (string, error) }\ntype Writer interface { Write(key, val string) error }\ntype Storage interface { Reader; Writer }",
        },
      },
      {
        id: "repository-pattern",
        fn: "Repository Pattern",
        desc: "Abstract data access behind an interface — swap implementations (SQL, cache, mock) easily.",
        category: "Data Access Patterns",
        subtitle: "Abstracted persistence layer",
        signature: "type Repository interface { Get(id string) (*Entity, error) }",
        descLong: "Repository pattern defines an interface for data access. Implementations handle SQL, file storage, cache, etc. Service layer depends on the interface, not concrete storage. Enables easy testing with mocks and swapping storage backends.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Repository Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"database/sql\"\n  \"fmt\"\n  \"log\"\n)\n\ntype User struct {\n  ID    string\n  Name  string\n  Email string\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Repository Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Repository Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Repository interface — what the service depends on\ntype UserRepository interface {\n  Get(id string) (*User, error)\n  Save(u *User) error\n  Delete(id string) error\n  List() ([]*User, error)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Repository Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Service depends on interface,type UserService struct {,  repo UserRepository,},,func NewUserService(repo UserRepository) *UserService {,  return &UserService{repo: repo},},,func (s *UserService) GetUser(id string) (*User, error) {,  return s.repo.Get(id),},,func (s *UserService) UpdateUser(u *User) error {,  // Business logic,  if u.Email == \"\" {,    return fmt.Errorf(\"email required\"),  },  return s.repo.Save(u),},\n\n// SQL implementation,type SQLUserRepository struct {,  db *sql.DB,},,func (r *SQLUserRepository) Get(id string) (*User, error) {,  var u User,  err := r.db.QueryRow(\"SELECT id, name, email FROM users WHERE id = $1\", id).,    Scan(&u.ID, &u.Name, &u.Email),  if err != nil {,    return nil, err,  },  return &u, nil,},,func (r *SQLUserRepository) Save(u *User) error {,  _, err := r.db.Exec(,    \"INSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT(id) DO UPDATE SET name=$2, email=$3\",,    u.ID, u.Name, u.Email),  return err,},,func (r *SQLUserRepository) Delete(id string) error {,  _, err := r.db.Exec(\"DELETE FROM users WHERE id = $1\", id),  return err,},,func (r *SQLUserRepository) List() ([]*User, error) {,  rows, err := r.db.Query(\"SELECT id, name, email FROM users\"),  if err != nil {,    return nil, err,  },  defer rows.Close(),,  var users []*User,  for rows.Next() {,    var u User,    if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {,      return nil, err,    },    users = append(users, &u),  },  return users, rows.Err(),},\n\n// Mock implementation for testing,type MockUserRepository struct {,  data map[string]*User,},,func (r *MockUserRepository) Get(id string) (*User, error) {,  u, ok := r.data[id],  if !ok {,    return nil, fmt.Errorf(\"not found\"),  },  return u, nil,},,func (r *MockUserRepository) Save(u *User) error {,  r.data[u.ID] = u,  return nil,},,func (r *MockUserRepository) Delete(id string) error {,  delete(r.data, id),  return nil,},,func (r *MockUserRepository) List() ([]*User, error) {,  var users []*User,  for _, u := range r.data {,    users = append(users, u),  },  return users, nil,},,func main() {,  // Use mock in tests,  mockRepo := &MockUserRepository{data: make(map[string]*User)},  svc := NewUserService(mockRepo),,  user := &User{ID: \"1\", Name: \"Alice\", Email: \"alice@example.com\"},  svc.UpdateUser(user),,  retrieved, _ := svc.GetUser(\"1\"),  fmt.Printf(\"Retrieved: %+v,\", retrieved),}"
                  }
        ],
        tips: [
                  "Repository owns the persistence logic; service owns business logic.",
                  "Depend on the repository interface, not concrete implementation.",
                  "Mock repository makes service testing trivial — no database needed.",
                  "Repository interface should match the service's needs, not the database schema.",
                  "Can have multiple repositories for different entities (UserRepository, PostRepository)."
        ],
        mistake: "Service directly using database/sql instead of repository interface — tight coupling and hard to test.",
        shorthand: {
          verbose: "svc := NewUserService(&SQLUserRepository{db})\n// tightly coupled to SQL implementation\n\nsvc := NewUserService(&MockUserRepository{})\n// need to modify code to test",
          concise: "svc := NewUserService(repo UserRepository)\n// repo could be SQL, mock, or cache",
        },
      },
      {
        id: "functional-options",
        fn: "Functional Options Pattern",
        desc: "Use functions to configure objects — flexible, extensible alternatives to builders.",
        category: "Construction Patterns",
        subtitle: "type Option func(*Config), WithField() Option",
        signature: "type Option func(*Config)  |  func WithTimeout(d time.Duration) Option",
        descLong: "Functional options pattern passes configuration via functions that modify a config struct. More idiomatic in Go than builders. Each option is a function returning Option. Supports optional parameters without breaking API changes. Client code reads clearly: New(WithTimeout(...), WithRetries(...)).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Functional Options Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"time\"\n)\n\ntype Config struct {\n  Timeout  time.Duration\n  Retries  int\n  MaxConns int\n  Debug    bool\n}\n\ntype Option func(*Config)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Functional Options Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Functional Options Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Option functions\nfunc WithTimeout(d time.Duration) Option {\n  return func(c *Config) {\n    c.Timeout = d\n  }\n}\n\nfunc WithRetries(n int) Option {\n  return func(c *Config) {\n    c.Retries = n\n  }\n}\n\nfunc WithMaxConns(n int) Option {\n  return func(c *Config) {\n    c.MaxConns = n\n  }\n}\n\nfunc WithDebug(debug bool) Option {\n  return func(c *Config) {\n    c.Debug = debug\n  }\n}\n\ntype Client struct {\n  cfg Config\n}\n\nfunc NewClient(opts ...Option) *Client {\n  // Default config\n  cfg := Config{\n    Timeout:  30 * time.Second,\n    Retries:  1,\n    MaxConns: 10,\n    Debug:    false,\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Functional Options Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Apply options,  for _, opt := range opts {,    opt(&cfg),  },,  return &Client{cfg: cfg},},,func main() {,  // Clear, extensible usage,  client := NewClient(,    WithTimeout(5 * time.Second),,    WithRetries(3),,    WithMaxConns(25),,    WithDebug(true),,  ),,  fmt.Printf(\"%+v,\", client.cfg),  // {Timeout:5s Retries:3 MaxConns:25 Debug:true},\n\n  // Another client with different options,  client2 := NewClient(WithTimeout(10 * time.Second)),  fmt.Printf(\"%+v,\", client2.cfg),  // {Timeout:10s Retries:1 MaxConns:10 Debug:false},\n\n  // No options — uses defaults,  client3 := NewClient(),  fmt.Printf(\"%+v,\", client3.cfg),  // {Timeout:30s Retries:1 MaxConns:10 Debug:false},}"
                  }
        ],
        tips: [
                  "Idiomatic Go pattern — used in many stdlib and popular libraries.",
                  "Non-breaking API changes — add new WithField options without modifying constructor.",
                  "Read client := New(WithTimeout(...), WithRetries(...)) clearly shows configuration.",
                  "Use variadic ...Option to accept any number of options.",
                  "Can use a validator function as the last parameter to check final config."
        ],
        mistake: "Creating conflicting options — WithDebugOn() and WithDebugOff(). Use a single WithDebug(bool).",
        shorthand: {
          verbose: "client := NewClient()\nclient.cfg.Timeout = 5*time.Second\nclient.cfg.Retries = 3",
          concise: "type Option func(*Config); WithTimeout(d)/WithRetries(n)/etc.; NewClient(opts ...Option)",
        },
      },
      {
        id: "pipeline-pattern",
        fn: "Pipeline Pattern — Channel-Based Processing",
        desc: "Chain goroutines with channels — fan-in/fan-out, streaming data processing.",
        category: "Concurrency Patterns",
        subtitle: "Channel stages, fan-in/fan-out, goroutine coordination",
        signature: "in <- ch1 | out <- process(in)  |  merge(ch1, ch2)",
        descLong: "Pipeline pattern chains goroutines, each reading from input channel and writing to output. Each stage is independent. Fan-out: one input to multiple workers. Fan-in: multiple inputs merged to one. Excellent for streaming data: read from source, transform, filter, aggregate.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pipeline Pattern — Channel-Based Processing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pipeline Pattern — Channel-Based Processing — common patterns you'll see in production.\n// APPROACH  - Combine Pipeline Pattern — Channel-Based Processing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple pipeline (3 stages) ──────────────────\nfunc pipeline() {\n  // Stage 1: Generate numbers\n  numbers := make(chan int)\n  go func() {\n    for i := 1; i <= 5; i++ {\n      numbers <- i\n    }\n    close(numbers)\n  }()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pipeline Pattern — Channel-Based Processing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Stage 2: Square numbers,  squared := make(chan int),  go func() {,    for n := range numbers {,      squared <- n * n,    },    close(squared),  }(),\n\n  // Stage 3: Print results,  for n := range squared {,    fmt.Println(n) // 1, 4, 9, 16, 25,  },},\n\n// ── Fan-out (one source to multiple workers) ────,func fanOut() {,  jobs := make(chan int, 10),  results := make(chan string, 10),\n\n  // Start 3 workers,  numWorkers := 3,  for i := 0; i < numWorkers; i++ {,    go func(id int) {,      for job := range jobs {,        results <- fmt.Sprintf(\"Worker %d processed job %d\", id, job),      },    }(i),  },\n\n  // Send jobs,  go func() {,    for i := 1; i <= 10; i++ {,      jobs <- i,    },    close(jobs),  }(),\n\n  // Collect results (10 of them),  for i := 0; i < 10; i++ {,    fmt.Println(<-results),  },},\n\n// ── Fan-in (merge multiple sources) ─────────────,func merge(ch1, ch2 <-chan string) <-chan string {,  out := make(chan string),  var wg sync.WaitGroup,,  send := func(c <-chan string) {,    for val := range c {,      out <- val,    },    wg.Done(),  },,  wg.Add(2),  go send(ch1),  go send(ch2),,  go func() {,    wg.Wait(),    close(out),  }(),,  return out,},,func fanIn() {,  // Two sources,  ch1 := make(chan string),  ch2 := make(chan string),,  go func() {,    ch1 <- \"from ch1-1\",    ch1 <- \"from ch1-2\",    close(ch1),  }(),,  go func() {,    ch2 <- \"from ch2-1\",    ch2 <- \"from ch2-2\",    close(ch2),  }(),\n\n  // Merge,  merged := merge(ch1, ch2),  for val := range merged {,    fmt.Println(val),  },},\n\n// ── Rate limiting in pipeline ───────────────────,func rateLimitedPipeline() {,  input := make(chan int),  output := make(chan int),\n\n  // Limit to 2 concurrent operations,  semaphore := make(chan struct{}, 2),,  go func() {,    for n := range input {,      semaphore <- struct{}{}  // acquire,      go func(val int) {,        fmt.Printf(\"Processing %d,\", val),        output <- val * 2,        <-semaphore  // release,      }(n),    },  }(),,  go func() {,    for i := 1; i <= 5; i++ {,      input <- i,    },    close(input),  }(),,  for n := range output {,    fmt.Println(\"Result:\", n),  },},\n\n// ── Broadcast (one source to all subscribers) ──,type Subscriber chan<- string,,func broadcast(msg string, subs ...Subscriber) {,  for _, sub := range subs {,    sub <- msg,  },},,func testBroadcast() {,  sub1 := make(chan string),  sub2 := make(chan string),,  go broadcast(\"hello\", sub1, sub2),,  fmt.Println(<-sub1),  fmt.Println(<-sub2),},,func main() {,  fmt.Println(\"=== Pipeline ===\"),  pipeline(),,  fmt.Println(\",=== Fan-Out ===\"),  fanOut(),,  fmt.Println(\",=== Fan-In ===\"),  fanIn(),,  fmt.Println(\",=== Rate Limiting ===\"),  rateLimitedPipeline(),,  fmt.Println(\",=== Broadcast ===\"),  testBroadcast(),}"
                  }
        ],
        tips: [
                  "Each stage is independent — scales horizontally by adding workers.",
                  "Close input channels to signal EOF — readers detect with range.",
                  "Use buffered channels to decouple stages — reduces blocking.",
                  "Fan-out distributes load across workers; fan-in merges results.",
                  "Carefully manage goroutine lifecycle — use sync.WaitGroup to know when done."
        ],
        mistake: "Not closing input channels — reading goroutines block forever on range.",
        shorthand: {
          verbose: "for n := range input {\n    output <- process(n)\n}\nclose(output)",
          concise: "Stage 1: generate → Stage 2: transform → Stage 3: consume; fan-out with workers; fan-in with merge; close channels",
        },
      },
      {
        id: "worker-pool-go",
        fn: "Worker Pool Pattern",
        desc: "Reusable goroutine pool — limit concurrency, graceful shutdown.",
        category: "Concurrency Patterns",
        subtitle: "sync.WaitGroup, buffered channel semaphore, work distribution",
        signature: "for w := 0; w < workers; w++ { go worker(jobs, results) }",
        descLong: "Worker pool limits concurrent operations. Create N goroutines, each reading from a job channel. Main goroutine sends work. Use sync.WaitGroup to wait for completion. Buffered channel acts as semaphore. Graceful shutdown: close job channel, wait for workers to finish.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Pool Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n  \"time\"\n)\n\ntype Job struct {\n  ID int\n}\n\ntype Result struct {\n  Job    Job\n  Output string\n}\n\nfunc worker(id int, jobs <-chan Job, results chan<- Result, wg *sync.WaitGroup) {\n  defer wg.Done()\n\n  for job := range jobs {\n    fmt.Printf(\"Worker %d starting job %d\n\", id, job.ID)\n    time.Sleep(1 * time.Second) // simulate work\n\n    results <- Result{\n      Job:    job,\n      Output: fmt.Sprintf(\"Processed %d\", job.ID),\n    }\n  }\n  fmt.Printf(\"Worker %d shutting down\n\", id)\n}\n\nfunc workerPool() {\n  numWorkers := 3\n  numJobs := 10\n\n  jobs := make(chan Job, numJobs)\n  results := make(chan Result, numJobs)\n\n  var wg sync.WaitGroup"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Pool Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Worker Pool Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Start workers\n  for w := 0; w < numWorkers; w++ {\n    wg.Add(1)\n    go worker(w, jobs, results, &wg)\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Pool Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Send jobs,  go func() {,    for i := 0; i < numJobs; i++ {,      jobs <- Job{ID: i},    },    close(jobs) // signal no more jobs,  }(),\n\n  // Collect results,  go func() {,    wg.Wait() // wait for all workers to finish,    close(results),  }(),,  for result := range results {,    fmt.Printf(\"Result: %s,\", result.Output),  },},\n\n// ── With graceful shutdown and timeout ───────────,type WorkerPool struct {,  jobs    chan Job,  results chan Result,  wg      sync.WaitGroup,  done    chan struct{},},,func NewWorkerPool(numWorkers int) *WorkerPool {,  pool := &WorkerPool{,    jobs:    make(chan Job, 100),,    results: make(chan Result, 100),,    done:    make(chan struct{}),,  },,  for i := 0; i < numWorkers; i++ {,    pool.wg.Add(1),    go pool.worker(i),  },,  return pool,},,func (p *WorkerPool) worker(id int) {,  defer p.wg.Done(),,  for {,    select {,    case job, ok := <-p.jobs:,      if !ok {,        return // channel closed, exit worker,      },      fmt.Printf(\"Worker %d processing job %d,\", id, job.ID),      p.results <- Result{Job: job, Output: \"done\"},,    case <-p.done:,      return // shutdown signal,    },  },},,func (p *WorkerPool) Submit(job Job) {,  p.jobs <- job,},,func (p *WorkerPool) Wait() {,  close(p.jobs) // close jobs to signal workers,  p.wg.Wait()   // wait for all workers,  close(p.results),},,func (p *WorkerPool) Shutdown(timeout time.Duration) {,  done := make(chan struct{}),  go func() {,    p.Wait(),    close(done),  }(),,  select {,  case <-done:,    fmt.Println(\"Graceful shutdown complete\"),  case <-time.After(timeout):,    fmt.Println(\"Shutdown timeout exceeded\"),    close(p.done) // force shutdown,  },},,func (p *WorkerPool) Results() <-chan Result {,  return p.results,},,func main() {,  workerPool(),,  fmt.Println(\",=== With Graceful Shutdown ===\"),  pool := NewWorkerPool(3),\n\n  // Submit jobs,  for i := 0; i < 10; i++ {,    pool.Submit(Job{ID: i}),  },\n\n  // Collect results in background,  go func() {,    for result := range pool.Results() {,      fmt.Printf(\"Got result: %s,\", result.Output),    },  }(),\n\n  // Graceful shutdown with 5 second timeout,  pool.Shutdown(5 * time.Second),}"
                  }
        ],
        tips: [
                  "Buffered job channel avoids blocking submitter — size it appropriately.",
                  "sync.WaitGroup tracks worker completion — always use for graceful shutdown.",
                  "Close job channel to signal workers to stop — clean exit.",
                  "Use select with done channel for timeout-based shutdown.",
                  "Number of workers should match CPU cores or I/O wait characteristics."
        ],
        mistake: "Not closing the job channel — workers block on receive forever.",
        shorthand: {
          verbose: "for w := 0; w < numWorkers; w++ {\n  go worker(jobs, results)\n}\nfor job := range jobs { /* process */ }\nwg.Wait()",
          concise: "NewWorkerPool(numWorkers); Submit(job); Shutdown(timeout); close(jobs) for graceful shutdown",
        },
      },
      {
        id: "circuit-breaker-go",
        fn: "Circuit Breaker Pattern",
        desc: "Prevent cascading failures — state machine (closed/open/half-open).",
        category: "Resilience Patterns",
        subtitle: "State machine, failure counting, timeout, half-open recovery",
        signature: "type CircuitBreaker struct { state State, failures int }  |  cb.Call(fn)",
        descLong: "Circuit breaker prevents repeated calls to failing service. States: Closed (normal), Open (fail fast), Half-Open (test recovery). Count failures in Closed state; open after threshold. Half-Open: try one request; if ok, close; if fail, reopen. Timeout: automatically half-open after duration in Open state.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Circuit Breaker Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n  \"time\"\n)\n\ntype State int\n\nconst (\n  Closed State = iota\n  Open\n  HalfOpen\n)\n\ntype CircuitBreaker struct {\n  mu              sync.RWMutex\n  state           State\n  failures        int\n  successCount    int\n  lastFailTime    time.Time\n  failureThresh   int\n  timeout         time.Duration\n  successThresh   int\n}\n\nfunc NewCircuitBreaker(failureThreshold int, timeout time.Duration) *CircuitBreaker {\n  return &CircuitBreaker{\n    state:         Closed,\n    failureThresh: failureThreshold,\n    timeout:       timeout,\n    successThresh: 2, // require 2 successes to close\n  }\n}\n\nfunc (cb *CircuitBreaker) Call(fn func() error) error {\n  cb.mu.Lock()\n  defer cb.mu.Unlock()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Circuit Breaker Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Circuit Breaker Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Check if should transition to half-open\n  if cb.state == Open && time.Since(cb.lastFailTime) > cb.timeout {\n    cb.state = HalfOpen\n    cb.successCount = 0\n  }\n\n  switch cb.state {\n  case Open:\n    return fmt.Errorf(\"circuit breaker open\")\n\n  case HalfOpen:\n    // Try the call\n    err := fn()\n    if err != nil {\n      cb.state = Open\n      cb.lastFailTime = time.Now()\n      cb.failures = 0\n      return err\n    }\n\n    cb.successCount++\n    if cb.successCount >= cb.successThresh {\n      cb.state = Closed\n      cb.failures = 0\n    }\n    return nil\n\n  case Closed:\n    err := fn()\n    if err != nil {\n      cb.failures++\n      cb.lastFailTime = time.Now()\n\n      if cb.failures >= cb.failureThresh {\n        cb.state = Open\n      }\n      return err\n    }\n\n    cb.failures = 0\n    return nil\n  }\n\n  return nil\n}\n\nfunc (cb *CircuitBreaker) GetState() State {\n  cb.mu.RLock()\n  defer cb.mu.RUnlock()\n  return cb.state\n}\n\nfunc main() {\n  cb := NewCircuitBreaker(3, 5*time.Second)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Circuit Breaker Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Simulate API call that fails,  callCount := 0,  apiCall := func() error {,    callCount++,    if callCount <= 3 {,      return fmt.Errorf(\"service unavailable\"),    },    return nil // eventually succeeds,  },\n\n  // Test circuit breaker,  for i := 0; i < 10; i++ {,    err := cb.Call(apiCall),,    states := map[State]string{,      Closed:   \"CLOSED\",,      Open:     \"OPEN\",,      HalfOpen: \"HALF-OPEN\",,    },,    fmt.Printf(\"Attempt %d: Error=%v, State=%s,\", i+1, err, states[cb.GetState()]),,    if cb.GetState() == Open {,      fmt.Println(\"Circuit opened, waiting for timeout...\"),      time.Sleep(6 * time.Second),      fmt.Println(\"Timeout elapsed, transitioning to half-open\"),    },,    time.Sleep(500 * time.Millisecond),  },}"
                  }
        ],
        tips: [
                  "State transitions: Closed → Open (on failures) → Half-Open (after timeout) → Closed (on success).",
                  "Failure threshold: how many failures before opening. 3-5 is typical.",
                  "Timeout: how long to wait in Open state before trying again. 30-60 seconds typical.",
                  "Success threshold in Half-Open: require N successes before closing. Prevents flapping.",
                  "Popular library: sony/gobreaker — production-ready implementation."
        ],
        mistake: "No timeout in Open state — circuit stays open forever. Always set timeout.",
        shorthand: {
          verbose: "if cb.failures >= threshold {\n  cb.state = Open\n}\nif time.Since(lastFail) > timeout {\n  cb.state = HalfOpen\n}",
          concise: "NewCircuitBreaker(threshold, timeout); cb.Call(fn); states: Closed→Open→HalfOpen→Closed",
        },
      },
      {
        id: "retry-pattern-go",
        fn: "Retry Pattern with Exponential Backoff",
        desc: "Retry with backoff: exponential delay, jitter, max attempts.",
        category: "Resilience Patterns",
        subtitle: "Exponential backoff, jitter, max retries, context timeout",
        signature: "for i := 0; i < maxRetries; i++ { ... time.Sleep(exponentialBackoff(i)) }",
        descLong: "Retry transient failures with exponential backoff to avoid overwhelming the service. Add jitter to prevent thundering herd. Check context timeout to stop early. Libraries like cenkalti/backoff simplify configuration and backoff strategies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Retry Pattern with Exponential Backoff — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"fmt\"\n  \"log\"\n  \"math\"\n  \"math/rand\"\n  \"time\"\n\n  \"github.com/cenkalti/backoff/v4\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Retry Pattern with Exponential Backoff — common patterns you'll see in production.\n// APPROACH  - Combine Retry Pattern with Exponential Backoff with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple exponential backoff ───────────────────\nfunc exponentialBackoff(attempt int) time.Duration {\n  return time.Duration(math.Pow(2, float64(attempt))) * time.Second\n}\n\nfunc simpleRetry(fn func() error, maxRetries int) error {\n  for attempt := 0; attempt < maxRetries; attempt++ {\n    err := fn()\n    if err == nil {\n      return nil\n    }\n\n    if attempt < maxRetries-1 {\n      backoff := exponentialBackoff(attempt)\n      fmt.Printf(\"Attempt %d failed, retrying in %v\n\", attempt+1, backoff)\n      time.Sleep(backoff)\n    }\n  }\n  return fmt.Errorf(\"failed after %d attempts\", maxRetries)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Retry Pattern with Exponential Backoff — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── With jitter (prevent thundering herd) ───────,func backoffWithJitter(attempt int) time.Duration {,  baseBackoff := math.Pow(2, float64(attempt)),  jitter := rand.Float64() * 0.1 * baseBackoff,  return time.Duration(baseBackoff+jitter) * time.Second,},,func retryWithJitter(fn func() error, maxRetries int) error {,  for attempt := 0; attempt < maxRetries; attempt++ {,    err := fn(),    if err == nil {,      return nil,    },,    if attempt < maxRetries-1 {,      backoff := backoffWithJitter(attempt),      fmt.Printf(\"Attempt %d failed, retrying in %v,\", attempt+1, backoff),      time.Sleep(backoff),    },  },  return fmt.Errorf(\"failed after %d attempts\", maxRetries),},\n\n// ── With context timeout ────────────────────────,func retryWithTimeout(ctx context.Context, fn func() error, maxRetries int) error {,  for attempt := 0; attempt < maxRetries; attempt++ {,    // Check context before trying,    select {,    case <-ctx.Done():,      return ctx.Err(),    default:,    },,    err := fn(),    if err == nil {,      return nil,    },,    if attempt < maxRetries-1 {,      backoff := backoffWithJitter(attempt),      fmt.Printf(\"Attempt %d failed, retrying in %v,\", attempt+1, backoff),,      select {,      case <-time.After(backoff):,        // continue to next attempt,      case <-ctx.Done():,        return ctx.Err(),      },    },  },  return fmt.Errorf(\"failed after %d attempts\", maxRetries),},\n\n// ── Using cenkalti/backoff library ──────────────,func retryWithBackoffLib(fn func() error) error {,  expBackoff := backoff.NewExponentialBackOff(),  expBackoff.InitialInterval = 100 * time.Millisecond,  expBackoff.MaxInterval = 30 * time.Second,  expBackoff.MaxElapsedTime = 5 * time.Minute,,  return backoff.Retry(fn, expBackoff),},\n\n// ── With context in backoff lib ─────────────────,func retryWithBackoffCtx(ctx context.Context, fn func() error) error {,  expBackoff := backoff.NewExponentialBackOff(),  expBackoff.InitialInterval = 100 * time.Millisecond,  expBackoff.MaxInterval = 30 * time.Second,,  return backoff.RetryNotify(fn, backoff.WithContext(expBackoff, ctx),,    func(err error, duration time.Duration) {,      fmt.Printf(\"Retry in %v: %v,\", duration, err),    }),},\n\n// ── Retry with specific error detection ────────,func retryIfTransient(fn func() error, maxRetries int) error {,  for attempt := 0; attempt < maxRetries; attempt++ {,    err := fn(),    if err == nil {,      return nil,    },\n\n    // Only retry on transient errors,    if !isTransient(err) {,      return err // permanent error, don't retry,    },,    if attempt < maxRetries-1 {,      backoff := backoffWithJitter(attempt),      time.Sleep(backoff),    },  },  return fmt.Errorf(\"failed after %d attempts\", maxRetries),},,func isTransient(err error) bool {,  // Check if error is temporary (e.g., network timeout, 429, 503),  // In real code, check error type and codes,  return true,},,func main() {,  attempts := 0,,  mockAPI := func() error {,    attempts++,    if attempts < 3 {,      return fmt.Errorf(\"service temporarily unavailable\"),    },    return nil,  },,  fmt.Println(\"=== Simple Retry ===\"),  attempts = 0,  err := simpleRetry(mockAPI, 5),  if err != nil {,    log.Fatal(err),  },  fmt.Printf(\"Success after %d attempts,\", attempts),,  fmt.Println(\",=== With Jitter ===\"),  attempts = 0,  err = retryWithJitter(mockAPI, 5),  if err != nil {,    log.Fatal(err),  },,  fmt.Println(\",=== With Context Timeout ===\"),  attempts = 0,  ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second),  defer cancel(),  err = retryWithTimeout(ctx, mockAPI, 5),  if err != nil {,    log.Fatal(err),  },,  fmt.Println(\",=== Using backoff library ===\"),  attempts = 0,  err = retryWithBackoffLib(mockAPI),  if err != nil {,    log.Fatal(err),  },}"
                  }
        ],
        tips: [
                  "Exponential backoff: 1s, 2s, 4s, 8s, 16s — reduces load on struggling service.",
                  "Jitter: add randomness to prevent thundering herd (all clients retrying at same time).",
                  "Max elapsed time: give up after total duration, not just attempt count.",
                  "Check context before every retry — respect cancellation and timeouts.",
                  "Only retry transient errors (4xx, 5xx, timeouts) — not permanent errors (401, 403)."
        ],
        mistake: "Retrying non-transient errors (auth failure, invalid input) — wastes time and resources.",
        shorthand: {
          verbose: "for i := 0; i < 5; i++ {\n  err := fn()\n  if err == nil { return nil }\n  time.Sleep(exponentialBackoff(i))\n}",
          concise: "Exponential backoff: 2^i seconds; add jitter; check context; backoff library for config; only retry transient errors",
        },
      },
      {
        id: "observer-go",
        fn: "Observer/Event Bus Pattern",
        desc: "Observer pattern with sync.RWMutex — subscribers notified of events.",
        category: "Event Patterns",
        subtitle: "Observer, subscribe/publish, RWMutex, event dispatching",
        signature: "type EventBus struct { subscribers map[string][]func(Event) }",
        descLong: "Observer pattern decouples event producers from consumers. Subscribers register callbacks for event types. When event occurs, all subscribers notified. Protect subscriber map with sync.RWMutex for concurrent access. Async dispatch with goroutines prevents blocking publishers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Observer/Event Bus Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)\n\ntype Event interface {\n  Type() string\n}\n\ntype UserCreatedEvent struct {\n  UserID string\n  Email  string\n}\n\nfunc (e UserCreatedEvent) Type() string {\n  return \"user.created\"\n}\n\ntype EventBus struct {\n  mu          sync.RWMutex\n  subscribers map[string][]func(Event)\n}\n\nfunc NewEventBus() *EventBus {\n  return &EventBus{\n    subscribers: make(map[string][]func(Event)),\n  }\n}\n\nfunc (eb *EventBus) Subscribe(eventType string, fn func(Event)) {\n  eb.mu.Lock()\n  defer eb.mu.Unlock()\n\n  eb.subscribers[eventType] = append(eb.subscribers[eventType], fn)\n}\n\nfunc (eb *EventBus) Unsubscribe(eventType string, index int) {\n  eb.mu.Lock()\n  defer eb.mu.Unlock()\n\n  if subs, ok := eb.subscribers[eventType]; ok && index < len(subs) {\n    eb.subscribers[eventType] = append(subs[:index], subs[index+1:]...)\n  }\n}\n\nfunc (eb *EventBus) Publish(event Event) {\n  eb.mu.RLock()\n  subs, ok := eb.subscribers[event.Type()]\n  eb.mu.RUnlock()\n\n  if !ok {\n    return\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Observer/Event Bus Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Observer/Event Bus Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Dispatch async to prevent blocking publisher\n  for _, fn := range subs {\n    go fn(event)\n  }\n}\n\nfunc (eb *EventBus) PublishSync(event Event) {\n  eb.mu.RLock()\n  subs, ok := eb.subscribers[event.Type()]\n  eb.mu.RUnlock()\n\n  if !ok {\n    return\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Observer/Event Bus Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Dispatch synchronously,  for _, fn := range subs {,    fn(event),  },},\n\n// ── With error handling ─────────────────────────,type Handler func(Event) error,,type ErrorHandlingBus struct {,  mu          sync.RWMutex,  subscribers map[string][]Handler,},,func NewErrorHandlingBus() *ErrorHandlingBus {,  return &ErrorHandlingBus{,    subscribers: make(map[string][]Handler),,  },},,func (eb *ErrorHandlingBus) Subscribe(eventType string, handler Handler) {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  eb.subscribers[eventType] = append(eb.subscribers[eventType], handler),},,func (eb *ErrorHandlingBus) Publish(event Event) error {,  eb.mu.RLock(),  handlers, ok := eb.subscribers[event.Type()],  eb.mu.RUnlock(),,  if !ok {,    return nil,  },,  var errors []error,  for _, handler := range handlers {,    if err := handler(event); err != nil {,      errors = append(errors, err),    },  },,  if len(errors) > 0 {,    return fmt.Errorf(\"handlers failed: %v\", errors),  },  return nil,},,func main() {,  bus := NewEventBus(),\n\n  // Subscribe to user.created events,  bus.Subscribe(\"user.created\", func(e Event) {,    evt := e.(UserCreatedEvent),    fmt.Printf(\"Welcome email sent to %s,\", evt.Email),  }),,  bus.Subscribe(\"user.created\", func(e Event) {,    evt := e.(UserCreatedEvent),    fmt.Printf(\"User analytics recorded for %s,\", evt.UserID),  }),\n\n  // Publish event,  event := UserCreatedEvent{UserID: \"123\", Email: \"alice@example.com\"},  bus.Publish(event),\n\n  // Give goroutines time to finish,  select {},}"
                  }
        ],
        tips: [
                  "Use sync.RWMutex for concurrent subscriber access — readers don't block each other.",
                  "Async dispatch (go fn(event)) prevents one slow handler from blocking others.",
                  "Store subscriber index to support unsubscribe — or use unique IDs.",
                  "Type assert Event to concrete type — or use generic if Go 1.18+.",
                  "Consider priority (ordered handlers) for deterministic behavior."
        ],
        mistake: "Synchronously calling all handlers — one slow handler blocks all others and publisher.",
        shorthand: {
          verbose: "// Manual / verbose approach\nbus.Subscribe(\"event\", func(e Event) { ... })\nfor _, handler := range handlers { handler(event) }\n// More explicit but longer",
          concise: "NewEventBus(); Subscribe(eventType, handler); Publish(event) async; RWMutex for concurrent access",
        },
      },
      {
        id: "decorator-go",
        fn: "Decorator/Middleware Pattern",
        desc: "Decorator wraps functions — add behavior without modifying original.",
        category: "Structural Patterns",
        subtitle: "Function wrapping, composition, logging, metrics middleware",
        signature: "func withLogging(fn func()) func() { return func() { log(...); fn(); log(...) } }",
        descLong: "Decorator pattern wraps a function to add behavior (logging, timing, caching, auth). Create a wrapper function that calls the original. Chain decorators for multiple concerns. More functional than middleware pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Decorator/Middleware Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Decorator/Middleware Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Decorator/Middleware Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic decorator (logging) ───────────────────\nfunc withLogging(fn func(string) string) func(string) string {\n  return func(input string) string {\n    fmt.Printf(\"Input: %s\n\", input)\n    result := fn(input)\n    fmt.Printf(\"Output: %s\n\", result)\n    return result\n  }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Decorator/Middleware Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Timing decorator ────────────────────────────,func withTiming(fn func(string) string) func(string) string {,  return func(input string) string {,    start := time.Now(),    result := fn(input),    fmt.Printf(\"Execution time: %v,\", time.Since(start)),    return result,  },},\n\n// ── Caching decorator (memoization) ────────────,func withCache(fn func(string) string) func(string) string {,  cache := make(map[string]string),,  return func(input string) string {,    if cached, ok := cache[input]; ok {,      fmt.Println(\"Cache hit\"),      return cached,    },,    result := fn(input),    cache[input] = result,    return result,  },},\n\n// ── Retry decorator ────────────────────────────,func withRetry(fn func() error, maxRetries int) func() error {,  return func() error {,    for attempt := 0; attempt < maxRetries; attempt++ {,      err := fn(),      if err == nil {,        return nil,      },      fmt.Printf(\"Attempt %d failed, retrying,\", attempt+1),      time.Sleep(time.Duration(1<<uint(attempt)) * time.Second),    },    return fmt.Errorf(\"failed after %d attempts\", maxRetries),  },},\n\n// ── Chaining decorators ────────────────────────,func upper(s string) string {,  return fmt.Sprintf(\"UPPER(%s)\", s),},,func chainDecorators() {,  fn := upper,\n\n  // Apply decorators: cache → timing → logging,  fn = withLogging(fn),  fn = withTiming(fn),  fn = withCache(fn),\n\n  // First call,  fn(\"hello\"),\n\n  // Second call (cache hit),  fn(\"hello\"),\n\n  // Different input,  fn(\"world\"),},\n\n// ── With generics (Go 1.18+) ───────────────────,func withTimeoutGeneric[T any, R any](fn func(T) R, timeout time.Duration) func(T) (R, error) {,  return func(input T) (R, error) {,    // Can't directly implement timeout without channels,    // But demonstrates generic decorator pattern,    return fn(input), nil,  },},\n\n// ── For methods (not just functions) ────────────,type Service struct {,  name string,},,func (s *Service) Process(input string) string {,  return fmt.Sprintf(\"%s processed %s\", s.name, input),},,func withMetrics(fn func(string) string, name string) func(string) string {,  return func(input string) string {,    fmt.Printf(\"[Metrics] Calling %s,\", name),    result := fn(input),    fmt.Printf(\"[Metrics] %s completed,\", name),    return result,  },},\n\n// ── Practical: HTTP handler decorator ───────────,type Handler func(string) string,,func logHandler(next Handler) Handler {,  return func(input string) string {,    fmt.Printf(\"Handler called with: %s,\", input),    return next(input),  },},,func cacheHandler(next Handler) Handler {,  cache := make(map[string]string),  return func(input string) string {,    if val, ok := cache[input]; ok {,      return val,    },    result := next(input),    cache[input] = result,    return result,  },},,func compose(h Handler, decorators ...func(Handler) Handler) Handler {,  for _, dec := range decorators {,    h = dec(h),  },  return h,},,func main() {,  fmt.Println(\"=== Chaining Decorators ===\"),  chainDecorators(),,  fmt.Println(\",=== Composing Handlers ===\"),  handler := func(input string) string {,    return fmt.Sprintf(\"Result: %s\", input),  },,  decorated := compose(handler, logHandler, cacheHandler),,  decorated(\"test\"),  decorated(\"test\") // cache hit,}"
                  }
        ],
        tips: [
                  "Decorator wraps function and returns new function — preserves original signature.",
                  "Chain decorators for multiple concerns — each adds one responsibility.",
                  "Caching decorator can memoize expensive computations.",
                  "Retry and timeout decorators add resilience.",
                  "Order matters — apply caching before logging to avoid logging cache hits."
        ],
        mistake: "Modifying the original function instead of wrapping it — breaks composition.",
        shorthand: {
          verbose: "fn := original\nfn = withLogging(fn)\nfn = withTiming(fn)\nfn = withCache(fn)",
          concise: "Wrap function to add behavior; chain for multiple concerns; compose() helper for clean application",
        },
      },
      {
        id: "singleton-go",
        fn: "Singleton with sync.Once",
        desc: "Lazy initialization, thread-safe singleton.",
        category: "Creation Patterns",
        subtitle: "sync.Once, lazy initialization, thread-safety",
        signature: "var once sync.Once  |  once.Do(func() { instance = NewDB() })",
        descLong: "Singleton pattern ensures only one instance exists. sync.Once guarantees initialization happens exactly once, even in concurrent access. Preferred over mutex locks or package-level vars. Lazy initialization: instance created on first use.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Singleton with sync.Once — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"sync\"\n)\n\ntype Database struct {\n  conn string\n}\n\nfunc (db *Database) Query(sql string) string {\n  return fmt.Sprintf(\"Executing: %s\", sql)\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Singleton with sync.Once — common patterns you'll see in production.\n// APPROACH  - Combine Singleton with sync.Once with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Singleton using sync.Once ──────────────────\nvar (\n  dbInstance *Database\n  once       sync.Once\n)\n\nfunc GetDB() *Database {\n  once.Do(func() {\n    fmt.Println(\"Initializing database connection...\")\n    dbInstance = &Database{conn: \"postgres://localhost\"}\n  })\n  return dbInstance\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Singleton with sync.Once — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Package-level singleton ────────────────────,var logger *Logger,,func init() {,  logger = &Logger{},},,type Logger struct{},,func (l *Logger) Log(msg string) {,  fmt.Println(\"[LOG]\", msg),},\n\n// ── With error handling ────────────────────────,type Config struct {,  DSN string,},,var (,  config    *Config,  configErr error,  configOnce sync.Once,),,func GetConfig() (*Config, error) {,  configOnce.Do(func() {,    // Load config from env, file, etc.,    config = &Config{DSN: \"postgres://localhost\"},    // or error on failure:,    // configErr = fmt.Errorf(\"failed to load config\"),  }),  return config, configErr,},\n\n// ── Thread-safe singleton test ──────────────────,func testSingleton() {,  var wg sync.WaitGroup,\n\n  // 100 goroutines trying to get DB,  for i := 0; i < 100; i++ {,    wg.Add(1),    go func(id int) {,      defer wg.Done(),,      db := GetDB(),      result := db.Query(fmt.Sprintf(\"SELECT * FROM users WHERE id = %d\", id)),      fmt.Printf(\"[%d] %s,\", id, result),    }(i),  },,  wg.Wait(),  fmt.Println(\"All goroutines completed\"),},,func main() {,  testSingleton(),}"
                  }
        ],
        tips: [
                  "sync.Once is thread-safe — use it for lazy initialization.",
                  "More idiomatic than double-checked locking or mutex patterns.",
                  "Do() is called exactly once regardless of concurrent calls.",
                  "Useful for: database connections, configuration, loggers, connection pools.",
                  "Can panic in Do() — caught and propagated to caller."
        ],
        mistake: "Creating new instances in concurrent goroutines — defeats singleton purpose. Use sync.Once.",
        shorthand: {
          verbose: "var mu sync.Mutex\nvar instance *DB\nif instance == nil {\n  mu.Lock()\n  if instance == nil {\n    instance = NewDB()\n  }\n  mu.Unlock()\n}",
          concise: "var once sync.Once; once.Do(func() { instance = New() }); GetInstance() { once.Do(...); return instance }",
        },
      },
    ],
  },
]

export default { meta, sections }
