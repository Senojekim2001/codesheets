---
type: "entry"
domain: "python"
file: "pandas"
section: "io"
id: "pd-eval"
title: "pd.eval()"
category: "Performance"
subtitle: "Avoids intermediate arrays for large DataFrames"
signature_short: "df.eval(\"new = a * b + c * d\", inplace=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "pd.eval()"
  - "pd-eval"
tags:
  - "python"
  - "python/pandas"
  - "python/pandas/io"
  - "category/performance"
  - "tier/tiered"
---

# pd.eval()

> Avoids intermediate arrays for large DataFrames

## Overview

pd.eval() compiles arithmetic string expressions and evaluates them without creating intermediate arrays. Faster than chained pandas operations on large DataFrames (>10k rows). Uses numexpr under the hood. Rule of thumb: only worth it when the frame is >=100k rows AND the expression chains 3+ operators — below that, the parsing overhead beats the savings.

## Signature

```python
df.eval("new = a * b + c * d", inplace=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - one expression, side-by-side with the equivalent pandas
#             arithmetic, so the difference is visible.
# STRENGTHS - reveals the API in two lines: df.eval takes a string and
#             can write back via assignment.
# WEAKNESSES- doesn't cover @local-variable references, multiple
#             assignments, or the "when does it actually help?" rule.
#
import pandas as pd

# Standard pandas — allocates an intermediate array per operator
df["result"] = df["a"] * df["b"] + df["c"] * df["d"]

# Same calc with eval — no intermediates
df.eval("result = a * b + c * d", inplace=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday eval features: @local for Python variables,
#             multi-line assignments, and the no-inplace form that
#             returns a Series.
# STRENGTHS - covers the API surface you'll actually use; multi-line
#             assignments keep related computations together cleanly.
# WEAKNESSES- on small frames (<10k rows) the parser overhead can
#             outweigh the savings — measure before reaching for it.
#
import pandas as pd

# Reference Python locals with @
threshold = 0.5
df.eval("flag = score > @threshold", inplace=True)

# Standalone expression — returns a Series instead of writing to df
norm = df.eval("(score - score.mean()) / score.std()")

# Multiple assignments in one call
df.eval("""
    tax   = salary * 0.3
    net   = salary - tax
    ratio = tax / net
""", inplace=True)

# Cross-DataFrame expressions go through pd.eval()
result = pd.eval("df1.a + df2.b")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - reach for eval only when it pays off: install numexpr,
#             use it on long arithmetic chains over large frames, and
#             know its limits — no function calls, no fancy indexing,
#             no ufuncs.
# STRENGTHS - on big numeric frames eval can give 2-3x speedups by
#             avoiding intermediate allocations and using numexpr's
#             multi-threaded backend; the multi-line form keeps the
#             pipeline self-documenting.
# WEAKNESSES- supports only +, -, *, /, **, &, |, ~, and comparisons —
#             a single np.log() forces you back to vectorized pandas;
#             debugging is harder because errors point at a string.
#
import pandas as pd
import numpy as np
import time

n = 5_000_000
df = pd.DataFrame({
    "a": np.random.rand(n),
    "b": np.random.rand(n),
    "c": np.random.rand(n),
    "d": np.random.rand(n),
})

# Measure — eval should win on long chains over large frames
t0 = time.perf_counter()
df["r1"] = df["a"] * df["b"] + df["c"] * df["d"] - df["a"] / (df["b"] + 1)
print(f"pandas:  {time.perf_counter()-t0:.3f}s")

t0 = time.perf_counter()
df.eval("r2 = a * b + c * d - a / (b + 1)", inplace=True)
print(f"eval:    {time.perf_counter()-t0:.3f}s")

# Limit: eval cannot call functions — log(x) below would error.
# Drop back to vectorized pandas/NumPy for those:
df["log_a"] = np.log1p(df["a"])

# Decision rule:
#   - frame >= 100k rows AND expression has >=3 operators -> try eval
#   - need a function call (log, abs, where, ...) -> stay with pandas

# Anti-pattern: reaching for pd.eval in Python loops
#   pd.eval shines on a SINGLE large expression (numexpr can vectorize and
#   parallelize). In a loop the per-call parsing/JIT cost dominates. Use a
#   single eval string for compound numeric expressions; for everything else
#   stick to plain pandas vectorized ops.
```

## Decision Rule

```text
- frame >= 100k rows AND expression has >=3 operators -> try eval
- need a function call (log, abs, where, ...) -> stay with pandas
```

## Anti-Pattern

> [!warning] Anti-pattern
> reaching for pd.eval in Python loops
>   pd.eval shines on a SINGLE large expression (numexpr can vectorize and
>   parallelize). In a loop the per-call parsing/JIT cost dominates. Use a
>   single eval string for compound numeric expressions; for everything else
>   stick to plain pandas vectorized ops.

## Tips

- Requires numexpr: `pip install numexpr` — pandas uses it automatically when available
- Most useful for DataFrames >10k rows — below that, overhead outweighs the benefit
- Supports `+`, `-`, `*`, `/`, `**`, `&`, `|`, `~`, `<`, `>`, `==`, `!=` — not function calls
- Use `@var` to reference local Python variables inside the expression string

## Common Mistake

> [!warning] Using pd.eval() for function calls like `np.log(a)`. eval() only supports arithmetic and comparison operators — not NumPy or pandas functions. Use vectorized operations for those.

## Shorthand (Junior → Senior)

**Junior:**
```python
import pandas as pd
df['result'] = df['a'] * df['b'] + df['c'] * df['d']
df.eval('result = a * b + c * d', inplace=True)
df.eval('norm = (score - score.mean()) / score.std()', inplace=True)
```

**Senior:**
```python
pd.eval('df1.a + df2.b')  # cross-DataFrame expressions
```

## See Also

- [[Sections/pandas/io/dtype-opt|dtype optimization (Pandas)]]
- [[Sections/numpy/operations/np-einsum|np.einsum() (NumPy)]]
- [[Sections/database/patterns/n-plus-one|N+1 queries — diagnose and fix with eager loading (Databases & SQLAlchemy)]]
- [[Sections/pandas/io/_Index|Pandas → Reading, Writing & Performance]]
- [[Sections/pandas/_Index|Pandas index]]
- [[_Index|Vault index]]
