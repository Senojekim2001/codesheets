---
type: "entry"
domain: "python"
file: "llm-ai"
section: "embeddings-vectors"
id: "embeddings"
title: "Text Embeddings — Semantic Search & Similarity"
category: "Embeddings"
subtitle: "text-embedding-3, sentence-transformers, cosine similarity, FAISS, batch embed"
signature_short: "client.embeddings.create(input, model)  |  SentenceTransformer.encode()  |  cosine_similarity"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Text Embeddings — Semantic Search & Similarity"
  - "embeddings"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/embeddings-vectors"
  - "category/embeddings"
  - "tier/tiered"
---

# Text Embeddings — Semantic Search & Similarity

> text-embedding-3, sentence-transformers, cosine similarity, FAISS, batch embed

## Overview

Embeddings convert text into dense numerical vectors that capture semantic meaning. Similar texts have similar vectors (high cosine similarity). Use cases: semantic search (find relevant documents), RAG retrieval, clustering, recommendations, deduplication, and anomaly detection. OpenAI text-embedding-3-small/large are the standard paid options. Sentence Transformers (all-MiniLM-L6-v2, gte-large) are free open-source alternatives. Always normalize embeddings and use cosine similarity for comparison.

## Signature

```python
client.embeddings.create(input, model)  |  SentenceTransformer.encode()  |  cosine_similarity
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - client.embeddings.create(input=texts) returns a list of vectors; cosine similarity ranks docs.
# STRENGTHS - One API call gives you semantic search; "similar meaning" -> "high cosine similarity".
# WEAKNESSES- Embeddings are ~1500 floats each; storing 1M docs = 6GB; reach for a vector DB at scale.
import numpy as np
from openai import OpenAI

client = OpenAI()

def embed(texts: list[str]) -> list[list[float]]:
    r = client.embeddings.create(input=texts, model="text-embedding-3-small")
    return [d.embedding for d in r.data]

docs = ["Python is a language", "ML uses statistics", "Sunny today"]
vecs = embed(docs)
q    = embed(["how does machine learning work?"])[0]

def cos(a, b):
    a, b = np.array(a), np.array(b)
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))

for d, v in zip(docs, vecs):
    print(f"{cos(q, v):.3f}  {d}")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Batch API calls; normalize once so cosine = dot product; numpy matmul for top-K; cache by content hash.
# STRENGTHS - 100x speedup vs per-text loops; deterministic; cacheable.
# WEAKNESSES- All-pairs in numpy is O(N*D); for >1M vectors switch to FAISS / a vector DB.
import hashlib
import json
import numpy as np
from pathlib import Path
from openai import OpenAI

client = OpenAI()
CACHE = Path(".embeddings_cache.jsonl")

def _key(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()

def _load_cache() -> dict[str, list[float]]:
    if not CACHE.exists(): return {}
    return {row["k"]: row["v"] for row in (json.loads(l) for l in CACHE.read_text().splitlines())}

def _append_cache(k: str, v: list[float]) -> None:
    with CACHE.open("a") as f: f.write(json.dumps({"k": k, "v": v}) + "\n")

def embed(texts: list[str], *, model: str = "text-embedding-3-small",
          batch: int = 256) -> np.ndarray:
    cache = _load_cache()
    out: list[list[float] | None] = [cache.get(_key(t)) for t in texts]
    todo = [(i, t) for i, (t, h) in enumerate(zip(texts, out)) if h is None]
    for s in range(0, len(todo), batch):
        chunk = todo[s:s + batch]
        r = client.embeddings.create(input=[t for _, t in chunk], model=model)
        for (idx, text), e in zip(chunk, r.data):
            out[idx] = e.embedding
            _append_cache(_key(text), e.embedding)
    arr = np.asarray(out, dtype="float32")
    arr /= np.linalg.norm(arr, axis=1, keepdims=True)        # L2 normalize
    return arr

def topk(query: str, docs: np.ndarray, texts: list[str], k: int = 5):
    q = embed([query])[0]
    scores = docs @ q                                         # cosine since normalized
    idx = np.argsort(-scores)[:k]
    return [(float(scores[i]), texts[i]) for i in idx]
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Pin model + dimensions; chunk-aware embedding; Matryoshka truncation for cheap recall; FAISS HNSW for ANN; freshness via versioned indexes.
# STRENGTHS - Sub-millisecond search at 10M+ scale; cost knobs (dim truncation cuts storage 4x); zero-downtime reindex.
# WEAKNESSES- text-embedding-3-* outputs are NOT comparable to ada-002; mixing models in one index gives garbage results.
from __future__ import annotations
import faiss
import numpy as np
from dataclasses import dataclass
from openai import OpenAI

client = OpenAI()

# 1) Choose model + target dimension. text-embedding-3-* support truncation
#    (Matryoshka): request fewer dims to cut storage and speed up search.
EMBED_MODEL = "text-embedding-3-large"
EMBED_DIM   = 768                      # truncated from 3072 native; small recall loss

def embed(texts: list[str]) -> np.ndarray:
    r = client.embeddings.create(input=texts, model=EMBED_MODEL, dimensions=EMBED_DIM)
    arr = np.array([e.embedding for e in r.data], dtype="float32")
    faiss.normalize_L2(arr)
    return arr

# 2) Approximate nearest neighbor index for >100k vectors. HNSW = best CPU
#    quality/speed trade-off; IVF+PQ if memory matters more than recall.
@dataclass
class VectorIndex:
    dim: int
    index: faiss.Index
    ids: list[str]                     # parallel to vectors

    @classmethod
    def build(cls, dim: int) -> "VectorIndex":
        idx = faiss.IndexHNSWFlat(dim, 32)        # M=32 connectivity
        idx.hnsw.efConstruction = 200             # build quality
        idx.hnsw.efSearch       = 64              # query quality
        return cls(dim=dim, index=idx, ids=[])

    def add(self, vecs: np.ndarray, ids: list[str]) -> None:
        assert vecs.shape == (len(ids), self.dim)
        self.index.add(vecs)
        self.ids.extend(ids)

    def search(self, q: np.ndarray, k: int = 10) -> list[tuple[str, float]]:
        D, I = self.index.search(q, k)
        return [(self.ids[i], float(D[0][rank]))
                for rank, i in enumerate(I[0]) if i != -1]

# 3) Chunk-aware embedding: documents -> chunks -> embed -> tag with parent id.
def chunk_text(text: str, *, chunk_chars: int = 1500, overlap: int = 200) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(text):
        out.append(text[i:i + chunk_chars])
        i += chunk_chars - overlap
    return out

# 4) Versioned indexes for zero-downtime reindex:
#    Names like 'docs.v3'; flip a pointer atomically once v4 is fully built.

# Decision rule:
#   one model across ALL embeddings           -> NEVER mix models or dim sizes in one index
#   < 100k vectors                            -> brute-force numpy (faster than you'd think)
#   100k - 10M vectors                        -> faiss HNSW (CPU); float16 if memory bound
#   > 10M vectors                             -> a managed vector DB (Pinecone, Weaviate Cloud, Qdrant)
#   need filters on metadata before search     -> a vector DB; FAISS alone has no filtering
#   need to truncate cost                      -> dimensions= on text-embedding-3-* (Matryoshka)
#   open-source / on-prem                      -> bge-large-en-v1.5 (or gte-large) via sentence-transformers
#   query-doc asymmetry (e5, bge)              -> prepend "query: " / "passage: " to the right side
#   freshness                                  -> versioned indexes + atomic alias flip; never reindex in place
#
# Anti-pattern: re-embedding documents on every query. Embeddings are
# deterministic per (model, dim, text). Compute once, store with a content
# hash, look up by hash. Re-embedding is the single biggest LLM cost line item
# in production RAG when nobody is watching.
```

## Decision Rule

```text
one model across ALL embeddings           -> NEVER mix models or dim sizes in one index
< 100k vectors                            -> brute-force numpy (faster than you'd think)
100k - 10M vectors                        -> faiss HNSW (CPU); float16 if memory bound
> 10M vectors                             -> a managed vector DB (Pinecone, Weaviate Cloud, Qdrant)
need filters on metadata before search     -> a vector DB; FAISS alone has no filtering
need to truncate cost                      -> dimensions= on text-embedding-3-* (Matryoshka)
open-source / on-prem                      -> bge-large-en-v1.5 (or gte-large) via sentence-transformers
query-doc asymmetry (e5, bge)              -> prepend "query: " / "passage: " to the right side
freshness                                  -> versioned indexes + atomic alias flip; never reindex in place
```

## Anti-Pattern

> [!warning] Anti-pattern
> re-embedding documents on every query. Embeddings are
> deterministic per (model, dim, text). Compute once, store with a content
> hash, look up by hash. Re-embedding is the single biggest LLM cost line item
> in production RAG when nobody is watching.

## Tips

- text-embedding-3-small (1536 dims) is the best price/performance. text-embedding-3-large (3072 dims) for max quality.
- Always batch embedding requests — sending 100 texts in one call is much faster and cheaper than 100 individual calls.
- Normalize embeddings (L2 norm) so cosine similarity = dot product — dot product is faster to compute.
- For < 100K documents, FAISS IndexFlatIP is fine. For millions, use IndexIVFFlat or IndexHNSW for approximate nearest neighbors.
- Store the embedder identifier (model + dim) alongside every vector — text-embedding-3-* supports Matryoshka dim truncation, and mixing models in one index gives garbage results.

## Common Mistake

> [!warning] Re-embedding the same documents on every query — embeddings are deterministic per (model, dim, text). Compute once, store with a content hash, and only embed the query at search time. Re-embedding is the single biggest LLM cost line item in production RAG when nobody is watching.

## Shorthand (Junior → Senior)

**Junior:**
```python
import requests
response = requests.post(
    "https://api.openai.com/v1/embeddings",
    json={"input": ["text"], "model": "text-embedding-3-small"},
    headers={"Authorization": f"Bearer {key}"},
)
```

**Senior:**
```python
from openai import OpenAI
client = OpenAI()
response = client.embeddings.create(
    input=["text"], model="text-embedding-3-small"
)
embeddings = [e.embedding for e in response.data]
```

## See Also

- [[Sections/llm-ai/embeddings-vectors/_Index|LLMs & AI Engineering → Embeddings & Vector Databases]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
