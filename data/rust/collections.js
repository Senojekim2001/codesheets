export const meta = {
  "id": "rust-collections",
  "label": "Collections & Iterators",
  "icon": "🦀",
  "description": "Rust standard collections, iterators, and string types."
}

export const sections = [

  // ── Section 1: Standard Collections ─────────────────────────────────────────
  {
    id: "standard-collections",
    title: "Standard Collections",
    entries: [
      {
        id: "vector-vec",
        fn: "Vector (Vec<T>)",
        desc: "Growable array stored on heap.",
        category: "Collections",
        subtitle: "Dynamic array",
        signature: "Vec::new(), vec![1, 2, 3]",
        descLong: "Vec is the most common Rust collection. It's a growable, heap-allocated array. Use `push` to add, `pop` to remove.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Vector (Vec<T>) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut v = Vec::new();\n    v.push(1);\n    v.push(2);\n    v.push(3);\n\n    println!(\"Length: {}\", v.len());\n    println!(\"Capacity: {}\", v.capacity());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Vector (Vec<T>) — common patterns you'll see in production.\n// APPROACH  - Combine Vector (Vec<T>) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nif let Some(last) = v.pop() {\n        println!(\"Popped: {}\", last);\n    }\n\n    let v2 = vec![10, 20, 30];\n    for (i, value) in v2.iter().enumerate() {\n        println!(\"v2[{}]: {}\", i, value);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Vector (Vec<T>) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet v3 = vec![1; 5];\n    println!(\"v3: {:?}\", v3);\n}"
                  }
        ],
        tips: [
                  "Use `vec!` macro to initialize with values",
                  "`push` appends, `pop` removes last element",
                  "Access with brackets: v[0]",
                  "Bounds checked at runtime",
                  "Use iterators instead of indexing"
        ],
        mistake: "Indexing without bounds checking; panics if out of bounds.",
        shorthand: {
          verbose: "fn main() {\n    let mut v = Vec::new();\n    v.push(1);\n    v.push(2);\n    v.push(3);\n\n    println!(\"",
          concise: "// see verbose",
        },
      },
      {
        id: "hashmap",
        fn: "HashMap<K, V>",
        desc: "Key-value store with hash lookup.",
        category: "Collections",
        subtitle: "Hash table",
        signature: "HashMap::new(), insert(key, value)",
        descLong: "HashMap stores key-value pairs and retrieves by key in O(1) average time. Keys must be hashable and comparable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HashMap<K, V> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::collections::HashMap;\n\nfn main() {\n    let mut map = HashMap::new();\n    map.insert(\"Alice\", 30);\n    map.insert(\"Bob\", 25);\n\n    if let Some(age) = map.get(\"Alice\") {\n        println!(\"Alice is {}\", age);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HashMap<K, V> — common patterns you'll see in production.\n// APPROACH  - Combine HashMap<K, V> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nmap.entry(\"Charlie\")\n        .or_insert(35);\n\n    for (name, age) in &map {\n        println!(\"{}: {}\", name, age);\n    }\n\n    let keys: Vec<_> = map.keys().collect();\n    println!(\"Keys: {:?}\", keys);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HashMap<K, V> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet values: Vec<_> = map.values().collect();\n    println!(\"Values: {:?}\", values);\n}"
                  }
        ],
        tips: [
                  "Keys must implement Eq and Hash",
                  "Use .get() to retrieve without panicking",
                  "Use .entry() for efficient insert-or-update",
                  "Iterate with for (k, v) in &map",
                  "BTreeMap if you need sorted keys"
        ],
        mistake: "Panicking with [] access; use .get() instead.",
        shorthand: {
          verbose: "use std::collections::HashMap;\n\nfn main() {\n    let mut map = HashMap::new();\n    map.insert(\"Alice\"",
          concise: "// see verbose",
        },
      },
      {
        id: "hashset",
        fn: "HashSet<T>",
        desc: "Unordered collection of unique values.",
        category: "Collections",
        subtitle: "Unique values",
        signature: "HashSet::new(), insert(value)",
        descLong: "HashSet is an unordered collection of unique values. Useful for membership testing and deduplication.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HashSet<T> — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::collections::HashSet;\n\nfn main() {\n    let mut set = HashSet::new();\n    set.insert(1);\n    set.insert(2);\n    set.insert(3);\n    set.insert(3);\n\n    println!(\"Length: {}\", set.len());\n    println!(\"Contains 2: {}\", set.contains(&2));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HashSet<T> — common patterns you'll see in production.\n// APPROACH  - Combine HashSet<T> with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut set1 = HashSet::new();\n    set1.insert(\"a\");\n    set1.insert(\"b\");\n\n    let mut set2 = HashSet::new();\n    set2.insert(\"b\");\n    set2.insert(\"c\");\n\n    let union: HashSet<_> = set1.union(&set2).copied().collect();\n    println!(\"Union: {:?}\", union);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HashSet<T> — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet intersection: HashSet<_> = set1.intersection(&set2).copied().collect();\n    println!(\"Intersection: {:?}\", intersection);\n}"
                  }
        ],
        tips: [
                  "Automatically deduplicates",
                  "Use for membership tests",
                  "O(1) insert and lookup",
                  "No guaranteed iteration order",
                  "Use set operations: union, intersection, difference"
        ],
        mistake: "Assuming iteration order; HashSet order is unpredictable.",
        shorthand: {
          verbose: "use std::collections::HashSet;\n\nfn main() {\n    let mut set = HashSet::new();\n    set.insert(1);\n   ",
          concise: "// see verbose",
        },
      },
      {
        id: "btreemap-vecdeque",
        fn: "BTreeMap & VecDeque",
        desc: "Sorted map and double-ended queue.",
        category: "Collections",
        subtitle: "Ordered & queue",
        signature: "BTreeMap::new(), VecDeque::new()",
        descLong: "BTreeMap maintains sorted key order. VecDeque allows efficient insertion/removal at both ends.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of BTreeMap & VecDeque — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::collections::{BTreeMap, VecDeque};\n\nfn main() {\n    let mut tree = BTreeMap::new();\n    tree.insert(3, \"c\");\n    tree.insert(1, \"a\");\n    tree.insert(2, \"b\");\n\n    for (k, v) in &tree {\n        println!(\"{}: {}\", k, v);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of BTreeMap & VecDeque — common patterns you'll see in production.\n// APPROACH  - Combine BTreeMap & VecDeque with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut deque = VecDeque::new();\n    deque.push_back(1);\n    deque.push_back(2);\n    deque.push_front(0);\n\n    println!(\"Front: {:?}\", deque.front());\n    println!(\"Back: {:?}\", deque.back());\n\n    deque.pop_front();\n    println!(\"After pop: {:?}\", deque);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of BTreeMap & VecDeque — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor item in &deque {\n        println!(\"Item: {}\", item);\n    }\n}"
                  }
        ],
        tips: [
                  "BTreeMap has O(log n) operations",
                  "Iteration is sorted by key",
                  "VecDeque is like queue+stack",
                  "Use VecDeque for work queues",
                  "BTreeMap better for range queries"
        ],
        mistake: "Using HashMap when ordering matters; use BTreeMap.",
        shorthand: {
          verbose: "use std::collections::{BTreeMap, VecDeque};\n\nfn main() {\n    let mut tree = BTreeMap::new();\n    tre",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Iterators ─────────────────────────────────────────
  {
    id: "iterators",
    title: "Iterators",
    entries: [
      {
        id: "iterator-adaptors",
        fn: "Iterator Adaptors",
        desc: "Transform iterators lazily: map, filter, fold.",
        category: "Iterators",
        subtitle: "Lazy evaluation",
        signature: "iter.map(|x| x * 2).filter(|x| x > 5)",
        descLong: "Iterator adaptors (map, filter, fold) transform iterators without allocating. They are lazy: not evaluated until consumed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Iterator Adaptors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let numbers = vec![1, 2, 3, 4, 5];\n\n    let result: Vec<_> = numbers\n        .iter()\n        .map(|n| n * 2)\n        .filter(|n| n > &4)\n        .collect();\n    println!(\"Mapped & filtered: {:?}\", result);\n\n    let sum: i32 = numbers.iter().sum();\n    println!(\"Sum: {}\", sum);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Iterator Adaptors — common patterns you'll see in production.\n// APPROACH  - Combine Iterator Adaptors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet product: i32 = numbers.iter().fold(1, |acc, n| acc * n);\n    println!(\"Product: {}\", product);\n\n    let doubled: Vec<_> = numbers\n        .iter()\n        .take(3)\n        .map(|x| x * 2)\n        .collect();\n    println!(\"First 3 doubled: {:?}\", doubled);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Iterator Adaptors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet skipped: Vec<_> = numbers\n        .iter()\n        .skip(2)\n        .collect();\n    println!(\"Skip 2: {:?}\", skipped);\n}"
                  }
        ],
        tips: [
                  "Adaptors are lazy; chain before consuming",
                  "Use .collect() to materialize",
                  "map transforms each element",
                  "filter keeps elements matching predicate",
                  "fold accumulates a value",
                  "Chain multiple adaptors"
        ],
        mistake: "Not calling .collect() to materialize iterator results.",
        shorthand: {
          verbose: "fn main() {\n    let numbers = vec![1, 2, 3, 4, 5];\n\n    let result: Vec<_> = numbers\n        .iter()",
          concise: "// see verbose",
        },
      },
      {
        id: "enumerate-zip-chain",
        fn: "enumerate, zip, chain",
        desc: "Combine and index iterators.",
        category: "Iterators",
        subtitle: "Iterator composition",
        signature: "iter.enumerate(), iter1.zip(iter2), iter1.chain(iter2)",
        descLong: "enumerate adds indices, zip combines two iterators, chain concatenates. Powerful for common iteration patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of enumerate, zip, chain — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let items = vec![\"a\", \"b\", \"c\"];\n\n    for (i, item) in items.iter().enumerate() {\n        println!(\"{}. {}\", i, item);\n    }\n\n    let names = vec![\"Alice\", \"Bob\"];\n    let ages = vec![30, 25];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of enumerate, zip, chain — common patterns you'll see in production.\n// APPROACH  - Combine enumerate, zip, chain with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfor (name, age) in names.iter().zip(ages.iter()) {\n        println!(\"{}: {}\", name, age);\n    }\n\n    let first = vec![1, 2];\n    let second = vec![3, 4];\n\n    for item in first.iter().chain(second.iter()) {\n        println!(\"Item: {}\", item);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of enumerate, zip, chain — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet combined: Vec<_> = (1..3)\n        .zip(['a', 'b'].iter())\n        .collect();\n    println!(\"Zipped ranges: {:?}\", combined);\n}"
                  }
        ],
        tips: [
                  "enumerate gives (index, value) tuples",
                  "zip pairs elements from two iterators",
                  "chain concatenates iterators",
                  "All return iterators (lazy)",
                  "Combine for powerful patterns"
        ],
        mistake: "Using indexing (vec[i]) instead of enumerate.",
        shorthand: {
          verbose: "fn main() {\n    let items = vec![\"a\", \"b\", \"c\"];\n\n    for (i, item) in items.iter().enumerate() {\n  ",
          concise: "// see verbose",
        },
      },
      {
        id: "custom-iterator",
        fn: "Custom Iterator Implementation",
        desc: "Implement Iterator trait for custom types.",
        category: "Iterators",
        subtitle: "iter() method",
        signature: "impl Iterator for Type { type Item = T; fn next() }",
        descLong: "Implement the Iterator trait to make custom types iterable. Only required method is next().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Iterator Implementation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nstruct Counter {\n    count: u32,\n    max: u32,\n}\n\nimpl Counter {\n    fn new(max: u32) -> Counter {\n        Counter { count: 0, max }\n    }\n}\n\nimpl Iterator for Counter {\n    type Item = u32;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Iterator Implementation — common patterns you'll see in production.\n// APPROACH  - Combine Custom Iterator Implementation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn next(&mut self) -> Option<Self::Item> {\n        if self.count < self.max {\n            self.count += 1;\n            Some(self.count)\n        } else {\n            None\n        }\n    }\n}\n\nfn main() {\n    let counter = Counter::new(5);\n    for num in counter {\n        println!(\"Count: {}\", num);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Iterator Implementation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet counter2 = Counter::new(3);\n    let doubled: Vec<_> = counter2.map(|n| n * 2).collect();\n    println!(\"Doubled: {:?}\", doubled);\n}"
                  }
        ],
        tips: [
                  "Implement next() to return Option<Item>",
                  "Gets all iterator adaptors for free",
                  "Can track internal state",
                  "Consumed when iterated",
                  "Lazy: computed on demand"
        ],
        mistake: "Not handling the end condition in next().",
        shorthand: {
          verbose: "struct Counter {\n    count: u32,\n    max: u32,\n}\n\nimpl Count",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: String Types ─────────────────────────────────────────
  {
    id: "string-types",
    title: "String Types",
    entries: [
      {
        id: "string-vs-str",
        fn: "String vs &str",
        desc: "Owned vs borrowed string slices.",
        category: "Strings",
        subtitle: "Different ownership",
        signature: "String (owned), &str (borrowed)",
        descLong: "String is an owned, growable string. &str is a borrowed string slice. Most functions accept &str for flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of String vs &str — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let static_str: &str = \"hello\";\n    let owned = String::from(\"world\");\n\n    println!(\"Static: {}\", static_str);\n    println!(\"Owned: {}\", owned);\n\n    let s = String::from(\"hello\");\n    let slice: &str = &s;\n    println!(\"Slice: {}\", slice);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of String vs &str — common patterns you'll see in production.\n// APPROACH  - Combine String vs &str with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet s2 = \"hello\".to_string();\n    println!(\"to_string: {}\", s2);\n\n    let s3 = String::from(\"hello\") + \" \" + \"world\";\n    println!(\"Concatenated: {}\", s3);\n\n    let mut s4 = String::from(\"hello\");\n    s4.push_str(\" world\");\n    println!(\"Push: {}\", s4);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of String vs &str — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet s5 = format!(\"{} {}\", \"hello\", \"world\");\n    println!(\"Format: {}\", s5);\n}"
                  }
        ],
        tips: [
                  "&str is the most flexible for parameters",
                  "String is mutable and growable",
                  "String::from() or .to_string() to convert",
                  "Use format! for complex concatenation",
                  "Push &str or char to String"
        ],
        mistake: "Taking String parameter instead of &str; limits reusability.",
        shorthand: {
          verbose: "fn main() {\n    let static_str: &str = \"hello\";\n    let owned = String::from(\"world\");\n\n    println!",
          concise: "// see verbose",
        },
      },
      {
        id: "string-formatting",
        fn: "String Formatting & Printing",
        desc: "Format strings with placeholders.",
        category: "Strings",
        subtitle: "println! & format!",
        signature: "println!(\"{}\", var), format!(\"template\")",
        descLong: "println!, format!, and related macros support format strings. Common patterns: {} for Display, {:?} for Debug, {:.2} for precision.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of String Formatting & Printing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let name = \"Rust\";\n    let version = 1;\n\n    println!(\"Hello, {}!\", name);\n    println!(\"{} version {}\", name, version);\n\n    let num = 42;\n    println!(\"Decimal: {}\", num);\n    println!(\"Hex: {:x}\", num);\n    println!(\"Binary: {:b}\", num);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of String Formatting & Printing — common patterns you'll see in production.\n// APPROACH  - Combine String Formatting & Printing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet float = 3.14159;\n    println!(\"Full: {}\", float);\n    println!(\"2 decimals: {:.2}\", float);\n\n    let debug_val = (1, 2, 3);\n    println!(\"Debug: {:?}\", debug_val);\n    println!(\"Pretty: {:#?}\", debug_val);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of String Formatting & Printing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet formatted = format!(\"Result: {}\", 42 * 2);\n    println!(\"{}\", formatted);\n}"
                  }
        ],
        tips: [
                  "Use {} for Display trait and {:?} for Debug output.",
                  "Use {:.2} for decimal places, {:x} for hex, {:b} for binary.",
                  "println! adds a newline; print! does not. format! returns a String."
        ],
        mistake: "Using println! with wrong trait (Debug instead of Display).",
        shorthand: {
          verbose: "struct Counter {\n    count: u32,\n    max: u32,\n}\n\nimpl Count",
          concise: "// see verbose",
        },
      },
      {
        id: "osstring-path",
        fn: "OsString & Path",
        desc: "Platform-specific string types.",
        category: "Strings",
        subtitle: "System interop",
        signature: "OsString, Path, PathBuf",
        descLong: "OsString and Path types handle OS-specific strings (Windows uses UTF-16). PathBuf is the owned version of Path.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of OsString & Path — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::ffi::OsString;\nuse std::path::{Path, PathBuf};\n\nfn main() {\n    let os_string = OsString::from(\"file.txt\");\n    println!(\"OsString: {:?}\", os_string);\n\n    let path = Path::new(\"src/main.rs\");\n    println!(\"Path: {:?}\", path);\n    println!(\"File name: {:?}\", path.file_name());\n    println!(\"Extension: {:?}\", path.extension());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of OsString & Path — common patterns you'll see in production.\n// APPROACH  - Combine OsString & Path with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut path_buf = PathBuf::from(\"src\");\n    path_buf.push(\"lib.rs\");\n    println!(\"PathBuf: {:?}\", path_buf);\n\n    if path.exists() {\n        println!(\"Path exists\");\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of OsString & Path — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet display = path.display();\n    println!(\"Display: {}\", display);\n}"
                  }
        ],
        tips: [
                  "Use Path for file operations",
                  "PathBuf is mutable, Path is borrowed",
                  "Path::new() creates from &str",
                  "Methods: file_name(), extension(), parent()",
                  "OsString for system APIs",
                  "Never lose the .0 reference"
        ],
        mistake: "Assuming paths are UTF-8; some are not.",
        shorthand: {
          verbose: "use std::ffi::OsString;\nuse std::path::{Path, PathBuf};\n\nfn main() {\n    let os_string = OsString::f",
          concise: "// see verbose",
        },
      },
      {
        id: "string-parsing",
        fn: "String Parsing",
        desc: "Convert strings to other types.",
        category: "Strings",
        subtitle: "parse() method",
        signature: "str.parse::<T>() -> Result<T, E>",
        descLong: "parse() converts strings to other types. Returns Result. Use turbofish syntax or explicit type to specify target type.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of String Parsing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let num_str = \"42\";\n    let num: i32 = num_str.parse().unwrap();\n    println!(\"Parsed: {}\", num);\n\n    let float_str = \"3.14\";\n    let float: f64 = float_str.parse().expect(\"Invalid float\");\n    println!(\"Float: {}\", float);\n\n    let bool_str = \"true\";\n    let boolean: bool = bool_str.parse().unwrap();\n    println!(\"Bool: {}\", boolean);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of String Parsing — common patterns you'll see in production.\n// APPROACH  - Combine String Parsing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet tuple_str = \"1,2,3\";\n    let parts: Vec<i32> = tuple_str\n        .split(',')\n        .map(|s| s.parse().unwrap())\n        .collect();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of String Parsing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"Parts: {:?}\", parts);\n\n    match \"invalid\".parse::<i32>() {\n        Ok(n) => println!(\"Parsed: {}\", n),\n        Err(e) => println!(\"Error: {}\", e),\n    }\n}"
                  }
        ],
        tips: [
                  "parse() returns Result",
                  "Specify type with turbofish or annotation",
                  "Use .split() for multiple values",
                  "Chain .parse() in iterator",
                  "Handles common types: i32, f64, bool, etc."
        ],
        mistake: "Not handling parse errors; use .parse()?.",
        shorthand: {
          verbose: "fn main() {\n    let num_str = \"42\";\n    let num: i32 = num_str.parse().unwrap();\n    println!(\"Parse",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
