export const meta = {
  "id": "go-web",
  "label": "Web & HTTP",
  "icon": "🐹",
  "description": "Go web development: net/http, handlers, middleware, JSON APIs, templates, and routing patterns."
}

export const sections = [

  // ── Section 1: HTTP Handlers & Routing ─────────────────────────────────────────
  {
    id: "http-handlers",
    title: "HTTP Handlers & Routing",
    entries: [
      {
        id: "http-server",
        fn: "net/http Server — Handlers, Mux & Routing",
        desc: "Build HTTP servers with the standard library — handlers, ServeMux, path parameters (Go 1.22+), and graceful shutdown.",
        category: "Web",
        subtitle: "http.HandleFunc, http.ServeMux, path params, ListenAndServe",
        signature: "http.HandleFunc(\"/path\", handler)  |  mux.Handle(\"GET /api/{id}\", h)",
        descLong: "Go's net/http package provides a production-ready HTTP server. Handlers implement http.Handler (ServeHTTP method) or use http.HandlerFunc for functions. Go 1.22+ adds method-based routing and path parameters to the default ServeMux: \"GET /api/users/{id}\" extracts {id} from the URL. For complex apps, use chi or gorilla/mux. Always implement graceful shutdown with context cancellation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of net/http Server — Handlers, Mux & Routing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"context\"\n    \"encoding/json\"\n    \"fmt\"\n    \"log\"\n    \"net/http\"\n    \"os\"\n    \"os/signal\"\n    \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of net/http Server — Handlers, Mux & Routing — common patterns you'll see in production.\n// APPROACH  - Combine net/http Server — Handlers, Mux & Routing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic handler function ─────────────────────────\nfunc healthHandler(w http.ResponseWriter, r *http.Request) {\n    w.Header().Set(\"Content-Type\", \"application/json\")\n    w.WriteHeader(http.StatusOK)\n    json.NewEncoder(w).Encode(map[string]string{\"status\": \"ok\"})\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of net/http Server — Handlers, Mux & Routing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Go 1.22+ enhanced routing ──────────────────────,func main() {,    mux := http.NewServeMux(),\n\n    // Method + path pattern matching,    mux.HandleFunc(\"GET /api/health\", healthHandler),    mux.HandleFunc(\"GET /api/users\", listUsers),    mux.HandleFunc(\"GET /api/users/{id}\", getUser)     // path param!,    mux.HandleFunc(\"POST /api/users\", createUser),    mux.HandleFunc(\"DELETE /api/users/{id}\", deleteUser),\n\n    // Static files,    mux.Handle(\"GET /static/\",,        http.StripPrefix(\"/static/\", http.FileServer(http.Dir(\"./static\")))),\n\n    // Server with timeouts (always set these!),    server := &http.Server{,        Addr:         \":8080\",,        Handler:      mux,,        ReadTimeout:  10 * time.Second,,        WriteTimeout: 15 * time.Second,,        IdleTimeout:  60 * time.Second,,    },\n\n    // ── Graceful shutdown ──────────────────────────,    go func() {,        log.Printf(\"Server starting on %s\", server.Addr),        if err := server.ListenAndServe(); err != http.ErrServerClosed {,            log.Fatalf(\"Server error: %v\", err),        },    }(),,    quit := make(chan os.Signal, 1),    signal.Notify(quit, os.Interrupt),    <-quit,    log.Println(\"Shutting down...\"),,    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second),    defer cancel(),    if err := server.Shutdown(ctx); err != nil {,        log.Fatalf(\"Shutdown error: %v\", err),    },    log.Println(\"Server stopped\"),},\n\n// ── Path parameter extraction (Go 1.22+) ───────────,func getUser(w http.ResponseWriter, r *http.Request) {,    id := r.PathValue(\"id\")  // from {id} in route pattern,    // Fetch user by id...,    fmt.Fprintf(w, \"User: %s\", id),},,func listUsers(w http.ResponseWriter, r *http.Request) {,    w.Header().Set(\"Content-Type\", \"application/json\"),    json.NewEncoder(w).Encode([]string{\"Alice\", \"Bob\"}),},,func createUser(w http.ResponseWriter, r *http.Request) {,    w.WriteHeader(http.StatusCreated),},,func deleteUser(w http.ResponseWriter, r *http.Request) {,    id := r.PathValue(\"id\"),    fmt.Fprintf(w, \"Deleted user: %s\", id),}"
                  }
        ],
        tips: [
                  "Go 1.22+ ServeMux supports \"GET /api/users/{id}\" — path params and method matching without third-party routers.",
                  "Always set ReadTimeout, WriteTimeout, IdleTimeout — a bare http.Server has no timeouts and is vulnerable to slowloris.",
                  "Use server.Shutdown(ctx) for graceful shutdown — in-flight requests finish before the server stops.",
                  "r.PathValue(\"id\") extracts path parameters in Go 1.22+ — no more manual string splitting."
        ],
        mistake: "Using http.ListenAndServe(\":8080\", nil) in production — no timeouts, no graceful shutdown, uses DefaultServeMux (global state). Always create an explicit http.Server with timeouts.",
        shorthand: {
          verbose: "// Manual / verbose approach\nhttp.HandleFunc(\"/\", handler)\nhttp.ListenAndServe(\":8080\", nil) // No timeouts, no shutdown\n// More explicit but longer",
          concise: "server := &http.Server{ ReadTimeout: 10s, WriteTimeout: 15s, ... }; server.Shutdown(ctx); r.PathValue(\"id\") for params",
        },
      },
      {
        id: "json-api",
        fn: "JSON APIs — Request/Response Patterns",
        desc: "Parse JSON requests, validate input, and send structured JSON responses with proper error handling.",
        category: "Web",
        subtitle: "json.Decoder, json.Encoder, struct tags, error responses",
        signature: "json.NewDecoder(r.Body).Decode(&v)  |  json.NewEncoder(w).Encode(v)",
        descLong: "Go's encoding/json package handles JSON encoding/decoding with struct tags. Use json.NewDecoder for request bodies (streaming, limits request size). Struct tags control field names, omission, and string conversion. Always validate input, limit body size, set Content-Type headers, and use consistent error response formats. For high-performance JSON, consider sonic or jsoniter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of JSON APIs — Request/Response Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n    \"encoding/json\"\n    \"errors\"\n    \"net/http\"\n    \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of JSON APIs — Request/Response Patterns — common patterns you'll see in production.\n// APPROACH  - Combine JSON APIs — Request/Response Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Struct tags map Go fields to JSON keys ─────────\n// Use struct tags: json:\"name\", json:\"age,omitempty\", json:\"-\"\n//   \"name\"      → renames field in JSON\n//   \"omitempty\"  → omit if zero value\n//   \"-\"          → never include in JSON output\n\ntype CreateUserRequest struct {\n    Name  string  `json:\"name\"`\n    Email string  `json:\"email\"`\n    Age   int     `json:\"age,omitempty\"`\n}\n\ntype User struct {\n    ID        string     `json:\"id\"`\n    Name      string     `json:\"name\"`\n    Email     string     `json:\"email\"`\n    Age       int        `json:\"age,omitempty\"`\n    CreatedAt time.Time  `json:\"created_at\"`\n    Password  string     `json:\"-\"`  (excluded from output!)\n}\n\ntype APIError struct {\n    Error   string  `json:\"error\"`\n    Code    string  `json:\"code,omitempty\"`\n    Details any     `json:\"details,omitempty\"`\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of JSON APIs — Request/Response Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── JSON helper functions ──────────────────────────,func writeJSON(w http.ResponseWriter, status int, data any) {,    w.Header().Set(\"Content-Type\", \"application/json\"),    w.WriteHeader(status),    json.NewEncoder(w).Encode(data),},,func writeError(w http.ResponseWriter, status int, message string) {,    writeJSON(w, status, APIError{Error: message}),},,func readJSON(r *http.Request, dst any) error {,    // Limit body size to 1MB,    r.Body = http.MaxBytesReader(nil, r.Body, 1_048_576),,    dec := json.NewDecoder(r.Body),    dec.DisallowUnknownFields()  // reject unknown JSON keys,,    if err := dec.Decode(dst); err != nil {,        return err,    },    // Ensure only one JSON object in body,    if dec.More() {,        return errors.New(\"body must contain a single JSON object\"),    },    return nil,},\n\n// ── Handler using helpers ──────────────────────────,func createUser(w http.ResponseWriter, r *http.Request) {,    var req CreateUserRequest,    if err := readJSON(r, &req); err != nil {,        writeError(w, http.StatusBadRequest, \"Invalid JSON: \"+err.Error()),        return,    },\n\n    // Validate,    if req.Name == \"\" || req.Email == \"\" {,        writeError(w, http.StatusBadRequest, \"name and email are required\"),        return,    },\n\n    // Create user...,    user := User{,        ID: \"usr_123\", Name: req.Name, Email: req.Email,,        CreatedAt: time.Now(),,    },    writeJSON(w, http.StatusCreated, user),}"
                  }
        ],
        tips: [
                  "Use json:\"-\" to exclude sensitive fields (passwords, tokens) from ALL JSON output — safer than remembering to omit them.",
                  "http.MaxBytesReader prevents denial-of-service via huge request bodies — always limit input size.",
                  "dec.DisallowUnknownFields() catches typos in API requests — clients get clear errors for misspelled fields.",
                  "Create writeJSON/writeError helpers — consistent response format across all handlers."
        ],
        mistake: "Using json.Unmarshal(body, &v) for request bodies — it reads the entire body into memory first. json.NewDecoder streams from the reader and supports MaxBytesReader for size limits.",
        shorthand: {
          verbose: "// Manual / verbose approach\nbody, _ := io.ReadAll(r.Body)\njson.Unmarshal(body, &req) // loads all into memory\n// More explicit but longer",
          concise: "json.NewDecoder(r.Body).DisallowUnknownFields().Decode(&req); http.MaxBytesReader(w, r.Body, 1MB)",
        },
      },
      {
        id: "gin-basics",
        fn: "Gin — Go HTTP Framework",
        desc: "Gin router: default(), middleware, path params, JSON, groups.",
        category: "Web Framework",
        subtitle: "gin.Default, router groups, middleware, c.JSON, c.BindJSON",
        signature: "r := gin.Default()  |  r.GET(\"/users/:id\", handler)  |  c.JSON(200, data)",
        descLong: "Gin is a popular, fast HTTP framework. gin.Default() includes logging and recovery middleware. Define routes with HTTP methods (GET, POST, etc.). Path parameters use :name syntax. c.JSON auto-encodes responses. c.BindJSON parses request bodies. Router groups for organization: r.Group(\"/api/v1\").",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Gin — Go HTTP Framework — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"github.com/gin-gonic/gin\"\n)\n\ntype User struct {\n  ID   int    `json:\"id\"`\n  Name string `json:\"name\"`\n}\n\nfunc main() {\n  // ── Create router with defaults ────────────────\n  r := gin.Default() // includes logging and recovery"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Gin — Go HTTP Framework — common patterns you'll see in production.\n// APPROACH  - Combine Gin — Go HTTP Framework with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple routes ──────────────────────────────\n  r.GET(\"/ping\", func(c *gin.Context) {\n    c.JSON(200, gin.H{\"message\": \"pong\"})\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Gin — Go HTTP Framework — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Path parameters ────────────────────────────,  r.GET(\"/users/:id\", func(c *gin.Context) {,    id := c.Param(\"id\"),    c.JSON(200, gin.H{\"id\": id}),  }),\n\n  // ── Query parameters ──────────────────────────,  r.GET(\"/search\", func(c *gin.Context) {,    query := c.Query(\"q\"),    limit := c.DefaultQuery(\"limit\", \"10\"),    c.JSON(200, gin.H{\"query\": query, \"limit\": limit}),  }),\n\n  // ── POST with JSON body ────────────────────────,  r.POST(\"/users\", func(c *gin.Context) {,    var user User,    if err := c.BindJSON(&user); err != nil {,      c.JSON(400, gin.H{\"error\": err.Error()}),      return,    },    user.ID = 1,    c.JSON(201, user),  }),\n\n  // ── Router groups ──────────────────────────────,  api := r.Group(\"/api/v1\"),  {,    api.GET(\"/status\", func(c *gin.Context) {,      c.JSON(200, gin.H{\"status\": \"ok\"}),    }),,    api.POST(\"/data\", func(c *gin.Context) {,      c.JSON(201, gin.H{\"id\": 123}),    }),  },\n\n  // ── Middleware ──────────────────────────────────,  r.Use(func(c *gin.Context) {,    c.Header(\"X-Custom\", \"value\"),    c.Next(),  }),\n\n  // ── Run server ──────────────────────────────────,  r.Run(\":8080\"),}"
                  }
        ],
        tips: [
                  "gin.Default() is a good starting point — includes logging and panic recovery.",
                  "Path params: :id; Query params: c.Query(\"key\").",
                  "c.BindJSON auto-parses and validates JSON — set struct tags for control.",
                  "Router groups organize related routes — r.Group(\"/api/v1\").",
                  "Middleware in order: r.Use(middleware1, middleware2, ...)."
        ],
        mistake: "Not checking BindJSON error — malformed requests silently fail.",
        shorthand: {
          verbose: "r := gin.New()\nr.GET(\"/users/:id\", handler)\nc.JSON(200, data)",
          concise: "gin.Default(); r.GET()/POST()/DELETE(); :params for path; c.JSON(); r.Group(path) for organization",
        },
      },
      {
        id: "chi-basics",
        fn: "Chi — Lightweight Router",
        desc: "Chi router: minimal, composable, middleware chains, URL params.",
        category: "Web Framework",
        subtitle: "chi.NewRouter, middleware, chi.URLParam, router groups",
        signature: "r := chi.NewRouter()  |  r.Route(\"/api\", func(r chi.Router) { ... })  |  chi.URLParam(r, \"id\")",
        descLong: "Chi is a lightweight, composable router. No dependencies. chi.URLParam extracts path params. Router groups with r.Route(). Middleware chaining with r.Use(). Compatible with standard net/http. Popular for RESTful APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Chi — Lightweight Router — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"github.com/go-chi/chi/v5\"\n  \"github.com/go-chi/chi/v5/middleware\"\n  \"net/http\"\n)\n\nfunc main() {\n  // ── Create router ──────────────────────────────\n  r := chi.NewRouter()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Chi — Lightweight Router — common patterns you'll see in production.\n// APPROACH  - Combine Chi — Lightweight Router with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Global middleware ──────────────────────────\n  r.Use(middleware.Logger)\n  r.Use(middleware.Recoverer)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Chi — Lightweight Router — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Simple routes ──────────────────────────────,  r.Get(\"/\", func(w http.ResponseWriter, r *http.Request) {,    w.Write([]byte(\"Hello\")),  }),\n\n  // ── Path parameters ───────────────────────────,  r.Get(\"/users/{id}\", func(w http.ResponseWriter, r *http.Request) {,    id := chi.URLParam(r, \"id\"),    w.Write([]byte(\"User: \" + id)),  }),\n\n  // ── Nested routes (subrouters) ─────────────────,  r.Route(\"/api/v1\", func(r chi.Router) {,    r.Use(middleware.StripSlashes),,    r.Get(\"/status\", func(w http.ResponseWriter, r *http.Request) {,      w.Header().Set(\"Content-Type\", \"application/json\"),      w.Write([]byte(`{\"status\":\"ok\"}`)),    }),,    r.Route(\"/users\", func(r chi.Router) {,      r.Get(\"/\", func(w http.ResponseWriter, r *http.Request) {,        w.Write([]byte(\"List users\")),      }),,      r.Post(\"/\", func(w http.ResponseWriter, r *http.Request) {,        w.WriteHeader(http.StatusCreated),      }),,      r.Get(\"/{id}\", func(w http.ResponseWriter, r *http.Request) {,        id := chi.URLParam(r, \"id\"),        w.Write([]byte(\"User: \" + id)),      }),    }),  }),,  http.ListenAndServe(\":8080\", r),}"
                  }
        ],
        tips: [
                  "chi.URLParam(r, \"id\") to extract path parameters.",
                  "r.Route() for nested route groups.",
                  "chi.Router is http.Handler — compatible with std lib.",
                  "middleware.Logger and middleware.Recoverer are useful built-in middleware.",
                  "No magic — just composable handlers and middleware."
        ],
        mistake: "Forgetting chi.URLParam — easy to mix up with Gin's c.Param().",
        shorthand: {
          verbose: "r.Get(\"/users/{id}\", func(w,r) {\n  id := chi.URLParam(r, \"id\")\n  ...\n})",
          concise: "chi.NewRouter(); r.Route(path); r.Use(middleware); chi.URLParam(r, key) for params",
        },
      },
      {
        id: "fiber-basics",
        fn: "Fiber — Express-Like Framework",
        desc: "Fiber: Express-style API, fast, built-in middleware.",
        category: "Web Framework",
        subtitle: "fiber.New, app.Get/Post, c.BodyParser, middleware",
        signature: "app := fiber.New()  |  app.Get(\"/users/:id\", handler)  |  c.JSON(data)",
        descLong: "Fiber is an Express-inspired framework for Go. Similar API makes transitions from Node easy. Built-in middleware (logger, compression, CORS). Fast performance. c.BodyParser auto-decodes request bodies. Very active community.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fiber — Express-Like Framework — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"github.com/gofiber/fiber/v3\"\n)\n\ntype User struct {\n  ID   int    `json:\"id\"`\n  Name string `json:\"name\"`\n}\n\nfunc main() {\n  // ── Create app ────────────────────────────────\n  app := fiber.New()"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fiber — Express-Like Framework — common patterns you'll see in production.\n// APPROACH  - Combine Fiber — Express-Like Framework with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Middleware ────────────────────────────────\n  app.Use(func(c fiber.Ctx) error {\n    c.Set(\"X-Custom\", \"value\")\n    return c.Next()\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fiber — Express-Like Framework — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Simple routes ─────────────────────────────,  app.Get(\"/\", func(c fiber.Ctx) error {,    return c.SendString(\"Hello, World!\"),  }),\n\n  // ── Path parameters ──────────────────────────,  app.Get(\"/users/:id\", func(c fiber.Ctx) error {,    id := c.Params(\"id\"),    return c.JSON(fiber.Map{\"id\": id}),  }),\n\n  // ── Query parameters ──────────────────────────,  app.Get(\"/search\", func(c fiber.Ctx) error {,    query := c.Query(\"q\"),    limit := c.Query(\"limit\", \"10\"),    return c.JSON(fiber.Map{\"query\": query, \"limit\": limit}),  }),\n\n  // ── POST with body parsing ────────────────────,  app.Post(\"/users\", func(c fiber.Ctx) error {,    user := new(User),    if err := c.BodyParser(user); err != nil {,      return c.Status(400).JSON(fiber.Map{\"error\": err.Error()}),    },    user.ID = 1,    return c.Status(201).JSON(user),  }),\n\n  // ── Router groups ─────────────────────────────,  api := app.Group(\"/api\"),  v1 := api.Group(\"/v1\"),  {,    v1.Get(\"/status\", func(c fiber.Ctx) error {,      return c.JSON(fiber.Map{\"status\": \"ok\"}),    }),  },,  app.Listen(\":8080\"),}"
                  }
        ],
        tips: [
                  "c.Params(\"key\") for path params, c.Query(\"key\") for query params.",
                  "c.BodyParser() auto-parses based on Content-Type.",
                  "app.Group() for route organization.",
                  "Similar to Express — easy for Node developers.",
                  "Very fast — competes with Gin."
        ],
        mistake: "Not returning error from handlers — Fiber middleware expects error return.",
        shorthand: {
          verbose: "app := fiber.New()\napp.Get(\"/users/:id\", func(c fiber.Ctx) error {\n  id := c.Params(\"id\")\n  return c.JSON(id)\n})",
          concise: "fiber.New(); app.Get()/Post(); c.Params(key); c.BodyParser(); c.JSON(); app.Group(path)",
        },
      },
    ],
  },

  // ── Section 2: Middleware & Templates ─────────────────────────────────────────
  {
    id: "middleware",
    title: "Middleware & Templates",
    entries: [
      {
        id: "http-middleware-go",
        fn: "Custom HTTP Middleware",
        desc: "Write middleware: logging, auth, metrics, recovery, compression.",
        category: "Middleware",
        subtitle: "func(http.Handler) http.Handler, wrapping handlers",
        signature: "func logMiddleware(next http.Handler) http.Handler { return http.HandlerFunc(fn) }",
        descLong: "Middleware wraps HTTP handlers. Returns a function that wraps the original handler. Call next.ServeHTTP(w, r) to pass to next handler. Common middleware: logging, authentication, metrics, panic recovery, request ID injection, rate limiting, CORS.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom HTTP Middleware — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom HTTP Middleware — common patterns you'll see in production.\n// APPROACH  - Combine Custom HTTP Middleware with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Logging middleware ─────────────────────────────\nfunc loggingMiddleware(next http.Handler) http.Handler {\n  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n    start := time.Now()\n    next.ServeHTTP(w, r)\n    log.Printf(\"%s %s %v\", r.Method, r.URL.Path, time.Since(start))\n  })\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom HTTP Middleware — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Authentication middleware ──────────────────────,func authMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    token := r.Header.Get(\"Authorization\"),    if token == \"\" {,      http.Error(w, \"Unauthorized\", http.StatusUnauthorized),      return,    },    next.ServeHTTP(w, r),  }),},\n\n// ── Recovery middleware ────────────────────────────,func recoveryMiddleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    defer func() {,      if err := recover(); err != nil {,        log.Printf(\"Panic: %v\", err),        http.Error(w, \"Internal Error\", http.StatusInternalServerError),      },    }(),    next.ServeHTTP(w, r),  }),},\n\n// ── Rate limiting middleware (simple) ──────────────,type rateLimiter struct {,  hits map[string][]time.Time,},,func newRateLimiter() *rateLimiter {,  return &rateLimiter{hits: make(map[string][]time.Time)},},,func (rl *rateLimiter) middleware(next http.Handler) http.Handler {,  return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {,    ip := r.RemoteAddr,    now := time.Now(),\n\n    // Clean old hits,    if hits, ok := rl.hits[ip]; ok {,      rl.hits[ip] = filter(hits, now.Add(-time.Minute)),    },\n\n    // Check limit (max 10 per minute),    if len(rl.hits[ip]) >= 10 {,      http.Error(w, \"Rate limit exceeded\", http.StatusTooManyRequests),      return,    },,    rl.hits[ip] = append(rl.hits[ip], now),    next.ServeHTTP(w, r),  }),},,func filter(times []time.Time, after time.Time) []time.Time {,  var result []time.Time,  for _, t := range times {,    if t.After(after) {,      result = append(result, t),    },  },  return result,},\n\n// ── Chaining middleware ────────────────────────────,func chain(h http.Handler, middleware ...func(http.Handler) http.Handler) http.Handler {,  for i := len(middleware) - 1; i >= 0; i-- {,    h = middleware[i](h),  },  return h,},,func main() {,  mux := http.NewServeMux(),  mux.HandleFunc(\"/\", func(w http.ResponseWriter, r *http.Request) {,    fmt.Fprintf(w, \"Hello\"),  }),\n\n  // Apply middleware stack,  handler := chain(mux, loggingMiddleware, recoveryMiddleware),,  http.ListenAndServe(\":8080\", handler),}"
                  }
        ],
        tips: [
                  "Middleware order matters — outermost runs first.",
                  "Always call next.ServeHTTP(w, r) — unless intentionally short-circuiting.",
                  "Wrap response writer to capture status — see responseWriter pattern.",
                  "Create chainable middleware — compose multiple concerns.",
                  "Use context for request-scoped data — avoid global state."
        ],
        mistake: "Forgetting to call next.ServeHTTP — request stops and handler doesn't run.",
        shorthand: {
          verbose: "func middleware(next http.Handler) http.Handler {\n  return http.HandlerFunc(func(w, r) {\n    // before\n    next.ServeHTTP(w, r)\n    // after\n  })\n}",
          concise: "func(next http.Handler) http.Handler { return HandlerFunc(func(w,r) { ...; next.ServeHTTP(w,r); ... }) }",
        },
      },
      {
        id: "websocket-go",
        fn: "WebSocket with gorilla/websocket",
        desc: "WebSocket: upgrader.Upgrade(), read/write loops, connection lifecycle.",
        category: "Real-Time",
        subtitle: "websocket.Upgrader, conn.ReadMessage, conn.WriteMessage",
        signature: "upgrader := &websocket.Upgrader{}  |  conn, err := upgrader.Upgrade(w, r, nil)  |  conn.ReadMessage()",
        descLong: "gorilla/websocket provides WebSocket support. Create an Upgrader, call Upgrade() on HTTP request. conn.ReadMessage/WriteMessage for communication. Handle read/write loops. Close connection when done. Gorilla handles protocol details.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WebSocket with gorilla/websocket — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n\n  \"github.com/gorilla/websocket\"\n)\n\nvar upgrader = &websocket.Upgrader{\n  CheckOrigin: func(r *http.Request) bool {\n    return true // allow all origins for demo\n  },\n}\n\nfunc handleWebSocket(w http.ResponseWriter, r *http.Request) {\n  // ── Upgrade HTTP to WebSocket ──────────────────\n  conn, err := upgrader.Upgrade(w, r, nil)\n  if err != nil {\n    log.Fatal(err)\n  }\n  defer conn.Close()\n\n  log.Printf(\"Client connected from %s\", conn.RemoteAddr())"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WebSocket with gorilla/websocket — common patterns you'll see in production.\n// APPROACH  - Combine WebSocket with gorilla/websocket with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Read/Write loop ────────────────────────────\n  for {\n    messageType, data, err := conn.ReadMessage()\n    if err != nil {\n      if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {\n        log.Printf(\"error: %v\", err)\n      }\n      return\n    }\n\n    fmt.Printf(\"Received: %s\n\", string(data))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WebSocket with gorilla/websocket — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Echo back,    err = conn.WriteMessage(messageType, data),    if err != nil {,      log.Printf(\"write error: %v\", err),      return,    },  },},,func main() {,  http.HandleFunc(\"/ws\", handleWebSocket),  http.HandleFunc(\"/\", func(w http.ResponseWriter, r *http.Request) {,    w.Header().Set(\"Content-Type\", \"text/html\"),    w.Write([]byte(`,      <html>,      <body>,      <script>,        const ws = new WebSocket(\"ws://localhost:8080/ws\");,        ws.onmessage = (event) => console.log(\"Server:\", event.data);,        ws.onopen = () => ws.send(\"Hello Server\");,      </script>,      </body>,      </html>,    `)),  }),,  log.Println(\"Server starting on :8080\"),  http.ListenAndServe(\":8080\", nil),}"
                  }
        ],
        tips: [
                  "CheckOrigin controls which origins can connect — restrict in production.",
                  "ReadMessage blocks until message arrives — run in goroutine for concurrent clients.",
                  "WriteMessage returns error if connection closed.",
                  "Handle unexpected close (CloseGoingAway) vs protocol errors separately.",
                  "Use channels to broadcast to multiple clients."
        ],
        mistake: "Not handling read errors — connection closes silently.",
        shorthand: {
          verbose: "conn, _ := upgrader.Upgrade(w, r, nil)\nfor {\n  _, data, _ := conn.ReadMessage()\n  conn.WriteMessage(messageType, data)\n}",
          concise: "upgrader.Upgrade(w, r, nil); conn.ReadMessage(); conn.WriteMessage(); handle close errors",
        },
      },
      {
        id: "grpc-go",
        fn: "gRPC — High-Performance RPC",
        desc: "gRPC basics: protobuf, grpc.NewServer, service implementation, client.",
        category: "RPC",
        subtitle: "Protocol Buffers, gRPC server, client stubs, streaming",
        signature: "grpc.NewServer()  |  server.RegisterUserServiceServer(s, &impl)  |  client.GetUser(ctx, &req)",
        descLong: "gRPC is a modern RPC framework using Protocol Buffers. Define services in .proto files. Generate Go code with protoc. Implement service interface. Create server with grpc.NewServer(). Clients use generated stubs. Supports streaming (client, server, bidirectional). Binary format is compact and fast.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of gRPC — High-Performance RPC — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Example using generated gRPC code\n// (Assumes user_service.proto compiled with protoc)\n\npackage main\n\nimport (\n  \"context\"\n  \"log\"\n  \"net\"\n\n  pb \"example.com/user_service\" // generated protobuf code\n  \"google.golang.org/grpc\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of gRPC — High-Performance RPC — common patterns you'll see in production.\n// APPROACH  - Combine gRPC — High-Performance RPC with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Implement service interface ────────────────────\ntype UserServiceServer struct {\n  pb.UnimplementedUserServiceServer\n}\n\nfunc (s *UserServiceServer) GetUser(ctx context.Context, req *pb.GetUserRequest) (*pb.User, error) {\n  user := &pb.User{\n    Id:   req.GetId(),\n    Name: \"Alice\",\n    Email: \"alice@example.com\",\n  }\n  return user, nil\n}\n\nfunc (s *UserServiceServer) CreateUser(ctx context.Context, req *pb.CreateUserRequest) (*pb.User, error) {\n  user := &pb.User{\n    Id:    \"123\",\n    Name:  req.GetName(),\n    Email: req.GetEmail(),\n  }\n  return user, nil\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of gRPC — High-Performance RPC — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Server ────────────────────────────────────────,func startServer() {,  lis, _ := net.Listen(\"tcp\", \":50051\"),  s := grpc.NewServer(),  pb.RegisterUserServiceServer(s, &UserServiceServer{}),,  log.Println(\"gRPC server starting on :50051\"),  s.Serve(lis),},\n\n// ── Client ────────────────────────────────────────,func callServer() {,  conn, _ := grpc.Dial(\"localhost:50051\", grpc.WithInsecure()),  defer conn.Close(),,  client := pb.NewUserServiceClient(conn),\n\n  // Call GetUser,  resp, _ := client.GetUser(context.Background(), &pb.GetUserRequest{Id: \"1\"}),  log.Printf(\"Got user: %s\", resp.Name),\n\n  // Call CreateUser,  user, _ := client.CreateUser(context.Background(), &pb.CreateUserRequest{,    Name:  \"Bob\",,    Email: \"bob@example.com\",,  }),  log.Printf(\"Created user: %s\", user.Id),},\n\n// ── Streaming example ──────────────────────────────,func (s *UserServiceServer) ListUsers(req *pb.Empty, stream pb.UserService_ListUsersServer) error {,  users := []*pb.User{,    {Id: \"1\", Name: \"Alice\", Email: \"alice@example.com\"},,    {Id: \"2\", Name: \"Bob\", Email: \"bob@example.com\"},,  },,  for _, user := range users {,    if err := stream.Send(user); err != nil {,      return err,    },  },  return nil,},,func main() {,  startServer(),}"
                  }
        ],
        tips: [
                  "Define services in .proto files — use protoc to generate Go code.",
                  "Implement service interface — embed UnimplementedServiceServer to handle future additions.",
                  "Streaming reduces overhead — bidirectional communication, multiplexing.",
                  "Use context for timeouts and cancellation — like HTTP.",
                  "Binary format: smaller, faster than JSON/REST."
        ],
        mistake: "Not using context.WithTimeout — requests can hang indefinitely.",
        shorthand: {
          verbose: "// Define in .proto\nservice UserService {\n  rpc GetUser(GetUserRequest) returns (User);\n}",
          concise: "grpc.NewServer(); RegisterServiceServer(); client := NewServiceClient(conn); client.Method(ctx, req)",
        },
      },
      {
        id: "graphql-go",
        fn: "GraphQL with gqlgen",
        desc: "GraphQL schema-first development: schema, resolvers, DataLoader.",
        category: "API",
        subtitle: "gqlgen, schema, resolver functions, middleware",
        signature: "schema.graphql defines types/queries  |  Resolver implements Query interface  |  gqlgen generate",
        descLong: "gqlgen generates type-safe GraphQL servers from schema. Define schema in .graphql files. gqlgen generates Go types and resolver interfaces. Implement resolver functions. Supports middleware, directives, and DataLoader for N+1 prevention. Popular for API development.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of GraphQL with gqlgen — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// schema.graphql\n# schema file\ntype User {\n  id: ID!\n  name: String!\n  email: String!\n}\n\ntype Query {\n  user(id: ID!): User\n  users: [User!]!\n}\n\ntype Mutation {\n  createUser(name: String!, email: String!): User!\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of GraphQL with gqlgen — common patterns you'll see in production.\n// APPROACH  - Combine GraphQL with gqlgen with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Generated Go code (in generated.go and resolver.go)\npackage main\n\nimport (\n  \"context\"\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of GraphQL with gqlgen — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Resolver implements GraphQL resolvers,type Resolver struct{},,func (r *Resolver) Query() QueryResolver {,  return &queryResolver{r},},,type queryResolver struct{ *Resolver },,func (r *queryResolver) User(ctx context.Context, id string) (*User, error) {,  return &User{,    ID:    id,,    Name:  \"Alice\",,    Email: \"alice@example.com\",,  }, nil,},,func (r *queryResolver) Users(ctx context.Context) ([]*User, error) {,  return []*User{,    {ID: \"1\", Name: \"Alice\", Email: \"alice@example.com\"},,    {ID: \"2\", Name: \"Bob\", Email: \"bob@example.com\"},,  }, nil,},,func (r *Resolver) Mutation() MutationResolver {,  return &mutationResolver{r},},,type mutationResolver struct{ *Resolver },,func (r *mutationResolver) CreateUser(ctx context.Context, name string, email string) (*User, error) {,  return &User{,    ID:    \"3\",,    Name:  name,,    Email: email,,  }, nil,},\n\n// ── Server setup ───────────────────────────────────,func main() {,  import (,    \"github.com/99designs/gqlgen/graphql/handler\",    \"github.com/99designs/gqlgen/graphql/playground\",    \"net/http\",  ),,  schema := NewExecutableSchema(Config{Resolvers: &Resolver{}}),,  mux := http.NewServeMux(),  mux.Handle(\"/\", playground.Handler(\"GraphQL\", \"/query\")),  mux.Handle(\"/query\", handler.NewDefaultServer(schema)),,  http.ListenAndServe(\":8080\", mux),}"
                  }
        ],
        tips: [
                  "Schema-first: define in .graphql, gqlgen generates Go types.",
                  "Type-safe: wrong queries caught at compile time (before reaching server).",
                  "Resolver functions: implement business logic per field.",
                  "DataLoader for N+1 prevention — batch database queries.",
                  "Playground for interactive testing — built-in UI."
        ],
        mistake: "Not implementing all resolver methods — compile fails.",
        shorthand: {
          verbose: "# schema.graphql\ntype Query { user(id: ID!): User }\ntype User { id: ID!, name: String! }",
          concise: "schema.graphql defines types; gqlgen generate; implement Resolver interface; type-safe queries",
        },
      },
      {
        id: "openapi-go",
        fn: "OpenAPI with huma or ogen",
        desc: "OpenAPI type-safe APIs: generated docs, client, server from schema.",
        category: "API",
        subtitle: "huma.Operation, ogen, OpenAPI spec generation",
        signature: "huma.Register(api, operation)  |  type Endpoint struct { ... } `path:\"/path\"`",
        descLong: "Huma builds type-safe REST APIs with auto-generated OpenAPI docs. Define request/response types, register operations. Docs auto-generated from code. Ogen generates type-safe Go servers from OpenAPI specs. Both reduce boilerplate and ensure consistency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OpenAPI with huma or ogen — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"github.com/danielgtaylor/huma/v2\"\n  \"github.com/danielgtaylor/huma/v2/humacli\"\n)\n\ntype User struct {\n  ID   int    `json:\"id\"`\n  Name string `json:\"name\"`\n}\n\ntype GetUserRequest struct {\n  ID int `path:\"id\"`\n}\n\ntype GetUserResponse struct {\n  Body User\n}\n\ntype CreateUserRequest struct {\n  Name string `json:\"name\"`\n}\n\ntype CreateUserResponse struct {\n  Body User\n}\n\nfunc main() {\n  cli := humacli.New()\n\n  api := huma.NewAPI(huma.DefaultConfig(\"My API\", \"1.0.0\"))"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OpenAPI with huma or ogen — common patterns you'll see in production.\n// APPROACH  - Combine OpenAPI with huma or ogen with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── GET endpoint ───────────────────────────────\n  huma.Register(api, huma.Operation{\n    OperationID: \"getUser\",\n    Method:      \"GET\",\n    Path:        \"/users/{id}\",\n    Summary:     \"Get a user by ID\",\n    Handler: func(ctx context.Context, input *GetUserRequest) (*GetUserResponse, error) {\n      return &GetUserResponse{\n        Body: User{ID: input.ID, Name: \"Alice\"},\n      }, nil\n    },\n  })"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OpenAPI with huma or ogen — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── POST endpoint ──────────────────────────────,  huma.Register(api, huma.Operation{,    OperationID: \"createUser\",,    Method:      \"POST\",,    Path:        \"/users\",,    Summary:     \"Create a new user\",,    Handler: func(ctx context.Context, input *CreateUserRequest) (*CreateUserResponse, error) {,      return &CreateUserResponse{,        Body: User{ID: 1, Name: input.Name},,      }, nil,    },,  }),,  cli.Run(),},,# Generated OpenAPI spec available at /openapi.json,# Docs available at /docs"
                  }
        ],
        tips: [
                  "Type-safe handlers: request/response types defined as structs.",
                  "OpenAPI spec auto-generated: /openapi.json.",
                  "Docs endpoint: /docs with Swagger UI.",
                  "Validation built-in: struct tags control parsing and validation.",
                  "No explicit serialization: huma handles JSON/XML/YAML."
        ],
        mistake: "Not documenting request/response types — docs are auto-generated from code.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntype GetRequest struct { ID int `path:\"id\"` }\nhuma.Register(api, huma.Operation{...})\n// More explicit but longer",
          concise: "Define request/response types; huma.Register() handler; OpenAPI spec auto-generated; type-safe end-to-end",
        },
      },
      {
        id: "swagger-go",
        fn: "Swagger Documentation with swaggo",
        desc: "Swagger docs: swaggo annotations, auto-generated OpenAPI spec and Swagger UI.",
        category: "API Documentation",
        subtitle: "swag init, Swagger comments, @Router, @Param annotations",
        signature: "// @Router /users/{id} [get]  |  // @Param id path int true \"User ID\"",
        descLong: "swaggo generates Swagger/OpenAPI docs from code comments. Add annotations to handler functions. swag init generates spec file. Swagger UI serves interactive docs. Less type-safe than huma but simpler for existing projects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Swagger Documentation with swaggo — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"github.com/swaggo/files\"       // swagger embed files\n  \"github.com/swaggo/gin-swagger\" // gin middleware\n  \"github.com/gin-gonic/gin\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Swagger Documentation with swaggo — common patterns you'll see in production.\n// APPROACH  - Combine Swagger Documentation with swaggo with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// User struct for Swagger docs\ntype User struct {\n  ID   int    `json:\"id\" example:\"1\"`\n  Name string `json:\"name\" example:\"Alice\"`\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Swagger Documentation with swaggo — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// @Summary Get user by ID,// @Description Returns a user by their ID,// @Tags users,// @Param id path int true \"User ID\",// @Produce json,// @Success 200 {object} User,// @Router /users/{id} [get],func GetUser(c *gin.Context) {,  id := c.Param(\"id\"),  c.JSON(200, gin.H{\"id\": id, \"name\": \"Alice\"}),},\n\n// @Summary Create user,// @Description Creates a new user,// @Tags users,// @Accept json,// @Param user body User true \"User data\",// @Produce json,// @Success 201 {object} User,// @Router /users [post],func CreateUser(c *gin.Context) {,  var user User,  c.BindJSON(&user),  c.JSON(201, user),},,func main() {,  r := gin.Default(),\n\n  // ── Register routes ────────────────────────────,  r.GET(\"/users/:id\", GetUser),  r.POST(\"/users\", CreateUser),\n\n  // ── Swagger UI at /swagger/* ───────────────────,  r.GET(\"/swagger/*any\", ginSwagger.WrapHandler(swaggerFiles.Handler)),,  r.Run(\":8080\"),},\n\n// swag init  # generates docs/swagger.{json,yaml}"
                  }
        ],
        tips: [
                  "Comment format must be precise — check swaggo docs.",
                  "@Router, @Param, @Success, @Failure define the spec.",
                  "@example tag shows sample values.",
                  "swag init generates docs/ directory with spec and swagger-ui.",
                  "Embedded swagger-ui — no external CDN needed."
        ],
        mistake: "Incorrect comment syntax — swag init silently skips malformed annotations.",
        shorthand: {
          verbose: "// @Router /users/{id} [get]\n// @Param id path int true \"User ID\"\n// @Success 200 {object} User",
          concise: "@Summary, @Description, @Tags, @Param, @Success, @Router; swag init; /swagger/* for Swagger UI",
        },
      },
    ],
  },
]

export default { meta, sections }
