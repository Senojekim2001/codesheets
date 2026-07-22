---
type: "entry"
domain: "python"
file: "llm-ai"
section: "embeddings-vectors"
id: "vector-databases"
title: "Vector Databases — Pinecone, Chroma, pgvector & Weaviate"
category: "Vector DBs"
subtitle: "Chroma, Pinecone, pgvector, Weaviate, Qdrant, upsert, query, metadata filter"
signature_short: "collection.add(ids, embeddings, documents)  |  collection.query(query_embeddings, n_results)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Vector Databases — Pinecone, Chroma, pgvector & Weaviate"
  - "vector-databases"
tags:
  - "python"
  - "python/llm-ai"
  - "python/llm-ai/embeddings-vectors"
  - "category/vector-dbs"
  - "tier/tiered"
---

# Vector Databases — Pinecone, Chroma, pgvector & Weaviate

> Chroma, Pinecone, pgvector, Weaviate, Qdrant, upsert, query, metadata filter

## Overview

Vector databases store embeddings and enable fast similarity search at scale. Chroma is the easiest local/embedded option. Pinecone is the leading managed cloud service. pgvector adds vector search to PostgreSQL. Weaviate and Qdrant are open-source with cloud options. Key features: metadata filtering (filter by date, category before similarity search), hybrid search (combine vector + keyword), namespaces/collections for multi-tenant isolation, and automatic embedding generation.

## Signature

```python
collection.add(ids, embeddings, documents)  |  collection.query(query_embeddings, n_results)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - chromadb in-memory: create_collection, add(ids, documents), query(query_texts).
# STRENGTHS - Zero setup; Chroma auto-embeds; perfect for prototypes and tests.
# WEAKNESSES- In-memory == lost on restart; default embedder is small/fast/weak. Switch for production.
import chromadb

client = chromadb.Client()
col = client.create_collection("docs",
                               metadata={"hnsw:space": "cosine"})

col.add(
    ids=["d1", "d2", "d3"],
    documents=["Python is great for data science",
               "JavaScript runs in the browser",
               "Machine learning predicts outcomes"],
    metadatas=[{"topic": "python"}, {"topic": "js"}, {"topic": "ml"}],
)

res = col.query(query_texts=["how to analyze data?"],
                n_results=2,
                where={"topic": {"$in": ["python", "ml"]}})
print(res["documents"])
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - PersistentClient with explicit embedder; namespace via collection name; metadata filters BEFORE vector search; upsert for idempotence.
# STRENGTHS - Survives restart; you control the embedding model; metadata filtering cuts irrelevant results before scoring.
# WEAKNESSES- Switching embedders requires reindex (vectors aren't comparable across models).
import chromadb
from chromadb.utils import embedding_functions

# Use the SAME embedder you query with; pin the model name.
ef = embedding_functions.OpenAIEmbeddingFunction(
    api_key=__import__("os").environ["OPENAI_API_KEY"],
    model_name="text-embedding-3-small",   # pin
)

client = chromadb.PersistentClient(path="./chroma_db")
col = client.get_or_create_collection(
    name="kb_v1",                          # version in the name; flip on reindex
    embedding_function=ef,
    metadata={"hnsw:space": "cosine"},
)

# Idempotent writes -- same id, new content overwrites cleanly.
col.upsert(
    ids=[f"chunk_{i}" for i in range(3)],
    documents=["section about auth", "section about billing", "section about exports"],
    metadatas=[{"section": "auth", "lang": "en"},
               {"section": "billing", "lang": "en"},
               {"section": "exports", "lang": "en"}],
)

# Filter (cheap) THEN rank (expensive). where_document filters on raw text.
res = col.query(
    query_texts=["how do refunds work?"],
    n_results=5,
    where={"$and": [{"lang": "en"}, {"section": {"$ne": "auth"}}]},
)
for d, dist, m in zip(res["documents"][0], res["distances"][0], res["metadatas"][0]):
    print(f"{dist:.3f}  {m['section']}: {d[:60]}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Production index per service: pgvector or Qdrant for SQL-shaped data; Pinecone/Weaviate for managed; namespace per tenant; HNSW params; hybrid search; payload allowlist.
# STRENGTHS - Tenant isolation, regulatory-friendly residency choices, sub-100ms retrieval at scale, hybrid (vector + BM25) catches exact tokens.
# WEAKNESSES- Schema drift between embedder versions is the #1 outage cause; treat embedding model + dim + index name as ONE artifact.
from __future__ import annotations
import os
import psycopg
from pgvector.psycopg import register_vector

# 1) pgvector schema -- HNSW index with cosine ops.
SCHEMA = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS chunks (
    id              BIGSERIAL PRIMARY KEY,
    tenant_id       TEXT NOT NULL,
    doc_id          TEXT NOT NULL,
    chunk_idx       INT  NOT NULL,
    text            TEXT NOT NULL,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedder        TEXT NOT NULL,                          -- 'oa-3-small-768'
    embedding       VECTOR(768) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, doc_id, chunk_idx, embedder)
);
CREATE INDEX IF NOT EXISTS chunks_tenant_idx ON chunks(tenant_id);
CREATE INDEX IF NOT EXISTS chunks_meta_gin   ON chunks USING gin (metadata jsonb_path_ops);
CREATE INDEX IF NOT EXISTS chunks_hnsw_idx
    ON chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
"""

# 2) Strict tenant-scoped retrieval -- never let a query cross tenants.
def search(conn: psycopg.Connection, *, tenant_id: str, embedder: str,
           query_emb: list[float], k: int = 10,
           filters: dict | None = None) -> list[dict]:
    where = ["tenant_id = %s", "embedder = %s"]
    params: list[object] = [tenant_id, embedder]
    if filters:
        where.append("metadata @> %s")
        params.append(filters)
    sql = f"""
        SELECT id, doc_id, chunk_idx, text, metadata,
               1 - (embedding <=> %s) AS score
        FROM chunks
        WHERE {" AND ".join(where)}
        ORDER BY embedding <=> %s
        LIMIT %s
    """
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(sql, [query_emb, *params, query_emb, k])
        return cur.fetchall()

# 3) Hybrid search: combine vector similarity with full-text BM25.
HYBRID_SQL = """
WITH vec AS (
    SELECT id, 1 - (embedding <=> %(q_emb)s) AS vscore
    FROM chunks
    WHERE tenant_id = %(tenant)s AND embedder = %(embedder)s
    ORDER BY embedding <=> %(q_emb)s
    LIMIT 50
), kw AS (
    SELECT id, ts_rank(to_tsvector('english', text),
                       plainto_tsquery('english', %(q_text)s)) AS kscore
    FROM chunks
    WHERE tenant_id = %(tenant)s
      AND to_tsvector('english', text) @@ plainto_tsquery('english', %(q_text)s)
    LIMIT 50
)
SELECT c.id, c.text, c.metadata,
       COALESCE(vec.vscore, 0) * 0.7 + COALESCE(kw.kscore, 0) * 0.3 AS score
FROM chunks c
LEFT JOIN vec ON vec.id = c.id
LEFT JOIN kw  ON kw.id  = c.id
WHERE c.id IN (SELECT id FROM vec UNION SELECT id FROM kw)
ORDER BY score DESC
LIMIT %(k)s
"""

# 4) Reindex playbook (zero-downtime):
#    a) Add a new 'embedder' tag (e.g., 'oa-3-large-1536') alongside the old.
#    b) Backfill rows with the new embedder.
#    c) Cut traffic over via a feature flag; old rows remain queryable.
#    d) DELETE WHERE embedder = old once the new is verified.

# Decision rule:
#   prototype                            -> chroma in-memory; ditch when persistent
#   single service, SQL stack             -> pgvector (joins with relational data; no extra infra)
#   high-throughput managed                -> Pinecone (best ops story); namespaces per tenant
#   open-source self-hosted                -> Qdrant or Weaviate; both production-grade
#   massive scale (>10^9 vecs) cloud      -> Pinecone, Vespa, or Weaviate Cloud; benchmark first
#   need vector AND lexical (BM25)         -> hybrid in pgvector OR Weaviate / Vespa native hybrid
#   regulatory residency                   -> self-hosted (Qdrant/Weaviate) OR managed with EU/US region
#   tenant isolation                        -> ALWAYS scope by tenant_id in WHERE; namespaces in Pinecone
#   reindex strategy                        -> dual-write under two embedder tags; flip via flag
#
# Anti-pattern: storing the embedding WITHOUT recording which model produced it.
# When you upgrade text-embedding-3-small -> -large, retrieval quietly degrades
# because old and new vectors live in different spaces. Always store the
# embedder identifier and filter on it.
```

## Decision Rule

```text
prototype                            -> chroma in-memory; ditch when persistent
single service, SQL stack             -> pgvector (joins with relational data; no extra infra)
high-throughput managed                -> Pinecone (best ops story); namespaces per tenant
open-source self-hosted                -> Qdrant or Weaviate; both production-grade
massive scale (>10^9 vecs) cloud      -> Pinecone, Vespa, or Weaviate Cloud; benchmark first
need vector AND lexical (BM25)         -> hybrid in pgvector OR Weaviate / Vespa native hybrid
regulatory residency                   -> self-hosted (Qdrant/Weaviate) OR managed with EU/US region
tenant isolation                        -> ALWAYS scope by tenant_id in WHERE; namespaces in Pinecone
reindex strategy                        -> dual-write under two embedder tags; flip via flag
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing the embedding WITHOUT recording which model produced it.
> When you upgrade text-embedding-3-small -> -large, retrieval quietly degrades
> because old and new vectors live in different spaces. Always store the
> embedder identifier and filter on it.

## Tips

- ChromaDB for prototyping and small datasets (< 1M docs). Pinecone/Qdrant for production scale.
- pgvector is ideal if you already use PostgreSQL — vector search alongside your relational data, no extra infrastructure.
- Metadata filtering BEFORE vector search dramatically improves relevance — filter by date, category, or user first.
- Use namespaces (Pinecone) or collections (Chroma/Qdrant) for multi-tenant isolation — each tenant gets their own search space.
- Hybrid search (vector + BM25, fused with RRF) catches exact tokens (SKUs, IDs, names) that pure vector search misses; pgvector and Weaviate/Vespa support it natively.

## Common Mistake

> [!warning] Storing the embedding without recording which model produced it — when you upgrade text-embedding-3-small to -large (or change dimensions), retrieval quietly degrades because old and new vectors live in different spaces. Always store the embedder identifier and filter on it; reindex via dual-write under two embedder tags, then flip via a feature flag.

## Shorthand (Junior → Senior)

**Junior:**
```python
import chromadb
client = chromadb.Client()
collection = client.create_collection("documents")
collection.add(
    documents=["This is a document about cats", "This is about dogs"],
    ids=["doc1", "doc2"]
)
results = collection.query(query_texts=["pets"], n_results=2)
print(results['documents'])
```

**Senior:**
```python
collection = chromadb.Client().get_or_create_collection("docs")
collection.upsert(documents=texts, ids=ids)
results = collection.query(query_texts=["pets"], n_results=5)
```

## See Also

- [[Sections/llm-ai/embeddings-vectors/_Index|LLMs & AI Engineering → Embeddings & Vector Databases]]
- [[Sections/llm-ai/_Index|LLMs & AI Engineering index]]
- [[_Index|Vault index]]
