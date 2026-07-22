export const meta = {
  "id": "rust-core",
  "label": "Core Syntax & Ownership",
  "icon": "🦀",
  "description": "Rust fundamentals: variables, ownership, borrowing, control flow, functions, and error handling."
}

export const sections = [

  // ── Section 1: Variables & Types ─────────────────────────────────────────
  {
    id: "variables-types",
    title: "Variables & Types",
    entries: [
      {
        id: "let-binding",
        fn: "Variable Binding with let",
        desc: "Immutable variable declaration.",
        category: "Variables",
        subtitle: "Immutable by default",
        signature: "let name: Type = value;",
        descLong: "In Rust, variables are immutable by default. Use `let` to declare an immutable binding. Type annotations are optional when the compiler can infer the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variable Binding with let — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name: &str = \"Rust\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variable Binding with let — common patterns you'll see in production.\n// APPROACH  - Combine Variable Binding with let with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// This will not compile:\n    // x = 6;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variable Binding with let — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"x: {}, y: {}, name: {}\", x, y, name);\n}"
                  }
        ],
        tips: [
                  "Use `let` for immutable bindings by default",
                  "Add `: Type` for explicit type annotations",
                  "Omit type annotation when compiler can infer it"
        ],
        mistake: "Trying to reassign to a `let` binding without `mut` keyword.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "let-mut",
        fn: "Mutable Variables",
        desc: "Variable binding that can be reassigned.",
        category: "Variables",
        subtitle: "Controlled mutability",
        signature: "let mut name: Type = value;",
        descLong: "Add the `mut` keyword to make a variable mutable. This allows reassignment and in-place mutation after binding. Mutability is explicit — the compiler rejects mutations on non-mut bindings. Unlike shadowing, mut keeps the same binding and cannot change the type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mutable Variables — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    // ── Reassignment ──\n    let mut counter = 0;\n    counter += 1;\n    counter += 1;\n    println!(\"counter: {}\", counter); // 2"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mutable Variables — common patterns you'll see in production.\n// APPROACH  - Combine Mutable Variables with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── In-place mutation via methods ──\n    let mut text = String::from(\"Hello\");\n    text.push_str(\", world\");\n    text.push('!');\n    println!(\"{}\", text); // Hello, world!"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mutable Variables — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Mutable Vec — push, pop, sort ──,    let mut scores = vec![88, 72, 95, 64];,    scores.push(100);,    scores.sort();,    println!(\"sorted: {:?}\", scores); // [64, 72, 88, 95, 100],\n\n    // ── mut does NOT allow type change ──,    let mut x = 5;,    x = 10;       // OK — same type (i32),    // x = \"ten\"; // ERROR: expected integer, found &str,    //            // (use shadowing if you need a type change),    println!(\"x: {}\", x);,\n\n    // ── Unused mut warning ──,    // The compiler warns if you mark mut but never mutate:,    // let mut unused = 42;  // warning: variable does not need to be mutable,}"
                  }
        ],
        tips: [
                  "Only add `mut` when the value will actually change — the compiler warns on unused mut",
                  "mut allows reassignment AND in-place mutation (.push(), .sort(), etc.)",
                  "mut cannot change the type — use shadowing (`let x = ...`) for type transformations",
                  "Prefer immutable bindings by default; add mut only when needed",
                  "mut on a binding is separate from &mut references — a value can be immutably bound but mutably borrowed"
        ],
        mistake: "Assuming `mut` lets you change the type (e.g., `let mut x = 5; x = \"five\"`) — that requires shadowing with a new `let`.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "shadowing",
        fn: "Variable Shadowing",
        desc: "Reusing a variable name with a new binding.",
        category: "Variables",
        subtitle: "Rebind with new type",
        signature: "let x = value1; let x = value2;",
        descLong: "Shadowing allows you to declare a new variable with the same name, effectively replacing the old binding. Unlike mutation, shadowing creates a brand-new variable and can change the type. Inner-scope shadows drop when the block ends, restoring the outer binding.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variable Shadowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    // ── Basic shadowing: reuse the name, transform the value ──\n    let x = 5;\n    let x = x + 1;          // x is now 6 (new binding, old x is gone)\n    let x = x * 2;          // x is now 12\n    println!(\"x: {}\", x);   // 12"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variable Shadowing — common patterns you'll see in production.\n// APPROACH  - Combine Variable Shadowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Type-changing shadow: &str → usize ──\n    let spaces = \"   \";\n    let spaces = spaces.len();   // shadows &str with usize\n    println!(\"spaces: {}\", spaces); // 3"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variable Shadowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Shadowing vs mut ──,    // With mut you CANNOT change the type:,    //   let mut y = \"hello\";,    //   y = y.len();  // ERROR: expected &str, found usize,    //,    // With shadowing you CAN:,    let y = \"hello\";,    let y = y.len();  // fine — new binding, new type,    println!(\"y: {}\", y);   // 5,\n\n    // ── Block-scoped shadow: outer binding resurfaces ──,    let val = 10;,    {,        let val = val + 20;       // inner shadow,        println!(\"inner val: {}\", val);  // 30,    },    println!(\"outer val: {}\", val);      // 10 — inner shadow dropped,\n\n    // ── Shadowing in a loop ──,    let data = vec![\"42\", \"not_a_number\", \"7\"];,    for item in &data {,        let item: Result<i32, _> = item.parse();  // shadow &str with Result,        match item {,            Ok(n)  => println!(\"parsed: {}\", n),,            Err(_) => println!(\"skip non-numeric\"),,        },    },}"
                  }
        ],
        tips: [
                  "Shadowing creates a completely new binding — the old value is dropped (or kept if still borrowed)",
                  "Use shadowing for type transformations like parsing: let input = input.trim().parse::<i32>()",
                  "Inner-block shadows vanish at `}`, restoring the outer binding — great for temporary overrides",
                  "Prefer shadowing over mut when the variable is only \"set once then transformed\"",
                  "Compiler warns on unused bindings, helping catch accidental shadows"
        ],
        mistake: "Confusing shadowing with mutation — `let x = x + 1` drops the old x and creates a new one, which matters for ownership and borrowing.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "type-inference",
        fn: "Type Inference",
        desc: "Compiler deduces variable types automatically.",
        category: "Types",
        subtitle: "Explicit when needed",
        signature: "let x = value; // type inferred",
        descLong: "Rust's compiler is powerful enough to infer types in most cases. You only need explicit annotations when ambiguity exists or for clarity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Inference — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let number = 42;\n    let float = 3.14;\n    let text = \"hello\";\n    let is_true = true;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Inference — common patterns you'll see in production.\n// APPROACH  - Combine Type Inference with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Compiler infers types:\n    // number: i32, float: f64, text: &str, is_true: bool"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Inference — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// When ambiguity exists, add annotation:,    let result: f32 = \"3.14\".parse().unwrap();,,    println!(\"{} {} {} {}\", number, float, text, is_true);,}"
                  }
        ],
        tips: [
                  "Use type inference for simple cases",
                  "Add annotations for ambiguous types like parse()",
                  "Annotations improve code readability in complex code"
        ],
        mistake: "Omitting type annotation when compiler cannot infer (e.g., with generic parse()).",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "primitives",
        fn: "Primitive Types",
        desc: "Built-in scalar and compound types.",
        category: "Types",
        subtitle: "Numbers, bools, chars",
        signature: "i32, u64, f32, f64, bool, char, (T1, T2)",
        descLong: "Rust has fixed-size integers (i8-i128, u8-u128), floats (f32, f64), booleans, characters, and tuples. All primitives are Copy.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Primitive Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let integer: i32 = -42;\n    let unsigned: u32 = 100;\n    let float: f64 = 3.14159;\n    let boolean: bool = true;\n    let character: char = 'R';\n    let tuple: (i32, &str, bool) = (42, \"rust\", true);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Primitive Types — common patterns you'll see in production.\n// APPROACH  - Combine Primitive Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Primitive Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"int: {}, uint: {}\", integer, unsigned);\n    println!(\"float: {}, bool: {}, char: {}\", float, boolean, character);\n    println!(\"tuple: {:?}\", tuple);\n}"
                  }
        ],
        tips: [
                  "Integers default to i32, floats to f64",
                  "Use suffixes for clarity: 42i64, 3.14f32",
                  "All primitives are Copy and stack-allocated"
        ],
        mistake: "Mixing signed and unsigned integers without explicit casting.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Ownership & Borrowing ─────────────────────────────────────────
  {
    id: "ownership-borrowing",
    title: "Ownership & Borrowing",
    entries: [
      {
        id: "ownership-move",
        fn: "Ownership & Move Semantics",
        desc: "Every value has one owner; ownership can transfer.",
        category: "Ownership",
        subtitle: "Values have owners",
        signature: "let s2 = s1; // move if heap-allocated",
        descLong: "In Rust, each value has exactly one owner. When you assign a heap-allocated value to another variable, ownership moves (transfers). The original variable can no longer be used.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Ownership & Move Semantics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let s1 = String::from(\"hello\");\n    let s2 = s1;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Ownership & Move Semantics — common patterns you'll see in production.\n// APPROACH  - Combine Ownership & Move Semantics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// s1 is no longer valid after move\n    // println!(\"{}\", s1); // ERROR\n\n    println!(\"{}\", s2);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Ownership & Move Semantics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet x = 5;\n    let y = x;\n    // x is still valid (i32 is Copy)\n    println!(\"{}, {}\", x, y);\n}"
                  }
        ],
        tips: [
                  "Heap-allocated types (String, Vec) move; stack types (i32, bool) copy",
                  "Move transfers ownership completely",
                  "Original variable becomes invalid after move"
        ],
        mistake: "Trying to use a variable after its value has been moved elsewhere.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "borrowing-immutable",
        fn: "Immutable Borrowing",
        desc: "Share read-only reference without transferring ownership.",
        category: "Borrowing",
        subtitle: "Read-only reference &T",
        signature: "let r = &value; // immutable borrow",
        descLong: "Use `&value` to create an immutable reference. You can have unlimited immutable references, and the original owner retains ownership. Borrowing does not transfer ownership.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Immutable Borrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let s = String::from(\"hello\");\n\n    let r1 = &s;\n    let r2 = &s;\n\n    println!(\"r1: {}, r2: {}\", r1, r2);\n    println!(\"s: {}\", s);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Immutable Borrowing — common patterns you'll see in production.\n// APPROACH  - Combine Immutable Borrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn print_length(s: &String) {\n        println!(\"Length: {}\", s.len());\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Immutable Borrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprint_length(&s);\n    println!(\"s still valid: {}\", s);\n}"
                  }
        ],
        tips: [
                  "Use `&T` for immutable references",
                  "Unlimited immutable references allowed",
                  "Original owner can still use the value"
        ],
        mistake: "Mixing immutable and mutable references; you cannot have both at once.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "borrowing-mutable",
        fn: "Mutable Borrowing",
        desc: "Exclusive mutable reference without transferring ownership.",
        category: "Borrowing",
        subtitle: "Exclusive &mut T",
        signature: "let r = &mut value;",
        descLong: "Use `&mut value` to create a mutable reference. Only one mutable reference can exist at a time for a given value. This ensures safe mutation without data races.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mutable Borrowing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut s = String::from(\"hello\");\n\n    let r1 = &mut s;\n    r1.push_str(\" world\");\n\n    println!(\"{}\", r1);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mutable Borrowing — common patterns you'll see in production.\n// APPROACH  - Combine Mutable Borrowing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn change_string(s: &mut String) {\n        s.push_str(\"!\");\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mutable Borrowing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet mut s2 = String::from(\"rust\");\n    change_string(&mut s2);\n    println!(\"{}\", s2);\n}"
                  }
        ],
        tips: [
                  "Use `&mut T` for exclusive mutable references",
                  "Only one mutable reference at a time",
                  "Cannot mix immutable and mutable references"
        ],
        mistake: "Creating multiple mutable references to the same value.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "lifetimes-basic",
        fn: "Lifetimes",
        desc: "Lifetime parameters ensure references live long enough.",
        category: "Borrowing",
        subtitle: "Reference validity 'a",
        signature: "fn func<'a>(x: &'a str) -> &'a str",
        descLong: "Lifetimes are Rust's way of ensuring references are valid. The lifetime 'a is a parameter indicating how long a reference is valid. Most lifetimes are elided by the compiler.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lifetimes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let string1 = String::from(\"abcd\");\n    let string2 = \"xyz\";\n\n    let result = longest(&string1, string2);\n    println!(\"Longest: {}\", result);\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lifetimes — common patterns you'll see in production.\n// APPROACH  - Combine Lifetimes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn longest<'a>(x: &'a str, y: &'a str) -> &'a str {\n    if x.len() > y.len() {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lifetimes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nx\n    } else {\n        y\n    }\n}"
                  }
        ],
        tips: [
                  "Lifetimes prevent use-after-free bugs",
                  "Most lifetimes are elided automatically",
                  "Explicit lifetimes needed when compiler cannot infer"
        ],
        mistake: "Returning a reference to a local variable; the reference would outlive the value.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "slice-types",
        fn: "Slice Types",
        desc: "Reference to a contiguous sequence of elements.",
        category: "Borrowing",
        subtitle: "Contiguous reference",
        signature: "&[T], &str",
        descLong: "Slices are references to contiguous sequences without owning them. String slices (&str) and array slices (&[T]) provide views into collections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Slice Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let arr = [1, 2, 3, 4, 5];\n    let slice = &arr[1..3];\n    println!(\"Slice: {:?}\", slice);\n\n    let s = String::from(\"hello world\");\n    let word = &s[0..5];\n    println!(\"Word: {}\", word);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Slice Types — common patterns you'll see in production.\n// APPROACH  - Combine Slice Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet s2 = \"hello\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Slice Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet slice_str: &str = &s2[0..3];\n    println!(\"Slice str: {}\", slice_str);\n}"
                  }
        ],
        tips: [
                  "Slices are non-owning references",
                  "Use ranges: `&arr[1..3]` excludes end index",
                  "String slices (&str) cannot be indexed by char"
        ],
        mistake: "Creating a slice that crosses UTF-8 boundaries in strings.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "borrowing-rules",
        fn: "Borrowing Rules Summary",
        desc: "Core rules: one owner, many readers OR one writer.",
        category: "Borrowing",
        subtitle: "Memory safety guarantees",
        signature: "&T (read), &mut T (write), T (own)",
        descLong: "The fundamental borrowing rules: At any time, either one mutable reference OR unlimited immutable references. No mixing. These prevent data races and use-after-free bugs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Borrowing Rules Summary — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut x = 5;\n\n    let r1 = &x;\n    let r2 = &x;\n    println!(\"r1: {}, r2: {}\", r1, r2);\n    // No more uses of r1 and r2 after this point\n\n    let r3 = &mut x;\n    *r3 = 10;\n    println!(\"x: {}\", x);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Borrowing Rules Summary — common patterns you'll see in production.\n// APPROACH  - Combine Borrowing Rules Summary with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// After r3 is no longer used:\n    let r4 = &x;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Borrowing Rules Summary — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"r4: {}\", r4);\n}"
                  }
        ],
        tips: [
                  "Scopes matter: references become inactive after last use",
                  "Compiler enforces these rules at compile time",
                  "Rule violations result in compile-time errors, not runtime panics"
        ],
        mistake: "Using an immutable reference alongside a mutable reference to the same value.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Control Flow ─────────────────────────────────────────
  {
    id: "control-flow",
    title: "Control Flow",
    entries: [
      {
        id: "if-else-expression",
        fn: "if/else Expressions",
        desc: "Conditional execution returning a value.",
        category: "Conditionals",
        subtitle: "Expressions, not statements",
        signature: "if condition { } else { }",
        descLong: "In Rust, `if` is an expression that returns a value. All branches must return the same type. Use `else if` for multiple conditions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of if/else Expressions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let number = 6;\n\n    if number % 2 == 0 {\n        println!(\"Even\");\n    } else {\n        println!(\"Odd\");\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of if/else Expressions — common patterns you'll see in production.\n// APPROACH  - Combine if/else Expressions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet message = if number > 5 { \"big\" } else { \"small\" };\n    println!(\"{}\", message);\n\n    let result = if number % 2 == 0 {\n        \"even\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of if/else Expressions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n} else if number % 3 == 0 {\n        \"divisible by 3\"\n    } else {\n        \"other\"\n    };\n    println!(\"{}\", result);\n}"
                  }
        ],
        tips: [
                  "`if` expressions return values",
                  "All arms must return same type",
                  "Use semicolons vs no semicolons: `value;` returns unit, `value` returns the value"
        ],
        mistake: "Returning different types from different branches of if/else.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "match-expression",
        fn: "match Expression",
        desc: "Pattern matching with exhaustive coverage.",
        category: "Conditionals",
        subtitle: "Exhaustive patterns",
        signature: "match value { pattern => { } }",
        descLong: "Match expressions provide powerful pattern matching. The compiler ensures all cases are covered. Patterns can be literals, enums, structs, and more.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of match Expression — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let number = 2;\n\n    match number {\n        1 => println!(\"One\"),\n        2 => println!(\"Two\"),\n        3 | 4 => println!(\"Three or Four\"),\n        5..=10 => println!(\"Five to Ten\"),\n        _ => println!(\"Other\"),\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of match Expression — common patterns you'll see in production.\n// APPROACH  - Combine match Expression with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet result = match number {\n        1 => \"one\",\n        2 => \"two\",\n        _ => \"other\",\n    };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of match Expression — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"{}\", result);\n\n    let x = (1, 2);\n    match x {\n        (a, b) if a == b => println!(\"Equal\"),\n        (a, b) => println!(\"a: {}, b: {}\", a, b),\n    }\n}"
                  }
        ],
        tips: [
                  "Match is exhaustive: all cases must be handled",
                  "Use `_` catchall pattern",
                  "Use range patterns `1..=10`",
                  "Add guards with `if` for complex conditions"
        ],
        mistake: "Not covering all cases; compiler will error.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "loop-while-for",
        fn: "Loops: loop, while, for",
        desc: "Repetition with different loop types.",
        category: "Loops",
        subtitle: "Three loop styles",
        signature: "loop { }, while condition { }, for item in iter { }",
        descLong: "Rust offers three loop constructs: infinite `loop`, condition-based `while`, and iterator-based `for`. Each is appropriate for different scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Loops: loop, while, for — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut counter = 0;\n    loop {\n        counter += 1;\n        println!(\"Count: {}\", counter);\n        if counter >= 3 {\n            break;\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Loops: loop, while, for — common patterns you'll see in production.\n// APPROACH  - Combine Loops: loop, while, for with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut num = 5;\n    while num > 0 {\n        println!(\"num: {}\", num);\n        num -= 1;\n    }\n\n    for i in 1..=3 {\n        println!(\"i: {}\", i);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Loops: loop, while, for — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet arr = [10, 20, 30];\n    for element in &arr {\n        println!(\"element: {}\", element);\n    }\n}"
                  }
        ],
        tips: [
                  "Use `loop` for infinite loops with explicit break",
                  "Use `while` for condition-based iteration",
                  "Use `for` with iterators (most idiomatic)",
                  "`break` exits loop, `continue` skips to next iteration"
        ],
        mistake: "Using `while` when `for` would be clearer and safer.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "if-let-while-let",
        fn: "if let & while let",
        desc: "Concise pattern matching for single patterns.",
        category: "Conditionals",
        subtitle: "Simplified match",
        signature: "if let pattern = value { }",
        descLong: "`if let` and `while let` provide concise syntax when you only care about matching one pattern. They reduce boilerplate compared to full match expressions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of if let & while let — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let option_value = Some(42);\n\n    if let Some(value) = option_value {\n        println!(\"Got value: {}\", value);\n    }\n\n    let result: Result<i32, &str> = Ok(10);\n    if let Ok(num) = result {\n        println!(\"Success: {}\", num);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of if let & while let — common patterns you'll see in production.\n// APPROACH  - Combine if let & while let with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut values = vec![1, 2, 3];\n    while let Some(v) = values.pop() {\n        println!(\"Popped: {}\", v);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of if let & while let — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet x = 5;\n    if let 5 = x {\n        println!(\"x is five\");\n    }\n}"
                  }
        ],
        tips: [
                  "Use `if let` to avoid verbose match with many `_ =>` arms",
                  "`while let` consumes values from iterators",
                  "Less readable than `match` for multiple patterns",
                  "Use when you only care about one pattern"
        ],
        mistake: "Using `if let` when multiple patterns need handling; use `match` instead.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Functions & Closures ─────────────────────────────────────────
  {
    id: "functions-closures",
    title: "Functions & Closures",
    entries: [
      {
        id: "function-definition",
        fn: "Function Definition",
        desc: "Named reusable code blocks with parameters.",
        category: "Functions",
        subtitle: "fn keyword",
        signature: "fn name(param: Type) -> ReturnType { }",
        descLong: "Functions are defined with `fn`, followed by a name, parameters with types, and optionally a return type. The last expression is the return value.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nfn greet(name: &str) {\n    println!(\"Hello, {}\", name);\n}\n\nfn main() {\n    let sum = add(5, 3);\n    println!(\"Sum: {}\", sum);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Definition — common patterns you'll see in production.\n// APPROACH  - Combine Function Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\ngreet(\"Rust\");\n\n    let result = multiply(4, 5);\n    println!(\"Product: {}\", result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n}\n\nfn multiply(a: i32, b: i32) -> i32 {\n    let result = a * b;\n    result\n}"
                  }
        ],
        tips: [
                  "All parameters require type annotations",
                  "Return type uses `->` syntax",
                  "Last expression is the return value (no semicolon)",
                  "Use `return` for early returns"
        ],
        mistake: "Adding semicolon to last expression, turning it into a statement.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "closures",
        fn: "Closures",
        desc: "Anonymous functions that capture their environment.",
        category: "Functions",
        subtitle: "Captures context",
        signature: "|param| { body }",
        descLong: "Closures are anonymous functions defined inline. They can capture variables from their surrounding scope. Types can be inferred, unlike regular functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Closures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let add = |a, b| a + b;\n    println!(\"Sum: {}\", add(2, 3));\n\n    let x = 5;\n    let add_x = |num| num + x;\n    println!(\"Add x: {}\", add_x(10));\n\n    let mut count = 0;\n    let mut increment = || {\n        count += 1;\n        count\n    };\n    println!(\"Count: {}\", increment());\n    println!(\"Count: {}\", increment());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Closures — common patterns you'll see in production.\n// APPROACH  - Combine Closures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Closures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet numbers = vec![1, 2, 3];\n    let doubled: Vec<i32> = numbers\n        .iter()\n        .map(|n| n * 2)\n        .collect();\n    println!(\"Doubled: {:?}\", doubled);\n}"
                  }
        ],
        tips: [
                  "Closures infer parameter and return types",
                  "Closures can capture by move, &, or &mut",
                  "Use in higher-order functions like `map`, `filter`",
                  "Capture is automatic based on usage"
        ],
        mistake: "Trying to capture a variable that has been moved elsewhere.",
        shorthand: {
          verbose: "// Manual / verbose approach\nlet add = |a: i32, b: i32| -> i32 { a + b };\n// More explicit but longer",
          concise: "let add = |a, b| a + b;",
        },
      },
      {
        id: "fn-traits",
        fn: "Fn Traits: Fn, FnMut, FnOnce",
        desc: "Traits for different function behaviors.",
        category: "Functions",
        subtitle: "Function trait hierarchy",
        signature: "Fn(&self), FnMut(&mut self), FnOnce(self)",
        descLong: "Closures and functions implement trait bounds: `Fn` (immutable), `FnMut` (mutable), `FnOnce` (once). Use these to constrain generic function arguments.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fn Traits: Fn, FnMut, FnOnce — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn apply<F>(f: F, x: i32) -> i32\nwhere\n    F: Fn(i32) -> i32,\n{\n    f(x)\n}\n\nfn apply_mut<F>(mut f: F, x: i32) -> i32\nwhere\n    F: FnMut(i32) -> i32,\n{\n    f(x)\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fn Traits: Fn, FnMut, FnOnce — common patterns you'll see in production.\n// APPROACH  - Combine Fn Traits: Fn, FnMut, FnOnce with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn apply_once<F>(f: F) -> i32\nwhere\n    F: FnOnce() -> i32,\n{\n    f()\n}\n\nfn main() {\n    let add_five = |x| x + 5;\n    println!(\"Result: {}\", apply(add_five, 10));\n\n    let mut mult = 2;\n    let multiply = |x| {\n        mult *= x;\n        mult\n    };\n    println!(\"Result: {}\", apply_mut(multiply, 3));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fn Traits: Fn, FnMut, FnOnce — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet gives_three = || 3;\n    println!(\"Result: {}\", apply_once(gives_three));\n}"
                  }
        ],
        tips: [
                  "`Fn` is immutable and can be called multiple times",
                  "`FnMut` mutates state and can be called multiple times",
                  "`FnOnce` consumes self and can be called once",
                  "FnOnce is least restrictive, Fn is most"
        ],
        mistake: "Passing a closure that captures by move to a function expecting `Fn`.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "higher-order-functions",
        fn: "Higher-Order Functions",
        desc: "Functions accepting or returning other functions.",
        category: "Functions",
        subtitle: "Function composition",
        signature: "fn transform<F>(f: F) -> impl Fn()",
        descLong: "Higher-order functions take functions as arguments or return functions. They enable functional programming patterns like composition and combinators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Higher-Order Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let numbers = vec![1, 2, 3, 4, 5];\n\n    let result: Vec<i32> = numbers\n        .iter()\n        .filter(|&n| n % 2 == 0)\n        .map(|n| n * 2)\n        .collect();\n    println!(\"Result: {:?}\", result);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Higher-Order Functions — common patterns you'll see in production.\n// APPROACH  - Combine Higher-Order Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet sum: i32 = numbers.iter().sum();\n    println!(\"Sum: {}\", sum);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Higher-Order Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn twice<F>(f: F) -> impl Fn(i32) -> i32\nwhere\n    F: Fn(i32) -> i32 + 'static,\n{\n    move |x| f(f(x))\n}"
                  }
        ],
        tips: [
                  "Combine with iterators for powerful transformations",
                  "Use `.filter().map().collect()` pattern",
                  "Returning functions requires trait objects or impl Trait",
                  "Closures enable functional style in Rust"
        ],
        mistake: "Forgetting lifetime bounds when returning closures.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 5: Enums & Pattern Matching ─────────────────────────────────────────
  {
    id: "enums-pattern-matching",
    title: "Enums & Pattern Matching",
    entries: [
      {
        id: "enum-definition",
        fn: "Enum Definition",
        desc: "Type with named variants.",
        category: "Enums",
        subtitle: "Variants with data",
        signature: "enum Name { Variant1, Variant2(Type) }",
        descLong: "Enums define types with discrete variants. Each variant can optionally carry associated data. Enums are type-safe and memory-efficient.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Enum Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[derive(Debug)]\nenum Color {\n    Red,\n    Green,\n    Blue,\n    Custom(u8, u8, u8),\n}\n\nenum Status {\n    Pending,\n    Active { duration: u32 },\n    Complete,\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Enum Definition — common patterns you'll see in production.\n// APPROACH  - Combine Enum Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    let color = Color::Red;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Enum Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet custom = Color::Custom(255, 128, 0);\n\n    println!(\"color: {:?}\", color);\n    println!(\"custom: {:?}\", custom);\n\n    let status = Status::Active { duration: 60 };\n    println!(\"status: {:?}\", status);\n}"
                  }
        ],
        tips: [
                  "Use enums for types with fixed variants",
                  "Variants can carry associated data",
                  "Use `#[derive(Debug)]` to print enums",
                  "Variants are accessed via `::`"
        ],
        mistake: "Forgetting to destructure enum variants when accessing their data.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "option-type",
        fn: "Option<T> Type",
        desc: "Represents optional values (Some or None).",
        category: "Enums",
        subtitle: "null safety",
        signature: "enum Option<T> { Some(T), None }",
        descLong: "Option<T> is an enum that represents an optional value. Use `Some(value)` for present values and `None` for absence. This replaces null pointers safely.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Option<T> Type — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let some_number = Some(5);\n    let some_string = Some(\"Rust\");\n    let absent: Option<i32> = None;\n\n    match some_number {\n        Some(n) => println!(\"Number: {}\", n),\n        None => println!(\"No number\"),\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Option<T> Type — common patterns you'll see in production.\n// APPROACH  - Combine Option<T> Type with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nif let Some(s) = some_string {\n        println!(\"String: {}\", s);\n    }\n\n    let value = absent.unwrap_or(0);\n    println!(\"Value: {}\", value);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Option<T> Type — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet numbers = vec![1, 2, 3];\n    let first = numbers.first();\n    println!(\"First: {:?}\", first);\n}"
                  }
        ],
        tips: [
                  "Use Option instead of null pointers",
                  "Pattern match with `match` or `if let`",
                  "`unwrap()` panics if None; use `unwrap_or()` for defaults",
                  "`.map()` and `.filter()` work with Option"
        ],
        mistake: "Calling `unwrap()` without checking for None first.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "result-type",
        fn: "Result<T, E> Type",
        desc: "Represents success (Ok) or failure (Err).",
        category: "Enums",
        subtitle: "Error handling",
        signature: "enum Result<T, E> { Ok(T), Err(E) }",
        descLong: "Result<T, E> is an enum for operations that may fail. Use `Ok(value)` for success and `Err(error)` for failure. This enables error handling without exceptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Result<T, E> Type — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn divide(a: i32, b: i32) -> Result<i32, &'static str> {\n    if b == 0 {\n        Err(\"Division by zero\")\n    } else {\n        Ok(a / b)\n    }\n}\n\nfn main() {\n    let result = divide(10, 2);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Result<T, E> Type — common patterns you'll see in production.\n// APPROACH  - Combine Result<T, E> Type with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nmatch result {\n        Ok(value) => println!(\"Result: {}\", value),\n        Err(e) => println!(\"Error: {}\", e),\n    }\n\n    if let Ok(n) = divide(20, 4) {\n        println!(\"Success: {}\", n);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Result<T, E> Type — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet unwrapped = divide(15, 3).unwrap_or(0);\n    println!(\"Value: {}\", unwrapped);\n}"
                  }
        ],
        tips: [
                  "Use Result for fallible operations",
                  "Propagate errors with `?` operator",
                  "Chain operations with `.map()`, `.and_then()`",
                  "Pattern match or use combinators"
        ],
        mistake: "Using `unwrap()` in production code without handling Err case.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "match-patterns",
        fn: "Advanced Pattern Matching",
        desc: "Destructuring and complex patterns.",
        category: "Pattern Matching",
        subtitle: "Bind and destructure",
        signature: "match value { pattern => action }",
        descLong: "Match supports destructuring tuples, structs, and enums. Use binding patterns with `@`, guards with `if`, and wildcards with `_`.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Advanced Pattern Matching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let point = (3, 4);\n    match point {\n        (0, 0) => println!(\"Origin\"),\n        (0, y) => println!(\"On y-axis: {}\", y),\n        (x, 0) => println!(\"On x-axis: {}\", x),\n        (x, y) => println!(\"Point: ({}, {})\", x, y),\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Advanced Pattern Matching — common patterns you'll see in production.\n// APPROACH  - Combine Advanced Pattern Matching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet color = Some(5);\n    match color {\n        Some(x) if x > 3 => println!(\"Big: {}\", x),\n        Some(x) => println!(\"Small: {}\", x),\n        None => println!(\"No color\"),\n    }\n\n    let values = (1, 2, 3, 4);\n    match values {\n        (first, .., last) => println!(\"First: {}, Last: {}\", first, last),\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Advanced Pattern Matching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet pair @ (x, y) = (10, 20);\n    println!(\"Pair: {:?}, x: {}, y: {}\", pair, x, y);\n}"
                  }
        ],
        tips: [
                  "Use `_` to ignore values",
                  "Use `..` to ignore multiple values",
                  "Use `@` to bind entire pattern and parts",
                  "Guards with `if` add conditions",
                  "Destructuring works in let statements too"
        ],
        mistake: "Overlapping patterns (earlier patterns hide later ones).",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "error-handling-match",
        fn: "Error Handling with Match",
        desc: "Comprehensive error handling patterns.",
        category: "Pattern Matching",
        subtitle: "Handle Results thoroughly",
        signature: "match result { Ok(v) => {}, Err(e) => {} }",
        descLong: "Use match expressions to handle Result types thoroughly. This ensures all error cases are considered and handled explicitly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Handling with Match — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn parse_number(s: &str) -> Result<i32, std::num::ParseIntError> {\n    s.parse()\n}\n\nfn main() {\n    let result = parse_number(\"42\");\n\n    match result {\n        Ok(num) => println!(\"Parsed: {}\", num),\n        Err(e) => println!(\"Error: {}\", e),\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Handling with Match — common patterns you'll see in production.\n// APPROACH  - Combine Error Handling with Match with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet results: Vec<_> = vec![\"1\", \"two\", \"3\"]\n        .iter()\n        .map(|s| parse_number(s))\n        .collect();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Handling with Match — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor (i, res) in results.iter().enumerate() {\n        match res {\n            Ok(n) => println!(\"Value {}: {}\", i, n),\n            Err(_) => println!(\"Value {} failed to parse\", i),\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Match enforces handling both Ok and Err",
                  "Use `_` to explicitly ignore error details",
                  "Consider context when deciding how to handle errors",
                  "Chain errors with `.map_err()`"
        ],
        mistake: "Assuming parse will always succeed without checking Err.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 6: Error Handling ─────────────────────────────────────────
  {
    id: "error-handling",
    title: "Error Handling",
    entries: [
      {
        id: "question-mark-operator",
        fn: "Question Mark Operator (?)",
        desc: "Propagate errors up the call stack.",
        category: "Error Handling",
        subtitle: "Error propagation",
        signature: "value?",
        descLong: "The `?` operator propagates errors. If a Result is Err, it returns immediately. If Ok, it unwraps the value. Dramatically simplifies error handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Question Mark Operator (?) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::fs;\n\nfn read_file_contents(path: &str) -> Result<String, std::io::Error> {\n    let contents = fs::read_to_string(path)?;\n    Ok(contents)\n}\n\nfn parse_and_double(s: &str) -> Result<i32, Box<dyn std::error::Error>> {\n    let num: i32 = s.parse()?;\n    Ok(num * 2)\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Question Mark Operator (?) — common patterns you'll see in production.\n// APPROACH  - Combine Question Mark Operator (?) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() -> Result<(), Box<dyn std::error::Error>> {\n    let data = read_file_contents(\"test.txt\")?;\n    println!(\"Data: {}\", data);\n\n    let result = parse_and_double(\"21\")?;\n    println!(\"Result: {}\", result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Question Mark Operator (?) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nOk(())\n}"
                  }
        ],
        tips: [
                  "Use `?` in functions returning Result",
                  "`?` is equivalent to match with early return",
                  "Can only use `?` in functions returning Result or Option",
                  "Makes code cleaner and more readable"
        ],
        mistake: "Using `?` outside a function returning Result.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "unwrap-expect",
        fn: "unwrap() & expect()",
        desc: "Extract value or panic.",
        category: "Error Handling",
        subtitle: "Unsafe shortcuts",
        signature: "value.unwrap(), value.expect(\"message\")",
        descLong: "unwrap() and expect() extract the value from Option/Result or panic. Use only when you are certain the value exists, or for prototyping.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of unwrap() & expect() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let some = Some(5);\n    let value = some.unwrap();\n    println!(\"Value: {}\", value);\n\n    let ok: Result<i32, &str> = Ok(10);\n    let num = ok.unwrap();\n    println!(\"Num: {}\", num);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of unwrap() & expect() — common patterns you'll see in production.\n// APPROACH  - Combine unwrap() & expect() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet result: Result<i32, &str> = Err(\"failed\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of unwrap() & expect() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet val = result.expect(\"Should be Ok\");\n    println!(\"Val: {}\", val);\n}"
                  }
        ],
        tips: [
                  "Use `unwrap()` only when certain the value exists",
                  "`expect()` provides better panic message",
                  "Avoid in production code without justification",
                  "Use `unwrap_or()` to provide default"
        ],
        mistake: "Using `unwrap()` on user input without validation.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "unwrap-or-variants",
        fn: "unwrap_or & Related Methods",
        desc: "Extract value with fallback or transformation.",
        category: "Error Handling",
        subtitle: "Safe extraction",
        signature: "value.unwrap_or(default), .unwrap_or_else(f), .map_or(default, f)",
        descLong: "Safe alternatives to unwrap(). unwrap_or() provides default, unwrap_or_else() computes default, map_or() transforms and defaults.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of unwrap_or & Related Methods — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let absent: Option<i32> = None;\n\n    let value = absent.unwrap_or(42);\n    println!(\"Value: {}\", value);\n\n    let result: Result<i32, &str> = Err(\"failed\");\n    let num = result.unwrap_or_else(|_| 0);\n    println!(\"Num: {}\", num);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of unwrap_or & Related Methods — common patterns you'll see in production.\n// APPROACH  - Combine unwrap_or & Related Methods with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet opt = Some(5);\n    let doubled = opt.map_or(0, |x| x * 2);\n    println!(\"Doubled: {}\", doubled);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of unwrap_or & Related Methods — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet option = Some(10);\n    let result = option\n        .map(|x| x * 2)\n        .filter(|x| x > &15)\n        .unwrap_or(0);\n    println!(\"Result: {}\", result);\n}"
                  }
        ],
        tips: [
                  "Use `unwrap_or(default)` for simple defaults",
                  "Use `unwrap_or_else(f)` when default is expensive",
                  "Chain `.map()` and `.filter()` before unwrapping",
                  "These prevent panics from `unwrap()`"
        ],
        mistake: "Computing expensive default always, even if not needed.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "custom-errors",
        fn: "Custom Error Types",
        desc: "Define domain-specific errors.",
        category: "Error Handling",
        subtitle: "impl std::error::Error",
        signature: "struct MyError; impl std::error::Error for MyError { }",
        descLong: "Create custom error types by implementing the Error trait. This provides type-safe, domain-specific error handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Error Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::error::Error;\nuse std::fmt;\n\n#[derive(Debug)]\nstruct DivisionError {\n    message: String,\n}\n\nimpl fmt::Display for DivisionError {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, \"{}\", self.message)\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Error Types — common patterns you'll see in production.\n// APPROACH  - Combine Custom Error Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nimpl Error for DivisionError {}\n\nfn safe_divide(a: i32, b: i32) -> Result<i32, DivisionError> {\n    if b == 0 {\n        Err(DivisionError {\n            message: \"Cannot divide by zero\".to_string(),\n        })\n    } else {\n        Ok(a / b)\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Error Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfn main() {\n    match safe_divide(10, 0) {\n        Ok(result) => println!(\"Result: {}\", result),\n        Err(e) => println!(\"Error: {}\", e),\n    }\n}"
                  }
        ],
        tips: [
                  "Implement Debug, Display, and Error traits",
                  "Use custom errors for domain logic",
                  "Provide context in error messages",
                  "Use `?` operator with custom errors"
        ],
        mistake: "Not implementing Display trait, making errors hard to understand.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
      {
        id: "error-conversion",
        fn: "Error Conversion & From/Into",
        desc: "Convert between error types automatically.",
        category: "Error Handling",
        subtitle: "Trait-based conversion",
        signature: "impl From<ErrA> for ErrB { }",
        descLong: "Implement `From` to enable automatic error conversion. The `?` operator uses this to convert between error types in Result chains.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Error Conversion & From/Into — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::num::ParseIntError;\n\n#[derive(Debug)]\nenum CustomError {\n    ParseError(ParseIntError),\n    InvalidRange,\n}\n\nimpl From<ParseIntError> for CustomError {\n    fn from(err: ParseIntError) -> Self {\n        CustomError::ParseError(err)\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Error Conversion & From/Into — common patterns you'll see in production.\n// APPROACH  - Combine Error Conversion & From/Into with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn parse_range(s: &str) -> Result<i32, CustomError> {\n    let num: i32 = s.parse()?;\n    if num < 0 || num > 100 {\n        Err(CustomError::InvalidRange)\n    } else {\n        Ok(num)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Error Conversion & From/Into — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n}\n}\n\nfn main() {\n    match parse_range(\"50\") {\n        Ok(n) => println!(\"Valid: {}\", n),\n        Err(e) => println!(\"Error: {:?}\", e),\n    }\n}"
                  }
        ],
        tips: [
                  "Implement From to enable ? operator",
                  "Error types should be convertible",
                  "Automatic conversion simplifies error handling",
                  "Use in functions with ?"
        ],
        mistake: "Not implementing From when using `?` with different error types.",
        shorthand: {
          verbose: "fn main() {\n    let x = 5;\n    let y: i32 = 10;\n    let name",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 7: Smart Pointers ─────────────────────────────────────────
  {
    id: "smart-pointers",
    title: "Smart Pointers",
    entries: [
      {
        id: "box-heap",
        fn: "Box<T> — Heap Allocation",
        desc: "Put data on the heap with a known-size pointer on the stack — required for recursive types and trait objects.",
        category: "Smart Pointers",
        subtitle: "Heap allocation, recursive types, and trait objects",
        signature: "let b: Box<i32> = Box::new(5);  |  Box<dyn Trait>",
        descLong: "Box<T> is Rust's simplest smart pointer — it allocates data on the heap and provides ownership. Three main uses: recursive types (e.g., linked lists), large data you don't want to copy on the stack, and trait objects (Box<dyn Trait>) for dynamic dispatch. Box has zero overhead beyond the heap allocation itself.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Box<T> — Heap Allocation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Basic heap allocation\nlet b = Box::new(42);\nprintln!(\"Boxed value: {}\", b);  // auto-derefs"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Box<T> — Heap Allocation — common patterns you'll see in production.\n// APPROACH  - Combine Box<T> — Heap Allocation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Recursive type (impossible without Box)\n#[derive(Debug)]\nenum List {\n    Cons(i32, Box<List>),\n    Nil,\n}\n\nlet list = List::Cons(1,\n    Box::new(List::Cons(2,\n        Box::new(List::Cons(3,\n            Box::new(List::Nil))))));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Box<T> — Heap Allocation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Trait objects for dynamic dispatch,trait Animal {,    fn speak(&self) -> &str;,},struct Dog;,struct Cat;,impl Animal for Dog { fn speak(&self) -> &str { \"Woof!\" } },impl Animal for Cat { fn speak(&self) -> &str { \"Meow!\" } },,let animals: Vec<Box<dyn Animal>> = vec![,    Box::new(Dog),,    Box::new(Cat),,];,for a in &animals {,    println!(\"{}\", a.speak());,},\n\n// Large data on heap (avoid stack overflow),let big = Box::new([0u8; 1_000_000]);  // 1MB on heap, not stack"
                  }
        ],
        tips: [
                  "Box is the only way to create recursive types — the compiler needs a known size for the stack.",
                  "Box<dyn Trait> gives you dynamic dispatch (virtual calls) — use when you need heterogeneous collections.",
                  "Box auto-derefs: *b and b.method() both work transparently.",
                  "Prefer Box over Rc when you have single ownership — it's faster (no reference counting)."
        ],
        mistake: "Boxing everything \"just in case\" — most Rust values live on the stack just fine. Only Box when you need recursion, dynamic dispatch, or truly large data.",
        shorthand: {
          verbose: "// Junior: return concrete type — breaks when you need polymorphism\nfn make_animal(kind: &str) -> Dog {  // locked to one type\n    Dog { name: kind.to_string() }\n}\n// Can't return Cat from the same function",
          concise: "// Senior: trait object for dynamic dispatch\nfn make_animal(kind: &str) -> Box<dyn Animal> {\n    if kind == \"dog\" { Box::new(Dog) } else { Box::new(Cat) }\n}",
        },
      },
      {
        id: "rc-refcell",
        fn: "Rc<T> & RefCell<T> — Shared Ownership",
        desc: "Rc enables multiple owners of the same data; RefCell provides interior mutability with runtime borrow checks.",
        category: "Smart Pointers",
        subtitle: "Reference counting and interior mutability",
        signature: "Rc::clone(&r)  |  RefCell::borrow()  |  RefCell::borrow_mut()",
        descLong: "Rc<T> (Reference Counted) allows multiple ownership of the same data — each clone increments a counter, and data is freed when the last Rc drops. RefCell<T> moves borrow checking from compile time to runtime, enabling mutation through a shared reference. Rc<RefCell<T>> together give multiple owners with interior mutability. Single-threaded only — use Arc<Mutex<T>> for multithreaded.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rc<T> & RefCell<T> — Shared Ownership — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::rc::Rc;\nuse std::cell::RefCell;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rc<T> & RefCell<T> — Shared Ownership — common patterns you'll see in production.\n// APPROACH  - Combine Rc<T> & RefCell<T> — Shared Ownership with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Rc — shared ownership\nlet a = Rc::new(String::from(\"hello\"));\nlet b = Rc::clone(&a);  // increment ref count, NOT deep copy\nlet c = Rc::clone(&a);\n\nprintln!(\"Count: {}\", Rc::strong_count(&a));  // 3\nprintln!(\"Value: {}\", a);  // all three point to same data\n\ndrop(c);\nprintln!(\"Count after drop: {}\", Rc::strong_count(&a));  // 2"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rc<T> & RefCell<T> — Shared Ownership — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// RefCell — interior mutability,let data = RefCell::new(vec![1, 2, 3]);,\n\n// Borrow immutably,{,    let borrowed = data.borrow();,    println!(\"Read: {:?}\", *borrowed);,}  // immutable borrow drops here,\n\n// Borrow mutably,{,    let mut borrowed = data.borrow_mut();,    borrowed.push(4);,}  // mutable borrow drops here,\n\n// Rc<RefCell<T>> — shared mutable state,#[derive(Debug)],struct Node {,    value: i32,,    children: Vec<Rc<RefCell<Node>>>,,},,let root = Rc::new(RefCell::new(Node { value: 1, children: vec![] }));,let child = Rc::new(RefCell::new(Node { value: 2, children: vec![] }));,,root.borrow_mut().children.push(Rc::clone(&child));,child.borrow_mut().value = 42;  // mutate through shared reference,,println!(\"Child value: {}\", root.borrow().children[0].borrow().value);  // 42"
                  }
        ],
        tips: [
                  "Rc::clone() is cheap (increments a counter) — it does NOT deep-copy the data.",
                  "RefCell panics at runtime if you violate borrow rules (two mutable borrows). Prefer compile-time checks when possible.",
                  "Use Weak<T> (Rc::downgrade) to break reference cycles that would leak memory.",
                  "Single-threaded only: Rc is NOT Send/Sync. Use Arc<Mutex<T>> across threads."
        ],
        mistake: "Using Rc<RefCell<T>> everywhere to avoid fighting the borrow checker — it bypasses compile-time safety. Restructure your data to use ownership and borrowing first; Rc<RefCell<T>> is a last resort for genuinely shared mutable state.",
        shorthand: {
          verbose: "// Junior: clone data to give multiple owners — wastes memory\nlet data = vec![1, 2, 3];\nlet owner_a = data.clone();  // deep copy\nlet owner_b = data.clone();  // another deep copy",
          concise: "// Senior: Rc shares one allocation, RefCell allows mutation\nlet data = Rc::new(RefCell::new(vec![1, 2, 3]));\nlet b = Rc::clone(&data);           // cheap ref-count bump\nb.borrow_mut().push(4);             // mutate through shared ref",
        },
      },
    ],
  },

  // ── Section 8: Modules & Testing ─────────────────────────────────────────
  {
    id: "modules-testing",
    title: "Modules & Testing",
    entries: [
      {
        id: "module-system",
        fn: "Module System & Visibility",
        desc: "Organize code into modules with pub/private visibility, use declarations, and crate structure.",
        category: "Modules",
        subtitle: "mod, pub, use, crate, self, super",
        signature: "mod name;  |  pub fn  |  use crate::module::Item;",
        descLong: "Rust modules control code organization and visibility. Everything is private by default — use pub to expose items. The module tree starts at lib.rs or main.rs. Modules can be inline (mod name { }) or in separate files (mod name; with name.rs or name/mod.rs). Use paths: crate:: (root), self:: (current), super:: (parent).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Module System & Visibility — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── src/lib.rs (crate root) ──────────────────────────\npub mod auth;       // loads from src/auth.rs or src/auth/mod.rs\npub mod database;\nmod internal;       // private module — only visible within this crate\n\npub use auth::User; // re-export for convenient access"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Module System & Visibility — common patterns you'll see in production.\n// APPROACH  - Combine Module System & Visibility with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── src/auth.rs ─────────────────────────────────────\npub struct User {\n    pub name: String,\n    pub(crate) email: String,  // visible within crate only\n    password_hash: String,     // private (default)\n}\n\nimpl User {\n    pub fn new(name: &str, email: &str, password: &str) -> Self {\n        User {\n            name: name.to_string(),\n            email: email.to_string(),\n            password_hash: hash(password),\n        }\n    }\n\n    pub fn display_name(&self) -> &str { &self.name }\n\n    fn hash(password: &str) -> String {   // private helper\n        format!(\"hashed_{}\", password)\n    }\n}\n\npub mod roles {                          // nested module\n    pub enum Role { Admin, User, Guest }\n\n    pub fn default_role() -> Role { Role::Guest }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Module System & Visibility — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── src/main.rs ─────────────────────────────────────,use mylib::User;                         // re-exported from lib.rs,use mylib::auth::roles::Role;,,fn main() {,    let user = User::new(\"Alice\", \"a@b.com\", \"secret\");,    println!(\"{}\", user.display_name());,    // println!(\"{}\", user.password_hash);   // ERROR: private,    // println!(\"{}\", user.email);            // ERROR: pub(crate) from outside crate,}"
                  }
        ],
        tips: [
                  "Everything is private by default — this is Rust's encapsulation. Only pub items are part of your API.",
                  "pub(crate) exposes to the whole crate but not to external users — great for internal helpers.",
                  "Re-export with pub use to create a clean public API without exposing internal module structure.",
                  "Prefer src/auth.rs over src/auth/mod.rs (modern style) — both work, but flat files are cleaner."
        ],
        mistake: "Making everything pub to \"fix\" visibility errors — this destroys encapsulation. Think about what's actually part of your API and keep internals private.",
        shorthand: {
          verbose: "// Junior: flat file, everything in main.rs — hard to navigate\n// src/main.rs\nfn hash_password(pw: &str) -> String { format!(\"hash_{}\", pw) }\nfn validate_email(e: &str) -> bool { e.contains('@') }\npub struct User { pub name: String, pub email: String }\nfn main() { /* all logic here */ }",
          concise: "// Senior: split into modules, re-export the clean public API\n// src/lib.rs\npub mod auth;\npub use auth::User;           // consumers just: use mylib::User\n// src/auth.rs — private internals stay hidden inside the module",
        },
      },
      {
        id: "testing-basics",
        fn: "Testing (#[test] & Integration Tests)",
        desc: "Built-in test framework — unit tests in the same file, integration tests in tests/ directory.",
        category: "Testing",
        subtitle: "#[test], #[cfg(test)], assert macros, integration tests",
        signature: "#[test] fn test_name() { assert_eq!(actual, expected); }",
        descLong: "Rust has testing built into the language. Unit tests live in a #[cfg(test)] module inside the source file — they can test private functions. Integration tests live in the tests/ directory and test your public API. cargo test runs both. assert!, assert_eq!, assert_ne! are the assertion macros. #[should_panic] tests expected failures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Testing (#[test] & Integration Tests) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Unit tests (same file as code) ──────────────────\npub fn add(a: i32, b: i32) -> i32 { a + b }\nfn internal_helper(x: i32) -> i32 { x * 2 }  // private\n\n#[cfg(test)]\nmod tests {\n    use super::*;  // import parent module items\n\n    #[test]\n    fn test_add() {\n        assert_eq!(add(2, 3), 5);\n    }\n\n    #[test]\n    fn test_add_negative() {\n        assert_eq!(add(-1, 1), 0);\n    }\n\n    #[test]\n    fn test_private_helper() {\n        // unit tests CAN access private functions!\n        assert_eq!(internal_helper(5), 10);\n    }\n\n    #[test]\n    #[should_panic(expected = \"overflow\")]\n    fn test_overflow() {\n        let _: u8 = 255u8.checked_add(1).expect(\"overflow\");\n    }\n\n    #[test]\n    fn test_result() -> Result<(), String> {\n        // Tests can return Result for ? usage\n        let value: i32 = \"42\".parse().map_err(|e| format!(\"{}\", e))?;\n        assert_eq!(value, 42);\n        Ok(())\n    }\n\n    #[test]\n    #[ignore]  // skip unless: cargo test -- --include-ignored\n    fn expensive_test() {\n        // long-running test\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Testing (#[test] & Integration Tests) — common patterns you'll see in production.\n// APPROACH  - Combine Testing (#[test] & Integration Tests) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Integration tests (tests/integration_test.rs) ───\n// use mylib::add;  // can only test public API\n//\n// #[test]\n// fn test_add_integration() {\n//     assert_eq!(add(10, 20), 30);\n// }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Testing (#[test] & Integration Tests) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Run tests ───────────────────────────────────────,// cargo test                     -- run all tests,// cargo test test_add            -- filter by name,// cargo test -- --nocapture      -- show println! output,// cargo test -- --test-threads=1 -- sequential execution"
                  }
        ],
        tips: [
                  "#[cfg(test)] ensures test code is stripped from release builds — zero overhead.",
                  "Unit tests can access private functions (use super::*) — test internals freely.",
                  "Integration tests in tests/ test your public API as an external user would.",
                  "cargo test -- --nocapture shows println! output from passing tests (hidden by default)."
        ],
        mistake: "Only writing integration tests and skipping unit tests — unit tests are faster, can test private internals, and pinpoint failures. Use both layers.",
        shorthand: {
          verbose: "// Junior: manual test with println! — no assertions, must read output\nfn add(a: i32, b: i32) -> i32 { a + b }\n\nfn main() {\n    let result = add(2, 3);\n    println!(\"Result: {}\", result);  // is 5 right? you have to check\n}",
          concise: "// Senior: #[test] — zero manual checking, cargo test confirms instantly\n#[test]\nfn test_add() {\n    assert_eq!(add(2, 3), 5);  // fails loudly if wrong\n}",
        },
      },
    ],
  },
]

export default { meta, sections }
