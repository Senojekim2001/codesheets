---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "patterns"
id: "classical-vs-llm"
title: "Classical NLP vs LLM — when each wins"
category: "Patterns"
subtitle: "classification baseline (TF-IDF + LR), latency / cost / interpretability tradeoffs, hybrid: classical filter + LLM, embedding + classifier"
signature_short: "when classical wins: latency < 10ms, cost < $0.0001/req, deterministic, interpretable, < 100k examples"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Classical NLP vs LLM — when each wins"
  - "classical-vs-llm"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# Classical NLP vs LLM — when each wins

> classification baseline (TF-IDF + LR), latency / cost / interpretability tradeoffs, hybrid: classical filter + LLM, embedding + classifier

## Overview

The temptation: "use an LLM for everything". The reality: for a binary classification task with 10k labeled examples, TF-IDF + LogisticRegression beats GPT-4 in latency (1ms vs 500ms), cost ($0 vs $0.001/request), interpretability (top features visible), and often accuracy. LLMs win on zero-shot tasks, complex reasoning, generative work, and few-shot adaptation. The right architecture is often hybrid: classical model handles the 99% common case; LLM handles the 1% edge cases. The three examples solve the SAME concrete task — classify support tickets into 50 categories with 100k labeled examples — at three depths: TF-IDF + LR baseline → fine-tuned transformer → hybrid (classical filter + LLM fallback).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Classify support tickets into 50 categories.
- **Junior** — SAME — but use sentence embeddings + classifier when classical baseline plateaus.
- **Senior** — SAME — production hybrid: TF-IDF baseline routes high-confidence tickets; LLM handles low-confidence / novel categories.

## Signature

```python
when classical wins: latency < 10ms, cost < $0.0001/req, deterministic, interpretable, < 100k examples
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Classify support tickets into 50 categories.
# APPROACH  - TF-IDF + LogisticRegression baseline. Fast, cheap.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

pipe = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
    ("clf",   LogisticRegression(max_iter=2000, class_weight="balanced")),
])
pipe.fit(X_train, y_train)
print(classification_report(y_test, pipe.predict(X_test)))

# Profile:
#   Train time:    ~30 seconds on 100k examples
#   Inference:     ~1ms per request
#   Cost:          $0 (just CPU)
#   Model size:    ~50MB (joblib)
#   F1-macro:      typically 0.75-0.85 on well-defined categories

# Compare to LLM:
#   GPT-4 inference: ~500-1500ms per request
#   Cost: ~$0.001 per classification (input tokens)
#   F1-macro: maybe 0.80-0.90 (zero-shot or few-shot)
#   ... but no fine-tuning needed, no labeled data needed

# When classical baseline is the right answer:
#   - You have >5k labeled examples
#   - Latency matters (real-time)
#   - High volume (>100 req/sec) makes LLM cost prohibitive
#   - Categories are well-defined, not subjective
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but use sentence embeddings + classifier when
#             classical baseline plateaus.
from sentence_transformers import SentenceTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import numpy as np

# === Step 1: encode docs into embeddings ===
encoder = SentenceTransformer("all-MiniLM-L6-v2")     # 22MB, fast, 384-dim
X_train_emb = encoder.encode(X_train, show_progress_bar=True, batch_size=64)
X_test_emb  = encoder.encode(X_test,  show_progress_bar=True, batch_size=64)

# === Step 2: classifier on top of embeddings ===
clf = LogisticRegression(max_iter=2000, class_weight="balanced", C=1.0)
clf.fit(X_train_emb, y_train)
print(classification_report(y_test, clf.predict(X_test_emb)))

# Profile:
#   Embed training set: ~30 seconds for 100k docs (CPU); ~5s on GPU
#   Embed inference:    ~10-50ms per request (CPU); ~1ms (GPU)
#   Train classifier:   ~10s
#   Cost:                $0 if self-hosted; ~$0.0001/req for hosted embeddings
#   F1-macro:            typically +5-10% over TF-IDF baseline

# When embeddings beat TF-IDF:
#   - Subtle semantic distinctions (paraphrases, synonyms)
#   - Cross-domain / multi-domain data
#   - Need cross-lingual transfer (use multilingual encoder)
#   - Few labels (embeddings + LR works with 100s of examples)

# === Comparison ===
# Method                Latency    Cost/req    F1     Setup
# TF-IDF + LR           1ms        $0          0.78   joblib + sklearn
# Embedding + LR        20ms       $0.0001     0.84   sentence-transformers
# Fine-tuned BERT       50ms (GPU) $0.0005     0.87   training pipeline
# GPT-4 zero-shot       1000ms     $0.002      0.83   prompt design
# GPT-4 few-shot        1200ms     $0.005      0.88   examples + prompt
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production hybrid: TF-IDF baseline routes high-confidence
#             tickets; LLM handles low-confidence / novel categories.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
import joblib
import numpy as np

# === Tier 1: classical classifier ===
def train_classical(X_train, y_train):
    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, sublinear_tf=True)),
        ("clf",   LogisticRegression(max_iter=2000, class_weight="balanced", C=1.0)),
    ])
    pipe.fit(X_train, y_train)
    return pipe

# === Tier 2: LLM fallback ===
def llm_classify(text: str, allowed_labels: list[str]) -> tuple[str, float]:
    """Use LLM when classical model is uncertain. Returns (label, confidence)."""
    # In production: call OpenAI / Anthropic with prompt template.
    # Here, sketch the structure:
    prompt = f"Classify this ticket into one of: {allowed_labels}\n\n{text}\n\nLabel:"
    # response = openai.chat.completions.create(...)
    # return parse_label_and_confidence(response)
    return ("billing", 0.95)                           # placeholder

# === Routing logic ===
class HybridClassifier:
    def __init__(self, classical_model, *, confidence_threshold: float = 0.7):
        self.classical = classical_model
        self.threshold = confidence_threshold
        self.labels = list(classical_model.classes_)

    def predict(self, text: str) -> dict:
        # Classical first.
        proba = self.classical.predict_proba([text])[0]
        top_idx = np.argmax(proba)
        confidence = proba[top_idx]
        classical_label = self.labels[top_idx]

        if confidence >= self.threshold:
            return {
                "label": classical_label,
                "confidence": float(confidence),
                "tier": "classical",
                "cost_units": 0,
            }

        # Fallback to LLM for uncertain cases.
        llm_label, llm_conf = llm_classify(text, self.labels)
        return {
            "label": llm_label,
            "confidence": llm_conf,
            "tier": "llm",
            "cost_units": 1,
            "classical_top": classical_label,
            "classical_confidence": float(confidence),
        }

# === Track which tier handles what % of traffic ===
# In production, log tier per request; alert if LLM tier > 20%
# (means classical is degrading; retrain).

# Decision rule:
# Question                              Classical wins        LLM wins
# -------------------------------------------------------------------
# Latency requirement < 50ms             ✓                    ✗
# Cost per request > $0.0001 OK?         ✗                    ✓
# Have >5k labeled examples?             ✓                    ✗ (LLM zero-shot)
# Categories change frequently?          ✗ (retrain)          ✓
# Need explainable decisions?            ✓ (top features)     ✗
# Need few-shot adaptation?              ✗                    ✓
# Reasoning / extraction / summarization ✗                    ✓
# Multilingual without retraining        ✗ (per-lang)         ✓
# Adversarial inputs                     ✓ (deterministic)    ✗
# > 1000 req/sec                          ✓                    ✗ (cost)
# Subjective tasks (creativity, taste)   ✗                    ✓
#
# Hybrid wins when:
#   - High volume (cost matters) AND some hard cases (LLM helps)
#   - Need fast common path (classical) but want LLM safety net
#   - Categories are 80% well-defined, 20% ambiguous
#
# Anti-pattern: replacing a working TF-IDF + LR baseline with GPT-4
# because "GPT-4 is better". For binary or small-multiclass tasks
# with 5k+ labels, the classical baseline often matches or beats
# zero-shot LLM accuracy at 1/1000 the cost and 1/100 the latency.
# Measure both; pick by accuracy * cost * latency, not by hype.
```

## Decision Rule

```text
Question                              Classical wins        LLM wins
-------------------------------------------------------------------
Latency requirement < 50ms             ✓                    ✗
Cost per request > $0.0001 OK?         ✗                    ✓
Have >5k labeled examples?             ✓                    ✗ (LLM zero-shot)
Categories change frequently?          ✗ (retrain)          ✓
Need explainable decisions?            ✓ (top features)     ✗
Need few-shot adaptation?              ✗                    ✓
Reasoning / extraction / summarization ✗                    ✓
Multilingual without retraining        ✗ (per-lang)         ✓
Adversarial inputs                     ✓ (deterministic)    ✗
> 1000 req/sec                          ✓                    ✗ (cost)
Subjective tasks (creativity, taste)   ✗                    ✓

Hybrid wins when:
  - High volume (cost matters) AND some hard cases (LLM helps)
  - Need fast common path (classical) but want LLM safety net
  - Categories are 80% well-defined, 20% ambiguous
```

## Anti-Pattern

> [!warning] Anti-pattern
> replacing a working TF-IDF + LR baseline with GPT-4
> because "GPT-4 is better". For binary or small-multiclass tasks
> with 5k+ labels, the classical baseline often matches or beats
> zero-shot LLM accuracy at 1/1000 the cost and 1/100 the latency.
> Measure both; pick by accuracy * cost * latency, not by hype.

## Tips

- Always run a classical baseline (TF-IDF + LogisticRegression) BEFORE reaching for transformers or LLMs. ~30 minutes of work; sets the bar.
- For tasks with >5k labels, classical or fine-tuned models almost always beat zero-shot LLM in accuracy AND cost.
- Sentence embeddings + linear classifier is the middle path: 5-10% F1 over TF-IDF, 50-100× faster than full LLM, runs on CPU.
- Use LLMs when you have <100 labeled examples (few-shot wins), when categories change frequently (no retraining), or for generative/reasoning tasks.
- Hybrid architectures (classical baseline + LLM fallback for low-confidence) capture both worlds — fast common path, LLM for hard cases.
- Track tier-handling rate in production. If LLM-tier > 20% over time, the classical model is drifting — retrain.

## Common Mistake

> [!warning] Replacing a working classical baseline with GPT-4 because "LLMs are better". For binary or small-multiclass classification with 5k+ labeled examples, TF-IDF + LR often matches or beats zero-shot LLM at 1/1000 the cost and 1/100 the latency. Measure both; pick by accuracy × cost × latency, not by hype.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Replace working classical pipeline with GPT-4
def classify(text):
    response = openai.chat.completions.create(...)
    return parse_response(response)
# 500ms, $0.002/call, opaque
```

**Senior:**
```python
# Classical baseline first; measure; switch only if it loses
pipe = Pipeline([("tfidf", TfidfVectorizer()),
                  ("clf", LogisticRegression())])
pipe.fit(X, y)
# 1ms, $0, interpretable, 0.85 F1
```

## See Also

- [[Sections/dsa/algorithms/two-pointers|Two Pointers (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/sliding-window|Sliding Window (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/recursion|Recursion (Data Structures & Algos)]]
- [[Sections/dsa/algorithms/dynamic-programming|Dynamic Programming (Data Structures & Algos)]]
- [[Sections/nlp-classical/patterns/_Index|Classical NLP → NLP Patterns — cleaning, ngrams, classical-vs-LLM]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
