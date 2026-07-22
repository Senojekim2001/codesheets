---
type: "moc"
title: "Decision Rules"
tags:
  - "python"
  - "moc"
  - "decision-rules"
  - "rag"
---

# Decision Rules

> Each entry's "Decision rule:" block — the dense knowledge that picks one tool over another. Optimized for RAG retrieval; each card here is a self-contained chunk.

## Core Syntax & Built-ins

### [[Sections/core/output/print|print()]]

```text
throwaway script / REPL / one-off debug   -> print()
library / framework / reusable module     -> logging.getLogger(__name__)
long-lived service / production           -> logging with structured handlers
error / warning to terminal               -> print(..., file=sys.stderr)
pipe-friendly CLI output (stdout)         -> print() (stdout is the data channel)
progress in long loop, unbuffered tty     -> print(..., flush=True) or tqdm
sub-millisecond hot loop                  -> sys.stdout.write() (skip print formatting)
```

### [[Sections/core/output/input|input()]]

```text
single line from interactive user         -> input(prompt)
masked password                           -> getpass.getpass()
piped stdin / batch script                -> sys.stdin.read() or for line in sys.stdin
line-by-line streaming input              -> for line in sys.stdin: line.rstrip("\n")
structured CLI args / flags               -> argparse / click / typer
rich TUI (menus, autocomplete)            -> prompt_toolkit or questionary
reading a file path                       -> open(path) — never input() for filenames in scripts
```

### [[Sections/core/output/isinstance|isinstance()]]

```text
"is this exactly type X?"                 -> type(x) is X (rare, usually wrong)
"is this X or a subclass?"                -> isinstance(x, X)
"any of several types"                    -> isinstance(x, (int, float))
"behaves like a sequence/mapping"          -> isinstance(x, collections.abc.Sequence)
static type narrowing for type checker    -> match-case or typing.TypeGuard
protocol / structural typing              -> typing.Protocol + isinstance with @runtime_checkable
need to dispatch on type                  -> functools.singledispatch (cleaner than chain of isinstance)
```

### [[Sections/core/output/getattr|getattr()]]

```text
attribute name known at write time        -> obj.attr (faster, type-checkable)
attribute name in a string variable       -> getattr(obj, name)
want safe lookup with fallback            -> getattr(obj, name, default)
need to test existence only               -> hasattr(obj, name) (sugar over getattr)
plugin / command dispatcher                -> getattr(self, command, None)
walking serialized data into objects      -> getattr + setattr in a loop
you find yourself typing many getattrs    -> reach for dataclass / __slots__ / Pydantic
```

### [[Sections/core/output/hasattr|hasattr()]]

```text
only need a yes/no answer                 -> hasattr(obj, name)
need the value too                        -> getattr(obj, name, sentinel) + check
checking duck-typed protocol              -> isinstance(obj, SomeProtocol) (clearer intent)
__getattr__ / property may have side fx   -> avoid hasattr; use try/except on real call
dataclass / Pydantic model field check    -> "name" in fields(obj) / model.model_fields
working with C extensions / mocks          -> getattr with default (hasattr can lie via __getattr__)
testing optional duck-typed callable       -> getattr(o, "close", None); if close: close()
```

### [[Sections/core/output/vars|vars()]]

```text
inspect a regular instance's attrs        -> vars(obj) (returns __dict__)
serialize a dataclass                     -> dataclasses.asdict(obj) (recursive, types ok)
serialize a Pydantic model                -> model.model_dump()
need methods + class attrs too            -> dir(obj) (not vars)
namespace inside current function         -> vars() / locals()
module's globals                          -> vars(module) / module.__dict__
__slots__ class                           -> getattr per name (no __dict__ exists)
```

### [[Sections/core/output/dir|dir()]]

```text
exploring an unfamiliar object in REPL    -> dir(obj)
programmatically discover methods         -> inspect.getmembers(obj, callable)
only public API                            -> [a for a in dir(obj) if not a.startswith("_")]
only this instance's attrs                -> vars(obj)
"what type is this?"                      -> type(obj) / isinstance(obj, X)
help on a function                         -> help(obj) / obj.__doc__
listing module exports                    -> module.__all__ (curated) > dir(module)
```

### [[Sections/core/output/sys-module|sys module]]

```text
trivial argv access in 5-line script      -> sys.argv[1:]
real CLI with flags, help, types          -> argparse / click / typer
end script after fatal error               -> sys.exit(1) (top-level scripts only)
stop a library function                   -> raise Exception (NEVER sys.exit)
read piped data                           -> sys.stdin
write progress / errors                   -> sys.stderr (keep stdout machine-readable)
guard for python version                  -> sys.version_info >= (3, 11)
tweak import path at runtime              -> sys.path.insert(0, ...) (last resort; prefer pkg install)
```

### [[Sections/core/output/os-module|os module]]

```text
any path manipulation in new code         -> pathlib.Path
read env var with default                 -> os.environ.get("KEY", default)
recursive directory walk                  -> Path.rglob("*") (or os.walk for control)
create dirs idempotently                  -> os.makedirs(p, exist_ok=True) / Path.mkdir(parents=True, exist_ok=True)
spawn subprocess                          -> subprocess.run (NOT os.system)
atomic file replace                       -> os.replace(src, dst)
temp dir / file                           -> tempfile module
string-based legacy API needs str path    -> os.path.join / os.fspath(path)
```

### [[Sections/core/builtins/len|len()]]

```text
list / tuple / str / set / dict           -> len(x) (O(1))
range / NumPy array / pandas Series        -> len(x) (still O(1))
generator / file iterator                  -> sum(1 for _ in it) (CONSUMES the iterator)
one-shot iterator you'll need later        -> list(it) first, then len()
custom class                               -> implement __len__
"is it empty?"                             -> if not container: (NOT len(c) == 0)
"more than N items?"                       -> any(True for _, _ in zip(it, range(N+1)))
```

### [[Sections/core/builtins/range|range()]]

```text
"do this N times" loop                    -> for _ in range(N):
need integer indices 0..N-1               -> for i in range(N):
need index AND value of a list            -> for i, x in enumerate(lst): (NOT range(len(lst)))
counting down                              -> range(n, -1, -1) or reversed(range(n+1))
numeric ranges with floats                 -> numpy.arange / numpy.linspace (range is int-only)
build a list of integers                  -> list(range(n))
testing membership in arithmetic seq      -> x in range(...) (O(1))
```

### [[Sections/core/builtins/sum-min-max|Numeric built-ins]]

```text
add up numbers in iterable                -> sum(iterable) (NOT reduce(+, ...))
smallest / largest by natural order       -> min(it) / max(it)
smallest / largest by computed key        -> min(it, key=fn)
need top-K, not just one                  -> heapq.nlargest(k, it) / nsmallest
absolute value                             -> abs(x)
round to N decimals                       -> round(x, n) (banker's rounding!)
need round-half-up always                 -> int(x + 0.5) for positives or decimal.ROUND_HALF_UP
modular exponentiation                    -> pow(base, exp, mod) (huge perf win for crypto)
```

### [[Sections/core/builtins/any-all|any() / all()]]

```text
"at least one passes"                     -> any(cond(x) for x in it)
"every one passes"                        -> all(cond(x) for x in it)
need the matching item, not just bool     -> next((x for x in it if cond), default)
short-circuit on huge iterable            -> any/all with GENERATOR (not list comp!)
combine multiple conditions on one item   -> all([c1, c2, c3]) on already-eval'd values
bool-array reduction in NumPy             -> arr.any() / arr.all() (vectorized)
"no item passes"                          -> not any(cond(x) for x in it)
```

### [[Sections/core/builtins/enumerate|enumerate()]]

```text
need index AND value of an iterable       -> enumerate(it) (NOT range(len))
1-based numbering for display             -> enumerate(it, start=1)
need value only                            -> for x in it (no enumerate)
need index only                            -> for i in range(len(lst)) (rare; usually enumerate)
pair items between two lists               -> zip(a, b) (not enumerate of indices)
reverse-lookup dict                       -> {v: i for i, v in enumerate(lst)}
first index satisfying predicate           -> next((i for i, x in enumerate(it) if pred(x)), -1)
```

### [[Sections/core/builtins/zip|zip()]]

```text
parallel iteration over equal-length seqs -> zip(a, b)
want to fail fast if lengths differ        -> zip(a, b, strict=True) (3.10+)
pad shorter side with default              -> itertools.zip_longest(a, b, fillvalue=...)
build dict from keys, values lists         -> dict(zip(keys, vals))
transpose rows<->cols                     -> zip(*rows)
need only one element from each iterable  -> next(zip(it1, it2, ...))
numeric vectorization                      -> NumPy / pandas, NOT zip in a Python loop
```

### [[Sections/core/builtins/map-filter-sorted|sorted()]]

```text
transform every item                       -> [f(x) for x in it] (list comp, not map)
filter items by predicate                  -> [x for x in it if pred(x)]
transform + filter combined                -> [f(x) for x in it if pred(x)]
sort, return new list                      -> sorted(it, key=...)
sort in place (mutate)                     -> lst.sort(key=...)
need top-k items only                      -> heapq.nlargest(k, it, key=...) (faster than sort)
already-callable as key (e.g. attr/index) -> operator.itemgetter / attrgetter (faster than lambda)
sorting numeric arrays                     -> NumPy np.sort / np.argsort (vectorized)
```

### [[Sections/core/control/if-elif-else|if statement]]

```text
2 branches, simple values                  -> ternary x if cond else y
3+ branches, simple value table            -> dict lookup table.get(key, default)
3+ branches with logic per branch          -> if / elif / else
pattern match on shape (3.10+)             -> match / case
short-circuit "x or default"               -> only when 0/""/[] should also default
None-safe default                          -> x if x is not None else default
range check                                -> chained comparison: low <= x <= high
complex predicate reused 5+ places         -> def is_valid(x): ... (function, not nested ifs)
```

### [[Sections/core/control/ternary|Ternary expression]]

```text
simple value selection                     -> x if cond else y
inside f-string / comprehension            -> ternary (the only option)
need to call functions with side effects   -> if / else statement (not ternary)
2+ levels of nesting tempting              -> dict lookup or refactor to function
default for None                           -> x if x is not None else default
default for "any falsy"                    -> x or default
3-way decision                             -> if / elif / else, NOT chained ternary
value depends on type/shape                -> match / case (3.10+)
```

### [[Sections/core/control/walrus|Walrus operator :=]]

```text
read-loop: while (chunk := f.read(N)):    -> walrus (cleanest pattern)
regex match + use:  if (m := re.search): -> walrus (avoids double match)
filter + transform in one comprehension   -> walrus to compute once
plain assignment outside expression       -> regular = (no walrus)
need value across many lines               -> regular assignment for clarity
complex test inside listcomp filter        -> walrus, or extract to helper function
condition that doesn't need the value      -> just if / while (no walrus)
```

### [[Sections/core/control/for-loop|for loop]]

```text
iterate items of any iterable              -> for x in iterable
need index too                             -> for i, x in enumerate(iterable)
parallel iteration                         -> for a, b in zip(A, B)
build a list                                -> [f(x) for x in it] (comprehension)
build a dict                                -> {k: v for k, v in pairs}
accumulate / reduce                         -> sum, max, min, functools.reduce
loop until success / search                -> use for/else; else runs when no break
modify collection during loop               -> iterate over copy: lst[:] (or rebuild)
numerical work over large array             -> NumPy vectorized op (NOT for-loop)
```

### [[Sections/core/control/while-loop|while loop]]

```text
known iteration count                      -> for x in range(N) / for x in iterable
condition-controlled, unknown count        -> while cond
"retry until valid"                        -> while True: ... if ok: break
"drain until empty"                        -> while container: container.pop()
read in chunks                             -> while (chunk := f.read(N)): (walrus)
poll with timeout                          -> while time.monotonic() < deadline
server / event loop main loop              -> framework's run() / while True with handlers
numeric convergence                        -> while abs(new - old) > tol
```

### [[Sections/core/control/match-case|match statement]]

```text
structural decomposition (tuple/dict shape) -> match / case
parsing AST / network messages / events    -> match / case (designed for this)
class-based dispatch with attribute capture -> match Class(attr=val) syntax
simple value lookup / dispatch             -> dict {value: handler} (faster, simpler)
2-3 equality branches                      -> if / elif (less ceremony)
want exhaustive enum match w/ checker      -> match on Enum (mypy can warn missing cases)
need fall-through (C switch behaviour)     -> NOT match — Python has no fall-through
pre-3.10 codebase                          -> stuck with if / elif
```

### [[Sections/core/functions/def|def]]

```text
3+ lines of logic, reused                  -> def function (named, testable)
one expression, used once inline           -> lambda
group state + behavior                     -> class
pure data record, no behavior              -> @dataclass / NamedTuple
immutable record + validation              -> @dataclass(frozen=True) or Pydantic
need polymorphic behavior                  -> ABC / Protocol
parameter-less factory / builder           -> def make_X() -> X
async I/O                                  -> async def
```

### [[Sections/core/functions/args-kwargs|*args / **kwargs]]

```text
variable-length numeric / sequence input   -> *args
variable-length config / options           -> **kwargs
forwarding to wrapped function             -> *args, **kwargs (decorators)
force "boolean must be named"              -> def f(x, *, verbose=False)
forbid "value passed positionally"         -> bare * before kwargs
API where order shouldn't matter            -> all keyword-only after *
mostly-fixed signature, occasional extras   -> name params, *args for tail
spreading a list / dict into a call         -> f(*lst) / f(**d)
```

### [[Sections/core/functions/lambda|lambda]]

```text
sort key / max key / min key               -> lambda x: x.attr (or itemgetter / attrgetter)
one-shot callback to map / filter          -> lambda (or skip map and use list comp)
GUI button / event handler one-liner       -> lambda
pandas .apply on a single column           -> lambda row: row.x + row.y (vectorize if possible)
needs a docstring / multiple statements    -> def named function
you're tempted to assign `f = lambda ...`  -> use def f(...) instead
simple attribute / index getter            -> operator.attrgetter / itemgetter (faster)
```

### [[Sections/core/functions/generators|Generators]]

```text
producing items lazily, one at a time      -> generator function (yield)
one-line transform of an iterable          -> generator expression (... for ...)
build a real list                           -> list comprehension [...]
build a real dict / set                     -> dict / set comprehension
stream data through stages                  -> chain of generators (pipeline pattern)
need random access / len() / multiple passes -> list (NOT generator)
async stream of values                      -> async generator (async def + yield)
need to send values back in (coroutine)     -> generator.send() (rare; usually use async)
```

### [[Sections/core/functions/decorators|Decorators]]

```text
cross-cutting concern (logging/timing/auth) -> decorator
need state across calls (counter, cache)    -> class-based decorator OR functools.lru_cache
need parameters at decoration time          -> 3-level nested factory(args)(fn)(...)
memoize pure function                       -> @functools.lru_cache / @cache (3.9+)
register handler with framework             -> framework decorator (@app.route, @pytest.fixture)
add behavior to a class                     -> @classmethod / @staticmethod / @property / class decorator
one-off temporary wrapping                   -> just call fn explicitly (no decorator)
need to preserve sig + docstring            -> @functools.wraps(fn) inside wrapper (always)
```

### [[Sections/core/functions/closures|Closures]]

```text
factory function returning specialized fn  -> closure (def make_X(cfg): def f(...))
stateful counter / accumulator             -> closure with nonlocal (or class)
memoization                                -> @functools.lru_cache (cleaner than manual closure)
callback that needs config                 -> closure (or functools.partial)
multiple methods + state                   -> class (NOT a closure)
capturing loop variable into lambda         -> closure with default arg `lambda x=x: x`
need to reassign captured var               -> nonlocal x
capturing module-level var to mutate       -> global x (rare; usually refactor)
```

### [[Sections/core/functions/global-nonlocal|global / nonlocal]]

```text
reassign module-level variable             -> global (rare; consider a class first)
reassign enclosing function's variable     -> nonlocal
only READING outer variable                -> no declaration needed
storing config / singleton at module level -> module-level constant + accessor function
shared mutable state                       -> class instance (NOT global)
caching across calls                       -> functools.lru_cache (NOT a global dict)
recursive function w/ accumulator           -> pass param down (NOT global / nonlocal)
need to expose for tests to reset           -> module attr accessed via module.X = ...
```

### [[Sections/core/data-types/list|list]]

```text
ordered, mutable, mixed types               -> list
ordered, immutable record                   -> tuple / NamedTuple
homogeneous numeric data                    -> array.array / NumPy ndarray
queue / stack with O(1) ends               -> collections.deque
unique items only                           -> set
key-value lookups                           -> dict
fixed schema records                        -> @dataclass / TypedDict
build by appending in a loop                -> list (then convert if needed)
filter / transform pattern                  -> [expr for x in it if cond] (NOT loop+append)
```

### [[Sections/core/data-types/unpacking|Unpacking]]

```text
destructure tuple / list of known shape    -> a, b, c = items
capture trailing items                      -> first, *rest = items
capture leading items                       -> *init, last = items
capture middle, ignore ends                 -> _, *middle, _ = items
iterate (idx, val) pairs                    -> for i, v in enumerate(...)
forward args to wrapped function            -> f(*args, **kwargs)
merge dicts (3.5+)                          -> {**d1, **d2}
merge dicts (3.9+)                          -> d1 | d2 (newer, cleaner)
```

### [[Sections/core/data-types/dict|dict]]

```text
key-value lookup, generic data              -> dict
key MUST be present (else bug)              -> d[key] (raises KeyError = good)
key MAY be missing, want default            -> d.get(key, default)
group-by pattern (key -> list)              -> collections.defaultdict(list)
counting occurrences                        -> collections.Counter
ordered insertion + LRU semantics            -> collections.OrderedDict (or LRUCache)
typed record with fixed schema              -> @dataclass / TypedDict / Pydantic
string keys at module scope (config)        -> dict OK; constants in CapsConst
immutable / hashable mapping                 -> types.MappingProxyType / frozendict
```

### [[Sections/core/data-types/dict-comprehension|Dict comprehension]]

```text
build dict from iterable of pairs           -> {k: v for k, v in pairs} or dict(pairs)
transform values, keep keys                 -> {k: f(v) for k, v in d.items()}
filter dict by predicate                    -> {k: v for k, v in d.items() if cond}
invert dict (values must be unique)         -> {v: k for k, v in d.items()}
group items by computed key                 -> defaultdict(list) loop (NOT a comp)
simple two-list zip                         -> dict(zip(keys, values))
merge two dicts                              -> d1 | d2 (3.9+) or {**d1, **d2}
build O(1) lookup index                     -> {item.id: item for item in items}
```

### [[Sections/core/data-types/tuple|tuple]]

```text
fixed-size record with known meaning         -> tuple (or NamedTuple if 3+ fields)
need to use as dict key / set member         -> tuple (lists not hashable)
returning multiple values                    -> tuple (Python's idiom)
permanent immutable collection               -> tuple
collection that may grow / be edited         -> list
typed record with field names                 -> typing.NamedTuple / @dataclass
numeric vector                                -> NumPy ndarray
single value "for now"                       -> just the value, NOT (value,)
```

### [[Sections/core/data-types/namedtuple|namedtuple]]

```text
immutable record, no methods, want type hints -> typing.NamedTuple (modern)
immutable record, no type hints, legacy code  -> collections.namedtuple
need mutation / post-init / __slots__         -> @dataclass
need validation + serialization               -> Pydantic BaseModel
ad-hoc 2-3 fields, never reused              -> plain tuple
needs hashable + comparable for set/dict       -> NamedTuple or @dataclass(frozen=True)
inheritance hierarchy                          -> regular class (NamedTuple inheritance is awkward)
purely structural, never instantiated          -> TypedDict / Protocol
```

### [[Sections/core/data-types/set|set]]

```text
deduplicate items                            -> set(iterable)
fast membership check in a loop              -> set (O(1) vs list O(n))
set algebra: union/intersection/diff         -> {a} | {b}, {a} & {b}, {a} - {b}
need ordered + unique                        -> dict.fromkeys(iter) (preserves order)
need hashable / immutable set                 -> frozenset
counting items                                -> collections.Counter (NOT set)
key-to-value mapping                          -> dict (NOT set of tuples)
numeric data with set ops                     -> NumPy / pandas (vectorized)
```

### [[Sections/core/data-types/set-comprehension|Set comprehension]]

```text
simple dedupe of an iterable                  -> set(iterable) (no comprehension needed)
dedupe + transform                            -> {f(x) for x in it}
dedupe + filter                               -> {x for x in it if cond}
flatten + dedupe                              -> {v for row in m for v in row}
need to preserve insertion order              -> list(dict.fromkeys(iterable))
elements are unhashable (lists, dicts)        -> convert to tuple first
building dict, not set                        -> {k: v for ...} (dict comp, not set comp)
piping into another aggregation               -> generator expression (no braces)
```

### [[Sections/core/data-types/fstrings|f-strings]]

```text
any new code, single string                  -> f-string f"{x}"
debugging quick print                        -> f"{x=}" (3.8+)
logging library messages                     -> NEVER f-string; use logger.info("...%s", x)
user-controlled input (SQL/HTML/shell)       -> NEVER format; use parameterized API
template stored in config / DB / file        -> str.format() / Jinja (f-strings need source)
joining many pieces                          -> "".join(parts) (NOT += in loop)
percent formatting on legacy code            -> "%s" % val (still common, legacy only)
numeric / date formatting                    -> f"{n:,.2f}" / f"{dt:%Y-%m-%d}"
long template, many fields                   -> str.format() with named placeholders
```

### [[Sections/core/data-types/str-methods|str methods]]

```text
tokenize on whitespace                       -> s.split() (no arg, smart)
tokenize on a single char                    -> s.split(",")
tokenize on regex / multi-pattern            -> re.split(r"[,;]", s)
build string from list                        -> sep.join(parts) (NEVER += in loop)
strip whitespace ends                         -> s.strip() / lstrip / rstrip
strip a known prefix / suffix                 -> s.removeprefix() / .removesuffix() (3.9+)
substring exists?                             -> "x" in s (NOT s.find(...) >= 0)
pattern test, not just literal                -> re.search (NOT str.replace / find)
case-insensitive equality                     -> s.lower() == t.lower() / s.casefold()
normalize multiple spaces to one              -> " ".join(s.split())
```

### [[Sections/core/data-types/re-module|re module]]

```text
simple literal contains check                 -> "x" in s (NOT regex)
replace fixed substring                       -> s.replace(old, new)
match anywhere in string                      -> re.search
match start of string only                    -> re.match (anchor-implicit)
match whole string                             -> re.fullmatch
all non-overlapping matches                   -> re.findall / re.finditer
substitute by pattern                         -> re.sub
reused pattern in hot path                    -> re.compile once, then .search() on it
parse structured grammar                       -> a real parser (lark / pyparsing), NOT regex
match case-insensitive                        -> re.IGNORECASE flag
```

### [[Sections/core/data-types/type-hints|Type hints]]

```text
any new Python code                          -> add type hints from day one
list / dict / tuple / set                    -> built-in generics list[int] (3.9+)
"either X or Y"                              -> X | Y (3.10+) (NOT Union)
"X or None"                                  -> X | None (NOT Optional[X])
structural duck typing                        -> typing.Protocol
dict with known keys + types                  -> typing.TypedDict
generic function                              -> def f[T](x: T) -> T (3.12+) or TypeVar
forward references / circular import          -> "from __future__ import annotations" + quoted strings
need runtime enforcement                      -> Pydantic / attrs (NOT type hints alone)
throwaway script, prototype                   -> hints optional but recommended
```

### [[Sections/core/data-types/abc|Abstract Base Classes]]

```text
define a contract you control + enforce      -> ABC + @abstractmethod
define a contract for code you DON'T own     -> typing.Protocol (structural, duck-typed)
need shared concrete behavior in base         -> ABC (mixed concrete/abstract methods)
isinstance check on duck-typed protocol      -> collections.abc (Iterable, Mapping, ...)
want abstract property                        -> @property + @abstractmethod
simple "must implement X"                     -> ABC, but consider Protocol first
need exhaustive type checking                  -> Protocol with @runtime_checkable
plugin / driver pattern                        -> ABC if registry-based, Protocol if duck
```

### [[Sections/core/stdlib/itertools|itertools]]

```text
"joined sequences"             -> it.chain / chain.from_iterable
"first N / slice"              -> it.islice (works on ANY iterable; not just lists)
"all unordered subsets"        -> it.combinations
"all ordered subsets"          -> it.permutations
"all assignments to N slots"   -> it.product (with repeat=)
"running sum / running max"    -> it.accumulate
"consecutive duplicates"       -> it.groupby (sort first if you want all matches)
"batch into pages"             -> chunked recipe above
"branch one stream"            -> it.tee (watch memory; bounded by lag)
```

### [[Sections/core/stdlib/collections-deque|collections.deque]]

```text
queue / BFS                    -> deque (popleft = O(1); list = O(n))
sliding window of size N       -> deque(maxlen=N)
"last N items" (logs, errors)  -> deque(maxlen=N) feeding from a stream
stack only                     -> list (append/pop are both O(1))
index lookups d[i]             -> list (deque is O(n) at the middle)
thread-safe FIFO               -> queue.Queue (deque ops are atomic but compound steps aren't)
```

### [[Sections/core/stdlib/functools|functools]]

```text
memoize a pure function                  -> @functools.cache (or @lru_cache(maxsize=N) to bound memory)
memoize on the instance (one-shot)        -> @functools.cached_property
memoize an instance method                -> NOT @lru_cache (keeps self alive). Roll your own with WeakValueDictionary OR put state on the instance.
"this class needs all comparison ops"     -> @functools.total_ordering + __eq__ + __lt__
type-based dispatch                       -> @functools.singledispatch / singledispatchmethod
bind some args of a function              -> functools.partial (functools.partialmethod for classes)
write a decorator                         -> @functools.wraps(fn) on the wrapper, ALWAYS
bridge a 3-way compare(a,b)              -> functools.cmp_to_key
```

### [[Sections/core/stdlib/datetime|datetime module]]

```text
storage / serialization              -> UTC, ISO 8601, with offset (+00:00)
display to user                      -> astimezone(ZoneInfo("Region/City"))
arithmetic across DST                -> compute in UTC, convert at the end
parse ISO from external source       -> datetime.fromisoformat (Z handling: 3.11+ free; older replace Z->+00:00)
parse free-form text                 -> python-dateutil.parser.parse  (NOT regex + strptime)
schedule jobs                        -> store cron in UTC; render in user's tz; test DST boundary
"right now"                          -> datetime.now(timezone.utc)  (NOT datetime.utcnow — naive)
```

### [[Sections/core/stdlib/json-module|json module]]

```text
small payload, stdlib only         -> json.dumps / json.loads
non-serializable types             -> default= callable, OR custom JSONEncoder
monetary / scientific precision    -> parse_float=Decimal on the way in
hot path (>10MB/s)                 -> orjson (3-10x faster) or msgspec (50x with schema)
huge file (won't fit in memory)    -> ijson; iterate items
write a config file safely          -> atomic_write_json (tmp + fsync + replace)
schema validation                  -> pydantic / msgspec (NOT json+isinstance towers)
```

### [[Sections/core/stdlib/copy-module|copy module]]

```text
never mutate the input                  -> NO copy needed (preferred)
shallow update of dict/list             -> {**d, "k": v}  /  [*xs, new]
immutable record update                 -> dataclasses.replace(obj, x=...)
nested mutables, brief copy             -> copy.deepcopy
resource-holding object                 -> implement __copy__ / __deepcopy__
pickle-able structure, hot path         -> pickle.loads(pickle.dumps(x)) is faster than deepcopy on numeric / dataclass trees
cyclic graph                            -> __deepcopy__ with memo[id(self)] = new
```

### [[Sections/core/stdlib/bytes|bytes]]

```text
small fixed-size record               -> struct.pack / unpack
variable-length records on a stream    -> length prefix + struct + memoryview slicing
building bytes in a loop              -> io.BytesIO  (NOT b += part)
"transmit binary as text" (JSON/email)-> base64.b64encode / b64decode
parse hex strings                     -> bytes.fromhex (and .hex() to emit)
tolerate decode errors                -> errors="replace" for logs, "strict" for data
need to mutate                        -> bytearray (see next entry)
parsing many records, performance      -> memoryview + struct.unpack_from (no copies)
```

### [[Sections/core/stdlib/bytearray|bytearray]]

```text
immutable wire data                 -> bytes
build binary in chunks               -> bytearray + extend (NOT b += chunk)
pre-sized scratch                    -> bytearray(N); recv_into / readinto
parse without copies                 -> memoryview over bytearray; release before mutate
file -> binary munging               -> mmap (read-only) or bytearray + readinto (writable)
"string builder" for text            -> WRONG tool; use list+"".join or io.StringIO
```

### [[Sections/core/stdlib/pathlib|pathlib.Path]]

```text
any new code involving paths               -> pathlib.Path
atomic file writes / symlink safety        -> see filesystem.js senior tiers
file shipped with your package             -> importlib.resources (NOT __file__-relative)
filtering many entries                      -> os.scandir for speed; pathlib for readability
reject path traversal                       -> resolve() + check ancestor relationship
cross-platform path display                 -> str(p) (forward slashes on Windows: use as_posix())
```

### [[Sections/core/stdlib/builtin-exceptions|Built-in exceptions]]

```text
exact failure mode you expect           -> catch the specific class (ValueError, KeyError)
any I/O failure                         -> except OSError  (parent of FileNotFoundError + PermissionError + ...)
re-raising with cause                   -> raise NewError(...) from e
ignore one specific failure             -> contextlib.suppress(ExcType)
fan-out (TaskGroup, gather)             -> except* ExcGroup (3.11+)
shutdown / interrupt                     -> CATCH KeyboardInterrupt explicitly if you want to act,
                                           otherwise let it propagate
silence everything                       -> NEVER. except Exception: pass is a bug magnet.
```

### [[Sections/core/stdlib/with-statement|with statement]]

```text
resource that needs cleanup            -> with statement (NOT try/finally)
variable number of resources            -> contextlib.ExitStack
async resource (DB pool, HTTP client)   -> async with X() as y
"if file is missing, just skip"          -> contextlib.suppress(FileNotFoundError)
custom resource type                     -> __enter__/__exit__ class OR @contextmanager
need to retry / handle errors            -> try/except INSIDE the with block, NOT around it
```

### [[Sections/core/stdlib/exceptions|Exception handling]]

```text
single failure mode you understand     -> catch the specific exception class
"any I/O failure"                       -> except OSError (parent of FNF + Permission + ...)
re-raise with cause                    -> raise NewError(...) from e (NOT bare raise NewError)
"ignore this specific miss"             -> contextlib.suppress(ExcType) — documents intent
fan-out (gather/TaskGroup)              -> ExceptionGroup + except* (3.11+)
want callers to retry vs abort         -> separate exception classes (Transient vs Fatal)
silence everything                     -> NEVER. except Exception: pass is a bug magnet
```

### [[Sections/core/stdlib/main-guard|__name__ == "__main__"]]

```text
any script that may also be imported    -> if __name__ == "__main__": guard, ALWAYS
reusable + testable script               -> wrap in main(argv=None) -> int
ship as a binary                          -> pyproject [project.scripts] entry point
"python -m mypkg" support                -> mypkg/__main__.py that imports + calls main
error exit code                          -> raise SystemExit(main())
```

### [[Sections/core/stdlib/pathlib-module|pathlib (Path Objects)]]

```text
one-off path manipulation              -> pathlib (avoid os.path)
parsing path strings from another OS    -> PurePosixPath / PureWindowsPath
walk a tree                            -> Path.rglob (or os.scandir for speed)
atomic write / fsync / sandbox          -> see filesystem.js senior tiers
per-package data files                  -> importlib.resources (NOT __file__-relative)
tight loop scanning many files          -> os.scandir + DirEntry (no Path allocations)
```

### [[Sections/core/stdlib/functools-partial-cache|functools (partial, lru_cache, reduce)]]

```text
memoize a pure function           -> @cache (or @lru_cache(maxsize=N) to bound memory)
memoize on the instance           -> @cached_property  (NOT @lru_cache; leaks self refs)
type-based dispatch                -> @singledispatch / singledispatchmethod
bind some args                    -> functools.partial (partialmethod for classes)
write a decorator                 -> @functools.wraps(fn) on the wrapper, ALWAYS
bridge a 3-way compare(a,b)       -> functools.cmp_to_key
```

### [[Sections/core/stdlib/collections-counter-deque|collections (Counter, defaultdict, deque, namedtuple)]]

```text
counting / frequency / multiset arithmetic    -> Counter
group-by / "dict of lists or sets"            -> defaultdict(list / set)
FIFO queue / sliding window                    -> deque (see earlier entry)
layered lookup (env > file > defaults)        -> ChainMap (no copying)
simple typed record, immutable                -> @dataclass(frozen=True, slots=True) (preferred)
                                                 OR typing.NamedTuple (typed namedtuple)
ordered dict                                   -> regular dict (insertion order is guaranteed since 3.7)
```

### [[Sections/core/stdlib/context-managers-with|Context Managers (with statement)]]

```text
resource that needs cleanup           -> with statement
small one-off CM                       -> @contextmanager generator
class-shaped CM with state             -> __enter__/__exit__ class
variable count of resources            -> contextlib.ExitStack
async resource (DB pool, HTTP client)  -> @asynccontextmanager + async with
"if it fails, just skip"                -> contextlib.suppress(SpecificExc)
capture stdout/stderr                  -> contextlib.redirect_stdout / redirect_stderr
nullable CM (sometimes None)           -> contextlib.nullcontext
```

### [[Sections/core/stdlib/itertools-module|itertools (Combinations, Permutations, Chain)]]

```text
join sequences                        -> chain / chain.from_iterable
slice any iterable                    -> islice
all unordered subsets                 -> combinations
all ordered subsets                   -> permutations
nested loops over multiple ranges     -> product (with repeat= for grid search)
running sum / running max             -> accumulate
consecutive duplicates                -> groupby (sort first if you want all matches)
adjacent pairs                        -> pairwise (3.10+)
batch / chunk                         -> islice in a while loop OR more_itertools.chunked
branch one stream                     -> tee (watch memory if branches advance unevenly)
```

### [[Sections/core/stdlib/re-module-regex|re Module (Regular Expressions)]]

```text
reused pattern in hot path                 -> re.compile + UPPER_CASE module constant
validator (whole string must match)        -> re.fullmatch with re.ASCII for protocol fields
extractor (data out of text)               -> re.finditer + named groups + dataclass
replacement with computed text             -> re.sub(pattern, callable, s) — NOT raw r"\1" with untrusted input
simple split on multi-char delimiter       -> re.split (not str.split)
parsing JSON / HTML / SQL / email          -> NOT regex; use a real parser (json, lxml, sqlglot, email)
user-supplied pattern                      -> 'regex' library with timeout= or reject
case-insensitive across alphabets          -> re.IGNORECASE | re.UNICODE; or s.casefold()
```

### [[Sections/core/stdlib/logging-module|logging Module]]

```text
tiny script                              -> logging.basicConfig
service / multi-module                   -> dictConfig + getLogger(__name__)
structured fields, JSON sink              -> structlog (see packaging.js)
correlation across async                 -> structlog.contextvars + contextvars
multi-process forking server              -> QueueHandler/QueueListener
PII / tokens in payloads                  -> redaction processor BEFORE the renderer
```

### [[Sections/core/stdlib/argparse-cli|argparse (Command-Line Arguments)]]

```text
stdlib-only tool                      -> argparse
typed surface, decorator style         -> Typer (see cli.js)
plug-in registry / entry_points        -> Click (see cli.js)
completions, REPL, complex UX          -> Click / Typer ship them; argparse needs argcomplete
```

### [[Sections/core/stdlib/typing-module-hints|typing Module (Type Hints)]]

```text
greenfield code                      -> 'from __future__ import annotations' + X | Y syntax + built-in generics
gradual typing on legacy code         -> per-module mypy overrides; tighten one module at a time
runtime validation                   -> Pydantic / msgspec / dataclasses-json; type hints alone don't enforce
structural duck typing               -> Protocol (NOT ABC unless you need register())
type-driven dispatch                 -> @functools.singledispatch
```

## Pandas

### [[Sections/pandas/io/dataframe-constructor|pd.DataFrame()]]

```text
Wide table, fixed schema                  -> dict of lists or dict of arrays
Streaming records (one at a time)         -> list of dicts, then DataFrame(...)
Need typed integers with nulls            -> pin dtype="Int64" (capital I, nullable)
Low-cardinality string column              -> dtype="category" (10-100x memory win)
Tight memory                               -> from_records + .astype({...}) up front
Coming from sklearn/numpy                  -> pd.DataFrame(arr, columns=[...])
Need known-shape empty frame               -> pd.DataFrame(columns=[...], dtype=...)
```

### [[Sections/pandas/io/series-constructor|pd.Series()]]

```text
Numeric column from list                  -> pd.Series(values) (numpy default)
Need null support on integers              -> pd.Series(..., dtype="Int64")
Strings with frequent missing               -> dtype="string" (StringDtype, nullable)
Boolean with NaN                            -> dtype="boolean" (NOT bool — bool can't hold NA)
Datetime column                             -> pd.to_datetime(values, utc=True)
Index-aligned arithmetic with another Series -> set the same .index on both
One-off scalar broadcast                     -> pd.Series(scalar, index=existing.index)
```

### [[Sections/pandas/io/read-csv|pd.read_csv()]]

```text
< 100 MB, ad-hoc                           -> pd.read_csv(path) (defaults are fine)
Big file, only need some columns           -> usecols=[...] (skips parsing other cols)
Tight memory                                -> dtype={...} + chunksize=N
Mixed/dirty data                            -> on_bad_lines='skip', engine='python'
Speed > flexibility                         -> engine='pyarrow' (~3-10x faster on wide data)
Need full datetime control                  -> parse_dates=[...] + date_format=...
File too big for one machine                -> dask.read_csv or polars.read_csv_batched
Need to preserve types exactly              -> use parquet, not CSV
```

### [[Sections/pandas/io/read-excel|pd.read_excel()]]

```text
Single sheet, defaults                     -> pd.read_excel(path)
Pick a specific sheet                       -> sheet_name="Q4" (or index)
ALL sheets at once                          -> sheet_name=None -> dict[name, DataFrame]
Skip the title rows                         -> header=N or skiprows=N
Performance matters / cross-platform        -> openpyxl explicit; calamine for >5x speed
Output back to Excel                        -> df.to_excel(..., engine="openpyxl")
Multiple frames -> one workbook             -> pd.ExcelWriter(path) + multiple to_excel calls
Truly large data                            -> stop using Excel; switch to parquet/csv
```

### [[Sections/pandas/io/read-sql|pd.read_sql()]]

```text
Quick SELECT                                -> pd.read_sql(sql, conn)
Whole table                                  -> pd.read_sql_table(name, engine)
Big result set                                -> chunksize=10000 + concatenate (or stream)
Pinned dtypes                                 -> dtype={...} on read or .astype after
Parameterized query                           -> params={"id": 7} (NEVER f-string)
Speed at scale                                -> connectorx (pip install) — 5-10x faster
Want a DataFrame, want SQLAlchemy 2.0         -> session.execute(stmt) + .df() helpers
Already have polars/duckdb in the stack      -> read directly there; faster + saner
```

### [[Sections/pandas/io/read-parquet|pd.read_parquet()]]

```text
Modern columnar store                       -> parquet over CSV every time
Need only some columns                      -> columns=[...] (zero IO for the rest)
Partitioned dataset                         -> pd.read_parquet(dir/, filters=[...])
Speed-critical                               -> engine="pyarrow" (default) over fastparquet
Need to roundtrip categorical dtypes        -> parquet preserves them; CSV doesn't
Cloud (S3 / GCS)                             -> pd.read_parquet("s3://...") (uses fsspec)
Cross-process pipeline                       -> parquet is the canonical handoff format
Need row-by-row streaming                    -> use pyarrow.dataset directly, not pandas
```

### [[Sections/pandas/io/dtype-opt|dtype optimization]]

```text
Object column, < ~50% unique values         -> .astype("category") (often 10-100x smaller)
Integer with no nulls, fits in 32 bits      -> downcast to "int32" or "int16"
Float that doesn't need 15-digit precision  -> "float32"
Integer with nulls                           -> "Int64" (nullable; preserves NaN)
String columns                               -> "string" dtype (PyArrow-backed at scale)
Booleans with missing                        -> "boolean" (NOT bool)
Profiling memory before/after                -> df.memory_usage(deep=True).sum()
Final-arrow-of-truth at scale                -> dtype_backend="pyarrow" on read
```

### [[Sections/pandas/io/pd-eval|pd.eval()]]

```text
- frame >= 100k rows AND expression has >=3 operators -> try eval
- need a function call (log, abs, where, ...) -> stay with pandas
```

### [[Sections/pandas/io/chunked-processing|Chunked processing]]

```text
File fits in RAM with headroom              -> read once, process whole frame
File is 1-10x your RAM                       -> chunksize= + accumulate stats
File >> RAM                                  -> dask.dataframe or polars LazyFrame
Need to write back chunked results          -> chunksize on read + append parquet partitions
Per-chunk aggregation                        -> reduce in the loop, never materialize full df
Need joins across chunks                     -> step up to duckdb (read_csv_auto) or polars
Bottleneck is parsing                        -> engine="pyarrow" first, chunked second
File is JSON / nested                        -> pd.read_json(lines=True, chunksize=N)
```

### [[Sections/pandas/inspection/info|.info()]]

```text
Quick null/dtype overview                   -> df.info()
Memory usage with object content            -> df.info(memory_usage="deep")
Wide DataFrame (>100 cols)                  -> df.info(verbose=False) or df.dtypes.value_counts()
Need only column dtypes                      -> df.dtypes (a Series)
Need null counts numerically                  -> df.isna().sum()
Programmatic schema inspection                -> df.columns + df.dtypes (skip info text)
Across many DataFrames                        -> stash df.dtypes; diff between schemas
```

### [[Sections/pandas/inspection/describe|.describe()]]

```text
Default numeric summary                     -> df.describe()
Include object/string columns               -> df.describe(include="all")
Only categoricals                            -> df.describe(include="category")
Custom percentiles                            -> percentiles=[.05, .5, .95]
Robust to outliers                            -> use .quantile([.01, .99]) explicitly
Time series (datetime)                        -> describe(datetime_is_numeric=True)
Group-wise summary                            -> df.groupby(g).describe()
Profile a whole dataset                       -> ydata-profiling / sweetviz, not describe
```

### [[Sections/pandas/inspection/value-counts|.value_counts()]]

```text
Frequency table, descending                 -> s.value_counts()
Proportions instead of counts                -> normalize=True
Include NaN counts                            -> dropna=False
Bucketed numeric column                       -> bins=N (auto pd.cut equivalent)
Sort by index instead of count                -> .value_counts().sort_index()
Top-N only                                    -> .value_counts().head(N)
Multi-column combos                           -> df.value_counts(["a","b"]) (pandas 1.1+)
Group-aware                                   -> df.groupby(g)[col].value_counts()
```

### [[Sections/pandas/inspection/head-tail|.head() / .tail()]]

```text
Quick peek at the start                     -> df.head() (default 5)
Peek at the end                              -> df.tail()
Sampling instead of edges                    -> df.sample(n=10) (random middle rows)
Need a quick row by id                        -> df.loc[id]; head/tail is positional
Verify after sort                             -> df.sort_values(...).head(N)
Inspecting a Series                           -> s.head() / s.tail()
Slicing a chunk                               -> df.iloc[a:b] (more explicit than head)
Wide DataFrame, want columns too              -> df.head().T to flip orientation
```

### [[Sections/pandas/inspection/sample|.sample()]]

```text
Reproducible random sample                  -> df.sample(n=N, random_state=42)
Stratified by group                          -> df.groupby(g).sample(frac=0.1)
Weighted sampling                             -> weights=col (heavier rows more likely)
Without replacement (default)                 -> replace=False
With replacement (bootstrap)                  -> replace=True, n=len(df)
Random column subset                          -> df.sample(n=k, axis=1)
Need a holdout                                -> sklearn.model_selection.train_test_split
Massive data                                  -> SQL TABLESAMPLE or polars sample (faster)
```

### [[Sections/pandas/inspection/nunique|.nunique()]]

```text
Count distinct values in a column           -> s.nunique()
Count distinct PER COLUMN                    -> df.nunique() (returns a Series)
Include NaN as a value                        -> dropna=False
Per-group distinct count                      -> df.groupby(g)[col].nunique()
Need the actual distinct values               -> s.unique() (no count)
Cardinality ratio                             -> s.nunique() / len(s) (1.0 = unique key)
Very large data                               -> approximate via HyperLogLog (datasketch)
Want unique combinations across columns       -> df[[a,b]].drop_duplicates().shape[0]
```

### [[Sections/pandas/selection/loc|.loc[]]]

```text
Lookup by LABEL (any axis)                  -> df.loc[row_label, col_label]
Boolean filter on rows                       -> df.loc[mask, cols]
Set values on a subset                        -> df.loc[mask, col] = value (avoids SettingWithCopyWarning)
Range of LABELS (inclusive both ends!)        -> df.loc["2024-01":"2024-03"]
Position-based lookup                         -> use .iloc, NOT .loc
Multi-index slicing                           -> pd.IndexSlice or .loc[(a, b), :]
Need to chain assignments                     -> use .loc once with 2D access, not df[col][mask] = ...
Set with a callable (idiomatic chaining)     -> df.loc[lambda d: d.x > 0, "y"] = ...
```

### [[Sections/pandas/selection/iloc|.iloc[]]]

```text
Lookup by INTEGER position                  -> df.iloc[i, j]
Range of POSITIONS (exclusive end)           -> df.iloc[0:10, :]   (rows 0-9)
Last row / column                             -> df.iloc[-1, :] / df.iloc[:, -1]
Don't care about the index labels             -> .iloc is index-agnostic
Random row sampling by position               -> df.iloc[np.random.choice(len(df), 100)]
Need labels                                   -> use .loc, NOT .iloc
Need to mix positions and labels              -> not supported; pick one (or chain reset_index())
Common bug source                              -> after a sort/filter, integer positions move
```

### [[Sections/pandas/selection/query|.query()]]

```text
Long boolean expression, readable form      -> df.query("a > 0 and b == 'x'")
Reference an outside variable                -> df.query("a > @threshold")
Performance with numexpr installed           -> query gets ~2-5x speed on large frames
Column name has spaces / special chars        -> wrap the col name with backticks inside the query string
Need to mix with method chains                -> .query() returns a frame, chains nicely
Programmatic predicate building               -> use boolean-mask form, NOT query string
Super complex expressions                     -> step out to .loc[mask] for clarity
Want to log/inspect predicate                  -> assign to variable: q = "a>0"; df.query(q)
```

### [[Sections/pandas/selection/isin|.isin()]]

```text
Filter to a known set of values             -> df[df.col.isin([...])]
Negate (NOT IN)                              -> df[~df.col.isin([...])]
Set is large (10k+ values)                   -> still fine; isin uses a hash set
Cross-column "in"                            -> df.isin({"col1": [...], "col2": [...]})
Filter to another DataFrame's column         -> df[df.col.isin(other.col)]
Need fuzzy match                              -> NOT isin; use .str.contains or regex
Performance vs equality chain                  -> isin beats (col==a) | (col==b) | ...
Need to keep order or counts                   -> isin returns a mask; pair with sort/groupby
```

### [[Sections/pandas/selection/between|.between()]]

```text
Inclusive range                             -> s.between(lo, hi) (both ends)
Half-open                                   -> s.between(lo, hi, inclusive="left") (3.0+ form)
Exclusive range                              -> s.between(lo, hi, inclusive="neither")
Datetime range                               -> works directly on datetime Series
With NaN handling                             -> NaN is excluded automatically
Negate                                       -> ~s.between(...)
Need a multi-column range                     -> chain two between() with &
Looking for "outside" range                   -> ~s.between() is clearer than (s<lo)|(s>hi)
```

### [[Sections/pandas/selection/multiindex|MultiIndex]]

```text
Time series + entity panel                  -> MultiIndex on (date, entity)
Pivot result                                 -> usually returns MultiIndex columns
Hierarchical groups (region/country/city)    -> MultiIndex captures hierarchy explicitly
Slice all of one level                       -> df.loc[("US", slice(None)), :]
Slice on inner level                          -> use pd.IndexSlice: df.loc[idx[:, "X"], :]
Want to flatten                              -> df.reset_index() or columns=df.columns.to_flat_index()
Want to sort for fast slicing                 -> df.sort_index() (CRITICAL for perf)
Multi-key joins                              -> set both sides' MultiIndex, then df.join
```

### [[Sections/pandas/cleaning/isna|.isna()]]

```text
Element-wise null check                     -> df.isna() (alias .isnull())
Per-column null count                         -> df.isna().sum()
Drop rows with any null                       -> df.dropna()
Filter to rows WITH null in a column          -> df[df.col.isna()]
Filter to non-null                            -> df[df.col.notna()]
Coverage % per column                         -> 1 - df.isna().mean()
Treat empty-string as null too                 -> .replace("", np.nan).isna()
Inf as null                                   -> df.replace([np.inf, -np.inf], np.nan).isna()
```

### [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates()]]

```text
Boolean mask of dups                        -> df.duplicated()
Keep first occurrence (default)              -> keep="first"
Keep last                                    -> keep="last"
Mark ALL dups (no "kept") flag                -> keep=False
Dedupe the frame                             -> df.drop_duplicates()
Subset of columns                             -> subset=["a","b"]
Count of dups                                -> df.duplicated().sum()
Need group sizes per duplicate                -> df.groupby(cols).size().loc[lambda s: s>1]
```

### [[Sections/pandas/cleaning/dropna|.dropna()]]

```text
Drop rows with ANY null                     -> df.dropna() (default how="any")
Drop rows where ALL are null                  -> how="all"
Drop based on specific columns                 -> subset=["col1","col2"]
Threshold (need at least N non-null)           -> thresh=N
Drop columns with too many nulls              -> axis=1 + thresh
Filter without modifying                       -> df[df.col.notna()] (single col, faster)
Imputation might be better                    -> .fillna or sklearn SimpleImputer
Time series with gaps                          -> .ffill/.bfill or interpolation, not drop
```

### [[Sections/pandas/cleaning/fillna|.fillna()]]

```text
Constant fill                                -> df.fillna(0) / df.fillna("Unknown")
Per-column constants                          -> df.fillna({"a": 0, "b": "?"})
Forward fill (LOCF)                           -> df.fillna(method="ffill")
Backward fill                                 -> .fillna(method="bfill")
Linear interpolation (numeric)                -> df.interpolate()
Group-aware fill                              -> df.groupby(g).ffill()
Median for skewed / mean for symmetric        -> domain choice; never blanket "0"
ML pipeline                                   -> sklearn.impute.SimpleImputer (fit on train)
```

### [[Sections/pandas/cleaning/astype|.astype()]]

```text
Reliable numeric conversion                 -> df["x"].astype("int32")
Numeric with possible bad strings            -> pd.to_numeric(s, errors="coerce")
Datetime conversion                          -> pd.to_datetime(s, utc=True)
String -> category                           -> .astype("category") (memory win)
Multiple columns at once                     -> df.astype({"a":"int32","b":"category"})
Nullable integer                             -> "Int64" (capital I)
Coerce errors to NaN                         -> pd.to_numeric(..., errors="coerce")
Not sure if conversion fits                  -> errors="raise" first, narrow dtypes after
```

### [[Sections/pandas/cleaning/categorical|pd.Categorical]]

```text
Low-cardinality string (< 50% unique)       -> .astype("category") (10-100x memory)
Ordered category (Low < Med < High)          -> pd.Categorical(values, categories=..., ordered=True)
Need to add new categories later             -> cat.add_categories([...])
GroupBy on a categorical                     -> respects defined order in result
Encoding for ML                              -> pd.get_dummies or sklearn OneHotEncoder
Cross frames                                 -> reuse pd.api.types.CategoricalDtype object
Save to disk                                 -> parquet preserves; csv loses
Cardinality > ~10000                         -> category overhead may exceed gain; profile
```

### [[Sections/pandas/cleaning/to-numeric|pd.to_numeric()]]

```text
Clean string-numeric column                 -> pd.to_numeric(s)
Some values are dirt ("N/A", "")              -> errors="coerce" -> NaN
Need to keep bad rows visible                  -> errors="ignore" (returns object on failure)
Memory-tight                                  -> downcast="integer" / "float" / "unsigned"
Booleans coming as "True"/"False" strings     -> .map({"True":1,"False":0}) first
Currency / locale strings ("$1,234.56")        -> .str.replace(...) before to_numeric
Only some rows numeric                          -> coerce + later .dropna() / fillna
Repeated calls in a loop                        -> vectorize once on the whole column
```

### [[Sections/pandas/cleaning/to-datetime|pd.to_datetime()]]

```text
Mixed date strings                          -> pd.to_datetime(s)
Known format (5-100x faster)                  -> format="%Y-%m-%d %H:%M:%S"
Errors as NaT                                  -> errors="coerce"
Always store UTC                                -> utc=True (then localize to display TZ)
Excel serial dates                              -> pd.to_datetime(s, unit="D", origin="1899-12-30")
Unix timestamps (seconds / ms)                  -> unit="s" or unit="ms"
Mixed timezones                                  -> utc=True normalises; without, returns object
Speed at scale                                   -> ISO 8601 + format="ISO8601" (3.0+)
```

### [[Sections/pandas/cleaning/str-accessor|.str accessor]]

```text
Fixed-position substring                    -> s.str[0:3]
Containment search                            -> s.str.contains("pattern", regex=True/False)
Replace                                       -> s.str.replace("a","b", regex=False)
Split into multiple columns                   -> s.str.split(",", expand=True)
Extract groups                                -> s.str.extract(r"(w+)@(w+)")
Strip whitespace                              -> s.str.strip()
Case operations                               -> .str.lower() / .upper() / .title()
At scale -> faster                            -> dtype="string[pyarrow]" + same .str API
```

### [[Sections/pandas/cleaning/dt-accessor|.dt accessor]]

```text
Year/month/day extraction                   -> s.dt.year / .month / .day
Day-of-week                                  -> .dt.dayofweek (0=Mon) or .day_name()
Hour/minute/second                            -> .dt.hour / .minute / .second
Floor / ceil to bucket                        -> .dt.floor("h") / .ceil("D")
Convert TZ                                   -> .dt.tz_convert("America/New_York")
Localize naive UTC                            -> .dt.tz_localize("UTC")
Timedelta math                                -> col_a - col_b returns Timedelta
ISO calendar                                   -> .dt.isocalendar() returns (year, week, day)
```

### [[Sections/pandas/transform/sort-values|.sort_values()]]

```text
Single column ascending                     -> df.sort_values("x")
Single column descending                     -> ascending=False
Multi-column with mixed direction             -> by=["a","b"], ascending=[True,False]
Stable sort (ties preserve order)             -> kind="mergesort" (stable)
In-place                                      -> inplace=True (rare; chains break)
Top N efficiently                              -> .nlargest(N, "x") (avoids full sort)
Sort by index instead                         -> df.sort_index()
Need a custom key function                     -> key=lambda s: s.str.lower()
```

### [[Sections/pandas/transform/sort-index|.sort_index()]]

```text
Sort by index (default)                     -> df.sort_index()
Multi-index, sort by level                    -> level=0 / level="date"
Sort columns alphabetically                  -> axis=1
Required before MultiIndex slicing            -> df.sort_index() unblocks slice perf
Descending                                    -> ascending=False
After concat                                   -> sort_index() to restore order
Time-series resample/rolling                   -> requires monotonic index; sort first
Want to sort by a value, not the index        -> use .sort_values, NOT .sort_index
```

### [[Sections/pandas/transform/rename|.rename()]]

```text
Specific renames                            -> df.rename(columns={"old":"new"})
Programmatic transform                       -> columns=str.lower (callable applies to all)
Both axes                                    -> rename(index={...}, columns={...})
Single-column setattr-style                   -> df.columns = [...] (whole list, in order)
Pipeline-friendly                             -> rename returns a copy; chains nicely
Lowercase / strip whitespace                   -> .rename(columns=lambda c: c.strip().lower())
Reorder columns                                -> df[["a","b","c"]] (NOT rename)
Multi-index columns                            -> df.rename(columns=...) operates on level 0
```

### [[Sections/pandas/transform/drop|.drop()]]

```text
Drop a column                                -> df.drop(columns=["x"])
Drop multiple columns                         -> df.drop(columns=["x","y"])
Drop rows by index label                      -> df.drop(index=[5, 7])
Drop by boolean filter                         -> df[~mask] (idiomatic; not .drop)
Drop NA rows                                   -> df.dropna() (specialised)
Drop duplicates                                -> df.drop_duplicates()
In a chain                                    -> .drop returns a copy by default
Errors on missing label                       -> errors="ignore" to tolerate
```

### [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index()]]

```text
Promote a column to the index               -> df.set_index("col")
Demote the index back to a column            -> df.reset_index()
Throw the index away                          -> df.reset_index(drop=True)
Multi-column index                             -> set_index(["a","b"])
After filter/sort, want fresh 0..n-1         -> reset_index(drop=True)
Time series                                    -> set_index("ts") so resample/rolling work
GroupBy result with multi-key                  -> .reset_index() to flatten
Re-merge after groupby                         -> reset_index() before .merge
```

### [[Sections/pandas/transform/nlargest-nsmallest|.nlargest() / .nsmallest()]]

```text
Top N by a column                           -> df.nlargest(N, "score")
Bottom N                                     -> df.nsmallest(N, "score")
Tie behaviour: keep all                       -> keep="all"
Tie behaviour: pick last                      -> keep="last"
Multi-key tiebreak                             -> df.nlargest(N, ["score","ts"])
Want sort + head equivalent                    -> nlargest is faster (O(n log k))
Need full ranking                              -> .rank() then filter
Group-wise top N                               -> df.groupby(g).apply(lambda x: x.nlargest(N, c))
```

### [[Sections/pandas/transform/explode|.explode()]]

```text
Column of lists -> rows                     -> df.explode("col")
Empty-list rows                              -> result has a NaN row (good signal)
Explode multiple columns at once             -> df.explode(["a","b"]) (must be same lengths)
Comma-separated string column                 -> .str.split(",") FIRST, then explode
Need original index back                      -> reset_index() after explode
Want flatter alternative                       -> json_normalize on dict-of-list payloads
Counts of items                                -> .str.split().str.len() (no explode)
Multi-level nesting                            -> explode then explode again
```

### [[Sections/pandas/transform/assign|.assign()]]

```text
Add one or more derived columns             -> df.assign(x=df.a + df.b)
Reference a freshly-assigned col              -> use a callable: assign(x=..., y=lambda d: d.x*2)
Method chain (no intermediate var)            -> .pipe / .assign / .query keep one expression
Conditional assignment                         -> assign(flag=lambda d: np.where(d.x>0,1,0))
Replace existing column                        -> assign(x=...) (last-write wins)
Side-effect-free pipeline                      -> assign returns a COPY; original unchanged
Can't use **kwargs (Python keyword)            -> use a dict-unpack: assign(**{"my col": ...})
In-place if perf demands it                    -> df["x"] = ... (mutates)
```

### [[Sections/pandas/transform/pipe|.pipe()]]

```text
Apply a function in a chain                 -> df.pipe(my_fn, arg1, kwarg=...)
Function expects the frame as 1st arg         -> .pipe(fn) directly
Function expects df as a non-first arg         -> .pipe((fn, "df_arg"), other_args)
Build complex pipelines without temp vars     -> pipe + assign + query + groupby
Side-effect-free transformations               -> functional style fits .pipe
Need to inspect mid-chain                     -> .pipe(lambda d: print(d.shape) or d) for debug
Performance: just a wrapper                    -> no overhead vs direct call
Heavy stats / sklearn                          -> wrap fn(df) with .pipe to keep chaining
```

### [[Sections/pandas/transform/apply|.apply()]]

```text
Vectorized op exists                        -> use it; NEVER apply
Row-wise function (rare)                     -> df.apply(fn, axis=1) (slow but flexible)
Per-column reduction                          -> df.apply(fn, axis=0) (or just .agg)
Per-element                                   -> .map (Series) or .applymap (DataFrame)
Heavy custom logic                             -> consider .pipe + numpy / numba
Need the row as a dict                         -> apply(fn, axis=1) gives a Series per row
Group-wise                                    -> df.groupby(g).apply(fn) (still slow)
Speed-critical                                -> drop down to numpy or use df["x"].to_numpy()
```

### [[Sections/pandas/transform/map|.map()]]

```text
Replace values from a dict                  -> s.map({"old":"new", ...})
Apply a Python fn elementwise                 -> s.map(lambda x: ...)
Map from another Series                       -> s.map(lookup_series)
NaN for missing keys (default)                 -> map() returns NaN for unmapped keys
Keep unmapped values                           -> s.map(lookup).fillna(s)
Vectorized: prefer .replace                    -> s.replace({"old":"new"}) handles partial mappings
DataFrame elementwise                          -> df.applymap (deprecated -> df.map in 2.1+)
Categorical                                    -> map preserves dtype if all keys covered
```

### [[Sections/pandas/transform/groupby|.groupby()]]

```text
Aggregate per group                         -> df.groupby(g).agg({"a":"mean","b":"sum"})
Single-column reduction                       -> df.groupby(g)["x"].sum()
Add a column based on group                    -> df.groupby(g)["x"].transform("mean")
Multi-key                                    -> groupby(["a","b"])
Don't mutate index                             -> as_index=False (keeps grouping cols as columns)
Iteration                                    -> for k, sub in df.groupby(g): ... (slow; rare)
Time-based bucket                             -> df.groupby(pd.Grouper(freq="D"))
Polars/duckdb at scale                         -> 5-50x faster on big data; same mental model
```

### [[Sections/pandas/transform/agg|.agg()]]

```text
Single function                              -> .agg("mean") or .agg(np.mean)
Multiple functions                            -> .agg(["mean","std","count"])
Per-column functions                          -> .agg({"a":"mean","b":"sum"})
Custom output names                            -> .agg(out_a=("a","mean"), out_b=("b","sum"))
User function                                  -> .agg(lambda x: x.iloc[-1] - x.iloc[0])
Many funcs across many cols                    -> .agg(["mean","std","min","max"])
Need to build column names cleanly             -> named-aggregation form (out_x=(...))
Want side-effects per group                    -> use .apply, NOT .agg
```

### [[Sections/pandas/transform/transform|.transform()]]

```text
Per-group statistic broadcast back to rows  -> df.groupby(g)["x"].transform("mean")
Returns SAME shape as input                  -> agg returns N rows; transform returns len(df)
Multiple transforms                          -> transform(["mean","std"]) -> wide result
Standardization within group                  -> transform(lambda x: (x - x.mean()) / x.std())
Cumulative                                  -> .transform("cumsum") (per-group cumsum)
Filling NaN by group mean                    -> transform("mean") then fillna
Counts per group                             -> .transform("size") or "count"
Lag/lead per group                            -> groupby(g)["x"].shift()
```

### [[Sections/pandas/transform/merge|pd.merge()]]

```text
SQL JOIN equivalent                          -> df.merge(other, on="key", how="left/inner/outer")
Different column names                        -> left_on="a", right_on="b"
Index alignment                               -> df.join(other) (faster, no key arg)
Validate cardinality                           -> validate="one_to_many" / "many_to_one"
Investigate join misses                        -> indicator=True (adds _merge column)
Many-to-many warning                            -> validate="one_to_one" raises if violated
Time-aware near-match                           -> pd.merge_asof (rolling join)
Big data                                        -> polars / duckdb beat pandas on joins
```

### [[Sections/pandas/transform/concat|pd.concat()]]

```text
Stack rows (same columns)                   -> pd.concat([df1, df2], axis=0, ignore_index=True)
Side-by-side columns                         -> pd.concat([df1, df2], axis=1)
Inner-join on index/columns                   -> join="inner" (drops misaligned)
Track origin                                  -> keys=["a","b"] (creates outer MultiIndex)
Performance with many small frames            -> collect ALL, then ONE concat — never in a loop
Need to reset index                            -> ignore_index=True
Append a single row                            -> pd.concat([df, pd.DataFrame([row])])
Cross schema                                   -> concat with sort=False for consistent order
```

### [[Sections/pandas/transform/pivot-table|.pivot_table()]]

```text
Group-aggregate to wide form                -> df.pivot_table(values, index, columns, aggfunc)
Multiple aggregations                         -> aggfunc=["sum","mean"] (multi-col result)
Multiple values columns                       -> values=["a","b"] (multi-col result)
Fill missing combinations                     -> fill_value=0
Want raw reshape (no agg)                      -> df.pivot (errors on duplicates)
Add row/col totals                             -> margins=True, margins_name="Total"
Speed-sensitive                                -> groupby(...).agg(...).unstack() can be faster
Need long form back                            -> .melt() inverses pivot
```

### [[Sections/pandas/transform/melt|.melt()]]

```text
single block of measurements                -> wide.melt(...)
structured stubs ("sales_q1", "sales_q2")   -> pd.wide_to_long(...)
multiple measurement blocks, irregular      -> melt each + merge
```

### [[Sections/pandas/transform/df-stack|.stack()]]

```text
wide frame, columns are the variable        -> melt(...)
already have MultiIndex (post-groupby/pivot) -> stack/unstack
need to keep NaN slots                       -> future_stack=True
want flat columns at the end                 -> rename_axis() + reset_index()
```

### [[Sections/pandas/transform/rolling|.rolling()]]

```text
Fixed-size window                            -> df.rolling(window=N).mean()
Time-based window                             -> rolling("7D") (needs DatetimeIndex)
Expanding (cumulative)                         -> .expanding() (window grows)
Per-group rolling                              -> df.groupby(g).rolling(N)
Custom function                                -> .apply(fn, raw=True) (raw=True passes ndarray, faster)
Min periods to bypass leading NaN              -> min_periods=1
Centered window                                -> center=True (causes lookahead — be careful)
Multi-column reduction                          -> .agg({"a":"mean","b":"sum"}) on rolling
```

### [[Sections/pandas/transform/expanding|.expanding()]]

```text
running sum/max/min/prod    -> cumsum / cummax / cummin / cumprod
running mean/std/custom     -> expanding(min_periods=...).mean() etc
per-group running stats     -> groupby(...).cumsum() / .transform(expanding)
ML feature (no leakage)     -> shift(1) THEN expanding/cum
fixed-width window          -> rolling(n) instead of expanding
```

### [[Sections/pandas/transform/shift|.shift()]]

```text
Lag (look back N rows)                      -> s.shift(N) (positive lag)
Lead (look forward)                           -> s.shift(-N)
Per-group lag                                  -> df.groupby(g)["x"].shift(1)
Time-based shift                               -> .shift(freq="1D") (needs DatetimeIndex)
Difference between current and prior           -> s - s.shift(1)  (or s.diff())
Percent change                                  -> s.pct_change() (= s/s.shift()-1)
Filling the leading NaN                         -> .shift().fillna(0)
Predicting next value                            -> .shift(-1) (target column)
```

### [[Sections/pandas/transform/cut|pd.cut()]]

```text
Bin numeric column into N equal-width bins  -> pd.cut(s, bins=N)
Custom bin edges                              -> bins=[0, 18, 65, np.inf]
Custom labels                                 -> labels=["minor","adult","senior"]
Right-open vs right-closed                     -> right=True (default; intervals like (a,b])
Need EQUAL-COUNT bins (deciles)                -> pd.qcut, NOT cut
Get just the bin edges                         -> retbins=True
Treat as categorical                            -> result is Categorical (preserves order)
Out-of-range values                              -> become NaN (use include_lowest if first edge matters)
```

### [[Sections/pandas/transform/qcut|pd.qcut()]]

```text
need DISCRETE buckets, equal counts per bin    -> qcut(q=)
need DISCRETE buckets, equal width per bin     -> cut(bins=)
need CONTINUOUS percentile / rank score        -> rank(pct=True)
need stable buckets across data splits         -> qcut on train,
                                                  persist edges,
                                                  cut on test
```

## NumPy

### [[Sections/numpy/creation/np-array|np.array()]]

```text
already an ndarray, want no copy             -> np.asarray(x)
need a guaranteed independent copy           -> np.array(x) or x.copy()
change dtype only                            -> x.astype(dtype) (always copies)
handing buffer to C/Cython/torch/cuda        -> np.ascontiguousarray(x, dtype=...)
column-major consumer (LAPACK/Fortran)       -> np.asfortranarray(x)
ragged or mixed-type input                   -> reject early; refuse object dtype
memory-tight numeric grid                    -> pin dtype=np.float32 / np.int32
```

### [[Sections/numpy/creation/np-zeros|np.zeros()]]

```text
need zeros, will read before fill            -> np.zeros(shape, dtype=...)
will overwrite every cell before any read    -> np.empty(shape, dtype=...)
need a constant value other than 0           -> np.full(shape, value, dtype=...)
match an existing array's shape+dtype+order  -> np.zeros_like(a) / np.empty_like(a)
identity / diagonal matrix                   -> np.eye / np.identity
boolean mask defaulting to False             -> np.zeros(shape, dtype=bool)
accumulating results in a loop               -> pre-size + index-write, never np.append
```

### [[Sections/numpy/creation/np-ones|np.ones()]]

```text
need ones (literal 1.0)                      -> np.ones(shape, dtype=...)
need any other constant value                -> np.full(shape, value)
uniform weights that sum to 1                -> np.ones(n) / n
all-True boolean mask, then carve exclusions -> np.ones(shape, dtype=bool)
match existing array's shape+dtype+order     -> np.ones_like(a)
homogeneous coords / affine 1-column         -> np.hstack([X, np.ones((m, 1))])
identity matrix                              -> np.eye, NOT np.ones (diff thing)
```

### [[Sections/numpy/creation/np-arange|np.arange()]]

```text
integer start/stop/step                      -> np.arange(start, stop, step)
need exactly N float points                  -> np.linspace(start, stop, N)
log-spaced points (e.g. learning rates)      -> np.geomspace(start, stop, N)
only iterating, no array needed              -> Python range() (no allocation)
indices into an existing array               -> np.arange(len(arr), dtype=np.int64)
countdown                                    -> np.arange(stop, 0, -1)
huge range, can't fit in memory              -> chunk via generator + np.arange per batch
```

### [[Sections/numpy/creation/np-linspace|np.linspace()]]

```text
need exactly N points incl endpoints         -> np.linspace(a, b, N)
periodic signal (avoid duplicate at 2*pi)    -> np.linspace(0, 2*pi, N, endpoint=False)
numerical integration / step needed          -> np.linspace(..., retstep=True)
log-spaced (intuitive args)                  -> np.geomspace(a, b, N)
log-spaced via exponent (legacy)             -> np.logspace(start_exp, stop_exp, N)
integer indices                              -> np.arange(N), NOT np.linspace(0, N-1, N)
memory-tight grid (>1M points)               -> np.linspace(..., dtype=np.float32)
```

### [[Sections/numpy/creation/np-random|np.random.default_rng()]]

```text
single-threaded reproducible script          -> rng = default_rng(seed)
library code (no global state allowed)       -> accept rng parameter, never create one
parallel workers / multiprocessing           -> SeedSequence(seed).spawn(N) per worker
uniform [0,1) samples                        -> rng.random(size)
integers in a half-open range                -> rng.integers(low, high, size)
sample without replacement                   -> rng.choice(pop, size, replace=False)
full-corpus shuffle in place                 -> rng.shuffle(arr)
need a fresh shuffled copy                   -> rng.permutation(arr)
```

### [[Sections/numpy/indexing/array-slicing|Array slicing]]

```text
contiguous range, share memory               -> a[start:stop] (view, free)
need independent buffer for caller           -> a[start:stop].copy()
non-contiguous selection (specific indices)  -> fancy indexing a[[i, j, k]]
filter by condition                          -> boolean mask a[mask]
reusable slice pattern across many arrays    -> roi = np.s_[10:50, :]
reverse axis                                 -> a[::-1]   or a[:, ::-1]
handing buffer to C/Cython/torch             -> np.ascontiguousarray(slice)
```

### [[Sections/numpy/indexing/boolean-masking|Boolean masking]]

```text
single filter                                -> a[mask]
binary if/else                               -> np.where(mask, x, y)
3+ branches                                  -> np.select([masks], [values], default=...)
floor / ceiling clamp                        -> np.clip(a, lo, hi)
combining conditions                         -> use & | ~ with parens, NEVER and/or/not
need rows from a 2D array                    -> 1D row-mask: a[a[:, k] > t]
need to set values in place                  -> a[mask] = value (no allocation)
```

### [[Sections/numpy/indexing/fancy-indexing|Fancy indexing]]

```text
pick rows in given order                     -> A[row_indices]
pick cols in given order                     -> A[:, col_indices]
parallel pick of (row, col) cells            -> A[rows, cols] (zipped)
cartesian rows x cols                        -> A[np.ix_(rows, cols)]
reorder by another array's sort key          -> A[np.argsort(key)]
scatter values into specific positions       -> A[rows, cols] = values
alternative API in some codebases            -> np.take / np.put
```

### [[Sections/numpy/indexing/np-unique|np.unique()]]

```text
sorted unique values, generic dtype          -> np.unique(a)
insertion-order, mixed dtype                 -> pd.unique(a)
counts of small non-negative ints            -> np.bincount(a) (fastest)
unique rows of 2D numeric array              -> np.unique(A, axis=0)
unique rows of mixed-dtype frame             -> df.drop_duplicates()
need integer-encoding of a categorical col   -> np.unique(a, return_inverse=True)
need first-occurrence positions              -> np.unique(a, return_index=True)
```

### [[Sections/numpy/indexing/np-where|np.where()]]

```text
binary if/else over arrays                   -> np.where(cond, x, y)
3+ branches                                  -> np.select([conds], [vals], default)
floor/ceiling clamp only                     -> np.clip(a, lo, hi)
need indices where cond is True              -> np.flatnonzero(cond) or np.where(cond)[0]
apply expensive fn only to True/False rows   -> pre-mask: out[cond] = f(x[cond])
piecewise polynomial (closed-form ranges)    -> np.piecewise(x, conds, funcs)
bool input, just want True positions         -> np.argwhere(cond) for (i,j) tuples
```

### [[Sections/numpy/operations/vectorized-ops|Vectorized operations]]

```text
element-wise math (+, -, *, /, **)           -> direct operators / ufuncs
matrix product (rows x cols)                 -> @ or np.matmul (NEVER *)
batched matmul over leading axes             -> @ broadcasts; np.einsum for clarity
memory-tight inner loop                      -> in-place += / *= or out= kwarg
division/log over data that may be 0/neg     -> np.errstate(...) + np.where guard
want NaN-aware math                          -> np.nansum / np.nanmean / np.nan_to_num
need to call a Python fn over each element   -> rewrite with ufuncs (NOT np.vectorize)
```

### [[Sections/numpy/operations/np-clip|np.clip()]]

```text
clamp to [lo, hi] both sides                 -> np.clip(a, lo, hi)
one-sided clamp (floor only, ceiling only)   -> np.clip(a, lo, None) / np.clip(a, None, hi)
per-element bounds                           -> np.clip(a, lo_arr, hi_arr) (broadcastable)
element-wise max of two arrays               -> np.maximum(a, b)
element-wise min of two arrays               -> np.minimum(a, b)
in-place clipping for huge arrays            -> np.clip(a, lo, hi, out=a)
ML gradient clipping by global norm          -> rescale, NOT element-wise clip
```

### [[Sections/numpy/operations/broadcasting|Broadcasting]]

```text
add a row vector to every row                -> rely on broadcasting (1D shape (k,))
add a column vector to every column          -> reshape to (n, 1) or use [:, None]
center each row / column                     -> reduce with keepdims=True, then subtract
need an explicit zero-copy expanded view     -> np.broadcast_to(a, target_shape)
need a writable expanded copy                -> np.tile (allocates) — only if you must
shape mismatch you can't reason about        -> assert .shape at boundaries
axis insertion for broadcasting              -> a[:, None] / a[None, :] (clearer than reshape)
```

### [[Sections/numpy/operations/np-meshgrid|np.meshgrid()]]

```text
plotting on a small grid                     -> np.meshgrid(x, y)  (default xy)
tensor / matrix-indexed math                 -> np.meshgrid(x, y, indexing="ij")
memory-tight large grid                      -> sparse=True OR broadcast x[None,:] * y[:,None]
compact slice-syntax form                    -> np.mgrid[-3:3:100j, -3:3:100j]
open / sparse slice-syntax form              -> np.ogrid[-3:3:100j, -3:3:100j]
very large grid you can't materialize        -> stream a row at a time
need (x, y) pair list, not 2 grids           -> np.column_stack([X.ravel(), Y.ravel()])
```

### [[Sections/numpy/operations/np-nan|np.nan handling]]

```text
detect NaN positions                         -> np.isnan(a)
detect any non-finite (NaN, +inf, -inf)      -> ~np.isfinite(a)
aggregate while ignoring NaN                 -> np.nansum / np.nanmean / np.nanstd
replace NaN with a fill value                -> np.nan_to_num(a, nan=0)
drop NaN entries                             -> a[~np.isnan(a)] or a[np.isfinite(a)]
sentinel value (e.g. -999) -> NaN            -> np.where(a == -999, np.nan, a)
want to fail loudly on NaN input             -> if np.isnan(a).any(): raise
want to suppress numpy invalid warnings      -> with np.errstate(invalid="ignore"):
```

### [[Sections/numpy/operations/aggregations|Aggregations]]

```text
may contain NaN                              -> nan-prefixed (log dropped count)
integer dtype, large sum                     -> .sum(dtype=np.int64) explicitly
weighted by another column                   -> np.average(arr, weights=...)
batch reduction (B, ...)                     -> axis=tuple(remaining dims)
need to broadcast result back                -> keepdims=True
want index of min/max, not value             -> argmin / argmax (NOT min/max)
percentile or median                         -> np.percentile / np.median
```

### [[Sections/numpy/operations/np-diff|np.diff()]]

```text
plain consecutive deltas                     -> np.diff(a)
need same length as input                    -> np.diff(a, prepend=a[0])
nth-order (e.g. discrete acceleration)       -> np.diff(a, n=2)
centered / boundary-accurate                 -> np.gradient(y, x)
non-uniform spacing                          -> np.gradient(y, t)  (NOT np.diff/dt)
pandas time-series, NaN-safe                 -> Series.diff() / .pct_change()
reconstruct values from diffs                -> a[0] + np.cumsum(d)
```

### [[Sections/numpy/operations/np-argmax|np.argmax() / np.argmin()]]

```text
single global index of max                   -> np.argmax(a)
index along an axis                          -> np.argmax(a, axis=N)
2D max position back to (row, col)           -> np.unravel_index(np.argmax(A), A.shape)
top-K (small k vs n)                         -> np.argpartition(a, -k)[-k:]
all positions where max occurs (ties)        -> np.flatnonzero(a == a.max())
sorted indices (full ordering)               -> np.argsort(a)  (O(n log n))
ML predicted class from logits/probs         -> logits.argmax(axis=-1)
```

### [[Sections/numpy/operations/np-sort|np.sort() / np.argsort()]]

```text
small array OR full ordering needed          -> np.sort(a)
in-place sort (no extra copy)                -> a.sort()
ties must preserve original order            -> np.sort(a, kind="stable")
sort by multiple columns                     -> np.lexsort((secondary, primary))
only top-K matters                           -> np.argpartition + small final sort
indices that would sort (indirect sort)      -> np.argsort(a)
descending                                   -> np.sort(a)[::-1] (no ascending= kwarg)
```

### [[Sections/numpy/operations/np-linalg|np.linalg]]

```text
square, well-conditioned Ax=b                -> np.linalg.solve(A, b)
rectangular or ill-conditioned Ax~b          -> np.linalg.lstsq(A, b, rcond=None)
need explicit determinant                    -> np.linalg.det(A) (rare in practice)
eigen-decomposition (symmetric matrix)       -> np.linalg.eigh (faster, real eigvals)
eigen-decomposition (general matrix)         -> np.linalg.eig
PCA / dimensionality reduction               -> np.linalg.svd(X_centered, full_matrices=False)
batched operations on small matrices         -> stack -> np.linalg.solve broadcasts
advanced (LU, QR, Cholesky, sparse)          -> scipy.linalg / scipy.sparse.linalg
```

### [[Sections/numpy/operations/np-einsum|np.einsum()]]

```text
simple 2D matmul                             -> A @ B (faster than einsum)
batch matmul (..., M, N) @ (..., N, K)       -> A @ B (broadcasts cleanly)
simple dot product / vector-matrix           -> np.dot / @ (clearer than einsum)
transpose                                    -> A.T (NOT einsum("ij->ji", A))
axis sum / column sum                        -> A.sum(axis=...) (NOT einsum)
contraction over many axes (attention, etc.) -> einsum (most readable)
chained 3+ tensor contraction                -> einsum(..., optimize=True)
```

### [[Sections/numpy/operations/np-dtype-perf|dtype optimization]]

```text
default numeric work                         -> plain numpy + correct dtype
memory-tight inner loop                      -> in-place += / *= / out= kwarg
chained pure-float ufuncs (a*b + c*d)        -> numexpr.evaluate("...")
custom scalar kernel needed                  -> numba @njit (or @vectorize)
want last 2-3x for a known hot path          -> Cython / C extension
moving to GPU                                -> cupy (numpy-compatible) or torch
I/O or Python-dominated time                 -> profile first; numpy won't help
half-precision OK (ML inference)             -> dtype=np.float16 (smaller, watch overflow)
```

### [[Sections/numpy/shape/reshape|np.reshape()]]

```text
know shape exactly                           -> a.reshape(rows, cols)
know one dim, infer other                    -> a.reshape(-1, cols) or a.reshape(rows, -1)
flatten to 1D, prefer view                   -> a.ravel()
flatten to 1D, want a copy                   -> a.flatten()
add a size-1 axis (broadcast prep)           -> a[:, None] or a[np.newaxis, :]
remove all size-1 axes                       -> np.squeeze(a)
transpose                                    -> a.T (view, free)
need contiguous after reshape (for C/torch)  -> np.ascontiguousarray(a.reshape(...))
```

### [[Sections/numpy/shape/np-stack|np.stack()]]

```text
N items become a NEW axis (build a batch)    -> np.stack([...], axis=0)
extend an EXISTING axis (more rows / cols)   -> np.concatenate([...], axis=k)
1D arrays as columns of a 2D matrix          -> np.column_stack(arrays)
building a batch from a known count          -> pre-allocate np.empty + index-write
building incrementally, count unknown        -> append to list, np.stack ONCE at end
need same axis convention but unsure dim     -> np.stack/concatenate explicitly (NOT vstack)
stacking samples from a generator            -> np.fromiter or list-then-stack
```

### [[Sections/numpy/shape/np-concatenate|np.concatenate()]]

```text
extend existing axis (more rows / cols)      -> np.concatenate(arrays, axis=k)
create a NEW axis (build a batch)            -> np.stack(arrays, axis=k)
1D arrays as columns of a 2D matrix          -> np.column_stack or np.c_
inline ad-hoc 1D joins                       -> np.r_[a, b, [10, 20]]
stack RGB channels into (H, W, 3)            -> np.dstack or np.stack(axis=-1)
need to flatten then concat                  -> np.concatenate([...], axis=None)
inverse — split a big array                  -> np.split / np.array_split
```

### [[Sections/numpy/shape/np-tile|np.tile()]]

```text
element-wise math against a 1D vector        -> broadcast (free, no allocation)
need a real, writable buffer                 -> np.tile(a, reps)
need a read-only virtual view                -> np.broadcast_to(a, shape)
repeat each element (NOT the array)          -> np.repeat(a, n)
need to expand for cross-product math        -> [:, None] / [None, :] (broadcast)
exporting repeated rows for CSV/C buffer     -> np.tile (must materialize)
building a constant-filled array             -> np.full (NOT tile of [val])
```

### [[Sections/numpy/shape/np-repeat|np.repeat()]]

```text
stutter each element a fixed N times         -> np.repeat(a, n)
stutter each element a DIFFERENT N times     -> np.repeat(a, [n0, n1, n2, ...])
repeat each row of a 2D array                -> np.repeat(A, n, axis=0)
repeat the WHOLE array                       -> np.tile(a, reps)
expand group-counts to a label vector        -> np.repeat(groups, sizes)
build a row-id alongside groups              -> np.repeat(np.arange(k), sizes)
pandas list-column                           -> df.explode("col")
just need element-wise alignment             -> broadcasting (no allocation)
```

## Seaborn

### [[Sections/seaborn/distributions/histplot|sns.histplot()]]

```text
single var, normal-ish        -> bins=auto
single var, skewed/outliers   -> bins="fd"
compare groups (different N)  -> stat="density", common_norm=False
joint shape of two vars       -> 2D histplot or hexbin
long-tailed positive data     -> log_scale=True
reach for distplot            -> NEVER (removed in 0.14)
```

### [[Sections/seaborn/distributions/kdeplot|sns.kdeplot()]]

```text
smoothing dominates             -> bw_adjust < 1
default looks fine              -> bw_adjust = 1
honest tail behavior matters    -> cut=0 + rugplot
compare groups (different N)    -> hue=, common_norm=False
bounded data (>=0, percent)     -> cut=0 (don't extend past data)
2D joint density                -> kdeplot(x=, y=) with fill=True
```

### [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot()]]

```text
compare distributions visually   -> ecdfplot (preferred over KDE)
probability of exceedance        -> complementary=True
read a specific quantile         -> intersect ECDF with horizontal line
no parameter choices needed      -> ecdfplot (no bins, no bandwidth)
audience unfamiliar with CDFs    -> histplot(stat="density") instead
time-to-event / churn / survival -> ecdfplot(complementary=True)
```

### [[Sections/seaborn/distributions/rugplot|sns.rugplot()]]

```text
small N, want raw data + smooth      -> kdeplot + rugplot
any N, marginals on a scatter        -> JointGrid + rugplot
N >> 500                             -> skip rugplot, use scatter alpha
2D marginals on JointGrid            -> g.plot_marginals(sns.rugplot)
primary chart, no overlay            -> use stripplot or histplot instead
want exact tick at each value        -> rugplot with height=0.05
```

### [[Sections/seaborn/distributions/displot|sns.displot()]]

```text
single panel into existing axes  -> sns.histplot(ax=ax)
small multiples / faceted        -> sns.displot
need both raw data + facets      -> displot + FacetGrid customization
kind=hist|kde|ecdf switch        -> stay in displot
custom plt.subplots layout       -> axes-level histplot/kdeplot per cell
want overall suptitle            -> g.figure.suptitle(..., y=1.02)
```

### [[Sections/seaborn/categorical/boxplot|sns.boxplot()]]

```text
compare medians/IQR across categories       -> boxplot
shape matters (multimodal, skew)            -> violinplot
N small enough to show every point          -> stripplot or swarmplot
want CI on the median visible               -> notch=True (boxplot)
long tails / many outliers (large N)        -> boxenplot (letter-value)
alphabetical category order leaks in        -> set order= explicitly
```

### [[Sections/seaborn/categorical/violinplot|sns.violinplot()]]

```text
N >= 30 per group, want shape        -> violinplot
N < 30 per group                     -> swarm/strip + boxplot
compare two distributions per cat    -> violinplot(hue=, split=True)
compact summary, no shape needed     -> boxplot
need raw points overlaid             -> inner=None + stripplot/swarmplot
group sizes vary, show with width    -> density_norm="count"
```

### [[Sections/seaborn/categorical/stripplot|sns.stripplot()]]

```text
N <= 30 per group        -> swarmplot (no overlap)
30 < N <= 500            -> stripplot with size=3, alpha=0.6
500 < N <= 5000          -> stripplot with size=2, alpha=0.3
N > 5000                 -> switch to violin/box; strip becomes a blob
numeric-x mixed with cat -> native_scale=True
overlay on box/violin    -> fill=False box + stripplot color="black"
```

### [[Sections/seaborn/categorical/swarmplot|sns.swarmplot()]]

```text
N <= 100 per group              -> swarmplot (cleanest)
100 < N <= 500 per group        -> swarmplot with smaller size=
N > 500 per group               -> stripplot(size=2, alpha=0.3)
N > 5000 per group              -> violinplot or boxplot only
want raw + summary together     -> box (fill=False) + swarmplot overlay
two hue groups side-by-side     -> dodge=True
```

### [[Sections/seaborn/categorical/barplot|sns.barplot()]]

```text
mean / median per category, with CI    -> sns.barplot
raw count of rows per category         -> sns.countplot
pre-aggregated totals (already summed) -> ax.bar (matplotlib)
outliers skew the mean                 -> estimator="median"
show variability not uncertainty       -> errorbar="sd"
suppress error bars entirely           -> errorbar=None
```

### [[Sections/seaborn/categorical/countplot|sns.countplot()]]

```text
raw category counts             -> countplot
counts split by another cat     -> countplot(hue=)
normalized proportions per cat  -> precompute + ax.bar
long-tail categorical           -> collapse to "Other" first
long category names             -> y= instead of x= (horizontal)
want sorted-by-frequency        -> order=df[col].value_counts().index
```

### [[Sections/seaborn/categorical/pointplot|sns.pointplot()]]

```text
x is ordinal/temporal              -> pointplot
x is nominal categorical           -> barplot or boxplot
x is numeric (continuous)          -> lineplot
x is grouped time series           -> lineplot(hue=)
want Cleveland dot plot            -> pointplot(linestyle="none")
overlapping groups                 -> dodge=True
```

### [[Sections/seaborn/relational/scatterplot|sns.scatterplot()]]

```text
N <= 1k, 2-6 groups    -> scatterplot(hue=, alpha=0.6)
N > 5k                 -> histplot(2D) or hexbin
many categories        -> relplot(col=...) facets
need a regression line -> regplot or lmplot
3+ encodings needed    -> hue= + size= + style=
color-blind audience   -> palette="colorblind"
```

### [[Sections/seaborn/relational/lineplot|sns.lineplot()]]

```text
long-form data, want mean + CI band   -> lineplot (default)
want raw connecting line, no CI       -> estimator=None + sorted data
per-subject lines without aggregation -> units= + estimator=None
show std-dev band, not bootstrap CI   -> errorbar="sd"
suppress band on dense data           -> errorbar=None
color-only group encoding             -> hue= with dashes=False
```

### [[Sections/seaborn/relational/relplot|sns.relplot()]]

```text
single panel into existing axes       -> sns.scatterplot/lineplot(ax=)
small multiples / faceted view        -> sns.relplot
many facets, one categorical          -> col_wrap=N
facet across two dims                 -> col= AND row=
shared reference line per facet       -> g.refline(y=...)
per-panel custom annotation           -> g.map_dataframe(callable)
```

### [[Sections/seaborn/relational/catplot|sns.catplot()]]

```text
median + IQR per category       -> kind="box"
distribution shape              -> kind="violin"
small N, every point            -> kind="swarm" or "strip"
mean + CI per category          -> kind="bar"
raw counts                      -> kind="count"
ordinal x with trend            -> kind="point"
panels span very different y    -> sharey=False
single panel inside subplots    -> use axes-level (boxplot, etc.)
```

### [[Sections/seaborn/relational/regplot|sns.regplot()]]

```text
single panel, linear               -> regplot (default)
curved relationship                -> regplot(order=2) OR lowess=True
binary y                           -> regplot(logistic=True)
need facets per group              -> lmplot
need actual coefficients/p-values  -> statsmodels.OLS
too many points, narrow band       -> ci=None
style scatter and line separately  -> scatter_kws=, line_kws=
```

### [[Sections/seaborn/relational/lmplot|sns.lmplot()]]

```text
single panel, line + scatter        -> regplot
grouped lines, no facets            -> lmplot(hue=)
facets across categories            -> lmplot(col=, hue=)
outlier-heavy data                  -> lmplot(robust=True)
need to TEST slope differences      -> statsmodels with interaction term
compare slopes only, no points      -> lmplot(scatter=False)
curved within group                 -> lmplot(order=2)
```

### [[Sections/seaborn/relational/residplot|sns.residplot()]]

```text
quick "is linear OK?" check          -> sns.residplot(lowess=True)
curved lowess line                   -> add polynomial term or log(x)
fan-shaped residuals                 -> log(y) or weighted regression
normality check on residuals         -> histplot(kde=True) + sm.qqplot
full diagnostic suite                -> statsmodels.graphics.regressionplots
non-parametric alt to residuals      -> regplot(lowess=True) overlay
```

### [[Sections/seaborn/matrix/heatmap|sns.heatmap()]]

```text
correlation [-1, 1]         -> RdBu_r diverging, center=0,  fmt=".2f"
confusion matrix            -> Blues sequential,            fmt="d"
pivot table, signed         -> RdBu_r diverging, center=0
pivot table, unsigned       -> viridis / YlOrRd sequential, fmt=".0f"
correlation matrix          -> mask=upper triangle + square=True
want clustered reordering   -> sns.clustermap (not heatmap)
long category labels        -> rotate xticklabels 45 + ha="right"
```

### [[Sections/seaborn/matrix/pairplot|sns.pairplot()]]

```text
N <= 1k, want everything            -> sns.pairplot
N <= 1k, asymmetric upper/lower     -> sns.PairGrid
N > 5k                              -> SAMPLE then pairplot or PairGrid
> 6 numeric columns                 -> vars= to limit; full grid is unreadable
color by class                      -> hue= with diag_kind="kde"
need stats annotated per cell       -> PairGrid + custom callable
```

### [[Sections/seaborn/matrix/jointplot|sns.jointplot()]]

```text
simple bivariate + marginals       -> sns.jointplot
per-group color (multiple hues)    -> sns.JointGrid + per-group loop
marginals only on a scatter        -> JointGrid + plot_marginals(rugplot)
large N with overplotting          -> kind="hex" or kind="hist"
trend line + marginals             -> kind="reg"
smooth bivariate density           -> kind="kde", fill=True
```

### [[Sections/seaborn/matrix/pairgrid|sns.PairGrid()]]

```text
one plot type, square grid          -> sns.pairplot
asymmetric upper/lower              -> sns.PairGrid
need stats annotations per cell     -> PairGrid + custom callable
different x and y variables         -> PairGrid(x_vars=, y_vars=)
apply same fn off-diagonal          -> g.map_offdiag()
share diagonal scale across rows    -> diag_sharey=True (default off)
```

### [[Sections/seaborn/matrix/clustermap|sns.clustermap()]]

```text
already in [-1, 1] (correlation)         -> z_score=None, RdBu_r, center=0
raw features, varying scale              -> z_score=0 (per row)
compare to known labels                  -> row_colors=
want clusters but keep an axis ordered   -> col_cluster=False
compact clusters                         -> method="ward"
elongated / curved clusters              -> method="average"
correlated features                      -> metric="correlation"
```

### [[Sections/seaborn/matrix/facetgrid|sns.FacetGrid()]]

```text
built-in seaborn fn (hist/box/scatter)    -> sns.displot/relplot/catplot
custom callable or seaborn fn not covered -> sns.FacetGrid + map_dataframe
matplotlib raw fn (plt.scatter)           -> g.map (passes arrays)
need shared reference lines               -> g.refline()
panels span very different y              -> sharey=False
long row labels                           -> margin_titles=True
```

### [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels]]

```text
set 3+ axis properties at once     -> ax.set(title=, xlabel=, ylabel=, xlim=, ylim=)
rotate / resize tick labels        -> ax.tick_params(axis="x", rotation=45)
move legend off the axes           -> ax.legend(bbox_to_anchor=(1.02, 1), loc="upper left")
remove the legend entirely         -> ax.get_legend().remove()
per-figure scoped style override   -> with plt.rc_context({...}):
axes-level seaborn fn returns Axes -> use ax methods (NOT g.* methods)
```

### [[Sections/seaborn/setup-customization/labels-figure|Figure-level labels]]

```text
axes-level (boxplot, scatterplot)    -> ax.set(), ax.legend(), fig.savefig
figure-level (catplot, displot)      -> g.set_*, g.figure.suptitle, g.savefig
set y limits on every panel          -> g.set(ylim=(0, 60))
per-panel customization              -> for ax in g.axes.flat: ...
panel templates                      -> g.set_titles(col_template="{col_name}")
suptitle pushed above panels         -> g.figure.suptitle(..., y=1.02)
```

### [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig()]]

```text
web / presentation                  -> dpi=150 PNG
publication / journal               -> dpi=300 PNG OR vector PDF
editable in design tool             -> SVG
in a long loop                      -> ALWAYS plt.close(fig)
FacetGrid (figure-level)            -> g.savefig(...) NOT plt.savefig
embed fonts for portability         -> rcParams pdf.fonttype=42
```

### [[Sections/seaborn/setup-customization/despine|sns.despine()]]

```text
one-off plot                  -> sns.despine() at the end
notebook house style          -> set_style("ticks") + rcParams in rc_context
minimal floating chart        -> despine(left=True, bottom=True)
FacetGrid                     -> g.despine(...)
gap between spines and data   -> despine(offset=10)
trim spine to data range      -> despine(trim=True)
```

### [[Sections/seaborn/setup-customization/set-theme|sns.set_theme()]]

```text
one notebook-wide style        -> sns.set_theme(...) at top
scoped style for a block       -> with sns.axes_style(...)
bigger fonts for slides        -> with sns.plotting_context("talk")
project house style            -> setup function imported everywhere
undo all overrides             -> sns.reset_defaults()
per-figure rcParams override   -> with plt.rc_context({...}):
```

### [[Sections/seaborn/setup-customization/color-palette|sns.color_palette()]]

```text
categorical (cities, classes)        -> qualitative ("colorblind", "deep")
ordered numeric, unsigned            -> sequential ("viridis", "rocket")
signed data, centered at 0           -> diverging ("RdBu", "coolwarm")
small N (<=4) categories             -> custom hex list set via set_palette
color-blind audience                 -> "colorblind" (always safe)
continuous colormap for heatmap      -> color_palette(..., as_cmap=True)
NEVER                                -> jet, rainbow, hsv (perceptually misleading)
```

### [[Sections/seaborn/setup-customization/fig-vs-axes|Figure-level vs axes-level]]

```text
  custom subplot layout                       -> axes-level + plt.subplots()
  small multiples / faceting (col=, row=)     -> figure-level
  one panel only                               -> axes-level + plt.subplots()

WRONG — figure-level rejects ax=
fig, ax = plt.subplots()
sns.displot(data=df, x="x", ax=ax)            # TypeError

Right ways:
```

## Matplotlib

### [[Sections/matplotlib/chart-types/line|ax.plot()]]

```text
single line, quick check                  -> ax.plot(x, y) + plt.subplots()
2-5 series, same scale                    -> multiple ax.plot calls + ax.legend()
data spans orders of magnitude            -> ax.set_yscale("log")
irregular x or many series                -> ax.plot with explicit color cycle
layered with bands / fills                -> ax.plot + ax.fill_between for CI
datetime x-axis                           -> ax.plot(dates, y) + ConciseDateFormatter
need >1 different y-scale                 -> two subplots sharex=True (NOT twinx)
one-off style change                      -> with plt.style.context(...) wrapper
```

### [[Sections/matplotlib/chart-types/bar|ax.bar()]]

```text
<8 short categories, ranking matters       -> ax.bar (sorted desc)
long category names                        -> ax.barh (NOT bar with rotation)
2 series side-by-side                      -> grouped bars via x +/- width/2
parts-of-a-whole over time                 -> stacked bars with bottom=
show value on each bar                     -> ax.bar_label(bars, fmt="...")
show uncertainty                           -> ax.bar(..., yerr=std)
>15 categories                             -> ax.barh (vertical scrolling fits)
continuous x (numeric bins)                -> ax.hist, NOT ax.bar
```

### [[Sections/matplotlib/chart-types/barh|ax.barh()]]

```text
ranking with long names                    -> ax.barh + sort + invert_yaxis
short names, <=6 cats                      -> ax.bar (vertical reads faster)
compare two periods per category           -> grouped barh with y +/- height/2
highlight a winner / target                -> color-encode + axvline threshold
show value at end of bar                   -> ax.bar_label(bars, padding=3)
N rows uncertain                           -> figsize=(8, max(4, 0.4 * N))
negative + positive values                 -> barh with axvline(x=0) baseline
```

### [[Sections/matplotlib/chart-types/hist|ax.hist()]]

```text
single distribution shape           -> hist (bins="auto")
compare 2 groups                    -> overlapping hist + KDE
compare many groups                 -> violinplot or boxplot
long-tailed / log-scale data        -> set xscale="log" or log-bin
want probability density            -> density=True (NOT raw counts)
need 2-D distribution               -> hist2d or hexbin
distribution + summary in one       -> seaborn histplot/displot
```

### [[Sections/matplotlib/chart-types/scatter|ax.scatter()]]

```text
N <= 1k                              -> scatter (full markers)
1k < N <= 10k                        -> scatter with alpha=0.2-0.5
N > 10k                              -> hexbin / hist2d / 2D KDE
color-encode continuous variable     -> c=array, cmap="viridis" + colorbar
color-encode categorical             -> loop groups + label= per scatter
3rd dim via marker size              -> s=array (clip extreme values first)
need regression overlay              -> seaborn regplot or np.polyfit
```

### [[Sections/matplotlib/chart-types/imshow|ax.imshow()]]

```text
sequential, all positive       -> "viridis", "plasma", "magma"
divergent, signed (+/-)        -> "RdBu_r", "coolwarm", "seismic"
cyclic (angle, phase)          -> "twilight", "hsv"
labeled rows/cols (DataFrame)  -> sns.heatmap (annot=True, fmt=...)
real-world coordinates         -> imshow(extent=[x0, x1, y0, y1])
image data (RGB)               -> imshow(arr, origin="upper") + ax.axis("off")
confusion matrix               -> imshow + text loop OR sklearn ConfusionMatrixDisplay
NEVER                          -> "jet", "rainbow" (perceptually misleading)
```

### [[Sections/matplotlib/chart-types/twinx|ax.twinx()]]

```text
readers must visually overlay two series  -> twin axes (color-coded)
no real overlay benefit                    -> two subplots, sharex=True
THREE+ series at different scales          -> three subplots, NEVER triple-axis
secondary axis is a unit conversion (C/F)  -> ax.secondary_yaxis(functions=...)
shared y, two x axes (top date + bottom)   -> ax.twiny()
only need different SCALE not different y  -> ax.set_yscale("log")
```

### [[Sections/matplotlib/chart-types/fill-between|ax.fill_between()]]

```text
line + uncertainty band                    -> ax.plot + ax.fill_between(lo, hi)
area chart (single series to zero)         -> ax.fill_between(x, y, 0, alpha=0.4)
stacked areas (parts of a whole)           -> ax.stackplot, NOT chained fill_between
shade above/below a threshold              -> fill_between(..., where=mask, interpolate=True)
asymmetric errors per point                -> pass ci_lower/ci_upper arrays
horizontal band (y range)                  -> ax.axhspan
vertical band (x range / time period)      -> ax.axvspan
```

### [[Sections/matplotlib/chart-types/errorbar|ax.errorbar()]]

```text
discrete data points (~<30)        -> errorbar with capsize=3-5
dense series (>50)                 -> line + fill_between (95% CI band)
bar chart with uncertainty         -> ax.bar(..., yerr=...) + capsize
asymmetric errors                  -> yerr=[[lower], [upper]] (2 rows)
both x and y uncertainty           -> errorbar(..., xerr=, yerr=)
horizontal layout (group means)    -> errorbar(yerr=...) on barh, or sns.pointplot
showing distribution, not summary  -> boxplot or violinplot, NOT errorbar
```

### [[Sections/matplotlib/chart-types/axhline|ax.axhline()]]

```text
y=0 baseline                          -> ax.axhline(y=0, color="black", lw=0.8)
threshold / target line               -> ax.axhline(y=target, ls="--", label="target")
acceptable range / band               -> ax.axhspan(ymin, ymax, alpha=0.15)
mean of plotted data                  -> ax.axhline(y=df["col"].mean())
line over a specific x-range only     -> ax.axhline(y=v, xmin=0.2, xmax=0.8) (axes frac)
reference line behind data            -> ax.axhline(..., zorder=0)
on a log y-scale                      -> still works; y is in DATA units
```

### [[Sections/matplotlib/chart-types/axvline|ax.axvline()]]

```text
single event marker                   -> ax.axvline(x=date, color=, ls="--")
highlighted period (recession, COVID) -> ax.axvspan(xmin, xmax, alpha=0.15)
many events (> 3)                     -> loop + axvline + ax.text labels
datetime axis                         -> pass pd.Timestamp / datetime objects
short marker, not full height         -> ax.axvline(..., ymin=0, ymax=0.3) (axes frac)
labels: tag the line directly         -> ax.text with transform=ax.get_xaxis_transform()
per-event color                       -> drive from a DataFrame (date, label, color)
```

### [[Sections/matplotlib/figures-layouts/gridspec|GridSpec]]

```text
uniform NxM grid, equal sizes        -> plt.subplots(nrows, ncols)
one panel spans rows or cols         -> subplot_mosaic (named, preferred)
need precise width/height ratios     -> GridSpec(width_ratios=, height_ratios=)
nested grids (grid inside a panel)   -> gs.subgridspec(...)
pixel-perfect dashboards             -> GridSpec + manual layout="constrained"
need shared axes across spans        -> GridSpec + sharex=, or per_subplot_kw
one-off "big chart + sparklines"     -> subplot_mosaic with height_ratios
```

### [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic()]]

```text
simple uniform grid              -> plt.subplots(rows, cols)
asymmetric, named panels         -> subplot_mosaic (preferred default)
need pixel-perfect placement     -> GridSpec(width_ratios=, height_ratios=)
one panel needs polar/3d         -> per_subplot_kw={"P": {"projection": "polar"}}
shared x or y axes               -> sharex=True/sharey=True keywords
want empty cells in layout       -> "." in the mosaic string
per-panel size control           -> width_ratios=, height_ratios=
```

### [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes]]

```text
any production code                      -> OO API: fig, ax = plt.subplots()
one-off REPL exploration                 -> plt.plot(...) is fine
a function that draws into ANY axes      -> def f(..., ax=None): if ax is None: ...
multi-figure script                      -> fig.savefig per fig + plt.close(fig)
subplots                                 -> fig, axes = plt.subplots(r, c)
need to mutate after creation            -> hold onto fig and ax variables
asymmetric layout                        -> plt.subplot_mosaic
```

### [[Sections/matplotlib/figures-layouts/subplots|plt.subplots()]]

```text
single chart                       -> fig, ax = plt.subplots(figsize=(...))
uniform NxM grid                   -> fig, axes = plt.subplots(N, M)
one panel spans rows/cols          -> plt.subplot_mosaic, NOT subplots
stacked time series                -> plt.subplots(N, 1, sharex=True)
loop over DataFrame columns        -> plt.subplots(...) + axes.flat zip
need consistent 2D access          -> plt.subplots(..., squeeze=False)
uneven panel sizes                 -> gridspec_kw={"height_ratios": [...]}
polar / 3D projection              -> subplot_kw={"projection": "polar"}
```

### [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI]]

```text
default general chart                -> figsize=(8, 6) (4:3)
slide / 16:9 display                 -> figsize=(12, 6.75)
square (correlation, scatter)        -> figsize=(6, 6)
wide time series strip               -> figsize=(14, 3.5)
N-row barh / dotplot                 -> figsize=(8, max(4, 0.3 * N))
notebook screen display              -> dpi=100-120
slide / Jupyter Retina               -> dpi=150
print / journal                      -> dpi=300, save in PDF or PNG
```

### [[Sections/matplotlib/styling/labels|Labels & titles]]

```text
single chart, three labels         -> ax.set_title / set_xlabel / set_ylabel
set many labels at once            -> ax.set(title=, xlabel=, ylabel=, xlim=)
common publication look            -> remove top/right spines + grid alpha=0.3
align title to data start          -> ax.set_title(..., loc="left")
needs space below title            -> ax.set_title(..., pad=10)
global font/spines override        -> with plt.rc_context({...}):
axis-only grid (bar charts)        -> ax.grid(True, axis="y", ls="--", alpha=0.5)
suptitle across subplots           -> fig.suptitle, NOT ax.set_title
```

### [[Sections/matplotlib/styling/annotate|ax.annotate()]]

```text
call out 1-3 specific points        -> ax.annotate(text, xy=, xytext=, arrowprops=)
small offset label, no arrow        -> annotate(..., textcoords="offset points")
stats box ("n=150") in corner       -> ax.text(..., transform=ax.transAxes)
figure-wide note/source             -> fig.text(0.99, 0.01, "Source: ...")
curved arrow to avoid clutter       -> arrowprops with connectionstyle="arc3,rad=0.3"
labeled background bbox             -> bbox=dict(boxstyle="round", facecolor="white")
many overlapping labels (>5)        -> from adjustText import adjust_text
axes-fraction position              -> transform=ax.transAxes (0..1, not data coords)
```

### [[Sections/matplotlib/styling/legend|ax.legend()]]

```text
simple multi-line/bar chart        -> label= on each call + ax.legend()
legend covers data                 -> ax.legend(loc="best") (auto-scan)
tight axes, no room inside         -> bbox_to_anchor=(1.02, 1) + constrained_layout
long legend, save vertical room    -> ax.legend(ncols=2, fontsize=9)
fill_between or proxy artist       -> handles=[Line2D(...), Patch(...)]
twin-axis combined legend          -> gather get_legend_handles_labels from both
one shared legend across subplots  -> fig.legend(handles=[...], loc="lower center")
suppress duplicates                -> dict.fromkeys on handle labels
```

### [[Sections/matplotlib/styling/tick-formatting|Tick formatting]]

```text
currency / percent              -> FuncFormatter or PercentFormatter
big numbers (M, B)              -> EngFormatter or custom callable
time series (any range)         -> AutoDateLocator + ConciseDateFormatter
log span                        -> ax.set_xscale("log") then default ticks
categorical x                   -> set_xticks + set_xticklabels (paired)
too many ticks                  -> ax.locator_params(nbins=N) or MaxNLocator
rotate without overlap          -> tick_params(rotation=30) + ha="right"
minor ticks for fine grid       -> ax.minorticks_on() + ax.grid(which="minor")
```

### [[Sections/matplotlib/styling/colormaps|Colormaps]]

```text
sequential, all positive            -> "viridis", "plasma", "magma", "cividis"
diverging, signed (+/-)             -> "RdBu_r" or "coolwarm" with vmin=-vmax
skewed positive data                -> norm=LogNorm(vmin=, vmax=)
asymmetric divergent (e.g. -1..5)   -> norm=TwoSlopeNorm(vcenter=0)
discrete categories                 -> "tab10" / "Set2" / BoundaryNorm
cyclic (angles, phase)              -> "twilight", "hsv"
colorblind-safe priority            -> cividis (safest), viridis (very safe)
brand colors                        -> LinearSegmentedColormap.from_list
```

### [[Sections/matplotlib/styling/colorbar|fig.colorbar()]]

```text
single mappable, single ax          -> fig.colorbar(mappable, ax=ax)
shared bar across grid              -> fig.colorbar(im, ax=axes, shrink=0.8)
horizontal bar at bottom            -> orientation="horizontal", shrink=0.8
discrete categorical                -> BoundaryNorm + ticks=range(n) + set_yticklabels
data may exceed vmin/vmax           -> extend="both" (or "min"/"max") for arrows
thin bar next to tall axes          -> shrink=0.8, pad=0.04
external axes (precise placement)   -> cax=fig.add_axes([l, b, w, h])
need percent / currency labels      -> cbar.ax.yaxis.set_major_formatter(...)
```

### [[Sections/matplotlib/styling/savefig|plt.savefig()]]

```text
web / blog / Slack screenshot    -> PNG, dpi=150, bbox_inches="tight"
slide deck                       -> PNG, dpi=200 or PDF (vector)
print / journal                  -> PDF or SVG, bbox_inches="tight", fonttype=42
need transparent background      -> savefig(..., transparent=True)
batch export in a loop           -> fig.savefig(...) + plt.close(fig)
exact margin control             -> bbox_inches="tight" + pad_inches=0.1
reproducible PDF text            -> rcParams["pdf.fonttype"] = 42 (TrueType)
greyscale-safe                   -> use viridis / cividis + check the print proof
```

### [[Sections/matplotlib/styling/styles|Styles & Themes]]

```text
project-wide house style          -> plt.style.use("./my_house.mplstyle")
one notebook session              -> plt.style.use("seaborn-v0_8-whitegrid")
single chart different style      -> with plt.style.context("dark_background"):
tweak a few rcParams              -> with plt.rc_context({"axes.grid": True}):
stack base + overrides            -> plt.style.context([base, {overrides}])
publication-ready clean look      -> remove top/right spines + grid alpha=0.3
dark theme for slides             -> plt.style.use("dark_background")
ggplot-like colors                -> plt.style.use("ggplot")
```

## Object-Oriented Python

### [[Sections/oop/classes/class-def|class definition]]

```text
pure data with 2+ fields, no heavy behavior     -> @dataclass
need immutability + hashable value type         -> @dataclass(frozen=True)
millions of instances, memory matters           -> @dataclass(slots=True)
call sites confuse arg order (e.g. lat/lon)     -> @dataclass(kw_only=True)
need runtime validation/coercion of inputs      -> Pydantic BaseModel
ORM-mapped row                                  -> SQLAlchemy / Django model
class owns external resources (sockets, locks)  -> hand-written class
```

### [[Sections/oop/classes/class-instance-vars|Class vs instance variables]]

```text
immutable constant shared by all instances      -> class variable
per-instance mutable state (lists, dicts)       -> set on self in __init__
counter / registry shared across instances      -> class var + Lock
subclasses should each get their own counter    -> self.__class__.x
value depends on subclass (e.g. default config) -> @classmethod factory
shared cache that may grow                      -> module-level dict
per-process singleton resource                  -> module global, not class var
```

### [[Sections/oop/classes/inheritance|Inheritance]]

```text
share implementation across types                -> regular inheritance
need to ENFORCE subclass implements method       -> abc.ABC + @abstractmethod
only need a structural shape for type checking   -> typing.Protocol
compose orthogonal behaviors (logging, JSON)     -> mixins, not parent
"is-a" relationship feels forced                 -> composition, not inheritance
third-party class needs extension                -> wrap or subclass thinly
cross-cutting concern (auth, logging)            -> decorator, not subclass
```

### [[Sections/oop/classes/super|super()]]

```text
call parent __init__ from subclass               -> super().__init__(...)
extend a parent method with extra behavior       -> super().method() + own code
skip a level deliberately (rare, smelly)         -> Grandparent.method(self)
multiple inheritance / mixin chain               -> super() everywhere, **kwargs pass-through
need to call sibling explicitly (almost never)   -> reconsider design
Python 2 compat / ancient code                   -> super(ClassName, self)
modern Python 3 single or multi inheritance      -> bare super()
```

### [[Sections/oop/classes/mro|Multiple inheritance / MRO]]

```text
debugging unexpected method dispatch             -> print(Cls.__mro__)
composing orthogonal behaviors                   -> mixins listed leftmost
diamond shape with shared base                   -> cooperative super() everywhere
want to enforce ordering for invariants          -> check Cls.__mro__ in tests
Python raises "MRO conflict" at class creation   -> reorder bases (specific first)
need single inheritance for clarity              -> avoid MI, prefer composition
one base is the "real" parent, others are mixins -> mixins first, base last
```

### [[Sections/oop/classes/mixin|Mixin pattern]]

```text
stateless cross-cutting behavior (logging, JSON) -> mixin
need shared state across users of the behavior   -> regular base class
only one host class will use the behavior        -> module function
behavior must be enabled per-instance            -> composition (attribute)
contract is "implements method X"                -> Protocol, not mixin
need to enforce overrides                        -> ABC, not mixin
behavior depends on host fields                  -> document via Protocol type
```

### [[Sections/oop/classes/metaclass|Metaclasses]]

```text
auto-register subclasses in a registry            -> __init_subclass__
validate subclass shape at class-creation time    -> __init_subclass__
inject attrs/methods based on class body          -> class decorator
enforce abstract methods                          -> abc.ABC (already a metaclass)
class needs a different metaclass than its bases  -> avoid; redesign
building an ORM / DSL with magic class bodies     -> custom metaclass
"I read about metaclasses and want to try them"   -> don't; use simpler tool
```

### [[Sections/oop/classes/dunder|Dunder methods]]

```text
make print()/REPL useful                          -> __repr__
value semantics (sets, dict keys, ==)             -> __eq__ + __hash__ together
sortable type                                     -> @total_ordering + __lt__
container-like ("len(x)", "x[i]", "for ...")     -> __len__, __getitem__, __iter__
resource owns cleanup (with x: ...)              -> __enter__ + __exit__
numeric-like (+, *, scalar*x)                    -> __add__, __mul__, __rmul__
format-spec aware (f"{x:usd}")                   -> __format__
mostly data fields, no special protocol           -> @dataclass — gets __repr__/__eq__ free
```

### [[Sections/oop/classes/repr-str|__repr__ vs __str__]]

```text
only have time for one method                    -> __repr__ (covers print() too)
debugging output / logs / error messages         -> __repr__ — round-trippable
end-user display (print, str(), CLI output)      -> __str__
participate in f-string format specs             -> __format__
container with cycles (graphs, trees)            -> @reprlib.recursive_repr()
value type with many fields                      -> @dataclass — generates __repr__
force developer view inside an f-string          -> f"{obj!r}"
```

### [[Sections/oop/properties/property|@property]]

```text
plain attribute, no logic                         -> just self.x = ...
compute on access, cheap                          -> @property
compute once, cache on instance                   -> @cached_property
validate on assignment                            -> @property + @x.setter
read-only public field                            -> @property without setter
same validation across many fields                -> custom descriptor
abstract attribute in a base class                -> @property + @abstractmethod
need to invalidate cache when inputs change       -> setter that pops cached key
```

### [[Sections/oop/properties/descriptors|Descriptors]]

```text
one attribute, one getter/setter                  -> @property
one attribute, compute-once cache                 -> @cached_property
same validation across many attrs/classes         -> custom data descriptor
lazy attribute that should disappear after read   -> non-data descriptor (no __set__)
building an ORM Field / form Field abstraction    -> custom descriptor
need __set_name__ to capture attribute name       -> custom descriptor
simple computed view, no reuse                    -> @property — don't over-engineer
```

### [[Sections/oop/properties/classmethod|@classmethod]]

```text
alternative constructor (from_string, from_dict)  -> @classmethod
needs the class but not an instance               -> @classmethod
stateless utility, no class state needed          -> @staticmethod
subclasses should get instances of themselves     -> @classmethod with cls()
factory that picks among subclasses (registry)    -> @classmethod on base
utility totally unrelated to class state          -> module-level function
need to access class variables (config, registry) -> @classmethod
```

### [[Sections/oop/properties/staticmethod|@staticmethod]]

```text
utility logically tied to class, no self/cls       -> @staticmethod
callers should discover it via the class namespace -> @staticmethod
factory or alternative constructor                 -> @classmethod
needs class config / registry / subclass behavior  -> @classmethod
completely independent of the class                -> module-level def
used only inside one method                        -> nested def, not @staticmethod
needs to be overridable in subclass                -> @classmethod (or regular method)
```

### [[Sections/oop/properties/protocol-oop|Protocol]]

```text
typing third-party objects you don't control       -> Protocol
need runtime isinstance() check                    -> @runtime_checkable Protocol
strict enforcement at class instantiation          -> abc.ABC + @abstractmethod
type a callback parameter (any def with shape)     -> Protocol with __call__
express "iterable of T", "supports __len__"        -> Protocol (or typing.Sized)
library wants users to opt in by subclassing       -> ABC
library should accept duck-typed objects           -> Protocol
value-type contract with default impls             -> ABC; defaults run only on subclasses
```

### [[Sections/oop/dataclasses/dataclass|@dataclass]]

```text
plain data container with 2+ fields              -> @dataclass
immutable / hashable / safe in sets              -> @dataclass(frozen=True)
millions of small instances, memory matters      -> @dataclass(slots=True)
call sites with many similar args (lat/lon)      -> @dataclass(kw_only=True)
need real input validation / coercion            -> Pydantic BaseModel
need converters + rich field options             -> attrs.define
maps to a DB row / ORM entity                    -> SQLAlchemy / Django model
tiny pair of values, want tuple semantics        -> NamedTuple
```

### [[Sections/oop/dataclasses/slots|__slots__]]

```text
millions of small fixed-shape instances           -> __slots__ (or dataclass slots=True)
handful of long-lived objects                     -> skip slots, keep __dict__
modern Python 3.10+, want minimal boilerplate     -> @dataclass(slots=True)
need weakref to instances                         -> add "__weakref__" to slots
need to pickle slotted objects                    -> define __getstate__/__setstate__
subclass extends a slotted parent                 -> declare ONLY new slots in child
need to add attrs dynamically (monkey-patching)   -> don't use slots
readability/refactor flexibility matters most     -> skip slots
```

### [[Sections/oop/dataclasses/enum|Enum]]

```text
small fixed set of named constants                -> Enum
members must compare equal to ints (DB codes)     -> IntEnum
members must compare equal to strings (API)       -> StrEnum (3.11+)
bitmask permissions / flag combinations           -> Flag / IntFlag
value doesn't matter, just the name               -> auto()
want guaranteed unique values                     -> @unique decorator
constants live in config / vary at runtime        -> dict / Literal type, not Enum
need parsing from user input with helpful errors  -> classmethod from_string()
```

### [[Sections/oop/dataclasses/context-manager|Context managers]]

```text
stateless setup/teardown                          -> @contextmanager generator
stateful resource with attrs/methods              -> class with __enter__/__exit__
silently ignore a known exception                 -> contextlib.suppress
open a dynamic number of resources                -> contextlib.ExitStack
capture stdout/stderr in tests                    -> redirect_stdout / redirect_stderr
asyncio resource (DB pool, HTTP client)           -> __aenter__ / __aexit__
need to nest many context managers                -> ExitStack, not nested with
already have a wrapper-style pattern              -> consider closing(), nullcontext()
```

### [[Sections/oop/dataclasses/dataclasses|dataclasses (Data Classes)]]

```text
plain data + auto __init__/__repr__/__eq__         -> @dataclass
immutable hashable value type                      -> @dataclass(frozen=True)
sortable value type                                -> @dataclass(order=True)
memory-tight, millions of instances                -> @dataclass(slots=True)
inheritance with mixed defaults                    -> @dataclass(kw_only=True)
need DB / API serialization round-trip             -> asdict / astuple
real input validation needed                       -> Pydantic, not @dataclass
tiny tuple-like pair                               -> NamedTuple
```

## Data Structures & Algos

### [[Sections/dsa/structures/stack|Stack]]

```text
simple LIFO                        -> list with append/pop
thread-safe LIFO                   -> queue.LifoQueue
"next greater / smaller" problem    -> monotonic stack of INDICES
tree/graph DFS, deep input          -> iterative stack, NOT recursion
parsing nested structure            -> stack of "open" markers
```

### [[Sections/dsa/structures/queue|Queue]]

```text
single-threaded FIFO                  -> collections.deque (fastest)
producer/consumer across threads       -> queue.Queue
producer/consumer across coroutines    -> asyncio.Queue
producer/consumer across processes     -> multiprocessing.Queue
ordered processing (urgency)            -> queue.PriorityQueue / heapq
bounded ring buffer (last N)            -> deque(maxlen=N)
```

### [[Sections/dsa/structures/deque|Deque]]

```text
FIFO with O(1) at both ends           -> deque
ring buffer "last N items"             -> deque(maxlen=N)
sliding-window min/max in O(n)         -> monotonic deque of INDICES
random index reads (d[i] often)         -> list
thread-safe                              -> queue.Queue (NOT deque)
thread-safe rotate / cycle               -> use a Lock around deque
```

### [[Sections/dsa/structures/heap|Heap]]

```text
ordered processing of a stream         -> heapq with (priority, counter, item)
bounded "top-k" memory                  -> push/replace into a size-k min-heap
merge sorted streams                     -> heapq.merge (lazy, doesn't load all)
running median / percentile (low N)     -> two heaps (max-left, min-right)
need to remove an arbitrary item          -> heap-with-tombstones (lazy delete)
thread-safe priority queue                -> queue.PriorityQueue
```

### [[Sections/dsa/structures/priority-queue|Priority Queue]]

```text
simple in-process priority order        -> heapq with (priority, counter, item)
max-priority                              -> negate the priority
thread-safe                                -> queue.PriorityQueue
need to cancel queued items                -> lazy-delete with sentinel
need to lower a key after insert            -> stale-entry pattern (re-push)
distributed                                  -> Redis ZSET, not heapq
```

### [[Sections/dsa/structures/hashmap|HashMap]]

```text
O(1) lookup, simple                       -> dict
counts / frequencies                       -> Counter
group-by / accumulate                      -> defaultdict(list / int / set)
memoize a pure function                    -> @lru_cache(maxsize=None)
need keys ORDERED                          -> dict in modern Python keeps insertion order
                                             (use sortedcontainers.SortedDict for sorted keys)
bounded cache                                -> LRU via OrderedDict + move_to_end
```

### [[Sections/dsa/structures/linked-list|Linked List]]

```text
modify around the head                     -> dummy head node
"k-th from end" / "remove nth"             -> two-pointer with k-step lead
detect cycle existence                       -> Floyd's tortoise & hare
find cycle ENTRY                             -> Floyd's + restart from head
merge sorted lists                           -> dummy + tail pointer
reverse / partition                          -> iterative; recursion blows stack on big inputs
```

### [[Sections/dsa/structures/graph|Graph]]

```text
shortest path, UNWEIGHTED          -> BFS + parent map
shortest path, WEIGHTED (>= 0)      -> Dijkstra (heap)
shortest path, NEGATIVE weights      -> Bellman-Ford
cycle in directed graph               -> three-color DFS
topological order                     -> Kahn's BFS or post-order DFS
connected components                   -> DFS / BFS / union-find
small dense graph                      -> adjacency MATRIX (n*n bool)
big sparse graph                       -> adjacency LIST (default)
```

### [[Sections/dsa/structures/trie|Trie]]

```text
exact-match lookup only                 -> set / dict, NOT trie
prefix search + small alphabet          -> Trie (nested dict or TrieNode)
memory-tight + millions of words         -> compressed trie or DAFSA
match many patterns at once              -> Aho-Corasick
IP routing / longest-prefix match         -> radix trie
```

### [[Sections/dsa/structures/binary-search|Binary search]]

```text
look up in a sorted ARRAY                 -> bisect_left / bisect_right
keep an array sorted while inserting       -> bisect.insort
"minimum capacity / max threshold" Q&A     -> binary search on the answer
need to search by a derived key             -> bisect(..., key=...) (3.10+)
need exact match index                       -> bisect_left then verify a[i]==x
range count between lo and hi inclusive    -> bisect_right(hi) - bisect_left(lo)
```

### [[Sections/dsa/structures/sorting-patterns|Sorting patterns]]

```text
simple sorted output                       -> sorted(seq) or seq.sort()
sort by one field                            -> key=itemgetter / attrgetter
sort by multiple fields                      -> key returns a TUPLE
key is expensive to compute                  -> Python already caches; just write key=
ordering can't be expressed as a single key  -> cmp_to_key
need ONLY top-k                              -> heapq.nlargest / nsmallest
need a median / quantile                      -> statistics.median or quickselect
```

### [[Sections/dsa/algorithms/two-pointers|Two Pointers]]

```text
pair-sum on SORTED array               -> opposite ends, converge
pair-sum on UNSORTED array             -> hash map (two-sum O(n))
in-place dedup / partition              -> same-direction (slow/fast)
palindrome / reverse                    -> opposite ends
linked-list middle / cycle              -> fast/slow pointers
3-sum / 4-sum                            -> sort + fix + two-pointer
3-way partition (Dutch flag)             -> three pointers
```

### [[Sections/dsa/algorithms/sliding-window|Sliding Window]]

```text
sum / max / min over fixed window         -> O(1) per step incremental update
"longest / shortest valid window"          -> variable window; expand right, shrink left
window MAX/MIN in O(n)                      -> monotonic deque of indices
"exactly K distinct"                          -> at_most(K) - at_most(K-1)
needs to UNDO partial work on shrink         -> Counter/dict, decrement on left++
```

### [[Sections/dsa/algorithms/recursion|Recursion]]

```text
tree / DAG traversal                       -> recursion
"all subsets / permutations / combos"      -> recursion + backtracking
overlapping subproblems                      -> recursion + @lru_cache
depth could exceed ~1000                    -> iterate, OR setrecursionlimit
tail-recursive shape                          -> rewrite as a loop (no TCO in Python)
divide-and-conquer                           -> recursion (merge sort, quickselect)
data-shaped LIKE a recursion problem        -> consider iterative DP or BFS instead
```

### [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming]]

```text
"looks recursive but exponential"          -> @lru_cache(maxsize=None)
need speed / no recursion                  -> bottom-up tabulation
only previous row matters                  -> rolling array (O(m) not O(n*m))
can derive a closed form                    -> use it; DP is overkill
LIS / longest increasing                    -> bisect-based O(n log n)
problem doesn't have overlapping subproblems -> NOT DP; greedy or D&C
```

### [[Sections/dsa/algorithms/big-o|Big-O Reference]]

```text
x in lst inside a loop                -> set lookup
list.pop(0) inside a loop              -> deque.popleft()
string += in a loop                     -> "".join(...)
sorted(...)[:k] for small k             -> heapq.nlargest
recursion explodes                      -> @lru_cache
nested for-for over same data            -> hash map / two-pointer / sort
slicing huge lists in a loop             -> indices, NOT slices
```

## APIs & Frameworks

### [[Sections/apis/fastapi/fastapi-routes|FastAPI routes]]

```text
< 5 routes total                    -> @app.get / @app.post on the FastAPI instance
feature-grouped routes               -> APIRouter(prefix=..., tags=...) per module
document non-2xx responses           -> responses={404: {...}, ...}
constrain path / query parameters     -> Path(..., gt=0) / Query(..., max_length=N)
shared logic across handlers          -> dependency injection, not helper imports
long-running endpoint                  -> StreamingResponse / BackgroundTasks
```

### [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection]]

```text
shared resource per request           -> yield dependency (db, redis, otel span)
reused across handlers, no setup       -> plain function dependency
bundles multiple inputs                 -> class dependency (Annotated[..., Depends()])
cross-cutting policy (auth, RBAC)       -> compose dependencies; declare on the route
value derived from headers / cookies    -> dependency that takes Header / Cookie / Request
want test isolation                      -> app.dependency_overrides
```

### [[Sections/apis/fastapi/pydantic-models|Pydantic models]]

```text
public API request body              -> strict=True + extra="forbid"
internal record / config              -> defaults; permissive parsing
field derived from others             -> @computed_field (visible in OpenAPI)
pick by a "type" field                -> discriminated union with Field(discriminator=...)
email / URL / etc.                     -> EmailStr / HttpUrl, not plain str
need to mutate value during validation  -> @field_validator returns the cleaned value
```

### [[Sections/apis/fastapi/pydantic-validators|Pydantic validators]]

```text
normalize a single field             -> @field_validator(...)
normalize SHAPE before typing         -> mode="before"
cross-field invariant                  -> @model_validator(mode="after")
need values from sibling fields        -> field_validator + ValidationInfo.data
reusable rule across many models      -> Annotated[Type, AfterValidator(fn)]
custom error formatting for clients     -> walk e.errors(), build your own JSON
```

### [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings]]

```text
anything sensitive (passwords, tokens) -> SecretStr; never plain str
grouped config (db, redis, smtp)        -> nested BaseSettings with env_prefix
per-env config                            -> .env.dev / .env.prod, pick via APP_ENV
serverless / no .env file                  -> ignore env_file, rely on platform env vars
FastAPI handler needs settings             -> Depends(get_settings) (cached lru)
testing                                    -> dependency_overrides + cache_clear
```

### [[Sections/apis/fastapi/sqlalchemy-models|SQLAlchemy models]]

```text
shared timestamp / soft-delete columns       -> mixin class
one Python type -> one SQL type project-wide  -> type_annotation_map on Base
parent without parent column                   -> ondelete="RESTRICT" / "PROTECT" semantics
queries always filter by (a, b)                -> composite Index in __table_args__
any invariant the DB must enforce              -> CheckConstraint / UniqueConstraint
schema changes after first deploy              -> Alembic, not create_all
```

### [[Sections/apis/fastapi/sqlalchemy-session-apis|SQLAlchemy session]]

```text
single PK lookup                          -> db.get(Model, pk)
single row by predicate                    -> .one() / .one_or_none() / .scalar()
list query                                  -> .scalars(...).all()
parent + many children                     -> selectinload (one extra IN query)
single parent + child                       -> joinedload (single JOIN)
bulk INSERT/UPDATE/DELETE                  -> Core .execute(), not loops + .save()
read-modify-write across processes         -> .with_for_update() inside a transaction
FastAPI                                     -> session per request via Depends(get_db)
```

### [[Sections/apis/async/async-def|async def]]

```text
pure compute, no I/O                       -> NO async; run sync (or process pool)
I/O-bound (HTTP, DB, file)                 -> async/await all the way down
stuck calling a blocking lib in async       -> asyncio.to_thread(fn, *args)
stuck in CPU-heavy work in async            -> ProcessPoolExecutor + run_in_executor
running in Jupyter / FastAPI                 -> NEVER asyncio.run; just await
testing async code                            -> pytest-asyncio (asyncio_mode='auto')
```

### [[Sections/apis/async/await|await]]

```text
one await with a deadline                -> asyncio.timeout(seconds): ...
N concurrent awaits, fail-fast             -> async with TaskGroup() (3.11+)
N concurrent awaits, tolerate failures     -> asyncio.gather(..., return_exceptions=True)
long-lived background worker                -> create_task; handle CancelledError
"I don't want this cancelled if my caller is" -> asyncio.shield(coro)
wait for FIRST result of N options          -> asyncio.wait(..., return_when=FIRST_COMPLETED)
```

### [[Sections/apis/async/asyncio-gather|asyncio.gather()]]

```text
N coros, all-or-nothing semantics       -> TaskGroup (3.11+); except* on errors
N coros, partial failure tolerated       -> asyncio.gather(..., return_exceptions=True)
need to react as results arrive          -> asyncio.as_completed
"first one wins, cancel the rest"        -> asyncio.wait(return_when=FIRST_COMPLETED)
bounded concurrency                       -> asyncio.Semaphore wrapping each call
timeout the whole batch                   -> async with asyncio.timeout(...): TaskGroup
```

### [[Sections/apis/async/asyncio-queue|asyncio.Queue()]]

```text
single producer / consumer                -> Queue() with sentinel
N consumers, finite work                   -> Queue(maxsize) + q.join() + cancel
urgency-ordered work                        -> PriorityQueue
strict order matters                         -> single consumer, OR sequence-numbered items
multi-stage pipeline                         -> chain queues; each stage = own pool
cross-process / multi-host                   -> NOT asyncio; use Redis Streams / Kafka / SQS
```

### [[Sections/apis/async/thread-pool|ThreadPoolExecutor]]

```text
blocking I/O (requests, psycopg2)      -> ThreadPoolExecutor
numpy / pandas / sklearn (releases GIL) -> ThreadPoolExecutor is fine
pure-Python CPU work                    -> ProcessPoolExecutor
ASYNC code path needs blocking call     -> asyncio.to_thread / run_in_executor
tens of thousands of small tasks         -> async I/O (httpx) instead of threads
tasks that may never finish              -> cooperative stop flag, NOT future.cancel()
```

### [[Sections/apis/async/process-pool|ProcessPoolExecutor]]

```text
pure-Python, CPU-bound, > 100 ms per task   -> ProcessPoolExecutor
numpy-heavy work                              -> ThreadPoolExecutor (numpy releases GIL)
I/O-bound                                     -> async / threads, NOT processes
need shared state                              -> initializer + module globals; shared_memory for arrays
work scattered across many machines             -> Dask / Ray, not local processes
tasks < 1 ms                                    -> sequential beats both, or batch them
```

### [[Sections/apis/http-stdlib/logging-apis|logging]]

```text
library code                              -> getLogger(__name__); NO basicConfig
app entry point                            -> dictConfig once at startup
structured logging / search by field        -> JSON formatter + extra={...}
correlate logs to one request               -> ContextVar + Filter
exception path                              -> log.exception() inside except
need to mute a noisy library                 -> per-logger level, e.g. sqlalchemy.engine WARNING
```

### [[Sections/apis/http-stdlib/os-environ|os.environ]]

```text
single optional var, simple type        -> os.getenv("X", "default")
required var that should fail-loud       -> os.environ["X"] or _require("X")
typed config object, many fields          -> pydantic-settings BaseSettings
need .env in dev only                       -> python-dotenv, called BEHIND a guard
container / serverless                      -> ignore .env; rely on platform env vars
secrets                                      -> SecretStr (pydantic) or KMS / Vault
```

### [[Sections/apis/http-stdlib/requests|requests]]

```text
one-off script, no concurrency           -> requests.get/post with timeout
many calls, same host                     -> Session()
transient 5xx / 429 expected              -> Session + Retry(status_forcelist=...)
downloads / large bodies                  -> stream=True + iter_content
per-line streaming JSON                    -> stream=True + iter_lines
need async (>10s of concurrent calls)     -> switch to httpx.AsyncClient
```

### [[Sections/apis/http-stdlib/httpx|httpx]]

```text
sync code path                            -> httpx.get / Client (drop-in for requests)
async server (FastAPI, Starlette)         -> ONE AsyncClient on app.state, lifespan-managed
one-off async script                       -> async with httpx.AsyncClient(): ...
N concurrent fetches                       -> asyncio.gather + return_exceptions=True
large download                              -> client.stream("GET", url) + aiter_bytes
need recordable mocks for tests             -> respx (httpx-native), not vcrpy
tons of concurrent connections to one host  -> http2=True (multiplex)
```

## Testing with pytest

### [[Sections/testing/pytest-basics/assertions|pytest assertions]]

```text
one logical behavior, multiple aspects   -> multiple assert lines, ONE test function
N similar inputs, same behavior          -> @pytest.mark.parametrize, not N copies
error path                                 -> pytest.raises with match=
floating-point math                        -> pytest.approx, never ==
unrelated behavior                         -> separate test function
```

### [[Sections/testing/pytest-basics/test-doubles|Test doubles]]

```text
external service (HTTP, DB, queue)         -> Mock with spec=Real, assert calls
in-process collaborator with state          -> Fake (in-memory)
need to verify side-effect AND keep behavior -> Spy (wrap, record, delegate)
test the return value, not the interaction   -> Stub (or just MagicMock)
private helper / pure function               -> NO double; call it directly
```

### [[Sections/testing/pytest-basics/raises|pytest.raises()]]

```text
error type matters, message matters    -> raises(Type, match=r"regex")
need to inspect the exception object   -> as exc_info; assert on .value / .__cause__
N similar error scenarios               -> @parametrize, one test function
library wraps a real cause              -> assert exc_info.value.__cause__ is the real one
ExceptionGroup (3.11+)                  -> pytest.RaisesGroup
```

### [[Sections/testing/pytest-basics/approx|pytest.approx()]]

```text
simple float scalar                       -> pytest.approx(expected, rel=1e-6)
value near zero                            -> pytest.approx(0.0, abs=1e-9)
list / dict of floats                      -> pytest.approx(struct)
numpy array, mixed magnitudes               -> np.testing.assert_allclose(..., rtol, atol)
bit-level numerical correctness            -> np.testing.assert_array_almost_equal_nulp
integers / IDs / strings                    -> plain ==
```

### [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize]]

```text
1 input, M cases                          -> single-arg parametrize
(input, expected) tuples                   -> two-arg parametrize, IDs per case
slow / known-broken cases                  -> pytest.param(marks=mark.slow / xfail)
same test, different backends              -> fixture(params=[...])
independent dimensions (e.g., role x lang) -> stacked parametrize
table reused across files                   -> module constant + parametrize
```

### [[Sections/testing/fixtures/fixture-basic|@pytest.fixture]]

```text
resource needs cleanup                   -> yield + cleanup-after-yield
multiple resources, any can fail          -> contextlib.ExitStack
need fresh resource per test               -> default (function scope)
N variants per test                        -> factory fixture (yield a callable)
reset global state across all tests        -> autouse=True
per-test parametrization metadata          -> request.node.name / request.param
```

### [[Sections/testing/fixtures/fixture-scope|Fixture scope]]

```text
anything mutated during a test         -> function scope (default)
pure compute / read-only resource       -> module or session scope
shared across whole suite (DB engine)   -> session scope; pair with function-scope txn
reset global state automatically         -> autouse=True at function scope
per-test logger / temp dir               -> request.node.name + tmp_path (function)
```

### [[Sections/testing/fixtures/factory-boy|Factory Boy]]

```text
simple object construction              -> factory.Factory + Faker
field derived from another field         -> LazyAttribute
needs to be unique (DB constraint)       -> factory.Sequence
FK to another model                       -> SubFactory
related child rows (one-to-many)          -> RelatedFactory
"this user but as an admin"               -> Trait under Params
custom post-create logic                   -> @post_generation
```

### [[Sections/testing/fixtures/conftest|conftest.py]]

```text
fixture used by 2+ test files          -> move to conftest.py at the common root
fixture used by 1 file                  -> keep it in that file
directory has unique fixtures            -> nested conftest.py inside that dir
custom markers (slow, integration)        -> register in pytest_configure
command-line flag for opt-in tests        -> pytest_addoption + collection_modifyitems
plugin needed by these tests only         -> pytest_plugins = [...] in conftest
```

### [[Sections/testing/fixtures/integration-tests|Integration test patterns]]

```text
pure HTTP endpoint, no DB             -> TestClient(app), no fixture overrides
HTTP + DB                              -> in-memory SQLite + dependency_overrides
need cross-test isolation, fast        -> session engine + per-test transaction rollback
schema migrations matter                -> Postgres in Docker (testcontainers / pytest-docker)
files involved                          -> tmp_path; never a hardcoded path
external HTTP service                    -> respx / responses mock, never real network
```

### [[Sections/testing/mocking/patch|unittest.mock.patch()]]

```text
constructor injection available           -> pass a fake; don't patch
third-party lib imported into your module  -> @patch("yourmodule.<imported_name>", autospec=True)
method on a class                           -> patch.object(Cls, "method")
environment variable / dict-like          -> patch.dict(os.environ, {...})
need wide-spread mock for many tests       -> @pytest.fixture(autouse=False) wrapping a patch
typo-proof signatures                       -> autospec=True (or spec_set=)
```

### [[Sections/testing/mocking/responses|responses]]

```text
code uses requests, you control it    -> responses
code uses httpx                        -> respx
need to assert request body / headers   -> responses.matchers.* (or respx equivalents)
code calls multiple HTTP libs           -> httpretty (socket-level)
third-party lib makes HTTP calls         -> mock at THEIR boundary (their client object)
```

### [[Sections/testing/mocking/httpretty|httpretty]]

```text
code uses requests / urllib                -> responses (lighter, faster, type-safe)
code uses httpx                             -> respx (httpx-native transport)
code uses aiohttp                            -> aioresponses
code uses MULTIPLE HTTP libraries             -> httpretty (socket-level catches all)
need to inspect raw bytes / headers           -> httpretty's last_request / latest_requests
need to BLOCK real network during tests       -> allow_net_connect=False (httpretty) or
                                                 pytest-socket plugin
```

### [[Sections/testing/mocking/magicmock|MagicMock]]

```text
verify a single call, exact args      -> assert_called_once_with(args)
match anything for one arg              -> ANY
stub a method                            -> mock.method.return_value = X
raise on call                            -> mock.method.side_effect = ExcClass
sequence of returns                      -> side_effect = [r1, r2, r3]
typo-safe mock                           -> MagicMock(spec_set=RealClass)
async function                           -> AsyncMock + assert_awaited*
```

### [[Sections/testing/mocking/mocker|mocker fixture]]

```text
pytest project, simple replace          -> mocker.patch (no @patch decorator)
precise method on a class                -> mocker.patch.object
keep real behavior, observe calls        -> mocker.spy
build a typo-safe fake collaborator       -> mocker.MagicMock(spec_set=Real)
project-wide mocked client (Stripe, etc.) -> wrap mocker.patch in a fixture
need to mock during fixture setup          -> mocker is fixture-friendly; @patch isn't
```

### [[Sections/testing/mocking/pytest-asyncio|pytest-asyncio]]

```text
testing async function                    -> @pytest.mark.asyncio (or asyncio_mode=auto)
FastAPI app                                -> httpx.AsyncClient + ASGITransport(app=app)
third-party async client (redis, kafka)    -> async fakes (fakeredis.aioredis, etc.)
need to test concurrency                    -> asyncio.gather inside the test
tests hanging / flaky                       -> asyncio.timeout or @pytest.mark.timeout
mocking an async function                    -> AsyncMock; assert_awaited_* not assert_called_*
```

### [[Sections/testing/advanced/coverage|pytest coverage]]

```text
small repo, single test runner       -> --cov + --cov-report=term-missing
want CI to gate on regressions        -> --cov-fail-under=N
want to see if/else paths              -> --cov-branch (always worth it)
parallel test runners                  -> --cov-append + coverage combine
PRs add code without tests              -> diff-cover with branch comparison
"100% coverage but bugs slip through"  -> mutation testing (mutmut / cosmic-ray)
browse uncovered lines locally          -> --cov-report=html
```

### [[Sections/testing/advanced/cov-config|pytest-cov configuration]]

```text
single-process pytest                  -> default config; one .coverage file
xdist / parallel runners                -> parallel = true, then coverage combine
want PR diff feedback                   -> coverage xml + diff-cover or codecov
conditional code (py 3.11 only path)    -> coverage_conditional_plugin
tests in same repo as code              -> always omit tests/ from source
pure-Python lib                          -> drop --cov-branch only on perf-critical builds
```

### [[Sections/testing/advanced/freezegun|freezegun]]

```text
greenfield code                            -> inject the clock; never use freezegun
legacy uses datetime.now() / time.time()   -> @freeze_time
need to advance time during a test          -> ft.tick(seconds=...) / ft.move_to(...)
need monotonic / perf_counter to advance    -> tick=True; or pass a fake monotonic_ns
testing across time zones                    -> freeze in UTC, convert on read
library caches "now" at import                -> apply freeze BEFORE the import
```

### [[Sections/testing/advanced/marks-config|Marks & configuration]]

```text
permanently disable                 -> @pytest.mark.skip
conditionally disable                -> @pytest.mark.skipif(...)
tracked-known-broken                  -> @pytest.mark.xfail(strict=True)
slow / I/O / external                  -> custom mark + CLI flag to opt in
triage layer in CI                      -> multiple marks (smoke / unit / integration)
third-party-flaky external test         -> @pytest.mark.flaky from pytest-rerunfailures
```

### [[Sections/testing/advanced/hypothesis|Hypothesis]]

```text
pure function with universal property      -> @given(strategy) + assertion
complex inputs depending on each other      -> @composite strategy
known edge cases must always run             -> @example(...)
long-running examples / CI flake             -> @settings(deadline=None, derandomize=True)
sequence of operations on a stateful object  -> RuleBasedStateMachine
need to scaffold property tests fast          -> hypothesis ghostwrite myapp.module
```

## Machine Learning

### [[Sections/ml/preprocessing/train_test_split|train_test_split]]

```text
i.i.d. classification              -> train_test_split(stratify=y)
one entity has many rows           -> GroupShuffleSplit
time series / forecasting          -> chronological cut OR TimeSeriesSplit
never                              -> random split on time-series data
```

### [[Sections/ml/preprocessing/standard_scaler|StandardScaler]]

```text
normal-ish numeric features        -> StandardScaler
heavy outliers / non-Gaussian      -> RobustScaler (median + IQR)
sparse matrices (TF-IDF, one-hot)  -> MaxAbsScaler (preserves sparsity)
bounded inputs needed (some NNs)   -> MinMaxScaler([0,1])
tree-based models (RF, XGBoost)    -> skip scaling entirely; not needed
inside CV / grid search            -> always wrap in Pipeline
```

### [[Sections/ml/preprocessing/minmax_scaler|MinMaxScaler]]

```text
normal-ish features                    -> StandardScaler
outliers dominate                      -> RobustScaler
bounded input required, no outliers    -> MinMaxScaler
bounded input required, with outliers  -> clip then MinMax, OR clip=True
sparse / sign-preserving               -> MaxAbsScaler
```

### [[Sections/ml/preprocessing/label_encoder|LabelEncoder]]

```text
classification target (y)             -> LabelEncoder
nominal feature, low cardinality      -> OneHotEncoder(handle_unknown="ignore")
ordinal feature with known order      -> OrdinalEncoder(categories=[...])
high-cardinality nominal (1000+)      -> TargetEncoder / hashing / embeddings
unseen labels possible at predict     -> handle_unknown="ignore" or "use_encoded_value"
tree-based model + nominal            -> OrdinalEncoder is OK (trees handle splits)
```

### [[Sections/ml/preprocessing/onehot_encoder|OneHotEncoder]]

```text
<= 50 unique categories      -> OneHotEncoder
ordinal categories           -> OrdinalEncoder
> 50 unique, low signal      -> drop or hash
> 50 unique, high signal     -> TargetEncoder (CV-safe)
```

### [[Sections/ml/preprocessing/simple_imputer|SimpleImputer]]

```text
small N, simple                 -> SimpleImputer(median/mode)
skewed numeric                  -> SimpleImputer(strategy="median")
categorical                     -> SimpleImputer(strategy="most_frequent")
feature correlations matter     -> KNNImputer(n_neighbors=5)
complex MAR patterns            -> IterativeImputer
want "was missing" as a feature -> add_indicator=True
```

### [[Sections/ml/preprocessing/column_transformer|ColumnTransformer]]

```text
mixed numeric + categorical            -> ColumnTransformer
per-type pipeline (impute then encode) -> nest Pipeline inside CT
want columns by dtype, not by name     -> make_column_selector
keep some columns untouched            -> remainder="passthrough"
drop everything not listed             -> remainder="drop" (default)
need readable feature names            -> verbose_feature_names_out=False
different transforms within one type   -> multiple tuples to same dtype
```

### [[Sections/ml/preprocessing/pipeline|Pipeline]]

```text
any preprocessing + model            -> Pipeline (always)
per-column preprocessing             -> ColumnTransformer inside Pipeline
custom feature engineering           -> FunctionTransformer step
want auto-named steps                -> make_pipeline
need to grid-search over a step      -> Pipeline + named steps__param
serialize for serving                -> joblib.dump(pipe, ...)
need pandas DataFrames at each step  -> pipe.set_output(transform="pandas")
```

### [[Sections/ml/classification/logistic_regression|LogisticRegression]]

```text
tabular baseline                  -> LogisticRegression(L2)
want feature selection inline     -> penalty="l1"
probabilities feed into decisions -> CalibratedClassifierCV
imbalanced classes                -> class_weight="balanced"
high-dim text / sparse            -> solver="saga" + penalty="l1"
multi-class                       -> default OvR (or multi_class="multinomial")
```

### [[Sections/ml/classification/decision_tree_classifier|DecisionTreeClassifier]]

```text
need an interpretable model         -> DecisionTreeClassifier (small)
need accuracy on tabular data       -> RandomForest / GradientBoosting
need both                           -> shallow tree for explanation,
                                       ensemble for production scoring
class imbalance                     -> class_weight="balanced"
feature interactions matter          -> max_depth >= 5 (let it find them)
```

### [[Sections/ml/classification/random_forest_classifier|RandomForestClassifier]]

```text
strong tabular default               -> RandomForest
need top accuracy on tabular         -> XGBoost / LightGBM / sklearn HGB
need calibrated probabilities        -> CalibratedClassifierCV(rf, cv=5)
tiny dataset                         -> LogisticRegression baseline first
honest feature importance            -> permutation_importance on test
class imbalance                      -> class_weight="balanced_subsample"
```

### [[Sections/ml/classification/svm_classifier|SVC (Support Vector Classifier)]]

```text
N < 10k, non-linear boundary       -> SVC(kernel="rbf")
N < 10k, mostly linear, fast       -> SVC(kernel="linear") or LinearSVC
N > 50k                            -> LinearSVC or SGDClassifier(hinge)
need probability outputs           -> SVC(probability=True) or calibrate
imbalanced classes                 -> class_weight="balanced"
features at very different scales  -> always StandardScaler in Pipeline
tabular tabular benchmark           -> try RF/GBM first, SVM rarely wins
```

### [[Sections/ml/classification/knn_classifier|KNeighborsClassifier]]

```text
N small (< 10k), few dims (< 30)   -> KNN with full search
N large but few dims               -> KNN with kd_tree / ball_tree
N large AND many dims              -> RandomForest or GBM
need exact KNN at huge scale       -> faiss / annoy (approximate NN)
want neighbor-weighted votes       -> weights="distance"
small k -> overfit, large k -> bias-> tune via CV in 3..30
```

### [[Sections/ml/classification/gradient_boosting_classifier|GradientBoostingClassifier]]

```text
any tabular accuracy benchmark      -> gradient boosting first
sklearn-only stack, large N         -> HistGradientBoostingClassifier
need top accuracy / GPU             -> LightGBM or XGBoost
tons of categorical columns         -> LightGBM (categorical_feature) or CatBoost
missing values in features          -> HistGBM (native NaN support)
limited tuning time, want OK        -> RandomForest baseline
probabilities feed business rules   -> calibrate (CalibratedClassifierCV)
```

### [[Sections/ml/regression/linear_regression|LinearRegression]]

```text
linear baseline                   -> LinearRegression
multicollinearity                 -> Ridge
feature selection inline          -> Lasso
outliers in y                     -> HuberRegressor / RANSAC
need p-values / CIs               -> statsmodels.OLS
non-linear pattern in residuals   -> add polynomial / move to GBM
wildly different feature scales   -> scale features before regularizing
```

### [[Sections/ml/regression/ridge_regression|Ridge]]

```text
default linear regressor          -> Ridge (alpha tuned by RidgeCV)
need feature selection             -> Lasso
correlated features + selection    -> ElasticNet
non-linear via polynomial          -> PolynomialFeatures + Ridge
non-linear, small N                -> KernelRidge(kernel="rbf")
noisy data, many features          -> raise alpha (more shrinkage)
alpha grid                         -> RidgeCV(alphas=np.logspace(-2,4,13))
```

### [[Sections/ml/regression/lasso_regression|Lasso]]

```text
feature selection inline                        -> Lasso
features correlated, want stable selection      -> ElasticNet
need unbiased coefficients on selected features -> relaxed Lasso
no selection needed, just shrinkage             -> Ridge
tune alpha via CV                               -> LassoCV / ElasticNetCV
slow convergence                                -> raise max_iter to 10000+
```

### [[Sections/ml/regression/elasticnet_regression|ElasticNet]]

```text
uncertain about correlation        -> ElasticNet (then check l1_ratio)
l1_ratio chooses ~1 in CV          -> LassoCV
l1_ratio chooses ~0 in CV          -> RidgeCV
selected mix sits 0.3..0.7         -> ElasticNet IS the right tool
need feature selection + stability -> ElasticNet over Lasso
want one CV-tuned model in 2 lines -> ElasticNetCV
```

### [[Sections/ml/regression/decision_tree_regressor|DecisionTreeRegressor]]

```text
need an interpretable model         -> DecisionTreeRegressor (max_depth<=5)
need accurate, smooth predictions   -> RandomForestRegressor or HistGBM
step-function ground truth          -> single tree is the right shape
monotonic constraint                -> HistGBM(monotonic_cst=...)
regularize complexity               -> ccp_alpha tuned in CV
predicting beyond train range       -> linear model, NOT trees (extrapolate)
```

### [[Sections/ml/regression/random_forest_regressor|RandomForestRegressor]]

```text
any tabular regression baseline      -> RandomForestRegressor (n_estimators=300)
need top accuracy                    -> HistGBM, LightGBM, or XGBoost
need prediction intervals            -> quantile_forest / NGBoost
memory-tight                         -> HistGBM (binned histograms)
honest feature impact                -> permutation_importance on test
target with long tail / outliers     -> log-transform y first, or HuberLoss
small N (< 1k)                       -> Ridge / SVR may beat trees
```

### [[Sections/ml/regression/svr_regressor|SVR (Support Vector Regressor)]]

```text
N < 10k, non-linear, smooth target  -> SVR(kernel="rbf")
linear regression at any scale      -> LinearSVR or Ridge
N < 1k, want closed-form non-linear -> KernelRidge
N > 50k                             -> tree ensemble (HistGBM)
y has long tail / outliers          -> wrap in TransformedTargetRegressor(log)
scale of features differs           -> StandardScaler IN the Pipeline
tune three knobs (C, gamma, eps)    -> GridSearchCV with Pipeline
```

### [[Sections/ml/evaluation/accuracy_score|accuracy_score]]

```text
classes ~equal frequency         -> accuracy_score (clf.score is fine)
imbalanced classes               -> balanced_accuracy_score, F1, or AUC
you care about a specific class  -> precision/recall/F1 with pos_label=
ranking quality matters          -> roc_auc_score on predict_proba
multilabel target                -> hamming_loss / subset accuracy
need a per-class breakdown       -> classification_report
```

### [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score]]

```text
FP and FN cost equal              -> max F1
FP costly (spam, fraud alerts)    -> set high precision threshold
FN costly (cancer screening)      -> set high recall threshold
ranking, not classification       -> roc_auc_score / average_precision
multiclass with class imbalance   -> f1_score(average="macro") or "weighted"
multilabel target                 -> f1_score(average="samples")
```

### [[Sections/ml/evaluation/confusion_matrix|confusion_matrix]]

```text
exact counts                       -> normalize=None
per-class recall                   -> normalize="true"
per-class precision                -> normalize="pred"
visual diagnostic                  -> ConfusionMatrixDisplay
imbalanced classes                 -> ALWAYS normalize="true"
want pos_label first               -> labels=[positive, negative] explicitly
```

### [[Sections/ml/evaluation/classification_report|classification_report]]

```text
per-class precision/recall/F1   -> classification_report (always start here)
programmatic access             -> output_dict=True
readable per-class names        -> target_names=class_names
imbalance check                 -> compare macro avg vs weighted avg
class with no predictions       -> zero_division=0 (suppress warning)
minority class is the goal      -> read its specific row, not the average
confusion source explanation    -> pair with confusion_matrix
```

### [[Sections/ml/evaluation/cross_val_score|cross_val_score]]

```text
i.i.d. classification          -> StratifiedKFold
one entity has many rows       -> GroupKFold (no leakage)
classification + groups        -> StratifiedGroupKFold
time series / forecasting      -> TimeSeriesSplit
regression, i.i.d.             -> KFold (or just cv=5)
tiny dataset (N < 100)         -> LeaveOneOut or KFold(n_splits=10)
never                          -> KFold on time-series data
```

### [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve]]

```text
balanced classes, ranking quality      -> roc_auc_score
highly imbalanced (rare positives)     -> average_precision_score
threshold matters in production        -> calibrate first
multiclass                             -> roc_auc_score(multi_class="ovr")
need a single number for tuning        -> AUC works fine as scoring=
compare across imbalance ratios        -> PR-AUC, NOT ROC-AUC
```

### [[Sections/ml/evaluation/mean_squared_error|mean_squared_error]]

```text
absolute error in y units       -> RMSE / MAE
relative / percentage error     -> MAPE (avoid near y=0)
quantile predictions            -> mean_pinball_loss(alpha=q)
stakeholder reporting           -> RMSE + a baseline comparison
outliers shouldn't dominate     -> MAE (or HuberLoss training)
you want to penalize big misses -> MSE / RMSE (squared loss)
compare across target scales    -> MAPE or normalized RMSE
```

### [[Sections/ml/evaluation/r2_score|r2_score]]

```text
single dataset, regression baseline     -> r2_score (or .score())
compare models with different #features -> adjusted R^2
compare across datasets                 -> use RMSE / MAE instead
time-series with strong trend           -> detrend or quote residual R^2
negative R^2                            -> model is worse than the mean
need a single intuitive number          -> R^2 still works as a summary
```

### [[Sections/ml/tuning/grid_search_cv|GridSearchCV]]

```text
<= 50 combos, exhaustive needed   -> GridSearchCV
50..1000 combos                   -> HalvingGridSearchCV(factor=3)
continuous / huge space           -> RandomizedSearchCV(n_iter=50)
sample-efficient, costly fits     -> Optuna / scikit-optimize (Bayesian)
data has groups                   -> cv=GroupKFold(...) + groups=
forecasting / time series         -> cv=TimeSeriesSplit
need both train and val scores    -> return_train_score=True
```

### [[Sections/ml/tuning/randomized_search_cv|RandomizedSearchCV]]

```text
small grid (< 50)                -> GridSearchCV (exhaustive)
medium grid (50..1000)           -> RandomizedSearchCV(n_iter=50)
continuous params, large space   -> RandomizedSearchCV with scipy.stats
huge space, fixed compute budget -> HalvingRandomSearchCV
compute is expensive             -> Optuna / Hyperopt (Bayesian)
want to tune learning rate (LR)  -> loguniform, NOT linear uniform
integer hyperparameters          -> scipy.stats.randint
```

### [[Sections/ml/tuning/learning_curve|learning_curve]]

```text
train high, val low, big gap        -> overfitting (regularize / shrink)
both low, small gap                  -> underfitting (more capacity)
val curve still rising at full N     -> collect more data
both flat, gap tiny                  -> feature eng. or new algorithm
curves noisy across folds            -> raise n_splits or shuffle=True
long fits, want a fast read          -> use fewer train_sizes (5)
compare two models                   -> overlay both learning curves
```

### [[Sections/ml/tuning/validation_curve|validation_curve]]

```text
one parameter to tune, want to SEE the curve   -> validation_curve
multiple parameters, just want best combo      -> GridSearchCV
parameter spans orders of magnitude            -> np.logspace range
parameter is integer count                     -> np.arange / list
parameter is regularization strength           -> np.logspace(-3, 3, 13)
need both train and val side-by-side           -> validation_curve does this
parameter inside Pipeline                      -> use "step__param" name
```

### [[Sections/ml/tuning/feature_importances|feature_importances_]]

```text
tree-based, global ranking          -> permutation_importance (NOT MDI)
linear, global ranking              -> abs(coef) * std(feature)
per-prediction explanation          -> SHAP
feature SELECTION inside Pipeline   -> SelectFromModel
correlated features in the table    -> permutation w/ correlation grouping
regression vs classification        -> permutation works for both
small dataset, fast read            -> default feature_importances_ is OK
```

### [[Sections/ml/clustering/kmeans|KMeans]]

```text
spherical clusters, similar sizes       -> KMeans
N > 1M                                  -> MiniBatchKMeans
non-spherical / overlapping clusters    -> GaussianMixture
irregular shapes / noise / unknown k    -> DBSCAN
hierarchical structure                  -> AgglomerativeClustering
need soft / probabilistic membership    -> GaussianMixture
want stable cluster ids                 -> n_init=20, fix random_state
```

### [[Sections/ml/clustering/dbscan|DBSCAN]]

```text
spherical-ish clusters, known k        -> KMeans
irregular shapes, single density       -> DBSCAN
irregular shapes, varying density      -> HDBSCAN
small N, want hierarchy                -> AgglomerativeClustering
high-dim data (> 30 features)          -> reduce dims first (PCA/UMAP)
very large N                           -> HDBSCAN with approx algorithms
need eps with no domain prior          -> k-distance plot, look for elbow
```

### [[Sections/ml/clustering/pca|PCA (Principal Component Analysis)]]

```text
linear, dense, fits in memory    -> PCA
non-linear manifold              -> KernelPCA
doesn't fit in memory            -> IncrementalPCA
sparse matrix (TF-IDF)           -> TruncatedSVD
visualization only (2D/3D)       -> t-SNE / UMAP
need a downstream model input    -> PCA(whiten=True) inside Pipeline
choose components by variance    -> n_components=0.95 (keep 95%)
```

### [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding)]]

```text
high-D visualization, one-off     -> t-SNE (init="pca", perplexity tuned)
high-D viz + downstream features  -> UMAP
linear, interpretable             -> PCA
need to embed NEW data later      -> UMAP (transform), NOT t-SNE
small dataset (< 1k)              -> low perplexity (5-15)
large dataset (> 50k)             -> reduce with PCA to 50 first, then UMAP
never                             -> t-SNE output as model features
```

### [[Sections/ml/clustering/silhouette_score|silhouette_score]]

```text
convex clusters (KMeans / GMM)        -> silhouette + DB + CH
density-based (DBSCAN / HDBSCAN)      -> noise rate + cluster persistence
labeled validation set available      -> homogeneity / completeness / V-measure
no validation possible                -> domain knowledge / visual inspection
want per-sample score                 -> silhouette_samples (find bad rows)
compare two clusterings, same data    -> Adjusted Rand Index (ARI)
high-D data, slow on big N            -> sample 1-5k rows for the score
```

### [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering]]

```text
small N, want hierarchy             -> AgglomerativeClustering
small N, k unknown                  -> AgglomerativeClustering(distance_threshold=)
large N (>10k)                      -> BIRCH or MiniBatchKMeans
compact convex clusters             -> linkage="ward" (Euclidean only)
chain-shaped / connected components -> linkage="single"
conservative tight clusters         -> linkage="complete"
need a dendrogram to inspect cuts   -> scipy.cluster.hierarchy + linkage()
```

## Deep Learning

### [[Sections/deeplearning/tensors-autograd/tensor-creation|torch.tensor]]

```text
from numpy / pandas             -> torch.from_numpy (zero-copy)
GPU staging buffer                -> empty(..., pin_memory=True)
match an existing tensor          -> *_like(reference)
constants                         -> tensor / zeros / ones with dtype=
```

### [[Sections/deeplearning/tensors-autograd/tensor-operations|Tensor Operations]]

```text
simple matmul                       -> @
batched matmul, leading dim batch    -> @ (broadcasting handles it)
batched matmul, explicit              -> torch.bmm
matmul + bias                         -> torch.addmm (one alloc)
non-trivial tensor contraction         -> torch.einsum
```

### [[Sections/deeplearning/tensors-autograd/tensor-reshaping|Reshape & View]]

```text
simple shape change                  -> reshape
guaranteed zero-copy                  -> view (after contiguous)
axis reorder                          -> permute (then contiguous if needed)
adding/removing batch dim             -> unsqueeze / squeeze
complex multi-axis rearrangement      -> einops.rearrange
```

### [[Sections/deeplearning/tensors-autograd/autograd-backward|Autograd & backward()]]

```text
standard single-loss training       -> loss.backward() (scalar, no flags)
multi-task losses sharing graph     -> sum into one scalar, backward once
need to backward twice on same graph -> retain_graph=True (rare; doubles mem)
higher-order gradients (meta, R1)    -> create_graph=True
memory-bound deep network            -> torch.utils.checkpoint
want a value but no grad flow         -> .detach() (NOT .data)
loop-only sanity readout              -> .item() AFTER backward
```

### [[Sections/deeplearning/tensors-autograd/gradient-zeroing|zero_grad()]]

```text
default training                       -> zero_grad every step
GPU memory-constrained, want big batch  -> gradient accumulation
training unstable / RNN / transformer    -> add clip_grad_norm_
never                                    -> forget zero_grad without intent
```

### [[Sections/deeplearning/tensors-autograd/gpu-device|.to(device)]]

```text
single GPU, modern hardware        -> autocast + GradScaler
small model, CPU is fine            -> skip GPU entirely
multiple GPUs                        -> torch.nn.parallel.DistributedDataParallel
Apple Silicon                        -> device="mps"
```

### [[Sections/deeplearning/tensors-autograd/no-grad-context|torch.no_grad()]]

```text
PyTorch 1.9+, simple inference        -> torch.inference_mode()
need to use the output in autograd     -> torch.no_grad() + .clone()
prediction function as an API           -> @torch.inference_mode() decorator
never                                    -> validation without model.eval()
```

### [[Sections/deeplearning/building-networks/nn-module|nn.Module]]

```text
simple stack of layers           -> nn.Sequential
custom forward / branching        -> nn.Module subclass
list of same-shape sublayers      -> nn.ModuleList
named branches / multi-task        -> nn.ModuleDict
non-trainable persistent state     -> register_buffer (not attribute)
```

### [[Sections/deeplearning/building-networks/nn-linear|nn.Linear]]

```text
fixed input shape, simple MLP        -> nn.Linear(in, out)
followed by BatchNorm / LayerNorm     -> nn.Linear(in, out, bias=False)
input shape unknown until forward     -> nn.LazyLinear(out)
ReLU/GELU activation on output         -> kaiming_normal_ init
tanh / sigmoid activation              -> xavier_normal_ init
final classifier / regression head     -> small init (e.g. std=0.02)
need quantization later                 -> avoid LazyLinear (no shape)
```

### [[Sections/deeplearning/building-networks/nn-sequential|nn.Sequential]]

```text
strictly linear stack            -> nn.Sequential
skip / residual / multi-output    -> nn.Module subclass
variable depth                     -> nn.Sequential(*list) OR ModuleList
want named-layer access            -> Sequential(OrderedDict([...]))
```

### [[Sections/deeplearning/building-networks/activation-functions|Activation Functions]]

```text
hidden default                  -> nn.ReLU
transformer / modern arch        -> nn.GELU or nn.SiLU
ReLU dying                       -> nn.LeakyReLU
binary classifier output         -> raw logits + BCEWithLogitsLoss
multiclass output                 -> raw logits + CrossEntropyLoss
probability needed in production  -> apply sigmoid/softmax AFTER predict
```

### [[Sections/deeplearning/building-networks/nn-conv2d|nn.Conv2d]]

```text
standard conv block               -> Conv2d + BatchNorm + ReLU (bias=False)
parameter-efficient                -> DepthwiseSeparable (groups=in_ch + 1x1)
parallel branches                   -> groups= > 1
upsampling                          -> Upsample(bilinear) + Conv2d
```

### [[Sections/deeplearning/building-networks/nn-lstm|nn.LSTM]]

```text
short sequences (<50), simple    -> nn.LSTM
long sequences (>100)             -> Transformer (better long-range)
variable-length batches           -> pack_padded_sequence
training unstable                 -> clip_grad_norm_(max_norm=1.0)
bidirectional context needed      -> bidirectional=True
```

### [[Sections/deeplearning/training-loop/loss-functions|Loss Functions]]

```text
multiclass classification           -> CE (label_smoothing=0.1 in prod)
imbalanced multiclass                -> CE(weight=) or Focal
binary / multilabel                   -> BCEWithLogitsLoss(pos_weight=)
regression, normal noise              -> MSELoss
regression, outliers                   -> SmoothL1Loss / L1Loss
sequence with padding                  -> CE(ignore_index=PAD_ID)
```

### [[Sections/deeplearning/training-loop/optimizers|Optimizers (SGD, Adam)]]

```text
transformer / NLP / modern arch       -> AdamW (lr ~1e-3 to 1e-4)
image models from scratch              -> SGD + momentum (lr ~0.1)
fine-tuning                            -> AdamW with per-group lr
fast convergence                        -> OneCycleLR
transformer training                    -> warmup + cosine schedule
training unstable                       -> add gradient clipping + warmup
```

### [[Sections/deeplearning/training-loop/dataloader|DataLoader]]

```text
tabular / fixed-shape data         -> TensorDataset + DataLoader
I/O per item (images, files)        -> custom Dataset + num_workers
variable-length sequences           -> collate_fn with pad_sequence
class imbalance                      -> WeightedRandomSampler
long training (many epochs)         -> persistent_workers=True
```

### [[Sections/deeplearning/training-loop/training-loop-pattern|Training Loop Pattern]]

```text
debugging / tiny model         -> intro 5-line loop is enough
normal training run            -> junior loop, plus a scheduler
GPU training, real data        -> senior loop (AMP + clip + schedule)
distributed / multi-GPU        -> wrap with DistributedDataParallel
```

### [[Sections/deeplearning/training-loop/model-train-eval|model.train() vs model.eval()]]

```text
any validation / test pass        -> model.eval() + torch.no_grad()
single-sample API inference       -> @torch.inference_mode()
fine-tuning a pretrained backbone -> freeze BN with .eval() per module
batch size 1 with BatchNorm       -> switch to GroupNorm or LayerNorm
```

### [[Sections/deeplearning/training-loop/save-load-model|torch.save / torch.load]]

```text
inference / sharing weights         -> save state_dict only
resuming training                   -> bundle model + optimizer + scheduler + epoch
loading on different device         -> map_location is mandatory
third-party / downloaded weights    -> weights_only=True
fine-tuning with new head           -> load_state_dict(state, strict=False)
```

### [[Sections/deeplearning/cnns-vision/conv2d-architecture|CNN Architecture]]

```text
tiny dataset / quick baseline    -> SmallCNN above
ImageNet-scale or transfer-ready -> torchvision.models (ResNet, ConvNeXt)
need any-input-size head         -> AdaptiveAvgPool, NEVER hardcoded Flatten
fixed-input MLP head             -> Flatten + Linear is fine
```

### [[Sections/deeplearning/cnns-vision/maxpool2d|nn.MaxPool2d]]

```text
classic / small-data CNN          -> MaxPool2d(2) between conv blocks
modern ResNet-style               -> strided Conv2d, no separate pool
need fixed-size head from any HW  -> AdaptiveAvgPool2d(1) + Linear
detection / segmentation upsample -> avoid pooling — use stride + skip connections
```

### [[Sections/deeplearning/cnns-vision/batchnorm2d|nn.BatchNorm2d]]

```text
batch_size >= 16, single GPU         -> BatchNorm2d
batch_size 1-8 (detection, 3D, RNNs) -> GroupNorm or LayerNorm
distributed / multi-GPU              -> SyncBatchNorm
transformers / per-token features    -> LayerNorm, never BN
fine-tuning a pretrained CNN         -> freeze BN with .eval() per module
```

### [[Sections/deeplearning/cnns-vision/dropout|nn.Dropout]]

```text
MLP / transformer FFN              -> nn.Dropout(0.1 - 0.5)
conv feature maps                  -> nn.Dropout2d (rare; usually unneeded)
model with BatchNorm everywhere    -> usually no Dropout
small dataset, big model           -> raise Dropout p before adding L2
right before the final Linear      -> p = 0 (don't corrupt logits)
```

### [[Sections/deeplearning/cnns-vision/torchvision-transforms|torchvision Transforms]]

```text
transfer learning from ImageNet      -> ImageNet mean/std, RandomResizedCrop+HFlip
training from scratch on own data    -> compute dataset_stats() above
strong baseline with one knob        -> TrivialAugmentWide or RandAugment
detection / segmentation             -> v2 with bbox/mask-aware transforms
small dataset, big model             -> heavier augmentation (Mixup, CutMix)
```

### [[Sections/deeplearning/cnns-vision/transfer-learning|Transfer Learning]]

```text
tiny dataset (< 1k images)         -> freeze body, train head only
medium dataset, similar domain     -> discriminative LRs, body 10-100x slower
large dataset, different domain    -> full fine-tune, normal LR
need <1ms inference                -> mobilenet_v3 / efficientnet, not resnet50
```

### [[Sections/deeplearning/nlp-sequences/embedding-layer|nn.Embedding]]

```text
tiny dataset, generic text         -> Embedding.from_pretrained(GloVe), freeze=True
medium dataset, fine-tune          -> from_pretrained with freeze=False
training a transformer LM          -> random init + weight tying with lm_head
very large vocab on CPU            -> sparse=True + SparseAdam
variable-length batches            -> always set padding_idx so PAD doesn't update
```

### [[Sections/deeplearning/nlp-sequences/rnn-patterns|RNN / GRU Patterns]]

```text
variable-length batches            -> pack_padded_sequence (correct + fast)
fixed-length sequences             -> plain forward, batch_first=True
sequence classification (one out)  -> use h_n[-1] (or concat fw+bw if bi)
sequence tagging (per-token out)   -> use the full output tensor
long context (> ~500 tokens)       -> switch to a transformer; RNNs forget
```

### [[Sections/deeplearning/nlp-sequences/lstm-patterns|LSTM Patterns]]

```text
short sequences (< 100 tokens)     -> nn.LSTM is fine, fast, well-trodden
long context (>~ 500 tokens)       -> Transformer (TransformerEncoderLayer)
tiny dataset, sequence classifier  -> GRU (fewer params than LSTM)
need cell-state introspection      -> stick with LSTM (GRU has no c_t)
variable-length sequences          -> always pack_padded_sequence
```

### [[Sections/deeplearning/nlp-sequences/attention-mechanism|Attention Mechanism]]

```text
training a transformer in PyTorch 2.x   -> F.scaled_dot_product_attention
need easy-to-debug attention weights    -> nn.MultiheadAttention with average_attn_weights=False
autoregressive LM / decoder             -> causal mask (or is_causal=True)
variable-length batches                 -> key_padding_mask, every layer
very long context (> 4k tokens)         -> FlashAttention via SDPA backend
```

### [[Sections/deeplearning/nlp-sequences/tokenization-padding|Tokenization & Padding]]

```text
short sequences (<=128 tokens)        -> dynamic padding per batch is fine
variable but bounded (<=512)          -> truncate + per-batch pad
wildly variable lengths               -> bucket batching, +30-50% throughput
transformers                          -> attention mask, no pack_padded
RNN/GRU/LSTM                          -> pack_padded_sequence is mandatory
```

### [[Sections/deeplearning/nlp-sequences/subword-tokenization|Subword Tokenization]]

```text
pretrained model on standard text         -> AutoTokenizer.from_pretrained(MODEL)
training a new tokenizer from scratch     -> tokenizers library, BPE for code, Unigram for multilingual
adding domain words                        -> add_tokens + resize_token_embeddings
token-level labels (NER, tagging)          -> is_split_into_words + offset_mapping
distributed dataloader bottleneck          -> use_fast=True, multiprocessing-safe
```

## Statistics & Probability

### [[Sections/stats/descriptive-stats-py/descriptive-stats|mean, median, mode, variance, std]]

```text
roughly symmetric, no outliers       -> mean + std
skewed or heavy-tailed                -> median + MAD or IQR
need both center AND robustness       -> trimmed mean (5-20% trim)
reporting to a stakeholder            -> mean AND median; let the gap tell the story
compare across scales                  -> coefficient of variation (std/mean)
```

### [[Sections/stats/descriptive-stats-py/standard-deviation|std, var, sem, coefficient of variation]]

```text
normal-ish, no outliers              -> std + SEM (for CIs)
skewed or heavy-tailed                -> MAD or IQR; CIs via bootstrap
compare variability across SCALES     -> coefficient of variation (std/mean)
compare mean uncertainty               -> SEM, never std
one-shot summary for a paper/report   -> report n, mean, sd, AND median, IQR
```

### [[Sections/stats/descriptive-stats-py/percentiles-iqr|np.percentile, IQR, boxplot]]

```text
exploratory summary                -> np.percentile([25,50,75]) + Tukey fences
billing / SLA threshold              -> method='lower' or 'higher' (no half-points)
heavy-tailed / many outliers          -> MAD-based rule, not IQR
weighted samples (frequency, exposure) -> custom weighted_quantile, not np.percentile
need rolling percentiles               -> pandas .rolling().quantile()
```

### [[Sections/stats/descriptive-stats-py/correlation|pearsonr, spearmanr, kendalltau]]

```text
linear, ratio/interval, normal-ish    -> Pearson
monotonic but nonlinear, ordinal      -> Spearman
small n, lots of ties, ordinal         -> Kendall τ (more conservative than Spearman)
any outliers / heavy tails             -> Spearman or Kendall, never Pearson
confounding suspected                  -> partial correlation, then re-test
need uncertainty                        -> CI on r (built-in for Pearson, bootstrap otherwise)
```

### [[Sections/stats/descriptive-stats-py/covariance|np.cov, pandas .cov(), .corr()]]

```text
exploratory data analysis             -> df.cov() / df.corr() and inspect
features for ML / linear models        -> standardize first; cov of standardized = corr
outliers suspected                      -> MinCovDet (robust) or Spearman corr
high-dim, small n (cov is singular)     -> Ledoit-Wolf shrinkage
portfolio / risk modeling                -> exponentially weighted cov, not equal-weight
missing data                              -> understand pairwise (more bias) vs listwise (less data)
```

### [[Sections/stats/distributions-py/normal-distribution|scipy.stats.norm]]

```text
roughly bell-shaped, light tails       -> norm
bell-shaped but heavy tails / outliers  -> Student-t
bounded outcomes (0 to 1, percent)       -> beta
all-positive, skewed                      -> lognormal or gamma
counts                                     -> poisson / negbin (NOT normal)
tail probability < 1e-10                  -> sf / logsf, never 1 - cdf
```

### [[Sections/stats/distributions-py/probability-distributions|binomial, poisson, exponential, uniform]]

```text
N independent yes/no trials, fixed N             -> Binomial
rare events in time/space, rate constant         -> Poisson
counts BUT var > mean (overdispersed)             -> NegBinomial
waiting time between Poisson events               -> Exponential
sum of k independent exponentials                  -> Gamma (shape=k)
rate / proportion bounded in [0,1]                 -> Beta
product of many small effects                      -> Lognormal
max of many samples                                  -> Gumbel / GEV
anything fits a Bell                                 -> Normal LAST, after the others fail
```

### [[Sections/stats/distributions-py/confidence-intervals|scipy.stats.t.interval, bootstrap]]

```text
mean of one sample, normal-ish      -> stats.t.interval
any statistic, no parametric assumption -> stats.bootstrap, method='BCa'
proportion / binary outcome           -> Wilson (binomtest.proportion_ci)
variance / std                         -> chi-squared pivotal
difference of means                    -> ttest_ind(...).confidence_interval()
small n AND skewed                     -> bootstrap BCa, n_resamples >= 10_000
extreme quantiles (95th, 99th)         -> EVT; bootstrap underestimates
```

### [[Sections/stats/distributions-py/central-limit-theorem|CLT simulation]]

```text
light-tailed, independent, n >= 30   -> classical CLT; t-test / z-test work
heavy-tailed (var infinite)            -> CLT fails; use medians + bootstrap
bounded (proportions, rates)            -> need n*p, n*(1-p) >= 10
strong autocorrelation (time series)    -> block bootstrap, NOT plain CLT
tiny n (< 10) even on normal data       -> exact tests (permutation, Fisher)
```

### [[Sections/stats/hypothesis-testing-py/t-test|ttest_1samp, ttest_ind, ttest_rel]]

```text
one sample vs a number               -> ttest_1samp
two independent groups, equal var     -> ttest_ind(equal_var=True)
two independent groups (default)      -> ttest_ind(equal_var=False) — Welch
paired / repeated measures             -> ttest_rel
non-normal AND small n                  -> Mann-Whitney U or permutation_test
non-normal AND paired                   -> Wilcoxon signed-rank
directional hypothesis pre-registered   -> alternative="less"/"greater"
```

### [[Sections/stats/hypothesis-testing-py/anova-test|scipy.stats.f_oneway]]

```text
3+ groups, normal, equal var          -> stats.f_oneway -> Tukey HSD
3+ groups, normal, unequal var         -> Welch ANOVA -> Games-Howell post-hoc
3+ groups, non-normal / ordinal        -> stats.kruskal -> Dunn's test
2 factors / interaction                 -> two-way ANOVA via statsmodels
repeated measures (same subjects)       -> repeated-measures ANOVA (pingouin.rm_anova)
```

### [[Sections/stats/hypothesis-testing-py/chi-squared|scipy.stats.chi2_contingency]]

```text
2x2 with any expected count < 5      -> stats.fisher_exact
r x c with sparse cells               -> G-test (lambda_="log-likelihood")
r x c, expected counts >= 5           -> stats.chi2_contingency
one variable vs expected proportions  -> stats.chisquare (goodness of fit)
want to know WHICH cell is unusual    -> standardized residuals; flag |z| > 2
paired/repeated measurements           -> McNemar (or its k-variant: Cochran's Q)
ordinal categories                      -> Cochran-Armitage trend test
```

### [[Sections/stats/hypothesis-testing-py/mann-whitney|scipy.stats.mannwhitneyu]]

```text
2 unmatched groups, non-normal       -> Mann-Whitney U
2 paired/repeated measurements       -> Wilcoxon signed-rank
3+ unmatched groups, non-normal       -> Kruskal-Wallis -> Dunns post-hoc
3+ paired (same subjects, k conditions) -> Friedman test
small n with ties / want exact          -> permutation_test
normal data, no outliers                 -> use the parametric test (t / ANOVA) for power
```

### [[Sections/stats/hypothesis-testing-py/multiple-testing|statsmodels.stats.multitest.multipletests]]

```text
exploratory hypothesis generation       -> fdr_bh (FDR), q < 0.05 - 0.10
confirmatory test, must avoid any FP    -> holm (FWER) — never bonferroni alone
genomics / many correlated tests         -> fdr_by, OR permutation maxT
pre-registered single primary test        -> NO correction; correct only the secondary tests
garden of forking paths (decided after seeing data) -> the only fix is pre-registration
```

### [[Sections/stats/regression-stats-py/simple-linear-regression|scipy.stats.linregress]]

```text
1 predictor, quick look                -> scipy.stats.linregress
need full inference + diagnostics      -> statsmodels OLS
outliers / heavy tails                  -> RLM (robust regression)
heteroscedasticity (BP rejects)         -> OLS with cov_type="HC3"
correlated errors (time series)         -> GLS or Newey-West SEs
nonlinear true relationship              -> add polynomial terms or use GAM
```

### [[Sections/stats/regression-stats-py/multiple-regression|statsmodels.formula.api.ols]]

```text
inference focus (which coef matters)   -> statsmodels OLS, report CIs
prediction focus                          -> sklearn + cross-val R^2 / MAE
collinear predictors (VIF > 10)            -> drop one, OR Ridge / Lasso (sklearn)
heteroscedasticity                          -> cov_type="HC3" or "HAC" for time series
nested model comparison                     -> ANOVA F-test (anova_lm) on the two fits
non-nested model comparison                 -> AIC (or BIC if you prefer parsimony)
```

### [[Sections/stats/regression-stats-py/logistic-regression-stats|statsmodels.formula.api.logit]]

```text
inference (which feature matters)         -> statsmodels logit, report CIs and ORs
prediction (production scoring)             -> sklearn LogisticRegression with regularization
class imbalance for INFERENCE                -> no weighting; check calibration
class imbalance for CLASSIFICATION            -> tune threshold via business cost
probabilities feed business decisions         -> calibrate with isotonic / Platt
complete separation (huge coefs, infinite OR) -> regularize (L2) or Firth
```

### [[Sections/stats/regression-stats-py/cross-validation|sklearn.model_selection.cross_val_score, StratifiedKFold]]

```text
classification, IID rows               -> StratifiedKFold (always shuffle, seed)
regression, IID rows                    -> KFold(shuffle=True)
multiple rows per subject/group         -> GroupKFold or LeaveOneGroupOut
time series                              -> TimeSeriesSplit (no shuffle)
tiny dataset (n < 100)                   -> RepeatedStratifiedKFold for stable estimate
reporting performance after tuning        -> nested CV; otherwise youre lying about CV scores
```

### [[Sections/stats/regression-stats-py/bootstrap|numpy bootstrap resampling]]

```text
any IID statistic, want a CI            -> stats.bootstrap, method='BCa'
tiny n with skew                         -> bootstrap is essential; n_resamples >= 10_000
regression slope CI / model statistic   -> bootstrap rows (paired=True)
time series                               -> block bootstrap, block ~ sqrt(n)
stratified design                          -> resample WITHIN strata
need a permutation test instead           -> stats.permutation_test (different goal)
```

### [[Sections/stats/regression-stats-py/effect-size|Cohen's d, eta-squared]]

```text
reporting any p-value            -> ALSO report effect size + 95% CI
small n (n < 30 per group)       -> Hedges g, not Cohens d (less biased)
ANOVA with unequal n               -> omega^2; eta^2 inflates with imbalance
noisy / heavy-tailed                 -> rank-based effect sizes (rank-biserial)
```

### [[Sections/stats/regression-stats-py/power-analysis|statsmodels.stats.power functions]]

```text
prospective study planning           -> solve for n given (effect, alpha, power)
post-hoc on a small study             -> compute MDE; "we could only detect d > X"
nonparametric or mixed-effects        -> simulation power, not closed-form formulas
pilot study to estimate effect         -> use the LOWER bound of the d CI for planning
multi-arm trial                         -> ANOVA power; then plan post-hoc Tukey power separately
```

### [[Sections/stats/regression-stats-py/descriptive-stats-full|pandas.describe(), groupby stats]]

```text
quick EDA                              -> df.describe() + groupby().describe()
structured report / dashboard           -> named aggregations into a flat frame
skewed / heavy-tailed columns           -> median + IQR + MAD, not mean + std
missing-data audit                       -> count vs size; never trust mean if count drops
time-series-like rolling stats           -> shift(1) or closed='left' to prevent leakage
categorical groupby                      -> observed=True (ignore unused categories)
```

## Advanced Python

### [[Sections/advanced/decorators/function-decorators|Function Decorators — Wrapping & Enhancing Functions]]

```text
add cross-cutting behavior to N functions -> simple @wraps decorator
need to share state across calls            -> class decorator (__call__)
need configuration                            -> parameterized (3-level nest)
keep precise types for users                  -> ParamSpec + TypeVar (3.10+)
wrapping ASYNC functions                       -> branch on inspect.iscoroutinefunction
memoization                                    -> functools.lru_cache, NOT hand-rolled
```

### [[Sections/advanced/decorators/class-decorators|Class Decorators & Descriptor Protocol]]

```text
add a method / behavior to one class    -> class decorator
collect EVERY subclass into a registry   -> __init_subclass__ on the base
reusable validated/computed attribute      -> descriptor (__set_name__ + __get__/__set__)
need to control HOW the class is created    -> metaclass (rare; last resort)
modern Python                                -> dataclasses + Protocols beat hand-rolled metaprogramming
```

### [[Sections/advanced/context-managers/context-manager-patterns|Context Managers — Resource Management & State]]

```text
single resource, simple cleanup        -> @contextmanager
instance state / multiple methods       -> class with __enter__/__exit__
N resources, count unknown               -> ExitStack
async resources                           -> @asynccontextmanager + AsyncExitStack
"ignore this specific error"               -> with suppress(SomeExc)
conditional 'with' branch                  -> nullcontext
wrap legacy .close() object                 -> closing(obj)
```

### [[Sections/advanced/context-managers/generators-advanced|Advanced Generators & Itertools]]

```text
stream items, constant memory          -> generator function (yield)
inline / one-liner                       -> generator expression
delegate to a sub-generator               -> yield from
send values into the gen                  -> generator + .send() + priming
bounded N from a huge iterator             -> itertools.islice
chunks of N                                  -> itertools.batched (3.12+)
running totals / pairwise / sliding         -> itertools.accumulate / pairwise
need to consume a stream twice              -> list it OR itertools.tee (carefully)
```

### [[Sections/advanced/pathlib-logging/pathlib-patterns|pathlib — Modern File Path Handling]]

```text
compose paths                              -> Path / "subdir" / "file"
read small file                              -> .read_text(encoding="utf-8")
read huge file                                -> .open() + iterate; never read_text
make sure dir exists                           -> mkdir(parents=True, exist_ok=True)
write that must survive crash                  -> tempfile + os.replace (atomic)
user-supplied path component                    -> resolve + sandbox check
recursive search                                -> rglob, NOT walk in modern code
```

### [[Sections/advanced/pathlib-logging/logging-config|logging — Structured Application Logging]]

```text
library code                              -> getLogger(__name__); NO basicConfig
app entry point                            -> dictConfig once at startup
structured / search by field                -> JSON formatter + extra={...}
correlate logs to one request               -> ContextVar + Filter
exception path                              -> log.exception() inside except
noisy library                                -> per-logger level (e.g. sqlalchemy.engine WARNING)
```

### [[Sections/advanced/typing-dataclasses/typing-advanced|Advanced Type Hints — Protocols, TypeVar, Overload]]

```text
"any object with these methods"            -> Protocol (NOT inheritance)
keep input/output types in sync             -> TypeVar
restrict TypeVar to a fixed set             -> TypeVar(..., int, float) (constraints)
                                               or bound= for a base class
different return types per input             -> @overload
narrow type inside an if                     -> TypeGuard
wrap a function and keep its signature       -> ParamSpec + TypeVar
isinstance() check on a Protocol             -> @runtime_checkable
```

### [[Sections/advanced/typing-dataclasses/dataclasses-advanced|Dataclasses — Advanced Patterns]]

```text
simple value object                       -> @dataclass
immutable / hashable                       -> @dataclass(frozen=True, slots=True)
memory-critical, many instances             -> slots=True
need to sort                                  -> @dataclass(order=True)
API payload / runtime validation             -> Pydantic BaseModel
converters, hooks, more declarative           -> attrs library
mutable default                                -> field(default_factory=list)
```

### [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation]]

```text
collect every subclass into a registry      -> __init_subclass__ on the base
add behavior to one class                    -> class decorator
reusable validated/computed attribute         -> descriptor (__set_name__ + __get__/__set__)
need ABC / Enum / Django-Model behavior       -> the existing metaclass (don't roll your own)
need to ENFORCE a contract on every subclass  -> __init_subclass__, then metaclass last
want a singleton                                -> module-level instance, NOT SingletonMeta
```

### [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes]]

```text
one validated/computed attribute, single class -> @property / @setter
reusable rule across many fields                -> custom data descriptor
expensive pure computation, cache forever        -> @cached_property (non-data)
need to store private state                      -> __set_name__ + _<name> attr
precise types for users                            -> Generic[T] + @overload on __get__
read-heavy hot path                                -> cache in instance __dict__
```

### [[Sections/advanced/metaprogramming/slots-advanced|__slots__ — Memory Optimization]]

```text
< 1000 instances expected             -> NO slots (complexity not worth it)
millions of small instances            -> __slots__ (or @dataclass(slots=True))
need dynamic attributes "sometimes"     -> __slots__ + ("__dict__",)
need weakref to slotted instances       -> __slots__ + ("__weakref__",)
modern Python                            -> @dataclass(slots=True)  (3.10+)
multiple inheritance with slots         -> at most ONE parent with non-empty slots
```

### [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement]]

```text
"anything with .read()", any caller       -> Protocol (structural)
strict family of types YOU control          -> ABC + @abstractmethod
need a sequence / mapping / set              -> inherit from collections.abc
need typed interface                          -> Generic ABC (or Protocol[T])
isinstance check on duck-typed shape         -> @runtime_checkable Protocol
"this third-party class implements my IF"    -> ABC.register(ThatClass)
```

### [[Sections/advanced/advanced-patterns-py/singleton-pattern|Singleton Pattern — Global Unique Instance]]

```text
"I want one logger / cache / pool"            -> module-level instance
"Several classes need this pattern"            -> metaclass + lazy lock
"It's expensive and might never be used"       -> @lru_cache(maxsize=1) factory
"Different envs need different instances"      -> drop singleton; use DI
"I can't write tests for this anymore"         -> drop singleton; use DI
```

### [[Sections/advanced/advanced-patterns-py/observer-pattern|Observer Pattern — Event System & Pub/Sub]]

```text
in-process, single subject              -> WeakSet + try/except per callback
many event TYPES                          -> EventBus (event -> [callbacks])
methods that should auto-unsubscribe      -> weakref.WeakMethod
async handlers                             -> AsyncBus + asyncio.gather
cross-process / multi-host                  -> external broker; not Python pubsub
need ordering / replay / persistence        -> Kafka or similar; observer pattern is in-memory
```

### [[Sections/advanced/advanced-patterns-py/mixin-pattern|Mixin Pattern — Composable Behaviors]]

```text
add ONE behavior to many classes          -> mixin
add behavior that needs subclass HOOK     -> ABC + mixin
"subclass needs a JSON serializer"          -> composition (delegate object), NOT inheritance
diamond inheritance                         -> super() everywhere; trust C3
mixin needs init args                        -> *args, **kwargs; pass via super()
mixin shares a name with another             -> rename or use composition
```

### [[Sections/advanced/advanced-patterns-py/dataclass-advanced|Dataclasses Advanced — Frozen, Post Init, Inheritance]]

```text
simple value object                       -> @dataclass
immutable / hashable / dict key            -> @dataclass(frozen=True)
API payload, JSON in, JSON out             -> Pydantic BaseModel
converters / pre-process arguments          -> attrs (or @dataclass + InitVar)
raw speed (encoding/decoding hot path)      -> msgspec.Struct
computed-only field, not in __init__        -> field(init=False) + __post_init__
```

## Concurrency & Parallelism

### [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering]]

```text
N concurrent calls, fail-fast              -> async with TaskGroup() (3.11+)
N concurrent calls, tolerate failures       -> asyncio.gather(..., return_exceptions=True)
single deadline                              -> async with asyncio.timeout(s)
blocking library inside async code           -> asyncio.to_thread / loop.run_in_executor
long-lived background worker                 -> create_task; handle CancelledError
inside Jupyter / FastAPI                     -> NEVER asyncio.run; just await
CPU-bound work                                -> NOT async; ProcessPoolExecutor
```

### [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming]]

```text
bound concurrency to N                  -> Semaphore(N) inside the async fn
N producers, M consumers, queue        -> Queue(maxsize=) for backpressure
results need order                       -> gather (results in submit order)
N items, all-or-nothing semantics       -> TaskGroup + create_task
stream of pages / events                  -> async generator, async for
shutdown a long-lived pool                 -> q.join() + cancel workers
```

### [[Sections/concurrency/threading/threading-basics|threading — Concurrent I/O with Threads]]

```text
I/O concurrency, simple                  -> ThreadPoolExecutor.map
need progress / error per task            -> submit + as_completed
shared mutable state                       -> Lock; RLock for re-entrant code
per-thread context (request id, db conn)   -> threading.local()
coordinate shutdown across threads          -> threading.Event
pure-Python CPU work                        -> ProcessPoolExecutor instead
tens of thousands of small tasks            -> async I/O instead of threads
```

### [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work]]

```text
pure-Python CPU, > ~100 ms per task     -> ProcessPoolExecutor
numpy / sklearn (release GIL)            -> threads OFTEN beat processes
I/O-bound                                 -> threads or async
need shared state                          -> initializer + module global, OR shared_memory
need cross-host parallelism                -> Dask / Ray
thousands of tiny tasks                    -> chunksize=N to amortize IPC
```

### [[Sections/concurrency/subprocess/subprocess-run|subprocess — Running External Commands]]

```text
one-shot command, small output       -> subprocess.run(..., capture_output=True)
long-running, watch progress          -> Popen + iterate stdout
chain of unix commands                 -> Popen pipeline, NEVER shell=True
user-supplied input                    -> list form ALWAYS (no string interpolation)
needs deadline                          -> timeout= (run) or wait(timeout=) (Popen)
spawns child processes                  -> start_new_session=True + os.killpg on cleanup
need exit code only                      -> subprocess.call (don't capture if you don't need it)
```

### [[Sections/concurrency/concurrent-futures/threadpool-executor|ThreadPoolExecutor — High-Level Thread Pool]]

```text
blocking I/O                                  -> ThreadPoolExecutor.map / submit
numpy / sklearn (release GIL)                 -> ThreadPoolExecutor is FINE
pure-Python CPU                                -> ProcessPoolExecutor
ASYNC code path needs blocking call           -> asyncio.to_thread(fn, *args)
long-lived service                              -> create ONE executor at startup
need progress per task                          -> as_completed
need to enforce a deadline                      -> future.result(timeout=...)
```

### [[Sections/concurrency/concurrent-futures/processpool-executor|ProcessPoolExecutor — High-Level Process Pool for CPU Work]]

```text
pure-Python CPU work, > ~100 ms per task   -> ProcessPoolExecutor + chunksize
I/O-bound                                    -> ThreadPoolExecutor or asyncio
numpy / scientific libs                      -> ThreadPoolExecutor (releases GIL)
ML inference per request                      -> initializer to load model once per worker
need shared state                              -> initializer + module global; or shared_memory
distributed compute                            -> Dask / Ray
```

### [[Sections/concurrency/concurrent-futures/futures-patterns|Futures Patterns — Wait, Timeout & Cancellation]]

```text
one task with a deadline                 -> future.result(timeout=N)
N tasks, react to FIRST done              -> wait(..., return_when=FIRST_COMPLETED)
N tasks, fail fast on any error            -> wait(..., return_when=FIRST_EXCEPTION) + cancel pending
stream results to downstream consumer      -> add_done_callback (no thread blocked waiting)
service shutdown                            -> ex.shutdown(wait=True, cancel_futures=True)
transient failures expected                 -> retry with exponential backoff in caller
need to interrupt a RUNNING task            -> cooperative Event flag, not future.cancel()
```

### [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio]]

```text
script entry point                          -> asyncio.run(main())
already inside a loop (FastAPI / Jupyter)    -> await directly; NEVER asyncio.run
need the loop object inside async            -> asyncio.get_running_loop()
need to await a blocking function             -> asyncio.to_thread(fn) (3.9+)
network-heavy server, want speed              -> uvloop.install() at startup
integrating a callback-style C library        -> loop.call_soon / loop.call_later
debugging "task was never awaited"            -> asyncio.run(main(), debug=True)
```

### [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP]]

```text
simple text protocol                   -> readline() with newline framing
binary or variable-length messages      -> length-prefix (struct + readexactly)
per-connection deadline                  -> async with asyncio.timeout(s) (3.11+)
service shutdown                          -> server.close() + wait_closed()
keep-alive / many connections             -> set tcp_keepalive on the underlying socket
need TLS                                   -> pass ssl=ssl_context to start_server
```

### [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization]]

```text
no awaits in critical section          -> NO lock needed (coroutines are cooperative)
read-modify-write across awaits         -> asyncio.Lock
bound concurrency to N                  -> Semaphore(N) (or BoundedSemaphore for safety)
broadcast "ready"                        -> Event (set/clear)
wait until predicate                     -> Condition + wait_for(predicate)
per-resource exclusion (cache key, etc.) -> dict of asyncio.Locks
sync code that calls async               -> NEVER use asyncio.Lock there; use threading.Lock
```

### [[Sections/concurrency/asyncio-deep/asyncio-timeout|asyncio Timeouts & Cancellation]]

```text
single coroutine deadline                  -> asyncio.wait_for(coro, t)
multi-step block, one budget                -> async with asyncio.timeout(t) (3.11+)
protect a critical op from outer cancel     -> asyncio.shield(coro)
batch fan-out with deadline                  -> TaskGroup nested in timeout()
cleanup on cancel                            -> try/except CancelledError, then RAISE
need to NEVER cancel a step                  -> shield + run it to completion
```

### [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API]]

```text
pure-Python CPU, > 100 ms per task        -> Pool.map / Pool.imap_unordered
numeric heavy lifting (numpy/sklearn)      -> threads often beat processes
need a Future-style API                     -> ProcessPoolExecutor
want streaming results (any order)          -> imap_unordered + chunksize
per-worker heavy resource                   -> initializer + module global
long-running service                          -> set_start_method("spawn") for stability
```

### [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication]]

```text
one-to-many work distribution         -> Queue (or JoinableQueue if waiting on completion)
strictly two endpoints, request/reply  -> Pipe
need bounded backpressure              -> Queue(maxsize=N)
wait for ALL items processed           -> JoinableQueue + q.join()
poll multiple connections               -> multiprocessing.connection.wait
shipping huge arrays                     -> shared_memory, NOT Queue.put
```

### [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager]]

```text
one int counter / latch                  -> Value (with explicit Lock if hot)
small fixed-size numeric array            -> Array
shared dict / list / Namespace             -> Manager (low-frequency only)
huge numpy / image data, hot loop          -> shared_memory + np.ndarray
coordinating completion / status            -> Queue or Event, not shared dict
anything you can model as messages          -> Queue / Pipe; avoid shared state
```

### [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives]]

```text
guard a critical section across procs    -> Lock (with timeout in production)
re-entrant from same process              -> RLock
bound concurrent processes to N           -> Semaphore(N)
stage a parallel pipeline                 -> Barrier(N)
need wait-for-condition                    -> Condition (lock + signal)
one-shot start signal                      -> Event
lock + Manager dict in hot loop            -> redesign — use Queue messages
```

### [[Sections/concurrency/threading-patterns/threading-lock|threading Synchronization — Lock, Condition, Event, Semaphore]]

```text
shared mutable state                        -> Lock (RLock if recursive)
per-thread context (request id, db conn)    -> threading.local()
broadcast a one-shot signal                  -> Event
bound concurrency to N                        -> Semaphore(N)
wait until predicate                          -> Condition + wait_for(...)
producer / consumer queue                     -> queue.Queue (don't roll your own)
stage parallel pipeline                       -> Barrier(N)
```

## LLMs & AI Engineering

### [[Sections/llm-ai/openai-api/chat-completions|OpenAI Chat Completions — GPT-4, Structured Output & Streaming]]

```text
prototype / one-shot script               -> raw OpenAI() client; iterate fast
2+ call sites / production code           -> typed LLM wrapper with cost + retry + redaction
structured output                         -> beta.chat.completions.parse with Pydantic; NEVER prompt for "JSON"
need streaming UX                         -> .create(stream=True); always close on cancel
web framework                             -> AsyncOpenAI; never block the event loop
multi-provider portability (Anthropic + OpenAI + local) -> tools like litellm / aisuite, OR your own seam
PII / secrets in prompts                  -> scrub BEFORE the call AND in logs (defense in depth)
cost gating per request                   -> tally usage.* per call; raise once per-request budget exceeded
reproducible outputs                      -> temperature=0 AND seed= ; still not 100% deterministic, log seeds
```

### [[Sections/llm-ai/openai-api/function-calling|Function Calling & Tool Use — Agentic LLMs]]

```text
ad-hoc tools, no risk classes              -> simple while-loop pattern
production agents with side effects        -> tool registry + Pydantic args + risk class
destructive operations                     -> HITL gate (REFUSE in agent, surface to UI)
parallel tool calls                        -> just iterate msg.tool_calls; SDK gives them all
force a specific tool                      -> tool_choice={"type":"function","function":{"name":"X"}}
force NO tools                             -> tool_choice="none"
multi-step planning required                -> consider Assistants API or LangGraph; bare loop is fine for <8 steps
audit / replay                             -> log every step + tool call + result; the AgentRun above
```

### [[Sections/llm-ai/embeddings-vectors/embeddings|Text Embeddings — Semantic Search & Similarity]]

```text
one model across ALL embeddings           -> NEVER mix models or dim sizes in one index
< 100k vectors                            -> brute-force numpy (faster than you'd think)
100k - 10M vectors                        -> faiss HNSW (CPU); float16 if memory bound
> 10M vectors                             -> a managed vector DB (Pinecone, Weaviate Cloud, Qdrant)
need filters on metadata before search     -> a vector DB; FAISS alone has no filtering
need to truncate cost                      -> dimensions= on text-embedding-3-* (Matryoshka)
open-source / on-prem                      -> bge-large-en-v1.5 (or gte-large) via sentence-transformers
query-doc asymmetry (e5, bge)              -> prepend "query: " / "passage: " to the right side
freshness                                  -> versioned indexes + atomic alias flip; never reindex in place
```

### [[Sections/llm-ai/embeddings-vectors/vector-databases|Vector Databases — Pinecone, Chroma, pgvector & Weaviate]]

```text
prototype                            -> chroma in-memory; ditch when persistent
single service, SQL stack             -> pgvector (joins with relational data; no extra infra)
high-throughput managed                -> Pinecone (best ops story); namespaces per tenant
open-source self-hosted                -> Qdrant or Weaviate; both production-grade
massive scale (>10^9 vecs) cloud      -> Pinecone, Vespa, or Weaviate Cloud; benchmark first
need vector AND lexical (BM25)         -> hybrid in pgvector OR Weaviate / Vespa native hybrid
regulatory residency                   -> self-hosted (Qdrant/Weaviate) OR managed with EU/US region
tenant isolation                        -> ALWAYS scope by tenant_id in WHERE; namespaces in Pinecone
reindex strategy                        -> dual-write under two embedder tags; flip via flag
```

### [[Sections/llm-ai/rag-langchain/rag-pipeline|RAG — Retrieval-Augmented Generation Pipeline]]

```text
chunk size                                 -> 200-600 tokens with 10-20% overlap
markdown / code mixed                       -> markdown header split BEFORE size split
queries are conversational                  -> rewrite the latest turn into a standalone query
long-tail / sparse queries                  -> HyDE: embed a model-written hypothetical answer
exact tokens / IDs / SKUs in the corpus     -> hybrid (BM25 + vector); fuse with RRF
noisy retrieval                             -> rerank top-K with Cohere or cross-encoder
"model is hallucinating answers"            -> tighten system prompt: "Not in the docs.", citations required
improvements without numbers                 -> golden set + RAGAS-style metrics; never ship vibes
prompt injection in indexed docs             -> sanitize at ingest, refuse user-supplied "system" content
```

### [[Sections/llm-ai/rag-langchain/langchain-agents|LangChain — Chains, Agents & Production Patterns]]

```text
single LLM call                            -> raw OpenAI SDK; skip LangChain entirely
linear pipeline (prompt -> llm -> parse)    -> LCEL chain
RAG                                        -> LCEL with retriever; rerank if quality matters
agent with tools, simple                    -> create_tool_calling_agent + AgentExecutor (toy/internal)
agent in production                         -> LangGraph: typed state, explicit edges, checkpoints
need observability                          -> LangSmith env vars + dashboard; ALWAYS in prod
need streaming                              -> chain.astream / graph.astream_events
long-running, resumable                     -> LangGraph + persistent checkpointer (Redis/Postgres)
want to leave LangChain                     -> wrap your own seam; LangGraph is more "framework", LCEL is "DAG"
```

### [[Sections/llm-ai/prompt-engineering/prompt-patterns|Prompt Engineering — Patterns That Actually Work]]

```text
small task                              -> direct user message; no system prompt needed
classification / extraction              -> few-shot (2-5 examples) + JSON output schema
math / logic                            -> chain-of-thought; "show steps"; verify with tools
structured output                       -> Pydantic + response_format; NEVER trust prose for JSON
user content might attack the prompt     -> sanitize; tell the model to treat it as data
prompt is becoming production            -> version it; store hashes; eval on a golden set
shipping a new prompt                   -> A/B on a small slice; compare metrics, not vibes
user-supplied system prompts             -> NEVER pass them as 'system'; bake them into 'user' content
reasoning-heavy task                     -> use a reasoning model (o-series); skip the manual CoT
```

### [[Sections/llm-ai/prompt-engineering/fine-tuning|Fine-Tuning LLMs — When & How]]

```text
need facts / fresh data                  -> RAG, NOT fine-tuning
need format / style / brevity             -> fine-tune; 200-500 examples often enough
need to lower latency / cost              -> fine-tune a small model on the larger model's outputs (distillation)
eval set < 30 cases                       -> stop; build the eval first
training data is "logs we have"           -> NO; clean+label or you'll fit noise
open weights required (privacy / cost)    -> QLoRA on Llama / Mistral / Qwen with TRL
reasoning-heavy task                       -> reasoning models (o-series) before FT
need controllable refusals                  -> RLHF/DPO on a preference set, not plain SFT
want to deploy quickly                     -> OpenAI fine-tuning; least ops overhead
```

## Data Engineering

### [[Sections/data-engineering/airflow/airflow-dags|Airflow DAGs — Orchestrating Data Pipelines]]

```text
simple cron-driven DAG                  -> schedule="@daily" / "0 6 * * *"
triggered by upstream data writing       -> Dataset-driven schedule (data-aware)
waiting on external state (file, API)    -> Sensor in mode="reschedule"
N similar work items at runtime          -> dynamic task mapping (.expand)
conditional branches                      -> @task.branch / BranchPythonOperator
heavy compute                              -> trigger Spark / dbt; don't compute in workers
```

### [[Sections/data-engineering/dbt/dbt-models|dbt — SQL Transformations as Code]]

```text
small / medium dim or aggregation     -> materialized='table'
massive event / log table               -> materialized='incremental' + unique_key
tracking changes over time              -> snapshot (SCD Type 2)
one-shot CTE-style helper                -> materialized='ephemeral'
want strict schema enforcement          -> contract: {enforced: true}
reusable SQL fragment                    -> macro
```

### [[Sections/data-engineering/data-validation/pydantic-pandera|Pydantic & Pandera — Data Validation at Scale]]

```text
single record / API payload          -> Pydantic BaseModel
batch of records (need ALL errors)   -> Pydantic + lazy collection loop
pandas DataFrame in a pipeline       -> Pandera DataFrameModel + @check_types
Spark / Polars DataFrame              -> pandera (modin) or great-expectations
warehouse table monitoring             -> Great Expectations or dbt tests
schema evolution / external API       -> Pydantic with extra="ignore" + strict per-field
```

### [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames]]

```text
one-shot exploration                 -> inferSchema, .show(), .toPandas()
pipeline read                          -> explicit schema; never inferSchema in prod
reading from S3 / GCS                  -> Parquet, partitioned by date / tenant
re-using a derived frame > 1 time     -> .persist() then trigger an action
small final result, drive Python downstream -> .toPandas() at the END
massive shuffle producing skew         -> raise spark.sql.shuffle.partitions; consider salting
```

### [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy]]

```text
per-row computation                  -> withColumn + when/otherwise (or pyspark.sql.functions)
row-relative-to-group                 -> Window (rank, sum, lag, lead)
small + big DataFrame join            -> F.broadcast(small_df)
one key dominates joins                -> skew salting
downstream queries filter by date     -> .partitionBy("date") on write
collect_list / collect_set is huge    -> aggregate THEN limit; never collect_list on big groups
```

### [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames]]

```text
complex multi-table query             -> SQL with CTEs, joins, windows
chain of small transforms              -> DataFrame API with .withColumn / .filter
user-supplied filter values             -> args={...} parameter substitution
shared across notebooks / sessions     -> saveAsTable (Hive / Unity Catalog)
ad-hoc within ONE session               -> createOrReplaceTempView
slow query                              -> .explain() FIRST, then act on the plan
```

### [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions]]

```text
logic exists in F.* / Spark SQL       -> use built-ins, NOT a UDF
batch numeric / string transform       -> @pandas_udf (Series -> Series)
per-group computation                   -> applyInPandas (DataFrame -> DataFrame)
ML inference                              -> Pandas UDF + module-level model load
only legacy reason for Python UDF        -> @udf, but profile and budget the cost
need to JOIN on derived value             -> precompute the column FIRST, never UDF in join
```

### [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data]]

```text
data lake on S3 / GCS / ADLS         -> Delta Lake or Iceberg (ACID + time travel)
one-shot output for a downstream tool -> Parquet
sharing with non-Spark teams           -> CSV or JSON (small data only)
queries always filter by date          -> partition by date
joins always on customer_id              -> bucket by customer_id (Hive-compatible tables)
incremental UPSERT                       -> Delta MERGE; never overwrite-and-rewrite
```

### [[Sections/data-engineering/polars/polars-basics|Polars Basics — DataFrames & I/O]]

```text
exploration on small data            -> df = pl.read_*; eager is fine
pipeline / production                  -> pl.scan_* + LazyFrame + .collect()
data > RAM                             -> .collect(streaming=True)
numeric or date column                  -> schema_overrides=, never inference
need a sklearn / matplotlib API         -> .to_pandas() at the boundary, then continue
reading 1000+ files                      -> pl.scan_parquet("path/*.parquet")
```

### [[Sections/data-engineering/polars/polars-expressions|Polars Expressions — Expression API & Lazy Evaluation]]

```text
numeric / string / date transform     -> built-in expressions; never map_elements
conditional bucket                     -> when/then/otherwise (chain freely)
per-group aggregate, keep rows         -> .over(group_col)
per-group aggregate, collapse rows     -> .group_by().agg()
list / array column                     -> .list.* namespace (len, contains, eval)
need multiple outputs from one func     -> pl.struct(...) + .unnest()
genuinely needs Python                  -> map_elements with return_dtype= (slow but typed)
```

### [[Sections/data-engineering/polars/polars-vs-pandas|Polars vs Pandas — When & How to Migrate]]

```text
< 1M rows, exploratory                  -> stay on Pandas
1-100M rows, batch pipeline              -> migrate to Polars LazyFrame
> 100M rows OR doesn't fit in RAM        -> Polars streaming OR Spark
need scikit-learn / statsmodels at end   -> compute in Polars, .to_pandas() last
already on Pandas + slow                  -> try dtype_backend="pyarrow" before rewriting
distributed cluster needed                 -> NOT Polars; use Spark or Dask
```

### [[Sections/data-engineering/dask/dask-dataframe|Dask DataFrames — Lazy Distributed Data]]

```text
data fits in RAM                       -> stay on Pandas / Polars
1 GB - 1 TB on one machine             -> dask.dataframe (out-of-core)
> 1 TB or multi-node                    -> Spark (Dask works too but Spark dominates)
reads MANY small files                  -> dd.read_*("path/*.csv", blocksize=...)
custom Pandas op not in Dask API        -> map_partitions with explicit meta=
repeatedly reusing same intermediate    -> .persist() ONCE, then compute repeatedly
need fast joins/lookups                  -> set_index, write Parquet, read with divisions
```

### [[Sections/data-engineering/dask/dask-delayed|Dask Delayed — Task Graphs for Custom Logic]]

```text
independent tasks, simple parallel       -> concurrent.futures.ThreadPoolExecutor
tasks form a DAG (deps between them)      -> @dask.delayed
tabular data                                -> dask.dataframe (or Polars / Spark)
hundreds of thousands of tiny tasks        -> batch them; Dask scheduler overhead is real
need cluster execution                      -> @dask.delayed + dask.distributed.Client
Python function with side effects           -> stop; refactor to be pure first
```

### [[Sections/data-engineering/dask/dask-distributed|Dask Distributed — Multi-Machine Execution]]

```text
one machine, prototype                  -> Client(n_workers=N)  (LocalCluster)
prod on one node, GIL-bound CPU         -> processes; threads_per_worker=1
multi-node                                -> dask-scheduler + dask-worker; client.connect to URL
shared big lookup table                   -> client.scatter(..., broadcast=True)
GPU / specialized workers                 -> --resources tag + submit(resources={...})
stream of results                          -> as_completed (start downstream early)
"fire and forget" job                      -> fire_and_forget; the driver can exit
```

### [[Sections/data-engineering/etl-patterns/etl-extract|ETL: Extract — Reading from Multiple Sources]]

```text
small static file, local                -> pd.read_csv / pd.read_parquet
periodic SQL pull                         -> incremental WHERE updated_at > :since
API with pagination                        -> Session with Retry + timeout
cloud lake (S3 / GCS / ADLS)               -> Parquet glob via fsspec
data > driver RAM                          -> stream to disk, then read in chunks
need idempotent re-runs                     -> on-disk watermark, advance ONLY on success
schema must not regress                    -> Pandera @check_types at the boundary
```

### [[Sections/data-engineering/etl-patterns/etl-transform|ETL: Transform — Cleaning & Standardizing Data]]

```text
simple bad rows                         -> dropna / drop_duplicates
parseable but maybe broken values        -> errors='coerce' + dropna
string fields                              -> strip THEN upper/lower; do both
enum-style columns                          -> isin allowlist; never raw == comparisons
numeric outliers                            -> clip; or remove if domain-meaningless
schema must not regress                     -> Pandera @check_types contract
re-running the pipeline                      -> idempotent transforms; pure functions
```

### [[Sections/data-engineering/etl-patterns/etl-load|ETL: Load — Writing to Warehouse & Cloud]]

```text
small DataFrame (< 100k rows)        -> df.to_sql with engine.begin()
medium / nightly batch                -> staging table + INSERT ... ON CONFLICT
warehouse load (BQ / Snowflake)       -> Parquet to cloud storage + COPY/LOAD job
re-runs MUST be safe                   -> partition replace OR upsert; never blind append
data lake (Delta / Iceberg)            -> MERGE INTO; gives you ACID + time travel
schema evolves                          -> column-add via ALTER (BQ allows nullable adds)
```

### [[Sections/data-engineering/etl-patterns/prefect-basics|Prefect — Modern Python Orchestration]]

```text
simple Python pipeline                  -> Prefect; lighter than Airflow
complex multi-team DAG                   -> Airflow (richer operators / connectors)
data-quality gates / branching            -> normal if/else inside the flow
N similar tasks at runtime                -> task.map(...)
transient API failures                     -> @task(retries=N, retry_delay_seconds=...)
re-runnable backfills                      -> task_input_hash caching
alerting on failures                       -> @flow(on_failure=[hook])
```

## Type Hints & mypy

### [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections]]

```text
public function input         -> Sequence/Iterable/Mapping (accept more, demand less)
public function output        -> concrete list/dict/set (callers know what they got)
"I accept any object"         -> object, NOT Any
"I don't care about this"     -> Any (last resort, document why)
IDs that share repr (int)     -> NewType to make them mutually un-assignable
never-returns / unreachable   -> Never (tighter than NoReturn for narrowing)
```

### [[Sections/typing/core-typing/advanced-annotations|Advanced Types — Literal, TypedDict, Annotated & Overload]]

```text
wire-format dict from JSON          -> TypedDict (Required/NotRequired/ReadOnly)
one-of variants in JSON             -> TypedDict union with Literal tag, narrow on tag
"string flag" parameter             -> Literal[...] (catches typos, IDE autocomplete)
return type depends on input flag   -> @overload, single implementation
numeric/string invariants           -> Annotated[T, Gt(...)] for runtime libs
need behavior + validation          -> dataclass / Pydantic / msgspec, NOT TypedDict
```

### [[Sections/typing/generics-protocols/typevar-generics|TypeVar & Generics — Parameterized Types]]

```text
one type param, function-local           -> def fn[T](...)            (3.12+) or TypeVar
container that PRODUCES T, never accepts -> covariant TypeVar (T_co)  -> Reader, Iterator, frozenset (logically)
container that CONSUMES T, never returns -> contravariant TypeVar     -> Sink, EventHandler
read AND write of T (mutable)            -> invariant TypeVar (default) -> list, dict
decorator that must not erase signature  -> ParamSpec + TypeVar return
"T must support .name / len() / +"        -> bound=Protocol  (capability), not constraints
```

### [[Sections/typing/generics-protocols/protocol|Protocol — Structural Typing (Duck Typing with Types)]]

```text
public API expecting "shape, not class"     -> Protocol
library plug-in registration / metaclass    -> ABC + register() (gives runtime hierarchy)
read-only container Protocol                -> covariant TypeVar (T_co)
need isinstance() in production logic       -> @runtime_checkable + structural sanity check
single method, simple signature             -> Callable[[...], ...] beats a one-method Protocol
```

### [[Sections/typing/mypy/mypy-config|mypy — Configuration, Strict Mode & Common Patterns]]

```text
greenfield project                       -> mypy strict + pyright in editor from day 1
legacy import, gradual typing            -> per-module override with explicit owner+date
ORM / Pydantic / dataclass-heavy         -> install matching mypy plugin
silencing a real bug (cast / Any)        -> add a runtime check that NARROWS, not casts
one-off line you cannot fix              -> # type: ignore[error-code]   (NEVER bare)
third-party lib without stubs            -> ignore_missing_imports for that module ONLY
"we're at 1000 errors, where to start?"  -> disallow_untyped_defs first; that ONE flag finds the most bugs
```

### [[Sections/typing/type-narrowing/isinstance-narrowing|isinstance & issubclass Narrowing — Union Type Refinement]]

```text
single union, two cases             -> isinstance + else
union with 3+ shapes                -> match/case + assert_never
"predicate over a value"            -> TypeIs (3.13+); fall back to TypeGuard on older Python
coercing JSON / external data       -> Pydantic / msgspec / dataclasses-json (NOT a tower of isinstance)
parametrized generics (list[Foo])   -> isinstance(list) then validate elements; structural type isn't checkable
```

### [[Sections/typing/type-narrowing/typeguard|TypeGuard & TypeIs — Custom Type Narrowing Functions]]

```text
"this value satisfies a constraint AND I want narrowing"      -> TypeIs (3.13+)
stuck on Python 3.12-                                          -> TypeGuard, accept asymmetric narrowing
nested JSON / wire types                                       -> Pydantic / msgspec / dataclasses-json
                                                                 (don't reinvent recursive validation)
small leaf check (is_email, is_uuid, is_iso_date)              -> TypeIs predicate
need narrowing AND a parsed object                             -> validator that RETURNS the typed value;
                                                                 TypeIs only narrows the input
```

### [[Sections/typing/type-narrowing/assert-never|assert_never & Never — Exhaustive Type Checking]]

```text
closed set of strings / ints     -> Literal[...] union, branch + assert_never
sealed object hierarchy          -> dataclass / frozen classes + Literal tag, match/case
helper that always raises/exits  -> -> Never (lets caller continue narrowed)
"should never get here, but..."  -> assert_never with the variable as arg (mypy reports type)
                                    NOT raise NotImplementedError (no compile-time check)
open hierarchy (3rd-party adds)  -> don't claim exhaustiveness; handle default sanely
```

### [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions]]

```text
decorator that doesn't change signature      -> ParamSpec + TypeVar (the canonical pair)
decorator that injects/strips a positional   -> Concatenate[X, P]
decorator that adds a NEW keyword            -> @overload to expose the wrapper's true signature
sync + async behind one decorator            -> @overload + iscoroutinefunction dispatch
factory decorator (decorator with options)   -> wrap the whole thing in a Callable[..., Callable[P, R]]
                                                 return type; ParamSpec scopes per inner function
```

### [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics]]

```text
typed *args of mixed types          -> TypeVarTuple
shape-aware tensor wrappers          -> NDArray[DType, *Shape] pattern
one type repeated N times            -> tuple[T, ...] (variadic of single T) -- NOT TypeVarTuple
"function takes a record's fields"   -> dataclass + Self / TypedDict, not TypeVarTuple
```

### [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance]]

```text
class only PRODUCES T (read-only)             -> covariant TypeVar   (T_co)
class only CONSUMES T (write-only)            -> contravariant TypeVar (T_ct)
class both reads and writes T                  -> invariant TypeVar   (default)
need element-type DEFAULT (e.g. dict[str, str])-> PEP 696 type defaults (3.13+) or alias
"supports comparison/key" capability           -> bound=Protocol, NOT a constraints TypeVar
exposing typed containers across a package      -> Generic[T] beats Any-typed dicts every time
```

### [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class]]

```text
method returns the same instance / a same-class clone   -> -> Self
factory classmethod that builds the subclass            -> @classmethod def make(cls, ...) -> Self
subclass adds fields, parent does immutable updates     -> dataclasses.replace + Self (NOT cls(*args))
need to bind to a sibling class (NOT self's class)       -> TypeVar bound=Parent, NOT Self
pre-3.11 codebase                                       -> from typing_extensions import Self
```

### [[Sections/typing/runtime-types/get-type-hints|get_type_hints & Type Introspection — Reflection at Runtime]]

```text
need real types (not strings) from annotations    -> get_type_hints (NOT __annotations__)
need decorator metadata from Annotated[...]       -> get_type_hints(..., include_extras=True)
need to test "is this a Union/Optional?"          -> get_origin in (Union, types.UnionType)
need to walk a nested annotation                  -> recurse on get_args after each get_origin
target lives in another module / forward refs     -> pass globalns=vars(sys.modules[mod]) explicitly
```

### [[Sections/typing/runtime-types/runtime-checkable|@runtime_checkable Protocol — isinstance() Type Checking]]

```text
pure static type check                          -> Protocol (NO @runtime_checkable)
need isinstance() at runtime                    -> @runtime_checkable Protocol
plug-in registration / dispatch table           -> @runtime_checkable + signature sanity check + cache
library is performance-sensitive                -> ABC + register() (faster than structural isinstance)
want to validate "this conforms to my schema"   -> Pydantic / msgspec, NOT a Protocol
```

### [[Sections/typing/runtime-types/dataclass-typed|Typed Dataclasses — Type Hints + Data Structures]]

```text
plain record, mutable fine                    -> @dataclass
used as dict key / cache key / set element     -> @dataclass(frozen=True)
millions of instances or hot loop              -> @dataclass(slots=True)  (~30-40% memory)
constructor with many fields, easy to confuse  -> kw_only=True (or KW_ONLY divider)
need runtime validation / coercion             -> Pydantic / msgspec / attrs.validators
                                                 (dataclasses don't enforce types)
need ordering                                  -> order=True (only fields in declaration order;
                                                 pick the field set carefully)
inheritance with default-then-required fields  -> kw_only=True; otherwise it's a TypeError
```

## Packaging, CLI & Tooling

### [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging]]

```text
greenfield project, fast CI, reproducible      -> uv + hatchling, COMMIT uv.lock
need plugin-rich extension system               -> setuptools (entry points are first-class)
pure-Python single-file project                 -> flit_core (zero config)
binary extensions (C/Rust)                      -> setuptools/maturin/scikit-build-core
dynamic version from git                        -> hatch-vcs (or setuptools-scm)
release to PyPI                                 -> trusted publishing (OIDC), NOT API tokens in CI
private corp index                              -> uv with [[tool.uv.index]] entries; pin index URLs
```

### [[Sections/packaging/cli-tools/typer-click|Typer & Click — Building CLI Applications]]

```text
small script, no third-party deps allowed     -> argparse
typed CLI, you control all subcommands         -> Typer
plug-in registry / entry points                -> Click + entry_points group
need REPL-style nested commands                -> click-repl on top of Click
want shell completions                         -> Typer / Click (both ship completions)
--json output for machine consumers            -> add a global --output=text|json flag
never crash on Ctrl-C                          -> wrap main() in try/except KeyboardInterrupt
```

### [[Sections/packaging/cli-tools/logging|Logging & Observability — Production Python]]

```text
stdlib-only script                              -> logging.basicConfig
service with multiple modules                   -> dictConfig + getLogger(__name__)
structured fields, env-aware rendering          -> structlog (Console in dev, JSON in prod)
request correlation across async               -> structlog.contextvars + bind_contextvars
multi-process / forking server                  -> QueueHandler + QueueListener (one writer)
PII / secrets in payloads                       -> redact processor BEFORE the renderer
noisy third-party lib                           -> logging.getLogger("name").setLevel(WARNING)
sampling DEBUG in prod                          -> filter on the handler, not the logger
```

### [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard]]

```text
greenfield project                          -> hatchling + uv + uv.lock + dependency-groups
need binary wheels (C/Rust/CFFI)            -> setuptools + cibuildwheel  OR  maturin (Rust)
pure-Python single-module                   -> flit_core (zero config)
plug-in registry                            -> setuptools entry_points (richer than hatch's)
monorepo                                    -> uv workspace OR hatch+nox+pdm-workspace
reproducible CI                             -> commit uv.lock; CI runs 'uv sync --frozen'
tightening dep ranges                       -> upper bounds only after a real break (~~> "<2")
gating on coverage                          -> [tool.coverage.report] fail_under = N
```

### [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager]]

```text
greenfield project                   -> uv from day one, COMMIT uv.lock
sticking with pip but want a lock    -> pip-compile (pip-tools) -> requirements.txt
poetry codebase, no migration budget -> keep poetry, defer migration
conda-only ML stack                  -> conda + pip; uv replaces pip step but leaves conda
global CLI tool                      -> uv tool install / uvx
multi-Python matrix                  -> uv python install + uv venv --python X.Y
monorepo                             -> [tool.uv.workspace] members = ["packages/*"]
private package index                -> [[tool.uv.index]] block (NEVER inline auth in URLs;
                                         use UV_INDEX_<NAME>_USERNAME / _PASSWORD env vars)
```

### [[Sections/packaging/modern-packaging/virtual-environments|Virtual Environments — Isolating Dependencies]]

```text
day-to-day project work               -> uv / poetry / pdm; let them manage the venv
one-shot script with stdlib-only deps -> just run system python; no venv
CI image                              -> create venv at /opt/venv, prepend to PATH (no 'activate')
need binary CUDA/Tk integration       -> --system-site-packages + pinned base image
must support Windows + POSIX shells   -> drive everything via 'python -m', never 'activate'
long-running daemon spawning workers  -> set VIRTUAL_ENV + PATH explicitly; don't rely on bash activate
```

### [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing]]

```text
already on poetry, no migration budget         -> stay; tighten install --sync in CI
need OIDC trusted publishing                   -> any tool works; secret-free is the rule
complex resolver edge cases (yanked, prereleases) -> poetry; uv is closing the gap fast
want PEP 621 native                            -> uv (hatchling) or pdm
plug-in ecosystem (poetry plugins)             -> stay on poetry only if you USE them
need 'pre-release allowed by default'          -> poetry add 'pkg --allow-prereleases'
                                                 or uv with resolution = "lowest-direct" + pre-releases
```

### [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation]]

```text
pip-only org with no migration budget       -> pip-tools + --generate-hashes + --require-hashes
adopting modern tooling                     -> uv (faster, single tool, deterministic)
need fully reproducible CI without uv       -> pip-tools with hashes; pin pip-tools version itself
layered service deps in a monorepo          -> -c constraints.txt across services; one source of truth
security audit asks for SBOM                -> pip-audit reads requirements.txt; CycloneDX exporters supported
cross-platform wheels (Linux + macOS + Win) -> pip-compile per platform OR drop hashes (lossy)
```

### [[Sections/packaging/distribution/package-structure|Package Structure — src/ Layout & __init__.py]]

```text
library you intend to ship                  -> src/ layout, ALWAYS
single-file script                          -> flat layout fine; no need for src/
ships type hints                            -> add py.typed marker AND include in wheel
package data files (templates, schemas)     -> importlib.resources, NOT __file__-relative paths
plug-in surface for third parties           -> entry_points group OR PEP 420 namespace package
fast CLI startup                            -> lazy __getattr__ in root __init__; defer heavy imports
need to expose internal helpers in tests    -> tests import via 'from my_package._internal import x',
                                                prefix internals with '_' so __all__ + IDEs hide them
```

### [[Sections/packaging/distribution/setup-cfg|setup.cfg & setup.py — Legacy Packaging (For Maintenance)]]

```text
pure-Python project, any vintage         -> migrate to pyproject.toml; delete setup.py / setup.cfg
C extensions only                        -> minimal setup.py with Extension(), metadata in pyproject.toml
Cython / heavy native build              -> scikit-build-core (CMake) or meson-python
Rust extensions                          -> maturin (replaces setup.py entirely)
reading old codebase                     -> setup.cfg [metadata] = [project]; [options] = build-system + tool.setuptools
tool that hard-requires setup.py exists  -> 1-line shim: 'from setuptools import setup; setup()'
```

### [[Sections/packaging/distribution/publishing-pypi|Publishing to PyPI — Build, Upload, Versioning]]

```text
first manual release                       -> token in .pypirc, scoped to that one project
ongoing CI releases                        -> Trusted Publishing (OIDC), no secrets
pure Python                                -> python -m build (or uv build); upload sdist + wheel
C / Rust / native                          -> cibuildwheel + maturin; matrix produces all wheels
reproducible builds                        -> SOURCE_DATE_EPOCH from git commit; deterministic zip
security audit                             -> generate SBOM (cyclonedx-bom or pip-audit), sign artifacts (sigstore)
private corp index                         -> twine upload --repository-url + creds via OIDC or vault
```

### [[Sections/packaging/distribution/conda-environments|Conda & conda-environments — Mixing conda + pip]]

```text
pure-Python project                        -> uv / pip; do NOT add conda
scientific stack with native libs          -> conda-forge (NumPy/SciPy/PyTorch/Cupy)
GPU-heavy ML                               -> conda for the CUDA stack OR pip with explicit CUDA wheels (pick one)
reproducible CI                            -> conda-lock per platform + micromamba install
Docker images                              -> micromamba (smaller, no shell hooks)
adding pure-Python deps inside a conda env -> use uv pip / pip in the activated env; NOT 'conda install' for them
Anaconda 'defaults' channel licensing      -> set 'channels: [conda-forge, nodefaults]' to avoid commercial restrictions
```

### [[Sections/packaging/dev-tools/ruff-linting|ruff — The Fast Linter & Formatter]]

```text
want one tool for lint+format          -> ruff (replace flake8/black/isort/pyupgrade)
need fast feedback in editor           -> ruff lsp / ruff-server
gating new commits                     -> pre-commit + CI both run 'ruff check' + 'ruff format --check'
adopting on a legacy codebase           -> ratchet via baseline diff; do NOT --fix the world in one PR
security smells                        -> enable 'S' rules; pair with bandit only if you need its CWE mapping
custom org-wide rules                  -> contribute upstream OR maintain a separate linter; ruff has no plugin API yet
```

### [[Sections/packaging/dev-tools/pre-commit|pre-commit — Hooks for Linting, Testing, Type Checking]]

```text
keep commit time < 2s                   -> only formatters / cheap checks at 'pre-commit' stage
slow checks (mypy, pytest, bandit)      -> 'pre-push' stage
hosted auto-fix on PRs                  -> pre-commit.ci (free for OSS) + 'ci.skip' for slow hooks
secret detection                        -> gitleaks hook + GitHub secret scanning, both, belt+braces
monorepo / nx-style staged files        -> 'files:' regex + 'types_or:' to scope hooks
org-wide enforcement                     -> ship a shared .pre-commit-config.yaml via 'extends:'
                                          (pre-commit doesn't natively support extends; copy + check-in)
```

### [[Sections/packaging/dev-tools/mypy-config-packaging|mypy — Type Checking Configuration]]

```text
greenfield project                         -> strict=true from day 1
incremental adoption on legacy code        -> per-module overrides + warn_unused_ignores
ORM / Pydantic / dataclass-heavy           -> install matching mypy plugin
single-line suppression                    -> '# type: ignore[error-code]' (NEVER bare)
third-party lib without stubs              -> ignore_missing_imports per-module ONLY
"we have 5000 errors, where to start?"     -> enable disallow_untyped_defs first; covers ~70% of bugs
need narrowing predicate                   -> TypeIs (3.13+), or TypeGuard on older Python
```

## CLI Tools

### [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args()]]

```text
stdlib-only tool                            -> argparse, factor build_parser() out
needs typed config object downstream         -> map Namespace -> dataclass at the seam
shell pipelines (| head)                    -> reset SIGPIPE; convert BrokenPipeError to EX_OK
parsing failure                             -> argparse exits with 2 already; let SystemExit propagate
ambiguous prefix (--ver vs --verify)        -> allow_abbrev=False
"show defaults in --help"                   -> ArgumentDefaultsHelpFormatter
tests on argv                                -> main(argv: list[str] | None = None); return int
```

### [[Sections/cli/argparse/argparse-types|type=, choices=, nargs=, action=, default=, required=]]

```text
integer with bounds                 -> custom type=fn that raises ArgumentTypeError
path that must exist                -> existing_path type fn (raises before main)
one of N strings                    -> StrEnum + choices=list(Enum) + type=Enum
repeatable flag                     -> action="append" (preserves order; new list per run)
counter (-v / -vv / -vvv)           -> action="count"
--feature / --no-feature             -> argparse.BooleanOptionalAction (3.9+)
"if A, then B is required"          -> custom Action subclass; fail in __call__
environment fallback                -> os.environ.get(...) as default; required=missing
passthrough to a subprocess         -> parse_known_args(); pass the rest
```

### [[Sections/cli/argparse/argparse-subcommands|add_subparsers(), set_defaults()]]

```text
2-3 commands, ad hoc                       -> set_defaults(func=...) inline lambdas
stable command set                         -> separate run_<cmd> functions, manual wiring
growing command set / plug-ins             -> registry decorator + configure_<cmd> sibling
shared flags (--verbose, --quiet, --json)  -> parents=[common]
nested subcommands ('mycli db migrate')    -> add_subparsers on the inner parser too
3rd-party plug-in commands                 -> click + entry_points (argparse has no plug-in API)
"no subcommand prints help"                -> required=True on add_subparsers; argparse exits 2
```

### [[Sections/cli/argparse/argparse-groups|add_argument_group(), add_mutually_exclusive_group()]]

```text
"exactly one of A/B/C"                 -> mutex group with required=True
"at most one of A/B/C"                 -> mutex group (no required=True)
"if A then B is required"              -> validate(args) post-parse, parser.error()
"all of A/B/C OR none"                 -> validate(args) post-parse
logical relation between groups        -> validate(args) -- argparse can't express it
per-group help text                    -> add_argument_group(title, description=...)
show defaults inline in --help         -> formatter_class=ArgumentDefaultsHelpFormatter
safe-default behavior                  -> set in validate(args) AFTER mutex check
```

### [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo()]]

```text
small CLI, stdlib-only             -> argparse
typed CLI you control              -> Typer
plug-in registry / entry points    -> Click (group + entry_points)
shell completions                  -> Click / Typer; argparse needs argcomplete
first-class CliRunner tests        -> Click; argparse must drive subprocess or sys.argv
--json output for piping           -> a single 'output' option + JSON in machine mode
non-zero exit on data error        -> ClickException subclass with exit_code = sysexit code
env-var fallback for ALL options   -> auto_envvar_prefix in context_settings
```

### [[Sections/cli/click/click-types|type=click.Path(), click.Choice(), click.IntRange(), click.File()]]

```text
files (small)                       -> click.File(mode); click manages open/close
files (large) / want a Path obj     -> click.Path(path_type=Path, resolve_path=True)
numeric range                       -> click.IntRange / click.FloatRange (with clamp= when desired)
one of N strings                    -> click.Choice (case_sensitive=False if user-facing)
ISO date or single format          -> click.DateTime(formats=[...])
domain types (duration, money,
  CIDR, semver)                     -> subclass click.ParamType; failure via self.fail()
one-off parsing                     -> callback= function; raise click.BadParameter
fixed-arity tuple                   -> type=(int, int) etc.; nargs is implicit from arity
```

### [[Sections/cli/click/click-groups|@click.group(), @click.pass_context, click.Context]]

```text
2-5 verbs, no plug-ins                  -> @click.group() + @cli.command()
shared parent state                      -> ctx.obj as dataclass; @click.pass_obj on children
nested verbs (mycli db migrate)          -> @cli.group() then @db.command()
parent should print help if no sub        -> @click.group(invoke_without_command=True)
slow imports affect --help               -> LazyGroup with module:attr strings
third-party command registry             -> entry_points group + group.add_command(loader)
cross-cutting cleanup                    -> @cli.result_callback()
merge two CLIs into one binary            -> click.CommandCollection
```

### [[Sections/cli/click/click-prompts|click.prompt(), click.confirm(), click.password_option(), click.progressbar()]]

```text
small interactive tool, devs only           -> click.prompt + click.confirm
tool that runs in CI too                    -> --yes / --quiet flags + isatty() guard
sensitive entry (password, API key)         -> hide_input=True; confirmation_prompt=True; ENV first
long output                                  -> click.echo_via_pager
loop progress, may run non-interactively     -> guard with isatty(); skip the bar in CI
confirmation that should HARD-fail on 'no'  -> click.confirm(abort=True)  (raises Abort -> exit 1)
value with reasonable default                -> default= AND show_default=True
"type ENTER to continue"                     -> click.pause()
```

### [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument()]]

```text
typed CLI you control                   -> Typer; type hints are the API
plug-in registry via entry_points        -> Click (Typer apps can BE the entry point)
simple tool, stdlib only                 -> argparse
global state across subcommands          -> @app.callback() + a module State object
--json output for pipelines              -> top-level --output Choice; commands branch on it
shell completion                         -> typer --install-completion (Typer ships it)
tests                                    -> Click's CliRunner.invoke(app, [...]) works directly
exit codes                               -> raise typer.Exit(code=N) with sysexits.h codes
```

### [[Sections/cli/typer/typer-app|typer.Typer(), app.command(), app()]]

```text
small typed CLI                          -> single Typer() with @app.command()
git-style nested verbs                   -> typer.Typer() per group; app.add_typer(name=...)
shared --verbose / --json                -> @app.callback() + module State object
plug-in subcommands                      -> entry_points group + add_typer
slow imports kill --help                 -> lazy registration; import in the runner
want pretty tracebacks (dev only)        -> pretty_exceptions_enable=True; show_locals=False ALWAYS
need to share Click extensions           -> Typer wraps Click -- @click.* decorators work too
exit codes                               -> raise typer.Exit(code=N) with sysexits values
```

### [[Sections/cli/cli-utilities/rich-output|rich.print(), Console, Table, Progress]]

```text
colored output                       -> Rich Console with theme; honor NO_COLOR
data on stdout                       -> Console() (default stdout); plain text or JSON
diagnostics                          -> Console(stderr=True); never mix with data stream
tabular output                       -> rich.table.Table with expand=True
multi-step progress                  -> rich.progress.Progress with multiple tasks
blocking refresh display             -> rich.live.Live (no print() inside!)
pretty tracebacks                    -> rich.traceback.install(show_locals=False)
logs                                 -> RichHandler ONCE at startup; logging API everywhere else
testing styled output                -> Console(record=True) + .export_text()
```

### [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr]]

```text
raw argv access                   -> sys.argv (only for trivial scripts)
parsed args with help & types     -> argparse / click / typer; NEVER hand-roll
data stream                       -> sys.stdin / sys.stdout (text); .buffer for bytes
diagnostics                       -> sys.stderr; one tag per message; flush on exit
pipe-friendly                     -> SIGPIPE default + BrokenPipeError -> exit 0
live output                       -> sys.stdout.reconfigure(line_buffering=True)
non-ASCII                         -> reconfigure(encoding="utf-8") at process start
exit codes                        -> sysexits.h values; 130 for SIGINT, 143 for SIGTERM
tool name in messages             -> os.path.basename(sys.argv[0])
```

## Filesystem & Paths

### [[Sections/filesystem/pathlib/path-basics|Path()]]

```text
one-line filename / extension manipulation       -> .name / .stem / .suffix
multi-suffix file ("file.tar.gz")                 -> .suffixes / loop with_suffix("")
modify part of a path                              -> with_name / with_stem / with_suffix
parsing a foreign-OS path (Windows on Linux)      -> PureWindowsPath / PurePosixPath
need filesystem-aware absolute path                -> .resolve(strict=True)
need lexical-only absolute path                    -> .absolute()
"is this path inside that base"                    -> resolve + relative_to in try/except
```

### [[Sections/filesystem/pathlib/path-operations|.exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()]]

```text
"make sure dir exists"                    -> mkdir(parents=True, exist_ok=True)
"delete if exists"                          -> unlink(missing_ok=True)
write that must survive crash               -> tempfile + os.replace (atomic)
atomic rename across same filesystem        -> os.replace, NOT path.rename on Windows
one-shot read of metadata                    -> .stat() once, not exists+is_file+stat
recursive delete                              -> shutil.rmtree(p, ignore_errors=False)
permissions on secrets                        -> chmod(0o600) explicitly
```

### [[Sections/filesystem/pathlib/path-glob|.glob(), .rglob()]]

```text
one-shot dir scan                        -> Path.glob("*")
recursive search                          -> Path.rglob(pattern) or Path.walk (3.12+)
need to PRUNE subtrees                    -> Path.walk + dirs[:] = filtered
need DirEntry speed (millions of files)   -> os.scandir, not pathlib
case-sensitive on every OS                -> explicit char classes "*.[Pp][Yy]"
include dotfiles                            -> add a separate ".*" glob (or "*" UNION ".*")
```

### [[Sections/filesystem/pathlib/path-read-write|Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()]]

```text
small file (< MB)                         -> read_text / write_text with encoding=
large file                                  -> .open() + iterate lines / chunks
write must survive a crash                  -> tempfile + os.replace + fsync
files from Excel / Windows                   -> encoding="utf-8-sig" to skip BOM
logs with mojibake / mixed encodings         -> errors="replace" or "backslashreplace"
binary content                                -> read_bytes / write_bytes (NO encoding)
round-trip arbitrary bytes through str        -> errors="surrogateescape"
```

### [[Sections/filesystem/pathlib/path-joinpath|/ operator, .joinpath(), .resolve()]]

```text
compose paths cross-platform                -> Path / "subdir" / "file"
add multiple parts at once                  -> .joinpath(*parts)
make a path absolute (lexical)              -> .absolute()
make a path canonical (resolve symlinks)    -> .resolve()
"is this path inside this sandbox"          -> resolve + relative_to in try/except
parsing foreign-OS paths                     -> PurePosixPath / PureWindowsPath
find a repo root from a script               -> walk up parents looking for .git
```

### [[Sections/filesystem/file-io/open-modes|open()]]

```text
read / write small text                    -> "r" / "w" with encoding="utf-8"
safe create (don't overwrite)              -> "x"
append-only log                              -> "a" + buffering=1 (line-buffered)
CSV / TSV / network protocol text            -> newline="" + encoding="utf-8"
binary                                       -> "rb" / "wb" (no encoding)
crash safety                                  -> flush() + os.fsync(f.fileno())
foreign / messy encoding                     -> errors="replace" or "backslashreplace"
```

### [[Sections/filesystem/file-io/file-read-methods|.read(), .readline(), .readlines(), iteration]]

```text
small text file                            -> read() or readlines()
large file, line-oriented                   -> for line in f (streaming)
large file, binary processing                -> read(chunk_size) loop
random access (search, index)                -> mmap (read-only, lazy paging)
first N lines                                 -> islice / break-after-N
last N lines                                  -> deque(maxlen=N)
seek on text                                  -> open in binary mode and decode chunks
```

### [[Sections/filesystem/file-io/file-write-methods|.write(), .writelines(), flushing, buffering]]

```text
small one-shot write                       -> write_text(s) or with open(... "w")
write that must survive a crash             -> tempfile + os.replace + fsync
append events / logs                         -> mode="a" + buffering=1
millions of small writes                     -> batch in memory, ONE write()
binary streams                                -> write_bytes / open("wb")
strict byte-exact text (CSV, HTTP)            -> newline="" + encoding="utf-8"
```

### [[Sections/filesystem/file-io/csv-module|csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()]]

```text
small CSV, simple                       -> csv.DictReader / DictWriter
Excel-exported CSV                       -> encoding="utf-8-sig", newline=""
millions of rows                          -> stream with a generator, never list()
need types / fast reads                   -> pandas.read_csv or polars.read_csv
unknown delimiter / quoting              -> csv.Sniffer().sniff(sample)
tab-separated                              -> csv.reader(f, delimiter="\t")
```

### [[Sections/filesystem/file-io/json-module-fs|json.load(), json.dump(), json.loads(), json.dumps(), indent=]]

```text
stdlib types only                          -> json.dump / json.load
stdlib + datetime / Decimal                 -> default= or JSONEncoder subclass
millions of records, streaming               -> NDJSON (one obj per line) or ijson
schema validation needed                     -> Pydantic / msgspec
speed-critical hot path                      -> orjson or ujson
write that must survive a crash              -> atomic write + fsync + os.replace
preserve money / precision                   -> parse_float=Decimal on read
```

### [[Sections/filesystem/os-shutil/os-path|os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ]]

```text
new code, paths as data            -> pathlib.Path
hot loop scanning many entries     -> os.scandir + DirEntry (cached stat)
need fileno / fork / chdir         -> os module
reading config from environment    -> os.environ.get with explicit defaults
```

### [[Sections/filesystem/os-shutil/shutil-copy|shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()]]

```text
single small file                    -> shutil.copy2 (preserves metadata)
directory tree, re-runnable          -> copytree(..., dirs_exist_ok=True)
publishing a build artifact          -> copy_atomic (tmp + fsync + replace)
100k+ files or remote                -> rsync / cloud SDK, NOT shutil
destructive delete on user input     -> safe_rmtree with sandbox check
```

### [[Sections/filesystem/os-shutil/shutil-move-archive|shutil.move(), shutil.make_archive(), shutil.unpack_archive()]]

```text
quick move on same FS                 -> os.replace (atomic)
move across FS / unknown              -> shutil.move
zip a directory, one shot             -> shutil.make_archive
reproducible / deterministic archive  -> zipfile.ZipInfo with fixed mtime
extracting an UNTRUSTED archive       -> tarfile filter='data' or manual path check
```

### [[Sections/filesystem/os-shutil/tempfile|tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()]]

```text
need a path you'll pass to a subprocess        -> NamedTemporaryFile(delete=False)
need a sandboxed dir for a job/test            -> TemporaryDirectory()
atomic publish of a config / cache / weight    -> mkstemp in target dir + fsync + replace
want randomness w/o creating the file          -> mktemp() -- AVOID, race-prone
```

### [[Sections/filesystem/os-shutil/glob-fnmatch|glob.glob(), glob.iglob(), fnmatch.fnmatch()]]

```text
one-shot script, small tree         -> glob.glob / Path.rglob
need lazy iteration                 -> glob.iglob / Path.rglob (it's a generator)
million-file tree, prune dirs early -> os.scandir recursion (the walker above)
match a name against many patterns  -> compile fnmatch.translate joined with '|'
gitignore semantics required        -> use pathspec library (correct negation rules)
```

## Regular Expressions

### [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch()]]

```text
pattern reused                         -> re.compile at module scope, ALL CAPS name
anchor at start of string              -> \A and \Z (NOT ^ and $) when re.MULTILINE may apply
protocol fields (email/uuid/hostname)  -> fullmatch() + re.ASCII + ANCHORED pattern
parsing hot path                       -> single compiled pattern with named groups; one .match
pattern comes from a user / config     -> 'regex' library + timeout, or pre-vet with length+structure check
need a custom early exit               -> use finditer + break, NOT findall + slice
```

### [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer()]]

```text
small string, list at hand              -> findall (string-list or tuple-list)
need positions / spans                  -> finditer + Match.span()
stream a file                           -> mmap (bytes) + bytes Pattern + finditer
stop after K hits                       -> finditer + break (do NOT findall + slice)
overlapping matches                     -> wrap in (?=(pattern)); zero-width trick
counting only                           -> sum(1 for _ in pat.finditer(s)); avoids the list
grouped output that's unstable in shape -> normalize at the boundary, never trust findall's shape
```

### [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn()]]

```text
fixed needle, fixed replacement     -> str.replace()  (faster, no regex needed)
regex needle, FIXED replacement     -> re.sub(pat, "lit", s)  (escape if user-supplied)
regex needle, DYNAMIC replacement   -> re.sub(pat, callable, s)
want count of changes               -> re.subn(...)
user-supplied replacement string    -> callable form, NEVER raw r"..." with user data
huge text, side-effects per match   -> finditer + manual buffer; can early-exit
need atomic 'replace OR fail'       -> subn + assert n == expected
```

### [[Sections/regex/regex-basics/re-split|re.split()]]

```text
simple multi-delimiter                  -> re.split(r"[,;:]", s)
variable whitespace                     -> re.split(r"\s+", s)
need delimiters back                    -> capture group
need POSITIONS not consumed             -> lookahead/lookbehind in the split pattern
quoted / nested format (CSV, JSON-ish)  -> proper parser, NOT split
maxsplit "first N tokens"               -> str.split(maxsplit=N) is faster for fixed delim
build a tokenizer                       -> finditer + scanner pattern, NOT a split chain
tokenize then re-emit                   -> capture-group split + zip pairs
```

### [[Sections/regex/regex-basics/re-compile|re.compile()]]

```text
pattern reused more than once         -> re.compile + UPPER_CASE module constant
pattern is long / annotated           -> re.VERBOSE or (?x); ship comments inside the pattern
flag should apply to a SUB-pattern    -> inline group flag (?i:...) (Python 3.6+)
pattern parameterized at runtime      -> compile inside the helper, cache via functools.lru_cache
patterns scattered across files       -> centralize in patterns.py with type Final
regression-prone pattern              -> write tests against canonical strings; assert .groupindex
```

### [[Sections/regex/regex-groups/re-groups|Capture groups, named groups, match.group(), match.groups()]]

```text
<=2 groups in a one-off              -> numbered groups are fine
parser / data extraction              -> named groups, period
need typed output                    -> dataclass.parse(line) -> Self | None
alternation, want to know which       -> Match.lastgroup with named branches
optional captures                    -> groupdict(default="") OR explicit None handling
nested groups                        -> count by '(' that are NOT '(?:' or '(?='
                                       (named groups (?P<x>...) DO count)
regex too complex to read             -> re.VERBOSE + comments inside the pattern
```

### [[Sections/regex/regex-groups/re-non-capturing|Non-capturing groups, lookahead, lookbehind]]

```text
group without capture                      -> (?:...)
"X right after Y" without taking Y          -> (?<=Y)X
"X NOT preceded by Y"                      -> (?<!Y)X
"X right before Y"                         -> X(?=Y)
"X NOT followed by Y"                      -> X(?!Y)
variable-width lookbehind                  -> 'regex' module (stdlib forbids)
exponential pattern danger                  -> atomic group (?>...) / possessive (?+, ?+, ?+) -- 'regex' module
'reset' the match start (skip a prefix)    -> \K, 'regex' module
pattern compiled from user input           -> reject lookarounds, OR use 'regex' with timeout=
```

### [[Sections/regex/regex-groups/re-backreferences|Backreferences in patterns and replacements]]

```text
detect duplicates / repeats              -> (\w+)\s+\1   in the pattern
matching delimiter pair (quotes, tags)   -> (?P<q>['"])...(?P=q)   single-level only
swap fields                              -> r"\2 \1" replacement, OR a callable
transform with logic / formatting        -> CALLABLE replacement, NEVER raw r"\g<...>" + f-string
recursive / balanced structures          -> NOT regex; use a parser (lark, pyparsing, ast, html.parser)
"if optional prefix, then..." rules      -> (?(group)yes|no) conditional pattern
user-supplied text in the replacement    -> callable; replacement strings interpret \1
```

### [[Sections/regex/regex-patterns/re-character-classes|Character classes, quantifiers, escapes]]

```text
"any chars between two delims"     -> [^delim]+   (NOT .*?)
precise count                      -> {n} or {n,m}
optional thing                     -> ? on the whole subpattern OR alternation
word match                         -> \b...\b   (Unicode-aware in Py3)
Unicode property classes           -> 'regex' module + \p{...}
user-supplied literal              -> re.escape() before insertion
nested quantifier                  -> rewrite to flat OR atomic group ('regex')
matching across newlines (HTML/JSON-ish) -> [\s\S]+? OR re.DOTALL; usually wrong tool, prefer a parser
```

### [[Sections/regex/regex-patterns/re-flags|re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE]]

```text
ASCII-only protocol fields              -> re.ASCII + \A...\Z
user-visible text                       -> default Unicode; consider casefold() before matching
per-line ^/$                            -> re.MULTILINE
. crosses newlines                      -> re.DOTALL  OR rewrite to [\s\S]+?
long/verbose pattern                    -> re.VERBOSE (with comments)
need a flag only on a sub-pattern       -> (?flag:...) inline scoped
debug a parse                           -> re.DEBUG ONCE, then remove
bytes vs str                            -> the pattern type must match the input type
```

### [[Sections/regex/regex-patterns/re-common-patterns|Practical regex patterns]]

```text
email                 -> regex narrows; email.headerregistry.Address OR email_validator validates
URL                   -> regex narrows; urlparse + scheme allowlist
IPv4 / IPv6           -> regex narrows; ipaddress.ip_address validates
datetime              -> regex narrows; datetime.fromisoformat / dateutil parses
phone                 -> NEVER regex-only; use 'phonenumbers'
credit card / IBAN    -> regex for shape; Luhn / mod-97 in code; PCI scope -- prefer tokenization
HTML / JSON / SQL     -> NEVER regex; use html.parser, json, sqlglot
```

### [[Sections/regex/regex-patterns/re-verbose|re.VERBOSE for readable multi-line patterns]]

```text
pattern fits 60 chars in source                  -> normal raw string is fine
pattern grows beyond ~60 chars OR uses 3+ groups -> re.VERBOSE; comment each part
need both verbose and case-insensitive            -> re.VERBOSE | re.IGNORECASE
include literal whitespace                        -> \s or [ ]; NEVER a bare space
include a literal '#'                             -> \# or [#]
readability inside an expression                  -> inline (?x:...) for that subpattern only
patterns shared across modules                    -> central patterns.py with type Final
regression tests                                  -> assert positive + negative cases per pattern
```

## Web (Flask, Django)

### [[Sections/web/flask/flask-app|Flask()]]

```text
< 50 LOC, single file demo         -> module-level Flask(__name__)
real app, even if small            -> create_app() factory
tests need isolated config         -> factory takes config_object
plugins (SQLAlchemy, Login, ...)   -> instantiate at module scope, init_app() in factory
```

### [[Sections/web/flask/flask-routes|@app.route()]]

```text
simple GET + POST                  -> @app.get / @app.post (verb decorators)
shared logic across verbs           -> single @app.route with methods=[...]
path needs validation                -> custom converter (regex), not in-view checks
need to build URLs back              -> url_for("view_name", **kwargs) — never f-strings
```

### [[Sections/web/flask/flask-request-response|request, jsonify()]]

```text
small public API                    -> pydantic / marshmallow validation, every endpoint
internal service, trusted callers   -> manual .get() with type coercion is acceptable
binary uploads > 10 MB              -> stream from request.stream, never .read() all
responses > 10 MB                   -> Response(generator, ...) + stream_with_context
```

### [[Sections/web/flask/flask-blueprints|Blueprint()]]

```text
< 5 routes total                   -> skip blueprints, keep it flat
feature-grouped routes              -> one blueprint per feature module
API versioning                       -> blueprint factory, prefix per version
shared auth on a path tree           -> blueprint + before_request
```

### [[Sections/web/flask/flask-jinja2|render_template()]]

```text
server-rendered pages              -> render_template (autoescape on by default)
tiny inline snippet                 -> render_template_string with CONTEXT vars
JSON API only                        -> skip Jinja entirely; jsonify(...)
marketing site / docs                -> static site generator, not Flask
reusable HTML fragments              -> {% include %} or {% macro %} in Jinja
```

### [[Sections/web/flask/flask-sqlalchemy|SQLAlchemy()]]

```text
prototype, single user             -> create_all() and SQLite
real app                            -> Alembic migrations from day 1
list endpoint with relations        -> selectinload / joinedload, never lazy default
one-to-one or filtered relation     -> joinedload (single SQL JOIN)
one-to-many or many-to-many         -> selectinload (separate IN query, scales)
```

### [[Sections/web/flask/flask-middleware|@app.before_request, @app.after_request]]

```text
request-scoped state                  -> flask.g (cleared per request)
long-lived background task            -> NEVER use g — pass explicit args
load-balancer-side concerns           -> WSGI middleware (ProxyFix, etc.)
per-blueprint cross-cutting concern   -> blueprint.before_request, not app.before_request
security headers                      -> use Flask-Talisman in real apps
```

### [[Sections/web/fastapi-web/fastapi-middleware|@app.middleware, CORSMiddleware]]

```text
browser frontend hits the API         -> CORSMiddleware, pin origins explicitly
behind a load balancer / proxy        -> TrustedHostMiddleware + ProxyHeadersMiddleware
responses > 500 bytes                 -> GZipMiddleware
per-request correlation               -> class-based middleware writing to request.state
auth / rate limit                      -> dependencies, NOT middleware (better DI surface)
```

### [[Sections/web/fastapi-web/fastapi-background-tasks|BackgroundTasks]]

```text
loss-tolerant, fast, < 1s              -> BackgroundTasks
must run, must survive a crash          -> Celery / RQ / Arq with a Redis/RabbitMQ broker
periodic / scheduled                    -> Celery beat or APScheduler
long-running (> 5s, blocks workers)     -> queue + dedicated worker pool
needs retries with backoff              -> queue, never BackgroundTasks
```

### [[Sections/web/fastapi-web/fastapi-websockets|@app.websocket()]]

```text
one-off echo / debug                   -> intro shape, no error wrapping
single-client live updates              -> junior shape with WebSocketDisconnect
N clients seeing the same stream        -> ConnectionManager + broadcast
need cross-process pub/sub              -> Redis pub/sub or NATS — not in-memory set
browsers behind proxies                  -> ping/pong every 30s (proxy idle timeouts)
```

### [[Sections/web/fastapi-web/fastapi-auth|OAuth2PasswordBearer, JWT]]

```text
single small service                  -> HS256 with one shared secret is fine
multiple services verify same token   -> RS256/ES256 (asymmetric) — share PUB only
browser SPA                            -> short access (5-15 min) + refresh in HttpOnly cookie
long-lived API keys                    -> separate tokens with no exp; rotate on rotation
permissions per endpoint               -> Security(require, scopes=[...])
```

### [[Sections/web/fastapi-web/fastapi-testing|TestClient]]

```text
sync route, simple                 -> TestClient + pytest fixtures
async-only behavior to verify       -> httpx.AsyncClient + ASGITransport
DB-touching tests                    -> per-test transaction; rollback in fixture
external HTTP calls                  -> respx (httpx) or vcrpy to record/replay
parametrized data scenarios          -> @pytest.mark.parametrize, not for-loops
```

### [[Sections/web/django/django-setup|django-admin startproject]]

```text
single settings.py                   -> only for tutorials / throwaway demos
real app                              -> split base/dev/prod, pick via DJANGO_SETTINGS_MODULE
secrets                               -> django-environ + .env (dev), real env vars (prod)
db connection cost dominating         -> CONN_MAX_AGE=60 OR connection pooler (PgBouncer)
serving static / media at scale        -> WhiteNoise (static), S3 (media); not Django's runserver
```

### [[Sections/web/django/django-models|models.Model]]

```text
bool / status field with > 2 states     -> TextChoices, never raw strings
"should never happen at DB level"        -> CheckConstraint / UniqueConstraint, not just clean()
reverse-cascade actually wanted          -> on_delete=CASCADE (forum posts on user delete)
reverse-cascade is dangerous              -> on_delete=PROTECT (orders, audit logs)
shared timestamps / soft delete           -> abstract base model + custom manager
filter that's used everywhere             -> custom QuerySet method, not repeated .filter() calls
```

### [[Sections/web/django/django-orm|QuerySet methods]]

```text
ForeignKey / OneToOne                  -> select_related (JOIN)
ManyToMany / reverse FK                -> prefetch_related (separate IN query)
listing 1000+ rows                      -> .iterator() to avoid loading all into memory
counter increment / atomic delta        -> F("col") + n inside .update()
conditional bulk write                   -> .update() / .bulk_update(), not loop + save()
need to lock rows                        -> select_for_update inside transaction.atomic
```

### [[Sections/web/django/django-views|Function-based views]]

```text
pure read view                       -> FBV with @require_GET, no transaction
write view                            -> @require_POST + @transaction.atomic + PRG redirect
read-modify-write on a row            -> select_for_update inside the transaction
form-heavy CRUD                       -> upgrade to a CBV (CreateView/UpdateView)
JSON API > 5 endpoints                -> upgrade to Django REST Framework
```

### [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView]]

```text
pure CRUD on a model               -> generic CBVs (List/Detail/Create/Update/Delete)
non-model form                       -> FormView (handles GET shape + POST submit)
one custom action on a row           -> FBV with @require_POST (lighter than CBV)
shared auth / permission rule         -> mixin, applied to multiple CBVs
complex multi-step flow                -> django-formtools wizard, not nested CBVs
```

### [[Sections/web/django/django-forms|forms.Form, forms.ModelForm]]

```text
one form, model-backed              -> ModelForm
form not tied to a model            -> forms.Form
parent + N children on one page     -> inlineformset_factory
per-field rule                       -> clean_<field>
cross-field rule                     -> clean()
server-side trust boundary           -> Meta.fields = explicit allowlist (NEVER __all__)
```

### [[Sections/web/django/django-admin|admin.site.register, ModelAdmin]]

```text
< 5 fields, no relations           -> admin.site.register(Model) is enough
any list view used daily            -> list_display + list_filter + search_fields
parent/child editing                 -> TabularInline / StackedInline
FK to a huge table                   -> raw_id_fields or autocomplete_fields
one-shot status flip on N rows       -> @admin.action with .update()
per-user data isolation              -> override get_queryset(request)
```

### [[Sections/web/django/django-rest-framework|Serializer, APIView, ModelViewSet]]

```text
simple CRUD on a model              -> ModelViewSet + ModelSerializer
custom verb on a row                 -> @action(detail=True)
list-wide custom action              -> @action(detail=False)
trust boundary on writes             -> validation in serializer.validate*
row-level ownership                  -> custom BasePermission with has_object_permission
complex query with joins             -> override get_queryset; .select_related/.prefetch_related
```

### [[Sections/web/web-deployment/gunicorn|gunicorn]]

```text
sync, CPU-bound (pandas, ML)        -> sync workers, CPU+1 count
I/O-bound, mostly DB                -> gthread, --threads 4-8, fewer workers
high-concurrency websockets / SSE   -> gevent or move to Uvicorn (ASGI)
ASGI app (FastAPI / Starlette)      -> Uvicorn directly, OR gunicorn -k uvicorn.workers.UvicornWorker
memory leaks accumulating           -> max_requests with jitter
```

### [[Sections/web/web-deployment/uvicorn|uvicorn]]

```text
FastAPI / Starlette / async         -> Uvicorn (with httptools + uvloop)
need supervisor + graceful reload    -> Gunicorn -k UvicornWorker
websockets / long-lived connections   -> Uvicorn directly (Gunicorn timeouts hurt)
single-binary deploy                  -> Hypercorn or Granian as alternatives
Windows host                           -> Uvicorn directly; Gunicorn doesn't run on Win
```

### [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient]]

```text
one-off script, < 10 calls            -> async with httpx.AsyncClient(): ...
service that calls other services      -> ONE long-lived client at app startup
sync code path / Django view           -> httpx.Client (sync) — don't mix loops
need recording for tests                -> respx (httpx) for mocking, vcrpy for replay
gRPC / streaming-heavy                  -> grpc.aio or httpx.AsyncClient with stream()
```

## Databases & SQLAlchemy

### [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine]]

```text
sync ORM, web app                    -> create_engine + QueuePool (default)
async (FastAPI/aiohttp)              -> create_async_engine + AsyncSession
serverless / Lambda                  -> NullPool (no pooling — function may freeze)
long-running job / cron              -> NullPool or pool_recycle tied to job duration
unit tests                           -> StaticPool with sqlite:///:memory:
pool sizing                           -> workers * pool_size <= db.max_connections * 0.8
isolation level                       -> READ_COMMITTED default; SERIALIZABLE for money/inventory
query timeout                         -> server-side (statement_timeout) NOT client-side; client times out leave rogue queries running on the DB
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map]]

```text
web request                           -> one Session per request via DI
background job / cron                 -> one Session per job, with periodic expunge_all
batch ETL                             -> Session per chunk; commit per chunk; expunge between
tests                                 -> Session per test, with rollback in fixture teardown
threading                             -> Session per THREAD; never share; or use scoped_session
long-lived script / REPL              -> reset() periodically or detach unneeded objects
need fresh data after commit          -> expire_on_commit=True (default), or .refresh(obj)
need objects usable after commit      -> expire_on_commit=False (modern preference)
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T]]]

```text
primary key for distributed systems   -> UUID v7 (time-sortable) or UUID v4
primary key for monolith              -> bigint autoincrement (smaller, faster joins)
timestamps                            -> server_default=func.now() — DB clock, not Python clock
nullable column                        -> Mapped[T | None]; lets typing drive nullability
shared columns across many models     -> mixin classes; not abstract base classes
soft delete                           -> deleted_at: datetime | None + index + helper
string length                         -> ALWAYS specify; "VARCHAR" alone defaults to TEXT in PG, MEDIUMTEXT in MySQL
enums                                 -> SQLAlchemy Enum with native_enum=False (portable + alembic-friendly)
JSON columns                          -> Mapped[dict] with mapped_column(JSON); typed via TypedDict for clarity
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-select|select() — Modern Query API]]

```text
need ORM objects                       -> session.scalars(select(Model))
need columns / aggregates              -> session.execute(select(col1, col2)) -> tuples
single result, must exist              -> .one()  (raises if 0 or >1 — failure-loud)
single result, may not exist            -> .one_or_none()
any-or-none, no count check             -> .first()
"first match" of an ordered query        -> .first() with ORDER BY (else nondeterministic)
stream millions of rows                  -> .execution_options(yield_per=N) — bounded memory
"lock and process one row" worker        -> .with_for_update(skip_locked=True) on Postgres
correlated EXISTS / NOT EXISTS           -> exists(subquery.correlate(Outer)) — correlated efficiently
window functions / per-group ranking     -> over(func.row_number(), partition_by=...)
recursive walks                          -> .cte("name", recursive=True)
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-relationships|relationship() — Eager vs Lazy Loading]]

```text
relationship to a single row             -> joinedload (one query, LEFT JOIN)
relationship to many rows                -> selectinload (two queries; better than JOIN's row blow-up)
already JOINed manually                  -> contains_eager (don't load again)
relationship rarely needed               -> default lazy + use selectinload only when accessed
want N+1 to fail loudly                  -> lazy="raise" by default + opt-in eager
"deep" eager (parent.child.grandchild)   -> chain selectinload(...).selectinload(...)
one-off "I really want a 1+N+M query"    -> lazy="select" with explicit comment
bulk update / delete                     -> bypass ORM; use update() / delete() at Core level
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-loading-strategies|Loading Strategies — joinedload, selectinload, raiseload, contains_eager]]

```text
*-to-one (post.author)                   -> joinedload  (one query, no row blow-up)
*-to-many small N (user.posts, < ~100)   -> selectinload (one IN query, no Cartesian)
*-to-many large N or already JOINed       -> contains_eager + custom JOIN
nested relationships                      -> chain selectinload(...).selectinload(...)
polymorphic inheritance                   -> with_polymorphic([Sub1, Sub2])
need only some columns                    -> load_only + raiseload("*")
never want this column unless asked       -> defer(col) class-level, undefer(col) per query
accidentally accessed                     -> raiseload(rel) — fail in dev, find in test
you serialize after session close         -> eager-load EVERYTHING you'll touch BEFORE session.close()
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-transactions|Transactions — begin, commit, rollback, savepoints, isolation]]

```text
typical web request                  -> READ_COMMITTED (default), s.begin() context manager
money / inventory invariants          -> SERIALIZABLE + retry loop on serialization errors
"claim and process" worker            -> with_for_update(skip_locked=True), one row at a time
"try this risky step, recover on fail"-> with session.begin_nested() — savepoint
bulk update / delete                  -> session.execute(update(...)) — bypasses ORM state
need DB-side timeout                  -> SET LOCAL statement_timeout = 30000 in begin block
long-running read                     -> READ_COMMITTED + chunked SELECTs (don't hold one big tx)
distributed across DBs                -> two-phase commit (rare; usually use sagas instead)
```

### [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management]]

```text
FastAPI / framework with DI            -> Depends(get_db); explicit, testable
Flask classic                           -> scoped_session + teardown_request hook
threaded background workers             -> scoped_session (default thread scopefunc) OR per-job Session
asyncio                                 -> async_scoped_session(scopefunc=current_task)
testing                                 -> override the dependency / replace the factory; never hit a global
long-running script / one-off job       -> plain Session() in a with-block; no scoping needed
you find yourself globally importing
  a Session and using it from random
  modules                                -> stop. Pass it as an argument; future-you will thank present-you.
```

### [[Sections/database/sqlalchemy-core/metadata-table|MetaData & Table — SQLAlchemy Core schema]]

```text
greenfield app, you own the schema     -> ORM declarative_base; ergonomics > control
ETL / migration / DDL utility           -> Core MetaData + Table — no model objects needed
Alembic-friendly migrations             -> set naming_convention BEFORE first deploy
wrapping an existing DB you don't own   -> meta.reflect(bind=engine) + Core queries
multi-tenant via schemas                -> Table(..., schema="tenant_x") or schema_translate_map
constraint indexed on expression         -> Index("ix_lower_email", func.lower(table.c.email))
bulk inserts / data shovels              -> Core insert() + executemany; the ORM is overkill
```

### [[Sections/database/sqlalchemy-core/raw-sql-execute|text() & raw SQL — parameterized execution]]

```text
parameterized SQL                     -> text("... :param ...") + dict — ALWAYS
typed bind                            -> .bindparams(bindparam("p", type_=Integer))
IN (list of unknown size)             -> bindparam("ids", expanding=True)
single value back                     -> .scalar_one() / .scalar_one_or_none()
bulk insert                           -> conn.execute(text("INSERT..."), [{...}, {...}])
identifiers from user (rare!)          -> allowlist + dialect.identifier_preparer.quote()
driver pass-through (?? in PG)         -> exec_driver_sql with %s positional
want types in result                  -> use ORM session.execute(stmt) when you have models
```

### [[Sections/database/sqlalchemy-core/core-vs-orm-decision|Core vs ORM — when to use which]]

```text
single rows / domain logic                -> ORM (Session, models, .scalars())
bulk insert / update / delete (>1000 rows)-> Core insert()/update()/delete()
reporting / aggregations (no objects)     -> Core select() with conn.execute()
ad-hoc DDL / vendor SQL                   -> Core text() or raw SQL
migration scripts (Alembic)               -> Core — Alembic context exposes Core API
data shovels / ETL                        -> Core — no point materializing objects
ORM with bulk update inside the session   -> session.execute(update(...).execution_options(synchronize_session=False))
high-throughput web endpoint              -> profile both; ORM often loses to Core by 5-10x
```

### [[Sections/database/sqlalchemy-core/connection-pool|Connection Pool — QueuePool, NullPool, StaticPool, sizing]]

```text
long-running web/api server          -> QueuePool (default), pool_size tied to workers
serverless / Lambda / FaaS            -> NullPool — invocations freeze; pooled conns die
gunicorn pre-fork / multiprocessing   -> QueuePool + post_fork hook calling engine.dispose(close=False)
in-memory SQLite tests                -> StaticPool + check_same_thread=False
batch script / one-shot CLI           -> NullPool — pool overhead pointless for one query
ORM debug session / unit test         -> AssertionPool — fails loudly if connection escapes
pool sizing                            -> workers × (pool_size + max_overflow) ≤ db_max * 0.8
stale connections (DB restart)         -> pool_pre_ping=True (cheap insurance)
idle-killer load balancers             -> pool_recycle < idle_timeout
```

### [[Sections/database/drivers/psycopg3|psycopg 3 — modern PostgreSQL driver]]

```text
<100 rows                  -> executemany inside one transaction is fine
>1000 rows                 -> COPY; rewrites N inserts as one streamed payload
per-row commits in a loop  -> NEVER; ~100 inserts/sec instead of 100k
server up but slow query   -> SET LOCAL statement_timeout, catch QueryCanceled
transient connection loss  -> retry once + pool.check(); not a generic backoff
serverless / Lambda        -> NullPool — pooled conns die during freezes
forking server             -> engine.dispose(close=False) in post-fork hook
pgbouncer transaction-mode -> avoid prepare=True OR use psycopg's named statements
```

### [[Sections/database/drivers/asyncpg|asyncpg — high-performance async Postgres driver]]

```text
pure-async high-throughput PG  -> asyncpg directly; ~3× psycopg async on selects
SQLAlchemy 2.x async + PG       -> postgresql+asyncpg://, statement_cache_size=0 if pgbouncer
need DBAPI / sync interop       -> psycopg 3 instead — asyncpg is async-only
pgbouncer transaction pooling   -> statement_cache_size=0 OR session-mode bouncer
bulk load                       -> copy_records_to_table — accepts lists & async iterators
custom row decoding             -> set_type_codec inside init= (every pool conn gets it)
pub/sub between services        -> LISTEN/NOTIFY via add_listener — replaces a broker
query timeouts                  -> command_timeout AND server-side statement_timeout
```

### [[Sections/database/drivers/sqlite3-stdlib|sqlite3 — Python stdlib SQLite driver]]

```text
single-process app                 -> stdlib sqlite3 + WAL + foreign_keys ON
web app, single instance           -> sqlite3 + immediate write txns; ~10k req/s OK
web app, multi-host or NFS         -> NOT sqlite3 — switch to Postgres/MySQL
tests                              -> file:test?mode=memory&cache=shared (multi-conn)
bulk load                          -> ONE txn wrapping executemany — ~100k/sec
per-row commit in a loop           -> NEVER; ~100/sec — fsync per row
threads in one process             -> one connection per thread (threading.local)
live backup                         -> con.backup(dst) — incremental, no app downtime
```

### [[Sections/database/drivers/aiosqlite|aiosqlite — async wrapper around sqlite3]]

```text
FastAPI/aiohttp + sqlite          -> aiosqlite for queries; to_thread for bulk
bulk insert / large transaction   -> asyncio.to_thread(sync_bulk) — far less overhead
tight inner loop over a result    -> to_thread on a sync function — avoid N hops
write coroutines that race        -> one asyncio.Lock around writes; you weren't
                                     getting parallel writes from SQLite anyway
reads + writes from same proc     -> separate read-only and read-write conns
tests                              -> aiosqlite + ":memory:" or file:t?mode=memory&cache=shared
scaling beyond one process         -> stop — switch to Postgres/MySQL
```

### [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project]]

```text
new project, single DB         -> alembic init + naming_convention + env-driven URL
monorepo, multiple services    -> one alembic dir per service; share NAMING_CONVENTION
SQLite in dev / sqlite in prod -> render_as_batch=True; ALTER COLUMN unsupported otherwise
need offline review            -> alembic upgrade head --sql > review.sql; DBA approval
per-tenant schemas             -> include_schemas=True + version_table_schema=...
hot path: CI gates             -> reversibility test (this snippet) on every PR
secrets in URL                 -> NEVER commit alembic.ini with the URL; env-only
programmatic apply              -> alembic.command API > shelling out from Python
```

### [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration]]

```text
small table (<100k rows)        -> one revision, NOT NULL + server_default is fine
large table on Postgres         -> THREE revisions: add nullable, backfill, enforce
backfill > 1M rows              -> chunked script OUTSIDE alembic; marker migration with assert
indexes on a hot table          -> postgresql_concurrently=True inside autocommit_block()
migration that holds AccessExclusive -> set lock_timeout; fail fast over making users wait
SQLite ALTER COLUMN             -> render_as_batch=True (env.py); rebuilds the table
need DBA review before deploy   -> alembic upgrade head --sql > deploy.sql; PR-attach it
migrations as Python (rare)     -> use op.execute(sa.text(...)) — keep dialect awareness
```

### [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill]]

```text
<100k rows                       -> one UPDATE in a tiny script is fine
100k-10M rows                    -> chunked UPDATE; one transaction per chunk
>10M rows or replicated DB       -> add: progress table, SIGTERM handler, rate logging
needs to run during business hrs -> sleep between chunks; throttle to <50% of normal write rate
data depends on app-side logic   -> Python script with engine, NOT op.execute in a migration
irreversible (column rename)     -> dual-write from the app FIRST; backfill; cut over; remove old
re-running after partial failure -> idempotent WHERE clause + persisted cursor; no log-spelunking
migration must NOT run forever   -> Alembic step asserts COMPLETE; raises if backfill incomplete
```

### [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions]]

```text
accidental fork (one branch)         -> alembic merge -m "..." head1 head2
prevent accidental forks             -> CI step: alembic heads | wc -l == 1
per-tenant or per-feature trees      -> branch_labels + version_locations
cross-branch dependency              -> depends_on = "<other-branch-rev>"
downgrade an intentional branch      -> alembic downgrade <branch>@-1
merge two intentional branches       -> alembic merge --branch-label combined head1 head2
never want a branch in this DB       -> set transaction_per_migration=False; skip alembic upgrade
monorepo with multiple service DBs   -> one alembic/ tree per service, NOT branches in one tree
```

### [[Sections/database/patterns/repository-pattern|Repository pattern — abstract the persistence layer]]

```text
small CRUD app                   -> SQLAlchemy direct (intro tier); repo is overhead
tests slow because of the DB     -> Repository + in-memory double (junior tier)
2+ backends OR rich query reuse  -> Protocol + Specifications (senior tier)
queries that fight the ORM       -> drop to repo.execute_raw_sql; don't model in Spec
need transactions across repos   -> Unit of Work (see unit-of-work entry)
audit/logging on every read       -> repo is the chokepoint for cross-cutting concerns
"I want to swap Postgres for X"  -> NO — repository hides Session not SQL dialects;
                                    cross-DB portability lives below the repo
```

### [[Sections/database/patterns/unit-of-work|Unit of Work — atomic, repository-aware transactions]]

```text
1 handler, 1 transaction         -> Session directly; UoW is overhead
2+ aggregates per handler        -> UoW; the atomicity contract is the value
need partial commits             -> begin_nested() savepoints; fail-and-continue
cross-process events              -> transactional outbox + worker — never call
                                     external APIs from inside a DB txn
tests slow because of the DB     -> in-memory UoW with in-memory repos
complex saga across services     -> orchestrator + outbox; UoW per step, not whole saga
commit-by-default web framework  -> wrap each request in UoW via Depends/middleware
long-running operation           -> UoW per step; do NOT hold one open across
                                     I/O or user input
```

### [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading]]

```text
*-to-one (User.address)          -> joinedload — one row per parent, JOIN is cheap
*-to-many (User.posts)           -> selectinload — IN(...) avoids row-multiplication
already JOINed for WHERE         -> contains_eager — don't re-JOIN
"give me everything for this row" -> joinedload all *-to-one + selectinload all *-to-many
default for new relationships    -> lazy="raise" — N+1 becomes a test failure, not slow prod
bulk export of all rows          -> .yield_per(1000) + selectinload — bounded memory
query you ALWAYS need eager      -> set lazy="selectin" on the relationship; opt-OUT not opt-in
```

### [[Sections/database/patterns/isolation-levels|Isolation levels — preventing the inventory oversell]]

```text
typical OLTP request               -> READ COMMITTED (default); fine for reads
contention on a hot row            -> with_for_update(); pessimistic lock
"report consistency across reads"  -> REPEATABLE READ — same snapshot per stmt
write-heavy with rare conflicts    -> SERIALIZABLE + retry; throughput stays high
"this can never run twice"         -> pg_try_advisory_lock; cluster-wide singleton
long-running read for a report     -> set deferrable + read-only on a SERIALIZABLE
                                       tx; gets a snapshot, no write conflicts
batch ETL                          -> SERIALIZABLE with retry; commit per batch
every 5s scheduler tick            -> advisory lock; multiple instances co-exist safely
detected serialization failure     -> retry the WHOLE transaction (3-5 attempts, jittered)
```

## Debugging & Profiling

### [[Sections/debugging-profiling/builtin-debugging/pdb-breakpoint|pdb / breakpoint() — interactive Python debugger]]

```text
know the line you want to stop      -> breakpoint() in code; PYTHONBREAKPOINT picks tool
only break for one bad input        -> if pred: breakpoint()
crashed and you have stderr         -> wrap in try/except + pdb.post_mortem
long-running CLI dev tool           -> auto_pdb_on_error() ctx; per-invocation only
production process is hung          -> py-spy dump --pid; do NOT touch the code
need richer UI than pdb             -> ipdb (tab-completion) or pudb (curses) via PYTHONBREAKPOINT
editor-integrated debugging         -> debugpy + VS Code attach; Pycharm remote debug
tests fail intermittently in CI     -> pytest --pdb on local rerun; never in CI
asyncio coroutine                   -> pdb works in 3.10+; otherwise asyncio.run(debug=True)
```

### [[Sections/debugging-profiling/builtin-debugging/traceback-formatting|traceback — capture, format, and chain exceptions]]

```text
one-line log of failure          -> log.exception("...") — exc_info added automatically
structured JSON sink             -> structlog + format_exc_info processor
need machine-parseable frames    -> traceback.extract_tb -> list of {file,line,func}
colorized dev terminal           -> rich.traceback.install(show_locals=True)
re-raising as a domain error     -> raise DomainErr("...") from original   (preserves __cause__)
uncaught exception in a thread   -> threading.excepthook (Python 3.8+)
secrets in locals                -> walk frames + redact keys matching SECRETS_REDACT
production stack-trace too noisy -> drop /site-packages/ frames; or set sys.tracebacklimit
debugging via APM (Sentry/etc)   -> SDK installs its own excepthook — don't double-install
```

### [[Sections/debugging-profiling/builtin-debugging/faulthandler-segfault|faulthandler — Python traceback on segfault / hang]]

```text
C extension segfaults             -> faulthandler.enable() — no other tool catches this
process hangs unpredictably        -> dump_traceback_later(timeout=N, repeat=True)
"what is each worker doing now?"   -> faulthandler.register(SIGUSR1) + kill -USR1
live-attach without code change    -> py-spy dump --pid <PID>  (needs ptrace permission)
asyncio coroutines hang             -> asyncio.run(debug=True) + slow_callback_duration
file= must persist across restart   -> open in append mode, line-buffered (buffering=1)
prod log shipping                   -> point file= at a path your log shipper already tails
Windows                             -> faulthandler works for SIGSEGV; SIGUSR* don't exist
```

### [[Sections/debugging-profiling/builtin-debugging/inspect-introspection|inspect — programmatic signature introspection]]

```text
read function args at runtime         -> inspect.signature(fn).parameters
need resolved type hints              -> typing.get_type_hints(fn) — handles 'from __future__'
need Annotated metadata               -> get_type_hints(fn, include_extras=True)
read class constructor                -> inspect.signature(cls) — proxies __init__
forward calls in a decorator          -> sig.bind(*a, **kw) + apply_defaults
build a CLI from a function           -> walk Parameter.kind + use Annotated for help
need source code                      -> inspect.getsource(fn) — needs file on disk
walk caller's locals                  -> inspect.currentframe().f_back.f_locals  (debug only)
asyncio: is this a coroutine?          -> inspect.iscoroutinefunction(fn)
is this a method on a class?           -> inspect.ismethod / isfunction / ismethoddescriptor
```

### [[Sections/debugging-profiling/cpu-profiling/cprofile-deterministic|cProfile — stdlib deterministic profiler]]

```text
reproducible script / batch job   -> cProfile is the right tool
live production process            -> py-spy (sampling, attaches to PID)
need line-level + memory           -> scalene (line-level CPU + Python/native split + memory)
tight inner loop, small functions  -> cProfile OVERSTATES; cross-check with py-spy
isolate one region                 -> profile_region("name") ctx; not the whole program
share a profile with a teammate    -> dump_stats to .prof; they snakeviz it locally
visualize hotspots                 -> snakeviz (interactive); gprof2dot (static PNG)
asyncio-heavy code                 -> cProfile shows event-loop overhead as hot; use py-spy
compare two runs / regression test -> snakeviz can't diff; export pstats and diff manually
```

### [[Sections/debugging-profiling/cpu-profiling/pyspy-sampling|py-spy — sampling profiler for live processes]]

```text
running prod process, no code change   -> py-spy top / record / dump
short-lived script you can rerun       -> cProfile (deterministic, reproducible)
need line-level CPU + memory           -> scalene
need allocation tracking               -> memray (Python heap) — different tool
ephemeral CPU spike (<5s)              -> py-spy --rate 250 + dump on a tight loop
K8s pod, no shell in image             -> kubectl debug ephemeral container
compare two runs / regression          -> py-spy record --format speedscope, diff in speedscope.app
continuous profiling in prod           -> Pyroscope / Parca / Datadog (all use py-spy underneath)
asyncio coroutines                     -> py-spy attributes time correctly across awaits
C-extension is hot                     -> add --native (needs root / CAP_SYS_PTRACE)
```

### [[Sections/debugging-profiling/cpu-profiling/scalene-line|scalene — line-level CPU + memory + GPU profiler]]

```text
"which LINE is slow"                     -> scalene
"Python overhead or native?" (numpy etc) -> scalene's Python% vs Native% columns
memory leak suspected                    -> scalene --memory-leak-detector
live prod process                        -> py-spy (scalene needs you to start the script under it)
reproducible script + line detail        -> scalene
reproducible script + function detail    -> cProfile (lower overhead than scalene)
GPU work (PyTorch, JAX)                  -> scalene (or NVIDIA Nsight for deep CUDA)
pre-merge perf regression in CI          -> scalene --json + threshold assertions
scaled, multi-process workers            -> py-spy on each worker; scalene is single-process
reduce noise on first run                -> --profile-only "yourpkg" + --reduced-profile
```

### [[Sections/debugging-profiling/memory-profiling/tracemalloc-stdlib|tracemalloc — stdlib heap snapshot profiler]]

```text
Python-side memory growth          -> tracemalloc — sees alloc lines
numpy/torch buffer growth          -> tracemalloc is BLIND — use memray
"what's the heap right now?"       -> single take_snapshot + statistics
"what GREW since last check?"      -> two snapshots + compare_to
slow leak over hours/days          -> periodic snapshots to disk; offline diff
stack-frame attribution            -> tracemalloc.start(N) with N=10-25; Filter library noise
leaked object kept alive by what?  -> gc-debugging entry (gc.get_referrers + objgraph)
need C-extension allocator info    -> memray --trace-python-allocators
on-demand dump in production       -> SIGUSR2 handler + pickle the snapshot
too much overhead                  -> turn off OR sample every Nth alloc with custom filter
```

### [[Sections/debugging-profiling/memory-profiling/memray-allocs|memray — production-grade allocation tracker with flame graphs]]

```text
need allocation site for native bufs   -> memray (tracemalloc is BLIND to C ext)
pure-Python heap, ultra-low overhead   -> tracemalloc
live process, no code change           -> memray attach <PID>  (Linux + ptrace)
diff two runs                          -> memray flamegraph --diff
"what is leaking?"                     -> memray flamegraph --leaks
pytest perf gate                       -> pytest-memray + @limit_memory
reference-cycle leak                    -> gc-debugging entry (gc / objgraph / weakref)
need flame graph UI                     -> memray flamegraph (HTML)
need to grep                            -> memray summary / stats / tree
continuous monitoring                   -> short windowed captures shipped to S3; not 24/7
```

### [[Sections/debugging-profiling/memory-profiling/gc-debugging|gc / weakref — diagnose reference cycles and stuck objects]]

```text
"what's holding obj alive?"            -> gc.get_referrers(obj) — quick triage
"is obj freed yet?"                    -> weakref.ref(obj); ref() returns None when freed
"draw the ref graph"                   -> objgraph.show_backrefs (needs graphviz)
cache that must NOT extend lifetime    -> WeakValueDictionary or WeakSet
cleanup hook on collection             -> weakref.finalize (NOT __del__)
__del__ + cycle = uncollectable        -> redesign without __del__; use finalize
short-lived child process              -> gc.disable() at start; saves cycle-collector CPU
leak detection in tests                -> assert all_instances(MyClass) == [] after teardown
uncollectable cycle ended in gc.garbage -> always means __del__ on a cycle member
high-frequency allocator               -> tune gc.set_threshold(...) — DON'T disable in long-running
```

### [[Sections/debugging-profiling/async-attach/asyncio-debug|asyncio debug mode — slow-callback and blocking-IO detection]]

```text
coroutine handler is slow            -> asyncio.run(debug=True) + slow_callback_duration
"what tasks are running?"            -> asyncio.all_tasks(loop) snapshot
"show their stacks"                  -> for t in all_tasks: t.print_stack()
live REPL into the loop              -> aiomonitor start_monitor + telnet
debug HTTP endpoint                  -> /admin/tasks returning snapshot_tasks()
exception in fire-and-forget task    -> loop.set_exception_handler — never lose it
blocking I/O on the loop             -> debug=True warns; replace with async equivalent
                                       (httpx.AsyncClient, aiofiles, asyncpg, etc.)
slow callback below 100ms threshold  -> loop.slow_callback_duration = 0.02 (your SLO)
"is this coroutine awaited?"         -> debug=True warns at GC time on un-awaited coros
PYTHONASYNCIODEBUG=1                 -> env-var alternative to debug=True; same effect
```

### [[Sections/debugging-profiling/async-attach/post-mortem-attach|Production attach — inspect a live process without restart]]

```text
"what is each thread doing right now?"   -> py-spy dump --pid (no code change)
"what's in this cache / queue?"          -> manhole.install() at startup; manhole-cli
"I need a full debugger with breakpoints" -> debugpy.listen + VS Code attach
asyncio service, live introspection      -> aiomonitor (TUI + telnet REPL)
no code change AND no debugpy installed  -> kubectl debug ephemeral container
container has no shell                    -> ephemeral debug container brings the shell
prod pod under live traffic              -> remove from LB FIRST; debugger pauses block
security: ptrace not granted             -> setcap cap_sys_ptrace=ep on the binary
Python segfaulting                       -> faulthandler.enable() — pdb won't help
process hung at C level (extension)      -> gdb -p <PID>; py-spy --native; not pdb
```

## Observability

### [[Sections/observability/structured-logging/structlog-basics|structlog — structured logging with dev + prod renderers]]

```text
service emits any logs                  -> structlog over stdlib logging
dev terminal vs prod log shipper         -> ConsoleRenderer vs JSONRenderer (env branch)
need request-scoped fields everywhere    -> bind_contextvars + merge_contextvars processor
library logs are noisy / wrong shape    -> ProcessorFormatter as stdlib root handler
sensitive fields                         -> custom redact processor in the pipeline
asyncio                                  -> contextvars (already done); NOT threading.local
need >100k log/s                         -> cache_logger_on_first_use=True; consider sampling
write tests against logs                 -> structlog.testing.LogCapture as a fixture
want type-checked logger param           -> Logger Protocol; depend on the interface
exceptions in async tasks                -> log.exception("event_name") in except blocks
```

### [[Sections/observability/structured-logging/log-correlation-ids|Correlation IDs — propagate request_id across logs and services]]

```text
single-service, single-process       -> request_id ContextVar is enough
multiple Python services              -> propagate via X-Request-ID OR traceparent
any non-Python downstream             -> traceparent (W3C standard) — request_id is ad-hoc
already running OpenTelemetry         -> trace_id is your correlation id; piggyback
want to keep request_id semantics     -> include both (request_id for humans, trace_id for tools)
async code                             -> ContextVar (NOT threading.local; bind_contextvars)
sync (Flask without async)             -> ContextVar still works; flask uses ContextVar internally
message queues (Celery, Kafka)         -> embed traceparent in the message body or headers
logs need to pivot to traces           -> add_trace_context structlog processor
logs need to pivot to errors           -> Sentry SDK reads trace_id automatically
```

### [[Sections/observability/structured-logging/log-sampling-budgets|Log sampling — keep signal, drop volume, hit a budget]]

```text
logs > $1k/mo on a small service       -> sample; you almost certainly can drop 80% with no loss
need every log for slow/failed reqs    -> tail-based sampling: buffer + flush on outcome
most logs are healthcheck noise        -> per-route rate (RATES['/healthz'] = 0.01)
debugging a specific user's request    -> X-Force-Log header (authenticated!)
want guaranteed budget cap             -> token bucket per second + drop overflow
logging volume is the bug, not cost    -> reduce log calls, don't sample noise harder
compliance / audit logs                -> NEVER sample; route to a separate sink
error budget for log loss              -> sample <10% only on INFO; keep WARNING+ at 100%
per-tenant log isolation               -> sample inside tenant, not across (avoid favoritism)
tail sampling memory pressure          -> cap MAX_BUFFER per request; over-cap == drop overflow
```

### [[Sections/observability/distributed-tracing/otel-tracing-setup|OpenTelemetry tracing — SDK setup, spans, exporters]]

```text
bootstrap one service                  -> ConsoleSpanExporter to verify; OTLP for real
ship to vendor (Honeycomb/Datadog/...) -> OTLP exporter; vendor docs always show endpoint
sampling at scale                       -> TraceIdRatioBased(0.05-0.1); ParentBased to honor upstream
never lose specific traces              -> set sampling=ALWAYS_ON for a route via tracer hook
exception on a span                     -> span.record_exception(e) + set_status(ERROR)
container shutdown losing spans         -> SIGTERM handler -> provider.force_flush()
want consistent attribute names         -> opentelemetry.semconv.trace.SpanAttributes
bounded memory per span                 -> SpanLimits(max_attributes=128, max_attribute_length=4096)
testing: assert spans                   -> InMemorySpanExporter as the processor; inspect get_finished_spans()
asyncio                                 -> SDK is async-aware; spans inherit via contextvars (free)
```

### [[Sections/observability/distributed-tracing/otel-instrumentation|OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis]]

```text
bootstrap tracing in dev               -> Instrumentor().instrument() per library
uniform instrumentation in prod        -> opentelemetry-distro + opentelemetry-instrument agent
exclude noisy routes                   -> OTEL_PYTHON_FASTAPI_EXCLUDED_URLS env var
capture custom headers                 -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST
redact sensitive headers               -> OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS
library not in distro list             -> manual tracer.start_as_current_span; or write custom Instrumentor
one Instrumentor causing issues        -> OTEL_PYTHON_DISABLED_INSTRUMENTATIONS=name,name
per-request custom attributes          -> server_request_hook on FastAPI/ASGI Instrumentor
trace_id in log records (stdlib)       -> opentelemetry-instrumentation-logging  (sets LogRecord attr)
non-FastAPI ASGI (Starlette/Quart)     -> opentelemetry-instrumentation-asgi
psycopg2 / psycopg / asyncpg          -> opentelemetry-instrumentation-{psycopg2,psycopg,asyncpg}
```

### [[Sections/observability/distributed-tracing/span-context-propagation|Span context propagation — across async, threads, queues]]

```text
asyncio Tasks                   -> automatic (contextvars); no code needed
thread pools                    -> wrap submit; context.attach in worker
Celery                          -> opentelemetry-instrumentation-celery; auto producer + worker
Kafka / RabbitMQ raw            -> inject on send, extract on receive; use TraceContext propagator
custom transport                -> inject(carrier) into your wire format; extract on receive
tenant_id in every span         -> baggage.set_baggage("tenant_id", id) — rides automatically
need value in span attributes    -> baggage.get_baggage(key) + span.set_attribute (baggage isn't auto-tagged)
message older than X            -> start NEW trace with trace.Link to the old one
propagator format incompat      -> set OTEL_PROPAGATORS=tracecontext,baggage,b3multi (multiple)
non-OTel upstream                -> add b3 or jaeger propagator to OTEL_PROPAGATORS list
tests across processes           -> InMemorySpanExporter on both sides; assert parent/child ids match
```

### [[Sections/observability/metrics/prometheus-client|prometheus_client — Counter / Histogram / Gauge for Prometheus]]

```text
single-process app (e.g. asyncio)   -> default registry; no multiprocess setup
gunicorn / uwsgi multi-worker        -> PROMETHEUS_MULTIPROC_DIR + MultiProcessCollector
need to link metric -> trace         -> exemplars; .observe(value, exemplar={"trace_id": ...})
want SLO-accurate p95                 -> custom buckets matching your latency budget
route label might explode             -> whitelist known templates; bucket unknowns to "<other>"
Counter for things that decrease     -> WRONG — Counter only goes up; use Gauge
value with running average           -> Summary (computes quantiles client-side; no aggregation across pods)
value with global percentile         -> Histogram + histogram_quantile in PromQL
metric needs to track an external resource -> custom Collector (def collect(): yield Metric(...))
pushgateway "batch job that exits"   -> push_to_gateway(); avoid for long-running services
```

### [[Sections/observability/metrics/otel-metrics|OpenTelemetry metrics — unified pipeline with traces]]

```text
already running OTel for traces       -> OTel metrics; one pipeline, one collector
only need Prometheus                   -> prometheus_client; simpler, more mature in Python
need both Prom AND OTLP                -> two readers (PrometheusMetricReader + OTLPMetricExporter)
shape what's exported                  -> View per instrument with attribute_keys whitelist
custom histogram buckets               -> View with ExplicitBucketHistogramAggregation
external resource (queue, cache)       -> create_observable_gauge with callback
value can go down (in-flight)          -> create_up_down_counter (NOT counter)
gunicorn multi-worker                  -> use prometheus_client multiprocess; OTel Python isn't there yet
exemplars linking metric to trace      -> automatic when traces + metrics share the same SDK
shutdown losing the last batch         -> provider.force_flush() in atexit + SIGTERM handler
```

### [[Sections/observability/metrics/metric-cardinality|Cardinality discipline — design metrics that don't explode]]

```text
adding a label                          -> compute distinct_values × other_labels; if >10k, abort
high-card identifier (user_id)          -> bucket into bands; OR top-N + "other"
continuous value (latency)              -> Histogram bucket; never raw-value Counter
route/path label                        -> use the TEMPLATE ("/widgets/{id}"), not raw path
cardinality of new feature unknown      -> simulate; compute series count from feature scale
shipped a runaway label                 -> relabel_config labeldrop in Prometheus; OTel View whitelist
prometheus_tsdb_head_series_created    > 1000/min trend     -> ALERT; explosion in progress
new metric proposal in PR               -> require /* CARDINALITY: count_math */ comment
need per-user analytics                 -> use logs/traces, NOT metrics; metrics aggregate
per-tenant required by SLA              -> bound to top-N tenants + "other"; reject unbounded
```

### [[Sections/observability/errors-alerting/sentry-sdk|Sentry SDK — production exception tracking]]

```text
bootstrap a service             -> sentry_sdk.init(dsn, environment, release)
ASGI/Flask app                   -> add the framework integration; it sets transaction names
high traffic, $$ pressure        -> traces_sample_rate=0.1; before_send_transaction drops healthchecks
per-request decision              -> traces_sampler function (always sample errors, 10% otherwise)
PII risk                          -> send_default_pii=False + before_send recursive redactor
already running OTel              -> SentryPropagator + SentrySpanProcessor; trace_ids align
SQL errors with the query         -> SqlalchemyIntegration; SQL appears on DB exceptions
custom domain workflows           -> sentry_sdk.start_transaction(name=...) explicit
release tracking                  -> set release=APP_VERSION; deploys appear on Sentry timeline
user feedback widget              -> sentry-javascript on the frontend; sentry-python only on server
```

### [[Sections/observability/errors-alerting/structured-error-context|Correlated error context — one ID across logs, traces, Sentry]]

```text
one id across all 3 planes      -> trace_id (OTel-canonical, W3C-standard)
need a human-readable id too    -> request_id alongside; tag both on every plane
already running Sentry          -> add SentryPropagator + SentrySpanProcessor; trace_ids align
no Sentry, just logs + traces   -> add_trace_context structlog processor is enough
testing the correlation        -> InMemorySpanExporter + Sentry transport mock; assert ids match
alert pivots to log + trace    -> document in runbook; engineers WILL use it
custom error class              -> attach trace_id in the constructor; survives serialization
message queue handler          -> propagate trace_id via headers; resume on consumer side
batch job (no inbound trace)   -> generate trace_id at job start; propagate to all spawned spans
```

### [[Sections/observability/errors-alerting/alerting-rules|SLO-based alerting — multi-window, multi-burn-rate PromQL]]

```text
"page if errors high"             -> SLO-based MWMBR (5m+1h, 30m+6h); not raw thresholds
transient spike (30s)             -> won't fire (1h window dampens); intentional
sustained outage (30s+)           -> 5m window fires within 2-7 minutes; intentional
slow drift                        -> 6× ticket fires after 15+ minutes; tracked, not paged
noisy alerts                      -> wider windows; raise burn-rate multiplier
missed outages                    -> narrower windows; lower burn-rate multiplier
metrics stopped reporting         -> 'absent()' meta-alert; otherwise silent failure
deploys cause flap                -> Alertmanager silence for the deploy window
N alerts during one cluster event -> inhibition_rules (NodeDown silences PodDown on same node)
alert with no runbook              -> rejected; runbook_url is mandatory
alert annotation: just "error rate high" -> rewrite — operator needs WHAT/WHY/HOW
```

## Caching

### [[Sections/caching/in-memory/functools-lru-cache|functools.lru_cache / cache — memoize pure functions]]

```text
pure function, hashable args        -> @lru_cache or @cache
instance method                     -> methodtools.lru_cache (NOT functools, leaks self)
compute-once-per-instance attr      -> @cached_property (stdlib)
args include lists/dicts            -> convert to tuple/frozenset; or use cachetools with key=
async function                      -> asyncache.cached(TTLCache(...))
need TTL                            -> cachetools (lru_cache is FIFO/LRU only, no time)
bounded by total memory             -> cachetools.LRUCache(maxsize, getsizeof=sys.getsizeof)
need invalidation by key            -> cachetools (dict-like); lru_cache is all-or-nothing
distributed / multi-process         -> Redis (see redis-py-basics entry)
need cache stats in Prometheus      -> wrap and instrument; lru_cache stats are diff-only
```

### [[Sections/caching/in-memory/cachetools-policies|cachetools — TTL, LFU, LRU policies + thread-safe wrappers]]

```text
need TTL                          -> TTLCache (or @ttl_cache)
need LRU                           -> LRUCache (cachetools or stdlib lru_cache)
need LFU                           -> LFUCache — for "keep popular, drop tail"
memory-bounded                     -> getsizeof= sums bytes; cap maxsize as bytes
thread-safe                        -> wrap with Lock OR pass lock= to @cached
need explicit invalidation         -> cachetools (dict-like); lru_cache is all-or-nothing
async function                     -> asyncache.cached(TTLCache(...))
per-call observability             -> subclass and instrument __getitem__/__setitem__
shared across processes            -> NOT in-memory; use Redis (see redis-py-basics)
simple, no TTL                     -> functools.lru_cache (stdlib, faster path)
need a custom eviction policy      -> subclass Cache and override popitem()
```

### [[Sections/caching/in-memory/request-scoped-cache|Request-scoped cache — DataLoader pattern, contextvars]]

```text
share state within one request           -> request.state.cache or ContextVar
helpers can't reach 'request'            -> ContextVar pattern
N+1 on a relationship                    -> DataLoader (batches in one tick)
GraphQL resolver                          -> DataLoader is the canonical answer
share across requests                    -> NOT request-scoped; lru_cache or Redis
read fresh data per request              -> request-scoped; never process-scoped
need to clear at request end             -> reset() on the ContextVar in finally
long-running task (background job)       -> separate scope; create a fresh cache for it
per-tenant request isolation              -> include tenant in the cache key
DataLoader vs eager-loading (ORM)        -> eager-loading wins when shape is known;
                                            DataLoader wins for dynamic loads (GraphQL)
```

### [[Sections/caching/redis/redis-py-basics|redis-py — connect, get/set, pipelines, async, pools]]

```text
single Redis instance              -> redis.Redis.from_url; pool via ConnectionPool
need HA / failover                 -> Sentinel (Sentinel.master_for) — auto-discovers master
data exceeds one node              -> Cluster (RedisCluster); sharded; mind cross-slot ops
batched set/get                    -> pipeline(transaction=False); 100× round-trip cut
atomic multi-step                  -> pipeline().multi() ... .execute() (MULTI/EXEC)
async service                      -> redis.asyncio.Redis — same API
cache offline must NOT down svc    -> circuit breaker; safe_get returns None on errors
transient network errors           -> Retry(ExponentialBackoff(...)) on the client
service isolation                  -> KEY_PREFIX namespace per service
TLS                                 -> ssl=True + ssl_ca_certs; required for non-loopback
ACL / IAM                           -> username= + password= (Redis 6.0+); rotate via env
need streams / pubsub              -> r.pubsub() / r.xadd; different command surface
```

### [[Sections/caching/redis/cache-aside-pattern|Cache-aside — read-through with fallback to source]]

```text
simple cache, no contention          -> intro/junior pattern; SETNX is overkill
hot key (>10 req/s on miss)          -> single-flight SETNX lock
want zero stampede risk              -> XFETCH probabilistic refresh + SETNX
"not found" hits source repeatedly  -> negative cache (short TTL on a sentinel)
need to invalidate everything at deploy -> CACHE_VERSION prefix; bump on deploy
cache outage must NOT 500            -> wrap in try/except RedisError; fall to source
stampede protection at scale         -> XFETCH (preventive) > SETNX (reactive)
cache write order matters            -> NOT cache-aside; use write-through or pub/sub invalidation
strict consistency with source       -> NOT cache-aside; cache is eventually consistent
need cross-process coordination      -> use a real lock (RedLock); SETNX is basic
```

### [[Sections/caching/redis/cache-invalidation|Cache invalidation — delete, version, tag, pub/sub fanout]]

```text
single-process service              -> delete-on-write is enough; race window is tiny
multi-process, single host          -> Redis L2 is enough; no pub/sub needed
multi-host fleet                    -> Redis pub/sub for L1 fanout
need ordered invalidation log       -> Redis Streams (XADD/XREAD); replay-able
data shape changes at deploy        -> CACHE_VERSION prefix; flush by bumping
"all data for user 42"              -> tag-based (SADD tag:user:42 <key>)
strict consistency required         -> NOT cache; or write-through with quorum
updated_at available on the row     -> version-stamped keys; race-free
immediate fleet-wide invalidate     -> Redis pub/sub PUBLISH (~10ms latency)
cache layer is L1 only (no Redis)   -> use Memcached-style consistent hashing OR move to Redis
transactional invalidation          -> MULTI/EXEC pipeline: delete + publish atomically
```

### [[Sections/caching/http-cdn/http-caching-headers|HTTP cache headers — Cache-Control, ETag, conditional GETs]]

```text
public read API                       -> public, max-age=N (browser), s-maxage=M (CDN)
slow origin acceptable but not slow UX -> stale-while-revalidate=N (serves stale, refresh in background)
origin failure should not error users -> stale-if-error=N (serve stale on origin 5xx)
hashed asset URL (...abc123.js)       -> max-age=31536000, immutable
user-specific data                    -> private, must-revalidate; NEVER public
auth-gated response                   -> Vary: Authorization (or private)
varying by encoding                   -> Vary: Accept-Encoding
sensitive (no caching at all)         -> no-store (NOT no-cache; that means revalidate, still stored)
conditional revalidation              -> ETag (preferred) or Last-Modified
ETag from rendered body               -> EXPENSIVE — derive from version/updated_at instead
admin / write endpoint                -> Cache-Control: no-store; Vary doesn't help
GraphQL POST / writeable endpoints    -> no-store; cache only successful idempotent GETs
```

### [[Sections/caching/http-cdn/cdn-edge-caching|CDN edge caching — surrogate keys, purge, hit-rate debugging]]

```text
public read API                       -> CDN with s-maxage; surrogate keys for invalidation
need targeted invalidation            -> Surrogate-Key (Fastly) / Cache-Tag (Cloudflare Enterprise)
simple plan, no enterprise tag        -> per-URL purge; live with coarse invalidation
user-specific data                    -> private; bypass CDN entirely (or Vary: Authorization)
slow origin acceptable                -> stale-while-revalidate=N at edge
origin failure must not error users  -> stale-if-error=N at edge
hashed asset URLs                     -> immutable + max-age=31536000; never invalidate
hot path on a deploy                 -> purge-on-deploy webhook bumping deploy-rev tag
hit ratio < 90%                       -> audit Vary, cookies, Authorization, low max-age
cost-sensitive                        -> origin shielding (CDN-to-CDN before origin); hit ratio matters
GDPR / PII                            -> never cache user-specific responses at edge; private only
websockets / SSE                      -> not cacheable; pass through directly to origin
```

### [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing]]

```text
cold/rare key                       -> plain cache-aside; no protection needed
warm/hot key (>10 RPS on miss)      -> SETNX single-flight (junior tier)
very hot key (>100 RPS)             -> XFETCH + SETNX + in-process coalesce
never-block-the-user latency-critical -> soft-TTL + background refresh
single-process service              -> asyncio.Lock per key is enough
multi-process / multi-host          -> SETNX (locks live in Redis; everyone sees them)
lock-holder dies mid-refresh        -> short LOCK_TTL_MS; losers re-attempt after expiry
thundering herd of timeouts         -> add jitter to the loser-poll backoff
simple expiry, low traffic          -> XFETCH overkill; junior tier is right
need to know "is this hot?"          -> tracking + auto-promote: simple keys → SETNX → XFETCH
```

### [[Sections/caching/patterns/cache-key-design|Cache key design — namespace, version, tenant, hash safely]]

```text
single-service, single-tenant       -> simple f"entity:{id}"; revisit if you grow
multi-service on shared Redis       -> namespace prefix per service ("svc:cache:")
shape changes on deploy             -> version segment ("v3"); bump on incompatible change
multi-tenant                        -> tenant in the key path; never trust caller scoping
user-input as key part              -> normalize + sha256 if long/noisy; bound length
immutable payload (rendered HTML)   -> content-hash key; never invalidate, age out by TTL
hot single key on Redis Cluster     -> shard via random salt + aggregate at read
need MULTI/EXEC across keys         -> {hash-tag} co-locates them on one shard
key length matters                  -> hash the tail; keep prefix readable
key inventory in code               -> centralize in a KEYS module; renames in one file
external services share keys        -> document the schema; treat as a stability contract
```

### [[Sections/caching/patterns/cache-warmup|Cache warmup — pre-populate after deploy / restart]]

```text
short cold-cache window OK              -> skip warmup; rely on cache-aside
cold latency unacceptable                -> warmup with hot-keys-from-logs
cache loss is unacceptable               -> Redis RDB (every 5 min) or AOF (every write)
warming may overload source             -> WarmupController with p95 throttle
new Redis replica / staged rollout      -> shadow traffic mirroring; cut over when ready
restart is rare, traffic high           -> RDB persistence > warmup script
restart is frequent (CI / preview env)  -> warmup script; RDB overkill
warmup observability                    -> Prometheus progress gauge + duration histogram
warmup must finish before serving       -> postStart hook in k8s; readinessProbe waits
only top 1% of keys are hot             -> warm only those; long tail can MISS without harm
```

### [[Sections/caching/patterns/cache-coherence-multi-tier|Multi-tier cache — L1 (in-process) + L2 (Redis) coherence]]

```text
single-process service              -> L1 only; Redis is overhead
multi-process, network is fast      -> L2 only; L1 doesn't pay
multi-process + Redis network slow  -> L1 + L2; the typical answer
strict consistency required         -> NOT multi-tier; serve from source with stampede protection
write rate ~= read rate             -> single tier; multi-tier wastes CPU on invalidation
staleness budget < 100ms            -> short L1 TTL + pub/sub fanout (junior tier)
staleness budget < 1s                -> normal L1 TTL + pub/sub
staleness budget = minutes          -> simple cache-aside; no fanout needed
L2 outage must NOT bring service down -> wrap _l2_get in try/except; fall to source
need request-scoped (per-request)   -> additional layer above L1 (request_scoped_cache entry)
GraphQL or rich joins              -> DataLoader (request_scoped_cache entry) + L1/L2
```

## Crypto & Secrets

### [[Sections/crypto-secrets/hashing/hashlib-modern|hashlib & hmac — content hashing and message authentication]]

```text
content addressing (git, S3 etag)    -> sha256 — universal, well-supported
speed-critical, big files              -> blake3 (3rd-party) > blake2b > sha512
webhook / API signatures               -> hmac.new(key, msg, "sha256")
constant-time compare                  -> hmac.compare_digest — NEVER ==
password hashing                        -> argon2 (see password-hashing entry); NEVER hashlib
key derivation from passphrase         -> hashlib.scrypt (memory-hard); or argon2 KDF
key derivation from random key          -> HKDF from cryptography.hazmat.primitives.kdf
regulated env (FIPS 140-2)             -> sha2 family only; blake2/3 not FIPS-approved
non-security cache key                  -> md5/sha1 OK if attacker can't influence input
streaming a file                        -> hashlib.file_digest (3.11+) or chunked .update
compare two file hashes                 -> hexdigest() == hexdigest() OK (no key involved)
compare a tag against a remote claim   -> compare_digest — every time
```

### [[Sections/crypto-secrets/hashing/password-hashing|argon2 / bcrypt — store and verify passwords correctly]]

```text
new code, password storage           -> argon2 (argon2-cffi); USE argon2id variant
legacy / Django default              -> bcrypt (still acceptable; Django uses it)
shared lib must support both          -> passlib CryptContext schemes=['argon2','bcrypt']
server-side pepper                    -> HMAC-SHA256(pepper, password) before argon2
tune parameters                       -> aim for 100-500ms per hash on prod hardware
parameters need upgrade               -> ph.check_needs_rehash on every login -> rehash
prevent account enumeration          -> verify against DUMMY_HASH on missing account
prevent online brute force           -> rate-limit per IP and per account
compare hashes / passwords           -> NEVER ==; argon2 + bcrypt verify use compare_digest internally
migrate from another scheme         -> dual-verify path; rehash to current scheme on success
remember me / persistent login       -> separate token; do NOT re-hash the password
```

### [[Sections/crypto-secrets/hashing/secrets-module|secrets — cryptographically-secure tokens and constants]]

```text
need a non-guessable string          -> secrets.token_urlsafe(32)
binary contexts                       -> secrets.token_bytes(N)
pre-share to a user via URL          -> token_urlsafe + DB-stored hash + TTL
1M tokens at scale                    -> stateless HMAC-signed (itsdangerous)
need claims (issuer, audience, scopes) -> JWT (see jwt-python entry)
need to revoke at any time            -> stateful (DB row); OR revocation list for stateless
compare two tokens                    -> hmac.compare_digest, NEVER ==
need <128 bits of entropy             -> NO; use 128+ always for tokens
single-use semantics                   -> store + mark consumed; or token-includes-nonce
key rotation                          -> kid in payload OR multi-serializer verify
want to use random module             -> NO; only secrets / os.urandom for security
```

### [[Sections/crypto-secrets/crypto/fernet-symmetric|Fernet — high-level symmetric encryption with rotation]]

```text
"encrypt this DB column"            -> Fernet (or AES-GCM if you need AAD)
need authentication of plaintext   -> Fernet always authenticates (HMAC built-in)
need TTL on the ciphertext          -> Fernet ttl= on decrypt
key rotation                        -> MultiFernet (sequential try) OR kid prefix (constant time)
audit: which key encrypted this    -> kid prefix; MultiFernet doesn't tell you
secrets manager integration         -> load Fernet keys at startup; cache; rotate at config reload
need associated data                -> NOT Fernet — use AES-GCM (next entry)
streaming large file               -> NOT Fernet — chunked AES-GCM-SIV
need raw AES with custom mode       -> hazmat layer; you almost never do
shipping to a JS client            -> Fernet libs exist in JS; or use AES-GCM-SIV
regulated env, FIPS                -> verify cryptography backend; AES-CBC+HMAC is FIPS-OK
```

### [[Sections/crypto-secrets/crypto/aes-gcm-aead|AES-GCM — authenticated encryption with associated data]]

```text
simple "encrypt this DB column"      -> Fernet (previous entry)
need associated data binding         -> AES-GCM (or AES-GCM-SIV — preferred)
nonce uniqueness can't be guaranteed -> AES-GCM-SIV (nonce-misuse-resistant)
non-AES-NI hardware (some ARM)       -> ChaCha20-Poly1305
one master secret, many uses         -> HKDF derive context-specific keys
high-volume, single-writer            -> counter-based nonce (12 byte)
high-volume, many writers            -> AES-GCM-SIV with random nonces (collision OK)
files / streams                       -> chunked AEAD with per-chunk nonces + final-marker AAD
need KMS / HSM integration            -> envelope encryption (data key per message; KMS for KEK)
regulated environment                -> AES-GCM is FIPS-approved; AES-GCM-SIV is standardized but check
client-side AND server-side          -> ChaCha20-Poly1305 (Tink, libsodium have it everywhere)
```

### [[Sections/crypto-secrets/crypto/rsa-ed25519|Ed25519 / RSA — public-key signing and verification]]

```text
sign for a peer with a long-term key  -> Ed25519 (or RSA for legacy)
verify with public key only            -> Ed25519PublicKey.from_public_bytes
distribute public keys                 -> JWKS endpoint at /.well-known/jwks.json
private key must never leave HSM       -> KMS / HSM signing API
short-lived per-message signatures     -> sigstore (ephemeral keys + transparency log)
JWT signing for OIDC/auth servers      -> RSA RS256 OR Ed25519 EdDSA
X.509 cert (TLS, S/MIME)               -> RSA or ECDSA — Ed25519 in TLS 1.3+ only
key exchange (Diffie-Hellman)          -> X25519 (NOT Ed25519 — different primitive)
need to authenticate WITHOUT signing   -> HMAC (shared secret; previous entry)
verifier discovers new keys auto       -> JWKS + cache TTL bounded
compromise revocation                  -> rotate kid; bound by JWKS cache TTL
```

### [[Sections/crypto-secrets/tokens/jwt-python|PyJWT — issue and verify JSON Web Tokens]]

```text
stateless inter-service auth          -> JWT EdDSA + JWKS
single-service auth                    -> opaque session token (next entry); simpler
need fast revocation                  -> NOT JWT alone; pair with deny list (small TTL)
need scopes / claims interop          -> JWT (or OAuth 2.0 access tokens)
short-lived access + revocable        -> JWT access (15 min) + opaque refresh (30 days)
alg=HS256                              -> only single-service; verifier == signer
alg=RS256/EdDSA                       -> multi-service; verifier holds public key only
alg=none                              -> NEVER; remove the lib if it allows it (PyJWT requires algorithms=)
refresh token replay                  -> family-based revocation: any reuse revokes whole family
key rotation                          -> kid header + JWKS multi-key endpoint
need to revoke immediately            -> opaque sessions (next entry); JWT can only "deny by jti"
```

### [[Sections/crypto-secrets/tokens/oauth2-flow|OAuth 2.0 — Authorization Code flow with PKCE]]

```text
"log in with X" for an end user      -> Authorization Code + PKCE
public client (mobile, SPA, CLI)      -> PKCE mandatory (no client_secret)
confidential server-to-server         -> Client Credentials grant (no user)
need to act on user's behalf later   -> request scope=offline_access; store refresh_token
provider supports OIDC               -> verify id_token JWT via JWKS
provider is OAuth2-only (GitHub)     -> fetch userinfo with the access_token instead
refresh-token rotation                -> rotate on each refresh; replay -> revoke family
redirect URI                          -> server-side allow-list; NEVER accept from client
state parameter                       -> always set, always verify on callback
token storage                         -> Fernet-encrypted DB; never plaintext
401 from provider API                 -> refresh once + retry; persistent 401 -> reauth
token leak                            -> revoke at provider + locally; force re-login
```

### [[Sections/crypto-secrets/tokens/session-tokens|Session tokens — opaque vs JWT, cookie attributes, revocation]]

```text
single-service auth                  -> opaque session token (Redis-backed)
multi-service auth                   -> JWT or OAuth (jwt-python entry)
need fast revocation                 -> opaque (delete Redis key)
need scopes / claims interop         -> JWT (with scopes claim)
short-access + long-refresh          -> JWT access + opaque refresh (jwt-python)
"log in with X" provider             -> OAuth Authorization Code (oauth2-flow)
cookie attributes for browser auth   -> __Host-prefix, HttpOnly, Secure, SameSite=Lax
API tokens for programmatic clients  -> bearer token in Authorization header (no cookie)
sensitive operation                  -> step-up auth: re-verify password / 2FA recently
password changed                     -> revoke all sessions; bump user.password_version
suspicious activity                  -> revoke specific session; force re-login
cross-site cookie (3rd-party iframe) -> SameSite=None + Secure; audit carefully
want CSRF on top of SameSite         -> double-submit token (header+cookie compared)
regulatory / OWASP ASVS              -> opaque + bound to UA/device/IP-prefix
```

### [[Sections/crypto-secrets/secrets-management/env-var-secrets|Environment-variable secrets — typed loading and validation]]

```text
12-factor app                          -> env vars; never config files in source
dev workflow                            -> .env file + python-dotenv; .env.example committed
typed config + fail-fast               -> pydantic-settings BaseSettings
secret in logs / errors                 -> SecretStr (Pydantic) — masks repr automatically
per-environment layering                -> .env -> .env.local -> .env.{ENV}
never commit secrets                    -> .gitignore .env*; pre-commit gitleaks/detect-secrets
k8s deployment                          -> Secret -> env (envFrom: secretRef)
AWS ECS                                 -> task definition secrets pulled from Secrets Manager
AWS Lambda                              -> Lambda env vars (KMS-encrypted at rest)
Vault                                   -> Vault Agent injector writes to file or env
secret rotation while running           -> see secrets-vault entry (file-watch / poll)
verify secret WORKS at startup          -> self_test() that uses each one before serving
.env files in production                -> NO; orchestrator injects env directly
```

### [[Sections/crypto-secrets/secrets-management/secrets-vault|Secrets manager — Vault / AWS / GCP with auto-rotation]]

```text
real secrets need to live somewhere   -> Vault / AWS Secrets Manager / GCP SM
delivered to the app as env var       -> orchestrator-injected; never .env in prod
need rotation                          -> manager rotates; app refreshes (poll OR file watch)
want short-lived credentials          -> Vault dynamic secrets (database/creds/...)
secret-zero problem                    -> orchestrator identity (k8s SA / IAM / WI)
hot reload without restart             -> Vault Agent file watch + watchdog + creator= callable
stateless serverless (Lambda)          -> KMS-encrypted env vars OR Secrets Manager fetch (cached)
GitOps / Argo CD                       -> SealedSecrets / SOPS / external-secrets-operator
shared by many services                -> Vault path namespacing (auth/{team}/myapp)
audit "who fetched this secret"        -> all three managers log fetches; Vault is most detailed
key rotation in the app                -> see key-rotation entry; this is for the secret SOURCE
```

### [[Sections/crypto-secrets/secrets-management/key-rotation|Key rotation — dual-acceptance, kid prefix, batch re-encryption]]

```text
normal scheduled rotation             -> 4-phase runbook over days/weeks
key compromise / emergency             -> same runbook, hours not weeks; audit what leaked
key shipped to git                     -> rotate IMMEDIATELY; assume leaked; rewrite git history
Fernet / AES-GCM key                   -> dual-accept + kid prefix + batch re-encrypt
JWT signing key                        -> dual-accept; old jwts still verify until exp
password pepper                        -> version prefix on hash; rotate on next login
secrets-manager value rotation         -> manager handles; app refreshes (secrets-vault entry)
key has TTL in cipher (Fernet ttl=)   -> rotation easier; old data ages out
need to know "is rotation done?"      -> Prometheus gauge of rows-still-on-old-key
too-aggressive rotation harming DB     -> bound batch size + nightly window
automation                              -> scheduled batch job; alert on stalls
```

## Containerization

### [[Sections/containerization/dockerfile/dockerfile-python-base|Dockerfile — choose the right Python base image]]

```text
default for Python service                -> python:3.12-slim
tiny image needed                          -> distroless runtime in multi-stage
wheel-heavy deps (numpy, torch, lxml)      -> NEVER alpine; slim is right
pure-Python service, must be small        -> alpine OK if you've verified all wheels work
reproducible builds                        -> pin base by @sha256:HASH (not just tag)
supply-chain scanning                       -> trivy / grype / docker scout in CI
pip install caches across builds           -> BuildKit --mount=type=cache,target=/root/.cache/pip
secrets at build time (private wheels)     -> --mount=type=secret (NEVER COPY a credential)
build deps stay out of runtime             -> multi-stage (next entry)
ARM64 + AMD64 deploys                      -> docker buildx build --platform linux/amd64,linux/arm64
layer count optimization                    -> combine RUN commands; fewer layers, faster pull
debug a stuck container                     -> kubectl debug ... --image=python:3.12 --share-processes
```

### [[Sections/containerization/dockerfile/multi-stage-builds|Multi-stage builds — separate build from runtime]]

```text
any production Python service       -> multi-stage; build vs runtime split
smallest final image                 -> distroless runtime; ~50MB
need a shell for debugging           -> dev target alongside; never prod
compiles native deps                  -> builder needs build-essential + dev libs
monorepo with shared deps             -> single requirements.txt copied in builder
per-target image variants             -> docker build --target=NAME
private wheel index                  -> --mount=type=secret,id=pip-credentials
reproducible builds                   -> pin BOTH base SHAs (build + runtime)
SBOM required                          -> cyclonedx-py in builder OR buildx sbom: true
image signing                          -> see image-signing-sbom entry
dev tools in runtime                   -> NO; use multi-stage with dev target instead
```

### [[Sections/containerization/dockerfile/python-deps-cached|Cached pip / uv installs — fast iterative builds]]

```text
simple project, requirements.txt        -> COPY requirements.txt + pip install (intro tier)
want fast repeat builds                  -> BuildKit cache mount on /root/.cache/pip
want fast cold builds                    -> uv (10-100× pip)
need deterministic / reproducible        -> uv.lock + uv sync --frozen
monorepo with workspace deps             -> uv workspace mode in pyproject.toml
private wheel index                      -> BuildKit --mount=type=secret for credentials
prod vs dev deps                         -> dependency-groups.dev + uv sync --no-dev
need lockfile in CI                      -> uv lock --check; fail PR if stale
pip-tools workflow                       -> pip-compile -> requirements.txt; same caching pattern
poetry / hatch / pdm                     -> all support BuildKit cache; check their docker docs
"should I use uv?"                       -> for new projects, yes; for stable ones, BuildKit cache + pip is fine
```

### [[Sections/containerization/process-model/gunicorn-uvicorn-config|gunicorn + uvicorn — production process configuration]]

```text
dev / a single core / async-heavy   -> uvicorn directly (no gunicorn)
multi-core, sync handlers          -> gunicorn -k sync, workers=(2*N)+1
multi-core, async (FastAPI/Starlette) -> gunicorn -k UvicornWorker, workers=N
need full uvicorn perf, modern lib -> uvicorn 0.30+ with --workers (built-in mgmt)
memory pressure                     -> --preload + reduce worker count
gradual memory leak                 -> --max-requests N --max-requests-jitter
need fastest event loop             -> pip install uvloop httptools (auto-detected)
long-running requests (uploads etc) -> raise --timeout to >max request time
stuck workers (sync code in async)  -> --timeout catches them; fix the code
k8s graceful drain                  -> --graceful-timeout matches terminationGracePeriodSeconds
logging                              -> --access-logfile - --error-logfile - (stdout)
prefer Hypercorn (HTTP/2)           -> hypercorn -k UvloopWorker; same shape
Trio-based async                     -> hypercorn TrioWorker; uvicorn doesn't speak Trio
```

### [[Sections/containerization/process-model/signal-handling-shutdown|Graceful shutdown — SIGTERM, drain, lifespan hooks]]

```text
default for production                  -> preStop sleep + lifespan + tuned timeouts
long-running batch handlers              -> raise --graceful-timeout AND grace period
websockets / streaming                   -> handle disconnects in your handler;
                                             send close frames before exit
stuck shutdown debugging                -> SIGUSR1 -> faulthandler.dump_traceback
need sub-second drain                    -> shorten readiness probe period (1s);
                                             preStop sleep 1; tight timeouts
uses background tasks                    -> name them "background:..." and cancel in lifespan
exporters (OTel, sentry, datadog)        -> force_flush in lifespan; never lose the last batch
process is PID 1 in container            -> handle SIGTERM at the entrypoint OR use tini
shell-form CMD doesn't get SIGTERM       -> use exec form; OR ENTRYPOINT ["tini", "--"]
SIGKILL during normal shutdown           -> grace period too short; raise it
pre-warm on startup                      -> startup phase of lifespan; readiness gates traffic
```

### [[Sections/containerization/process-model/non-root-user|Non-root user — drop privileges, integrate with k8s securityContext]]

```text
minimum: don't run as root          -> useradd + USER in Dockerfile
numeric UID for k8s                  -> useradd --system --uid 1001
k8s policy enforcement              -> securityContext.runAsNonRoot: true
defense-in-depth                     -> readOnlyRootFilesystem: true + tmpfs /tmp
PSS "restricted" compliance         -> drop ALL caps + seccomp + read-only fs + nonroot
distroless                           -> use the :nonroot tag (UID 65532)
need to bind port 80                 -> NO; use a Service/Ingress; or setcap (rare)
writable /tmp                        -> emptyDir tmpfs volume
writable app data                    -> PVC with explicit fsGroup
debugging without shell             -> kubectl debug --share-processes ephemeral container
AppArmor / SELinux profiles         -> annotations + cluster policy
custom seccomp profile               -> mount config map; reference in seccompProfile.localhostProfile
```

### [[Sections/containerization/container-ops/healthcheck-probes|Health probes — readiness, liveness, startup]]

```text
single endpoint /healthz                -> intro tier; toys only
real production                          -> /live (cheap) + /ready (deps) + /startup (boot)
liveness probe                            -> CHEAP, in-process check; period 30s, threshold 3
readiness probe                           -> dep checks with short timeouts; period 5s, threshold 1
slow-boot service (>30s)                 -> startupProbe; period 5s, threshold 60
dep blip kills pod                       -> liveness probably checking deps; FIX
thundering probe load on DB              -> circuit breaker pattern; ready consults state
draining state                            -> readiness 503 during shutdown; liveness still 200
tcpSocket probe instead of HTTP          -> coarser; works for non-HTTP services (Redis, etc.)
exec probe (kubectl exec)                -> distroless has no shell; use httpGet
want a degraded "still serving" mode    -> readiness can return 200 even if Redis down,
                                             if cache miss is acceptable
compliance probe (auth required)         -> use TCP probe + dedicated /healthz on different port
```

### [[Sections/containerization/container-ops/secrets-injection|Secrets injection — k8s Secret, env vs file mount, BuildKit]]

```text
docker run for one-off                  -> -e flags or --env-file
k8s, simple                              -> Secret + envFrom: secretRef
k8s, rotation-friendly                   -> Secret as volume + readonly mount + file-watch
secrets manager source of truth          -> External Secrets Operator (ESO)
Vault dynamic secrets (DB creds)         -> Vault Agent injector
build-time only secrets                  -> BuildKit --mount=type=secret
private wheel index                      -> BuildKit secret in pip --index-url
secret zero (auth to manager)            -> ServiceAccount JWT (k8s) / IRSA (AWS)
per-tenant secrets                        -> separate Secret per tenant; namespace by tenant
short-lived credentials                   -> Vault dynamic secrets (lease + auto-renew)
GitOps with secrets                       -> SealedSecrets / SOPS-encrypted Secret manifests
compliance / audit log                    -> ESO + AWS CloudTrail OR Vault audit log
```

### [[Sections/containerization/container-ops/container-logging|Container logging — stdout JSON, no log files, trace correlation]]

```text
minimum                                  -> print() / logging to stdout
structured fields                         -> structlog with JSONRenderer
trace<->log pivot                         -> add_trace_context structlog processor
PII protection                            -> redact processor (cross-ref crypto-secrets)
multi-line stack traces                   -> dict_tracebacks; ONE event per exception
log shipper                               -> Fluent Bit / Vector DaemonSet on each node
cost guardrail                            -> sample non-errors (observability entry)
need to keep last hour on node            -> kubelet containerLogMaxSize / Files
logs vanish on restart                    -> ship to backend BEFORE pod death; not "logs in pod"
want to write to a file                   -> NO; stdout. Log driver writes the file.
sidecar logging                           -> Fluent Bit/Vector sidecar; rare; DaemonSet preferred
audit logs (compliance)                   -> separate sink; never sample audit logs
timestamp from stdout vs structlog        -> use structlog's TimeStamper; runtime adds another;
                                             pick which is "the" timestamp in your shipper
```

### [[Sections/containerization/image-hygiene/image-size-optimization|Image-size optimization — measure, trim, distroless]]

```text
default for a Python service            -> python:3.12-slim + multi-stage
smallest practical                       -> distroless :nonroot runtime
need shell for debugging                 -> dev target alongside; never in prod runtime
heavy ML deps                            -> separate "ml-base" image; pull layer cache
torch → really need full CUDA?           -> often torch-cpu OR onnxruntime is enough
pandas → can polars replace it?         -> often yes; ~10× smaller AND faster
image > 1GB pulled often                 -> autoscaling cold start is your problem; trim
image growth blew our budget             -> dive to find the layer; check requirements.txt
                                             for unused deps via pip-audit / deptry
stripping symbols                        -> strip --strip-unneeded; saves 20-100MB on heavy
tests in wheels                          -> rm tests/ in build stage; check setuptools config
bytecode compilation                     -> PIP_NO_COMPILE=1 saves ~30MB but slows startup
                                             (each module compiles on first import)
.pyc inside containers                   -> PYTHONDONTWRITEBYTECODE=1; covered earlier
image scanning per-build                 -> docker scout cves OR trivy OR grype in CI
alternative builders                     -> Buildpacks / nix / ko (Go); Buildpacks are nice
                                             for Python but less control vs Dockerfile
```

### [[Sections/containerization/image-hygiene/image-signing-sbom|Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations]]

```text
sign every release                   -> Cosign keyless via OIDC
private key signing (legacy)          -> Cosign with --key; rotate via cosign keys
air-gapped / private Sigstore         -> deploy fulcio + rekor + tuf in cluster
SBOM source of truth                   -> buildx sbom: true (SPDX) OR syft (SPDX/CycloneDX)
provenance level                       -> buildx provenance: mode=max for SLSA L3
CI fails on CVE                        -> trivy --exit-code 1 (severity CRITICAL,HIGH)
reject unsigned images at deploy      -> Cosign Policy Controller (admission webhook)
continuous CVE rescan                  -> daily job; grype against the stored SBOM
image promotion across envs           -> sign once at build; verify on each env's deploy
compliance: SLSA L3                    -> hosted GitHub Actions runners + buildx + cosign
compliance: SLSA L4                    -> hermetic builds (e.g., Bazel) + reproducible
secrets / certs in image (still!)     -> reject before signing; gitleaks / trufflehog scan
deployment policies                    -> Kyverno or Cosign Policy Controller; OPA Gatekeeper
non-OCI registry                       -> Cosign supports many; check OCI compliance
```

### [[Sections/containerization/image-hygiene/ci-cd-multiarch|Multi-arch CI/CD — buildx, GitHub Actions, image promotion]]

```text
single-arch is enough                 -> docker/build-push-action; one platform
need amd64 + arm64                    -> buildx --platform linux/amd64,linux/arm64
QEMU vs native ARM runner             -> native is 3-5× faster; QEMU works anywhere
tag strategy                          -> docker/metadata-action; semver + SHA + branch
layer caching                         -> type=gha (GitHub Actions cache); per-arch scope
image promotion across envs           -> crane copy SOURCE@digest TARGET; never rebuild
reference image in deploy             -> by digest in production manifests
reject unsigned at deploy             -> Cosign Policy Controller (image-signing-sbom entry)
compliance evidence                   -> SLSA provenance attestation; cosign attest
retention                             -> per-registry lifecycle (GHCR / ECR / Artifact Registry)
automated promotion                   -> manual workflow_dispatch; OR ArgoCD ApplicationSet
build cache cost                      -> type=gha is free up to 10GB / repo
one workflow vs reusable              -> reusable workflow (workflow_call) for dev/staging/prod
private base image                    -> docker/login-action twice; one per registry
ECR / GAR / ACR                       -> respective login-action variants; same shape
```

## Messaging & Queues

### [[Sections/messaging-queues/celery/celery-tasks|Celery tasks — define, enqueue, retrieve results]]

```text
web handler doing slow I/O           -> Celery; return 202 + task id; client polls
strict ordering across messages      -> Kafka / Redis Streams (next entry); not Celery
sub-second latency requirement       -> NOT Celery; in-process or Redis pub/sub
one-off scheduled tasks              -> Celery + beat (next entry)
high-throughput workflow              -> Celery group / chord / canvas patterns
serializer choice                     -> JSON; NEVER pickle (RCE on deserialization)
Pydantic in/out                       -> validate at task boundary; pass model_dump()
FastAPI integration                   -> apply_async via asyncio.to_thread
long-running tasks (>5min)            -> raise time_limit; OR break into smaller tasks
idempotency                           -> caller-supplied key + Redis SETNX
monitoring                            -> Flower (web UI) or Prometheus exporter
ack semantics                         -> task_acks_late=True for crash-safety
prefetch tuning                       -> 1 for slow tasks; 4-8 for fast tasks
trace propagation                     -> CeleryInstrumentor (cross-references observability)
secret handling in task               -> never log payloads with secrets; redact (cross-ref crypto-secrets)
```

### [[Sections/messaging-queues/celery/celery-retries|Celery retries — backoff, dead-letter, idempotency]]

```text
transient (network blip, rate limit) -> autoretry_for + backoff + jitter
permanent (bad input, validation)    -> raise; do NOT retry
unknown                              -> log + DLQ; investigate
rate-limit response with Retry-After -> manual self.retry(countdown=int(retry_after))
max retries exhausted                -> DLQ (separate queue + worker)
idempotency on retry                 -> Redis SETNX with task-supplied key
third-party API outage                -> circuit breaker upstream of Celery; not just retry
strict message ordering required     -> NOT Celery; use Kafka with single partition
long retry window (hours)            -> raise retry_backoff_max; mind broker memory
want delayed retry (eta)             -> self.retry(eta=datetime); not countdown
```

### [[Sections/messaging-queues/celery/celery-routing-beat|Celery routing & beat — queues, priorities, scheduled tasks]]

```text
single queue, single worker        -> default queue + default scheduler
I/O-bound vs CPU-bound mix          -> separate queues; per-queue concurrency
tasks must run urgently             -> priority queue consumed first
slow + fast tasks together         -> separate queues; slow can't block fast
recurring tasks                     -> beat_schedule; crontab for cron-style
one beat instance is single-point   -> redbeat for HA
per-tenant schedules                -> redbeat dynamic entries; manage at runtime
long-tail of rare tasks            -> single 'default' queue catches all
different machines per queue        -> separate worker fleets; -Q name per fleet
prefetch tuning                     -> long tasks: 1; short tasks: 4-8
memory leaks in workers            -> --max-tasks-per-child=N
need cluster-wide visibility       -> Flower OR celery-prometheus-exporter
timezone                            -> always set; UTC is least surprising
schedule timezone vs server clock   -> set timezone in conf; cron uses that
```

### [[Sections/messaging-queues/streams/kafka-py|confluent-kafka-python — Kafka producer / consumer with delivery guarantees]]

```text
high throughput, ordered, replayable     -> Kafka
simpler queueing, single-Redis dep       -> Redis Streams (next entry)
AMQP semantics (RabbitMQ)                -> aio-pika (next entry)
point-to-point background tasks          -> Celery (previous entries)
exactly-once delivery                    -> Kafka transactions OR at-least-once + idempotency
                                             (idempotency is usually simpler)
ordering by entity (order_id)            -> partition by entity key; same key -> same partition
sync vs async client                     -> confluent-kafka (sync, fast) OR aiokafka (async)
schema enforcement                        -> Confluent Schema Registry + Avro/JSON Schema
crash-safe consumer                       -> manual commit AFTER processing
rebalance handling                        -> on_revoke handler that commits pending offsets
poison message                            -> DLT (dead-letter topic) + ops review
trace propagation                         -> headers via inject/extract; OTel auto-instr
replay history                            -> seek to earliest; new consumer group; replay
want compaction (latest-only-per-key)    -> log compaction; topic config cleanup.policy=compact
```

### [[Sections/messaging-queues/streams/redis-streams|Redis Streams — XADD / XREADGROUP, lighter than Kafka]]

```text
<100k msgs/s, single Redis OK         -> Redis Streams
>100k msgs/s, multi-broker, replay days -> Kafka (previous entry)
simple AMQP semantics                  -> aio-pika (next entry)
already have Redis                      -> Streams; one less dependency
need consumer groups                    -> XREADGROUP (NOT XREAD)
need acknowledgments                    -> XACK after processing
crash recovery                          -> XAUTOCLAIM with idle threshold
bounded memory                          -> MAXLEN ~N; XADD with maxlen=
compare with Kafka                      -> Streams = simpler ops, less throughput,
                                                less retention, single-Redis SPOF
need exactly-once                        -> Streams alone gives at-least-once;
                                             add idempotency downstream
replay history                          -> create new consumer group, id="0"
poison message                           -> DLT stream + delivery_count check
trace propagation                       -> pack trace fields into stream entry
schema enforcement                       -> validate at consumer; no native schema reg
compaction (latest-only-per-key)        -> NOT supported; use Kafka log compaction
Redis Cluster                            -> hash tags ({key}) to keep entries on one shard
```

### [[Sections/messaging-queues/streams/aio-pika-amqp|aio-pika — async RabbitMQ / AMQP with DLX and acks]]

```text
topic-routing fan-out                   -> AMQP topic exchange (RabbitMQ + aio-pika)
strict ordering by partition           -> Kafka (previous entry)
simpler, single-Redis dep               -> Redis Streams (previous entry)
point-to-point background tasks        -> Celery (previous entries)
need DLX                                 -> queue declare with x-dead-letter-exchange
publisher must know broker received     -> publisher_confirms=True on channel
crash-safe consume                       -> manual ack AFTER processing; auto on context exit
prefetch tuning                          -> set_qos(prefetch_count=N); 1 for slow tasks, 10+ for fast
redelivery loop                          -> count via x-death header; reject to DLX after N
message TTL                              -> x-message-ttl on queue OR per-message expiration
priority queues                          -> x-max-priority on queue; per-message priority
broker availability                       -> connect_robust auto-reconnects
trace propagation                        -> inject/extract via message headers (built-in dict)
schema enforcement                        -> validate at consumer (Pydantic); no native AMQP schemas
sync code instead of async               -> pika library (sync); same protocol
transactions across operations          -> AMQP TX mode (rare; use idempotency instead)
```

### [[Sections/messaging-queues/patterns/outbox-pattern|Transactional outbox — publish events atomically with the DB write]]

```text
strict atomicity: DB write + event       -> outbox table; INSERT in same tx
DB committed but event lost is OK         -> publish-then-write (rare)
broker is the source of truth             -> NOT outbox; use DB CDC (Debezium)
Debezium / Maxwell available              -> CDC reads WAL directly; no app code change
low latency requirement                    -> LISTEN/NOTIFY + polling backstop
high event volume (>10k/s)                 -> CDC; outbox table I/O becomes bottleneck
multiple consumers per event              -> consumer groups on the broker; outbox is single-source
idempotent consumers                       -> required; outbox is at-least-once (idempotency-keys entry)
gc / retention                             -> DELETE WHERE published_at < now() - INTERVAL '7 days'
need ordering across events               -> ORDER BY id; one publisher process; OR Kafka partition by entity
monitoring                                 -> alert on outbox lag (oldest unpublished_at)
```

### [[Sections/messaging-queues/patterns/idempotency-keys|Idempotency keys — make at-least-once safe to redeliver]]

```text
any at-least-once consumer        -> idempotency_key + Redis SETNX
caller can supply key              -> use it (most APIs / events have an id)
no natural key                     -> hash (entity_id, op_type, timestamp)
exactly-once at the SOURCE         -> use the source's idempotency (Stripe, etc.)
                                       rather than just the consumer's
ttl                                 -> >= broker redelivery window
Redis down                          -> degrade open; document the risk
payment / billing                   -> use BOTH consumer dedup AND provider idempotency
```

### [[Sections/messaging-queues/patterns/dead-letter-queues|Dead-letter queues — quarantine poison messages]]

```text
any at-least-once consumer            -> DLQ; never loop forever on poison
per-broker setup                       -> Kafka DLT, AMQP DLX, Streams .dlt stream, Celery DLQ task
max delivery threshold                 -> 3-5 typical; tune per task cost
alerting                                -> rate(dlq_inflow) AND dlq_depth gauge
replay tooling                          -> CLI + dry-run mode; ops uses post-fix
transient-error spike                   -> pause consumer; DON'T fill DLQ
permanent vs transient                  -> classify in the consumer (celery-retries entry)
business-level "soft" failure           -> may not warrant DLQ; just log
compliance / audit                      -> persist DLQ contents to long-term store
GDPR concerns                           -> redact payload before DLQ; key only
```

## Data Apps

### [[Sections/data-apps/streamlit/streamlit-basics|Streamlit basics — script-as-app, widgets, layout]]

```text
internal dashboard, <2 weeks       -> Streamlit
ML demo, share via URL              -> Gradio
complex callback chains, prod UX    -> Dash (next entries)
per-user persistent state           -> Streamlit OK; mind sticky sessions in deployment
multi-tenant SaaS                   -> NOT Streamlit; build a real frontend
need cell-level reactive logic     -> st.fragment for partial reruns
share state across browser tabs    -> NOT in Streamlit; URL params + backend
100k+ row tables                    -> AgGrid component; native st.dataframe is fine to ~10k
real-time streaming                 -> st.write_stream + generator (LLM-style)
deep links                          -> st.query_params (read + write)
theming                             -> .streamlit/config.toml [theme]
logged-in users                      -> reverse proxy auth (multipage-auth entry)
```

### [[Sections/data-apps/streamlit/streamlit-state|Streamlit state — session_state, callbacks, forms]]

```text
widget value persists across reruns -> key= argument auto-binds to session_state
reset everything                     -> bump a state_version; use it in widget keys
batch inputs                         -> st.form + form_submit_button
on-change callback                   -> on_change=, on_click= (fires BEFORE rerun)
typed state                          -> dataclass in session_state["_state"]
double-submit                        -> in_flight flag + disabled= on the button
share state across tabs              -> NOT session_state; DB / Redis keyed by user
useState-style                        -> use_state helper returning (value, setter)
programmatic refresh                  -> st.rerun() forces re-render now
query-param-driven state              -> st.query_params (deep linking)
```

### [[Sections/data-apps/streamlit/streamlit-data-flow|Streamlit caching — cache_data, cache_resource, downloads]]

```text
serializable return (DF, list, np)  -> @st.cache_data
live object (DB pool, ML model)     -> @st.cache_resource
per-input dedup                      -> @st.cache_data; key by args
global singleton                      -> @st.cache_resource (shared across sessions)
want TTL                              -> ttl=N seconds
bounded memory                        -> max_entries=N
force re-fetch                        -> .clear() OR caller passes a "version" arg
unhashable args                       -> hash_funcs={MyType: lambda x: x.id}
async function                        -> wrap in run_until_complete inside @st.cache_data
cross-replica dedup                   -> Redis cache layer above @st.cache_data
model loading                         -> @st.cache_resource (one model per process)
download a DataFrame                 -> df.to_csv(index=False) -> bytes -> st.download_button
```

### [[Sections/data-apps/dash/dash-callbacks|Dash callbacks — Input/Output/State, chains, pattern-matching]]

```text
simple input -> output                -> @callback Input/Output
read state without triggering         -> State()
chained callbacks                      -> chain Outputs to next Inputs
dynamic N filters/charts              -> pattern-matching IDs + ALL/MATCH
slow operation (>2s)                  -> background=True with long_callback_manager
snappy UI tweaks                      -> clientside_callback (browser JS)
prevent on page load                   -> prevent_initial_call=True
"which input fired?"                   -> ctx.triggered_id
"all callbacks at once" pattern        -> use one callback with multiple Outputs
share state across callbacks          -> dcc.Store (browser-side) OR url query
horizontal scaling                     -> Dash is stateless per request; scales freely
multi-page                              -> dash.register_page + use_pages=True
```

### [[Sections/data-apps/dash/dash-layouts|Dash layouts — bootstrap, theming, multi-page apps]]

```text
responsive layout                       -> dbc.Row + dbc.Col with breakpoint args
theming                                  -> dbc.themes.* + Bootswatch reference
dark mode toggle                         -> swap external_stylesheets via Output
multi-page                               -> use_pages=True + pages/ dir + register_page
active link highlighting                  -> dbc.NavLink active="exact"
query-string state                        -> page-level layout(role=...) signature
browser back/forward                       -> dcc.Location handles automatically
complex auth                               -> reverse proxy auth; per-page check via callback
custom CSS                                  -> assets/ dir; auto-loaded
embedded in Flask                           -> server=Flask(__name__); Dash(server=server)
alternative theming framework              -> dash-mantine-components (DMC)
```

### [[Sections/data-apps/gradio/gradio-interface|Gradio Interface — wrap a function as a UI]]

```text
single function → demo                  -> gr.Interface
multi-turn chatbot                       -> gr.ChatInterface (built-in streaming)
complex multi-input UI                   -> gr.Blocks (next entry)
public share with no infra                -> .launch(share=True) tunnel
permanent free hosting                   -> Hugging Face Spaces
GPU                                       -> HF Spaces hardware= or self-host
batched inference                         -> batch=True, max_batch_size=N
queue for concurrent users               -> .queue(default_concurrency_limit=N)
pre-computed examples                     -> cache_examples=True
auth                                      -> auth=(user, pass) or OAuth via HF
programmatic call                         -> gradio_client.Client; HTTP API auto-generated
embed in another site                     -> iframe with HF Spaces URL
```

### [[Sections/data-apps/gradio/gradio-blocks|Gradio Blocks — multi-tab UIs, events, state]]

```text
simple wrap a fn                       -> gr.Interface
multi-tab / complex layout              -> gr.Blocks
chatbot                                  -> gr.ChatInterface
chained events                           -> .click(...).then(...).then(...)
conditional UI                           -> gr.update(visible=...) on event
per-session state                        -> gr.State (browser-scoped)
queue / concurrency control              -> demo.queue + concurrency_limit per event
shared auth / custom routes              -> mount in FastAPI via mount_gradio_app
public free hosting                      -> Hugging Face Spaces
programmatic access                       -> api_name="..." + gradio_client.Client
custom theme                              -> gr.themes.Soft/Default with overrides
streaming LLM                             -> generator function in .click() + ChatInterface
websocket / long-poll                     -> gr.queue handles it; don't roll your own
```

### [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access]]

```text
small internal tool, 1-5 users        -> streamlit-authenticator (YAML creds)
SSO required (Google, Okta, AAD)     -> reverse-proxy OIDC (oauth2-proxy / ALB)
public-facing                          -> NOT Streamlit; build a real app
per-page access control                -> require_role() at top of each page
programmatic navigation                -> st.switch_page("pages/X.py")
query-param deep linking               -> st.query_params (read + write)
hide pages from sidebar                -> showSidebarNavigation=false; manual nav
session state across pages             -> st.session_state (per-tab); DB for cross-tab
mobile-friendly                          -> Streamlit's default layout; mobile-OK
audit log                               -> log get_current_user() at sensitive ops
logout                                   -> reverse-proxy /oauth2/sign_out endpoint
role changes mid-session                 -> re-read from headers each pageview;
                                             no caching of group membership
```

### [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions]]

```text
Streamlit                              -> sessionAffinity: ClientIP; can't load-balance freely
Dash                                    -> stateless; round-robin works
Gradio                                   -> sessionAffinity: ClientIP for queue
need WebSockets through proxy           -> proxy_set_header Upgrade/Connection
long-lived connections                   -> proxy_read_timeout 86400 (1 day)
autoscaling                              -> Streamlit hostile to scale-down; long stabilization
shared session state across replicas    -> NOT Streamlit; shared backend (Redis/DB)
public app with thousands of users      -> consider real frontend; Streamlit ~100s of concurrent
many ephemeral sessions                  -> add slow scale-down to preserve active users
GPU-bound (Gradio)                        -> request gpu in resources; small replica count
per-environment configs                   -> envFrom: configMapRef + secretRef
logging                                   -> stdout JSON; same as containerization sheet
tracing                                   -> install OTel SDK; auto-instrument FastAPI if mounted
Streamlit Cloud                           -> free tier; managed; limited (1GB RAM, no GPU)
Hugging Face Spaces                       -> free Gradio hosting; GPU paid
Hard scale ceiling                         -> Streamlit ~100 concurrent / replica;
                                              above that, switch to a real frontend
```

## Classical NLP

### [[Sections/nlp-classical/spacy/spacy-pipeline|spaCy pipeline — load model, tokenize, POS, lemma]]

```text
tokenize + POS + lemma                -> en_core_web_sm; disable parser + ner
need dependency parse                  -> include parser; ~2x slower
word similarity / vectors             -> en_core_web_md (300d) or _lg
max accuracy                           -> en_core_web_trf with GPU
millions of docs                       -> nlp.pipe + n_process
small batches                          -> nlp.pipe is enough
non-English                            -> per-language model OR xx_* multilingual
pure tokenization (no NLP)             -> blank model: spacy.blank("en")
regex-only cleaning                    -> NOT spaCy; just re module
serving in a web request                -> warm the model at startup; NEVER load per-request
```

### [[Sections/nlp-classical/spacy/spacy-ner|spaCy NER — named entities, rule-based, custom training]]

```text
built-in entity types (PERSON, ORG, ...)  -> spacy.load + doc.ents
small custom list (10-1000 phrases)        -> EntityRuler with patterns
huge phrase list (10k+)                     -> PhraseMatcher (Trie-based)
novel domain (drugs, genes, codes)         -> custom-trained NER component
high-recall + structured                    -> rule-based first, ML for fuzziness
low-resource language                       -> xx_* multilingual model (NER-only)
tag overlapping spans                        -> Span Categorizer (spancat) instead of NER
confidence per entity                        -> span.score (with parser_max_length config)
active learning / annotation                 -> Prodigy (paid; spaCy's annotation tool)
evaluate accuracy                             -> spacy evaluate model.spacy dev.spacy
```

### [[Sections/nlp-classical/spacy/spacy-matcher-patterns|spaCy Matcher — token + dependency pattern matching]]

```text
match by surface tokens               -> Matcher; fast, simple
match across word order / modifiers   -> DependencyMatcher; needs parser
match overlapping spans                -> Span Categorizer (spancat)
regex on text                          -> {"TEXT": {"REGEX": ...}} in pattern
POS / lemma                            -> {"POS": "VERB"} / {"LEMMA": "buy"}
entity type                            -> {"ENT_TYPE": "PERSON"}
optional / repeating tokens            -> "OP" : "?" / "+" / "*"
case-insensitive                       -> {"LOWER": "..."}
token shape (e.g., "AAA999")           -> {"SHAPE": "Xxxx9999"}
complex multi-pattern logic            -> multiple matcher.add() calls;
                                             callback for post-filter
spans across sentence boundary         -> not supported in Matcher; iterate doc.sents
needs subject-verb-object              -> DependencyMatcher (use parser)
```

### [[Sections/nlp-classical/sklearn-text/tfidf-vectorizer|TfidfVectorizer — text → numeric features]]

```text
small dataset, bounded vocab          -> TfidfVectorizer; defaults are fine
need bigrams                            -> ngram_range=(1, 2)
noise / typos in vocab                  -> min_df=2 or higher
common words dominating                 -> max_df=0.95; or stop_words="english"
need to limit memory                    -> max_features=50_000
data > memory / online learning         -> HashingVectorizer + SGDClassifier
character n-grams                        -> analyzer="char_wb", ngram_range=(3, 5)
multilingual                            -> char n-grams; or per-language vectorizer
need to inspect features                 -> TfidfVectorizer (HashingVectorizer is opaque)
compare with embeddings                  -> sentence-transformers (different pattern)
exact match retrieval                   -> BM25 (rank_bm25) usually beats TF-IDF cosine
classification baseline                  -> TF-IDF + LogisticRegression; surprisingly hard to beat
```

### [[Sections/nlp-classical/sklearn-text/text-classification|Text classification — Pipeline, baseline, hyperparameter tuning]]

```text
binary classification                 -> LogisticRegression (well-calibrated probs)
multi-class, large vocab              -> LinearSVC (faster, no probas without wrapper)
class imbalance                        -> class_weight="balanced" first; then resampling
need calibrated probs from SVC        -> CalibratedClassifierCV wrapper
feature interpretation                 -> coef_ on linear models
want >baseline accuracy                -> try transformers (sentence-transformers + classifier
                                             head, or fine-tune a HF model)
want fast inference                    -> linear classifier; sub-ms per text; transformer ~50ms
too few examples (<100/class)         -> few-shot LLM prompting probably wins
thousands of classes                   -> hierarchical classification or transformer
model file size matters                -> sklearn model is KB; transformer is GB
threshold tuning                       -> use predict_proba; pick threshold on validation set
class imbalance >100x                  -> resampling (imblearn) + threshold tuning
```

### [[Sections/nlp-classical/sklearn-text/topic-modeling|Topic modeling — LDA, NMF, embeddings + clustering]]

```text
small labeled dataset, KNOWN topics      -> classification, not topic modeling
need probabilistic topic mixtures         -> LDA on CountVectorizer
need cleaner / more interpretable topics  -> NMF on TfidfVectorizer
modern, semantic topics                   -> BERTopic (sentence-transformers + clustering)
millions of docs                           -> NMF (faster) OR online LDA
topics overlap / are subtle               -> embeddings beat BoW
need to know "doc X is 70% topic 1, 30% topic 2"  -> LDA (gives mixtures);
                                                       BERTopic gives single topic + probabilities
pick optimal n_topics                     -> coherence (UMass / cv); range 5-50 is typical
short text (tweets, queries)              -> BERTopic; LDA struggles with short docs
multilingual                               -> multilingual sentence-transformer + BERTopic
trends over time                          -> BERTopic.topics_over_time
```

### [[Sections/nlp-classical/patterns/text-cleaning-pipeline|Text cleaning — normalization, stop words, lemmatization]]

```text
downstream = TF-IDF / BoW             -> aggressive cleaning helps
downstream = transformer / embedding   -> minimal cleaning (NFKC + url-strip only)
sentiment task                          -> preserve negations ("not", "no", "never")
topic modeling                          -> aggressive stop-word removal
informal text (tweets)                  -> preserve emojis (or replace with placeholder)
multilingual                            -> NFKC normalization is critical
case matters (NER, code)                -> don't lowercase
numbers carry signal (financial)        -> keep numbers (don't replace with NUM)
need reproducibility                    -> dataclass config; pin spaCy version
speed matters                           -> use clean_batch with nlp.pipe
```

### [[Sections/nlp-classical/patterns/ngrams-features|N-grams — character vs word, when each helps]]

```text
English, well-formed text             -> word n-grams (1, 2) — usually enough
sentiment, negation matters            -> word n-grams (1, 2) keeping "not"
typos / informal text (tweets)         -> char n-grams (3, 5)
short text, sparse vocab               -> char n-grams cover OOV better
multilingual                            -> char n-grams; less sensitive to language
names / product codes / DNA            -> char n-grams (3, 5)
need both                               -> FeatureUnion(word + char)
feature explosion                       -> max_features=N AND min_df=K
topic modeling                          -> word n-grams; char too noisy
transformer downstream                  -> NEITHER; transformers tokenize themselves
need to interpret features              -> word n-grams only (char features are opaque)
multilingual sentiment                  -> char + word combined; or pretrained multilingual model
```

### [[Sections/nlp-classical/patterns/classical-vs-llm|Classical NLP vs LLM — when each wins]]

```text
Question                              Classical wins        LLM wins
-------------------------------------------------------------------
Latency requirement < 50ms             ✓                    ✗
Cost per request > $0.0001 OK?         ✗                    ✓
Have >5k labeled examples?             ✓                    ✗ (LLM zero-shot)
Categories change frequently?          ✗ (retrain)          ✓
Need explainable decisions?            ✓ (top features)     ✗
Need few-shot adaptation?              ✗                    ✓
Reasoning / extraction / summarization ✗                    ✓
Multilingual without retraining        ✗ (per-lang)         ✓
Adversarial inputs                     ✓ (deterministic)    ✗
> 1000 req/sec                          ✓                    ✗ (cost)
Subjective tasks (creativity, taste)   ✗                    ✓

Hybrid wins when:
  - High volume (cost matters) AND some hard cases (LLM helps)
  - Need fast common path (classical) but want LLM safety net
  - Categories are 80% well-defined, 20% ambiguous
```

## Image Processing

### [[Sections/image-processing/pillow/pil-basics|Pillow basics — open, resize, save with quality]]

```text
web upload thumbnail                 -> validate_and_thumbnail above
in-memory processing                  -> BytesIO; never touch disk
batch on disk                          -> Path-based wrapper
keep transparency                     -> output PNG/WebP, not JPEG
need orientation correct               -> ImageOps.exif_transpose(img) FIRST
user uploads (untrusted)               -> set MAX_IMAGE_PIXELS; whitelist formats
want metadata preserved                -> save with exif= and icc_profile=
need progressive JPEG                  -> progressive=True (smaller; better mobile UX)
tiny images                            -> NEAREST is fine; LANCZOS overkill
downscaling                            -> Image.LANCZOS
upscaling                              -> Image.BICUBIC; OR don't (lossy)
```

### [[Sections/image-processing/pillow/pil-transforms|Pillow transforms — rotate, crop, fit, autocontrast]]

```text
exact size with stretch OK            -> img.resize((W, H), Image.LANCZOS)
exact size, crop to fill              -> ImageOps.fit(img, (W, H), method=LANCZOS)
fit inside, allow whitespace          -> ImageOps.contain(img, (W, H))
fit inside, pad to exact size         -> ImageOps.pad(img, (W, H), color=(0,0,0))
rotate by angle                        -> img.rotate(deg, expand=True)
90/180/270 only                        -> img.transpose(Image.ROTATE_90) — much faster
tonal correction                        -> ImageOps.autocontrast(img, cutoff=2)
grayscale                              -> ImageOps.grayscale(img) OR img.convert("L")
invert                                  -> ImageOps.invert(img.convert("RGB"))
high-quality content-aware crop         -> use ML saliency or face detection (next entries)
```

### [[Sections/image-processing/pillow/pil-drawing|Pillow drawing — text, shapes, watermarks]]

```text
simple text label                     -> draw.text with truetype font
transparent overlay                    -> separate RGBA layer + alpha_composite
readable on any background            -> stroke_width + contrasting stroke_fill
font scales with image                 -> font_size = ratio * img.height
diagonal repeated watermark            -> tile + rotate(expand=False)
bounding boxes (detection)            -> rectangle(outline=, width=) + text label
anti-aliasing                          -> Pillow's text drawing is anti-aliased by default
custom font                             -> ship .ttf with the app or load from /usr/share/fonts
need vector output                      -> NOT Pillow; use cairosvg or matplotlib
complex typography                      -> NOT Pillow; use HTML→PDF or skia-python
```

### [[Sections/image-processing/numpy-cv/numpy-image-ops|NumPy image ops — array view, channels, broadcasting]]

```text
per-pixel arithmetic                  -> numpy on (H, W, C) arrays
integer overflow risk                  -> cast to int16 or float32 before math
final output                           -> clip to 0-255, cast back to uint8
PyTorch / TF input                      -> transpose to (C, H, W); normalize to [0, 1]
large image, OOM risk                  -> tile-based processing
need a fast filter (blur, edge)         -> cv2 (next entry)
need resize for ML preprocessing        -> cv2.resize INTER_AREA for downscale
batch processing                         -> stack into (N, H, W, C) array; vectorize
color space conversion                   -> cv2.cvtColor (next entry); faster than manual
want PIL operations on a numpy array    -> Image.fromarray; add overhead but cleaner
```

### [[Sections/image-processing/numpy-cv/opencv-basics|OpenCV basics — imread, cvtColor, resize, edges]]

```text
Operation                          PIL/numpy      cv2           Best for
-----------------------------------------------------------------------
Load/save                          Pillow          cv2.imread     PIL: more formats; cv2: faster on big files
Resize (downscale)                  PIL.LANCZOS     INTER_AREA     cv2 ~2-3x faster
Gaussian blur                       scipy.ndimage   GaussianBlur   cv2 ~5-10x faster
Edge detection                      np.gradient     Canny          cv2 — Canny is the standard
Contour finding                     scipy           findContours   cv2 — better, well-tested
Video frames                         not supported   VideoCapture   cv2 only
GUI display                          not built-in    imshow         cv2 (or matplotlib)
Color space conversion               manual          cvtColor       cv2 — many built-in spaces
Affine warp                          PIL.transform   warpAffine     cv2 — much faster
Real-time / video                    no              yes            cv2
Easier API for one-off transforms   PIL             cv2            PIL — more pythonic

  server / Docker                     -> opencv-python-headless (no Qt/GTK deps)
  desktop with display                -> opencv-python
  GPU                                  -> source-build cv2 with CUDA; or use specialized libs
  image-only ops                       -> PIL is often simpler
  video                                 -> cv2 always
  need contours / features              -> cv2
  need feature detectors (SIFT, ORB)    -> cv2.SIFT_create / cv2.ORB_create
```

### [[Sections/image-processing/numpy-cv/color-spaces-thresholding|Color spaces & thresholding — RGB / HSV / LAB, masks]]

```text
Classical color thresholding wins:
  - Controlled lighting (studio, indoor)
  - Clear color separation (red apple on green grass)
  - Real-time / resource-constrained (no GPU)
  - Interpretable / debuggable

ML segmentation (SAM, DeepLab, U-Net) wins:
  - Variable / unpredictable lighting
  - Subtle color differences (pinks vs salmons)
  - Need semantic understanding (what is a "person", not "skin tone")
  - Cross-class segmentation (multiple object types)

Hybrid: classical first-pass to filter candidates → ML for hard cases.
```

### [[Sections/image-processing/patterns/batch-image-pipeline|Batch image pipeline — parallel, resilient, observable]]

```text
<100 images, ad-hoc                    -> serial loop; not worth the parallelism setup
1k-100k images, batch                   -> ProcessPoolExecutor + tqdm
millions of images                       -> distribute (Celery/Dask) or stream from S3
I/O-bound (S3 GET dominates)             -> ThreadPoolExecutor 2-4x cores
CPU-bound (resize, encode)              -> ProcessPoolExecutor == cpu_count
need to resume after crash               -> skip_existing=True; idempotent step
need progress visible                    -> tqdm
want failure DLQ                         -> append failures to JSONL; replay later
want metrics                             -> compute compression ratio, p50/p99 elapsed
GPU available                            -> consider torch / OpenCV CUDA for big images
```

### [[Sections/image-processing/patterns/image-quality-formats|Image formats & quality — JPEG, WebP, AVIF, content-aware choice]]

```text
Format selection by content:
  Photo (web)                          JPEG 85  → WebP 80 → AVIF 70
  Photo (lossless / archival)          PNG (huge); or AVIF lossless
  Graphic / diagram                    PNG (lossless)
  Logo with sharp edges                PNG; SVG if vector
  Animation                             GIF (limited) → WebP-animated → AVIF-animated
  Transparent overlay                   PNG → WebP
Quality selection:
  Visual evaluator says "good"          q=85 JPEG; 80 WebP; 70 AVIF
  Need exact target                      SSIM binary search; threshold 0.95
  Mobile / bandwidth-constrained        save multiple sizes; let CDN pick
  Responsive HTML                        <picture> + srcset; AVIF→WebP→JPEG fallback
Other:
  Strip EXIF / metadata                  re-save without exif= kwarg
  Preserve color profile                 save with icc_profile= kwarg
  Optimize file size                     optimize=True; method=6 for WebP
  Progressive load                       progressive=True for JPEG
```

### [[Sections/image-processing/patterns/classical-vs-ml-vision|Classical vs ML — when each wins]]

```text
simple geometric query (size, color, edges)         -> classical (cv2 + numpy)
semantic query (objects, text, NSFW)                  -> ML (CLIP, BLIP)
need < 50ms p99                                       -> classical or hybrid
need < $0.001/img cost                                -> classical first; ML for hard cases
need bounding boxes                                    -> ML detection (YOLO, DETR)
need pixel-perfect masks                               -> ML segmentation (SAM)
labeled data available                                 -> fine-tune ResNet/EfficientNet
labeled data scarce                                    -> CLIP zero-shot
need explainability                                    -> classical (rules are auditable)
adversarial inputs                                     -> classical (deterministic)
high volume + low budget                              -> hybrid; tune the bands
```

## Notebooks

### [[Sections/notebooks/jupyter-basics/jupyter-magic-commands|IPython magic commands — %time, %autoreload, %%writefile]]

```text
benchmark a function                 -> %timeit (multiple runs)
one-off timing                         -> %time
profile (line-by-line)                -> %lprun (line_profiler ext)
memory profile                         -> %memit (memory_profiler ext)
editing-and-rerunning a module        -> %autoreload 2
suppress / capture output              -> %%capture
shell command                           -> !cmd
capture shell output to Python         -> result = !cmd
set env var                             -> %env KEY=value
render plots inline                     -> %matplotlib inline
interactive plots                       -> %matplotlib widget (needs ipympl)
debug a cell                             -> %debug after a traceback
run external script                      -> %run script.py
save cell to file                        -> %%writefile path.py
reproducibility on share                 -> version-print header above
```

### [[Sections/notebooks/jupyter-basics/ipython-display-widgets|IPython.display & ipywidgets — rich output and interactivity]]

```text
one or two widget args                 -> @interact decorator
precise control / layout                -> ipywidgets explicit + observe
need the widget value, not just side-effect -> 'interactive' (returns widget object)
linked widgets (one updates another)    -> W.link or W.dlink
output area separated from widgets     -> W.Output context manager + clear_output
want to share notebook AS an app       -> Voila (renders notebook as web app)
plot updates                            -> wrap in Output; clear_output(wait=True)
complex UI                               -> probably outgrown notebook; build Streamlit/Dash
```

### [[Sections/notebooks/jupyter-basics/jupyter-kernel-management|Kernels & environments — per-project Python, JupyterLab vs notebook]]

```text
one user, one machine                 -> jupyter lab + venv + ipykernel
per-project envs                        -> ipykernel install --name=PROJECT (always)
conda user                              -> nb_conda_kernels for auto-discovery
team of N users                         -> JupyterHub
team needs GPU                          -> KubeSpawner with GPU profile
need notebooks behind auth              -> JupyterHub + OAuthenticator
need to scale to 100s of users          -> JupyterHub on k8s; per-pod limits
notebook breaks across kernels          -> kernel.json env section; pin python path
want JupyterLab, not classic            -> pip install jupyterlab; jupyter lab
want classic                             -> pip install notebook; jupyter notebook
want both                                -> jupyter-server hosts both
notebook in CI                           -> nbval / pytest-notebook (later entry)
shareable read-only                       -> nbconvert to HTML; OR Voila
```

### [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution]]

```text
ad-hoc parameter run                  -> papermill CLI
programmatic / pipeline                -> papermill Python API
need structured outputs                 -> scrapbook glue + read
parameter sweep                          -> for-loop over execute_notebook
scheduled report                          -> Airflow / Dagster + papermill
notebook is the deliverable               -> nbconvert to HTML; ship
error tolerance                            -> wrap in try/except PapermillExecutionError
stream cell output to logs                -> log_output=True
need to test outputs                       -> nbval (next entry); OR scrapbook + assertions
long-running notebook                     -> --execution-timeout=N (seconds)
uses GPU                                   -> kernel that points to GPU env
stop on first cell failure                 -> default behavior; raises PapermillExecutionError
```

### [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs]]

```text
want clean git history                 -> nbstripout for outputs
want readable PR diffs                  -> jupytext pairing
prefer python file as canonical          -> commit .py only; .gitignore .ipynb
prefer notebook for GitHub preview        -> commit .ipynb (stripped) AND .py
tutorials with prose                       -> jupytext --to md (markdown format)
collaborate with non-developers           -> commit .ipynb + jupytext both
one-shot conversion                        -> jupytext --to py / --to ipynb
pre-commit                                  -> nbstripout + jupytext --sync hooks
merge conflicts                              -> jupytext + git merge driver via .gitattributes
notebook in CI testing                       -> nbval / pytest-notebook (next entry)
need full output for diff (rare)            -> turn off nbstripout for that file via attribute
```

### [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides]]

```text
one-off share with stakeholders        -> nbconvert --to html --no-input
slide deck                              -> nbconvert --to slides + reveal
PDF for archival                          -> --to webpdf (no LaTeX)
docs site / tutorial                     -> mkdocs-jupyter
live interactive demo                    -> Voila (renders widgets)
email a static report                     -> --to html with embedded assets
ML model card                              -> nbconvert --to html; check into git
company-branded report                    -> custom Jinja template
exclude scratch cells                      -> tag "remove_cell"; nbconvert preprocessor
need to schedule + email                   -> papermill + nbconvert + sendgrid
need to publish to confluence/wiki        -> --to markdown; paste/import
```

### [[Sections/notebooks/production/notebook-ci-testing|Notebook CI testing — nbval, pytest-notebook, papermill assertions]]

```text
exploratory notebook                  -> nbval-lax (only check it runs)
stable analysis with known outputs    -> nbval (full output match)
programmatic outputs                    -> papermill + scrapbook + asserts
snapshot test against baseline          -> snapshot file + diff in CI
multi-version compatibility            -> matrix in CI; varied pandas/python versions
long-running notebook                   -> tag for nightly only; not on every PR
GPU-required                              -> separate job with GPU runner
notebook in deployed pipeline           -> CI is the regression test; PR-gated
parameter sweeps                          -> pytest.mark.parametrize for known params
data drift detection                      -> fixture mocks data; assert on summary stats
```

### [[Sections/notebooks/production/jupyterhub-deployment|JupyterHub — multi-user notebook server with auth, resources]]

```text
1-5 users, one machine                 -> LocalProcessSpawner
5-50 users, isolation needed            -> DockerSpawner
any team on k8s                          -> KubeSpawner
GPU access                                -> profile_list with GPU node selector
per-user persistent storage              -> PVC per user (KubeSpawner)
shared datasets                            -> read-only volume mounted on all spawns
need full Z2JH features                   -> use the official Helm chart
simple LDAP                                 -> ldapauthenticator
GitHub-only org                             -> GitHubOAuthenticator
multi-tenant SaaS                          -> NOT JupyterHub; build your own
want managed service                       -> Vertex AI Workbench, SageMaker, Hex, Deepnote
need to scale to 1000+ users               -> z2jh on big k8s; or managed service
read-only shared notebooks                 -> nbgallery; voila
```

### [[Sections/notebooks/production/notebook-anti-patterns|Notebook anti-patterns — when to graduate to .py]]

```text
exploration / EDA                       -> notebook
analysis report (one-time)               -> notebook + nbconvert HTML
recurring report                          -> notebook + papermill scheduled
reusable code                              -> .py module; import from notebooks
long-running job                            -> .py script; not a notebook
service / API                              -> .py; FastAPI or similar
ML training pipeline                       -> .py orchestrator + notebook for analysis
shared library                             -> .py with tests; never a notebook
prototype to production                    -> notebook → extract to .py incrementally
stuck in cell-order hell                  -> "Restart and Run All"; if breaks, refactor
hidden state bug                            -> use copy() not inplace; immutable patterns
```

## Documentation

### [[Sections/documentation/mkdocs/mkdocs-basics|MkDocs basics — config, serve, mkdocs-material]]

```text
Markdown source                       -> MkDocs
need autodoc from docstrings           -> MkDocs + mkdocstrings (Python plugin)
technical reference (API)               -> mkdocstrings handles it
need RST                                  -> Sphinx (next entries)
need versioned docs                       -> mike plugin for MkDocs
need PDF export                            -> Sphinx is better for that
internal team docs                         -> MkDocs; ship to internal hosting
public OSS project                         -> ReadTheDocs (Sphinx) OR mkdocs gh-deploy
docstring style                            -> Google (most readable; mkdocstrings supports)
want full text search                      -> built-in client-side; or Algolia DocSearch for big sites
custom theme                               -> overrides/ dir extends material
plugins (typer, draw.io, mermaid)          -> all available; check pypi
```

### [[Sections/documentation/mkdocs/mkdocs-mkdocstrings|mkdocstrings — auto-generated API reference from docstrings]]

```text
simple module reference                 -> ::: module.path
class with custom heading                -> ::: with options.show_root_heading
filter members                            -> options.members or options.filters
nested heading levels                     -> heading_level option
cross-refs across pages                   -> mkdocs-autorefs plugin
auto-generate page per module             -> mkdocs-gen-files + script
versioned API docs                         -> mike + per-version mkdocstrings
external Python objects                    -> objects.inv inventories (Sphinx-style intersphinx)
docstrings include code samples            -> mkdocstrings renders fenced code blocks fine
docstring tests                              -> doctest module + sybil/pytest
```

### [[Sections/documentation/mkdocs/mkdocs-deployment|MkDocs deployment — gh-pages, ReadTheDocs, custom domain]]

```text
personal project / OSS                  -> GitHub Pages via mkdocs gh-deploy
org / monorepo                            -> GitHub Actions deploy job
need build matrix (multiple Python)       -> ReadTheDocs (free tier)
need PDF / epub                            -> ReadTheDocs (formats: [pdf])
need multi-version docs                    -> mike + GitHub Actions
PR previews                                 -> Cloudflare Pages or Netlify
custom domain                                -> docs/CNAME + DNS
private docs                                  -> ReadTheDocs paid tier; or self-host (S3 + CloudFront)
sub-second search at scale                   -> Algolia DocSearch (free for OSS)
need analytics                                -> Material has gtag.id; or Plausible / Fathom
want to track 'edit on github' clicks        -> Material has built-in tracking
```

### [[Sections/documentation/sphinx/sphinx-basics|Sphinx basics — quickstart, conf.py, RST + Markdown]]

```text
default Python theme                    -> Furo (modern) or sphinx-book-theme
classic ReadTheDocs                       -> sphinx-rtd-theme
need RST                                   -> Sphinx (always)
need Markdown                              -> myst-parser (works in Sphinx)
need PDF / epub                             -> Sphinx (built-in)
API docs from docstrings                   -> sphinx.ext.autodoc + napoleon
cross-project references                    -> intersphinx
docstring style                              -> Google or NumPy via Napoleon
want hot reload                              -> sphinx-autobuild
complex Markdown features                    -> myst-parser + extensions
diagrams                                      -> sphinxcontrib-mermaid; or rst-include images
need notebooks in docs                        -> myst-nb (executes notebooks at build)
tabbed content                                 -> sphinx-design or sphinx-tabs
```

### [[Sections/documentation/sphinx/sphinx-autodoc|Sphinx autodoc — generate API docs from docstrings]]

```text
single module reference                  -> .. automodule:: x.y :members:
one class                                  -> .. autoclass:: x.y.Class
one function                               -> .. autofunction:: x.y.func
recursive auto-discovery                   -> autosummary :recursive:
Google docstrings                           -> napoleon extension
NumPy docstrings                            -> napoleon (same extension)
type hints in description                   -> sphinx_autodoc_typehints
skip private                                  -> autodoc_default_options "exclude-members"
custom skip rules                             -> connect autodoc-skip-member event
cross-link to stdlib / pandas                -> intersphinx_mapping
warnings as errors                            -> nitpicky = True (with regex ignores)
speed up build                                  -> autodoc_typehints = "none" (skip type hints)
document inherited methods                     -> :inherited-members:
override per-page                              -> directive options
want it FULLY automatic                        -> autosummary :recursive: + custom template
```

### [[Sections/documentation/sphinx/sphinx-extensions|Sphinx extensions — diagrams, notebooks, design components]]

```text
tabbed content                          -> sphinx-design tab-set OR sphinx-tabs
diagrams                                  -> sphinxcontrib-mermaid (most common)
                                              sphinx-gallery (matplotlib gallery)
                                              graphviz (sphinx.ext.graphviz)
executable notebook                       -> myst-nb (replaces myst_parser)
examples directory                          -> sphinx-gallery
"edit on GitHub"                           -> html_context with github fields
download buttons                            -> sphinx-design button-link
copy code                                    -> sphinx-copybutton
API stub generation                          -> sphinx.ext.autosummary :recursive:
architecture decision records (ADRs)         -> myst-parser; just write Markdown
blog-style                                    -> ablog extension; tags + RSS
redirects                                      -> sphinx_reredirects extension
versioning                                     -> readthedocs activates per-branch/tag
typing-aware doc                                -> sphinx_autodoc_typehints
intersphinx                                     -> sphinx.ext.intersphinx
```

### [[Sections/documentation/patterns/docstring-styles|Docstring styles — Google, NumPy, RST, type-aware]]

```text
new project                              -> Google style
scientific Python                          -> NumPy style (matches numpy/scipy/pandas)
existing project with one style            -> match it; consistency wins
already using rST                           -> RST/Sphinx style
type info                                    -> use type hints; skip :type:
examples                                      -> doctest-friendly format
private (_underscore) / dunder              -> can skip; ruff D rules optional
docstring style enforcement                  -> ruff with [tool.ruff.lint.pydocstyle]
docstring rendering                          -> napoleon (Sphinx) OR mkdocstrings (MkDocs)
docstring testing                            -> doctest module + pytest --doctest-modules
```

### [[Sections/documentation/patterns/doctest-examples|Doctest — examples that stay in sync with code]]

```text
simple example in docstring          -> stdlib doctest with >>>
exact output matters                  -> default doctest behavior
output varies (timestamps, IDs)        -> +ELLIPSIS or use placeholders
complex multi-line output              -> +NORMALIZE_WHITESPACE
needs setup data                        -> doctest_namespace fixture in conftest.py
needs DB/network                         -> +SKIP; or pytest-vcr for replay
examples in .md / .rst docs              -> sybil for cross-format testing
want ALL docs tested                      -> pytest --doctest-modules + sybil
examples in mkdocs / sphinx              -> sybil + mkdocs build verifies both
too rigid for some examples              -> // doctest: +SKIP for env-dependent
pandas DataFrame output                   -> use repr explicitly; can be brittle
                                             consider asserting just .shape and dtypes
```

### [[Sections/documentation/patterns/mkdocs-vs-sphinx|MkDocs vs Sphinx — when each wins]]

```text
1. Already using one? Keep it.
2. New project, no constraint? MkDocs + mkdocs-material.
3. Need PDF/epub? Sphinx.
4. Scientific Python? Sphinx.
5. Want simplest possible setup? MkDocs.
6. Want maximum flexibility / many extensions? Sphinx.
7. Both work? Pick by the look of mkdocs-material vs Furo.
```

## OpenCV (cv2)

### [[Sections/cv-opencv/basics/cv2-imread-imwrite|cv2.imread / cv2.imwrite — load and save images]]

```text
ASCII paths + uint8 only       -> cv2.imread / cv2.imwrite are fine.
Unicode paths (Windows, i18n)  -> np.fromfile + cv2.imdecode (above).
16-bit medical/RAW/HDR         -> IMREAD_UNCHANGED + don't cvtColor to uint8.
Need atomic guarantees         -> imencode -> tmp -> rename.
```

### [[Sections/cv-opencv/basics/cv2-color-spaces|cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)]]

```text
Threshold colors                     -> HSV + inRange.
Red specifically                     -> HSV with TWO ranges (wrap).
Match perceived color across lights  -> LAB + Delta E distance.
Need exact RGB equality (UI assets)  -> stay in BGR; np.all(img == c, -1).
```

### [[Sections/cv-opencv/basics/cv2-pixel-access-roi|Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]]]

```text
Single pixel read/write    -> img[y, x] (scalar) - O(1).
Rectangular region edit    -> img[y1:y2, x1:x2] = value - vectorized.
Arbitrary-shape edit       -> boolean mask: img[mask] = value.
Need to keep original safe -> .copy() the slice before mutating.
Coords from cv2 functions  -> (x, y);   coords for indexing -> [y, x].
```

### [[Sections/cv-opencv/transforms/cv2-resize-rotation|cv2.resize / cv2.warpAffine — resize and rotate]]

```text
Downscale            -> INTER_AREA.
Upscale (real photo) -> INTER_CUBIC (fast) or INTER_LANCZOS4 (sharp).
Upscale (line art)   -> INTER_NEAREST (preserves hard edges).
Rotation tiny angle  -> warpAffine into same canvas is fine.
Rotation big angle   -> grow canvas (above) or use rotate() if 90/180/270.
Pure 90/180/270      -> cv2.rotate(img, ROTATE_90_CLOCKWISE) - faster, no interp.
```

### [[Sections/cv-opencv/transforms/cv2-perspective-warp|cv2.getPerspectiveTransform / warpPerspective — deskew documents]]

```text
Map 2D plane -> 2D plane (rotate/scale/skew, no perspective)
    -> warpAffine (2x3 matrix).
Need to flatten a quadrilateral to a rectangle (perspective)
    -> getPerspectiveTransform + warpPerspective (3x3).
Stitch panoramas / match scenes
    -> findHomography(RANSAC) instead of getPerspectiveTransform.
Need to undo lens distortion BEFORE deskew
    -> cv2.undistort with calibration matrix first.
```

### [[Sections/cv-opencv/filters/cv2-blur-edges|cv2.GaussianBlur / cv2.Canny — smoothing and edge detection]]

```text
General Gaussian noise           -> GaussianBlur(ksize=(5,5)).
Salt-and-pepper noise            -> medianBlur(ksize=5).
Need to keep edges sharp         -> bilateralFilter.
Need fast denoise + edges        -> GaussianBlur(3,3) -> Canny.
Going to findContours next       -> close edges with dilate+CLOSE.
Need oriented gradients (HOG)    -> Sobel(dx=1,dy=0) and Sobel(dx=0,dy=1).
Single threshold doesn't fit all -> auto_canny via image median.
```

### [[Sections/cv-opencv/filters/cv2-morphology-thresholding|cv2.threshold / cv2.morphologyEx — binarize and clean masks]]

```text
Even lighting + bimodal histogram   -> THRESH_BINARY + THRESH_OTSU.
Uneven lighting (shadow, glare)     -> adaptiveThreshold (Gaussian C).
Need multi-class (>2 levels)        -> Otsu by levels (Yen) or k-means.
Remove small white noise            -> MORPH_OPEN.
Fill small black holes              -> MORPH_CLOSE.
Both                                 -> OPEN then CLOSE (this order matters).
Skeleton / one-pixel-wide           -> ximgproc.thinning (contrib module).
```

### [[Sections/cv-opencv/detection/cv2-template-matching|cv2.matchTemplate — find a known image inside another]]

```text
Single instance, fixed scale, fixed orientation -> matchTemplate + minMaxLoc.
Multiple instances, fixed scale                 -> threshold + NMS.
Mild scale variance                             -> image pyramid + NMS.
Rotation or large scale variance                -> feature-based (ORB/SIFT) or DNN.
Real-world objects (cats, cars, faces)          -> use a pretrained DNN, not matchTemplate.
```

### [[Sections/cv-opencv/detection/cv2-feature-orb|cv2.ORB / cv2.BFMatcher — keypoint matching for scenes]]

```text
Same scene, no rotation, fixed scale          -> matchTemplate.
Different angles, mild occlusion              -> ORB + ratio test.
Need geometric outline of the matched object  -> add findHomography(RANSAC).
Stitch panoramas                              -> SIFT (now patent-free) or AKAZE.
Real-time on a Raspberry Pi                   -> ORB (binary descriptors are fast).
Detect categories not specific instances      -> use a DNN, not features.
```

### [[Sections/cv-opencv/video/cv2-videocapture|cv2.VideoCapture / cv2.VideoWriter — read and write video]]

```text
Local mp4 file               -> mp4v or avc1 (avc1 = H.264, smaller files).
Cross-platform compatibility -> mp4v inside .mp4.
Open-source codec only       -> XVID inside .avi.
Lossless / debugging         -> MJPG (large but every frame is a JPEG).
Webcam capture               -> VideoCapture(0); set CAP_PROP_FRAME_WIDTH/HEIGHT BEFORE first read.
RTSP / IP camera             -> VideoCapture('rtsp://...'); add CAP_FFMPEG backend.
Need frame-accurate seeking  -> use CAP_PROP_POS_FRAMES; some codecs only seek to keyframes.
```

### [[Sections/cv-opencv/dl-integration/cv2-dnn-onnx|cv2.dnn.readNetFromONNX — run a model without PyTorch/TF]]

```text
Want simple inference, no extra deps   -> cv2.dnn.readNetFromONNX.
Want best CPU latency                  -> ONNXRuntime (onnxruntime).
Want best GPU throughput               -> ONNXRuntime + CUDA EP, or TensorRT.
Need training or finetuning            -> not cv2 - use PyTorch / TF.
Need >1 image at a time                -> blobFromImages (plural) and batch.
Need to mix with PyTorch tensors       -> stay in PyTorch; cv2 just reads frames.
```

### [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool]]

```text
Image I/O + simple ops (paste, watermark, web)   -> Pillow.
Filters, transforms, detection, video            -> cv2 (BGR-aware).
Train CNN, augmentation pipeline (CPU)           -> torchvision.transforms.
Train CNN, augmentation pipeline (GPU, batched)  -> kornia.augmentation.
Need numpy interop                               -> cv2 / numpy / Pillow all interop;
                                                    just remember BGR <-> RGB.
Reading EXIF / metadata                          -> Pillow (cv2 strips most EXIF).
Camera calibration / homography / SLAM           -> cv2 only.
```

## Tkinter

### [[Sections/gui-tkinter/basics/tk-root-mainloop|tk.Tk / mainloop / ttk widgets — minimal app]]

```text
One-off script with a UI                 -> module-level tk + mainloop.
Anything reusable or > 50 LOC            -> class-based App with __init__/run.
Need modern look                         -> ttk widgets + ttk.Style theme.
Need true cross-platform native styling  -> PyQt/PySide; tkinter is "native-ish".
Multiple independent windows             -> create tk.Toplevel for extras
                                            (NOT another tk.Tk - causes mainloop bugs).
Need Ctrl-C to exit during dev           -> after() polling trick (above).
```

### [[Sections/gui-tkinter/basics/tk-widgets-overview|ttk widget catalog — Entry, Combobox, Treeview, Notebook]]

```text
Free text                           -> ttk.Entry (with textvariable + validatecommand).
Pick from a fixed list              -> ttk.Combobox (state='readonly').
Bounded integer                     -> ttk.Spinbox.
Multi-line text                     -> tk.Text (NOT in ttk; the only big stdlib widget left in tk.).
Tabular data                        -> ttk.Treeview with columns=...; show='headings' for no tree icon.
Tree-shaped data                    -> ttk.Treeview default (show='tree headings').
Tabbed UI                           -> ttk.Notebook + .add(frame, text=).
Long-running task indicator         -> ttk.Progressbar (mode='indeterminate' for spinner).
```

### [[Sections/gui-tkinter/basics/tk-state-vars|tk.StringVar / IntVar / BooleanVar — reactive state]]

```text
Single value mirrored to one widget        -> bind via textvariable/variable, no trace.
Multiple widgets reflect one value         -> StringVar + trace_add('write').
Need to validate / cap input               -> validatecommand on Entry (preempts trace).
Two-way binding to non-Tk state            -> trace 'write' -> store; on store change -> .set().
Need 'changed by user' vs 'set in code'    -> use a flag; trace fires for both.
```

### [[Sections/gui-tkinter/layout/tk-grid-vs-pack|grid vs pack vs place — pick a geometry manager]]

```text
Stacked one-direction (toolbar, sidebar, status bar)   -> pack.
Form with aligned labels + inputs                      -> grid.
Pixel-positioned dashboard widget                      -> place
                                                           (only if you must;
                                                           breaks under DPI scaling).
Need a column to absorb extra space when resized       -> columnconfigure(col, weight=1).
Need a header that spans columns                       -> columnspan.
Two different geometry needs in one window             -> Frames; one manager per Frame.
```

### [[Sections/gui-tkinter/events/tk-event-bindings|widget.bind / event modifiers — keyboard, mouse, focus]]

```text
Per-widget event (button click, entry Enter)   -> widget.bind.
Window-wide shortcut (Ctrl-S, Esc)              -> root.bind.
App-wide regardless of toplevel                 -> root.bind_all (use sparingly).
Cancel default behavior after handling          -> return 'break' from the callback.
Need to listen to many widgets uniformly        -> bind on a common parent + event.widget.
Keyboard shortcuts in a Text widget             -> bind on the widget; default bindings
                                                    are 'class' bindings - your binding
                                                    fires before them but won't replace
                                                    them unless you return 'break'.
```

### [[Sections/gui-tkinter/events/tk-dialogs-menus|tkinter.messagebox / filedialog / Menu — standard dialogs and menus]]

```text
Yes/No prompt           -> messagebox.askyesno (returns bool).
OK / Cancel             -> messagebox.askokcancel (returns bool).
Error display           -> messagebox.showerror.
Open one file           -> filedialog.askopenfilename (returns str, '' on cancel).
Open many files         -> filedialog.askopenfilenames (returns tuple).
Save with target name   -> filedialog.asksaveasfilename (handles overwrite confirm via the OS).
Pick a folder           -> filedialog.askdirectory.
Top app menu            -> tk.Menu(root) + root.config(menu=).
Right-click on a widget -> tk.Menu(root, tearoff=0) + tk_popup(x_root, y_root).
```

### [[Sections/gui-tkinter/advanced/tk-threading-after|after / threads / queue — Tk is single-threaded]]

```text
Fast (< 50ms) work                       -> just do it in the callback.
IO-bound work (HTTP, file read)          -> threading.Thread + queue + after-drain.
CPU-bound work                           -> multiprocessing (NOT threading - GIL).
Need to schedule a one-shot future call  -> root.after(ms, fn).
Need a periodic ticker                   -> after() that reschedules itself.
Need to integrate with asyncio           -> tkinter has no native async; use a separate
                                             thread running asyncio + queue handoff.
Need real-time-ish updates               -> POLL_MS = 16 (~60Hz) but watch CPU.
```

### [[Sections/gui-tkinter/advanced/tk-canvas|tk.Canvas — drawing, dragging, custom widgets]]

```text
Static drawing                         -> create_* once; never touch again.
Update one item's geometry             -> canvas.coords(id, ...).
Translate by a delta                   -> canvas.move(id, dx, dy).
Update color/width/dash                -> canvas.itemconfig(id, fill=, width=).
Many items share behavior              -> give them a shared tag + tag_bind.
Need scroll region bigger than canvas  -> set scrollregion=(x1,y1,x2,y2) + Scrollbar.
Animation                              -> use after(16, step) and move() per frame.
Anything 3D, GPU, or > 1000 dynamic items -> not Canvas; reach for pyglet/Qt/web.
```

### [[Sections/gui-tkinter/advanced/tk-async-loop|asyncio + Tk — running an async loop alongside mainloop]]

```text
Sync libraries only                       -> threading.Thread + queue (no asyncio).
Single async call, very rare              -> asyncio.run() in a thread (junior tier).
Many async calls, shared client/state     -> persistent loop pattern (above).
Need to await across multiple Tk events   -> persistent loop + futures.
Want to use anyio/asyncqt                 -> they exist; pure stdlib gets you 90%.
```

### [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit]]

```text
Internal Python script + tiny UI                  -> tkinter (stdlib).
Polished commercial desktop app                   -> PyQt6 / PySide6.
Need data grid, charts, graph view out of box     -> PySide6 (QtCharts) or web.
Data science, ML demo, internal dashboard         -> Streamlit / Gradio.
Public web app with auth and routing              -> Flask/FastAPI + frontend.
Cross-platform mobile + desktop with one codebase -> not Python; pick Flutter/RN.
Need to ship a single .exe / .app                 -> tkinter or Qt + PyInstaller;
                                                       NOT Streamlit (server-bound).
Licensing matters and you can't pay GPL            -> PySide6 (LGPL) or tkinter (PSF).
```

## PyQt / PySide

### [[Sections/gui-pyqt/basics/qt-qapplication-qwidget|QApplication / QWidget / app.exec — minimal Qt app]]

```text
Top-level window with menu/toolbar/status     -> QMainWindow.
Modal popup ("Are you sure?")                 -> QDialog (use exec() to make modal).
Nested panel inside a window                  -> QWidget (bare).
Need to share state across widgets            -> hold it on the parent QMainWindow.
PyQt6 vs PySide6                              -> PySide6 (LGPL, official Qt for Python).
PyQt5 / PySide2 still around?                 -> Qt5 EOL'd; migrate to Qt6.
exec_ vs exec                                 -> Qt6 dropped exec_; use exec().
```

### [[Sections/gui-pyqt/basics/qt-pyqt-vs-pyside|PyQt6 vs PySide6 — pick one (and how to switch later)]]

```text
New project, want clean licensing                    -> PySide6 (LGPL).
Existing PyQt5 codebase porting to Qt6               -> PyQt6 (smallest diff).
Need to ship under closed-source commercial          -> PySide6 OR pay Riverbank.
Library code that other people consume               -> shim above (don't force a binding).
Need full type hints                                 -> both ship .pyi stubs in Qt6;
                                                         PySide6's are slightly more complete.
Care about Qt Designer (.ui) compilation             -> both work; PySide6 ships pyside6-uic,
                                                         PyQt6 ships pyuic6.
```

### [[Sections/gui-pyqt/signals-slots/qt-signals-slots|Signal / Slot — Qt's callback system]]

```text
Same-thread, immediate dispatch        -> default Qt.AutoConnection.
Cross-thread (worker -> GUI)           -> Qt.QueuedConnection (Auto picks this).
Slot must run before emit returns      -> Qt.DirectConnection (DANGEROUS across threads).
Many emits, one final UI update        -> use a QTimer/singleShot to coalesce.
Loop-captured connection (for x in ...) -> lambda _checked=False, x=x: ...
Want compile-time signature check      -> @Slot(types...) decorator.
```

### [[Sections/gui-pyqt/signals-slots/qt-qthread-worker|QThread + worker QObject — long-running tasks without freezing the UI]]

```text
Long-running task with progress + cancel        -> QThread + worker-object (above).
One-shot fire-and-forget, many of them          -> QThreadPool + QRunnable.
Pure CPU work, GIL bound                        -> QProcess or multiprocessing
                                                    (NOT QThread - GIL).
Lots of small async I/O calls                   -> asyncio in a separate thread + signals.
Simple "do this off the GUI thread"             -> QtConcurrent.run (PySide6 has it; PyQt6 doesn't).
```

### [[Sections/gui-pyqt/widgets/qt-input-widgets|QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets]]

```text
Free-text input                                  -> QLineEdit (+ setPlaceholderText).
Bounded integer                                  -> QSpinBox (+ setRange).
Float / decimal                                  -> QDoubleSpinBox.
Pick from fixed list                             -> QComboBox (+ addItems).
Pick + free text                                 -> QComboBox(setEditable=True).
Multi-line text                                  -> QPlainTextEdit (or QTextEdit for rich).
Boolean toggle                                   -> QCheckBox.
Mutually-exclusive options                       -> QRadioButton + QButtonGroup.
Any form layout                                  -> QFormLayout.addRow(label, input).
Want to react only after user finishes typing    -> QLineEdit.editingFinished
                                                    (NOT textChanged).
Want to programmatically set without emitting    -> blockSignals(True) around the call.
```

### [[Sections/gui-pyqt/widgets/qt-listview-tableview|QListView / QTableView — model/view for data]]

```text
Small static table, prototyping              -> QTableWidget (data baked in).
Real dataset, want sort + filter for free    -> QStandardItemModel + Proxy.
Custom data shape (your own list/df)         -> subclass QAbstractTableModel.
Tree-shaped data                             -> subclass QAbstractItemModel + QTreeView.
Numeric sort on a string-displayed column    -> set Qt.UserRole on data();
                                                 proxy.setSortRole(Qt.UserRole).
Pandas DataFrame                             -> subclass QAbstractTableModel
                                                 backed by the df (well-known pattern).
Live updates                                 -> beginResetModel / endResetModel
                                                 (or beginInsertRows for fine-grained).
```

### [[Sections/gui-pyqt/layouts/qt-layouts|QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout]]

```text
Sequential stack of widgets                  -> QVBoxLayout / QHBoxLayout.
Aligned forms                                -> QFormLayout.
Multi-row, multi-column structure            -> QGridLayout.
User-resizable panes                         -> QSplitter (horizontal or vertical).
Page switcher (wizard, tabbed app)           -> QStackedWidget (or QTabWidget for tabs).
Need a fixed-size widget that won't stretch  -> setSizePolicy(Fixed, Fixed) on it.
Need extra space at the end of a stack       -> layout.addStretch().
Need precise margins                          -> setContentsMargins / setSpacing.
```

### [[Sections/gui-pyqt/styling/qt-qss-styling|Qt Style Sheets (QSS) — CSS-like styling]]

```text
One-off styling                       -> widget.setStyleSheet (local).
App-wide theme                        -> app.setStyleSheet at startup.
Per-widget variants                   -> setProperty("kind", "...") + [kind="..."] selector.
After changing a property at runtime  -> widget.style().unpolish/polish(widget).
Need true OS-native look              -> use QPalette + style().setStyle("Fusion") -
                                         QSS overrides native rendering.
Need icons + colors theme             -> QSS for color, qrc resource bundle for icons.
Need theming on QML                   -> not QSS; QML has its own styling system.
```

### [[Sections/gui-pyqt/styling/qt-threadpool-runnable|QThreadPool / QRunnable — fire-and-forget tasks]]

```text
Many short tasks                          -> QThreadPool + QRunnable.
Single long-running task with progress    -> QThread + worker QObject.
Pure CPU work (numpy, image processing)   -> multiprocessing or QProcess
                                             (QThreads share the GIL).
Need signals from QRunnable               -> separate JobSignals(QObject) member.
Need to cancel mid-job                    -> shared cancel flag the run() polls.
Want backpressure                          -> pool.setMaxThreadCount(N).
One-line "run this lambda off-thread"      -> QtConcurrent.run (PySide6).
```

## Audio & DSP

### [[Sections/audio-dsp/librosa/librosa-load-resample|librosa.load / resample — load any audio file, force a sample rate]]

```text
Want a quick look at any audio file              -> librosa.load(path) (defaults are fine).
Need a SPECIFIC sample rate (ASR / model)        -> librosa.load(path, sr=N, mono=True).
Need precision over resampling                   -> sr=None on read; explicit resample.
Need only a slice                                -> offset= + duration= (saves decode work).
Stereo audio (music)                             -> mono=False; expect (2, n) shape.
Many short reads (training)                      -> res_type="kaiser_fast" everywhere.
Lossless / 24-bit / float32 file                 -> use soundfile.read directly to keep dtype.
File is 8-bit / mu-law / a-law (telephony)       -> soundfile handles those; librosa doesn't.
```

### [[Sections/audio-dsp/librosa/librosa-stft-spectrogram|librosa.stft / display.specshow — spectrograms]]

```text
Just want to look at sound                 -> stft + amplitude_to_db + specshow.
Speech / general audio ML                  -> mel spectrogram (n_mels=80 or 128).
Music analysis (chords, harmonics)         -> stft on log-frequency or constant-Q (cqt).
Need fine pitch detection                  -> n_fft >= 4096; smaller hop.
Need fine onset detection                  -> small hop_length (128 or 256).
Need real-time low latency                 -> n_fft = hop_length = 512 or smaller.
Need invertible (resynthesize)             -> stft with center=True; istft to invert.
Want comparable across files                -> ref='max' is per-file; for global use ref=1.0.
```

### [[Sections/audio-dsp/librosa/librosa-mfcc-features|librosa.feature.mfcc — features for classical audio ML]]

```text
Small dataset (< ~10k clips), classical ML       -> MFCC + delta + delta2.
Want a single per-clip vector                    -> mean (and std) across time.
Want a sequence for an HMM / CRNN                -> keep (n_features, n_frames).
Deep learning end-to-end                         -> use mel spectrogram instead;
                                                    the DCT in MFCC discards info.
Speaker-id / emotion                             -> add chroma + spectral_contrast features.
Want lighter features                            -> n_mfcc=13 is the canonical default.
Music genre / instrument                         -> spectral_contrast + chroma + tempogram.
```

### [[Sections/audio-dsp/sounddevice/sounddevice-play-record|sd.play / sd.rec — synchronous playback and recording]]

```text
Quick demo / scripts                       -> sd.play / sd.rec (blocking).
Real-time monitoring or processing         -> sd.InputStream with callback.
Both record AND play simultaneously        -> sd.playrec or InputStream + OutputStream.
Need lowest latency                         -> set blocksize small (256 or 512); use ASIO.
Long recordings                             -> InputStream + write to soundfile incrementally
                                                (don't keep the whole buffer in RAM).
Multiple devices / multi-channel            -> set device=, channels=N, mapping=[1,2,3].
Cross-platform packaging                    -> sounddevice bundles PortAudio - works
                                                without installing anything else.
```

### [[Sections/audio-dsp/sounddevice/sounddevice-stream-callback|sd.InputStream / OutputStream — real-time audio]]

```text
Real-time pipeline (live FX, VAD, transcription)   -> InputStream + callback + queue.
Want simultaneous playback + capture                -> sd.Stream (full-duplex) or
                                                       InputStream + OutputStream.
Latency budget < 10 ms                               -> blocksize <= 256 + low-latency host API.
Latency tolerable, throughput matters                -> blocksize 1024-2048.
Multi-channel mics (e.g. 4-mic array)                -> channels=4, indata shape (frames, 4).
Need to write to disk live                            -> queue + soundfile.SoundFile in worker.
Dropped blocks acceptable (UI meter)                 -> drop-on-full like above.
Dropped blocks NOT acceptable (recording)            -> queue.Queue with NO maxsize + size monitor.
```

### [[Sections/audio-dsp/scipy-signal/scipy-signal-filters|scipy.signal — IIR/FIR filters, convolution]]

```text
Offline analysis, want no phase distortion       -> sosfiltfilt (forward-backward).
Streaming / real-time                            -> sosfilt with zi state across blocks.
Need exact linear phase (e.g. EQ)                -> FIR via firwin + lfilter.
Short impulse response, low order               -> butter or cheby1.
Long convolution (reverb, room IR)               -> scipy.signal.fftconvolve.
Need to remove a single frequency                -> iirnotch (designs a notch SOS).
Computing transfer-function poles/zeros          -> design with output='ba' for analysis,
                                                    NEVER for application (use SOS).
```

### [[Sections/audio-dsp/scipy-signal/scipy-signal-windows|scipy.signal.windows / spectral leakage]]

```text
General-purpose spectrum               -> hann (good leakage suppression, moderate main lobe).
Tightest main lobe, max leakage        -> rectangular ('boxcar'); rarely a good choice.
Need accurate amplitude reading        -> flattop (very wide main lobe, very flat).
Need to maximize SNR for a tone        -> blackman or kaiser (beta>=8).
Lowest variance PSD                    -> Welch with many overlapping segments.
Stationary signal, want one PSD        -> nperseg = N, noverlap=0 (Bartlett).
Rapidly changing spectrum              -> short nperseg + spectrogram.
Need invertible STFT (resynth)         -> hann with 50% or 75% overlap (COLA).
```

### [[Sections/audio-dsp/formats/audio-file-formats|soundfile / pydub / wave — picking a file I/O library]]

```text
Just need to read/write WAV/FLAC/OGG       -> soundfile (preserves bit depth).
Need MP3/M4A/OPUS or "concat 50 clips"     -> pydub (uses ffmpeg).
Stdlib only, PCM WAV is enough             -> wave module.
Files too big for RAM                      -> soundfile.SoundFile + read(block).
Need to preserve original subtype          -> read source.subtype, pass to write.
Need lossless float audio                  -> subtype='FLOAT' (32-bit float WAV).
Need smallest size, lossy OK               -> export through pydub to MP3/OPUS.
Want to convert formats                    -> pydub.AudioSegment.export(format=).
```

### [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack]]

```text
Quick analysis / prototyping             -> librosa (NumPy, CPU).
Train a model end-to-end                  -> torchaudio (GPU, batched, differentiable).
Music IR (key, tempo, genre)              -> essentia (lots of pretrained algorithms).
Edit files (concat, fade, format convert) -> pydub.
Real-time effects                          -> sounddevice + scipy.signal callbacks.
Need ASR                                   -> faster-whisper / wav2vec2 + torchaudio loading.
Want consistent train+infer mel            -> torchaudio (matches what the model trained on).
Want consistent feature versions           -> librosa pinned + cache to disk.
```

## Geospatial

### [[Sections/geospatial/geopandas/geopandas-load-crs|gpd.read_file / set_crs / to_crs — load + project]]

```text
File has correct CRS metadata             -> read_file + to_crs.
File has NO CRS / wrong CRS                -> set_crs (declare) then to_crs (reproject).
You want to MEASURE distance/area          -> reproject to a CRS in METERS
                                              (UTM zone, or local equal-area).
You want to PLOT alongside web tiles       -> EPSG:3857.
You want to STORE / SHARE a dataset        -> EPSG:4326 (most universal).
You want fast reloads of huge GeoDFs       -> gpd.to_parquet + gpd.read_parquet.
You want to read just a region (huge file) -> gpd.read_file(path, bbox=(x1,y1,x2,y2)).
Want a stable column name for geometry      -> gdf.rename_geometry('geom') if needed.
```

### [[Sections/geospatial/geopandas/geopandas-spatial-joins|gpd.sjoin / gpd.overlay — combine geometries by location]]

```text
"Which polygon contains each point?"          -> sjoin(predicate='within').
"Polygons that intersect this region"          -> sjoin(predicate='intersects').
"Closest feature to each point"                -> sjoin_nearest (max_distance optional).
Need set algebra (intersect 2 polygon layers)  -> gpd.overlay.
Need cells of a tessellation                   -> overlay(union) of two layers.
Many points, fewer polygons                    -> sjoin scales well (sindex on right side).
Need DISTANCE in meters                         -> reproject both to a meter CRS (UTM
                                                    zone) before sjoin_nearest.
Performance falling off                         -> gdf.sindex; or save as parquet so
                                                    reads are vectorized.
```

### [[Sections/geospatial/geopandas/geopandas-plot-explore|GeoDataFrame.plot / .explore — static and interactive maps]]

```text
Static map for a PDF / report           -> gdf.plot + matplotlib + contextily.
Interactive map for a notebook          -> gdf.explore (returns folium Map).
Many features (>50k)                    -> use lonboard or pydeck (WebGL); folium chokes.
Need classification bins                -> scheme= 'Quantiles' / 'NaturalBreaks' /
                                           'EqualInterval' (requires mapclassify).
Diverging data (gain/loss)              -> cmap='RdYlBu_r' or 'BrBG'.
Sequential data (counts/density)        -> cmap='viridis' / 'plasma' / 'YlOrRd'.
Need basemap tiles                      -> contextily for static, tiles= for explore.
Missing values                          -> missing_kwds= dict in plot().
```

### [[Sections/geospatial/shapely/shapely-geometry-types|Point / LineString / Polygon / Multi* — geometry constructors]]

```text
Single object                            -> Point / LineString / Polygon.
Multiple disjoint of one kind            -> MultiPoint / MultiLineString / MultiPolygon.
Mixed kinds                              -> GeometryCollection.
Always-inside-the-shape point            -> .representative_point() (NOT .centroid).
Just need the bounding box                -> .bounds (tuple) or .envelope (Polygon).
Need to ensure validity                  -> .is_valid + make_valid (Shapely 2.0)
                                           or buffer(0) (legacy fix).
Need to merge touching polygons           -> shapely.ops.unary_union(list_of_polys).
Need to split a polygon by a line         -> shapely.ops.split.
```

### [[Sections/geospatial/shapely/shapely-spatial-predicates|intersects / within / contains / distance / buffer — geometry algebra]]

```text
"Within X meters of geometry G"           -> G.buffer(X) + intersects
                                              (or sjoin with the buffer).
"Exact closest distance"                  -> a.distance(b).
"Touch but don't overlap"                 -> .touches.
"Properly inside (no shared boundary)"    -> .within (or .contains_properly).
"Disjoint"                                -> a.disjoint(b)
                                              (faster than not a.intersects(b)).
Snap a point to a line                    -> shapely.ops.nearest_points(line, point).
Set algebra (intersection/union/diff)     -> .intersection / .union / .difference.
Need clean cap style for buffer corridor  -> buffer(d, cap_style=2) for flat caps.
```

### [[Sections/geospatial/rasterio/rasterio-open-read|rasterio.open / .read / windows — read raster pixels]]

```text
File on local disk, fits in RAM            -> rasterio.open + read().
Huge file or just a region                 -> Window-based read (above).
Need to reproject pixels                   -> WarpedVRT (no temp file) or rio.warp.reproject.
File is on S3 / HTTP and is a COG          -> rasterio.open(uri) directly; lazy read.
File is on S3 but NOT a COG                -> download first; non-COG random access is slow.
nodata matters                              -> read(..., masked=True) and use the mask.
Many bands, only need a few                 -> read([4, 8, 11]); skip the rest.
Need overviews / pyramids                   -> use src.overviews(1) and read(..., out_shape=).
```

### [[Sections/geospatial/rasterio/rasterio-mask-reproject|rasterio.mask / .warp.reproject — clip and reproject]]

```text
Continuous data (DEM, reflectance, temp)    -> Resampling.bilinear or .cubic.
Categorical data (land cover, classes)      -> Resampling.nearest (NEVER bilinear).
Need exact area preservation                 -> Resampling.average (slower).
Single-step clip + reproject                 -> WarpedVRT inside one rasterio.open.
Pipeline output for re-use                   -> driver='COG' and overviews.
Many polygons, one raster                    -> rasterio.features.rasterize once
                                                then mask vs the rasterized version.
Loop over many small AOIs                    -> open the source ONCE; reuse the handle.
```

### [[Sections/geospatial/folium/folium-basic-markers|folium.Map / Marker / GeoJson — interactive maps in 5 lines]]

```text
< 500 markers                              -> bare folium.Marker is fine.
500 - 50k markers                           -> MarkerCluster.
> 50k markers                               -> Leaflet.heat (folium.plugins.HeatMap)
                                               or pydeck/lonboard for WebGL.
Polygons / GeoJSON                          -> folium.GeoJson(data, style_function=, tooltip=)
                                               or folium.Choropleth.
Need user toggleable layers                  -> FeatureGroup + LayerControl.
Need a basemap that's actually professional  -> tiles="CartoDB positron" / "CartoDB dark_matter".
Need offline tiles                           -> tiles=None + custom WMS / static tile server.
Producing artifacts repeatedly               -> save HTML; embed in iframe / Jupyter.
```

### [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack]]

```text
< 10M rows, iterating in a notebook            -> GeoPandas.
> 10M rows, one machine, parquet files          -> DuckDB-spatial.
> 100M rows, multi-user, persistent             -> PostGIS.
Distributed (TB+) batch jobs                     -> Apache Sedona on Spark.
Time-series of rasters (Sentinel-2 weekly)       -> xarray + rioxarray + dask
                                                    (chunks across time + space).
Tile-served vector for web maps                   -> tippecanoe -> mbtiles -> tile server.
Need transactional writes (collab editing)        -> PostGIS (only PostGIS gives ACID
                                                    on geometries).
Need ad-hoc SQL on local files                    -> DuckDB-spatial.
```

## Quantum

### [[Sections/quantum/qiskit/qiskit-circuit-basics|QuantumCircuit / gates / measure — build a circuit]]

```text
Quick prototype                          -> inline qc.h(0); qc.cx(0,1); ...
Reusable across many runs                -> factory function returning a circuit.
Many calls with different angles         -> Parameter + assign_parameters
                                            (one transpile, many binds).
Need named registers in diagrams         -> QuantumRegister(name="...")
                                            + ClassicalRegister(name="...").
Multiple sub-circuits                    -> qc.compose(other, qubits=[...]).
Need to inspect gate counts / depth      -> qc.count_ops() / qc.depth() / qc.size().
Need a clean visualization               -> qc.draw("mpl"); barriers separate phases.
Want OpenQASM output                     -> qc.qasm() (Qiskit <1.x) or qiskit.qasm3.dumps.
```

### [[Sections/quantum/qiskit/qiskit-simulators-shots|Aer / Sampler / shots — run a circuit and read counts]]

```text
Want measurement counts                       -> Sampler primitive.
Want <psi|H|psi> for a Hamiltonian H          -> Estimator primitive.
Local noiseless                                -> StatevectorSampler / StatevectorEstimator.
Local with calibrated noise                    -> qiskit_aer.AerSimulator(.from_backend(b)).
Real IBM quantum hardware                      -> qiskit_ibm_runtime + Session.
Fast classical exact answer                    -> Statevector(qc).probabilities_dict().
Many parameterized executions                   -> transpile once, then bind values
                                                    on the transpiled circuit.
Need stable counts                              -> shots >= 8192; std ~ 1/sqrt(N).
```

### [[Sections/quantum/qiskit/qiskit-transpile|transpile / optimization_level — compile to a backend]]

```text
Local simulator                       -> any optimization_level; cheap.
Real hardware                          -> optimization_level=3 minimum.
Care about 2q gate count               -> sweep n_seeds (transpile is stochastic).
Need a CUSTOM pass                     -> generate_preset_pass_manager(...).run(qc)
                                          + insert your pass.
Need to lock layout (topology study)   -> initial_layout=[...] (physical qubits).
Need to control routing                -> routing_method='sabre' (default) /
                                          'lookahead' / 'basic'.
Need basis gates explicitly            -> basis_gates=['rz','sx','cx'] (no backend).
Want OpenQASM output for another tool  -> qasm3.dumps(qc_t).
```

### [[Sections/quantum/cirq/cirq-circuit-basics|cirq.Circuit / GridQubit / measure — Cirq circuits]]

```text
Want a 2D-topology-aware circuit         -> cirq.GridQubit(row, col).
Linear chain                              -> cirq.LineQubit.range(n).
Need named qubits                         -> cirq.NamedQubit('alice').
Statevector exact answer                  -> cirq.Simulator().simulate(c)
                                             .final_state_vector.
Sampled counts                            -> cirq.Simulator().run(c, repetitions=).
Noisy simulation                          -> circuit.with_noise(channel) +
                                              DensityMatrixSimulator.
Want the unitary matrix                   -> cirq.unitary(circuit).
Want SVG / text                           -> print(circuit) for ASCII; cirq.
                                              contrib SVG drawer for diagrams.
```

### [[Sections/quantum/concepts/quantum-bell-superposition|Superposition / entanglement / Bell test — the canonical demos]]

```text
Need to demonstrate superposition         -> single H on |0>; sample many shots.
Need to demonstrate entanglement          -> Bell state (H + CX); show no 01/10.
Need to PROVE quantumness                  -> CHSH or any Bell inequality.
Need exact probabilities                   -> Statevector(qc).probabilities_dict()
                                               (no measurement).
Need exact unitary                          -> qiskit.quantum_info.Operator(qc).
Need expectation <psi|H|psi>                -> Estimator + SparsePauliOp(H).
Need to estimate fidelity vs ideal         -> measure in many bases; do tomography
                                               (qiskit-experiments has helpers).
Need scalable verification                  -> randomized benchmarking, NOT statevector.
```

### [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework]]

```text
IBM hardware                                -> Qiskit + qiskit_ibm_runtime.
Google hardware / Sycamore-shape research   -> Cirq.
Variational / QML / hybrid optimization     -> PennyLane (autograd interop).
Quantum chemistry                            -> qiskit-nature OR PennyLane (qml.qchem).
Error correction / surface codes             -> Stim (Clifford-only but scales).
Multi-platform abstraction                   -> PennyLane (device='qiskit.aer' etc.).
Teaching / clean API                         -> Cirq.
Largest ecosystem in 2026                    -> Qiskit.
Need OpenQASM3 input/output                  -> Qiskit (best support today).
```

## Web3 / Blockchain

### [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect]]

```text
Single chain, scripts                         -> Web3(HTTPProvider(...)).
Multiple chains in one app                    -> dict[chain_name, Web3] or class.
Polygon / BSC / Goerli / Optimism Bedrock?    -> inject geth_poa_middleware.
Need real-time events                         -> WebsocketProvider + filter / subscription.
Local node available                          -> IPCProvider (fastest, lowest latency).
High request volume                           -> use AsyncWeb3 + asyncio for concurrency.
Bursty traffic                                -> tenacity retries + 429 backoff.
Public RPC unstable                           -> use a paid provider (Alchemy / Infura /
                                                 QuickNode); rotate keys via env.
```

### [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state]]

```text
One read, one address                       -> contract.functions.x(args).call().
Need historical state                       -> .call(block_identifier=12345678).
Many reads of the SAME contract             -> still N round-trips; consider multicall.
Many reads across DIFFERENT contracts       -> Multicall3.aggregate3 (one round-trip).
Need to handle a partial failure            -> aggregate3 with allowFailure=True per call.
Need to read events (past)                  -> get_logs (next entry).
Need to react to events (live)              -> WebsocketProvider + eth_subscribe.
Need ABI for a verified contract             -> Etherscan API "getsourcecode" -> ABI.
```

### [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain]]

```text
One-shot script                              -> hardcoded gas + send_raw + wait_for_receipt.
ERC-20 / contract write                      -> build_transaction + estimate_gas + EIP-1559 fees.
Bursty sender (>1 tx/sec)                    -> NonceManager (above) and don't refetch
                                                 nonce from chain per tx.
Multi-process sender                          -> Redis / DB counter for nonce.
Need to cancel a stuck tx                    -> resubmit at SAME nonce with HIGHER tip.
Need to speed up a pending tx                -> resubmit at SAME nonce with HIGHER fees.
Want to know revert reason                   -> static-call (.call()) BEFORE sending; or
                                                 debug_traceTransaction on archive node.
Permitted to reverse on failure               -> always check receipt.status == 1.
```

### [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events]]

```text
< 5k block range, scripts                      -> contract.events.X.get_logs.
Historical (millions of blocks)                 -> chunked get_logs +
                                                    reorg lookback.
Need throughput on a paid RPC                   -> AsyncWeb3 + asyncio.gather + sem.
Need real-time stream                            -> WebsocketProvider + eth_subscribe.
Need to filter by indexed arg                    -> argument_filters={"to": addr}.
Need to filter by non-indexed                    -> filter in Python after decode
                                                    (RPC can't help).
Building an indexer at scale                     -> consider Subsquid / The Graph / Goldsky.
Need the latest TIP including pending mempool    -> there is no get_logs for pending;
                                                    use mempool RPCs (Alchemy, Blocknative).
```

### [[Sections/web3-blockchain/solana/solana-basics|solana-py / solders — query and send on Solana]]

```text
Read SOL balance                                  -> AsyncClient.get_balance.
Read SPL token balances                           -> get_token_accounts_by_owner_json_parsed.
Send SOL                                          -> system_program.transfer + sign + send.
Send SPL token                                    -> spl.token.instructions.transfer (NOT SOL one).
Talk to a custom Anchor program                   -> anchorpy library.
Need historical transactions                       -> get_signatures_for_address + get_transaction.
Need real-time                                     -> websockets RPC subscribe.
Need fast keypair/pubkey ops                       -> solders (Rust); avoid the older solana.publickey.
```

### [[Sections/web3-blockchain/patterns/web3-vs-ape-vs-viem|web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit]]

```text
Backend / bot / indexer in Python              -> web3.py (raw RPC).
Smart-contract project (Solidity + Python)     -> eth-ape (replaces Brownie).
Smart-contract project (Solidity, top DX)      -> Foundry (forge); ape can wrap it.
Frontend (TypeScript / React)                  -> viem (preferred) or ethers.js v6.
Need ABI without copy-paste                     -> ape's Contract(addr) auto-fetches.
Need historical scans (>100k blocks)            -> Subsquid / The Graph hosted indexer.
Need on-chain SQL                                -> Dune Analytics or Subsquid SQL plugin.
Multi-chain in one Python process                -> dict[chain, Web3] - web3.py.
You see "Brownie" in tutorials                   -> it's deprecated; use ape.
```

## Bioinformatics

### [[Sections/bioinformatics/biopython/biopython-sequences-io|SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank]]

```text
File fits in RAM (< 100 MB FASTQ)               -> SeqIO.parse + list is fine.
Multi-GB file                                    -> iterate; never list().
Need random access by id                         -> SeqIO.index (build .idx file).
Need both random + remote                        -> SeqIO.index_db (SQLite-backed).
Need to write many records                       -> SeqIO.write accepts an iterator.
FASTA records have huge sequences (chromosomes)  -> Bio.SeqIO + lazy seq via FastaTwoLineParser
                                                    OR pysam.FastaFile for indexed reads.
Need .gz transparency                            -> gzip.open("...", "rt") then SeqIO.parse(fh, fmt).
Need Phred encoding detection                     -> sniff first ~100 quality lines (above).
```

### [[Sections/bioinformatics/biopython/biopython-alignment-blast|PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST]]

```text
Two sequences, just need score             -> PairwiseAligner.
Two sequences with custom matrix            -> PairwiseAligner + substitution_matrices.load.
< 100 references                             -> loop PairwiseAligner.
100s-1000s of references                     -> local BLAST+ (blastp / blastn).
Genomic-scale (mouse vs human refs)          -> minimap2 (DNA) / DIAMOND (protein, 1000x BLAST).
One-off, no install                          -> Bio.Blast.NCBIWWW.qblast (rate-limited; slow).
Multiple-sequence alignment (>2 seqs)        -> mafft or muscle via subprocess (don't write your own).
Need exact match counting                    -> not alignment - use a k-mer index (mash, sourmash).
```

### [[Sections/bioinformatics/pysam/pysam-bam-pileup|pysam.AlignmentFile / fetch / pileup — read BAM]]

```text
Iterate every read                       -> bam.fetch (no contig) - whole file.
Region of reads                           -> bam.fetch(contig, start, end) (needs .bai).
Per-base column view                      -> bam.pileup(contig, start, end, truncate=True).
Need ALL columns including indels        -> add_indels=True in get_query_sequences.
CRAM file                                 -> mode="rc" + reference_filename=.
Need genomic depth across regions         -> bedtools genomecov (faster) or mosdepth.
Multi-process scan                        -> open AlignmentFile inside the worker
                                             (NOT in parent and pass).
Coordinates from a VCF                    -> VCF is 1-based; subtract 1 before fetch.
```

### [[Sections/bioinformatics/pysam/pysam-vcf|pysam.VariantFile — read and filter VCF/BCF]]

```text
Whole-file scan                              -> for rec in VariantFile(...).
Region scan                                  -> .fetch(contig, start, end) on .vcf.gz +
                                                 .tbi index.
Need to write VCF                            -> VariantFile("...vcf.gz", "w", header=...).
Multi-sample callset                          -> rec.samples[name][KEY] for per-sample fields.
Indel-aware                                   -> handle len(ref) and any len(alt) > 1.
Multi-allelic (split or join)                 -> use bcftools norm -m for splitting.
Coordinates between BAM and VCF              -> BAM/pysam 0-based; VCF.pos 1-based;
                                                 VCF.start 0-based attribute exists.
Massive callset (gnomAD whole genome)         -> bcftools query is faster than Python.
```

### [[Sections/bioinformatics/scanpy/scanpy-anndata-basics|AnnData / sc.read — load + inspect a single-cell dataset]]

```text
10x output (.h5)                      -> sc.read_10x_h5.
10x mtx folder                         -> sc.read_10x_mtx.
.h5ad                                 -> sc.read_h5ad (round-trip from previous step).
csv / tsv counts                      -> sc.read_csv / read_text (slow; rare).
Sparse vs dense .X                    -> keep sparse (csr_matrix); densify only what
                                         you need to plot.
Need provenance with the data         -> stash thresholds in adata.uns.
Want to undo a step                   -> .copy() the AnnData defensively.
Multiple samples                       -> read each, set adata.obs["batch"], then
                                         adata.concatenate(...) or ad.concat([...]).
```

### [[Sections/bioinformatics/scanpy/scanpy-pca-umap-cluster|normalize → HVG → PCA → neighbors → UMAP → leiden]]

```text
Single sample, exploratory                  -> default pipeline (no batch_key).
Multiple samples / patients                 -> batch_key on HVG + Harmony or scvi.
Need batch correction with deep learning    -> scvi-tools (slower; better at noise).
Want fewer / more clusters                  -> tune leiden resolution (0.4 -> 1.5).
Visualization                                -> UMAP for general; t-SNE if you must.
Trajectory analysis                          -> scanpy.tl.dpt or scvelo (RNA velocity).
Differential expression cluster vs rest      -> rank_genes_groups (Wilcoxon default).
Differential expression between conditions   -> pseudobulk + DESeq2 / edgeR (NOT cluster-level
                                                 Wilcoxon - underpowered + biased).
```

### [[Sections/bioinformatics/patterns/bio-stack-decision|Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools]]

```text
Teaching / one-off scripts                       -> Biopython.
Production read / variant access                  -> pysam.
Multi-step pipeline (>3 stages, multi-sample)     -> Snakemake or Nextflow.
Industrial pharma / dominant ecosystem            -> Nextflow (nf-core).
Solo / small team / Python-first                  -> Snakemake.
Anything heavyweight (align, sort, call, count)   -> CLI giants (bwa, samtools, bcftools,
                                                     minimap2, DIAMOND, mosdepth, bedtools).
Massive cohorts (10k+ samples)                    -> Hail (Spark-based) or
                                                     glow (Spark-based variant ops).
Need GUI for biologists                           -> Galaxy or terra.bio.
```

## Astropy & Scientific

### [[Sections/astropy-scientific/astropy/astropy-units-quantity|astropy.units / Quantity — values that carry units]]

```text
Want compile-/runtime safety on units      -> Quantity everywhere; ban raw floats.
Performance-critical loops                  -> .to_value(canonical) early; raw NumPy inside.
Need physical constants                     -> astropy.constants (typed Quantities).
Need spectral / parallax conversions        -> equivalencies argument to .to().
Want to print with formatting                -> f"{q:.3f}" or q.to_string(format="latex").
Need to serialize across systems             -> store value + unit string;
                                                reconstruct with u.Unit(str).
Want pandas-aware unit DataFrames            -> astropy.table.Table or pint-pandas
                                                (NOT pandas + Quantity directly).
```

### [[Sections/astropy-scientific/astropy/astropy-skycoord|astropy.coordinates.SkyCoord — celestial coordinates]]

```text
Single coordinate                            -> SkyCoord(ra, dec, unit=, frame=).
ICRS modern catalog (Gaia, etc.)             -> frame="icrs" (default).
Old FK4 / B1950 data                         -> frame="fk4", equinox="B1950".
Galactic l/b                                 -> .transform_to("galactic") or .galactic.
Horizon (alt/az)                             -> AltAz frame + obstime + EarthLocation.
Pairwise distance                            -> a.separation(b) -> Angle Quantity.
N x M matching                               -> match_to_catalog_sky (1-NN).
All within radius                            -> search_around_sky.
Old catalog vs modern epoch                  -> apply_space_motion(new_obstime=...) when
                                                PM and parallax are available.
```

### [[Sections/astropy-scientific/astropy/astropy-fits-io|astropy.io.fits — read and write FITS files]]

```text
One-shot read of one HDU                  -> fits.getdata / fits.getheader.
Multi-extension or unknown layout          -> fits.open + hdul.info() + with-block.
Need WCS                                    -> astropy.wcs.WCS(header).
FITS table                                  -> BinTableHDU.data is a record array;
                                               np.array(...) copies it out of memmap.
Need to keep data after close              -> .data.copy() or memmap=False.
Streaming write                              -> fits.append (one HDU at a time).
Compressed FITS (.fits.fz)                   -> handled transparently by fits.open.
Header-only inspection                       -> fits.getheader (no data load).
```

### [[Sections/astropy-scientific/networkx/networkx-graphs-paths|nx.Graph / DiGraph / shortest_path / centrality]]

```text
< 50k nodes, productivity over speed              -> NetworkX (Pythonic API).
100k-10M nodes                                     -> igraph (C core, Python bindings).
10M+ nodes / billion edges                         -> graph-tool (C++ + OpenMP) or
                                                    cuGraph (GPU).
Need shortest path                                 -> nx.shortest_path(weight=).
All-pairs shortest paths                            -> nx.floyd_warshall_numpy
                                                    (dense; O(n^3 * 8 bytes)).
Weighted PageRank / centrality                     -> nx.pagerank / betweenness_centrality
                                                    with weight=.
Communities                                         -> nx.community.louvain_communities (3.x)
                                                    or python-louvain.
Persist a graph                                     -> nx.write_gpickle / write_gml /
                                                    write_graphml; for parquet, use NetworkX
                                                    to_pandas_edgelist.
```

### [[Sections/astropy-scientific/sympy/sympy-symbolic-math|symbols / solve / diff / integrate / lambdify]]

```text
Need EXACT roots / closed form              -> sp.solve.
Numeric root only                            -> sp.nsolve(eq, var, x0) or scipy.optimize.
Need exact derivatives                       -> sp.diff (single var) or sp.Matrix +
                                                sp.diff for Jacobians.
Need to USE the result in a hot loop         -> sp.lambdify(args, expr, "numpy").
Symbolic expression too big for lambdify     -> common cause of slowness; sp.simplify
                                                or sp.cse (common sub-expression elim) first.
Need autodiff with deep nets                  -> JAX (autograd) or PyTorch.
Need integrals you can also evaluate          -> sp.integrate + lambdify;
                                                for purely numeric, scipy.integrate.quad.
Need typeset output                            -> sp.latex(expr) for LaTeX strings.
```

### [[Sections/astropy-scientific/patterns/scientific-stack-decision|astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool]]

```text
Domain-specific astronomy ops               -> astropy (units / coords / FITS / time).
Generic numerical methods                    -> scipy (linalg / optimize / integrate / stats).
Exact symbolic                               -> sympy.
Autodiff + GPU                               -> JAX (jit / grad / vmap).
Train deep nets                              -> PyTorch.
Graph algorithms                             -> NetworkX (small) -> igraph -> graph-tool.
Spark-scale arrays                            -> Dask or Ray.
Out-of-core arrays                            -> Zarr / xarray + dask.
Solar physics                                -> sunpy (built on astropy).
Mass spec                                    -> pyteomics.
Time series tabular                          -> pandas / polars.
```

## Game Dev (pygame)

### [[Sections/gamedev-pygame/basics/pygame-event-loop|pygame.init / display / event loop / clock]]

```text
Toy / jam / hours-old prototype          -> frame-coupled (intro tier).
Anything you'll polish                    -> dt-scaled (junior tier).
Multiplayer / determinism / replay        -> fixed-step + accumulator
                                             + render interpolation (senior tier).
Need exact framerate cap                  -> clock.tick(60).
Need uncapped render with vsync            -> set_mode(..., vsync=1) and
                                             clock.tick(0).
Need lower CPU when minimized              -> check display.get_active(); sleep
                                             more aggressively when not active.
Need to skip render but keep simulation    -> headless mode set DISPLAYSURF=
                                             pygame.Surface (no flip).
```

### [[Sections/gamedev-pygame/basics/pygame-surface-rect|Surface / Rect / blit / convert — the drawing primitives]]

```text
Always after image.load                       -> .convert() (opaque) or .convert_alpha().
Need a Rect from a surface                    -> surf.get_rect(topleft=, center=, midbottom=).
Need to keep a sprite inside a window          -> rect.clamp_ip(bounds).
Need fast collision against many              -> rect.collidelist / collidelistall.
Need pixel-perfect collision                   -> pygame.mask.from_surface + Mask.overlap.
Need transparent off-screen surface            -> pygame.Surface(size, SRCALPHA).
Many moving sprites                            -> pygame.sprite.Group + dirty-rect update.
Single full-screen background                  -> blit + display.flip(); dirty rects waste CPU.
```

### [[Sections/gamedev-pygame/physics/pygame-collisions-pymunk|Rect collision / Mask / pymunk physics — when to upgrade]]

```text
Axis-aligned arcade game                 -> rect.colliderect / collidelist.
Pixel-perfect against irregular shapes   -> pygame.mask.from_surface + Mask.overlap.
Need many vs many collision              -> sprite.groupcollide(g1, g2, dokill_a, dokill_b).
Need real physics (gravity, friction)    -> pymunk (Chipmunk2D); pygame just renders.
Need tile-based collision                 -> rect against grid cells; many engines do
                                              this faster than pymunk for tile maps.
Need 2D rigid body + joints + springs    -> pymunk.
Need 3D physics                            -> not pygame; reach for Panda3D + Bullet,
                                              or Godot/Unity with a Python script binding.
Need GPU sprite batching                   -> arcade or moderngl-pygame
                                              (pygame is software-rendered).
```

### [[Sections/gamedev-pygame/patterns/gamedev-patterns-engines|Game-state stack / scene manager / engine choice]]

```text
Tiny prototype                                -> single state variable.
Real game with menu / pause / overlays        -> Scene stack (junior tier).
2D, want GPU sprite batching + perf            -> arcade (3.x).
2D + retro effects + lower-level OpenGL        -> pyglet or moderngl-pygame.
2D/3D engine with editor + GDScript            -> Godot 4 (native; godot-python optional).
Want Python in Unity                            -> not happening; Unity is C#.
Mobile target                                   -> Pygbag (pygame -> WASM) or arcade -> WASM
                                                  for web; Kivy / BeeWare for native.
Multiplayer netcode                              -> deterministic fixed-step (basics tier 3)
                                                    + bsdiff snapshots; consider Mirror (Unity)
                                                    or Godot HLAPI long-term.
```

## MicroPython / Embedded

### [[Sections/embedded-micropython/core/micropython-vs-cpython|gc / memory / async — what to do differently]]

```text
Stable hot loop                     -> preallocate (bytearray / list of fixed size).
Constants the compiler can inline    -> from micropython import const.
Multiple I/O tasks                   -> uasyncio (NOT threading on most boards).
Need pause-free hot loop             -> avoid heap allocation inside it; gc.collect()
                                         on a separate periodic task.
Need <1ms response                   -> machine.Timer.PERIODIC (hardware timer)
                                         with a tiny ISR; do NOT allocate in ISR.
Need to dump telemetry                -> use struct.pack into a bytearray; print()
                                         of a string of digits is slow + GC-heavy.
Two cores (RP2040)                    -> _thread.start_new_thread for the second core;
                                         communicate via _thread.allocate_lock.
```

### [[Sections/embedded-micropython/hardware/micropython-gpio-pwm-adc|machine.Pin / PWM / ADC — digital + analog I/O]]

```text
Read a stable input                       -> Pin.value() poll.
Need every edge                           -> Pin.irq(trigger=...).
Bouncy switch                              -> hardware RC + IRQ + software debounce window.
Drive an LED brightness                    -> PWM.duty_u16 (0..65535).
Drive a servo                              -> PWM(freq=50, duty_u16 around 5%-10%).
Read analog voltage                        -> ADC(pin).read_u16().
Multiple sensors / timed loops             -> uasyncio tasks; one task per sensor.
Sub-millisecond response                   -> machine.Timer (hardware) with a tiny ISR.
Need to ALLOCATE in an interrupt           -> you can't; micropython.schedule(cb, arg).
```

### [[Sections/embedded-micropython/hardware/micropython-i2c-spi|machine.I2C / SPI — talk to sensors and displays]]

```text
Sensor with kHz updates                  -> I2C is fine (up to 1 MHz fast-mode-plus).
Big display / SD card / fast ADC          -> SPI (MHz baud rate).
New sensor model                          -> i2c.scan() first; check it shows up.
Multiple devices same bus                 -> different addresses (I2C) or
                                              separate CS pins (SPI).
3.3V vs 5V mismatch                        -> level shifter; many sensors are 3.3V only.
Sporadic OSError                          -> bus contention or pull-up missing
                                              (4.7k typical on SDA/SCL).
Need to swap pins on ESP32                  -> ESP32 I2C is software-routable; just pass
                                              different scl=/sda=.
Need lots of I/O                            -> I2C/SPI multiplexers (TCA9548A) instead
                                              of more peripheral instances.
```

### [[Sections/embedded-micropython/platforms/micropython-esp32-wifi|esp32 / network.WLAN — WiFi + HTTPS + MQTT]]

```text
Always-on, mains powered                 -> persistent MQTT (junior tier).
Battery, occasional updates              -> deepsleep cycle (senior tier).
Need to reach 8+ months on AAA batteries -> deepsleep + LoRa instead of WiFi.
Need OTA firmware updates                 -> esp32.Partition + ota_set_boot_partition.
Need TLS                                  -> standard MicroPython firmware on ESP32 has SSL;
                                             certs go in flash via mpremote.
Need NTP time after boot                  -> ntptime.settime() once after WiFi up.
Many devices behind one MQTT topic        -> client_id includes machine.unique_id().hex().
```

### [[Sections/embedded-micropython/platforms/micropython-rp2040-pico|rp2 / Pico — second core, PIO, asyncio]]

```text
Need 2 cores (RP2040 / RP2350)             -> _thread.start_new_thread + lock.
Need sub-microsecond timing (WS2812, etc.)  -> rp2.PIO program.
Need 5+ peripherals on one MCU              -> PIO can implement extra UARTs/SPIs.
Need WiFi on Pico                           -> Pico W (cyw43439) - same _thread/PIO,
                                              + network.WLAN.
Need >2 cores or NEON                       -> not Pico; reach for ESP32-S3 or
                                              a Cortex-A SBC (Linux land).
Need C-level perf in MicroPython            -> @micropython.viper / @micropython.native
                                              decorators on small functions.
```

### [[Sections/embedded-micropython/tooling/micropython-mpremote|mpremote / mip / WebREPL — flash, deploy, debug]]

```text
Single board, dev workflow              -> mpremote (fs cp + reset + repl).
Live editing on the host                 -> mpremote mount.
Install community drivers                 -> mpremote mip install <pkg>.
Beginner-friendly IDE                     -> Thonny (built-in MicroPython support).
Over-the-air on ESP32 (no USB)           -> WebREPL.
Save RAM on a tight memory budget         -> freeze .py modules into the firmware
                                              (manifest.py + custom build).
Update firmware                            -> esptool.py for ESP32; uf2 drag-and-drop
                                              for Pico.
CI / automated deploys                    -> shell script wrapping the above.
```

### [[Sections/embedded-micropython/patterns/micropython-vs-circuitpython|MicroPython vs CircuitPython vs C/Rust — pick the toolchain]]

```text
Quick prototype, beginner                  -> CircuitPython.
Production embedded, Python everywhere     -> MicroPython.
Need uasyncio / _thread / viper             -> MicroPython.
Need every microsecond of timing            -> C / C++ (ESP-IDF / Arduino) or Rust.
Need <10 uA deepsleep                        -> C with FreeRTOS / ESP-IDF; MicroPython
                                              does ~10 uA on ESP32 deepsleep but app
                                              wake-up is heavier.
Memory safety + async on bare metal         -> Rust + embassy.
Safety-critical (medical, avionics)         -> not Python; certified C (MISRA), Ada,
                                              or Rust with formal subsets.
Audio DSP at MHz rates                       -> C/C++ with SIMD or Rust + nostd.
Cross-vendor portability                    -> Zephyr RTOS (C) for the maximum reach.
```

## MQTT / IoT

### [[Sections/mqtt-iot/paho/paho-publish-subscribe|paho.Client / connect / publish / subscribe / loop]]

```text
Quick prototype                          -> default Client + loop_start.
Need reconnect resilience                 -> reconnect_delay_set + resubscribe in on_connect.
Need at-least-once delivery               -> qos=1; handlers must be idempotent.
Need exactly-once delivery                -> qos=2 (slow; rarely needed in IoT).
Need broker to remember subscriptions     -> clean_session=False (MQTTv3) or
                                             clean_start=False + SessionExpiryInterval (v5).
Need device "is online" status            -> last-will + retained STATUS_TOPIC.
Need encrypted transport                  -> tls_set + port 8883.
Multi-tenant brokers                      -> ACLs + per-device certs (mutual TLS).
Need to detect offline downstream         -> retained status + monitor it.
Want the subscriber to immediately see the latest reading -> retain=True on publish.
```

### [[Sections/mqtt-iot/paho/paho-retained-lwt-topic-design|retain / LWT / topic structure — patterns that scale]]

```text
Want subscribers to see "current value" on subscribe   -> publish with retain=True.
Want broker to announce a crash                         -> client.will_set(...).
Want presence (online/offline) for a fleet              -> retained STATUS topic + LWT
                                                           (above).
Multi-tenant                                             -> include org / tenant in
                                                           the topic prefix.
Need to load-balance consumers                           -> $share/group/topic
                                                           (MQTT 5 shared subscriptions).
Need fan-out                                              -> standard subscribe (every
                                                           subscriber gets every msg).
Need to delete a retained message                         -> publish empty payload with
                                                           retain=True to that topic.
Topic includes a value that changes                       -> NO; values go in the payload,
                                                           not the topic.
```

### [[Sections/mqtt-iot/aiomqtt/aiomqtt-async-client|aiomqtt.Client — async/await around paho]]

```text
App is asyncio (FastAPI / websockets / asyncpg)   -> aiomqtt.
App is sync                                        -> paho directly.
Need cross-thread bridging                         -> paho.loop_start in thread; queue
                                                      to async via run_in_executor.
Need to consume + publish concurrently              -> asyncio.TaskGroup (Python 3.11+).
Need reconnect resilience                           -> outer while True + MqttError catch
                                                      with exponential backoff (above).
Need TLS                                            -> aiomqtt.TLSParameters.
Need MQTT 5 properties                               -> aiomqtt 2.x supports MQTT 5
                                                      via paho's MQTTv5 protocol.
Need shared subscriptions ($share)                   -> just subscribe to the
                                                      "$share/<group>/<topic>" string.
```

### [[Sections/mqtt-iot/patterns/mqtt-vs-kafka-amqp|MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol]]

```text
Mass IoT clients, small messages, lossy net          -> MQTT.
High-volume analytics, replay, partitioned log        -> Kafka.
Enterprise routing (exchanges, dead letters)          -> AMQP / RabbitMQ.
Cloud-to-cloud notification, no broker                 -> HTTP webhook.
Need both device fleet + analytics replay              -> MQTT -> Kafka bridge.
Need managed everything                                 -> AWS IoT Core / Azure IoT Hub /
                                                           Google Cloud IoT (sunset 2023 -
                                                           switch to Pub/Sub).
Need on-premise + open-source                          -> Mosquitto (simple) or
                                                           EMQX (clustered, ACL, bridges).
Need durable IoT queue                                  -> EMQX / VerneMQ persistent sessions.
```

## Network Protocols

### [[Sections/network-protocols/sockets/sockets-tcp-server|socket / asyncio.start_server — TCP servers]]

```text
One-client tool                              -> blocking socket.
Many concurrent clients                       -> asyncio.start_server (above).
Need horizontal scale on one host             -> SO_REUSEPORT + N processes.
Line-delimited text                           -> reader.readline / readuntil(b"\n").
Binary protocol                               -> length-prefixed (uint32 big-endian).
Need backpressure                              -> writer.drain() after every write.
Latency-sensitive (game / trading)             -> setsockopt(IPPROTO_TCP, TCP_NODELAY, 1).
Need TLS                                       -> ssl.SSLContext + start_server(ssl=ctx).
IPv6                                           -> AF_INET6 + bind to "::"; dual-stack via
                                                  IPV6_V6ONLY=0.
```

### [[Sections/network-protocols/sockets/sockets-udp-multicast|UDP / multicast / asyncio.DatagramTransport]]

```text
Service discovery on LAN                        -> multicast (224.0.0.0/4) + JSON
                                                    (or reuse mDNS via zeroconf lib).
Real-time media (video, voice, games)            -> raw UDP + your own
                                                    sequence numbers.
Telemetry fan-out                                -> StatsD (UDP) for fire-and-forget;
                                                    OTLP (TCP) when you need delivery.
Need reliability over UDP                        -> QUIC (HTTP/3) or aioquic; or rely on
                                                    app-level ack/retransmit.
Need very large UDP messages                     -> reduce to <1500 bytes (MTU) or
                                                    fragment yourself.
Need to receive on a specific NIC                -> bind to that NIC's IP; mreq with
                                                    interface address.
Need to test multicast in CI                     -> docker network host-mode + lo
                                                    multicast often broken; use a TCP
                                                    loopback fallback for tests.
```

### [[Sections/network-protocols/protocols/websockets-server-client|websockets — async WS server + client]]

```text
Asyncio app, native websockets             -> websockets library.
Sync app, want to add WS                   -> use websockets.sync.client / .server
                                               (built-in sync wrappers since v12).
FastAPI / Starlette app                     -> Starlette's @app.websocket("/ws") wraps
                                               websockets internally.
Need scale across processes / nodes         -> Redis pub/sub or NATS for cross-node fan-out.
Need binary frames                           -> websockets handles bytes natively;
                                               send/recv accepts both str + bytes.
Need keepalive over flaky networks           -> ping_interval=20 + ping_timeout=10.
Browser client                               -> standard JS WebSocket() in the browser;
                                               no Python on the client side.
Need lower-level WS                          -> wsproto for protocol-only without IO.
```

### [[Sections/network-protocols/protocols/grpc-python|grpcio + protobuf — typed RPC services]]

```text
Internal microservice with typed schema   -> gRPC.
Public-internet API for any client        -> REST/HTTP-JSON or GraphQL.
Real-time push from server                 -> gRPC server-streaming or WebSockets.
Bidirectional streaming                    -> gRPC bidi (above) or WebSockets.
Async Python service                        -> grpc.aio.server.
Sync Python service                         -> grpc.server + ThreadPoolExecutor.
Need browser support                         -> grpc-web (proxy via Envoy or grpc-web shim).
Need API gateway / mesh                      -> Envoy + grpc -> grpc-json transcoding.
Need REST + gRPC from one schema             -> grpc-gateway (Go) or buf.
```

### [[Sections/network-protocols/low-level/scapy-sniff-craft|scapy.sniff / send / packet crafting]]

```text
Need to read packets in Python              -> scapy.sniff / AsyncSniffer.
Need to craft / inject                      -> IP()/TCP()/Raw() + send / sr1 / sendp.
Need to read existing pcap                  -> rdpcap("file.pcap"); each packet is
                                               a normal scapy object.
Need to write pcap                          -> wrpcap("out.pcap", packets).
Need high packet rates                       -> tcpdump pipe + scapy -> too slow;
                                               use libpcap directly or AF_PACKET in C.
Need ARP / DHCP / DNS spoofing               -> scapy has helpers (arp_send, etc.) but
                                               also handle the ethical/legal review.
Need fuzzing                                 -> scapy.fuzz(IP()/TCP()) auto-fuzzes fields.
Need TLS visibility                          -> not scapy; mitmproxy, or scapy-ssl_tls.
```

### [[Sections/network-protocols/patterns/network-stack-decision|sockets vs WebSockets vs gRPC vs HTTP — pick the right tool]]

```text
Browser client                                  -> WebSockets (or fetch + SSE).
Internal microservice with typed contract        -> gRPC.
Public-internet API                              -> REST/HTTP-JSON.
IoT fleet                                        -> MQTT.
Custom binary protocol on embedded device        -> raw TCP/UDP.
Want server -> client push without WS            -> Server-Sent Events (text/event-stream).
Want low latency over lossy networks             -> QUIC / HTTP/3 (aioquic).
Want async pipelines + persistence + live UI      -> MQTT in, Postgres + Redis pub/sub
                                                    backing FastAPI for queries + WS.
Can't decide                                      -> REST + WS is the minimum-regret default;
                                                    optimize later.
```

---
*753 decision rules · [[_Index|Vault index]]*
