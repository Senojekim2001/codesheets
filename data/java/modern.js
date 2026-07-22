export const meta = {
  "id": "java-modern",
  "label": "Modern Java (17-21)",
  "icon": "✨",
  "description": "Latest Java features: records, sealed classes, pattern matching, and text blocks."
}

export const sections = [

  // ── Section 1: Records & Sealed Classes ─────────────────────────────────────────
  {
    id: "records-sealed",
    title: "Records & Sealed Classes",
    entries: [
      {
        id: "records-intro",
        fn: "Records (Java 14+)",
        desc: "Immutable data carrier classes with auto-generated methods.",
        category: "Records",
        subtitle: "Minimal data classes",
        signature: "record Name(Type field1, Type field2) { }",
        descLong: "Records eliminate boilerplate for data classes. Automatically generates constructor, getters, equals(), hashCode(), and toString().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Records (Java 14+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class RecordsIntroExample {\n    // Simple record\n    record Point(int x, int y) {\n        // Compact constructor (optional validation)\n        public Point {\n            if (x < 0 || y < 0) {\n                throw new IllegalArgumentException(\"Negative coordinates\");\n            }\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Records (Java 14+) — common patterns you'll see in production.\n// APPROACH  - Combine Records (Java 14+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Can add custom methods\n        double distanceFromOrigin() {\n            return Math.sqrt(x * x + y * y);\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Records (Java 14+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Record with String,    record Person(String name, int age) {,        public boolean isAdult() {,            return age >= 18;,        },,        public String getInfo() {,            return name + \" is \" + age;,        },    },\n\n    // Generic record,    record Pair<T>(T first, T second) {,        public Pair {,            if (first == null || second == null) {,                throw new NullPointerException(\"Pair elements cannot be null\");,            },        },    },,    public static void main(String[] args) {,        // Creating records,        Point p = new Point(3, 4);,        System.out.println(p);,        System.out.println(\"Distance: \" + p.distanceFromOrigin());,,        Person person = new Person(\"Alice\", 30);,        System.out.println(person.getInfo());,        System.out.println(\"Adult: \" + person.isAdult());,,        Pair<String> pair = new Pair<>(\"Hello\", \"World\");,        System.out.println(\"Pair: \" + pair.first() + \", \" + pair.second());,\n\n        // Records are immutable,        System.out.println(\"\\nRecord properties:\");,        System.out.println(\"Name: \" + person.name());,        System.out.println(\"Age: \" + person.age());,    },}"
                  }
        ],
        tips: [
                  "Records are perfect for data transfer objects (DTOs)",
                  "Use compact constructors for validation instead of traditional ones",
                  "Records can implement interfaces but cannot extend classes"
        ],
        mistake: "Trying to mutate record fields (they are automatically final).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "sealed-classes",
        fn: "Sealed Classes (Java 15+)",
        desc: "Restrict which classes can extend or implement a type.",
        category: "Records",
        subtitle: "Controlled inheritance",
        signature: "sealed class Name permits SubclassA, SubclassB { }",
        descLong: "Sealed classes control the class hierarchy by specifying permitted subclasses. Enables exhaustive pattern matching and safer APIs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Sealed Classes (Java 15+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class SealedClassesExample {\n    // Sealed class\n    sealed abstract class Animal permits Dog, Cat, Bird {\n        abstract String sound();\n\n        public void speak() {\n            System.out.println(sound());\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Sealed Classes (Java 15+) — common patterns you'll see in production.\n// APPROACH  - Combine Sealed Classes (Java 15+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Permitted subclass (can be final)\n    final class Dog extends Animal {\n        @Override\n        String sound() {\n            return \"Woof\";\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Sealed Classes (Java 15+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Permitted subclass (can be sealed),    sealed class Cat extends Animal permits PersianCat, SiameseCat {,        @Override,        String sound() {,            return \"Meow\";,        },    },,    final class PersianCat extends Cat {,        @Override,        String sound() {,            return \"Soft Meow\";,        },    },,    final class SiameseCat extends Cat {,        @Override,        String sound() {,            return \"Loud Meow\";,        },    },,    final class Bird extends Animal {,        @Override,        String sound() {,            return \"Tweet\";,        },    },,    public static void main(String[] args) {,        Animal dog = new Dog();,        Animal cat = new Cat() {};  // Need anonymous class since Cat is sealed,        Animal bird = new Bird();,,        dog.speak();,        cat.speak();,        bird.speak();,,        System.out.println(\"\\nSealed class benefits:\");,        System.out.println(\"- Controls inheritance hierarchy\");,        System.out.println(\"- Enables pattern matching to be exhaustive\");,    },}"
                  }
        ],
        tips: [
                  "Use sealed classes to control API surface and prevent misuse",
                  "Combine with records for powerful data-focused designs",
                  "Sealed classes enable exhaustive checking in switch statements"
        ],
        mistake: "Sealing classes without a clear API design reason.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "records-with-sealed",
        fn: "Combining Records & Sealed Classes",
        desc: "Use records and sealed classes together for type-safe hierarchies.",
        category: "Records",
        subtitle: "Type-safe data hierarchies",
        signature: "sealed interface Result permits SuccessResult, ErrorResult { }",
        descLong: "Combining records with sealed classes creates powerful, type-safe discriminated unions. Perfect for functional-style error handling.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Combining Records & Sealed Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class RecordsWithSealedExample {\n    // Sealed interface with record implementations\n    sealed interface Result<T> permits Success, Failure {\n    }\n\n    record Success<T>(T value) implements Result<T> {\n        public void process() {\n            System.out.println(\"Processing success: \" + value);\n        }\n    }\n\n    record Failure<T>(String error, Throwable cause) implements Result<T> {\n        public void handleError() {\n            System.out.println(\"Error: \" + error);\n            if (cause != null) {\n                System.out.println(\"Cause: \" + cause.getMessage());\n            }\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Combining Records & Sealed Classes — common patterns you'll see in production.\n// APPROACH  - Combine Combining Records & Sealed Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Handler that knows about all Result types\n    static <T> void handleResult(Result<T> result) {\n        if (result instanceof Success<T> success) {\n            success.process();\n            System.out.println(\"Value: \" + success.value());\n        } else if (result instanceof Failure<T> failure) {\n            failure.handleError();\n        }\n    }\n\n    public static void main(String[] args) {\n        Result<String> success = new Success<>(\"Operation completed\");\n        Result<String> failure = new Failure<>(\"Network error\", new Exception(\"Connection timeout\"));\n\n        handleResult(success);\n        System.out.println();\n        handleResult(failure);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Combining Records & Sealed Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Type-safe error handling,        System.out.println(\"\\nResult handling:\");,        Result<Integer> compute = new Success<>(42);,        if (compute instanceof Success<Integer> s) {,            System.out.println(\"Computed value: \" + s.value());,        },    },}"
                  }
        ],
        tips: [
                  "Sealed records create type-safe discriminated unions",
                  "Eliminates null checking and instanceof chains in error handling",
                  "Enables compiler to verify all cases are handled in pattern matching"
        ],
        mistake: "Using non-sealed classes when sealed records would be safer.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "record-equals-hashcode",
        fn: "Record equals() and hashCode()",
        desc: "Records auto-generate equals() and hashCode() based on fields.",
        category: "Records",
        subtitle: "Auto-generated equality",
        signature: "record Name(fields) { } // equals/hashCode auto-generated",
        descLong: "Records automatically implement equals() and hashCode() based on all fields, making them suitable for collections and value-based operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Record equals() and hashCode() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.HashSet;\nimport java.util.Set;\n\npublic class RecordEqualsHashCodeExample {\n    record Point(int x, int y) {\n    }\n\n    record Color(String name, int rgb) {\n    }\n\n    public static void main(String[] args) {\n        // Equality - records with same field values are equal\n        Point p1 = new Point(3, 4);\n        Point p2 = new Point(3, 4);\n        Point p3 = new Point(5, 6);\n\n        System.out.println(\"Equality:\");\n        System.out.println(\"p1.equals(p2): \" + p1.equals(p2));  // true\n        System.out.println(\"p1.equals(p3): \" + p1.equals(p3));  // false\n        System.out.println(\"p1 == p2: \" + (p1 == p2));          // false (different objects)"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Record equals() and hashCode() — common patterns you'll see in production.\n// APPROACH  - Combine Record equals() and hashCode() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Hash codes - same fields = same hash\n        System.out.println(\"\\nHash codes:\");\n        System.out.println(\"p1.hashCode(): \" + p1.hashCode());\n        System.out.println(\"p2.hashCode(): \" + p2.hashCode());\n        System.out.println(\"p3.hashCode(): \" + p3.hashCode());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Record equals() and hashCode() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Use in collections - works correctly because of hashCode/equals,        System.out.println(\"\\nIn collections:\");,        Set<Point> points = new HashSet<>();,        points.add(p1);,        points.add(p2);  // Won't be added (equals p1),        points.add(p3);,        System.out.println(\"Set size: \" + points.size());  // 2, not 3,,        Set<Color> colors = new HashSet<>();,        colors.add(new Color(\"Red\", 0xFF0000));,        colors.add(new Color(\"Red\", 0xFF0000));  // Duplicate,        colors.add(new Color(\"Blue\", 0x0000FF));,        System.out.println(\"Colors set size: \" + colors.size());  // 2,\n\n        // toString automatically generated,        System.out.println(\"\\ntoString():\");,        System.out.println(p1);      // Point[x=3, y=4],        System.out.println(p3);      // Point[x=5, y=6],    },}"
                  }
        ],
        tips: [
                  "Records are perfect for using as HashMap/HashSet keys",
                  "equals() compares all fields, so records with same values are equal",
                  "Never override equals/hashCode in records unless you have a good reason"
        ],
        mistake: "Using mutable objects as record fields (records should be immutable).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Pattern Matching ─────────────────────────────────────────
  {
    id: "pattern-matching",
    title: "Pattern Matching",
    entries: [
      {
        id: "pattern-matching-instanceof",
        fn: "Pattern Matching for instanceof",
        desc: "Cast and check type in one operation with pattern variables.",
        category: "Pattern Matching",
        subtitle: "Type patterns",
        signature: "if (obj instanceof TypeName varName) { ... }",
        descLong: "Pattern matching simplifies type checking and casting. No need for separate cast after instanceof check.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Pattern Matching for instanceof — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class PatternMatchingInstanceofExample {\n    static class Animal {\n        String name;\n        Animal(String name) {\n            this.name = name;\n        }\n    }\n\n    static class Dog extends Animal {\n        Dog(String name) {\n            super(name);\n        }\n\n        void bark() {\n            System.out.println(name + \" barks!\");\n        }\n    }\n\n    static class Cat extends Animal {\n        Cat(String name) {\n            super(name);\n        }\n\n        void meow() {\n            System.out.println(name + \" meows!\");\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Pattern Matching for instanceof — common patterns you'll see in production.\n// APPROACH  - Combine Pattern Matching for instanceof with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Old way (Java 15 and earlier)\n    static void handleAnimalOld(Object obj) {\n        if (obj instanceof Dog) {\n            Dog dog = (Dog) obj;  // Separate cast\n            dog.bark();\n        } else if (obj instanceof Cat) {\n            Cat cat = (Cat) obj;  // Separate cast\n            cat.meow();\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Pattern Matching for instanceof — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// New way with pattern matching (Java 16+),    static void handleAnimal(Object obj) {,        if (obj instanceof Dog dog) {  // Pattern with binding,            dog.bark();,        } else if (obj instanceof Cat cat) {  // Pattern with binding,            cat.meow();,        } else if (obj instanceof String str) {,            System.out.println(\"String: \" + str);,        } else {,            System.out.println(\"Unknown type: \" + obj.getClass().getSimpleName());,        },    },\n\n    // With guards (Java 17+),    static void handleWithGuard(Object obj) {,        if (obj instanceof Dog dog && dog.name.length() > 3) {,            System.out.println(\"Long-named dog: \" + dog.name);,        } else if (obj instanceof String str && str.length() > 5) {,            System.out.println(\"Long string: \" + str);,        },    },,    public static void main(String[] args) {,        var animals = new Object[]{,            new Dog(\"Rex\"),,            new Cat(\"Whiskers\"),,            \"Hello\",,            42,        };,,        System.out.println(\"With pattern matching:\");,        for (Object obj : animals) {,            handleAnimal(obj);,        },,        System.out.println(\"\\nWith guards:\");,        handleWithGuard(new Dog(\"Alexander\"));,        handleWithGuard(new Dog(\"Bo\"));,    },}"
                  }
        ],
        tips: [
                  "Pattern variables are automatically bound in the if block",
                  "Guards (&&) can refine patterns for additional filtering",
                  "Much cleaner than separate instanceof and cast operations"
        ],
        mistake: "Still using separate cast after instanceof (old style).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "switch-expressions",
        fn: "Switch Expressions (Java 14+)",
        desc: "Use switch as an expression that returns values.",
        category: "Pattern Matching",
        subtitle: "Expression-based switch",
        signature: "var result = switch (value) { case x -> expr; ... };",
        descLong: "Switch expressions return values, eliminating traditional switch statements. Support arrows for clean syntax and exhaustiveness checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Switch Expressions (Java 14+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class SwitchExpressionsExample {\n    enum Color { RED, GREEN, BLUE, YELLOW }\n\n    public static void main(String[] args) {\n        // Traditional switch statement\n        Color color = Color.BLUE;\n        String description = \"\";\n        switch (color) {\n            case RED:\n                description = \"Stop\";\n                break;\n            case GREEN:\n                description = \"Go\";\n                break;\n            case BLUE:\n                description = \"Info\";\n                break;\n            default:\n                description = \"Unknown\";\n        }\n        System.out.println(\"Old switch: \" + description);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Switch Expressions (Java 14+) — common patterns you'll see in production.\n// APPROACH  - Combine Switch Expressions (Java 14+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Switch expression (Java 14+)\n        String description2 = switch (color) {\n            case RED -> \"Stop\";\n            case GREEN -> \"Go\";\n            case BLUE -> \"Info\";\n            case YELLOW -> \"Caution\";\n        };\n        System.out.println(\"Switch expr: \" + description2);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Switch Expressions (Java 14+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Switch with blocks,        String result = switch (color) {,            case RED -> {,                System.out.println(\"Red traffic light\");,                yield \"Stop signal\";,            },            case GREEN -> {,                System.out.println(\"Green traffic light\");,                yield \"Go signal\";,            },            case BLUE -> \"Blue color\";,            default -> throw new IllegalArgumentException(\"Unknown color\");,        };,        System.out.println(\"Result: \" + result);,\n\n        // Pattern matching in switch (Java 17+),        Object obj = \"Hello\";,        String message = switch (obj) {,            case Integer i -> \"Integer: \" + i;,            case String s && s.length() > 5 -> \"Long string: \" + s;,            case String s -> \"String: \" + s;,            case null -> \"Null value\";,            default -> \"Other\";,        };,        System.out.println(\"Pattern switch: \" + message);,\n\n        // Multiple cases,        int value = 2;,        String dayType = switch (value) {,            case 1, 2, 3, 4, 5 -> \"Weekday\";,            case 6, 7 -> \"Weekend\";,            default -> \"Unknown\";,        };,        System.out.println(\"Day type: \" + dayType);,    },}"
                  }
        ],
        tips: [
                  "Switch expressions are exhaustive - all cases must be covered",
                  "Use yield to return from multi-line blocks in switch expressions",
                  "Pattern matching can be combined with guards for powerful selection"
        ],
        mistake: "Forgetting to handle all cases (switch expressions require exhaustiveness).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
      {
        id: "record-patterns",
        fn: "Record Patterns (Java 21)",
        desc: "Destructure record components in pattern matching.",
        category: "Pattern Matching",
        subtitle: "Record destructuring",
        signature: "if (obj instanceof Point(int x, int y)) { ... }",
        descLong: "Record patterns enable destructuring record components directly in instanceof and switch patterns. Powerful for data-focused code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Record Patterns (Java 21) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class RecordPatternsExample {\n    record Point(int x, int y) {\n    }\n\n    record Circle(Point center, int radius) {\n    }\n\n    record Rectangle(Point topLeft, Point bottomRight) {\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Record Patterns (Java 21) — common patterns you'll see in production.\n// APPROACH  - Combine Record Patterns (Java 21) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Match and destructure points\n    static String describePoint(Object obj) {\n        return switch (obj) {\n            case Point(int x, int y) when x == 0 && y == 0 -> \"Origin\";\n            case Point(int x, int y) when x == y -> \"Diagonal (\" + x + \", \" + y + \")\";\n            case Point(int x, int y) -> \"Point (\" + x + \", \" + y + \")\";\n            default -> \"Not a point\";\n        };\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Record Patterns (Java 21) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Match and destructure circles,    static String describeCircle(Object obj) {,        return switch (obj) {,            case Circle(Point(int x, int y), int r) when r == 0 ->,                \"Degenerate circle at (\" + x + \", \" + y + \")\";,            case Circle(Point(int x, int y), int r) ->,                \"Circle at (\" + x + \", \" + y + \") with radius \" + r;,            default -> \"Not a circle\";,        };,    },\n\n    // Match and destructure rectangles,    static String describeRectangle(Object obj) {,        return switch (obj) {,            case Rectangle(,                Point(int x1, int y1),,                Point(int x2, int y2),            ) when x1 == x2 && y1 == y2 ->,                \"Degenerate rectangle\";,            case Rectangle(,                Point(int x1, int y1),,                Point(int x2, int y2),            ) -> \"Rectangle from (\" + x1 + \",\" + y1 + \") to (\" + x2 + \",\" + y2 + \")\";,            default -> \"Not a rectangle\";,        };,    },,    public static void main(String[] args) {,        // Demonstrate record patterns,        Point origin = new Point(0, 0);,        Point diagonal = new Point(5, 5);,        Point regular = new Point(3, 4);,,        System.out.println(describePoint(origin));,        System.out.println(describePoint(diagonal));,        System.out.println(describePoint(regular));,,        System.out.println(\"\\nCircles:\");,        Circle c1 = new Circle(new Point(5, 5), 10);,        Circle c2 = new Circle(new Point(0, 0), 0);,        System.out.println(describeCircle(c1));,        System.out.println(describeCircle(c2));,,        System.out.println(\"\\nRectangles:\");,        Rectangle r1 = new Rectangle(new Point(0, 0), new Point(10, 10));,        Rectangle r2 = new Rectangle(new Point(5, 5), new Point(5, 5));,        System.out.println(describeRectangle(r1));,        System.out.println(describeRectangle(r2));,    },}"
                  }
        ],
        tips: [
                  "Record patterns enable clean data extraction from nested structures",
                  "Combine with guards for precise matching on destructured values",
                  "Eliminates manual field access and temporary variables"
        ],
        mistake: "Deep nesting of record patterns can reduce readability.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordsIntroExample {\n    // Simple record\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Text Blocks & New APIs ─────────────────────────────────────────
  {
    id: "text-blocks",
    title: "Text Blocks & New APIs",
    entries: [
      {
        id: "text-blocks",
        fn: "Text Blocks (Java 13+)",
        desc: "Multi-line strings with indentation handling.",
        category: "Syntax",
        subtitle: "Multi-line string literals",
        signature: "\"\"\"multi-line string\"\"\"",
        descLong: "Text blocks simplify multi-line strings like JSON, SQL, or HTML without escaping quotes. Automatically handles indentation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Text Blocks (Java 13+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class TextBlocksExample {\n    public static void main(String[] args) {\n        // Old way - concat with \\n\n        String oldJson = \"{\" +\n            \"\\n  \\\"name\\\": \\\"Alice\\\",\" +\n            \"\\n  \\\"age\\\": 30\" +\n            \"\\n}\";\n        System.out.println(\"Old way:\");\n        System.out.println(oldJson);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Text Blocks (Java 13+) — common patterns you'll see in production.\n// APPROACH  - Combine Text Blocks (Java 13+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Text block (Java 13+)\n        String json = \"\"\"\n            {\n              \"name\": \"Alice\",\n              \"age\": 30\n            }\n            \"\"\";\n        System.out.println(\"\\nText block:\");\n        System.out.println(json);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Text Blocks (Java 13+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// SQL query,        String sql = \"\"\",            SELECT id, name, email,            FROM users,            WHERE age > 18,            ORDER BY name,            \"\"\";,        System.out.println(\"SQL:\");,        System.out.println(sql);,\n\n        // HTML,        String html = \"\"\",            <!DOCTYPE html>,            <html>,              <head><title>Example</title></head>,              <body>,                <h1>Hello, World!</h1>,              </body>,            </html>,            \"\"\";,        System.out.println(\"HTML:\");,        System.out.println(html);,\n\n        // With interpolation (formatted),        String name = \"Bob\";,        int age = 25;,        String formatted = \"\"\",            Name: %s,            Age: %d,            \"\"\".formatted(name, age);,        System.out.println(\"Formatted:\");,        System.out.println(formatted);,    },}"
                  }
        ],
        tips: [
                  "Text blocks handle indentation automatically",
                  "No need to escape quotes inside text blocks",
                  "Use .formatted() for variable interpolation (or %s, %d placeholders)"
        ],
        mistake: "Using \\ n in text blocks (unnecessary, use actual newlines).",
        shorthand: {
          verbose: "public class TextBlocksExample {\n    public static void main(String[] args) {\n        // Old way - c",
          concise: "// see verbose",
        },
      },
      {
        id: "new-string-methods",
        fn: "New String Methods (Java 11+)",
        desc: "Useful string methods added in modern Java.",
        category: "APIs",
        subtitle: "Enhanced string utilities",
        signature: "isBlank(), strip(), repeat(), indent()",
        descLong: "Modern Java adds string methods for common operations: isBlank() for null/whitespace checks, strip() for whitespace removal, repeat() for repetition.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of New String Methods (Java 11+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class NewStringMethodsExample {\n    public static void main(String[] args) {\n        // isBlank() - true if empty or whitespace\n        System.out.println(\"isBlank():\");\n        System.out.println(\"\\\"  \\\".isBlank(): \" + \"  \".isBlank());      // true\n        System.out.println(\"\\\"\\\".isBlank(): \" + \"\".isBlank());        // true\n        System.out.println(\"\\\"Hello\\\".isBlank(): \" + \"Hello\".isBlank());   // false"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of New String Methods (Java 11+) — common patterns you'll see in production.\n// APPROACH  - Combine New String Methods (Java 11+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// isEmpty() - true if empty\n        System.out.println(\"\\nempty():\");\n        System.out.println(\"\\\"\\\".isEmpty(): \" + \"\".isEmpty());        // true\n        System.out.println(\"\\\" \\\".isEmpty(): \" + \" \".isEmpty());       // false"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of New String Methods (Java 11+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// strip() - remove leading/trailing whitespace,        System.out.println(\"\\nstrip():\");,        String padded = \"  hello world  \";,        System.out.println(\"Original: \\\" + padded + \"\\\"\");,        System.out.println(\"After strip: \\\" + padded.strip() + \"\\\"\");,        System.out.println(\"After trim: \\\" + padded.trim() + \"\\\"\");,\n\n        // repeat() - repeat string n times,        System.out.println(\"\\nrepeat():\");,        System.out.println(\"\\\"abc\\\".repeat(3): \" + \"abc\".repeat(3));,        System.out.println(\"\\\"*\\\".repeat(10): \" + \"*\".repeat(10));,\n\n        // lines() - split by newlines,        System.out.println(\"\\nlines():\");,        String multiline = \"Line 1\\nLine 2\\nLine 3\";,        multiline.lines().forEach(line -> System.out.println(\"  \" + line));,\n\n        // startsWith/endsWith variations,        System.out.println(\"\\nstartsWith/endsWith:\");,        System.out.println(\"\\\"hello.txt\\\".endsWith(\\\".txt\\\"): \" + \"hello.txt\".endsWith(\".txt\"));,        System.out.println(\"\\\"api/v1/users\\\".startsWith(\\\"api\\\"): \" + \"api/v1/users\".startsWith(\"api\"));,\n\n        // indent() - add indentation,        System.out.println(\"\\nindent():\");,        String code = \"int x = 5;\\nint y = 10;\";,        String indented = code.indent(2);,        System.out.println(\"Indented:\");,        System.out.println(indented);,\n\n        // translateEscapes() - process escape sequences,        System.out.println(\"\\ntranslateEscapes():\");,        String escaped = \"Hello\\\\nWorld\";,        System.out.println(\"Escaped: \" + escaped);,        System.out.println(\"Unescaped: \" + escaped.translateEscapes());,    },}"
                  }
        ],
        tips: [
                  "Use isBlank() instead of isEmpty() when whitespace matters",
                  "repeat() is cleaner than loops or StringBuilder for repetition",
                  "lines() is useful for processing multi-line strings"
        ],
        mistake: "Using isEmpty() when isBlank() would be more appropriate.",
        shorthand: {
          verbose: "public class NewStringMethodsExample {\n    public static void main(String[] args) {\n        // isBla",
          concise: "// see verbose",
        },
      },
      {
        id: "sequenced-collections",
        fn: "SequencedCollections (Java 21)",
        desc: "New interface for collections with encounter order.",
        category: "APIs",
        subtitle: "Ordered collection types",
        signature: "SequencedCollection, SequencedSet, SequencedMap",
        descLong: "SequencedCollections define operations for collections with encounter order: first/last elements, reversed iteration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of SequencedCollections (Java 21) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.ArrayList;\nimport java.util.LinkedHashMap;\nimport java.util.List;\nimport java.util.SequencedCollection;\nimport java.util.SequencedMap;\n\npublic class SequencedCollectionsExample {\n    public static void main(String[] args) {\n        // SequencedCollection provides first() and last()\n        System.out.println(\"SequencedCollection:\");\n        List<Integer> numbers = new ArrayList<>();\n        for (int i = 1; i <= 5; i++) {\n            numbers.add(i);\n        }\n\n        System.out.println(\"Numbers: \" + numbers);\n        System.out.println(\"First: \" + numbers.getFirst());  // 1\n        System.out.println(\"Last: \" + numbers.getLast());    // 5"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of SequencedCollections (Java 21) — common patterns you'll see in production.\n// APPROACH  - Combine SequencedCollections (Java 21) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// reversed() - iterate in reverse order\n        System.out.println(\"\\nReversed iteration:\");\n        for (int n : numbers.reversed()) {\n            System.out.print(n + \" \");\n        }\n        System.out.println();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of SequencedCollections (Java 21) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Remove first/last,        System.out.println(\"\\nRemove operations:\");,        List<String> words = new ArrayList<>(List.of(\"Apple\", \"Banana\", \"Cherry\"));,        System.out.println(\"Original: \" + words);,        words.removeFirst();,        System.out.println(\"After removeFirst: \" + words);,        words.removeLast();,        System.out.println(\"After removeLast: \" + words);,\n\n        // SequencedMap,        System.out.println(\"\\nSequencedMap:\");,        SequencedMap<String, Integer> scores = new LinkedHashMap<>();,        scores.put(\"Alice\", 95);,        scores.put(\"Bob\", 87);,        scores.put(\"Charlie\", 92);,,        System.out.println(\"Scores: \" + scores);,        System.out.println(\"First entry: \" + scores.firstEntry());,        System.out.println(\"Last entry: \" + scores.lastEntry());,,        System.out.println(\"\\nReversed map:\");,        for (var entry : scores.reversed().entrySet()) {,            System.out.println(\"  \" + entry.getKey() + \": \" + entry.getValue());,        },    },}"
                  }
        ],
        tips: [
                  "SequencedCollections provide convenient first/last access",
                  "reversed() allows efficient reverse iteration",
                  "Replaces manual reverse operations and index calculations"
        ],
        mistake: "Using get(0) and get(size-1) when getFirst() and getLast() are available.",
        shorthand: {
          verbose: "import java.util.ArrayList;\nimport java.util.LinkedHashMap;\nimport java.util.List;\nimport java.util.",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Miscellaneous Modern Features ─────────────────────────────────────────
  {
    id: "misc-modern",
    title: "Miscellaneous Modern Features",
    entries: [
      {
        id: "unnamed-patterns",
        fn: "Unnamed Patterns (Java 21)",
        desc: "Use underscore for ignored variables in patterns.",
        category: "Syntax",
        subtitle: "Pattern ignoring",
        signature: "case Point(_, int y) -> ... // ignore x",
        descLong: "Unnamed patterns using _ allow matching without binding unused variables. Cleaner code when you only care about some fields.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Unnamed Patterns (Java 21) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class UnnamedPatternsExample {\n    record Point(int x, int y) {\n    }\n\n    record Circle(Point center, int radius) {\n    }\n\n    record Person(String name, int age, String email) {\n    }\n\n    public static void main(String[] args) {\n        // Ignore components in record patterns\n        Object obj = new Point(5, 10);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Unnamed Patterns (Java 21) — common patterns you'll see in production.\n// APPROACH  - Combine Unnamed Patterns (Java 21) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Old way - bind unused variable\n        if (obj instanceof Point(int x, int y)) {\n            System.out.println(\"Point with y=\" + y);\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Unnamed Patterns (Java 21) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// New way - ignore x with underscore,        if (obj instanceof Point(int _, int y)) {,            System.out.println(\"Point with y=\" + y);,        },\n\n        // Nested record patterns with ignoring,        Object circle = new Circle(new Point(0, 0), 5);,        if (circle instanceof Circle(Point(int _, int _), int r)) {,            System.out.println(\"Circle with radius \" + r);,        },\n\n        // Switch with unnamed patterns,        System.out.println(\"\\nSwitch with unnamed patterns:\");,        Object person = new Person(\"Alice\", 30, \"alice@example.com\");,,        String message = switch (person) {,            case Person(String name, int _, String _) ->,                \"Person named \" + name;,            case Point(int _, int y) ->,                \"Point with y=\" + y;,            case _ ->  // catch-all pattern (Java 21),                \"Unknown\";,        };,        System.out.println(message);,\n\n        // Arrays with ignored elements,        System.out.println(\"\\nIgnoring array elements:\");,        Object obj2 = new int[]{1, 2, 3};,    },}"
                  }
        ],
        tips: [
                  "Use _ to improve readability when variables are not used",
                  "Prevents compiler warnings about unused variables",
                  "Works in lambda parameters and other pattern contexts"
        ],
        mistake: "Binding variables you don't use (less readable).",
        shorthand: {
          verbose: "if (obj instanceof Point(int x, int y)) {\n    System.out.println(y);\n    // x unused!\n}",
          concise: "if (obj instanceof Point(int _, int y)) {\n    System.out.println(y);\n}  // Clearly shows x is ignored",
        },
      },
      {
        id: "instanceof-null",
        fn: "null Handling in Pattern Matching",
        desc: "Pattern matching simplifies null checking with explicit null patterns.",
        category: "Syntax",
        subtitle: "Null-safe patterns",
        signature: "case null -> ... or case _ when condition -> ...",
        descLong: "Modern pattern matching includes explicit null patterns, eliminating null checks and making null handling intentional.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of null Handling in Pattern Matching — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Optional;\n\npublic class NullPatternsExample {\n    static String describe(Object obj) {\n        return switch (obj) {\n            case null -> \"Null value\";\n            case String s -> \"String: \" + s;\n            case Integer i -> \"Integer: \" + i;\n            case _ -> \"Other\";\n        };\n    }\n\n    static String safeDescript(Object obj) {\n        // Explicit null handling\n        if (obj == null) {\n            return \"Null\";\n        }\n\n        if (obj instanceof String s) {\n            return \"String: \" + s;\n        }\n\n        if (obj instanceof Integer i) {\n            return \"Integer: \" + i;\n        }\n\n        return \"Other\";\n    }\n\n    public static void main(String[] args) {\n        System.out.println(describe(null));           // Null value\n        System.out.println(describe(\"Hello\"));        // String: Hello\n        System.out.println(describe(42));             // Integer: 42\n        System.out.println(describe(3.14));           // Other"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of null Handling in Pattern Matching — common patterns you'll see in production.\n// APPROACH  - Combine null Handling in Pattern Matching with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// With guards for null checks\n        Object value = null;\n        String result = switch (value) {\n            case String s && !s.isBlank() -> \"Non-empty string\";\n            case String s -> \"Empty or whitespace string\";\n            case null -> \"Null value\";\n            case _ -> \"Other\";\n        };\n        System.out.println(\"Result: \" + result);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of null Handling in Pattern Matching — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Safe unwrapping,        Optional<String> optional = Optional.of(\"test\");,        String unwrapped = switch (optional) {,            case Optional.empty() -> \"Empty\";,            case Optional<?> opt -> \"Value: \" + opt.get();,            default -> \"Unknown\";,        };,        System.out.println(unwrapped);,    },}"
                  }
        ],
        tips: [
                  "Explicit null patterns make null handling intentional",
                  "Eliminates NullPointerException surprises",
                  "Cleaner than separate null checks before instanceof"
        ],
        mistake: "Assuming patterns handle null without explicit case null.",
        shorthand: {
          verbose: "import java.util.Optional;\n\npublic class NullPatternsExample {\n    static String describe(Object obj",
          concise: "// see verbose",
        },
      },
      {
        id: "foreign-function-interface",
        fn: "Foreign Function & Memory API (Preview)",
        desc: "Safely call native code and manage off-heap memory.",
        category: "Advanced",
        subtitle: "Native interop",
        signature: "Linker, SymbolLookup, Arena, MemorySegment",
        descLong: "FFM API (Java 19+) replaces JNI for calling native functions and managing off-heap memory safely. Requires --enable-preview.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Foreign Function & Memory API (Preview) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// Foreign Function & Memory API (simplified example)\n// Note: This requires --enable-preview flag and Java 21+\n\npublic class ForeignFunctionExample {\n    // This is a demonstration of the API structure\n    // Actual compilation requires: javac --enable-preview --source 21 *.java\n\n    public static void main(String[] args) {\n        System.out.println(\"Foreign Function & Memory API Overview:\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Foreign Function & Memory API (Preview) — common patterns you'll see in production.\n// APPROACH  - Combine Foreign Function & Memory API (Preview) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nSystem.out.println(\"- Safely call native C/C++ functions\");\n        System.out.println(\"- Access and manage native memory\");\n        System.out.println(\"- Replace JNI (Java Native Interface)\");\n        System.out.println();\n        System.out.println(\"Key concepts:\");\n        System.out.println(\"- Arena: managed memory allocation\");\n        System.out.println(\"- MemorySegment: view into memory\");\n        System.out.println(\"- Linker: call native functions\");\n        System.out.println(\"- ValueLayout: native data layout\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Foreign Function & Memory API (Preview) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println();\n        System.out.println(\"Example use cases:\");\n        System.out.println(\"- Call C library functions\");\n        System.out.println(\"- Efficient memory manipulation\");\n        System.out.println(\"- Zero-copy interop with native code\");\n    }\n}"
                  }
        ],
        tips: [
                  "FFM API is the modern replacement for JNI",
                  "Safer and more efficient than JNI for native interop",
                  "Still in preview; API may change"
        ],
        mistake: "Using JNI for new projects when FFM API is available.",
        shorthand: {
          verbose: "// Manual / verbose approach\n// Foreign Function & Memory API (simplified example)\n// Note: This requires --enable-preview flag a\n// More explicit but longer",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
