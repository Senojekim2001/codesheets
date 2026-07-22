---
type: "entry"
domain: "python"
file: "network-protocols"
section: "low-level"
id: "scapy-sniff-craft"
title: "scapy.sniff / send / packet crafting"
category: "low-level"
subtitle: "scapy.all (sniff, send, sendp, sr1 for one request/reply), packet construction via /-operator (Ether()/IP()/TCP()/Raw()), BPF filters (\"tcp port 80 and host 1.2.3.4\"), packet.show() / .summary() / .haslayer / [Layer], wrpcap / rdpcap for pcap I/O, requires CAP_NET_RAW or root"
signature_short: "sniff(iface=\"eth0\", filter=\"tcp port 80\", prn=lambda p: p.summary(), count=10); pkt = IP(dst=\"1.2.3.4\")/TCP(dport=80)/Raw(b\"GET / HTTP/1.0\\r\\n\\r\\n\"); send(pkt)"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "scapy.sniff / send / packet crafting"
  - "scapy-sniff-craft"
tags:
  - "python"
  - "python/network-protocols"
  - "python/network-protocols/low-level"
  - "category/low-level"
  - "tier/tiered"
---

# scapy.sniff / send / packet crafting

> scapy.all (sniff, send, sendp, sr1 for one request/reply), packet construction via /-operator (Ether()/IP()/TCP()/Raw()), BPF filters ("tcp port 80 and host 1.2.3.4"), packet.show() / .summary() / .haslayer / [Layer], wrpcap / rdpcap for pcap I/O, requires CAP_NET_RAW or root

## Overview

Construct packets by `/`-stacking layers: `IP(dst=...)/TCP(dport=80, flags="S")/Raw(b"...")`. `sniff(filter=BPF, prn=cb, count=N, iface=)` runs the kernel BPF filter and calls `cb(pkt)` per match. `send(pkt)` transmits at layer 3 (IP, the kernel handles routing + ARP); `sendp(pkt)` transmits at layer 2 (you supply the Ethernet frame). For request/response in one call, `sr1(pkt, timeout=)` is the right tool. Three depths solve the SAME task — count incoming HTTP-port SYNs over 60 s — at depths: simple sniff + counter → BPF filter + summary printer → multi-iface sniff with per-source rate counter, pcap snapshot, and graceful Ctrl-C.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Print every packet seen for 10 seconds.
- **Junior** — SAME — count SYN packets to TCP port 80 for 60 seconds.
- **Senior** — SAME — port-80 SYN counter — production: per-source rate tracker, pcap snapshot of suspicious sources, signal-aware stop, structured summary.

## Signature

```python
sniff(iface="eth0", filter="tcp port 80", prn=lambda p: p.summary(), count=10); pkt = IP(dst="1.2.3.4")/TCP(dport=80)/Raw(b"GET / HTTP/1.0\r\n\r\n"); send(pkt)
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Print every packet seen for 10 seconds.
# APPROACH  - sniff with a Python callback.
# STRENGTHS - Three lines.
# WEAKNESSES- No filter (huge volume); needs root; not portable
#             to Windows without Npcap.
from scapy.all import sniff

def show(p):
    print(p.summary())

# count=0 + timeout=10 means "capture for 10 seconds".
sniff(prn=show, count=0, timeout=10)
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — count SYN packets to TCP port 80 for 60 seconds.
# APPROACH  - BPF filter offloads the work to the kernel; closure counter.
# STRENGTHS - Massive perf win - kernel discards non-matching packets.
# WEAKNESSES- BPF filter syntax is its own thing (tcpdump syntax).
from scapy.all import sniff, TCP


count = {"syn": 0, "total": 0}


def on_packet(p):
    count["total"] += 1
    if p.haslayer(TCP) and p[TCP].flags & 0x02:        # SYN bit
        count["syn"] += 1


sniff(
    iface="eth0",
    filter="tcp port 80",                              # BPF / pcap-filter syntax
    prn=on_packet,
    timeout=60,
    store=False,                                        # don't keep packets in RAM
)

print("totals:", count)
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — port-80 SYN counter — production: per-source rate
#             tracker, pcap snapshot of suspicious sources, signal-aware
#             stop, structured summary.
# APPROACH  - Track per-IP SYN counts; if a source exceeds threshold,
#             save its packets to a pcap; AsyncSniffer lets us stop
#             cleanly on SIGINT.
# STRENGTHS - Detects SYN floods; preserves evidence; clean shutdown.
# WEAKNESSES- Single-process; for high-rate captures you want
#             tcpdump | scapy or a kernel-bypass library.
from __future__ import annotations
import signal
import time
from collections import defaultdict, deque
from scapy.all import AsyncSniffer, TCP, IP, wrpcap


THRESHOLD_PER_MIN = 100
WINDOW_S = 60


class SynWatcher:
    def __init__(self):
        self.events: dict[str, deque] = defaultdict(deque)
        self.captured: dict[str, list] = defaultdict(list)
        self.flagged: set[str] = set()

    def feed(self, pkt) -> None:
        if not (pkt.haslayer(TCP) and pkt[TCP].flags & 0x02):
            return
        src = pkt[IP].src if pkt.haslayer(IP) else "?"
        now = time.time()
        dq = self.events[src]
        dq.append(now)
        # Evict events older than the window.
        cutoff = now - WINDOW_S
        while dq and dq[0] < cutoff:
            dq.popleft()
        # Cap captured packet count per source so we don't OOM.
        if len(self.captured[src]) < 200:
            self.captured[src].append(pkt)
        if len(dq) > THRESHOLD_PER_MIN and src not in self.flagged:
            self.flagged.add(src)
            print(f"FLAG {src}: {len(dq)} SYN/min")

    def report(self) -> None:
        if not self.flagged:
            print("no offenders this run.")
            return
        for src in sorted(self.flagged):
            wrpcap(f"flood-{src}.pcap", self.captured[src])
            print(f"  {src}: {len(self.events[src])} hits, "
                  f"saved {len(self.captured[src])} packets to flood-{src}.pcap")


def main():
    watcher = SynWatcher()
    sniffer = AsyncSniffer(
        iface="eth0", filter="tcp port 80",
        prn=watcher.feed, store=False,
    )
    sniffer.start()
    print(f"watching tcp/80 for SYN floods (>{THRESHOLD_PER_MIN}/min)")

    def stop(_sig, _frame):
        sniffer.stop()
    signal.signal(signal.SIGINT, stop)

    try:
        while sniffer.running:
            time.sleep(1)
    finally:
        sniffer.stop()
        watcher.report()


main()

# Decision rule:
#   Need to read packets in Python              -> scapy.sniff / AsyncSniffer.
#   Need to craft / inject                      -> IP()/TCP()/Raw() + send / sr1 / sendp.
#   Need to read existing pcap                  -> rdpcap("file.pcap"); each packet is
#                                                  a normal scapy object.
#   Need to write pcap                          -> wrpcap("out.pcap", packets).
#   Need high packet rates                       -> tcpdump pipe + scapy -> too slow;
#                                                  use libpcap directly or AF_PACKET in C.
#   Need ARP / DHCP / DNS spoofing               -> scapy has helpers (arp_send, etc.) but
#                                                  also handle the ethical/legal review.
#   Need fuzzing                                 -> scapy.fuzz(IP()/TCP()) auto-fuzzes fields.
#   Need TLS visibility                          -> not scapy; mitmproxy, or scapy-ssl_tls.

# Anti-pattern:
#   sniff(prn=callback)              # without store=False
# scapy buffers EVERY packet in RAM until the sniff ends. Long-running
# captures OOM. Always pass store=False unless you actually need the
# packet list.
```

## Decision Rule

```text
Need to read packets in Python              -> scapy.sniff / AsyncSniffer.
Need to craft / inject                      -> IP()/TCP()/Raw() + send / sr1 / sendp.
Need to read existing pcap                  -> rdpcap("file.pcap"); each packet is
                                               a normal scapy object.
Need to write pcap                          -> wrpcap("out.pcap", packets).
Need high packet rates                       -> tcpdump pipe + scapy -> too slow;
                                               use libpcap directly or AF_PACKET in C.
Need ARP / DHCP / DNS spoofing               -> scapy has helpers (arp_send, etc.) but
                                               also handle the ethical/legal review.
Need fuzzing                                 -> scapy.fuzz(IP()/TCP()) auto-fuzzes fields.
Need TLS visibility                          -> not scapy; mitmproxy, or scapy-ssl_tls.
```

## Anti-Pattern

> [!warning] Anti-pattern
>   sniff(prn=callback)              # without store=False
> scapy buffers EVERY packet in RAM until the sniff ends. Long-running
> captures OOM. Always pass store=False unless you actually need the
> packet list.

## Tips

- Always pass `store=False` to long-running `sniff` — otherwise scapy buffers every packet in RAM.
- Use **BPF filters** (`filter="tcp port 80"`) — the kernel discards non-matching packets and saves you 99% of the work.
- `AsyncSniffer().start()` lets the main thread continue and stop the sniff cleanly on SIGINT.
- `sr1(pkt, timeout=)` sends a packet and returns the first reply — the right tool for ping / traceroute / port-scan-style probes.
- Scapy needs **root** or `CAP_NET_RAW` capability — for unprivileged packet inspection, use Wireshark + `tshark` instead.

## Common Mistake

> [!warning] Running `sniff(prn=cb)` without `store=False` for long captures. Scapy keeps every packet in memory; you OOM in minutes on a busy interface.

## See Also

- [[Sections/network-protocols/low-level/_Index|Network Protocols → Packet capture and crafting]]
- [[Sections/network-protocols/_Index|Network Protocols index]]
- [[_Index|Vault index]]
