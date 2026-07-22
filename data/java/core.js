export const meta = {
  "id": "java-core",
  "label": "Core Syntax & OOP",
  "icon": "☕",
  "description": "Essential Java syntax, variables, control flow, OOP principles, and collections."
}

export const sections = [

  // ── Section 1: Variables & Types ─────────────────────────────────────────
  {
    id: "variables-types",
    title: "Variables & Types",
    entries: [
      {
        id: "var-keyword",
        fn: "Local Variable Type Inference (var)",
        desc: "Use var keyword to let compiler infer variable type.",
        category: "Variables",
        subtitle: "Type inference with var",
        signature: "var name = value;",
        descLong: "Java 10+ feature that infers local variable types at compile time, reducing boilerplate while maintaining type safety and readability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Local Variable Type Inference (var) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class VarExample {\n    public static void main(String[] args) {\n        var name = \"Alice\";\n        var age = 25;\n        var list = new ArrayList<String>();\n        list.add(\"Java\");\n        list.add(\"Kotlin\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Local Variable Type Inference (var) — common patterns you'll see in production.\n// APPROACH  - Combine Local Variable Type Inference (var) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Local Variable Type Inference (var) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println(\"Name: \" + name);\n        System.out.println(\"Age: \" + age);\n        System.out.println(\"List: \" + list);\n    }\n}"
                  }
        ],
        tips: [
                  "Use var to reduce verbosity while maintaining clarity in modern Java",
                  "var works only with local variables, not fields or method parameters",
                  "The compiler infers the most specific type, use explicit types when needed for clarity"
        ],
        mistake: "Using var without initializer (var name;) or expecting var to work in field declarations.",
        shorthand: {
          verbose: "ArrayList<String> list = new ArrayList<String>();\nlist.add(\"Java\");\nlist.add(\"Kotlin\");",
          concise: "var list = List.of(\"Java\", \"Kotlin\");",
        },
      },
      {
        id: "system-out-print",
        fn: "System.out — Console Output",
        desc: "Print to stdout using println, print, and printf.",
        category: "I/O",
        subtitle: "System.out.println, print, printf, System.err",
        signature: "System.out.println(val)  |  System.out.printf(\"%s %d%n\", str, n)",
        descLong: "Java console output goes through System.out (a PrintStream). println appends a newline; print does not; printf uses C-style format specifiers. System.err writes to stderr. For production logging, use SLF4J/Logback instead of System.out.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of System.out — Console Output — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n// ── Basic output ─────────────────────────────────────\nSystem.out.println(\"Hello, World!\");    // with newline\nSystem.out.print(\"loading...\");         // no newline\nSystem.out.println();                   // blank line"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of System.out — Console Output — common patterns you'll see in production.\n// APPROACH  - Combine System.out — Console Output with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Multiple values (string concatenation) ────────────\nString name = \"Alice\";\nint score = 95;\nSystem.out.println(\"Name: \" + name + \", Score: \" + score);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of System.out — Console Output — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── printf — formatted output ─────────────────────────,// %s=string  %d=integer  %f=float  %n=newline (portable),System.out.printf(\"Name: %s%n\", name);,System.out.printf(\"Score: %d / 100%n\", score);,System.out.printf(\"Pi: %.4f%n\", Math.PI);          // Pi: 3.1416,System.out.printf(\"%-10s %5d%n\", name, score);     // left-align, pad,\n\n// ── String.format — build formatted string ────────────,String msg = String.format(\"Hello, %s! You scored %d%%.\", name, score);,System.out.println(msg);  // Hello, Alice! You scored 95%.,\n\n// ── Formatted strings — Java 15+ text blocks ─────────,String json = \"\"\",    {,        \"name\": \"%s\",,        \"score\": %d,    },    \"\"\".formatted(name, score);,System.out.println(json);,\n\n// ── stderr — write errors separately ─────────────────,System.err.println(\"Warning: value out of range\");  // goes to stderr,\n\n// ── Printing arrays and collections ───────────────────,int[] nums = {1, 2, 3};,System.out.println(nums);                       // [I@hashcode — not useful!,System.out.println(java.util.Arrays.toString(nums));  // [1, 2, 3],,java.util.List<String> list = java.util.List.of(\"a\", \"b\", \"c\");,System.out.println(list);                       // [a, b, c] — works for collections"
                  }
        ],
        tips: [
                  "printf uses %n (not \\n) for newlines — %n is platform-independent (\\n is always LF).",
                  "String.format() is printf without printing — useful for building strings to pass elsewhere.",
                  "System.out.println(array) prints a useless address. Use Arrays.toString(array) or Arrays.deepToString() for nested arrays.",
                  "In production, replace System.out with SLF4J: logger.info(\"msg\") — gives you log levels, timestamps, and zero-cost disabled logs."
        ],
        mistake: "String concatenation in printf: System.out.printf(\"val=\" + x) — defeats the purpose of printf and won't benefit from format optimizations. Pass x as an argument: System.out.printf(\"val=%d%n\", x).",
        shorthand: {
          verbose: "// Manual / verbose approach\nString.format(\"Hello %s, you are %d years old\", name, age)\n// More explicit but longer",
          concise: "// Java 15+ — text block with .formatted()\n\"Hello %s, you are %d years old\".formatted(name, age)",
        },
      },
      {
        id: "primitives-vs-wrappers",
        fn: "Primitives vs Wrapper Classes",
        desc: "Understand performance and memory differences between primitives and boxed types.",
        category: "Variables",
        subtitle: "Boxing and unboxing",
        signature: "int vs Integer, double vs Double",
        descLong: "Primitive types (int, double, boolean) are stack-allocated for performance, while wrapper classes (Integer, Double, Boolean) are heap-allocated objects supporting null and collections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Primitives vs Wrapper Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class PrimitiveVsWrapper {\n    public static void main(String[] args) {\n        // Primitives - fast, no null\n        int primitiveInt = 42;\n        double primitiveDouble = 3.14;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Primitives vs Wrapper Classes — common patterns you'll see in production.\n// APPROACH  - Combine Primitives vs Wrapper Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Wrappers - objects, nullable, collection-compatible\n        Integer wrappedInt = 42;           // Auto-boxing\n        Double wrappedDouble = 3.14;\n        Integer nullableInt = null;\n\n        List<Integer> numbers = new ArrayList<>();\n        numbers.add(primitiveInt);         // Auto-boxing\n        numbers.add(wrappedInt);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Primitives vs Wrapper Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println(\"Primitive: \" + primitiveInt);\n        System.out.println(\"Wrapper: \" + wrappedInt);\n        System.out.println(\"List size: \" + numbers.size());\n    }\n}"
                  }
        ],
        tips: [
                  "Use primitives for performance-critical loops and numerically intensive code",
                  "Use wrappers when null is needed or collections require objects",
                  "Be aware of auto-boxing overhead in tight loops"
        ],
        mistake: "Using Integer == Integer comparison instead of .equals(), which can fail due to caching.",
        shorthand: {
          verbose: "// Manual / verbose approach\nint prim = 42;\nInteger wrap = prim;  // boxing\n// More explicit but longer",
          concise: "int prim = 42;\nInteger wrap = prim;",
        },
      },
      {
        id: "string-immutability",
        fn: "String Immutability",
        desc: "Strings are immutable; operations create new String objects.",
        category: "Variables",
        subtitle: "Understanding string behavior",
        signature: "String str = \"value\";",
        descLong: "Strings in Java are immutable, meaning once created, their content cannot be changed. Every operation that appears to modify a string creates a new String object.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of String Immutability — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class StringImmutability {\n    public static void main(String[] args) {\n        String original = \"Hello\";\n        String modified = original + \" World\";\n\n        System.out.println(\"Original: \" + original);  // Still \"Hello\"\n        System.out.println(\"Modified: \" + modified);   // \"Hello World\""
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of String Immutability — common patterns you'll see in production.\n// APPROACH  - Combine String Immutability with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nString str1 = \"Java\";\n        String str2 = \"Java\";\n        System.out.println(\"Same reference: \" + (str1 == str2));  // true (string pool)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of String Immutability — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nString str3 = new String(\"Java\");\n        System.out.println(\"Different object: \" + (str1 == str3)); // false\n        System.out.println(\"Equal content: \" + (str1.equals(str3))); // true\n    }\n}"
                  }
        ],
        tips: [
                  "Use StringBuilder for concatenating many strings in loops for performance",
                  "String objects are cached in a pool, so identical literals share references",
                  "Immutability makes strings safe for multi-threading and as HashMap keys"
        ],
        mistake: "Using string concatenation in loops (str = str + item) instead of StringBuilder.",
        shorthand: {
          verbose: "// Manual / verbose approach\nString s = \"x\";\nfor(int i=0;i<5;i++) s += \"y\";\n// More explicit but longer",
          concise: "StringBuilder sb = new StringBuilder(\"x\");\nfor(int i=0;i<5;i++) sb.append(\"y\");",
        },
      },
      {
        id: "final-keyword",
        fn: "final Keyword",
        desc: "Prevent reassignment of variables and modification of classes/methods.",
        category: "Variables",
        subtitle: "Immutability and security",
        signature: "final Type name = value;",
        descLong: "final prevents reassignment of variables, overriding of methods, and extension of classes. Applied to variables, methods, or classes respectively.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of final Keyword — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class FinalExample {\n    private final String name = \"Alice\";\n    private final int age = 30;\n\n    public static void main(String[] args) {\n        final String greeting = \"Hello\";\n        final int count = 42;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of final Keyword — common patterns you'll see in production.\n// APPROACH  - Combine final Keyword with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nSystem.out.println(\"Greeting: \" + greeting);\n        System.out.println(\"Count: \" + count);\n\n        final List<String> items = new ArrayList<>();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of final Keyword — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nitems.add(\"A\");\n        items.add(\"B\");\n        System.out.println(\"Items: \" + items);\n    }\n}"
                  }
        ],
        tips: [
                  "final variables must be initialized at declaration or in constructor",
                  "final on objects prevents reassignment, not modification of the object itself",
                  "Use final parameters to make code intent clear and enable compiler optimizations"
        ],
        mistake: "Thinking final on a List prevents adding elements (it prevents reassignment only).",
        shorthand: {
          verbose: "// Manual / verbose approach\nprivate final String name = \"Alice\";\nfinal List<String> items = new ArrayList<>();\n// More explicit but longer",
          concise: "final String name = \"Alice\";\nfinal List<String> items;",
        },
      },
      {
        id: "enums",
        fn: "Enumerations (Enums)",
        desc: "Define a fixed set of constants as an enumeration type.",
        category: "Variables",
        subtitle: "Type-safe constants",
        signature: "enum Name { VALUE1, VALUE2, ... }",
        descLong: "Enums provide type-safe constants, replacing string/int-based flags with proper types. Each enum constant is a singleton instance of the enum class.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Enumerations (Enums) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class EnumExample {\n    enum Color {\n        RED, GREEN, BLUE\n    }\n\n    enum Size {\n        SMALL(1), MEDIUM(2), LARGE(3);\n\n        private final int pixels;\n        Size(int pixels) {\n            this.pixels = pixels;\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Enumerations (Enums) — common patterns you'll see in production.\n// APPROACH  - Combine Enumerations (Enums) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic int getPixels() {\n            return pixels;\n        }\n    }\n\n    public static void main(String[] args) {\n        Color color = Color.RED;\n        Size size = Size.LARGE;\n\n        System.out.println(\"Color: \" + color);\n        System.out.println(\"Size: \" + size + \" (\" + size.getPixels() + \"px)\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Enumerations (Enums) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfor (Color c : Color.values()) {\n            System.out.println(\"Available: \" + c);\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Enums are singletons - there is exactly one instance of each constant",
                  "Compare enum values with == for efficiency, not .equals()",
                  "Enums can have constructors, fields, and methods for rich behavior"
        ],
        mistake: "Comparing enum values with strings instead of using the enum type directly.",
        shorthand: {
          verbose: "// Manual / verbose approach\nif(c==Color.RED){} else if(c==Color.BLUE){}\n// More explicit but longer",
          concise: "switch(c) { case RED -> {}; case BLUE -> {}; }",
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
        id: "if-statement",
        fn: "if-else Statement",
        desc: "Conditional execution based on boolean expressions.",
        category: "Control Flow",
        subtitle: "Branching logic",
        signature: "if (condition) { ... } else { ... }",
        descLong: "if-else statements execute different code blocks based on boolean conditions. Use for simple conditional logic with clear binary paths.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of if-else Statement — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class IfStatement {\n    public static void main(String[] args) {\n        int age = 18;\n        String status;\n\n        if (age < 13) {\n            status = \"Child\";\n        } else if (age < 18) {\n            status = \"Teen\";\n        } else if (age < 65) {\n            status = \"Adult\";\n        } else {\n            status = \"Senior\";\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of if-else Statement — common patterns you'll see in production.\n// APPROACH  - Combine if-else Statement with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\nSystem.out.println(\"Age: \" + age + \", Status: \" + status);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of if-else Statement — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nboolean isWeekend = true;\n        if (isWeekend) {\n            System.out.println(\"Time to relax!\");\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Use if-else-if chains for multiple mutually exclusive conditions",
                  "Keep conditions simple and readable; extract complex logic to helper methods",
                  "Consider switch statements for many discrete value checks"
        ],
        mistake: "Using = (assignment) instead of == (comparison) in the condition.",
        shorthand: {
          verbose: "if(age<13) s=\"Child\";\nelse if(age<18) s=\"Teen\";\nelse s=\"Adult\";",
          concise: "String s = age<13 ? \"Child\" : age<18 ? \"Teen\" : \"Adult\";",
        },
      },
      {
        id: "switch-statement",
        fn: "switch Statement",
        desc: "Select one of many code blocks to execute based on discrete values.",
        category: "Control Flow",
        subtitle: "Multi-way branching",
        signature: "switch (value) { case x: ... break; default: ... }",
        descLong: "switch statements efficiently match a value against multiple cases. Modern Java (14+) supports switch expressions returning values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of switch Statement — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class SwitchExample {\n    enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }\n\n    public static void main(String[] args) {\n        Day day = Day.FRIDAY;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of switch Statement — common patterns you'll see in production.\n// APPROACH  - Combine switch Statement with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Traditional switch statement\n        String dayType;\n        switch (day) {\n            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY:\n                dayType = \"Weekday\";\n                break;\n            case SATURDAY, SUNDAY:\n                dayType = \"Weekend\";\n                break;\n            default:\n                dayType = \"Unknown\";\n        }\n\n        System.out.println(\"Day: \" + day + \" -> \" + dayType);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of switch Statement — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Switch expression (Java 14+),        String feeling = switch (day) {,            case MONDAY -> \"Monday blues\";,            case FRIDAY -> \"Friday vibes\";,            case SATURDAY, SUNDAY -> \"Weekend joy\";,            default -> \"Regular day\";,        };,        System.out.println(\"Feeling: \" + feeling);,    },}"
                  }
        ],
        tips: [
                  "Use switch expressions (Java 14+) to return values directly",
                  "switch works with primitives, strings, and enums",
                  "Remember break statements to prevent fall-through in traditional switch"
        ],
        mistake: "Forgetting break statements, causing unintended fall-through to next cases.",
        shorthand: {
          verbose: "String r;\nswitch(day){\n  case MONDAY: r=\"Start\"; break;\n  default: r=\"Other\";\n}",
          concise: "String r = switch(day) { case MONDAY -> \"Start\"; default -> \"Other\"; };",
        },
      },
      {
        id: "for-loop",
        fn: "for Loop",
        desc: "Repeat code block a fixed number of times or iterate over collections.",
        category: "Control Flow",
        subtitle: "Iteration with index control",
        signature: "for (init; condition; update) { ... }",
        descLong: "Traditional for loops control iteration with an index. Enhanced for loops iterate over arrays and iterables. Use for-each when you don't need the index.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of for Loop — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n\npublic class ForLoop {\n    public static void main(String[] args) {\n        // Traditional for loop\n        System.out.println(\"Traditional for loop:\");\n        for (int i = 0; i < 5; i++) {\n            System.out.println(\"Count: \" + i);\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of for Loop — common patterns you'll see in production.\n// APPROACH  - Combine for Loop with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Enhanced for loop (for-each)\n        System.out.println(\"\\nEnhanced for loop:\");\n        String[] colors = {\"Red\", \"Green\", \"Blue\"};\n        for (String color : colors) {\n            System.out.println(\"Color: \" + color);\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of for Loop — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Iterating over List,        var numbers = List.of(10, 20, 30, 40, 50);,        System.out.println(\"\\nList iteration:\");,        for (int num : numbers) {,            System.out.println(\"Number: \" + num);,        },    },}"
                  }
        ],
        tips: [
                  "Use enhanced for loops (for-each) when you don't need the index",
                  "Traditional for loops are useful when you need index control or skipping values",
                  "Prefer for-each for readability; it works with any Iterable"
        ],
        mistake: "Modifying loop variable in enhanced for loop to skip elements (doesn't work).",
        shorthand: {
          verbose: "for (String item : items) {\n    item = processItem(item);  // doesn't affect items\n}",
          concise: "for (int i = 0; i < items.size(); i++) {\n    items.set(i, processItem(items.get(i)));  // use traditional loop for modification",
        },
      },
      {
        id: "while-loop",
        fn: "while and do-while Loops",
        desc: "Repeat code block while a condition remains true.",
        category: "Control Flow",
        subtitle: "Conditional iteration",
        signature: "while (condition) { ... } or do { ... } while (condition);",
        descLong: "while loops execute as long as the condition is true, checked at entry. do-while checks the condition at exit, guaranteeing at least one execution.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of while and do-while Loops — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class WhileLoop {\n    public static void main(String[] args) {\n        // while loop\n        System.out.println(\"While loop:\");\n        int count = 0;\n        while (count < 3) {\n            System.out.println(\"Count: \" + count);\n            count++;\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of while and do-while Loops — common patterns you'll see in production.\n// APPROACH  - Combine while and do-while Loops with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// do-while loop (executes at least once)\n        System.out.println(\"\\nDo-while loop:\");\n        int num = 0;\n        do {\n            System.out.println(\"Number: \" + num);\n            num++;\n        } while (num < 3);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of while and do-while Loops — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Example: user input simulation,        System.out.println(\"\\nSimulated input loop:\");,        var buffer = new StringBuilder();,        int chars = 0;,        while (chars < 5) {,            buffer.append(\"*\");,            chars++;,        },        System.out.println(\"Buffer: \" + buffer);,    },}"
                  }
        ],
        tips: [
                  "Use while loops when iteration count is unknown",
                  "Use do-while for input validation loops that must run at least once",
                  "Ensure the condition eventually becomes false to avoid infinite loops"
        ],
        mistake: "Infinite loop from condition that never becomes false.",
        shorthand: {
          verbose: "while(condition) {\n  action();\n  condition = check();\n}",
          concise: "while(condition) action();",
        },
      },
      {
        id: "break-continue",
        fn: "break and continue Statements",
        desc: "Control loop flow by exiting or skipping iterations.",
        category: "Control Flow",
        subtitle: "Loop control",
        signature: "break; or continue;",
        descLong: "break exits the current loop entirely. continue skips to the next iteration. Both can use labels to target outer loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of break and continue Statements — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class BreakContinue {\n    public static void main(String[] args) {\n        // break example\n        System.out.println(\"Break example:\");\n        for (int i = 0; i < 10; i++) {\n            if (i == 5) {\n                System.out.println(\"Breaking at \" + i);\n                break;\n            }\n            System.out.println(\"i = \" + i);\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of break and continue Statements — common patterns you'll see in production.\n// APPROACH  - Combine break and continue Statements with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// continue example\n        System.out.println(\"\\nContinue example:\");\n        for (int i = 0; i < 5; i++) {\n            if (i == 2) {\n                System.out.println(\"Skipping \" + i);\n                continue;\n            }\n            System.out.println(\"Processing \" + i);\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of break and continue Statements — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Labeled break,        System.out.println(\"\\nLabeled break:\");,        outer: for (int x = 0; x < 3; x++) {,            for (int y = 0; y < 3; y++) {,                if (x == 1 && y == 1) {,                    System.out.println(\"Breaking outer loop at (\" + x + \",\" + y + \")\");,                    break outer;,                },            },        },    },}"
                  }
        ],
        tips: [
                  "Use continue to skip the current iteration without exiting the loop",
                  "Labeled break/continue are powerful for nested loops but can reduce readability",
                  "Prefer early returns in methods over complex break/continue logic"
        ],
        mistake: "Using labeled statements excessively, making code hard to follow.",
        shorthand: {
          verbose: "for(int i=0;i<10;i++) {\n  if(i==5) break;\n  if(i==2) continue;\n}",
          concise: "for(int i=0;i<10;i++) { if(i==5) break; if(i==2) continue; }",
        },
      },
    ],
  },

  // ── Section 3: Methods & Lambdas ─────────────────────────────────────────
  {
    id: "methods-lambdas",
    title: "Methods & Lambdas",
    entries: [
      {
        id: "method-definition",
        fn: "Method Definition",
        desc: "Define reusable blocks of code with parameters and return types.",
        category: "Methods",
        subtitle: "Function basics",
        signature: "returnType methodName(paramType param1, ...) { ... }",
        descLong: "Methods encapsulate behavior with inputs (parameters) and outputs (return type). Methods with void return nothing. Use descriptive names and limit parameters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Method Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class MethodExample {\n    // Method with parameters and return type\n    public static int add(int a, int b) {\n        return a + b;\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Method Definition — common patterns you'll see in production.\n// APPROACH  - Combine Method Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Method with no parameters\n    public static String getGreeting() {\n        return \"Hello, Java!\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Method Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Method with void return,    public static void printMessage(String msg) {,        System.out.println(\"Message: \" + msg);,    },\n\n    // Method with multiple returns,    public static int max(int x, int y) {,        if (x > y) {,            return x;,        },        return y;,    },,    public static void main(String[] args) {,        System.out.println(\"Sum: \" + add(5, 3));,        System.out.println(getGreeting());,        printMessage(\"Test\");,        System.out.println(\"Max: \" + max(10, 20));,    },}"
                  }
        ],
        tips: [
                  "Keep methods small and focused on a single responsibility",
                  "Use meaningful parameter names to improve code clarity",
                  "Consider extracting complex logic into separate methods for testability"
        ],
        mistake: "Methods with too many parameters (>4) indicating poor design.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class MethodExample {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "method-overloading",
        fn: "Method Overloading",
        desc: "Define multiple methods with the same name but different parameter signatures.",
        category: "Methods",
        subtitle: "Same name, different signatures",
        signature: "methodName(Type1 param1) vs methodName(Type2 param2)",
        descLong: "Overloading allows the same method name with different parameter types or counts. The compiler chooses the best match at compile time.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Method Overloading — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class Overloading {\n    // Overload by parameter count\n    public static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static int add(int a, int b, int c) {\n        return a + b + c;\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Method Overloading — common patterns you'll see in production.\n// APPROACH  - Combine Method Overloading with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Overload by parameter type\n    public static double add(double a, double b) {\n        return a + b;\n    }\n\n    public static String add(String a, String b) {\n        return a + \" \" + b;\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Method Overloading — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\npublic static void main(String[] args) {\n        System.out.println(\"int + int: \" + add(5, 3));\n        System.out.println(\"int + int + int: \" + add(5, 3, 2));\n        System.out.println(\"double + double: \" + add(5.5, 3.2));\n        System.out.println(\"String + String: \" + add(\"Hello\", \"World\"));\n    }\n}"
                  }
        ],
        tips: [
                  "Overload methods to provide convenient variants for common use cases",
                  "Keep overload behavior consistent across all variants",
                  "Too many overloads can confuse users; consider builder patterns for complex cases"
        ],
        mistake: "Overloads with significantly different behavior, violating the Liskov principle.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic void add(int a, int b) { }\npublic void add(double a, double b) { }\n// More explicit but longer",
          concise: "add(5, 3); add(3.14, 2.86);  // overloaded",
        },
      },
      {
        id: "varargs",
        fn: "Variable Arguments (varargs)",
        desc: "Accept a variable number of arguments of the same type.",
        category: "Methods",
        subtitle: "Flexible parameter count",
        signature: "methodName(Type... args)",
        descLong: "Varargs allow a method to accept any number of arguments of the specified type as an array. Convenient for methods like printf or sum.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Variable Arguments (varargs) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class VarArgs {\n    public static int sum(int... numbers) {\n        int total = 0;\n        for (int num : numbers) {\n            total += num;\n        }\n        return total;\n    }\n\n    public static void printAll(String prefix, String... items) {\n        System.out.print(prefix + \": \");\n        for (String item : items) {\n            System.out.print(item + \" \");\n        }\n        System.out.println();\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Variable Arguments (varargs) — common patterns you'll see in production.\n// APPROACH  - Combine Variable Arguments (varargs) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic static void main(String[] args) {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Variable Arguments (varargs) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println(\"Sum of 1, 2: \" + sum(1, 2));\n        System.out.println(\"Sum of 1, 2, 3, 4, 5: \" + sum(1, 2, 3, 4, 5));\n        System.out.println(\"Sum of nothing: \" + sum());\n\n        printAll(\"Colors\", \"Red\", \"Green\", \"Blue\");\n        printAll(\"Numbers\", \"One\", \"Two\", \"Three\", \"Four\");\n    }\n}"
                  }
        ],
        tips: [
                  "varargs must be the last parameter in a method signature",
                  "Varargs are converted to an array internally",
                  "Use varargs for convenience, but document expected usage patterns"
        ],
        mistake: "Placing varargs before other parameters (syntax error).",
        shorthand: {
          verbose: "void print(String[] messages) {\n  for(String m : messages) System.out.println(m);\n}",
          concise: "void print(String... messages) { }",
        },
      },
      {
        id: "lambda-expressions",
        fn: "Lambda Expressions",
        desc: "Write concise anonymous functions for functional interfaces.",
        category: "Methods",
        subtitle: "Functional programming",
        signature: "(params) -> expression or (params) -> { statements; }",
        descLong: "Lambda expressions provide a concise syntax for implementing single-method interfaces (functional interfaces). Introduced in Java 8, they enable functional programming styles.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Lambda Expressions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.function.Predicate;\n\npublic class LambdaExample {\n    @FunctionalInterface\n    interface Calculator {\n        int calculate(int a, int b);\n    }\n\n    public static void main(String[] args) {\n        // Lambda for addition\n        Calculator add = (a, b) -> a + b;\n        System.out.println(\"5 + 3 = \" + add.calculate(5, 3));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Lambda Expressions — common patterns you'll see in production.\n// APPROACH  - Combine Lambda Expressions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Lambda for multiplication\n        Calculator multiply = (a, b) -> a * b;\n        System.out.println(\"5 * 3 = \" + multiply.calculate(5, 3));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Lambda Expressions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Lambda with block body,        Calculator power = (a, b) -> {,            int result = 1;,            for (int i = 0; i < b; i++) {,                result *= a;,            },            return result;,        };,        System.out.println(\"5 ^ 3 = \" + power.calculate(5, 3));,\n\n        // Using built-in functional interfaces,        Predicate<Integer> isEven = n -> n % 2 == 0;,        System.out.println(\"Is 4 even? \" + isEven.test(4));,    },}"
                  }
        ],
        tips: [
                  "Use lambdas only for functional interfaces with a single abstract method",
                  "Prefer clear, single-line lambdas for readability",
                  "When logic is complex, use named methods or inner classes instead"
        ],
        mistake: "Using lambdas for interfaces with multiple abstract methods.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.function.Predicate;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "method-references",
        fn: "Method References",
        desc: "Refer to existing methods as functional interface implementations.",
        category: "Methods",
        subtitle: "Function reference syntax",
        signature: "ClassName::methodName or instance::methodName",
        descLong: "Method references provide a way to refer to existing methods using :: syntax. More readable than lambdas when delegating to existing logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Method References — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.function.Consumer;\nimport java.util.function.Supplier;\n\npublic class MethodReferences {\n    static class Person {\n        String name;\n        int age;\n\n        Person(String name, int age) {\n            this.name = name;\n            this.age = age;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" (\" + age + \")\";\n        }\n    }\n\n    public static void main(String[] args) {\n        List<Person> people = List.of(\n            new Person(\"Alice\", 30),\n            new Person(\"Bob\", 25),\n            new Person(\"Charlie\", 35)\n        );"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Method References — common patterns you'll see in production.\n// APPROACH  - Combine Method References with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Static method reference\n        people.forEach(System.out::println);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Method References — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Instance method reference,        String separator = \", \";,        Consumer<Person> printer = p -> System.out.println(p);,\n\n        // Constructor reference,        Supplier<Person> supplier = () -> new Person(\"Default\", 0);,        System.out.println(\"New person: \" + supplier.get());,    },}"
                  }
        ],
        tips: [
                  "Use method references for cleaner code when wrapping existing methods",
                  "Four types: static, instance, constructor, and array constructor references",
                  "Method references are not more powerful than lambdas, just more readable in certain cases"
        ],
        mistake: "Trying to use method references for methods that don't match the functional interface signature.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFunction<String, Integer> f = String::length;\nstr -> Integer.parseInt(str);  // Lambda works\n// More explicit but longer",
          concise: "list.forEach(System.out::println);  // Matches Consumer<T>\nlist.map(Integer::parseInt);  // Matches Function<String, Integer>",
        },
      },
    ],
  },

  // ── Section 4: Object-Oriented Programming ─────────────────────────────────────────
  {
    id: "oop",
    title: "Object-Oriented Programming",
    entries: [
      {
        id: "class-definition",
        fn: "Class Definition",
        desc: "Define a blueprint for creating objects with properties and methods.",
        category: "OOP",
        subtitle: "Classes and objects",
        signature: "class ClassName { ... }",
        descLong: "Classes define the structure and behavior of objects. They contain fields (properties), methods (behaviors), and constructors. A class is a blueprint; objects are instances.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Class Definition — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class Person {\n    private String name;\n    private int age;\n    private String email;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Class Definition — common patterns you'll see in production.\n// APPROACH  - Combine Class Definition with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Constructor\n    public Person(String name, int age, String email) {\n        this.name = name;\n        this.age = age;\n        this.email = email;\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Class Definition — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Getters,    public String getName() {,        return name;,    },,    public int getAge() {,        return age;,    },\n\n    // Methods,    public void printInfo() {,        System.out.println(\"Name: \" + name + \", Age: \" + age + \", Email: \" + email);,    },,    public static void main(String[] args) {,        Person p1 = new Person(\"Alice\", 30, \"alice@example.com\");,        Person p2 = new Person(\"Bob\", 25, \"bob@example.com\");,,        p1.printInfo();,        p2.printInfo();,        System.out.println(p1.getName() + \" is \" + p1.getAge() + \" years old\");,    },}"
                  }
        ],
        tips: [
                  "Use private fields and public getters/setters to control access (encapsulation)",
                  "Every class should have a clear purpose and responsibility",
                  "Use constructors to ensure objects are always in a valid state"
        ],
        mistake: "Making all fields public, breaking encapsulation and making refactoring difficult.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class Person {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "inheritance",
        fn: "Inheritance",
        desc: "Create a subclass that inherits properties and methods from a parent class.",
        category: "OOP",
        subtitle: "Class hierarchy",
        signature: "class Child extends Parent { ... }",
        descLong: "Inheritance allows a subclass to reuse and extend the functionality of a parent class using the extends keyword. Use for \"is-a\" relationships.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Inheritance — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class InheritanceExample {\n    static class Animal {\n        protected String name;\n\n        public Animal(String name) {\n            this.name = name;\n        }\n\n        public void speak() {\n            System.out.println(name + \" makes a sound\");\n        }\n    }\n\n    static class Dog extends Animal {\n        public Dog(String name) {\n            super(name);\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Inheritance — common patterns you'll see in production.\n// APPROACH  - Combine Inheritance with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@Override\n        public void speak() {\n            System.out.println(name + \" barks\");\n        }\n    }\n\n    static class Cat extends Animal {\n        public Cat(String name) {\n            super(name);\n        }\n\n        @Override\n        public void speak() {\n            System.out.println(name + \" meows\");\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Inheritance — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\npublic static void main(String[] args) {\n        Dog dog = new Dog(\"Rex\");\n        Cat cat = new Cat(\"Whiskers\");\n\n        dog.speak();\n        cat.speak();\n    }\n}"
                  }
        ],
        tips: [
                  "Use inheritance for true \"is-a\" relationships, not just code reuse",
                  "Override methods to customize behavior in subclasses using @Override annotation",
                  "Use super to call parent class methods and constructors"
        ],
        mistake: "Deep inheritance hierarchies (more than 3 levels) indicate poor design.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class InheritanceExample {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "interfaces",
        fn: "Interfaces",
        desc: "Define a contract that classes must implement with specific methods.",
        category: "OOP",
        subtitle: "Contracts and polymorphism",
        signature: "interface InterfaceName { ... } implements InterfaceName",
        descLong: "Interfaces define abstract method contracts. Classes implement interfaces to guarantee they provide specific methods. Enables polymorphism without shared state.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class InterfaceExample {\n    interface Shape {\n        double getArea();\n        double getPerimeter();\n        void describe();\n    }\n\n    static class Circle implements Shape {\n        double radius;\n\n        Circle(double radius) {\n            this.radius = radius;\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n@Override\n        public double getArea() {\n            return Math.PI * radius * radius;\n        }\n\n        @Override\n        public double getPerimeter() {\n            return 2 * Math.PI * radius;\n        }\n\n        @Override\n        public void describe() {\n            System.out.println(\"Circle with radius \" + radius);\n        }\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\npublic static void main(String[] args) {\n        Shape circle = new Circle(5.0);\n        circle.describe();\n        System.out.println(\"Area: \" + circle.getArea());\n        System.out.println(\"Perimeter: \" + circle.getPerimeter());\n    }\n}"
                  }
        ],
        tips: [
                  "Use interfaces to define contracts and enable polymorphism",
                  "A class can implement multiple interfaces but extend only one class",
                  "Java 8+ interfaces can have default methods with implementations"
        ],
        mistake: "Treating interfaces as just a way to inherit, rather than a contract.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class InterfaceExample {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "records",
        fn: "Records (Java 14+)",
        desc: "Create immutable data carrier classes with minimal boilerplate.",
        category: "OOP",
        subtitle: "Data classes",
        signature: "record Name(Type field1, Type field2) { }",
        descLong: "Records simplify creation of immutable data classes by automatically generating constructors, getters, equals, hashCode, and toString methods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Records (Java 14+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class RecordExample {\n    record Person(String name, int age, String email) {\n        // Optional: add custom methods\n        public boolean isAdult() {\n            return age >= 18;\n        }\n    }\n\n    record Point(double x, double y) {\n        public double distanceFromOrigin() {\n            return Math.sqrt(x * x + y * y);\n        }\n    }\n\n    public static void main(String[] args) {\n        Person person = new Person(\"Alice\", 30, \"alice@example.com\");\n        Point point = new Point(3.0, 4.0);\n\n        System.out.println(person);  // Auto toString()\n        System.out.println(\"Is adult? \" + person.isAdult());\n        System.out.println(\"Distance: \" + point.distanceFromOrigin());"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Records (Java 14+) — common patterns you'll see in production.\n// APPROACH  - Combine Records (Java 14+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Records are immutable\n        System.out.println(\"Name: \" + person.name());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Records (Java 14+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println(\"Age: \" + person.age());\n    }\n}"
                  }
        ],
        tips: [
                  "Use records for simple data-carrying classes to reduce boilerplate",
                  "Records are immutable by design; prefer them over mutable POJOs",
                  "Records can implement interfaces and have custom methods"
        ],
        mistake: "Trying to mutate record fields after creation (they are final).",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class RecordExample {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "abstract-classes",
        fn: "Abstract Classes",
        desc: "Define a partially implemented class that subclasses must complete.",
        category: "OOP",
        subtitle: "Partial implementation",
        signature: "abstract class Name { abstract void method(); }",
        descLong: "Abstract classes define common behavior while allowing subclasses to customize specific parts. Use when you want shared implementation and state, unlike interfaces.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Abstract Classes — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class AbstractExample {\n    abstract static class Animal {\n        protected String name;\n\n        public Animal(String name) {\n            this.name = name;\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Abstract Classes — common patterns you'll see in production.\n// APPROACH  - Combine Abstract Classes with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Abstract method - must be implemented by subclass\n        abstract void makeSound();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Abstract Classes — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Concrete method - shared implementation,        public void sleep() {,            System.out.println(name + \" is sleeping\");,        },    },,    static class Dog extends Animal {,        public Dog(String name) {,            super(name);,        },,        @Override,        void makeSound() {,            System.out.println(name + \" barks\");,        },    },,    public static void main(String[] args) {,        Dog dog = new Dog(\"Rex\");,        dog.makeSound();,        dog.sleep();,        // Animal animal = new Animal(\"Generic\");  // Error: cannot instantiate abstract,    },}"
                  }
        ],
        tips: [
                  "Use abstract classes to share state and implementation across subclasses",
                  "Mark methods as abstract to define a contract subclasses must fulfill",
                  "Abstract classes provide a template method pattern for common workflows"
        ],
        mistake: "Using abstract classes when interfaces would suffice (prefer composition).",
        shorthand: {
          verbose: "abstract class Shape {\n  abstract void draw();\n}",
          concise: "abstract class Shape { abstract void draw(); }",
        },
      },
    ],
  },

  // ── Section 5: Collections Framework ─────────────────────────────────────────
  {
    id: "collections",
    title: "Collections Framework",
    entries: [
      {
        id: "arraylist",
        fn: "ArrayList",
        desc: "Resizable array implementation of the List interface.",
        category: "Collections",
        subtitle: "Dynamic arrays",
        signature: "new ArrayList<Type>()",
        descLong: "ArrayList stores elements in a resizable array, providing fast random access and dynamic sizing. Best for frequent access and occasional modifications.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of ArrayList — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.ArrayList;\nimport java.util.List;\n\npublic class ArrayListExample {\n    public static void main(String[] args) {\n        List<String> fruits = new ArrayList<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of ArrayList — common patterns you'll see in production.\n// APPROACH  - Combine ArrayList with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding elements\n        fruits.add(\"Apple\");\n        fruits.add(\"Banana\");\n        fruits.add(\"Cherry\");\n        fruits.add(\"Date\");\n\n        System.out.println(\"List: \" + fruits);\n        System.out.println(\"Size: \" + fruits.size());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of ArrayList — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Accessing elements,        System.out.println(\"First: \" + fruits.get(0));,        System.out.println(\"Last: \" + fruits.get(fruits.size() - 1));,\n\n        // Removing elements,        fruits.remove(1);  // Remove by index,        fruits.remove(\"Date\");  // Remove by value,\n\n        // Iteration,        for (String fruit : fruits) {,            System.out.println(\"Fruit: \" + fruit);,        },\n\n        // Check existence,        System.out.println(\"Contains Apple? \" + fruits.contains(\"Apple\"));,    },}"
                  }
        ],
        tips: [
                  "Use ArrayList for dynamic collections with frequent access by index",
                  "Prefer List<T> interface type for flexibility",
                  "Use addAll() and removeAll() for batch operations"
        ],
        mistake: "Using ArrayList for the wrong use case (e.g., frequent insertions in middle).",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.ArrayList;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "hashmap",
        fn: "HashMap",
        desc: "Hash table implementation of the Map interface for key-value pairs.",
        category: "Collections",
        subtitle: "Key-value storage",
        signature: "new HashMap<KeyType, ValueType>()",
        descLong: "HashMap stores key-value pairs with O(1) average access time. Keys must be unique. No ordering guarantees. Best for fast lookups.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HashMap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic class HashMapExample {\n    public static void main(String[] args) {\n        Map<String, Integer> scores = new HashMap<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HashMap — common patterns you'll see in production.\n// APPROACH  - Combine HashMap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding entries\n        scores.put(\"Alice\", 95);\n        scores.put(\"Bob\", 87);\n        scores.put(\"Charlie\", 92);\n        scores.put(\"David\", 88);\n\n        System.out.println(\"Map: \" + scores);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HashMap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Accessing values,        System.out.println(\"Alice's score: \" + scores.get(\"Alice\"));,        System.out.println(\"Score for Eve: \" + scores.getOrDefault(\"Eve\", 0));,\n\n        // Removing entries,        scores.remove(\"David\");,\n\n        // Checking existence,        System.out.println(\"Contains Bob? \" + scores.containsKey(\"Bob\"));,        System.out.println(\"Contains 95? \" + scores.containsValue(95));,\n\n        // Iteration,        for (String name : scores.keySet()) {,            System.out.println(name + \": \" + scores.get(name));,        },\n\n        // Size,        System.out.println(\"Total entries: \" + scores.size());,    },}"
                  }
        ],
        tips: [
                  "Use HashMap for fast lookups by key",
                  "HashMap is not thread-safe; use ConcurrentHashMap for multi-threaded access",
                  "Use LinkedHashMap to maintain insertion order"
        ],
        mistake: "Using mutable objects as keys (they can cause lookup failures if modified).",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.HashMap;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "hashset",
        fn: "HashSet",
        desc: "Hash table implementation of the Set interface for unique elements.",
        category: "Collections",
        subtitle: "Unique element storage",
        signature: "new HashSet<Type>()",
        descLong: "HashSet stores unique elements with O(1) average operations. No duplicates allowed and no ordering. Useful for membership testing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of HashSet — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.HashSet;\nimport java.util.Set;\n\npublic class HashSetExample {\n    public static void main(String[] args) {\n        Set<String> tags = new HashSet<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of HashSet — common patterns you'll see in production.\n// APPROACH  - Combine HashSet with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding elements\n        tags.add(\"java\");\n        tags.add(\"programming\");\n        tags.add(\"coding\");\n        tags.add(\"java\");  // Duplicate - ignored\n\n        System.out.println(\"Tags: \" + tags);\n        System.out.println(\"Size: \" + tags.size());"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of HashSet — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Checking membership,        System.out.println(\"Contains 'java'? \" + tags.contains(\"java\"));,        System.out.println(\"Contains 'python'? \" + tags.contains(\"python\"));,\n\n        // Removing elements,        tags.remove(\"coding\");,        System.out.println(\"After removal: \" + tags);,\n\n        // Set operations,        Set<String> moreTags = new HashSet<>();,        moreTags.add(\"java\");,        moreTags.add(\"database\");,,        tags.addAll(moreTags);,        System.out.println(\"Union: \" + tags);,\n\n        // Iteration,        for (String tag : tags) {,            System.out.println(\"Tag: \" + tag);,        },    },}"
                  }
        ],
        tips: [
                  "Use HashSet for fast membership testing",
                  "HashSet maintains no order; use TreeSet for sorted order or LinkedHashSet for insertion order",
                  "HashSet elements should be immutable or their hashCode() should not change"
        ],
        mistake: "Assuming HashSet maintains any particular order of elements.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.HashSet;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "linkedlist",
        fn: "LinkedList",
        desc: "Doubly-linked list implementation of the List interface.",
        category: "Collections",
        subtitle: "Efficient insertions/deletions",
        signature: "new LinkedList<Type>()",
        descLong: "LinkedList implements List with O(1) insertion/deletion at ends but O(n) access by index. Best for frequent insertions/deletions or as a deque.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of LinkedList — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.LinkedList;\nimport java.util.List;\n\npublic class LinkedListExample {\n    public static void main(String[] args) {\n        LinkedList<String> tasks = new LinkedList<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of LinkedList — common patterns you'll see in production.\n// APPROACH  - Combine LinkedList with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding to list\n        tasks.add(\"Task 1\");\n        tasks.add(\"Task 2\");\n        tasks.add(\"Task 3\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of LinkedList — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Adding at specific positions,        tasks.addFirst(\"Priority Task\");,        tasks.addLast(\"Final Task\");,,        System.out.println(\"Tasks: \" + tasks);,\n\n        // Accessing,        System.out.println(\"First: \" + tasks.getFirst());,        System.out.println(\"Last: \" + tasks.getLast());,        System.out.println(\"At index 2: \" + tasks.get(2));,\n\n        // Removing,        tasks.removeFirst();,        tasks.removeLast();,        tasks.remove(0);,\n\n        // Iteration,        System.out.println(\"Remaining tasks:\");,        for (String task : tasks) {,            System.out.println(\"  - \" + task);,        },\n\n        // Size,        System.out.println(\"Task count: \" + tasks.size());,    },}"
                  }
        ],
        tips: [
                  "Use LinkedList for frequent insertions/deletions at the beginning or end",
                  "LinkedList implements Deque interface for queue/stack operations",
                  "Avoid random access on LinkedList due to O(n) performance"
        ],
        mistake: "Using LinkedList for primarily random access operations.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.LinkedList;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "treemap",
        fn: "TreeMap",
        desc: "Sorted map implementation using a red-black tree.",
        category: "Collections",
        subtitle: "Sorted key-value pairs",
        signature: "new TreeMap<KeyType, ValueType>()",
        descLong: "TreeMap maintains keys in sorted order with O(log n) operations. Slower than HashMap but provides ordering. Keys must be comparable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of TreeMap — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Map;\nimport java.util.TreeMap;\n\npublic class TreeMapExample {\n    public static void main(String[] args) {\n        Map<Integer, String> rankings = new TreeMap<>();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of TreeMap — common patterns you'll see in production.\n// APPROACH  - Combine TreeMap with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding entries (will be sorted by key)\n        rankings.put(3, \"Third Place\");\n        rankings.put(1, \"First Place\");\n        rankings.put(2, \"Second Place\");\n        rankings.put(5, \"Fifth Place\");\n        rankings.put(4, \"Fourth Place\");\n\n        System.out.println(\"Sorted rankings: \" + rankings);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of TreeMap — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Accessing entries (in order),        System.out.println(\"First entry: \" + rankings.firstKey());,        System.out.println(\"Last entry: \" + rankings.lastKey());,\n\n        // Range queries,        System.out.println(\"Keys 2-4: \" + rankings.subMap(2, 5));,\n\n        // Iteration (natural order),        System.out.println(\"All rankings in order:\");,        for (int rank : rankings.keySet()) {,            System.out.println(\"  \" + rank + \": \" + rankings.get(rank));,        },    },}"
                  }
        ],
        tips: [
                  "Use TreeMap when you need keys in sorted order",
                  "TreeMap is slower than HashMap due to sorting overhead",
                  "Implement Comparable interface or provide Comparator for custom sorting"
        ],
        mistake: "Using TreeMap when ordering is not needed (prefer HashMap for speed).",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.Map;\n// More explicit but longer",
          concise: "// inline",
        },
      },
    ],
  },

  // ── Section 6: Exception Handling ─────────────────────────────────────────
  {
    id: "exceptions",
    title: "Exception Handling",
    entries: [
      {
        id: "try-catch",
        fn: "try-catch-finally Block",
        desc: "Handle exceptions and ensure cleanup code runs regardless of outcome.",
        category: "Exceptions",
        subtitle: "Exception handling",
        signature: "try { ... } catch (ExceptionType e) { ... } finally { ... }",
        descLong: "try-catch-finally blocks handle exceptions gracefully. try contains risky code, catch handles exceptions, finally runs regardless of success or failure.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of try-catch-finally Block — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class TryCatchExample {\n    public static void main(String[] args) {\n        // Basic try-catch\n        try {\n            int[] numbers = {1, 2, 3};\n            System.out.println(numbers[10]);  // ArrayIndexOutOfBoundsException\n        } catch (ArrayIndexOutOfBoundsException e) {\n            System.out.println(\"Error: Index out of bounds - \" + e.getMessage());\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of try-catch-finally Block — common patterns you'll see in production.\n// APPROACH  - Combine try-catch-finally Block with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// try-finally (no catch)\n        try {\n            System.out.println(\"Opening resource\");\n        } finally {\n            System.out.println(\"Closing resource (always runs)\");\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of try-catch-finally Block — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Complete try-catch-finally,        try {,            var num = Integer.parseInt(\"invalid\");,        } catch (NumberFormatException e) {,            System.out.println(\"Invalid number format\");,        } finally {,            System.out.println(\"Cleanup code\");,        },\n\n        // Multiple catches,        try {,            int x = 10 / 0;,        } catch (ArithmeticException e) {,            System.out.println(\"Math error\");,        } catch (Exception e) {,            System.out.println(\"General error\");,        },    },}"
                  }
        ],
        tips: [
                  "Use catch blocks ordered from most specific to most general exception",
                  "finally blocks are ideal for closing resources (files, connections)",
                  "Prefer try-with-resources for automatic resource management"
        ],
        mistake: "Catching Exception or Throwable too broadly, hiding specific errors.",
        shorthand: {
          verbose: "// Manual / verbose approach\npublic class TryCatchExample {\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "custom-exceptions",
        fn: "Custom Exceptions",
        desc: "Create application-specific exception classes for better error handling.",
        category: "Exceptions",
        subtitle: "Domain-specific errors",
        signature: "class CustomException extends Exception { }",
        descLong: "Custom exceptions provide domain-specific error types, improving code clarity and enabling precise exception handling. Inherit from Exception for checked exceptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Custom Exceptions — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\npublic class CustomExceptionExample {\n    static class InvalidAgeException extends Exception {\n        public InvalidAgeException(String message) {\n            super(message);\n        }\n    }\n\n    static class User {\n        String name;\n        int age;\n\n        public User(String name, int age) throws InvalidAgeException {\n            if (age < 0 || age > 150) {\n                throw new InvalidAgeException(\"Age must be between 0 and 150, got \" + age);\n            }\n            this.name = name;\n            this.age = age;\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Custom Exceptions — common patterns you'll see in production.\n// APPROACH  - Combine Custom Exceptions with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic static void main(String[] args) {\n        try {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Custom Exceptions — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nUser user1 = new User(\"Alice\", 30);\n            System.out.println(\"User created: \" + user1.name);\n\n            User user2 = new User(\"Bob\", -5);\n        } catch (InvalidAgeException e) {\n            System.out.println(\"Caught custom exception: \" + e.getMessage());\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Create custom exceptions for domain-specific errors in your application",
                  "Extend Exception for checked exceptions, RuntimeException for unchecked",
                  "Provide meaningful error messages in exception constructors"
        ],
        mistake: "Throwing generic Exception instead of a more specific custom exception.",
        shorthand: {
          verbose: "// Manual / verbose approach\nclass BadAge extends Exception { }\n// More explicit but longer",
          concise: "class BadAge extends Exception { }",
        },
      },
      {
        id: "multi-catch",
        fn: "Multi-catch (Java 7+)",
        desc: "Catch multiple exception types in a single catch block.",
        category: "Exceptions",
        subtitle: "Multiple exception handling",
        signature: "catch (Exception1 | Exception2 | ... e) { ... }",
        descLong: "Multi-catch syntax allows handling multiple unrelated exceptions with the same code. Reduces code duplication and improves readability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Multi-catch (Java 7+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.io.IOException;\nimport java.nio.file.Files;\nimport java.nio.file.Paths;\n\npublic class MultiCatchExample {\n    public static void main(String[] args) {\n        // Multi-catch block\n        try {\n            String content = Files.readString(Paths.get(\"nonexistent.txt\"));\n            int number = Integer.parseInt(\"not a number\");\n        } catch (IOException | NumberFormatException e) {\n            System.out.println(\"Error occurred: \" + e.getClass().getSimpleName());\n            System.out.println(\"Message: \" + e.getMessage());\n            e.printStackTrace();\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Multi-catch (Java 7+) — common patterns you'll see in production.\n// APPROACH  - Combine Multi-catch (Java 7+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Another example\n        try {\n            Object obj = new Object();\n            String str = (String) obj;  // ClassCastException"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Multi-catch (Java 7+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n} catch (ClassCastException | NullPointerException e) {\n            System.out.println(\"Type or null error: \" + e.getMessage());\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Use multi-catch to handle related exceptions with similar recovery logic",
                  "The exception parameter is implicitly final in multi-catch blocks",
                  "Order specific exceptions before more general ones"
        ],
        mistake: "Using multi-catch with unrelated exception hierarchies.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.io.IOException;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "try-with-resources",
        fn: "try-with-resources (Java 7+)",
        desc: "Automatically close resources (file, connection) with cleaner syntax.",
        category: "Exceptions",
        subtitle: "Auto resource management",
        signature: "try (Resource res = new Resource()) { ... }",
        descLong: "try-with-resources automatically closes any resource implementing AutoCloseable. Eliminates manual finally blocks and ensures proper cleanup even on exception.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of try-with-resources (Java 7+) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.io.BufferedReader;\nimport java.io.StringReader;\n\npublic class TryWithResourcesExample {\n    public static void main(String[] args) {\n        // try-with-resources: automatically closes the BufferedReader\n        try (BufferedReader reader = new BufferedReader(new StringReader(\"Line 1\\nLine 2\\nLine 3\"))) {\n            String line;\n            System.out.println(\"Reading lines:\");\n            while ((line = reader.readLine()) != null) {\n                System.out.println(\"  \" + line);\n            }\n        } catch (java.io.IOException e) {\n            System.out.println(\"IO Error: \" + e.getMessage());\n        }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of try-with-resources (Java 7+) — common patterns you'll see in production.\n// APPROACH  - Combine try-with-resources (Java 7+) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple resources\n        try (\n            BufferedReader reader = new BufferedReader(new StringReader(\"Data\"));\n            java.io.PrintWriter writer = new java.io.PrintWriter(System.out)\n        ) {"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of try-with-resources (Java 7+) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nwriter.println(\"Resources opened successfully\");\n        } catch (Exception e) {\n            System.out.println(\"Error: \" + e.getMessage());\n        }\n    }\n}"
                  }
        ],
        tips: [
                  "Use try-with-resources for any resource implementing AutoCloseable",
                  "Multiple resources can be declared in a single try-with-resources statement",
                  "The resource is automatically closed before the catch/finally blocks execute"
        ],
        mistake: "Manually closing resources when try-with-resources is available.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.io.BufferedReader;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "optional",
        fn: "Optional for Null Safety",
        desc: "Use Optional instead of null to represent optional values safely.",
        category: "Exceptions",
        subtitle: "Null-safe operations",
        signature: "Optional<Type> optional = Optional.ofNullable(value);",
        descLong: "Optional is a container that may or may not contain a value. Provides methods to safely handle absent values without null checks and NullPointerExceptions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Optional for Null Safety — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Optional;\n\npublic class OptionalExample {\n    static class User {\n        String name;\n        String email;\n\n        User(String name, String email) {\n            this.name = name;\n            this.email = email;\n        }\n    }\n\n    public static void main(String[] args) {\n        // Creating Optional\n        Optional<String> name = Optional.of(\"Alice\");\n        Optional<String> empty = Optional.empty();\n        Optional<String> nullable = Optional.ofNullable(null);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Optional for Null Safety — common patterns you'll see in production.\n// APPROACH  - Combine Optional for Null Safety with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Checking presence\n        if (name.isPresent()) {\n            System.out.println(\"Name: \" + name.get());\n        }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Optional for Null Safety — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Using orElse,        System.out.println(\"Name or default: \" + name.orElse(\"Unknown\"));,        System.out.println(\"Empty or default: \" + empty.orElse(\"Default\"));,\n\n        // Using ifPresent,        name.ifPresent(n -> System.out.println(\"Processing: \" + n));,\n\n        // Chaining operations,        Optional<String> result = Optional.of(\"john@example.com\"),            .filter(email -> email.contains(\"@\")),            .map(String::toUpperCase);,        System.out.println(\"Valid email: \" + result.orElse(\"Invalid\"));,    },}"
                  }
        ],
        tips: [
                  "Use Optional to represent potentially absent values instead of null",
                  "Chain Optional methods (filter, map, flatMap) for readable null-safe code",
                  "Use orElse(), orElseGet(), orElseThrow() for handling absent values"
        ],
        mistake: "Using Optional.get() without checking isPresent() (defeats the purpose).",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.Optional;\n// More explicit but longer",
          concise: "// inline",
        },
      },
    ],
  },

  // ── Section 7: Generics ─────────────────────────────────────────
  {
    id: "generics",
    title: "Generics",
    entries: [
      {
        id: "generic-classes-methods",
        fn: "Generic Classes & Methods",
        desc: "Write type-safe, reusable code that works with any type — classes, methods, and interfaces with type parameters.",
        category: "Generics",
        subtitle: "Type parameters <T>, generic methods, and type safety",
        signature: "class Box<T> { T value; }  |  <T> T max(T a, T b)",
        descLong: "Generics let you parameterize types, providing compile-time type safety without casting. A generic class or method declares type parameters in angle brackets. The compiler erases generics at runtime (type erasure) — they exist only at compile time. Use single uppercase letters by convention: T (type), E (element), K (key), V (value), N (number).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Generic Classes & Methods — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\n// Generic class\npublic class Pair<A, B> {\n    private final A first;\n    private final B second;\n\n    public Pair(A first, B second) {\n        this.first = first;\n        this.second = second;\n    }\n\n    public A getFirst() { return first; }\n    public B getSecond() { return second; }\n\n    @Override\n    public String toString() {\n        return \"(\" + first + \", \" + second + \")\";\n    }\n}"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Generic Classes & Methods — common patterns you'll see in production.\n// APPROACH  - Combine Generic Classes & Methods with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Usage — compiler enforces types\nPair<String, Integer> nameAge = new Pair<>(\"Alice\", 30);\nString name = nameAge.getFirst();   // no cast needed\nInteger age = nameAge.getSecond();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Generic Classes & Methods — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Generic method,public static <T extends Comparable<T>> T max(T a, T b) {,    return a.compareTo(b) >= 0 ? a : b;,},,String bigger = max(\"apple\", \"banana\");  // \"banana\",Integer larger = max(10, 20);             // 20,\n\n// Generic interface,public interface Repository<T, ID> {,    T findById(ID id);,    List<T> findAll();,    void save(T entity);,    void deleteById(ID id);,},,public class UserRepository implements Repository<User, Long> {,    @Override,    public User findById(Long id) { /* ... */ return null; },    @Override,    public List<User> findAll() { /* ... */ return List.of(); },    @Override,    public void save(User user) { /* ... */ },    @Override,    public void deleteById(Long id) { /* ... */ },}"
                  }
        ],
        tips: [
                  "Convention: T=type, E=element, K=key, V=value, N=number, R=return — makes generic code readable.",
                  "Diamond operator <> (Java 7+) infers type arguments: List<String> list = new ArrayList<>()",
                  "Generic methods can infer type parameters from arguments — no need to specify explicitly most of the time.",
                  "Prefer generic interfaces (Repository<T, ID>) for reusable contracts across entity types."
        ],
        mistake: "Creating a new Object[] array and casting to T[] in a generic class — arrays and generics don't mix. Use ArrayList<T> or @SuppressWarnings(\"unchecked\") with documentation.",
        shorthand: {
          verbose: "class Box<T> {\n    T[] items = new Object[10];  // ERROR at runtime (cast)\n    T get(int i) { return items[i]; }\n}",
          concise: "class Box<T> {\n    List<T> items = new ArrayList<>();\n    T get(int i) { return items.get(i); }\n}  // Use List instead of array",
        },
      },
      {
        id: "bounded-type-params",
        fn: "Bounded Type Parameters",
        desc: "Restrict type parameters to subtypes of a specific class or interface — enables calling methods on the type.",
        category: "Generics",
        subtitle: "Upper bounds, multiple bounds, and recursive bounds",
        signature: "<T extends Number>  |  <T extends Comparable<T>>  |  <T extends A & B>",
        descLong: "Upper bounds restrict a type parameter to a class or its subtypes. This lets you call methods of the bound type on generic variables. Multiple bounds are supported with & (one class, multiple interfaces). Recursive bounds like <T extends Comparable<T>> are the pattern for self-referential type constraints.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Bounded Type Parameters — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.stream.*;\nimport java.util.*;\n// Upper bound — T must be a Number\npublic static <T extends Number> double sum(List<T> numbers) {\n    double total = 0;\n    for (T n : numbers) {\n        total += n.doubleValue();  // can call Number methods!\n    }\n    return total;\n}\n\nsum(List.of(1, 2, 3));         // works: Integer extends Number\nsum(List.of(1.5, 2.5));        // works: Double extends Number\n// sum(List.of(\"a\"));           // ERROR: String doesn't extend Number"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Bounded Type Parameters — common patterns you'll see in production.\n// APPROACH  - Combine Bounded Type Parameters with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Multiple bounds — T must implement both interfaces\npublic static <T extends Comparable<T> & Serializable> T findMax(List<T> items) {\n    return items.stream().max(Comparable::compareTo).orElseThrow();\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Bounded Type Parameters — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Recursive bound — natural ordering,public class MinMaxStack<T extends Comparable<T>> {,    private final Deque<T> stack = new ArrayDeque<>();,    private final Deque<T> minStack = new ArrayDeque<>();,,    public void push(T value) {,        stack.push(value);,        if (minStack.isEmpty() || value.compareTo(minStack.peek()) <= 0) {,            minStack.push(value);,        },    },,    public T pop() {,        T value = stack.pop();,        if (value.compareTo(minStack.peek()) == 0) {,            minStack.pop();,        },        return value;,    },,    public T getMin() { return minStack.peek(); },}"
                  }
        ],
        tips: [
                  "<T extends Comparable<T>> is the standard pattern for sortable/orderable types.",
                  "Multiple bounds use & — at most one class (must be first), then interfaces.",
                  "Bounded types enable IDE autocompletion inside generic methods — the compiler knows what methods are available.",
                  "Use bounded wildcards in method signatures, bounded type params on class declarations."
        ],
        mistake: "Using <T extends Object> explicitly — it's the default and adds noise. Just write <T>.",
        shorthand: {
          verbose: "static <T extends Object> T pick(T a, T b) {\n    return a != null ? a : b;\n}",
          concise: "static <T> T pick(T a, T b) {\n    return a != null ? a : b;\n}  // Object bound is implicit",
        },
      },
      {
        id: "wildcards",
        fn: "Wildcards (? extends, ? super)",
        desc: "Use wildcard types for flexible method signatures — PECS: Producer Extends, Consumer Super.",
        category: "Generics",
        subtitle: "Upper/lower bounded wildcards and PECS principle",
        signature: "List<? extends Number>  |  List<? super Integer>  |  List<?>",
        descLong: "Wildcards make generic method parameters more flexible. ? extends T (upper bound) accepts T or any subtype — read from it. ? super T (lower bound) accepts T or any supertype — write to it. ? (unbounded) accepts any type. The PECS principle (Producer Extends, Consumer Super) guides which to use.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Wildcards (? extends, ? super) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.ArrayList;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Wildcards (? extends, ? super) — common patterns you'll see in production.\n// APPROACH  - Combine Wildcards (? extends, ? super) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ? extends — PRODUCER: read items out\npublic static double sumNumbers(List<? extends Number> numbers) {\n    double sum = 0;\n    for (Number n : numbers) {     // safe to read as Number\n        sum += n.doubleValue();\n    }\n    // numbers.add(1);              // ERROR: can't write to ? extends\n    return sum;\n}\n\nsumNumbers(List.of(1, 2, 3));         // List<Integer> ✓\nsumNumbers(List.of(1.5, 2.5));        // List<Double> ✓"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Wildcards (? extends, ? super) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ? super — CONSUMER: write items in,public static void addIntegers(List<? super Integer> list) {,    list.add(1);                     // safe to write Integer,    list.add(2);,    // Integer n = list.get(0);      // ERROR: can only read as Object,},,List<Number> nums = new ArrayList<>();,addIntegers(nums);                    // List<Number> ✓ (Number is super of Integer),List<Object> objs = new ArrayList<>();,addIntegers(objs);                    // List<Object> ✓,\n\n// PECS in practice — Collections.copy,// src is a Producer (extends), dest is a Consumer (super),public static <T> void copy(List<? super T> dest, List<? extends T> src) {,    for (int i = 0; i < src.size(); i++) {,        dest.set(i, src.get(i));,    },},\n\n// ? unbounded — only care about List operations, not element type,public static int countNonNull(List<?> list) {,    int count = 0;,    for (Object item : list) {,        if (item != null) count++;,    },    return count;,}"
                  }
        ],
        tips: [
                  "PECS: Producer Extends, Consumer Super — if you read from a generic, use extends; if you write to it, use super.",
                  "? extends makes the collection read-only for the parameterized type; ? super makes it write-only.",
                  "Use unbounded wildcard ? when you only use methods from Object (equals, toString, etc).",
                  "Collections.unmodifiableList() returns List<? extends T> — you can't add, only read."
        ],
        mistake: "Using List<Object> instead of List<?> when you don't care about element type — List<String> is NOT a subtype of List<Object>, but it IS a subtype of List<?>.",
        shorthand: {
          verbose: "List<Object> mixed = new ArrayList<>();\nList<String> strings = List.of(\"a\", \"b\");\nmixed = strings;  // ERROR: invariant",
          concise: "List<?> anything = strings;  // OK: covariant with wildcard\nString first = (String) anything.get(0);\n// anything.add(\"x\");  // ERROR: can't write to ?",
        },
      },
    ],
  },

  // ── Section 8: Functional Interfaces ─────────────────────────────────────────
  {
    id: "functional-interfaces",
    title: "Functional Interfaces",
    entries: [
      {
        id: "functional-interfaces-core",
        fn: "Core Functional Interfaces",
        desc: "Built-in functional interfaces from java.util.function — the foundation of lambda expressions and streams.",
        category: "Functional",
        subtitle: "Predicate, Function, Consumer, Supplier, and variants",
        signature: "Predicate<T>  |  Function<T,R>  |  Consumer<T>  |  Supplier<T>",
        descLong: "Java's java.util.function package provides 43 functional interfaces. The four core types: Predicate (test → boolean), Function (transform T → R), Consumer (accept T, no return), Supplier (get → T). Each has Bi- variants (two inputs), primitive specializations (IntPredicate, LongFunction), and composition methods (and, or, compose, andThen).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Core Functional Interfaces — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.stream.*;\nimport java.util.function.*;\nimport java.util.List;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Core Functional Interfaces — common patterns you'll see in production.\n// APPROACH  - Combine Core Functional Interfaces with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Predicate<T> — test something → boolean\nPredicate<String> isLong = s -> s.length() > 5;\nPredicate<String> startsWithA = s -> s.startsWith(\"A\");\nPredicate<String> combined = isLong.and(startsWithA);\n\nList<String> names = List.of(\"Alice\", \"Bob\", \"Alexander\", \"Amy\");\nnames.stream().filter(combined).forEach(System.out::println);\n// \"Alexander\""
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Core Functional Interfaces — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Function<T, R> — transform T → R,Function<String, Integer> length = String::length;,Function<Integer, String> toStars = n -> \"*\".repeat(n);,Function<String, String> lengthAsStars = length.andThen(toStars);,,System.out.println(lengthAsStars.apply(\"Hello\"));  // \"*****\",\n\n// BiFunction<T, U, R>,BiFunction<String, String, String> greet = (name, title) ->,    \"Hello, \" + title + \" \" + name;,System.out.println(greet.apply(\"Smith\", \"Dr.\"));  // \"Hello, Dr. Smith\",\n\n// Consumer<T> — accept T, return nothing,Consumer<String> print = System.out::println;,Consumer<String> shout = s -> System.out.println(s.toUpperCase());,Consumer<String> both = print.andThen(shout);,,both.accept(\"hello\");  // \"hello\" then \"HELLO\",\n\n// Supplier<T> — produce T from nothing,Supplier<List<String>> emptyList = ArrayList::new;,Supplier<Double> random = Math::random;,\n\n// UnaryOperator<T> — Function<T, T> (same input/output type),UnaryOperator<String> upper = String::toUpperCase;,UnaryOperator<String> trim = String::trim;,UnaryOperator<String> clean = trim.andThen(upper);,System.out.println(clean.apply(\"  hello  \"));  // \"HELLO\""
                  }
        ],
        tips: [
                  "Use method references (String::length) instead of lambdas when the lambda just calls one method.",
                  "Compose with andThen() (left-to-right) and compose() (right-to-left) for clean pipelines.",
                  "Use primitive specializations (IntPredicate, LongFunction) to avoid autoboxing overhead.",
                  "@FunctionalInterface annotation enforces that an interface has exactly one abstract method."
        ],
        mistake: "Writing custom functional interfaces when java.util.function already has one — check Predicate, Function, Consumer, Supplier and their Bi/primitive variants first.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.function.*;\n// More explicit but longer",
          concise: "// inline",
        },
      },
      {
        id: "comparable-comparator",
        fn: "Comparable & Comparator",
        desc: "Define natural ordering (Comparable) and custom sorting (Comparator) for objects.",
        category: "Functional",
        subtitle: "Sort objects with natural and custom orderings",
        signature: "implements Comparable<T>  |  Comparator.comparing(keyExtractor)",
        descLong: "Comparable defines a type's natural ordering via compareTo(). Comparator defines external, pluggable sort orders. Java 8+ Comparator has powerful static factory methods: comparing(), thenComparing(), reversed(), nullsFirst(). Use Comparable for the obvious default sort; use Comparator for alternative sorts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Comparable & Comparator — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.stream.*;\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Comparable & Comparator — common patterns you'll see in production.\n// APPROACH  - Combine Comparable & Comparator with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Comparable — natural ordering\npublic class Employee implements Comparable<Employee> {\n    String name;\n    int salary;\n    String dept;\n\n    @Override\n    public int compareTo(Employee other) {\n        return Integer.compare(this.salary, other.salary);  // natural: by salary\n    }\n}\n\nList<Employee> emps = new ArrayList<>(/* ... */);\nCollections.sort(emps);  // uses natural ordering (compareTo)"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Comparable & Comparator — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Comparator — custom orderings (Java 8+),Comparator<Employee> byName = Comparator.comparing(e -> e.name);,Comparator<Employee> bySalaryDesc = Comparator.comparingInt(e -> e.salary).reversed();,Comparator<Employee> byDeptThenSalary = Comparator,    .comparing((Employee e) -> e.dept),    .thenComparingInt(e -> e.salary),    .reversed();,,emps.sort(byName);                    // sort by name,emps.sort(bySalaryDesc);             // sort by salary descending,emps.sort(byDeptThenSalary);         // multi-key sort,\n\n// Null-safe comparators,Comparator<Employee> nullSafe = Comparator.nullsLast(,    Comparator.comparing(e -> e.name),);,\n\n// Using with streams,emps.stream(),    .sorted(Comparator.comparing(e -> e.name)),    .forEach(System.out::println);,\n\n// Min/Max,Employee richest = Collections.max(emps);  // uses natural ordering,Employee alphabeticalFirst = Collections.min(emps, byName);"
                  }
        ],
        tips: [
                  "Use Comparator.comparing() with method references — much cleaner than manual compare logic.",
                  "Chain thenComparing() for multi-field sorts: by department, then by salary, then by name.",
                  "Comparator.nullsFirst() and nullsLast() handle null elements without NPE.",
                  "Always use Integer.compare(a, b) instead of a - b to avoid integer overflow bugs."
        ],
        mistake: "Returning a - b in compareTo() — this overflows for large values (e.g., Integer.MIN_VALUE - 1). Always use Integer.compare(a, b) or Comparator.comparingInt().",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.util.*;\n// More explicit but longer",
          concise: "// inline",
        },
      },
    ],
  },

  // ── Section 9: Annotations & Reflection ─────────────────────────────────────────
  {
    id: "annotations-reflection",
    title: "Annotations & Reflection",
    entries: [
      {
        id: "annotations",
        fn: "Annotations (Built-in & Custom)",
        desc: "Metadata markers that provide information to the compiler, runtime, or frameworks.",
        category: "Annotations",
        subtitle: "@Override, @Deprecated, @FunctionalInterface, custom annotations",
        signature: "@interface MyAnnotation { String value(); }  |  @MyAnnotation(\"x\")",
        descLong: "Annotations are metadata attached to classes, methods, fields, or parameters. Built-in: @Override (compiler check), @Deprecated (warning), @SuppressWarnings (silence warnings), @FunctionalInterface (enforce single abstract method). Frameworks like Spring, JPA, and JUnit rely heavily on custom annotations. Retention policy controls when they're available: SOURCE, CLASS, or RUNTIME.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Annotations (Built-in & Custom) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\nimport java.lang.annotation.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Annotations (Built-in & Custom) — common patterns you'll see in production.\n// APPROACH  - Combine Annotations (Built-in & Custom) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Built-in annotations\npublic class AnnotationExamples {\n\n    @Override                          // compiler verifies method exists in parent\n    public String toString() { return \"example\"; }\n\n    @Deprecated(since = \"2.0\", forRemoval = true)\n    public void oldMethod() { /* ... */ }\n\n    @SuppressWarnings(\"unchecked\")\n    public void rawTypes() {\n        List list = new ArrayList();   // warning suppressed\n    }\n\n    @FunctionalInterface\n    interface Transformer<T> {\n        T transform(T input);\n        // Adding a second abstract method here → compiler error\n    }\n}"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Annotations (Built-in & Custom) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom annotation,@Retention(RetentionPolicy.RUNTIME)    // available via reflection,@Target(ElementType.METHOD)            // can only go on methods,public @interface Timed {,    String value() default \"\";,    boolean logResult() default false;,},\n\n// Using custom annotation,public class Service {,    @Timed(value = \"fetchUsers\", logResult = true),    public List<User> getUsers() { /* ... */ return List.of(); },},\n\n// Processing at runtime via reflection,public class TimedProcessor {,    public static void process(Object obj) throws Exception {,        for (Method m : obj.getClass().getDeclaredMethods()) {,            if (m.isAnnotationPresent(Timed.class)) {,                Timed timed = m.getAnnotation(Timed.class);,                long start = System.nanoTime();,                Object result = m.invoke(obj);,                long elapsed = System.nanoTime() - start;,                System.out.printf(\"%s took %d ms%n\",,                    timed.value(), elapsed / 1_000_000);,                if (timed.logResult()) {,                    System.out.println(\"Result: \" + result);,                },            },        },    },}"
                  }
        ],
        tips: [
                  "@Retention(RUNTIME) is needed if you want to read annotations via reflection at runtime.",
                  "@Target restricts where an annotation can be placed — use it to prevent misuse.",
                  "Use default values in annotation elements to make most attributes optional.",
                  "Spring, JPA, JUnit, Lombok — all built on annotations. Understanding them unlocks the ecosystem."
        ],
        mistake: "Forgetting @Retention(RetentionPolicy.RUNTIME) on a custom annotation and then trying to read it via reflection — the default retention is CLASS, which is invisible at runtime.",
        shorthand: {
          verbose: "// Manual / verbose approach\nimport java.lang.annotation.*;\n// More explicit but longer",
          concise: "// inline",
        },
      },
    ],
  },
]

export default { meta, sections }
