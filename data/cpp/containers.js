export const meta = {
  "id": "containers",
  "label": "STL Containers & Algorithms",
  "icon": "📦",
  "description": "Sequence and associative containers, standard algorithms, iterators, and ranges."
}

export const sections = [

  // ── Section 1: Sequence Containers ─────────────────────────────────────────
  {
    id: "sequence-containers",
    title: "Sequence Containers",
    entries: [
      {
        id: "vector",
        fn: "std::vector",
        desc: "Dynamic array with automatic memory management.",
        category: "Sequence Containers",
        subtitle: "Resizable array",
        signature: "std::vector<T> vec;",
        descLong: "std::vector is a contiguous dynamic array that grows automatically. Access is O(1), insertion at end is amortized O(1), insertion in middle is O(n). Use vector by default for most sequence needs. Pre-allocate with reserve() to avoid reallocations during growth.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::vector — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    // Construction\n    std::vector<int> nums{1, 2, 3, 4, 5};\n    std::vector<double> empty_vec;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::vector — common patterns you'll see in production.\n// APPROACH  - Combine std::vector with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Adding elements\n    empty_vec.push_back(1.1);\n    empty_vec.push_back(2.2);\n    empty_vec.emplace_back(3.3);  // construct in-place"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::vector — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Capacity management,    std::vector<int> reserved;,    reserved.reserve(100);  // allocate space for 100 without adding elements,    std::cout << \"Capacity: \" << reserved.capacity() << \"\\n\";,\n\n    // Access,    std::cout << \"First: \" << nums[0] << \", Last: \" << nums.back() << \"\\n\";,\n\n    // Iteration,    for (auto num : nums) {,        std::cout << num << \" \";,    },    std::cout << \"\\n\";,\n\n    // Size and modification,    std::cout << \"Size: \" << nums.size() << \"\\n\";,    nums.pop_back();  // remove last element,    nums.erase(nums.begin() + 1);  // remove at index 1,\n\n    // Finding,    auto it = std::find(nums.begin(), nums.end(), 3);,    if (it != nums.end()) {,        std::cout << \"Found 3 at position \" << std::distance(nums.begin(), it) << \"\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use vector as your default container for sequences.",
                  "Call reserve() before a loop that adds many elements to avoid reallocations.",
                  "Prefer emplace_back() over push_back() for non-trivial types."
        ],
        mistake: "Repeatedly pushing without pre-allocating; causes repeated reallocations.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    // Construction\n    std",
          concise: "// see verbose",
        },
      },
      {
        id: "array",
        fn: "std::array",
        desc: "Fixed-size array with STL interface (C++11).",
        category: "Sequence Containers",
        subtitle: "Fixed-size contiguous array",
        signature: "std::array<T, N> arr;",
        descLong: "std::array wraps a C-style array with an STL interface (iterators, size(), etc.). The size is a template parameter and is fixed at compile time. No heap allocation overhead; stored on the stack (use pointers for large arrays). Prefer std::array over C-style arrays for safety and convenience.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::array — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <array>\n#include <algorithm>\n\nint main() {\n    // Fixed-size array (size must be compile-time constant)\n    std::array<int, 5> arr{10, 20, 30, 40, 50};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::array — common patterns you'll see in production.\n// APPROACH  - Combine std::array with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Size is known at compile time\n    std::cout << \"Size: \" << arr.size() << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::array — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Iterators,    for (auto it = arr.begin(); it != arr.end(); ++it) {,        std::cout << *it << \" \";,    },    std::cout << \"\\n\";,\n\n    // Range-based for,    for (auto val : arr) {,        std::cout << val << \" \";,    },    std::cout << \"\\n\";,\n\n    // Access,    std::cout << \"arr[0] = \" << arr[0] << \"\\n\";,    std::cout << \"arr.front() = \" << arr.front() << \"\\n\";,    std::cout << \"arr.back() = \" << arr.back() << \"\\n\";,\n\n    // STL algorithms,    std::sort(arr.begin(), arr.end(), std::greater<int>());,    for (auto val : arr) {,        std::cout << val << \" \";,    },    std::cout << \"\\n\";,\n\n    // Fill,    arr.fill(0);,    for (auto val : arr) {,        std::cout << val << \" \";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::array for fixed-size sequences; it is as efficient as C arrays but safer.",
                  "Size must be a compile-time constant; use std::vector for dynamic sizes.",
                  "std::array is stack-allocated; avoid for very large sizes."
        ],
        mistake: "Using std::array with dynamic sizes (not possible). Use std::vector instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <array>\n#include <algorithm>\n\nint main() {\n    // Fixed-size array (siz",
          concise: "// see verbose",
        },
      },
      {
        id: "deque",
        fn: "std::deque",
        desc: "Double-ended queue: efficient insertion/removal at both ends.",
        category: "Sequence Containers",
        subtitle: "Double-ended queue",
        signature: "std::deque<T> dq;",
        descLong: "std::deque (double-ended queue) allows efficient O(1) insertion and removal at both ends. Access is O(1). Internal structure is a list of small fixed-size arrays for efficient space usage. Use deque when you frequently push/pop at both ends; otherwise, prefer vector.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::deque — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <deque>\n\nint main() {\n    std::deque<int> dq{1, 2, 3};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::deque — common patterns you'll see in production.\n// APPROACH  - Combine std::deque with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Efficient operations at both ends\n    dq.push_front(0);  // add at front: 0, 1, 2, 3\n    dq.push_back(4);   // add at back: 0, 1, 2, 3, 4\n\n    std::cout << \"Front: \" << dq.front() << \", Back: \" << dq.back() << \"\\n\";\n\n    dq.pop_front();  // remove from front: 1, 2, 3, 4\n    dq.pop_back();   // remove from back: 1, 2, 3"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::deque — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Random access (like vector),    std::cout << \"Index 1: \" << dq[1] << \"\\n\";,\n\n    // Iteration,    for (auto val : dq) {,        std::cout << val << \" \";,    },    std::cout << \"\\n\";,\n\n    // Size,    std::cout << \"Size: \" << dq.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use deque for queues and double-ended operations.",
                  "deque is more space-efficient than vector for frequent push_front/pop_front.",
                  "Access and iteration are as fast as vector; insertion in middle is slower."
        ],
        mistake: "Using deque when only push_back is needed; vector is simpler and sufficient.",
        shorthand: {
          verbose: "#include <iostream>\n#include <deque>\n\nint main() {\n    std::deque<int> dq{1, 2, 3};\n\n    // Efficien",
          concise: "// see verbose",
        },
      },
      {
        id: "list",
        fn: "std::list",
        desc: "Doubly-linked list: efficient insertion/removal anywhere.",
        category: "Sequence Containers",
        subtitle: "Linked list",
        signature: "std::list<T> lst;",
        descLong: "std::list is a doubly-linked list allowing O(1) insertion and removal at any position (given an iterator). Random access is O(n). Use list only when frequent insertion/removal in the middle is required; prefer vector or deque otherwise (better cache locality).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::list — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <list>\n#include <algorithm>\n\nint main() {\n    std::list<int> lst{1, 2, 3, 4, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::list — common patterns you'll see in production.\n// APPROACH  - Combine std::list with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Insertion at specific position (with iterator)\n    auto it = std::next(lst.begin(), 2);  // iterator to 3rd element\n    lst.insert(it, 99);  // insert 99 before 3rd element: 1, 2, 99, 3, 4, 5"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::list — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Removal,    lst.erase(lst.begin());  // remove first: 2, 99, 3, 4, 5,\n\n    // Efficient push/pop at both ends,    lst.push_front(0);  // 0, 2, 99, 3, 4, 5,    lst.pop_back();     // 0, 2, 99, 3, 4,\n\n    // Iteration,    for (auto val : lst) {,        std::cout << val << \" \";,    },    std::cout << \"\\n\";,\n\n    // NOTE: No random access like lst[0],    // Must use iterators or range-for,\n\n    // Size,    std::cout << \"Size: \" << lst.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use list for frequent insertion/removal at arbitrary positions with known iterators.",
                  "Avoid list for linear traversal only; vector is much faster (better cache locality).",
                  "list has no random access; use iterators for operations."
        ],
        mistake: "Using list for sequential access only; vector is faster due to cache locality.",
        shorthand: {
          verbose: "#include <iostream>\n#include <list>\n#include <algorithm>\n\nint main() {\n    std::list<int> lst{1, 2, ",
          concise: "// see verbose",
        },
      },
      {
        id: "forward-list",
        fn: "std::forward_list",
        desc: "Singly-linked list: memory-efficient linked list (C++11).",
        category: "Sequence Containers",
        subtitle: "Singly-linked list",
        signature: "std::forward_list<T> flst;",
        descLong: "std::forward_list is a singly-linked list (each node points only forward) with minimal memory overhead. Forward iteration only; no random access. Used when memory is critical and only forward traversal is needed. Usually not preferred; list or vector are better choices.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::forward_list — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <forward_list>\n\nint main() {\n    std::forward_list<int> flst{1, 2, 3, 4, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::forward_list — common patterns you'll see in production.\n// APPROACH  - Combine std::forward_list with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Can only iterate forward\n    for (auto val : flst) {\n        std::cout << val << \" \";\n    }\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::forward_list — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Efficient insertion after an element,    auto it = flst.begin();,    std::advance(it, 1);  // move to 2nd element,    flst.insert_after(it, 99);  // insert 99 after 2nd: 1, 2, 99, 3, 4, 5,,    for (auto val : flst) {,        std::cout << val << \" \";,    },    std::cout << \"\\n\";,\n\n    // Efficient removal after an element,    flst.erase_after(it);  // remove element after 2nd,,    for (auto val : flst) {,        std::cout << val << \" \";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "forward_list is memory-efficient but rarely used; list or vector are usually better.",
                  "forward_list only supports forward iteration; operations like insert_after take iterator-to-previous.",
                  "Use forward_list only when memory is extremely constrained and forward-only access is acceptable."
        ],
        mistake: "Using forward_list when list or vector would be more convenient.",
        shorthand: {
          verbose: "#include <iostream>\n#include <forward_list>\n\nint main() {\n    std::forward_list<int> flst{1, 2, 3, 4",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 2: Associative Containers ─────────────────────────────────────────
  {
    id: "associative-containers",
    title: "Associative Containers",
    entries: [
      {
        id: "map",
        fn: "std::map",
        desc: "Sorted key-value pairs: logarithmic lookup and insertion.",
        category: "Associative Containers",
        subtitle: "Sorted dictionary",
        signature: "std::map<K, V> m;",
        descLong: "std::map is a sorted (by key) map backed by a red-black tree. Lookup, insertion, and deletion are O(log n). Keys must be comparable (operator<). Use map when sorted iteration or comparison are needed. Use unordered_map when lookup speed is the only concern.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::map — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    // Construction and insertion\n    std::map<std::string, int> ages;\n    ages[\"Alice\"] = 30;\n    ages[\"Bob\"] = 25;\n    ages.insert({\"Charlie\", 35});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::map — common patterns you'll see in production.\n// APPROACH  - Combine std::map with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Access and check existence\n    std::cout << \"Alice's age: \" << ages[\"Alice\"] << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::map — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Check if key exists,    if (ages.count(\"David\") > 0) {,        std::cout << \"David found\\n\";,    } else {,        std::cout << \"David not found\\n\";,    },\n\n    // Find with iterator,    auto it = ages.find(\"Bob\");,    if (it != ages.end()) {,        std::cout << \"Bob's age: \" << it->second << \"\\n\";,    },\n\n    // Iteration in sorted order,    std::cout << \"All ages (sorted by name):\\n\";,    for (const auto& [name, age] : ages) {,        std::cout << name << \": \" << age << \"\\n\";,    },\n\n    // Erase,    ages.erase(\"Charlie\");,\n\n    // Size,    std::cout << \"Map size: \" << ages.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use map for sorted key-value pairs.",
                  "Prefer find() over count() to get both existence check and value.",
                  "Using operator[] on non-existent key creates it with default value; use find() if you only want to read."
        ],
        mistake: "Using operator[] to check existence; it creates the key if missing. Use find() or count() instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    // Construction and insertion",
          concise: "// see verbose",
        },
      },
      {
        id: "unordered-map",
        fn: "std::unordered_map",
        desc: "Unordered key-value pairs: average O(1) lookup (hash table).",
        category: "Associative Containers",
        subtitle: "Hash table dictionary",
        signature: "std::unordered_map<K, V> m;",
        descLong: "std::unordered_map is a hash table. Average O(1) lookup; worst case O(n) (rare). Iteration order is unspecified. No sorting. Faster than map for pure lookup. Use unordered_map by default unless you need sorted iteration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::unordered_map — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <unordered_map>\n#include <string>\n\nint main() {\n    std::unordered_map<std::string, int> ids;\n    ids[\"alice\"] = 101;\n    ids[\"bob\"] = 102;\n    ids[\"charlie\"] = 103;"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::unordered_map — common patterns you'll see in production.\n// APPROACH  - Combine std::unordered_map with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Fast lookup\n    std::cout << \"alice's ID: \" << ids[\"alice\"] << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::unordered_map — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Check existence,    if (ids.find(\"david\") != ids.end()) {,        std::cout << \"david found\\n\";,    } else {,        std::cout << \"david not found\\n\";,    },\n\n    // Iteration (order undefined),    std::cout << \"All IDs:\\n\";,    for (const auto& [name, id] : ids) {,        std::cout << name << \": \" << id << \"\\n\";,    },\n\n    // Erase,    ids.erase(\"bob\");,    std::cout << \"Size: \" << ids.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use unordered_map for fast lookup when sorting is not needed.",
                  "operator[] creates entries; use find() if you only want to read.",
                  "Worst-case O(n) is rare; hash tables are generally much faster than maps."
        ],
        mistake: "Assuming unordered_map iteration order is consistent; it is unspecified.",
        shorthand: {
          verbose: "#include <iostream>\n#include <unordered_map>\n#include <string>\n\nint main() {\n    std::unordered_map<",
          concise: "// see verbose",
        },
      },
      {
        id: "set",
        fn: "std::set",
        desc: "Sorted unique elements.",
        category: "Associative Containers",
        subtitle: "Sorted set",
        signature: "std::set<T> s;",
        descLong: "std::set is a sorted container of unique elements (duplicates rejected). Backed by a red-black tree. Lookup, insertion, deletion are O(log n). Use set for membership testing with sorting. Use unordered_set for membership testing without sorting.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::set — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <set>\n#include <string>\n\nint main() {\n    std::set<std::string> colors{\"red\", \"green\", \"blue\"};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::set — common patterns you'll see in production.\n// APPROACH  - Combine std::set with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Insert\n    colors.insert(\"yellow\");"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::set — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Duplicate rejected,    colors.insert(\"red\");  // does nothing,\n\n    // Check membership,    if (colors.count(\"red\") > 0) {,        std::cout << \"red is in the set\\n\";,    },\n\n    // Iteration in sorted order,    std::cout << \"Colors (sorted):\\n\";,    for (const auto& color : colors) {,        std::cout << color << \"\\n\";,    },\n\n    // Find,    auto it = colors.find(\"green\");,    if (it != colors.end()) {,        std::cout << \"Found: \" << *it << \"\\n\";,    },\n\n    // Erase,    colors.erase(\"blue\");,    std::cout << \"Size: \" << colors.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use set to maintain a sorted collection of unique values.",
                  "Duplicates are silently rejected; insertion returns pair<iterator, bool>.",
                  "Use unordered_set when sorting is not needed."
        ],
        mistake: "Expecting insertion to fail for duplicates; use insert() result to check.",
        shorthand: {
          verbose: "#include <iostream>\n#include <set>\n#include <string>\n\nint main() {\n    std::set<std::string> colors{",
          concise: "// see verbose",
        },
      },
      {
        id: "unordered-set",
        fn: "std::unordered_set",
        desc: "Unordered unique elements (hash set).",
        category: "Associative Containers",
        subtitle: "Hash set",
        signature: "std::unordered_set<T> s;",
        descLong: "std::unordered_set is a hash set for fast unique element membership testing. Average O(1) lookup; worst case O(n). No sorting. Use by default unless sorted iteration is needed.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::unordered_set — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <unordered_set>\n#include <vector>\n\nint main() {\n    std::unordered_set<int> primes{2, 3, 5, 7, 11, 13};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::unordered_set — common patterns you'll see in production.\n// APPROACH  - Combine std::unordered_set with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Check membership (fast)\n    std::cout << \"Is 7 prime? \" << (primes.count(7) ? \"yes\" : \"no\") << \"\\n\";\n    std::cout << \"Is 8 prime? \" << (primes.count(8) ? \"yes\" : \"no\") << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::unordered_set — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Insert,    primes.insert(17);,\n\n    // Duplicate rejected,    primes.insert(3);  // does nothing,\n\n    // Find,    if (primes.find(11) != primes.end()) {,        std::cout << \"11 is prime\\n\";,    },\n\n    // Remove duplicates from vector,    std::vector<int> data{1, 2, 2, 3, 3, 3, 4, 5, 5};,    std::unordered_set<int> unique_vals(data.begin(), data.end());,    std::cout << \"Unique values: \" << unique_vals.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use unordered_set for fast membership testing without needing sorting.",
                  "Average O(1) is much faster than set's O(log n) for large sets.",
                  "Iteration order is unspecified; do not rely on any particular order."
        ],
        mistake: "Assuming unordered_set iteration order; it is unspecified.",
        shorthand: {
          verbose: "#include <iostream>\n#include <unordered_set>\n#include <vector>\n\nint main() {\n    std::unordered_set<",
          concise: "// see verbose",
        },
      },
      {
        id: "multimap-multiset",
        fn: "std::multimap / std::multiset",
        desc: "Maps and sets allowing duplicate keys or values.",
        category: "Associative Containers",
        subtitle: "Multi-value containers",
        signature: "std::multimap<K, V> m;  |  std::multiset<T> s;",
        descLong: "multimap and multiset allow duplicate keys/values. Otherwise identical to map and set. Use equal_range() to find all values for a key. Rarely needed; usually better to use map<K, vector<V>> or handle duplicates explicitly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::multimap / std::multiset — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    // multimap allows duplicate keys\n    std::multimap<std::string, int> scores;\n    scores.insert({\"Alice\", 85});\n    scores.insert({\"Alice\", 90});\n    scores.insert({\"Bob\", 78});\n    scores.insert({\"Bob\", 88});"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::multimap / std::multiset — common patterns you'll see in production.\n// APPROACH  - Combine std::multimap / std::multiset with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Find all values for a key using equal_range\n    auto [begin, end] = scores.equal_range(\"Alice\");\n    std::cout << \"Alice's scores: \";\n    for (auto it = begin; it != end; ++it) {\n        std::cout << it->second << \" \";\n    }\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::multimap / std::multiset — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Count occurrences,    std::cout << \"Alice appears \" << scores.count(\"Alice\") << \" times\\n\";,\n\n    // Total size,    std::cout << \"Total entries: \" << scores.size() << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use multimap/multiset only when duplicate keys/values are essential.",
                  "Consider using map<K, vector<V>> instead for clearer semantics.",
                  "Use equal_range() to efficiently find all entries for a key."
        ],
        mistake: "Using multimap when map<K, vector<V>> would be clearer.",
        shorthand: {
          verbose: "#include <iostream>\n#include <map>\n#include <string>\n\nint main() {\n    // multimap allows duplicate ",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 3: Algorithms ─────────────────────────────────────────
  {
    id: "algorithms",
    title: "Algorithms",
    entries: [
      {
        id: "sort-find",
        fn: "sort() / find()",
        desc: "Common algorithms: sorting and searching.",
        category: "Algorithms",
        subtitle: "Sorting and searching",
        signature: "std::sort(begin, end);  |  std::find(begin, end, value);",
        descLong: "std::sort arranges elements in order (O(n log n) average). std::find returns an iterator to the first matching element or end() if not found. Both operate on ranges defined by iterators. Use custom comparators for non-default ordering. Algorithms are in <algorithm>.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of sort() / find() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{5, 2, 8, 1, 9, 3};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of sort() / find() — common patterns you'll see in production.\n// APPROACH  - Combine sort() / find() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Sort (ascending)\n    std::sort(nums.begin(), nums.end());\n    std::cout << \"Sorted: \";\n    for (auto n : nums) std::cout << n << \" \";\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of sort() / find() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Sort descending,    std::vector<int> nums2 = nums;,    std::sort(nums2.begin(), nums2.end(), std::greater<int>());,    std::cout << \"Descending: \";,    for (auto n : nums2) std::cout << n << \" \";,    std::cout << \"\\n\";,\n\n    // Find,    auto it = std::find(nums.begin(), nums.end(), 8);,    if (it != nums.end()) {,        std::cout << \"Found 8 at position \" << std::distance(nums.begin(), it) << \"\\n\";,    },\n\n    // Find with lambda (custom predicate),    auto even = std::find_if(nums.begin(), nums.end(),,                             [](int x) { return x % 2 == 0; });,    if (even != nums.end()) {,        std::cout << \"First even: \" << *even << \"\\n\";,    },\n\n    // Sort with custom comparator,    std::vector<std::string> words{\"zebra\", \"apple\", \"banana\"};,    std::sort(words.begin(), words.end(),,              [](const auto& a, const auto& b) { return a.length() < b.length(); });,    std::cout << \"By length: \";,    for (const auto& w : words) std::cout << w << \" \";,    std::cout << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::find for single element search.",
                  "Use std::find_if with a lambda for custom search predicates.",
                  "std::sort is usually efficient enough; avoid sorting repeatedly if possible."
        ],
        mistake: "Assuming find() returns an index; it returns an iterator. Use std::distance() for index.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{5",
          concise: "// see verbose",
        },
      },
      {
        id: "transform-accumulate",
        fn: "transform() / accumulate()",
        desc: "Transform elements and aggregate values.",
        category: "Algorithms",
        subtitle: "Functional algorithms",
        signature: "std::transform(begin, end, out, func);  |  std::accumulate(begin, end, init);",
        descLong: "std::transform applies a function to each element and stores results. std::accumulate (in <numeric>) reduces a range to a single value using a binary operation (default: sum). Both enable functional programming patterns. Use lambdas for flexible transformations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of transform() / accumulate() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n#include <string>\n\nint main() {\n    std::vector<int> nums{1, 2, 3, 4, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of transform() / accumulate() — common patterns you'll see in production.\n// APPROACH  - Combine transform() / accumulate() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Transform: square each element\n    std::vector<int> squares;\n    std::transform(nums.begin(), nums.end(),\n                   std::back_inserter(squares),\n                   [](int x) { return x * x; });\n    std::cout << \"Squares: \";\n    for (auto s : squares) std::cout << s << \" \";\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of transform() / accumulate() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Accumulate: sum all elements,    int sum = std::accumulate(nums.begin(), nums.end(), 0);,    std::cout << \"Sum: \" << sum << \"\\n\";,\n\n    // Accumulate with custom operation,    int product = std::accumulate(nums.begin(), nums.end(), 1,,                                  [](int a, int b) { return a * b; });,    std::cout << \"Product: \" << product << \"\\n\";,\n\n    // Transform strings to uppercase,    std::vector<std::string> words{\"hello\", \"world\"};,    std::vector<std::string> upper;,    std::transform(words.begin(), words.end(),,                   std::back_inserter(upper),,                   [](const auto& s) {,                       std::string result = s;,                       std::for_each(result.begin(), result.end(),,                                     [](char& c) { c = std::toupper(c); });,                       return result;,                   });,    std::cout << \"Uppercase: \";,    for (const auto& w : upper) std::cout << w << \" \";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::back_inserter() as output iterator to grow the destination container.",
                  "Use accumulate() for reduction: sum, product, concatenation, etc.",
                  "Lambdas make functional algorithms concise and readable."
        ],
        mistake: "Not providing enough space in destination container; use back_inserter() instead.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n#include <numeric>\n#include <string>\n\nint",
          concise: "// see verbose",
        },
      },
      {
        id: "remove-erase",
        fn: "remove() / erase() pattern",
        desc: "Remove elements: erase-remove idiom.",
        category: "Algorithms",
        subtitle: "Element removal",
        signature: "auto new_end = std::remove(begin, end, value); container.erase(new_end, end);",
        descLong: "std::remove moves unwanted elements to the end and returns new_end. Doesn't actually erase (can't without knowing container type). Pair with erase() to remove: container.erase(std::remove(...), container.end()). C++20 std::ranges::erase simplifies this.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of remove() / erase() pattern — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{1, 2, 3, 2, 4, 2, 5};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of remove() / erase() pattern — common patterns you'll see in production.\n// APPROACH  - Combine remove() / erase() pattern with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Remove-erase idiom: remove all 2s\n    nums.erase(std::remove(nums.begin(), nums.end(), 2), nums.end());\n\n    std::cout << \"After removing 2: \";\n    for (auto n : nums) std::cout << n << \" \";\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of remove() / erase() pattern — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Remove-erase with predicate,    std::vector<int> values{1, 2, 3, 4, 5, 6, 7};,    values.erase(,        std::remove_if(values.begin(), values.end(),,                       [](int x) { return x % 2 == 0; }),  // remove evens,        values.end(),    );,,    std::cout << \"Odd values: \";,    for (auto v : values) std::cout << v << \" \";,    std::cout << \"\\n\";,\n\n    // Strings example,    std::string text = \"hello world\";,    text.erase(std::remove(text.begin(), text.end(), 'l'), text.end());,    std::cout << \"Removed 'l': \" << text << \"\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use the erase-remove idiom: container.erase(std::remove(...), container.end())",
                  "Use remove_if with lambda for custom predicates.",
                  "C++20 std::ranges::erase simplifies to: std::ranges::erase(container, value)"
        ],
        mistake: "Using remove() alone; it does not erase. Always follow with erase().",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{1",
          concise: "// see verbose",
        },
      },
      {
        id: "binary-search",
        fn: "binary_search() / lower_bound()",
        desc: "Fast search in sorted ranges.",
        category: "Algorithms",
        subtitle: "Binary search algorithms",
        signature: "std::binary_search(begin, end, value);  |  std::lower_bound(begin, end, value);",
        descLong: "std::binary_search checks if an element exists in a sorted range (O(log n)). std::lower_bound returns an iterator to the first element >= value. std::upper_bound returns iterator to first > value. Requires sorted data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of binary_search() / lower_bound() — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> sorted{1, 3, 5, 7, 9, 11, 13};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of binary_search() / lower_bound() — common patterns you'll see in production.\n// APPROACH  - Combine binary_search() / lower_bound() with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Check existence\n    if (std::binary_search(sorted.begin(), sorted.end(), 7)) {\n        std::cout << \"7 found\\n\";\n    }\n    if (!std::binary_search(sorted.begin(), sorted.end(), 8)) {\n        std::cout << \"8 not found\\n\";\n    }"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of binary_search() / lower_bound() — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// lower_bound: first element >= value,    auto lower = std::lower_bound(sorted.begin(), sorted.end(), 6);,    std::cout << \"lower_bound(6) points to: \" << *lower << \"\\n\";  // 7,\n\n    // upper_bound: first element > value,    auto upper = std::upper_bound(sorted.begin(), sorted.end(), 7);,    std::cout << \"upper_bound(7) points to: \" << *upper << \"\\n\";  // 9,\n\n    // Find range of equal elements (for multiset/multimap),    auto [lower_7, upper_7] = std::equal_range(sorted.begin(), sorted.end(), 7);,    std::cout << \"Range [\" << std::distance(sorted.begin(), lower_7),              << \", \" << std::distance(sorted.begin(), upper_7) << \")\\n\";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use binary_search on sorted ranges for O(log n) lookup.",
                  "Use lower_bound/upper_bound for range queries.",
                  "Ensure the range is sorted; unsorted data produces wrong results."
        ],
        mistake: "Using binary_search on unsorted data; results will be incorrect.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <algorithm>\n\nint main() {\n    std::vector<int> sorted",
          concise: "// see verbose",
        },
      },
    ],
  },

  // ── Section 4: Iterators & Ranges ─────────────────────────────────────────
  {
    id: "iterators-ranges",
    title: "Iterators & Ranges",
    entries: [
      {
        id: "iterators",
        fn: "Iterators",
        desc: "Generalized pointers for container element access.",
        category: "Iterators & Ranges",
        subtitle: "Iterator fundamentals",
        signature: "auto it = container.begin();  *it;  ++it;",
        descLong: "Iterators generalize pointers for accessing container elements. Categories: input (read-only), output (write-only), forward, bidirectional, random-access. Containers provide begin(), end(), rbegin(), rend(). Use std::distance() to compute offset. Prefer range-based for and algorithms over manual iteration.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of Iterators — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <list>\n#include <algorithm>\n\nint main() {\n    std::vector<int> vec{10, 20, 30, 40, 50};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of Iterators — common patterns you'll see in production.\n// APPROACH  - Combine Iterators with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// Iterator basics\n    auto it = vec.begin();\n    std::cout << \"First: \" << *it << \"\\n\";  // dereference\n    ++it;  // increment\n    std::cout << \"Second: \" << *it << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of Iterators — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// Distance between iterators,    auto it3 = std::next(vec.begin(), 2);  // move forward,    std::cout << \"Distance from start: \" << std::distance(vec.begin(), it3) << \"\\n\";,\n\n    // Iterator categories,    // - vector has random-access iterators,    std::cout << \"Element at [2]: \" << vec[2] << \"\\n\";  // OK,    std::cout << \"Via it+2: \" << *(vec.begin() + 2) << \"\\n\";  // OK,\n\n    // - list has bidirectional iterators (no random access),    std::list<int> lst{1, 2, 3};,    auto lst_it = lst.begin();,    ++lst_it;  // increment OK,    // auto x = lst_it + 1;  // ERROR: list doesn't support random access,    std::advance(lst_it, 1);  // use advance() instead,\n\n    // Reverse iterators,    std::cout << \"Reverse iteration: \";,    for (auto it = vec.rbegin(); it != vec.rend(); ++it) {,        std::cout << *it << \" \";,    },    std::cout << \"\\n\";,\n\n    // Find with iterator,    auto found = std::find(vec.begin(), vec.end(), 30);,    if (found != vec.end()) {,        std::cout << \"Found at index: \" << std::distance(vec.begin(), found) << \"\\n\";,    },,    return 0;,}"
                  }
        ],
        tips: [
                  "Prefer range-based for loops; they handle iterators internally.",
                  "Use std::advance() for non-random-access iterators; operator+ only works for random-access.",
                  "Use const_iterator when you don't need to modify elements."
        ],
        mistake: "Using operator+ on list iterators; lists don't support random access.",
        shorthand: {
          verbose: "std::list<int> lst{1, 2, 3};\nauto it = lst.begin();\nauto it2 = it + 2;  // ERROR: no operator+",
          concise: "std::vector<int> vec{1, 2, 3};\nauto it2 = vec.begin() + 2;  // OK: random-access\nfor (auto x : vec) { }  // Prefer range-based for",
        },
      },
      {
        id: "stdranges",
        fn: "std::ranges (C++20)",
        desc: "Modern range-based algorithms and views.",
        category: "Iterators & Ranges",
        subtitle: "Range algorithms",
        signature: "std::ranges::sort(container);  std::ranges::views::filter(...)",
        descLong: "std::ranges provides range-based overloads of algorithms (no begin/end needed). Works directly on containers. std::ranges::views provides range adaptors for lazy transformations (filter, transform, take). C++20 feature bringing functional programming to STL.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "// === ENTRY-LEVEL EXAMPLE ===\n// TASK      - Basic usage of std::ranges (C++20) — understand the core syntax and behavior.\n// APPROACH  - Simple example with minimal parameters; no edge cases.\n// STRENGTHS - Clear, readable; shows the fundamental pattern.\n// WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#include <iostream>\n#include <vector>\n#include <ranges>\n#include <algorithm>\n\nint main() {\n    std::vector<int> nums{1, 2, 3, 4, 5, 6, 7, 8, 9};"
                  },
                  {
                            "tier": "junior",
                            "code": "// === JUNIOR EXAMPLE ===\n// TASK      - Real-world usage of std::ranges (C++20) — common patterns you'll see in production.\n// APPROACH  - Combine std::ranges (C++20) with related functions; handle common edge cases.\n// STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n// WEAKNESSES- May need optimization for large datasets or complex queries.\n// C++20: ranges algorithms take containers directly\n    std::ranges::sort(nums, std::greater<int>());\n    std::cout << \"Sorted (desc): \";\n    for (auto n : nums) std::cout << n << \" \";\n    std::cout << \"\\n\";"
                  },
                  {
                            "tier": "senior",
                            "code": "// === SENIOR EXAMPLE ===\n// TASK      - Advanced usage of std::ranges (C++20) — performance, edge cases, and expert patterns.\n// APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n// STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n// WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n// C++20: ranges::views for lazy transformations,    auto even_squares = nums,        | std::views::filter([](int x) { return x % 2 == 0; }),        | std::views::transform([](int x) { return x * x; });,,    std::cout << \"Even squares: \";,    for (auto n : even_squares) {,        std::cout << n << \" \";,    },    std::cout << \"\\n\";,\n\n    // Take first N elements,    auto first_three = nums | std::views::take(3);,    std::cout << \"First three: \";,    for (auto n : first_three) std::cout << n << \" \";,    std::cout << \"\\n\";,\n\n    // Reverse view,    auto reversed = nums | std::views::reverse;,    std::cout << \"Reversed: \";,    for (auto n : reversed) std::cout << n << \" \";,,    return 0;,}"
                  }
        ],
        tips: [
                  "Use std::ranges algorithms; they take containers directly without .begin()/end().",
                  "Use std::views for lazy, composable transformations.",
                  "Views are non-owning; they do not copy data."
        ],
        mistake: "Trying to use ranges on C++17 compilers. std::ranges is C++20 feature.",
        shorthand: {
          verbose: "#include <iostream>\n#include <vector>\n#include <ranges>\n#include <algorithm>\n\nint main() {\n    std::",
          concise: "// see verbose",
        },
      },
    ],
  },
]

export default { meta, sections }
