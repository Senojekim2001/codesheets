---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "web3-py"
id: "web3-provider-connect"
title: "Web3 / HTTPProvider / multi-chain connect"
category: "web3-py"
subtitle: "Web3(Web3.HTTPProvider(url)), is_connected(), eth.chain_id, geth_poa_middleware for Polygon/BSC/Goerli, multiple Web3 instances per chain, request_kwargs for timeouts/retries, AsyncWeb3 for async I/O"
signature_short: "w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={\"timeout\": 30})); w3.is_connected(); w3.eth.chain_id"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Web3 / HTTPProvider / multi-chain connect"
  - "web3-provider-connect"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/web3-py"
  - "category/web3-py"
  - "tier/tiered"
---

# Web3 / HTTPProvider / multi-chain connect

> Web3(Web3.HTTPProvider(url)), is_connected(), eth.chain_id, geth_poa_middleware for Polygon/BSC/Goerli, multiple Web3 instances per chain, request_kwargs for timeouts/retries, AsyncWeb3 for async I/O

## Overview

Construct one `Web3` per chain you talk to — they're cheap and stateless. The `Provider` choice determines transport: `HTTPProvider` for REST, `WebsocketProvider` for live subscriptions, `IPCProvider` for a local node socket. Polygon, BSC, and Goerli use Proof-of-Authority block headers — without `geth_poa_middleware` injected, `eth.get_block()` raises on the `extraData` length. Three depths solve the SAME task — connect to mainnet and read the latest block — at depths: HTTPProvider + get_block('latest') → multi-chain dict with POA middleware where needed → connection class with retries, timeout, and chain-id verification.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Connect to Ethereum mainnet; print latest block number.
- **Junior** — SAME — connect + latest block — across mainnet, Arbitrum, Polygon. Polygon needs the POA middleware.
- **Senior** — SAME — multi-chain connect — production: connection pool, tenacity retries on transient RPC errors, async client option, request id tracking for debugging.

## Signature

```python
w3 = Web3(Web3.HTTPProvider(rpc_url, request_kwargs={"timeout": 30})); w3.is_connected(); w3.eth.chain_id
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Connect to Ethereum mainnet; print latest block number.
# APPROACH  - Web3 + HTTPProvider; one is_connected() check.
# STRENGTHS - Three lines.
# WEAKNESSES- No retry; no timeout; assumes chain-id without verifying.
from web3 import Web3

RPC = "https://eth-mainnet.g.alchemy.com/v2/<YOUR_KEY>"
w3 = Web3(Web3.HTTPProvider(RPC))
print("connected:", w3.is_connected())
print("chain id:", w3.eth.chain_id)                    # 1 = Ethereum mainnet
print("latest block:", w3.eth.block_number)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — connect + latest block — across mainnet, Arbitrum,
#             Polygon. Polygon needs the POA middleware.
# APPROACH  - Dict of Web3 clients keyed by chain name; inject middleware.
# STRENGTHS - One Web3 per chain; chain-id verified.
# WEAKNESSES- Hardcoded URLs; no retry policy.
from web3 import Web3
from web3.middleware import geth_poa_middleware

CHAINS = {
    "ethereum":  {"rpc": "https://eth-mainnet.g.alchemy.com/v2/<KEY>",      "id": 1,     "poa": False},
    "arbitrum":  {"rpc": "https://arb-mainnet.g.alchemy.com/v2/<KEY>",      "id": 42161, "poa": False},
    "polygon":   {"rpc": "https://polygon-mainnet.g.alchemy.com/v2/<KEY>",  "id": 137,   "poa": True},
}


def connect(name: str) -> Web3:
    cfg = CHAINS[name]
    w3 = Web3(Web3.HTTPProvider(cfg["rpc"], request_kwargs={"timeout": 15}))
    if cfg["poa"]:
        w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    actual = w3.eth.chain_id
    if actual != cfg["id"]:
        raise RuntimeError(f"{name} expected chain id {cfg['id']}, got {actual}")
    return w3


for name in CHAINS:
    w3 = connect(name)
    print(f"{name:>10}: block #{w3.eth.block_number}")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — multi-chain connect — production: connection pool,
#             tenacity retries on transient RPC errors, async client option,
#             request id tracking for debugging.
# APPROACH  - ChainClient class wraps Web3; chain-id sanity check; backoff
#             on RPCError; AsyncWeb3 alternative for hot paths.
# STRENGTHS - Resilient against flaky public RPCs; observable.
# WEAKNESSES- More code; tenacity adds a dep.
from __future__ import annotations
from dataclasses import dataclass
from typing import ClassVar
from web3 import Web3
from web3.middleware import geth_poa_middleware
from web3.exceptions import Web3RPCError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type


@dataclass(frozen=True)
class ChainConfig:
    name: str
    rpc_url: str
    chain_id: int
    is_poa: bool = False
    timeout_s: int = 15


CONFIGS: dict[str, ChainConfig] = {
    "ethereum": ChainConfig("ethereum", "https://eth-mainnet.g.alchemy.com/v2/<KEY>", 1),
    "arbitrum": ChainConfig("arbitrum", "https://arb-mainnet.g.alchemy.com/v2/<KEY>", 42161),
    "polygon":  ChainConfig("polygon",  "https://polygon-mainnet.g.alchemy.com/v2/<KEY>", 137, is_poa=True),
}


class ChainClient:
    """Per-chain Web3 with retry + chain-id verification."""

    _cache: ClassVar[dict[str, "ChainClient"]] = {}

    def __init__(self, cfg: ChainConfig):
        self.cfg = cfg
        self.w3 = Web3(Web3.HTTPProvider(
            cfg.rpc_url, request_kwargs={"timeout": cfg.timeout_s},
        ))
        if cfg.is_poa:
            self.w3.middleware_onion.inject(geth_poa_middleware, layer=0)
        actual = self.w3.eth.chain_id
        if actual != cfg.chain_id:
            raise RuntimeError(f"{cfg.name}: expected chain {cfg.chain_id}, got {actual}")

    @classmethod
    def for_chain(cls, name: str) -> "ChainClient":
        if name not in cls._cache:
            cls._cache[name] = cls(CONFIGS[name])
        return cls._cache[name]

    @retry(
        retry=retry_if_exception_type(Web3RPCError),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=8),
        stop=stop_after_attempt(5),
        reraise=True,
    )
    def latest_block(self) -> int:
        return self.w3.eth.block_number

    @retry(
        retry=retry_if_exception_type(Web3RPCError),
        wait=wait_exponential(multiplier=0.5, min=0.5, max=8),
        stop=stop_after_attempt(5),
        reraise=True,
    )
    def get_block(self, identifier: int | str = "latest"):
        return self.w3.eth.get_block(identifier)


for name in CONFIGS:
    client = ChainClient.for_chain(name)
    print(f"{name:>10}: block #{client.latest_block()}")

# Decision rule:
#   Single chain, scripts                         -> Web3(HTTPProvider(...)).
#   Multiple chains in one app                    -> dict[chain_name, Web3] or class.
#   Polygon / BSC / Goerli / Optimism Bedrock?    -> inject geth_poa_middleware.
#   Need real-time events                         -> WebsocketProvider + filter / subscription.
#   Local node available                          -> IPCProvider (fastest, lowest latency).
#   High request volume                           -> use AsyncWeb3 + asyncio for concurrency.
#   Bursty traffic                                -> tenacity retries + 429 backoff.
#   Public RPC unstable                           -> use a paid provider (Alchemy / Infura /
#                                                    QuickNode); rotate keys via env.

# Anti-pattern:
#   w3 = Web3(Web3.HTTPProvider(url))     # then never check chain_id
# A misconfigured RPC URL (testnet vs mainnet) is the #1 cause of "I sent
# real ETH to the wrong chain". Always assert w3.eth.chain_id at startup.
```

## Decision Rule

```text
Single chain, scripts                         -> Web3(HTTPProvider(...)).
Multiple chains in one app                    -> dict[chain_name, Web3] or class.
Polygon / BSC / Goerli / Optimism Bedrock?    -> inject geth_poa_middleware.
Need real-time events                         -> WebsocketProvider + filter / subscription.
Local node available                          -> IPCProvider (fastest, lowest latency).
High request volume                           -> use AsyncWeb3 + asyncio for concurrency.
Bursty traffic                                -> tenacity retries + 429 backoff.
Public RPC unstable                           -> use a paid provider (Alchemy / Infura /
                                                 QuickNode); rotate keys via env.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   w3 = Web3(Web3.HTTPProvider(url))     # then never check chain_id
> A misconfigured RPC URL (testnet vs mainnet) is the #1 cause of "I sent
> real ETH to the wrong chain". Always assert w3.eth.chain_id at startup.

## Tips

- Always verify `w3.eth.chain_id` at startup — wrong chain = wrong network = lost funds.
- Polygon/BSC/Goerli need `geth_poa_middleware` injected at layer 0 — otherwise `get_block()` raises.
- `HTTPProvider` for queries/transactions; `WebsocketProvider` for `eth_subscribe` (live events); `IPCProvider` for local nodes.
- Pass `request_kwargs={"timeout": 15}` to `HTTPProvider` — defaults vary by version.
- For high-throughput reads, `AsyncWeb3` + `asyncio.gather` outperforms threaded HTTP by 3-10x.

## Common Mistake

> [!warning] Trusting the RPC URL without verifying `chain_id` — a typo can point your "mainnet" code at a testnet (or vice versa). Real money is lost this way every week.

## See Also

- [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/_Index|Web3 / Blockchain → web3.py — Ethereum and EVM chains]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
