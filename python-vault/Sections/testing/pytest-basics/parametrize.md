---
type: "entry"
domain: "python"
file: "testing"
section: "pytest-basics"
id: "parametrize"
title: "@pytest.mark.parametrize"
category: "pytest"
subtitle: "Data-driven tests — one function, many cases, each pass/fail independently"
signature_short: "@pytest.mark.parametrize(\"a,b,expected\", [(1,2,3), (4,5,9)])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "@pytest.mark.parametrize"
  - "parametrize"
tags:
  - "python"
  - "python/testing"
  - "python/testing/pytest-basics"
  - "category/pytest"
  - "tier/tiered"
---

# @pytest.mark.parametrize

> Data-driven tests — one function, many cases, each pass/fail independently

## Overview

parametrize runs a test multiple times with different arguments. Each set of arguments is a separate test case with its own pass/fail result. Cleaner and more scalable than writing separate test functions for each case.

## Signature

```python
@pytest.mark.parametrize("a,b,expected", [(1,2,3), (4,5,9)])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One parameter, three values, one assertion
# STRENGTHS - The smallest demonstration of data-driven tests
# WEAKNESSES- No (input, expected) pairs; no IDs
#
import pytest

def is_palindrome(s):
    return s == s[::-1]

@pytest.mark.parametrize("word", ["racecar", "level", "noon"])
def test_palindromes(word):
    assert is_palindrome(word)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - (input, expected) pairs, named ids, parametrize + fixtures
# STRENGTHS - The shape that handles 80% of data-driven testing
# WEAKNESSES- No marks per case, no indirect parametrize
#
import pytest

def is_palindrome(s):
    s = s.lower().replace(" ", "")
    return s == s[::-1]

# Multi-column parametrize with readable IDs in the test report
@pytest.mark.parametrize("text, expected", [
    pytest.param("racecar",       True,  id="basic_palindrome"),
    pytest.param("hello",         False, id="not_palindrome"),
    pytest.param("",              True,  id="empty_string"),
    pytest.param("A man a plan",  False, id="ignores_only_spaces"),
    pytest.param("A",             True,  id="single_char"),
])
def test_is_palindrome(text, expected):
    assert is_palindrome(text) is expected

# Combine with a fixture — each case gets a fresh fixture
@pytest.fixture
def client():
    yield TestClient(app)                            # imagined; one per case

@pytest.mark.parametrize("role", ["admin", "user", "guest"])
def test_login_role(client, role):
    r = client.post("/login", json={"role": role})
    assert r.status_code == 200
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Stacked parametrize, marks per case, indirect fixtures, parametrized fixtures
# STRENGTHS - The mechanics that scale to large test matrices without copy-paste
# WEAKNESSES- N/A
#
import pytest

# 1) Stacked decorators = cartesian product (N x M test cases)
@pytest.mark.parametrize("x", [1, 2, 3])
@pytest.mark.parametrize("y", [10, 20])
def test_grid(x, y):                                 # 6 cases
    assert x * y > 0

# 2) Per-case marks: skip / xfail / slow / custom — without forking the function
@pytest.mark.parametrize("n,expected", [
    (0,  1),
    (1,  1),
    (5,  120),
    pytest.param(20, 2_432_902_008_176_640_000, marks=pytest.mark.slow),
    pytest.param(-1, None,                        marks=pytest.mark.xfail(strict=True)),
])
def test_factorial(n, expected):
    assert factorial(n) == expected

# 3) Big test tables — extract to a module-level constant for reuse + readability
PALINDROMES = [
    ("racecar",       True),
    ("",              True),
    ("hello",         False),
]
@pytest.mark.parametrize("text, expected", PALINDROMES)
def test_palindrome_table(text, expected):
    assert is_palindrome(text) is expected

# 4) Parametrize a FIXTURE — every test using `db` runs once per backend
@pytest.fixture(params=["sqlite", "postgres"], ids=["sqlite", "pg"])
def db(request):
    yield connect(request.param)

def test_user_round_trip(db):                        # runs twice: sqlite + pg
    db.save({"id": 1, "name": "alice"})
    assert db.get(1)["name"] == "alice"

# 5) indirect=True forwards the param to a fixture — useful for "load this file"
@pytest.fixture
def fixture_data(request):
    return load_file(request.param)

@pytest.mark.parametrize("fixture_data", ["a.json", "b.json"], indirect=True)
def test_file_processing(fixture_data):
    assert process(fixture_data).is_valid

# Decision rule:
#   1 input, M cases                          -> single-arg parametrize
#   (input, expected) tuples                   -> two-arg parametrize, IDs per case
#   slow / known-broken cases                  -> pytest.param(marks=mark.slow / xfail)
#   same test, different backends              -> fixture(params=[...])
#   independent dimensions (e.g., role x lang) -> stacked parametrize
#   table reused across files                   -> module constant + parametrize
#
# Anti-pattern: 12 near-identical test_* functions differing only by inputs
#   Each renames a variable; bug-fixing requires editing 12 places. Use one
#   parametrized function — failures still show per-case in the report.

def factorial(n): import math; return math.factorial(n)
def is_palindrome(s): s = s.lower().replace(" ", ""); return s == s[::-1]
def connect(_): pass
def load_file(_): pass
def process(_): return type("R", (), {"is_valid": True})()
```

## Decision Rule

```text
1 input, M cases                          -> single-arg parametrize
(input, expected) tuples                   -> two-arg parametrize, IDs per case
slow / known-broken cases                  -> pytest.param(marks=mark.slow / xfail)
same test, different backends              -> fixture(params=[...])
independent dimensions (e.g., role x lang) -> stacked parametrize
table reused across files                   -> module constant + parametrize
```

## Anti-Pattern

> [!warning] Anti-pattern
> 12 near-identical test_* functions differing only by inputs
>   Each renames a variable; bug-fixing requires editing 12 places. Use one
>   parametrized function — failures still show per-case in the report.

## Tips

- Use `pytest.param(..., id="name")` for readable test names instead of `test_fn[param0-param1]`
- Two `@parametrize` decorators run the cartesian product — N × M test cases
- Mark individual params: `pytest.param(val, marks=pytest.mark.xfail)` for expected failures
- Extract large parameter lists to a module-level constant: `CASES = [...]; @parametrize("a,b", CASES)`

## Common Mistake

> [!warning] Writing ten nearly identical test functions differing only by input. Use `@parametrize` — each case gets its own pass/fail, clearer output, and easier to add more cases.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/testing/pytest-basics/assertions|pytest assertions (Testing with pytest)]]
- [[Sections/testing/pytest-basics/test-doubles|Test doubles (Testing with pytest)]]
- [[Sections/testing/pytest-basics/raises|pytest.raises() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/approx|pytest.approx() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/_Index|Testing with pytest → pytest Basics]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]
