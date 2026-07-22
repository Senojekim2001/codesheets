---
type: "file-index"
domain: "python"
file: "web3-blockchain"
title: "Web3 / Blockchain"
tags:
  - "python"
  - "python/web3-blockchain"
  - "index"
---

# Web3 / Blockchain

> 6 entries across 3 sections.

## web3.py — Ethereum and EVM chains · 4

- [[Sections/web3-blockchain/web3-py/web3-provider-connect|Web3 / HTTPProvider / multi-chain connect]] — Web3 is the client object: pass it a `Provider` (HTTPProvider, WebsocketProvider, IPCProvider) and call `.is_connected()` to verify. Use Alchemy/Infura/QuickNode for hosted RPCs; for L2s and Polygon, set the chain-id and inject the POA middleware.
- [[Sections/web3-blockchain/web3-py/web3-contract-read|w3.eth.contract / call() — read smart-contract state]] — Load a contract by ABI + address (`w3.eth.contract(address=, abi=)`), call view/pure functions with `.functions.balanceOf(addr).call()`. Reads are free (no gas, no signing). Use ERC-20 ABIs from a library (eth-utils) or Etherscan; never hand-write them.
- [[Sections/web3-blockchain/web3-py/web3-transactions-signing|build_transaction / sign / send_raw — write to chain]] — Writes happen via signed transactions. Pattern: `build_transaction({...nonce, gas, fees...})` → `account.sign_transaction(tx)` → `w3.eth.send_raw_transaction(signed.raw_transaction)` → `wait_for_transaction_receipt(tx_hash)`. Under EIP-1559 you set `maxFeePerGas` and `maxPriorityFeePerGas`, not `gasPrice`.
- [[Sections/web3-blockchain/web3-py/web3-events-logs|get_logs / event filters / decode — read on-chain events]] — Smart-contract events are logged onto the chain. `contract.events.Transfer.get_logs(fromBlock=, toBlock=, argument_filters=)` returns decoded events. For live updates, use `WebsocketProvider` + `eth_subscribe`. Page in chunks (max 5k blocks per call on most public RPCs) and handle reorgs.

## Solana — solana-py + solders · 1

- [[Sections/web3-blockchain/solana/solana-basics|solana-py / solders — query and send on Solana]] — Solana is not EVM. Use `solana-py` (`AsyncClient`) for RPC; `solders` for Rust-fast keypair / pubkey / transaction primitives. Lamports = 10⁻⁹ SOL. Transactions need a recent blockhash, sign with Ed25519, send via `send_transaction`.

## When to reach for which library · 1

- [[Sections/web3-blockchain/patterns/web3-vs-ape-vs-viem|web3.py vs Brownie vs ape vs viem(JS) — pick the toolkit]] — web3.py is the dominant Python EVM library. Brownie is dead (deprecated 2023). Ape (eth-ape) is the modern Python smart-contract dev framework with plugins. For frontend / TypeScript apps, viem (or ethers.js) is the standard — Python is usually backend / indexer / bot.
