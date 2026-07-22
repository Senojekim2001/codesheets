---
type: "entry"
domain: "python"
file: "deeplearning"
section: "building-networks"
id: "nn-lstm"
title: "nn.LSTM"
category: "Recurrent Layers"
subtitle: "Sequence modeling with memory"
signature_short: "nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "nn.LSTM"
  - "nn-lstm"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/building-networks"
  - "category/recurrent-layers"
  - "tier/tiered"
---

# nn.LSTM

> Sequence modeling with memory

## Overview

Recurrent layer for sequential data. LSTM cells maintain hidden state and cell state, capturing long-range dependencies. Processes sequences of variable length. batch_first=True: (batch, seq_len, features).

## Signature

```python
nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - LSTM with batch_first=True. Input
#             shape (B, T, features). Returns
#             (output, (h_n, c_n)).
# STRENGTHS - the simplest sequence model.
# WEAKNESSES- doesn't yet show variable-length
#             sequences or transformer alternatives.
#
import torch
import torch.nn as nn

lstm = nn.LSTM(input_size=20, hidden_size=64, batch_first=True)
x = torch.randn(32, 50, 20)                  # (B, T, F)
out, (h_n, c_n) = lstm(x)                    # out: (32, 50, 64)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday LSTM surface: stacked
#             layers via num_layers, bidirectional=
#             True for both directions, classifier
#             pattern using h_n[-1] (last layer's
#             final hidden state).
# STRENGTHS - the h_n[-1] vs out[:, -1] distinction
#             is the LSTM-classification gotcha
#             (they differ when num_layers > 1).
# WEAKNESSES- doesn't address packed sequences for
#             variable lengths or "use a transformer
#             instead" — senior tier.
#
import torch
import torch.nn as nn

class Classifier(nn.Module):
    def __init__(self, in_size, hid, n_classes,
                  num_layers=2, bidi=False):
        super().__init__()
        self.lstm = nn.LSTM(
            in_size, hid,
            num_layers=num_layers,
            bidirectional=bidi,
            batch_first=True,
            dropout=0.2 if num_layers > 1 else 0,
        )
        out_size = hid * (2 if bidi else 1)
        self.fc = nn.Linear(out_size, n_classes)

    def forward(self, x):
        out, (h_n, _) = self.lstm(x)
        # h_n shape: (num_layers * num_directions, B, hid)
        last = h_n[-1]                             # last layer, last step
        return self.fc(last)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production LSTM: pack_padded_sequence
#             for variable-length batches (skip
#             padded tokens, faster + correct);
#             clip_grad_norm_ during training (RNNs
#             explode); for sequence tasks > 100
#             tokens, transformers usually beat
#             LSTMs.
# STRENGTHS - packed sequences are the ONLY correct
#             way to handle variable-length input;
#             gradient clipping is non-negotiable
#             for RNN training; the "use
#             transformer" rule prevents wasted
#             effort.
# WEAKNESSES- packed-sequence API is fiddly;
#             clip_grad_norm changes effective
#             learning rate (re-tune lr); transformers
#             need more data to outperform LSTMs.
#
import torch
import torch.nn as nn
from torch.nn.utils.rnn import (
    pad_sequence, pack_padded_sequence, pad_packed_sequence)

# 1. Packed sequences for variable-length batches
def collate_variable(batch):
    seqs, labels = zip(*batch)
    lengths = torch.tensor([len(s) for s in seqs])
    padded  = pad_sequence(seqs, batch_first=True)
    return padded, lengths, torch.stack(labels)

class VarLenLSTM(nn.Module):
    def __init__(self, in_size, hid):
        super().__init__()
        self.lstm = nn.LSTM(in_size, hid, batch_first=True)
    def forward(self, padded, lengths):
        packed = pack_padded_sequence(padded, lengths.cpu(),
                                        batch_first=True,
                                        enforce_sorted=False)
        out_packed, (h_n, _) = self.lstm(packed)
        out, _ = pad_packed_sequence(out_packed, batch_first=True)
        return out, h_n[-1]

# 2. Gradient clipping in training loop
# torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

# Decision rule:
#   short sequences (<50), simple    -> nn.LSTM
#   long sequences (>100)             -> Transformer (better long-range)
#   variable-length batches           -> pack_padded_sequence
#   training unstable                 -> clip_grad_norm_(max_norm=1.0)
#   bidirectional context needed      -> bidirectional=True
#
# Anti-pattern: padding variable-length sequences and feeding the dense
# tensor straight into nn.LSTM without pack_padded_sequence
#   The LSTM will happily consume the PAD timesteps and propagate their
#   contribution into h_n, so your "last hidden state" classifier is
#   actually conditioned on padding. The loss looks fine; downstream
#   accuracy degrades silently. Use pack_padded_sequence (with
#   enforce_sorted=False) so padded steps are skipped, then
#   pad_packed_sequence on the way out — or, equivalently, take the
#   step at index lengths-1 rather than [-1].
```

## Decision Rule

```text
short sequences (<50), simple    -> nn.LSTM
long sequences (>100)             -> Transformer (better long-range)
variable-length batches           -> pack_padded_sequence
training unstable                 -> clip_grad_norm_(max_norm=1.0)
bidirectional context needed      -> bidirectional=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> padding variable-length sequences and feeding the dense
> tensor straight into nn.LSTM without pack_padded_sequence
>   The LSTM will happily consume the PAD timesteps and propagate their
>   contribution into h_n, so your "last hidden state" classifier is
>   actually conditioned on padding. The loss looks fine; downstream
>   accuracy degrades silently. Use pack_padded_sequence (with
>   enforce_sorted=False) so padded steps are skipped, then
>   pad_packed_sequence on the way out — or, equivalently, take the
>   step at index lengths-1 rather than [-1].

## Tips

- batch_first=True matches most data loaders (batch, seq, features)
- Use h_n[-1] for classification (last layer's hidden state)
- For sequence-to-sequence, use all outputs (output tensor)

## Common Mistake

> [!warning] Forgetting batch_first=True causes shape mismatch with data loaders.

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

- [[Sections/deeplearning/nlp-sequences/rnn-patterns|RNN / GRU Patterns (Deep Learning)]]
- [[Sections/deeplearning/building-networks/_Index|Deep Learning → Building Networks]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]
