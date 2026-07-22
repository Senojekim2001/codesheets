export const meta = {
  "title": "Core Python",
  "domain": "python",
  "sheet": "core",
  "icon": "🐍"
}

export const sections = [

  // ── Section 1: I/O & Introspection ─────────────────────────────────────────
  {
    id: "output",
    title: "I/O & Introspection",
    entries: [
      {
        id: "print",
        fn: "print()",
        desc: "Write output to stdout with configurable separator and end.",
        category: "I/O",
        subtitle: "Console output with sep=, end=, and file= options",
        signature: "print(*args, sep=\" \", end=\"\\n\", file=sys.stdout)",
        descLong: "print() converts all arguments to strings and writes them separated by sep (default space), ending with end (default newline). Use file= to redirect to a file or stderr. The flush= parameter forces an immediate write.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of print() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: write values to the console\nprint(\"hello\", \"world\")       # → hello world\nprint(\"x =\", 42, \"y =\", 3.14) # → x = 42 y = 3.14\nprint(\"line one\")\nprint(\"line two\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of print() — common patterns you'll see in production.\n# APPROACH  - Combine print() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: control separator, line ending, and use f-strings\nname, score = \"Alice\", 95.5\n# WHY: sep= replaces the default space between arguments\nprint(\"a\", \"b\", \"c\", sep=\", \")        # → a, b, c\n# WHY: end=\"\" suppresses the newline — useful inside loops\nprint(\"loading...\", end=\"\")\nprint(\" done!\")                        # → loading... done!\n# WHY: f-strings format values inline with full precision control\nprint(f\"{name}: {score:.1f}%\")        # → Alice: 95.5%"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of print() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nimport sys\n# GOAL: write to stderr and use flush for buffered output\n# WHY: file=sys.stderr separates errors from normal output — stdout stays clean\nprint(\"Something went wrong\", file=sys.stderr)\n# WHY: flush=True forces the write immediately — useful in long-running scripts\nprint(\"Processing row 1000...\", flush=True)\n# NOTE: in production code, replace print() with the logging module\n# logging.debug() / .info() / .warning() can be silenced by log level without touching the code\n#\n# Decision rule:\n#   throwaway script / REPL / one-off debug   -> print()\n#   library / framework / reusable module     -> logging.getLogger(__name__)\n#   long-lived service / production           -> logging with structured handlers\n#   error / warning to terminal               -> print(..., file=sys.stderr)\n#   pipe-friendly CLI output (stdout)         -> print() (stdout is the data channel)\n#   progress in long loop, unbuffered tty     -> print(..., flush=True) or tqdm\n#   sub-millisecond hot loop                  -> sys.stdout.write() (skip print formatting)\n#\n# Anti-pattern: leaving print() statements as the production logging strategy.\n#   Devs sprinkle print() through code, ship it, and now they cannot silence noisy output,\n#   filter by level, route to a file/syslog, or correlate with request IDs. Use logging from\n#   day one — the cost is one import and getLogger(__name__); the payoff is configurable verbosity."
                  }
        ],
        tips: [
                  "`print(*lst)` unpacks a list as separate arguments — prints space-separated values",
                  "`print(..., end=\"\")` is useful in loops to build a line incrementally",
                  "`print(..., file=sys.stderr)` sends to stderr without redirecting stdout",
                  "For logging in production, use the `logging` module — never `print()`"
        ],
        mistake: "Using `print` for debugging in production code. Use `logging.debug()` instead — it can be silenced by log level without touching the code.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "input",
        fn: "input()",
        desc: "Read a line from stdin — always returns a string.",
        category: "I/O",
        subtitle: "Prompt user for input — must cast the result",
        signature: "input(prompt=\"\") -> str",
        descLong: "input() displays an optional prompt and waits for the user to type a line and press Enter. It always returns a string — you must cast to int, float, etc. if you need a number.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of input() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: read text from the user\nname = input(\"Enter your name: \")  # → always a str\nprint(f\"Hello, {name}!\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of input() — common patterns you'll see in production.\n# APPROACH  - Combine input() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: cast the result and read multiple values on one line\n# WHY: input() always returns str — forgetting to cast is the #1 beginner bug\nage = int(input(\"Enter your age: \"))\nx   = float(input(\"Enter x: \"))\n# WHY: split() splits on whitespace — lets the user type two values at once\na, b = input(\"Enter two numbers: \").split()\na, b = int(a), int(b)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of input() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: validate input with a retry loop\n# WHY: wrapping in while True + try/except keeps prompting until valid input is given\nwhile True:\n    raw = input(\"Enter a positive number: \")\n    try:\n        n = float(raw)\n        if n > 0:\n            break\n        print(\"Must be positive\")\n    except ValueError:\n        print(\"Not a number, try again\")\n# NOTE: in scripts that read piped data, use sys.stdin instead of input()\n#\n# Decision rule:\n#   single line from interactive user         -> input(prompt)\n#   masked password                           -> getpass.getpass()\n#   piped stdin / batch script                -> sys.stdin.read() or for line in sys.stdin\n#   line-by-line streaming input              -> for line in sys.stdin: line.rstrip(\"\\n\")\n#   structured CLI args / flags               -> argparse / click / typer\n#   rich TUI (menus, autocomplete)            -> prompt_toolkit or questionary\n#   reading a file path                       -> open(path) — never input() for filenames in scripts\n#\n# Anti-pattern: trusting input() to give you the right type without casting or validation.\n#   input() always returns a str. Beginners write `age + 1` and get TypeError, or skip the\n#   try/except and crash on bad input. Cast inside try/except in a retry loop — and for\n#   non-interactive scripts, accept stdin or argv instead so tests and pipelines work."
                  }
        ],
        tips: [
                  "`input()` always returns `str` — forgetting to cast is the #1 beginner bug",
                  "`a, b = input().split()` reads two space-separated tokens in one line",
                  "Wrap `input()` in a loop with try/except for robust user input validation",
                  "In scripts, `sys.stdin` lets you pipe input instead of typing interactively"
        ],
        mistake: "`age = input(\"Age: \") + 5` raises TypeError because input() returns a string. Always cast: `age = int(input(\"Age: \"))`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "isinstance",
        fn: "isinstance()",
        desc: "Check the type of an object at runtime.",
        category: "I/O",
        subtitle: "isinstance() for type checks — type() for exact type",
        signature: "isinstance(obj, type_or_tuple) -> bool",
        descLong: "isinstance() returns True if the object is an instance of the type or any of its subclasses. type() returns the exact type object. Use isinstance() for type checking — it works correctly with inheritance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of isinstance() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: check what type a value is at runtime\nisinstance(42, int)        # → True\nisinstance(\"hi\", str)      # → True\nisinstance(3.14, float)    # → True\nisinstance(42, str)        # → False"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of isinstance() — common patterns you'll see in production.\n# APPROACH  - Combine isinstance() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: check against multiple types in one call\n# WHY: passing a tuple avoids chained or-conditions\nisinstance(42, (int, float))     # → True\nisinstance([], (list, tuple))    # → True\n# WHY: isinstance respects inheritance — True is a bool, which is a subclass of int\nisinstance(True, int)            # → True\ntype(True) is int                # → False  (type() is exact, no inheritance)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of isinstance() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nfrom collections.abc import Iterable, Mapping, Sequence\n# GOAL: check structural type (duck typing) rather than concrete class\n# WHY: these ABCs match any object that behaves like the protocol — not just built-ins\nisinstance([1, 2, 3], Iterable)  # → True   (list is iterable)\nisinstance({}, Mapping)          # → True   (dict is a mapping)\nisinstance(\"abc\", Sequence)      # → True   (str is a sequence)\n# NOTE: prefer isinstance(x, Iterable) over type(x) == list — it works with custom classes too\n#\n# Decision rule:\n#   \"is this exactly type X?\"                 -> type(x) is X (rare, usually wrong)\n#   \"is this X or a subclass?\"                -> isinstance(x, X)\n#   \"any of several types\"                    -> isinstance(x, (int, float))\n#   \"behaves like a sequence/mapping\"          -> isinstance(x, collections.abc.Sequence)\n#   static type narrowing for type checker    -> match-case or typing.TypeGuard\n#   protocol / structural typing              -> typing.Protocol + isinstance with @runtime_checkable\n#   need to dispatch on type                  -> functools.singledispatch (cleaner than chain of isinstance)\n#\n# Anti-pattern: using type(x) == SomeClass for type checks.\n#   This rejects subclasses (including bool, which is an int subclass) and breaks duck typing.\n#   It also fails for proxies, mocks, and ORM models. Use isinstance(x, X) so legitimate\n#   subclasses are accepted; reach for ABCs (Iterable, Mapping) when you mean \"anything that\n#   behaves like one\" rather than \"the concrete list/dict class\"."
                  }
        ],
        tips: [
                  "Always prefer `isinstance()` over `type(x) ==` — it works with subclasses",
                  "`isinstance(x, (int, float))` checks multiple types in one call",
                  "`isinstance(x, Iterable)` from `collections.abc` is the correct way to check duck-typed protocols",
                  "`type(True) is int` is False — bool subclasses int, but `type()` is exact"
        ],
        mistake: "Using `type(x) == int` to check for numeric input. This rejects `bool` (which is a subclass of `int`) and custom numeric types. Use `isinstance(x, int)` instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "getattr",
        fn: "getattr()",
        desc: "Get an attribute by string name, with an optional default.",
        category: "I/O",
        subtitle: "Dynamic attribute access — safer than dot notation",
        signature: "getattr(obj, \"attr\", default=None)",
        descLong: "getattr() retrieves an attribute by its string name. If the attribute exists, return it; if not, return the default value (or raise AttributeError if no default). Essential for dynamic attribute access in frameworks, plugins, and serialization.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of getattr() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: access an attribute using its name as a string\nclass Dog:\n    def __init__(self, name):\n        self.name = name\nd = Dog(\"Rex\")\ngetattr(d, \"name\")           # → \"Rex\"  (same as d.name)\ngetattr(d, \"color\", \"brown\") # → \"brown\"  (default — attr doesn't exist)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of getattr() — common patterns you'll see in production.\n# APPROACH  - Combine getattr() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: safely read a list of attributes with a fallback for missing ones\nclass Dog:\n    def __init__(self, name, breed):\n        self.name  = name\n        self.breed = breed\nd = Dog(\"Rex\", \"Labrador\")\n# WHY: getattr with a default avoids AttributeError when the attr may not exist\nfor attr in [\"name\", \"breed\", \"age\", \"color\"]:\n    value = getattr(d, attr, \"N/A\")\n    print(f\"{attr}: {value}\")\n# → name: Rex  breed: Labrador  age: N/A  color: N/A"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of getattr() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: dynamic dispatch — call a method by name at runtime\nclass Dog:\n    def bark(self):  return \"Woof!\"\n    def sit(self):   return \"Sitting.\"\nd = Dog()\n# WHY: getattr turns a string into a callable — the core of plugin/command dispatcher patterns\ncommand = \"bark\"\nmethod  = getattr(d, command, None)\nif callable(method):\n    print(method())  # → Woof!\nelse:\n    print(f\"Unknown command: {command}\")\n# NOTE: prefer getattr(obj, name, None) over hasattr() + getattr() — one lookup instead of two\n#\n# Decision rule:\n#   attribute name known at write time        -> obj.attr (faster, type-checkable)\n#   attribute name in a string variable       -> getattr(obj, name)\n#   want safe lookup with fallback            -> getattr(obj, name, default)\n#   need to test existence only               -> hasattr(obj, name) (sugar over getattr)\n#   plugin / command dispatcher                -> getattr(self, command, None)\n#   walking serialized data into objects      -> getattr + setattr in a loop\n#   you find yourself typing many getattrs    -> reach for dataclass / __slots__ / Pydantic\n#\n# Anti-pattern: combining hasattr + getattr (or try/except AttributeError) for a single lookup.\n#   hasattr is implemented as getattr-in-a-try, so `if hasattr(o, \"x\"): getattr(o, \"x\")` does the\n#   work twice. Use `v = getattr(o, \"x\", default)` and branch on `v is default` (or use a sentinel).\n#   This is faster, race-free, and one line shorter."
                  }
        ],
        tips: [
                  "`getattr(obj, \"attr\", default)` is safer than `obj.attr` — returns default instead of raising AttributeError",
                  "Dynamic dispatch with `getattr(obj, method_name)()` is the core pattern for plugin systems and CLI dispatchers",
                  "`getattr(module, \"name\")` dynamically imports functions from modules at runtime",
                  "Avoid `getattr(obj, \"attr\")` without a default; always provide a fallback to handle missing attributes gracefully"
        ],
        mistake: "Using `getattr(obj, \"attr\")` without a default, then wrapping in try/except. Always provide a default: `getattr(obj, \"attr\", default_value)` — cleaner and faster.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "hasattr",
        fn: "hasattr()",
        desc: "Check whether an object has an attribute by string name.",
        category: "I/O",
        subtitle: "Boolean test for attribute existence",
        signature: "hasattr(obj, \"attr\") -> bool",
        descLong: "hasattr() returns True if the object has the named attribute, False otherwise. It is implemented as a try/except wrapper around getattr(). Use hasattr() to conditionally access attributes, but prefer getattr() with a default for single operations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of hasattr() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: check whether an attribute exists before using it\nclass Dog:\n    def __init__(self, name):\n        self.name = name\nd = Dog(\"Rex\")\nhasattr(d, \"name\")   # → True\nhasattr(d, \"color\")  # → False"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of hasattr() — common patterns you'll see in production.\n# APPROACH  - Combine hasattr() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: conditionally call a method only if the object supports it\nclass Dog:\n    def bark(self): return \"Woof!\"\nd = Dog(\"Rex\")\n# WHY: hasattr lets us safely branch without a try/except\nif hasattr(d, \"bark\"):\n    print(d.bark())   # → Woof!\nelse:\n    print(\"This dog can't bark\")\n# WHY: useful for checking all required fields before processing\nrequired = [\"name\", \"breed\", \"age\"]\nmissing  = [f for f in required if not hasattr(d, f)]\n# → ['breed', 'age']"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of hasattr() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: prefer getattr with a default over hasattr + getattr\nclass Dog:\n    def bark(self): return \"Woof!\"\nd = Dog(\"Rex\")\n# WHY: hasattr + getattr does two attribute lookups — getattr with None does one\n# Avoid this pattern:\n# if hasattr(d, \"bark\"):\n#     getattr(d, \"bark\")()\n# Prefer this — one lookup, same result:\nmethod = getattr(d, \"bark\", None)\nif method:\n    method()\n# NOTE: hasattr is still useful for readable boolean checks where you don't need the value\n#\n# Decision rule:\n#   only need a yes/no answer                 -> hasattr(obj, name)\n#   need the value too                        -> getattr(obj, name, sentinel) + check\n#   checking duck-typed protocol              -> isinstance(obj, SomeProtocol) (clearer intent)\n#   __getattr__ / property may have side fx   -> avoid hasattr; use try/except on real call\n#   dataclass / Pydantic model field check    -> \"name\" in fields(obj) / model.model_fields\n#   working with C extensions / mocks          -> getattr with default (hasattr can lie via __getattr__)\n#   testing optional duck-typed callable       -> getattr(o, \"close\", None); if close: close()\n#\n# Anti-pattern: hasattr on objects that define __getattr__ or descriptors with side effects.\n#   hasattr swallows ALL exceptions in older Python (and AttributeError in 3.x), so a getter\n#   that raises during DB lookup will silently report \"attribute missing\". Either guarantee the\n#   attribute exists at construction time, or wrap the actual operation in try/except so you\n#   see the real error."
                  }
        ],
        tips: [
                  "`hasattr(x, \"y\")` is equivalent to a try/except with getattr — use hasattr for clarity",
                  "Prefer `getattr(obj, \"attr\", default)` over `hasattr()` + `getattr()` — avoids two attribute lookups",
                  "In practice, use hasattr() for conditionals; use getattr() for single operations with defaults",
                  "Never use hasattr() on methods without a clear reason — it may trigger side effects if __getattr__ is defined"
        ],
        mistake: "Checking `hasattr(d, \"bark\")` then separately calling `getattr(d, \"bark\")()` — two attribute lookups. Use `getattr(d, \"bark\", None)` and call directly if not None.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "vars",
        fn: "vars()",
        desc: "Return the __dict__ attribute of an object — instance attributes only.",
        category: "I/O",
        subtitle: "Inspect instance namespace as a dictionary",
        signature: "vars(obj) -> dict | vars() -> dict (locals)",
        descLong: "vars() returns the __dict__ of an object, which is a dictionary of instance attributes. On a module, returns its namespace. With no argument, vars() is equivalent to locals() and returns the current local scope. Use vars() to inspect instance state; use dir() to discover all available attributes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of vars() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: see an object's instance attributes as a plain dict\nclass Dog:\n    def __init__(self, name, age):\n        self.name = name\n        self.age  = age\nd = Dog(\"Rex\", 3)\nvars(d)      # → {'name': 'Rex', 'age': 3}\nd.__dict__   # → same thing — vars() is just a cleaner way to call it"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of vars() — common patterns you'll see in production.\n# APPROACH  - Combine vars() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: understand the difference between vars() and dir()\nclass Dog:\n    species = \"Canis lupus\"       # class attribute\n    def __init__(self, name):\n        self.name = name          # instance attribute\n    def bark(self): return \"Woof\"\nd = Dog(\"Rex\")\n# WHY: vars() only shows instance attributes — not class attrs or methods\nvars(d)         # → {'name': 'Rex'}\n# WHY: dir() shows everything — class attrs, methods, inherited dunders\n\"species\" in vars(d)  # → False  (it's a class attribute)\n\"species\" in dir(d)   # → True"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of vars() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nimport json\n# GOAL: serialize a simple object to JSON using vars()\nclass Person:\n    def __init__(self, name, age):\n        self.name = name\n        self.age  = age\np    = Person(\"Alice\", 30)\ndata = vars(p)           # → {'name': 'Alice', 'age': 30}\njson.dumps(data)         # → '{\"name\": \"Alice\", \"age\": 30}'\n# NOTE: vars() only works on objects with a __dict__ — won't work on slots or built-in types\n# Use dataclasses.asdict() for dataclasses, which handles nested objects too\n#\n# Decision rule:\n#   inspect a regular instance's attrs        -> vars(obj) (returns __dict__)\n#   serialize a dataclass                     -> dataclasses.asdict(obj) (recursive, types ok)\n#   serialize a Pydantic model                -> model.model_dump()\n#   need methods + class attrs too            -> dir(obj) (not vars)\n#   namespace inside current function         -> vars() / locals()\n#   module's globals                          -> vars(module) / module.__dict__\n#   __slots__ class                           -> getattr per name (no __dict__ exists)\n#\n# Anti-pattern: using vars() to \"see all attributes\" of an object.\n#   vars() only returns instance __dict__ — class attributes, inherited attributes, methods,\n#   and slot fields are absent. Beginners then \"lose\" attributes they know exist on the class.\n#   Use dir() for the full attribute surface; use vars() only when you specifically want the\n#   per-instance state dict (e.g. for serialization or copying)."
                  }
        ],
        tips: [
                  "`vars(obj)` is equivalent to `obj.__dict__` — only shows instance attributes, not class or inherited",
                  "`vars()` with no argument returns the current local scope — same as `locals()`; at module level, same as `globals()`",
                  "Use `vars()` to serialize an object to a dict: `json.dumps(vars(obj))` for simple data classes",
                  "Class attributes do not appear in `vars(instance)` — use `dir()` to see inherited and class attributes"
        ],
        mistake: "Using `vars(obj)` expecting to see class methods or inherited attributes. `vars()` only shows instance attributes. Use `dir(obj)` to discover all attributes.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "dir",
        fn: "dir()",
        desc: "List all attributes and methods of an object, including inherited ones.",
        category: "I/O",
        subtitle: "Discovery tool — find what an object can do",
        signature: "dir(obj) -> list[str]",
        descLong: "dir() returns a sorted list of all attribute names available on an object, including instance attributes, class attributes, inherited attributes, and methods. Includes dunder (magic) methods. Use dir() to explore unfamiliar objects and discover available methods.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dir() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: see everything an object has — attributes, methods, and inherited dunders\nimport math\ndir(math)         # → long list of functions: 'acos', 'asin', 'ceil', 'pi', ...\n\"pi\" in dir(math) # → True"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dir() — common patterns you'll see in production.\n# APPROACH  - Combine dir() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: explore an unfamiliar object and filter out the noise\nclass Dog:\n    def __init__(self, name): self.name = name\n    def bark(self): return \"Woof\"\nd = Dog(\"Rex\")\n# WHY: raw dir() includes dozens of dunder methods — filter them out to see what matters\npublic = [a for a in dir(d) if not a.startswith(\"_\")]\n# → ['bark', 'name']"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dir() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: list only callable methods (not data attributes)\nclass Dog:\n    species = \"Canis lupus\"\n    def __init__(self, name): self.name = name\n    def bark(self): return \"Woof\"\nd = Dog(\"Rex\")\n# WHY: callable() filters out plain data attributes, leaving only methods\nmethods = [m for m in dir(d) if callable(getattr(d, m)) and not m.startswith(\"_\")]\n# → ['bark']\n# NOTE: dir() is for exploration and debugging — don't rely on its output in production logic\n#\n# Decision rule:\n#   exploring an unfamiliar object in REPL    -> dir(obj)\n#   programmatically discover methods         -> inspect.getmembers(obj, callable)\n#   only public API                            -> [a for a in dir(obj) if not a.startswith(\"_\")]\n#   only this instance's attrs                -> vars(obj)\n#   \"what type is this?\"                      -> type(obj) / isinstance(obj, X)\n#   help on a function                         -> help(obj) / obj.__doc__\n#   listing module exports                    -> module.__all__ (curated) > dir(module)\n#\n# Anti-pattern: using dir() output as the source of truth for an object's API.\n#   dir() includes private dunders, inherited helpers, and IDE/debugger-injected attributes;\n#   it is a discovery aid, not a contract. Production code should target documented attributes\n#   or use inspect.signature / typing.Protocol / hasattr to test specific things, never iterate\n#   over dir() and call everything that \"looks public\"."
                  }
        ],
        tips: [
                  "`dir(obj)` shows everything — use to discover available methods when exploring an unknown object",
                  "`[a for a in dir(obj) if not a.startswith(\"_\")]` filters out dunder methods for cleaner exploration",
                  "`dir()` with no argument returns the current local scope — useful in interactive debugging",
                  "Combine with `callable()` to list methods only: `[m for m in dir(obj) if callable(getattr(obj, m))]`"
        ],
        mistake: "Using `dir(obj)` and being confused by dunder methods. Most dunder methods are internal. Filter with `if not name.startswith(\"_\")` to see public attributes only.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "sys-module",
        fn: "sys module",
        desc: "Access interpreter variables and control the Python runtime.",
        category: "I/O",
        subtitle: "sys.argv, sys.exit, sys.path, sys.stdin/stdout/stderr",
        signature: "import sys | sys.argv | sys.exit(code)",
        descLong: "The sys module provides access to Python interpreter internals — command-line arguments, the module search path, stdin/stdout/stderr streams, and the ability to exit the program. Essential for CLI scripts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sys module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\nimport sys\n# GOAL: read command-line arguments passed to the script\n# Running:  python script.py hello world\nsys.argv        # → ['script.py', 'hello', 'world']\nsys.argv[0]     # → 'script.py'  (script name — not an arg)\nsys.argv[1:]    # → ['hello', 'world']  (the actual arguments)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sys module — common patterns you'll see in production.\n# APPROACH  - Combine sys module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\nimport sys\n# GOAL: exit the program and check the Python version\nsys.exit(0)         # clean exit — 0 means success\nsys.exit(1)         # exit with an error code\n# WHY: non-zero exit codes signal failure to the shell or CI system\nif len(sys.argv) < 2:\n    print(\"Usage: script.py <filename>\", file=sys.stderr)\n    sys.exit(1)\n# WHY: version_info lets you guard against running on the wrong Python version\nif sys.version_info < (3, 10):\n    sys.exit(\"Requires Python 3.10+\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sys module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nimport sys\n# GOAL: read from stdin and write errors to stderr without mixing with stdout\n# WHY: piped data comes through sys.stdin — useful for Unix-style pipelines\nfor line in sys.stdin:\n    print(line.strip().upper())   # reads lines from pipe\n# WHY: sys.stderr keeps error messages out of stdout — important when stdout is piped\nprint(\"Missing file\", file=sys.stderr)\n# NOTE: never call sys.exit() inside a library — it kills the whole process\n# Raise an exception instead and let the calling script decide whether to exit\n#\n# Decision rule:\n#   trivial argv access in 5-line script      -> sys.argv[1:]\n#   real CLI with flags, help, types          -> argparse / click / typer\n#   end script after fatal error               -> sys.exit(1) (top-level scripts only)\n#   stop a library function                   -> raise Exception (NEVER sys.exit)\n#   read piped data                           -> sys.stdin\n#   write progress / errors                   -> sys.stderr (keep stdout machine-readable)\n#   guard for python version                  -> sys.version_info >= (3, 11)\n#   tweak import path at runtime              -> sys.path.insert(0, ...) (last resort; prefer pkg install)\n#\n# Anti-pattern: calling sys.exit() inside library code.\n#   sys.exit() raises SystemExit which terminates the whole interpreter unless something\n#   catches it. Library callers expect exceptions or return codes — killing their process is\n#   surprising. Raise a custom exception (or ValueError); let __main__ scripts decide whether\n#   to translate it into an exit code."
                  }
        ],
        tips: [
                  "`sys.argv[0]` is always the script name — your arguments start at `sys.argv[1]`",
                  "`sys.exit(0)` is clean exit; any non-zero code signals an error to the calling process",
                  "`print(\"error msg\", file=sys.stderr)` writes to stderr — does not pollute stdout output",
                  "For proper CLI argument parsing, use `argparse` — `sys.argv` is only for simple scripts"
        ],
        mistake: "Using `sys.exit()` inside a library function. It terminates the entire Python process — not just your function. Raise an exception instead and let the caller decide.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "os-module",
        fn: "os module",
        desc: "Operating system interface — files, directories, processes, environment.",
        category: "I/O",
        subtitle: "os.getcwd, os.listdir, os.makedirs, os.environ, os.path",
        signature: "import os | os.getcwd() | os.path.join(a, b)",
        descLong: "The os module provides a portable interface to operating system functionality. For file paths, prefer pathlib.Path — but os.environ, os.getcwd(), os.makedirs(), and os.listdir() are still widely used. os.path functions are largely replaced by pathlib but appear in legacy code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of os module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\nimport os\n# GOAL: inspect and navigate the filesystem\nos.getcwd()          # → '/home/user/project'  (current directory)\nos.listdir('.')      # → ['main.py', 'data', 'README.md']  (contents)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of os module — common patterns you'll see in production.\n# APPROACH  - Combine os module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\nimport os\n# GOAL: create directories and read environment variables safely\n# WHY: exist_ok=True means no error if the directory already exists — safe to call repeatedly\nos.makedirs(\"output/reports\", exist_ok=True)\n# WHY: .get() returns a default instead of raising KeyError on missing vars\ndebug = os.environ.get(\"DEBUG\", \"false\")\ndb_url = os.environ.get(\"DATABASE_URL\", \"sqlite:///local.db\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of os module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nimport os\n# GOAL: walk an entire directory tree and collect all file paths\n# WHY: os.walk yields (root, dirs, files) for every folder in the tree\nall_files = []\nfor root, dirs, files in os.walk(\"src\"):\n    for f in files:\n        all_files.append(os.path.join(root, f))\n# NOTE: for new code, prefer pathlib — Path(\"src\").rglob(\"*\") is more readable\n# os.path.join is still valuable when working with legacy code or string-based APIs\n#\n# Decision rule:\n#   any path manipulation in new code         -> pathlib.Path\n#   read env var with default                 -> os.environ.get(\"KEY\", default)\n#   recursive directory walk                  -> Path.rglob(\"*\") (or os.walk for control)\n#   create dirs idempotently                  -> os.makedirs(p, exist_ok=True) / Path.mkdir(parents=True, exist_ok=True)\n#   spawn subprocess                          -> subprocess.run (NOT os.system)\n#   atomic file replace                       -> os.replace(src, dst)\n#   temp dir / file                           -> tempfile module\n#   string-based legacy API needs str path    -> os.path.join / os.fspath(path)\n#\n# Anti-pattern: building paths with f-strings or \"+\" string concatenation.\n#   `f\"{dir}/{file}\"` breaks on Windows backslashes, double slashes, and missing separators;\n#   it also mixes user input with code in a way that's brittle. Use Path(dir) / file (or\n#   os.path.join) — handles separators, normalizes empties, works cross-platform."
                  }
        ],
        tips: [
                  "Use `pathlib.Path` for new code — `os.path` functions are largely superseded",
                  "`os.makedirs(path, exist_ok=True)` is idempotent — safe to call even if directory exists",
                  "`os.environ.get(\"KEY\", \"default\")` is safer than `os.environ[\"KEY\"]` — no KeyError on missing",
                  "`os.walk()` is the classic recursive directory traversal — `Path.rglob()` is the modern equivalent"
        ],
        mistake: "String concatenation for paths: `dir + \"/\" + file`. Use `os.path.join(dir, file)` or `Path(dir) / file` — handles Windows backslashes correctly.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 2: Built-in Functions ─────────────────────────────────────────
  {
    id: "builtins",
    title: "Built-in Functions",
    entries: [
      {
        id: "len",
        fn: "len()",
        desc: "Return the number of items in a sequence or collection.",
        category: "Builtins",
        subtitle: "Get the length of any iterable",
        signature: "len(obj) -> int",
        descLong: "len() returns the number of items in any sequence, collection, or object with a __len__() method. Works on strings, lists, tuples, sets, dicts, and custom objects. Time complexity is O(1) for built-in types.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of len() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: count items in common data structures\nlen(\"hello\")          # → 5\nlen([1, 2, 3])        # → 3\nlen({\"a\": 1, \"b\": 2}) # → 2  (counts keys)\nlen(range(10))        # → 10  (O(1) — no iteration)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of len() — common patterns you'll see in production.\n# APPROACH  - Combine len() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use len() in guards and conditions\nitems = [1, 2, 3]\n# WHY: check length before accessing index to avoid IndexError\nif len(items) >= 2:\n    print(items[1])   # → 2\n# WHY: len() on a range is O(1) — range doesn't expand into a list\nprint(len(range(0, 100, 5)))  # → 20"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of len() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: support len() on a custom class by implementing __len__\nclass Playlist:\n    def __init__(self, tracks):\n        self.tracks = tracks\n    def __len__(self):\n        return len(self.tracks)\np = Playlist([\"Song A\", \"Song B\", \"Song C\"])\nlen(p)   # → 3\n# NOTE: if an iterable has no __len__ (e.g. a generator), use sum(1 for _ in it) to count\n# but be aware that exhausts the generator\n#\n# Decision rule:\n#   list / tuple / str / set / dict           -> len(x) (O(1))\n#   range / NumPy array / pandas Series        -> len(x) (still O(1))\n#   generator / file iterator                  -> sum(1 for _ in it) (CONSUMES the iterator)\n#   one-shot iterator you'll need later        -> list(it) first, then len()\n#   custom class                               -> implement __len__\n#   \"is it empty?\"                             -> if not container: (NOT len(c) == 0)\n#   \"more than N items?\"                       -> any(True for _, _ in zip(it, range(N+1)))\n#\n# Anti-pattern: writing `if len(lst) > 0:` or `if len(lst) == 0:`.\n#   Empty containers are falsy, non-empty are truthy. Write `if lst:` or `if not lst:` — it's\n#   shorter, idiomatic, and works for any container type. The len() check also fails on\n#   generators (TypeError) where truthiness checking via `if it:` would also fail — for\n#   generators use `first = next(it, None)` to peek."
                  }
        ],
        tips: [
                  "`len()` works on any object with a `__len__()` method — lists, tuples, sets, dicts, strings, ranges",
                  "For iterables without `__len__()` (generators, file objects), use `sum(1 for _ in it)` if you need the count",
                  "On strings and sequences, `len()` is always O(1) — it does not iterate",
                  "`len() > 0` is more Pythonic than checking `if not empty:`"
        ],
        mistake: "Checking `len(lst) > 0` before iterating. Just write `for item in lst:` — it works correctly on empty sequences.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "range",
        fn: "range()",
        desc: "Generate a lazy sequence of integers.",
        category: "Builtins",
        subtitle: "Immutable sequence — O(1) memory regardless of size",
        signature: "range(start, stop, step) -> range object",
        descLong: "range() generates a lazy sequence of integers without creating a list. It supports start, stop, and step arguments. Supports O(1) indexing and membership testing. Always prefer range() over building a list with a loop.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of range() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: generate a sequence of integers for looping\nfor i in range(5):        # → 0 1 2 3 4  (stop is exclusive)\n    print(i)\nlist(range(2, 8))         # → [2, 3, 4, 5, 6, 7]\nlist(range(0, 10, 2))     # → [0, 2, 4, 6, 8]  (step=2)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of range() — common patterns you'll see in production.\n# APPROACH  - Combine range() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: count down and test membership efficiently\n# WHY: negative step lets you iterate in reverse without reversing the list\nfor i in range(5, -1, -1):\n    print(i)              # → 5 4 3 2 1 0\n# WHY: membership test on range is O(1) — no iteration needed\n50 in range(0, 100, 5)    # → True  (instantly, no loop)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of range() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: understand range's lazy O(1) behaviour\nr = range(10**9)           # 1 billion \"elements\" — uses almost no memory\nlen(r)                     # → 1000000000  (O(1))\nr[999_999_999]             # → 999999999   (O(1) indexing)\n# WHY: range is a view, not a list — safe to create enormous ranges\n# NOTE: use enumerate(lst) instead of range(len(lst)) when you need both index and value\nfor i, val in enumerate([\"a\", \"b\", \"c\"]):\n    print(i, val)          # cleaner than range(len(...))\n#\n# Decision rule:\n#   \"do this N times\" loop                    -> for _ in range(N):\n#   need integer indices 0..N-1               -> for i in range(N):\n#   need index AND value of a list            -> for i, x in enumerate(lst): (NOT range(len(lst)))\n#   counting down                              -> range(n, -1, -1) or reversed(range(n+1))\n#   numeric ranges with floats                 -> numpy.arange / numpy.linspace (range is int-only)\n#   build a list of integers                  -> list(range(n))\n#   testing membership in arithmetic seq      -> x in range(...) (O(1))\n#\n# Anti-pattern: writing `for i in range(len(lst)): item = lst[i]`.\n#   This is the C-style index loop in Python — verbose, off-by-one prone, and slower than\n#   `for item in lst:`. If you need both, use `for i, item in enumerate(lst):`. The only\n#   legitimate `range(len(...))` cases are when you must mutate by index or zip multiple\n#   sequences by position (and even then, zip(a, b) handles most of those)."
                  }
        ],
        tips: [
                  "`range()` is lazy — `range(10**9)` uses constant memory, never allocates a list",
                  "`range` supports O(1) indexing: `range(0, 100)[50]` returns 50 instantly",
                  "Use `enumerate(lst)` instead of `range(len(lst))` when you need both index and value",
                  "`for _ in range(n):` uses `_` as a throwaway variable when the count is all you need"
        ],
        mistake: "Using `range(len(lst))` in a for loop when you need the item: `for i in range(len(lst)): print(lst[i])`. Use `for item in lst:` or `for i, item in enumerate(lst):`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "sum-min-max",
        fn: "Numeric built-ins",
        desc: "Aggregate and numeric built-in functions.",
        category: "Builtins",
        subtitle: "Reduce sequences to a single numeric value",
        signature: "sum(iterable, start=0) | min(it, key=fn) | max(it, key=fn)",
        descLong: "sum(), min(), and max() work on any iterable. min() and max() accept a key= function for custom comparison logic. round() uses banker's rounding (round half to even) — which can surprise you on .5 values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Numeric built-ins — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\nnums = [3, 1, 4, 1, 5, 9]\nsum(nums)          # → 23\nmin(nums)          # → 1\nmax(nums)          # → 9\nabs(-7)            # → 7\nround(3.14159, 2)  # → 3.14"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Numeric built-ins — common patterns you'll see in production.\n# APPROACH  - Combine Numeric built-ins with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use key= to find min/max by a computed property\nwords = [\"banana\", \"apple\", \"fig\", \"cherry\"]\n# WHY: key= tells min/max what to compare — no need to sort the whole list\nmin(words, key=len)         # → 'fig'      (shortest word)\nmax(words, key=len)         # → 'banana'   (longest word)\n# WHY: sum() with a generator avoids building an intermediate list\ntotal_squares = sum(x**2 for x in range(10))  # → 285"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Numeric built-ins — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: watch out for banker's rounding and use fast modular pow\nround(2.5)   # → 2  (rounds to even — not 3!)\nround(3.5)   # → 4  (rounds to even)\n# WHY: Python follows IEEE 754 banker's rounding — surprises people expecting \"round half up\"\n# Use math.floor(x + 0.5) if you always need round-half-up behaviour\n# WHY: three-argument pow() uses fast modular exponentiation — much faster than (base**exp) % mod\npow(2, 10, 1000)   # → 24  (2^10 mod 1000, computed efficiently)\n# NOTE: min(it, key=fn) is faster than sorted(it, key=fn)[0] — avoids sorting the whole list\n#\n# Decision rule:\n#   add up numbers in iterable                -> sum(iterable) (NOT reduce(+, ...))\n#   smallest / largest by natural order       -> min(it) / max(it)\n#   smallest / largest by computed key        -> min(it, key=fn)\n#   need top-K, not just one                  -> heapq.nlargest(k, it) / nsmallest\n#   absolute value                             -> abs(x)\n#   round to N decimals                       -> round(x, n) (banker's rounding!)\n#   need round-half-up always                 -> int(x + 0.5) for positives or decimal.ROUND_HALF_UP\n#   modular exponentiation                    -> pow(base, exp, mod) (huge perf win for crypto)\n#\n# Anti-pattern: `sum(lst_of_lists, [])` to flatten nested lists.\n#   This works but is O(n²) because each + creates a new list. Use\n#   `list(itertools.chain.from_iterable(lst_of_lists))` for O(n), or for NumPy/pandas data use\n#   their native concat / np.concatenate. The sum() trick is famous on Stack Overflow but is\n#   actively bad on more than ~100 sublists."
                  }
        ],
        tips: [
                  "`min(it, key=fn)` is more efficient than `sorted(it, key=fn)[0]` — avoids sorting the whole list",
                  "`sum(gen)` with a generator expression avoids building an intermediate list",
                  "`round(2.5) == 2` — Python uses banker's rounding. Use `math.floor(x + 0.5)` for always-round-up",
                  "`pow(base, exp, mod)` is much faster than `(base**exp) % mod` for large numbers"
        ],
        mistake: "Calling `sum([[1,2],[3,4]], [])` to flatten a list. It works but is O(n²). Use `list(itertools.chain.from_iterable([[1,2],[3,4]]))` for O(n).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "any-all",
        fn: "any() / all()",
        desc: "Test whether any or all items in an iterable are truthy.",
        category: "Builtins",
        subtitle: "Short-circuiting boolean reduction over iterables",
        signature: "any(iterable) -> bool | all(iterable) -> bool",
        descLong: "any() returns True if at least one element is truthy; all() returns True if every element is truthy. Both short-circuit — they stop as soon as the result is determined. Use with generator expressions to avoid building intermediate lists.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of any() / all() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: test whether any or all values in a list pass a condition\nnums = [1, -2, 3, -4, 5]\nany(x > 0 for x in nums)   # → True   (1 passes — stops immediately)\nall(x > 0 for x in nums)   # → False  (-2 fails — stops immediately)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of any() / all() — common patterns you'll see in production.\n# APPROACH  - Combine any() / all() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: validate a form — all fields must be filled\nname, email, phone = \"Alice\", \"alice@example.com\", \"\"\n# WHY: all() short-circuits — stops at the first empty field\nall_filled = all(len(f) > 0 for f in [name, email, phone])\n# → False  (phone is empty)\n# WHY: any() as a readable \"does this exist\" check\nusers = [{\"role\": \"editor\"}, {\"role\": \"admin\"}]\nhas_admin = any(u[\"role\"] == \"admin\" for u in users)\n# → True"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of any() / all() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: use generator expressions — NOT list comprehensions — to keep short-circuit benefit\nnums = [1, -2, 3, -4, 5]\n# WHY: a list comprehension builds the whole list first, then checks — no short-circuit\nany([x > 0 for x in nums])  # evaluates all 5 items even though 1 passes immediately\n# WHY: a generator expression only evaluates until the answer is known\nany(x > 0 for x in nums)    # stops after the first truthy value\n# NOTE: all([]) is True (vacuous truth) and any([]) is False — guard with .length if needed\n#\n# Decision rule:\n#   \"at least one passes\"                     -> any(cond(x) for x in it)\n#   \"every one passes\"                        -> all(cond(x) for x in it)\n#   need the matching item, not just bool     -> next((x for x in it if cond), default)\n#   short-circuit on huge iterable            -> any/all with GENERATOR (not list comp!)\n#   combine multiple conditions on one item   -> all([c1, c2, c3]) on already-eval'd values\n#   bool-array reduction in NumPy             -> arr.any() / arr.all() (vectorized)\n#   \"no item passes\"                          -> not any(cond(x) for x in it)\n#\n# Anti-pattern: passing a list comprehension to any/all instead of a generator.\n#   `any([is_valid(x) for x in items])` evaluates is_valid for every item and builds a list,\n#   killing the short-circuit benefit. Drop the brackets: `any(is_valid(x) for x in items)`\n#   stops at the first True. The same applies to all(), max(), min(), and sorted-key callbacks\n#   when the iterable is large or expensive to compute."
                  }
        ],
        tips: [
                  "Both `any()` and `all()` short-circuit — use generator expressions, not list comprehensions, to get that benefit",
                  "`all([])` is `True` (vacuous truth) and `any([])` is `False` — important edge cases",
                  "Combine with `map()`: `all(map(str.isdigit, chars))` — but generators are more readable",
                  "For \"find first match\", use `next((x for x in it if cond), default)` instead of `any()`"
        ],
        mistake: "Writing `any([x > 0 for x in nums])` with a list comprehension. This builds the full list before checking. Use `any(x > 0 for x in nums)` with a generator — it stops at the first True.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "enumerate",
        fn: "enumerate()",
        desc: "Iterate with both index and value simultaneously.",
        category: "Builtins",
        subtitle: "The correct way to loop with an index",
        signature: "enumerate(iterable, start=0) -> (index, item) pairs",
        descLong: "enumerate() wraps any iterable and yields (index, item) tuples. It is the idiomatic way to loop when you need both the index and the value — always prefer it over range(len(lst)).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of enumerate() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: loop with both position and value at the same time\nfruits = [\"apple\", \"banana\", \"cherry\"]\nfor i, fruit in enumerate(fruits):\n    print(i, fruit)\n# → 0 apple\n# → 1 banana\n# → 2 cherry"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of enumerate() — common patterns you'll see in production.\n# APPROACH  - Combine enumerate() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: produce 1-based numbering for display\nfruits = [\"apple\", \"banana\", \"cherry\"]\n# WHY: start=1 offsets the index — no need for i+1 inside the loop\nfor i, fruit in enumerate(fruits, start=1):\n    print(f\"{i}. {fruit}\")\n# → 1. apple\n# → 2. banana\n# → 3. cherry"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of enumerate() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: build a reverse-lookup dict and find an index without a loop\nfruits = [\"apple\", \"banana\", \"cherry\"]\n# WHY: dict comprehension from enumerate gives O(1) lookup by value\nindex_map = {val: i for i, val in enumerate(fruits)}\n# → {'apple': 0, 'banana': 1, 'cherry': 2}\n# WHY: next() with a generator finds the first match without scanning the whole list\nidx = next((i for i, x in enumerate(fruits) if x == \"banana\"), -1)\n# → 1  (-1 if not found)\n# NOTE: always prefer enumerate over range(len(lst)) — it works on any iterable, not just lists\n#\n# Decision rule:\n#   need index AND value of an iterable       -> enumerate(it) (NOT range(len))\n#   1-based numbering for display             -> enumerate(it, start=1)\n#   need value only                            -> for x in it (no enumerate)\n#   need index only                            -> for i in range(len(lst)) (rare; usually enumerate)\n#   pair items between two lists               -> zip(a, b) (not enumerate of indices)\n#   reverse-lookup dict                       -> {v: i for i, v in enumerate(lst)}\n#   first index satisfying predicate           -> next((i for i, x in enumerate(it) if pred(x)), -1)\n#\n# Anti-pattern: `for i in range(len(lst)): print(i, lst[i])`.\n#   Verbose, slower (extra subscript per iteration), breaks on non-list iterables (sets, gens),\n#   and obscures intent. `enumerate(lst)` is one token shorter, works on any iterable, and\n#   communicates \"I need the index\" plainly. The same applies to `range(0, len(lst))` — also\n#   redundant."
                  }
        ],
        tips: [
                  "`enumerate(lst, start=1)` is the cleanest way to produce 1-based numbering",
                  "Unpack directly in the for clause: `for i, val in enumerate(lst):` — cleaner than `enumerate(lst)[0]`",
                  "Build a reverse lookup dict in one line: `{val: i for i, val in enumerate(lst)}`",
                  "`enumerate()` works on any iterable — strings, generators, files, not just lists"
        ],
        mistake: "`for i in range(len(lst)): x = lst[i]`. This is the C-style loop. Python idiom: `for i, x in enumerate(lst):`. Cleaner, faster, and works on any iterable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "zip",
        fn: "zip()",
        desc: "Pair up multiple iterables element by element.",
        category: "Builtins",
        subtitle: "Iterate over multiple sequences in parallel",
        signature: "zip(*iterables, strict=False) | zip_longest(*its, fillvalue=None)",
        descLong: "zip() yields tuples pairing the nth element of each iterable. It stops at the shortest iterable by default. Use strict=True (Python 3.10+) to raise if lengths differ. itertools.zip_longest fills in a default value for the shorter side.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of zip() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: loop over two lists in parallel\nnames  = [\"Alice\", \"Bob\", \"Carol\"]\nscores = [92, 88, 95]\nfor name, score in zip(names, scores):\n    print(name, score)\n# → Alice 92  Bob 88  Carol 95"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of zip() — common patterns you'll see in production.\n# APPROACH  - Combine zip() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: build a dict from two lists and unzip pairs\nnames  = [\"Alice\", \"Bob\", \"Carol\"]\nscores = [92, 88, 95]\n# WHY: dict(zip(...)) is the idiomatic one-liner for this pattern\nd = dict(zip(names, scores))\n# → {'Alice': 92, 'Bob': 88, 'Carol': 95}\n# WHY: zip(*pairs) transposes — swaps rows and columns\npairs = [(1, \"a\"), (2, \"b\"), (3, \"c\")]\nnums, letters = zip(*pairs)\n# → (1, 2, 3)  ('a', 'b', 'c')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of zip() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nfrom itertools import zip_longest\n# GOAL: handle lists of unequal length safely\nnames  = [\"Alice\", \"Bob\", \"Carol\"]\nscores = [92, 88]            # one score missing\n# WHY: plain zip silently drops 'Carol' — no warning\nlist(zip(names, scores))     # → [('Alice',92), ('Bob',88)]\n# WHY: strict=True raises ValueError if lengths differ — catches bugs early\nlist(zip(names, scores, strict=True))  # → ValueError\n# WHY: zip_longest fills the short side instead of truncating\nlist(zip_longest(names, scores, fillvalue=0))\n# → [('Alice',92), ('Bob',88), ('Carol',0)]\n#\n# Decision rule:\n#   parallel iteration over equal-length seqs -> zip(a, b)\n#   want to fail fast if lengths differ        -> zip(a, b, strict=True) (3.10+)\n#   pad shorter side with default              -> itertools.zip_longest(a, b, fillvalue=...)\n#   build dict from keys, values lists         -> dict(zip(keys, vals))\n#   transpose rows<->cols                     -> zip(*rows)\n#   need only one element from each iterable  -> next(zip(it1, it2, ...))\n#   numeric vectorization                      -> NumPy / pandas, NOT zip in a Python loop\n#\n# Anti-pattern: relying on zip's silent truncation as a feature.\n#   When two lists should be the same length but aren't, plain zip drops the tail of the longer\n#   one with no warning, hiding data bugs (e.g. you load 100 names but only 99 emails). In\n#   3.10+, default to zip(..., strict=True) anywhere lengths are supposed to match — it raises\n#   ValueError and surfaces the mismatch immediately."
                  }
        ],
        tips: [
                  "`dict(zip(keys, values))` is the cleanest one-liner for building a dict from two lists",
                  "`zip(*list_of_lists)` transposes a 2D structure — a classic Python idiom",
                  "`zip(..., strict=True)` (Python 3.10+) is a safety net — raises if the lists have different lengths",
                  "`zip()` is lazy — it does not build a list. Wrap in `list()` when you need to inspect or reuse"
        ],
        mistake: "Forgetting that `zip()` silently truncates to the shortest iterable. If `names` has 10 items and `scores` has 9, you silently lose one pairing. Use `strict=True` to catch this.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "map-filter-sorted",
        fn: "sorted()",
        desc: "Transform, select, and sort iterables.",
        category: "Builtins",
        subtitle: "Functional-style operations — prefer comprehensions for readability",
        signature: "map(fn, it) | filter(fn, it) | sorted(it, key=fn, reverse=True)",
        descLong: "map() applies a function to every item; filter() selects items where the function returns truthy. Both return lazy iterators. sorted() always returns a new list, accepts a key= function, and is stable. List comprehensions are usually preferred over map()/filter() for readability.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of sorted() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: sort a list — sorted() returns a new list, .sort() mutates in place\nnums  = [3, 1, 4, 1, 5]\nwords = [\"banana\", \"apple\", \"cherry\"]\nsorted(nums)               # → [1, 1, 3, 4, 5]\nsorted(nums, reverse=True) # → [5, 4, 3, 1, 1]\nsorted(words)              # → ['apple', 'banana', 'cherry']"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of sorted() — common patterns you'll see in production.\n# APPROACH  - Combine sorted() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: sort objects by a property using key=\nusers = [\n    {\"name\": \"Carol\", \"score\": 88},\n    {\"name\": \"Alice\", \"score\": 92},\n    {\"name\": \"Bob\",   \"score\": 65},\n]\n# WHY: key= tells sorted() what to compare — the lambda extracts the field\nby_score = sorted(users, key=lambda u: u[\"score\"], reverse=True)\n# → [Alice 92, Carol 88, Bob 65]\n# WHY: map() applies a function to every item lazily\nnames_upper = list(map(str.upper, [\"alice\", \"bob\"]))\n# → ['ALICE', 'BOB']"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of sorted() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: sort by multiple criteria and understand sort stability\nusers = [\n    {\"name\": \"Bob\",   \"score\": 88},\n    {\"name\": \"Alice\", \"score\": 92},\n    {\"name\": \"Carol\", \"score\": 88},\n]\n# WHY: tuple key sorts by score descending, then name ascending as a tiebreaker\nranked = sorted(users, key=lambda u: (-u[\"score\"], u[\"name\"]))\n# → [Alice 92, Bob 88, Carol 88]  (Bob before Carol alphabetically)\n# NOTE: sorted() is stable — equal items keep their original order from the input\n# NOTE: lst = lst.sort() assigns None — .sort() returns None, not the sorted list\n#\n# Decision rule:\n#   transform every item                       -> [f(x) for x in it] (list comp, not map)\n#   filter items by predicate                  -> [x for x in it if pred(x)]\n#   transform + filter combined                -> [f(x) for x in it if pred(x)]\n#   sort, return new list                      -> sorted(it, key=...)\n#   sort in place (mutate)                     -> lst.sort(key=...)\n#   need top-k items only                      -> heapq.nlargest(k, it, key=...) (faster than sort)\n#   already-callable as key (e.g. attr/index) -> operator.itemgetter / attrgetter (faster than lambda)\n#   sorting numeric arrays                     -> NumPy np.sort / np.argsort (vectorized)\n#\n# Anti-pattern: `lst = lst.sort()` — assigning the result of in-place sort.\n#   list.sort() returns None to signal mutation; you've just clobbered your list with None.\n#   Pick one model: in-place `lst.sort()` (no assignment) OR functional `new = sorted(lst)`.\n#   The same trap exists for list.reverse() / list.append() / dict.update() — all return None\n#   on purpose."
                  }
        ],
        tips: [
                  "`sorted()` returns a new list; `list.sort()` is in-place and returns `None` — easy to mix up",
                  "`operator.itemgetter(0)` is faster than `lambda x: x[0]` for simple key functions",
                  "`sorted()` is stable — equal items keep their original relative order",
                  "For top-k, `heapq.nlargest(k, data, key=fn)` is faster than `sorted()[-k:]` when k is small"
        ],
        mistake: "`lst = lst.sort()` assigns `None` to `lst`. `list.sort()` returns `None` — it sorts in place. Use `lst.sort()` (no assignment) or `new = sorted(lst)`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 3: Control Flow ─────────────────────────────────────────
  {
    id: "control",
    title: "Control Flow",
    entries: [
      {
        id: "if-elif-else",
        fn: "if statement",
        desc: "Conditional branching.",
        category: "Control Flow",
        subtitle: "Evaluate conditions in order, execute the first matching branch",
        signature: "if condition: ... elif condition: ... else: ...",
        descLong: "Python conditionals are straightforward. elif chains are evaluated top to bottom — only the first matching branch runs. Truthiness: empty sequences/dicts/strings/0/None are falsy; everything else is truthy.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of if statement — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: branch on a condition\nscore = 85\nif score >= 90:\n    grade = \"A\"\nelif score >= 80:\n    grade = \"B\"\nelse:\n    grade = \"F\"\n# → grade = \"B\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of if statement — common patterns you'll see in production.\n# APPROACH  - Combine if statement with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use Python truthiness and identity checks correctly\nlst = [1, 2, 3]\n# WHY: empty collections are falsy — no need for len() check\nif lst:\n    print(\"has items\")\n# WHY: None is a singleton — always use 'is', never '== None'\nvalue = None\nif value is None:\n    print(\"not set\")\n# WHY: chained comparisons are more readable than two separate conditions\nscore = 85\nif 0 < score <= 100:\n    print(\"valid score\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of if statement — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: use short-circuit evaluation as a concise fallback\nuser_input = \"\"\nname = user_input or \"Anonymous\"   # → \"Anonymous\"  (user_input is falsy)\n# WHY: 'and' / 'or' return operand values, not just True/False\nconfig = loaded_config or default_config\n# NOTE: 'val or default' triggers the default for ANY falsy value — 0, \"\", []\n# Use a real ternary when 0 or \"\" is a valid value you want to keep:\ncount = 0\ndisplay = count if count is not None else \"N/A\"  # → 0, not \"N/A\"\n#\n# Decision rule:\n#   2 branches, simple values                  -> ternary x if cond else y\n#   3+ branches, simple value table            -> dict lookup table.get(key, default)\n#   3+ branches with logic per branch          -> if / elif / else\n#   pattern match on shape (3.10+)             -> match / case\n#   short-circuit \"x or default\"               -> only when 0/\"\"/[] should also default\n#   None-safe default                          -> x if x is not None else default\n#   range check                                -> chained comparison: low <= x <= high\n#   complex predicate reused 5+ places         -> def is_valid(x): ... (function, not nested ifs)\n#\n# Anti-pattern: `if x == None:` and `if x == True:`.\n#   None / True / False are singletons; use identity (`is None`, `is True`, `is False`). The\n#   == versions can be hijacked by overloaded __eq__ on custom or pandas types and are slower.\n#   Linters (ruff E711, E712) flag this for a reason — keep your falsy / None / bool checks\n#   identity-based."
                  }
        ],
        tips: [
                  "Python supports chained comparisons: `0 < x < 100` — cleaner than `x > 0 and x < 100`",
                  "Test for emptiness with `if lst:` not `if len(lst) > 0:` — more Pythonic and works for all sequences",
                  "Always use `is` to compare to `None`, `True`, `False` — never `== None`",
                  "`and`/`or` short-circuit and return one of their operands: `x = val or default` sets a fallback"
        ],
        mistake: "Using `== None` instead of `is None`. `None` is a singleton — identity check `is None` is correct and slightly faster.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "ternary",
        fn: "Ternary expression",
        desc: "Inline conditional expression — value if cond else other_value.",
        category: "Control Flow",
        subtitle: "Single-line conditional value selection",
        signature: "value_if_true if condition else value_if_false",
        descLong: "The ternary expression evaluates to one of two values based on a condition. It is an expression (returns a value), not a statement — so it can appear inside other expressions, assignments, list comprehensions, and function calls.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Ternary expression — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: pick one of two values based on a condition\nscore = 75\nlabel = \"pass\" if score >= 60 else \"fail\"\n# → \"pass\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Ternary expression — common patterns you'll see in production.\n# APPROACH  - Combine Ternary expression with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use the ternary inside expressions and list comprehensions\nn = -5\n# WHY: ternary is an expression — it can live inside f-strings, comprehensions, calls\nprint(f\"{'even' if n % 2 == 0 else 'odd'}\")  # → odd\n# WHY: useful inside a comprehension to transform conditionally\nnums   = [-3, 1, -2, 4]\nresult = [x if x >= 0 else 0 for x in nums]  # → [0, 1, 0, 4]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Ternary expression — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: know when NOT to use a ternary\npoints = 750\n# WHY: one level of nesting is readable — more than one gets confusing fast\ntier = \"gold\" if points > 1000 else \"silver\" if points > 500 else \"bronze\"\n# → \"silver\"  (works, but pushing the limit)\n# NOTE: when branches have side effects or are complex, use a full if/else block\n# ternary is for selecting VALUES — not for controlling flow\nif points > 1000:\n    send_reward_email()\n    tier = \"gold\"\nelse:\n    tier = \"bronze\"\n#\n# Decision rule:\n#   simple value selection                     -> x if cond else y\n#   inside f-string / comprehension            -> ternary (the only option)\n#   need to call functions with side effects   -> if / else statement (not ternary)\n#   2+ levels of nesting tempting              -> dict lookup or refactor to function\n#   default for None                           -> x if x is not None else default\n#   default for \"any falsy\"                    -> x or default\n#   3-way decision                             -> if / elif / else, NOT chained ternary\n#   value depends on type/shape                -> match / case (3.10+)\n#\n# Anti-pattern: chaining ternaries to emulate elif.\n#   `a if c1 else b if c2 else c if c3 else d` is right-associative and reads like a riddle in\n#   review. Use an if/elif/else statement (or a dict lookup if all branches are pure values),\n#   not a 4-deep ternary tower. The ternary is for two-way value selection — beyond that,\n#   readability beats brevity."
                  }
        ],
        tips: [
                  "The ternary is an *expression* — it has a value and can be used anywhere an expression is allowed",
                  "Keep ternaries to one level — nested ternaries become unreadable fast",
                  "`x = val or default` is a common pattern but falsy values (0, \"\") will trigger the default — use a real ternary when 0 or \"\" is valid",
                  "Use an if/else block when either branch has side effects"
        ],
        mistake: "Deep nesting: `a if c1 else b if c2 else c if c3 else d`. This is hard to read. Use a dict, a function, or an if/elif chain instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "walrus",
        fn: "Walrus operator :=",
        desc: "Assign and test in a single expression.",
        category: "Control Flow",
        subtitle: "Named expression — assign inside while, if, and comprehensions",
        signature: "if (n := compute()) > 0: use(n)",
        descLong: "The walrus operator := (Python 3.8+) assigns a value to a variable as part of an expression. It eliminates the \"compute twice\" pattern — where you compute a value to test it, then compute it again to use it.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Walrus operator := — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: assign and test in the same line\nimport re\n# WHY: without walrus you'd call re.search() once to check, then again to use it\ntext = \"Order placed on 2024-03-15\"\nif (m := re.search(r\"\\d{4}-\\d{2}-\\d{2}\", text)):\n    print(m.group())  # → 2024-03-15"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Walrus operator := — common patterns you'll see in production.\n# APPROACH  - Combine Walrus operator := with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: read a file in chunks without a separate priming read\n# WHY: walrus eliminates the awkward \"read, check, read again\" pattern in while loops\nwith open(\"data.bin\", \"rb\") as f:\n    while (chunk := f.read(8192)):   # assigns and tests in one step\n        process(chunk)               # chunk is always non-empty here"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Walrus operator := — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: avoid calling an expensive transform twice inside a comprehension\ndata = [1, -2, 3, -4, 5]\ndef expensive(x):\n    return x * 2   # imagine this is slow\n# WHY: without walrus, expensive() is called twice per item — once to filter, once to include\nbad  = [expensive(x) for x in data if expensive(x) > 0]\n# WHY: walrus captures the result once — filter and output use the same computed value\ngood = [y for x in data if (y := expensive(x)) > 0]\n# → [2, 6, 10]\n# NOTE: wrap in parentheses — := has very low precedence and needs them in most expressions\n#\n# Decision rule:\n#   read-loop: while (chunk := f.read(N)):    -> walrus (cleanest pattern)\n#   regex match + use:  if (m := re.search): -> walrus (avoids double match)\n#   filter + transform in one comprehension   -> walrus to compute once\n#   plain assignment outside expression       -> regular = (no walrus)\n#   need value across many lines               -> regular assignment for clarity\n#   complex test inside listcomp filter        -> walrus, or extract to helper function\n#   condition that doesn't need the value      -> just if / while (no walrus)\n#\n# Anti-pattern: sprinkling := in places where regular assignment would do.\n#   `(x := 5)` adds noise without saving a line. The walrus earns its keep ONLY when the\n#   assignment must happen inside an expression (loop condition, comprehension filter,\n#   if-test where you also use the value). Outside those contexts, plain x = 5 is clearer\n#   and easier to grep."
                  }
        ],
        tips: [
                  "Most useful in `while` loops that read data — replaces the awkward `while True: x = read(); if not x: break`",
                  "The walrus target leaks into the enclosing scope — useful but can surprise you",
                  "In comprehensions, the walrus variable is available in the filter condition AND the output expression",
                  "Wrap in parentheses: `if (n := fn()) > 0:` — the `:=` has lower precedence than comparison operators"
        ],
        mistake: "Using `:=` for simple assignments: `(x := 5)`. This adds no value over `x = 5`. The walrus is only useful when the assignment happens *inside* an expression that is also testing or using the value.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "for-loop",
        fn: "for loop",
        desc: "Iterate over any iterable — list, string, dict, generator.",
        category: "Control Flow",
        subtitle: "Python for is for-each — always iterates over items",
        signature: "for item in iterable: ... else: ...",
        descLong: "Python's for loop iterates over any iterable object. It has no index by default — use enumerate() for that. The optional else clause runs only when the loop completes without hitting a break.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of for loop — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: iterate directly over items — no index needed\nfor fruit in [\"apple\", \"banana\", \"cherry\"]:\n    print(fruit)\n# Dicts iterate over keys by default\nd = {\"a\": 1, \"b\": 2}\nfor key, val in d.items():\n    print(key, val)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of for loop — common patterns you'll see in production.\n# APPROACH  - Combine for loop with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use break, continue, and the for/else clause\n# WHY: continue skips to the next iteration without exiting the loop\nfor n in range(10):\n    if n % 2 == 0:\n        continue       # skip even numbers\n    print(n)           # → 1 3 5 7 9\n# WHY: for/else — the else block runs only if the loop finished without a break\nfor item in [\"apple\", \"banana\", \"cherry\"]:\n    if item == \"mango\":\n        print(\"found mango\")\n        break\nelse:\n    print(\"mango not found\")  # → runs because no break occurred"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of for loop — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: avoid mutating a list while iterating it — iterate a copy instead\nitems = [1, 2, 3, 4, 5]\n# WHY: modifying 'items' mid-loop skips elements silently — hard to debug\n# BAD: for item in items: if item % 2 == 0: items.remove(item)\n# WHY: iterating a copy is safe — the original can be modified freely\nfor item in items[:]:\n    if item % 2 == 0:\n        items.remove(item)\n# → items is now [1, 3, 5]\n# NOTE: a list comprehension is cleaner for filtering: items = [x for x in items if x % 2 != 0]\n#\n# Decision rule:\n#   iterate items of any iterable              -> for x in iterable\n#   need index too                             -> for i, x in enumerate(iterable)\n#   parallel iteration                         -> for a, b in zip(A, B)\n#   build a list                                -> [f(x) for x in it] (comprehension)\n#   build a dict                                -> {k: v for k, v in pairs}\n#   accumulate / reduce                         -> sum, max, min, functools.reduce\n#   loop until success / search                -> use for/else; else runs when no break\n#   modify collection during loop               -> iterate over copy: lst[:] (or rebuild)\n#   numerical work over large array             -> NumPy vectorized op (NOT for-loop)\n#\n# Anti-pattern: mutating the list you are iterating over (`lst.remove` / `del lst[i]` inside loop).\n#   The iterator's internal index drifts and items get skipped silently. Either iterate over a\n#   shallow copy (`for x in lst[:]`), build a new list with a comprehension\n#   (`[x for x in lst if keep(x)]`), or collect indices to delete and apply after the loop."
                  }
        ],
        tips: [
                  "The `for/else` pattern is underused — `else` runs only when the loop completes without `break`",
                  "Never use `for i in range(len(lst))` when you want items — use `for item in lst:` directly",
                  "Modify a copy when iterating: `for item in lst[:]:` — modifying `lst` while iterating causes bugs",
                  "`_` as the loop variable signals you don't use the value: `for _ in range(3): do_thing()`"
        ],
        mistake: "Modifying a list while iterating over it. Skips items silently. Iterate over a copy (`lst[:]`) or build a new list with a comprehension.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "while-loop",
        fn: "while loop",
        desc: "Repeat a block as long as a condition is true.",
        category: "Control Flow",
        subtitle: "Condition-controlled loop — use for loops without a known endpoint",
        signature: "while condition: ... else: ...",
        descLong: "while loops repeat as long as a condition is truthy. Use them when the number of iterations is not known in advance. Like for loops, while supports break, continue, and an else clause.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of while loop — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: repeat until a condition becomes false\nn = 256\nsteps = 0\nwhile n > 1:\n    n //= 2   # halve n each iteration\n    steps += 1\nprint(steps)  # → 8  (256 → 128 → 64 → ... → 1)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of while loop — common patterns you'll see in production.\n# APPROACH  - Combine while loop with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: keep prompting until the user gives valid input\n# WHY: while True + break is the clearest pattern for \"retry until valid\"\nwhile True:\n    answer = input(\"Enter yes or no: \").lower()\n    if answer in (\"yes\", \"no\"):\n        break\n    print(\"Invalid — please enter yes or no\")\nprint(f\"You said: {answer}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of while loop — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: drain a list using while, and use while/else for a search\nitems = [3, 1, 4, 1, 5]\n# WHY: 'while lst:' is the idiomatic \"drain\" pattern — pops until empty\nwhile items:\n    print(items.pop())   # → 5 1 4 1 3\n# WHY: while/else — else runs only if the condition went False (no break hit)\ni, target = 0, 4\nwhile i < len([3, 1, 4, 1, 5]):\n    if [3, 1, 4, 1, 5][i] == target:\n        print(f\"found at index {i}\")\n        break\n    i += 1\nelse:\n    print(\"not found\")  # NOTE: only if no break was hit\n#\n# Decision rule:\n#   known iteration count                      -> for x in range(N) / for x in iterable\n#   condition-controlled, unknown count        -> while cond\n#   \"retry until valid\"                        -> while True: ... if ok: break\n#   \"drain until empty\"                        -> while container: container.pop()\n#   read in chunks                             -> while (chunk := f.read(N)): (walrus)\n#   poll with timeout                          -> while time.monotonic() < deadline\n#   server / event loop main loop              -> framework's run() / while True with handlers\n#   numeric convergence                        -> while abs(new - old) > tol\n#\n# Anti-pattern: `while True` with no break/return path or no progress check.\n#   The loop variable doesn't update, the break condition is never met, or the timeout is\n#   missing — and the script hangs. Always include either a guaranteed exit (counter, deadline,\n#   stop condition) or a structured break. Defensive pattern: `for _ in range(MAX_ATTEMPTS)`\n#   instead of `while True` so a runaway can't be infinite."
                  }
        ],
        tips: [
                  "`while True: ... if done: break` is the clearest pattern for retry/input loops",
                  "Always ensure the condition can become False — missing an update to the loop variable causes infinite loops",
                  "Use `for` when you know the number of iterations; use `while` when you don't",
                  "`while lst:` pops items until the list is empty — a common drain pattern"
        ],
        mistake: "Forgetting to update the loop variable inside the while body. `while n > 0: print(n)` loops forever. Make sure `n` decrements or the condition eventually becomes False.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "match-case",
        fn: "match statement",
        desc: "Structural pattern matching — Python 3.10+.",
        category: "Control Flow",
        subtitle: "Match shapes, values, types, and structures",
        signature: "match subject: case pattern: ...",
        descLong: "match/case (Python 3.10+) is structural pattern matching — far more powerful than a C-style switch. It can match values, sequences, dicts, class instances, and wildcard patterns. The match expression is evaluated once; the first matching case runs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of match statement — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: branch on a value using match — cleaner than many if/elif chains\ncommand = \"help\"\nmatch command:\n    case \"quit\" | \"exit\":\n        print(\"Goodbye\")\n    case \"help\":\n        print(\"Showing help...\")\n    case _:               # _ is the wildcard — always matches\n        print(f\"Unknown: {command}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of match statement — common patterns you'll see in production.\n# APPROACH  - Combine match statement with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: match on the shape of a tuple (sequence pattern)\npoint = (3, 0)\n# WHY: patterns can bind variables — x and y are available in the case body\nmatch point:\n    case (0, 0):\n        print(\"origin\")\n    case (x, 0):\n        print(f\"on x-axis at {x}\")   # → on x-axis at 3\n    case (0, y):\n        print(f\"on y-axis at {y}\")\n    case (x, y):\n        print(f\"at ({x}, {y})\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of match statement — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: match on dict shape and add guard clauses for extra conditions\nevent = {\"action\": \"buy\", \"ticker\": \"AAPL\", \"qty\": 10}\n# WHY: dict patterns only require the named keys — extra keys in the dict are ignored\nmatch event:\n    case {\"action\": \"buy\", \"ticker\": ticker, \"qty\": qty} if qty > 0:\n        print(f\"Buying {qty} of {ticker}\")    # → Buying 10 of AAPL\n    case {\"action\": \"sell\", \"ticker\": ticker}:\n        print(f\"Selling {ticker}\")\n    case _:\n        print(\"Unknown event\")\n# NOTE: match shines for structured data (dicts, tuples, dataclasses)\n# For simple equality checks, if/elif is still more readable\n#\n# Decision rule:\n#   structural decomposition (tuple/dict shape) -> match / case\n#   parsing AST / network messages / events    -> match / case (designed for this)\n#   class-based dispatch with attribute capture -> match Class(attr=val) syntax\n#   simple value lookup / dispatch             -> dict {value: handler} (faster, simpler)\n#   2-3 equality branches                      -> if / elif (less ceremony)\n#   want exhaustive enum match w/ checker      -> match on Enum (mypy can warn missing cases)\n#   need fall-through (C switch behaviour)     -> NOT match — Python has no fall-through\n#   pre-3.10 codebase                          -> stuck with if / elif\n#\n# Anti-pattern: porting if/elif equality chains to match without a structural reason.\n#   match on a single int value with 5 cases is just a wordy if/elif. The win arrives when you\n#   bind variables (`case Point(x=0, y=y):`) or destructure JSON-like payloads. If every case\n#   is `case <const>:`, a dict {const: handler} or if/elif is shorter and equally readable."
                  }
        ],
        tips: [
                  "Match evaluates the subject once — unlike if/elif which re-evaluates the subject each time",
                  "Patterns can bind variables: `case (x, y):` binds `x` and `y` for use in the case body",
                  "Guard clauses `case pattern if condition:` add extra constraints after structural matching",
                  "`case _:` is the wildcard (always matches) — equivalent to `else` in if/elif"
        ],
        mistake: "Using `match` as a drop-in for simple `if/elif` equality checks. Match shines for structured data (dicts, sequences, dataclasses). For simple value checks, `if/elif` is more readable.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 4: Functions ─────────────────────────────────────────
  {
    id: "functions",
    title: "Functions",
    entries: [
      {
        id: "def",
        fn: "def",
        desc: "Define a reusable named function.",
        category: "Functions",
        subtitle: "Function definition with parameters and return values",
        signature: "def name(params) -> return_type: ...",
        descLong: "def creates a function object and binds it to a name. Functions are first-class objects — they can be passed as arguments, stored in variables, and returned from other functions. Parameters with defaults are optional; those without are required.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of def — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: define and call a simple function\ndef greet(name):\n    return f\"Hello, {name}!\"\ngreet(\"Alice\")  # → \"Hello, Alice!\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of def — common patterns you'll see in production.\n# APPROACH  - Combine def with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use default arguments, keyword calls, and multiple return values\ndef greet(name, greeting=\"Hello\"):\n    return f\"{greeting}, {name}!\"\ngreet(\"Alice\")                      # → \"Hello, Alice!\"\ngreet(\"Bob\", \"Hi\")                  # → \"Hi, Bob!\"\ngreet(greeting=\"Hey\", name=\"Carol\") # → \"Hey, Carol!\"\n# WHY: returning multiple values produces a tuple — unpack at the call site\ndef min_max(lst):\n    return min(lst), max(lst)\nlo, hi = min_max([3, 1, 4, 1, 5])  # → lo=1, hi=5"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of def — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: avoid the mutable default argument trap\n# WHY: default values are created ONCE when def executes — not on each call\n# BAD: def append_to(item, lst=[]) — all calls share the same list!\ndef append_to(item, lst=None):\n    if lst is None:\n        lst = []           # WHY: fresh list created on each call\n    lst.append(item)\n    return lst\n# Type hints are documentation — Python does not enforce them at runtime\ndef add(a: int, b: int) -> int:\n    return a + b\n# NOTE: functions are first-class objects — store them in dicts, pass as args\nops = {\"add\": lambda a, b: a + b, \"mul\": lambda a, b: a * b}\nops[\"add\"](3, 4)  # → 7\n#\n# Decision rule:\n#   3+ lines of logic, reused                  -> def function (named, testable)\n#   one expression, used once inline           -> lambda\n#   group state + behavior                     -> class\n#   pure data record, no behavior              -> @dataclass / NamedTuple\n#   immutable record + validation              -> @dataclass(frozen=True) or Pydantic\n#   need polymorphic behavior                  -> ABC / Protocol\n#   parameter-less factory / builder           -> def make_X() -> X\n#   async I/O                                  -> async def\n#\n# Anti-pattern: `def f(items=[]):` — mutable default argument.\n#   The default `[]` is created once at def-time and reused across every call that omits the\n#   arg. The \"list grows mysteriously\" bug is the most-cited Python gotcha. Always use\n#   `def f(items=None):` then `if items is None: items = []` inside the body. The same applies\n#   to dicts, sets, and any mutable container or instance."
                  }
        ],
        tips: [
                  "Never use mutable objects (lists, dicts) as default parameter values — they are created once and shared",
                  "Use `None` as the default and create the mutable object inside the function body",
                  "Type hints (`->`) are documentation — Python does not enforce them at runtime",
                  "Functions are objects — assign them to variables, put them in dicts, pass them as arguments"
        ],
        mistake: "`def fn(items=[])` — the default list is created once when `def` executes, not on each call. Every call that triggers the default shares the same list. Use `def fn(items=None): items = items or []`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "args-kwargs",
        fn: "*args / **kwargs",
        desc: "Collect variable numbers of positional or keyword arguments.",
        category: "Functions",
        subtitle: "*args collects extra positional args as tuple, **kwargs as dict",
        signature: "def fn(*args, **kwargs) | fn(*lst, **dct)",
        descLong: "*args captures extra positional arguments into a tuple. **kwargs captures extra keyword arguments into a dict. They can be combined with normal parameters in a defined order. The * and ** operators also unpack sequences/dicts when calling a function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of *args / **kwargs — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: accept any number of positional or keyword arguments\ndef add(*nums):\n    return sum(nums)\nadd(1, 2, 3, 4)   # → 10  (nums is the tuple (1, 2, 3, 4))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of *args / **kwargs — common patterns you'll see in production.\n# APPROACH  - Combine *args / **kwargs with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: collect extra keyword args and force keyword-only params\ndef configure(**options):\n    for key, val in options.items():\n        print(f\"{key} = {val}\")\nconfigure(host=\"localhost\", port=8080)\n# → host = localhost\n# → port = 8080\n# WHY: bare * forces everything after it to be keyword-only — no positional accidents\ndef create(name, *, verbose=False, dry_run=False):\n    print(f\"Creating {name}\")\ncreate(\"file.txt\", verbose=True)  # ok\n# create(\"file.txt\", True)        # TypeError — verbose must be keyword"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of *args / **kwargs — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: unpack lists and dicts into function calls\nargs   = [1, 2, 3]\nkwargs = {\"sep\": \", \", \"end\": \"!\\n\"}\nprint(*args, **kwargs)   # → 1, 2, 3!\n# WHY: useful for forwarding arguments through wrapper functions\ndef wrapper(*args, **kwargs):\n    print(\"before\")\n    result = real_function(*args, **kwargs)   # pass everything through\n    print(\"after\")\n    return result\n# NOTE: signature order must be: pos, /, normal, *args, kw_only, **kwargs\n#\n# Decision rule:\n#   variable-length numeric / sequence input   -> *args\n#   variable-length config / options           -> **kwargs\n#   forwarding to wrapped function             -> *args, **kwargs (decorators)\n#   force \"boolean must be named\"              -> def f(x, *, verbose=False)\n#   forbid \"value passed positionally\"         -> bare * before kwargs\n#   API where order shouldn't matter            -> all keyword-only after *\n#   mostly-fixed signature, occasional extras   -> name params, *args for tail\n#   spreading a list / dict into a call         -> f(*lst) / f(**d)\n#\n# Anti-pattern: using **kwargs as the function's only signature documentation.\n#   `def configure(**kwargs)` hides every accepted option from IDE help, type checkers, and\n#   reviewers, and forwards typos silently. List the options as named params (with sensible\n#   defaults); use **kwargs only for genuine pass-through to a wrapped library or for\n#   forward-compat extensibility — and document the accepted keys in the docstring."
                  }
        ],
        tips: [
                  "Keyword-only parameters (after `*`) force callers to be explicit — great for boolean flags",
                  "`*` in a signature with no name forces all following parameters to be keyword-only: `def fn(a, *, b)`",
                  "`*args` is a tuple (immutable); `**kwargs` is a dict — iterate over them normally",
                  "Unpack with `fn(*lst, **dct)` to pass a list/dict as positional/keyword arguments"
        ],
        mistake: "Using `*args` when the function always receives a fixed number of arguments. Only use `*args` when the count genuinely varies — otherwise named parameters are clearer.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "lambda",
        fn: "lambda",
        desc: "Create a small anonymous function inline.",
        category: "Functions",
        subtitle: "Single-expression anonymous function for sort keys and callbacks",
        signature: "lambda args: expression",
        descLong: "lambda creates an anonymous function limited to a single expression. It is most useful as a sort key, callback, or argument to higher-order functions. For anything more complex — multiple statements, conditionals, loops — use def instead.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of lambda — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: write a small throwaway function in one line\ndouble = lambda x: x * 2\ndouble(5)   # → 10\n# Most common use — sort key\npeople = [(\"Alice\", 30), (\"Bob\", 25), (\"Carol\", 35)]\nsorted(people, key=lambda p: p[1])  # → sort by age"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of lambda — common patterns you'll see in production.\n# APPROACH  - Combine lambda with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: sort by multiple fields using a tuple key\npeople = [(\"Alice\", 30), (\"Bob\", 25), (\"Carol\", 30)]\n# WHY: tuple key sorts by first element, then uses second as tiebreaker\nsorted(people, key=lambda p: (p[1], p[0]))\n# → [('Bob', 25), ('Alice', 30), ('Carol', 30)]  — age then name"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of lambda — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: watch out for the loop-closure bug with lambda\n# WHY: lambda captures 'i' by reference — all lambdas see i's final value (2)\nfns = [lambda: i for i in range(3)]\nfns[0]()   # → 2  (not 0!)\n# WHY: default arg is evaluated at definition time — captures current value of i\nfns = [lambda i=i: i for i in range(3)]\nfns[0]()   # → 0  correct\n# NOTE: if a lambda needs a name, use def instead — it's more readable and debuggable\n#\n# Decision rule:\n#   sort key / max key / min key               -> lambda x: x.attr (or itemgetter / attrgetter)\n#   one-shot callback to map / filter          -> lambda (or skip map and use list comp)\n#   GUI button / event handler one-liner       -> lambda\n#   pandas .apply on a single column           -> lambda row: row.x + row.y (vectorize if possible)\n#   needs a docstring / multiple statements    -> def named function\n#   you're tempted to assign `f = lambda ...`  -> use def f(...) instead\n#   simple attribute / index getter            -> operator.attrgetter / itemgetter (faster)\n#\n# Anti-pattern: building a closure with lambda inside a loop and being surprised by late binding.\n#   `fns = [lambda: i for i in range(3)]; fns[0]()` returns 2, not 0 — every lambda captures the\n#   same variable, not its value at the time of creation. Bind the value with a default:\n#   `lambda i=i: i` (default args are evaluated at def-time). Or use functools.partial. The\n#   bug looks like a closure problem; it's actually how Python scoping works."
                  }
        ],
        tips: [
                  "If a lambda needs a name, a conditional, or more than one expression — use `def`",
                  "`operator.itemgetter(0)` and `operator.attrgetter(\"name\")` are faster than equivalent lambdas for simple access",
                  "The loop-closure bug is classic: `lambda: i` captures `i` by reference, not by value at creation",
                  "Fix with default arg: `lambda i=i: i` — default args are evaluated at definition time"
        ],
        mistake: "Assigning a lambda to a name: `square = lambda x: x**2`. If you're naming it, use `def square(x): return x**2` — it's more readable, debuggable, and gets proper docstring support.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "generators",
        fn: "Generators",
        desc: "Functions that lazily produce values one at a time.",
        category: "Functions",
        subtitle: "yield pauses a function and resumes on next()",
        signature: "def gen(): yield value | (expr for x in it)",
        descLong: "A generator function contains yield — calling it returns a generator object without executing the body. Each call to next() resumes execution until the next yield. Generators are memory-efficient for large or infinite sequences.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Generators — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: produce values one at a time with yield\ndef count_up(n):\n    for i in range(n):\n        yield i          # pauses here and resumes on next call\ng = count_up(3)\nnext(g)   # → 0\nnext(g)   # → 1\nlist(count_up(3))  # → [0, 1, 2]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Generators — common patterns you'll see in production.\n# APPROACH  - Combine Generators with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use a generator expression to avoid loading everything into memory\n# WHY: () creates a lazy generator — values computed one at a time\nsquares = (x**2 for x in range(1_000_000))  # uses almost no memory\nnext(squares)   # → 0\nnext(squares)   # → 1\n# WHY: yield from delegates to another iterable — cleaner than a nested for loop\ndef chain_two(a, b):\n    yield from a\n    yield from b\nlist(chain_two([1, 2], [3, 4]))  # → [1, 2, 3, 4]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Generators — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: build a lazy processing pipeline — each stage yields one item at a time\ndef read_lines(path):\n    with open(path) as f:\n        yield from f                          # one line at a time\ndef strip_comments(lines):\n    for line in lines:\n        if not line.startswith(\"#\"):\n            yield line                        # only non-comment lines\ndef parse(lines):\n    for line in lines:\n        yield line.strip().split(\",\")         # split each line into fields\n# WHY: each stage is lazy — no intermediate lists, constant memory regardless of file size\ndata = parse(strip_comments(read_lines(\"data.csv\")))\n# NOTE: generators are single-use — call the function again to restart\n#\n# Decision rule:\n#   producing items lazily, one at a time      -> generator function (yield)\n#   one-line transform of an iterable          -> generator expression (... for ...)\n#   build a real list                           -> list comprehension [...]\n#   build a real dict / set                     -> dict / set comprehension\n#   stream data through stages                  -> chain of generators (pipeline pattern)\n#   need random access / len() / multiple passes -> list (NOT generator)\n#   async stream of values                      -> async generator (async def + yield)\n#   need to send values back in (coroutine)     -> generator.send() (rare; usually use async)\n#\n# Anti-pattern: consuming a generator twice expecting the same items.\n#   `g = (x*x for x in range(3)); list(g); list(g)` — the second call returns []. Generators\n#   are single-pass iterators that exhaust on use. If you need multiple passes, materialize\n#   to a list (or recreate the generator). For huge data where listing is impossible, redesign\n#   to compute results in a single pass."
                  }
        ],
        tips: [
                  "Generator expressions `(... for ...)` are like list comprehensions but lazy — use them to save memory",
                  "`yield from sub_gen` is cleaner than `for item in sub_gen: yield item`",
                  "Generators can only be consumed once — call the function again to restart",
                  "Use `list(gen)` or `for x in gen:` to consume a generator"
        ],
        mistake: "Trying to reuse a consumed generator: `g = gen(); list(g); list(g)` — second `list()` returns `[]`. Generators are single-use iterators. Call the function again to get a fresh one.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "decorators",
        fn: "Decorators",
        desc: "Wrap a function to add behavior without modifying its body.",
        category: "Functions",
        subtitle: "@syntax wraps a function — always use @functools.wraps inside",
        signature: "@decorator | def outer(fn): def wrapper(*a,**kw): return fn(*a,**kw)",
        descLong: "A decorator is a function that takes a function and returns a function. The @ syntax is shorthand for fn = decorator(fn). Always use @functools.wraps(fn) inside your wrapper to preserve the original function's __name__ and __doc__.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Decorators — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\nimport functools\n# GOAL: add behaviour before/after a function without changing its body\ndef shout(fn):\n    @functools.wraps(fn)          # WHY: preserves fn.__name__ and fn.__doc__\n    def wrapper(*args, **kwargs):\n        print(\"Before!\")\n        result = fn(*args, **kwargs)\n        print(\"After!\")\n        return result\n    return wrapper\n@shout\ndef greet(name):\n    print(f\"Hello, {name}\")\ngreet(\"Alice\")\n# → Before!  Hello, Alice  After!"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Decorators — common patterns you'll see in production.\n# APPROACH  - Combine Decorators with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\nimport functools, time\n# GOAL: time any function with a reusable decorator\ndef timer(fn):\n    @functools.wraps(fn)\n    def wrapper(*args, **kwargs):\n        start  = time.perf_counter()\n        result = fn(*args, **kwargs)\n        # WHY: fn.__name__ works here because of @functools.wraps above\n        print(f\"{fn.__name__} took {time.perf_counter() - start:.4f}s\")\n        return result\n    return wrapper\n@timer\ndef slow_task():\n    time.sleep(0.1)\nslow_task()  # → slow_task took 0.1001s"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Decorators — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\nimport functools\n# GOAL: decorator with arguments — needs an extra nesting layer\ndef retry(times=3, exceptions=(Exception,)):\n    def decorator(fn):\n        @functools.wraps(fn)\n        def wrapper(*args, **kwargs):\n            for attempt in range(times):\n                try:\n                    return fn(*args, **kwargs)\n                except exceptions:\n                    if attempt == times - 1:\n                        raise          # re-raise after final attempt\n        return wrapper\n    return decorator\n@retry(times=5, exceptions=(ConnectionError,))\ndef fetch_data():\n    return \"ok\"\n# NOTE: stacked decorators apply bottom-up\n# @timer @retry(3) def fn — retry is applied first, then timer wraps the result\n#\n# Decision rule:\n#   cross-cutting concern (logging/timing/auth) -> decorator\n#   need state across calls (counter, cache)    -> class-based decorator OR functools.lru_cache\n#   need parameters at decoration time          -> 3-level nested factory(args)(fn)(...)\n#   memoize pure function                       -> @functools.lru_cache / @cache (3.9+)\n#   register handler with framework             -> framework decorator (@app.route, @pytest.fixture)\n#   add behavior to a class                     -> @classmethod / @staticmethod / @property / class decorator\n#   one-off temporary wrapping                   -> just call fn explicitly (no decorator)\n#   need to preserve sig + docstring            -> @functools.wraps(fn) inside wrapper (always)\n#\n# Anti-pattern: writing a decorator without @functools.wraps(fn).\n#   The wrapped callable now reports the wrapper's __name__, __doc__, and signature; help(),\n#   pytest fixtures, FastAPI/Click that introspect signatures, and stack traces all degrade.\n#   Always add `@functools.wraps(fn)` on the inner wrapper. For decorators that need to\n#   modify the signature, use functools.wraps + inspect.signature manipulation."
                  }
        ],
        tips: [
                  "Always `@functools.wraps(fn)` inside your decorator — without it `fn.__name__` and `fn.__doc__` are replaced",
                  "Decorators with arguments need three levels: outer factory → decorator → wrapper",
                  "Stack order matters: `@a @b def fn` applies `b` first, then `a` — bottom-up",
                  "Class-based decorators (implementing `__call__`) work well when the decorator needs state"
        ],
        mistake: "Forgetting `@functools.wraps(fn)`. Without it, `help()`, `inspect`, and debugging tools show the wrapper's metadata instead of the original function's.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "closures",
        fn: "Closures",
        desc: "Functions that capture and modify variables from their enclosing scope.",
        category: "Functions",
        subtitle: "Closures capture by reference — nonlocal assigns to enclosing scope",
        signature: "def outer(): x=1; def inner(): nonlocal x; x+=1",
        descLong: "A closure is a function that remembers variables from its enclosing scope even after the outer function has returned. The nonlocal keyword allows the inner function to reassign (not just read) an enclosing variable. global does the same for module-level variables.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Closures — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: return a function that remembers a value from its creation context\ndef make_multiplier(factor):\n    def multiply(x):\n        return x * factor   # 'factor' is captured from the outer scope\n    return multiply\ndouble = make_multiplier(2)\ntriple = make_multiplier(3)\ndouble(5)   # → 10\ntriple(5)   # → 15"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Closures — common patterns you'll see in production.\n# APPROACH  - Combine Closures with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: build a stateful counter using nonlocal\ndef counter(start=0):\n    count = start\n    def increment(by=1):\n        nonlocal count   # WHY: without this, 'count += by' creates a new local and raises UnboundLocalError\n        count += by\n        return count\n    return increment\nc = counter()\nc()    # → 1\nc()    # → 2\nc(5)   # → 7"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Closures — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: avoid the loop-closure bug — closures capture by reference, not value\nfns = [lambda: i for i in range(3)]\nfns[0]()   # → 2  (all three lambdas see i = 2 — the final value)\n# WHY: default arguments are evaluated at definition time, capturing the current value\nfns = [lambda i=i: i for i in range(3)]\nfns[0]()   # → 0  correct\n# NOTE: prefer nonlocal over global — global state is hard to test and reason about\n# If you reach for global often, consider using a class to encapsulate the state\n#\n# Decision rule:\n#   factory function returning specialized fn  -> closure (def make_X(cfg): def f(...))\n#   stateful counter / accumulator             -> closure with nonlocal (or class)\n#   memoization                                -> @functools.lru_cache (cleaner than manual closure)\n#   callback that needs config                 -> closure (or functools.partial)\n#   multiple methods + state                   -> class (NOT a closure)\n#   capturing loop variable into lambda         -> closure with default arg `lambda x=x: x`\n#   need to reassign captured var               -> nonlocal x\n#   capturing module-level var to mutate       -> global x (rare; usually refactor)\n#\n# Anti-pattern: forgetting the nonlocal declaration when assigning to an enclosing variable.\n#   `def inner(): count += 1` — Python sees the assignment and creates a fresh local `count`\n#   that is uninitialized, raising UnboundLocalError on the read part of +=. Add\n#   `nonlocal count` (or refactor to a class). Reading-only doesn't need nonlocal — only\n#   rebinding does."
                  }
        ],
        tips: [
                  "Closures capture variables by *reference* — the variable itself, not its current value",
                  "`nonlocal` is needed to *assign* to an enclosing variable; reading it works without `nonlocal`",
                  "The loop-closure bug is one of the most common Python pitfalls — fix with `lambda i=i: i`",
                  "Prefer `nonlocal` over `global` — global state is hard to test and reason about"
        ],
        mistake: "Writing `def inner(): count += 1` without `nonlocal count`. Python sees the assignment and treats `count` as a local variable — reading it before assignment raises `UnboundLocalError`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "global-nonlocal",
        fn: "global / nonlocal",
        desc: "Declare that an assignment targets a variable in an outer scope.",
        category: "Functions",
        subtitle: "nonlocal for enclosing function scope, global for module scope",
        signature: "global x | nonlocal x",
        descLong: "Without global or nonlocal, any assignment inside a function creates a new local variable. global declares that the name refers to the module-level variable. nonlocal declares it refers to the nearest enclosing function scope (not global).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of global / nonlocal — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: understand that assignment creates a local variable by default\ncount = 0\ndef increment():\n    count = 1      # creates a NEW local variable — does NOT touch outer count\nincrement()\nprint(count)       # → 0  (unchanged)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of global / nonlocal — common patterns you'll see in production.\n# APPROACH  - Combine global / nonlocal with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: use global to modify a module-level variable\ncount = 0\ndef increment():\n    global count   # WHY: without this, 'count += 1' raises UnboundLocalError\n    count += 1\nincrement()\nincrement()\nprint(count)   # → 2\n# NOTE: reading an outer variable works without global — only assignment needs it\nx = 10\ndef read_x():\n    print(x)   # fine — no assignment, no global needed"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of global / nonlocal — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: use nonlocal for enclosing scope (not module level)\ndef make_counter():\n    n = 0\n    def increment():\n        nonlocal n   # WHY: refers to 'n' in make_counter's scope, not the module\n        n += 1\n        return n\n    return increment\nc = make_counter()\nc()   # → 1\nc()   # → 2\n# NOTE: prefer nonlocal over global — global state is shared across the entire module\n# If you use global heavily, refactor to a class — it's easier to test and reason about\n#\n# Decision rule:\n#   reassign module-level variable             -> global (rare; consider a class first)\n#   reassign enclosing function's variable     -> nonlocal\n#   only READING outer variable                -> no declaration needed\n#   storing config / singleton at module level -> module-level constant + accessor function\n#   shared mutable state                       -> class instance (NOT global)\n#   caching across calls                       -> functools.lru_cache (NOT a global dict)\n#   recursive function w/ accumulator           -> pass param down (NOT global / nonlocal)\n#   need to expose for tests to reset           -> module attr accessed via module.X = ...\n#\n# Anti-pattern: using global as the default solution for \"I need to share state\".\n#   Global mutable state defeats testability (tests share state and order matters), prevents\n#   parallelism, and hides data flow. Refactor to: pass the value as a parameter, return new\n#   state from functions, or wrap state in a class with explicit methods. Reach for `global`\n#   only for true module-level constants, lazy initialization, or when working inside a\n#   tightly-scoped script."
                  }
        ],
        tips: [
                  "You can READ an outer variable without global/nonlocal — only WRITING to it requires the declaration",
                  "Prefer nonlocal over global — global state is hard to test and reason about",
                  "If you find yourself using global frequently, consider a class to encapsulate state instead",
                  "global/nonlocal must appear before the first use of the variable name in that function"
        ],
        mistake: "Writing `x += 1` inside a function without `global x` and expecting it to modify the outer variable. Python sees the assignment and creates a local variable — then the `+= 1` fails with UnboundLocalError because the local has no value yet.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 5: Data Types & Strings ─────────────────────────────────────────
  {
    id: "data-types",
    title: "Data Types & Strings",
    entries: [
      {
        id: "list",
        fn: "list",
        desc: "Ordered mutable sequence — the most versatile Python container.",
        category: "Data Types",
        subtitle: "Append, slice, sort, comprehend",
        signature: "lst = [] | lst.append(x) | lst[start:stop:step] | [expr for x in it if cond]",
        descLong: "Lists are ordered, mutable sequences of any mix of types. Most mutation methods return None. Slices always return a new list. Comprehensions are faster than equivalent for-loops and more readable than map/filter.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of list — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Create and access list elements\nnums = [3, 1, 4, 1, 5, 9]\n# GOAL: Indexing and slicing\nnums[0]        # → 3   (first)\nnums[-1]       # → 9   (last)\nnums[1:4]      # → [1, 4, 1]   (start:stop, stop excluded)\nnums[::2]      # → [3, 4, 5]   (every other)\n# GOAL: Basic mutation\nnums.append(2)        # add to end  → [3,1,4,1,5,9,2]\nnums.remove(1)        # remove first 1\npopped = nums.pop()   # remove+return last  → 2\nlen(nums)             # → 5"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of list — common patterns you'll see in production.\n# APPROACH  - Combine list with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Sorting, searching, and combining lists\nscores = [85, 92, 78, 95, 88]\n# WHY: sorted() returns new list; .sort() mutates in place\nranked = sorted(scores, reverse=True)   # → [95, 92, 88, 85, 78]\nscores.sort()                           # mutates scores\n# GOAL: List comprehension — filter and transform in one line\npassing = [s for s in scores if s >= 80]   # → [85, 88, 92, 95]\nsquared = [x**2 for x in range(5)]         # → [0, 1, 4, 9, 16]\n# GOAL: Combining lists\na = [1, 2, 3]\nb = [4, 5, 6]\ncombined = a + b              # → [1, 2, 3, 4, 5, 6]  (new list)\na.extend(b)                   # mutates a in place\nprint(85 in scores)           # → True  (O(n) membership check)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of list — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Idiomatic patterns — zip, enumerate, nested comprehension\nmatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]\n# WHY: zip(*matrix) transposes without numpy\ntransposed = [list(row) for row in zip(*matrix)]\n# → [[1,4,7],[2,5,8],[3,6,9]]\n# NOTE: enumerate avoids manual index tracking\nfor i, val in enumerate(['a', 'b', 'c'], start=1):\n    print(f\"{i}: {val}\")   # → 1: a  2: b  3: c\n# GOAL: Flatten one level with list comprehension\nnested = [[1, 2], [3, 4], [5]]\nflat = [x for sub in nested for x in sub]   # → [1,2,3,4,5]\n# WHY: Use deque for O(1) left-append/pop instead of list\nfrom collections import deque\nq = deque([1, 2, 3])\nq.appendleft(0)    # O(1)  vs  list.insert(0, x) which is O(n)\n#\n# Decision rule:\n#   ordered, mutable, mixed types               -> list\n#   ordered, immutable record                   -> tuple / NamedTuple\n#   homogeneous numeric data                    -> array.array / NumPy ndarray\n#   queue / stack with O(1) ends               -> collections.deque\n#   unique items only                           -> set\n#   key-value lookups                           -> dict\n#   fixed schema records                        -> @dataclass / TypedDict\n#   build by appending in a loop                -> list (then convert if needed)\n#   filter / transform pattern                  -> [expr for x in it if cond] (NOT loop+append)\n#\n# Anti-pattern: `grid = [[0] * cols] * rows` to make a 2-D matrix.\n#   The outer multiplication produces `rows` references to the SAME inner list, so writing\n#   `grid[0][0] = 1` updates every \"row\" simultaneously. Use a comprehension instead:\n#   `grid = [[0] * cols for _ in range(rows)]` so each row is a fresh list. The same trap\n#   occurs with `[set()] * n` and any other mutable element."
                  }
        ],
        tips: [
                  "Mutation methods (`append`, `sort`, `reverse`) return `None` — never do `lst = lst.sort()`",
                  "`a[:]` creates a shallow copy — use `copy.deepcopy(a)` for nested lists",
                  "List comprehensions are ~30% faster than equivalent `for` + `append` loops"
        ],
        mistake: "Using `list * n` to create independent sub-lists. `[[0]*3]*3` creates 3 references to the same inner list — mutate one row and all change. Use `[[0]*3 for _ in range(3)]` instead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "unpacking",
        fn: "Unpacking",
        desc: "Unpack sequences into variables using * for remainder capture.",
        category: "Data Types",
        subtitle: "a, *rest = lst | swap | fn(*args, **kwargs)",
        signature: "a, b, c = iterable | first, *rest = lst | *init, last = lst",
        descLong: "Python unpacking assigns iterable elements to variables in one expression. The starred expression (*rest) captures any number of remaining elements as a list. Works in assignments, for loops, and function calls. ** unpacks dicts into keyword arguments.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Unpacking — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Assign multiple variables from a sequence in one line\na, b, c = [1, 2, 3]\nx, y    = (10, 20)\n# GOAL: Swap values without a temp variable\na, b = b, a\n# GOAL: Starred expression captures the remainder\nfirst, *rest  = [1, 2, 3, 4, 5]   # rest = [2,3,4,5]\n*init, last   = [1, 2, 3, 4, 5]   # last = 5"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Unpacking — common patterns you'll see in production.\n# APPROACH  - Combine Unpacking with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Unpack in a for loop — cleaner than indexing\npairs = [(1, 'a'), (2, 'b'), (3, 'c')]\nfor num, letter in pairs:\n    print(num, letter)\n# GOAL: Middle capture — skip known positions with _\na, *middle, z = [1, 2, 3, 4, 5]  # middle = [2,3,4]\n_, second, *_ = [1, 2, 3, 4]     # keep only second\n# GOAL: Spread args into a function call\nargs   = [1, 2, 3]\nkwargs = {'sep': ', '}\nprint(*args, **kwargs)   # → 1, 2, 3"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Unpacking — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Merge dicts with ** (Python 3.9+ also supports d1 | d2)\nd1 = {'a': 1, 'b': 2}\nd2 = {'b': 99, 'c': 3}\nmerged = {**d1, **d2}   # → {'a':1,'b':99,'c':3}  (d2 wins on 'b')\n# GOAL: Unpack nested structures in one expression\n# WHY: Avoids multiple index lookups — readable and concise\ndata = [('Alice', (90, 85, 92)), ('Bob', (78, 88, 76))]\nfor name, (score1, score2, score3) in data:\n    avg = (score1 + score2 + score3) / 3\n    print(f\"{name}: {avg:.1f}\")\n# NOTE: Only one starred expression allowed per assignment\n# a, *b, *c = lst  →  SyntaxError\n#\n# Decision rule:\n#   destructure tuple / list of known shape    -> a, b, c = items\n#   capture trailing items                      -> first, *rest = items\n#   capture leading items                       -> *init, last = items\n#   capture middle, ignore ends                 -> _, *middle, _ = items\n#   iterate (idx, val) pairs                    -> for i, v in enumerate(...)\n#   forward args to wrapped function            -> f(*args, **kwargs)\n#   merge dicts (3.5+)                          -> {**d1, **d2}\n#   merge dicts (3.9+)                          -> d1 | d2 (newer, cleaner)\n#\n# Anti-pattern: indexing into a tuple repeatedly when destructuring would be obvious.\n#   `name = pair[0]; value = pair[1]` is noisy and error-prone next to `name, value = pair`.\n#   Same for return values: write `mean, stdev = stats(x)` instead of `r = stats(x); m = r[0]`.\n#   When tuples grow beyond 3 fields, consider a dataclass or NamedTuple — destructuring N\n#   fields by position becomes brittle as the tuple's shape evolves."
                  }
        ],
        tips: [
                  "`first, *rest = lst` is cleaner than `first = lst[0]; rest = lst[1:]`",
                  "`a, b = b, a` swaps in one line — Python evaluates the right side fully before assigning",
                  "`{**d1, **d2}` merges dicts — right dict wins on duplicate keys"
        ],
        mistake: "Using more than one starred expression in an unpacking. `a, *b, *c = lst` is a SyntaxError — only one `*` is allowed per assignment.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "dict",
        fn: "dict",
        desc: "Key-value mapping with O(1) average lookup — the most versatile Python data structure.",
        category: "Data Types",
        subtitle: "get, update, setdefault, items, merge",
        signature: "d = {} | d.get(key, default) | d.setdefault(key, []) | {**d1, **d2}",
        descLong: "Python dicts are hash maps with O(1) average case for get/set/delete. Since Python 3.7 they maintain insertion order. The collections module's defaultdict and Counter extend dict for common patterns.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dict — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Create and access a dict\nd = {'a': 1, 'b': 2, 'c': 3}\nd['a']            # → 1  (KeyError if missing)\nd.get('z')        # → None  (safe)\nd.get('z', 0)     # → 0  (with default)\n# GOAL: Add, update, delete\nd['d'] = 4        # add or update\ndel d['a']        # delete (KeyError if missing)\nd.pop('b')        # remove + return value\nd.pop('x', None)  # safe pop — returns None if missing"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dict — common patterns you'll see in production.\n# APPROACH  - Combine dict with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Iterate over keys, values, and both\nd = {'x': 10, 'y': 20, 'z': 30}\nfor k in d:              # keys\n    print(k)\nfor v in d.values():     # values\n    print(v)\nfor k, v in d.items():   # both\n    print(k, v)\n# GOAL: setdefault — initialize a key only if absent\ngroups = {}\nfor item in ['cat', 'cow', 'dog', 'deer']:\n    groups.setdefault(item[0], []).append(item)\n# → {'c': ['cat','cow'], 'd': ['dog','deer']}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dict — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Merge dicts — Python 3.9+ union operator\nd1 = {'a': 1}\nd2 = {'b': 2}\nmerged  = d1 | d2    # → new dict  (3.9+)\nd1     |= d2         # in-place    (3.9+)\nmerged  = {**d1, **d2}  # works in 3.5+\n# WHY: Use defaultdict to avoid setdefault boilerplate\nfrom collections import defaultdict\ngroups = defaultdict(list)\nfor item in ['cat', 'cow', 'dog', 'deer']:\n    groups[item[0]].append(item)\n# GOAL: dict as a dispatch table — replaces long if/elif chains\nhandlers = {\n    'start': lambda: print('starting'),\n    'stop':  lambda: print('stopping'),\n}\nhandlers.get(command, lambda: print('unknown'))()\n# NOTE: d.get(key) two-lookup vs d[key] with try/except — use get() for expected misses\n#\n# Decision rule:\n#   key-value lookup, generic data              -> dict\n#   key MUST be present (else bug)              -> d[key] (raises KeyError = good)\n#   key MAY be missing, want default            -> d.get(key, default)\n#   group-by pattern (key -> list)              -> collections.defaultdict(list)\n#   counting occurrences                        -> collections.Counter\n#   ordered insertion + LRU semantics            -> collections.OrderedDict (or LRUCache)\n#   typed record with fixed schema              -> @dataclass / TypedDict / Pydantic\n#   string keys at module scope (config)        -> dict OK; constants in CapsConst\n#   immutable / hashable mapping                 -> types.MappingProxyType / frozendict\n#\n# Anti-pattern: `if key in d: value = d[key]` — two lookups for the price of one.\n#   This hashes `key` twice (once for `in`, once for `[]`). Use `value = d.get(key)` plus a\n#   None check, or `d.get(key, default)`. For \"fetch and create if missing\" use\n#   d.setdefault(key, []) or, cleaner, defaultdict. Same anti-pattern: del d[k] inside an\n#   iteration over d — collect keys first or rebuild via dict comprehension."
                  }
        ],
        tips: [
                  "`d.get(key, default)` is one lookup — prefer over `if key in d: d[key]` which is two",
                  "`d.setdefault(key, []).append(val)` initialises a list key on first access — one-line groupby",
                  "Use `defaultdict(list)` from collections for grouping patterns — cleaner than setdefault"
        ],
        mistake: "Mutating a dict while iterating it. `for k in d: del d[k]` raises RuntimeError. Iterate `list(d.keys())` or use a dict comprehension to build a new dict.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "dict-comprehension",
        fn: "Dict comprehension",
        desc: "Create a dictionary from an iterable in a single expression.",
        category: "Data Types",
        subtitle: "{key: value for item in iterable if condition}",
        signature: "{k: v for k, v in pairs} | {k: fn(k) for k in iterable if cond}",
        descLong: "Dict comprehensions build a dictionary inline — one key-value pair per iteration. More concise than a for loop with dict[key] = value. Also useful for inverting dicts, filtering, and transforming.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Dict comprehension — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Build a dict from a list of pairs\npairs  = [('a', 1), ('b', 2), ('c', 3)]\nresult = {k: v for k, v in pairs}\n# → {'a': 1, 'b': 2, 'c': 3}\n# GOAL: Square numbers keyed by the number\nsquares = {x: x**2 for x in range(5)}\n# → {0:0, 1:1, 2:4, 3:9, 4:16}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Dict comprehension — common patterns you'll see in production.\n# APPROACH  - Combine Dict comprehension with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Filter a dict — keep only high scores\nscores = {'Alice': 92, 'Bob': 65, 'Carol': 88, 'Dave': 55}\npassing = {name: s for name, s in scores.items() if s >= 80}\n# → {'Alice': 92, 'Carol': 88}\n# GOAL: Invert a dict — swap keys and values\nperms = {'read': 1, 'write': 2, 'exec': 4}\nby_val = {v: k for k, v in perms.items()}\n# → {1: 'read', 2: 'write', 4: 'exec'}\n# GOAL: Build a fast lookup dict from a list of objects\nusers = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]\nby_id = {u['id']: u for u in users}   # O(1) lookup by id"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Dict comprehension — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Transform and normalise config from environment\nimport os\nenv_keys = ['PORT', 'WORKERS', 'DEBUG']\nconfig = {\n    k.lower(): os.environ.get(k, '')\n    for k in env_keys\n}\n# WHY: Nested dict comprehension — transpose a matrix\nmatrix = {'a': {'x': 1, 'y': 2}, 'b': {'x': 3, 'y': 4}}\ntransposed = {\n    inner_k: {outer_k: outer_v[inner_k] for outer_k, outer_v in matrix.items()}\n    for inner_k in next(iter(matrix.values()))\n}\n# → {'x': {'a':1,'b':3}, 'y': {'a':2,'b':4}}\n# NOTE: Keep nesting shallow — 2 levels max before readability suffers\n#\n# Decision rule:\n#   build dict from iterable of pairs           -> {k: v for k, v in pairs} or dict(pairs)\n#   transform values, keep keys                 -> {k: f(v) for k, v in d.items()}\n#   filter dict by predicate                    -> {k: v for k, v in d.items() if cond}\n#   invert dict (values must be unique)         -> {v: k for k, v in d.items()}\n#   group items by computed key                 -> defaultdict(list) loop (NOT a comp)\n#   simple two-list zip                         -> dict(zip(keys, values))\n#   merge two dicts                              -> d1 | d2 (3.9+) or {**d1, **d2}\n#   build O(1) lookup index                     -> {item.id: item for item in items}\n#\n# Anti-pattern: inverting a dict that has duplicate values via comprehension.\n#   `{v: k for k, v in d.items()}` keeps only the LAST key for each repeated value, silently\n#   dropping data. Either de-dupe values first, or invert into a list-of-keys dict:\n#   defaultdict(list); for k, v in d.items(): inv[v].append(k). Always assert\n#   `len(set(d.values())) == len(d)` before single-key inversion."
                  }
        ],
        tips: [
                  "Inverting a dict with duplicate values silently drops all but the last — check uniqueness first",
                  "For complex logic (multiple statements, side effects) use a regular for loop instead",
                  "Dict comprehensions are O(n) — same as a loop, but more readable for simple transforms"
        ],
        mistake: "Inverting a dict with duplicate values. `{v: k for k, v in d.items()}` silently keeps only the last key per value. Check `len(d) == len(set(d.values()))` before inverting.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "tuple",
        fn: "tuple",
        desc: "Immutable ordered sequence — hashable, memory-efficient, and faster than list.",
        category: "Data Types",
        subtitle: "Like a list but immutable — use for fixed records and dict keys",
        signature: "t = (1, 2, 3) | t = 1, 2, 3 | t = (value,)",
        descLong: "Tuples are immutable ordered sequences. They are faster than lists, use less memory, and can be used as dict keys or set members when all elements are hashable. The comma makes the tuple — not the parentheses.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of tuple — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Create tuples — comma makes the tuple, not parens\nt = (1, 2, 3)\nt = 1, 2, 3       # same thing — parens optional\nt = (42,)         # single-element — trailing comma required\nt = ()            # empty tuple\n# GOAL: Access elements like a list\nt[0]              # → 1\nt[-1]             # → 3\nt[1:3]            # → (2, 3)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of tuple — common patterns you'll see in production.\n# APPROACH  - Combine tuple with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Use tuple as a dict key — lists can't be keys (not hashable)\ngrid = {}\ngrid[(0, 0)] = 'origin'\ngrid[(1, 0)] = 'right'\n# GOAL: Return multiple values from a function\ndef min_max(nums):\n    return min(nums), max(nums)   # returns a tuple\nlo, hi = min_max([3, 1, 4, 1, 5])  # unpack on return\n# → lo=1, hi=5\n# GOAL: Tuple unpacking in loops\npairs = [(1, 'a'), (2, 'b')]\nfor num, letter in pairs:\n    print(num, letter)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of tuple — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Named tuple for readable field access without a class\nfrom collections import namedtuple\nPoint = namedtuple('Point', ['x', 'y'])\np = Point(3, 4)\np.x, p.y          # → 3, 4\np._asdict()       # → {'x': 3, 'y': 4}\np._replace(x=10)  # → Point(x=10, y=4)  new instance\n# WHY: Modern alternative — typing.NamedTuple with type hints\nfrom typing import NamedTuple\nclass Employee(NamedTuple):\n    name:   str\n    dept:   str\n    salary: float = 0.0\ne = Employee('Alice', 'Eng', 95000)\ne.name    # → 'Alice'\n# NOTE: Tuples of mutable objects are not truly immutable\nt = ([1, 2], [3, 4])\nt[0].append(99)   # t is now ([1,2,99],[3,4]) — the list inside mutated\n#\n# Decision rule:\n#   fixed-size record with known meaning         -> tuple (or NamedTuple if 3+ fields)\n#   need to use as dict key / set member         -> tuple (lists not hashable)\n#   returning multiple values                    -> tuple (Python's idiom)\n#   permanent immutable collection               -> tuple\n#   collection that may grow / be edited         -> list\n#   typed record with field names                 -> typing.NamedTuple / @dataclass\n#   numeric vector                                -> NumPy ndarray\n#   single value \"for now\"                       -> just the value, NOT (value,)\n#\n# Anti-pattern: writing `t = (item)` thinking you have a 1-tuple.\n#   `(item)` is a parenthesized expression equal to `item`; the comma is what creates a tuple.\n#   Use `t = (item,)` or `t = item,`. Equally common: assuming tuples are deeply immutable —\n#   they aren't; they freeze the references but a contained list is still mutable. For real\n#   immutability of nested data, use frozen @dataclass(frozen=True) plus tuple of tuples."
                  }
        ],
        tips: [
                  "A single-element tuple needs a trailing comma: `(1,)` — `(1)` is just an integer in parentheses",
                  "Tuples can be dict keys or set members; lists cannot — use tuples when hashability matters",
                  "Tuples are ~20% faster than lists for iteration and use less memory — prefer for fixed data"
        ],
        mistake: "`t = (1)` is the integer `1`, not a tuple. The comma makes the tuple: `t = (1,)` or just `t = 1,`.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "namedtuple",
        fn: "namedtuple",
        desc: "Lightweight immutable record type with named fields — no class boilerplate needed.",
        category: "Data Types",
        subtitle: "Tuple with attribute access — prefer typing.NamedTuple in new code",
        signature: "Point = namedtuple(\"Point\", [\"x\",\"y\"]) | class P(NamedTuple): ...",
        descLong: "collections.namedtuple creates a tuple subclass with named fields. Lighter than a dataclass, more readable than a plain tuple. The modern alternative is typing.NamedTuple which supports type hints and default values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of namedtuple — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Create a namedtuple type and use it\nfrom collections import namedtuple\nPoint = namedtuple('Point', ['x', 'y'])\np = Point(3, 4)\np.x          # → 3   (attribute access)\np.y          # → 4\np[0]         # → 3   (still works as a tuple)\nlen(p)       # → 2"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of namedtuple — common patterns you'll see in production.\n# APPROACH  - Combine namedtuple with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Key namedtuple operations\nfrom collections import namedtuple\nPoint = namedtuple('Point', ['x', 'y'])\np = Point(3, 4)\np._asdict()       # → {'x': 3, 'y': 4}\np._replace(x=10)  # → Point(x=10, y=4)  (new instance — immutable)\nx, y = p          # unpack like a regular tuple\n# GOAL: Use as a dict key (hashable)\ndistances = {Point(0,0): 0.0, Point(1,0): 1.0}\n# GOAL: Default values (Python 3.6.1+)\nPoint3D = namedtuple('Point3D', ['x','y','z'], defaults=[0])\nPoint3D(1, 2)   # → Point3D(x=1, y=2, z=0)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of namedtuple — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: typing.NamedTuple — preferred for new code\n# WHY: Supports type hints, defaults, and methods in one clean class\nfrom typing import NamedTuple\nclass Metric(NamedTuple):\n    name:  str\n    value: float\n    unit:  str = 'ms'\n    def formatted(self) -> str:\n        return f\"{self.name}: {self.value:.1f}{self.unit}\"\nm = Metric('latency', 42.5)\nm.formatted()    # → 'latency: 42.5ms'\nm._asdict()      # → {'name':'latency','value':42.5,'unit':'ms'}\n# NOTE: namedtuple vs dataclass\n# namedtuple: immutable, tuple-compatible, hashable, lightweight\n# dataclass:  mutable by default, supports methods, post_init, more Pythonic for complex types\n#\n# Decision rule:\n#   immutable record, no methods, want type hints -> typing.NamedTuple (modern)\n#   immutable record, no type hints, legacy code  -> collections.namedtuple\n#   need mutation / post-init / __slots__         -> @dataclass\n#   need validation + serialization               -> Pydantic BaseModel\n#   ad-hoc 2-3 fields, never reused              -> plain tuple\n#   needs hashable + comparable for set/dict       -> NamedTuple or @dataclass(frozen=True)\n#   inheritance hierarchy                          -> regular class (NamedTuple inheritance is awkward)\n#   purely structural, never instantiated          -> TypedDict / Protocol\n#\n# Anti-pattern: reaching for a regular class (with __init__, __eq__, __repr__, ...) for what\n#   is actually a record. You re-implement five dunder methods that NamedTuple/@dataclass\n#   generate for free, and they are easy to get wrong (e.g. forgetting to update __eq__ when\n#   adding a field). For value types with no behavior, prefer NamedTuple/@dataclass and only\n#   add a real class when you need substantial methods."
                  }
        ],
        tips: [
                  "Use `typing.NamedTuple` class syntax for new code — supports type hints, defaults, and methods",
                  "namedtuple is immutable — use `_replace()` to create a modified copy",
                  "Lighter than a dataclass when you only need field access and no mutation"
        ],
        mistake: "Using a plain tuple `(x, y)` where namedtuple would be clearer. `point[0]` is cryptic; `point.x` is self-documenting with negligible overhead.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "set",
        fn: "set",
        desc: "Unordered collection of unique hashable items with O(1) membership testing.",
        category: "Data Types",
        subtitle: "O(1) membership and set algebra: & | - ^",
        signature: "s = {1,2,3} | a & b | a | b | a - b | a ^ b",
        descLong: "Sets store unique items in hash-based storage — O(1) average for add, remove, and membership. Use sets to deduplicate sequences, to check membership in a loop, and for set algebra (union, intersection, difference). frozenset is the immutable, hashable variant.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of set — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Create a set and test membership\ns = {1, 2, 3, 4}\n3 in s          # → True   (O(1) — instant)\n3 in [1,2,3,4]  # → True   (O(n) — scans the list)\n# GOAL: Deduplicate a list\nunique = list(set([1, 2, 2, 3, 3, 3]))\n# → [1, 2, 3]  (order not guaranteed)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of set — common patterns you'll see in production.\n# APPROACH  - Combine set with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Set algebra operations\na = {1, 2, 3, 4}\nb = {3, 4, 5, 6}\na & b   # → {3, 4}        intersection\na | b   # → {1,2,3,4,5,6} union\na - b   # → {1, 2}        in a but not b\nb - a   # → {5, 6}        in b but not a\na ^ b   # → {1,2,5,6}     in exactly one set (symmetric difference)\n# GOAL: Mutation\ns = {1, 2, 3}\ns.add(4)         # add element\ns.discard(10)    # remove if present — no error if missing\ns.remove(1)      # remove — KeyError if missing"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of set — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Convert list to set for fast membership checks in a loop\n# WHY: O(1) per lookup vs O(n) — critical for large datasets\nblocklist = set(load_blocked_ids())   # convert once\nvalid = [u for u in users if u.id not in blocklist]\n# GOAL: Deduplicate preserving order (set doesn't preserve order)\nseen = set()\nordered_unique = [x for x in lst if not (x in seen or seen.add(x))]\n# WHY: seen.add() returns None (falsy) so the short-circuit works\n# GOAL: frozenset — immutable, hashable, usable as dict key\nfs = frozenset({1, 2, 3})\ncache = {frozenset(query_params): result}\n# NOTE: {} creates an empty dict, NOT an empty set\nempty_set  = set()    # correct\nempty_dict = {}       # this is a dict\n#\n# Decision rule:\n#   deduplicate items                            -> set(iterable)\n#   fast membership check in a loop              -> set (O(1) vs list O(n))\n#   set algebra: union/intersection/diff         -> {a} | {b}, {a} & {b}, {a} - {b}\n#   need ordered + unique                        -> dict.fromkeys(iter) (preserves order)\n#   need hashable / immutable set                 -> frozenset\n#   counting items                                -> collections.Counter (NOT set)\n#   key-to-value mapping                          -> dict (NOT set of tuples)\n#   numeric data with set ops                     -> NumPy / pandas (vectorized)\n#\n# Anti-pattern: using `if x in big_list` repeatedly inside a loop.\n#   Each membership test is O(n), so an outer loop becomes O(n*m). Convert the haystack to a\n#   set ONCE: `block = set(big_list); for x in items: if x in block: ...`. Each lookup is now\n#   O(1). The conversion costs O(n), then every `in` is constant. Equally classic gotcha:\n#   `{} ` does not create a set; use `set()`."
                  }
        ],
        tips: [
                  "Convert a list to `set` once before a membership-check loop — O(1) vs O(n) per lookup",
                  "`s.discard(x)` is safer than `s.remove(x)` — no KeyError when the element is absent",
                  "`{}` is an empty dict — use `set()` for an empty set"
        ],
        mistake: "Using a list for membership testing in a loop: `if x in large_list`. Convert once: `lookup = set(large_list)`, then every `if x in lookup` is O(1) instead of O(n).",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "set-comprehension",
        fn: "Set comprehension",
        desc: "Create a set from an iterable in a single expression — duplicates removed automatically.",
        category: "Data Types",
        subtitle: "{expr for item in iterable if condition}",
        signature: "{expr for x in iterable} | {x for x in lst if condition}",
        descLong: "Set comprehensions build a set inline — duplicates are automatically removed. Syntactically identical to list comprehensions but with curly braces. Useful for deduplication and extracting unique values.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Set comprehension — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Unique squares from a range\nsquares = {x**2 for x in range(6)}\n# → {0, 1, 4, 9, 16, 25}  (unordered, unique)\n# GOAL: Deduplicate with a transformation\nwords = ['Hello', 'world', 'hello', 'WORLD']\nlower_unique = {w.lower() for w in words}\n# → {'hello', 'world'}"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Set comprehension — common patterns you'll see in production.\n# APPROACH  - Combine Set comprehension with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Extract unique values from a column of records\nrecords = [{'city': 'NYC'}, {'city': 'LA'}, {'city': 'NYC'}]\ncities = {r['city'] for r in records}\n# → {'NYC', 'LA'}\n# GOAL: With condition — only even numbers\nevens = {x for x in range(20) if x % 2 == 0}\n# GOAL: Find elements in one list but not another\na = [1, 2, 3, 4, 5]\nb = [3, 4, 5, 6, 7]\nonly_in_a = {x for x in a} - {x for x in b}\n# simpler: set(a) - set(b)  → {1, 2}"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Set comprehension — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Flatten and deduplicate in one expression\nmatrix = [[1,2,3],[2,3,4],[3,4,5]]\nall_vals = {v for row in matrix for v in row}\n# → {1, 2, 3, 4, 5}\n# WHY: Use set() directly for simple deduplicate — comprehension only needed with transforms\nunique_ids     = set(record['id'] for record in records)   # generator expression\nunique_lowered = {tag.lower() for tag in tags}             # comprehension with transform\n# NOTE: All elements must be hashable — set comprehension fails on lists or dicts as elements\n# {[1,2] for ...}  → TypeError: unhashable type: 'list'\n# Use tuples instead: {tuple(row) for row in matrix}\n#\n# Decision rule:\n#   simple dedupe of an iterable                  -> set(iterable) (no comprehension needed)\n#   dedupe + transform                            -> {f(x) for x in it}\n#   dedupe + filter                               -> {x for x in it if cond}\n#   flatten + dedupe                              -> {v for row in m for v in row}\n#   need to preserve insertion order              -> list(dict.fromkeys(iterable))\n#   elements are unhashable (lists, dicts)        -> convert to tuple first\n#   building dict, not set                        -> {k: v for ...} (dict comp, not set comp)\n#   piping into another aggregation               -> generator expression (no braces)\n#\n# Anti-pattern: `{x for x in lst}` when you just want `set(lst)`.\n#   The comprehension form adds noise without value when there's no transform or filter.\n#   Reserve set/dict/list comprehensions for cases that actually map or filter; for plain\n#   conversion, use the constructor (`set(it)`, `list(it)`, `dict(pairs)`). Equally common:\n#   forgetting that {} is a dict, so `empty = {}` does NOT give you an empty set — use `set()`."
                  }
        ],
        tips: [
                  "For simple deduplication, `set(lst)` is cleaner than `{x for x in lst}`",
                  "Set comprehension is faster than building a list then converting: `{expr}` vs `set([expr])`",
                  "All elements must be hashable — use tuples instead of lists as set elements"
        ],
        mistake: "Using `{}` to create an empty set. `{}` creates an empty dict. Use `set()` for an empty set.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "fstrings",
        fn: "f-strings",
        desc: "Embed expressions in string literals with format specifications.",
        category: "Strings",
        subtitle: "The fastest and most readable string formatting — f\"{val:.2f}\"",
        signature: "f\"{val}\" | f\"{val:.2f}\" | f\"{val:>10}\" | f\"{val=}\"",
        descLong: "f-strings (Python 3.6+) embed expressions directly in string literals. The format spec after `:` controls alignment, padding, numeric formatting, and more. The `=` specifier (3.8+) prints both the expression and its value — invaluable for debugging.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of f-strings — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Basic embedding — variables and expressions\nname, score = 'Alice', 0.9253\nf\"Hello, {name}!\"          # → 'Hello, Alice!'\nf\"Score: {score}\"          # → 'Score: 0.9253'\nf\"Result: {2 + 2}\"         # → 'Result: 4'\nf\"Upper: {name.upper()}\"   # → 'Upper: ALICE'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of f-strings — common patterns you'll see in production.\n# APPROACH  - Combine f-strings with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Number format specs — the most common ones\npi = 3.14159\nf\"{pi:.2f}\"          # → '3.14'       2 decimal places\nf\"{0.9253:.1%}\"      # → '92.5%'      percentage\nf\"{1234567:,}\"       # → '1,234,567'  thousands separator\nf\"{255:#x}\"          # → '0xff'       hex with prefix\nf\"{42:05d}\"          # → '00042'      zero-padded\n# GOAL: Alignment in a fixed-width field\nf\"{'left':<10}\"      # → 'left      '\nf\"{'right':>10}\"     # → '     right'\nf\"{'center':^10}\"    # → '  center  '"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of f-strings — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: f\"{val=}\" for debugging — prints name and value (3.8+)\nx, y = 42, 'hello'\nf\"{x=}\"       # → 'x=42'\nf\"{x=!r}\"     # → \"x=42\"         repr format\nf\"{y=}\"       # → \"y='hello'\"\n# GOAL: Multiline f-strings and nested quotes\nquery = (\n    f\"SELECT * FROM {table!r} \"\n    f\"WHERE date >= '{start_date}' \"\n    f\"LIMIT {limit}\"\n)\n# GOAL: Format spec from a variable\nwidth, precision = 10, 3\nf\"{pi:{width}.{precision}f}\"   # → '     3.142'\n# WHY: Nested {} lets you compute format spec dynamically\n# NOTE: f-strings are faster than .format() and % — use them by default\n#\n# Decision rule:\n#   any new code, single string                  -> f-string f\"{x}\"\n#   debugging quick print                        -> f\"{x=}\" (3.8+)\n#   logging library messages                     -> NEVER f-string; use logger.info(\"...%s\", x)\n#   user-controlled input (SQL/HTML/shell)       -> NEVER format; use parameterized API\n#   template stored in config / DB / file        -> str.format() / Jinja (f-strings need source)\n#   joining many pieces                          -> \"\".join(parts) (NOT += in loop)\n#   percent formatting on legacy code            -> \"%s\" % val (still common, legacy only)\n#   numeric / date formatting                    -> f\"{n:,.2f}\" / f\"{dt:%Y-%m-%d}\"\n#   long template, many fields                   -> str.format() with named placeholders\n#\n# Anti-pattern: f-string interpolation into SQL, HTML, shell, or log records.\n#   `db.execute(f\"SELECT * FROM users WHERE id={user_id}\")` is a SQL injection. Use the\n#   driver's parameter binding: `db.execute(\"SELECT ... WHERE id=?\", (user_id,))`. Same with\n#   logging: `log.info(f\"got {x}\")` evaluates the f-string even if the level is filtered;\n#   write `log.info(\"got %s\", x)` so the formatter only runs when needed (and PII filters work)."
                  }
        ],
        tips: [
                  "`f\"{val=}\"` (3.8+) prints both the variable name and value — the best quick debugging tool",
                  "`f\"{n:,}\"` adds thousands separators with no import",
                  "f-strings are faster than `.format()` and `%` — always prefer them in new code"
        ],
        mistake: "Concatenating strings with `+` in a loop: `s += str(x)`. This is O(n²). Use `\"\".join(str(x) for x in items)` or build a list and join at the end.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "str-methods",
        fn: "str methods",
        desc: "Built-in string transformation and searching methods.",
        category: "Strings",
        subtitle: "split, join, strip, find, replace, startswith, endswith",
        signature: "s.split(sep) | sep.join(lst) | s.strip() | s.replace(old, new)",
        descLong: "Python strings are immutable — all methods return new strings. The most important are split/join (converting between strings and lists), strip (whitespace removal), and replace/find (search and substitution).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of str methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Case, whitespace, and testing\ns = \"  Hello, World!  \"\ns.strip()               # → 'Hello, World!'\ns.lower()               # → '  hello, world!  '\ns.upper()               # → '  HELLO, WORLD!  '\ns.startswith('  Hello') # → True\ns.endswith('!  ')       # → True"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of str methods — common patterns you'll see in production.\n# APPROACH  - Combine str methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Split and join — the most-used string pattern\n\"a,b,c\".split(',')          # → ['a', 'b', 'c']\n\"hello world\".split()       # → ['hello', 'world']  (any whitespace)\n\",\".join(['a', 'b', 'c'])   # → 'a,b,c'\n\"\\n\".join(['line1', 'line2'])\n# GOAL: Find and replace\ns = \"Hello, World!\"\ns.find('World')     # → 7   (-1 if not found)\ns.index('World')    # → 7   (ValueError if not found)\ns.replace('World', 'Python')  # → 'Hello, Python!'\ns.count('l')        # → 3\n# NOTE: find() returns -1 on miss; index() raises ValueError\n# Use find() when absence is expected; index() when absence is a bug"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of str methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Partition — split on first occurrence, always 3 parts\n'user@example.com'.partition('@')   # → ('user', '@', 'example.com')\n'no-at-sign'.partition('@')         # → ('no-at-sign', '', '')\n# GOAL: removeprefix / removesuffix (Python 3.9+)\n'https://example.com'.removeprefix('https://')  # → 'example.com'\n'report.csv'.removesuffix('.csv')               # → 'report'\n# WHY: cleaner than s[len(prefix):] — only removes if actually present\n'other.txt'.removesuffix('.csv')   # → 'other.txt'  (unchanged)\n# GOAL: Efficient string building — never use + in a loop\n# Slow: O(n²)\nresult = ''\nfor x in items:\n    result += str(x)\n# Fast: O(n)\nresult = ''.join(str(x) for x in items)\n#\n# Decision rule:\n#   tokenize on whitespace                       -> s.split() (no arg, smart)\n#   tokenize on a single char                    -> s.split(\",\")\n#   tokenize on regex / multi-pattern            -> re.split(r\"[,;]\", s)\n#   build string from list                        -> sep.join(parts) (NEVER += in loop)\n#   strip whitespace ends                         -> s.strip() / lstrip / rstrip\n#   strip a known prefix / suffix                 -> s.removeprefix() / .removesuffix() (3.9+)\n#   substring exists?                             -> \"x\" in s (NOT s.find(...) >= 0)\n#   pattern test, not just literal                -> re.search (NOT str.replace / find)\n#   case-insensitive equality                     -> s.lower() == t.lower() / s.casefold()\n#   normalize multiple spaces to one              -> \" \".join(s.split())\n#\n# Anti-pattern: building a string by repeated `+=` inside a loop.\n#   Each iteration creates a new immutable string and copies all previous content; total work\n#   is O(n²). Append to a list and `\"\".join(parts)` at the end (O(n)). For really large\n#   string assembly use `io.StringIO`. The same bug shape: `s = s.replace(...)` chained\n#   thousands of times — collect all (old, new) pairs then run str.translate or a regex once."
                  }
        ],
        tips: [
                  "`s.split()` with no argument splits on any whitespace and strips leading/trailing — handles tabs and multiple spaces",
                  "`\",\".join(lst)` is much faster than concatenating with `+` in a loop",
                  "`removeprefix`/`removesuffix` (3.9+) are safer than slicing — they only remove if the prefix/suffix actually exists"
        ],
        mistake: "Using `str.replace()` for pattern-based substitution. `s.replace(r\"\\w+\", \"X\")` treats the pattern as a literal string. Use `re.sub(r\"\\w+\", \"X\", s)` for regex replacement.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "re-module",
        fn: "re module",
        desc: "Pattern matching and text manipulation with regular expressions.",
        category: "Strings",
        subtitle: "search, findall, sub, split, compile — always use raw strings r\"\"",
        signature: "re.search(r\"pattern\", text) | re.findall() | re.sub()",
        descLong: "The re module provides full regular expression support. Always use raw strings r\"\" for patterns to avoid double-escaping backslashes. Compile patterns with re.compile() when reusing them. re.search() scans anywhere; re.match() only matches at the start.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of re module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Find a pattern anywhere in a string\nimport re\ntext = \"Order #1234 shipped on 2024-01-15\"\nm = re.search(r'd{4}-d{2}-d{2}', text)\nm.group()   # → '2024-01-15'\n# GOAL: Find all matches\nre.findall(r'd+', text)   # → ['1234', '2024', '01', '15']"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of re module — common patterns you'll see in production.\n# APPROACH  - Combine re module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Replace with sub\nimport re\nre.sub(r's+', ' ', 'too   many  spaces')  # → 'too many spaces'\n# GOAL: Split on a pattern\nre.split(r'[,;s]+', 'a, b;  c d')   # → ['a','b','c','d']\n# GOAL: Compile for reuse — avoids recompiling on every call\ndate_re = re.compile(r'(d{4})-(d{2})-(d{2})')\nm = date_re.search(text)\nm.group(1), m.group(2), m.group(3)  # → '2024','01','15'\nm.groups()                           # → ('2024','01','15')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of re module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Named groups — more readable than numeric groups\nimport re\npattern = re.compile(r'(?P<year>d{4})-(?P<month>d{2})-(?P<day>d{2})')\nm = pattern.search('shipped on 2024-01-15')\nm.group('year')    # → '2024'\nm.groupdict()      # → {'year':'2024','month':'01','day':'15'}\n# GOAL: Flags — case-insensitive and multiline\nre.findall(r'^order', text, re.IGNORECASE | re.MULTILINE)\n# GOAL: Backreference in sub — reformat dates to DD/MM/YYYY\nre.sub(r'(d{4})-(d{2})-(d{2})', r'\\3/\\2/\\1', '2024-01-15')\n# → '15/01/2024'\n# NOTE: re.match() only matches at the START of the string\n# re.search() scans anywhere — use search() by default\n#\n# Decision rule:\n#   simple literal contains check                 -> \"x\" in s (NOT regex)\n#   replace fixed substring                       -> s.replace(old, new)\n#   match anywhere in string                      -> re.search\n#   match start of string only                    -> re.match (anchor-implicit)\n#   match whole string                             -> re.fullmatch\n#   all non-overlapping matches                   -> re.findall / re.finditer\n#   substitute by pattern                         -> re.sub\n#   reused pattern in hot path                    -> re.compile once, then .search() on it\n#   parse structured grammar                       -> a real parser (lark / pyparsing), NOT regex\n#   match case-insensitive                        -> re.IGNORECASE flag\n#\n# Anti-pattern: parsing HTML, JSON, CSV, or email addresses with hand-rolled regex.\n#   These grammars have edge cases (nested tags, quoted commas, RFC 5322) that regex cannot\n#   handle robustly; you'll ship something that \"works on the dev sample\" and fails in prod.\n#   Use html.parser / BeautifulSoup, json.loads, csv.reader, email.utils.parseaddr — purpose\n#   built parsers. Reserve regex for genuine pattern matching on flat text."
                  }
        ],
        tips: [
                  "Always use raw strings `r\"\\d+\"` — avoids double-escaping (`\\\\d` vs `\\d`)",
                  "`re.compile()` once and reuse — avoids recompiling on every call in a loop",
                  "Named groups `(?P<name>...)` make complex patterns self-documenting"
        ],
        mistake: "Using `re.match()` expecting it to search the whole string. `re.match()` only matches at the very start. Use `re.search()` to find a pattern anywhere.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "type-hints",
        fn: "Type hints",
        desc: "Annotate variables and functions with static type information.",
        category: "Type System",
        subtitle: "list[int], dict[str,int], X | None, TypeVar, Protocol",
        signature: "def fn(x: int) -> str | None: ...",
        descLong: "Type hints make code self-documenting and enable static analysis with mypy or pyright. Python does not enforce them at runtime. Since 3.10+, use `X | Y` instead of `Union[X,Y]`. Since 3.9+, use built-in `list[int]` and `dict[str,int]` directly.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Type hints — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Annotate variables and function signatures\nx: int = 42\nname: str = 'Alice'\nitems: list[str] = []\ndef greet(name: str, times: int = 1) -> str:\n    return (name + ' ') * times\n# GOAL: Optional — value or None (use X | None in 3.10+)\ndef find(lst: list[int], val: int) -> int | None:\n    try: return lst.index(val)\n    except ValueError: return None"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Type hints — common patterns you'll see in production.\n# APPROACH  - Combine Type hints with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Union, Callable, and collection types\nfrom typing import Callable\ndef process(val: int | str | float) -> str:\n    return str(val).upper()\ndef apply(fn: Callable[[int], str], n: int) -> str:\n    return fn(n)\napply(str, 42)   # → '42'\n# GOAL: TypeVar for generic functions — type consistent across call\nfrom typing import TypeVar\nT = TypeVar('T')\ndef first(lst: list[T]) -> T:\n    return lst[0]\nfirst([1, 2, 3])    # → 1  (inferred as int)\nfirst(['a', 'b'])   # → 'a' (inferred as str)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Type hints — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: Protocol — structural typing (duck typing with type safety)\n# WHY: Any class with the right methods satisfies it — no inheritance needed\nfrom typing import Protocol\nclass Drawable(Protocol):\n    def draw(self) -> None: ...\nclass Circle:\n    def draw(self) -> None:\n        print('Drawing circle')\ndef render(item: Drawable) -> None:\n    item.draw()\nrender(Circle())   # ✓ — Circle satisfies Drawable structurally\n# GOAL: TypedDict for dicts with known shape\nfrom typing import TypedDict\nclass UserDict(TypedDict):\n    name: str\n    age:  int\ndef greet_user(user: UserDict) -> str:\n    return f\"Hello {user['name']}\"\n# NOTE: Type hints are documentation and tooling only — not enforced at runtime\n# Run mypy script.py or pyright for static checking\n#\n# Decision rule:\n#   any new Python code                          -> add type hints from day one\n#   list / dict / tuple / set                    -> built-in generics list[int] (3.9+)\n#   \"either X or Y\"                              -> X | Y (3.10+) (NOT Union)\n#   \"X or None\"                                  -> X | None (NOT Optional[X])\n#   structural duck typing                        -> typing.Protocol\n#   dict with known keys + types                  -> typing.TypedDict\n#   generic function                              -> def f[T](x: T) -> T (3.12+) or TypeVar\n#   forward references / circular import          -> \"from __future__ import annotations\" + quoted strings\n#   need runtime enforcement                      -> Pydantic / attrs (NOT type hints alone)\n#   throwaway script, prototype                   -> hints optional but recommended\n#\n# Anti-pattern: relying on type hints to validate runtime data.\n#   `def f(x: int)` does not stop someone passing a str — Python ignores the annotation. For\n#   hard validation use Pydantic, beartype, attrs.validators, or assert isinstance() at the\n#   boundary. Inversely: importing typing.List/Dict/Tuple/Set in 3.9+ code is dead weight;\n#   use lower-case built-ins."
                  }
        ],
        tips: [
                  "Python 3.10+: use `X | Y` and `X | None` — cleaner than `Union[X,Y]` and `Optional[X]`",
                  "Python 3.9+: use `list[int]`, `dict[str,int]` — no need to import from `typing`",
                  "`Protocol` is structural subtyping — any class with the right methods qualifies, no inheritance required"
        ],
        mistake: "Using `List[int]` (capital L, from `typing`) in Python 3.9+. Use built-in `list[int]` directly. The typing module versions still work but are deprecated.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
      {
        id: "abc",
        fn: "Abstract Base Classes",
        desc: "Define interfaces that subclasses must implement.",
        category: "Type System",
        subtitle: "ABC + @abstractmethod enforces method implementation",
        signature: "from abc import ABC, abstractmethod",
        descLong: "Abstract Base Classes define interfaces — they specify what methods a subclass must implement without providing the implementation. Attempting to instantiate a class with unimplemented abstract methods raises TypeError. collections.abc provides ABCs for isinstance checks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Abstract Base Classes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             matches what you'd type into a REPL or a quick script.\n#             skips edge cases, validation, and any production concerns.\n#\n# GOAL: Define a base class that enforces method implementation\nfrom abc import ABC, abstractmethod\nclass Shape(ABC):\n    @abstractmethod\n    def area(self) -> float: ...   # subclass MUST implement this\n    def describe(self):            # concrete — shared by all subclasses\n        return f\"area={self.area():.2f}\"\n# Shape()  →  TypeError: Can't instantiate abstract class"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Abstract Base Classes — common patterns you'll see in production.\n# APPROACH  - Combine Abstract Base Classes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             developer reaches for daily (cast inputs, format output, options).\n#             meet in code reviews; balances clarity with practical control.\n#             retries, performance tuning, or graceful failure modes.\n#\n# GOAL: Implement the abstract class\nfrom abc import ABC, abstractmethod\nclass Shape(ABC):\n    @abstractmethod\n    def area(self) -> float: ...\nclass Circle(Shape):\n    def __init__(self, r: float): self.r = r\n    def area(self) -> float: return 3.14159 * self.r ** 2\nclass Rectangle(Shape):\n    def __init__(self, w: float, h: float): self.w, self.h = w, h\n    def area(self) -> float: return self.w * self.h\nc = Circle(5)\nc.area()      # → 78.54\n# GOAL: Abstract property\nclass Config(ABC):\n    @property\n    @abstractmethod\n    def db_url(self) -> str: ..."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Abstract Base Classes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             handling, and signaling intent (stderr, flush, logging, retries).\n#             with logging/monitoring; communicates engineering intent to teammates.\n#             assumes a system context (logging, stderr) that may not exist yet.\n#\n# GOAL: collections.abc — ABCs for isinstance checks\nfrom collections.abc import Iterable, Mapping, Sequence, Callable\nisinstance([1,2,3], Iterable)   # → True\nisinstance({}, Mapping)          # → True\nisinstance('abc', Sequence)      # → True\nisinstance(len, Callable)        # → True\n# WHY: Check for the interface, not the concrete type\ndef process(data):\n    if isinstance(data, Mapping):\n        return list(data.values())\n    if isinstance(data, Iterable):\n        return list(data)\n# GOAL: ABC vs Protocol\n# ABC:      enforces via inheritance — subclass must explicitly extend ABC\n# Protocol: enforces structurally — any class with right methods qualifies (no inheritance)\n# Use ABC when you want explicit opt-in; Protocol for duck-typing with type safety\n#\n# Decision rule:\n#   define a contract you control + enforce      -> ABC + @abstractmethod\n#   define a contract for code you DON'T own     -> typing.Protocol (structural, duck-typed)\n#   need shared concrete behavior in base         -> ABC (mixed concrete/abstract methods)\n#   isinstance check on duck-typed protocol      -> collections.abc (Iterable, Mapping, ...)\n#   want abstract property                        -> @property + @abstractmethod\n#   simple \"must implement X\"                     -> ABC, but consider Protocol first\n#   need exhaustive type checking                  -> Protocol with @runtime_checkable\n#   plugin / driver pattern                        -> ABC if registry-based, Protocol if duck\n#\n# Anti-pattern: forgetting @abstractmethod on the base method.\n#   Without the decorator, the empty `def area(self): pass` is a CONCRETE method that returns\n#   None. Subclasses are not forced to override it; instantiation succeeds; bugs surface at\n#   call time as silent None returns. Always pair the abstract intent with @abstractmethod\n#   (and `...` for the body), and inherit from ABC so the metaclass blocks instantiation\n#   when implementations are missing."
                  }
        ],
        tips: [
                  "ABCs raise TypeError at instantiation if abstract methods are missing — catches mistakes early",
                  "Use `...` (Ellipsis) as abstract method body — cleaner than `pass` or `raise NotImplementedError`",
                  "Prefer `Protocol` over ABC when you don't control the implementing classes (structural typing)"
        ],
        mistake: "Forgetting `@abstractmethod` and leaving the method body with `pass`. Without the decorator, the method is concrete — subclasses can skip it with no error raised.",
        shorthand: {
          verbose: "// Verbose: step-by-step approach\n\n// Each step done separately",
          concise: "// Concise: idiomatic one-liner\n",
        },
      },
    ],
  },

  // ── Section 6: Standard Library ─────────────────────────────────────────
  {
    id: "stdlib",
    title: "Standard Library",
    entries: [
      {
        id: "itertools",
        fn: "itertools",
        desc: "Lazy combinatorial iterators for sequences.",
        category: "Standard Library",
        subtitle: "chain, product, combinations, permutations, groupby, islice",
        signature: "chain(*its) | product(*its) | groupby(it, key=fn) | islice(it, n)",
        descLong: "itertools provides memory-efficient iterators for combinatorial and sequence operations. All functions are lazy — they generate values on demand. groupby() only groups consecutive equal elements — sort by key first for full grouping.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of itertools — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport itertools as it\nlist(it.chain([1, 2], [3, 4]))          # [1, 2, 3, 4]\nlist(it.islice(range(1000), 5))         # [0, 1, 2, 3, 4]\nlist(it.product(\"AB\", repeat=2))        # [('A','A'),('A','B'),('B','A'),('B','B')]\nlist(it.combinations(\"ABCD\", 2))        # ('A','B'),('A','C')... ORDER doesn't matter\nlist(it.permutations(\"ABC\", 2))         # ORDER matters"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of itertools — common patterns you'll see in production.\n# APPROACH  - Combine itertools with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport itertools as it\n# Flatten one level — without intermediate list.\nflat = list(it.chain.from_iterable([[1, 2], [3, 4], [5]]))   # [1,2,3,4,5]\n# groupby ONLY groups consecutive equal keys -- always sort first.\ndata = [(\"a\", 1), (\"b\", 3), (\"a\", 2), (\"a\", 4)]\nfor key, grp in it.groupby(sorted(data, key=lambda x: x[0]), key=lambda x: x[0]):\n    print(key, list(grp))\n# Running computation.\nlist(it.accumulate([1, 2, 3, 4]))             # [1, 3, 6, 10] — running sum\nlist(it.accumulate([3, 1, 2, 5], max))        # [3, 3, 3, 5] — running max\n# Infinite iterators — ALWAYS bound with islice.\nlist(it.islice(it.cycle(\"ABC\"), 7))           # ['A','B','C','A','B','C','A']\nlist(it.islice(it.count(10, 2), 5))           # [10, 12, 14, 16, 18]"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of itertools — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport itertools as it\nfrom collections.abc import Iterable, Iterator\ndef pairwise[T](xs: Iterable[T]) -> Iterator[tuple[T, T]]:\n    \"\"\"Adjacent pairs. Stdlib has it.pairwise on 3.10+.\"\"\"\n    return it.pairwise(xs)\ndef chunked[T](xs: Iterable[T], n: int) -> Iterator[list[T]]:\n    \"\"\"Fixed-size chunks; useful for batched API calls.\"\"\"\n    it_ = iter(xs)\n    while batch := list(it.islice(it_, n)):\n        yield batch\ndef windowed[T](xs: Iterable[T], n: int) -> Iterator[tuple[T, ...]]:\n    \"\"\"Sliding window of size n.\"\"\"\n    it_ = iter(xs)\n    window = tuple(it.islice(it_, n))\n    if len(window) == n: yield window\n    for x in it_:\n        window = window[1:] + (x,)\n        yield window\n# Decision rule:\n#   \"joined sequences\"             -> it.chain / chain.from_iterable\n#   \"first N / slice\"              -> it.islice (works on ANY iterable; not just lists)\n#   \"all unordered subsets\"        -> it.combinations\n#   \"all ordered subsets\"          -> it.permutations\n#   \"all assignments to N slots\"   -> it.product (with repeat=)\n#   \"running sum / running max\"    -> it.accumulate\n#   \"consecutive duplicates\"       -> it.groupby (sort first if you want all matches)\n#   \"batch into pages\"             -> chunked recipe above\n#   \"branch one stream\"            -> it.tee (watch memory; bounded by lag)\n#\n# Anti-pattern: list(it.cycle(\"ABC\")) — hangs forever. ALWAYS bound infinite\n# iterators (count / cycle / repeat) with islice or break out of the loop."
                  }
        ],
        tips: [
                  "`itertools.groupby()` groups only *consecutive* equal elements — always sort by key first",
                  "`chain.from_iterable()` flattens one level without building intermediate lists",
                  "`product(range(10), repeat=3)` generates all 1000 3-digit combinations for grid search",
                  "Wrap in `list()` only when you need all results — itertools iterators are lazy by design"
        ],
        mistake: "Using `itertools.groupby()` on unsorted data expecting all matching items grouped. It only groups *consecutive* matches. Sort by the key first: `sorted(data, key=fn)`.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "collections-deque",
        fn: "collections.deque",
        desc: "Double-ended queue with O(1) append and pop at both ends.",
        category: "Standard Library",
        subtitle: "Use instead of list when you need O(1) ops at both ends",
        signature: "from collections import deque | deque(maxlen=n)",
        descLong: "collections.deque provides O(1) append and pop from both ends — unlike list which is O(n) for operations at the front. Essential for queues, sliding windows, and BFS. maxlen= creates a fixed-size circular buffer.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of collections.deque — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom collections import deque\nq = deque()\nq.append(1); q.append(2)\nq.popleft()              # 1   (O(1))\nq.pop()                  # 2   (O(1) on the right end too)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of collections.deque — common patterns you'll see in production.\n# APPROACH  - Combine collections.deque with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom collections import deque\n# Rolling N-sized window over a stream.\nwindow = deque(maxlen=3)\nfor x in [1, 2, 3, 4, 5]:\n    window.append(x)\n    # window holds the LAST 3: [1], [1,2], [1,2,3], [2,3,4], [3,4,5]\n# extendleft reverses the input order (each item is appendlefted in turn).\nd = deque([1, 2, 3])\nd.extendleft([0, -1])    # deque([-1, 0, 1, 2, 3])\n# rotate(n)  -> rotates n steps to the right (use negative for left).\nr = deque([1, 2, 3, 4, 5])\nr.rotate(2)              # deque([4, 5, 1, 2, 3])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of collections.deque — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom collections import deque\nfrom collections.abc import Iterable, Iterator\ndef bfs[T](start: T, neighbors) -> Iterator[T]:\n    seen, q = {start}, deque([start])\n    while q:\n        node = q.popleft()                 # O(1) — required for BFS to be linear\n        yield node\n        for n in neighbors(node):\n            if n not in seen:\n                seen.add(n); q.append(n)\ndef tail_lines(path: str, n: int = 100) -> list[str]:\n    \"\"\"Last N lines without reading the whole file into memory.\"\"\"\n    with open(path) as f:\n        return list(deque(f, maxlen=n))    # deque consumes the iterator; keeps last n\n# Decision rule:\n#   queue / BFS                    -> deque (popleft = O(1); list = O(n))\n#   sliding window of size N       -> deque(maxlen=N)\n#   \"last N items\" (logs, errors)  -> deque(maxlen=N) feeding from a stream\n#   stack only                     -> list (append/pop are both O(1))\n#   index lookups d[i]             -> list (deque is O(n) at the middle)\n#   thread-safe FIFO               -> queue.Queue (deque ops are atomic but compound steps aren't)\n#\n# Anti-pattern: while items: x = items.pop(0) for queue semantics. Each pop(0)\n# is O(n); the loop is O(n^2). Use deque.popleft() — that's the whole reason\n# the type exists."
                  }
        ],
        tips: [
                  "Use deque when you need O(1) popleft — list.pop(0) is O(n) and causes performance issues in loops",
                  "maxlen=n creates a circular buffer — old items drop off automatically",
                  "BFS always uses a deque — O(1) popleft is critical for performance",
                  "deque is O(n) for random index access — use list if you need d[i] frequently"
        ],
        mistake: "Using list.pop(0) in a loop to simulate a queue. This is O(n) per operation, O(n²) total. Use deque.popleft() for O(1).",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "functools",
        fn: "functools",
        desc: "Higher-order function utilities — caching, partial application, ordering.",
        category: "Standard Library",
        subtitle: "lru_cache, partial, reduce, wraps, total_ordering",
        signature: "@lru_cache(maxsize=128) | partial(fn, *args) | reduce(fn, it)",
        descLong: "functools provides tools for working with higher-order functions. lru_cache memoizes results — one of the easiest performance wins in Python. partial() fixes arguments. total_ordering generates comparison methods from just two.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of functools — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport functools\n@functools.cache\ndef fib(n: int) -> int:\n    return n if n < 2 else fib(n-1) + fib(n-2)\nfib(100)                                       # instant\nprint(fib.cache_info())                        # hits / misses\nsquare = functools.partial(pow, exp=2)         # exp arg fixed\nsquare(5)                                      # 25\nfunctools.reduce(lambda a, b: a + b, [1, 2, 3, 4])   # 10"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of functools — common patterns you'll see in production.\n# APPROACH  - Combine functools with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport functools\n@functools.lru_cache(maxsize=256)              # bounded; LRU eviction\ndef expensive(x: int) -> int:\n    return sum(i * i for i in range(x))\nclass User:\n    def __init__(self, name: str): self.name = name\n    @functools.cached_property                  # cached on the INSTANCE; GC-safe\n    def signature(self) -> str:\n        import hashlib\n        return hashlib.sha256(self.name.encode()).hexdigest()\n@functools.total_ordering                       # __eq__ + one of __lt__/__gt__ -> all 6\nclass Version:\n    def __init__(self, major, minor):\n        self.major, self.minor = major, minor\n    def __eq__(self, o): return (self.major, self.minor) == (o.major, o.minor)\n    def __lt__(self, o): return (self.major, self.minor) <  (o.major, o.minor)\n# Decorator hygiene -- ALWAYS @wraps:\ndef trace(fn):\n    @functools.wraps(fn)\n    def wrapper(*a, **kw): return fn(*a, **kw)\n    return wrapper"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of functools — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport functools\nfrom collections.abc import Iterable\n@functools.singledispatch\ndef render(value, /) -> str:\n    return repr(value)                         # generic fallback\n@render.register\ndef _(value: list) -> str:\n    return \"[\" + \", \".join(render(x) for x in value) + \"]\"\n@render.register\ndef _(value: dict) -> str:\n    return \"{\" + \", \".join(f\"{k}: {render(v)}\" for k, v in value.items()) + \"}\"\n# functools.reduce — only when no built-in does it. Python idioms first:\nsum([1, 2, 3])                                  # NOT reduce(operator.add, ...)\nmax([3, 1, 4, 1, 5])                            # NOT reduce(max, ...)\n# Legitimate reduce: combine many sets/dicts:\nimport operator\nunion = functools.reduce(operator.or_, [{1, 2}, {2, 3}, {3, 4}], set())\n# cmp_to_key — bridge legacy compare-functions to sorted(key=...).\ndef by_version(a: str, b: str) -> int:\n    return -1 if tuple(map(int, a.split(\".\"))) < tuple(map(int, b.split(\".\"))) else 1\nsorted([\"1.10\", \"1.2\", \"1.9\"], key=functools.cmp_to_key(by_version))\n# Decision rule:\n#   memoize a pure function                  -> @functools.cache (or @lru_cache(maxsize=N) to bound memory)\n#   memoize on the instance (one-shot)        -> @functools.cached_property\n#   memoize an instance method                -> NOT @lru_cache (keeps self alive). Roll your own with WeakValueDictionary OR put state on the instance.\n#   \"this class needs all comparison ops\"     -> @functools.total_ordering + __eq__ + __lt__\n#   type-based dispatch                       -> @functools.singledispatch / singledispatchmethod\n#   bind some args of a function              -> functools.partial (functools.partialmethod for classes)\n#   write a decorator                         -> @functools.wraps(fn) on the wrapper, ALWAYS\n#   bridge a 3-way compare(a,b)              -> functools.cmp_to_key\n#\n# Anti-pattern: @functools.lru_cache on an instance method. The cache key\n# includes self, so every cached call holds a strong reference to the\n# instance — the instance can never be GC'd while the cache lives. Use\n# @cached_property for instance-scoped caches; reserve lru_cache for module-\n# level functions."
                  }
        ],
        tips: [
                  "`@functools.cache` (3.9+) is the simplest memoization — no `maxsize` argument needed",
                  "`partial()` is cleaner than a lambda for simple argument fixing when you need a name",
                  "`@total_ordering` requires `__eq__` + one comparison method — generates the other three",
                  "`@lru_cache` on a method with `self` caches the instance — use `@cached_property` for instance-level caching instead"
        ],
        mistake: "`@lru_cache` on an instance method caches all calls including `self`, which prevents garbage collection of the instance. Cache only module-level functions, or use `@cached_property`.",
        shorthand: {
          verbose: "def fib(n):\n    if n < 2: return n\n    return fib(n-1) + fib(n-2)\nfib(100)  # Slow without cache",
          concise: "@functools.lru_cache(maxsize=128)\ndef fib(n):\n    return n if n < 2 else fib(n-1) + fib(n-2)\nfib(100)  # Instant with caching",
        },
      },
      {
        id: "datetime",
        fn: "datetime module",
        desc: "Work with dates, times, and durations.",
        category: "Standard Library",
        subtitle: "date, time, datetime, timedelta, timezone — parsing and arithmetic",
        signature: "datetime.now() | datetime.strptime(s, fmt) | dt + timedelta(days=7)",
        descLong: "The datetime module provides date and time objects. datetime.now() returns local time; datetime.utcnow() returns UTC. Use strptime() to parse strings and strftime() to format. timedelta represents a duration and supports arithmetic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of datetime module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom datetime import datetime, timedelta, timezone\nnow = datetime.now(timezone.utc)             # tz-aware\nprint(now.isoformat())                        # 2026-04-30T12:34:56+00:00\ndt = datetime.strptime(\"2026-04-30\", \"%Y-%m-%d\")\nprint(dt.strftime(\"%B %d, %Y\"))               # April 30, 2026\ntomorrow = datetime.now(timezone.utc) + timedelta(days=1)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of datetime module — common patterns you'll see in production.\n# APPROACH  - Combine datetime module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom datetime import datetime, timezone, timedelta\nfrom zoneinfo import ZoneInfo                 # 3.9+ stdlib\n# Parse ISO 8601 with offset.\ndt = datetime.fromisoformat(\"2026-04-30T12:00:00+00:00\")\n# Pre-3.11 workaround for Z suffix:\ndt = datetime.fromisoformat(\"2026-04-30T12:00:00Z\".replace(\"Z\", \"+00:00\"))\n# Convert UTC -> local timezone for display.\nny = dt.astimezone(ZoneInfo(\"America/New_York\"))\n# Compare aware vs naive raises TypeError -- always carry tzinfo.\ndef parse_log_ts(s: str) -> datetime:\n    d = datetime.fromisoformat(s)\n    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)\n# Duration arithmetic.\nelapsed = datetime.now(timezone.utc) - dt\nprint(elapsed.total_seconds())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of datetime module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom datetime import datetime, timedelta, timezone\nfrom zoneinfo import ZoneInfo\nfrom typing import Self\nUTC = timezone.utc\ndef now_utc() -> datetime:\n    return datetime.now(UTC)                  # tz-aware; ALWAYS over datetime.utcnow()\ndef to_utc(dt: datetime, *, default_tz: ZoneInfo = ZoneInfo(\"UTC\")) -> datetime:\n    return (dt if dt.tzinfo else dt.replace(tzinfo=default_tz)).astimezone(UTC)\ndef display_local(dt: datetime, tz_name: str = \"America/New_York\") -> str:\n    return dt.astimezone(ZoneInfo(tz_name)).strftime(\"%Y-%m-%d %H:%M %Z\")\n# DST-safe deltas: cross-tz, prefer adding seconds in UTC.\ndef in_n_days(dt: datetime, days: int) -> datetime:\n    return dt.astimezone(UTC) + timedelta(days=days)\n# Decision rule:\n#   storage / serialization              -> UTC, ISO 8601, with offset (+00:00)\n#   display to user                      -> astimezone(ZoneInfo(\"Region/City\"))\n#   arithmetic across DST                -> compute in UTC, convert at the end\n#   parse ISO from external source       -> datetime.fromisoformat (Z handling: 3.11+ free; older replace Z->+00:00)\n#   parse free-form text                 -> python-dateutil.parser.parse  (NOT regex + strptime)\n#   schedule jobs                        -> store cron in UTC; render in user's tz; test DST boundary\n#   \"right now\"                          -> datetime.now(timezone.utc)  (NOT datetime.utcnow — naive)\n#\n# Anti-pattern: mixing naive and aware datetimes. Subtraction raises\n# TypeError, comparisons raise TypeError, and ORM saves silently lose the\n# timezone. Decide ONCE at every boundary: aware in, aware out."
                  }
        ],
        tips: [
                  "Always store and transmit datetimes in UTC — convert to local time only for display",
                  "`timedelta` supports days, hours, minutes, seconds, weeks — and arithmetic with datetime",
                  "`datetime.fromisoformat(\"2024-01-15\")` (Python 3.7+) is faster than `strptime` for ISO format",
                  "For production date handling (timezones, parsing) use the `dateutil` or `arrow` library"
        ],
        mistake: "Using `datetime.utcnow()` — it returns naive UTC with no timezone info attached, making it easy to confuse with local time. Use `datetime.now(timezone.utc)` for timezone-aware UTC.",
        shorthand: {
          verbose: "from datetime import datetime, timedelta\nfrom datetime import datetime, date, time, timedelta, timezone\nnow   = datetime.now()                    # local time\nutcnow = datetime.now(timezone.utc)       # timezone-aware UTC",
          concise: "dt1 == dt2",
        },
      },
      {
        id: "json-module",
        fn: "json module",
        desc: "Serialize Python objects to JSON and back.",
        category: "Standard Library",
        subtitle: "loads/dumps for strings, load/dump for files",
        signature: "json.dumps(obj, indent=2) | json.loads(string) | json.load(file)",
        descLong: "The json module converts between Python dicts/lists and JSON strings. dumps() serializes to a string; loads() parses a string. dump()/load() work with file objects. Only basic Python types are supported — custom objects need a custom encoder.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of json module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport json\ndata = {\"name\": \"Alice\", \"age\": 30}\ns = json.dumps(data)                          # '{\"name\": \"Alice\", \"age\": 30}'\ns = json.dumps(data, indent=2)                # pretty\nback = json.loads(s)                          # {\"name\": \"Alice\", \"age\": 30}\nwith open(\"data.json\", \"w\") as f:\n    json.dump(data, f, indent=2)\nwith open(\"data.json\") as f:\n    obj = json.load(f)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of json module — common patterns you'll see in production.\n# APPROACH  - Combine json module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport json\nfrom datetime import datetime, date\nfrom pathlib import Path\nfrom decimal import Decimal\ndef default(o):\n    if isinstance(o, (datetime, date)): return o.isoformat()\n    if isinstance(o, Path):              return str(o)\n    if isinstance(o, Decimal):           return str(o)         # keep precision\n    raise TypeError(f\"unencodable {type(o).__name__}\")\ns = json.dumps({\"ts\": datetime.now(), \"amount\": Decimal(\"9.99\")},\n               default=default, ensure_ascii=False)\n# Robust parsing of untrusted input.\ntry:\n    obj = json.loads(raw)\nexcept json.JSONDecodeError as e:\n    print(f\"bad JSON at line {e.lineno} col {e.colno}: {e.msg}\")\n    obj = None"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of json module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport json\nimport os\nfrom decimal import Decimal\nfrom pathlib import Path\ndef parse_money(raw: str) -> dict:\n    # parse_float=Decimal -- keep monetary precision.\n    return json.loads(raw, parse_float=Decimal)\ndef atomic_write_json(path: Path, obj, **kw) -> None:\n    \"\"\"Write JSON crash-safely: tmp + fsync + rename.\"\"\"\n    tmp = path.with_suffix(path.suffix + \".tmp\")\n    with tmp.open(\"w\", encoding=\"utf-8\") as f:\n        json.dump(obj, f, ensure_ascii=False, **kw)\n        f.flush(); os.fsync(f.fileno())\n    os.replace(tmp, path)\ndef stream_array(path: Path):\n    \"\"\"Iterate over a huge JSON array without loading it all.\"\"\"\n    import ijson\n    with path.open(\"rb\") as f:\n        yield from ijson.items(f, \"item\")\n# Decision rule:\n#   small payload, stdlib only         -> json.dumps / json.loads\n#   non-serializable types             -> default= callable, OR custom JSONEncoder\n#   monetary / scientific precision    -> parse_float=Decimal on the way in\n#   hot path (>10MB/s)                 -> orjson (3-10x faster) or msgspec (50x with schema)\n#   huge file (won't fit in memory)    -> ijson; iterate items\n#   write a config file safely          -> atomic_write_json (tmp + fsync + replace)\n#   schema validation                  -> pydantic / msgspec (NOT json+isinstance towers)\n#\n# Anti-pattern: str(some_dict) for \"JSON\". Single quotes, None instead of null,\n# True/False instead of true/false. Always json.dumps."
                  }
        ],
        tips: [
                  "`json.dumps(obj, indent=2)` is the standard for writing human-readable JSON config files",
                  "JSON only supports str, int, float, bool, None, list, dict — everything else needs a custom encoder",
                  "`json.loads()` raises `json.JSONDecodeError` on invalid JSON — wrap in try/except for untrusted input",
                  "For large JSON files, use `ijson` for streaming parsing instead of loading everything at once"
        ],
        mistake: "Using str(obj) to serialize a Python dict gives invalid JSON with single quotes. Always use json.dumps() to produce valid JSON output.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "copy-module",
        fn: "copy module",
        desc: "Make shallow or deep copies of Python objects.",
        category: "Standard Library",
        subtitle: "copy() for shallow, deepcopy() for fully independent copies",
        signature: "copy.copy(obj) | copy.deepcopy(obj)",
        descLong: "Assignment in Python copies a reference, not the object. copy.copy() creates a shallow copy — a new object but with references to the same inner objects. copy.deepcopy() recursively copies everything — fully independent.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of copy module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport copy\na = [1, [2, 3], 4]\nb = copy.copy(a)              # outer is new; inner list [2, 3] is SHARED\nb[0] = 99                     # a unchanged\nb[1].append(99)               # a[1] is now [2, 3, 99] — same list!\nc = copy.deepcopy(a)\nc[1].append(99)               # a unaffected (fully independent tree)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of copy module — common patterns you'll see in production.\n# APPROACH  - Combine copy module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport copy\nfrom dataclasses import dataclass, replace\n# Shallow forms — equivalent to copy.copy:\nlist(xs); xs[:]                    # list shallow copy\ndict(d);  d.copy()                  # dict shallow copy\n{*s};     s.copy()                  # set shallow copy\n# Deep when nested mutables exist:\nconfig = {\"db\": {\"host\": \"x\"}, \"tags\": [\"a\", \"b\"]}\nnew_cfg = copy.deepcopy(config)\nnew_cfg[\"db\"][\"host\"] = \"y\"        # config unaffected\n# For immutable / dataclass: replace() is faster and clearer than deepcopy.\n@dataclass(frozen=True)\nclass Point: x: int; y: int\np = Point(1, 2)\nq = replace(p, x=99)               # new Point(99, 2); p untouched"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of copy module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport copy\nfrom dataclasses import dataclass, field, replace\n# 1) Custom hooks: control what gets copied.\nclass Connection:\n    def __init__(self, dsn: str, sock=None):\n        self.dsn, self.sock = dsn, sock\n    def __copy__(self):\n        # Shallow: share the socket.\n        return type(self)(self.dsn, self.sock)\n    def __deepcopy__(self, memo):\n        # Deep: drop the live socket; new instance reconnects on use.\n        return type(self)(self.dsn, sock=None)\n# 2) Cyclic structures: deepcopy uses memo dict; respect it.\nclass Node:\n    def __init__(self, val): self.val, self.next = val, None\n    def __deepcopy__(self, memo):\n        new = type(self)(copy.deepcopy(self.val, memo))\n        memo[id(self)] = new\n        new.next = copy.deepcopy(self.next, memo)\n        return new\n# Decision rule:\n#   never mutate the input                  -> NO copy needed (preferred)\n#   shallow update of dict/list             -> {**d, \"k\": v}  /  [*xs, new]\n#   immutable record update                 -> dataclasses.replace(obj, x=...)\n#   nested mutables, brief copy             -> copy.deepcopy\n#   resource-holding object                 -> implement __copy__ / __deepcopy__\n#   pickle-able structure, hot path         -> pickle.loads(pickle.dumps(x)) is faster than deepcopy on numeric / dataclass trees\n#   cyclic graph                            -> __deepcopy__ with memo[id(self)] = new\n#\n# Anti-pattern: copy.deepcopy on objects with file handles, sockets, locks, or\n# threading primitives. The copied resource is invalid. Implement __deepcopy__\n# to drop the resource, OR refactor to a value type with no resources."
                  }
        ],
        tips: [
                  "`lst[:]` and `list(lst)` are shallow copies — same as `copy.copy(lst)` for lists",
                  "`dict.copy()` is also shallow — nested lists/dicts are still shared",
                  "Use `deepcopy` when passing complex objects to functions that might modify them",
                  "`deepcopy` can be slow on large or circular structures — profile before using in hot paths"
        ],
        mistake: "Assuming `b = a.copy()` (or `b = a[:]`) gives a fully independent copy. These are *shallow* copies — nested mutable objects (like a list inside a list) are still shared.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    result.append(x * 2)",
          concise: "result = [x * 2 for x in items]",
        },
      },
      {
        id: "bytes",
        fn: "bytes",
        desc: "Immutable sequence of raw bytes (integers 0-255).",
        category: "Standard Library",
        subtitle: "Binary data — files, network, encoding/decoding",
        signature: "b\"hello\" | bytes(size) | s.encode(\"utf-8\")",
        descLong: "bytes is an immutable sequence of integers 0-255. Create with byte literals (b\"...\"), the bytes() constructor, or by encoding strings. Use bytes for binary file I/O, network protocols, and any place you need immutable binary data. Access individual bytes as integers, not characters.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of bytes — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nb = b\"hello\"\nprint(len(b), b[0])                     # 5 104\nprint(b.decode(\"utf-8\"))                # 'hello'\nprint(\"café\".encode(\"utf-8\"))           # b'caf\\xc3\\xa9'\nwith open(\"image.png\", \"rb\") as f:\n    data = f.read()                      # bytes"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of bytes — common patterns you'll see in production.\n# APPROACH  - Combine bytes with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport struct\n# Hex round-trip — for protocols, hashes, debugging.\nb = bytes.fromhex(\"48656c6c6f\")          # b'Hello'\nb.hex()                                   # '48656c6c6f'\n# Tolerant decode: keep partially-corrupted text alive.\nb\"caf\\xc3\\xa9 \\xff\".decode(\"utf-8\", errors=\"replace\")   # 'café \\ufffd'\nb\"caf\\xc3\\xa9 \\xff\".decode(\"utf-8\", errors=\"ignore\")    # 'café '\n# struct: pack/unpack fixed-width binary records.\nheader = struct.pack(\">IH\", 42, 7)        # big-endian uint32 + uint16\nn, ver = struct.unpack(\">IH\", header)     # (42, 7)\n# Combine bytes efficiently.\nparts = [b\"a\", b\"b\", b\"c\"]\njoined = b\"\".join(parts)                  # NOT b += part in a loop"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of bytes — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport io\nimport struct\ndef parse_records(data: bytes) -> list[tuple[int, str]]:\n    \"\"\"Parse [u32 len][utf-8 bytes] records without copying.\"\"\"\n    out, mv, i = [], memoryview(data), 0\n    while i < len(mv):\n        (n,) = struct.unpack_from(\">I\", mv, i); i += 4\n        out.append((n, bytes(mv[i:i+n]).decode(\"utf-8\"))); i += n\n    return out\ndef emit_records(rs: list[tuple[int, str]]) -> bytes:\n    buf = io.BytesIO()                              # avoid quadratic concat\n    for _, s in rs:\n        b = s.encode(\"utf-8\")\n        buf.write(struct.pack(\">I\", len(b)) + b)\n    return buf.getvalue()\n# Decision rule:\n#   small fixed-size record               -> struct.pack / unpack\n#   variable-length records on a stream    -> length prefix + struct + memoryview slicing\n#   building bytes in a loop              -> io.BytesIO  (NOT b += part)\n#   \"transmit binary as text\" (JSON/email)-> base64.b64encode / b64decode\n#   parse hex strings                     -> bytes.fromhex (and .hex() to emit)\n#   tolerate decode errors                -> errors=\"replace\" for logs, \"strict\" for data\n#   need to mutate                        -> bytearray (see next entry)\n#   parsing many records, performance      -> memoryview + struct.unpack_from (no copies)\n#\n# Anti-pattern: b\"\" + chunk in a loop. Each concatenation allocates a new\n# bytes object — O(n^2). Use bytearray.extend or io.BytesIO instead."
                  }
        ],
        tips: [
                  "Always specify encoding explicitly: `s.encode(\"utf-8\")` — never rely on platform default",
                  "Open binary files with \"rb\" or \"wb\" mode — missing the b causes silent corruption on Windows",
                  "Indexing bytes returns an int (0-255), not a character: `b\"hi\"[0]` is 104, not \"h\"",
                  "`bytes` is immutable — use `bytearray` if you need to modify individual bytes"
        ],
        mistake: "Opening a binary file in text mode: `open(\"image.png\", \"r\")`. Python decodes bytes as text and corrupts binary data. Always use \"rb\" for binary read.",
        shorthand: {
          verbose: "b = b\"hello\"               # literal — immutable\nb = bytes(5)               # 5 zero bytes: b'\\x00\\x00\\x00\\x00\\x00'\nb = bytes([72, 101, 108])  # from iterable of ints: b'Hel'\nb = bytes.fromhex('48656c6c6f')  # from hex string: b'hello'",
          concise: "list(b)                    # [65, 66, 67] — list of ints",
        },
      },
      {
        id: "bytearray",
        fn: "bytearray",
        desc: "Mutable sequence of raw bytes — the editable version of bytes.",
        category: "Standard Library",
        subtitle: "Modify bytes in place — append, extend, slice assignment",
        signature: "bytearray(size) | bytearray(b\"hello\") | s.encode(...)",
        descLong: "bytearray is like bytes but mutable — you can modify individual elements, append, extend, and slice-assign. Essential for building binary data incrementally without the O(n²) overhead of bytes concatenation. Convert to bytes when done.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of bytearray — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nba = bytearray(b\"hello\")\nba[0] = 72                                  # 'H'  (must be 0-255 int)\nba.append(33)                               # b'!'\nba.extend(b\" world\")                        # bytearray(b'Hello! world')\n# Convert to immutable when done.\nfinal = bytes(ba)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of bytearray — common patterns you'll see in production.\n# APPROACH  - Combine bytearray with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n# Slice replacement -- can grow or shrink.\nba = bytearray(b\"hello\")\nba[1:3] = b\"XX\"                              # bytearray(b'hXXlo')   (length 5)\nba[0:2] = b\"ABC\"                             # bytearray(b'ABCXlo')  (length 6, grew)\n# Pre-allocate then fill (e.g., received frame).\nbuf = bytearray(1024)\nn = sock.recv_into(buf)                      # writes into buf, no copy\nrecord = bytes(buf[:n])\n# Build framed output.\nout = bytearray()\nout.extend(b\"GET / HTTP/1.1\\r\\n\")\nout.extend(b\"Host: example.com\\r\\n\\r\\n\")\nsock.sendall(out)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of bytearray — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport socket, struct\ndef read_frames(sock: socket.socket):\n    \"\"\"Read [u32 len][payload] frames; one bytearray, no per-frame allocation.\"\"\"\n    buf = bytearray()\n    while True:\n        chunk = sock.recv(4096)\n        if not chunk: return\n        buf.extend(chunk)\n        # Drain whole frames; memoryview gives cheap views into buf.\n        while len(buf) >= 4:\n            (n,) = struct.unpack_from(\">I\", memoryview(buf), 0)\n            if len(buf) < 4 + n: break\n            yield bytes(buf[4:4+n])\n            del buf[:4+n]                        # free in place\n# Decision rule:\n#   immutable wire data                 -> bytes\n#   build binary in chunks               -> bytearray + extend (NOT b += chunk)\n#   pre-sized scratch                    -> bytearray(N); recv_into / readinto\n#   parse without copies                 -> memoryview over bytearray; release before mutate\n#   file -> binary munging               -> mmap (read-only) or bytearray + readinto (writable)\n#   \"string builder\" for text            -> WRONG tool; use list+\"\".join or io.StringIO\n#\n# Anti-pattern: while live_memoryview: ba.extend(...). The bytearray cannot\n# resize while a memoryview holds a reference; you'll get BufferError. Release\n# the view (set to None or exit the with-block) before mutating the buffer."
                  }
        ],
        tips: [
                  "Use `bytearray` to build binary data incrementally — avoids O(n²) copying from bytes concatenation",
                  "When appending a single byte, pass an int (0-255), not a byte: `ba.append(65)` not `ba.append(b\"A\")`",
                  "Convert to `bytes` when done mutating: `b = bytes(ba)` — bytes is more memory-efficient",
                  "Slice assignment can change length: `ba[1:3] = b\"XXXXX\"` replaces 2 bytes with 5"
        ],
        mistake: "Building binary data with bytes concatenation: `b += chunk` in a loop. This is O(n²). Use `bytearray`, append, then convert: `ba = bytearray(); ba.extend(chunks); b = bytes(ba)`.",
        shorthand: {
          verbose: "        import numpy as np\nba = bytearray(5)          # 5 zero bytes, mutable\nba = bytearray(b\"hello\")   # from bytes\nba = bytearray(\"hello\", \"utf-8\")  # from string\nba = bytearray(b\"hello\")",
          concise: "final = bytes(ba)          # immutable bytes object",
        },
      },
      {
        id: "pathlib",
        fn: "pathlib.Path",
        desc: "Object-oriented filesystem path manipulation.",
        category: "Standard Library",
        subtitle: "Cross-platform paths — / operator, read_text, glob, mkdir",
        signature: "Path(\"dir\") / \"file.txt\" | path.read_text() | path.glob(\"*.csv\")",
        descLong: "pathlib.Path is the modern replacement for os.path. It is object-oriented, cross-platform (handles / vs \\ automatically), and far more readable. Use it for all file system operations — file reading, directory creation, globbing.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pathlib.Path — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom pathlib import Path\np = Path.home() / \"Documents\" / \"data.csv\"\nprint(p.name, p.stem, p.suffix, p.parent)\nif p.exists():\n    text = p.read_text(encoding=\"utf-8\")\nPath(\"./out\").mkdir(parents=True, exist_ok=True)\nlist(Path(\".\").rglob(\"*.py\"))"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pathlib.Path — common patterns you'll see in production.\n# APPROACH  - Combine pathlib.Path with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom pathlib import Path\np = Path(\"./data/input.csv\").resolve()                  # absolute, symlinks resolved\ntarget = p.with_suffix(\".parquet\")                      # data/input.parquet\nbackup = p.with_name(p.stem + \".bak\" + p.suffix)        # data/input.bak.csv\n# One-level listing with metadata.\nfor entry in Path(\"./logs\").iterdir():\n    if entry.is_file() and entry.suffix == \".log\":\n        print(entry, entry.stat().st_size)\n# Idempotent + safe deletes.\nPath(\"./tmp/out.txt\").unlink(missing_ok=True)           # 3.8+: no error if absent\n# Path comparison via parts (cross-platform safe):\nPath(\"a/b/c\").relative_to(\"a\")                          # PosixPath('b/c')"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pathlib.Path — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom pathlib import Path\nimport importlib.resources as resources\ndef safe_join(base: Path, user_segment: str) -> Path:\n    \"\"\"Reject path traversal: user_segment cannot escape base.\"\"\"\n    target = (base / user_segment).resolve()\n    if base.resolve() not in target.parents and target != base.resolve():\n        raise ValueError(f\"path escapes sandbox: {target}\")\n    return target\ndef package_data(filename: str) -> str:\n    # Read a file shipped with your package — works in zipped wheels too.\n    return resources.files(\"my_package.data\").joinpath(filename).read_text(\"utf-8\")\n# Decision rule:\n#   any new code involving paths               -> pathlib.Path\n#   atomic file writes / symlink safety        -> see filesystem.js senior tiers\n#   file shipped with your package             -> importlib.resources (NOT __file__-relative)\n#   filtering many entries                      -> os.scandir for speed; pathlib for readability\n#   reject path traversal                       -> resolve() + check ancestor relationship\n#   cross-platform path display                 -> str(p) (forward slashes on Windows: use as_posix())\n#\n# Anti-pattern: Path concatenation via str(p) + \"/\" + name. Defeats the whole\n# point — you lose Windows handling AND the safety of path operations. Always\n# use the / operator."
                  }
        ],
        tips: [
                  "`Path.home() / \"docs\" / \"file.txt\"` is cross-platform — no hardcoded `/` or `\\\\`",
                  "`path.read_text()` / `write_text()` for simple files; `open()` context manager for streaming",
                  "`path.rglob(\"*.csv\")` recursively finds all CSVs — replaces `os.walk()` for most cases",
                  "`exist_ok=True` in `mkdir()` is idempotent — create if absent, no error if present"
        ],
        mistake: "String concatenation for paths: `path = dir + \"/\" + filename`. Breaks on Windows where the separator is `\\\\`. Use `Path(dir) / filename`.",
        shorthand: {
          verbose: "from pathlib import Path\np = Path(\"data\") / \"input.csv\"\np = Path.home() / \"Documents\" / \"report.pdf\"\np = Path.cwd() / \"output\"",
          concise: "sorted(Path(\"data\").glob(\"**/*.json\"))",
        },
      },
      {
        id: "builtin-exceptions",
        fn: "Built-in exceptions",
        desc: "The standard exception hierarchy and most common exception types.",
        category: "Standard Library",
        subtitle: "Know which exception to catch — never catch Exception blindly",
        signature: "ValueError | TypeError | KeyError | AttributeError | ...",
        descLong: "Python has a rich hierarchy of built-in exceptions. Catching the right exception type makes error handling precise and debuggable. The most common ones to know: ValueError (bad value), TypeError (wrong type), KeyError (missing dict key), AttributeError (missing attribute), IndexError (out of range), FileNotFoundError.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Built-in exceptions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntry:\n    n = int(user_input)\nexcept ValueError:\n    n = 0                                   # bad literal -> default\ntry:\n    val = config[\"host\"]\nexcept KeyError:\n    val = \"localhost\"                       # missing key -> default\ntry:\n    open(\"missing.txt\")\nexcept FileNotFoundError:\n    print(\"file not there\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Built-in exceptions — common patterns you'll see in production.\n# APPROACH  - Combine Built-in exceptions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ntry:\n    data = open(\"/etc/secret\").read()\nexcept (FileNotFoundError, PermissionError) as e:    # tuple of types\n    raise RuntimeError(\"config unavailable\") from e   # preserve cause\n# else: runs only if no exception was raised\n# finally: runs always (cleanup)\ntry:\n    f = open(\"data.csv\")\nexcept OSError as e:                                  # parent of FileNotFoundError + PermissionError\n    print(f\"cannot open: {e}\"); raise\nelse:\n    rows = f.read().splitlines()                       # parsed only if open() succeeded\nfinally:\n    try: f.close()\n    except NameError: pass                             # f never bound"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Built-in exceptions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom contextlib import suppress\n# 1) Define a thin domain hierarchy.\nclass AppError(Exception): ...\nclass NotFound(AppError): ...\nclass Forbidden(AppError): ...\nclass TransientError(AppError): ...                    # OK to retry\nclass FatalError(AppError): ...                         # do NOT retry\n# 2) Re-raise with context — never swallow tracebacks.\ndef fetch(url: str) -> bytes:\n    import urllib.request\n    try:\n        return urllib.request.urlopen(url).read()\n    except urllib.error.HTTPError as e:\n        if e.code == 404: raise NotFound(url) from e\n        if e.code == 403: raise Forbidden(url) from e\n        raise TransientError(url) from e\n# 3) ExceptionGroup + except* — handle a fan-out's failures by category.\nasync def fan_out(urls):\n    import asyncio\n    async with asyncio.TaskGroup() as tg:\n        tasks = [tg.create_task(asyncio.to_thread(fetch, u)) for u in urls]\n    return [t.result() for t in tasks]\nasync def safe_fan_out(urls):\n    try:\n        return await fan_out(urls)\n    except* NotFound as eg:\n        for e in eg.exceptions: log(\"missing: %s\", e)\n    except* TransientError as eg:\n        for e in eg.exceptions: log(\"retry: %s\", e)\n    return []\n# 4) \"I really do mean ignore\" — contextlib.suppress documents intent.\nwith suppress(FileNotFoundError):\n    Path(\"/tmp/lock\").unlink()                         # ok if absent\n# Decision rule:\n#   exact failure mode you expect           -> catch the specific class (ValueError, KeyError)\n#   any I/O failure                         -> except OSError  (parent of FileNotFoundError + PermissionError + ...)\n#   re-raising with cause                   -> raise NewError(...) from e\n#   ignore one specific failure             -> contextlib.suppress(ExcType)\n#   fan-out (TaskGroup, gather)             -> except* ExcGroup (3.11+)\n#   shutdown / interrupt                     -> CATCH KeyboardInterrupt explicitly if you want to act,\n#                                              otherwise let it propagate\n#   silence everything                       -> NEVER. except Exception: pass is a bug magnet.\n#\n# Anti-pattern: try / except Exception: pass. Real bugs (NameError, AttributeError,\n# OSError) get swallowed; the program \"works\" but produces garbage. If you must\n# catch broadly, log and re-raise."
                  }
        ],
        tips: [
                  "Catch the most specific exception possible — catching Exception hides bugs",
                  "FileNotFoundError, PermissionError are subclasses of OSError — catch OSError for both",
                  "KeyboardInterrupt and SystemExit are NOT subclasses of Exception — bare except: catches them, except Exception: does not",
                  "Use except (TypeError, ValueError) to catch multiple types in one clause"
        ],
        mistake: "Using bare except: or except Exception: to catch everything. This silences real bugs. Always catch the specific exception type you expect.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "with-statement",
        fn: "with statement",
        desc: "Execute a block with guaranteed setup and teardown via context managers.",
        category: "Standard Library",
        subtitle: "Guarantees cleanup even if an exception occurs",
        signature: "with open(\"f\") as f: | with contextlib.contextmanager",
        descLong: "The with statement calls __enter__ before the block and __exit__ after — even if an exception is raised. Used for file handles, database connections, locks, and temporary state. contextlib.contextmanager lets you write a context manager with a generator function.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of with statement — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nwith open(\"data.txt\") as f:\n    content = f.read()                       # f closed even if read() raises\nimport threading\nlock = threading.Lock()\nwith lock:\n    counter += 1                              # lock released even on exception"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of with statement — common patterns you'll see in production.\n# APPROACH  - Combine with statement with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom contextlib import contextmanager, suppress\nimport time\n# Multiple files / locks at once.\nwith open(\"a.txt\") as fa, open(\"b.txt\", \"w\") as fb:\n    fb.write(fa.read().upper())\n# Quick custom CM via @contextmanager.\n@contextmanager\ndef timed(label):\n    t0 = time.perf_counter()\n    try: yield\n    finally: print(f\"{label}: {time.perf_counter() - t0:.3f}s\")\nwith timed(\"load\"):\n    data = open(\"big.csv\").read()\n# Ignore specific failures intentionally.\nwith suppress(FileNotFoundError):\n    Path(\"/tmp/lock\").unlink()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of with statement — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom contextlib import ExitStack\n# Open N files dynamically — ExitStack closes all on exit.\ndef merge_files(paths: list[str]) -> str:\n    with ExitStack() as stack:\n        files = [stack.enter_context(open(p)) for p in paths]\n        return \"\".join(f.read() for f in files)\n# Decision rule:\n#   resource that needs cleanup            -> with statement (NOT try/finally)\n#   variable number of resources            -> contextlib.ExitStack\n#   async resource (DB pool, HTTP client)   -> async with X() as y\n#   \"if file is missing, just skip\"          -> contextlib.suppress(FileNotFoundError)\n#   custom resource type                     -> __enter__/__exit__ class OR @contextmanager\n#   need to retry / handle errors            -> try/except INSIDE the with block, NOT around it\n#\n# Anti-pattern: returning True from __exit__ to \"swallow this exception\".\n# Almost always hides bugs. Return False (or omit return) and let the\n# exception propagate; if you must suppress, use contextlib.suppress with\n# the SPECIFIC exception type."
                  }
        ],
        tips: [
                  "with is cleaner than try/finally for resource cleanup — the intent is explicit",
                  "Multiple context managers on one line: `with open(a) as f1, open(b) as f2:`",
                  "@contextmanager turns a generator function into a context manager — yield is the with block",
                  "contextlib.suppress is the cleanest way to ignore specific expected exceptions"
        ],
        mistake: "Using try/finally for file handling: `f = open(\"x\"); try: ... finally: f.close()`. Use with open(\"x\") as f — it is shorter, clearer, and handles the exception-during-close edge case.",
        shorthand: {
          verbose: "f = open(\"file.txt\")\ntry:\n    data = f.read()\nfinally:\n    f.close()",
          concise: "with open(\"file.txt\") as f:\n    data = f.read()",
        },
      },
      {
        id: "exceptions",
        fn: "Exception handling",
        desc: "Handle, raise, and define exceptions.",
        category: "Standard Library",
        subtitle: "Catch specific exceptions, use else/finally, define custom types",
        signature: "try: ... except ValueError as e: ... else: ... finally: ...",
        descLong: "Always catch specific exceptions — bare except catches everything including SystemExit and KeyboardInterrupt. The else clause runs only when no exception occurred. finally always runs — use it for cleanup. Custom exceptions should inherit from Exception.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Exception handling — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ntry:\n    n = int(input(\"number? \"))\nexcept ValueError:\n    print(\"not a number\")\nelse:\n    print(f\"got {n}\")\nfinally:\n    print(\"done\")\nraise ValueError(\"must be positive\")            # signal a problem"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Exception handling — common patterns you'll see in production.\n# APPROACH  - Combine Exception handling with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nclass AppError(Exception): ...\nclass ValidationError(AppError):\n    def __init__(self, field: str, msg: str):\n        self.field = field\n        super().__init__(f\"{field}: {msg}\")\ndef parse_age(s: str) -> int:\n    try:\n        n = int(s)\n    except ValueError as e:\n        raise ValidationError(\"age\", \"not a number\") from e   # preserve cause\n    if n < 0:\n        raise ValidationError(\"age\", \"must be >= 0\")\n    return n\ntry:\n    parse_age(\"abc\")\nexcept ValidationError as e:\n    print(f\"bad input: {e.field}\")\nexcept AppError as e:\n    print(f\"generic app failure: {e}\")\nexcept (KeyError, TypeError):\n    pass"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Exception handling — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport logging\nlog = logging.getLogger(__name__)\nclass TransientError(Exception):\n    \"\"\"Caller should retry.\"\"\"\nclass FatalError(Exception):\n    \"\"\"Caller should abort.\"\"\"\ndef with_retry(fn, *, attempts: int = 3):\n    last: Exception | None = None\n    for i in range(attempts):\n        try: return fn()\n        except TransientError as e:\n            last = e; log.warning(\"attempt %d/%d: %s\", i + 1, attempts, e)\n        except FatalError:\n            raise                                            # never retry fatal\n    raise RuntimeError(\"retries exhausted\") from last\n# Decision rule:\n#   single failure mode you understand     -> catch the specific exception class\n#   \"any I/O failure\"                       -> except OSError (parent of FNF + Permission + ...)\n#   re-raise with cause                    -> raise NewError(...) from e (NOT bare raise NewError)\n#   \"ignore this specific miss\"             -> contextlib.suppress(ExcType) — documents intent\n#   fan-out (gather/TaskGroup)              -> ExceptionGroup + except* (3.11+)\n#   want callers to retry vs abort         -> separate exception classes (Transient vs Fatal)\n#   silence everything                     -> NEVER. except Exception: pass is a bug magnet\n#\n# Anti-pattern: try/except Exception: log.error(e). The traceback vanishes.\n# Use log.exception(...) (auto-includes traceback) or log.error(\"...\",\n# exc_info=True). And re-raise unless you actually handled it."
                  }
        ],
        tips: [
                  "Never use bare `except:` — it catches `SystemExit`, `KeyboardInterrupt`, and generator exits",
                  "`raise ... from e` preserves the exception chain — critical for debugging",
                  "The `else` clause cleanly separates \"code that might fail\" from \"code that runs on success\"",
                  "Define a base `AppError` so callers can catch all app errors with one `except AppError`"
        ],
        mistake: "`except Exception as e: print(e); pass` silently swallows exceptions. At minimum, use `logging.exception(\"msg\")` — it logs the full traceback.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "main-guard",
        fn: "__name__ == \"__main__\"",
        desc: "Guard code that should only run when the file is executed directly.",
        category: "Standard Library",
        subtitle: "Separates runnable script from importable module",
        signature: "if __name__ == \"__main__\": main()",
        descLong: "When Python runs a file directly, it sets __name__ to \"__main__\". When the file is imported as a module, __name__ is set to the module name. The guard ensures that script code (like calling main()) only runs when the file is executed directly, not when it is imported.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of __name__ == \"__main__\" — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ndef add(a, b):\n    return a + b\nif __name__ == \"__main__\":\n    print(add(3, 4))                       # only runs on 'python file.py'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of __name__ == \"__main__\" — common patterns you'll see in production.\n# APPROACH  - Combine __name__ == \"__main__\" with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\ndef parse_args(argv: list[str] | None = None):\n    import argparse\n    p = argparse.ArgumentParser()\n    p.add_argument(\"input\")\n    return p.parse_args(argv)\ndef main(argv: list[str] | None = None) -> int:\n    args = parse_args(argv)\n    print(f\"processing {args.input}\")\n    return 0\nif __name__ == \"__main__\":\n    raise SystemExit(main())                # propagates exit code\n# In a package:  mypkg/__main__.py\n# from mypkg.cli import main\n# raise SystemExit(main())\n# Then: python -m mypkg ..."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of __name__ == \"__main__\" — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nimport sys\ndef main(argv: list[str] | None = None) -> int:\n    \"\"\"argv=None reads sys.argv[1:]; pass a list in tests.\"\"\"\n    if argv is None: argv = sys.argv[1:]\n    # ... parsing + dispatch ...\n    return 0\n# pyproject.toml:\n# [project.scripts]\n# mycli = \"mypkg.cli:main\"\n#\n# mypkg/__main__.py (so 'python -m mypkg' works the same):\n# from mypkg.cli import main\n# raise SystemExit(main())\n# Tests:\n# def test_cli_ok():\n#     assert main([\"--input\", \"x.csv\"]) == 0\n#\n# def test_cli_bad_input():\n#     assert main([\"--bad\"]) == 2\n# Decision rule:\n#   any script that may also be imported    -> if __name__ == \"__main__\": guard, ALWAYS\n#   reusable + testable script               -> wrap in main(argv=None) -> int\n#   ship as a binary                          -> pyproject [project.scripts] entry point\n#   \"python -m mypkg\" support                -> mypkg/__main__.py that imports + calls main\n#   error exit code                          -> raise SystemExit(main())\n#\n# Anti-pattern: putting top-level side effects (DB connections, file reads,\n# argparse) outside the guard. Any 'import mymod' triggers them — surprising\n# everyone, breaking test discovery, slowing imports."
                  }
        ],
        tips: [
                  "Always wrap your script logic in `main()` and call it from the guard — makes it testable",
                  "Without the guard, `import mymodule` would run all top-level code including side effects",
                  "Put `if __name__ == \"__main__\": main()` at the very end of every script",
                  "`__main__.py` in a package lets you run it with `python -m mypackage`"
        ],
        mistake: "Putting import-time side effects (file reads, DB connections, print statements) at module top level without a guard. Any file that imports your module will trigger those side effects.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "pathlib-module",
        fn: "pathlib (Path Objects)",
        desc: "Modern, object-oriented file path handling.",
        category: "File System",
        subtitle: "Cross-platform path manipulation without os.path",
        signature: "from pathlib import Path\npath = Path(\"/home/user/file.txt\")",
        descLong: "pathlib provides Path objects for filesystem operations — cleaner than os.path strings. Methods like .exists(), .read_text(), .glob() work directly on Path objects. Handles cross-platform paths automatically (/ vs \\\\).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of pathlib (Path Objects) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom pathlib import Path\np = Path.home() / \"data\" / \"report.csv\"\np.parent.mkdir(parents=True, exist_ok=True)\np.write_text(\"name,value\\n\", encoding=\"utf-8\")\nprint(p.exists(), p.stat().st_size)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of pathlib (Path Objects) — common patterns you'll see in production.\n# APPROACH  - Combine pathlib (Path Objects) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom pathlib import Path, PurePosixPath, PureWindowsPath\n# Parse a Windows path on Linux for analysis (no FS access).\nPureWindowsPath(r\"C:\\Users\\alice\\file.txt\").drive          # 'C:'\nPurePosixPath(\"/etc/hosts\").parts                              # ('/', 'etc', 'hosts')\n# Recursive walk + filter via rglob.\nfor py in Path(\"./src\").rglob(\"*.py\"):\n    if \"test_\" not in py.name:\n        print(py.relative_to(\"./src\"))\n# resolve() vs absolute(): resolve walks symlinks, absolute() doesn't.\nPath(\"./data/../data/x.csv\").resolve()          # canonical, symlinks resolved\nPath(\"./data/x.csv\").absolute()                  # absolute, no symlink resolution\n# Compare suffix vs match.\np = Path(\"/var/log/app.tar.gz\")\np.suffix                                         # '.gz'\np.suffixes                                       # ['.tar', '.gz']"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of pathlib (Path Objects) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom pathlib import Path, PurePosixPath\ndef safe_join(base: Path, rel: str) -> Path:\n    \"\"\"Reject path traversal: rel cannot escape base via .. or absolute.\"\"\"\n    target = (base / rel).resolve()\n    base_r = base.resolve()\n    if base_r != target and base_r not in target.parents:\n        raise ValueError(f\"escapes sandbox: {target}\")\n    return target\n# Decision rule:\n#   one-off path manipulation              -> pathlib (avoid os.path)\n#   parsing path strings from another OS    -> PurePosixPath / PureWindowsPath\n#   walk a tree                            -> Path.rglob (or os.scandir for speed)\n#   atomic write / fsync / sandbox          -> see filesystem.js senior tiers\n#   per-package data files                  -> importlib.resources (NOT __file__-relative)\n#   tight loop scanning many files          -> os.scandir + DirEntry (no Path allocations)\n#\n# Anti-pattern: Path(user_input) without traversal validation. \"..\" segments\n# escape; absolute paths bypass the base entirely. Always safe_join into a\n# known sandbox before opening."
                  }
        ],
        tips: [
                  "Use Path / operator instead of os.path.join() — much cleaner syntax",
                  "Path.home(), Path.cwd() get common directories without os module",
                  "glob() and rglob() replace os.walk() for finding files by pattern",
                  ".read_text() and .write_text() eliminate open/close boilerplate"
        ],
        mistake: "Mixing string paths with Path objects. Convert early: path = Path(string_path), then use Path methods throughout.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "functools-partial-cache",
        fn: "functools (partial, lru_cache, reduce)",
        desc: "Functional programming utilities: function wrapping, caching, reduction.",
        category: "Functions",
        subtitle: "Partial application, memoization, and functional composition",
        signature: "from functools import partial, lru_cache, reduce, wraps",
        descLong: "functools provides higher-order functions for composition and optimization. partial pre-fills function arguments, lru_cache memoizes results, reduce folds a function over an iterable, wraps preserves function metadata in decorators.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of functools (partial, lru_cache, reduce) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom functools import cache, partial, reduce, wraps\ndouble = partial(lambda a, b: a * b, 2)\nprint(double(5))                         # 10\n@cache\ndef fib(n): return n if n < 2 else fib(n-1) + fib(n-2)\nprint(fib(50))                           # instant via memo\nreduce(lambda a, b: a + b, [1, 2, 3, 4])  # 10"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of functools (partial, lru_cache, reduce) — common patterns you'll see in production.\n# APPROACH  - Combine functools (partial, lru_cache, reduce) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom functools import lru_cache, wraps, cmp_to_key\n@lru_cache(maxsize=256)\ndef expensive(x: int) -> int:\n    return sum(i * i for i in range(x))\ndef trace(fn):\n    @wraps(fn)                              # ALWAYS @wraps\n    def w(*a, **kw):\n        print(f\"-> {fn.__name__}\")\n        return fn(*a, **kw)\n    return w\n# Bridge legacy 3-way compare to sorted(key=...).\ndef cmp_versions(a, b):\n    av, bv = tuple(map(int, a.split(\".\"))), tuple(map(int, b.split(\".\")))\n    return (av > bv) - (av < bv)\nsorted([\"1.10\", \"1.2\", \"1.9\"], key=cmp_to_key(cmp_versions))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of functools (partial, lru_cache, reduce) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom functools import singledispatch, cached_property, reduce\nimport operator\n@singledispatch\ndef render(value, /) -> str:\n    return repr(value)\n@render.register\ndef _(value: list) -> str:\n    return \"[\" + \", \".join(render(x) for x in value) + \"]\"\nclass Doc:\n    def __init__(self, body: str): self.body = body\n    @cached_property                                # GC-safe instance cache\n    def hash(self) -> str:\n        import hashlib\n        return hashlib.sha256(self.body.encode()).hexdigest()\n# Legitimate reduce: combine many sets/dicts.\nunion = reduce(operator.or_, [{1, 2}, {2, 3}, {3, 4}], set())\n# Decision rule:\n#   memoize a pure function           -> @cache (or @lru_cache(maxsize=N) to bound memory)\n#   memoize on the instance           -> @cached_property  (NOT @lru_cache; leaks self refs)\n#   type-based dispatch                -> @singledispatch / singledispatchmethod\n#   bind some args                    -> functools.partial (partialmethod for classes)\n#   write a decorator                 -> @functools.wraps(fn) on the wrapper, ALWAYS\n#   bridge a 3-way compare(a,b)       -> functools.cmp_to_key\n#\n# Anti-pattern: reduce(operator.add, xs) — built-in sum(xs) is the same and\n# faster. Reserve reduce for combiners with no built-in (set union, dict\n# merge, custom monoid)."
                  }
        ],
        tips: [
                  "partial(func, arg1) creates a new function with arg1 pre-filled — useful for callbacks",
                  "lru_cache requires hashable arguments (no lists/dicts). Convert to tuple if needed",
                  "reduce(func, iterable, init) accumulates: result = func(func(func(init, x0), x1), ...)",
                  "@wraps in decorators preserves __name__, __doc__ — helps with debugging and documentation"
        ],
        mistake: "Using @lru_cache with unhashable arguments (lists, dicts). Convert to hashable: @lru_cache works with tuples, strings, frozensets.",
        shorthand: {
          verbose: "from functools import partial, lru_cache, reduce, wraps\nfrom operator import mul, add\ndef multiply(a, b):\nreturn a * b",
          concise: "slow_operation()  # Prints timing info",
        },
      },
      {
        id: "collections-counter-deque",
        fn: "collections (Counter, defaultdict, deque, namedtuple)",
        desc: "Specialized data structures for counting, defaults, queues, and tuples.",
        category: "Data Structures",
        subtitle: "Efficient alternatives to dict and list for specific use cases",
        signature: "from collections import Counter, defaultdict, deque, namedtuple",
        descLong: "collections module provides optimized data structures. Counter counts occurrences, defaultdict avoids KeyError, deque is a fast double-ended queue, namedtuple creates lightweight tuple subclasses with named fields.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of collections (Counter, defaultdict, deque, namedtuple) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom collections import Counter, defaultdict, deque, namedtuple\nCounter(\"abracadabra\").most_common(2)         # [('a', 5), ('b', 2)]\ngroups = defaultdict(list)\nfor w in \"the quick brown fox\".split():\n    groups[len(w)].append(w)                   # no KeyError\n# {3: ['the', 'fox'], 5: ['quick', 'brown']}\nPoint = namedtuple(\"Point\", [\"x\", \"y\"])\np = Point(1, 2)\np.x, p.y                                       # 1, 2 — also tuple-indexable"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of collections (Counter, defaultdict, deque, namedtuple) — common patterns you'll see in production.\n# APPROACH  - Combine collections (Counter, defaultdict, deque, namedtuple) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom collections import Counter, defaultdict, namedtuple, ChainMap\n# Counter arithmetic — like multiset algebra.\ninv  = Counter(apples=10, oranges=5)\nsold = Counter(apples=3, oranges=1)\nremaining = inv - sold                         # {'apples': 7, 'oranges': 4}\n# Group-by pattern via defaultdict(list).\npeople = [(\"eng\", \"Ada\"), (\"ops\", \"Tim\"), (\"eng\", \"Bob\")]\nby_team = defaultdict(list)\nfor team, name in people: by_team[team].append(name)\n# namedtuple + defaults + immutable update.\nColor = namedtuple(\"Color\", \"r g b\", defaults=(0, 0, 0))\nred = Color(255).copy() if hasattr(Color(255), \"copy\") else Color(255)._replace(r=255)\ndarker = red._replace(r=red.r // 2)\n# ChainMap: layered lookups, no merge cost.\ndefaults = {\"host\": \"localhost\", \"port\": 80}\noverrides = {\"port\": 8080}\ncfg = ChainMap(overrides, defaults)            # overrides win; falls back to defaults\nprint(cfg[\"port\"], cfg[\"host\"])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of collections (Counter, defaultdict, deque, namedtuple) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom collections import Counter, defaultdict, ChainMap\nfrom dataclasses import dataclass\n# Counter: top-K, total volume, ratio analysis.\ndef top_k_with_share(events: list[str], k: int) -> list[tuple[str, int, float]]:\n    c = Counter(events)\n    total = sum(c.values()) or 1\n    return [(k_, n, n / total) for k_, n in c.most_common(k)]\n# defaultdict(set) for membership graphs.\nedges = [(\"a\", \"b\"), (\"a\", \"c\"), (\"b\", \"c\")]\nadj: dict[str, set[str]] = defaultdict(set)\nfor u, v in edges: adj[u].add(v)\n# ChainMap for layered config (env > file > defaults).\nimport os\ndefaults = {\"timeout\": 30, \"host\": \"localhost\"}\nfile_cfg = {\"host\": \"prod.example.com\"}\nenv_cfg  = {k.removeprefix(\"APP_\").lower(): v\n            for k, v in os.environ.items() if k.startswith(\"APP_\")}\nconfig = ChainMap(env_cfg, file_cfg, defaults)\n# In NEW code, prefer @dataclass over namedtuple for typed records.\n@dataclass(frozen=True, slots=True)\nclass Point:\n    x: float; y: float\n# Decision rule:\n#   counting / frequency / multiset arithmetic    -> Counter\n#   group-by / \"dict of lists or sets\"            -> defaultdict(list / set)\n#   FIFO queue / sliding window                    -> deque (see earlier entry)\n#   layered lookup (env > file > defaults)        -> ChainMap (no copying)\n#   simple typed record, immutable                -> @dataclass(frozen=True, slots=True) (preferred)\n#                                                    OR typing.NamedTuple (typed namedtuple)\n#   ordered dict                                   -> regular dict (insertion order is guaranteed since 3.7)\n#\n# Anti-pattern: writing your own counter via 'if k in d: d[k] += 1 else: d[k] = 1'.\n# Counter or defaultdict(int) makes the intent clear AND is faster."
                  }
        ],
        tips: [
                  "Counter most_common(n) returns top N items — efficient for finding most frequent",
                  "defaultdict avoids try/except or .get() for missing keys — cleaner code",
                  "deque with maxlen auto-evicts oldest when full — perfect for sliding windows",
                  "namedtuple lightweight than dataclass, no methods — use for simple data containers"
        ],
        mistake: "Using regular dict when defaultdict would simplify code. defaultdict eliminates if key in dict checks.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "context-managers-with",
        fn: "Context Managers (with statement)",
        desc: "Safely acquire/release resources with __enter__ and __exit__.",
        category: "Control Flow",
        subtitle: "Automatic cleanup of files, locks, connections",
        signature: "class MyContext:\n    def __enter__(self): ...\n    def __exit__(self, exc_type, exc, tb): ...",
        descLong: "Context managers (with statement) ensure setup and cleanup code runs. Use for files, database connections, locks, and temporary state changes. Define __enter__ (acquire) and __exit__ (release).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Context Managers (with statement) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom contextlib import contextmanager\n@contextmanager\ndef timed(label):\n    import time; t0 = time.perf_counter()\n    try: yield\n    finally: print(f\"{label}: {time.perf_counter() - t0:.3f}s\")\nwith timed(\"load\"):\n    data = open(\"big.csv\").read()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Context Managers (with statement) — common patterns you'll see in production.\n# APPROACH  - Combine Context Managers (with statement) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom contextlib import ExitStack, suppress\nclass Connection:\n    def __init__(self, dsn): self.dsn = dsn\n    def __enter__(self):\n        print(f\"open {self.dsn}\"); self.live = True; return self\n    def __exit__(self, exc_type, exc, tb):\n        print(\"close\"); self.live = False\n        return False                                  # propagate exceptions\nwith Connection(\"postgres://x\") as c:\n    print(\"live:\", c.live)\n# Variable number of resources via ExitStack.\ndef merge(paths):\n    with ExitStack() as st:\n        files = [st.enter_context(open(p)) for p in paths]\n        return \"\".join(f.read() for f in files)\nwith suppress(FileNotFoundError):\n    Path(\"/tmp/lock\").unlink()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Context Managers (with statement) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom __future__ import annotations\nfrom contextlib import asynccontextmanager, contextmanager, ExitStack\n# Async resources need async with + asynccontextmanager.\n@asynccontextmanager\nasync def db_session(pool):\n    conn = await pool.acquire()\n    try: yield conn\n    finally: await pool.release(conn)\n# Decision rule:\n#   resource that needs cleanup           -> with statement\n#   small one-off CM                       -> @contextmanager generator\n#   class-shaped CM with state             -> __enter__/__exit__ class\n#   variable count of resources            -> contextlib.ExitStack\n#   async resource (DB pool, HTTP client)  -> @asynccontextmanager + async with\n#   \"if it fails, just skip\"                -> contextlib.suppress(SpecificExc)\n#   capture stdout/stderr                  -> contextlib.redirect_stdout / redirect_stderr\n#   nullable CM (sometimes None)           -> contextlib.nullcontext\n#\n# Anti-pattern: __exit__ returns True. Suppresses ALL exceptions silently —\n# including ones you didn't expect. Return False (or omit return); use\n# contextlib.suppress with a specific type when you really mean to ignore."
                  }
        ],
        tips: [
                  "__exit__ receives exception info (type, value, traceback) — return True to suppress",
                  "Use @contextmanager decorator for simple context managers — often cleaner than class",
                  "ExitStack manages multiple resources dynamically — perfect for variable number of files",
                  "finally in context manager always runs — use for guaranteed cleanup"
        ],
        mistake: "Forgetting to use with statement. Always use with for file/connection handling — don't manually call __enter__/__exit__.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "itertools-module",
        fn: "itertools (Combinations, Permutations, Chain)",
        desc: "Memory-efficient iterators for combinatorics and chaining.",
        category: "Iteration",
        subtitle: "Lazy sequences without creating full lists",
        signature: "from itertools import combinations, permutations, chain, groupby, islice",
        descLong: "itertools provides lazy iterators for combinations, permutations, chaining, grouping, and slicing. Memory-efficient because they generate values on-the-fly, not all at once.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of itertools (Combinations, Permutations, Chain) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nfrom itertools import chain, combinations, islice\nlist(chain([1, 2], [3, 4]))                  # [1, 2, 3, 4]\nlist(combinations(\"ABCD\", 2))                 # all 2-element unordered subsets\nlist(islice(range(1000), 5))                  # [0, 1, 2, 3, 4]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of itertools (Combinations, Permutations, Chain) — common patterns you'll see in production.\n# APPROACH  - Combine itertools (Combinations, Permutations, Chain) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom itertools import chain, product, groupby, pairwise\n# Flatten lists of lists.\nflat = list(chain.from_iterable([[1, 2], [3, 4]]))      # [1, 2, 3, 4]\n# Cartesian product replaces nested loops.\nfor color, size in product([\"red\", \"blue\"], [\"S\", \"M\", \"L\"]):\n    pass\n# Adjacent pairs (Python 3.10+).\nfor a, b in pairwise([1, 2, 3, 4]):\n    print(a, b)                                          # (1,2) (2,3) (3,4)\n# groupby — must sort first.\ndata = [(\"a\", 1), (\"b\", 2), (\"a\", 3)]\nfor k, g in groupby(sorted(data, key=lambda x: x[0]), key=lambda x: x[0]):\n    print(k, list(g))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of itertools (Combinations, Permutations, Chain) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nfrom itertools import islice, tee\nfrom collections.abc import Iterable, Iterator\ndef chunked[T](xs: Iterable[T], n: int) -> Iterator[list[T]]:\n    it = iter(xs)\n    while batch := list(islice(it, n)):\n        yield batch\n# Decision rule:\n#   join sequences                        -> chain / chain.from_iterable\n#   slice any iterable                    -> islice\n#   all unordered subsets                 -> combinations\n#   all ordered subsets                   -> permutations\n#   nested loops over multiple ranges     -> product (with repeat= for grid search)\n#   running sum / running max             -> accumulate\n#   consecutive duplicates                -> groupby (sort first if you want all matches)\n#   adjacent pairs                        -> pairwise (3.10+)\n#   batch / chunk                         -> islice in a while loop OR more_itertools.chunked\n#   branch one stream                     -> tee (watch memory if branches advance unevenly)\n#\n# Anti-pattern: list(itertools.cycle(xs)) — hangs forever. ALWAYS bound infinite\n# iterators (count / cycle / repeat) with islice or break out of the loop."
                  }
        ],
        tips: [
                  "combinations/permutations return iterators (lazy) — don't convert to list unless needed",
                  "chain.from_iterable() flattens nested iterables without creating intermediate lists",
                  "groupby requires data sorted by key — sort first if needed",
                  "islice + repeat/cycle create infinite lazy sequences — process with islice or list comprehension"
        ],
        mistake: "Calling list() immediately on itertools results for large datasets. Use iterators directly in loops when possible to save memory.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "re-module-regex",
        fn: "re Module (Regular Expressions)",
        desc: "Pattern matching and text manipulation with regex.",
        category: "Text Processing",
        subtitle: "Search, split, and replace text with patterns",
        signature: "import re\nre.search(pattern, string)\nre.match(pattern, string)\nre.findall(pattern, string)",
        descLong: "re module provides regex functionality for pattern matching, extraction, substitution, and splitting. Compile patterns for reuse, use groups for extraction, leverage named groups for clarity.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of re Module (Regular Expressions) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport re\nif re.search(r\"fox\", \"the quick brown fox\"):\n    print(\"found\")\nre.findall(r\"\\d+\", \"42 apples, 17 oranges\")    # ['42', '17']\nre.sub(r\"\\s+\", \" \", \"many   spaces\")            # 'many spaces'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of re Module (Regular Expressions) — common patterns you'll see in production.\n# APPROACH  - Combine re Module (Regular Expressions) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport re\nEMAIL = re.compile(r\"(?P<user>[\\w.+-]+)@(?P<domain>[\\w.-]+)\")\nm = EMAIL.search(\"Contact: alice@example.com\")\nprint(m[\"user\"], m[\"domain\"])                    # alice example.com\n# Case-insensitive match.\nre.findall(r\"hello\", \"HELLO hello Hello\", re.IGNORECASE)   # ['HELLO','hello','Hello']\n# fullmatch for validators.\ndef is_phone(s: str) -> bool:\n    return re.fullmatch(r\"\\d{3}-\\d{3}-\\d{4}\", s) is not None"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of re Module (Regular Expressions) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\nimport re\n# Quick reference — full deep dive lives in regex.js senior tiers:\n#   anchored validator        -> re.fullmatch(r\"\\A...\\Z\", s) with re.ASCII for protocol fields\n#   compile once, reuse       -> module-level re.compile(...) with descriptive UPPER_CASE name\n#   \"negative lookbehind\"     -> (?<!\\$)\\d+ — narrow what NOT to match\n#   \"between two delimiters\"  -> [^X]+ instead of .+? to defuse backtracking\n#   user-supplied pattern     -> 'regex' library with timeout=, OR reject\n# Decision rule:\n#   reused pattern in hot path                 -> re.compile + UPPER_CASE module constant\n#   validator (whole string must match)        -> re.fullmatch with re.ASCII for protocol fields\n#   extractor (data out of text)               -> re.finditer + named groups + dataclass\n#   replacement with computed text             -> re.sub(pattern, callable, s) — NOT raw r\"\\1\" with untrusted input\n#   simple split on multi-char delimiter       -> re.split (not str.split)\n#   parsing JSON / HTML / SQL / email          -> NOT regex; use a real parser (json, lxml, sqlglot, email)\n#   user-supplied pattern                      -> 'regex' library with timeout= or reject\n#   case-insensitive across alphabets          -> re.IGNORECASE | re.UNICODE; or s.casefold()\n#\n# Anti-pattern: using re.match where re.fullmatch is meant.\n#   re.match anchors only at the START — `re.match(r\"\\d{3}\", \"1234abc\")` succeeds because the\n#   prefix matches. For \"validate the entire input is digits\", use re.fullmatch (or anchor\n#   with \\A...\\Z). The bug is silent: validators pass on partial-match inputs and let bad\n#   data through. Even simpler: prefer re.fullmatch for ALL validators so anchoring is\n#   explicit and obvious. (See regex.js for the full discussion.)"
                  }
        ],
        tips: [
                  "Compile complex patterns once: pattern = re.compile(...), then reuse",
                  "Use raw strings: r'...\\d...' not '...\\\\d...' (backslash escaping cleaner)",
                  "Named groups (?P<name>...) make patterns self-documenting",
                  "Test regex: use regex101.com or regexpal.com before using in code"
        ],
        mistake: "Not using raw strings (r'...') — backslashes need escaping in regular strings. Always use r'...' for regex patterns.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "logging-module",
        fn: "logging Module",
        desc: "Configure and output structured logs with levels and handlers.",
        category: "Debugging",
        subtitle: "Replace print() with configurable logging",
        signature: "import logging\nlogging.basicConfig(...)\nlogger.info(...)\nlogger.error(...)",
        descLong: "logging module provides levels (DEBUG, INFO, WARNING, ERROR, CRITICAL), handlers (file, stream, email), and formatters. More flexible than print() for production code.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of logging Module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport logging\nlogging.basicConfig(\n    level=logging.INFO,\n    format=\"%(asctime)s %(levelname)s %(name)s: %(message)s\",\n)\nlog = logging.getLogger(__name__)\nlog.info(\"started\")\nlog.warning(\"near rate limit: %d/%d\", 95, 100)   # %-style is LAZY\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    log.exception(\"math broke\")                   # auto-includes traceback"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of logging Module — common patterns you'll see in production.\n# APPROACH  - Combine logging Module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport logging\nimport logging.config\nlogging.config.dictConfig({\n    \"version\": 1, \"disable_existing_loggers\": False,\n    \"formatters\": {\"std\": {\"format\": \"%(asctime)s %(levelname)s %(name)s | %(message)s\"}},\n    \"handlers\": {\n        \"stderr\": {\"class\": \"logging.StreamHandler\", \"formatter\": \"std\", \"level\": \"INFO\"},\n        \"file\":   {\"class\": \"logging.handlers.RotatingFileHandler\",\n                   \"filename\": \"app.log\", \"maxBytes\": 10_000_000, \"backupCount\": 3,\n                   \"formatter\": \"std\", \"level\": \"DEBUG\"},\n    },\n    \"root\": {\"handlers\": [\"stderr\", \"file\"], \"level\": \"DEBUG\"},\n    \"loggers\": {\"httpx\": {\"level\": \"WARNING\"}},     # quiet noisy lib\n})\nlog = logging.getLogger(__name__)\nlog.info(\"processed\", extra={\"file\": \"data.csv\", \"rows\": 1000})"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of logging Module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Quick reference (full senior tier in packaging.js):\n#\n#   getLogger(__name__) per module                -> hierarchical config\n#   log.exception(\"msg\")                          -> includes traceback automatically\n#   lazy % formatting                             -> log.info(\"x=%s\", var)  (skips str() if filtered)\n#   \"extra={...}\" for structured fields           -> JSONFormatter or structlog reads them\n#   never log secrets                             -> redact at the formatter / processor stage\n#   under multiprocess                            -> QueueHandler + QueueListener (one writer)\n#   environment-aware                              -> Console (dev) vs JSONRenderer (prod) via structlog\n#\n# Decision rule:\n#   tiny script                              -> logging.basicConfig\n#   service / multi-module                   -> dictConfig + getLogger(__name__)\n#   structured fields, JSON sink              -> structlog (see packaging.js)\n#   correlation across async                 -> structlog.contextvars + contextvars\n#   multi-process forking server              -> QueueHandler/QueueListener\n#   PII / tokens in payloads                  -> redaction processor BEFORE the renderer\n#\n# Anti-pattern: f-string formatting in log calls. log.info(f\"x={var}\") evaluates\n# the f-string EVEN when the level is filtered. Use log.info(\"x=%s\", var) so the\n# format is skipped when the message wouldn't be emitted."
                  }
        ],
        tips: [
                  "Use logger per module: logger = logging.getLogger(__name__) — hierarchy makes filtering easy",
                  "Avoid logging sensitive data (passwords, tokens) — set level to WARNING in production",
                  "File rotation prevents massive log files — RotatingFileHandler auto-manages backups",
                  "Use lazy formatting: logger.info(\"x=%s\", var) only formats if level enabled"
        ],
        mistake: "Using print() in production code. Replace with logging — allows runtime filtering, file output, and structured logging.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "argparse-cli",
        fn: "argparse (Command-Line Arguments)",
        desc: "Parse and validate CLI arguments with help messages.",
        category: "I/O",
        subtitle: "Professional CLI with argument validation",
        signature: "import argparse\nparser = ArgumentParser()\nparser.add_argument(...)\nargs = parser.parse_args()",
        descLong: "argparse provides CLI argument parsing with automatic help, type conversion, and validation. Better than sys.argv parsing manually.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of argparse (Command-Line Arguments) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\nimport argparse\np = argparse.ArgumentParser(description=\"Process a file\")\np.add_argument(\"input\")                                  # positional, required\np.add_argument(\"--format\", \"-f\", choices=[\"json\", \"csv\"], default=\"json\")\np.add_argument(\"--verbose\", \"-v\", action=\"store_true\")\nargs = p.parse_args()\nprint(args.input, args.format, args.verbose)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of argparse (Command-Line Arguments) — common patterns you'll see in production.\n# APPROACH  - Combine argparse (Command-Line Arguments) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nimport argparse\nimport sys\ndef positive_int(s: str) -> int:\n    n = int(s)\n    if n <= 0: raise argparse.ArgumentTypeError(\"must be > 0\")\n    return n\ndef build():\n    p = argparse.ArgumentParser(prog=\"mycli\")\n    p.add_argument(\"-v\", \"--verbose\", action=\"count\", default=0)   # -v, -vv, -vvv\n    sp = p.add_subparsers(dest=\"cmd\", required=True)\n    init = sp.add_parser(\"init\")\n    init.add_argument(\"--workers\", type=positive_int, default=4)\n    init.set_defaults(func=lambda a: print(f\"init w={a.workers}\"))\n    run = sp.add_parser(\"run\")\n    run.add_argument(\"path\")\n    run.set_defaults(func=lambda a: print(f\"run {a.path}\"))\n    return p\ndef main(argv: list[str] | None = None) -> int:\n    args = build().parse_args(argv)\n    args.func(args)\n    return 0\nif __name__ == \"__main__\":\n    raise SystemExit(main())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of argparse (Command-Line Arguments) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Quick reference (full senior tier in cli.js):\n#\n#   testable main(argv=None) -> int     -> argparse parses argv, returns int exit code\n#   typed config object                  -> dataclass adapter at the parser seam\n#   sysexits codes                        -> EX_USAGE=64, EX_DATAERR=65, EX_NOINPUT=66, EX_SOFTWARE=70\n#   \"if A then B is required\"             -> validate(args) post-parse + parser.error(msg)\n#   --feature / --no-feature              -> argparse.BooleanOptionalAction (3.9+)\n#   shared flags across subcommands       -> parents=[common_parser]\n#   ambiguous prefix (--ver vs --verify)  -> allow_abbrev=False\n#   environment fallback                  -> default=os.environ.get(\"APP_X\"); required if absent\n#\n# Decision rule:\n#   stdlib-only tool                      -> argparse\n#   typed surface, decorator style         -> Typer (see cli.js)\n#   plug-in registry / entry_points        -> Click (see cli.js)\n#   completions, REPL, complex UX          -> Click / Typer ship them; argparse needs argcomplete\n#\n# Anti-pattern: reading sys.argv directly inside main() and never returning an\n# exit code. Tests can't drive the function with a custom argv, and shells\n# can't tell success from failure. main(argv=None) -> int is the contract."
                  }
        ],
        tips: [
                  "nargs=\"+\" for at least one, \"*\" for zero or more, \"?\" for optional argument",
                  "action=\"store_true\" for boolean flags (no value needed)",
                  "required=True on add_argument for mandatory options",
                  "Custom type functions validate inputs (e.g., positive_int)"
        ],
        mistake: "Using sys.argv directly instead of argparse. argparse provides validation, help, and better defaults.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "typing-module-hints",
        fn: "typing Module (Type Hints)",
        desc: "Add type annotations for better IDE support and static checking.",
        category: "Type System",
        subtitle: "Optional runtime type hints for clarity and tooling",
        signature: "from typing import List, Dict, Optional, Callable, Union\ndef func(x: int) -> str: ...",
        descLong: "Type hints document expected types and enable IDE autocompletion and static checkers (mypy). Python enforces at runtime but hints help tooling and developers.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of typing Module (Type Hints) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\ndef greet(name: str) -> str:\n    return f\"hi {name}\"\ndef process(items: list[str]) -> dict[str, int]:\n    return {x: len(x) for x in items}\nage: int | None = None                       # 3.10+ X | Y syntax"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of typing Module (Type Hints) — common patterns you'll see in production.\n# APPROACH  - Combine typing Module (Type Hints) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\nfrom dataclasses import dataclass\nfrom typing import TypedDict, Literal\n# JSON shape (wire format).\nclass UserResponse(TypedDict):\n    id: int\n    name: str\n    role: Literal[\"admin\", \"user\", \"viewer\"]\n# Typed record (for behavior + validation).\n@dataclass(frozen=True, slots=True)\nclass Point:\n    x: float\n    y: float\n# Forward references — quote the class name OR use 'from __future__ import annotations'.\nclass Node:\n    def __init__(self, val: int, nxt: \"Node | None\" = None):\n        self.val, self.nxt = val, nxt"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of typing Module (Type Hints) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n# Quick reference (full senior tier in typing.js):\n#\n#   public function inputs               -> Sequence/Iterable/Mapping (covariant)\n#   public function outputs              -> concrete list/dict/set\n#   \"I accept anything\"                  -> object, NOT Any\n#   ID branding (UserId vs OrderId)      -> NewType\n#   structural interfaces                -> Protocol\n#   capability bound                     -> bound=Protocol (NOT constraints)\n#   decorator-preserve                   -> ParamSpec + TypeVar\n#   narrow on True AND False              -> TypeIs (3.13+); fall back to TypeGuard\n#   sortable / hashable / immutable record -> @dataclass(frozen=True, slots=True, kw_only=True)\n#\n# Decision rule:\n#   greenfield code                      -> 'from __future__ import annotations' + X | Y syntax + built-in generics\n#   gradual typing on legacy code         -> per-module mypy overrides; tighten one module at a time\n#   runtime validation                   -> Pydantic / msgspec / dataclasses-json; type hints alone don't enforce\n#   structural duck typing               -> Protocol (NOT ABC unless you need register())\n#   type-driven dispatch                 -> @functools.singledispatch\n#\n# Anti-pattern: Any everywhere \"to make mypy happy\". Any DISABLES all type\n# checking for that value — it doesn't make the bug go away, it hides it.\n# Either type it correctly, or use 'object' so callers must narrow before use."
                  }
        ],
        tips: [
                  "Type hints don't enforce at runtime — use mypy (static checker) for validation",
                  "Optional[T] is equivalent to Union[T, None]",
                  "TypeVar for generic functions — type must be consistent within function",
                  "IDE uses hints for autocompletion — huge productivity boost"
        ],
        mistake: "Thinking type hints enforce runtime constraints. They don't — they're for tooling. Use isinstance() checks for runtime validation.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
