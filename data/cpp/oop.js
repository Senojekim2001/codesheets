export const meta = {
  "id": "oop",
  "label": "OOP & Design Patterns",
  "icon": "🏛️",
  "description": "Classes, inheritance, virtual functions, templates, and essential design patterns."
}

export const sections = [

  // ── Section 1: Classes & Inheritance ─────────────────────────────────────────
  {
    id: "classes-inheritance",
    title: "Classes & Inheritance",
    entries: [
      {
        id: "constructors-destructors",
        fn: "Constructors & Destructors",
        desc: "Initialize and clean up objects.",
        category: "Classes & Inheritance",
        subtitle: "Object lifecycle",
        signature: "Class(params) { }  ~Class() { }",
        descLong: "Constructors initialize objects; destructors clean up resources. Default constructor takes no arguments. Copy constructor copies state; move constructor transfers ownership. Destructors are called on object destruction. Use RAII to tie resource management to constructors/destructors.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Constructors & Destructors — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <vector>\n\nclass Person {\npublic:\n    // Constructor\n    Person(const std::string& name, int age)\n        : name_(name), age_(age) {\n        std::cout << \"Person \" << name_ << \" created\\n\";\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Constructors & Destructors — common patterns you'll see in production.\n// APPROACH  - Combine Constructors & Destructors with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Destructor\n    ~Person() {\n        std::cout << \"Person \" << name_ << \" destroyed\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Constructors & Destructors — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Copy constructor (explicit for clarity),    Person(const Person& other),        : name_(other.name_), age_(other.age_) {,        std::cout << \"Person \" << name_ << \" copied\\n\";,    },\n\n    // Move constructor,    Person(Person&& other) noexcept,        : name_(std::move(other.name_)), age_(other.age_) {,        other.age_ = 0;,        std::cout << \"Person \" << name_ << \" moved\\n\";,    },,    std::string name() const { return name_; },    int age() const { return age_; },,private:,    std::string name_;,    int age_;,};,,int main() {,    {,        Person p1(\"Alice\", 30);,        Person p2 = p1;  // copy constructor,        Person p3 = Person(\"Bob\", 25);  // temporary, move constructor,    }  // All destroyed here,,    std::vector<Person> people;,    people.emplace_back(\"Charlie\", 35);,    people.emplace_back(\"Diana\", 28);,,    std::cout << \"People in vector\\n\";,    return 0;,}"
                  }
        ],
        tips: [
                  "Use member initializer lists for efficient initialization.",
                  "Mark copy constructors explicit if you want to control copying behavior.",
                  "Implement move constructors for efficient transfer of resources."
        ],
        mistake: "Not implementing destructor for resource-owning classes; memory leaks.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "virtual-functions",
        fn: "Virtual Functions",
        desc: "Enable dynamic polymorphism via method overriding.",
        category: "Classes & Inheritance",
        subtitle: "Runtime polymorphism",
        signature: "virtual void method() const { }  override",
        descLong: "virtual allows derived classes to override methods. Function calls are resolved at runtime based on actual object type. Use override keyword to explicitly mark overriding functions (catches errors). Use pure virtual for abstract methods (= 0). Base class pointers/references can point to derived objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Virtual Functions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <memory>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;  // virtual destructor for cleanup\n\n    virtual double area() const = 0;  // pure virtual\n    virtual void draw() const = 0;\n    virtual std::string name() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    explicit Circle(double radius) : radius_(radius) {}\n\n    double area() const override {\n        return 3.14159 * radius_ * radius_;\n    }\n\n    void draw() const override {\n        std::cout << \"Drawing circle\\n\";\n    }\n\n    std::string name() const override {\n        return \"Circle\";\n    }\n\nprivate:\n    double radius_;\n};\n\nclass Rectangle : public Shape {\npublic:\n    Rectangle(double width, double height) : w_(width), h_(height) {}\n\n    double area() const override {\n        return w_ * h_;\n    }\n\n    void draw() const override {\n        std::cout << \"Drawing rectangle\\n\";\n    }\n\n    std::string name() const override {\n        return \"Rectangle\";\n    }\n\nprivate:\n    double w_, h_;\n};\n\nint main() {\n    std::vector<std::unique_ptr<Shape>> shapes;\n    shapes.push_back(std::make_unique<Circle>(5.0));\n    shapes.push_back(std::make_unique<Rectangle>(4.0, 6.0));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Virtual Functions — common patterns you'll see in production.\n// APPROACH  - Combine Virtual Functions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Virtual function calls resolved at runtime\n    for (auto& shape : shapes) {\n        shape->draw();\n        std::cout << name() << \" area: \" << shape->area() << \"\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Virtual Functions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nreturn 0;\n}"
                  }
        ],
        tips: [
                  "Always declare virtual destructors in base classes.",
                  "Use override keyword to catch mistakes when overriding methods.",
                  "Prefer virtual functions over if-else type checking for extensibility."
        ],
        mistake: "Forgetting virtual destructor; derived destructors may not be called.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "inheritance-types",
        fn: "Inheritance Types",
        desc: "Public, protected, and private inheritance.",
        category: "Classes & Inheritance",
        subtitle: "Inheritance access control",
        signature: "class Derived : public Base { }  |  class Derived : private Base { }",
        descLong: "Public inheritance: base class interface is available to clients. Protected inheritance: base interface available to derived classes only. Private inheritance: base interface hidden (use composition instead). Prefer composition over inheritance for code reuse; use inheritance for \"is-a\" relationships.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Inheritance Types — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n\nclass Animal {\npublic:\n    virtual void speak() const { std::cout << \"Animal sound\\n\"; }\n    virtual ~Animal() = default;\n\nprotected:\n    std::string name_;\n\nprivate:\n    int age_;\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Inheritance Types — common patterns you'll see in production.\n// APPROACH  - Combine Inheritance Types with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Public inheritance: Animal is part of Dog's interface\nclass Dog : public Animal {\npublic:\n    void speak() const override { std::cout << \"Woof!\\n\"; }\n    void set_name(const std::string& n) { name_ = n; }  // can use protected name_\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Inheritance Types — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Private inheritance: Animal interface hidden (use composition instead!),class SecretDog : private Animal {,public:,    void bark() { speak(); }  // can call speak() internally,    // But clients cannot call speak() via SecretDog object,};,,int main() {,    Dog dog;,    dog.set_name(\"Buddy\");,    dog.speak();  // OK: public inheritance,,    SecretDog secret;,    // secret.speak();  // ERROR: speak() is private in SecretDog,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use public inheritance for \"is-a\" relationships.",
                  "Use protected inheritance rarely; prefer public + protected methods.",
                  "Use composition over private inheritance; it is clearer."
        ],
        mistake: "Using private inheritance instead of composition for code reuse.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "multiple-inheritance",
        fn: "Multiple Inheritance",
        desc: "Derive from multiple base classes (use sparingly).",
        category: "Classes & Inheritance",
        subtitle: "Multiple base classes",
        signature: "class Derived : public Base1, public Base2 { }",
        descLong: "Multiple inheritance allows a class to inherit from multiple bases. Can cause diamond problem (same base inherited twice). C++ resolves via virtual inheritance, but adds complexity. Prefer composition or single inheritance with interfaces (abstract classes).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Multiple Inheritance — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n\nclass Animal {\npublic:\n    virtual void speak() = 0;\n    virtual ~Animal() = default;\n};\n\nclass Flyable {\npublic:\n    virtual void fly() = 0;\n    virtual ~Flyable() = default;\n};\n\nclass Bird : public Animal, public Flyable {\npublic:\n    void speak() override {\n        std::cout << \"Tweet!\\n\";\n    }\n\n    void fly() override {\n        std::cout << \"Flying...\\n\";\n    }\n};\n\nint main() {\n    Bird bird;\n    bird.speak();\n    bird.fly();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Multiple Inheritance — common patterns you'll see in production.\n// APPROACH  - Combine Multiple Inheritance with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Note: Bird is both Animal and Flyable\n    Animal& as_animal = bird;\n    Flyable& as_flyable = bird;\n\n    as_animal.speak();\n    as_flyable.fly();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Multiple Inheritance — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nreturn 0;\n}"
                  }
        ],
        tips: [
                  "Use multiple inheritance for interface (pure abstract classes) composition.",
                  "Avoid complex inheritance hierarchies; prefer single inheritance with composition.",
                  "Be aware of diamond problem with virtual inheritance."
        ],
        mistake: "Creating deep or complex multiple inheritance hierarchies.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "operator-overloading",
        fn: "Operator Overloading",
        desc: "Define custom behavior for operators like +, ==, [].",
        category: "Classes & Inheritance",
        subtitle: "Custom operators",
        signature: "T operator+(const T& other) const { }  bool operator==(const T& other) const { }",
        descLong: "Overload operators to provide natural syntax for custom types. Implement operator+, operator==, operator[], etc. Some operators must be member functions (=, [], (), ->); others can be free functions. Follow C++ conventions for expected behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Operator Overloading — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <cmath>\n\nclass Vector2D {\npublic:\n    Vector2D(double x = 0, double y = 0) : x_(x), y_(y) {}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Operator Overloading — common patterns you'll see in production.\n// APPROACH  - Combine Operator Overloading with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Operator+ for addition\n    Vector2D operator+(const Vector2D& other) const {\n        return Vector2D(x_ + other.x_, y_ + other.y_);\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Operator Overloading — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Operator* for scalar multiplication,    Vector2D operator*(double scalar) const {,        return Vector2D(x_ * scalar, y_ * scalar);,    },\n\n    // Operator== for equality,    bool operator==(const Vector2D& other) const {,        const double eps = 1e-9;,        return std::abs(x_ - other.x_) < eps && std::abs(y_ - other.y_) < eps;,    },\n\n    // Operator[] for component access,    double& operator[](int index) {,        return index == 0 ? x_ : y_;,    },,    const double& operator[](int index) const {,        return index == 0 ? x_ : y_;,    },\n\n    // Operator<< for stream output,    friend std::ostream& operator<<(std::ostream& os, const Vector2D& v) {,        return os << \"(\" << v.x_ << \", \" << v.y_ << \")\";,    },,    double x() const { return x_; },    double y() const { return y_; },,private:,    double x_, y_;,};,,int main() {,    Vector2D v1{3, 4};,    Vector2D v2{1, 2};,,    Vector2D v3 = v1 + v2;,    std::cout << \"v1 + v2 = \" << v3 << \"\\n\";,,    Vector2D v4 = v1 * 2.0;,    std::cout << \"v1 * 2 = \" << v4 << \"\\n\";,,    std::cout << \"v1 == v2: \" << (v1 == v2) << \"\\n\";,    std::cout << \"v1[0] = \" << v1[0] << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Overload operators to make custom types feel like built-in types.",
                  "Return references (T&) for compound assignment operators (+=, -=, etc.).",
                  "Make comparison operators const and non-modifying."
        ],
        mistake: "Implementing operator+ incorrectly by modifying *this instead of returning new object.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Templates & Generics ─────────────────────────────────────────
  {
    id: "templates-generics",
    title: "Templates & Generics",
    entries: [
      {
        id: "class-templates",
        fn: "Class Templates",
        desc: "Define classes parameterized by types.",
        category: "Templates & Generics",
        subtitle: "Generic classes",
        signature: "template<typename T> class Container { };",
        descLong: "Class templates are blueprints for classes that work with any type. Compiler instantiates concrete versions for each type used. Useful for containers, wrappers, and generic algorithms. Template definitions must be in header files (or use extern template).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Class Templates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <utility>\n\ntemplate<typename T>\nclass Stack {\npublic:\n    void push(const T& value) {\n        items_.push_back(value);\n    }\n\n    T pop() {\n        if (items_.empty()) {\n            throw std::runtime_error(\"Stack is empty\");\n        }\n        T top = items_.back();\n        items_.pop_back();\n        return top;\n    }\n\n    bool empty() const {\n        return items_.empty();\n    }\n\n    size_t size() const {\n        return items_.size();\n    }\n\nprivate:\n    std::vector<T> items_;\n};\n\ntemplate<typename K, typename V>\nclass Pair {\npublic:\n    Pair(const K& key, const V& value) : key_(key), value_(value) {}\n\n    const K& key() const { return key_; }\n    const V& value() const { return value_; }\n\nprivate:\n    K key_;\n    V value_;\n};\n\nint main() {\n    // Stack of integers\n    Stack<int> int_stack;\n    int_stack.push(1);\n    int_stack.push(2);\n    int_stack.push(3);\n\n    while (!int_stack.empty()) {\n        std::cout << \"Popped: \" << int_stack.pop() << \"\\n\";\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Class Templates — common patterns you'll see in production.\n// APPROACH  - Combine Class Templates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Stack of strings\n    Stack<std::string> string_stack;\n    string_stack.push(\"hello\");\n    string_stack.push(\"world\");\n    std::cout << string_stack.pop() << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Class Templates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Pair of different types,    Pair<std::string, int> entry(\"age\", 30);,    std::cout << entry.key() << \" = \" << entry.value() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Template definitions must be in header files or use extern template explicitly.",
                  "Use template specialization for type-specific behavior.",
                  "Keep template code generic and avoid assuming specific member functions."
        ],
        mistake: "Defining template class implementation in .cpp files; it will not instantiate.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "template-specialization",
        fn: "Template Specialization",
        desc: "Provide specialized implementations for specific types.",
        category: "Templates & Generics",
        subtitle: "Type-specific templates",
        signature: "template<> class Container<bool> { };  |  template<typename T> class Container<T*> { }",
        descLong: "Full specialization provides a custom implementation for a specific type or parameter combo. Partial specialization specializes on type patterns (pointers, references, etc.). Use specialization for optimizations or type-specific behavior.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Template Specialization — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <vector>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Template Specialization — common patterns you'll see in production.\n// APPROACH  - Combine Template Specialization with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// General template\ntemplate<typename T>\nclass Printer {\npublic:\n    static void print(const T& value) {\n        std::cout << \"Generic: \" << value << \"\\n\";\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Template Specialization — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Full specialization for bool (more informative output),template<>,class Printer<bool> {,public:,    static void print(const bool& value) {,        std::cout << \"Boolean: \" << (value ? \"true\" : \"false\") << \"\\n\";,    },};,\n\n// Full specialization for std::string,template<>,class Printer<std::string> {,public:,    static void print(const std::string& value) {,        std::cout << \"String: \\\"\" << value << \"\\\"\\n\";,    },};,\n\n// Partial specialization for pointers,template<typename T>,class Printer<T*> {,public:,    static void print(T* const& ptr) {,        std::cout << \"Pointer: \" << ptr << \"\\n\";,    },};,\n\n// Partial specialization for vectors,template<typename T>,class Printer<std::vector<T>> {,public:,    static void print(const std::vector<T>& vec) {,        std::cout << \"Vector[\";,        for (size_t i = 0; i < vec.size(); ++i) {,            if (i > 0) std::cout << \", \";,            std::cout << vec[i];,        },        std::cout << \"]\\n\";,    },};,,int main() {,    Printer<int>::print(42);,    Printer<bool>::print(true);,    Printer<std::string>::print(\"hello\");,,    int x = 10;,    Printer<int*>::print(&x);,,    std::vector<int> vec{1, 2, 3};,    Printer<std::vector<int>>::print(vec);,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use full specialization for single type cases.",
                  "Use partial specialization for type patterns (pointers, templates, etc.).",
                  "Specializations are visible only if declared before use."
        ],
        mistake: "Forgetting to declare template specialization before use.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "variadic-templates",
        fn: "Variadic Templates",
        desc: "Templates accepting variable numbers of type parameters.",
        category: "Templates & Generics",
        subtitle: "Variable template arguments",
        signature: "template<typename... Args> void func(Args... args) { }",
        descLong: "Variadic templates handle any number of type and value arguments. Args... is a parameter pack. Use recursive unpacking or fold expressions (C++17) for processing. Enables type-safe variadic functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variadic Templates — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <tuple>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variadic Templates — common patterns you'll see in production.\n// APPROACH  - Combine Variadic Templates with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Recursive variadic template for printing\ntemplate<typename T>\nvoid print_impl(const T& value) {\n    std::cout << value;\n}\n\ntemplate<typename T, typename... Rest>\nvoid print_impl(const T& value, const Rest&... rest) {\n    std::cout << value << \", \";\n    print_impl(rest...);\n}\n\ntemplate<typename... Args>\nvoid print_values(const Args&... args) {\n    std::cout << \"Values: \";\n    print_impl(args...);\n    std::cout << \"\\n\";\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variadic Templates — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Tuple construction from variadic args (C++17+),template<typename... Args>,auto make_tuple_from(const Args&... args) {,    return std::make_tuple(args...);,},\n\n// Fold expression (C++17) for sum,template<typename... Args>,int sum(const Args&... args) {,    return (args + ... + 0);  // fold: add all args,},\n\n// Count arguments,template<typename... Args>,constexpr size_t count_args(const Args&...) {,    return sizeof...(Args);,},,int main() {,    print_values(1, 2, 3);,    print_values(\"hello\", \"world\", 42);,,    auto t = make_tuple_from(10, \"test\", 3.14);,    std::cout << \"Tuple size: \" << std::tuple_size_v<decltype(t)> << \"\\n\";,,    std::cout << \"Sum(1,2,3,4,5) = \" << sum(1, 2, 3, 4, 5) << \"\\n\";,    std::cout << \"Args: \" << count_args(1, 2, 3) << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use fold expressions (C++17) to simplify variadic processing.",
                  "Recursive unpacking works but is verbose; prefer fold expressions.",
                  "Use sizeof...(Args) to get the count of arguments in a pack."
        ],
        mistake: "Not using fold expressions in C++17+; they simplify code significantly.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "sfinae-concepts",
        fn: "SFINAE vs Concepts",
        desc: "Template meta-programming for conditional instantiation.",
        category: "Templates & Generics",
        subtitle: "Conditional templates",
        signature: "template<typename T, typename = std::enable_if_t<...>> or template<std::integral T>",
        descLong: "SFINAE (Substitution Failure Is Not An Error) uses type traits to enable/disable templates. C++20 concepts are cleaner. Prefer concepts on C++20 compilers. SFINAE still useful for legacy code and fine-grained control.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SFINAE vs Concepts — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <concepts>\n#include <type_traits>\n#include <string>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SFINAE vs Concepts — common patterns you'll see in production.\n// APPROACH  - Combine SFINAE vs Concepts with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// OLD: SFINAE with enable_if\ntemplate<typename T, typename = std::enable_if_t<std::is_integral_v<T>>>\nvoid process_int_sfinae(T value) {\n    std::cout << \"SFINAE integral: \" << value << \"\\n\";\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SFINAE vs Concepts — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// NEW: Concepts (C++20),template<std::integral T>,void process_int_concept(T value) {,    std::cout << \"Concept integral: \" << value << \"\\n\";,},\n\n// SFINAE for types with a size() method,template<typename T, typename = decltype(std::declval<T>().size())>,void has_size_sfinae(const T& value) {,    std::cout << \"SFINAE has size: \" << value.size() << \"\\n\";,},\n\n// Concept for types with size(),template<typename T>,concept HasSize = requires(T t) {,    { t.size() } -> std::convertible_to<std::size_t>;,};,,template<HasSize T>,void has_size_concept(const T& value) {,    std::cout << \"Concept has size: \" << value.size() << \"\\n\";,},,int main() {,    // SFINAE works with integral types,    process_int_sfinae(42);,\n\n    // Concepts work with integral types (cleaner syntax),    process_int_concept(100);,\n\n    // SFINAE works with types having size(),    std::string str = \"hello\";,    has_size_sfinae(str);,\n\n    // Concepts work with types having size() (clearer),    has_size_concept(str);,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use concepts (C++20+) instead of SFINAE for clearer, more readable code.",
                  "SFINAE error messages can be cryptic; concepts provide better diagnostics.",
                  "Concepts are the future of template constraints."
        ],
        mistake: "Using SFINAE when concepts are available; concepts are clearer.",
        shorthand: {
          verbose: "#include <iostream>\n#include <concepts>\n#include <type_traits>\n#include <string>\n\n// OLD: SFINAE wit",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Design Patterns ─────────────────────────────────────────
  {
    id: "design-patterns",
    title: "Design Patterns",
    entries: [
      {
        id: "singleton-pattern",
        fn: "Singleton Pattern",
        desc: "Ensure a class has only one instance, globally accessible.",
        category: "Design Patterns",
        subtitle: "Single instance",
        signature: "static Singleton& instance() { static Singleton s; return s; }",
        descLong: "Singleton restricts a class to a single instance. Useful for global state (logger, config, database connection). Modern C++: use static variable in function (thread-safe, lazy initialization). Avoid global variables; singletons should be passed as dependencies when possible.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Singleton Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <string>\n#include <fstream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Singleton Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Singleton Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Thread-safe singleton\nclass Logger {\npublic:\n    static Logger& instance() {\n        static Logger logger;  // created once, thread-safe\n        return logger;\n    }\n\n    void log(const std::string& message) {\n        std::cout << \"[LOG] \" << message << \"\\n\";\n        log_file_ << \"[LOG] \" << message << \"\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Singleton Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Delete copy/move operations,    Logger(const Logger&) = delete;,    Logger& operator=(const Logger&) = delete;,    Logger(Logger&&) = delete;,    Logger& operator=(Logger&&) = delete;,,private:,    Logger() {,        log_file_.open(\"app.log\", std::ios::app);,    },,    ~Logger() {,        if (log_file_.is_open()) {,            log_file_.close();,        },    },,    std::ofstream log_file_;,};,\n\n// Old pattern (avoid): global pointer with manual initialization,// This is not recommended; use the above pattern instead,,int main() {,    Logger& log = Logger::instance();,    log.log(\"Application started\");,    log.log(\"Processing...\");,    log.log(\"Application ended\");,\n\n    // Same instance everywhere,    Logger::instance().log(\"Another message\");,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use static variable in function for thread-safe, lazy-initialized singleton.",
                  "Prefer dependency injection over singletons for testability.",
                  "Avoid global singletons; pass as constructor parameters when possible."
        ],
        mistake: "Using global pointer singletons instead of static variables in function.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "factory-pattern",
        fn: "Factory Pattern",
        desc: "Create objects without specifying exact classes.",
        category: "Design Patterns",
        subtitle: "Object creation",
        signature: "std::unique_ptr<Base> factory(type) { }",
        descLong: "Factory encapsulates object creation logic. Client requests an object by type/parameter; factory decides which concrete class to instantiate. Useful when object creation is complex or depends on runtime conditions. Simplify client code and decouple from concrete classes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Factory Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <memory>\n#include <string>\n#include <vector>\n\nclass Shape {\npublic:\n    virtual ~Shape() = default;\n    virtual void draw() const = 0;\n};\n\nclass Circle : public Shape {\npublic:\n    void draw() const override { std::cout << \"Drawing circle\\n\"; }\n};\n\nclass Rectangle : public Shape {\npublic:\n    void draw() const override { std::cout << \"Drawing rectangle\\n\"; }\n};\n\nclass Triangle : public Shape {\npublic:\n    void draw() const override { std::cout << \"Drawing triangle\\n\"; }\n};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Factory Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Factory Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Factory function\nstd::unique_ptr<Shape> create_shape(const std::string& type) {\n    if (type == \"circle\") {\n        return std::make_unique<Circle>();\n    } else if (type == \"rectangle\") {\n        return std::make_unique<Rectangle>();\n    } else if (type == \"triangle\") {\n        return std::make_unique<Triangle>();\n    }\n    return nullptr;\n}\n\nint main() {\n    std::vector<std::unique_ptr<Shape>> shapes;\n    shapes.push_back(create_shape(\"circle\"));\n    shapes.push_back(create_shape(\"rectangle\"));\n    shapes.push_back(create_shape(\"triangle\"));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Factory Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor (auto& shape : shapes) {\n        if (shape) {\n            shape->draw();\n        }\n    }\n\n    return 0;\n}"
                  }
        ],
        tips: [
                  "Use factory functions for simple object creation.",
                  "Use factory classes for complex creation logic with state.",
                  "Return std::unique_ptr to transfer ownership cleanly."
        ],
        mistake: "Exposing concrete class constructors; clients should use factory.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
      {
        id: "observer-pattern",
        fn: "Observer Pattern",
        desc: "Notify multiple observers of state changes.",
        category: "Design Patterns",
        subtitle: "Event notification",
        signature: "subject.attach(observer);  subject.notify();",
        descLong: "Subject maintains list of observers. When subject state changes, it notifies all observers. Enables loose coupling between subjects and observers. Use std::function or pure virtual methods for callbacks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Observer Pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <memory>\n#include <functional>\n\nclass Observer {\npublic:\n    virtual ~Observer() = default;\n    virtual void update(const std::string& message) = 0;\n};\n\nclass ConcreteObserver : public Observer {\npublic:\n    explicit ConcreteObserver(const std::string& name) : name_(name) {}\n\n    void update(const std::string& message) override {\n        std::cout << name_ << \" received: \" << message << \"\\n\";\n    }\n\nprivate:\n    std::string name_;\n};\n\nclass Subject {\npublic:\n    void attach(std::shared_ptr<Observer> observer) {\n        observers_.push_back(observer);\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Observer Pattern — common patterns you'll see in production.\n// APPROACH  - Combine Observer Pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nvoid detach(std::shared_ptr<Observer> observer) {\n        // Remove observer from list\n        observers_.erase(\n            std::remove(observers_.begin(), observers_.end(), observer),\n            observers_.end()\n        );\n    }\n\n    void notify(const std::string& message) {\n        for (auto& observer : observers_) {\n            observer->update(message);\n        }\n    }\n\n    void set_state(const std::string& state) {\n        state_ = state;\n        notify(\"State changed to: \" + state);\n    }\n\nprivate:\n    std::vector<std::shared_ptr<Observer>> observers_;\n    std::string state_;\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Observer Pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nint main() {\n    auto subject = std::make_shared<Subject>();\n\n    auto obs1 = std::make_shared<ConcreteObserver>(\"Observer1\");\n    auto obs2 = std::make_shared<ConcreteObserver>(\"Observer2\");\n\n    subject->attach(obs1);\n    subject->attach(obs2);\n\n    subject->set_state(\"Active\");\n    subject->set_state(\"Inactive\");\n\n    return 0;\n}"
                  }
        ],
        tips: [
                  "Use std::shared_ptr for observer management.",
                  "Ensure detach() removes observers cleanly.",
                  "Consider using std::function for callbacks in modern C++."
        ],
        mistake: "Not removing dead observers; leads to dangling pointers.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <memory>\n#include <functional>\n\nclass Observer {\npubl",
          concise: "// see verbose",
        },
      },
      {
        id: "crtp-pattern",
        fn: "CRTP (Curiously Recurring Template Pattern)",
        desc: "Static polymorphism without virtual functions.",
        category: "Design Patterns",
        subtitle: "Compile-time polymorphism",
        signature: "class Derived : public Base<Derived> { }",
        descLong: "CRTP achieves polymorphism without virtual function overhead via templates. Base class template parameter is derived class. Enables zero-overhead abstraction. Useful for performance-critical code. Can be confusing; use when virtual call overhead is critical.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of CRTP (Curiously Recurring Template Pattern) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of CRTP (Curiously Recurring Template Pattern) — common patterns you'll see in production.\n// APPROACH  - Combine CRTP (Curiously Recurring Template Pattern) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// CRTP Base class\ntemplate<typename Derived>\nclass Animal {\npublic:\n    void speak() {\n        // Static cast to derived type at compile time\n        static_cast<Derived*>(this)->speak_impl();\n    }\n\nprotected:\n    ~Animal() = default;  // virtual not needed with CRTP\n};\n\nclass Dog : public Animal<Dog> {\npublic:\n    void speak_impl() {\n        std::cout << \"Woof!\\n\";\n    }\n};\n\nclass Cat : public Animal<Cat> {\npublic:\n    void speak_impl() {\n        std::cout << \"Meow!\\n\";\n    }\n};"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of CRTP (Curiously Recurring Template Pattern) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// CRTP for clone pattern,template<typename Derived>,class Cloneable {,public:,    std::unique_ptr<Derived> clone() const {,        return std::make_unique<Derived>(static_cast<const Derived&>(*this));,    },,    virtual ~Cloneable() = default;,};,,class Shape : public Cloneable<Shape> {,public:,    virtual ~Shape() = default;,    virtual void draw() const = 0;,};,,class Circle : public Shape {,public:,    void draw() const override { std::cout << \"Circle\\n\"; },};,,int main() {,    // CRTP usage,    Dog dog;,    Cat cat;,    dog.speak();,    cat.speak();,\n\n    // No virtual function calls!,    // Calls are resolved at compile time,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use CRTP when virtual function overhead is unacceptable.",
                  "CRTP is compile-time polymorphism; no runtime cost.",
                  "Can be confusing; document clearly and use only when necessary."
        ],
        mistake: "Using CRTP for general-purpose polymorphism; virtual functions are usually fine.",
        shorthand: {
          verbose: "#include <iostream>\n#include <string>\n#include <vector>\n\ncla",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
