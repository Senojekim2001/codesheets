---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "save-load-model"
title: "torch.save / torch.load"
category: "Checkpointing"
subtitle: "Persist model state"
signature_short: "torch.save(model.state_dict(), path) | model.load_state_dict(torch.load(path))"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "torch.save / torch.load"
  - "save-load-model"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/checkpointing"
  - "tier/tiered"
---

# torch.save / torch.load

> Persist model state

## Overview

Save model parameters and training state for later use. torch.save() saves state_dict (parameters). torch.load() restores. Essential for resuming training and inference.

## Signature

```python
torch.save(model.state_dict(), path) | model.load_state_dict(torch.load(path))
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Save and reload weights with state_dict
# STRENGTHS - The two-line pattern that handles 90% of cases
# WEAKNESSES- No optimizer state, no resume, no version safety
#
import torch
import torch.nn as nn

model = nn.Linear(10, 5)

# Save just the parameters (state_dict)
torch.save(model.state_dict(), "model.pth")

# Load into a fresh model with the SAME architecture
model_new = nn.Linear(10, 5)
model_new.load_state_dict(torch.load("model.pth"))
model_new.eval()                 # always eval() after loading for inference
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Full checkpoint dict so training can resume mid-run
# STRENGTHS - Saves epoch, optimizer state, scheduler, loss — survives a crash
# WEAKNESSES- Doesn't cover map_location, weights_only, or strict=False
#
import torch
import torch.nn as nn
import torch.optim as optim

model = nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 5))
optimizer = optim.Adam(model.parameters(), lr=1e-3)
scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10)

# Save: bundle everything you need to resume
checkpoint = {
    "epoch": 42,
    "model_state_dict": model.state_dict(),
    "optimizer_state_dict": optimizer.state_dict(),
    "scheduler_state_dict": scheduler.state_dict(),
    "best_val_loss": 0.123,
}
torch.save(checkpoint, "checkpoint.pth")

# Load: restore each piece
ckpt = torch.load("checkpoint.pth")
model.load_state_dict(ckpt["model_state_dict"])
optimizer.load_state_dict(ckpt["optimizer_state_dict"])
scheduler.load_state_dict(ckpt["scheduler_state_dict"])
start_epoch = ckpt["epoch"] + 1            # next epoch to run
best = ckpt["best_val_loss"]
print(f"resumed from epoch {start_epoch}, best val so far {best}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production: device portability, weights_only safety, partial loads
# STRENGTHS - Handles GPU<->CPU, untrusted checkpoints, head swaps, DDP wrapping
# WEAKNESSES- Heavier; reach for once you've shipped a model
#
import torch
import torch.nn as nn

# 1) Device portability: load a GPU checkpoint on CPU (or vice versa)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
ckpt = torch.load("checkpoint.pth", map_location=device)   # NEVER skip this
model.load_state_dict(ckpt["model_state_dict"])
model.to(device)

# 2) Security: untrusted checkpoints — torch.load uses pickle by default.
#    weights_only=True (PyTorch 2.x) blocks arbitrary code execution.
ckpt = torch.load("downloaded.pth", map_location="cpu", weights_only=True)

# 3) Partial loads: swap a classification head, keep the backbone
state = torch.load("pretrained.pth", map_location="cpu")
missing, unexpected = model.load_state_dict(state, strict=False)
print("missing:", missing)        # new layers (e.g. fresh head)
print("unexpected:", unexpected)  # old layers you removed

# 4) DDP / DataParallel: keys are prefixed with "module." — strip on save
def clean_state_dict(sd):
    return {k.removeprefix("module."): v for k, v in sd.items()}
torch.save(clean_state_dict(model.state_dict()), "clean.pth")

# 5) Atomic save — never corrupt a checkpoint mid-write
import os, tempfile
def atomic_save(obj, path):
    d = os.path.dirname(path) or "."
    fd, tmp = tempfile.mkstemp(dir=d, suffix=".tmp")
    os.close(fd)
    torch.save(obj, tmp)
    os.replace(tmp, path)         # atomic rename on POSIX

# Decision rule:
#   inference / sharing weights         -> save state_dict only
#   resuming training                   -> bundle model + optimizer + scheduler + epoch
#   loading on different device         -> map_location is mandatory
#   third-party / downloaded weights    -> weights_only=True
#   fine-tuning with new head           -> load_state_dict(state, strict=False)
#
# Anti-pattern: torch.save(model, "model.pth")
#   Pickles the whole class — breaks when the source file moves, the class renames,
#   or you upgrade PyTorch. Save state_dict and reconstruct the model in code.
```

## Decision Rule

```text
inference / sharing weights         -> save state_dict only
resuming training                   -> bundle model + optimizer + scheduler + epoch
loading on different device         -> map_location is mandatory
third-party / downloaded weights    -> weights_only=True
fine-tuning with new head           -> load_state_dict(state, strict=False)
```

## Anti-Pattern

> [!warning] Anti-pattern
> torch.save(model, "model.pth")
>   Pickles the whole class — breaks when the source file moves, the class renames,
>   or you upgrade PyTorch. Save state_dict and reconstruct the model in code.

## Tips

- Save state_dict (parameters), not entire model for compatibility
- Include optimizer state and epoch in checkpoint for training resume
- Always verify architecture matches before loading state_dict
- When loading a third-party / downloaded checkpoint pass `weights_only=True` — it refuses pickled code execution and removes a deserialization RCE vector
- Loading on a different device requires `map_location=`; for fine-tuning a new head use `load_state_dict(state, strict=False)` to ignore missing keys

## Common Mistake

> [!warning] Saving entire model instead of state_dict causes compatibility issues across versions.

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
