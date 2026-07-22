---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "web3-py"
id: "web3-transactions-signing"
title: "build_transaction / sign / send_raw — write to chain"
category: "web3-py"
subtitle: "eth_account.Account.from_key(pk), nonce via w3.eth.get_transaction_count(addr, \"pending\"), build_transaction (chainId, nonce, gas, maxFeePerGas, maxPriorityFeePerGas), sign_transaction, send_raw_transaction, wait_for_transaction_receipt, EIP-1559 vs legacy gasPrice, fee_history for tip estimation"
signature_short: "tx = c.functions.x(args).build_transaction({\"from\": addr, \"nonce\": nonce, \"chainId\": 1, \"maxFeePerGas\": ..., \"maxPriorityFeePerGas\": ...}); signed = acc.sign_transaction(tx); w3.eth.send_raw_transaction(signed.raw_transaction)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "build_transaction / sign / send_raw — write to chain"
  - "web3-transactions-signing"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/web3-py"
  - "category/web3-py"
  - "tier/tiered"
---

# build_transaction / sign / send_raw — write to chain

> eth_account.Account.from_key(pk), nonce via w3.eth.get_transaction_count(addr, "pending"), build_transaction (chainId, nonce, gas, maxFeePerGas, maxPriorityFeePerGas), sign_transaction, send_raw_transaction, wait_for_transaction_receipt, EIP-1559 vs legacy gasPrice, fee_history for tip estimation

## Overview

Every state-changing call goes through this pipeline: build → sign → send → wait. `nonce` must be unique and monotonically increasing per sender; under burst load, fetch with `"pending"` not `"latest"` and increment locally. EIP-1559 chains (Ethereum, most L2s) take `maxFeePerGas` (your ceiling) and `maxPriorityFeePerGas` (the tip). Legacy chains (older Polygon, BSC) take `gasPrice`. `wait_for_transaction_receipt(tx_hash)` blocks until the tx is mined and returns status (1 = success, 0 = revert). Three depths solve the SAME task — send 0.01 ETH from a hot wallet to another address — at depths: minimal eth transfer with hardcoded gas → ERC-20 transfer with EIP-1559 fees and gas estimation → full pipeline with private-key from env, nonce manager, retry on "replacement transaction underpriced", receipt-status check.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Send 0.01 ETH from a hot wallet to another address.
- **Junior** — SAME — but ERC-20 transfer with EIP-1559 fees + gas estimate.
- **Senior** — SAME — ERC-20 transfer — production: nonce manager (avoid "nonce too low / already used" under bursts), retry on "replacement transaction underpriced", explicit revert reason.

## Signature

```python
tx = c.functions.x(args).build_transaction({"from": addr, "nonce": nonce, "chainId": 1, "maxFeePerGas": ..., "maxPriorityFeePerGas": ...}); signed = acc.sign_transaction(tx); w3.eth.send_raw_transaction(signed.raw_transaction)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Send 0.01 ETH from a hot wallet to another address.
# APPROACH  - Hardcoded gas, gasPrice (legacy), build/sign/send/wait.
# STRENGTHS - Demonstrates the full pipeline.
# WEAKNESSES- Uses legacy gasPrice (not EIP-1559); private key in source.
from web3 import Web3
from eth_account import Account

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))

PK = "0xYOURPRIVATEKEYHERE"                          # NEVER hardcode in real code
account = Account.from_key(PK)
to_addr = Web3.to_checksum_address("0xRecipient...")

tx = {
    "from":      account.address,
    "to":        to_addr,
    "value":     w3.to_wei(0.01, "ether"),
    "gas":       21000,                              # ETH transfer is exactly 21000
    "gasPrice":  w3.to_wei(20, "gwei"),              # legacy field
    "nonce":     w3.eth.get_transaction_count(account.address),
    "chainId":   1,
}
signed = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
print("hash:", tx_hash.hex())

receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
print("status:", "success" if receipt.status == 1 else "REVERTED")
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but ERC-20 transfer with EIP-1559 fees + gas estimate.
# APPROACH  - build_transaction on the contract; estimate_gas; fee_history
#             for priority fee.
# STRENGTHS - Right gas + right fee fields; works on EIP-1559 chains.
# WEAKNESSES- Single attempt; no nonce manager.
import os
from web3 import Web3
from eth_account import Account

w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))
account = Account.from_key(os.environ["HOT_WALLET_PK"])

USDC_ABI = [{"name": "transfer", "type": "function", "stateMutability": "nonpayable",
             "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
             "outputs": [{"name": "", "type": "bool"}]}]
usdc = w3.eth.contract(
    address=Web3.to_checksum_address("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    abi=USDC_ABI,
)


def fee_estimate(w3: Web3) -> tuple[int, int]:
    """Return (max_fee, priority_fee) in wei."""
    hist = w3.eth.fee_history(5, "latest", reward_percentiles=[50])
    base = hist["baseFeePerGas"][-1]                   # next-block base fee
    tip  = max(r[0] for r in hist["reward"]) or w3.to_wei(1, "gwei")
    return base * 2 + tip, tip                         # max = 2*base + tip is a common rule of thumb


def send_usdc(to: str, amount_units: int) -> str:
    max_fee, priority = fee_estimate(w3)
    fn = usdc.functions.transfer(Web3.to_checksum_address(to), amount_units)

    tx = fn.build_transaction({
        "from":                  account.address,
        "nonce":                 w3.eth.get_transaction_count(account.address, "pending"),
        "chainId":               1,
        "maxFeePerGas":          max_fee,
        "maxPriorityFeePerGas":  priority,
    })
    # estimate_gas returns the predicted units; pad 20% as a safety buffer.
    tx["gas"] = int(w3.eth.estimate_gas(tx) * 1.2)

    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction).hex()
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
    if receipt.status != 1:
        raise RuntimeError(f"USDC transfer reverted: {tx_hash}")
    return tx_hash


# Send 5 USDC (6 decimals): 5 * 10**6
tx_hash = send_usdc("0xRecipient...", 5_000_000)
print("sent:", tx_hash)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — ERC-20 transfer — production: nonce manager (avoid
#             "nonce too low / already used" under bursts), retry on
#             "replacement transaction underpriced", explicit revert reason.
# APPROACH  - NonceManager class hands out monotonic nonces; if the RPC
#             rejects with "underpriced", re-build with bumped fees.
# STRENGTHS - Survives bursty senders; clear error reporting; safe.
# WEAKNESSES- Local nonce can drift if sender is shared across processes
#             (need a Redis-backed counter for that case).
from __future__ import annotations
import os
import time
import threading
from typing import Optional
from web3 import Web3
from eth_account import Account
from eth_account.signers.local import LocalAccount


class NonceManager:
    """Per-address nonce counter. Single-process safe."""

    def __init__(self, w3: Web3, address: str):
        self.w3 = w3
        self.address = Web3.to_checksum_address(address)
        self._lock = threading.Lock()
        self._next: Optional[int] = None

    def next(self) -> int:
        with self._lock:
            if self._next is None:
                self._next = self.w3.eth.get_transaction_count(self.address, "pending")
            n = self._next
            self._next += 1
            return n

    def reset_from_chain(self) -> None:
        with self._lock:
            self._next = self.w3.eth.get_transaction_count(self.address, "pending")


class TxSender:
    GAS_PAD = 1.2
    MAX_BUMPS = 3
    BUMP_FACTOR = 1.15                                 # +15% per retry

    def __init__(self, w3: Web3, account: LocalAccount):
        self.w3 = w3
        self.account = account
        self.nonces = NonceManager(w3, account.address)

    def _fees(self) -> tuple[int, int]:
        hist = self.w3.eth.fee_history(5, "latest", reward_percentiles=[50])
        base = hist["baseFeePerGas"][-1]
        tip  = max(r[0] for r in hist["reward"]) or self.w3.to_wei(1, "gwei")
        return base * 2 + tip, tip

    def send_contract_call(self, fn, *, chain_id: int, value: int = 0) -> str:
        max_fee, priority = self._fees()
        last_exc = None
        for attempt in range(self.MAX_BUMPS):
            tx = fn.build_transaction({
                "from":                 self.account.address,
                "nonce":                self.nonces.next(),
                "chainId":              chain_id,
                "value":                value,
                "maxFeePerGas":         max_fee,
                "maxPriorityFeePerGas": priority,
            })
            try:
                tx["gas"] = int(self.w3.eth.estimate_gas(tx) * self.GAS_PAD)
            except Exception as e:
                # Revert during estimate -> the tx WILL revert. Surface immediately.
                raise RuntimeError(f"estimate_gas failed (will revert): {e}") from e

            signed = self.account.sign_transaction(tx)
            try:
                tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction).hex()
            except ValueError as e:
                msg = str(e).lower()
                last_exc = e
                if "underpriced" in msg or "replacement transaction" in msg:
                    # Bump fees + reuse nonce path: roll back the nonce and retry hotter.
                    self.nonces.reset_from_chain()
                    max_fee  = int(max_fee  * self.BUMP_FACTOR)
                    priority = int(priority * self.BUMP_FACTOR)
                    continue
                if "nonce too low" in msg:
                    self.nonces.reset_from_chain()
                    continue
                raise

            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
            if receipt.status != 1:
                # Try to extract revert reason via debug_traceTransaction
                # (only available on archive nodes).
                raise RuntimeError(f"reverted: {tx_hash}")
            return tx_hash
        raise RuntimeError(f"send failed after {self.MAX_BUMPS} bumps: {last_exc}")


# ---- Use it ----
w3 = Web3(Web3.HTTPProvider("https://eth-mainnet.g.alchemy.com/v2/<KEY>"))
account = Account.from_key(os.environ["HOT_WALLET_PK"])

usdc = w3.eth.contract(
    address=Web3.to_checksum_address("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"),
    abi=[{"name": "transfer", "type": "function", "stateMutability": "nonpayable",
          "inputs": [{"name": "to", "type": "address"},
                     {"name": "amount", "type": "uint256"}],
          "outputs": [{"name": "", "type": "bool"}]}],
)

sender = TxSender(w3, account)
tx_hash = sender.send_contract_call(
    usdc.functions.transfer(
        Web3.to_checksum_address("0xRecipient..."), 5_000_000,
    ),
    chain_id=1,
)
print("sent:", tx_hash)

# Decision rule:
#   One-shot script                              -> hardcoded gas + send_raw + wait_for_receipt.
#   ERC-20 / contract write                      -> build_transaction + estimate_gas + EIP-1559 fees.
#   Bursty sender (>1 tx/sec)                    -> NonceManager (above) and don't refetch
#                                                    nonce from chain per tx.
#   Multi-process sender                          -> Redis / DB counter for nonce.
#   Need to cancel a stuck tx                    -> resubmit at SAME nonce with HIGHER tip.
#   Need to speed up a pending tx                -> resubmit at SAME nonce with HIGHER fees.
#   Want to know revert reason                   -> static-call (.call()) BEFORE sending; or
#                                                    debug_traceTransaction on archive node.
#   Permitted to reverse on failure               -> always check receipt.status == 1.

# Anti-pattern:
#   tx['nonce'] = w3.eth.get_transaction_count(addr)   # default 'latest'
# 'latest' counts only mined txs - if you have a pending tx, you'll
# reuse the same nonce and one will be replaced. Use 'pending' for
# nonce, OR use a local NonceManager.
```

## Decision Rule

```text
One-shot script                              -> hardcoded gas + send_raw + wait_for_receipt.
ERC-20 / contract write                      -> build_transaction + estimate_gas + EIP-1559 fees.
Bursty sender (>1 tx/sec)                    -> NonceManager (above) and don't refetch
                                                 nonce from chain per tx.
Multi-process sender                          -> Redis / DB counter for nonce.
Need to cancel a stuck tx                    -> resubmit at SAME nonce with HIGHER tip.
Need to speed up a pending tx                -> resubmit at SAME nonce with HIGHER fees.
Want to know revert reason                   -> static-call (.call()) BEFORE sending; or
                                                 debug_traceTransaction on archive node.
Permitted to reverse on failure               -> always check receipt.status == 1.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   tx['nonce'] = w3.eth.get_transaction_count(addr)   # default 'latest'
> 'latest' counts only mined txs - if you have a pending tx, you'll
> reuse the same nonce and one will be replaced. Use 'pending' for
> nonce, OR use a local NonceManager.

## Tips

- EIP-1559 chains use `maxFeePerGas` + `maxPriorityFeePerGas`; legacy chains use `gasPrice`. Don't mix them.
- Always fetch nonce with `get_transaction_count(addr, "pending")` — `"latest"` ignores pending txs and causes nonce reuse.
- Pad `estimate_gas` by 10-20% — gas usage can vary slightly between estimate and execution.
- Receipt `status == 1` means success; `0` means the tx mined but reverted (you still paid gas).
- To cancel/replace a pending tx, resubmit with the SAME nonce and a HIGHER `maxPriorityFeePerGas` (≥10% bump for most nodes).

## Common Mistake

> [!warning] Fetching nonce with the default `"latest"` parameter — your pending txs are invisible, so two transactions get the same nonce and one is silently replaced.

## See Also

- [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events (Web3 / Blockchain)]]
- [[Sections/web3-blockchain/web3-py/_Index|Web3 / Blockchain → web3.py — Ethereum and EVM chains]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
