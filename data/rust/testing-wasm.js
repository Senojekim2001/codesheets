export const meta = {
  "id": "testing-wasm",
  "label": "Testing, WASM & Build",
  "icon": "🧪",
  "description": "Rust testing patterns (unit, integration, doc tests), build scripts, WASM compilation, and benchmarking with criterion."
}

export const sections = [

  // ── Section 1: Testing Patterns & Benchmarking ─────────────────────────────────────────
  {
    id: "testing-patterns",
    title: "Testing Patterns & Benchmarking",
    entries: [
      {
        id: "rust-testing",
        fn: "Unit, Integration & Doc Tests — Comprehensive Testing",
        desc: "Rust testing: inline unit tests, integration tests, doc tests that verify examples, test organization, and custom assertions.",
        category: "Testing",
        subtitle: "#[cfg(test)], #[test], tests/ directory, doc tests, #[should_panic], assert_eq!",
        signature: "#[cfg(test)] mod tests { #[test] fn it_works() { assert_eq!(2+2, 4); } }",
        descLong: "Rust has first-class testing support. Unit tests live alongside code in #[cfg(test)] modules — they can test private functions. Integration tests go in tests/ directory and test the public API only. Doc tests are code examples in documentation that are compiled and run as tests — they verify examples stay correct. #[should_panic] tests expected failures. assert_eq!/assert_ne! provide detailed diff output on failure. Use #[ignore] for slow tests run only with --ignored flag.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Unit, Integration & Doc Tests — Comprehensive Testing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Unit tests (in the same file) ────────────────────\npub fn validate_email(email: &str) -> Result<(), &'static str> {\n    if email.is_empty() {\n        return Err(\"email cannot be empty\");\n    }\n    if !email.contains('@') {\n        return Err(\"email must contain @\");\n    }\n    if email.ends_with('@') {\n        return Err(\"email must have domain after @\");\n    }\n    Ok(())\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn valid_email() {\n        assert!(validate_email(\"user@example.com\").is_ok());\n    }\n\n    #[test]\n    fn empty_email() {\n        assert_eq!(\n            validate_email(\"\"),\n            Err(\"email cannot be empty\")\n        );\n    }\n\n    #[test]\n    fn missing_at() {\n        let result = validate_email(\"userexample.com\");\n        assert!(result.is_err());\n        assert_eq!(result.unwrap_err(), \"email must contain @\");\n    }\n\n    #[test]\n    #[should_panic(expected = \"index out of bounds\")]\n    fn panics_on_bad_index() {\n        let v = vec![1, 2, 3];\n        let _ = v[10];\n    }\n\n    #[test]\n    #[ignore] // slow test — run with: cargo test -- --ignored\n    fn expensive_computation() {\n        // ... long-running test\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Unit, Integration & Doc Tests — Comprehensive Testing — common patterns you'll see in production.\n// APPROACH  - Combine Unit, Integration & Doc Tests — Comprehensive Testing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Test with setup/teardown\n    fn setup() -> TempDir {\n        TempDir::new().unwrap()\n    }\n\n    #[test]\n    fn writes_file() {\n        let dir = setup();\n        write_data(dir.path(), \"test data\").unwrap();\n        let content = std::fs::read_to_string(dir.path().join(\"data.txt\")).unwrap();\n        assert_eq!(content, \"test data\");\n    } // dir dropped here — cleanup automatic via Drop\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Unit, Integration & Doc Tests — Comprehensive Testing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Doc tests (in documentation comments) ───────────,/// Adds two numbers together.,///,/// # Examples,///,/// ```,/// let result = mylib::add(2, 3);,/// assert_eq!(result, 5);,/// ```,///,/// Negative numbers work too:,///,/// ```,/// assert_eq!(mylib::add(-1, 1), 0);,/// ```,pub fn add(a: i32, b: i32) -> i32 {,    a + b,},\n\n// ── Integration tests (tests/ directory) ────────────,// File: tests/api_test.rs,// use mylib::Client;,//,// #[test],// fn full_workflow() {,//     let client = Client::new(\"http://localhost:8080\");,//     let user = client.create_user(\"Alice\").unwrap();,//     assert_eq!(user.name, \"Alice\");,//     let fetched = client.get_user(user.id).unwrap();,//     assert_eq!(fetched.name, \"Alice\");,// },\n\n// ── Benchmarking with criterion ─────────────────────,// Cargo.toml: [dev-dependencies] criterion = { version = \"0.5\", features = [\"html_reports\"] },// [[bench]] name = \"my_benchmark\" harness = false,\n\n// benches/my_benchmark.rs:,// use criterion::{black_box, criterion_group, criterion_main, Criterion};,//,// fn bench_sort(c: &mut Criterion) {,//     c.bench_function(\"sort 1000\", |b| {,//         b.iter(|| {,//             let mut v: Vec<i32> = (0..1000).rev().collect();,//             v.sort();,//             black_box(v);,//         }),//     });,// },//,// criterion_group!(benches, bench_sort);,// criterion_main!(benches);,// Run: cargo bench"
                  }
        ],
        tips: [
                  "#[cfg(test)] modules are compiled only during testing — they add zero overhead to release builds.",
                  "Doc tests are the best documentation: they are guaranteed to compile and pass, so examples never go stale.",
                  "criterion provides statistical benchmarks with confidence intervals — much more reliable than manual timing.",
                  "Use cargo test -- --test-threads=1 to run tests sequentially when they share resources (files, databases)."
        ],
        mistake: "Using println! for debugging tests — use assert_eq! with descriptive messages instead. println! output is captured by default; use cargo test -- --nocapture to see it, or better yet, use proper assertions.",
        shorthand: {
          verbose: "// Manual test harness (verbose, boilerplate-heavy)\nfn main() {\n  let mut passed = 0;\n  let result = validate_email(\"test@example.com\");\n  if result.is_ok() { passed += 1; }\n  println!(\"Tests: {}\", passed);\n}",
          concise: "#[test]\nfn it_works() {\n  assert_eq!(2+2, 4);\n}",
        },
      },
      {
        id: "rust-test-basics",
        fn: "Unit Test Basics — #[test], #[cfg(test)], Assertions",
        desc: "Rust testing fundamentals: unit tests, test modules, cargo test, and assertions with descriptive messages.",
        category: "Testing",
        subtitle: "#[test], #[cfg(test)] mod tests, assert!, assert_eq!, cargo test",
        signature: "#[cfg(test)] mod tests { #[test] fn name() { assert_eq!(...); } }",
        descLong: "Rust has testing built into the language. Tests are functions marked with #[test] inside #[cfg(test)] modules. These modules are compiled only during testing. Assertions like assert_eq! provide diff output on failure. Test functions can panic! or return Result<(), E> for better error messages. Tests are run in parallel by default with cargo test. Use #[ignore] to skip slow tests.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Unit Test Basics — #[test], #[cfg(test)], Assertions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Unit test module ────────────────────────────────\npub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\npub fn divide(a: i32, b: i32) -> Result<i32, String> {\n    if b == 0 {\n        Err(\"division by zero\".to_string())\n    } else {\n        Ok(a / b)\n    }\n}\n\n#[cfg(test)]\nmod tests {\n    use super::*;\n\n    #[test]\n    fn test_add() {\n        assert_eq!(add(2, 3), 5);\n    }\n\n    #[test]\n    fn test_add_negative() {\n        assert_eq!(add(-1, 1), 0);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Unit Test Basics — #[test], #[cfg(test)], Assertions — common patterns you'll see in production.\n// APPROACH  - Combine Unit Test Basics — #[test], #[cfg(test)], Assertions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Result-based test ────────────────────────────\n    #[test]\n    fn test_divide() -> Result<(), String> {\n        let result = divide(10, 2)?;\n        assert_eq!(result, 5);\n        Ok(())\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Unit Test Basics — #[test], #[cfg(test)], Assertions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Test error case ─────────────────────────────,    #[test],    fn test_divide_by_zero() {,        let result = divide(10, 0);,        assert!(result.is_err());,        assert_eq!(,            result.unwrap_err(),,            \"division by zero\",        );,    },\n\n    // ── Assertion with message ──────────────────────,    #[test],    fn test_range() {,        let value = 5;,        assert!(,            value >= 0 && value <= 10,,            \"value {} out of range [0, 10]\",,            value,        );,    },\n\n    // ── Debug output on assertion failure ────────────,    #[test],    fn test_detailed_eq() {,        let expected = vec![1, 2, 3];,        let actual = vec![1, 2, 4];,        assert_eq!(expected, actual, \"vectors should match\");,        // Prints: assertion failed: expected == actual,        //   expected: [1, 2, 3],        //     actual: [1, 2, 4],    },\n\n    // ── Run with: cargo test -- --nocapture,    #[test],    fn test_with_output() {,        println!(\"This is visible with --nocapture\");,        assert_eq!(1, 1);,    },},\n\n// ── Run tests: cargo test,// ── Run one test: cargo test test_add,// ── Parallel: cargo test -- --test-threads=1 (sequential)"
                  }
        ],
        tips: [
                  "Write Result<(), E>-returning tests instead of panicking — gives better error messages.",
                  "assert_eq! prints diffs — much better than assert!(a == b) for debugging failures.",
                  "Use --test-threads=1 when tests share mutable state (files, databases).",
                  "println!() is captured by default — use cargo test -- --nocapture to see output."
        ],
        mistake: "Panicking in tests instead of returning Result — panics hide the actual error message.",
        shorthand: {
          verbose: "// Manual verification (verbose)\nlet result = divide(10, 2);\nif let Ok(val) = result {\n  if val != 5 { panic!(\"wrong result\"); }\n} else {\n  panic!(\"divide failed\");\n}",
          concise: "#[test]\nfn it_works() {\n  assert_eq!(divide(10, 2)?, 5);\n}",
        },
      },
      {
        id: "test-attributes",
        fn: "Test Attributes — #[should_panic], #[ignore], #[bench]",
        desc: "Control test execution: expect panics, ignore slow tests, filter tests, and benchmark with #[bench].",
        category: "Testing",
        subtitle: "#[should_panic], #[ignore], #[bench], test filtering, --exact",
        signature: "#[test]\n#[should_panic(expected = \"message\")]  |  #[ignore]  |  #[bench] fn name(b: &mut Bencher)",
        descLong: "Test attributes control behavior. #[should_panic] expects the test to panic — useful for testing error conditions. #[ignore] skips tests (run with --ignored). #[bench] marks benchmarks (nightly only, run with --bench). Tests can be filtered by name: cargo test pattern runs only tests matching pattern. Use --exact for exact match. Test attributes can be stacked: #[test] #[should_panic] #[ignore].",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Attributes — #[should_panic], #[ignore], #[bench] — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#[cfg(test)]\nmod tests {\n    // ── Expect panic ────────────────────────────────\n    #[test]\n    #[should_panic]\n    fn test_panic() {\n        panic!(\"expected panic\");\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Attributes — #[should_panic], #[ignore], #[bench] — common patterns you'll see in production.\n// APPROACH  - Combine Test Attributes — #[should_panic], #[ignore], #[bench] with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Check panic message ─────────────────────────\n    #[test]\n    #[should_panic(expected = \"invalid input\")]\n    fn test_panic_with_message() {\n        if true {\n            panic!(\"invalid input: too large\");\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Attributes — #[should_panic], #[ignore], #[bench] — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Ignored test (skip by default) ──────────────,    #[test],    #[ignore],    fn test_slow_operation() {,        // Long-running test,        std::thread::sleep(std::time::Duration::from_secs(10));,    },\n\n    // ── Multiple attributes ────────────────────────,    #[test],    #[ignore],    #[should_panic],    fn test_ignored_and_should_panic() {,        panic!(\"This test is skipped by default\");,    },\n\n    // ── Benchmark (nightly only) ────────────────────,    #![feature(test)],    extern crate test;,    use test::Bencher;,,    pub fn expensive_function(n: u32) -> u32 {,        (0..n).sum(),    },,    #[bench],    fn bench_expensive(b: &mut Bencher) {,        b.iter(|| expensive_function(1000));,    },},\n\n// ── Test filtering ──────────────────────────────────,// cargo test                  — run all tests,// cargo test test_panic       — run tests matching \"test_panic\",// cargo test --exact test_panic  — run exact match only,// cargo test -- --ignored     — run only #[ignore] tests,// cargo test -- --test-threads=1  — sequential execution,// cargo test -- --nocapture   — show println! output"
                  }
        ],
        tips: [
                  "#[should_panic(expected = \"...\")] checks message — without expected, any panic passes.",
                  "#[ignore] tests are useful for slow tests (crypto, large computations) — run with --ignored.",
                  "Test names are part of the filter — use descriptive names like test_divide_by_zero_panics.",
                  "#[bench] is nightly only — use criterion.rs for stable benchmarking."
        ],
        mistake: "Using #[should_panic] without expected message — a panic with wrong error is hard to debug.",
        shorthand: {
          verbose: "// Manual panic check (verbose)\nstd::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {\n  my_function();\n})).expect_err(\"should have panicked\");",
          concise: "#[test]\n#[should_panic]\nfn test_panics() {\n  my_function();\n}",
        },
      },
      {
        id: "integration-tests",
        fn: "Integration Tests — tests/ Directory & Common Module Pattern",
        desc: "Write integration tests in tests/ directory, test public APIs only, and share code with common/mod.rs pattern.",
        category: "Testing",
        subtitle: "tests/ directory, separate crate, common/mod.rs, full workflow testing",
        signature: "// tests/api_test.rs — separate file, imports public API",
        descLong: "Integration tests live in tests/ directory (next to src/). Each .rs file becomes a separate crate that imports your lib as an external crate — tests the public API only. tests/common/mod.rs creates a shared module for helpers. Integration tests run after unit tests and test full workflows across multiple modules. Useful for testing error scenarios, concurrency, and user-level APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Integration Tests — tests/ Directory & Common Module Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// File: tests/common/mod.rs (shared helpers)\nuse std::fs;\n\npub fn setup_test_dir(name: &str) -> String {\n    let dir = format!(\"/tmp/test_{}\", name);\n    fs::create_dir_all(&dir).unwrap();\n    dir\n}\n\npub fn cleanup_test_dir(dir: &str) {\n    fs::remove_dir_all(dir).ok();\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Integration Tests — tests/ Directory & Common Module Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Integration Tests — tests/ Directory & Common Module Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// File: tests/integration_test.rs\nuse mylib::{Client, User};\nmod common;\n\n#[test]\nfn test_create_and_fetch_user() {\n    let client = Client::new(\"http://localhost:8080\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Integration Tests — tests/ Directory & Common Module Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Create,    let user = client.create_user(\"Alice\").unwrap();,    assert_eq!(user.name, \"Alice\");,\n\n    // Fetch,    let fetched = client.get_user(user.id).unwrap();,    assert_eq!(fetched.name, \"Alice\");,\n\n    // Delete,    assert!(client.delete_user(user.id).is_ok());,},,#[test],fn test_user_validation() {,    let client = Client::new(\"http://localhost:8080\");,\n\n    // Empty name fails,    let result = client.create_user(\"\");,    assert!(result.is_err());,},,#[test],fn test_with_temp_files() {,    let test_dir = common::setup_test_dir(\"files\");,    let path = format!(\"{}/data.txt\", test_dir);,\n\n    // Use test files,    std::fs::write(&path, \"test data\").unwrap();,    let content = std::fs::read_to_string(&path).unwrap();,    assert_eq!(content, \"test data\");,\n\n    // Cleanup,    common::cleanup_test_dir(&test_dir);,},\n\n// ── Test async code ─────────────────────────────────,#[tokio::test],async fn test_async_workflow() {,    let client = Client::new(\"http://localhost:8080\");,    let user = client.create_user_async(\"Bob\").await.unwrap();,    assert_eq!(user.name, \"Bob\");,},\n\n// ── Doctest (from src/) ─────────────────────────────,// cargo test --doc"
                  }
        ],
        tips: [
                  "tests/ files are crates — they only see public API.",
                  "Use tests/common/mod.rs to share helper functions.",
                  "#[tokio::test] for async integration tests — adds test support to async functions.",
                  "Integration tests run after unit tests — good for slow, full-stack tests."
        ],
        mistake: "Testing private functions in integration tests — they can't access private API. Test public behavior instead.",
        shorthand: {
          verbose: "// Unit test file (tests private details)\n#[test]\nfn test_internal_helper() {\n  assert_eq!(internal_add(2, 3), 5);\n}",
          concise: "// tests/api_test.rs (integration test)\n#[test]\nfn test_public_api() {\n  let result = public_function();\n}",
        },
      },
      {
        id: "proptest-basics",
        fn: "Property Testing with proptest — Generative & Shrinking",
        desc: "Use proptest for property testing: generate random inputs, test properties, and automatic shrinking on failure.",
        category: "Testing",
        subtitle: "proptest!, strategies, proptest::string, prop::*, shrinking, regression",
        signature: "proptest!(|(x in 0..100)| { assert!(property(x)); });",
        descLong: "Property testing generates random inputs to find edge cases. proptest! macro takes a pattern-matched variable, a strategy (0..100, \".*\", etc.), and a closure testing a property. When a property fails, proptest shrinks the input to the minimal counterexample. Strategies: 0..100 (range), \".*\" (regex), prop::vec, prop::option, prop::bool. Excellent for finding bugs in algorithms.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Property Testing with proptest — Generative & Shrinking — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse proptest::proptest;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Property Testing with proptest — Generative & Shrinking — common patterns you'll see in production.\n// APPROACH  - Combine Property Testing with proptest — Generative & Shrinking with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic property test ─────────────────────────────\nproptest! {\n    #[test]\n    fn test_sort_idempotent(ref mut v in prop::collection::vec(0i32..100, 0..100)) {\n        let original = v.clone();\n        v.sort();\n        let sorted = v.clone();\n        v.sort();\n        assert_eq!(sorted, *v, \"Sort should be idempotent\");\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Property Testing with proptest — Generative & Shrinking — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Test properties with multiple inputs ────────────,proptest! {,    #[test],    fn test_add_commutative(a in 0i32..1000, b in 0i32..1000) {,        assert_eq!(a + b, b + a, \"Addition is commutative\");,    },},\n\n// ── String strategy ─────────────────────────────────,use proptest::string::string_regex;,,proptest! {,    #[test],    fn test_email_validation(email in r\"[a-z]+@[a-z]+.[a-z]{2,4}\") {,        assert!(is_valid_email(&email), \"Email should be valid\");,    },},,fn is_valid_email(email: &str) -> bool {,    email.contains('@') && email.contains('.'),},\n\n// ── Complex strategy ────────────────────────────────,use proptest::prelude::*;,,#[derive(Debug, Clone)],struct Person {,    name: String,,    age: u32,,},,fn arb_person() -> impl Strategy<Value = Person> {,    (r\"[a-z]{3,10}\", 0u32..150).prop_map(|(name, age)| Person { name, age }),},,proptest! {,    #[test],    fn test_person_serialize(p in arb_person()) {,        let json = serde_json::to_string(&p).unwrap();,        let parsed: Person = serde_json::from_str(&json).unwrap();,        assert_eq!(p.name, parsed.name);,        assert_eq!(p.age, parsed.age);,    },},\n\n// ── Options and unwrap safety ───────────────────────,proptest! {,    #[test],    fn test_parse_never_panics(s in \".*\") {,        // Should not panic, even with weird inputs,        let _ = s.parse::<i32>();,    },},\n\n// ── Shrinking demonstration ────────────────────────,proptest! {,    #[test],    fn test_vec_len(ref v in prop::collection::vec(0..100, 0..1000)) {,        // If this fails on a large vec, proptest shrinks it,        // to the smallest failing case,        assert!(v.len() <= 500, \"Vector too large: {}\", v.len());,    },},\n\n// ── Regression testing ──────────────────────────────,proptest! {,    #![proptest_config(ProptestConfig::with_cases(1000))],    #[test],    fn test_division_no_panic(a in any::<i32>(), b in 1i32..=i32::MAX) {,        let _ = a / b;  // Should never panic,    },}"
                  }
        ],
        tips: [
                  "Shrinking automatically finds minimal failing input — saves debugging time.",
                  "Custom strategies: use prop_map to transform values.",
                  "Test invariants (idempotency, commutativity) rather than specific outputs.",
                  "proptest finds edge cases (overflow, empty vecs) that manual tests miss."
        ],
        mistake: "Writing too-specific assertions — test general properties instead of specific inputs.",
        shorthand: {
          verbose: "// Manual test many values (verbose)\nfor i in 0..1000 {\n  let a = rand::random::<i32>();\n  let b = rand::random::<i32>();\n  assert_eq!(a + b, b + a);\n}",
          concise: "proptest!(|(a in any::<i32>(), b in any::<i32>())| {\n  assert_eq!(a + b, b + a);\n});",
        },
      },
      {
        id: "rstest-basics",
        fn: "Parametrized Tests with rstest — #[rstest], Fixtures, Cases",
        desc: "Use rstest for parametrized tests: run same test with multiple inputs, fixtures for setup, and case-based testing.",
        category: "Testing",
        subtitle: "#[rstest], #[case], #[fixture], test matrix, parametrized inputs",
        signature: "#[rstest]\n#[case(input, expected)]\nfn test(#[case] input: Type, expected: Type) { ... }",
        descLong: "rstest provides parametrized testing and fixtures. #[rstest] attribute defines a test that runs multiple times. #[case(...)] provides input/expected pairs — test runs once per case. #[fixture] defines reusable setup. Fixtures can be combined to create test matrices. More ergonomic than hardcoding test cases in loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Parametrized Tests with rstest — #[rstest], Fixtures, Cases — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse rstest::rstest;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Parametrized Tests with rstest — #[rstest], Fixtures, Cases — common patterns you'll see in production.\n// APPROACH  - Combine Parametrized Tests with rstest — #[rstest], Fixtures, Cases with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic parametrized test ────────────────────────\n#[rstest]\n#[case(2, 2, 4)]\n#[case(0, 0, 0)]\n#[case(-1, 1, 0)]\n#[case(100, 200, 300)]\nfn test_add(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {\n    assert_eq!(a + b, expected);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Parametrized Tests with rstest — #[rstest], Fixtures, Cases — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Test with fixture ───────────────────────────────,#[fixture],fn temp_dir() -> String {,    format!(\"/tmp/test_{}\", rand::random::<u64>()),},,#[rstest],#[case(\"file1.txt\", \"content1\")],#[case(\"file2.txt\", \"content2\")],fn test_write_file(temp_dir: String, #[case] name: &str, #[case] content: &str) {,    let path = format!(\"{}/{}\", temp_dir, name);,    std::fs::write(&path, content).unwrap();,    let read = std::fs::read_to_string(&path).unwrap();,    assert_eq!(read, content);,},\n\n// ── Multiple fixtures (test matrix) ─────────────────,#[fixture],fn user_a() -> String {,    \"Alice\".to_string(),},,#[fixture],fn user_b() -> String {,    \"Bob\".to_string(),},,#[rstest],fn test_user_pairing(user_a: String, user_b: String) {,    // Runs 1 time (both fixtures),    assert_ne!(user_a, user_b);,},\n\n// ── Parametrized fixture ───────────────────────────,#[fixture],#[once]  // Run once per test function,fn database() -> MockDb {,    MockDb::new(),},,#[rstest],#[case(\"SELECT *\")],#[case(\"INSERT INTO ...\")],fn test_query(database: MockDb, #[case] query: &str) {,    let result = database.execute(query);,    assert!(result.is_ok());,},\n\n// ── Value matrix ────────────────────────────────────,#[rstest],#[case::empty(vec![], 0)],#[case::single(vec![1], 1)],#[case::multiple(vec![1, 2, 3], 3)],#[case::large(vec![0; 1000], 1000)],fn test_vec_len(#[case] v: Vec<i32>, #[case] expected_len: usize) {,    assert_eq!(v.len(), expected_len);,},\n\n// ── Async rstest ────────────────────────────────────,#[rstest],#[case(1)],#[case(2)],#[case(10)],#[tokio::test],async fn test_async(#[case] n: i32) {,    let result = async_function(n).await;,    assert!(result > 0);,},,async fn async_function(n: i32) -> i32 {,    tokio::time::sleep(std::time::Duration::from_millis(10)).await;,    n * 2,}"
                  }
        ],
        tips: [
                  "#[case(...)] names help with test output — #[case::empty], #[case::large] are descriptive.",
                  "Fixtures are reused per test function — mark #[once] to reuse across test cases.",
                  "Test matrices automatically expand — fixture A × fixture B × #[case] creates many combinations.",
                  "rstest works with #[tokio::test], #[actix_rt::test], etc."
        ],
        mistake: "Hardcoding test cases in loops instead of using #[case] — rstest gives better error messages per case.",
        shorthand: {
          verbose: "// Loop-based tests (verbose)\nfor (a, b, expected) in vec![(2, 2, 4), (0, 0, 0)] {\n  assert_eq!(a + b, expected);\n}",
          concise: "#[rstest]\n#[case(2, 2, 4)]\n#[case(0, 0, 0)]\nfn test_add(#[case] a: i32, #[case] b: i32, #[case] expected: i32)",
        },
      },
      {
        id: "cargo-nextest",
        fn: "Fast Testing with cargo-nextest — Parallel Runner & Flaky Test Handling",
        desc: "Use nextest for faster parallel test execution: JUnit XML output, retry flaky tests, and better reporting.",
        category: "Testing",
        subtitle: "cargo-nextest, nextest run, --retries, JUnit XML, test filtering",
        signature: "cargo nextest run  |  cargo nextest run --retries 2  |  nextest run --output-format=junit",
        descLong: "cargo-nextest is a faster test runner that replaces cargo test. It runs tests in true parallelism (independent test processes), shows real-time progress, and has better error reporting. Built-in retry with --retries for flaky tests. Outputs JUnit XML for CI systems. Can filter by test type: unit, integration, all. Supports all test attributes. Faster on CI and local development.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fast Testing with cargo-nextest — Parallel Runner & Flaky Test Handling — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml: Add nextest dev-dependency (or install globally)\n// [dev-dependencies]\n// # Any existing test dependencies"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fast Testing with cargo-nextest — Parallel Runner & Flaky Test Handling — common patterns you'll see in production.\n// APPROACH  - Combine Fast Testing with cargo-nextest — Parallel Runner & Flaky Test Handling with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Run all tests (faster than cargo test) ─────────\n// cargo nextest run"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fast Testing with cargo-nextest — Parallel Runner & Flaky Test Handling — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Run with retries for flaky tests ────────────────,// cargo nextest run --retries 2,// Each failed test retried up to 2 times,\n\n// ── Filter by test name ─────────────────────────────,// cargo nextest run \"test_add\",\n\n// ── Run only unit tests ─────────────────────────────,// cargo nextest run --lib,\n\n// ── Run only integration tests ──────────────────────,// cargo nextest run --test \"*\",\n\n// ── Output JUnit XML (for CI) ───────────────────────,// cargo nextest run --output-format=junit > results.xml,\n\n// ── Run with custom configuration ───────────────────,// Create .cargo/nextest.toml:,// [profile.default],// retries = 2,// test-threads = \"num-cpus\",// Then: cargo nextest run,\n\n// Example test file:,#[cfg(test)],mod tests {,    use std::sync::atomic::{AtomicUsize, Ordering};,    use std::sync::Arc;,\n\n    // ── Flaky test that nextest handles with --retries ─,    static CALL_COUNT: AtomicUsize = AtomicUsize::new(0);,,    #[test],    fn flaky_test() {,        let count = CALL_COUNT.fetch_add(1, Ordering::SeqCst);,        // Fails first time, passes second time,        assert!(count > 0, \"First call fails\");,    },\n\n    // ── Stable test ────────────────────────────────────,    #[test],    fn stable_test() {,        assert_eq!(2 + 2, 4);,    },\n\n    // ── Tests run in parallel (independent) ──────────,    #[test],    fn test_parallel_1() {,        std::thread::sleep(std::time::Duration::from_millis(100));,        assert_eq!(1, 1);,    },,    #[test],    fn test_parallel_2() {,        std::thread::sleep(std::time::Duration::from_millis(100));,        assert_eq!(2, 2);,    },},\n\n// Installation: cargo install cargo-nextest,// Then: cargo nextest run"
                  }
        ],
        tips: [
                  "Nextest runs tests in separate processes — better parallelism than cargo test.",
                  "--retries 2 automatically retries failed tests — great for flaky tests in CI.",
                  "JUnit output integrates with CI systems (GitHub Actions, Jenkins, etc.).",
                  "Configure default retries in .cargo/nextest.toml — prevents command-line flag repetition."
        ],
        mistake: "Using nextest for tests with shared mutable state — tests must be independent. Move state to fixtures.",
        shorthand: {
          verbose: "// Retry logic in CI (manual, verbose)\nfor i in 1..3; do\n  cargo test && break || true\ndone",
          concise: "cargo nextest run --retries 2  // automatic retry",
        },
      },
      {
        id: "test-doubles",
        fn: "Mocking & Test Doubles — mockall, #[automock], Custom Doubles",
        desc: "Use mockall crate for mocking: #[automock] for traits, mock! macro, expectations, and test doubles.",
        category: "Testing",
        subtitle: "#[automock], mock!, expect_*, times, MockBuilder, TestDouble trait",
        signature: "#[automock]\npub trait MyTrait { ... }  |  let mut mock = MockMyTrait::new();  |  mock.expect_method().times(2).returning(...)",
        descLong: "mockall is Rust's most popular mocking library. #[automock] on a trait generates a Mock<TraitName> for testing. Set expectations with mock.expect_method().returning(...). Verify call count with .times(n). Test doubles isolate code under test from dependencies (databases, APIs, external services). More flexible than manual fakes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Mocking & Test Doubles — mockall, #[automock], Custom Doubles — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse mockall::predicate::*;\nuse mockall::*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Mocking & Test Doubles — mockall, #[automock], Custom Doubles — common patterns you'll see in production.\n// APPROACH  - Combine Mocking & Test Doubles — mockall, #[automock], Custom Doubles with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Mock a trait ────────────────────────────────────\n#[automock]\npub trait Database {\n    fn get_user(&self, id: u64) -> Option<String>;\n    fn save_user(&mut self, id: u64, name: String) -> Result<(), String>;\n}\n\n#[test]\nfn test_with_mock_database() {\n    let mut mock_db = MockDatabase::new();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Mocking & Test Doubles — mockall, #[automock], Custom Doubles — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Expect get_user to be called once with id=1,    mock_db,        .expect_get_user(),        .with(eq(1)),        .times(1),        .returning(|_| Some(\"Alice\".to_string()));,\n\n    // Use the mock,    let name = mock_db.get_user(1);,    assert_eq!(name, Some(\"Alice\".to_string()));,},\n\n// ── Set multiple expectations ───────────────────────,#[test],fn test_save_and_get() {,    let mut mock = MockDatabase::new();,,    mock.expect_get_user(),        .returning(|_| Some(\"Alice\".to_string()));,,    mock.expect_save_user(),        .withf(|id, name| *id == 1 && name == \"Alice\"),        .times(1),        .returning(|_, _| Ok(()));,,    let _ = mock.get_user(1);,    let _ = mock.save_user(1, \"Alice\".to_string());,},\n\n// ── Test error handling ─────────────────────────────,#[test],fn test_handles_db_error() {,    let mut mock = MockDatabase::new();,,    mock.expect_save_user(),        .returning(|_, _| Err(\"connection lost\".to_string()));,,    let result = mock.save_user(1, \"Alice\".to_string());,    assert!(result.is_err());,},\n\n// ── Sequence of calls ───────────────────────────────,use mockall::Sequence;,,#[test],fn test_call_sequence() {,    let mut seq = Sequence::new();,    let mut mock = MockDatabase::new();,\n\n    // Expect these calls in order,    mock.expect_get_user(),        .times(1),        .in_sequence(&mut seq),        .returning(|_| None);,,    mock.expect_save_user(),        .times(1),        .in_sequence(&mut seq),        .returning(|_, _| Ok(()));,\n\n    // Code must call in this order or test fails,    assert_eq!(mock.get_user(1), None);,    mock.save_user(1, \"Bob\".to_string()).unwrap();,},\n\n// ── Custom return values ────────────────────────────,#[test],fn test_multiple_calls_different_returns() {,    let mut mock = MockDatabase::new();,,    mock.expect_get_user(),        .returning(|id| {,            if id == 1 {,                Some(\"Alice\".to_string()),            } else {,                None,            },        });,,    assert_eq!(mock.get_user(1), Some(\"Alice\".to_string()));,    assert_eq!(mock.get_user(2), None);,},\n\n// ── Mock in production code ─────────────────────────,pub struct UserService {,    db: Box<dyn Database>,,},,impl UserService {,    pub fn new(db: Box<dyn Database>) -> Self {,        Self { db },    },,    pub fn fetch_user(&self, id: u64) -> Option<String> {,        self.db.get_user(id),    },},,#[test],fn test_service_with_mock() {,    let mut mock = MockDatabase::new();,    mock.expect_get_user(),        .returning(|_| Some(\"Alice\".to_string()));,,    let service = UserService::new(Box::new(mock));,    assert_eq!(service.fetch_user(1), Some(\"Alice\".to_string()));,}"
                  }
        ],
        tips: [
                  "#[automock] generates Mock<TraitName> — works with any trait.",
                  ".returning(|args| result) sets the return value based on arguments.",
                  ".withf(|arg| predicate) filters by custom condition — more flexible than eq().",
                  ".times(n) verifies exact call count — helps catch bugs where code calls dependencies too often."
        ],
        mistake: "Over-mocking — mock only external dependencies (db, http, filesystem), not business logic.",
        shorthand: {
          verbose: "// Manual fake implementation (verbose)\nstruct FakeDatabase { data: HashMap<u64, String> }\nimpl Database for FakeDatabase { ... }\n// ... manually implement all trait methods",
          concise: "#[automock]\npub trait Database { ... }\n// Mock<Database> auto-generated",
        },
      },
      {
        id: "criterion-bench",
        fn: "Benchmarking with Criterion.rs — Statistical Analysis & HTML Reports",
        desc: "Build reliable benchmarks with criterion: statistical analysis, confidence intervals, HTML reports, and throughput.",
        category: "Testing",
        subtitle: "criterion_group!, criterion_main!, c.bench_function(), b.iter(), black_box, throughput",
        signature: "fn bench(c: &mut Criterion) { c.bench_function(\"name\", |b| b.iter(|| code())); }",
        descLong: "Criterion.rs is Rust's statistical benchmarking framework. It runs code many times, computes statistics (mean, std dev), and detects regressions with confidence intervals. black_box() prevents compiler optimizations from skewing results. Reports include HTML graphs, tables, and change detection. More reliable than raw timing with #[bench].",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Benchmarking with Criterion.rs — Statistical Analysis & HTML Reports — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml:\n// [dev-dependencies]\n// criterion = { version = \"0.5\", features = [\"html_reports\"] }\n// [[bench]]\n// name = \"my_benchmarks\"\n// harness = false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Benchmarking with Criterion.rs — Statistical Analysis & HTML Reports — common patterns you'll see in production.\n// APPROACH  - Combine Benchmarking with Criterion.rs — Statistical Analysis & HTML Reports with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// benches/my_benchmarks.rs:\nuse criterion::{black_box, criterion_group, criterion_main, Criterion, Throughput};\nuse std::time::Duration;\n\npub fn fibonacci(n: u32) -> u32 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => fibonacci(n - 1) + fibonacci(n - 2),\n    }\n}\n\npub fn sort_vec(mut v: Vec<i32>) -> Vec<i32> {\n    v.sort();\n    v\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Benchmarking with Criterion.rs — Statistical Analysis & HTML Reports — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Basic benchmark ────────────────────────────────,fn bench_fibonacci(c: &mut Criterion) {,    c.bench_function(\"fib_20\", |b| {,        b.iter(|| fibonacci(black_box(20))),    });,},\n\n// ── Multiple benchmarks ────────────────────────────,fn bench_sorting(c: &mut Criterion) {,    let mut group = c.benchmark_group(\"sorting\");,,    for size in [10, 100, 1000].iter() {,        group.bench_with_input(,            format!(\"sort_{}\", size),,            size,,            |b, &size| {,                let v: Vec<i32> = (0..size).rev().collect();,                b.iter(|| sort_vec(black_box(v.clone()))),            },,        );,    },    group.finish();,},\n\n// ── Throughput measurement ─────────────────────────,fn bench_throughput(c: &mut Criterion) {,    let mut group = c.benchmark_group(\"throughput\");,,    for bytes in [1024, 10240, 102400].iter() {,        group.throughput(Throughput::Bytes(*bytes as u64));,        group.bench_with_input(,            format!(\"process_{}_bytes\", bytes),,            bytes,,            |b, &bytes| {,                let data = vec![0u8; bytes];,                b.iter(|| process_data(black_box(&data))),            },,        );,    },    group.finish();,},,fn process_data(data: &[u8]) -> usize {,    data.iter().sum::<u8>() as usize,},\n\n// ── Baseline comparison ────────────────────────────,fn bench_with_baseline(c: &mut Criterion) {,    let mut group = c.benchmark_group(\"comparison\");,,    group.bench_function(\"algorithm_v1\", |b| {,        b.iter(|| algorithm_v1(black_box(1000))),    });,,    group.bench_function(\"algorithm_v2\", |b| {,        b.iter(|| algorithm_v2(black_box(1000))),    });,,    group.finish();,},,fn algorithm_v1(n: u32) -> u32 {,    (0..n).sum(),},,fn algorithm_v2(n: u32) -> u32 {,    n * (n + 1) / 2,},\n\n// ── Long-running bench ─────────────────────────────,fn bench_slow_operation(c: &mut Criterion) {,    let mut group = c.benchmark_group(\"slow\");,    group.sample_size(10);  // Only 10 iterations for slow tests,    group.measurement_time(Duration::from_secs(30));,,    group.bench_function(\"slow_io\", |b| {,        b.iter(|| std::thread::sleep(Duration::from_millis(10))),    });,,    group.finish();,},,criterion_group!(,    benches,,    bench_fibonacci,,    bench_sorting,,    bench_throughput,,    bench_with_baseline,,    bench_slow_operation,,);,criterion_main!(benches);,\n\n// Run: cargo bench,// View results: target/criterion/report/index.html"
                  }
        ],
        tips: [
                  "black_box() prevents compiler optimizations — essential for accurate benchmarks.",
                  "criterion detects regressions — compare runs to catch performance degradation.",
                  "Throughput measurements normalize by bytes/items — easier to compare algorithms.",
                  "criterion generates HTML reports with graphs — useful for stakeholders."
        ],
        mistake: "Benchmarking without black_box() — compiler may optimize away the code you're measuring.",
        shorthand: {
          verbose: "// Manual benchmark (verbose, unreliable)\nuse std::time::Instant;\nlet start = Instant::now();\nfor _ in 0..1000 { fibonacci(20); }\nprintln!(\"{}ms\", start.elapsed().as_millis());",
          concise: "c.bench_function(\"fib_20\", |b| {\n  b.iter(|| fibonacci(black_box(20)))\n});",
        },
      },
      {
        id: "test-coverage",
        fn: "Test Coverage — cargo-tarpaulin & cargo-llvm-cov",
        desc: "Measure code coverage: tarpaulin for quick coverage, llvm-cov for accurate LLVM-based coverage with HTML reports.",
        category: "Testing",
        subtitle: "cargo-tarpaulin, cargo-llvm-cov, --out Html, coverage thresholds",
        signature: "cargo tarpaulin --out Html  |  cargo llvm-cov --html  |  cargo llvm-cov report",
        descLong: "Code coverage measures which lines your tests execute. cargo-tarpaulin uses binary instrumentation, faster but less accurate. cargo-llvm-cov uses LLVM coverage, more accurate, slower. Both generate HTML reports showing coverage per file. Use coverage to identify untested code, but remember: 100% coverage does not mean 100% correct code. Focus on testing behavior, not just coverage metrics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Test Coverage — cargo-tarpaulin & cargo-llvm-cov — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Installation:\n// cargo install cargo-tarpaulin\n// cargo install cargo-llvm-cov"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Test Coverage — cargo-tarpaulin & cargo-llvm-cov — common patterns you'll see in production.\n// APPROACH  - Combine Test Coverage — cargo-tarpaulin & cargo-llvm-cov with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Generate coverage with tarpaulin ────────────────\n// cargo tarpaulin --out Html --output-dir coverage/\n// Open coverage/index.html"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Test Coverage — cargo-tarpaulin & cargo-llvm-cov — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Generate coverage with llvm-cov ─────────────────,// cargo llvm-cov --html,// Open target/llvm-cov/html/index.html,\n\n// ── Create coverage reports ────────────────────────,// cargo llvm-cov --html --packages mylib,\n\n// ── Use in CI (GitHub Actions) ──────────────────────,// name: Coverage,// on: [push, pull_request],// jobs:,//   coverage:,//     runs-on: ubuntu-latest,//     steps:,//       - uses: actions/checkout@v3,//       - uses: dtolnay/rust-toolchain@stable,//       - run: cargo install cargo-llvm-cov,//       - run: cargo llvm-cov --html,//       - uses: actions/upload-artifact@v3,//         with:,//           name: coverage-report,//           path: target/llvm-cov/html/,\n\n// Example: Function with coverage analysis,pub fn validate_input(input: &str) -> Result<i32, String> {,    if input.is_empty() {,        return Err(\"empty input\".to_string());,    },,    let value: i32 = input.parse(),        .map_err(|_| \"not a number\".to_string())?;,,    if value < 0 {,        return Err(\"negative not allowed\".to_string());,    },,    Ok(value),},,#[cfg(test)],mod tests {,    use super::*;,,    #[test],    fn test_valid() {,        assert_eq!(validate_input(\"42\").unwrap(), 42);,    },,    #[test],    fn test_empty() {,        assert!(validate_input(\"\").is_err());,    },,    #[test],    fn test_invalid_number() {,        assert!(validate_input(\"abc\").is_err());,    },\n\n    // Missing: test for negative case,    // This leaves one branch uncovered,},\n\n// Run: cargo llvm-cov --html,// Report shows: validate_input is 75% covered (3 of 4 branches tested)"
                  }
        ],
        tips: [
                  "cargo-llvm-cov is more accurate — uses LLVM coverage data.",
                  "Coverage is a metric, not a goal — focus on testing important code paths.",
                  "Use coverage to find untested error cases, not to reach arbitrary percentages.",
                  "CI integration with coverage reports helps catch coverage regressions."
        ],
        mistake: "Chasing 100% coverage — some paths are unreachable or not worth testing.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Manual coverage checking (verbose, error-prone)\n// Count lines executed manually in debug output\n// More explicit but longer",
          concise: "cargo llvm-cov --html  // auto-generates report",
        },
      },
    ],
  },

  // ── Section 2: WASM & Build Scripts ─────────────────────────────────────────
  {
    id: "wasm-build",
    title: "WASM & Build Scripts",
    entries: [
      {
        id: "wasm-buildrs",
        fn: "WASM Compilation & build.rs — Extending Rust Builds",
        desc: "Compile Rust to WebAssembly with wasm-bindgen/wasm-pack, and use build.rs for code generation, C linking, and protobuf.",
        category: "WASM",
        subtitle: "wasm-bindgen, wasm-pack, #[wasm_bindgen], build.rs, cc crate, protobuf codegen",
        signature: "#[wasm_bindgen] pub fn greet(name: &str) -> String  |  wasm-pack build --target web  |  build.rs",
        descLong: "Rust compiles to WebAssembly for browser and edge runtimes. wasm-bindgen bridges Rust and JavaScript types. wasm-pack builds, tests, and publishes WASM packages as npm modules. Build scripts (build.rs) run before compilation: link C libraries, generate code from protobuf/flatbuffers, embed build metadata, or compile C/C++ dependencies with the cc crate. Build scripts output cargo:rerun-if-changed directives for incremental builds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WASM Compilation & build.rs — Extending Rust Builds — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── WASM with wasm-bindgen ───────────────────────────\n// Cargo.toml:\n// [lib]\n// crate-type = [\"cdylib\", \"rlib\"]\n//\n// [dependencies]\n// wasm-bindgen = \"0.2\"\n// serde = { version = \"1\", features = [\"derive\"] }\n// serde-wasm-bindgen = \"0.6\"\n\nuse wasm_bindgen::prelude::*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WASM Compilation & build.rs — Extending Rust Builds — common patterns you'll see in production.\n// APPROACH  - Combine WASM Compilation & build.rs — Extending Rust Builds with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Expose Rust function to JavaScript\n#[wasm_bindgen]\npub fn greet(name: &str) -> String {\n    format!(\"Hello, {}!\", name)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WASM Compilation & build.rs — Extending Rust Builds — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Complex types with serde,#[wasm_bindgen],pub fn process_data(input: JsValue) -> Result<JsValue, JsError> {,    let data: Vec<f64> = serde_wasm_bindgen::from_value(input)?;,    let mean = data.iter().sum::<f64>() / data.len() as f64;,    let std_dev = (data.iter(),        .map(|x| (x - mean).powi(2)),        .sum::<f64>() / data.len() as f64),        .sqrt();,,    let result = serde_json::json!({ \"mean\": mean, \"std_dev\": std_dev });,    Ok(serde_wasm_bindgen::to_value(&result)?),},\n\n// Call JavaScript from Rust,#[wasm_bindgen],extern \"C\" {,    #[wasm_bindgen(js_namespace = console)],    fn log(s: &str);,,    #[wasm_bindgen(js_namespace = Math)],    fn random() -> f64;,},,#[wasm_bindgen],pub fn rust_log(msg: &str) {,    log(&format!(\"[Rust] {}\", msg));,},\n\n// Build: wasm-pack build --target web,// JavaScript usage:,// import init, { greet, process_data } from './pkg/my_wasm.js';,// await init();,// console.log(greet(\"World\"));,// const stats = process_data([1.0, 2.0, 3.0, 4.0, 5.0]);,\n\n// ── build.rs — custom build scripts ─────────────────,// build.rs (in project root):,\n\n// fn main() {,//     // Compile C code,//     cc::Build::new(),//         .file(\"src/fast_math.c\"),//         .opt_level(3),//         .compile(\"fast_math\");,//,//     // Generate protobuf code,//     prost_build::compile_protos(,//         &[\"proto/service.proto\"],,//         &[\"proto/\"],,//     ).unwrap();,//,//     // Embed build info,//     println!(\"cargo:rustc-env=BUILD_TIME={}\", chrono::Utc::now());,//     println!(\"cargo:rustc-env=GIT_HASH={}\",,//         std::process::Command::new(\"git\"),//             .args([\"rev-parse\", \"--short\", \"HEAD\"]),//             .output().map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string()),//             .unwrap_or_default(),//     );,//,//     // Only rerun if these change,//     println!(\"cargo:rerun-if-changed=src/fast_math.c\");,//     println!(\"cargo:rerun-if-changed=proto/service.proto\");,// },\n\n// Access build-time values in code:,// const BUILD_TIME: &str = env!(\"BUILD_TIME\");,// const GIT_HASH: &str = env!(\"GIT_HASH\");"
                  }
        ],
        tips: [
                  "wasm-pack build --target web creates an ES module you can import directly; --target bundler for webpack/vite.",
                  "#[wasm_bindgen] automatically generates TypeScript type definitions — consumers get full type safety.",
                  "build.rs runs at compile time — use println!(\"cargo:rerun-if-changed=path\") to avoid unnecessary rebuilds.",
                  "The cc crate compiles C/C++ code as part of your Rust build — perfect for wrapping existing C libraries."
        ],
        mistake: "Returning complex Rust types directly to JavaScript — WASM has a linear memory model. Use serde-wasm-bindgen to serialize to JsValue, or return simple types (numbers, strings) and build complex structures in JS.",
        shorthand: {
          verbose: "// Manual build script (verbose, fragile)\nfn main() {\n  println!(\"cargo:rustc-link-lib=m\");\n  println!(\"cargo:rustc-link-search=/usr/lib\");\n  // rerun logic, env vars, all manual\n}",
          concise: "// build.rs (automatic)\ncc::Build::new()\n  .file(\"src/lib.c\")\n  .compile(\"mylib\");",
        },
      },
      {
        id: "wasm-bindgen",
        fn: "WASM Bindgen — JavaScript ↔ Rust Type Bridge",
        desc: "Bridge JavaScript and Rust with wasm-bindgen: export functions, handle types, JsValue, web-sys bindings.",
        category: "WASM",
        subtitle: "#[wasm_bindgen], pub fn, JsValue, web-sys, serde-wasm-bindgen",
        signature: "#[wasm_bindgen]\npub fn rust_function(name: &str) -> String { ... }",
        descLong: "wasm-bindgen is the bridge between Rust and JavaScript. #[wasm_bindgen] functions become JavaScript functions. Simple types (i32, &str, bool) are converted automatically. Complex types use JsValue (opaque JS object handle). For structured data, use serde-wasm-bindgen to serialize/deserialize JSON. web-sys provides bindings to DOM/Web APIs. Automatic TypeScript definitions generated.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WASM Bindgen — JavaScript ↔ Rust Type Bridge — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml:\n// [dependencies]\n// wasm-bindgen = \"0.2\"\n// serde = { version = \"1\", features = [\"derive\"] }\n// serde-wasm-bindgen = \"0.6\"\n// web-sys = { version = \"0.3\", features = [\"Document\", \"Window\"] }\n\nuse wasm_bindgen::prelude::*;\nuse serde::{Serialize, Deserialize};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WASM Bindgen — JavaScript ↔ Rust Type Bridge — common patterns you'll see in production.\n// APPROACH  - Combine WASM Bindgen — JavaScript ↔ Rust Type Bridge with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple function ────────────────────────────────\n#[wasm_bindgen]\npub fn greet(name: &str) -> String {\n    format!(\"Hello, {}!\", name)\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WASM Bindgen — JavaScript ↔ Rust Type Bridge — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// JavaScript: greet(\"Alice\") => \"Hello, Alice!\",\n\n// ── Return complex types ───────────────────────────,#[derive(Serialize, Deserialize)],pub struct User {,    pub id: u64,,    pub name: String,,    pub email: String,,},,#[wasm_bindgen],pub fn create_user_json(json: JsValue) -> Result<JsValue, JsValue> {,    let user: User = serde_wasm_bindgen::from_value(json),        .map_err(|_| JsValue::from_str(\"Invalid user data\"))?;,,    let result = User {,        id: user.id,,        name: user.name.to_uppercase(),,        email: user.email,,    };,,    serde_wasm_bindgen::to_value(&result),        .map_err(|_| JsValue::from_str(\"Serialization failed\")),},\n\n// ── Call JavaScript from Rust ──────────────────────,#[wasm_bindgen],extern \"C\" {,    // Import window.alert,    #[wasm_bindgen(js_namespace = window)],    fn alert(s: &str);,\n\n    // Import Math.random(),    #[wasm_bindgen(js_namespace = Math)],    fn random() -> f64;,\n\n    // Import console.log,    #[wasm_bindgen(js_namespace = console)],    fn log(s: &str);,},,#[wasm_bindgen],pub fn use_js_functions(name: &str) {,    log(&format!(\"Hello, {}\", name));,    let rand = random();,    alert(&format!(\"Random: {}\", rand));,},\n\n// ── Work with DOM ──────────────────────────────────,use web_sys::{Document, window};,,#[wasm_bindgen],pub fn set_element_text(id: &str, text: &str) {,    if let Some(window) = window() {,        if let Ok(doc) = window.document() {,            if let Some(elem) = doc.get_element_by_id(id) {,                elem.set_text_content(Some(text));,            },        },    },},\n\n// ── Closure callback ───────────────────────────────,use wasm_bindgen::closure::Closure;,,#[wasm_bindgen],pub fn setup_button_click() {,    if let Some(window) = window() {,        if let Ok(doc) = window.document() {,            if let Some(button) = doc.get_element_by_id(\"mybutton\") {,                let closure = Closure::once(|| {,                    log(\"Button clicked!\");,                });,                button.add_event_listener_with_callback(,                    \"click\",,                    closure.as_ref().unchecked_ref(),,                ).ok();,                closure.forget();  // Keep closure alive,            },        },    },}"
                  }
        ],
        tips: [
                  "Simple types (i32, &str, bool) map automatically — no JsValue wrapper needed.",
                  "Use serde-wasm-bindgen for complex types — serializes to JSON automatically.",
                  "web-sys requires feature flags for each API — add [\"Document\", \"Window\"] etc.",
                  "Closures must call .forget() to keep them alive — otherwise they're dropped immediately."
        ],
        mistake: "Trying to pass complex Rust types directly to JS — use serde-wasm-bindgen to serialize.",
        shorthand: {
          verbose: "// Manual type conversion (verbose)\nlet user_str = format!(...);  // manual JSON building\nlet js_val = JsValue::from_str(&user_str);",
          concise: "serde_wasm_bindgen::to_value(&user)?  // auto JSON",
        },
      },
      {
        id: "wasm-pack",
        fn: "WASM Pack — Build & Package WASM Modules",
        desc: "Build WASM with wasm-pack: compile to WebAssembly, generate npm packages, test with wasm_bindgen_test.",
        category: "WASM",
        subtitle: "wasm-pack build, --target web/bundler/nodejs, pkg/ output, wasm_bindgen_test",
        signature: "wasm-pack build --target web  |  wasm-pack build --target bundler",
        descLong: "wasm-pack is the build tool for Rust WASM projects. It compiles to WebAssembly, generates JavaScript bindings, TypeScript definitions, and creates an npm-ready package in pkg/. Targets: web (ES module, browser), bundler (webpack/vite), nodejs (CommonJS for Node.js). Tests use wasm_bindgen_test and run in Node.js or browser. Output includes .wasm binary, .js glue code, and package.json for npm publishing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WASM Pack — Build & Package WASM Modules — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Cargo.toml:\n// [dependencies]\n// wasm-bindgen = \"0.2\"\n// wasm_bindgen_test = \"1\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WASM Pack — Build & Package WASM Modules — common patterns you'll see in production.\n// APPROACH  - Combine WASM Pack — Build & Package WASM Modules with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// src/lib.rs:\nuse wasm_bindgen::prelude::*;\nuse wasm_bindgen_test::*;\n\nwasm_bindgen_test_configure!(run_in_browser);\n\n#[wasm_bindgen]\npub fn add(a: u32, b: u32) -> u32 {\n    a + b\n}\n\n#[wasm_bindgen]\npub fn fibonacci(n: u32) -> u32 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => fibonacci(n - 1) + fibonacci(n - 2),\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WASM Pack — Build & Package WASM Modules — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── WASM tests ────────────────────────────────────,#[cfg(test)],mod tests {,    use super::*;,    use wasm_bindgen_test::*;,,    #[wasm_bindgen_test],    fn test_add() {,        assert_eq!(add(2, 3), 5);,    },,    #[wasm_bindgen_test],    fn test_fibonacci() {,        assert_eq!(fibonacci(10), 55);,    },},\n\n// ── Build commands ──────────────────────────────────,// wasm-pack build --target web,//   Output: pkg/ with .wasm, .js, package.json,//   Use: import init, { add } from './pkg/my_wasm.js';,//,// wasm-pack build --target bundler,//   For webpack/vite build systems,//,// wasm-pack build --target nodejs,//   For Node.js: require('my_wasm'),//,// wasm-pack test --headless --firefox,//   Run tests in headless Firefox,//,// wasm-pack publish,//   Publish to npm registry,\n\n// ── JavaScript usage (ES module) ────────────────────,// import init, { add, fibonacci } from './pkg/my_wasm.js';,//,// async function main() {,//   await init();,//   console.log(add(5, 7));        // 12,//   console.log(fibonacci(10));    // 55,// },//,// main().catch(console.error);,\n\n// ── Bundler target (webpack) ────────────────────────,// // webpack.config.js works with bundler target,// wasm-pack build --target bundler,// npm install ./pkg,// import { add } from 'my_wasm';,\n\n// ── Package.json in pkg/ ────────────────────────────,// After wasm-pack build, pkg/package.json:,// {,//   \"name\": \"my-wasm\",,//   \"version\": \"0.1.0\",,//   \"main\": \"my_wasm.js\",,//   \"types\": \"my_wasm.d.ts\",,//   \"files\": [\"my_wasm_bg.*\", \"my_wasm.js\", \"my_wasm.d.ts\"],// }"
                  }
        ],
        tips: [
                  "wasm-pack automatically generates TypeScript definitions — consumers get full type safety.",
                  "--target web is most common — creates ES module for browsers.",
                  "Tests use wasm_bindgen_test — run in browser or Node.js with --headless.",
                  "npm publish ./pkg — pkg/ is ready to publish directly to npm registry."
        ],
        mistake: "Forgetting to run wasm-pack build — using raw WASM without JavaScript bindings is tedious.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Manual WASM setup (verbose, fragile)\nfetch('my_wasm.wasm').then(r => r.arrayBuffer()).then(buf => {...})\n// More explicit but longer",
          concise: "// wasm-pack build --target web\nimport init, { add } from './pkg/my_wasm.js';",
        },
      },
      {
        id: "wasm-memory",
        fn: "WASM Memory Model — Linear Memory & Data Sharing",
        desc: "Understand WASM memory: single Uint8Array, pointer-based access, zero-copy data sharing strategies.",
        category: "WASM",
        subtitle: "WebAssembly.Memory, linear memory, Uint8Array, pointers, memory.buffer",
        signature: "let memory = wasm.memory.buffer;  |  new Uint8Array(memory).set(data);",
        descLong: "WASM has a single linear memory space exposed as Uint8Array. To share data efficiently (zero-copy), allocate buffers in Rust using Vec or Box, get the raw pointer, and pass the pointer + length to JavaScript. JavaScript creates a Uint8Array view of that memory region. After processing, JavaScript can modify data directly in Rust memory. Careful: WASM memory.buffer can be resized (growing memory invalidates old Uint8Array views).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of WASM Memory Model — Linear Memory & Data Sharing — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Rust side:\nuse wasm_bindgen::prelude::*;\n\n#[wasm_bindgen]\npub fn process_image(width: u32, height: u32) -> *const u8 {\n    // Allocate pixel data\n    let mut pixels = vec![0u8; (width * height * 4) as usize];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of WASM Memory Model — Linear Memory & Data Sharing — common patterns you'll see in production.\n// APPROACH  - Combine WASM Memory Model — Linear Memory & Data Sharing with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Process pixels (red channel)\n    for i in 0..pixels.len() {\n        if i % 4 == 0 {  // red channel\n            pixels[i] = 255;\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of WASM Memory Model — Linear Memory & Data Sharing — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Return pointer to data,    pixels.leak().as_ptr(),},,#[wasm_bindgen],pub fn write_pixel_data(ptr: *mut u8, offset: usize, value: u8) {,    unsafe {,        *ptr.add(offset) = value;,    },},,#[wasm_bindgen],pub fn alloc(size: usize) -> *mut u8 {,    let v = vec![0u8; size];,    Box::into_raw(v.into_boxed_slice()) as *mut u8,},,#[wasm_bindgen],pub fn dealloc(ptr: *mut u8, size: usize) {,    unsafe {,        let _ = Vec::from_raw_parts(ptr, size, size);,    },},\n\n// JavaScript side:,// const wasmMemory = new Uint8Array(wasm.memory.buffer);,// const pixelPtr = wasm.process_image(640, 480);,// const pixelData = new Uint8Array(,//   wasm.memory.buffer,,//   pixelPtr,,//   640 * 480 * 4,// );,//,// // Now pixelData shares memory with Rust vec,// console.log(pixelData[0]);  // Red value from Rust,// pixelData[1] = 128;         // Modify pixel in Rust memory,//,// // Important: Don't use pixelData after memory grows!,\n\n// ── String handling ────────────────────────────────,#[wasm_bindgen],pub fn string_to_utf8(s: &str) -> *const u8 {,    s.as_bytes().leak().as_ptr(),},\n\n// JavaScript:,// const ptr = wasm.string_to_utf8(\"Hello\");,// const wasmMemory = new Uint8Array(wasm.memory.buffer);,// let text = \"\";,// let i = ptr;,// while (wasmMemory[i] !== 0) {,//   text += String.fromCharCode(wasmMemory[i]);,//   i++;,// },// console.log(text);  // \"Hello\""
                  }
        ],
        tips: [
                  "Use pointers + length for zero-copy data passing — allocate in Rust, view in JS.",
                  "Memory.buffer can be resized when WASM grows memory — recreate Uint8Array views after growth.",
                  "leak() and Box::into_raw() transfer ownership to JavaScript — free with wasm-bindgen utilities.",
                  "For large data, zero-copy is much faster than serialization."
        ],
        mistake: "Assuming Uint8Array view stays valid after memory growth — Memory can be reallocated, invalidating old views.",
        shorthand: {
          verbose: "// Serialize/deserialize (verbose, slow)\nlet json = JSON.stringify(data);\nlet ptr = wasm.string_to_utf8(json);",
          concise: "// Zero-copy pointer passing (fast)\nlet ptr = wasm.alloc_data();\nnew Uint8Array(wasm.memory.buffer, ptr, len).set(data);",
        },
      },
    ],
  },
]

export default { meta, sections }
