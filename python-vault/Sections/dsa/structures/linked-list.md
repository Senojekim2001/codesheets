---
type: "entry"
domain: "python"
file: "dsa"
section: "structures"
id: "linked-list"
title: "Linked List"
category: "Structures"
subtitle: "Singly linked list — common in interview problems"
signature_short: "class ListNode: val; next = None"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Linked List"
  - "linked-list"
tags:
  - "python"
  - "python/dsa"
  - "python/dsa/structures"
  - "category/structures"
  - "tier/tiered"
---

# Linked List

> Singly linked list — common in interview problems

## Overview

Python does not have a built-in linked list (deque is backed by a doubly linked list, but its nodes are not exposed). In interviews you typically receive a ListNode class. Key patterns: traverse, reverse, detect cycle, find middle.

## Signature

```python
class ListNode: val; next = None
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# APPROACH  - The ListNode class + a simple traversal loop
# STRENGTHS - Smallest valid linked-list code; the shape every interview question gives you
# WEAKNESSES- No reversal / cycle / dummy-head patterns
#
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def to_list(head):
    out = []
    while head:                                  # walk until None
        out.append(head.val)
        head = head.next
    return out

head = ListNode(1, ListNode(2, ListNode(3)))
print(to_list(head))                              # [1, 2, 3]
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# APPROACH  - Reverse in place, find middle (slow/fast), detect cycle (Floyd's)
# STRENGTHS - The three pointer patterns 90% of interview problems reduce to
# WEAKNESSES- No dummy-head edge-case discussion
#
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

# 1) REVERSE in place — three pointers; SAVE the next pointer FIRST
def reverse(head):
    prev, cur = None, head
    while cur:
        nxt      = cur.next                       # save before overwriting
        cur.next = prev
        prev, cur = cur, nxt
    return prev                                   # new head

# 2) MIDDLE — slow advances 1, fast advances 2; when fast hits end, slow == middle
def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow

# 3) CYCLE detection — Floyd's tortoise & hare
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:                          # they meet -> cycle exists
            return True
    return False
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# APPROACH  - Dummy head trick, k-th from end, find cycle START, recursive vs iterative
# STRENGTHS - The patterns that turn linked-list problems from puzzles into formulas
# WEAKNESSES- N/A
#
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

# 1) DUMMY HEAD — eliminates "head might be deleted" edge cases
def remove_value(head, target):
    dummy = ListNode(0, head)                     # ALWAYS exists
    prev, cur = dummy, head
    while cur:
        if cur.val == target:
            prev.next = cur.next                  # never need to special-case head
        else:
            prev = cur
        cur = cur.next
    return dummy.next                             # may be different from original head

# 2) K-th from END — two-pointer with k-step lead; ONE pass, O(1) space
def remove_nth_from_end(head, k):
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(k): fast = fast.next            # advance fast k steps
    while fast.next:
        fast, slow = fast.next, slow.next         # walk together; slow ends at (k+1)-th from end
    slow.next = slow.next.next                    # delete the k-th from end
    return dummy.next

# 3) CYCLE START — Floyd's: after meeting, walk one pointer from head and one
#    from the meeting point; they meet at the cycle start.
def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                          # phase 1: detect cycle
            slow = head                           # phase 2: find the start
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow
    return None

# 4) MERGE two sorted lists — dummy + tail pointer
def merge(a, b):
    dummy = tail = ListNode()
    while a and b:
        if a.val <= b.val:
            tail.next, a = a, a.next
        else:
            tail.next, b = b, b.next
        tail = tail.next
    tail.next = a or b                            # attach remaining tail
    return dummy.next

# 5) Recursion vs iteration — Python's stack ~1000 deep; iterative for big inputs
#    Iterative reversal is O(1) space; recursive reversal is O(n) stack space.

# Decision rule:
#   modify around the head                     -> dummy head node
#   "k-th from end" / "remove nth"             -> two-pointer with k-step lead
#   detect cycle existence                       -> Floyd's tortoise & hare
#   find cycle ENTRY                             -> Floyd's + restart from head
#   merge sorted lists                           -> dummy + tail pointer
#   reverse / partition                          -> iterative; recursion blows stack on big inputs
#
# Anti-pattern: cur.next = prev WITHOUT saving cur.next first
#   You've just orphaned the rest of the list. The first line of any reversal
#   loop should be:  nxt = cur.next.
```

## Decision Rule

```text
modify around the head                     -> dummy head node
"k-th from end" / "remove nth"             -> two-pointer with k-step lead
detect cycle existence                       -> Floyd's tortoise & hare
find cycle ENTRY                             -> Floyd's + restart from head
merge sorted lists                           -> dummy + tail pointer
reverse / partition                          -> iterative; recursion blows stack on big inputs
```

## Anti-Pattern

> [!warning] Anti-pattern
> cur.next = prev WITHOUT saving cur.next first
>   You've just orphaned the rest of the list. The first line of any reversal
>   loop should be:  nxt = cur.next.

## Tips

- Always use a dummy head node for insertion/deletion — eliminates edge cases at the true head
- Fast/slow pointers (Floyd's) solve: cycle detection, middle finding, nth-from-end in O(1) space
- Draw the pointer moves on paper before coding — visualizing node reassignment prevents bugs
- In Python interviews, linked list problems often test pointer manipulation, not the language itself

## Common Mistake

> [!warning] Losing the rest of the list during reversal. Save `nxt = cur.next` before overwriting `cur.next = prev`. Failing to save `nxt` first is the most common reversal bug.

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
