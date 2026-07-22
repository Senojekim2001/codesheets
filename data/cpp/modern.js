export const meta = {
  "id": "modern",
  "label": "Modern C++ (17/20/23)",
  "icon": "⚡",
  "description": "Move semantics, RAII, lambdas, concurrency, and cutting-edge C++20/23 features."
}

export const sections = [

  // ── Section 1: Move Semantics & RAII ─────────────────────────────────────────
  {
    id: "move-raii",
    title: "Move Semantics & RAII",
    entries: [
      {
        id: "move-constructors",
        fn: "Move Constructors & Assignments",
        desc: "Transfer ownership instead of copying (C++11).",
        category: "Move Semantics & RAII",
        subtitle: "Move semantics",
        signature: "Class(Class&& other) noexcept : member(std::move(other.member)) { }",
        descLong: "Move constructors and assignments transfer ownership from rvalue references (temporaries or std::move). Enable efficient transfer of large resources (memory, file handles). Mark as noexcept to allow vector reallocation via move. Implement both or use default if automatic move is sufficient.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Move Constructors & Assignments — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <utility>\n#include <vector>\n\nclass StringBuffer {\npublic:\n    StringBuffer(size_t size) : data(new char[size]), size_(size) {\n        std::cout << \"Constructed\\n\";\n    }\n\n    ~StringBuffer() {\n        delete[] data;\n        std::cout << \"Destructed\\n\";\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Move Constructors & Assignments — common patterns you'll see in production.\n// APPROACH  - Combine Move Constructors & Assignments with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Move constructor\n    StringBuffer(StringBuffer&& other) noexcept\n        : data(other.data), size_(other.size_) {\n        other.data = nullptr;\n        other.size_ = 0;\n        std::cout << \"Moved\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Move Constructors & Assignments — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Move assignment,    StringBuffer& operator=(StringBuffer&& other) noexcept {,        if (this != &other) {,            delete[] data;,            data = other.data;,            size_ = other.size_;,            other.data = nullptr;,            other.size_ = 0;,        },        return *this;,    },\n\n    // Delete copy ops to enforce move-only semantics,    StringBuffer(const StringBuffer&) = delete;,    StringBuffer& operator=(const StringBuffer&) = delete;,,private:,    char* data = nullptr;,    size_t size_ = 0;,};,,int main() {,    {,        StringBuffer b1(100);,        StringBuffer b2 = std::move(b1);  // move constructor,        // b1 is now empty,    },,    std::vector<StringBuffer> buffers;,    buffers.push_back(StringBuffer(200));  // move, not copy,,    return 0;,}"
                  }
        ],
        tips: [
                  "Mark move constructors/assignments as noexcept so containers can use move during reallocation.",
                  "Use std::move() to cast lvalues to rvalues when transferring ownership is intended.",
                  "Delete copy operations (= delete) to enforce move-only semantics for resource-owning classes."
        ],
        mistake: "Forgetting noexcept on move constructors; prevents move semantics in containers.",
        shorthand: {
          verbose: "#include <iostream>\n#include <utility>\n#include <vector>\n\ncl",
          concise: "// see verbose",
        },
      },
      {
        id: "perfect-forwarding",
        fn: "Perfect Forwarding",
        desc: "Preserve lvalue/rvalue-ness in template functions (C++11).",
        category: "Move Semantics & RAII",
        subtitle: "Template argument forwarding",
        signature: "template<typename T> void func(T&& t) { process(std::forward<T>(t)); }",
        descLong: "Perfect forwarding allows template functions to pass arguments with preserved lvalue/rvalue nature. Use T&& (universal reference) combined with std::forward<T>() to achieve this. Critical for wrapper functions, factories, and decorators that must not lose move semantics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Perfect Forwarding — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <utility>\n#include <memory>\n\nclass Resource {\npublic:\n    Resource(int id) : id_(id) { std::cout << \"Resource \" << id_ << \" created\\n\"; }\n    ~Resource() { std::cout << \"Resource \" << id_ << \" destroyed\\n\"; }\n    int id() const { return id_; }\nprivate:\n    int id_;\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Perfect Forwarding — common patterns you'll see in production.\n// APPROACH  - Combine Perfect Forwarding with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Factory function with perfect forwarding\ntemplate<typename T, typename... Args>\nstd::unique_ptr<T> make_resource(Args&&... args) {\n    std::cout << \"Creating resource...\\n\";\n    return std::make_unique<T>(std::forward<Args>(args)...);\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Perfect Forwarding — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Wrapper function with perfect forwarding,template<typename Func, typename... Args>,auto call_with_logging(Func&& f, Args&&... args) {,    std::cout << \"Before call\\n\";,    auto result = f(std::forward<Args>(args)...);,    std::cout << \"After call\\n\";,    return result;,},,int add(int a, int b) { return a + b; },,int main() {,    // Perfect forwarding preserves temporaries,    auto res = make_resource<Resource>(42);,    std::cout << \"Resource ID: \" << res->id() << \"\\n\";,\n\n    // Wrapper preserves function semantics,    auto result = call_with_logging(add, 5, 3);,    std::cout << \"Result: \" << result << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use T&& in template functions for universal references (not rvalue references).",
                  "Always use std::forward<T>(t) to preserve lvalue/rvalue-ness.",
                  "Perfect forwarding is essential for factory functions and decorator patterns."
        ],
        mistake: "Using T& or const T& in templates instead of T&&; loses move semantics.",
        shorthand: {
          verbose: "#include <iostream>\n#include <utility>\n#include <vector>\n\ncl",
          concise: "// see verbose",
        },
      },
      {
        id: "raii-pattern",
        fn: "RAII (Resource Acquisition Is Initialization)",
        desc: "Tie resource lifetime to object lifetime.",
        category: "Move Semantics & RAII",
        subtitle: "Resource management pattern",
        signature: "Constructor acquires resource; destructor releases it.",
        descLong: "RAII binds resource allocation (files, memory, locks) to object construction and deallocation to destruction. Ensures cleanup even if exceptions occur. Smart pointers (unique_ptr, shared_ptr) and std::lock_guard are RAII examples. Fundamental to exception-safe C++.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RAII (Resource Acquisition Is Initialization) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <fstream>\n#include <mutex>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RAII (Resource Acquisition Is Initialization) — common patterns you'll see in production.\n// APPROACH  - Combine RAII (Resource Acquisition Is Initialization) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// RAII file wrapper\nclass FileHandle {\npublic:\n    explicit FileHandle(const std::string& filename) {\n        file_.open(filename);\n        if (!file_.is_open()) {\n            throw std::runtime_error(\"Cannot open file\");\n        }\n        std::cout << \"File opened: \" << filename << \"\\n\";\n    }\n\n    ~FileHandle() {\n        if (file_.is_open()) {\n            file_.close();\n            std::cout << \"File closed\\n\";\n        }\n    }\n\n    void write(const std::string& data) {\n        file_ << data;\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RAII (Resource Acquisition Is Initialization) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Delete copy, allow move,    FileHandle(const FileHandle&) = delete;,    FileHandle& operator=(const FileHandle&) = delete;,    FileHandle(FileHandle&&) = default;,    FileHandle& operator=(FileHandle&&) = default;,,private:,    std::ofstream file_;,};,\n\n// RAII lock guard,std::mutex global_mutex;,,void critical_section() {,    std::lock_guard<std::mutex> lock(global_mutex);,    std::cout << \"Inside critical section\\n\";,    // Lock is automatically released when lock goes out of scope,},,int main() {,    // RAII: file is opened here,    {,        FileHandle file(\"output.txt\");,        file.write(\"Hello, RAII!\\n\");,        // File is closed here (destructor called),    },\n\n    // Smart pointers are RAII,    {,        auto ptr = std::make_unique<int>(42);,        std::cout << \"Value: \" << *ptr << \"\\n\";,        // Memory is freed here,    },\n\n    // RAII with locks,    critical_section();,    // Lock is released here,,    std::cout << \"All resources cleaned up\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Use RAII to ensure resources are cleaned up, even during exceptions.",
                  "Smart pointers (unique_ptr, shared_ptr) are RAII implementations for memory.",
                  "Use std::lock_guard for automatic lock management."
        ],
        mistake: "Manual resource management (new/delete, open/close) instead of RAII classes.",
        shorthand: {
          verbose: "#include <iostream>\n#include <fstream>\n#include <mutex>\n#include <memory>\n\n// RAII file wrapper\nclas",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Lambdas & Functional ─────────────────────────────────────────
  {
    id: "lambdas-functional",
    title: "Lambdas & Functional",
    entries: [
      {
        id: "lambda-captures",
        fn: "Lambda Captures",
        desc: "Control how lambdas capture variables from outer scope.",
        category: "Lambdas & Functional",
        subtitle: "Variable capture semantics",
        signature: "[=] captures by value; [&] by reference; [this] captures *this",
        descLong: "Capture clause controls variable access. [=] captures all by value (safe for temporaries); [&] by reference (risk of dangling references). Mixed captures: [=, &x] captures all by value except x by reference. [this] or [=] captures object members. Use capture lists carefully to avoid dangling references.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lambda Captures — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <functional>\n\nclass Counter {\npublic:\n    void test_captures() {\n        int local_value = 10;\n        int& local_ref = local_value;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lambda Captures — common patterns you'll see in production.\n// APPROACH  - Combine Lambda Captures with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Capture by value [=]\n        auto by_value = [=]() {\n            // std::cout << local_value << \"\\n\";  // 10\n            // Cannot modify local_value here\n        };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lambda Captures — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Capture by reference [&],        auto by_ref = [&]() {,            std::cout << \"By ref: \" << local_value << \"\\n\";,            // local_value = 20;  // modifies original (WARNING: dangerous!),        };,\n\n        // Mixed capture: all by value except x by reference,        int x = 5;,        auto mixed = [=, &x]() {,            std::cout << \"Mixed: local=\" << local_value << \", x=\" << x << \"\\n\";,            x = 100;  // modifies x (careful!),        };,\n\n        // Capture this to access member variables,        auto access_member = [this]() {,            std::cout << \"Member: \" << member_ << \"\\n\";,        };,,        by_ref();,        mixed();,        access_member();,,        std::cout << \"x is now: \" << x << \"\\n\";  // 100,    },,    void lambda_in_algorithm() {,        std::vector<int> nums{1, 2, 3, 4, 5};,        int multiplier = 10;,        int sum = 0;,\n\n        // Capture by value (read-only),        std::vector<int> doubled;,        std::transform(nums.begin(), nums.end(),,                       std::back_inserter(doubled),,                       [multiplier](int x) { return x * multiplier; });,\n\n        // Capture by reference to modify outer variable,        std::for_each(nums.begin(), nums.end(),,                      [&sum](int x) { sum += x; });,        std::cout << \"Sum: \" << sum << \"\\n\";,    },,private:,    int member_ = 42;,};,,int main() {,    Counter c;,    c.test_captures();,    c.lambda_in_algorithm();,    return 0;,}"
                  }
        ],
        tips: [
                  "Use [=] for safe, copy-based capture of temporaries.",
                  "Use [&] carefully; ensure captured references outlive the lambda.",
                  "Prefer explicit capture lists over [=] or [&] for clarity."
        ],
        mistake: "Capturing by reference [&] when the lambda outlives the scope of captured variables.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <functional>\n\nclass Counter {\npu",
          concise: "// see verbose",
        },
      },
      {
        id: "stdfunction-bind",
        fn: "std::function & std::bind",
        desc: "Type-erased function wrappers and function binding.",
        category: "Lambdas & Functional",
        subtitle: "Function objects and binding",
        signature: "std::function<void(int)> f = func;  |  std::bind(func, arg1, std::placeholders::_1)",
        descLong: "std::function wraps any callable (function pointers, functors, lambdas) with a common type. std::bind creates a function object with some arguments pre-filled using placeholders. Useful for callbacks and partial application. Prefer lambdas for simple cases; std::function for flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::function & std::bind — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <functional>\n#include <vector>\n#include <algorithm>\n\nint multiply(int a, int b) { return a * b; }\n\nclass Calculator {\npublic:\n    int add(int a, int b) { return a + b; }\n    int subtract(int a, int b) { return a - b; }\n};\n\nint main() {\n    // std::function wraps different callable types\n    std::function<int(int, int)> op1 = multiply;\n    std::cout << \"multiply(3, 4) = \" << op1(3, 4) << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::function & std::bind — common patterns you'll see in production.\n// APPROACH  - Combine std::function & std::bind with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wrap a lambda\n    auto subtract_lambda = [](int a, int b) { return a - b; };\n    std::function<int(int, int)> op2 = subtract_lambda;\n    std::cout << \"subtract(10, 3) = \" << op2(10, 3) << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::function & std::bind — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Wrap a member function,    Calculator calc;,    std::function<int(int, int)> op3 =,        std::bind(&Calculator::add, &calc, std::placeholders::_1, std::placeholders::_2);,    std::cout << \"calc.add(5, 6) = \" << op3(5, 6) << \"\\n\";,\n\n    // Partial application: bind first argument,    auto multiply_by_2 = std::bind(multiply, 2, std::placeholders::_1);,    std::cout << \"multiply_by_2(7) = \" << multiply_by_2(7) << \"\\n\";,\n\n    // Use in containers of callbacks,    std::vector<std::function<int(int, int)>> operations;,    operations.push_back(multiply);,    operations.push_back(subtract_lambda);,,    for (size_t i = 0; i < operations.size(); ++i) {,        std::cout << \"Operation \" << i << \": \" << operations[i](10, 3) << \"\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::function for callback containers and flexible function storage.",
                  "Prefer lambdas over std::bind for new code; lambdas are cleaner.",
                  "std::bind is useful for partial application and member function binding."
        ],
        mistake: "Using std::function for performance-critical code; overhead can be significant.",
        shorthand: {
          verbose: "#include <iostream>\n#include <functional>\n#include <vector>\n#include <algorithm>\n\nint multiply(int a",
          concise: "// see verbose",
        },
      },
      {
        id: "generic-lambdas",
        fn: "Generic Lambdas",
        desc: "Lambdas with auto parameters (C++14).",
        category: "Lambdas & Functional",
        subtitle: "Template-like lambdas",
        signature: "auto func = [](auto x, auto y) { return x + y; };",
        descLong: "Generic lambdas use auto for parameters, making them template-like. Compiled for each unique argument type combination. Enables concise generic code without explicit templates. C++14+ feature.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Lambdas — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    // Generic lambda — works with any type supporting operator+\n    auto add = [](auto a, auto b) { return a + b; };\n\n    std::cout << \"5 + 3 = \" << add(5, 3) << \"\\n\";\n    std::cout << \"3.14 + 2.86 = \" << add(3.14, 2.86) << \"\\n\";\n    std::string s = add(std::string(\"hello\"), std::string(\" world\"));\n    std::cout << \"Concat: \" << s << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Lambdas — common patterns you'll see in production.\n// APPROACH  - Combine Generic Lambdas with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Generic lambda with std::vector\n    auto print_container = [](const auto& container) {\n        for (const auto& item : container) {\n            std::cout << item << \" \";\n        }\n        std::cout << \"\\n\";\n    };\n\n    std::vector<int> ints{1, 2, 3};\n    std::vector<std::string> strs{\"a\", \"b\", \"c\"};\n\n    print_container(ints);\n    print_container(strs);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Lambdas — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Generic with multiple parameters,    auto max_value = [](auto a, auto b) { return (a > b) ? a : b; };,    std::cout << \"Max(10, 20) = \" << max_value(10, 20) << \"\\n\";,    std::cout << \"Max('x', 'y') = \" << max_value('x', 'y') << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use generic lambdas for concise template-like code.",
                  "Compiler generates specializations for each unique argument type.",
                  "Prefer generic lambdas over function templates for simple generic functions."
        ],
        mistake: "Expecting generic lambdas to work before C++14.",
        shorthand: {
          verbose: "#include <iostream>\n#include <utility>\n#include <vector>\n\ncl",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Concurrency ─────────────────────────────────────────
  {
    id: "concurrency",
    title: "Concurrency",
    entries: [
      {
        id: "threads-basic",
        fn: "std::thread & Basic Concurrency",
        desc: "Create and manage threads.",
        category: "Concurrency",
        subtitle: "Thread basics",
        signature: "std::thread t(func, args...);  t.join();",
        descLong: "std::thread creates a new thread executing a callable. join() waits for completion; detach() lets thread run independently (careful: must not access main thread state). Pass arguments by value or use std::ref for references. Always join() or detach() before thread destruction.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::thread & Basic Concurrency — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <thread>\n#include <chrono>\n\nvoid worker(int id, const std::string& name) {\n    std::cout << \"Worker \" << id << \" (\" << name << \") started\\n\";\n    std::this_thread::sleep_for(std::chrono::milliseconds(100));\n    std::cout << \"Worker \" << id << \" finished\\n\";\n}\n\nint main() {\n    // Create threads\n    std::thread t1(worker, 1, \"Thread-1\");\n    std::thread t2(worker, 2, \"Thread-2\");\n\n    std::cout << \"Main continues\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::thread & Basic Concurrency — common patterns you'll see in production.\n// APPROACH  - Combine std::thread & Basic Concurrency with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wait for completion\n    t1.join();\n    t2.join();\n\n    std::cout << \"All threads done\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::thread & Basic Concurrency — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Thread with lambda,    std::thread t3([]() {,        std::cout << \"Lambda thread\\n\";,    });,    t3.join();,\n\n    // Thread with reference (pass-by-reference),    int shared = 0;,    std::thread t4([&shared]() {,        shared = 42;,    });,    t4.join();,    std::cout << \"Shared value: \" << shared << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Always join() threads before program exit; detach() is risky.",
                  "Pass data by value to threads unless using synchronization primitives.",
                  "Use std::this_thread::sleep_for() for simple delays."
        ],
        mistake: "Not joining threads; causes undefined behavior or crashes on exit.",
        shorthand: {
          verbose: "#include <iostream>\n#include <thread>\n#include <chrono>\n\nvoid worker(int id, const std::string& name",
          concise: "// see verbose",
        },
      },
      {
        id: "mutex-locks",
        fn: "std::mutex & std::lock_guard",
        desc: "Synchronize access to shared data.",
        category: "Concurrency",
        subtitle: "Mutual exclusion",
        signature: "std::mutex m;  std::lock_guard<std::mutex> lock(m);",
        descLong: "std::mutex prevents simultaneous access to shared data. std::lock_guard acquires lock in constructor, releases in destructor (RAII). std::unique_lock offers more control (manual unlock, try_lock). Always use lock guards; never call lock/unlock manually.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::mutex & std::lock_guard — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <thread>\n#include <mutex>\n#include <chrono>\n\nint counter = 0;\nstd::mutex counter_mutex;\n\nvoid increment_safe(int iterations) {\n    for (int i = 0; i < iterations; ++i) {\n        std::lock_guard<std::mutex> lock(counter_mutex);\n        counter++;\n        // Lock is released here when lock goes out of scope\n    }\n}\n\nvoid increment_unsafe(int iterations) {\n    for (int i = 0; i < iterations; ++i) {\n        counter++;  // RACE CONDITION!\n    }\n}\n\nint main() {\n    // Safe: with mutex\n    counter = 0;\n    std::thread t1(increment_safe, 1000);\n    std::thread t2(increment_safe, 1000);\n    t1.join();\n    t2.join();\n    std::cout << \"Safe counter: \" << counter << \"\\n\";  // 2000"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::mutex & std::lock_guard — common patterns you'll see in production.\n// APPROACH  - Combine std::mutex & std::lock_guard with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Unsafe: without mutex\n    counter = 0;\n    std::thread t3(increment_unsafe, 1000);\n    std::thread t4(increment_unsafe, 1000);\n    t3.join();\n    t4.join();\n    std::cout << \"Unsafe counter: \" << counter << \"\\n\";  // likely < 2000"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::mutex & std::lock_guard — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// unique_lock with try_lock,    std::mutex m;,    std::unique_lock<std::mutex> lock(m, std::defer_lock);  // don't lock yet,    if (lock.try_lock()) {,        std::cout << \"Acquired lock\\n\";,        // use shared data,    } else {,        std::cout << \"Could not acquire lock\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Always use lock_guard or unique_lock; never manually call lock/unlock.",
                  "Keep critical sections short to avoid contention.",
                  "Use unique_lock for complex scenarios (try_lock, manual unlock, condition variables)."
        ],
        mistake: "Forgetting to lock before accessing shared data, causing race conditions.",
        shorthand: {
          verbose: "#include <iostream>\n#include <thread>\n#include <mutex>\n#include <chrono>\n\nint counter = 0;\nstd::mute",
          concise: "// see verbose",
        },
      },
      {
        id: "async-future",
        fn: "std::async & std::future",
        desc: "Run functions asynchronously and retrieve results.",
        category: "Concurrency",
        subtitle: "Async computation",
        signature: "auto future = std::async(std::launch::async, func);  auto result = future.get();",
        descLong: "std::async runs a function asynchronously and returns a std::future for the result. get() waits and returns the result (or rethrows exceptions). Cleaner than manual threads for functions returning values. Use std::launch::async to force threading; default may defer execution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::async & std::future — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <future>\n#include <chrono>\n\nint compute(int x) {\n    std::cout << \"Computing for \" << x << \"...\\n\";\n    std::this_thread::sleep_for(std::chrono::milliseconds(500));\n    return x * x;\n}\n\nint main() {\n    // Launch async task\n    auto f1 = std::async(std::launch::async, compute, 5);\n    auto f2 = std::async(std::launch::async, compute, 10);\n\n    std::cout << \"Computations running...\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::async & std::future — common patterns you'll see in production.\n// APPROACH  - Combine std::async & std::future with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Get results (blocks until ready)\n    int result1 = f1.get();\n    int result2 = f2.get();\n\n    std::cout << \"5^2 = \" << result1 << \"\\n\";\n    std::cout << \"10^2 = \" << result2 << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::async & std::future — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Async with lambda,    auto f3 = std::async(std::launch::async, []() {,        std::cout << \"Lambda task\\n\";,        return 42;,    });,    std::cout << \"Lambda result: \" << f3.get() << \"\\n\";,\n\n    // wait_for to check completion without blocking,    auto f4 = std::async(std::launch::async, []() {,        std::this_thread::sleep_for(std::chrono::seconds(1));,        return \"done\";,    });,,    auto status = f4.wait_for(std::chrono::milliseconds(100));,    if (status == std::future_status::ready) {,        std::cout << \"Ready: \" << f4.get() << \"\\n\";,    } else {,        std::cout << \"Still computing...\\n\";,        std::cout << \"Result: \" << f4.get() << \"\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::async for simple async computations returning values.",
                  "std::launch::async forces threading; default may defer execution.",
                  "Always call get() to retrieve the result and propagate exceptions."
        ],
        mistake: "Creating std::future without storing it; task may not run.",
        shorthand: {
          verbose: "#include <iostream>\n#include <future>\n#include <chrono>\n\nint compute(int x) {\n    std::cout << \"Comp",
          concise: "// see verbose",
        },
      },
      {
        id: "condition-variable",
        fn: "std::condition_variable",
        desc: "Synchronize threads by signaling conditions.",
        category: "Concurrency",
        subtitle: "Condition variables",
        signature: "std::condition_variable cv;  cv.wait(lock, predicate);  cv.notify_one();",
        descLong: "Condition variables allow threads to wait for specific conditions. notify_one() wakes one waiting thread; notify_all() wakes all. Use with unique_lock and always check the condition in a loop (spurious wakeups are possible).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::condition_variable — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <thread>\n#include <mutex>\n#include <condition_variable>\n#include <queue>\n#include <chrono>\n\nstd::queue<int> data_queue;\nstd::mutex queue_mutex;\nstd::condition_variable queue_cv;\nbool done = false;\n\nvoid producer() {\n    for (int i = 0; i < 5; ++i) {\n        std::this_thread::sleep_for(std::chrono::milliseconds(100));\n        {\n            std::lock_guard<std::mutex> lock(queue_mutex);\n            data_queue.push(i);\n            std::cout << \"Produced: \" << i << \"\\n\";\n        }\n        queue_cv.notify_one();  // signal waiting threads\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::condition_variable — common patterns you'll see in production.\n// APPROACH  - Combine std::condition_variable with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n{\n        std::lock_guard<std::mutex> lock(queue_mutex);\n        done = true;\n    }\n    queue_cv.notify_all();  // signal all waiting threads\n}\n\nvoid consumer(int id) {\n    while (true) {\n        std::unique_lock<std::mutex> lock(queue_mutex);\n        // Wait until queue is not empty or done\n        queue_cv.wait(lock, []() { return !data_queue.empty() || done; });\n\n        if (data_queue.empty()) {\n            break;  // done and queue is empty\n        }\n\n        int value = data_queue.front();\n        data_queue.pop();\n        lock.unlock();\n        std::cout << \"Consumer \" << id << \" got: \" << value << \"\\n\";\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::condition_variable — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nint main() {\n    std::thread prod(producer);\n    std::thread cons1(consumer, 1);\n    std::thread cons2(consumer, 2);\n\n    prod.join();\n    cons1.join();\n    cons2.join();\n\n    std::cout << \"All done\\n\";\n    return 0;\n}"
                  }
        ],
        tips: [
                  "Always wait on condition_variable with a predicate to handle spurious wakeups.",
                  "Use notify_one() for efficiency; use notify_all() only when needed.",
                  "Always use unique_lock with condition_variable (not lock_guard)."
        ],
        mistake: "Waiting without a predicate; spurious wakeups can cause incorrect behavior.",
        shorthand: {
          verbose: "#include <iostream>\n#include <thread>\n#include <mutex>\n#include <condition_variable>\n#include <queue",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: C++20/23 Features ─────────────────────────────────────────
  {
    id: "cpp20-features",
    title: "C++20/23 Features",
    entries: [
      {
        id: "concepts",
        fn: "Concepts",
        desc: "Constrain template types with requirements (C++20).",
        category: "C++20/23 Features",
        subtitle: "Template constraints",
        signature: "template<std::integral T> void func(T x) { }",
        descLong: "Concepts define requirements for template types (replaces SFINAE/enable_if). Named type predicates improve error messages and readability. Use named concepts or inline requires clauses. Available: std::integral, std::floating_point, std::equality_comparable, etc.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Concepts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <concepts>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Concepts — common patterns you'll see in production.\n// APPROACH  - Combine Concepts with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Named concept: types that support addition\ntemplate<typename T>\nconcept Addable = requires(T a, T b) {\n    { a + b } -> std::convertible_to<T>;\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Concepts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Template using concept,template<Addable T>,T add(T a, T b) {,    return a + b;,},\n\n// Std concepts,template<std::integral T>,void print_integral(T x) {,    std::cout << \"Integral: \" << x << \"\\n\";,},,template<std::floating_point T>,void print_float(T x) {,    std::cout << \"Float: \" << x << \"\\n\";,},\n\n// Requires clause (inline concept check),template<typename T>,void process(T x) requires std::copyable<T> {,    T copy = x;,    std::cout << \"Copyable processed\\n\";,},,int main() {,    std::cout << \"5 + 3 = \" << add(5, 3) << \"\\n\";,    std::cout << \"3.14 + 2.86 = \" << add(3.14, 2.86) << \"\\n\";,,    print_integral(42);,    print_float(3.14);,,    process(std::string(\"hello\"));,\n\n    // This would fail at compile time with clearer error:,    // add(std::string(\"hello\"), std::string(\" world\"));,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use concepts to replace SFINAE for cleaner template code.",
                  "Define named concepts for reusable constraints.",
                  "Use std library concepts (std::integral, std::floating_point, etc.) when applicable."
        ],
        mistake: "Using SFINAE instead of concepts on C++20 compilers.",
        shorthand: {
          verbose: "#include <iostream>\n#include <utility>\n#include <vector>\n\ncl",
          concise: "// see verbose",
        },
      },
      {
        id: "ranges",
        fn: "Ranges Library (C++20)",
        desc: "Work with ranges directly instead of begin/end pairs.",
        category: "C++20/23 Features",
        subtitle: "Range-based operations",
        signature: "std::ranges::sort(container);  container | std::views::filter(...)",
        descLong: "std::ranges provides range-based algorithm overloads (no begin/end needed). std::ranges::views offers lazy transformations (filter, transform, take). Composable with | operator. Fundamental shift in STL towards functional programming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Ranges Library (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <ranges>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Ranges Library (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine Ranges Library (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Ranges algorithms take containers directly\n    std::ranges::sort(nums, std::greater<int>());\n    std::cout << \"Sorted desc: \";\n    for (auto n : nums) std::cout << n << \" \";\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Ranges Library (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Views are lazy transformations (no copies),    auto evens = nums | std::views::filter([](int x) { return x % 2 == 0; });,    std::cout << \"Even numbers: \";,    for (auto n : evens) std::cout << n << \" \";,    std::cout << \"\\n\";,\n\n    // Chaining transformations,    auto result = nums,        | std::views::filter([](int x) { return x > 3; }),        | std::views::transform([](int x) { return x * 2; }),        | std::views::take(3);,,    std::cout << \"Transformed: \";,    for (auto n : result) std::cout << n << \" \";,    std::cout << \"\\n\";,\n\n    // Find in range,    if (auto it = std::ranges::find(nums, 5); it != nums.end()) {,        std::cout << \"Found 5\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::ranges algorithms for cleaner code (no .begin()/.end()).",
                  "Use std::views for lazy, composable transformations.",
                  "Views do not copy data; they create lightweight adapters."
        ],
        mistake: "Trying to use ranges on pre-C++20 compilers.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <ranges>\n#include <algorithm>\n\nint main() {\n    std::",
          concise: "// see verbose",
        },
      },
      {
        id: "coroutines",
        fn: "Coroutines (C++20)",
        desc: "Suspendable functions for lazy evaluation and async code.",
        category: "C++20/23 Features",
        subtitle: "Suspendable functions",
        signature: "co_await, co_yield, co_return",
        descLong: "Coroutines enable functions to suspend and resume. co_await waits for an awaitable; co_yield produces values (generators); co_return returns final value. Complex feature; requires promise_type and awaitable definitions. Enables elegant async and generator code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Coroutines (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <coroutine>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Coroutines (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine Coroutines (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simplified generator-like coroutine (illustrative)\n// Note: Full coroutine implementation requires substantial boilerplate"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Coroutines (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// For now, a simple example showing coroutine keywords:,\n\n// Pseudocode example of generator (requires proper coroutine framework):,/*,std::generator<int> range(int start, int end) {,    for (int i = start; i < end; ++i) {,        co_yield i;,    },},,int main() {,    for (auto i : range(0, 5)) {,        std::cout << i << \" \";  // 0 1 2 3 4,    },    return 0;,},*/,\n\n// For now, demonstrate co_return:,struct simple_coro {,    struct promise_type {,        int value_;,        simple_coro get_return_object() { return simple_coro(std::coroutine_handle<promise_type>::from_promise(*this)); },        std::suspend_never initial_suspend() { return {}; },        std::suspend_never final_suspend() noexcept { return {}; },        void return_value(int v) { value_ = v; },        void unhandled_exception() {},    };,,    std::coroutine_handle<promise_type> h;,    simple_coro(std::coroutine_handle<promise_type> h) : h(h) {},    int get_result() { return h.promise().value_; },};,,simple_coro example() {,    co_return 42;,},,int main() {,    // Coroutines are advanced; full examples require C++20 library support,    // std::generator and async utilities may be available in <experimental>,,    std::cout << \"Coroutines are C++20 feature\\n\";,    // auto coro = example();,    // std::cout << coro.get_result() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Coroutines are advanced; start with generators or async frameworks.",
                  "Use std::generator (C++23) or library implementations for generators.",
                  "Coroutines enable elegant handling of async operations and lazy sequences."
        ],
        mistake: "Attempting complex coroutines without understanding promise_type and awaitables.",
        shorthand: {
          verbose: "#include <iostream>\n#include <coroutine>\n\n// Simplified generator-like coroutine (illustrative)\n// N",
          concise: "// see verbose",
        },
      },
      {
        id: "spaceship-operator",
        fn: "Three-Way Comparison (C++20)",
        desc: "Unified comparison operator <=> simplifies comparisons.",
        category: "C++20/23 Features",
        subtitle: "Unified comparison",
        signature: "auto operator<=>(const T& other) const = default;  |  return a <=> b;",
        descLong: "The spaceship operator <=> (three-way comparison) returns std::strong_ordering, std::weak_ordering, or std::partial_ordering. Enables auto-generation of all comparison operators. Default <=> for classes with spaceship-comparable members. Simplifies operator overloading.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Three-Way Comparison (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <compare>\n\nclass Point {\npublic:\n    Point(int x = 0, int y = 0) : x_(x), y_(y) {}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Three-Way Comparison (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine Three-Way Comparison (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Three-way comparison (auto-generates ==, !=, <, <=, >, >=)\n    auto operator<=>(const Point& other) const = default;\n\n    int x() const { return x_; }\n    int y() const { return y_; }\n\nprivate:\n    int x_, y_;\n};\n\nclass Value {\npublic:\n    explicit Value(int v = 0) : value_(v) {}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Three-Way Comparison (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom three-way comparison,    std::strong_ordering operator<=>(const Value& other) const {,        return value_ <=> other.value_;,    },\n\n    // Equality still needs to be defined explicitly if custom,    bool operator==(const Value& other) const = default;,,    int get() const { return value_; },,private:,    int value_;,};,,int main() {,    Point p1{1, 2};,    Point p2{1, 2};,    Point p3{2, 1};,,    std::cout << \"p1 == p2: \" << (p1 == p2) << \"\\n\";  // true,    std::cout << \"p1 < p3: \" << (p1 < p3) << \"\\n\";    // true,    std::cout << \"p1 <= p2: \" << (p1 <= p2) << \"\\n\";  // true,,    Value v1{10};,    Value v2{20};,,    std::cout << \"v1 < v2: \" << (v1 < v2) << \"\\n\";  // true,    std::cout << \"v1 == v1: \" << (v1 == v1) << \"\\n\"; // true,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use = default for <=> when members are all spaceship-comparable.",
                  "Three-way comparison auto-generates all relational operators.",
                  "Use std::strong_ordering for total order, std::weak_ordering for equivalence classes."
        ],
        mistake: "Mixing old-style operator< with new <=> syntax.",
        shorthand: {
          verbose: "#include <iostream>\n#include <compare>\n\nclass Point {\npublic:\n    Point(int x = 0, int y = 0) : x_(x",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
