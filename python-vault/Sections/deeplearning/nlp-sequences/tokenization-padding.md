---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "tokenization-padding"
title: "Tokenization & Padding"
category: "Text Preprocessing"
subtitle: "Word/subword tokenization, sequence padding"
signature_short: "torch.nn.utils.rnn.pad_sequence() | torch.nn.utils.rnn.pack_padded_sequence()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Tokenization & Padding"
  - "tokenization-padding"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/text-preprocessing"
  - "tier/tiered"
---

# Tokenization & Padding

> Word/subword tokenization, sequence padding

## Overview

Tokenization: text → token IDs using vocabulary. Padding: extend sequences to uniform length for batching. pack_padded_sequence: efficient handling of variable-length sequences in RNNs.

## Signature

```python
torch.nn.utils.rnn.pad_sequence() | torch.nn.utils.rnn.pack_padded_sequence()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Word-level vocab lookup + pad_sequence to make a rectangular batch
# STRENGTHS - Smallest end-to-end "text -> tensor" path
# WEAKNESSES- No pack_padded_sequence, no length tracking, no special tokens beyond PAD/UNK
#
import torch
from torch.nn.utils.rnn import pad_sequence

vocab = {"<PAD>": 0, "<UNK>": 1, "hello": 2, "world": 3, "pytorch": 4}

def encode(text):
    return torch.tensor([vocab.get(t, vocab["<UNK>"]) for t in text.lower().split()])

batch = [encode("hello world"),
         encode("pytorch is great"),
         encode("hello")]

padded = pad_sequence(batch, batch_first=True, padding_value=vocab["<PAD>"])
print(padded)             # (B, T_max), zeros wherever a row is shorter
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Pad + track lengths + pack for the RNN; build a working classifier
# STRENGTHS - The full padded-batch pipeline: encode -> pad -> pack -> RNN -> head
# WEAKNESSES- Toy vocab; no subword handling
#
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pad_sequence, pack_padded_sequence

PAD_ID = 0

def collate(batch):
    """Collate variable-length token tensors into (ids, lengths)."""
    lengths = torch.tensor([len(x) for x in batch])
    ids     = pad_sequence(batch, batch_first=True, padding_value=PAD_ID)
    return ids, lengths

class TextClassifier(nn.Module):
    def __init__(self, vocab=10_000, dim=128, n_classes=5):
        super().__init__()
        self.embed = nn.Embedding(vocab, dim, padding_idx=PAD_ID)
        self.lstm  = nn.LSTM(dim, 128, batch_first=True)
        self.head  = nn.Linear(128, n_classes)

    def forward(self, ids, lengths):
        x = self.embed(ids)
        # pack so the LSTM ignores PAD positions
        packed = pack_padded_sequence(x, lengths.cpu(),
                                      batch_first=True, enforce_sorted=False)
        _, (h_n, _) = self.lstm(packed)
        return self.head(h_n[-1])

batch = [torch.randint(1, 10_000, (n,)) for n in (5, 12, 7)]
ids, lengths = collate(batch)
print(TextClassifier()(ids, lengths).shape)  # (3, 5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Bucket batching, attention masks, max-length truncation, length leakage
# STRENGTHS - The padding hygiene that prevents subtle accuracy bugs in production
# WEAKNESSES- N/A
#
import torch
from torch.nn.utils.rnn import pad_sequence

PAD_ID  = 0
MAX_LEN = 512                         # truncate long inputs — never let one row dominate

# 1) Truncate THEN pad. Padding to a 5000-token outlier wastes 99% of compute.
def encode_and_truncate(ids):
    return ids[:MAX_LEN]

# 2) Attention mask: 1 for real tokens, 0 for PAD. Transformers consume this directly.
def collate_for_transformer(batch):
    batch = [encode_and_truncate(x) for x in batch]
    ids   = pad_sequence(batch, batch_first=True, padding_value=PAD_ID)
    attn  = (ids != PAD_ID).long()    # (B, T) — pass straight to the model
    return ids, attn

# 3) Bucket sampling: group similar-length sequences to minimize PAD wasted compute.
#    Sort the dataset by length, slice into buckets, shuffle WITHIN each bucket.
def bucket_indices(lengths, bucket_size=64):
    order = sorted(range(len(lengths)), key=lambda i: lengths[i])
    buckets = [order[i:i+bucket_size] for i in range(0, len(order), bucket_size)]
    import random
    for b in buckets: random.shuffle(b)
    random.shuffle(buckets)
    return [i for b in buckets for i in b]

# 4) Length leakage in metrics. If a CrossEntropyLoss includes PAD positions,
#    long sequences contribute more loss than short ones — and the model can
#    "win" by lowering loss on PAD tokens. Always set ignore_index=PAD_ID.
import torch.nn as nn
loss_fn = nn.CrossEntropyLoss(ignore_index=PAD_ID)

# Decision rule:
#   short sequences (<=128 tokens)        -> dynamic padding per batch is fine
#   variable but bounded (<=512)          -> truncate + per-batch pad
#   wildly variable lengths               -> bucket batching, +30-50% throughput
#   transformers                          -> attention mask, no pack_padded
#   RNN/GRU/LSTM                          -> pack_padded_sequence is mandatory
#
# Anti-pattern: padding the entire dataset to global max length once
#   You waste compute every batch. Instead pad per-batch (collate_fn) and
#   bucket if length variance is high.
```

## Decision Rule

```text
short sequences (<=128 tokens)        -> dynamic padding per batch is fine
variable but bounded (<=512)          -> truncate + per-batch pad
wildly variable lengths               -> bucket batching, +30-50% throughput
transformers                          -> attention mask, no pack_padded
RNN/GRU/LSTM                          -> pack_padded_sequence is mandatory
```

## Anti-Pattern

> [!warning] Anti-pattern
> padding the entire dataset to global max length once
>   You waste compute every batch. Instead pad per-batch (collate_fn) and
>   bucket if length variance is high.

## Tips

- padding_idx=0 in Embedding prevents grad updates to padding embeddings
- pack_padded_sequence skips padding; more efficient than processing
- enforce_sorted=False allows unsorted sequences (slower but flexible)

## Common Mistake

> [!warning] Not using pack_padded_sequence causes RNN to process padding tokens.

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
