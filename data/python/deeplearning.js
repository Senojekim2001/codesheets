export const meta = {
  "id": "deeplearning",
  "label": "Deep Learning",
  "icon": "🧠",
  "description": "PyTorch deep learning — tensors, neural networks, training loops, CNNs, NLP."
}

export const sections = [

  // ── Section 1: Tensors & Autograd ─────────────────────────────────────────
  {
    id: "tensors-autograd",
    title: "Tensors & Autograd",
    entries: [
      {
        id: "tensor-creation",
        fn: "torch.tensor",
        desc: "Create a tensor from data.",
        category: "Tensor Creation",
        subtitle: "Initialize tensors from lists",
        signature: "torch.tensor(data, dtype=None, device=None)",
        descLong: "Create a PyTorch tensor from Python lists, arrays, or scalars. The fundamental building block of all PyTorch operations. Automatically infers data type unless specified.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of torch.tensor — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             shape and dtype.\n#             device= placement.\n#\nimport torch\nt = torch.tensor([1.0, 2.0, 3.0])\nt.shape, t.dtype, t.device"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of torch.tensor — common patterns you'll see in production.\n# APPROACH  - Combine torch.tensor with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             torch.float32 (NN default), device=,\n#             specialized constructors (zeros/ones/\n#             randn/arange).\n#             (torch.tensor of ints defaults to int64\n#             which mismatches float32 model weights).\n#             copy or pinned memory — senior tier.\n#\nimport torch\n# Constructors — always pin dtype for NN code\ntorch.tensor([[1, 2], [3, 4]], dtype=torch.float32)\ntorch.zeros(3, 4, dtype=torch.float32)\ntorch.ones((3, 4), dtype=torch.float32)\ntorch.randn(3, 4)                              # standard normal\ntorch.arange(0, 10, dtype=torch.float32)\n# Place on a device\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nx = torch.randn(32, 10, device=device, dtype=torch.float32)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of torch.tensor — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             from numpy via torch.from_numpy, pinned\n#             memory for fast async H2D transfer,\n#             empty tensors for in-place writes,\n#             *_like for shape+dtype matching.\n#             interfacing with pandas/numpy\n#             pipelines; pinned memory + non_blocking\n#             transfer overlaps GPU compute with data\n#             prep; *_like keeps shape contracts\n#             implicit.\n#             one mutates the other; pinned memory\n#             is page-locked (fixed RAM cost).\n#\nimport numpy as np, torch\n# 1. Zero-copy from numpy (memory shared)\narr = np.random.randn(1000, 100).astype(np.float32)\nt = torch.from_numpy(arr)\n# t and arr share memory — mutate one, see the other\n# 2. Pinned host memory + async H2D\nx_pinned = torch.empty(1024, 1024, pin_memory=True)\nx_pinned.copy_(torch.randn(1024, 1024))\nx_gpu = x_pinned.to(\"cuda\", non_blocking=True)        # overlaps with compute\n# 3. *_like — match shape AND dtype AND device\nmask = torch.ones_like(t, dtype=torch.bool)           # same shape, bool dtype\n# 4. Empty for pre-allocated buffers in hot loops\nbuf = torch.empty(batch, 256, device=\"cuda\")\nfor batch_data in loader:\n    buf.copy_(batch_data, non_blocking=True)          # fill in place\n# Decision rule:\n#   from numpy / pandas             -> torch.from_numpy (zero-copy)\n#   GPU staging buffer                -> empty(..., pin_memory=True)\n#   match an existing tensor          -> *_like(reference)\n#   constants                         -> tensor / zeros / ones with dtype=\n#\n# Anti-pattern: torch.tensor([...]) of integer Python lists for NN input\n#   The default dtype becomes int64, then the first matmul against a\n#   float32 weight blows up with \"expected scalar type Float but got\n#   Long\". Always pin dtype=torch.float32 (or use torch.from_numpy of an\n#   already-float32 array) at construction — not after the fact."
                  }
        ],
        tips: [
                  "Use dtype=torch.float32 for neural network computations",
                  "torch.tensor() copies data; use torch.as_tensor() for zero-copy",
                  "Always check shape with .shape and dtype with .dtype"
        ],
        mistake: "Creating tensors without specifying dtype leads to int64 by default, causing type mismatches in networks expecting float32.",
        shorthand: {
          verbose: "import torch\nt1 = torch.tensor([1.0, 2.0, 3.0])\nprint(f\"1D tensor: {t1}\")\nt2 = torch.tensor([[1, 2], [3, 4]], dtype=torch.float32)",
          concise: "print(f\"Shape: {t1.shape}, Device: {t1.device}, Dtype: {t1.dtype}\")",
        },
      },
      {
        id: "tensor-operations",
        fn: "Tensor Operations",
        desc: "Element-wise and matrix operations.",
        category: "Tensor Ops",
        subtitle: "Add, multiply, matmul tensors",
        signature: "tensor1 + tensor2 | tensor1 @ tensor2 | torch.matmul()",
        descLong: "PyTorch supports standard mathematical operations: element-wise operations, matrix multiplication via @ operator, and broadcasting. These form the backbone of neural network computations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Tensor Operations — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Pure-numpy mental model.\n#             broadcasting patterns specific to NN.\n#\nimport torch\na = torch.tensor([[1., 2.], [3., 4.]])\nb = torch.tensor([[5., 6.], [7., 8.]])\na + b\na * b           # element-wise\na @ b           # matrix multiply"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Tensor Operations — common patterns you'll see in production.\n# APPROACH  - Combine Tensor Operations with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             broadcasting (just like numpy), batched\n#             matmul (the leading dims are batches),\n#             in-place ops (suffix _ saves memory but\n#             breaks autograd graph), reductions\n#             with axis= AND keepdim=.\n#             do: batch matmul, broadcast bias, sum\n#             along an axis with keepdim.\n#             ops — senior tier.\n#\nimport torch\n# Batched matmul: leading dims are batch\n# (B, M, K) @ (B, K, N) -> (B, M, N)\nA = torch.randn(32, 4, 3)\nB = torch.randn(32, 3, 5)\nout = A @ B                                # shape (32, 4, 5)\n# Broadcasting (same rules as numpy)\nx = torch.randn(32, 10)                     # (B, features)\nbias = torch.randn(10)                      # (features,)\ny = x + bias                                # broadcasts to (32, 10)\n# In-place — saves memory but breaks autograd if needed downstream\nx.add_(1.0)                                 # x += 1\nx.mul_(0.5)\n# Reductions with keepdim=True for broadcasting back\nmu = x.mean(dim=1, keepdim=True)            # (32, 1)\nx_centered = x - mu                          # broadcasts cleanly"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Tensor Operations — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for arbitrary contractions (attention,\n#             tensor train), fused matmul+bias via\n#             torch.addmm (faster than +), bmm for\n#             explicit batched matmul, contiguity\n#             checks before reshape/view.\n#             attention; addmm fuses one allocation\n#             out; the contiguity check prevents\n#             silent copies.\n#             niche-but-real; contiguity checks add\n#             ceremony.\n#\nimport torch\n# 1. Einsum — arbitrary contractions\n# Q (B, H, T, D) attended to K (B, H, T, D) -> (B, H, T, T)\nB, H, T, D = 8, 12, 64, 64\nQ = torch.randn(B, H, T, D)\nK = torch.randn(B, H, T, D)\nscores = torch.einsum(\"bhtd,bhsd->bhts\", Q, K) / D ** 0.5\n# 2. Fused matmul + bias add\nout = torch.addmm(bias, x, weight.T)       # equivalent to x @ weight.T + bias\n# 3. Batched matmul explicit\nout = torch.bmm(A, B)                       # both (B, M, K) and (B, K, N)\n# 4. Check contiguity before view (avoid silent copies)\ny = x.transpose(0, 1)\nif not y.is_contiguous():\n    y = y.contiguous()                      # explicit copy\ny_flat = y.view(-1)                         # safe to view now\n# Decision rule:\n#   simple matmul                       -> @\n#   batched matmul, leading dim batch    -> @ (broadcasting handles it)\n#   batched matmul, explicit              -> torch.bmm\n#   matmul + bias                         -> torch.addmm (one alloc)\n#   non-trivial tensor contraction         -> torch.einsum\n#\n# Anti-pattern: using in-place ops (x.add_, x.mul_) on tensors that still\n# need to flow gradients\n#   The original tensor is overwritten, so autograd cannot reconstruct\n#   the saved activation and backward() either errors or silently\n#   computes wrong grads. Use the out-of-place form (x = x + y) inside\n#   any forward path that requires_grad; reserve in-place for buffers\n#   and explicit no_grad regions."
                  }
        ],
        tips: [
                  "Use @ for matrix multiplication, * for element-wise",
                  "In-place ops (ending with _) save memory but break computation graph",
                  "Broadcasting automatically expands shapes to match dimensions"
        ],
        mistake: "Confusing * (element-wise) with @ (matrix multiplication) causes incorrect network outputs.",
        shorthand: {
          verbose: "import torch\na = torch.tensor([[1.0, 2.0], [3.0, 4.0]])\nb = torch.tensor([[5.0, 6.0], [7.0, 8.0]])\nadd_result = a + b",
          concise: "print(f\"In-place addition:\\n{a}\")",
        },
      },
      {
        id: "tensor-reshaping",
        fn: "Reshape & View",
        desc: "Change tensor shape without copying.",
        category: "Shape Manipulation",
        subtitle: "reshape(), view(), squeeze(), unsqueeze()",
        signature: "tensor.reshape(shape) | tensor.view(shape) | tensor.squeeze() | tensor.unsqueeze(dim)",
        descLong: "Reshape tensors to different dimensions: view() creates a view (same memory), reshape() may copy, squeeze() removes size-1 dims, unsqueeze() adds size-1 dims. Essential for feeding data to networks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Reshape & View — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             one dim. Same total element count.\n#             squeeze/unsqueeze.\n#\nimport torch\nt = torch.arange(24)\nt.reshape(2, 3, 4).shape                   # (2, 3, 4)\nt.reshape(-1, 4).shape                     # (6, 4)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Reshape & View — common patterns you'll see in production.\n# APPROACH  - Combine Reshape & View with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             (zero-copy if contiguous) vs reshape\n#             (copies if needed); squeeze/unsqueeze\n#             for adding/removing batch dims;\n#             flatten for collapse.\n#             standard \"add a batch dim\" or \"drop a\n#             singleton dim\" idiom.\n#             gotcha — senior tier.\n#\nimport torch\nt = torch.arange(24)\n# view — zero-copy when contiguous\nv = t.view(2, 3, 4)\n# reshape — copies if needed (safer default)\nr = t.reshape(2, 3, 4)\n# Add batch dim (B=1)\nsingle = torch.randn(3, 32, 32)\nbatched = single.unsqueeze(0)              # (1, 3, 32, 32)\n# Remove all size-1 dims OR a specific dim\nout = torch.randn(1, 10, 1)\nout.squeeze().shape                         # (10,)\nout.squeeze(0).shape                        # (10, 1)\n# Flatten everything past dim 1 — common after a CNN\nfeatures = torch.randn(32, 128, 7, 7)\nflat = features.flatten(1)                  # (32, 128*7*7)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Reshape & View — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             contiguous before view (transpose\n#             returns non-contiguous, view fails);\n#             permute for arbitrary axis reorder\n#             (channel-first vs channel-last);\n#             einops for readable rearrangements at\n#             scale.\n#             single most common reshape error;\n#             einops syntax (rearrange) is far more\n#             readable than chained reshape/permute.\n#             contiguous() forces a copy.\n#\nimport torch\n# 1. transpose returns non-contiguous; view fails\ny = torch.randn(2, 3, 4)\ny_t = y.transpose(0, 1)                     # (3, 2, 4) but NOT contiguous\n# y_t.view(-1)                              # RuntimeError\ny_t = y_t.contiguous()\ny_t.view(-1).shape                          # (24,) — works now\n# 2. permute — arbitrary axis reorder\nimg = torch.randn(32, 3, 224, 224)          # (B, C, H, W)\nimg_hwc = img.permute(0, 2, 3, 1)           # (B, H, W, C) for plotting\n# 3. einops — readable rearrangements\n# pip install einops\n# from einops import rearrange, reduce, repeat\n# q = rearrange(x, \"b t (h d) -> b h t d\", h=num_heads)   # split heads\n# y = reduce(x, \"b c h w -> b c\", \"mean\")                  # global pool\n# r = repeat(x, \"b c -> b c h w\", h=H, w=W)                # broadcast\n# Decision rule:\n#   simple shape change                  -> reshape\n#   guaranteed zero-copy                  -> view (after contiguous)\n#   axis reorder                          -> permute (then contiguous if needed)\n#   adding/removing batch dim             -> unsqueeze / squeeze\n#   complex multi-axis rearrangement      -> einops.rearrange\n#\n# Anti-pattern: chaining .view(...) directly after .transpose / .permute\n#   Transpose/permute return a non-contiguous view; .view() then raises\n#   \"view size is not compatible with input tensor's size and stride\".\n#   People \"fix\" it by switching to .reshape(), which silently copies in\n#   the hot path. Insert an explicit .contiguous() so the copy (and its\n#   memory cost) is visible, or use einops.rearrange which handles it."
                  }
        ],
        tips: [
                  "Use -1 in reshape to auto-infer one dimension",
                  "view() is faster when possible but requires contiguous tensors",
                  "squeeze/unsqueeze are batch dimension helpers"
        ],
        mistake: "Using view() on non-contiguous tensors causes errors; use reshape() or contiguous() first.",
        shorthand: {
          verbose: "import torch\nt = torch.arange(24)  # [0, 1, 2, ..., 23]\nprint(f\"Original shape: {t.shape}\")\nreshaped = t.reshape(2, 3, 4)",
          concise: "print(f\"Unsqueezed shape: {unsqueezed.shape}\")",
        },
      },
      {
        id: "autograd-backward",
        fn: "Autograd & backward()",
        desc: "Automatic gradient computation.",
        category: "Gradients",
        subtitle: "Backpropagation through computation graph",
        signature: "tensor.backward() | tensor.grad",
        descLong: "PyTorch autograd automatically computes gradients via backpropagation. Tensors with requires_grad=True track operations for gradient computation. Call backward() to compute gradients, access via .grad attribute.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Autograd & backward() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             backward on a SCALAR; gradients land in\n#             .grad.\n#             or .detach for breaking the graph.\n#\nimport torch\nx = torch.tensor([2.0, 3.0], requires_grad=True)\ny = (x ** 2).sum()                          # scalar\ny.backward()\nx.grad                                      # [4.0, 6.0]"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Autograd & backward() — common patterns you'll see in production.\n# APPROACH  - Combine Autograd & backward() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             gradients accumulate (zero them between\n#             passes); .detach to break the graph;\n#             .item() for a scalar value; only LEAF\n#             tensors (the ones you created) get\n#             .grad by default.\n#             most common autograd bug; .detach is\n#             the standard \"use this value but don't\n#             flow gradients through it\".\n#             grad_outputs= or higher-order derivs\n#             — senior tier.\n#\nimport torch\nx = torch.tensor([2.0, 3.0], requires_grad=True)\n# Multiple backward calls accumulate\n(x ** 2).sum().backward()\n(x ** 2).sum().backward()\nx.grad                                      # [8.0, 12.0] — DOUBLED\nx.grad.zero_()                              # reset before next pass\n# Detach — value used but no gradient flows back\ny = x ** 2\ny_const = y.detach()                        # tensor copy, no graph\nloss = (x * y_const).sum()                  # treats y_const as a constant\n# Get a scalar\nloss.item()                                 # plain Python float"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Autograd & backward() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             a scalar (sum the loss across batch);\n#             use retain_graph=True only when needed\n#             (e.g. multi-task losses sharing the\n#             same graph); higher-order gradients\n#             via create_graph=True; explicit\n#             gradient checkpointing for memory.\n#             prevents the most common backward\n#             error; gradient checkpointing is the\n#             standard memory-saving technique for\n#             deep nets.\n#             checkpointing trades compute for memory\n#             (~33% slower, much less memory).\n#\nimport torch\nimport torch.utils.checkpoint as ckpt\n# 1. backward must be on a scalar — sum reduces a vector\nout = model(x)                               # (B, num_classes)\nloss = criterion(out, y)                     # scalar already\nloss.backward()\n# 2. Multi-task losses sharing the graph\nshared = encoder(x)\nloss_a = head_a(shared).sum()\nloss_b = head_b(shared).sum()\ntotal = loss_a + loss_b                      # combine into one scalar\ntotal.backward()                             # one pass — no retain_graph\n# 3. Memory savings with gradient checkpointing\ndef block(x):\n    return some_expensive_layers(x)\nx = ckpt.checkpoint(block, x, use_reentrant=False)\n# Recomputes activations during backward — saves memory\n# Decision rule:\n#   standard single-loss training       -> loss.backward() (scalar, no flags)\n#   multi-task losses sharing graph     -> sum into one scalar, backward once\n#   need to backward twice on same graph -> retain_graph=True (rare; doubles mem)\n#   higher-order gradients (meta, R1)    -> create_graph=True\n#   memory-bound deep network            -> torch.utils.checkpoint\n#   want a value but no grad flow         -> .detach() (NOT .data)\n#   loop-only sanity readout              -> .item() AFTER backward\n#\n# Anti-pattern: calling .backward() on a non-scalar tensor by passing\n# torch.ones_like(loss) instead of reducing first\n#   loss = (pred - target) ** 2 ; loss.backward(torch.ones_like(loss))\n#   \"works\" but silently sums the per-element gradients with weight 1,\n#   making the effective loss scale depend on batch and feature size.\n#   Always reduce to a scalar (.mean() or .sum()) before backward so\n#   the loss magnitude — and thus the learning rate — is well defined."
                  }
        ],
        tips: [
                  "Only leaf tensors have .grad; intermediate tensors lose gradients by default",
                  "Call .backward() only on scalar losses",
                  "Zero gradients with optimizer.zero_grad() before each training step"
        ],
        mistake: "Calling backward() multiple times accumulates gradients instead of replacing them.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "gradient-zeroing",
        fn: "zero_grad()",
        desc: "Clear accumulated gradients.",
        category: "Training Setup",
        subtitle: "Reset gradients before backprop",
        signature: "optimizer.zero_grad() | tensor.grad.zero_()",
        descLong: "PyTorch accumulates gradients by default. Must zero gradients at start of each training step to avoid accumulation. Essential in training loops before backward() calls.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of zero_grad() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Otherwise gradients accumulate.\n#             gradient accumulation patterns.\n#\noptimizer.zero_grad()\nloss.backward()\noptimizer.step()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of zero_grad() — common patterns you'll see in production.\n# APPROACH  - Combine zero_grad() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             forward -> backward -> step. Use\n#             set_to_none=True (default in 1.7+) for\n#             a small speedup.\n#             common training bug (forgotten\n#             zero_grad).\n#             (which is INTENTIONAL skipping of\n#             zero_grad) — senior tier.\n#\nimport torch\nimport torch.optim as optim\nmodel = torch.nn.Linear(5, 1)\noptimizer = optim.SGD(model.parameters(), lr=0.01)\nfor x, y in dataloader:\n    optimizer.zero_grad(set_to_none=True)        # 0.zero\n    pred = model(x)                              # 1.forward\n    loss = criterion(pred, y)\n    loss.backward()                              # 2.backward\n    optimizer.step()                             # 3.step"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of zero_grad() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             gradient accumulation (skip zero_grad\n#             across N micro-batches to simulate a\n#             larger batch); gradient clipping before\n#             optimizer.step (prevents exploding\n#             gradients in RNNs/transformers); set_to_\n#             none=True saves a kernel launch per\n#             param.\n#             bigger effective batch on small GPUs;\n#             clipping is the standard defense against\n#             unstable training.\n#             by 1/accum_steps; clipping changes the\n#             effective learning rate (tune lr after\n#             enabling).\n#\nimport torch\nimport torch.nn.utils as utils\nACCUM_STEPS = 4\noptimizer.zero_grad(set_to_none=True)\nfor i, (x, y) in enumerate(dataloader):\n    pred = model(x)\n    loss = criterion(pred, y) / ACCUM_STEPS         # scale for accumulation\n    loss.backward()                                  # accumulates\n    if (i + 1) % ACCUM_STEPS == 0:\n        # Clip BEFORE step — prevents exploding gradients\n        utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n        optimizer.step()\n        optimizer.zero_grad(set_to_none=True)        # zero only every N steps\n# Decision rule:\n#   default training                       -> zero_grad every step\n#   GPU memory-constrained, want big batch  -> gradient accumulation\n#   training unstable / RNN / transformer    -> add clip_grad_norm_\n#   never                                    -> forget zero_grad without intent\n#\n# Anti-pattern: clipping gradients AFTER optimizer.step() instead of before\n#   utils.clip_grad_norm_ mutates .grad in place, so calling it after\n#   step() does nothing for the update that just happened — the spike\n#   already moved the weights. Always order: backward() -> clip ->\n#   step() -> zero_grad(). Same trap with gradient accumulation:\n#   clip after the LAST micro-batch backward, before the step."
                  }
        ],
        tips: [
                  "Always zero_grad() at start of loop: zero → forward → backward",
                  "Alternatively: gradient accumulation is intentional for multi-batch updates",
                  "Manual grad zeroing: tensor.grad.zero_() (in-place)",
                  "When training is unstable (RNNs, transformers, large LR) add `torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)` between `backward()` and `optimizer.step()`"
        ],
        mistake: "Forgetting zero_grad() in training loop causes gradients to accumulate, breaking learning.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "gpu-device",
        fn: ".to(device)",
        desc: "Move tensors to device.",
        category: "Device Management",
        subtitle: "CPU to GPU or GPU to CPU",
        signature: "tensor.to(device) | tensor.cuda() | tensor.cpu()",
        descLong: "Move tensors and models to different devices (CPU/GPU) for computation. PyTorch requires all tensors in an operation to be on same device. Use .to() for flexibility or .cuda()/.cpu() for explicit device choice.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of .to(device) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             the same one before forward.\n#             (Apple Silicon), or device-portable\n#             code.\n#\nimport torch\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nmodel = model.to(device)\nx = x.to(device)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of .to(device) — common patterns you'll see in production.\n# APPROACH  - Combine .to(device) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             at top, move model + every batch in\n#             the loop, support MPS for Apple\n#             Silicon, use non_blocking=True with\n#             pinned memory for async H2D.\n#             every machine; non_blocking transfer\n#             overlaps with compute.\n#             precision — senior tier.\n#\nimport torch\n# Device-portable pick (CUDA / MPS / CPU)\ndevice = (\n    \"cuda\" if torch.cuda.is_available()\n    else \"mps\" if torch.backends.mps.is_available()\n    else \"cpu\"\n)\nmodel = model.to(device)\nfor x, y in dataloader:\n    x = x.to(device, non_blocking=True)         # async if pinned\n    y = y.to(device, non_blocking=True)\n    pred = model(x)\n    loss = criterion(pred, y)\n    loss.backward()\n    optimizer.step()\n    optimizer.zero_grad()"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of .to(device) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for mixed precision (2-4x speedup,\n#             half memory); DataLoader pin_memory=\n#             True + non_blocking for async transfer;\n#             torch.cuda.synchronize() ONLY for\n#             timing; multi-GPU via\n#             DistributedDataParallel.\n#             (Ampere+); pin_memory + non_blocking\n#             eliminates H2D bottlenecks; sync rules\n#             prevent silently wrong timings.\n#             specific layers (LayerNorm, certain\n#             losses); DDP requires multi-process\n#             setup.\n#\nimport torch\nfrom torch.cuda.amp import autocast, GradScaler\ndevice = \"cuda\" if torch.cuda.is_available() else \"cpu\"\nmodel = model.to(device)\nscaler = GradScaler()                            # for mixed precision\nfor x, y in dataloader:                          # pin_memory=True in DataLoader\n    x = x.to(device, non_blocking=True)\n    y = y.to(device, non_blocking=True)\n    optimizer.zero_grad(set_to_none=True)\n    with autocast():                             # forward in fp16\n        pred = model(x)\n        loss = criterion(pred, y)\n    scaler.scale(loss).backward()                 # scaled to avoid fp16 underflow\n    scaler.step(optimizer)\n    scaler.update()\n# Timing only — sync to wait for GPU work\n# torch.cuda.synchronize()\n# t0 = time.time()\n# ... gpu work ...\n# torch.cuda.synchronize()\n# elapsed = time.time() - t0\n# Decision rule:\n#   single GPU, modern hardware        -> autocast + GradScaler\n#   small model, CPU is fine            -> skip GPU entirely\n#   multiple GPUs                        -> torch.nn.parallel.DistributedDataParallel\n#   Apple Silicon                        -> device=\"mps\"\n#\n# Anti-pattern: constructing tensors on CPU and then .to(\"cuda\")-ing\n# them every iteration of the training loop\n#   torch.zeros(B, D).to(device) inside the loop allocates host memory,\n#   does a sync H2D copy, and ignores pin_memory entirely. Allocate\n#   GPU-resident buffers once with torch.zeros(..., device=device),\n#   reuse via .copy_(non_blocking=True), and rely on DataLoader\n#   pin_memory + non_blocking for input batches."
                  }
        ],
        tips: [
                  "Always move both model and data to same device before forward pass",
                  "Use device variable for code that works on CPU or GPU",
                  "Moving tensors is non-blocking; use torch.cuda.synchronize() if timing",
                  "On modern GPUs, wrap the forward in `torch.autocast` and scale gradients with `torch.cuda.amp.GradScaler` — mixed-precision typically gives 2-3x throughput at no accuracy cost",
                  "For multi-GPU prefer `torch.nn.parallel.DistributedDataParallel`; on Apple Silicon use `device=\"mps\"`"
        ],
        mistake: "Mixing tensors on CPU and GPU causes \"expected ... to be the same device\" error.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "no-grad-context",
        fn: "torch.no_grad()",
        desc: "Disable gradient tracking.",
        category: "Inference",
        subtitle: "Speed up inference, save memory",
        signature: "with torch.no_grad(): ...",
        descLong: "Context manager that disables autograd during inference or validation. Reduces memory usage and speeds up computation since gradients are not tracked. Use in validation/test loops.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of torch.no_grad() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             skip the autograd graph.\n#             eval/test loops.\n#             inference_mode() or @torch.no_grad\n#             decorator.\n#\nimport torch\nwith torch.no_grad():\n    preds = model(x)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of torch.no_grad() — common patterns you'll see in production.\n# APPROACH  - Combine torch.no_grad() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             switches Dropout/BatchNorm to inference\n#             mode; torch.no_grad() skips graph\n#             building. Both are needed.\n#             non-negotiable for validation.\n#             slightly faster) or context-vs-decorator\n#             — senior tier.\n#\nimport torch\n# Validation loop pattern\nmodel.eval()                                 # Dropout/BN to inference\nwith torch.no_grad():                        # no autograd graph\n    total_loss, n = 0.0, 0\n    for x, y in val_loader:\n        x, y = x.to(device), y.to(device)\n        pred = model(x)\n        total_loss += criterion(pred, y).item() * len(y)\n        n += len(y)\nval_loss = total_loss / n\nmodel.train()                                # back to training mode"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of torch.no_grad() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             torch.inference_mode() over no_grad()\n#             (faster, drops version counter); use\n#             @torch.inference_mode() decorator on\n#             prediction functions; remember\n#             model.eval() and model.train() bracket\n#             every validation pass.\n#             (PyTorch 1.9+); decorator form keeps\n#             prediction functions clean; the eval/\n#             train bracket prevents leaking inference\n#             mode into next training step.\n#             in autograd later (need .clone()); easy\n#             to forget model.train() after a call.\n#\nimport torch\n@torch.inference_mode()                       # decorator — cleaner than with-block\ndef predict(model, x):\n    model.eval()\n    return model(x)\n# Validation pass — explicit bracket\ndef validate(model, loader, criterion, device):\n    model.eval()\n    total = 0.0\n    with torch.inference_mode():              # faster than no_grad\n        for x, y in loader:\n            x, y = x.to(device), y.to(device)\n            pred = model(x)\n            total += criterion(pred, y).item() * len(y)\n    model.train()                              # restore for next epoch\n    return total / len(loader.dataset)\n# Decision rule:\n#   PyTorch 1.9+, simple inference        -> torch.inference_mode()\n#   need to use the output in autograd     -> torch.no_grad() + .clone()\n#   prediction function as an API           -> @torch.inference_mode() decorator\n#   never                                    -> validation without model.eval()\n#\n# Anti-pattern: using torch.no_grad() but forgetting model.eval()\n# (or vice versa)\n#   no_grad only stops graph building; Dropout still drops, BatchNorm\n#   still updates running stats from the validation batch — your val\n#   loss looks noisy and your BN stats drift. Both are mandatory:\n#   model.eval() switches layer modes, no_grad / inference_mode skips\n#   the graph. Restore model.train() before the next training epoch."
                  }
        ],
        tips: [
                  "Always use no_grad() in validation/test loops to save memory",
                  "Also saves computation time since gradient graph not maintained",
                  "Use torch.enable_grad() to force gradients inside no_grad context",
                  "On PyTorch 1.9+, prefer `torch.inference_mode()` over `no_grad()` — it is stricter (returned tensors cannot be used in autograd) and slightly faster; use the `@torch.inference_mode()` decorator for prediction APIs"
        ],
        mistake: "Computing validation loss inside training loop without no_grad() wastes memory and slows training.",
        shorthand: {
          verbose: "import torch\nimport torch.nn as nn\nmodel = nn.Linear(10, 1)\nx = torch.randn(100, 10)",
          concise: "print(f\"With grad: {time_with_grad:.4f}s, Without grad: {time_no_grad:.4f}s\")",
        },
      },
    ],
  },

  // ── Section 2: Building Networks ─────────────────────────────────────────
  {
    id: "building-networks",
    title: "Building Networks",
    entries: [
      {
        id: "nn-module",
        fn: "nn.Module",
        desc: "Base class for all neural networks.",
        category: "Model Definition",
        subtitle: "Extend nn.Module to define custom networks",
        signature: "class MyModel(nn.Module):\n    def __init__(self):\n        super().__init__()\n    def forward(self, x):",
        descLong: "nn.Module is the base class for all PyTorch models. Define layers in __init__ and forward pass logic in forward(). Automatically handles parameter registration and training/eval modes.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Module — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             __init__, define forward(). Call model\n#             via model(x), not model.forward(x).\n#             access, or initialization.\n#\nimport torch.nn as nn\nclass Net(nn.Module):\n    def __init__(self):\n        super().__init__()\n        self.fc1 = nn.Linear(10, 64)\n        self.fc2 = nn.Linear(64, 5)\n    def forward(self, x):\n        return self.fc2(nn.functional.relu(self.fc1(x)))\nmodel = Net()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Module — common patterns you'll see in production.\n# APPROACH  - Combine nn.Module with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             attributes (so PyTorch tracks them),\n#             ModuleList for dynamic depth,\n#             parameter inspection via\n#             named_parameters / state_dict.\n#             like; ModuleList is essential for\n#             configurable depth.\n#             custom forward hooks — senior tier.\n#\nimport torch\nimport torch.nn as nn\nclass MLP(nn.Module):\n    def __init__(self, dims, dropout=0.1):\n        super().__init__()\n        # ModuleList for dynamic depth\n        layers = []\n        for i in range(len(dims) - 2):\n            layers += [nn.Linear(dims[i], dims[i+1]),\n                       nn.ReLU(),\n                       nn.Dropout(dropout)]\n        layers.append(nn.Linear(dims[-2], dims[-1]))\n        self.net = nn.Sequential(*layers)\n    def forward(self, x):\n        return self.net(x)\nmodel = MLP([10, 64, 32, 5])\n# Inspect parameters\nfor name, p in model.named_parameters():\n    print(f\"{name:30s} {tuple(p.shape)}\")\nsum(p.numel() for p in model.parameters() if p.requires_grad)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Module — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             weight initialization (kaiming for\n#             ReLU, xavier for tanh); register\n#             buffers (non-trainable persistent\n#             state) instead of attributes; use\n#             ModuleDict for named branches; type-\n#             hint forward signatures.\n#             across runs; buffers participate in\n#             state_dict but not gradients;\n#             ModuleDict is the cleanest way to\n#             express branching architectures.\n#             defaults; buffers vs parameters\n#             distinction trips people up.\n#\nimport torch\nimport torch.nn as nn\nclass Net(nn.Module):\n    def __init__(self, in_dim: int, n_classes: int):\n        super().__init__()\n        self.encoder = nn.Sequential(\n            nn.Linear(in_dim, 256),\n            nn.ReLU(),\n        )\n        # Multiple heads via ModuleDict\n        self.heads = nn.ModuleDict({\n            \"cls\": nn.Linear(256, n_classes),\n            \"reg\": nn.Linear(256, 1),\n        })\n        # Persistent state, NOT a parameter\n        self.register_buffer(\"running_count\", torch.zeros(1))\n        # Explicit initialization\n        self._init_weights()\n    def _init_weights(self) -> None:\n        for m in self.modules():\n            if isinstance(m, nn.Linear):\n                nn.init.kaiming_normal_(m.weight, nonlinearity=\"relu\")\n                if m.bias is not None:\n                    nn.init.zeros_(m.bias)\n    def forward(self, x: torch.Tensor, task: str = \"cls\") -> torch.Tensor:\n        h = self.encoder(x)\n        self.running_count += x.size(0)        # buffer mutates with batches\n        return self.heads[task](h)\n# Decision rule:\n#   simple stack of layers           -> nn.Sequential\n#   custom forward / branching        -> nn.Module subclass\n#   list of same-shape sublayers      -> nn.ModuleList\n#   named branches / multi-task        -> nn.ModuleDict\n#   non-trainable persistent state     -> register_buffer (not attribute)\n#\n# Anti-pattern: storing sublayers in a plain Python list or dict\n# (self.layers = [nn.Linear(...), ...]) instead of nn.ModuleList /\n# nn.ModuleDict\n#   Plain containers hide the parameters from model.parameters(), so\n#   the optimizer never sees them, .to(device) never moves them, and\n#   state_dict() never serializes them. The model \"trains\" but those\n#   layers are frozen at init. Wrap any sublayer collection in\n#   nn.ModuleList / nn.ModuleDict; same applies to register_buffer\n#   for tensors that must follow .to() but are not parameters."
                  }
        ],
        tips: [
                  "Always call super().__init__() first in __init__",
                  "Define layers as class attributes (self.layer) not local variables",
                  "forward() method defines computation; call model(x) not model.forward(x)",
                  "For non-trainable persistent state (positional encodings, running stats, masks) use `self.register_buffer(name, tensor)` — it follows `.to(device)` and `state_dict()` like a parameter without being trained",
                  "Use `nn.ModuleList` / `nn.ModuleDict` to hold sublayers in a list/dict — plain Python containers hide parameters from the optimizer"
        ],
        mistake: "Defining layers as local variables (x = Linear(10, 5)) prevents parameter registration.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "nn-linear",
        fn: "nn.Linear",
        desc: "Fully connected layer.",
        category: "Layer Types",
        subtitle: "Dense/affine transformation",
        signature: "nn.Linear(in_features, out_features, bias=True)",
        descLong: "Applies linear transformation: y = xW^T + b. in_features is input dimension, out_features is output dimension. Contains learnable weight matrix and bias vector. Fundamental building block of neural networks.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Linear — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             features set the shape.\n#             MLP.\n#             or no-bias use case.\n#\nimport torch\nimport torch.nn as nn\nlinear = nn.Linear(10, 5)\nx = torch.randn(32, 10)\ny = linear(x)                                # (32, 5)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Linear — common patterns you'll see in production.\n# APPROACH  - Combine nn.Linear with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             shape (B, in_features), bias=False\n#             when followed by BatchNorm/LayerNorm,\n#             stack into an MLP via Sequential.\n#             is a real production optimization (the\n#             norm zeros out the constant anyway).\n#             or custom init — senior tier.\n#\nimport torch.nn as nn\n# Stack into an MLP\nmlp = nn.Sequential(\n    nn.Linear(10, 128),\n    nn.ReLU(),\n    nn.Linear(128, 64),\n    nn.ReLU(),\n    nn.Linear(64, 5),\n)\n# bias=False when followed by a norm layer\n# (norm absorbs the constant, bias is redundant)\nblock = nn.Sequential(\n    nn.Linear(64, 64, bias=False),\n    nn.LayerNorm(64),\n    nn.ReLU(),\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Linear — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (out, in) — transposed from the math\n#             expression; init schemes matter (Kaiming\n#             for ReLU, Xavier for tanh, smaller for\n#             output heads); LazyLinear when the\n#             input shape is unknown until forward.\n#             confused matmul transposes; init choice\n#             prevents dead ReLUs / vanishing\n#             gradients; LazyLinear avoids\n#             pre-computing flatten size in a CNN.\n#             until first forward — breaks\n#             state_dict loading patterns.\n#\nimport torch\nimport torch.nn as nn\n# Weight shape is (out_features, in_features) — transposed from y = xW\nlinear = nn.Linear(10, 5)\nlinear.weight.shape                          # (5, 10)\nlinear.bias.shape                            # (5,)\n# Custom initialization\nnn.init.kaiming_normal_(linear.weight, nonlinearity=\"relu\")\nnn.init.zeros_(linear.bias)\n# LazyLinear — input shape inferred at first forward\nclass CNN(nn.Module):\n    def __init__(self, n_classes):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),\n            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),\n        )\n        self.head = nn.Sequential(\n            nn.Flatten(),\n            nn.LazyLinear(128),                  # in_features inferred\n            nn.ReLU(),\n            nn.Linear(128, n_classes),\n        )\n    def forward(self, x):\n        return self.head(self.features(x))\n# Decision rule:\n#   fixed input shape, simple MLP        -> nn.Linear(in, out)\n#   followed by BatchNorm / LayerNorm     -> nn.Linear(in, out, bias=False)\n#   input shape unknown until forward     -> nn.LazyLinear(out)\n#   ReLU/GELU activation on output         -> kaiming_normal_ init\n#   tanh / sigmoid activation              -> xavier_normal_ init\n#   final classifier / regression head     -> small init (e.g. std=0.02)\n#   need quantization later                 -> avoid LazyLinear (no shape)\n#\n# Anti-pattern: feeding a 3D/4D tensor straight into nn.Linear that\n# was sized for the flat feature count (e.g. Linear(C*H*W, ...) on\n# an unflattened CNN output)\n#   nn.Linear broadcasts over leading dims, so it silently runs but\n#   produces (B, C, H, out) with the wrong semantics — only the last\n#   dim is contracted. Always insert nn.Flatten() (or .view(B, -1) /\n#   einops.rearrange) before the head, or use LazyLinear so the\n#   in_features is inferred from the actual flattened size."
                  }
        ],
        tips: [
                  "Input shape: (batch_size, in_features), output: (batch_size, out_features)",
                  "Weight transposed internally; weight.shape is (out_features, in_features)",
                  "Use bias=False for specific architectures or to reduce parameters"
        ],
        mistake: "Confusing Linear(10, 5) input expectation: needs (batch, 10) not (batch, 10, 1).",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "nn-sequential",
        fn: "nn.Sequential",
        desc: "Stack layers sequentially.",
        category: "Model Composition",
        subtitle: "Compose layers in order",
        signature: "nn.Sequential(layer1, layer2, ...)",
        descLong: "Container module that chains layers in sequence. Input of each layer fed to next. Simplifies model definition when layers are purely sequential (no branching/skip connections).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Sequential — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             feeds the next.\n#             custom forward needed.\n#             when to switch to nn.Module.\n#\nimport torch.nn as nn\nmodel = nn.Sequential(\n    nn.Linear(20, 64),\n    nn.ReLU(),\n    nn.Linear(64, 10),\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Sequential — common patterns you'll see in production.\n# APPROACH  - Combine nn.Sequential with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             OrderedDict for named layers, indexed\n#             access (model[0]), nesting via *list.\n#             *list lets you build dynamically-sized\n#             stacks.\n#             connections — those NEED nn.Module\n#             subclass (senior tier).\n#\nimport torch.nn as nn\nfrom collections import OrderedDict\n# Named layers via OrderedDict\nmodel = nn.Sequential(OrderedDict([\n    (\"fc1\",   nn.Linear(20, 128)),\n    (\"relu1\", nn.ReLU()),\n    (\"drop\",  nn.Dropout(0.5)),\n    (\"fc2\",   nn.Linear(128, 10)),\n]))\n# Access by index OR name\nmodel[0]\nmodel.fc1\n# Build dynamically — *list unpacks\nhidden = [64, 32, 16]\nlayers = []\nprev = 100\nfor h in hidden:\n    layers += [nn.Linear(prev, h), nn.ReLU()]\n    prev = h\nlayers.append(nn.Linear(prev, 10))\nmodel = nn.Sequential(*layers)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Sequential — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             STRICTLY linear architectures. The\n#             moment you need a residual / skip /\n#             multi-output, switch to nn.Module\n#             subclass. Sequential models can still\n#             be COMPONENTS within a larger Module.\n#             contortions trying to express ResNet-\n#             style architectures via Sequential.\n#             in Sequential — switching to subclass\n#             is the right answer.\n#\nimport torch\nimport torch.nn as nn\n# Sequential as a SUB-component of a Module subclass\nclass ResBlock(nn.Module):\n    def __init__(self, channels):\n        super().__init__()\n        # Sequential is fine for the inner forward\n        self.body = nn.Sequential(\n            nn.Conv2d(channels, channels, 3, padding=1),\n            nn.BatchNorm2d(channels),\n            nn.ReLU(inplace=True),\n            nn.Conv2d(channels, channels, 3, padding=1),\n            nn.BatchNorm2d(channels),\n        )\n        self.relu = nn.ReLU(inplace=True)\n    def forward(self, x):\n        return self.relu(x + self.body(x))         # SKIP — needs subclass\n# Anti-pattern: trying to do residuals in Sequential\n# nn.Sequential(...) cannot express x + body(x).\n# Decision rule:\n#   strictly linear stack            -> nn.Sequential\n#   skip / residual / multi-output    -> nn.Module subclass\n#   variable depth                     -> nn.Sequential(*list) OR ModuleList\n#   want named-layer access            -> Sequential(OrderedDict([...]))"
                  }
        ],
        tips: [
                  "Sequential works for linear/sequential architectures only",
                  "For complex models with branches, use nn.Module instead",
                  "Can mix indexed and named access in Sequential"
        ],
        mistake: "Using Sequential for models with skip connections or multiple paths fails.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "activation-functions",
        fn: "Activation Functions",
        desc: "Non-linearities: ReLU, Sigmoid, Tanh.",
        category: "Activations",
        subtitle: "ReLU, Sigmoid, Tanh, Softmax",
        signature: "nn.ReLU() | nn.Sigmoid() | nn.Tanh() | F.softmax()",
        descLong: "Activation functions introduce non-linearity, enabling networks to learn complex patterns. ReLU most common in hidden layers, Sigmoid/Tanh for bounded outputs, Softmax for multi-class probabilities.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Activation Functions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             default and almost always right.\n#             (GELU/SiLU) or output-layer choices.\n#\nimport torch.nn as nn\nnn.Sequential(\n    nn.Linear(10, 64),\n    nn.ReLU(),\n    nn.Linear(64, 5),\n)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Activation Functions — common patterns you'll see in production.\n# APPROACH  - Combine Activation Functions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             layers, Sigmoid for binary output,\n#             Tanh for bounded [-1, 1], Softmax for\n#             multiclass — but DON'T explicitly add\n#             Softmax before CrossEntropyLoss (it's\n#             included).\n#             rule is the single most common\n#             beginner bug.\n#             LeakyReLU / inplace= — senior tier.\n#\nimport torch.nn as nn\n# Hidden layers — ReLU (cheap, effective)\nnn.ReLU()\n# Output layers — depends on the task\nnn.Sigmoid()                                 # binary {0, 1}\nnn.Tanh()                                    # bounded [-1, 1]\n# For multiclass: leave logits raw, let CrossEntropyLoss apply log-softmax\n# Classification model — NO explicit Softmax in the model\nclassifier = nn.Sequential(\n    nn.Linear(10, 64), nn.ReLU(),\n    nn.Linear(64, 5),                        # raw logits — DO NOT add Softmax\n)\nloss_fn = nn.CrossEntropyLoss()              # applies log-softmax internally"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Activation Functions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (Swish) for transformers / modern\n#             architectures; LeakyReLU when ReLU\n#             dies; inplace=True for memory savings;\n#             only apply final activation when the\n#             LOSS doesn't already include it.\n#             transformers; inplace=True saves a\n#             buffer; the loss-pairing rule prevents\n#             double-applied softmax.\n#             input is needed elsewhere; LeakyReLU\n#             rarely beats ReLU for image models.\n#\nimport torch.nn as nn\n# Modern hidden activations (transformers / diffusion)\nnn.GELU()                                    # transformer default\nnn.SiLU()                                    # aka Swish; common in Stable Diffusion\n# When ReLU dies (gradient stuck at 0)\nnn.LeakyReLU(0.01)                            # small negative slope\nnn.ELU()                                     # exponential, smooth\n# In-place — saves activation memory\nnn.ReLU(inplace=True)                         # x is overwritten in place\n# Loss-pairing rule (DO NOT double-apply):\n# Model returns LOGITS                  loss\n# - raw logits                           CrossEntropyLoss (multiclass)\n# - raw logits                           BCEWithLogitsLoss (binary, multilabel)\n# - sigmoid output                       BCELoss (only if you really need probs)\n# - log-softmax output                   NLLLoss\n# Decision rule:\n#   hidden default                  -> nn.ReLU\n#   transformer / modern arch        -> nn.GELU or nn.SiLU\n#   ReLU dying                       -> nn.LeakyReLU\n#   binary classifier output         -> raw logits + BCEWithLogitsLoss\n#   multiclass output                 -> raw logits + CrossEntropyLoss\n#   probability needed in production  -> apply sigmoid/softmax AFTER predict\n#\n# Anti-pattern: appending nn.Softmax (or nn.Sigmoid) as the model's\n# final layer and then training with nn.CrossEntropyLoss\n# (or nn.BCELoss)\n#   CE/BCE-with-logits already include log-softmax / log-sigmoid\n#   internally for numerical stability; doing it twice flattens\n#   gradients (log of probabilities saturating near 0/1) and training\n#   either crawls or NaNs. Output RAW LOGITS from the model and let\n#   CrossEntropyLoss / BCEWithLogitsLoss handle the activation; only\n#   apply softmax/sigmoid at predict() time when you need probabilities."
                  }
        ],
        tips: [
                  "ReLU is default for hidden layers; fast and effective",
                  "Softmax always applied to classification logits before loss",
                  "Don't apply Softmax explicitly; CrossEntropyLoss includes it",
                  "Modern transformers / ConvNeXt-style models use `nn.GELU` or `nn.SiLU` over ReLU; if ReLUs are dying (zero gradient), switch to `nn.LeakyReLU`",
                  "Binary classifiers should output raw logits + `BCEWithLogitsLoss` (numerically stable); only apply `sigmoid`/`softmax` after `predict()` if a probability is needed downstream"
        ],
        mistake: "Applying Softmax before CrossEntropyLoss applies it twice, causing wrong gradients.",
        shorthand: {
          verbose: "model = nn.Sequential(\n    nn.Linear(10, 64),\n    nn.ReLU(),\n    nn.Linear(64, 10),\n    nn.Softmax(dim=1)  # Wrong with CrossEntropyLoss\n)",
          concise: "model = nn.Sequential(\n    nn.Linear(10, 64),\n    nn.ReLU(),\n    nn.Linear(64, 10)  # No Softmax\n)\nloss = nn.CrossEntropyLoss()  # Includes Softmax",
        },
      },
      {
        id: "nn-conv2d",
        fn: "nn.Conv2d",
        desc: "2D convolutional layer.",
        category: "Convolutional Layers",
        subtitle: "Image processing with learned filters",
        signature: "nn.Conv2d(in_channels, out_channels, kernel_size, stride, padding)",
        descLong: "Applies 2D convolution with learnable kernels. Detects local patterns (edges, textures) via sliding window. Essential for image processing. Output size: (input - kernel_size + 2*padding) / stride + 1",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Conv2d — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             padding=1 with kernel_size=3 keeps\n#             spatial dims.\n#             groups or output-shape arithmetic.\n#\nimport torch\nimport torch.nn as nn\nconv = nn.Conv2d(3, 16, kernel_size=3, padding=1)\nx = torch.randn(2, 3, 32, 32)                # (B, C, H, W)\ny = conv(x)                                   # (2, 16, 32, 32)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Conv2d — common patterns you'll see in production.\n# APPROACH  - Combine nn.Conv2d with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             for downsampling, padding=\"same\" for\n#             stable spatial dims, AdaptiveAvgPool2d\n#             at the end so any input size flows\n#             into a fixed-size head.\n#             \"fully convolutional + global pool\"\n#             pattern that handles variable input\n#             sizes.\n#             convolutions or ConvTranspose2d —\n#             senior tier.\n#\nimport torch.nn as nn\ncnn = nn.Sequential(\n    nn.Conv2d(3, 32, kernel_size=3, padding=1),\n    nn.ReLU(inplace=True),\n    nn.MaxPool2d(2),                         # halve spatial dims\n    nn.Conv2d(32, 64, kernel_size=3, padding=1),\n    nn.ReLU(inplace=True),\n    nn.MaxPool2d(2),\n    nn.Conv2d(64, 128, kernel_size=3, padding=1),\n    nn.ReLU(inplace=True),\n    nn.AdaptiveAvgPool2d((1, 1)),            # global avg pool\n    nn.Flatten(),\n    nn.Linear(128, 10),\n)\n# Output spatial dim formula:\n# H_out = floor((H_in + 2*padding - kernel) / stride) + 1"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Conv2d — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             separable conv (efficient, MobileNet-\n#             style); grouped convolutions (parallel\n#             branches via groups=); ConvTranspose2d\n#             for upsampling (with checkerboard\n#             artifact warning); always pair conv\n#             with BatchNorm and bias=False.\n#             ~10x; bias=False with BN is a real\n#             memory + speed win; ConvTranspose\n#             checkerboard is a real artifact source\n#             — most modern architectures use\n#             interpolation + conv instead.\n#             standard conv at small scales; groups=\n#             requires divisible channel counts;\n#             upsampling alternatives (PixelShuffle,\n#             interpolation) have their own tradeoffs.\n#\nimport torch.nn as nn\n# 1. Depthwise-separable conv (MobileNet-style)\nclass DSConv(nn.Module):\n    def __init__(self, in_ch, out_ch):\n        super().__init__()\n        self.depthwise = nn.Conv2d(in_ch, in_ch, kernel_size=3,\n                                     padding=1, groups=in_ch,    # one filter per input channel\n                                     bias=False)\n        self.pointwise = nn.Conv2d(in_ch, out_ch, kernel_size=1, bias=False)\n        self.bn = nn.BatchNorm2d(out_ch)\n        self.act = nn.ReLU6(inplace=True)\n    def forward(self, x):\n        return self.act(self.bn(self.pointwise(self.depthwise(x))))\n# 2. Conv + BN block — bias=False because BN absorbs it\ndef conv_bn(in_ch, out_ch):\n    return nn.Sequential(\n        nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),\n        nn.BatchNorm2d(out_ch),\n        nn.ReLU(inplace=True),\n    )\n# 3. Upsampling — PREFER interpolate + conv over ConvTranspose2d\n#    (avoids checkerboard artifacts)\nupsample = nn.Sequential(\n    nn.Upsample(scale_factor=2, mode=\"bilinear\", align_corners=False),\n    nn.Conv2d(in_ch, out_ch, 3, padding=1),\n)\n# Decision rule:\n#   standard conv block               -> Conv2d + BatchNorm + ReLU (bias=False)\n#   parameter-efficient                -> DepthwiseSeparable (groups=in_ch + 1x1)\n#   parallel branches                   -> groups= > 1\n#   upsampling                          -> Upsample(bilinear) + Conv2d\n#\n# Anti-pattern: leaving bias=True (default) on a Conv2d that is\n# immediately followed by BatchNorm2d\n#   BN re-centers the activations with its own learnable beta term, so\n#   the conv bias is mathematically redundant — it just wastes a\n#   parameter per output channel and a small allocation. Set bias=False\n#   on every conv that feeds straight into a norm layer (BN/GN/LN). Only\n#   keep bias=True on convs whose output goes directly into a non-norm\n#   layer (e.g., the final 1x1 prediction head)."
                  }
        ],
        tips: [
                  "padding=1 preserves spatial dimensions for 3x3 kernels",
                  "Stride>1 reduces spatial dimensions (useful for downsampling)",
                  "Weight shape: (out_channels, in_channels, kernel_h, kernel_w)",
                  "When immediately followed by BatchNorm, set `bias=False` — the BN affine term subsumes the conv bias and saves a small allocation",
                  "For parameter-efficient blocks use depthwise-separable convolutions (`groups=in_channels` followed by 1x1 conv) — MobileNet/EfficientNet pattern"
        ],
        mistake: "Forgetting padding for early conv layers shrinks spatial dimensions too quickly.",
        shorthand: {
          verbose: "import torch\nimport torch.nn as nn\nconv = nn.Conv2d(in_channels=3, out_channels=16, kernel_size=3, padding=1)\nx = torch.randn(2, 3, 32, 32)  # 2 images, RGB, 32x32",
          concise: "print(f\"CNN output: {output.shape}\")",
        },
      },
      {
        id: "nn-lstm",
        fn: "nn.LSTM",
        desc: "Long Short-Term Memory layer.",
        category: "Recurrent Layers",
        subtitle: "Sequence modeling with memory",
        signature: "nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)",
        descLong: "Recurrent layer for sequential data. LSTM cells maintain hidden state and cell state, capturing long-range dependencies. Processes sequences of variable length. batch_first=True: (batch, seq_len, features).",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.LSTM — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             shape (B, T, features). Returns\n#             (output, (h_n, c_n)).\n#             sequences or transformer alternatives.\n#\nimport torch\nimport torch.nn as nn\nlstm = nn.LSTM(input_size=20, hidden_size=64, batch_first=True)\nx = torch.randn(32, 50, 20)                  # (B, T, F)\nout, (h_n, c_n) = lstm(x)                    # out: (32, 50, 64)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.LSTM — common patterns you'll see in production.\n# APPROACH  - Combine nn.LSTM with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             layers via num_layers, bidirectional=\n#             True for both directions, classifier\n#             pattern using h_n[-1] (last layer's\n#             final hidden state).\n#             is the LSTM-classification gotcha\n#             (they differ when num_layers > 1).\n#             variable lengths or \"use a transformer\n#             instead\" — senior tier.\n#\nimport torch\nimport torch.nn as nn\nclass Classifier(nn.Module):\n    def __init__(self, in_size, hid, n_classes,\n                  num_layers=2, bidi=False):\n        super().__init__()\n        self.lstm = nn.LSTM(\n            in_size, hid,\n            num_layers=num_layers,\n            bidirectional=bidi,\n            batch_first=True,\n            dropout=0.2 if num_layers > 1 else 0,\n        )\n        out_size = hid * (2 if bidi else 1)\n        self.fc = nn.Linear(out_size, n_classes)\n    def forward(self, x):\n        out, (h_n, _) = self.lstm(x)\n        # h_n shape: (num_layers * num_directions, B, hid)\n        last = h_n[-1]                             # last layer, last step\n        return self.fc(last)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.LSTM — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             for variable-length batches (skip\n#             padded tokens, faster + correct);\n#             clip_grad_norm_ during training (RNNs\n#             explode); for sequence tasks > 100\n#             tokens, transformers usually beat\n#             LSTMs.\n#             way to handle variable-length input;\n#             gradient clipping is non-negotiable\n#             for RNN training; the \"use\n#             transformer\" rule prevents wasted\n#             effort.\n#             clip_grad_norm changes effective\n#             learning rate (re-tune lr); transformers\n#             need more data to outperform LSTMs.\n#\nimport torch\nimport torch.nn as nn\nfrom torch.nn.utils.rnn import (\n    pad_sequence, pack_padded_sequence, pad_packed_sequence)\n# 1. Packed sequences for variable-length batches\ndef collate_variable(batch):\n    seqs, labels = zip(*batch)\n    lengths = torch.tensor([len(s) for s in seqs])\n    padded  = pad_sequence(seqs, batch_first=True)\n    return padded, lengths, torch.stack(labels)\nclass VarLenLSTM(nn.Module):\n    def __init__(self, in_size, hid):\n        super().__init__()\n        self.lstm = nn.LSTM(in_size, hid, batch_first=True)\n    def forward(self, padded, lengths):\n        packed = pack_padded_sequence(padded, lengths.cpu(),\n                                        batch_first=True,\n                                        enforce_sorted=False)\n        out_packed, (h_n, _) = self.lstm(packed)\n        out, _ = pad_packed_sequence(out_packed, batch_first=True)\n        return out, h_n[-1]\n# 2. Gradient clipping in training loop\n# torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n# Decision rule:\n#   short sequences (<50), simple    -> nn.LSTM\n#   long sequences (>100)             -> Transformer (better long-range)\n#   variable-length batches           -> pack_padded_sequence\n#   training unstable                 -> clip_grad_norm_(max_norm=1.0)\n#   bidirectional context needed      -> bidirectional=True\n#\n# Anti-pattern: padding variable-length sequences and feeding the dense\n# tensor straight into nn.LSTM without pack_padded_sequence\n#   The LSTM will happily consume the PAD timesteps and propagate their\n#   contribution into h_n, so your \"last hidden state\" classifier is\n#   actually conditioned on padding. The loss looks fine; downstream\n#   accuracy degrades silently. Use pack_padded_sequence (with\n#   enforce_sorted=False) so padded steps are skipped, then\n#   pad_packed_sequence on the way out — or, equivalently, take the\n#   step at index lengths-1 rather than [-1]."
                  }
        ],
        tips: [
                  "batch_first=True matches most data loaders (batch, seq, features)",
                  "Use h_n[-1] for classification (last layer's hidden state)",
                  "For sequence-to-sequence, use all outputs (output tensor)"
        ],
        mistake: "Forgetting batch_first=True causes shape mismatch with data loaders.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 3: Training Loop ─────────────────────────────────────────
  {
    id: "training-loop",
    title: "Training Loop",
    entries: [
      {
        id: "loss-functions",
        fn: "Loss Functions",
        desc: "CrossEntropyLoss, MSELoss, others.",
        category: "Loss Computation",
        subtitle: "Measure model error",
        signature: "nn.CrossEntropyLoss() | nn.MSELoss() | nn.BCELoss()",
        descLong: "Loss functions quantify prediction error. CrossEntropyLoss for multi-class classification, MSELoss for regression, BCELoss for binary classification. Output of network fed to loss function for training.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Loss Functions — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             multiclass, MSELoss for regression,\n#             BCEWithLogitsLoss for binary.\n#             label smoothing.\n#\nimport torch.nn as nn\nnn.CrossEntropyLoss()                        # multiclass: raw logits\nnn.MSELoss()                                  # regression\nnn.BCEWithLogitsLoss()                        # binary / multilabel"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Loss Functions — common patterns you'll see in production.\n# APPROACH  - Combine Loss Functions with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             CrossEntropy expects RAW LOGITS +\n#             integer class indices (NOT one-hot);\n#             BCEWithLogits takes raw logits + float\n#             targets; class weights for imbalance,\n#             ignore_index for padding.\n#             #1 loss bug (double-applied softmax).\n#             smoothing / multi-task — senior tier.\n#\nimport torch\nimport torch.nn as nn\n# Multiclass — raw logits, integer targets (not one-hot)\nce = nn.CrossEntropyLoss(\n    weight=torch.tensor([1.0, 2.0, 1.0]),    # per-class (imbalance)\n    ignore_index=-100,                        # NLP padding\n)\n# Binary / multilabel — raw logits, float targets\nbce = nn.BCEWithLogitsLoss(\n    pos_weight=torch.tensor([5.0]),          # weight on positive class\n)\n# Regression\nnn.MSELoss()\nnn.L1Loss()                                   # robust to outliers\nnn.SmoothL1Loss()                             # Huber-style"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Loss Functions — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             (CE) for calibration; focal loss for\n#             severe imbalance; combined multi-task\n#             losses with explicit weights;\n#             reduction=\"none\" for per-sample\n#             manipulation.\n#             classifier upgrade; focal is the\n#             default for object detection;\n#             reduction=\"none\" unlocks weighted\n#             losses.\n#             slightly; focal sensitive to gamma;\n#             custom losses need testing.\n#\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n# Label smoothing — standard prod default for classifiers\nce_ls = nn.CrossEntropyLoss(label_smoothing=0.1)\n# Focal loss — severe imbalance / object detection\nclass FocalLoss(nn.Module):\n    def __init__(self, alpha=0.25, gamma=2.0):\n        super().__init__()\n        self.alpha, self.gamma = alpha, gamma\n    def forward(self, logits, targets):\n        ce = F.cross_entropy(logits, targets, reduction=\"none\")\n        p_t = torch.exp(-ce)\n        return (self.alpha * (1 - p_t) ** self.gamma * ce).mean()\n# Multi-task — combine cls + regression with weights\nclass CombinedLoss(nn.Module):\n    def __init__(self, cls_w=1.0, reg_w=0.5):\n        super().__init__()\n        self.cls = nn.CrossEntropyLoss()\n        self.reg = nn.SmoothL1Loss()\n        self.cw, self.rw = cls_w, reg_w\n    def forward(self, cls_l, cls_t, reg_p, reg_t):\n        return self.cw * self.cls(cls_l, cls_t) + self.rw * self.reg(reg_p, reg_t)\n# Decision rule:\n#   multiclass classification           -> CE (label_smoothing=0.1 in prod)\n#   imbalanced multiclass                -> CE(weight=) or Focal\n#   binary / multilabel                   -> BCEWithLogitsLoss(pos_weight=)\n#   regression, normal noise              -> MSELoss\n#   regression, outliers                   -> SmoothL1Loss / L1Loss\n#   sequence with padding                  -> CE(ignore_index=PAD_ID)\n#\n# Anti-pattern: passing one-hot encoded targets to nn.CrossEntropyLoss\n# instead of integer class indices\n#   CE in modern PyTorch accepts class indices of shape (B,) (long\n#   dtype) — feeding (B, C) one-hot floats either errors or silently\n#   computes a soft-label loss with completely different magnitude.\n#   Symptom: loss starts at log(C) but plateaus much higher than\n#   expected. Use targets = torch.argmax(one_hot, dim=-1) once at the\n#   data-loading step, or pass float soft-labels intentionally for\n#   distillation (and document it)."
                  }
        ],
        tips: [
                  "CrossEntropyLoss includes Softmax; don't apply Softmax before",
                  "MSELoss for continuous outputs, CrossEntropyLoss for classification",
                  "BCEWithLogitsLoss combines Sigmoid + BCE for numerical stability",
                  "Production multiclass: pass `label_smoothing=0.1` to CE; for class imbalance use `weight=` or Focal loss",
                  "Sequence models with PAD tokens: `CE(ignore_index=PAD_ID)` so padded positions do not contribute to the loss",
                  "Regression with outliers: `SmoothL1Loss` (Huber) or `L1Loss` is more robust than MSE"
        ],
        mistake: "Applying Softmax before CrossEntropyLoss double-applies it, breaking training.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "optimizers",
        fn: "Optimizers (SGD, Adam)",
        desc: "Update model parameters.",
        category: "Optimization",
        subtitle: "SGD, Adam, AdamW, RMSprop",
        signature: "optim.SGD(params, lr) | optim.Adam(params, lr) | optim.AdamW(params, lr)",
        descLong: "Optimizers update model parameters using gradients. SGD: simple stochastic gradient descent. Adam: adaptive learning rates (momentum + RMSprop). Learning rate controls step size of updates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Optimizers (SGD, Adam) — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             Loop: zero -> forward -> backward ->\n#             step.\n#             decay) or LR schedulers.\n#\nimport torch.optim as optim\nopt = optim.Adam(model.parameters(), lr=1e-3)\nopt.zero_grad()\nloss.backward()\nopt.step()"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Optimizers (SGD, Adam) — common patterns you'll see in production.\n# APPROACH  - Combine Optimizers (SGD, Adam) with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             decoupled L2); SGD+momentum for image\n#             models; learning-rate scheduler in\n#             addition to the optimizer; per-param-\n#             group lr (e.g. lower lr for backbone,\n#             higher for head).\n#             regularization; per-param-group lr is\n#             essential for fine-tuning.\n#             warmup — senior tier.\n#\nimport torch.optim as optim\n# AdamW — DECOUPLED weight decay (preferred over Adam)\nopt = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)\n# SGD with momentum — still strong for image models\nopt = optim.SGD(model.parameters(), lr=0.1, momentum=0.9,\n                 weight_decay=1e-4, nesterov=True)\n# Per-param-group lr (fine-tuning)\nopt = optim.AdamW([\n    {\"params\": model.backbone.parameters(), \"lr\": 1e-5},   # frozen-ish\n    {\"params\": model.head.parameters(),     \"lr\": 1e-3},   # fresh\n], weight_decay=1e-2)\n# LR scheduling\nsched = optim.lr_scheduler.CosineAnnealingLR(opt, T_max=epochs)\nfor epoch in range(epochs):\n    train_one_epoch(model, opt)\n    sched.step()                              # step AFTER each epoch"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Optimizers (SGD, Adam) — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             schedule (the modern transformer\n#             default); OneCycleLR for fast\n#             convergence; AdamW for transformers\n#             and most modern arch; gradient\n#             accumulation for effective batch\n#             scaling.\n#             instability; cosine is the empirically\n#             best schedule shape; OneCycle is the\n#             \"fast.ai\" recipe.\n#             hyperparameter; OneCycle expects\n#             total_steps known in advance.\n#\nimport torch\nimport torch.optim as optim\nfrom torch.optim.lr_scheduler import (\n    LambdaLR, CosineAnnealingLR, OneCycleLR)\nopt = optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)\n# Warmup + cosine (transformer default)\ntotal_steps = epochs * len(train_loader)\nwarmup_steps = total_steps // 10\ndef lr_lambda(step):\n    if step < warmup_steps:\n        return step / warmup_steps\n    progress = (step - warmup_steps) / (total_steps - warmup_steps)\n    return 0.5 * (1 + math.cos(math.pi * progress))\nsched = LambdaLR(opt, lr_lambda)\n# Step the scheduler EVERY BATCH (not every epoch) for warmup\n# Decision rule:\n#   transformer / NLP / modern arch       -> AdamW (lr ~1e-3 to 1e-4)\n#   image models from scratch              -> SGD + momentum (lr ~0.1)\n#   fine-tuning                            -> AdamW with per-group lr\n#   fast convergence                        -> OneCycleLR\n#   transformer training                    -> warmup + cosine schedule\n#   training unstable                       -> add gradient clipping + warmup\n#\n# Anti-pattern: using optim.Adam with a non-zero weight_decay and\n# expecting L2 regularization\n#   In Adam, weight_decay is folded INTO the gradient before the\n#   adaptive scaling, so its effective strength depends on the\n#   gradient's running variance — large parameters with small\n#   gradients are barely regularized. Use optim.AdamW (decoupled weight\n#   decay applied after the adaptive update) for any model where\n#   regularization matters: transformers, large MLPs, fine-tuning.\n#   Same lr and weight_decay numbers, very different generalization."
                  }
        ],
        tips: [
                  "Adam best for most deep learning tasks; SGD with momentum for vision",
                  "Lower learning rate (0.001-0.0001) for Adam, higher (0.01-0.1) for SGD",
                  "Always zero_grad() before backward() to avoid accumulation",
                  "For transformers / NLP / modern architectures use `AdamW` (decoupled weight decay) over Adam",
                  "For one-shot fast convergence wrap with `OneCycleLR`; for transformer training use a warmup + cosine schedule and add gradient clipping if loss spikes"
        ],
        mistake: "Using same learning rate for SGD and Adam causes poor convergence.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "dataloader",
        fn: "DataLoader",
        desc: "Batch data efficiently.",
        category: "Data Loading",
        subtitle: "Batching, shuffling, multi-processing",
        signature: "DataLoader(dataset, batch_size, shuffle=True, num_workers)",
        descLong: "DataLoader batches data, handles shuffling, and enables parallel data loading. Wraps a Dataset to provide mini-batches for training. Essential for efficient training on large datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of DataLoader — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#             DataLoader handles batching, shuffling.\n#             num_workers, or pin_memory.\n#\nfrom torch.utils.data import TensorDataset, DataLoader\nds = TensorDataset(X, y)\nloader = DataLoader(ds, batch_size=32, shuffle=True)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of DataLoader — common patterns you'll see in production.\n# APPROACH  - Combine DataLoader with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#             custom Dataset (must implement __len__\n#             and __getitem__); shuffle=True for\n#             train, False for val/test;\n#             num_workers for parallel I/O;\n#             pin_memory for fast GPU transfer.\n#             pin_memory / drop_last) cover most\n#             real-world cases.\n#             for variable-length batches, or\n#             persistent_workers — senior tier.\n#\nimport torch\nfrom torch.utils.data import Dataset, DataLoader\nclass ImageDataset(Dataset):\n    def __init__(self, paths, labels, transform=None):\n        self.paths, self.labels, self.transform = paths, labels, transform\n    def __len__(self):\n        return len(self.paths)\n    def __getitem__(self, idx):\n        img = load_image(self.paths[idx])         # I/O happens per-item\n        if self.transform:\n            img = self.transform(img)\n        return img, self.labels[idx]\ntrain_loader = DataLoader(\n    train_ds, batch_size=64,\n    shuffle=True,                                # train: yes\n    num_workers=4,                               # parallel I/O\n    pin_memory=True,                             # async H2D\n    drop_last=True,                              # avoid uneven last batch\n)\nval_loader = DataLoader(\n    val_ds, batch_size=128,\n    shuffle=False, num_workers=4, pin_memory=True,\n)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of DataLoader — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#             collate_fn for variable-length\n#             batches; WeightedRandomSampler for\n#             imbalanced classes; persistent_\n#             workers=True for long training runs;\n#             prefetch_factor for I/O-heavy\n#             pipelines.\n#             variable-length batch handler;\n#             persistent_workers eliminates worker\n#             startup overhead between epochs.\n#             — debug with num_workers=0 first;\n#             persistent_workers holds memory all\n#             epoch.\n#\nimport torch\nfrom torch.utils.data import DataLoader, WeightedRandomSampler\nfrom torch.nn.utils.rnn import pad_sequence\n# 1. Variable-length batches via collate_fn\ndef collate_var_len(batch):\n    seqs, labels = zip(*batch)\n    lengths = torch.tensor([len(s) for s in seqs])\n    padded  = pad_sequence(seqs, batch_first=True)\n    return padded, lengths, torch.stack(labels)\n# 2. Class-balanced sampling for imbalanced data\nclass_counts = torch.bincount(torch.tensor(train_ds.labels))\nsample_weights = (1.0 / class_counts.float())[train_ds.labels]\nsampler = WeightedRandomSampler(\n    sample_weights, num_samples=len(sample_weights),\n    replacement=True,\n)\ntrain_loader = DataLoader(\n    train_ds,\n    batch_size=64,\n    sampler=sampler,                              # MUTUALLY EXCLUSIVE with shuffle\n    collate_fn=collate_var_len,\n    num_workers=8,\n    pin_memory=True,\n    persistent_workers=True,                      # keep workers alive between epochs\n    prefetch_factor=4,                            # batches buffered per worker\n)\n# Decision rule:\n#   tabular / fixed-shape data         -> TensorDataset + DataLoader\n#   I/O per item (images, files)        -> custom Dataset + num_workers\n#   variable-length sequences           -> collate_fn with pad_sequence\n#   class imbalance                      -> WeightedRandomSampler\n#   long training (many epochs)         -> persistent_workers=True\n#\n# Anti-pattern: loading the entire dataset into a tensor inside\n# Dataset.__init__ (e.g. self.images = torch.stack([load(p) for p in\n# paths]))\n#   This collapses lazy loading: every worker process forks a copy of\n#   the full tensor (RAM x num_workers), startup is huge, and\n#   pin_memory + non_blocking transfer can no longer overlap with\n#   I/O. Keep __init__ light (paths + transforms only), do the actual\n#   load in __getitem__, and let num_workers + pin_memory parallelize\n#   across the CPU. Pre-stacked tensors belong in TensorDataset for\n#   already-numeric data — not images on disk."
                  }
        ],
        tips: [
                  "Always shuffle=True for training, False for validation",
                  "num_workers=0 for debugging, >0 for production",
                  "pin_memory=True speeds up data transfer to GPU",
                  "For long training runs add `persistent_workers=True` so worker processes are not re-spawned every epoch",
                  "Class imbalance: pass a `WeightedRandomSampler` and drop `shuffle=True` (the sampler controls order)",
                  "Variable-length sequences: write a `collate_fn` that calls `pad_sequence` per batch — never pad the entire dataset to the global max length"
        ],
        mistake: "Using shuffle=True on validation/test data randomizes evaluation metrics.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "training-loop-pattern",
        fn: "Training Loop Pattern",
        desc: "Standard epoch-based training.",
        category: "Training",
        subtitle: "Complete training loop example",
        signature: "for epoch in range(num_epochs):\n    for batch in train_loader:",
        descLong: "Standard training loop: iterate epochs, batches, forward pass, compute loss, backward, optimize. Includes validation loop for monitoring. Essential pattern for all PyTorch training.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Training Loop Pattern — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\nmodel = nn.Linear(10, 2)\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.Adam(model.parameters(), lr=1e-3)\nx = torch.randn(32, 10)\ny = torch.randint(0, 2, (32,))\nfor epoch in range(3):\n    optimizer.zero_grad()       # 1. clear old gradients\n    logits = model(x)           # 2. forward\n    loss = criterion(logits, y) # 3. loss\n    loss.backward()             # 4. backward (autograd fills .grad)\n    optimizer.step()            # 5. apply update\n    print(f\"epoch {epoch}: loss={loss.item():.4f}\")"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Training Loop Pattern — common patterns you'll see in production.\n# APPROACH  - Combine Training Loop Pattern with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\nfrom torch.utils.data import DataLoader, TensorDataset\nmodel = nn.Sequential(\n    nn.Linear(20, 64), nn.ReLU(),\n    nn.Linear(64, 10),\n)\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.Adam(model.parameters(), lr=1e-3)\nX_train, y_train = torch.randn(500, 20), torch.randint(0, 10, (500,))\nX_val,   y_val   = torch.randn(100, 20), torch.randint(0, 10, (100,))\ntrain_loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)\nval_loader   = DataLoader(TensorDataset(X_val,   y_val),   batch_size=32, shuffle=False)\nfor epoch in range(5):\n    model.train()                       # dropout / batchnorm in train mode\n    train_loss = 0.0\n    for xb, yb in train_loader:\n        optimizer.zero_grad()\n        loss = criterion(model(xb), yb)\n        loss.backward()\n        optimizer.step()\n        train_loss += loss.item()\n    train_loss /= len(train_loader)\n    model.eval()                        # disable dropout, frozen BN stats\n    val_loss, correct = 0.0, 0\n    with torch.no_grad():               # save memory + speed up\n        for xb, yb in val_loader:\n            logits = model(xb)\n            val_loss += criterion(logits, yb).item()\n            correct += (logits.argmax(1) == yb).sum().item()\n    val_loss /= len(val_loader)\n    acc = correct / len(y_val)\n    print(f\"epoch {epoch+1}: train={train_loss:.4f} val={val_loss:.4f} acc={acc:.4f}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Training Loop Pattern — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch, copy\nimport torch.nn as nn\nimport torch.optim as optim\nfrom torch.cuda.amp import autocast, GradScaler\ndevice = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\nmodel = build_model().to(device)\ncriterion = nn.CrossEntropyLoss()\noptimizer = optim.AdamW(model.parameters(), lr=3e-4, weight_decay=1e-2)\nscheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)\nscaler = GradScaler(enabled=device.type == \"cuda\")\nbest_val, patience, bad = float(\"inf\"), 5, 0\nbest_state = None\nfor epoch in range(epochs):\n    model.train()\n    for xb, yb in train_loader:\n        xb, yb = xb.to(device, non_blocking=True), yb.to(device, non_blocking=True)\n        optimizer.zero_grad(set_to_none=True)            # faster than zero_()\n        with autocast(enabled=device.type == \"cuda\"):    # mixed precision\n            loss = criterion(model(xb), yb)\n        scaler.scale(loss).backward()\n        scaler.unscale_(optimizer)                       # clip on real grads\n        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\n        scaler.step(optimizer)\n        scaler.update()\n    scheduler.step()                                     # AFTER optimizer.step()\n    model.eval()\n    val_loss = 0.0\n    with torch.no_grad():\n        for xb, yb in val_loader:\n            xb, yb = xb.to(device), yb.to(device)\n            val_loss += criterion(model(xb), yb).item()\n    val_loss /= len(val_loader)\n    # Early stopping + best-checkpoint tracking\n    if val_loss < best_val - 1e-4:\n        best_val, bad = val_loss, 0\n        best_state = copy.deepcopy(model.state_dict())   # CPU snapshot ideal\n    else:\n        bad += 1\n        if bad >= patience:\n            break\nmodel.load_state_dict(best_state)                        # restore best weights\n# Decision rule:\n#   debugging / tiny model         -> intro 5-line loop is enough\n#   normal training run            -> junior loop, plus a scheduler\n#   GPU training, real data        -> senior loop (AMP + clip + schedule)\n#   distributed / multi-GPU        -> wrap with DistributedDataParallel\n#\n# Anti-pattern: scheduler.step() inside the batch loop\n#   for xb, yb in loader:\n#       optimizer.step(); scheduler.step()   # decays LR per batch, not epoch\n#   Step it once per epoch unless you're using OneCycleLR (which is per-batch)."
                  }
        ],
        tips: [
                  "model.train() enables dropout/batch norm; model.eval() disables",
                  "Always use torch.no_grad() in validation to save memory",
                  "Step scheduler after backward() in training loop"
        ],
        mistake: "Forgetting model.eval() in validation causes wrong metrics (dropout affects output).",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "model-train-eval",
        fn: "model.train() vs model.eval()",
        desc: "Toggle training and evaluation modes.",
        category: "Model Modes",
        subtitle: "Different behavior for training/testing",
        signature: "model.train() | model.eval()",
        descLong: "Training mode: Dropout active, BatchNorm uses running stats. Eval mode: Dropout inactive, BatchNorm uses accumulated stats. Critical for correct validation/test evaluation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of model.train() vs model.eval() — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch.nn as nn\nmodel = nn.Linear(10, 2)\nmodel.train()                # default state after construction\nprint(\"training:\", model.training)   # True\nmodel.eval()                 # call before validation / inference\nprint(\"training:\", model.training)   # False"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of model.train() vs model.eval() — common patterns you'll see in production.\n# APPROACH  - Combine model.train() vs model.eval() with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nmodel = nn.Sequential(\n    nn.Linear(20, 64),\n    nn.BatchNorm1d(64),\n    nn.ReLU(),\n    nn.Dropout(0.5),       # randomness only in train()\n    nn.Linear(64, 10),\n)\nx = torch.randn(32, 20)\nmodel.train()\nout1, out2 = model(x), model(x)\nprint(\"train: different runs?\", not torch.allclose(out1, out2))   # True\nmodel.eval()\nwith torch.no_grad():\n    out1, out2 = model(x), model(x)\nprint(\"eval:  different runs?\", not torch.allclose(out1, out2))   # False\n# Note: model.eval() ≠ torch.no_grad(). eval() flips layer behavior;\n# no_grad() disables autograd. You almost always want both for inference."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of model.train() vs model.eval() — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# 1) Layers that change behavior with .train()/.eval()\nLEAKY = (nn.Dropout, nn.Dropout1d, nn.Dropout2d, nn.Dropout3d,\n         nn.BatchNorm1d, nn.BatchNorm2d, nn.BatchNorm3d,\n         nn.SyncBatchNorm, nn.InstanceNorm1d, nn.InstanceNorm2d)\ndef audit_modes(model):\n    return [(n, type(m).__name__, m.training)\n            for n, m in model.named_modules() if isinstance(m, LEAKY)]\n# 2) BatchNorm running-stats trap.\n#    eval() uses running_mean/running_var accumulated during training.\n#    If you fine-tune with tiny batches and forget to set BN to eval(),\n#    its running stats drift from the original distribution.\ndef freeze_bn(model):\n    for m in model.modules():\n        if isinstance(m, (nn.BatchNorm1d, nn.BatchNorm2d, nn.BatchNorm3d)):\n            m.eval()                          # use frozen running stats\n            for p in m.parameters():\n                p.requires_grad = False       # freeze gamma/beta too\n# 3) Inference idiom: eval() + no_grad() (or inference_mode for speed)\n@torch.inference_mode()                       # stronger than no_grad\ndef predict(model, x):\n    was_training = model.training\n    model.eval()\n    try:\n        return model(x)\n    finally:\n        if was_training:\n            model.train()                     # restore prior mode\n# Decision rule:\n#   any validation / test pass        -> model.eval() + torch.no_grad()\n#   single-sample API inference       -> @torch.inference_mode()\n#   fine-tuning a pretrained backbone -> freeze BN with .eval() per module\n#   batch size 1 with BatchNorm       -> switch to GroupNorm or LayerNorm\n#\n# Anti-pattern: validating in train() mode\n#   Dropout still drops -> noisier metrics that look worse than the model is.\n#   Same trap with BatchNorm: a 1-sample batch in train() divides by zero variance."
                  }
        ],
        tips: [
                  "Always call model.eval() before validation/testing",
                  "Dropout disabled in eval; BatchNorm uses running stats",
                  "Forgetting eval() causes valid metrics to look worse than actual"
        ],
        mistake: "Running validation with model.train() applies Dropout, causing metrics to be noisy.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "save-load-model",
        fn: "torch.save / torch.load",
        desc: "Save and load model checkpoints.",
        category: "Checkpointing",
        subtitle: "Persist model state",
        signature: "torch.save(model.state_dict(), path) | model.load_state_dict(torch.load(path))",
        descLong: "Save model parameters and training state for later use. torch.save() saves state_dict (parameters). torch.load() restores. Essential for resuming training and inference.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of torch.save / torch.load — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nmodel = nn.Linear(10, 5)\n# Save just the parameters (state_dict)\ntorch.save(model.state_dict(), \"model.pth\")\n# Load into a fresh model with the SAME architecture\nmodel_new = nn.Linear(10, 5)\nmodel_new.load_state_dict(torch.load(\"model.pth\"))\nmodel_new.eval()                 # always eval() after loading for inference"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of torch.save / torch.load — common patterns you'll see in production.\n# APPROACH  - Combine torch.save / torch.load with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nimport torch.optim as optim\nmodel = nn.Sequential(nn.Linear(10, 64), nn.ReLU(), nn.Linear(64, 5))\noptimizer = optim.Adam(model.parameters(), lr=1e-3)\nscheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10)\n# Save: bundle everything you need to resume\ncheckpoint = {\n    \"epoch\": 42,\n    \"model_state_dict\": model.state_dict(),\n    \"optimizer_state_dict\": optimizer.state_dict(),\n    \"scheduler_state_dict\": scheduler.state_dict(),\n    \"best_val_loss\": 0.123,\n}\ntorch.save(checkpoint, \"checkpoint.pth\")\n# Load: restore each piece\nckpt = torch.load(\"checkpoint.pth\")\nmodel.load_state_dict(ckpt[\"model_state_dict\"])\noptimizer.load_state_dict(ckpt[\"optimizer_state_dict\"])\nscheduler.load_state_dict(ckpt[\"scheduler_state_dict\"])\nstart_epoch = ckpt[\"epoch\"] + 1            # next epoch to run\nbest = ckpt[\"best_val_loss\"]\nprint(f\"resumed from epoch {start_epoch}, best val so far {best}\")"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of torch.save / torch.load — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# 1) Device portability: load a GPU checkpoint on CPU (or vice versa)\ndevice = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\nckpt = torch.load(\"checkpoint.pth\", map_location=device)   # NEVER skip this\nmodel.load_state_dict(ckpt[\"model_state_dict\"])\nmodel.to(device)\n# 2) Security: untrusted checkpoints — torch.load uses pickle by default.\n#    weights_only=True (PyTorch 2.x) blocks arbitrary code execution.\nckpt = torch.load(\"downloaded.pth\", map_location=\"cpu\", weights_only=True)\n# 3) Partial loads: swap a classification head, keep the backbone\nstate = torch.load(\"pretrained.pth\", map_location=\"cpu\")\nmissing, unexpected = model.load_state_dict(state, strict=False)\nprint(\"missing:\", missing)        # new layers (e.g. fresh head)\nprint(\"unexpected:\", unexpected)  # old layers you removed\n# 4) DDP / DataParallel: keys are prefixed with \"module.\" — strip on save\ndef clean_state_dict(sd):\n    return {k.removeprefix(\"module.\"): v for k, v in sd.items()}\ntorch.save(clean_state_dict(model.state_dict()), \"clean.pth\")\n# 5) Atomic save — never corrupt a checkpoint mid-write\nimport os, tempfile\ndef atomic_save(obj, path):\n    d = os.path.dirname(path) or \".\"\n    fd, tmp = tempfile.mkstemp(dir=d, suffix=\".tmp\")\n    os.close(fd)\n    torch.save(obj, tmp)\n    os.replace(tmp, path)         # atomic rename on POSIX\n# Decision rule:\n#   inference / sharing weights         -> save state_dict only\n#   resuming training                   -> bundle model + optimizer + scheduler + epoch\n#   loading on different device         -> map_location is mandatory\n#   third-party / downloaded weights    -> weights_only=True\n#   fine-tuning with new head           -> load_state_dict(state, strict=False)\n#\n# Anti-pattern: torch.save(model, \"model.pth\")\n#   Pickles the whole class — breaks when the source file moves, the class renames,\n#   or you upgrade PyTorch. Save state_dict and reconstruct the model in code."
                  }
        ],
        tips: [
                  "Save state_dict (parameters), not entire model for compatibility",
                  "Include optimizer state and epoch in checkpoint for training resume",
                  "Always verify architecture matches before loading state_dict",
                  "When loading a third-party / downloaded checkpoint pass `weights_only=True` — it refuses pickled code execution and removes a deserialization RCE vector",
                  "Loading on a different device requires `map_location=`; for fine-tuning a new head use `load_state_dict(state, strict=False)` to ignore missing keys"
        ],
        mistake: "Saving entire model instead of state_dict causes compatibility issues across versions.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 4: CNNs & Vision ─────────────────────────────────────────
  {
    id: "cnns-vision",
    title: "CNNs & Vision",
    entries: [
      {
        id: "conv2d-architecture",
        fn: "CNN Architecture",
        desc: "Build complete CNN for images.",
        category: "CNN Design",
        subtitle: "Conv + Pool + Flatten pattern",
        signature: "Conv2d → ReLU → MaxPool2d → ... → Flatten → Linear",
        descLong: "Typical CNN: convolutional layers extract features, pooling reduces spatial dims, flatten converts to vector, fully connected layers classify. Spatial dimensions shrink with stride/pooling; channels increase with depth.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of CNN Architecture — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\ncnn = nn.Sequential(\n    nn.Conv2d(3, 16, kernel_size=3, padding=1),  # (B, 3, 32, 32) -> (B, 16, 32, 32)\n    nn.ReLU(),\n    nn.MaxPool2d(2),                              # (B, 16, 16, 16)\n    nn.Flatten(),\n    nn.Linear(16 * 16 * 16, 10),\n)\nx = torch.randn(4, 3, 32, 32)\nprint(cnn(x).shape)   # torch.Size([4, 10])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of CNN Architecture — common patterns you'll see in production.\n# APPROACH  - Combine CNN Architecture with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nclass SmallCNN(nn.Module):\n    def __init__(self, num_classes=10):\n        super().__init__()\n        self.features = nn.Sequential(\n            nn.Conv2d(3, 32, 3, padding=1), nn.BatchNorm2d(32), nn.ReLU(),\n            nn.MaxPool2d(2),                                     # 32 -> 16\n            nn.Conv2d(32, 64, 3, padding=1), nn.BatchNorm2d(64), nn.ReLU(),\n            nn.MaxPool2d(2),                                     # 16 -> 8\n        )\n        self.gap = nn.AdaptiveAvgPool2d(1)        # any HxW -> 1x1\n        self.head = nn.Linear(64, num_classes)\n    def forward(self, x):\n        x = self.features(x)\n        x = self.gap(x).flatten(1)                # (B, 64, 1, 1) -> (B, 64)\n        return self.head(x)\nmodel = SmallCNN()\nprint(model(torch.randn(4, 3, 32, 32)).shape)    # torch.Size([4, 10])\nprint(sum(p.numel() for p in model.parameters()))  # parameter count"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of CNN Architecture — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\nclass ResBlock(nn.Module):\n    def __init__(self, c_in, c_out, stride=1):\n        super().__init__()\n        self.conv1 = nn.Conv2d(c_in, c_out, 3, stride=stride, padding=1, bias=False)\n        self.bn1   = nn.BatchNorm2d(c_out)\n        self.conv2 = nn.Conv2d(c_out, c_out, 3, padding=1, bias=False)\n        self.bn2   = nn.BatchNorm2d(c_out)\n        # 1x1 projection if shape changes — never identity over a shape mismatch\n        self.proj = (nn.Sequential(nn.Conv2d(c_in, c_out, 1, stride=stride, bias=False),\n                                   nn.BatchNorm2d(c_out))\n                     if stride != 1 or c_in != c_out else nn.Identity())\n    def forward(self, x):\n        y = F.relu(self.bn1(self.conv1(x)), inplace=True)\n        y = self.bn2(self.conv2(y))\n        return F.relu(y + self.proj(x), inplace=True)\nclass ResNet8(nn.Module):\n    def __init__(self, num_classes=10):\n        super().__init__()\n        self.stem  = nn.Sequential(nn.Conv2d(3, 32, 3, padding=1, bias=False),\n                                   nn.BatchNorm2d(32), nn.ReLU(inplace=True))\n        self.stage1 = ResBlock(32, 64, stride=2)\n        self.stage2 = ResBlock(64, 128, stride=2)\n        self.gap    = nn.AdaptiveAvgPool2d(1)\n        self.head   = nn.Linear(128, num_classes)\n    def forward(self, x):\n        x = self.stage2(self.stage1(self.stem(x)))\n        return self.head(self.gap(x).flatten(1))\nmodel = ResNet8()\n# Spatial arithmetic — memorize: out = floor((in + 2p - k)/s) + 1\n#   3x3 / pad=1 / stride=1  -> same shape\n#   3x3 / pad=1 / stride=2  -> halves H and W\n#   1x1                     -> changes channels only\n# Memory layout for GPU: channels-last gives ~30% speedup on Ampere+\nmodel = model.to(memory_format=torch.channels_last)\nx = torch.randn(8, 3, 32, 32).to(memory_format=torch.channels_last)\nprint(model(x).shape)\n# Decision rule:\n#   tiny dataset / quick baseline    -> SmallCNN above\n#   ImageNet-scale or transfer-ready -> torchvision.models (ResNet, ConvNeXt)\n#   need any-input-size head         -> AdaptiveAvgPool, NEVER hardcoded Flatten\n#   fixed-input MLP head             -> Flatten + Linear is fine\n#\n# Anti-pattern: hardcoded view(-1, 64*8*8) in forward()\n#   Breaks the moment input size changes. Use AdaptiveAvgPool2d(1) + flatten(1)."
                  }
        ],
        tips: [
                  "padding=1 preserves spatial dims for 3x3 kernels",
                  "MaxPool2d(2) halves spatial dimensions",
                  "AdaptiveAvgPool2d((1,1)) pools to single value regardless of input size",
                  "Use `AdaptiveAvgPool2d(1)` + `flatten(1)` before the classifier head — hardcoded `view(-1, 64*8*8)` breaks the moment the input resolution changes"
        ],
        mistake: "Not using padding in early layers causes spatial dimensions to shrink too fast.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "maxpool2d",
        fn: "nn.MaxPool2d",
        desc: "Max pooling for spatial reduction.",
        category: "Pooling",
        subtitle: "Downsample feature maps",
        signature: "nn.MaxPool2d(kernel_size, stride, padding)",
        descLong: "Takes maximum value in local window. Reduces spatial dimensions (height/width) while preserving important features. Stride often equals kernel_size for non-overlapping windows.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.MaxPool2d — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nx = torch.randn(1, 3, 8, 8)               # (B, C, H, W)\npool = nn.MaxPool2d(kernel_size=2)        # default stride = kernel_size\nprint(pool(x).shape)                      # torch.Size([1, 3, 4, 4])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.MaxPool2d — common patterns you'll see in production.\n# APPROACH  - Combine nn.MaxPool2d with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nx = torch.randn(2, 3, 8, 8)\n# Non-overlapping (stride=kernel_size, the standard)\nprint(nn.MaxPool2d(2)(x).shape)              # (2, 3, 4, 4)\n# Overlapping windows preserve more spatial info\nprint(nn.MaxPool2d(kernel_size=2, stride=1)(x).shape)   # (2, 3, 7, 7)\n# Average pooling — smoother, weaker for sharp features\nprint(nn.AvgPool2d(2)(x).shape)              # (2, 3, 4, 4)\n# Adaptive: pick the OUTPUT size, kernel/stride solved for you\nprint(nn.AdaptiveAvgPool2d((1, 1))(x).shape) # (2, 3, 1, 1) — the GAP head trick\n# Visualize the max op\nsmall = torch.tensor([[[[1., 2., 3., 4.],\n                        [5., 6., 7., 8.],\n                        [9., 10., 11., 12.],\n                        [13., 14., 15., 16.]]]])\nprint(nn.MaxPool2d(2)(small)[0, 0])  # tensor([[6, 8], [14, 16]])"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.MaxPool2d — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# Spatial output for any pooling/conv:\n#   out = floor((in + 2p - k) / s) + 1\ndef out_dim(in_dim, k, s, p=0):\n    return (in_dim + 2*p - k) // s + 1\nprint(out_dim(32, 2, 2))   # 16  — MaxPool2d(2)\nprint(out_dim(32, 3, 2, 1))# 16  — strided conv same effect\n# Modern CNNs (ResNet, ConvNeXt) prefer strided conv to MaxPool:\n#   stride=2 in the conv learns its own downsampling\n#   MaxPool is a fixed op — sometimes too lossy for small features\nstrided_conv = nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1)\nmaxpool      = nn.MaxPool2d(2)\n# Global Average Pooling head — replaces flatten + huge Linear\nclass CNNHead(nn.Module):\n    def __init__(self, c, n_classes):\n        super().__init__()\n        self.gap  = nn.AdaptiveAvgPool2d(1)\n        self.head = nn.Linear(c, n_classes)\n    def forward(self, x):\n        return self.head(self.gap(x).flatten(1))\n# Decision rule:\n#   classic / small-data CNN          -> MaxPool2d(2) between conv blocks\n#   modern ResNet-style               -> strided Conv2d, no separate pool\n#   need fixed-size head from any HW  -> AdaptiveAvgPool2d(1) + Linear\n#   detection / segmentation upsample -> avoid pooling — use stride + skip connections\n#\n# Anti-pattern: pooling on tiny feature maps\n#   nn.MaxPool2d(2) on a 4x4 map -> 2x2; another pool -> 1x1 with no signal left.\n#   Switch to AdaptiveAvgPool2d(1) once spatial dims are small."
                  }
        ],
        tips: [
                  "MaxPool2d(2, 2) is standard: 2x2 kernel, stride 2",
                  "Reduces computation and parameters in following layers",
                  "No learnable parameters; purely spatial reduction"
        ],
        mistake: "Using stride=kernel_size unnecessarily; stride < kernel_size is valid.",
        shorthand: {
          verbose: "import torch\nimport torch.nn as nn\nx = torch.randn(1, 3, 8, 8)  # batch=1, channels=3, h=8, w=8\nprint(f\"Input shape: {x.shape}\")",
          concise: "print(f\"After AvgPool2d(2):\\n{avg_pooled[0, 0]}\")",
        },
      },
      {
        id: "batchnorm2d",
        fn: "nn.BatchNorm2d",
        desc: "Batch normalization for conv layers.",
        category: "Normalization",
        subtitle: "Normalize across batch dimension",
        signature: "nn.BatchNorm2d(num_features, momentum=0.1, eps=1e-05)",
        descLong: "Normalizes activations per channel. During training: normalizes by batch statistics. During eval: uses running mean/var. Accelerates training, allows higher learning rates, reduces internal covariate shift.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.BatchNorm2d — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nblock = nn.Sequential(\n    nn.Conv2d(3, 32, kernel_size=3, padding=1),\n    nn.BatchNorm2d(32),                       # one BN per conv output channel count\n    nn.ReLU(),\n)\nprint(block(torch.randn(8, 3, 28, 28)).shape)   # torch.Size([8, 32, 28, 28])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.BatchNorm2d — common patterns you'll see in production.\n# APPROACH  - Combine nn.BatchNorm2d with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nbn = nn.BatchNorm2d(32)\nx = torch.randn(16, 32, 28, 28)\nbn.train()\ny = bn(x)                                  # uses BATCH mean/var, updates running stats\nprint(\"running_mean[:3]:\", bn.running_mean[:3])\nbn.eval()\ny_eval = bn(x)                             # uses ACCUMULATED running_mean/running_var\n# Same input, different normalization -> different outputs is expected.\n# Conv -> BN -> ReLU is the canonical block (BN before activation).\n# In a Conv2d feeding BatchNorm2d, set bias=False — BN's beta replaces it.\nblock = nn.Sequential(\n    nn.Conv2d(3, 32, 3, padding=1, bias=False),\n    nn.BatchNorm2d(32),\n    nn.ReLU(inplace=True),\n)\nprint(block(torch.randn(4, 3, 32, 32)).shape)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.BatchNorm2d — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# 1) Conv2d feeding BatchNorm should NOT have a bias.\n#    BN subtracts the mean immediately after — a bias term is wasted parameters.\nnn.Conv2d(3, 64, 3, padding=1, bias=False)\n# 2) Batch-size pathology. BatchNorm needs > 1 sample per channel during train.\n#    BN with batch_size=1 in train mode -> variance=0 -> NaN gradients.\n#    Validation in train() with bs=1 hits the same trap.\ndef safe_norm(c, batch_size_hint):\n    if batch_size_hint < 8:\n        return nn.GroupNorm(num_groups=8, num_channels=c)   # batch-size invariant\n    return nn.BatchNorm2d(c)\n# 3) Freezing BN during fine-tuning of a pretrained backbone.\ndef freeze_bn(model):\n    for m in model.modules():\n        if isinstance(m, nn.BatchNorm2d):\n            m.eval()                       # use frozen running stats\n            for p in m.parameters():\n                p.requires_grad = False    # don't update gamma/beta\n# 4) Multi-GPU: replace BN with SyncBatchNorm for true cross-device statistics\n#    model = nn.SyncBatchNorm.convert_sync_batchnorm(model)\n# Decision rule:\n#   batch_size >= 16, single GPU         -> BatchNorm2d\n#   batch_size 1-8 (detection, 3D, RNNs) -> GroupNorm or LayerNorm\n#   distributed / multi-GPU              -> SyncBatchNorm\n#   transformers / per-token features    -> LayerNorm, never BN\n#   fine-tuning a pretrained CNN         -> freeze BN with .eval() per module\n#\n# Anti-pattern: BatchNorm + Dropout in the same block, in that order.\n#   BN normalizes; Dropout zeros random units; the next BN sees a corrupted\n#   mean/var. Pick one (modern CNNs use BN only)."
                  }
        ],
        tips: [
                  "Place BN after Conv, before ReLU for best results",
                  "BN momentum: typically 0.1 (running_stat = momentum * stat + (1-momentum) * new)",
                  "In eval mode, BN uses accumulated running statistics, not batch stats",
                  "Small batch sizes (1-8: detection, 3D, RNN, transformer) make BN unstable — use `GroupNorm` or `LayerNorm` instead; for multi-GPU use `SyncBatchNorm`",
                  "When fine-tuning a pretrained CNN, freeze the BN layers (call `.eval()` on each) so the small fine-tune batches do not corrupt the running stats"
        ],
        mistake: "Using BN without proper train/eval modes causes validation metrics to be incorrect.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "dropout",
        fn: "nn.Dropout",
        desc: "Regularization via random node dropping.",
        category: "Regularization",
        subtitle: "Prevent overfitting",
        signature: "nn.Dropout(p=0.5)",
        descLong: "Randomly zeros activations during training (probability p). Reduces co-adaptation of neurons. Disabled during evaluation. Simple but effective regularization. Often 0.5 for fully connected, 0.2-0.3 for conv.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Dropout — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nmlp = nn.Sequential(\n    nn.Linear(100, 64),\n    nn.ReLU(),\n    nn.Dropout(0.5),       # zero half the activations during training\n    nn.Linear(64, 10),\n)\nx = torch.randn(32, 100)\nprint(mlp(x).shape)        # torch.Size([32, 10])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Dropout — common patterns you'll see in production.\n# APPROACH  - Combine nn.Dropout with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nmodel = nn.Sequential(\n    nn.Linear(100, 200), nn.ReLU(),\n    nn.Dropout(0.5),\n    nn.Linear(200, 100), nn.ReLU(),\n    nn.Dropout(0.3),       # smaller p in deeper layers is common\n    nn.Linear(100, 10),\n)\nx = torch.randn(32, 100)\nmodel.train()\nprint(\"train: outputs differ?\", not torch.allclose(model(x), model(x)))   # True\nmodel.eval()\nwith torch.no_grad():\n    print(\"eval:  outputs match?\", torch.allclose(model(x), model(x)))    # True\n# Inverted Dropout: PyTorch scales by 1/(1-p) at TRAIN time, so eval needs no scaling.\n# That's why you don't multiply by anything when switching to eval."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Dropout — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# 1) Standard Dropout zeros INDEPENDENT activations — wrong for conv feature maps,\n#    where neighboring pixels are correlated. Use Dropout2d to zero whole channels.\nfc_dropout    = nn.Dropout(0.5)        # MLP / transformer feed-forward\nconv_dropout  = nn.Dropout2d(0.2)      # zero entire channels for conv layers\n# 2) Tuned defaults that work in production\nDROPOUT_MLP_HIDDEN     = 0.5\nDROPOUT_MLP_NEAR_OUT   = 0.2\nDROPOUT_TRANSFORMER    = 0.1            # standard for attention + FFN\nDROPOUT_CONV           = 0.0            # most modern CNNs skip it\nDROPOUT_LAST_LINEAR    = 0.0            # never drop into the logits\n# 3) BatchNorm + Dropout interaction — pick one.\n#    BN already regularizes via batch-statistic noise. Stacking Dropout\n#    after BN introduces variance that BN tries to remove on the next pass.\n#    Modern CNN: BN only. Transformer / MLP without BN: Dropout.\n# 4) Functional dropout for custom training loops (no Module needed)\nimport torch.nn.functional as F\ndef forward_with_runtime_p(x, p):\n    return F.dropout(x, p=p, training=True)   # explicit flag — be careful\n# Decision rule:\n#   MLP / transformer FFN              -> nn.Dropout(0.1 - 0.5)\n#   conv feature maps                  -> nn.Dropout2d (rare; usually unneeded)\n#   model with BatchNorm everywhere    -> usually no Dropout\n#   small dataset, big model           -> raise Dropout p before adding L2\n#   right before the final Linear      -> p = 0 (don't corrupt logits)\n#\n# Anti-pattern: forgetting model.eval() at inference\n#   Dropout stays active -> randomized predictions, looks like model is broken.\n#   Always: model.eval() + torch.no_grad() (or @torch.inference_mode())."
                  }
        ],
        tips: [
                  "Typical p=0.5 for FC layers, p=0.2-0.3 for conv",
                  "Always disable in eval mode (model.eval() handles this)",
                  "Alternative: use weight decay (L2 regularization) instead of/with Dropout"
        ],
        mistake: "Forgetting model.eval() before validation causes Dropout to remain active.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "torchvision-transforms",
        fn: "torchvision Transforms",
        desc: "Image augmentation and preprocessing.",
        category: "Data Augmentation",
        subtitle: "Normalize, crop, rotate, flip images",
        signature: "transforms.Compose([...]) | transforms.ToTensor() | transforms.Normalize()",
        descLong: "torchvision.transforms provides composable image transformations. ToTensor converts PIL images to tensors. Normalize with ImageNet statistics. Augmentation (rotate, flip, crop) during training improves robustness.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of torchvision Transforms — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom torchvision import transforms\nfrom PIL import Image\nt = transforms.Compose([\n    transforms.ToTensor(),                     # PIL [0..255] -> float [0..1]\n    transforms.Normalize(mean=[0.485, 0.456, 0.406],\n                         std =[0.229, 0.224, 0.225]),  # ImageNet stats\n])\nimg = Image.new(\"RGB\", (224, 224))\nprint(t(img).shape)                            # torch.Size([3, 224, 224])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of torchvision Transforms — common patterns you'll see in production.\n# APPROACH  - Combine torchvision Transforms with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nfrom torchvision import transforms\n# Training: aggressive augmentation\ntrain_tf = transforms.Compose([\n    transforms.RandomResizedCrop(224),         # crop + resize in one step\n    transforms.RandomHorizontalFlip(p=0.5),\n    transforms.ColorJitter(brightness=0.2, contrast=0.2),\n    transforms.ToTensor(),\n    transforms.Normalize([0.485, 0.456, 0.406],\n                         [0.229, 0.224, 0.225]),\n])\n# Validation: deterministic only — never randomize evaluation\nval_tf = transforms.Compose([\n    transforms.Resize(256),                    # resize short side to 256\n    transforms.CenterCrop(224),                # then center-crop to 224\n    transforms.ToTensor(),\n    transforms.Normalize([0.485, 0.456, 0.406],\n                         [0.229, 0.224, 0.225]),\n])\n# Wire into a Dataset:\n# train_ds = datasets.ImageFolder(\"data/train\", transform=train_tf)\n# val_ds   = datasets.ImageFolder(\"data/val\",   transform=val_tf)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of torchvision Transforms — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nfrom torchvision.transforms import v2\n# 1) Use transforms.v2 — it operates on tensors, not just PIL, and supports\n#    detection / segmentation targets in the same Compose.\ntrain_tf = v2.Compose([\n    v2.PILToTensor(),                          # uint8 tensor, no scaling\n    v2.RandomResizedCrop(224, antialias=True),\n    v2.RandomHorizontalFlip(),\n    v2.TrivialAugmentWide(),                   # strong, parameter-free augmenter\n    v2.ToDtype(torch.float32, scale=True),     # uint8 -> float in [0,1]\n    v2.Normalize(mean=[0.485, 0.456, 0.406],\n                 std =[0.229, 0.224, 0.225]),\n])\n# 2) Compute YOUR dataset's mean/std once — don't blindly reuse ImageNet.\ndef dataset_stats(loader):\n    n, mean, sq = 0, 0., 0.\n    for x, _ in loader:                        # x: (B, C, H, W) in [0, 1]\n        b = x.size(0) * x.size(2) * x.size(3)\n        n   += b\n        mean += x.sum(dim=[0, 2, 3])\n        sq   += (x ** 2).sum(dim=[0, 2, 3])\n    mean /= n\n    std = (sq / n - mean ** 2).sqrt()\n    return mean, std\n# 3) GPU-side augmentation for I/O-bound pipelines: keep ToTensor+Resize on CPU,\n#    move flips / colorjitter to the GPU after the batch is collated.\n# Decision rule:\n#   transfer learning from ImageNet      -> ImageNet mean/std, RandomResizedCrop+HFlip\n#   training from scratch on own data    -> compute dataset_stats() above\n#   strong baseline with one knob        -> TrivialAugmentWide or RandAugment\n#   detection / segmentation             -> v2 with bbox/mask-aware transforms\n#   small dataset, big model             -> heavier augmentation (Mixup, CutMix)\n#\n# Anti-pattern: applying augmentation to validation\n#   val_tf with RandomCrop -> different metric every run; you can't compare epochs.\n#   Validation must be deterministic: Resize -> CenterCrop -> Normalize, full stop."
                  }
        ],
        tips: [
                  "Use ImageNet mean/std when transferring from ImageNet pretrained models",
                  "Heavy augmentation (flip, rotate, crop) only for training",
                  "CenterCrop + no augmentation for validation/test"
        ],
        mistake: "Applying augmentation to validation data invalidates generalization evaluation.",
        shorthand: {
          verbose: "result = {}\nfor k, v in pairs:\n    result[k] = v",
          concise: "result = {k: v for k, v in pairs}",
        },
      },
      {
        id: "transfer-learning",
        fn: "Transfer Learning",
        desc: "Use pretrained models as feature extractors.",
        category: "Pretrained Models",
        subtitle: "Fine-tune or freeze backbone",
        signature: "torchvision.models.resnet50(pretrained=True)",
        descLong: "Load pretrained model (ImageNet weights), replace classification head, fine-tune. Leverages learned features, reduces training time, improves performance on small datasets.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Transfer Learning — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nfrom torchvision import models\nmodel = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)  # ImageNet pretrained\nmodel.fc = nn.Linear(model.fc.in_features, 10)                    # 1000 -> 10 classes\nx = torch.randn(2, 3, 224, 224)\nprint(model(x).shape)        # torch.Size([2, 10])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Transfer Learning — common patterns you'll see in production.\n# APPROACH  - Combine Transfer Learning with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nfrom torchvision import models\nweights = models.ResNet50_Weights.DEFAULT\nmodel = models.resnet50(weights=weights)\n# 1) Freeze all backbone params\nfor p in model.parameters():\n    p.requires_grad = False\n# 2) Replace head — new params start with requires_grad=True\nmodel.fc = nn.Linear(model.fc.in_features, 10)\n# 3) Optimize ONLY the trainable params\noptim = torch.optim.Adam(filter(lambda p: p.requires_grad, model.parameters()),\n                         lr=1e-3)\n# 4) Use the exact preprocessing the weights were trained with\npreprocess = weights.transforms()      # gives the right resize / normalize\n# Quick check: how many params will actually update?\ntrainable = sum(p.numel() for p in model.parameters() if p.requires_grad)\ntotal     = sum(p.numel() for p in model.parameters())\nprint(f\"trainable: {trainable:,} / {total:,}\")    # ~20K / ~25M"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Transfer Learning — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\nfrom torchvision import models\nweights = models.ResNet50_Weights.IMAGENET1K_V2          # always pin a specific version\nmodel = models.resnet50(weights=weights)\nmodel.fc = nn.Linear(model.fc.in_features, 10)\n# 1) Discriminative learning rates — small for early layers, large for the head.\n#    Early conv layers learn generic edges; don't disturb them much.\ndef param_groups(model, head_lr, body_lr):\n    head_params, body_params = [], []\n    for name, p in model.named_parameters():\n        (head_params if name.startswith(\"fc.\") else body_params).append(p)\n    return [\n        {\"params\": body_params, \"lr\": body_lr},\n        {\"params\": head_params, \"lr\": head_lr},\n    ]\noptim = torch.optim.AdamW(param_groups(model, head_lr=1e-3, body_lr=1e-5),\n                          weight_decay=1e-2)\n# 2) Two-phase fine-tuning:\n#    Phase A — freeze body, train head only for a few epochs (warm up the head)\nfor n, p in model.named_parameters():\n    p.requires_grad = n.startswith(\"fc.\")\n# ... train a few epochs on the head only ...\n#    Phase B — unfreeze everything, continue with discriminative LRs above\nfor p in model.parameters():\n    p.requires_grad = True\n# 3) Always reuse the original preprocessing pipeline\npreprocess = weights.transforms()                # avoids stat-mismatch headaches\n# Decision rule:\n#   tiny dataset (< 1k images)         -> freeze body, train head only\n#   medium dataset, similar domain     -> discriminative LRs, body 10-100x slower\n#   large dataset, different domain    -> full fine-tune, normal LR\n#   need <1ms inference                -> mobilenet_v3 / efficientnet, not resnet50\n#\n# Anti-pattern: pretrained=True with full unfreeze and LR 1e-3\n#   Catastrophically forgets ImageNet features in one epoch. Either freeze, or\n#   use a much smaller LR (1e-4 to 1e-5) on the body."
                  }
        ],
        tips: [
                  "Use lower learning rate (0.0001 vs 0.001) when fine-tuning",
                  "Freeze backbone for small datasets, fine-tune for large datasets",
                  "Always use ImageNet normalization when loading ImageNet pretrained",
                  "For medium datasets in a similar domain, use discriminative learning rates — set the backbone parameter group 10-100x slower than the new head; full unfreeze + 1e-3 LR catastrophically forgets ImageNet features in one epoch"
        ],
        mistake: "Using high learning rate when fine-tuning pretrained model overwrites learned features.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },

  // ── Section 5: NLP & Sequences ─────────────────────────────────────────
  {
    id: "nlp-sequences",
    title: "NLP & Sequences",
    entries: [
      {
        id: "embedding-layer",
        fn: "nn.Embedding",
        desc: "Lookup table for word embeddings.",
        category: "Word Embeddings",
        subtitle: "Map token IDs to dense vectors",
        signature: "nn.Embedding(num_embeddings, embedding_dim)",
        descLong: "Learnable lookup table: maps integer token IDs to dense vectors. Input: token IDs [0, vocab_size), output: embedding vectors. First layer in NLP models. Automatically learns word representations.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of nn.Embedding — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nembedding = nn.Embedding(num_embeddings=1000, embedding_dim=64)\ntoken_ids = torch.tensor([[1, 5, 3],\n                          [2, 7, 9]])     # (B=2, T=3)\nvecs = embedding(token_ids)               # (B=2, T=3, D=64)\nprint(vecs.shape)"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of nn.Embedding — common patterns you'll see in production.\n# APPROACH  - Combine nn.Embedding with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nPAD_ID = 0\nclass TextClassifier(nn.Module):\n    def __init__(self, vocab_size, embed_dim=128, hidden=128, n_classes=5):\n        super().__init__()\n        # padding_idx makes Embedding return zeros AND zero its grad for that row\n        self.embed = nn.Embedding(vocab_size, embed_dim, padding_idx=PAD_ID)\n        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)\n        self.head  = nn.Linear(hidden, n_classes)\n    def forward(self, ids):                     # ids: (B, T)\n        x = self.embed(ids)                     # (B, T, D)\n        _, (h_n, _) = self.lstm(x)              # h_n: (1, B, H)\n        return self.head(h_n[-1])               # (B, n_classes)\nmodel = TextClassifier(vocab_size=10_000)\nids = torch.randint(0, 10_000, (32, 50))\nprint(model(ids).shape)                         # torch.Size([32, 5])\n# IDs OUTSIDE [0, num_embeddings) silently corrupt training (or crash on GPU).\n# Always validate ids.max() < vocab_size when integrating a new tokenizer."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of nn.Embedding — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\nVOCAB, DIM = 30_000, 300\nPAD_ID = 0\n# 1) Pretrained vectors (GloVe / fastText) — load into Embedding.from_pretrained\ndef load_pretrained_emb(matrix: torch.Tensor, freeze: bool = True):\n    # matrix: (VOCAB, DIM) float — row 0 should be zeros for padding\n    return nn.Embedding.from_pretrained(matrix, freeze=freeze, padding_idx=PAD_ID)\n# 2) Sensible random init (use this when training from scratch)\ndef make_embedding(vocab=VOCAB, dim=DIM):\n    e = nn.Embedding(vocab, dim, padding_idx=PAD_ID)\n    nn.init.normal_(e.weight, mean=0.0, std=dim ** -0.5)   # transformer-style scale\n    with torch.no_grad():\n        e.weight[PAD_ID].zero_()                           # ensure pad row is zero\n    return e\n# 3) Weight tying — share input embedding with the output projection.\n#    Cuts ~30% of params on small LMs; standard since \"Tying Word Vectors\" (2017).\nclass TiedLM(nn.Module):\n    def __init__(self, vocab=VOCAB, dim=DIM):\n        super().__init__()\n        self.embed  = make_embedding(vocab, dim)\n        self.lm_head = nn.Linear(dim, vocab, bias=False)\n        self.lm_head.weight = self.embed.weight             # SAME tensor, not a copy\n    def forward(self, ids):\n        h = self.embed(ids)\n        return self.lm_head(h)\n# 4) For sparse SGD on huge vocabs (CPU side): nn.Embedding(..., sparse=True)\n#    + torch.optim.SparseAdam — only updates rows that appeared in the batch.\n# Decision rule:\n#   tiny dataset, generic text         -> Embedding.from_pretrained(GloVe), freeze=True\n#   medium dataset, fine-tune          -> from_pretrained with freeze=False\n#   training a transformer LM          -> random init + weight tying with lm_head\n#   very large vocab on CPU            -> sparse=True + SparseAdam\n#   variable-length batches            -> always set padding_idx so PAD doesn't update\n#\n# Anti-pattern: forgetting padding_idx\n#   Without it, the PAD row gets gradients from every padded position and slowly\n#   drifts away from zero. Loss looks fine; downstream models see noisy padding."
                  }
        ],
        tips: [
                  "Embedding maps integers [0, vocab_size) to dense vectors",
                  "Learnable; weights updated via backprop like any parameter",
                  "Common dims: 100 (small), 300 (standard), 768 (large)",
                  "For variable-length batches always pass `padding_idx=` so the PAD row receives zero gradient — otherwise PAD slowly drifts and pollutes inference",
                  "Very large vocabs on CPU benefit from `sparse=True` + `SparseAdam`; for transformer LMs, weight-tie the embedding with the lm_head to halve parameters"
        ],
        mistake: "Input token IDs must be in range [0, num_embeddings); out of range causes error.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "rnn-patterns",
        fn: "RNN / GRU Patterns",
        desc: "Recurrent networks for sequences.",
        category: "Recurrent Layers",
        subtitle: "RNN, GRU for sequence processing",
        signature: "nn.RNN(input_size, hidden_size) | nn.GRU(input_size, hidden_size)",
        descLong: "RNN (vanilla): updates hidden state with gradient vanishing issue. GRU: improved, fewer params than LSTM. Both process sequences step-by-step, maintaining hidden state across timesteps.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of RNN / GRU Patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\ngru = nn.GRU(input_size=100, hidden_size=128, batch_first=True)\nx = torch.randn(32, 50, 100)        # (B, T, input_size)\noutput, h_n = gru(x)\nprint(output.shape)                 # (32, 50, 128) — every timestep\nprint(h_n.shape)                    # (1, 32, 128)  — last hidden state"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of RNN / GRU Patterns — common patterns you'll see in production.\n# APPROACH  - Combine RNN / GRU Patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nclass GRUClassifier(nn.Module):\n    def __init__(self, vocab=10_000, embed_dim=128, hidden=128, n_classes=5):\n        super().__init__()\n        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)\n        self.gru   = nn.GRU(embed_dim, hidden,\n                            num_layers=2, batch_first=True,\n                            dropout=0.2, bidirectional=True)\n        self.head  = nn.Linear(hidden * 2, n_classes)   # *2 for bidirectional\n    def forward(self, ids):                             # ids: (B, T)\n        x = self.embed(ids)                             # (B, T, embed_dim)\n        _, h_n = self.gru(x)                            # h_n: (num_layers*2, B, H)\n        # Concatenate forward + backward final states from the LAST layer\n        last_fw, last_bw = h_n[-2], h_n[-1]\n        h = torch.cat([last_fw, last_bw], dim=1)        # (B, 2H)\n        return self.head(h)                             # (B, n_classes)\nmodel = GRUClassifier()\nprint(model(torch.randint(0, 10_000, (32, 50))).shape)  # (32, 5)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of RNN / GRU Patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\nfrom torch.nn.utils.rnn import pack_padded_sequence, pad_packed_sequence\nclass GRUTagger(nn.Module):\n    \"\"\"Variable-length sequence tagger using packed sequences.\"\"\"\n    def __init__(self, vocab, embed_dim=128, hidden=128, n_tags=10):\n        super().__init__()\n        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)\n        self.gru   = nn.GRU(embed_dim, hidden, batch_first=True, bidirectional=True)\n        self.head  = nn.Linear(hidden * 2, n_tags)\n    def forward(self, ids, lengths):                    # lengths: (B,) on CPU\n        x = self.embed(ids)\n        # Packed sequences skip padding internally — faster + correct backprop\n        packed = pack_padded_sequence(x, lengths.cpu(),\n                                      batch_first=True, enforce_sorted=False)\n        out_packed, _ = self.gru(packed)\n        out, _ = pad_packed_sequence(out_packed, batch_first=True)\n        return self.head(out)                            # (B, T, n_tags)\n# 1) Gradient clipping is mandatory for RNNs — they explode regularly\ndef train_step(model, optim, batch, criterion):\n    optim.zero_grad()\n    loss = criterion(model(batch.ids, batch.lengths).transpose(1, 2), batch.tags)\n    loss.backward()\n    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n    optim.step()\n    return loss.item()\n# 2) Stateful RNN (e.g. char-level LM): detach hidden across batches so backprop\n#    stops at batch boundaries, but the network keeps a \"memory\" between them.\ndef step_stateful(rnn, x, h):\n    out, h_new = rnn(x, h)\n    return out, h_new.detach()                          # crucial: .detach()\n# Decision rule:\n#   variable-length batches            -> pack_padded_sequence (correct + fast)\n#   fixed-length sequences             -> plain forward, batch_first=True\n#   sequence classification (one out)  -> use h_n[-1] (or concat fw+bw if bi)\n#   sequence tagging (per-token out)   -> use the full output tensor\n#   long context (> ~500 tokens)       -> switch to a transformer; RNNs forget\n#\n# Anti-pattern: feeding padded inputs without packing\n#   The RNN runs on the PAD tokens too, contaminating h_n with padding state.\n#   Either pack the sequence, or take h at the true length per row."
                  }
        ],
        tips: [
                  "GRU has fewer parameters than LSTM; good for smaller datasets",
                  "Bidirectional=True processes left→right and right→left",
                  "Use hidden state for classification, all outputs for sequence tagging",
                  "For variable-length batches always wrap with `pack_padded_sequence` (and `pad_packed_sequence` after) — feeding raw padded inputs lets the RNN run on PAD tokens and contaminates `h_n`",
                  "Beyond ~500 tokens, RNNs forget — switch to a transformer instead of stacking more layers"
        ],
        mistake: "Forgetting batch_first=True causes dimension mismatch with data loaders.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "lstm-patterns",
        fn: "LSTM Patterns",
        desc: "Long-term dependencies in sequences.",
        category: "NLP & Sequences",
        subtitle: "Sequence modeling with cell state",
        signature: "nn.LSTM(input_size, hidden_size, batch_first=True)",
        descLong: "LSTM (Long Short-Term Memory): solves vanishing gradient via cell state (memory). Input/forget/output gates control information flow. More parameters than RNN/GRU but captures long-range dependencies.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of LSTM Patterns — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nlstm = nn.LSTM(input_size=100, hidden_size=128, batch_first=True)\nx = torch.randn(32, 50, 100)             # (B, T, input_size)\noutput, (h_n, c_n) = lstm(x)\nprint(output.shape)                      # (32, 50, 128) — per-timestep\nprint(h_n.shape, c_n.shape)              # (1, 32, 128) each — final h and c"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of LSTM Patterns — common patterns you'll see in production.\n# APPROACH  - Combine LSTM Patterns with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\n# Many-to-one: sequence -> single label (sentiment, intent, ...)\nclass LSTMClassifier(nn.Module):\n    def __init__(self, vocab=10_000, embed_dim=128, hidden=128, n_classes=5):\n        super().__init__()\n        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)\n        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)\n        self.head  = nn.Linear(hidden, n_classes)\n    def forward(self, ids):                   # (B, T)\n        _, (h_n, _) = self.lstm(self.embed(ids))\n        return self.head(h_n[-1])             # (B, n_classes)\n# Many-to-many: per-step logits (LM, tagging, decoder)\nclass LSTMDecoder(nn.Module):\n    def __init__(self, vocab=10_000, embed_dim=128, hidden=128):\n        super().__init__()\n        self.embed = nn.Embedding(vocab, embed_dim, padding_idx=0)\n        self.lstm  = nn.LSTM(embed_dim, hidden, batch_first=True)\n        self.head  = nn.Linear(hidden, vocab)\n    def forward(self, ids, state=None):       # state: (h_0, c_0) or None\n        x = self.embed(ids)\n        out, state = self.lstm(x, state)\n        return self.head(out), state          # (B, T, vocab), state\nprint(LSTMClassifier()(torch.randint(0, 10_000, (32, 50))).shape)  # (32, 5)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of LSTM Patterns — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\n# 1) Initialize forget-gate bias to 1.0 — standard trick from Jozefowicz et al.\n#    It encourages the network to remember by default early in training.\ndef init_lstm_forget_bias(lstm: nn.LSTM, value: float = 1.0):\n    for name, p in lstm.named_parameters():\n        if \"bias\" in name:\n            n = p.size(0)\n            f_start, f_end = n // 4, n // 2          # gate order: i, f, g, o\n            p.data[f_start:f_end].fill_(value)\n# 2) Stateful training: keep h, c across batches but DETACH them so backprop\n#    is bounded to one batch (truncated BPTT).\ndef stateful_step(model, x, state):\n    if state is not None:\n        state = (state[0].detach(), state[1].detach())\n    out, state = model(x, state)\n    return out, state\n# 3) Mandatory: clip gradients. Vanilla LSTMs explode under long sequences.\ndef train_step(model, optim, batch, criterion):\n    optim.zero_grad()\n    logits, _ = model(batch.ids)\n    loss = criterion(logits.transpose(1, 2), batch.targets)\n    loss.backward()\n    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)\n    optim.step()\n    return loss.item()\n# Decision rule:\n#   short sequences (< 100 tokens)     -> nn.LSTM is fine, fast, well-trodden\n#   long context (>~ 500 tokens)       -> Transformer (TransformerEncoderLayer)\n#   tiny dataset, sequence classifier  -> GRU (fewer params than LSTM)\n#   need cell-state introspection      -> stick with LSTM (GRU has no c_t)\n#   variable-length sequences          -> always pack_padded_sequence\n#\n# Anti-pattern: keeping (h, c) across the whole epoch without .detach()\n#   Backprop tries to flow through every previous batch -> graph explodes,\n#   memory blows up, training stalls. Detach at the start of each step."
                  }
        ],
        tips: [
                  "LSTM cell state persists across sequence; critical for long dependencies",
                  "Use h_n for classification, all outputs for seq2seq",
                  "Stack multiple LSTM layers for deeper models",
                  "When carrying `(h, c)` across batches (truncated BPTT), call `.detach()` at the start of each step — otherwise backprop tries to flow through every previous batch and the graph explodes"
        ],
        mistake: "Not resetting hidden state between sequences causes information leakage.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "attention-mechanism",
        fn: "Attention Mechanism",
        desc: "Weighted focus on sequence parts.",
        category: "Attention",
        subtitle: "Query-key-value attention basics",
        signature: "Scaled dot-product attention",
        descLong: "Attention computes weighted sum of values based on similarity between queries and keys. Scaled dot-product: Attention(Q,K,V) = softmax(QK^T/√d)V. Enables focus on relevant sequence parts.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Attention Mechanism — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nimport torch.nn.functional as F\nQ = torch.randn(2, 4, 8)        # (B, T_q, D)\nK = torch.randn(2, 6, 8)        # (B, T_k, D)\nV = torch.randn(2, 6, 8)        # (B, T_k, D)\nd = Q.size(-1)\nscores = Q @ K.transpose(-2, -1) / (d ** 0.5)   # (B, T_q, T_k)\nweights = F.softmax(scores, dim=-1)\nout     = weights @ V                            # (B, T_q, D)\nprint(out.shape, weights.sum(-1)[0, 0])          # rows of weights sum to 1"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Attention Mechanism — common patterns you'll see in production.\n# APPROACH  - Combine Attention Mechanism with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nmha = nn.MultiheadAttention(embed_dim=128, num_heads=8, batch_first=True)\n# Self-attention: each token attends to every other token in the same sequence\nx = torch.randn(32, 50, 128)\nself_out, self_w = mha(x, x, x)              # Q=K=V=x\nprint(self_out.shape)                         # (32, 50, 128)\n# Cross-attention (decoder attends to encoder): Q from decoder, K/V from encoder\ndec = torch.randn(32, 10, 128)\nenc = torch.randn(32, 50, 128)\ncross_out, _ = mha(dec, enc, enc)            # Q=dec, K=V=enc\nprint(cross_out.shape)                        # (32, 10, 128)\n# num_heads must divide embed_dim. 128 / 8 = 16-d per head — standard."
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Attention Mechanism — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nimport torch.nn as nn\nimport torch.nn.functional as F\n# 1) F.scaled_dot_product_attention (PyTorch 2.x) — fused, supports FlashAttention\ndef attend(q, k, v, is_causal=False, key_pad_mask=None):\n    # q,k,v: (B, H, T, D) — already split into heads\n    # key_pad_mask: (B, T_k) — True at PAD positions\n    if key_pad_mask is not None:\n        # Convert to additive mask of shape (B, 1, 1, T_k)\n        mask = torch.zeros(*key_pad_mask.shape, dtype=q.dtype, device=q.device)\n        mask = mask.masked_fill(key_pad_mask, float(\"-inf\"))\n        mask = mask[:, None, None, :]\n    else:\n        mask = None\n    return F.scaled_dot_product_attention(q, k, v, attn_mask=mask, is_causal=is_causal)\n# 2) Causal mask for autoregressive decoding (LMs):\n#    nn.MultiheadAttention takes attn_mask of shape (T, T) with -inf above the diag.\ndef causal_mask(T, device):\n    return torch.triu(torch.full((T, T), float(\"-inf\"), device=device), diagonal=1)\n# 3) Key padding mask — never attend to PAD tokens.\n#    nn.MultiheadAttention takes key_padding_mask: (B, T_k), True where padded.\nmha = nn.MultiheadAttention(embed_dim=128, num_heads=8, batch_first=True)\nx = torch.randn(2, 6, 128)\npad_mask = torch.tensor([[False]*5 + [True],     # last token is PAD\n                         [False]*4 + [True]*2])  # last two are PAD\nout, _ = mha(x, x, x, key_padding_mask=pad_mask)\n# Decision rule:\n#   training a transformer in PyTorch 2.x   -> F.scaled_dot_product_attention\n#   need easy-to-debug attention weights    -> nn.MultiheadAttention with average_attn_weights=False\n#   autoregressive LM / decoder             -> causal mask (or is_causal=True)\n#   variable-length batches                 -> key_padding_mask, every layer\n#   very long context (> 4k tokens)         -> FlashAttention via SDPA backend\n#\n# Anti-pattern: forgetting the key_padding_mask\n#   The model attends to PAD tokens; gradients flow into PAD embeddings; metrics\n#   look fine until inputs at inference happen to be all the same length and\n#   accuracy collapses. Always pass the pad mask."
                  }
        ],
        tips: [
                  "Scaled dot-product: divide by √d for numerical stability",
                  "Multi-head attention allows attending to different subspaces",
                  "Self-attention: query = key = value for intra-sequence focus",
                  "On PyTorch 2.x prefer `F.scaled_dot_product_attention` (auto-dispatches to FlashAttention for long contexts) over a hand-rolled `softmax(QK^T/√d) @ V`",
                  "Always pass a `key_padding_mask` for batched variable-length inputs — without it the model attends to PAD tokens and accuracy collapses when inference lengths happen to be uniform",
                  "For autoregressive decoders set `is_causal=True` (or pass an upper-triangular causal mask)"
        ],
        mistake: "Forgetting to scale attention scores causes gradient instability.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "tokenization-padding",
        fn: "Tokenization & Padding",
        desc: "Convert text to token IDs and pad sequences.",
        category: "Text Preprocessing",
        subtitle: "Word/subword tokenization, sequence padding",
        signature: "torch.nn.utils.rnn.pad_sequence() | torch.nn.utils.rnn.pack_padded_sequence()",
        descLong: "Tokenization: text → token IDs using vocabulary. Padding: extend sequences to uniform length for batching. pack_padded_sequence: efficient handling of variable-length sequences in RNNs.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Tokenization & Padding — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nimport torch\nfrom torch.nn.utils.rnn import pad_sequence\nvocab = {\"<PAD>\": 0, \"<UNK>\": 1, \"hello\": 2, \"world\": 3, \"pytorch\": 4}\ndef encode(text):\n    return torch.tensor([vocab.get(t, vocab[\"<UNK>\"]) for t in text.lower().split()])\nbatch = [encode(\"hello world\"),\n         encode(\"pytorch is great\"),\n         encode(\"hello\")]\npadded = pad_sequence(batch, batch_first=True, padding_value=vocab[\"<PAD>\"])\nprint(padded)             # (B, T_max), zeros wherever a row is shorter"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Tokenization & Padding — common patterns you'll see in production.\n# APPROACH  - Combine Tokenization & Padding with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nimport torch.nn as nn\nfrom torch.nn.utils.rnn import pad_sequence, pack_padded_sequence\nPAD_ID = 0\ndef collate(batch):\n    \"\"\"Collate variable-length token tensors into (ids, lengths).\"\"\"\n    lengths = torch.tensor([len(x) for x in batch])\n    ids     = pad_sequence(batch, batch_first=True, padding_value=PAD_ID)\n    return ids, lengths\nclass TextClassifier(nn.Module):\n    def __init__(self, vocab=10_000, dim=128, n_classes=5):\n        super().__init__()\n        self.embed = nn.Embedding(vocab, dim, padding_idx=PAD_ID)\n        self.lstm  = nn.LSTM(dim, 128, batch_first=True)\n        self.head  = nn.Linear(128, n_classes)\n    def forward(self, ids, lengths):\n        x = self.embed(ids)\n        # pack so the LSTM ignores PAD positions\n        packed = pack_padded_sequence(x, lengths.cpu(),\n                                      batch_first=True, enforce_sorted=False)\n        _, (h_n, _) = self.lstm(packed)\n        return self.head(h_n[-1])\nbatch = [torch.randint(1, 10_000, (n,)) for n in (5, 12, 7)]\nids, lengths = collate(batch)\nprint(TextClassifier()(ids, lengths).shape)  # (3, 5)"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Tokenization & Padding — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nimport torch\nfrom torch.nn.utils.rnn import pad_sequence\nPAD_ID  = 0\nMAX_LEN = 512                         # truncate long inputs — never let one row dominate\n# 1) Truncate THEN pad. Padding to a 5000-token outlier wastes 99% of compute.\ndef encode_and_truncate(ids):\n    return ids[:MAX_LEN]\n# 2) Attention mask: 1 for real tokens, 0 for PAD. Transformers consume this directly.\ndef collate_for_transformer(batch):\n    batch = [encode_and_truncate(x) for x in batch]\n    ids   = pad_sequence(batch, batch_first=True, padding_value=PAD_ID)\n    attn  = (ids != PAD_ID).long()    # (B, T) — pass straight to the model\n    return ids, attn\n# 3) Bucket sampling: group similar-length sequences to minimize PAD wasted compute.\n#    Sort the dataset by length, slice into buckets, shuffle WITHIN each bucket.\ndef bucket_indices(lengths, bucket_size=64):\n    order = sorted(range(len(lengths)), key=lambda i: lengths[i])\n    buckets = [order[i:i+bucket_size] for i in range(0, len(order), bucket_size)]\n    import random\n    for b in buckets: random.shuffle(b)\n    random.shuffle(buckets)\n    return [i for b in buckets for i in b]\n# 4) Length leakage in metrics. If a CrossEntropyLoss includes PAD positions,\n#    long sequences contribute more loss than short ones — and the model can\n#    \"win\" by lowering loss on PAD tokens. Always set ignore_index=PAD_ID.\nimport torch.nn as nn\nloss_fn = nn.CrossEntropyLoss(ignore_index=PAD_ID)\n# Decision rule:\n#   short sequences (<=128 tokens)        -> dynamic padding per batch is fine\n#   variable but bounded (<=512)          -> truncate + per-batch pad\n#   wildly variable lengths               -> bucket batching, +30-50% throughput\n#   transformers                          -> attention mask, no pack_padded\n#   RNN/GRU/LSTM                          -> pack_padded_sequence is mandatory\n#\n# Anti-pattern: padding the entire dataset to global max length once\n#   You waste compute every batch. Instead pad per-batch (collate_fn) and\n#   bucket if length variance is high."
                  }
        ],
        tips: [
                  "padding_idx=0 in Embedding prevents grad updates to padding embeddings",
                  "pack_padded_sequence skips padding; more efficient than processing",
                  "enforce_sorted=False allows unsorted sequences (slower but flexible)"
        ],
        mistake: "Not using pack_padded_sequence causes RNN to process padding tokens.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
      {
        id: "subword-tokenization",
        fn: "Subword Tokenization",
        desc: "BPE, WordPiece for OOV handling.",
        category: "Tokenization",
        subtitle: "Handle unknown words via subwords",
        signature: "tokenizer.encode() | tokenizer.decode()",
        descLong: "Subword tokenization (BPE, WordPiece, SentencePiece) breaks OOV words into known subwords. BERT uses WordPiece; GPT uses BPE; T5/LLaMA use SentencePiece. Enables vocabulary coverage without a massive vocab. Requires a pretrained tokenizer.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "# === ENTRY-LEVEL EXAMPLE ===\n# TASK      - Basic usage of Subword Tokenization — understand the core syntax and behavior.\n# APPROACH  - Simple example with minimal parameters; no edge cases.\n# STRENGTHS - Clear, readable; shows the fundamental pattern.\n# WEAKNESSES- Not production-ready; no error handling or complex scenarios.\n#\nfrom transformers import AutoTokenizer\ntok = AutoTokenizer.from_pretrained(\"bert-base-uncased\")\ntext = \"PyTorch is unbelievable\"\nids = tok.encode(text)\nprint(tok.tokenize(text))   # ['py', '##tor', '##ch', 'is', 'un', '##be', '##lie', '##va', '##ble']\nprint(ids)                  # [101, ..., 102]  (101=[CLS], 102=[SEP])"
                  },
                  {
                            "tier": "junior",
                            "code": "# === JUNIOR EXAMPLE ===\n# TASK      - Real-world usage of Subword Tokenization — common patterns you'll see in production.\n# APPROACH  - Combine Subword Tokenization with related functions; handle common edge cases.\n# STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n# WEAKNESSES- May need optimization for large datasets or complex scenarios.\n#\nimport torch\nfrom transformers import AutoTokenizer\ntok = AutoTokenizer.from_pretrained(\"bert-base-uncased\")\ntexts = [\n    \"PyTorch is amazing.\",\n    \"Subword tokenizers handle out-of-vocabulary words.\",\n    \"Hi.\",\n]\nbatch = tok(\n    texts,\n    padding=True,                       # pad to longest in batch\n    truncation=True,                    # cut anything over max_length\n    max_length=128,\n    return_tensors=\"pt\",                # return torch tensors\n)\nprint(batch[\"input_ids\"].shape)         # (3, T)\nprint(batch[\"attention_mask\"].shape)    # (3, T) — 1 for real tokens, 0 for PAD\n# Decode roundtrips back to text\nprint(tok.decode(batch[\"input_ids\"][0], skip_special_tokens=True))"
                  },
                  {
                            "tier": "senior",
                            "code": "# === SENIOR EXAMPLE ===\n# TASK      - Advanced usage of Subword Tokenization — performance, edge cases, and expert patterns.\n# APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n# STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n# WEAKNESSES- Complex; requires deep knowledge to understand and maintain.\n#\nfrom transformers import AutoTokenizer\n# 1) ALWAYS load the tokenizer from the same checkpoint as the model.\n#    Different checkpoint = different vocab = silently corrupted IDs.\nNAME = \"bert-base-uncased\"\ntok = AutoTokenizer.from_pretrained(NAME, use_fast=True)   # Rust tokenizers, ~10x faster\n# 2) Subword algorithm matrix:\n#       BPE         (GPT-2, RoBERTa)        merge most-frequent pair, byte-level\n#       WordPiece   (BERT, DistilBERT)      merge based on likelihood, \"##\" prefix\n#       SentencePiece/Unigram (T5, mT5, XLM-R)   no pre-tokenization, language-agnostic\n#    Pick whatever the pretrained model used; never mix.\n# 3) Adding domain-specific tokens (drug names, code keywords, ...).\nnew_tokens = [\"<smiles>\", \"</smiles>\", \"[REDACTED]\"]\nadded = tok.add_tokens(new_tokens)               # returns count of NEW tokens\n# After this, you must resize the model embedding:\n#   model.resize_token_embeddings(len(tok))\n# 4) Special-token discipline. tok([...]) adds [CLS]/[SEP]; tok.encode_plus too.\n#    For label sequences (token classification), use is_split_into_words=True\n#    and align labels with offset_mapping to avoid label-tokenization drift.\nout = tok([\"I love NYC\"], return_offsets_mapping=True, is_split_into_words=False)\nprint(out[\"offset_mapping\"])                      # char spans per token\n# 5) Decoding gotchas: skip_special_tokens=True is usually what you want;\n#    leave clean_up_tokenization_spaces at default (True) for model-faithful output.\n# Decision rule:\n#   pretrained model on standard text         -> AutoTokenizer.from_pretrained(MODEL)\n#   training a new tokenizer from scratch     -> tokenizers library, BPE for code, Unigram for multilingual\n#   adding domain words                        -> add_tokens + resize_token_embeddings\n#   token-level labels (NER, tagging)          -> is_split_into_words + offset_mapping\n#   distributed dataloader bottleneck          -> use_fast=True, multiprocessing-safe\n#\n# Anti-pattern: training your own tokenizer with a model checkpoint you didn't retrain\n#   The pretrained embedding rows are indexed by the OLD vocab. Your new IDs point\n#   to random embeddings, and the model degrades to garbage. Either retrain the\n#   embeddings (resize + warm-up) or keep the original tokenizer."
                  }
        ],
        tips: [
                  "Subword tokenization handles OOV and rare words well",
                  "WordPiece (BERT), BPE (GPT), SentencePiece common algorithms",
                  "Always use matching tokenizer with pretrained model"
        ],
        mistake: "Using custom tokenizer vocab different from pretrained model causes wrong embeddings.",
        shorthand: {
          verbose: "result = []\nfor x in items:\n    if x > 0:\n        result.append(x)",
          concise: "result = [x for x in items if x > 0]",
        },
      },
    ],
  },
]

export default { meta, sections }
