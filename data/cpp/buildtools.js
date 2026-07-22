export const meta = {
  "id": "buildtools",
  "label": "Build Tools & Debugging",
  "icon": "⚡",
  "description": "C++ build systems, CMake, package managers, sanitizers, debugging, and profiling."
}

export const sections = [

  // ── Section 1: CMake & Build Systems ─────────────────────────────────────────
  {
    id: "cmake",
    title: "CMake & Build Systems",
    entries: [
      {
        id: "cmake-fundamentals",
        fn: "CMake — Modern Project Configuration",
        desc: "Configure C++ builds with CMake: targets, properties, dependencies, and modern best practices (target-based approach).",
        category: "Build",
        subtitle: "CMakeLists.txt, add_executable, target_link_libraries, FetchContent",
        signature: "cmake_minimum_required(VERSION 3.20)  |  project(MyApp LANGUAGES CXX)  |  add_executable(app main.cpp)",
        descLong: "CMake is the de facto C++ build system generator. Modern CMake (3.x) uses a target-based approach: define targets (executables, libraries), set their properties (compile features, include dirs), and link dependencies. Avoid global commands like include_directories() — use target_* versions. FetchContent downloads and builds dependencies automatically. Presets standardize build configurations across teams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CMake — Modern Project Configuration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── CMakeLists.txt — modern project setup ───────────\ncmake_minimum_required(VERSION 3.20)\nproject(MyApp\n  VERSION 1.0.0\n  LANGUAGES CXX\n  DESCRIPTION \"My C++ Application\"\n)\n\n# ── Set C++ standard on the target (not globally) ───\n# Don't: set(CMAKE_CXX_STANDARD 20)  ← global, leaks\n# Do: set it per-target (below)\n\n# ── Main executable ─────────────────────────────────\nadd_executable(myapp\n  src/main.cpp\n  src/app.cpp\n  src/utils.cpp\n)\n\ntarget_compile_features(myapp PRIVATE cxx_std_20)\n\ntarget_include_directories(myapp\n  PRIVATE\n    src/           # internal headers\n  PUBLIC\n    include/       # public API headers\n)\n\n# ── Create a library ────────────────────────────────\nadd_library(mylib STATIC\n  src/lib/core.cpp\n  src/lib/parser.cpp\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CMake — Modern Project Configuration — common patterns you'll see in production.\n// APPROACH  - Combine CMake — Modern Project Configuration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\ntarget_compile_features(mylib PUBLIC cxx_std_20)\ntarget_include_directories(mylib PUBLIC include/)\n\n# Link library to executable\ntarget_link_libraries(myapp PRIVATE mylib)\n\n# ── Compiler warnings (per-target) ──────────────────\ntarget_compile_options(myapp PRIVATE\n  $<$<CXX_COMPILER_ID:MSVC>:/W4 /WX>\n  $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra -Wpedantic -Werror>\n)\n\n# ── FetchContent — download dependencies ────────────\ninclude(FetchContent)\n\nFetchContent_Declare(\n  fmt\n  GIT_REPOSITORY https://github.com/fmtlib/fmt.git\n  GIT_TAG        10.2.1\n)\n\nFetchContent_Declare(\n  googletest\n  GIT_REPOSITORY https://github.com/google/googletest.git\n  GIT_TAG        v1.14.0\n)\n\nFetchContent_MakeAvailable(fmt googletest)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CMake — Modern Project Configuration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\ntarget_link_libraries(myapp PRIVATE fmt::fmt)\n\n# ── Testing with CTest ─────────────────────────────\nenable_testing()\n\nadd_executable(tests\n  tests/test_main.cpp\n  tests/test_parser.cpp\n)\ntarget_link_libraries(tests PRIVATE mylib GTest::gtest_main)\n\ninclude(GoogleTest)\ngtest_discover_tests(tests)\n\n# ── Install rules ───────────────────────────────────\ninstall(TARGETS myapp RUNTIME DESTINATION bin)\ninstall(DIRECTORY include/ DESTINATION include)\n\n# ── Build commands ──────────────────────────────────\n# cmake -B build -DCMAKE_BUILD_TYPE=Release\n# cmake --build build --parallel\n# ctest --test-dir build --output-on-failure\n# cmake --install build --prefix /usr/local"
                  }
        ],
        tips: [
                  "Always use target_* commands (target_link_libraries, target_include_directories) — global commands leak settings to all targets.",
                  "FetchContent replaces git submodules for most dependencies — it downloads, configures, and builds them automatically.",
                  "Use generator expressions like $<CXX_COMPILER_ID:MSVC> for cross-platform compiler flags.",
                  "cmake -B build separates source and build directories — never build in the source tree."
        ],
        mistake: "Using include_directories() and link_libraries() globally — they affect ALL targets in the project. Use target_include_directories() and target_link_libraries() which scope to specific targets.",
        shorthand: {
          verbose: "cmake_minimum_required(VERSION 3.10)\nadd_executable(myapp main.cpp)\ntarget_link_libraries(myapp pthread)",
          concise: "cmake -B build && cmake --build build",
        },
      },
      {
        id: "cmake-presets",
        fn: "CMake Presets & Package Managers (vcpkg, Conan)",
        desc: "Standardize builds with CMake presets and manage C++ dependencies with vcpkg or Conan.",
        category: "Build",
        subtitle: "CMakePresets.json, vcpkg, conan, find_package",
        signature: "cmake --preset release  |  vcpkg install fmt  |  find_package(fmt REQUIRED)",
        descLong: "CMake presets (CMakePresets.json) standardize build configurations — debug, release, sanitizer builds — so every developer uses the same settings. vcpkg (Microsoft) and Conan (JFrog) are C++ package managers that provide pre-built binaries for thousands of libraries. vcpkg integrates seamlessly with CMake via toolchain files. Conan uses conanfile.txt/py for dependency specification. Both eliminate manual dependency management.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CMake Presets & Package Managers (vcpkg, Conan) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── CMakePresets.json ───────────────────────────────\n# {\n#   \"version\": 6,\n#   \"cmakeMinimumRequired\": { \"major\": 3, \"minor\": 25, \"patch\": 0 },\n#   \"configurePresets\": [\n#     {\n#       \"name\": \"default\",\n#       \"binaryDir\": \"build/default\",\n#       \"cacheVariables\": {\n#         \"CMAKE_CXX_STANDARD\": \"20\",\n#         \"CMAKE_EXPORT_COMPILE_COMMANDS\": \"ON\"\n#       }\n#     },\n#     {\n#       \"name\": \"release\",\n#       \"inherits\": \"default\",\n#       \"binaryDir\": \"build/release\",\n#       \"cacheVariables\": {\n#         \"CMAKE_BUILD_TYPE\": \"Release\",\n#         \"CMAKE_INTERPROCEDURAL_OPTIMIZATION\": \"ON\"\n#       }\n#     },\n#     {\n#       \"name\": \"debug\",\n#       \"inherits\": \"default\",\n#       \"binaryDir\": \"build/debug\",\n#       \"cacheVariables\": {\n#         \"CMAKE_BUILD_TYPE\": \"Debug\"\n#       }\n#     },\n#     {\n#       \"name\": \"asan\",\n#       \"inherits\": \"debug\",\n#       \"binaryDir\": \"build/asan\",\n#       \"cacheVariables\": {\n#         \"CMAKE_CXX_FLAGS\": \"-fsanitize=address,undefined -fno-omit-frame-pointer\"\n#       }\n#     }\n#   ],\n#   \"buildPresets\": [\n#     { \"name\": \"release\", \"configurePreset\": \"release\" },\n#     { \"name\": \"debug\",   \"configurePreset\": \"debug\" }\n#   ]\n# }\n#\n# Usage:\n# cmake --preset release\n# cmake --build --preset release"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CMake Presets & Package Managers (vcpkg, Conan) — common patterns you'll see in production.\n// APPROACH  - Combine CMake Presets & Package Managers (vcpkg, Conan) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── vcpkg integration ───────────────────────────────\n# Install vcpkg:\n# git clone https://github.com/microsoft/vcpkg.git\n# ./vcpkg/bootstrap-vcpkg.sh\n\n# vcpkg.json (manifest mode — preferred):\n# {\n#   \"dependencies\": [\n#     \"fmt\",\n#     \"spdlog\",\n#     \"nlohmann-json\",\n#     \"catch2\"\n#   ]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CMake Presets & Package Managers (vcpkg, Conan) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# }\n\n# In CMakeLists.txt:\nfind_package(fmt CONFIG REQUIRED)\nfind_package(spdlog CONFIG REQUIRED)\nfind_package(nlohmann_json CONFIG REQUIRED)\n\ntarget_link_libraries(myapp PRIVATE\n  fmt::fmt\n  spdlog::spdlog\n  nlohmann_json::nlohmann_json\n)\n\n# Build with vcpkg toolchain:\n# cmake -B build -DCMAKE_TOOLCHAIN_FILE=vcpkg/scripts/buildsystems/vcpkg.cmake\n\n# ── Conan integration ──────────────────────────────\n# conanfile.txt:\n# [requires]\n# fmt/10.2.1\n# spdlog/1.13.0\n# boost/1.84.0\n#\n# [generators]\n# CMakeDeps\n# CMakeToolchain\n#\n# Usage:\n# conan install . --output-folder=build --build=missing\n# cmake -B build -DCMAKE_TOOLCHAIN_FILE=build/conan_toolchain.cmake"
                  }
        ],
        tips: [
                  "CMakePresets.json eliminates \"works on my machine\" — every developer gets identical build configurations.",
                  "vcpkg manifest mode (vcpkg.json) tracks dependencies in version control — like package.json for C++.",
                  "CMAKE_EXPORT_COMPILE_COMMANDS=ON generates compile_commands.json — required for clangd IDE integration.",
                  "Use find_package(X CONFIG REQUIRED) with vcpkg/Conan — CONFIG mode uses package-provided CMake files."
        ],
        mistake: "Manually downloading and building dependencies — use vcpkg or Conan. They provide pre-built binaries, handle transitive dependencies, and integrate with CMake find_package().",
        shorthand: {
          verbose: "// Manual / verbose approach\ncmake -DCMAKE_BUILD_TYPE=Release -G \"Unix Makefiles\" .\n// More explicit but longer",
          concise: "cmake --preset release && cmake --build --preset release",
        },
      },
    ],
  },

  // ── Section 2: Debugging & Profiling ─────────────────────────────────────────
  {
    id: "debugging",
    title: "Debugging & Profiling",
    entries: [
      {
        id: "sanitizers",
        fn: "Sanitizers — AddressSanitizer, UBSan, ThreadSanitizer",
        desc: "Detect memory bugs, undefined behavior, and data races at runtime with compiler sanitizers.",
        category: "Debugging",
        subtitle: "-fsanitize=address, -fsanitize=undefined, -fsanitize=thread, Valgrind",
        signature: "-fsanitize=address,undefined -fno-omit-frame-pointer  |  valgrind --leak-check=full ./app",
        descLong: "Sanitizers are compiler-instrumented runtime checkers that catch bugs impossible to find by reading code. AddressSanitizer (ASan) detects buffer overflows, use-after-free, memory leaks, and stack buffer overflows. UndefinedBehaviorSanitizer (UBSan) catches signed overflow, null dereference, misaligned access. ThreadSanitizer (TSan) detects data races in multithreaded code. MemorySanitizer (MSan) finds use of uninitialized memory. Always develop with sanitizers enabled — they find bugs that tests alone miss.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sanitizers — AddressSanitizer, UBSan, ThreadSanitizer — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Compiler flags for sanitizers ────────────────────\n\n# AddressSanitizer (ASan) — memory errors\n# Detects: buffer overflow, use-after-free, double-free, memory leaks\n# Compile & link:\n# g++ -fsanitize=address -fno-omit-frame-pointer -g -O1 main.cpp -o app\n# clang++ -fsanitize=address -fno-omit-frame-pointer -g -O1 main.cpp -o app\n\n# UndefinedBehaviorSanitizer (UBSan)\n# Detects: signed overflow, null deref, misaligned access, shift overflow\n# g++ -fsanitize=undefined -g main.cpp -o app\n\n# Combine ASan + UBSan (recommended for development)\n# g++ -fsanitize=address,undefined -fno-omit-frame-pointer -g -O1 main.cpp -o app\n\n# ThreadSanitizer (TSan) — data races (cannot combine with ASan)\n# g++ -fsanitize=thread -g -O1 main.cpp -o app -pthread\n\n# ── CMake integration ───────────────────────────────\n# In CMakeLists.txt:\n# option(ENABLE_SANITIZERS \"Enable ASan+UBSan\" OFF)\n# if(ENABLE_SANITIZERS)\n#   target_compile_options(myapp PRIVATE\n#     -fsanitize=address,undefined -fno-omit-frame-pointer)\n#   target_link_options(myapp PRIVATE\n#     -fsanitize=address,undefined)\n# endif()\n#\n# cmake -B build -DENABLE_SANITIZERS=ON"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sanitizers — AddressSanitizer, UBSan, ThreadSanitizer — common patterns you'll see in production.\n// APPROACH  - Combine Sanitizers — AddressSanitizer, UBSan, ThreadSanitizer with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── What ASan catches ──────────────────────────────\n# 1. Heap buffer overflow\n#    int* p = new int[10];\n#    p[10] = 42;  // ASan: heap-buffer-overflow\n#\n# 2. Use after free\n#    int* p = new int(42);\n#    delete p;\n#    *p = 0;  // ASan: heap-use-after-free\n#\n# 3. Stack buffer overflow\n#    int arr[10];\n#    arr[11] = 0;  // ASan: stack-buffer-overflow\n#\n# 4. Memory leak (with leak detection enabled)\n#    int* p = new int[100];\n#    // never deleted — ASan: detected memory leaks\n\n# ── What UBSan catches ─────────────────────────────\n# 1. Signed integer overflow\n#    int x = INT_MAX;\n#    x + 1;  // UBSan: signed integer overflow\n#\n# 2. Null pointer dereference\n#    int* p = nullptr;\n#    *p;  // UBSan: null pointer dereference\n#\n# 3. Shift overflow\n#    1 << 33;  // UBSan: shift exponent is too large"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sanitizers — AddressSanitizer, UBSan, ThreadSanitizer — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Valgrind (alternative, no recompilation needed) ─\n# valgrind --leak-check=full --show-leak-kinds=all ./app\n# valgrind --tool=callgrind ./app  # profiling\n# valgrind --tool=helgrind ./app   # thread errors"
                  }
        ],
        tips: [
                  "Always develop with -fsanitize=address,undefined — it catches bugs that crash in production but pass tests.",
                  "-fno-omit-frame-pointer is essential with sanitizers — it produces readable stack traces in error reports.",
                  "TSan cannot be combined with ASan — run them as separate CI jobs or build presets.",
                  "Valgrind needs no recompilation but is 20-50x slower than sanitizers — use sanitizers for daily dev."
        ],
        mistake: "Only running sanitizers in CI, not during local development — the sooner you catch a memory bug, the easier it is to fix. Make ASan+UBSan your default debug build.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Compile with: g++ -fsanitize=address -g main.cpp\n// More explicit but longer",
          concise: "# In CMakeLists.txt:\ntarget_compile_options(myapp PRIVATE -fsanitize=address,undefined)\ntarget_link_options(myapp PRIVATE -fsanitize=address,undefined)",
        },
      },
      {
        id: "profiling-debugging",
        fn: "Profiling & Debugging Tools — gdb, perf, Tracy",
        desc: "Profile and debug C++ applications: gdb/lldb, perf, Tracy profiler, compiler optimizations, and benchmarking.",
        category: "Debugging",
        subtitle: "gdb, lldb, perf, Tracy, Google Benchmark, compiler explorer",
        signature: "gdb ./app  |  perf record ./app  |  perf report  |  benchmark::DoNotOptimize()",
        descLong: "Effective C++ development requires profiling and debugging tools. gdb/lldb are interactive debuggers for stepping through code, inspecting variables, and catching crashes. perf (Linux) profiles CPU usage, cache misses, and branch mispredictions. Tracy is a real-time frame profiler for games and performance-critical code. Google Benchmark provides micro-benchmarking with statistical analysis. Compiler Explorer (godbolt.org) shows generated assembly to understand optimization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Profiling & Debugging Tools — gdb, perf, Tracy — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── gdb / lldb quick reference ───────────────────────\n# Compile with debug info:\n# g++ -g -O0 main.cpp -o app\n\n# gdb ./app\n# (gdb) break main           # set breakpoint\n# (gdb) break file.cpp:42    # breakpoint at line\n# (gdb) run                  # start execution\n# (gdb) next                 # step over\n# (gdb) step                 # step into\n# (gdb) print var            # inspect variable\n# (gdb) print *ptr           # dereference pointer\n# (gdb) backtrace            # show call stack\n# (gdb) watch var            # break when var changes\n# (gdb) info locals          # show local variables\n# (gdb) continue             # resume execution\n# (gdb) thread apply all bt  # all thread backtraces\n\n# lldb ./app  (macOS default)\n# (lldb) b main              # breakpoint\n# (lldb) r                   # run\n# (lldb) n                   # next\n# (lldb) s                   # step\n# (lldb) p var               # print\n# (lldb) bt                  # backtrace\n# (lldb) frame variable      # local variables\n\n# ── perf (Linux) — CPU profiling ────────────────────\n# perf record -g ./app              # record with call graph\n# perf report                       # interactive report\n# perf stat ./app                   # CPU counters summary\n# perf top                          # live top-like profiling\n#\n# Flame graph:\n# perf record -g ./app\n# perf script | stackcollapse-perf.pl | flamegraph.pl > flame.svg"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Profiling & Debugging Tools — gdb, perf, Tracy — common patterns you'll see in production.\n// APPROACH  - Combine Profiling & Debugging Tools — gdb, perf, Tracy with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── Google Benchmark ────────────────────────────────\n# #include <benchmark/benchmark.h>\n#\n# static void BM_VectorPush(benchmark::State& state) {\n#   for (auto _ : state) {\n#     std::vector<int> v;\n#     for (int i = 0; i < state.range(0); ++i) {\n#       v.push_back(i);\n#     }\n#     benchmark::DoNotOptimize(v.data());\n#   }\n# }\n# BENCHMARK(BM_VectorPush)->Range(8, 8 << 10);\n#\n# static void BM_VectorReserve(benchmark::State& state) {\n#   for (auto _ : state) {\n#     std::vector<int> v;\n#     v.reserve(state.range(0));\n#     for (int i = 0; i < state.range(0); ++i) {\n#       v.push_back(i);\n#     }\n#     benchmark::DoNotOptimize(v.data());\n#   }\n# }\n# BENCHMARK(BM_VectorReserve)->Range(8, 8 << 10);\n#\n# BENCHMARK_MAIN();\n# // Run: ./bench --benchmark_format=console"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Profiling & Debugging Tools — gdb, perf, Tracy — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Compiler optimization flags ─────────────────────\n# -O0  : no optimization (debug, fastest compile)\n# -O1  : basic optimization\n# -O2  : standard optimization (recommended for release)\n# -O3  : aggressive optimization (may increase code size)\n# -Os  : optimize for size\n# -Og  : optimize for debugging (keeps debug experience)\n# -flto : link-time optimization (whole-program)\n# -march=native : optimize for current CPU\n# -DNDEBUG : disable assert() in release builds\n\n# ── compile_commands.json for IDE integration ───────\n# cmake -B build -DCMAKE_EXPORT_COMPILE_COMMANDS=ON\n# ln -s build/compile_commands.json .\n# Enables clangd, clang-tidy, and IDE features"
                  }
        ],
        tips: [
                  "benchmark::DoNotOptimize() prevents the compiler from removing your benchmark code — always use it.",
                  "perf record -g captures call graphs — combine with flamegraph.pl for visual profiling.",
                  "Compile with -Og for debugging — it applies optimizations that do not interfere with the debug experience.",
                  "CMAKE_EXPORT_COMPILE_COMMANDS=ON is essential — it enables clangd, clang-tidy, and modern IDE features."
        ],
        mistake: "Benchmarking with -O0 (debug build) — the compiler does not optimize at all, so results are meaningless. Always benchmark with -O2 or -O3 to measure realistic performance.",
        shorthand: {
          verbose: "// Manual / verbose approach\ng++ -g -O2 main.cpp\ngdb ./a.out\n// More explicit but longer",
          concise: "g++ -g -O2 -fno-omit-frame-pointer main.cpp\nperf record ./a.out && perf report",
        },
      },
      {
        id: "cmake-modern-targets",
        fn: "Modern CMake — Targets, Properties, Public/Private/Interface",
        desc: "Use target-based CMake: define targets, set properties, link with proper visibility.",
        category: "Build",
        subtitle: "add_library, target_link_libraries, PRIVATE/PUBLIC/INTERFACE, target properties",
        signature: "target_link_libraries(target PRIVATE lib)  |  target_include_directories(target PUBLIC include/)",
        descLong: "Modern CMake (3.x) revolves around targets. Each target has properties (compiler flags, include dirs, dependencies). target_link_libraries(target PRIVATE dep) links dep, visible only to target internals. PUBLIC makes it visible to dependents. INTERFACE affects only dependents. This prevents property leakage and enables modular builds.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modern CMake — Targets, Properties, Public/Private/Interface — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Modern CMake best practices ────────────────────\n\ncmake_minimum_required(VERSION 3.20)\nproject(ModernApp LANGUAGES CXX)\n\n# ── Library with PUBLIC properties ─────────────────\nadd_library(mylib\n  src/core.cpp\n  src/parser.cpp\n)\n\n# Public headers (visible to clients)\ntarget_include_directories(mylib\n  PUBLIC\n    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>\n    $<INSTALL_INTERFACE:include>\n  PRIVATE\n    src/\n)\n\n# Public compiler features\ntarget_compile_features(mylib PUBLIC cxx_std_20)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modern CMake — Targets, Properties, Public/Private/Interface — common patterns you'll see in production.\n// APPROACH  - Combine Modern CMake — Targets, Properties, Public/Private/Interface with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── Executable depending on library ─────────────────\nadd_executable(app src/main.cpp)\n\n# Link library: mylib's PUBLIC properties are visible\ntarget_link_libraries(app PRIVATE mylib)\n\n# ── Another library that depends on mylib ──────────\nadd_library(extended src/extended.cpp)\ntarget_link_libraries(extended PUBLIC mylib)  # inherit mylib's PUBLIC properties\n\n# ── INTERFACE library (header-only) ───────────────\nadd_library(interfaces INTERFACE)\ntarget_include_directories(interfaces\n  INTERFACE include/\n)\ntarget_compile_features(interfaces INTERFACE cxx_std_20)\n\ntarget_link_libraries(app PRIVATE interfaces)\n\n# ── Generator expressions for platform-specific ────\ntarget_compile_options(mylib\n  PRIVATE\n    $<$<CXX_COMPILER_ID:MSVC>:/W4>\n    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra>\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modern CMake — Targets, Properties, Public/Private/Interface — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Compiler warnings per target ────────────────────\ntarget_compile_options(mylib PRIVATE -Werror -Wpedantic)\n\n# ── Optimization flags ──────────────────────────────\ntarget_compile_options(mylib PRIVATE\n  $<$<CONFIG:Release>:-O3 -march=native>\n  $<$<CONFIG:Debug>:-O0 -g>\n)\n\n# Build commands\n# cmake -B build\n# cmake --build build\n# cmake --build build --config Release"
                  }
        ],
        tips: [
                  "Always use target_* commands (never global include_directories) — properties stay scoped to targets.",
                  "PRIVATE: affects only this target. PUBLIC: affects target and dependents. INTERFACE: affects only dependents.",
                  "Use $<BUILD_INTERFACE:...> and $<INSTALL_INTERFACE:...> for different paths when installed.",
                  "Generator expressions ($<CONDITION:value>) enable platform/config-specific properties."
        ],
        mistake: "Using include_directories() globally — it leaks to all targets and breaks modular builds.",
        shorthand: {
          verbose: "include_directories(include/)\nadd_library(mylib src.cpp)\nadd_executable(app main.cpp)\ntarget_link_libraries(app mylib)",
          concise: "add_library(mylib src.cpp)\ntarget_include_directories(mylib PUBLIC include/)\nadd_executable(app main.cpp)\ntarget_link_libraries(app PRIVATE mylib)",
        },
      },
      {
        id: "cmake-find-package",
        fn: "Finding Packages — find_package, FetchContent, CPM",
        desc: "Discover and configure dependencies with find_package, FetchContent, and package managers.",
        category: "Build",
        subtitle: "find_package, FetchContent, CPM.cmake, CONFIG mode, MODULE mode",
        signature: "find_package(fmt REQUIRED)  |  FetchContent_Declare(fmt ...)  |  CPMAddPackage(...)",
        descLong: "find_package discovers pre-installed packages via CMakeConfig files (CONFIG mode) or FindModule scripts (MODULE mode). FetchContent downloads and builds packages if not found. CPM (C++ Package Manager) simplifies FetchContent. Each method has tradeoffs: find_package requires pre-installation, FetchContent rebuilds every time, CPM caches intelligently.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Finding Packages — find_package, FetchContent, CPM — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── find_package (pre-installed packages) ──────────\n\ncmake_minimum_required(VERSION 3.20)\nproject(MyApp LANGUAGES CXX)\n\n# CONFIG mode: looks for fmtConfig.cmake\nfind_package(fmt 8.0 CONFIG REQUIRED)\n\n# MODULE mode: looks for Findfmt.cmake\nfind_package(Boost 1.80 MODULE REQUIRED COMPONENTS system thread)\n\nadd_executable(app main.cpp)\ntarget_link_libraries(app PRIVATE fmt::fmt Boost::system Boost::thread)\n\n# ── FetchContent (download from git/url) ────────────\ninclude(FetchContent)\n\nFetchContent_Declare(\n  fmt\n  GIT_REPOSITORY https://github.com/fmtlib/fmt.git\n  GIT_TAG        10.2.1\n)\n\nFetchContent_Declare(\n  googletest\n  GIT_REPOSITORY https://github.com/google/googletest.git\n  GIT_TAG        v1.14.0\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Finding Packages — find_package, FetchContent, CPM — common patterns you'll see in production.\n// APPROACH  - Combine Finding Packages — find_package, FetchContent, CPM with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# Download and build if not available\nFetchContent_MakeAvailable(fmt googletest)\n\nadd_executable(app main.cpp)\ntarget_link_libraries(app PRIVATE fmt::fmt)\n\n# ── CPM.cmake (intelligent caching) ─────────────────\n# Download CPM.cmake first:\n# wget -O cmake/CPM.cmake https://github.com/cpm-cmake/CPM.cmake/releases/latest/download/CPM.cmake\n\ninclude(cmake/CPM.cmake)\n\nCPMAddPackage(\n  NAME fmt\n  GITHUB_REPOSITORY fmtlib/fmt\n  GIT_TAG 10.2.1\n)\n\nCPMAddPackage(\n  NAME catch2\n  GITHUB_REPOSITORY catchorg/Catch2\n  GIT_TAG v3.4.0\n)\n\nadd_executable(app main.cpp)\ntarget_link_libraries(app PRIVATE fmt::fmt catch2::catch2)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Finding Packages — find_package, FetchContent, CPM — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Mixed approach ──────────────────────────────────\n# Try find_package first, fall back to FetchContent\nfind_package(nlohmann_json 3.2 CONFIG QUIET)\n\nif (NOT nlohmann_json_FOUND)\n  FetchContent_Declare(\n    nlohmann_json\n    URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz\n  )\n  FetchContent_MakeAvailable(nlohmann_json)\nendif()\n\ntarget_link_libraries(app PRIVATE nlohmann_json::nlohmann_json)\n\n# Commands:\n# cmake -B build\n# cmake --build build"
                  }
        ],
        tips: [
                  "find_package + CONFIG mode is preferred if the package provides CMake files.",
                  "FetchContent is best for header-only libraries and when you want exact versions in source control.",
                  "CPM caches downloads and provides version locking — use for production builds.",
                  "Always use REQUIRED or check find_package result to catch missing dependencies early."
        ],
        mistake: "Relying on find_package without fallback when the package might not be installed.",
        shorthand: {
          verbose: "# Manual dependency setup\ngit clone https://github.com/fmtlib/fmt\ncd fmt && cmake -B build && cmake --build build",
          concise: "# FetchContent\nFetchContent_Declare(fmt GIT_REPOSITORY ...)\nFetchContent_MakeAvailable(fmt)",
        },
      },
      {
        id: "cmake-install",
        fn: "CMake Install Rules — Packaging & Distribution",
        desc: "Install targets, headers, and files to system directories or custom prefixes.",
        category: "Build",
        subtitle: "install(TARGETS), install(FILES), GNUInstallDirs, CMAKE_INSTALL_PREFIX",
        signature: "install(TARGETS app RUNTIME DESTINATION bin)  |  install(DIRECTORY include/ DESTINATION include)",
        descLong: "install() rules copy built artifacts and files to installation directories. TARGETS installs executables/libraries. FILES/DIRECTORY installs data. GNUInstallDirs provides standard paths (bin, lib, include). CMAKE_INSTALL_PREFIX sets the base install directory.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CMake Install Rules — Packaging & Distribution — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ncmake_minimum_required(VERSION 3.20)\nproject(MyProject VERSION 1.0.0 LANGUAGES CXX)\n\ninclude(GNUInstallDirs)  # Standard paths: bin, lib, include, etc.\n\n# ── Build executable ────────────────────────────────\nadd_executable(myapp src/main.cpp)\ntarget_include_directories(myapp PRIVATE src/)\n\n# ── Build library ───────────────────────────────────\nadd_library(mylib src/core.cpp src/parser.cpp)\ntarget_include_directories(mylib\n  PUBLIC\n    $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>\n    $<INSTALL_INTERFACE:${CMAKE_INSTALL_INCLUDEDIR}>\n)\n\n# ── Install executable ──────────────────────────────\ninstall(TARGETS myapp\n  RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CMake Install Rules — Packaging & Distribution — common patterns you'll see in production.\n// APPROACH  - Combine CMake Install Rules — Packaging & Distribution with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── Install library ─────────────────────────────────\ninstall(TARGETS mylib\n  LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}\n  ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}\n)\n\n# ── Install public headers ──────────────────────────\ninstall(DIRECTORY include/\n  DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}\n  FILES_MATCHING PATTERN \"*.h\"\n)\n\n# ── Install documentation ───────────────────────────\ninstall(FILES README.md LICENSE\n  DESTINATION ${CMAKE_INSTALL_DOCDIR}\n)\n\n# ── Install config files (for find_package to work) ─\ninstall(FILES mylib-config.cmake\n  DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/mylib\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CMake Install Rules — Packaging & Distribution — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Usage:\n# cmake -B build -DCMAKE_INSTALL_PREFIX=/usr/local\n# cmake --install build\n# (Or simpler:)\n# cmake --install build --prefix /usr/local\n#\n# For staged installs (for packaging):\n# cmake --install build --prefix /tmp/staging\n#\n# Verify installation:\n# ls /usr/local/bin/myapp\n# ls /usr/local/include/mylib/*.h\n# ls /usr/local/lib/libmylib.a"
                  }
        ],
        tips: [
                  "Use GNUInstallDirs for standard paths — portable across distros.",
                  "CMAKE_INSTALL_PREFIX is often /usr/local or system package path.",
                  "Use $<INSTALL_INTERFACE:...> in target_include_directories for correct paths after install.",
                  "Staged installs (--prefix /tmp/staging) are essential for creating packages (RPM, DEB, etc.)."
        ],
        mistake: "Hardcoding install paths instead of using GNUInstallDirs variables.",
        shorthand: {
          verbose: "# Manual copy after build\ncmake --build build\ncp build/app /usr/local/bin/\ncp include/*.h /usr/local/include/",
          concise: "install(TARGETS app RUNTIME DESTINATION bin)\ninstall(DIRECTORY include/ DESTINATION include)\ncmake --install build --prefix /usr/local",
        },
      },
      {
        id: "cmake-presets",
        fn: "CMakePresets.json — Standardized Build Configurations",
        desc: "Define configure, build, and test presets for reproducible builds across the team.",
        category: "Build",
        subtitle: "CMakePresets.json, configurePresets, buildPresets, testPresets, toolchain",
        signature: "cmake --preset release  |  cmake --build --preset release  |  ctest --preset test",
        descLong: "CMakePresets.json (CMake 3.21+) standardizes build configurations. Developers run cmake --preset release instead of remembering flags. Presets include configure, build, and test configurations. Eliminates \"works on my machine\" by enforcing identical settings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CMakePresets.json — Standardized Build Configurations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# CMakePresets.json\n\n{\n  \"version\": 6,\n  \"vendor\": {\n    \"mycompany.com/cmake\": {\n      \"autoFormat\": true\n    }\n  },\n  \"cmakeMinimumRequired\": {\n    \"major\": 3,\n    \"minor\": 25,\n    \"patch\": 0\n  },\n  \"configurePresets\": [\n    {\n      \"name\": \"default\",\n      \"displayName\": \"Default Config\",\n      \"description\": \"Default configuration with C++20\",\n      \"binaryDir\": \"${sourceDir}/build/default\",\n      \"cacheVariables\": {\n        \"CMAKE_CXX_STANDARD\": \"20\",\n        \"CMAKE_EXPORT_COMPILE_COMMANDS\": \"ON\"\n      }\n    },\n    {\n      \"name\": \"release\",\n      \"displayName\": \"Release\",\n      \"inherits\": \"default\",\n      \"binaryDir\": \"${sourceDir}/build/release\",\n      \"cacheVariables\": {\n        \"CMAKE_BUILD_TYPE\": \"Release\",\n        \"CMAKE_INTERPROCEDURAL_OPTIMIZATION\": \"ON\"\n      }\n    },\n    {\n      \"name\": \"debug\",\n      \"displayName\": \"Debug with Sanitizers\",\n      \"inherits\": \"default\",\n      \"binaryDir\": \"${sourceDir}/build/debug\",\n      \"cacheVariables\": {\n        \"CMAKE_BUILD_TYPE\": \"Debug\",\n        \"CMAKE_CXX_FLAGS\": \"-fsanitize=address,undefined -fno-omit-frame-pointer\"\n      }\n    },\n    {\n      \"name\": \"asan\",\n      \"displayName\": \"AddressSanitizer\",\n      \"inherits\": \"debug\",\n      \"binaryDir\": \"${sourceDir}/build/asan\"\n    },\n    {\n      \"name\": \"tsan\",\n      \"displayName\": \"ThreadSanitizer\",\n      \"inherits\": \"default\",\n      \"binaryDir\": \"${sourceDir}/build/tsan\",\n      \"cacheVariables\": {\n        \"CMAKE_CXX_FLAGS\": \"-fsanitize=thread\"\n      }\n    }\n  ],\n  \"buildPresets\": [\n    {\n      \"name\": \"default\",\n      \"configurePreset\": \"default\",\n      \"jobs\": 4,\n      \"targets\": [\"all\"]\n    },\n    {\n      \"name\": \"release\",\n      \"configurePreset\": \"release\",\n      \"inherits\": \"default\"\n    },\n    {\n      \"name\": \"debug\",\n      \"configurePreset\": \"debug\",\n      \"inherits\": \"default\"\n    }\n  ],\n  \"testPresets\": [\n    {\n      \"name\": \"default\",\n      \"configurePreset\": \"default\",\n      \"output\": {\n        \"outputOnFailure\": true\n      },\n      \"execution\": {\n        \"stopOnFailure\": false\n      }\n    },\n    {\n      \"name\": \"release\",\n      \"configurePreset\": \"release\",\n      \"inherits\": \"default\"\n    }\n  ]\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CMakePresets.json — Standardized Build Configurations — common patterns you'll see in production.\n// APPROACH  - Combine CMakePresets.json — Standardized Build Configurations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CMakePresets.json — Standardized Build Configurations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n\"configurePreset\": \"release\",\n      \"inherits\": \"default\"\n    },\n    {\n      \"name\": \"debug\",\n      \"configurePreset\": \"debug\",\n      \"inherits\": \"default\"\n    }\n  ],\n  \"testPresets\": [\n    {\n      \"name\": \"default\",\n      \"configurePreset\": \"default\",\n      \"output\": {\n        \"outputOnFailure\": true\n      },\n      \"execution\": {\n        \"stopOnFailure\": false\n      }\n    },\n    {\n      \"name\": \"release\",\n      \"configurePreset\": \"release\",\n      \"inherits\": \"default\"\n    }\n  ]\n}\n\n# Usage:\n# cmake --list-presets              # List all presets\n# cmake --preset release             # Configure with release preset\n# cmake --build --preset release    # Build with release preset\n# ctest --preset default             # Run tests"
                  }
        ],
        tips: [
                  "CMakePresets.json eliminates \"works on my machine\" — commit it to version control.",
                  "Use CMAKE_EXPORT_COMPILE_COMMANDS=ON for clangd IDE integration.",
                  "Presets can inherit from other presets to reduce duplication.",
                  "ctest --preset test automates test runs with the same configuration."
        ],
        mistake: "Not committing CMakePresets.json to version control — different developers use different flags.",
        shorthand: {
          verbose: "cmake -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_CXX_STANDARD=20\ncmake --build build --parallel 4\nctest --test-dir build",
          concise: "cmake --preset release\ncmake --build --preset release\nctest --preset test",
        },
      },
      {
        id: "vcpkg-basics",
        fn: "vcpkg — C++ Package Manager",
        desc: "Manage C++ dependencies with vcpkg: manifest mode, install, and CMake integration.",
        category: "Build",
        subtitle: "vcpkg.json, vcpkg install, manifest mode, triplets, CMAKE_TOOLCHAIN_FILE",
        signature: "vcpkg install  |  find_package(X CONFIG REQUIRED)",
        descLong: "vcpkg (by Microsoft) is a C++ package manager providing pre-built binaries for 2000+ libraries. Manifest mode (vcpkg.json) tracks dependencies like package.json. vcpkg install resolves and downloads. Integrates with CMake via toolchain file.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of vcpkg — C++ Package Manager — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── vcpkg.json (manifest) ──────────────────────────\n{\n  \"name\": \"myproject\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": [\n    \"fmt\",\n    \"spdlog\",\n    \"nlohmann-json\",\n    \"curl\",\n    \"openssl\",\n    \"sqlite3\"\n  ],\n  \"overrides\": [\n    {\n      \"name\": \"fmt\",\n      \"version\": \"10.2.1\"\n    }\n  ]\n}\n\n# ── CMakeLists.txt integration ──────────────────────\ncmake_minimum_required(VERSION 3.20)\nproject(MyApp LANGUAGES CXX)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of vcpkg — C++ Package Manager — common patterns you'll see in production.\n// APPROACH  - Combine vcpkg — C++ Package Manager with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nfind_package(fmt CONFIG REQUIRED)\nfind_package(spdlog CONFIG REQUIRED)\nfind_package(nlohmann_json CONFIG REQUIRED)\nfind_package(CURL CONFIG REQUIRED)\nfind_package(OpenSSL CONFIG REQUIRED)\nfind_package(SQLite3 CONFIG REQUIRED)\n\nadd_executable(app main.cpp)\ntarget_link_libraries(app PRIVATE\n  fmt::fmt\n  spdlog::spdlog\n  nlohmann_json::nlohmann_json\n  CURL::libcurl\n  OpenSSL::SSL OpenSSL::Crypto\n  SQLite::SQLite3\n)\n\n# ── Commands ────────────────────────────────────────\n# 1. Install vcpkg (one time):\n# git clone https://github.com/microsoft/vcpkg.git\n# ./vcpkg/bootstrap-vcpkg.sh"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of vcpkg — C++ Package Manager — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# 2. Configure with vcpkg toolchain:\n# cmake -B build -DCMAKE_TOOLCHAIN_FILE=vcpkg/scripts/buildsystems/vcpkg.cmake\n\n# 3. Install dependencies:\n# vcpkg install\n\n# 4. Build:\n# cmake --build build\n\n# ── Triplets (cross-compilation) ────────────────────\n# Triplets specify target platform: x64-windows, x64-linux, arm-linux, etc.\n# vcpkg install --triplet x64-linux\n# vcpkg install --triplet arm64-linux"
                  }
        ],
        tips: [
                  "Manifest mode (vcpkg.json) is preferred — tracks dependency versions in source control.",
                  "CMAKE_TOOLCHAIN_FILE=vcpkg/scripts/buildsystems/vcpkg.cmake is required in cmake invocation.",
                  "Triplets specify platform and build configuration (Release/Debug, static/dynamic).",
                  "vcpkg caches downloaded/built packages — subsequent builds are fast."
        ],
        mistake: "Manually downloading dependencies instead of using vcpkg.json — version tracking is lost.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual: download, configure, build each dependency\n// More explicit but longer",
          concise: "# vcpkg.json lists deps\n# vcpkg install resolves them",
        },
      },
      {
        id: "conan-basics",
        fn: "Conan — Decentralized C++ Package Manager",
        desc: "Use Conan for flexible dependency management with profiles and generators.",
        category: "Build",
        subtitle: "conanfile.txt, conan install, generators, profiles, CMakeDeps, CMakeToolchain",
        signature: "conanfile.txt  |  conan install . --output-folder=build  |  CMakeDeps, CMakeToolchain",
        descLong: "Conan (by JFrog) is a decentralized package manager offering more flexibility than vcpkg. conanfile.txt specifies dependencies and generators (CMakeDeps, CMakeToolchain). Profiles define compiler, version, and build settings. More powerful for complex scenarios but heavier than vcpkg.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Conan — Decentralized C++ Package Manager — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── conanfile.txt ──────────────────────────────────\n[requires]\nfmt/10.2.1\nspdlog/1.13.0\nnlohmann_json/3.11.2\nboost/1.84.0\nzlib/1.3.1\n\n[generators]\nCMakeDeps\nCMakeToolchain\n\n[options]\nboost:shared=False\nboost:with_system=True\nboost:with_thread=True\n\n[imports]\n# None for simple projects\n\n# ── Custom profile (conanprofile.txt) ────────────────\n[settings]\nos=Linux\narch=x86_64\ncompiler=gcc\ncompiler.version=13\ncompiler.libcxx=libstdc++11\nbuild_type=Release\n\n[conf]\ntools.cmake.cmaketoolchain:generator=Ninja"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Conan — Decentralized C++ Package Manager — common patterns you'll see in production.\n// APPROACH  - Combine Conan — Decentralized C++ Package Manager with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── Installation ────────────────────────────────────\n# 1. Install Conan (pip):\n# pip install conan\n\n# 2. Create profile (interactive):\n# conan profile detect --force\n\n# 3. Install dependencies:\n# conan install . --output-folder=build --build=missing\n\n# 4. Configure CMake with generated files:\n# cmake -B build -DCMAKE_BUILD_TYPE=Release\n#   -DCMAKE_TOOLCHAIN_FILE=build/generators/conan_toolchain.cmake\n\n# 5. Build:\n# cmake --build build\n\n# ── CMakeLists.txt integration ──────────────────────\ncmake_minimum_required(VERSION 3.15)\nproject(MyApp LANGUAGES CXX)\n\n# Include Conan-generated files\nlist(APPEND CMAKE_PREFIX_PATH \"${CMAKE_BINARY_DIR}\")\nlist(APPEND CMAKE_MODULE_PATH \"${CMAKE_BINARY_DIR}\")\n\nfind_package(fmt REQUIRED)\nfind_package(spdlog REQUIRED)\nfind_package(nlohmann_json REQUIRED)\nfind_package(Boost REQUIRED COMPONENTS system thread)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Conan — Decentralized C++ Package Manager — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nadd_executable(app main.cpp)\ntarget_link_libraries(app\n  fmt::fmt\n  spdlog::spdlog\n  nlohmann_json::nlohmann_json\n  Boost::system\n  Boost::thread\n)\n\n# ── Advanced: custom conanfile.py ────────────────────\n# from conan import ConanFile\n# from conan.tools.cmake import CMake, cmake_layout\n#\n# class MyAppConan(ConanFile):\n#     name = \"myapp\"\n#     version = \"1.0\"\n#     settings = \"os\", \"compiler\", \"build_type\", \"arch\"\n#     requires = \"fmt/10.2.1\", \"spdlog/1.13.0\"\n#     generators = \"CMakeDeps\", \"CMakeToolchain\"\n#\n#     def layout(self):\n#         cmake_layout(self)\n#\n#     def build(self):\n#         cmake = CMake(self)\n#         cmake.configure()\n#         cmake.build()"
                  }
        ],
        tips: [
                  "Conan is more flexible for complex scenarios — use for projects with intricate dependency requirements.",
                  "CMakeDeps + CMakeToolchain generators are the modern approach (vs legacy cmake_find_package).",
                  "conan install --build=missing rebuilds packages if prebuilts aren't available.",
                  "Profiles make dependency specs reproducible across team members and CI."
        ],
        mistake: "Using legacy generators (cmake_find_package) instead of CMakeDeps + CMakeToolchain.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual dependency version management\n// More explicit but longer",
          concise: "# conanfile.txt version control and reproducible installs",
        },
      },
      {
        id: "compiler-flags",
        fn: "Compiler Flags — Optimization, Warnings, Sanitizers",
        desc: "Essential compiler flags for release, debug, warnings, and instrumentation.",
        category: "Build",
        subtitle: "-O2/-O3, -Wall -Wextra, -fsanitize, -march=native, -DNDEBUG",
        signature: "-O2  |  -Wall -Wextra -Wpedantic  |  -fsanitize=address,undefined",
        descLong: "Compiler flags control optimization, warnings, and instrumentation. -O2 is standard release optimization. -O3 is aggressive (may increase code size). -Wall -Wextra catch bugs. Sanitizers (-fsanitize=*) find runtime errors. -march=native optimizes for the current CPU.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Compiler Flags — Optimization, Warnings, Sanitizers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Compiler flags in CMakeLists.txt ────────────────\n\n# Global flags (not recommended)\n# set(CMAKE_CXX_FLAGS \"-Wall -Wextra\")\n\n# Better: per-target flags\nadd_executable(app main.cpp)\n\n# Release flags\ntarget_compile_options(app PRIVATE\n  $<$<CONFIG:Release>:-O2 -march=native -DNDEBUG>\n)\n\n# Debug flags\ntarget_compile_options(app PRIVATE\n  $<$<CONFIG:Debug>:-O0 -g -fno-omit-frame-pointer>\n)\n\n# Warnings (all targets)\ntarget_compile_options(app PRIVATE\n  -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Compiler Flags — Optimization, Warnings, Sanitizers — common patterns you'll see in production.\n// APPROACH  - Combine Compiler Flags — Optimization, Warnings, Sanitizers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# Treat warnings as errors (optional)\ntarget_compile_options(app PRIVATE -Werror)\n\n# Sanitizers (debug only)\ntarget_compile_options(app PRIVATE\n  $<$<CONFIG:Debug>:-fsanitize=address,undefined>\n)\ntarget_link_options(app PRIVATE\n  $<$<CONFIG:Debug>:-fsanitize=address,undefined>\n)\n\n# ── Compiler-specific flags ────────────────────────\ntarget_compile_options(app PRIVATE\n  $<$<CXX_COMPILER_ID:MSVC>:/W4 /permissive->\n  $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra>\n)\n\n# ── Link-time optimization (slower compile, faster runtime) ─\ntarget_compile_options(app PRIVATE -flto)\ntarget_link_options(app PRIVATE -flto)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Compiler Flags — Optimization, Warnings, Sanitizers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Common flag matrix ──────────────────────────────\n# Development (fastest iteration):\n#   -O0 -g -fsanitize=address,undefined -fno-omit-frame-pointer\n#\n# Release (production):\n#   -O2 -DNDEBUG -march=native\n#\n# Aggressive optimization:\n#   -O3 -march=native -flto -DNDEBUG\n#\n# Warnings (all builds):\n#   -Wall -Wextra -Wpedantic -Wconversion\n#\n# CI/Testing:\n#   -O1 -fsanitize=address,undefined -fno-omit-frame-pointer -Wall -Wextra"
                  }
        ],
        tips: [
                  "-O2 is the sweet spot for release builds — balances performance and compilation time.",
                  "-O3 is aggressive; benchmark to ensure it helps (might increase code size/compilation time).",
                  "-march=native optimizes for the compile machine — avoid in CI if binaries cross machines.",
                  "-fno-omit-frame-pointer is essential with sanitizers for readable stack traces."
        ],
        mistake: "Compiling production code with -O0 — use at least -O2.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual flag management per file\n// More explicit but longer",
          concise: "# Centralized in CMakeLists.txt or compiler flag list",
        },
      },
      {
        id: "sanitizers",
        fn: "Sanitizers — Runtime Bug Detection (ASan, UBSan, TSan)",
        desc: "Use compiler sanitizers to find memory bugs, undefined behavior, and data races.",
        category: "Build",
        subtitle: "-fsanitize=address, -fsanitize=undefined, -fsanitize=thread, runtime detection",
        signature: "g++ -fsanitize=address,undefined -fno-omit-frame-pointer app.cpp",
        descLong: "Sanitizers are compiler-instrumented runtime checkers. AddressSanitizer (ASan) catches buffer overflows, use-after-free, memory leaks. UndefinedBehaviorSanitizer (UBSan) catches signed overflow, null deref, misaligned access. ThreadSanitizer (TSan) detects data races. Enable by default in debug builds; disable or separate in release.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sanitizers — Runtime Bug Detection (ASan, UBSan, TSan) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── CMakePresets.json with sanitizers ───────────────\n\n{\n  \"configurePresets\": [\n    {\n      \"name\": \"debug-asan\",\n      \"displayName\": \"Debug + ASan\",\n      \"cacheVariables\": {\n        \"CMAKE_BUILD_TYPE\": \"Debug\",\n        \"CMAKE_CXX_FLAGS\": \"-fsanitize=address,undefined -fno-omit-frame-pointer -g\"\n      }\n    },\n    {\n      \"name\": \"debug-tsan\",\n      \"displayName\": \"Debug + TSan\",\n      \"cacheVariables\": {\n        \"CMAKE_BUILD_TYPE\": \"Debug\",\n        \"CMAKE_CXX_FLAGS\": \"-fsanitize=thread -g\"\n      }\n    }\n  ]\n}\n\n# ── CMakeLists.txt sanitizer integration ────────────\noption(ENABLE_SANITIZERS \"Enable ASan+UBSan\" OFF)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sanitizers — Runtime Bug Detection (ASan, UBSan, TSan) — common patterns you'll see in production.\n// APPROACH  - Combine Sanitizers — Runtime Bug Detection (ASan, UBSan, TSan) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nif(ENABLE_SANITIZERS)\n  message(STATUS \"Building with sanitizers\")\n  add_compile_options(-fsanitize=address,undefined)\n  add_compile_options(-fno-omit-frame-pointer)\n  add_link_options(-fsanitize=address,undefined)\nendif()\n\n# Usage:\n# cmake -B build -DENABLE_SANITIZERS=ON\n# cmake --build build\n# ./build/app  -> Reports memory errors to stdout\n\n# ── Example errors caught by ASan ───────────────────\n# 1. Heap buffer overflow:\n//   int* p = new int[10];\n//   p[20] = 42;  // ASAN: heap-buffer-overflow\n\n# 2. Use-after-free:\n//   int* p = new int(42);\n//   delete p;\n//   *p = 0;  // ASAN: heap-use-after-free\n\n# 3. Memory leak:\n//   int* p = new int[100];  // never deleted\n//   // Program exit: ASAN: detected memory leaks"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sanitizers — Runtime Bug Detection (ASan, UBSan, TSan) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Example errors caught by UBSan ─────────────────\n# 1. Signed overflow:\n//   int x = INT_MAX;\n//   x++;  // UBSAN: signed integer overflow\n\n# 2. Null pointer dereference:\n//   int* p = nullptr;\n//   *p;  // UBSAN: null pointer dereference\n\n# 3. Shift overflow:\n//   1 << 33;  // UBSAN: shift exponent too large\n\n# ── Valgrind as alternative (no recompilation) ──────\n# valgrind --leak-check=full --show-leak-kinds=all ./app\n# (20-50x slower than sanitizers)"
                  }
        ],
        tips: [
                  "Enable sanitizers in debug/CI builds by default — they find bugs that testing misses.",
                  "-fno-omit-frame-pointer is essential with sanitizers for readable stack traces.",
                  "TSan cannot be combined with ASan — run as separate CI jobs.",
                  "Sanitizers add 2x runtime overhead — acceptable for development, disable in production."
        ],
        mistake: "Running sanitizers only in CI, not during local development — find bugs early.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Detect bugs manually in testing\n// More explicit but longer",
          concise: "# Enable sanitizers in CMake presets for automatic detection",
        },
      },
      {
        id: "clang-tidy",
        fn: "clang-tidy — Static Analysis & Automatic Fixes",
        desc: "Run static checks and automatically fix issues with clang-tidy.",
        category: "Build",
        subtitle: ".clang-tidy config, checks, --fix, CI integration, modernize, readability",
        signature: "clang-tidy src.cpp  |  clang-tidy --fix src.cpp  |  clang-tidy --checks=readability-*",
        descLong: "clang-tidy performs static analysis: detects bugs, suggests modernizations, enforces style. Checks categorize issues: readability, modernize, performance, etc. --fix applies automatic corrections. .clang-tidy config controls enabled checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of clang-tidy — Static Analysis & Automatic Fixes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── .clang-tidy config file ────────────────────────\n---\nChecks: >\n  readability-*,\n  modernize-*,\n  performance-*,\n  -readability-magic-numbers,\n  -readability-identifier-length\n\nWarningsAsErrors: >\n  readability-*,\n  modernize-*\n\nHeaderFilterRegex: '(src|include)/.*\\.h'\n\n# ── Command line usage ──────────────────────────────\n# Run checks on a file:\nclang-tidy src/main.cpp\n\n# Run checks on all files:\nclang-tidy src/*.cpp"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of clang-tidy — Static Analysis & Automatic Fixes — common patterns you'll see in production.\n// APPROACH  - Combine clang-tidy — Static Analysis & Automatic Fixes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# Apply fixes automatically:\nclang-tidy --fix src/main.cpp\n\n# Check specific category:\nclang-tidy --checks=modernize-* src/main.cpp\n\n# Dry-run (show what would change):\nclang-tidy --fix-errors --dry-run src/main.cpp\n\n# ── CMake integration ───────────────────────────────\n# In CMakeLists.txt:\nfind_program(CLANG_TIDY clang-tidy)\nif(CLANG_TIDY)\n  set(CMAKE_CXX_CLANG_TIDY clang-tidy;--fix)\nendif()\n\n# Build will automatically run clang-tidy and fix issues\n\n# ── Example issues caught ───────────────────────────\n# 1. Modernize: Use auto instead of explicit type\n//   std::vector<int>::iterator it = vec.begin();\n//   // CLANG_TIDY: Use auto"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of clang-tidy — Static Analysis & Automatic Fixes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# 2. Readability: Use '= default' for trivial destructors\n//   MyClass::~MyClass() {}\n//   // CLANG_TIDY: Use '= default'\n\n# 3. Performance: Avoid unnecessary copies\n//   void foo(std::string str);  // pass by value\n//   // CLANG_TIDY: Use const ref instead\n\n# 4. Modernize: Use make_unique instead of new\n//   auto p = std::unique_ptr<int>(new int(42));\n//   // CLANG_TIDY: Use make_unique"
                  }
        ],
        tips: [
                  "Enable clang-tidy in CI to catch issues before merge.",
                  "Start with relaxed checks, gradually tighten as the codebase improves.",
                  "--fix applies automatic corrections, but review changes before committing.",
                  "Combine with clang-format for style enforcement."
        ],
        mistake: "Ignoring clang-tidy warnings — many catch real bugs and code quality issues.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual code review for issues\n// More explicit but longer",
          concise: "# clang-tidy automates static analysis",
        },
      },
      {
        id: "clang-format",
        fn: "clang-format — Automatic Code Formatting",
        desc: "Enforce consistent style with clang-format configuration and pre-commit hooks.",
        category: "Build",
        subtitle: ".clang-format config, coding styles, --dry-run, pre-commit integration",
        signature: "clang-format -i src.cpp  |  clang-format --style=llvm --dry-run src.cpp",
        descLong: "clang-format automatically formats code to match a style guide. .clang-format defines indentation, brace placement, line length, etc. Predefined styles: LLVM, Google, Chromium, Mozilla, WebKit. --dry-run previews changes. Integration with pre-commit hooks enforces consistency.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of clang-format — Automatic Code Formatting — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── .clang-format configuration file ────────────────\n---\nLanguage: Cpp\nStandard: c++20\nBasedOnStyle: LLVM\n\nIndentWidth: 4\nTabWidth: 4\nUseTab: Never\n\nColumnLimit: 100\nBreakBeforeBraces: Allman\nAllowShortFunctionsOnASingleLine: None\nAllowShortIfStatementsOnASingleLine: Never\n\n# ── Command line usage ──────────────────────────────\n# Format a file in-place:\nclang-format -i src/main.cpp\n\n# Format all files:\nclang-format -i src/*.cpp include/*.h\n\n# Dry run (show what would change):\nclang-format --dry-run src/main.cpp\n\n# Check without modifying:\nclang-format src/main.cpp | diff src/main.cpp -"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of clang-format — Automatic Code Formatting — common patterns you'll see in production.\n// APPROACH  - Combine clang-format — Automatic Code Formatting with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# Use specific style:\nclang-format --style=Google src/main.cpp\n\n# ── Pre-commit hook example (scripts/install-hooks.sh) ─\n#!/bin/bash\ncat > .git/hooks/pre-commit << 'EOF'\n#!/bin/bash\nCLANG_FORMAT=$(which clang-format)\nif [ -z \"$CLANG_FORMAT\" ]; then\n  echo \"clang-format not found\"\n  exit 1\nfi\n\nSTAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM \\\n  | grep -E '\\.(cpp|h|hpp|cc)$')\n\nif [ -z \"$STAGED_FILES\" ]; then\n  exit 0\nfi\n\n# Format staged files\n$CLANG_FORMAT -i $STAGED_FILES\n\n# Re-stage formatted files\ngit add $STAGED_FILES\nEOF\nchmod +x .git/hooks/pre-commit"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of clang-format — Automatic Code Formatting — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# ── Styles overview ─────────────────────────────────\n# LLVM: conservative, readable\n# Google: compact, minimal spacing\n# Chromium: similar to Google\n# Mozilla: relaxed, readable\n# WebKit: readable, whitespace-friendly\n\n# ── CMake integration ───────────────────────────────\n# In CMakeLists.txt:\nfind_program(CLANG_FORMAT clang-format)\nif(CLANG_FORMAT)\n  file(GLOB_RECURSE SOURCES\n    \"${CMAKE_CURRENT_SOURCE_DIR}/src/*.(cpp|h)\"\n  )\n  add_custom_target(format\n    COMMAND clang-format -i ${SOURCES}\n    WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}\n  )\nendif()\n\n# Usage: cmake --build build --target format"
                  }
        ],
        tips: [
                  "Commit .clang-format to version control — ensures team consistency.",
                  "Run clang-format before committing via pre-commit hooks.",
                  "Combine with clang-tidy for complete code quality automation.",
                  "Choose a style and stick with it — consistency > perfect style."
        ],
        mistake: "Skipping clang-format in CI — style inconsistencies accumulate and hurt readability.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# Manual style enforcement during code review\n// More explicit but longer",
          concise: "# clang-format automates formatting",
        },
      },
      {
        id: "ccache-sccache",
        fn: "Build Caching — ccache & sccache",
        desc: "Accelerate builds with compiler output caching and distributed caching.",
        category: "Build",
        subtitle: "ccache, sccache, CMAKE_CXX_COMPILER_LAUNCHER, incremental builds, CI speedup",
        signature: "export CMAKE_CXX_COMPILER_LAUNCHER=ccache  |  sccache (distributed)",
        descLong: "ccache and sccache cache compiler outputs, speeding up rebuilds dramatically (10-100x for clean builds, 2-3x for incremental). Set via CMAKE_CXX_COMPILER_LAUNCHER. sccache distributes caching across machines (useful for CI).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Build Caching — ccache & sccache — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n# ── Enable ccache (local caching) ───────────────────\n\n# Install (macOS):\n# brew install ccache\n\n# Install (Linux):\n# apt-get install ccache\n\n# Configure CMake to use ccache:\nexport CMAKE_CXX_COMPILER_LAUNCHER=ccache\n\n# Then build normally:\ncmake -B build\ncmake --build build\n\n# Or in CMakeLists.txt:\nfind_program(CCACHE_PROGRAM ccache)\nif(CCACHE_PROGRAM)\n  set(CMAKE_CXX_COMPILER_LAUNCHER ${CCACHE_PROGRAM})\nendif()\n\n# ── Configure ccache ────────────────────────────────\n# ~/.ccache/ccache.conf\nmax_size = 10G\ncache_dir = /tmp/ccache\n\n# Show stats:\nccache -s\n\n# Clear cache:\nccache -C"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Build Caching — ccache & sccache — common patterns you'll see in production.\n// APPROACH  - Combine Build Caching — ccache & sccache with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n# ── sccache (distributed caching) ───────────────────\n# Install sccache:\n# cargo install sccache\n# (or download prebuilt)\n\n# Configure for AWS S3 backend:\nexport SCCACHE_BUCKET=my-build-cache\nexport AWS_ACCESS_KEY_ID=...\nexport AWS_SECRET_ACCESS_KEY=...\nexport CMAKE_CXX_COMPILER_LAUNCHER=sccache\n\n# Or Redis:\nexport SCCACHE_REDIS=redis://localhost:6379\nexport CMAKE_CXX_COMPILER_LAUNCHER=sccache\n\n# ── GitHub Actions CI example ───────────────────────\n# .github/workflows/build.yml\nname: Build with ccache\n\non: [push, pull_request]\n\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v3\n\n      - name: Install ccache\n        run: apt-get install -y ccache\n\n      - name: Restore ccache\n        uses: actions/cache@v3\n        with:\n          path: ~/.ccache\n          key: ccache-${{ runner.os }}-${{ hashFiles('**/CMakeLists.txt') }}\n          restore-keys: |\n            ccache-${{ runner.os }}-"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Build Caching — ccache & sccache — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n- name: Configure\n        run: |\n          export CMAKE_CXX_COMPILER_LAUNCHER=ccache\n          cmake -B build -DCMAKE_BUILD_TYPE=Release\n\n      - name: Build\n        run: cmake --build build\n\n      - name: Show ccache stats\n        run: ccache -s\n\n# ── Gitlab CI example ───────────────────────────────\n# .gitlab-ci.yml\nbuild:\n  script:\n    - apt-get install -y ccache\n    - export CMAKE_CXX_COMPILER_LAUNCHER=ccache\n    - cmake -B build -DCMAKE_BUILD_TYPE=Release\n    - cmake --build build\n  cache:\n    paths:\n      - .ccache/"
                  }
        ],
        tips: [
                  "ccache: local machine caching, zero setup. Best for local development and CI on same machine.",
                  "sccache: distributed caching, backend-agnostic (S3, Redis, etc.). Best for CI farms with multiple machines.",
                  "Cache is automatically invalidated on header/source changes — no stale builds.",
                  "CI caching can reduce build times from 5 minutes to 30 seconds on incremental builds."
        ],
        mistake: "Not using ccache/sccache in CI — full rebuilds are unnecessarily slow.",
        shorthand: {
          verbose: "// Manual / verbose approach\n# First build: 5 minutes (no cache)\n# Second build: 5 minutes (no reuse)\n// More explicit but longer",
          concise: "# First build: 5 minutes (no cache)\n# Second build: 30 seconds (cache hit)",
        },
      },
    ],
  },
]

export default { meta, sections }
