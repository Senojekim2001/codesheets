---
type: "entry"
domain: "python"
file: "web3-blockchain"
section: "solana"
id: "solana-basics"
title: "solana-py / solders — query and send on Solana"
category: "solana"
subtitle: "solana.rpc.async_api.AsyncClient, solders.keypair.Keypair, solders.pubkey.Pubkey, get_balance / get_token_accounts_by_owner, lamports (1 SOL = 1e9 lamports), recent blockhash + Ed25519 signing, send_transaction + confirm_transaction, devnet vs mainnet-beta"
signature_short: "client = AsyncClient(\"https://api.mainnet-beta.solana.com\"); resp = await client.get_balance(Pubkey.from_string(addr)); lamports = resp.value"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "solana-py / solders — query and send on Solana"
  - "solana-basics"
tags:
  - "python"
  - "python/web3-blockchain"
  - "python/web3-blockchain/solana"
  - "category/solana"
  - "tier/tiered"
---

# solana-py / solders — query and send on Solana

> solana.rpc.async_api.AsyncClient, solders.keypair.Keypair, solders.pubkey.Pubkey, get_balance / get_token_accounts_by_owner, lamports (1 SOL = 1e9 lamports), recent blockhash + Ed25519 signing, send_transaction + confirm_transaction, devnet vs mainnet-beta

## Overview

Solana model: programs (smart contracts), accounts (state), no built-in token standard — SPL tokens are stored in `TokenAccount` objects owned by the SPL Token program. Reads are RPC calls returning `Resp` objects with a `.value` field. To send, build a `Transaction` with instructions, set the recent blockhash, sign, send. Three depths solve the SAME task — query the SOL balance of a wallet — at depths: AsyncClient + get_balance → balance + SPL token list with decimals → transfer SOL between two keypairs (build, sign, send, confirm).

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Get the SOL balance of a wallet on mainnet.
- **Junior** — SAME — wallet info — plus SPL token balances.
- **Senior** — SAME — Solana wallet ops — production: send 0.001 SOL between two keypairs (build, sign, send, confirm) with retries.

## Signature

```python
client = AsyncClient("https://api.mainnet-beta.solana.com"); resp = await client.get_balance(Pubkey.from_string(addr)); lamports = resp.value
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Get the SOL balance of a wallet on mainnet.
# APPROACH  - AsyncClient + get_balance.
# STRENGTHS - Two calls.
# WEAKNESSES- Returns lamports; needs / 1e9 for SOL display.
import asyncio
from solana.rpc.async_api import AsyncClient
from solders.pubkey import Pubkey

WALLET = "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"  # example


async def main():
    async with AsyncClient("https://api.mainnet-beta.solana.com") as client:
        resp = await client.get_balance(Pubkey.from_string(WALLET))
        lamports = resp.value
        print(f"{lamports} lamports = {lamports / 1e9:.6f} SOL")


asyncio.run(main())
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — wallet info — plus SPL token balances.
# APPROACH  - get_token_accounts_by_owner; parse mint + amount + decimals.
# STRENGTHS - Lists every SPL token the wallet holds.
# WEAKNESSES- Doesn't resolve mint -> symbol (need a token registry).
import asyncio
from solana.rpc.async_api import AsyncClient
from solana.rpc.types import TokenAccountOpts
from solders.pubkey import Pubkey

SPL_TOKEN_PROGRAM_ID = Pubkey.from_string("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
WALLET = "vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg"


async def main():
    async with AsyncClient("https://api.mainnet-beta.solana.com") as client:
        owner = Pubkey.from_string(WALLET)

        # SOL
        sol_resp = await client.get_balance(owner)
        print(f"SOL: {sol_resp.value / 1e9:.6f}")

        # SPL token accounts owned by this wallet.
        opts = TokenAccountOpts(program_id=SPL_TOKEN_PROGRAM_ID, encoding="jsonParsed")
        resp = await client.get_token_accounts_by_owner_json_parsed(owner, opts)

        for acc in resp.value:
            info = acc.account.data.parsed["info"]
            mint    = info["mint"]
            amount  = int(info["tokenAmount"]["amount"])
            decimals = info["tokenAmount"]["decimals"]
            ui      = amount / (10 ** decimals)
            if ui > 0:
                print(f"  {mint}: {ui}")


asyncio.run(main())
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — Solana wallet ops — production: send 0.001 SOL between
#             two keypairs (build, sign, send, confirm) with retries.
# APPROACH  - solders Transaction + recent blockhash; Ed25519 signing;
#             confirm_transaction with timeout.
# STRENGTHS - Real send/confirm flow; mirrors what an exchange would do.
# WEAKNESSES- Mainnet ops cost real SOL; do this on devnet first.
from __future__ import annotations
import asyncio
import os
from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Confirmed
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import Transaction
from solders.message import Message
from solders.system_program import TransferParams, transfer


async def send_sol(rpc_url: str, sender_secret_b58: str, to_addr: str,
                   sol_amount: float, *, max_attempts: int = 3) -> str:
    """Send SOL from sender to recipient. Returns transaction signature."""
    sender = Keypair.from_base58_string(sender_secret_b58)
    recipient = Pubkey.from_string(to_addr)
    lamports = int(sol_amount * 1_000_000_000)

    async with AsyncClient(rpc_url, commitment=Confirmed) as client:
        last_err = None
        for attempt in range(max_attempts):
            try:
                # Recent blockhash is required and must be FRESH (~150 slots ~= 1 minute).
                recent = await client.get_latest_blockhash()
                blockhash = recent.value.blockhash

                ix = transfer(TransferParams(
                    from_pubkey=sender.pubkey(),
                    to_pubkey=recipient,
                    lamports=lamports,
                ))
                msg = Message.new_with_blockhash(
                    [ix], sender.pubkey(), blockhash,
                )
                tx = Transaction([sender], msg, blockhash)

                send_resp = await client.send_transaction(tx)
                sig = send_resp.value
                print(f"sig: {sig}")

                # Wait for confirmation.
                confirmed = await client.confirm_transaction(sig, commitment=Confirmed,
                                                             sleep_seconds=0.5)
                if confirmed.value[0].err:
                    raise RuntimeError(f"on-chain error: {confirmed.value[0].err}")
                return str(sig)
            except Exception as e:
                last_err = e
                # 'BlockhashNotFound' or rate limits -> retry with fresh blockhash.
                await asyncio.sleep(1.0 * (attempt + 1))
        raise RuntimeError(f"send failed after {max_attempts} attempts: {last_err}")


async def main():
    sig = await send_sol(
        rpc_url="https://api.devnet.solana.com",
        sender_secret_b58=os.environ["SOL_SENDER_SECRET"],
        to_addr="vines1vzrYbzLMRdu58ou5XTby4qAqVRLmqo36NKPTg",
        sol_amount=0.001,
    )
    print(f"confirmed: {sig}")


# asyncio.run(main())

# Decision rule:
#   Read SOL balance                                  -> AsyncClient.get_balance.
#   Read SPL token balances                           -> get_token_accounts_by_owner_json_parsed.
#   Send SOL                                          -> system_program.transfer + sign + send.
#   Send SPL token                                    -> spl.token.instructions.transfer (NOT SOL one).
#   Talk to a custom Anchor program                   -> anchorpy library.
#   Need historical transactions                       -> get_signatures_for_address + get_transaction.
#   Need real-time                                     -> websockets RPC subscribe.
#   Need fast keypair/pubkey ops                       -> solders (Rust); avoid the older solana.publickey.

# Anti-pattern:
#   tx = Transaction([], msg, blockhash)              # forgot the signer
# Solana txs ARE the signature container - building without signers
# yields an unsigned tx the RPC will reject as "invalid signature".
```

## Decision Rule

```text
Read SOL balance                                  -> AsyncClient.get_balance.
Read SPL token balances                           -> get_token_accounts_by_owner_json_parsed.
Send SOL                                          -> system_program.transfer + sign + send.
Send SPL token                                    -> spl.token.instructions.transfer (NOT SOL one).
Talk to a custom Anchor program                   -> anchorpy library.
Need historical transactions                       -> get_signatures_for_address + get_transaction.
Need real-time                                     -> websockets RPC subscribe.
Need fast keypair/pubkey ops                       -> solders (Rust); avoid the older solana.publickey.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   tx = Transaction([], msg, blockhash)              # forgot the signer
> Solana txs ARE the signature container - building without signers
> yields an unsigned tx the RPC will reject as "invalid signature".

## Tips

- 1 SOL = 10⁹ lamports — convert with `/ 1e9` for display, `int(sol * 1e9)` for sends.
- Use `solders` for keypair/pubkey/transaction (Rust speed); `solana-py` for the RPC client.
- A transaction MUST include a recent blockhash (~150 slots = ~1 min lifetime); build, then sign, then send.
- For SPL tokens, the wallet doesn't hold them directly — you query token accounts owned by the wallet.
- Always test on **devnet** first (`https://api.devnet.solana.com`) — `solana airdrop` gives free devnet SOL.

## Common Mistake

> [!warning] Building a `Transaction` without including the signer keypair — the RPC rejects it as "invalid signature". Pass signers to the `Transaction` constructor.

## See Also

- [[Sections/web3-blockchain/solana/_Index|Web3 / Blockchain → Solana — solana-py + solders]]
- [[Sections/web3-blockchain/_Index|Web3 / Blockchain index]]
- [[_Index|Vault index]]
