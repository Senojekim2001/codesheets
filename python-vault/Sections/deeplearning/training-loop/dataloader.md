---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "dataloader"
title: "DataLoader"
category: "Data Loading"
subtitle: "Batching, shuffling, multi-processing"
signature_short: "DataLoader(dataset, batch_size, shuffle=True, num_workers)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "DataLoader"
  - "dataloader"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/data-loading"
  - "tier/tiered"
---

# DataLoader

> Batching, shuffling, multi-processing

## Overview

DataLoader batches data, handles shuffling, and enables parallel data loading. Wraps a Dataset to provide mini-batches for training. Essential for efficient training on large datasets.

## Signature

```python
DataLoader(dataset, batch_size, shuffle=True, num_workers)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - TensorDataset wraps tensors;
#             DataLoader handles batching, shuffling.
# STRENGTHS - smallest possible data pipeline.
# WEAKNESSES- doesn't yet show custom Dataset,
#             num_workers, or pin_memory.
#
from torch.utils.data import TensorDataset, DataLoader

ds = TensorDataset(X, y)
loader = DataLoader(ds, batch_size=32, shuffle=True)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - the everyday DataLoader surface:
#             custom Dataset (must implement __len__
#             and __getitem__); shuffle=True for
#             train, False for val/test;
#             num_workers for parallel I/O;
#             pin_memory for fast GPU transfer.
# STRENGTHS - the four flags (shuffle / num_workers /
#             pin_memory / drop_last) cover most
#             real-world cases.
# WEAKNESSES- doesn't address samplers, collate_fn
#             for variable-length batches, or
#             persistent_workers — senior tier.
#
import torch
from torch.utils.data import Dataset, DataLoader

class ImageDataset(Dataset):
    def __init__(self, paths, labels, transform=None):
        self.paths, self.labels, self.transform = paths, labels, transform
    def __len__(self):
        return len(self.paths)
    def __getitem__(self, idx):
        img = load_image(self.paths[idx])         # I/O happens per-item
        if self.transform:
            img = self.transform(img)
        return img, self.labels[idx]

train_loader = DataLoader(
    train_ds, batch_size=64,
    shuffle=True,                                # train: yes
    num_workers=4,                               # parallel I/O
    pin_memory=True,                             # async H2D
    drop_last=True,                              # avoid uneven last batch
)
val_loader = DataLoader(
    val_ds, batch_size=128,
    shuffle=False, num_workers=4, pin_memory=True,
)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - production DataLoader: custom
#             collate_fn for variable-length
#             batches; WeightedRandomSampler for
#             imbalanced classes; persistent_
#             workers=True for long training runs;
#             prefetch_factor for I/O-heavy
#             pipelines.
# STRENGTHS - collate_fn is the canonical
#             variable-length batch handler;
#             persistent_workers eliminates worker
#             startup overhead between epochs.
# WEAKNESSES- num_workers > 0 spawns processes
#             — debug with num_workers=0 first;
#             persistent_workers holds memory all
#             epoch.
#
import torch
from torch.utils.data import DataLoader, WeightedRandomSampler
from torch.nn.utils.rnn import pad_sequence

# 1. Variable-length batches via collate_fn
def collate_var_len(batch):
    seqs, labels = zip(*batch)
    lengths = torch.tensor([len(s) for s in seqs])
    padded  = pad_sequence(seqs, batch_first=True)
    return padded, lengths, torch.stack(labels)

# 2. Class-balanced sampling for imbalanced data
class_counts = torch.bincount(torch.tensor(train_ds.labels))
sample_weights = (1.0 / class_counts.float())[train_ds.labels]
sampler = WeightedRandomSampler(
    sample_weights, num_samples=len(sample_weights),
    replacement=True,
)

train_loader = DataLoader(
    train_ds,
    batch_size=64,
    sampler=sampler,                              # MUTUALLY EXCLUSIVE with shuffle
    collate_fn=collate_var_len,
    num_workers=8,
    pin_memory=True,
    persistent_workers=True,                      # keep workers alive between epochs
    prefetch_factor=4,                            # batches buffered per worker
)

# Decision rule:
#   tabular / fixed-shape data         -> TensorDataset + DataLoader
#   I/O per item (images, files)        -> custom Dataset + num_workers
#   variable-length sequences           -> collate_fn with pad_sequence
#   class imbalance                      -> WeightedRandomSampler
#   long training (many epochs)         -> persistent_workers=True
#
# Anti-pattern: loading the entire dataset into a tensor inside
# Dataset.__init__ (e.g. self.images = torch.stack([load(p) for p in
# paths]))
#   This collapses lazy loading: every worker process forks a copy of
#   the full tensor (RAM x num_workers), startup is huge, and
#   pin_memory + non_blocking transfer can no longer overlap with
#   I/O. Keep __init__ light (paths + transforms only), do the actual
#   load in __getitem__, and let num_workers + pin_memory parallelize
#   across the CPU. Pre-stacked tensors belong in TensorDataset for
#   already-numeric data — not images on disk.
```

## Decision Rule

```text
tabular / fixed-shape data         -> TensorDataset + DataLoader
I/O per item (images, files)        -> custom Dataset + num_workers
variable-length sequences           -> collate_fn with pad_sequence
class imbalance                      -> WeightedRandomSampler
long training (many epochs)         -> persistent_workers=True
```

## Anti-Pattern

> [!warning] Anti-pattern
> loading the entire dataset into a tensor inside
> Dataset.__init__ (e.g. self.images = torch.stack([load(p) for p in
> paths]))
>   This collapses lazy loading: every worker process forks a copy of
>   the full tensor (RAM x num_workers), startup is huge, and
>   pin_memory + non_blocking transfer can no longer overlap with
>   I/O. Keep __init__ light (paths + transforms only), do the actual
>   load in __getitem__, and let num_workers + pin_memory parallelize
>   across the CPU. Pre-stacked tensors belong in TensorDataset for
>   already-numeric data — not images on disk.

## Tips

- Always shuffle=True for training, False for validation
- num_workers=0 for debugging, >0 for production
- pin_memory=True speeds up data transfer to GPU
- For long training runs add `persistent_workers=True` so worker processes are not re-spawned every epoch
- Class imbalance: pass a `WeightedRandomSampler` and drop `shuffle=True` (the sampler controls order)
- Variable-length sequences: write a `collate_fn` that calls `pad_sequence` per batch — never pad the entire dataset to the global max length

## Common Mistake

> [!warning] Using shuffle=True on validation/test data randomizes evaluation metrics.

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

- [[Sections/deeplearning/training-loop/_Index|Deep Learning → Training Loop]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]
