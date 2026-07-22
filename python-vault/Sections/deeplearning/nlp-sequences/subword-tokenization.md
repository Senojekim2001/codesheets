---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "subword-tokenization"
title: "Subword Tokenization"
category: "Tokenization"
subtitle: "Handle unknown words via subwords"
signature_short: "tokenizer.encode() | tokenizer.decode()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Subword Tokenization"
  - "subword-tokenization"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/tokenization"
  - "tier/tiered"
---

# Subword Tokenization

> Handle unknown words via subwords

## Overview

Subword tokenization (BPE, WordPiece, SentencePiece) breaks OOV words into known subwords. BERT uses WordPiece; GPT uses BPE; T5/LLaMA use SentencePiece. Enables vocabulary coverage without a massive vocab. Requires a pretrained tokenizer.

## Signature

```python
tokenizer.encode() | tokenizer.decode()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Use a pretrained BERT tokenizer; encode a sentence to IDs
# STRENGTHS - Real, working subword tokenization in three lines
# WEAKNESSES- No batching, no padding, no special-token discussion
#
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("bert-base-uncased")

text = "PyTorch is unbelievable"
ids = tok.encode(text)
print(tok.tokenize(text))   # ['py', '##tor', '##ch', 'is', 'un', '##be', '##lie', '##va', '##ble']
print(ids)                  # [101, ..., 102]  (101=[CLS], 102=[SEP])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Batch encoding with padding + attention masks, ready for a model
# STRENGTHS - The standard call you copy into every HF training script
# WEAKNESSES- Doesn't cover BPE vs WordPiece vs SentencePiece tradeoffs
#
import torch
from transformers import AutoTokenizer

tok = AutoTokenizer.from_pretrained("bert-base-uncased")

texts = [
    "PyTorch is amazing.",
    "Subword tokenizers handle out-of-vocabulary words.",
    "Hi.",
]

batch = tok(
    texts,
    padding=True,                       # pad to longest in batch
    truncation=True,                    # cut anything over max_length
    max_length=128,
    return_tensors="pt",                # return torch tensors
)
print(batch["input_ids"].shape)         # (3, T)
print(batch["attention_mask"].shape)    # (3, T) — 1 for real tokens, 0 for PAD

# Decode roundtrips back to text
print(tok.decode(batch["input_ids"][0], skip_special_tokens=True))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Tokenizer-model coupling, fast vs slow tokenizers, vocab extension
# STRENGTHS  - The rules that prevent silent miscoded inputs in production
# WEAKNESSES - N/A
#
from transformers import AutoTokenizer

# 1) ALWAYS load the tokenizer from the same checkpoint as the model.
#    Different checkpoint = different vocab = silently corrupted IDs.
NAME = "bert-base-uncased"
tok = AutoTokenizer.from_pretrained(NAME, use_fast=True)   # Rust tokenizers, ~10x faster

# 2) Subword algorithm matrix:
#       BPE         (GPT-2, RoBERTa)        merge most-frequent pair, byte-level
#       WordPiece   (BERT, DistilBERT)      merge based on likelihood, "##" prefix
#       SentencePiece/Unigram (T5, mT5, XLM-R)   no pre-tokenization, language-agnostic
#    Pick whatever the pretrained model used; never mix.

# 3) Adding domain-specific tokens (drug names, code keywords, ...).
new_tokens = ["<smiles>", "</smiles>", "[REDACTED]"]
added = tok.add_tokens(new_tokens)               # returns count of NEW tokens
# After this, you must resize the model embedding:
#   model.resize_token_embeddings(len(tok))

# 4) Special-token discipline. tok([...]) adds [CLS]/[SEP]; tok.encode_plus too.
#    For label sequences (token classification), use is_split_into_words=True
#    and align labels with offset_mapping to avoid label-tokenization drift.
out = tok(["I love NYC"], return_offsets_mapping=True, is_split_into_words=False)
print(out["offset_mapping"])                      # char spans per token

# 5) Decoding gotchas: skip_special_tokens=True is usually what you want;
#    leave clean_up_tokenization_spaces at default (True) for model-faithful output.

# Decision rule:
#   pretrained model on standard text         -> AutoTokenizer.from_pretrained(MODEL)
#   training a new tokenizer from scratch     -> tokenizers library, BPE for code, Unigram for multilingual
#   adding domain words                        -> add_tokens + resize_token_embeddings
#   token-level labels (NER, tagging)          -> is_split_into_words + offset_mapping
#   distributed dataloader bottleneck          -> use_fast=True, multiprocessing-safe
#
# Anti-pattern: training your own tokenizer with a model checkpoint you didn't retrain
#   The pretrained embedding rows are indexed by the OLD vocab. Your new IDs point
#   to random embeddings, and the model degrades to garbage. Either retrain the
#   embeddings (resize + warm-up) or keep the original tokenizer.
```

## Decision Rule

```text
pretrained model on standard text         -> AutoTokenizer.from_pretrained(MODEL)
training a new tokenizer from scratch     -> tokenizers library, BPE for code, Unigram for multilingual
adding domain words                        -> add_tokens + resize_token_embeddings
token-level labels (NER, tagging)          -> is_split_into_words + offset_mapping
distributed dataloader bottleneck          -> use_fast=True, multiprocessing-safe
```

## Anti-Pattern

> [!warning] Anti-pattern
> training your own tokenizer with a model checkpoint you didn't retrain
>   The pretrained embedding rows are indexed by the OLD vocab. Your new IDs point
>   to random embeddings, and the model degrades to garbage. Either retrain the
>   embeddings (resize + warm-up) or keep the original tokenizer.

## Tips

- Subword tokenization handles OOV and rare words well
- WordPiece (BERT), BPE (GPT), SentencePiece common algorithms
- Always use matching tokenizer with pretrained model

## Common Mistake

> [!warning] Using custom tokenizer vocab different from pretrained model causes wrong embeddings.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/deeplearning/nlp-sequences/_Index|Deep Learning → NLP & Sequences]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]
