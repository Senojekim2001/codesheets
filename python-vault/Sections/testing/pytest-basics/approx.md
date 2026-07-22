---
type: "entry"
domain: "python"
file: "testing"
section: "pytest-basics"
id: "approx"
title: "pytest.approx()"
category: "pytest"
subtitle: "Never use == for floats — use pytest.approx()"
signature_short: "assert value == pytest.approx(expected, rel=1e-6, abs=1e-12)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pytest.approx()"
  - "approx"
tags:
  - "python"
  - "python/testing"
  - "python/testing/pytest-basics"
  - "category/pytest"
  - "tier/tiered"
---

# pytest.approx()

> Never use == for floats — use pytest.approx()

## Overview

Floating-point arithmetic is inexact — 0.1 + 0.2 is not exactly 0.3 in binary. pytest.approx() compares with a relative tolerance (default 1e-6) so small floating-point errors do not cause false failures. Works on scalars, lists, dicts, and numpy arrays.

## Signature

```python
assert value == pytest.approx(expected, rel=1e-6, abs=1e-12)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The classic 0.1 + 0.2 trap, fixed with pytest.approx
# STRENGTHS - Smallest valid float comparison
# WEAKNESSES- No tolerance discussion
#
import pytest

# 0.1 + 0.2 == 0.3   # False in Python! IEEE 754 float math is inexact

def test_float_sum():
    assert 0.1 + 0.2 == pytest.approx(0.3)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - rel vs abs tolerance, lists/dicts/arrays, when integers are fine
# STRENGTHS - Covers the four shapes you'll meet in practice
# WEAKNESSES- No discussion of nan / inf / signed zero
#
import math
import numpy as np
import pytest

# Default: rel=1e-6  (|a-b| / |b| < 1e-6)
assert 1 / 3 == pytest.approx(0.333333, rel=1e-5)

# Use abs= when the expected value is near zero (relative tolerance breaks down)
assert math.sin(math.pi) == pytest.approx(0.0, abs=1e-9)   # NOT rel=

# Approx works on collections too — diffs become readable on failure
assert [0.1 + 0.2, 1/3] == pytest.approx([0.3, 0.3333])
assert {"pi": 3.14159, "e": 2.71828} == pytest.approx({"pi": 3.14159, "e": 2.71828})

# numpy arrays: works the same way
assert np.array([0.1 + 0.2]) == pytest.approx(np.array([0.3]))

# Integers are exact — DON'T wrap them in approx
assert 10 // 3 == 3
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - When approx is wrong: NaN, near-zero, scientific data, big numbers
# STRENGTHS - The edge cases that catch teams shipping flaky float tests
# WEAKNESSES- N/A
#
import math
import numpy as np
import pytest

# 1) NaN is NEVER == anything — including itself or another NaN.
#    pytest.approx supports nan via nan_ok=True
assert math.nan == pytest.approx(math.nan, nan_ok=True)

# 2) Near-zero — relative tolerance is meaningless. Use abs=, not rel=.
#    rel=1e-6 around 0.0 means "absolute < 0.0" -> always fails.
def test_near_zero_use_abs():
    val = 1e-12
    assert val == pytest.approx(0.0, abs=1e-9)            # OK
    # assert val == pytest.approx(0.0, rel=1e-6)          # FAILS

# 3) Mixed-magnitude vectors — np.isclose with rtol AND atol is the safer tool
#    pytest.approx applies one tolerance pair across the whole structure.
big_small = np.array([1e6, 1e-6, 0.0])
np.testing.assert_allclose(big_small, [1e6 + 1, 1e-6, 1e-9], rtol=1e-3, atol=1e-9)

# 4) Don't use approx on EXACT comparisons. Integer math, hash strings, IDs —
#    those should fail loudly when they drift. approx hides the problem.

# 5) For scientific results, prefer numpy.testing helpers — the failure messages
#    show element-wise diffs, mean error, and locations.
np.testing.assert_array_almost_equal_nulp(np.array([1.0]), np.array([1.0]), nulp=2)

# Decision rule:
#   simple float scalar                       -> pytest.approx(expected, rel=1e-6)
#   value near zero                            -> pytest.approx(0.0, abs=1e-9)
#   list / dict of floats                      -> pytest.approx(struct)
#   numpy array, mixed magnitudes               -> np.testing.assert_allclose(..., rtol, atol)
#   bit-level numerical correctness            -> np.testing.assert_array_almost_equal_nulp
#   integers / IDs / strings                    -> plain ==
#
# Anti-pattern: assert abs(a - b) < 1e-6
#   Hand-rolled tolerances forget the absolute case, don't compose, and produce
#   useless failure messages. Use approx or np.testing.* — they print diffs.
```

## Decision Rule

```text
simple float scalar                       -> pytest.approx(expected, rel=1e-6)
value near zero                            -> pytest.approx(0.0, abs=1e-9)
list / dict of floats                      -> pytest.approx(struct)
numpy array, mixed magnitudes               -> np.testing.assert_allclose(..., rtol, atol)
bit-level numerical correctness            -> np.testing.assert_array_almost_equal_nulp
integers / IDs / strings                    -> plain ==
```

## Anti-Pattern

> [!warning] Anti-pattern
> assert abs(a - b) < 1e-6
>   Hand-rolled tolerances forget the absolute case, don't compose, and produce
>   useless failure messages. Use approx or np.testing.* — they print diffs.

## Tips

- Default tolerance is 1e-6 relative — tight enough for most tests, loose enough for float noise
- `abs=` tolerance is better when the expected value is near zero (relative tolerance breaks down)
- pytest.approx works on nested structures — lists of lists, dicts of lists, numpy arrays
- Only use approx for floats — integer comparisons should always be exact

## Common Mistake

> [!warning] `assert 0.1 + 0.2 == 0.3` fails because `0.1 + 0.2 = 0.30000000000000004`. Always use `pytest.approx()` for floating-point assertions.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pytest
0.1 + 0.2 == 0.3          # False in Python!
def test_float():
assert 0.1 + 0.2 == pytest.approx(0.3)     # passes ✓
```

**Senior:**
```python
assert 10 // 3 == 3     # exact comparison fine
```

## See Also

- [[Sections/testing/pytest-basics/assertions|pytest assertions (Testing with pytest)]]
- [[Sections/testing/pytest-basics/test-doubles|Test doubles (Testing with pytest)]]
- [[Sections/testing/pytest-basics/raises|pytest.raises() (Testing with pytest)]]
- [[Sections/testing/pytest-basics/parametrize|@pytest.mark.parametrize (Testing with pytest)]]
- [[Sections/testing/pytest-basics/_Index|Testing with pytest → pytest Basics]]
- [[Sections/testing/_Index|Testing with pytest index]]
- [[_Index|Vault index]]
