export const meta = {
  "id": "structs",
  "label": "Structs & Interfaces",
  "icon": "🏗️",
  "description": "Structs, methods, interfaces, embedding, and Go's implicit interface satisfaction."
}

export const sections = [

  // ── Section 1: Structs & Interfaces ─────────────────────────────────────────
  {
    id: "structs-interfaces",
    title: "Structs & Interfaces",
    entries: [
      {
        id: "struct-basics",
        fn: "struct",
        desc: "Go's primary composite data type — a collection of named fields.",
        category: "Structs",
        subtitle: "Named field composite types",
        signature: "type Name struct { Field Type }",
        descLong: "Structs group related data into a single type. Fields are accessed with dot notation. Structs are value types — assignment copies the value. Use pointers (*T) to share or mutate structs across function calls. Struct literals can use field names (recommended) or positional values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of struct — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntype User struct {\n  ID        string\n  Name      string\n  Email     string\n  CreatedAt time.Time\n  Active    bool\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of struct — common patterns you'll see in production.\n// APPROACH  - Combine struct with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Struct literal — named fields (preferred)\nu := User{\n  ID:    \"1\",\n  Name:  \"Alice\",\n  Email: \"alice@example.com\",\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of struct — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Zero value struct,var empty User  // all fields at zero values,\n\n// Pointer to struct (heap allocated),up := &User{Name: \"Bob\"},up.Name = \"Charlie\"  // automatic dereference,\n\n// Anonymous struct — one-off data shapes,point := struct{ X, Y int }{X: 10, Y: 20}"
                  }
        ],
        tips: [
                  "Use named fields in struct literals — positional literals break when fields are reordered.",
                  "&User{} is the idiomatic way to allocate a struct on the heap.",
                  "Struct fields are zero-initialized — no need to set 0, \"\", or false explicitly.",
                  "Exported fields start with uppercase; unexported start with lowercase."
        ],
        mistake: "Passing large structs by value to functions — Go copies the whole struct. Use pointer receivers or pass *T for large structs or when mutation is needed.",
        shorthand: {
          verbose: "type User struct {\n  ID   string\n  Name string\n}\nvar u User\nu.ID = \"1\"\nu.Name = \"Alice\"",
          concise: "u := User{ID: \"1\", Name: \"Alice\"}",
        },
      },
      {
        id: "struct-tags",
        fn: "Struct Tags",
        desc: "Metadata attached to struct fields — used by encoding/json, database ORMs, and validators.",
        category: "Structs",
        subtitle: "Field metadata for serialization",
        signature: "Field Type `json:\"name,omitempty\"`",
        descLong: "Struct tags are raw string literals attached to fields, accessible via reflect. The encoding/json package uses json tags to control serialization: rename fields, omit zero values (omitempty), or skip a field (-). Database packages use db or gorm tags. Tags must be backtick strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Struct Tags — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntype User struct {\n  ID        string    `json:\"id\"`\n  Name      string    `json:\"name\"`\n  Email     string    `json:\"email,omitempty\"`  // omit if empty\n  Password  string    `json:\"-\"`                // never marshal\n  CreatedAt time.Time `json:\"created_at\"`\n  UpdatedAt time.Time `json:\"updated_at,omitempty\"`\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Struct Tags — common patterns you'll see in production.\n// APPROACH  - Combine Struct Tags with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple tags on one field\ntype DBUser struct {\n  ID   int    `json:\"id\" db:\"id\" validate:\"required\"`\n  Name string `json:\"name\" db:\"name\" validate:\"min=1,max=100\"`\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Struct Tags — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Encoding,u := User{ID: \"1\", Name: \"Alice\"},data, _ := json.Marshal(u),// {\"id\":\"1\",\"name\":\"Alice\"},\n\n// Decoding,var decoded User,json.Unmarshal(data, &decoded)"
                  }
        ],
        tips: [
                  "omitempty skips the field when it's the zero value (0, \"\", false, nil).",
                  "json:\"-\" permanently excludes a field from marshaling/unmarshaling.",
                  "Use json:\"name\" (lowercase) to match typical JSON API conventions.",
                  "Tags are reflected at runtime — use reflect.StructTag.Lookup() to read them programmatically."
        ],
        mistake: "Forgetting json tags on exported fields — they'll marshal with their Go name (capitalized). Always tag fields explicitly when the JSON key matters.",
        shorthand: {
          verbose: "type User struct {\n    ID    int\n    Name  string\n    Email string\n}\n// manual JSON marshaling needed",
          concise: "type User struct {\n    ID    int    `json:\"id\" db:\"id\"`\n    Name  string `json:\"name\" db:\"name\"`\n    Email string `json:\"email,omitempty\"`\n}",
        },
      },
      {
        id: "methods",
        fn: "Methods",
        desc: "Functions with a receiver — defined on a type. Use pointer receivers to mutate or for large types.",
        category: "Methods",
        subtitle: "Type-associated functions",
        signature: "func (r ReceiverType) MethodName() ReturnType",
        descLong: "Methods are functions with a receiver argument. Value receivers get a copy; pointer receivers get the actual value and can mutate it. Be consistent — if any method on a type needs a pointer receiver, use pointer receivers for all methods on that type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Methods — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntype Rectangle struct {\n  Width, Height float64\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Methods — common patterns you'll see in production.\n// APPROACH  - Combine Methods with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Value receiver — read only, works on copy\nfunc (r Rectangle) Area() float64 {\n  return r.Width * r.Height\n}\n\nfunc (r Rectangle) Perimeter() float64 {\n  return 2 * (r.Width + r.Height)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Methods — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Pointer receiver — can mutate,func (r *Rectangle) Scale(factor float64) {,  r.Width *= factor,  r.Height *= factor,},,rect := Rectangle{Width: 10, Height: 5},rect.Area()      // 50,rect.Scale(2)    // modifies rect,rect.Area()      // 100,\n\n// Methods on non-struct types,type Celsius float64,,func (c Celsius) ToFahrenheit() float64 {,  return float64(c)*9/5 + 32,}"
                  }
        ],
        tips: [
                  "Use pointer receivers when you need to mutate or when the struct is large.",
                  "Be consistent — mixing pointer and value receivers on a type causes confusion and interface issues.",
                  "Go auto-dereferences: rect.Scale() works even if rect is not a pointer.",
                  "Methods can be defined on any named type in the same package — not just structs."
        ],
        mistake: "Using value receivers for all methods and wondering why mutations don't stick — value receivers work on a copy. Use pointer receivers for any mutating method.",
        shorthand: {
          verbose: "r := Rectangle{Width: 10, Height: 5}\nw := r.Width\nh := r.Height\nr.Width = w * 2\nr.Height = h * 2",
          concise: "r := Rectangle{Width: 10, Height: 5}\nr.Scale(2)  // pointer receiver mutates",
        },
      },
      {
        id: "interface-implicit",
        fn: "Interfaces",
        desc: "Go interfaces are satisfied implicitly — any type with the required methods satisfies the interface automatically.",
        category: "Interfaces",
        subtitle: "Implicit structural interface satisfaction",
        signature: "type Stringer interface { String() string }",
        descLong: "Go uses structural (implicit) interface satisfaction — there's no implements keyword. If a type has all the methods of an interface, it satisfies it. This decouples interface definitions from implementations. The empty interface (interface{} or any) is satisfied by every type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"fmt\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Define an interface\ntype Animal interface {\n  Sound() string\n  Name() string\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Implement by providing the methods — no declaration needed,type Dog struct{ name string },func (d Dog) Sound() string { return \"Woof\" },func (d Dog) Name() string  { return d.name },,type Cat struct{ name string },func (c Cat) Sound() string { return \"Meow\" },func (c Cat) Name() string  { return c.name },\n\n// Use via interface — polymorphism,func Describe(a Animal) string {,  return fmt.Sprintf(\"%s says %s\", a.Name(), a.Sound()),},,Describe(Dog{name: \"Rex\"})  // \"Rex says Woof\",Describe(Cat{name: \"Luna\"}) // \"Luna says Meow\",\n\n// Compile-time interface check,var _ Animal = Dog{} // errors if Dog doesn't satisfy Animal"
                  }
        ],
        tips: [
                  "Small interfaces are idiomatic Go — prefer 1-2 methods (io.Reader, io.Writer, fmt.Stringer).",
                  "Use var _ Interface = (*Type)(nil) as a compile-time interface satisfaction check.",
                  "any is an alias for interface{} (Go 1.18+) — prefer any in new code.",
                  "Accept interfaces, return concrete types — the hallmark of good Go API design."
        ],
        mistake: "Defining large interfaces instead of small focused ones — in Go, it's better to have many small interfaces and compose them than one large interface.",
        shorthand: {
          verbose: "type Animal interface {\n  Sound() string\n  Name() string\n  Breathe() error\n  Move() error\n}",
          concise: "type Animal interface {\n  Sound() string\n  Name() string\n}",
        },
      },
      {
        id: "embedding",
        fn: "Embedding",
        desc: "Embed types inside structs or interfaces to inherit their fields and methods without subclassing.",
        category: "Interfaces",
        subtitle: "Composition via embedding",
        signature: "type Child struct { Parent }  // embeds Parent's fields and methods",
        descLong: "Embedding promotes the embedded type's fields and methods to the outer type. It's Go's composition-over-inheritance mechanism. You can embed multiple types. Methods from the embedded type are promoted but can be overridden. Works for both structs and interfaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Embedding — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"fmt\"\n\ntype Animal struct {\n  Name string\n}\nfunc (a Animal) Breathe() { fmt.Println(\"breathing\") }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Embedding — common patterns you'll see in production.\n// APPROACH  - Combine Embedding with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Dog embeds Animal — gets Name field and Breathe method\ntype Dog struct {\n  Animal            // embedded — no field name\n  Breed string\n}\nfunc (d Dog) Bark() { fmt.Println(\"Woof!\") }\n\nd := Dog{Animal: Animal{Name: \"Rex\"}, Breed: \"Husky\"}\nd.Breathe()         // promoted from Animal\nd.Name              // promoted field\nd.Animal.Name       // explicit access still works"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Embedding — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Interface embedding — compose interfaces,type Reader interface { Read(p []byte) (n int, err error) },type Writer interface { Write(p []byte) (n int, err error) },,type ReadWriter interface {,  Reader  // embeds Reader,  Writer  // embeds Writer,}"
                  }
        ],
        tips: [
                  "Embedded type methods can be overridden — just define a method with the same name.",
                  "Access the embedded type explicitly (d.Animal.Name) if there's a naming conflict.",
                  "Interface embedding is how io.ReadWriter, io.ReadWriteCloser etc. are defined in stdlib.",
                  "Embedding is not inheritance — there's no polymorphic dispatch on the embedded type."
        ],
        mistake: "Treating embedding as inheritance — the outer struct is not a subtype of the embedded type. You can't pass a Dog where Animal is expected just because Dog embeds Animal.",
        shorthand: {
          verbose: "type Dog struct {\n  Animal\n  Breed string\n}\nd := Dog{Animal: Animal{Name: \"Rex\"}, Breed: \"Husky\"}\nd.Breathe()         // promoted method\nd.Name              // promoted field",
          concise: "type Dog struct { Animal; Breed string }\n// automatic field/method promotion",
        },
      },
      {
        id: "constructor-new",
        fn: "Constructor Functions (NewXxx)",
        desc: "Go's convention for creating initialized structs — a NewXxx function that validates and returns *T.",
        category: "Constructor Patterns",
        subtitle: "Validated struct initialization",
        signature: "func NewUser(name, email string) (*User, error)",
        descLong: "Go has no constructors. The convention is a NewXxx function that validates inputs, sets defaults, and returns a pointer (or error). This ensures the struct is never in an invalid state. Package-private unexported fields can only be set via the constructor, enforcing invariants.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Constructor Functions (NewXxx) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"fmt\"\n\ntype Server struct {\n  host    string        // unexported — only settable via New\n  port    int\n  timeout time.Duration\n  logger  *slog.Logger\n}\n\nfunc NewServer(host string, port int) (*Server, error) {\n  if host == \"\" {\n    return nil, fmt.Errorf(\"host is required\")\n  }\n  if port < 1 || port > 65535 {\n    return nil, fmt.Errorf(\"invalid port: %d\", port)\n  }\n  return &Server{\n    host:    host,\n    port:    port,\n    timeout: 30 * time.Second, // sensible default\n    logger:  slog.Default(),\n  }, nil\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Constructor Functions (NewXxx) — common patterns you'll see in production.\n// APPROACH  - Combine Constructor Functions (NewXxx) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Constructor Functions (NewXxx) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlogger:  slog.Default(),\n  }, nil\n}\n\ns, err := NewServer(\"localhost\", 8080)\nif err != nil {\n  log.Fatal(err)\n}"
                  }
        ],
        tips: [
                  "Return (*T, error) when validation can fail; *T alone when defaults are always valid.",
                  "Unexported fields guarantee invariants — only the constructor can set them.",
                  "NewXxx is the idiomatic constructor name — matches stdlib: net.NewListener, bytes.NewBuffer.",
                  "For complex configuration, combine with the functional options pattern."
        ],
        mistake: "Exposing all struct fields and letting callers initialize inline — invalid states become possible. Use a constructor to enforce required fields and set defaults.",
        shorthand: {
          verbose: "s := &Server{}\ns.host = \"localhost\"\ns.port = 8080\ns.timeout = 30 * time.Second",
          concise: "s, err := NewServer(\"localhost\", 8080)",
        },
      },
      {
        id: "functional-options",
        fn: "Functional Options Pattern",
        desc: "Variadic options functions for optional configuration — extensible and backwards-compatible.",
        category: "Constructor Patterns",
        subtitle: "Ergonomic optional configuration",
        signature: "func New(opts ...Option) *T  |  type Option func(*T)",
        descLong: "The functional options pattern (popularized by Rob Pike and Dave Cheney) uses variadic function arguments to configure a struct. Each option is a function that modifies the struct. This allows optional parameters, is backwards compatible when adding new options, and is self-documenting at the call site.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Functional Options Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntype Server struct {\n  host    string\n  port    int\n  timeout time.Duration\n  tls     bool\n}\n\ntype Option func(*Server)\n\nfunc WithTimeout(d time.Duration) Option {\n  return func(s *Server) { s.timeout = d }\n}\n\nfunc WithTLS() Option {\n  return func(s *Server) { s.tls = true }\n}\n\nfunc WithPort(port int) Option {\n  return func(s *Server) { s.port = port }\n}\n\nfunc NewServer(host string, opts ...Option) *Server {\n  s := &Server{\n    host:    host,\n    port:    8080,              // default\n    timeout: 30 * time.Second, // default\n  }\n  for _, opt := range opts {\n    opt(s) // apply each option\n  }\n  return s\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Functional Options Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Functional Options Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Clean, self-documenting call site\ns := NewServer(\"localhost\",\n  WithPort(9090),"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Functional Options Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nWithTimeout(10*time.Second),\n  WithTLS(),\n)"
                  }
        ],
        tips: [
                  "New options can be added without breaking existing callers — backwards compatible.",
                  "Options are self-documenting — WithTLS() is clearer than a boolean parameter.",
                  "The options slice can be nil — the function handles it gracefully.",
                  "Return the Option type (not *Server) from option functions for cleaner type signatures."
        ],
        mistake: "Using a Config struct instead of functional options — a config struct requires callers to specify zero values for unneeded fields, and adding fields is technically a breaking change for struct literals.",
        shorthand: {
          verbose: "func New(host string, port int, timeout time.Duration, tls bool, retries int) *Server {\n  return &Server{host, port, timeout, tls, retries}\n}",
          concise: "func New(host string, opts ...Option) *Server {\n  s := &Server{host: host, port: 8080}\n  for _, opt := range opts { opt(s) }\n  return s\n}",
        },
      },
      {
        id: "generic-functions-go",
        fn: "Generic Functions",
        desc: "Type-parameterized functions that work with any type satisfying a constraint.",
        category: "Generics (Go 1.18+)",
        subtitle: "Type-safe reusable functions",
        signature: "func Map[T, U any](s []T, f func(T) U) []U",
        descLong: "Go 1.18 added generics. Type parameters are declared in square brackets before the parameter list. Constraints restrict which types are allowed — any means any type, comparable means ==/<, and custom interfaces define exact requirements. Type inference usually means you don't need to specify types at the call site.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Map — apply a function to every element\nfunc Map[T, U any](slice []T, fn func(T) U) []U {\n  result := make([]U, len(slice))\n  for i, v := range slice {\n    result[i] = fn(v)\n  }\n  return result\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Functions — common patterns you'll see in production.\n// APPROACH  - Combine Generic Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Filter\nfunc Filter[T any](slice []T, pred func(T) bool) []T {\n  var result []T\n  for _, v := range slice {\n    if pred(v) { result = append(result, v) }\n  }\n  return result\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Type inference — T inferred from argument,names := Map(users, func(u User) string { return u.Name }),\n\n// Constraint: comparable (supports == and !=),func Contains[T comparable](slice []T, item T) bool {,  for _, v := range slice {,    if v == item { return true },  },  return false,},\n\n// Constraint: ordered types,type Ordered interface { ~int | ~float64 | ~string },func Min[T Ordered](a, b T) T {,  if a < b { return a },  return b,}"
                  }
        ],
        tips: [
                  "Use any for unconstrained type params, comparable for == support, Ordered for < > support.",
                  "The ~ prefix in constraints means \"underlying type\" — ~int includes named types based on int.",
                  "Type inference works in most cases — explicit type args (Map[User, string](...)) are rarely needed.",
                  "slices and maps packages (Go 1.21) provide generic Contains, Sort, Keys, Values."
        ],
        mistake: "Reaching for generics when an interface would be simpler — generics shine for collections and algorithms; interfaces shine for behavioral abstraction.",
        shorthand: {
          verbose: "func MapManual[T, U any](slice []T, fn func(T) U) []U {\n  result := make([]U, len(slice))\n  for i, v := range slice {\n    result[i] = fn(v)\n  }\n  return result\n}",
          concise: "func Map[T, U any](s []T, f func(T) U) []U {\n  result := make([]U, len(s))\n  for i, v := range s { result[i] = f(v) }\n  return result\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
