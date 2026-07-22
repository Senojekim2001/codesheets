export const meta = {
  "id": "core",
  "label": "Core Syntax & Types",
  "icon": "⚙️",
  "description": "Fundamental C++ syntax, types, control flow, functions, pointers, strings, and error handling."
}

export const sections = [

  // ── Section 1: Variables & Types ─────────────────────────────────────────
  {
    id: "variables-types",
    title: "Variables & Types",
    entries: [
      {
        id: "auto-type-deduction",
        fn: "auto",
        desc: "Type deduction allows the compiler to infer variable types from initialization.",
        category: "Variables & Types",
        subtitle: "Compile-time type inference",
        signature: "auto variable = value;",
        descLong: "auto deduces the type from the right-hand side expression at compile time. It does NOT create a generic or dynamic type — the type is fixed once deduced. Use auto to reduce boilerplate and improve maintainability, especially for iterators and complex types like std::vector<T>::iterator.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of auto — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <map>\n\nint main() {\n    // auto deduces int from 42\n    auto count = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of auto — common patterns you'll see in production.\n// APPROACH  - Combine auto with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// auto deduces std::vector<double>\n    auto values = std::vector<double>{1.1, 2.2, 3.3};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of auto — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Without auto, this line would be verbose:,    // std::vector<std::pair<int, std::string>>::iterator it = m.begin();,    // With auto, much cleaner:,    auto m = std::map<int, std::string>{{1, \"one\"}, {2, \"two\"}};,    for (auto it = m.begin(); it != m.end(); ++it) {,        std::cout << it->first << \": \" << it->second << \"\\n\";,    },\n\n    // auto in range-for (most common use case),    for (auto& val : values) {,        val *= 2;,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use auto to simplify iterators and generic code; the type is still checked at compile time.",
                  "Use auto& or const auto& when you need references to avoid copies.",
                  "auto does NOT create a void or any_type; the type is deduced and fixed at compilation."
        ],
        mistake: "Assuming auto makes a variable dynamically typed. auto is resolved by the compiler; the type is fixed at compile time.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "const-constexpr",
        fn: "const / constexpr",
        desc: "const marks a value immutable; constexpr marks a value as constant-expression evaluable at compile time.",
        category: "Variables & Types",
        subtitle: "Immutability and compile-time constants",
        signature: "const T var = val;  |  constexpr T var = val;",
        descLong: "const prevents modification of a variable after initialization. constexpr extends const by guaranteeing the value can be evaluated at compile time and used in contexts requiring compile-time constants. All constexpr values are const, but not all const values are constexpr. Use constexpr for array sizes, template parameters, and compile-time optimizations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of const / constexpr — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of const / constexpr — common patterns you'll see in production.\n// APPROACH  - Combine const / constexpr with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// constexpr function — can run at compile time\nconstexpr int factorial(int n) {\n    return n <= 1 ? 1 : n * factorial(n - 1);\n}\n\nint main() {\n    // constexpr — must be compile-time evaluable\n    constexpr int MAX_SIZE = 100;\n    constexpr int FACT_5 = factorial(5);  // computed at compile time"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of const / constexpr — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// const — immutable but might be runtime,    const int runtime_val = std::cin.get();,\n\n    // Array size must be compile-time constant,    int arr[MAX_SIZE];  // OK,    // int arr2[runtime_val];  // ERROR,\n\n    // Using constexpr in template context,    std::array<int, FACT_5> special_arr;  // OK: FACT_5 is constexpr,,    std::cout << \"Factorial of 5: \" << FACT_5 << \"\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Use constexpr for compile-time constants and functions that might be evaluated at compile time.",
                  "constexpr functions can run at runtime too; the compiler chooses based on context.",
                  "Use const for immutable values that may depend on runtime input."
        ],
        mistake: "Expecting all const variables to be constexpr. Only compile-time-evaluable values can be constexpr; runtime const values remain const but not constexpr.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "structured-bindings",
        fn: "Structured Bindings",
        desc: "Unpack tuple, array, or struct members into multiple variables (C++17).",
        category: "Variables & Types",
        subtitle: "Tuple/array unpacking",
        signature: "auto [var1, var2, ...] = expr;",
        descLong: "Structured bindings allow decomposing a tuple, array, or aggregate type into individual variables in a single statement. Works with std::tuple, std::pair, arrays, and aggregate structures. Improves readability for functions returning multiple values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Structured Bindings — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <tuple>\n#include <map>\n#include <vector>\n\nstruct Point {\n    double x, y;\n};\n\nint main() {\n    // Unpacking a tuple returned from a function\n    auto get_coords = []() { return std::make_tuple(3.14, 2.71); };\n    auto [pi, e] = get_coords();\n    std::cout << \"pi=\" << pi << \", e=\" << e << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Structured Bindings — common patterns you'll see in production.\n// APPROACH  - Combine Structured Bindings with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Unpacking a pair (common with map iteration)\n    std::map<int, std::string> dict{{1, \"one\"}, {2, \"two\"}};\n    for (auto [key, value] : dict) {\n        std::cout << key << \" -> \" << value << \"\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Structured Bindings — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Unpacking an array,    int arr[3] = {10, 20, 30};,    auto [a, b, c] = arr;,    std::cout << a << \", \" << b << \", \" << c << \"\\n\";,\n\n    // Unpacking an aggregate struct,    Point p{1.5, 2.5};,    auto [x, y] = p;,    std::cout << \"Point: (\" << x << \", \" << y << \")\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use structured bindings to simplify map iteration and function returns.",
                  "Use auto& [x, y] = ... to get references instead of copies.",
                  "Structured bindings work with tuples, pairs, arrays, and aggregate types (C++17+)."
        ],
        mistake: "Trying to modify original values without using references. Use auto& [x, y] = ... if you need to modify.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "references",
        fn: "References",
        desc: "A reference is an alias to an existing variable (cannot be null or rebound).",
        category: "Variables & Types",
        subtitle: "Aliases for variables",
        signature: "T& ref = variable;",
        descLong: "A reference is a const alias created at initialization that cannot be changed to refer to another variable. References must be initialized immediately (unlike pointers). They enable efficient parameter passing and return values without copying. In function parameters, references are preferred over pointers for mandatory arguments.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of References — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n\nvoid increment_by_ref(int& x) {\n    x++;  // modifies the original variable\n}\n\nvoid print_by_const_ref(const std::vector<int>& v) {\n    // read-only access without copying the entire vector\n    for (auto val : v) {\n        std::cout << val << \" \";\n    }\n    std::cout << \"\\n\";\n}\n\nint main() {\n    int original = 5;\n    int& ref = original;  // ref is an alias for original\n\n    ref = 10;  // modifies original\n    std::cout << original << \"\\n\";  // 10\n\n    increment_by_ref(original);\n    std::cout << original << \"\\n\";  // 11"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of References — common patterns you'll see in production.\n// APPROACH  - Combine References with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// References cannot be rebound\n    int another = 20;\n    // ref = another;  // ERROR: assigns 20 to original, does not rebind ref\n\n    std::vector<int> vec{1, 2, 3, 4, 5};\n    print_by_const_ref(vec);  // efficient, no copy"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of References — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nreturn 0;\n}"
                  }
        ],
        tips: [
                  "Use const T& in function parameters to pass large objects efficiently without copying.",
                  "References must be initialized and cannot be null or rebound to another variable.",
                  "Prefer references over pointers when the reference is always valid (no need for nullability)."
        ],
        mistake: "Thinking a reference can be rebound like a pointer. References are permanent aliases; reassigning a reference updates the original variable.",
        shorthand: {
          verbose: "int x = 10;\nint& ref = x;\nref = 20;",
          concise: "int& ref = x;  // alias",
        },
      },
      {
        id: "type-aliases",
        fn: "using / typedef",
        desc: "Create aliases for types to improve code readability.",
        category: "Variables & Types",
        subtitle: "Type aliasing",
        signature: "using alias = Type;  |  typedef Type alias;",
        descLong: "using (C++11) and typedef both create type aliases. using is more flexible (works with templates via template aliases) and reads left-to-right. Use using for new code. Type aliases improve readability for complex types like function pointers, template specializations, and generic types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of using / typedef — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <functional>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of using / typedef — common patterns you'll see in production.\n// APPROACH  - Combine using / typedef with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple type alias\nusing IntVector = std::vector<int>;"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of using / typedef — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function pointer alias (cleaner than raw typedef),using Handler = void(*)(int);,\n\n// Template alias (only possible with using, not typedef),template<typename T>,using List = std::vector<T>;,,void process(int x) {,    std::cout << \"Processing: \" << x << \"\\n\";,},,int main() {,    // Using the simple alias,    IntVector numbers{1, 2, 3};,\n\n    // Using the function pointer alias,    Handler callback = process;,    callback(42);,\n\n    // Using the template alias,    List<double> floats{1.1, 2.2, 3.3};,    List<std::string> strings{\"hello\", \"world\"};,,    std::cout << \"Vector size: \" << numbers.size() << \"\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Prefer using over typedef for new code; it is more readable and supports template aliases.",
                  "Use type aliases to shorten verbose types like std::map<std::string, std::vector<int>>.",
                  "Template aliases can only be created with using, not typedef."
        ],
        mistake: "Using typedef for templates; it does not work. Always use using for template aliases.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Control Flow ─────────────────────────────────────────
  {
    id: "control-flow",
    title: "Control Flow",
    entries: [
      {
        id: "if-else",
        fn: "if / else",
        desc: "Conditional branching based on boolean expressions.",
        category: "Control Flow",
        subtitle: "Conditional statements",
        signature: "if (condition) { } else if (condition) { } else { }",
        descLong: "The if statement evaluates a condition and executes a block if true. else-if chains allow testing multiple conditions. C++17 adds init-statements and structured bindings to if conditions for cleaner scoping. Avoid deep nesting; consider switch or early returns for clarity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of if / else — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <optional>\n\nint main() {\n    int x = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of if / else — common patterns you'll see in production.\n// APPROACH  - Combine if / else with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic if-else\n    if (x > 50) {\n        std::cout << \"Greater\\n\";\n    } else if (x == 42) {\n        std::cout << \"Answer to everything\\n\";\n    } else {\n        std::cout << \"Less\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of if / else — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// C++17: if with initializer,    if (int result = x * 2; result > 50) {,        std::cout << \"Result is large: \" << result << \"\\n\";,    },\n\n    // C++17: if with structured binding,    auto pair = std::make_pair(10, 20);,    if (auto [a, b] = pair; a < b) {,        std::cout << a << \" is less than \" << b << \"\\n\";,    },\n\n    // C++17: constexpr if (compile-time branching),    if constexpr (sizeof(int) == 4) {,        std::cout << \"32-bit integers\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use C++17 if-with-initializer to scope temporary variables: if (int x = foo(); x > 0) { }",
                  "Prefer early returns over nested if-else chains for better readability.",
                  "Use constexpr if for compile-time branching in templates."
        ],
        mistake: "Deep nesting of if-else chains; instead use switch, early returns, or refactor into helper functions.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "switch-statement",
        fn: "switch",
        desc: "Multi-way branching based on discrete values.",
        category: "Control Flow",
        subtitle: "Discrete case selection",
        signature: "switch (value) { case ...: ... break; default: ... }",
        descLong: "switch evaluates an expression once and branches to matching case labels. Cases fall through unless explicitly broken. Default case handles unmatched values. Prefer switch over long if-else chains for readability. C++17 adds case ranges in some compilers; C++20 adds switch with structured bindings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of switch — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n\nint main() {\n    char operation = '+';\n    int a = 10, b = 5;\n    int result = 0;\n    bool valid = true;\n\n    switch (operation) {\n        case '+':\n            result = a + b;\n            break;  // Important: prevent fall-through\n        case '-':\n            result = a - b;\n            break;\n        case '*':\n            result = a * b;\n            break;\n        case '/':\n            if (b != 0) {\n                result = a / b;\n            }\n            break;\n        default:\n            std::cout << \"Unknown operation: \" << operation << \"\\n\";\n            valid = false;\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of switch — common patterns you'll see in production.\n// APPROACH  - Combine switch with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of switch — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nstd::cout << \"Unknown operation: \" << operation << \"\\n\";\n            valid = false;\n    }\n\n    if (valid) {\n        std::cout << \"Result: \" << result << \"\\n\";\n    }\n\n    return 0;\n}"
                  }
        ],
        tips: [
                  "Always include break or return in cases; missing break causes fall-through to the next case.",
                  "Use switch for discrete values; prefer if-else for complex conditions or ranges.",
                  "default case is optional but recommended to handle unexpected values."
        ],
        mistake: "Forgetting break statements, causing unintended fall-through between cases.",
        shorthand: {
          verbose: "String r;\nswitch(day){\n  case MONDAY: r=\"Start\"; break;\n  default: r=\"Other\";\n}",
          concise: "String r = switch(day) { case MONDAY -> \"Start\"; default -> \"Other\"; };",
        },
      },
      {
        id: "range-for-loop",
        fn: "Range-based for",
        desc: "Iterate over container elements without managing indices (C++11).",
        category: "Control Flow",
        subtitle: "Container iteration",
        signature: "for (auto element : container) { }",
        descLong: "Range-based for (range-for) iterates over all elements in a container or array. Use auto to deduce element type. Use auto& for non-const iteration and modifications. Use const auto& for read-only iteration of large objects. Works with arrays, std::vector, std::map, std::set, and any type with begin() and end().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Range-based for — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <map>\n\nint main() {\n    // Simple iteration over vector\n    std::vector<int> nums{1, 2, 3, 4, 5};\n    for (auto num : nums) {\n        std::cout << num << \" \";\n    }\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Range-based for — common patterns you'll see in production.\n// APPROACH  - Combine Range-based for with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Non-const iteration (modify elements)\n    for (auto& num : nums) {\n        num *= 2;  // modify the actual elements\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Range-based for — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// const iteration (efficient read-only),    std::vector<std::string> names{\"Alice\", \"Bob\", \"Charlie\"};,    for (const auto& name : names) {,        std::cout << name << \" \";,    },    std::cout << \"\\n\";,\n\n    // Iteration over map with structured binding,    std::map<int, std::string> dict{{1, \"one\"}, {2, \"two\"}, {3, \"three\"}};,    for (auto [key, value] : dict) {,        std::cout << key << \": \" << value << \"\\n\";,    },\n\n    // Iteration over array,    int arr[3] = {10, 20, 30};,    for (int x : arr) {,        std::cout << x << \" \";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use const auto& in range-for to avoid copies of large objects (vectors of strings, etc).",
                  "Range-for is cleaner and safer than traditional index-based loops; prefer it when possible.",
                  "You can use structured bindings in range-for: for (auto [k, v] : map) { }"
        ],
        mistake: "Using auto (by value) in range-for over expensive-to-copy types; use auto& or const auto& instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "while-loop",
        fn: "while / do-while",
        desc: "Repeat a block while a condition is true.",
        category: "Control Flow",
        subtitle: "Condition-based loops",
        signature: "while (condition) { }  |  do { } while (condition);",
        descLong: "while loops execute as long as the condition is true; the condition is checked before each iteration. do-while executes the body first, then checks the condition (always runs at least once). Use while for standard loops; use do-while when the body must execute at least once.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of while / do-while — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n\nint main() {\n    // while loop — condition checked first\n    int count = 0;\n    while (count < 3) {\n        std::cout << \"Count: \" << count << \"\\n\";\n        count++;\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of while / do-while — common patterns you'll see in production.\n// APPROACH  - Combine while / do-while with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Reading input until valid\n    int input = -1;\n    while (input < 0 || input > 100) {\n        std::cout << \"Enter a number (0-100): \";\n        std::cin >> input;\n        if (!(std::cin)) {\n            std::cin.clear();\n            std::cin.ignore(10000, '\\n');\n            input = -1;  // Force retry\n        }\n    }\n    std::cout << \"Valid input: \" << input << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of while / do-while — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// do-while — body runs at least once,    int x = 0;,    do {,        std::cout << \"x is: \" << x << \"\\n\";,        x++;,    } while (x < 3);,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use while for standard condition-checked loops.",
                  "Use do-while when the body must execute at least once (e.g., menu loops, input validation).",
                  "Be careful of infinite loops; ensure the loop condition will eventually become false."
        ],
        mistake: "Creating infinite loops by never updating the loop variable or condition.",
        shorthand: {
          verbose: "while(condition) {\n  action();\n  condition = check();\n}",
          concise: "while(condition) action();",
        },
      },
      {
        id: "break-continue",
        fn: "break / continue",
        desc: "Control loop iteration: break exits the loop, continue skips to the next iteration.",
        category: "Control Flow",
        subtitle: "Loop control",
        signature: "break;  |  continue;",
        descLong: "break exits the innermost enclosing loop or switch statement immediately. continue skips the remaining statements in the current iteration and proceeds to the next iteration. Use these sparingly; overly complex break/continue patterns reduce readability. Consider refactoring into separate functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of break / continue — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<int> numbers{1, 2, 3, 4, 5, 6, 7, 8, 9, 10};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of break / continue — common patterns you'll see in production.\n// APPROACH  - Combine break / continue with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// break — exit loop when target is found\n    for (auto num : numbers) {\n        if (num == 5) {\n            std::cout << \"Found target: \" << num << \"\\n\";\n            break;  // exits the loop\n        }\n        std::cout << \"Checking: \" << num << \"\\n\";\n    }\n\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of break / continue — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// continue — skip even numbers,    for (auto num : numbers) {,        if (num % 2 == 0) {,            continue;  // skip this iteration,        },        std::cout << \"Odd: \" << num << \"\\n\";,    },,    std::cout << \"\\n\";,\n\n    // Nested loops: break only exits innermost loop,    for (int i = 0; i < 3; i++) {,        for (int j = 0; j < 3; j++) {,            if (j == 1) {,                break;  // exits inner loop only,            },            std::cout << \"i=\" << i << \", j=\" << j << \"\\n\";,        },    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use break to exit loops early; helps avoid unnecessary iterations.",
                  "Use continue to skip iterations without nesting more conditions.",
                  "In nested loops, break only exits the innermost loop; to exit outer loops, consider using a flag or refactoring."
        ],
        mistake: "Overusing break and continue, making control flow hard to follow. Refactor complex loops into helper functions.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Functions ─────────────────────────────────────────
  {
    id: "functions",
    title: "Functions",
    entries: [
      {
        id: "function-basics",
        fn: "Function Declaration & Definition",
        desc: "Define and call functions to encapsulate reusable logic.",
        category: "Functions",
        subtitle: "Function basics",
        signature: "ReturnType functionName(param1, param2) { /* body */ }",
        descLong: "A function is a reusable block of code that accepts parameters and optionally returns a value. Declare functions (prototype) before use or define them before calling. C++17 allows deduced return types with auto. Use const, const&, and && to control how parameters are passed. Avoid modifying global state; prefer pure functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Declaration & Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Declaration & Definition — common patterns you'll see in production.\n// APPROACH  - Combine Function Declaration & Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Forward declaration (prototype)\nint add(int a, int b);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Declaration & Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function taking vector by const reference (efficient, read-only),double average(const std::vector<double>& values) {,    if (values.empty()) return 0.0;,    double sum = 0.0;,    for (auto v : values) {,        sum += v;,    },    return sum / values.size();,},\n\n// Function with default parameters,void greet(const std::string& name, const std::string& greeting = \"Hello\") {,    std::cout << greeting << \", \" << name << \"!\\n\";,},\n\n// Function definition,int add(int a, int b) {,    return a + b;,},\n\n// Function returning multiple values via tuple (C++17),std::pair<int, int> divmod(int a, int b) {,    return {a / b, a % b};,},,int main() {,    std::cout << \"5 + 3 = \" << add(5, 3) << \"\\n\";,,    std::vector<double> scores{85.5, 90.0, 78.5, 92.0};,    std::cout << \"Average: \" << average(scores) << \"\\n\";,,    greet(\"Alice\");,    greet(\"Bob\", \"Hi\");,,    auto [quotient, remainder] = divmod(17, 5);,    std::cout << \"17 / 5 = \" << quotient << \" remainder \" << remainder << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use forward declarations to structure code logically without worrying about order.",
                  "Pass large objects (vectors, strings) by const reference to avoid copies.",
                  "Use auto return type deduction sparingly; explicit return types improve readability."
        ],
        mistake: "Passing large objects by value, causing unnecessary copying. Use const T& or T&& instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "function-overloading",
        fn: "Function Overloading",
        desc: "Define multiple functions with the same name but different parameter types.",
        category: "Functions",
        subtitle: "Polymorphism via overloading",
        signature: "void func(int);  void func(double);",
        descLong: "Function overloading allows multiple functions with the same name but different parameter types, counts, or const-ness. The compiler chooses the best match at compile time. Overloading improves usability (same name for similar operations) but can be ambiguous if not carefully designed. Avoid unnecessary overloads; prefer templates for generic types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Overloading — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Overloading — common patterns you'll see in production.\n// APPROACH  - Combine Function Overloading with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Overload 1: int parameter\nvoid print(int x) {\n    std::cout << \"Integer: \" << x << \"\\n\";\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Overloading — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Overload 2: double parameter,void print(double x) {,    std::cout << \"Double: \" << x << \"\\n\";,},\n\n// Overload 3: string parameter,void print(const std::string& s) {,    std::cout << \"String: \" << s << \"\\n\";,},\n\n// Overload 4: multiple parameters,void print(int a, double b) {,    std::cout << \"Mixed: int=\" << a << \", double=\" << b << \"\\n\";,},\n\n// Overload based on const-ness,class Container {,public:,    int& get() { return value; },    const int& get() const { return value; },private:,    int value = 42;,};,,int main() {,    print(42);,    print(3.14);,    print(\"hello\");,    print(10, 2.5);,,    Container c;,    std::cout << \"Mutable: \" << c.get() << \"\\n\";,,    const Container cc;,    std::cout << \"Const: \" << cc.get() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use overloading to provide natural interfaces for similar operations on different types.",
                  "Ensure overloads are unambiguous; the compiler must clearly pick one match.",
                  "Use templates for generic logic that applies to many types; avoid proliferating overloads."
        ],
        mistake: "Creating ambiguous overloads that the compiler cannot resolve. Keep overloads clearly distinct.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "default-parameters",
        fn: "Default Parameters",
        desc: "Provide default values for function parameters.",
        category: "Functions",
        subtitle: "Optional parameters",
        signature: "void func(int a, int b = 10, int c = 20) { }",
        descLong: "Default parameters allow omitting arguments when calling a function; the default value is used. All default parameters must follow non-default parameters in the parameter list. Default parameters reduce overload proliferation and improve API usability. Declare defaults in the declaration, not the definition.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Default Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Default Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Default Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Default parameters in declaration\nvoid configure(const std::string& host = \"localhost\",\n               int port = 8080,\n               bool debug = false);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Default Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Definition (do NOT repeat defaults here),void configure(const std::string& host, int port, bool debug) {,    std::cout << \"Host: \" << host << \", Port: \" << port;,    std::cout << \", Debug: \" << (debug ? \"ON\" : \"OFF\") << \"\\n\";,},\n\n// Function with mix of default and non-default params,void log_message(const std::string& level,,                 const std::string& message,,                 bool timestamp = true,,                 bool newline = true) {,    if (timestamp) {,        std::cout << \"[TIME] \";,    },    std::cout << \"[\" << level << \"] \" << message;,    if (newline) {,        std::cout << \"\\n\";,    },},,int main() {,    configure();  // uses all defaults,    configure(\"api.example.com\");  // uses port=8080, debug=false,    configure(\"api.example.com\", 3000);  // uses debug=false,    configure(\"api.example.com\", 3000, true);  // all custom,,    log_message(\"INFO\", \"Starting server\");,    log_message(\"ERROR\", \"Connection failed\", false);,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use default parameters to reduce API complexity; callers use most common values without specifying them.",
                  "Place default parameters at the end; non-default parameters must come first.",
                  "Default values are evaluated at call time, not declaration time."
        ],
        mistake: "Repeating default parameter values in the function definition. Define defaults only in the declaration.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "function-templates",
        fn: "Function Templates",
        desc: "Write generic functions that work with multiple types.",
        category: "Functions",
        subtitle: "Compile-time polymorphism",
        signature: "template<typename T> T max(T a, T b) { }",
        descLong: "Function templates are blueprints for functions that work with any type. The compiler generates concrete versions for each type used. Use templates for generic algorithms that apply to many types. Template parameters are resolved at compile time. Prefer concepts (C++20) to constrain template types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Function Templates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Function Templates — common patterns you'll see in production.\n// APPROACH  - Combine Function Templates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple template function\ntemplate<typename T>\nT max_value(T a, T b) {\n    return (a > b) ? a : b;\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Function Templates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Template with multiple type parameters,template<typename T, typename U>,void print_pair(T first, U second) {,    std::cout << first << \" and \" << second << \"\\n\";,},\n\n// Template function operating on containers,template<typename Container>,void print_all(const Container& items) {,    for (const auto& item : items) {,        std::cout << item << \" \";,    },    std::cout << \"\\n\";,},\n\n// Template with default template argument (C++11),template<typename T = int>,T add(T a, T b) {,    return a + b;,},,int main() {,    std::cout << \"Max of 5 and 10: \" << max_value(5, 10) << \"\\n\";,    std::cout << \"Max of 3.14 and 2.71: \" << max_value(3.14, 2.71) << \"\\n\";,    std::cout << \"Max of 'hello' and 'world': \" << max_value(\"hello\", \"world\") << \"\\n\";,,    print_pair(42, \"answer\");,    print_pair(3.14, \"pi\");,,    std::vector<int> numbers{1, 2, 3, 4};,    print_all(numbers);,,    std::vector<std::string> words{\"C++\", \"is\", \"fun\"};,    print_all(words);,,    std::cout << \"5 + 3 = \" << add(5, 3) << \"\\n\";,    std::cout << \"5.5 + 2.5 = \" << add(5.5, 2.5) << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use templates for algorithms that work across types; the compiler generates specialized versions.",
                  "Template instantiation happens at compile time, making templates zero-cost abstractions.",
                  "Template error messages can be verbose; use concepts (C++20) to provide clearer constraints."
        ],
        mistake: "Instantiating the same template with incompatible types, causing compile errors. Ensure your template operations work for the intended types.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "lambda-expressions",
        fn: "Lambda Expressions",
        desc: "Inline anonymous functions (C++11).",
        category: "Functions",
        subtitle: "Inline function objects",
        signature: "[capture](params) -> ReturnType { body }",
        descLong: "Lambdas provide a concise way to define inline functions, especially useful for callbacks and algorithms. Capture clause [=] captures by value, [&] by reference. Return type can be deduced (auto). Lambdas are converted to function objects (functors) by the compiler. Prefer lambdas over functors for simple callbacks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lambda Expressions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> numbers{1, 2, 3, 4, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lambda Expressions — common patterns you'll see in production.\n// APPROACH  - Combine Lambda Expressions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple lambda with no captures\n    auto print_value = [](int x) {\n        std::cout << x << \" \";\n    };\n    print_value(42);\n\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lambda Expressions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Lambda used with algorithm: print all elements,    std::for_each(numbers.begin(), numbers.end(),,                  [](int x) { std::cout << x << \" \"; });,    std::cout << \"\\n\";,\n\n    // Lambda with capture by value [=],    int multiplier = 10;,    auto multiply = [multiplier](int x) { return x * multiplier; };,    std::cout << \"42 * 10 = \" << multiply(42) << \"\\n\";,\n\n    // Lambda with capture by reference [&],    int sum = 0;,    std::for_each(numbers.begin(), numbers.end(),,                  [&sum](int x) { sum += x; });,    std::cout << \"Sum: \" << sum << \"\\n\";,\n\n    // Lambda with explicit return type,    auto divide = [](int a, int b) -> double {,        return static_cast<double>(a) / b;,    };,    std::cout << \"10 / 3 = \" << divide(10, 3) << \"\\n\";,\n\n    // Modifying captured state,    int counter = 0;,    auto increment = [&counter]() { return ++counter; };,    std::cout << \"Counts: \";,    for (int i = 0; i < 3; i++) {,        std::cout << increment() << \" \";,    },    std::cout << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use [=] to capture by value (safe for local variables); use [&] cautiously (avoid dangling references).",
                  "Lambdas are ideal for callbacks to algorithms like std::sort, std::find, std::transform.",
                  "Use mutable keyword in capture to modify captured variables: [=]() mutable { }"
        ],
        mistake: "Capturing by reference [&] when the lambda outlives the scope of captured variables, causing dangling references.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Pointers & References ─────────────────────────────────────────
  {
    id: "pointers-references",
    title: "Pointers & References",
    entries: [
      {
        id: "raw-pointers",
        fn: "Raw Pointers",
        desc: "Low-level pointers for direct memory access (use smart pointers instead).",
        category: "Pointers & References",
        subtitle: "Manual memory management",
        signature: "T* ptr = &var;  |  T* ptr = new T();",
        descLong: "A raw pointer stores a memory address. & retrieves the address of a variable. * dereferences a pointer to access the value. new allocates memory on the heap; delete deallocates it. Raw pointers are error-prone (dangling pointers, memory leaks); prefer smart pointers (unique_ptr, shared_ptr) in modern C++.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Raw Pointers — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n\nint main() {\n    // Pointer to a stack variable\n    int x = 42;\n    int* ptr_to_x = &x;  // & = address-of operator\n    std::cout << \"Value: \" << *ptr_to_x << \"\\n\";  // * = dereference\n    std::cout << \"Address: \" << ptr_to_x << \"\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Raw Pointers — common patterns you'll see in production.\n// APPROACH  - Combine Raw Pointers with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Modifying through pointer\n    *ptr_to_x = 100;\n    std::cout << \"x is now: \" << x << \"\\n\";  // 100"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Raw Pointers — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Pointer arithmetic (on arrays),    int arr[5] = {10, 20, 30, 40, 50};,    int* p = arr;,    std::cout << \"First: \" << *p << \"\\n\";  // 10,    std::cout << \"Second: \" << *(p + 1) << \"\\n\";  // 20,    std::cout << \"Third: \" << p[2] << \"\\n\";  // 30 (equivalent to *(p+2)),\n\n    // Dynamic allocation (AVOID in modern C++ — use unique_ptr instead),    int* dynamic = new int(555);,    std::cout << \"Dynamic: \" << *dynamic << \"\\n\";,    delete dynamic;  // MUST manually deallocate,    // dynamic = nullptr;  // Good practice after delete,\n\n    // Null pointer,    int* null_ptr = nullptr;,    if (null_ptr == nullptr) {,        std::cout << \"Pointer is null\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Prefer smart pointers (unique_ptr, shared_ptr) over raw pointers for memory management.",
                  "Raw pointers are useful for non-owning references (e.g., parameters in function signatures).",
                  "Always check for null before dereferencing a pointer: if (ptr != nullptr) { }"
        ],
        mistake: "Using raw pointers for memory ownership; leads to memory leaks. Use unique_ptr or shared_ptr instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "smart-pointers",
        fn: "Smart Pointers (unique_ptr, shared_ptr)",
        desc: "Automatic memory management via RAII (prefer over raw pointers).",
        category: "Pointers & References",
        subtitle: "RAII-based memory management",
        signature: "std::unique_ptr<T> ptr(new T());  |  std::shared_ptr<T> ptr = std::make_shared<T>();",
        descLong: "Smart pointers manage dynamically allocated memory automatically via RAII. unique_ptr has exclusive ownership; the object is deleted when unique_ptr goes out of scope. shared_ptr allows multiple owners; the object is deleted when the last shared_ptr is destroyed. Use make_unique and make_shared for exception safety. Prefer unique_ptr by default; use shared_ptr only when true shared ownership is needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Smart Pointers (unique_ptr, shared_ptr) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Resource {\npublic:\n    Resource(const std::string& name) : name_(name) {\n        std::cout << \"Resource \" << name_ << \" created\\n\";\n    }\n    ~Resource() {\n        std::cout << \"Resource \" << name_ << \" destroyed\\n\";\n    }\n    void use() { std::cout << \"Using \" << name_ << \"\\n\"; }\nprivate:\n    std::string name_;\n};\n\nint main() {\n    // unique_ptr — exclusive ownership\n    {\n        std::unique_ptr<Resource> res1 = std::make_unique<Resource>(\"A\");\n        res1->use();\n        // res1 is automatically deleted when leaving scope\n    }  // Output: \"Resource A destroyed\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Smart Pointers (unique_ptr, shared_ptr) — common patterns you'll see in production.\n// APPROACH  - Combine Smart Pointers (unique_ptr, shared_ptr) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// unique_ptr — can be moved, not copied\n    std::unique_ptr<Resource> res2 = std::make_unique<Resource>(\"B\");\n    std::unique_ptr<Resource> res3 = std::move(res2);  // Move ownership\n    // res2 is now empty (nullptr)\n    res3->use();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Smart Pointers (unique_ptr, shared_ptr) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// shared_ptr — shared ownership,    {,        std::shared_ptr<Resource> shared1 = std::make_shared<Resource>(\"C\");,        {,            std::shared_ptr<Resource> shared2 = shared1;  // Copy ownership,            std::cout << \"Use count: \" << shared1.use_count() << \"\\n\";  // 2,        }  // shared2 destroyed, but shared1 keeps the resource alive,        std::cout << \"Use count: \" << shared1.use_count() << \"\\n\";  // 1,    }  // Both shared1 destroyed and Resource C deleted,\n\n    // Store in containers,    std::vector<std::unique_ptr<Resource>> resources;,    resources.push_back(std::make_unique<Resource>(\"D\"));,    resources.push_back(std::make_unique<Resource>(\"E\"));,    // All resources automatically deleted when vector is destroyed,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::make_unique and std::make_shared (C++14+) for cleaner and exception-safe allocation.",
                  "Prefer unique_ptr by default; use shared_ptr only for true shared ownership.",
                  "Smart pointers automatically call destructors, making resource cleanup automatic (RAII)."
        ],
        mistake: "Mixing smart and raw pointers, or using raw delete on pointers owned by smart pointers.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "rvalue-references",
        fn: "Rvalue References & Move Semantics",
        desc: "Distinguish temporary values for efficient resource transfer (C++11).",
        category: "Pointers & References",
        subtitle: "Move semantics and temporary binding",
        signature: "T&& ref = std::move(value);",
        descLong: "Rvalue references (&&) bind to temporary values and allow move semantics. std::move casts to rvalue reference to trigger move constructors/assignments. Move semantics transfer ownership instead of copying, improving performance for large objects. Perfect forwarding with std::forward preserves lvalue/rvalue-ness in template functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Rvalue References & Move Semantics — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <utility>\n#include <vector>\n#include <string>\n\nclass Buffer {\npublic:\n    Buffer(size_t size) : data(new int[size]), size_(size) {\n        std::cout << \"Buffer created (size=\" << size << \")\\n\";\n    }\n\n    ~Buffer() {\n        delete[] data;\n        std::cout << \"Buffer destroyed\\n\";\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Rvalue References & Move Semantics — common patterns you'll see in production.\n// APPROACH  - Combine Rvalue References & Move Semantics with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Move constructor — transfer ownership\n    Buffer(Buffer&& other) noexcept : data(other.data), size_(other.size_) {\n        other.data = nullptr;\n        other.size_ = 0;\n        std::cout << \"Buffer moved\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Rvalue References & Move Semantics — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Move assignment,    Buffer& operator=(Buffer&& other) noexcept {,        if (this != &other) {,            delete[] data;,            data = other.data;,            size_ = other.size_;,            other.data = nullptr;,            other.size_ = 0;,        },        return *this;,    },,    void fill(int value) {,        for (size_t i = 0; i < size_; ++i) {,            data[i] = value;,        },    },,private:,    int* data = nullptr;,    size_t size_ = 0;,};,,int main() {,    // Creating a temporary Buffer,    Buffer b1(1000);  // calls constructor,    b1.fill(42);,\n\n    // Move semantics — transfer ownership from temporary,    Buffer b2 = std::move(b1);  // calls move constructor,    // b1.data is now nullptr,\n\n    // std::vector uses move semantics,    std::vector<std::string> strs;,    std::string temp = \"hello\";,    strs.push_back(std::move(temp));  // moves string instead of copying,    // temp is now empty, strs[0] owns the data,\n\n    // Without move, this would copy the large string,    strs.push_back(\"world\");  // temporary, move semantics applied automatically,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::move to convert lvalues to rvalues when transferring ownership is intended.",
                  "Move constructors and move assignments should be marked noexcept if possible.",
                  "Use std::forward in template functions to preserve lvalue/rvalue-ness of arguments."
        ],
        mistake: "Using std::move on temporary objects (they are already rvalues). Use std::move on lvalues to be moved.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "weak-ptr",
        fn: "weak_ptr",
        desc: "Non-owning reference to shared_ptr (breaks reference cycles).",
        category: "Pointers & References",
        subtitle: "Non-owning shared ownership",
        signature: "std::weak_ptr<T> weak = shared;",
        descLong: "weak_ptr observes a shared_ptr without incrementing its reference count. Use weak_ptr to break circular reference cycles (parent-child relationships). weak_ptr must be converted to shared_ptr via lock() before use; lock() returns null if the pointed-to object has been deleted.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of weak_ptr — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n#include <vector>\n\nclass Parent;  // forward declaration\n\nclass Child {\npublic:\n    Child(const std::string& name) : name_(name) {}\n    void set_parent(std::shared_ptr<Parent> p) { parent_ = p; }\n    const std::string& name() const { return name_; }\nprivate:\n    std::string name_;\n    std::weak_ptr<Parent> parent_;  // weak_ptr avoids cycles\n};\n\nclass Parent {\npublic:\n    Parent(const std::string& name) : name_(name) {}\n    void add_child(std::shared_ptr<Child> c) {\n        c->set_parent(shared_from_this());\n        children_.push_back(c);\n    }\n    const std::string& name() const { return name_; }\nprivate:\n    std::string name_;\n    std::vector<std::shared_ptr<Child>> children_;\n};\n\nint main() {\n    // Create parent and children\n    auto parent = std::make_shared<Parent>(\"Mom\");\n    auto child1 = std::make_shared<Child>(\"Alice\");\n    auto child2 = std::make_shared<Child>(\"Bob\");\n\n    parent->add_child(child1);\n    parent->add_child(child2);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of weak_ptr — common patterns you'll see in production.\n// APPROACH  - Combine weak_ptr with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// With weak_ptr, the cycle doesn't prevent cleanup\n    // Without weak_ptr, parent would keep children, children would keep\n    // parent (via weak_ptr), and nothing would ever be deleted\n\n    std::cout << \"Parent: \" << parent->name() << \"\\n\";\n    std::cout << \"Children: \" << child1->name() << \", \" << child2->name() << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of weak_ptr — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Even though child1 and child2 go out of scope, they're still owned by parent,    // When parent goes out of scope, all are cleaned up,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use weak_ptr to break circular reference cycles in parent-child or bidirectional relationships.",
                  "Always call lock() on weak_ptr to safely get a shared_ptr; check if result is non-null.",
                  "weak_ptr does not prevent object deletion; only shared_ptr and unique_ptr do."
        ],
        mistake: "Trying to dereference weak_ptr directly. Always call lock() and check for null.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 5: Strings & I/O ─────────────────────────────────────────
  {
    id: "strings-io",
    title: "Strings & I/O",
    entries: [
      {
        id: "stdstring",
        fn: "std::string",
        desc: "Dynamic character string class with RAII memory management.",
        category: "Strings & I/O",
        subtitle: "Standard string type",
        signature: "std::string str = \"hello\";",
        descLong: "std::string is a dynamic, null-terminated string class. It handles memory automatically (RAII), provides member functions (find, substr, replace, etc.), and supports operator overloading. Prefer std::string over C-style char* arrays. std::string_view (C++17) provides efficient non-owning views of strings.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::string — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n\nint main() {\n    // Construction\n    std::string s1 = \"hello\";\n    std::string s2(\"world\");\n    std::string s3(5, 'x');  // \"xxxxx\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::string — common patterns you'll see in production.\n// APPROACH  - Combine std::string with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Concatenation\n    std::string greeting = s1 + \" \" + s2;\n    std::cout << greeting << \"\\n\";  // \"hello world\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::string — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// String methods,    std::cout << \"Length: \" << s1.length() << \"\\n\";,    std::cout << \"Uppercase at [0]: \" << char(std::toupper(s1[0])) << \"\\n\";,\n\n    // Finding substrings,    size_t pos = greeting.find(\"world\");,    if (pos != std::string::npos) {,        std::cout << \"'world' found at position \" << pos << \"\\n\";,    },\n\n    // Substring extraction,    std::string sub = greeting.substr(0, 5);  // \"hello\",    std::cout << \"Substring: \" << sub << \"\\n\";,\n\n    // String replacement,    std::string text = \"I love C++\";,    size_t found = text.find(\"C++\");,    if (found != std::string::npos) {,        text.replace(found, 3, \"C\");,    },    std::cout << \"Modified: \" << text << \"\\n\";  // \"I love C\",\n\n    // String iteration,    std::string chars = \"ABC\";,    for (char c : chars) {,        std::cout << c << \" \";,    },    std::cout << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::string for all string handling; it is exception-safe and memory-managed.",
                  "Check for std::string::npos when using find() to confirm a match was found.",
                  "Use string_view (C++17) for read-only substring references without copying."
        ],
        mistake: "Using C-style char* arrays instead of std::string. Use std::string for safety and convenience.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "stringview",
        fn: "std::string_view",
        desc: "Lightweight non-owning reference to string data (C++17).",
        category: "Strings & I/O",
        subtitle: "Efficient string reference",
        signature: "std::string_view str = \"hello\";",
        descLong: "std::string_view provides a non-owning, zero-copy view of string data (C-style string, std::string, etc.). Use string_view in function parameters to avoid unnecessary copies. string_view cannot modify the underlying string and does not allocate memory. Avoid returning string_view from functions (dangling reference risk).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::string_view — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <string_view>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::string_view — common patterns you'll see in production.\n// APPROACH  - Combine std::string_view with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Function taking string_view — works with any string source\nvoid print_info(std::string_view str) {\n    std::cout << \"String: '\" << str << \"'\\n\";\n    std::cout << \"Length: \" << str.length() << \"\\n\";\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::string_view — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function returning substring,std::string_view first_word(std::string_view text) {,    size_t space = text.find(' ');,    if (space == std::string_view::npos) {,        return text;,    },    return text.substr(0, space);,},,int main() {,    // string_view works with string literals,    print_info(\"hello\");,\n\n    // string_view works with std::string (no copy),    std::string s = \"world\";,    print_info(s);,\n\n    // string_view works with C-style strings,    const char* cstr = \"C-style\";,    print_info(cstr);,\n\n    // Substring without copying,    std::string sentence = \"The quick brown fox\";,    std::string_view word = first_word(sentence);,    std::cout << \"First word: \" << word << \"\\n\";,\n\n    // string_view of a substring,    std::string_view portion = sentence.substr(4, 5);,    std::cout << \"Portion: \" << portion << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use string_view in function parameters instead of const std::string& for efficiency.",
                  "Never return string_view from a function; the underlying string may go out of scope (dangling reference).",
                  "string_view is zero-cost; it is just a pointer and length, with no allocation."
        ],
        mistake: "Returning std::string_view from a function where the underlying string goes out of scope.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "cout-cin",
        fn: "Input/Output: std::cout, std::cin",
        desc: "Standard streams for console input and output.",
        category: "Strings & I/O",
        subtitle: "Console I/O",
        signature: "std::cout << value;  |  std::cin >> variable;",
        descLong: "std::cout outputs to standard output; std::cin reads from standard input. The << operator (output operator) and >> operator (input operator) work with built-in types and objects that overload them. Use std::endl or \"\\n\" for newlines. Prefer \"\\n\" over std::endl for performance (endl flushes the buffer).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Input/Output: std::cout, std::cin — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <iomanip>\n\nint main() {\n    // Basic output\n    std::cout << \"Hello, World!\\n\";"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Input/Output: std::cout, std::cin — common patterns you'll see in production.\n// APPROACH  - Combine Input/Output: std::cout, std::cin with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple values\n    int x = 42;\n    double y = 3.14;\n    std::cout << \"x = \" << x << \", y = \" << y << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Input/Output: std::cout, std::cin — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Basic input,    std::string name;,    std::cout << \"Enter your name: \";,    std::cin >> name;,    std::cout << \"Hello, \" << name << \"!\\n\";,\n\n    // Reading entire line (with spaces),    std::string full_line;,    std::cout << \"Enter a full sentence: \";,    std::getline(std::cin, full_line);,    std::cout << \"You said: \" << full_line << \"\\n\";,\n\n    // Reading multiple values,    int a, b;,    std::cout << \"Enter two numbers: \";,    std::cin >> a >> b;,    std::cout << \"Sum: \" << (a + b) << \"\\n\";,\n\n    // Formatting output,    std::cout << std::fixed << std::setprecision(2);,    std::cout << \"Formatted: \" << 3.14159 << \"\\n\";  // 3.14,\n\n    // Error handling,    std::cout << \"Enter an integer: \";,    int input;,    if (std::cin >> input) {,        std::cout << \"You entered: \" << input << \"\\n\";,    } else {,        std::cout << \"Invalid input\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::getline(std::cin, str) to read entire lines including spaces.",
                  "Check the stream state after input: if (std::cin >> value) { }",
                  "Use \"\\n\" instead of std::endl for better performance (endl flushes)."
        ],
        mistake: "Mixing >> and std::getline without clearing the input buffer. Use std::cin.ignore() between them.",
        shorthand: {
          verbose: "#include <iostream>\nusing namespace std;\nint main() {\n    int x;\n    cout << \"Enter a number: \";\n    cin >> x;\n    cout << \"You entered: \" << x << endl;\n    return 0;\n}",
          concise: "#include <iostream>\nint main() {\n    int x;\n    std::cout << \"Enter: \"; std::cin >> x;\n    std::cout << \"Got: \" << x << '\n';\n}",
        },
      },
      {
        id: "file-io",
        fn: "File I/O: ifstream, ofstream",
        desc: "Read and write files using stream-based I/O.",
        category: "Strings & I/O",
        subtitle: "File operations",
        signature: "std::ofstream out(\"file.txt\");  |  std::ifstream in(\"file.txt\");",
        descLong: "std::ofstream writes to files; std::ifstream reads from files. Both are stream-based, working similarly to std::cout and std::cin. Use RAII (streams auto-close on scope exit). Check is_open() or the stream state after construction. Prefer reading lines with std::getline for text files.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of File I/O: ifstream, ofstream — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <fstream>\n#include <string>\n#include <vector>\n\nint main() {\n    // Writing to a file\n    {\n        std::ofstream out(\"output.txt\");\n        if (!out.is_open()) {\n            std::cerr << \"Failed to open output.txt\\n\";\n            return 1;\n        }\n\n        out << \"Line 1: Hello\\n\";\n        out << \"Line 2: World\\n\";\n        out << \"Line 3: The answer is 42\\n\";\n        // File auto-closes when out goes out of scope\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of File I/O: ifstream, ofstream — common patterns you'll see in production.\n// APPROACH  - Combine File I/O: ifstream, ofstream with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Reading from a file line by line\n    {\n        std::ifstream in(\"output.txt\");\n        if (!in.is_open()) {\n            std::cerr << \"Failed to open input file\\n\";\n            return 1;\n        }\n\n        std::string line;\n        while (std::getline(in, line)) {\n            std::cout << \"Read: \" << line << \"\\n\";\n        }\n        // File auto-closes when in goes out of scope\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of File I/O: ifstream, ofstream — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reading structured data,    {,        std::ofstream out(\"data.txt\");,        out << \"10 20 30\\n\";,        out << \"40 50 60\\n\";,    },,    {,        std::ifstream in(\"data.txt\");,        int a, b, c;,        while (in >> a >> b >> c) {,            std::cout << \"Triplet: \" << a << \" \" << b << \" \" << c << \"\\n\";,        },    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Always check is_open() after opening a file or test the stream state.",
                  "Use std::getline for reading lines; >> skips whitespace.",
                  "Streams auto-close on scope exit (RAII); explicitly closing is optional."
        ],
        mistake: "Not checking if file open succeeded before reading/writing, or not using RAII.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 6: Error Handling ─────────────────────────────────────────
  {
    id: "error-handling",
    title: "Error Handling",
    entries: [
      {
        id: "try-catch",
        fn: "try / catch",
        desc: "Exception handling: try block executes, catch handles thrown exceptions.",
        category: "Error Handling",
        subtitle: "Exception handling",
        signature: "try { } catch (ExceptionType& e) { }",
        descLong: "try executes code that might throw an exception. catch blocks handle specific exception types. Multiple catch blocks match in order; use catch(...) as a fallback. Exceptions propagate up the call stack until a matching catch is found. Use exceptions for exceptional conditions, not control flow.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of try / catch — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <stdexcept>\n#include <string>\n\nclass CustomException : public std::runtime_error {\npublic:\n    explicit CustomException(const std::string& msg) : std::runtime_error(msg) {}\n};\n\nint divide(int a, int b) {\n    if (b == 0) {\n        throw std::invalid_argument(\"Division by zero\");\n    }\n    return a / b;\n}\n\nint main() {\n    // Basic try-catch\n    try {\n        int result = divide(10, 0);\n        std::cout << \"Result: \" << result << \"\\n\";\n    } catch (const std::invalid_argument& e) {\n        std::cout << \"Caught error: \" << e.what() << \"\\n\";\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of try / catch — common patterns you'll see in production.\n// APPROACH  - Combine try / catch with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple catch blocks\n    try {\n        int x = -5;\n        if (x < 0) {\n            throw CustomException(\"Negative value not allowed\");\n        }\n    } catch (const CustomException& e) {\n        std::cout << \"Custom: \" << e.what() << \"\\n\";\n    } catch (const std::exception& e) {\n        // Catches any std::exception and derived types\n        std::cout << \"Standard exception: \" << e.what() << \"\\n\";\n    } catch (...) {\n        // Catches any exception type\n        std::cout << \"Unknown exception\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of try / catch — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Exception in function propagates,    try {,        int result = divide(20, 2);,        std::cout << \"20 / 2 = \" << result << \"\\n\";,    } catch (const std::exception& e) {,        std::cout << \"Error: \" << e.what() << \"\\n\";,    },,    std::cout << \"Program continues\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Catch exceptions by const reference to avoid slicing: catch (const std::exception& e)",
                  "Order catch blocks from most specific to least specific.",
                  "Use exceptions for exceptional conditions, not for normal control flow."
        ],
        mistake: "Catching by value (slicing exception information) or not catching base class in hierarchy.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "stdoptional",
        fn: "std::optional",
        desc: "Represent optional values (value or empty) without exceptions (C++17).",
        category: "Error Handling",
        subtitle: "Optional value container",
        signature: "std::optional<T> maybe = value;",
        descLong: "std::optional<T> wraps a value of type T or represents \"no value\". Use it for functions that may or may not return a meaningful result. Check with has_value() or operator bool, or access with value() or operator*. Prefer optional over exceptions for expected \"not found\" scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::optional — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <optional>\n#include <string>\n#include <map>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::optional — common patterns you'll see in production.\n// APPROACH  - Combine std::optional with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Function returning optional\nstd::optional<int> find_id(const std::string& name) {\n    static std::map<std::string, int> db{\n        {\"Alice\", 101}, {\"Bob\", 102}, {\"Charlie\", 103}\n    };\n\n    auto it = db.find(name);\n    if (it != db.end()) {\n        return it->second;\n    }\n    return std::nullopt;  // no value\n}\n\nint main() {\n    // Check if value is present\n    auto id = find_id(\"Alice\");\n    if (id.has_value()) {\n        std::cout << \"ID: \" << id.value() << \"\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::optional — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Use with operator bool,    if (auto id = find_id(\"Bob\")) {,        std::cout << \"Bob's ID: \" << *id << \"\\n\";  // operator*,    } else {,        std::cout << \"Bob not found\\n\";,    },\n\n    // Use value_or() for default,    auto charlie_id = find_id(\"Charlie\");,    std::cout << \"Charlie ID (or -1): \" << charlie_id.value_or(-1) << \"\\n\";,,    auto unknown_id = find_id(\"Unknown\");,    std::cout << \"Unknown ID (or -1): \" << unknown_id.value_or(-1) << \"\\n\";  // -1,\n\n    // Transform optional with map (C++23 in some compilers),    if (auto result = find_id(\"Alice\")) {,        int new_id = result.value() * 10;,        std::cout << \"Transformed: \" << new_id << \"\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::optional for values that may or may not exist (search results, optional parameters).",
                  "Check with has_value() or simply: if (optional_var) { }",
                  "Use value_or(default) for convenient default value fallback."
        ],
        mistake: "Calling value() without checking has_value() first; throws std::bad_optional_access.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "stdexpected",
        fn: "std::expected (C++23)",
        desc: "Return either a value or an error without exceptions.",
        category: "Error Handling",
        subtitle: "Result type with error value",
        signature: "std::expected<T, E> result = value_or_error;",
        descLong: "std::expected<T, E> holds either a value of type T or an error of type E. Use it for functions that may fail and return error information. Provides value(), error(), and operator bool. Avoids exceptions while communicating failure reasons. C++23 feature (or use a library like outcome for earlier standards).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::expected (C++23) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <cstdint>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::expected (C++23) — common patterns you'll see in production.\n// APPROACH  - Combine std::expected (C++23) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simulated expected-like behavior (C++23 has std::expected)\n// This example shows the pattern\n\nenum class ParseError {\n    InvalidFormat,\n    OutOfRange,\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::expected (C++23) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function returning either value or error,// (requires C++23 std::expected or third-party library),class Result {,    bool is_ok;,    int value_;,    ParseError error_;,public:,    Result(int v) : is_ok(true), value_(v), error_{} {},    Result(ParseError e) : is_ok(false), value_(), error_(e) {},,    bool ok() const { return is_ok; },    int value() const { return value_; },    ParseError error() const { return error_; },};,,Result parse_int(const std::string& str) {,    try {,        size_t idx = 0;,        int value = std::stoi(str, &idx);,        if (idx != str.length()) {,            return ParseError::InvalidFormat;,        },        if (value < 0 || value > 100) {,            return ParseError::OutOfRange;,        },        return Result(value);,    } catch (...) {,        return ParseError::InvalidFormat;,    },},,int main() {,    auto result = parse_int(\"42\");,    if (result.ok()) {,        std::cout << \"Parsed: \" << result.value() << \"\\n\";,    } else {,        std::cout << \"Parse error: \" << int(result.error()) << \"\\n\";,    },,    auto bad_result = parse_int(\"invalid\");,    if (!bad_result.ok()) {,        std::cout << \"Failed to parse\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use expected for functions that return either a value or error information.",
                  "Avoid exceptions for expected error conditions; use expected instead.",
                  "C++23 feature; use third-party libraries (outcome, etc.) for earlier standards."
        ],
        mistake: "Using exceptions for every error when expected would be more efficient.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "noexcept",
        fn: "noexcept specifier",
        desc: "Declare functions that do not throw exceptions.",
        category: "Error Handling",
        subtitle: "Exception specification",
        signature: "void func() noexcept { }",
        descLong: "noexcept specifies that a function does not throw exceptions. Enables compiler optimizations and is important for move semantics and generic programming. Use noexcept(condition) for conditional exception safety. Always mark move constructors/assignments as noexcept if possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of noexcept specifier — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <utility>\n\nclass SafeBuffer {\npublic:\n    SafeBuffer() noexcept = default;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of noexcept specifier — common patterns you'll see in production.\n// APPROACH  - Combine noexcept specifier with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Move constructor is noexcept — safe for vector reallocation\n    SafeBuffer(SafeBuffer&& other) noexcept : data(std::move(other.data)) {}\n\n    void add(int x) noexcept {\n        data.push_back(x);  // std::vector::push_back is noexcept\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of noexcept specifier — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function that might fail,    void risky_operation() {,        throw std::runtime_error(\"Something went wrong\");,    },\n\n    // Conditional noexcept,    template<typename T>,    void process(T value) noexcept(noexcept(T(value))) {,        // This function is noexcept only if T's operations are,    },,private:,    std::vector<int> data;,};,,int main() {,    std::vector<SafeBuffer> buffers;,\n\n    // Because SafeBuffer's move constructor is noexcept,,    // vector can use move instead of copy when reallocating,    buffers.emplace_back();,    buffers[0].add(42);,,    try {,        buffers[0].risky_operation();,    } catch (const std::exception& e) {,        std::cout << \"Caught: \" << e.what() << \"\\n\";,    },,    std::cout << \"Buffer size: \" << buffers.size() << \"\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Mark move constructors and move assignments as noexcept to allow vector reallocation via move.",
                  "Use noexcept for functions that genuinely cannot throw (destructors are implicitly noexcept).",
                  "Use noexcept(condition) for templates with conditional exception safety."
        ],
        mistake: "Forgetting noexcept on move constructors; causes vectors to copy instead of move.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 7: Namespaces, Enums & Casting ─────────────────────────────────────────
  {
    id: "namespaces-enums-casts",
    title: "Namespaces, Enums & Casting",
    entries: [
      {
        id: "namespaces",
        fn: "Namespaces",
        desc: "Organize code into logical groups and prevent name collisions across libraries and modules.",
        category: "Organization",
        subtitle: "namespace, using, inline namespace, anonymous namespace",
        signature: "namespace name { }  |  using namespace std;  |  namespace A::B { }",
        descLong: "Namespaces group related declarations and prevent name clashes. Nested namespaces (C++17: namespace A::B) reduce boilerplate. Anonymous namespaces provide internal linkage (like static). Inline namespaces support API versioning. Avoid \"using namespace std;\" in headers — it pollutes every file that includes it.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Namespaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Namespaces — common patterns you'll see in production.\n// APPROACH  - Combine Namespaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Basic namespace\nnamespace math {\n    constexpr double PI = 3.14159265358979;\n    double area(double r) { return PI * r * r; }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Namespaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Nested namespace (C++17),namespace company::project::module {,    void init() { std::cout << \"Initialized\\n\"; },},\n\n// Anonymous namespace — internal linkage (file-private),namespace {,    int counter = 0;  // only visible in this translation unit,    void helper() { ++counter; },},\n\n// Inline namespace — API versioning,namespace mylib {,    inline namespace v2 {,        struct Config { std::string name; int version = 2; };,    },    namespace v1 {,        struct Config { std::string name; };,    },},,int main() {,    // Qualified access,    double a = math::area(5.0);,\n\n    // using declaration (single name),    using math::PI;,    std::cout << PI << \"\\n\";,\n\n    // using directive (entire namespace — avoid in headers!),    using namespace math;,    std::cout << area(3.0) << \"\\n\";,\n\n    // Nested namespace,    company::project::module::init();,\n\n    // Inline namespace — v2 is default,    mylib::Config cfg{\"app\"};       // uses v2::Config,    mylib::v1::Config old{\"app\"};   // explicit v1,\n\n    // Namespace alias,    namespace cpm = company::project::module;,    cpm::init();,,    return 0;,}"
                  }
        ],
        tips: [
                  "Never put \"using namespace std;\" in a header — it forces the namespace on every includer.",
                  "Use namespace aliases for long nested namespaces: namespace fs = std::filesystem;",
                  "Anonymous namespaces replace \"static\" for file-private functions and variables in C++.",
                  "Inline namespaces let you version APIs: users get v2 by default but can opt into v1 explicitly."
        ],
        mistake: "Putting \"using namespace std;\" at file scope in a header file — every file that includes it inherits the pollution, causing name collisions with user-defined names like \"count\", \"find\", \"sort\".",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "scoped-enums",
        fn: "Scoped Enums (enum class)",
        desc: "Type-safe enumerations that don't implicitly convert to integers or leak names into enclosing scope.",
        category: "Types",
        subtitle: "enum class vs unscoped enum, underlying types",
        signature: "enum class Color : uint8_t { Red, Green, Blue };",
        descLong: "Scoped enums (enum class, C++11) fix three problems with C enums: they don't implicitly convert to int, their enumerators don't leak into the enclosing scope, and you can specify the underlying type. Always prefer enum class over plain enum in modern C++.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Scoped Enums (enum class) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <cstdint>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Scoped Enums (enum class) — common patterns you'll see in production.\n// APPROACH  - Combine Scoped Enums (enum class) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Scoped enum (preferred)\nenum class Color : uint8_t { Red, Green, Blue };\nenum class Direction { North, South, East, West };"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Scoped Enums (enum class) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Unscoped enum (legacy — avoid),enum OldColor { RED, GREEN, BLUE };  // RED, GREEN, BLUE leak into scope,\n\n// With explicit values,enum class HttpStatus : int {,    OK = 200,,    Created = 201,,    BadRequest = 400,,    NotFound = 404,,    InternalError = 500,,};,\n\n// Using enum class,Color c = Color::Red;,// int x = c;                  // ERROR: no implicit conversion,int x = static_cast<int>(c);   // explicit conversion OK,\n\n// Switch,std::string colorName(Color c) {,    switch (c) {,        case Color::Red:   return \"Red\";,        case Color::Green: return \"Green\";,        case Color::Blue:  return \"Blue\";,    },    return \"Unknown\";  // compiler warns if case missing (with -Wswitch),},\n\n// Scoped enum as flags (bitmask pattern),enum class Permission : unsigned {,    None    = 0,,    Read    = 1 << 0,,    Write   = 1 << 1,,    Execute = 1 << 2,,};,\n\n// Need to define operators for flag enums,constexpr Permission operator|(Permission a, Permission b) {,    return static_cast<Permission>(,        static_cast<unsigned>(a) | static_cast<unsigned>(b));,},constexpr bool operator&(Permission a, Permission b) {,    return static_cast<unsigned>(a) & static_cast<unsigned>(b);,},,auto perms = Permission::Read | Permission::Write;,if (perms & Permission::Read) { /* has read */ }"
                  }
        ],
        tips: [
                  "Always use enum class over plain enum — scoped, type-safe, no implicit int conversion.",
                  "Specify underlying type (: uint8_t) when you need to control size or serialize.",
                  "Compiler warns on incomplete switch over enum class values with -Wswitch — catches missing cases.",
                  "For flag enums, define bitwise operators (|, &, ^) as free functions or use a library."
        ],
        mistake: "Using unscoped enum in a header — enumerator names (RED, GREEN) leak into the global scope and collide with other names. enum class keeps them scoped.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
      {
        id: "casting",
        fn: "C++ Casts (static, dynamic, const, reinterpret)",
        desc: "Four named casts replace C-style casts — each for a specific purpose, with compile-time safety checks.",
        category: "Types",
        subtitle: "static_cast, dynamic_cast, const_cast, reinterpret_cast",
        signature: "static_cast<T>(expr)  |  dynamic_cast<T*>(ptr)  |  const_cast  |  reinterpret_cast",
        descLong: "C++ provides four named casts that make intent explicit and enable compiler checks. static_cast: well-defined conversions (int→double, Base*→Derived*). dynamic_cast: safe runtime downcasting with RTTI. const_cast: add/remove const. reinterpret_cast: bit-pattern reinterpretation. Never use C-style casts — they silently pick the most dangerous cast that works.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of C++ Casts (static, dynamic, const, reinterpret) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n\nclass Base {\npublic:\n    virtual ~Base() = default;\n    virtual void speak() { std::cout << \"Base\\n\"; }\n};\nclass Derived : public Base {\npublic:\n    void speak() override { std::cout << \"Derived\\n\"; }\n    void special() { std::cout << \"Only in Derived\\n\"; }\n};\n\nint main() {\n    // ── static_cast: compile-time checked conversions ────\n    double pi = 3.14;\n    int truncated = static_cast<int>(pi);           // 3 (well-defined)\n\n    int raw = 42;\n    auto e = static_cast<HttpStatus>(raw);          // int → enum"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of C++ Casts (static, dynamic, const, reinterpret) — common patterns you'll see in production.\n// APPROACH  - Combine C++ Casts (static, dynamic, const, reinterpret) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Upcast (always safe)\n    Derived d;\n    Base* bp = static_cast<Base*>(&d);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of C++ Casts (static, dynamic, const, reinterpret) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Downcast (unsafe — no runtime check!),    Derived* dp = static_cast<Derived*>(bp);        // OK only if bp really points to Derived,\n\n    // ── dynamic_cast: runtime-checked downcast (needs virtual) ──,    Base* unknown = new Derived();,,    Derived* safe = dynamic_cast<Derived*>(unknown);,    if (safe) {,        safe->special();  // safe to call,    },\n\n    // With references — throws std::bad_cast on failure,    try {,        Derived& ref = dynamic_cast<Derived&>(*unknown);,        ref.special();,    } catch (const std::bad_cast& e) {,        std::cerr << \"Cast failed: \" << e.what() << \"\\n\";,    },\n\n    // ── const_cast: remove/add const ────────────────────,    const std::string& name = \"Alice\";,    // name[0] = 'B';                                // ERROR: const,    std::string& mutable_name = const_cast<std::string&>(name);,    // Only safe if original object is non-const!,\n\n    // Common use: calling non-const API from const context,    void legacyApi(char* str);  // old C API, doesn't modify,    const char* msg = \"hello\";,    // legacyApi(const_cast<char*>(msg));             // OK if API really doesn't modify,\n\n    // ── reinterpret_cast: bit-pattern reinterpretation ──,    int value = 0x12345678;,    char* bytes = reinterpret_cast<char*>(&value);,    // Access individual bytes (platform-dependent endianness),,    delete unknown;,    return 0;,}"
                  }
        ],
        tips: [
                  "static_cast for \"normal\" conversions (numeric, up/down hierarchy) — most common cast.",
                  "dynamic_cast for safe downcasting — returns nullptr (pointer) or throws bad_cast (reference) on failure.",
                  "const_cast only to interface with legacy APIs that lack const-correctness — modifying a truly const object is UB.",
                  "reinterpret_cast is almost always wrong — needed only for low-level memory/hardware access."
        ],
        mistake: "Using C-style casts ((int)x, (Derived*)ptr) — they silently chain static_cast → const_cast → reinterpret_cast until one works. Named casts make your intent explicit and catch errors at compile time.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <map>\n\nint ma",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
