---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "embedding-layer"
title: "nn.Embedding"
category: "Word Embeddings"
subtitle: "Map token IDs to dense vectors"
signature_short: "nn.Embedding(num_embeddings, embedding_dim)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.Embedding"
  - "embedding-layer"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/word-embeddings"
  - "tier/tiered"
---

# nn.Embedding

> Map token IDs to dense vectors

## Overview

Learnable lookup table: maps integer token IDs to dense vectors. Input: token IDs [0, vocab_size), output: embedding vectors. First layer in NLP models. Automatically learns word representations.

## Signature

```python
nn.Embedding(num_embeddings, embedding_dim)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Build an Embedding, look up some IDs
# STRENGTHS - Smallest demonstration of "ints in, vectors out"
# WEAKNESSES- No padding, no model context, no initialization choice
#
import torch
import torch.nn as nn

embedding = nn.Embedding(num_embeddings=1000, embedding_dim=64)

token_ids = torch.tensor([[1, 5, 3],
                          [2, 7, 9]])     # (B=2, T=3)
vecs = embedding(token_ids)               # (B=2, T=3, D=64)
print(vecs.shape)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Embedding + LSTM classifier with proper padding handling
# STRENGTHS - Shows padding_idx and how Embedding fits into a sequence model
# WEAKNESSES- No pretrained vectors, no freezing strategy
#
import torch
import torch.nn as nn

PAD_ID = 0

class TextClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=128, hidden=128, n_classes=5):
        super().__init__()
        # padding_idx makes Embedding return zeros AND zero its grad for that row
        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=PAD_ID)
        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)
        self.head  = nn.Linear(hidden, n_classes)

    def forward(self, ids):                     # ids: (B, T)
        x = self.embed(ids)                     # (B, T, D)
        _, (h_n, _) = self.lstm(x)              # h_n: (1, B, H)
        return self.head(h_n[-1])               # (B, n_classes)

model = TextClassifier(vocab_size=10_000)
ids = torch.randint(0, 10_000, (32, 50))
print(model(ids).shape)                         # torch.Size([32, 5])

# IDs OUTSIDE [0, num_embeddings) silently corrupt training (or crash on GPU).
# Always validate ids.max() < vocab_size when integrating a new tokenizer.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pretrained vectors, freezing, weight tying, init strategy
# STRENGTHS - The patterns that move accuracy in real NLP systems
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn

VOCAB, DIM = 30_000, 300
PAD_ID = 0

# 1) Pretrained vectors (GloVe / fastText) — load into Embedding.from_pretrained
def load_pretrained_emb(matrix: torch.Tensor, freeze: bool = True):
    # matrix: (VOCAB, DIM) float — row 0 should be zeros for padding
    return nn.Embedding.from_pretrained(matrix, freeze=freeze, padding_idx=PAD_ID)

# 2) Sensible random init (use this when training from scratch)
def make_embedding(vocab=VOCAB, dim=DIM):
    e = nn.Embedding(vocab, dim, padding_idx=PAD_ID)
    nn.init.normal_(e.weight, mean=0.0, std=dim ** -0.5)   # transformer-style scale
    with torch.no_grad():
        e.weight[PAD_ID].zero_()                           # ensure pad row is zero
    return e

# 3) Weight tying — share input embedding with the output projection.
#    Cuts ~30% of params on small LMs; standard since "Tying Word Vectors" (2017).
class TiedLM(nn.Module):
    def __init__(self, vocab=VOCAB, dim=DIM):
        super().__init__()
        self.embed  = make_embedding(vocab, dim)
        self.lm_head = nn.Linear(dim, vocab, bias=False)
        self.lm_head.weight = self.embed.weight             # SAME tensor, not a copy

    def forward(self, ids):
        h = self.embed(ids)
        return self.lm_head(h)

# 4) For sparse SGD on huge vocabs (CPU side): nn.Embedding(..., sparse=True)
#    + torch.optim.SparseAdam — only updates rows that appeared in the batch.

# Decision rule:
#   tiny dataset, generic text         -> Embedding.from_pretrained(GloVe), freeze=True
#   medium dataset, fine-tune          -> from_pretrained with freeze=False
#   training a transformer LM          -> random init + weight tying with lm_head
#   very large vocab on CPU            -> sparse=True + SparseAdam
#   variable-length batches            -> always set padding_idx so PAD doesn't update
#
# Anti-pattern: forgetting padding_idx
#   Without it, the PAD row gets gradients from every padded position and slowly
#   drifts away from zero. Loss looks fine; downstream models see noisy padding.
```

## Decision Rule

```text
tiny dataset, generic text         -> Embedding.from_pretrained(GloVe), freeze=True
medium dataset, fine-tune          -> from_pretrained with freeze=False
training a transformer LM          -> random init + weight tying with lm_head
very large vocab on CPU            -> sparse=True + SparseAdam
variable-length batches            -> always set padding_idx so PAD doesn't update
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting padding_idx
>   Without it, the PAD row gets gradients from every padded position and slowly
>   drifts away from zero. Loss looks fine; downstream models see noisy padding.

## Tips

- Embedding maps integers [0, vocab_size) to dense vectors
- Learnable; weights updated via backprop like any parameter
- Common dims: 100 (small), 300 (standard), 768 (large)
- For variable-length batches always pass `padding_idx=` so the PAD row receives zero gradient — otherwise PAD slowly drifts and pollutes inference
- Very large vocabs on CPU benefit from `sparse=True` + `SparseAdam`; for transformer LMs, weight-tie the embedding with the lm_head to halve parameters

## Common Mistake

> [!warning] Input token IDs must be in range [0, num_embeddings); out of range causes error.

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
