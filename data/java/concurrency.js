export const meta = {
  "id": "java-concurrency",
  "label": "Concurrency & Threads",
  "icon": "⚡",
  "description": "Threading, synchronization, executors, and modern concurrency patterns."
}

export const sections = [

  // ── Section 1: Thread Basics ─────────────────────────────────────────
  {
    id: "thread-basics",
    title: "Thread Basics",
    entries: [
      {
        id: "thread-class",
        fn: "Thread Class",
        desc: "Create threads by extending Thread class.",
        category: "Threads",
        subtitle: "Thread creation via inheritance",
        signature: "class MyThread extends Thread { public void run() { ... } }",
        descLong: "Creating threads by extending Thread class and overriding run(). Simple but less flexible than implementing Runnable. Thread.start() runs the thread asynchronously.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Thread Class — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class ThreadClassExample {\n    static class PrintTask extends Thread {\n        private String name;\n        private int count;\n\n        PrintTask(String name, int count) {\n            this.name = name;\n            this.count = count;\n        }\n\n        @Override\n        public void run() {\n            for (int i = 0; i < count; i++) {\n                System.out.println(name + \" - \" + (i + 1));\n                try {\n                    Thread.sleep(100);  // Simulate work\n                } catch (InterruptedException e) {\n                    System.out.println(name + \" was interrupted\");\n                }\n            }\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Thread Class — common patterns you'll see in production.\n// APPROACH  - Combine Thread Class with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic static void main(String[] args) throws InterruptedException {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Thread Class — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nThread t1 = new PrintTask(\"Task-1\", 3);\n        Thread t2 = new PrintTask(\"Task-2\", 3);\n\n        t1.start();  // Start first thread\n        t2.start();  // Start second thread\n\n        t1.join();   // Wait for t1 to finish\n        t2.join();   // Wait for t2 to finish\n        System.out.println(\"All tasks completed\");\n    }\n}"
                  }
        ],
        tips: [
                  "Always call start() instead of run() - start() creates a new thread, run() executes in current thread",
                  "Use join() to wait for a thread to complete",
                  "Implement Runnable instead of extending Thread for better design (single inheritance)"
        ],
        mistake: "Calling run() directly instead of start() (executes in current thread, no concurrency).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class ThreadClassExample {\n    static class PrintTask\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "runnable-interface",
        fn: "Runnable Interface",
        desc: "Create threads by implementing Runnable interface.",
        category: "Threads",
        subtitle: "Thread creation via composition",
        signature: "Thread thread = new Thread(runnable);",
        descLong: "Implementing Runnable is preferred over extending Thread since Java classes can only extend one parent. Allows implementing other interfaces too.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Runnable Interface — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class RunnableExample {\n    static class CountTask implements Runnable {\n        private String taskName;\n        private int start;\n        private int end;\n\n        CountTask(String taskName, int start, int end) {\n            this.taskName = taskName;\n            this.start = start;\n            this.end = end;\n        }\n\n        @Override\n        public void run() {\n            System.out.println(taskName + \" started\");\n            for (int i = start; i <= end; i++) {\n                System.out.println(taskName + \": \" + i);\n            }\n            System.out.println(taskName + \" finished\");\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Runnable Interface — common patterns you'll see in production.\n// APPROACH  - Combine Runnable Interface with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic static void main(String[] args) throws InterruptedException {\n        // Create threads with Runnable\n        Thread t1 = new Thread(new CountTask(\"Count-1\", 1, 3), \"Thread-1\");\n        Thread t2 = new Thread(new CountTask(\"Count-2\", 4, 6), \"Thread-2\");\n        Thread t3 = new Thread(() -> {\n            System.out.println(\"Lambda thread running\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Runnable Interface — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n}, \"Thread-3\");\n\n        t1.start();\n        t2.start();\n        t3.start();\n\n        t1.join();\n        t2.join();\n        t3.join();\n        System.out.println(\"All threads completed\");\n    }\n}"
                  }
        ],
        tips: [
                  "Prefer Runnable over extending Thread (composition over inheritance)",
                  "Lambda expressions make Runnable concise: new Thread(() -> {...}).start()",
                  "Use thread names for easier debugging"
        ],
        mistake: "Extending Thread when implementing Runnable would be cleaner.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class ThreadClassExample {\n    static class PrintTask\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "callable-future",
        fn: "Callable and Future",
        desc: "Execute code that returns a result and handles checked exceptions.",
        category: "Threads",
        subtitle: "Result-producing tasks",
        signature: "Callable<T> or Future<T>",
        descLong: "Callable is like Runnable but returns a value and throws checked exceptions. Future represents a result that will be available in the future.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Callable and Future — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.Callable;\nimport java.util.concurrent.ExecutionException;\nimport java.util.concurrent.FutureTask;\n\npublic class CallableFutureExample {\n    static class CalculateTask implements Callable<Integer> {\n        private int a;\n        private int b;\n\n        CalculateTask(int a, int b) {\n            this.a = a;\n            this.b = b;\n        }\n\n        @Override\n        public Integer call() throws Exception {\n            System.out.println(\"Calculating \" + a + \" + \" + b);\n            Thread.sleep(500);  // Simulate computation\n            return a + b;\n        }\n    }\n\n    public static void main(String[] args) throws ExecutionException, InterruptedException {\n        // Create Callable\n        Callable<Integer> task = new CalculateTask(10, 20);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Callable and Future — common patterns you'll see in production.\n// APPROACH  - Combine Callable and Future with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wrap in FutureTask\n        FutureTask<Integer> future = new FutureTask<>(task);\n        Thread thread = new Thread(future);\n        thread.start();\n\n        System.out.println(\"Task running...\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Callable and Future — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Get result (blocks until complete),        try {,            Integer result = future.get();,            System.out.println(\"Result: \" + result);,        } catch (ExecutionException e) {,            System.out.println(\"Task failed: \" + e.getMessage());,        },\n\n        // Check if done,        System.out.println(\"Task completed: \" + future.isDone());,\n\n        // With lambda,        Callable<String> lambdaTask = () -> {,            Thread.sleep(100);,            return \"Hello from Callable\";,        };,,        FutureTask<String> lambdaFuture = new FutureTask<>(lambdaTask);,        new Thread(lambdaFuture).start();,        System.out.println(lambdaFuture.get());,    },}"
                  }
        ],
        tips: [
                  "Use Callable when your task needs to return a result",
                  "get() blocks until the result is available; use with caution",
                  "Check isDone() or use timeout in get(timeout, unit) to avoid hanging"
        ],
        mistake: "Calling get() without timeout in the main thread (can block forever).",
        shorthand: {
          verbose: "import java.util.concurrent.Callable;\nimport java.util.concurrent.ExecutionException;\nimport java.ut",
          concise: "// see verbose",
        },
      },
      {
        id: "thread-lifecycle",
        fn: "Thread Lifecycle and States",
        desc: "Understand thread states: New, Runnable, Running, Blocked, Terminated.",
        category: "Threads",
        subtitle: "Thread state management",
        signature: "Thread.State.NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED",
        descLong: "Threads go through states: New (created), Runnable (ready), Running (executing), Blocked (waiting for resource), and Terminated (finished).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Thread Lifecycle and States — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class ThreadLifecycleExample {\n    static class StateMonitor implements Runnable {\n        private String name;\n        private long duration;\n\n        StateMonitor(String name, long duration) {\n            this.name = name;\n            this.duration = duration;\n        }\n\n        @Override\n        public void run() {\n            System.out.println(name + \" is running\");\n            try {\n                Thread.sleep(duration);\n            } catch (InterruptedException e) {\n                System.out.println(name + \" was interrupted\");\n            }\n            System.out.println(name + \" finished\");\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        Thread thread = new Thread(new StateMonitor(\"Worker\", 1000), \"WorkerThread\");\n\n        System.out.println(\"State after creation: \" + thread.getState());  // NEW\n\n        thread.start();\n        System.out.println(\"State after start: \" + thread.getState());     // RUNNABLE\n\n        Thread.sleep(100);\n        System.out.println(\"State while sleeping: \" + thread.getState()); // TIMED_WAITING\n\n        thread.join();\n        System.out.println(\"State after join: \" + thread.getState());      // TERMINATED"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Thread Lifecycle and States — common patterns you'll see in production.\n// APPROACH  - Combine Thread Lifecycle and States with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Thread priority\n        Thread highPriority = new Thread(() -> System.out.println(\"High priority\"));\n        highPriority.setPriority(Thread.MAX_PRIORITY);  // 10\n        highPriority.start();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Thread Lifecycle and States — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nThread normalPriority = new Thread(() -> System.out.println(\"Normal priority\"));\n        normalPriority.setPriority(Thread.NORM_PRIORITY);  // 5\n        normalPriority.start();\n    }\n}"
                  }
        ],
        tips: [
                  "Understand thread states for debugging and monitoring",
                  "getState() returns the current state; note it's a snapshot",
                  "Thread priority is a hint; scheduling is OS-dependent"
        ],
        mistake: "Relying on thread priority for critical synchronization.",
        shorthand: {
          verbose: "public class ThreadLifecycleExample {\n    static class StateMonitor implements Runnable {\n        pr",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Executors and Thread Pools ─────────────────────────────────────────
  {
    id: "executors",
    title: "Executors and Thread Pools",
    entries: [
      {
        id: "executor-service",
        fn: "ExecutorService",
        desc: "Manage and execute tasks using a thread pool.",
        category: "Executors",
        subtitle: "Thread pool abstraction",
        signature: "ExecutorService executor = Executors.newFixedThreadPool(n);",
        descLong: "ExecutorService abstracts thread management using thread pools. Reuses threads to avoid expensive creation/destruction. Always shutdown() when done.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ExecutorService — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util.concurrent.TimeUnit;\n\npublic class ExecutorServiceExample {\n    static class PrintTask implements Runnable {\n        private String name;\n\n        PrintTask(String name) {\n            this.name = name;\n        }\n\n        @Override\n        public void run() {\n            System.out.println(name + \" executing on thread: \" + Thread.currentThread().getName());\n            try {\n                Thread.sleep(500);\n            } catch (InterruptedException e) {\n                System.out.println(name + \" interrupted\");\n            }\n            System.out.println(name + \" done\");\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        // Create fixed thread pool with 2 threads\n        ExecutorService executor = Executors.newFixedThreadPool(2);\n\n        System.out.println(\"Submitting tasks...\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ExecutorService — common patterns you'll see in production.\n// APPROACH  - Combine ExecutorService with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Submit multiple tasks\n        for (int i = 1; i <= 5; i++) {\n            executor.execute(new PrintTask(\"Task-\" + i));\n        }\n\n        System.out.println(\"All tasks submitted\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ExecutorService — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Shutdown gracefully,        executor.shutdown();,\n\n        // Wait for all tasks to complete,        if (executor.awaitTermination(10, TimeUnit.SECONDS)) {,            System.out.println(\"All tasks completed\");,        } else {,            System.out.println(\"Timeout waiting for tasks\");,            executor.shutdownNow();,        },    },}"
                  }
        ],
        tips: [
                  "Always call shutdown() or shutdownNow() to release executor resources",
                  "Use execute() for Runnable, submit() for Callable or Runnable",
                  "newFixedThreadPool(n) keeps n threads alive; adjust based on workload"
        ],
        mistake: "Forgetting to shutdown ExecutorService (resource leak).",
        shorthand: {
          verbose: "import java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util",
          concise: "// see verbose",
        },
      },
      {
        id: "executor-types",
        fn: "Executor Pool Types",
        desc: "Different executor types for various scenarios.",
        category: "Executors",
        subtitle: "Pool configurations",
        signature: "newFixedThreadPool, newCachedThreadPool, newSingleThreadExecutor, newScheduledThreadPool",
        descLong: "Java provides different executor factories: fixed-size pools, cached pools, single-thread executors, and scheduled executors for different use cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Executor Pool Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util.concurrent.ScheduledExecutorService;\nimport java.util.concurrent.TimeUnit;\n\npublic class ExecutorTypesExample {\n    static class Task implements Runnable {\n        private int id;\n\n        Task(int id) {\n            this.id = id;\n        }\n\n        @Override\n        public void run() {\n            System.out.println(\"Task \" + id + \" on \" + Thread.currentThread().getName());\n            try {\n                Thread.sleep(500);\n            } catch (InterruptedException e) {\n                e.printStackTrace();\n            }\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        // Fixed thread pool - reuses n threads\n        System.out.println(\"Fixed Thread Pool:\");\n        ExecutorService fixed = Executors.newFixedThreadPool(2);\n        for (int i = 1; i <= 4; i++) {\n            fixed.execute(new Task(i));\n        }\n        fixed.shutdown();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Executor Pool Types — common patterns you'll see in production.\n// APPROACH  - Combine Executor Pool Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Cached thread pool - creates threads as needed\n        System.out.println(\"\\nCached Thread Pool:\");\n        ExecutorService cached = Executors.newCachedThreadPool();\n        for (int i = 1; i <= 3; i++) {\n            cached.execute(new Task(i));\n        }\n        cached.shutdown();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Executor Pool Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Single thread executor - single thread, sequential,        System.out.println(\"\\nSingle Thread Executor:\");,        ExecutorService single = Executors.newSingleThreadExecutor();,        for (int i = 1; i <= 3; i++) {,            single.execute(new Task(i));,        },        single.shutdown();,\n\n        // Scheduled executor - run at fixed rate or delay,        System.out.println(\"\\nScheduled Executor:\");,        ScheduledExecutorService scheduled = Executors.newScheduledThreadPool(1);,        scheduled.scheduleAtFixedRate(,            () -> System.out.println(\"Periodic task\"),,            0,      // initial delay,            1,      // period,            TimeUnit.SECONDS,        );,,        Thread.sleep(3500);,        scheduled.shutdown();,    },}"
                  }
        ],
        tips: [
                  "newFixedThreadPool for predictable workloads with known concurrency",
                  "newCachedThreadPool for many short-lived tasks (creates threads as needed)",
                  "newSingleThreadExecutor for sequential task processing",
                  "newScheduledThreadPool for periodic or delayed tasks"
        ],
        mistake: "Using cached thread pool for long-running tasks (unbounded thread creation).",
        shorthand: {
          verbose: "import java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util",
          concise: "// see verbose",
        },
      },
      {
        id: "submit-vs-execute",
        fn: "execute() vs submit()",
        desc: "Know the difference between execute() and submit() methods.",
        category: "Executors",
        subtitle: "Task submission methods",
        signature: "executor.execute(runnable) vs executor.submit(callable/runnable)",
        descLong: "execute() is fire-and-forget for Runnable. submit() returns a Future for result/exception handling and works with both Runnable and Callable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of execute() vs submit() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util.concurrent.Future;\n\npublic class ExecuteVsSubmitExample {\n    public static void main(String[] args) throws Exception {\n        ExecutorService executor = Executors.newFixedThreadPool(1);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of execute() vs submit() — common patterns you'll see in production.\n// APPROACH  - Combine execute() vs submit() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// execute() - Runnable only, no return value\n        System.out.println(\"Using execute():\");\n        executor.execute(() -> {\n            System.out.println(\"Task 1 executed\");\n        });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of execute() vs submit() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// submit() with Runnable - returns Future<Void>,        System.out.println(\"\\nUsing submit() with Runnable:\");,        Future<?> future1 = executor.submit(() -> {,            System.out.println(\"Task 2 submitted\");,        });,        future1.get();  // Wait for completion,        System.out.println(\"Task 2 completed\");,\n\n        // submit() with Callable - returns Future<T> with result,        System.out.println(\"\\nUsing submit() with Callable:\");,        Future<Integer> future2 = executor.submit(() -> {,            System.out.println(\"Task 3 computing...\");,            Thread.sleep(500);,            return 42;,        });,        Integer result = future2.get();,        System.out.println(\"Task 3 result: \" + result);,\n\n        // Exception handling,        System.out.println(\"\\nException handling:\");,        Future<String> future3 = executor.submit(() -> {,            throw new RuntimeException(\"Task 4 failed\");,        });,        try {,            future3.get();,        } catch (Exception e) {,            System.out.println(\"Caught: \" + e.getCause().getMessage());,        },,        executor.shutdown();,    },}"
                  }
        ],
        tips: [
                  "Use execute() for fire-and-forget tasks",
                  "Use submit() when you need a result or want to handle exceptions",
                  "submit() throws ExecutionException if the task threw an exception"
        ],
        mistake: "Using execute() when you need exception handling or a result.",
        shorthand: {
          verbose: "import java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util",
          concise: "// see verbose",
        },
      },
      {
        id: "scheduled-executor",
        fn: "ScheduledExecutorService",
        desc: "Execute tasks after a delay or at fixed intervals.",
        category: "Executors",
        subtitle: "Scheduled execution",
        signature: "schedule(), scheduleAtFixedRate(), scheduleWithFixedDelay()",
        descLong: "ScheduledExecutorService schedules tasks for execution after delays or at regular intervals. Powerful for timers, polling, and periodic maintenance tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ScheduledExecutorService — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ScheduledExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util.concurrent.TimeUnit;\n\npublic class ScheduledExecutorExample {\n    static class Task implements Runnable {\n        private String name;\n\n        Task(String name) {\n            this.name = name;\n        }\n\n        @Override\n        public void run() {\n            System.out.println(\"[\" + System.currentTimeMillis() % 10000 + \"] \" + name);\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        ScheduledExecutorService executor = Executors.newScheduledThreadPool(2);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ScheduledExecutorService — common patterns you'll see in production.\n// APPROACH  - Combine ScheduledExecutorService with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// One-time delay\n        System.out.println(\"Schedule with delay (2 seconds):\");\n        executor.schedule(new Task(\"Delayed\"), 2, TimeUnit.SECONDS);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ScheduledExecutorService — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Fixed rate (start new task regardless of previous completion),        System.out.println(\"\\nSchedule at fixed rate (every 1 second):\");,        executor.scheduleAtFixedRate(,            new Task(\"Fixed-Rate\"),,            0,      // initial delay,            1,      // period,            TimeUnit.SECONDS,        );,\n\n        // Fixed delay (wait after previous completion),        System.out.println(\"\\nSchedule with fixed delay (1 sec after previous):\");,        executor.scheduleWithFixedDelay(,            new Task(\"Fixed-Delay\"),,            0,      // initial delay,            1,      // delay after completion,            TimeUnit.SECONDS,        );,\n\n        // Run for 5 seconds then stop,        Thread.sleep(5000);,        executor.shutdown();,,        if (executor.awaitTermination(5, TimeUnit.SECONDS)) {,            System.out.println(\"\\nExecutor shut down successfully\");,        },    },}"
                  }
        ],
        tips: [
                  "scheduleAtFixedRate: ignores task execution time, starts new task at fixed intervals",
                  "scheduleWithFixedDelay: waits delay time after previous completion",
                  "schedule() for one-time delayed execution, like a timer"
        ],
        mistake: "Using scheduleAtFixedRate when task execution time varies (can cause backlog).",
        shorthand: {
          verbose: "import java.util.concurrent.ScheduledExecutorService;\nimport java.util.concurrent.Executors;\nimport ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Synchronization Primitives ─────────────────────────────────────────
  {
    id: "synchronization",
    title: "Synchronization Primitives",
    entries: [
      {
        id: "synchronized-keyword",
        fn: "synchronized Keyword",
        desc: "Synchronize access to shared resources using monitors.",
        category: "Synchronization",
        subtitle: "Monitor-based locking",
        signature: "synchronized (object) { ... } or synchronized method()",
        descLong: "synchronized ensures only one thread can execute at a time. Works by acquiring a lock on an object's monitor. Foundation of Java thread safety.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of synchronized Keyword — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class SynchronizedExample {\n    static class Counter {\n        private int count = 0;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of synchronized Keyword — common patterns you'll see in production.\n// APPROACH  - Combine synchronized Keyword with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Synchronized method\n        synchronized void increment() {\n            count++;\n        }\n\n        synchronized int getCount() {\n            return count;\n        }\n    }\n\n    static class UnsafeCounter {\n        private int count = 0;\n\n        void increment() {\n            count++;  // NOT SAFE - race condition\n        }\n\n        int getCount() {\n            return count;\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        // Safe counter with synchronization\n        System.out.println(\"Safe counter with synchronized:\");\n        Counter safe = new Counter();\n        ExecutorService executor = Executors.newFixedThreadPool(5);\n\n        for (int i = 0; i < 10; i++) {\n            executor.execute(() -> {\n                for (int j = 0; j < 100; j++) {\n                    safe.increment();\n                }\n            });\n        }\n        executor.shutdown();\n        executor.awaitTermination(5, TimeUnit.SECONDS);\n        System.out.println(\"Final count (safe): \" + safe.getCount());  // Always 1000"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of synchronized Keyword — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Unsafe counter without synchronization,        System.out.println(\"\\nUnsafe counter without synchronized:\");,        UnsafeCounter unsafe = new UnsafeCounter();,        executor = Executors.newFixedThreadPool(5);,,        for (int i = 0; i < 10; i++) {,            executor.execute(() -> {,                for (int j = 0; j < 100; j++) {,                    unsafe.increment();,                },            });,        },        executor.shutdown();,        executor.awaitTermination(5, TimeUnit.SECONDS);,        System.out.println(\"Final count (unsafe): \" + unsafe.getCount());  // Usually <1000,    },}"
                  }
        ],
        tips: [
                  "synchronized methods lock the entire object; consider finer-grained locking",
                  "synchronized blocks are more efficient when you only need to protect specific code",
                  "Every Java object has a built-in lock/monitor"
        ],
        mistake: "Synchronizing too broadly (entire method) when only a small section needs locking.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class ThreadClassExample {\n    static class PrintTask\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "reentrant-lock",
        fn: "ReentrantLock",
        desc: "Explicit locking with more control than synchronized.",
        category: "Synchronization",
        subtitle: "Explicit locking mechanism",
        signature: "lock.lock() and lock.unlock() or try-finally",
        descLong: "ReentrantLock provides explicit control over locking with features like tryLock(), timed locks, and fair queuing. More flexible than synchronized keyword.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ReentrantLock — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.locks.ReentrantLock;\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class ReentrantLockExample {\n    static class SafeCounter {\n        private int count = 0;\n        private final ReentrantLock lock = new ReentrantLock();\n\n        void increment() {\n            lock.lock();\n            try {\n                count++;\n            } finally {\n                lock.unlock();\n            }\n        }\n\n        int getCount() {\n            lock.lock();\n            try {\n                return count;\n            } finally {\n                lock.unlock();\n            }\n        }\n\n        boolean tryIncrement() {\n            if (lock.tryLock()) {\n                try {\n                    count++;\n                    return true;\n                } finally {\n                    lock.unlock();\n                }\n            }\n            return false;\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        SafeCounter counter = new SafeCounter();\n        ExecutorService executor = Executors.newFixedThreadPool(5);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ReentrantLock — common patterns you'll see in production.\n// APPROACH  - Combine ReentrantLock with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Regular locking\n        System.out.println(\"Locking and incrementing:\");\n        for (int i = 0; i < 10; i++) {\n            executor.execute(() -> {\n                for (int j = 0; j < 100; j++) {\n                    counter.increment();\n                }\n            });\n        }\n        executor.shutdown();\n        executor.awaitTermination(5, TimeUnit.SECONDS);\n        System.out.println(\"Count: \" + counter.getCount());  // 1000"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ReentrantLock — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Try lock (non-blocking),        System.out.println(\"\\nTry lock (non-blocking):\");,        if (counter.tryIncrement()) {,            System.out.println(\"Lock acquired, count: \" + counter.getCount());,        } else {,            System.out.println(\"Could not acquire lock\");,        },    },}"
                  }
        ],
        tips: [
                  "Always use try-finally with lock to ensure unlock even on exception",
                  "tryLock() is useful for avoiding deadlocks",
                  "ReentrantLock is more flexible than synchronized but slightly slower"
        ],
        mistake: "Forgetting to unlock in finally block (lock leakage).",
        shorthand: {
          verbose: "import java.util.concurrent.locks.ReentrantLock;\nimport java.util.concurrent.ExecutorService;\nimport",
          concise: "// see verbose",
        },
      },
      {
        id: "atomic-variables",
        fn: "Atomic Variables",
        desc: "Thread-safe operations on single variables without explicit locking.",
        category: "Synchronization",
        subtitle: "Lock-free synchronization",
        signature: "AtomicInteger, AtomicBoolean, AtomicReference, etc.",
        descLong: "Atomic classes provide lock-free thread-safe operations using CAS (Compare-And-Swap). Faster than locks for simple operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Atomic Variables — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.atomic.AtomicInteger;\nimport java.util.concurrent.atomic.AtomicBoolean;\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class AtomicVariablesExample {\n    static class Counter {\n        private AtomicInteger count = new AtomicInteger(0);\n\n        void increment() {\n            count.incrementAndGet();\n        }\n\n        int getCount() {\n            return count.get();\n        }\n\n        void add(int value) {\n            count.addAndGet(value);\n        }\n\n        boolean compareAndSet(int expect, int update) {\n            return count.compareAndSet(expect, update);\n        }\n    }\n\n    static class Flag {\n        private AtomicBoolean running = new AtomicBoolean(true);\n\n        void stop() {\n            running.set(false);\n        }\n\n        boolean isRunning() {\n            return running.get();\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        // AtomicInteger counter\n        System.out.println(\"AtomicInteger counter:\");\n        Counter counter = new Counter();\n        ExecutorService executor = Executors.newFixedThreadPool(5);\n\n        for (int i = 0; i < 10; i++) {\n            executor.execute(() -> {\n                for (int j = 0; j < 100; j++) {\n                    counter.increment();\n                }\n            });\n        }\n        executor.shutdown();\n        executor.awaitTermination(5, TimeUnit.SECONDS);\n        System.out.println(\"Final count: \" + counter.getCount());  // 1000"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Atomic Variables — common patterns you'll see in production.\n// APPROACH  - Combine Atomic Variables with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// AtomicBoolean flag\n        System.out.println(\"\\nAtomicBoolean flag:\");\n        Flag flag = new Flag();\n        System.out.println(\"Running: \" + flag.isRunning());\n        flag.stop();\n        System.out.println(\"Running after stop: \" + flag.isRunning());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Atomic Variables — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Compare and set,        System.out.println(\"\\nCompare and set:\");,        var atomic = new AtomicInteger(10);,        System.out.println(\"Current: \" + atomic.get());,        boolean success = atomic.compareAndSet(10, 20);,        System.out.println(\"CAS 10->20: \" + success + \", value: \" + atomic.get());,    },}"
                  }
        ],
        tips: [
                  "Use atomic variables for simple counters and flags instead of locks",
                  "Atomic operations are faster than explicit locking for single variables",
                  "compareAndSet() is useful for implementing lock-free patterns"
        ],
        mistake: "Using locks for simple operations when atomics would be more efficient.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.concurrent.atomic.AtomicInteger;\nimport java.util.concurrent.atomic.AtomicBoolean;\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "concurrent-hashmap",
        fn: "ConcurrentHashMap",
        desc: "Thread-safe map with fine-grained locking (segment-based).",
        category: "Synchronization",
        subtitle: "Concurrent collections",
        signature: "new ConcurrentHashMap<K, V>()",
        descLong: "ConcurrentHashMap allows concurrent reads and writes using segment-based locking. Much better performance than synchronized HashMap in multi-threaded scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ConcurrentHashMap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ConcurrentHashMap;\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\nimport java.util.concurrent.TimeUnit;\nimport java.util.stream.*;\n\npublic class ConcurrentHashMapExample {\n    public static void main(String[] args) throws InterruptedException {\n        ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ConcurrentHashMap — common patterns you'll see in production.\n// APPROACH  - Combine ConcurrentHashMap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple threads writing to map\n        ExecutorService executor = Executors.newFixedThreadPool(3);\n\n        System.out.println(\"Writing to ConcurrentHashMap:\");\n        for (int i = 0; i < 3; i++) {\n            final int threadId = i;\n            executor.execute(() -> {\n                for (int j = 0; j < 5; j++) {\n                    String key = \"Thread-\" + threadId + \"-Item-\" + j;\n                    map.put(key, j);\n                    System.out.println(\"Put: \" + key);\n                }\n            });\n        }\n\n        executor.shutdown();\n        executor.awaitTermination(5, TimeUnit.SECONDS);\n\n        System.out.println(\"\\nFinal map size: \" + map.size());\n        System.out.println(\"Sample entries: \");\n        map.entrySet().stream()\n            .limit(3)\n            .forEach(e -> System.out.println(\"  \" + e.getKey() + \" = \" + e.getValue()));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ConcurrentHashMap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Atomic operations,        System.out.println(\"\\nAtomic operations:\");,        map.putIfAbsent(\"Counter\", 0);,        map.computeIfPresent(\"Counter\", (k, v) -> v + 1);,        map.compute(\"NewKey\", (k, v) -> (v == null) ? 1 : v + 1);,        System.out.println(\"Counter: \" + map.get(\"Counter\"));,        System.out.println(\"NewKey: \" + map.get(\"NewKey\"));,    },}"
                  }
        ],
        tips: [
                  "Use ConcurrentHashMap instead of Collections.synchronizedMap()",
                  "Multiple threads can access different segments simultaneously",
                  "Iteration is weakly consistent (may reflect changes during iteration)"
        ],
        mistake: "Using synchronized HashMap in multi-threaded code (poor performance).",
        shorthand: {
          verbose: "import java.util.concurrent.ConcurrentHashMap;\nimport java.util.concurrent.ExecutorService;\nimport j",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: CompletableFuture ─────────────────────────────────────────
  {
    id: "completablefuture",
    title: "CompletableFuture",
    entries: [
      {
        id: "completablefuture-create",
        fn: "Creating CompletableFuture",
        desc: "Create and manage asynchronous computations with results.",
        category: "Async",
        subtitle: "Future building blocks",
        signature: "CompletableFuture.supplyAsync() or new CompletableFuture<>()",
        descLong: "CompletableFuture makes it easy to write asynchronous, non-blocking code. Can be created via supplyAsync(), runAsync(), or manually completed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Creating CompletableFuture — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.CompletableFuture;\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class CompletableFutureCreateExample {\n    static class DataService {\n        int fetchData(String id) throws InterruptedException {\n            System.out.println(\"Fetching data for: \" + id);\n            Thread.sleep(500);\n            return Integer.parseInt(id) * 100;\n        }\n    }\n\n    public static void main(String[] args) throws Exception {\n        DataService service = new DataService();\n        ExecutorService executor = Executors.newFixedThreadPool(2);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Creating CompletableFuture — common patterns you'll see in production.\n// APPROACH  - Combine Creating CompletableFuture with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// supplyAsync - returns a result\n        System.out.println(\"Using supplyAsync:\");\n        CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(\n            () -> {\n                try {\n                    return service.fetchData(\"5\");\n                } catch (InterruptedException e) {\n                    throw new RuntimeException(e);\n                }\n            }\n        );\n        System.out.println(\"Result: \" + future1.get());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Creating CompletableFuture — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// runAsync - no return value,        System.out.println(\"\\nUsing runAsync:\");,        CompletableFuture<Void> future2 = CompletableFuture.runAsync(,            () -> System.out.println(\"Running async task\"),        );,        future2.get();,\n\n        // Manual completion,        System.out.println(\"\\nManual completion:\");,        CompletableFuture<String> future3 = new CompletableFuture<>();,        executor.execute(() -> {,            try {,                Thread.sleep(500);,                future3.complete(\"Task completed!\");,            } catch (InterruptedException e) {,                future3.completeExceptionally(e);,            },        });,        System.out.println(\"Result: \" + future3.get());,,        executor.shutdown();,    },}"
                  }
        ],
        tips: [
                  "supplyAsync() for async computations that return a result",
                  "runAsync() for async tasks that don't return anything",
                  "Manually complete futures for external event handling"
        ],
        mistake: "Blocking on get() when you should chain operations with thenApply().",
        shorthand: {
          verbose: "import java.util.concurrent.CompletableFuture;\nimport java.util.concurrent.ExecutorService;\nimport j",
          concise: "// see verbose",
        },
      },
      {
        id: "completablefuture-chain",
        fn: "Chaining CompletableFuture Operations",
        desc: "Chain async operations without blocking using thenApply, thenAccept, etc.",
        category: "Async",
        subtitle: "Async chaining and composition",
        signature: ".thenApply(), .thenAccept(), .thenRun()",
        descLong: "Chain operations on futures to avoid blocking. thenApply() transforms, thenAccept() consumes, thenRun() just runs. Creates non-blocking pipelines.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Chaining CompletableFuture Operations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureChainingExample {\n    public static void main(String[] args) throws Exception {\n        // thenApply - transform result\n        System.out.println(\"thenApply (transformation):\");\n        CompletableFuture<Integer> future1 = CompletableFuture.supplyAsync(() -> {\n            System.out.println(\"Fetching number...\");\n            return 10;\n        }).thenApply(n -> {\n            System.out.println(\"Doubling: \" + n);\n            return n * 2;\n        }).thenApply(n -> {\n            System.out.println(\"Adding 5: \" + n);\n            return n + 5;\n        });\n        System.out.println(\"Final result: \" + future1.get());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Chaining CompletableFuture Operations — common patterns you'll see in production.\n// APPROACH  - Combine Chaining CompletableFuture Operations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// thenAccept - consume result without transformation\n        System.out.println(\"\\nthenAccept (consumption):\");\n        CompletableFuture.supplyAsync(() -> \"Hello CompletableFuture\")\n            .thenAccept(msg -> System.out.println(\"Received: \" + msg));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Chaining CompletableFuture Operations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// thenRun - run after completion (no result),        System.out.println(\"\\nthenRun (notification):\");,        CompletableFuture.supplyAsync(() -> 42),            .thenRun(() -> System.out.println(\"Async operation completed!\")),            .get();,\n\n        // Chaining multiple async calls,        System.out.println(\"\\nChaining multiple async calls:\");,        CompletableFuture.supplyAsync(() -> {,            System.out.println(\"Step 1: Fetch data\");,            return 10;,        }).thenApplyAsync(n -> {,            System.out.println(\"Step 2: Process data\");,            return n * 2;,        }).thenApplyAsync(n -> {,            System.out.println(\"Step 3: Validate result\");,            return n;,        }).thenAccept(result -> System.out.println(\"Final: \" + result)),         .get();,    },}"
                  }
        ],
        tips: [
                  "Use thenApply() to transform results in a non-blocking way",
                  "Chain operations to avoid nested callbacks and blocking get() calls",
                  "thenApplyAsync() runs the next operation on a different thread"
        ],
        mistake: "Calling get() in the middle of a chain instead of chaining all operations.",
        shorthand: {
          verbose: "import java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureChainingExample {\n    ",
          concise: "// see verbose",
        },
      },
      {
        id: "completablefuture-compose",
        fn: "CompletableFuture Composition",
        desc: "Compose multiple async operations using thenCompose and combine.",
        category: "Async",
        subtitle: "Advanced async composition",
        signature: ".thenCompose(), .allOf(), .anyOf()",
        descLong: "Compose multiple futures: thenCompose() chains dependent async operations, allOf() waits for all, anyOf() returns first completed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CompletableFuture Composition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureComposeExample {\n    static CompletableFuture<String> fetchUser(int id) {\n        return CompletableFuture.supplyAsync(() -> {\n            System.out.println(\"Fetching user \" + id);\n            return \"User-\" + id;\n        });\n    }\n\n    static CompletableFuture<String> fetchUserData(String user) {\n        return CompletableFuture.supplyAsync(() -> {\n            System.out.println(\"Fetching data for \" + user);\n            return user + \"-Data\";\n        });\n    }\n\n    public static void main(String[] args) throws Exception {\n        // thenCompose - chain dependent async operations\n        System.out.println(\"thenCompose (dependent operations):\");\n        CompletableFuture<String> result = fetchUser(1)\n            .thenCompose(CompletableFutureComposeExample::fetchUserData);\n        System.out.println(\"Result: \" + result.get());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CompletableFuture Composition — common patterns you'll see in production.\n// APPROACH  - Combine CompletableFuture Composition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// allOf - wait for multiple futures\n        System.out.println(\"\\nallOf (all operations):\");\n        CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> \"A\");\n        CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> \"B\");\n        CompletableFuture<String> f3 = CompletableFuture.supplyAsync(() -> \"C\");\n\n        CompletableFuture.allOf(f1, f2, f3)\n            .thenRun(() -> System.out.println(\"All futures: \" + f1.join() + f2.join() + f3.join()))\n            .get();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CompletableFuture Composition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// anyOf - wait for first to complete,        System.out.println(\"\\nanyOf (any operation):\");,        CompletableFuture<String> slow = CompletableFuture.supplyAsync(() -> {,            try {,                Thread.sleep(1000);,                return \"Slow result\";,            } catch (InterruptedException e) {,                return null;,            },        });,        CompletableFuture<String> fast = CompletableFuture.supplyAsync(() -> \"Fast result\");,,        CompletableFuture.anyOf(slow, fast),            .thenAccept(result2 -> System.out.println(\"First result: \" + result2)),            .get();,    },}"
                  }
        ],
        tips: [
                  "thenCompose() for chaining dependent async operations",
                  "allOf() waits for all futures; useful for parallel tasks",
                  "anyOf() returns when first completes; useful for race conditions"
        ],
        mistake: "Using thenApply() instead of thenCompose() when mapping to a CompletableFuture.",
        shorthand: {
          verbose: "import java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureComposeExample {\n    s",
          concise: "// see verbose",
        },
      },
      {
        id: "completablefuture-handle",
        fn: "Exception Handling in CompletableFuture",
        desc: "Handle exceptions in async chains using handle() and exceptionally().",
        category: "Async",
        subtitle: "Error management",
        signature: ".handle(result, exception) or .exceptionally(exception)",
        descLong: "Manage exceptions in async chains without blocking. handle() gets both result and exception. exceptionally() recovers from exceptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Exception Handling in CompletableFuture — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureExceptionExample {\n    static CompletableFuture<Integer> risky(boolean shouldFail) {\n        return CompletableFuture.supplyAsync(() -> {\n            if (shouldFail) {\n                throw new RuntimeException(\"Operation failed!\");\n            }\n            return 42;\n        });\n    }\n\n    public static void main(String[] args) throws Exception {\n        // handle() - deals with both success and exception\n        System.out.println(\"handle() method:\");\n        CompletableFuture<String> future1 = risky(true)\n            .handle((result, exception) -> {\n                if (exception != null) {\n                    System.out.println(\"Error: \" + exception.getMessage());\n                    return \"Default: 0\";\n                } else {\n                    return \"Success: \" + result;\n                }\n            });\n        System.out.println(\"Result: \" + future1.get());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Exception Handling in CompletableFuture — common patterns you'll see in production.\n// APPROACH  - Combine Exception Handling in CompletableFuture with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// exceptionally() - only handles exceptions\n        System.out.println(\"\\nexceptionally() method:\");\n        CompletableFuture<Integer> future2 = risky(true)\n            .exceptionally(exception -> {\n                System.out.println(\"Caught exception: \" + exception.getMessage());\n                return 99;  // Default value\n            });\n        System.out.println(\"Result: \" + future2.get());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Exception Handling in CompletableFuture — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Chaining with error recovery,        System.out.println(\"\\nChaining with recovery:\");,        CompletableFuture<String> future3 = risky(false),            .thenApply(n -> \"Value: \" + n),            .exceptionally(e -> \"Error recovered: \" + e.getMessage());,        System.out.println(\"Result: \" + future3.get());,\n\n        // whenComplete - runs regardless of result,        System.out.println(\"\\nwhenComplete() (always runs):\");,        risky(true),            .whenComplete((result, exception) -> {,                if (exception != null) {,                    System.out.println(\"Cleanup after error\");,                } else {,                    System.out.println(\"Cleanup after success\");,                },            }).get();,    },}"
                  }
        ],
        tips: [
                  "handle() for processing both successful results and exceptions",
                  "exceptionally() for recovery and default values on failure",
                  "whenComplete() for guaranteed cleanup operations"
        ],
        mistake: "Not handling exceptions in async chains (silently fails).",
        shorthand: {
          verbose: "import java.util.concurrent.CompletableFuture;\n\npublic class CompletableFutureExceptionExample {\n   ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 5: Virtual Threads (Java 21+) ─────────────────────────────────────────
  {
    id: "virtual-threads",
    title: "Virtual Threads (Java 21+)",
    entries: [
      {
        id: "virtual-threads-intro",
        fn: "Virtual Threads Basics",
        desc: "Create lightweight virtual threads for highly scalable concurrent applications.",
        category: "Virtual Threads",
        subtitle: "Lightweight concurrency",
        signature: "Thread.ofVirtual().start() or Thread.startVirtualThread()",
        descLong: "Virtual threads (Project Loom) are lightweight threads managed by the JVM, enabling millions of concurrent tasks. Each maps to OS threads on demand.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Virtual Threads Basics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class VirtualThreadsExample {\n    static void simulateWork(String name, int duration) {\n        try {\n            System.out.println(\"Task \" + name + \" started on \" + Thread.currentThread());\n            Thread.sleep(duration);\n            System.out.println(\"Task \" + name + \" completed\");\n        } catch (InterruptedException e) {\n            System.out.println(\"Task \" + name + \" interrupted\");\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        System.out.println(\"Virtual Threads Example:\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Virtual Threads Basics — common patterns you'll see in production.\n// APPROACH  - Combine Virtual Threads Basics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Create virtual thread with ofVirtual()\n        Thread vt1 = Thread.ofVirtual()\n            .name(\"VirtualTask-1\")\n            .start(() -> simulateWork(\"1\", 500));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Virtual Threads Basics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Using startVirtualThread(),        Thread vt2 = Thread.startVirtualThread(() -> simulateWork(\"2\", 500));,\n\n        // Create many virtual threads efficiently,        System.out.println(\"\\nCreating 10 virtual threads:\");,        var threads = new ArrayList<Thread>();,        for (int i = 0; i < 10; i++) {,            final int id = i;,            Thread vt = Thread.ofVirtual(),                .name(\"Task-\" + id),                .start(() -> simulateWork(String.valueOf(id), 200));,            threads.add(vt);,        },\n\n        // Wait for all to complete,        for (Thread t : threads) {,            t.join();,        },,        System.out.println(\"\\nAll tasks completed\");,    },}"
                  }
        ],
        tips: [
                  "Virtual threads are much cheaper to create than platform threads",
                  "Can create millions of virtual threads without overwhelming system",
                  "Code looks similar to regular threads but scales much better"
        ],
        mistake: "Trying to use virtual threads on Java versions < 21.",
        shorthand: {
          verbose: "import java.util.*;\n\npublic class VirtualThreadsExample {\n    static void simulateWork(String name, ",
          concise: "// see verbose",
        },
      },
      {
        id: "virtual-threads-executors",
        fn: "Virtual Threads with Executors",
        desc: "Use virtual thread executors for scalable async processing.",
        category: "Virtual Threads",
        subtitle: "Virtual thread pools",
        signature: "Executors.newVirtualThreadPerTaskExecutor()",
        descLong: "ExecutorService with virtual threads (one thread per task) enables millions of concurrent operations. Perfect for I/O-bound workloads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Virtual Threads with Executors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class VirtualThreadExecutorsExample {\n    static void processTask(int id) {\n        try {\n            System.out.println(\"Processing task \" + id + \" on \" + Thread.currentThread().getName());\n            Thread.sleep(100);  // Simulate I/O\n            System.out.println(\"Task \" + id + \" done\");\n        } catch (InterruptedException e) {\n            System.out.println(\"Task \" + id + \" interrupted\");\n        }\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        // Virtual thread per task executor\n        ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();\n\n        System.out.println(\"Submitting 100 tasks with virtual threads:\");\n        long start = System.currentTimeMillis();\n\n        for (int i = 0; i < 100; i++) {\n            final int taskId = i;\n            executor.submit(() -> processTask(taskId));\n        }\n\n        executor.shutdown();\n        if (executor.awaitTermination(30, TimeUnit.SECONDS)) {\n            long elapsed = System.currentTimeMillis() - start;\n            System.out.println(\"All tasks completed in \" + elapsed + \"ms\");\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Virtual Threads with Executors — common patterns you'll see in production.\n// APPROACH  - Combine Virtual Threads with Executors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Compare with platform threads\n        System.out.println(\"\\nWith platform thread pool:\");\n        executor = Executors.newFixedThreadPool(10);  // Only 10 threads\n        start = System.currentTimeMillis();\n\n        for (int i = 0; i < 100; i++) {\n            final int taskId = i;\n            executor.submit(() -> processTask(taskId));\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Virtual Threads with Executors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nexecutor.shutdown();\n        if (executor.awaitTermination(30, TimeUnit.SECONDS)) {\n            long elapsed = System.currentTimeMillis() - start;\n            System.out.println(\"All tasks completed in \" + elapsed + \"ms\");\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "newVirtualThreadPerTaskExecutor() creates a thread per submitted task",
                  "Dramatically improves throughput for I/O-bound applications",
                  "Virtual threads make it easier to write clean sequential code instead of callbacks"
        ],
        mistake: "Using fixed thread pool when virtual thread executor would be more efficient.",
        shorthand: {
          verbose: "import java.util.concurrent.ExecutorService;\nimport java.util.concurrent.Executors;\n\npublic class Vi",
          concise: "// see verbose",
        },
      },
      {
        id: "structured-concurrency",
        fn: "Structured Concurrency (Preview)",
        desc: "Manage lifetimes of multiple concurrent tasks as a single unit.",
        category: "Virtual Threads",
        subtitle: "Task lifecycle management",
        signature: "StructuredTaskScope (Java 21, preview)",
        descLong: "Structured concurrency groups concurrent tasks under a scope, ensuring all tasks complete and resources are cleaned up. Essential pattern for virtual threads.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Structured Concurrency (Preview) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class StructuredConcurrencyExample {\n    static String fetchData(String url) throws InterruptedException {\n        System.out.println(\"Fetching from \" + url);\n        Thread.sleep(500);\n        return \"Data from \" + url;\n    }\n\n    public static void main(String[] args) throws InterruptedException {\n        System.out.println(\"Structured Concurrency Pattern:\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Structured Concurrency (Preview) — common patterns you'll see in production.\n// APPROACH  - Combine Structured Concurrency (Preview) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Manual virtual thread management\n        System.out.println(\"\\nManual approach with virtual threads:\");\n        Thread t1 = Thread.startVirtualThread(() -> {\n            try {\n                String result = fetchData(\"URL-1\");\n                System.out.println(\"Result: \" + result);\n            } catch (InterruptedException e) {\n                System.out.println(\"Task interrupted\");\n            }\n        });\n\n        Thread t2 = Thread.startVirtualThread(() -> {\n            try {\n                String result = fetchData(\"URL-2\");\n                System.out.println(\"Result: \" + result);\n            } catch (InterruptedException e) {\n                System.out.println(\"Task interrupted\");\n            }\n        });\n\n        t1.join();\n        t2.join();\n        System.out.println(\"All tasks completed\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Structured Concurrency (Preview) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Note: Actual StructuredTaskScope requires --enable-preview flag,        // This is a preview feature in Java 21,        System.out.println(\"\\nStructuredTaskScope would provide:\");,        System.out.println(\"- Automatic management of task lifetimes\");,        System.out.println(\"- Timeout for all tasks as a group\");,        System.out.println(\"- Automatic cancellation on failure\");,        System.out.println(\"- Structured resource cleanup\");,    },}"
                  }
        ],
        tips: [
                  "Structured concurrency ensures all spawned tasks complete before parent continues",
                  "Simplifies error handling for concurrent operations",
                  "Prevents resource leaks from abandoned tasks"
        ],
        mistake: "Not waiting for virtual threads to complete (tasks run in background).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class StructuredConcurrencyExample {\n    static String fetchData(String url) throws Interrupt\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
