---
type: "entry"
domain: "python"
file: "deeplearning"
section: "nlp-sequences"
id: "attention-mechanism"
title: "Attention Mechanism"
category: "Attention"
subtitle: "Query-key-value attention basics"
signature_short: "Scaled dot-product attention"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Attention Mechanism"
  - "attention-mechanism"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/nlp-sequences"
  - "category/attention"
  - "tier/tiered"
---

# Attention Mechanism

> Query-key-value attention basics

## Overview

Attention computes weighted sum of values based on similarity between queries and keys. Scaled dot-product: Attention(Q,K,V) = softmax(QK^T/√d)V. Enables focus on relevant sequence parts.

## Signature

```python
Scaled dot-product attention
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Hand-rolled scaled dot-product attention on Q, K, V tensors
# STRENGTHS - The whole formula in five lines: scores -> softmax -> weighted sum
# WEAKNESSES- Single-head, no projection layers, no mask
#
import torch
import torch.nn.functional as F

Q = torch.randn(2, 4, 8)        # (B, T_q, D)
K = torch.randn(2, 6, 8)        # (B, T_k, D)
V = torch.randn(2, 6, 8)        # (B, T_k, D)
d = Q.size(-1)

scores = Q @ K.transpose(-2, -1) / (d ** 0.5)   # (B, T_q, T_k)
weights = F.softmax(scores, dim=-1)
out     = weights @ V                            # (B, T_q, D)
print(out.shape, weights.sum(-1)[0, 0])          # rows of weights sum to 1
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Use nn.MultiheadAttention; wire up self-attention and cross-attention
# STRENGTHS - The two patterns you'll actually use: self-attn + cross-attn
# WEAKNESSES- No causal mask, no key_padding_mask discussion
#
import torch
import torch.nn as nn

mha = nn.MultiheadAttention(embed_dim=128, num_heads=8, batch_first=True)

# Self-attention: each token attends to every other token in the same sequence
x = torch.randn(32, 50, 128)
self_out, self_w = mha(x, x, x)              # Q=K=V=x
print(self_out.shape)                         # (32, 50, 128)

# Cross-attention (decoder attends to encoder): Q from decoder, K/V from encoder
dec = torch.randn(32, 10, 128)
enc = torch.randn(32, 50, 128)
cross_out, _ = mha(dec, enc, enc)            # Q=dec, K=V=enc
print(cross_out.shape)                        # (32, 10, 128)

# num_heads must divide embed_dim. 128 / 8 = 16-d per head — standard.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Causal masks, key padding masks, and the modern fused kernel
# STRENGTHS - The two masks production code actually needs, plus the speed lever
# WEAKNESSES- N/A
#
import torch
import torch.nn as nn
import torch.nn.functional as F

# 1) F.scaled_dot_product_attention (PyTorch 2.x) — fused, supports FlashAttention
def attend(q, k, v, is_causal=False, key_pad_mask=None):
    # q,k,v: (B, H, T, D) — already split into heads
    # key_pad_mask: (B, T_k) — True at PAD positions
    if key_pad_mask is not None:
        # Convert to additive mask of shape (B, 1, 1, T_k)
        mask = torch.zeros(*key_pad_mask.shape, dtype=q.dtype, device=q.device)
        mask = mask.masked_fill(key_pad_mask, float("-inf"))
        mask = mask[:, None, None, :]
    else:
        mask = None
    return F.scaled_dot_product_attention(q, k, v, attn_mask=mask, is_causal=is_causal)

# 2) Causal mask for autoregressive decoding (LMs):
#    nn.MultiheadAttention takes attn_mask of shape (T, T) with -inf above the diag.
def causal_mask(T, device):
    return torch.triu(torch.full((T, T), float("-inf"), device=device), diagonal=1)

# 3) Key padding mask — never attend to PAD tokens.
#    nn.MultiheadAttention takes key_padding_mask: (B, T_k), True where padded.
mha = nn.MultiheadAttention(embed_dim=128, num_heads=8, batch_first=True)
x = torch.randn(2, 6, 128)
pad_mask = torch.tensor([[False]*5 + [True],     # last token is PAD
                         [False]*4 + [True]*2])  # last two are PAD
out, _ = mha(x, x, x, key_padding_mask=pad_mask)

# Decision rule:
#   training a transformer in PyTorch 2.x   -> F.scaled_dot_product_attention
#   need easy-to-debug attention weights    -> nn.MultiheadAttention with average_attn_weights=False
#   autoregressive LM / decoder             -> causal mask (or is_causal=True)
#   variable-length batches                 -> key_padding_mask, every layer
#   very long context (> 4k tokens)         -> FlashAttention via SDPA backend
#
# Anti-pattern: forgetting the key_padding_mask
#   The model attends to PAD tokens; gradients flow into PAD embeddings; metrics
#   look fine until inputs at inference happen to be all the same length and
#   accuracy collapses. Always pass the pad mask.
```

## Decision Rule

```text
training a transformer in PyTorch 2.x   -> F.scaled_dot_product_attention
need easy-to-debug attention weights    -> nn.MultiheadAttention with average_attn_weights=False
autoregressive LM / decoder             -> causal mask (or is_causal=True)
variable-length batches                 -> key_padding_mask, every layer
very long context (> 4k tokens)         -> FlashAttention via SDPA backend
```

## Anti-Pattern

> [!warning] Anti-pattern
> forgetting the key_padding_mask
>   The model attends to PAD tokens; gradients flow into PAD embeddings; metrics
>   look fine until inputs at inference happen to be all the same length and
>   accuracy collapses. Always pass the pad mask.

## Tips

- Scaled dot-product: divide by √d for numerical stability
- Multi-head attention allows attending to different subspaces
- Self-attention: query = key = value for intra-sequence focus
- On PyTorch 2.x prefer `F.scaled_dot_product_attention` (auto-dispatches to FlashAttention for long contexts) over a hand-rolled `softmax(QK^T/√d) @ V`
- Always pass a `key_padding_mask` for batched variable-length inputs — without it the model attends to PAD tokens and accuracy collapses when inference lengths happen to be uniform
- For autoregressive decoders set `is_causal=True` (or pass an upper-triangular causal mask)

## Common Mistake

> [!warning] Forgetting to scale attention scores causes gradient instability.

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
