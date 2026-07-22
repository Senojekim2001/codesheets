export const meta = {
  "id": "concurrency",
  "label": "Concurrency",
  "icon": "⚡",
  "description": "Goroutines, channels, select, sync primitives, WaitGroups, and common patterns."
}

export const sections = [

  // ── Section 1: Concurrency ─────────────────────────────────────────
  {
    id: "concurrency",
    title: "Concurrency",
    entries: [
      {
        id: "goroutines",
        fn: "Goroutines",
        desc: "Lightweight concurrently-executing functions launched with the go keyword.",
        category: "Goroutines",
        subtitle: "Lightweight concurrent execution",
        signature: "go functionCall()",
        descLong: "Goroutines are multiplexed onto OS threads by the Go scheduler. Starting one takes ~2KB of stack. You can run hundreds of thousands concurrently. The main goroutine exiting terminates the program — use sync.WaitGroup or channels to wait for goroutines to finish.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Goroutines — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"context\"\n  \"fmt\"\n  \"sync\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Goroutines — common patterns you'll see in production.\n// APPROACH  - Combine Goroutines with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Launch a goroutine\ngo func() {\n  fmt.Println(\"running concurrently\")\n}()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Goroutines — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// With WaitGroup — wait for completion,var wg sync.WaitGroup,,for i := 0; i < 5; i++ {,  wg.Add(1),  go func(id int) {,    defer wg.Done(),    fmt.Printf(\"worker %d done,\", id),  }(i)  // pass i as argument — capture by value,},,wg.Wait() // block until all goroutines call Done(),\n\n// Goroutine leak — always ensure goroutines can exit,func worker(ctx context.Context) {,  for {,    select {,    case <-ctx.Done():,      return  // clean exit,    default:,      doWork(),    },  },}"
                  }
        ],
        tips: [
                  "Pass loop variables into goroutines as arguments — closures capture the variable, not the value.",
                  "Always have an exit strategy — a goroutine with no way to stop is a goroutine leak.",
                  "Use sync.WaitGroup to wait for a batch of goroutines before proceeding.",
                  "context.Context cancellation is the standard way to signal goroutines to stop."
        ],
        mistake: "Closing over a loop variable in a goroutine: go func() { use(i) }() — all goroutines may see the final value of i. Pass i as an argument: go func(id int) { use(id) }(i).",
        shorthand: {
          verbose: "for i := 0; i < 5; i++ {\n  wg.Add(1)\n  go func() {\n    defer wg.Done()\n    use(i)  // captures variable\n  }()\n}",
          concise: "for i := 0; i < 5; i++ {\n  wg.Add(1)\n  go func(id int) {\n    defer wg.Done()\n    use(id)  // capture by value\n  }(i)\n}",
        },
      },
      {
        id: "channel-basics",
        fn: "Channels",
        desc: "Typed conduits for goroutine communication — send with <-, receive with <-, close with close().",
        category: "Channels",
        subtitle: "Typed message passing between goroutines",
        signature: "ch := make(chan int)  |  ch <- val  |  val := <-ch",
        descLong: "Channels are the primary communication mechanism between goroutines. Unbuffered channels synchronize sender and receiver. Buffered channels allow the sender to proceed without a receiver (up to the buffer size). Closing a channel signals no more values — receivers get zero values after close.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Channels — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"fmt\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Channels — common patterns you'll see in production.\n// APPROACH  - Combine Channels with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Unbuffered channel — synchronizes sender and receiver\nch := make(chan string)\n\ngo func() {\n  ch <- \"hello\"  // blocks until receiver is ready\n}()\n\nmsg := <-ch  // blocks until sender sends\nfmt.Println(msg)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Channels — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Buffered channel — sender only blocks when full,bch := make(chan int, 3),bch <- 1  // doesn't block,bch <- 2,bch <- 3,// bch <- 4  // would block — buffer full,\n\n// Range over channel — reads until closed,jobs := make(chan int, 5),go func() {,  for i := 0; i < 5; i++ { jobs <- i },  close(jobs),}(),,for j := range jobs {,  fmt.Println(j),},\n\n// Check if channel closed,val, ok := <-ch,if !ok { fmt.Println(\"channel closed\") }"
                  }
        ],
        tips: [
                  "Only the sender should close a channel — closing from the receiver side can cause panics.",
                  "Sending to a closed channel panics — use sync.Once or a done channel to signal completion.",
                  "Use directional channel types (chan<- T and <-chan T) in function signatures for clarity.",
                  "A nil channel blocks forever — useful in select to disable a case dynamically."
        ],
        mistake: "Closing a channel from the receiver — only the sender should close. Use a separate done channel or sync.WaitGroup to signal completion from the receiver side.",
        shorthand: {
          verbose: "ch := make(chan int)\ngo func() { ch <- 1; close(ch) }()\ngo func() { <-ch; close(ch) }()  // panic",
          concise: "ch := make(chan int)\ngo func() { ch <- 1; close(ch) }()  // sender closes\nfor v := range ch { use(v) }        // receiver reads",
        },
      },
      {
        id: "select",
        fn: "select",
        desc: "Waits on multiple channel operations — executes the first one that's ready. Like switch for channels.",
        category: "Channels",
        subtitle: "Multi-channel multiplexing",
        signature: "select { case v := <-ch1: ... case ch2 <- x: ... default: ... }",
        descLong: "select blocks until one of its cases can proceed, then executes that case. If multiple cases are ready, it picks one randomly. A default case makes select non-blocking. Combine with time.After or context.Done() for timeouts and cancellation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of select — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"context\"\n  \"fmt\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of select — common patterns you'll see in production.\n// APPROACH  - Combine select with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic select — first ready case wins\nselect {\ncase msg1 := <-ch1:\n  fmt.Println(\"from ch1:\", msg1)\ncase msg2 := <-ch2:\n  fmt.Println(\"from ch2:\", msg2)\ncase <-time.After(1 * time.Second):\n  fmt.Println(\"timeout\")\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of select — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Non-blocking with default,select {,case msg := <-ch:,  fmt.Println(\"got:\", msg),default:,  fmt.Println(\"no message\"),},\n\n// Cancellation pattern,func doWork(ctx context.Context, ch <-chan int) {,  for {,    select {,    case v := <-ch:,      process(v),    case <-ctx.Done():,      fmt.Println(\"cancelled:\", ctx.Err()),      return,    },  },}"
                  }
        ],
        tips: [
                  "time.After creates a channel that receives after the duration — easy timeouts.",
                  "A nil channel case in select is never selected — use this to disable cases dynamically.",
                  "select with no cases (select{}) blocks forever — useful for keeping main alive.",
                  "Always include ctx.Done() in long-running goroutine select loops for cancellation."
        ],
        mistake: "Using time.After in a tight loop — each call allocates a new timer that can't be garbage collected until it fires. Use time.NewTimer and call Reset() instead.",
        shorthand: {
          verbose: "for {\n  select {\n  case <-time.After(1*time.Second):  // allocates each loop\n    handle()\n  }\n}",
          concise: "timer := time.NewTimer(1*time.Second)\ndefer timer.Stop()\nfor {\n  select {\n  case <-timer.C:\n    timer.Reset(1*time.Second)\n    handle()\n  }\n}",
        },
      },
      {
        id: "mutex",
        fn: "sync.Mutex / sync.RWMutex",
        desc: "Mutexes prevent concurrent access to shared data — RWMutex allows multiple readers.",
        category: "Sync Primitives",
        subtitle: "Protect shared state with locks",
        signature: "mu.Lock() / mu.Unlock()  |  defer mu.Unlock()",
        descLong: "Mutex serializes access to shared data. Always defer Unlock() immediately after Lock() to prevent forgetting it or missing it due to an early return. RWMutex allows multiple concurrent readers (RLock/RUnlock) but only one writer (Lock/Unlock) — better performance for read-heavy workloads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.Mutex / sync.RWMutex — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"sync\"\n\ntype SafeCounter struct {\n  mu sync.Mutex\n  v  map[string]int\n}\n\nfunc (c *SafeCounter) Inc(key string) {\n  c.mu.Lock()\n  defer c.mu.Unlock()  // always defer unlock\n  c.v[key]++\n}\n\nfunc (c *SafeCounter) Value(key string) int {\n  c.mu.Lock()\n  defer c.mu.Unlock()\n  return c.v[key]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.Mutex / sync.RWMutex — common patterns you'll see in production.\n// APPROACH  - Combine sync.Mutex / sync.RWMutex with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// RWMutex — many readers, one writer\ntype Cache struct {\n  mu   sync.RWMutex\n  data map[string]string\n}\n\nfunc (c *Cache) Get(key string) string {\n  c.mu.RLock()\n  defer c.mu.RUnlock()\n  return c.data[key]\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.Mutex / sync.RWMutex — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfunc (c *Cache) Set(key, val string) {\n  c.mu.Lock()\n  defer c.mu.Unlock()\n  c.data[key] = val\n}"
                  }
        ],
        tips: [
                  "Always defer mu.Unlock() immediately after mu.Lock() — prevents accidental lock leaks.",
                  "Don't copy a Mutex value — always use a pointer receiver when embedding or passing.",
                  "Use RWMutex when reads significantly outnumber writes.",
                  "go vet and the race detector (go run -race) catch lock misuse."
        ],
        mistake: "Copying a struct that contains a Mutex — the copy creates two independent locks over the same logical resource. Always use pointers for types containing sync primitives.",
        shorthand: {
          verbose: "type Counter struct { mu sync.Mutex; n int }\nc1 := Counter{}\nc2 := c1  // c1 and c2 have separate locks",
          concise: "type Counter struct { mu sync.Mutex; n int }\nc1 := &Counter{}\nc2 := c1  // c1 and c2 share the same lock",
        },
      },
      {
        id: "sync-once",
        fn: "sync.Once",
        desc: "Ensures a function is executed exactly once — the standard pattern for lazy singleton initialization.",
        category: "Sync Primitives",
        subtitle: "One-time lazy initialization",
        signature: "var once sync.Once  →  once.Do(func() { ... })",
        descLong: "sync.Once guarantees that a function is called exactly once, regardless of how many goroutines call it concurrently. The first caller executes the function; subsequent callers block until it completes, then return without executing. The standard Go singleton pattern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.Once — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"sync\"\n\ntype DB struct{ conn *sql.DB }\n\nvar (\n  instance *DB\n  once     sync.Once\n)\n\nfunc GetDB() *DB {\n  once.Do(func() {\n    conn, err := sql.Open(\"postgres\", os.Getenv(\"DATABASE_URL\"))\n    if err != nil { log.Fatal(err) }\n    instance = &DB{conn: conn}\n  })\n  return instance\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.Once — common patterns you'll see in production.\n// APPROACH  - Combine sync.Once with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// sync.OnceValue (Go 1.21) — returns a value\nvar loadConfig = sync.OnceValue(func() Config {\n  return parseConfig(\"config.yaml\")\n})"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.Once — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ncfg := loadConfig() // called once, cached on subsequent calls"
                  }
        ],
        tips: [
                  "sync.OnceValue (Go 1.21) wraps Once for functions that return a value — cleaner API.",
                  "sync.OnceFunc runs a function once and panics on subsequent calls if the first panicked.",
                  "Once cannot be reset — if initialization fails, the failed state is permanent.",
                  "Package-level vars with sync.Once are the idiomatic Go singleton."
        ],
        mistake: "Assuming Once can be reused after the initial call — it can't. If initialization needs to be retried on failure, manage that logic inside the Do function.",
        shorthand: {
          verbose: "var once sync.Once\nonce.Do(init)\n// later...\nonce.Do(init)  // second call is no-op",
          concise: "var once sync.Once\nfor {\n  once.Do(func() {\n    if err := init(); err != nil {\n      // handle inside\n    }\n  })\n}",
        },
      },
      {
        id: "errgroup",
        fn: "errgroup",
        desc: "Run goroutines concurrently and collect the first error — a WaitGroup with error propagation.",
        category: "Concurrency Patterns",
        subtitle: "Concurrent goroutines with error collection",
        signature: "g, ctx := errgroup.WithContext(ctx)  →  g.Go(func() error { })  →  g.Wait()",
        descLong: "golang.org/x/sync/errgroup runs a group of goroutines and returns the first non-nil error. The context is cancelled when any goroutine returns an error — letting others detect it and stop early. Replaces the WaitGroup + channel error pattern for most concurrent tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of errgroup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"golang.org/x/sync/errgroup\"\n\nfunc fetchAll(ctx context.Context, urls []string) ([][]byte, error) {\n  g, ctx := errgroup.WithContext(ctx)\n  results := make([][]byte, len(urls))\n\n  for i, url := range urls {\n    i, url := i, url // capture for closure\n    g.Go(func() error {\n      req, err := http.NewRequestWithContext(ctx, \"GET\", url, nil)\n      if err != nil { return err }\n      resp, err := http.DefaultClient.Do(req)\n      if err != nil { return err }\n      defer resp.Body.Close()\n      results[i], err = io.ReadAll(resp.Body)\n      return err\n    })\n  }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of errgroup — common patterns you'll see in production.\n// APPROACH  - Combine errgroup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of errgroup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n})\n  }\n\n  if err := g.Wait(); err != nil {\n    return nil, err\n  }\n  return results, nil\n}"
                  }
        ],
        tips: [
                  "errgroup.WithContext cancels ctx when any goroutine errors — others should respect ctx.Done().",
                  "g.Wait() blocks until all goroutines finish and returns the first error.",
                  "Use errgroup.SetLimit(n) to cap concurrent goroutines — built-in rate limiting.",
                  "Safe to write to separate slice indices concurrently — no mutex needed for indexed writes."
        ],
        mistake: "Using sync.WaitGroup and a separate error channel when errgroup provides the same functionality with less boilerplate.",
        shorthand: {
          verbose: "var wg sync.WaitGroup\nerrs := make(chan error, 3)\nfor i := 0; i < 3; i++ {\n  wg.Add(1)\n  go func() { errs <- doWork() }()\n}",
          concise: "eg, _ := errgroup.WithContext(ctx)\nfor i := 0; i < 3; i++ {\n  eg.Go(func() error { return doWork() })\n}\nerr := eg.Wait()",
        },
      },
      {
        id: "worker-pool",
        fn: "Worker Pool Pattern",
        desc: "A fixed pool of goroutines consuming from a shared job channel — bounded concurrency.",
        category: "Concurrency Patterns",
        subtitle: "Fixed-size goroutine pool",
        signature: "jobs := make(chan Job, buf)  →  N workers read from jobs",
        descLong: "A worker pool limits concurrency to N goroutines processing from a shared channel. The main goroutine sends jobs and closes the channel when done. Workers range over the channel and exit when it's closed. Results are collected via a separate results channel. This is the standard Go pattern for bounded parallel processing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Worker Pool Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"context\"\n  \"sync\"\n)\n\ntype Job struct{ id int; data string }\ntype Result struct{ id int; output string; err error }\n\nfunc workerPool(ctx context.Context, jobs []Job, numWorkers int) ([]Result, error) {\n  jobCh    := make(chan Job,    len(jobs))\n  resultCh := make(chan Result, len(jobs))\n  errCh    := make(chan error,  1)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Worker Pool Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Worker Pool Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Start fixed pool of workers with context awareness\n  var wg sync.WaitGroup\n  for range numWorkers {\n    wg.Add(1)\n    go func() {\n      defer wg.Done()\n      for job := range jobCh {\n        select {\n        case <-ctx.Done():\n          resultCh <- Result{id: job.id, err: ctx.Err()}\n          return\n        default:\n          output, err := process(ctx, job)\n          resultCh <- Result{id: job.id, output: output, err: err}\n        }\n      }\n    }()\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Worker Pool Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Send jobs in goroutine to allow early context cancellation,  go func() {,    for _, job := range jobs {,      select {,      case jobCh <- job:,      case <-ctx.Done():,        errCh <- ctx.Err(),        return,      },    },    close(jobCh),  }(),\n\n  // Wait and close results,  go func() {,    wg.Wait(),    close(resultCh),  }(),\n\n  // Collect results with error handling,  var results []Result,  for r := range resultCh {,    results = append(results, r),    if r.err != nil && errCh != nil {,      select {,      case errCh <- r.err:,        errCh = nil // drain once,      default:,      },    },  },\n\n  // Return first error if any,  select {,  case err := <-errCh:,    return results, err,  default:,    return results, nil,  },}"
                  }
        ],
        tips: [
                  "Buffer the job channel to prevent the sender from blocking while workers start up.",
                  "Always close the job channel after sending all jobs — range over channel exits on close.",
                  "The goroutine that closes resultCh must wait for all workers via WaitGroup.",
                  "Consider errgroup.SetLimit(n) as a simpler alternative for many use cases."
        ],
        mistake: "Forgetting to close the jobs channel — workers will block forever on the range, leaking goroutines.",
        shorthand: {
          verbose: "jobs := make(chan int, 10)\ngo func() { for j := range jobs { work(j) } }()\nfor i := 0; i < 10; i++ { jobs <- i }\n// workers block forever",
          concise: "jobs := make(chan int, 10)\ngo func() { for j := range jobs { work(j) } }()\nfor i := 0; i < 10; i++ { jobs <- i }\nclose(jobs)  // signal completion",
        },
      },
      {
        id: "context-cancel",
        fn: "context.WithCancel Pattern",
        desc: "Create a cancellable context and pass it through the call tree — signal goroutines to stop gracefully.",
        category: "Concurrency Patterns",
        subtitle: "Propagate cancellation through the call tree",
        signature: "ctx, cancel := context.WithCancel(parent)  →  defer cancel()",
        descLong: "context.WithCancel creates a derived context with a cancel function. Calling cancel() closes ctx.Done() — any code checking ctx.Done() can exit cleanly. The cancel function must always be called (use defer) to release resources. This is the standard pattern for coordinated goroutine shutdown.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of context.WithCancel Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport \"context\"\n\nfunc runWithCancel(parent context.Context) error {\n  ctx, cancel := context.WithCancel(parent)\n  defer cancel() // always cancel — even on success"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of context.WithCancel Pattern — common patterns you'll see in production.\n// APPROACH  - Combine context.WithCancel Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Start background worker\n  errCh := make(chan error, 1)\n  go func() {\n    errCh <- worker(ctx)\n  }()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of context.WithCancel Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Start another background task,  go func() {,    monitor(ctx),  }(),\n\n  // Wait for first error or parent cancellation,  select {,  case err := <-errCh:,    return err // cancel() called by defer — stops monitor,  case <-parent.Done():,    return parent.Err(),  },},,func worker(ctx context.Context) error {,  for {,    select {,    case <-ctx.Done():,      return ctx.Err() // clean exit,    default:,      if err := doWork(); err != nil { return err },    },  },}"
                  }
        ],
        tips: [
                  "Always defer cancel() immediately after creating a cancellable context.",
                  "Pass context as the first argument by convention: func Do(ctx context.Context, ...).",
                  "ctx.Err() returns context.Canceled or context.DeadlineExceeded after cancellation.",
                  "Do not store context in a struct — pass it explicitly per call."
        ],
        mistake: "Not calling the cancel function — the context and its descendants are never garbage collected, leaking memory until the parent context is cancelled.",
        shorthand: {
          verbose: "ctx, _ := context.WithCancel(context.Background())\nworker(ctx)\n// cancel function lost — context leaks",
          concise: "ctx, cancel := context.WithCancel(context.Background())\ndefer cancel()\nworker(ctx)",
        },
      },
      {
        id: "sync-waitgroup",
        fn: "sync.WaitGroup",
        desc: "Synchronization primitive for waiting on goroutines — simple alternative to channels for fan-out/fan-in.",
        category: "Sync Primitives",
        subtitle: "Wait for goroutine completion",
        signature: "wg.Add(n)  |  defer wg.Done()  |  wg.Wait()",
        descLong: "sync.WaitGroup is a counter that blocks until all registered goroutines finish. Add(n) increments the counter; Done() decrements it. Wait() blocks until the counter reaches zero. WaitGroup can be reused after Wait() returns, but must not be copied. Simpler than channels for simple wait patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.WaitGroup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"math/rand\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  var wg sync.WaitGroup"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.WaitGroup — common patterns you'll see in production.\n// APPROACH  - Combine sync.WaitGroup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wait for 5 goroutines\n  wg.Add(5)\n\n  for i := 0; i < 5; i++ {\n    go func(id int) {\n      defer wg.Done()  // decrement on exit\n      fmt.Printf(\"Worker %d starting\n\", id)\n      time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)\n      fmt.Printf(\"Worker %d done\n\", id)\n    }(i)\n  }\n\n  fmt.Println(\"Waiting for all workers...\")\n  wg.Wait()  // blocks until all Done() calls\n  fmt.Println(\"All done!\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.WaitGroup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reuse WaitGroup for batch processing,  batches := [][]int{,    {1, 2, 3},,    {4, 5, 6},,    {7, 8, 9},,  },,  for _, batch := range batches {,    wg.Add(len(batch)),    for _, item := range batch {,      go func(val int) {,        defer wg.Done(),        processBatch(val),      }(item),    },    wg.Wait()  // wait for this batch,    fmt.Println(\"Batch done\"),  },},,func processBatch(val int) {,  fmt.Printf(\"Processing %d,\", val),  time.Sleep(50 * time.Millisecond),},\n\n// Pattern: Add(1) per goroutine in a loop,func processItems(items []string) {,  var wg sync.WaitGroup,,  for _, item := range items {,    wg.Add(1),    go func(s string) {,      defer wg.Done(),      // process s,    }(item)  // important: pass item as argument,  },,  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Call Add() before spawning goroutines — if you Add() after spawning, a race condition can occur.",
                  "Always defer Done() immediately after wg.Add(1) — prevents accidental mismatches.",
                  "WaitGroup is reusable after Wait() returns — call Add() again for the next batch.",
                  "Never copy a WaitGroup — always use a pointer or a single instance.",
                  "Prefer errgroup for goroutines that can fail — it combines WaitGroup with error collection."
        ],
        mistake: "Adding inside a goroutine: go func() { wg.Add(1); ... }() — race condition between Add() and Wait(). Always Add() before spawning the goroutine.",
        shorthand: {
          verbose: "var wg sync.WaitGroup\nfor i := 0; i < 5; i++ {\n  go func(id int) {\n    wg.Add(1)\n    defer wg.Done()\n    doWork(id)\n  }(i)\n}\nwg.Wait()",
          concise: "wg.Add(5)\nfor i := 0; i < 5; i++ {\n  go func(id int) { defer wg.Done(); doWork(id) }(i)\n}",
        },
      },
      {
        id: "sync-cond",
        fn: "sync.Cond",
        desc: "Condition variable for waiting on a condition and signaling multiple goroutines.",
        category: "Sync Primitives",
        subtitle: "Notify goroutines when a condition changes",
        signature: "cond := sync.NewCond(&mu)  |  cond.Wait()  |  cond.Broadcast()",
        descLong: "sync.Cond is a condition variable that pairs with a mutex. Goroutines call Wait() to sleep until notified. Signal() wakes one goroutine; Broadcast() wakes all. Always check the condition after waking — spurious wakeups are possible. Less common than channels but essential for producer-consumer and resource pool patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.Cond — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)\n\ntype Queue struct {\n  mu   sync.Mutex\n  cond *sync.Cond\n  data []int\n}\n\nfunc NewQueue() *Queue {\n  q := &Queue{}\n  q.cond = sync.NewCond(&q.mu)\n  return q\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.Cond — common patterns you'll see in production.\n// APPROACH  - Combine sync.Cond with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Producer\nfunc (q *Queue) Push(val int) {\n  q.mu.Lock()\n  defer q.mu.Unlock()\n\n  q.data = append(q.data, val)\n  fmt.Printf(\"Pushed %d (queue size: %d)\n\", val, len(q.data))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.Cond — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Signal one waiting consumer,  q.cond.Signal()  // or Broadcast() to wake all,},\n\n// Consumer — waits if queue is empty,func (q *Queue) Pop() int {,  q.mu.Lock(),  defer q.mu.Unlock(),\n\n  // Wait while queue is empty,  for len(q.data) == 0 {,    q.cond.Wait()  // release lock, sleep, reacquire lock on wakeup,  },,  val := q.data[0],  q.data = q.data[1:],  fmt.Printf(\"Popped %d (queue size: %d),\", val, len(q.data)),  return val,},,func main() {,  q := NewQueue(),\n\n  // Start consumers that wait for items,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 1 got: %d,\", val),    },  }(),,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 2 got: %d,\", val),    },  }(),\n\n  // Produce items slowly,  for i := 0; i < 10; i++ {,    time.Sleep(100 * time.Millisecond),    q.Push(i),  },,  time.Sleep(500 * time.Millisecond),  fmt.Println(\"Done\"),},\n\n// Broadcast example — notify all waiters of a state change,type EventBus struct {,  mu    sync.Mutex,  cond  *sync.Cond,  ready bool,},,func NewEventBus() *EventBus {,  eb := &EventBus{},  eb.cond = sync.NewCond(&eb.mu),  return eb,},,func (eb *EventBus) Wait() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  for !eb.ready {,    eb.cond.Wait()  // sleep until ready,  },},,func (eb *EventBus) Signal() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  eb.ready = true,  eb.cond.Broadcast()  // wake all waiters,}"
                  }
        ],
        tips: [
                  "Always hold the mutex when calling Wait(), Signal(), or Broadcast().",
                  "Check the condition in a loop (for !condition { cond.Wait() }) — spurious wakeups are possible.",
                  "Signal() wakes one goroutine; Broadcast() wakes all — choose based on how many should wake.",
                  "sync.Cond is less common than channels — use channels for simple cases, Cond for complex state.",
                  "Each Cond is associated with a single Mutex — don't share a Cond across mutexes."
        ],
        mistake: "Assuming one Signal() always wakes a goroutine — if multiple are waiting, Signal() picks one arbitrarily. Use Broadcast() if all should wake.",
        shorthand: {
          verbose: "cond := sync.NewCond(&mu)\nfor i := 0; i < 5; i++ {\n  go func() {\n    mu.Lock()\n    for !ready { cond.Wait() }\n    mu.Unlock()\n  }()\n}\nmu.Lock()\nready = true\ncond.Signal()  // wakes one\nmu.Unlock()",
          concise: "cond.Broadcast()  // Wake all waiting\n// vs Signal() for one consumer",
        },
      },
      {
        id: "rate-limiting-semaphore",
        fn: "Rate Limiting & Semaphore",
        desc: "Limit concurrency with a buffered channel (semaphore) — common pattern for bounded concurrency.",
        category: "Concurrency Patterns",
        subtitle: "Limit how many goroutines run concurrently",
        signature: "sem := make(chan struct{}, maxConcurrency)  |  sem <- struct{}{}  |  <-sem",
        descLong: "A buffered channel acts as a semaphore: send to acquire a slot, receive to release. The buffer size limits concurrency. This is simpler than a worker pool for cases where you want to control concurrency across many independent tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting & Semaphore — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  // Semaphore pattern — limit to 3 concurrent tasks\n  maxConcurrency := 3\n  sem := make(chan struct{}, maxConcurrency)\n\n  tasks := []string{\"task1\", \"task2\", \"task3\", \"task4\", \"task5\", \"task6\"}\n  var wg sync.WaitGroup\n\n  for _, task := range tasks {\n    wg.Add(1)\n    go func(name string) {\n      defer wg.Done()\n\n      sem <- struct{}{}        // acquire slot (blocks if full)\n      defer func() { <-sem }() // release slot\n\n      fmt.Printf(\"%s started\n\", name)\n      time.Sleep(500 * time.Millisecond)\n      fmt.Printf(\"%s done\n\", name)\n    }(task)\n  }\n\n  wg.Wait()\n  fmt.Println(\"All done\")\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting & Semaphore — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting & Semaphore with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Rate limiting with tokens — allow N requests per second\ntype RateLimiter struct {\n  tokens chan struct{}\n  done   chan struct{}\n}\n\nfunc NewRateLimiter(requestsPerSec int) *RateLimiter {\n  rl := &RateLimiter{\n    tokens: make(chan struct{}, requestsPerSec),\n    done:   make(chan struct{}),\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting & Semaphore — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Refill tokens periodically,  go func() {,    ticker := time.NewTicker(time.Second / time.Duration(requestsPerSec)),    defer ticker.Stop(),,    for {,      select {,      case <-ticker.C:,        // Try to add a token (non-blocking),        select {,        case rl.tokens <- struct{}{}:,        default:,        },      case <-rl.done:,        return,      },    },  }(),,  return rl,},,func (rl *RateLimiter) Allow() bool {,  select {,  case <-rl.tokens:,    return true,  default:,    return false,  },},,func (rl *RateLimiter) Wait() {,  <-rl.tokens  // block until token available,},,func (rl *RateLimiter) Close() {,  close(rl.done),},\n\n// Example: HTTP client with concurrency limit,func fetchWithLimit(urls []string, maxConcurrent int) []string {,  sem := make(chan struct{}, maxConcurrent),  results := make([]string, len(urls)),  var wg sync.WaitGroup,,  for i, url := range urls {,    wg.Add(1),    go func(idx int, u string) {,      defer wg.Done(),,      sem <- struct{}{},      defer func() { <-sem }(),,      resp, err := http.Get(u),      if err != nil {,        results[idx] = fmt.Sprintf(\"error: %v\", err),        return,      },      defer resp.Body.Close(),      results[idx] = fmt.Sprintf(\"status: %d\", resp.StatusCode),    }(i, url),  },,  wg.Wait(),  return results,},\n\n// Use errgroup.SetLimit() (Go 1.20+) as cleaner alternative,func cleanerApproach() {,  import \"golang.org/x/sync/errgroup\",,  urls := []string{\"http://example.com\", \"http://golang.org\"},,  g, ctx := errgroup.WithContext(context.Background()),  g.SetLimit(3)  // limit to 3 concurrent,,  for _, url := range urls {,    u := url,    g.Go(func() error {,      resp, err := http.Get(u),      if err != nil {,        return err,      },      resp.Body.Close(),      return nil,    }),  },,  if err := g.Wait(); err != nil {,    log.Fatal(err),  },}"
                  }
        ],
        tips: [
                  "Buffered channel as semaphore: send to acquire, receive to release.",
                  "Always defer the release: defer func() { <-sem }() to prevent leaks.",
                  "errgroup.SetLimit(n) is a cleaner, higher-level alternative (Go 1.20+).",
                  "Use a non-blocking acquire (select with default) for token buckets and rate limiters.",
                  "For HTTP clients, consider setting MaxIdleConns on the transport instead of a semaphore."
        ],
        mistake: "Forgetting to release slots: sem <- struct{}{}; doWork() without defer — later goroutines block forever waiting for slots.",
        shorthand: {
          verbose: "sem := make(chan struct{}, 3)\nfor i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}\n    doWork(id)\n    <-sem\n  }(i)\n}",
          concise: "for i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}; defer func() { <-sem }()\n    doWork(id)\n  }(i)\n}  // Always defer slot release",
        },
      },
      {
        id: "deadlock-prevention",
        fn: "Deadlock Prevention & Detection",
        desc: "Understand common deadlock patterns and how to avoid them — circular locks, goroutine leaks.",
        category: "Concurrency Patterns",
        subtitle: "Avoid and diagnose deadlock scenarios",
        signature: "use timeouts  |  avoid nested locks  |  go run -race",
        descLong: "Deadlocks occur when goroutines wait for each other circularly. Common causes: circular channel sends, nested mutex locks, or waiting on a closed channel. Prevention: use timeouts (context.WithTimeout), avoid nested locks, maintain lock order discipline. Detection: go run -race detects data races (not deadlocks directly, but catches synchronization bugs).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Deadlock Prevention & Detection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Deadlock Prevention & Detection — common patterns you'll see in production.\n// APPROACH  - Combine Deadlock Prevention & Detection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Deadlock 1: Circular channel send\nfunc deadlockChannels() {\n  ch1 := make(chan int)\n  ch2 := make(chan int)\n\n  go func() {\n    ch1 <- 1\n    <-ch2  // wait for ch2\n  }()\n\n  go func() {\n    ch2 <- 2\n    <-ch1  // wait for ch1 — circular dependency\n  }()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Deadlock Prevention & Detection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Both goroutines wait for each other — deadlock,  // fatal error: all goroutines are asleep - deadlock!,},\n\n// Solution: Use buffered channels or different ordering,func safeChannels() {,  ch1 := make(chan int, 1)  // buffered,  ch2 := make(chan int, 1),,  go func() {,    ch1 <- 1,    <-ch2,  }(),,  go func() {,    ch2 <- 2,    <-ch1,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Deadlock 2: Nested mutex locks in different order,type Account struct {,  mu      sync.Mutex,  balance int,},,func deadlockMutex(a1, a2 *Account) {,  go func() {,    a1.mu.Lock(),    defer a1.mu.Unlock(),    time.Sleep(10 * time.Millisecond)  // simulate work,    a2.mu.Lock(),    defer a2.mu.Unlock(),    // transfer from a1 to a2,  }(),,  go func() {,    a2.mu.Lock()  // different order!,    defer a2.mu.Unlock(),    time.Sleep(10 * time.Millisecond),    a1.mu.Lock(),    defer a1.mu.Unlock(),    // transfer from a2 to a1 — deadlock,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Solution: Lock in consistent order,func safeMutex(a1, a2 *Account) {,  // Always lock in the same order (e.g., by address),  lock := func(a, b *Account) (*Account, *Account) {,    if a > b {,      return b, a,    },    return a, b,  },,  first, second := lock(a1, a2),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),},\n\n// Prevention: Use timeouts,func safeWithTimeout(ctx context.Context, ch chan int) (int, error) {,  ctx, cancel := context.WithTimeout(ctx, 1*time.Second),  defer cancel(),,  select {,  case val := <-ch:,    return val, nil,  case <-ctx.Done():,    return 0, fmt.Errorf(\"operation timed out\"),  },},\n\n// Prevention: Avoid nested locks — use higher-level abstractions,type SafeTransfer struct {,  mu sync.Mutex,},,func (st *SafeTransfer) Transfer(a1, a2 *Account, amount int) {,  st.mu.Lock(),  defer st.mu.Unlock(),\n\n  // Both account locks held under single outer lock — no deadlock,  a1.mu.Lock(),  a2.mu.Lock(),,  a1.balance -= amount,  a2.balance += amount,,  a2.mu.Unlock(),  a1.mu.Unlock(),},\n\n// Prevention: Unbuffered channel + explicit completion,func safeFanIn(ch1, ch2 <-chan int, result chan<- int) {,  done := 0,  for done < 2 {,    select {,    case v1, ok := <-ch1:,      if ok {,        result <- v1,      } else {,        done++,      },    case v2, ok := <-ch2:,      if ok {,        result <- v2,      } else {,        done++,      },    },  },  close(result),}"
                  }
        ],
        tips: [
                  "Use context.WithTimeout() on blocking operations to prevent infinite waits.",
                  "Lock resources in a consistent order — prevents circular wait.",
                  "Avoid holding locks while waiting on channels — leads to deadlocks.",
                  "Use go run -race to catch data races (synchronization bugs).",
                  "Prefer channels to mutexes when possible — easier to reason about.",
                  "Use deadlock detection: pprof with the goroutine profile to see goroutine stacks."
        ],
        mistake: "Locking mutex while waiting on a channel: mu.Lock(); <-ch panics if the channel sender needs the mutex — classic deadlock.",
        shorthand: {
          verbose: "mu.Lock()\nresult := <-ch  // Waits; sender needs mu.Lock()\nmu.Unlock()     // Deadlock!",
          concise: "val := <-ch  // Receive outside lock\nmu.Lock()\nprocess(val)\nmu.Unlock()",
        },
      },
      {
        id: "sync-waitgroup",
        fn: "sync.WaitGroup",
        desc: "Synchronization primitive for waiting on goroutines — simple alternative to channels for fan-out/fan-in.",
        category: "Sync Primitives",
        subtitle: "Wait for goroutine completion",
        signature: "wg.Add(n)  |  defer wg.Done()  |  wg.Wait()",
        descLong: "sync.WaitGroup is a counter that blocks until all registered goroutines finish. Add(n) increments the counter; Done() decrements it. Wait() blocks until the counter reaches zero. WaitGroup can be reused after Wait() returns, but must not be copied. Simpler than channels for simple wait patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.WaitGroup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"math/rand\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  var wg sync.WaitGroup"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.WaitGroup — common patterns you'll see in production.\n// APPROACH  - Combine sync.WaitGroup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wait for 5 goroutines\n  wg.Add(5)\n\n  for i := 0; i < 5; i++ {\n    go func(id int) {\n      defer wg.Done()  // decrement on exit\n      fmt.Printf(\"Worker %d starting\n\", id)\n      time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)\n      fmt.Printf(\"Worker %d done\n\", id)\n    }(i)\n  }\n\n  fmt.Println(\"Waiting for all workers...\")\n  wg.Wait()  // blocks until all Done() calls\n  fmt.Println(\"All done!\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.WaitGroup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reuse WaitGroup for batch processing,  batches := [][]int{,    {1, 2, 3},,    {4, 5, 6},,    {7, 8, 9},,  },,  for _, batch := range batches {,    wg.Add(len(batch)),    for _, item := range batch {,      go func(val int) {,        defer wg.Done(),        processBatch(val),      }(item),    },    wg.Wait()  // wait for this batch,    fmt.Println(\"Batch done\"),  },},,func processBatch(val int) {,  fmt.Printf(\"Processing %d,\", val),  time.Sleep(50 * time.Millisecond),},\n\n// Pattern: Add(1) per goroutine in a loop,func processItems(items []string) {,  var wg sync.WaitGroup,,  for _, item := range items {,    wg.Add(1),    go func(s string) {,      defer wg.Done(),      // process s,    }(item)  // important: pass item as argument,  },,  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Call Add() before spawning goroutines — if you Add() after spawning, a race condition can occur.",
                  "Always defer Done() immediately after wg.Add(1) — prevents accidental mismatches.",
                  "WaitGroup is reusable after Wait() returns — call Add() again for the next batch.",
                  "Never copy a WaitGroup — always use a pointer or a single instance.",
                  "Prefer errgroup for goroutines that can fail — it combines WaitGroup with error collection."
        ],
        mistake: "Adding inside a goroutine: go func() { wg.Add(1); ... }() — race condition between Add() and Wait(). Always Add() before spawning the goroutine.",
        shorthand: {
          verbose: "var wg sync.WaitGroup\nfor i := 0; i < 5; i++ {\n  go func(id int) {\n    wg.Add(1)\n    defer wg.Done()\n    doWork(id)\n  }(i)\n}\nwg.Wait()",
          concise: "wg.Add(5)\nfor i := 0; i < 5; i++ {\n  go func(id int) { defer wg.Done(); doWork(id) }(i)\n}",
        },
      },
      {
        id: "sync-cond",
        fn: "sync.Cond",
        desc: "Condition variable for waiting on a condition and signaling multiple goroutines.",
        category: "Sync Primitives",
        subtitle: "Notify goroutines when a condition changes",
        signature: "cond := sync.NewCond(&mu)  |  cond.Wait()  |  cond.Broadcast()",
        descLong: "sync.Cond is a condition variable that pairs with a mutex. Goroutines call Wait() to sleep until notified. Signal() wakes one goroutine; Broadcast() wakes all. Always check the condition after waking — spurious wakeups are possible. Less common than channels but essential for producer-consumer and resource pool patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.Cond — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)\n\ntype Queue struct {\n  mu   sync.Mutex\n  cond *sync.Cond\n  data []int\n}\n\nfunc NewQueue() *Queue {\n  q := &Queue{}\n  q.cond = sync.NewCond(&q.mu)\n  return q\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.Cond — common patterns you'll see in production.\n// APPROACH  - Combine sync.Cond with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Producer\nfunc (q *Queue) Push(val int) {\n  q.mu.Lock()\n  defer q.mu.Unlock()\n\n  q.data = append(q.data, val)\n  fmt.Printf(\"Pushed %d (queue size: %d)\n\", val, len(q.data))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.Cond — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Signal one waiting consumer,  q.cond.Signal()  // or Broadcast() to wake all,},\n\n// Consumer — waits if queue is empty,func (q *Queue) Pop() int {,  q.mu.Lock(),  defer q.mu.Unlock(),\n\n  // Wait while queue is empty,  for len(q.data) == 0 {,    q.cond.Wait()  // release lock, sleep, reacquire lock on wakeup,  },,  val := q.data[0],  q.data = q.data[1:],  fmt.Printf(\"Popped %d (queue size: %d),\", val, len(q.data)),  return val,},,func main() {,  q := NewQueue(),\n\n  // Start consumers that wait for items,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 1 got: %d,\", val),    },  }(),,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 2 got: %d,\", val),    },  }(),\n\n  // Produce items slowly,  for i := 0; i < 10; i++ {,    time.Sleep(100 * time.Millisecond),    q.Push(i),  },,  time.Sleep(500 * time.Millisecond),  fmt.Println(\"Done\"),},\n\n// Broadcast example — notify all waiters of a state change,type EventBus struct {,  mu    sync.Mutex,  cond  *sync.Cond,  ready bool,},,func NewEventBus() *EventBus {,  eb := &EventBus{},  eb.cond = sync.NewCond(&eb.mu),  return eb,},,func (eb *EventBus) Wait() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  for !eb.ready {,    eb.cond.Wait()  // sleep until ready,  },},,func (eb *EventBus) Signal() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  eb.ready = true,  eb.cond.Broadcast()  // wake all waiters,}"
                  }
        ],
        tips: [
                  "Always hold the mutex when calling Wait(), Signal(), or Broadcast().",
                  "Check the condition in a loop (for !condition { cond.Wait() }) — spurious wakeups are possible.",
                  "Signal() wakes one goroutine; Broadcast() wakes all — choose based on how many should wake.",
                  "sync.Cond is less common than channels — use channels for simple cases, Cond for complex state.",
                  "Each Cond is associated with a single Mutex — don't share a Cond across mutexes."
        ],
        mistake: "Assuming one Signal() always wakes a goroutine — if multiple are waiting, Signal() picks one arbitrarily. Use Broadcast() if all should wake.",
        shorthand: {
          verbose: "cond := sync.NewCond(&mu)\nfor i := 0; i < 5; i++ {\n  go func() {\n    mu.Lock()\n    for !ready { cond.Wait() }\n    mu.Unlock()\n  }()\n}\nmu.Lock()\nready = true\ncond.Signal()  // wakes one\nmu.Unlock()",
          concise: "cond.Broadcast()  // Wake all waiting\n// vs Signal() for one consumer",
        },
      },
      {
        id: "rate-limiting-semaphore",
        fn: "Rate Limiting & Semaphore",
        desc: "Limit concurrency with a buffered channel (semaphore) — common pattern for bounded concurrency.",
        category: "Concurrency Patterns",
        subtitle: "Limit how many goroutines run concurrently",
        signature: "sem := make(chan struct{}, maxConcurrency)  |  sem <- struct{}{}  |  <-sem",
        descLong: "A buffered channel acts as a semaphore: send to acquire a slot, receive to release. The buffer size limits concurrency. This is simpler than a worker pool for cases where you want to control concurrency across many independent tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting & Semaphore — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  // Semaphore pattern — limit to 3 concurrent tasks\n  maxConcurrency := 3\n  sem := make(chan struct{}, maxConcurrency)\n\n  tasks := []string{\"task1\", \"task2\", \"task3\", \"task4\", \"task5\", \"task6\"}\n  var wg sync.WaitGroup\n\n  for _, task := range tasks {\n    wg.Add(1)\n    go func(name string) {\n      defer wg.Done()\n\n      sem <- struct{}{}        // acquire slot (blocks if full)\n      defer func() { <-sem }() // release slot\n\n      fmt.Printf(\"%s started\n\", name)\n      time.Sleep(500 * time.Millisecond)\n      fmt.Printf(\"%s done\n\", name)\n    }(task)\n  }\n\n  wg.Wait()\n  fmt.Println(\"All done\")\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting & Semaphore — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting & Semaphore with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Rate limiting with tokens — allow N requests per second\ntype RateLimiter struct {\n  tokens chan struct{}\n  done   chan struct{}\n}\n\nfunc NewRateLimiter(requestsPerSec int) *RateLimiter {\n  rl := &RateLimiter{\n    tokens: make(chan struct{}, requestsPerSec),\n    done:   make(chan struct{}),\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting & Semaphore — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Refill tokens periodically,  go func() {,    ticker := time.NewTicker(time.Second / time.Duration(requestsPerSec)),    defer ticker.Stop(),,    for {,      select {,      case <-ticker.C:,        // Try to add a token (non-blocking),        select {,        case rl.tokens <- struct{}{}:,        default:,        },      case <-rl.done:,        return,      },    },  }(),,  return rl,},,func (rl *RateLimiter) Allow() bool {,  select {,  case <-rl.tokens:,    return true,  default:,    return false,  },},,func (rl *RateLimiter) Wait() {,  <-rl.tokens  // block until token available,},,func (rl *RateLimiter) Close() {,  close(rl.done),},\n\n// Example: HTTP client with concurrency limit,func fetchWithLimit(urls []string, maxConcurrent int) []string {,  sem := make(chan struct{}, maxConcurrent),  results := make([]string, len(urls)),  var wg sync.WaitGroup,,  for i, url := range urls {,    wg.Add(1),    go func(idx int, u string) {,      defer wg.Done(),,      sem <- struct{}{},      defer func() { <-sem }(),,      resp, err := http.Get(u),      if err != nil {,        results[idx] = fmt.Sprintf(\"error: %v\", err),        return,      },      defer resp.Body.Close(),      results[idx] = fmt.Sprintf(\"status: %d\", resp.StatusCode),    }(i, url),  },,  wg.Wait(),  return results,},\n\n// Use errgroup.SetLimit() (Go 1.20+) as cleaner alternative,func cleanerApproach() {,  import \"golang.org/x/sync/errgroup\",,  urls := []string{\"http://example.com\", \"http://golang.org\"},,  g, ctx := errgroup.WithContext(context.Background()),  g.SetLimit(3)  // limit to 3 concurrent,,  for _, url := range urls {,    u := url,    g.Go(func() error {,      resp, err := http.Get(u),      if err != nil {,        return err,      },      resp.Body.Close(),      return nil,    }),  },,  if err := g.Wait(); err != nil {,    log.Fatal(err),  },}"
                  }
        ],
        tips: [
                  "Buffered channel as semaphore: send to acquire, receive to release.",
                  "Always defer the release: defer func() { <-sem }() to prevent leaks.",
                  "errgroup.SetLimit(n) is a cleaner, higher-level alternative (Go 1.20+).",
                  "Use a non-blocking acquire (select with default) for token buckets and rate limiters.",
                  "For HTTP clients, consider setting MaxIdleConns on the transport instead of a semaphore."
        ],
        mistake: "Forgetting to release slots: sem <- struct{}{}; doWork() without defer — later goroutines block forever waiting for slots.",
        shorthand: {
          verbose: "sem := make(chan struct{}, 3)\nfor i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}\n    doWork(id)\n    <-sem\n  }(i)\n}",
          concise: "for i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}; defer func() { <-sem }()\n    doWork(id)\n  }(i)\n}  // Always defer slot release",
        },
      },
      {
        id: "deadlock-prevention",
        fn: "Deadlock Prevention & Detection",
        desc: "Understand common deadlock patterns and how to avoid them — circular locks, goroutine leaks.",
        category: "Concurrency Patterns",
        subtitle: "Avoid and diagnose deadlock scenarios",
        signature: "use timeouts  |  avoid nested locks  |  go run -race",
        descLong: "Deadlocks occur when goroutines wait for each other circularly. Common causes: circular channel sends, nested mutex locks, or waiting on a closed channel. Prevention: use timeouts (context.WithTimeout), avoid nested locks, maintain lock order discipline. Detection: go run -race detects data races (not deadlocks directly, but catches synchronization bugs).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Deadlock Prevention & Detection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Deadlock Prevention & Detection — common patterns you'll see in production.\n// APPROACH  - Combine Deadlock Prevention & Detection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Deadlock 1: Circular channel send\nfunc deadlockChannels() {\n  ch1 := make(chan int)\n  ch2 := make(chan int)\n\n  go func() {\n    ch1 <- 1\n    <-ch2  // wait for ch2\n  }()\n\n  go func() {\n    ch2 <- 2\n    <-ch1  // wait for ch1 — circular dependency\n  }()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Deadlock Prevention & Detection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Both goroutines wait for each other — deadlock,  // fatal error: all goroutines are asleep - deadlock!,},\n\n// Solution: Use buffered channels or different ordering,func safeChannels() {,  ch1 := make(chan int, 1)  // buffered,  ch2 := make(chan int, 1),,  go func() {,    ch1 <- 1,    <-ch2,  }(),,  go func() {,    ch2 <- 2,    <-ch1,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Deadlock 2: Nested mutex locks in different order,type Account struct {,  mu      sync.Mutex,  balance int,},,func deadlockMutex(a1, a2 *Account) {,  go func() {,    a1.mu.Lock(),    defer a1.mu.Unlock(),    time.Sleep(10 * time.Millisecond)  // simulate work,    a2.mu.Lock(),    defer a2.mu.Unlock(),    // transfer from a1 to a2,  }(),,  go func() {,    a2.mu.Lock()  // different order!,    defer a2.mu.Unlock(),    time.Sleep(10 * time.Millisecond),    a1.mu.Lock(),    defer a1.mu.Unlock(),    // transfer from a2 to a1 — deadlock,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Solution: Lock in consistent order,func safeMutex(a1, a2 *Account) {,  // Always lock in the same order (e.g., by address),  lock := func(a, b *Account) (*Account, *Account) {,    if a > b {,      return b, a,    },    return a, b,  },,  first, second := lock(a1, a2),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),},\n\n// Prevention: Use timeouts,func safeWithTimeout(ctx context.Context, ch chan int) (int, error) {,  ctx, cancel := context.WithTimeout(ctx, 1*time.Second),  defer cancel(),,  select {,  case val := <-ch:,    return val, nil,  case <-ctx.Done():,    return 0, fmt.Errorf(\"operation timed out\"),  },},\n\n// Prevention: Avoid nested locks — use higher-level abstractions,type SafeTransfer struct {,  mu sync.Mutex,},,func (st *SafeTransfer) Transfer(a1, a2 *Account, amount int) {,  st.mu.Lock(),  defer st.mu.Unlock(),\n\n  // Both account locks held under single outer lock — no deadlock,  a1.mu.Lock(),  a2.mu.Lock(),,  a1.balance -= amount,  a2.balance += amount,,  a2.mu.Unlock(),  a1.mu.Unlock(),},\n\n// Prevention: Unbuffered channel + explicit completion,func safeFanIn(ch1, ch2 <-chan int, result chan<- int) {,  done := 0,  for done < 2 {,    select {,    case v1, ok := <-ch1:,      if ok {,        result <- v1,      } else {,        done++,      },    case v2, ok := <-ch2:,      if ok {,        result <- v2,      } else {,        done++,      },    },  },  close(result),}"
                  }
        ],
        tips: [
                  "Use context.WithTimeout() on blocking operations to prevent infinite waits.",
                  "Lock resources in a consistent order — prevents circular wait.",
                  "Avoid holding locks while waiting on channels — leads to deadlocks.",
                  "Use go run -race to catch data races (synchronization bugs).",
                  "Prefer channels to mutexes when possible — easier to reason about.",
                  "Use deadlock detection: pprof with the goroutine profile to see goroutine stacks."
        ],
        mistake: "Locking mutex while waiting on a channel: mu.Lock(); <-ch panics if the channel sender needs the mutex — classic deadlock.",
        shorthand: {
          verbose: "mu.Lock()\nresult := <-ch  // Waits; sender needs mu.Lock()\nmu.Unlock()     // Deadlock!",
          concise: "val := <-ch  // Receive outside lock\nmu.Lock()\nprocess(val)\nmu.Unlock()",
        },
      },
      {
        id: "sync-waitgroup",
        fn: "sync.WaitGroup",
        desc: "Synchronization primitive for waiting on goroutines — simple alternative to channels for fan-out/fan-in.",
        category: "Sync Primitives",
        subtitle: "Wait for goroutine completion",
        signature: "wg.Add(n)  |  defer wg.Done()  |  wg.Wait()",
        descLong: "sync.WaitGroup is a counter that blocks until all registered goroutines finish. Add(n) increments the counter; Done() decrements it. Wait() blocks until the counter reaches zero. WaitGroup can be reused after Wait() returns, but must not be copied. Simpler than channels for simple wait patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.WaitGroup — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"math/rand\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  var wg sync.WaitGroup"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.WaitGroup — common patterns you'll see in production.\n// APPROACH  - Combine sync.WaitGroup with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wait for 5 goroutines\n  wg.Add(5)\n\n  for i := 0; i < 5; i++ {\n    go func(id int) {\n      defer wg.Done()  // decrement on exit\n      fmt.Printf(\"Worker %d starting\n\", id)\n      time.Sleep(time.Duration(rand.Intn(100)) * time.Millisecond)\n      fmt.Printf(\"Worker %d done\n\", id)\n    }(i)\n  }\n\n  fmt.Println(\"Waiting for all workers...\")\n  wg.Wait()  // blocks until all Done() calls\n  fmt.Println(\"All done!\")"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.WaitGroup — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reuse WaitGroup for batch processing,  batches := [][]int{,    {1, 2, 3},,    {4, 5, 6},,    {7, 8, 9},,  },,  for _, batch := range batches {,    wg.Add(len(batch)),    for _, item := range batch {,      go func(val int) {,        defer wg.Done(),        processBatch(val),      }(item),    },    wg.Wait()  // wait for this batch,    fmt.Println(\"Batch done\"),  },},,func processBatch(val int) {,  fmt.Printf(\"Processing %d,\", val),  time.Sleep(50 * time.Millisecond),},\n\n// Pattern: Add(1) per goroutine in a loop,func processItems(items []string) {,  var wg sync.WaitGroup,,  for _, item := range items {,    wg.Add(1),    go func(s string) {,      defer wg.Done(),      // process s,    }(item)  // important: pass item as argument,  },,  wg.Wait(),}"
                  }
        ],
        tips: [
                  "Call Add() before spawning goroutines — if you Add() after spawning, a race condition can occur.",
                  "Always defer Done() immediately after wg.Add(1) — prevents accidental mismatches.",
                  "WaitGroup is reusable after Wait() returns — call Add() again for the next batch.",
                  "Never copy a WaitGroup — always use a pointer or a single instance.",
                  "Prefer errgroup for goroutines that can fail — it combines WaitGroup with error collection."
        ],
        mistake: "Adding inside a goroutine: go func() { wg.Add(1); ... }() — race condition between Add() and Wait(). Always Add() before spawning the goroutine.",
        shorthand: {
          verbose: "var wg sync.WaitGroup\nfor i := 0; i < 5; i++ {\n  go func(id int) {\n    wg.Add(1)\n    defer wg.Done()\n    doWork(id)\n  }(i)\n}\nwg.Wait()",
          concise: "wg.Add(5)\nfor i := 0; i < 5; i++ {\n  go func(id int) { defer wg.Done(); doWork(id) }(i)\n}",
        },
      },
      {
        id: "sync-cond",
        fn: "sync.Cond",
        desc: "Condition variable for waiting on a condition and signaling multiple goroutines.",
        category: "Sync Primitives",
        subtitle: "Notify goroutines when a condition changes",
        signature: "cond := sync.NewCond(&mu)  |  cond.Wait()  |  cond.Broadcast()",
        descLong: "sync.Cond is a condition variable that pairs with a mutex. Goroutines call Wait() to sleep until notified. Signal() wakes one goroutine; Broadcast() wakes all. Always check the condition after waking — spurious wakeups are possible. Less common than channels but essential for producer-consumer and resource pool patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sync.Cond — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)\n\ntype Queue struct {\n  mu   sync.Mutex\n  cond *sync.Cond\n  data []int\n}\n\nfunc NewQueue() *Queue {\n  q := &Queue{}\n  q.cond = sync.NewCond(&q.mu)\n  return q\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sync.Cond — common patterns you'll see in production.\n// APPROACH  - Combine sync.Cond with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Producer\nfunc (q *Queue) Push(val int) {\n  q.mu.Lock()\n  defer q.mu.Unlock()\n\n  q.data = append(q.data, val)\n  fmt.Printf(\"Pushed %d (queue size: %d)\n\", val, len(q.data))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sync.Cond — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Signal one waiting consumer,  q.cond.Signal()  // or Broadcast() to wake all,},\n\n// Consumer — waits if queue is empty,func (q *Queue) Pop() int {,  q.mu.Lock(),  defer q.mu.Unlock(),\n\n  // Wait while queue is empty,  for len(q.data) == 0 {,    q.cond.Wait()  // release lock, sleep, reacquire lock on wakeup,  },,  val := q.data[0],  q.data = q.data[1:],  fmt.Printf(\"Popped %d (queue size: %d),\", val, len(q.data)),  return val,},,func main() {,  q := NewQueue(),\n\n  // Start consumers that wait for items,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 1 got: %d,\", val),    },  }(),,  go func() {,    for i := 0; i < 5; i++ {,      val := q.Pop(),      fmt.Printf(\"Consumer 2 got: %d,\", val),    },  }(),\n\n  // Produce items slowly,  for i := 0; i < 10; i++ {,    time.Sleep(100 * time.Millisecond),    q.Push(i),  },,  time.Sleep(500 * time.Millisecond),  fmt.Println(\"Done\"),},\n\n// Broadcast example — notify all waiters of a state change,type EventBus struct {,  mu    sync.Mutex,  cond  *sync.Cond,  ready bool,},,func NewEventBus() *EventBus {,  eb := &EventBus{},  eb.cond = sync.NewCond(&eb.mu),  return eb,},,func (eb *EventBus) Wait() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  for !eb.ready {,    eb.cond.Wait()  // sleep until ready,  },},,func (eb *EventBus) Signal() {,  eb.mu.Lock(),  defer eb.mu.Unlock(),,  eb.ready = true,  eb.cond.Broadcast()  // wake all waiters,}"
                  }
        ],
        tips: [
                  "Always hold the mutex when calling Wait(), Signal(), or Broadcast().",
                  "Check the condition in a loop (for !condition { cond.Wait() }) — spurious wakeups are possible.",
                  "Signal() wakes one goroutine; Broadcast() wakes all — choose based on how many should wake.",
                  "sync.Cond is less common than channels — use channels for simple cases, Cond for complex state.",
                  "Each Cond is associated with a single Mutex — don't share a Cond across mutexes."
        ],
        mistake: "Assuming one Signal() always wakes a goroutine — if multiple are waiting, Signal() picks one arbitrarily. Use Broadcast() if all should wake.",
        shorthand: {
          verbose: "cond := sync.NewCond(&mu)\nfor i := 0; i < 5; i++ {\n  go func() {\n    mu.Lock()\n    for !ready { cond.Wait() }\n    mu.Unlock()\n  }()\n}\nmu.Lock()\nready = true\ncond.Signal()  // wakes one\nmu.Unlock()",
          concise: "cond.Broadcast()  // Wake all waiting\n// vs Signal() for one consumer",
        },
      },
      {
        id: "rate-limiting-semaphore",
        fn: "Rate Limiting & Semaphore",
        desc: "Limit concurrency with a buffered channel (semaphore) — common pattern for bounded concurrency.",
        category: "Concurrency Patterns",
        subtitle: "Limit how many goroutines run concurrently",
        signature: "sem := make(chan struct{}, maxConcurrency)  |  sem <- struct{}{}  |  <-sem",
        descLong: "A buffered channel acts as a semaphore: send to acquire a slot, receive to release. The buffer size limits concurrency. This is simpler than a worker pool for cases where you want to control concurrency across many independent tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rate Limiting & Semaphore — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport (\n  \"fmt\"\n  \"log\"\n  \"net/http\"\n  \"sync\"\n  \"time\"\n)\n\nfunc main() {\n  // Semaphore pattern — limit to 3 concurrent tasks\n  maxConcurrency := 3\n  sem := make(chan struct{}, maxConcurrency)\n\n  tasks := []string{\"task1\", \"task2\", \"task3\", \"task4\", \"task5\", \"task6\"}\n  var wg sync.WaitGroup\n\n  for _, task := range tasks {\n    wg.Add(1)\n    go func(name string) {\n      defer wg.Done()\n\n      sem <- struct{}{}        // acquire slot (blocks if full)\n      defer func() { <-sem }() // release slot\n\n      fmt.Printf(\"%s started\n\", name)\n      time.Sleep(500 * time.Millisecond)\n      fmt.Printf(\"%s done\n\", name)\n    }(task)\n  }\n\n  wg.Wait()\n  fmt.Println(\"All done\")\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rate Limiting & Semaphore — common patterns you'll see in production.\n// APPROACH  - Combine Rate Limiting & Semaphore with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Rate limiting with tokens — allow N requests per second\ntype RateLimiter struct {\n  tokens chan struct{}\n  done   chan struct{}\n}\n\nfunc NewRateLimiter(requestsPerSec int) *RateLimiter {\n  rl := &RateLimiter{\n    tokens: make(chan struct{}, requestsPerSec),\n    done:   make(chan struct{}),\n  }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rate Limiting & Semaphore — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Refill tokens periodically,  go func() {,    ticker := time.NewTicker(time.Second / time.Duration(requestsPerSec)),    defer ticker.Stop(),,    for {,      select {,      case <-ticker.C:,        // Try to add a token (non-blocking),        select {,        case rl.tokens <- struct{}{}:,        default:,        },      case <-rl.done:,        return,      },    },  }(),,  return rl,},,func (rl *RateLimiter) Allow() bool {,  select {,  case <-rl.tokens:,    return true,  default:,    return false,  },},,func (rl *RateLimiter) Wait() {,  <-rl.tokens  // block until token available,},,func (rl *RateLimiter) Close() {,  close(rl.done),},\n\n// Example: HTTP client with concurrency limit,func fetchWithLimit(urls []string, maxConcurrent int) []string {,  sem := make(chan struct{}, maxConcurrent),  results := make([]string, len(urls)),  var wg sync.WaitGroup,,  for i, url := range urls {,    wg.Add(1),    go func(idx int, u string) {,      defer wg.Done(),,      sem <- struct{}{},      defer func() { <-sem }(),,      resp, err := http.Get(u),      if err != nil {,        results[idx] = fmt.Sprintf(\"error: %v\", err),        return,      },      defer resp.Body.Close(),      results[idx] = fmt.Sprintf(\"status: %d\", resp.StatusCode),    }(i, url),  },,  wg.Wait(),  return results,},\n\n// Use errgroup.SetLimit() (Go 1.20+) as cleaner alternative,func cleanerApproach() {,  import \"golang.org/x/sync/errgroup\",,  urls := []string{\"http://example.com\", \"http://golang.org\"},,  g, ctx := errgroup.WithContext(context.Background()),  g.SetLimit(3)  // limit to 3 concurrent,,  for _, url := range urls {,    u := url,    g.Go(func() error {,      resp, err := http.Get(u),      if err != nil {,        return err,      },      resp.Body.Close(),      return nil,    }),  },,  if err := g.Wait(); err != nil {,    log.Fatal(err),  },}"
                  }
        ],
        tips: [
                  "Buffered channel as semaphore: send to acquire, receive to release.",
                  "Always defer the release: defer func() { <-sem }() to prevent leaks.",
                  "errgroup.SetLimit(n) is a cleaner, higher-level alternative (Go 1.20+).",
                  "Use a non-blocking acquire (select with default) for token buckets and rate limiters.",
                  "For HTTP clients, consider setting MaxIdleConns on the transport instead of a semaphore."
        ],
        mistake: "Forgetting to release slots: sem <- struct{}{}; doWork() without defer — later goroutines block forever waiting for slots.",
        shorthand: {
          verbose: "sem := make(chan struct{}, 3)\nfor i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}\n    doWork(id)\n    <-sem\n  }(i)\n}",
          concise: "for i := 0; i < 10; i++ {\n  go func(id int) {\n    sem <- struct{}{}; defer func() { <-sem }()\n    doWork(id)\n  }(i)\n}  // Always defer slot release",
        },
      },
      {
        id: "deadlock-prevention",
        fn: "Deadlock Prevention & Detection",
        desc: "Understand common deadlock patterns and how to avoid them — circular locks, goroutine leaks.",
        category: "Concurrency Patterns",
        subtitle: "Avoid and diagnose deadlock scenarios",
        signature: "use timeouts  |  avoid nested locks  |  go run -race",
        descLong: "Deadlocks occur when goroutines wait for each other circularly. Common causes: circular channel sends, nested mutex locks, or waiting on a closed channel. Prevention: use timeouts (context.WithTimeout), avoid nested locks, maintain lock order discipline. Detection: go run -race detects data races (not deadlocks directly, but catches synchronization bugs).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Deadlock Prevention & Detection — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npackage main\n\nimport (\n  \"context\"\n  \"fmt\"\n  \"log\"\n  \"sync\"\n  \"time\"\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Deadlock Prevention & Detection — common patterns you'll see in production.\n// APPROACH  - Combine Deadlock Prevention & Detection with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Deadlock 1: Circular channel send\nfunc deadlockChannels() {\n  ch1 := make(chan int)\n  ch2 := make(chan int)\n\n  go func() {\n    ch1 <- 1\n    <-ch2  // wait for ch2\n  }()\n\n  go func() {\n    ch2 <- 2\n    <-ch1  // wait for ch1 — circular dependency\n  }()"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Deadlock Prevention & Detection — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Both goroutines wait for each other — deadlock,  // fatal error: all goroutines are asleep - deadlock!,},\n\n// Solution: Use buffered channels or different ordering,func safeChannels() {,  ch1 := make(chan int, 1)  // buffered,  ch2 := make(chan int, 1),,  go func() {,    ch1 <- 1,    <-ch2,  }(),,  go func() {,    ch2 <- 2,    <-ch1,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Deadlock 2: Nested mutex locks in different order,type Account struct {,  mu      sync.Mutex,  balance int,},,func deadlockMutex(a1, a2 *Account) {,  go func() {,    a1.mu.Lock(),    defer a1.mu.Unlock(),    time.Sleep(10 * time.Millisecond)  // simulate work,    a2.mu.Lock(),    defer a2.mu.Unlock(),    // transfer from a1 to a2,  }(),,  go func() {,    a2.mu.Lock()  // different order!,    defer a2.mu.Unlock(),    time.Sleep(10 * time.Millisecond),    a1.mu.Lock(),    defer a1.mu.Unlock(),    // transfer from a2 to a1 — deadlock,  }(),,  time.Sleep(100 * time.Millisecond),},\n\n// Solution: Lock in consistent order,func safeMutex(a1, a2 *Account) {,  // Always lock in the same order (e.g., by address),  lock := func(a, b *Account) (*Account, *Account) {,    if a > b {,      return b, a,    },    return a, b,  },,  first, second := lock(a1, a2),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),,  go func() {,    first.mu.Lock(),    defer first.mu.Unlock(),    second.mu.Lock(),    defer second.mu.Unlock(),  }(),},\n\n// Prevention: Use timeouts,func safeWithTimeout(ctx context.Context, ch chan int) (int, error) {,  ctx, cancel := context.WithTimeout(ctx, 1*time.Second),  defer cancel(),,  select {,  case val := <-ch:,    return val, nil,  case <-ctx.Done():,    return 0, fmt.Errorf(\"operation timed out\"),  },},\n\n// Prevention: Avoid nested locks — use higher-level abstractions,type SafeTransfer struct {,  mu sync.Mutex,},,func (st *SafeTransfer) Transfer(a1, a2 *Account, amount int) {,  st.mu.Lock(),  defer st.mu.Unlock(),\n\n  // Both account locks held under single outer lock — no deadlock,  a1.mu.Lock(),  a2.mu.Lock(),,  a1.balance -= amount,  a2.balance += amount,,  a2.mu.Unlock(),  a1.mu.Unlock(),},\n\n// Prevention: Unbuffered channel + explicit completion,func safeFanIn(ch1, ch2 <-chan int, result chan<- int) {,  done := 0,  for done < 2 {,    select {,    case v1, ok := <-ch1:,      if ok {,        result <- v1,      } else {,        done++,      },    case v2, ok := <-ch2:,      if ok {,        result <- v2,      } else {,        done++,      },    },  },  close(result),}"
                  }
        ],
        tips: [
                  "Use context.WithTimeout() on blocking operations to prevent infinite waits.",
                  "Lock resources in a consistent order — prevents circular wait.",
                  "Avoid holding locks while waiting on channels — leads to deadlocks.",
                  "Use go run -race to catch data races (synchronization bugs).",
                  "Prefer channels to mutexes when possible — easier to reason about.",
                  "Use deadlock detection: pprof with the goroutine profile to see goroutine stacks."
        ],
        mistake: "Locking mutex while waiting on a channel: mu.Lock(); <-ch panics if the channel sender needs the mutex — classic deadlock.",
        shorthand: {
          verbose: "mu.Lock()\nmsg := <-ch  // deadlock if sender needs mu\nmu.Unlock()",
          concise: "mu.Lock()\n// do quick work\nmu.Unlock()\nmsg := <-ch",
        },
      },
    ],
  },
]

export default { meta, sections }
