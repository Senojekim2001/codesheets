---
type: rag-setup
title: RAG Setup for Local AI
tags:
  - rag
  - local-ai
  - setup
  - readme
---

# Using this vault as a RAG for local AI

This vault is designed to be a high-quality knowledge base for retrieval-augmented generation. The design choices below make it work well *out of the box* with most local AI stacks.

## What makes this vault RAG-friendly

| Design choice | Why it matters for RAG |
|---|---|
| **Stable `## H2` boundaries** | Every retriever can chunk cleanly on `## Heading` — no fragile parsing. |
| **`Decision Rule` and `Anti-Pattern` are H2 sections** | These are the densest knowledge cards in the corpus. Promoting them to top-level headings means a chunker hits them as discrete, retrievable chunks. |
| **YAML frontmatter on every entry** | Filter retrieval by `file`, `section`, `category`, `tier_count`, etc. |
| **Hierarchical tags** | `python/pandas/io`, `category/constructor` — natural metadata filters. |
| **`aliases` field** | Synonym matching: searches for "DataFrame constructor" and "pd.DataFrame" both hit the same entry. |
| **`signature_short` in frontmatter** | One-line preview without parsing the body — useful as tooltip context. |
| **Cross-links via `See Also`** | Graph retrieval surfaces sibling entries in the same category. |
| **Three-tier examples as separate sections** | Letting the LLM choose which tier to cite (intro for explanation, senior for production code). |

## Three paths to set this up

### Path 1 — Plug-and-play: AnythingLLM ⭐ (easiest)

[AnythingLLM](https://anythingllm.com) is a desktop app that handles the whole RAG pipeline (chunk + embed + store + chat). Best for "I just want to chat with my notes".

1. Download and install AnythingLLM Desktop.
2. Create a new workspace.
3. **Settings → LLM Preference** → pick Ollama (or LM Studio). Confirm a model is running, e.g. `ollama run llama3.1`.
4. **Settings → Vector Database** → built-in LanceDB is fine for this volume (458 notes).
5. **Settings → Embedding Preference** → pick a local one: `nomic-embed-text` via Ollama, or built-in.
6. **Workspace → Upload** → drag the `python-vault/` folder in. AnythingLLM walks it, parses front-matter, chunks on Markdown headings.
7. Chat: *"What's the senior-tier guidance for fine-tuning vs RAG?"* — it pulls the right entry's Decision Rule.

### Path 2 — Inside Obsidian: Smart Connections (best UX)

[Smart Connections](https://github.com/brianpetro/obsidian-smart-connections) runs the RAG inside Obsidian itself. You stay in the same window where you read.

1. **Settings → Community plugins** → browse → install **Smart Connections**.
2. In the plugin settings, set:
   - **Embedding model:** any local model — `nomic-embed-text` via Ollama is good.
   - **LLM:** point to your local Ollama (`http://localhost:11434/v1`) or LM Studio.
3. Open the **Smart Chat** view from the ribbon.
4. Type a question. The plugin shows the source notes it used as citations.

The plugin treats every note as a chunk plus splits on headings — meaning each `## Decision Rule` block becomes a retrievable card.

### Path 3 — Custom pipeline (full control, scriptable)

For when you want to control chunking, retrieval, and generation precisely. Below is a complete working pipeline using **sentence-transformers** + **ChromaDB** + **Ollama**.

**Install:**

```bash
pip install sentence-transformers chromadb python-frontmatter ollama
ollama pull llama3.1                           # or your preferred model
ollama pull nomic-embed-text                   # for embeddings via Ollama (optional)
```

**Index the vault** — `index_vault.py`:

```python
"""Index the python-vault for RAG. Chunks on H2 boundaries; preserves frontmatter as metadata."""
from pathlib import Path
import frontmatter
import chromadb
from sentence_transformers import SentenceTransformer

VAULT = Path("/path/to/python-vault")
MODEL = "BAAI/bge-small-en-v1.5"               # 384-dim, ~33MB, strong on technical text

embedder = SentenceTransformer(MODEL)
client   = chromadb.PersistentClient(path=str(VAULT.parent / "rag-index"))
col      = client.get_or_create_collection("python_vault",
                                           metadata={"hnsw:space": "cosine"})

def chunk_on_h2(text: str) -> list[tuple[str, str]]:
    """Split markdown body on '## ' boundaries. Returns list of (heading, body) pairs."""
    chunks, current_heading, current_body = [], "Overview", []
    for line in text.splitlines():
        if line.startswith("## "):
            if current_body:
                chunks.append((current_heading, "\n".join(current_body).strip()))
            current_heading = line.removeprefix("## ").strip()
            current_body = []
        else:
            current_body.append(line)
    if current_body:
        chunks.append((current_heading, "\n".join(current_body).strip()))
    return [(h, b) for h, b in chunks if b]

ids, docs, metas = [], [], []
for md_path in VAULT.rglob("*.md"):
    if md_path.name.startswith("_") or "MOC" in md_path.parts:
        continue                                # skip indexes; they're navigation, not knowledge
    post = frontmatter.load(md_path)
    if post.get("type") != "entry":
        continue
    rel = md_path.relative_to(VAULT).as_posix()
    for i, (heading, body) in enumerate(chunk_on_h2(post.content)):
        ids.append(f"{rel}#{i}")
        docs.append(f"# {post.get('title')}\n## {heading}\n\n{body}")
        metas.append({
            "path":     rel,
            "title":    post.get("title", ""),
            "file":     post.get("file", ""),
            "section":  post.get("section", ""),
            "category": post.get("category", ""),
            "heading":  heading,
            "is_decision_rule": heading == "Decision Rule",
            "is_anti_pattern":  heading == "Anti-Pattern",
            "is_senior_tier":   heading.startswith("Example — Senior"),
        })

# Embed in batches.
print(f"Embedding {len(docs)} chunks...")
embeddings = embedder.encode(docs, batch_size=64, show_progress_bar=True,
                             normalize_embeddings=True).tolist()
col.upsert(ids=ids, documents=docs, embeddings=embeddings, metadatas=metas)
print(f"✓ Indexed {len(ids)} chunks into {client.path}")
```

**Query** — `ask.py`:

```python
"""Answer a question by retrieving from the vault and asking Ollama."""
import sys
import chromadb
import ollama
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("BAAI/bge-small-en-v1.5")
client   = chromadb.PersistentClient(path="/path/to/rag-index")
col      = client.get_collection("python_vault")

def retrieve(question: str, *, k: int = 6, filters: dict | None = None):
    q_vec = embedder.encode([question], normalize_embeddings=True).tolist()
    res = col.query(query_embeddings=q_vec, n_results=k, where=filters or {})
    return list(zip(res["documents"][0], res["metadatas"][0], res["distances"][0]))

def ask(question: str):
    hits = retrieve(question, k=6)
    context = "\n\n---\n\n".join(
        f"[from {m['path']} → {m['heading']}]\n{doc}"
        for doc, m, _ in hits
    )
    prompt = (
        "You are a Python expert. Answer the user's question using ONLY the context.\n"
        "Cite the source file in square brackets after each fact, e.g. [Sections/typing/...].\n"
        f"If the context doesn't contain the answer, say so.\n\nContext:\n{context}\n\n"
        f"Question: {question}"
    )
    resp = ollama.chat(model="llama3.1", messages=[{"role": "user", "content": prompt}])
    print(resp["message"]["content"])

if __name__ == "__main__":
    ask(" ".join(sys.argv[1:]))
```

**Use:**

```bash
python index_vault.py
python ask.py "When should I use TypeIs vs TypeGuard?"
```

## Filtered retrieval — the high-value queries

Because every chunk has rich metadata, you can scope retrieval narrowly:

```python
# "Just decision rules across the entire vault"
retrieve("how do I choose between async and threading?",
         filters={"is_decision_rule": True})

# "Anti-patterns specific to pandas"
retrieve("what should I avoid in pandas?",
         filters={"is_anti_pattern": True, "file": "pandas"})

# "Production-grade examples for testing"
retrieve("how to structure a pytest fixture?",
         filters={"is_senior_tier": True, "file": "testing"})

# "Anything in the typing sheet"
retrieve("forward references in typing",
         filters={"file": "typing"})
```

## Tuning notes

- **Chunk size:** the H2 split typically yields 100-700 token chunks — already a sweet spot. If a chunk hits >1500 tokens (rare; some senior tiers), split further on `### H3` or sentence boundaries.
- **Top-K:** start with `k=6`. Bump to 10 for synthesis-style questions; drop to 3 for "find me the one entry" lookups.
- **Re-ranking:** for harder queries, retrieve `k=20` and rerank with a cross-encoder (`cross-encoder/ms-marco-MiniLM-L-6-v2`) to top 5.
- **Embedder choice:** `BAAI/bge-small-en-v1.5` (384-dim) is the price/performance sweet spot for technical text. Upgrade to `bge-large-en-v1.5` (1024-dim) only if recall feels low.
- **Generation:** `llama3.1:8b` handles most queries; `llama3.1:70b` or `qwen2.5-coder:32b` for harder synthesis. The corpus is small enough that the LLM, not the retriever, is usually the bottleneck.

## What to skip indexing

The script above skips:

- `_Index.md` files (these are navigation pages — links, not knowledge)
- Anything under `MOC/` (these aggregate already-indexed content, so you'd double-count)

If you want the MOC files indexed (e.g. you want "give me ALL decision rules" to retrieve as a single chunk), drop the filter — but be aware that you'll see duplicate hits when querying the same concept.

## Re-indexing

The vault is generated from `data/python/*.js`. When the source data changes:

```bash
node scripts/build-python-vault.mjs       # regenerates the vault
python index_vault.py                      # re-embeds (chromadb upsert is idempotent)
```

For most plugins (Smart Connections, AnythingLLM), file watchers handle re-indexing automatically.

## Troubleshooting

**"Retrieval keeps returning the wrong file."**
Add a metadata filter (`{"file": "typing"}`) — narrowing by file is a free quality win.

**"Generation hallucinates beyond the context."**
Tighten the prompt: "Use ONLY the context. If the answer is not present, reply 'Not in the docs.'" Pair with `temperature=0`.

**"I want citations to link back to the entry note."**
Each metadata record has `path` (e.g. `Sections/typing/core-typing/basic-annotations.md`). Format citations as `[[path]]` in the LLM's response — Obsidian renders them as live links.

**"Embeddings take forever the first time."**
Expected — ~458 entries × ~6-8 chunks each = ~3,000 chunks at 384-dim. Initial run is ~30 seconds on CPU, ~5 seconds on a Mac M-series. Subsequent runs only re-embed changed files (Chroma upsert).

---

*See also: [[README|Vault README]] · [[_Index|Master Index]] · [[MOC/Decision Rules]] · [[MOC/Anti-Patterns]]*
