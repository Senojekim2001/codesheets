---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "web3-py"
id: "web3-contract-read"
title: "w3.eth.contract / call() — read smart-contract state"
category: "web3-py"
subtitle: "w3.eth.contract(address=, abi=), Web3.to_checksum_address (always normalize), .functions.<fn>(args).call(block_identifier=) for view/pure, multicall3 for batched reads, ABI loading from JSON file or @web3 utils, decimals + unit conversion (wei -> ETH)"
signature_short: "erc20 = w3.eth.contract(address=Web3.to_checksum_address(addr), abi=ERC20_ABI); bal = erc20.functions.balanceOf(holder).call()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "w3.eth.contract / call() — read smart-contract state"
  - "web3-contract-read"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/web3-py"
  - "category/web3-py"
  - "tier/tiered"
---

# w3.eth.contract / call() — read smart-contract state

> w3.eth.contract(address=, abi=), Web3.to_checksum_address (always normalize), .functions.<fn>(args).call(block_identifier=) for view/pure, multicall3 for batched reads, ABI loading from JSON file or @web3 utils, decimals + unit conversion (wei -> ETH)

## Overview

A `Contract` is the typed Python view of an on-chain contract. `to_checksum_address` MUST wrap any user-supplied address (web3.py raises on non-checksummed input). Reads — `view`/`pure` functions — go through `.call()` and consume no gas. Token balances always come back in base units (`wei` for ETH, `10**decimals` for ERC-20s) — convert with `Web3.from_wei(value, "ether")` or divide by `10**decimals`. Three depths solve the SAME task — read the USDC balance of a wallet — at depths: minimal call returning raw integer → fetch decimals + format as USDC → batched multicall reading balance + decimals + symbol in a single RPC call.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Read the USDC balance of a wallet.
- **Junior** — SAME — USDC balance — but fetch decimals + symbol so the output is human-readable.
- **Senior** — SAME — token balances — production: batch balanceOf calls across many wallets via Multicall3 (one RPC round-trip).

## Signature

```python
erc20 = w3.eth.contract(address=Web3.to_checksum_address(addr), abi=ERC20_ABI); bal = erc20.functions.balanceOf(holder).call()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Read the USDC balance of a wallet.
# APPROACH  - Bare contract.functions.balanceOf(addr).call().
# STRENGTHS - Three lines.
# WEAKNESSES- Result is raw integer in 6-decimal units; no formatting;
#             addresses must be checksummed manually.
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

# Minimal ERC-20 ABI - just the function we need.
ERC20_ABI = [{
    "name": "balanceOf",
    "type": "function",
    "stateMutability": "view",
    "inputs":  [{"name": "owner", "type": "address"}],
    "outputs": [{"name": "balance", "type": "uint256"}],
}]

USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"   # USDC contract on mainnet
HOLDER = "0xF977814e90dA44bFA03b6295A0616a897441aceC" # Binance hot wallet

usdc = w3.eth.contract(address=Web3.to_checksum_address(USDC), abi=ERC20_ABI)
raw = usdc.functions.balanceOf(Web3.to_checksum_address(HOLDER)).call()
print("raw balance:", raw)                            # e.g. 12345678000000  (6 decimals)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — USDC balance — but fetch decimals + symbol so the
#             output is human-readable.
# APPROACH  - Three calls (symbol, decimals, balanceOf); format with /10**d.
# STRENGTHS - Works for any ERC-20, not just USDC.
# WEAKNESSES- 3 RPC round-trips per token; expensive for portfolios.
from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

# Slightly bigger ABI: symbol + decimals + balanceOf.
ERC20_ABI = [
    {"name": "symbol",   "type": "function", "stateMutability": "view",
     "inputs": [], "outputs": [{"name": "", "type": "string"}]},
    {"name": "decimals", "type": "function", "stateMutability": "view",
     "inputs": [], "outputs": [{"name": "", "type": "uint8"}]},
    {"name": "balanceOf","type": "function", "stateMutability": "view",
     "inputs": [{"name": "owner", "type": "address"}],
     "outputs": [{"name": "", "type": "uint256"}]},
]


def token_balance(token_addr: str, holder: str) -> dict:
    token = w3.eth.contract(
        address=Web3.to_checksum_address(token_addr), abi=ERC20_ABI
    )
    holder_cs = Web3.to_checksum_address(holder)

    decimals = token.functions.decimals().call()
    symbol   = token.functions.symbol().call()
    raw      = token.functions.balanceOf(holder_cs).call()
    return {"symbol": symbol, "raw": raw,
            "amount": raw / (10 ** decimals), "decimals": decimals}


print(token_balance(
    "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",     # USDC
    "0xF977814e90dA44bFA03b6295A0616a897441aceC",     # Binance hot
))
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — token balances — production: batch balanceOf calls
#             across many wallets via Multicall3 (one RPC round-trip).
# APPROACH  - Multicall3 contract aggregates many calls; decode results.
# STRENGTHS - 1 RPC round-trip for N reads (vs N round-trips); ~50x faster
#             on Alchemy free tier; rate-limit friendly.
# WEAKNESSES- Multicall3 must be deployed on the chain (it is on every
#             major EVM chain); ABI/decoding is more involved.
from __future__ import annotations
from web3 import Web3
from eth_abi import encode, decode
from eth_utils import keccak


# Multicall3 is at the SAME address on every major EVM chain.
MULTICALL3 = "0xcA11bde05977b3631167028862bE2a173976CA11"
MULTICALL3_ABI = [{
    "name": "aggregate3",
    "type": "function",
    "stateMutability": "view",
    "inputs": [{
        "name": "calls", "type": "tuple[]",
        "components": [
            {"name": "target",       "type": "address"},
            {"name": "allowFailure", "type": "bool"},
            {"name": "callData",     "type": "bytes"},
        ],
    }],
    "outputs": [{
        "name": "returnData", "type": "tuple[]",
        "components": [
            {"name": "success",    "type": "bool"},
            {"name": "returnData", "type": "bytes"},
        ],
    }],
}]


def selector(signature: str) -> bytes:
    """4-byte function selector from a Solidity signature like 'balanceOf(address)'."""
    return keccak(text=signature)[:4]


def encode_call(signature: str, types: list[str], values: list) -> bytes:
    return selector(signature) + encode(types, values)


def batch_token_balances(
    w3: Web3, token_addr: str, holders: list[str],
) -> dict[str, int]:
    """One RPC round trip for N balanceOf calls."""
    multicall = w3.eth.contract(
        address=Web3.to_checksum_address(MULTICALL3), abi=MULTICALL3_ABI,
    )
    calls = [(
        Web3.to_checksum_address(token_addr),
        True,                                          # allowFailure
        encode_call("balanceOf(address)", ["address"],
                    [Web3.to_checksum_address(h)]),
    ) for h in holders]

    results = multicall.functions.aggregate3(calls).call()
    out: dict[str, int] = {}
    for holder, (ok, data) in zip(holders, results):
        if not ok or len(data) == 0:
            out[holder] = -1                          # mark failure
            continue
        (balance,) = decode(["uint256"], data)
        out[holder] = balance
    return out


w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
holders = [
    "0xF977814e90dA44bFA03b6295A0616a897441aceC",     # Binance
    "0x28C6c06298d514Db089934071355E5743bf21d60",     # Binance 14
    "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503",     # Binance 16
]
balances = batch_token_balances(w3, USDC, holders)
for addr, raw in balances.items():
    print(f"{addr}: {raw / 1_000_000:>12,.2f} USDC")

# Decision rule:
#   One read, one address                       -> contract.functions.x(args).call().
#   Need historical state                       -> .call(block_identifier=12345678).
#   Many reads of the SAME contract             -> still N round-trips; consider multicall.
#   Many reads across DIFFERENT contracts       -> Multicall3.aggregate3 (one round-trip).
#   Need to handle a partial failure            -> aggregate3 with allowFailure=True per call.
#   Need to read events (past)                  -> get_logs (next entry).
#   Need to react to events (live)              -> WebsocketProvider + eth_subscribe.
#   Need ABI for a verified contract             -> Etherscan API "getsourcecode" -> ABI.

# Anti-pattern:
#   contract.functions.balanceOf("0xabcd...").call()
#                                # lowercase address -> InvalidAddress
# web3.py 6+ enforces EIP-55 checksum addresses. ALWAYS wrap user input
# with Web3.to_checksum_address(...) before passing to a contract call.
```

## Decision Rule

```text
One read, one address                       -> contract.functions.x(args).call().
Need historical state                       -> .call(block_identifier=12345678).
Many reads of the SAME contract             -> still N round-trips; consider multicall.
Many reads across DIFFERENT contracts       -> Multicall3.aggregate3 (one round-trip).
Need to handle a partial failure            -> aggregate3 with allowFailure=True per call.
Need to read events (past)                  -> get_logs (next entry).
Need to react to events (live)              -> WebsocketProvider + eth_subscribe.
Need ABI for a verified contract             -> Etherscan API "getsourcecode" -> ABI.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   contract.functions.balanceOf("0xabcd...").call()
>                                # lowercase address -> InvalidAddress
> web3.py 6+ enforces EIP-55 checksum addresses. ALWAYS wrap user input
> with Web3.to_checksum_address(...) before passing to a contract call.

## Tips

- Always wrap addresses with `Web3.to_checksum_address(...)` — web3.py 6+ rejects non-checksummed input.
- View/pure function calls (`.call()`) cost zero gas and need no signing — they're free reads.
- Token amounts are in base units (wei, or `10**decimals` for ERC-20s) — divide by `10**decimals` for human values.
- Use **Multicall3** (`0xcA11bde05977b3631167028862bE2a173976CA11`, same address on every EVM chain) to batch many reads into one RPC call.
- For historical state, pass `block_identifier=N` to `.call()` — the node must be an archive node (most public RPCs aren't).

## Common Mistake

> [!warning] Calling `.functions.balanceOf("0xabcd...")` with a lowercase address — `InvalidAddress` is raised. Always `Web3.to_checksum_address(addr)` first.

## See Also

- [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/_Index|Web3 / Blockchain → web3.py — Ethereum and EVM chains]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
