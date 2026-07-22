---
type: "entry"
domain: "python"
file: "deeplearning"
section: "training-loop"
id: "training-loop-pattern"
title: "Training Loop Pattern"
category: "Training"
subtitle: "Complete training loop example"
signature_short: "for epoch in range(num_epochs):
    for batch in train_loader:"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Training Loop Pattern"
  - "training-loop-pattern"
tags:
  - "python"
  - "python/deeplearning"
  - "python/deeplearning/training-loop"
  - "category/training"
  - "tier/tiered"
---

# Training Loop Pattern

> Complete training loop example

## Overview

Standard training loop: iterate epochs, batches, forward pass, compute loss, backward, optimize. Includes validation loop for monitoring. Essential pattern for all PyTorch training.

## Signature

```python
for epoch in range(num_epochs):
    for batch in train_loader:
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The minimal forward / loss / backward / step cycle
# STRENGTHS - Shows the four-line core every PyTorch loop reduces to
# WEAKNESSES- No validation, no metrics, no scheduler, no eval mode
#
import torch
import torch.nn as nn
import torch.optim as optim

model = nn.Linear(10, 2)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

x = torch.randn(32, 10)
y = torch.randint(0, 2, (32,))

for epoch in range(3):
    optimizer.zero_grad()       # 1. clear old gradients
    logits = model(x)           # 2. forward
    loss = criterion(logits, y) # 3. loss
    loss.backward()             # 4. backward (autograd fills .grad)
    optimizer.step()            # 5. apply update
    print(f"epoch {epoch}: loss={loss.item():.4f}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Full epoch loop with train/val split, accuracy, and eval mode
# STRENGTHS - The 80%-case loop you'll actually copy into projects
# WEAKNESSES- No scheduler, no AMP, no gradient clipping, no checkpointing
#
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

model = nn.Sequential(
    nn.Linear(20, 64), nn.ReLU(),
    nn.Linear(64, 10),
)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=1e-3)

X_train, y_train = torch.randn(500, 20), torch.randint(0, 10, (500,))
X_val,   y_val   = torch.randn(100, 20), torch.randint(0, 10, (100,))
train_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)
val_loader   = DataLoader(TensorDataset(X_val,   y_val),   batch_size=32, shuffle=False)

for epoch in range(5):
    model.train()                       # dropout / batchnorm in train mode
    train_loss = 0.0
    for xb, yb in train_loader:
        optimizer.zero_grad()
        loss = criterion(model(xb), yb)
        loss.backward()
        optimizer.step()
        train_loss += loss.item()
    train_loss /= len(train_loader)

    model.eval()                        # disable dropout, frozen BN stats
    val_loss, correct = 0.0, 0
    with torch.no_grad():               # save memory + speed up
        for xb, yb in val_loader:
            logits = model(xb)
            val_loss += criterion(logits, yb).item()
            correct += (logits.argmax(1) == yb).sum().item()
    val_loss /= len(val_loader)
    acc = correct / len(y_val)
    print(f"epoch {epoch+1}: train={train_loss:.4f} val={val_loss:.4f} acc={acc:.4f}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production loop: device, AMP, grad clip, scheduler, early stop, checkpoint
# STRENGTHS - The hardening every serious training run needs
# WEAKNESSES- Heavier; reach for this once intro/junior shape is internalized
#
import torch, copy
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = build_model().to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
scaler = GradScaler(enabled=device.type == "cuda")

best_val, patience, bad = float("inf"), 5, 0
best_state = None

for epoch in range(epochs):
    model.train()
    for xb, yb in train_loader:
        xb, yb = xb.to(device, non_blocking=True), yb.to(device, non_blocking=True)
        optimizer.zero_grad(set_to_none=True)            # faster than zero_()
        with autocast(enabled=device.type == "cuda"):    # mixed precision
            loss = criterion(model(xb), yb)
        scaler.scale(loss).backward()
        scaler.unscale_(optimizer)                       # clip on real grads
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        scaler.step(optimizer)
        scaler.update()
    scheduler.step()                                     # AFTER optimizer.step()

    model.eval()
    val_loss = 0.0
    with torch.no_grad():
        for xb, yb in val_loader:
            xb, yb = xb.to(device), yb.to(device)
            val_loss += criterion(model(xb), yb).item()
    val_loss /= len(val_loader)

    # Early stopping + best-checkpoint tracking
    if val_loss < best_val - 1e-4:
        best_val, bad = val_loss, 0
        best_state = copy.deepcopy(model.state_dict())   # CPU snapshot ideal
    else:
        bad += 1
        if bad >= patience:
            break

model.load_state_dict(best_state)                        # restore best weights

# Decision rule:
#   debugging / tiny model         -> intro 5-line loop is enough
#   normal training run            -> junior loop, plus a scheduler
#   GPU training, real data        -> senior loop (AMP + clip + schedule)
#   distributed / multi-GPU        -> wrap with DistributedDataParallel
#
# Anti-pattern: scheduler.step() inside the batch loop
#   for xb, yb in loader:
#       optimizer.step(); scheduler.step()   # decays LR per batch, not epoch
#   Step it once per epoch unless you're using OneCycleLR (which is per-batch).
```

## Decision Rule

```text
debugging / tiny model         -> intro 5-line loop is enough
normal training run            -> junior loop, plus a scheduler
GPU training, real data        -> senior loop (AMP + clip + schedule)
distributed / multi-GPU        -> wrap with DistributedDataParallel
```

## Anti-Pattern

> [!warning] Anti-pattern
> scheduler.step() inside the batch loop
>   for xb, yb in loader:
>       optimizer.step(); scheduler.step()   # decays LR per batch, not epoch
>   Step it once per epoch unless you're using OneCycleLR (which is per-batch).

## Tips

- model.train() enables dropout/batch norm; model.eval() disables
- Always use torch.no_grad() in validation to save memory
- Step scheduler after backward() in training loop

## Common Mistake

> [!warning] Forgetting model.eval() in validation causes wrong metrics (dropout affects output).

## Shorthand (Junior → Senior)

**Junior:**
```python
result = {}
for k, v in pairs:
    result[k] = v
```

**Senior:**
```python
result = {k: v for k, v in pairs}
```

## See Also

- [[Sections/deeplearning/training-loop/_Index|Deep Learning → Training Loop]]
- [[Sections/deeplearning/_Index|Deep Learning index]]
- [[_Index|Vault index]]
