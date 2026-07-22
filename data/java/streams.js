export const meta = {
  "id": "java-streams",
  "label": "Streams & Functional Programming",
  "icon": "🌊",
  "description": "Stream processing with functional operations, collectors, and data transformations."
}

export const sections = [

  // ── Section 1: Stream Creation ─────────────────────────────────────────
  {
    id: "stream-creation",
    title: "Stream Creation",
    entries: [
      {
        id: "stream-of",
        fn: "Stream.of()",
        desc: "Create a stream from individual values or an array.",
        category: "Creation",
        subtitle: "Explicit stream creation",
        signature: "Stream.of(value1, value2, ...)",
        descLong: "Stream.of() creates a stream from provided arguments. Useful for creating small, known datasets or converting arrays to streams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Stream.of() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.stream.Stream;\n\npublic class StreamOfExample {\n    public static void main(String[] args) {\n        // Stream from individual values\n        Stream<String> names = Stream.of(\"Alice\", \"Bob\", \"Charlie\", \"David\");\n        System.out.println(\"Stream of names:\");\n        names.forEach(name -> System.out.println(\"  \" + name));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Stream.of() — common patterns you'll see in production.\n// APPROACH  - Combine Stream.of() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Stream from array\n        String[] colors = {\"Red\", \"Green\", \"Blue\"};\n        Stream.of(colors)\n            .forEach(color -> System.out.println(\"Color: \" + color));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Stream.of() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Stream from integers,        Stream<Integer> numbers = Stream.of(1, 2, 3, 4, 5);,        long count = numbers.count();,        System.out.println(\"Count: \" + count);,\n\n        // Empty stream,        Stream<String> empty = Stream.empty();,        System.out.println(\"Empty stream size: \" + empty.count());,    },}"
                  }
        ],
        tips: [
                  "Stream.of() is useful for creating streams from known collections",
                  "Each element can be a different type if using Stream.of(Object)",
                  "Remember that streams are consumed after terminal operations"
        ],
        mistake: "Reusing a stream after a terminal operation (streams are one-time use).",
        shorthand: {
          verbose: "import java.util.stream.Stream;\n\npublic class StreamOfExample {\n    public static void main(String[]",
          concise: "// see verbose",
        },
      },
      {
        id: "arrays-stream",
        fn: "Arrays.stream()",
        desc: "Create a stream from an array.",
        category: "Creation",
        subtitle: "Array to stream conversion",
        signature: "Arrays.stream(array)",
        descLong: "Arrays.stream() converts arrays to streams, enabling functional processing of array data. Works with primitives and objects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Arrays.stream() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Arrays;\nimport java.util.stream.IntStream;\n\npublic class ArraysStreamExample {\n    public static void main(String[] args) {\n        // Stream from object array\n        String[] fruits = {\"Apple\", \"Banana\", \"Cherry\", \"Date\"};\n        Arrays.stream(fruits)\n            .filter(f -> f.length() > 5)\n            .forEach(f -> System.out.println(\"Long name: \" + f));"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Arrays.stream() — common patterns you'll see in production.\n// APPROACH  - Combine Arrays.stream() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Stream from primitive array\n        int[] numbers = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};\n        int sum = Arrays.stream(numbers)\n            .filter(n -> n % 2 == 0)\n            .sum();\n        System.out.println(\"Sum of even numbers: \" + sum);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Arrays.stream() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Double stream,        double[] prices = {9.99, 19.99, 29.99, 39.99};,        double average = Arrays.stream(prices).average().orElse(0.0);,        System.out.println(\"Average price: \" + average);,\n\n        // With range,        int[] range = IntStream.rangeClosed(1, 5).toArray();,        System.out.println(\"Range array: \" + Arrays.toString(range));,    },}"
                  }
        ],
        tips: [
                  "Arrays.stream() returns a typed stream (IntStream, DoubleStream, etc.) for primitives",
                  "Ranges can be specified with startInclusive and endExclusive",
                  "Use rangeClosed() for inclusive ranges"
        ],
        mistake: "Using a stream after a terminal operation like forEach() or collect().",
        shorthand: {
          verbose: "import java.util.Arrays;\nimport java.util.stream.IntStream;\n\npublic class ArraysStreamExample {\n    ",
          concise: "// see verbose",
        },
      },
      {
        id: "collection-stream",
        fn: "Collection.stream()",
        desc: "Create a stream from a collection (List, Set, etc.).",
        category: "Creation",
        subtitle: "Collection to stream conversion",
        signature: "collection.stream()",
        descLong: "All Java collections implement stream() method, enabling functional processing. Most common way to create streams from existing data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Collection.stream() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.HashSet;\nimport java.util.List;\nimport java.util.Set;\nimport java.util.stream.*;\n\npublic class CollectionStreamExample {\n    public static void main(String[] args) {\n        // Stream from List\n        List<String> countries = new ArrayList<>();\n        countries.add(\"Japan\");\n        countries.add(\"Brazil\");\n        countries.add(\"Germany\");\n        countries.add(\"Canada\");\n\n        System.out.println(\"From List:\");\n        countries.stream()\n            .filter(c -> c.length() > 5)\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Collection.stream() — common patterns you'll see in production.\n// APPROACH  - Combine Collection.stream() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Stream from Set\n        Set<Integer> ids = new HashSet<>();\n        ids.add(101);\n        ids.add(102);\n        ids.add(103);\n        ids.add(104);\n\n        System.out.println(\"\\nFrom Set:\");\n        ids.stream()\n            .filter(id -> id > 102)\n            .forEach(id -> System.out.println(\"ID: \" + id));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Collection.stream() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Stream from Map,        var scores = new HashMap<String, Integer>();,        scores.put(\"Alice\", 95);,        scores.put(\"Bob\", 87);,        scores.put(\"Charlie\", 92);,,        System.out.println(\"\\nFrom Map:\");,        scores.entrySet().stream(),            .filter(e -> e.getValue() > 90),            .forEach(e -> System.out.println(e.getKey() + \": \" + e.getValue()));,    },}"
                  }
        ],
        tips: [
                  "Use .stream() to convert any collection to a stream",
                  "For maps, use .entrySet().stream() to process key-value pairs",
                  "Streams do not modify the original collection"
        ],
        mistake: "Modifying the underlying collection while iterating with a stream.",
        shorthand: {
          verbose: "import java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.HashSet;\nimport java.util.Lis",
          concise: "// see verbose",
        },
      },
      {
        id: "intstream-range",
        fn: "IntStream.range()",
        desc: "Create a stream of integers in a specified range.",
        category: "Creation",
        subtitle: "Numeric range streams",
        signature: "IntStream.range(start, end) or IntStream.rangeClosed(start, end)",
        descLong: "IntStream.range() creates numeric streams for iterations. range() is exclusive at the end, rangeClosed() is inclusive.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of IntStream.range() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.stream.IntStream;\n\npublic class IntStreamRangeExample {\n    public static void main(String[] args) {\n        // range() - exclusive end\n        System.out.println(\"Range 0-5 (exclusive):\");\n        IntStream.range(0, 5)\n            .forEach(i -> System.out.print(i + \" \"));\n        System.out.println();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of IntStream.range() — common patterns you'll see in production.\n// APPROACH  - Combine IntStream.range() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// rangeClosed() - inclusive end\n        System.out.println(\"\\nRange 1-5 (inclusive):\");\n        IntStream.rangeClosed(1, 5)\n            .forEach(i -> System.out.print(i + \" \"));\n        System.out.println();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of IntStream.range() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Using range for calculations,        System.out.println(\"\\nSum of 1-10:\");,        int sum = IntStream.rangeClosed(1, 10).sum();,        System.out.println(\"Sum: \" + sum);,\n\n        // Filtering in range,        System.out.println(\"\\nEven numbers 1-20:\");,        IntStream.rangeClosed(1, 20),            .filter(n -> n % 2 == 0),            .forEach(n -> System.out.print(n + \" \"));,        System.out.println();,\n\n        // Counting in range,        long evenCount = IntStream.rangeClosed(1, 100),            .filter(n -> n % 2 == 0),            .count();,        System.out.println(\"\\nEven numbers 1-100: \" + evenCount);,    },}"
                  }
        ],
        tips: [
                  "Use range() when the end value should not be included",
                  "Use rangeClosed() when the end value should be included",
                  "IntStream operations are optimized for primitive integers"
        ],
        mistake: "Confusing inclusive vs exclusive range boundaries.",
        shorthand: {
          verbose: "import java.util.stream.IntStream;\n\npublic class IntStreamRangeExample {\n    public static void main",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Intermediate Operations ─────────────────────────────────────────
  {
    id: "stream-intermediate",
    title: "Intermediate Operations",
    entries: [
      {
        id: "filter",
        fn: "filter()",
        desc: "Keep only elements matching a predicate condition.",
        category: "Intermediate",
        subtitle: "Conditional filtering",
        signature: ".filter(predicate)",
        descLong: "filter() returns a stream containing only elements that match the given predicate. Useful for removing unwanted elements from data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of filter() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class FilterExample {\n    static class Product {\n        String name;\n        double price;\n\n        Product(String name, double price) {\n            this.name = name;\n            this.price = price;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" ($\" + price + \")\";\n        }\n    }"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of filter() — common patterns you'll see in production.\n// APPROACH  - Combine filter() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\npublic static void main(String[] args) {\n        List<Product> products = List.of(\n            new Product(\"Laptop\", 999.99),\n            new Product(\"Mouse\", 29.99),\n            new Product(\"Monitor\", 399.99),\n            new Product(\"Keyboard\", 79.99),\n            new Product(\"Desk\", 249.99)\n        );\n\n        System.out.println(\"All products:\");\n        products.stream().forEach(System.out::println);\n\n        System.out.println(\"\\nProducts under $100:\");\n        products.stream()\n            .filter(p -> p.price < 100)\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of filter() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nSystem.out.println(\"\\nProducts with long names:\");\n        products.stream()\n            .filter(p -> p.name.length() > 5)\n            .forEach(System.out::println);\n    }\n}"
                  }
        ],
        tips: [
                  "filter() returns a stream, allowing chaining with other operations",
                  "Use meaningful predicate names or extract to helper methods for clarity",
                  "Filtering is lazy - data is processed only when a terminal operation is called"
        ],
        mistake: "Using filter() with side effects instead of pure predicates.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class FilterExample {\n    static class Pro",
          concise: "// see verbose",
        },
      },
      {
        id: "map",
        fn: "map()",
        desc: "Transform each element using a mapping function.",
        category: "Intermediate",
        subtitle: "Element transformation",
        signature: ".map(function)",
        descLong: "map() applies a function to each element, producing a new stream with transformed values. Common for extracting properties or type conversion.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of map() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class MapExample {\n    static class Person {\n        String name;\n        int age;\n\n        Person(String name, int age) {\n            this.name = name;\n            this.age = age;\n        }\n    }\n\n    public static void main(String[] args) {\n        List<Person> people = List.of(\n            new Person(\"Alice\", 30),\n            new Person(\"Bob\", 25),\n            new Person(\"Charlie\", 35),\n            new Person(\"David\", 28)\n        );"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of map() — common patterns you'll see in production.\n// APPROACH  - Combine map() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Map to strings\n        System.out.println(\"Names:\");\n        people.stream()\n            .map(p -> p.name)\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of map() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Map to different type,        System.out.println(\"\\nAges:\");,        people.stream(),            .map(p -> p.age),            .forEach(System.out::println);,\n\n        // Chained transformations,        System.out.println(\"\\nUppercase names:\");,        people.stream(),            .map(p -> p.name),            .map(String::toUpperCase),            .forEach(System.out::println);,\n\n        // Complex mapping,        System.out.println(\"\\nFormatted output:\");,        people.stream(),            .map(p -> p.name + \" is \" + p.age + \" years old\"),            .forEach(System.out::println);,    },}"
                  }
        ],
        tips: [
                  "Use map() to transform elements to a different type or extract properties",
                  "map() can be chained for multiple transformations",
                  "Use flatMap() when the mapping function returns a stream"
        ],
        mistake: "Using map() with operations that modify original objects (use peek() instead).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class MapExample {\n    static class Person",
          concise: "// see verbose",
        },
      },
      {
        id: "flatmap",
        fn: "flatMap()",
        desc: "Transform elements and flatten nested streams into a single stream.",
        category: "Intermediate",
        subtitle: "Flattening nested structures",
        signature: ".flatMap(function)",
        descLong: "flatMap() applies a function that returns a stream for each element, then concatenates all streams into one. Essential for handling nested collections.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of flatMap() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class FlatMapExample {\n    public static void main(String[] args) {\n        // Flattening lists\n        List<String> words = List.of(\"hello\", \"world\");\n        System.out.println(\"Characters from words:\");\n        words.stream()\n            .flatMap(word -> Arrays.stream(word.split(\"\")))\n            .forEach(c -> System.out.print(c + \" \"));\n        System.out.println();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of flatMap() — common patterns you'll see in production.\n// APPROACH  - Combine flatMap() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Nested collections\n        List<List<Integer>> matrix = List.of(\n            List.of(1, 2, 3),\n            List.of(4, 5, 6),\n            List.of(7, 8, 9)\n        );\n        System.out.println(\"\\nFlattened matrix:\");\n        matrix.stream()\n            .flatMap(List::stream)\n            .forEach(n -> System.out.print(n + \" \"));\n        System.out.println();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of flatMap() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Complex flattening,        List<String> sentences = List.of(,            \"Hello world\",,            \"Java streams\",,            \"Functional programming\",        );,        System.out.println(\"\\nAll words:\");,        sentences.stream(),            .flatMap(s -> Arrays.stream(s.split(\" \"))),            .forEach(System.out::println);,    },}"
                  }
        ],
        tips: [
                  "Use flatMap() when your mapping function returns a stream",
                  "flatMap() is useful for handling nested collections and Optional values",
                  "FlatMap can be used with Optional.stream() (Java 9+) for null-safe operations"
        ],
        mistake: "Using map() instead of flatMap() when the function returns a stream.",
        shorthand: {
          verbose: "import java.util.Arrays;\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class FlatMapExam",
          concise: "// see verbose",
        },
      },
      {
        id: "sorted",
        fn: "sorted()",
        desc: "Sort stream elements in natural or custom order.",
        category: "Intermediate",
        subtitle: "Stream sorting",
        signature: ".sorted() or .sorted(comparator)",
        descLong: "sorted() returns a stream with elements sorted according to natural order or a provided Comparator. Elements must be comparable or a Comparator must be provided.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sorted() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class SortedExample {\n    static class Employee {\n        String name;\n        double salary;\n\n        Employee(String name, double salary) {\n            this.name = name;\n            this.salary = salary;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" (\" + salary + \")\";\n        }\n    }\n\n    public static void main(String[] args) {\n        // Natural order (Comparable)\n        List<String> fruits = List.of(\"Banana\", \"Apple\", \"Cherry\", \"Date\");\n        System.out.println(\"Sorted fruits:\");\n        fruits.stream()\n            .sorted()\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sorted() — common patterns you'll see in production.\n// APPROACH  - Combine sorted() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Numbers sorted\n        System.out.println(\"\\nSorted numbers:\");\n        List.of(5, 2, 8, 1, 9).stream()\n            .sorted()\n            .forEach(System.out::print);\n        System.out.println();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sorted() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reverse order,        System.out.println(\"\\nReverse order:\");,        List.of(3, 1, 4, 1, 5, 9).stream(),            .sorted((a, b) -> b - a),            .forEach(System.out::print);,        System.out.println();,\n\n        // Custom sorting with objects,        List<Employee> employees = List.of(,            new Employee(\"Alice\", 70000),,            new Employee(\"Bob\", 65000),,            new Employee(\"Charlie\", 75000),        );,,        System.out.println(\"\\nEmployees by salary (ascending):\");,        employees.stream(),            .sorted((e1, e2) -> Double.compare(e1.salary, e2.salary)),            .forEach(System.out::println);,,        System.out.println(\"\\nEmployees by name:\");,        employees.stream(),            .sorted((e1, e2) -> e1.name.compareTo(e2.name)),            .forEach(System.out::println);,    },}"
                  }
        ],
        tips: [
                  "Use sorted() without arguments for natural ordering",
                  "Provide a Comparator for custom sorting logic",
                  "Sorting is expensive for large datasets; apply other filters first"
        ],
        mistake: "Sorting non-comparable objects without providing a Comparator.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class SortedExample {\n    static class Emp",
          concise: "// see verbose",
        },
      },
      {
        id: "distinct",
        fn: "distinct()",
        desc: "Remove duplicate elements from the stream.",
        category: "Intermediate",
        subtitle: "Deduplication",
        signature: ".distinct()",
        descLong: "distinct() returns a stream with only unique elements. Uses equals() and hashCode() for comparison. Useful for removing duplicates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of distinct() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class DistinctExample {\n    static class Person {\n        String name;\n\n        Person(String name) {\n            this.name = name;\n        }\n\n        @Override\n        public String toString() {\n            return name;\n        }\n\n        @Override\n        public boolean equals(Object obj) {\n            if (this == obj) return true;\n            if (obj == null || getClass() != obj.getClass()) return false;\n            Person person = (Person) obj;\n            return name.equals(person.name);\n        }\n\n        @Override\n        public int hashCode() {\n            return name.hashCode();\n        }\n    }\n\n    public static void main(String[] args) {\n        // Distinct primitives\n        System.out.println(\"Distinct numbers:\");\n        List.of(1, 2, 2, 3, 3, 3, 4, 5, 5).stream()\n            .distinct()\n            .forEach(System.out::print);\n        System.out.println();"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of distinct() — common patterns you'll see in production.\n// APPROACH  - Combine distinct() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Distinct strings\n        System.out.println(\"\\nDistinct words:\");\n        List.of(\"apple\", \"banana\", \"apple\", \"cherry\", \"banana\").stream()\n            .distinct()\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of distinct() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Distinct objects,        System.out.println(\"\\nDistinct people:\");,        List<Person> people = List.of(,            new Person(\"Alice\"),,            new Person(\"Bob\"),,            new Person(\"Alice\"),,            new Person(\"Charlie\"),        );,        people.stream(),            .distinct(),            .forEach(System.out::println);,    },}"
                  }
        ],
        tips: [
                  "distinct() requires proper equals() and hashCode() implementation",
                  "For objects, use records or ensure correct equals/hashCode methods",
                  "distinct() maintains encounter order (first occurrence is kept)"
        ],
        mistake: "Using distinct() without implementing equals() and hashCode().",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class DistinctExample {\n    static class P",
          concise: "// see verbose",
        },
      },
      {
        id: "peek",
        fn: "peek()",
        desc: "Perform a side effect for each element without modifying the stream.",
        category: "Intermediate",
        subtitle: "Debugging and side effects",
        signature: ".peek(consumer)",
        descLong: "peek() executes a Consumer for each element without transforming the stream. Useful for debugging and logging without interrupting the pipeline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of peek() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class PeekExample {\n    public static void main(String[] args) {\n        // Using peek for debugging\n        System.out.println(\"Processing with peek:\");\n        List.of(1, 2, 3, 4, 5).stream()\n            .peek(n -> System.out.println(\"  Raw: \" + n))\n            .filter(n -> n % 2 == 0)\n            .peek(n -> System.out.println(\"  After filter: \" + n))\n            .map(n -> n * 10)\n            .peek(n -> System.out.println(\"  After map: \" + n))\n            .forEach(System.out::println);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of peek() — common patterns you'll see in production.\n// APPROACH  - Combine peek() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Peek doesn't interrupt the stream\n        System.out.println(\"\\nAll steps:\");\n        var result = List.of(\"a\", \"bb\", \"ccc\", \"dddd\").stream()\n            .peek(s -> System.out.print(\"[\" + s + \"] \"))\n            .filter(s -> s.length() > 1)\n            .peek(s -> System.out.print(\"-> filtered: \" + s + \" \"))"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of peek() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n.map(String::toUpperCase)\n            .peek(s -> System.out.print(\"-> uppercase: \" + s + \" \"))\n            .toList();\n        System.out.println();\n        System.out.println(\"Final result: \" + result);\n    }\n}"
                  }
        ],
        tips: [
                  "Use peek() primarily for debugging and monitoring stream operations",
                  "peek() is an intermediate operation; always chain a terminal operation",
                  "Avoid side effects that modify shared state (use pure functions instead)"
        ],
        mistake: "Relying on peek() to persist changes (peek is only for side effects).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class PeekExample {\n    public static void",
          concise: "// see verbose",
        },
      },
      {
        id: "limit-skip",
        fn: "limit() and skip()",
        desc: "Limit stream size and skip first n elements.",
        category: "Intermediate",
        subtitle: "Stream pagination",
        signature: ".limit(n) or .skip(n)",
        descLong: "limit() restricts stream to first n elements. skip() skips first n elements. Together they enable pagination and slicing of streams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of limit() and skip() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class LimitSkipExample {\n    public static void main(String[] args) {\n        var numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of limit() and skip() — common patterns you'll see in production.\n// APPROACH  - Combine limit() and skip() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// limit() - take first n\n        System.out.println(\"First 5 numbers:\");\n        numbers.stream()\n            .limit(5)\n            .forEach(System.out::print);\n        System.out.println();"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of limit() and skip() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// skip() - skip first n,        System.out.println(\"\\nSkip first 3:\");,        numbers.stream(),            .skip(3),            .forEach(System.out::print);,        System.out.println();,\n\n        // Pagination pattern,        System.out.println(\"\\nPagination (page 2, size 3):\");,        numbers.stream(),            .skip(3)      // page 2 starts at index 3,            .limit(3)     // take 3 elements,            .forEach(System.out::print);,        System.out.println();,\n\n        // Combine with other operations,        System.out.println(\"\\nEven numbers, skip 1, take 2:\");,        numbers.stream(),            .filter(n -> n % 2 == 0),            .skip(1),            .limit(2),            .forEach(System.out::print);,        System.out.println();,\n\n        // With strings,        System.out.println(\"\\nLongest 3 fruits:\");,        List.of(\"Apple\", \"Banana\", \"Cherry\", \"Date\", \"Elderberry\", \"Fig\").stream(),            .sorted((a, b) -> b.length() - a.length()),            .limit(3),            .forEach(System.out::println);,    },}"
                  }
        ],
        tips: [
                  "Use skip() + limit() for pagination: skip(pageNum * pageSize).limit(pageSize)",
                  "Both are lazy operations; they only process as many elements as needed",
                  "Applying filter() before skip()/limit() can reduce unnecessary processing"
        ],
        mistake: "Using wrong indices for pagination (off-by-one errors with 0-based indexing).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class LimitSkipExample {\n    public static",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Terminal Operations ─────────────────────────────────────────
  {
    id: "stream-terminal",
    title: "Terminal Operations",
    entries: [
      {
        id: "foreach",
        fn: "forEach()",
        desc: "Execute an action for each element in the stream.",
        category: "Terminal",
        subtitle: "Stream iteration",
        signature: ".forEach(consumer)",
        descLong: "forEach() is the simplest terminal operation, executing a Consumer for each element. Useful for printing, logging, or side effects.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of forEach() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class ForEachExample {\n    public static void main(String[] args) {\n        List<String> names = List.of(\"Alice\", \"Bob\", \"Charlie\", \"David\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of forEach() — common patterns you'll see in production.\n// APPROACH  - Combine forEach() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple forEach\n        System.out.println(\"Names:\");\n        names.stream().forEach(System.out::println);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of forEach() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// forEach with lambda,        System.out.println(\"\\nCapitalized:\");,        names.stream(),            .forEach(name -> System.out.println(\"  \" + name.toUpperCase()));,\n\n        // forEach with index (using custom method),        System.out.println(\"\\nWith index:\");,        names.stream(),            .collect(Collectors.toList()),            .forEach(name -> {,                int index = names.indexOf(name);,                System.out.println(\"[\" + index + \"] \" + name);,            });,\n\n        // forEach after filtering,        System.out.println(\"\\nLong names:\");,        List.of(1, 2, 3, 4, 5, 6).stream(),            .filter(n -> n > 3),            .forEach(n -> System.out.print(n + \" \"));,        System.out.println();,\n\n        // forEach doesn't return anything,        System.out.println(\"\\nProcessing and side effects:\");,        var total = new Object() { int sum = 0; };,        List.of(10, 20, 30).stream(),            .forEach(n -> {,                System.out.println(\"Processing: \" + n);,                total.sum += n;,            });,        System.out.println(\"Sum: \" + total.sum);,    },}"
                  }
        ],
        tips: [
                  "Use forEach() primarily for side effects like printing or logging",
                  "Prefer collect() when you need to gather results into a collection",
                  "forEach() is one of the few terminal operations that shouldn't return anything meaningful"
        ],
        mistake: "Using forEach() when you should use collect() to gather results.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.Collectors;\n\npublic class ForEachExample {\n    public",
          concise: "// see verbose",
        },
      },
      {
        id: "collect",
        fn: "collect()",
        desc: "Gather stream elements into a collection using a Collector.",
        category: "Terminal",
        subtitle: "Stream aggregation",
        signature: ".collect(collector)",
        descLong: "collect() is the most versatile terminal operation, using Collectors to transform streams into collections or other forms. Foundation for stream result gathering.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of collect() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class CollectExample {\n    public static void main(String[] args) {\n        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of collect() — common patterns you'll see in production.\n// APPROACH  - Combine collect() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Collect to List\n        System.out.println(\"Even numbers:\");\n        List<Integer> evens = numbers.stream()\n            .filter(n -> n % 2 == 0)\n            .collect(Collectors.toList());\n        System.out.println(evens);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of collect() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Collect to String (joining),        System.out.println(\"\\nJoined fruits:\");,        String joined = List.of(\"Apple\", \"Banana\", \"Cherry\").stream(),            .collect(Collectors.joining(\", \"));,        System.out.println(joined);,\n\n        // Collect to Map,        System.out.println(\"\\nNumbers to their squares:\");,        var squares = List.of(1, 2, 3, 4, 5).stream(),            .collect(Collectors.toMap(,                n -> n,,                n -> n * n,            ));,        System.out.println(squares);,\n\n        // Collect with transformation,        System.out.println(\"\\nUppercase names:\");,        List<String> names = List.of(\"alice\", \"bob\", \"charlie\");,        List<String> upper = names.stream(),            .map(String::toUpperCase),            .collect(Collectors.toList());,        System.out.println(upper);,    },}"
                  }
        ],
        tips: [
                  "collect() with Collectors.toList(), toSet(), toMap() covers most use cases",
                  "Custom collectors can be created for specialized aggregation",
                  "collect() materializes the stream into a concrete collection"
        ],
        mistake: "Using forEach() when collect() would be more appropriate.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.Collectors;\n\npublic class CollectExample {\n    public",
          concise: "// see verbose",
        },
      },
      {
        id: "reduce",
        fn: "reduce()",
        desc: "Reduce stream elements to a single value using an accumulator.",
        category: "Terminal",
        subtitle: "Stream reduction",
        signature: ".reduce(accumulator) or .reduce(identity, accumulator)",
        descLong: "reduce() combines stream elements step-by-step into a single result using an accumulator function. Essential for aggregations like sum or product.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of reduce() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.Optional;\nimport java.util.stream.*;\n\npublic class ReduceExample {\n    public static void main(String[] args) {\n        List<Integer> numbers = List.of(1, 2, 3, 4, 5);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of reduce() — common patterns you'll see in production.\n// APPROACH  - Combine reduce() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple reduce - sum\n        System.out.println(\"Sum:\");\n        Optional<Integer> sum = numbers.stream()\n            .reduce((a, b) -> a + b);\n        System.out.println(\"Total: \" + sum.orElse(0));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of reduce() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Reduce with identity (default value),        System.out.println(\"\\nSum with identity:\");,        int total = numbers.stream(),            .reduce(0, (a, b) -> a + b);,        System.out.println(\"Total: \" + total);,\n\n        // Reduce for product,        System.out.println(\"\\nProduct:\");,        int product = numbers.stream(),            .reduce(1, (a, b) -> a * b);,        System.out.println(\"Product: \" + product);,\n\n        // Reduce for string concatenation,        System.out.println(\"\\nConcatenation:\");,        String concat = List.of(\"a\", \"b\", \"c\", \"d\").stream(),            .reduce(\"\", (a, b) -> a + b);,        System.out.println(\"Result: \" + concat);,\n\n        // Reduce to find max,        System.out.println(\"\\nMaximum:\");,        Optional<Integer> max = numbers.stream(),            .reduce((a, b) -> a > b ? a : b);,        System.out.println(\"Max: \" + max.orElse(Integer.MIN_VALUE));,\n\n        // Reduce with filtering,        System.out.println(\"\\nSum of evens:\");,        int evenSum = numbers.stream(),            .filter(n -> n % 2 == 0),            .reduce(0, Integer::sum);,        System.out.println(\"Sum of even: \" + evenSum);,    },}"
                  }
        ],
        tips: [
                  "Use reduce() for custom aggregations (sum, product, concatenation)",
                  "Always provide an identity value to avoid Optional complexity when possible",
                  "Use sum(), max(), min() when available instead of reduce()"
        ],
        mistake: "Using reduce() for simple operations like sum when IntStream.sum() exists.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.Optional;\nimport java.util.stream.*;\n\npublic class ReduceExa",
          concise: "// see verbose",
        },
      },
      {
        id: "count",
        fn: "count()",
        desc: "Count the number of elements in the stream.",
        category: "Terminal",
        subtitle: "Element counting",
        signature: ".count()",
        descLong: "count() returns the number of elements in the stream as a long. Simple but powerful for counting filtered results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of count() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.*;\n\npublic class CountExample {\n    static class Product {\n        String name;\n        double price;\n        int stock;\n\n        Product(String name, double price, int stock) {\n            this.name = name;\n            this.price = price;\n            this.stock = stock;\n        }\n    }\n\n    public static void main(String[] args) {\n        // Simple count\n        System.out.println(\"Count elements:\");\n        long count = List.of(1, 2, 3, 4, 5).stream()\n            .count();\n        System.out.println(\"Total: \" + count);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of count() — common patterns you'll see in production.\n// APPROACH  - Combine count() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Count with filter\n        System.out.println(\"\\nCount even numbers:\");\n        long evenCount = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).stream()\n            .filter(n -> n % 2 == 0)\n            .count();\n        System.out.println(\"Even count: \" + evenCount);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of count() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Count filtered objects,        List<Product> products = List.of(,            new Product(\"Laptop\", 999.99, 5),,            new Product(\"Mouse\", 29.99, 50),,            new Product(\"Monitor\", 399.99, 0),,            new Product(\"Keyboard\", 79.99, 25),        );,,        System.out.println(\"\\nOut of stock products:\");,        long outOfStock = products.stream(),            .filter(p -> p.stock == 0),            .count();,        System.out.println(\"Count: \" + outOfStock);,,        System.out.println(\"\\nExpensive products (>$200):\");,        long expensive = products.stream(),            .filter(p -> p.price > 200),            .count();,        System.out.println(\"Count: \" + expensive);,    },}"
                  }
        ],
        tips: [
                  "Use count() to find the number of filtered elements",
                  "count() is often used after filter() operations",
                  "For simple conditions, count() is clearer than collecting to a list and checking size"
        ],
        mistake: "Collecting to a list just to call size() instead of using count().",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.*;\n\npublic class CountExample {\n    static class Prod",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Collectors for Complex Aggregations ─────────────────────────────────────────
  {
    id: "collectors",
    title: "Collectors for Complex Aggregations",
    entries: [
      {
        id: "tolist-toset",
        fn: "toList() and toSet()",
        desc: "Collect stream elements into a List or Set.",
        category: "Collectors",
        subtitle: "Collection aggregation",
        signature: "Collectors.toList() or Collectors.toSet()",
        descLong: "Most common collectors for gathering stream results. toList() maintains order; toSet() ensures uniqueness.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of toList() and toSet() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.Set;\nimport java.util.stream.Collectors;\n\npublic class ToListSetExample {\n    public static void main(String[] args) {\n        // toList()\n        System.out.println(\"Names to List:\");\n        List<String> names = List.of(\"Alice\", \"Bob\", \"Charlie\", \"Alice\").stream()\n            .collect(Collectors.toList());\n        System.out.println(\"List: \" + names);"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of toList() and toSet() — common patterns you'll see in production.\n// APPROACH  - Combine toList() and toSet() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// toSet() - removes duplicates\n        System.out.println(\"\\nNames to Set (unique):\");\n        Set<String> uniqueNames = List.of(\"Alice\", \"Bob\", \"Charlie\", \"Alice\").stream()\n            .collect(Collectors.toSet());\n        System.out.println(\"Set: \" + uniqueNames);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of toList() and toSet() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Filtering then collecting,        System.out.println(\"\\nFiltered collection:\");,        List<Integer> evenNumbers = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).stream(),            .filter(n -> n % 2 == 0),            .collect(Collectors.toList());,        System.out.println(\"Even numbers: \" + evenNumbers);,\n\n        // Transform and collect,        System.out.println(\"\\nTransform to uppercase:\");,        List<String> upper = List.of(\"apple\", \"banana\", \"cherry\").stream(),            .map(String::toUpperCase),            .collect(Collectors.toList());,        System.out.println(\"Uppercase: \" + upper);,    },}"
                  }
        ],
        tips: [
                  "Use toList() for ordered collection of results",
                  "Use toSet() to automatically remove duplicates",
                  "Both are commonly used terminal operations in stream pipelines"
        ],
        mistake: "Using toSet() when order matters (sets are unordered).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.Set;\nimport java.util.stream.Collectors;\n\npublic class ToLis",
          concise: "// see verbose",
        },
      },
      {
        id: "tomap",
        fn: "toMap()",
        desc: "Collect stream elements into a Map.",
        category: "Collectors",
        subtitle: "Key-value mapping",
        signature: "Collectors.toMap(keyMapper, valueMapper)",
        descLong: "Transforms stream elements into a Map using key and value mapping functions. Powerful for creating lookup tables from streams.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of toMap() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class ToMapExample {\n    static class Person {\n        String id;\n        String name;\n        int age;\n\n        Person(String id, String name, int age) {\n            this.id = id;\n            this.name = name;\n            this.age = age;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" (\" + age + \")\";\n        }\n    }\n\n    public static void main(String[] args) {\n        List<Person> people = List.of(\n            new Person(\"P1\", \"Alice\", 30),\n            new Person(\"P2\", \"Bob\", 25),\n            new Person(\"P3\", \"Charlie\", 35)\n        );"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of toMap() — common patterns you'll see in production.\n// APPROACH  - Combine toMap() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Map ID to name\n        System.out.println(\"ID to Name:\");\n        Map<String, String> idToName = people.stream()\n            .collect(Collectors.toMap(\n                p -> p.id,\n                p -> p.name\n            ));\n        System.out.println(idToName);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of toMap() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Map name to age,        System.out.println(\"\\nName to Age:\");,        Map<String, Integer> nameToAge = people.stream(),            .collect(Collectors.toMap(,                p -> p.name,,                p -> p.age,            ));,        System.out.println(nameToAge);,\n\n        // Map object to itself (by ID),        System.out.println(\"\\nID to Object:\");,        Map<String, Person> idToPerson = people.stream(),            .collect(Collectors.toMap(,                p -> p.id,,                p -> p,            ));,        System.out.println(idToPerson);,\n\n        // With numbers,        System.out.println(\"\\nNumber to Square:\");,        Map<Integer, Integer> squares = List.of(1, 2, 3, 4, 5).stream(),            .collect(Collectors.toMap(,                n -> n,,                n -> n * n,            ));,        System.out.println(squares);,    },}"
                  }
        ],
        tips: [
                  "Use toMap() to create lookup tables from stream data",
                  "Handle duplicate keys with merge function or use Collectors.groupingBy()",
                  "toMap() throws exception on duplicate keys by default"
        ],
        mistake: "Using toMap() when stream has duplicate keys without handling the conflict.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class ToMap",
          concise: "// see verbose",
        },
      },
      {
        id: "groupingby",
        fn: "groupingBy()",
        desc: "Group stream elements by a classifier function.",
        category: "Collectors",
        subtitle: "Stream grouping",
        signature: "Collectors.groupingBy(classifier)",
        descLong: "groupingBy() partitions stream elements into groups based on a classifier function, returning a Map. Powerful for data analysis and summarization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of groupingBy() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class GroupingByExample {\n    static class Employee {\n        String name;\n        String department;\n        double salary;\n\n        Employee(String name, String department, double salary) {\n            this.name = name;\n            this.department = department;\n            this.salary = salary;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" ($\" + salary + \")\";\n        }\n    }\n\n    public static void main(String[] args) {\n        List<Employee> employees = List.of(\n            new Employee(\"Alice\", \"Engineering\", 85000),\n            new Employee(\"Bob\", \"Sales\", 65000),\n            new Employee(\"Charlie\", \"Engineering\", 90000),\n            new Employee(\"David\", \"Sales\", 70000),\n            new Employee(\"Eve\", \"HR\", 60000)\n        );"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of groupingBy() — common patterns you'll see in production.\n// APPROACH  - Combine groupingBy() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Group by department\n        System.out.println(\"Employees by department:\");\n        Map<String, List<Employee>> byDept = employees.stream()\n            .collect(Collectors.groupingBy(e -> e.department));\n        byDept.forEach((dept, emps) -> {\n            System.out.println(dept + \": \" + emps);\n        });"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of groupingBy() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Group by salary level,        System.out.println(\"\\nBy salary level:\");,        Map<String, List<Employee>> bySalary = employees.stream(),            .collect(Collectors.groupingBy(e -> e.salary > 75000 ? \"High\" : \"Low\"));,        bySalary.forEach((level, emps) -> {,            System.out.println(level + \": \" + emps);,        });,\n\n        // Counting per group,        System.out.println(\"\\nEmployee count by department:\");,        Map<String, Long> counts = employees.stream(),            .collect(Collectors.groupingBy(,                e -> e.department,,                Collectors.counting(),            ));,        System.out.println(counts);,    },}"
                  }
        ],
        tips: [
                  "Use groupingBy() to analyze and partition stream data by category",
                  "Combine with other collectors (counting(), summing()) for advanced aggregations",
                  "groupingBy() returns an immutable map by default"
        ],
        mistake: "Using groupingBy() when partitioningBy() would be simpler (binary classification).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class Group",
          concise: "// see verbose",
        },
      },
      {
        id: "partitioningby",
        fn: "partitioningBy()",
        desc: "Partition stream elements into true/false groups based on a predicate.",
        category: "Collectors",
        subtitle: "Binary partitioning",
        signature: "Collectors.partitioningBy(predicate)",
        descLong: "partitioningBy() divides stream into exactly two groups: elements satisfying the predicate and those that don't. Specialized version of groupingBy().",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of partitioningBy() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class PartitioningByExample {\n    static class Student {\n        String name;\n        int grade;\n\n        Student(String name, int grade) {\n            this.name = name;\n            this.grade = grade;\n        }\n\n        @Override\n        public String toString() {\n            return name + \" (\" + grade + \")\";\n        }\n    }\n\n    public static void main(String[] args) {\n        List<Student> students = List.of(\n            new Student(\"Alice\", 95),\n            new Student(\"Bob\", 70),\n            new Student(\"Charlie\", 85),\n            new Student(\"David\", 65),\n            new Student(\"Eve\", 90)\n        );"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of partitioningBy() — common patterns you'll see in production.\n// APPROACH  - Combine partitioningBy() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Partition by passing grade (>=80)\n        System.out.println(\"Students by passing grade:\");\n        Map<Boolean, List<Student>> byPass = students.stream()\n            .collect(Collectors.partitioningBy(s -> s.grade >= 80));\n        System.out.println(\"Passed (>=80): \" + byPass.get(true));\n        System.out.println(\"Failed (<80): \" + byPass.get(false));"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of partitioningBy() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Partition numbers,        System.out.println(\"\\nEven/Odd partition:\");,        Map<Boolean, List<Integer>> evenOdd = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10).stream(),            .collect(Collectors.partitioningBy(n -> n % 2 == 0));,        System.out.println(\"Even: \" + evenOdd.get(true));,        System.out.println(\"Odd: \" + evenOdd.get(false));,\n\n        // Counting partitions,        System.out.println(\"\\nPass count:\");,        Map<Boolean, Long> counts = students.stream(),            .collect(Collectors.partitioningBy(,                s -> s.grade >= 80,,                Collectors.counting(),            ));,        System.out.println(\"Passed: \" + counts.get(true));,        System.out.println(\"Failed: \" + counts.get(false));,    },}"
                  }
        ],
        tips: [
                  "Use partitioningBy() for binary (true/false) classifications",
                  "More readable than groupingBy() when you only have two groups",
                  "Combine with other collectors for counting or summing per partition"
        ],
        mistake: "Using partitioningBy() for multi-way classification (use groupingBy() instead).",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.Map;\nimport java.util.stream.Collectors;\n\npublic class Parti",
          concise: "// see verbose",
        },
      },
      {
        id: "joining",
        fn: "joining()",
        desc: "Concatenate stream strings with optional delimiters, prefix, and suffix.",
        category: "Collectors",
        subtitle: "String concatenation",
        signature: "Collectors.joining() or Collectors.joining(delimiter, prefix, suffix)",
        descLong: "joining() combines stream strings into a single string. Extremely useful for creating CSV, formatted lists, or any delimited output.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of joining() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.List;\nimport java.util.stream.Collectors;\n\npublic class JoiningExample {\n    public static void main(String[] args) {\n        List<String> fruits = List.of(\"Apple\", \"Banana\", \"Cherry\", \"Date\");"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of joining() — common patterns you'll see in production.\n// APPROACH  - Combine joining() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Simple join\n        System.out.println(\"Simple join:\");\n        String result1 = fruits.stream()\n            .collect(Collectors.joining());\n        System.out.println(result1);"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of joining() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Join with delimiter,        System.out.println(\"\\nWith comma delimiter:\");,        String result2 = fruits.stream(),            .collect(Collectors.joining(\", \"));,        System.out.println(result2);,\n\n        // Join with prefix and suffix,        System.out.println(\"\\nWith brackets:\");,        String result3 = fruits.stream(),            .collect(Collectors.joining(\", \", \"[\", \"]\"));,        System.out.println(result3);,\n\n        // CSV format,        System.out.println(\"\\nCSV format:\");,        List<String> data = List.of(\"John\", \"Doe\", \"john@example.com\", \"123 Main St\");,        String csv = data.stream(),            .collect(Collectors.joining(\"\",\"\", \"\"\", \"\"\"));,        System.out.println(csv);,\n\n        // Numbers as string,        System.out.println(\"\\nNumbers joined:\");,        String numStr = List.of(1, 2, 3, 4, 5).stream(),            .map(String::valueOf),            .collect(Collectors.joining(\"-\"));,        System.out.println(numStr);,    },}"
                  }
        ],
        tips: [
                  "Use joining() for creating delimited output (CSV, JSON, etc.)",
                  "Avoid joining().forEach() - joining() already produces the final string",
                  "For complex formatting, consider StringBuilder instead"
        ],
        mistake: "Using + concatenation in loops when joining() would be cleaner.",
        shorthand: {
          verbose: "import java.util.List;\nimport java.util.stream.Collectors;\n\npublic class JoiningExample {\n    public",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
