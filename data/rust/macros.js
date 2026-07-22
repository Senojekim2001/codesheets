export const meta = {
  "id": "macros",
  "label": "Macros, Unsafe & FFI",
  "icon": "🔧",
  "description": "Rust macros (declarative & procedural), unsafe code, raw pointers, FFI with C, and advanced low-level patterns."
}

export const sections = [

  // ── Section 1: Declarative Macros ─────────────────────────────────────────
  {
    id: "declarative-macros",
    title: "Declarative Macros",
    entries: [
      {
        id: "macro-rules",
        fn: "macro_rules! — Pattern-Based Code Generation",
        desc: "Write declarative macros with macro_rules!: pattern matching, repetition, fragment specifiers, and common patterns.",
        category: "Macros",
        subtitle: "macro_rules!, $expr, $ident, $ty, $($x:expr),*, recursive macros",
        signature: "macro_rules! name { (pattern) => { expansion }; }  |  vec![1, 2, 3]",
        descLong: "Declarative macros (macro_rules!) match patterns against token trees and expand into code at compile time. Fragment specifiers ($x:expr, $x:ident, $x:ty, etc.) capture different syntax elements. Repetition ($($x:expr),*) handles variable-length arguments. Macros can have multiple pattern arms, like match. They operate on syntax, not values — they generate code before type checking. Common uses: reducing boilerplate, DSLs, variadic functions, and conditional compilation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of macro_rules! — Pattern-Based Code Generation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Basic macro ──────────────────────────────────────\nmacro_rules! say_hello {\n    () => {\n        println!(\"Hello, world!\");\n    };\n    ($name:expr) => {\n        println!(\"Hello, {}!\", $name);\n    };\n}\n\nsay_hello!();           // Hello, world!\nsay_hello!(\"Alice\");    // Hello, Alice!"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of macro_rules! — Pattern-Based Code Generation — common patterns you'll see in production.\n// APPROACH  - Combine macro_rules! — Pattern-Based Code Generation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Fragment specifiers ─────────────────────────────\n// $x:expr   — expression (1 + 2, foo(), \"hello\")\n// $x:ident  — identifier (variable/function name)\n// $x:ty     — type (i32, Vec<String>, &str)\n// $x:pat    — pattern (Some(x), (a, b), _)\n// $x:stmt   — statement (let x = 1;)\n// $x:block  — block ({ ... })\n// $x:literal — literal (42, \"hello\", true)\n// $x:tt     — single token tree (anything)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of macro_rules! — Pattern-Based Code Generation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Repetition — variadic arguments ─────────────────,macro_rules! make_vec {,    // Match comma-separated expressions,    ( $( $val:expr ),* $(,)? ) => {,        {,            let mut v = Vec::new();,            $( v.push($val); )*   // repeat push for each $val,            v,        },    };,},,let nums = make_vec![1, 2, 3, 4, 5];,let names = make_vec![\"Alice\", \"Bob\",];  // trailing comma OK,\n\n// ── HashMap literal macro ───────────────────────────,macro_rules! hashmap {,    ( $( $key:expr => $val:expr ),* $(,)? ) => {,        {,            let mut map = std::collections::HashMap::new();,            $( map.insert($key, $val); )*,            map,        },    };,},,let scores = hashmap! {,    \"Alice\" => 95,,    \"Bob\" => 87,,    \"Carol\" => 92,,};,\n\n// ── Struct builder macro ────────────────────────────,macro_rules! builder {,    ($name:ident { $( $field:ident : $ty:ty ),* $(,)? }) => {,        #[derive(Debug, Default)],        struct $name {,            $( $field: Option<$ty>, )*,        },,        impl $name {,            fn new() -> Self { Self::default() },,            $(,                fn $field(mut self, val: $ty) -> Self {,                    self.$field = Some(val);,                    self,                },            )*,        },    };,},,builder!(Config {,    host: String,,    port: u16,,    debug: bool,,});,,let cfg = Config::new(),    .host(\"localhost\".into()),    .port(8080),    .debug(true);,\n\n// ── Multiple match arms ─────────────────────────────,macro_rules! calculate {,    (add $a:expr, $b:expr) => { $a + $b };,    (mul $a:expr, $b:expr) => { $a * $b };,    (neg $a:expr)          => { -$a };,},,assert_eq!(calculate!(add 2, 3), 5);,assert_eq!(calculate!(mul 4, 5), 20);"
                  }
        ],
        tips: [
                  "Use $(,)? at the end of repetitions to allow an optional trailing comma — more ergonomic for callers.",
                  "macro_rules! macros are hygienic — variables created inside the macro do not conflict with variables outside.",
                  "Use $x:tt (token tree) as a catch-all when other specifiers are too restrictive — it matches any single token or group.",
                  "Test macros with cargo expand (cargo-expand crate) — it shows the fully expanded code for debugging."
        ],
        mistake: "Using macros where a generic function would suffice — macros are harder to debug and produce worse error messages. Only use macros when you need syntax manipulation, variadic arguments, or code generation that generics cannot handle.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Repetitive match arms (verbose, verbose)\nif x == 1 { handle_a(); } else if x == 2 { handle_b(); } else { handle_c(); }\n// More explicit but longer",
          concise: "macro_rules! vec_of_strings {\n  ($($x:expr),*) => { vec![$($x.to_string()),*] }\n}",
        },
      },
      {
        id: "macro-rules-advanced",
        fn: "macro_rules! Advanced — Repetition, Hygiene & $crate",
        desc: "Advanced macro_rules! patterns: repetition with nested loops, hygiene rules, $crate for re-exports, and bracket/delimiter handling.",
        category: "Macros",
        subtitle: "$(...)+, $(...)?*, $crate::, tt muncher, macro hygiene",
        signature: "macro_rules! name { ($($x:expr),+) => { ... }; }  |  $crate::path  |  ($($($x:expr),+);*)",
        descLong: "Advanced macro_rules! techniques handle complex patterns. Nested repetition ($($($x:expr),+);*) matches multi-level structures. The $crate keyword refers to the macro's defining crate, not the calling crate — essential for correct re-exports. Macros are hygienic: generated identifiers don't shadow outer scope. The tt muncher pattern uses recursive macro invocation to process token trees. Handle different bracket types: (...), [...], or {...} with $(...) syntax.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of macro_rules! Advanced — Repetition, Hygiene & $crate — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Nested repetition ───────────────────────────────\nmacro_rules! matrix {\n    // Match rows separated by semicolon, elements by comma\n    ( $( [ $($x:expr),* ] );* $(;)? ) => {\n        vec![\n            $( vec![$($x),*] ),*\n        ]\n    };\n}\n\nlet m = matrix![\n    [1, 2, 3];\n    [4, 5, 6];\n    [7, 8, 9];\n];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of macro_rules! Advanced — Repetition, Hygiene & $crate — common patterns you'll see in production.\n// APPROACH  - Combine macro_rules! Advanced — Repetition, Hygiene & $crate with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── $crate for correct path resolution ────────────\n// In macro definition crate (my_macros):\nmacro_rules! init {\n    () => {\n        let _x = $crate::CONSTANT;\n        $crate::helper_function();\n    };\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of macro_rules! Advanced — Repetition, Hygiene & $crate — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Alternative bracket types ──────────────────────,macro_rules! config {,    // Match with any bracket type,    { $($key:ident : $val:expr),* } => {,        {,            let mut cfg = std::collections::HashMap::new();,            $( cfg.insert(stringify!($key), $val); )*,            cfg,        },    };,},,let c = config! {,    host: \"localhost\",,    port: 8080,,};,\n\n// ── TT muncher pattern (process tokens recursively) ─,macro_rules! parse_args {,    // Base case: no more arguments,    (@parse ($($acc:expr),*) ) => {,        ($($acc),*),    };,    // Recursive case: consume one argument,    (@parse ($($acc:expr),*) $head:expr, $($tail:tt)*) => {,        parse_args!(@parse ($($acc),*, $head) $($tail)*),    };,},,let result = parse_args!(@parse () 1, 2, 3, 4);,\n\n// ── Counting pattern ──────────────────────────────,macro_rules! count_items {,    () => { 0 };,    ($head:expr) => { 1 };,    ($head:expr, $($tail:expr),+ $(,)?) => {,        1 + count_items!($($tail),+),    };,},,assert_eq!(count_items!(a, b, c, d, e), 5);,\n\n// ── Optional repetition ────────────────────────────,macro_rules! log_or_panic {,    ($msg:expr) => {,        println!(\"{}\", $msg);,    };,    ($msg:expr, once) => {,        static LOGGED: std::sync::atomic::AtomicBool =,            std::sync::atomic::AtomicBool::new(false);,        if !LOGGED.swap(true, std::sync::atomic::Ordering::SeqCst) {,            println!(\"{}\", $msg);,        },    };,}"
                  }
        ],
        tips: [
                  "Use $crate instead of hardcoding crate names — ensures macros work correctly when re-exported.",
                  "Nested repetition $(...$(...)*) handles tree-like structures (matrices, nested lists).",
                  "The tt muncher pattern breaks complex parsing into smaller steps — harder to read but more powerful.",
                  "Test macro expansion with cargo expand — it reveals the actual generated code."
        ],
        mistake: "Using hardcoded crate names like mylib:: inside macros instead of $crate:: — breaks when the macro is re-exported from a wrapper crate.",
        shorthand: {
          verbose: "// Manual argument counting (verbose, error-prone)\nlet count = 5;  // hardcoded\nprintln!(\"Items: {}\", count);",
          concise: "assert_eq!(count_items!(a, b, c, d, e), 5);",
        },
      },
    ],
  },

  // ── Section 2: Procedural Macros ─────────────────────────────────────────
  {
    id: "proc-macros",
    title: "Procedural Macros",
    entries: [
      {
        id: "derive-macros",
        fn: "Derive & Attribute Macros — Custom Code Generation",
        desc: "Write procedural macros: custom derive, attribute macros, and function-like macros using syn and quote.",
        category: "Macros",
        subtitle: "#[derive(MyTrait)], #[my_attribute], proc_macro, syn, quote",
        signature: "#[derive(MyMacro)]  |  #[proc_macro_derive(Name)]  |  quote! { ... }",
        descLong: "Procedural macros are Rust functions that take token streams as input and produce token streams as output. Three types: derive macros (#[derive(MyTrait)]) add implementations to structs/enums, attribute macros (#[my_attr]) transform items, and function-like macros (my_macro!(...)) transform arbitrary tokens. They use the syn crate to parse Rust syntax and quote to generate code. Proc macros must live in their own crate with proc-macro = true.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Derive & Attribute Macros — Custom Code Generation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Proc macro crate (my_macros/src/lib.rs) ─────────\n// Cargo.toml:\n// [lib]\n// proc-macro = true\n//\n// [dependencies]\n// syn = { version = \"2\", features = [\"full\"] }\n// quote = \"1\"\n// proc-macro2 = \"1\"\n\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, DeriveInput};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Derive & Attribute Macros — Custom Code Generation — common patterns you'll see in production.\n// APPROACH  - Combine Derive & Attribute Macros — Custom Code Generation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Custom derive macro ─────────────────────────────\n#[proc_macro_derive(Builder)]\npub fn derive_builder(input: TokenStream) -> TokenStream {\n    let input = parse_macro_input!(input as DeriveInput);\n    let name = &input.ident;\n    let builder_name = syn::Ident::new(\n        &format!(\"{}Builder\", name),\n        name.span(),\n    );"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Derive & Attribute Macros — Custom Code Generation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Extract fields from struct,    let fields = match &input.data {,        syn::Data::Struct(data) => &data.fields,,        _ => panic!(\"Builder only works on structs\"),,    };,,    let field_names: Vec<_> = fields.iter(),        .map(|f| f.ident.as_ref().unwrap()),        .collect();,    let field_types: Vec<_> = fields.iter(),        .map(|f| &f.ty),        .collect();,,    let expanded = quote! {,        struct #builder_name {,            #( #field_names: Option<#field_types>, )*,        },,        impl #name {,            fn builder() -> #builder_name {,                #builder_name {,                    #( #field_names: None, )*,                },            },        },,        impl #builder_name {,            #(,                fn #field_names(mut self, val: #field_types) -> Self {,                    self.#field_names = Some(val);,                    self,                },            )*,,            fn build(self) -> Result<#name, String> {,                Ok(#name {,                    #(,                        #field_names: self.#field_names,                            .ok_or(format!(\"missing field: {}\", stringify!(#field_names)))?,,                    )*,                }),            },        },    };,,    TokenStream::from(expanded),},\n\n// ── Usage ───────────────────────────────────────────,// use my_macros::Builder;,//,// #[derive(Builder, Debug)],// struct Config {,//     host: String,,//     port: u16,,//     workers: usize,,// },//,// let config = Config::builder(),//     .host(\"localhost\".into()),//     .port(8080),//     .workers(4),//     .build(),//     .unwrap();,\n\n// ── Attribute macro ─────────────────────────────────,// #[proc_macro_attribute],// pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {,//     let path = parse_macro_input!(attr as syn::LitStr);,//     let func = parse_macro_input!(item as syn::ItemFn);,//     let name = &func.sig.ident;,//     quote! {,//         #func,//         inventory::submit! {,//             Route::new(#path, #name),//         },//     }.into(),// },// Usage: #[route(\"/api/users\")],//        async fn get_users() -> Json<Vec<User>> { ... }"
                  }
        ],
        tips: [
                  "Proc macros MUST be in their own crate with proc-macro = true in Cargo.toml — they cannot live in the main crate.",
                  "syn parses tokens into an AST, quote! generates tokens from a template — together they make proc macros manageable.",
                  "cargo expand shows the full expanded output of all macros — invaluable for debugging proc macro output.",
                  "Use #[proc_macro_derive(Name, attributes(helper))] to define helper attributes that your derive macro can read."
        ],
        mistake: "Trying to put proc macros in the same crate as the code that uses them — proc macros must be compiled before use, so they require a separate crate. Create a my_project_macros crate and depend on it.",
        shorthand: {
          verbose: "// Manual impl Debug, Clone (verbose, repetitive)\nimpl Debug for Config { fn fmt(&self, f: &mut Formatter) { ... } }\nimpl Clone for Config { fn clone(&self) { ... } }",
          concise: "#[derive(Debug, Clone, Serialize, Deserialize)]\nstruct Config { name: String, port: u16 }",
        },
      },
      {
        id: "declarative-macros-patterns",
        fn: "Advanced Macro Patterns — TT Muncher, Push-Down Accumulation & Counting",
        desc: "Master advanced macro_rules! techniques: TT muncher for parsing, push-down accumulation for state, and counting patterns.",
        category: "Macros",
        subtitle: "TT muncher, @accumulator, @internal, recursive patterns, token processing",
        signature: "macro_rules! m { (@internal ($($acc:tt)*) $rest:tt) => { ... }; }",
        descLong: "The TT muncher pattern breaks complex token processing into smaller recursive steps using internal rules prefixed with @. Push-down accumulation builds state as you recurse, accumulating results in the macro arguments. This technique enables sophisticated parsing, DSLs, and code generation that simple single-level macros cannot handle. The pattern is: public rule delegates to @process rule, which recursively consumes tokens and accumulates results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Macro Patterns — TT Muncher, Push-Down Accumulation & Counting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Push-down accumulation pattern ────────────────\n// Accumulate computed values as you recurse\nmacro_rules! sum_items {\n    // Base case: return the accumulated sum\n    (@accum 0, $result:expr) => { $result };\n    // Recursive case: add current item to accumulator\n    (@accum $n:expr, $acc:expr) => {\n        sum_items!(@accum ($n - 1), ($acc + $n))\n    };\n    // Public interface\n    ($n:expr) => {\n        sum_items!(@accum $n, 0)\n    };\n}\n\nlet total = sum_items!(5);  // 0 + 1 + 2 + 3 + 4 + 5"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Macro Patterns — TT Muncher, Push-Down Accumulation & Counting — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Macro Patterns — TT Muncher, Push-Down Accumulation & Counting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── TT muncher for token processing ───────────────\nmacro_rules! generate_getters {\n    // Base case: all fields processed\n    (@process $struct_name:ident []) => {};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Macro Patterns — TT Muncher, Push-Down Accumulation & Counting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Recursive case: emit getter for one field, recurse,    (@process $struct_name:ident [,        $field:ident: $ty:ty,,        $($rest:tt)*,    ]) => {,        impl $struct_name {,            pub fn $field(&self) -> &$ty {,                &self.$field,            },        },        generate_getters!(@process $struct_name [$($rest)*]);,    };,\n\n    // Public interface,    ($struct_name:ident { $($fields:tt)* }) => {,        generate_getters!(@process $struct_name [$($fields)*]);,    };,},,generate_getters!(User {,    id: u64,,    name: String,,    email: String,,});,\n\n// ── Counting with accumulation ────────────────────,macro_rules! count_and_list {,    // Base case: return tuple of (count, list),    (@count 0, ($($items:expr),*)) => {,        (0, ($($items),*)),    };,    // Recursive: increment count and recurse,    (@count $n:expr, ($($items:expr),*)) => {,        {,            let (c, items) = count_and_list!(@count ($n - 1), ($($items),*));,            (c + 1, items),        },    };,    ($($x:expr),* $(,)?) => {,        count_and_list!(@count 1, ($($x),*)),    };,},\n\n// ── Builder pattern with TT muncher ───────────────,macro_rules! define_builder {,    (@build_setters $name:ident, []) => {};,,    (@build_setters $name:ident, [$field:ident: $ty:ty, $($rest:tt)*]) => {,        impl Default$name {,            pub fn $field(mut self, val: $ty) -> Self {,                self.$field = Some(val);,                self,            },        },        define_builder!(@build_setters $name, [$($rest)*]);,    };,,    ($name:ident { $($fields:tt)* }) => {,        #[derive(Default)],        pub struct Default$name {,            $($fields)*,        },        define_builder!(@build_setters $name, [$($fields)*]);,    };,}"
                  }
        ],
        tips: [
                  "TT muncher is powerful but hard to debug — use cargo expand frequently to see generated code.",
                  "Push-down accumulation builds state as you recurse — essential for transforming complex token streams.",
                  "@internal rule naming convention signals internal helpers that users should not call directly.",
                  "The pattern \"recurse on $($rest:tt)*\" processes token trees incrementally — match and consume one piece per recursion."
        ],
        mistake: "Trying to match and process all tokens in one rule instead of recursively — leads to overly complex patterns. Break it into pieces with @internal rules.",
        shorthand: {
          verbose: "// Manual loop to process list (verbose)\nlet mut total = 0;\nfor item in [1, 2, 3, 4, 5] {\n    total += item;\n}",
          concise: "sum_items!(5)  // via TT muncher macro",
        },
      },
      {
        id: "proc-macro-basics",
        fn: "Procedural Macro Basics — TokenStream, syn & quote",
        desc: "Build procedural macros from scratch: understand TokenStream, parse with syn, and generate code with quote.",
        category: "Macros",
        subtitle: "proc-macro crate, TokenStream, syn, quote!, proc_macro2, parse_macro_input!",
        signature: "#[proc_macro] pub fn name(input: TokenStream) -> TokenStream  |  parse_macro_input!(input as Type)",
        descLong: "Procedural macros are Rust functions that transform token streams. The proc_macro crate provides TokenStream (compiler tokens). syn parses TokenStream into a structured AST for easy manipulation. quote! generates TokenStream from Rust-like templates. proc-macro2 provides stable APIs used by syn/quote. Always parse input with parse_macro_input! macro to get helpful error messages.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Procedural Macro Basics — TokenStream, syn & quote — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml for macro crate:\n// [lib]\n// proc-macro = true\n// [dependencies]\n// proc-macro2 = \"1\"\n// quote = \"1\"\n// syn = { version = \"2\", features = [\"full\"] }\n\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, DeriveInput, Lit, Meta};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Procedural Macro Basics — TokenStream, syn & quote — common patterns you'll see in production.\n// APPROACH  - Combine Procedural Macro Basics — TokenStream, syn & quote with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple derive macro with syn ────────────────────\n#[proc_macro_derive(Debug2, attributes(debug_ignore))]\npub fn derive_debug(input: TokenStream) -> TokenStream {\n    let input = parse_macro_input!(input as DeriveInput);\n    let name = &input.ident;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Procedural Macro Basics — TokenStream, syn & quote — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Extract fields,    let fields = match &input.data {,        syn::Data::Struct(data) => &data.fields,,        _ => panic!(\"Only structs supported\"),,    };,\n\n    // Generate field debug statements,    let field_debugs = fields.iter().map(|f| {,        let ident = &f.ident;,        let name_str = ident.as_ref().unwrap().to_string();,        quote! {,            .field(#name_str, &self.#ident),        },    });,,    let expanded = quote! {,        impl std::fmt::Debug for #name {,            fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {,                f.debug_struct(stringify!(#name)),                    #(#field_debugs)*,                    .finish(),            },        },    };,,    TokenStream::from(expanded),},\n\n// ── Function-like macro (no separate crate needed) ─,// Usage: color_enum! { Red, Green, Blue },#[proc_macro],pub fn color_enum(input: TokenStream) -> TokenStream {,    let colors = parse_macro_input!(input with syn::punctuated::Punctuated::<syn::Ident, syn::token::Comma>::parse_terminated);,,    let variants = colors.iter();,    let names = colors.iter().map(|c| c.to_string());,,    let expanded = quote! {,        #[derive(Debug, Clone, Copy, PartialEq, Eq)],        pub enum Color {,            #(#variants),*,        },,        impl Color {,            pub fn name(&self) -> &'static str {,                match self {,                    #(Self::#variants => #names),*,                },            },        },    };,,    TokenStream::from(expanded),},\n\n// ── Analyzing input with syn ───────────────────────,#[proc_macro],pub fn show_item(input: TokenStream) -> TokenStream {,    let item = parse_macro_input!(input as syn::ItemFn);,    let name = &item.sig.ident;,    let inputs = &item.sig.inputs;,,    let arg_count = inputs.len();,,    let expanded = quote! {,        pub const INFO: &str = concat!(,            \"Function: \", stringify!(#name),,            \", Args: \", stringify!(#arg_count),        );,    };,,    TokenStream::from(expanded),}"
                  }
        ],
        tips: [
                  "Use parse_macro_input!(input as Type) instead of raw parsing — it provides better error messages.",
                  "syn::Data::Struct, Enum, Union match on all types — pattern match to handle each case safely.",
                  "quote! interpolates values with #var syntax — debug the output with cargo expand.",
                  "Proc macros must be in a separate crate with [lib] proc-macro = true in Cargo.toml."
        ],
        mistake: "Returning a TokenStream from unparsed input — always parse with syn first. Raw TokenStream manipulation is error-prone.",
        shorthand: {
          verbose: "// Manual token manipulation (verbose, fragile)\nlet tokens = input.to_string();\nlet code = format!(\"impl SomeTrait for {} {{ ... }}\", tokens);\nTokenStream::from_str(&code).unwrap()",
          concise: "quote! {\n  impl SomeTrait for #name { ... }\n}.into()",
        },
      },
      {
        id: "derive-macro",
        fn: "Custom Derive Macros — DeriveInput & Field Iteration",
        desc: "Create custom #[derive(...)] macros: parse structs/enums, iterate fields, and generate trait implementations.",
        category: "Macros",
        subtitle: "DeriveInput, Data::Struct, Fields::Named, Ident, Meta, field.ty",
        signature: "#[proc_macro_derive(MyTrait)]  |  DeriveInput { ident, data, ... }  |  for field in fields.iter()",
        descLong: "Custom derive macros use #[proc_macro_derive(Name)] to implement traits automatically. syn::DeriveInput parses the decorated struct/enum into ident, data (struct/enum/union), attrs (attributes). For structs, match on syn::Data::Struct, then iterate fields with their idents and types. Generate implementations with quote! using interpolated field names and types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Derive Macros — DeriveInput & Field Iteration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, DeriveInput, Data, Fields};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Derive Macros — DeriveInput & Field Iteration — common patterns you'll see in production.\n// APPROACH  - Combine Custom Derive Macros — DeriveInput & Field Iteration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Custom serialize macro ──────────────────────────\n#[proc_macro_derive(MySerialize)]\npub fn derive_serialize(input: TokenStream) -> TokenStream {\n    let input = parse_macro_input!(input as DeriveInput);\n    let name = &input.ident;\n    let fields = match &input.data {\n        Data::Struct(data) => match &data.fields {\n            Fields::Named(f) => f,\n            _ => panic!(\"Only named fields supported\"),\n        },\n        _ => panic!(\"Only structs supported\"),\n    };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Derive Macros — DeriveInput & Field Iteration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Iterate named fields,    let serialize_fields = fields.named.iter().map(|f| {,        let field_name = &f.ident;,        let field_str = field_name.as_ref().unwrap().to_string();,        quote! {,            result.push_str(&format!(\"\\\"{}\\\":{}\", #field_str, self.#field_name));,        },    });,,    let expanded = quote! {,        impl #name {,            pub fn to_json_string(&self) -> String {,                let mut result = String::from(\"{\");,                #(#serialize_fields);*,                result.push('}');,                result,            },        },    };,,    TokenStream::from(expanded),},\n\n// ── Schema generation from struct ───────────────────,#[proc_macro_derive(Schema)],pub fn derive_schema(input: TokenStream) -> TokenStream {,    let input = parse_macro_input!(input as DeriveInput);,    let name = &input.ident;,,    let fields = match &input.data {,        Data::Struct(data) => match &data.fields {,            Fields::Named(f) => f,,            _ => panic!(\"Only named fields\"),,        },,        _ => panic!(\"Only structs\"),,    };,,    let schema_fields = fields.named.iter().map(|f| {,        let field_name = &f.ident;,        let field_type = &f.ty;,        let type_str = quote!(#field_type).to_string();,        quote! {,            (#field_name, #type_str),        },    });,,    let expanded = quote! {,        impl #name {,            pub fn schema() -> Vec<(&'static str, &'static str)> {,                vec![,                    #(#schema_fields),*,                ],            },        },    };,,    TokenStream::from(expanded),},\n\n// ── With helper attributes ──────────────────────────,#[proc_macro_derive(Validate, attributes(validate))],pub fn derive_validate(input: TokenStream) -> TokenStream {,    let input = parse_macro_input!(input as DeriveInput);,    let name = &input.ident;,,    let fields = match &input.data {,        Data::Struct(data) => match &data.fields {,            Fields::Named(f) => f,,            _ => panic!(\"Only named fields\"),,        },,        _ => panic!(\"Only structs\"),,    };,,    let validations = fields.named.iter().filter_map(|f| {,        let field_name = &f.ident;,        // Check for #[validate(...)] attribute,        for attr in &f.attrs {,            if attr.path().is_ident(\"validate\") {,                return Some(quote! {,                    // validation logic here,                    println!(\"Validating {}\", stringify!(#field_name));,                });,            },        },        None,    });,,    let expanded = quote! {,        impl #name {,            pub fn validate(&self) -> Result<(), String> {,                #(#validations)*,                Ok(()),            },        },    };,,    TokenStream::from(expanded),}"
                  }
        ],
        tips: [
                  "Always check the Data type (Struct/Enum/Union) before accessing fields — use panic! or emit a compile error for unsupported types.",
                  "Fields::Named gives you ident and ty for each field — use these to generate correct code.",
                  "Iterate with .named.iter().map(|f| { ... }) to generate code for each field.",
                  "Use #[proc_macro_derive(Name, attributes(helper))] to allow helper attributes like #[serde(...)]."
        ],
        mistake: "Assuming all structs have named fields — check Fields::Named vs Unnamed vs Unit. Not all code needs to support enums.",
        shorthand: {
          verbose: "// Manual trait impl for each field (verbose)\nimpl MySerialize for MyStruct {\n  fn serialize(&self) -> String {\n    // hardcode each field\n  }\n}",
          concise: "#[derive(MySerialize)]  // generates impl automatically",
        },
      },
      {
        id: "attribute-macro",
        fn: "Attribute Macros — Custom #[attribute] Code Transformation",
        desc: "Write #[my_attr(...)] macros: parse attributes, transform annotated items, and generate wrapper code.",
        category: "Macros",
        subtitle: "#[proc_macro_attribute], attr: TokenStream, item: TokenStream, parse attr value",
        signature: "#[proc_macro_attribute] pub fn my_attr(attr: TokenStream, item: TokenStream) -> TokenStream",
        descLong: "Attribute macros use #[proc_macro_attribute] and receive two TokenStreams: attr (the attribute value, e.g. #[my_attr(value)]) and item (the decorated function, struct, etc.). Parse both with syn, transform the item, and return the modified code. Common uses: adding logging, auth checks, caching, metrics, code generation wrapper around functions or types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Attribute Macros — Custom #[attribute] Code Transformation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, ItemFn, Lit, Meta};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Attribute Macros — Custom #[attribute] Code Transformation — common patterns you'll see in production.\n// APPROACH  - Combine Attribute Macros — Custom #[attribute] Code Transformation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Transform function with logging ─────────────────\n#[proc_macro_attribute]\npub fn log_calls(_attr: TokenStream, item: TokenStream) -> TokenStream {\n    let input = parse_macro_input!(item as ItemFn);\n    let func_name = &input.sig.ident;\n    let visibility = &input.vis;\n    let sig = &input.sig;\n    let body = &input.block;\n\n    let expanded = quote! {\n        #visibility #sig {\n            println!(\"Called: {}\", stringify!(#func_name));\n            #body\n        }\n    };\n\n    TokenStream::from(expanded)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Attribute Macros — Custom #[attribute] Code Transformation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Parse attribute value ───────────────────────────,#[proc_macro_attribute],pub fn timeout(attr: TokenStream, item: TokenStream) -> TokenStream {,    let _secs = parse_macro_input!(attr as syn::LitInt);,    let input = parse_macro_input!(item as ItemFn);,,    let func_name = &input.sig.ident;,    let sig = &input.sig;,    let body = &input.block;,    let secs = _secs.base10_parse::<u64>().unwrap();,,    let expanded = quote! {,        #sig {,            use std::time::Duration;,            println!(\"{}() with {}s timeout\", stringify!(#func_name), #secs);,            #body,        },    };,,    TokenStream::from(expanded),},\n\n// ── More complex: add async wrapper ─────────────────,#[proc_macro_attribute],pub fn cache(_attr: TokenStream, item: TokenStream) -> TokenStream {,    let input = parse_macro_input!(item as ItemFn);,    let func_name = &input.sig.ident;,    let sig = &input.sig;,    let body = &input.block;,    let cache_name = quote::format_ident!(\"__{}_cache\", func_name);,,    let expanded = quote! {,        thread_local! {,            static #cache_name: std::cell::RefCell<Option<String>> = std::cell::RefCell::new(None);,        },,        #sig {,            let cached = #cache_name.with(|c| c.borrow().clone());,            if let Some(val) = cached {,                return val;,            },            let result = { #body };,            #cache_name.with(|c| *c.borrow_mut() = Some(result.clone()));,            result,        },    };,,    TokenStream::from(expanded),},\n\n// ── Struct-level attribute ──────────────────────────,#[proc_macro_attribute],pub fn serialize_fields(attr: TokenStream, item: TokenStream) -> TokenStream {,    let input = parse_macro_input!(item as syn::ItemStruct);,    let name = &input.ident;,    let fields = &input.fields;,,    let expanded = quote! {,        #[derive(Debug)],        pub struct #name #fields,,        impl #name {,            pub fn to_map(&self) -> std::collections::HashMap<String, String> {,                let mut map = std::collections::HashMap::new();,                // field serialization code,                map,            },        },    };,,    TokenStream::from(expanded),}"
                  }
        ],
        tips: [
                  "Attribute macros receive two TokenStreams (attr and item) — parse both separately with syn.",
                  "Return the item (possibly modified) plus any additional generated code in the result.",
                  "Use quote::format_ident! to generate unique identifiers (cache names, helpers) to avoid conflicts.",
                  "Attribute value can be parsed as syn::LitInt, syn::LitStr, or syn::Path depending on what you expect."
        ],
        mistake: "Forgetting to return the original item function/struct in the output — users expect #[my_attr] to not remove the decorated item.",
        shorthand: {
          verbose: "// Manual wrapping (verbose, repeated for each function)\nfn my_func() { ... }\nfn my_func_logged() {\n  println!(\"Called\");\n  my_func();\n}",
          concise: "#[log_calls]\nfn my_func() { ... }  // logging added automatically",
        },
      },
      {
        id: "function-like-macro",
        fn: "Function-Like Proc Macros — my_macro!() Code Generation",
        desc: "Build function-like procedural macros that generate code at compile time using arbitrary token syntax.",
        category: "Macros",
        subtitle: "#[proc_macro], my_macro!(), generate code from tokens, DSLs",
        signature: "#[proc_macro] pub fn my_macro(input: TokenStream) -> TokenStream",
        descLong: "Function-like proc macros behave like normal macros but are implemented in Rust code. They receive token streams and generate code. Unlike derive macros (which only work on structs/enums) and attribute macros (which modify items), function-like macros can accept any token syntax and are ideal for creating DSLs. Use parse_macro_input! or manual TokenStream parsing to handle the input.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function-Like Proc Macros — my_macro!() Code Generation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse proc_macro::TokenStream;\nuse quote::quote;\nuse syn::{parse_macro_input, Ident, LitInt, LitStr, Token};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function-Like Proc Macros — my_macro!() Code Generation — common patterns you'll see in production.\n// APPROACH  - Combine Function-Like Proc Macros — my_macro!() Code Generation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Generate enum from list ─────────────────────────\n// Usage: color_enum!(Red, Green, Blue)\n#[proc_macro]\npub fn color_enum(input: TokenStream) -> TokenStream {\n    let colors = parse_macro_input!(input with syn::punctuated::Punctuated::<Ident, Token![,]>::parse_terminated);\n\n    let variants = colors.iter();\n    let strs = colors.iter().map(|c| c.to_string());\n\n    let expanded = quote! {\n        #[derive(Debug, Clone, Copy, PartialEq, Eq)]\n        pub enum Color {\n            #(#variants),*\n        }\n\n        impl Color {\n            pub fn as_str(&self) -> &'static str {\n                match self {\n                    #(Self::#variants => #strs),*\n                }\n            }\n        }\n    };\n\n    TokenStream::from(expanded)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function-Like Proc Macros — my_macro!() Code Generation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Generate state machine ──────────────────────────,// Usage: state_machine! { Start => Running => Stopped },#[proc_macro],pub fn state_machine(input: TokenStream) -> TokenStream {,    let input_str = input.to_string();,    let states: Vec<&str> = input_str,        .split(\"=>\"),        .map(|s| s.trim()),        .collect();,,    let state_idents: Vec<Ident> = states.iter(),        .map(|s| syn::Ident::new(s, proc_macro2::Span::call_site())),        .collect();,,    let expanded = quote! {,        #[derive(Debug, Clone, Copy, PartialEq, Eq)],        pub enum State {,            #(#state_idents),*,        },    };,,    TokenStream::from(expanded),},\n\n// ── Custom DSL for configuration ────────────────────,// Usage: config! { app_name = \"MyApp\", port = 8080, debug = true },#[proc_macro],pub fn config(input: TokenStream) -> TokenStream {,    // Manual parsing: key = value pairs,    let items = parse_macro_input!(input with syn::punctuated::Punctuated::<syn::MetaNameValue, Token![,]>::parse_terminated);,,    let configs = items.iter().map(|item| {,        let key = &item.path;,        let val = &item.value;,        quote! {,            stringify!(#key) => #val,,        },    });,,    let expanded = quote! {,        pub fn get_config(key: &str) -> Option<&'static str> {,            Some(match key {,                #(#configs)*,                _ => return None,,            }),        },    };,,    TokenStream::from(expanded),},\n\n// ── Generate test suite ─────────────────────────────,// Usage: test_suite!(\"add\", add(2, 3, 5), add(1, 1, 2)),#[proc_macro],pub fn test_suite(input: TokenStream) -> TokenStream {,    let input_str = input.to_string();,    // ... parse test cases,,    let expanded = quote! {,        #[cfg(test)],        mod tests {,            use super::*;,\n\n            // Generated test functions here,        },    };,,    TokenStream::from(expanded),}"
                  }
        ],
        tips: [
                  "Function-like macros are ideal for DSLs — parse custom syntax and generate code.",
                  "Use parse_macro_input! with syn::punctuated::Punctuated for comma-separated lists.",
                  "For complex syntax, consider using synstructure or write custom parsing.",
                  "Test proc macros by using cargo expand or by writing integration tests."
        ],
        mistake: "Making function-like macros when a simple function would work — macros are for compile-time code generation, not runtime logic.",
        shorthand: {
          verbose: "// Runtime configuration (verbose, error-prone)\npub fn get_color() -> &'static str {\n  if cfg!(debug_assertions) { \"Red\" } else { \"Blue\" }\n}",
          concise: "color_enum!(Red, Green, Blue)\n// generates enum and methods at compile time",
        },
      },
      {
        id: "tracing-macros",
        fn: "Tracing Macros — Structured Logging & Instrumentation",
        desc: "Use tracing crate macros for structured logging: #[instrument], info!, debug!, span!, and async-aware tracing.",
        category: "Macros",
        subtitle: "#[instrument], info!, debug!, warn!, error!, span!, event!, parent",
        signature: "#[instrument]  |  info!(key = value, \"message\")  |  span!(Level::INFO, \"operation\")",
        descLong: "The tracing crate provides macros for structured logging with context. #[instrument] auto-logs function entry/exit and arguments. Logging macros (info!, debug!, etc.) use key=value structured fields instead of format strings. span! creates a traced scope with parent-child relationships. Integrates with tokio async and provides correlation IDs across async boundaries. Much more powerful than println! for debugging distributed systems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tracing Macros — Structured Logging & Instrumentation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse tracing::{debug, info, warn, error, span, instrument, Level};\nuse tracing_subscriber;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tracing Macros — Structured Logging & Instrumentation — common patterns you'll see in production.\n// APPROACH  - Combine Tracing Macros — Structured Logging & Instrumentation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Initialize tracing subscriber ───────────────────\nfn init_tracing() {\n    tracing_subscriber::fmt()\n        .with_max_level(Level::INFO)\n        .init();\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tracing Macros — Structured Logging & Instrumentation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── #[instrument] — auto-log entry/exit ────────────,#[instrument(level = \"info\")],pub fn create_user(name: &str, email: &str) -> Result<u64, String> {,    debug!(\"Creating user with name={}, email={}\", name, email);,    let id = 42u64;,    info!(user_id = id, \"User created successfully\");,    Ok(id),},\n\n// ── Structured logging with fields ───────────────────,pub fn process_request(request_id: &str, user_id: u64) {,    info!(,        request_id = request_id,,        user_id = user_id,,        status = \"received\",,        \"Processing request\",    );,,    debug!(,        bytes_received = 1024,,        \"Request parsed\",    );,,    warn!(,        duration_ms = 150,,        \"Request took longer than expected\",    );,},\n\n// ── Nested spans ────────────────────────────────────,#[instrument(level = \"info\")],async fn process_batch(items: Vec<String>) {,    for item in items {,        let span = span!(Level::DEBUG, \"process_item\", item = %item);,        let _enter = span.enter();,        debug!(\"Processing\");,    },},\n\n// ── Manual span creation ────────────────────────────,pub fn calculate(a: i32, b: i32) -> i32 {,    let span = span!(,        Level::INFO,,        \"calculate\",,        operands = ?vec![a, b],,    );,    let _guard = span.enter();,,    info!(op = \"add\", \"Starting calculation\");,    let result = a + b;,    info!(result, \"Calculation complete\");,    result,},\n\n// ── Error handling with context ─────────────────────,#[instrument(level = \"info\", skip(db))],pub async fn fetch_user(,    user_id: u64,,    db: &Database,,) -> Result<User, AppError> {,    debug!(\"Fetching from database\");,    let user = db.get(user_id),        .await,        .map_err(|e| {,            error!(error = %e, \"Database fetch failed\");,            AppError::NotFound,        })?;,,    info!(user_name = %user.name, \"User fetched\");,    Ok(user),},\n\n// ── Skip sensitive data ─────────────────────────────,#[instrument(skip(password))],pub fn authenticate(username: &str, password: &str) -> bool {,    info!(username, \"Attempting authentication\");,    // password is NOT logged due to skip,    username == \"admin\",},\n\n// ── Custom error span ───────────────────────────────,pub fn handle_error(err: Box<dyn std::error::Error>) {,    error!(,        error = %err,,        backtrace = ?std::backtrace::Backtrace::capture(),,        \"An error occurred\",    );,}"
                  }
        ],
        tips: [
                  "#[instrument] automatically logs all function arguments — use skip(arg) for sensitive data like passwords.",
                  "Structured fields (key = value) are searchable/filterable — much better than unstructured format strings.",
                  "Spans provide parent-child relationships and context — use span!() to create explicit scopes.",
                  "tracing_subscriber::fmt() is the most common subscriber — use with .with_max_level() to control verbosity."
        ],
        mistake: "Using println!() or log crate instead of tracing — misses async context, parent-child relationships, and structured filtering.",
        shorthand: {
          verbose: "// Manual logging (verbose, unstructured)\nprintln!(\"User {} created with email {}\", name, email);\nprintln!(\"Success\");",
          concise: "#[instrument]\npub fn create_user(name: &str, email: &str) {\n  info!(\"User created successfully\");\n}",
        },
      },
      {
        id: "serde-macros",
        fn: "Serde Derive Macros — Field Attributes & Custom Serialization",
        desc: "Master serde attributes: #[serde(rename)], #[serde(skip)], #[serde(flatten)], and custom serializers.",
        category: "Macros",
        subtitle: "#[serde(...)], rename, skip, skip_serializing, default, flatten, with",
        signature: "#[serde(rename = \"newName\")]  |  #[serde(skip)]  |  #[serde(flatten)]  |  #[serde(serialize_with = \"...\")]",
        descLong: "Serde derive macros are highly configurable. Field attributes control JSON representation: #[serde(rename)] changes field name, #[serde(skip)] excludes from serialization, #[serde(default)] provides defaults for deserialization, #[serde(flatten)] merges nested structs. Custom serializers with #[serde(serialize_with/deserialize_with)] handle special types. Struct-level #[serde(...)] sets defaults for all fields.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Serde Derive Macros — Field Attributes & Custom Serialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse serde::{Serialize, Deserialize, Serializer, Deserializer};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Serde Derive Macros — Field Attributes & Custom Serialization — common patterns you'll see in production.\n// APPROACH  - Combine Serde Derive Macros — Field Attributes & Custom Serialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Rename fields for camelCase JSON ────────────────\n#[derive(Serialize, Deserialize)]\n#[serde(rename_all = \"camelCase\")]\nstruct User {\n    first_name: String,      // becomes \"firstName\"\n    last_name: String,       // becomes \"lastName\"\n    email_address: String,   // becomes \"emailAddress\"\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Serde Derive Macros — Field Attributes & Custom Serialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Skip fields ─────────────────────────────────────,#[derive(Serialize, Deserialize)],struct ApiRequest {,    id: u64,,,    #[serde(skip)],    internal_state: String,  // never serialized or deserialized,,    #[serde(skip_serializing_if = \"Option::is_none\")],    optional_data: Option<String>,  // omit if None,,    #[serde(skip_deserializing)],    computed: String,        // only serialize, use Default on deserialize,},\n\n// ── Flatten nested structs ──────────────────────────,#[derive(Serialize, Deserialize)],struct Response {,    status: u16,,    message: String,,,    #[serde(flatten)],    data: UserData,  // fields from UserData merge into Response,},,#[derive(Serialize, Deserialize)],struct UserData {,    id: u64,,    name: String,,},\n\n// Serializes as: {\"status\": 200, \"message\": \"ok\", \"id\": 1, \"name\": \"Alice\"},\n\n// ── Custom serialize/deserialize ────────────────────,fn serialize_timestamp<S>(ts: &u64, ser: S) -> Result<S::Ok, S::Error>,where,    S: Serializer,,{,    use chrono::{DateTime, Utc};,    let dt = DateTime::<Utc>::from_timestamp(*ts as i64, 0),        .unwrap(),        .to_rfc3339();,    ser.serialize_str(&dt),},,fn deserialize_timestamp<'de, D>(de: D) -> Result<u64, D::Error>,where,    D: Deserializer<'de>,,{,    let s = String::deserialize(de)?;,    let dt = chrono::DateTime::parse_from_rfc3339(&s),        .map_err(serde::de::Error::custom)?;,    Ok(dt.timestamp() as u64),},,#[derive(Serialize, Deserialize)],struct Event {,    name: String,,,    #[serde(serialize_with = \"serialize_timestamp\", deserialize_with = \"deserialize_timestamp\")],    timestamp: u64,,},\n\n// ── Default values ──────────────────────────────────,#[derive(Deserialize)],struct Config {,    #[serde(default)],    debug: bool,             // false if missing,,    #[serde(default = \"default_port\")],    port: u16,               // 8080 if missing,,    #[serde(default = \"Vec::new\")],    tags: Vec<String>,       // [] if missing,},,fn default_port() -> u16 {,    8080,},\n\n// ── Enum variants ───────────────────────────────────,#[derive(Serialize, Deserialize)],#[serde(rename_all = \"snake_case\")],#[serde(tag = \"type\")]  // use \"type\" field for variant,enum Status {,    #[serde(rename = \"in_progress\")],    InProgress { percent: u32 },,    Complete { result: String },,    Failed { error: String },,},\n\n// Serializes as: {\"type\":\"in_progress\",\"percent\":50}"
                  }
        ],
        tips: [
                  "#[serde(rename_all = \"camelCase\")] applies to all fields — more DRY than per-field #[serde(rename)].",
                  "#[serde(flatten)] is perfect for pagination/metadata patterns — metadata struct fields merge into response.",
                  "#[serde(default)] avoids Option<T> boilerplate — use for fields with sensible defaults.",
                  "#[serde(serialize_with/deserialize_with)] handles custom types — useful for timestamps, UUIDs, special encoding."
        ],
        mistake: "Making all fields Option<T> instead of using #[serde(default)] — bloats types and adds .unwrap() noise.",
        shorthand: {
          verbose: "// Manual custom serialization (verbose)\nimpl Serialize for Event {\n  fn serialize<S>(&self, ser: S) -> Result<S::Ok, S::Error> {\n    let ts_str = format!(\"{}\", self.timestamp);\n    // ... custom code\n  }\n}",
          concise: "#[serde(serialize_with = \"serialize_timestamp\")]\ntimestamp: u64,",
        },
      },
      {
        id: "derive-builder",
        fn: "Derive Builder Pattern — #[derive(Builder)] Macro",
        desc: "Use derive_builder crate: auto-generate builder methods, optional fields, and .build() validation.",
        category: "Macros",
        subtitle: "#[derive(Builder)], #[builder(...)], Option<T> fields, .build()",
        signature: "#[derive(Builder)]  struct MyStruct { field: Type, }  |  MyStruct::builder().field(val).build()?",
        descLong: "The derive_builder crate automatically generates the Builder pattern. Decorate a struct with #[derive(Builder)] to generate a FooBuilder type with setter methods for each field. Optional fields become Option<T> in the builder. The .build() method returns Result with validation errors. Builder methods take self and return self for chaining. Supports #[builder(default)] for fields with defaults, #[builder(setter(into))] for Into conversions, and custom validators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Derive Builder Pattern — #[derive(Builder)] Macro — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse derive_builder::Builder;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Derive Builder Pattern — #[derive(Builder)] Macro — common patterns you'll see in production.\n// APPROACH  - Combine Derive Builder Pattern — #[derive(Builder)] Macro with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic builder generation ────────────────────────\n#[derive(Builder, Debug)]\npub struct User {\n    id: u64,\n    name: String,\n    email: String,\n\n    #[builder(default = \"true\")]\n    active: bool,\n\n    #[builder(setter(into))]\n    bio: Option<String>,  // Into<String> accepted\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Derive Builder Pattern — #[derive(Builder)] Macro — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Generated code equivalent to:,// pub struct UserBuilder {,//     id: Option<u64>,,//     name: Option<String>,,//     email: Option<String>,,//     active: Option<bool>,,//     bio: Option<String>,,// },//,// impl UserBuilder {,//     pub fn id(&mut self, value: u64) -> &mut Self { ... },//     pub fn name(&mut self, value: String) -> &mut Self { ... },//     // ... etc,//     pub fn build(&self) -> Result<User, UserBuilderError> { ... },// },\n\n// ── Usage with chaining ─────────────────────────────,fn main() {,    let user = User::builder(),        .id(1),        .name(\"Alice\".to_string()),        .email(\"alice@example.com\".to_string()),        .active(true),        .bio(\"Software engineer\".to_string()),        .build(),        .expect(\"Failed to build user\");,,    println!(\"{:?}\", user);,},\n\n// ── With custom validation ──────────────────────────,#[derive(Builder, Debug)],#[builder(build_fn(validate = \"Self::validate\"))],pub struct Config {,    port: u16,,    workers: usize,,,    #[builder(default = \"false\")],    debug: bool,,},,impl ConfigBuilder {,    fn validate(&self) -> Result<Config, String> {,        let port = self.port.ok_or(\"port required\")?;,        let workers = self.workers.ok_or(\"workers required\")?;,,        if workers == 0 {,            return Err(\"workers must be > 0\".to_string());,        },        if port < 1024 && !self.debug.unwrap_or(false) {,            return Err(\"port < 1024 requires debug mode\".to_string());,        },,        Ok(Config {,            port,,            workers,,            debug: self.debug.unwrap_or(false),,        }),    },},\n\n// ── Setter customization ────────────────────────────,#[derive(Builder)],pub struct HttpClient {,    #[builder(setter(into))],    base_url: String,  // accepts &str, String, etc. via Into,,    #[builder(default = \"30\")],    timeout_secs: u64,,,    #[builder(setter(skip))],    internal_state: String,  // not settable via builder,},\n\n// Usage:,let client = HttpClient::builder(),    .base_url(\"https://api.example.com\")  // &str accepted via Into<String>,    .timeout_secs(60),    .build()?;,\n\n// ── Default factory method ──────────────────────────,#[derive(Builder)],#[builder(build_fn(name = \"build_default\"))],pub struct Request {,    path: String,,,    #[builder(default = \"\"GET\".to_string()\")],    method: String,,},\n\n// Custom constructor:,impl Request {,    pub fn new(path: impl Into<String>) -> RequestBuilder {,        Request::builder().path(path.into()),    },}"
                  }
        ],
        tips: [
                  "#[builder(default = \"expr\")] provides compile-time defaults — more ergonomic than Option<T>.",
                  "#[builder(setter(into))] uses Into trait — allows more flexible input types (e.g. &str, String).",
                  "Custom validation in #[builder(build_fn(validate = \"Self::validate\"))] centralizes error checking.",
                  "Builders avoid forcing all fields on construction — optional fields are genuinely optional in the API."
        ],
        mistake: "Not using the builder pattern when you have many optional fields — forces clients to pass None repeatedly.",
        shorthand: {
          verbose: "// Constructor with many optional args (verbose)\npub fn new(id: u64, name: String, email: String, bio: Option<String>) -> Self {\n  Self { id, name, email, bio }\n}",
          concise: "#[derive(Builder)]\npub struct User { id: u64, name: String, email: String, ... }\n// builder() is auto-generated",
        },
      },
    ],
  },

  // ── Section 3: Unsafe Code & FFI ─────────────────────────────────────────
  {
    id: "unsafe-ffi",
    title: "Unsafe Code & FFI",
    entries: [
      {
        id: "unsafe-rust",
        fn: "unsafe — Raw Pointers, FFI & Low-Level Control",
        desc: "Use unsafe for raw pointers, C FFI, custom allocators, and performance-critical code with careful invariant maintenance.",
        category: "Unsafe",
        subtitle: "unsafe block, *const T, *mut T, extern \"C\", #[no_mangle], transmute",
        signature: "unsafe { *ptr }  |  extern \"C\" fn  |  #[link(name = \"...\")]  |  std::mem::transmute",
        descLong: "unsafe blocks opt out of some Rust safety guarantees. Five unsafe superpowers: dereference raw pointers, call unsafe functions, access mutable statics, implement unsafe traits, and access union fields. FFI (Foreign Function Interface) with extern \"C\" calls C libraries from Rust and exposes Rust functions to C. Raw pointers (*const T, *mut T) enable pointer arithmetic and null pointers. The key principle: unsafe does not disable the borrow checker — it just allows additional operations. Keep unsafe blocks minimal and wrap them in safe abstractions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of unsafe — Raw Pointers, FFI & Low-Level Control — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Raw pointers ────────────────────────────────────\nfn raw_pointer_basics() {\n    let x = 42;\n    let r: *const i32 = &x;       // raw pointer from reference\n    let m: *mut i32 = &x as *const i32 as *mut i32;\n\n    unsafe {\n        println!(\"r = {}\", *r);    // dereference requires unsafe\n        *m = 99;                    // write through raw pointer\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of unsafe — Raw Pointers, FFI & Low-Level Control — common patterns you'll see in production.\n// APPROACH  - Combine unsafe — Raw Pointers, FFI & Low-Level Control with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Pointer arithmetic\n    let arr = [10, 20, 30, 40, 50];\n    let ptr = arr.as_ptr();\n    unsafe {\n        let third = *ptr.add(2);   // pointer offset\n        assert_eq!(third, 30);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of unsafe — Raw Pointers, FFI & Low-Level Control — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Null pointer (no Option needed),    let null_ptr: *const i32 = std::ptr::null();,    assert!(null_ptr.is_null());,},\n\n// ── Calling C from Rust (FFI) ───────────────────────,// Link to C library,#[link(name = \"m\")]  // libm (math library),extern \"C\" {,    fn sqrt(x: f64) -> f64;,    fn pow(base: f64, exp: f64) -> f64;,    fn abs(x: i32) -> i32;,},,fn use_c_math() {,    unsafe {,        let result = sqrt(144.0);  // C function call requires unsafe,        println!(\"sqrt(144) = {}\", result);  // 12.0,,        let power = pow(2.0, 10.0);,        println!(\"2^10 = {}\", power);  // 1024.0,    },},\n\n// ── Exposing Rust to C ──────────────────────────────,#[no_mangle]  // prevent name mangling,pub extern \"C\" fn rust_add(a: i32, b: i32) -> i32 {,    a + b,},\n\n// C header: int32_t rust_add(int32_t a, int32_t b);,\n\n// ── CString for C interop ───────────────────────────,use std::ffi::{CStr, CString};,,fn string_interop() {,    // Rust → C: add null terminator,    let c_str = CString::new(\"hello\").unwrap();,    let ptr = c_str.as_ptr();,    // pass ptr to C function,\n\n    // C → Rust: read null-terminated string,    unsafe {,        let from_c: &CStr = CStr::from_ptr(ptr);,        let rust_str: &str = from_c.to_str().unwrap();,        println!(\"{}\", rust_str);,    },},\n\n// ── Safe abstraction over unsafe ────────────────────,// The Rust pattern: unsafe implementation, safe interface,pub struct AlignedBuffer {,    ptr: *mut u8,,    len: usize,,},,impl AlignedBuffer {,    pub fn new(size: usize, align: usize) -> Self {,        let layout = std::alloc::Layout::from_size_align(size, align),            .expect(\"invalid layout\");,        let ptr = unsafe { std::alloc::alloc_zeroed(layout) };,        if ptr.is_null() {,            std::alloc::handle_alloc_error(layout);,        },        Self { ptr, len: size },    },\n\n    // Safe interface — callers don't use unsafe,    pub fn as_slice(&self) -> &[u8] {,        unsafe { std::slice::from_raw_parts(self.ptr, self.len) },    },},,impl Drop for AlignedBuffer {,    fn drop(&mut self) {,        let layout = std::alloc::Layout::from_size_align(self.len, 1),            .unwrap();,        unsafe { std::alloc::dealloc(self.ptr, layout); },    },},\n\n// ── bindgen for automatic C bindings ────────────────,// Cargo.toml: [build-dependencies] bindgen = \"0.69\",// build.rs generates Rust bindings from C headers automatically,// bindgen::Builder::default(),//     .header(\"wrapper.h\"),//     .generate(),//     .write_to_file(out_path.join(\"bindings.rs\"))"
                  }
        ],
        tips: [
                  "Keep unsafe blocks as small as possible — wrap them in safe functions that maintain invariants, so callers never need unsafe.",
                  "bindgen auto-generates Rust FFI bindings from C headers — do not write extern \"C\" declarations by hand for large APIs.",
                  "CString::new(\"...\") for Rust→C strings (adds null terminator). CStr::from_ptr() for C→Rust strings (reads null-terminated).",
                  "unsafe does NOT disable the borrow checker — it only allows 5 specific operations. All other Rust safety rules still apply."
        ],
        mistake: "Using transmute to convert between types instead of safe alternatives — transmute bypasses all type checking and can cause undefined behavior. Use as casts, From/Into, or bytemuck for safe type punning.",
        shorthand: {
          verbose: "// Manual raw pointer arithmetic (verbose)\nlet ptr = arr.as_ptr();\nlet offset_ptr = std::mem::transmute::<*const i32, usize>(ptr) + 8;\nlet result = *(transmute::<usize, *const i32>(offset_ptr));",
          concise: "let arr = [10, 20, 30];\nlet ptr = arr.as_ptr();\nunsafe { *ptr.add(1) }  // pointer offset",
        },
      },
    ],
  },
]

export default { meta, sections }
