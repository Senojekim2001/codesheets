---
type: "entry"
domain: "python"
file: "observability"
section: "metrics"
id: "metric-cardinality"
title: "Cardinality discipline — design metrics that don't explode"
category: "Metrics"
subtitle: "cardinality budget, label whitelist, bucketing, top-N + other, relabel rules, prometheus storage cost, View attribute_keys, runbook"
signature_short: "BAD: requests.labels(user_id=42).inc()    GOOD: requests.labels(tenant_band=band(user_id)).inc()"
has_decision_rule: true
has_anti_pattern: true
tier_count: 3
aliases:
  - "Cardinality discipline — design metrics that don't explode"
  - "metric-cardinality"
tags:
  - "python"
  - "python/observability"
  - "python/observability/metrics"
  - "category/metrics"
  - "tier/tiered"
---

# Cardinality discipline — design metrics that don't explode

> cardinality budget, label whitelist, bucketing, top-N + other, relabel rules, prometheus storage cost, View attribute_keys, runbook

## Overview

Every unique combination of label values creates a new time-series. A Counter with `route` (50 values) × `method` (5) × `status` (10) is 2,500 series — fine. Add `user_id` (1M users) and you have 2.5 BILLION series; your TSDB falls over before lunch. The discipline is: pick label values whose CARDINALITY is bounded and known. Continuous values (latency, sizes) become Histogram buckets. High-cardinality identifiers become buckets ("small/medium/large") or "top-N + other". The runbook for "we accidentally added user_id" matters; relabel rules drop the damage server-side. The three examples solve the SAME concrete task — design metrics for a service such that the time-series count stays under a budget — at three depths: identify the explosion before it happens → cardinality budget calculation + bucketing strategies → production patterns: relabel rules, runbook, View whitelisting in OTel, the cost-per-series math.

## Task

All tiers below solve the SAME concrete task at increasing depth — the differences are sophistication, not subject:

- **Intro** — Design metrics for a service such that the time-series count stays bounded; recognize a cardinality explosion before it ships.
- **Junior** — SAME — but with a calculated cardinality budget per metric, top-N + "other" pattern for medium-cardinality dimensions, and SDK-level whitelisting in OpenTelemetry.
- **Senior** — SAME — production: scrape-time relabel rules drop runaway labels server-side, runbook for "we shipped a metric with user_id", cost analysis showing the dollar impact of a cardinality decision.

## Signature

```python
BAD: requests.labels(user_id=42).inc()    GOOD: requests.labels(tenant_band=band(user_id)).inc()
```

## Example — Intro (Entry-Level)

```python
# === ENTRY-LEVEL EXAMPLE ===
# TASK      - Design metrics for a service such that the time-series
#             count stays bounded; recognize a cardinality explosion
#             before it ships.
# APPROACH  - For each label, ask: how many distinct values can it have?
#             Bounded (route, method, status) -> safe. Unbounded
#             (user_id, request_id, full URL path) -> never label.
# STRENGTHS - The math is simple: multiply distinct values per label.
#             You'll catch most explosions at PR review.
# WEAKNESSES- Can't catch every problem statically — see senior tier
#             for runtime guards and post-hoc cleanup.
from prometheus_client import Counter, Histogram

# GOOD: bounded labels.
requests = Counter(
    "http_requests_total", "...",
    labelnames=["route", "method", "status"],         # 50 × 5 × 10 = 2500 series max
)

# BAD: unbounded labels.
# user_actions = Counter("user_actions_total", "...", labelnames=["user_id"])
# 1M users -> 1M series; TSDB OOMs.

# BAD: full URL path as label (raw paths include query strings, IDs).
# requests = Counter("...", labelnames=["url"])
# /widgets/1, /widgets/2, ... -> series per URL.
# Use the route TEMPLATE: "/widgets/{id}".

# BAD: continuous values (latency, file size) as labels.
# latency = Counter("...", labelnames=["latency_ms"])
# Series per microsecond.
# Use a Histogram with buckets:
LATENCY = Histogram(
    "http_request_duration_seconds", "...",
    labelnames=["route", "method"],                   # bounded
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 5.0),
)

# Quick mental math when adding a new label:
#   total_series = product(distinct_values for each label) × number_of_metrics
#   Budget per service: ~10k-50k series at most vendors.
#   If your math returns >10k, ABORT and bucket the label.

# Bucket high-cardinality identifiers into bands.
def amount_band(amount_cents: int) -> str:
    if amount_cents < 1_000:  return "small"          # <$10
    if amount_cents < 10_000: return "medium"         # <$100
    if amount_cents < 100_000: return "large"         # <$1000
    return "huge"

orders = Counter("orders_placed_total", "...", labelnames=["amount_band"])  # 4 series, total
orders.labels(amount_band=amount_band(amount=2499)).inc()
```

## Example — Junior (Intermediate)

```python
# === JUNIOR EXAMPLE ===
# TASK      - SAME — but with a calculated cardinality budget per
#             metric, top-N + "other" pattern for medium-cardinality
#             dimensions, and SDK-level whitelisting in OpenTelemetry.
# APPROACH  - Document the budget per metric in the code; pre-compute
#             the top-N labels at startup and bucket the rest as "other";
#             OTel View.attribute_keys whitelists the dimensions you allow.
# STRENGTHS - Caps cardinality even if a new endpoint code accidentally
#             adds an unbounded value; the "other" bucket preserves
#             aggregate signal without per-rare-value series.
# WEAKNESSES- Top-N must be re-computed when traffic shifts; "other"
#             aggregates lose detail (intentionally).
import os
from prometheus_client import Counter

# 1) Document the budget. Reviewers can verify by inspection.
ORDER_BUDGET = {
    # label name : approx distinct values
    "tenant":        100,                              # we have ~100 tenants
    "product_band":  4,                                # small/med/large/huge
    "currency":      10,                               # ISO-4217 we accept
    "status":        5,                                # ok/error/refunded/...
}
# Total series upper bound: 100 × 4 × 10 × 5 = 20,000.
# (At ~$0.0001/series/month at most vendors, $2/mo for this metric.)

orders = Counter(
    "orders_placed_total",
    "Orders placed by tenant, band, currency, status",
    labelnames=list(ORDER_BUDGET),
)

# 2) Top-N pattern: keep most-active labels distinct; bucket rare ones.
TOP_N_TENANTS: set[str] = set()                        # populated at startup

def init_top_tenants(top_list: list[str]) -> None:
    """Call once at startup with the top-N tenants by traffic."""
    TOP_N_TENANTS.update(top_list[:20])                # cap at 20 labels

def safe_tenant(tid: str) -> str:
    return tid if tid in TOP_N_TENANTS else "other"

orders.labels(
    tenant=safe_tenant("acme"),
    product_band="medium",
    currency="USD",
    status="ok",
).inc()

# 3) OTel View whitelisting — drop attributes that aren't on the budget.
from opentelemetry.sdk.metrics.view import View

views = [
    View(
        instrument_name="orders.placed",
        attribute_keys={"tenant", "product_band", "currency", "status"},
        # ANY attribute not in this set is DROPPED at the SDK level,
        # before export. So even if a careless caller adds .add(1, {"user_id": 42}),
        # user_id never reaches the backend.
    ),
]

# 4) Quick sanity check at the metrics endpoint — count series per metric.
def cardinality_audit(registry) -> dict[str, int]:
    """Returns {metric_name: series_count}. Call from a debug endpoint."""
    counts: dict[str, int] = {}
    for metric in registry.collect():
        counts[metric.name] = sum(1 for _ in metric.samples)
    return counts

# Alert in dashboards if any metric crosses 10× its budget — early warning.
```

## Example — Senior (Production)

```python
# === SENIOR EXAMPLE ===
# TASK      - SAME — production: scrape-time relabel rules drop runaway
#             labels server-side, runbook for "we shipped a metric
#             with user_id", cost analysis showing the dollar impact
#             of a cardinality decision.
# APPROACH  - Prometheus relabel_config drops a dimension before it hits
#             storage; OTel View can be hot-swapped via env var; document
#             the 1-page runbook in the code; Grafana alert on series
#             count growth rate.
# STRENGTHS - Damage is contained server-side even when the application
#             has the bug; cost is measurable; recovery is documented.
# WEAKNESSES- Relabel rules must be deployed before they help; a metric
#             explosion mid-deploy costs $$$ until the relabel takes effect.
# 1) Prometheus scrape config — drop a runaway dimension server-side.
#    Save the day when an app deploy ships a metric with user_id.
#
# prometheus.yml (excerpt):
# scrape_configs:
#   - job_name: 'myapp'
#     static_configs: [{ targets: ['myapp:9090'] }]
#     metric_relabel_configs:
#       # Drop user_id from every metric — applies before storage.
#       - regex: 'user_id'
#         action: labeldrop
#       # Or drop entire metrics that exceed a known cardinality.
#       - source_labels: [__name__]
#         regex: 'http_request_path_total'   # accidentally raw-path metric
#         action: drop
#
# After deploying the relabel, the explosion stops growing. Run
# Prometheus's tsdb tool to delete the existing series:
#   $ promtool tsdb create-blocks-from-rules ...
#   $ promtool tsdb dump --match='{__name__="http_request_path_total"}'

# 2) OTel — hot-swap via env-var-driven attribute_keys.
import os
from opentelemetry.sdk.metrics.view import View

ALLOWED = set(os.environ.get(
    "METRICS_ATTRIBUTE_WHITELIST",
    "http.method,http.route,http.status_code,tenant,status",
).split(","))

views = [
    View(instrument_name="*", attribute_keys=ALLOWED),
    # Wildcard view applies the whitelist to every instrument.
    # Specific views can override per metric.
]

# 3) Cost math — back-of-envelope, sanity-check before any new label.
def estimate_series_cost(*,
                         existing_metrics: int = 50,
                         labels_per_metric: int = 4,
                         distinct_per_label: int = 10,
                         dollars_per_series_per_month: float = 0.0001) -> float:
    """Most vendors charge ~$0.0001-$0.001 per series per month."""
    series_per_metric = distinct_per_label ** labels_per_metric
    total = existing_metrics * series_per_metric
    return total * dollars_per_series_per_month

# Adding user_id (1M values) to a single 4-label metric:
#   10^4 × 1M = 10 billion series for ONE metric
#   10B × $0.0001 = $1M/month at typical SaaS rates
# This is why the answer to "can we add user_id?" is always no.

# 4) Runbook — paste this comment into your repo's docs/runbook.
# RUNBOOK: METRIC CARDINALITY EXPLOSION
# Symptom: Prometheus OOMs, vendor bill alert, scrape duration > 30s.
# Detection:
#   - Grafana panel: prometheus_tsdb_head_series_created_total over 1d
#   - rate(prometheus_tsdb_head_series_created_total[5m]) > 1000
# Triage (in order):
#   1. Identify the metric: check 'topk(10, count by (__name__)({__name__=~".+"}))'
#   2. Identify the runaway label: 'topk(10, count by (LABEL)({__name__="..."}))'
#   3. Patch with metric_relabel_configs labeldrop in scrape config; reload Prom.
#   4. Delete existing series: promtool tsdb delete-series ... (or wait for retention).
#   5. File the actual application fix as a separate PR.
# Recovery time: relabel takes effect on next scrape (~1 min); existing
# series age out at retention period (default 15d).

# 5) CI guard — fail PR if a new label is added to a metric without
#    a /* CARDINALITY: <math> */ comment justifying it. Implement as a
#    flake8/ruff rule or a custom AST checker.
def fail_if_new_label_unjustified(diff: str) -> None:
    """Pseudo-code for a CI check; real impl uses ast or libcst."""
    ...

# Decision rule:
#   adding a label                          -> compute distinct_values × other_labels; if >10k, abort
#   high-card identifier (user_id)          -> bucket into bands; OR top-N + "other"
#   continuous value (latency)              -> Histogram bucket; never raw-value Counter
#   route/path label                        -> use the TEMPLATE ("/widgets/{id}"), not raw path
#   cardinality of new feature unknown      -> simulate; compute series count from feature scale
#   shipped a runaway label                 -> relabel_config labeldrop in Prometheus; OTel View whitelist
#   prometheus_tsdb_head_series_created    > 1000/min trend     -> ALERT; explosion in progress
#   new metric proposal in PR               -> require /* CARDINALITY: count_math */ comment
#   need per-user analytics                 -> use logs/traces, NOT metrics; metrics aggregate
#   per-tenant required by SLA              -> bound to top-N tenants + "other"; reject unbounded
#
# Anti-pattern: adding metrics for "we'll figure out queries later".
# Cardinality is paid up-front (every label combo creates storage), but
# the value is realized later (when someone queries it). Defer-decision
# leads to "labels we never queried" creating millions of series. Audit
# your existing metrics quarterly; drop labels that aren't in any
# alert, dashboard, or query — they're pure cost.
```

## Decision Rule

```text
adding a label                          -> compute distinct_values × other_labels; if >10k, abort
high-card identifier (user_id)          -> bucket into bands; OR top-N + "other"
continuous value (latency)              -> Histogram bucket; never raw-value Counter
route/path label                        -> use the TEMPLATE ("/widgets/{id}"), not raw path
cardinality of new feature unknown      -> simulate; compute series count from feature scale
shipped a runaway label                 -> relabel_config labeldrop in Prometheus; OTel View whitelist
prometheus_tsdb_head_series_created    > 1000/min trend     -> ALERT; explosion in progress
new metric proposal in PR               -> require /* CARDINALITY: count_math */ comment
need per-user analytics                 -> use logs/traces, NOT metrics; metrics aggregate
per-tenant required by SLA              -> bound to top-N tenants + "other"; reject unbounded
```

## Anti-Pattern

> [!warning] Anti-pattern
> adding metrics for "we'll figure out queries later".
> Cardinality is paid up-front (every label combo creates storage), but
> the value is realized later (when someone queries it). Defer-decision
> leads to "labels we never queried" creating millions of series. Audit
> your existing metrics quarterly; drop labels that aren't in any
> alert, dashboard, or query — they're pure cost.

## Tips

- Cardinality math is multiplicative. A metric with 4 labels of 10 distinct values each is 10⁴ = 10,000 series. Add a 5th label of 100 values: 10⁵ × 100 = 10M series — usually a budget violation.
- Use the route TEMPLATE for HTTP labels, never the raw path. Frameworks expose this: FastAPI `request.scope["route"].path`, Flask `request.url_rule.rule`, Django `resolver_match.route`.
- For high-cardinality identifiers (user_id, request_id, tenant_id), bucket into bands ("small/medium/large") OR keep the top-N values and bucket the rest as "other". Never expose the raw identifier as a label.
- For continuous values (latency, response size), use a Histogram with explicit buckets. A Counter labelled by latency_ms creates one series per microsecond.
- Set up `prometheus_tsdb_head_series_created_total` rate alerting in Grafana. When new-series creation rate jumps from baseline to >1000/min, you have ~1 hour before storage problems start. Catch it early.
- Audit existing metrics quarterly. Run `count by (__name__)({__name__=~".+"})` and drop the labels nobody queries. Dead metrics still cost storage.

## Common Mistake

> [!warning] Adding metrics for "we'll figure out queries later". Cardinality is paid up-front (every label combo creates storage), but value is realized only when someone queries. Defer-decision leads to "labels we never queried" creating millions of series at real $$$ cost. Audit metrics quarterly; drop labels not used in any alert, dashboard, or query.

## Shorthand (Junior → Senior)

**Junior:**
```python
# user_id label — 1M users × 4 other labels = 10B series
requests = Counter("requests_total", labelnames=["user_id", "route", "method", "status"])
requests.labels(user_id=42, ...).inc()
```

**Senior:**
```python
# Bucket the high-cardinality dim; <= 10k series total
requests = Counter("requests_total", labelnames=["tenant_band", "route", "method", "status"])
requests.labels(tenant_band=band_for(user_id), ...).inc()
```

## See Also

- [[Sections/observability/metrics/prometheus-client|prometheus_client — Counter / Histogram / Gauge for Prometheus (Observability)]]
- [[Sections/observability/metrics/otel-metrics|OpenTelemetry metrics — unified pipeline with traces (Observability)]]
- [[Sections/observability/metrics/_Index|Observability → Metrics — Prometheus, OpenTelemetry, cardinality discipline]]
- [[Sections/observability/_Index|Observability index]]
- [[_Index|Vault index]]
