---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "sklearn-text"
id: "tfidf-vectorizer"
title: "TfidfVectorizer — text → numeric features"
category: "sklearn-text"
subtitle: "TfidfVectorizer, ngram_range, min_df / max_df, sublinear_tf, stop_words, max_features, HashingVectorizer for streaming, sparse matrices"
signature_short: "vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=50_000)
X = vec.fit_transform(docs)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "TfidfVectorizer — text → numeric features"
  - "tfidf-vectorizer"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/sklearn-text"
  - "category/sklearn-text"
  - "tier/tiered"
---

# TfidfVectorizer — text → numeric features

> TfidfVectorizer, ngram_range, min_df / max_df, sublinear_tf, stop_words, max_features, HashingVectorizer for streaming, sparse matrices

## Overview

TF-IDF (term-frequency × inverse-document-frequency) weighs each word by how distinctive it is to a document — common words get low weight, document-specific words high. `TfidfVectorizer` is the workhorse for converting text to ML features. Knobs: `ngram_range` (unigrams alone vs unigrams+bigrams), `min_df`/`max_df` (drop rare and ubiquitous terms), `sublinear_tf=True` (log-scale frequencies; usually wins), `max_features` (cap vocabulary). The output is a sparse matrix — works with sklearn classifiers directly. The three examples solve the SAME concrete task — build TF-IDF features for a small classification dataset — at three depths: defaults → tuned ngrams + min_df → HashingVectorizer for streaming + sparse-friendly downstream.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Convert text documents to TF-IDF feature vectors.
- **Junior** — SAME — but with sensible production defaults.
- **Senior** — SAME — production: streaming via HashingVectorizer + optional TfidfTransformer; sparse-aware downstream.

## Signature

```python
vec = TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_features=50_000)
X = vec.fit_transform(docs)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Convert text documents to TF-IDF feature vectors.
from sklearn.feature_extraction.text import TfidfVectorizer

docs = [
    "The cat sat on the mat",
    "The dog sat on the log",
    "Cats and dogs are pets",
]

vec = TfidfVectorizer()
X = vec.fit_transform(docs)                            # sparse matrix
print(X.shape)                                          # (3, 9) — 9 unique terms
print(vec.get_feature_names_out())
# ['and' 'are' 'cat' 'cats' 'dog' 'dogs' 'log' 'mat' 'pets' 'sat' 'the']

print(X.toarray().round(3))                            # dense for inspection
# Each row is a doc; each column a term; values are TF-IDF weights.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with sensible production defaults.
from sklearn.feature_extraction.text import TfidfVectorizer

vec = TfidfVectorizer(
    lowercase=True,
    strip_accents="unicode",
    ngram_range=(1, 2),                                # unigrams + bigrams; usually wins
    min_df=2,                                          # drop terms in <2 docs (typos, OOV)
    max_df=0.95,                                       # drop terms in >95% of docs ("the", domain-common)
    max_features=50_000,                                # cap vocabulary size
    sublinear_tf=True,                                  # log(1+tf); usually a small win
    norm="l2",                                          # L2-normalize each row (default; for cosine sim)
    stop_words="english",                              # built-in; or your own list; or None
    token_pattern=r"\b[a-zA-Z][a-zA-Z]+\b",         # 2+ letter alpha words
)

# Fit on training set; transform both:
X_train = vec.fit_transform(train_docs)               # learns vocabulary
X_test  = vec.transform(test_docs)                    # uses SAME vocabulary; OOV terms ignored

print(f"Vocab size: {len(vec.vocabulary_)}")
print(f"Train shape: {X_train.shape}")
print(f"Top 10 most common features: {sorted(vec.vocabulary_.items(), key=lambda kv: kv[1])[:10]}")

# === Inspect what got dropped by min_df / max_df ===
# Get all terms BEFORE filtering:
# raw_vec = TfidfVectorizer(min_df=1, max_df=1.0)
# raw_vec.fit(train_docs)
# dropped = set(raw_vec.vocabulary_) - set(vec.vocabulary_)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: streaming via HashingVectorizer +
#             optional TfidfTransformer; sparse-aware downstream.
from sklearn.feature_extraction.text import HashingVectorizer, TfidfTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import SGDClassifier
import scipy.sparse as sp

# === Streaming: HashingVectorizer doesn't need fit() ===
# Use case: too much data to fit in memory at once; or online learning.
hv = HashingVectorizer(
    n_features=2**18,                                   # 262k feature space
    alternate_sign=False,                               # all positive (matches TF-IDF semantics)
    ngram_range=(1, 2),
    norm=None,                                          # we'll let TfidfTransformer normalize
)

# === Combine with TfidfTransformer for IDF weighting ===
pipe = Pipeline([
    ("hash", hv),
    ("tfidf", TfidfTransformer(sublinear_tf=True)),
    ("clf", SGDClassifier(loss="log_loss", alpha=1e-5, max_iter=5)),
])

# Streaming partial_fit (when data > memory):
def stream_train(file_paths, labels):
    """Train incrementally over batches without loading everything."""
    classes = list(set(labels))                        # known up-front
    for batch_paths, batch_y in batches(file_paths, labels, size=10_000):
        batch_texts = [open(p).read() for p in batch_paths]
        # Hash + idf-transform NOT compatible with partial_fit (idf needs full corpus).
        # For true streaming, drop TfidfTransformer; use HashingVectorizer only.
        X_batch = hv.transform(batch_texts)
        pipe.named_steps["clf"].partial_fit(X_batch, batch_y, classes=classes)

def batches(items, labels, size): ...

# === Inspect feature importance for a fitted classifier ===
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

p = make_pipeline(TfidfVectorizer(ngram_range=(1, 2), min_df=2),
                   LogisticRegression(C=1.0, max_iter=1000))
# p.fit(X_train, y_train)
# Get most predictive features per class:
# vec, clf = p.named_steps["tfidfvectorizer"], p.named_steps["logisticregression"]
# feature_names = vec.get_feature_names_out()
# for class_idx in range(len(clf.classes_)):
#     top_idx = clf.coef_[class_idx].argsort()[-20:][::-1]
#     print(f"Class {clf.classes_[class_idx]}: {feature_names[top_idx]}")

# === Sparse-aware downstream classifiers ===
# Most sklearn linear models (LogisticRegression, SGDClassifier, LinearSVC)
# accept sparse matrices natively. AVOID:
#   X_dense = X_sparse.toarray()                        # OOM for large corpora
# Tree-based models (RandomForest, GradientBoosting) silently densify;
# they're often the wrong choice for high-dim TF-IDF features.

# Decision rule:
#   small dataset, bounded vocab          -> TfidfVectorizer; defaults are fine
#   need bigrams                            -> ngram_range=(1, 2)
#   noise / typos in vocab                  -> min_df=2 or higher
#   common words dominating                 -> max_df=0.95; or stop_words="english"
#   need to limit memory                    -> max_features=50_000
#   data > memory / online learning         -> HashingVectorizer + SGDClassifier
#   character n-grams                        -> analyzer="char_wb", ngram_range=(3, 5)
#   multilingual                            -> char n-grams; or per-language vectorizer
#   need to inspect features                 -> TfidfVectorizer (HashingVectorizer is opaque)
#   compare with embeddings                  -> sentence-transformers (different pattern)
#   exact match retrieval                   -> BM25 (rank_bm25) usually beats TF-IDF cosine
#   classification baseline                  -> TF-IDF + LogisticRegression; surprisingly hard to beat
#
# Anti-pattern: calling fit_transform on the test set (or fitting a
# new vectorizer for each split). The vocabulary diverges; OOV
# behavior is broken; cross-validation lies. ALWAYS fit on train,
# transform on test. Wrap in a sklearn Pipeline so this is enforced.
```

## Decision Rule

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

## Anti-Pattern

> [!warning] Anti-pattern
> calling fit_transform on the test set (or fitting a
> new vectorizer for each split). The vocabulary diverges; OOV
> behavior is broken; cross-validation lies. ALWAYS fit on train,
> transform on test. Wrap in a sklearn Pipeline so this is enforced.

## Tips

- `ngram_range=(1, 2)` (unigrams + bigrams) usually wins over unigrams alone for classification. Larger ranges quickly explode vocabulary; rarely worth it without `min_df`.
- `min_df=2` drops terms appearing in <2 docs — eliminates typos and one-off OOV. `min_df=5` for larger corpora.
- `sublinear_tf=True` applies log(1+tf) — small win on most tasks; almost never hurts.
- For huge corpora (>1M docs), use `HashingVectorizer` — no fit() needed; constant memory; supports `partial_fit` for online learning.
- For multilingual text, character n-grams (`analyzer="char_wb"`, `ngram_range=(3, 5)`) generalize across word forms and languages.
- TF-IDF + LogisticRegression is a surprisingly hard-to-beat baseline. Try this BEFORE transformers — it's 100× faster to train and serve.

## Common Mistake

> [!warning] Calling `fit_transform` on test data (or fitting separate vectorizers for train/test). The vocabulary diverges; OOV terms in test get silently dropped; metrics are wrong. ALWAYS `fit` on train and `transform` on test — wrap in a sklearn `Pipeline` so this is enforced.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Separate fit per split — broken vocabulary + leakage
X_train = TfidfVectorizer().fit_transform(train_docs)
X_test  = TfidfVectorizer().fit_transform(test_docs)
```

**Senior:**
```python
# Fit on train, transform on test
vec = TfidfVectorizer().fit(train_docs)
X_train = vec.transform(train_docs)
X_test  = vec.transform(test_docs)
```

## See Also

- [[Sections/nlp-classical/sklearn-text/text-classification|Text classification — Pipeline, baseline, hyperparameter tuning (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/topic-modeling|Topic modeling — LDA, NMF, embeddings + clustering (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/_Index|Classical NLP → sklearn-text — TF-IDF, classification, topic modeling]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
