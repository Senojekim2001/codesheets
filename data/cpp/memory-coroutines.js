export const meta = {
  "id": "memory-coroutines",
  "label": "Memory, Coroutines & Interop",
  "icon": "🧠",
  "description": "Memory management (smart pointers, allocators), C++20 coroutines, debugging tools (gdb, valgrind, ASan), and C/Python interop."
}

export const sections = [

  // ── Section 1: Memory Management & Debugging ─────────────────────────────────────────
  {
    id: "memory-debug",
    title: "Memory Management & Debugging",
    entries: [
      {
        id: "memory-allocators",
        fn: "Smart Pointers, Custom Allocators & Memory Debugging",
        desc: "Deep dive into memory: unique_ptr/shared_ptr patterns, custom allocators, arena allocation, and debugging with valgrind/ASan.",
        category: "Memory",
        subtitle: "unique_ptr, shared_ptr, weak_ptr, make_unique, allocator, pmr, valgrind, ASan, gdb",
        signature: "auto p = std::make_unique<T>(args)  |  std::pmr::polymorphic_allocator  |  -fsanitize=address",
        descLong: "Modern C++ manages memory through smart pointers: unique_ptr (exclusive ownership, zero overhead), shared_ptr (reference-counted shared ownership), weak_ptr (non-owning observer). Custom allocators optimize allocation patterns: arena/pool allocators for game engines and high-frequency systems. C++17 polymorphic memory resources (pmr) provide runtime-switchable allocators. For debugging: AddressSanitizer (ASan) catches use-after-free and buffer overflows at runtime; valgrind detects leaks; gdb provides interactive debugging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Smart Pointers, Custom Allocators & Memory Debugging — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <memory>\n#include <memory_resource>\n#include <vector>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Smart Pointers, Custom Allocators & Memory Debugging — common patterns you'll see in production.\n// APPROACH  - Combine Smart Pointers, Custom Allocators & Memory Debugging with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Smart pointer patterns ──────────────────────────\n// unique_ptr: exclusive ownership (prefer this by default)\nauto widget = std::make_unique<Widget>(\"button\", 100, 50);\n// widget automatically deleted when it goes out of scope"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Smart Pointers, Custom Allocators & Memory Debugging — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Transfer ownership,auto panel = std::make_unique<Panel>();,panel->addChild(std::move(widget)); // widget is now nullptr,\n\n// unique_ptr with custom deleter,auto file = std::unique_ptr<FILE, decltype(&fclose)>(,    fopen(\"data.bin\", \"rb\"), &fclose,);,\n\n// shared_ptr: shared ownership (use when truly shared),auto config = std::make_shared<Config>();,auto handler1 = std::make_shared<Handler>(config);,auto handler2 = std::make_shared<Handler>(config);,// config lives until last handler is destroyed,\n\n// weak_ptr: break circular references,struct Node {,    std::shared_ptr<Node> next;,    std::weak_ptr<Node> parent; // weak to avoid cycle,};,,auto parent = std::make_shared<Node>();,auto child = std::make_shared<Node>();,child->parent = parent; // weak reference,,if (auto p = child->parent.lock()) {,    // parent is still alive, use p,},\n\n// ── Custom allocator (arena/pool) ───────────────────,class ArenaAllocator {,    char* buffer_;,    size_t offset_ = 0;,    size_t capacity_;,public:,    ArenaAllocator(size_t cap) : buffer_(new char[cap]), capacity_(cap) {},    ~ArenaAllocator() { delete[] buffer_; },,    void* allocate(size_t size, size_t alignment = alignof(std::max_align_t)) {,        size_t aligned = (offset_ + alignment - 1) & ~(alignment - 1);,        if (aligned + size > capacity_) throw std::bad_alloc();,        void* ptr = buffer_ + aligned;,        offset_ = aligned + size;,        return ptr;,    },,    void reset() { offset_ = 0; } // \"free\" everything at once,};,\n\n// ── C++17 PMR (polymorphic memory resource) ─────────,char buffer[1024];,std::pmr::monotonic_buffer_resource pool(buffer, sizeof(buffer));,std::pmr::vector<int> vec(&pool);   // allocates from stack buffer,for (int i = 0; i < 100; ++i) vec.push_back(i);,// No heap allocation until buffer is exhausted,\n\n// ── Debugging commands ──────────────────────────────,// AddressSanitizer (compile-time, fastest for dev):,// g++ -fsanitize=address -fno-omit-frame-pointer -g main.cpp -o app,// ./app  -> reports use-after-free, buffer overflow, leaks,\n\n// Valgrind (no recompile, thorough):,// valgrind --leak-check=full --show-leak-kinds=all ./app,\n\n// GDB debugging:,// g++ -g -O0 main.cpp -o app,// gdb ./app,// (gdb) break main,// (gdb) run,// (gdb) print variable,// (gdb) backtrace,// (gdb) watch *ptr  (break when memory changes)"
                  }
        ],
        tips: [
                  "Default to unique_ptr — only use shared_ptr when ownership is genuinely shared. shared_ptr has atomic ref-counting overhead.",
                  "make_unique/make_shared are exception-safe and may allocate more efficiently than new + smart_ptr constructor.",
                  "PMR monotonic_buffer_resource is perfect for request-scoped allocation — allocate fast, reset at end of request.",
                  "Compile with -fsanitize=address during development — ASan catches memory bugs with ~2x slowdown vs 20x for valgrind."
        ],
        mistake: "Using raw new/delete in modern C++ — smart pointers handle lifetime automatically. The only exception is performance-critical code with custom allocators, and even then, prefer pmr.",
        shorthand: {
          verbose: "int* ptr = new int(42);\n// ... use ptr ...\ndelete ptr; ptr = nullptr;",
          concise: "auto ptr = std::make_unique<int>(42);\n// auto cleanup, no explicit delete",
        },
      },
    ],
  },

  // ── Section 2: Coroutines & Language Interop ─────────────────────────────────────────
  {
    id: "coroutines-interop",
    title: "Coroutines & Language Interop",
    entries: [
      {
        id: "coroutines",
        fn: "C++20 Coroutines & C/Python Interop",
        desc: "C++20 coroutines for async/generators, and interoperability with C (extern \"C\") and Python (pybind11).",
        category: "Coroutines",
        subtitle: "co_await, co_yield, co_return, generator, task, extern \"C\", pybind11",
        signature: "Task<int> fetchData() { co_return co_await asyncRead(); }  |  PYBIND11_MODULE(name, m)",
        descLong: "C++20 coroutines enable stackless async programming: co_await suspends until a value is ready, co_yield produces values in generators, co_return returns from coroutines. Libraries like cppcoro and libcoro provide Task<T> and Generator<T> types. For interop: extern \"C\" exposes C++ functions to C callers (and by extension Python ctypes, Rust FFI, etc.). pybind11 creates Python bindings with minimal boilerplate — expose C++ classes and functions directly to Python with automatic type conversion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++20 Coroutines & C/Python Interop — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++20 Coroutines & C/Python Interop — common patterns you'll see in production.\n// APPROACH  - Combine C++20 Coroutines & C/Python Interop with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Generator coroutine (co_yield) ──────────────────\n// Simplified generator (production: use cppcoro::generator)\ntemplate<typename T>\nstruct Generator {\n    struct promise_type {\n        T current_value;\n        auto yield_value(T value) {\n            current_value = value;\n            return std::suspend_always{};\n        }\n        Generator get_return_object() {\n            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};\n        }\n        auto initial_suspend() { return std::suspend_always{}; }\n        auto final_suspend() noexcept { return std::suspend_always{}; }\n        void return_void() {}\n        void unhandled_exception() { std::terminate(); }\n    };\n\n    std::coroutine_handle<promise_type> handle;\n    bool move_next() { handle.resume(); return !handle.done(); }\n    T current_value() { return handle.promise().current_value; }\n};\n\nGenerator<int> fibonacci() {\n    int a = 0, b = 1;\n    while (true) {\n        co_yield a;\n        auto next = a + b;\n        a = b;\n        b = next;\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++20 Coroutines & C/Python Interop — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Usage:,// auto gen = fibonacci();,// for (int i = 0; i < 10 && gen.move_next(); ++i) {,//     std::cout << gen.current_value() << \" \";,// },// Output: 0 1 1 2 3 5 8 13 21 34,\n\n// ── Async task (co_await) ───────────────────────────,// Using cppcoro library:,// cppcoro::task<std::string> fetchUrl(std::string url) {,//     auto response = co_await http_client.get(url);,//     co_return response.body();,// },//,// cppcoro::task<void> processAll() {,//     auto [page1, page2] = co_await cppcoro::when_all(,//         fetchUrl(\"https://api.example.com/1\"),,//         fetchUrl(\"https://api.example.com/2\"),//     );,//     process(page1, page2);,// },\n\n// ── C interop (extern \"C\") ─────────────────────────,// header: mylib.h,// #ifdef __cplusplus,// extern \"C\" {,// #endif,//,// typedef struct { double x, y; } Point;,// double distance(Point a, Point b);,// int process_data(const char* input, char* output, int max_len);,//,// #ifdef __cplusplus,// },// #endif,\n\n// implementation: mylib.cpp,extern \"C\" double distance(Point a, Point b) {,    return std::sqrt(std::pow(a.x - b.x, 2) + std::pow(a.y - b.y, 2));,},\n\n// ── Python interop with pybind11 ────────────────────,// #include <pybind11/pybind11.h>,// #include <pybind11/stl.h>,// namespace py = pybind11;,//,// class Matrix {,// public:,//     Matrix(int rows, int cols);,//     double get(int r, int c) const;,//     void set(int r, int c, double v);,//     Matrix multiply(const Matrix& other) const;,//     std::vector<double> to_vector() const;,// };,//,// PYBIND11_MODULE(mymath, m) {,//     m.doc() = \"Fast math operations\";,//,//     py::class_<Matrix>(m, \"Matrix\"),//         .def(py::init<int, int>()),//         .def(\"get\", &Matrix::get),//         .def(\"set\", &Matrix::set),//         .def(\"multiply\", &Matrix::multiply),//         .def(\"to_vector\", &Matrix::to_vector),//         .def(\"__repr__\", [](const Matrix& m) {,//             return \"<Matrix \" + std::to_string(m.rows()) + \"x\" + std::to_string(m.cols()) + \">\";,//         });,//,//     m.def(\"distance\", &distance, \"Euclidean distance\",,//           py::arg(\"a\"), py::arg(\"b\"));,// },//,// Python: import mymath; m = mymath.Matrix(3, 3)"
                  }
        ],
        tips: [
                  "C++20 coroutines are low-level primitives — use a library (cppcoro, libcoro, folly::coro) for production-ready Task<T> and Generator<T>.",
                  "co_yield creates lazy generators that compute values on-demand — perfect for large sequences without buffering.",
                  "extern \"C\" disables name mangling — required for any C++ function called from C, Python, Rust, or other languages.",
                  "pybind11 auto-converts STL types (vector, map, string) to Python equivalents — no manual conversion code needed."
        ],
        mistake: "Writing coroutine promise_type from scratch for every project — the boilerplate is complex and error-prone. Use established coroutine libraries that provide tested, optimized Task and Generator types.",
        shorthand: {
          verbose: "// C++17: std::future for async work\nauto future = std::async(std::launch::async, []{ return 42; });\nint result = future.get();",
          concise: "// C++20: co_await and co_yield for async\nco_await task;\nauto value = co_await async_work();",
        },
      },
      {
        id: "smart-pointers-advanced",
        fn: "Smart Pointers Advanced — Custom Deleters, Aliasing, weak_ptr",
        desc: "Advanced smart pointer patterns: custom deleters for resources, aliasing constructor for shared_ptr, and weak_ptr cycles.",
        category: "Memory",
        subtitle: "unique_ptr custom deleter, shared_ptr aliasing, weak_ptr::lock(), resource ownership",
        signature: "std::unique_ptr<T, Deleter>  |  std::shared_ptr(ptr, get_deleter())  |  weak_ptr::lock()",
        descLong: "Smart pointers manage ownership and cleanup automatically. unique_ptr accepts custom deleters for non-standard resources (FILE*, GPU memory, audio handles). shared_ptr aliasing constructor enables shared ownership of a subobject without increasing reference count on the actual resource. weak_ptr breaks circular references and provides safe observation of shared_ptr-managed objects via lock().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Smart Pointers Advanced — Custom Deleters, Aliasing, weak_ptr — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <memory>\n#include <iostream>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Smart Pointers Advanced — Custom Deleters, Aliasing, weak_ptr — common patterns you'll see in production.\n// APPROACH  - Combine Smart Pointers Advanced — Custom Deleters, Aliasing, weak_ptr with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── unique_ptr with custom deleter ──────────────────\nclass Resource {\npublic:\n    Resource() { std::cout << \"Resource acquired\\n\"; }\n    ~Resource() { std::cout << \"Resource released\\n\"; }\n};\n\nauto custom_deleter = [](Resource* r) {\n    std::cout << \"Custom cleanup\\n\";\n    delete r;\n};\n\nauto resource = std::unique_ptr<Resource, decltype(custom_deleter)>(\n    new Resource(), custom_deleter\n);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Smart Pointers Advanced — Custom Deleters, Aliasing, weak_ptr — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── FILE* with fclose deleter ──────────────────────,auto file = std::unique_ptr<FILE, decltype(&fclose)>(,    fopen(\"data.bin\", \"rb\"), &fclose,);,if (file) {,    // File is automatically closed when file goes out of scope,},\n\n// ── shared_ptr aliasing constructor ─────────────────,struct Widget {,    int id = 42;,    std::string name = \"MyWidget\";,};,,auto widget = std::make_shared<Widget>();,\n\n// Create shared_ptr to the member, but shared ownership of widget,std::shared_ptr<int> id_ptr(widget, &widget->id);,std::shared_ptr<std::string> name_ptr(widget, &widget->name);,,std::cout << *id_ptr << \"\\n\";           // 42,std::cout << *name_ptr << \"\\n\";         // MyWidget,std::cout << widget.use_count() << \"\\n\";  // still 1 (aliasing doesn't inc),\n\n// ── weak_ptr for breaking cycles ────────────────────,struct Node {,    int value;,    std::shared_ptr<Node> next;,    std::weak_ptr<Node> parent;  // weak to break cycle,};,,auto head = std::make_shared<Node>();,auto child = std::make_shared<Node>();,child->value = 42;,,head->next = child;,child->parent = head;  // weak assignment, no cycle!,,std::cout << head.use_count() << \"\\n\";   // 1 (not 2),\n\n// Safely access parent:,if (auto p = child->parent.lock()) {,    std::cout << \"Parent still alive\\n\";,    p->next = nullptr;,},\n\n// ── Array deleter for unique_ptr<T[]> ──────────────,auto arr = std::make_unique<int[]>(10);,arr[5] = 42;,// Automatically calls delete[] (not delete),\n\n// ── Custom deleters for memory pools ────────────────,class MemoryPool {,    char buffer[1024];,public:,    void* allocate(std::size_t size) {,        return buffer;  // simplified,    },    void deallocate(void* ptr) {,        // no-op for pool,    },};,,MemoryPool pool;,,auto pool_deleter = [&pool](int* p) {,    pool.deallocate(p);,};,,auto pooled = std::unique_ptr<int, decltype(pool_deleter)>(,    static_cast<int*>(pool.allocate(sizeof(int))),,    pool_deleter,);,\n\n// ── Storing shared_ptr in containers ────────────────,std::vector<std::shared_ptr<Resource>> resources;,resources.push_back(std::make_shared<Resource>());,resources.push_back(std::make_shared<Resource>());,// Resources automatically cleaned up when vector is destroyed,\n\n// ── Deleter type erasure (std::function-like) ──────,using FilePtr = std::unique_ptr<FILE, std::function<void(FILE*)>>;,,FilePtr make_file(const char* path) {,    return FilePtr(fopen(path, \"r\"), &fclose);,},,auto fp = make_file(\"data.txt\");"
                  }
        ],
        tips: [
                  "unique_ptr with custom deleters: most common use case is FILE* + fclose or GPU handles.",
                  "shared_ptr aliasing constructor is essential for non-owning pointers to object members without breaking shared ownership.",
                  "weak_ptr::lock() returns an empty shared_ptr if the object is gone — always check the result.",
                  "Store custom deleters in the type: std::unique_ptr<T, MyDeleter>. Type erasure (std::function) adds overhead."
        ],
        mistake: "Using raw delete in a custom deleter when delete[] was needed (or vice versa) — std::unique_ptr<T[]> handles the distinction.",
        shorthand: {
          verbose: "FILE* f = fopen(\"data.bin\", \"r\");\n// ... use f ...\nfclose(f);",
          concise: "auto f = std::unique_ptr<FILE, decltype(&fclose)>(\n    fopen(\"data.bin\", \"r\"), &fclose\n);",
        },
      },
      {
        id: "placement-new",
        fn: "Placement New — Construct Objects in Pre-allocated Memory",
        desc: "Use placement new to construct objects in existing memory without heap allocation.",
        category: "Memory",
        subtitle: "new (ptr) T(), explicit destructor call, arena allocator, custom constructors",
        signature: "new (ptr) T(args)  |  obj.~T()  |  allocator.allocate() -> placement new",
        descLong: "Placement new (new (address) Type(...)) constructs an object at a pre-allocated memory address without calling ::operator new. Essential for arena allocators, custom memory pools, and avoiding heap fragmentation. Must explicitly call the destructor (~T()) to clean up. Common in game engines, real-time systems, and embedded code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Placement New — Construct Objects in Pre-allocated Memory — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Widget {\npublic:\n    int id;\n    explicit Widget(int id = 0) : id(id) {\n        std::cout << \"Widget(\" << id << \") constructed\\n\";\n    }\n    ~Widget() {\n        std::cout << \"~Widget(\" << id << \") destroyed\\n\";\n    }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Placement New — Construct Objects in Pre-allocated Memory — common patterns you'll see in production.\n// APPROACH  - Combine Placement New — Construct Objects in Pre-allocated Memory with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic placement new ─────────────────────────────\nchar buffer[sizeof(Widget)];\nWidget* widget = new (buffer) Widget(42);\nstd::cout << \"Widget ID: \" << widget->id << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Placement New — Construct Objects in Pre-allocated Memory — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Must explicitly call destructor!,widget->~Widget();,\n\n// ── Arena allocator example ─────────────────────────,class Arena {,    char buffer[4096];,    std::size_t offset = 0;,,public:,    void* allocate(std::size_t size) {,        if (offset + size > sizeof(buffer)) {,            throw std::bad_alloc();,        },        void* ptr = buffer + offset;,        offset += size;,        return ptr;,    },,    void reset() { offset = 0; }  // Reset all allocations,};,,Arena arena;,\n\n// Allocate and construct multiple objects,Widget* w1 = new (arena.allocate(sizeof(Widget))) Widget(1);,Widget* w2 = new (arena.allocate(sizeof(Widget))) Widget(2);,Widget* w3 = new (arena.allocate(sizeof(Widget))) Widget(3);,,std::cout << w1->id << \" \" << w2->id << \" \" << w3->id << \"\\n\";,\n\n// Explicit cleanup,w1->~Widget();,w2->~Widget();,w3->~Widget();,arena.reset();  // \"free\" all at once,\n\n// ── Placement new with arrays ───────────────────────,struct Point { int x, y; };,,char point_buffer[3 * sizeof(Point)];,Point* points = new (point_buffer) Point[3];,points[0] = {1, 2};,points[1] = {3, 4};,points[2] = {5, 6};,\n\n// Destroy all: must iterate,for (int i = 0; i < 3; ++i) {,    points[i].~Point();,},\n\n// ── Pool allocator with placement new ───────────────,template<typename T>,class ObjectPool {,    std::vector<char> storage;,    std::vector<T*> available;,,public:,    ObjectPool(std::size_t size) : storage(size * sizeof(T)) {,        for (std::size_t i = 0; i < size; ++i) {,            available.push_back(,                new (storage.data() + i * sizeof(T)) T(),            );,        },    },,    T* acquire() {,        if (available.empty()) throw std::bad_alloc();,        T* obj = available.back();,        available.pop_back();,        return obj;,    },,    void release(T* obj) {,        available.push_back(obj);,    },,    ~ObjectPool() {,        // Objects are in storage, but if needed, destroy them,        // (storage RAII handles memory deallocation),    },};,,ObjectPool<Widget> pool(10);,auto w = pool.acquire();,w->id = 100;,pool.release(w);,\n\n// ── std::aligned_storage with placement new ────────,struct Data { char buffer[64]; };,,std::aligned_storage<sizeof(Data), alignof(Data)>::type storage;,Data* data = new (&storage) Data();,,data->~Data();,\n\n// ── Exception safety with placement new ────────────,class SafeArena {,    char buffer[1024];,    std::size_t offset = 0;,,public:,    template<typename T, typename... Args>,    T* construct(Args&&... args) {,        void* ptr = allocate(sizeof(T));,        try {,            return new (ptr) T(std::forward<Args>(args)...);,        } catch (...) {,            offset -= sizeof(T);  // rollback,            throw;,        },    },,private:,    void* allocate(std::size_t size) {,        if (offset + size > sizeof(buffer)) {,            throw std::bad_alloc();,        },        void* ptr = buffer + offset;,        offset += size;,        return ptr;,    },};,\n\n// Usage is exception-safe,SafeArena safe;,auto widget1 = safe.construct<Widget>(1);,auto widget2 = safe.construct<Widget>(2);"
                  }
        ],
        tips: [
                  "Placement new constructs at an address — it does not allocate memory. Memory must be pre-allocated (stack, heap, arena).",
                  "ALWAYS explicitly call the destructor (obj->~ClassName()) — placement new does not pair with delete.",
                  "Use std::aligned_storage or char arrays aligned properly for the type.",
                  "Arena allocators with placement new eliminate heap fragmentation — essential for game engines and real-time systems."
        ],
        mistake: "Using delete on an object constructed with placement new — delete will call ::operator delete, corrupting memory. Always call the destructor explicitly.",
        shorthand: {
          verbose: "void* buffer = malloc(sizeof(MyClass));\nMyClass* obj = new (buffer) MyClass();\n// ... use obj ...\nobj->~MyClass();\nfree(buffer);",
          concise: "MyClass* obj = new (arena.allocate(sizeof(MyClass))) MyClass();",
        },
      },
      {
        id: "allocators-custom",
        fn: "Custom Allocators — Polymorphic & PMR",
        desc: "Write custom allocators for specialized allocation patterns using std::allocator_traits and C++17 PMR.",
        category: "Memory",
        subtitle: "std::allocator_traits, pmr::polymorphic_allocator, monotonic_buffer_resource, custom allocators",
        signature: "template<typename T> class MyAllocator  |  std::pmr::monotonic_buffer_resource  |  std::pmr::vector<int>",
        descLong: "Allocators customize memory allocation for containers. std::allocator_traits provides a standard interface. C++17 polymorphic memory resources (pmr) enable runtime-switchable allocators without template instantiation. Common patterns: monotonic_buffer_resource (fast allocation, reset-only deallocation), unsynchronized_pool_resource (multi-threaded pools), pmr::vector uses a configurable allocator at runtime.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Allocators — Polymorphic & PMR — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <memory_resource>\n#include <vector>\n#include <iostream>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Allocators — Polymorphic & PMR — common patterns you'll see in production.\n// APPROACH  - Combine Custom Allocators — Polymorphic & PMR with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic custom allocator ──────────────────────────\ntemplate<typename T>\nclass CountingAllocator {\n    static std::size_t allocations;\n    static std::size_t deallocations;\n\npublic:\n    using value_type = T;\n\n    CountingAllocator() = default;\n\n    T* allocate(std::size_t n) {\n        ++allocations;\n        return std::allocator<T>{}.allocate(n);\n    }\n\n    void deallocate(T* p, std::size_t n) {\n        ++deallocations;\n        std::allocator<T>{}.deallocate(p, n);\n    }\n\n    static void print_stats() {\n        std::cout << \"Allocations: \" << allocations\n                  << \", Deallocations: \" << deallocations << \"\\n\";\n    }\n};\n\ntemplate<typename T>\nstd::size_t CountingAllocator<T>::allocations = 0;\n\ntemplate<typename T>\nstd::size_t CountingAllocator<T>::deallocations = 0;\n\nstd::vector<int, CountingAllocator<int>> v;\nv.push_back(1);\nv.push_back(2);\nv.push_back(3);\nCountingAllocator<int>::print_stats();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Allocators — Polymorphic & PMR — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── PMR monotonic_buffer_resource ───────────────────,// Stack-based buffer, allocate from start, reset entire buffer,char buffer[256];,std::pmr::monotonic_buffer_resource pool(buffer, sizeof(buffer));,std::pmr::vector<int> vec(&pool);,,for (int i = 0; i < 100; ++i) {,    vec.push_back(i);,},std::cout << \"Vector size: \" << vec.size() << \"\\n\";,,pool.release();  // \"free\" everything at once,\n\n// ── PMR for request-scoped allocation ───────────────,void process_request() {,    // Each request gets its own buffer,    char request_buffer[1024];,    std::pmr::monotonic_buffer_resource request_pool(,        request_buffer, sizeof(request_buffer),    );,,    std::pmr::vector<int> local_vec(&request_pool);,    std::pmr::string local_str(&request_pool);,,    local_vec.push_back(42);,    local_str = \"hello\";,\n\n    // When request_pool goes out of scope, everything is cleaned up,},\n\n// ── Custom memory resource ──────────────────────────,class LoggingMemoryResource : public std::pmr::memory_resource {,protected:,    void* do_allocate(std::size_t bytes, std::size_t align) override {,        std::cout << \"Allocating \" << bytes << \" bytes\\n\";,        return ::operator new(bytes, std::align_val_t(align));,    },,    void do_deallocate(void* ptr, std::size_t bytes, std::size_t align) override {,        std::cout << \"Deallocating \" << bytes << \" bytes\\n\";,        ::operator delete(ptr, std::align_val_t(align));,    },,    bool do_is_equal(const std::pmr::memory_resource& other) const noexcept override {,        return this == &other;,    },};,,LoggingMemoryResource logging_resource;,std::pmr::vector<int> logged_vec(&logging_resource);,logged_vec.push_back(42);  // prints \"Allocating...\",\n\n// ── Arena allocator with PMR ───────────────────────,class ArenaResource : public std::pmr::memory_resource {,    char buffer[2048];,    std::size_t offset = 0;,,protected:,    void* do_allocate(std::size_t bytes, std::size_t align) override {,        // Align offset,        auto aligned = (offset + align - 1) & ~(align - 1);,        if (aligned + bytes > sizeof(buffer)) {,            throw std::bad_alloc();,        },        void* ptr = buffer + aligned;,        offset = aligned + bytes;,        return ptr;,    },,    void do_deallocate(void*, std::size_t, std::size_t) noexcept override {,        // no-op for arena,    },,    bool do_is_equal(const std::pmr::memory_resource& other) const noexcept override {,        return this == &other;,    },,public:,    void reset() { offset = 0; },};,,ArenaResource arena;,std::pmr::vector<int> arena_vec(&arena);,for (int i = 0; i < 50; ++i) {,    arena_vec.push_back(i);,},std::cout << \"Arena vector size: \" << arena_vec.size() << \"\\n\";,arena.reset();,\n\n// ── std::allocator_traits ───────────────────────────,template<typename Alloc>,void show_allocator_properties() {,    std::cout << \"Pointer: \" << typeid(typename std::allocator_traits<Alloc>::pointer).name() << \"\\n\";,    std::cout << \"Size type: \" << typeid(typename std::allocator_traits<Alloc>::size_type).name() << \"\\n\";,},,show_allocator_properties<std::allocator<int>>();,\n\n// ── Using allocators with smart pointers ────────────,template<typename T, typename Alloc>,std::shared_ptr<T> allocate_with_alloc(const Alloc& alloc) {,    Alloc a = alloc;,    T* ptr = a.allocate(1);,    try {,        new (ptr) T();,    } catch (...) {,        a.deallocate(ptr, 1);,        throw;,    },    return std::shared_ptr<T>(,        ptr,,        [a](T* p) mutable {,            p->~T();,            a.deallocate(p, 1);,        },    );,}"
                  }
        ],
        tips: [
                  "monotonic_buffer_resource is perfect for request-scoped allocation — allocate fast, reset at end of request.",
                  "PMR avoids template bloat — one vector<int> using pmr instead of per-allocator specializations.",
                  "Custom memory resources must implement do_allocate, do_deallocate, do_is_equal.",
                  "Arena allocators with PMR eliminate fragmentation and improve cache locality in performance-critical code."
        ],
        mistake: "Using global new/delete when a custom allocator (or PMR) would improve performance and predictability.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::vector<int, MyAllocator<int>> v;\nv.push_back(1);\n// More explicit but longer",
          concise: "std::pmr::vector<int> v;  // uses default pmr allocator",
        },
      },
      {
        id: "memory-model",
        fn: "C++ Memory Model — Atomics & Acquire/Release Semantics",
        desc: "Understand the C++ memory model, memory orders, acquire/release semantics, and data races.",
        category: "Memory",
        subtitle: "std::memory_order, acquire, release, memory_order_seq_cst, data races",
        signature: "std::atomic<T>, .load(memory_order), .store(value, memory_order), memory_order_acq_rel",
        descLong: "The C++ memory model defines how memory operations are ordered and visible across threads. std::atomic<T> enables lock-free synchronization. Memory orders control visibility: memory_order_seq_cst (default, slowest, safest), acquire/release (one-way synchronization), relaxed (no synchronization). Acquire on load ensures subsequent loads/stores see the write. Release on store ensures prior writes are visible. Understanding memory orders is essential for lock-free programming, concurrent data structures.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++ Memory Model — Atomics & Acquire/Release Semantics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <atomic>\n#include <thread>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++ Memory Model — Atomics & Acquire/Release Semantics — common patterns you'll see in production.\n// APPROACH  - Combine C++ Memory Model — Atomics & Acquire/Release Semantics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Sequential consistency (default, safest) ───────\nstd::atomic<int> counter(0);\n\nvoid increment() {\n    counter.store(counter.load() + 1);  // seq_cst is default\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++ Memory Model — Atomics & Acquire/Release Semantics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Acquire/Release pattern (common in locks) ──────,std::atomic<bool> flag(false);,int protected_value = 0;,\n\n// Writer thread,void writer() {,    protected_value = 42;,    flag.store(true, std::memory_order_release);  // release: previous writes visible,},\n\n// Reader thread,void reader() {,    while (!flag.load(std::memory_order_acquire)) {  // acquire: sees writer's writes,        // spin,    },    std::cout << protected_value << \"\\n\";  // safely sees 42,},\n\n// ── Relaxed atomics (no synchronization) ────────────,std::atomic<int> relaxed_counter(0);,,void increment_relaxed() {,    // Only atomic, no memory ordering,    relaxed_counter.fetch_add(1, std::memory_order_relaxed);,},\n\n// ── Compare-and-swap (CAS) ──────────────────────────,std::atomic<int*> ptr(nullptr);,,bool update_ptr(int* expected, int* new_val) {,    return ptr.compare_exchange_strong(,        expected, new_val,,        std::memory_order_release,  // success order,        std::memory_order_acquire   // failure order,    );,},\n\n// ── Sequentially consistent fences ──────────────────,std::atomic<int> x(0), y(0);,,void thread_1() {,    x.store(1, std::memory_order_relaxed);,    std::atomic_thread_fence(std::memory_order_release);,    y.store(1, std::memory_order_relaxed);,},,void thread_2() {,    if (y.load(std::memory_order_relaxed) == 1) {,        std::atomic_thread_fence(std::memory_order_acquire);,        std::cout << x.load(std::memory_order_relaxed) << \"\\n\";  // sees 1,    },},\n\n// ── Double-checked locking (classic acquire/release) ─,class Singleton {,    static std::atomic<Singleton*> instance;,    static std::mutex init_mutex;,    Singleton() {},,public:,    static Singleton* get() {,        Singleton* inst = instance.load(std::memory_order_acquire);,        if (!inst) {,            std::lock_guard lock(init_mutex);,            inst = instance.load(std::memory_order_relaxed);,            if (!inst) {,                inst = new Singleton();,                instance.store(inst, std::memory_order_release);,            },        },        return inst;,    },};,,std::atomic<Singleton*> Singleton::instance(nullptr);,std::mutex Singleton::init_mutex;,\n\n// ── Memory order comparison ─────────────────────────,// memory_order_relaxed: only atomicity, no sync,std::atomic<int> relaxed(0);,relaxed.fetch_add(1, std::memory_order_relaxed);,\n\n// memory_order_acquire: load acquires, makes writes visible,int val = relaxed.load(std::memory_order_acquire);,\n\n// memory_order_release: store releases, makes prior writes visible,relaxed.store(42, std::memory_order_release);,\n\n// memory_order_acq_rel: both acquire and release,relaxed.exchange(99, std::memory_order_acq_rel);,\n\n// memory_order_seq_cst: sequential consistency (default, slowest),// Total order of all seq_cst operations across threads,std::atomic<int> seqcst(0);,seqcst.store(1);  // defaults to seq_cst,\n\n// ── Lock-free check ────────────────────────────────,std::atomic<int> lock_free_int;,if (lock_free_int.is_lock_free()) {,    std::cout << \"Uses atomic instructions (fast)\\n\";,} else {,    std::cout << \"Uses mutex (slow)\\n\";,}"
                  }
        ],
        tips: [
                  "Default memory_order_seq_cst is safe but slow — use acquire/release when you understand the synchronization model.",
                  "Acquire on load and release on store create one-way visibility — common in lock-free data structures.",
                  "memory_order_relaxed for counter increments where ordering doesn't matter (e.g., statistics).",
                  "Double-checked locking pattern: acquire on check, release on write to minimize lock contention."
        ],
        mistake: "Using atomic<T> without understanding memory orders — defaulting to seq_cst everywhere is safe but pessimistic. Profile first, optimize second.",
        shorthand: {
          verbose: "std::atomic<int> x;\nx.store(42);\nint val = x.load();",
          concise: "x.store(42, std::memory_order_release);\nint val = x.load(std::memory_order_acquire);",
        },
      },
      {
        id: "raii-advanced",
        fn: "RAII Advanced — ScopeGuard, Resource Handles, Cleanup Patterns",
        desc: "Master RAII: scope guards, cleanup functions, and exception-safe resource management.",
        category: "Memory",
        subtitle: "ScopeGuard, RAII handle, destructor cleanup, exception safety, std::unique_ptr as handle",
        signature: "ScopeGuard(cleanup_fn)  |  std::unique_ptr with deleter  |  constructor/destructor pair",
        descLong: "RAII (Resource Acquisition Is Initialization) guarantees resource cleanup via destructors. ScopeGuard pattern executes cleanup functions in destructor. Using std::unique_ptr with custom deleters provides RAII for any resource. Exception safety requires proper RAII: acquired resources cleanup even if exceptions throw. Essential for exception-safe code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of RAII Advanced — ScopeGuard, Resource Handles, Cleanup Patterns — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <memory>\n#include <iostream>\n#include <utility>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of RAII Advanced — ScopeGuard, Resource Handles, Cleanup Patterns — common patterns you'll see in production.\n// APPROACH  - Combine RAII Advanced — ScopeGuard, Resource Handles, Cleanup Patterns with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── ScopeGuard — execute function on exit ──────────\ntemplate<typename Func>\nclass ScopeGuard {\n    Func cleanup;\n    bool active = true;\n\npublic:\n    explicit ScopeGuard(Func f) : cleanup(f) {}\n\n    ~ScopeGuard() {\n        if (active) cleanup();\n    }\n\n    void release() { active = false; }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of RAII Advanced — ScopeGuard, Resource Handles, Cleanup Patterns — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Prevent copying,    ScopeGuard(const ScopeGuard&) = delete;,    ScopeGuard& operator=(const ScopeGuard&) = delete;,\n\n    // Allow moving,    ScopeGuard(ScopeGuard&& other) noexcept : cleanup(std::move(other.cleanup)) {,        other.release();,    },};,,template<typename Func>,auto make_guard(Func f) {,    return ScopeGuard<Func>(f);,},\n\n// Usage,int main_scope() {,    int* ptr = new int(42);,    auto guard = make_guard([ptr] { delete ptr; });  // cleanup on exit,,    std::cout << *ptr << \"\\n\";,    return 0;  // guard destructor calls cleanup,},\n\n// ── ScopeGuard with multiple resources ──────────────,class ScopedLock {,    int resource_id;,,public:,    explicit ScopedLock(int id) : resource_id(id) {,        std::cout << \"Acquiring \" << id << \"\\n\";,    },,    ~ScopedLock() {,        std::cout << \"Releasing \" << resource_id << \"\\n\";,    },};,,void multi_resource() {,    ScopedLock lock1(1);,    ScopedLock lock2(2);,    // Destructors called in reverse order (2, 1) on scope exit,},\n\n// ── unique_ptr as RAII handle ──────────────────────,class Handle {,    int id;,,public:,    Handle(int id) : id(id) {,        std::cout << \"Handle \" << id << \" created\\n\";,    },    ~Handle() {,        std::cout << \"Handle \" << id << \" destroyed\\n\";,    },};,,void use_handle() {,    auto handle = std::make_unique<Handle>(1);,    // Use handle...,    // Automatically destroyed at end of scope,},\n\n// ── RAII wrapper for FILE ───────────────────────────,class File {,    FILE* file_ptr;,,public:,    explicit File(const char* path, const char* mode) {,        file_ptr = fopen(path, mode);,        if (!file_ptr) throw std::runtime_error(\"Cannot open file\");,    },,    ~File() {,        if (file_ptr) fclose(file_ptr);,    },,    FILE* get() { return file_ptr; },\n\n    // Prevent copying,    File(const File&) = delete;,    File& operator=(const File&) = delete;,\n\n    // Allow moving,    File(File&& other) noexcept : file_ptr(other.file_ptr) {,        other.file_ptr = nullptr;,    },};,\n\n// ── Exception-safe RAII ─────────────────────────────,class ResourceManager {,    std::vector<int*> resources;,,public:,    void add_resource(int value) {,        int* res = new int(value);,        try {,            resources.push_back(res);  // might throw,        } catch (...) {,            delete res;  // cleanup on exception,            throw;,        },    },,    ~ResourceManager() {,        for (auto* res : resources) {,            delete res;,        },    },};,\n\n// Better: use smart pointers,class SafeResourceManager {,    std::vector<std::unique_ptr<int>> resources;,,public:,    void add_resource(int value) {,        resources.push_back(std::make_unique<int>(value));,        // No manual cleanup needed — unique_ptr handles it,    },    // Destructor automatically cleans up all unique_ptrs,};,\n\n// ── RAII for multiple ordered cleanups ──────────────,class MultiStepAcquisition {,    int step1_resource = 0;,    int step2_resource = 0;,,public:,    void acquire() {,        step1_resource = 1;  // acquire step 1,        try {,            step2_resource = 2;  // acquire step 2,        } catch (...) {,            // Only step 1 was acquired, cleanup only it,            release_step1();,            throw;,        },    },,private:,    void release_step1() { step1_resource = 0; },    void release_step2() { step2_resource = 0; },,public:,    ~MultiStepAcquisition() {,        // Cleanup in reverse order,        if (step2_resource) release_step2();,        if (step1_resource) release_step1();,    },};,\n\n// ── RAII with custom deleter for any resource ──────,struct SQLiteDB {};  // Stub,SQLiteDB* sqlite_open(const char*) { return new SQLiteDB(); },void sqlite_close(SQLiteDB* db) { delete db; },,auto db = std::unique_ptr<SQLiteDB, decltype(&sqlite_close)>(,    sqlite_open(\"data.db\"), &sqlite_close,);,// db closed automatically,\n\n// ── Combining multiple guards ──────────────────────,template<typename... Guards>,class MultiGuard {,    std::tuple<Guards...> guards;,,public:,    template<typename... Funcs>,    MultiGuard(Funcs&&... funcs) : guards(std::forward<Funcs>(funcs)...) {},\n\n    // Tuple's destructor handles all guards,};,\n\n// ── Deferred action (simple guard) ──────────────────,auto defer = [](auto f) {,    struct Deferred { ~Deferred() { f(); } };,    return std::unique_ptr<Deferred>(new Deferred());,};,,void cleanup_example() {,    auto _ = defer([] { std::cout << \"Cleanup on exit\\n\"; });,    // Prints \"Cleanup on exit\" at scope exit,}"
                  }
        ],
        tips: [
                  "RAII guarantees cleanup even if exceptions throw — use it for all resource acquisition.",
                  "std::unique_ptr with custom deleters is your RAII tool for non-memory resources.",
                  "ScopeGuard pattern is perfect for cleanup functions that don't fit in a class destructor.",
                  "Always define move constructors for RAII types to enable return-by-value and smart pointer storage."
        ],
        mistake: "Relying on explicit cleanup calls (close(), release()) instead of RAII — RAII guarantees cleanup via destructors, even on exceptions.",
        shorthand: {
          verbose: "FILE* f = fopen(\"data.txt\", \"r\");\ntry { /* use f */ }\ncatch (...) { fclose(f); throw; }\nfclose(f);",
          concise: "ScopeGuard guard([f] { fclose(f); });\n// file closes automatically",
        },
      },
      {
        id: "stack-heap",
        fn: "Stack vs Heap — Layout, Performance, and Tradeoffs",
        desc: "Understand stack allocation, heap allocation, std::array vs std::vector, and when to use each.",
        category: "Memory",
        subtitle: "stack frame, heap fragmentation, alloca, VLAs, std::array, std::vector, memory layout",
        signature: "int arr[10];  |  std::array<int, 10>  |  std::vector<int>  |  alloca(size)",
        descLong: "Stack allocation (T arr[N]) is fast but fixed-size and limited. Heap allocation (new T[N], std::vector) is flexible but slower and fragmented. std::array (compile-time size) is zero-overhead, stored on stack. std::vector (runtime size) is flexible but heap-allocated. Stack frame layout: parameters, return address, local variables. Understanding this improves cache locality and performance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Stack vs Heap — Layout, Performance, and Tradeoffs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <array>\n#include <cstring>\n#include <chrono>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Stack vs Heap — Layout, Performance, and Tradeoffs — common patterns you'll see in production.\n// APPROACH  - Combine Stack vs Heap — Layout, Performance, and Tradeoffs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Stack allocation (fixed size) ───────────────────\n{\n    int arr[10];           // 10 ints on stack, fast allocation/deallocation\n    arr[0] = 42;\n    // Automatically freed at scope end\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Stack vs Heap — Layout, Performance, and Tradeoffs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── std::array (fixed size, zero overhead) ─────────,{,    std::array<int, 10> arr;  // same as int[10] but with STL interface,    arr[0] = 42;,    std::cout << arr.size() << \"\\n\";  // .size(), .data(), iterators, etc.,},\n\n// ── std::vector (dynamic size, heap) ────────────────,{,    std::vector<int> v;,    v.push_back(1);,    v.push_back(2);,    v.push_back(3);,    // Heap-allocated, grows as needed,    // Automatic cleanup via destructor,},\n\n// ── Stack frame layout (conceptual) ─────────────────,void show_stack_layout(int param1, double param2) {,    // Stack grows downward (on most architectures),    // [param1] <- high address,    // [param2],    // [return address],    // [local var1] <- low address (more recently allocated),    // [local var2],,    int local_var1 = 10;,    double local_var2 = 3.14;,\n\n    // local_var2 and local_var1 are adjacent in memory (likely),},\n\n// ── Vector memory growth (doubling) ─────────────────,void vector_growth() {,    std::vector<int> v;,    std::cout << \"Initial capacity: \" << v.capacity() << \"\\n\";,,    for (int i = 0; i < 100; ++i) {,        if (v.capacity() != v.size()) {,            std::cout << \"Reallocation at size \" << v.size() << \"\\n\";,        },        v.push_back(i);,    },    // Usually: 0 -> 1 -> 2 -> 4 -> 8 -> 16 -> 32 -> 64 -> 128,},\n\n// ── Cache locality: stack vs heap ──────────────────,void cache_comparison() {,    // Stack: likely contiguous, cache-friendly,    std::array<int, 1000> stack_arr;,    for (int i = 0; i < 1000; ++i) {,        stack_arr[i] = i;,    },\n\n    // Heap: might be fragmented, less cache-friendly,    std::vector<int> heap_vec(1000);,    for (int i = 0; i < 1000; ++i) {,        heap_vec[i] = i;,    },\n\n    // In practice, freshly allocated vectors are also contiguous,},\n\n// ── alloca (variable-length on stack) ───────────────,// alloca is non-standard but widely supported,void use_alloca(int size) {,    int* arr = static_cast<int*>(alloca(size * sizeof(int)));,    // arr is on the stack, automatically freed at function exit,    // WARNING: no overflow protection, can cause stack overflow,},\n\n// ── Comparing allocation strategies ─────────────────,void allocation_comparison() {,    // Fixed size known at compile time: std::array,    std::array<int, 100> fixed;  // zero overhead, stack, fast,\n\n    // Dynamic size, long-lived: std::vector,    std::vector<int> dynamic;    // heap, can grow, RAII cleanup,\n\n    // Temporary variable size (modern C++17): optional<array>,    // (C++17 has no VLAs, but you can use std::vector),    std::vector<int> variable;   // closest to VLA behavior,\n\n    // Very large allocations: must use heap,    std::vector<int> large(1000000);  // 4MB, would overflow stack,},\n\n// ── Performance: stack vs heap ──────────────────────,void perf_stack_vs_heap() {,    auto bench_stack = [](int iterations) {,        auto start = std::chrono::high_resolution_clock::now();,        for (int i = 0; i < iterations; ++i) {,            int arr[100];  // stack allocation, very fast,            for (int j = 0; j < 100; ++j) arr[j] = j;,        },        auto end = std::chrono::high_resolution_clock::now();,        return std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();,    };,,    auto bench_heap = [](int iterations) {,        auto start = std::chrono::high_resolution_clock::now();,        for (int i = 0; i < iterations; ++i) {,            std::vector<int> vec(100);  // heap allocation,            for (int j = 0; j < 100; ++j) vec[j] = j;,        },        auto end = std::chrono::high_resolution_clock::now();,        return std::chrono::duration_cast<std::chrono::microseconds>(end - start).count();,    };,,    std::cout << \"Stack (us): \" << bench_stack(10000) << \"\\n\";,    std::cout << \"Heap (us): \" << bench_heap(10000) << \"\\n\";,    // Stack is typically 10-100x faster for small allocations,},\n\n// ── Stack size limits ───────────────────────────────,void stack_limits() {,    // Typical stack: 1-8 MB,    // int arr[1000000];  // might overflow stack (4 MB on 32-bit),\n\n    // Safer: use heap for large allocations,    std::vector<int> vec(1000000);  // 4 MB on heap, safe,},\n\n// ── Memory layout inspection ────────────────────────,void memory_layout() {,    int stack_var = 42;,    int* heap_var = new int(99);,,    std::cout << \"Stack var address: \" << &stack_var << \"\\n\";,    std::cout << \"Heap var address: \" << heap_var << \"\\n\";,    std::cout << \"Code address (function): \" << reinterpret_cast<void*>(memory_layout) << \"\\n\";,\n\n    // Typical layout (highest to lowest address):,    // [Code/Text segment] (functions),    // [Initialized data],    // [Uninitialized data (BSS)],    // [Heap] <- grows upward,    // ...,    // [Stack] <- grows downward,    // [Environment/Arguments],,    delete heap_var;,}"
                  }
        ],
        tips: [
                  "Use std::array for fixed-size, compile-time-known sizes — zero overhead, cache-friendly.",
                  "Use std::vector for dynamic sizes — convenient and reasonable performance.",
                  "Stack allocation is much faster but limited in size (1-8 MB typical).",
                  "Heap allocation allows arbitrarily large sizes but may fragment and has allocation/deallocation overhead."
        ],
        mistake: "Using std::vector for tiny, frequently-allocated objects — consider std::array or object pools for higher performance.",
        shorthand: {
          verbose: "std::vector<int> v;\nv.push_back(1);\nv.push_back(2);",
          concise: "std::array<int, 2> arr = {1, 2};  // fixed, faster",
        },
      },
    ],
  },

  // ── Section 3: C++20 Coroutines ─────────────────────────────────────────
  {
    id: "coroutines",
    title: "C++20 Coroutines",
    entries: [
      {
        id: "coroutine-basics",
        fn: "C++20 Coroutines — co_await, co_yield, co_return",
        desc: "Fundamental coroutine mechanisms: suspension points, resumption, and promise types.",
        category: "Coroutines",
        subtitle: "co_await, co_yield, co_return, coroutine_handle, promise_type, suspend_always",
        signature: "co_await awaitable  |  co_yield value  |  co_return value",
        descLong: "C++20 coroutines are stackless async primitives. co_await suspends coroutine execution until awaited value is ready. co_yield suspends and produces a value. co_return completes the coroutine. A promise_type defines coroutine behavior (initial_suspend, final_suspend, return_value). Coroutine state lives in a frame on the heap. Unlike threads, coroutines are lightweight and require explicit scheduling. Use coroutine libraries (cppcoro, boost::asio) for production.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++20 Coroutines — co_await, co_yield, co_return — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++20 Coroutines — co_await, co_yield, co_return — common patterns you'll see in production.\n// APPROACH  - Combine C++20 Coroutines — co_await, co_yield, co_return with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simple coroutine: generator ────────────────────\ntemplate<typename T>\nstruct Generator {\n    struct promise_type {\n        T current_value;\n\n        auto yield_value(T value) {\n            current_value = value;\n            return std::suspend_always{};\n        }\n\n        Generator get_return_object() {\n            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};\n        }\n\n        auto initial_suspend() { return std::suspend_always{}; }\n        auto final_suspend() noexcept { return std::suspend_always{}; }\n        void return_void() {}\n        void unhandled_exception() { std::terminate(); }\n    };\n\n    std::coroutine_handle<promise_type> handle;\n\n    ~Generator() {\n        if (handle) handle.destroy();\n    }\n\n    bool move_next() {\n        if (handle.done()) return false;\n        handle.resume();\n        return !handle.done();\n    }\n\n    T current_value() const {\n        return handle.promise().current_value;\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++20 Coroutines — co_await, co_yield, co_return — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Usage of generator coroutine,Generator<int> count_to_n(int n) {,    for (int i = 1; i <= n; ++i) {,        co_yield i;,    },},,void test_generator() {,    auto gen = count_to_n(5);,    while (gen.move_next()) {,        std::cout << gen.current_value() << \" \";,    },    std::cout << \"\\n\";  // prints: 1 2 3 4 5,},\n\n// ── Simple task: co_return ─────────────────────────,template<typename T>,struct Task {,    struct promise_type {,        T result;,        bool ready = false;,,        Task get_return_object() {,            return Task{std::coroutine_handle<promise_type>::from_promise(*this)};,        },,        auto initial_suspend() { return std::suspend_never{}; },        auto final_suspend() noexcept { return std::suspend_never{}; },        void return_value(T value) { result = value; ready = true; },        void unhandled_exception() { std::terminate(); },    };,,    std::coroutine_handle<promise_type> handle;,,    T get() const {,        while (!handle.promise().ready) {,            // spin (simplified; real code needs scheduler),        },        return handle.promise().result;,    },};,,Task<int> simple_task() {,    co_return 42;,},,void test_task() {,    auto task = simple_task();,    std::cout << task.get() << \"\\n\";  // 42,},\n\n// ── Awaitable (co_await) ────────────────────────────,struct SimpleAwaitable {,    bool await_ready() const { return false; },    void await_suspend(std::coroutine_handle<> h) {,        std::cout << \"Suspending coroutine\\n\";,    },    int await_resume() { return 42; },};,,Task<int> awaiting_task() {,    SimpleAwaitable awaitable;,    int value = co_await awaitable;,    std::cout << \"Resumed with: \" << value << \"\\n\";,    co_return value;,}"
                  }
        ],
        tips: [
                  "Coroutine frame is heap-allocated — the compiler manages it, but co_await can specify the executor.",
                  "initial_suspend() and final_suspend() control entry/exit behavior.",
                  "Promise type is the core — define how your coroutine behaves and what it returns.",
                  "Use established libraries (cppcoro, libcoro) instead of writing promise_type from scratch."
        ],
        mistake: "Writing promise_type manually — it's error-prone. Use cppcoro::task<T> or boost::asio for tested, optimized implementations.",
        shorthand: {
          verbose: "std::future<int> async_work() {\n    return std::async([](){ return 42; });\n}",
          concise: "Task<int> async_work() {\n    co_return 42;\n}",
        },
      },
      {
        id: "coroutine-generator",
        fn: "Generator Coroutine — Lazy Evaluation",
        desc: "Implement generators using co_yield for lazy, on-demand value production.",
        category: "Coroutines",
        subtitle: "Generator<T>, co_yield, lazy evaluation, on-demand computation",
        signature: "Generator<int> generate() { co_yield 1; co_yield 2; }",
        descLong: "Generator coroutines (co_yield) lazily produce values without buffering. Each co_yield suspends, allowing the caller to retrieve the value and resume. Ideal for infinite sequences, stream processing, and avoiding unnecessary computation. C++23 standardizes std::generator<T>.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generator Coroutine — Lazy Evaluation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <iostream>\n\ntemplate<typename T>\nstruct Generator {\n    struct promise_type {\n        T value_;\n        bool done_ = false;\n\n        auto yield_value(T value) {\n            value_ = value;\n            return std::suspend_always{};\n        }\n\n        Generator get_return_object() {\n            return Generator{std::coroutine_handle<promise_type>::from_promise(*this)};\n        }\n\n        auto initial_suspend() { return std::suspend_always{}; }\n        auto final_suspend() noexcept { return std::suspend_always{}; }\n        void return_void() { done_ = true; }\n        void unhandled_exception() { std::terminate(); }\n    };\n\n    std::coroutine_handle<promise_type> h;\n\n    ~Generator() { if (h) h.destroy(); }\n\n    bool next() {\n        if (h.done()) return false;\n        h.resume();\n        return !h.done();\n    }\n\n    T value() const { return h.promise().value_; }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generator Coroutine — Lazy Evaluation — common patterns you'll see in production.\n// APPROACH  - Combine Generator Coroutine — Lazy Evaluation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Fibonacci generator ─────────────────────────────\nGenerator<int> fibonacci(int max) {\n    int a = 0, b = 1;\n    for (int i = 0; i < max; ++i) {\n        co_yield a;\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n}\n\nvoid test_fibonacci() {\n    auto gen = fibonacci(10);\n    while (gen.next()) {\n        std::cout << gen.value() << \" \";\n    }\n    std::cout << \"\\n\";\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generator Coroutine — Lazy Evaluation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Infinite sequence (conceptually) ────────────────,Generator<int> infinite_counter(int start) {,    for (int i = start; ; ++i) {,        co_yield i;,    },},,void test_infinite() {,    auto gen = infinite_counter(0);,    for (int i = 0; i < 5 && gen.next(); ++i) {,        std::cout << gen.value() << \" \";,    },    std::cout << \"\\n\";,},\n\n// ── Range generator ────────────────────────────────,Generator<int> range(int start, int end) {,    for (int i = start; i < end; ++i) {,        co_yield i;,    },},,void test_range() {,    for (auto gen = range(1, 6); gen.next();) {,        std::cout << gen.value() << \" \";,    },    std::cout << \"\\n\";,}"
                  }
        ],
        tips: [
                  "Generators avoid buffering entire sequences — ideal for large or infinite streams.",
                  "co_yield suspends after producing a value — caller resumes to get next value.",
                  "C++23 will standardize std::generator<T> — use cppcoro::generator for C++20."
        ],
        mistake: "Buffering an entire sequence in a vector when a generator would produce on-demand and save memory.",
        shorthand: {
          verbose: "std::vector<int> range(int n) {\n    std::vector<int> result;\n    for (int i = 1; i <= n; ++i) result.push_back(i);\n    return result;\n}",
          concise: "Generator<int> range(int n) {\n    for (int i = 1; i <= n; ++i) co_yield i;\n}",
        },
      },
      {
        id: "coroutine-task",
        fn: "Task Coroutine — Async/Await Pattern",
        desc: "Implement task-based coroutines for async operations with co_await chaining.",
        category: "Coroutines",
        subtitle: "Task<T>, co_await chaining, async composition, awaitable objects",
        signature: "Task<int> async_op() { co_return co_await other_task(); }",
        descLong: "Task coroutines represent async work. co_await another task suspends until it completes. Tasks compose via co_await chaining. Essential for async I/O, parallel operations, and async/await-style programming. Requires a scheduler/executor to actually run tasks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Task Coroutine — Async/Await Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <iostream>\n\ntemplate<typename T>\nstruct Task {\n    struct promise_type {\n        T result;\n\n        Task get_return_object() {\n            return Task{std::coroutine_handle<promise_type>::from_promise(*this)};\n        }\n\n        auto initial_suspend() { return std::suspend_never{}; }\n        auto final_suspend() noexcept { return std::suspend_never{}; }\n        void return_value(T value) { result = value; }\n        void unhandled_exception() { std::terminate(); }\n    };\n\n    std::coroutine_handle<promise_type> h;\n\n    T result() const { return h.promise().result; }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Task Coroutine — Async/Await Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Task Coroutine — Async/Await Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Awaitable for Task ──────────────────────────────\ntemplate<typename T>\nstruct TaskAwaitable {\n    Task<T>& task;\n\n    bool await_ready() const { return false; }\n    void await_suspend(std::coroutine_handle<> h) {\n        // In a real implementation, schedule task resumption\n    }\n    T await_resume() { return task.result(); }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Task Coroutine — Async/Await Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Simple async task ───────────────────────────────,Task<int> async_computation(int x) {,    std::cout << \"Computing \" << x << \"\\n\";,    co_return x * 2;,},,Task<int> combine_results() {,    int a = co_await async_computation(5);,    int b = co_await async_computation(10);,    co_return a + b;,},,void test_tasks() {,    // In real code, this would need a scheduler/executor,    // This is simplified to just show structure,}"
                  }
        ],
        tips: [
                  "Tasks require a scheduler to actually execute — don't use bare coroutines for production.",
                  "co_await on another task suspends until it completes.",
                  "Combine multiple tasks via co_await chaining."
        ],
        mistake: "Using coroutines without a scheduler — tasks need an executor to actually run concurrently.",
        shorthand: {
          verbose: "std::future<int> fetchA = fetch(\"a\");\nstd::future<int> fetchB = fetch(\"b\");\nint sum = fetchA.get() + fetchB.get();",
          concise: "int sum = co_await fetch(\"a\") + co_await fetch(\"b\");",
        },
      },
      {
        id: "coroutine-async-io",
        fn: "Async I/O with Coroutines — Network & File Operations",
        desc: "Use coroutines for high-performance async I/O without thread overhead.",
        category: "Coroutines",
        subtitle: "co_await async_read, co_await async_write, io_context, boost::asio coroutines",
        signature: "co_await async_read(socket, buffer)  |  co_await async_write(socket, data)",
        descLong: "Coroutines enable async I/O without threads. boost::asio provides co_spawn, async_read, async_write. When I/O is ready, the coroutine resumes. Ideal for servers handling thousands of concurrent connections without thread overhead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Async I/O with Coroutines — Network & File Operations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Async I/O with Coroutines — Network & File Operations — common patterns you'll see in production.\n// APPROACH  - Combine Async I/O with Coroutines — Network & File Operations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Simplified async_read pattern ──────────────────\ntemplate<typename T>\nstruct AsyncRead {\n    T& buffer;\n\n    bool await_ready() const { return false; }\n\n    void await_suspend(std::coroutine_handle<> h) {\n        // Register with I/O scheduler, resume on ready\n        std::cout << \"Scheduling async read\\n\";\n    }\n\n    void await_resume() {\n        std::cout << \"Read complete\\n\";\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Async I/O with Coroutines — Network & File Operations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Async socket operation ──────────────────────────,struct Socket {,    void async_read(char* buf, int size) {,        // Non-blocking read, schedules completion,    },};,\n\n// Example coroutine using async operations,// Task<void> handle_connection(Socket sock) {,//     char buffer[1024];,//     co_await AsyncRead<char[]>{buffer};,//     std::cout << \"Received data\\n\";,// }"
                  }
        ],
        tips: [
                  "Coroutine-based I/O avoids thread overhead — one coroutine per connection vs one thread per connection.",
                  "boost::asio provides production-ready async I/O coroutines.",
                  "I/O scheduler (executor) wakes coroutines when I/O is ready."
        ],
        mistake: "Using threads for every connection when coroutines would handle more efficiently.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Thread-based (wasteful)\nstd::thread([](){ socket.recv(buffer); });\n// More explicit but longer",
          concise: "// Coroutine-based (efficient)\nco_await async_read(socket, buffer);",
        },
      },
      {
        id: "coroutine-promise",
        fn: "Promise Type — Customizing Coroutine Behavior",
        desc: "Write promise_type to control coroutine creation, suspension, and completion.",
        category: "Coroutines",
        subtitle: "promise_type interface, initial_suspend, final_suspend, return_value, unhandled_exception",
        signature: "struct promise_type { get_return_object(), initial_suspend(), final_suspend() }",
        descLong: "Promise type defines coroutine semantics. get_return_object() creates the return value. initial_suspend()/final_suspend() control entry/exit. return_value()/return_void() capture results. unhandled_exception() handles uncaught exceptions. Understanding promise_type is essential for custom coroutine types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Promise Type — Customizing Coroutine Behavior — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <coroutine>\n#include <exception>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Promise Type — Customizing Coroutine Behavior — common patterns you'll see in production.\n// APPROACH  - Combine Promise Type — Customizing Coroutine Behavior with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Custom async task with promise_type ────────────\ntemplate<typename T>\nclass AsyncTask {\npublic:\n    struct promise_type {\n        T value;\n        std::exception_ptr exception;\n\n        AsyncTask get_return_object() {\n            return AsyncTask{std::coroutine_handle<promise_type>::from_promise(*this)};\n        }\n\n        auto initial_suspend() {\n            std::cout << \"Task starting\\n\";\n            return std::suspend_never{};\n        }\n\n        auto final_suspend() noexcept {\n            std::cout << \"Task ending\\n\";\n            return std::suspend_never{};\n        }\n\n        void return_value(T val) {\n            value = val;\n        }\n\n        void unhandled_exception() {\n            exception = std::current_exception();\n        }\n    };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Promise Type — Customizing Coroutine Behavior — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nstd::coroutine_handle<promise_type> handle;\n\n    T get() {\n        if (handle.promise().exception) {\n            std::rethrow_exception(handle.promise().exception);\n        }\n        return handle.promise().value;\n    }\n\n    ~AsyncTask() { if (handle) handle.destroy(); }\n};\n\nAsyncTask<int> example_task() {\n    std::cout << \"Inside coroutine\\n\";\n    co_return 42;\n}\n\nvoid test_promise() {\n    auto task = example_task();\n    std::cout << task.get() << \"\\n\";\n}"
                  }
        ],
        tips: [
                  "initial_suspend(suspend_always) delays execution until caller resumes.",
                  "initial_suspend(suspend_never) starts execution immediately.",
                  "Store results in promise; return via get_return_object().",
                  "Capture exceptions in unhandled_exception(); re-throw in get()."
        ],
        mistake: "Writing promise_type without exception handling — unhandled_exception() is critical.",
        shorthand: {
          verbose: "// Manual state management\nclass AsyncOp {\n    std::coroutine_handle<> handle;\npublic:\n    void run() { handle.resume(); }\n};",
          concise: "// Promise defines behavior\nstruct promise_type {\n    AsyncOp get_return_object() { return AsyncOp{...}; }\n};",
        },
      },
    ],
  },
]

export default { meta, sections }
