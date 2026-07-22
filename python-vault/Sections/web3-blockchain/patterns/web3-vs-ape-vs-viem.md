---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "patterns"
id: "web3-vs-ape-vs-viem"
title: "web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit"
category: "patterns"
subtitle: "web3.py (RPC client, scripts, indexers, bots) vs Ape (compile + deploy + test framework, plugin ecosystem) vs Foundry (forge for Solidity dev), Brownie deprecated, viem / ethers.js for JS frontend, Subsquid / The Graph for managed indexers"
signature_short: "# Python script / bot / indexer    -> web3.py\\n# Solidity dev workflow (Python)     -> Ape\\n# Solidity dev (best DX)             -> Foundry (Rust CLI)\\n# Frontend                           -> viem / ethers.js"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit"
  - "web3-vs-ape-vs-viem"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/patterns"
  - "category/patterns"
  - "tier/tiered"
---

# web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit

> web3.py (RPC client, scripts, indexers, bots) vs Ape (compile + deploy + test framework, plugin ecosystem) vs Foundry (forge for Solidity dev), Brownie deprecated, viem / ethers.js for JS frontend, Subsquid / The Graph for managed indexers

## Overview

web3.py is the right pick for: backend services, off-chain bots (arbitrage, MEV, monitoring), indexers, scripts. Ape is the modern equivalent of Brownie (now deprecated) — it's a development framework: compile contracts, run tests, deploy, with a plugin ecosystem (`ape-foundry`, `ape-hardhat`, `ape-etherscan`). Foundry is the gold-standard Solidity dev toolchain (Rust binary), even Python devs use it for compile/test. For frontends, **viem** has overtaken **ethers.js** as the modern TypeScript library. Three depths solve the SAME task — read the latest USDC `Transfer` events — at depths: web3.py script (fine for off-chain) → Ape script with plugin-managed RPC + Etherscan ABI fetch → Subsquid hosted indexer (no Python at runtime; SQL queries against a maintained dataset).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Print the latest USDC Transfer events. With web3.py.
- **Junior** — SAME — Transfer scan — but in Ape (eth-ape) with auto-fetched ABI from Etherscan.
- **Senior** — SAME — historical Transfer scan — production: query a managed indexer (Subsquid / The Graph) instead of running your own RPC scan. Treat it as a SQL/GraphQL data source.

## Signature

```python
# Python script / bot / indexer    -> web3.py\n# Solidity dev workflow (Python)     -> Ape\n# Solidity dev (best DX)             -> Foundry (Rust CLI)\n# Frontend                           -> viem / ethers.js
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Print the latest USDC Transfer events. With web3.py.
# APPROACH  - Library you already know.
# STRENGTHS - Pure Python; works in any backend.
# WEAKNESSES- You manage ABI loading, chain config, retries yourself.
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

ERC20_ABI = [...]                                     # paste from Etherscan
usdc = w3.eth.contract(
    address=Web3.to_checksum_address("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    abi=ERC20_ABI,
)

latest = w3.eth.block_number
events = usdc.events.Transfer.get_logs(fromBlock=latest - 1000, toBlock=latest)
print(f"{len(events)} transfers in last 1000 blocks")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — Transfer scan — but in Ape (eth-ape) with auto-fetched
#             ABI from Etherscan.
# APPROACH  - "ape console" provides a configured Web3-like API; networks
#             and accounts come from ape-config.yaml.
# STRENGTHS - No hand-loaded ABIs; one CLI for compile/test/deploy/scripts.
# WEAKNESSES- Adds a build system (ape) for what is fundamentally an RPC call;
#             best when you ALSO write/deploy Solidity in this repo.
# ape_script.py
# Run with: ape run ape_script   (after configuring networks: ethereum:mainnet:alchemy)
from ape import chain, Contract

USDC = Contract("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48")  # ABI auto-fetched

def main():
    latest = chain.blocks.head.number
    # Ape exposes events as a generator with the same chunking logic.
    events = USDC.Transfer.range(latest - 1000, latest)
    print(f"{sum(1 for _ in events)} transfers")
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — historical Transfer scan — production: query a
#             managed indexer (Subsquid / The Graph) instead of running
#             your own RPC scan. Treat it as a SQL/GraphQL data source.
# APPROACH  - Hit a Subsquid GraphQL endpoint; transform results.
# STRENGTHS - No RPC bills; sub-second queries over millions of blocks;
#             managed reorg handling; cross-chain support.
# WEAKNESSES- Depends on the indexer staying live; cost (Subsquid free tier
#             is generous, ~10M req/month); query language is GraphQL.
import httpx
import asyncio


SUBSQUID_GRAPHQL = "https://squid.subsquid.io/usdc-transfers/graphql"  # example endpoint


QUERY = """
query LatestTransfers($limit: Int!, $to: String) {
  transfers(
    where: { to_eq: $to },
    orderBy: blockNumber_DESC,
    limit: $limit
  ) {
    blockNumber
    from
    to
    amount
    txHash
  }
}
"""


async def latest_transfers(to_addr: str, limit: int = 100):
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            SUBSQUID_GRAPHQL,
            json={"query": QUERY, "variables": {"limit": limit, "to": to_addr.lower()}},
        )
        r.raise_for_status()
        return r.json()["data"]["transfers"]


async def main():
    rows = await latest_transfers("0xRecipient...")
    for r in rows[:5]:
        print(r["blockNumber"], r["from"], "->", int(r["amount"]) / 1e6, "USDC")


# asyncio.run(main())

# Decision rule:
#   Backend / bot / indexer in Python              -> web3.py (raw RPC).
#   Smart-contract project (Solidity + Python)     -> eth-ape (replaces Brownie).
#   Smart-contract project (Solidity, top DX)      -> Foundry (forge); ape can wrap it.
#   Frontend (TypeScript / React)                  -> viem (preferred) or ethers.js v6.
#   Need ABI without copy-paste                     -> ape's Contract(addr) auto-fetches.
#   Need historical scans (>100k blocks)            -> Subsquid / The Graph hosted indexer.
#   Need on-chain SQL                                -> Dune Analytics or Subsquid SQL plugin.
#   Multi-chain in one Python process                -> dict[chain, Web3] - web3.py.
#   You see "Brownie" in tutorials                   -> it's deprecated; use ape.

# Anti-pattern:
#   pip install eth-brownie                         # in 2026
# Brownie was officially deprecated in late 2023. New projects should use
# Ape (eth-ape). Hardhat / Foundry remain best-in-class outside Python.
```

## Decision Rule

```text
Backend / bot / indexer in Python              -> web3.py (raw RPC).
Smart-contract project (Solidity + Python)     -> eth-ape (replaces Brownie).
Smart-contract project (Solidity, top DX)      -> Foundry (forge); ape can wrap it.
Frontend (TypeScript / React)                  -> viem (preferred) or ethers.js v6.
Need ABI without copy-paste                     -> ape's Contract(addr) auto-fetches.
Need historical scans (>100k blocks)            -> Subsquid / The Graph hosted indexer.
Need on-chain SQL                                -> Dune Analytics or Subsquid SQL plugin.
Multi-chain in one Python process                -> dict[chain, Web3] - web3.py.
You see "Brownie" in tutorials                   -> it's deprecated; use ape.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   pip install eth-brownie                         # in 2026
> Brownie was officially deprecated in late 2023. New projects should use
> Ape (eth-ape). Hardhat / Foundry remain best-in-class outside Python.

## Tips

- **web3.py** for backend / bots / indexers / scripts — the workhorse.
- **Ape** (`eth-ape`) is the modern Python smart-contract framework — Brownie is deprecated.
- **Foundry** (Rust binary, `forge`) has the best Solidity dev DX overall — even Python teams use it for compile/test.
- For frontends, **viem** has overtaken **ethers.js** as the TypeScript standard.
- For historical scans at scale, hosted indexers (**Subsquid**, **The Graph**, **Goldsky**) beat self-run RPC scans by 100x.

## Common Mistake

> [!warning] Starting a new project on Brownie. It was deprecated in 2023 — use Ape (`eth-ape`) for Python smart-contract dev.

## See Also

- [[Sections/cv-opencv/practical/cv2-vs-pil-vs-torchvision|cv2 vs PIL vs torchvision — pick the right tool (OpenCV (cv2))]]
- [[Sections/gui-tkinter/patterns/tk-vs-pyqt-vs-web|tkinter vs PyQt/PySide vs Streamlit/web — pick the toolkit (Tkinter)]]
- [[Sections/audio-dsp/patterns/audio-librosa-vs-torchaudio|librosa vs torchaudio vs essentia — pick the audio stack (Audio & DSP)]]
- [[Sections/geospatial/patterns/geo-stack-decision|GeoPandas vs PostGIS vs DuckDB-spatial vs xarray — pick the stack (Geospatial)]]
- [[Sections/web3-blockchain/patterns/_Index|Web3 / Blockchain → When to reach for which library]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
