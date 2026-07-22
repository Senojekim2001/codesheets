export const meta = {
  "id": "java-collections",
  "label": "Collections & Data Structures",
  "icon": "☕",
  "description": "Java Collections Framework: List, Set, Map, Queue, Deque, sorting, searching, and immutable collections."
}

export const sections = [

  // ── Section 1: Lists & Sets ─────────────────────────────────────────
  {
    id: "lists-sets",
    title: "Lists & Sets",
    entries: [
      {
        id: "list-implementations",
        fn: "List — ArrayList, LinkedList & List.of()",
        desc: "Ordered collections with index-based access — choosing between ArrayList, LinkedList, and immutable lists.",
        category: "Collections",
        subtitle: "ArrayList, LinkedList, List.of(), List.copyOf()",
        signature: "List<T> list = new ArrayList<>()  |  List.of(\"a\", \"b\")  |  list.get(i)",
        descLong: "List is the most common collection — ordered, index-accessible, allows duplicates. ArrayList (backed by array) is the default choice: O(1) random access, O(1) amortized add. LinkedList is rare: O(1) add/remove at ends but O(n) random access. List.of() (Java 9+) creates immutable lists. Use Collections.unmodifiableList() to wrap a mutable list as read-only. Always prefer List<T> as the declared type for flexibility.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of List — ArrayList, LinkedList & List.of() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of List — ArrayList, LinkedList & List.of() — common patterns you'll see in production.\n// APPROACH  - Combine List — ArrayList, LinkedList & List.of() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── ArrayList — the default choice ─────────────────\nList<String> names = new ArrayList<>();\nnames.add(\"Alice\");\nnames.add(\"Bob\");\nnames.add(\"Charlie\");\nnames.get(0);          // \"Alice\" — O(1)\nnames.set(1, \"Bobby\"); // replace at index\nnames.remove(\"Charlie\");\nnames.contains(\"Alice\"); // true — O(n)\nnames.size();            // 2"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of List — ArrayList, LinkedList & List.of() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Immutable lists (Java 9+) ──────────────────────,List<String> colors = List.of(\"red\", \"green\", \"blue\");,// colors.add(\"yellow\"); // UnsupportedOperationException!,,List<String> copy = List.copyOf(names); // immutable copy,\n\n// ── Useful operations ──────────────────────────────,Collections.sort(names);                    // natural order,names.sort(Comparator.reverseOrder());      // reverse,names.sort(Comparator.comparing(String::length)); // by length,\n\n// Stream operations,List<String> upper = names.stream(),    .filter(n -> n.length() > 3),    .map(String::toUpperCase),    .toList();  // Java 16+,\n\n// Iterate,for (String name : names) { System.out.println(name); },names.forEach(System.out::println);,\n\n// SubList (view, not copy!),List<String> sub = names.subList(0, 2); // [0, 2),\n\n// Convert array to list,String[] arr = {\"x\", \"y\", \"z\"};,List<String> fromArr = List.of(arr);        // immutable,List<String> mutable = new ArrayList<>(List.of(arr)); // mutable,\n\n// ── When to use LinkedList (rare) ──────────────────,// Only when you need O(1) add/remove at BOTH ends (use as Deque),Deque<String> deque = new LinkedList<>();,deque.addFirst(\"front\");,deque.addLast(\"back\");"
                  }
        ],
        tips: [
                  "ArrayList is the right choice 99% of the time — O(1) random access and cache-friendly memory layout.",
                  "List.of() creates truly immutable lists — use for constants and return values that shouldn't be modified.",
                  ".toList() (Java 16+) is shorter than .collect(Collectors.toList()) and returns an unmodifiable list.",
                  "Declare variables as List<T>, not ArrayList<T> — program to the interface for flexibility."
        ],
        mistake: "Using LinkedList for general-purpose lists — it has O(n) random access and worse cache performance than ArrayList. LinkedList is only useful as a Deque (double-ended queue).",
        shorthand: {
          verbose: "List<String> names = new ArrayList<>();\nnames.add(\"Alice\");\nnames.add(\"Bob\");\nnames.add(\"Charlie\");",
          concise: "List<String> names = List.of(\"Alice\", \"Bob\", \"Charlie\");\n// Immutable, concise",
        },
      },
      {
        id: "set-implementations",
        fn: "Set — HashSet, TreeSet & LinkedHashSet",
        desc: "Unique element collections — fast lookup with HashSet, sorted with TreeSet, insertion-ordered with LinkedHashSet.",
        category: "Collections",
        subtitle: "HashSet, TreeSet, LinkedHashSet, Set.of()",
        signature: "Set<T> set = new HashSet<>()  |  Set.of(\"a\", \"b\")  |  set.contains(x)",
        descLong: "Set stores unique elements — no duplicates. HashSet: O(1) add/remove/contains, unordered. TreeSet: O(log n) operations, sorted (implements NavigableSet). LinkedHashSet: O(1) operations, maintains insertion order. Set.of() (Java 9+) creates immutable sets. Sets rely on equals() and hashCode() — always override both in custom classes. Use EnumSet for enum values (very efficient bit-vector implementation).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Set — HashSet, TreeSet & LinkedHashSet — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Set — HashSet, TreeSet & LinkedHashSet — common patterns you'll see in production.\n// APPROACH  - Combine Set — HashSet, TreeSet & LinkedHashSet with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── HashSet — fast, unordered ──────────────────────\nSet<String> tags = new HashSet<>();\ntags.add(\"java\");\ntags.add(\"spring\");\ntags.add(\"java\");     // duplicate — ignored\ntags.size();           // 2\ntags.contains(\"java\"); // true — O(1)\ntags.remove(\"spring\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Set — HashSet, TreeSet & LinkedHashSet — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── TreeSet — sorted ───────────────────────────────,Set<Integer> sorted = new TreeSet<>();,sorted.addAll(List.of(5, 3, 8, 1, 9, 2));,// Iteration order: [1, 2, 3, 5, 8, 9],,NavigableSet<Integer> nav = new TreeSet<>(sorted);,nav.first();       // 1,nav.last();        // 9,nav.headSet(5);    // [1, 2, 3] — elements < 5,nav.tailSet(5);    // [5, 8, 9] — elements >= 5,nav.subSet(2, 8);  // [2, 3, 5] — [2, 8),\n\n// Custom sort order,Set<String> byLength = new TreeSet<>(,    Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()),);,\n\n// ── LinkedHashSet — insertion order ────────────────,Set<String> ordered = new LinkedHashSet<>();,ordered.add(\"first\");,ordered.add(\"second\");,ordered.add(\"third\");,// Iteration: \"first\", \"second\", \"third\" (always),\n\n// ── Immutable sets (Java 9+) ──────────────────────,Set<String> immutable = Set.of(\"a\", \"b\", \"c\");,// immutable.add(\"d\"); // UnsupportedOperationException!,\n\n// ── Set operations ─────────────────────────────────,Set<String> a = new HashSet<>(Set.of(\"x\", \"y\", \"z\"));,Set<String> b = Set.of(\"y\", \"z\", \"w\");,\n\n// Union,Set<String> union = new HashSet<>(a);,union.addAll(b);        // [x, y, z, w],\n\n// Intersection,Set<String> inter = new HashSet<>(a);,inter.retainAll(b);     // [y, z],\n\n// Difference,Set<String> diff = new HashSet<>(a);,diff.removeAll(b);      // [x],\n\n// ── EnumSet — optimized for enums ──────────────────,enum Day { MON, TUE, WED, THU, FRI, SAT, SUN },Set<Day> weekdays = EnumSet.range(Day.MON, Day.FRI);,Set<Day> weekend = EnumSet.of(Day.SAT, Day.SUN);"
                  }
        ],
        tips: [
                  "HashSet is the default choice — O(1) for add/remove/contains. Use TreeSet only when you need sorted iteration.",
                  "Always override both equals() AND hashCode() for custom objects in Sets — inconsistent implementations cause lost elements.",
                  "EnumSet is backed by a bit vector — extremely fast and memory-efficient for enum flags.",
                  "Set operations (union, intersection, difference) are one-liners with addAll, retainAll, removeAll."
        ],
        mistake: "Overriding equals() without hashCode() — two \"equal\" objects can end up in different hash buckets, so a Set may contain duplicates. Always override both together.",
        shorthand: {
          verbose: "Set<String> tags = new HashSet<>();\ntags.add(\"java\");\ntags.add(\"spring\");\ntags.add(\"java\");",
          concise: "Set<String> tags = Set.of(\"java\", \"spring\");",
        },
      },
    ],
  },

  // ── Section 2: Maps ─────────────────────────────────────────
  {
    id: "maps",
    title: "Maps",
    entries: [
      {
        id: "map-implementations",
        fn: "Map — HashMap, TreeMap & Modern API",
        desc: "Key-value pairs with O(1) lookup — HashMap for speed, TreeMap for sorted keys, plus modern compute/merge methods.",
        category: "Collections",
        subtitle: "HashMap, TreeMap, LinkedHashMap, Map.of(), computeIfAbsent",
        signature: "Map<K,V> map = new HashMap<>()  |  map.getOrDefault(k, v)  |  map.computeIfAbsent(k, fn)",
        descLong: "Map stores key-value pairs. HashMap: O(1) get/put, unordered. TreeMap: O(log n), sorted by keys. LinkedHashMap: O(1), insertion-ordered. Map.of() (Java 9+) creates immutable maps. Modern API (Java 8+): getOrDefault avoids null checks, computeIfAbsent lazily creates values, merge combines values, forEach/replaceAll for bulk operations. ConcurrentHashMap for thread-safe access.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Map — HashMap, TreeMap & Modern API — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;\nimport java.util.concurrent.ConcurrentHashMap;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Map — HashMap, TreeMap & Modern API — common patterns you'll see in production.\n// APPROACH  - Combine Map — HashMap, TreeMap & Modern API with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── HashMap — the default ──────────────────────────\nMap<String, Integer> scores = new HashMap<>();\nscores.put(\"Alice\", 95);\nscores.put(\"Bob\", 87);\nscores.get(\"Alice\");              // 95\nscores.getOrDefault(\"Charlie\", 0); // 0 (no null!)\nscores.containsKey(\"Bob\");        // true\nscores.remove(\"Bob\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Map — HashMap, TreeMap & Modern API — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Immutable maps (Java 9+) ──────────────────────,Map<String, Integer> config = Map.of(,    \"port\", 8080,,    \"timeout\", 30,,    \"retries\", 3,);,\n\n// More than 10 entries: use Map.ofEntries,Map<String, String> env = Map.ofEntries(,    Map.entry(\"HOST\", \"localhost\"),,    Map.entry(\"PORT\", \"8080\"),,    Map.entry(\"DEBUG\", \"true\"),);,\n\n// ── Modern Map API (Java 8+) ──────────────────────,// computeIfAbsent — lazily create value,Map<String, List<String>> groups = new HashMap<>();,groups.computeIfAbsent(\"team-a\", k -> new ArrayList<>()).add(\"Alice\");,groups.computeIfAbsent(\"team-a\", k -> new ArrayList<>()).add(\"Bob\");,// {\"team-a\": [\"Alice\", \"Bob\"]},\n\n// merge — combine values,Map<String, Integer> wordCount = new HashMap<>();,for (String word : words) {,    wordCount.merge(word, 1, Integer::sum);,    // If absent: put(word, 1). If present: put(word, old + 1),},\n\n// putIfAbsent — only set if missing,scores.putIfAbsent(\"Charlie\", 0); // set only if not present,\n\n// replaceAll — transform all values,scores.replaceAll((name, score) -> score + 5); // curve all scores,\n\n// forEach,scores.forEach((name, score) ->,    System.out.printf(\"%s: %d%n\", name, score));,\n\n// ── TreeMap — sorted by keys ──────────────────────,Map<String, Integer> sorted = new TreeMap<>(scores);,// Iteration: keys in alphabetical order,,NavigableMap<String, Integer> nav = new TreeMap<>(scores);,nav.firstKey();              // smallest key,nav.lastKey();               // largest key,nav.headMap(\"D\");            // keys < \"D\",nav.subMap(\"A\", \"M\");        // keys in [A, M),\n\n// ── ConcurrentHashMap — thread-safe ────────────────,Map<String, Integer> concurrent = new ConcurrentHashMap<>();,concurrent.compute(\"key\", (k, v) -> v == null ? 1 : v + 1); // atomic,\n\n// ── Iteration patterns ─────────────────────────────,for (Map.Entry<String, Integer> entry : scores.entrySet()) {,    String key = entry.getKey();,    int value = entry.getValue();,},\n\n// Stream a map,Map<String, Integer> filtered = scores.entrySet().stream(),    .filter(e -> e.getValue() > 90),    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));"
                  }
        ],
        tips: [
                  "getOrDefault(key, default) eliminates null checks — always returns a usable value.",
                  "computeIfAbsent is perfect for Map<K, List<V>> patterns — creates the list lazily on first access.",
                  "merge(key, value, remappingFn) is the cleanest word-count/accumulate pattern — one line instead of if/else.",
                  "ConcurrentHashMap.compute() is atomic — safe for concurrent counters without external synchronization."
        ],
        mistake: "Using get() without null check: int x = map.get(\"key\") will throw NullPointerException if key is missing (auto-unboxing null to int). Use getOrDefault() or containsKey() first.",
        shorthand: {
          verbose: "Map<String, Integer> scores = new HashMap<>();\nscores.put(\"Alice\", 95);\nscores.get(\"Alice\");",
          concise: "Map<String, Integer> config = Map.of(\"port\", 8080, \"timeout\", 30);",
        },
      },
    ],
  },

  // ── Section 3: Queues & Algorithms ─────────────────────────────────────────
  {
    id: "queues-algorithms",
    title: "Queues & Algorithms",
    entries: [
      {
        id: "queue-deque",
        fn: "Queue, Deque & PriorityQueue",
        desc: "FIFO queues, double-ended queues, and priority queues for task scheduling and graph algorithms.",
        category: "Collections",
        subtitle: "Queue, Deque, ArrayDeque, PriorityQueue",
        signature: "Queue<T> q = new ArrayDeque<>()  |  q.offer(x)  |  q.poll()",
        descLong: "Queue is FIFO: offer/add to enqueue, poll/remove to dequeue, peek to inspect. ArrayDeque is the best general-purpose Queue AND Deque (double-ended queue) — faster than LinkedList for both. PriorityQueue is a min-heap: poll() always returns the smallest element. Use for BFS, task scheduling, event processing, and Dijkstra's algorithm. BlockingQueue (java.util.concurrent) for producer-consumer patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Queue, Deque & PriorityQueue — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Queue, Deque & PriorityQueue — common patterns you'll see in production.\n// APPROACH  - Combine Queue, Deque & PriorityQueue with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Queue (FIFO) — use ArrayDeque ──────────────────\nQueue<String> queue = new ArrayDeque<>();\nqueue.offer(\"first\");     // add to tail\nqueue.offer(\"second\");\nqueue.offer(\"third\");\nqueue.peek();             // \"first\" (doesn't remove)\nqueue.poll();             // \"first\" (removes)\nqueue.poll();             // \"second\"\nqueue.isEmpty();          // false"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Queue, Deque & PriorityQueue — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// ── Deque (double-ended) ───────────────────────────,Deque<String> deque = new ArrayDeque<>();,deque.offerFirst(\"A\");    // add to front,deque.offerLast(\"B\");     // add to back,deque.peekFirst();        // \"A\",deque.peekLast();         // \"B\",deque.pollFirst();        // \"A\" (remove from front),deque.pollLast();         // \"B\" (remove from back),\n\n// Use as a stack (LIFO),Deque<Integer> stack = new ArrayDeque<>();,stack.push(1);    // same as offerFirst,stack.push(2);,stack.push(3);,stack.pop();      // 3 (same as pollFirst),stack.peek();     // 2,\n\n// ── PriorityQueue (min-heap) ───────────────────────,PriorityQueue<Integer> pq = new PriorityQueue<>();,pq.offer(5);,pq.offer(1);,pq.offer(3);,pq.poll();  // 1 (always returns smallest),pq.poll();  // 3,pq.poll();  // 5,\n\n// Max-heap,PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());,\n\n// Custom priority,record Task(String name, int priority) {},PriorityQueue<Task> taskQueue = new PriorityQueue<>(,    Comparator.comparingInt(Task::priority),);,taskQueue.offer(new Task(\"Low\", 3));,taskQueue.offer(new Task(\"High\", 1));,taskQueue.offer(new Task(\"Med\", 2));,taskQueue.poll().name();  // \"High\" (priority 1 = highest),\n\n// ── BFS with Queue ─────────────────────────────────,void bfs(Map<String, List<String>> graph, String start) {,    Queue<String> queue = new ArrayDeque<>();,    Set<String> visited = new HashSet<>();,    queue.offer(start);,    visited.add(start);,,    while (!queue.isEmpty()) {,        String node = queue.poll();,        System.out.println(node);,        for (String neighbor : graph.getOrDefault(node, List.of())) {,            if (visited.add(neighbor)) {,                queue.offer(neighbor);,            },        },    },}"
                  }
        ],
        tips: [
                  "Use ArrayDeque for both Queue and Stack — it's faster than LinkedList and Stack (which is legacy).",
                  "offer/poll/peek return null on failure; add/remove/element throw exceptions — prefer the safe versions.",
                  "PriorityQueue is a min-heap by default — use Comparator.reverseOrder() for a max-heap.",
                  "Never use java.util.Stack — it extends Vector (synchronized, slow). Use ArrayDeque as a stack instead."
        ],
        mistake: "Using LinkedList as a Queue — ArrayDeque is faster: no node allocations, better cache locality, and lower memory overhead. LinkedList allocates a new object for every element.",
        shorthand: {
          verbose: "Stack<Integer> stack = new Stack<>();\nstack.push(1);\nstack.pop();",
          concise: "Deque<Integer> stack = new ArrayDeque<>();\nstack.push(1);\nstack.pop();",
        },
      },
      {
        id: "collections-utility",
        fn: "Collections Utility & Algorithms",
        desc: "Sorting, searching, shuffling, frequency counting, and creating synchronized/unmodifiable wrappers.",
        category: "Algorithms",
        subtitle: "Collections.sort, binarySearch, frequency, unmodifiable*",
        signature: "Collections.sort(list)  |  Collections.binarySearch(list, key)  |  Collections.frequency(c, o)",
        descLong: "The Collections utility class provides algorithms and factory methods. sort() and binarySearch() for sorted data. frequency() counts occurrences. min()/max() find extremes. shuffle() randomizes. unmodifiableList/Set/Map create read-only views. synchronizedList/Set/Map add thread safety (prefer ConcurrentHashMap for maps). checkedList/Set/Map add runtime type checking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Collections Utility & Algorithms — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport java.util.*;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Collections Utility & Algorithms — common patterns you'll see in production.\n// APPROACH  - Combine Collections Utility & Algorithms with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// ── Sorting ────────────────────────────────────────\nList<String> names = new ArrayList<>(List.of(\"Charlie\", \"Alice\", \"Bob\"));\nCollections.sort(names);  // [Alice, Bob, Charlie]"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Collections Utility & Algorithms — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Custom comparator,names.sort(Comparator.comparing(String::length),    .thenComparing(Comparator.naturalOrder()));,\n\n// Sort by multiple fields,record Employee(String name, String dept, int salary) {},List<Employee> employees = getEmployees();,employees.sort(Comparator,    .comparing(Employee::dept),    .thenComparingInt(Employee::salary),    .reversed());,\n\n// ── Searching ──────────────────────────────────────,// Binary search (list MUST be sorted!),Collections.sort(names);,int idx = Collections.binarySearch(names, \"Bob\");,// idx >= 0: found at that index,// idx < 0: not found, insertion point = -(idx + 1),\n\n// ── Statistics ─────────────────────────────────────,List<Integer> nums = List.of(3, 1, 4, 1, 5, 9, 2, 6, 5);,Collections.max(nums);          // 9,Collections.min(nums);          // 1,Collections.frequency(nums, 5); // 2,\n\n// ── Shuffle & rotate ──────────────────────────────,List<Integer> deck = new ArrayList<>();,for (int i = 0; i < 52; i++) deck.add(i);,Collections.shuffle(deck);         // random order,Collections.rotate(deck, 3);      // shift right by 3,\n\n// ── Unmodifiable wrappers ──────────────────────────,List<String> mutable = new ArrayList<>(List.of(\"a\", \"b\"));,List<String> readOnly = Collections.unmodifiableList(mutable);,// readOnly.add(\"c\"); // UnsupportedOperationException,\n\n// But mutable changes still visible through readOnly!,// For true immutability, use List.copyOf(mutable),\n\n// ── Synchronized wrappers ──────────────────────────,List<String> syncList = Collections.synchronizedList(new ArrayList<>());,// Thread-safe, but iteration still needs external sync:,synchronized (syncList) {,    for (String s : syncList) { /* safe iteration */ },},\n\n// ── Other utilities ────────────────────────────────,Collections.nCopies(5, \"x\");         // [\"x\", \"x\", \"x\", \"x\", \"x\"],Collections.disjoint(set1, set2);    // true if no common elements,Collections.swap(list, 0, 3);       // swap elements at indices,Collections.fill(list, \"default\");   // replace all elements,Collections.reverse(list);           // reverse in place"
                  }
        ],
        tips: [
                  "binarySearch requires a SORTED list — on unsorted data it returns garbage. Always sort first.",
                  "List.copyOf() is truly immutable; Collections.unmodifiableList() is just a read-only view that reflects source changes.",
                  "Comparator.comparing().thenComparing() chains sort criteria — no need for complex compare() methods.",
                  "Collections.frequency() is cleaner than streaming to count occurrences of a single element."
        ],
        mistake: "Using Collections.unmodifiableList() thinking it's immutable — it's a view. If the original list changes, the \"unmodifiable\" list reflects those changes. Use List.copyOf() for true immutability.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCollections.sort(list);\nint idx = Collections.binarySearch(list, key);\n// More explicit but longer",
          concise: "list.sort(Comparator.naturalOrder());\nint idx = Collections.binarySearch(list, key);",
        },
      },
    ],
  },
]

export default { meta, sections }
