---
type: "entry"
domain: "python"
file: "llm-ai"
section: "prompt-engineering"
id: "fine-tuning"
title: "Fine-Tuning LLMs — When & How"
category: "Fine-Tuning"
subtitle: "JSONL, training data, LoRA, QLoRA, Hugging Face, evaluation"
signature_short: "client.fine_tuning.jobs.create(training_file, model)  |  transformers.Trainer  |  LoRA"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Fine-Tuning LLMs — When & How"
  - "fine-tuning"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/prompt-engineering"
  - "category/fine-tuning"
  - "tier/tiered"
---

# Fine-Tuning LLMs — When & How

> JSONL, training data, LoRA, QLoRA, Hugging Face, evaluation

## Overview

Fine-tuning adapts a pre-trained model to your specific task by training on your data. OpenAI fine-tuning: prepare JSONL data, upload, and train via API. Open-source fine-tuning: Hugging Face Transformers + PEFT (LoRA/QLoRA) for efficient training on consumer GPUs. LoRA adds small trainable matrices (1-5% of parameters) instead of updating the full model. Fine-tune when: you need consistent format/style, domain-specific knowledge that prompting cannot capture, or latency/cost reduction (fine-tuned small model replaces large model). Do NOT fine-tune for: tasks solvable with better prompts, RAG, or few-shot examples.

## Signature

```python
client.fine_tuning.jobs.create(training_file, model)  |  transformers.Trainer  |  LoRA
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - JSONL with messages = [system, user, assistant]; upload; create a job; use the returned model id.
# STRENGTHS - Smaller model can match a larger one on YOUR task at lower latency / cost.
# WEAKNESSES- Fine-tuning teaches STYLE and FORMAT, not facts. Use RAG for knowledge.
import json
from openai import OpenAI

client = OpenAI()

# 1) Build training data: at least ~50 examples for any signal.
data = [
    {"messages": [
        {"role": "system",    "content": "Generate Postgres SQL only."},
        {"role": "user",      "content": "Users who signed up last month"},
        {"role": "assistant", "content":
         "SELECT * FROM users WHERE created_at >= now() - interval '1 month'"},
    ]},
    # ... many more
]

# 2) Save as JSONL.
with open("train.jsonl", "w") as f:
    for ex in data:
        f.write(json.dumps(ex) + "\n")

# 3) Upload + train.
fid  = client.files.create(file=open("train.jsonl","rb"), purpose="fine-tune").id
job  = client.fine_tuning.jobs.create(training_file=fid, model="gpt-4o-mini-2024-07-18")
print(job.id)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Train/val split; validate JSONL with the SDK's helper; QLoRA for OSS models on consumer GPUs; eval before AND after.
# STRENGTHS - Train/val gap reveals over/underfitting; eval delta tells you if FT was worth it.
# WEAKNESSES- Without an eval, "looks better in a couple examples" is noise.
import json
import random
from openai import OpenAI

client = OpenAI()

# 1) Stratified split (preserve class balance for classification tasks).
def split(data: list[dict], val_frac: float = 0.1, seed: int = 42) -> tuple[list, list]:
    random.Random(seed).shuffle(data)
    n_val = max(1, int(len(data) * val_frac))
    return data[n_val:], data[:n_val]

train, val = split(json.loads(open("all.jsonl").read()))

def write_jsonl(path: str, rows: list[dict]) -> None:
    with open(path, "w") as f:
        for r in rows: f.write(json.dumps(r) + "\n")

write_jsonl("train.jsonl", train); write_jsonl("val.jsonl", val)

# 2) Upload both; the API uses validation_file to log val loss per epoch.
train_id = client.files.create(file=open("train.jsonl","rb"), purpose="fine-tune").id
val_id   = client.files.create(file=open("val.jsonl","rb"),   purpose="fine-tune").id

job = client.fine_tuning.jobs.create(
    training_file=train_id, validation_file=val_id,
    model="gpt-4o-mini-2024-07-18",
    hyperparameters={"n_epochs": "auto",
                     "batch_size": "auto",
                     "learning_rate_multiplier": "auto"},
    suffix="sql-gen-v1",                      # tag the model id
)
print(job.id, job.fine_tuned_model)            # second is None until succeeded

# 3) OSS option (sketch): QLoRA on a single 24GB GPU.
# from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
# from peft import LoraConfig, get_peft_model
# from trl  import SFTTrainer, SFTConfig
#
# bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4",
#                          bnb_4bit_compute_dtype="bfloat16")
# tok = AutoTokenizer.from_pretrained("meta-llama/Llama-3.1-8B-Instruct")
# m   = AutoModelForCausalLM.from_pretrained(
#         "meta-llama/Llama-3.1-8B-Instruct", quantization_config=bnb, device_map="auto")
# m   = get_peft_model(m, LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05,
#                                    target_modules=["q_proj","k_proj","v_proj","o_proj"],
#                                    task_type="CAUSAL_LM"))
# SFTTrainer(m, train_dataset=..., args=SFTConfig(output_dir="./out", num_train_epochs=3,
#                                                  per_device_train_batch_size=4,
#                                                  learning_rate=2e-4)).train()
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Decide BEFORE training if FT is the right tool; instrument: golden eval + cost/latency target; prefer LoRA on OSS to keep optionality; treat fine-tuning as part of MLOps, not a one-off.
# STRENGTHS - Predictable wins: latency reduction, format conformance, narrow-task accuracy lifts.
# WEAKNESSES- Drift: if your prompts or upstream model change, the FT may need to be re-run; budget for periodic refreshes.
from __future__ import annotations
import json
from dataclasses import dataclass

# 1) Decision matrix -- before you pay for compute, answer these questions.
DECIDE_TO_FINETUNE = """
Use fine-tuning when:
  ✓ A frontier model can do it with a 5-shot prompt, but cost/latency are too high.
  ✓ Output FORMAT must be exact (JSON shape, internal grammar, terse style).
  ✓ Domain language differs from the public web (private vocabulary, jargon).

Do NOT fine-tune when:
  ✗ The information is FACTUAL/dynamic -- use RAG.
  ✗ You don't have 50+ high-quality (input, expected) pairs.
  ✗ You haven't yet maxed out prompt engineering + few-shot.
  ✗ You have no eval set to tell better from worse.
"""

# 2) Eval harness: SAME inputs, run baseline vs candidate, log (acc, latency, $).
@dataclass
class EvalRow:
    input: str
    expected: str        # exact-match for extraction; rubric-graded for open-ended.

def grade(pred: str, expected: str) -> bool:
    # Exact match for structured output. For natural language, use a judge LLM.
    return pred.strip() == expected.strip()

def evaluate(model_id: str, rows: list[EvalRow], call) -> dict[str, float]:
    import time
    correct = 0; total_latency = 0.0
    for r in rows:
        t0 = time.perf_counter()
        pred = call(model_id, r.input)
        total_latency += time.perf_counter() - t0
        correct += int(grade(pred, r.expected))
    return {"accuracy": correct / max(len(rows), 1),
            "p50_latency_ms": (total_latency / len(rows)) * 1000}

# 3) Hyperparameter discipline.
HP_BASELINES = {
    "epochs":          (1, 4),                # under 4; over-training kills generalization
    "lr_multiplier":   (0.5, 2.0),           # sweep around defaults; not orders of magnitude
    "batch_size":      ("auto", None),       # let the platform pick; tune only if loss is unstable
    "examples_floor":  50,                    # below this, RAG / few-shot wins
    "examples_target": 500,                   # diminishing returns past this for narrow tasks
}

# 4) Production deployment: pin the model id, monitor drift.
@dataclass
class FTDeployment:
    base_model: str               # "gpt-4o-mini-2024-07-18"
    ft_model:   str               # "ft:gpt-4o-mini-2024-07-18:org::abc123"
    train_set_hash: str           # sha256 of train.jsonl
    eval_score:  float            # accuracy on golden eval
    deployed_at: str              # ISO timestamp

# 5) Refresh playbook (every 6-12 weeks):
#    a) Re-run the eval against the CURRENT base + frontier models.
#    b) If a base model now matches/exceeds your FT, retire the FT.
#    c) Otherwise, append new examples (especially failure cases from prod
#       traces) and re-train. Keep the previous FT id for rollback.

# 6) Cost control: a small FT model often replaces a large general model.
#    Track $ saved / week vs training cost amortized over (cycle_days).

# Decision rule:
#   need facts / fresh data                  -> RAG, NOT fine-tuning
#   need format / style / brevity             -> fine-tune; 200-500 examples often enough
#   need to lower latency / cost              -> fine-tune a small model on the larger model's outputs (distillation)
#   eval set < 30 cases                       -> stop; build the eval first
#   training data is "logs we have"           -> NO; clean+label or you'll fit noise
#   open weights required (privacy / cost)    -> QLoRA on Llama / Mistral / Qwen with TRL
#   reasoning-heavy task                       -> reasoning models (o-series) before FT
#   need controllable refusals                  -> RLHF/DPO on a preference set, not plain SFT
#   want to deploy quickly                     -> OpenAI fine-tuning; least ops overhead
#
# Anti-pattern: fine-tuning to "teach the model our docs". The model memorizes
# fragments unevenly, hallucinates the rest, and you can't update without
# retraining. Use RAG. Fine-tune for SHAPE (style, format), use RAG for STATE
# (facts, prices, dates, customer data).
```

## Decision Rule

```text
need facts / fresh data                  -> RAG, NOT fine-tuning
need format / style / brevity             -> fine-tune; 200-500 examples often enough
need to lower latency / cost              -> fine-tune a small model on the larger model's outputs (distillation)
eval set < 30 cases                       -> stop; build the eval first
training data is "logs we have"           -> NO; clean+label or you'll fit noise
open weights required (privacy / cost)    -> QLoRA on Llama / Mistral / Qwen with TRL
reasoning-heavy task                       -> reasoning models (o-series) before FT
need controllable refusals                  -> RLHF/DPO on a preference set, not plain SFT
want to deploy quickly                     -> OpenAI fine-tuning; least ops overhead
```

## Anti-Pattern

> [!warning] Anti-pattern
> fine-tuning to "teach the model our docs". The model memorizes
> fragments unevenly, hallucinates the rest, and you can't update without
> retraining. Use RAG. Fine-tune for SHAPE (style, format), use RAG for STATE
> (facts, prices, dates, customer data).

## Tips

- Start with prompt engineering + RAG before fine-tuning — 80% of tasks are solved without fine-tuning.
- 50-100 high-quality examples is the minimum for OpenAI fine-tuning. 500+ examples for significant quality gains.
- QLoRA (4-bit quantization + LoRA) fine-tunes a 7B model on a single 24GB GPU — no A100 needed.
- Always hold out a test set (10-20%) and evaluate before/after fine-tuning to measure actual improvement.
- Distillation pattern: fine-tune a small model on a frontier model's outputs to slash latency and cost while keeping accuracy. Schedule a refresh every 6-12 weeks — re-evaluate against current base models; if a base now matches your FT, retire it.

## Common Mistake

> [!warning] Fine-tuning to inject knowledge (facts, docs) — fine-tuning teaches style and format, not facts. Use RAG for knowledge. Fine-tune for: consistent output format, domain-specific language, or replacing a large model with a specialized small one.

## Shorthand (Junior → Senior)

**Junior:**
```python
training_data = [{"messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
]} for item in data_items]
with open("training.jsonl", "w") as f:
    for item in training_data:
        f.write(json.dumps(item) + "\n")
```

**Senior:**
```python
# Prepare JSONL with system/user/assistant messages
# Then: client.fine_tuning.jobs.create(training_file=file_id, model="..."
```

## See Also

- [[Sections/llm-ai/prompt-engineering/_Index|LLMs & AI Engineering → Prompt Engineering & Fine-Tuning]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
