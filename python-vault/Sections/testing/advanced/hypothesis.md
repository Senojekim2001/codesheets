---
type: "entry"
domain: "python"
file: "testing"
section: "advanced"
id: "hypothesis"
title: "Hypothesis"
category: "Advanced"
subtitle: "@given(st.integers()) — Hypothesis finds edge cases you would not think of"
signature_short: "from hypothesis import given, strategies as st"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Hypothesis"
  - "hypothesis"
tags:
  - "python"
  - "python/testing"
  - "python/testing/advanced"
  - "category/advanced"
  - "tier/tiered"
---

# Hypothesis

> @given(st.integers()) — Hypothesis finds edge cases you would not think of

## Overview

Hypothesis generates random inputs and shrinks failing cases to the minimal example. Instead of testing specific values, you test properties that should hold for all valid inputs. Excellent for finding edge cases in parsers, math operations, and data transformations.

## Signature

```python
from hypothesis import given, strategies as st
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - One @given strategy, one universal property
# STRENGTHS - The minimum: state a property, let Hypothesis hunt counterexamples
# WEAKNESSES- No assume, no shrinking discussion
#
from hypothesis import given, strategies as st

# Property: addition is commutative — should hold for ALL pairs
@given(st.integers(), st.integers())
def test_addition_commutative(a, b):
    assert a + b == b + a
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - The strategy lookup table + assume() + composition
# STRENGTHS - The vocabulary you'll reach for in real property tests
# WEAKNESSES- No stateful tests, no shrink-control
#
from hypothesis import given, assume, strategies as st
import json

# Strategy cookbook
st.integers(min_value=0, max_value=100)
st.floats(allow_nan=False, allow_infinity=False)
st.text(min_size=1, max_size=50)
st.lists(st.integers(), min_size=1, max_size=20)
st.dictionaries(st.text(min_size=1), st.integers())
st.one_of(st.integers(), st.text())                  # union
st.sampled_from(["red", "green", "blue"])            # finite set

# Round-trip property — dump and load should be identity
@given(st.dictionaries(
    keys=st.text(min_size=1),
    values=st.one_of(st.integers(), st.text(), st.booleans()),
))
def test_json_round_trip(d):
    assert json.loads(json.dumps(d)) == d

# Use assume() to skip inputs that violate a precondition
@given(st.floats(allow_nan=False), st.floats(allow_nan=False))
def test_division_inverts(a, b):
    assume(abs(b) > 1e-9)                             # filter degenerate cases
    assert (a / b) * b == _approx(a)

def _approx(x, eps=1e-9):
    class A:
        def __eq__(self, other): return abs(other - x) < eps
    return A()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - @example seeds, @composite strategies, settings, stateful + ghostwrite
# STRENGTHS - The patterns that turn property-based testing into a bug-finding machine
# WEAKNESSES- N/A
#
from hypothesis import given, assume, example, settings, strategies as st, target
from hypothesis import HealthCheck

# 1) @example — pin specific edge cases that you KNOW must work
@example("")                                          # always run on empty
@example("\u0000")                                   # always run on null byte
@given(st.text())
def test_normalize_idempotent(s):
    assert normalize(normalize(s)) == normalize(s)

# 2) @composite — build complex, dependent inputs
@st.composite
def valid_user(draw):
    age   = draw(st.integers(min_value=18, max_value=120))
    name  = draw(st.text(min_size=1, max_size=50))
    email = draw(st.emails())
    return {"name": name.strip(), "email": email, "age": age}

@given(valid_user())
def test_user_round_trip(u):
    assert User.from_dict(u).to_dict() == u

# 3) Settings — tune for your test, not just defaults
@settings(
    max_examples=500,
    deadline=200,                                     # ms per example; default 200
    suppress_health_check=[HealthCheck.too_slow],
    derandomize=True,                                 # CI-stable random seed
)
@given(st.lists(st.integers()))
def test_sort_idempotent(lst):
    assert sorted(sorted(lst)) == sorted(lst)

# 4) target() — guide shrinker toward interesting space (e.g. larger lists)
@given(st.lists(st.integers()))
def test_quantile_close_to_median(lst):
    assume(lst)
    target(len(lst), label="list size")               # prefer larger lists
    assert lst[len(lst)//2] in lst

# 5) Stateful testing — exercise sequences of operations on a state machine
from hypothesis.stateful import RuleBasedStateMachine, rule, invariant
class CartMachine(RuleBasedStateMachine):
    def __init__(self):
        super().__init__()
        self.cart = Cart()
    @rule(item=st.text(min_size=1), price=st.floats(min_value=0, allow_nan=False))
    def add(self, item, price):
        self.cart.add(item, price)
    @invariant()
    def total_non_negative(self):
        assert self.cart.total() >= 0
TestCart = CartMachine.TestCase                        # pytest collects it

# Decision rule:
#   pure function with universal property      -> @given(strategy) + assertion
#   complex inputs depending on each other      -> @composite strategy
#   known edge cases must always run             -> @example(...)
#   long-running examples / CI flake             -> @settings(deadline=None, derandomize=True)
#   sequence of operations on a stateful object  -> RuleBasedStateMachine
#   need to scaffold property tests fast          -> hypothesis ghostwrite myapp.module
#
# Anti-pattern: testing a property the SUT enforces (e.g. testing __eq__'s reflexivity)
#   "x == x" can't fail — Hypothesis just burns CPU. Properties should constrain
#   relationships BETWEEN operations (encode/decode, sort/sort, push/pop).

def normalize(s): return s.strip().lower()
class User:
    @staticmethod
    def from_dict(d): return type("X", (), {"to_dict": lambda self: d})()
class Cart:
    def __init__(self): self.items = []
    def add(self, item, price): self.items.append((item, price))
    def total(self): return sum(p for _, p in self.items)
```

## Decision Rule

```text
pure function with universal property      -> @given(strategy) + assertion
complex inputs depending on each other      -> @composite strategy
known edge cases must always run             -> @example(...)
long-running examples / CI flake             -> @settings(deadline=None, derandomize=True)
sequence of operations on a stateful object  -> RuleBasedStateMachine
need to scaffold property tests fast          -> hypothesis ghostwrite myapp.module
```

## Anti-Pattern

> [!warning] Anti-pattern
> testing a property the SUT enforces (e.g. testing __eq__'s reflexivity)
>   "x == x" can't fail — Hypothesis just burns CPU. Properties should constrain
>   relationships BETWEEN operations (encode/decode, sort/sort, push/pop).

## Tips

- Hypothesis remembers failing examples in a database — reruns them first on subsequent runs
- When Hypothesis finds a failure it shrinks to the minimal failing input — much easier to debug
- Use assume() sparingly — too many skipped inputs make the test less useful
- Property-based testing complements, not replaces, example-based tests — use both
- For inputs whose fields depend on each other, build a `@composite` strategy; for sequences of operations on a stateful object use `RuleBasedStateMachine`

## Common Mistake

> [!warning] Writing `@given(st.integers())` then using `n` in a way that only fails for very large numbers. Hypothesis will find it — but increase max_examples if the failure is rare.

## Shorthand (Junior → Senior)

**Junior:**
```python
import json
from hypothesis import given, assume, settings
from hypothesis import strategies as st
@given(st.lists(st.integers()))
```

**Senior:**
```python
assert isinstance(n, int)
```

## See Also

- [[Sections/testing/advanced/coverage|pytest coverage (Testing with pytest)]]
- [[Sections/testing/advanced/cov-config|pytest-cov configuration (Testing with pytest)]]
- [[Sections/testing/advanced/freezegun|freezegun (Testing with pytest)]]
- [[Sections/testing/advanced/marks-config|Marks & configuration (Testing with pytest)]]
- [[Sections/testing/advanced/_Index|Testing with pytest → Advanced Testing]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]
