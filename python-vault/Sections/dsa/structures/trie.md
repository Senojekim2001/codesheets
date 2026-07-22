---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "trie"
title: "Trie"
category: "Structures"
subtitle: "Efficient prefix search — autocomplete, spell check, IP routing"
signature_short: "class TrieNode: children={}; is_end=False"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Trie"
  - "trie"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Trie

> Efficient prefix search — autocomplete, spell check, IP routing

## Overview

A Trie (prefix tree) stores strings character by character, sharing common prefixes. Insert and search are O(L) where L is the word length. Used for autocomplete, spell checking, and IP routing. Can be implemented with nested dicts or TrieNode objects.

## Signature

```python
class TrieNode: children={}; is_end=False
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - Nested dict + sentinel for end-of-word
# STRENGTHS - Smallest valid trie; fits in 10 lines
# WEAKNESSES- No prefix search; no autocomplete
#
class Trie:
    END = "#"
    def __init__(self): self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})        # create child if missing
        node[self.END] = True
    def search(self, word):
        node = self.root
        for c in word:
            if c not in node: return False
            node = node[c]
        return self.END in node                   # word fully present
print(Trie().__class__.__name__)                  # 'Trie'
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Add starts_with + autocomplete via DFS from a prefix node
# STRENGTHS - The full mini API: insert, search, starts_with, complete
# WEAKNESSES- Still nested-dict; no compressed trie
#
class Trie:
    END = "#"
    def __init__(self):
        self.root: dict = {}

    def insert(self, word: str):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node[self.END] = True

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return node is not None and self.END in node

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None

    def autocomplete(self, prefix: str) -> list[str]:
        node = self._walk(prefix)
        if node is None: return []
        out: list[str] = []
        def dfs(n, path):
            if self.END in n: out.append(prefix + path)
            for c, child in n.items():
                if c != self.END:
                    dfs(child, path + c)
        dfs(node, "")
        return out

    def _walk(self, s: str):                      # walk to node; return None if missing
        node = self.root
        for c in s:
            if c not in node: return None
            node = node[c]
        return node

t = Trie()
for w in ["apple", "app", "application", "apt"]:
    t.insert(w)
print(t.starts_with("app"))                       # True
print(sorted(t.autocomplete("app")))              # ['app', 'apple', 'application']
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - TrieNode class for typed code, count/word at each node, deletion, when NOT to use trie
# STRENGTHS - The patterns that turn a trie into real infrastructure
# WEAKNESSES- N/A
#
from typing import Optional

class TrieNode:
    __slots__ = ("children", "word", "count")     # millions of nodes -> memory matters
    def __init__(self):
        self.children: dict[str, "TrieNode"] = {}
        self.word:     Optional[str] = None       # the FULL word at this node, or None
        self.count:    int = 0                     # how many words pass through (for prefix freq)

class Trie:
    def __init__(self): self.root = TrieNode()

    def insert(self, word: str):
        node = self.root
        for c in word:
            node.count += 1
            node = node.children.setdefault(c, TrieNode())
        node.count += 1
        node.word = word

    def delete(self, word: str) -> bool:
        # Delete returns True if a word was actually removed; prunes empty branches
        path: list[tuple[TrieNode, str]] = []
        node = self.root
        for c in word:
            if c not in node.children: return False
            path.append((node, c))
            node = node.children[c]
        if node.word != word: return False
        node.word = None
        # Prune empty subtrees
        for parent, c in reversed(path):
            child = parent.children[c]
            if not child.children and child.word is None:
                del parent.children[c]
            else:
                break
        return True

    def prefix_count(self, prefix: str) -> int:
        node = self.root
        for c in prefix:
            if c not in node.children: return 0
            node = node.children[c]
        return node.count

# 1) DON'T reach for a trie when:
#    - alphabet is huge (Unicode) and tree fan-out blows memory
#    - you only need exact-match lookup -> dict / set is faster and simpler
#    - prefixes are rare -> hash + sorted list is enough

# 2) DO reach for a trie when:
#    - autocomplete / spell-check / IP routing
#    - many words share long prefixes
#    - you need O(L) prefix queries regardless of dictionary size

# 3) Compressed trie / Patricia tree / radix tree — collapse single-child chains
#    into edge labels. Saves a LOT of memory at the cost of code complexity.

# 4) Aho-Corasick — trie with failure links for multi-pattern string matching
#    (find all of N patterns in a text in O(text + matches)).

# Decision rule:
#   exact-match lookup only                 -> set / dict, NOT trie
#   prefix search + small alphabet          -> Trie (nested dict or TrieNode)
#   memory-tight + millions of words         -> compressed trie or DAFSA
#   match many patterns at once              -> Aho-Corasick
#   IP routing / longest-prefix match         -> radix trie
#
# Anti-pattern: storing whole words at every level
#   That's just a list lookup with extra steps. The whole point of a trie is
#   sharing prefixes among nodes. If you find yourself doing it, switch to a set.
```

## Decision Rule

```text
exact-match lookup only                 -> set / dict, NOT trie
prefix search + small alphabet          -> Trie (nested dict or TrieNode)
memory-tight + millions of words         -> compressed trie or DAFSA
match many patterns at once              -> Aho-Corasick
IP routing / longest-prefix match         -> radix trie
```

## Anti-Pattern

> [!warning] Anti-pattern
> storing whole words at every level
>   That's just a list lookup with extra steps. The whole point of a trie is
>   sharing prefixes among nodes. If you find yourself doing it, switch to a set.

## Tips

- The dict-based trie is simpler to write in interviews — nested dicts with a `"#"` end marker
- Tries beat hash sets for prefix queries: `starts_with()` is O(L) regardless of dictionary size
- Space trade-off: tries use more memory than hash sets but enable prefix operations
- `node.setdefault(ch, {})` is the cleanest insert idiom — creates child if absent, returns it

## Common Mistake

> [!warning] Storing full words at every node instead of building the character-by-character tree. This defeats the purpose — shared prefixes should share nodes.

## Shorthand (Junior → Senior)

**Junior:**
```python
result = []
for x in items:
    if x > 0:
        result.append(x)
```

**Senior:**
```python
result = [x for x in items if x > 0]
```

## See Also

- [[Sections/dsa/structures/stack|Stack (Data Structures & Algos)]]
- [[Sections/dsa/structures/queue|Queue (Data Structures & Algos)]]
- [[Sections/dsa/structures/deque|Deque (Data Structures & Algos)]]
- [[Sections/dsa/structures/heap|Heap (Data Structures & Algos)]]
- [[Sections/dsa/structures/_Index|Data Structures & Algos → Core Data Structures & Sorting]]
- [[Sections/dsa/_Index|Data Structures & Algos index]]
- [[_Index|Vault index]]
