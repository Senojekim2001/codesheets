---
type: "moc"
title: "Anti-Patterns"
tags:
  - "python"
  - "moc"
  - "anti-patterns"
  - "rag"
---

# Anti-Patterns

> Each entry's "Anti-pattern:" callout — the specific bug the senior tier warns against.

## Core Syntax & Built-ins

### [[Sections/core/output/print|print()]]

> [!warning] leaving print() statements as the production logging strategy.
Devs sprinkle print() through code, ship it, and now they cannot silence noisy output,
  filter by level, route to a file/syslog, or correlate with request IDs. Use logging from
  day one — the cost is one import and getLogger(__name__); the payoff is configurable verbosity.

### [[Sections/core/output/input|input()]]

> [!warning] trusting input() to give you the right type without casting or validation.
input() always returns a str. Beginners write `age + 1` and get TypeError, or skip the
  try/except and crash on bad input. Cast inside try/except in a retry loop — and for
  non-interactive scripts, accept stdin or argv instead so tests and pipelines work.

### [[Sections/core/output/isinstance|isinstance()]]

> [!warning] using type(x) == SomeClass for type checks.
This rejects subclasses (including bool, which is an int subclass) and breaks duck typing.
  It also fails for proxies, mocks, and ORM models. Use isinstance(x, X) so legitimate
  subclasses are accepted; reach for ABCs (Iterable, Mapping) when you mean "anything that
  behaves like one" rather than "the concrete list/dict class".

### [[Sections/core/output/getattr|getattr()]]

> [!warning] combining hasattr + getattr (or try/except AttributeError) for a single lookup.
hasattr is implemented as getattr-in-a-try, so `if hasattr(o, "x"): getattr(o, "x")` does the
  work twice. Use `v = getattr(o, "x", default)` and branch on `v is default` (or use a sentinel).
  This is faster, race-free, and one line shorter.

### [[Sections/core/output/hasattr|hasattr()]]

> [!warning] hasattr on objects that define __getattr__ or descriptors with side effects.
hasattr swallows ALL exceptions in older Python (and AttributeError in 3.x), so a getter
  that raises during DB lookup will silently report "attribute missing". Either guarantee the
  attribute exists at construction time, or wrap the actual operation in try/except so you
  see the real error.

### [[Sections/core/output/vars|vars()]]

> [!warning] using vars() to "see all attributes" of an object.
vars() only returns instance __dict__ — class attributes, inherited attributes, methods,
  and slot fields are absent. Beginners then "lose" attributes they know exist on the class.
  Use dir() for the full attribute surface; use vars() only when you specifically want the
  per-instance state dict (e.g. for serialization or copying).

### [[Sections/core/output/dir|dir()]]

> [!warning] using dir() output as the source of truth for an object's API.
dir() includes private dunders, inherited helpers, and IDE/debugger-injected attributes;
  it is a discovery aid, not a contract. Production code should target documented attributes
  or use inspect.signature / typing.Protocol / hasattr to test specific things, never iterate
  over dir() and call everything that "looks public".

### [[Sections/core/output/sys-module|sys module]]

> [!warning] calling sys.exit() inside library code.
sys.exit() raises SystemExit which terminates the whole interpreter unless something
  catches it. Library callers expect exceptions or return codes — killing their process is
  surprising. Raise a custom exception (or ValueError); let __main__ scripts decide whether
  to translate it into an exit code.

### [[Sections/core/output/os-module|os module]]

> [!warning] building paths with f-strings or "+" string concatenation.
`f"{dir}/{file}"` breaks on Windows backslashes, double slashes, and missing separators;
  it also mixes user input with code in a way that's brittle. Use Path(dir) / file (or
  os.path.join) — handles separators, normalizes empties, works cross-platform.

### [[Sections/core/builtins/len|len()]]

> [!warning] writing `if len(lst) > 0:` or `if len(lst) == 0:`.
Empty containers are falsy, non-empty are truthy. Write `if lst:` or `if not lst:` — it's
  shorter, idiomatic, and works for any container type. The len() check also fails on
  generators (TypeError) where truthiness checking via `if it:` would also fail — for
  generators use `first = next(it, None)` to peek.

### [[Sections/core/builtins/range|range()]]

> [!warning] writing `for i in range(len(lst)): item = lst[i]`.
This is the C-style index loop in Python — verbose, off-by-one prone, and slower than
  `for item in lst:`. If you need both, use `for i, item in enumerate(lst):`. The only
  legitimate `range(len(...))` cases are when you must mutate by index or zip multiple
  sequences by position (and even then, zip(a, b) handles most of those).

### [[Sections/core/builtins/sum-min-max|Numeric built-ins]]

> [!warning] `sum(lst_of_lists, [])` to flatten nested lists.
This works but is O(n²) because each + creates a new list. Use
  `list(itertools.chain.from_iterable(lst_of_lists))` for O(n), or for NumPy/pandas data use
  their native concat / np.concatenate. The sum() trick is famous on Stack Overflow but is
  actively bad on more than ~100 sublists.

### [[Sections/core/builtins/any-all|any() / all()]]

> [!warning] passing a list comprehension to any/all instead of a generator.
`any([is_valid(x) for x in items])` evaluates is_valid for every item and builds a list,
  killing the short-circuit benefit. Drop the brackets: `any(is_valid(x) for x in items)`
  stops at the first True. The same applies to all(), max(), min(), and sorted-key callbacks
  when the iterable is large or expensive to compute.

### [[Sections/core/builtins/enumerate|enumerate()]]

> [!warning] `for i in range(len(lst)): print(i, lst[i])`.
Verbose, slower (extra subscript per iteration), breaks on non-list iterables (sets, gens),
  and obscures intent. `enumerate(lst)` is one token shorter, works on any iterable, and
  communicates "I need the index" plainly. The same applies to `range(0, len(lst))` — also
  redundant.

### [[Sections/core/builtins/zip|zip()]]

> [!warning] relying on zip's silent truncation as a feature.
When two lists should be the same length but aren't, plain zip drops the tail of the longer
  one with no warning, hiding data bugs (e.g. you load 100 names but only 99 emails). In
  3.10+, default to zip(..., strict=True) anywhere lengths are supposed to match — it raises
  ValueError and surfaces the mismatch immediately.

### [[Sections/core/builtins/map-filter-sorted|sorted()]]

> [!warning] `lst = lst.sort()` — assigning the result of in-place sort.
list.sort() returns None to signal mutation; you've just clobbered your list with None.
  Pick one model: in-place `lst.sort()` (no assignment) OR functional `new = sorted(lst)`.
  The same trap exists for list.reverse() / list.append() / dict.update() — all return None
  on purpose.

### [[Sections/core/control/if-elif-else|if statement]]

> [!warning] `if x == None:` and `if x == True:`.
None / True / False are singletons; use identity (`is None`, `is True`, `is False`). The
  == versions can be hijacked by overloaded __eq__ on custom or pandas types and are slower.
  Linters (ruff E711, E712) flag this for a reason — keep your falsy / None / bool checks
  identity-based.

### [[Sections/core/control/ternary|Ternary expression]]

> [!warning] chaining ternaries to emulate elif.
`a if c1 else b if c2 else c if c3 else d` is right-associative and reads like a riddle in
  review. Use an if/elif/else statement (or a dict lookup if all branches are pure values),
  not a 4-deep ternary tower. The ternary is for two-way value selection — beyond that,
  readability beats brevity.

### [[Sections/core/control/walrus|Walrus operator :=]]

> [!warning] sprinkling := in places where regular assignment would do.
`(x := 5)` adds noise without saving a line. The walrus earns its keep ONLY when the
  assignment must happen inside an expression (loop condition, comprehension filter,
  if-test where you also use the value). Outside those contexts, plain x = 5 is clearer
  and easier to grep.

### [[Sections/core/control/for-loop|for loop]]

> [!warning] mutating the list you are iterating over (`lst.remove` / `del lst[i]` inside loop).
The iterator's internal index drifts and items get skipped silently. Either iterate over a
  shallow copy (`for x in lst[:]`), build a new list with a comprehension
  (`[x for x in lst if keep(x)]`), or collect indices to delete and apply after the loop.

### [[Sections/core/control/while-loop|while loop]]

> [!warning] `while True` with no break/return path or no progress check.
The loop variable doesn't update, the break condition is never met, or the timeout is
  missing — and the script hangs. Always include either a guaranteed exit (counter, deadline,
  stop condition) or a structured break. Defensive pattern: `for _ in range(MAX_ATTEMPTS)`
  instead of `while True` so a runaway can't be infinite.

### [[Sections/core/control/match-case|match statement]]

> [!warning] porting if/elif equality chains to match without a structural reason.
match on a single int value with 5 cases is just a wordy if/elif. The win arrives when you
  bind variables (`case Point(x=0, y=y):`) or destructure JSON-like payloads. If every case
  is `case <const>:`, a dict {const: handler} or if/elif is shorter and equally readable.

### [[Sections/core/functions/def|def]]

> [!warning] `def f(items=[]):` — mutable default argument.
The default `[]` is created once at def-time and reused across every call that omits the
  arg. The "list grows mysteriously" bug is the most-cited Python gotcha. Always use
  `def f(items=None):` then `if items is None: items = []` inside the body. The same applies
  to dicts, sets, and any mutable container or instance.

### [[Sections/core/functions/args-kwargs|*args / **kwargs]]

> [!warning] using **kwargs as the function's only signature documentation.
`def configure(**kwargs)` hides every accepted option from IDE help, type checkers, and
  reviewers, and forwards typos silently. List the options as named params (with sensible
  defaults); use **kwargs only for genuine pass-through to a wrapped library or for
  forward-compat extensibility — and document the accepted keys in the docstring.

### [[Sections/core/functions/lambda|lambda]]

> [!warning] building a closure with lambda inside a loop and being surprised by late binding.
`fns = [lambda: i for i in range(3)]; fns[0]()` returns 2, not 0 — every lambda captures the
  same variable, not its value at the time of creation. Bind the value with a default:
  `lambda i=i: i` (default args are evaluated at def-time). Or use functools.partial. The
  bug looks like a closure problem; it's actually how Python scoping works.

### [[Sections/core/functions/generators|Generators]]

> [!warning] consuming a generator twice expecting the same items.
`g = (x*x for x in range(3)); list(g); list(g)` — the second call returns []. Generators
  are single-pass iterators that exhaust on use. If you need multiple passes, materialize
  to a list (or recreate the generator). For huge data where listing is impossible, redesign
  to compute results in a single pass.

### [[Sections/core/functions/decorators|Decorators]]

> [!warning] writing a decorator without @functools.wraps(fn).
The wrapped callable now reports the wrapper's __name__, __doc__, and signature; help(),
  pytest fixtures, FastAPI/Click that introspect signatures, and stack traces all degrade.
  Always add `@functools.wraps(fn)` on the inner wrapper. For decorators that need to
  modify the signature, use functools.wraps + inspect.signature manipulation.

### [[Sections/core/functions/closures|Closures]]

> [!warning] forgetting the nonlocal declaration when assigning to an enclosing variable.
`def inner(): count += 1` — Python sees the assignment and creates a fresh local `count`
  that is uninitialized, raising UnboundLocalError on the read part of +=. Add
  `nonlocal count` (or refactor to a class). Reading-only doesn't need nonlocal — only
  rebinding does.

### [[Sections/core/functions/global-nonlocal|global / nonlocal]]

> [!warning] using global as the default solution for "I need to share state".
Global mutable state defeats testability (tests share state and order matters), prevents
  parallelism, and hides data flow. Refactor to: pass the value as a parameter, return new
  state from functions, or wrap state in a class with explicit methods. Reach for `global`
  only for true module-level constants, lazy initialization, or when working inside a
  tightly-scoped script.

### [[Sections/core/data-types/list|list]]

> [!warning] `grid = [[0] * cols] * rows` to make a 2-D matrix.
The outer multiplication produces `rows` references to the SAME inner list, so writing
  `grid[0][0] = 1` updates every "row" simultaneously. Use a comprehension instead:
  `grid = [[0] * cols for _ in range(rows)]` so each row is a fresh list. The same trap
  occurs with `[set()] * n` and any other mutable element.

### [[Sections/core/data-types/unpacking|Unpacking]]

> [!warning] indexing into a tuple repeatedly when destructuring would be obvious.
`name = pair[0]; value = pair[1]` is noisy and error-prone next to `name, value = pair`.
  Same for return values: write `mean, stdev = stats(x)` instead of `r = stats(x); m = r[0]`.
  When tuples grow beyond 3 fields, consider a dataclass or NamedTuple — destructuring N
  fields by position becomes brittle as the tuple's shape evolves.

### [[Sections/core/data-types/dict|dict]]

> [!warning] `if key in d: value = d[key]` — two lookups for the price of one.
This hashes `key` twice (once for `in`, once for `[]`). Use `value = d.get(key)` plus a
  None check, or `d.get(key, default)`. For "fetch and create if missing" use
  d.setdefault(key, []) or, cleaner, defaultdict. Same anti-pattern: del d[k] inside an
  iteration over d — collect keys first or rebuild via dict comprehension.

### [[Sections/core/data-types/dict-comprehension|Dict comprehension]]

> [!warning] inverting a dict that has duplicate values via comprehension.
`{v: k for k, v in d.items()}` keeps only the LAST key for each repeated value, silently
  dropping data. Either de-dupe values first, or invert into a list-of-keys dict:
  defaultdict(list); for k, v in d.items(): inv[v].append(k). Always assert
  `len(set(d.values())) == len(d)` before single-key inversion.

### [[Sections/core/data-types/tuple|tuple]]

> [!warning] writing `t = (item)` thinking you have a 1-tuple.
`(item)` is a parenthesized expression equal to `item`; the comma is what creates a tuple.
  Use `t = (item,)` or `t = item,`. Equally common: assuming tuples are deeply immutable —
  they aren't; they freeze the references but a contained list is still mutable. For real
  immutability of nested data, use frozen @dataclass(frozen=True) plus tuple of tuples.

### [[Sections/core/data-types/namedtuple|namedtuple]]

> [!warning] reaching for a regular class (with __init__, __eq__, __repr__, ...) for what
is actually a record. You re-implement five dunder methods that NamedTuple/@dataclass
  generate for free, and they are easy to get wrong (e.g. forgetting to update __eq__ when
  adding a field). For value types with no behavior, prefer NamedTuple/@dataclass and only
  add a real class when you need substantial methods.

### [[Sections/core/data-types/set|set]]

> [!warning] using `if x in big_list` repeatedly inside a loop.
Each membership test is O(n), so an outer loop becomes O(n*m). Convert the haystack to a
  set ONCE: `block = set(big_list); for x in items: if x in block: ...`. Each lookup is now
  O(1). The conversion costs O(n), then every `in` is constant. Equally classic gotcha:
  `{} ` does not create a set; use `set()`.

### [[Sections/core/data-types/set-comprehension|Set comprehension]]

> [!warning] `{x for x in lst}` when you just want `set(lst)`.
The comprehension form adds noise without value when there's no transform or filter.
  Reserve set/dict/list comprehensions for cases that actually map or filter; for plain
  conversion, use the constructor (`set(it)`, `list(it)`, `dict(pairs)`). Equally common:
  forgetting that {} is a dict, so `empty = {}` does NOT give you an empty set — use `set()`.

### [[Sections/core/data-types/fstrings|f-strings]]

> [!warning] f-string interpolation into SQL, HTML, shell, or log records.
`db.execute(f"SELECT * FROM users WHERE id={user_id}")` is a SQL injection. Use the
  driver's parameter binding: `db.execute("SELECT ... WHERE id=?", (user_id,))`. Same with
  logging: `log.info(f"got {x}")` evaluates the f-string even if the level is filtered;
  write `log.info("got %s", x)` so the formatter only runs when needed (and PII filters work).

### [[Sections/core/data-types/str-methods|str methods]]

> [!warning] building a string by repeated `+=` inside a loop.
Each iteration creates a new immutable string and copies all previous content; total work
  is O(n²). Append to a list and `"".join(parts)` at the end (O(n)). For really large
  string assembly use `io.StringIO`. The same bug shape: `s = s.replace(...)` chained
  thousands of times — collect all (old, new) pairs then run str.translate or a regex once.

### [[Sections/core/data-types/re-module|re module]]

> [!warning] parsing HTML, JSON, CSV, or email addresses with hand-rolled regex.
These grammars have edge cases (nested tags, quoted commas, RFC 5322) that regex cannot
  handle robustly; you'll ship something that "works on the dev sample" and fails in prod.
  Use html.parser / BeautifulSoup, json.loads, csv.reader, email.utils.parseaddr — purpose
  built parsers. Reserve regex for genuine pattern matching on flat text.

### [[Sections/core/data-types/type-hints|Type hints]]

> [!warning] relying on type hints to validate runtime data.
`def f(x: int)` does not stop someone passing a str — Python ignores the annotation. For
  hard validation use Pydantic, beartype, attrs.validators, or assert isinstance() at the
  boundary. Inversely: importing typing.List/Dict/Tuple/Set in 3.9+ code is dead weight;
  use lower-case built-ins.

### [[Sections/core/data-types/abc|Abstract Base Classes]]

> [!warning] forgetting @abstractmethod on the base method.
Without the decorator, the empty `def area(self): pass` is a CONCRETE method that returns
  None. Subclasses are not forced to override it; instantiation succeeds; bugs surface at
  call time as silent None returns. Always pair the abstract intent with @abstractmethod
  (and `...` for the body), and inherit from ABC so the metaclass blocks instantiation
  when implementations are missing.

### [[Sections/core/stdlib/itertools|itertools]]

> [!warning] list(it.cycle("ABC")) — hangs forever. ALWAYS bound infinite
iterators (count / cycle / repeat) with islice or break out of the loop.

### [[Sections/core/stdlib/collections-deque|collections.deque]]

> [!warning] while items: x = items.pop(0) for queue semantics. Each pop(0)
is O(n); the loop is O(n^2). Use deque.popleft() — that's the whole reason
the type exists.

### [[Sections/core/stdlib/functools|functools]]

> [!warning] @functools.lru_cache on an instance method. The cache key
includes self, so every cached call holds a strong reference to the
instance — the instance can never be GC'd while the cache lives. Use
@cached_property for instance-scoped caches; reserve lru_cache for module-
level functions.

### [[Sections/core/stdlib/datetime|datetime module]]

> [!warning] mixing naive and aware datetimes. Subtraction raises
TypeError, comparisons raise TypeError, and ORM saves silently lose the
timezone. Decide ONCE at every boundary: aware in, aware out.

### [[Sections/core/stdlib/json-module|json module]]

> [!warning] str(some_dict) for "JSON". Single quotes, None instead of null,
True/False instead of true/false. Always json.dumps.

### [[Sections/core/stdlib/copy-module|copy module]]

> [!warning] copy.deepcopy on objects with file handles, sockets, locks, or
threading primitives. The copied resource is invalid. Implement __deepcopy__
to drop the resource, OR refactor to a value type with no resources.

### [[Sections/core/stdlib/bytes|bytes]]

> [!warning] b"" + chunk in a loop. Each concatenation allocates a new
bytes object — O(n^2). Use bytearray.extend or io.BytesIO instead.

### [[Sections/core/stdlib/bytearray|bytearray]]

> [!warning] while live_memoryview: ba.extend(...). The bytearray cannot
resize while a memoryview holds a reference; you'll get BufferError. Release
the view (set to None or exit the with-block) before mutating the buffer.

### [[Sections/core/stdlib/pathlib|pathlib.Path]]

> [!warning] Path concatenation via str(p) + "/" + name. Defeats the whole
point — you lose Windows handling AND the safety of path operations. Always
use the / operator.

### [[Sections/core/stdlib/builtin-exceptions|Built-in exceptions]]

> [!warning] try / except Exception: pass. Real bugs (NameError, AttributeError,
OSError) get swallowed; the program "works" but produces garbage. If you must
catch broadly, log and re-raise.

### [[Sections/core/stdlib/with-statement|with statement]]

> [!warning] returning True from __exit__ to "swallow this exception".
Almost always hides bugs. Return False (or omit return) and let the
exception propagate; if you must suppress, use contextlib.suppress with
the SPECIFIC exception type.

### [[Sections/core/stdlib/exceptions|Exception handling]]

> [!warning] try/except Exception: log.error(e). The traceback vanishes.
Use log.exception(...) (auto-includes traceback) or log.error("...",
exc_info=True). And re-raise unless you actually handled it.

### [[Sections/core/stdlib/main-guard|__name__ == "__main__"]]

> [!warning] putting top-level side effects (DB connections, file reads,
argparse) outside the guard. Any 'import mymod' triggers them — surprising
everyone, breaking test discovery, slowing imports.

### [[Sections/core/stdlib/pathlib-module|pathlib (Path Objects)]]

> [!warning] Path(user_input) without traversal validation. ".." segments
escape; absolute paths bypass the base entirely. Always safe_join into a
known sandbox before opening.

### [[Sections/core/stdlib/functools-partial-cache|functools (partial, lru_cache, reduce)]]

> [!warning] reduce(operator.add, xs) — built-in sum(xs) is the same and
faster. Reserve reduce for combiners with no built-in (set union, dict
merge, custom monoid).

### [[Sections/core/stdlib/collections-counter-deque|collections (Counter, defaultdict, deque, namedtuple)]]

> [!warning] writing your own counter via 'if k in d: d[k] += 1 else: d[k] = 1'.
Counter or defaultdict(int) makes the intent clear AND is faster.

### [[Sections/core/stdlib/context-managers-with|Context Managers (with statement)]]

> [!warning] __exit__ returns True. Suppresses ALL exceptions silently —
including ones you didn't expect. Return False (or omit return); use
contextlib.suppress with a specific type when you really mean to ignore.

### [[Sections/core/stdlib/itertools-module|itertools (Combinations, Permutations, Chain)]]

> [!warning] list(itertools.cycle(xs)) — hangs forever. ALWAYS bound infinite
iterators (count / cycle / repeat) with islice or break out of the loop.

### [[Sections/core/stdlib/re-module-regex|re Module (Regular Expressions)]]

> [!warning] using re.match where re.fullmatch is meant.
re.match anchors only at the START — `re.match(r"\d{3}", "1234abc")` succeeds because the
  prefix matches. For "validate the entire input is digits", use re.fullmatch (or anchor
  with \A...\Z). The bug is silent: validators pass on partial-match inputs and let bad
  data through. Even simpler: prefer re.fullmatch for ALL validators so anchoring is
  explicit and obvious. (See regex.js for the full discussion.)

### [[Sections/core/stdlib/logging-module|logging Module]]

> [!warning] f-string formatting in log calls. log.info(f"x={var}") evaluates
the f-string EVEN when the level is filtered. Use log.info("x=%s", var) so the
format is skipped when the message wouldn't be emitted.

### [[Sections/core/stdlib/argparse-cli|argparse (Command-Line Arguments)]]

> [!warning] reading sys.argv directly inside main() and never returning an
exit code. Tests can't drive the function with a custom argv, and shells
can't tell success from failure. main(argv=None) -> int is the contract.

### [[Sections/core/stdlib/typing-module-hints|typing Module (Type Hints)]]

> [!warning] Any everywhere "to make mypy happy". Any DISABLES all type
checking for that value — it doesn't make the bug go away, it hides it.
Either type it correctly, or use 'object' so callers must narrow before use.

## Pandas

### [[Sections/pandas/io/dataframe-constructor|pd.DataFrame()]]

> [!warning] building a DataFrame by repeated df.append() / pd.concat() in a loop
Each append re-allocates the whole frame -> O(n^2). For N rows of streaming
  data, accumulate in a list of dicts and call pd.DataFrame(records) ONCE at
  the end. The append() method itself was deprecated in pandas 2.0.

### [[Sections/pandas/io/series-constructor|pd.Series()]]

> [!warning] pd.Series([1, 2, None]) and expecting integer dtype
numpy int64 has no NaN; pandas silently upcasts to float64 — your "ints"
  become 1.0, 2.0, NaN. Use dtype="Int64" (the nullable extension type) when
  you need integers that survive missing values.

### [[Sections/pandas/io/read-csv|pd.read_csv()]]

> [!warning] pd.read_csv("big.csv") with default dtype inference on production data
pandas walks the file once just to GUESS dtypes (every column starts as object,
  then narrows). Pin dtype={"id": "int32", "city": "category"} up front: skips
  the inference pass AND keeps memory predictable. Combine with usecols= so you
  don't pay for columns you'll drop anyway.

### [[Sections/pandas/io/read-excel|pd.read_excel()]]

> [!warning] read_excel for files > 50 MB or in a hot path
openpyxl parses the entire XML zip into memory; expect 5-10x file size in
  RAM and seconds-per-file. For ETL, convert once to parquet then never touch
  the .xlsx again. If you must, try engine="calamine" (Rust-fast).

### [[Sections/pandas/io/read-sql|pd.read_sql()]]

> [!warning] f-string SQL building -> pd.read_sql(f"SELECT * FROM users WHERE id={uid}", conn)
Classic SQL injection. Use parameter substitution: pd.read_sql(
      "SELECT * FROM users WHERE id = :uid", conn, params={"uid": uid})
  The DBAPI handles quoting and types; you stay safe and your query plan is cacheable.

### [[Sections/pandas/io/read-parquet|pd.read_parquet()]]

> [!warning] round-tripping data through CSV instead of parquet
CSV strips dtypes, doesn't preserve nulls vs empty strings, can't store
  categoricals or datetimes natively. Every read pays the inference tax.
  Parquet is 5-20x smaller, 10-50x faster to read, and lossless on dtypes.
  Treat CSV as ingestion-only; parquet for everything internal.

### [[Sections/pandas/io/dtype-opt|dtype optimization]]

> [!warning] leaving everything as object dtype because "it works"
Object columns store Python pointers — 50-100 bytes per row vs 1 byte for category.
  A 10M-row DataFrame can drop from 4 GB to 200 MB just by tagging low-cardinality
  strings as category. Always inspect df.dtypes after load and convert before
  the data fans out across joins/groupbys.

### [[Sections/pandas/io/pd-eval|pd.eval()]]

> [!warning] reaching for pd.eval in Python loops
pd.eval shines on a SINGLE large expression (numexpr can vectorize and
  parallelize). In a loop the per-call parsing/JIT cost dominates. Use a
  single eval string for compound numeric expressions; for everything else
  stick to plain pandas vectorized ops.

### [[Sections/pandas/io/chunked-processing|Chunked processing]]

> [!warning] chunks = list(pd.read_csv(f, chunksize=n))
That materializes the entire file — defeats the purpose.

### [[Sections/pandas/inspection/info|.info()]]

> [!warning] relying on df.info() for memory budgeting without deep=True
Default info() reports POINTER size (8 bytes) for object columns, hiding
  the actual string content. A 1 GB-RAM DataFrame can show as 80 MB in info().
  Always call df.info(memory_usage="deep") or df.memory_usage(deep=True).sum().

### [[Sections/pandas/inspection/describe|.describe()]]

> [!warning] trusting describe() output as a normality / quality check
describe() reports mean and std even for skewed or bimodal data — meaningless
  for income, file sizes, latencies. Pair with .skew() / .kurt() and a histogram
  before drawing conclusions. For categorical data, describe() shows top/freq
  but hides distribution; use .value_counts(normalize=True).

### [[Sections/pandas/inspection/value-counts|.value_counts()]]

> [!warning] value_counts() with dropna default on data you suspect has NaNs
value_counts(dropna=True) (the default) silently hides null rows — your "100%
  coverage" claim ignores them. Always check df[col].isna().sum() alongside
  value_counts, or pass dropna=False when reporting frequencies.

### [[Sections/pandas/inspection/head-tail|.head() / .tail()]]

> [!warning] using df.head() as a sanity check on UNSORTED time-series data
The first 5 rows are file-order, not chronological order. Always sort
  (df.sort_values("ts").head()) before drawing conclusions about "the start"
  of a series. Same for "tail looks fine" — you're checking insertion order,
  not what's actually most recent.

### [[Sections/pandas/inspection/sample|.sample()]]

> [!warning] df.sample() without random_state in shareable analysis code
The "100 rows of weirdness" you screenshot today is gone tomorrow. Always
  pass random_state=N (any int) so the sample is reproducible. Coworkers
  running the same notebook get the same rows; bug reports stay reproducible.

### [[Sections/pandas/inspection/nunique|.nunique()]]

> [!warning] len(set(s)) instead of s.nunique() on big Series
Materializing a Python set forces every value through Python — orders of
  magnitude slower than nunique() (which uses pandas-native hashing) and
  doesn't honor dropna semantics. Always nunique() for cardinality counts.

### [[Sections/pandas/selection/loc|.loc[]]]

> [!warning] chained indexing for assignment -> df[mask][col] = value
pandas can't tell whether df[mask] is a view or a copy; the assignment may
  silently fail (SettingWithCopyWarning). Always use the SINGLE 2D access
  pattern: df.loc[mask, col] = value. Same for df.loc[mask][col] = ... — it's
  still chained. The 2D indexer is the only safe form.

### [[Sections/pandas/selection/iloc|.iloc[]]]

> [!warning] using iloc for "the row I just appended" without resetting index
df.iloc[len(df)-1] only equals "the last appended row" if the index is
  contiguous 0..n-1. After filtering, sorting, or merging, that's not true.
  Either use .loc with an explicit label, or reset_index(drop=True) right
  before the iloc call to guarantee positional == numeric label.

### [[Sections/pandas/selection/query|.query()]]

> [!warning] building query strings by f-string concatenation with user input
Same SQL-injection risk as raw SQL: df.query(f"name == '{user}'") on user
  = "x' or 1==1" gives you the full table. Use @-substitution instead:
  df.query("name == @user"). The local-variable form is parsed safely.

### [[Sections/pandas/selection/isin|.isin()]]

> [!warning] chaining many ORed equality checks instead of isin
df[(df.col == "a") | (df.col == "b") | (df.col == "c") | ...] is O(N*K)
  in Python attribute access. df[df.col.isin(["a","b","c",...])] is O(N) with
  a hash-set lookup. The readability and speed both improve.

### [[Sections/pandas/selection/between|.between()]]

> [!warning] (s >= lo) & (s <= hi) when between() exists
Functionally equivalent for closed ranges, but between() reads better and
  exposes the inclusive= parameter for half-open ranges (important for
  percentile cuts where the boundary semantic matters). Use between().

### [[Sections/pandas/selection/multiindex|MultiIndex]]

> [!warning] slicing a MultiIndex without sorting it first
Unsorted MultiIndex raises PerformanceWarning AND falls back to O(n) scans.
  Always df = df.sort_index() right after any operation that disturbs the
  index order (concat, append, certain merges). Check with df.index.is_monotonic_increasing.

### [[Sections/pandas/cleaning/isna|.isna()]]

> [!warning] comparing to NaN with == -> df[df.col == np.nan]
NaN != NaN by IEEE rules, so the mask is all False. You silently get an
  empty DataFrame and "no nulls" — even when half the column is NaN. Always
  use .isna() / .notna(); never compare with == np.nan.

### [[Sections/pandas/cleaning/duplicated|.duplicated() / .drop_duplicates()]]

> [!warning] drop_duplicates() without subset= when only some columns define identity
"Same user, same event, different timestamp" should NOT be deduped if you
  intended uniqueness on (user_id, event). Always pass subset=[...] to spell
  out what defines a duplicate; otherwise you're at the mercy of every column.

### [[Sections/pandas/cleaning/dropna|.dropna()]]

> [!warning] dropna() before joining when nulls are meaningful
Throwing away rows because col_X is null can hide systematic missingness
  (sensor offline, opt-out users). dropna() is destructive — first chart the
  missingness pattern (df.isna().mean()) and decide if drop, fill, or flag
  ("missing as a category") is right.

### [[Sections/pandas/cleaning/fillna|.fillna()]]

> [!warning] fillna(0) on a column that should have stayed null
Zero is a value, missing is the absence of one. Filling counts/IDs/log-values
  with 0 corrupts every downstream sum and average. Default to keeping nulls
  and only fill when the imputation rule is justified (constant for category,
  median for skewed numeric, ffill for time-series gaps).

### [[Sections/pandas/cleaning/astype|.astype()]]

> [!warning] astype("int") on a Series that has NaN
numpy int can't hold NaN — pandas raises (or worse, silently casts via float).
  Either fillna first (with a sentinel like -1) or use the nullable "Int64"
  dtype that natively supports missing values.

### [[Sections/pandas/cleaning/categorical|pd.Categorical]]

> [!warning] comparing a string-typed column to a categorical of the same values
The comparison silently returns all False — pandas treats them as different
  dtypes. Either convert both sides to category (sharing CategoricalDtype) or
  coerce both to plain string. Don't mix.

### [[Sections/pandas/cleaning/to-numeric|pd.to_numeric()]]

> [!warning] pd.to_numeric(s) without errors= on dirty data
Default errors="raise" blows up on the first bad row, mid-pipeline. Either
  pre-clean the strings, or use errors="coerce" to convert bad rows to NaN
  and report them downstream — visible bad data beats a silent crash.

### [[Sections/pandas/cleaning/to-datetime|pd.to_datetime()]]

> [!warning] parsing user-input dates without utc=True
Mixed timezones in a single column become object dtype (not datetime64),
  and any operation that expects datetime64 (resample, .dt.year) silently
  fails or coerces. Always pd.to_datetime(s, utc=True) on heterogeneous
  sources; convert to a display TZ only at the presentation layer.

### [[Sections/pandas/cleaning/str-accessor|.str accessor]]

> [!warning] regex=True (default) when matching a literal that contains regex metacharacters
s.str.contains("file.txt") matches "fileXtxt" because . means "any char".
  Always pass regex=False for literal matches, or escape with re.escape().
  The same applies to .replace and .extract — choose regex semantics deliberately.

### [[Sections/pandas/cleaning/dt-accessor|.dt accessor]]

> [!warning] applying string methods to a datetime column
s.str.startswith("2024") fails because the dtype is datetime64, not string.
  Use .dt accessor instead: s.dt.year == 2024. If you genuinely need string
  formatting, do it via s.dt.strftime("%Y-%m") then string ops on the result.

### [[Sections/pandas/transform/sort-values|.sort_values()]]

> [!warning] df.sort_values(...).iloc[0] when you want the min
You just paid O(n log n) to take one row. df.loc[df.x.idxmin()] is O(n).
  Same for "top 10": prefer .nlargest(10, col) over sort+head — both are
  correct, but nlargest uses a heap (O(n log k) vs O(n log n)) and is faster
  for k << n.

### [[Sections/pandas/transform/sort-index|.sort_index()]]

> [!warning] rolling/resample on a non-monotonic datetime index
pandas raises or returns garbage when the index isn't monotonic_increasing.
  After any concat / append / merge that disturbs index order, sort_index()
  before time-aware operations. Check with df.index.is_monotonic_increasing.

### [[Sections/pandas/transform/rename|.rename()]]

> [!warning] assigning df.columns = [...] when you only want to rename one column
Easy to mis-count the list and silently shift labels (col 5 becomes col 4's data).
  Always df.rename(columns={"a":"new_a"}) for targeted renames; reserve
  df.columns = [...] for full-list reassignments where order is intentional.

### [[Sections/pandas/transform/drop|.drop()]]

> [!warning] df.drop("x", axis=1) when columns= is clearer
axis=1 / axis=0 is error-prone (which is which?). Use the explicit
  keyword form: df.drop(columns=...) or df.drop(index=...). Same behavior,
  self-documenting code.

### [[Sections/pandas/transform/reset-set-index|.reset_index() / .set_index()]]

> [!warning] forgetting drop=True on reset_index after a filter
df[mask].reset_index() preserves the OLD index as a new column, polluting
  the schema. Use reset_index(drop=True) any time you don't actually need
  the old labels back.

### [[Sections/pandas/transform/nlargest-nsmallest|.nlargest() / .nsmallest()]]

> [!warning] df.sort_values(col, ascending=False).head(N) for tiny N on huge data
sort_values is O(n log n) over the WHOLE frame; nlargest(N, col) is O(n log N)
  via a heap. For N=10 on a 10M-row frame, that's a 6x speedup. Same correctness,
  better algorithm.

### [[Sections/pandas/transform/explode|.explode()]]

> [!warning] looping with iterrows() to flatten lists into rows
df.iterrows() is glacial. df.explode("items") does the same expansion in
  one C-level call — orders of magnitude faster, and preserves the rest of
  the row's columns automatically.

### [[Sections/pandas/transform/assign|.assign()]]

> [!warning] assign() for in-place mutation
df.assign(x=...) returns a new frame and DROPS THE RESULT if you don't bind.
  "df.assign(x=...)" alone is a no-op: assignments must be either df = df.assign(...)
  or chained. For mutation pick df["x"] = ... explicitly.

### [[Sections/pandas/transform/pipe|.pipe()]]

> [!warning] nested function calls instead of .pipe in long pipelines
foo(bar(baz(df.query(...).assign(...)))) reads inside-out and is hard to
  debug. df.query(...).assign(...).pipe(baz).pipe(bar).pipe(foo) reads
  left-to-right and lets you comment-out a single .pipe to bisect.

### [[Sections/pandas/transform/apply|.apply()]]

> [!warning] df.apply(lambda row: row.a + row.b, axis=1)
row-wise apply is a Python for-loop in disguise — orders of magnitude
  slower than the vectorized df.a + df.b. Reach for apply ONLY when no
  vectorized op exists; verify by profiling, not by habit.

### [[Sections/pandas/transform/map|.map()]]

> [!warning] s.map(dict) when the dict doesn't cover every value
Unmapped values become NaN — easy to lose silently. Either provide a default
  (s.map(d).fillna(s)) or use s.replace(d) which preserves unmapped values.
  Pandas 3.0 may also let you pass na_action="ignore" to keep originals.

### [[Sections/pandas/transform/groupby|.groupby()]]

> [!warning] looping over groups in Python with iterrows / for-each
for k, sub in df.groupby(g): out.append(sub.x.mean()) — you've reinvented
  .agg("mean") with 100x more Python overhead. Use df.groupby(g).x.mean()
  directly; iterate only when each group needs a custom non-vectorizable fn.

### [[Sections/pandas/transform/agg|.agg()]]

> [!warning] .agg with a lambda when a built-in shorthand exists
.agg(lambda x: x.mean()) — slow Python callable per group. Use the string
  shorthand .agg("mean") which dispatches to the C path — orders of magnitude
  faster on millions of groups.

### [[Sections/pandas/transform/transform|.transform()]]

> [!warning] groupby + apply when transform fits
apply returns groups assembled however the function returns them — easy to
  end up with a MultiIndex you didn't want. transform always returns the
  same shape and index as the input — the right tool for "broadcast group
  stat back to rows" cases (z-scoring, group-mean fillna, % of group total).

### [[Sections/pandas/transform/merge|pd.merge()]]

> [!warning] f-string composition of merge keys
pd.merge(df, other, on=f"{prefix}_id")    # silent typo risk
Right: validate= forces the schema contract to be explicit.

### [[Sections/pandas/transform/concat|pd.concat()]]

> [!warning] pd.concat([df1, df2]) without ignore_index= when
stacking. Original indexes are preserved -> duplicate index labels
silently break downstream .loc / .reindex calls.

### [[Sections/pandas/transform/pivot-table|.pivot_table()]]

> [!warning] pivot_table without specifying aggfunc when duplicates exist
pandas defaults to mean, silently averaging values you might have wanted
  summed (or counted). Always pass aggfunc explicitly: aggfunc="sum" / "count" /
  "first" — choose deliberately, document intent.

### [[Sections/pandas/transform/melt|.melt()]]

> [!warning] melt without id_vars / value_vars on wide tables
Default melt() folds EVERY column into one — including row id columns you
  needed to keep. Always specify id_vars=["id","date"] (the keys to preserve)
  and value_vars=[the wide cols you're unpivoting] for a predictable long form.

### [[Sections/pandas/transform/df-stack|.stack()]]

> [!warning] stack/unstack churn instead of pivot/melt
stack() and unstack() are matched-pair index<->columns reshapes; they're
  the right primitives, but pivot_table / melt are clearer when expressing
  "wide to long" (or back). Reach for stack/unstack only when the MultiIndex
  structure is the point; otherwise use the higher-level functions.

### [[Sections/pandas/transform/rolling|.rolling()]]

> [!warning] rolling on unsorted data
df["sales"].rolling(7).mean()    # nonsense if df isn't sorted
Always sort first; assert ts.index.is_monotonic_increasing in pipelines.

### [[Sections/pandas/transform/expanding|.expanding()]]

> [!warning] using expanding() on a non-monotonic time index
Expanding windows are inherently order-dependent — sort_index() FIRST so
  "all data up to now" actually means "all data with timestamp <= now".
  Same warning as rolling on time series.

### [[Sections/pandas/transform/shift|.shift()]]

> [!warning] cross-group shift
df["lag1"] = df["sales"].shift(1)
  when the data has multiple products -> lag1 of product B's first
  row is product A's last row. ALWAYS groupby-shift for multi-entity data.

### [[Sections/pandas/transform/cut|pd.cut()]]

> [!warning] pd.cut without watching include_lowest on the boundary
By default cut excludes the LOWER edge of the first bin: pd.cut([0,1,2], bins=[0,1,2])
  gives [NaN, (0,1], (1,2]]. Use include_lowest=True if 0 should fall in the
  first bin, or set the leftmost edge to -inf for safety.

### [[Sections/pandas/transform/qcut|pd.qcut()]]

> [!warning] pd.qcut on a column with many ties at the boundary
qcut tries to make equal-count bins, but ties cluster and can throw
  "Bin edges must be unique". Pass duplicates="drop" to merge collapsed bins,
  or rank the data first (s.rank(method="first")). Choose deliberately —
  "drop" silently reduces the number of returned categories.

## NumPy

### [[Sections/numpy/creation/np-array|np.array()]]

> [!warning] relying on inferred dtype for numeric pipelines
a = np.array([1, 2, 3])          # int64 on Linux/macOS, int32 on Windows
Always pin: np.array(..., dtype=np.int32)

### [[Sections/numpy/creation/np-zeros|np.zeros()]]

> [!warning] building arrays by appending
out = np.array([])
  for x in xs: out = np.append(out, fn(x))    # O(n^2) — copies every iteration
Right: pre-size with np.empty / np.zeros, then fill in-place.

### [[Sections/numpy/creation/np-ones|np.ones()]]

> [!warning] np.ones(shape) * value to fake a constant array
Two passes (allocate + multiply), obscures intent, can promote dtype
  silently (ones is float64; * int gives float64 again). Use
  np.full(shape, value, dtype=...) — one allocation, explicit value, no dtype drift.

### [[Sections/numpy/creation/np-arange|np.arange()]]

> [!warning] float arange in production
np.arange(0.0, 1.0, 0.1)        # off-by-one is implementation-defined
Use np.linspace(0, 1, 11) and trust the count.

### [[Sections/numpy/creation/np-linspace|np.linspace()]]

> [!warning] np.linspace(0, n-1, n) to get integer indices
Returns float64, costs 8N bytes, and you'll lose precision past 2**53.
  Use np.arange(n) — int dtype, half the memory, exact, and faster.

### [[Sections/numpy/creation/np-random|np.random.default_rng()]]

> [!warning] np.random.seed(42) + np.random.rand(...) (legacy global API)
Global RNG state is shared across threads, libraries, and notebooks — one
  stray call elsewhere reorders your sequence and breaks reproducibility.
  Use rng = np.random.default_rng(42) and pass rng explicitly through code.

### [[Sections/numpy/indexing/array-slicing|Array slicing]]

> [!warning] passing a non-contiguous slice to a C extension
torch.from_numpy(A[:, ::2])        # non-contiguous; may copy or fail
Right: torch.from_numpy(np.ascontiguousarray(A[:, ::2]))

### [[Sections/numpy/indexing/boolean-masking|Boolean masking]]

> [!warning] using Python and/or/not (or missing parens) on array conditions
scores[scores > 0 and scores < 10]   # ValueError: ambiguous truth value
  scores[scores > 0 & scores < 10]     # wrong precedence; evaluates 0 & scores
  The bitwise ops &/|/~ have LOWER precedence than comparison, so each
  comparison must be parenthesized: scores[(scores > 0) & (scores < 10)].

### [[Sections/numpy/indexing/fancy-indexing|Fancy indexing]]

> [!warning] nested fancy indexing without np.ix_
A[[0, 2, 3]][:, [1, 4]]               # creates an intermediate copy
Right:
  A[np.ix_([0, 2, 3], [1, 4])]          # one selection, no intermediate

### [[Sections/numpy/indexing/np-unique|np.unique()]]

> [!warning] list(set(arr.tolist())) to deduplicate a NumPy array
Round-trips through Python objects (slow + extra memory), loses sort
  order, and breaks dtype (everything becomes Python int/float). Use
  np.unique(arr) — vectorized, dtype-preserving, sorted.

### [[Sections/numpy/indexing/np-where|np.where()]]

> [!warning] np.where(cond, expensive_a(x), expensive_b(x))
np.where is NOT short-circuiting — both branches are fully computed for
  every element, then combined. If a branch is expensive or has side
  effects (warnings, divide-by-zero), pre-compute via masked indexing
  instead: out = np.empty_like(x); out[cond] = a(x[cond]); out[~cond] = b(...).

### [[Sections/numpy/operations/vectorized-ops|Vectorized operations]]

> [!warning] np.vectorize(fn) thinking it gives speed
np.vectorize is a CONVENIENCE wrapper around a Python for-loop — it does
  NOT release the GIL or use C code. It is sometimes 100x slower than the
  equivalent ufunc/np.where formulation. Refactor the function in terms of
  array ops (np.where, np.select, ufuncs); only fall back to np.vectorize
  for genuinely scalar-only logic where speed doesn't matter.

### [[Sections/numpy/operations/np-clip|np.clip()]]

> [!warning] np.minimum(np.maximum(a, lo), hi) instead of np.clip
Two passes, two temporaries, less readable, and slightly slower than the
  single np.clip call. Worse, it's easy to get the order wrong (max/min
  swapped) — the bug is silent. Use np.clip(a, lo, hi) as the primary clamp.

### [[Sections/numpy/operations/broadcasting|Broadcasting]]

> [!warning] using axis= without keepdims=True
bad = a - a.mean(axis=1)              # ValueError — shape mismatch
right = a - a.mean(axis=1, keepdims=True)

### [[Sections/numpy/operations/np-meshgrid|np.meshgrid()]]

> [!warning] dense np.meshgrid for a 1000x1000 grid you only sum over
meshgrid(x, y) without sparse=True allocates two N*M float64 arrays
  (16 MB each at 1000x1000, gigabytes at 10000x10000). For element-wise
  evaluation of f(x, y), use sparse=True or skip meshgrid entirely:
  Z = f(x[None, :], y[:, None]) broadcasts with no extra allocation.

### [[Sections/numpy/operations/np-nan|np.nan handling]]

> [!warning] comparing with == np.nan
a[a == np.nan]                   # always empty
Right: a[np.isnan(a)]

### [[Sections/numpy/operations/aggregations|Aggregations]]

> [!warning] int32 .sum() over a large array silently overflowing
big = np.full(10**8, 30, dtype=np.int32); big.sum()  # wraps past 2**31
  The result is a wrong, deterministic-looking integer with no warning.
  Pin accumulator dtype: big.sum(dtype=np.int64), or upcast first
  (big.astype(np.int64).sum()). Same applies to float32 * very-long means.

### [[Sections/numpy/operations/np-diff|np.diff()]]

> [!warning] forgetting np.diff shrinks the array, then misaligning indices
diffs = np.diff(prices); pct = diffs / prices  # ValueError or wrong:
  diffs has length N-1, prices has length N. The pct change is
  diffs / prices[:-1] (or [1:] depending on convention). When in doubt
  use prepend= to keep the original length, or step up to pandas .pct_change().

### [[Sections/numpy/operations/np-argmax|np.argmax() / np.argmin()]]

> [!warning] np.argmax(A) on a 2D array expecting per-row indices
Without axis=, argmax returns a single FLAT index over the whole array,
  which is almost never what the caller wanted. For per-row max use
  A.argmax(axis=1); for per-column use axis=0; if you really did want a
  global 2D position, pair argmax with np.unravel_index(idx, A.shape).

### [[Sections/numpy/operations/np-sort|np.sort() / np.argsort()]]

> [!warning] sorted(arr.tolist()) on a NumPy array
Round-trips through Python objects: O(n) box/unbox, loses dtype
  (int64 -> Python int), allocates a Python list, then forces a back-copy
  if you need an ndarray. np.sort(arr) is dtype-preserving, vectorized,
  and 5-50x faster on numeric arrays. Same for np.argsort over sorted(...).

### [[Sections/numpy/operations/np-linalg|np.linalg]]

> [!warning] x = np.linalg.inv(A) @ b
Computing the explicit inverse is both slower (forms a full matrix) AND
  numerically less stable (amplifies ill-conditioning) than np.linalg.solve.
  It only ever wins if you reuse inv(A) against many b vectors at once —
  even then, factorize once with scipy.linalg.lu_factor and reuse the LU.

### [[Sections/numpy/operations/np-einsum|np.einsum()]]

> [!warning] reaching for einsum for ops that have a simpler builtin
np.einsum("i,i->", v, w)         # use np.dot(v, w)
  np.einsum("ij->ji", A)           # use A.T
  np.einsum("ij->j", A)            # use A.sum(axis=0)
  einsum is slower for these (no BLAS dispatch in the simple case) and
  harder to read at a glance. Save einsum for genuinely multi-axis ops.

### [[Sections/numpy/operations/np-dtype-perf|dtype optimization]]

> [!warning] pre-emptively rewriting numpy code in numba/cython "for speed"
The optimization order is: (1) profile to confirm the bottleneck,
  (2) try plain numpy vectorization (often gets 90%), (3) numexpr or numba
  only for proven hot paths. Jumping to numba/cython first costs build
  complexity and dependencies for code that wasn't actually the bottleneck.

### [[Sections/numpy/shape/reshape|np.reshape()]]

> [!warning] assuming reshape is free
reshape on a non-contiguous strided view -> may COPY silently
Right: check .flags["C_CONTIGUOUS"] when handing buffers across
library boundaries (torch.from_numpy, ctypes, cython).

### [[Sections/numpy/shape/np-stack|np.stack()]]

> [!warning] growing a batch via repeated np.stack/np.concatenate in a loop
batch = np.empty((0, 64, 64))
  for s in samples:
      batch = np.concatenate([batch, s[None]], axis=0)   # O(n^2) — copies every iter
  Right: collect into a Python list and stack ONCE at the end, OR pre-allocate
  np.empty((N, 64, 64), dtype=...) up front and write batch[i] = s.

### [[Sections/numpy/shape/np-concatenate|np.concatenate()]]

> [!warning] out = np.array([]); for c in chunks: out = np.concatenate([out, c])
Each iteration allocates a NEW array of the cumulative size and copies
  everything seen so far — total O(n^2) work and O(n) peak memory churn.
  Fix: append to a Python list and call np.concatenate(parts) ONCE at the
  end, or pre-allocate np.empty(total_len) and slice-assign each chunk.

### [[Sections/numpy/shape/np-tile|np.tile()]]

> [!warning] np.tile(weights, (N, 1)) just to multiply a (N, k) matrix
X * np.tile(weights, (N, 1))   # allocates an N*k copy of weights
  Broadcasting does the same math for free: X * weights — NumPy virtually
  expands the 1D vector along the leading axis with zero allocation. Only
  reach for tile when a downstream consumer (C code, CSV writer, in-place
  sink) genuinely needs a contiguous repeated buffer.

### [[Sections/numpy/shape/np-repeat|np.repeat()]]

> [!warning] np.repeat(weights[None, :], n_rows, axis=0) to broadcast-prep
Materializes a real (n_rows, k) copy of weights just to multiply against
  X of the same shape. NumPy already broadcasts the 1D weights for free —
  X * weights does the same math with zero extra allocation. Only use
  np.repeat when you genuinely need the expanded values stored (e.g. as a
  label vector aligned with another array).

## Seaborn

### [[Sections/seaborn/distributions/histplot|sns.histplot()]]

> [!warning] comparing histograms of groups with very different sample sizes using default counts.
Default stat="count" makes the larger group look taller everywhere even when shapes
  are identical. Always set stat="density" with common_norm=False so each group integrates
  to 1 independently — then bar heights reflect shape, not N.

### [[Sections/seaborn/distributions/kdeplot|sns.kdeplot()]]

> [!warning] trusting a default-bandwidth KDE on a multimodal distribution.
The default bandwidth heuristic over-smooths and silently merges peaks. Always sweep
  bw_adjust over {0.5, 1.0, 1.5} and overlay a rugplot or histplot — if peaks appear/
  vanish across bandwidths, the KDE alone is lying. Reach for histplot to confirm.

### [[Sections/seaborn/distributions/ecdfplot|sns.ecdfplot()]]

> [!warning] comparing two histograms with different N when the real question is "are these
distributions different?".
  Histogram bar heights conflate sample size with density and binning amplifies noise. ECDFs
  need no bins, scale identically across N, and let you read quantiles directly off the y axis.
  Default to ecdfplot(hue=...) for distribution comparisons; reach for histplot only when the
  audience needs the familiar bar shape.

### [[Sections/seaborn/distributions/rugplot|sns.rugplot()]]

> [!warning] using rugplot as the standalone visualization.
Rugplot only encodes location, not density — adjacent ticks visually merge and you lose all
  sense of shape. It is an OVERLAY on kdeplot/ecdfplot/scatterplot. If you need a primary
  "show me the points" chart, reach for stripplot (categorical) or histplot (continuous).

### [[Sections/seaborn/distributions/displot|sns.displot()]]

> [!warning] passing ax= to displot to embed it in a plt.subplots() grid.
displot is figure-level — it OWNS its figure and ax= raises a TypeError. Either switch
  to sns.histplot(ax=ax) for one panel inside a custom grid, or commit fully to displot
  and customize via the returned FacetGrid (g.set_titles, g.figure, g.axes.flat).

### [[Sections/seaborn/categorical/boxplot|sns.boxplot()]]

> [!warning] boxplot on a multimodal distribution.
The five-number summary collapses two peaks into a single IQR — the chart looks unimodal
  and hides the structure that matters. If a kdeplot or histogram of one group shows >1 peak,
  switch to violinplot (or violin+stripplot overlay). Boxplot only honestly represents
  roughly-unimodal data.

### [[Sections/seaborn/categorical/violinplot|sns.violinplot()]]

> [!warning] drawing a violinplot when each group has fewer than ~20 points.
The KDE underneath is fitted from too few samples; the resulting smooth shape is mostly
  bandwidth artifact and misleads viewers into seeing modes that aren't there. For small N
  per group, prefer stripplot/swarmplot (every dot visible) optionally overlaid on a
  thin boxplot — the data speaks for itself without inventing a density.

### [[Sections/seaborn/categorical/stripplot|sns.stripplot()]]

> [!warning] leaving size= and alpha= at their defaults on medium-to-large N.
Default size=5 with full opacity becomes a solid colored bar at a few hundred points and
  you lose all density information. The fix is a coordinated turn-down: size=2-3 with
  alpha=0.3-0.5 and a narrower jitter=0.25. If even that still looks like a bar, you have
  crossed into violin/box territory.

### [[Sections/seaborn/categorical/swarmplot|sns.swarmplot()]]

> [!warning] swarmplot on a 10k-row DataFrame and ignoring the placement warning.
The beeswarm algorithm is O(n^2) per category; on large N seaborn emits "X% of the
  points cannot be placed" and silently drops them. The chart is now both slow AND a lie
  about your data. Switch to stripplot(size=2, alpha=0.3) above ~500 per group, or
  summarize with violin/box above ~5000.

### [[Sections/seaborn/categorical/barplot|sns.barplot()]]

> [!warning] passing already-aggregated totals to sns.barplot expecting it to "just plot".
barplot will recompute the mean of your single-row-per-category column — for one row
  that's the value itself, but the CI bar collapses to 0 and the chart implies "no
  uncertainty" when really there's no replication. For pre-summed data use ax.bar()
  directly; reach for barplot only when seaborn should do the aggregation.

### [[Sections/seaborn/categorical/countplot|sns.countplot()]]

> [!warning] leaving order at default (alphabetical / first-seen) on countplot.
Seaborn sorts categories alphabetically, which buries the dominant class and forces
  the eye to scan back and forth. ALWAYS pass order=df[col].value_counts().index for
  most-to-least, or your domain's canonical ordering. Same fix applies to barplot,
  boxplot, and violinplot — explicit order= is the rule.

### [[Sections/seaborn/categorical/pointplot|sns.pointplot()]]

> [!warning] pointplot with a connecting line between unordered nominal categories
(city names, product SKUs, treatment groups).
  The line implies a trend "City A -> City B -> City C" that has no meaning — readers
  anchor on the slope and infer ordering that doesn't exist. For nominal x reach for
  barplot or boxplot. Reserve pointplot for x with genuine ordinal/temporal structure
  (dose level, year, time-of-day).

### [[Sections/seaborn/relational/scatterplot|sns.scatterplot()]]

> [!warning] encoding 8+ categories via hue on a single scatter.
Beyond ~6 colors the legend becomes a key the reader has to memorize and adjacent points
  from different groups are visually indistinguishable. The fixes, in order: drop to <=6
  categories with "Other" lumping, split via style= for a second dim, or facet with
  relplot(col=..., col_wrap=N) — small multiples scale where one packed scatter doesn't.

### [[Sections/seaborn/relational/lineplot|sns.lineplot()]]

> [!warning] passing wide-form / unsorted data to lineplot and expecting "connect the dots".
Seaborn aggregates duplicate x values into mean+95% CI by default — the chart you get is
  NOT a connection of your raw rows. Either sort_values(x) and set estimator=None for a true
  polyline, or accept the aggregation and check errorbar= matches the band you intend.
  If you truly want one line per subject, units="subject_id" + estimator=None.

### [[Sections/seaborn/relational/relplot|sns.relplot()]]

> [!warning] trying to embed a relplot grid inside a custom plt.subplots() layout.
relplot is figure-level — it OWNS its figure and ax= raises a TypeError. If you need
  the small-multiples grid, commit to relplot and customize via the FacetGrid (g.set_titles,
  g.refline, g.figure.suptitle). If you need a tight matplotlib subplot layout, use the
  axes-level scatterplot/lineplot with ax= per cell instead.

### [[Sections/seaborn/relational/catplot|sns.catplot()]]

> [!warning] catplot inside plt.subplots() expecting it to land in one cell.
catplot is figure-level — it builds its own Figure and silently produces a SECOND figure
  while leaving your subplots cell empty. The fix: pick the matching axes-level function
  (boxplot, violinplot, stripplot, ...) with ax=axes[i,j] when integrating into a custom
  layout. Reach for catplot only when you want the small-multiples grid it builds.

### [[Sections/seaborn/relational/regplot|sns.regplot()]]

> [!warning] trusting the regplot line+CI band without ever looking at residuals.
regplot fits a model and draws a line — it cannot tell you if the linear assumption
  is correct. Curved residuals mean the line is the wrong shape; fan-shaped residuals
  mean heteroscedasticity invalidates the CI. ALWAYS pair regplot with residplot(lowess=True);
  if the residual lowess line is not flat at zero, switch to order=2 / lowess=True / log(y).

### [[Sections/seaborn/relational/lmplot|sns.lmplot()]]

> [!warning] showing four lmplot panels with visibly different slopes and concluding
"groups have different slopes" without a statistical test.
  The CI bands often overlap once you actually look at the numbers — the visual is
  suggestive, not conclusive. The right pipeline is: lmplot for the picture, then
  smf.ols("y ~ x * group", data=df) and inspect the interaction coefficient + p-value.
  robust=True helps if outliers are bending the OLS slope.

### [[Sections/seaborn/relational/residplot|sns.residplot()]]

> [!warning] skipping residplot after sns.regplot and reporting an R^2 from a clearly
misspecified linear fit.
  regplot will happily fit a line through quadratic data; the R^2 looks decent but
  residuals show the curve. Without residplot you'll publish "y is linearly related to x"
  when the true model is order=2 or log(x). The residual lowess line should be flat at
  y=0 with constant spread — anything else means "the model is wrong, transform something".

### [[Sections/seaborn/matrix/heatmap|sns.heatmap()]]

> [!warning] using a sequential colormap (Blues, viridis) on a correlation matrix.
Correlation ranges from -1 to +1 — a sequential cmap maps 0 (no relationship) to a
  nondescript mid-color and -0.8 reads as a small value next to +0.8. The fix is always
  diverging (RdBu_r / coolwarm) with center=0, vmin=-1, vmax=1. Same trap on any signed
  pivot table; only unsigned magnitudes get sequential.

### [[Sections/seaborn/matrix/pairplot|sns.pairplot()]]

> [!warning] calling pairplot on a 50k-row, 30-column DataFrame and walking away.
You'll get an N x M scatter grid that hangs Jupyter, then renders cells too small to
  read. Always: (1) SAMPLE first via df.sample(2000, random_state=42); (2) use vars=
  to cap at 4-6 of the most relevant columns; (3) reach for PairGrid + map_lower(kdeplot)
  when scatter overplotting eats the signal.

### [[Sections/seaborn/matrix/jointplot|sns.jointplot()]]

> [!warning] passing hue= to jointplot expecting per-group color.
jointplot does NOT support hue= and silently ignores it (older versions raised; newer
  versions warn). The escape hatch is sns.JointGrid + a per-group loop calling
  sns.scatterplot(ax=g.ax_joint) and sns.kdeplot(ax=g.ax_marg_x / ax_marg_y) explicitly.
  Reach for sns.displot or sns.relplot if you need a grid of grouped joint plots.

### [[Sections/seaborn/matrix/pairgrid|sns.PairGrid()]]

> [!warning] fighting pairplot's symmetric API to get scatter above and KDE below.
pairplot only accepts one plot kind across the whole grid — there is no
  "different upper/lower" knob. People hack it with vars= twice or two pairplots.
  The right tool is sns.PairGrid: g.map_upper(scatterplot), g.map_lower(kdeplot),
  g.map_diag(histplot) — a few extra lines but the grid does what you actually want.

### [[Sections/seaborn/matrix/clustermap|sns.clustermap()]]

> [!warning] clustermap on a raw feature matrix without standardization.
If one column is "income in dollars" (1e5 scale) and another is "satisfaction 1-5",
  the distance metric is dominated by the high-magnitude column and clusters reflect
  that single feature. ALWAYS pass z_score=0 (standardize per row) or standard_scale=1
  (rescale per column) when feature scales differ. For correlation matrices already in
  [-1, 1], skip standardization (z_score=None) and use diverging cmap.

### [[Sections/seaborn/matrix/facetgrid|sns.FacetGrid()]]

> [!warning] g.map(sns.histplot, "total_bill") instead of g.map_dataframe(sns.histplot, x="total_bill").
g.map passes columns as positional 1-D arrays — modern seaborn functions expect data=
  plus x=/y= keyword args and silently misread or raise. The rule: use g.map_dataframe()
  for any seaborn function (it gets the full DataFrame subset), and reserve g.map() for
  raw matplotlib callables like plt.scatter.

### [[Sections/seaborn/setup-customization/labels-axes|Axes-level labels]]

> [!warning] setting axis labels BEFORE the seaborn plot call.
Some seaborn functions reset xlabel/ylabel internally — anything you set first gets
  silently overwritten when the plot draws. The rule is plot first, customize second:
  sns.boxplot(...ax=ax) first, then ax.set(xlabel=..., ylabel=...). Same trap with
  ax.set_xticks() before a categorical seaborn call that re-numbers the axis.

### [[Sections/seaborn/setup-customization/labels-figure|Figure-level labels]]

> [!warning] plt.title("Bills by Day") after a sns.catplot call.
plt.title targets the "current axes" — on a FacetGrid that's the LAST drawn panel
  only, so your title lands above one cell instead of the whole figure. The fix:
  g.figure.suptitle(...). Same trap with plt.savefig (saves only the last figure if
  another figure was created since); use g.savefig() to save the FacetGrid you built.

### [[Sections/seaborn/setup-customization/savefig-seaborn|plt.savefig()]]

> [!warning] fig.savefig("plot.png") with no bbox_inches and no plt.close.
Without bbox_inches="tight", long axis/title labels get clipped at the figure edge
  and you only see it after opening the file. Without plt.close(fig) in a loop,
  matplotlib keeps every Figure in memory and Jupyter eventually OOMs around 50-100
  plots. Always: fig.savefig("p.png", dpi=150, bbox_inches="tight"); plt.close(fig).

### [[Sections/seaborn/setup-customization/despine|sns.despine()]]

> [!warning] calling sns.despine() BEFORE the seaborn plot.
despine acts on the current Axes — if you call it before drawing, it operates on
  nothing (or the previous figure's axes) and your plot keeps all four spines. The
  correct order is: plot first, despine() last. On a FacetGrid use g.despine() instead
  of sns.despine() — the global call only touches one panel.

### [[Sections/seaborn/setup-customization/set-theme|sns.set_theme()]]

> [!warning] calling sns.set_theme() inside helper functions or in the middle of a notebook.
set_theme mutates global matplotlib state — every plot AFTER the call inherits it,
  including plots in unrelated downstream cells. The two safe patterns are: (1) call
  set_theme exactly once at the top of the notebook / setup module; (2) for transient
  styling use a "with sns.axes_style(...)" or "with plt.rc_context({...})" block so
  changes don't leak.

### [[Sections/seaborn/setup-customization/color-palette|sns.color_palette()]]

> [!warning] using a qualitative palette ("deep", "Set1", "tab10") for a heatmap or
any ordered/magnitude data.
  Qualitative palettes have no perceptual order — adjacent values get unrelated colors
  and the reader cannot tell "is this bigger or smaller?" from the chart. Always match
  palette family to data: sequential (viridis) for unsigned magnitude, diverging (RdBu)
  for signed data centered at 0, qualitative (colorblind) only for categories.

### [[Sections/seaborn/setup-customization/fig-vs-axes|Figure-level vs axes-level]]

> [!warning] trying to place sns.displot/relplot/catplot inside plt.subplots(1, 2) cells.
Figure-level functions OWN their figure — passing ax= raises TypeError, and even if
  you skip ax= the call creates a SECOND, separate figure and your subplots cell stays
  empty. The fix is to pick the matching axes-level function (histplot, scatterplot,
  lineplot, boxplot, ...) with ax=axes[i, j], or commit fully to the figure-level
  FacetGrid and customize via g.* methods.

## Matplotlib

### [[Sections/matplotlib/chart-types/line|ax.plot()]]

> [!warning] mixing plt.* state-machine calls with the OO API on multi-axes figures.
Code like fig, ax = plt.subplots(); ax.plot(...); plt.title("X") sets the title on
  whatever axes was created LAST, not on ax. The fix is total commitment to the OO API:
  ax.set_title, ax.set_xlabel, fig.savefig — never plt.title / plt.xlabel / plt.savefig.

### [[Sections/matplotlib/chart-types/bar|ax.bar()]]

> [!warning] rotating x-tick labels 45-90 degrees instead of switching to barh.
When labels overlap on a vertical bar chart, the instinct is tick_params(rotation=45).
  Rotated text is harder to read AND eats vertical space. The right fix is ax.barh —
  labels become horizontal and there's no width budget to fight over.

### [[Sections/matplotlib/chart-types/barh|ax.barh()]]

> [!warning] forgetting ax.invert_yaxis() on a sorted ranking. Without inversion,
the largest bar is at the BOTTOM (matplotlib's default y origin). Western readers
  scan top-to-bottom, so they read the smallest first. Always pair sort + invert_yaxis
  for ranking charts; otherwise pick ax.bar instead.

### [[Sections/matplotlib/chart-types/hist|ax.hist()]]

> [!warning] comparing two histograms drawn at different bin counts or ranges.
Calling ax.hist(a, bins=20) then ax.hist(b, bins=50) makes the bars different widths,
  so apparent "tallness" reflects bin width as much as data. Always pin shared bin edges
  (bins=np.linspace(lo, hi, k)) when comparing groups, and density=True if sample sizes
  differ.

### [[Sections/matplotlib/chart-types/scatter|ax.scatter()]]

> [!warning] using c="red" (single color) when the user likely meant cmap encoding.
The c= argument is overloaded — c="red" sets every point red, but c=values + cmap=
  maps to a colorbar. People copy "c=red" then later try c=df["score"] expecting a
  gradient and get a confusing error or solid color. Use color="red" for solid; reserve
  c= for numeric arrays driving a colormap.

### [[Sections/matplotlib/chart-types/imshow|ax.imshow()]]

> [!warning] leaving aspect="equal" (the default) on a non-image array, producing
a tall sliver or wide stripe when rows != cols. For arbitrary 2D arrays that are
  NOT images, pass aspect="auto" so the heatmap fills the axes. Reserve aspect="equal"
  for actual images and confusion matrices where square cells matter.

### [[Sections/matplotlib/chart-types/twinx|ax.twinx()]]

> [!warning] drawing a single combined legend by calling ax1.legend() then
ax2.legend() — you get TWO overlapping legend boxes. The fix is to gather
  handles+labels from both axes and pass them to one legend call:
  h1, l1 = ax1.get_legend_handles_labels(); h2, l2 = ax2.get_legend_handles_labels();
  ax1.legend(h1+h2, l1+l2). Equally common: forgetting to color-code the y-tick labels
  so readers can't tell which line maps to which scale.

### [[Sections/matplotlib/chart-types/fill-between|ax.fill_between()]]

> [!warning] forgetting interpolate=True with where=. When fill_between is masked by
a boolean (e.g. where=(y >= 0)), the fill ends at sample points, not at the actual
  zero crossings — leaving visible "stairsteps" exactly where the curve crosses. Setting
  interpolate=True linearly interpolates between samples to find the true crossing and
  produces a clean shaded region.

### [[Sections/matplotlib/chart-types/errorbar|ax.errorbar()]]

> [!warning] plotting yerr=df["std"] without saying what the bars mean. A reader
can't tell std (sample variability) from SEM (precision of the mean) from a 95% CI
  (inferential range) — they're often 4x apart. Always label: "error bars: 1 SD",
  "error bars: 95% CI". For dense time series, also pick line + fill_between rather
  than 200 caps that collapse into noise.

### [[Sections/matplotlib/chart-types/axhline|ax.axhline()]]

> [!warning] using ax.plot([xmin, xmax], [y, y]) for a "horizontal line". When the
x-axis limits change (zoom, new data, autoscale), the segment doesn't extend — you
  get a stub. ax.axhline always spans the full axes width and survives autoscale. Same
  trap with xmin/xmax: those are AXES FRACTION (0..1), not data coords — easy to confuse.

### [[Sections/matplotlib/chart-types/axvline|ax.axvline()]]

> [!warning] passing an integer to axvline on a datetime x-axis. Matplotlib will
silently interpret 5 as 1970-01-06 (5 days from epoch), placing the line off-screen
  or in the wrong year. Always match the data's units: pd.Timestamp("2020-03-01") for
  datetime, plain numbers for numeric axes. Same trap with axvspan(xmin, xmax).

### [[Sections/matplotlib/figures-layouts/gridspec|GridSpec]]

> [!warning] hand-tuning hspace/wspace until it "looks right". GridSpec spacing is
sensitive to figsize, dpi, and label length — what looks good in your notebook
  clips on a slide. Use layout="constrained" (or constrained_layout=True) on the
  Figure and let matplotlib compute spacing from real label sizes. Reach for hspace
  only when constrained layout still doesn't fit.

### [[Sections/matplotlib/figures-layouts/subplot-mosaic|plt.subplot_mosaic()]]

> [!warning] indexing the mosaic axes by position (axd[0], axd[1, 0]) like a NumPy
grid. subplot_mosaic returns a dict keyed by your panel letters — axd["A"], axd["B"].
  Treating it like an array silently raises KeyError or returns the wrong panel after
  a layout edit. The named-axes pattern is the entire point: rename a panel and your
  code still tracks it.

### [[Sections/matplotlib/figures-layouts/anatomy|Figure & Axes]]

> [!warning] using plt.title / plt.xlabel / plt.savefig in a function that creates
subplots. The plt.* state machine targets the most-recently-created axes, so
  plt.title("A") after fig, axes = plt.subplots(1,2) sets the title on axes[1] (or
  nothing predictable). Always call methods on the explicit ax/fig objects you got
  back from plt.subplots — never reach for plt.gca() / plt.gcf() in production code.

### [[Sections/matplotlib/figures-layouts/subplots|plt.subplots()]]

> [!warning] forgetting that axes is 1D for plt.subplots(1, N) but 2D for
plt.subplots(M, N) with M>1 — code written for axes[0, 0] crashes when N or M
  becomes 1. Either standardize on squeeze=False (always 2D), or use axes.flat
  to iterate without caring about shape. Also: calling plt.tight_layout() AFTER
  plt.show() — show() flushes the figure first, so the layout fix is a no-op.

### [[Sections/matplotlib/figures-layouts/figsize|Figure size and DPI]]

> [!warning] setting rcParams globally in a notebook
plt.rcParams["figure.figsize"] = (12, 7)        # leaks to next cells
Use rc_context for one-off changes.

### [[Sections/matplotlib/styling/labels|Labels & titles]]

> [!warning] calling ax.set_xticklabels([...]) WITHOUT first calling ax.set_xticks([...]).
The labels are written at whatever default tick positions matplotlib chose — often the
  wrong cells or shifted off-by-one. Recent matplotlib raises a UserWarning here. Always
  pair them: ax.set_xticks([1, 2, 3]); ax.set_xticklabels(["A", "B", "C"]). For
  categorical bar charts, prefer passing string x values directly to ax.bar.

### [[Sections/matplotlib/styling/annotate|ax.annotate()]]

> [!warning] looping over every data point with ax.annotate to label them all.
The labels stack on top of each other and the chart becomes a black blob. Limit
  manual annotation to 3-5 hot points (peaks, anomalies, outliers). For dense labeling
  reach for the adjustText library, or switch to a hover-tooltip backend (mpld3,
  plotly) where labels are interactive.

### [[Sections/matplotlib/styling/legend|ax.legend()]]

> [!warning] calling ax.legend() with no label= on any plot call. The call returns
silently (and with a UserWarning) — you get a tiny empty box or nothing. Always
  pass label="..." on each plot/bar/scatter call BEFORE calling ax.legend(). Same
  trap with two ax.legend() calls in the same axes — only the second one survives
  (the first is replaced); use a single legend with combined handles instead.

### [[Sections/matplotlib/styling/tick-formatting|Tick formatting]]

> [!warning] setting ax.set_xticklabels(["A", "B", "C"]) without calling
ax.set_xticks([0, 1, 2]) first. The labels attach to whatever default ticks
  matplotlib chose during autoscaling, so labels can shift, repeat, or fall off
  the axis (and recent versions raise a UserWarning). Always pair them, or use a
  FixedLocator + FixedFormatter, or pass string x values directly to ax.bar/plot
  so matplotlib handles the categorical mapping.

### [[Sections/matplotlib/styling/colormaps|Colormaps]]

> [!warning] using "jet" or "rainbow" because they're "colorful". They are NOT
perceptually uniform — yellow stripes look like local maxima, and the brightness
  curve dips and peaks across the range, fabricating features that aren't in the data.
  Worse: they fail in greyscale and for colorblind viewers. Default to viridis; reach
  for jet only when matching legacy publications, never for new analysis.

### [[Sections/matplotlib/styling/colorbar|fig.colorbar()]]

> [!warning] omitting cbar.set_label("...") so readers see a colored strip with
numbers but no clue what the colors mean. A colorbar without a label is dishonest —
  you've removed the encoding key. Equally common: calling plt.colorbar() without
  ax= in a multi-subplot figure, which attaches the bar to the most recently active
  axes (often the wrong one) and can resize that subplot.

### [[Sections/matplotlib/styling/savefig|plt.savefig()]]

> [!warning] plt.show() before plt.savefig()
plt.show() clears the figure on some backends -> save is BLANK
Right: save first, show last.

### [[Sections/matplotlib/styling/styles|Styles & Themes]]

> [!warning] plt.style.use() inside a function
def make_plot(...): plt.style.use("dark_background")
  This MUTATES global state for every subsequent caller.
Right: use plt.style.context(...) (with-statement) instead.

## Object-Oriented Python

### [[Sections/oop/classes/class-def|class definition]]

> [!warning] hand-rolling __init__/__repr__/__eq__ for every value class
People write 30 lines of boilerplate to set self.x = x for five fields,
  then forget __eq__ so equality compares identity. @dataclass generates
  all three correctly from type hints. Reach for it whenever the class is
  mostly "data + a couple of methods".

### [[Sections/oop/classes/class-instance-vars|Class vs instance variables]]

> [!warning] mutable class variable used as a per-instance default
Writing class Foo: items = [] feels harmless until two instances share
  the same list and one append() leaks into the other. Initialize mutable
  state on self inside __init__, and reserve class variables for true
  constants and explicitly-shared registries.

### [[Sections/oop/classes/inheritance|Inheritance]]

> [!warning] deep inheritance hierarchies for code reuse
When Dog -> Mammal -> Animal -> LivingThing exists only so each level
  contributes one helper, the hierarchy becomes a maze that subclasses
  can't override safely. Prefer composition: hold a helper as an
  attribute, or pull the shared logic into a small mixin.

### [[Sections/oop/classes/super|super()]]

> [!warning] writing ParentClass.__init__(self, ...) instead of super()
Hardcoding the parent name skips C3 linearization, so under multiple
  inheritance one parent's __init__ silently never runs. Worse, renaming
  the parent breaks every child. Always use super() — it threads the MRO
  correctly even when callers rearrange bases.

### [[Sections/oop/classes/mro|Multiple inheritance / MRO]]

> [!warning] relying on left-to-right depth-first ordering folklore
Python uses C3 linearization, not naive DFS. People assume class D(B, C)
  means "all of B before any of C", but C3 reorders to keep monotonic
  precedence. Always verify with __mro__ rather than guessing. If MRO
  gets confusing, that's a signal to flatten the hierarchy.

### [[Sections/oop/classes/mixin|Mixin pattern]]

> [!warning] giving mixins their own __init__
Mixins with __init__ break cooperative super() chains: depending on
  MRO, the mixin's __init__ may swallow kwargs, skip the real base, or
  never run at all. Keep mixins __init__-free; let the final class own
  construction and let mixins read attributes that already exist on self.

### [[Sections/oop/classes/metaclass|Metaclasses]]

> [!warning] reaching for a metaclass when __init_subclass__ would do
Custom metaclasses don't compose: any subclass that uses a different
  metaclass triggers a "metaclass conflict" at class creation, and users
  of your library suddenly can't combine your base with abc.ABC.
  __init_subclass__ achieves 90% of the use cases (registries, validation)
  without the conflict, and reads like a normal classmethod.

### [[Sections/oop/classes/dunder|Dunder methods]]

> [!warning] defining __eq__ without __hash__
When you override __eq__, Python silently sets __hash__ = None, making
  instances unhashable — sets and dicts now raise TypeError. Always pair:
  compute hash from the same key tuple as __eq__, or use @dataclass(frozen=True)
  which generates both correctly.

### [[Sections/oop/classes/repr-str|__repr__ vs __str__]]

> [!warning] defining only __str__ for "pretty" output
Containers (lists, dicts, sets) and the REPL call __repr__, not __str__.
  So your nicely formatted __str__ never shows up in [obj] or
  {"key": obj}, and exception tracebacks display the unhelpful default
  <Class object at 0x...>. Always define __repr__ first; add __str__ only
  when end-user output differs from the developer view.

### [[Sections/oop/properties/property|@property]]

> [!warning] Java-style get_x()/set_x() methods or @property on every field
New Python users wrap every attribute in @property "for safety", which
  adds boilerplate without adding behavior. Start with plain attributes;
  promote to @property only when you need validation, computation, or
  want to preserve a public API while changing internal storage.

### [[Sections/oop/properties/descriptors|Descriptors]]

> [!warning] storing the per-instance value on self (the descriptor)
The descriptor is one object on the class, shared by every instance.
  Writing self.value = value inside __set__ overwrites that one shared
  slot, so all instances see the same data. Always store via
  obj.__dict__[self.name] = value (or use __set_name__ + a private key).

### [[Sections/oop/properties/classmethod|@classmethod]]

> [!warning] hardcoding ClassName(...) inside a classmethod
When a subclass calls Date.from_string("..."), they expect a Date
  instance back. If the body says return Date(y, m, d) instead of
  cls(y, m, d), every subclass silently downgrades to the base class.
  Always use cls() — that's the entire reason classmethod exists.

### [[Sections/oop/properties/staticmethod|@staticmethod]]

> [!warning] making everything @staticmethod for "purity"
Once a helper turns into @staticmethod, subclasses can override it but
  callers still go through ClassName.helper(), bypassing dispatch.
  If a method might ever need cls or self, leave it as a regular method
  or @classmethod. If it really has no relation to the class, prefer a
  module-level function — readers expect class methods to use the class.

### [[Sections/oop/properties/protocol-oop|Protocol]]

> [!warning] expecting Protocol to validate at runtime
Without @runtime_checkable, Protocol is invisible at runtime — your
  function happily accepts anything and crashes only when the missing
  method is called. Even with @runtime_checkable, isinstance() only
  checks method NAMES, not signatures or attribute types. Treat Protocol
  as static documentation, and add explicit checks where it matters.

### [[Sections/oop/dataclasses/dataclass|@dataclass]]

> [!warning] using = [] or = {} as a default
@dataclass class C: items: list = [] raises ValueError at class
  creation because every instance would share the same list. Use
  field(default_factory=list) instead — Python will call list() per
  instance. Same for dict, set, and any other mutable default.

### [[Sections/oop/dataclasses/slots|__slots__]]

> [!warning] adding __slots__ to a child while the parent has none
__slots__ saves memory only if every class in the MRO declares it.
  A single ancestor without __slots__ keeps __dict__ on every instance,
  so the child's slots add restrictions without saving a single byte.
  Either slot the whole hierarchy or skip it — half-measures are pure cost.

### [[Sections/oop/dataclasses/enum|Enum]]

> [!warning] using strings or ints as "enum" values
status = "active" sprinkled across a codebase invites typos ("activ"),
  silent comparison failures, and zero IDE support. An Enum gives you
  completion, refactoring, and exhaustiveness checking. If you need to
  serialize, use StrEnum/IntEnum so the wire format stays a primitive
  while the in-memory type stays a real Enum.

### [[Sections/oop/dataclasses/context-manager|Context managers]]

> [!warning] returning True from __exit__ to "be safe"
Returning True suppresses ALL exceptions raised inside the with block,
  which silently swallows real bugs (KeyboardInterrupt, AssertionError,
  programming errors). Return False (or None — same thing) and only
  suppress when intentional, narrowing to specific exception types.

### [[Sections/oop/dataclasses/dataclasses|dataclasses (Data Classes)]]

> [!warning] defaulted parent fields blocking non-default child fields
Inheriting from @dataclass class A: x: int = 0 and adding @dataclass
  class B(A): y: int raises "non-default argument follows default" because
  the generated __init__ would put y after x. Fix by giving y a default,
  moving x's default off, or using kw_only=True (3.10+) which sidesteps
  ordering entirely.

## Data Structures & Algos

### [[Sections/dsa/structures/stack|Stack]]

> [!warning] stack.pop(0)
That removes from the FRONT and is O(n) — it shifts every other element.
  pop() (no args) removes from the TOP and is O(1). They are not interchangeable.

### [[Sections/dsa/structures/queue|Queue]]

> [!warning] list.pop(0) for a queue
O(n) — every dequeue physically shifts the rest. Even on tiny inputs the
  overhead is unnecessary. deque.popleft() is O(1) and safer.

### [[Sections/dsa/structures/deque|Deque]]

> [!warning] deque[i] in a hot loop
Each access is O(n) — much slower than list[i]. If you need both ends-fast
  AND indexed reads, materialize the deque to a list when reads dominate.

### [[Sections/dsa/structures/heap|Heap]]

> [!warning] scanning past h[0] thinking it's "the second smallest"
The heap's index layout is partial; h[1] is "smaller than its descendants",
  not "second-smallest overall." Always pop or use nsmallest to get order.

### [[Sections/dsa/structures/priority-queue|Priority Queue]]

> [!warning] pushing (priority, item) where item is non-comparable
When two priorities tie, Python compares the items — and if they don't
  define __lt__ you get TypeError mid-run. ALWAYS use (priority, counter, item).

### [[Sections/dsa/structures/hashmap|HashMap]]

> [!warning] "if key in d: d[key]" then "else: d[key] = default"
Two lookups when one suffices. Use d.get(key, default) (read-only) or
  d.setdefault(key, default) (writes default if missing) — single lookup.

### [[Sections/dsa/structures/linked-list|Linked List]]

> [!warning] cur.next = prev WITHOUT saving cur.next first
You've just orphaned the rest of the list. The first line of any reversal
  loop should be:  nxt = cur.next.

### [[Sections/dsa/structures/graph|Graph]]

> [!warning] marking visited when DEQUEUEING in BFS
The same node gets pushed multiple times before it's first popped.
  Mark visited the moment you ENQUEUE — once per node, total.

### [[Sections/dsa/structures/trie|Trie]]

> [!warning] storing whole words at every level
That's just a list lookup with extra steps. The whole point of a trie is
  sharing prefixes among nodes. If you find yourself doing it, switch to a set.

### [[Sections/dsa/structures/binary-search|Binary search]]

> [!warning] rolling your own "find first occurrence" with mid+/-1 boundaries
It's bisect_left in two characters. Avoid the off-by-one trap by reaching
  for the stdlib first; only hand-roll when you're searching on the ANSWER.

### [[Sections/dsa/structures/sorting-patterns|Sorting patterns]]

> [!warning] lst = lst.sort()
list.sort() returns None; lst becomes None and your next line crashes.
  Use lst.sort() (no assignment) or new = sorted(lst).

### [[Sections/dsa/algorithms/two-pointers|Two Pointers]]

> [!warning] two-pointer on UNSORTED data for pair-sum
The technique relies on monotonic movement — it doesn't work without sorted
  input. Either sort first (O(n log n)) or switch to a hash map (O(n)).

### [[Sections/dsa/algorithms/sliding-window|Sliding Window]]

> [!warning] recomputing the window from scratch each step
That makes it O(n*k) and defeats the entire point. Maintain a running sum,
  counter, or deque so each shift is O(1) amortized.

### [[Sections/dsa/algorithms/recursion|Recursion]]

> [!warning] missing OR weaker base case
Infinite recursion -> RecursionError. Always write the base case FIRST and
  verify that every recursive call moves strictly toward it.

### [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming]]

> [!warning] re-running the recursion in TESTS without cache_clear()
The cache persists across tests. Either decorate locally inside the function
  under test, or call fn.cache_clear() in test setup.

### [[Sections/dsa/algorithms/big-o|Big-O Reference]]

> [!warning] micro-optimizing past readability before profiling
The 5% you guess at is rarely the 50% you'd find by measuring. Use cProfile
  or pytest-benchmark to find the real hot spot, then choose the right Big-O.

## APIs & Frameworks

### [[Sections/apis/fastapi/fastapi-routes|FastAPI routes]]

> [!warning] business logic crammed into route bodies
Routes are a HTTP layer: validate, authenticate, call a service, shape the
  response. Push DB / email / payment logic into a service module so it stays
  testable independently of FastAPI.

### [[Sections/apis/fastapi/fastapi-di|FastAPI dependency injection]]

> [!warning] importing a global SessionLocal in handlers
The session leaks past the request, isn't closed on errors, and survives in
  one async task while another resets it. Always go through Depends(get_db).

### [[Sections/apis/fastapi/pydantic-models|Pydantic models]]

> [!warning] extra="ignore" on a public POST endpoint
Clients can send any field they like; you silently drop them. The bug is
  indistinguishable from "field renamed and forgot to update client". Use
  extra="forbid" so typos blow up immediately.

### [[Sections/apis/fastapi/pydantic-validators|Pydantic validators]]

> [!warning] raising HTTPException inside a Pydantic validator
Validators run during model construction, not in a FastAPI handler. They
  should raise ValueError; FastAPI translates ValidationError to 422 for you.
  Raising HTTPException leaks the framework into your domain models.

### [[Sections/apis/fastapi/pydantic-settings|Pydantic BaseSettings]]

> [!warning] print(settings) showing the password
Plain str fields are repr'd verbatim — and end up in stack traces, logs, and
  error reports. SecretStr renders as '**********' and is opt-in to read.

### [[Sections/apis/fastapi/sqlalchemy-models|SQLAlchemy models]]

> [!warning] Base.metadata.create_all(engine) in app startup
It's idempotent for adds but NEVER drops or migrates columns. The schema
  silently drifts from the code. Use Alembic from day one.

### [[Sections/apis/fastapi/sqlalchemy-session-apis|SQLAlchemy session]]

> [!warning] keeping a Session open across requests
Identity map fills with stale objects; later commits leak data from one
  request into another. Always: ONE session per unit of work, opened on the
  way in, closed (and rolled back) on the way out.

### [[Sections/apis/async/async-def|async def]]

> [!warning] making EVERYTHING async because "async is faster"
Async is ONLY faster for I/O-bound, CONCURRENT work. Synchronous code is
  simpler, faster for pure compute, and easier to debug. Convert when you
  need concurrency, not because the keyword exists.

### [[Sections/apis/async/await|await]]

> [!warning] try/except Exception that swallows CancelledError
Once CancelledError is suppressed, your task ignores cancellation and the
  shutdown hangs. Either re-raise it explicitly or catch it as its own clause:
      except asyncio.CancelledError: cleanup(); raise

### [[Sections/apis/async/asyncio-gather|asyncio.gather()]]

> [!warning] gather(coros) instead of gather(*coros)
gather expects POSITIONAL args. Passing one list silently runs nothing —
  the coros are never awaited and you get RuntimeWarnings. Always *unpack.

### [[Sections/apis/async/asyncio-queue|asyncio.Queue()]]

> [!warning] forgetting q.task_done() in the failure path
q.join() never returns; the program hangs at shutdown waiting for unmatched
  put()s. Use try/finally so task_done() runs even when process() raises.

### [[Sections/apis/async/thread-pool|ThreadPoolExecutor]]

> [!warning] ThreadPoolExecutor for CPU-bound pure-Python work
The GIL serializes execution; you'll see ~1 core utilized regardless of
  max_workers. Switch to ProcessPoolExecutor (or rewrite the hot loop in
  numpy/cython/numba which release the GIL).

### [[Sections/apis/async/process-pool|ProcessPoolExecutor]]

> [!warning] pickling lambdas / locally-defined functions
"AttributeError: Can't pickle local object" — the worker tries to import
  the function by name and fails. Define them at module level (or use cloudpickle
  via dask/joblib if you can't refactor).

### [[Sections/apis/http-stdlib/logging-apis|logging]]

> [!warning] logging.basicConfig() inside library code
First import wins; every other config is silently ignored. Libraries should
  only acquire loggers; the application owns configuration.

### [[Sections/apis/http-stdlib/os-environ|os.environ]]

> [!warning] spreading os.environ.get("X") across 50 files
Renaming a var becomes a grep-and-replace; defaults disagree across modules;
  tests can't override consistently. Centralize config in one module.

### [[Sections/apis/http-stdlib/requests|requests]]

> [!warning] requests.get(url) with NO timeout
The default is None — wait forever. One misbehaving upstream wedges the
  whole process. Always pass timeout= (a tuple is even better).

### [[Sections/apis/http-stdlib/httpx|httpx]]

> [!warning] instantiating AsyncClient per request handler
~30 ms TLS handshake every request; FD count climbs; throughput collapses.
  Create the client ONCE at startup (lifespan) and inject via request.app.state.

## Testing with pytest

### [[Sections/testing/pytest-basics/assertions|pytest assertions]]

> [!warning] "test_create_user" with 30 asserts spanning every feature
When one fails, the rest never run, so each commit gives you ONE bug at a
  time. Split by behavior — failures in unrelated areas should be visible
  simultaneously.

### [[Sections/testing/pytest-basics/test-doubles|Test doubles]]

> [!warning] mocking the function under test's own dependencies recursively
"I mocked save_user, hash_password, send_email — and the test still passes."
  You're testing the mocks. Mock the OUTERMOST boundary; let the rest of the
  code run for real, on a fake DB.

### [[Sections/testing/pytest-basics/raises|pytest.raises()]]

> [!warning] assertions INSIDE the with-block
with pytest.raises(ValueError):
      result = thing()
      assert result == expected      # AssertionError gets eaten by pytest.raises!
  Always: assert AFTER the block, on exc_info.value if needed.

### [[Sections/testing/pytest-basics/approx|pytest.approx()]]

> [!warning] assert abs(a - b) < 1e-6
Hand-rolled tolerances forget the absolute case, don't compose, and produce
  useless failure messages. Use approx or np.testing.* — they print diffs.

### [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize]]

> [!warning] 12 near-identical test_* functions differing only by inputs
Each renames a variable; bug-fixing requires editing 12 places. Use one
  parametrized function — failures still show per-case in the report.

### [[Sections/testing/fixtures/fixture-basic|@pytest.fixture]]

> [!warning] cleanup in a try/finally inside the test
def test_x():
      db = connect()
      try: ...
      finally: db.close()
  That's a fixture screaming to be born. Move it; you'll reuse it tomorrow.

### [[Sections/testing/fixtures/fixture-scope|Fixture scope]]

> [!warning] scope="session" on a list / dict the tests mutate
The third test in the file fails because the second mutated the shared
  object. Either switch to function scope or wrap the resource with a
  per-test reset (autouse fixture that snapshots and restores).

### [[Sections/testing/fixtures/factory-boy|Factory Boy]]

> [!warning] dictionaries hand-rolled in every test
{"username": "alice", "email": "alice@x.com", "role": "user", "verified": True, ...}
  When the model gains a new required field, every test breaks. Centralize
  defaults in a factory; tests only specify what they care about.

### [[Sections/testing/fixtures/conftest|conftest.py]]

> [!warning] importing fixtures from a test file
from tests.test_helpers import db  # works, but pytest can't reason about it
  Fixtures belong in conftest.py — the discovery is the whole point.

### [[Sections/testing/fixtures/integration-tests|Integration test patterns]]

> [!warning] TestClient.app calling the production database
Tests pollute real data; CI is non-deterministic; running locally is unsafe.
  Always override get_db (or whatever dependency hits external state).

### [[Sections/testing/mocking/patch|unittest.mock.patch()]]

> [!warning] patching the place a function is DEFINED instead of USED
patch("requests.get") doesn't replace what your code already imported as
  'get'. Always patch the name in the calling module: "myapp.service.get".

### [[Sections/testing/mocking/responses|responses]]

> [!warning] not failing on unexpected URLs
Without assert_all_requests_are_fired (or pytest-socket blocking), a test
  silently calls the real internet, passes locally, and breaks in CI behind a
  proxy. Block real network access in your CI test config.

### [[Sections/testing/mocking/httpretty|httpretty]]

> [!warning] assuming httpretty mocks httpx or aiohttp
Both bypass the socket layer for performance. The mock seems to install but
  no requests are intercepted. Use respx / aioresponses for those clients.

### [[Sections/testing/mocking/magicmock|MagicMock]]

> [!warning] assert_called() instead of assert_called_once_with()
assert_called() passes for ANY number of calls with ANY args. The test goes
  green even when the mocked code is fundamentally broken. Always assert
  COUNT and ARGS together.

### [[Sections/testing/mocking/mocker|mocker fixture]]

> [!warning] stacking @patch decorators inside pytest tests
def test(...):
    with patch("a"), patch("b"), patch("c"): ...
  Reaches three indentation levels deep. mocker.patch flattens it: each call
  is one statement, all auto-cleaned.

### [[Sections/testing/mocking/pytest-asyncio|pytest-asyncio]]

> [!warning] MagicMock for an async function
mock = MagicMock()
  await mock()    # TypeError: object MagicMock can't be used in 'await' expression
  Always AsyncMock for code paths that await.

### [[Sections/testing/advanced/coverage|pytest coverage]]

> [!warning] chasing 100% coverage on getters/setters
You hit the number; tests are trivial; bugs still slip through. Branch
  coverage + diff coverage on changed lines is a better signal than total %.

### [[Sections/testing/advanced/cov-config|pytest-cov configuration]]

> [!warning] keeping settings in BOTH pyproject.toml AND .coveragerc
The two files override each other unpredictably. Pick ONE — pyproject.toml
  is the modern choice. Migrate everything; delete the other.

### [[Sections/testing/advanced/freezegun|freezegun]]

> [!warning] assert datetime.now() == "2024-01-15"
On a real clock this is a flaky check that passes for one millisecond. Either
  freeze, or compare to a captured "now" variable, never the clock itself.

### [[Sections/testing/advanced/marks-config|Marks & configuration]]

> [!warning] addopts = "-m 'not slow'" with no way to OPT IN
The slow tests never run anywhere — they bit-rot. Pair every "default skip"
  with a CLI flag or a CI lane that runs them.

### [[Sections/testing/advanced/hypothesis|Hypothesis]]

> [!warning] testing a property the SUT enforces (e.g. testing __eq__'s reflexivity)
"x == x" can't fail — Hypothesis just burns CPU. Properties should constrain
  relationships BETWEEN operations (encode/decode, sort/sort, push/pop).

## Machine Learning

### [[Sections/ml/preprocessing/train_test_split|train_test_split]]

> [!warning] random-splitting time-series or grouped data
People reach for train_test_split by reflex, then are baffled when
  "97% accuracy" collapses in production. Random splits leak the future
  into training (time series) or leak per-user behavior across the
  train/test boundary (grouped data). Use TimeSeriesSplit / GroupKFold.

### [[Sections/ml/preprocessing/standard_scaler|StandardScaler]]

> [!warning] fit_transform on the full X before splitting
Calling scaler.fit_transform(X) before train_test_split leaks test-set
  means/stds into the model — validation scores look great, production
  regresses. The fix is non-negotiable: fit on X_train only, transform
  X_test, or put the scaler in a Pipeline so CV refits per fold.

### [[Sections/ml/preprocessing/minmax_scaler|MinMaxScaler]]

> [!warning] scaling a column where one outlier dominates the range
With one row at 10^6 and the rest under 100, MinMax squeezes 99% of
  data into [0, 0.0001] — the model effectively sees a constant feature.
  The fix is to clip percentiles (1/99) on TRAIN, then scale; or switch
  to RobustScaler. Never compute clip bounds from the full X (leakage).

### [[Sections/ml/preprocessing/label_encoder|LabelEncoder]]

> [!warning] using LabelEncoder on input features
LabelEncoder is documented as target-only and has no handle_unknown
  argument. Applied to a feature column it imposes alphabetical order
  and crashes at predict time on any unseen value. Use OneHotEncoder
  (nominal) or OrdinalEncoder with explicit categories= (ordinal).

### [[Sections/ml/preprocessing/onehot_encoder|OneHotEncoder]]

> [!warning] pd.get_dummies on train and test separately
Calling pd.get_dummies(X_train) and pd.get_dummies(X_test) yields
  different column sets when test has missing categories — silent
  shape mismatches at inference. Use OneHotEncoder (fit on train,
  transform on test) so the column set is fixed and unseen categories
  are handled by handle_unknown="ignore".

### [[Sections/ml/preprocessing/simple_imputer|SimpleImputer]]

> [!warning] imputing the whole DataFrame before train_test_split
df.fillna(df.mean()) computes the mean over the test rows too — the
  classic silent leak. Same for SimpleImputer().fit_transform(X) before
  splitting. Always fit on train only (or wrap inside a Pipeline so CV
  refits per fold). Also: never use mean on skewed data — use median.

### [[Sections/ml/preprocessing/column_transformer|ColumnTransformer]]

> [!warning] applying transforms in two passes outside ColumnTransformer
Manually scaling X[num_cols] and one-hot encoding X[cat_cols] then
  concatenating works once but breaks under cross-validation (each fold
  needs to refit) and at inference (column order drift). Always wrap
  per-column logic in ColumnTransformer inside a Pipeline.

### [[Sections/ml/preprocessing/pipeline|Pipeline]]

> [!warning] doing preprocessing outside the Pipeline, then CV-ing the model
X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
  leaks every fold's validation stats into the scaler. The CV score
  is optimistically biased. Move the scaler into the Pipeline so
  cross_val_score refits it per fold automatically.

### [[Sections/ml/classification/logistic_regression|LogisticRegression]]

> [!warning] trusting raw predict_proba as a calibrated probability
LogisticRegression's outputs only look calibrated; with regularization
  or class_weight="balanced" they are NOT, and thresholding on 0.5 quietly
  underperforms. If probabilities drive decisions (pricing, alerting),
  wrap in CalibratedClassifierCV and pick the threshold via PR curve.

### [[Sections/ml/classification/decision_tree_classifier|DecisionTreeClassifier]]

> [!warning] leaving max_depth=None on a single tree
The default grows until every leaf is pure — train accuracy 100%,
  test accuracy mediocre, model unusable. Always constrain depth
  (max_depth, min_samples_leaf, or ccp_alpha). If you want max accuracy
  without the fiddling, switch to RandomForest or GradientBoosting.

### [[Sections/ml/classification/random_forest_classifier|RandomForestClassifier]]

> [!warning] trusting clf.feature_importances_ on correlated features
The default impurity-based importance is biased toward high-cardinality
  features and splits the credit among correlated ones, hiding the true
  signal. Use permutation_importance on a held-out set, or SHAP. Also
  never compute importance on training data — it overstates real impact.

### [[Sections/ml/classification/svm_classifier|SVC (Support Vector Classifier)]]

> [!warning] SVC on a 100k-row dataset without checking complexity
SVC training is O(n^2) to O(n^3); a routine "let me try SVM" turns
  into a frozen notebook on big data. Either subsample to <=10k rows,
  switch to LinearSVC / SGDClassifier(loss="hinge"), or use a kernel
  approximation (Nystroem) before a linear classifier.

### [[Sections/ml/classification/knn_classifier|KNeighborsClassifier]]

> [!warning] KNN on raw, unscaled features
KNN is pure distance — a feature with values in 0..10000 will dominate
  one in 0..1 and the model effectively ignores everything else.
  Always StandardScaler (or MinMaxScaler) inside a Pipeline. Same goes
  for one-hot columns: distance on them is binary and noisy; consider
  OrdinalEncoder + scaling, or skip KNN for high-cardinality categoricals.

### [[Sections/ml/classification/gradient_boosting_classifier|GradientBoostingClassifier]]

> [!warning] stacking GBM on top of one-hot encoded high-cardinality categoricals
GBMs split greedily; OHE explodes the feature count and dilutes the
  signal across many almost-empty columns, hurting both accuracy and
  speed. Use OrdinalEncoder (trees handle it fine), TargetEncoder, or
  LightGBM's native categorical_feature= argument instead.

### [[Sections/ml/regression/linear_regression|LinearRegression]]

> [!warning] reading coefficient magnitudes as "feature importance"
On unscaled features the coefficient size reflects unit choice, not
  importance — kilometers vs millimeters flips ranking. Always scale
  first if you plan to compare coefficients, or use partial dependence
  / permutation importance. Also: R^2 on training data hides overfit.

### [[Sections/ml/regression/ridge_regression|Ridge]]

> [!warning] tuning alpha by hand on the test set
Sweeping alpha and picking the value that gives best test R^2 is just
  manual data leakage; the held-out score is now optimistically biased.
  Use RidgeCV (built-in efficient leave-one-out path) or a Pipeline +
  GridSearchCV. Also: never run Ridge on unscaled features — large-scale
  columns absorb most of the penalty and the regularization is uneven.

### [[Sections/ml/regression/lasso_regression|Lasso]]

> [!warning] treating Lasso's nonzero coefficients as a stable feature ranking
With correlated predictors Lasso picks one almost at random and zeros
  the rest; rerunning on a resample gives a different "selected set".
  Use ElasticNet (or stability selection) when you need a reliable
  feature list, and never compare coefficient magnitudes on unscaled X.

### [[Sections/ml/regression/elasticnet_regression|ElasticNet]]

> [!warning] tuning only alpha and leaving l1_ratio at the default 0.5
ElasticNet has TWO knobs; locking l1_ratio at 0.5 forfeits its main
  advantage. Pass a list of ratios (e.g. [.1, .5, .7, .9, .95, .99, 1])
  to ElasticNetCV. Also: too small a max_iter silently converges to a
  worse solution — bump max_iter to 10,000+ when warnings appear.

### [[Sections/ml/regression/decision_tree_regressor|DecisionTreeRegressor]]

> [!warning] using a single deep tree for production scoring
max_depth=None overfits, MSE on test stays high, and predictions are
  piecewise-constant (no smoothing). The fix is almost always an
  ensemble: RandomForestRegressor or HistGradientBoostingRegressor;
  keep the single tree only as an interpretable explanation surface.

### [[Sections/ml/regression/random_forest_regressor|RandomForestRegressor]]

> [!warning] extrapolating outside the training range with RF
Trees split on training quantiles — predictions on x values larger
  than any training row are clamped at the largest leaf mean. The
  model "flatlines" on extrapolation. If extrapolation matters, choose
  a linear model or add a linear residual on top of the forest.

### [[Sections/ml/regression/svr_regressor|SVR (Support Vector Regressor)]]

> [!warning] skipping y-scaling on heavy-tailed targets
SVR depends on the absolute scale of y (epsilon-insensitive tube),
  so a target ranging 0..1e6 makes default epsilon meaningless and
  most points sit inside the tube — the model under-fits. Wrap in
  TransformedTargetRegressor(transformer=StandardScaler()) or log(1+y).

### [[Sections/ml/evaluation/accuracy_score|accuracy_score]]

> [!warning] reporting accuracy on a 99/1 fraud / churn dataset
"97% accurate" sounds great until you notice always-predict-majority
  gives 99%. The model may be useless. On imbalance, default to
  balanced_accuracy or F1 (or AUC for ranking), and ALWAYS compare to
  a DummyClassifier(strategy="most_frequent") baseline before celebrating.

### [[Sections/ml/evaluation/precision_recall_f1|precision_score, recall_score, f1_score]]

> [!warning] tuning the decision threshold on the test set
Sweeping thresholds and picking the one that maximizes F1 against
  y_test leaks test info into the model. Choose the threshold on a
  held-out validation fold (or via cross_val_predict + PR curve), then
  freeze it before computing the final F1 on test.

### [[Sections/ml/evaluation/confusion_matrix|confusion_matrix]]

> [!warning] reading raw counts on imbalanced classes
With 990 negatives and 10 positives, 990 in the (neg, neg) cell looks
  "great" while 7 false negatives are hidden — yet recall is only 30%.
  Always plot with normalize="true" or pair with classification_report.
  Also: passing labels= in inconsistent order between train and report
  silently swaps which class is "positive" — pin labels= explicitly.

### [[Sections/ml/evaluation/classification_report|classification_report]]

> [!warning] using only the "weighted avg" line on imbalanced data
The weighted average is dominated by the majority class — it can be
  high while the minority class has F1 ~ 0. Always read the per-class
  rows AND macro avg; a large weighted-vs-macro gap is the canonical
  "your model only learned the majority class" signal.

### [[Sections/ml/evaluation/cross_val_score|cross_val_score]]

> [!warning] cross-validating a model AFTER preprocessing X
X_scaled = scaler.fit_transform(X); cross_val_score(model, X_scaled, y)
  leaks each fold's validation distribution into the scaler. The
  reported score is biased high. Always pass a Pipeline that contains
  the scaler so each fold refits preprocessing on its own train slice.

### [[Sections/ml/evaluation/roc_auc_score|roc_auc_score, roc_curve]]

> [!warning] feeding clf.predict() to roc_auc_score
Hard 0/1 labels collapse the curve to two points and the AUC degenerates
  to (TPR + (1-FPR)) / 2. roc_auc_score expects scores or probabilities:
  pass clf.predict_proba(X)[:, 1] (binary) or decision_function(X). For
  models without predict_proba (LinearSVC), wrap in CalibratedClassifierCV.

### [[Sections/ml/evaluation/mean_squared_error|mean_squared_error]]

> [!warning] comparing RMSE values on differently-scaled targets
"Model A's RMSE is 50, model B's is 0.5 — A is worse" is wrong if A
  predicts revenue ($) and B predicts log-revenue. RMSE is in target
  units; always compare to the target's std or use R^2 / NRMSE for
  cross-target comparison. Also: compare to a mean-predictor baseline
  before declaring a model "good".

### [[Sections/ml/evaluation/r2_score|r2_score]]

> [!warning] trusting training R^2 as a quality signal
Training R^2 only goes UP as you add features (even noise ones); it
  doesn't measure generalization. Always report cross-validated R^2 on
  held-out folds. Also: never compare R^2 across datasets — variance
  in y differs, so the baseline differs; use RMSE/MAE for that compare.

### [[Sections/ml/tuning/grid_search_cv|GridSearchCV]]

> [!warning] tuning a model that includes preprocessing fitted outside CV
GridSearchCV refits whatever you pass to it per fold, so a scaler
  sitting OUTSIDE leaks the validation distribution into the training
  features. Always pass a Pipeline. Also: tuning on all of X then
  evaluating on the same X gives a pointlessly inflated score — keep
  a held-out test set the search never touches.

### [[Sections/ml/tuning/randomized_search_cv|RandomizedSearchCV]]

> [!warning] using RandomizedSearchCV with default uniform on log-scale params
For C, gamma, learning_rate, alpha: a uniform(1e-3, 1e3) wastes 99%
  of trials in the >1.0 region. Use scipy.stats.loguniform(1e-3, 1e3)
  so each decade gets equal sampling. Also: leaving n_iter=10 (default)
  on a 5-dim space rarely covers it — bump n_iter to 50-200 trials.

### [[Sections/ml/tuning/learning_curve|learning_curve]]

> [!warning] drawing a learning curve with the model fit OUTSIDE a Pipeline
If preprocessing happens before learning_curve, every train_sizes
  slice gets the SAME (whole-data) preprocessing — train scores are
  inflated and the diagnosis is wrong. Pass a Pipeline so each slice
  refits its own scaler/encoder. Also: using shuffle=False on grouped
  data hides leakage that the production model will hit.

### [[Sections/ml/tuning/validation_curve|validation_curve]]

> [!warning] picking the parameter value that maximizes the TRAIN curve
It looks tempting because the train score keeps rising, but that's
  the overfit direction. Always pick the value at the validation peak
  (or a slightly more regularized one if the peak is a plateau). Also:
  linear-spaced range on log-scale params (C, alpha) misses the action.

### [[Sections/ml/tuning/feature_importances|feature_importances_]]

> [!warning] ranking features by clf.feature_importances_ on training data
The default MDI metric is biased toward high-cardinality / high-variance
  features even when they're random noise; computed on training data, it
  also overstates impact. Use permutation_importance on a held-out test
  set, group correlated features before interpreting, and don't drop
  features based on a single run — bootstrap or k-fold the ranking.

### [[Sections/ml/clustering/kmeans|KMeans]]

> [!warning] running KMeans on raw features and trusting the labels
KMeans uses Euclidean distance, so an unscaled column with values in
  thousands dominates and effectively defines the clusters. Always
  StandardScaler first. Also: picking k from the elbow alone is brittle
  — pair with silhouette_score across k values and inspect cluster
  sizes (a 95/2/2/1% split usually means k is wrong, not the data).

### [[Sections/ml/clustering/dbscan|DBSCAN]]

> [!warning] copy-pasting eps=0.5 from a tutorial
eps depends on the scale and distance distribution of YOUR features.
  Without scaling, 0.5 is meaningless; with scaling it may still be wrong.
  Use a k-distance plot (sorted distance to k-th nearest neighbor) and
  pick eps at the elbow. If noise rate exceeds 50%, eps is too small.

### [[Sections/ml/clustering/pca|PCA (Principal Component Analysis)]]

> [!warning] running PCA on unscaled features
PCA finds directions of maximum variance — without scaling, a
  column with huge units (e.g., income in dollars) becomes PC1 and
  the rest is irrelevant. Always StandardScaler first, except when
  features share a scale (pixel intensities). Also: PCA before
  train_test_split leaks test info — fit PCA inside a Pipeline.

### [[Sections/ml/clustering/tsne|t-SNE (t-Distributed Stochastic Neighbor Embedding)]]

> [!warning] feeding t-SNE coordinates into a downstream classifier
t-SNE distances are non-metric and not preserved across runs — the
  same point can land in different clusters with a new random_state.
  Use UMAP if you need a stable, low-dim feature representation, or
  keep t-SNE strictly as a visual EDA tool. Also: skipping PCA pre-
  reduction on >50 features makes t-SNE crawl AND degrades layout.

### [[Sections/ml/clustering/silhouette_score|silhouette_score]]

> [!warning] applying silhouette_score to DBSCAN output including noise (-1)
silhouette treats noise label -1 as a regular cluster, which is
  meaningless and tanks the score. Filter to mask = labels != -1
  first, or use density-aware metrics (noise rate, HDBSCAN stability).
  Also: silhouette tends to favor low k — pair with the elbow plot
  so you don't accidentally collapse everything into 2 clusters.

### [[Sections/ml/clustering/agglomerative_clustering|AgglomerativeClustering]]

> [!warning] running AgglomerativeClustering on 100k rows in a notebook
The classic O(n^2) memory and time blow up — the kernel dies or
  freezes for an hour. For N > ~10k use BIRCH (linear in N) or
  sub-sample to fit, then assign new points by nearest centroid.
  Also: linkage="ward" requires Euclidean distance; pairing it with
  metric="cosine" silently raises an error or gives nonsense.

## Deep Learning

### [[Sections/deeplearning/tensors-autograd/tensor-creation|torch.tensor]]

> [!warning] torch.tensor([...]) of integer Python lists for NN input
The default dtype becomes int64, then the first matmul against a
  float32 weight blows up with "expected scalar type Float but got
  Long". Always pin dtype=torch.float32 (or use torch.from_numpy of an
  already-float32 array) at construction — not after the fact.

### [[Sections/deeplearning/tensors-autograd/tensor-operations|Tensor Operations]]

> [!warning] using in-place ops (x.add_, x.mul_) on tensors that still
need to flow gradients
  The original tensor is overwritten, so autograd cannot reconstruct
  the saved activation and backward() either errors or silently
  computes wrong grads. Use the out-of-place form (x = x + y) inside
  any forward path that requires_grad; reserve in-place for buffers
  and explicit no_grad regions.

### [[Sections/deeplearning/tensors-autograd/tensor-reshaping|Reshape & View]]

> [!warning] chaining .view(...) directly after .transpose / .permute
Transpose/permute return a non-contiguous view; .view() then raises
  "view size is not compatible with input tensor's size and stride".
  People "fix" it by switching to .reshape(), which silently copies in
  the hot path. Insert an explicit .contiguous() so the copy (and its
  memory cost) is visible, or use einops.rearrange which handles it.

### [[Sections/deeplearning/tensors-autograd/autograd-backward|Autograd & backward()]]

> [!warning] calling .backward() on a non-scalar tensor by passing
torch.ones_like(loss) instead of reducing first
  loss = (pred - target) ** 2 ; loss.backward(torch.ones_like(loss))
  "works" but silently sums the per-element gradients with weight 1,
  making the effective loss scale depend on batch and feature size.
  Always reduce to a scalar (.mean() or .sum()) before backward so
  the loss magnitude — and thus the learning rate — is well defined.

### [[Sections/deeplearning/tensors-autograd/gradient-zeroing|zero_grad()]]

> [!warning] clipping gradients AFTER optimizer.step() instead of before
utils.clip_grad_norm_ mutates .grad in place, so calling it after
  step() does nothing for the update that just happened — the spike
  already moved the weights. Always order: backward() -> clip ->
  step() -> zero_grad(). Same trap with gradient accumulation:
  clip after the LAST micro-batch backward, before the step.

### [[Sections/deeplearning/tensors-autograd/gpu-device|.to(device)]]

> [!warning] constructing tensors on CPU and then .to("cuda")-ing
them every iteration of the training loop
  torch.zeros(B, D).to(device) inside the loop allocates host memory,
  does a sync H2D copy, and ignores pin_memory entirely. Allocate
  GPU-resident buffers once with torch.zeros(..., device=device),
  reuse via .copy_(non_blocking=True), and rely on DataLoader
  pin_memory + non_blocking for input batches.

### [[Sections/deeplearning/tensors-autograd/no-grad-context|torch.no_grad()]]

> [!warning] using torch.no_grad() but forgetting model.eval()
(or vice versa)
  no_grad only stops graph building; Dropout still drops, BatchNorm
  still updates running stats from the validation batch — your val
  loss looks noisy and your BN stats drift. Both are mandatory:
  model.eval() switches layer modes, no_grad / inference_mode skips
  the graph. Restore model.train() before the next training epoch.

### [[Sections/deeplearning/building-networks/nn-module|nn.Module]]

> [!warning] storing sublayers in a plain Python list or dict
(self.layers = [nn.Linear(...), ...]) instead of nn.ModuleList /
nn.ModuleDict
  Plain containers hide the parameters from model.parameters(), so
  the optimizer never sees them, .to(device) never moves them, and
  state_dict() never serializes them. The model "trains" but those
  layers are frozen at init. Wrap any sublayer collection in
  nn.ModuleList / nn.ModuleDict; same applies to register_buffer
  for tensors that must follow .to() but are not parameters.

### [[Sections/deeplearning/building-networks/nn-linear|nn.Linear]]

> [!warning] feeding a 3D/4D tensor straight into nn.Linear that
was sized for the flat feature count (e.g. Linear(C*H*W, ...) on
an unflattened CNN output)
  nn.Linear broadcasts over leading dims, so it silently runs but
  produces (B, C, H, out) with the wrong semantics — only the last
  dim is contracted. Always insert nn.Flatten() (or .view(B, -1) /
  einops.rearrange) before the head, or use LazyLinear so the
  in_features is inferred from the actual flattened size.

### [[Sections/deeplearning/building-networks/nn-sequential|nn.Sequential]]

> [!warning] trying to do residuals in Sequential
nn.Sequential(...) cannot express x + body(x).

### [[Sections/deeplearning/building-networks/activation-functions|Activation Functions]]

> [!warning] appending nn.Softmax (or nn.Sigmoid) as the model's
final layer and then training with nn.CrossEntropyLoss
(or nn.BCELoss)
  CE/BCE-with-logits already include log-softmax / log-sigmoid
  internally for numerical stability; doing it twice flattens
  gradients (log of probabilities saturating near 0/1) and training
  either crawls or NaNs. Output RAW LOGITS from the model and let
  CrossEntropyLoss / BCEWithLogitsLoss handle the activation; only
  apply softmax/sigmoid at predict() time when you need probabilities.

### [[Sections/deeplearning/building-networks/nn-conv2d|nn.Conv2d]]

> [!warning] leaving bias=True (default) on a Conv2d that is
immediately followed by BatchNorm2d
  BN re-centers the activations with its own learnable beta term, so
  the conv bias is mathematically redundant — it just wastes a
  parameter per output channel and a small allocation. Set bias=False
  on every conv that feeds straight into a norm layer (BN/GN/LN). Only
  keep bias=True on convs whose output goes directly into a non-norm
  layer (e.g., the final 1x1 prediction head).

### [[Sections/deeplearning/building-networks/nn-lstm|nn.LSTM]]

> [!warning] padding variable-length sequences and feeding the dense
tensor straight into nn.LSTM without pack_padded_sequence
  The LSTM will happily consume the PAD timesteps and propagate their
  contribution into h_n, so your "last hidden state" classifier is
  actually conditioned on padding. The loss looks fine; downstream
  accuracy degrades silently. Use pack_padded_sequence (with
  enforce_sorted=False) so padded steps are skipped, then
  pad_packed_sequence on the way out — or, equivalently, take the
  step at index lengths-1 rather than [-1].

### [[Sections/deeplearning/training-loop/loss-functions|Loss Functions]]

> [!warning] passing one-hot encoded targets to nn.CrossEntropyLoss
instead of integer class indices
  CE in modern PyTorch accepts class indices of shape (B,) (long
  dtype) — feeding (B, C) one-hot floats either errors or silently
  computes a soft-label loss with completely different magnitude.
  Symptom: loss starts at log(C) but plateaus much higher than
  expected. Use targets = torch.argmax(one_hot, dim=-1) once at the
  data-loading step, or pass float soft-labels intentionally for
  distillation (and document it).

### [[Sections/deeplearning/training-loop/optimizers|Optimizers (SGD, Adam)]]

> [!warning] using optim.Adam with a non-zero weight_decay and
expecting L2 regularization
  In Adam, weight_decay is folded INTO the gradient before the
  adaptive scaling, so its effective strength depends on the
  gradient's running variance — large parameters with small
  gradients are barely regularized. Use optim.AdamW (decoupled weight
  decay applied after the adaptive update) for any model where
  regularization matters: transformers, large MLPs, fine-tuning.
  Same lr and weight_decay numbers, very different generalization.

### [[Sections/deeplearning/training-loop/dataloader|DataLoader]]

> [!warning] loading the entire dataset into a tensor inside
Dataset.__init__ (e.g. self.images = torch.stack([load(p) for p in
paths]))
  This collapses lazy loading: every worker process forks a copy of
  the full tensor (RAM x num_workers), startup is huge, and
  pin_memory + non_blocking transfer can no longer overlap with
  I/O. Keep __init__ light (paths + transforms only), do the actual
  load in __getitem__, and let num_workers + pin_memory parallelize
  across the CPU. Pre-stacked tensors belong in TensorDataset for
  already-numeric data — not images on disk.

### [[Sections/deeplearning/training-loop/training-loop-pattern|Training Loop Pattern]]

> [!warning] scheduler.step() inside the batch loop
for xb, yb in loader:
      optimizer.step(); scheduler.step()   # decays LR per batch, not epoch
  Step it once per epoch unless you're using OneCycleLR (which is per-batch).

### [[Sections/deeplearning/training-loop/model-train-eval|model.train() vs model.eval()]]

> [!warning] validating in train() mode
Dropout still drops -> noisier metrics that look worse than the model is.
  Same trap with BatchNorm: a 1-sample batch in train() divides by zero variance.

### [[Sections/deeplearning/training-loop/save-load-model|torch.save / torch.load]]

> [!warning] torch.save(model, "model.pth")
Pickles the whole class — breaks when the source file moves, the class renames,
  or you upgrade PyTorch. Save state_dict and reconstruct the model in code.

### [[Sections/deeplearning/cnns-vision/conv2d-architecture|CNN Architecture]]

> [!warning] hardcoded view(-1, 64*8*8) in forward()
Breaks the moment input size changes. Use AdaptiveAvgPool2d(1) + flatten(1).

### [[Sections/deeplearning/cnns-vision/maxpool2d|nn.MaxPool2d]]

> [!warning] pooling on tiny feature maps
nn.MaxPool2d(2) on a 4x4 map -> 2x2; another pool -> 1x1 with no signal left.
  Switch to AdaptiveAvgPool2d(1) once spatial dims are small.

### [[Sections/deeplearning/cnns-vision/batchnorm2d|nn.BatchNorm2d]]

> [!warning] BatchNorm + Dropout in the same block, in that order.
BN normalizes; Dropout zeros random units; the next BN sees a corrupted
  mean/var. Pick one (modern CNNs use BN only).

### [[Sections/deeplearning/cnns-vision/dropout|nn.Dropout]]

> [!warning] forgetting model.eval() at inference
Dropout stays active -> randomized predictions, looks like model is broken.
  Always: model.eval() + torch.no_grad() (or @torch.inference_mode()).

### [[Sections/deeplearning/cnns-vision/torchvision-transforms|torchvision Transforms]]

> [!warning] applying augmentation to validation
val_tf with RandomCrop -> different metric every run; you can't compare epochs.
  Validation must be deterministic: Resize -> CenterCrop -> Normalize, full stop.

### [[Sections/deeplearning/cnns-vision/transfer-learning|Transfer Learning]]

> [!warning] pretrained=True with full unfreeze and LR 1e-3
Catastrophically forgets ImageNet features in one epoch. Either freeze, or
  use a much smaller LR (1e-4 to 1e-5) on the body.

### [[Sections/deeplearning/nlp-sequences/embedding-layer|nn.Embedding]]

> [!warning] forgetting padding_idx
Without it, the PAD row gets gradients from every padded position and slowly
  drifts away from zero. Loss looks fine; downstream models see noisy padding.

### [[Sections/deeplearning/nlp-sequences/rnn-patterns|RNN / GRU Patterns]]

> [!warning] feeding padded inputs without packing
The RNN runs on the PAD tokens too, contaminating h_n with padding state.
  Either pack the sequence, or take h at the true length per row.

### [[Sections/deeplearning/nlp-sequences/lstm-patterns|LSTM Patterns]]

> [!warning] keeping (h, c) across the whole epoch without .detach()
Backprop tries to flow through every previous batch -> graph explodes,
  memory blows up, training stalls. Detach at the start of each step.

### [[Sections/deeplearning/nlp-sequences/attention-mechanism|Attention Mechanism]]

> [!warning] forgetting the key_padding_mask
The model attends to PAD tokens; gradients flow into PAD embeddings; metrics
  look fine until inputs at inference happen to be all the same length and
  accuracy collapses. Always pass the pad mask.

### [[Sections/deeplearning/nlp-sequences/tokenization-padding|Tokenization & Padding]]

> [!warning] padding the entire dataset to global max length once
You waste compute every batch. Instead pad per-batch (collate_fn) and
  bucket if length variance is high.

### [[Sections/deeplearning/nlp-sequences/subword-tokenization|Subword Tokenization]]

> [!warning] training your own tokenizer with a model checkpoint you didn't retrain
The pretrained embedding rows are indexed by the OLD vocab. Your new IDs point
  to random embeddings, and the model degrades to garbage. Either retrain the
  embeddings (resize + warm-up) or keep the original tokenizer.

## Statistics & Probability

### [[Sections/stats/descriptive-stats-py/descriptive-stats|mean, median, mode, variance, std]]

> [!warning] defaulting to ddof=0 on sample data
np.std(data) divides by N. For sample-based inference you want the unbiased
  estimator (divide by N-1). Pass ddof=1 — or use pd.Series.std() (default ddof=1).

### [[Sections/stats/descriptive-stats-py/standard-deviation|std, var, sem, coefficient of variation]]

> [!warning] error bars labeled "std" on a sample mean
The reader infers the mean's uncertainty; you've shown them the data's
  spread. Use SEM (or a 95% CI) for mean uncertainty.

### [[Sections/stats/descriptive-stats-py/percentiles-iqr|np.percentile, IQR, boxplot]]

> [!warning] 1.5*IQR fences on small (n < 20) samples
With few observations the fences are wide and miss real outliers, OR they
  flag everything if the data is bimodal. Use bootstrap CIs on the quartiles.

### [[Sections/stats/descriptive-stats-py/correlation|pearsonr, spearmanr, kendalltau]]

> [!warning] reporting r without a scatterplot
Anscombe's quartet: four datasets, identical r, wildly different shapes (one
  linear, one curved, one with an outlier driving the whole thing). Always plot.

### [[Sections/stats/descriptive-stats-py/covariance|np.cov, pandas .cov(), .corr()]]

> [!warning] feeding a non-PSD covariance matrix to a Gaussian / Mahalanobis
Pairwise-deletion or correlation-from-pieces can produce a matrix that ISN'T
  positive semi-definite. Check eigenvalues; use shrinkage if they go negative.

### [[Sections/stats/distributions-py/normal-distribution|scipy.stats.norm]]

> [!warning] passing variance to scale=
scale is the STANDARD DEVIATION, not the variance. norm(loc=0, scale=4) is
  a normal with std=4, not var=4. This is the most common scipy.stats bug.

### [[Sections/stats/distributions-py/probability-distributions|binomial, poisson, exponential, uniform]]

> [!warning] defaulting to normal because "everything is normal eventually"
CLT applies to the SAMPLE MEAN, not the data. Income, file sizes, customer
  lifetimes are skewed populations forever. Normal-on-counts gives negative
  probabilities and broken CIs. Pick the family from the process, then verify.

### [[Sections/stats/distributions-py/confidence-intervals|scipy.stats.t.interval, bootstrap]]

> [!warning] "the 95% CI contains the true value 95% of the time"
Wrong interpretation — that's a Bayesian credible interval. The frequentist
  95% CI says: "if we repeated sampling many times, 95% of intervals computed
  this way would contain the true value." For a single observed CI, it either
  does or doesn't.

### [[Sections/stats/distributions-py/central-limit-theorem|CLT simulation]]

> [!warning] assuming "n=30 is always enough"
The classic rule comes from Pearson-era pre-bootstrap days. With heavy tails
  or strong skew you may need n in the hundreds before the means look normal.
  Always check the means' distribution, not the data's.

### [[Sections/stats/hypothesis-testing-py/t-test|ttest_1samp, ttest_ind, ttest_rel]]

> [!warning] reporting only the p-value
"p < 0.05" with n=100,000 routinely catches differences too small to matter.
  Always report effect size (Cohen's d for means) and a CI on the difference.

### [[Sections/stats/hypothesis-testing-py/anova-test|scipy.stats.f_oneway]]

> [!warning] running pairwise t-tests and ignoring multiple comparisons
3 groups -> 3 pairwise tests at alpha=0.05 -> family-wise error ~14%, not 5%.
  Either use ANOVA + Tukey, or apply Bonferroni / Holm to the t-tests.

### [[Sections/stats/hypothesis-testing-py/chi-squared|scipy.stats.chi2_contingency]]

> [!warning] chi^2 on a 2x2 with one cell < 5
The asymptotic distribution is wrong; p-values are unreliable. Switch to
  Fishers exact, which works for any cell counts.

### [[Sections/stats/hypothesis-testing-py/mann-whitney|scipy.stats.mannwhitneyu]]

> [!warning] choosing Mann-Whitney just to "be safe"
On clean normal data the t-test is more powerful — you'll fail to detect
  real effects. Pick by the data's shape, not by anxiety about assumptions.

### [[Sections/stats/hypothesis-testing-py/multiple-testing|statsmodels.stats.multitest.multipletests]]

> [!warning] running the full battery, then "correcting only the significant ones"
That's not correction — that's selecting. Run the correction over EVERY p-value
  you computed, including the boring ones, or your alpha is meaningless.

### [[Sections/stats/regression-stats-py/simple-linear-regression|scipy.stats.linregress]]

> [!warning] reporting R^2 without checking residuals
R^2 = 0.95 with a curved residual plot is hiding a model misspecification.
  ALWAYS plot residuals vs fitted; the plot tells you what R^2 cant.

### [[Sections/stats/regression-stats-py/multiple-regression|statsmodels.formula.api.ols]]

> [!warning] comparing R^2 across models with different N
Dropping rows for missing data shrinks N; R^2 is not comparable across
  different sample sizes. Filter the data ONCE, fit all candidates on the
  same sample, then compare.

### [[Sections/stats/regression-stats-py/logistic-regression-stats|statsmodels.formula.api.logit]]

> [!warning] judging logistic regression by accuracy on imbalanced data
95% accuracy with 5% base rate is reachable by predicting "no" for everyone.
  Use AUC or Brier; if you must report accuracy, also report base-rate baseline.

### [[Sections/stats/regression-stats-py/cross-validation|sklearn.model_selection.cross_val_score, StratifiedKFold]]

> [!warning] fitting scaler / imputer / encoder OUTSIDE the Pipeline before CV
The fold's "test" data participated in fitting the preprocessor. CV scores
  come back optimistic; production performance disappoints. Always Pipeline.

### [[Sections/stats/regression-stats-py/bootstrap|numpy bootstrap resampling]]

> [!warning] bootstrap on the maximum
The bootstrap distribution of max(X) is biased — a resample can never exceed
  the original max. Use extreme-value theory (gumbel / GEV) for tail behavior.

### [[Sections/stats/regression-stats-py/effect-size|Cohen's d, eta-squared]]

> [!warning] declaring an effect "large" via the d=0.8 threshold without context
Cohens labels are field-relative. In medical trials d=0.2 can be lifesaving;
  in physics d=2 might be a noise-level discrepancy. Always interpret in domain.

### [[Sections/stats/regression-stats-py/power-analysis|statsmodels.stats.power functions]]

> [!warning] post-hoc "observed power" reported alongside p > 0.05
Observed power is a deterministic function of the p-value — it adds no
  information ("we didn't reject, so we had low power" is a tautology). Report
  the MDE the study could have detected instead.

### [[Sections/stats/regression-stats-py/descriptive-stats-full|pandas.describe(), groupby stats]]

> [!warning] reporting df.mean() and df.std() on long-tailed financial data
Means and SDs lie about typical values when the distribution is skewed.
  Report median + IQR (or MAD) for income, prices, sizes, latencies — anything
  that cant go negative and has a long tail.

## Advanced Python

### [[Sections/advanced/decorators/function-decorators|Function Decorators — Wrapping & Enhancing Functions]]

> [!warning] forgetting @functools.wraps
Tracebacks point at "wrapper", introspection breaks (Sphinx docs, pydantic
  schemas, FastAPI routes lose their identity). ALWAYS @functools.wraps(fn).

### [[Sections/advanced/decorators/class-decorators|Class Decorators & Descriptor Protocol]]

> [!warning] a metaclass when a class decorator suffices
Metaclasses are sticky (only one per hierarchy), break with multiple
  inheritance, and confuse type checkers. Reach for class decorator or
  __init_subclass__ first; metaclass only when those genuinely cannot.

### [[Sections/advanced/context-managers/context-manager-patterns|Context Managers — Resource Management & State]]

> [!warning] returning True from __exit__ to silence errors
The caller never sees the exception; bugs hide for weeks. Either let it
  propagate (return False) or catch the SPECIFIC type and log; never blanket.

### [[Sections/advanced/context-managers/generators-advanced|Advanced Generators & Itertools]]

> [!warning] list(huge_generator()) "just to be safe"
You've thrown away the generator's whole point. If you genuinely need all
  items, fine; otherwise iterate, or use islice / sum / any / max directly.

### [[Sections/advanced/pathlib-logging/pathlib-patterns|pathlib — Modern File Path Handling]]

> [!warning] f-string path joins
path = f"{base}/{name}.txt"
  Backslash on Windows; trailing-slash sensitivity; no validation. Always
  Path(base) / f"{name}.txt".

### [[Sections/advanced/pathlib-logging/logging-config|logging — Structured Application Logging]]

> [!warning] logging.basicConfig() inside library code
First import wins; later config is silently ignored. Libraries should
  only acquire loggers; the application owns configuration.

### [[Sections/advanced/typing-dataclasses/typing-advanced|Advanced Type Hints — Protocols, TypeVar, Overload]]

> [!warning] ABC with @abstractmethod for "this just needs a .read()"
You're forcing inheritance for what is structural typing. Protocol gives
  you the same check at type-check time without the inheritance burden.

### [[Sections/advanced/typing-dataclasses/dataclasses-advanced|Dataclasses — Advanced Patterns]]

> [!warning] items: list = []
Every instance shares the SAME list. Use field(default_factory=list).

### [[Sections/advanced/metaprogramming/metaclass-advanced|Metaclasses — Customizing Class Creation]]

> [!warning] metaclass when a class decorator suffices
Metaclasses are sticky (one per hierarchy), break with multiple inheritance,
  and confuse type checkers. Reach for __init_subclass__ or a class decorator
  first; metaclass is a LAST resort.

### [[Sections/advanced/metaprogramming/descriptor-protocol|Descriptor Protocol — Custom Attributes]]

> [!warning] descriptor that stores state on SELF instead of obj
class Bad:
      def __set__(self, obj, value): self._value = value   # SHARED across all instances
  Use setattr(obj, self._private, value) so each instance gets its own value.

### [[Sections/advanced/metaprogramming/slots-advanced|__slots__ — Memory Optimization]]

> [!warning] __slots__ on a base class WITHOUT __slots__ in every subclass
The first un-slotted subclass adds __dict__ back to ALL instances of that
  subclass and downstream — your memory savings vanish without warning.
  Either commit fully OR don't use slots.

### [[Sections/advanced/metaprogramming/abstract-base-classes|Abstract Base Classes — Contracts & Enforcement]]

> [!warning] ABC for an interface that has only ONE implementation
You added a level of indirection that buys nothing. Drop the ABC; if the
  second implementation appears later, refactor THEN.

### [[Sections/advanced/advanced-patterns-py/singleton-pattern|Singleton Pattern — Global Unique Instance]]

> [!warning] Singleton(metaclass=...) for a Database connection holder
Tests can't swap it; multi-tenant code can't hold two; threadsafety claims
  often hide bugs. Pass a connection in via Depends() / a constructor instead.

### [[Sections/advanced/advanced-patterns-py/observer-pattern|Observer Pattern — Event System & Pub/Sub]]

> [!warning] storing observers in a plain list / set
Subscribed objects can't be garbage-collected because the list pins them.
  Memory grows; callbacks fire on stale objects. Use WeakSet / WeakMethod, OR
  require explicit unsubscribe() in a finalizer.

### [[Sections/advanced/advanced-patterns-py/mixin-pattern|Mixin Pattern — Composable Behaviors]]

> [!warning] 5+ mixins on one class
"Where does .save() come from?" becomes a 5-minute scavenger hunt.
  Refactor into composition or a few clear base classes.

### [[Sections/advanced/advanced-patterns-py/dataclass-advanced|Dataclasses Advanced — Frozen, Post Init, Inheritance]]

> [!warning] validation logic in __init__ via custom subclass of @dataclass
You've recreated half of Pydantic poorly. If validation is non-trivial,
  adopt Pydantic / attrs — they handle dependencies, error aggregation, and
  serialization properly.

## Concurrency & Parallelism

### [[Sections/concurrency/asyncio/asyncio-basics|asyncio Fundamentals — async/await, Tasks & Gathering]]

> [!warning] try/except Exception that swallows CancelledError
The task ignores cancel; shutdown hangs. Catch CancelledError separately
  (or re-raise after cleanup) so the runtime can stop the task.

### [[Sections/concurrency/asyncio/asyncio-patterns|asyncio Patterns — Semaphores, Queues & Streaming]]

> [!warning] starting 10_000 tasks with no Semaphore
Hits OS file-descriptor limits, gets rate-limited, blows up the upstream.
  Always cap with Semaphore (or TaskGroup with N parallel workers).

### [[Sections/concurrency/threading/threading-basics|threading — Concurrent I/O with Threads]]

> [!warning] locking everywhere "to be safe"
Each lock is a serialization point. Wrong one acquires order across two
  locks -> deadlock. Minimize lock scope; consider queue-based hand-off so
  only one thread owns mutable state at a time.

### [[Sections/concurrency/threading/multiprocessing-basics|multiprocessing — True Parallelism for CPU Work]]

> [!warning] passing a 5 GB numpy array to ex.submit(fn, arr)
It's pickled and copied to the worker on every call. Use shared_memory or
  memory-map the file inside the worker.

### [[Sections/concurrency/subprocess/subprocess-run|subprocess — Running External Commands]]

> [!warning] shell=True with f-string user input
subprocess.run(f"ls {user_input}", shell=True)
  user_input = "; rm -rf /" -> game over. Use list form; the OS does NOT split
  spaces or interpret ; & | in list args.

### [[Sections/concurrency/concurrent-futures/threadpool-executor|ThreadPoolExecutor — High-Level Thread Pool]]

> [!warning] creating a new ThreadPoolExecutor inside a hot loop
Each pool spins up workers and tears them down — kills throughput. Create
  ONE pool at startup and reuse it for the lifetime of the service.

### [[Sections/concurrency/concurrent-futures/processpool-executor|ProcessPoolExecutor — High-Level Process Pool for CPU Work]]

> [!warning] ProcessPoolExecutor inside a request handler
Process startup blows the request budget. Pre-create one pool at startup
  and submit work into it; don't construct a fresh pool per request.

### [[Sections/concurrency/concurrent-futures/futures-patterns|Futures Patterns — Wait, Timeout & Cancellation]]

> [!warning] NOT calling future.exception() / .result() on background tasks
Exceptions vanish silently. The task "succeeded" from the pool's view.
  Always: call .result(), use as_completed, or attach a done callback that
  inspects exception().

### [[Sections/concurrency/asyncio-deep/asyncio-event-loop|Event Loop — Core of asyncio]]

> [!warning] storing the loop in a global at import time
The loop doesn't exist until asyncio.run() starts. Globals captured early
  point at a CLOSED loop after the first run. Always fetch via
  get_running_loop() inside an async function.

### [[Sections/concurrency/asyncio-deep/asyncio-streams|asyncio Streams — Async TCP/IP]]

> [!warning] write() without await drain()
Data sits in the buffer; under back-pressure it never gets flushed and the
  writer reports "full". Always: writer.write(...); await writer.drain().

### [[Sections/concurrency/asyncio-deep/asyncio-locks|asyncio Locks & Synchronization]]

> [!warning] while not items: await condition.wait()
Without wait_for(), spurious wakeups (rare but real) can let the loop slip
  past the predicate. Use cond.wait_for(predicate) — it loops for you.

### [[Sections/concurrency/asyncio-deep/asyncio-timeout|asyncio Timeouts & Cancellation]]

> [!warning] swallowing CancelledError without re-raising
The task ignores cancellation; shutdown hangs; the runtime can't reclaim
  resources. ALWAYS re-raise after your finally/cleanup runs.

### [[Sections/concurrency/multiprocessing-deep/mp-pool|multiprocessing.Pool — Process Pool API]]

> [!warning] pool.terminate() in normal flow
Workers die mid-task; partial state on disk; resources leak. Reserve
  terminate() for "the orchestrator is dying anyway"; otherwise close + join.

### [[Sections/concurrency/multiprocessing-deep/mp-queue-pipe|multiprocessing Queue & Pipe — Inter-Process Communication]]

> [!warning] forgetting q.task_done() in the failure path
q.join() blocks forever; the orchestrator hangs on shutdown. Always
  try/finally so task_done() is called even when process(item) raises.

### [[Sections/concurrency/multiprocessing-deep/mp-shared-memory|multiprocessing Shared State — Value, Array, Manager]]

> [!warning] hot-path Manager().dict updates
Each m.dict[key] = value is a round-trip to the manager process; throughput
  collapses. Aggregate locally in each worker, Queue.put() once at the end.

### [[Sections/concurrency/multiprocessing-deep/mp-lock|multiprocessing Synchronization Primitives]]

> [!warning] lock.acquire() with no timeout, no try/finally
First exception leaks the lock; every other process hangs. ALWAYS use
  "with lock:" — it releases even if your code raises.

### [[Sections/concurrency/threading-patterns/threading-lock|threading Synchronization — Lock, Condition, Event, Semaphore]]

> [!warning] try/except that swallows exceptions inside a lock
The lock is released, the bug is invisible, and the next thread sees corrupt
  state. Either fix the bug, or re-raise after cleanup; never silently eat it.

## LLMs & AI Engineering

### [[Sections/llm-ai/openai-api/chat-completions|OpenAI Chat Completions — GPT-4, Structured Output & Streaming]]

> [!warning] relying on prompt instructions like "respond ONLY with JSON".
The model occasionally returns "Here's your JSON: { ... }" and your parser
explodes in production. Use response_format with a Pydantic model -- the SDK
guarantees a parsed object or raises.

### [[Sections/llm-ai/openai-api/function-calling|Function Calling & Tool Use — Agentic LLMs]]

> [!warning] 'eval(tool_call.function.arguments)' or feeding tool args
straight to a SQL string. The arguments come from a stochastic system; treat
them like user input. Pydantic validation, allow-listed tables/columns, and
parameterized queries are not optional.

### [[Sections/llm-ai/embeddings-vectors/embeddings|Text Embeddings — Semantic Search & Similarity]]

> [!warning] re-embedding documents on every query. Embeddings are
deterministic per (model, dim, text). Compute once, store with a content
hash, look up by hash. Re-embedding is the single biggest LLM cost line item
in production RAG when nobody is watching.

### [[Sections/llm-ai/embeddings-vectors/vector-databases|Vector Databases — Pinecone, Chroma, pgvector & Weaviate]]

> [!warning] storing the embedding WITHOUT recording which model produced it.
When you upgrade text-embedding-3-small -> -large, retrieval quietly degrades
because old and new vectors live in different spaces. Always store the
embedder identifier and filter on it.

### [[Sections/llm-ai/rag-langchain/rag-pipeline|RAG — Retrieval-Augmented Generation Pipeline]]

> [!warning] stuffing 30 chunks into the prompt and hoping the model finds
the right one. Long contexts bury the signal; latency and cost spike. Five
well-ranked chunks beat thirty mediocre ones, every time.

### [[Sections/llm-ai/rag-langchain/langchain-agents|LangChain — Chains, Agents & Production Patterns]]

> [!warning] AgentExecutor with no max_iterations and no LangSmith trace.
When the agent loops (it will), you can't see why and can't stop it cheaply.
Set max_iterations, capture intermediate_steps, and turn tracing on.

### [[Sections/llm-ai/prompt-engineering/prompt-patterns|Prompt Engineering — Patterns That Actually Work]]

> [!warning] "Just write a really good prompt." Without an eval set you'll
tweak forever and call it done when the latest example happens to look good.
Pin a golden set of 30-100 cases; gate prompt changes on accuracy + latency.

### [[Sections/llm-ai/prompt-engineering/fine-tuning|Fine-Tuning LLMs — When & How]]

> [!warning] fine-tuning to "teach the model our docs". The model memorizes
fragments unevenly, hallucinates the rest, and you can't update without
retraining. Use RAG. Fine-tune for SHAPE (style, format), use RAG for STATE
(facts, prices, dates, customer data).

## Data Engineering

### [[Sections/data-engineering/airflow/airflow-dags|Airflow DAGs — Orchestrating Data Pipelines]]

> [!warning] heavy data processing inside @task functions
Airflow workers are ORCHESTRATORS, not a compute engine. Pandas DataFrames
  on the worker box bottleneck on memory and don't scale. Trigger Spark / dbt
  / cloud functions; keep @task bodies thin.

### [[Sections/data-engineering/dbt/dbt-models|dbt — SQL Transformations as Code]]

> [!warning] SELECT * inside a mart model
When the upstream adds a column you didn't expect, downstream BI breaks
  and lineage tools can't track which columns are used. Always enumerate
  columns; rely on contracts to catch surprises.

### [[Sections/data-engineering/data-validation/pydantic-pandera|Pydantic & Pandera — Data Validation at Scale]]

> [!warning] validating only at ingestion, then assuming downstream is clean
Each transformation can break invariants. Place @check_types on every
  pipeline boundary; validation is cheap, debugging bad data is not.

### [[Sections/data-engineering/pyspark/pyspark-basics|PySpark Basics — SparkSession & DataFrames]]

> [!warning] .toPandas() on a 50 GB DataFrame
Pulls everything to the driver and OOMs. Filter / aggregate first; convert
  only the FINAL small result to Pandas.

### [[Sections/data-engineering/pyspark/pyspark-transformations|PySpark Transformations — select, filter, withColumn, groupBy]]

> [!warning] groupBy + agg(F.collect_list("col"))
Materializes ALL rows per group into a single record. Memory and shuffle
  blow up. Aggregate to scalars (sum, max, count_distinct) or use windows.

### [[Sections/data-engineering/pyspark/pyspark-sql|PySpark SQL — SQL Queries on DataFrames]]

> [!warning] f-string interpolation into spark.sql
spark.sql(f"SELECT * FROM sales WHERE region = '{user_input}'")
  That's a SQL-injection-shape bug. Use {param} args= substitution instead.

### [[Sections/data-engineering/pyspark/pyspark-udf|PySpark UDFs — User-Defined Functions]]

> [!warning] @udf returning Python objects (datetime, dict, list) without spec
Spark serializes per row using pickle — orders of magnitude slower than Arrow.
  Switch to @pandas_udf with explicit return types; the gain is usually 50-100x.

### [[Sections/data-engineering/pyspark/pyspark-io|PySpark I/O — Reading & Writing Data]]

> [!warning] partitionBy("user_id") on millions of users
Creates millions of tiny directories; metadata listing dominates query time.
  Use bucketBy() for high-cardinality keys, partitionBy() only for low-card.

### [[Sections/data-engineering/polars/polars-basics|Polars Basics — DataFrames & I/O]]

> [!warning] calling .collect() between every step
df.collect().filter(...).collect().group_by(...).collect()
  Each .collect() materializes; the optimizer sees nothing. Build the entire
  chain on a LazyFrame, then ONE .collect() at the end.

### [[Sections/data-engineering/polars/polars-expressions|Polars Expressions — Expression API & Lazy Evaluation]]

> [!warning] chains of .apply(lambda ...) translated 1:1 from Pandas
You've thrown away Polars' speed advantage. Rewrite the lambda using
  pl.col / when/then / .str / .dt — only fall back to map_elements when no
  built-in covers the case.

### [[Sections/data-engineering/polars/polars-vs-pandas|Polars vs Pandas — When & How to Migrate]]

> [!warning] rewriting a working Pandas pipeline "for the speed" with no benchmark
The migration cost is real; speedup may be small for your sizes. Profile
  first; migrate only the bottleneck.

### [[Sections/data-engineering/dask/dask-dataframe|Dask DataFrames — Lazy Distributed Data]]

> [!warning] ddf.compute() on a multi-GB frame, hoping it fits
Driver OOMs, or spills to disk and is slower than the lazy chain. Always
  compute the AGGREGATED / FILTERED result, not the raw frame.

### [[Sections/data-engineering/dask/dask-delayed|Dask Delayed — Task Graphs for Custom Logic]]

> [!warning] calling a delayed function the same way as a normal one
result = transform(load("a.csv")).result()        # forgot dask.compute()
  You're holding Delayed objects; nothing has run. Either dask.compute() the
  final node, or call .compute() on the leaf you want.

### [[Sections/data-engineering/dask/dask-distributed|Dask Distributed — Multi-Machine Execution]]

> [!warning] hammering the cluster with millions of tiny submits
Scheduler overhead dominates; throughput plummets. Batch into chunks of
  ~1000 items, OR use dask.bag / dask.dataframe with proper partition sizes.

### [[Sections/data-engineering/etl-patterns/etl-extract|ETL: Extract — Reading from Multiple Sources]]

> [!warning] f-string SQL interpolation
query = f"SELECT * FROM sales WHERE region = '{user}'"   # SQL injection
  Use sa.text() with bound :params — it parameterizes the query at the driver.

### [[Sections/data-engineering/etl-patterns/etl-transform|ETL: Transform — Cleaning & Standardizing Data]]

> [!warning] dropping NaNs without logging
The pipeline runs, the warehouse is "clean", and nobody knows that 30%
  of yesterday's source rows were silently discarded. ALWAYS log counts
  before / after; alert on the diff.

### [[Sections/data-engineering/etl-patterns/etl-load|ETL: Load — Writing to Warehouse & Cloud]]

> [!warning] if_exists="replace" in production
Drops the table, recreates it, loses indexes / grants / partitions, and any
  parallel reader sees zero rows mid-deploy. Use append + UPSERT, or
  partition-overwrite for re-runnable loads.

### [[Sections/data-engineering/etl-patterns/prefect-basics|Prefect — Modern Python Orchestration]]

> [!warning] heavy data work directly inside @flow body
The flow body is ORCHESTRATION code; tasks are the unit of retry, caching,
  and observability. Wrap real work in @task — even tiny helpers — so that
  failures show up in the right place in the Prefect UI.

## Type Hints & mypy

### [[Sections/typing/core-typing/basic-annotations|Type Annotations — Variables, Functions & Collections]]

> [!warning] typing everything as Any "to make mypy quiet". Any disables ALL
checks for that value -- it doesn't make the bug go away, it hides it. Either
fix the type or, if you must, use 'object' so you're forced to narrow.

### [[Sections/typing/core-typing/advanced-annotations|Advanced Types — Literal, TypedDict, Annotated & Overload]]

> [!warning] TypedDict with total=False AND no NotRequired markers, then
treating every field as required in business logic. mypy stays quiet because
the dict accepts missing keys; KeyError shows up only at 3am in production.

### [[Sections/typing/generics-protocols/typevar-generics|TypeVar & Generics — Parameterized Types]]

> [!warning] TypeVar("T", int, str) (constraints) when you really wanted
bound=SupportsXxx. Constraints PICK ONE of the listed types per call site,
they do NOT mean "any subtype of these"; bound is the right tool 95% of the time.

### [[Sections/typing/generics-protocols/protocol|Protocol — Structural Typing (Duck Typing with Types)]]

> [!warning] making a Protocol method body anything but '...'. A Protocol's
methods are signatures. Putting a real body makes it half-ABC, half-Protocol;
subclasses won't reliably inherit it across versions and mypy treats it as both.

### [[Sections/typing/mypy/mypy-config|mypy — Configuration, Strict Mode & Common Patterns]]

> [!warning] bare '# type: ignore'. It silences EVERY error on the line --
including ones introduced later by a refactor that you'd want to know about.
Always 'type: ignore[specific-code]', and turn on warn_unused_ignores so the
checker complains when the suppression stops being needed.

### [[Sections/typing/type-narrowing/isinstance-narrowing|isinstance & issubclass Narrowing — Union Type Refinement]]

> [!warning] trusting isinstance(x, list[Foo]). Generic parameters are erased
at runtime. The expression raises TypeError; even if it didn't, the [Foo]
part would be ignored. Validate the container, then validate the elements.

### [[Sections/typing/type-narrowing/typeguard|TypeGuard & TypeIs — Custom Type Narrowing Functions]]

> [!warning] TypeGuard predicate whose body says 'return True' unconditionally.
mypy will obediently narrow. Production will deserialize garbage as your type
and the bug surfaces three layers downstream where the trail is cold.

### [[Sections/typing/type-narrowing/assert-never|assert_never & Never — Exhaustive Type Checking]]

> [!warning] 'else: pass' or 'else: raise NotImplementedError' on a closed
union. mypy will not warn when a new variant is added. assert_never is the
ONLY else-branch that turns "missing a case" into a build-break.

### [[Sections/typing/advanced-generics/paramspec|ParamSpec & Concatenate — Typing Higher-Order Functions]]

> [!warning] typing a decorator as Callable[..., R] -> Callable[..., R].
Both '...' are independent Anys -- mypy stops checking the wrapped function
entirely, autocomplete dies, and bugs sneak in through kwargs typos.

### [[Sections/typing/advanced-generics/typevaruple|TypeVarTuple & Unpack — Variadic Generics]]

> [!warning] TypeVarTuple where tuple[T, ...] would do. tuple[int, ...]
already encodes "any length, all int"; reaching for TypeVarTuple here only
hides that fact and slows the type checker.

### [[Sections/typing/advanced-generics/generic-class|Generic Classes — Typed Containers & Covariance/Contravariance]]

> [!warning] marking a TypeVar covariant on a class that ALSO has a setter.
It type-checks today, then a caller passes a narrower type, the setter writes
a wider value, and the next reader gets the wrong concrete type at runtime.

### [[Sections/typing/advanced-generics/self-type|Self Type — Methods Returning the Current Class]]

> [!warning] hardcoding the parent class as a return type ('-> Builder' on a
parent's method). Subclasses inherit the method but mypy reports the parent
type at the call site -- chained calls then can't see subclass methods.

### [[Sections/typing/runtime-types/get-type-hints|get_type_hints & Type Introspection — Reflection at Runtime]]

> [!warning] reading cls.__annotations__ directly. With
'from __future__ import annotations' you get STRINGS, not types. Every
downstream isinstance() check then fails silently; runtime libraries
(Pydantic, dataclasses) call get_type_hints precisely to avoid that trap.

### [[Sections/typing/runtime-types/runtime-checkable|@runtime_checkable Protocol — isinstance() Type Checking]]

> [!warning] scattering @runtime_checkable on every Protocol you write.
Each one adds a runtime cost AND lulls callers into believing the check is
strong. Reserve it for protocols you actually dispatch on, and harden those
with a one-time signature audit (the lru_cache version above).

### [[Sections/typing/runtime-types/dataclass-typed|Typed Dataclasses — Type Hints + Data Structures]]

> [!warning] default=[] / default={} / default=set(). All instances will
SHARE the same list/dict/set. Use field(default_factory=list) every time.
This bug ships in tutorials regularly; reviewers should grep for these.

## Packaging, CLI & Tooling

### [[Sections/packaging/packaging/pyproject-uv|pyproject.toml & uv — Modern Python Packaging]]

> [!warning] setup.py exists in 2026, with manual version bumps on a branch
nobody can find. Use a build backend that derives version from the git tag,
trusted-publish from CI, and never edit version strings in source.

### [[Sections/packaging/cli-tools/typer-click|Typer & Click — Building CLI Applications]]

> [!warning] print()-then-exit(1) error handling. Pipelines lose the message
(it went to stdout), and exit(1) is too coarse for callers to react. Use
click.echo(..., err=True) for diagnostics and EX_* codes for outcomes.

### [[Sections/packaging/cli-tools/logging|Logging & Observability — Production Python]]

> [!warning] building a JSON string by hand inside log.info(...). The log
aggregator can't index those fields, redaction can't see them, and a misplaced
quote breaks parsing for the whole line. Pass kwargs; let the renderer serialize.

### [[Sections/packaging/modern-packaging/pyproject-toml|pyproject.toml — Project Configuration Standard]]

> [!warning] leaving 'version = "0.0.0"' next to a CI step that bumps it via
sed. The git history disagrees with PyPI. Use hatch-vcs / setuptools-scm so the
version IS the tag -- one source of truth, no drift.

### [[Sections/packaging/modern-packaging/uv-package-manager|uv — The Ultrafast Package Manager]]

> [!warning] 'uv sync' in CI without --frozen. A drifted pyproject silently
resolves new versions; the lockfile no longer reflects what shipped. Always
'uv sync --frozen' on protected branches and treat lock changes as PRs.

### [[Sections/packaging/modern-packaging/virtual-environments|Virtual Environments — Isolating Dependencies]]

> [!warning] 'sudo pip install ...' on the system Python. It wedges OS tools
(apt, dnf, macOS Python links) and breaks the next OS upgrade. Every project
gets its own .venv, period.

### [[Sections/packaging/modern-packaging/poetry|Poetry — Dependency Management & Publishing]]

> [!warning] 'poetry install' in CI without --sync. Stale local installs of
REMOVED packages remain in the venv; tests pass locally and fail in prod.
Always 'poetry install --no-root --sync' so the env mirrors poetry.lock.

### [[Sections/packaging/modern-packaging/pip-tools|pip-tools — Requirements Pinning & Compilation]]

> [!warning] editing requirements.txt by hand to "fix" a version. The next
pip-compile rewrites your edit and the team blames the tool. Edit the .in file,
recompile, commit BOTH .in and .txt -- never just the .txt.

### [[Sections/packaging/distribution/package-structure|Package Structure — src/ Layout & __init__.py]]

> [!warning] 'from my_package import *' as the only documentation of your
public API. Without __all__, callers see and depend on private names; you can
never refactor internals without breaking them. Define __all__ explicitly.

### [[Sections/packaging/distribution/setup-cfg|setup.cfg & setup.py — Legacy Packaging (For Maintenance)]]

> [!warning] encoding install logic in setup.py (e.g., calling pip from
inside setup()). PEP 517 builds run setup.py in an isolated env without
network or your dev tools. Move the logic to pyproject.toml or a postinstall
script the user runs themselves.

### [[Sections/packaging/distribution/publishing-pypi|Publishing to PyPI — Build, Upload, Versioning]]

> [!warning] editing version, building, and uploading from a developer
laptop. The wheel reflects the dev's environment (debug libs, transient
patches), and credentials live in shell history. Build and publish from CI
only; treat 'git tag' as the release trigger.

### [[Sections/packaging/distribution/conda-environments|Conda & conda-environments — Mixing conda + pip]]

> [!warning] 'conda install' followed by 'pip install' followed by another
'conda install'. Each conda call tries to "fix" what pip did and may
downgrade pip-installed packages. Order matters: conda first for the science
stack, THEN pip/uv for everything else, then never mix back.

### [[Sections/packaging/dev-tools/ruff-linting|ruff — The Fast Linter & Formatter]]

> [!warning] ruff check --fix on a dirty working tree, in CI, with a stale
config. The fixer rewrites code; if a rule was wrong, you can't tell what
came from review and what came from the bot. Run 'ruff check' in CI; run
'--fix' locally before commit, ideally via pre-commit.

### [[Sections/packaging/dev-tools/pre-commit|pre-commit — Hooks for Linting, Testing, Type Checking]]

> [!warning] routine 'git commit --no-verify'. If the hooks are too slow,
move them to 'pre-push' or CI. If they're noisy, fix the rule. Bypassing
becomes the team's habit; the hooks become wallpaper.

### [[Sections/packaging/dev-tools/mypy-config-packaging|mypy — Type Checking Configuration]]

> [!warning] bare '# type: ignore' AND disable_error_code = ["misc", "attr-defined"].
That's a hide-the-bug machine. Use error-code-scoped ignores; turn on
warn_unused_ignores so the checker complains when a suppression is no longer
needed. The suppression list shrinks; the bug count goes with it.

## CLI Tools

### [[Sections/cli/argparse/argparse-basics|ArgumentParser, add_argument(), parse_args()]]

> [!warning] reading sys.argv directly inside main() and never returning an
exit code. Tests can't drive the function with a custom argv, and shells can't
tell success from failure. main(argv=None) -> int is the contract.

### [[Sections/cli/argparse/argparse-types|type=, choices=, nargs=, action=, default=, required=]]

> [!warning] type=lambda s: open(s) (or similar resource-acquiring lambdas).
A failed parse leaks an open file because argparse doesn't manage cleanup of
converted values. Convert names; open files inside main().

### [[Sections/cli/argparse/argparse-subcommands|add_subparsers(), set_defaults()]]

> [!warning] a 200-line if/elif chain matching args.cmd. Each new command
means editing the dispatcher AND the parser AND probably the imports.
Decorator + registry keeps add/remove to one file each.

### [[Sections/cli/argparse/argparse-groups|add_argument_group(), add_mutually_exclusive_group()]]

> [!warning] stuffing every constraint into nested argparse calls. Mutex
groups are not nestable, and 'required=True' on a parent group doesn't
imply anything about children. When the rule isn't "exactly one of N
flags", write it in validate(args) and call parser.error() to keep the
UX consistent with argparse's other diagnostics.

### [[Sections/cli/click/click-basics|@click.command(), @click.option(), @click.argument(), click.echo()]]

> [!warning] print()-then-sys.exit(1). Pipelines lose the diagnostic (it
went to stdout) and 1 is too coarse. Use click.echo(..., err=True) and a
typed ClickException with the correct sysexits code.

### [[Sections/cli/click/click-types|type=click.Path(), click.Choice(), click.IntRange(), click.File()]]

> [!warning] doing validation INSIDE the command body. The error wording is
inconsistent with Click's diagnostics, --help can't show the constraint, and
tests can't drive the validator without invoking the whole command.

### [[Sections/cli/click/click-groups|@click.group(), @click.pass_context, click.Context]]

> [!warning] importing every subcommand at top of the entry-point module.
'mycli --help' takes 2s because it loaded TensorFlow. LazyGroup or
entry_points loaded on demand keep --help instant; users notice.

### [[Sections/cli/click/click-prompts|click.prompt(), click.confirm(), click.password_option(), click.progressbar()]]

> [!warning] an interactive prompt that has NO non-interactive alternative.
CI workflows hang forever waiting for stdin; users discover it 6 hours into a
release. EVERY prompt needs a flag (or env var) that bypasses it.

### [[Sections/cli/typer/typer-basics|typer.Typer(), Annotated, typer.Option(), typer.Argument()]]

> [!warning] Typer commands that print errors AND return cleanly. Pipelines
can't distinguish success from failure. Use raise typer.Exit(code=N) (not
sys.exit) so Typer prints the right diagnostic and the shell sees a non-zero
exit code consistent with sysexits.

### [[Sections/cli/typer/typer-app|typer.Typer(), app.command(), app()]]

> [!warning] pretty_exceptions_show_locals=True in production. A crash on a
password-handling line will dump the password into the user's terminal AND
(worse) the system log. Keep show_locals=False; surface enough context with
explicit error messages.

### [[Sections/cli/cli-utilities/rich-output|rich.print(), Console, Table, Progress]]

> [!warning] print() with ANSI escapes hard-coded in your strings. They
render as literal '\x1b[31m...' in non-TTY contexts AND can't be disabled
via NO_COLOR. Use a Console; let Rich decide what to emit.

### [[Sections/cli/cli-utilities/sys-argv|sys.argv, sys.stdin, sys.stdout, sys.stderr]]

> [!warning] 'print(json.dumps(huge_dict))' on a tool meant for pipes. The
stdout buffer fills, downstream's read() blocks, you're convinced the tool
is hung. Stream the records (one JSON object per line, or sys.stdout.flush()
regularly) and the pipeline never stalls.

## Filesystem & Paths

### [[Sections/filesystem/pathlib/path-basics|Path()]]

> [!warning] comparing Path objects with str on either side
Path("a") == "a"  -> False (different types). Use Path("a") == Path("a"),
  or coerce with str(p) when interfacing with non-Path APIs.

### [[Sections/filesystem/pathlib/path-operations|.exists(), .is_file(), .is_dir(), .mkdir(), .rename(), .unlink()]]

> [!warning] "if exists, then create" / "if exists, then delete"
Two threads / processes can race in the gap and either both create the dir
  (causing FileExistsError on the second) or both try to delete and one fails.
  Use the missing_ok / exist_ok flags so the operation is idempotent.

### [[Sections/filesystem/pathlib/path-glob|.glob(), .rglob()]]

> [!warning] list(rglob("*")) on a tree containing node_modules / .venv
Pulls millions of irrelevant files into memory. Always exclude noise dirs
  in the iteration, or use Path.walk + prune.

### [[Sections/filesystem/pathlib/path-read-write|Path.read_text(), Path.write_text(), Path.read_bytes(), Path.write_bytes()]]

> [!warning] open(path) without encoding=
Default encoding depends on the LOCALE (latin-1 on some servers, cp1252 on
  Windows). The same code reads different bytes on different machines. Always
  pass encoding="utf-8" explicitly.

### [[Sections/filesystem/pathlib/path-joinpath|/ operator, .joinpath(), .resolve()]]

> [!warning] f-string path joins
f"{base}/{name}.txt" — backslash on Windows, missing slash if base ends in
  "/", no validation. Always Path(base) / f"{name}.txt".

### [[Sections/filesystem/file-io/open-modes|open()]]

> [!warning] open(path) without encoding=
Default encoding depends on the LOCALE (cp1252 on Windows, utf-8 on most Linux).
  The same code reads different bytes on different machines. Always specify.

### [[Sections/filesystem/file-io/file-read-methods|.read(), .readline(), .readlines(), iteration]]

> [!warning] f.read() on a 5 GB log file
Loads the whole thing into memory; OOMs the process. Stream line-by-line
  or chunk-by-chunk; only materialize the result you actually need.

### [[Sections/filesystem/file-io/file-write-methods|.write(), .writelines(), flushing, buffering]]

> [!warning] f.writelines(items) expecting newlines added
The name implies "lines" but it's just iterable-of-strings concatenation.
  Append "\n" to each item yourself, OR use print(item, file=f) which does.

### [[Sections/filesystem/file-io/csv-module|csv.reader(), csv.writer(), csv.DictReader(), csv.DictWriter()]]

> [!warning] open(csv_path) without newline=""
On Windows the writer doubles "\r" -> blank rows between every record;
  the reader joins newlines wrong inside quoted fields. ALWAYS newline="".

### [[Sections/filesystem/file-io/json-module-fs|json.load(), json.dump(), json.loads(), json.dumps(), indent=]]

> [!warning] trying to JSON-dump custom objects with no default= or encoder
TypeError: Object of type X is not JSON serializable. Either add a default=
  callback, subclass JSONEncoder, or coerce to dict at the boundary (.to_dict()).

### [[Sections/filesystem/os-shutil/os-path|os.path.join(), os.path.exists(), os.getcwd(), os.listdir(), os.environ]]

> [!warning] a + '/' + b for paths -- breaks on Windows, double-slashes on Unix,
and silently allows '/etc/passwd' if b is user-controlled.

### [[Sections/filesystem/os-shutil/shutil-copy|shutil.copy(), shutil.copy2(), shutil.copytree(), shutil.rmtree()]]

> [!warning] shutil.rmtree(user_input) without a sandbox guard.
A relative '..' or absolute '/' wipes the wrong tree -- there is no undo.

### [[Sections/filesystem/os-shutil/shutil-move-archive|shutil.move(), shutil.make_archive(), shutil.unpack_archive()]]

> [!warning] tarfile.extractall(untrusted) without filter or path validation.
A malicious tarball with '../../etc/cron.d/x' will plant a cron job in /etc.

### [[Sections/filesystem/os-shutil/tempfile|tempfile.NamedTemporaryFile(), tempfile.TemporaryDirectory(), mkdtemp()]]

> [!warning] tempfile.mktemp() (no 'k' missing -- the deprecated one).
It only returns a name; another process can win the race and create that path
before you do. Always use mkstemp() / NamedTemporaryFile / TemporaryDirectory.

### [[Sections/filesystem/os-shutil/glob-fnmatch|glob.glob(), glob.iglob(), fnmatch.fnmatch()]]

> [!warning] glob.glob('**/*.py') without recursive=True. It returns []
silently and you spend an hour wondering why your linter sees no files.

## Regular Expressions

### [[Sections/regex/regex-basics/re-match|re.match() vs re.search() vs re.fullmatch()]]

> [!warning] 'if re.match(pattern, s)' as a validator. match() is anchored
only at the START, not the END -- 'foo@bar.com<script>' passes. Use fullmatch
(or anchor with \A...\Z) for validation; reserve match() for explicit
prefix-stripping in parsers.

### [[Sections/regex/regex-basics/re-findall|re.findall() and re.finditer()]]

> [!warning] re.findall(pat, huge_text) when you only need the first match.
It builds the entire list before returning, paying O(N) memory for one item.
Use re.search(pat, huge_text) or 'next(pat.finditer(s), None)' instead.

### [[Sections/regex/regex-basics/re-sub|re.sub() and re.subn()]]

> [!warning] building the replacement string with f-strings that include
user input. Backslashes and \g<name> in user data become regex directives.
Always pass a callable when ANY part of the replacement is user-controlled.

### [[Sections/regex/regex-basics/re-split|re.split()]]

> [!warning] re.split(r",", csv_line). It "works" until the first quoted
field with a comma inside, then silently breaks every consumer downstream.
Use the csv module for CSV. Use a real parser for anything with quoting,
escapes, or nesting.

### [[Sections/regex/regex-basics/re-compile|re.compile()]]

> [!warning] 'p = re.compile(...)' inside a hot loop. Each iteration burns
the parsing cost; the cache helps only if you stayed inside re.search()
semantics. Compile module-globally, or memoize via lru_cache when the
pattern is constructed dynamically.

### [[Sections/regex/regex-groups/re-groups|Capture groups, named groups, match.group(), match.groups()]]

> [!warning] extracting fields with positional groups, then accessing by
index 4 layers later. The pattern grows, you insert a group, every index
downstream is off by one and tests "still pass" because the strings happen
to look right. Use named groups; let renames stay local.

### [[Sections/regex/regex-groups/re-non-capturing|Non-capturing groups, lookahead, lookbehind]]

> [!warning] 'wrap any nested quantifier in (?:...)'. Non-capturing doesn't
fix backtracking. r"(?:a+)+$" is just as exponential as r"(a+)+$". Atomic
groups, possessive quantifiers, or rewriting the pattern are the real fixes.

### [[Sections/regex/regex-groups/re-backreferences|Backreferences in patterns and replacements]]

> [!warning] trying to parse JSON / HTML / SQL / nested parens with backrefs.
Backreferences make a regex non-regular but still cannot recognize balanced
nesting beyond a fixed depth. Use a real parser; you'll spend less time on
the regex than on debugging the cases it handles 90% of.

### [[Sections/regex/regex-patterns/re-character-classes|Character classes, quantifiers, escapes]]

> [!warning] '.+?' as the universal "match anything between" pattern. It
works but leaves the engine doing maximal backtracking on every character.
Replace with '[^X]+' (where X is the delimiter) for linear-time matching.

### [[Sections/regex/regex-patterns/re-flags|re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE]]

> [!warning] 'flags=re.IGNORECASE | re.MULTILINE' on every regex out of
habit. Each flag changes semantics in ways that bite: \w widens, ^/$
moves, '.' grows. Reach for the SPECIFIC flag the pattern needs and
document why.

### [[Sections/regex/regex-patterns/re-common-patterns|Practical regex patterns]]

> [!warning] shipping a "validates email" regex pulled off Stack Overflow.
RFC-correct emails permit IP-literal domains, IDN, quoted local-parts, and
more. The regex passes review, fails on a real customer at 2 AM. Use the
specialized parser; the regex's job is to find candidates fast.

### [[Sections/regex/regex-patterns/re-verbose|re.VERBOSE for readable multi-line patterns]]

> [!warning] a 200-character single-line regex in a module that nobody
touches because "it works". The next bug fix takes a half-day to even read
the pattern. re.VERBOSE costs nothing at runtime; pay it once.

## Web (Flask, Django)

### [[Sections/web/flask/flask-app|Flask()]]

> [!warning] app.run(debug=True) in production
Werkzeug's dev server is single-threaded and ships an interactive debugger
  over the network. Always wrap with Gunicorn / uwsgi behind a reverse proxy.

### [[Sections/web/flask/flask-routes|@app.route()]]

> [!warning] hand-coding URLs in templates / responses
"/users/" + str(uid) breaks the moment you mount the app under a prefix or
  move a route. Always url_for(); it respects blueprints and reverse-routing.

### [[Sections/web/flask/flask-request-response|request, jsonify()]]

> [!warning] returning {"error": e.errors()} with 200 OK
Clients can't tell success from failure. Always pair an error body with the
  correct 4xx / 5xx status code, and keep the JSON shape stable across endpoints.

### [[Sections/web/flask/flask-blueprints|Blueprint()]]

> [!warning] importing the app inside blueprint modules
Creates circular imports the moment you split files. Keep blueprint modules
  pure (Blueprint + routes only) and register them inside create_app().

### [[Sections/web/flask/flask-jinja2|render_template()]]

> [!warning] turning off autoescape "to make my HTML render"
Means you stopped escaping ALL user input. The fix is to wrap the trusted
  string with Markup(...) on the way in, never to disable autoescape globally.

### [[Sections/web/flask/flask-sqlalchemy|SQLAlchemy()]]

> [!warning] catching IntegrityError without rollback
The session is poisoned and every later commit fails. ALWAYS:
      try:    db.session.commit()
      except: db.session.rollback(); raise

### [[Sections/web/flask/flask-middleware|@app.before_request, @app.after_request]]

> [!warning] returning None from after_request
The decorator REQUIRES the response object back. Returning None or a tuple
  silently 500s the next request. Always: return response.

### [[Sections/web/fastapi-web/fastapi-middleware|@app.middleware, CORSMiddleware]]

> [!warning] allow_origins=["*"] WITH allow_credentials=True
The browser refuses to send cookies; auth silently breaks. Either pin origins
  OR drop credentials — never both wide open at once.

### [[Sections/web/fastapi-web/fastapi-background-tasks|BackgroundTasks]]

> [!warning] doing the email send inline before returning
The user waits 2-5 seconds; SMTP timeouts cascade into 504s. Either move it
  to BackgroundTasks (loss-tolerant) or to a real queue (durable).

### [[Sections/web/fastapi-web/fastapi-websockets|@app.websocket()]]

> [!warning] try/except Exception that swallows WebSocketDisconnect
You'll keep the dead socket in the manager forever. Catch WebSocketDisconnect
  FIRST and unregister; only then catch Exception for the unexpected.

### [[Sections/web/fastapi-web/fastapi-auth|OAuth2PasswordBearer, JWT]]

> [!warning] bcrypt(plain).verify() over the wire timing-leak
Always go through pwd.verify(...). And never compare token strings with ==;
  verify the SIGNATURE — string equality is meaningless once an attacker forges JWTs.

### [[Sections/web/fastapi-web/fastapi-testing|TestClient]]

> [!warning] monkeypatching the global db engine
Tests leak into each other; ordering matters; flakes appear. Use
  app.dependency_overrides — it's per-app, scoped, and trivially reversible.

### [[Sections/web/django/django-setup|django-admin startproject]]

> [!warning] DEBUG = True in production
Stack traces leak source code, ALLOWED_HOSTS is bypassed, SECRET_KEY exposure
  becomes catastrophic. Always set DEBUG via env, default to False in base.py.

### [[Sections/web/django/django-models|models.Model]]

> [!warning] enforcing invariants only in clean() / forms
Bulk updates, raw SQL, and migrations bypass model.clean(). Constraints in
  Meta.constraints run at the DATABASE level — they can't be skipped.

### [[Sections/web/django/django-orm|QuerySet methods]]

> [!warning] read-modify-write counters
p = Post.objects.get(pk=1); p.view_count += 1; p.save()
  Two concurrent requests both read 5, write 6 — one increment lost.
  Use F("view_count") + 1 inside an .update() call.

### [[Sections/web/django/django-views|Function-based views]]

> [!warning] writing on GET
def upvote(request, pk):
      post.likes += 1; post.save()
  Browser prefetchers, link previewers, and bots all hit GET. You'll see "ghost"
  upvotes. Writes go behind POST + CSRF, always.

### [[Sections/web/django/django-class-based-views|ListView, DetailView, CreateView]]

> [!warning] subclassing UpdateView and rewriting get/post in full
You've thrown away every advantage. If you need that much control, drop to a
  FBV — it's clearer than fighting the CBV machinery.

### [[Sections/web/django/django-forms|forms.Form, forms.ModelForm]]

> [!warning] Meta.fields = "__all__" on a model with sensitive fields
(is_admin, balance, role, password_hash). A user POSTs them with values you
  never intended to expose. Always allowlist with a fixed fields tuple.

### [[Sections/web/django/django-admin|admin.site.register, ModelAdmin]]

> [!warning] looping with .save() in a custom action
for obj in queryset: obj.is_published = True; obj.save()
  Triggers N save signals + N round-trips. Use queryset.update(...) — one SQL.

### [[Sections/web/django/django-rest-framework|Serializer, APIView, ModelViewSet]]

> [!warning] putting validation in the view's create() method
The same rule needs to fire on PATCH, custom actions, and bulk endpoints.
  Validation goes on the serializer; the view just routes.

### [[Sections/web/web-deployment/gunicorn|gunicorn]]

> [!warning] gunicorn --reload in production
File-watcher restart adds latency, fights graceful shutdown, and is a
  debugging-only feature. Reload is a deploy concern, not a server flag.

### [[Sections/web/web-deployment/uvicorn|uvicorn]]

> [!warning] --workers + --reload together
Reload mode forks a single watcher; --workers is silently ignored. The
  server you end up with is single-process. Pick one or the other.

### [[Sections/web/web-deployment/httpx-client|httpx.AsyncClient]]

> [!warning] forgetting client.aclose()
Connections leak; the OS file-descriptor table fills; new connects start
  timing out under load. Use lifespan or async with — never bare instantiation.

## Databases & SQLAlchemy

### [[Sections/database/sqlalchemy-orm/sqlalchemy-engine|create_engine() — Connection Pool & Engine]]

> [!warning] creating a fresh Engine per request. Each one builds a new
pool, opens 5+ connections, and dies after one query — exhausting the
database's connection limit in seconds. Engine is a SINGLETON per process.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-session|Session — Unit of Work and Identity Map]]

> [!warning] a module-level Session() shared across requests/threads. Each
request lands in the same identity map, mutations leak between users, and
concurrent commits race. Session is request-scoped; ENGINE is process-scoped.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-declarative|Declarative Models — DeclarativeBase + Mapped[T]]]

> [!warning] per-row created_at written from Python (default=datetime.now)
rather than the database (server_default=func.now()). Clock drift between
app servers means rows that arrived seconds apart can be timestamped out of
order. Always let the DB stamp time.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-select|select() — Modern Query API]]

> [!warning] session.query(...).all() and then filtering in Python. Pulls
the entire table into memory just to discard 99% of it. Push the WHERE
into the SQL — the database is faster at filtering than your loop.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-relationships|relationship() — Eager vs Lazy Loading]]

> [!warning] relying on default lazy loading, then iterating relationships in
a loop. Each iteration fires a SELECT. 1 user + 100 posts + 500 comments =
601 queries. Tests pass (small data); production crawls. Eager-load
explicitly OR use lazy="raise" so the bug surfaces in tests.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-loading-strategies|Loading Strategies — joinedload, selectinload, raiseload, contains_eager]]

> [!warning] joinedload on a *-to-many relationship without .unique(). The
JOIN multiplies parent rows by the number of children; you get duplicate
User objects in your result list. Either .unique() to dedupe or switch to
selectinload (which avoids the Cartesian product entirely).

### [[Sections/database/sqlalchemy-orm/sqlalchemy-transactions|Transactions — begin, commit, rollback, savepoints, isolation]]

> [!warning] catching exceptions inside the with-begin block and "continuing"
without re-raising. The transaction is poisoned after any error — the next
query in it raises InvalidRequestError. Either use savepoints (begin_nested)
to isolate the failure, or let the exception propagate so the outer block
rolls back cleanly.

### [[Sections/database/sqlalchemy-orm/sqlalchemy-scoped-session|scoped_session — Thread / Request-Scoped Session Management]]

> [!warning] scoped_session without remove(). Each request opens a Session;
without remove(), connections accumulate in the pool and never return. Tests
pass (small N); production OOMs after a day. Always pair scoped_session with
a teardown hook that calls .remove() — every framework has one.

### [[Sections/database/sqlalchemy-core/metadata-table|MetaData & Table — SQLAlchemy Core schema]]

> [!warning] mixing ad-hoc Table() definitions in different MetaData
instances within the same app. drop_all / create_all only sees one
MetaData; you'll forget which one owns which table and end up with
orphan schemas. ONE MetaData per app, used by both Core and ORM.

### [[Sections/database/sqlalchemy-core/raw-sql-execute|text() & raw SQL — parameterized execution]]

> [!warning] f-string interpolation of values into SQL — `f"WHERE id = {user_id}"`.
That's classic SQL injection. ALWAYS bind values as parameters. The exception
(identifiers like table/column names) requires an allowlist plus dialect quoting,
never raw user input.

### [[Sections/database/sqlalchemy-core/core-vs-orm-decision|Core vs ORM — when to use which]]

> [!warning] writing ORM code that does session.add() in a loop for bulk
inserts. Each call hits the unit-of-work, identity map, and event system —
10,000 inserts can take minutes. Switch to Core insert(table) with a list
of dicts: same data, ~50x faster, single round-trip if your driver supports
executemany. Keep ORM for the cases where its features (identity, change
tracking, cascades) actually pay for themselves.

### [[Sections/database/sqlalchemy-core/connection-pool|Connection Pool — QueuePool, NullPool, StaticPool, sizing]]

> [!warning] QueuePool with a forking server and no engine.dispose() after
fork. Children inherit the parent's open file descriptors (the connections);
both the parent and children try to use the same socket; the database sees
protocol errors and closes them all. Either NullPool or post_fork dispose
— pick one.

### [[Sections/database/drivers/psycopg3|psycopg 3 — modern PostgreSQL driver]]

> [!warning] executemany on a 100k-row batch when COPY is available.
executemany still issues one INSERT per row over the wire (with bound
parameters); COPY streams the whole batch as one payload. A 100k-row insert
is ~30s with executemany and ~0.5s with COPY. If the batch is large, COPY.

### [[Sections/database/drivers/asyncpg|asyncpg — high-performance async Postgres driver]]

> [!warning] leaving statement_cache_size at the default behind pgbouncer
in transaction mode. asyncpg prepares statements on the backend connection
it sees; pgbouncer reassigns connections per transaction; the next call
gets 'prepared statement does not exist'. Fix: statement_cache_size=0, or
session-mode bouncer, or talk straight to Postgres.

### [[Sections/database/drivers/sqlite3-stdlib|sqlite3 — Python stdlib SQLite driver]]

> [!warning] per-row commits in a tight loop. The default isolation_level
wraps every statement in an implicit transaction; each commit fsyncs the
journal. 100,000 inserts -> ~1000s with per-row commits, ~1s wrapped in one
txn. `with con:` or `BEGIN IMMEDIATE` is the difference between toy and
production throughput.

### [[Sections/database/drivers/aiosqlite|aiosqlite — async wrapper around sqlite3]]

> [!warning] launching N concurrent write coroutines on aiosqlite expecting
parallel throughput. SQLite serializes writes at the file lock; without a
coordinating asyncio.Lock you'll see cascading "database is locked" errors
after busy_timeout expires. If you need parallel writes, switch DB.

### [[Sections/database/migrations/alembic-init|Alembic init — bootstrap migrations on an existing project]]

> [!warning] not setting a naming_convention on MetaData. Autogenerate will
produce constraint names like 'uq_users_email_001' on one machine and
'uq_users_email' on another (depending on driver, dialect, and luck). Diffs
become noise; CI flaps. Set the convention BEFORE generating the first
migration — backporting it later requires editing every existing migration.

### [[Sections/database/migrations/alembic-revision|Alembic revision — write a safe online migration]]

> [!warning] a single migration that does add_column(NOT NULL) + UPDATE +
ALTER all in one transaction on a 10M-row table. PG holds an
AccessExclusiveLock for the whole rewrite + index-rebuild + UPDATE; readers
AND writers stall; the deploy times out at the load balancer; the
transaction rolls back; you've taken downtime AND made no progress. Split
the work; cap each step's blast radius.

### [[Sections/database/migrations/data-migrations|Data migrations — chunked, idempotent backfill]]

> [!warning] putting the backfill inside an Alembic migration. Alembic
wraps the migration in a transaction; the lock holds until done; the
deployment hangs; rollback either does nothing or rewinds the work. Worse:
CI tooling and operators can't observe progress, can't pause, can't resume.
Backfills are jobs, not migrations. Schema migrations stay short.

### [[Sections/database/migrations/branching|Alembic branching — multiple heads & merge revisions]]

> [!warning] using alembic branches to model "this migration only runs in
environment X". Branches are a graph structure, not a feature flag —
environment-specific schema belongs in env.py via include_object or
include_schemas filters, not in branch labels. If the migration shouldn't
run, omit it from include_object; don't put it on a branch and "forget" to
upgrade that branch.

### [[Sections/database/patterns/repository-pattern|Repository pattern — abstract the persistence layer]]

> [!warning] a Repository that exposes one method per query — get_by_id,
get_by_email, get_active_by_email, get_active_by_email_with_orders... a
Specification object collapses the combinatorial explosion into one find()
method that takes filter criteria. If your repo class has 30 get_X
methods, refactor toward Specifications.

### [[Sections/database/patterns/unit-of-work|Unit of Work — atomic, repository-aware transactions]]

> [!warning] calling external APIs (email, payment, webhook) inside the
UoW's transaction. The transaction blocks while the API responds; if the
DB commits and the API succeeds — fine. If DB commits and API fails — you
can't roll back. If API succeeds and DB rolls back — duplicate side
effect. Either: (a) call the API BEFORE commit and rely on idempotency,
or (b) write an OutboxEvent inside the txn and let a worker dispatch.

### [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading]]

> [!warning] lazy="select" (the default) + iterating a collection in a
template/loop. The N+1 is invisible until it hits 50× scale, when latency
spikes and your DB CPU climbs without a clear cause. Default to
lazy="raise" on every relationship; let CI fail when you forget the option.

### [[Sections/database/patterns/isolation-levels|Isolation levels — preventing the inventory oversell]]

> [!warning] catching SerializationFailure and continuing without a retry.
A serialization failure means Postgres aborted the txn because committing
would violate serializability — the fix is to re-run the txn from the
beginning, not to swallow it. Catch + retry; do not catch + ignore.

## Debugging & Profiling

### [[Sections/debugging-profiling/builtin-debugging/pdb-breakpoint|pdb / breakpoint() — interactive Python debugger]]

> [!warning] setting sys.excepthook = pdb.post_mortem globally in code that
might run unattended (cron, systemd, supervisord, Docker). When something
raises at 3am the process pauses at the (Pdb) prompt forever — the host's
memory fills, the orchestrator marks it healthy because it hasn't exited,
and your incident clock keeps ticking. Use the scoped contextmanager OR
guard with an env var (DEV_AUTO_PDB=1) that's never set in prod.

### [[Sections/debugging-profiling/builtin-debugging/traceback-formatting|traceback — capture, format, and chain exceptions]]

> [!warning] catching an exception, logging only str(exc), and re-raising
a fresh Exception WITHOUT 'from'. The log loses the line number; the new
exception has no __cause__ chain; the operator sees "PaymentRefused"
without knowing it was a ValueError on negative input. Always: 'raise
DomainError("...") from original' — five extra characters that save hours.

### [[Sections/debugging-profiling/builtin-debugging/faulthandler-segfault|faulthandler — Python traceback on segfault / hang]]

> [!warning] turning on faulthandler ONLY in dev. The whole point is
production crashes — when a C extension segfaults at 4am, you have one
chance to capture a traceback and the dev-only build has lost it. Enable
faulthandler in EVERY environment; it's cheap and only fires on disaster.
The dual mistake: pointing file=stderr in a containerized service that
discards stderr on crash. Use a real file the host preserves.

### [[Sections/debugging-profiling/builtin-debugging/inspect-introspection|inspect — programmatic signature introspection]]

> [!warning] reading __annotations__ directly instead of using
get_type_hints(). Under 'from __future__ import annotations' or PEP 695
generics, __annotations__ contains string names — you'll think the type
is the string "int" instead of the int class. get_type_hints() resolves
the names against the function's globals and locals; that's the only
correct way to read modern type hints.

### [[Sections/debugging-profiling/cpu-profiling/cprofile-deterministic|cProfile — stdlib deterministic profiler]]

> [!warning] profiling the whole program when you already know which
function is slow. cProfile's per-call overhead distorts everything below
the function you care about — small helpers look hotter than they are,
and you waste an afternoon optimizing the noise. Scope the profiler to
the suspect region; let the rest of the program run at full speed.

### [[Sections/debugging-profiling/cpu-profiling/pyspy-sampling|py-spy — sampling profiler for live processes]]

> [!warning] importing cProfile inside a long-running production handler
to "find what's slow". cProfile's per-call overhead changes the perf
profile; the artifact is hard to extract from a running container; you
have to deploy code to install it. py-spy attaches AT WILL to the
already-running process — that's exactly what production diagnosis needs.

### [[Sections/debugging-profiling/cpu-profiling/scalene-line|scalene — line-level CPU + memory + GPU profiler]]

> [!warning] running scalene under a dev shell that's also doing other
work (build, indexing, language server). Sampling profilers attribute time
to whatever was on-CPU when the sample fires; a noisy host produces
noisy profiles. Use a dedicated terminal, close other heavy processes,
and prefer a separate CI runner for regression tests over a shared
build agent.

### [[Sections/debugging-profiling/memory-profiling/tracemalloc-stdlib|tracemalloc — stdlib heap snapshot profiler]]

> [!warning] calling tracemalloc.start() AFTER the suspect code has run.
Allocations made before start() are invisible to the snapshot — they
look like 0 bytes. The diff against a "before" snapshot taken at startup
is the only reliable way to see growth. Always start() at the very top
of your entrypoint, then take a baseline snapshot once warm.

### [[Sections/debugging-profiling/memory-profiling/memray-allocs|memray — production-grade allocation tracker with flame graphs]]

> [!warning] using memray on a CI runner that's also building wheels,
tarring artifacts, or running other tests in parallel. The tracker
attributes memory to the calling Python process correctly, but the
capture file balloons (multi-GB for an hour-long run) and CI disk
fills. Bound runs with --duration; capture short windows; or run on a
dedicated perf runner.

### [[Sections/debugging-profiling/memory-profiling/gc-debugging|gc / weakref — diagnose reference cycles and stuck objects]]

> [!warning] writing __del__ on objects that participate in cycles.
When a cycle exists and any member has __del__, Python cannot decide a
safe finalization order — the whole cycle goes into gc.garbage and is
never freed. weakref.finalize achieves the same goal (run code on
collection) without making the object uncollectable. New code should
never write __del__; it's a footgun whose only legitimate use case
(cleanup that can't be expressed via context managers) is now better
served by finalize().

### [[Sections/debugging-profiling/async-attach/asyncio-debug|asyncio debug mode — slow-callback and blocking-IO detection]]

> [!warning] leaving asyncio's debug mode off in development. Sync calls
on the event loop (requests.get instead of httpx, time.sleep instead of
asyncio.sleep, blocking DB drivers instead of asyncpg/aiosqlite) all run
fine in tests but kneecap throughput in prod. debug=True is free; turn
it on in dev + CI and the next time someone forgets an async equivalent,
CI fails before the deploy.

### [[Sections/debugging-profiling/async-attach/post-mortem-attach|Production attach — inspect a live process without restart]]

> [!warning] setting a breakpoint via debugpy on a production pod that's
still receiving traffic. The debugger pauses the process at the
breakpoint; every concurrent request waits; the load balancer marks the
pod healthy because TCP is up; latency p99 spikes; eventually the pod
is killed mid-debug-session for being too slow. ALWAYS remove the pod
from the load balancer FIRST (label flip, deregister from service mesh,
or use a dedicated debug replica) before attaching debugpy.

## Observability

### [[Sections/observability/structured-logging/structlog-basics|structlog — structured logging with dev + prod renderers]]

> [!warning] f-string formatting INSIDE the log call:
log.info(f"user {uid} logged in from {ip}")
Loses every advantage of structured logging — the message becomes a
string blob; you can't filter "all events for user 42"; tests have to
parse the string. Always: log.info("user_login", user_id=uid, ip=ip).

### [[Sections/observability/structured-logging/log-correlation-ids|Correlation IDs — propagate request_id across logs and services]]

> [!warning] passing request_id as an explicit argument through every
function. It pollutes signatures, bleeds into every test, and the first
helper that forgets to forward it breaks the chain. ContextVar is the
right tool: each request (or asyncio Task spawned from it) gets its
own copy, no argument plumbing required.

### [[Sections/observability/structured-logging/log-sampling-budgets|Log sampling — keep signal, drop volume, hit a budget]]

> [!warning] a global "X-Force-Log" header that's not authenticated.
Anyone who learns it can flip the sample rate to 100% on every request
they make and walk your log bill up to whatever they want. ALWAYS gate
the bypass on auth (admin role, signed token, IP allowlist) — it's a
denial-of-wallet attack vector if not.

### [[Sections/observability/distributed-tracing/otel-tracing-setup|OpenTelemetry tracing — SDK setup, spans, exporters]]

> [!warning] setting sample rate to 100% in production "for full
visibility". OTLP traffic, collector capacity, and storage all scale
with span volume — at 1000 RPS × 10 spans/req × 100% sampling, you're
shipping 10k spans/s, often hundreds of GB/day. Use 5-10% rate-based
sampling with parent-based honoring; pair with tail-based sampling at
the collector for "always sample errors and slow requests" without
the head-sampling bill.

### [[Sections/observability/distributed-tracing/otel-instrumentation|OTel auto-instrumentation — FastAPI, SQLAlchemy, httpx, Redis]]

> [!warning] instrumenting twice — once via opentelemetry-instrument
agent, then again via Instrumentor().instrument() in code. You get
duplicate spans for every operation; flame graphs become unreadable.
Pick ONE mode and document it; the agent for "I want this everywhere
in prod", explicit instrumentation for "this one component needs a hook".

### [[Sections/observability/distributed-tracing/span-context-propagation|Span context propagation — across async, threads, queues]]

> [!warning] assuming queue messages older than the trace TTL still
belong in the same trace. A message enqueued 6 hours ago, processed
now, will show as a 6-hour-long parent span — and many tracing UIs
will refuse to display it. Cap message age (1-5 min); for older
messages, start a fresh trace with trace.Link pointing at the old
context. The link preserves the relationship; the trace doesn't pretend
the work happened all at once.

### [[Sections/observability/metrics/prometheus-client|prometheus_client — Counter / Histogram / Gauge for Prometheus]]

> [!warning] using Summary for latency in a multi-pod deployment.
Summary computes quantiles inside the process; you cannot aggregate
Summary quantiles across pods (averaging quantiles is mathematically
meaningless). Use Histogram instead — it ships counts per bucket;
Prometheus aggregates with histogram_quantile() correctly across pods.

### [[Sections/observability/metrics/otel-metrics|OpenTelemetry metrics — unified pipeline with traces]]

> [!warning] using OTel metrics for a Python service that ONLY needs
Prometheus output and runs under gunicorn with multiple workers. The
OTel Python metrics SDK doesn't have a multiprocess mode yet (as of
2026); each worker exports its own values, which the Prometheus
exporter doesn't aggregate across workers. prometheus_client with
PROMETHEUS_MULTIPROC_DIR is the right answer for that case. Use OTel
metrics when you need OTLP, vendor portability, or unified pipeline
with traces — not because "it's the new thing".

### [[Sections/observability/metrics/metric-cardinality|Cardinality discipline — design metrics that don't explode]]

> [!warning] adding metrics for "we'll figure out queries later".
Cardinality is paid up-front (every label combo creates storage), but
the value is realized later (when someone queries it). Defer-decision
leads to "labels we never queried" creating millions of series. Audit
your existing metrics quarterly; drop labels that aren't in any
alert, dashboard, or query — they're pure cost.

### [[Sections/observability/errors-alerting/sentry-sdk|Sentry SDK — production exception tracking]]

> [!warning] leaving traces_sample_rate at 1.0 in production for a
high-traffic service. Sentry charges per transaction; at 1000 RPS
24/7 that's ~2.6B transactions/month. Most plans cap at 10M before
overage. Use 0.1 (10%) or a traces_sampler that always samples errors
and 5-10% of healthy traffic. Healthcheck routes should sample 0.

### [[Sections/observability/errors-alerting/structured-error-context|Correlated error context — one ID across logs, traces, Sentry]]

> [!warning] each tool generates its own correlation id. Sentry has its
own event_id; logs have their own request_id; traces have trace_id;
none match. When an alert fires, you copy event_id, search logs, get
nothing. Pick ONE canonical id (trace_id is the right answer) and
attach it to the others. Without that, the three planes are three
disconnected silos.

### [[Sections/observability/errors-alerting/alerting-rules|SLO-based alerting — multi-window, multi-burn-rate PromQL]]

> [!warning] alerts on per-pod metrics in a Kubernetes cluster.
When a node fails, every pod on it triggers the same alert; on-call's
phone explodes; the actual problem (NodeDown) is buried in noise.
Aggregate at the SERVICE level (sum across pods), alert on that,
and use inhibition rules so node-level failures silence the pod-level
noise. Per-pod metrics are still useful for dashboards — just not
alerts.

## Caching

### [[Sections/caching/in-memory/functools-lru-cache|functools.lru_cache / cache — memoize pure functions]]

> [!warning] @lru_cache on async functions. The decorator caches the
coroutine OBJECT (the awaitable), not its awaited result. The first
call returns a coroutine; you await it. The second call returns the
SAME coroutine — already-awaited, raising RuntimeError("cannot reuse
already awaited coroutine"). Use asyncache.cached or roll your own
with asyncio.Lock + dict.

### [[Sections/caching/in-memory/cachetools-policies|cachetools — TTL, LFU, LRU policies + thread-safe wrappers]]

> [!warning] building a memory-bounded cache without getsizeof. The
default counts ENTRIES, not bytes. A cache of 10,000 large blobs (say,
1MB each) at maxsize=10,000 holds ~10GB; you wanted "50MB cap" and got
OOM. Pass getsizeof=sys.getsizeof (or pympler.asizeof for accuracy)
AND set maxsize in bytes. Only then does the cache bound memory.

### [[Sections/caching/in-memory/request-scoped-cache|Request-scoped cache — DataLoader pattern, contextvars]]

> [!warning] a module-level dict used as a request-scoped cache.
The dict is shared across every request the process serves. User A's
data lands in the dict; user B's request reads it; you've shipped a
data-leak bug. Request-scoped means request-LIFETIME — a fresh dict
per request, attached to request.state or a ContextVar reset in
the request middleware.

### [[Sections/caching/redis/redis-py-basics|redis-py — connect, get/set, pipelines, async, pools]]

> [!warning] opening a fresh Redis connection per request (e.g.,
redis.Redis(host=...) inside a handler). Each one performs a TCP
handshake (~1ms loopback, 1-10ms remote); under load you saturate
Redis's accept queue. Always use a module-level client backed by a
ConnectionPool — one pool per process, sized to your concurrency.

### [[Sections/caching/redis/cache-aside-pattern|Cache-aside — read-through with fallback to source]]

> [!warning] cache-aside without stampede protection on a hot key.
When the key expires, EVERY request that misses fires a DB query at
the same time. A 100 RPS hot endpoint at 60s TTL produces ~1-3 second
DB CPU spikes every minute as 100 concurrent queries pile on. SETNX
single-flight lock or XFETCH early refresh costs ~5 lines; pays for
itself the first time the DB starts erroring under cache-expiry
bursts.

### [[Sections/caching/redis/cache-invalidation|Cache invalidation — delete, version, tag, pub/sub fanout]]

> [!warning] invalidating the cache BEFORE writing to the source.
The (cache, then DB) order produces a small race window where a
concurrent reader misses cache, fetches OLD data from DB (the write
hasn't happened yet), and re-populates the cache with the old value.
After the DB write completes, the cache contains stale data with no
remaining invalidation event. The right order is: write DB first;
THEN delete cache; THEN publish invalidation. Pair with version-stamped
keys to eliminate the race entirely.

### [[Sections/caching/http-cdn/http-caching-headers|HTTP cache headers — Cache-Control, ETag, conditional GETs]]

> [!warning] Cache-Control: public on a user-specific response.
CDNs and shared proxies will serve user A's response to every other
user. The classic incident: someone caches /me/profile or /api/orders
as 'public, max-age=60'; minutes later, support tickets flood in
about seeing strangers' data. ALWAYS 'private' for any response that
varies by user, OR set Vary: Authorization (CDN keys per auth header)
AND audit Vary actually does what you think.

### [[Sections/caching/http-cdn/cdn-edge-caching|CDN edge caching — surrogate keys, purge, hit-rate debugging]]

> [!warning] fire-and-forget purge AFTER the response goes out.
Sequence: PUT /widget/42 → 200 OK → background task purges CDN. The
user that triggered the PUT can see the OLD response on their next
GET (CDN still has it; they're inside max-age). Two fixes: (a) issue
the purge BEFORE returning the success response, or (b) use soft
purge + stale-while-revalidate (the entry is marked stale; the next
read fetches fresh from origin while the user gets last-known-good
instantly).

### [[Sections/caching/patterns/cache-stampede|Cache stampede — single-flight, XFETCH, request coalescing]]

> [!warning] holding a per-key asyncio.Lock for the WHOLE compute,
including external IO, while not setting any timeout. If the source
call hangs, every caller for that key hangs forever. Always pair
in-process Locks with asyncio.wait_for(...) timeouts; pair Redis
SETNX locks with PX TTL (auto-expire) so a dead lock holder can't
deadlock the cluster.

### [[Sections/caching/patterns/cache-key-design|Cache key design — namespace, version, tenant, hash safely]]

> [!warning] scattering f-string keys across the codebase. f"user:{uid}"
in handler.py, f"user:{user_id}" in cache.py, f"u:{uid}" in someone's
personal helper. A rename means grepping every file and hoping;
typos in obscure routes serve random data; "we'll just flush" becomes
the only safe deploy. ALL keys go through ONE module (here, KEYS).
That module is the cache schema; treat it as carefully as your DB
migrations.

### [[Sections/caching/patterns/cache-warmup|Cache warmup — pre-populate after deploy / restart]]

> [!warning] hammering the source with 1000-way parallel warmup.
An eager script that fires every hot-user fetch concurrently will slam
the DB harder than steady-state traffic, possibly tripping circuit
breakers and timing out replicating peers. Bound concurrency
(Semaphore) AND watch source latency; throttle if p95 climbs above
steady-state. Warmup should be invisible to other services.

### [[Sections/caching/patterns/cache-coherence-multi-tier|Multi-tier cache — L1 (in-process) + L2 (Redis) coherence]]

> [!warning] writing to L1 BEFORE L2. A concurrent reader between
"write L1" and "write L2" finds L1 hit -> returns the new value;
meanwhile, a different process reads L2 (still empty) -> falls
through to DB -> writes OLD L2 (race with our pending L2 write) ->
overwrites. Always L2-first on writes; L1-first is for reads only.

## Crypto & Secrets

### [[Sections/crypto-secrets/hashing/hashlib-modern|hashlib & hmac — content hashing and message authentication]]

> [!warning] comparing HMAC tags or password hashes with == or
string equality. Python's == short-circuits at the first differing
byte; an attacker measuring timing can guess the tag byte-by-byte.
ALWAYS use hmac.compare_digest — it iterates the full length even on
mismatch. The leak is real and exploitable on networks where you
control the request rate (LAN, same-region cloud).

### [[Sections/crypto-secrets/hashing/password-hashing|argon2 / bcrypt — store and verify passwords correctly]]

> [!warning] using SHA-* (or anything from hashlib) for password
storage. Generic hashes are designed to be FAST — that's the
property attackers want too. A modern GPU computes ~10 billion
SHA-256 hashes per second; a typical 8-character password cracks in
under an hour. Argon2 takes ~250ms per attempt by design — a 1000×
slowdown that makes brute force economically infeasible.

### [[Sections/crypto-secrets/hashing/secrets-module|secrets — cryptographically-secure tokens and constants]]

> [!warning] using uuid.uuid4() as a security token. UUID4 is 122
bits of randomness in a 36-char string — fine entropy, but the
format is recognizable AND it's easy to start using uuid1 (which
leaks MAC + timestamp) by accident. secrets.token_urlsafe(16) is
128 bits in 22 chars and unambiguously cryptographic. uuid is for
IDs (database rows, request IDs); secrets is for tokens (anything
the user mustn't guess).

### [[Sections/crypto-secrets/crypto/fernet-symmetric|Fernet — high-level symmetric encryption with rotation]]

> [!warning] hardcoding the Fernet key in source. The whole point
is that the key is the secret; checking it into git makes encryption
meaningless against anyone with read-access to the repo (now or
future). Load from a secrets manager (env var loaded from Vault /
AWS Secrets Manager / GCP Secret Manager). Rotate any key that ever
touched git history.

### [[Sections/crypto-secrets/crypto/aes-gcm-aead|AES-GCM — authenticated encryption with associated data]]

> [!warning] random 12-byte nonce with AES-GCM at high volume.
Birthday-collision math: ~2^32 messages with the same key gives a
~50% chance of nonce reuse. At a billion messages per key, you've
almost certainly reused; AES-GCM under nonce reuse is catastrophic
(XOR of two plaintexts leaks). Either: rotate the key well before
2^32 encryptions, OR use AES-GCM-SIV which is safe under reuse,
OR use a counter-based nonce with strict accounting.

### [[Sections/crypto-secrets/crypto/rsa-ed25519|Ed25519 / RSA — public-key signing and verification]]

> [!warning] using RSA-PKCS1v15 padding for new code. PKCS1v15
padding has a long history of attacks (Bleichenbacher, etc.) that
RSA-PSS doesn't share. Many libraries default to PKCS1v15 because
legacy systems require it. For new code: use Ed25519 (no padding
choice) OR RSA-PSS with MGF1+SHA256 + max-length salt. NEVER
PKCS1v15 unless you're talking to a system that requires it.

### [[Sections/crypto-secrets/tokens/jwt-python|PyJWT — issue and verify JSON Web Tokens]]

> [!warning] jwt.decode without algorithms= or with algorithms=["none"].
The "alg":"none" footgun: a token forged with header {"alg":"none"} and
no signature passes verification if the library accepts "none". PyJWT
requires algorithms= as a list and rejects "none" by default — DO NOT
pass algorithms=None or [] or include "none". Pin to the SINGLE
algorithm you use; if your kid registry uses different algs per key,
look up the alg by kid first and pass that single string.

### [[Sections/crypto-secrets/tokens/oauth2-flow|OAuth 2.0 — Authorization Code flow with PKCE]]

> [!warning] trusting the redirect_uri from the client request.
Attackers trick a user into starting the flow with a redirect_uri
pointing at attacker.com; the auth code goes to attacker.com.
ALWAYS use a server-side allow-list of redirect URIs per provider;
refuse callbacks for any URI not on the list. Most OAuth providers
also enforce a redirect-URI allow-list at registration — set it
tightly there too.

### [[Sections/crypto-secrets/tokens/session-tokens|Session tokens — opaque vs JWT, cookie attributes, revocation]]

> [!warning] session cookies without __Host-/Secure or with
SameSite=None and no Secure. SameSite=None requires Secure; modern
browsers reject the cookie otherwise. Without HttpOnly, XSS can
steal the cookie via document.cookie. Without Secure, the cookie
rides plain HTTP and a network observer captures it. The right
defaults are __Host- prefix + HttpOnly + Secure + SameSite=Lax;
only relax for documented reasons.

### [[Sections/crypto-secrets/secrets-management/env-var-secrets|Environment-variable secrets — typed loading and validation]]

> [!warning] committing a .env file with real secrets to git. Even
if you delete it later, git history retains it forever (rotate
everything that ever touched git history). Always .gitignore
.env / .env.local; commit .env.example with placeholder values; use
pre-commit hooks (gitleaks, detect-secrets) to catch slip-ups.

### [[Sections/crypto-secrets/secrets-management/secrets-vault|Secrets manager — Vault / AWS / GCP with auto-rotation]]

> [!warning] caching a fetched secret indefinitely with no refresh.
Even with Vault rotation in place, if the app fetches once at startup
and never again, rotation at the manager has zero effect on the running
app — and rotated credentials are typically retired (the OLD password
stops working). Either: poll periodically, watch the file (Vault Agent),
or use a short-lived dynamic secret that the app must renew.

### [[Sections/crypto-secrets/secrets-management/key-rotation|Key rotation — dual-acceptance, kid prefix, batch re-encryption]]

> [!warning] rotating in a single deploy that drops the old key.
The deploy ships with CURRENT_KEY = new; old ciphertext can no longer
decrypt; users see errors; you scramble to roll back. ALWAYS dual-
accept first (deploy keeps both keys); switch encryption next; let
data drain to the new key; THEN retire. The four phases exist for
a reason — every shortcut has a corresponding outage.

## Containerization

### [[Sections/containerization/dockerfile/dockerfile-python-base|Dockerfile — choose the right Python base image]]

> [!warning] python:3.12-alpine for any service with C-extension
wheels. Alpine uses musl-libc; PyPI wheels target glibc; pip falls
back to building from source. numpy build = 5+ minutes of CPU; you
need build-essential which alpine doesn't ship by default. The
resulting image is OFTEN LARGER than the slim equivalent because of
the build chain you had to install. Use slim. The 100MB you "save"
costs 30 minutes of CI time and produces a buggier image.

### [[Sections/containerization/dockerfile/multi-stage-builds|Multi-stage builds — separate build from runtime]]

> [!warning] copying the entire builder /app into the runtime stage.
That brings tests, .git, build caches, every intermediate file. Only
COPY --from=build the specific paths you need: the venv, source
under your package, maybe a config file. Anything else either bloats
the image OR leaks something (test fixtures with credentials, .env
files, build artifacts). Be specific.

### [[Sections/containerization/dockerfile/python-deps-cached|Cached pip / uv installs — fast iterative builds]]

> [!warning] 'pip install -r requirements.txt && pip install -e .'
without copying the project source first. The first command needs
requirements.txt; the second needs the whole project. Common bug:
COPY . . happens BEFORE the install commands, defeating the layer
cache. Fix: COPY requirements.txt + install + COPY . . + install
project. Or use uv sync --frozen --no-install-project then COPY +
uv sync (split as two layers).

### [[Sections/containerization/process-model/gunicorn-uvicorn-config|gunicorn + uvicorn — production process configuration]]

> [!warning] setting --workers high (8+) on a 1-CPU container
because "more is better". Each worker is a Python interpreter
with its own memory; 8 workers on 1 CPU means 8× memory cost,
CPU contention, and they all wait for the same single core. Match
workers to CPU LIMITS (not host CPU count); for I/O-bound async
work, 1-2 workers per CPU is plenty. Read cgroup limits, not
os.cpu_count().

### [[Sections/containerization/process-model/signal-handling-shutdown|Graceful shutdown — SIGTERM, drain, lifespan hooks]]

> [!warning] shell-form CMD (CMD gunicorn ...). Shell form runs as
/bin/sh -c "gunicorn ..." — gunicorn becomes a CHILD of sh, and
SIGTERM goes to sh which doesn't propagate to gunicorn. Result:
gunicorn never gets SIGTERM, drops to SIGKILL after the grace period,
in-flight requests die. Use exec form (CMD ["gunicorn", ...]) so
gunicorn is PID 1 directly. Or use 'tini' as ENTRYPOINT to handle
signals + reap zombies.

### [[Sections/containerization/process-model/non-root-user|Non-root user — drop privileges, integrate with k8s securityContext]]

> [!warning] dropping into 'USER 0' or 'USER root' anywhere in the
Dockerfile (or omitting USER entirely; default is root). Even
transiently for "just this RUN" — that command runs as root, and
subsequent layers inherit. If you need root for an apt install, do
it in a stage that doesn't ship to runtime (multi-stage build), or
do all the apt work BEFORE the USER line and ensure USER is the
LAST line before CMD. The default = root behavior is why so many
images ship as root despite intent.

### [[Sections/containerization/container-ops/healthcheck-probes|Health probes — readiness, liveness, startup]]

> [!warning] liveness probe that calls the database. The probe runs
every periodSeconds, multiplied by the number of pods. A 100-pod
deployment with a 5s liveness probe = 1200 DB pings/min just from
probing. Worse: a brief DB outage causes EVERY pod's liveness to
fail, k8s restarts every pod, the cluster goes empty, and when the
DB recovers there's no warm pool. Liveness should be CHEAP and
in-process; deps go in readiness.

### [[Sections/containerization/container-ops/secrets-injection|Secrets injection — k8s Secret, env vs file mount, BuildKit]]

> [!warning] COPY secrets.env into the image, then "we'll just
delete it from the build context next time". Once a layer contains
a secret, EVERY layer below it does too — and 'docker history --no-trunc'
shows the layer command including any 'COPY secrets.env'. Even
'RUN rm secrets.env' on a later layer DOES NOT REMOVE IT from the
previous layer. The only fix is to never put the secret in the
image to begin with: orchestrator inject (env or file mount) for
runtime; BuildKit --mount=type=secret for build-time.

### [[Sections/containerization/container-ops/container-logging|Container logging — stdout JSON, no log files, trace correlation]]

> [!warning] writing log files inside the container (e.g.,
logging.handlers.RotatingFileHandler to /var/log/myapp.log inside
the pod). The container's writable layer fills; logs vanish on
restart; log shipper can't reliably find the file; multi-worker
processes interleave. Always log to stdout/stderr; let the
orchestrator capture; let the log shipper ship. Files in the
container are an antipattern that has cost more incident response
than almost any other Dockerfile mistake.

### [[Sections/containerization/image-hygiene/image-size-optimization|Image-size optimization — measure, trim, distroless]]

> [!warning] optimizing image size by removing files in a LATER
layer (RUN rm -rf /usr/share/doc). The deleted bytes still live in
the previous layer; total size doesn't change because layers are
additive. To actually shrink, EITHER do the install + cleanup in
ONE RUN, OR use multi-stage and don't ship the intermediate layer.
A common "I removed 200MB" claim that didn't move the image size at
all because the RM happened in a separate layer.

### [[Sections/containerization/image-hygiene/image-signing-sbom|Image signing & SBOMs — Cosign, Sigstore, supply-chain attestations]]

> [!warning] signing only the "latest" tag and assuming it covers
everything. Tags are MUTABLE — someone can push a new image to
"latest" and your signature is for the OLD digest. Always sign by
DIGEST (cosign sign IMAGE@sha256:abc...) and reference images by
digest in production. Tag-based references are for humans; digest
references are for security guarantees.

### [[Sections/containerization/image-hygiene/ci-cd-multiarch|Multi-arch CI/CD — buildx, GitHub Actions, image promotion]]

> [!warning] rebuilding the image for each environment with envvars
baked in. "Build once for dev, build again for staging with
STAGING_API_URL set" — now staging and dev have DIFFERENT image
digests. Promotion guarantees evaporate; signature applies to the
original digest only; testing dev doesn't validate staging because
they're not the same artifact. The right pattern: build ONCE; pass
environment-specific config via env vars / k8s ConfigMap at runtime;
promote the SAME digest across environments.

## Messaging & Queues

### [[Sections/messaging-queues/celery/celery-tasks|Celery tasks — define, enqueue, retrieve results]]

> [!warning] pickle as the task serializer. Pickle deserialization
runs arbitrary code; a malicious or corrupted message in the broker
becomes RCE on the worker. The default before Celery 5.0 was pickle;
explicitly set serializer = "json" (or msgpack if you need binary
efficiency). NEVER set accept_content = ["pickle"] — it whitelists
the attack vector.

### [[Sections/messaging-queues/celery/celery-retries|Celery retries — backoff, dead-letter, idempotency]]

> [!warning] catching all exceptions and calling self.retry() for
every kind. Permanent errors (bad email format, missing required
field) RETRY 5 times, fail, occupy worker for 30 seconds, then go
to DLQ for human review of a problem that was diagnosable on the
first attempt. Classify: TRANSIENT errors retry; PERMANENT errors
fail fast and route to DLQ; UNKNOWN errors fail fast (don't burn
retry budget on a mystery).

### [[Sections/messaging-queues/celery/celery-routing-beat|Celery routing & beat — queues, priorities, scheduled tasks]]

> [!warning] running multiple celery beat instances WITHOUT redbeat
(or django-celery-beat). Default scheduler is file-based and per-
instance; if you run two beat processes, they both fire every
scheduled task — duplicate work, possibly conflicting state. For
any HA deployment, switch to redbeat (Redis-backed) or
django-celery-beat (DB-backed); both ensure single-fire across
multiple beat instances.

### [[Sections/messaging-queues/streams/kafka-py|confluent-kafka-python — Kafka producer / consumer with delivery guarantees]]

> [!warning] enable.auto.commit=True (default) with at-least-once
expectations. Auto-commit ticks every 5s independent of processing
success; a crash mid-processing leaves the offset committed for
unprocessed messages -> messages LOST silently. For any production
consumer that does real work, set enable.auto.commit=False and
commit AFTER processing returns successfully.

### [[Sections/messaging-queues/streams/redis-streams|Redis Streams — XADD / XREADGROUP, lighter than Kafka]]

> [!warning] forgetting MAXLEN on XADD. Streams grow unboundedly
until Redis runs out of memory; the broker stops accepting writes
and the producer pipeline stalls. Always XADD with maxlen=N
(approximate=True is fine — slightly larger than N for performance).
Or run XTRIM periodically. Without one, the stream is a memory leak
disguised as a feature.

### [[Sections/messaging-queues/streams/aio-pika-amqp|aio-pika — async RabbitMQ / AMQP with DLX and acks]]

> [!warning] nack(requeue=True) on every error. A poison message
(one that always raises) gets nacked, requeued, redelivered, nacked,
requeued, ... in an infinite loop, blocking new messages and
burning CPU. Use nack(requeue=False) to send it to a DLX (declared
via x-dead-letter-exchange queue argument), where ops can review
without blocking the main queue. Or check x-death count and reject
after N redeliveries.

### [[Sections/messaging-queues/patterns/outbox-pattern|Transactional outbox — publish events atomically with the DB write]]

> [!warning] try { db.commit(); broker.send() }. The two are not
atomic; broker outage between them = lost event with no record.
Outbox makes this a single tx — atomic by construction. The
alternative (CDC via Debezium reading the DB WAL) is even better
for high volume but requires more infrastructure.

### [[Sections/messaging-queues/patterns/idempotency-keys|Idempotency keys — make at-least-once safe to redeliver]]

> [!warning] idempotency by content hash rather than caller-supplied
key. Two events with the same content but DIFFERENT intent (user
paid twice for two different orders) collapse into one. Use a key
the CALLER chose (UUID, request id, order id), not a hash of the
payload.

### [[Sections/messaging-queues/patterns/dead-letter-queues|Dead-letter queues — quarantine poison messages]]

> [!warning] ack immediately on permanent error and discard the
payload. The bug is then unobservable — ops has no signal that
anything broke; the message is lost. ALWAYS DLQ permanent failures
so they show up in dashboards + can be replayed after fix.

## Data Apps

### [[Sections/data-apps/streamlit/streamlit-basics|Streamlit basics — script-as-app, widgets, layout]]

> [!warning] doing expensive work outside @st.cache_data. EVERY
widget interaction reruns the script top-to-bottom; uncached
DB queries, file reads, or model loads run on every keystroke. Wrap
all expensive operations in @st.cache_data (for serializable
results) or @st.cache_resource (for live connections).

### [[Sections/data-apps/streamlit/streamlit-state|Streamlit state — session_state, callbacks, forms]]

> [!warning] mutating session_state INSIDE the body of the script
(not in a callback or button handler). The mutation happens during
render; downstream widgets read the new value; the next rerun
re-mutates; you get an infinite loop or visual flicker. Always
mutate state in callbacks (on_click, on_change) which fire BEFORE
the rerun.

### [[Sections/data-apps/streamlit/streamlit-data-flow|Streamlit caching — cache_data, cache_resource, downloads]]

> [!warning] @st.cache_data on a function returning a DB connection
or live model object. cache_data PICKLES the return value; pickle
of a connection serializes the connection state, which doesn't
unpickle to a working connection. Use @st.cache_resource for live
objects (it stores by reference, no pickle).

### [[Sections/data-apps/dash/dash-callbacks|Dash callbacks — Input/Output/State, chains, pattern-matching]]

> [!warning] writing to a global Python variable from inside a
callback. Dash workers may serve different requests on different
threads/processes; global mutation = race conditions and
cross-user data leaks. Use dcc.Store (browser-side state),
pass values through the callback graph, or persist to a
real backend.

### [[Sections/data-apps/dash/dash-layouts|Dash layouts — bootstrap, theming, multi-page apps]]

> [!warning] hardcoding pixel widths in inline styles for layout.
Looks fine on dev laptop, broken on mobile, broken on 4K monitor.
Use dbc.Row/Col with responsive breakpoints (lg=, md=, sm=) — they
adapt automatically.

### [[Sections/data-apps/gradio/gradio-interface|Gradio Interface — wrap a function as a UI]]

> [!warning] launching with share=True in production. The
*.gradio.live URL is public AND temporary (72-hour TTL). For
production, deploy to HF Spaces (free for public, paid for private)
or self-host behind a real load balancer.

### [[Sections/data-apps/gradio/gradio-blocks|Gradio Blocks — multi-tab UIs, events, state]]

> [!warning] storing per-session state in module-level globals.
Multiple users share the same Python process; one user's state
leaks into another's view. Use gr.State (browser-scoped) for
per-session data.

### [[Sections/data-apps/deployment-auth/streamlit-multipage-auth|Streamlit multipage + auth — pages/ folder, role-based access]]

> [!warning] trusting a user-controlled cookie / query param for
auth state. "?role=admin" can't be trusted; X-Forwarded-User from a
DIRECT request can't be trusted (anyone can set it). Only trust
reverse-proxy headers when Streamlit is bound to a non-public
interface (loopback or private subnet) AND the proxy is the only
ingress. Otherwise users can curl --header "X-Forwarded-User: admin"
and bypass the proxy.

### [[Sections/data-apps/deployment-auth/data-apps-deployment|Deployment — Streamlit / Dash / Gradio behind nginx, sticky sessions]]

> [!warning] deploying Streamlit at scale (1000+ concurrent users)
without considering its single-process stateful model. Streamlit was
designed for "internal tool, 10-50 users" — not as a public app
framework. At scale it becomes flaky: per-session state in process
memory, sticky sessions complicate everything, autoscale-down drops
user sessions, websocket connections accumulate. If you need that
scale, build a real frontend (React/Svelte) backed by FastAPI.

## Classical NLP

### [[Sections/nlp-classical/spacy/spacy-pipeline|spaCy pipeline — load model, tokenize, POS, lemma]]

> [!warning] spacy.load() inside a request handler. Loading
en_core_web_sm takes ~1s; transformer models take 3-5s. Loading
per-request makes every request slow AND wastes memory (each
replica loads its own copy). Load once at startup; share the
loaded model.

### [[Sections/nlp-classical/spacy/spacy-ner|spaCy NER — named entities, rule-based, custom training]]

> [!warning] training a custom NER from 10 examples and shipping
it. NER models need 100s of examples per entity type to be reliable;
10 examples produces a model that overfits to those exact strings.
Either: (a) use rule-based EntityRuler if your entities are
exhaustive, OR (b) annotate 100+ examples per type before training.

### [[Sections/nlp-classical/spacy/spacy-matcher-patterns|spaCy Matcher — token + dependency pattern matching]]

> [!warning] writing complex Matcher patterns when you really need
DependencyMatcher. Token patterns can't express "the SUBJECT of
this verb" — they only express linear sequences. A passive
construction ("Beats was acquired by Apple") flips subject and
object in linear order; DependencyMatcher with REL_OP=">" finds
them by syntactic role regardless of position.

### [[Sections/nlp-classical/sklearn-text/tfidf-vectorizer|TfidfVectorizer — text → numeric features]]

> [!warning] calling fit_transform on the test set (or fitting a
new vectorizer for each split). The vocabulary diverges; OOV
behavior is broken; cross-validation lies. ALWAYS fit on train,
transform on test. Wrap in a sklearn Pipeline so this is enforced.

### [[Sections/nlp-classical/sklearn-text/text-classification|Text classification — Pipeline, baseline, hyperparameter tuning]]

> [!warning] shipping a transformer for a binary classification
task that TF-IDF + LR solves at 95% F1. Transformer adds ~50ms
latency per request, ~100MB+ model size, GPU dependency, and
fine-tuning complexity. For most classification tasks, the linear
baseline is the right answer; reach for transformers only when the
baseline isn't good enough (or when you need cross-domain transfer).

### [[Sections/nlp-classical/sklearn-text/topic-modeling|Topic modeling — LDA, NMF, embeddings + clustering]]

> [!warning] training LDA with n_components=2 on a corpus of 1M
docs and expecting meaningful topics. LDA topic count interacts
strongly with corpus size; rule of thumb: n_topics ≈ sqrt(n_docs)/4
for an initial guess, then tune via coherence. n=2 is essentially
binary clustering — useless for "what topics are in this corpus?".

### [[Sections/nlp-classical/patterns/text-cleaning-pipeline|Text cleaning — normalization, stop words, lemmatization]]

> [!warning] aggressive cleaning before a transformer. Lowercasing,
removing punctuation, removing stop words, lemmatizing — then
feeding into BERT. The transformer's pretraining was on natural
text; aggressive cleaning makes input out-of-distribution. Apply
minimal cleaning (NFKC, optional URL strip) and let the model see
the original.

### [[Sections/nlp-classical/patterns/ngrams-features|N-grams — character vs word, when each helps]]

> [!warning] word n-grams with very large ngram_range (e.g., 1-5)
without min_df. Vocabulary explodes from ~10k unigrams to millions
of 5-grams; sparsity dominates; classifier overfits to specific
phrases that appeared once in training. Cap at (1, 2) or (1, 3)
and require min_df >= 2.

### [[Sections/nlp-classical/patterns/classical-vs-llm|Classical NLP vs LLM — when each wins]]

> [!warning] replacing a working TF-IDF + LR baseline with GPT-4
because "GPT-4 is better". For binary or small-multiclass tasks
with 5k+ labels, the classical baseline often matches or beats
zero-shot LLM accuracy at 1/1000 the cost and 1/100 the latency.
Measure both; pick by accuracy * cost * latency, not by hype.

## Image Processing

### [[Sections/image-processing/pillow/pil-basics|Pillow basics — open, resize, save with quality]]

> [!warning] saving RGBA as JPEG without conversion. Pillow raises
"cannot write mode RGBA as JPEG"; your upload pipeline crashes on
every PNG with transparency. ALWAYS convert mode before save.

### [[Sections/image-processing/pillow/pil-transforms|Pillow transforms — rotate, crop, fit, autocontrast]]

> [!warning] rotate(deg) without expand=True for non-90° angles.
Default expand=False keeps the original canvas size, so corners
get clipped. The user wonders why "the rotated image got cropped".
Always pass expand=True unless you specifically want the original
bounding box.

### [[Sections/image-processing/pillow/pil-drawing|Pillow drawing — text, shapes, watermarks]]

> [!warning] hardcoding font_size=24 for all images. On a 200×200
thumbnail it dominates; on a 4000×4000 photo it's invisible. Always
scale type size with image height (or width for landscape-heavy
content). One ratio = consistent visual weight across sizes.

### [[Sections/image-processing/numpy-cv/numpy-image-ops|NumPy image ops — array view, channels, broadcasting]]

> [!warning] doing arithmetic on uint8 arrays without casting.
blend = (a + b) // 2
uint8 + uint8 wraps modulo 256; (200 + 100) becomes 44, not 300/2.
Cast to int16 or float32 before any arithmetic that could exceed 255.

### [[Sections/image-processing/numpy-cv/opencv-basics|OpenCV basics — imread, cvtColor, resize, edges]]

> [!warning] installing opencv-python on a headless server. Pulls
in Qt/GTK/X11 deps you don't need; image is 100MB+ larger; can fail
at import time when the display environment is missing. Use
opencv-python-headless on servers, Docker, Lambda, CI.

### [[Sections/image-processing/numpy-cv/color-spaces-thresholding|Color spaces & thresholding — RGB / HSV / LAB, masks]]

> [!warning] thresholding directly on RGB channels and expecting
robust color filtering. Lighting changes (sun, shade, indoor)
move the same physical color across a huge range of RGB values.
Convert to HSV (or better, LAB) so hue/saturation can be filtered
independently of brightness.

### [[Sections/image-processing/patterns/batch-image-pipeline|Batch image pipeline — parallel, resilient, observable]]

> [!warning] catching errors silently per-file but never reporting
them. The batch "succeeds" but 30% of images quietly failed; the
downstream system sees missing files and breaks. ALWAYS aggregate
failures into a structured log AND surface a summary at the end.

### [[Sections/image-processing/patterns/image-quality-formats|Image formats & quality — JPEG, WebP, AVIF, content-aware choice]]

> [!warning] serving 4K JPEGs at quality 100 to a phone. The phone's
screen is 1080p; the user's data plan is metered. Use responsive
srcset so each device gets a size appropriate to its viewport.
A 320px-wide phone doesn't need a 4000px-wide image.

### [[Sections/image-processing/patterns/classical-vs-ml-vision|Classical vs ML — when each wins]]

> [!warning] replacing a working classical pipeline with a vision
transformer because "ML is more accurate". For "is this image
blurry?" or "find the dominant color", classical gets 95% accuracy
at 1ms; CLIP gets 96% at 100ms and $0.001/req. The "improvement" is
not worth 100x cost. Measure both; pick by accuracy × latency × cost.

## Notebooks

### [[Sections/notebooks/jupyter-basics/jupyter-magic-commands|IPython magic commands — %time, %autoreload, %%writefile]]

> [!warning] starting %autoreload 2 in production notebooks. Reload
is slow and can cause weird state (objects with stale class
definitions). Fine for development; remove from notebooks intended
to be run end-to-end (papermill, scheduled).

### [[Sections/notebooks/jupyter-basics/ipython-display-widgets|IPython.display & ipywidgets — rich output and interactivity]]

> [!warning] calling print() or rendering plots directly in an
observe callback without an Output area. Each render appends below
the cell; the notebook becomes infinite. Use W.Output as a target
and clear_output(wait=True) to render-in-place.

### [[Sections/notebooks/jupyter-basics/jupyter-kernel-management|Kernels & environments — per-project Python, JupyterLab vs notebook]]

> [!warning] installing project deps into the system Python or the
default 'python3' kernel. First time you have two projects with
conflicting versions of pandas, both notebooks break. Always: venv
per project, kernel per venv, and notebooks pin the kernel name in
their metadata.

### [[Sections/notebooks/workflow/nbformat-papermill|papermill — parameterized notebook execution]]

> [!warning] hardcoding values in a notebook intended to be run
scheduled. Each time the report runs you have to manually edit the
date cell. Tag a 'parameters' cell with sane defaults, then use
papermill -p to override at runtime. Same notebook, infinite parameters.

### [[Sections/notebooks/workflow/jupytext-version-control|jupytext — pair .ipynb with .py for clean git diffs]]

> [!warning] committing .ipynb files with full outputs (CSVs
inlined as base64, plots as embedded PNGs). Repository size balloons,
git diff is JSON noise, PR reviews require manually opening the
notebook in Jupyter to see what changed. Either nbstripout (keep
.ipynb, strip outputs) or jupytext (commit .py companion).

### [[Sections/notebooks/workflow/nbconvert-export|nbconvert — export notebooks to HTML, PDF, slides]]

> [!warning] shipping a notebook .ipynb directly to non-developers
and asking them to "open it in Jupyter". They don't have Jupyter
installed; opening on GitHub shows raw outputs but no interactivity;
attaching to email leaves stale outputs forever. ALWAYS export to
HTML (static reports), PDF (formal docs), or Voila (live) before
sharing.

### [[Sections/notebooks/production/notebook-ci-testing|Notebook CI testing — nbval, pytest-notebook, papermill assertions]]

> [!warning] never running notebooks in CI. Notebooks rot silently
— pandas changes, data formats shift, libraries deprecate. Six
months later you reopen "the report notebook" and 40% of cells
error. CI catches these the day they break, not when you next look
at the notebook.

### [[Sections/notebooks/production/jupyterhub-deployment|JupyterHub — multi-user notebook server with auth, resources]]

> [!warning] running JupyterHub with PAM auth on a public-facing
server. PAM = system Linux users; everyone you give a notebook to
has shell access to the host. Use OAuth (GitHub, OIDC) and Docker/
KubeSpawner for proper isolation.

### [[Sections/notebooks/production/notebook-anti-patterns|Notebook anti-patterns — when to graduate to .py]]

> [!warning] shipping a notebook AS the production code. Notebook
scheduled with papermill, fine. Notebook IS the API server, not
fine — Jupyter wasn't built for that. The discipline: notebook is
DEVELOPMENT FLOW; .py module is PRODUCTION CODE; papermill bridges
the two when "scheduled notebook output" is the deliverable.

## Documentation

### [[Sections/documentation/mkdocs/mkdocs-basics|MkDocs basics — config, serve, mkdocs-material]]

> [!warning] maintaining docs in two places (README.md + docs/).
README drifts; docs site shows stale info; users find both and
trust the wrong one. Make the docs site the source of truth; let
README link to it for setup-only.

### [[Sections/documentation/mkdocs/mkdocs-mkdocstrings|mkdocstrings — auto-generated API reference from docstrings]]

> [!warning] writing API documentation by hand alongside docstrings.
Two sources, both maintained, both drift. mkdocstrings + good
docstrings means the docs ARE the docstrings — single source of truth,
always in sync with code.

### [[Sections/documentation/mkdocs/mkdocs-deployment|MkDocs deployment — gh-pages, ReadTheDocs, custom domain]]

> [!warning] building docs locally and committing site/ to git.
Doubles repo size; merge conflicts on every doc edit; out-of-sync
with source. ALWAYS build in CI; deploy site/ to gh-pages or a
static host. Keep site/ in .gitignore.

### [[Sections/documentation/sphinx/sphinx-basics|Sphinx basics — quickstart, conf.py, RST + Markdown]]

> [!warning] starting Sphinx with default conf.py + alabaster theme
and never updating. Default theme looks dated; users assume the
project itself is dated. Pick Furo (or sphinx-rtd-theme for that
classic Python feel) on day one.

### [[Sections/documentation/sphinx/sphinx-autodoc|Sphinx autodoc — generate API docs from docstrings]]

> [!warning] hand-writing API docs while also using autodoc. Two
sources, both maintained, both drift. Pick autodoc OR hand-write,
not both. autodoc + good docstrings is the right answer for any
project of size — single source of truth, always in sync.

### [[Sections/documentation/sphinx/sphinx-extensions|Sphinx extensions — diagrams, notebooks, design components]]

> [!warning] installing 20 sphinx extensions just because they
exist. Each adds build time, maintenance burden, and learning curve.
Start minimal (autodoc + napoleon + myst-parser); add only when you
have a documented need (tabs in 5+ pages = add sphinx-design).

### [[Sections/documentation/patterns/docstring-styles|Docstring styles — Google, NumPy, RST, type-aware]]

> [!warning] writing docstrings as :param: / :type: tags when you
already have type hints. The types are stated twice (signature +
docstring); they drift; renderers like mkdocstrings handle type
hints natively. Use Google/NumPy style for prose; let type hints
stay in the signature.

### [[Sections/documentation/patterns/doctest-examples|Doctest — examples that stay in sync with code]]

> [!warning] docstring examples that don't run as doctests. They
look authoritative ("here's how to use it") but drift silently —
the function changes, the example doesn't, users copy-paste broken
code. EITHER make the >>> blocks doctest-runnable AND run them in
CI, OR explicitly mark them as illustrative-only with a comment.

### [[Sections/documentation/patterns/mkdocs-vs-sphinx|MkDocs vs Sphinx — when each wins]]

> [!warning] switching docs tools every 2 years because "the new
one is better". Migration costs (rewriting links, retraining
contributors, fixing stale URLs) are real. Pick once, commit. The
differences are smaller than the cost of switching.

## OpenCV (cv2)

### [[Sections/cv-opencv/basics/cv2-imread-imwrite|cv2.imread / cv2.imwrite — load and save images]]

> [!warning] if cv2.imread(path):  ...   # WRONG - returns ndarray; truthiness on
ndarray raises ValueError. Use 'is None'.

### [[Sections/cv-opencv/basics/cv2-color-spaces|cv2.cvtColor — color space conversions (BGR↔RGB, HSV, LAB)]]

> [!warning]   img_rgb = cv2.imread(p)            # cv2.imread is BGR not RGB
plt.imshow(img_rgb)                # red/blue swapped on screen
Always cvtColor BGR2RGB before plt.imshow / Pillow.fromarray / PyTorch.

### [[Sections/cv-opencv/basics/cv2-pixel-access-roi|Pixel access and ROI slicing — img[y, x] / img[y1:y2, x1:x2]]]

> [!warning]   for y in range(H):              # Python loop on pixels
for x in range(W):
          if img[y, x, 0] > 200:
              img[y, x] = (0,0,0)
1000x slower than:
  img[img[..., 0] > 200] = (0, 0, 0)
If you find yourself looping over pixels, you're missing a vectorization.

### [[Sections/cv-opencv/transforms/cv2-resize-rotation|cv2.resize / cv2.warpAffine — resize and rotate]]

> [!warning]   cv2.resize(img, (h, w))      # passing (height, width) instead of (w, h)
Image comes back transposed-looking - aspect ratio destroyed. cv2.resize
is the ONE place in cv2 where "size" is (w, h), not (h, w).

### [[Sections/cv-opencv/transforms/cv2-perspective-warp|cv2.getPerspectiveTransform / warpPerspective — deskew documents]]

> [!warning]   warpAffine with a homography matrix       # silently drops the perspective row
warpAffine takes 2x3, warpPerspective takes 3x3. Using affine when the
transform has any depth distortion gives a wrong-but-plausible result.

### [[Sections/cv-opencv/filters/cv2-blur-edges|cv2.GaussianBlur / cv2.Canny — smoothing and edge detection]]

> [!warning]   cv2.Canny(img, 100, 100)           # lo == hi defeats hysteresis
Canny needs lo < hi (typically lo = 0.5*hi). Equal thresholds = single
threshold = noisy or missed edges depending on the image.

### [[Sections/cv-opencv/filters/cv2-morphology-thresholding|cv2.threshold / cv2.morphologyEx — binarize and clean masks]]

> [!warning]   kernel = np.ones((3, 3))           # float64 by default
cv2.dilate(img, kernel)             # expects uint8 0/1 - works but
correct form is np.ones((3,3), np.uint8) or use getStructuringElement.

### [[Sections/cv-opencv/detection/cv2-template-matching|cv2.matchTemplate — find a known image inside another]]

> [!warning]   matchTemplate + minMaxLoc when multiple matches exist
Returns ONLY the global max - the other 9 instances are silently dropped.
Always np.where + NMS for multi-instance cases.

### [[Sections/cv-opencv/detection/cv2-feature-orb|cv2.ORB / cv2.BFMatcher — keypoint matching for scenes]]

> [!warning]   crossCheck=True AND knnMatch              # mutually exclusive
crossCheck only makes sense for .match() (1-NN). With knnMatch you do
the ratio test instead. Pick one or the other - never both.

### [[Sections/cv-opencv/video/cv2-videocapture|cv2.VideoCapture / cv2.VideoWriter — read and write video]]

> [!warning]   writer = cv2.VideoWriter(...)   # never check isOpened()
If FOURCC is unsupported (no codec installed), the writer silently
returns False to .write() forever. Always check writer.isOpened() and
fall back to another codec if False.

### [[Sections/cv-opencv/dl-integration/cv2-dnn-onnx|cv2.dnn.readNetFromONNX — run a model without PyTorch/TF]]

> [!warning]   blob = cv2.dnn.blobFromImage(img, swapRB=False)   # then feed to a model
# trained on RGB
Half of all "model works in PyTorch but garbage with cv2" bugs are
swapRB=False when the model expects RGB. Default torchvision = RGB,
default cv2 = BGR. Set swapRB=True almost always.

### [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool]]

> [!warning]   img = cv2.imread(p)
loss = model(transforms.ToTensor()(img))   # ToTensor expects PIL or HWC RGB
cv2.imread gives BGR HWC uint8. ToTensor expects RGB. Either:
  transforms.ToTensor()(Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB)))
or skip torchvision entirely and just normalize the array yourself.

## Tkinter

### [[Sections/gui-tkinter/basics/tk-root-mainloop|tk.Tk / mainloop / ttk widgets — minimal app]]

> [!warning]   tk.Tk() called twice in one process
A second Tk() creates a SECOND root with its own event loop. Use
tk.Toplevel(root) for additional windows.

### [[Sections/gui-tkinter/basics/tk-widgets-overview|ttk widget catalog — Entry, Combobox, Treeview, Notebook]]

> [!warning]   ttk.Combobox(parent)                # state defaults to 'normal' (free typing)
Users can type values not in the list. Set state='readonly' if you want a
proper dropdown. (Or use 'disabled' to fully lock it.)

### [[Sections/gui-tkinter/basics/tk-state-vars|tk.StringVar / IntVar / BooleanVar — reactive state]]

> [!warning]   name.trace_add('write', lambda *_: name.set(name.get().upper()))
Trace fires after .set(), so this loops forever. If you must mutate
inside a trace, guard with a 'self._mutating' flag.

### [[Sections/gui-tkinter/layout/tk-grid-vs-pack|grid vs pack vs place — pick a geometry manager]]

> [!warning]   ttk.Label(root).pack()
ttk.Entry(root).grid(row=0, column=0)   # same parent uses both!
Tk enters an "I'm laying out, no I'm laying out" loop and the window
either freezes or never finishes geometry calculation. One manager per
parent. Use Frames to isolate.

### [[Sections/gui-tkinter/events/tk-event-bindings|widget.bind / event modifiers — keyboard, mouse, focus]]

> [!warning]   widget.bind('<Tab>', cb)               # without 'break'
Default Tab handling (focus next widget) still runs after your callback.
If you wanted to take over Tab, return 'break'. Same for arrow keys in
Listbox/Treeview, where the default handling moves the selection.

### [[Sections/gui-tkinter/events/tk-dialogs-menus|tkinter.messagebox / filedialog / Menu — standard dialogs and menus]]

> [!warning]   if filedialog.askopenfilename():     # but assigning later?
askopenfilename returns '' (empty string) on cancel, not None. The
truthiness check works, but only because empty string is falsy. Be
explicit: path = ...; if not path: return.

### [[Sections/gui-tkinter/advanced/tk-threading-after|after / threads / queue — Tk is single-threaded]]

> [!warning]   threading.Thread(target=lambda: label.config(text="done"))
Direct widget calls from a non-main thread. Works on a quiet day,
corrupts state on a noisy one. Always go through queue + after.

### [[Sections/gui-tkinter/advanced/tk-canvas|tk.Canvas — drawing, dragging, custom widgets]]

> [!warning]   item = canvas.create_rectangle(...)
canvas.bind('<Button-1>', cb)          # binds to the WHOLE canvas
Per-item events should use canvas.tag_bind(item_or_tag, '<...>', cb).
A canvas-level bind fires for clicks on empty space too.

### [[Sections/gui-tkinter/advanced/tk-async-loop|asyncio + Tk — running an async loop alongside mainloop]]

> [!warning]   loop.run_until_complete(coro)             # called from inside a callback
This blocks the asyncio thread waiting for the coro AND blocks the GUI
thread if you called it from there. Always use run_coroutine_threadsafe
from the GUI thread; never call loop methods directly from outside the
loop's thread.

### [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit]]

> [!warning]   "I need a UI for this Python script" -> spending 4 weeks in PyQt
If the user is a coworker / data scientist / yourself, Streamlit gets
you to "shipped" in an hour. Reach for desktop frameworks only when
you've established that browser delivery isn't acceptable.

## PyQt / PySide

### [[Sections/gui-pyqt/basics/qt-qapplication-qwidget|QApplication / QWidget / app.exec — minimal Qt app]]

> [!warning]   QApplication() created twice in one process
QApplication is a singleton; constructing two segfaults or behaves
unpredictably. If you need it elsewhere, use QApplication.instance().

### [[Sections/gui-pyqt/basics/qt-pyqt-vs-pyside|PyQt6 vs PySide6 — pick one (and how to switch later)]]

> [!warning]   from PyQt5.QtCore import pyqtSignal     # in 2026
Qt5 is end-of-life. Migrate to Qt6 (PyQt6 or PySide6) before adding new
code. Most Qt6 imports are identical except for the version number.

### [[Sections/gui-pyqt/signals-slots/qt-signals-slots|Signal / Slot — Qt's callback system]]

> [!warning]   for x in items:
btn.clicked.connect(lambda: handle(x))   # x captured BY REFERENCE
All connections see the LAST x. Use default args:
      btn.clicked.connect(lambda _checked=False, x=x: handle(x))
(Note: clicked emits a bool; absorb it with _checked= default.)

### [[Sections/gui-pyqt/signals-slots/qt-qthread-worker|QThread + worker QObject — long-running tasks without freezing the UI]]

> [!warning]   class Worker(QThread):
def run(self): self.label.setText('done')   # touches GUI from worker
Worker objects must NEVER touch widgets directly. Emit a signal; the
main thread handles it. Even if it "works" most of the time, you'll
eventually crash on a paint event during a cross-thread mutation.

### [[Sections/gui-pyqt/widgets/qt-input-widgets|QLineEdit / QComboBox / QSpinBox / QCheckBox — input widgets]]

> [!warning]   le.textChanged.connect(expensive_computation)
Fires on every keystroke. For typed input use editingFinished, or
debounce with a QTimer (above).

### [[Sections/gui-pyqt/widgets/qt-listview-tableview|QListView / QTableView — model/view for data]]

> [!warning]   model.setItem(r, c, QStandardItem(str(age)))   # everything stored as string
view.setSortingEnabled(True)                    # sort: '10' < '2'
Strings sort lexicographically. Either store typed values (Qt.UserRole)
or override .data() to return the int and let the proxy sort it.

### [[Sections/gui-pyqt/layouts/qt-layouts|QVBoxLayout / QHBoxLayout / QGridLayout / QFormLayout]]

> [!warning]   layout1.addLayout(layout2)
layout2.addLayout(layout1)               # circular nesting
Qt doesn't catch this until paint time, which presents as a hang.
Each layout has exactly one parent; a layout cannot contain itself.

### [[Sections/gui-pyqt/styling/qt-qss-styling|Qt Style Sheets (QSS) — CSS-like styling]]

> [!warning]   widget.setProperty("kind", "danger")
# ...later...
  # selectors don't update; widget still looks default
After changing a property used by a stylesheet selector, repolish:
  widget.style().unpolish(widget); widget.style().polish(widget)

### [[Sections/gui-pyqt/styling/qt-threadpool-runnable|QThreadPool / QRunnable — fire-and-forget tasks]]

> [!warning]   class Job(QRunnable, QObject):       # multiple inheritance with QObject
QRunnable is intentionally not a QObject. Don't try to combine; use a
separate signal-carrier object. Multiple-inheritance with QObject is
brittle in Python because of the metaclass Qt uses.

## Audio & DSP

### [[Sections/audio-dsp/librosa/librosa-load-resample|librosa.load / resample — load any audio file, force a sample rate]]

> [!warning]   y, sr = librosa.load(path)               # then assume sr matches the file
librosa silently resamples to 22050 by default. If you needed the file's
native rate (e.g. you want to write back at the same sr), you have to
pass sr=None. The most common librosa bug.

### [[Sections/audio-dsp/librosa/librosa-stft-spectrogram|librosa.stft / display.specshow — spectrograms]]

> [!warning]   plt.imshow(np.abs(D), origin='lower')   # linear amplitude
Linear scale crushes everything but the loudest bin. Always go to dB
(amplitude_to_db / power_to_db) for visualization.

### [[Sections/audio-dsp/librosa/librosa-mfcc-features|librosa.feature.mfcc — features for classical audio ML]]

> [!warning]   features = librosa.feature.mfcc(y=y, sr=sr).flatten()
model.predict(features.reshape(1, -1))
.flatten() makes a per-clip vector whose length depends on duration.
Models can't accept variable-length inputs. Aggregate across time
(mean / std) or pad to a fixed T.

### [[Sections/audio-dsp/sounddevice/sounddevice-play-record|sd.play / sd.rec — synchronous playback and recording]]

> [!warning]   def callback(indata, frames, ti, status):
all_data.append(indata)               # appends the buffer view!
indata is a NumPy view backed by a buffer that PortAudio reuses.
After the callback returns, the buffer's contents change underneath
you. ALWAYS .copy() the indata in the callback if you want to keep it.

### [[Sections/audio-dsp/sounddevice/sounddevice-stream-callback|sd.InputStream / OutputStream — real-time audio]]

> [!warning]   def cb(indata, frames, ti, status):
result = run_inference(indata)              # NN forward pass
A 10ms callback budget with a 50ms NN pass = constant underruns and
audible clicks. Always hand the buffer to a worker; never block the
audio thread on heavy work.

### [[Sections/audio-dsp/scipy-signal/scipy-signal-filters|scipy.signal — IIR/FIR filters, convolution]]

> [!warning]   b, a = butter(8, ...); y = lfilter(b, a, x)
8th-order BA-form filter on 32-bit floats blows up numerically. Always
request output='sos' for IIR design and use sosfilt / sosfiltfilt.

### [[Sections/audio-dsp/scipy-signal/scipy-signal-windows|scipy.signal.windows / spectral leakage]]

> [!warning]   X = np.fft.rfft(x)                          # rectangular window
psd = np.abs(X) ** 2                         # not normalized
Two bugs: (1) leakage smears narrowband peaks across many bins; (2)
magnitude-squared is not a PSD - need /sr/N and a window normalization
correction. Use scipy.signal.welch when you want a real PSD.

### [[Sections/audio-dsp/formats/audio-file-formats|soundfile / pydub / wave — picking a file I/O library]]

> [!warning]   data, sr = sf.read('song.wav')             # reads as float64 (default)
sf.write('out.wav', data, sr)               # writes as float64 -> WAV FLOAT
You silently changed PCM_16 source to a 32-bit FLOAT WAV (4x size).
Either pass dtype='int16' on read or subtype='PCM_16' on write to keep
the original encoding.

### [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack]]

> [!warning]   features = librosa.feature.melspectrogram(...)  # CPU per item
x = torch.from_numpy(features).cuda()            # then send to GPU
Per-clip CPU mel + numpy<->torch copy is the bottleneck. If you train
on GPU, do the mel on GPU with torchaudio - one batched call vs
thousands of single-item ones.

## Geospatial

### [[Sections/geospatial/geopandas/geopandas-load-crs|gpd.read_file / set_crs / to_crs — load + project]]

> [!warning]   gdf.area                                  # gdf is in EPSG:4326 (degrees)
Returns "areas" in degrees-squared - meaningless. Always reproject to a
meter-based CRS before using .area / .length / .distance.

### [[Sections/geospatial/geopandas/geopandas-spatial-joins|gpd.sjoin / gpd.overlay — combine geometries by location]]

> [!warning]   gpd.sjoin(left, right)                       # different CRS - silent garbage
sjoin doesn't always raise on CRS mismatch in older versions; even when
it warns, beginners ignore the warning. Result is "0 matches" because
coordinates from different CRSs never overlap in the same numeric range.

### [[Sections/geospatial/geopandas/geopandas-plot-explore|GeoDataFrame.plot / .explore — static and interactive maps]]

> [!warning]   gdf.plot(column='pop')                  # cmap='viridis' default linear
A single outlier (NYC, 8M) flattens every other county to dark blue.
Use scheme='Quantiles' or 'NaturalBreaks' for any real-world data
distribution.

### [[Sections/geospatial/shapely/shapely-geometry-types|Point / LineString / Polygon / Multi* — geometry constructors]]

> [!warning]   poly.centroid                            # for an L-shape
Centroid of an L-shape is OUTSIDE the polygon. Use representative_point()
when you need a point known to lie inside.

### [[Sections/geospatial/shapely/shapely-spatial-predicates|intersects / within / contains / distance / buffer — geometry algebra]]

> [!warning]   gdf_4326.buffer(0.001)                    # buffer in DEGREES!
0.001 degrees is ~111 m at the equator but only ~80 m at 45°N -
inconsistent. For "within X meters", reproject to a meter CRS first.

### [[Sections/geospatial/rasterio/rasterio-open-read|rasterio.open / .read / windows — read raster pixels]]

> [!warning]   src.read()                                  # whole 10980x10980 raster
Reads ~2.5 GB for a single Sentinel-2 RGB tile and dies on 8GB laptops.
Always use windows for anything bigger than ~1000x1000 pixels.

### [[Sections/geospatial/rasterio/rasterio-mask-reproject|rasterio.mask / .warp.reproject — clip and reproject]]

> [!warning]   reproject(..., resampling=Resampling.bilinear)  # for a land-cover raster
Bilinear interpolation between class IDs (1, 5, 9) creates pixels with
value 3 or 7 - classes that don't exist. Always Resampling.nearest for
categorical data.

### [[Sections/geospatial/folium/folium-basic-markers|folium.Map / Marker / GeoJson — interactive maps in 5 lines]]

> [!warning]   folium.Map(location=projected_xy)         # passes projected coords
folium expects WGS84 lat/lon - if you pass UTM or web-mercator
coordinates the marker lands in the Indian Ocean or thereabouts.
Always to_crs(epsg=4326) before handing geometry to folium.

### [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack]]

> [!warning]   gpd.read_file('huge.gpkg')  # 80M rows
Loads the whole file into RAM; OOMs on most machines. Either move the
join to PostGIS / DuckDB, or read by chunks (rows= / bbox= filters,
parquet columns, etc.).

## Quantum

### [[Sections/quantum/qiskit/qiskit-circuit-basics|QuantumCircuit / gates / measure — build a circuit]]

> [!warning]   qc = QuantumCircuit(2)                   # forgot the classical bits
qc.measure([0, 1], [0, 1])                # raises CircuitError
QuantumCircuit(n) creates a circuit with n qubits but ZERO classical
bits. Use QuantumCircuit(n_qubits, n_clbits) or call qc.measure_all().

### [[Sections/quantum/qiskit/qiskit-simulators-shots|Aer / Sampler / shots — run a circuit and read counts]]

> [!warning]   counts = sampler.run([(qc,)]).result()[0].data.meas.get_counts()
probs = {k: v / 1024 for k, v in counts.items()}        # assumed shots
Hardcoding the divisor instead of summing counts. Always normalize by
n = sum(counts.values()) - shots= can be ignored by some backends.

### [[Sections/quantum/qiskit/qiskit-transpile|transpile / optimization_level — compile to a backend]]

> [!warning]   sampler.run([(qc,)])                  # qc not transpiled for the backend
IBM Runtime accepts ANY circuit but silently transpiles with default
settings - usually optimization_level=1 + a random seed. For research
results you want the BEST 2q gate count - transpile yourself with
multiple seeds at level 3 first.

### [[Sections/quantum/cirq/cirq-circuit-basics|cirq.Circuit / GridQubit / measure — Cirq circuits]]

> [!warning]   cirq.Simulator().run(circuit_with_noise)   # state vector sim + noisy circuit
Simulator() is statevector-only; noise channels need DensityMatrixSimulator
(or Clifford-only Stim for big circuits). Wrong simulator -> noise is
silently ignored.

### [[Sections/quantum/concepts/quantum-bell-superposition|Superposition / entanglement / Bell test — the canonical demos]]

> [!warning]   counts.get('01', 0) > 0  ->  "the Bell state is broken"
Some 01/10 counts are EXPECTED on noisy hardware - readout error,
decoherence, gate infidelity. Compare to the noiseless baseline AND
look at the magnitude (a few percent is normal; 25% means a wiring bug).

### [[Sections/quantum/patterns/qiskit-vs-cirq-vs-pennylane|Qiskit vs Cirq vs PennyLane vs Stim — pick the framework]]

> [!warning]   trying to simulate a 50-qubit non-Clifford circuit in any statevector framework
2^50 complex amplitudes = 16 PB of memory. Either:
  (a) Reduce qubits to <30 for laptop, <40 for high-RAM server.
  (b) Restrict to Clifford gates and use Stim.
  (c) Use tensor-network simulators (e.g. cuTensorNet, quimb) for
      circuits with low entanglement.

## Web3 / Blockchain

### [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect]]

> [!warning]   w3 = Web3(Web3.HTTPProvider(url))     # then never check chain_id
A misconfigured RPC URL (testnet vs mainnet) is the #1 cause of "I sent
real ETH to the wrong chain". Always assert w3.eth.chain_id at startup.

### [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state]]

> [!warning]   contract.functions.balanceOf("0xabcd...").call()
# lowercase address -> InvalidAddress
web3.py 6+ enforces EIP-55 checksum addresses. ALWAYS wrap user input
with Web3.to_checksum_address(...) before passing to a contract call.

### [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain]]

> [!warning]   tx['nonce'] = w3.eth.get_transaction_count(addr)   # default 'latest'
'latest' counts only mined txs - if you have a pending tx, you'll
reuse the same nonce and one will be replaced. Use 'pending' for
nonce, OR use a local NonceManager.

### [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events]]

> [!warning]   for_block in range(from_block, latest):  ...
# toBlock='latest' in a loop
Each iteration re-fetches a moving 'latest'; new blocks during the
scan get scanned twice in the next iteration AND skipped if they
arrive between iterations. Always fix the upper bound at scan start.

### [[Sections/web3-blockchain/solana/solana-basics|solana-py / solders — query and send on Solana]]

> [!warning]   tx = Transaction([], msg, blockhash)              # forgot the signer
Solana txs ARE the signature container - building without signers
yields an unsigned tx the RPC will reject as "invalid signature".

### [[Sections/web3-blockchain/patterns/web3-vs-ape-vs-viem|web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit]]

> [!warning]   pip install eth-brownie                         # in 2026
Brownie was officially deprecated in late 2023. New projects should use
Ape (eth-ape). Hardhat / Foundry remain best-in-class outside Python.

## Bioinformatics

### [[Sections/bioinformatics/biopython/biopython-sequences-io|SeqRecord / SeqIO — read and write FASTA/FASTQ/GenBank]]

> [!warning]   records = list(SeqIO.parse("30GB.fastq", "fastq"))
Loads 30 GB into RAM as Python objects (4-8x bloat). Iterate and write
in one pass, OR if you need random access, use SeqIO.index_db.

### [[Sections/bioinformatics/biopython/biopython-alignment-blast|PairwiseAligner / NCBIWWW.qblast — pairwise + remote BLAST]]

> [!warning]   while True:
NCBIWWW.qblast(...)
NCBI rate-limits and IP-blocks bursty remote BLAST. Local BLAST+ is
~1000x faster for any production workload.

### [[Sections/bioinformatics/pysam/pysam-bam-pileup|pysam.AlignmentFile / fetch / pileup — read BAM]]

> [!warning]   for col in bam.pileup("chr1", 1000, 2000): ...    # without truncate=True
pileup walks every position TOUCHED by any read overlapping (1000, 2000) -
can extend hundreds of bp outside your window. Always pass truncate=True.

### [[Sections/bioinformatics/pysam/pysam-vcf|pysam.VariantFile — read and filter VCF/BCF]]

> [!warning]   bam.fetch("chr1", rec.pos, rec.pos + 1)       # rec.pos is 1-based
Off-by-one because BAM coords are 0-based. Use rec.start (0-based) or
subtract: bam.fetch("chr1", rec.pos - 1, rec.pos).

### [[Sections/bioinformatics/scanpy/scanpy-anndata-basics|AnnData / sc.read — load + inspect a single-cell dataset]]

> [!warning]   adata.X = adata.X.toarray()         # turn sparse into dense in place
A 100k-cell x 30k-gene dense matrix is ~24 GB float32. Most scanpy
functions handle sparse - keep it sparse. Densify only the slice you
need (e.g. a marker-gene heatmap).

### [[Sections/bioinformatics/scanpy/scanpy-pca-umap-cluster|normalize → HVG → PCA → neighbors → UMAP → leiden]]

> [!warning]   sc.tl.rank_genes_groups(adata, ..., use_raw=False)
# after sc.pp.scale
Z-scored expression has near-zero mean - rank_genes_groups produces
nonsensical fold-changes. Either run BEFORE scale, or set use_raw=True
(scanpy stashes pre-scale data in adata.raw if you assigned it).

### [[Sections/bioinformatics/patterns/bio-stack-decision|Biopython vs pysam vs Snakemake vs Nextflow vs CLI tools]]

> [!warning]   for read in SeqIO.parse(big_fastq):  ...
count_kmers_in_python(read.seq)
Pure Python over 100M reads finishes next week. Pipe to a C tool:
      jellyfish, BBTools, or sourmash for k-mers; bwa/minimap2 for alignment.
Python is glue; let the C/Rust giants do the muscle work.

## Astropy & Scientific

### [[Sections/astropy-scientific/astropy/astropy-units-quantity|astropy.units / Quantity — values that carry units]]

> [!warning]   if mass > 50:                               # mass is a Quantity
...
Comparing a Quantity to a scalar uses the Quantity's value with its
CURRENT unit - if mass got passed as grams, 50 means 50 grams. Always
compare to a Quantity: if mass > 50 * u.kg.

### [[Sections/astropy-scientific/astropy/astropy-skycoord|astropy.coordinates.SkyCoord — celestial coordinates]]

> [!warning]   SkyCoord(ra=10.685, dec=41.27)              # bare floats
Astropy raises if unit= is missing - the units are too important to
guess. Always pass unit=(u.deg, u.deg) (or u.hourangle for RA).

### [[Sections/astropy-scientific/astropy/astropy-fits-io|astropy.io.fits — read and write FITS files]]

> [!warning]   data = fits.open("img.fits")[0].data       # no with-block; memmap dangling
Outside a with-block the FITS file may close, and accessing .data later
raises a confusing OSError. Always use 'with' and .copy() if you need
the array to outlive the block.

### [[Sections/astropy-scientific/networkx/networkx-graphs-paths|nx.Graph / DiGraph / shortest_path / centrality]]

> [!warning]   for i in range(1_000_000):
g.add_edge(...)                              # NetworkX nodes are dicts of dicts
1M edges in NetworkX easily takes 10 GB and 5 minutes. For that scale,
build with igraph (g = ig.Graph(edges=edges)) or graph-tool.

### [[Sections/astropy-scientific/sympy/sympy-symbolic-math|symbols / solve / diff / integrate / lambdify]]

> [!warning]   for i in range(1_000_000):
y = expr.subs(x, i).evalf()                  # symbolic in a hot loop
.subs + .evalf is slow (Python overhead per call). Always lambdify ONCE
and call the compiled function on a NumPy array.

### [[Sections/astropy-scientific/patterns/scientific-stack-decision|astropy vs scipy vs sympy vs JAX vs igraph vs graph-tool]]

> [!warning]   re-implementing scipy.optimize.minimize in pure Python "for clarity"
scipy.optimize is decades of optimization research. Either USE it or
move to JAX/jaxopt for autodiff. Don't roll your own gradient descent
unless the topic IS gradient descent.

## Game Dev (pygame)

### [[Sections/gamedev-pygame/basics/pygame-event-loop|pygame.init / display / event loop / clock]]

> [!warning]   pygame.time.delay(16)                    # inside the loop instead of clock.tick
delay() blocks; clock.tick() targets a frame rate AND returns elapsed
time you can use as dt. Always use Clock for the loop pacing.

### [[Sections/gamedev-pygame/basics/pygame-surface-rect|Surface / Rect / blit / convert — the drawing primitives]]

> [!warning]   img = pygame.image.load("ship.png")           # never .convert()ed
Loaded surfaces are in a generic 32-bit RGBA format; blitting against
the screen requires per-pixel format conversion every frame. .convert()
bakes that conversion ONCE at load time. Always do it.

### [[Sections/gamedev-pygame/physics/pygame-collisions-pymunk|Rect collision / Mask / pymunk physics — when to upgrade]]

> [!warning]   for s in obstacles:
if rect.colliderect(s.rect): handle(s)
Linear scan over thousands of sprites kills the frame budget. Use
pygame.sprite.Group + groupcollide, or a spatial hash for very
large worlds.

### [[Sections/gamedev-pygame/patterns/gamedev-patterns-engines|Game-state stack / scene manager / engine choice]]

> [!warning]   global state = "play"
if state == "menu": ...elif state == "play": ...elif state == "shop": ...
Past 3 states this becomes unmaintainable and impossible to add overlay
behavior (pause-over-play). Switch to a Scene/View stack early.

## MicroPython / Embedded

### [[Sections/embedded-micropython/core/micropython-vs-cpython|gc / memory / async — what to do differently]]

> [!warning]   def isr(pin):
data.append(adc.read())            # heap allocation INSIDE an interrupt
Heap allocation in an ISR is FORBIDDEN in MicroPython - you'll get
MemoryError or a board reset. Use micropython.schedule(callback, arg)
inside the ISR; the callback runs on the main thread where allocation
is safe.

### [[Sections/embedded-micropython/hardware/micropython-gpio-pwm-adc|machine.Pin / PWM / ADC — digital + analog I/O]]

> [!warning]   pin.irq(handler=lambda p: print("pressed"))
print() inside an ISR allocates and writes to UART - both slow and
allocation-prone. Set a flag in the ISR; print from the main thread.

### [[Sections/embedded-micropython/hardware/micropython-i2c-spi|machine.I2C / SPI — talk to sensors and displays]]

> [!warning]   i2c = I2C(0)  # default pins on this board
i2c.readfrom_mem(0x76, 0xD0, 1)   # without 4.7k pull-ups on SDA/SCL
Most dev boards lack onboard pull-ups for the I2C bus. Without them,
you'll see intermittent OSError(ETIMEDOUT). Add 4.7k from each line
to 3.3V or use a board with pull-ups already wired.

### [[Sections/embedded-micropython/platforms/micropython-esp32-wifi|esp32 / network.WLAN — WiFi + HTTPS + MQTT]]

> [!warning]   for _ in range(N):
requests.post(...)
      time.sleep(60)
Sleeping while WiFi is up wastes ~80 mA continuously - kills batteries.
Either keep MQTT alive (small constant draw) OR deepsleep between
publishes (huge savings).

### [[Sections/embedded-micropython/platforms/micropython-rp2040-pico|rp2 / Pico — second core, PIO, asyncio]]

> [!warning]   shared = []
_thread.start_new_thread(producer, ())
  _thread.start_new_thread(consumer, ())   # both touching shared without lock
Two cores writing to the same Python list is a recipe for corruption
or hangs. Always _thread.allocate_lock() and 'with lock:'.

### [[Sections/embedded-micropython/tooling/micropython-mpremote|mpremote / mip / WebREPL — flash, deploy, debug]]

> [!warning]   ampy --port ... put main.py
ampy is dead. mpremote is the official tool now and supports everything
ampy did plus mip, mount, exec, run, etc. Just use mpremote.

### [[Sections/embedded-micropython/patterns/micropython-vs-circuitpython|MicroPython vs CircuitPython vs C/Rust — pick the toolchain]]

> [!warning]   "I'll just rewrite the firmware in Python because I know Python"
When the existing C firmware works, RAM is tight, real-time is critical,
and the team is C-only - keep C. MicroPython is for greenfield embedded
where productivity > the last 20% of perf, and team is Python-fluent.

## MQTT / IoT

### [[Sections/mqtt-iot/paho/paho-publish-subscribe|paho.Client / connect / publish / subscribe / loop]]

> [!warning]   c = mqtt.Client()                       # auto-generated client_id
c.connect(...); c.disconnect(); c.connect(...)
Each connect picks a new random client_id, so the broker thinks each
is a different device. Subscriptions / sessions don't persist.
ALWAYS set a stable client_id (e.g. mac address + role).

### [[Sections/mqtt-iot/paho/paho-retained-lwt-topic-design|retain / LWT / topic structure — patterns that scale]]

> [!warning]   c.subscribe("sensors/#/temp")          # # only allowed at the END
# is multi-level wildcard but ONLY at the tail of the topic. For
"any device, temp metric" use 'sensors/+/temp' (single-level wildcard).

### [[Sections/mqtt-iot/aiomqtt/aiomqtt-async-client|aiomqtt.Client — async/await around paho]]

> [!warning]   async for message in client.messages:
await slow_db_write(message)        # blocks the iteration
A slow handler causes back-pressure on the broker (eventually drops you).
Either fan messages out to a worker pool (asyncio.Queue + worker tasks)
or process in a TaskGroup so one slow message doesn't block the next.

### [[Sections/mqtt-iot/patterns/mqtt-vs-kafka-amqp|MQTT vs Kafka vs AMQP vs HTTP webhooks — pick the protocol]]

> [!warning]   "Use MQTT for our analytics pipeline because it's fast"
MQTT brokers are not partitioned logs - no replay, no compaction, weak
ordering across consumers. Use MQTT at the edge, Kafka at the core.

## Network Protocols

### [[Sections/network-protocols/sockets/sockets-tcp-server|socket / asyncio.start_server — TCP servers]]

> [!warning]   data = reader.read(4096)
message = data.decode("utf-8")
read returns up to 4096 bytes - might be 200, might be split mid-UTF-8
character. Always frame messages and only decode complete ones.

### [[Sections/network-protocols/sockets/sockets-udp-multicast|UDP / multicast / asyncio.DatagramTransport]]

> [!warning]   sock.sendto(huge_blob, addr)            # > MTU
IP layer fragments. ANY dropped fragment loses the whole datagram. Keep
UDP messages under 1450 bytes for reliable cross-network delivery.

### [[Sections/network-protocols/protocols/websockets-server-client|websockets — async WS server + client]]

> [!warning]   while True: msg = await ws.recv()
await slow_db_write(msg)
Sequential await blocks the next recv. For high-throughput per-connection
work, fan messages out to a worker pool via asyncio.Queue.

### [[Sections/network-protocols/protocols/grpc-python|grpcio + protobuf — typed RPC services]]

> [!warning]   def Method(self, request, context):
result = blocking_db_call()             # in grpc.aio servicer
grpc.aio servicers MUST be async. A sync blocking call in an async
servicer freezes the entire event loop. Use async DB drivers or
loop.run_in_executor for legacy sync code.

### [[Sections/network-protocols/low-level/scapy-sniff-craft|scapy.sniff / send / packet crafting]]

> [!warning]   sniff(prn=callback)              # without store=False
scapy buffers EVERY packet in RAM until the sniff ends. Long-running
captures OOM. Always pass store=False unless you actually need the
packet list.

### [[Sections/network-protocols/patterns/network-stack-decision|sockets vs WebSockets vs gRPC vs HTTP — pick the right tool]]

> [!warning]   "We'll use raw sockets - it's faster"
It's not faster - it's lower-level. You'll spend weeks reimplementing
framing, retries, auth, schema. Pick gRPC / MQTT / REST first; only go
to raw sockets when an existing protocol literally can't fit.

---
*753 anti-patterns · [[_Index|Vault index]]*
