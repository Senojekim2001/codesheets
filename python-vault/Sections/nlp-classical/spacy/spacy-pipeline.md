---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "spacy"
id: "spacy-pipeline"
title: "spaCy pipeline — load model, tokenize, POS, lemma"
category: "spaCy"
subtitle: "spacy.load, nlp(text), Doc / Token / Span, token.lemma_ / pos_ / dep_, nlp.pipe for batch, en_core_web_sm/md/lg/trf, disable= for speed"
signature_short: "nlp = spacy.load(\"en_core_web_sm\"); doc = nlp(\"text\"); for tok in doc: tok.lemma_, tok.pos_"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "spaCy pipeline — load model, tokenize, POS, lemma"
  - "spacy-pipeline"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/spacy"
  - "category/spacy"
  - "tier/tiered"
---

# spaCy pipeline — load model, tokenize, POS, lemma

> spacy.load, nlp(text), Doc / Token / Span, token.lemma_ / pos_ / dep_, nlp.pipe for batch, en_core_web_sm/md/lg/trf, disable= for speed

## Overview

spaCy is the production-grade NLP library when you need fast, deterministic linguistic features — tokenization, POS tagging, lemmas, dependency parses — without a transformer. Models come in sizes: `_sm` (small, ~12MB, fast), `_md` (with vectors, ~40MB), `_lg` (larger vectors, ~560MB), `_trf` (transformer-backed, ~440MB, slowest but best accuracy). The pipeline is a sequence of components (`tokenizer → tagger → parser → ner → ...`); disable any you don't need with `disable=` for speed. The three examples solve the SAME concrete task — extract lemmatized content tokens from a document, with POS info — at three depths: minimal `nlp(text)` and iterate → batched `nlp.pipe` + disabled components for speed → production with model versioning, multilingual handling, transformer-vs-CPU decision.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Extract lemmatized content tokens (no stop words, no punctuation). pip install spacy python -m spacy download en_core_web_sm
- **Junior** — SAME — but for thousands of docs; disable unused components for speed; batch via nlp.pipe; preserve sentences.
- **Senior** — SAME — production: model selection by use case, multilingual handling, n_process for CPU parallelism.

## Signature

```python
nlp = spacy.load("en_core_web_sm"); doc = nlp("text"); for tok in doc: tok.lemma_, tok.pos_
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Extract lemmatized content tokens (no stop words, no punctuation).
# pip install spacy
# python -m spacy download en_core_web_sm
import spacy

nlp = spacy.load("en_core_web_sm")

def content_lemmas(text: str) -> list[str]:
    doc = nlp(text)
    return [tok.lemma_.lower() for tok in doc
            if not tok.is_stop and not tok.is_punct and not tok.is_space]

print(content_lemmas("The quick brown foxes were jumping over the lazy dogs."))
# ['quick', 'brown', 'fox', 'jump', 'lazy', 'dog']

# Token attributes that matter:
#   tok.text         - original surface form
#   tok.lemma_       - canonical form ('jumping' -> 'jump')
#   tok.pos_         - coarse POS ('VERB', 'NOUN', 'ADJ', ...)
#   tok.tag_         - fine POS ('VBG', 'NN', 'JJ', ...)
#   tok.dep_         - syntactic dep ('nsubj', 'dobj', 'amod', ...)
#   tok.is_stop      - "the", "a", "is", ...
#   tok.is_punct     - ".", ",", ...
#   tok.like_num     - numeric token
#   tok.ent_type_    - named-entity type if part of one ('PERSON', 'GPE', ...)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but for thousands of docs; disable unused components
#             for speed; batch via nlp.pipe; preserve sentences.
import spacy

# disable= skips pipeline components we don't need.
# en_core_web_sm includes: tok2vec, tagger, parser, attribute_ruler, lemmatizer, ner.
# For lemmas, we need tagger + lemmatizer; can drop parser + ner.
nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])

def content_lemmas_batch(texts: list[str], *, batch_size: int = 64) -> list[list[str]]:
    """Process N texts in batches; ~5-10x faster than one-at-a-time."""
    results = []
    for doc in nlp.pipe(texts, batch_size=batch_size):
        lemmas = [tok.lemma_.lower() for tok in doc
                  if not tok.is_stop and not tok.is_punct and not tok.is_space]
        results.append(lemmas)
    return results

# Per-sentence iteration (for sentence-level tasks).
def sentences_with_lemmas(text: str) -> list[tuple[str, list[str]]]:
    nlp_with_parser = spacy.load("en_core_web_sm", disable=["ner"])
    doc = nlp_with_parser(text)
    return [(sent.text, [t.lemma_.lower() for t in sent if not t.is_stop and not t.is_punct])
            for sent in doc.sents]
# Sentence segmentation needs the parser (or senter component).

# Speed comparison (10k short docs on a laptop):
#   nlp(text) in a loop:                ~25s
#   nlp.pipe(texts, batch_size=64):     ~3s        (~8x speedup)
#   nlp.pipe with disable=[...]:        ~1.5s      (~16x speedup)
#   spacy_with_gpu (transformer):       ~5s        (best accuracy)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: model selection by use case, multilingual
#             handling, n_process for CPU parallelism.
import spacy
import multiprocessing

# === Model selection ===
# Use case                        Model                    Notes
# ----------------------------------------------------------------
# Tokenize / POS / lemma           en_core_web_sm           smallest; ~12MB
# Word vectors / similarity        en_core_web_md           ~40MB; 300d vecs
# Best non-transformer accuracy    en_core_web_lg           ~560MB
# State-of-the-art accuracy        en_core_web_trf          ~440MB; needs PyTorch
# Multilingual                     xx_ent_wiki_sm           80+ langs, NER only
# Other languages                  fr_core_news_sm, etc.

# === Production: lazy-load + cached singleton ===
_nlp_cache: dict[str, spacy.Language] = {}

def get_nlp(model: str = "en_core_web_sm",
            disable: tuple[str, ...] = ("parser", "ner")) -> spacy.Language:
    key = f"{model}|{','.join(disable)}"
    if key not in _nlp_cache:
        _nlp_cache[key] = spacy.load(model, disable=list(disable))
    return _nlp_cache[key]

# === Multi-process for CPU-bound bulk processing ===
def lemmatize_corpus(texts: list[str]) -> list[list[str]]:
    nlp = get_nlp("en_core_web_sm", disable=("parser", "ner"))
    results = []
    # n_process > 1 forks worker processes; each gets a copy of the model.
    n = max(1, multiprocessing.cpu_count() - 1)
    for doc in nlp.pipe(texts, batch_size=64, n_process=n):
        results.append([t.lemma_.lower() for t in doc
                        if not t.is_stop and not t.is_punct and not t.is_space])
    return results

# === GPU acceleration for transformer models ===
# pip install spacy[transformers]
# spacy.require_gpu() OR spacy.prefer_gpu()
# Then load en_core_web_trf — auto-uses CUDA.

# Decision rule:
#   tokenize + POS + lemma                -> en_core_web_sm; disable parser + ner
#   need dependency parse                  -> include parser; ~2x slower
#   word similarity / vectors             -> en_core_web_md (300d) or _lg
#   max accuracy                           -> en_core_web_trf with GPU
#   millions of docs                       -> nlp.pipe + n_process
#   small batches                          -> nlp.pipe is enough
#   non-English                            -> per-language model OR xx_* multilingual
#   pure tokenization (no NLP)             -> blank model: spacy.blank("en")
#   regex-only cleaning                    -> NOT spaCy; just re module
#   serving in a web request                -> warm the model at startup; NEVER load per-request
#
# Anti-pattern: spacy.load() inside a request handler. Loading
# en_core_web_sm takes ~1s; transformer models take 3-5s. Loading
# per-request makes every request slow AND wastes memory (each
# replica loads its own copy). Load once at startup; share the
# loaded model.
```

## Decision Rule

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

## Anti-Pattern

> [!warning] Anti-pattern
> spacy.load() inside a request handler. Loading
> en_core_web_sm takes ~1s; transformer models take 3-5s. Loading
> per-request makes every request slow AND wastes memory (each
> replica loads its own copy). Load once at startup; share the
> loaded model.

## Tips

- Pick the smallest model that does the job. `en_core_web_sm` is the right default; reach for `_md` (vectors) or `_trf` (best accuracy) only when you need them.
- `disable=["parser", "ner"]` cuts processing time ~2-3× when you don't need those components. The biggest win after batching.
- `nlp.pipe(texts, batch_size=64)` is 5-10× faster than calling `nlp(text)` in a loop. Always batch.
- `n_process=N` spawns N worker processes for `nlp.pipe`. Useful for CPU-bound bulk processing on multi-core machines; not faster on small batches.
- For transformer models (`_trf`), call `spacy.require_gpu()` BEFORE `spacy.load()`. Without GPU, transformer models are 10× slower than `_lg`.
- Load the model ONCE at process startup. Never inside a request handler — model load is 1-5 seconds.

## Common Mistake

> [!warning] Calling `spacy.load()` inside a request handler. Each load takes 1-5 seconds; users see request latency tied to model size. Load once at startup, share the cached model across requests.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-request load — every request waits ~1-5s
def handle(text):
    nlp = spacy.load("en_core_web_sm")
    return [t.lemma_ for t in nlp(text)]
```

**Senior:**
```python
# Module-level load — paid once at startup
nlp = spacy.load("en_core_web_sm")
def handle(text):
    return [t.lemma_ for t in nlp(text)]
```

## See Also

- [[Sections/nlp-classical/spacy/spacy-ner|spaCy NER — named entities, rule-based, custom training (Classical NLP)]]
- [[Sections/nlp-classical/spacy/spacy-matcher-patterns|spaCy Matcher — token + dependency pattern matching (Classical NLP)]]
- [[Sections/nlp-classical/spacy/_Index|Classical NLP → spaCy — pipelines, NER, Matcher]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
