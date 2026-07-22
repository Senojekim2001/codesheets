---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "patterns"
id: "text-cleaning-pipeline"
title: "Text cleaning — normalization, stop words, lemmatization"
category: "Patterns"
subtitle: "unicodedata.normalize NFKC, lowercase, regex cleanup, spaCy tokenize / lemmatize, stop word lists, when to skip cleaning (with transformers)"
signature_short: "def clean(text): text = unicodedata.normalize(\"NFKC\", text); text = text.lower(); ..."
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Text cleaning — normalization, stop words, lemmatization"
  - "text-cleaning-pipeline"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Text cleaning — normalization, stop words, lemmatization

> unicodedata.normalize NFKC, lowercase, regex cleanup, spaCy tokenize / lemmatize, stop word lists, when to skip cleaning (with transformers)

## Overview

Text cleaning is the unglamorous-but-critical step before feature extraction. Decisions: lowercase or preserve case? remove stop words or keep? lemmatize, stem, or neither? remove punctuation or treat as features? handle Unicode normalization (NFC/NFKC)? remove URLs/emails/numbers or keep? Each choice depends on downstream task. The three examples solve the SAME concrete task — clean a corpus of user reviews for a sentiment classifier — at three depths: minimal regex + lowercase → spaCy lemmatization + stop words → production pipeline with Unicode handling, configurable steps, transformer-vs-classical decision.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Clean a review for sentiment classification.
- **Junior** — SAME — but with proper tokenization, lemmatization, and Unicode normalization.
- **Senior** — SAME — production: configurable pipeline, fit-on-train pattern (some steps need stats), batch processing.

## Signature

```python
def clean(text): text = unicodedata.normalize("NFKC", text); text = text.lower(); ...
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Clean a review for sentiment classification.
import re

def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+", " ", text)               # remove URLs
    text = re.sub(r"[^\w\s]", " ", text)              # punctuation -> space
    text = re.sub(r"\s+", " ", text).strip()           # collapse whitespace
    return text

print(clean_text("Loved it!! See https://example.com 5/5 stars."))
# 'loved it see 5 5 stars'

# What this does + doesn't do:
# + lowercases (hello/Hello/HELLO are the same)
# + removes URLs (irrelevant noise)
# + removes punctuation (depends on task: punctuation matters for some)
# - doesn't tokenize (TfidfVectorizer does its own)
# - doesn't lemmatize ('loving'/'loved'/'love' stay distinct)
# - doesn't handle Unicode quirks (curly quotes, accented chars)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with proper tokenization, lemmatization, and
#             Unicode normalization.
import re
import unicodedata
import spacy

# Lazy-load to avoid heavy startup if not used.
_nlp = None
def get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])
    return _nlp

def clean_for_classifier(text: str, *, drop_stop: bool = True) -> str:
    """Clean for downstream TF-IDF + classifier."""
    # Unicode: NFKC merges look-alike chars (e.g., "ﬁ" -> "fi")
    text = unicodedata.normalize("NFKC", text)
    text = text.lower()
    text = re.sub(r"http\S+|www\.\S+", " ", text)     # URLs
    text = re.sub(r"\S+@\S+", " ", text)              # emails
    text = re.sub(r"\d+", "NUM", text)                  # collapse numbers (or remove)

    nlp = get_nlp()
    doc = nlp(text)
    tokens = [
        tok.lemma_
        for tok in doc
        if not tok.is_punct
        and not tok.is_space
        and not (drop_stop and tok.is_stop)
        and len(tok.lemma_) > 1                         # drop single-char artifacts
    ]
    return " ".join(tokens)

# Custom stop-word adjustments (some "stop words" matter for sentiment).
SENTIMENT_KEEP = {"not", "no", "never", "but", "however"}
get_nlp().Defaults.stop_words -= SENTIMENT_KEEP        # don't drop these

print(clean_for_classifier("Loved it!! NOT a waste of time. See https://x.com"))
# 'love not waste time'
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: configurable pipeline, fit-on-train
#             pattern (some steps need stats), batch processing.
import re, unicodedata
from dataclasses import dataclass, field
from typing import Iterable
import spacy

@dataclass
class TextCleaner:
    lowercase: bool = True
    nfkc: bool = True
    remove_urls: bool = True
    remove_emails: bool = True
    number_handling: str = "collapse"                  # 'collapse' / 'remove' / 'keep'
    drop_stop_words: bool = True
    drop_punct: bool = True
    lemmatize: bool = True
    min_token_length: int = 2
    custom_keep_stop: set[str] = field(default_factory=set)
    spacy_model: str = "en_core_web_sm"

    def __post_init__(self):
        self._nlp = None

    def _ensure_nlp(self):
        if self._nlp is None:
            self._nlp = spacy.load(self.spacy_model, disable=["parser", "ner"])
            for w in self.custom_keep_stop:
                self._nlp.vocab[w].is_stop = False

    def _pre_clean(self, text: str) -> str:
        if self.nfkc: text = unicodedata.normalize("NFKC", text)
        if self.lowercase: text = text.lower()
        if self.remove_urls: text = re.sub(r"http\S+|www\.\S+", " ", text)
        if self.remove_emails: text = re.sub(r"\S+@\S+", " ", text)
        if self.number_handling == "remove": text = re.sub(r"\d+", " ", text)
        elif self.number_handling == "collapse": text = re.sub(r"\d+", "NUM", text)
        return re.sub(r"\s+", " ", text).strip()

    def clean_one(self, text: str) -> str:
        self._ensure_nlp()
        text = self._pre_clean(text)
        if not (self.lemmatize or self.drop_stop_words or self.drop_punct):
            return text                                # skip spaCy if not needed
        doc = self._nlp(text)
        tokens = []
        for tok in doc:
            if self.drop_punct and tok.is_punct: continue
            if tok.is_space: continue
            if self.drop_stop_words and tok.is_stop: continue
            tok_text = tok.lemma_ if self.lemmatize else tok.text
            if len(tok_text) < self.min_token_length: continue
            tokens.append(tok_text)
        return " ".join(tokens)

    def clean_batch(self, texts: Iterable[str], *, batch_size: int = 64) -> list[str]:
        """Faster than clean_one in a loop via nlp.pipe."""
        self._ensure_nlp()
        pre_cleaned = [self._pre_clean(t) for t in texts]
        if not (self.lemmatize or self.drop_stop_words):
            return pre_cleaned
        results = []
        for doc in self._nlp.pipe(pre_cleaned, batch_size=batch_size):
            tokens = []
            for tok in doc:
                if self.drop_punct and tok.is_punct: continue
                if tok.is_space: continue
                if self.drop_stop_words and tok.is_stop: continue
                tok_text = tok.lemma_ if self.lemmatize else tok.text
                if len(tok_text) < self.min_token_length: continue
                tokens.append(tok_text)
            results.append(" ".join(tokens))
        return results

# Use:
cleaner = TextCleaner(custom_keep_stop={"not", "no", "never"})
cleaned = cleaner.clean_batch(reviews)

# === When to SKIP cleaning entirely ===
# Modern transformer models (BERT, RoBERTa, sentence-transformers)
# have their OWN tokenizer. Pre-cleaning often HURTS because:
#  - Lowercase loses case features ("Apple" vs "apple")
#  - Removing punctuation loses sentence structure
#  - Lemmatization conflicts with subword tokenization
#  - Stop-word removal removes context the transformer uses
# For transformer pipelines: do MINIMAL cleaning (NFKC, URL removal
# if irrelevant). Let the model see most of the original text.

# Decision rule:
#   downstream = TF-IDF / BoW             -> aggressive cleaning helps
#   downstream = transformer / embedding   -> minimal cleaning (NFKC + url-strip only)
#   sentiment task                          -> preserve negations ("not", "no", "never")
#   topic modeling                          -> aggressive stop-word removal
#   informal text (tweets)                  -> preserve emojis (or replace with placeholder)
#   multilingual                            -> NFKC normalization is critical
#   case matters (NER, code)                -> don't lowercase
#   numbers carry signal (financial)        -> keep numbers (don't replace with NUM)
#   need reproducibility                    -> dataclass config; pin spaCy version
#   speed matters                           -> use clean_batch with nlp.pipe
#
# Anti-pattern: aggressive cleaning before a transformer. Lowercasing,
# removing punctuation, removing stop words, lemmatizing — then
# feeding into BERT. The transformer's pretraining was on natural
# text; aggressive cleaning makes input out-of-distribution. Apply
# minimal cleaning (NFKC, optional URL strip) and let the model see
# the original.
```

## Decision Rule

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

## Anti-Pattern

> [!warning] Anti-pattern
> aggressive cleaning before a transformer. Lowercasing,
> removing punctuation, removing stop words, lemmatizing — then
> feeding into BERT. The transformer's pretraining was on natural
> text; aggressive cleaning makes input out-of-distribution. Apply
> minimal cleaning (NFKC, optional URL strip) and let the model see
> the original.

## Tips

- For TF-IDF / BoW classifiers, aggressive cleaning (lowercase, lemmatize, drop stop words) usually helps. For transformers, MINIMAL cleaning is right.
- Unicode normalization (`unicodedata.normalize("NFKC", text)`) merges look-alike characters ("ﬁ" → "fi", curly → straight quotes). Run this BEFORE lowercase.
- For sentiment tasks, keep negation words ("not", "no", "never", "but") — they're technically stop words but flip meaning. Customize the stop list.
- Number handling depends on task: replace with `NUM` for sentiment (numbers don't matter), KEEP for financial / scientific (numbers carry signal).
- Use `nlp.pipe(texts, batch_size=64)` for batch cleaning — 5-10× faster than calling spaCy per doc.
- For multilingual corpora, char n-grams + NFKC is often more robust than language-specific tokenization.

## Common Mistake

> [!warning] Aggressive cleaning (lowercase + lemmatize + remove stop words) before feeding into a transformer (BERT, sentence-transformers). The model's pretraining was on natural text; aggressive cleaning makes input out-of-distribution and HURTS performance. For transformers: NFKC + optional URL strip, leave the rest.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Aggressive cleaning before BERT — hurts the model
cleaned = clean_for_classifier(text, drop_stop=True, lemmatize=True)
embedding = bert_model.encode(cleaned)
```

**Senior:**
```python
# Minimal cleaning for transformers
text = unicodedata.normalize("NFKC", raw_text)
text = re.sub(r"http\S+", "", text)
embedding = bert_model.encode(text)   # let the model see most of the original
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/nlp-classical/patterns/_Index|Classical NLP → NLP Patterns — cleaning, ngrams, classical-vs-LLM]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
