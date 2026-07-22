# Tier Authoring Guide

Reference for converting single-`code:` entries into the three-tier
`examples:` shape used across `data/<domain>/*.js`. Read this once;
re-read only when something feels off.

---

## 1. Data shape

Each `.js` file exports `meta` and `sections`. Each section has
`entries`. Two entry shapes coexist in the codebase:

```js
// LEGACY (single code block — what we convert FROM)
{
  id: 'foo',
  fn: '...', desc: '...', category: '...', subtitle: '...',
  signature: '...', descLong: '...',
  code: `<code as a JS template literal>`,
  tips:    [ ... ],
  mistake: '...',
  shorthand: { verbose: ..., concise: ... },
}

// NEW (tiered — what we convert TO)
{
  id: 'foo',
  fn: '...', desc: '...', category: '...', subtitle: '...',
  signature: '...', descLong: '...',
  examples: [
    { tier: 'intro',  code: `# === ENTRY-LEVEL EXAMPLE ===\n...` },
    { tier: 'junior', code: `# === JUNIOR EXAMPLE ===\n...` },
    { tier: 'senior', code: `# === SENIOR EXAMPLE ===\n...` },
  ],
  tips:    [ ... ],
  mistake: '...',
  shorthand: { verbose: ..., concise: ... },
}
```

**The conversion is mechanical:** replace the `code: \`...\`,` field
with `examples: [...],`. Leave every other field untouched.

The `EntryModal.jsx` UI already handles both shapes — `examples` takes
priority when present.

---

## 2. Tier header banners (verbatim)

Every tier's `code` string starts with one of these blocks. Copy
exactly — the verifier checks the banner text. The `# APPROACH /
STRENGTHS / WEAKNESSES` lines are populated per entry.

```
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - <one-line summary of what this tier does>
# STRENGTHS - <why this tier earns its space>
# WEAKNESSES- <what this tier deliberately omits>
#
<intro code>
```

```
# === JUNIOR EXAMPLE ===
# APPROACH  - <one-line summary>
# STRENGTHS - <why>
# WEAKNESSES- <what's omitted>
#
<junior code>
```

```
# === SENIOR EXAMPLE ===
# APPROACH  - <one-line summary>
# STRENGTHS - <why>
# WEAKNESSES- <what's omitted>
#
<senior code>
```

Indentation: comments are flush-left in the code string. The line
after the header block is the first line of actual code (no extra
blank line, but a `#` empty-comment line is fine for separation).

---

## 3. Tier philosophy

| Tier   | Length     | Shows                                | Skips                         |
|--------|------------|--------------------------------------|-------------------------------|
| intro  | 5–10 lines | the simplest valid call, defaults    | options, edge cases, idioms   |
| junior | 15–25 lines| common options, 80%-case patterns    | production hardening          |
| senior | 25–40 lines| production rules, anti-patterns, decision rules | tutorial repetition |

**Length is a guide, not a rule.** API-heavy domains (pandas, ml,
seaborn) tend to run longer in senior tiers because there's more
production surface to cover. OOP / utility entries can be tighter.

---

## 4. Senior-tier conventions

Senior tiers should ideally include at least two of these elements:

- **Decision rule** — "when to pick X vs Y" (use the `Decision rule:`
  comment block, indented `#   ...`)
- **Anti-pattern** — explicit "wrong way / right way" callout
- **Production gotcha** — concrete failure mode with an explanation
- **Performance rule** — when each option scales / breaks down

Example senior-tier closing:

```
# Decision rule:
#   small N, ordered categories     -> ordinal_encoder
#   small N, nominal categories      -> one_hot_encoder
#   high cardinality, low signal     -> drop or hash
#   high cardinality, high signal    -> target_encoder (CV-safe)
#
# Anti-pattern: LabelEncoder on features
#   LabelEncoder().fit_transform(X[:, 0])    # imposes alphabetical order
#   Use OrdinalEncoder with explicit categories= instead.
```

---

## 5. Per-domain senior-tier vocabulary (established)

When authoring in these domains, lean on the patterns the readers
already learned in earlier files.

**numpy / data science cluster**
- view-vs-copy distinction (slicing, fancy indexing, ravel)
- contiguity checks before C-extension boundaries (`.flags`, `np.ascontiguousarray`)
- dtype pinning at construction (`dtype=np.float32`)
- "prefer broadcasting over materialization" (avoid np.tile)
- nullable extension dtypes (`Int64`, `Float64`, `string[pyarrow]`)

**pandas**
- always pass `validate=` and `indicator=True` on important `merge`
- `observed=True` on categorical groupby
- `closed="left"` / `shift(1)` to prevent leakage in rolling/expanding ML features
- `Pipeline` + `cross_val_score` is the leakage-proof scaling pattern

**ml**
- preprocessing INSIDE a `Pipeline` (refits per CV fold)
- `class_weight="balanced"` for imbalance
- `predict_proba` + `CalibratedClassifierCV` when probabilities feed business decisions
- `n_jobs=-1` everywhere it's accepted
- decision rule by N for SVM/KNN: small / medium / large dataset paths
- `HistGradientBoostingClassifier` over `GradientBoostingClassifier` (10-100x faster)

**matplotlib / seaborn**
- always the OO API (`fig, ax = plt.subplots()`); never `plt.plot` in real code
- `layout="constrained"` over `tight_layout` in new code
- perceptually-uniform colormaps (viridis, plasma, cividis); never jet/rainbow
- figure-level (`displot`, `relplot`, `catplot`) returns a `FacetGrid`; no `ax=`
- axes-level (`histplot`, `scatterplot`) takes `ax=` and integrates into subplots

---

## 6. Edit-call pattern

```py
# Edit tool:
#   old_string: the existing `code: \`...\`,` block, exactly as-is
#                (include the leading `        code: \`` and trailing
#                 `\`,` — those are the field boundaries)
#   new_string: the replacement `examples: [...],` block
```

Concretely, find this:

```
        code: `<existing single-tier code>`,
```

Replace with:

```
        examples: [
          {
            tier: 'intro',
            code: `# === ENTRY-LEVEL EXAMPLE ===
...`,
          },
          {
            tier: 'junior',
            code: `# === JUNIOR EXAMPLE ===
...`,
          },
          {
            tier: 'senior',
            code: `# === SENIOR EXAMPLE ===
...`,
          },
        ],
```

The fields BEFORE (`id`, `fn`, `desc`, etc.) and AFTER (`tips`,
`mistake`, `shorthand`) the `code:` field stay untouched.

---

## 7. Common pitfalls

1. **Dangling fragments from the old `code:` block.** Some legacy
   `code:` blocks span more than one statement (e.g. two `sns.catplot()`
   calls). When replacing, make sure the `old_string` covers the
   ENTIRE old code value including the closing backtick + comma. If
   the verifier reports a syntax error, look for stray pre-tier code
   between `examples: [...]` and the next field (`tips:`).

2. **Backtick / dollar / template-literal escapes.** Inside a JS
   template literal, escape `\`` (backtick), `\${` (template
   substitution), and any `\\` (backslash). Most code in tiers is
   plain Python — no problem. Watch for `f"${x}"` in JS — escape it
   `f"\${x}"` so JS doesn't interpolate.

3. **Banner text mismatch.** The verifier checks that each tier's
   `code` STARTS WITH the exact banner. `# === Intro ===` will fail.
   Use `# === ENTRY-LEVEL EXAMPLE ===` exactly.

4. **`shorthand`/`verbose` containing template-literal traces.**
   Many legacy entries have nonsense `shorthand` blocks left over
   from copy-paste. Don't try to fix them — out of scope.

---

## 8. Canonical example

`data/python/pandas.js` → `merge` entry. It exercises every senior-
tier pattern: intro, junior, senior with decision rule + production
gotchas + anti-pattern callouts. Use it as a touchstone if format
intuition gets fuzzy.

---

## 9. Verification

```bash
# Generic per-file check (uses outputs/check_file.mjs):
node /sessions/keen-sweet-galileo/mnt/outputs/check_file.mjs \
  /sessions/keen-sweet-galileo/mnt/projects/codesheets/data/python/<file>.js
```

Verifies:
- file re-parses as ES module
- every entry that has `examples:` is `[intro, junior, senior]`
- every example's code starts with the matching banner
- counts tiered vs single-code (so partial passes are visible)

---

## 10. Pass cadence and the "skip seaborn B" trap

Files >25 entries are split into 2 passes (e.g. `pandas A/B/C`).
File-level state matters: if a pass partially completes, the verifier
shows it (`tiered: N/M`). When picking the next pass, check the
verifier so you don't accidentally re-do a section.

Outstanding partial files (as of this guide):
- `seaborn.js`: 19/32 — matrix + setup-customization sections still single-code
- `ml.js`:       21/40 — evaluation + tuning + clustering sections still single-code

Resuming = pick a single section group, do the conversion, run the
verifier, move to the next.
