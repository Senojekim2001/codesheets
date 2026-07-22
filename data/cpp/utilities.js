export const meta = {
  "id": "cpp-utilities",
  "label": "Utilities & Type Support",
  "icon": "⚡",
  "description": "Modern C++ vocabulary types, formatting, type traits, and compile-time programming."
}

export const sections = [

  // ── Section 1: Vocabulary Types ─────────────────────────────────────────
  {
    id: "vocabulary-types",
    title: "Vocabulary Types",
    entries: [
      {
        id: "variant",
        fn: "std::variant",
        desc: "Type-safe union — holds exactly one of several alternative types at any time.",
        category: "Utilities",
        subtitle: "Type-safe union with visit pattern",
        signature: "std::variant<int, string, double> v;  |  std::visit(visitor, v)",
        descLong: "std::variant (C++17) is a type-safe replacement for C unions. It holds one value from a fixed set of types. std::visit applies a callable to the active alternative — the visitor pattern for variants. Accessing the wrong type throws std::bad_variant_access. Use std::holds_alternative<T> to check, or std::get_if<T> for safe access.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::variant — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <variant>\n#include <string>\n#include <iostream>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::variant — common patterns you'll see in production.\n// APPROACH  - Combine std::variant with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic usage\nstd::variant<int, double, std::string> value;\nvalue = 42;                         // holds int\nvalue = 3.14;                       // now holds double\nvalue = \"hello\";                    // now holds string"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::variant — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Access,std::string s = std::get<std::string>(value);  // OK,// std::get<int>(value);            // throws std::bad_variant_access!,\n\n// Safe access,if (auto* p = std::get_if<std::string>(&value)) {,    std::cout << \"String: \" << *p << \"\\n\";,},\n\n// Check active type,if (std::holds_alternative<int>(value)) {,    std::cout << \"It's an int\\n\";,},\n\n// ── std::visit — the power of variant ────────────────,// Visitor with overloaded lambdas,template<class... Ts>,struct overloaded : Ts... { using Ts::operator()...; };,,auto print_visitor = overloaded{,    [](int i)         { std::cout << \"int: \" << i << \"\\n\"; },,    [](double d)      { std::cout << \"double: \" << d << \"\\n\"; },,    [](const std::string& s) { std::cout << \"string: \" << s << \"\\n\"; },,};,,std::visit(print_visitor, value);,\n\n// ── Real-world: AST / expression tree ────────────────,struct Add;,struct Mul;,struct Lit { double value; };,,using Expr = std::variant<Lit, std::shared_ptr<Add>, std::shared_ptr<Mul>>;,,struct Add { Expr left, right; };,struct Mul { Expr left, right; };,\n\n// Heterogeneous collection,std::vector<std::variant<int, double, std::string>> mixed;,mixed.push_back(42);,mixed.push_back(3.14);,mixed.push_back(std::string(\"hello\"));,,for (const auto& item : mixed) {,    std::visit([](const auto& v) { std::cout << v << \" \"; }, item);,}"
                  }
        ],
        tips: [
                  "The overloaded{} pattern with lambdas is the cleanest way to handle variants — memorize it.",
                  "std::visit with a generic lambda ([](const auto& v){}) handles all types uniformly.",
                  "variant is value-type (no heap allocation) — more efficient than polymorphism for small type sets.",
                  "Use std::monostate as the first type if you need a default-constructible variant with no meaningful default."
        ],
        mistake: "Using std::get<T>() without checking the active type first — it throws std::bad_variant_access. Use std::get_if<T>() or std::holds_alternative<T>() for safe access.",
        shorthand: {
          verbose: "// Manual / verbose approach\nunion Value { int i; float f; }; // unsafe, no type info\n// More explicit but longer",
          concise: "std::variant<int, float> v = 42;\nif (std::holds_alternative<int>(v)) { int i = std::get<int>(v); }",
        },
      },
      {
        id: "tuple-pair",
        fn: "std::tuple & std::pair",
        desc: "Fixed-size heterogeneous collections — return multiple values, structured bindings, and compile-time access.",
        category: "Utilities",
        subtitle: "Multiple return values and heterogeneous storage",
        signature: "std::tuple<int, string, double>  |  auto [a, b, c] = make_tuple(...)",
        descLong: "std::pair holds two values; std::tuple holds any number. Combined with structured bindings (C++17), they enable clean multiple return values. std::tie creates tuples of references for unpacking. std::apply calls a function with tuple elements as arguments. Prefer named structs for public APIs — tuples are best for internal/temporary groupings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::tuple & std::pair — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <tuple>\n#include <string>\n#include <iostream>\n#include <map>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::tuple & std::pair — common patterns you'll see in production.\n// APPROACH  - Combine std::tuple & std::pair with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// std::pair\nstd::pair<std::string, int> p{\"Alice\", 30};\nauto p2 = std::make_pair(\"Bob\", 25);\nstd::cout << p.first << \": \" << p.second << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::tuple & std::pair — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// std::tuple,std::tuple<int, std::string, double> t{1, \"hello\", 3.14};,auto t2 = std::make_tuple(2, \"world\", 2.71);,\n\n// Access by index,int id = std::get<0>(t);           // 1,std::string name = std::get<1>(t); // \"hello\",\n\n// ── Structured bindings (C++17) — the clean way ─────,auto [num, text, val] = t;,std::cout << num << \" \" << text << \" \" << val << \"\\n\";,\n\n// With maps,std::map<std::string, int> scores{{\"Alice\", 95}, {\"Bob\", 87}};,for (const auto& [name, score] : scores) {,    std::cout << name << \": \" << score << \"\\n\";,},\n\n// ── Multiple return values ──────────────────────────,struct ParseResult { bool success; int value; std::string error; };,\n\n// Option 1: tuple (quick and dirty),auto divide(int a, int b) -> std::tuple<bool, double, std::string> {,    if (b == 0) return {false, 0.0, \"division by zero\"};,    return {true, static_cast<double>(a) / b, \"\"};,},,auto [ok, result, err] = divide(10, 3);,\n\n// Option 2: named struct (preferred for public APIs),ParseResult parse(const std::string& input) {,    // ...,    return {true, 42, \"\"};,},\n\n// ── std::tie for comparison operators ───────────────,struct Point { int x, y, z; };,bool operator<(const Point& a, const Point& b) {,    return std::tie(a.x, a.y, a.z) < std::tie(b.x, b.y, b.z);,},\n\n// ── std::apply — call function with tuple args ──────,auto add = [](int a, int b) { return a + b; };,auto args = std::make_tuple(3, 4);,int sum = std::apply(add, args);  // 7"
                  }
        ],
        tips: [
                  "Structured bindings (auto [a, b] = ...) make tuples/pairs ergonomic — always prefer over std::get<N>().",
                  "Use named structs over tuples for public APIs — get<0>() at call sites is unreadable.",
                  "std::tie for lexicographic comparison: tie(a.x, a.y) < tie(b.x, b.y) compares fields in order.",
                  "std::tuple_size_v<T> and std::tuple_element_t<N, T> enable generic tuple programming."
        ],
        mistake: "Returning std::tuple<int, int, int, int> from a public function — callers can't tell what get<2>() means. Return a named struct instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::pair<int, std::string> p(42, \"hello\");\nint id = p.first; std::string name = p.second;\n// More explicit but longer",
          concise: "auto [id, name] = std::make_tuple(42, \"hello\");\n// or: std::pair<int, std::string> p = {42, \"hello\"};",
        },
      },
      {
        id: "any-span",
        fn: "std::any & std::span",
        desc: "Type-erased storage (any) and non-owning view over contiguous data (span).",
        category: "Utilities",
        subtitle: "Runtime type erasure and safe array views",
        signature: "std::any a = 42;  |  std::span<int> view(arr);",
        descLong: "std::any (C++17) holds a value of any type — like a type-safe void*. Uses heap allocation for large types, small buffer optimization for small ones. std::span (C++20) is a non-owning view over contiguous memory — replaces (T* ptr, size_t len) pairs with a safe, bounds-aware abstraction. span works with arrays, vectors, and any contiguous container.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::any & std::span — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <any>\n#include <span>\n#include <vector>\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::any & std::span — common patterns you'll see in production.\n// APPROACH  - Combine std::any & std::span with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── std::any — type-safe void* ──────────────────────\nstd::any value = 42;\nstd::cout << std::any_cast<int>(value) << \"\\n\";  // 42\n\nvalue = std::string(\"hello\");\nstd::cout << std::any_cast<std::string>(value) << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::any & std::span — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Safe access,if (value.type() == typeid(std::string)) {,    auto s = std::any_cast<std::string>(value);,},\n\n// Pointer cast — returns nullptr on mismatch (no throw),if (auto* p = std::any_cast<int>(&value)) {,    std::cout << *p << \"\\n\";,} else {,    std::cout << \"Not an int\\n\";,},,value.reset();                   // clear contents,bool empty = !value.has_value(); // true,\n\n// ── std::span — non-owning contiguous view ──────────,void printAll(std::span<const int> data) {,    for (int x : data) {,        std::cout << x << \" \";,    },    std::cout << \"\\n\";,},\n\n// Works with any contiguous container!,int arr[] = {1, 2, 3, 4, 5};,std::vector<int> vec = {10, 20, 30};,std::array<int, 3> stdArr = {100, 200, 300};,,printAll(arr);                    // C array,printAll(vec);                    // vector,printAll(stdArr);                 // std::array,\n\n// Subviews,std::span<int> full(vec);,auto first2 = full.first(2);     // {10, 20},auto last2 = full.last(2);       // {20, 30},auto mid = full.subspan(1, 1);   // {20},\n\n// Fixed-size span (compile-time size),std::span<int, 3> fixed(stdArr);,// std::span<int, 5> wrong(vec);  // ERROR: vec has dynamic size,\n\n// Span with byte-level access,auto bytes = std::as_bytes(full);,auto writable = std::as_writable_bytes(full);"
                  }
        ],
        tips: [
                  "Use std::span<const T> for function parameters instead of const vector<T>& — works with any contiguous container.",
                  "std::any has overhead (heap allocation, type erasure) — prefer variant when types are known at compile time.",
                  "span is non-owning — ensure the underlying data outlives the span (dangling span = dangling pointer).",
                  "Fixed-size span<T, N> enables compile-time bounds checking and optimization."
        ],
        mistake: "Returning std::span from a function that creates a local vector — the span dangles when the vector is destroyed. span is non-owning; only use it for parameters and local views.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::vector<int> v = {1, 2, 3};\nint* ptr = v.data(); int len = v.size();\n// More explicit but longer",
          concise: "std::span<int> s(v.data(), v.size());\nfor (int x : s) { }",
        },
      },
    ],
  },

  // ── Section 2: Formatting & Type Traits ─────────────────────────────────────────
  {
    id: "format-traits",
    title: "Formatting & Type Traits",
    entries: [
      {
        id: "format",
        fn: "std::format (C++20)",
        desc: "Python-style string formatting — type-safe, fast, and extensible replacement for printf and stringstream.",
        category: "Formatting",
        subtitle: "Format strings with {}, positional args, and custom formatters",
        signature: "std::format(\"{} is {} years old\", name, age)  |  std::format(\"{:.2f}\", 3.14159)",
        descLong: "std::format (C++20) brings Python/Rust-style formatting to C++. It's type-safe (no %d/%s mismatch), faster than stringstream, and extensible via custom formatters. std::print (C++23) combines format + output. Format spec: {index:fill_align_sign_width.precision_type}. Replaces printf, sprintf, and stringstream for most use cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::format (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <format>\n#include <iostream>\n#include <string>\n#include <vector>\n\nint main() {\n    // Basic formatting\n    std::string s = std::format(\"Hello, {}!\", \"World\");      // \"Hello, World!\"\n    std::string s2 = std::format(\"{} + {} = {}\", 1, 2, 3);  // \"1 + 2 = 3\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::format (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine std::format (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Positional arguments\n    auto msg = std::format(\"{1} before {0}\", \"world\", \"hello\");  // \"hello before world\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::format (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Number formatting,    auto pi = std::format(\"{:.4f}\", 3.14159);       // \"3.1416\",    auto sci = std::format(\"{:e}\", 1234567.89);     // \"1.234568e+06\",    auto hex = std::format(\"{:#x}\", 255);           // \"0xff\",    auto bin = std::format(\"{:#b}\", 42);            // \"0b101010\",    auto sep = std::format(\"{:L}\", 1000000);        // \"1,000,000\" (locale),\n\n    // Width & alignment,    auto left  = std::format(\"{:<10}\", \"left\");     // \"left      \",    auto right = std::format(\"{:>10}\", \"right\");    // \"     right\",    auto center = std::format(\"{:^10}\", \"mid\");     // \"   mid    \",    auto fill = std::format(\"{:*^10}\", \"mid\");      // \"***mid****\",\n\n    // Zero-padding,    auto padded = std::format(\"{:05d}\", 42);        // \"00042\",\n\n    // std::format_to — write to iterator (avoids allocation),    std::string buffer;,    std::format_to(std::back_inserter(buffer), \"{}: {}\", \"key\", \"value\");,\n\n    // C++23: std::print (format + output in one),    // std::print(\"Hello, {}!\\n\", \"World\");,    // std::println(\"Line with newline: {}\", 42);,\n\n    // Table formatting,    std::vector<std::pair<std::string, int>> data = {,        {\"Alice\", 95}, {\"Bob\", 87}, {\"Charlie\", 92},    };,    std::cout << std::format(\"{:<10} {:>5}\\n\", \"Name\", \"Score\");,    std::cout << std::string(16, '-') << \"\\n\";,    for (const auto& [name, score] : data) {,        std::cout << std::format(\"{:<10} {:>5}\\n\", name, score);,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "std::format is type-safe — no %d vs %s mismatches. Wrong types are compile-time errors.",
                  "Use std::format_to with back_inserter for building strings without temporary allocations.",
                  "C++23 std::print/println replaces cout << format() — cleaner and often faster.",
                  "Custom formatters: specialize std::formatter<YourType> to make your types formattable."
        ],
        mistake: "Still using sprintf for formatted strings — it's not type-safe (UB on type mismatch), can overflow buffers, and can't handle std::string. Use std::format instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::string msg = \"Hello \" + name + \", count=\" + std::to_string(count);\n// More explicit but longer",
          concise: "std::string msg = std::format(\"Hello {}, count={}\", name, count);",
        },
      },
      {
        id: "type-traits",
        fn: "Type Traits & Compile-Time Logic",
        desc: "Query and transform types at compile time — the foundation of template metaprogramming and constexpr-if.",
        category: "Metaprogramming",
        subtitle: "is_integral, remove_const, enable_if, constexpr if",
        signature: "std::is_integral_v<T>  |  std::remove_const_t<T>  |  if constexpr (cond)",
        descLong: "Type traits (<type_traits>) let you inspect and transform types at compile time. Query traits (is_integral, is_same, is_class) return bool. Transformation traits (remove_const, decay, common_type) produce new types. Combined with constexpr if (C++17), they enable different code paths based on type properties without SFINAE complexity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Type Traits & Compile-Time Logic — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <type_traits>\n#include <iostream>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Type Traits & Compile-Time Logic — common patterns you'll see in production.\n// APPROACH  - Combine Type Traits & Compile-Time Logic with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Query traits ────────────────────────────────────\nstatic_assert(std::is_integral_v<int>);           // true\nstatic_assert(std::is_floating_point_v<double>);  // true\nstatic_assert(std::is_same_v<int, int32_t>);      // true (usually)\nstatic_assert(std::is_class_v<std::string>);      // true\nstatic_assert(std::is_pointer_v<int*>);           // true"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Type Traits & Compile-Time Logic — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── constexpr if — compile-time branching ───────────,template<typename T>,std::string serialize(const T& value) {,    if constexpr (std::is_integral_v<T>) {,        return \"int:\" + std::to_string(value);,    } else if constexpr (std::is_floating_point_v<T>) {,        return \"float:\" + std::to_string(value);,    } else if constexpr (std::is_same_v<T, std::string>) {,        return \"str:\" + value;,    } else {,        static_assert(false, \"Unsupported type\");  // C++23,    },},,auto s1 = serialize(42);           // \"int:42\",auto s2 = serialize(3.14);         // \"float:3.140000\",auto s3 = serialize(std::string(\"hello\"));  // \"str:hello\",\n\n// ── Transformation traits ───────────────────────────,using T1 = std::remove_const_t<const int>;        // int,using T2 = std::remove_reference_t<int&>;         // int,using T3 = std::decay_t<const int&>;              // int,using T4 = std::add_pointer_t<int>;               // int*,using T5 = std::common_type_t<int, double>;       // double,\n\n// ── Custom type trait ───────────────────────────────,template<typename T>,struct is_string : std::false_type {};,,template<>,struct is_string<std::string> : std::true_type {};,,template<>,struct is_string<const char*> : std::true_type {};,,template<typename T>,constexpr bool is_string_v = is_string<T>::value;,,static_assert(is_string_v<std::string>);          // true,static_assert(!is_string_v<int>);                 // true,\n\n// ── Practical: safe numeric conversion ──────────────,template<typename To, typename From>,To safe_cast(From value) {,    static_assert(std::is_arithmetic_v<From> && std::is_arithmetic_v<To>,,        \"safe_cast requires arithmetic types\");,,    if constexpr (std::is_same_v<To, From>) {,        return value;,    } else {,        auto result = static_cast<To>(value);,        if (static_cast<From>(result) != value) {,            throw std::overflow_error(\"Lossy conversion\");,        },        return result;,    },}"
                  }
        ],
        tips: [
                  "Use _v and _t suffixes: is_integral_v<T> instead of is_integral<T>::value, remove_const_t<T> instead of remove_const<T>::type.",
                  "constexpr if eliminates branches at compile time — untaken branches don't need to compile for the given type.",
                  "static_assert with type traits catches type errors at compile time with custom messages.",
                  "std::decay_t<T> removes const, reference, and array-to-pointer — simulates \"pass by value\" type."
        ],
        mistake: "Using runtime if with type traits instead of constexpr if — the untaken branch still compiles and may cause errors. constexpr if discards the untaken branch entirely.",
        shorthand: {
          verbose: "// Manual / verbose approach\nvoid func(int) { } // manual overloads\n// More explicit but longer",
          concise: "template<typename T>\nenable_if_t<std::is_integral_v<T>> func(T) { }",
        },
      },
      {
        id: "modules-cpp20",
        fn: "Modules (C++20)",
        desc: "Replace #include with import for faster compilation, better encapsulation, and no macro leakage.",
        category: "Organization",
        subtitle: "import, export module, module partitions",
        signature: "export module mylib;  |  import mylib;  |  import <iostream>;",
        descLong: "C++20 modules replace the textual #include preprocessor model. Modules are compiled once (not re-parsed per translation unit), drastically reducing compile times. They provide true encapsulation — only exported names are visible. No header guards needed, no macro leakage, no include order issues. Adoption is gradual; compiler support varies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Modules (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Module interface unit: math.cppm ─────────────────\nexport module math;             // declare module name"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Modules (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine Modules (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Only exported names are visible to importers\nexport constexpr double PI = 3.14159265358979;\n\nexport double area(double radius) {\n    return PI * radius * radius;\n}\n\nexport double circumference(double radius) {\n    return 2 * PI * radius;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Modules (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Not exported — internal implementation detail,double helper(double x) {      // module-private,    return x * x;,},\n\n// Export a class,export class Circle {,public:,    explicit Circle(double r) : radius_(r) {},    double area() const { return PI * radius_ * radius_; },    double circumference() const { return 2 * PI * radius_; },private:,    double radius_;,};,\n\n// ── Module implementation unit: math_impl.cpp ───────,module math;                    // implements math (no \"export\"),\n\n// Can define functions declared in the interface,// Has access to non-exported names,\n\n// ── Consumer: main.cpp ──────────────────────────────,import math;                    // import the module,// import <iostream>;           // import standard headers as modules (C++23),#include <iostream>             // still works,,int main() {,    std::cout << math::PI << \"\\n\";     // if using namespace,    std::cout << area(5.0) << \"\\n\";,    Circle c(3.0);,    std::cout << c.area() << \"\\n\";,    // helper(5.0);                     // ERROR: not exported,    return 0;,},\n\n// ── Build (CMake example) ───────────────────────────,// cmake_minimum_required(VERSION 3.28),// project(myapp CXX),// set(CMAKE_CXX_STANDARD 20),// add_executable(myapp main.cpp),// target_sources(myapp PUBLIC FILE_SET CXX_MODULES FILES math.cppm)"
                  }
        ],
        tips: [
                  "Modules compile once and cache the result — large projects see 2-10x compile time improvements.",
                  "Start by importing standard library headers: import <string>; import <vector>; (where supported).",
                  "Module partitions (export module math:geometry;) split large modules into manageable pieces.",
                  "CMake 3.28+ supports modules via FILE_SET CXX_MODULES — earlier versions need workarounds."
        ],
        mistake: "Mixing #include and import of the same header inconsistently — can cause ODR violations. Decide per-header: either always #include or always import.",
        shorthand: {
          verbose: "// Manual / verbose approach\n#include \"header.h\" // parse entire header every time\n// More explicit but longer",
          concise: "import mymodule; // compile once, import fast",
        },
      },
    ],
  },
]

export default { meta, sections }
