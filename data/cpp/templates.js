export const meta = {
  "id": "templates",
  "label": "Templates Deep Dive",
  "icon": "📐",
  "description": "C++ templates: SFINAE, concepts (C++20), variadic templates, CRTP, template metaprogramming, and constexpr."
}

export const sections = [

  // ── Section 1: Concepts & SFINAE ─────────────────────────────────────────
  {
    id: "concepts-sfinae",
    title: "Concepts & SFINAE",
    entries: [
      {
        id: "concepts-constraints",
        fn: "C++20 Concepts — Type Constraints & Requirements",
        desc: "Constrain templates with concepts: requires clauses, standard concepts, custom concepts, and replacing SFINAE.",
        category: "Concepts",
        subtitle: "concept, requires, std::integral, std::floating_point, std::same_as, constrained auto",
        signature: "template<std::integral T>  |  concept Name = requires(T a) { expr; }  |  requires clause",
        descLong: "C++20 concepts constrain template parameters with readable, composable requirements. They replace SFINAE (Substitution Failure Is Not An Error) with clear error messages and intent. Standard concepts include std::integral, std::floating_point, std::convertible_to, std::derived_from, std::invocable, and std::ranges::range. Custom concepts use requires expressions to specify operations a type must support. Concepts can constrain function templates, class templates, and auto parameters. They make generic code self-documenting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++20 Concepts — Type Constraints & Requirements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <concepts>\n#include <type_traits>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++20 Concepts — Type Constraints & Requirements — common patterns you'll see in production.\n// APPROACH  - Combine C++20 Concepts — Type Constraints & Requirements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Using standard concepts ─────────────────────────\ntemplate<std::integral T>\nT gcd(T a, T b) {\n    while (b != 0) { T t = b; b = a % b; a = t; }\n    return a;\n}\n\ngcd(12, 8);     // OK: int is integral\n// gcd(1.5, 2.0); // ERROR: clear message \"double does not satisfy integral\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++20 Concepts — Type Constraints & Requirements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Custom concept with requires expression ─────────,template<typename T>,concept Printable = requires(T a, std::ostream& os) {,    { os << a } -> std::convertible_to<std::ostream&>;,};,,template<typename T>,concept Hashable = requires(T a) {,    { std::hash<T>{}(a) } -> std::convertible_to<std::size_t>;,};,,template<typename T>,concept Container = requires(T c) {,    typename T::value_type;,    typename T::iterator;,    { c.begin() } -> std::input_or_output_iterator;,    { c.end() }   -> std::input_or_output_iterator;,    { c.size() }  -> std::convertible_to<std::size_t>;,};,\n\n// ── Multiple constraints ────────────────────────────,template<typename T>,    requires std::integral<T> && (sizeof(T) >= 4),T safe_multiply(T a, T b) {,    // Only for 32-bit+ integers,    return a * b;,},\n\n// ── Constrained auto ────────────────────────────────,void process(std::integral auto value) {,    // value is constrained to integral types,},,void print_all(Container auto const& c) {,    for (auto const& item : c) {,        std::cout << item << \" \";,    },},\n\n// ── Concept-based overloading ───────────────────────,template<std::integral T>,std::string to_string_impl(T value) {,    return std::to_string(value);,},,template<std::floating_point T>,std::string to_string_impl(T value) {,    return std::to_string(value);  // different precision handling,},,template<Printable T>,std::string to_string_impl(T const& value) {,    std::ostringstream oss;,    oss << value;,    return oss.str();,},\n\n// ── SFINAE (pre-C++20 pattern, still in legacy code) ─,// enable_if: enable function only if condition is true,template<typename T, typename = std::enable_if_t<std::is_arithmetic_v<T>>>,T old_style_add(T a, T b) { return a + b; },\n\n// Concepts replacement (much cleaner):,template<typename T> requires std::is_arithmetic_v<T>,T new_style_add(T a, T b) { return a + b; }"
                  }
        ],
        tips: [
                  "Concepts produce readable error messages (\"T does not satisfy Container\") vs SFINAE's cryptic template substitution failures.",
                  "Prefer standard concepts (std::integral, std::ranges::range) before writing custom ones — the standard library covers most needs.",
                  "Constrained auto (std::integral auto x) works in function parameters — shorthand for template<std::integral T> void f(T x).",
                  "Concepts are evaluated at compile time with zero runtime cost — they only affect which overloads/specializations are selected."
        ],
        mistake: "Still using enable_if and SFINAE in new C++20 code — concepts are strictly better: more readable, better error messages, and composable. Use enable_if only when targeting pre-C++20 compilers.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntemplate<typename T>\nvoid process(T val) { /* any type */ }\n// More explicit but longer",
          concise: "template<std::integral T>\nvoid process(T val) { /* only integral types */ }",
        },
      },
      {
        id: "variadic-crtp",
        fn: "Variadic Templates, CRTP & Fold Expressions",
        desc: "Advanced template patterns: parameter packs, fold expressions, CRTP for static polymorphism, and template metaprogramming.",
        category: "Templates",
        subtitle: "parameter pack, fold expression, CRTP, static polymorphism, constexpr if",
        signature: "template<typename... Ts>  |  (args + ...)  |  class D : Base<D>  |  if constexpr",
        descLong: "Variadic templates accept any number of template parameters using parameter packs (typename... Ts). Fold expressions (C++17) apply operators across packs without recursion: (args + ...) sums all args. CRTP (Curiously Recurring Template Pattern) enables static polymorphism — the base class uses the derived class as a template parameter, avoiding virtual dispatch overhead. if constexpr (C++17) enables compile-time branching that eliminates dead code. These patterns power libraries like std::tuple, std::variant, and type-safe printf.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variadic Templates, CRTP & Fold Expressions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <tuple>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variadic Templates, CRTP & Fold Expressions — common patterns you'll see in production.\n// APPROACH  - Combine Variadic Templates, CRTP & Fold Expressions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Variadic template function ──────────────────────\ntemplate<typename... Args>\nvoid print(Args const&... args) {\n    // C++17 fold expression: (expr, ...)\n    ((std::cout << args << \" \"), ...);\n    std::cout << \"\\n\";\n}\n\nprint(1, \"hello\", 3.14, true);  // 1 hello 3.14 1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variadic Templates, CRTP & Fold Expressions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Fold expressions ────────────────────────────────,template<typename... Ts>,auto sum(Ts... args) {,    return (args + ...);  // right fold: a + (b + (c + d)),},,template<typename... Ts>,bool all_true(Ts... args) {,    return (args && ...);  // fold with &&,},,template<typename T, typename... Ts>,bool any_of(T value, Ts... candidates) {,    return ((value == candidates) || ...);,},,if (any_of(status, \"active\", \"pending\", \"trial\")) { /* ... */ },\n\n// ── if constexpr (compile-time branching) ───────────,template<typename T>,auto stringify(T const& value) {,    if constexpr (std::is_arithmetic_v<T>) {,        return std::to_string(value);,    } else if constexpr (std::is_same_v<T, std::string>) {,        return value;,    } else {,        // Compile-time: only the matching branch is compiled,        return std::string(\"unknown\");,    },},\n\n// ── CRTP — Static polymorphism ──────────────────────,// Base class that \"knows\" the derived type,template<typename Derived>,class Shape {,public:,    double area() const {,        return static_cast<Derived const*>(this)->area_impl();,    },    void describe() const {,        std::cout << \"Area: \" << area() << \"\\n\";,    },};,,class Circle : public Shape<Circle> {,    double radius_;,public:,    Circle(double r) : radius_(r) {},    double area_impl() const { return 3.14159 * radius_ * radius_; },};,,class Square : public Shape<Square> {,    double side_;,public:,    Square(double s) : side_(s) {},    double area_impl() const { return side_ * side_; },};,\n\n// No virtual dispatch! Resolved at compile time.,template<typename S>,void print_area(Shape<S> const& shape) {,    shape.describe();  // calls correct area_impl via CRTP,},,Circle c(5.0);,print_area(c);  // Area: 78.5398,\n\n// ── Type-safe tuple processing ──────────────────────,template<typename Tuple, typename Func, std::size_t... Is>,void for_each_impl(Tuple& t, Func f, std::index_sequence<Is...>) {,    (f(std::get<Is>(t)), ...);  // fold over indices,},,template<typename... Ts, typename Func>,void for_each(std::tuple<Ts...>& t, Func f) {,    for_each_impl(t, f, std::index_sequence_for<Ts...>{});,},,auto tup = std::make_tuple(1, \"hello\", 3.14);,for_each(tup, [](auto const& val) {,    std::cout << val << \"\\n\";,});"
                  }
        ],
        tips: [
                  "Fold expressions (C++17) replace recursive variadic templates — (args + ...) is cleaner than the recursive base case pattern.",
                  "CRTP eliminates virtual dispatch overhead — use it in performance-critical paths where polymorphism is needed at compile time.",
                  "if constexpr eliminates dead branches at compile time — no runtime cost, and enables type-specific logic in generic code.",
                  "std::index_sequence + fold expressions enable compile-time tuple iteration — the standard pattern for processing heterogeneous containers."
        ],
        mistake: "Using virtual functions for performance-critical polymorphism that is known at compile time — CRTP provides the same flexibility with zero overhead. Use virtual only when the type is truly unknown until runtime.",
        shorthand: {
          verbose: "// Manual / verbose approach\nclass Base { public: virtual void method() = 0; };\nclass Derived : public Base { void method() override { } };\n// More explicit but longer",
          concise: "template<typename D>\nclass Base { public: void method() { static_cast<D*>(this)->methodImpl(); } };",
        },
      },
      {
        id: "template-specialization",
        fn: "Template Specialization — Full & Partial",
        desc: "Specialize templates for specific types: full specialization for exact types, partial specialization for type patterns, and pointer/reference specialization.",
        category: "Templates",
        subtitle: "template<>, full specialization, partial specialization, specializing pointers",
        signature: "template<> class Foo<int> { }  |  template<typename T> class Foo<T*> { }",
        descLong: "Template specialization allows you to provide custom implementations for specific template arguments. Full specialization (template<>) defines behavior for exact types (e.g., Foo<int>). Partial specialization (template<typename T>) matches patterns (e.g., Foo<T*> for pointers, Foo<T[]> for arrays). Specializations are useful for performance (SIMD optimizations for float), type traits, and type-specific behaviors. The compiler chooses the most specific specialization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Specialization — Full & Partial — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n#include <type_traits>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Specialization — Full & Partial — common patterns you'll see in production.\n// APPROACH  - Combine Template Specialization — Full & Partial with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Full specialization for int ─────────────────────\ntemplate<typename T>\nclass Container {\npublic:\n    void print() { std::cout << \"Generic container\\n\"; }\n};\n\ntemplate<>\nclass Container<int> {\npublic:\n    void print() { std::cout << \"Specialized for int\\n\"; }\n};\n\nContainer<double>().print();  // Generic container\nContainer<int>().print();     // Specialized for int"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Specialization — Full & Partial — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Partial specialization — all pointers ────────────,template<typename T>,class SmartPrinter {,public:,    static void print() {,        std::cout << \"Generic type\\n\";,    },};,,template<typename T>,class SmartPrinter<T*> {,public:,    static void print() {,        std::cout << \"Pointer to \" << typeid(T).name() << \"\\n\";,    },};,,SmartPrinter<int>::print();           // Generic type,SmartPrinter<double*>::print();       // Pointer to d,\n\n// ── Partial specialization — const pointers ────────,template<typename T>,class Editor {,public:,    static constexpr bool isConst = false;,};,,template<typename T>,class Editor<const T*> {,public:,    static constexpr bool isConst = true;,};,,static_assert(!Editor<int*>::isConst, \"\");,static_assert(Editor<const int*>::isConst, \"\");,\n\n// ── Partial specialization — arrays ─────────────────,template<typename T>,class Dimension {,public:,    static void print() { std::cout << \"Single element\\n\"; },};,,template<typename T, std::size_t N>,class Dimension<T[N]> {,public:,    static void print() {,        std::cout << \"Array of \" << N << \" elements\\n\";,    },};,,Dimension<int>::print();      // Single element,Dimension<int[10]>::print();  // Array of 10 elements,\n\n// ── Type trait specialization (common pattern) ──────,template<typename T>,struct IsPointer {,    static constexpr bool value = false;,};,,template<typename T>,struct IsPointer<T*> {,    static constexpr bool value = true;,};,,template<typename T>,struct IsPointer<std::unique_ptr<T>> {,    static constexpr bool value = true;,};,,static_assert(!IsPointer<int>::value, \"\");,static_assert(IsPointer<int*>::value, \"\");,static_assert(IsPointer<std::unique_ptr<int>>::value, \"\");,\n\n// ── Specialization for function pointers ────────────,template<typename T>,class FuncTraits {,public:,    static constexpr bool isCallable = false;,};,,template<typename R, typename... Args>,class FuncTraits<R(*)(Args...)> {,public:,    static constexpr bool isCallable = true;,    static constexpr int argCount = sizeof...(Args);,};,,static_assert(!FuncTraits<int>::isCallable, \"\");,static_assert(FuncTraits<int(*)(double, bool)>::isCallable, \"\");,static_assert(FuncTraits<int(*)(double, bool)>::argCount == 2, \"\");"
                  }
        ],
        tips: [
                  "Full specialization overrides ALL type parameters — use for exact-type optimizations (e.g., SIMD for floats).",
                  "Partial specialization matches patterns — use to handle categories (pointers, arrays, references) with a single definition.",
                  "Specialization order matters: compiler picks the most specific match. If multiple specialize equally, it's a compile error.",
                  "Specializations don't participate in SFINAE/concepts — they're full overrides. If a specialization doesn't match, the compiler doesn't fall back to the generic."
        ],
        mistake: "Trying to partially specialize function templates — C++ doesn't support partial function specialization. Use function overloading or SFINAE (enable_if) instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntemplate<typename T>\nstruct Traits { static constexpr bool isPointer = false; };\n// More explicit but longer",
          concise: "template<typename T>\nstruct Traits<T*> { static constexpr bool isPointer = true; };",
        },
      },
      {
        id: "template-sfinae",
        fn: "SFINAE — Substitution Failure Is Not An Error",
        desc: "Use enable_if, void_t, and detection idiom to enable templates conditionally based on type properties.",
        category: "Templates",
        subtitle: "enable_if, void_t, detection idiom, SFINAE tricks",
        signature: "template<typename T, typename = std::enable_if_t<...>>  |  std::void_t<...>  |  detection idiom",
        descLong: "SFINAE (Substitution Failure Is Not An Error) is a C++98 metaprogramming technique that silently removes function/class templates from overload resolution if template substitution fails. enable_if conditionally enables templates based on boolean conditions. void_t is a utility that converts any type list to void, enabling template detection. The detection idiom checks if types have specific members or operations. Modern C++20 prefers concepts, but SFINAE remains essential for legacy code and pre-C++20 compilers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SFINAE — Substitution Failure Is Not An Error — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <type_traits>\n#include <string>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SFINAE — Substitution Failure Is Not An Error — common patterns you'll see in production.\n// APPROACH  - Combine SFINAE — Substitution Failure Is Not An Error with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── enable_if basics ────────────────────────────────\ntemplate<typename T>\ntypename std::enable_if_t<std::is_integral_v<T>, T>\nmultiply(T a, T b) {\n    return a * b;  // Only for integral types\n}\n\nmultiply(3, 4);           // OK: int\n// multiply(1.5, 2.0);    // ERROR: removed from overload set"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SFINAE — Substitution Failure Is Not An Error — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── enable_if with return type ──────────────────────,template<typename T>,std::enable_if_t<std::is_floating_point_v<T>, T>,square(T x) {,    return x * x;,},,template<typename T>,std::enable_if_t<std::is_integral_v<T>, T>,square(T x) {,    return x * x;  // Same function, different specializations,},,square(3.14);  // floating_point version,square(5);     // integral version,\n\n// ── enable_if with template parameters ──────────────,template<typename T, typename = std::enable_if_t<std::is_arithmetic_v<T>>>,void process(T val) {,    std::cout << \"Processing: \" << val << \"\\n\";,},,process(42);      // OK,process(3.14);    // OK,// process(\"text\"); // ERROR: std::string is not arithmetic,\n\n// ── void_t utility (C++17) ──────────────────────────,// Converts any type sequence to void,template<typename... Ts>,using void_t = void;,\n\n// Detect if T has a .size() method,template<typename T, typename = void>,struct HasSize : std::false_type {};,,template<typename T>,struct HasSize<T, std::void_t<decltype(std::declval<T>().size())>>,    : std::true_type {};,,static_assert(HasSize<std::vector<int>>::value, \"\");,static_assert(!HasSize<int>::value, \"\");,\n\n// ── Detection idiom (standard pattern) ───────────────,// Check if type T has an operator<<,template<typename T, typename = void>,struct IsPrintable : std::false_type {};,,template<typename T>,struct IsPrintable<T, std::void_t<,    decltype(std::declval<std::ostream&>() << std::declval<const T&>()),>> : std::true_type {};,\n\n// Use it in a template,template<typename T>,std::enable_if_t<IsPrintable<T>::value, void>,print_if_printable(const T& value) {,    std::cout << value << \"\\n\";,},,print_if_printable(42);               // OK: int is printable,print_if_printable(std::string(\"hi\")); // OK,// print_if_printable(std::make_unique<int>(5)); // ERROR: unique_ptr not printable,\n\n// ── Detect callable types (function-like) ────────────,template<typename T, typename = void>,struct IsCallable : std::false_type {};,,template<typename T>,struct IsCallable<T, std::void_t<,    decltype(std::declval<T>()(std::declval<int>())),>> : std::true_type {};,,template<typename F>,std::enable_if_t<IsCallable<F>::value, void>,invoke_if_callable(F f) {,    f(42);,},,invoke_if_callable([](int x) { std::cout << x << \"\\n\"; });  // OK: lambda,// invoke_if_callable(5);  // ERROR: int is not callable,\n\n// ── Iterator category detection ─────────────────────,template<typename T, typename = void>,struct IsRandomAccessIterator : std::false_type {};,,template<typename T>,struct IsRandomAccessIterator<T, std::void_t<,    typename std::random_access_iterator_tag,,    typename std::iterator_traits<T>::iterator_category,,    decltype(std::declval<T>() + 1),>> : std::true_type {};,\n\n// ── SFINAE for member function overloading ──────────,class Widget {,public:,    template<typename T>,    std::enable_if_t<std::is_integral_v<T>, void>,    set_value(T val) {,        std::cout << \"Setting integer: \" << val << \"\\n\";,    },,    template<typename T>,    std::enable_if_t<std::is_floating_point_v<T>, void>,    set_value(T val) {,        std::cout << \"Setting float: \" << val << \"\\n\";,    },};,,Widget w;,w.set_value(10);    // integer version,w.set_value(3.14);  // float version"
                  }
        ],
        tips: [
                  "Use std::enable_if_t (C++14+) instead of typename std::enable_if<...>::type — it's shorter and clearer.",
                  "std::void_t is the foundation of detection patterns — it silently fails substitution if anything in the parameter list doesn't exist.",
                  "Detection patterns return std::true_type/std::false_type for use in enable_if conditions.",
                  "Concepts (C++20) are far better than SFINAE — they give clear error messages and are more composable. Use SFINAE only for legacy code."
        ],
        mistake: "Using SFINAE when concepts are available — concepts are strictly superior in C++20+: better error messages, more readable, composable. SFINAE should only be used for pre-C++20 code or libraries requiring older compiler support.",
        shorthand: {
          verbose: "template<typename T>\ntypename std::enable_if<std::is_arithmetic_v<T>, T>::type\nadd(T a, T b) { return a + b; }",
          concise: "template<typename T>\nstd::enable_if_t<std::is_arithmetic_v<T>, T>\nadd(T a, T b) { return a + b; }",
        },
      },
      {
        id: "template-variadic",
        fn: "Variadic Templates — Parameter Packs",
        desc: "Accept any number of template arguments using parameter packs, sizeof..., and pack expansion.",
        category: "Templates",
        subtitle: "typename... Ts, sizeof..., pack expansion, recursion",
        signature: "template<typename... Args>  |  sizeof...(Args)  |  func(args...)",
        descLong: "Variadic templates (C++11) enable functions and classes to accept any number of template parameters using parameter packs (typename... Args, int... Values). sizeof...(Args) returns the count of arguments at compile time. Pack expansion (args...) automatically expands packs in function calls, initializer lists, and expressions. Classic patterns include recursive expansion (base case + recursive case) and fold expressions (C++17) for operations across packs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variadic Templates — Parameter Packs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <tuple>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variadic Templates — Parameter Packs — common patterns you'll see in production.\n// APPROACH  - Combine Variadic Templates — Parameter Packs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic variadic function ─────────────────────────\ntemplate<typename... Args>\nvoid print_all(Args const&... args) {\n    // Fold expression (C++17) — simpler than recursion\n    ((std::cout << args << \" \"), ...);\n    std::cout << \"\\n\";\n}\n\nprint_all(1, \"hello\", 3.14, true);  // 1 hello 3.14 1"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variadic Templates — Parameter Packs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── sizeof... to count arguments ────────────────────,template<typename... Args>,void count_and_print(Args const&... args) {,    std::cout << \"Got \" << sizeof...(Args) << \" args\\n\";,    ((std::cout << args << \" \"), ...);,    std::cout << \"\\n\";,},,count_and_print(1, 2, 3, 4);  // Got 4 args,\n\n// ── Recursive pattern (pre-C++17 style) ─────────────,// Base case: no more arguments,template<typename T>,void print_recursive(T const& t) {,    std::cout << t << \"\\n\";,},\n\n// Recursive case: one arg + rest,template<typename T, typename... Ts>,void print_recursive(T const& t, Ts const&... ts) {,    std::cout << t << \" \";,    print_recursive(ts...);  // recurse with remaining pack,},,print_recursive(\"a\", \"b\", \"c\", \"d\");  // a b c d,\n\n// ── Pack expansion in initializer list ───────────────,template<typename T, typename... Args>,std::vector<T> make_vector(Args... args) {,    return std::vector<T>{ args... };  // pack expansion,},,auto vec = make_vector<int>(1, 2, 3, 4, 5);,\n\n// ── Heterogeneous tuple ─────────────────────────────,template<typename... Types>,class MyTuple {,    std::tuple<Types...> data;  // pack in template context,public:,    template<std::size_t I>,    auto get() { return std::get<I>(data); },,    static constexpr std::size_t size() {,        return sizeof...(Types);,    },};,,MyTuple<int, double, std::string> tup;,std::cout << tup.size() << \"\\n\";  // 3,\n\n// ── Variadic class constructor ──────────────────────,template<typename... Args>,class Container {,    std::tuple<Args...> items;,public:,    Container(Args... args) : items(args...) {},,    static constexpr int count() { return sizeof...(Args); },};,,Container<int, double, char> c(42, 3.14, 'x');,std::cout << c.count() << \"\\n\";  // 3,\n\n// ── Pack expansion with std::apply pattern ──────────,template<typename Func, typename Tuple, std::size_t... Is>,auto apply_impl(Func f, Tuple t, std::index_sequence<Is...>) {,    return f(std::get<Is>(t)...);  // pack expansion over indices,},,template<typename Func, typename Tuple>,auto apply(Func f, Tuple t) {,    using Indices = std::make_index_sequence<std::tuple_size_v<Tuple>>;,    return apply_impl(f, t, Indices{});,},,auto add = [](int a, int b, int c) { return a + b + c; };,auto result = apply(add, std::make_tuple(1, 2, 3));  // 6,\n\n// ── Variadic parameter forwarding ───────────────────,template<typename Func, typename... Args>,auto forward_call(Func f, Args&&... args) {,    return f(std::forward<Args>(args)...);  // perfect forwarding,},,forward_call([](int x, const char* s) {,    std::cout << x << \": \" << s << \"\\n\";,}, 42, \"test\");"
                  }
        ],
        tips: [
                  "Fold expressions (C++17) replace recursive variadic templates — (args + ...) is cleaner and faster to compile.",
                  "std::index_sequence + pack expansion is the pattern for iterating tuples at compile time.",
                  "std::forward<Args>(args...) enables perfect forwarding in variadic functions — essential for factory functions and wrappers.",
                  "sizeof...(Args) is a compile-time constant — use it in static_assert or template conditions."
        ],
        mistake: "Writing recursive variadic templates when fold expressions work — fold is more concise and compiles faster. Only use recursion for complex logic that fold cannot express.",
        shorthand: {
          verbose: "template<typename T>\nvoid print(T t) { std::cout << t << \"\\n\"; }\n\ntemplate<typename T, typename... Ts>\nvoid print(T t, Ts... ts) {\n    print(t);\n    print(ts...);  // recurse\n}",
          concise: "template<typename... Ts>\nvoid print(Ts... ts) {\n    ((std::cout << ts << \" \"), ...);  // C++17 fold\n}",
        },
      },
      {
        id: "template-fold-expressions",
        fn: "Fold Expressions (C++17) — Operators Over Packs",
        desc: "Apply binary operators across parameter packs with left/right folds and unary operators.",
        category: "Templates",
        subtitle: "right fold, left fold, (args + ...), (... + args), binary operators",
        signature: "(args + ...)  |  (... - args)  |  (args && ...)",
        descLong: "Fold expressions (C++17) apply a binary operator across all elements of a parameter pack. Right fold (args + ...) evaluates as a + (b + (c + d)). Left fold (... - args) evaluates as (((a - b) - c) - d). Unary right fold (args && ...) returns (a && (b && c)). Folds support arithmetic, logical, and bitwise operators. They eliminate recursion, improve compile times, and produce clearer code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Fold Expressions (C++17) — Operators Over Packs — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Fold Expressions (C++17) — Operators Over Packs — common patterns you'll see in production.\n// APPROACH  - Combine Fold Expressions (C++17) — Operators Over Packs with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Right fold (args op ...) ────────────────────────\ntemplate<typename... Args>\nauto sum_right(Args... args) {\n    return (args + ...);  // a + (b + (c + d))\n}\n\ntemplate<typename... Args>\nauto multiply_right(Args... args) {\n    return (args * ...);  // a * (b * (c * d))\n}\n\nstd::cout << sum_right(1, 2, 3, 4) << \"\\n\";  // 10\nstd::cout << multiply_right(2, 3, 4) << \"\\n\";  // 24"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Fold Expressions (C++17) — Operators Over Packs — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Left fold (... op args) ─────────────────────────,template<typename... Args>,auto subtract_left(Args... args) {,    return (... - args);  // (((a - b) - c) - d),},,std::cout << subtract_left(20, 3, 2, 1) << \"\\n\";  // 14,\n\n// ── Unary fold — no init value ──────────────────────,template<typename... Args>,bool all_true(Args... args) {,    return (args && ...);  // a && (b && c && d),},,template<typename... Args>,bool any_true(Args... args) {,    return (args || ...);  // a || (b || c || d),},,template<typename... Args>,int bitwise_or(Args... args) {,    return (args | ...);  // a | (b | c | d),},,std::cout << all_true(true, true, true) << \"\\n\";        // 1,std::cout << any_true(false, false, true) << \"\\n\";      // 1,std::cout << bitwise_or(0b0001, 0b0010, 0b0100) << \"\\n\"; // 7,\n\n// ── Binary fold with init value (init op ... op args) ─,template<typename... Args>,int product_with_init(int init, Args... args) {,    return (init * ... * args);  // init * a * b * c,},,std::cout << product_with_init(2, 3, 4, 5) << \"\\n\";  // 120,\n\n// ── Fold with comma operator (print all) ────────────,template<typename... Args>,void print_all(Args const&... args) {,    ((std::cout << args << \" \"), ...);  // (expr, ...) — comma operator,    std::cout << \"\\n\";,},,print_all(\"hello\", 42, 3.14, true);  // hello 42 3.14 1,\n\n// ── Fold with comparisons ───────────────────────────,template<typename... Args>,bool all_positive(Args... args) {,    return (... && (args > 0));  // init && (a > 0) && (b > 0) && ...,},,std::cout << all_positive(1, 2, 3) << \"\\n\";      // 1,std::cout << all_positive(1, -2, 3) << \"\\n\";     // 0,\n\n// ── String concatenation with fold ──────────────────,template<typename... Args>,std::string concat(Args const&... args) {,    std::string result;,    ((result += args), ...);  // result += a, result += b, ...,    return result;,},,std::cout << concat(\"hello\", \" \", \"world\") << \"\\n\";  // hello world,\n\n// ── Fold with custom operators ──────────────────────,struct Plus {,    template<typename A, typename B>,    auto operator()(A a, B b) const { return a + b; },};,,template<typename Op, typename... Args>,auto fold_with_op(Op op, Args... args) {,    return (args | ... | op);  // custom operator fold,},\n\n// Note: above is pseudo-code; actual custom op folds are trickier,\n\n// ── Fold with pointer operations ────────────────────,template<typename T, typename... Args>,std::string make_string(T const& value, Args const&... rest) {,    if constexpr (sizeof...(rest) == 0) {,        return std::to_string(value);,    } else {,        return std::to_string(value) + \",\" + make_string(rest...);,    },},\n\n// Alternative with fold:,template<typename... Args>,std::string make_string_fold(Args const&... args) {,    std::string result;,    ((result += (result.empty() ? \"\" : \",\") + std::to_string(args)), ...);,    return result;,},,std::cout << make_string_fold(1, 2, 3, 4) << \"\\n\";  // 1,2,3,4,\n\n// ── Fold for tuple/container operations ─────────────,template<typename Tuple, typename Func, std::size_t... Is>,void for_each_impl(Tuple& t, Func f, std::index_sequence<Is...>) {,    (f(std::get<Is>(t)), ...);  // fold over indices,},,template<typename... Ts, typename Func>,void for_each(std::tuple<Ts...>& t, Func f) {,    for_each_impl(t, f, std::index_sequence_for<Ts...>{});,},,auto tup = std::make_tuple(1, \"hello\", 3.14);,for_each(tup, [](auto const& val) {,    std::cout << val << \"\\n\";,});"
                  }
        ],
        tips: [
                  "Fold expressions eliminate recursion overhead — they expand at compile time to a single expression.",
                  "(args + ...) is right fold; (... + args) is left fold. For commutative ops, both are equivalent. For non-commutative (-, /), the order matters.",
                  "The comma operator fold ((expr, ...)) is powerful for side effects — use to repeat an action for each pack element.",
                  "Folds work with any operator: arithmetic (+, -, *, /), logical (&&, ||), bitwise (&, |, ^), comparison, pointer member (.*), comma, etc."
        ],
        mistake: "Forgetting the parentheses around a fold expression — (args + ...) is required syntax, not optional. (args + ... ) without parens is a syntax error.",
        shorthand: {
          verbose: "template<typename... Args>\nint sum(Args... args) {\n    int result = 0;\n    for (int x : {args...}) result += x;\n    return result;\n}",
          concise: "template<typename... Args>\nint sum(Args... args) {\n    return (args + ...);  // C++17 fold\n}",
        },
      },
      {
        id: "template-nttp",
        fn: "Non-Type Template Parameters (NTTP)",
        desc: "Use non-type values (integers, strings, pointers) as template parameters for compile-time computation.",
        category: "Templates",
        subtitle: "template<int N>, string literals NTTP, auto NTTP, std::integral constant",
        signature: "template<int N>  |  template<std::string_view S>  |  template<auto V>",
        descLong: "Non-type template parameters allow passing compile-time constants (integers, enums, pointers, addresses, strings via string_view in C++20) as template arguments. NTTPs enable array sizes, compile-time switches, and fixed strings without template specialization. C++20 expanded NTTP support: auto NTTP accepts any literal type, and std::string_view literals enable string-based templates. NTTPs power fixed-size arrays, bit flags, compile-time configuration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Non-Type Template Parameters (NTTP) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <array>\n#include <string_view>\n#include <cstring>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Non-Type Template Parameters (NTTP) — common patterns you'll see in production.\n// APPROACH  - Combine Non-Type Template Parameters (NTTP) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic integer NTTP ──────────────────────────────\ntemplate<int Size>\nclass StaticArray {\n    int data[Size];\npublic:\n    StaticArray() = default;\n    int get(int i) const { return data[i]; }\n    void set(int i, int v) { data[i] = v; }\n    static constexpr int size() { return Size; }\n};\n\nStaticArray<10> arr;\nstd::cout << arr.size() << \"\\n\";  // 10\n// arr[100] = 0;  // ERROR: arr[11] is out of bounds at compile time? No, but Size=10"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Non-Type Template Parameters (NTTP) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── NTTP for compile-time flags ─────────────────────,template<bool ThreadSafe>,class Logger {,public:,    void log(const char* msg) {,        if constexpr (ThreadSafe) {,            // Acquire lock,            std::cout << \"[LOCKED] \" << msg << \"\\n\";,        } else {,            std::cout << \"[FAST] \" << msg << \"\\n\";,        },    },};,,Logger<true> safe_log;,Logger<false> fast_log;,safe_log.log(\"threadsafe\");  // [LOCKED] threadsafe,fast_log.log(\"fast\");        // [FAST] fast,\n\n// ── String literal NTTP (C++20) ─────────────────────,template<std::string_view Name>,class Person {,public:,    void greet() const {,        std::cout << \"Hello, \" << Name << \"!\\n\";,    },};,,constexpr std::string_view alice = \"Alice\";,constexpr std::string_view bob = \"Bob\";,,Person<alice> p1;,Person<bob> p2;,p1.greet();  // Hello, Alice!,p2.greet();  // Hello, Bob!,\n\n// Note: C++20 allows passing string literals directly in some contexts:,// template<std::string_view S> requires that S be a constant expression,\n\n// ── auto NTTP (C++20) — any literal type ────────────,template<auto Value>,class Constant {,public:,    auto get() const { return Value; },};,,Constant<42> c1;,Constant<3.14> c2;,Constant<true> c3;,,std::cout << c1.get() << \"\\n\";  // 42,std::cout << c2.get() << \"\\n\";  // 3.14,std::cout << c3.get() << \"\\n\";  // 1 (true),\n\n// ── Enum NTTP ──────────────────────────────────────,enum class Mode { Strict, Relaxed, Debug };,,template<Mode M>,class Processor {,public:,    void process() {,        if constexpr (M == Mode::Strict) {,            std::cout << \"Strict validation\\n\";,        } else if constexpr (M == Mode::Debug) {,            std::cout << \"Debug mode\\n\";,        } else {,            std::cout << \"Relaxed mode\\n\";,        },    },};,,Processor<Mode::Strict>().process();  // Strict validation,Processor<Mode::Debug>().process();   // Debug mode,\n\n// ── Pointer/address NTTP (C++17) ────────────────────,int global_value = 100;,,template<int* Ptr>,class Accessor {,public:,    int read() const { return *Ptr; },    void write(int v) { *Ptr = v; },};,,Accessor<&global_value> acc;,std::cout << acc.read() << \"\\n\";  // 100,acc.write(200);,std::cout << global_value << \"\\n\";  // 200,\n\n// ── Function pointer NTTP ───────────────────────────,int add(int a, int b) { return a + b; },int mul(int a, int b) { return a * b; },,template<int (*Func)(int, int)>,class BinaryOp {,public:,    int apply(int a, int b) { return Func(a, b); },};,,BinaryOp<add> op1;,BinaryOp<mul> op2;,,std::cout << op1.apply(3, 4) << \"\\n\";  // 7,std::cout << op2.apply(3, 4) << \"\\n\";  // 12,\n\n// ── Compile-time fixed string (custom, C++20) ──────,template<std::size_t N>,struct FixedString {,    char data[N]{};,    constexpr FixedString(const char (&str)[N]) {,        std::copy_n(str, N, data);,    },    constexpr std::string_view view() const {,        return std::string_view(data, N - 1);,    },};,,template<FixedString Name>,class Named {,public:,    void identify() const {,        std::cout << \"I am \" << Name.view() << \"\\n\";,    },};,,Named<\"Alice\"> alice_obj;,alice_obj.identify();  // I am Alice"
                  }
        ],
        tips: [
                  "Integer NTTPs (int, std::size_t, enums) are the most common — use for array sizes, bit flags, and if constexpr branching.",
                  "C++20 string_view NTTP enables string-based templates — no need for custom tricks or macro strings.",
                  "auto NTTP (C++20) accepts any literal type — cleaner than separate templates for each type.",
                  "Pointer/function-pointer NTTPs are powerful but rare — use for dependency injection at compile time."
        ],
        mistake: "Using template<typename T, T Value> instead of template<auto Value> in C++20 — auto NTTP is shorter and more flexible.",
        shorthand: {
          verbose: "template<std::size_t N>\nclass Array {\n    int data[N];\n};",
          concise: "template<auto N>  // C++20\nclass Array {\n    int data[N];\n};",
        },
      },
      {
        id: "template-template-params",
        fn: "Template Template Parameters",
        desc: "Accept template classes/functions as template arguments, enabling container-agnostic code.",
        category: "Templates",
        subtitle: "template<template<typename> class C>, adapters, type erasure",
        signature: "template<template<typename> class Container>  |  Container<T> c",
        descLong: "Template template parameters allow passing template classes as arguments (template<template<typename> class Container>). This enables container-agnostic algorithms that work with any container type (vector, deque, list). Useful for building generic data structures, adapters, and policies. Modern C++17+ sometimes uses concepts instead for cleaner syntax.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Template Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <deque>\n#include <list>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Template Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Template Template Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic template template parameter ────────────────\ntemplate<template<typename> class Container>\nclass Stack {\n    Container<int> data;\npublic:\n    void push(int x) {\n        // Note: Container must support push_back\n        // This won't compile for all containers\n    }\n    int size() const { return data.size(); }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Template Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Will work with any container that has the right interface,// Stack<std::vector> stack1;     // OK,// Stack<std::deque> stack2;      // OK,// Stack<std::list> stack3;       // OK,\n\n// ── More flexible: template with allocator ──────────,template<,    template<typename, typename> class Container,,    typename T,,    typename Alloc = std::allocator<T>,>,class GenericStack {,    Container<T, Alloc> data;,public:,    void push(const T& val) { data.push_back(val); },    T pop() {,        T val = data.back();,        data.pop_back();,        return val;,    },    int size() const { return data.size(); },};,,GenericStack<std::vector, int> vs;,GenericStack<std::deque, double> ds;,GenericStack<std::list, std::string> ls;,\n\n// ── Container adapter example ───────────────────────,template<typename T, template<typename> class Container>,class Queue {,    Container<T> items;,public:,    void enqueue(const T& val) { items.push_back(val); },    T dequeue() {,        T val = items.front();,        items.erase(items.begin());,        return val;,    },    bool empty() const { return items.empty(); },};,,Queue<int, std::vector> q1;,Queue<int, std::deque> q2;,,q1.enqueue(1);,q1.enqueue(2);,std::cout << q1.dequeue() << \"\\n\";  // 1,\n\n// ── Policy-based design ─────────────────────────────,template<typename T, template<typename> class Container>,class Logger {,    Container<T> buffer;,public:,    void log(const T& msg) { buffer.push_back(msg); },    void flush() {,        for (const auto& msg : buffer) {,            std::cout << msg << \"\\n\";,        },        buffer.clear();,    },};,,Logger<std::string, std::vector> log1;,log1.log(\"Message 1\");,log1.log(\"Message 2\");,log1.flush();,\n\n// ── Type erasure with template templates ────────────,template<template<typename> class Container>,class DynamicStore {,    // Abstract interface,public:,    virtual ~DynamicStore() = default;,};,,template<typename T, template<typename> class Container>,class ConcreteStore : public DynamicStore<Container> {,    Container<T> data;,public:,    void add(const T& val) { data.push_back(val); },    int count() const { return data.size(); },};,\n\n// ── Forwarding to create nested templates ────────────,template<typename T, template<typename> class Inner>,class Wrapper {,public:,    using InnerType = Inner<T>;,};,,Wrapper<int, std::vector> w;,// w.InnerType is std::vector<int>"
                  }
        ],
        tips: [
                  "Template template parameters are powerful but complex — consider using concepts (C++20) for cleaner syntax.",
                  "The container must match the signature exactly — template<template<typename> class C> won't match containers needing allocators.",
                  "Use template<template<typename, typename...> class C> to handle containers with allocators.",
                  "Modern alternative: constrain with concepts instead of template templates for better error messages."
        ],
        mistake: "Trying to pass a container with allocator to a template<template<typename> class C> parameter — use template<template<typename, typename> class C> instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\ntemplate<typename Container>\nvoid process(Container<int>& c) { }\n// More explicit but longer",
          concise: "template<template<typename> class Container>\nvoid process(Container<int>& c) { }",
        },
      },
      {
        id: "crtp",
        fn: "CRTP — Curiously Recurring Template Pattern",
        desc: "Static polymorphism without virtual dispatch: derive from a template of yourself.",
        category: "Templates",
        subtitle: "class D : Base<D>, static polymorphism, zero-overhead polymorphism",
        signature: "class Derived : public Base<Derived>  |  Base<D*>(this)->method()",
        descLong: "CRTP (Curiously Recurring Template Pattern) enables compile-time polymorphism by having a derived class inherit from a template of itself: class Derived : Base<Derived>. The base class uses static_cast<Derived*>(this) to call derived methods without virtual function overhead. Ideal for performance-critical code, mixin patterns, and compile-time polymorphism. Widely used in game engines (transform hierarchies) and high-frequency trading systems.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CRTP — Curiously Recurring Template Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <memory>\n#include <cmath>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CRTP — Curiously Recurring Template Pattern — common patterns you'll see in production.\n// APPROACH  - Combine CRTP — Curiously Recurring Template Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic CRTP shape hierarchy ──────────────────────\ntemplate<typename Derived>\nclass Shape {\npublic:\n    double area() const {\n        return static_cast<Derived const*>(this)->area_impl();\n    }\n    void describe() const {\n        std::cout << \"Area: \" << area() << \"\\n\";\n    }\n};\n\nclass Circle : public Shape<Circle> {\n    double radius_;\npublic:\n    Circle(double r) : radius_(r) {}\n    double area_impl() const {\n        return 3.14159 * radius_ * radius_;\n    }\n};\n\nclass Square : public Shape<Square> {\n    double side_;\npublic:\n    Square(double s) : side_(s) {}\n    double area_impl() const {\n        return side_ * side_;\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CRTP — Curiously Recurring Template Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Usage — no virtual dispatch!,Circle c(5.0);,Square s(4.0);,c.describe();  // Area: 78.5398,s.describe();  // Area: 16,\n\n// ── CRTP with template function ─────────────────────,template<typename Derived>,class PrintableCRTP {,public:,    void print() const {,        static_cast<Derived const*>(this)->print_impl();,    },};,,class Dog : public PrintableCRTP<Dog> {,public:,    void print_impl() const { std::cout << \"🐕 Woof!\\n\"; },};,,class Cat : public PrintableCRTP<Cat> {,public:,    void print_impl() const { std::cout << \"🐈 Meow!\\n\"; },};,,Dog d;,Cat c;,d.print();  // 🐕 Woof!,c.print();  // 🐈 Meow!,\n\n// ── CRTP mixin pattern ──────────────────────────────,template<typename T>,class Equality {,public:,    bool operator==(const T& other) const {,        return static_cast<const T*>(this)->equals(other);,    },    bool operator!=(const T& other) const {,        return !(*this == other);,    },};,,template<typename T>,class Comparable {,public:,    bool operator<(const T& other) const {,        return static_cast<const T*>(this)->compare(other) < 0;,    },    bool operator<=(const T& other) const {,        return !(*this > other);,    },    bool operator>(const T& other) const {,        return other < *static_cast<const T*>(this);,    },    bool operator>=(const T& other) const {,        return !(*this < other);,    },};,,class Point : public Equality<Point>, public Comparable<Point> {,public:,    int x, y;,    Point(int x = 0, int y = 0) : x(x), y(y) {},,    bool equals(const Point& other) const {,        return x == other.x && y == other.y;,    },    int compare(const Point& other) const {,        if (x != other.x) return x - other.x;,        return y - other.y;,    },};,,Point p1(1, 2), p2(1, 2), p3(2, 3);,std::cout << (p1 == p2) << \"\\n\";  // 1 (true),std::cout << (p1 < p3) << \"\\n\";   // 1 (true),\n\n// ── CRTP for static interface enforcement ────────────,template<typename Derived>,class Renderer {,public:,    void render(int width, int height) {,        static_cast<Derived*>(this)->render_impl(width, height);,    },};,,class OpenGLRenderer : public Renderer<OpenGLRenderer> {,public:,    void render_impl(int w, int h) {,        std::cout << \"OpenGL: rendering \" << w << \"x\" << h << \"\\n\";,    },};,,class VulkanRenderer : public Renderer<VulkanRenderer> {,public:,    void render_impl(int w, int h) {,        std::cout << \"Vulkan: rendering \" << w << \"x\" << h << \"\\n\";,    },};,\n\n// Generic code accepting any Renderer<D>,template<typename D>,void display(Renderer<D>& renderer) {,    renderer.render(1920, 1080);,},,OpenGLRenderer ogl;,VulkanRenderer vk;,display(ogl);  // OpenGL: rendering 1920x1080,display(vk);   // Vulkan: rendering 1920x1080,\n\n// ── CRTP for compile-time checking ──────────────────,// Ensure Derived implements required methods,template<typename Derived>,class Callable {,protected:,    // This won't compile if Derived doesn't have invoke(),    static void check() {,        static_cast<Derived*>(nullptr)->invoke();,    },};,,class Task : public Callable<Task> {,public:,    void invoke() { std::cout << \"Task invoked\\n\"; },};,\n\n// Uncommenting this would fail to compile:,// class BadTask : public Callable<BadTask> {};  // no invoke() method"
                  }
        ],
        tips: [
                  "CRTP eliminates virtual dispatch — use for performance-critical polymorphism (game engines, trading systems).",
                  "The base class accesses derived methods via static_cast<Derived*>(this) — this is safe due to the inheritance contract.",
                  "CRTP + mixins enable composition of behaviors without multiple inheritance complexity.",
                  "Modern alternative: C++20 concepts can often replace CRTP with cleaner syntax, but CRTP remains excellent for forced interface compliance."
        ],
        mistake: "Using virtual functions when CRTP would work — virtual dispatch has overhead (virtual table lookup, branch misprediction). Use CRTP for compile-time polymorphism in performance-critical code.",
        shorthand: {
          verbose: "class Base { virtual void method() = 0; };\nclass Derived : Base { void method() override {} };\nBase* ptr = new Derived();\nptr->method();  // virtual dispatch",
          concise: "template<typename D> class Base {\n    void method() { static_cast<D*>(this)->impl(); }\n};\nclass Derived : Base<Derived> { void impl() {} };\nDerived d; d.method();  // static dispatch",
        },
      },
      {
        id: "template-metaprogramming",
        fn: "Template Metaprogramming — Compile-Time Computation",
        desc: "Compute values and types at compile time using templates, type_traits, and if constexpr.",
        category: "Templates",
        subtitle: "if constexpr, type_traits, std::enable_if, compile-time recursion",
        signature: "if constexpr(...)  |  std::is_arithmetic_v<T>  |  template metaprogramming",
        descLong: "Template metaprogramming uses templates and compile-time evaluation to generate code, compute values, and manipulate types. Type traits (std::is_integral, std::is_pointer, etc.) query type properties. if constexpr (C++17) enables compile-time branching that eliminates dead code. Recursion at compile time computes factorials, fibonacci, prime checks. TMP powers serialization, reflection, compile-time dispatch.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Metaprogramming — Compile-Time Computation — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <type_traits>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Metaprogramming — Compile-Time Computation — common patterns you'll see in production.\n// APPROACH  - Combine Template Metaprogramming — Compile-Time Computation with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Compile-time factorial ──────────────────────────\ntemplate<int N>\nstruct Factorial {\n    static constexpr int value = N * Factorial<N-1>::value;\n};\n\ntemplate<>\nstruct Factorial<0> {\n    static constexpr int value = 1;\n};\n\nstatic_assert(Factorial<5>::value == 120, \"\");\nstatic_assert(Factorial<10>::value == 3628800, \"\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Metaprogramming — Compile-Time Computation — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Compile-time fibonacci ──────────────────────────,template<int N>,struct Fib {,    static constexpr int value = Fib<N-1>::value + Fib<N-2>::value;,};,,template<>,struct Fib<0> { static constexpr int value = 0; };,,template<>,struct Fib<1> { static constexpr int value = 1; };,,constexpr int fib_10 = Fib<10>::value;  // 55, computed at compile time,\n\n// ── Type traits for conditional behavior ────────────,template<typename T>,void process(T value) {,    if constexpr (std::is_integral_v<T>) {,        std::cout << \"Integer: \" << value << \"\\n\";,    } else if constexpr (std::is_floating_point_v<T>) {,        std::cout << \"Float: \" << value << \"\\n\";,    } else if constexpr (std::is_same_v<T, std::string>) {,        std::cout << \"String: \" << value << \"\\n\";,    } else {,        std::cout << \"Other type\\n\";,    },},,process(42);           // Integer: 42,process(3.14);         // Float: 3.14,process(std::string(\"hi\"));  // String: hi,\n\n// ── Compile-time type checking ──────────────────────,template<typename T>,struct IsVector : std::false_type {};,,template<typename T>,struct IsVector<std::vector<T>> : std::true_type {};,,static_assert(IsVector<std::vector<int>>::value, \"\");,static_assert(!IsVector<int>::value, \"\");,\n\n// ── Compile-time function selection (if constexpr) ──,template<typename T>,auto stringify(const T& val) {,    if constexpr (std::is_same_v<T, int>) {,        return \"int: \" + std::to_string(val);,    } else if constexpr (std::is_same_v<T, double>) {,        return \"double: \" + std::to_string(val);,    } else if constexpr (std::is_same_v<T, std::string>) {,        return \"string: \" + val;,    } else {,        return \"unknown\";,    },},,std::cout << stringify(42) << \"\\n\";         // int: 42,std::cout << stringify(3.14) << \"\\n\";       // double: 3.140000,std::cout << stringify(std::string(\"hi\")) << \"\\n\";  // string: hi,\n\n// ── Compile-time sorting (never used in practice, but cool) ──,template<int... Ns>,struct SortedInts;,,template<>,struct SortedInts<> {,    static constexpr std::size_t count = 0;,};,\n\n// In real code, you'd use std::array + constexpr algorithms,constexpr std::array sorted = std::array{5, 3, 8, 1};  // sorted at runtime,\n\n// ── Type list processing ────────────────────────────,template<typename... Ts>,struct TypeList {};,,template<typename List>,struct TypeCount;,,template<typename... Ts>,struct TypeCount<TypeList<Ts...>> {,    static constexpr std::size_t value = sizeof...(Ts);,};,,using MyTypes = TypeList<int, double, std::string>;,constexpr auto count = TypeCount<MyTypes>::value;  // 3,\n\n// ── Compile-time string length ──────────────────────,template<std::size_t N>,constexpr std::size_t strlen_ct(const char (&str)[N]) {,    return N - 1;  // exclude null terminator,},,constexpr auto len = strlen_ct(\"hello\");  // 5,\n\n// ── Enable/disable features at compile time ────────,template<typename T, typename = std::enable_if_t<std::is_integral_v<T>>>,T safe_square(T x) {,    return x * x;,},,safe_square(5);      // OK,// safe_square(1.5);  // ERROR: enable_if condition fails,\n\n// ── Conditional type selection ──────────────────────,template<bool Condition, typename TrueType, typename FalseType>,struct conditional {,    using type = TrueType;,};,,template<typename TrueType, typename FalseType>,struct conditional<false, TrueType, FalseType> {,    using type = FalseType;,};,,using MyInt = conditional<true, int, double>::type;   // int,using MyDouble = conditional<false, int, double>::type;  // double,,static_assert(std::is_same_v<MyInt, int>, \"\");,static_assert(std::is_same_v<MyDouble, double>, \"\");"
                  }
        ],
        tips: [
                  "if constexpr (C++17) replaces template specialization for simple branching — cleaner and easier to read.",
                  "std::type_traits library provides 100+ type-checking predicates — use them instead of writing custom TMP.",
                  "Compile-time computation (Factorial<5>::value) happens at compile time with zero runtime cost.",
                  "TMP can make compile times slow — use sparingly and benchmark. Modern C++17+ often prefers if constexpr over complex template recursion."
        ],
        mistake: "Writing complex template recursion when if constexpr works — if constexpr is clearer, compiles faster, and produces better error messages.",
        shorthand: {
          verbose: "int factorial(int n) {\n    if (n <= 1) return 1;\n    return n * factorial(n - 1);\n}",
          concise: "template<int N>\nstruct Factorial {\n    static constexpr int value = N * Factorial<N-1>::value;\n};\ntemplate<>\nstruct Factorial<0> { static constexpr int value = 1; };",
        },
      },
      {
        id: "template-deduction-guides",
        fn: "Deduction Guides (C++17) — CTAD for Class Templates",
        desc: "Guide template argument deduction for class templates with deduction guides.",
        category: "Templates",
        subtitle: "deduction guide, CTAD, template<typename...>, constructor deduction",
        signature: "template<typename T> Foo(T) -> Foo<T>;  |  auto x = Foo(args);",
        descLong: "Class Template Argument Deduction (CTAD) automatically deduces template parameters from constructor arguments. Deduction guides (C++17) help the compiler when automatic deduction is ambiguous or impossible. A guide has the form: template<params> ClassName(args) -> ClassName<deduced_args>;. Guides are essential for user-defined types, wrappers, and adapters where constructor argument types don't directly map to template parameters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Deduction Guides (C++17) — CTAD for Class Templates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <memory>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Deduction Guides (C++17) — CTAD for Class Templates — common patterns you'll see in production.\n// APPROACH  - Combine Deduction Guides (C++17) — CTAD for Class Templates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic deduction guide ───────────────────────────\ntemplate<typename T>\nclass Wrapper {\n    T value;\npublic:\n    Wrapper(T v) : value(v) {}\n    T get() const { return value; }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Deduction Guides (C++17) — CTAD for Class Templates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Deduction guide: from constructor arg deduce template param,template<typename T>,Wrapper(T) -> Wrapper<T>;,,Wrapper w1(42);          // Deduces Wrapper<int>,Wrapper w2(3.14);        // Deduces Wrapper<double>,Wrapper w3(\"hello\");     // Deduces Wrapper<const char*>,,std::cout << w1.get() << \"\\n\";  // 42,\n\n// ── Without the guide, this would fail in older standards,\n\n// ── Deduction guide with decay_t ────────────────────,template<typename T>,class Container {,    T data;,public:,    Container(T d) : data(d) {},    T get() { return data; },};,\n\n// Guide that decays array to pointer,template<typename T, std::size_t N>,Container(T (&)[N]) -> Container<T*>;,,int arr[] = {1, 2, 3};,Container c(arr);  // Deduces Container<int*>,// Without the guide, would be Container<int[3]>, which is less useful,\n\n// ── Deduction guide for aggregates ──────────────────,template<typename T, typename U>,struct Pair {,    T first;,    U second;,};,\n\n// Deduction guide for Pair initialization,template<typename T, typename U>,Pair(T, U) -> Pair<T, U>;,,Pair p(1, \"hello\");  // Deduces Pair<int, const char*>,\n\n// ── Deduction guide for smart pointers ──────────────,template<typename T>,class UniquePtr {,    T* ptr;,public:,    UniquePtr(T* p) : ptr(p) {},    T* get() const { return ptr; },};,\n\n// Guide: new expr deduces the type,template<typename T>,UniquePtr(T*) -> UniquePtr<T>;,,int* raw_ptr = new int(42);,UniquePtr up(raw_ptr);  // Deduces UniquePtr<int>,\n\n// ── Deduction guide for conversion ──────────────────,class Widget {,public:,    int value;,    Widget(int v) : value(v) {},};,,template<typename T>,class Box {,    T item;,public:,    Box(T t) : item(t) {},    T get() const { return item; },};,\n\n// Deduction guide: Widget converts to Box<Widget>,Box(Widget) -> Box<Widget>;,,Box b(Widget(42));  // Deduces Box<Widget>,\n\n// ── Deduction guide failing case (ambiguous) ────────,template<typename T, typename U>,class Pair2 {,    T first;,    U second;,public:,    Pair2(T t, U u) : first(t), second(u) {},};,\n\n// Without guide:,// Pair2 p(1, 2);  // ERROR: ambiguous which is T vs U,\n\n// Deduction guide resolves it:,Pair2(int, int) -> Pair2<int, int>;,,Pair2 p(1, 2);  // OK: deduces Pair2<int, int>,\n\n// ── Deduction guide for nested templates ────────────,template<typename Container>,class Adapter {,    Container items;,public:,    Adapter(Container c) : items(c) {},};,,template<typename T>,Adapter(std::vector<T>) -> Adapter<std::vector<T>>;,,std::vector<int> v = {1, 2, 3};,Adapter a(v);  // Deduces Adapter<std::vector<int>>,\n\n// ── Multiple deduction guides for same class ───────,template<typename T>,class Multi {,    T value;,public:,    Multi(T v) : value(v) {},    Multi(int i, T t) : value(t) {}  // Two constructors,};,,template<typename T>,Multi(T) -> Multi<T>;,,template<typename T>,Multi(int, T) -> Multi<T>;,,Multi m1(42);       // First constructor,Multi m2(0, 42);    // Second constructor"
                  }
        ],
        tips: [
                  "Deduction guides enable CTAD — no need to write Wrapper<int>(42), just Wrapper(42).",
                  "Use std::decay_t or std::remove_reference_t in guides for arrays/references that should convert to pointers.",
                  "Guides are optional — CTAD works automatically in many cases. Only write guides when the compiler can't figure it out.",
                  "Multiple guides for one class are allowed — the compiler picks the most specific match."
        ],
        mistake: "Relying on automatic CTAD when the compiler can't deduce parameters — write an explicit deduction guide to help the compiler.",
        shorthand: {
          verbose: "// Manual / verbose approach\nstd::vector<int> v(5);  // explicit template argument\n// More explicit but longer",
          concise: "std::vector v(5);  // C++17 CTAD deduces vector<int> from size_t",
        },
      },
      {
        id: "constexpr-template",
        fn: "constexpr if — Compile-Time Branching in Templates",
        desc: "Branch at compile time with if constexpr, eliminating dead code paths.",
        category: "Templates",
        subtitle: "if constexpr, compile-time conditions, dead code elimination",
        signature: "if constexpr(condition) { ... } else { ... }",
        descLong: "constexpr if (C++17) enables compile-time branching: if the condition is true, the true branch is compiled; if false, the false branch is compiled. Dead branches are completely eliminated from the generated code. Unlike runtime if, the condition must be a compile-time constant. Enables type-specific behavior in generic functions without specialization or SFINAE.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of constexpr if — Compile-Time Branching in Templates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <type_traits>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of constexpr if — Compile-Time Branching in Templates — common patterns you'll see in production.\n// APPROACH  - Combine constexpr if — Compile-Time Branching in Templates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic if constexpr example ──────────────────────\ntemplate<typename T>\nvoid process(T value) {\n    if constexpr (std::is_integral_v<T>) {\n        // This branch compiled only for integral types\n        std::cout << \"Integer value: \" << value << \"\\n\";\n    } else if constexpr (std::is_floating_point_v<T>) {\n        // This branch compiled only for floating-point types\n        std::cout << \"Float value: \" << value << \"\\n\";\n    } else {\n        // Fallback for other types\n        std::cout << \"Other type\\n\";\n    }\n}\n\nprocess(42);    // Integer value: 42\nprocess(3.14);  // Float value: 3.14"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of constexpr if — Compile-Time Branching in Templates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Avoid compilation errors with if constexpr ──────,// This WON'T compile if T doesn't have .size():,// template<typename T>,// void bad_size(T t) {,//     std::cout << t.size();  // ERROR if T has no size(),// },\n\n// This works for any T:,template<typename T>,void safe_size(T t) {,    if constexpr (std::is_same_v<T, std::vector<int>>) {,        std::cout << \"Vector size: \" << t.size() << \"\\n\";,    } else if constexpr (std::is_same_v<T, std::string>) {,        std::cout << \"String size: \" << t.size() << \"\\n\";,    } else {,        std::cout << \"Type has no size\\n\";,    },},,safe_size(std::vector<int>{1, 2, 3});,safe_size(std::string(\"hello\"));,safe_size(42);  // Type has no size,\n\n// ── Dead code elimination ───────────────────────────,template<typename T>,auto stringify_value(T v) {,    if constexpr (std::is_integral_v<T>) {,        return std::to_string(v);,    } else if constexpr (std::is_floating_point_v<T>) {,        return std::to_string(v);,    } else if constexpr (std::is_same_v<T, std::string>) {,        return v;  // Already a string,    } else {,        // This line compiles fine even though it makes no sense,        // for integral types, because it's in dead code,        return std::string(\"unknown\");,    },},,std::cout << stringify_value(42) << \"\\n\";           // 42,std::cout << stringify_value(3.14) << \"\\n\";         // 3.140000,std::cout << stringify_value(std::string(\"hi\")) << \"\\n\";  // hi,\n\n// ── Generic wrapper with type-specific optimizations ─,template<typename T>,class SmartContainer {,    T data;,public:,    SmartContainer(T d) : data(d) {},,    void describe() const {,        if constexpr (std::is_pointer_v<T>) {,            std::cout << \"Pointer to: \" << typeid(T).name() << \"\\n\";,        } else if constexpr (std::is_array_v<T>) {,            std::cout << \"Array of size: \" << std::extent_v<T> << \"\\n\";,        } else if constexpr (std::is_integral_v<T>) {,            std::cout << \"Integral value: \" << data << \"\\n\";,        } else {,            std::cout << \"Other type\\n\";,        },    },};,,SmartContainer<int*> c1(nullptr);,c1.describe();  // Pointer to...,,int arr[5] = {1, 2, 3, 4, 5};,SmartContainer<int[5]> c2(arr);,c2.describe();  // Array of size: 5,,SmartContainer<int> c3(42);,c3.describe();  // Integral value: 42,\n\n// ── Constexpr version selection ─────────────────────,template<std::size_t N>,constexpr int power_of_two_check(int base) {,    if constexpr (N == 0) {,        return 1;,    } else if constexpr (N == 1) {,        return base;,    } else if constexpr (N % 2 == 0) {,        int half = power_of_two_check<N/2>(base);,        return half * half;,    } else {,        return base * power_of_two_check<N-1>(base);,    },},,constexpr int two_to_8 = power_of_two_check<8>(2);  // 256,\n\n// ── Policy-based design with if constexpr ──────────,template<typename T, bool Verbose = false>,class Logger {,public:,    void log(const std::string& msg) {,        if constexpr (Verbose) {,            std::cout << \"[VERBOSE] \" << msg << \"\\n\";,        } else {,            std::cout << msg << \"\\n\";,        },    },};,,Logger<int, true> verbose_log;,Logger<int, false> quiet_log;,,verbose_log.log(\"Hello\");  // [VERBOSE] Hello,quiet_log.log(\"Hello\");    // Hello"
                  }
        ],
        tips: [
                  "if constexpr (condition) requires condition to be a compile-time constant — use std::is_* traits or other constexpr expressions.",
                  "Dead branches in false constexpr if blocks are NOT compiled — they don't cause runtime overhead or even type errors.",
                  "Use if constexpr to avoid specialization boilerplate — much cleaner than template specialization for simple branching.",
                  "Combining if constexpr with concepts (C++20) creates powerful, readable generic code."
        ],
        mistake: "Using runtime if when if constexpr is appropriate — if constexpr avoids specialization, produces cleaner code, and eliminates dead branches.",
        shorthand: {
          verbose: "template<typename T>\nvoid stringify(T v) {\n    if (std::is_same_v<T, int>) {\n        std::cout << \"int: \" << v;\n    } else if (std::is_same_v<T, double>) {\n        std::cout << \"double: \" << v;\n    }\n}",
          concise: "template<typename T>\nvoid stringify(T v) {\n    if constexpr (std::is_same_v<T, int>) {\n        std::cout << \"int: \" << v;\n    } else if constexpr (std::is_same_v<T, double>) {\n        std::cout << \"double: \" << v;\n    }\n}",
        },
      },
      {
        id: "template-lambda",
        fn: "Generic Lambdas — Templates in Lambda Expressions",
        desc: "Use auto parameters in lambdas (C++14) and explicit template syntax (C++20) for generic lambdas.",
        category: "Templates",
        subtitle: "auto in lambda params, explicit template params, template<typename T> in lambdas",
        signature: "[](auto x) { }  |  []<typename T>(T x) { }  |  []<typename... Ts>(Ts... args) { }",
        descLong: "Generic lambdas (C++14) use auto in parameters, automatically creating a function object template. C++20 extends this with explicit template syntax: []<typename T>(T x) enables constraints, explicit template parameters, and clearer intent. Generic lambdas are useful for algorithms, callbacks, and when the exact type doesn't matter but the interface does.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Lambdas — Templates in Lambda Expressions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Lambdas — Templates in Lambda Expressions — common patterns you'll see in production.\n// APPROACH  - Combine Generic Lambdas — Templates in Lambda Expressions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Basic generic lambda (C++14) ────────────────────\nauto print_any = [](auto x) {\n    std::cout << x << \"\\n\";\n};\n\nprint_any(42);\nprint_any(3.14);\nprint_any(\"hello\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Lambdas — Templates in Lambda Expressions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Generic lambda with algorithms ──────────────────,std::vector<int> nums = {1, 2, 3, 4, 5};,std::for_each(nums.begin(), nums.end(), [](auto x) {,    std::cout << x * 2 << \" \";,});,std::cout << \"\\n\";,\n\n// ── Generic lambda with type traits (C++17+) ───────,auto stringify = [](auto value) {,    if constexpr (std::is_integral_v<decltype(value)>) {,        return std::to_string(value);,    } else if constexpr (std::is_floating_point_v<decltype(value)>) {,        return std::to_string(value);,    } else if constexpr (std::is_same_v<decltype(value), std::string>) {,        return value;,    } else {,        return std::string(\"unknown\");,    },};,,std::cout << stringify(42) << \"\\n\";,std::cout << stringify(3.14) << \"\\n\";,std::cout << stringify(std::string(\"hi\")) << \"\\n\";,\n\n// ── Variadic generic lambda ─────────────────────────,auto print_all = [](auto... args) {,    ((std::cout << args << \" \"), ...);  // fold expression,    std::cout << \"\\n\";,};,,print_all(1, \"hello\", 3.14);,\n\n// ── Multiple type parameters (C++20) ────────────────,// Requires C++20 and explicit template syntax,auto add = []<typename T>(T a, T b) {,    return a + b;,};,,std::cout << add(3, 4) << \"\\n\";        // 7,std::cout << add(1.5, 2.5) << \"\\n\";    // 4,\n\n// ── C++20 explicit template with concept (requires C++20) ──,// template<typename T> requires std::integral<T>,// auto process = []<std::integral T>(T x) {,//     return x * 2;,// };,\n\n// ── Variadic template lambda (C++20) ────────────────,auto sum_all = []<typename... Ts>(Ts... args) {,    return (args + ...);,};,,std::cout << sum_all(1, 2, 3, 4, 5) << \"\\n\";  // 15,\n\n// ── Type deduction in generic lambda ────────────────,std::vector<int> v1 = {1, 2, 3};,std::vector<double> v2 = {1.1, 2.2, 3.3};,,auto process_vector = [](auto& vec) {,    std::cout << \"Size: \" << vec.size() << \"\\n\";,    for (auto elem : vec) {,        std::cout << elem << \" \";,    },    std::cout << \"\\n\";,};,,process_vector(v1);  // works for int,process_vector(v2);  // works for double,\n\n// ── Using std::enable_if in lambda (C++20 alternative: concepts) ──,// Pre-C++20:,auto process_integral = [](auto x) -> std::enable_if_t<std::is_integral_v<decltype(x)>> {,    std::cout << \"Integer: \" << x << \"\\n\";,};,,process_integral(42);  // OK,// process_integral(3.14);  // Would fail,\n\n// ── Capture and use as template ─────────────────────,int multiplier = 10;,auto scaled = [multiplier](auto x) {,    return x * multiplier;,};,,std::cout << scaled(5) << \"\\n\";      // 50,std::cout << scaled(3.14) << \"\\n\";   // 31.4,\n\n// ── Generic lambda as template argument ─────────────,template<typename Func>,void apply_twice(Func f, int x) {,    std::cout << f(x) << \" \";,    std::cout << f(f(x)) << \"\\n\";,},,auto double_it = [](auto x) { return x * 2; };,apply_twice(double_it, 5);  // 10 20,\n\n// ── Generic lambda with std::function (type erasure) ─,std::vector<std::function<void(int)>> handlers;,,handlers.push_back([](auto x) { std::cout << x + 0 << \"\\n\"; });,handlers.push_back([](auto x) { std::cout << x * 2 << \"\\n\"; });,,for (auto& handler : handlers) {,    handler(5);,}"
                  }
        ],
        tips: [
                  "Generic lambdas (auto params) are equivalent to function object templates — each call with a new type instantiates the template.",
                  "C++20 explicit template syntax ([]<typename T>) enables constraints and clearer intent — use when pre-C++20 auto-only lambdas are ambiguous.",
                  "std::enable_if in lambdas is verbose (requires decltype, trailing return type) — prefer C++20 concepts for constraints.",
                  "Generic lambdas capture variables just like regular lambdas — use [&] for ref capture, [=] for value, or [var] for specific captures."
        ],
        mistake: "Overcomplicating type constraints in lambdas with enable_if when concepts (C++20) are available — concepts are cleaner and more readable.",
        shorthand: {
          verbose: "template<typename T>\nstruct PrintFunc {\n    void operator()(T x) { std::cout << x; }\n};",
          concise: "auto print = [](auto x) { std::cout << x; };",
        },
      },
    ],
  },
]

export default { meta, sections }
