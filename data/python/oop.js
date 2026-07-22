export const meta = {
  "title": "Object-Oriented Python",
  "domain": "python",
  "sheet": "oop",
  "icon": "🧩"
}

export const sections = [

  // ── Section 1: Classes & Instances ─────────────────────────────────────────
  {
    id: "classes",
    title: "Classes & Instances",
    entries: [
      {
        id: "class-def",
        fn: "class definition",
        desc: "Define a class with __init__ and methods.",
        category: "Classes",
        subtitle: "Blueprint for creating objects",
        signature: "class ClassName:\\n    def __init__(self, ...): ...",
        descLong: "A class is a blueprint for creating objects. __init__ is the constructor — it runs when an instance is created. self refers to the current instance. Instance variables are set on self; class variables are shared across all instances.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of class definition — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             one method uses it. No class vars, no dunders.\n#             whole shape is visible in five lines.\n#             constants; no obvious place for cross-instance state.\n#\nclass Dog:\n    def __init__(self, name):\n        self.name = name           # instance attribute set on this object\n    def bark(self):\n        return f\"{self.name} says Woof!\"\nrex = Dog(\"Rex\")\nrex.bark()    # \"Rex says Woof!\"\nrex.name      # \"Rex\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of class definition — common patterns you'll see in production.\n# APPROACH  - Combine class definition with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             shared constants, instance variables in __init__, and\n#             __repr__/__str__ so prints look right.\n#             review; debuggable thanks to __repr__; clearly separates\n#             shared from per-instance state.\n#             so tooling can't help; nothing prevents bad inputs.\n#\nclass Dog:\n    # Class variable — shared by all instances\n    species = \"Canis lupus familiaris\"\n    def __init__(self, name, age):\n        # Instance variables — unique per object\n        self.name = name\n        self.age = age\n    def bark(self):\n        return f\"{self.name} says Woof!\"\n    def __repr__(self):\n        return f\"Dog(name={self.name!r}, age={self.age})\"\n    def __str__(self):\n        return f\"{self.name}, age {self.age}\"\nrex = Dog(\"Rex\", 3)\nbuddy = Dog(\"Buddy\", 5)\nrex.bark()           # \"Rex says Woof!\"\nrex.name             # \"Rex\"\nDog.species          # \"Canis lupus familiaris\"\nrex.species          # \"Canis lupus familiaris\" (found on class)\nprint(rex)           # Rex, age 3  (uses __str__)\nrepr(rex)            # Dog(name='Rex', age=3)  (uses __repr__)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of class definition — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (__init__/__repr__/__eq__), add type hints for tooling,\n#             slots=True for memory, __post_init__ for invariants.\n#             can verify call sites; slots saves memory at scale;\n#             clearly signals \"this is a value object\" to readers.\n#             to step through in a debugger; overkill when the class\n#             carries heavy behavior or owns external resources.\n#\nfrom dataclasses import dataclass\n@dataclass(slots=True, frozen=True)\nclass Dog:\n    name: str\n    age: int\n    species: str = \"Canis lupus familiaris\"   # default at field level\n    def bark(self) -> str:\n        return f\"{self.name} says Woof!\"\n    def __post_init__(self) -> None:\n        # Runs after generated __init__ — perfect spot for invariants\n        if self.age < 0:\n            raise ValueError(f\"age must be >= 0, got {self.age}\")\nrex = Dog(\"Rex\", 3)\nrex.bark()                       # \"Rex says Woof!\"\nprint(rex)                       # Dog(name='Rex', age=3, species='Canis lupus familiaris')\n# rex.age = 4                    # FrozenInstanceError — frozen=True\nhash(rex)                        # works — frozen dataclasses are hashable\n#\n# Decision rule:\n#   pure data with 2+ fields, no heavy behavior     -> @dataclass\n#   need immutability + hashable value type         -> @dataclass(frozen=True)\n#   millions of instances, memory matters           -> @dataclass(slots=True)\n#   call sites confuse arg order (e.g. lat/lon)     -> @dataclass(kw_only=True)\n#   need runtime validation/coercion of inputs      -> Pydantic BaseModel\n#   ORM-mapped row                                  -> SQLAlchemy / Django model\n#   class owns external resources (sockets, locks)  -> hand-written class\n#\n# Anti-pattern: hand-rolling __init__/__repr__/__eq__ for every value class\n#   People write 30 lines of boilerplate to set self.x = x for five fields,\n#   then forget __eq__ so equality compares identity. @dataclass generates\n#   all three correctly from type hints. Reach for it whenever the class is\n#   mostly \"data + a couple of methods\"."
                  }
        ],
        tips: [
                  "Always define __repr__ — it makes debugging much easier",
                  "__str__ is for end users; __repr__ is for developers — when in doubt, define __repr__",
                  "Class variables are shared across all instances — mutating them affects every instance",
                  "Instance variables shadow class variables: rex.species = \"wolf\" only changes rex"
        ],
        mistake: "Using a mutable class variable like class_list = []. All instances share the same list. Define mutable defaults in __init__: self.items = [].",
        shorthand: {
          verbose: "class Dog:\n# Class variable — shared by all instances\nspecies = \"Canis lupus familiaris\"\ndef __init__(self, name, age):",
          concise: "repr(rex)            # Dog(name='Rex', age=3)  (uses __repr__)",
        },
      },
      {
        id: "class-instance-vars",
        fn: "Class vs instance variables",
        desc: "Class variables are shared across instances; instance variables belong to each object.",
        category: "Classes",
        subtitle: "Shared state vs per-object state — easy to confuse",
        signature: "class Foo: class_var = 0 | self.instance_var = val",
        descLong: "Class variables are defined at class level and shared by all instances. Instance variables are defined in __init__ with self and belong to each object. Assigning to an instance attribute with the same name as a class variable creates a new instance attribute that shadows the class variable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Class vs instance variables — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             shared; a value assigned in __init__ via self belongs to one\n#             instance only.\n#             nothing else competing for attention.\n#             real code; no advice on which to choose when.\n#\nclass Pet:\n    species = \"dog\"            # class variable — same for every Pet\n    def __init__(self, name):\n        self.name = name       # instance variable — unique per Pet\na = Pet(\"Rex\")\nb = Pet(\"Buddy\")\na.species, b.species           # (\"dog\", \"dog\")  — shared\na.name, b.name                 # (\"Rex\", \"Buddy\") — independent"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Class vs instance variables — common patterns you'll see in production.\n# APPROACH  - Combine Class vs instance variables with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             so the reader sees what assignment to self.x actually does.\n#             the shadowing trace makes lookup rules concrete.\n#             not thread-safe.\n#\nclass Counter:\n    count = 0                       # class variable — shared\n    def __init__(self, name):\n        Counter.count += 1          # mutate via class, not self\n        self.name = name            # instance variable — per object\n        self.id   = Counter.count\nc1 = Counter(\"first\")\nc2 = Counter(\"second\")\nCounter.count   # 2 — shared by all instances\nc1.count        # 2 — read falls through to class variable\nc2.count        # 2\n# Shadowing: assigning via self creates an INSTANCE variable that hides the class one\nc1.count = 99   # creates c1.count on the instance only\nCounter.count   # still 2 — class var untouched\nc2.count        # still 2 — c2 still reads the class var"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Class vs instance variables — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             correct per-instance fix, and note thread-safety for shared\n#             counters.\n#             aside saves real production incidents.\n#             the basic class/instance split.\n#\nimport threading\n# BUG — mutable class variable shared across all instances:\nclass Bad:\n    items = []                      # one list, shared by every Bad()\n    def add(self, item):\n        self.items.append(item)     # mutates the class-level list\nb1, b2 = Bad(), Bad()\nb1.add(1)\nb2.items        # [1] — surprise! b1 and b2 share state\n# FIX — initialize mutable state in __init__ so each instance gets its own:\nclass Good:\n    def __init__(self):\n        self.items = []             # per-instance list\ng1, g2 = Good(), Good()\ng1.items.append(1)\ng2.items        # [] — independent\n# Thread-safety: the Counter pattern in the junior tier races under threads.\n# Use self.__class__ for subclass-correctness, and a Lock for atomicity:\nclass SafeCounter:\n    _count = 0\n    _lock = threading.Lock()\n    def __init__(self):\n        with SafeCounter._lock:\n            SafeCounter._count += 1\n            self.id = SafeCounter._count\n#\n# Decision rule:\n#   immutable constant shared by all instances      -> class variable\n#   per-instance mutable state (lists, dicts)       -> set on self in __init__\n#   counter / registry shared across instances      -> class var + Lock\n#   subclasses should each get their own counter    -> self.__class__.x\n#   value depends on subclass (e.g. default config) -> @classmethod factory\n#   shared cache that may grow                      -> module-level dict\n#   per-process singleton resource                  -> module global, not class var\n#\n# Anti-pattern: mutable class variable used as a per-instance default\n#   Writing class Foo: items = [] feels harmless until two instances share\n#   the same list and one append() leaks into the other. Initialize mutable\n#   state on self inside __init__, and reserve class variables for true\n#   constants and explicitly-shared registries."
                  }
        ],
        tips: [
                  "Class variables are ideal for constants and counters shared across all instances",
                  "Never use a mutable class variable (list, dict) as a default — it is shared by all instances",
                  "Modify class variables via `ClassName.var = val`, not `self.var = val` — assignment to self creates an instance variable",
                  "`self.__class__.count` is safer than `ClassName.count` in subclasses — uses the actual class"
        ],
        mistake: "Using a mutable class variable as a per-instance default: `class Foo: items = []`. Every instance shares the same list — appending in one instance affects all others. Initialize in __init__ instead.",
        shorthand: {
          verbose: "from collections import Counter, defaultdict, deque, namedtuple\nclass Counter:\ncount = 0              # class variable — shared\ndef __init__(self, name):",
          concise: "self.items = []          # per-instance list",
        },
      },
      {
        id: "inheritance",
        fn: "Inheritance",
        desc: "Create subclasses that extend parent classes.",
        category: "Classes",
        subtitle: "Extend and specialize existing classes",
        signature: "class Child(Parent):\\n    def __init__(self): super().__init__()",
        descLong: "Inheritance lets a subclass reuse and extend a parent class. Call super().__init__() to initialize the parent. Override methods to customize behavior. Python supports multiple inheritance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Inheritance — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             __init__ via super() and adds nothing else.\n#             concepts in the way.\n#             isn't obvious; no abstract methods, no polymorphism.\n#\nclass Animal:\n    def __init__(self, name):\n        self.name = name\nclass Dog(Animal):                 # Dog \"is-a\" Animal\n    pass                           # inherits __init__ unchanged\nrex = Dog(\"Rex\")\nrex.name                  # \"Rex\" — inherited from Animal\nisinstance(rex, Dog)      # True\nisinstance(rex, Animal)   # True — subclasses count"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Inheritance — common patterns you'll see in production.\n# APPROACH  - Combine Inheritance with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             extend __init__ via super() and add their own attributes.\n#             Iterate a heterogenous list to demonstrate polymorphism.\n#             add an attribute, call super(); the polymorphism loop is the\n#             whole reason inheritance exists.\n#             buggy subclass would only fail at call time.\n#\nclass Animal:\n    def __init__(self, name):\n        self.name = name\n    def speak(self):\n        raise NotImplementedError(\"subclass must implement speak()\")\n    def __str__(self):\n        return f\"{type(self).__name__}({self.name!r})\"\nclass Dog(Animal):\n    def speak(self):\n        return f\"{self.name} says Woof!\"\nclass Cat(Animal):\n    def __init__(self, name, indoor=True):\n        super().__init__(name)              # call parent __init__\n        self.indoor = indoor\n    def speak(self):\n        return f\"{self.name} says Meow!\"\n# Polymorphism — each call dispatches to the right speak()\nanimals = [Dog(\"Rex\"), Cat(\"Whiskers\"), Dog(\"Buddy\")]\nfor a in animals:\n    print(a.speak())"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Inheritance — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             everything, and let the abstract base reject incomplete\n#             subclasses at instantiation time.\n#             time, not at the first runtime call; tooling sees the\n#             contract; the type signature documents intent.\n#             two-method hierarchy; ABC objects can't be mixed cleanly\n#             with Protocol-only typing.\n#\nfrom abc import ABC, abstractmethod\nfrom typing import Iterable\nclass Animal(ABC):\n    def __init__(self, name: str) -> None:\n        self.name = name\n    @abstractmethod\n    def speak(self) -> str: ...\n    def __repr__(self) -> str:\n        return f\"{type(self).__name__}({self.name!r})\"\nclass Dog(Animal):\n    def speak(self) -> str:\n        return f\"{self.name} says Woof!\"\nclass Cat(Animal):\n    def speak(self) -> str:\n        return f\"{self.name} says Meow!\"\n# Animal()        # TypeError — can't instantiate abstract class\n# class Mute(Animal): pass\n# Mute(\"x\")       # TypeError — Mute didn't implement speak()\ndef chorus(animals: Iterable[Animal]) -> list[str]:\n    return [a.speak() for a in animals]\nchorus([Dog(\"Rex\"), Cat(\"Whiskers\")])\n# ['Rex says Woof!', 'Whiskers says Meow!']\n#\n# Decision rule:\n#   share implementation across types                -> regular inheritance\n#   need to ENFORCE subclass implements method       -> abc.ABC + @abstractmethod\n#   only need a structural shape for type checking   -> typing.Protocol\n#   compose orthogonal behaviors (logging, JSON)     -> mixins, not parent\n#   \"is-a\" relationship feels forced                 -> composition, not inheritance\n#   third-party class needs extension                -> wrap or subclass thinly\n#   cross-cutting concern (auth, logging)            -> decorator, not subclass\n#\n# Anti-pattern: deep inheritance hierarchies for code reuse\n#   When Dog -> Mammal -> Animal -> LivingThing exists only so each level\n#   contributes one helper, the hierarchy becomes a maze that subclasses\n#   can't override safely. Prefer composition: hold a helper as an\n#   attribute, or pull the shared logic into a small mixin."
                  }
        ],
        tips: [
                  "Always call super().__init__() in child __init__ to initialize parent state",
                  "super() without arguments works in Python 3 — prefer it over super(ClassName, self)",
                  "Use ABC (abstract base classes) to enforce method implementation in subclasses",
                  "isinstance(obj, ParentClass) is True for instances of subclasses — use this for type checks"
        ],
        mistake: "Forgetting super().__init__() in a subclass __init__. The parent's initialization code never runs, leaving the object in a broken state.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "super",
        fn: "super()",
        desc: "Delegate method calls to the parent class.",
        category: "Classes",
        subtitle: "Call parent methods without hardcoding the class name",
        signature: "super().__init__() | super().method()",
        descLong: "super() returns a proxy that delegates method calls to the parent class in the MRO (Method Resolution Order). Always use super() instead of ParentClass.method(self) — it handles multiple inheritance correctly and does not hardcode the class name.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of super() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             state. Nothing else.\n#             call; this example burns it into muscle memory.\n#             single-inheritance only, so MRO subtleties are invisible.\n#\nclass Animal:\n    def __init__(self, name):\n        self.name = name\nclass Dog(Animal):\n    def __init__(self, name, breed):\n        super().__init__(name)     # initialize parent state first\n        self.breed = breed\nrex = Dog(\"Rex\", \"Labrador\")\nrex.name, rex.breed     # (\"Rex\", \"Labrador\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of super() — common patterns you'll see in production.\n# APPROACH  - Combine super() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             Type the methods, return-augment the parent's value, and\n#             show the chain through repr() output.\n#             constructor; teaches the \"extend, don't replace\" pattern.\n#             reason super() exists, and that needs MI to demonstrate.\n#\nclass Animal:\n    def __init__(self, name: str) -> None:\n        self.name = name\n    def speak(self) -> str:\n        return f\"{self.name} makes a sound\"\nclass Dog(Animal):\n    def __init__(self, name: str, breed: str) -> None:\n        super().__init__(name)               # delegate to Animal.__init__\n        self.breed = breed\n    def speak(self) -> str:\n        base = super().speak()               # call parent's version first\n        return f\"{base}; Woof!\"\nd = Dog(\"Rex\", \"Labrador\")\nd.speak()    # \"Rex makes a sound; Woof!\""
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of super() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             super().greet(), and Python's MRO threads them in C3 order.\n#             This is the whole reason super() exists instead of\n#             ParentClass.method(self).\n#             diamond hierarchies; lets mixins compose without naming\n#             each other.\n#             missed super() breaks the chain silently; reading the MRO\n#             takes practice.\n#\nclass A:\n    def greet(self):\n        return \"A\"\nclass B(A):\n    def greet(self):\n        return \"B -> \" + super().greet()\nclass C(A):\n    def greet(self):\n        return \"C -> \" + super().greet()\nclass D(B, C):\n    def greet(self):\n        return \"D -> \" + super().greet()\nD().greet()        # \"D -> B -> C -> A\"\nprint(D.__mro__)   # (D, B, C, A, object)\n# Hardcoding A.greet(self) inside B would skip C entirely — super() does not.\n#\n# Decision rule:\n#   call parent __init__ from subclass               -> super().__init__(...)\n#   extend a parent method with extra behavior       -> super().method() + own code\n#   skip a level deliberately (rare, smelly)         -> Grandparent.method(self)\n#   multiple inheritance / mixin chain               -> super() everywhere, **kwargs pass-through\n#   need to call sibling explicitly (almost never)   -> reconsider design\n#   Python 2 compat / ancient code                   -> super(ClassName, self)\n#   modern Python 3 single or multi inheritance      -> bare super()\n#\n# Anti-pattern: writing ParentClass.__init__(self, ...) instead of super()\n#   Hardcoding the parent name skips C3 linearization, so under multiple\n#   inheritance one parent's __init__ silently never runs. Worse, renaming\n#   the parent breaks every child. Always use super() — it threads the MRO\n#   correctly even when callers rearrange bases."
                  }
        ],
        tips: [
                  "super().__init__() without arguments works in Python 3 — prefer over super(ClassName, self)",
                  "super() follows the MRO — in multiple inheritance it calls the next class in line, not just the direct parent",
                  "Always call super().__init__() first in __init__ — parent initializes state that subclass may depend on",
                  "super() works correctly even in diamond inheritance scenarios — hardcoding ParentClass.method() does not"
        ],
        mistake: "Using ParentClass.__init__(self, ...) instead of super().__init__(...). This breaks in multiple inheritance because it bypasses MRO and calls only one parent directly.",
        shorthand: {
          verbose: "class Animal:\ndef __init__(self, name: str):\nself.name = name\ndef speak(self) -> str:",
          concise: "print(D.__mro__)",
        },
      },
      {
        id: "mro",
        fn: "Multiple inheritance / MRO",
        desc: "Inherit from multiple parents — Method Resolution Order determines lookup.",
        category: "Classes",
        subtitle: "C3 linearization determines which parent method gets called",
        signature: "class C(A, B): ... | C.__mro__ | isinstance(c, A)",
        descLong: "Python supports multiple inheritance. When a method is called, Python uses the C3 linearization algorithm (MRO) to determine which class to look in first. __mro__ shows the lookup order. Mixins are small classes designed specifically for multiple inheritance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Multiple inheritance / MRO — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             No overlapping methods, no diamond — just \"pick up two\n#             behaviors at once\".\n#             confusing form.\n#             never matters.\n#\nclass Flyable:\n    def fly(self): return \"flying\"\nclass Swimmable:\n    def swim(self): return \"swimming\"\nclass Duck(Flyable, Swimmable):\n    def quack(self): return \"quack\"\nd = Duck()\nd.fly()       # \"flying\"\nd.swim()      # \"swimming\"\nd.quack()     # \"quack\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Multiple inheritance / MRO — common patterns you'll see in production.\n# APPROACH  - Combine Multiple inheritance / MRO with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             both override A, D inherits from both, super() routes.\n#             Inspect __mro__ to make the lookup order concrete.\n#             call, MRO stops being magical.\n#             cooperative super() story (next tier) is what actually\n#             pays off.\n#\nclass A:\n    def hello(self): return \"A\"\nclass B(A):\n    def hello(self): return \"B -> \" + super().hello()\nclass C(A):\n    def hello(self): return \"C -> \" + super().hello()\nclass D(B, C):                 # left-to-right, depth-first w/ C3\n    def hello(self): return \"D -> \" + super().hello()\nD().hello()        # \"D -> B -> C -> A\"\nprint(D.__mro__)\n# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Multiple inheritance / MRO — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             super().__init__(**kwargs) so any composition works. The\n#             final class only has to list the right ingredients in the\n#             right order.\n#             compose like Lego; works correctly even in diamond shapes.\n#             — one mixin that forgets breaks the entire hierarchy\n#             silently; harder to debug than single inheritance.\n#\nimport json\nclass JSONMixin:\n    def to_json(self) -> str:\n        return json.dumps(self.__dict__, default=str)\nclass LogMixin:\n    def log(self, msg: str) -> None:\n        print(f\"[{type(self).__name__}] {msg}\")\nclass User(JSONMixin, LogMixin):\n    def __init__(self, name: str, **kwargs):\n        super().__init__(**kwargs)        # cooperate with any further mixins\n        self.name = name\nu = User(\"Alice\")\nu.to_json()        # '{\"name\": \"Alice\"}'\nu.log(\"created\")   # [User] created\nprint(User.__mro__)\n# (<class 'User'>, <class 'JSONMixin'>, <class 'LogMixin'>, <class 'object'>)\n#\n# Decision rule:\n#   debugging unexpected method dispatch             -> print(Cls.__mro__)\n#   composing orthogonal behaviors                   -> mixins listed leftmost\n#   diamond shape with shared base                   -> cooperative super() everywhere\n#   want to enforce ordering for invariants          -> check Cls.__mro__ in tests\n#   Python raises \"MRO conflict\" at class creation   -> reorder bases (specific first)\n#   need single inheritance for clarity              -> avoid MI, prefer composition\n#   one base is the \"real\" parent, others are mixins -> mixins first, base last\n#\n# Anti-pattern: relying on left-to-right depth-first ordering folklore\n#   Python uses C3 linearization, not naive DFS. People assume class D(B, C)\n#   means \"all of B before any of C\", but C3 reorders to keep monotonic\n#   precedence. Always verify with __mro__ rather than guessing. If MRO\n#   gets confusing, that's a signal to flatten the hierarchy."
                  }
        ],
        tips: [
                  "Left-to-right, depth-first: `class D(B, C)` checks B before C",
                  "`ClassName.__mro__` shows the exact lookup order — check it when behavior is unexpected",
                  "Mixins should not have __init__ and should not inherit from anything except object",
                  "super() in multiple inheritance follows the MRO — this is why you must always use super(), not hardcoded parent calls"
        ],
        mistake: "Creating a class that inherits from two classes that both define __init__ without calling super(). The second parent's __init__ never runs. Use cooperative multiple inheritance with super() in every class in the chain.",
        shorthand: {
          verbose: "import json\nclass Flyable:\ndef fly(self): return \"flying\"\nclass Swimmable:",
          concise: "u.log(\"created\")   # [User] created",
        },
      },
      {
        id: "mixin",
        fn: "Mixin pattern",
        desc: "Small reusable classes that add behavior via multiple inheritance.",
        category: "Classes",
        subtitle: "Compose behavior without deep inheritance hierarchies",
        signature: "class MyClass(FeatureMixin, AnotherMixin, Base): ...",
        descLong: "A Mixin is a class designed to be mixed in via multiple inheritance. Mixins add specific behavior without being a standalone class. They typically have no __init__, inherit only from object, and do not depend on subclass state beyond what they define themselves.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Mixin pattern — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             a regular class to add behavior.\n#             to be added, not instantiated alone.\n#             that needs at least two.\n#\nclass GreetMixin:\n    def greet(self):                     # no __init__, no parent\n        return f\"hello, I am {self.name}\"\nclass User(GreetMixin):\n    def __init__(self, name):\n        self.name = name\nUser(\"Alice\").greet()    # \"hello, I am Alice\""
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Mixin pattern — common patterns you'll see in production.\n# APPROACH  - Combine Mixin pattern with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             validate) into a User. Each mixin reads attributes off\n#             self.__dict__ but defines no state of its own.\n#             added by listing one more name in the bases.\n#             instantiation order matters; nothing yet documents that\n#             contract for readers.\n#\nimport json\nfrom datetime import datetime\nclass JSONMixin:\n    def to_json(self) -> str:\n        return json.dumps(self.__dict__, default=str)\nclass TimestampMixin:\n    def touch(self) -> None:\n        self.updated_at = datetime.now()\nclass ValidateMixin:\n    def validate(self) -> bool:\n        for field, value in self.__dict__.items():\n            if value is None:\n                raise ValueError(f\"{field} cannot be None\")\n        return True\nclass User(JSONMixin, TimestampMixin, ValidateMixin):\n    def __init__(self, name: str, email: str):\n        self.name  = name\n        self.email = email\nu = User(\"Alice\", \"alice@example.com\")\nu.to_json()       # '{\"name\": \"Alice\", \"email\": \"alice@example.com\"}'\nu.validate()      # True\nu.touch()         # sets updated_at"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Mixin pattern — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             attributes), keep mixins __init__-free, and pin ordering:\n#             feature mixins before the base, base last so it absorbs\n#             super() at the end of the chain.\n#             host class; the chain composes cleanly because every mixin\n#             cooperates via super(); ordering is no longer folklore.\n#             based contracts are checked by mypy/pyright, not at runtime.\n#\nfrom typing import Protocol, runtime_checkable\n@runtime_checkable\nclass HasDict(Protocol):\n    __dict__: dict\nclass CacheMixin:\n    \"\"\"Adds a one-shot cache. Requires a __dict__-bearing host.\"\"\"\n    def cached(self: HasDict, key: str, fn):\n        if key not in self.__dict__:\n            self.__dict__[key] = fn()\n        return self.__dict__[key]\nclass LogMixin:\n    def log(self, msg: str) -> None:\n        print(f\"[{type(self).__name__}] {msg}\")\nclass Base:\n    def __init__(self, **kwargs):\n        # absorb leftover kwargs at the end of the MRO chain\n        if kwargs:\n            raise TypeError(f\"unexpected kwargs: {list(kwargs)}\")\nclass Service(LogMixin, CacheMixin, Base):\n    # MRO: Service -> LogMixin -> CacheMixin -> Base -> object\n    def __init__(self, name: str, **kwargs):\n        super().__init__(**kwargs)\n        self.name = name\ns = Service(\"billing\")\ns.log(\"starting\")               # [Service] starting\ns.cached(\"answer\", lambda: 42)  # 42 (computed once, then cached)\n#\n# Decision rule:\n#   stateless cross-cutting behavior (logging, JSON) -> mixin\n#   need shared state across users of the behavior   -> regular base class\n#   only one host class will use the behavior        -> module function\n#   behavior must be enabled per-instance            -> composition (attribute)\n#   contract is \"implements method X\"                -> Protocol, not mixin\n#   need to enforce overrides                        -> ABC, not mixin\n#   behavior depends on host fields                  -> document via Protocol type\n#\n# Anti-pattern: giving mixins their own __init__\n#   Mixins with __init__ break cooperative super() chains: depending on\n#   MRO, the mixin's __init__ may swallow kwargs, skip the real base, or\n#   never run at all. Keep mixins __init__-free; let the final class own\n#   construction and let mixins read attributes that already exist on self."
                  }
        ],
        tips: [
                  "Mixins should have no __init__ — rely on the final class to initialize all state",
                  "Keep mixins single-purpose — one concern per mixin (LogMixin, CacheMixin, etc.)",
                  "Name mixins with \"Mixin\" suffix — communicates intent clearly to other developers",
                  "List mixins before the base class — methods resolve left to right in MRO"
        ],
        mistake: "Creating a Mixin that calls super().__init__(). If mixed into a class with a different parent, super() may route to an unexpected class. Mixins should not have __init__.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "metaclass",
        fn: "Metaclasses",
        desc: "Classes that control how other classes are created.",
        category: "Classes",
        subtitle: "type is the default metaclass — custom metaclasses modify class creation",
        signature: "class Meta(type): def __new__(mcs, name, bases, ns): ...",
        descLong: "A metaclass is the class of a class — it controls how classes are created. type is the default metaclass. Custom metaclasses intercept class creation to add validation, auto-register subclasses, or modify class attributes. __init_subclass__ is the modern, simpler alternative for most use cases.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Metaclasses — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             instance of type. type can also be called to build a class\n#             dynamically, like a factory.\n#             writing a custom metaclass.\n#             whole point of metaclasses, which the next tier shows.\n#\ntype(int)         # <class 'type'>     — int is an instance of type\ntype(list)        # <class 'type'>\n# Build a class dynamically (rare but illuminating):\nMyClass = type('MyClass', (object,), {\n    'x': 1,\n    'greet': lambda self: 'hello',\n})\nMyClass().greet()   # 'hello'"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Metaclasses — common patterns you'll see in production.\n# APPROACH  - Combine Metaclasses with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             class-creation time (here: every subclass needs a docstring).\n#             instance is built — a forgotten contract is caught early.\n#             hierarchy collide. For most cases __init_subclass__ (next\n#             tier) is simpler and preferred.\n#\nclass RequireDocstring(type):\n    def __new__(mcs, name, bases, namespace):\n        if bases and not namespace.get('__doc__'):\n            raise TypeError(f\"{name} must have a docstring\")\n        return super().__new__(mcs, name, bases, namespace)\nclass Documented(metaclass=RequireDocstring):\n    \"\"\"root class is OK because bases is empty\"\"\"\nclass Good(Documented):\n    \"\"\"has a docstring — accepted\"\"\"\n# class Bad(Documented):     # raises TypeError at class-load time\n#     pass"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Metaclasses — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for metaclasses (auto-registration, validation). When a\n#             true metaclass is needed, keep it tiny and document why.\n#             reads like a normal method, and supports keyword args at\n#             class definition; same plugin pattern, far less surface.\n#             super() call; debugging registration order requires\n#             walking the import order of modules.\n#\n# Plugin registry without a metaclass:\nclass Plugin:\n    registry: dict[str, type[\"Plugin\"]] = {}\n    def __init_subclass__(cls, *, name: str | None = None, **kwargs):\n        super().__init_subclass__(**kwargs)        # cooperate\n        Plugin.registry[name or cls.__name__] = cls\nclass CSVPlugin(Plugin, name=\"csv\"):\n    def process(self): return \"csv\"\nclass JSONPlugin(Plugin, name=\"json\"):\n    def process(self): return \"json\"\nPlugin.registry\n# {'csv': <class 'CSVPlugin'>, 'json': <class 'JSONPlugin'>}\n# When you DO need a real metaclass, keep it small and named for intent.\n# The Django ORM, SQLAlchemy declarative, and ABCMeta are real-world examples.\n#\n# Decision rule:\n#   auto-register subclasses in a registry            -> __init_subclass__\n#   validate subclass shape at class-creation time    -> __init_subclass__\n#   inject attrs/methods based on class body          -> class decorator\n#   enforce abstract methods                          -> abc.ABC (already a metaclass)\n#   class needs a different metaclass than its bases  -> avoid; redesign\n#   building an ORM / DSL with magic class bodies     -> custom metaclass\n#   \"I read about metaclasses and want to try them\"   -> don't; use simpler tool\n#\n# Anti-pattern: reaching for a metaclass when __init_subclass__ would do\n#   Custom metaclasses don't compose: any subclass that uses a different\n#   metaclass triggers a \"metaclass conflict\" at class creation, and users\n#   of your library suddenly can't combine your base with abc.ABC.\n#   __init_subclass__ achieves 90% of the use cases (registries, validation)\n#   without the conflict, and reads like a normal classmethod."
                  }
        ],
        tips: [
                  "Most metaclass use cases are solved more simply with __init_subclass__ or class decorators",
                  "__init_subclass__ is called on the base class whenever a subclass is created — no metaclass needed",
                  "Metaclasses compose poorly — two metaclasses in the same hierarchy cause a conflict",
                  "Frameworks use metaclasses (Django ORM, SQLAlchemy) — understanding them helps when debugging those"
        ],
        mistake: "Reaching for a metaclass when __init_subclass__ would work. __init_subclass__ handles 90% of metaclass use cases with far less complexity.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "dunder",
        fn: "Dunder methods",
        desc: "Magic methods for operator overloading and protocols.",
        category: "Classes",
        subtitle: "Implement Python protocols with __dunder__ methods",
        signature: "__len__ | __getitem__ | __add__ | __eq__ | __iter__",
        descLong: "Dunder (double-underscore) methods let your objects integrate with Python's built-in syntax and functions. Implement __len__ for len(), __add__ for +, __iter__ for for loops, and more.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Dunder methods — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             REPL show something useful for your object.\n#             debuggable repr immediately.\n#             so the protocol nature of dunder methods isn't visible.\n#\nclass Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f\"Point({self.x}, {self.y})\"\np = Point(1, 2)\np             # Point(1, 2)        — REPL uses __repr__\nprint(p)      # Point(1, 2)        — print falls back to __repr__\n[p, p]        # [Point(1, 2), Point(1, 2)]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Dunder methods — common patterns you'll see in production.\n# APPROACH  - Combine Dunder methods with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             type: arithmetic (+, *, scalar-on-left), equality, len(),\n#             abs(), iteration / unpacking.\n#             object plugs into existing syntax instead of inventing new.\n#             sets or as a dict key (silently). The senior tier closes\n#             that gap.\n#\nclass Vector:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n    def __repr__(self):\n        return f\"Vector({self.x}, {self.y})\"\n    def __add__(self, other):\n        return Vector(self.x + other.x, self.y + other.y)\n    def __mul__(self, scalar):\n        return Vector(self.x * scalar, self.y * scalar)\n    def __rmul__(self, scalar):           # scalar * vector\n        return self.__mul__(scalar)\n    def __eq__(self, other):\n        return (self.x, self.y) == (other.x, other.y)\n    def __len__(self):\n        return 2\n    def __abs__(self):\n        return (self.x**2 + self.y**2) ** 0.5\n    def __iter__(self):                   # makes it unpackable\n        yield self.x\n        yield self.y\nv1, v2 = Vector(1, 2), Vector(3, 4)\nv1 + v2           # Vector(4, 6)\nv1 * 3            # Vector(3, 6)\n3 * v1            # Vector(3, 6)  via __rmul__\nabs(v1)           # 2.2360679...\nx, y = v1         # unpacking via __iter__"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Dunder methods — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             functools.total_ordering for comparisons, and slot the\n#             value type for memory. Treat the object as a hashable,\n#             ordered, iterable value.\n#             (small import-time cost); slots forbids new attrs and\n#             needs care with inheritance.\n#\nfrom functools import total_ordering\n@total_ordering\nclass Vec2:\n    __slots__ = (\"x\", \"y\")\n    def __init__(self, x: float, y: float):\n        self.x, self.y = x, y\n    def __repr__(self) -> str:\n        return f\"Vec2({self.x}, {self.y})\"\n    def __iter__(self):\n        yield from (self.x, self.y)\n    def __abs__(self) -> float:\n        return (self.x ** 2 + self.y ** 2) ** 0.5\n    # __eq__ + __hash__ go together, both based on the same tuple of fields:\n    def _key(self):\n        return (self.x, self.y)\n    def __eq__(self, other) -> bool:\n        return isinstance(other, Vec2) and self._key() == other._key()\n    def __hash__(self) -> int:\n        return hash(self._key())\n    # @total_ordering generates !=, <=, >, >= from __eq__ + __lt__:\n    def __lt__(self, other: \"Vec2\") -> bool:\n        return abs(self) < abs(other)\nvs = {Vec2(1, 2), Vec2(1, 2), Vec2(3, 4)}   # works — Vec2 is hashable\nsorted([Vec2(3, 4), Vec2(0, 1)])             # ordered by magnitude\n#\n# Decision rule:\n#   make print()/REPL useful                          -> __repr__\n#   value semantics (sets, dict keys, ==)             -> __eq__ + __hash__ together\n#   sortable type                                     -> @total_ordering + __lt__\n#   container-like (\"len(x)\", \"x[i]\", \"for ...\")     -> __len__, __getitem__, __iter__\n#   resource owns cleanup (with x: ...)              -> __enter__ + __exit__\n#   numeric-like (+, *, scalar*x)                    -> __add__, __mul__, __rmul__\n#   format-spec aware (f\"{x:usd}\")                   -> __format__\n#   mostly data fields, no special protocol           -> @dataclass — gets __repr__/__eq__ free\n#\n# Anti-pattern: defining __eq__ without __hash__\n#   When you override __eq__, Python silently sets __hash__ = None, making\n#   instances unhashable — sets and dicts now raise TypeError. Always pair:\n#   compute hash from the same key tuple as __eq__, or use @dataclass(frozen=True)\n#   which generates both correctly."
                  }
        ],
        tips: [
                  "Define __repr__ first — it is used in debugging and logging automatically",
                  "__eq__ should also define __hash__ if objects will be used in sets/dicts",
                  "__enter__ and __exit__ make objects work as context managers (with statement)",
                  "If you define __eq__, Python sets __hash__ to None — define it explicitly if needed"
        ],
        mistake: "Defining __eq__ without __hash__. Python sets __hash__ = None, making instances unhashable (cannot be put in sets or used as dict keys).",
        shorthand: {
          verbose: "class Vector:\ndef __init__(self, x, y):\nself.x, self.y = x, y\ndef __repr__(self):",
          concise: "x, y = v1         # unpacking via __iter__",
        },
      },
      {
        id: "repr-str",
        fn: "__repr__ vs __str__",
        desc: "Control how objects are displayed in the shell, print(), and format strings.",
        category: "Classes",
        subtitle: "__repr__ for developers, __str__ for end users",
        signature: "def __repr__(self) -> str: | def __str__(self) -> str:",
        descLong: "__repr__ is the developer representation — shown in the REPL and used by repr(). It should ideally be a string that could recreate the object. __str__ is the user-facing string — used by print() and str(). If only __repr__ is defined, it is used as a fallback for __str__.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of __repr__ vs __str__ — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             fallback) print(), so one method covers most cases.\n#             output everywhere — REPL, logs, exception messages.\n#             user-friendly format.\n#\nclass Simple:\n    def __init__(self, label):\n        self.label = label\n    def __repr__(self):\n        return f\"Simple({self.label!r})\"\ns = Simple(\"hi\")\ns             # Simple('hi')   — REPL uses __repr__\nprint(s)      # Simple('hi')   — falls back to __repr__\n[s]           # [Simple('hi')] — containers use __repr__"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of __repr__ vs __str__ — common patterns you'll see in production.\n# APPROACH  - Combine __repr__ vs __str__ with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             __str__ for end users (clean, readable). Show how Python\n#             picks between them.\n#             intent (debug vs display) right in the class.\n#             — that needs __format__, shown next tier.\n#\nclass Point:\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n    def __repr__(self):\n        # developer-facing — should look like a constructor call\n        return f\"Point({self.x!r}, {self.y!r})\"\n    def __str__(self):\n        # user-facing — concise, no class name\n        return f\"({self.x}, {self.y})\"\np = Point(3, 4)\nrepr(p)     # \"Point(3, 4)\"  — __repr__\nstr(p)      # \"(3, 4)\"       — __str__\nprint(p)    # (3, 4)         — __str__\nf\"{p}\"      # \"(3, 4)\"       — __str__\nf\"{p!r}\"    # \"Point(3, 4)\"  — !r forces __repr__\n[p]         # [Point(3, 4)]  — containers always use __repr__"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of __repr__ vs __str__ — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             specs, and use reprlib.recursive_repr() to keep __repr__\n#             safe against cycles.\n#             (f\"{price:usd}\"); cycle-safe repr prevents accidental\n#             infinite recursion in logs.\n#             must respect or reject the spec); only worth the cost on\n#             types that flow into many format strings.\n#\nimport reprlib\nclass Money:\n    def __init__(self, amount: float, currency: str = \"USD\"):\n        self.amount, self.currency = amount, currency\n    def __repr__(self) -> str:\n        return f\"Money({self.amount!r}, {self.currency!r})\"\n    def __str__(self) -> str:\n        return f\"{self.amount:.2f} {self.currency}\"\n    def __format__(self, spec: str) -> str:\n        if spec == \"\":      return str(self)\n        if spec == \"usd\":   return f\"${self.amount:,.2f}\"\n        if spec == \"long\":  return f\"{self.amount:,.2f} {self.currency}\"\n        # delegate numeric specs (\".4f\", \",\", etc.) to the underlying float\n        return format(self.amount, spec)\nm = Money(1234.5)\nf\"{m}\"          # \"1234.50 USD\"\nf\"{m:usd}\"      # \"$1,234.50\"\nf\"{m:long}\"     # \"1,234.50 USD\"\nf\"{m:,.0f}\"     # \"1,234\"   — float format spec passed through\nclass Tree:\n    def __init__(self): self.children = [self]   # cycle on purpose\n    @reprlib.recursive_repr()\n    def __repr__(self):\n        return f\"Tree({self.children!r})\"\nrepr(Tree())    # 'Tree([...])' — recursion guarded by reprlib\n#\n# Decision rule:\n#   only have time for one method                    -> __repr__ (covers print() too)\n#   debugging output / logs / error messages         -> __repr__ — round-trippable\n#   end-user display (print, str(), CLI output)      -> __str__\n#   participate in f-string format specs             -> __format__\n#   container with cycles (graphs, trees)            -> @reprlib.recursive_repr()\n#   value type with many fields                      -> @dataclass — generates __repr__\n#   force developer view inside an f-string          -> f\"{obj!r}\"\n#\n# Anti-pattern: defining only __str__ for \"pretty\" output\n#   Containers (lists, dicts, sets) and the REPL call __repr__, not __str__.\n#   So your nicely formatted __str__ never shows up in [obj] or\n#   {\"key\": obj}, and exception tracebacks display the unhelpful default\n#   <Class object at 0x...>. Always define __repr__ first; add __str__ only\n#   when end-user output differs from the developer view."
                  }
        ],
        tips: [
                  "Always define __repr__ — it is used in the REPL, logging, and debugging",
                  "__repr__ should produce a string that looks like a constructor call when possible: `ClassName(arg1, arg2)`",
                  "If you only have time to define one, define __repr__ — it serves as the fallback for __str__",
                  "Use !r in f-strings to force __repr__: `f\"{obj!r}\"` — useful in __repr__ to quote string fields"
        ],
        mistake: "Only defining __str__ and forgetting __repr__. When objects appear in lists, dicts, or the REPL, Python uses __repr__ — you will see the unhelpful default <__main__.ClassName object at 0x...>.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 2: Properties & Descriptors ─────────────────────────────────────────
  {
    id: "properties",
    title: "Properties & Descriptors",
    entries: [
      {
        id: "property",
        fn: "@property",
        desc: "Managed attributes with getters and setters.",
        category: "Properties",
        subtitle: "Control attribute access with computed properties",
        signature: "@property def name(self): return self._name",
        descLong: "@property creates a method that is accessed like an attribute. Use @name.setter to validate or transform on assignment. This is Pythonic encapsulation — start with plain attributes and add properties only when you need logic.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @property — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             attribute and computes a value on access. No setter.\n#             validation/deleter/caching machinery.\n#             (controlling assignment) isn't visible yet.\n#\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n    @property\n    def area(self):                    # accessed as c.area, not c.area()\n        return 3.14159 * self.radius ** 2\nc = Circle(5)\nc.area      # 78.5398...   — looks like an attribute, runs the method"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @property — common patterns you'll see in production.\n# APPROACH  - Combine @property with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             \"primary\" property with a derived one whose setter writes\n#             back through the primary.\n#             keep one source of truth (_celsius), expose multiple\n#             views without storing duplicates.\n#             expensive, each access pays the cost. See @cached_property\n#             in the senior tier.\n#\nclass Temperature:\n    def __init__(self, celsius=0):\n        self._celsius = celsius            # leading _ = \"private by convention\"\n    @property\n    def celsius(self):\n        return self._celsius\n    @celsius.setter\n    def celsius(self, value):\n        if value < -273.15:\n            raise ValueError(f\"Temperature below absolute zero: {value}\")\n        self._celsius = value\n    @property\n    def fahrenheit(self):                  # derived view of _celsius\n        return self._celsius * 9 / 5 + 32\n    @fahrenheit.setter\n    def fahrenheit(self, value):\n        self.celsius = (value - 32) * 5 / 9   # routes through validation\nt = Temperature(25)\nt.celsius              # 25     — looks like attribute, runs getter\nt.celsius = 100        # runs setter with validation\nt.fahrenheit           # 212.0  — computed on access\n# t.celsius = -300     # ValueError"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @property — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             explicit deleter; abstract @property in an ABC so the\n#             interface is enforced; type hints throughout.\n#             when inputs change; ABC lets call sites rely on a stable\n#             contract without inheritance brittleness.\n#             explicit __slots__ slot for the cached name; ABC adds an\n#             import and a small class-creation cost.\n#\nfrom abc import ABC, abstractmethod\nfrom functools import cached_property\nclass Dataset(ABC):\n    @property\n    @abstractmethod\n    def source(self) -> str: ...\nclass CSVDataset(Dataset):\n    def __init__(self, path: str):\n        self._path = path\n    @property\n    def source(self) -> str:\n        return self._path\n    @source.setter\n    def source(self, value: str) -> None:\n        if not value.endswith(\".csv\"):\n            raise ValueError(\"source must be a .csv path\")\n        self._path = value\n        # invalidate any cached derived data when source changes:\n        self.__dict__.pop(\"rows\", None)\n    @cached_property\n    def rows(self) -> list[str]:\n        # imagine this is slow — runs once per instance\n        print(f\"loading {self._path} ...\")\n        return [\"row1\", \"row2\"]\nds = CSVDataset(\"data.csv\")\nds.rows         # prints \"loading ...\" then ['row1', 'row2']\nds.rows         # cached — no print\nds.source = \"other.csv\"   # invalidates cache via the setter\nds.rows         # prints \"loading ...\" again\n#\n# Decision rule:\n#   plain attribute, no logic                         -> just self.x = ...\n#   compute on access, cheap                          -> @property\n#   compute once, cache on instance                   -> @cached_property\n#   validate on assignment                            -> @property + @x.setter\n#   read-only public field                            -> @property without setter\n#   same validation across many fields                -> custom descriptor\n#   abstract attribute in a base class                -> @property + @abstractmethod\n#   need to invalidate cache when inputs change       -> setter that pops cached key\n#\n# Anti-pattern: Java-style get_x()/set_x() methods or @property on every field\n#   New Python users wrap every attribute in @property \"for safety\", which\n#   adds boilerplate without adding behavior. Start with plain attributes;\n#   promote to @property only when you need validation, computation, or\n#   want to preserve a public API while changing internal storage."
                  }
        ],
        tips: [
                  "Start with plain attributes — add @property only when you need getter/setter logic",
                  "Use _name convention for \"private\" attributes (Python has no true private)",
                  "Read-only properties: define @property but no setter",
                  "@cached_property (Python 3.8+) computes once and caches the result"
        ],
        mistake: "Adding @property getters and setters for all attributes by default. This is Java-style over-engineering. Use plain attributes until you need validation or computation.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "descriptors",
        fn: "Descriptors",
        desc: "Reusable attribute access logic via __get__, __set__, __delete__.",
        category: "Properties",
        subtitle: "The mechanism behind @property, @classmethod, and @staticmethod",
        signature: "class Validator:\n    def __get__(self, obj, cls): ...\n    def __set__(self, obj, val): ...",
        descLong: "A descriptor is any object that defines __get__, __set__, or __delete__. When assigned as a class attribute, Python calls these methods on attribute access. @property, @classmethod, and @staticmethod are all built-in descriptors. Custom descriptors enable reusable validation across classes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Descriptors — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             a fixed value. Show that putting it as a class attribute\n#             routes attribute access through the descriptor.\n#             __get__ runs on attribute access.\n#             (validation, caching) isn't visible yet.\n#\nclass AlwaysFortyTwo:\n    def __get__(self, obj, objtype=None):\n        return 42\nclass Foo:\n    answer = AlwaysFortyTwo()\nFoo().answer       # 42\nFoo.answer         # 42 — also works on the class"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Descriptors — common patterns you'll see in production.\n# APPROACH  - Combine Descriptors with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             attribute name automatically; __get__/__set__ store the\n#             value in the instance's __dict__ keyed by that name.\n#             other attribute it's assigned to — no boilerplate per field.\n#             __slots__); doesn't show the lazy/cached pattern.\n#\nclass Positive:\n    def __set_name__(self, owner, name):\n        self.name = name                           # captured at class creation\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self                            # access on the class itself\n        return obj.__dict__.get(self.name)\n    def __set__(self, obj, value):\n        if value <= 0:\n            raise ValueError(f\"{self.name} must be positive, got {value}\")\n        obj.__dict__[self.name] = value\nclass Circle:\n    radius = Positive()\n    x      = Positive()\n    y      = Positive()\n    def __init__(self, radius, x, y):\n        self.radius = radius                       # calls Positive.__set__\n        self.x = x\n        self.y = y\nc = Circle(5, 1, 2)\n# c.radius = -1   # ValueError: radius must be positive"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Descriptors — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             overwrites itself in obj.__dict__ so subsequent reads bypass\n#             the descriptor entirely. This is the \"non-data descriptor\"\n#             trick — equivalent to functools.cached_property.\n#             instance dict shadows the descriptor); pattern works in\n#             any framework that needs lazy attributes.\n#             easy to get wrong; doesn't compose with __slots__ unless\n#             a slot is reserved for the cache name.\n#\nclass LazyProperty:\n    \"\"\"Compute once on first access; cache result on the instance.\"\"\"\n    def __init__(self, func):\n        self.func = func\n        self.name = func.__name__\n    def __set_name__(self, owner, name):\n        self.name = name\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self\n        value = self.func(obj)\n        obj.__dict__[self.name] = value     # next read skips the descriptor\n        return value\nclass Dataset:\n    @LazyProperty\n    def data(self):\n        print(\"loading expensive data...\")\n        return list(range(1000))\nd = Dataset()\nd.data       # \"loading expensive data...\" then [0..999]\nd.data       # cached — no print, returned from instance __dict__\n# Note: stdlib has functools.cached_property for exactly this pattern —\n# write your own only when you need extra behavior (e.g. invalidation\n# hooks, async loading).\n#\n# Decision rule:\n#   one attribute, one getter/setter                  -> @property\n#   one attribute, compute-once cache                 -> @cached_property\n#   same validation across many attrs/classes         -> custom data descriptor\n#   lazy attribute that should disappear after read   -> non-data descriptor (no __set__)\n#   building an ORM Field / form Field abstraction    -> custom descriptor\n#   need __set_name__ to capture attribute name       -> custom descriptor\n#   simple computed view, no reuse                    -> @property — don't over-engineer\n#\n# Anti-pattern: storing the per-instance value on self (the descriptor)\n#   The descriptor is one object on the class, shared by every instance.\n#   Writing self.value = value inside __set__ overwrites that one shared\n#   slot, so all instances see the same data. Always store via\n#   obj.__dict__[self.name] = value (or use __set_name__ + a private key)."
                  }
        ],
        tips: [
                  "__set_name__ is called at class creation time — gives the descriptor its attribute name automatically",
                  "Always check if obj is None in __get__ — this handles access through the class (not instance)",
                  "Store values in obj.__dict__[self.name] to bypass the descriptor on future reads",
                  "Data descriptor (has __set__) takes priority over instance __dict__; non-data descriptor (only __get__) does not"
        ],
        mistake: "Storing the value on self (the descriptor) instead of obj. The descriptor is a class attribute shared by all instances — all would share the same value.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "classmethod",
        fn: "@classmethod",
        desc: "Method that receives the class as its first argument — used for factory methods.",
        category: "Properties",
        subtitle: "Alternative constructors that work correctly with subclasses",
        signature: "@classmethod\\n    def from_x(cls, ...): return cls(...)",
        descLong: "@classmethod receives cls (the class itself) instead of self. This enables factory methods and alternative constructors. Always use cls() not ClassName() inside — ensures subclasses get the right type back.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @classmethod — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             classmethod receives cls and uses cls(...) to build the\n#             instance.\n#             on the class, called as Date.from_string(\"...\").\n#             ClassName() doesn't show until a subclass exists.\n#\nclass Date:\n    def __init__(self, year, month, day):\n        self.year, self.month, self.day = year, month, day\n    @classmethod\n    def from_string(cls, s):              # cls is the class, not an instance\n        y, m, d = map(int, s.split(\"-\"))\n        return cls(y, m, d)               # cls() will work in subclasses\nDate.from_string(\"2024-03-15\").year      # 2024"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @classmethod — common patterns you'll see in production.\n# APPROACH  - Combine @classmethod with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             stateless validation, all grouped on the class. Contrast\n#             classmethod (gets cls) with staticmethod (gets nothing).\n#             Foo.from_dict / .from_string / .today, with a small\n#             validation utility next to them.\n#             subclass type — that's the point of the senior tier.\n#\nimport datetime as _dt\nclass Date:\n    def __init__(self, year, month, day):\n        self.year, self.month, self.day = year, month, day\n    @classmethod\n    def from_string(cls, s):\n        y, m, d = map(int, s.split(\"-\"))\n        return cls(y, m, d)\n    @classmethod\n    def today(cls):\n        d = _dt.date.today()\n        return cls(d.year, d.month, d.day)\n    @staticmethod\n    def is_valid(year, month, day):\n        return 1 <= month <= 12 and 1 <= day <= 31\nDate.from_string(\"2024-03-15\")\nDate.today()\nDate.is_valid(2024, 13, 1)            # False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @classmethod — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             tracks the actual subclass. Demonstrate that cls() (not\n#             ClassName()) is what makes inheritance work correctly.\n#             without overriding it; mypy/pyright understand the return.\n#             \"Date\" string-typed return + TypeVar.\n#\nfrom typing import Self\nimport datetime as _dt\nclass Date:\n    def __init__(self, year: int, month: int, day: int) -> None:\n        self.year, self.month, self.day = year, month, day\n    def __repr__(self) -> str:\n        return f\"{type(self).__name__}({self.year}, {self.month}, {self.day})\"\n    @classmethod\n    def from_string(cls, s: str) -> Self:\n        y, m, d = map(int, s.split(\"-\"))\n        return cls(y, m, d)        # cls preserves the subclass identity\n    @classmethod\n    def today(cls) -> Self:\n        d = _dt.date.today()\n        return cls(d.year, d.month, d.day)\nclass FiscalDate(Date):\n    \"\"\"Same shape, but it's now a fiscal date.\"\"\"\nFiscalDate.from_string(\"2024-03-15\")   # FiscalDate(2024, 3, 15)  ✓\nFiscalDate.today()                     # FiscalDate(...) — not a Date\n# Anti-pattern to avoid:\n#   return Date(y, m, d)    <-- always returns the base class, breaks subclasses\n#\n# Decision rule:\n#   alternative constructor (from_string, from_dict)  -> @classmethod\n#   needs the class but not an instance               -> @classmethod\n#   stateless utility, no class state needed          -> @staticmethod\n#   subclasses should get instances of themselves     -> @classmethod with cls()\n#   factory that picks among subclasses (registry)    -> @classmethod on base\n#   utility totally unrelated to class state          -> module-level function\n#   need to access class variables (config, registry) -> @classmethod\n#\n# Anti-pattern: hardcoding ClassName(...) inside a classmethod\n#   When a subclass calls Date.from_string(\"...\"), they expect a Date\n#   instance back. If the body says return Date(y, m, d) instead of\n#   cls(y, m, d), every subclass silently downgrades to the base class.\n#   Always use cls() — that's the entire reason classmethod exists."
                  }
        ],
        tips: [
                  "Always use cls() not ClassName() inside a classmethod — ensures subclasses get the right type",
                  "First argument is cls by convention — any name works but cls is universal",
                  "Call on the class: Date.today() or on an instance — both receive the class",
                  "classmethod is the standard pattern for alternative constructors like from_string(), from_dict()"
        ],
        mistake: "Using ClassName() directly inside a classmethod instead of cls(). If someone subclasses, cls() returns the subclass instance; ClassName() always returns the base class.",
        shorthand: {
          verbose: "from datetime import datetime, timedelta\nclass Date:\ndef __init__(self, year, month, day):\nself.year, self.month, self.day = year, month, day",
          concise: "Date.is_valid(2024, 13, 1)           # False",
        },
      },
      {
        id: "staticmethod",
        fn: "@staticmethod",
        desc: "Method that receives neither self nor cls — a plain function in the class namespace.",
        category: "Properties",
        subtitle: "Utility functions grouped with a class but needing no class or instance state",
        signature: "@staticmethod\\n    def util_fn(args): ...",
        descLong: "@staticmethod receives neither cls nor self. It is a regular function that lives in the class namespace for organizational purposes. Use it when the logic is related to the class but does not need access to the class or any instance.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @staticmethod — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             class, takes neither self nor cls, called via the class.\n#             but doesn't need its state\" in the tiniest form.\n#             also doesn't yet contrast static / class / instance.\n#\nclass Math:\n    @staticmethod\n    def square(x):\n        return x * x\nMath.square(5)        # 25 — call without an instance"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @staticmethod — common patterns you'll see in production.\n# APPROACH  - Combine @staticmethod with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             Demonstrates calling on the class and on an instance, and\n#             the @staticmethod / @classmethod / regular method contrast.\n#             a namespace for related stateless utilities.\n#             senior tier covers when to pick which.\n#\nclass Validator:\n    @staticmethod\n    def is_valid_email(email: str) -> bool:\n        return \"@\" in email and \".\" in email.split(\"@\")[-1]\n    @staticmethod\n    def is_valid_age(age: int) -> bool:\n        return 0 <= age <= 150\n    @staticmethod\n    def slugify(text: str) -> str:\n        return text.lower().replace(\" \", \"-\")\n# Call on the class — no instance needed:\nValidator.is_valid_email(\"alice@example.com\")   # True\nValidator.is_valid_age(25)                      # True\n# Also works on an instance, but conveys nothing extra:\nv = Validator()\nv.slugify(\"Hello World\")                        # \"hello-world\"\n# Static / class / instance side by side:\nclass MyClass:\n    @staticmethod\n    def static_fn():     return \"static\"        # no self, no cls\n    @classmethod\n    def class_fn(cls):   return cls()           # cls, not self\n    def instance_fn(self): return self          # self"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @staticmethod — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             logic is conceptually tied to the class but stateless;\n#             use @classmethod if subclasses might override; reach for\n#             a module-level function when neither applies.\n#             behavior is preserved where you want it (factories) and\n#             not where you don't (pure utilities).\n#             genuinely fuzzy — sometimes the only honest answer is\n#             \"where will readers look for this?\".\n#\nfrom typing import Self\nclass Color:\n    def __init__(self, r: int, g: int, b: int):\n        self.r, self.g, self.b = r, g, b\n    # Pure utility — no class state, no subclass-specific behavior.\n    # @staticmethod is the right hammer.\n    @staticmethod\n    def clamp(v: int, lo: int = 0, hi: int = 255) -> int:\n        return max(lo, min(hi, v))\n    # Builds a Color (or subclass) — must use cls(...) to preserve type.\n    # @classmethod is the right hammer.\n    @classmethod\n    def from_hex(cls, code: str) -> Self:\n        code = code.lstrip(\"#\")\n        r, g, b = int(code[0:2], 16), int(code[2:4], 16), int(code[4:6], 16)\n        return cls(cls.clamp(r), cls.clamp(g), cls.clamp(b))\nclass BrandColor(Color):\n    \"\"\"Subclass — from_hex() returns BrandColor thanks to cls().\"\"\"\nBrandColor.from_hex(\"#1A2B3C\")   # BrandColor instance, not Color\n# Module-level alternative:\ndef parse_hex(code: str) -> tuple[int, int, int]:\n    \"\"\"Use this when callers don't want to think about Color at all.\"\"\"\n    code = code.lstrip(\"#\")\n    return int(code[0:2], 16), int(code[2:4], 16), int(code[4:6], 16)\n#\n# Decision rule:\n#   utility logically tied to class, no self/cls       -> @staticmethod\n#   callers should discover it via the class namespace -> @staticmethod\n#   factory or alternative constructor                 -> @classmethod\n#   needs class config / registry / subclass behavior  -> @classmethod\n#   completely independent of the class                -> module-level def\n#   used only inside one method                        -> nested def, not @staticmethod\n#   needs to be overridable in subclass                -> @classmethod (or regular method)\n#\n# Anti-pattern: making everything @staticmethod for \"purity\"\n#   Once a helper turns into @staticmethod, subclasses can override it but\n#   callers still go through ClassName.helper(), bypassing dispatch.\n#   If a method might ever need cls or self, leave it as a regular method\n#   or @classmethod. If it really has no relation to the class, prefer a\n#   module-level function — readers expect class methods to use the class."
                  }
        ],
        tips: [
                  "If a method does not use self or cls — make it @staticmethod to signal that clearly",
                  "@staticmethod is slightly faster than a regular method (no self/cls argument passed)",
                  "Consider a module-level function instead if the utility is not conceptually tied to the class",
                  "@staticmethod cannot be overridden meaningfully by subclasses — use @classmethod if subclass behavior might differ"
        ],
        mistake: "Making every helper @staticmethod. If a method might later need cls for configuration or subclass support, leave it as a regular method or @classmethod.",
        shorthand: {
          verbose: "class Validator:\n@staticmethod\ndef is_valid_email(email: str) -> bool:\nreturn \"@\" in email and \".\" in email.split(\"@\")[-1]",
          concise: "return self",
        },
      },
      {
        id: "protocol-oop",
        fn: "Protocol",
        desc: "Define structural interfaces — duck typing with static type checking.",
        category: "Properties",
        subtitle: "Any class with the right methods satisfies Protocol — no inheritance needed",
        signature: "from typing import Protocol\nclass Drawable(Protocol): def draw(self): ...",
        descLong: "Protocol (Python 3.8+) defines a structural interface — any class that has the required methods satisfies it without explicit inheritance. Duck typing made visible to type checkers. Unlike ABCs, there is no runtime enforcement unless @runtime_checkable is used.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Protocol — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             that takes anything matching it. No inheritance involved.\n#             enough — without any extra machinery.\n#             still pure duck typing, so a wrong type passes silently.\n#\nfrom typing import Protocol\nclass Drawable(Protocol):\n    def draw(self) -> None: ...\nclass Circle:                         # no inheritance from Drawable\n    def draw(self) -> None:\n        print(\"Drawing circle\")\ndef render(item: Drawable) -> None:    # accepts anything with draw()\n    item.draw()\nrender(Circle())     # type checker is happy; runs at runtime"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Protocol — common patterns you'll see in production.\n# APPROACH  - Combine Protocol with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             the Protocol; show that any class with the right shape\n#             satisfies it without inheritance.\n#             callable APIs, plus a runtime check for plugin-style code.\n#             signatures — a wrong-arity method still passes isinstance().\n#\nfrom typing import Protocol, runtime_checkable\nimport io\n@runtime_checkable\nclass Closeable(Protocol):\n    def close(self) -> None: ...\nclass Drawable(Protocol):\n    def draw(self) -> None: ...\nclass Circle:\n    def draw(self) -> None: print(\"Drawing circle\")\nclass Square:\n    def draw(self) -> None: print(\"Drawing square\")\ndef render(item: Drawable) -> None:\n    item.draw()\nrender(Circle())                      # works\nrender(Square())                      # works — no inheritance needed\nisinstance(io.StringIO(), Closeable)  # True — has .close()\nisinstance(42, Closeable)             # False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Protocol — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             protocols with default method implementations, and the\n#             choice between Protocol (structural) and ABC (nominal).\n#             pass any compatible type; library can offer defaults\n#             without forcing inheritance.\n#             classes only run when a class explicitly inherits — they\n#             don't get applied via duck typing.\n#\nfrom typing import Protocol, runtime_checkable, TypeVar, Iterable\nT_co = TypeVar(\"T_co\", covariant=True)\nclass Sized(Protocol):\n    def __len__(self) -> int: ...\nclass Reader(Protocol[T_co]):\n    \"\"\"Generic protocol — readers of any element type.\"\"\"\n    def read(self) -> T_co: ...\n@runtime_checkable\nclass Greeter(Protocol):\n    name: str\n    def greet(self) -> str:\n        return f\"hello, {self.name}\"   # default impl available on inheritance\ndef first_n(items: Iterable[T_co], n: int) -> list[T_co]:\n    return [x for _, x in zip(range(n), items)]\n# Protocol vs ABC quick guide:\n#   - ABC     : nominal — caller must subclass; enforced at instantiation.\n#   - Protocol: structural — caller's class just needs the right shape;\n#               checked by mypy/pyright; isinstance only with @runtime_checkable.\n# Reach for ABC when you need ENFORCEMENT; Protocol when you want OPTIONAL conformance.\n#\n# Decision rule:\n#   typing third-party objects you don't control       -> Protocol\n#   need runtime isinstance() check                    -> @runtime_checkable Protocol\n#   strict enforcement at class instantiation          -> abc.ABC + @abstractmethod\n#   type a callback parameter (any def with shape)     -> Protocol with __call__\n#   express \"iterable of T\", \"supports __len__\"        -> Protocol (or typing.Sized)\n#   library wants users to opt in by subclassing       -> ABC\n#   library should accept duck-typed objects           -> Protocol\n#   value-type contract with default impls             -> ABC; defaults run only on subclasses\n#\n# Anti-pattern: expecting Protocol to validate at runtime\n#   Without @runtime_checkable, Protocol is invisible at runtime — your\n#   function happily accepts anything and crashes only when the missing\n#   method is called. Even with @runtime_checkable, isinstance() only\n#   checks method NAMES, not signatures or attribute types. Treat Protocol\n#   as static documentation, and add explicit checks where it matters."
                  }
        ],
        tips: [
                  "Protocol expresses \"anything with these methods\" — the correct type for duck-typed code",
                  "@runtime_checkable enables isinstance() — plain Protocol does not support it",
                  "Protocol is enforced only by type checkers (mypy, pyright) — no runtime enforcement",
                  "For runtime enforcement, use ABC — for type-checker-only interfaces, use Protocol"
        ],
        mistake: "Expecting Protocol to raise errors at runtime. Without @runtime_checkable and isinstance(), Protocol is purely type-checker documentation — it does not enforce anything when your code runs.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
    ],
  },

  // ── Section 3: Modern Patterns ─────────────────────────────────────────
  {
    id: "dataclasses",
    title: "Modern Patterns",
    entries: [
      {
        id: "dataclass",
        fn: "@dataclass",
        desc: "Auto-generate __init__, __repr__, __eq__ from fields.",
        category: "Modern",
        subtitle: "Boilerplate-free data containers",
        signature: "from dataclasses import dataclass\\n@dataclass\\nclass Foo:",
        descLong: "@dataclass (Python 3.7+) auto-generates __init__, __repr__, and __eq__ from class variable annotations. Use field() for defaults and configuration. frozen=True makes instances immutable and hashable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of @dataclass — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             decorator generates __init__, __repr__, and __eq__.\n#             without any options or edge cases.\n#\nfrom dataclasses import dataclass\n@dataclass\nclass Point:\n    x: float\n    y: float\np = Point(1.0, 2.0)\np.x                       # 1.0\nrepr(p)                   # 'Point(x=1.0, y=2.0)'  ← generated\np == Point(1.0, 2.0)      # True                   ← generated"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of @dataclass — common patterns you'll see in production.\n# APPROACH  - Combine @dataclass with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             mutable defaults, frozen=True for hashable value objects,\n#             __post_init__ for invariants, order=True for sortability.\n#             documents the \"never use [] as a default\" rule in code.\n#             senior-tier sharpening tools.\n#\nfrom dataclasses import dataclass, field\nfrom typing import List\n# Defaults and mutable factories\n@dataclass\nclass Employee:\n    name: str\n    department: str\n    salary: float = 50000.0\n    tags: List[str] = field(default_factory=list)   # NEVER use = []\n# Immutable (and therefore hashable)\n@dataclass(frozen=True)\nclass Coordinate:\n    lat: float\n    lon: float\n# Post-init validation\n@dataclass\nclass Circle:\n    radius: float\n    def __post_init__(self):\n        if self.radius < 0:\n            raise ValueError(f\"Radius must be non-negative: {self.radius}\")\n# Sortable, but ignore the name in comparisons\n@dataclass(order=True)\nclass Score:\n    value: int\n    name: str = field(compare=False)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of @dataclass — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             kw_only=True to lock call sites, asdict/astuple for\n#             serialization, and __post_init__ for derived fields. Also\n#             consider attrs / Pydantic when you need real validation.\n#             swaps); easy round-trip with dict-based serializers.\n#             trickier; kw_only is more verbose at call sites; asdict\n#             is recursive but not customizable per-type without work.\n#\nfrom dataclasses import dataclass, field, asdict, astuple\nfrom typing import Optional\n@dataclass(slots=True, kw_only=True, order=True)\nclass User:\n    id: int\n    name: str\n    email: Optional[str] = None\n    tags: list[str] = field(default_factory=list, compare=False)\n    full: str = field(init=False, repr=False)        # derived field\n    def __post_init__(self) -> None:\n        self.full = f\"{self.name} <{self.email or 'no-email'}>\"\n# kw_only=True: positional args are forbidden — call sites are explicit\nu = User(id=1, name=\"Alice\", email=\"a@example.com\")\nv = User(id=2, name=\"Bob\")\nasdict(u)       # nested dicts — handy for JSON / API responses\nastuple(u)      # for CSV rows or DB params\nsorted([u, v])  # works thanks to order=True; tags excluded by compare=False\n# When @dataclass isn't enough:\n#   - need real input validation (types, ranges)? -> Pydantic\n#   - need __slots__ + converters + validators?    -> attrs\n#   - need ORM-mapped fields?                      -> SQLAlchemy / Django models\n#\n# Decision rule:\n#   plain data container with 2+ fields              -> @dataclass\n#   immutable / hashable / safe in sets              -> @dataclass(frozen=True)\n#   millions of small instances, memory matters      -> @dataclass(slots=True)\n#   call sites with many similar args (lat/lon)      -> @dataclass(kw_only=True)\n#   need real input validation / coercion            -> Pydantic BaseModel\n#   need converters + rich field options             -> attrs.define\n#   maps to a DB row / ORM entity                    -> SQLAlchemy / Django model\n#   tiny pair of values, want tuple semantics        -> NamedTuple\n#\n# Anti-pattern: using = [] or = {} as a default\n#   @dataclass class C: items: list = [] raises ValueError at class\n#   creation because every instance would share the same list. Use\n#   field(default_factory=list) instead — Python will call list() per\n#   instance. Same for dict, set, and any other mutable default."
                  }
        ],
        tips: [
                  "Use field(default_factory=list) for mutable defaults — never default=[]",
                  "frozen=True makes the dataclass hashable and immutable",
                  "__post_init__ runs after __init__ — use it for validation and derived fields",
                  "For complex cases, consider attrs or Pydantic (adds validation and serialization)"
        ],
        mistake: "Using a mutable default: @dataclass class C: items: list = []. Python raises TypeError. Use field(default_factory=list) instead.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "slots",
        fn: "__slots__",
        desc: "Restrict instance attributes and reduce memory usage.",
        category: "Classes",
        subtitle: "Faster access, lower memory — replaces __dict__ with fixed slots",
        signature: "class Foo:\n    __slots__ = [\"x\", \"y\"]",
        descLong: "By default Python objects store instance attributes in a __dict__. __slots__ replaces this with fixed slots — lower memory, faster attribute access, and prevents adding undeclared attributes. Most valuable when creating millions of small instances.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of __slots__ — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Show that adding a new attribute now raises.\n#             without distractions about memory or inheritance.\n#             gotcha — those need the next tiers.\n#\nclass PointFast:\n    __slots__ = (\"x\", \"y\")\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\np = PointFast(1, 2)\np.x, p.y      # (1, 2) — works\n# p.z = 3     # AttributeError — 'z' not declared in __slots__\n# p.__dict__  # AttributeError — slotted classes have no __dict__"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of __slots__ — common patterns you'll see in production.\n# APPROACH  - Combine __slots__ with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             measure with sys.getsizeof(). Add a small inheritance\n#             example that respects slots.\n#             inheritance pattern (only declare NEW names) is the bit\n#             that trips people up most.\n#             millions of objects; hides interactions with weakref and\n#             pickling.\n#\nimport sys\nclass Point:                            # default — has __dict__\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\nclass PointFast:\n    __slots__ = (\"x\", \"y\")\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\nsys.getsizeof(Point(1, 2))      # larger — pays for __dict__\nsys.getsizeof(PointFast(1, 2))  # smaller — slot storage only\n# Inheritance: only declare the NEW slots in the child:\nclass Point3D(PointFast):\n    __slots__ = (\"z\",)\n    def __init__(self, x, y, z):\n        super().__init__(x, y)\n        self.z = z\np3 = Point3D(1, 2, 3)\np3.x, p3.y, p3.z              # (1, 2, 3)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of __slots__ — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             __slots__ brings __dict__ back; weakref needs an explicit\n#             slot; pickling needs help; @dataclass(slots=True) is the\n#             modern shortcut.\n#             memory savings; covers the two compatibility footguns\n#             (weakref, pickle) most teams hit only once it's in prod.\n#             it — only reach for slots when you have measured the\n#             memory cost or are creating millions of small instances.\n#\nfrom dataclasses import dataclass\n# 1. Modern shortcut — Python 3.10+ generates __slots__ from the fields:\n@dataclass(slots=True)\nclass Coord:\n    x: float\n    y: float\n# 2. Subclass without __slots__ silently re-introduces __dict__:\nclass PointFast:\n    __slots__ = (\"x\", \"y\")\nclass Loose(PointFast):\n    pass                          # no __slots__ — instances get __dict__ back\nl = Loose()\nl.__dict__                        # {} — defeats the purpose of the parent's slots\n# 3. weakref needs an explicit slot when slots are used:\nimport weakref\nclass Cacheable:\n    __slots__ = (\"value\", \"__weakref__\")    # opt in\n    def __init__(self, v): self.value = v\nc = Cacheable(1)\nref = weakref.ref(c)              # OK; would fail without \"__weakref__\" in slots\n# 4. Pickling: slotted instances need __getstate__/__setstate__ or\n#    __slots__ with no __dict__/no parent dict — define them if pickling.\n# Rule of thumb:\n#   - few instances or readability matters more   -> skip __slots__\n#   - millions of small instances                 -> @dataclass(slots=True) is the win\n#\n# Decision rule:\n#   millions of small fixed-shape instances           -> __slots__ (or dataclass slots=True)\n#   handful of long-lived objects                     -> skip slots, keep __dict__\n#   modern Python 3.10+, want minimal boilerplate     -> @dataclass(slots=True)\n#   need weakref to instances                         -> add \"__weakref__\" to slots\n#   need to pickle slotted objects                    -> define __getstate__/__setstate__\n#   subclass extends a slotted parent                 -> declare ONLY new slots in child\n#   need to add attrs dynamically (monkey-patching)   -> don't use slots\n#   readability/refactor flexibility matters most     -> skip slots\n#\n# Anti-pattern: adding __slots__ to a child while the parent has none\n#   __slots__ saves memory only if every class in the MRO declares it.\n#   A single ancestor without __slots__ keeps __dict__ on every instance,\n#   so the child's slots add restrictions without saving a single byte.\n#   Either slot the whole hierarchy or skip it — half-measures are pure cost."
                  }
        ],
        tips: [
                  "__slots__ saves the most memory when creating millions of small instances",
                  "Every class in an inheritance chain must define __slots__ — any omission brings __dict__ back",
                  "Cannot pickle slotted objects by default without adding __getstate__/__setstate__",
                  "Benchmark before adding __slots__ — the savings may be negligible for most code"
        ],
        mistake: "Adding __slots__ to a subclass while the parent has none. The parent still has __dict__, so no memory is saved — all instances still have __dict__ from the parent.",
        shorthand: {
          verbose: "class Point:\ndef __init__(self, x, y):\nself.x = x\nself.y = y",
          concise: "pass              # no __slots__ → __dict__ is back",
        },
      },
      {
        id: "enum",
        fn: "Enum",
        desc: "Define a set of named, immutable constants.",
        category: "Classes",
        subtitle: "Named constants with identity comparison and iteration",
        signature: "from enum import Enum, auto\nclass Color(Enum): RED = 1",
        descLong: "Enum creates a class where each member is a named constant. Members have both a name and value, support identity comparison with is, can be iterated, and prevent accidental duplicate values. auto() assigns sequential values automatically.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Enum — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             value, and lookup-by-name / lookup-by-value.\n#             import, one class, instantly clearer code.\n#             compatibility), or Flag (bitmasks).\n#\nfrom enum import Enum\nclass Color(Enum):\n    RED   = 1\n    GREEN = 2\n    BLUE  = 3\nColor.RED            # <Color.RED: 1>\nColor.RED.name       # 'RED'\nColor.RED.value      # 1\nColor['RED']         # lookup by name\nColor(1)             # lookup by value\nlist(Color)          # [<Color.RED: 1>, <Color.GREEN: 2>, <Color.BLUE: 3>]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Enum — common patterns you'll see in production.\n# APPROACH  - Combine Enum with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             IntEnum for legacy code that compares to integers, and\n#             Flag for bitmask-style permissions.\n#             real code; shows the right tool for each shape of constant.\n#             enum members, or conversion-from-string patterns.\n#\nfrom enum import Enum, IntEnum, Flag, auto\n# auto() — sequential values when the actual numbers don't matter:\nclass Direction(Enum):\n    NORTH = auto()      # 1\n    SOUTH = auto()      # 2\n    EAST  = auto()      # 3\n    WEST  = auto()      # 4\n# IntEnum — members compare equal to ints (useful for DB status codes etc.):\nclass Status(IntEnum):\n    ACTIVE   = 1\n    INACTIVE = 0\nStatus.ACTIVE == 1     # True (Enum would be False)\n# Flag — bitwise OR, AND, IN for permission masks:\nclass Permission(Flag):\n    READ    = auto()    # 1\n    WRITE   = auto()    # 2\n    EXECUTE = auto()    # 4\nperm = Permission.READ | Permission.WRITE\nPermission.READ in perm     # True\nPermission.EXECUTE in perm  # False"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Enum — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             StrEnum (3.11+) for string-y constants, custom methods\n#             and properties on members, and a robust from_string\n#             helper that handles unknown inputs.\n#             validation, parsing, and behavior; downstream code never\n#             needs to switch on raw strings.\n#             confuse readers used to \"enums are just constants\";\n#             adding behavior makes refactors slightly riskier.\n#\nfrom enum import Enum, unique\n@unique                              # raises at class-creation if two members share a value\nclass Priority(Enum):\n    LOW    = 1\n    MEDIUM = 2\n    HIGH   = 3\n    @classmethod\n    def from_string(cls, s: str) -> \"Priority\":\n        try:\n            return cls[s.strip().upper()]\n        except KeyError as e:\n            valid = \", \".join(p.name for p in cls)\n            raise ValueError(f\"unknown priority {s!r}; expected one of {valid}\") from e\n    @property\n    def is_urgent(self) -> bool:\n        return self is Priority.HIGH\nPriority.from_string(\"medium\").is_urgent     # False\nPriority.from_string(\"HIGH\").is_urgent       # True\n# Priority.from_string(\"CRITICAL\")           # ValueError with helpful message\n# StrEnum (3.11+) — like IntEnum but for strings; great for API enums:\n# from enum import StrEnum\n# class Mode(StrEnum):\n#     READ  = \"read\"\n#     WRITE = \"write\"\n# Mode.READ == \"read\"          # True\n# json.dumps(Mode.READ)        # '\"read\"'\n#\n# Decision rule:\n#   small fixed set of named constants                -> Enum\n#   members must compare equal to ints (DB codes)     -> IntEnum\n#   members must compare equal to strings (API)       -> StrEnum (3.11+)\n#   bitmask permissions / flag combinations           -> Flag / IntFlag\n#   value doesn't matter, just the name               -> auto()\n#   want guaranteed unique values                     -> @unique decorator\n#   constants live in config / vary at runtime        -> dict / Literal type, not Enum\n#   need parsing from user input with helpful errors  -> classmethod from_string()\n#\n# Anti-pattern: using strings or ints as \"enum\" values\n#   status = \"active\" sprinkled across a codebase invites typos (\"activ\"),\n#   silent comparison failures, and zero IDE support. An Enum gives you\n#   completion, refactoring, and exhaustiveness checking. If you need to\n#   serialize, use StrEnum/IntEnum so the wire format stays a primitive\n#   while the in-memory type stays a real Enum."
                  }
        ],
        tips: [
                  "Enums prevent magic numbers — Status.ACTIVE is clearer than checking status == 1",
                  "auto() assigns sequential values — use when the actual value does not matter",
                  "Use IntEnum when members must compare equal to integers (e.g. database status codes)",
                  "Use Flag for bitmask permissions — supports |, &, ~ operations naturally"
        ],
        mistake: "Comparing enum members with == to raw integers: Color.RED == 1 is False with regular Enum. Use IntEnum if you need integer comparison, or compare .value: Color.RED.value == 1.",
        shorthand: {
          verbose: "from enum import Enum, auto, IntEnum, Flag\nclass Color(Enum):\nRED   = 1\nGREEN = 2",
          concise: "Permission.READ in perm   # True",
        },
      },
      {
        id: "context-manager",
        fn: "Context managers",
        desc: "Custom with-statement support using __enter__ / __exit__.",
        category: "Modern",
        subtitle: "Manage resources safely with the with statement",
        signature: "def __enter__(self): | def __exit__(self, exc_type, exc_val, tb):",
        descLong: "Context managers guarantee cleanup code runs even if an exception occurs. Implement __enter__ and __exit__ for class-based managers. The @contextmanager decorator makes generator-based managers with yield.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Context managers — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             exit so the protocol is unmistakable.\n#             exceptions to reason about.\n#             real reason context managers exist.\n#\nclass Trace:\n    def __enter__(self):\n        print(\"enter\")\n        return self                 # value for the 'as' target\n    def __exit__(self, exc_type, exc_val, tb):\n        print(\"exit\")\n        # returning None / False means \"do NOT suppress exceptions\"\nwith Trace() as t:\n    print(\"inside\")\n# enter\n# inside\n# exit"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Context managers — common patterns you'll see in production.\n# APPROACH  - Combine Context managers with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             stateful resources (DB connections), @contextmanager for\n#             quick generator-based wrappers.\n#             commit-on-success / rollback-on-error skeleton plus the\n#             try/yield/finally idiom.\n#             for dynamic numbers of resources, or async context.\n#\nfrom contextlib import contextmanager\n# Class-based: when you have state to hang on the object\nclass DatabaseConnection:\n    def __init__(self, url):\n        self.url = url\n    def __enter__(self):\n        self.conn = connect(self.url)\n        return self.conn                  # 'as' target\n    def __exit__(self, exc_type, exc_val, tb):\n        if exc_type:\n            self.conn.rollback()\n        else:\n            self.conn.commit()\n        self.conn.close()\n        return False                      # don't suppress exceptions\nwith DatabaseConnection(\"postgresql://...\") as conn:\n    conn.execute(\"INSERT ...\")\n# Generator-based: shorter for stateless setup/teardown\n@contextmanager\ndef managed_file(path):\n    f = open(path)\n    try:\n        yield f                           # 'as' target\n    finally:\n        f.close()                         # ALWAYS runs\nwith managed_file(\"data.txt\") as f:\n    data = f.read()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Context managers — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             exceptions, ExitStack for a dynamic set of resources,\n#             redirect_stdout for testable scripts, and an async\n#             context manager for asyncio code.\n#             you'll actually use; ExitStack is the answer to \"how do\n#             I open N files at once\" without nested with statements.\n#             not a drop-in for sync code; ExitStack discipline matters\n#             (cleanup is LIFO and partial-failure aware).\n#\nfrom contextlib import contextmanager, suppress, ExitStack, redirect_stdout\nimport io\n# 1. suppress(...) — silently ignore expected exceptions in a block\nwith suppress(FileNotFoundError):\n    open(\"might-not-exist.txt\").read()\n# 2. ExitStack — open a dynamic number of resources safely\ndef merge(paths: list[str]) -> str:\n    with ExitStack() as stack:\n        files = [stack.enter_context(open(p)) for p in paths]\n        return \"\".join(f.read() for f in files)\n    # all files closed, even if one open() raises mid-loop\n# 3. redirect_stdout — make stdout captureable in tests\nbuf = io.StringIO()\nwith redirect_stdout(buf):\n    print(\"captured, not printed\")\nbuf.getvalue()             # 'captured, not printed\\n'\n# 4. async context manager for asyncio code:\nclass AsyncTrace:\n    async def __aenter__(self):\n        print(\"aenter\"); return self\n    async def __aexit__(self, exc_type, exc, tb):\n        print(\"aexit\")\n# usage:\n# async with AsyncTrace() as t:\n#     await something()\n#\n# Decision rule:\n#   stateless setup/teardown                          -> @contextmanager generator\n#   stateful resource with attrs/methods              -> class with __enter__/__exit__\n#   silently ignore a known exception                 -> contextlib.suppress\n#   open a dynamic number of resources                -> contextlib.ExitStack\n#   capture stdout/stderr in tests                    -> redirect_stdout / redirect_stderr\n#   asyncio resource (DB pool, HTTP client)           -> __aenter__ / __aexit__\n#   need to nest many context managers                -> ExitStack, not nested with\n#   already have a wrapper-style pattern              -> consider closing(), nullcontext()\n#\n# Anti-pattern: returning True from __exit__ to \"be safe\"\n#   Returning True suppresses ALL exceptions raised inside the with block,\n#   which silently swallows real bugs (KeyboardInterrupt, AssertionError,\n#   programming errors). Return False (or None — same thing) and only\n#   suppress when intentional, narrowing to specific exception types."
                  }
        ],
        tips: [
                  "__exit__ returning True suppresses exceptions — almost always return False",
                  "The @contextmanager decorator is easier for simple cases — try/yield/finally",
                  "contextlib.suppress(ExceptionType) creates a simple do-nothing context manager",
                  "contextlib.ExitStack manages a dynamic number of context managers"
        ],
        mistake: "Returning True from __exit__ accidentally. This suppresses ALL exceptions, hiding errors silently. Only return True if suppression is intentional.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
      {
        id: "dataclasses",
        fn: "dataclasses (Data Classes)",
        desc: "Auto-generate __init__, __repr__, __eq__ for data containers.",
        category: "OOP",
        subtitle: "Less boilerplate than namedtuple or hand-written classes",
        signature: "from dataclasses import dataclass, field\n@dataclass\nclass Person: ...",
        descLong: "Dataclasses reduce boilerplate by auto-generating common methods. Define a class with type hints, and @dataclass adds __init__, __repr__, __eq__ automatically. Supports defaults, factories, and frozen (immutable) classes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of dataclasses (Data Classes) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             decorator generates __init__, __repr__, __eq__.\n#             no hand-written equality.\n#             whole reason to keep using dataclasses past this point.\n#\nfrom dataclasses import dataclass\n@dataclass\nclass Person:\n    name: str\n    age: int\n    email: str\np = Person(\"Alice\", 30, \"alice@example.com\")\nprint(p)                                # Person(name='Alice', age=30, email='alice@example.com')\np == Person(\"Alice\", 30, \"alice@example.com\")   # True"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of dataclasses (Data Classes) — common patterns you'll see in production.\n# APPROACH  - Combine dataclasses (Data Classes) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             field(default_factory=...), Optional fields, methods on\n#             the class, and __post_init__ for derived/validated state.\n#             like; the field(default_factory=...) line is the single\n#             rule that prevents the most common dataclass bug.\n#             astuple — those are the senior-tier finishing touches.\n#\nfrom dataclasses import dataclass, field\nfrom datetime import datetime\nfrom typing import List, Optional\n# Defaults — non-defaults must come first\n@dataclass\nclass Config:\n    host: str\n    port: int = 8080\n    debug: bool = False\n    timeout: int = 30\n# Mutable defaults — ALWAYS via default_factory\n@dataclass\nclass Team:\n    name: str\n    members: List[str] = field(default_factory=list)\n    created: datetime = field(default_factory=datetime.now)\n# Methods + Optional fields + __post_init__ for derived/validated state\n@dataclass\nclass Product:\n    name: str\n    price: float\n    quantity: int = 1\n    description: Optional[str] = None\n    def __post_init__(self):\n        if self.price < 0:\n            raise ValueError(\"price cannot be negative\")\n        self.total = self.price * self.quantity   # derived field\n    def discount(self, pct: float) -> float:\n        return self.total * (1 - pct)\np = Product(\"Laptop\", 999.99, 2)\np.total                                  # 1999.98\np.discount(0.10)                         # 1799.982"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of dataclasses (Data Classes) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (with the \"no defaults before non-defaults\" rule), asdict /\n#             astuple for serialization, and order=True for sortable\n#             value objects. Note when to step up to attrs / Pydantic.\n#             serialize — without a single hand-written method.\n#             kw_only=True (3.10+) or careful field ordering;\n#             asdict() converts deeply but isn't customizable per-type\n#             without extra work.\n#\nfrom dataclasses import dataclass, field, asdict, astuple\n# Inheritance: subclass fields appended; with defaults in the parent,\n# either keep all subclass fields defaulted OR use kw_only=True.\n@dataclass\nclass Animal:\n    name: str\n    age: int\n@dataclass\nclass Dog(Animal):\n    breed: str = \"mutt\"               # defaulted to satisfy ordering rule\ndog = Dog(\"Max\", 5, \"Golden Retriever\")\nprint(dog)        # Dog(name='Max', age=5, breed='Golden Retriever')\n# Sortable, comparable value type\n@dataclass(order=True, frozen=True)\nclass Version:\n    major: int\n    minor: int\n    patch: int = 0\nv1, v2, v3 = Version(1, 0, 0), Version(1, 0, 0), Version(1, 1, 0)\nv1 == v2                              # True\nsorted([v3, v1])                      # [Version(1,0,0), Version(1,1,0)]\n# Conversion for APIs / DBs / CSVs\n@dataclass\nclass Person:\n    name: str\n    age: int\n    email: str\np = Person(\"Charlie\", 28, \"charlie@example.com\")\nasdict(p)        # {'name': 'Charlie', 'age': 28, 'email': 'charlie@example.com'}\nastuple(p)       # ('Charlie', 28, 'charlie@example.com')\n# When to leave @dataclass behind:\n#   - need real input validation / coercion?     -> Pydantic\n#   - need converters and richer field options?  -> attrs\n#   - mapping to DB rows?                        -> SQLAlchemy / Django models\n#\n# Decision rule:\n#   plain data + auto __init__/__repr__/__eq__         -> @dataclass\n#   immutable hashable value type                      -> @dataclass(frozen=True)\n#   sortable value type                                -> @dataclass(order=True)\n#   memory-tight, millions of instances                -> @dataclass(slots=True)\n#   inheritance with mixed defaults                    -> @dataclass(kw_only=True)\n#   need DB / API serialization round-trip             -> asdict / astuple\n#   real input validation needed                       -> Pydantic, not @dataclass\n#   tiny tuple-like pair                               -> NamedTuple\n#\n# Anti-pattern: defaulted parent fields blocking non-default child fields\n#   Inheriting from @dataclass class A: x: int = 0 and adding @dataclass\n#   class B(A): y: int raises \"non-default argument follows default\" because\n#   the generated __init__ would put y after x. Fix by giving y a default,\n#   moving x's default off, or using kw_only=True (3.10+) which sidesteps\n#   ordering entirely."
                  }
        ],
        tips: [
                  "Use field(default_factory=list) for mutable defaults — never use mutable as default= directly",
                  "@dataclass(frozen=True) creates immutable classes similar to namedtuple",
                  "__post_init__() runs after __init__ for computed fields or validation",
                  "asdict() and astuple() convert instances to dict/tuple for serialization"
        ],
        mistake: "Using mutable default in @dataclass: age: List[int] = [] shares the list across instances. Use field(default_factory=list) instead.",
        shorthand: {
          verbose: "try:\n    result = risky()\nexcept ValueError as e:\n    print(e)",
          concise: "try:\n    result = risky()\nexcept ValueError:\n    result = None",
        },
      },
    ],
  },
]

export default { meta, sections }
