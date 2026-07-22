---
type: "entry"
domain: "python"
file: "nlp-classical"
section: "sklearn-text"
id: "topic-modeling"
title: "Topic modeling — LDA, NMF, embeddings + clustering"
category: "sklearn-text"
subtitle: "LatentDirichletAllocation, NMF, BERTopic, coherence scoring, n_components, top words per topic, doc-topic distribution"
signature_short: "lda = LatentDirichletAllocation(n_components=10).fit(X_tfidf); print_top_words(lda, vec)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Topic modeling — LDA, NMF, embeddings + clustering"
  - "topic-modeling"
tags:
  - "python"
  - "python/nlp-classical"
  - "python/nlp-classical/sklearn-text"
  - "category/sklearn-text"
  - "tier/tiered"
---

# Topic modeling — LDA, NMF, embeddings + clustering

> LatentDirichletAllocation, NMF, BERTopic, coherence scoring, n_components, top words per topic, doc-topic distribution

## Overview

Topic modeling: given a corpus, find K latent topics each described by a distribution over words; describe each document as a mixture of topics. Two classical algorithms: **LDA** (probabilistic; works on TF/Count features), **NMF** (faster, often produces cleaner topics, works on TF-IDF). Modern alternative: **BERTopic** (sentence embeddings + clustering + class-based TF-IDF) — usually beats classical when topics overlap or are subtle. The three examples solve the SAME concrete task — discover ~10 topics in a news corpus and label them — at three depths: NMF on TF-IDF → LDA + coherence scoring + topic visualization → BERTopic with embeddings.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Discover ~10 topics in a corpus; show top words per topic.
- **Junior** — SAME — but pick optimal n_topics via coherence; compare NMF vs LDA.
- **Senior** — SAME — but use sentence embeddings + clustering (BERTopic-style) which captures semantic topics that BoW can't (synonyms, paraphrases). pip install sentence-transformers umap-learn hdbscan scikit-learn

## Signature

```python
lda = LatentDirichletAllocation(n_components=10).fit(X_tfidf); print_top_words(lda, vec)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Discover ~10 topics in a corpus; show top words per topic.
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import NMF

# Pretend corpus:
docs = [
    "the team won the championship game last night",
    "stock prices fell after the earnings report",
    "new species of frog discovered in the rainforest",
    # ... thousands of docs ...
]

# NMF works on TF-IDF (LDA wants raw counts).
vec = TfidfVectorizer(max_features=5000, stop_words="english", ngram_range=(1, 2))
X = vec.fit_transform(docs)

nmf = NMF(n_components=10, random_state=42, max_iter=400)
W = nmf.fit_transform(X)                               # doc → topic distribution (n_docs, 10)
H = nmf.components_                                     # topic → word distribution (10, vocab)

feature_names = vec.get_feature_names_out()
def print_top_words(model, feature_names, n_top: int = 10):
    for topic_idx, topic in enumerate(model.components_):
        top_idx = topic.argsort()[-n_top:][::-1]
        print(f"Topic {topic_idx}: {' '.join(feature_names[top_idx])}")

print_top_words(nmf, feature_names)
# Topic 0: game team season player win league sports coach
# Topic 1: stock market price share earnings investor company report
# Topic 2: species animal forest tree wildlife rainforest researcher discovered
# ... (manually label each cluster)

# Per-document dominant topic:
import numpy as np
doc_topics = W.argmax(axis=1)                          # which topic dominates each doc
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but pick optimal n_topics via coherence; compare
#             NMF vs LDA.
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, NMF
import numpy as np

# === LDA needs CountVectorizer (raw counts), not TF-IDF ===
count_vec = CountVectorizer(max_features=5000, stop_words="english")
X_count = count_vec.fit_transform(docs)

# LDA: probabilistic; topics are probability distributions.
lda = LatentDirichletAllocation(
    n_components=10,
    learning_method="online",                          # batch is slower for large corpora
    learning_decay=0.7,
    n_jobs=-1,
    random_state=42,
)
lda.fit(X_count)

# === Coherence: measure topic quality ===
# A coherent topic has top words that frequently co-occur. Compute a
# simple coherence proxy (UMass): for each pair of top-N words in a
# topic, count co-occurrences; higher = more coherent.
def umass_coherence(model, feature_names, X, n_top: int = 10) -> float:
    X_bin = (X > 0).astype(int)                        # binarize: doc has term y/n
    doc_freq = np.asarray(X_bin.sum(axis=0)).flatten()  # term -> doc count
    n_docs = X.shape[0]

    coherences = []
    for topic in model.components_:
        top_idx = topic.argsort()[-n_top:][::-1]
        topic_coh = 0.0
        pairs = 0
        for i in range(len(top_idx)):
            for j in range(i):
                co = (X_bin[:, top_idx[i]].multiply(X_bin[:, top_idx[j]])).sum()
                topic_coh += np.log((co + 1) / doc_freq[top_idx[j]])
                pairs += 1
        coherences.append(topic_coh / max(pairs, 1))
    return float(np.mean(coherences))

# === Try multiple n_components; pick highest coherence ===
results = {}
for n in [5, 10, 15, 20, 30]:
    lda_n = LatentDirichletAllocation(n_components=n, random_state=42).fit(X_count)
    coh = umass_coherence(lda_n, count_vec.get_feature_names_out(), X_count)
    results[n] = coh
    print(f"n_components={n}: coherence={coh:.3f}")

best_n = max(results, key=results.get)
print(f"\nBest: n_components={best_n}")

# === NMF on TF-IDF for comparison ===
tfidf_vec = TfidfVectorizer(max_features=5000, stop_words="english")
X_tfidf = tfidf_vec.fit_transform(docs)
nmf = NMF(n_components=best_n, random_state=42, max_iter=400)
nmf.fit(X_tfidf)
# Inspect topics from each; pick the one whose topics are more interpretable.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — but use sentence embeddings + clustering (BERTopic-style)
#             which captures semantic topics that BoW can't (synonyms,
#             paraphrases).
# pip install sentence-transformers umap-learn hdbscan scikit-learn

from sentence_transformers import SentenceTransformer
import umap
import hdbscan
from sklearn.feature_extraction.text import CountVectorizer
import numpy as np

# === Step 1: encode each document into a vector ===
model = SentenceTransformer("all-MiniLM-L6-v2")        # small + fast; 384-dim
embeddings = model.encode(docs, show_progress_bar=True, batch_size=32)
# embeddings.shape = (n_docs, 384)

# === Step 2: reduce dimensionality (clustering struggles in 384d) ===
reducer = umap.UMAP(n_components=5, min_dist=0.0, metric="cosine", random_state=42)
embeddings_reduced = reducer.fit_transform(embeddings)

# === Step 3: cluster with HDBSCAN (no need to specify n_clusters) ===
clusterer = hdbscan.HDBSCAN(min_cluster_size=15, metric="euclidean", cluster_selection_method="eom")
cluster_labels = clusterer.fit_predict(embeddings_reduced)
# cluster_labels of -1 means "noise" (didn't fit any cluster)

print(f"Found {len(set(cluster_labels)) - 1} clusters; {(cluster_labels == -1).sum()} noise docs")

# === Step 4: extract topic words via class-based TF-IDF (c-TF-IDF) ===
# For each cluster, treat all its docs as one super-doc; compute TF-IDF
# across the super-docs; top terms = topic words.
docs_per_cluster = {}
for doc, label in zip(docs, cluster_labels):
    docs_per_cluster.setdefault(label, []).append(doc)

# Concatenate each cluster into one document.
cluster_docs = [" ".join(docs_per_cluster[k]) for k in sorted(docs_per_cluster) if k != -1]

count_vec = CountVectorizer(stop_words="english", min_df=2)
X_clusters = count_vec.fit_transform(cluster_docs)

# c-TF-IDF: term frequency across clusters.
import numpy as np
n_clusters = X_clusters.shape[0]
tf = X_clusters.toarray()
n_per_cluster = tf.sum(axis=1, keepdims=True)
log_avg_freq = np.log(1 + (tf.sum(axis=0) / max(n_clusters, 1)))
ctf_idf = (tf / np.maximum(n_per_cluster, 1)) * log_avg_freq

feature_names = count_vec.get_feature_names_out()
for cluster_id, scores in enumerate(ctf_idf):
    top_idx = scores.argsort()[-10:][::-1]
    print(f"Cluster {cluster_id}: {' '.join(feature_names[top_idx])}")

# === Or just use BERTopic, which does all this in 5 lines ===
# from bertopic import BERTopic
# topic_model = BERTopic(min_topic_size=15, calculate_probabilities=True)
# topics, probs = topic_model.fit_transform(docs)
# topic_model.get_topic_info()
# topic_model.visualize_topics()                       # interactive plotly viz
# topic_model.visualize_barchart()

# Decision rule:
#   small labeled dataset, KNOWN topics      -> classification, not topic modeling
#   need probabilistic topic mixtures         -> LDA on CountVectorizer
#   need cleaner / more interpretable topics  -> NMF on TfidfVectorizer
#   modern, semantic topics                   -> BERTopic (sentence-transformers + clustering)
#   millions of docs                           -> NMF (faster) OR online LDA
#   topics overlap / are subtle               -> embeddings beat BoW
#   need to know "doc X is 70% topic 1, 30% topic 2"  -> LDA (gives mixtures);
#                                                          BERTopic gives single topic + probabilities
#   pick optimal n_topics                     -> coherence (UMass / cv); range 5-50 is typical
#   short text (tweets, queries)              -> BERTopic; LDA struggles with short docs
#   multilingual                               -> multilingual sentence-transformer + BERTopic
#   trends over time                          -> BERTopic.topics_over_time
#
# Anti-pattern: training LDA with n_components=2 on a corpus of 1M
# docs and expecting meaningful topics. LDA topic count interacts
# strongly with corpus size; rule of thumb: n_topics ≈ sqrt(n_docs)/4
# for an initial guess, then tune via coherence. n=2 is essentially
# binary clustering — useless for "what topics are in this corpus?".
```

## Decision Rule

```text
small labeled dataset, KNOWN topics      -> classification, not topic modeling
need probabilistic topic mixtures         -> LDA on CountVectorizer
need cleaner / more interpretable topics  -> NMF on TfidfVectorizer
modern, semantic topics                   -> BERTopic (sentence-transformers + clustering)
millions of docs                           -> NMF (faster) OR online LDA
topics overlap / are subtle               -> embeddings beat BoW
need to know "doc X is 70% topic 1, 30% topic 2"  -> LDA (gives mixtures);
                                                       BERTopic gives single topic + probabilities
pick optimal n_topics                     -> coherence (UMass / cv); range 5-50 is typical
short text (tweets, queries)              -> BERTopic; LDA struggles with short docs
multilingual                               -> multilingual sentence-transformer + BERTopic
trends over time                          -> BERTopic.topics_over_time
```

## Anti-Pattern

> [!warning] Anti-pattern
> training LDA with n_components=2 on a corpus of 1M
> docs and expecting meaningful topics. LDA topic count interacts
> strongly with corpus size; rule of thumb: n_topics ≈ sqrt(n_docs)/4
> for an initial guess, then tune via coherence. n=2 is essentially
> binary clustering — useless for "what topics are in this corpus?".

## Tips

- LDA wants COUNT features; NMF wants TF-IDF. Wrong combination produces noisy topics.
- Pick `n_components` (number of topics) via coherence on a held-out range. Start with 10-30; coherence usually peaks then plateaus.
- NMF is often more interpretable than LDA at the same n_topics — try both and pick the one whose topics make sense to a human.
- BERTopic (sentence-transformers + UMAP + HDBSCAN + c-TF-IDF) is the modern answer. Captures semantic topics LDA/NMF miss; library handles all the plumbing.
- For short documents (tweets, queries), classical LDA struggles (sparse counts). BERTopic or sentence-embedding clustering is much better.
- Use `topic_model.visualize_topics()` (BERTopic) or pyLDAvis for interactive topic exploration — much faster than reading top-words tables.

## Common Mistake

> [!warning] Training LDA with `n_components=2` (or any tiny number) on a large corpus and expecting meaningful topics. LDA topic count interacts with corpus size; n=2 is essentially binary clustering. Rule of thumb: start with `n_topics ≈ sqrt(n_docs)/4`, then tune via coherence.

## Shorthand (Junior → Senior)

**Junior:**
```python
# n=2 on a large corpus — useless
LatentDirichletAllocation(n_components=2).fit(X_count)
```

**Senior:**
```python
# Sweep + pick by coherence
for n in [10, 15, 20, 30, 50]:
    coh = umass_coherence(LDA(n).fit(X), ...)
# Pick n where coherence peaks.
```

## See Also

- [[Sections/nlp-classical/sklearn-text/tfidf-vectorizer|TfidfVectorizer — text → numeric features (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/text-classification|Text classification — Pipeline, baseline, hyperparameter tuning (Classical NLP)]]
- [[Sections/nlp-classical/sklearn-text/_Index|Classical NLP → sklearn-text — TF-IDF, classification, topic modeling]]
- [[Sections/nlp-classical/_Index|Classical NLP index]]
- [[_Index|Vault index]]
