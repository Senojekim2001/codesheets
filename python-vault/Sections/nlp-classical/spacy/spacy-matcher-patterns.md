---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "spacy"
id: "spacy-matcher-patterns"
title: "spaCy Matcher — token + dependency pattern matching"
category: "spaCy"
subtitle: "Matcher (token patterns), DependencyMatcher (syntactic), span groups, regex in patterns, OP=? / + / *, custom callbacks"
signature_short: "matcher = Matcher(nlp.vocab); matcher.add(\"VERB_NOUN\", [[{\"POS\": \"VERB\"}, {\"POS\": \"NOUN\"}]])"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "spaCy Matcher — token + dependency pattern matching"
  - "spacy-matcher-patterns"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/spacy"
  - "category/spacy"
  - "tier/tiered"
---

# spaCy Matcher — token + dependency pattern matching

> Matcher (token patterns), DependencyMatcher (syntactic), span groups, regex in patterns, OP=? / + / *, custom callbacks

## Overview

`Matcher` matches token-level patterns: "find ADJECTIVE NOUN", "find a verb followed by 2+ adjectives", "find tokens matching this regex". `DependencyMatcher` matches syntactic structure: "find subject of any verb where subject is a PERSON". These are deterministic — same input always produces the same output, useful when you need explainable extraction. The three examples solve the SAME concrete task — extract "Person VERB Object" relations from sentences ("Apple acquired Beats", "Microsoft bought GitHub") — at three depths: simple Matcher token pattern → quantifiers + spans → DependencyMatcher for syntactic relations.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Find PERSON/ORG followed by an acquisition verb.
- **Junior** — SAME — match more flexibly: optional adjectives, multi-word organizations, capture full ORG span.
- **Senior** — SAME — but use DependencyMatcher to match syntactic relations (subject of VERB is ORG; object of VERB is ORG) which is robust to word order and intervening modifiers.

## Signature

```python
matcher = Matcher(nlp.vocab); matcher.add("VERB_NOUN", [[{"POS": "VERB"}, {"POS": "NOUN"}]])
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Find PERSON/ORG followed by an acquisition verb.
import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Pattern: ORG/PERSON entity followed by an acquisition verb.
pattern = [
    {"ENT_TYPE": {"IN": ["ORG", "PERSON"]}},
    {"LEMMA": {"IN": ["acquire", "buy", "purchase"]}},
]
matcher.add("ACQUISITION", [pattern])

doc = nlp("Apple acquired Beats. Microsoft bought GitHub. Larry Page sold his shares.")
for match_id, start, end in matcher(doc):
    span = doc[start:end]
    print(f"Match: '{span.text}'")
# Match: 'Apple acquired'
# Match: 'Microsoft bought'

# Token attributes you can match on:
#   TEXT, LOWER, LEMMA  - the surface / lowercase / lemma
#   POS, TAG, DEP        - linguistic features
#   ENT_TYPE             - entity label (after NER runs)
#   IS_ALPHA, IS_DIGIT, IS_PUNCT, LIKE_NUM
#   LENGTH, SHAPE        - "AAA999" pattern
#   REGEX                - custom regex match
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — match more flexibly: optional adjectives,
#             multi-word organizations, capture full ORG span.
import spacy
from spacy.matcher import Matcher

nlp = spacy.load("en_core_web_sm")
matcher = Matcher(nlp.vocab)

# Pattern: ORG (one OR more tokens) + optional adjective + acquire-verb + ORG
# Quantifiers:
#   "?"  - 0 or 1
#   "*"  - 0 or more
#   "+"  - 1 or more
#   "!"  - never
pattern = [
    {"ENT_TYPE": "ORG", "OP": "+"},                   # 1+ ORG tokens
    {"POS": "ADV", "OP": "?"},                          # optional adverb (e.g., "successfully")
    {"LEMMA": {"IN": ["acquire", "buy", "purchase"]}},
    {"POS": "DET", "OP": "?"},                          # optional 'the'
    {"ENT_TYPE": "ORG", "OP": "+"},                   # 1+ ORG tokens
]
matcher.add("ACQUISITION", [pattern])

text = "Apple Inc. successfully acquired Beats Electronics. Microsoft bought the GitHub platform."
doc = nlp(text)

for match_id, start, end in matcher(doc):
    span = doc[start:end]
    # Find the boundary between subject and object.
    verb_idx = next(i for i, tok in enumerate(span) if tok.lemma_ in ("acquire", "buy", "purchase"))
    subj = span[:verb_idx]
    obj  = span[verb_idx+1:]
    print(f"  {subj.text}  ->  {obj.text}")
# Apple Inc.  ->  Beats Electronics
# Microsoft   ->  the GitHub platform

# === Span groups for overlapping matches ===
from spacy.tokens import Doc

# Multiple matchers can share span groups via doc.spans["my_group"]
doc.spans["acquisitions"] = [doc[start:end] for _, start, end in matcher(doc)]
print(doc.spans["acquisitions"])
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but use DependencyMatcher to match syntactic
#             relations (subject of VERB is ORG; object of VERB is ORG)
#             which is robust to word order and intervening modifiers.
import spacy
from spacy.matcher import DependencyMatcher

nlp = spacy.load("en_core_web_sm")
dep_matcher = DependencyMatcher(nlp.vocab)

# Pattern: a verb whose nsubj is an ORG and whose dobj is an ORG.
pattern = [
    # Anchor: an acquisition verb.
    {"RIGHT_ID": "verb",
     "RIGHT_ATTRS": {"LEMMA": {"IN": ["acquire", "buy", "purchase"]}, "POS": "VERB"}},
    # Subject of that verb (nsubj) — must be ORG.
    {"LEFT_ID": "verb",
     "REL_OP": ">",                                    # immediate child
     "RIGHT_ID": "subject",
     "RIGHT_ATTRS": {"DEP": "nsubj", "ENT_TYPE": "ORG"}},
    # Object of that verb (dobj) — must be ORG.
    {"LEFT_ID": "verb",
     "REL_OP": ">",
     "RIGHT_ID": "object",
     "RIGHT_ATTRS": {"DEP": "dobj", "ENT_TYPE": "ORG"}},
]
dep_matcher.add("ACQUISITION_REL", [pattern])

doc = nlp("In 2014, Apple successfully acquired Beats Electronics for $3 billion.")
for match_id, token_ids in dep_matcher(doc):
    # token_ids gives indices in the order matching the pattern (verb, subject, object).
    verb, subj, obj = (doc[i] for i in token_ids)
    # Expand to full noun phrase for subject/object.
    subj_span = doc[subj.left_edge.i:subj.right_edge.i + 1]
    obj_span  = doc[obj.left_edge.i:obj.right_edge.i + 1]
    print(f"  {subj_span.text}  --[{verb.lemma_}]-->  {obj_span.text}")
# Apple  --[acquire]-->  Beats Electronics

# === REL_OP reference ===
#   "<"   - immediate parent (head)
#   ">"   - immediate child
#   "<<"  - any ancestor
#   ">>"  - any descendant
#   "."   - immediately following (left to right in surface order)
#   ".*"  - any token following
#   ";"   - immediately preceding
#   ";*"  - any token preceding

# Decision rule:
#   match by surface tokens               -> Matcher; fast, simple
#   match across word order / modifiers   -> DependencyMatcher; needs parser
#   match overlapping spans                -> Span Categorizer (spancat)
#   regex on text                          -> {"TEXT": {"REGEX": ...}} in pattern
#   POS / lemma                            -> {"POS": "VERB"} / {"LEMMA": "buy"}
#   entity type                            -> {"ENT_TYPE": "PERSON"}
#   optional / repeating tokens            -> "OP" : "?" / "+" / "*"
#   case-insensitive                       -> {"LOWER": "..."}
#   token shape (e.g., "AAA999")           -> {"SHAPE": "Xxxx9999"}
#   complex multi-pattern logic            -> multiple matcher.add() calls;
#                                                callback for post-filter
#   spans across sentence boundary         -> not supported in Matcher; iterate doc.sents
#   needs subject-verb-object              -> DependencyMatcher (use parser)
#
# Anti-pattern: writing complex Matcher patterns when you really need
# DependencyMatcher. Token patterns can't express "the SUBJECT of
# this verb" — they only express linear sequences. A passive
# construction ("Beats was acquired by Apple") flips subject and
# object in linear order; DependencyMatcher with REL_OP=">" finds
# them by syntactic role regardless of position.
```

## Decision Rule

```text
match by surface tokens               -> Matcher; fast, simple
match across word order / modifiers   -> DependencyMatcher; needs parser
match overlapping spans                -> Span Categorizer (spancat)
regex on text                          -> {"TEXT": {"REGEX": ...}} in pattern
POS / lemma                            -> {"POS": "VERB"} / {"LEMMA": "buy"}
entity type                            -> {"ENT_TYPE": "PERSON"}
optional / repeating tokens            -> "OP" : "?" / "+" / "*"
case-insensitive                       -> {"LOWER": "..."}
token shape (e.g., "AAA999")           -> {"SHAPE": "Xxxx9999"}
complex multi-pattern logic            -> multiple matcher.add() calls;
                                             callback for post-filter
spans across sentence boundary         -> not supported in Matcher; iterate doc.sents
needs subject-verb-object              -> DependencyMatcher (use parser)
```

## Anti-Pattern

> [!warning] Anti-pattern
> writing complex Matcher patterns when you really need
> DependencyMatcher. Token patterns can't express "the SUBJECT of
> this verb" — they only express linear sequences. A passive
> construction ("Beats was acquired by Apple") flips subject and
> object in linear order; DependencyMatcher with REL_OP=">" finds
> them by syntactic role regardless of position.

## Tips

- `Matcher` for linear token patterns; `DependencyMatcher` for syntactic relations. The latter handles passive voice ("X was acquired by Y") where linear order flips.
- Token patterns support quantifiers (`OP: "?"`, `"+"`, `"*"`) — same as regex but on tokens.
- Match on `LEMMA` not `TEXT` when you want morphological variants ("buys", "bought", "buying" all match `LEMMA: "buy"`).
- For huge phrase lists (>1000), use `PhraseMatcher` (Trie-based, much faster than `Matcher` patterns).
- For overlapping spans (one token in multiple matches), assign to `doc.spans["my_group"]` — `doc.ents` doesn't allow overlap.
- Use `spacy.displacy.serve(doc, style="dep")` to visualize the dependency parse — invaluable when writing DependencyMatcher patterns.

## Common Mistake

> [!warning] Writing complex `Matcher` patterns when you really need `DependencyMatcher`. Token patterns are linear — they can't match "subject of verb" across modifiers ("Apple, the tech giant, acquired Beats"). Passive voice ("Beats was acquired by Apple") flips order entirely. Use DependencyMatcher when relations matter.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Linear pattern fails on passive voice + modifiers
pattern = [{"ENT_TYPE": "ORG"}, {"LEMMA": "acquire"}, {"ENT_TYPE": "ORG"}]
# "Beats was acquired by Apple" -> miss
# "Apple, the tech giant, acquired Beats" -> miss
```

**Senior:**
```python
# DependencyMatcher matches syntactic role
[{"RIGHT_ID": "v", "RIGHT_ATTRS": {"LEMMA": "acquire"}},
 {"LEFT_ID": "v", "REL_OP": ">", "RIGHT_ID": "subj", "RIGHT_ATTRS": {"DEP": "nsubj"}},
 {"LEFT_ID": "v", "REL_OP": ">", "RIGHT_ID": "obj",  "RIGHT_ATTRS": {"DEP": "dobj"}}]
# Works for passive + modifiers.
```

## See Also

- [[Sections/nlp-classical/spacy/spacy-pipeline|spaCy pipeline — load model, tokenize, POS, lemma (Classical NLP)]]
- [[Sections/nlp-classical/spacy/spacy-ner|spaCy NER — named entities, rule-based, custom training (Classical NLP)]]
- [[Sections/nlp-classical/spacy/_Index|Classical NLP → spaCy — pipelines, NER, Matcher]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
