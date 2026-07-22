---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "lstm-patterns"
title: "LSTM Patterns"
category: "NLP & Sequences"
subtitle: "Sequence modeling with cell state"
signature_short: "nn.LSTM(input_size, hidden_size, batch_first=True)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "LSTM Patterns"
  - "lstm-patterns"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/nlp-sequences"
  - "tier/tiered"
---

# LSTM Patterns

> Sequence modeling with cell state

## Overview

LSTM (Long Short-Term Memory): solves vanishing gradient via cell state (memory). Input/forget/output gates control information flow. More parameters than RNN/GRU but captures long-range dependencies.

## Signature

```python
nn.LSTM(input_size, hidden_size, batch_first=True)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Single LSTM forward pass; show the (output, (h_n, c_n)) tuple
# STRENGTHS - Shows the LSTM-specific cell state alongside the hidden state
# WEAKNESSES- No model wrapper, no batching subtleties, no init advice
#
import torch
import torch.nn as nn

lstm = nn.LSTM(input_size=100, hidden_size=128, batch_first=True)

x = torch.randn(32, 50, 100)             # (B, T, input_size)
output, (h_n, c_n) = lstm(x)
print(output.shape)                      # (32, 50, 128) — per-timestep
print(h_n.shape, c_n.shape)              # (1, 32, 128) each — final h and c
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Many-to-one classifier; many-to-many seq2seq decoder
# STRENGTHS - Two recurring patterns: classification head vs per-step output
# WEAKNESSES- No packed sequences, no teacher forcing detail
#
import torch
import torch.nn as nn

# Many-to-one: sequence -> single label (sentiment, intent, ...)
class LSTMClassifier(nn.Module):
    def __init__(self, vocab=10_000, embed_dim=128, hidden=128, n_classes=5):
        super().__init__()
        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)
        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)
        self.head  = nn.Linear(hidden, n_classes)

    def forward(self, ids):                   # (B, T)
        _, (h_n, _) = self.lstm(self.embed(ids))
        return self.head(h_n[-1])             # (B, n_classes)

# Many-to-many: per-step logits (LM, tagging, decoder)
class LSTMDecoder(nn.Module):
    def __init__(self, vocab=10_000, embed_dim=128, hidden=128):
        super().__init__()
        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)
        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)
        self.head  = nn.Linear(hidden, vocab)

    def forward(self, ids, state=None):       # state: (h_0, c_0) or None
        x = self.embed(ids)
        out, state = self.lstm(x, state)
        return self.head(out), state          # (B, T, vocab), state

print(LSTMClassifier()(torch.randint(0, 10_000, (32, 50))).shape)  # (32, 5)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Forget-gate bias init, stateful training, gradient clipping, when to drop LSTM
# STRENGTHS - Captures the rules that make LSTMs trainable on hard sequences
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn

# 1) Initialize forget-gate bias to 1.0 — standard trick from Jozefowicz et al.
#    It encourages the network to remember by default early in training.
def init_lstm_forget_bias(lstm: nn.LSTM, value: float = 1.0):
    for name, p in lstm.named_parameters():
        if "bias" in name:
            n = p.size(0)
            f_start, f_end = n // 4, n // 2          # gate order: i, f, g, o
            p.data[f_start:f_end].fill_(value)

# 2) Stateful training: keep h, c across batches but DETACH them so backprop
#    is bounded to one batch (truncated BPTT).
def stateful_step(model, x, state):
    if state is not None:
        state = (state[0].detach(), state[1].detach())
    out, state = model(x, state)
    return out, state

# 3) Mandatory: clip gradients. Vanilla LSTMs explode under long sequences.
def train_step(model, optim, batch, criterion):
    optim.zero_grad()
    logits, _ = model(batch.ids)
    loss = criterion(logits.transpose(1, 2), batch.targets)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
    optim.step()
    return loss.item()

# Decision rule:
#   short sequences (< 100 tokens)     -> nn.LSTM is fine, fast, well-trodden
#   long context (>~ 500 tokens)       -> Transformer (TransformerEncoderLayer)
#   tiny dataset, sequence classifier  -> GRU (fewer params than LSTM)
#   need cell-state introspection      -> stick with LSTM (GRU has no c_t)
#   variable-length sequences          -> always pack_padded_sequence
#
# Anti-pattern: keeping (h, c) across the whole epoch without .detach()
#   Backprop tries to flow through every previous batch -> graph explodes,
#   memory blows up, training stalls. Detach at the start of each step.
```

## Decision Rule

```text
short sequences (< 100 tokens)     -> nn.LSTM is fine, fast, well-trodden
long context (>~ 500 tokens)       -> Transformer (TransformerEncoderLayer)
tiny dataset, sequence classifier  -> GRU (fewer params than LSTM)
need cell-state introspection      -> stick with LSTM (GRU has no c_t)
variable-length sequences          -> always pack_padded_sequence
```

## Anti-Pattern

> [!warning] Anti-pattern
> keeping (h, c) across the whole epoch without .detach()
>   Backprop tries to flow through every previous batch -> graph explodes,
>   memory blows up, training stalls. Detach at the start of each step.

## Tips

- LSTM cell state persists across sequence; critical for long dependencies
- Use h_n for classification, all outputs for seq2seq
- Stack multiple LSTM layers for deeper models
- When carrying `(h, c)` across batches (truncated BPTT), call `.detach()` at the start of each step — otherwise backprop tries to flow through every previous batch and the graph explodes

## Common Mistake

> [!warning] Not resetting hidden state between sequences causes information leakage.

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
