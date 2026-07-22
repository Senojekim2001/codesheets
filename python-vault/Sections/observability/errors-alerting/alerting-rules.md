---
type: "entry"
domain: "python"
file: "observability"
section: "errors-alerting"
id: "alerting-rules"
title: "SLO-based alerting — multi-window, multi-burn-rate PromQL"
category: "Alerting"
subtitle: "PromQL alerting rule, SLO error budget, burn rate, multi-window (5m AND 1h), recording rules, Alertmanager, runbook annotations, deploy silencing"
signature_short: "ALERT HighErrorBudgetBurn IF (rate(errors[5m])/rate(total[5m]))/(1-SLO) > 14.4 AND ... > 14.4 FOR 2m"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "SLO-based alerting — multi-window, multi-burn-rate PromQL"
  - "alerting-rules"
tags:
  - "python"
  - "python/observability"
  - "python/observability/errors-alerting"
  - "category/alerting"
  - "tier/tiered"
---

# SLO-based alerting — multi-window, multi-burn-rate PromQL

> PromQL alerting rule, SLO error budget, burn rate, multi-window (5m AND 1h), recording rules, Alertmanager, runbook annotations, deploy silencing

## Overview

Naive alerting ("page if error rate > 1% for 5m") fires on every transient blip and undersells genuine outages. SLO-based alerting frames the question correctly: "given a 99.9% availability target, how fast are we burning the monthly error budget? Do we need to page someone now?" The Google SRE workbook pattern uses TWO windows AND TWO burn rates per alert: a fast window (5m) catches sudden outages; a slow window (1h) prevents flapping on brief spikes; the burn rate (multiplier of normal) maps to severity. The three examples solve the SAME concrete task — translate a 99.9% availability SLO into PromQL alerting rules that page only on genuine SLO threats — at three depths: naive threshold rule → single-window error-budget rule → multi-window multi-burn-rate (the SRE workbook pattern) with recording rules, runbook annotations, deploy silencing.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Page when the service errors above a threshold.
- **Junior** — SAME — but tied to a 99.9% SLO and the error budget.
- **Senior** — SAME — full Google SRE workbook multi-window multi-burn-rate alerting, deploy silencing, no-data alert, recording rules keep the alert PromQL one-liners.

## Signature

```python
ALERT HighErrorBudgetBurn IF (rate(errors[5m])/rate(total[5m]))/(1-SLO) > 14.4 AND ... > 14.4 FOR 2m
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Page when the service errors above a threshold.
# APPROACH  - PromQL rule: error rate > 1% over 5m -> alert.
# STRENGTHS - Trivial; matches what most tutorials show.
# WEAKNESSES- Pages on every transient spike; doesn't distinguish a
#             10-second blip from a sustained outage; no relation to
#             a documented SLO.

# alerting.yml — Prometheus or Grafana Mimir alerting rule.
# groups:
#   - name: myapp_basic
#     interval: 30s
#     rules:
#       - alert: HighErrorRate
#         expr: |
#           sum(rate(http_requests_total{status=~"5.."}[5m]))
#           /
#           sum(rate(http_requests_total[5m]))
#           > 0.01
#         for: 5m
#         labels:
#           severity: page
#         annotations:
#           summary: "Error rate above 1% for 5 minutes"

# Problems with this:
#  - 1% is arbitrary — it doesn't connect to "is the SLO at risk?"
#  - A 30-second outage at 100% errors triggers (good) AND a 6-hour
#    1.5% rate triggers (also good but very different urgency).
#  - A 10s spike to 5% errors followed by recovery still pages because
#    rate() over 5m smooths it into > 1% briefly.
#  - No runbook link in the annotation; on-call has to guess.
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but tied to a 99.9% SLO and the error budget.
# APPROACH  - Define the SLO; compute burn rate (rate of error budget
#             consumption); alert when burn rate would exhaust the
#             budget within X hours.
# STRENGTHS- Alert severity scales with how fast the SLO is degrading;
#             one rule replaces a forest of arbitrary thresholds.
# WEAKNESSES- Single window can flap on transient spikes; senior tier
#             adds the dual-window pattern that fixes flapping.
# alerting.yml
#
# # SLO: 99.9% availability over 30 days.
# # Error budget = 1 - 0.999 = 0.1% of requests.
# # If we burn budget at 14.4× normal for 1h, we'll exhaust the
# # 30-day budget in ~2 days -> page immediately.
#
# groups:
#   - name: myapp_slo
#     rules:
#       # Recording rule — keep alert PromQL simple.
#       - record: job:request_error_ratio:rate5m
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[5m]))
#           /
#           sum(rate(http_requests_total{job="myapp"}[5m]))
#
#       - record: job:request_error_ratio:rate1h
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[1h]))
#           /
#           sum(rate(http_requests_total{job="myapp"}[1h]))
#
#       # SLO threshold (1 - 0.999 = 0.001).
#       # Burn rate = current_error_ratio / SLO_budget
#       #   1×    = burning budget at the rate that exactly exhausts it in 30d (fine)
#       #  14.4× = exhausts in 30d/14.4 = ~2 days (PAGE)
#       #
#       - alert: SLOErrorBudgetBurnFast
#         expr: |
#           job:request_error_ratio:rate5m / 0.001 > 14.4
#         for: 2m
#         labels:
#           severity: page
#         annotations:
#           summary: "myapp SLO burn rate >14.4× over 5m — pages"
#           description: "At this rate we'll exhaust the 30d budget in <2 days."
#           runbook_url: "https://runbook.internal/myapp-error-budget"

# Burn rate cheat sheet (from Google SRE workbook):
#   Burn rate | Time to exhaust 30d budget | Severity
#   -------------------------------------------------------------
#   14.4×    | ~2 days                    | PAGE (fast)
#    6×      | ~5 days                    | TICKET (slow page)
#    3×      | ~10 days                   | TICKET
#    1×      | 30 days (by definition)    | none — within budget
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — full Google SRE workbook multi-window multi-burn-rate
#             alerting, deploy silencing, no-data alert, recording rules
#             keep the alert PromQL one-liners.
# APPROACH  - Per severity (page, ticket), require BOTH a fast window
#             and a slow window above the burn rate. Fast window
#             prevents lag; slow window prevents flapping.
# STRENGTHS- The state-of-the-art alerting pattern; rare false positives;
#             rare missed outages; severity correctly proportional to
#             SLO threat.
# WEAKNESSES- More rules to write; but with recording rules you re-use
#             the same window calculations everywhere.
# slo-rules.yml — multi-window multi-burn-rate (MWMBR).
#
# groups:
#   - name: myapp_slo_recording
#     interval: 30s
#     rules:
#       # 5m window
#       - record: job:request_error_ratio:rate5m
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[5m]))
#           / sum(rate(http_requests_total{job="myapp"}[5m]))
#
#       # 30m window
#       - record: job:request_error_ratio:rate30m
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[30m]))
#           / sum(rate(http_requests_total{job="myapp"}[30m]))
#
#       # 1h window
#       - record: job:request_error_ratio:rate1h
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[1h]))
#           / sum(rate(http_requests_total{job="myapp"}[1h]))
#
#       # 6h window
#       - record: job:request_error_ratio:rate6h
#         expr: |
#           sum(rate(http_requests_total{status=~"5..", job="myapp"}[6h]))
#           / sum(rate(http_requests_total{job="myapp"}[6h]))
#
#   - name: myapp_slo_alerts
#     rules:
#       # === PAGE: 14.4× burn for 5m AND 1h windows ===
#       # Catches outages within minutes, won't fire on 30s spikes.
#       - alert: SLOErrorBudgetBurnFast
#         expr: |
#           (job:request_error_ratio:rate5m  / 0.001) > 14.4
#           AND
#           (job:request_error_ratio:rate1h  / 0.001) > 14.4
#         for: 2m
#         labels: { severity: page }
#         annotations:
#           summary: "myapp 14.4× burn — outage in progress"
#           runbook_url: "https://runbook.internal/myapp-slo-fast-burn"
#
#       # === TICKET: 6× burn for 30m AND 6h windows ===
#       # Slow degradation; engineer should look in working hours.
#       - alert: SLOErrorBudgetBurnSlow
#         expr: |
#           (job:request_error_ratio:rate30m / 0.001) > 6
#           AND
#           (job:request_error_ratio:rate6h  / 0.001) > 6
#         for: 15m
#         labels: { severity: ticket }
#         annotations:
#           summary: "myapp 6× burn — sustained degradation"
#           runbook_url: "https://runbook.internal/myapp-slo-slow-burn"
#
#       # === META: missing data ===
#       # If the metric stops being reported, we have NO signal.
#       # Silently failing is the worst alerting mode.
#       - alert: SLOMetricsMissing
#         expr: absent(job:request_error_ratio:rate5m)
#         for: 10m
#         labels: { severity: page }
#         annotations:
#           summary: "myapp metrics not reporting — silent failure"
#
# Deploy silencing — don't page during a known deploy.
# Set in Alertmanager via amtool or API:
#   amtool silence add \
#     matcher='job=myapp' \
#     duration=30m \
#     comment='deploy v1.4.3'
# Or use the Kubernetes Operator's "PrometheusRule.spec.silences" field.
#
# Inhibition rules in Alertmanager — node-down silences pod-down on
# the same node. Prevents alert storms during cluster events.
# inhibit_rules:
#   - source_matchers: [ alertname=NodeDown ]
#     target_matchers: [ alertname=PodDown ]
#     equal: [ node ]

# Decision rule:
#   "page if errors high"             -> SLO-based MWMBR (5m+1h, 30m+6h); not raw thresholds
#   transient spike (30s)             -> won't fire (1h window dampens); intentional
#   sustained outage (30s+)           -> 5m window fires within 2-7 minutes; intentional
#   slow drift                        -> 6× ticket fires after 15+ minutes; tracked, not paged
#   noisy alerts                      -> wider windows; raise burn-rate multiplier
#   missed outages                    -> narrower windows; lower burn-rate multiplier
#   metrics stopped reporting         -> 'absent()' meta-alert; otherwise silent failure
#   deploys cause flap                -> Alertmanager silence for the deploy window
#   N alerts during one cluster event -> inhibition_rules (NodeDown silences PodDown on same node)
#   alert with no runbook              -> rejected; runbook_url is mandatory
#   alert annotation: just "error rate high" -> rewrite — operator needs WHAT/WHY/HOW
#
# Anti-pattern: alerts on per-pod metrics in a Kubernetes cluster.
# When a node fails, every pod on it triggers the same alert; on-call's
# phone explodes; the actual problem (NodeDown) is buried in noise.
# Aggregate at the SERVICE level (sum across pods), alert on that,
# and use inhibition rules so node-level failures silence the pod-level
# noise. Per-pod metrics are still useful for dashboards — just not
# alerts.
```

## Decision Rule

```text
"page if errors high"             -> SLO-based MWMBR (5m+1h, 30m+6h); not raw thresholds
transient spike (30s)             -> won't fire (1h window dampens); intentional
sustained outage (30s+)           -> 5m window fires within 2-7 minutes; intentional
slow drift                        -> 6× ticket fires after 15+ minutes; tracked, not paged
noisy alerts                      -> wider windows; raise burn-rate multiplier
missed outages                    -> narrower windows; lower burn-rate multiplier
metrics stopped reporting         -> 'absent()' meta-alert; otherwise silent failure
deploys cause flap                -> Alertmanager silence for the deploy window
N alerts during one cluster event -> inhibition_rules (NodeDown silences PodDown on same node)
alert with no runbook              -> rejected; runbook_url is mandatory
alert annotation: just "error rate high" -> rewrite — operator needs WHAT/WHY/HOW
```

## Anti-Pattern

> [!warning] Anti-pattern
> alerts on per-pod metrics in a Kubernetes cluster.
> When a node fails, every pod on it triggers the same alert; on-call's
> phone explodes; the actual problem (NodeDown) is buried in noise.
> Aggregate at the SERVICE level (sum across pods), alert on that,
> and use inhibition rules so node-level failures silence the pod-level
> noise. Per-pod metrics are still useful for dashboards — just not
> alerts.

## Tips

- The Google SRE workbook MWMBR pattern is the state of the art: 14.4× burn over 5m AND 1h pages immediately; 6× over 30m AND 6h opens a ticket. Both windows protect against flapping AND missed outages.
- Always define an SLO before writing alerts. "Error rate > 1%" is arbitrary; "burning the 99.9% monthly budget at 14.4×" is grounded. The SLO becomes the design contract.
- Use recording rules (`- record: job:request_error_ratio:rate5m`) to compute the windows once. Alert PromQL becomes one-liners; dashboards reuse the same series.
- Add an `absent()` meta-alert per critical SLO. If metrics stop reporting, your other alerts go silent — exactly when you most need them. The meta-alert catches the silent failure.
- Every alert MUST have a `runbook_url` annotation. On-call at 3am should not have to guess what to do; a 1-page runbook ("verify with curl, restart pod, escalate to X") is enough.
- Use Alertmanager inhibition rules for cluster-level events: `NodeDown` silences `PodDown` on the same node. Without inhibition, one failed node produces 50 redundant pages.

## Common Mistake

> [!warning] Alerting on per-pod metrics in a Kubernetes cluster. When a node fails, every pod on it triggers the same alert simultaneously; on-call's phone explodes; the actual problem (NodeDown) is buried in noise. Aggregate at the SERVICE level for alerts (sum across pods); per-pod is fine for dashboards, never alerts. Pair with Alertmanager inhibition rules so cluster-level failures silence the pod-level noise.

## Shorthand (Junior → Senior)

**Junior:**
```python
# Per-pod alert — one node down = 50 redundant pages
- alert: PodDown
  expr: up{job="myapp"} == 0
  for: 1m
```

**Senior:**
```python
# Service-level + inhibition — one alert per real problem
- alert: ServiceDown
  expr: sum(up{job="myapp"}) == 0
  for: 2m
# Alertmanager: NodeDown inhibits PodDown on same node
```

## See Also

- [[Sections/observability/errors-alerting/_Index|Observability → Error Tracking & Alerting — Sentry, correlation, SLO-based alerts]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]
