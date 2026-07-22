---
type: "file-index"
domain: "python"
file: "nlp-classical"
title: "Classical NLP"
tags:
  - "python"
  - "python/nlp-classical"
  - "index"
---

# Classical NLP

> 9 entries across 3 sections.

## spaCy — pipelines, NER, Matcher · 3

- [[Sections/nlp-classical/spacy/spacy-pipeline|spaCy pipeline — load model, tokenize, POS, lemma]] — Load a model with `spacy.load`; pipe text through; iterate `Doc → Token` for tokens, lemmas, parts-of-speech, dependencies. The default toolkit when you need linguistic features without a transformer.
- [[Sections/nlp-classical/spacy/spacy-ner|spaCy NER — named entities, rule-based, custom training]] — Extract entities (PERSON, ORG, GPE, DATE, MONEY, ...) from text. Built-in NER for the common cases; PhraseMatcher / EntityRuler for domain entities; train a custom NER for novel domains.
- [[Sections/nlp-classical/spacy/spacy-matcher-patterns|spaCy Matcher — token + dependency pattern matching]] — Match linguistic patterns: token-level (`Matcher`) for "verb followed by noun"; syntactic (`DependencyMatcher`) for "subject of verb is a person". The right tool for rule-based extraction from parsed text.

## sklearn-text — TF-IDF, classification, topic modeling · 3

- [[Sections/nlp-classical/sklearn-text/tfidf-vectorizer|TfidfVectorizer — text → numeric features]] — Convert documents to TF-IDF feature vectors. The default text-feature extractor for classical ML; still strong baseline for classification, retrieval, and clustering.
- [[Sections/nlp-classical/sklearn-text/text-classification|Text classification — Pipeline, baseline, hyperparameter tuning]] — Build a text classifier: TF-IDF + LogisticRegression / LinearSVC in a sklearn `Pipeline`; tune via `GridSearchCV`; handle class imbalance with `class_weight="balanced"` or resampling.
- [[Sections/nlp-classical/sklearn-text/topic-modeling|Topic modeling — LDA, NMF, embeddings + clustering]] — Discover topics in unlabeled documents: LatentDirichletAllocation (probabilistic), NMF (faster, often cleaner), or sentence-transformers + clustering (modern, captures semantics). The "what is this corpus about?" tool.

## NLP Patterns — cleaning, ngrams, classical-vs-LLM · 3

- [[Sections/nlp-classical/patterns/text-cleaning-pipeline|Text cleaning — normalization, stop words, lemmatization]] — Reproducible text-cleaning pipeline: lowercase + Unicode normalize + tokenize + remove stop words + lemmatize. The pre-feature-extraction step that everyone implements differently.
- [[Sections/nlp-classical/patterns/ngrams-features|N-grams — character vs word, when each helps]] — Word n-grams capture phrase context ("New York" as one feature); character n-grams handle morphology and OOV ("running" → "run", "runs", "runner" share substrings). Often combined for best results.
- [[Sections/nlp-classical/patterns/classical-vs-llm|Classical NLP vs LLM — when each wins]] — Frontier LLMs are stunning at zero-shot tasks but slow, expensive, and opaque. Classical NLP (spaCy + sklearn) is fast, cheap, deterministic, and interpretable. The decision matrix matters more than the tools.
