export const meta = {
  "id": "rust-async",
  "label": "Async, Concurrency & Unsafe",
  "icon": "🦀",
  "description": "Rust async/await, threading, concurrency primitives, and unsafe code."
}

export const sections = [

  // ── Section 1: Threads & Message Passing ─────────────────────────────────────────
  {
    id: "threads-messaging",
    title: "Threads & Message Passing",
    entries: [
      {
        id: "thread-spawn",
        fn: "Thread Spawning",
        desc: "Create and run concurrent threads.",
        category: "Threads",
        subtitle: "std::thread::spawn",
        signature: "thread::spawn(|| { code })",
        descLong: "spawn() creates a new OS thread. The closure runs concurrently. Use join() to wait for completion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Thread Spawning — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::thread;\nuse std::time::Duration;\n\nfn main() {\n    let handle = thread::spawn(|| {\n        for i in 1..=3 {\n            println!(\"Spawned thread: {}\", i);\n            thread::sleep(Duration::from_millis(100));\n        }\n    });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Thread Spawning — common patterns you'll see in production.\n// APPROACH  - Combine Thread Spawning with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfor i in 1..=3 {\n        println!(\"Main thread: {}\", i);\n        thread::sleep(Duration::from_millis(100));\n    }\n\n    handle.join().unwrap();\n    println!(\"Spawned thread finished\");\n\n    let v = vec![1, 2, 3];\n    let handle2 = thread::spawn(move || {\n        println!(\"Moved vec: {:?}\", v);\n    });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Thread Spawning — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nhandle2.join().unwrap();\n}"
                  }
        ],
        tips: [
                  "spawn returns JoinHandle to wait for completion",
                  "Use move to transfer ownership",
                  "Closures must return ()",
                  "Panics in spawned thread don't crash main",
                  "Use thread::sleep for delays"
        ],
        mistake: "Not joining threads; main may exit before threads finish.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "mpsc-channels",
        fn: "Message Passing (mpsc)",
        desc: "Send messages between threads safely.",
        category: "Threads",
        subtitle: "Multi-producer, single-consumer",
        signature: "mpsc::channel(), tx.send(msg), rx.recv()",
        descLong: "mpsc channels allow safe message passing between threads. One receiver, many senders. Blocking recv() or try_recv().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Message Passing (mpsc) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    let tx1 = tx.clone();\n    thread::spawn(move || {\n        let vals = vec![\n            \"hi\",\n            \"from\",\n            \"the\",\n            \"spawned\",\n        ];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Message Passing (mpsc) — common patterns you'll see in production.\n// APPROACH  - Combine Message Passing (mpsc) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfor val in vals {\n            tx1.send(val).unwrap();\n            thread::sleep(std::time::Duration::from_secs(1));\n        }\n    });\n\n    thread::spawn(move || {\n        let vals = vec![\"more\", \"messages\"];\n\n        for val in vals {\n            tx.send(val).unwrap();\n        }\n    });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Message Passing (mpsc) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor received in rx {\n        println!(\"Got: {}\", received);\n    }\n}"
                  }
        ],
        tips: [
                  "Clone tx to send from multiple threads",
                  "recv() blocks until message available",
                  "Iteration ends when all senders dropped",
                  "try_recv() non-blocking",
                  "Ownership transfers across channels"
        ],
        mistake: "Not cloning tx for multiple senders.",
        shorthand: {
          verbose: "use std::sync::mpsc;\nuse std::thread;\n\nfn main() {\n    let (tx, rx) = mpsc::channel();\n\n    let tx1 ",
          concise: "// see verbose",
        },
      },
      {
        id: "thread-local",
        fn: "Thread-Local Storage",
        desc: "Per-thread data storage.",
        category: "Threads",
        subtitle: "thread_local!",
        signature: "thread_local! { static NAME: Type = value; }",
        descLong: "Thread-local storage allows each thread its own isolated copy of data. Useful for stateful context per thread.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Thread-Local Storage — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::cell::RefCell;\nuse std::thread;\n\nthread_local! {\n    static THREAD_ID: RefCell<u32> = RefCell::new(0);\n}\n\nfn main() {\n    THREAD_ID.with(|id| {\n        *id.borrow_mut() = 1;\n    });"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Thread-Local Storage — common patterns you'll see in production.\n// APPROACH  - Combine Thread-Local Storage with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet handle = thread::spawn(|| {\n        THREAD_ID.with(|id| {\n            *id.borrow_mut() = 2;\n            let current = *id.borrow();\n            println!(\"Spawned thread ID: {}\", current);\n        });\n    });\n\n    THREAD_ID.with(|id| {\n        println!(\"Main thread ID: {}\", *id.borrow());\n    });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Thread-Local Storage — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nhandle.join().unwrap();\n}"
                  }
        ],
        tips: [
                  "Use .with() to access thread-local storage",
                  "Each thread has its own copy",
                  "Common pattern with RefCell for mutation",
                  "Zero overhead if not used",
                  "Useful for context/state per thread"
        ],
        mistake: "Not using .with() to access the value.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "thread-builder",
        fn: "Thread Builder",
        desc: "Configure thread properties before spawning.",
        category: "Threads",
        subtitle: "thread::Builder",
        signature: "Builder::new().name(name).spawn()",
        descLong: "thread::Builder allows setting thread name and stack size before spawning. Useful for debugging and resource control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Thread Builder — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::thread;\n\nfn main() {\n    let builder = thread::Builder::new()\n        .name(\"worker-1\".to_string())\n        .stack_size(4 * 1024 * 1024);\n\n    let handle = builder.spawn(|| {\n        let name = thread::current().name().unwrap();\n        println!(\"Running thread: {}\", name);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Thread Builder — common patterns you'll see in production.\n// APPROACH  - Combine Thread Builder with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet id = thread::current().id();\n        println!(\"Thread ID: {:?}\", id);\n    }).unwrap();\n\n    handle.join().unwrap();\n\n    for i in 1..=3 {\n        thread::Builder::new()\n            .name(format!(\"worker-{}\", i))\n            .spawn(move || {\n                println!(\"Worker {}\", i);\n            })\n            .unwrap();\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Thread Builder — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nthread::sleep(std::time::Duration::from_millis(100));\n}"
                  }
        ],
        tips: [
                  "Set thread name for debugging panics",
                  "Stack size controls memory allocation",
                  "Name appears in debugger and thread output",
                  "current() gets current thread info",
                  "Useful for thread pool implementations"
        ],
        mistake: "Not setting thread names; hard to debug.",
        shorthand: {
          verbose: "use std::thread;\n\nfn main() {\n    let builder = thread::Builder::new()\n        .name(\"worker-1\".to_s",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Shared State ─────────────────────────────────────────
  {
    id: "shared-state",
    title: "Shared State",
    entries: [
      {
        id: "arc-mutex",
        fn: "Arc & Mutex",
        desc: "Safe shared mutable state across threads.",
        category: "Synchronization",
        subtitle: "Arc<Mutex<T>>",
        signature: "Arc::new(Mutex::new(data))",
        descLong: "Arc (Atomic Reference Counted) shares ownership. Mutex ensures only one thread accesses data at a time. Together: safe shared mutation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Arc & Mutex — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    let counter = Arc::new(Mutex::new(0));\n\n    let mut handles = vec![];\n\n    for _ in 0..3 {\n        let counter = Arc::clone(&counter);\n        let handle = thread::spawn(move || {\n            let mut num = counter.lock().unwrap();\n            *num += 1;\n        });\n        handles.push(handle);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Arc & Mutex — common patterns you'll see in production.\n// APPROACH  - Combine Arc & Mutex with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Arc & Mutex — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor handle in handles {\n        handle.join().unwrap();\n    }\n\n    println!(\"Result: {}\", *counter.lock().unwrap());\n}"
                  }
        ],
        tips: [
                  "Arc clones increment reference count",
                  "Mutex lock() returns MutexGuard",
                  "Guard is released when dropped",
                  "Holding guard across await causes issues",
                  "Use Parking Lot mutex for better performance"
        ],
        mistake: "Holding Mutex guard across async boundaries.",
        shorthand: {
          verbose: "use std::sync::{Arc, Mutex};\nuse std::thread;\n\nfn main() {\n    let counter = Arc::new(Mutex::new(0))",
          concise: "// see verbose",
        },
      },
      {
        id: "rwlock",
        fn: "RwLock (Reader-Writer Lock)",
        desc: "Multiple readers OR single writer.",
        category: "Synchronization",
        subtitle: "Arc<RwLock<T>>",
        signature: "RwLock::new(data), lock.read(), lock.write()",
        descLong: "RwLock allows unlimited readers or exclusive writer. More efficient than Mutex when reads >> writes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RwLock (Reader-Writer Lock) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::sync::{Arc, RwLock};\nuse std::thread;\n\nfn main() {\n    let data = Arc::new(RwLock::new(vec![1, 2, 3]));\n\n    for i in 0..2 {\n        let data = Arc::clone(&data);\n        thread::spawn(move || {\n            let numbers = data.read().unwrap();\n            println!(\"Reader {}: {:?}\", i, *numbers);\n        });\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RwLock (Reader-Writer Lock) — common patterns you'll see in production.\n// APPROACH  - Combine RwLock (Reader-Writer Lock) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nthread::sleep(std::time::Duration::from_millis(100));\n\n    let data_write = Arc::clone(&data);\n    thread::spawn(move || {\n        let mut numbers = data_write.write().unwrap();\n        numbers.push(4);\n        println!(\"Writer added 4\");\n    }).join().unwrap();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RwLock (Reader-Writer Lock) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet final_data = data.read().unwrap();\n    println!(\"Final: {:?}\", *final_data);\n}"
                  }
        ],
        tips: [
                  "read() locks for reading",
                  "write() locks for writing",
                  "Multiple readers concurrent",
                  "Writer blocks all readers",
                  "Use when reads much more frequent",
                  "Upgrade not directly supported"
        ],
        mistake: "Using Mutex when RwLock would be more efficient.",
        shorthand: {
          verbose: "use std::sync::{Arc, RwLock};\nuse std::thread;\n\nfn main() {\n    let data = Arc::new(RwLock::new(vec!",
          concise: "// see verbose",
        },
      },
      {
        id: "atomics",
        fn: "Atomic Types",
        desc: "Lock-free synchronization primitives.",
        category: "Synchronization",
        subtitle: "AtomicBool, AtomicUsize",
        signature: "AtomicBool, AtomicUsize, AtomicI32",
        descLong: "Atomic types provide lock-free synchronization for simple data (bools, integers). Much faster than Mutex for counters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Atomic Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};\nuse std::sync::Arc;\nuse std::thread;\n\nfn main() {\n    let counter = Arc::new(AtomicUsize::new(0));\n    let flag = Arc::new(AtomicBool::new(false));\n\n    let mut handles = vec![];"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Atomic Types — common patterns you'll see in production.\n// APPROACH  - Combine Atomic Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfor _ in 0..3 {\n        let counter = Arc::clone(&counter);\n        let handle = thread::spawn(move || {\n            counter.fetch_add(1, Ordering::SeqCst);\n        });\n        handles.push(handle);\n    }\n\n    for handle in handles {\n        handle.join().unwrap();\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Atomic Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"Count: {}\", counter.load(Ordering::SeqCst));\n\n    flag.store(true, Ordering::SeqCst);\n    println!(\"Flag: {}\", flag.load(Ordering::SeqCst));\n}"
                  }
        ],
        tips: [
                  "load/store for reads/writes",
                  "fetch_add/fetch_sub for math",
                  "Ordering::SeqCst for safety (slowest)",
                  "Ordering::Relaxed fastest but less safe",
                  "Use for counters, flags, simple values",
                  "Much faster than Mutex"
        ],
        mistake: "Using Ordering::Relaxed without understanding memory ordering.",
        shorthand: {
          verbose: "use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};\nuse std::sync::Arc;\nuse std::thread;\n\nfn",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Async/Await ─────────────────────────────────────────
  {
    id: "async-await",
    title: "Async/Await",
    entries: [
      {
        id: "async-fn",
        fn: "async fn & Futures",
        desc: "Define asynchronous functions.",
        category: "Async",
        subtitle: "async keyword",
        signature: "async fn name() -> Result<T> { }",
        descLong: "async fn defines an asynchronous function that returns a Future. Cannot be called directly; must be .await or spawned.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of async fn & Futures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::time::Duration;\n\nasync fn fetch_data(id: u32) -> String {\n    println!(\"Fetching {}\", id);\n    format!(\"Data {}\", id)\n}\n\nasync fn process() -> String {\n    let data1 = fetch_data(1).await;\n    println!(\"Got: {}\", data1);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of async fn & Futures — common patterns you'll see in production.\n// APPROACH  - Combine async fn & Futures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet data2 = fetch_data(2).await;\n    println!(\"Got: {}\", data2);\n\n    format!(\"{} & {}\", data1, data2)\n}\n\n#[tokio::main]\nasync fn main() {\n    let result = fetch_data(42).await;\n    println!(\"Result: {}\", result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of async fn & Futures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet processed = process().await;\n    println!(\"Processed: {}\", processed);\n}"
                  }
        ],
        tips: [
                  "async fn returns Future<T>",
                  "Must use .await to execute future",
                  "Must be called from async context",
                  "Use #[tokio::main] for entry point",
                  "Futures are lazy: created but not run"
        ],
        mistake: "Forgetting .await; future is not executed.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "await-expressions",
        fn: ".await & Awaiting Futures",
        desc: "Yield control until future completes.",
        category: "Async",
        subtitle: "await keyword",
        signature: "value.await",
        descLong: "The .await keyword pauses execution until a future completes. Can only be used in async context.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of .await & Awaiting Futures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse tokio::time::{sleep, Duration};\n\nasync fn delayed_value(delay_ms: u64) -> i32 {\n    sleep(Duration::from_millis(delay_ms)).await;\n    42\n}\n\nasync fn concurrent_waits() {\n    let future1 = delayed_value(100);\n    let future2 = delayed_value(50);\n\n    let result1 = future1.await;\n    let result2 = future2.await;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of .await & Awaiting Futures — common patterns you'll see in production.\n// APPROACH  - Combine .await & Awaiting Futures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nprintln!(\"Results: {} & {}\", result1, result2);\n}\n\nasync fn concurrent_spawn() {\n    let handle1 = tokio::spawn(async {\n        delayed_value(100).await\n    });\n\n    let handle2 = tokio::spawn(async {\n        delayed_value(50).await\n    });\n\n    let r1 = handle1.await.unwrap();\n    let r2 = handle2.await.unwrap();\n    println!(\"Spawned: {} & {}\", r1, r2);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of .await & Awaiting Futures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#[tokio::main]\nasync fn main() {\n    println!(\"Sequential:\");\n    concurrent_waits().await;\n\n    println!(\"Concurrent:\");\n    concurrent_spawn().await;\n}"
                  }
        ],
        tips: [
                  ".await pauses until future ready",
                  "Sequential .await runs serially",
                  "spawn() for true concurrency",
                  "Handle panics with .await.unwrap()",
                  "Futures are work-stealing by runtime"
        ],
        mistake: "Awaiting sequentially when true concurrency needed.",
        shorthand: {
          verbose: "use tokio::time::{sleep, Duration};\n\nasync fn delayed_value(delay_ms: u64) -> i32 {\n    sleep(Durati",
          concise: "// see verbose",
        },
      },
      {
        id: "tokio-runtime",
        fn: "Tokio Runtime",
        desc: "Async runtime for spawning and executing futures.",
        category: "Async",
        subtitle: "tokio::spawn",
        signature: "tokio::spawn(async { }), #[tokio::main]",
        descLong: "Tokio is the most common Rust async runtime. It manages threads and schedules futures. Use #[tokio::main] to set up runtime.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Tokio Runtime — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse std::time::Duration;\nuse tokio::time::sleep;\n\n#[tokio::main]\nasync fn main() {\n    let mut handles = vec![];\n\n    for i in 1..=3 {\n        let handle = tokio::spawn(async move {\n            sleep(Duration::from_millis(i * 100)).await;\n            println!(\"Task {} done\", i);\n            i\n        });\n        handles.push(handle);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Tokio Runtime — common patterns you'll see in production.\n// APPROACH  - Combine Tokio Runtime with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Tokio Runtime — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor handle in handles {\n        let result = handle.await.unwrap();\n        println!(\"Result: {}\", result);\n    }\n\n    println!(\"All tasks complete\");\n}"
                  }
        ],
        tips: [
                  "tokio::spawn returns JoinHandle",
                  "JoinHandle implements Future",
                  "Runtime automatically manages threads",
                  "#[tokio::main] sets up runtime",
                  "spawn(move) captures by move",
                  "No blocking in async code"
        ],
        mistake: "Calling blocking code in async function; use tokio::task::block_in_place.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "select-macro",
        fn: "tokio::select!",
        desc: "Race multiple futures and return first result.",
        category: "Async",
        subtitle: "Select first",
        signature: "tokio::select! { f1 => {}, f2 => {} }",
        descLong: "select! waits for multiple futures and returns when first completes. Useful for timeouts and racing operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of tokio::select! — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nuse tokio::time::{sleep, Duration};\n\n#[tokio::main]\nasync fn main() {\n    let future1 = sleep(Duration::from_millis(100));\n    let future2 = sleep(Duration::from_millis(50));\n\n    tokio::select! {\n        _ = future1 => println!(\"Future 1 done\"),\n        _ = future2 => println!(\"Future 2 done\"),\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of tokio::select! — common patterns you'll see in production.\n// APPROACH  - Combine tokio::select! with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet mut value = 0;\n\n    tokio::select! {\n        _ = sleep(Duration::from_secs(1)) => {\n            println!(\"Timeout!\");\n        }\n        _ = async {\n            value = 42;\n        } => {\n            println!(\"Done with value\");\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of tokio::select! — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nprintln!(\"Value: {}\", value);\n}"
                  }
        ],
        tips: [
                  "First completed future runs",
                  "Others are cancelled",
                  "Common pattern: timeout combinator",
                  "Similar to Promise.race() in JS",
                  "Can use if guards",
                  "Returns value from winning branch"
        ],
        mistake: "Assuming all futures will run; only first wins.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Unsafe & FFI ─────────────────────────────────────────
  {
    id: "unsafe-ffi",
    title: "Unsafe & FFI",
    entries: [
      {
        id: "unsafe-block",
        fn: "Unsafe Blocks",
        desc: "Opt-out of memory safety checks.",
        category: "Unsafe",
        subtitle: "Necessary evil",
        signature: "unsafe { }",
        descLong: "unsafe blocks disable certain compiler checks. Used for raw pointers, FFI, and performance-critical code. Document unsafe invariants.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Unsafe Blocks — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut x = 5;\n\n    let r = &mut x as *mut i32;\n\n    unsafe {\n        println!(\"r points to: {}\", *r);\n        *r = 10;\n    }\n\n    println!(\"x = {}\", x);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Unsafe Blocks — common patterns you'll see in production.\n// APPROACH  - Combine Unsafe Blocks with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nlet s = String::from(\"hello\");\n    let ptr = s.as_ptr();\n\n    unsafe {\n        println!(\"From raw: {}\", std::str::from_utf8_unchecked(\n            std::slice::from_raw_parts(ptr, s.len())\n        ));\n    }\n\n    let raw_vec = vec![1, 2, 3];\n    let ptr = raw_vec.as_ptr();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Unsafe Blocks — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nunsafe {\n        let reconstructed = Vec::from_raw_parts(ptr as *mut i32, 3, 3);\n        println!(\"Vec: {:?}\", reconstructed);\n    }\n}"
                  }
        ],
        tips: [
                  "Document unsafe invariants clearly",
                  "Minimize unsafe block scope",
                  "Use unsafe { } minimally",
                  "Raw pointers: *const T, *mut T",
                  "Dereference with *ptr",
                  "Prefer safe abstractions"
        ],
        mistake: "Creating undefined behavior with raw pointers.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "ffi-basics",
        fn: "FFI (Foreign Function Interface)",
        desc: "Call C code from Rust.",
        category: "Unsafe",
        subtitle: "extern \"C\"",
        signature: "extern \"C\" { fn c_function(); }",
        descLong: "FFI allows calling C libraries. Requires unsafe code and declaring external function signatures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of FFI (Foreign Function Interface) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nextern \"C\" {\n    fn abs(num: i32) -> i32;\n    fn strlen(s: *const u8) -> usize;\n}\n\n#[no_mangle]\npub extern \"C\" fn add_numbers(a: i32, b: i32) -> i32 {\n    a + b\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of FFI (Foreign Function Interface) — common patterns you'll see in production.\n// APPROACH  - Combine FFI (Foreign Function Interface) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfn main() {\n    unsafe {\n        println!(\"abs(-42) = {}\", abs(-42));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of FFI (Foreign Function Interface) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nlet c_string = b\"hello\\0\";\n        let len = strlen(c_string.as_ptr());\n        println!(\"Length: {}\", len);\n    }\n}"
                  }
        ],
        tips: [
                  "Declare with extern \"C\" { }",
                  "All C calls require unsafe",
                  "Strings must be null-terminated",
                  "\\0 at end of c strings",
                  "#[no_mangle] for exported functions",
                  "Use libc crate for common C types"
        ],
        mistake: "Forgetting null terminator on C strings.",
        shorthand: {
          verbose: "use std::thread;\nuse std::time::Duration;\n\nfn main() {\n    l",
          concise: "// see verbose",
        },
      },
      {
        id: "raw-pointers",
        fn: "Raw Pointers",
        desc: "Manual pointer manipulation.",
        category: "Unsafe",
        subtitle: "*const T, *mut T",
        signature: "let ptr: *const i32 = &value as *const i32;",
        descLong: "Raw pointers are like C pointers. Cannot be automatically dereferenced. No guarantee of validity. Use only when necessary.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Raw Pointers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfn main() {\n    let mut x = 5;\n    let y = 10;\n\n    let r1: *const i32 = &x;\n    let r2: *const i32 = &y;\n    let r3: *mut i32 = &mut x;\n\n    unsafe {\n        println!(\"r1: {}\", *r1);\n        println!(\"r2: {}\", *r2);\n        *r3 = 20;\n        println!(\"r3: {}\", *r3);\n    }\n\n    let address = 0x012345usize;\n    let r = address as *const i32;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Raw Pointers — common patterns you'll see in production.\n// APPROACH  - Combine Raw Pointers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// This is undefined behavior:\n    // unsafe { println!(\"{}\", *r); }\n\n    let mut num = 42;\n    let ptr = &mut num as *mut i32;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Raw Pointers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nunsafe {\n        *ptr += 1;\n    }\n    println!(\"num = {}\", num);\n}"
                  }
        ],
        tips: [
                  "Create from references with `as *const T`",
                  "`*` dereferences (needs unsafe)",
                  "No automatic safety checks",
                  "Can be null",
                  "Can be dangling",
                  "Prefer references"
        ],
        mistake: "Dereferencing invalid pointer causing undefined behavior.",
        shorthand: {
          verbose: "fn main() {\n    let mut x = 5;\n    let y = 10;\n\n    let r1: *const i32 = &x;\n    let r2: *const i32 ",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
