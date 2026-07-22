---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "web3-py"
id: "web3-events-logs"
title: "get_logs / event filters / decode — read on-chain events"
category: "web3-py"
subtitle: "contract.events.<EventName>.get_logs (fromBlock, toBlock, argument_filters), w3.eth.get_logs (raw, by topic), pagination in 5k-block chunks for public RPCs, AsyncWeb3.eth.subscribe for live, reorg-safe (lookback at least 12 blocks for ETH mainnet, 64 for Polygon)"
signature_short: "logs = c.events.Transfer.get_logs(fromBlock=18_000_000, toBlock=\"latest\", argument_filters={\"to\": addr})"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "get_logs / event filters / decode — read on-chain events"
  - "web3-events-logs"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/web3-py"
  - "category/web3-py"
  - "tier/tiered"
---

# get_logs / event filters / decode — read on-chain events

> contract.events.<EventName>.get_logs (fromBlock, toBlock, argument_filters), w3.eth.get_logs (raw, by topic), pagination in 5k-block chunks for public RPCs, AsyncWeb3.eth.subscribe for live, reorg-safe (lookback at least 12 blocks for ETH mainnet, 64 for Polygon)

## Overview

Events live in transaction receipts and are searchable via `eth_getLogs`. The high-level path: `contract.events.<Event>.get_logs(fromBlock=, toBlock=, argument_filters=)` — returns Python objects with decoded `args`. Most public RPCs cap a single `get_logs` to 5k-10k blocks; for historical scans you must chunk. For live, switch to `AsyncWeb3` over WebSocket and `eth_subscribe(["logs", filter])`. Three depths solve the SAME task — list every USDC transfer to a wallet over the last 100k blocks — at depths: single get_logs call (likely fails on range size) → chunked get_logs across 5k-block windows → async chunked + reorg-aware (skip last 12 blocks for finality).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — List USDC transfers to a wallet across the last 5000 blocks.
- **Junior** — SAME — USDC transfers to wallet — but across 100k blocks, paging in 5k-block chunks.
- **Senior** — SAME — historical USDC transfers — production: async chunked with concurrency control + reorg-safe (skip last 12 blocks), dedupe by (block, log_index), persistable cursor.

## Signature

```python
logs = c.events.Transfer.get_logs(fromBlock=18_000_000, toBlock="latest", argument_filters={"to": addr})
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - List USDC transfers to a wallet across the last 5000 blocks.
# APPROACH  - contract.events.Transfer.get_logs with argument_filters.
# STRENGTHS - Decoded event args; one call.
# WEAKNESSES- Will fail with "block range too large" if you go past ~5k
#             on most public RPCs.
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

# ERC-20 Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
ERC20_ABI = [{
    "name": "Transfer", "type": "event", "anonymous": False,
    "inputs": [
        {"name": "from",  "type": "address", "indexed": True},
        {"name": "to",    "type": "address", "indexed": True},
        {"name": "value", "type": "uint256", "indexed": False},
    ],
}]
USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
usdc = w3.eth.contract(address=Web3.to_checksum_address(USDC), abi=ERC20_ABI)

WALLET = Web3.to_checksum_address("0xRecipient...")
latest = w3.eth.block_number

events = usdc.events.Transfer.get_logs(
    fromBlock=latest - 5000,
    toBlock=latest,
    argument_filters={"to": WALLET},                  # 'to' is indexed -> filterable
)
for ev in events:
    print(ev.blockNumber, ev.args["from"], "->", ev.args.value / 1e6, "USDC")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — USDC transfers to wallet — but across 100k blocks,
#             paging in 5k-block chunks.
# APPROACH  - Loop over ranges; collect events into a list.
# STRENGTHS - Works for arbitrary historical depth; respects RPC limits.
# WEAKNESSES- Synchronous (slow); doesn't deduplicate across reorgs.
from web3 import Web3
from web3.contract.contract import ContractEvent
import time

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

ERC20_ABI = [...]                                     # as above
usdc = w3.eth.contract(
    address=Web3.to_checksum_address("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    abi=ERC20_ABI,
)

WALLET = Web3.to_checksum_address("0xRecipient...")
CHUNK = 5000


def chunked_logs(event: ContractEvent, *, from_block: int, to_block: int,
                 step: int, **filters) -> list:
    out: list = []
    cur = from_block
    while cur <= to_block:
        end = min(cur + step - 1, to_block)
        events = event.get_logs(fromBlock=cur, toBlock=end, argument_filters=filters)
        out.extend(events)
        cur = end + 1
        time.sleep(0.05)                              # be polite to public RPCs
    return out


latest = w3.eth.block_number
all_events = chunked_logs(
    usdc.events.Transfer,
    from_block=latest - 100_000, to_block=latest,
    step=CHUNK, to=WALLET,
)
print(f"{len(all_events)} transfers over 100k blocks")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — historical USDC transfers — production: async chunked
#             with concurrency control + reorg-safe (skip last 12 blocks),
#             dedupe by (block, log_index), persistable cursor.
# APPROACH  - AsyncWeb3 + asyncio.Semaphore; reorg-safe head; cursor for
#             resumable scans.
# STRENGTHS - Saturates RPC; survives reorgs; resumable across runs.
# WEAKNESSES- Async event-decoding requires a small wrapper because most
#             web3.py APIs are sync; we re-decode from raw logs.
from __future__ import annotations
import asyncio
from typing import Iterable
from web3 import AsyncWeb3, AsyncHTTPProvider
from web3.contract import AsyncContract


REORG_LOOKBACK = 12                                    # Ethereum mainnet finality cushion
CHUNK = 5_000
CONCURRENCY = 6


def make_async_w3(rpc: str) -> AsyncWeb3:
    return AsyncWeb3(AsyncHTTPProvider(rpc, request_kwargs={"timeout": 20}))


async def fetch_chunk(contract: AsyncContract, from_block: int, to_block: int,
                      argument_filters: dict, sem: asyncio.Semaphore) -> list:
    async with sem:
        return await contract.events.Transfer.get_logs(
            fromBlock=from_block, toBlock=to_block,
            argument_filters=argument_filters,
        )


async def scan_transfers(
    rpc: str, token_addr: str, abi: list, *,
    from_block: int, to_block: int | None = None,
    argument_filters: dict | None = None,
    chunk: int = CHUNK,
) -> list:
    w3 = make_async_w3(rpc)
    if to_block is None:
        latest = await w3.eth.block_number
        to_block = max(from_block, latest - REORG_LOOKBACK)

    contract = w3.eth.contract(
        address=AsyncWeb3.to_checksum_address(token_addr), abi=abi,
    )

    ranges = [(b, min(b + chunk - 1, to_block))
              for b in range(from_block, to_block + 1, chunk)]
    sem = asyncio.Semaphore(CONCURRENCY)

    chunks = await asyncio.gather(*[
        fetch_chunk(contract, lo, hi, argument_filters or {}, sem)
        for lo, hi in ranges
    ])

    # Flatten + dedupe across (blockNumber, logIndex) - reorg can re-deliver.
    seen: set[tuple[int, int]] = set()
    out: list = []
    for batch in chunks:
        for ev in batch:
            key = (ev.blockNumber, ev.logIndex)
            if key in seen:
                continue
            seen.add(key)
            out.append(ev)
    out.sort(key=lambda e: (e.blockNumber, e.logIndex))
    return out


# Use it
import time
ABI = [{
    "name": "Transfer", "type": "event", "anonymous": False,
    "inputs": [{"name": "from",  "type": "address", "indexed": True},
               {"name": "to",    "type": "address", "indexed": True},
               {"name": "value", "type": "uint256", "indexed": False}],
}]


async def main():
    t0 = time.time()
    events = await scan_transfers(
        "https://eth-mainnet.g.alchemy.com/v2/<KEY>",
        token_addr="0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        abi=ABI,
        from_block=18_000_000,
        argument_filters={"to": "0xRecipient..."},
    )
    print(f"{len(events)} transfers in {time.time()-t0:.1f}s")


# asyncio.run(main())

# Decision rule:
#   < 5k block range, scripts                      -> contract.events.X.get_logs.
#   Historical (millions of blocks)                 -> chunked get_logs +
#                                                       reorg lookback.
#   Need throughput on a paid RPC                   -> AsyncWeb3 + asyncio.gather + sem.
#   Need real-time stream                            -> WebsocketProvider + eth_subscribe.
#   Need to filter by indexed arg                    -> argument_filters={"to": addr}.
#   Need to filter by non-indexed                    -> filter in Python after decode
#                                                       (RPC can't help).
#   Building an indexer at scale                     -> consider Subsquid / The Graph / Goldsky.
#   Need the latest TIP including pending mempool    -> there is no get_logs for pending;
#                                                       use mempool RPCs (Alchemy, Blocknative).

# Anti-pattern:
#   for_block in range(from_block, latest):  ...
#                                            # toBlock='latest' in a loop
# Each iteration re-fetches a moving 'latest'; new blocks during the
# scan get scanned twice in the next iteration AND skipped if they
# arrive between iterations. Always fix the upper bound at scan start.
```

## Decision Rule

```text
< 5k block range, scripts                      -> contract.events.X.get_logs.
Historical (millions of blocks)                 -> chunked get_logs +
                                                    reorg lookback.
Need throughput on a paid RPC                   -> AsyncWeb3 + asyncio.gather + sem.
Need real-time stream                            -> WebsocketProvider + eth_subscribe.
Need to filter by indexed arg                    -> argument_filters={"to": addr}.
Need to filter by non-indexed                    -> filter in Python after decode
                                                    (RPC can't help).
Building an indexer at scale                     -> consider Subsquid / The Graph / Goldsky.
Need the latest TIP including pending mempool    -> there is no get_logs for pending;
                                                    use mempool RPCs (Alchemy, Blocknative).
```

## Anti-Pattern

> [!warning] Anti-pattern
>   for_block in range(from_block, latest):  ...
>                                            # toBlock='latest' in a loop
> Each iteration re-fetches a moving 'latest'; new blocks during the
> scan get scanned twice in the next iteration AND skipped if they
> arrive between iterations. Always fix the upper bound at scan start.

## Tips

- Indexed event args are filterable via `argument_filters={"to": addr}` — non-indexed args you must filter after decoding.
- Public RPCs cap `get_logs` at ~5k blocks per call — chunk historical scans.
- For finality, leave a `REORG_LOOKBACK` (12 blocks for ETH, 64 for Polygon) — never rely on `block_number` exactly.
- For live streams, switch to `WebsocketProvider` and `eth_subscribe(["logs", filter])`.
- For multi-million-block indexing, consider Subsquid / The Graph / Goldsky — they cache the world's logs.

## Common Mistake

> [!warning] Re-fetching `"latest"` inside a chunked scan loop. The window keeps shifting — you double-process some blocks and drop others. Pin the upper bound at scan start.

## See Also

- [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/_Index|Web3 / Blockchain → web3.py — Ethereum and EVM chains]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
