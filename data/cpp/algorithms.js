export const meta = {
  "id": "cpp-algorithms",
  "label": "Algorithms & Modern C++",
  "icon": "⚙️",
  "description": "STL algorithms, filesystem, chrono, regex, ranges, and concurrency patterns."
}

export const sections = [

  // ── Section 1: STL Algorithms ─────────────────────────────────────────
  {
    id: "stl-algorithms",
    title: "STL Algorithms",
    entries: [
      {
        id: "sort-search",
        fn: "Sorting & Searching Algorithms",
        desc: "std::sort, stable_sort, partial_sort, nth_element, binary_search, lower/upper_bound.",
        category: "Algorithms",
        subtitle: "O(n log n) sorting and O(log n) searching",
        signature: "std::sort(begin, end)  |  std::lower_bound(begin, end, val)",
        descLong: "STL provides introsort (std::sort, O(n log n) average), stable_sort (preserves equal-element order), partial_sort (sort first K elements), and nth_element (find the Kth element in O(n)). Binary search requires sorted ranges: lower_bound returns iterator to first element ≥ value, upper_bound returns first > value. Use custom comparators for complex sorting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sorting & Searching Algorithms — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <algorithm>\n#include <vector>\n#include <iostream>\n\nint main() {\n    std::vector<int> v = {5, 2, 8, 1, 9, 3, 7, 4, 6};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sorting & Searching Algorithms — common patterns you'll see in production.\n// APPROACH  - Combine Sorting & Searching Algorithms with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sort ascending (introsort: O(n log n))\n    std::sort(v.begin(), v.end());\n    // {1, 2, 3, 4, 5, 6, 7, 8, 9}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sorting & Searching Algorithms — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Sort descending with custom comparator,    std::sort(v.begin(), v.end(), std::greater<int>());,\n\n    // Sort by custom criteria,    struct Person { std::string name; int age; };,    std::vector<Person> people = {{\"Alice\", 30}, {\"Bob\", 25}, {\"Charlie\", 35}};,    std::sort(people.begin(), people.end(),,              [](const Person& a, const Person& b) { return a.age < b.age; });,\n\n    // Stable sort (preserves relative order of equal elements),    std::stable_sort(people.begin(), people.end(),,                     [](const Person& a, const Person& b) { return a.age < b.age; });,\n\n    // Partial sort: only sort first 3 elements,    std::vector<int> scores = {85, 92, 78, 95, 88, 72, 99};,    std::partial_sort(scores.begin(), scores.begin() + 3, scores.end(), std::greater<>());,    // Top 3 are now at front: {99, 95, 92, ...},\n\n    // nth_element: find median in O(n),    std::vector<int> data = {5, 2, 8, 1, 9, 3, 7};,    auto mid = data.begin() + data.size() / 2;,    std::nth_element(data.begin(), mid, data.end());,    std::cout << \"Median: \" << *mid << \"\\n\";  // 5,\n\n    // Binary search (requires sorted range),    std::vector<int> sorted = {1, 2, 3, 4, 5, 6, 7, 8, 9};,    bool found = std::binary_search(sorted.begin(), sorted.end(), 5);  // true,\n\n    // lower_bound: first element >= value,    auto it = std::lower_bound(sorted.begin(), sorted.end(), 5);,    // upper_bound: first element > value,    auto it2 = std::upper_bound(sorted.begin(), sorted.end(), 5);,\n\n    // equal_range: both bounds at once,    auto [lo, hi] = std::equal_range(sorted.begin(), sorted.end(), 5);,}"
                  }
        ],
        tips: [
                  "std::sort is not stable — use stable_sort when relative order of equal elements matters.",
                  "nth_element is O(n) average — much faster than full sort when you only need the Kth element.",
                  "lower_bound/upper_bound return iterators — check against end() before dereferencing.",
                  "Use std::greater<>() (with empty template) for descending order — works with any comparable type."
        ],
        mistake: "Calling binary_search/lower_bound on an unsorted range — results are undefined. Always sort first or use a sorted container like std::set.",
        shorthand: {
          verbose: "int arr[] = {5, 2, 8, 1};\nstd::sort(arr, arr + 4);\nint pos = std::lower_bound(arr, arr + 4, 5) - arr;",
          concise: "std::vector<int> v = {5, 2, 8, 1};\nstd::ranges::sort(v);\nauto it = std::ranges::lower_bound(v, 5);",
        },
      },
      {
        id: "transform-accumulate",
        fn: "Transform, Accumulate & Functional Algorithms",
        desc: "Apply functions across ranges — transform, accumulate, for_each, count_if, any_of, all_of.",
        category: "Algorithms",
        subtitle: "Functional-style operations on containers",
        signature: "std::transform(begin, end, out, fn)  |  std::accumulate(begin, end, init)",
        descLong: "STL functional algorithms apply operations without explicit loops. transform: map a function over elements. accumulate: fold/reduce to a single value. count_if/any_of/all_of/none_of: predicates. remove_if + erase: the erase-remove idiom. These compose cleanly and express intent better than raw loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Transform, Accumulate & Functional Algorithms — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <algorithm>\n#include <numeric>\n#include <vector>\n#include <string>\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Transform, Accumulate & Functional Algorithms — common patterns you'll see in production.\n// APPROACH  - Combine Transform, Accumulate & Functional Algorithms with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// transform: apply function to each element\n    std::vector<int> doubled(nums.size());\n    std::transform(nums.begin(), nums.end(), doubled.begin(),\n                   [](int n) { return n * 2; });\n    // {2, 4, 6, 8, 10}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Transform, Accumulate & Functional Algorithms — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// transform in-place,    std::transform(nums.begin(), nums.end(), nums.begin(),,                   [](int n) { return n * n; });,    // {1, 4, 9, 16, 25},\n\n    // accumulate (fold/reduce),    int sum = std::accumulate(nums.begin(), nums.end(), 0);,    int product = std::accumulate(nums.begin(), nums.end(), 1, std::multiplies<>());,\n\n    // String concatenation with accumulate,    std::vector<std::string> words = {\"Hello\", \" \", \"World\"};,    std::string sentence = std::accumulate(words.begin(), words.end(), std::string{});,\n\n    // Predicate algorithms,    std::vector<int> data = {2, 4, 6, 8, 10};,    bool all_even = std::all_of(data.begin(), data.end(), [](int n) { return n % 2 == 0; });,    bool any_big = std::any_of(data.begin(), data.end(), [](int n) { return n > 5; });,    bool none_neg = std::none_of(data.begin(), data.end(), [](int n) { return n < 0; });,    int count = std::count_if(data.begin(), data.end(), [](int n) { return n > 5; });,\n\n    // Erase-remove idiom,    std::vector<int> v = {1, 2, 3, 2, 4, 2, 5};,    v.erase(std::remove(v.begin(), v.end(), 2), v.end());,    // {1, 3, 4, 5},\n\n    // Remove with predicate,    v.erase(std::remove_if(v.begin(), v.end(), [](int n) { return n > 3; }), v.end());,\n\n    // C++20: std::erase / std::erase_if (no idiom needed),    // std::erase(v, 2);,    // std::erase_if(v, [](int n) { return n > 3; });,\n\n    // generate: fill with computed values,    std::vector<int> seq(10);,    int counter = 0;,    std::generate(seq.begin(), seq.end(), [&counter]() { return counter++; });,    // {0, 1, 2, 3, 4, 5, 6, 7, 8, 9},\n\n    // iota: simpler sequence generation,    std::iota(seq.begin(), seq.end(), 1);  // {1, 2, ..., 10},}"
                  }
        ],
        tips: [
                  "Prefer algorithm + lambda over raw loops — it expresses intent clearly and is often optimized better.",
                  "accumulate's initial value determines the return type — use 0.0 for doubles, 0 for ints.",
                  "C++20 std::erase/erase_if replaces the verbose erase-remove idiom — use it when available.",
                  "std::transform with two input ranges zips them together — like Python's map(fn, a, b)."
        ],
        mistake: "Using std::remove alone without erase — remove only moves elements and returns the new logical end. Without erase, the vector still has its original size with garbage at the end.",
        shorthand: {
          verbose: "std::vector<int> v = {1, 2, 3};\nint sum = 0;\nfor (int x : v) sum += x * x;",
          concise: "std::vector<int> v = {1, 2, 3};\nint sum = std::accumulate(v.begin(), v.end(), 0, \n  [](int a, int b) { return a + b * b; });",
        },
      },
      {
        id: "ranges-views",
        fn: "C++20 Ranges & Views",
        desc: "Compose lazy, pipeable operations on sequences — filter, transform, take, drop without temporary containers.",
        category: "Modern C++",
        subtitle: "std::views::filter, transform, take, split, zip",
        signature: "auto result = v | views::filter(pred) | views::transform(fn) | views::take(n);",
        descLong: "C++20 Ranges replace iterator pairs with composable, lazy views. Views don't copy data — they create a pipeline that evaluates on demand. The pipe operator (|) chains operations fluently. views::filter, transform, take, drop, reverse, split, join, zip cover most needs. Range algorithms (ranges::sort, ranges::find) accept containers directly without .begin()/.end().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++20 Ranges & Views — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <ranges>\n#include <vector>\n#include <iostream>\n#include <string>\n#include <algorithm>\n\nnamespace views = std::views;\nnamespace ranges = std::ranges;\n\nint main() {\n    std::vector<int> nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++20 Ranges & Views — common patterns you'll see in production.\n// APPROACH  - Combine C++20 Ranges & Views with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Pipe syntax: filter → transform → take\n    auto result = nums\n        | views::filter([](int n) { return n % 2 == 0; })  // {2,4,6,8,10}\n        | views::transform([](int n) { return n * n; })     // {4,16,36,64,100}\n        | views::take(3);                                    // {4,16,36}\n\n    for (int n : result) std::cout << n << \" \";  // 4 16 36"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++20 Ranges & Views — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Lazy evaluation — nothing computed until iterated,    auto expensive = nums,        | views::filter([](int n) { std::cout << \"f\"; return n > 5; }),        | views::transform([](int n) { std::cout << \"t\"; return n * 2; }),        | views::take(2);,    // Only processes elements until 2 results are found,\n\n    // Range algorithms (no .begin()/.end() needed),    ranges::sort(nums);,    auto it = ranges::find(nums, 5);,    int count = ranges::count_if(nums, [](int n) { return n > 5; });,\n\n    // views::iota — infinite sequence,    for (int n : views::iota(1) | views::take(5)) {,        std::cout << n << \" \";  // 1 2 3 4 5,    },\n\n    // views::enumerate (C++23) / views::zip,    std::vector<std::string> names = {\"Alice\", \"Bob\", \"Charlie\"};,    // C++23: for (auto [i, name] : views::enumerate(names)) { ... },\n\n    // views::split and views::join,    std::string csv = \"a,b,c,d\";,    for (auto word : csv | views::split(',')) {,        // each word is a subrange,    },\n\n    // Collect into container,    auto evens = nums | views::filter([](int n) { return n % 2 == 0; });,    std::vector<int> even_vec(evens.begin(), evens.end());,    // C++23: auto even_vec = evens | ranges::to<std::vector>();,}"
                  }
        ],
        tips: [
                  "Views are lazy — no computation happens until you iterate. This makes long pipelines efficient.",
                  "ranges::sort(v) is cleaner than std::sort(v.begin(), v.end()) — range algorithms accept containers directly.",
                  "views::iota(0) creates an infinite sequence — always pair with take() or use in a bounded loop.",
                  "C++23 ranges::to<vector>() materializes a view into a container — the missing piece in C++20."
        ],
        mistake: "Storing a view that references a temporary — views are non-owning. If the source container is destroyed, the view dangles. Always ensure the source outlives the view.",
        shorthand: {
          verbose: "std::vector<int> v = {1, 2, 3, 4, 5};\nstd::vector<int> evens;\nfor (int x : v) { if (x % 2 == 0) evens.push_back(x); }",
          concise: "std::vector<int> v = {1, 2, 3, 4, 5};\nauto evens = v | std::views::filter([](int x) { return x % 2 == 0; });",
        },
      },
    ],
  },

  // ── Section 2: Filesystem & Chrono ─────────────────────────────────────────
  {
    id: "filesystem-chrono",
    title: "Filesystem & Chrono",
    entries: [
      {
        id: "filesystem",
        fn: "std::filesystem — File & Directory Operations",
        desc: "Portable file system operations — path manipulation, directory iteration, file status, copy, and remove.",
        category: "Standard Library",
        subtitle: "std::filesystem::path, directory_iterator, copy, remove",
        signature: "namespace fs = std::filesystem;  |  fs::path p(\"dir/file.txt\");",
        descLong: "C++17 std::filesystem provides portable file operations previously requiring platform-specific APIs or Boost. path handles OS-specific separators. directory_iterator and recursive_directory_iterator traverse directories. File operations: copy, rename, remove, create_directory. File status: exists, is_regular_file, is_directory, file_size, last_write_time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::filesystem — File & Directory Operations — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <filesystem>\n#include <iostream>\n#include <fstream>\n\nnamespace fs = std::filesystem;\n\nint main() {\n    // Path manipulation\n    fs::path p = \"/home/user/project/src/main.cpp\";\n    std::cout << p.filename()      << \"\\n\";  // \"main.cpp\"\n    std::cout << p.stem()          << \"\\n\";  // \"main\"\n    std::cout << p.extension()     << \"\\n\";  // \".cpp\"\n    std::cout << p.parent_path()   << \"\\n\";  // \"/home/user/project/src\"\n    std::cout << p.root_path()     << \"\\n\";  // \"/\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::filesystem — File & Directory Operations — common patterns you'll see in production.\n// APPROACH  - Combine std::filesystem — File & Directory Operations with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Path composition\n    fs::path dir = \"/home/user\";\n    fs::path file = dir / \"documents\" / \"report.pdf\";  // operator/"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::filesystem — File & Directory Operations — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Check existence and type,    if (fs::exists(p)) {,        if (fs::is_regular_file(p)),            std::cout << \"Size: \" << fs::file_size(p) << \" bytes\\n\";,        if (fs::is_directory(p)),            std::cout << \"Is directory\\n\";,    },\n\n    // Create directories (including parents),    fs::create_directories(\"output/logs/2024\");,\n\n    // Directory iteration,    for (const auto& entry : fs::directory_iterator(\"/home/user\")) {,        std::cout << entry.path().filename(),                  << \" [\" << (entry.is_directory() ? \"DIR\" : \"FILE\") << \"]\\n\";,    },\n\n    // Recursive iteration with filtering,    for (const auto& entry : fs::recursive_directory_iterator(\"src\")) {,        if (entry.path().extension() == \".cpp\") {,            std::cout << entry.path() << \" (\" << entry.file_size() << \" bytes)\\n\";,        },    },\n\n    // File operations,    fs::copy(\"source.txt\", \"backup.txt\", fs::copy_options::overwrite_existing);,    fs::rename(\"old_name.txt\", \"new_name.txt\");,    fs::remove(\"temp.txt\");,    fs::remove_all(\"temp_directory\");  // recursive,\n\n    // Disk space,    auto space = fs::space(\"/\");,    std::cout << \"Free: \" << space.free / (1024*1024*1024) << \" GB\\n\";,}"
                  }
        ],
        tips: [
                  "Use operator/ for path composition — it handles OS-specific separators automatically.",
                  "directory_iterator is non-recursive; use recursive_directory_iterator for full tree traversal.",
                  "Always check fs::exists() before operations — or use the error_code overload to avoid exceptions.",
                  "fs::copy with copy_options::recursive copies entire directory trees."
        ],
        mistake: "Using string concatenation for paths (\"dir/\" + \"file\") — it doesn't handle OS separators. Use fs::path and operator/ for portable path construction.",
        shorthand: {
          verbose: "// Manual / verbose approach\nconst char* path = \"data.txt\";\nstruct stat st; stat(path, &st); printf(\"Size: %ld\", st.st_size);\n// More explicit but longer",
          concise: "namespace fs = std::filesystem;\nauto size = fs::file_size(\"data.txt\");",
        },
      },
      {
        id: "chrono",
        fn: "std::chrono — Time & Duration",
        desc: "Type-safe time handling — clocks, durations, time points, and formatting.",
        category: "Standard Library",
        subtitle: "steady_clock, system_clock, duration, time_point",
        signature: "auto start = chrono::steady_clock::now();  |  chrono::duration_cast<chrono::milliseconds>(d)",
        descLong: "std::chrono provides type-safe time handling with zero-overhead abstractions. Three clocks: system_clock (wall time, can go backwards), steady_clock (monotonic, for measuring elapsed time), high_resolution_clock (highest precision). Durations are typed: seconds, milliseconds, microseconds. C++20 adds calendar types, time zones, and formatting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::chrono — Time & Duration — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <chrono>\n#include <iostream>\n#include <thread>\n\nnamespace chrono = std::chrono;\n\nint main() {\n    // Measure elapsed time (use steady_clock, NOT system_clock)\n    auto start = chrono::steady_clock::now();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::chrono — Time & Duration — common patterns you'll see in production.\n// APPROACH  - Combine std::chrono — Time & Duration with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ... work ...\n    std::this_thread::sleep_for(chrono::milliseconds(150));\n\n    auto end = chrono::steady_clock::now();\n    auto elapsed = chrono::duration_cast<chrono::milliseconds>(end - start);\n    std::cout << \"Elapsed: \" << elapsed.count() << \" ms\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::chrono — Time & Duration — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Duration arithmetic (type-safe),    auto total = chrono::hours(2) + chrono::minutes(30) + chrono::seconds(15);,    auto in_seconds = chrono::duration_cast<chrono::seconds>(total);,    std::cout << in_seconds.count() << \" seconds\\n\";  // 9015,\n\n    // Floating-point duration,    chrono::duration<double> fp_seconds = end - start;,    std::cout << fp_seconds.count() << \" seconds\\n\";,\n\n    // System clock for wall time,    auto now = chrono::system_clock::now();,    auto time_t = chrono::system_clock::to_time_t(now);,    std::cout << std::ctime(&time_t);,\n\n    // C++20: Calendar types,    // using namespace chrono;,    // auto today = year_month_day{floor<days>(system_clock::now())};,    // auto christmas = 2024y/December/25;,    // std::cout << std::format(\"{:%Y-%m-%d}\", today);,\n\n    // Timer utility,    struct Timer {,        chrono::steady_clock::time_point start_;,        Timer() : start_(chrono::steady_clock::now()) {},        ~Timer() {,            auto elapsed = chrono::steady_clock::now() - start_;,            auto ms = chrono::duration_cast<chrono::microseconds>(elapsed);,            std::cout << \"Scope took: \" << ms.count() << \" μs\\n\";,        },    };,,    {,        Timer t;,        // ... code to benchmark ...,    }  // prints elapsed time when scope exits,}"
                  }
        ],
        tips: [
                  "Use steady_clock for measuring elapsed time — system_clock can jump due to NTP adjustments.",
                  "Duration literals: 100ms, 2s, 30min (C++14) — more readable than chrono::milliseconds(100).",
                  "duration_cast truncates — use floor, ceil, or round for explicit rounding behavior.",
                  "The RAII Timer pattern (constructor/destructor) is the simplest way to benchmark code blocks."
        ],
        mistake: "Using system_clock for performance measurement — it can go backwards when the system syncs time. Always use steady_clock (monotonic) for elapsed time.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntime_t now = time(nullptr); printf(\"Time: %ld\", now);\n// More explicit but longer",
          concise: "auto now = std::chrono::system_clock::now();\nauto duration = now.time_since_epoch();",
        },
      },
      {
        id: "regex-cpp",
        fn: "std::regex — Pattern Matching",
        desc: "Regular expressions in C++ — match, search, replace, and iterate over matches.",
        category: "Standard Library",
        subtitle: "regex_match, regex_search, regex_replace, sregex_iterator",
        signature: "std::regex re(\"pattern\");  |  std::regex_match(str, re)  |  std::smatch m;",
        descLong: "C++ <regex> provides ECMAScript-style regex. regex_match checks if the ENTIRE string matches. regex_search finds the first match anywhere. regex_replace substitutes matches. sregex_iterator iterates all matches. Capture groups via smatch. Note: std::regex is notoriously slow — for performance-critical code, use RE2, PCRE2, or CTRE (compile-time regex).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::regex — Pattern Matching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <regex>\n#include <string>\n#include <iostream>\n\nint main() {\n    // Full match\n    std::regex email_re(R\"([\\w.]+@[\\w]+\\.[a-z]{2,})\");\n    std::string addr = \"user@example.com\";\n    bool valid = std::regex_match(addr, email_re);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::regex — Pattern Matching — common patterns you'll see in production.\n// APPROACH  - Combine std::regex — Pattern Matching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Search (find first match)\n    std::string text = \"Call 555-1234 or 555-5678\";\n    std::regex phone_re(R\"((\\d{3})-(\\d{4}))\");\n    std::smatch match;\n\n    if (std::regex_search(text, match, phone_re)) {\n        std::cout << \"Full match: \" << match[0] << \"\\n\";  // 555-1234\n        std::cout << \"Area: \" << match[1] << \"\\n\";        // 555\n        std::cout << \"Number: \" << match[2] << \"\\n\";      // 1234\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::regex — Pattern Matching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Iterate all matches,    auto begin = std::sregex_iterator(text.begin(), text.end(), phone_re);,    auto end = std::sregex_iterator();,    for (auto it = begin; it != end; ++it) {,        std::cout << \"Found: \" << (*it)[0] << \"\\n\";,    },\n\n    // Replace,    std::string censored = std::regex_replace(text, phone_re, \"XXX-XXXX\");,    // \"Call XXX-XXXX or XXX-XXXX\",\n\n    // Replace with backreference,    std::string reformatted = std::regex_replace(text, phone_re, \"($1) $2\");,    // \"Call (555) 1234 or (555) 5678\",\n\n    // Parse structured data,    std::string log = \"2024-01-15 ERROR: Connection timeout (retry 3/5)\";,    std::regex log_re(R\"((\\d{4}-\\d{2}-\\d{2}) (\\w+): (.+))\");,    if (std::regex_match(log, match, log_re)) {,        std::cout << \"Date: \" << match[1] << \"\\n\";,        std::cout << \"Level: \" << match[2] << \"\\n\";,        std::cout << \"Message: \" << match[3] << \"\\n\";,    },}"
                  }
        ],
        tips: [
                  "Use raw string literals R\"(...)\" to avoid double-escaping backslashes in regex patterns.",
                  "regex_match requires FULL string match; regex_search finds a match ANYWHERE — common confusion.",
                  "Compile regex once and reuse — regex construction is expensive, matching is comparatively cheap.",
                  "For performance-critical code, use CTRE (compile-time regex) or RE2 instead of std::regex."
        ],
        mistake: "Constructing std::regex inside a loop — regex compilation is expensive (can be milliseconds). Compile once outside the loop and reuse the regex object.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::regex re(\"^[a-z]+@[a-z]+\\.[a-z]+$\");\nif (std::regex_match(email, re)) { /* valid */ }\n// More explicit but longer",
          concise: "std::regex re(R\"(^w+@w+.w+$)\");\nif (std::regex_match(email, re)) { /* valid */ }",
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
        id: "threads-mutex",
        fn: "Threads, Mutex & Lock Guards",
        desc: "Multi-threaded programming — create threads, protect shared data with mutexes, and avoid data races.",
        category: "Concurrency",
        subtitle: "std::thread, mutex, lock_guard, scoped_lock",
        signature: "std::thread t(fn, args...);  |  std::lock_guard<std::mutex> lock(mtx);",
        descLong: "std::thread creates OS threads. Shared data requires synchronization — std::mutex with lock_guard (RAII lock). C++17 scoped_lock locks multiple mutexes deadlock-free. shared_mutex allows multiple readers or one writer. jthread (C++20) auto-joins on destruction. Always prefer higher-level abstractions (async, parallel algorithms) when possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Threads, Mutex & Lock Guards — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <thread>\n#include <mutex>\n#include <shared_mutex>\n#include <vector>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Threads, Mutex & Lock Guards — common patterns you'll see in production.\n// APPROACH  - Combine Threads, Mutex & Lock Guards with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Shared data protected by mutex\nclass ThreadSafeCounter {\n    mutable std::mutex mtx_;\n    int count_ = 0;\n\npublic:\n    void increment() {\n        std::lock_guard<std::mutex> lock(mtx_);  // RAII: unlocks on scope exit\n        ++count_;\n    }\n\n    int get() const {\n        std::lock_guard<std::mutex> lock(mtx_);\n        return count_;\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Threads, Mutex & Lock Guards — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reader-writer lock (multiple readers OR one writer),class Config {,    mutable std::shared_mutex mtx_;,    std::map<std::string, std::string> data_;,,public:,    std::string get(const std::string& key) const {,        std::shared_lock lock(mtx_);  // multiple readers OK,        return data_.at(key);,    },,    void set(const std::string& key, const std::string& val) {,        std::unique_lock lock(mtx_);  // exclusive write,        data_[key] = val;,    },};,,int main() {,    ThreadSafeCounter counter;,\n\n    // Create threads,    std::vector<std::thread> threads;,    for (int i = 0; i < 10; ++i) {,        threads.emplace_back([&counter]() {,            for (int j = 0; j < 1000; ++j) counter.increment();,        });,    },\n\n    // Join all threads,    for (auto& t : threads) t.join();,    std::cout << \"Count: \" << counter.get() << \"\\n\";  // 10000,\n\n    // C++20 jthread: auto-joins on destruction,    // {,    //     std::jthread t([](std::stop_token st) {,    //         while (!st.stop_requested()) { /* work */ },    //     });,    // }  // auto-joins here, can request stop,\n\n    // Lock multiple mutexes safely (deadlock-free),    // std::mutex m1, m2;,    // std::scoped_lock lock(m1, m2);  // locks both atomically,}"
                  }
        ],
        tips: [
                  "Always use lock_guard or scoped_lock — never call mutex.lock()/unlock() directly (exception-unsafe).",
                  "scoped_lock(m1, m2) locks multiple mutexes deadlock-free — replaces the std::lock() dance.",
                  "shared_mutex allows concurrent readers — much better throughput than mutex for read-heavy workloads.",
                  "C++20 jthread auto-joins and supports cooperative cancellation via stop_token."
        ],
        mistake: "Accessing shared data without a mutex — data races are undefined behavior in C++. Even \"just reading\" an int while another thread writes is UB.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::mutex m; { std::lock_guard<std::mutex> lock(m); counter++; }\n// More explicit but longer",
          concise: "std::mutex m; { std::scoped_lock lock(m); counter++; }",
        },
      },
      {
        id: "async-future",
        fn: "std::async, Future & Promise",
        desc: "High-level async programming — launch tasks and get results via futures without manual thread management.",
        category: "Concurrency",
        subtitle: "std::async, std::future, std::promise",
        signature: "auto fut = std::async(std::launch::async, fn, args...);  |  fut.get();",
        descLong: "std::async launches a task potentially on another thread and returns a std::future for the result. future::get() blocks until the result is ready. std::promise/future pairs enable manual communication between threads. async with launch::async guarantees a new thread; launch::deferred runs lazily on get(). Prefer async over raw threads for simple parallelism.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::async, Future & Promise — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <future>\n#include <iostream>\n#include <numeric>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::async, Future & Promise — common patterns you'll see in production.\n// APPROACH  - Combine std::async, Future & Promise with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Parallel computation with async\nlong long parallel_sum(const std::vector<int>& data) {\n    if (data.size() < 10000) {\n        return std::accumulate(data.begin(), data.end(), 0LL);\n    }\n\n    auto mid = data.begin() + data.size() / 2;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::async, Future & Promise — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Launch first half asynchronously,    auto future = std::async(std::launch::async,,        [&]() { return std::accumulate(data.begin(), mid, 0LL); });,\n\n    // Compute second half on this thread,    auto right = std::accumulate(mid, data.end(), 0LL);,,    return future.get() + right;  // .get() blocks until ready,},,int main() {,    // Simple async call,    auto result = std::async(std::launch::async, []() {,        // expensive computation,        return 42;,    });,    std::cout << result.get() << \"\\n\";  // 42,\n\n    // Multiple async tasks,    auto f1 = std::async(std::launch::async, fetch_user, user_id);,    auto f2 = std::async(std::launch::async, fetch_orders, user_id);,    auto f3 = std::async(std::launch::async, fetch_prefs, user_id);,,    auto user = f1.get();    // all three run in parallel,    auto orders = f2.get();,    auto prefs = f3.get();,\n\n    // Promise/future for manual thread communication,    std::promise<std::string> promise;,    std::future<std::string> future = promise.get_future();,,    std::thread producer([&promise]() {,        // ... do work ...,        promise.set_value(\"result data\");,    });,,    std::string data = future.get();  // blocks until promise is set,    producer.join();,}"
                  }
        ],
        tips: [
                  "std::async(launch::async, ...) guarantees a new thread — without the flag, it may be deferred.",
                  "future.get() can only be called ONCE — it moves the result out. Call future.valid() to check first.",
                  "Use async for embarrassingly parallel tasks (independent computations) — simpler than raw threads.",
                  "future destructor blocks if from std::async — this is the \"fire and forget\" gotcha."
        ],
        mistake: "Ignoring the return value of std::async — the returned future blocks in its destructor, so the task always runs synchronously. Always capture the future: auto f = std::async(...).",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::thread t([](){ std::cout << \"Task\"; });\nt.join();\n// More explicit but longer",
          concise: "auto result = std::async(std::launch::async, [](){ return 42; });\nint val = result.get();",
        },
      },
    ],
  },
]

export default { meta, sections }
