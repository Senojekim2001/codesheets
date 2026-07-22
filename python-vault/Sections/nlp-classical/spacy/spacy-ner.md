---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "spacy"
id: "spacy-ner"
title: "spaCy NER — named entities, rule-based, custom training"
category: "spaCy"
subtitle: "doc.ents, ent.label_ / ent.text, EntityRuler, PhraseMatcher, custom training via spacy train, Prodigy for annotation, score thresholding"
signature_short: "doc = nlp(\"Apple bought Beats in 2014\"); [(ent.text, ent.label_) for ent in doc.ents]"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "spaCy NER — named entities, rule-based, custom training"
  - "spacy-ner"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/spacy"
  - "category/spacy"
  - "tier/tiered"
---

# spaCy NER — named entities, rule-based, custom training

> doc.ents, ent.label_ / ent.text, EntityRuler, PhraseMatcher, custom training via spacy train, Prodigy for annotation, score thresholding

## Overview

spaCy's built-in NER recognizes ~18 entity types out of the box (PERSON, ORG, GPE, DATE, MONEY, PRODUCT, EVENT, etc.). For domain-specific entities (drug names, ticker symbols, internal product codes), three options of increasing investment: (a) `EntityRuler` adds rule-based patterns to the pipeline; (b) `PhraseMatcher` matches a list of strings; (c) train a custom NER component with spaCy's training pipeline. The three examples solve the SAME concrete task — extract company mentions from text — at three depths: built-in NER → EntityRuler with custom company list → custom-trained NER component for domain-specific entities.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Extract company / org mentions from text.
- **Junior** — SAME — but recognize OUR custom company list reliably (e.g., "OpenAI", "Anthropic" might miss; ticker symbols definitely will).
- **Senior** — SAME — but train a CUSTOM NER for domain-specific labels (e.g., DRUG, GENE, internal product codes).

## Signature

```python
doc = nlp("Apple bought Beats in 2014"); [(ent.text, ent.label_) for ent in doc.ents]
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Extract company / org mentions from text.
import spacy

nlp = spacy.load("en_core_web_sm")
doc = nlp("Apple bought Beats Electronics in 2014 for $3 billion. Tim Cook announced the deal.")

for ent in doc.ents:
    print(f"{ent.text:25} {ent.label_:10} ({ent.start_char}-{ent.end_char})")
# Apple                     ORG        (0-5)
# Beats Electronics         ORG        (12-29)
# 2014                      DATE       (33-37)
# $3 billion                MONEY      (42-52)
# Tim Cook                  PERSON     (54-62)

# Common entity labels (en_core_web_sm):
#   PERSON   - people, including fictional
#   ORG      - companies, agencies, institutions
#   GPE      - countries, cities, states
#   DATE     - absolute or relative dates
#   MONEY    - monetary values
#   PRODUCT  - objects, vehicles, foods (not services)
#   EVENT    - named events
#   LAW      - named documents made into laws
#   PERCENT  - percentage values

# Filter to just orgs:
orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but recognize OUR custom company list reliably
#             (e.g., "OpenAI", "Anthropic" might miss; ticker symbols
#             definitely will).
import spacy
from spacy.pipeline import EntityRuler

nlp = spacy.load("en_core_web_sm")

# === EntityRuler — pattern-based; runs BEFORE statistical NER ===
ruler = nlp.add_pipe("entity_ruler", before="ner")

# Two pattern types:
patterns = [
    # 1. Phrase patterns — match exact strings
    {"label": "ORG", "pattern": "OpenAI"},
    {"label": "ORG", "pattern": "Anthropic"},
    {"label": "ORG", "pattern": "Hugging Face"},
    {"label": "ORG", "pattern": "DeepMind"},

    # 2. Token patterns — match by token attributes
    {"label": "TICKER", "pattern": [{"TEXT": {"REGEX": "^\\$[A-Z]{1,5}$"}}]},  # $AAPL, $MSFT
    {"label": "TICKER", "pattern": [
        {"IS_UPPER": True, "LENGTH": {"IN": [3, 4, 5]}},
        {"TEXT": "."},
    ]},                                                # NYSE-style "AAPL."
]
ruler.add_patterns(patterns)

doc = nlp("OpenAI raised $6.6B in October 2024. Compare to $MSFT or AAPL.")
for ent in doc.ents:
    print(f"{ent.text:15} {ent.label_}")
# OpenAI          ORG       <- caught by EntityRuler
# $6.6B           MONEY     <- statistical NER
# October 2024    DATE      <- statistical NER
# $MSFT           TICKER    <- regex pattern
# AAPL            TICKER    <- token pattern

# === Loading patterns from JSONL ===
# patterns.jsonl:
#   {"label": "ORG", "pattern": "OpenAI"}
#   {"label": "ORG", "pattern": "Anthropic"}
# ruler.from_disk("patterns.jsonl")

# === PhraseMatcher — for HUGE lists ===
# When you have 10k+ phrases, EntityRuler is slow; PhraseMatcher
# uses a Trie internally.
from spacy.matcher import PhraseMatcher

matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
companies = ["OpenAI", "Anthropic", "Google DeepMind", "Hugging Face"] * 1000
matcher.add("COMPANY", [nlp.make_doc(c) for c in companies])

def find_companies(text: str) -> list[tuple[str, int, int]]:
    doc = nlp(text)
    matches = matcher(doc)
    return [(doc[start:end].text, start, end) for _, start, end in matches]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but train a CUSTOM NER for domain-specific labels
#             (e.g., DRUG, GENE, internal product codes).
import spacy
from spacy.tokens import DocBin
from spacy.training import Example
from pathlib import Path

# === Step 1: prepare training data ===
# Format: list of (text, {"entities": [(start, end, label), ...]})
TRAIN_DATA = [
    ("Patient was prescribed acetaminophen 500mg.",
     {"entities": [(23, 36, "DRUG"), (37, 41, "DOSAGE")]}),
    ("Started ibuprofen 200mg twice daily.",
     {"entities": [(8, 17, "DRUG"), (18, 23, "DOSAGE")]}),
    # ... need 100s for usable accuracy; 1000s for production
]

# === Step 2: convert to spaCy binary format ===
def make_docbin(data, output: Path) -> None:
    nlp_blank = spacy.blank("en")
    db = DocBin()
    for text, annotations in data:
        doc = nlp_blank.make_doc(text)
        ents = []
        for start, end, label in annotations["entities"]:
            span = doc.char_span(start, end, label=label, alignment_mode="contract")
            if span is not None:
                ents.append(span)
        doc.ents = ents
        db.add(doc)
    db.to_disk(output)

# make_docbin(TRAIN_DATA, Path("./train.spacy"))
# make_docbin(DEV_DATA, Path("./dev.spacy"))

# === Step 3: train via CLI ===
# 1. Generate config:
#    $ python -m spacy init config config.cfg --lang en --pipeline ner
# 2. Edit config.cfg if needed (epochs, dropout, etc.)
# 3. Train:
#    $ python -m spacy train config.cfg \
#        --paths.train ./train.spacy \
#        --paths.dev ./dev.spacy \
#        --output ./models
# 4. Best model lands in ./models/model-best/

# === Step 4: load + use the trained model ===
nlp_custom = spacy.load("./models/model-best")

doc = nlp_custom("Patient took acetaminophen 500mg and ibuprofen 200mg.")
for ent in doc.ents:
    print(f"{ent.text:20} {ent.label_:10}")

# === Step 5: combine with built-in NER ===
# Often you want BOTH custom DRUG/DOSAGE and built-in PERSON/DATE.
# Two approaches:
#  (a) Train custom on top of en_core_web_sm (--gpu-id 0 --vectors en_core_web_md)
#  (b) Run built-in NER first; then add EntityRuler/custom on top

nlp = spacy.load("en_core_web_sm")
# Add custom NER as a separate pipeline component:
# (custom_ner is the trained component from above)
# nlp.add_pipe("ner", source=nlp_custom, name="custom_ner", after="ner")

# Decision rule:
#   built-in entity types (PERSON, ORG, ...)  -> spacy.load + doc.ents
#   small custom list (10-1000 phrases)        -> EntityRuler with patterns
#   huge phrase list (10k+)                     -> PhraseMatcher (Trie-based)
#   novel domain (drugs, genes, codes)         -> custom-trained NER component
#   high-recall + structured                    -> rule-based first, ML for fuzziness
#   low-resource language                       -> xx_* multilingual model (NER-only)
#   tag overlapping spans                        -> Span Categorizer (spancat) instead of NER
#   confidence per entity                        -> span.score (with parser_max_length config)
#   active learning / annotation                 -> Prodigy (paid; spaCy's annotation tool)
#   evaluate accuracy                             -> spacy evaluate model.spacy dev.spacy
#
# Anti-pattern: training a custom NER from 10 examples and shipping
# it. NER models need 100s of examples per entity type to be reliable;
# 10 examples produces a model that overfits to those exact strings.
# Either: (a) use rule-based EntityRuler if your entities are
# exhaustive, OR (b) annotate 100+ examples per type before training.
```

## Decision Rule

```text
built-in entity types (PERSON, ORG, ...)  -> spacy.load + doc.ents
small custom list (10-1000 phrases)        -> EntityRuler with patterns
huge phrase list (10k+)                     -> PhraseMatcher (Trie-based)
novel domain (drugs, genes, codes)         -> custom-trained NER component
high-recall + structured                    -> rule-based first, ML for fuzziness
low-resource language                       -> xx_* multilingual model (NER-only)
tag overlapping spans                        -> Span Categorizer (spancat) instead of NER
confidence per entity                        -> span.score (with parser_max_length config)
active learning / annotation                 -> Prodigy (paid; spaCy's annotation tool)
evaluate accuracy                             -> spacy evaluate model.spacy dev.spacy
```

## Anti-Pattern

> [!warning] Anti-pattern
> training a custom NER from 10 examples and shipping
> it. NER models need 100s of examples per entity type to be reliable;
> 10 examples produces a model that overfits to those exact strings.
> Either: (a) use rule-based EntityRuler if your entities are
> exhaustive, OR (b) annotate 100+ examples per type before training.

## Tips

- Built-in NER recognizes ~18 entity types out of the box. Check `spacy.explain("ORG")` for documentation on each label.
- For small custom phrase lists, `EntityRuler` (`nlp.add_pipe("entity_ruler", before="ner")`) is the right tool — patterns + statistical NER combined.
- For huge phrase lists (10k+), `PhraseMatcher` is much faster than EntityRuler — uses a Trie internally.
- Custom NER training needs 100s of examples per entity type minimum. Below that, you're overfitting.
- Use `alignment_mode="contract"` when converting char-span annotations — handles tokenization mismatches gracefully (rounds to nearest token boundary).
- `Span Categorizer` (`spancat`) handles overlapping spans (e.g., "United States" can be both ORG and GPE); standard NER doesn't support overlap.

## Common Mistake

> [!warning] Training a custom NER from 10 examples and shipping it. Models need 100s of examples per entity type to be reliable; 10 examples produces a model that overfits to those exact strings and fails on slight variations. Use rule-based `EntityRuler` until you have 100+ examples per type.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Train custom NER on 10 examples → overfits, breaks in prod
TRAIN = [(text, {"entities": [...]}) for text in ten_examples]
```

**Senior:**
```python
# Use EntityRuler until you have 100+ annotations per type
ruler = nlp.add_pipe("entity_ruler", before="ner")
ruler.add_patterns([{"label": "DRUG", "pattern": "acetaminophen"}, ...])
```

## See Also

- [[Sections/nlp-classical/spacy/spacy-pipeline|spaCy pipeline — load model, tokenize, POS, lemma (Classical NLP)]]
- [[Sections/nlp-classical/spacy/spacy-matcher-patterns|spaCy Matcher — token + dependency pattern matching (Classical NLP)]]
- [[Sections/nlp-classical/spacy/_Index|Classical NLP → spaCy — pipelines, NER, Matcher]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
