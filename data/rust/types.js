export const meta = {
  "id": "rust-types",
  "label": "Structs, Traits & Generics",
  "icon": "🦀",
  "description": "Rust type system: structs, traits, generics, and advanced type patterns."
}

export const sections = [

  // ── Section 1: Structs ─────────────────────────────────────────
  {
    id: "structs",
    title: "Structs",
    entries: [
      {
        id: "struct-definition",
        fn: "Struct Definition",
        desc: "Named product type grouping related data.",
        category: "Structs",
        subtitle: "struct keyword",
        signature: "struct Name { field: Type }",
        descLong: "Structs are user-defined types that group related fields together. They can be defined as named-field, tuple, or unit structs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Struct Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: u32,\n    email: String,\n}\n\nstruct Color(u8, u8, u8);\n\nstruct Unit;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Struct Definition — common patterns you'll see in production.\n// APPROACH  - Combine Struct Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let person = Person {\n        name: \"Alice\".to_string(),\n        age: 30,\n        email: \"alice@example.com\".to_string(),\n    };\n\n    println!(\"Name: {}\", person.name);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Struct Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet red = Color(255, 0, 0);\n    println!(\"Red: {:?}\", red);\n\n    let unit = Unit;\n}"
                  }
        ],
        tips: [
                  "Named-field structs are most common",
                  "Tuple structs are anonymous field records",
                  "Unit structs mark types with no data",
                  "Derive Debug to print structs easily"
        ],
        mistake: "Forgetting to initialize all fields when creating a struct instance.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "impl-blocks",
        fn: "impl Blocks & Methods",
        desc: "Define methods and associated functions.",
        category: "Structs",
        subtitle: "Methods on types",
        signature: "impl StructName { fn method(&self) { } }",
        descLong: "impl blocks define methods (functions taking self) and associated functions (functions not taking self). Use `self`, `&self`, or `&mut self`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of impl Blocks & Methods — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nstruct Rectangle {\n    width: u32,\n    height: u32,\n}\n\nimpl Rectangle {\n    fn new(width: u32, height: u32) -> Self {\n        Rectangle { width, height }\n    }\n\n    fn area(&self) -> u32 {\n        self.width * self.height\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of impl Blocks & Methods — common patterns you'll see in production.\n// APPROACH  - Combine impl Blocks & Methods with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn scale(&mut self, factor: u32) {\n        self.width *= factor;\n        self.height *= factor;\n    }\n\n    fn can_hold(&self, other: &Rectangle) -> bool {\n        self.width >= other.width && self.height >= other.height\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of impl Blocks & Methods — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    let mut rect = Rectangle::new(30, 50);\n    println!(\"Area: {}\", rect.area());\n    rect.scale(2);\n    println!(\"New area: {}\", rect.area());\n}"
                  }
        ],
        tips: [
                  "Use `&self` for immutable methods",
                  "Use `&mut self` for mutating methods",
                  "Use `Self` to refer to the struct type",
                  "Associated functions use `::` notation"
        ],
        mistake: "Forgetting `&self` or `&mut self` parameter; methods need self to work on instances.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "tuple-structs",
        fn: "Tuple Structs",
        desc: "Named tuple without field labels.",
        category: "Structs",
        subtitle: "Positional fields",
        signature: "struct Name(Type1, Type2);",
        descLong: "Tuple structs provide named types with positional fields. Useful for newtype pattern (wrapping single values) or simple data containers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tuple Structs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nstruct Color(u8, u8, u8);\n\nstruct Point(f64, f64);\n\n#[derive(Debug)]\nstruct User(u32, String);\n\nfn main() {\n    let red = Color(255, 0, 0);\n    println!(\"R: {}, G: {}, B: {}\", red.0, red.1, red.2);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tuple Structs — common patterns you'll see in production.\n// APPROACH  - Combine Tuple Structs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet origin = Point(0.0, 0.0);\n    println!(\"Origin: ({}, {})\", origin.0, origin.1);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tuple Structs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet user = User(1, \"Alice\".to_string());\n    println!(\"ID: {}, Name: {}\", user.0, user.1);\n\n    let Color(r, g, b) = red;\n    println!(\"Destructured: R={}\", r);\n}"
                  }
        ],
        tips: [
                  "Access fields by position: `.0`, `.1`",
                  "Destructure with pattern matching",
                  "Newtype pattern: `struct UserId(u32);`",
                  "Provide type safety with minimal overhead"
        ],
        mistake: "Confusing tuple struct fields with named struct fields.",
        shorthand: {
          verbose: "struct Color(u8, u8, u8);\n\nstruct Point(f64, f64);\n\n#[derive(Debug)]\nstruct User(u32, String);\n\nfn m",
          concise: "// see verbose",
        },
      },
      {
        id: "newtype-pattern",
        fn: "Newtype Pattern",
        desc: "Type-safe wrapper around single value.",
        category: "Structs",
        subtitle: "Wrapping for safety",
        signature: "struct UserId(u32);",
        descLong: "The newtype pattern wraps a single type in a struct to create a distinct type. Zero runtime cost. Provides type safety and semantic meaning.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Newtype Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[derive(Debug, Clone, Copy)]\nstruct UserId(u32);\n\n#[derive(Debug)]\nstruct Score(u32);\n\nfn get_user(id: UserId) -> String {\n    format!(\"User {}\", id.0)\n}\n\nfn add_score(current: Score, new: Score) -> Score {\n    Score(current.0 + new.0)\n}\n\nfn main() {\n    let user_id = UserId(42);\n    let score = Score(100);\n\n    println!(\"{}\", get_user(user_id));\n\n    let result = add_score(score, Score(50));\n    println!(\"Total score: {:?}\", result);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Newtype Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Newtype Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Type safety: cannot pass Score where UserId expected"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Newtype Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// get_user(score); // COMPILE ERROR\n}"
                  }
        ],
        tips: [
                  "Provides type safety at compile time",
                  "Zero runtime overhead",
                  "Prevents mixing incompatible values",
                  "Use for domain concepts like UserId, Money"
        ],
        mistake: "Creating too many newtypes when a type alias would suffice.",
        shorthand: {
          verbose: "#[derive(Debug, Clone, Copy)]\nstruct UserId(u32);\n\n#[derive(Debug)]\nstruct Score(u32);\n\nfn get_user(",
          concise: "// see verbose",
        },
      },
      {
        id: "builder-pattern",
        fn: "Builder Pattern",
        desc: "Fluent construction for complex structs.",
        category: "Structs",
        subtitle: "Flexible initialization",
        signature: "struct Builder { } impl Builder { fn build() }",
        descLong: "Builder pattern creates complex objects with optional fields. Provides cleaner API than many constructor parameters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Builder Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nstruct Request {\n    method: String,\n    path: String,\n    headers: Vec<(String, String)>,\n    body: Option<String>,\n}\n\nstruct RequestBuilder {\n    method: String,\n    path: String,\n    headers: Vec<(String, String)>,\n    body: Option<String>,\n}\n\nimpl RequestBuilder {\n    fn new(method: &str, path: &str) -> Self {\n        RequestBuilder {\n            method: method.to_string(),\n            path: path.to_string(),\n            headers: Vec::new(),\n            body: None,\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Builder Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Builder Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn header(mut self, key: &str, value: &str) -> Self {\n        self.headers.push((key.to_string(), value.to_string()));\n        self\n    }\n\n    fn body(mut self, content: &str) -> Self {\n        self.body = Some(content.to_string());\n        self\n    }\n\n    fn build(self) -> Request {\n        Request {\n            method: self.method,\n            path: self.path,\n            headers: self.headers,\n            body: self.body,\n        }\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Builder Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    let request = RequestBuilder::new(\"POST\", \"/api/users\")\n        .header(\"Content-Type\", \"application/json\")\n        .body(r#\"{\"name\":\"Alice\"}\"#)\n        .build();\n\n    println!(\"{}\", request.method);\n}"
                  }
        ],
        tips: [
                  "Chain method calls with `self` returns",
                  "Support optional fields elegantly",
                  "Consume builder after build()",
                  "More readable than multiple constructors"
        ],
        mistake: "Not implementing builder to take ownership for consuming build().",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Traits ─────────────────────────────────────────
  {
    id: "traits",
    title: "Traits",
    entries: [
      {
        id: "trait-definition",
        fn: "Trait Definition",
        desc: "Shared behavior across types.",
        category: "Traits",
        subtitle: "trait keyword",
        signature: "trait Name { fn method(&self); }",
        descLong: "Traits define shared behavior. Types implement traits to provide concrete implementations. Traits support default implementations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Trait Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntrait Animal {\n    fn speak(&self) -> String;\n    fn move_forward(&self) {\n        println!(\"Moving forward\");\n    }\n}\n\nstruct Dog;\nstruct Cat;\n\nimpl Animal for Dog {\n    fn speak(&self) -> String {\n        \"Woof\".to_string()\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Trait Definition — common patterns you'll see in production.\n// APPROACH  - Combine Trait Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nimpl Animal for Cat {\n    fn speak(&self) -> String {\n        \"Meow\".to_string()\n    }\n}\n\nfn main() {\n    let dog = Dog;\n    let cat = Cat;\n\n    println!(\"{}\", dog.speak());\n    println!(\"{}\", cat.speak());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Trait Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ndog.move_forward();\n    cat.move_forward();\n}"
                  }
        ],
        tips: [
                  "Methods in trait can have default implementations",
                  "Implement trait with `impl Trait for Type`",
                  "Required methods must be implemented",
                  "Traits enable polymorphism in Rust"
        ],
        mistake: "Not implementing all required trait methods.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "derive-macros",
        fn: "Derive Macros",
        desc: "Auto-implement common traits.",
        category: "Traits",
        subtitle: "#[derive(...)]",
        signature: "#[derive(Debug, Clone, Copy)]",
        descLong: "Derive macros auto-generate implementations for common traits. Common ones: Debug, Clone, Copy, PartialEq, Eq, Hash, Default.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Derive Macros — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\n#[derive(Clone)]\nstruct Data {\n    value: String,\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Derive Macros — common patterns you'll see in production.\n// APPROACH  - Combine Derive Macros with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let p1 = Point { x: 1, y: 2 };\n    let p2 = p1;\n\n    println!(\"p1: {:?}\", p1);\n    println!(\"p2: {:?}\", p2);\n    println!(\"Equal: {}\", p1 == p2);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Derive Macros — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet data1 = Data { value: \"test\".to_string() };\n    let data2 = data1.clone();\n    println!(\"data2: {:?}\", data2);\n}"
                  }
        ],
        tips: [
                  "Debug makes types printable with {:?}",
                  "Copy types are implicitly cloned",
                  "Clone requires explicit .clone()",
                  "Eq and PartialEq for equality",
                  "Hash allows use in HashMap/HashSet"
        ],
        mistake: "Deriving Copy without deriving Clone (Copy requires Clone).",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "display-debug",
        fn: "Display & Debug Traits",
        desc: "Custom formatting for types.",
        category: "Traits",
        subtitle: "String representation",
        signature: "impl Display/Debug for Type { }",
        descLong: "Display formats for end-users ({}), Debug formats for developers ({:?}). Implement Display for meaningful output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Display & Debug Traits — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::fmt;\n\n#[derive(Debug)]\nstruct Point {\n    x: i32,\n    y: i32,\n}\n\nimpl fmt::Display for Point {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, \"({}, {})\", self.x, self.y)\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Display & Debug Traits — common patterns you'll see in production.\n// APPROACH  - Combine Display & Debug Traits with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nstruct Complex {\n    real: f64,\n    imag: f64,\n}\n\nimpl fmt::Debug for Complex {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, \"{}+{}i\", self.real, self.imag)\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Display & Debug Traits — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    let point = Point { x: 3, y: 4 };\n    println!(\"Display: {}\", point);\n    println!(\"Debug: {:?}\", point);\n\n    let complex = Complex { real: 3.0, imag: 4.0 };\n    println!(\"Complex: {:?}\", complex);\n}"
                  }
        ],
        tips: [
                  "Use `{}` for Display, `{:?}` for Debug",
                  "Display is user-friendly output",
                  "Debug is developer diagnostic output",
                  "Implement Display for public types"
        ],
        mistake: "Implementing Display with developer-only details; users need readable output.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "from-into-traits",
        fn: "From & Into Traits",
        desc: "Infallible type conversion.",
        category: "Traits",
        subtitle: "Type conversion",
        signature: "impl From<A> for B { fn from(a: A) -> B }",
        descLong: "From and Into enable type conversion. Implement From, Into is automatically provided. Useful for ergonomic APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of From & Into Traits — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[derive(Debug)]\nstruct Person {\n    name: String,\n}\n\nimpl From<&str> for Person {\n    fn from(s: &str) -> Self {\n        Person {\n            name: s.to_string(),\n        }\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of From & Into Traits — common patterns you'll see in production.\n// APPROACH  - Combine From & Into Traits with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nimpl From<String> for Person {\n    fn from(s: String) -> Self {\n        Person { name: s }\n    }\n}\n\nfn create_person<T: Into<Person>>(input: T) -> Person {\n    input.into()\n}\n\nfn main() {\n    let p1: Person = \"Alice\".into();\n    let p2: Person = String::from(\"Bob\").into();\n    let p3 = create_person(\"Charlie\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of From & Into Traits — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"{:?}\", p1);\n    println!(\"{:?}\", p2);\n    println!(\"{:?}\", p3);\n}"
                  }
        ],
        tips: [
                  "Implement From, Into is free",
                  "Use for ergonomic conversions",
                  "Useful in generic functions with Into bound",
                  "Works with type inference: `.into()`"
        ],
        mistake: "Implementing Into instead of From.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Generics ─────────────────────────────────────────
  {
    id: "generics",
    title: "Generics",
    entries: [
      {
        id: "generic-functions",
        fn: "Generic Functions",
        desc: "Functions working with multiple types.",
        category: "Generics",
        subtitle: "<T> syntax",
        signature: "fn func<T>(value: T) -> T { }",
        descLong: "Generic functions work with any type. Type parameters are specified with angle brackets. The compiler generates code for each concrete type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn first<T>(items: &[T]) -> Option<&T> {\n    items.first()\n}\n\nfn print_item<T: std::fmt::Debug>(item: T) {\n    println!(\"Item: {:?}\", item);\n}\n\nfn swap<T>(a: T, b: T) -> (T, T) {\n    (b, a)\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Functions — common patterns you'll see in production.\n// APPROACH  - Combine Generic Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let numbers = vec![1, 2, 3];\n    let strings = vec![\"a\", \"b\", \"c\"];\n\n    println!(\"First number: {:?}\", first(&numbers));\n    println!(\"First string: {:?}\", first(&strings));\n\n    print_item(42);\n    print_item(\"hello\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet (x, y) = swap(1, 2);\n    println!(\"Swapped: {}, {}\", x, y);\n}"
                  }
        ],
        tips: [
                  "Type parameter <T> represents any type",
                  "Add trait bounds for required behavior",
                  "Compiler specializes for each concrete type",
                  "No runtime overhead (monomorphization)"
        ],
        mistake: "Using T without trait bounds when methods are needed.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "trait-bounds",
        fn: "Trait Bounds",
        desc: "Constrain generic types with traits.",
        category: "Generics",
        subtitle: "T: Trait syntax",
        signature: "fn func<T: Clone>(t: T) -> T { }",
        descLong: "Trait bounds specify what operations are allowed on generic types. Use `where` clauses for complex bounds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Trait Bounds — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::fmt::Debug;\n\nfn print_and_return<T: Debug + Clone>(value: T) -> T {\n    println!(\"Value: {:?}\", value);\n    value.clone()\n}\n\nfn largest<T: PartialOrd + Copy>(list: &[T]) -> T {\n    let mut largest = list[0];\n    for &item in list.iter() {\n        if item > largest {\n            largest = item;\n        }\n    }\n    largest\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Trait Bounds — common patterns you'll see in production.\n// APPROACH  - Combine Trait Bounds with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let num = 42;\n    let result = print_and_return(num);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Trait Bounds — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"Result: {}\", result);\n\n    let numbers = vec![34, 50, 25, 100, 65];\n    let max = largest(&numbers);\n    println!(\"Largest: {}\", max);\n\n    let chars = vec!['y', 'm', 'a'];\n    let max_char = largest(&chars);\n    println!(\"Largest char: {}\", max_char);\n}"
                  }
        ],
        tips: [
                  "Trait bounds specify required behavior",
                  "Multiple bounds: T: Clone + Debug",
                  "Compiler enforces bounds at compile time",
                  "Some combinations impossible (e.g., Clone + Move)"
        ],
        mistake: "Forgetting trait bounds when using methods on generics.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "where-clause",
        fn: "where Clause",
        desc: "Complex trait bound syntax.",
        category: "Generics",
        subtitle: "Readable bounds",
        signature: "fn func<T>(t: T) where T: Trait { }",
        descLong: "`where` clauses improve readability for complex trait bounds. Useful with multiple type parameters and bounds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of where Clause — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::fmt::Debug;\n\nfn process<T, U>(t: T, u: U)\nwhere\n    T: Debug + Clone,\n    U: Debug,\n{\n    println!(\"T: {:?}\", t);\n    println!(\"U: {:?}\", u);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of where Clause — common patterns you'll see in production.\n// APPROACH  - Combine where Clause with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn combine<T, U, V>(t: T, u: U) -> V\nwhere\n    T: Into<V>,\n    U: Into<V>,\n    V: Clone,\n{\n    let v1: V = t.into();\n    v1\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of where Clause — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    process(vec![1, 2, 3], \"hello\");\n\n    let result: String = combine(5, 10);\n    println!(\"Result: {}\", result);\n}"
                  }
        ],
        tips: [
                  "More readable than inline bounds",
                  "Useful with multiple type parameters",
                  "Each type on its own line",
                  "Can reference multiple bounds per type"
        ],
        mistake: "Overcomplicating bounds; simple cases don't need `where`.",
        shorthand: {
          verbose: "fn process<T: Debug + Clone, U: Debug>(t: T, u: U) {\n    println!(\"T: {:?}\", t);\n}",
          concise: "fn process<T, U>(t: T, u: U)\nwhere\n    T: Debug + Clone,\n    U: Debug,\n{\n    println!(\"T: {:?}\", t);\n}  // More readable",
        },
      },
      {
        id: "generic-structs",
        fn: "Generic Structs & impl",
        desc: "Type parameters in struct definitions.",
        category: "Generics",
        subtitle: "Parameterized types",
        signature: "struct Container<T> { value: T }",
        descLong: "Structs can be generic over types. impl blocks can also be generic. You can specialize impl for specific types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Structs & impl — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nstruct Container<T> {\n    value: T,\n}\n\nstruct Pair<T, U> {\n    first: T,\n    second: U,\n}\n\nimpl<T> Container<T> {\n    fn new(value: T) -> Self {\n        Container { value }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Structs & impl — common patterns you'll see in production.\n// APPROACH  - Combine Generic Structs & impl with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn get(&self) -> &T {\n        &self.value\n    }\n}\n\nimpl Container<i32> {\n    fn add_one(&self) -> i32 {\n        self.value + 1\n    }\n}\n\nfn main() {\n    let int_container = Container::new(42);\n    let string_container = Container::new(\"hello\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Structs & impl — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"Int: {}\", int_container.get());\n    println!(\"String: {}\", string_container.get());\n    println!(\"Add one: {}\", int_container.add_one());\n\n    let pair: Pair<i32, String> = Pair {\n        first: 42,\n        second: \"hello\".to_string(),\n    };\n    println!(\"Pair: ({}, {})\", pair.first, pair.second);\n}"
                  }
        ],
        tips: [
                  "impl<T> applies to all types",
                  "impl Container<i32> specializes for i32",
                  "Type parameters appear in angle brackets",
                  "No runtime overhead; compiler specializes"
        ],
        mistake: "Not specifying type parameters explicitly when inference is ambiguous.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "associated-types",
        fn: "Associated Types",
        desc: "Type members within traits.",
        category: "Generics",
        subtitle: "type keyword in traits",
        signature: "trait Trait { type Item; }",
        descLong: "Associated types are type placeholders in traits. Implementing types provide concrete types. Cleaner than type parameters in many cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Associated Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntrait Iterator {\n    type Item;\n\n    fn next(&mut self) -> Option<Self::Item>;\n}\n\nstruct CountUp {\n    current: u32,\n}\n\nimpl Iterator for CountUp {\n    type Item = u32;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Associated Types — common patterns you'll see in production.\n// APPROACH  - Combine Associated Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn next(&mut self) -> Option<u32> {\n        self.current += 1;\n        Some(self.current)\n    }\n}\n\ntrait Container {\n    type Item;\n    fn empty() -> Self;\n    fn add(&mut self, item: Self::Item);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Associated Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    let mut counter = CountUp { current: 0 };\n    println!(\"{:?}\", counter.next());\n    println!(\"{:?}\", counter.next());\n}"
                  }
        ],
        tips: [
                  "Associated types reduce generic boilerplate",
                  "Each impl provides concrete type",
                  "Cleaner than generic parameters in some cases",
                  "Access with `<Type as Trait>::AssocType`"
        ],
        mistake: "Using generic parameters when associated types are more appropriate.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Advanced Types ─────────────────────────────────────────
  {
    id: "advanced-types",
    title: "Advanced Types",
    entries: [
      {
        id: "type-aliases",
        fn: "Type Aliases",
        desc: "Create alternative names for types.",
        category: "Advanced",
        subtitle: "type keyword",
        signature: "type Name = ExistingType;",
        descLong: "Type aliases provide alternative names for existing types. Useful for reducing verbosity or improving clarity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Aliases — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntype Kilometers = i32;\ntype Thunk = Box<dyn Fn() + Send + 'static>;\ntype Result<T> = std::result::Result<T, String>;\n\nfn main() {\n    let distance: Kilometers = 5;\n    println!(\"Distance: {}\", distance);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Aliases — common patterns you'll see in production.\n// APPROACH  - Combine Type Aliases with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet f: Thunk = Box::new(|| println!(\"hi\"));\n    f();\n\n    let ok_result: Result<i32> = Ok(42);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Aliases — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nmatch ok_result {\n        Ok(n) => println!(\"Value: {}\", n),\n        Err(e) => println!(\"Error: {}\", e),\n    }\n}"
                  }
        ],
        tips: [
                  "Aliases are purely compile-time",
                  "Improve code readability",
                  "Reduce repetition of complex types",
                  "Not structural subtyping; i32 and Kilometers are the same"
        ],
        mistake: "Using aliases to hide important type information.",
        shorthand: {
          verbose: "type Kilometers = i32;\ntype Thunk = Box<dyn Fn() + Send + 'static>;\ntype Result<T> = std::result::Re",
          concise: "// see verbose",
        },
      },
      {
        id: "phantom-data",
        fn: "PhantomData",
        desc: "Mark type parameters as used.",
        category: "Advanced",
        subtitle: "Unused type params",
        signature: "struct Marker<T> { _phantom: PhantomData<T> }",
        descLong: "PhantomData allows using a type parameter without storing it. Useful for variance, drop behavior, and type system tricks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of PhantomData — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::marker::PhantomData;\n\nstruct Identifier<T> {\n    id: u64,\n    _phantom: PhantomData<T>,\n}\n\nimpl<T> Identifier<T> {\n    fn new(id: u64) -> Self {\n        Identifier {\n            id,\n            _phantom: PhantomData,\n        }\n    }\n\n    fn get_id(&self) -> u64 {\n        self.id\n    }\n}\n\nfn main() {\n    let user_id: Identifier<String> = Identifier::new(42);\n    let post_id: Identifier<u32> = Identifier::new(1);\n\n    println!(\"User: {}\", user_id.get_id());\n    println!(\"Post: {}\", post_id.get_id());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of PhantomData — common patterns you'll see in production.\n// APPROACH  - Combine PhantomData with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Type system distinguishes them even though runtime is identical"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of PhantomData — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n}"
                  }
        ],
        tips: [
                  "Zero runtime overhead",
                  "Useful for phantom types",
                  "Helps compiler understand intent",
                  "Use for generic markers and type safety"
        ],
        mistake: "Using PhantomData for complex types; only use for markers.",
        shorthand: {
          verbose: "#[derive(Debug)]\nstruct Person {\n    name: String,\n    age: ",
          concise: "// see verbose",
        },
      },
      {
        id: "cow-type",
        fn: "Cow (Clone-on-Write)",
        desc: "Efficient borrowing with fallback to owned.",
        category: "Advanced",
        subtitle: "Flexible ownership",
        signature: "Cow<'a, T>",
        descLong: "Cow (Clone-on-Write) allows borrowing or owning data. When mutation is needed, Cow clones. Reduces allocations in many cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cow (Clone-on-Write) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::borrow::Cow;\n\nfn process_string(s: Cow<str>) -> Cow<str> {\n    if s.contains(\"world\") {\n        Cow::Owned(s.into_owned().to_uppercase())\n    } else {\n        s\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cow (Clone-on-Write) — common patterns you'll see in production.\n// APPROACH  - Combine Cow (Clone-on-Write) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let static_str = \"hello\";\n    let result = process_string(Cow::Borrowed(static_str));\n    println!(\"Borrowed: {}\", result);\n\n    let owned_str = String::from(\"hello world\");\n    let result = process_string(Cow::Owned(owned_str));\n    println!(\"Owned: {}\", result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cow (Clone-on-Write) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet mut data = vec![1, 2, 3];\n    let cow = Cow::Borrowed(data.as_slice());\n    println!(\"Cow: {:?}\", cow);\n}"
                  }
        ],
        tips: [
                  "Cow borrows by default",
                  "Clones only when mutation needed",
                  "Reduces allocations in passing functions",
                  "Use for string or slice functions"
        ],
        mistake: "Using Cow everywhere; simple &str/&[T] is usually better.",
        shorthand: {
          verbose: "use std::borrow::Cow;\n\nfn process_string(s: Cow<str>) -> Cow<str> {\n    if s.contains(\"world\") {\n   ",
          concise: "// see verbose",
        },
      },
      {
        id: "dyn-trait-vs-impl",
        fn: "dyn Trait vs impl Trait",
        desc: "Dynamic vs static dispatch.",
        category: "Advanced",
        subtitle: "Trait objects",
        signature: "dyn Trait vs impl Trait",
        descLong: "impl Trait is static dispatch (monomorphization). dyn Trait is dynamic dispatch (vtables). Different tradeoffs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of dyn Trait vs impl Trait — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntrait Animal {\n    fn speak(&self) -> String;\n}\n\nstruct Dog;\nstruct Cat;\n\nimpl Animal for Dog {\n    fn speak(&self) -> String {\n        \"Woof\".to_string()\n    }\n}\n\nimpl Animal for Cat {\n    fn speak(&self) -> String {\n        \"Meow\".to_string()\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of dyn Trait vs impl Trait — common patterns you'll see in production.\n// APPROACH  - Combine dyn Trait vs impl Trait with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn static_animal(animal: impl Animal) -> String {\n    animal.speak()\n}\n\nfn dynamic_animal(animal: &dyn Animal) -> String {\n    animal.speak()\n}\n\nfn make_animals() -> Vec<Box<dyn Animal>> {\n    vec![Box::new(Dog), Box::new(Cat)]\n}\n\nfn main() {\n    let dog = Dog;\n    println!(\"{}\", static_animal(dog));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of dyn Trait vs impl Trait — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet cat = Cat;\n    println!(\"{}\", dynamic_animal(&cat));\n\n    let animals = make_animals();\n    for animal in animals {\n        println!(\"{}\", animal.speak());\n    }\n}"
                  }
        ],
        tips: [
                  "impl Trait: compile-time polymorphism",
                  "dyn Trait: runtime polymorphism",
                  "dyn Trait has small runtime cost (vtable)",
                  "Use dyn Trait when type varies at runtime",
                  "Use impl Trait for generic functions"
        ],
        mistake: "Using dyn Trait when impl Trait would be clearer.",
        shorthand: {
          verbose: "trait Animal {\n    fn speak(&self) -> String;\n}\n\nstruct Dog;\nstruct Cat;\n\nimpl Animal for Dog {\n    ",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
