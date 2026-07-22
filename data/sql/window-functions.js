export const meta = {
  "id": "window-functions",
  "label": "Window Functions",
  "icon": "🪟",
  "description": "SQL window functions: ROW_NUMBER, RANK, LEAD/LAG, running totals, moving averages, and PARTITION BY patterns."
}

export const sections = [

  // ── Section 1: Ranking Functions ─────────────────────────────────────────
  {
    id: "ranking",
    title: "Ranking Functions",
    entries: [
      {
        id: "rank-functions",
        fn: "RANK, DENSE_RANK, ROW_NUMBER & NTILE",
        desc: "Master all ranking functions: RANK (with gaps), DENSE_RANK (no gaps), ROW_NUMBER (unique), NTILE (buckets).",
        category: "Ranking",
        subtitle: "RANK(), DENSE_RANK(), ROW_NUMBER(), NTILE(n), PARTITION BY",
        signature: "RANK() OVER (ORDER BY col)  |  DENSE_RANK()  |  ROW_NUMBER()  |  NTILE(n)",
        descLong: "Four ranking functions with distinct behaviors. ROW_NUMBER always unique (1,2,3,4). RANK has gaps for ties (1,1,3,4). DENSE_RANK no gaps (1,1,2,3). NTILE(n) divides rows into n equal quantiles. All support PARTITION BY. Choose based on tie-handling: ROW_NUMBER for top-1-per-group, RANK/DENSE_RANK for leaderboards, NTILE for segmentation.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RANK, DENSE_RANK, ROW_NUMBER & NTILE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Comparison: ROW_NUMBER vs RANK vs DENSE_RANK ──\n-- Scores: 100, 100, 90, 80\nSELECT\n    student,\n    score,\n    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,\n    RANK()       OVER (ORDER BY score DESC) AS rank,\n    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank\nFROM exam_results;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RANK, DENSE_RANK, ROW_NUMBER & NTILE — common patterns you'll see in production.\n-- APPROACH  - Combine RANK, DENSE_RANK, ROW_NUMBER & NTILE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- Alice | 100 | 1 | 1 | 1\n-- Bob   | 100 | 2 | 1 | 1 ← Same rank, different row numbers\n-- Carol | 90  | 3 | 3 | 2 ← RANK skips, DENSE_RANK doesn't\n-- Dave  | 80  | 4 | 4 | 3"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RANK, DENSE_RANK, ROW_NUMBER & NTILE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── ROW_NUMBER for top-1-per-group ────────────────,SELECT * FROM (,    SELECT *,,        ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) AS rn,    FROM products,) ranked,WHERE rn = 1;,\n\n-- ── RANK for leaderboards with ties ───────────────,SELECT,    name,,    score,,    RANK() OVER (ORDER BY score DESC) AS position,FROM leaderboard,ORDER BY score DESC;,\n\n-- ── DENSE_RANK for medal count (no gaps) ─────────,SELECT,    name,,    score,,    DENSE_RANK() OVER (ORDER BY score DESC) AS medal_group,FROM athletes;,-- 1st place: 2 athletes,-- 2nd place: 1 athlete (not 3rd),\n\n-- ── NTILE for quartiles/deciles ────────────────────,SELECT,    customer_name,,    annual_spend,,    NTILE(4) OVER (ORDER BY annual_spend DESC) AS spending_quartile,FROM customers;,-- Quartile 1 = top 25% spenders,-- Quartile 4 = bottom 25% spenders"
                  }
        ],
        tips: [
                  "ROW_NUMBER() for top-1-per-group deduplication — most common use case.",
                  "RANK() for leaderboards where ties share same position (Olympic medal counts).",
                  "DENSE_RANK() when you need consecutive rank numbers (1,2,3, no gaps).",
                  "NTILE(n) for customer segmentation: NTILE(10) for deciles, NTILE(100) for percentiles."
        ],
        mistake: "Using RANK() when you need ROW_NUMBER() — RANK() with ties produces gaps (1,1,3), breaking WHERE rn = 1 deduplication.",
        shorthand: {
          verbose: "SELECT *, ROW_NUMBER() OVER (PARTITION BY cat ORDER BY price DESC) AS rn\nFROM products\nWHERE rn = 1;",
          concise: "ROW_NUMBER (unique), RANK (gaps), DENSE_RANK (no gaps), NTILE(n) for quantiles; PARTITION BY + ORDER BY",
        },
      },
      {
        id: "row-number-rank",
        fn: "ROW_NUMBER, RANK & DENSE_RANK",
        desc: "Assign sequential numbers or rankings to rows within partitions — essential for top-N queries, deduplication, and leaderboards.",
        category: "Ranking",
        subtitle: "ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), PARTITION BY",
        signature: "ROW_NUMBER() OVER (PARTITION BY col ORDER BY col)  |  RANK()  |  DENSE_RANK()",
        descLong: "Ranking functions assign numbers to rows based on ordering within optional partitions. ROW_NUMBER() gives unique sequential numbers (1,2,3,4). RANK() gives the same rank to ties and skips (1,1,3,4). DENSE_RANK() gives the same rank to ties without skipping (1,1,2,3). NTILE(n) divides rows into n equal buckets. Use PARTITION BY to restart numbering per group. These are the most commonly used window functions.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROW_NUMBER, RANK & DENSE_RANK — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ROW_NUMBER — unique sequential number per partition\nSELECT\n    department,\n    employee_name,\n    salary,\n    ROW_NUMBER() OVER (\n        PARTITION BY department\n        ORDER BY salary DESC\n    ) AS rank_in_dept\nFROM employees;\n-- Marketing | Alice | 120000 | 1\n-- Marketing | Bob   | 95000  | 2\n-- Sales     | Carol | 110000 | 1\n-- Sales     | Dave  | 105000 | 2"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROW_NUMBER, RANK & DENSE_RANK — common patterns you'll see in production.\n-- APPROACH  - Combine ROW_NUMBER, RANK & DENSE_RANK with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Top-N per group (most common pattern) ───────────\n-- Get the highest-paid employee per department\nSELECT * FROM (\n    SELECT\n        *,\n        ROW_NUMBER() OVER (\n            PARTITION BY department ORDER BY salary DESC\n        ) AS rn\n    FROM employees\n) ranked\nWHERE rn = 1;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROW_NUMBER, RANK & DENSE_RANK — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── RANK vs DENSE_RANK vs ROW_NUMBER ────────────────,-- Scores: 100, 100, 90, 80,-- ROW_NUMBER:  1, 2, 3, 4  (always unique),-- RANK:        1, 1, 3, 4  (ties share rank, skip next),-- DENSE_RANK:  1, 1, 2, 3  (ties share rank, no skip),,SELECT,    student_name,,    score,,    ROW_NUMBER() OVER (ORDER BY score DESC) AS row_num,,    RANK()       OVER (ORDER BY score DESC) AS rank,,    DENSE_RANK() OVER (ORDER BY score DESC) AS dense_rank,FROM exam_results;,\n\n-- ── NTILE — divide into buckets ─────────────────────,-- Split customers into 4 quartiles by spending,SELECT,    customer_name,,    total_spent,,    NTILE(4) OVER (ORDER BY total_spent DESC) AS spending_quartile,FROM customers;,-- Quartile 1 = top 25% spenders, Quartile 4 = bottom 25%,\n\n-- ── Deduplication with ROW_NUMBER ───────────────────,-- Keep only the latest record per user,DELETE FROM user_events,WHERE id IN (,    SELECT id FROM (,        SELECT,            id,,            ROW_NUMBER() OVER (,                PARTITION BY user_id,                ORDER BY created_at DESC,            ) AS rn,        FROM user_events,    ) t,    WHERE rn > 1,);"
                  }
        ],
        tips: [
                  "ROW_NUMBER() for top-N per group is the single most useful window function pattern — memorize it.",
                  "Use RANK() for leaderboards where ties should share position. Use DENSE_RANK() when you need consecutive numbers.",
                  "NTILE(4) creates quartiles, NTILE(10) creates deciles — great for customer segmentation and percentile analysis.",
                  "ROW_NUMBER() with rn = 1 is the standard deduplication pattern — picks one row per partition."
        ],
        mistake: "Using RANK() when you need unique numbers — RANK() produces ties (1,1,3), which breaks top-1-per-group queries. Use ROW_NUMBER() when you need exactly one row per partition.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSELECT * FROM employees ORDER BY department, salary DESC;\n-- Manual: scan all rows, track department changes, count position\n// More explicit but longer",
          concise: "SELECT *, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank\nFROM employees;\n-- Get top-1 per department: WHERE rank = 1",
        },
      },
      {
        id: "lag-lead",
        fn: "LAG & LEAD — Accessing Previous/Next Rows",
        desc: "Compare row to previous/next without self-joins: LAG (look back), LEAD (look forward), with offsets and defaults.",
        category: "Offset",
        subtitle: "LAG(col, offset, default), LEAD(col, offset, default), offset, default",
        signature: "LAG(col, 1, 0) OVER (ORDER BY date)  |  LEAD(col) OVER (ORDER BY date)",
        descLong: "LAG/LEAD access other rows in the window without self-joins. LAG(col, n) looks back n rows (n=1 default). LEAD(col, n) looks forward n rows. Third parameter is default value for edges (NULL by default). Essential for time-series: month-over-month, year-over-year, computing days between events.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LAG & LEAD — Accessing Previous/Next Rows — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── LAG: compare to previous row ──────────────────\nSELECT\n    month,\n    revenue,\n    LAG(revenue) OVER (ORDER BY month) AS prev_month,\n    revenue - LAG(revenue) OVER (ORDER BY month) AS change,\n    ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))\n        / LAG(revenue) OVER (ORDER BY month), 1) AS pct_change\nFROM monthly_revenue;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LAG & LEAD — Accessing Previous/Next Rows — common patterns you'll see in production.\n-- APPROACH  - Combine LAG & LEAD — Accessing Previous/Next Rows with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── LAG with custom offset (year-over-year) ───────\nSELECT\n    month,\n    revenue,\n    LAG(revenue, 12) OVER (ORDER BY month) AS same_month_last_year,\n    revenue - LAG(revenue, 12) OVER (ORDER BY month) AS yoy_change\nFROM monthly_revenue;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LAG & LEAD — Accessing Previous/Next Rows — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── LAG with default value ────────────────────────,SELECT,    purchase_id,,    LAG(purchase_id, 1, 0) OVER (PARTITION BY customer_id ORDER BY date) AS prev_purchase_id,FROM purchases;,\n\n-- ── LEAD: look at next row ─────────────────────────,SELECT,    order_id,,    order_date,,    LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS next_order_date,,    LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) - order_date AS days_to_next,FROM orders;"
                  }
        ],
        tips: [
                  "LAG(col, 1) default — use LAG(col, 12) for year-over-year with monthly data.",
                  "Third parameter is default for edges: LAG(col, 1, 0) returns 0 instead of NULL for first row.",
                  "LEAD with PARTITION BY finds time to next event per group.",
                  "Avoid repeating the same window clause — use named windows (WINDOW w AS (...))."
        ],
        mistake: "Not using default parameter — NULL for first row breaks calculations. Use LAG(col, 1, 0) or COALESCE.",
        shorthand: {
          verbose: "// Manual / verbose approach\nLAG(revenue) OVER (ORDER BY month) AS prev,\nrevenue - LAG(revenue) OVER (ORDER BY month) AS change\n// More explicit but longer",
          concise: "LAG(col, offset, default); LEAD(col, offset); PARTITION BY for per-group; default value for edges",
        },
      },
      {
        id: "first-last-value",
        fn: "FIRST_VALUE, LAST_VALUE & NTH_VALUE",
        desc: "Access first, last, or nth row in window frame: compare to baseline, find extremes within window.",
        category: "Offset",
        subtitle: "FIRST_VALUE(col), LAST_VALUE(col), NTH_VALUE(col, n), frame matters",
        signature: "FIRST_VALUE(col) OVER (ORDER BY col)  |  LAST_VALUE(col) OVER (...ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)",
        descLong: "FIRST_VALUE returns first row in frame (default frame: start to current row). LAST_VALUE returns last in frame (⚠️ needs explicit frame). NTH_VALUE(col, n) returns nth row. Essential for comparing each row to baseline or calculating frame statistics. Frame specification is critical: default frame makes LAST_VALUE useless.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FIRST_VALUE, LAST_VALUE & NTH_VALUE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── FIRST_VALUE: compare to first in partition ──\nSELECT\n    employee_name,\n    salary,\n    FIRST_VALUE(salary) OVER (\n        PARTITION BY department ORDER BY salary ASC\n    ) AS dept_min_salary,\n    salary - FIRST_VALUE(salary) OVER (\n        PARTITION BY department ORDER BY salary ASC\n    ) AS above_minimum\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FIRST_VALUE, LAST_VALUE & NTH_VALUE — common patterns you'll see in production.\n-- APPROACH  - Combine FIRST_VALUE, LAST_VALUE & NTH_VALUE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── LAST_VALUE with explicit frame (critical!) ─────\nSELECT\n    employee_name,\n    salary,\n    LAST_VALUE(salary) OVER (\n        PARTITION BY department\n        ORDER BY salary\n        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\n    ) AS dept_max_salary\nFROM employees;\n-- ⚠️ Default frame (UNBOUNDED PRECEDING to CURRENT) makes LAST_VALUE = current row!"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FIRST_VALUE, LAST_VALUE & NTH_VALUE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── NTH_VALUE: get nth row ────────────────────────,SELECT,    order_id,,    amount,,    NTH_VALUE(amount, 1) OVER (ORDER BY amount DESC) AS highest,,    NTH_VALUE(amount, 2) OVER (ORDER BY amount DESC) AS second_highest,,    NTH_VALUE(amount, 3) OVER (ORDER BY amount DESC) AS third_highest,FROM orders;,\n\n-- ── Compare to first row in year ───────────────────,SELECT,    date,,    price,,    FIRST_VALUE(price) OVER (,        PARTITION BY EXTRACT(YEAR FROM date),        ORDER BY date,    ) AS year_start_price,,    ROUND(100.0 * (price - FIRST_VALUE(price) OVER (,        PARTITION BY EXTRACT(YEAR FROM date),        ORDER BY date,    )) / FIRST_VALUE(price) OVER (,        PARTITION BY EXTRACT(YEAR FROM date),        ORDER BY date,    ), 2) AS pct_change_from_year_start,FROM stock_prices;"
                  }
        ],
        tips: [
                  "FIRST_VALUE works with default frame — no special syntax needed.",
                  "LAST_VALUE MUST specify frame: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.",
                  "Default frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — makes LAST_VALUE = current row.",
                  "Compare to FIRST_VALUE in partition for baseline metrics."
        ],
        mistake: "Using LAST_VALUE without explicit frame — default frame makes it return current row, useless.",
        shorthand: {
          verbose: "// Manual / verbose approach\nFIRST_VALUE(col) OVER (PARTITION BY x ORDER BY y)\nLAST_VALUE(col) OVER (PARTITION BY x ORDER BY y ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)\n// More explicit but longer",
          concise: "FIRST_VALUE; LAST_VALUE (needs explicit frame!); NTH_VALUE(col, n); ROWS BETWEEN ... for frame control",
        },
      },
      {
        id: "lead-lag-old",
        fn: "LEAD, LAG & FIRST_VALUE / LAST_VALUE",
        desc: "Access previous/next rows and first/last values in a partition — for period-over-period comparisons and gap analysis.",
        category: "Offset",
        subtitle: "LAG(), LEAD(), FIRST_VALUE(), LAST_VALUE(), NTH_VALUE()",
        signature: "LAG(col, offset, default) OVER (ORDER BY col)  |  LEAD()  |  FIRST_VALUE()",
        descLong: "Offset functions access values from other rows without self-joins. LAG(col, n) looks back n rows. LEAD(col, n) looks forward n rows. FIRST_VALUE(col) returns the first value in the window frame. LAST_VALUE(col) returns the last (but beware the default frame!). NTH_VALUE(col, n) returns the nth value. These are essential for time-series analysis: month-over-month growth, days between events, comparing to baseline.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of LEAD, LAG & FIRST_VALUE / LAST_VALUE — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── LAG — compare to previous row ────────────────────\n-- Month-over-month revenue change\nSELECT\n    month,\n    revenue,\n    LAG(revenue) OVER (ORDER BY month) AS prev_month,\n    revenue - LAG(revenue) OVER (ORDER BY month) AS change,\n    ROUND(\n        (revenue - LAG(revenue) OVER (ORDER BY month))\n        / LAG(revenue) OVER (ORDER BY month) * 100, 1\n    ) AS pct_change\nFROM monthly_revenue;\n-- Jan | 100000 | NULL   | NULL  | NULL\n-- Feb | 120000 | 100000 | 20000 | 20.0\n-- Mar | 115000 | 120000 | -5000 | -4.2"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of LEAD, LAG & FIRST_VALUE / LAST_VALUE — common patterns you'll see in production.\n-- APPROACH  - Combine LEAD, LAG & FIRST_VALUE / LAST_VALUE with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── LEAD — look at next row ─────────────────────────\n-- Days until next purchase per customer\nSELECT\n    customer_id,\n    purchase_date,\n    LEAD(purchase_date) OVER (\n        PARTITION BY customer_id ORDER BY purchase_date\n    ) AS next_purchase,\n    LEAD(purchase_date) OVER (\n        PARTITION BY customer_id ORDER BY purchase_date\n    ) - purchase_date AS days_between\nFROM purchases;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of LEAD, LAG & FIRST_VALUE / LAST_VALUE — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── LAG with offset and default ─────────────────────,-- Compare to same month last year,SELECT,    month,,    revenue,,    LAG(revenue, 12, 0) OVER (ORDER BY month) AS same_month_last_year,,    revenue - LAG(revenue, 12, 0) OVER (ORDER BY month) AS yoy_change,FROM monthly_revenue;,\n\n-- ── FIRST_VALUE / LAST_VALUE ────────────────────────,-- Compare each employee's salary to department min/max,SELECT,    department,,    employee_name,,    salary,,    FIRST_VALUE(salary) OVER (,        PARTITION BY department ORDER BY salary ASC,    ) AS dept_min_salary,,    FIRST_VALUE(employee_name) OVER (,        PARTITION BY department ORDER BY salary DESC,    ) AS highest_paid_name,,    salary - FIRST_VALUE(salary) OVER (,        PARTITION BY department ORDER BY salary ASC,    ) AS above_minimum,FROM employees;,\n\n-- ⚠️ LAST_VALUE needs explicit frame!,-- Default frame is ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW,-- which means LAST_VALUE = current row (useless!),SELECT,    salary,,    LAST_VALUE(salary) OVER (,        PARTITION BY department,        ORDER BY salary,        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING,    ) AS dept_max_salary,FROM employees;"
                  }
        ],
        tips: [
                  "LAG(col, 1) is the default — it looks back 1 row. Use LAG(col, 12) for year-over-year comparisons with monthly data.",
                  "The third argument to LAG/LEAD is the default value for edges: LAG(revenue, 1, 0) returns 0 instead of NULL for the first row.",
                  "LAST_VALUE requires ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING — the default frame makes it return the current row!",
                  "Named window clauses (WINDOW w AS (...)) let you reuse the same OVER clause — avoids repeating PARTITION BY and ORDER BY."
        ],
        mistake: "Using LAST_VALUE without specifying the frame — the default frame (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) means LAST_VALUE always returns the current row. Always add ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.",
        shorthand: {
          verbose: "SELECT a.month, a.revenue, b.revenue AS prev_month\nFROM monthly_revenue a\nLEFT JOIN monthly_revenue b ON a.month = b.month + INTERVAL '1 month';",
          concise: "SELECT month, revenue,\n  LAG(revenue) OVER (ORDER BY month) AS prev_month,\n  revenue - LAG(revenue) OVER (ORDER BY month) AS change\nFROM monthly_revenue;",
        },
      },
    ],
  },

  // ── Section 2: Aggregate Windows & Frames ─────────────────────────────────────────
  {
    id: "aggregation-windows",
    title: "Aggregate Windows & Frames",
    entries: [
      {
        id: "running-totals",
        fn: "Running Totals, Moving Averages & Cumulative Aggregates",
        desc: "Calculate running sums, moving averages, and cumulative min/max using aggregate functions with window frames.",
        category: "Aggregation",
        subtitle: "SUM() OVER, AVG() OVER, ROWS BETWEEN, running total, moving average",
        signature: "SUM(col) OVER (ORDER BY col ROWS BETWEEN ... AND ...)  |  AVG() OVER (ROWS N PRECEDING)",
        descLong: "Any aggregate function (SUM, AVG, MIN, MAX, COUNT) can be used as a window function with OVER(). Combined with frame clauses (ROWS BETWEEN), they calculate running totals, moving averages, and cumulative stats. The frame defines which rows are included: UNBOUNDED PRECEDING to CURRENT ROW for running totals, N PRECEDING to CURRENT ROW for N-period moving averages. PARTITION BY restarts the calculation per group.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Running Totals, Moving Averages & Cumulative Aggregates — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Running total ────────────────────────────────────\nSELECT\n    order_date,\n    amount,\n    SUM(amount) OVER (\n        ORDER BY order_date\n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS running_total\nFROM orders;\n-- 2024-01-01 | 100 | 100\n-- 2024-01-02 | 250 | 350\n-- 2024-01-03 | 175 | 525"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Running Totals, Moving Averages & Cumulative Aggregates — common patterns you'll see in production.\n-- APPROACH  - Combine Running Totals, Moving Averages & Cumulative Aggregates with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Running total per customer ──────────────────────\nSELECT\n    customer_id,\n    order_date,\n    amount,\n    SUM(amount) OVER (\n        PARTITION BY customer_id\n        ORDER BY order_date\n    ) AS customer_running_total\nFROM orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Running Totals, Moving Averages & Cumulative Aggregates — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── 7-day moving average ────────────────────────────,SELECT,    date,,    daily_revenue,,    AVG(daily_revenue) OVER (,        ORDER BY date,        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW,    ) AS moving_avg_7d,FROM daily_metrics;,\n\n-- ── 30-day moving sum ───────────────────────────────,SELECT,    date,,    signups,,    SUM(signups) OVER (,        ORDER BY date,        ROWS BETWEEN 29 PRECEDING AND CURRENT ROW,    ) AS signups_last_30d,FROM daily_metrics;,\n\n-- ── Cumulative percentage ───────────────────────────,SELECT,    product_name,,    revenue,,    SUM(revenue) OVER (ORDER BY revenue DESC) AS cumulative_rev,,    ROUND(,        SUM(revenue) OVER (ORDER BY revenue DESC) * 100.0,        / SUM(revenue) OVER (), 1,    ) AS cumulative_pct,FROM product_sales,ORDER BY revenue DESC;,-- Widget A | 50000 | 50000  | 33.3%,-- Widget B | 40000 | 90000  | 60.0%,-- Widget C | 30000 | 120000 | 80.0%  ← Pareto: top 3 = 80%,\n\n-- ── Window frame syntax reference ───────────────────,-- ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  (running total),-- ROWS BETWEEN 6 PRECEDING AND CURRENT ROW          (7-period moving),-- ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING   (reverse running),-- ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING           (centered window),-- ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING (whole partition),\n\n-- ── SUM() OVER() with no ORDER BY = grand total ────,SELECT,    department,,    salary,,    SUM(salary) OVER () AS company_total,,    ROUND(salary * 100.0 / SUM(salary) OVER (), 1) AS pct_of_total,,    SUM(salary) OVER (PARTITION BY department) AS dept_total,,    ROUND(salary * 100.0 / SUM(salary) OVER (PARTITION BY department), 1) AS pct_of_dept,FROM employees;"
                  }
        ],
        tips: [
                  "SUM() OVER (ORDER BY date) gives a running total — the default frame is UNBOUNDED PRECEDING to CURRENT ROW.",
                  "SUM() OVER () (no ORDER BY) gives the grand total — use it to calculate percentages in the same query.",
                  "ROWS BETWEEN N PRECEDING AND CURRENT ROW creates an N+1 period moving window — use 6 PRECEDING for 7-day.",
                  "Cumulative percentage (Pareto analysis) combines running SUM with total SUM — identifies the vital few."
        ],
        mistake: "Confusing ROWS and RANGE frames — ROWS counts physical rows, RANGE groups rows with the same ORDER BY value. For moving averages with possible duplicate dates, ROWS is almost always what you want.",
        shorthand: {
          verbose: "SELECT date, daily_revenue,\n  SUM(daily_revenue) OVER (ORDER BY date) AS running_total\nFROM daily_metrics WHERE date >= '2024-01-01';\n-- Default frame: UNBOUNDED PRECEDING to CURRENT ROW",
          concise: "SELECT date, daily_revenue,\n  AVG(daily_revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d\nFROM daily_metrics;",
        },
      },
      {
        id: "percent-rank",
        fn: "PERCENT_RANK, CUME_DIST & Percentile Functions",
        desc: "Calculate percentile rankings, cumulative distributions, and identify outliers with statistical window functions.",
        category: "Statistics",
        subtitle: "PERCENT_RANK(), CUME_DIST(), PERCENTILE_CONT(), PERCENTILE_DISC()",
        signature: "PERCENT_RANK() OVER (ORDER BY col)  |  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col)",
        descLong: "Statistical window functions calculate relative position and percentiles. PERCENT_RANK() returns position as 0-1 (0 = first, 1 = last). CUME_DIST() returns the cumulative distribution (fraction of rows <= current). PERCENTILE_CONT(p) calculates the interpolated percentile (e.g., median = 0.5). PERCENTILE_DISC(p) returns the closest actual value. These are essential for statistical analysis, outlier detection, and performance benchmarking.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of PERCENT_RANK, CUME_DIST & Percentile Functions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── PERCENT_RANK — relative position (0 to 1) ───────\nSELECT\n    employee_name,\n    salary,\n    ROUND(PERCENT_RANK() OVER (ORDER BY salary)::numeric, 3) AS pct_rank\nFROM employees;\n-- Lowest salary  → 0.000\n-- Median salary  → ~0.500\n-- Highest salary → 1.000"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of PERCENT_RANK, CUME_DIST & Percentile Functions — common patterns you'll see in production.\n-- APPROACH  - Combine PERCENT_RANK, CUME_DIST & Percentile Functions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── CUME_DIST — cumulative distribution ─────────────\n-- \"What fraction of employees earn this much or less?\"\nSELECT\n    employee_name,\n    salary,\n    ROUND(CUME_DIST() OVER (ORDER BY salary)::numeric, 3) AS cume_dist\nFROM employees;\n-- 50000 → 0.200  (20% earn ≤ 50k)\n-- 70000 → 0.500  (50% earn ≤ 70k)\n-- 90000 → 0.800  (80% earn ≤ 90k)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of PERCENT_RANK, CUME_DIST & Percentile Functions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Percentiles — median, P90, P95 ─────────────────,-- PERCENTILE_CONT interpolates between values,SELECT,    department,,    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary) AS median_salary,,    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY salary) AS p25_salary,,    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY salary) AS p75_salary,,    PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY salary) AS p90_salary,FROM employees,GROUP BY department;,\n\n-- ── Outlier detection using percentiles ─────────────,WITH stats AS (,    SELECT,        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY response_time) AS q1,,        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY response_time) AS q3,    FROM api_logs,),,bounds AS (,    SELECT,        q1 - 1.5 * (q3 - q1) AS lower_bound,,        q3 + 1.5 * (q3 - q1) AS upper_bound,    FROM stats,),SELECT l.*,FROM api_logs l, bounds b,WHERE l.response_time < b.lower_bound,   OR l.response_time > b.upper_bound;,\n\n-- ── Performance percentiles (P50, P90, P99) ────────,SELECT,    endpoint,,    COUNT(*) AS requests,,    ROUND(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY latency_ms)::numeric) AS p50,,    ROUND(PERCENTILE_CONT(0.90) WITHIN GROUP (ORDER BY latency_ms)::numeric) AS p90,,    ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms)::numeric) AS p95,,    ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY latency_ms)::numeric) AS p99,FROM request_logs,GROUP BY endpoint,ORDER BY p99 DESC;"
                  }
        ],
        tips: [
                  "PERCENTILE_CONT(0.5) is the median — more robust than AVG for skewed distributions (salary, latency, spend).",
                  "P90/P95/P99 latency percentiles are the standard for API performance SLAs — not averages.",
                  "IQR outlier detection (Q1 - 1.5*IQR, Q3 + 1.5*IQR) is a standard statistical method — works in pure SQL.",
                  "PERCENTILE_CONT interpolates; PERCENTILE_DISC returns the nearest actual value — use CONT for continuous data."
        ],
        mistake: "Using AVG for latency/performance metrics — averages hide tail latency. If P50 = 50ms and P99 = 5000ms, the average might look fine (200ms) but 1% of users wait 5 seconds. Always report percentiles.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPERCENT_RANK() OVER (ORDER BY col)\nPERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY col)\n// More explicit but longer",
          concise: "PERCENT_RANK, CUME_DIST; PERCENTILE_CONT/PERCENTILE_DISC; P50/P90/P99 for latency",
        },
      },
    ],
  },

  // ── Section 3: Window Frames & Partitioning Strategies ─────────────────────────────────────────
  {
    id: "framing-partitioning",
    title: "Window Frames & Partitioning Strategies",
    entries: [
      {
        id: "window-frame-rows",
        fn: "ROWS BETWEEN — Frame Specification",
        desc: "Master window frame syntax: ROWS BETWEEN UNBOUNDED PRECEDING to UNBOUNDED FOLLOWING, running totals, moving averages.",
        category: "Frames",
        subtitle: "ROWS BETWEEN, UNBOUNDED PRECEDING, CURRENT ROW, N FOLLOWING",
        signature: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW  |  ROWS BETWEEN N PRECEDING AND N FOLLOWING",
        descLong: "Window frames define which rows are included in aggregation. ROWS counts physical rows. UNBOUNDED PRECEDING is first row. CURRENT ROW is current row. N FOLLOWING is n rows ahead. Default frame (with ORDER BY) is UNBOUNDED PRECEDING to CURRENT ROW — creates running totals. Use UNBOUNDED FOLLOWING for total aggregates.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of ROWS BETWEEN — Frame Specification — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Running total (default frame: UNBOUNDED PRECEDING to CURRENT) ──\nSELECT\n    order_date,\n    amount,\n    SUM(amount) OVER (ORDER BY order_date) AS running_total\nFROM orders;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of ROWS BETWEEN — Frame Specification — common patterns you'll see in production.\n-- APPROACH  - Combine ROWS BETWEEN — Frame Specification with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Explicit running total ──────────────────────────\nSELECT\n    order_date,\n    amount,\n    SUM(amount) OVER (\n        ORDER BY order_date\n        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW\n    ) AS running_total\nFROM orders;"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of ROWS BETWEEN — Frame Specification — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── 7-day moving average ────────────────────────────,SELECT,    date,,    daily_revenue,,    AVG(daily_revenue) OVER (,        ORDER BY date,        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW,    ) AS moving_avg_7d,FROM daily_metrics;,\n\n-- ── Total sum (whole partition) ──────────────────────,SELECT,    salary,,    SUM(salary) OVER (,        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING,    ) AS company_total,FROM employees;,\n\n-- ── Centered window (3 rows before, current, 3 rows after) ──,SELECT,    day,,    revenue,,    AVG(revenue) OVER (,        ORDER BY day,        ROWS BETWEEN 3 PRECEDING AND 3 FOLLOWING,    ) AS smoothed_revenue,FROM daily_metrics;"
                  }
        ],
        tips: [
                  "Default frame with ORDER BY: UNBOUNDED PRECEDING to CURRENT ROW (running totals).",
                  "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW = 7-period moving window (yesterday + today + 5 before).",
                  "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING = whole partition (like GROUP BY).",
                  "N FOLLOWING for reverse-running or centered windows."
        ],
        mistake: "Forgetting ORDER BY — without it, frame is UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING. With ORDER BY, default frame is UNBOUNDED PRECEDING AND CURRENT ROW.",
        shorthand: {
          verbose: "// Manual / verbose approach\nSUM(col) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)\n// More explicit but longer",
          concise: "ROWS BETWEEN N PRECEDING AND M FOLLOWING; default with ORDER BY = running total; N=6 for 7-period moving",
        },
      },
      {
        id: "window-frame-range",
        fn: "RANGE BETWEEN — Value-Based Frames",
        desc: "RANGE mode: group rows by ORDER BY value, frame by value ranges for timestamp windows and peer groups.",
        category: "Frames",
        subtitle: "RANGE BETWEEN, peers, timestamp windows, INTERVAL",
        signature: "RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW",
        descLong: "RANGE (vs ROWS) groups rows with same ORDER BY value as peers, then frames by value ranges. Essential for timestamp windows: \"sum last 7 days\" groups all transactions on same day together. Without RANGE, different ordering produces different results.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of RANGE BETWEEN — Value-Based Frames — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── RANGE vs ROWS: same score = peer ───────────────\n-- ROWS: count physical rows\n-- RANGE: peers (same ORDER BY value) included together\n\nSELECT\n    score,\n    COUNT(*) OVER (\n        ORDER BY score\n        ROWS BETWEEN 1 PRECEDING AND CURRENT ROW\n    ) AS rows_count,\n    COUNT(*) OVER (\n        ORDER BY score\n        RANGE BETWEEN 1 PRECEDING AND CURRENT ROW\n    ) AS range_count\nFROM scores;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of RANGE BETWEEN — Value-Based Frames — common patterns you'll see in production.\n-- APPROACH  - Combine RANGE BETWEEN — Value-Based Frames with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ROWS: 1, 2, 1, 2 (physical rows)\n-- RANGE: 2, 2, 2, 2 (peers grouped: score 100 = 2 peers, etc)"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of RANGE BETWEEN — Value-Based Frames — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── RANGE with INTERVAL (timestamp window) ──────────,SELECT,    date,,    revenue,,    SUM(revenue) OVER (,        ORDER BY date,        RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW,    ) AS revenue_last_7_days,FROM daily_revenue;,\n\n-- ── RANGE: whole partition (ignores ORDER BY distances) ──,SELECT,    employee,,    salary,,    AVG(salary) OVER (,        PARTITION BY department,        ORDER BY salary,        RANGE BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING,    ) AS dept_avg,FROM employees;"
                  }
        ],
        tips: [
                  "RANGE groups peers (same ORDER BY value), ROWS counts physical rows.",
                  "RANGE BETWEEN INTERVAL for time-based windows — intuitive for daily/weekly aggregates.",
                  "With RANGE, order of input doesn't matter — same result regardless of sort order.",
                  "Use RANGE for value ranges, ROWS for fixed-count windows."
        ],
        mistake: "Using ROWS with timestamps expecting value ranges — use RANGE BETWEEN INTERVAL instead.",
        shorthand: {
          verbose: "// Manual / verbose approach\nRANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW\n// More explicit but longer",
          concise: "RANGE groups peers (same ORDER BY value); ROWS counts physical rows; RANGE BETWEEN INTERVAL for timestamps",
        },
      },
      {
        id: "window-frame-groups",
        fn: "GROUPS BETWEEN — Peer-Group Framing",
        desc: "GROUPS mode: frame by peer groups rather than rows or value ranges (SQL:2011 standard).",
        category: "Frames",
        subtitle: "GROUPS BETWEEN, peer groups, GROUP BY peers, TIES",
        signature: "GROUPS BETWEEN 1 PRECEDING AND CURRENT GROUP",
        descLong: "GROUPS (SQL:2011 standard) frames by peer groups. Rows with same ORDER BY value are one group. GROUPS BETWEEN n PRECEDING AND CURRENT GROUP includes n peer groups. Cleaner than RANGE for many scenarios.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of GROUPS BETWEEN — Peer-Group Framing — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── GROUPS framing ────────────────────────────────\nSELECT\n    score,\n    COUNT(*) OVER (\n        ORDER BY score\n        GROUPS BETWEEN 1 PRECEDING AND CURRENT GROUP\n    ) AS peer_group_count\nFROM exam_results;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of GROUPS BETWEEN — Peer-Group Framing — common patterns you'll see in production.\n-- APPROACH  - Combine GROUPS BETWEEN — Peer-Group Framing with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Aggregation by peer groups ──────────────────────\nSELECT\n    salary,\n    COUNT(*) AS employees_at_salary,\n    SUM(salary) OVER ("
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of GROUPS BETWEEN — Peer-Group Framing — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nPARTITION BY department\n        ORDER BY salary\n        GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT GROUP\n    ) AS running_total_by_group\nFROM employees;"
                  }
        ],
        tips: [
                  "GROUPS BETWEEN 1 PRECEDING AND CURRENT GROUP = current peer group + previous peer group.",
                  "Cleaner than RANGE for non-timestamp data.",
                  "Use GROUPS when ORDER BY has ties — peer groups handle duplicates naturally.",
                  "GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT GROUP = running total by peer group."
        ],
        mistake: "Confusing GROUPS with RANGE — GROUPS for peer groups, RANGE for value ranges.",
        shorthand: {
          verbose: "// Manual / verbose approach\nGROUPS BETWEEN 1 PRECEDING AND CURRENT GROUP\n// More explicit but longer",
          concise: "GROUPS frames by peer groups; BETWEEN n PRECEDING AND CURRENT GROUP",
        },
      },
      {
        id: "named-window",
        fn: "Named Windows — Reusing Window Definitions",
        desc: "Define windows once, reuse: reduces duplication and improves readability.",
        category: "Windows",
        subtitle: "WINDOW w AS (...), reuse in multiple functions",
        signature: "WINDOW w AS (PARTITION BY a ORDER BY b)  |  func() OVER w",
        descLong: "Named WINDOW clauses define a window once and reference it multiple times. Reduces repetition and makes queries more readable.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Named Windows — Reusing Window Definitions — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Define window once, use many times ────────────\nSELECT\n    employee,\n    salary,\n    RANK() OVER w AS rank,\n    DENSE_RANK() OVER w AS dense_rank,\n    ROW_NUMBER() OVER w AS row_number,\n    AVG(salary) OVER w AS dept_avg\nFROM employees\nWINDOW w AS (PARTITION BY department ORDER BY salary DESC);"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Named Windows — Reusing Window Definitions — common patterns you'll see in production.\n-- APPROACH  - Combine Named Windows — Reusing Window Definitions with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Extend named window ────────────────────────────\nSELECT\n    date,\n    revenue,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Named Windows — Reusing Window Definitions — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSUM(revenue) OVER w AS running_total,\n    AVG(revenue) OVER (w ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7d\nFROM daily_metrics\nWINDOW w AS (ORDER BY date);"
                  }
        ],
        tips: [
                  "Named WINDOW avoids repeating PARTITION BY and ORDER BY clauses.",
                  "Can extend named window: OVER (w ROWS BETWEEN ...).",
                  "Multiple named windows: WINDOW w1 AS (...), w2 AS (w1 PARTITION BY ...).",
                  "Named windows improve query readability and maintainability for complex analytics."
        ],
        mistake: "Writing same PARTITION BY ORDER BY multiple times — use WINDOW clause.",
        shorthand: {
          verbose: "// Manual / verbose approach\nWINDOW w AS (PARTITION BY a ORDER BY b);\nSELECT ... OVER w, ... OVER w\n// More explicit but longer",
          concise: "WINDOW w AS (...); func() OVER w; reuse same window definition",
        },
      },
      {
        id: "window-filter",
        fn: "FILTER Clause — Conditional Window Aggregates",
        desc: "Aggregate conditionally within window: COUNT(*) FILTER (WHERE ...) without subqueries.",
        category: "Aggregation",
        subtitle: "agg_func() FILTER (WHERE condition) OVER (...)",
        signature: "COUNT(*) FILTER (WHERE amount > 100) OVER (ORDER BY date)",
        descLong: "FILTER (WHERE ...) applies a condition before aggregation in window functions. Avoids subqueries for conditional metrics.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of FILTER Clause — Conditional Window Aggregates — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Conditional aggregation ──────────────────────\nSELECT\n    order_date,"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of FILTER Clause — Conditional Window Aggregates — common patterns you'll see in production.\n-- APPROACH  - Combine FILTER Clause — Conditional Window Aggregates with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\namount,\n    COUNT(*) OVER (ORDER BY order_date) AS total_orders,\n    COUNT(*) FILTER (WHERE amount > 100) OVER (ORDER BY order_date) AS large_orders,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of FILTER Clause — Conditional Window Aggregates — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nSUM(amount) FILTER (WHERE amount > 100) OVER (ORDER BY order_date) AS large_order_total\nFROM orders;"
                  }
        ],
        tips: [
                  "FILTER applies before aggregation — cleaner than CASE WHEN.",
                  "FILTER is PostgreSQL/SQL standard — not supported in MySQL or SQL Server (use CASE WHEN instead).",
                  "Multiple FILTER conditions: COUNT(*) FILTER (WHERE x) FILTER (WHERE y) is invalid — combine in one WHERE."
        ],
        mistake: "Common mistake with FILTER Clause — Conditional Window Aggregates: not reading the documentation carefully. Always test with edge cases like NULL values, empty strings, and boundary conditions.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCOUNT(*) FILTER (WHERE amount > 100) OVER (...)\n// More explicit but longer",
          concise: "agg() FILTER (WHERE condition) OVER (...)",
        },
      },
      {
        id: "window-partition",
        fn: "Multi-Level Partitioning — Multiple Partition Columns",
        desc: "PARTITION BY multiple columns: hierarchical grouping and complex analytics.",
        category: "Partitioning",
        subtitle: "PARTITION BY col1, col2, multiple levels",
        signature: "PARTITION BY department, team ORDER BY salary",
        descLong: "PARTITION BY can include multiple columns for hierarchical grouping. Window resets at each unique combination.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Multi-Level Partitioning — Multiple Partition Columns — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── Multi-level partitioning ──────────────────────\nSELECT\n    department,\n    team,"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Multi-Level Partitioning — Multiple Partition Columns — common patterns you'll see in production.\n-- APPROACH  - Combine Multi-Level Partitioning — Multiple Partition Columns with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\nemployee,\n    salary,\n    ROW_NUMBER() OVER (PARTITION BY department, team ORDER BY salary DESC) AS rank_in_team,\n    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept,"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Multi-Level Partitioning — Multiple Partition Columns — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\nROW_NUMBER() OVER (ORDER BY salary DESC) AS rank_company\nFROM employees;"
                  }
        ],
        tips: [
                  "PARTITION BY dept, team, role creates 3-level grouping.",
                  "Order of PARTITION BY columns matters — leftmost is the outermost grouping.",
                  "Use multiple PARTITION BYs in same query for different granularity levels (row-level + dept-level)."
        ],
        mistake: "Common mistake with Multi-Level Partitioning — Multiple Partition Columns: not reading the documentation carefully. Always test with edge cases like NULL values, empty strings, and boundary conditions.",
        shorthand: {
          verbose: "// Manual / verbose approach\nPARTITION BY a, b, c ORDER BY d\n// More explicit but longer",
          concise: "PARTITION BY col1, col2, ... for hierarchical grouping",
        },
      },
      {
        id: "window-vs-group",
        fn: "Window Functions vs GROUP BY — When to Use Each",
        desc: "Understanding the difference: GROUP BY reduces rows, window functions keep all rows.",
        category: "Concepts",
        subtitle: "GROUP BY aggregates, window functions annotate, combining both",
        signature: "GROUP BY for aggregation  |  window functions to keep all rows  |  combine in subquery",
        descLong: "GROUP BY reduces result set to groups. Window functions keep all original rows, adding aggregate columns. Can combine: GROUP BY in subquery, window functions in outer query.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Window Functions vs GROUP BY — When to Use Each — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── GROUP BY: reduces rows ─────────────────────────\nSELECT department, COUNT(*) AS emp_count, AVG(salary) AS avg_salary\nFROM employees\nGROUP BY department;\n-- Result: 1 row per department"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Window Functions vs GROUP BY — When to Use Each — common patterns you'll see in production.\n-- APPROACH  - Combine Window Functions vs GROUP BY — When to Use Each with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Window functions: keeps all rows ────────────────\nSELECT\n    employee,\n    salary,\n    COUNT(*) OVER (PARTITION BY department) AS dept_emp_count,\n    AVG(salary) OVER (PARTITION BY department) AS dept_avg_salary\nFROM employees;\n-- Result: all employee rows with department aggregates"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Window Functions vs GROUP BY — When to Use Each — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Combine: GROUP BY then window ──────────────────,WITH dept_stats AS (,    SELECT department, COUNT(*) AS count, AVG(salary) AS avg_sal,    FROM employees,    GROUP BY department,),SELECT,    d.department,,    d.count,,    d.avg_sal,,    ROW_NUMBER() OVER (ORDER BY d.avg_sal DESC) AS rank_by_avg_salary,FROM dept_stats d;"
                  }
        ],
        tips: [
                  "GROUP BY reduces rows, window functions don't.",
                  "Use window functions when you want per-row annotations.",
                  "Can combine: GROUP BY in CTE, window functions in outer SELECT."
        ],
        mistake: "Common mistake with Window Functions vs GROUP BY — When to Use Each: not reading the documentation carefully. Always test with edge cases like NULL values, empty strings, and boundary conditions.",
        shorthand: {
          verbose: "// Manual / verbose approach\nGROUP BY aggregates; window functions annotate; combine in subquery\n// More explicit but longer",
          concise: "GROUP BY for aggregation, OVER for per-row annotation; combine both in subqueries",
        },
      },
      {
        id: "window-performance",
        fn: "Window Function Performance — Optimization",
        desc: "Optimize window queries: indexes on ORDER BY columns, execution plans, partition size.",
        category: "Performance",
        subtitle: "index on ORDER BY, EXPLAIN ANALYZE, partition considerations",
        signature: "CREATE INDEX ON (col) for window ORDER BY  |  EXPLAIN window query",
        descLong: "Window function performance depends on partition/order column indexes. EXPLAIN shows if sorts are necessary. Watch for large partitions. Generally fast because they operate within sorted data.",
        examples: [
                  {
                            "tier": "intro",
                            "code": "-- === ENTRY-LEVEL EXAMPLE ===\n-- TASK      - Basic usage of Window Function Performance — Optimization — understand the core syntax and behavior.\n-- APPROACH  - Simple example with minimal clauses; no edge cases.\n-- STRENGTHS - Clear, readable; shows the fundamental pattern.\n-- WEAKNESSES- Not production-ready; no optimization or complex scenarios.\n-- ── EXPLAIN: check window performance ────────────\nEXPLAIN (ANALYZE, BUFFERS)\nSELECT\n    employee,\n    salary,\n    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS rank\nFROM employees;"
                  },
                  {
                            "tier": "junior",
                            "code": "-- === JUNIOR EXAMPLE ===\n-- TASK      - Real-world usage of Window Function Performance — Optimization — common patterns you'll see in production.\n-- APPROACH  - Combine Window Function Performance — Optimization with related clauses; handle common edge cases.\n-- STRENGTHS - Practical; covers the 80% use cases encountered on the job.\n-- WEAKNESSES- May need optimization for large datasets or complex joins.\n-- ── Index for window ORDER BY ──────────────────────\nCREATE INDEX idx_emp_dept_sal ON employees (department, salary DESC);"
                  },
                  {
                            "tier": "senior",
                            "code": "-- === SENIOR EXAMPLE ===\n-- TASK      - Advanced usage of Window Function Performance — Optimization — performance, edge cases, and expert patterns.\n-- APPROACH  - Production-grade patterns; optimization; handling complex scenarios.\n-- STRENGTHS - Complete; handles edge cases, performance, and maintainability.\n-- WEAKNESSES- Complex; requires deep SQL knowledge to understand and maintain.\n-- ── Sort required? Check EXPLAIN ───────────────────,-- If EXPLAIN shows \"Sort\", add the appropriate index"
                  }
        ],
        tips: [
                  "Window functions need index on (PARTITION BY cols, ORDER BY cols).",
                  "Large partitions need sorting — watch for full table scans in EXPLAIN.",
                  "Window Aggregate mode (PostgreSQL) can be faster than Window Sort for pre-sorted data.",
                  "Avoid unnecessary PARTITION BY — removing it enables single-pass streaming aggregation."
        ],
        mistake: "Common mistake with Window Function Performance — Optimization: not reading the documentation carefully. Always test with edge cases like NULL values, empty strings, and boundary conditions.",
        shorthand: {
          verbose: "// Manual / verbose approach\nCREATE INDEX ON (partition_col, order_col);\nEXPLAIN window_query;\n// More explicit but longer",
          concise: "Index on ORDER BY cols; EXPLAIN to check for sorts; watch partition size",
        },
      },
    ],
  },
]

export default { meta, sections }
