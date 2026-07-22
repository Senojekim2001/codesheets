export const meta = {
  "id": "rust-ecosystem",
  "label": "Ecosystem & Tooling",
  "icon": "🦀",
  "description": "Essential Rust crates and tooling: serde, error handling crates, macros, Cargo features, and CLI."
}

export const sections = [

  // ── Section 1: Serialization & Error Crates ─────────────────────────────────────────
  {
    id: "serialization",
    title: "Serialization & Error Crates",
    entries: [
      {
        id: "serde",
        fn: "Serde — Serialization & Deserialization",
        desc: "The standard serialization framework — derive Serialize/Deserialize for automatic JSON, TOML, YAML, and more.",
        category: "Ecosystem",
        subtitle: "serde + serde_json for type-safe data interchange",
        signature: "#[derive(Serialize, Deserialize)]  |  serde_json::to_string(&val)",
        descLong: "Serde is Rust's universal serialization framework. Derive macros auto-generate (de)serialization code at compile time with zero runtime overhead. serde_json, toml, serde_yaml provide format-specific support. Attributes like #[serde(rename, default, skip)] customize behavior. Used by virtually every Rust web framework, config library, and data tool.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Serde — Serialization & Deserialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse serde::{Serialize, Deserialize};\n\n#[derive(Debug, Serialize, Deserialize)]\nstruct User {\n    name: String,\n    age: u32,\n    #[serde(default)]                    // use Default if missing\n    active: bool,\n    #[serde(skip_serializing_if = \"Option::is_none\")]\n    email: Option<String>,\n    #[serde(rename = \"created_at\")]      // JSON key name\n    created: String,\n}\n\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    // Serialize to JSON\n    let user = User {\n        name: \"Alice\".into(),\n        age: 30,\n        active: true,\n        email: Some(\"alice@example.com\".into()),\n        created: \"2024-01-15\".into(),\n    };\n\n    let json = serde_json::to_string_pretty(&user)?;\n    println!(\"{}\", json);\n    // { \"name\": \"Alice\", \"age\": 30, \"active\": true,\n    //   \"email\": \"alice@example.com\", \"created_at\": \"2024-01-15\" }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Serde — Serialization & Deserialization — common patterns you'll see in production.\n// APPROACH  - Combine Serde — Serialization & Deserialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Deserialize from JSON\n    let json_str = r#\"{\"name\":\"Bob\",\"age\":25,\"created_at\":\"2024-06-01\"}\"#;\n    let bob: User = serde_json::from_str(json_str)?;\n    println!(\"{:?}\", bob);  // active defaults to false, email is None"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Serde — Serialization & Deserialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Serialize to Value (dynamic JSON),    let val: serde_json::Value = serde_json::from_str(json_str)?;,    println!(\"Name: {}\", val[\"name\"]);,\n\n    // Vec/HashMap serialization,    let users = vec![user, bob];,    let json_array = serde_json::to_string(&users)?;,\n\n    // Enums with serde,    #[derive(Serialize, Deserialize, Debug)],    #[serde(tag = \"type\")]               // internally tagged,    enum Message {,        Text { content: String },,        Image { url: String, width: u32 },,    },,    let msg = Message::Text { content: \"hello\".into() };,    println!(\"{}\", serde_json::to_string(&msg)?);,    // {\"type\":\"Text\",\"content\":\"hello\"},,    Ok(()),}"
                  }
        ],
        tips: [
                  "#[serde(rename_all = \"camelCase\")] converts all field names — great for JSON API conventions.",
                  "Use #[serde(tag = \"type\")] for enum serialization — produces cleaner JSON than the default.",
                  "serde_json::Value lets you work with dynamic JSON when you don't know the shape at compile time.",
                  "Cargo.toml: serde = { version = \"1\", features = [\"derive\"] } enables the derive macros."
        ],
        mistake: "Forgetting features = [\"derive\"] in Cargo.toml — without it, #[derive(Serialize, Deserialize)] won't compile. The derive macros are behind a feature flag.",
        shorthand: {
          verbose: "// Manual serialize impl (verbose, error-prone)\nimpl serde::ser::Serialize for User {\n    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>\n    where S: serde::ser::Serializer { ... }\n}\n// Manual deserialize impl needed too",
          concise: "#[derive(Serialize, Deserialize)]\nstruct User { name: String, age: u32 }",
        },
      },
      {
        id: "thiserror-anyhow",
        fn: "thiserror & anyhow — Error Handling Crates",
        desc: "thiserror for defining library errors with derive macros; anyhow for application-level error handling with context.",
        category: "Ecosystem",
        subtitle: "Ergonomic error types for libraries and applications",
        signature: "#[derive(thiserror::Error)]  |  anyhow::Result<T>  |  .context(\"msg\")",
        descLong: "thiserror auto-derives std::error::Error with custom messages and From conversions — ideal for libraries that need typed errors. anyhow provides a universal error type (anyhow::Error) that wraps any error and adds context — ideal for applications where you just want to propagate and report errors. Use thiserror for libraries, anyhow for binaries.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of thiserror & anyhow — Error Handling Crates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── thiserror (for libraries) ────────────────────────\nuse thiserror::Error;\n\n#[derive(Error, Debug)]\nenum AppError {\n    #[error(\"database error: {0}\")]\n    Database(#[from] sqlx::Error),        // auto From impl\n\n    #[error(\"not found: {entity} with id {id}\")]\n    NotFound { entity: String, id: i64 },\n\n    #[error(\"validation failed: {0}\")]\n    Validation(String),\n\n    #[error(\"authentication required\")]\n    Unauthorized,\n\n    #[error(transparent)]                  // delegates Display to inner\n    Other(#[from] Box<dyn std::error::Error + Send + Sync>),\n}\n\nfn find_user(id: i64) -> Result<User, AppError> {\n    let user = db.query(id)?;  // sqlx::Error auto-converts via #[from]\n    user.ok_or(AppError::NotFound {\n        entity: \"User\".into(),\n        id,\n    })\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of thiserror & anyhow — Error Handling Crates — common patterns you'll see in production.\n// APPROACH  - Combine thiserror & anyhow — Error Handling Crates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── anyhow (for applications) ───────────────────────\nuse anyhow::{Context, Result, bail, ensure};\n\nfn load_config(path: &str) -> Result<Config> {\n    let content = std::fs::read_to_string(path)\n        .context(\"failed to read config file\")?;  // adds context\n\n    let config: Config = toml::from_str(&content)\n        .context(\"failed to parse config TOML\")?;\n\n    ensure!(config.port > 0, \"port must be positive, got {}\", config.port);\n\n    if config.name.is_empty() {\n        bail!(\"config name cannot be empty\");  // return Err immediately\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of thiserror & anyhow — Error Handling Crates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nOk(config)\n}\n\nfn main() -> Result<()> {\n    let config = load_config(\"config.toml\")?;\n    // Error output with context chain:\n    // Error: failed to read config file\n    //\n    // Caused by:\n    //     No such file or directory (os error 2)\n    Ok(())\n}"
                  }
        ],
        tips: [
                  "Libraries: use thiserror to define typed errors consumers can match on.",
                  "Applications: use anyhow for easy propagation — you rarely need to match on specific error types in main().",
                  ".context(\"msg\") on any Result adds human-readable context to the error chain.",
                  "bail!(\"msg\") is shorthand for return Err(anyhow!(\"msg\")) — clean early returns."
        ],
        mistake: "Using anyhow::Error in a library's public API — callers can't match on specific error variants. Use thiserror for typed errors in libraries; anyhow is for application code.",
        shorthand: {
          verbose: "// Manual Display + Error impl (verbose)\nimpl Display for AppError { fn fmt(&self, f: &mut Formatter) { ... } }\nimpl Error for AppError { fn source(&self) { ... } }",
          concise: "#[derive(thiserror::Error)]\n#[error(\"failed: {0}\")]\nstruct AppError(String);",
        },
      },
    ],
  },

  // ── Section 2: Macros ─────────────────────────────────────────
  {
    id: "macros",
    title: "Macros",
    entries: [
      {
        id: "declarative-macros",
        fn: "Declarative Macros (macro_rules!)",
        desc: "Pattern-matching code generation — write macros that expand based on token patterns at compile time.",
        category: "Macros",
        subtitle: "macro_rules!, repetition, fragment specifiers",
        signature: "macro_rules! name { ($pattern) => { $expansion }; }",
        descLong: "Declarative macros match against token patterns and expand into code at compile time. Fragment specifiers ($x:expr, $x:ty, $x:ident, etc.) capture different syntax elements. Repetition ($($x:expr),*) handles variable-length arguments. Macros are hygienic — they don't accidentally capture variables from the call site. Use for reducing boilerplate, DSLs, and variadic \"functions\".",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Declarative Macros (macro_rules!) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Basic macro\nmacro_rules! say_hello {\n    () => {\n        println!(\"Hello, world!\");\n    };\n    ($name:expr) => {\n        println!(\"Hello, {}!\", $name);\n    };\n}\n\nsay_hello!();           // \"Hello, world!\"\nsay_hello!(\"Alice\");    // \"Hello, Alice!\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Declarative Macros (macro_rules!) — common patterns you'll see in production.\n// APPROACH  - Combine Declarative Macros (macro_rules!) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Variadic macro with repetition\nmacro_rules! vec_of_strings {\n    ($($s:expr),* $(,)?) => {\n        vec![$($s.to_string()),*]\n    };\n}\n\nlet names = vec_of_strings![\"Alice\", \"Bob\", \"Charlie\"];"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Declarative Macros (macro_rules!) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// HashMap literal macro,macro_rules! hashmap {,    ($($key:expr => $val:expr),* $(,)?) => {{,        let mut map = std::collections::HashMap::new();,        $(map.insert($key, $val);)*,        map,    }};,},,let scores = hashmap! {,    \"Alice\" => 95,,    \"Bob\" => 87,,    \"Charlie\" => 92,,};,\n\n// Builder-style macro,macro_rules! make_struct {,    ($name:ident { $($field:ident : $ty:ty),* $(,)? }) => {,        #[derive(Debug)],        struct $name {,            $($field: $ty,)*,        },    };,},,make_struct!(Point { x: f64, y: f64 });,let p = Point { x: 1.0, y: 2.0 };,\n\n// Recursive macro for nested structures,macro_rules! nested {,    ($val:expr) => { $val };,    ($head:expr, $($tail:expr),+) => {,        ($head, nested!($($tail),+)),    };,},,let n = nested!(1, 2, 3, 4);  // (1, (2, (3, 4)))"
                  }
        ],
        tips: [
                  "Fragment specifiers: expr (expression), ty (type), ident (identifier), tt (token tree), pat (pattern), stmt (statement).",
                  "Use $(,)? at the end to allow an optional trailing comma — much better ergonomics.",
                  "macro_rules! macros are expanded at the call site — use cargo expand to see what they generate.",
                  "Prefer functions and generics when possible; use macros only when you need syntax-level abstraction."
        ],
        mistake: "Writing complex logic in macro_rules! — they're hard to debug and have confusing error messages. Extract the logic into a helper function and have the macro call it.",
        shorthand: {
          verbose: "// Repetitive match arms (verbose)\nif x == 1 { create_a(); } else if x == 2 { create_b(); } else { create_c(); }\n// Repeated for each variant",
          concise: "macro_rules! vec_of_strings {\n  ($($x:expr),*) => { vec![$($x.to_string()),*] }\n}",
        },
      },
      {
        id: "proc-macros",
        fn: "Procedural & Derive Macros",
        desc: "Code generation from Rust code — derive macros, attribute macros, and function-like proc macros.",
        category: "Macros",
        subtitle: "#[derive(MyMacro)], #[my_attribute], proc_macro!",
        signature: "#[proc_macro_derive(Name)]  |  #[proc_macro_attribute]",
        descLong: "Procedural macros operate on token streams using Rust code (not pattern matching). Three types: derive macros (#[derive(MyTrait)] — most common), attribute macros (#[route(\"/path\")]), and function-like macros (sql!(\"SELECT ...\")). They live in a separate crate with proc-macro = true. Libraries like syn and quote simplify token parsing and generation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Procedural & Derive Macros — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Using derive macros (consumer side) ─────────────\n// Most derive macros come from crates:\nuse serde::{Serialize, Deserialize};\n\n#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]\nstruct Config {\n    name: String,\n    port: u16,\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Procedural & Derive Macros — common patterns you'll see in production.\n// APPROACH  - Combine Procedural & Derive Macros with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Using attribute macros ──────────────────────────\n// Example: tokio's async main\n#[tokio::main]\nasync fn main() {\n    println!(\"Hello from async!\");\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Procedural & Derive Macros — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Example: axum route handler,// #[axum::debug_handler],// async fn handler() -> impl IntoResponse { \"Hello\" },\n\n// ── Writing a simple derive macro (proc-macro crate) ─,// In Cargo.toml of the proc-macro crate:,// [lib],// proc-macro = true,//,// [dependencies],// syn = { version = \"2\", features = [\"full\"] },// quote = \"1\",// proc-macro2 = \"1\",\n\n// use proc_macro::TokenStream;,// use quote::quote;,// use syn::{parse_macro_input, DeriveInput};,//,// #[proc_macro_derive(Describe)],// pub fn describe_derive(input: TokenStream) -> TokenStream {,//     let input = parse_macro_input!(input as DeriveInput);,//     let name = &input.ident;,//,//     let expanded = quote! {,//         impl #name {,//             pub fn describe() -> &'static str {,//                 stringify!(#name),//             },//         },//     };,//,//     TokenStream::from(expanded),// },//,// // Usage:,// #[derive(Describe)],// struct MyStruct;,// assert_eq!(MyStruct::describe(), \"MyStruct\");,\n\n// ── Common derive macros from the ecosystem ─────────,// serde:     Serialize, Deserialize,// thiserror: Error,// clap:      Parser, Subcommand,// sqlx:      FromRow,// strum:     EnumString, Display,// derive_more: From, Into, Display, Constructor"
                  }
        ],
        tips: [
                  "syn parses Rust syntax into an AST; quote turns Rust-like syntax back into tokens — they're the backbone of proc macros.",
                  "cargo expand shows what any macro expands to — essential for debugging macro output.",
                  "Derive macros must live in a separate crate with proc-macro = true — they're compiler plugins.",
                  "Most Rust developers use derive macros (serde, clap, thiserror) daily but rarely write them — it's fine to be a consumer."
        ],
        mistake: "Writing a proc macro for something that macro_rules! can handle — proc macros require a separate crate, are slower to compile, and are harder to maintain. Use macro_rules! first.",
        shorthand: {
          verbose: "// Manual impl Clone, Debug (verbose, repetitive)\nimpl Clone for Config { fn clone(&self) { Config { ... } } }\nimpl Debug for Config { fn fmt(&self, f: &mut Formatter) { ... } }",
          concise: "#[derive(Debug, Clone, PartialEq)]\nstruct Config { name: String, port: u16 }",
        },
      },
    ],
  },

  // ── Section 3: Cargo & Tooling ─────────────────────────────────────────
  {
    id: "cargo-tooling",
    title: "Cargo & Tooling",
    entries: [
      {
        id: "cargo-features",
        fn: "Cargo.toml, Features & Workspaces",
        desc: "Configure dependencies, feature flags for conditional compilation, and multi-crate workspaces.",
        category: "Tooling",
        subtitle: "Dependencies, features, workspace, profiles",
        signature: "[features] default = [\"std\"]  |  #[cfg(feature = \"serde\")]",
        descLong: "Cargo.toml is the project manifest. Features enable conditional compilation — dependencies and code are included only when a feature is active. Workspaces manage multiple related crates in one repo with shared Cargo.lock and target/. Profiles (dev, release, test, bench) control optimization levels. Understanding Cargo is essential for any non-trivial Rust project.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Cargo.toml, Features & Workspaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Cargo.toml ───────────────────────────────────────\n[package]\nname = \"mylib\"\nversion = \"0.1.0\"\nedition = \"2021\"\ndescription = \"A useful library\"\nlicense = \"MIT\"\nrepository = \"https://github.com/user/mylib\"\n\n[dependencies]\ntokio = { version = \"1\", features = [\"full\"] }\nserde = { version = \"1\", features = [\"derive\"], optional = true }\ntracing = { version = \"0.1\", optional = true }\nreqwest = { version = \"0.11\", default-features = false, features = [\"json\", \"rustls-tls\"] }\n\n[dev-dependencies]     # only for tests and benchmarks\nassert_cmd = \"2\"\npredicates = \"3\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Cargo.toml, Features & Workspaces — common patterns you'll see in production.\n// APPROACH  - Combine Cargo.toml, Features & Workspaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n[build-dependencies]   # only for build.rs\ncc = \"1\"\n\n# ── Features ─────────────────────────────────────────\n[features]\ndefault = [\"json\"]           # enabled unless consumer opts out\njson = [\"dep:serde\"]         # activates optional serde dependency\nlogging = [\"dep:tracing\"]\nfull = [\"json\", \"logging\"]   # feature that enables other features\n\n# ── In code: conditional compilation ─────────────────\n# #[cfg(feature = \"json\")]\n# pub mod json {\n#     use serde::{Serialize, Deserialize};\n#     // ...\n# }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Cargo.toml, Features & Workspaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Workspace (Cargo.toml at repo root) ──────────────\n# [workspace]\n# members = [\"crates/core\", \"crates/cli\", \"crates/web\"]\n# resolver = \"2\"\n#\n# [workspace.dependencies]    # shared versions\n# serde = { version = \"1\", features = [\"derive\"] }\n# tokio = { version = \"1\", features = [\"full\"] }\n\n# ── Profiles ─────────────────────────────────────────\n[profile.release]\nlto = true            # link-time optimization\ncodegen-units = 1     # slower build, faster binary\nstrip = true          # remove debug symbols"
                  }
        ],
        tips: [
                  "Use optional = true + dep:name in features to avoid pulling in heavy dependencies for all users.",
                  "Workspaces share one Cargo.lock and target/ directory — faster builds and consistent dependency versions.",
                  "[profile.release] with lto = true and codegen-units = 1 produces the smallest, fastest binaries.",
                  "cargo tree shows the full dependency graph; cargo tree -d finds duplicate dependencies."
        ],
        mistake: "Enabling features = [\"full\"] for every dependency — it pulls in everything including features you don't need, bloating compile time and binary size. Only enable what you actually use.",
        shorthand: {
          verbose: "// Manual feature gating (verbose)\n#[cfg(feature = \"json\")]\npub mod json { ... }\n#[cfg(not(feature = \"json\"))]\npub mod json { pub struct Disabled; }",
          concise: "[features]\ndefault = [\"json\"]\njson = [\"dep:serde\"]",
        },
      },
      {
        id: "clippy-rustfmt",
        fn: "Clippy, Rustfmt & Dev Tools",
        desc: "Essential Rust development tools — linting, formatting, documentation, and performance profiling.",
        category: "Tooling",
        subtitle: "cargo clippy, cargo fmt, cargo doc, cargo bench",
        signature: "cargo clippy  |  cargo fmt  |  cargo doc --open  |  cargo bench",
        descLong: "Clippy is Rust's official linter with 600+ lints for correctness, performance, and style. Rustfmt enforces consistent formatting. cargo doc generates documentation from doc comments. cargo bench runs benchmarks. These tools are the backbone of professional Rust development — use them in CI and pre-commit hooks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Clippy, Rustfmt & Dev Tools — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Clippy lints ────────────────────────────────────\n// Run: cargo clippy -- -W clippy::pedantic"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Clippy, Rustfmt & Dev Tools — common patterns you'll see in production.\n// APPROACH  - Combine Clippy, Rustfmt & Dev Tools with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Clippy catches:\n// - Unnecessary clones: let s2 = s.clone(); // when s isn't used after\n// - Inefficient patterns: if x == true → if x\n// - Missing error handling: .unwrap() in library code\n// - Performance: using Vec when a slice would work"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Clippy, Rustfmt & Dev Tools — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Allow/deny specific lints,#![allow(clippy::too_many_arguments)],#![deny(clippy::unwrap_used)]          // treat unwrap as error,,#[allow(clippy::needless_return)],fn example() -> i32 {,    return 42;  // clippy would normally suggest just: 42,},\n\n// ── Rustfmt ─────────────────────────────────────────,// Run: cargo fmt,// Check: cargo fmt -- --check (CI-friendly, returns error if not formatted),\n\n// rustfmt.toml (project root),// max_width = 100,// tab_spaces = 4,// use_small_heuristics = \"Max\",// imports_granularity = \"Crate\",\n\n// ── Documentation ───────────────────────────────────,/// Adds two numbers together.,///,/// # Examples,///,/// ```,/// let result = mylib::add(2, 3);,/// assert_eq!(result, 5);,/// ```,///,/// # Panics,///,/// Panics if the result overflows.,pub fn add(a: i32, b: i32) -> i32 {,    a.checked_add(b).expect(\"integer overflow\"),},\n\n// Run: cargo doc --open,// Doc tests in /// examples are compiled and run by cargo test!,\n\n// ── Useful cargo commands ───────────────────────────,// cargo check          — fast type-check without building,// cargo build --release — optimized build,// cargo test           — run all tests,// cargo bench          — run benchmarks,// cargo audit          — check dependencies for vulnerabilities,// cargo outdated       — show outdated dependencies,// cargo bloat          — analyze binary size,// cargo flamegraph     — generate CPU profile flamegraph"
                  }
        ],
        tips: [
                  "cargo clippy -- -W clippy::pedantic enables stricter lints — catches more issues but is opinionated.",
                  "Doc comment examples (/// ``` ... ```) are compiled and tested by cargo test — they never go stale.",
                  "cargo check is faster than cargo build — use it during development for quick feedback.",
                  "Set up CI with: cargo fmt --check, cargo clippy -- -D warnings, cargo test — catches most issues."
        ],
        mistake: "Ignoring Clippy suggestions — they're almost always correct and often catch real bugs or performance issues. At minimum, run cargo clippy in CI.",
        shorthand: {
          verbose: "// Unchecked unwrap (clippy warns)\nlet x = risky_op().unwrap();\n// No error handling, panics if fails",
          concise: "if let Ok(x) = risky_op() { ... }\n// or: risky_op().unwrap_or_default()",
        },
      },
      {
        id: "clap-cli",
        fn: "Clap — Command-Line Argument Parsing",
        desc: "Build type-safe CLI applications with derive-based argument parsing, subcommands, and help generation.",
        category: "Ecosystem",
        subtitle: "#[derive(Parser)] for declarative CLI definition",
        signature: "#[derive(clap::Parser)]  |  Cli::parse()  |  #[command(subcommand)]",
        descLong: "Clap is Rust's standard CLI argument parser. The derive API lets you define arguments as struct fields with attributes — type-safe, with automatic help text, validation, and shell completions. Supports subcommands, environment variable fallback, value parsing, and colored help output. Used by ripgrep, bat, fd, and most popular Rust CLI tools.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Clap — Command-Line Argument Parsing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse clap::{Parser, Subcommand, ValueEnum};\n\n#[derive(Parser)]\n#[command(name = \"myapp\", version, about = \"A useful CLI tool\")]\nstruct Cli {\n    /// Input file to process\n    #[arg(short, long)]\n    input: String,"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Clap — Command-Line Argument Parsing — common patterns you'll see in production.\n// APPROACH  - Combine Clap — Command-Line Argument Parsing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n/// Output file (defaults to stdout)\n    #[arg(short, long)]\n    output: Option<String>,"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Clap — Command-Line Argument Parsing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n/// Verbosity level (-v, -vv, -vvv),    #[arg(short, long, action = clap::ArgAction::Count)],    verbose: u8,,\n\n    /// Output format,    #[arg(short, long, default_value = \"text\")],    format: OutputFormat,,\n\n    /// Subcommand to execute,    #[command(subcommand)],    command: Commands,,},,#[derive(ValueEnum, Clone)],enum OutputFormat {,    Text,,    Json,,    Csv,,},,#[derive(Subcommand)],enum Commands {,    /// Analyze the input file,    Analyze {,        /// Include detailed statistics,        #[arg(long)],        detailed: bool,,    },,    /// Convert between formats,    Convert {,        /// Target format,        #[arg(short, long)],        to: String,,    },,    /// Validate the input,    Check,,},,fn main() {,    let cli = Cli::parse();,,    if cli.verbose >= 2 {,        println!(\"Debug mode enabled\");,    },,    match cli.command {,        Commands::Analyze { detailed } => {,            println!(\"Analyzing: {}\", cli.input);,            if detailed { println!(\"(detailed mode)\"); },        },        Commands::Convert { to } => {,            println!(\"Converting {} to {}\", cli.input, to);,        },        Commands::Check => {,            println!(\"Checking: {}\", cli.input);,        },    },},\n\n// Usage:,// myapp --input data.csv analyze --detailed,// myapp -i data.csv -vvv convert --to json,// myapp --help"
                  }
        ],
        tips: [
                  "Doc comments (///) on fields become the help text — no separate help strings needed.",
                  "#[arg(env = \"MY_VAR\")] falls back to an environment variable when the flag isn't provided.",
                  "ValueEnum derive on enums gives you automatic value parsing and validation for string→enum.",
                  "clap can generate shell completions (bash, zsh, fish) with clap_complete — great UX for CLI tools."
        ],
        mistake: "Parsing arguments manually with std::env::args() — it's error-prone, lacks help text, and doesn't validate. Clap handles all of this with less code and better UX.",
        shorthand: {
          verbose: "// Manual args parsing (verbose, error-prone)\nlet args: Vec<_> = std::env::args().collect();\nif args.len() < 2 { eprintln!(\"Usage: ...\"); }\nlet input = &args[1];",
          concise: "#[derive(clap::Parser)]\nstruct Args { #[arg(short)] input: String }\nlet args = Args::parse();",
        },
      },
      {
        id: "tracing-logging",
        fn: "Tracing & Structured Logging",
        desc: "Production-grade observability with structured, leveled logging and distributed tracing spans.",
        category: "Ecosystem",
        subtitle: "tracing crate for spans, events, and subscribers",
        signature: "tracing::info!(\"msg\")  |  #[instrument]  |  tracing_subscriber::init()",
        descLong: "The tracing crate is Rust's standard for observability. It supports structured fields (key=value in log output), span-based tracing (track execution through async code), and pluggable subscribers (console, JSON, OpenTelemetry). #[instrument] auto-creates spans for functions. Replaces the older log crate with richer semantics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tracing & Structured Logging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse tracing::{info, warn, error, debug, instrument, span, Level};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tracing & Structured Logging — common patterns you'll see in production.\n// APPROACH  - Combine Tracing & Structured Logging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Initialize subscriber (usually in main)\nfn main() {\n    tracing_subscriber::fmt()\n        .with_max_level(Level::DEBUG)\n        .with_target(false)\n        .with_thread_ids(true)\n        .json()                          // structured JSON output\n        .init();\n\n    info!(\"Application starting\");\n    process_request(\"alice\", 42);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tracing & Structured Logging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// #[instrument] auto-creates a span with function args,#[instrument(skip(password))]           // skip sensitive fields,async fn login(username: &str, password: &str) -> Result<Token, AuthError> {,    info!(\"Attempting login\");,,    let user = find_user(username).await?;,    debug!(user_id = %user.id, \"User found\");,,    let token = create_token(&user)?;,    info!(token_length = token.len(), \"Login successful\");,,    Ok(token),},\n\n// Structured fields,fn process_request(user: &str, request_id: u64) {,    // Fields are key=value pairs in the log output,    info!(,        user = %user,,        request_id = request_id,,        \"Processing request\",    );,\n\n    // Spans for tracking nested operations,    let span = span!(Level::INFO, \"db_query\", table = \"users\");,    let _guard = span.enter();,,    info!(\"Executing query\");,    // All events inside this scope are associated with the span,,    warn!(retries = 3, \"Connection flaky\");,    error!(\"Query failed after retries\");,},\n\n// Output (JSON mode):,// {\"timestamp\":\"...\",\"level\":\"INFO\",\"fields\":{\"message\":\"Processing request\",,//  \"user\":\"alice\",\"request_id\":42},\"target\":\"myapp\",\"span\":{...}}"
                  }
        ],
        tips: [
                  "#[instrument] is the easiest way to add tracing — it logs function entry, exit, and arguments automatically.",
                  "Use skip() in #[instrument] for sensitive data (passwords, tokens) — never log secrets.",
                  "tracing is async-aware: spans propagate correctly across .await points unlike simple logging.",
                  "In production: use tracing-subscriber with EnvFilter to control log levels via RUST_LOG env var."
        ],
        mistake: "Using println! for logging in production code — it's unstructured, unleveled, and can't be filtered. Use tracing for structured, queryable log output.",
        shorthand: {
          verbose: "// println! logging (verbose, unstructured)\nprintln!(\"User {} logged in, id={}, at {}\", user, id, time);\n// No log levels, no filtering, no structure",
          concise: "tracing::info!(user = ?user_id, \"request\");\n// Structured, leveled, filterable",
        },
      },
    ],
  },
]

export default { meta, sections }
