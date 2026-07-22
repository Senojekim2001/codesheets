---
type: "file-index"
domain: "python"
file: "core"
title: "Core Syntax & Built-ins"
tags:
  - "python"
  - "python/core"
  - "index"
---

# Core Syntax & Built-ins

> 64 entries across 6 sections.

## I/O & Introspection · 9

- [[Sections/core/output/print|print()]] — Write output to stdout with configurable separator and end.
- [[Sections/core/output/input|input()]] — Read a line from stdin — always returns a string.
- [[Sections/core/output/isinstance|isinstance()]] — Check the type of an object at runtime.
- [[Sections/core/output/getattr|getattr()]] — Get an attribute by string name, with an optional default.
- [[Sections/core/output/hasattr|hasattr()]] — Check whether an object has an attribute by string name.
- [[Sections/core/output/vars|vars()]] — Return the __dict__ attribute of an object — instance attributes only.
- [[Sections/core/output/dir|dir()]] — List all attributes and methods of an object, including inherited ones.
- [[Sections/core/output/sys-module|sys module]] — Access interpreter variables and control the Python runtime.
- [[Sections/core/output/os-module|os module]] — Operating system interface — files, directories, processes, environment.

## Built-in Functions · 7

- [[Sections/core/builtins/len|len()]] — Return the number of items in a sequence or collection.
- [[Sections/core/builtins/range|range()]] — Generate a lazy sequence of integers.
- [[Sections/core/builtins/sum-min-max|Numeric built-ins]] — Aggregate and numeric built-in functions.
- [[Sections/core/builtins/any-all|any() / all()]] — Test whether any or all items in an iterable are truthy.
- [[Sections/core/builtins/enumerate|enumerate()]] — Iterate with both index and value simultaneously.
- [[Sections/core/builtins/zip|zip()]] — Pair up multiple iterables element by element.
- [[Sections/core/builtins/map-filter-sorted|sorted()]] — Transform, select, and sort iterables.

## Control Flow · 6

- [[Sections/core/control/if-elif-else|if statement]] — Conditional branching.
- [[Sections/core/control/ternary|Ternary expression]] — Inline conditional expression — value if cond else other_value.
- [[Sections/core/control/walrus|Walrus operator :=]] — Assign and test in a single expression.
- [[Sections/core/control/for-loop|for loop]] — Iterate over any iterable — list, string, dict, generator.
- [[Sections/core/control/while-loop|while loop]] — Repeat a block as long as a condition is true.
- [[Sections/core/control/match-case|match statement]] — Structural pattern matching — Python 3.10+.

## Functions · 7

- [[Sections/core/functions/def|def]] — Define a reusable named function.
- [[Sections/core/functions/args-kwargs|*args / **kwargs]] — Collect variable numbers of positional or keyword arguments.
- [[Sections/core/functions/lambda|lambda]] — Create a small anonymous function inline.
- [[Sections/core/functions/generators|Generators]] — Functions that lazily produce values one at a time.
- [[Sections/core/functions/decorators|Decorators]] — Wrap a function to add behavior without modifying its body.
- [[Sections/core/functions/closures|Closures]] — Functions that capture and modify variables from their enclosing scope.
- [[Sections/core/functions/global-nonlocal|global / nonlocal]] — Declare that an assignment targets a variable in an outer scope.

## Data Types & Strings · 13

- [[Sections/core/data-types/list|list]] — Ordered mutable sequence — the most versatile Python container.
- [[Sections/core/data-types/unpacking|Unpacking]] — Unpack sequences into variables using * for remainder capture.
- [[Sections/core/data-types/dict|dict]] — Key-value mapping with O(1) average lookup — the most versatile Python data structure.
- [[Sections/core/data-types/dict-comprehension|Dict comprehension]] — Create a dictionary from an iterable in a single expression.
- [[Sections/core/data-types/tuple|tuple]] — Immutable ordered sequence — hashable, memory-efficient, and faster than list.
- [[Sections/core/data-types/namedtuple|namedtuple]] — Lightweight immutable record type with named fields — no class boilerplate needed.
- [[Sections/core/data-types/set|set]] — Unordered collection of unique hashable items with O(1) membership testing.
- [[Sections/core/data-types/set-comprehension|Set comprehension]] — Create a set from an iterable in a single expression — duplicates removed automatically.
- [[Sections/core/data-types/fstrings|f-strings]] — Embed expressions in string literals with format specifications.
- [[Sections/core/data-types/str-methods|str methods]] — Built-in string transformation and searching methods.
- [[Sections/core/data-types/re-module|re module]] — Pattern matching and text manipulation with regular expressions.
- [[Sections/core/data-types/type-hints|Type hints]] — Annotate variables and functions with static type information.
- [[Sections/core/data-types/abc|Abstract Base Classes]] — Define interfaces that subclasses must implement.

## Standard Library · 22

- [[Sections/core/stdlib/itertools|itertools]] — Lazy combinatorial iterators for sequences.
- [[Sections/core/stdlib/collections-deque|collections.deque]] — Double-ended queue with O(1) append and pop at both ends.
- [[Sections/core/stdlib/functools|functools]] — Higher-order function utilities — caching, partial application, ordering.
- [[Sections/core/stdlib/datetime|datetime module]] — Work with dates, times, and durations.
- [[Sections/core/stdlib/json-module|json module]] — Serialize Python objects to JSON and back.
- [[Sections/core/stdlib/copy-module|copy module]] — Make shallow or deep copies of Python objects.
- [[Sections/core/stdlib/bytes|bytes]] — Immutable sequence of raw bytes (integers 0-255).
- [[Sections/core/stdlib/bytearray|bytearray]] — Mutable sequence of raw bytes — the editable version of bytes.
- [[Sections/core/stdlib/pathlib|pathlib.Path]] — Object-oriented filesystem path manipulation.
- [[Sections/core/stdlib/builtin-exceptions|Built-in exceptions]] — The standard exception hierarchy and most common exception types.
- [[Sections/core/stdlib/with-statement|with statement]] — Execute a block with guaranteed setup and teardown via context managers.
- [[Sections/core/stdlib/exceptions|Exception handling]] — Handle, raise, and define exceptions.
- [[Sections/core/stdlib/main-guard|__name__ == "__main__"]] — Guard code that should only run when the file is executed directly.
- [[Sections/core/stdlib/pathlib-module|pathlib (Path Objects)]] — Modern, object-oriented file path handling.
- [[Sections/core/stdlib/functools-partial-cache|functools (partial, lru_cache, reduce)]] — Functional programming utilities: function wrapping, caching, reduction.
- [[Sections/core/stdlib/collections-counter-deque|collections (Counter, defaultdict, deque, namedtuple)]] — Specialized data structures for counting, defaults, queues, and tuples.
- [[Sections/core/stdlib/context-managers-with|Context Managers (with statement)]] — Safely acquire/release resources with __enter__ and __exit__.
- [[Sections/core/stdlib/itertools-module|itertools (Combinations, Permutations, Chain)]] — Memory-efficient iterators for combinatorics and chaining.
- [[Sections/core/stdlib/re-module-regex|re Module (Regular Expressions)]] — Pattern matching and text manipulation with regex.
- [[Sections/core/stdlib/logging-module|logging Module]] — Configure and output structured logs with levels and handlers.
- [[Sections/core/stdlib/argparse-cli|argparse (Command-Line Arguments)]] — Parse and validate CLI arguments with help messages.
- [[Sections/core/stdlib/typing-module-hints|typing Module (Type Hints)]] — Add type annotations for better IDE support and static checking.
