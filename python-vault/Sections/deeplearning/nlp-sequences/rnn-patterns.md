---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "rnn-patterns"
title: "RNN / GRU Patterns"
category: "Recurrent Layers"
subtitle: "RNN, GRU for sequence processing"
signature_short: "nn.RNN(input_size, hidden_size) | nn.GRU(input_size, hidden_size)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "RNN / GRU Patterns"
  - "rnn-patterns"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/recurrent-layers"
  - "tier/tiered"
---

# RNN / GRU Patterns

> RNN, GRU for sequence processing

## Overview

RNN (vanilla): updates hidden state with gradient vanishing issue. GRU: improved, fewer params than LSTM. Both process sequences step-by-step, maintaining hidden state across timesteps.

## Signature

```python
nn.RNN(input_size, hidden_size) | nn.GRU(input_size, hidden_size)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Single GRU layer, batch_first, look at the two outputs
# STRENGTHS - Smallest valid recurrent forward pass with the canonical shapes
# WEAKNESSES- No bidirectional, no packed sequences, no classifier
#
import torch
import torch.nn as nn

gru = nn.GRU(input_size=100, hidden_size=128, batch_first=True)

x = torch.randn(32, 50, 100)        # (B, T, input_size)
output, h_n = gru(x)
print(output.shape)                 # (32, 50, 128) — every timestep
print(h_n.shape)                    # (1, 32, 128)  — last hidden state
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Bidirectional GRU classifier; show stacked layers and bi output shape
# STRENGTHS - Covers num_layers, bidirectional, and h_n -> classifier wiring
# WEAKNESSES- No packed sequences, no dropout strategy
#
import torch
import torch.nn as nn

class GRUClassifier(nn.Module):
    def __init__(self, vocab=10_000, embed_dim=128, hidden=128, n_classes=5):
        super().__init__()
        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)
        self.gru   = nn.GRU(embed_dim, hidden,
                            num_layers=2, batch_first=True,
                            dropout=0.2, bidirectional=True)
        self.head  = nn.Linear(hidden * 2, n_classes)   # *2 for bidirectional

    def forward(self, ids):                             # ids: (B, T)
        x = self.embed(ids)                             # (B, T, embed_dim)
        _, h_n = self.gru(x)                            # h_n: (num_layers*2, B, H)
        # Concatenate forward + backward final states from the LAST layer
        last_fw, last_bw = h_n[-2], h_n[-1]
        h = torch.cat([last_fw, last_bw], dim=1)        # (B, 2H)
        return self.head(h)                             # (B, n_classes)

model = GRUClassifier()
print(model(torch.randint(0, 10_000, (32, 50))).shape)  # (32, 5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Packed sequences for variable lengths, gradient clipping, modern guidance
# STRENGTHS - Captures the production patterns that make RNNs reliable
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn
from torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence

class GRUTagger(nn.Module):
    """Variable-length sequence tagger using packed sequences."""
    def __init__(self, vocab, embed_dim=128, hidden=128, n_tags=10):
        super().__init__()
        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)
        self.gru   = nn.GRU(embed_dim, hidden, batch_first=True, bidirectional=True)
        self.head  = nn.Linear(hidden * 2, n_tags)

    def forward(self, ids, lengths):                    # lengths: (B,) on CPU
        x = self.embed(ids)
        # Packed sequences skip padding internally — faster + correct backprop
        packed = pack_padded_sequence(x, lengths.cpu(),
                                      batch_first=True, enforce_sorted=False)
        out_packed, _ = self.gru(packed)
        out, _ = pad_packed_sequence(out_packed, batch_first=True)
        return self.head(out)                            # (B, T, n_tags)

# 1) Gradient clipping is mandatory for RNNs — they explode regularly
def train_step(model, optim, batch, criterion):
    optim.zero_grad()
    loss = criterion(model(batch.ids, batch.lengths).transpose(1, 2), batch.tags)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optim.step()
    return loss.item()

# 2) Stateful RNN (e.g. char-level LM): detach hidden across batches so backprop
#    stops at batch boundaries, but the network keeps a "memory" between them.
def step_stateful(rnn, x, h):
    out, h_new = rnn(x, h)
    return out, h_new.detach()                          # crucial: .detach()

# Decision rule:
#   variable-length batches            -> pack_padded_sequence (correct + fast)
#   fixed-length sequences             -> plain forward, batch_first=True
#   sequence classification (one out)  -> use h_n[-1] (or concat fw+bw if bi)
#   sequence tagging (per-token out)   -> use the full output tensor
#   long context (> ~500 tokens)       -> switch to a transformer; RNNs forget
#
# Anti-pattern: feeding padded inputs without packing
#   The RNN runs on the PAD tokens too, contaminating h_n with padding state.
#   Either pack the sequence, or take h at the true length per row.
```

## Decision Rule

```text
variable-length batches            -> pack_padded_sequence (correct + fast)
fixed-length sequences             -> plain forward, batch_first=True
sequence classification (one out)  -> use h_n[-1] (or concat fw+bw if bi)
sequence tagging (per-token out)   -> use the full output tensor
long context (> ~500 tokens)       -> switch to a transformer; RNNs forget
```

## Anti-Pattern

> [!warning] Anti-pattern
> feeding padded inputs without packing
>   The RNN runs on the PAD tokens too, contaminating h_n with padding state.
>   Either pack the sequence, or take h at the true length per row.

## Tips

- GRU has fewer parameters than LSTM; good for smaller datasets
- Bidirectional=True processes left→right and right→left
- Use hidden state for classification, all outputs for sequence tagging
- For variable-length batches always wrap with `pack_padded_sequence` (and `pad_packed_sequence` after) — feeding raw padded inputs lets the RNN run on PAD tokens and contaminates `h_n`
- Beyond ~500 tokens, RNNs forget — switch to a transformer instead of stacking more layers

## Common Mistake

> [!warning] Forgetting batch_first=True causes dimension mismatch with data loaders.

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

- [[Sections/deeplearning/building-networks/nn-lstm|nn.LSTM (Deep Learning)]]
- [[Sections/deeplearning/nlp-sequences/_Index|Deep Learning → NLP & Sequences]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]
