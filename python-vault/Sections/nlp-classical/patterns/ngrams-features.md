---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "patterns"
id: "ngrams-features"
title: "N-grams — character vs word, when each helps"
category: "Patterns"
subtitle: "word ngrams (TfidfVectorizer ngram_range), char_wb analyzer, FeatureUnion to combine, OOV handling, multilingual char n-grams"
signature_short: "word_vec = TfidfVectorizer(ngram_range=(1,2)); char_vec = TfidfVectorizer(analyzer=\"char_wb\", ngram_range=(3,5))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "N-grams — character vs word, when each helps"
  - "ngrams-features"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# N-grams — character vs word, when each helps

> word ngrams (TfidfVectorizer ngram_range), char_wb analyzer, FeatureUnion to combine, OOV handling, multilingual char n-grams

## Overview

Word n-grams treat phrases as features ("not good" is one feature, separate from "not" + "good"). Character n-grams use letter sequences ("running" → "run", "unn", "nni", "nin", "ing") which generalize across morphological variants AND handle out-of-vocabulary words. Best results often combine both via `FeatureUnion`. The three examples solve the SAME concrete task — extract features for a multilingual product review classifier — at three depths: word unigrams + bigrams → char n-grams (4-6) → FeatureUnion combining both.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Convert text to features for classification.
- **Junior** — SAME — but use character n-grams for OOV robustness.
- **Senior** — SAME — production: pipeline with FeatureUnion, weighted combination, tuning via GridSearchCV.

## Signature

```python
word_vec = TfidfVectorizer(ngram_range=(1,2)); char_vec = TfidfVectorizer(analyzer="char_wb", ngram_range=(3,5))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Convert text to features for classification.
from sklearn.feature_extraction.text import TfidfVectorizer

docs = ["the cat sat", "a dog ran", "cats and dogs"]

# Word unigrams (default).
vec1 = TfidfVectorizer(ngram_range=(1, 1))
print(vec1.fit(docs).get_feature_names_out())
# ['and' 'cat' 'cats' 'dog' 'dogs' 'ran' 'sat' 'the']

# Word unigrams + bigrams.
vec2 = TfidfVectorizer(ngram_range=(1, 2))
print(vec2.fit(docs).get_feature_names_out())
# ['and' 'and dogs' 'cat' 'cat sat' 'cats' 'cats and' 'dog' 'dog ran' ...]

# When word bigrams help:
#   Sentiment: "not good" carries different meaning than "not" + "good"
#   Topic: "machine learning" is a topic; "machine" + "learning" alone are not
# When they don't:
#   Already-strong unigrams + small dataset (sparsity hurts)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use character n-grams for OOV robustness.
from sklearn.feature_extraction.text import TfidfVectorizer

# === Character n-grams ===
# analyzer="char_wb" = char n-grams that respect word boundaries
# (won't span across spaces). "char" alone spans words.
char_vec = TfidfVectorizer(
    analyzer="char_wb",
    ngram_range=(3, 5),                                # 3-5 char sequences
    min_df=2,
)

docs = ["I love running", "She runs quickly", "Runners are fast"]
char_vec.fit(docs)

# Notice: "run" appears in all three (running/runs/Runners) as a feature
# even though the surface words differ. Word n-grams would see them as
# separate.
print(char_vec.get_feature_names_out()[:30])
# ' ar' ' fa' ' lo' ' ov' ' qu' ' ru' 're ' 're a' 'are' 'are ' 'ast'
# 'cki' ... 'nin' 'ning' 'ning ' 'nn' ...

# When char n-grams help:
#   Multilingual / typos / rare words / morphology
#   Short text where word vocab is sparse
#   Names / product codes / DNA sequences

# When they hurt:
#   Vocabulary explosion (millions of features); use min_df=N
#   Word semantics matter more than morphology

# === Combining word + char features via FeatureUnion ===
from sklearn.pipeline import FeatureUnion

combined = FeatureUnion([
    ("word", TfidfVectorizer(ngram_range=(1, 2), min_df=2)),
    ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5), min_df=5)),
])
X = combined.fit_transform(docs)
print(f"Combined features: {X.shape[1]}")            # word features + char features
# Often gets +1-3% F1 over either alone for sentiment / classification
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: pipeline with FeatureUnion, weighted
#             combination, tuning via GridSearchCV.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline, FeatureUnion
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV

# === Combined feature pipeline ===
pipe = Pipeline([
    ("features", FeatureUnion([
        ("word", TfidfVectorizer(
            ngram_range=(1, 2), min_df=2, sublinear_tf=True,
            analyzer="word",
        )),
        ("char", TfidfVectorizer(
            ngram_range=(3, 5), min_df=5, sublinear_tf=True,
            analyzer="char_wb",
            max_features=50_000,                       # cap; char features explode otherwise
        )),
    ])),
    ("clf", LogisticRegression(max_iter=2000, class_weight="balanced")),
])

# === Tune the n-gram ranges ===
param_grid = {
    "features__word__ngram_range": [(1, 1), (1, 2), (1, 3)],
    "features__char__ngram_range": [(3, 4), (3, 5), (4, 6)],
    "features__char__max_features": [20_000, 50_000, 100_000],
    "clf__C": [0.1, 1.0, 10.0],
}
grid = GridSearchCV(pipe, param_grid, cv=3, scoring="f1_macro", n_jobs=-1)

# === Weighted FeatureUnion (transformer_weights) ===
# When word features dominate but char features add signal, weight them:
weighted = FeatureUnion([
    ("word", TfidfVectorizer(ngram_range=(1, 2))),
    ("char", TfidfVectorizer(analyzer="char_wb", ngram_range=(3, 5))),
], transformer_weights={"word": 1.0, "char": 0.3})    # downweight char

# Decision rule:
#   English, well-formed text             -> word n-grams (1, 2) — usually enough
#   sentiment, negation matters            -> word n-grams (1, 2) keeping "not"
#   typos / informal text (tweets)         -> char n-grams (3, 5)
#   short text, sparse vocab               -> char n-grams cover OOV better
#   multilingual                            -> char n-grams; less sensitive to language
#   names / product codes / DNA            -> char n-grams (3, 5)
#   need both                               -> FeatureUnion(word + char)
#   feature explosion                       -> max_features=N AND min_df=K
#   topic modeling                          -> word n-grams; char too noisy
#   transformer downstream                  -> NEITHER; transformers tokenize themselves
#   need to interpret features              -> word n-grams only (char features are opaque)
#   multilingual sentiment                  -> char + word combined; or pretrained multilingual model
#
# Anti-pattern: word n-grams with very large ngram_range (e.g., 1-5)
# without min_df. Vocabulary explodes from ~10k unigrams to millions
# of 5-grams; sparsity dominates; classifier overfits to specific
# phrases that appeared once in training. Cap at (1, 2) or (1, 3)
# and require min_df >= 2.
```

## Decision Rule

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

## Anti-Pattern

> [!warning] Anti-pattern
> word n-grams with very large ngram_range (e.g., 1-5)
> without min_df. Vocabulary explodes from ~10k unigrams to millions
> of 5-grams; sparsity dominates; classifier overfits to specific
> phrases that appeared once in training. Cap at (1, 2) or (1, 3)
> and require min_df >= 2.

## Tips

- Word n-grams (1, 2) is the sane default. Larger ranges explode vocabulary; (1, 3) only helps with strong `min_df`.
- Character n-grams (`char_wb` analyzer, range 3-5) handle OOV, typos, and morphology. Critical for short or multilingual text.
- Combine word + char features via `FeatureUnion` — often gets +1-3% F1 over either alone, especially on noisy text.
- Cap char-n-gram vocabulary with `max_features=50_000` — char features explode without bounds (a million-doc corpus has 100M+ char-5-grams).
- Use `transformer_weights` on FeatureUnion to downweight one feature set (`{"word": 1.0, "char": 0.3}`) when one dominates the other.
- For transformer downstream models, SKIP n-gram features entirely — the model handles tokenization.

## Common Mistake

> [!warning] Word n-grams with `ngram_range=(1, 5)` and no `min_df`. Vocabulary explodes from ~10k unigrams to millions of 5-grams; sparsity dominates; classifier overfits to phrases that appeared once. Cap at (1, 2) or (1, 3) with `min_df >= 2`.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Vocabulary explosion — millions of features
TfidfVectorizer(ngram_range=(1, 5))
```

**Senior:**
```python
# Bounded vocab
TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=50_000)
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/nlp-classical/patterns/_Index|Classical NLP → NLP Patterns — cleaning, ngrams, classical-vs-LLM]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
